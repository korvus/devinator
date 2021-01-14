import React from "react";
import { lettersMatch } from "../utils";

function filterValue(str) {
  return str.toLowerCase().slice(-1);
}

const AnswerInput = ({ word, answer, onLetter }) => {
  const handleChange = (value, answerIndex) => {
    const suggestionIndex = word.suggestion.findIndex((letter) => {
      return lettersMatch(letter, value)
    });
    if (suggestionIndex > -1) {
      onLetter(suggestionIndex, answerIndex);
    }
  };

  return (
    <div className="propal">
      {answer.letters.map(({ letter }, index) => (
        <AnswerInputLetter
          key={index}
          letter={letter}
          onChange={handleChange}
          index={index}
          focusedLetter={answer.focusedLetter}
        />
      ))}
    </div>
  );
};

const AnswerInputLetter = ({ letter, onChange, index, focusedLetter }) => {
  const handleChange = (event) => {
    onChange(filterValue(event.target.value), focusedLetter);
  };

  return (
    <input
      type="text"
      className={`letter ${index === focusedLetter ? `focused` : ''}`}
      value={letter}
      readOnly
      onChange={handleChange}
    />
  );
};

export default AnswerInput;
