import { useState } from "react";
import { timeAgo } from "../../utils/timeAgo";
import CardEngShortAnswer from "./CardEngShortAnswer";
import CardEngMCQ from "./CardEngMCQ";
import CardMathMCQ from "./CardMathMCQ";
import CardMathShortAnswer from "./CardMathShortAnswer";

import { FaAngleDown, FaCircleCheck, FaTrashCan } from "react-icons/fa6";
import { MdError, MdWarning } from "react-icons/md";
import { FiCopy } from "react-icons/fi";
import { BiLoader } from "react-icons/bi";
import UserCell from "../UserCell";
import clsx from "clsx";

const UploadCard = ({ q, qIndex, onDelete }) => {
    const [showDetails, setShowDetails] = useState(false);
    const [copied, setCopied] = useState(false);
    const isQuotaLimit = !!q.errorCode?.includes("DAILY_LIMIT_EXCEEDED");
    const hasError = !!q.errorCode
    const isProcessing = q.status === "processing"
    const isSmallCard = isProcessing || hasError

    const handleCopy = () => {
        navigator.clipboard.writeText(q._id);
        setCopied(true);
        setTimeout(() => setCopied(false), 1000);
    };

    const analyzed = Array.isArray(q?.gptAnalyzed) ? q.gptAnalyzed : [];
    const validCount = analyzed.filter(i => i.isQuestionValid === true).length;
    const invalidCount = analyzed.length - validCount;


    const prettyDate = q.uploader?.kakaoLastUploadDate
        ? new Date(q.uploader.kakaoLastUploadDate).toLocaleString("ko-KR", {
            month: "2-digit",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
        })
        : "—";


    // existing renderQuestionCard stays as-is for the detail view
    const renderQuestionCard = (item, key) => {
        const isStem = q.subject === "math" || q.subject === "physics" || q.subject === "biology" || q.subject === "earth_science" || q.subject === "chemistry";
        if (isStem) {
            return item.questionType === "ShortAnswer" ? (
                <CardMathShortAnswer key={key} questionItem={item} />
            ) : (
                <CardMathMCQ key={key} questionItem={item} />
            );
        } else {
            return item.questionType === "ShortAnswer" ? (
                <CardEngShortAnswer key={key} questionItem={item} />
            ) : (
                <CardEngMCQ key={key} questionItem={item} />
            );
        }
    };

    return (
        <div key={qIndex} className="max-w-xl overflow-hidden shadow-sm bg-white w-full">
            <div className={`${isProcessing ? "opacity-80" : isQuotaLimit ? "border-[6px] border-orange-500" : hasError && "border-[6px] border-red-500"} bg-gray-700 flex flex-col w-full text-white text-xs`}>
                <div className="flex w-full h-full">
                    {/* Image Preview */}
                    <div
                        className={clsx(
                            "flex-shrink-0 flex justify-start items-center bg-black transition-all duration-200",
                            isSmallCard
                                ? "w-28 h-28 items-center justify-center"
                                : "max-w-48 max-h-64"
                        )}
                    >
                        {q.imageUrl && (
                            <a
                                href={q.imageUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="block relative"
                                onClick={(e) => e.stopPropagation()}
                            >
                                <img
                                    src={q.imageUrl}
                                    alt="Captured"
                                    className={clsx(
                                        "object-contain cursor-pointer transition-all duration-200",
                                        isSmallCard ? "w-full h-28" : "w-full max-h-64"
                                    )}
                                />
                            </a>
                        )}
                    </div>


                    {/* Quota limit check */}
                    <div className="w-full h-full flex flex-col justify-start p-3">
                        <div className="flex flex-col">
                            <div className="w-full flex justify-between items-center">
                                <div className="flex space-x-2 items-center">
                                    {/* Status Icon */}
                                    {isProcessing ? (
                                        <BiLoader className="w-5 h-5 text-gray-500 animate-spin dark:text-gray-600 fill-white" />
                                    ) : isQuotaLimit ? (
                                        <MdWarning className="w-7 h-7 text-orange-500 p-px" />
                                    ) : hasError ? (
                                        <MdError className="w-7 h-7 text-red-500 p-px bg-white rounded-full" />
                                    ) : (
                                        <FaCircleCheck className="w-7 h-7 text-indigo-500 p-px bg-white rounded-full" />
                                    )}
                                    <span>{timeAgo(q.createdAt)}</span>
                                </div>

                                {/* Copy/Delete Buttons */}
                                <div className="flex justify-end space-x-1 items-center">
                                    <button
                                        onClick={handleCopy}
                                        className="bg-gray-600 text-white font-semibold w-7 h-7 rounded-full flex items-center justify-center"
                                        title="Copy ID"
                                    >
                                        {copied ? (
                                            <FaCircleCheck className="w-5 h-5" />
                                        ) : (
                                            <FiCopy className="w-3 h-3" />
                                        )}
                                    </button>

                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onDelete(q._id);
                                        }}
                                        className="bg-red-500 hover:bg-red-600 text-white font-semibold w-7 h-7 rounded-full flex items-center justify-center"
                                    >
                                        <FaTrashCan className="w-3 h-3" />
                                    </button>
                                </div>
                            </div>

                            <div className="flex flex-col mt-2 text-xs text-white space-y-1">
                                <div>
                                    <span className="font-semibold text-gray-400">Upload:</span>{" "}
                                    {new Date(q.createdAt).toLocaleString("ko-KR", {
                                        month: "short",
                                        day: "numeric",
                                        hour: "2-digit",
                                        minute: "2-digit",
                                        hour12: true,
                                    })}
                                </div>

                                <div className="flex items-center space-x-2">
                                    <span className="font-semibold text-gray-400">OG-img:</span>
                                    {q.imageOriginalUrl ? (
                                        <a
                                            href={q.imageOriginalUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-blue-300 hover:underline"
                                        >
                                            open original
                                        </a>
                                    ) : (
                                        <span className="text-gray-400">no image</span>
                                    )}
                                </div>
                                <div className="flex items-center space-x-2">
                                    <span className="font-semibold text-gray-400">ID:</span>
                                    <span className="truncate max-w-[160px] text-gray-300">{q._id}</span>
                                </div>
                                {!isSmallCard && (
                                    <>
                                        <div>
                                            <span className="font-semibold text-gray-400">Subject:</span>{" "}
                                            {q.subject || "—"}
                                        </div>
                                        <div>
                                            <span className="font-semibold text-gray-400">Time:</span>{" "}
                                            {(q.processingTimeMs / 1000).toFixed(1)}초
                                        </div>
                                        <div>
                                            <span className="font-semibold text-gray-400">Qs:</span>{" "}
                                            {q.validQuestionCount}/{q.numberOfQuestions} valid
                                            {q.validQuestionNumbers?.length > 0 && (
                                                <span className="ml-1 text-gray-300">
                                                    (#{q.validQuestionNumbers.join(", ")})
                                                </span>
                                            )}
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {q.source === "app" ? (
                    <div className="bg-gray-800">
                        <UserCell compact={true} user={q.userId} />
                    </div>
                ) : (
                    <div className="flex items-center text-xs h-8 bg-white/5 px-3 space-x-2">
                        <div className="font-semibold text-gray-400">챗봇유저</div>
                        <div className="font-semibold text-white">{q.uploader?.kakaoIdentity} ({q.uploader?.kakaoDailyUploads}개, {prettyDate})</div>
                    </div>
                )}

                {/* SUMMARY ROW */}
                {!isProcessing && !showDetails && (
                    <div className="text-gray-800 h-10 px-1 flex w-full justify-between items-center bg-gray-700">
                        {isQuotaLimit ? (
                            <div className="px-2 text-orange-500 bg-white py-1 rounded font-bold">{q.errorCode}</div>
                        ) : hasError ? (
                            <div className="px-2 text-red-500 bg-white py-1 rounded font-bold">{q.errorCode}</div>
                        ) : (
                            <div onClick={() => setShowDetails((v) => !v)} className="cursor-pointer w-full flex justify-between items-center">
                                <div className="flex flex-wrap gap-1">
                                    <div className="flex gap-1 items-center">
                                        {validCount > 0 && (
                                            <span className="px-2 h-6 flex items-center rounded-lg text-xs font-medium bg-green-100 text-green-700">
                                                풀이완료: {validCount}
                                            </span>
                                        )}
                                        {invalidCount > 0 && (
                                            <span className="px-2 h-6 flex items-center rounded-lg text-xs font-medium bg-red-100 text-red-700 border-red-300">
                                                풀이오류: {invalidCount}
                                            </span>
                                        )}

                                    </div>
                                </div>

                                <div className="text-white text-xs font-semibold h-6 w-6 flex items-center justify-center flex-shrink-0" >
                                    <FaAngleDown />
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* FULL DETAILS (only when toggled) */}
                {!isProcessing && showDetails && (
                    <div onClick={() => setShowDetails((v) => !v)} className="flex-1 text-xs text-black overflow-hidden cursor-pointer">
                        <div className="bg-gray-400 p-2 gap-2">
                            {q.gptAnalyzed?.map((item, i) => {
                                const key = `${qIndex}-${i}`;
                                return (
                                    <div key={key} className="gap-2 mb-2">
                                        {renderQuestionCard(item, key)}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>
        </div >
    );
};

export default UploadCard;
