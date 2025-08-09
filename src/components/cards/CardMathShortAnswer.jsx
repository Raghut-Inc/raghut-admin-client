import React from 'react';

const CardMathShortAnswer = ({ questionItem, isOpen, toggleExpand, expandKey }) => {
    function formatSolutionSteps(steps) {
        if (!steps || steps.length === 0) return "";
        return steps
            .map(
                (step) =>
                    `${step.stepNumber}. ${step.stepTitle}\n${step.stepExplanation}`
            )
            .join("\n\n");
    }

    return (
        <div className="flex-1 text-xs text-black rounded overflow-hidden">
            <div className="relative w-full h-full">
                <p className="font-semibold">
                    {questionItem.questionNumber}. {questionItem.questionText}
                </p>

                {questionItem.expectedAnswer?.map((ans, idx) => (
                    <div key={idx} className="">
                        <p>
                            <strong className="text-green-600">{ans.answer}</strong>
                        </p>
                    </div>
                ))}

                <button
                    className="text-indigo-700 underline absolute bottom-0 right-0 text-xs bg-white px-2 py-1 rounded-lg"
                    onClick={() => toggleExpand(expandKey)}
                >
                    {isOpen ? "접기 ▲" : "더보기 ▼"}
                </button>
            </div>

            {isOpen && (
                <div className="mt-3 text-xs whitespace-pre-line border-t border-gray-300 pt-2">
                    <div>
                        <p className="font-semibold mb-1">풀이 단계 (Solution Steps):</p>
                        <p style={{ whiteSpace: "pre-line" }}>
                            {formatSolutionSteps(questionItem.solutionSteps)}
                        </p>
                    </div>

                    {questionItem.expectedAnswer?.map((ans, idx) => (
                        <div key={idx} className="mb-2">
                            {ans.reason && (
                                <p className="text-xs text-gray-500">이유: {ans.reason}</p>
                            )}
                        </div>
                    ))}

                    {!questionItem.isQuestionValid && (
                        <div className="bg-yellow-50 border border-yellow-300 rounded-md p-3 mt-3">
                            <p className="font-semibold text-yellow-700">
                                문제 유효성 오류 (Invalid Question)
                            </p>
                            <p>이유: {questionItem.invalidReason}</p>
                            <p>제안된 수정: {questionItem.suggestedFix}</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default CardMathShortAnswer;
