'use client'

import React, { useEffect, useState } from 'react';

const Chalcack = () => {
    const [questions, setQuestions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [expanded, setExpanded] = useState({}); // { "qIndex-i": true }

    useEffect(() => {
        const loadQuestions = async () => {
            try {
                const res = await fetch(`${process.env.REACT_APP_API_URL}/solved-questions`);
                const data = await res.json();
                if (data.success) {
                    // Get the last 25 questions if there are more than 25
                    const first25Questions = data.questions.slice(0, 25);
                    setQuestions(first25Questions);
                    console.log(first25Questions)
                } else {
                    console.error('Failed to load questions');
                }
            } catch (err) {
                console.error('❌ API error:', err);
            } finally {
                setLoading(false);
            }
        };

        loadQuestions();
    }, []);


    const toggleExpand = (key) => {
        setExpanded((prev) => ({
            ...prev,
            [key]: !prev[key],
        }));
    };

    if (loading) return <div className="p-10 text-center">📡 불러오는 중...</div>;

    return (
        <div className="max-w-5xl mx-auto py-4 space-y-4 font-sans">
            <h1 className="text-xl font-medium">🧾 찰칵 문제 기록</h1>
            {questions.map((q, qIndex) => (
                <div key={qIndex} className="border border-gray-300 rounded-xl overflow-hidden shadow-sm bg-white">
                    <div className="flex flex-col md:flex-row">
                        <div className='flex flex-col w-full md:w-64 bg-gray-200'>
                            <div className="relative">
                                <a href={q.imageUrl} target="_blank" rel="noopener noreferrer">
                                    <img
                                        src={q.imageUrl}
                                        alt="Captured"
                                        className="w-full max-h-64 object-contain object-center cursor-pointer"
                                    />
                                </a>
                                <div className={`${q.gptAnalyzed?.[0]?.questionText.includes("문제가 감지되지 않았습니다") ? "bg-red-500" : "bg-indigo-500"} absolute top-2 left-2 text-white text-xs font-medium px-3 py-1.5 rounded-lg`}>
                                    {q.gptAnalyzed?.[0]?.questionText.includes("문제가 감지되지 않았습니다") ? "문제 인식 안됨" : `${q.gptAnalyzed?.length || 0} 문제 인식됨`}
                                </div>
                            </div>
                            <div className="bg-gray-700 p-2 text-xs text-white space-y-1">
                                <div className="flex gap-2">
                                    <span className="min-w-[60px]">🕒 Time:</span>
                                    <span>{new Date(q.createdAt).toLocaleString()}</span>
                                </div>
                                <div className="flex gap-2">
                                    <span className="min-w-[60px]">🧑‍💻 UID:</span>
                                    <span>{q.userId || 'N/A'}</span>
                                </div>
                                <div className="flex gap-2">
                                    <span className="min-w-[60px]">🆔 RID:</span>
                                    <span>{q.requestId}</span>
                                </div>
                                {q.metadata?.ip && (
                                    <div className="flex gap-2">
                                        <span className="min-w-[60px]">📍 IP:</span>
                                        <span>{q.metadata.ip}</span>
                                    </div>
                                )}
                                {q.metadata?.userAgent && (
                                    <div className="flex gap-2">
                                        <span className="min-w-[60px]">🧾 U/A:</span>
                                        <span>{q.metadata.userAgent.slice(0, 100)}</span>
                                    </div>
                                )}
                                {q.metadata?.userInfo && (
                                    <div className="flex gap-2">
                                        <span className="min-w-[60px]">👤 Info:</span>
                                        <span>{q.metadata.userInfo}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className="flex-1 space-y-3">
                            {q.gptAnalyzed.map((item, i) => {
                                const key = `${qIndex}-${i}`;
                                const isOpen = expanded[key];
                                return (
                                    <div key={i} className="bg-gray-50 p-3 rounded border-l-4 border-blue-400">
                                        <p className="font-semibold">{item.questionText}</p>
                                        <ul className="mt-2 pl-4 list-disc text-sm">
                                            {item.answers.map((a, j) => {
                                                const isCorrect = item.correctAnswers?.some(
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
                                            className="mt-2 text-sm text-blue-500 underline"
                                            onClick={() => toggleExpand(key)}
                                        >
                                            {isOpen ? '설명 닫기 🔽' : '설명 보기 🔼'}
                                        </button>

                                        {isOpen && (
                                            <div className="mt-3 space-y-2 text-sm text-gray-700">
                                                <p className="text-sm text-gray-500">🈶 {item.questionInKorean}</p>

                                                <div className="bg-white border rounded-md p-3 space-y-1">
                                                    <p><strong>📌 문법 포인트:</strong> {item.explanation.grammarPoint}</p>
                                                    <p><strong>📖 문장 해석:</strong> {item.explanation.sentenceInterpretation}</p>
                                                    <p><strong>🧠 문맥상 적절성:</strong> {item.explanation.contextFit}</p>
                                                    <p><strong>🧩 표현/자연스러움:</strong> {item.explanation.collocationOrUsage}</p>
                                                    <p><strong>✅ 기억할 점:</strong> {item.explanation.takeaway}</p>
                                                </div>

                                                {item.wrongChoices?.length > 0 && (
                                                    <div className="bg-red-50 border border-red-200 rounded-md p-3 mt-3">
                                                        <p className="font-semibold text-red-500 mb-2">❌ 틀린 선택지 설명</p>
                                                        <ul className="space-y-2">
                                                            {item.wrongChoices.map((wc, idx) => (
                                                                <li key={idx}>
                                                                    <p><strong>{wc.answerOption}</strong> - {wc.reason}</p>
                                                                    <p className="text-xs text-gray-500 ml-2">🔎 제거 전략: {wc.eliminationStrategy}</p>
                                                                </li>
                                                            ))}
                                                        </ul>
                                                    </div>
                                                )}

                                                {item.vocabTips?.length > 0 && (
                                                    <div className="mt-4 text-sm">
                                                        <p className="font-semibold text-blue-600">📚 단어 정리</p>
                                                        <ul className="pl-4 list-disc mt-1 space-y-1">
                                                            {item.vocabTips.map((v, k) => (
                                                                <li key={k}>
                                                                    <strong>{v.word}</strong>: {v.meaning}{' '}
                                                                    <span className="text-gray-500">({v.note})</span>
                                                                </li>
                                                            ))}
                                                        </ul>
                                                    </div>
                                                )}

                                                {q.extractedContent && (
                                                    <div className="mt-2 text-xs text-gray-400">
                                                        🧾 OCR 원문: {q.extractedContent}
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default Chalcack;
