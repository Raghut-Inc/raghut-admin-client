import { useNavigate } from "react-router";
import { GoogleLogin } from "@react-oauth/google";
import axios from "axios";
import NavBar from "../components/NavBar";

export default function Login({ user, setUser }) {
  const navigate = useNavigate();

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      const res = await axios.post(
        `${process.env.REACT_APP_API_URL}/auth/google`,
        { idToken: credentialResponse.credential },
        { withCredentials: true }
      );

      if (res.data.success) {
        // only allow admins through
        if (res.data.user.role !== "admin") {
          alert("You are not authorized to access the admin panel.");
          return;
        }

        setUser(res.data.user);
        navigate("/admin/uploads");
      } else {
        alert("Google login failed");
      }
    } catch (err) {
      console.error("❌ Google login error:", err);
      alert("Google login failed");
    }
  };

  const handleGoogleError = () => {
    alert("Google login failed");
  };

  return (
    <>
      <NavBar user={user} setUser={setUser} animate={true} />
      <div
        style={{ minHeight: "calc(100svh - 7rem)" }}
        className="w-full h-full flex justify-center items-center flex-col p-6 relative"
      >
        <div className="space-y-6 p-8 border shadow w-full text-center rounded-xl">
          <h1 className="text-xl font-bold">Admin Login</h1>
          <GoogleLogin onSuccess={handleGoogleSuccess} onError={handleGoogleError} />
        </div>
      </div>
    </>
  );
}
