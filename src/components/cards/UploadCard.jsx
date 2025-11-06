import { Fragment, useCallback, useMemo, useState } from "react";
import { timeAgo } from "../../utils/timeAgo";
import CardEngShortAnswer from "./CardEngShortAnswer";
import CardEngMCQ from "./CardEngMCQ";
import CardMathMCQ from "./CardMathMCQ";
import CardMathShortAnswer from "./CardMathShortAnswer";
import { renderMixedMath } from "../../utils/latexUtils";
import { FaAngleDown, FaCircleCheck, FaTrashCan } from "react-icons/fa6";
import { MdError } from "react-icons/md";
import { FiCopy } from "react-icons/fi";
import UserCell from "../UserCell";
import clsx from "clsx";

const UploadCard = ({ q, qIndex, onDelete, setFilter }) => {
    const [showDetails, setShowDetails] = useState(false);
    const [copied, setCopied] = useState(false);
    const isQuotaLimit = !!q.errorMessage?.includes("요즘 이용자가 많아져서");

    const handleCopy = () => {
        navigator.clipboard.writeText(q._id);
        setCopied(true);
        setTimeout(() => setCopied(false), 1000);
    };
    // ---- helpers: build tokens without joining into one string
    const shortMathSafe = (s = "", max = 16) => {
        // don't truncate if looks like math
        if (/[\\$]/.test(s)) return s;
        return s.length > max ? s.slice(0, max - 1) + "…" : s;
    };

    const getCorrectTokens = useCallback((item) => {
        if (item?.answers && item?.correctAnswers) {
            const set = new Set(item.correctAnswers.map((c) => c.answerOption));
            return item.answers
                .filter((a) => set.has(a.answerOption))
                .map((a) => a.answerOption);
        }

        if (item?.choices && item?.correctChoices) {
            const set = new Set(item.correctChoices.map((c) => c.choiceLabel));
            return item.choices
                .filter((c) => set.has(c.choiceLabel))
                .map((c) => c.choiceLabel);
        }

        if (item?.expectedAnswer?.length) {
            return item.expectedAnswer.map((a) => shortMathSafe(String(a.answer)));
        }

        return [];
    }, []);

    const summaryItems = useMemo(() => {
        const items = q.gptAnalyzed || [];
        return items.map((it) => {
            const num = it?.questionNumber ?? "?";
            const tokens = getCorrectTokens(it);
            return {
                num,
                tokens,
                valid: tokens.length > 0,
            };
        });
    }, [q.gptAnalyzed, getCorrectTokens]);


    // existing renderQuestionCard stays as-is for the detail view
    const renderQuestionCard = (item, key) => {
        const isSci = q.subject === "math" || q.subject === "physics" || q.subject === "chemistry";
        if (isSci) {
            return item.questionType === "ShortAnswer" ? (
                <CardMathShortAnswer key={key} questionItem={item} isOpen />
            ) : (
                <CardMathMCQ key={key} questionItem={item} isOpen />
            );
        } else {
            return item.questionType === "ShortAnswer" ? (
                <CardEngShortAnswer key={key} questionItem={item} isOpen />
            ) : (
                <CardEngMCQ key={key} questionItem={item} isOpen />
            );
        }
    };

    return (
        <div key={qIndex} className="max-w-xl overflow-hidden shadow-sm bg-white w-full">
            <div className={`${q.status === "processing" ? "opacity-80" : isQuotaLimit ? "bg-gray-700 border-[5px] border-orange-500 " : q.status !== "processing" && q.validQuestionCount === 0 ? "border-[5px] border-red-700" : ""} bg-gray-700 flex flex-col w-full text-white text-xs`}>
                <div className="flex w-full h-full">
                    {/* Image Preview */}
                    <div
                        className={clsx(
                            "flex-shrink-0 flex justify-start items-center bg-black transition-all duration-200",
                            q.status === "processing"
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
                                        q.status === "processing" ? "w-full h-28" : "w-full max-h-64"
                                    )}
                                />
                            </a>
                        )}
                    </div>


                    {/* Quota limit check */}
                    {isQuotaLimit ? (
                        <div className="w-full h-full flex items-center justify-center font-bold text-2xl p-3 text-orange-400">
                            QUOTA LIMIT
                        </div>
                    ) : (
                        <div className="w-full h-full flex flex-col justify-start p-3">
                            <div className="flex flex-col">
                                <div className="w-full flex justify-between items-center">
                                    <div className="flex space-x-2 items-center">
                                        {/* Status Icon */}
                                        {q.status === "processing" ? (
                                            <div className="flex justify-center items-center">
                                                <svg aria-hidden="true" className="w-5 h-5 text-gray-500 animate-spin dark:text-gray-600 fill-white" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                    <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor" />
                                                    <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentFill" />
                                                </svg>
                                            </div>
                                        ) : q.validQuestionCount > 0 ? (
                                            <FaCircleCheck className="w-7 h-7 text-indigo-500 p-px bg-white rounded-full" />
                                        ) : (
                                            <MdError className="w-7 h-7 text-red-500 p-px bg-white rounded-full" />
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

                                {/* Compact for processing */}
                                {q.status === "processing" ? (
                                    <div className="flex flex-col mt-3 text-xs text-white space-y-1">
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
                                            <span className="font-semibold text-gray-400">ID:</span>
                                            <span className="truncate max-w-[160px] text-gray-300">{q._id}</span>
                                        </div>
                                    </div>
                                ) : (
                                    /* Full Details */
                                    <div className="flex flex-col mt-5 text-xs text-white space-y-1">
                                        <div>
                                            <span className="font-semibold text-gray-400">Time:</span>{" "}
                                            {(q.processingTimeMs / 1000).toFixed(1)}초
                                        </div>
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
                                        <div>
                                            <span className="font-semibold text-gray-400">Subject:</span>{" "}
                                            {q.subject || "—"}
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
                                        <div>
                                            <span className="font-semibold text-gray-400">Status:</span>{" "}
                                            {q.status}
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
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                <div className="bg-gray-800">
                    <UserCell compact={true} user={q.userId} onFilter={setFilter} stats={q.userId?.stats || {}} />
                </div>


                {/* SUMMARY ROW */}
                {!isQuotaLimit && q.status !== "processing" && !showDetails && (
                    <div onClick={() => setShowDetails((v) => !v)} className="text-gray-800 h-10 px-1 flex w-full justify-between items-center bg-gray-700 cursor-pointer">
                        <div className="flex flex-wrap gap-1">
                            {summaryItems.slice(0, 3).map((item, idx) => (
                                <span
                                    key={idx}
                                    className={`px-1.5 h-8 items-center flex rounded text-xs font-medium border overflow-hidden max-w-24 truncate ${item.valid
                                            ? "bg-green-100 text-green-700 border-green-300"
                                            : "bg-red-100 text-red-700 border-red-300"
                                        }`}
                                    title={item.valid ? "Valid" : "Invalid"}
                                >
                                    #{item.num}{" "}
                                    <span className="opacity-75">
                                        (
                                        {item.tokens.length === 0 ? (
                                            "-"
                                        ) : (
                                            item.tokens.map((tok, i) => (
                                                <Fragment key={i}>
                                                    {i > 0 && " / "}
                                                    {renderMixedMath(tok)}
                                                </Fragment>
                                            ))
                                        )}
                                        )
                                    </span>
                                </span>
                            ))}

                            {summaryItems.length > 3 && (
                                <span className="px-2 h-8 flex items-center rounded text-xs font-medium bg-gray-200 text-gray-700 border border-gray-300">
                                    +{summaryItems.length - 3}
                                </span>
                            )}
                        </div>

                        <div className="text-white text-xs font-semibold h-6 w-6 flex items-center justify-center flex-shrink-0" >
                            <FaAngleDown />
                        </div>

                    </div>
                )}

                {/* FULL DETAILS (only when toggled) */}
                {q.status !== "processing" && showDetails && (
                    <div onClick={() => setShowDetails((v) => !v)} className="flex-1 text-xs text-black overflow-hidden cursor-pointer">
                        {q.status === "processing" ? (
                            <div className="flex justify-center items-center p-2">
                                <svg aria-hidden="true" className="w-4 h-4 text-gray-500 animate-spin dark:text-gray-600 fill-white" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor" />
                                    <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentFill" />
                                </svg>
                                <span className="ml-2 text-white italic">Processing...</span>
                            </div>
                        ) : (
                            <div className="bg-white p-1">
                                {q.errorMessage && (
                                    <div className="bg-yellow-50 border border-yellow-300 rounded-md p-3 mt-1">
                                        <p className="font-semibold text-yellow-700">ERROR</p>
                                        <p>{q.errorMessage}</p>
                                    </div>
                                )}
                                {q.gptAnalyzed?.map((item, i) => {
                                    const key = `${qIndex}-${i}`;
                                    return (
                                        <div key={key} className="bg-white p-2 relative">
                                            {renderQuestionCard(item, key)}
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default UploadCard;
