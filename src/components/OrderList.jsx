import clsx from "clsx";
import { useCallback, useEffect, useState } from "react";

const OrderList = ({ wsRef }) => {
  const [activeTab, setActiveTab] = useState("new");

  const [orders, setOrders] = useState([]);
  const [highlightedOrders, setHighlightedOrders] = useState(new Set());

  const API_URL = process.env.REACT_APP_API_URL;

  const fetchOrders = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/orders`);
      const data = await res.json();
      if (data.success) {
        const sorted = data.orders.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
        setOrders(sorted);
      }
    } catch (err) {
      console.error("❌ Failed to load orders", err);
    }
  }, [API_URL]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  useEffect(() => {
    const ws = wsRef.current;
    if (!ws) {
      console.warn("⚠️ WebSocket ref is not available.");
      return;
    }

    const handleMessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log("📩 WebSocket message received:", data);

        if (data.type === "new_order") {
          console.log("🆕 New order received:", data.orderId, data.order);
          const newOrder = { ...data.order, _id: data.orderId };
          setOrders((prev) => [newOrder, ...prev]);
          setHighlightedOrders((prev) => new Set(prev).add(data.orderId));
        } else if (data.type === "order_status_updated") {
          console.log(`🔄 Order status updated: ${data.orderId} → ${data.status}`);
          setOrders((prev) => prev.map((o) => (o._id === data.orderId ? { ...o, status: data.status } : o)));
        } else {
          console.log("ℹ️ Unhandled WebSocket message type:", data.type);
        }
      } catch (err) {
        console.error("❌ Failed to parse WS message:", err);
        console.debug("📦 Raw message:", event.data);
      }
    };

    ws.addEventListener("message", handleMessage);
    console.log("✅ WebSocket listener added in OrderList");

    return () => {
      ws.removeEventListener("message", handleMessage);
      console.log("🧹 WebSocket listener removed from OrderList");
    };
  }, [wsRef]);

  const handleOrderStatus = async (orderId, status) => {
    try {
      const res = await fetch(`${API_URL}/order/${orderId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });

      if (res.ok) {
        setOrders((prev) => prev.map((o) => (o._id === orderId ? { ...o, status } : o)));
        setHighlightedOrders((prev) => {
          const updated = new Set(prev);
          updated.delete(orderId);
          return updated;
        });
      }
    } catch (err) {
      console.error("❌ Failed to update order status", err);
    }
  };

  const filteredOrders = orders.filter((o) => o.status === activeTab);

  return (
    <div>
      {/* Tabs */}
      <div className="flex mb-2">
        {["new", "served"].map((status) => (
          <button key={status} onClick={() => setActiveTab(status)} className={clsx("px-2 py-1.5 text-sm rounded-lg")}>
            <p className={`px-1 mb-0.5 ${activeTab === status ? "font-semibold" : "text-gray-500"}`}>
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </p>
            {activeTab === status && <div className="w-full h-0.5 bg-black rounded-full"></div>}
          </button>
        ))}
      </div>

      {/* Orders */}
      <div className="space-y-4">
        {filteredOrders.length === 0 && <p>No orders in this category</p>}
        {filteredOrders.map((order, idx) => (
          <div
            key={order._id}
            className={clsx(
              "p-3 rounded-lg shadow space-y-2 border transition-all",
              highlightedOrders.has(order._id) && "border-2 border-yellow-400"
            )}
          >
            <div className="mb-2 text-xl flex space-x-2">
              <div className="font-semibold">
                <b>{order.tableNumber || "?"}</b> 번 테이블
              </div>
              <div
                className={clsx(
                  "text-xs flex items-center justify-center px-2 text-white rounded-lg",
                  order.status === "new" ? "bg-red-500 " : "bg-gray-300"
                )}
              >
                {order.status}- {timeAgo(order.timestamp)}
              </div>
            </div>
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b text-xs bg-gray-200">
                  <th className="text-center py-1 w-16">수량</th>
                  <th className="text-left py-1">메뉴</th>
                </tr>
              </thead>
              <tbody>
                {order.items.map((item, i) => (
                  <tr key={i} className="border-b">
                    <td className="text-center py-1">{item.quantity}</td>
                    <td className="py-1">
                      {item.spiciness !== "기본" && item.spiciness && `[${item.spiciness}] `}
                      {item.name}
                      {item.brand ? ` - ${item.brand}` : ""}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="text-xs text-gray-400">
              ({order._id}, #{idx + 1})
            </p>
            {order.status === "new" && (
              <div className="flex space-x-2 mt-2">
                <button
                  onClick={() => handleOrderStatus(order._id, "served")}
                  className="px-4 py-2 rounded-lg bg-blue-600 text-white"
                >
                  주문 입력 완료
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

function timeAgo(date) {
  const diff = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (diff < 60) return `${diff}초 전`;
  if (diff < 3600) return `${Math.floor(diff / 60)}분 전`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}시간 전`;
  return `${Math.floor(diff / 86400)}일 전`;
}

export default OrderList;
