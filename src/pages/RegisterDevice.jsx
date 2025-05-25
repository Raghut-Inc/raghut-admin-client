import { useState } from "react";

export default function RegisterDevice() {
    const [mac, setMac] = useState("");
    const [status, setStatus] = useState("");
    const DEVICE_REGISTER_SECRET = process.env.REACT_APP_DEVICE_REGISTER_SECRET;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setStatus("⏳ Registering...");

        try {
            const res = await fetch(`${process.env.REACT_APP_API_URL}/register-device`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "x-api-secret": DEVICE_REGISTER_SECRET
                },
                body: JSON.stringify({ mac }),
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Unknown error");

            setStatus(`✅ Registered: sessionId = ${data.tableSessionId}`);
            setMac("");
        } catch (err) {
            console.error("❌ Device registration failed:", err);
            setStatus(`❌ ${err.message}`);
        }
    };

    return (
        <div className="max-w-md mx-auto mt-12 p-6 bg-white shadow-md rounded">
            <h2 className="text-2xl font-bold mb-4">Register New Device</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700">MAC Address</label>
                    <input
                        type="text"
                        value={mac}
                        onChange={(e) => setMac(e.target.value)}
                        placeholder="e.g. B8:27:EB:12:34:56"
                        required
                        className="mt-1 w-full border rounded px-3 py-2"
                    />
                </div>
                <button
                    type="submit"
                    className="w-full py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                    Register Device
                </button>
            </form>
            {status && <p className="mt-4 text-sm text-gray-600">{status}</p>}
        </div>
    );
}
