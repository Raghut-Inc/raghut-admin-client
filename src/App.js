import { useCallback, useEffect, useRef, useState } from "react";
import { Routes, Route, Navigate, useLocation } from "react-router";
import ScrollToTop from "./utils/scrollToTop";
import axios from "axios";
import Admin from "./pages/Admin";
import Login from "./pages/Login";
import Landing from "./pages/Landing";

function App() {
  const API_URL = process.env.REACT_APP_API_URL;
  const WS_URL = process.env.REACT_APP_WS_URL;
  const wsRef = useRef(null);

  const location = useLocation();

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

  // 🔄 WebSocket setup
  useEffect(() => {
    let isMounted = true;
    let reconnectTimeout;
    const reconnectDelay = 3000;

    const connectWS = async () => {
      await fetch(`${API_URL}/health`).catch(() => { });

      const isAgentRoute = location.pathname.startsWith('/agent');
      const mac = localStorage.getItem("deviceMac") || "unknown";

      const wsURL = isAgentRoute
        ? `${WS_URL}?mac=${encodeURIComponent(mac)}`
        : WS_URL;

      const ws = new WebSocket(wsURL);
      wsRef.current = ws;

      ws.onopen = () => isMounted && console.log("✅ WebSocket connected");
      ws.onclose = () => {
        if (!isMounted) return;
        console.warn("⚪ WebSocket closed, retrying in 3s...");
        reconnectTimeout = setTimeout(connectWS, reconnectDelay);
      };
      ws.onerror = (err) => {
        console.error("❌ WebSocket error", err);
        ws.close();
      };
    };

    connectWS();

    return () => {
      isMounted = false;
      clearTimeout(reconnectTimeout);
      wsRef.current?.close();
    };
  }, [API_URL, WS_URL, location]);

  // 👁 Hide cursor for agent in production
  useEffect(() => {
    const isProd = process.env.NODE_ENV === 'production';
    const isAgentRoute = location.pathname.startsWith('/agent');

    if (isProd && isAgentRoute) {
      document.body.classList.add('cursor-none');
    } else {
      document.body.classList.remove('cursor-none');
    }
  }, [location]);

  if (isLoading) {
    return <div className="h-screen w-full flex items-center justify-center text-gray-500">Loading...</div>;
  }

  return (
    <div className="font-kyobohand">
      <ScrollToTop />
      <Routes>
        <Route
          path="/"
          element={
            user ? (
              <Navigate to="/admin/orders" replace />
            ) : (
              <Landing user={user} setUser={setUser} />
            )
          }
        />
        <Route path="/login" element={<Login user={user} setUser={setUser} />} />
        <Route
          path="/admin/*"
          element={user ? <Admin user={user} setUser={setUser} wsRef={wsRef} /> : <Navigate to="/" replace />}
        />
      </Routes>
    </div>
  );
}

export default App;
