import { renderMixedMath } from "../../utils/latexUtils";

const CardEngMCQ = ({ questionItem }) => {
    const qn = questionItem?.questionNumber ?? "-";
    const qt = questionItem?.questionType ?? "mcq";
    const hasError = !!questionItem?.error;
    const invalidReason = questionItem?.invalidReason

    function formatExplanation(explanation) {
        if (!explanation) return "";
        if (typeof explanation === "string") return explanation;

        return [
            explanation.grammarPoint,
            explanation.sentenceInterpretation,
            explanation.contextFit,
            explanation.collocationOrUsage,
            explanation.takeaway,
        ]
            .filter(Boolean)
            .join("\n");
    }

    const correctSet = new Set(
        (questionItem?.correctAnswers ?? []).map((x) => x?.answerOption).filter(Boolean)
    );

    return (
        <div className="w-full rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
            {/* Header */}
            <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
                <div className="gap-2 text-xs flex flex-col items-start">
                    <div className="flex space-x-1 items-center">
                        {!hasError && questionItem?.isQuestionValid === false && (
                            <span className="inline-flex shrink-0 items-center rounded-full bg-orange-50 px-2 py-0.5 text-[10px] font-semibold text-orange-600 border border-orange-200">
                                Invalid
                            </span>
                        )}
                        <span className="mt-0.5 inline-flex shrink-0 items-center rounded-full bg-gray-200 px-2 py-0.5 text-[10px] font-semibold text-gray-700">
                            {String(qt).toUpperCase()}
                        </span>
                    </div>

                    <div className="min-w-0 flex-1">
                        <div className="flex items-start gap-2">
                            <p className="text-xs font-semibold text-gray-800 line-clamp-2">
                                <span className="mr-1 text-gray-400">{qn}.</span>
                                {renderMixedMath(questionItem?.questionText)}
                            </p>

                        </div>
                    </div>
                </div>
            </div>

            {/* Invalid Reason */}
            {!hasError && questionItem?.isQuestionValid === false && invalidReason && (
                <div className="mx-2 mt-3 rounded-lg border border-orange-200 bg-orange-50 px-3 py-2">
                    <p className="text-[11px] font-semibold text-orange-700">
                        문제 무효 사유 <span className="text-orange-500/70">(Invalid Reason)</span>
                    </p>
                    <p className="mt-1 text-[11px] text-orange-800/90 whitespace-pre-line">
                        {invalidReason}
                    </p>
                </div>
            )}

            {/* Choices */}
            <div className="px-2 py-3">
                <ul className="space-y-1.5">
                    {(questionItem?.answers ?? []).map((a, idx) => {
                        const opt = a?.answerOption ?? "?";
                        const isCorrect = correctSet.has(opt);

                        return (
                            <li
                                key={idx}
                                className={`rounded-lg border px-3 py-2 text-[11px] leading-relaxed ${isCorrect
                                    ? "border-green-200 bg-green-50 text-green-800 font-semibold"
                                    : "border-gray-200 bg-white text-gray-700"
                                    }`}
                            >
                                <span className="mr-1 font-semibold">{opt}.</span>{" "}
                                {renderMixedMath(a?.answerText)}
                            </li>
                        );
                    })}
                </ul>
            </div>

            {/* Expanded */}
            {!hasError && (
                <div className="px-2 py-4 border-t border-gray-200 space-y-3">
                    {/* Explanation */}
                    {questionItem?.explanation && (
                        <div>
                            <p className="mb-2 text-[11px] font-semibold text-gray-700">
                                해설 <span className="text-gray-400">(Explanation)</span>
                            </p>
                            <div className="rounded-lg bg-gray-50 p-3 text-[11px] leading-relaxed text-gray-700 whitespace-pre-line">
                                {renderMixedMath(formatExplanation(questionItem.explanation))}
                            </div>
                        </div>
                    )}

                    {/* Wrong choices */}
                    {questionItem?.wrongChoices?.length > 0 && (
                        <div className="rounded-lg border border-red-200 bg-red-50 p-3">
                            <p className="mb-2 text-[11px] font-semibold text-red-700">오답</p>
                            <ul className="space-y-2">
                                {questionItem.wrongChoices.map((wc, idx) => (
                                    <li key={idx} className="text-[11px] text-red-800">
                                        <span className="font-semibold">{wc?.answerOption}</span>{" "}
                                        <span className="text-red-700/80">—</span>{" "}
                                        {renderMixedMath(wc?.reason)}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>
            )}

            {/* Error */}
            {hasError && (
                <div className="m-4 rounded-lg border border-yellow-200 bg-yellow-50 p-3">
                    <p className="text-[11px] font-semibold text-yellow-800">ERROR</p>
                    <p className="mt-1 text-[11px] text-yellow-800/90 whitespace-pre-line">
                        {questionItem.error}
                    </p>
                </div>
            )}
        </div>
    );
};

export default CardEngMCQ;
