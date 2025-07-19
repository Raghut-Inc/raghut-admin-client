import FrameList from "./FrameList";
import NavBar from "../components/NavBar";
import { Route, Routes } from "react-router";
import Uploads from "./Uploads";
import Users from "./Users";
import Analytics from "./Analytics";

export default function Admin({ user, setUser }) {
  return (
    <>
      <NavBar user={user} setUser={setUser} animate={true} />
      <div className="min-h-screen space-y-6">
        <Routes>
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/user" element={<Users />} />
          <Route path="/uploads" element={<Uploads />} />
          <Route path="/frames" element={<FrameList />} />
          {/* <Route path="/devices" element={<AdminDevices wsMessages={wsMessages} />} /> */}
          {/* <Route path="/register" element={<RegisterDevice />} /> */}
        </Routes>
      </div>
    </>
  );
}
