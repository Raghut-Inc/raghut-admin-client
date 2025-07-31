import MCQCard from './MCQCard';
import ShortAnswerCard from './ShortAnswerCard';

const UploadsCard = ({ q, qIndex, onDelete }) => {
    const questionType = q.gptAnalyzed?.[qIndex]?.questionType;

    if (questionType === 'ShortAnswer') {
        return <ShortAnswerCard q={q} qIndex={qIndex} onDelete={onDelete} />;
    }
    // Default to MCQCard if not short answer
    return <MCQCard q={q} qIndex={qIndex} onDelete={onDelete} />;
};

export default UploadsCard;
