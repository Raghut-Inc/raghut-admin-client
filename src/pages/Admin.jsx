import { Route, Routes } from "react-router";
import Uploads from "./Uploads";
import Users from "./Users";
import Analytics from "./Analytics";
import Chats from "./Chats";
import Dev from "./Dev";
import NavBar from "../components/NavBar";
import DBStats from "./DBStats";
import SideMenu from "../components/Sidebar";

export default function Admin({ user, setUser }) {
  return (
    <>
      <div className="min-h-screen">
        <NavBar user={user} setUser={setUser} />
        <SideMenu user={user} setUser={setUser} />
        <Routes>
          <Route path="/analytics/*" element={<Analytics user={user} setUser={setUser} />} />
          <Route path="/user" element={<Users user={user} setUser={setUser} />} />
          <Route path="/uploads" element={<Uploads user={user} setUser={setUser} />} />
          <Route path="/chat" element={<Chats user={user} setUser={setUser} />} />
          <Route path="/dev" element={<Dev user={user} setUser={setUser} />} />
          <Route path="/db-stats" element={<DBStats />} />
        </Routes>
      </div>
    </>
  );
}
