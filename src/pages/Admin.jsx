import FrameList from "./FrameList";
import NavBar from "../components/NavBar";
import { Route, Routes } from "react-router";
import OrderList from "../components/OrderList";
import AdminDevices from "./AdminDevices";

export default function Admin({ user, setUser, wsRef }) {
  return (
    <>
      <NavBar user={user} setUser={setUser} animate={true} />
      <div className="min-h-screen px-4 space-y-6">
        <Routes>
          <Route path="/orders" element={<OrderList wsRef={wsRef} />} />
          <Route path="/frames" element={<FrameList />} />
          <Route path="/devices" element={<AdminDevices wsRef={wsRef} />} />
        </Routes>
      </div>
    </>
  );
}
