// CardMathMCQ.jsx
import { renderMixedMath } from "../../utils/latexUtils";

const CardMathMCQ = ({ questionItem, isOpen, toggleExpand, expandKey }) => {
    return (
        <div>
            <div className="relative w-full h-full">
                <p className="text-xs text-gray-500">[{questionItem.questionType}]</p>
                <p className="font-semibold">
                    {questionItem?.questionNumber}. {renderMixedMath(questionItem.questionText)}
                </p>

                <ul className="mt-2 pl-4 list-disc">
                    {questionItem.choices?.map((choice, i) => {
                        const isCorrect = questionItem.correctChoices?.some(
                            (c) => c.choiceLabel === choice.choiceLabel
                        );
                        return (
                            <li
                                key={i}
                                className={isCorrect ? "font-bold text-green-600" : "text-gray-500"}
                            >
                                {choice.choiceLabel}.{" "}
                                <span>
                                    {renderMixedMath(choice.choiceText)}{" "}
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
                <div className="mt-3 text-xs border-t border-gray-300 pt-2">
                    <div>
                        <p className="font-semibold mb-1">풀이 단계 (Solution Steps):</p>
                        {questionItem.solutionSteps?.map((step) => (
                            <div key={step.stepNumber} className="mb-3 whitespace-pre-line">
                                <p className="font-semibold">
                                    {step.stepNumber}. {step.stepTitle}
                                </p>
                                <p>{renderMixedMath(step.stepExplanation)}</p>
                            </div>
                        ))}
                    </div>

                    {questionItem.incorrectChoices?.length > 0 && (
                        <div className="bg-red-50 border border-red-200 rounded-md p-3 mt-3">
                            <p className="font-semibold text-red-500 mb-2">오답 (Incorrect Choices)</p>
                            <ul className="space-y-2">
                                {questionItem.incorrectChoices.map((wrong, idx) => (
                                    <li key={idx}>
                                        <p>
                                            <strong>{wrong.choiceLabel}</strong> - {renderMixedMath(wrong.choiceText)}
                                        </p>
                                        <p>{renderMixedMath(wrong.reason)}</p>
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
