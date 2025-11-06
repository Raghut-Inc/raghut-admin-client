import { Link, useNavigate, useSearchParams } from "react-router";
import { useState, useEffect } from "react";
import logo from "../assets/logo.png";

const NavBar = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  // 🔍 default value from query param
  const defaultValue = searchParams.get("revenuecatUserId") || "";
  const [query, setQuery] = useState(defaultValue);

  // Keep in sync when param changes (e.g., navigating back)
  useEffect(() => {
    setQuery(defaultValue);
  }, [defaultValue]);

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && query.trim()) {
      navigate(`/admin/search?revenuecatUserId=${encodeURIComponent(query.trim())}`);
    }
  };

  return (
    <nav className="w-full flex-shrink-0 md:flex justify-center h-12 z-30 items-center px-3 md:px-4 bg-white sticky top-0">
      <div className="flex w-full h-full justify-between items-center space-x-2">
        {/* Left: Logo */}
        <div className="flex space-x-6 items-center">
          <Link to="/" className="flex-shrink-0 font-semibold">
            <img src={logo} alt="logo" className="w-12 h-12" />
          </Link>
        </div>

        {/* Center: Search Bar */}
        <div className="flex-1 flex justify-center">
          <input
            type="text"
            placeholder="rc 아이디 검색"
            className="w-full max-w-md border border-gray-300 rounded-full px-4 py-2.5 h-full text-sm focus:outline-none"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
          />
        </div>

        {/* Right: Empty placeholder for layout symmetry */}
        <div className="w-12" />
      </div>
    </nav>
  );
};

export default NavBar;
