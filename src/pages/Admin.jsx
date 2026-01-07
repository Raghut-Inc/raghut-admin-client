import { Route, Routes } from "react-router";
import Uploads from "./Uploads";
import Friends from "./Friends";
import Dev from "./Dev";
import NavBar from "../components/NavBar";
import DBStats from "./DBStats";
import SideMenu from "../components/Sidebar";
import DailyActiveUsers from "./users/DailyActiveUsers";
import TotalUsers from "./users/TotalUsers";
import SubscribedUsers from "./users/SubscribedUsers";
import SearchResult from "./SearchResult";
import KakaoUploads from "./KakaoUploads";
import PlatformUploadBucketsPanel from "./PlatformUploadBucketsPanel";
import AdminChatAudit from "./AdminChatAudit";
import GrantEntitlement from "./GrantEntitlement";

export default function Admin({ user, setUser }) {
  return (
    <>
      <div className="min-h-screen">
        <NavBar user={user} setUser={setUser} />
        <SideMenu user={user} setUser={setUser} />
        <Routes>
          <Route path="/test" element={<PlatformUploadBucketsPanel user={user} setUser={setUser} />} />
          <Route path="/uploads" element={<Uploads user={user} setUser={setUser} />} />
          <Route path="/kakao" element={<KakaoUploads user={user} setUser={setUser} />} />
          <Route path="/users/all" element={<TotalUsers user={user} setUser={setUser} />} />
          <Route path="/users/daily-active-users" element={<DailyActiveUsers user={user} setUser={setUser} />} />
          <Route path="/users/subscribed-users" element={<SubscribedUsers user={user} setUser={setUser} />} />
          <Route path="/friends" element={<Friends user={user} setUser={setUser} />} />
          <Route path="/followup" element={<AdminChatAudit user={user} setUser={setUser} />} />
          <Route path="/dev" element={<Dev user={user} setUser={setUser} />} />
          <Route path="/db-stats" element={<DBStats />} />
          <Route path="/search" element={<SearchResult user={user} setUser={setUser} />} />
          <Route path="/grant" element={<GrantEntitlement user={user} setUser={setUser} />} />
        </Routes>
      </div>
    </>
  );
}
