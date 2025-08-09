import React from 'react';

const CardMathMCQ = ({ questionItem, isOpen, toggleExpand, expandKey }) => {
    // Format solution steps into readable string with line breaks
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
        <div>
            <div className="relative w-full h-full">
                <p className="font-semibold">
                    {questionItem?.questionNumber}. {questionItem.questionText}
                </p>

                <ul className="mt-2 pl-4 list-disc">
                    {questionItem.choices?.map((choice, i) => {
                        const isCorrect = questionItem.correctChoices?.some(
                            (c) => c.choiceLabel === choice.choiceLabel
                        );
                        return (
                            <li
                                key={i}
                                className={isCorrect ? 'font-bold text-green-600' : 'text-gray-500'}
                            >
                                {choice.choiceLabel}.{" "}
                                <span>
                                    {choice.choiceText}{" "}
                                    {choice.choiceInLaTeX && (
                                        <code className="bg-gray-100 px-1 rounded">{choice.choiceInLaTeX}</code>
                                    )}
                                </span>
                            </li>
                        );
                    })}
                </ul>

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
                        <p style={{ whiteSpace: 'pre-line' }}>
                            {formatSolutionSteps(questionItem.solutionSteps)}
                        </p>
                    </div>

                    {questionItem.incorrectChoices?.length > 0 && (
                        <div className="bg-red-50 border border-red-200 rounded-md p-3 mt-3">
                            <p className="font-semibold text-red-500 mb-2">오답 (Incorrect Choices)</p>
                            <ul className="space-y-2">
                                {questionItem.incorrectChoices.map((wrong, idx) => (
                                    <li key={idx}>
                                        <p>
                                            <strong>{wrong.choiceLabel}</strong> - {wrong.reason}
                                        </p>
                                        {wrong.choiceInLaTeX && (
                                            <p>
                                                <code className="bg-gray-100 px-1 rounded">{wrong.choiceInLaTeX}</code>
                                            </p>
                                        )}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {!questionItem.isQuestionValid && (
                        <div className="bg-yellow-50 border border-yellow-300 rounded-md p-3 mt-3">
                            <p className="font-semibold text-yellow-700">문제 유효성 오류 (Invalid Question)</p>
                            <p>이유: {questionItem.invalidReason}</p>
                            <p>제안된 수정: {questionItem.suggestedFix}</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default CardMathMCQ;
