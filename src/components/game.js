import { useCallback, useContext, useEffect, useMemo, useState } from "react";
import { themeSummaries } from "../data/index.js";
import { penduContext } from "../store/index";
import { useThematic } from "../store/thematic";
import { alphabetFR, alphabetSL, shuffle, rand } from "../utils/index.js";
import AnswerInput from "./answer-input";
import Proposal from "./proposal";

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

  const addLetter = useCallback((suggestionIndex, answerIndex) => {
    setCurrentAnswer((answer) => {
      answer[answerIndex] = suggestionIndex;
      return [...answer];
    });
  }, []);

  return [word, fullAnswer, addLetter];
}

function Game() {
  const { thematic, updateThematic } = useThematic();
  const { setLang } = useContext(penduContext);

  const [word, answer, addLetter] = useWordAnswer(thematic);

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
            <span className="eraseAll">Erase All</span>
          </li>
          <li>
            <span className="solve">Solution</span>
          </li>
          <li>
            <span className="jocker1">Jocker</span>
          </li>
        </ul>

        <Proposal word={word} onLetter={handleLetter} />
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
