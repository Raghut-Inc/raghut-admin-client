import React from "react";
import { Dropdown } from "antd"; // Import Spin for a loading indicator
import axios from "axios";

const UserSettingsButton = ({ user, setUser }) => {
  const API_URL = process.env.REACT_APP_API_URL;

  // Logout function
  const handleLogout = async () => {
    try {
      const response = await axios.post(`${API_URL}/auth/logout`, {}, {
        withCredentials: true,
      });
      if (response.status === 200) {
        setUser(null);
      }
    } catch (error) {
      console.error("Error during logout:", error);
    }
  };

  const items = [
    {
      label: <p className="py-2 text-gray-400 text-sm">{user.email}</p>,
      key: "0",
      disabled: true,
    },
    { type: "divider" },
    {
      label: <p className="py-2 text-red-500 text-sm">Log out</p>,
      key: "logout",
      onClick: handleLogout,
    },
  ];

  return (
    <Dropdown menu={{ items }} trigger={["click"]} placement="bottomRight">
      <button className="flex-shrink-0">
        {user?.photoURL ? (
          <img
            src={user.photoURL}
            className="w-8 h-8 rounded-full overflow-hidden object-cover"
            onError={({ currentTarget }) => {
              currentTarget.onerror = null;
              currentTarget.src = "https://pardocs.s3.ap-northeast-2.amazonaws.com/landing/default-profile.png";
            }}
            alt="Profile"
          />
        ) : (
          <div className="h-8 w-8 bg-white rounded-lg border bg-gradient-to-br from-fuchsia-400 to-fuchsia-300 font-medium text-white flex items-center justify-center">
            {user.displayName?.slice(0, 1) || user.email.slice(0, 1)}
          </div>
        )}
      </button>
    </Dropdown>
  );
};

export default UserSettingsButton;
