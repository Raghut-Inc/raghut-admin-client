import { useEffect, useState } from 'react';

export default function AdminDevices({ wsMessages }) {
    const [devices, setDevices] = useState([]);
    const [resetStatus, setResetStatus] = useState({});
    const [sessionOrders, setSessionOrders] = useState({});

    useEffect(() => {
        fetch(`${process.env.REACT_APP_API_URL}/devices`)
            .then(res => res.json())
            .then(data => {
                if (data.devices) {
                    setDevices(data.devices);
                } else {
                    throw new Error('No devices field in response');
                }
            })
            .catch(err => {
                console.warn('❌ Failed to load devices.');
                setDevices([]);
            });
    }, []);

    useEffect(() => {
        devices.forEach((device) => {
            if (device.mac && device.tableSessionId) {
                fetch(`${process.env.REACT_APP_API_URL}/orders?tableSessionId=${device.tableSessionId}`)
                    .then((res) => res.json())
                    .then((data) => {
                        if (data.success && data.sessions.length > 0) {
                            const orders = data.sessions[0].orders || [];
                            setSessionOrders((prev) => ({ ...prev, [device.mac]: orders }));
                        }
                    })
                    .catch((err) => {
                        console.warn(`❌ Failed to load orders for ${device.mac}`, err);
                    });
            }
        });
    }, [devices]);

    useEffect(() => {
        wsMessages.forEach((msg) => {
            if (!msg.mac) return;
            if (msg.type === "device_update") {
                setDevices(prevDevices =>
                    prevDevices.map(device =>
                        device.mac === msg.mac
                            ? { ...device, ...msg.update }
                            : device
                    )
                );
            }

            if (msg.type === "reset_notice") {
                console.log("RESET CALLED", msg)
                setDevices(prevDevices =>
                    prevDevices.map(device =>
                        device.mac === msg.mac
                            ? { ...device, status: "idle", currentOrder: [], tableSessionId: null }
                            : device
                    )
                );

                setSessionOrders(prev => {
                    const copy = { ...prev };
                    delete copy[msg.mac];
                    return copy;
                });
            }
        });
    }, [wsMessages]);

    const handleResetSession = async (mac) => {
        try {
            const res = await fetch(`${process.env.REACT_APP_API_URL}/reset-table-session`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ mac }),
            });

            if (res.ok) {
                setResetStatus(prev => ({ ...prev, [mac]: '✅ 초기화 완료됨' }));

                const deviceRes = await fetch(`${process.env.REACT_APP_API_URL}/devices`);
                const deviceData = await deviceRes.json();
                if (deviceData.devices) {
                    setDevices(deviceData.devices);
                }

                setSessionOrders(prev => {
                    const copy = { ...prev };
                    delete copy[mac];
                    return copy;
                });

                setTimeout(() => {
                    setResetStatus(prev => {
                        const copy = { ...prev };
                        delete copy[mac];
                        return copy;
                    });
                }, 2000);
            } else {
                throw new Error();
            }
        } catch (err) {
            console.error("❌ Failed to reset session:", err);
            setResetStatus(prev => ({ ...prev, [mac]: '❌ Failed to reset' }));
            setTimeout(() => {
                setResetStatus(prev => {
                    const copy = { ...prev };
                    delete copy[mac];
                    return copy;
                });
            }, 3000);
        }
    };

    const getStatusLabel = (device) => {
        if (!device.connected) return <span className="text-red-500 font-semibold">🔴 Offline</span>;

        const statusMap = {
            idle: <span className="text-gray-500 font-semibold">● Idle</span>,
            ordering: <span className="text-yellow-500 font-semibold">🗣 Ordering</span>,
            complete: <span className="text-green-600 font-semibold">✅ Ordered</span>,
        };

        return statusMap[device.status] || <span className="text-gray-400 font-semibold">Unknown</span>;
    };

    const handleCleanupDemoDevices = async () => {
        const confirmed = window.confirm("⚠️ 정말로 모든 데모 디바이스와 세션을 삭제하시겠습니까?");
        if (!confirmed) return;

        try {
            const res = await fetch(`${process.env.REACT_APP_API_URL}/admin/cleanup-demo-devices`, {
                method: "DELETE",
            });

            const result = await res.json();
            if (result.success) {
                alert(`✅ 삭제 완료: ${result.deletedDevices}개 디바이스, ${result.deletedSessions}개 세션`);
                setDevices(prev => prev.filter(d => !d.mac.startsWith("external-demo")));
                setSessionOrders(prev => {
                    const filtered = { ...prev };
                    Object.keys(filtered).forEach(mac => {
                        if (mac.startsWith("external-demo")) delete filtered[mac];
                    });
                    return filtered;
                });
            } else {
                throw new Error("Server responded with error");
            }
        } catch (err) {
            console.error("❌ Failed to cleanup demo devices:", err);
            alert("❌ 삭제 실패. 서버 로그를 확인하세요.");
        }
    };

    // 👉 Grouping real vs demo
    const realDevices = devices.filter(d => !d.mac.startsWith("external-demo"));
    const demoDevices = devices.filter(d => d.mac.startsWith("external-demo"));

    return (
        <div className="space-y-10">
            {/* ✅ Real Devices */}
            <DeviceGroup title="📡 실사용 디바이스" devices={realDevices} sessionOrders={sessionOrders} resetStatus={resetStatus} handleResetSession={handleResetSession} getStatusLabel={getStatusLabel} setSessionOrders={setSessionOrders} />

            {/* 🧪 Demo Devices */}
            <DeviceGroup title="🧪 데모 디바이스" devices={demoDevices} sessionOrders={sessionOrders} resetStatus={resetStatus} handleCleanupDemoDevices={handleCleanupDemoDevices} handleResetSession={handleResetSession} getStatusLabel={getStatusLabel} setSessionOrders={setSessionOrders} />
        </div>
    );
}

