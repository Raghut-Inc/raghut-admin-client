import { renderMixedMath } from "../../utils/latexUtils";

const CardEngShortAnswer = ({ questionItem }) => {
    const qn = questionItem?.questionNumber ?? "-";
    const hasError = !!questionItem?.error;
    const invalidReason = questionItem?.invalidReason

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
                            SA
                        </span>
                    </div>


                    <div className="min-w-0 flex-1">
                        <div className="flex items-start gap-2">
                            <p className="min-w-0 text-xs font-semibold text-gray-800 line-clamp-2">
                                <span className="mr-1 text-gray-400">{qn}.</span>
                                {renderMixedMath(questionItem?.questionText)}
                            </p>
                        </div>

                        {/* Answer chips */}
                        {!!questionItem?.expectedAnswer?.length && (
                            <div className="mt-2 flex flex-wrap gap-1.5">
                                {questionItem.expectedAnswer.map((ans, idx) => (
                                    <span
                                        key={idx}
                                        className="inline-flex items-center rounded-md border border-green-200 bg-green-600/10 px-2 py-1 text-[11px] font-semibold text-green-700"
                                    >
                                        {renderMixedMath(ans?.answer)}
                                    </span>
                                ))}
                            </div>
                        )}
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

            {/* Expanded */}
            {!hasError && (
                <div className="border-gray-100 space-y-3">
                    {/* Reasons / Source */}
                    {!!questionItem?.expectedAnswer?.length && (
                        <div className="space-y-2  p-3 border-b">
                            {questionItem.expectedAnswer.map((ans, idx) => (
                                <div key={idx} className="rounded-lg bg-gray-50">
                                    {ans?.reason && (
                                        <p className="text-[11px] text-gray-700 leading-relaxed">
                                            <span className="font-semibold text-gray-800">이유:</span>{" "}
                                            {renderMixedMath(ans.reason)}
                                        </p>
                                    )}

                                    {ans?.sourceText && (
                                        <p className="mt-1 text-[11px] text-gray-600 leading-relaxed">
                                            <span className="font-semibold text-gray-800">출처:</span>{" "}
                                            {renderMixedMath(ans.sourceText)}
                                        </p>
                                    )}

                                    {!ans?.reason && !ans?.sourceText && (
                                        <p className="text-[11px] text-gray-500">추가 설명 없음</p>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Explanation */}
                    {questionItem?.explanation && (
                        <div className="rounded-lg p-3">
                            <p className="mb-1 text-[11px] font-semibold text-gray-700">
                                해설 <span className="text-gray-400">(Explanation)</span>
                            </p>
                            <div className="text-[11px] leading-relaxed text-gray-700 whitespace-pre-line">
                                {renderMixedMath(questionItem.explanation)}
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Error */}
            {hasError && (
                <div className="mt-4 rounded-lg border border-yellow-200 bg-yellow-50 p-3">
                    <p className="text-[11px] font-semibold text-yellow-800">ERROR</p>
                    <p className="mt-1 text-[11px] text-yellow-800/90 whitespace-pre-line">
                        {questionItem.error}
                    </p>
                </div>
            )}
        </div>
    );
};

export default CardEngShortAnswer;
