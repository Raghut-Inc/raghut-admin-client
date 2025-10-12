import { renderMixedMath } from "../../utils/latexUtils";

const CardEngMCQ = ({ questionItem, isOpen }) => {

    function formatExplanation(explanation) {
        if (!explanation) return "";

        if (typeof explanation === "string") {
            return explanation;
        }

        // Explanation is an object — combine keys
        return [
            explanation.grammarPoint && `${explanation.grammarPoint}`,
            explanation.sentenceInterpretation && `${explanation.sentenceInterpretation}`,
            explanation.contextFit && `${explanation.contextFit}`,
            explanation.collocationOrUsage && `${explanation.collocationOrUsage}`,
            explanation.takeaway && `${explanation.takeaway}`,
        ]
            .filter(Boolean) // remove undefined/null
            .join("\n");
    }


    return (
        <div>
            <div className='relative w-full h-full'>
                <div className="text-xs">
                    <div className="flex gap-1">
                        <span className="text-gray-400">[{questionItem.questionType}]</span>
                        <span className="font-semibold line-clamp-1">
                            {questionItem?.questionNumber}. {renderMixedMath(questionItem.questionText)}
                        </span>
                    </div>
                    <ul className="pl-4 list-disc">
                        {questionItem.answers?.map((a, j) => {
                            const isCorrect = questionItem.correctAnswers?.some(
                                (correct) => correct.answerOption === a.answerOption
                            );
                            return (
                                <li
                                    key={j}
                                    className={`leading-tight ${isCorrect ? 'font-semibold text-green-600' : 'text-gray-600'}`}
                                >
                                    {a.answerOption}. {renderMixedMath(a.answerText)}
                                </li>
                            );
                        })}
                    </ul>
                </div>


            </div>
            {isOpen && !questionItem.error && (
                <div className="mt-3 text-xs whitespace-pre-line border-t border-gray-300 pt-2">
                    <p style={{ whiteSpace: 'pre-line' }}>
                        {renderMixedMath(formatExplanation(questionItem.explanation))}
                    </p>
                    {questionItem.wrongChoices?.length > 0 && (
                        <div className="bg-red-50 border border-red-200 rounded-md p-3 mt-3">
                            <p className="font-semibold text-red-500 mb-2">오답</p>
                            <ul className="space-y-2">
                                {questionItem.wrongChoices.map((wc, idx) => (
                                    <li key={idx}>
                                        <p><strong>{wc.answerOption}</strong> - {renderMixedMath(wc.reason)}</p>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>
            )}

            {isOpen && questionItem.error && (
                <div className="bg-yellow-50 border border-yellow-300 rounded-md p-3 mt-1">
                    <p className="font-semibold text-yellow-700">ERROR</p>
                    <p>{questionItem.error}</p>
                </div>
            )}
        </div>
    );
};

export default CardEngMCQ;
