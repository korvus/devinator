import React from "react";

const Proposal = ({ word, answer, onLetter }) => {

  let suggestionsIndex = answer.letters.map(letter => letter.suggestionIndex);
  suggestionsIndex = suggestionsIndex.filter(suggestion => suggestion !== null);

  return (
    <div className="proposal">
      {word.suggestion.map((suggestionLetter, suggestionIndex) => (
        <div
          key={suggestionIndex}
          onClick={() => {
            if(!suggestionsIndex.includes(suggestionIndex)) onLetter(suggestionIndex, answer.focusedLetter); 
          }}
          className={`proposaletter ${suggestionsIndex.includes(suggestionIndex) ? "locked" : ""}`}
        >
          {suggestionLetter}
        </div>
      ))}
    </div>
  );
};

export default Proposal;
