import { useEffect, useState } from 'react';

export default function AdminDevices({ wsRef }) {
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
                fetch(`${process.env.REACT_APP_API_URL}/device-orders?mac=${device.mac}&tableSessionId=${device.tableSessionId}`)
                    .then((res) => res.json())
                    .then((data) => {
                        if (data.success) {
                            setSessionOrders((prev) => ({ ...prev, [device.mac]: data.orders }));
                        }
                    })
                    .catch((err) => {
                        console.warn(`❌ Failed to load orders for ${device.mac}`, err);
                    });
            }
        });
    }, [devices]);

    useEffect(() => {
        const ws = wsRef?.current;
        if (!ws) return;

        const handleMessage = (event) => {
            try {
                const msg = JSON.parse(event.data);
                if (msg.type === "device_update") {
                    setDevices(prevDevices => {
                        return prevDevices.map(device =>
                            device.mac === msg.mac
                                ? { ...device, ...msg.update }
                                : device
                        );
                    });
                } else if (msg.type === "RESET_SESSION") {
                    setDevices(prevDevices => {
                        return prevDevices.map(device =>
                            device.mac === msg.mac
                                ? { ...device, status: "idle", currentOrder: [], tableSessionId: null }
                                : device
                        );
                    });
                    // 🆕 Clear session orders too
                    setSessionOrders(prev => {
                        const copy = { ...prev };
                        delete copy[msg.mac];
                        return copy;
                    });
                }
            } catch (err) {
                console.error("❌ Failed to parse WS message:", err);
            }
        };

        ws.addEventListener("message", handleMessage);
        return () => {
            ws.removeEventListener("message", handleMessage);
        };
    }, [wsRef]);

    const handleResetSession = async (mac) => {
        try {
            const res = await fetch(`${process.env.REACT_APP_API_URL}/reset-table-session`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ mac }),
            });

            if (res.ok) {
                setResetStatus(prev => ({ ...prev, [mac]: '✅ 초기화 완료됨' }));
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

    function mergeItems(orders) {
        const map = new Map();
        orders.flatMap(o => o.items).forEach((item) => {
            const key = `${item.name}-${item.spiciness || ""}-${item.brand || ""}`;
            if (!map.has(key)) {
                map.set(key, { ...item }); // clone item
            } else {
                map.get(key).quantity += item.quantity;
            }
        });
        return Array.from(map.values());
    }

    return (
        <div className="">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {devices.map((device, idx) => (
                    <div
                        key={idx}
                        className="border rounded-lg p-3 shadow hover:shadow-md bg-white space-y-2"
                    >
                        <div className='flex justify-between w-full'>
                            <div className="text-xl font-semibold">🪑 Table {device.tableNumber ?? '-'}</div>
                            <div className='text-xs'>{getStatusLabel(device)}</div>
                        </div>

                        <div className="text-sm text-gray-500">
                            Last Seen: {formatTimeAgo(device.lastSeen)}
                        </div>
                        <div className='bg-gray-100 rounded-lg p-3 text-gray-600'>
                            {Array.isArray(sessionOrders[device.mac]) && sessionOrders[device.mac].length > 0 ? (
                                mergeItems(sessionOrders[device.mac]).map((item, i) => (
                                    <div key={i}>• {item.spiciness !== "기본" && item.spiciness && `[${item.spiciness}] `}
                                        {item.name}
                                        {item.brand ? ` - ${item.brand}` : ""} x{item.quantity}</div>
                                ))
                            ) : (
                                <span className="text-gray-400 italic">None</span>
                            )}
                        </div>
                        <div className="pt-2 flex w-full justify-between items-center">
                            <div className="text-xs text-gray-500">{device.mac} / {device.tableSessionId &&
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
    return `${hours}h ago`;
}
