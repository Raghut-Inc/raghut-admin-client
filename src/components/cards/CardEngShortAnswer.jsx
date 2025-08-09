const CardEngShortAnswer = ({ questionItem, isOpen, toggleExpand, expandKey }) => {
    return (
        <div className="flex-1 text-xs text-black rounded overflow-hidden">
            <div className='relative w-full h-full'>
                <p className="font-semibold">{questionItem.questionNumber}. {questionItem.questionText}</p>
                {questionItem.expectedAnswer?.map((ans, idx) => (
                    <div key={idx} className="">
                        <p>
                            <strong className="text-green-600">{ans.answer}</strong>{" "}
                            <span className="text-gray-600">({ans.answerInKorean})</span>
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
                    {questionItem.expectedAnswer?.map((ans, idx) => (
                        <div key={idx} className="mb-2">
                            {ans.reason && <p className="text-xs text-gray-500">이유: {ans.reason}</p>}
                            {ans.sourceText && <p className="text-xs text-gray-500">출처: {ans.sourceText}</p>}
                        </div>
                    ))}
                    {questionItem.explanation}
                </div>
            )}
        </div>
    );
};

export default CardEngShortAnswer;
