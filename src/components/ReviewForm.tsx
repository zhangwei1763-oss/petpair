import React, { useState } from 'react';
import StarRating from './StarRating';

interface ReviewFormProps {
  onSubmit: (
    ratings: { friendliness: number; punctuality: number; accuracy: number },
    comment: string,
  ) => void;
}

const ReviewForm: React.FC<ReviewFormProps> = ({ onSubmit }) => {
  const [friendliness, setFriendliness] = useState(0);
  const [punctuality, setPunctuality] = useState(0);
  const [accuracy, setAccuracy] = useState(0);
  const [comment, setComment] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(
      { friendliness, punctuality, accuracy },
      comment.trim(),
    );
  };

  const canSubmit = friendliness > 0 && punctuality > 0 && accuracy > 0;

  return (
    <form className="review-form" onSubmit={handleSubmit}>
      {/* 友好度评分 */}
      <div className="form-group">
        <label>友好度</label>
        <StarRating value={friendliness} onChange={setFriendliness} />
      </div>

      {/* 守时评分 */}
      <div className="form-group">
        <label>守时</label>
        <StarRating value={punctuality} onChange={setPunctuality} />
      </div>

      {/* 描述准确度评分 */}
      <div className="form-group">
        <label>描述准确度</label>
        <StarRating value={accuracy} onChange={setAccuracy} />
      </div>

      {/* 文字评价 */}
      <div className="form-group">
        <label>文字评价</label>
        <textarea
          className="form-textarea"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="分享你们的遛宠体验..."
          rows={4}
        />
      </div>

      {/* 提交按钮 */}
      <button
        type="submit"
        className="btn btn-primary"
        disabled={!canSubmit}
      >
        提交评价
      </button>
    </form>
  );
};

export default ReviewForm;