function DeviceGroup({ title, devices, sessionOrders, resetStatus, handleResetSession, getStatusLabel, setSessionOrders, handleCleanupDemoDevices }) {
    return (
        <div>
            <div className='flex space-x-3 items-center'>
                <h2 className="text-xl font-bold mb-2">{title} ({devices.length})</h2>

                {handleCleanupDemoDevices && (
                    <button className='bg-red-500 text-white px-3 py-1 text-sm' onClick={handleCleanupDemoDevices}>CLEAR</button>
                )}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {devices.map((device, idx) => (
                    <div key={idx} className="border rounded-lg p-3 shadow hover:shadow-md bg-white space-y-2">
                        <div className='flex justify-between w-full'>
                            <div className="text-xl font-semibold">🪑 Table {device.tableNumber ?? '-'}</div>
                            <div className='text-xs'>{getStatusLabel(device)}</div>
                        </div>

                        <div className='bg-gray-100 rounded-lg p-3 text-gray-600 space-y-2'>
                            {Array.isArray(sessionOrders[device.mac]) && sessionOrders[device.mac].length > 0 ? (
                                sessionOrders[device.mac].map((order, orderIdx) =>
                                    order.items.map((item, itemIdx) => {
                                        const posEntered = item.posEntered;
                                        const handleTogglePos = async () => {
                                            try {
                                                const res = await fetch(`${process.env.REACT_APP_API_URL}/orders/${device.tableSessionId}/${orderIdx}/${itemIdx}/pos`, {
                                                    method: "PATCH",
                                                    headers: { "Content-Type": "application/json" },
                                                    body: JSON.stringify({ posEntered: !posEntered }),
                                                });

                                                if (res.ok) {
                                                    setSessionOrders(prev => {
                                                        const updated = [...prev[device.mac]];
                                                        updated[orderIdx].items[itemIdx].posEntered = !posEntered;
                                                        return { ...prev, [device.mac]: updated };
                                                    });
                                                } else {
                                                    throw new Error("Failed to toggle POS status");
                                                }
                                            } catch (err) {
                                                console.error("❌ Failed to update posEntered:", err);
                                            }
                                        };

                                        return (
                                            <div key={`${orderIdx}-${itemIdx}`} className="text-sm flex justify-between items-center">
                                                <div>
                                                    • {item.spiciness !== "기본" && item.spiciness && `[${item.spiciness}] `}
                                                    {item.name}{item.brand ? ` - ${item.brand}` : ""} x{item.quantity}
                                                    <span className="text-gray-400 text-xs ml-2">({formatTimeAgo(order.timestamp)})</span>
                                                </div>
                                                <button
                                                    onClick={handleTogglePos}
                                                    className={`ml-2 px-2 py-1 rounded text-xs ${posEntered ? "bg-green-500 text-white" : "bg-gray-300 text-gray-700"}`}
                                                >
                                                    {posEntered ? "POS 입력됨" : "미입력"}
                                                </button>
                                            </div>
                                        );
                                    })
                                )
                            ) : (
                                <span className="text-gray-400 italic">None</span>
                            )}
                        </div>

                        <div className="pt-2 flex w-full justify-between items-center">
                            <div className="text-sm text-gray-500">{device.mac} / s{device.tableSessionId &&
                                `${device.tableSessionId.slice(0, 2)}${device.tableSessionId.slice(-2)}`}
                            </div>
                            {device.connected ? (
                                <button
                                    onClick={() => handleResetSession(device.mac)}
                                    className={`${resetStatus[device.mac] ? "bg-gray-500" : "bg-red-600"} text-white text-sm px-3 py-1.5 rounded shadow hover:bg-red-700`}
                                >
                                    {resetStatus[device.mac] ? (
                                        <div className="text-white">{resetStatus[device.mac]}</div>
                                    ) : "세션 초기화"}
                                </button>
                            ) : (
                                <span className="text-gray-400 text-xs">offline</span>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

function formatTimeAgo(isoString) {
    if (!isoString) return '-';
    const seconds = Math.floor((Date.now() - new Date(isoString)) / 1000);
    if (seconds < 60) return `${seconds}s ago`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
}
