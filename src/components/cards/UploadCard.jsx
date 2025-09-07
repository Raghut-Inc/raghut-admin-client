import { Fragment, useCallback, useMemo, useState } from "react";
import QuestionMetaInfo from "./QuestionMetaInfo";
import { timeAgo } from "../../utils/timeAgo";
import CardEngShortAnswer from "./CardEngShortAnswer";
import CardEngMCQ from "./CardEngMCQ";
import CardMathMCQ from "./CardMathMCQ";
import CardMathShortAnswer from "./CardMathShortAnswer";
import { renderMixedMath } from "../../utils/latexUtils";

const UploadCard = ({ q, qIndex, onDelete, setFilter }) => {
    const [showDetails, setShowDetails] = useState(false);

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
                <CardMathShortAnswer key={key} questionItem={item} isOpen toggleExpand={() => { }} expandKey={key} />
            ) : (
                <CardMathMCQ key={key} questionItem={item} isOpen toggleExpand={() => { }} expandKey={key} />
            );
        } else {
            return item.questionType === "ShortAnswer" ? (
                <CardEngShortAnswer key={key} questionItem={item} isOpen toggleExpand={() => { }} expandKey={key} />
            ) : (
                <CardEngMCQ key={key} questionItem={item} isOpen toggleExpand={() => { }} expandKey={key} />
            );
        }
    };

    return (
        <div key={qIndex} className="max-w-xl overflow-hidden shadow-sm bg-white w-full">
            {/* top bar unchanged */}
            <div
                className={`${q.validQuestionCount > 0 ? "bg-indigo-500" : "bg-red-500"
                    } text-white text-xs font-medium px-1 py-1 flex justify-between items-center w-full`}
            >
                <div className="flex items-center gap-1">
                    <button
                        onClick={() => setShowDetails((v) => !v)}
                        className="bg-white/10 hover:bg-white/20 text-white text-xs font-semibold rounded px-2 py-1"
                    >
                        {showDetails ? "요약" : "펼치기"}
                    </button>
                    <div className="text-white text-xs" title="Click to open solved question">
                        <button
                            onClick={() => window.open(`https://chalcack.com/solved/${q._id}`, "_blank")}
                            className="px-2 py-1 bg-white rounded text-indigo-500 text-xs font-medium"
                        >
                            찰칵
                        </button>
                    </div>
                </div>

                <div className="flex space-x-1 items-center">
                    <div className="text-white text-xs">{q.subject}</div>
                    <span>·</span>
                    <span>{q.validQuestionCount === 0 ? "X" : `${q.validQuestionCount}/${q.numberOfQuestions}q`}</span>
                    <span>·</span>
                    <span>{`${timeAgo(q.createdAt)} (${new Date(q.createdAt).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                        hour12: true,
                    })})`}</span>
                </div>

                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        onDelete(q._id);
                    }}
                    className="bg-red-500 hover:bg-red-600 text-white text-xs font-semibold rounded px-3 py-1"
                >
                    삭제
                </button>
            </div>

            <div className="flex flex-col w-full bg-gray-800 p-1 text-white text-xs space-y-1">
                <QuestionMetaInfo q={q} onDelete={onDelete} timeAgo={timeAgo} setFilter={setFilter} />

                {/* SUMMARY ROW */}
                {!showDetails && (
                    <div className="text-gray-800 rounded">
                        <div className="flex flex-wrap gap-1">
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
                    </div>
                )}

                {/* FULL DETAILS (only when toggled) */}
                {showDetails && (
                    <div className="flex-1 text-xs text-black rounded overflow-hidden">
                        {q.status === "processing" ? (
                            <div className="flex justify-center bg-gray-50 items-center p-4">
                                <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-r-2 border-indigo-500"></span>
                                <span className="ml-2 text-indigo-500 italic">Processing...</span>
                            </div>
                        ) : (
                            q.gptAnalyzed?.map((item, i) => {
                                const key = `${qIndex}-${i}`;
                                return (
                                    <div key={key} className="bg-gray-50 p-3 relative">
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
