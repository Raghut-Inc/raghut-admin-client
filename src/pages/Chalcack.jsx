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
                    setQuestions(data.questions);
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
        <div className="max-w-5xl mx-auto p-6 space-y-8">
            <h1 className="text-2xl font-bold">🧾 Chalcack 문제 기록</h1>
            {questions.map((q, qIndex) => (
                <div key={qIndex} className="border border-gray-300 rounded-xl overflow-hidden shadow-sm bg-white">
                    <div className="flex flex-col">
                        <a href={q.imageUrl} target="_blank" rel="noopener noreferrer">
                            <img
                                src={q.imageUrl}
                                alt="Captured"
                                className="w-full md:w-64 object-contain border-b md:border-b-0 md:border-r cursor-pointer"
                            />
                        </a>
                        <div className="flex-1 p-4 space-y-4">
                            <p className="text-sm text-gray-500">🕒 {new Date(q.createdAt).toLocaleString()}</p>
                            {q.gptAnalyzed.map((item, i) => {
                                const key = `${qIndex}-${i}`;
                                const isOpen = expanded[key];
                                return (
                                    <div key={i} className="bg-gray-50 p-3 rounded border-l-4 border-blue-400">
                                        <p className="font-semibold">{item.questionText}</p>
                                        <ul className="mt-2 pl-4 list-disc text-sm">
                                            {item.answers.map((a, j) => (
                                                <li key={j}>
                                                    {a.answerOption}. {a.answerText} — <span className="text-gray-500">{a.answerInKorean}</span>
                                                </li>
                                            ))}
                                        </ul>
                                        <p className="mt-2 text-green-700 text-sm">
                                            ✅ 정답: {item.correctAnswer.answerOption} — {item.correctAnswer.answerText}
                                        </p>

                                        <button
                                            className="mt-2 text-sm text-blue-500 underline"
                                            onClick={() => toggleExpand(key)}
                                        >
                                            {isOpen ? '설명 닫기 🔽' : '설명 보기 🔼'}
                                        </button>

                                        {isOpen && (
                                            <>
                                                <p className="text-sm text-gray-500">{item.questionInKorean}</p>

                                                <p className="mt-2 text-sm text-gray-700 whitespace-pre-wrap">{item.explanation}</p>
                                                {item.vocabTips?.length > 0 && (
                                                    <div className="mt-2 text-sm">
                                                        <p className="font-semibold text-blue-600">📚 단어 정리</p>
                                                        <ul className="pl-4 list-disc">
                                                            {item.vocabTips.map((v, k) => (
                                                                <li key={k}>
                                                                    <strong>{v.word}</strong>: {v.meaning} — <span className="text-gray-500">{v.note}</span>
                                                                </li>
                                                            ))}
                                                        </ul>
                                                    </div>
                                                )}
                                            </>
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
