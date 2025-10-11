import { Fragment, useCallback, useMemo, useState } from "react";
import QuestionMetaInfo from "./QuestionMetaInfo";
import { timeAgo } from "../../utils/timeAgo";
import CardEngShortAnswer from "./CardEngShortAnswer";
import CardEngMCQ from "./CardEngMCQ";
import CardMathMCQ from "./CardMathMCQ";
import CardMathShortAnswer from "./CardMathShortAnswer";
import { renderMixedMath } from "../../utils/latexUtils";
import { FaCircleCheck, FaTrashCan } from "react-icons/fa6";
import { MdError } from "react-icons/md";
import { FiCopy } from "react-icons/fi";

const UploadCard = ({ q, qIndex, onDelete, setFilter }) => {
    const [showDetails, setShowDetails] = useState(false);
    const [copied, setCopied] = useState(false);

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
            <div className="flex flex-col w-full bg-gray-800 text-white text-xs">
                <div className="flex w-full h-full">
                    {/* Image Preview */}
                    <div className="flex-shrink-0 max-w-48 flex justify-start items-center bg-gray-700">
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
                                    className="w-full max-h-64 object-contain cursor-pointer"
                                />

                            </a>
                        )}
                    </div>

                    <div className="w-full h-full flex flex-col justify-start p-3">
                        <div className="flex flex-col">
                            <div className="w-full flex justify-between">
                                <div className="flex space-x-2 items-center">
                                    {q.status !== "processing" && (q.validQuestionCount > 0 ? <FaCircleCheck className="w-7 h-7 text-indigo-500 p-px bg-white rounded-full" /> : <MdError className="w-7 h-7 text-red-500 p-px bg-white rounded-full" />)}
                                    <span>{timeAgo(q.createdAt)}</span>
                                </div>

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

                            <div className="flex flex-col mt-5 text-xs text-white space-y-1">

                                <div>
                                    <span className="font-semibold text-gray-400">Time:</span>{" "}
                                    {(q.processingTimeMs / 1000).toFixed(1)}s
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
                                    <span className="font-semibold text-gray-400">Subject:</span> {q.subject || "—"}
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
                                    <span className="font-semibold text-gray-400">Status:</span> {q.status}
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


                        </div>


                    </div>
                </div>
                <QuestionMetaInfo q={q} timeAgo={timeAgo} setFilter={setFilter} />

                {/* SUMMARY ROW */}
                {!showDetails && (
                    <div className="text-gray-800 rounded p-1">
                        {q.status === "processing" ? (
                            <div className="flex justify-center  items-center p-2">
                                <svg aria-hidden="true" className="w-4 h-4 text-gray-500 animate-spin dark:text-gray-600 fill-white" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor" />
                                    <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentFill" />
                                </svg>
                                <span className="ml-2 text-white italic">Processing...</span>
                            </div>
                        ) : (
                            <div className="flex flex-wrap gap-1">
                                <button
                                    onClick={() => setShowDetails((v) => !v)}
                                    className="bg-white/10 hover:bg-white/20 text-white text-xs font-semibold rounded px-2 py-1"
                                >
                                    {showDetails ? "요약" : "펼치기"}
                                </button>
                                {summaryItems.map((item, idx) => (
                                    <span
                                        key={idx}
                                        className={`px-1.5 py-0.5 rounded text-xs font-medium border ${item.valid
                                            ? "bg-green-100 text-green-700 border-green-300"
                                            : "bg-red-100 text-red-700 border-red-300"
                                            }`}
                                        title={item.valid ? "Valid" : "Invalid"}
                                    >
                                        #{item.num}{" "}
                                        <span className="opacity-75">
                                            ({item.tokens.length === 0 ? "-" : (
                                                item.tokens.map((tok, i) => (
                                                    <Fragment key={i}>
                                                        {i > 0 && " / "}
                                                        {renderMixedMath(tok)}
                                                    </Fragment>
                                                ))
                                            )})
                                        </span>
                                    </span>
                                ))}
                            </div>
                        )}

                    </div>
                )}

                {/* FULL DETAILS (only when toggled) */}
                {showDetails && (
                    <div className="flex-1 text-xs text-black overflow-hidden">
                        {q.status === "processing" ? (
                            <div className="flex justify-center items-center p-2">
                                <svg aria-hidden="true" className="w-4 h-4 text-gray-500 animate-spin dark:text-gray-600 fill-white" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor" />
                                    <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentFill" />
                                </svg>
                                <span className="ml-2 text-white italic">Processing...</span>
                            </div>
                        ) : (
                            q.gptAnalyzed?.map((item, i) => {
                                const key = `${qIndex}-${i}`;
                                return (
                                    <div key={key} className="bg-gray-50 p-1 relative">
                                        <button
                                            onClick={() => setShowDetails((v) => !v)}
                                            className="bg-gray-500 text-white text-xs font-semibold rounded px-2 py-1"
                                        >
                                            닫기
                                        </button>
                                        {renderQuestionCard(item, key)}
                                    </div>
                                );
                            })
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default UploadCard;
