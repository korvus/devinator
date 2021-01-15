import React from "react";

const AnswerInput = ({ answer }) => {

  return (
    <div className="propal">
      {answer.letters.map(({ letter }, index) => (
          <input
            key={index}
            type="text"
            className={`letter ${index === answer.focusedLetter ? `focused` : ''}`}
            value={letter}
            readOnly
          />
      ))}
    </div>
  );
};

export default AnswerInput;
