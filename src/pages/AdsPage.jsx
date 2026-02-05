import { useEffect, useState, useRef } from "react";
import { FaPlus, FaTrash, FaPen, FaLink, FaImage, FaSort } from "react-icons/fa6";
import { BiLoader, BiX } from "react-icons/bi";
import { FaCheckCircle } from "react-icons/fa";

// Reusable Switch Component
const Switch = ({ checked, onChange }) => (
  <button
    type="button"
    role="switch"
    aria-checked={checked}
    onClick={onChange}
    className={`${checked ? "bg-indigo-600" : "bg-gray-200"
      } relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none`}
  >
    <span
      className={`${checked ? "translate-x-5" : "translate-x-0"
        } pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`}
    />
  </button>
);

const AdsPage = () => {
  const [ads, setAds] = useState([]);
  const [loading, setLoading] = useState(false);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAd, setEditingAd] = useState(null); // null = creating new
  const [modalLoading, setModalLoading] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    title: "",
    badgeText: "",
    redirectUrl: "",
    priority: 0,
    isOfficial: false, // 🆕 Added isOfficial
    isActive: true,
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);

  const fileInputRef = useRef(null);

  // ---------------- API CALLS ----------------

  const loadAds = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${process.env.REACT_APP_API_URL}/ads/promotions`, {
        credentials: "include",
      });
      const data = await res.json();
      setAds(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to load ads:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this ad? This cannot be undone.")) return;
    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL}/ads/promotions/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      const data = await res.json();
      if (data.success) {
        setAds((prev) => prev.filter((ad) => ad.id !== id && ad._id !== id));
      } else {
        alert(data.error || "Delete failed");
      }
    } catch (err) {
      alert("Error deleting ad");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setModalLoading(true);

    try {
      if (editingAd) {
        // --- UPDATE (PATCH) ---
        const body = { ...formData };

        const res = await fetch(`${process.env.REACT_APP_API_URL}/ads/promotions/${editingAd.id || editingAd._id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
          credentials: "include",
        });
        const data = await res.json();
        if (data.success) {
          setAds((prev) =>
            prev.map((ad) => ((ad.id === editingAd.id || ad._id === editingAd._id) ? data.ad : ad))
          );
          closeModal();
          loadAds();
        } else {
          alert(data.error);
        }
      } else {
        // --- CREATE (POST) ---
        if (!selectedFile) return alert("Please select an image");

        const payload = new FormData();
        payload.append("image", selectedFile);
        payload.append("title", formData.title);
        payload.append("badgeText", formData.badgeText);
        payload.append("redirectUrl", formData.redirectUrl);
        payload.append("priority", formData.priority);
        payload.append("isOfficial", formData.isOfficial); // 🆕 Append isOfficial

        const res = await fetch(`${process.env.REACT_APP_API_URL}/ads/promotions`, {
          method: "POST",
          body: payload,
          credentials: "include",
        });
        const data = await res.json();
        if (data.success) {
          setAds((prev) => [data.ad, ...prev]);
          closeModal();
          loadAds();
        } else {
          alert(data.error);
        }
      }
    } catch (err) {
      console.error(err);
      alert("Operation failed");
    } finally {
      setModalLoading(false);
    }
  };

  // ---------------- UI LOGIC ----------------

  useEffect(() => {
    loadAds();
  }, []);

  const openCreateModal = () => {
    setEditingAd(null);
    setFormData({ title: "", badgeText: "", redirectUrl: "", priority: 0, isOfficial: false, isActive: true });
    setSelectedFile(null);
    setPreviewUrl(null);
    setIsModalOpen(true);
  };

  const openEditModal = (ad) => {
    setEditingAd(ad);
    setFormData({
      title: ad.title,
      badgeText: ad.badgeText,
      redirectUrl: ad.redirectUrl,
      priority: ad.priority || 0,
      isOfficial: ad.isOfficial || false, // 🆕 Load existing
      isActive: ad.isActive,
    });
    setSelectedFile(null);
    setPreviewUrl(ad.imageUrl);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingAd(null);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  return (
    <div className="w-full font-sans bg-gray-50 min-h-screen flex flex-col items-center">

      {/* HEADER */}
      <div className="w-full max-w-6xl p-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">App Promotions</h1>
          <p className="text-sm text-gray-500">Manage banner ads shown in the history grid</p>
        </div>
        <button
          onClick={openCreateModal}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg flex items-center shadow-lg transition-all"
        >
          <FaPlus className="mr-2" /> New Ad
        </button>
      </div>

      {/* CONTENT */}
      {loading ? (
        <div className="mt-20">
          <BiLoader className="w-10 h-10 animate-spin text-gray-400" />
        </div>
      ) : (
        <div className="w-full max-w-6xl p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {ads.map((ad) => (
            <div
              key={ad.id || ad._id}
              className={`bg-white rounded-xl shadow-sm border overflow-hidden flex flex-col relative group transition-all hover:shadow-md ${!ad.isActive ? "opacity-60 grayscale" : ""
                }`}
            >
              {/* IMAGE AREA */}
              <div className="relative w-full aspect-[6/7] bg-gray-100">
                <img
                  src={ad.imageUrl}
                  alt={ad.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-60" />

                {/* Left Badges Stack: Priority & Official */}
                <div className="absolute top-2 left-2 flex flex-col gap-1 items-start">
                  {/* Priority */}
                  <span className="bg-black/50 backdrop-blur text-white px-2 py-0.5 rounded text-[10px] font-mono flex items-center gap-1">
                    <FaSort /> {ad.priority || 0}
                  </span>
                  {/* 🆕 Official Badge */}
                  {ad.isOfficial && (
                    <span className="bg-blue-600 text-white px-2 py-0.5 rounded text-[10px] font-bold shadow-sm flex items-center gap-1">
                      <FaCheckCircle size={10} /> OFFICIAL
                    </span>
                  )}
                </div>

                {/* Overlay Text Preview */}
                <div className="absolute bottom-0 left-0 p-4 w-full">
                  <div className="flex items-center space-x-2 mb-1">
                    <span className="bg-indigo-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded">
                      {ad.badgeText}
                    </span>
                  </div>
                  <h3 className="text-white font-semibold text-sm truncate">{ad.title}</h3>
                </div>

                {/* Status Badge */}
                <div className="absolute top-2 right-2">
                  <span className={`px-2 py-1 text-xs font-bold rounded-full border ${ad.isActive ? 'bg-green-100 text-green-700 border-green-200' : 'bg-gray-100 text-gray-600'}`}>
                    {ad.isActive ? 'ACTIVE' : 'INACTIVE'}
                  </span>
                </div>
              </div>

              {/* DETAILS & ACTIONS */}
              <div className="p-4 flex flex-col gap-2 flex-1">
                <div className="flex items-center text-xs text-gray-500 truncate">
                  <FaLink className="mr-1 flex-shrink-0" />
                  <a href={ad.redirectUrl} target="_blank" rel="noreferrer" className="truncate hover:text-indigo-600 hover:underline">
                    {ad.redirectUrl}
                  </a>
                </div>

                <div className="mt-auto pt-4 flex items-center justify-end space-x-2 border-t border-gray-100">
                  <button
                    onClick={() => openEditModal(ad)}
                    className="p-2 text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-full transition-colors"
                  >
                    <FaPen size={14} />
                  </button>
                  <button
                    onClick={() => handleDelete(ad.id || ad._id)}
                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors"
                  >
                    <FaTrash size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))}

          {ads.length === 0 && (
            <div className="col-span-full py-20 text-center text-gray-400">
              No active promotions found.
            </div>
          )}
        </div>
      )}

      {/* MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col max-h-[90vh]">

            <div className="p-4 border-b flex justify-between items-center bg-gray-50">
              <h2 className="font-bold text-lg text-gray-800">
                {editingAd ? "Edit Promotion" : "New Promotion"}
              </h2>
              <button onClick={closeModal} className="text-gray-400 hover:text-gray-600">
                <BiX size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 overflow-y-auto flex flex-col gap-4">

              {/* Image Upload */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500 uppercase">Banner Image</label>

                {!editingAd && (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-gray-300 rounded-xl h-48 flex items-center justify-center cursor-pointer hover:border-indigo-500 hover:bg-indigo-50 transition-all overflow-hidden relative"
                  >
                    {previewUrl ? (
                      <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                      <div className="text-center text-gray-400">
                        <FaImage className="mx-auto mb-2 text-2xl" />
                        <span className="text-sm">Click to upload</span>
                      </div>
                    )}
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleFileChange}
                    />
                  </div>
                )}

                {editingAd && (
                  <div className="flex items-center space-x-4">
                    <img src={previewUrl} alt="Current" className="w-16 h-16 rounded-lg object-cover border" />
                    <span className="text-xs text-gray-400 italic">
                      Changing image is not supported in edit mode. Delete and recreate if needed.
                    </span>
                  </div>
                )}
              </div>

              {/* Title & Priority Row */}
              <div className="flex space-x-4">
                <div className="flex-1">
                  <label className="text-xs font-bold text-gray-500 uppercase">Title</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Winter Sale"
                    className="w-full mt-1 p-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  />
                </div>
                <div className="w-24">
                  <label className="text-xs font-bold text-gray-500 uppercase">Priority</label>
                  <input
                    type="number"
                    min="0"
                    placeholder="0"
                    className="w-full mt-1 p-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: parseInt(e.target.value) || 0 })}
                  />
                </div>
              </div>

              {/* Badge */}
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase">Badge Text</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. PROMO"
                  maxLength={10}
                  className="w-full mt-1 p-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                  value={formData.badgeText}
                  onChange={(e) => setFormData({ ...formData, badgeText: e.target.value })}
                />
              </div>

              {/* URL */}
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase">Redirect URL</label>
                <input
                  type="url"
                  required
                  placeholder="https://..."
                  className="w-full mt-1 p-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none font-mono text-sm text-gray-600"
                  value={formData.redirectUrl}
                  onChange={(e) => setFormData({ ...formData, redirectUrl: e.target.value })}
                />
              </div>

              {/* 🆕 Official Toggle */}
              <div className="flex items-center justify-between bg-blue-50 p-3 rounded-lg border border-blue-100">
                <div className="flex items-center gap-2">
                  <FaCheckCircle className="text-blue-600" />
                  <span className="text-sm font-medium text-blue-900">Official Ad</span>
                </div>
                <Switch
                  checked={formData.isOfficial}
                  onChange={() => setFormData(prev => ({ ...prev, isOfficial: !prev.isOfficial }))}
                />
              </div>

              {/* Status Toggle (Only in Edit) */}
              {editingAd && (
                <div className="flex items-center justify-between bg-gray-50 p-3 rounded-lg border">
                  <span className="text-sm font-medium text-gray-700">Active Status</span>
                  <Switch
                    checked={formData.isActive}
                    onChange={() => setFormData(prev => ({ ...prev, isActive: !prev.isActive }))}
                  />
                </div>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={modalLoading}
                className="w-full mt-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-xl shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center"
              >
                {modalLoading ? <BiLoader className="animate-spin" /> : (editingAd ? "Save Changes" : "Create Ad")}
              </button>

            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdsPage;