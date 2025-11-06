import { useCallback, useEffect, useState } from "react";
import { Routes, Route, Navigate } from "react-router";
import ScrollToTop from "./utils/scrollToTop";
import axios from "axios";
import Admin from "./pages/Admin";
import Login from "./pages/Login";

function App() {
  const API_URL = process.env.REACT_APP_API_URL;

  const [user, setUser] = useState(null);
  const [isLoading, setLoading] = useState(true);

  // 👤 Auth session
  const fetchAuthenticatedUser = useCallback(async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_URL}/auth/success`, { withCredentials: true });
      setUser(response.data.success ? response.data.user : null);
    } catch (error) {
      if (error.response?.status === 401) {
        console.log("No active session, user not logged in.");
        setUser(null);
      } else {
        console.error("Unexpected error fetching user data:", error);
      }
    } finally {
      setLoading(false);
    }
  }, [API_URL]);

  useEffect(() => {
    fetchAuthenticatedUser();
  }, [fetchAuthenticatedUser]);

  if (isLoading) {
    return <div className="h-screen w-full flex items-center justify-center text-gray-500">Loading...</div>;
  }

  return (
    <div className="">
      <ScrollToTop />
      <Routes>
        <Route
          path="/"
          element={
            user ? (
              <Navigate to="/admin/analytics" replace />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
        <Route path="/login" element={<Login user={user} setUser={setUser} />} />
        <Route
          path="/admin/*"
          element={
            user ? (
              <Admin user={user} setUser={setUser} />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
      </Routes>
    </div>
  );
}

export default App;
