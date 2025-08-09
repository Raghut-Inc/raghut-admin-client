import React, { useState, useCallback, useRef, useEffect } from "react";
import NavBar from "../components/NavBar";

const PAGE_SIZE = 10;

const Dev = ({ user, setUser }) => {
    // Upload states
    const [selectedFile, setSelectedFile] = useState(null);
    const [subject, setSubject] = useState("math"); // default subject
    const [error, setError] = useState(null);
    const [isDragOver, setIsDragOver] = useState(false);
    // Uploads list states
    const [uploads, setUploads] = useState([]);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [loadingUploads, setLoadingUploads] = useState(false);
    const [loadingMoreUploads, setLoadingMoreUploads] = useState(false);
    const fileInputRef = useRef();

    // Load uploads for user
    const loadUploads = useCallback(
        async (pageToLoad) => {
            if (!user?.id) return;

            try {
                if (pageToLoad === 1) setLoadingUploads(true);
                else setLoadingMoreUploads(true);

                const params = new URLSearchParams();
                params.set("page", pageToLoad);
                params.set("pageSize", PAGE_SIZE);

                const apiUrl = `${process.env.REACT_APP_API_URL}/solved-questions/user/${encodeURIComponent(
                    user.id
                )}?${params.toString()}`;

                const res = await fetch(apiUrl, { credentials: "include" });
                const data = await res.json();

                console.log(data)
                if (!data.success) {
                    console.error("Failed to load uploads:", data.error);
                    return;
                }

                if (pageToLoad === 1) {
                    setUploads(data.questions);
                } else {
                    setUploads((prev) => [...prev, ...data.questions]);
                }

                setHasMore(data.questions.length === PAGE_SIZE);
            } catch (err) {
                console.error("❌ API error:", err);
            } finally {
                if (pageToLoad === 1) setLoadingUploads(false);
                else setLoadingMoreUploads(false);
            }
        },
        [user?.id]
    );

    // Define a reusable upload function that does the actual upload
    const uploadFile = useCallback(async () => {
        if (!selectedFile) {
            setError("Please select or drop an image first.");
            return;
        }

        setError(null);

        try {
            const formData = new FormData();
            formData.append("image", selectedFile);
            formData.append("subject", subject);
            const apiUrl = `${process.env.REACT_APP_API_URL || ""}/v2/solve-question`;

            const res = await fetch(apiUrl, {
                method: "POST",
                body: formData,
                credentials: "include",
            });

            if (!res.ok) {
                const errData = await res.json();
                throw new Error(errData.error || "Upload failed");
            }

            // Reload uploads list from page 1
            loadUploads(1);
        } catch (err) {
            console.error("❌ API error:", err);
            setError(err.message);
        }
    }, [selectedFile, loadUploads, subject]);

    // Form submit handler just calls uploadFile, prevents default
    const onSubmit = useCallback(
        (e) => {
            e.preventDefault();
            uploadFile();
        },
        [uploadFile]
    );

    // Handle file select or drop: set file then call uploadFile
    const handleFile = useCallback(
        (file) => {
            if (file && file.type.startsWith("image/")) {
                setSelectedFile(file);
                setError(null);
                // Wait for selectedFile state to update, then upload
                // Because setSelectedFile is async, uploadFile will use stale selectedFile if called immediately.
                // So call uploadFile after setSelectedFile updates using a small trick with a useEffect:

                // We'll trigger upload in a useEffect below instead
            } else {
                setError("Please upload a valid image file.");
                setSelectedFile(null);
            }
        },
        []
    );

    // Trigger upload when selectedFile changes
    useEffect(() => {
        if (selectedFile) {
            uploadFile();
        }
    }, [selectedFile, uploadFile]);

    // onFileChange remains the same
    const onFileChange = (e) => {
        if (e.target.files.length > 0) {
            handleFile(e.target.files[0]);
        }
    };


    const onDragOver = (e) => {
        e.preventDefault();
        setIsDragOver(true);
    };
    const onDragLeave = (e) => {
        e.preventDefault();
        setIsDragOver(false);
    };
    const onDrop = (e) => {
        e.preventDefault();
        setIsDragOver(false);
        if (e.dataTransfer.files.length > 0) {
            handleFile(e.dataTransfer.files[0]);
        }
    };

    // Load first page of uploads on mount and user change
    useEffect(() => {
        setPage(1);
        loadUploads(1);
    }, [loadUploads]);

    // Infinite scroll for uploads list
    useEffect(() => {
        if (!hasMore || loadingMoreUploads) return;

        const onScroll = () => {
            if (
                window.innerHeight + window.scrollY >=
                document.documentElement.scrollHeight - 300
            ) {
                setPage((prev) => prev + 1);
            }
        };

        window.addEventListener("scroll", onScroll);
        return () => window.removeEventListener("scroll", onScroll);
    }, [hasMore, loadingMoreUploads]);

    // Load more uploads when page increments
    useEffect(() => {
        if (page === 1) return;
        loadUploads(page);
    }, [page, loadUploads]);

    return (
        <div className="min-h-screen bg-gray-100 flex flex-col items-center w-full">
            <NavBar user={user} setUser={setUser} animate={true} title="DEV" />
            <main className="w-full flex md:flex-row flex-col items-center md:items-start p-4 space-y-10 md:space-y-0 md:space-x-4">
                {/* Upload form */}
                <div className="w-full max-w-md bg-white rounded-lg shadow-md p-4">
                    <form onSubmit={onSubmit} className="flex flex-col items-center gap-4">
                        {/* Dropzone */}
                        <div
                            onDragOver={onDragOver}
                            onDragLeave={onDragLeave}
                            onDrop={onDrop}
                            onClick={() => fileInputRef.current.click()}
                            className={`w-full h-80 border-4 border-dashed rounded-lg flex flex-col items-center justify-center cursor-pointer transition-colors ${isDragOver
                                ? "border-indigo-500 bg-indigo-50"
                                : "border-gray-300 bg-white hover:border-indigo-400"}`}
                            role="button"
                            tabIndex={0}
                            onKeyDown={(e) => {
                                if (e.key === "Enter" || e.key === " ") {
                                    fileInputRef.current.click();
                                }
                            }}
                        >
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                onChange={onFileChange}
                                className="hidden"
                            />
                            <p className="text-gray-600 text-xs">
                                {selectedFile ? selectedFile.name : "Click or drag & drop an image here"}
                            </p>
                        </div>
                    </form>

                    {/* Subject dropdown */}
                    <select
                        value={subject}
                        onChange={(e) => setSubject(e.target.value)}
                        className="w-full border border-gray-300 rounded-md p-2 mt-4"
                    >
                        <option value="english">English</option>
                        <option value="math">Math</option>
                    </select>


                    {/* Error */}
                    {error && (
                        <p className="mt-4 text-center text-red-600 font-medium">{error}</p>
                    )}
                </div>

                {/* Uploads list */}
                <section className="w-full max-w-4xl bg-white rounded-lg shadow-md p-6 h-full">
                    {loadingUploads ? (
                        <div className="flex justify-center py-12">
                            <span className="animate-spin rounded-full h-12 w-12 border-b-4 border-r-4 border-indigo-500"></span>
                        </div>
                    ) : uploads.length === 0 ? (
                        <p className="text-center text-gray-600">아직 업로드된 문제가 없습니다.</p>
                    ) : (
                        <div className="space-y-6">
                            {uploads.map((upload, i) => (
                                <div
                                    key={upload._id || i}
                                    className="bg-white flex items-center space-x-4 border-b pb-3"
                                >
                                    <img
                                        src={upload.imageUrl}
                                        alt={`Upload ${upload._id || i}`}
                                        className="w-16 h-16 object-cover rounded-md flex-shrink-0"
                                        loading="lazy"
                                    />
                                    <div>
                                        <p className="text-sm">
                                            {upload._id || `Upload #${i + 1}`}
                                        </p>
                                        <p
                                            className={`text-sm font-medium ${upload.status === "processing" ? "text-yellow-600" : "text-green-600"}`}
                                        >
                                            {upload.status === "processing" ? "처리 중" : "완료"}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>

                    )}
                </section>
            </main>
        </div>
    );
};

export default Dev;
