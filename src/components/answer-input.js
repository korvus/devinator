import React from "react";
import { lettersMatch } from "../utils";

function filterValue(str, index, word) {
  return str.toLowerCase().slice(0, 1);
}

const AnswerInput = ({ word, answer, onLetter }) => {
  const handleChange = (value, answerIndex) => {
    const suggestionIndex = word.suggestion.findIndex((letter) =>
      lettersMatch(letter, value)
    );
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
        />
      ))}
    </div>
  );
};

const AnswerInputLetter = ({ letter, onChange, index }) => {
  const handleChange = (event) => {
    onChange(filterValue(event.target.value), index);
  };

  return (
    <input
      type="text"
      className="letter"
      value={letter}
      onChange={handleChange}
    />
  );
};

export default AnswerInput;
