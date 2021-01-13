import React from "react";

const Proposal = ({ word, answer, onLetter }) => {
  return (
    <div className="proposal">
      {word.suggestion.map((suggestionLetter, suggestionIndex) => (
        <div
          key={suggestionIndex}
          onClick={() => {
            onLetter(suggestionIndex, answer.focusedLetter);
          }}
          className="proposaletter"
        >
          {suggestionLetter}
        </div>
      ))}
    </div>
  );
};

export default Proposal;
