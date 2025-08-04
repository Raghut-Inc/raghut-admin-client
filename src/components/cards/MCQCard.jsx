const MCQCard = ({ questionItem, isOpen, toggleExpand, expandKey }) => {

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
                <p className="font-semibold">{questionItem?.questionNumber}. {questionItem.questionText}</p>
                <ul className="mt-2 pl-4 list-disc">
                    {questionItem.answers?.map((a, j) => {
                        const isCorrect = questionItem.correctAnswers?.some(
                            (correct) => correct.answerOption === a.answerOption
                        );
                        return (
                            <li
                                key={j}
                                className={isCorrect ? 'font-bold text-green-600' : 'text-gray-500'}
                            >
                                {a.answerOption}. {a.answerText}{' '}({a.answerInKorean})
                            </li>
                        );
                    })}
                </ul>

                <button
                    className="text-indigo-700 underline absolute bottom-0 right-0 text-xs bg-white"
                    onClick={() => toggleExpand(expandKey)}
                >
                    {isOpen ? "접기 ▲" : "더보기 ▼"}
                </button>

            </div>
            {isOpen && (
                <div className="mt-3 text-xs whitespace-pre-line border-t border-gray-300 pt-2">
                    <p style={{ whiteSpace: 'pre-line' }}>
                        {formatExplanation(questionItem.explanation)}
                    </p>
                    {questionItem.wrongChoices?.length > 0 && (
                        <div className="bg-red-50 border border-red-200 rounded-md p-3 mt-3">
                            <p className="font-semibold text-red-500 mb-2">오답</p>
                            <ul className="space-y-2">
                                {questionItem.wrongChoices.map((wc, idx) => (
                                    <li key={idx}>
                                        <p><strong>{wc.answerOption}</strong> - {wc.reason}</p>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default MCQCard;
