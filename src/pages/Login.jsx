import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router";
import NavBar from "../components/NavBar";

export default function Login({ user, setUser }) {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);

        try {
            const res = await axios.post(`${process.env.REACT_APP_API_URL}/auth/login`, {
                email,
                password,
            }, { withCredentials: true });

            if (res.data.success) {
                setUser(res.data.user);
                navigate("/admin/uploads");
            } else {
                setError("Invalid login");
            }
        } catch (err) {
            console.error("❌ Login error:", err);
            setError("Invalid email or password");
        }
    };

    return (
        <>
            <NavBar user={user} setUser={setUser} animate={true} />
            <div
                style={{ minHeight: "calc(100svh - 7rem)" }}
                className="w-full h-full flex justify-center items-center flex-col p-4 md:p-6 relative"
            >

                <form onSubmit={handleSubmit} className="space-y-4 p-8 border rounded shadow w-96">
                    <h1 className="text-xl font-bold">Login</h1>

                    {error && <p className="text-red-600 text-sm">{error}</p>}

                    <div className="flex flex-col">
                        <label>Email</label>
                        <input
                            className="border rounded px-2 py-1"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>

                    <div className="flex flex-col">
                        <label>Password</label>
                        <input
                            className="border rounded px-2 py-1"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        className="w-full bg-black text-white py-2 rounded"
                    >
                        Log in
                    </button>
                </form>
            </div>
        </>
    );
}
