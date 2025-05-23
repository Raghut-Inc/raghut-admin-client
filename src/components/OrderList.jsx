import clsx from "clsx";
import { useCallback, useEffect, useState } from "react";

const OrderList = ({ wsMessages }) => {
  const [activeTab, setActiveTab] = useState("ordering");
  const [orders, setOrders] = useState([]);
  const [highlightedOrders, setHighlightedOrders] = useState(new Set());

  const API_URL = process.env.REACT_APP_API_URL;

  const fetchOrders = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/orders`);
      const data = await res.json();
      if (data.success) {
        const sessions = data.sessions;
        const flatOrders = sessions.flatMap(session =>
          session.orders.map((order, i) => ({
            ...order,
            _id: `${session.tableSessionId}-${i}`,
            tableNumber: session.tableNumber,
            status: session.status,
            tableSessionId: session.tableSessionId
          }))
        );
        const sorted = flatOrders.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
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
    wsMessages.forEach((data) => {
      if (data.type === "new_order") {
        const newOrder = {
          ...data.order,
          _id: `${data.order.tableSessionId}-${Date.now()}`,
          status: "ordering"
        };

        setOrders((prev) => [newOrder, ...prev]);

        setHighlightedOrders((prev) => {
          const next = new Set(prev);
          next.add(newOrder._id);
          return next;
        });

      } else if (data.type === "session_status_updated") {
        setOrders((prev) =>
          prev.map((o) => (o.tableSessionId === data.tableSessionId ? { ...o, status: data.status } : o))
        );
      }
    });
  }, [wsMessages]);

  const handleOrderStatus = async (sessionId, status) => {
    try {
      const res = await fetch(`${API_URL}/session/${sessionId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });

      if (res.ok) {
        setOrders((prev) => prev.map((o) => (o.tableSessionId === sessionId ? { ...o, status } : o)));
        setHighlightedOrders((prev) => {
          const updated = new Set(prev);
          prev.forEach(id => {
            if (id.startsWith(sessionId)) updated.delete(id);
          });
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
        {["ordering", "complete"].map((status) => (
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
                  order.status === "ordering" ? "bg-red-500 " : "bg-gray-300"
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
            {order.status === "ordering" && (
              <div className="flex space-x-2 mt-2">
                <button
                  onClick={() => handleOrderStatus(order.tableSessionId, "complete")}
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
