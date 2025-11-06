import React from "react";
import { Dropdown } from "antd";
import axios from "axios";
import { FaUserCircle } from "react-icons/fa";
import clsx from "clsx";

const UserSettingsButton = ({ user, setUser, location }) => {
  const API_URL = process.env.REACT_APP_API_URL;

  const handleLogout = async () => {
    try {
      const res = await axios.post(`${API_URL}/auth/logout`, {}, { withCredentials: true });
      if (res.status === 200) setUser(null);
    } catch (err) {
      console.error("Logout error:", err);
    }
  };

  const items = [
    {
      label: (
        <p className="py-2 text-gray-400 text-sm text-center">
          {user?.email}
        </p>
      ),
      key: "email",
      disabled: true,
    },
    { type: "divider" },
    {
      label: (
        <p className="py-2 text-red-500 text-sm text-center font-medium">
          Log out
        </p>
      ),
      key: "logout",
      onClick: handleLogout,
    },
  ];

  return (
    <Dropdown menu={{ items }} trigger={["click"]} placement="topRight">
      <button
        className={clsx(
          "flex items-center gap-3 px-4 py-3 rounded-md transition-colors text-sm w-full text-gray-500 hover:bg-gray-100"
        )}
      >
        {user?.profileImageUrl ? (
          <img
            src={user.profileImageUrl}
            alt="Profile"
            className="w-6 h-6 rounded-full object-cover"
            onError={({ currentTarget }) => {
              currentTarget.onerror = null;
              currentTarget.src =
                "https://pardocs.s3.ap-northeast-2.amazonaws.com/landing/default-profile.png";
            }}
          />
        ) : (
          <FaUserCircle className="w-6 h-6 text-gray-400" />
        )}
        <span className="font-medium">{user?.name || "User"}</span>
      </button>
    </Dropdown>
  );
};

export default UserSettingsButton;
