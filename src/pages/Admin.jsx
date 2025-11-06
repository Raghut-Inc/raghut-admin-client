import { Route, Routes } from "react-router";
import Uploads from "./Uploads";
import Analytics from "./Analytics";
import Chats from "./Chats";
import Dev from "./Dev";
import NavBar from "../components/NavBar";
import DBStats from "./DBStats";
import SideMenu from "../components/Sidebar";
import DailyActiveUsers from "./users/DailyActiveUsers";
import TotalUsers from "./users/TotalUsers";

export default function Admin({ user, setUser }) {
  return (
    <>
      <div className="min-h-screen">
        <NavBar user={user} setUser={setUser} />
        <SideMenu user={user} setUser={setUser} />
        <Routes>
          <Route path="/analytics/*" element={<Analytics user={user} setUser={setUser} />} />
          <Route path="/uploads" element={<Uploads user={user} setUser={setUser} />} />
          <Route path="/users/all" element={<TotalUsers user={user} setUser={setUser} />} />
          <Route path="/users/daily-active-users" element={<DailyActiveUsers user={user} setUser={setUser} />} />
          <Route path="/chat" element={<Chats user={user} setUser={setUser} />} />
          <Route path="/dev" element={<Dev user={user} setUser={setUser} />} />
          <Route path="/db-stats" element={<DBStats />} />
        </Routes>
      </div>
    </>
  );
}
