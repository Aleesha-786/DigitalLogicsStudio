import React from 'react';
import { CheckCircle } from 'lucide-react';

const ShortAnswerBox = ({ answer }) => (
  <div className="short-answer-box">
    <h5 className="short-answer-title">
      <CheckCircle size={20} />
      Answer
    </h5>
    <div className="short-answer-content">
      <p className="answer-text">{answer}</p>
    </div>
  </div>
);

export default ShortAnswerBox;
