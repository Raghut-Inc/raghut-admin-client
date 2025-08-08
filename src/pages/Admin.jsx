import { Route, Routes } from "react-router";
import Uploads from "./Uploads";
import Users from "./Users";
import Analytics from "./Analytics";
import Chats from "./Chats";
import TabBar from "../components/TabBar";

export default function Admin({ user, setUser }) {
  return (
    <>
      <div className="min-h-screen space-y-6 pb-14">
        <Routes>
          <Route path="/analytics" element={<Analytics user={user} setUser={setUser} />} />
          <Route path="/user" element={<Users user={user} setUser={setUser} />} />
          <Route path="/uploads" element={<Uploads user={user} setUser={setUser} />} />
          <Route path="/chat" element={<Chats user={user} setUser={setUser} />} />
        </Routes>
      </div>
      <TabBar user={user} setUser={setUser} animate={true} />

    </>
  );
}
