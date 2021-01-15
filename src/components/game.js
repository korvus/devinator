import { useCallback, useContext, useEffect, useMemo, useState } from "react";
import { themeSummaries } from "../data/index.js";
import { penduContext } from "../store/index";
import { useThematic } from "../store/thematic";
import { alphabetFR, alphabetSL, shuffle, rand } from "../utils/index.js";
import AnswerInput from "./answer-input";
import Proposal from "./proposal";
import { lettersMatch, extractOnlySuggestionId } from "../utils";

const WORD_DEFAULT = { hint: "", answer: "", suggestion: [] };

function getSuggestion(answer, lang) {
  const letters = lang === "sl" ? alphabetSL : alphabetFR;
  const commonLetters = shuffle(letters).slice(0, 10);
  const suggestion = shuffle(commonLetters + answer).toLowerCase();
  return suggestion.split("");
}

async function fetchWord(thematic) {
  if (!thematic) {
    return WORD_DEFAULT;
  }

  const allWords = await import(`../data/${thematic}.json`);

  const words = Object.entries(allWords);
  const word = words[rand(words.length)];

  return {
    hint: word[0],
    answer: word[1].nom,
    suggestion: getSuggestion(word[1].nom),
  };
}

function getLangFromTheme(thematic) {
  return themeSummaries.filter((params) => params[0] === thematic)[2];
}

function useWordAnswer(thematic) {
  const [word, setWord] = useState(WORD_DEFAULT);
  const [currentAnswer, setCurrentAnswer] = useState([]);

  useEffect(() => {
    let cancelled = false;

    const update = async () => {
      const word = await fetchWord(thematic);
      if (!cancelled) {
        setWord(word);
        setCurrentAnswer(Array(word.answer.length).fill(null));
      }
    };
    update();

    return () => {
      cancelled = true;
    };
  }, [thematic]);

  const fullAnswer = useMemo(
    () => ({
      focusedLetter: currentAnswer.findIndex(
        (suggestionIndex) => suggestionIndex === null
      ),
      letters: currentAnswer.map((suggestionIndex) => ({
        suggestionIndex,
        letter: word.suggestion[suggestionIndex] ?? "",
      })),
    }),
    [currentAnswer, word]
  );

  const jocker = () => {
    const firstUnsolvedIndex = fullAnswer.letters.findIndex((letter, i) => !lettersMatch(letter.letter,word.answer[i]));
    const suggestionsIndex = extractOnlySuggestionId(fullAnswer);
    const suggestionIndex = word.suggestion.findIndex((letter, index) => {
      return lettersMatch(letter, word.answer[firstUnsolvedIndex]) && !suggestionsIndex.includes(index);
    });
    if (suggestionIndex > -1) {
      addLetter(suggestionIndex, firstUnsolvedIndex);
    }
  }

  const solution = () => {
    const suggestionsIndex = [];
    fullAnswer.letters.map((letter, i) => {
      const suggestionIndex = word.suggestion.findIndex((letter, index) => {
        return lettersMatch(letter, word.answer[i]) && !suggestionsIndex.includes(index);
      });
      suggestionsIndex.push(suggestionIndex);
      if (suggestionIndex > -1) {
        addLetter(suggestionIndex, i);
      }
    });
  }

  const resetWord = () => {
    setCurrentAnswer(Array(word.answer.length).fill(null));
  }

  const addLetter = useCallback((suggestionIndex, answerIndex) => {
    setCurrentAnswer((answer) => {
      answer[answerIndex] = suggestionIndex;
      return [...answer];
    });
  }, []);

  useEffect(() => {
    const handleKeydown = (value) => {
      if(value.which === 8){
        const nbFilled = currentAnswer.filter(indexSuggestion => indexSuggestion !== null).length;
        
        const afterRemovedLastLetter = currentAnswer.map((indexSuggestion, i) => {
          return i < nbFilled - 1 ? indexSuggestion : null;
        })
        setCurrentAnswer(afterRemovedLastLetter);
        
      }
      const suggestionsIndex = extractOnlySuggestionId(fullAnswer);
      const suggestionIndex = word.suggestion.findIndex((letter, index) => {
        return lettersMatch(letter, value.key) && !suggestionsIndex.includes(index);
      });
      if (suggestionIndex > -1) {
        addLetter(suggestionIndex, fullAnswer.focusedLetter);
      }
    };
    window.addEventListener("keydown", handleKeydown);
    return () => {
      window.removeEventListener("keydown", handleKeydown);
    };
  }, [addLetter, fullAnswer, word]);

  const actions = {
    resetWord, jocker, solution
  }

  return [word, fullAnswer, addLetter, actions];
}

function Game() {
  const { thematic, updateThematic } = useThematic();
  const { setLang } = useContext(penduContext);

  const [word, answer, addLetter, actions] = useWordAnswer(thematic);

  useEffect(() => {
    setLang(getLangFromTheme(thematic));
  }, [setLang, thematic]);

  const handleLetter = (suggestionIndex, answerIndex) => {
    addLetter(suggestionIndex, answerIndex);
  };

  return (
    <>
      <div className="contentWraper">
        <div className="menu">
          <span onClick={() => updateThematic("home")}>home</span>
        </div>
        <div className="progressBar">
          <div className="bar"></div>
        </div>

        <div className="key">{word.hint}</div>

        <AnswerInput word={word} answer={answer} onLetter={handleLetter} />

        <span className="next">Next</span>
        <ul className="options">
          <li>
            <span onClick={actions.resetWord} className="eraseAll">Erase All</span>
          </li>
          <li>
            <span onClick={actions.solution} className="solve">Solution</span>
          </li>
          <li>
            <span onClick={actions.jocker} className="jocker1">Jocker</span>
          </li>
        </ul>

        <Proposal word={word} answer={answer} onLetter={handleLetter} />
      </div>

      <footer>
        <span
          className="lk restartAll"
          title="will erase the cookie listing if your answered or not to the challenges list"
        >
          erase all statistics from this thematic
        </span>
      </footer>
    </>
  );
}

export default Game;
