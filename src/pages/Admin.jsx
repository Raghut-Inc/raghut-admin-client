import FrameList from "./FrameList";
import NavBar from "../components/NavBar";
import { Route, Routes } from "react-router";
import OrderList from "../components/OrderList";
import AdminDevices from "./AdminDevices";

export default function Admin({ wsMessages, user, setUser }) {
  return (
    <>
      <NavBar user={user} setUser={setUser} animate={true} />
      <div className="min-h-screen px-4 space-y-6">
        <Routes>
          <Route path="/orders" element={<OrderList wsMessages={wsMessages.filter(msg => msg.type === 'new_order' || msg.type === 'order_status_updated')} />} />
          <Route path="/frames" element={<FrameList />} />
          <Route path="/devices" element={<AdminDevices wsMessages={wsMessages.filter(msg => msg.type === 'device_update' || msg.type === 'RESET_SESSION')} />} />
        </Routes>
      </div>
    </>
  );
}
