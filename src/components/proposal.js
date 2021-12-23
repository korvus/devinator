import React from "react";
import { Text } from "../store/lang";
import { extractOnlySuggestionId } from "../utils/index";

const Proposal = ({ word, answer, onLetter, cancel, statusAnswer }) => {

  const suggestionsIndex = extractOnlySuggestionId(answer);

  return (
    <div className="proposal">
      <div 
        className={`proposaletter backspace ${statusAnswer ? "locked" : ""}`}
        onClick={() => {
          if(!statusAnswer) cancel();
        }}
        title={Text({tid: "cancel"})}
      >
        ⇠
      </div>
      {word.suggestion.map((suggestionLetter, suggestionIndex) => (
        <div
          key={suggestionIndex}
          onClick={() => {
            if(!suggestionsIndex.includes(suggestionIndex) && !statusAnswer) onLetter(suggestionIndex, answer.focusedLetter); 
          }}
          className={`proposaletter ${suggestionsIndex.includes(suggestionIndex) ? "locked" : ""} ${statusAnswer ? "locked" : ""}`}
        >
          {suggestionLetter}
        </div>
      ))}
    </div>
  );
};

export default Proposal;
