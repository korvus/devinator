import { useCallback, useContext, useEffect, useMemo, useState, useRef } from "react";
import { themeSummaries } from "../data/index.js";
import { penduContext } from "../store/index";
import { useThematic } from "../store/thematic";
import { alphabetFR, alphabetSL, shuffle, rand } from "../utils/index.js";
import AnswerInput from "./answer-input";
import Proposal from "./proposal";
import Completed from "./completed";
import { lettersMatch, extractOnlySuggestionId, extractIndexBaseOnFalse, getPercent } from "../utils";

const WORD_DEFAULT = { hint: "", answer: "", suggestion: [] };
const THEMATIC_DEFAULT = {unsolved:10, totalThematic: 0};

function getSuggestion(answer, lang) {
  const letters = lang === "sl" ? alphabetSL : alphabetFR;
  const commonLetters = shuffle(letters).slice(0, 10);
  const suggestion = shuffle(commonLetters + answer).toLowerCase();
  return suggestion.split("");
}

async function fetchWord(thematic, progress, upProgression) {
  if (!thematic || !progress) {
    return [WORD_DEFAULT, THEMATIC_DEFAULT];
  }

  const allWords = await import(`../data/${thematic}.json`);

  if(Object.keys(progress).length === 0){
    console.log(upProgression);
    upProgression(thematic);
    return [WORD_DEFAULT, THEMATIC_DEFAULT];
  }

  const listAllWords = JSON.parse(progress)[thematic];
  if(!listAllWords){
    return [WORD_DEFAULT, THEMATIC_DEFAULT];
  }
  const unsolvedIndexWords = extractIndexBaseOnFalse(listAllWords);

  const words = Object.entries(allWords.default);
  const randomNumber = rand(unsolvedIndexWords.length);

  const wordIndex = unsolvedIndexWords[randomNumber];
  const word = words[wordIndex];

  if(unsolvedIndexWords.length === 0){
    return [WORD_DEFAULT,  {
      unsolved: unsolvedIndexWords.length,
      totalThematic: listAllWords.length,
    }];
  }

  return [{
    index: wordIndex,
    hint: word[0],
    answer: word[1].nom,
    suggestion: getSuggestion(word[1].nom),
  }, {
    unsolved: unsolvedIndexWords.length,
    totalThematic: listAllWords.length,
  }];
}

function getLangFromTheme(thematic) {
  return themeSummaries.filter((params) => params[0] === thematic)[2];
}

function useWordAnswer(thematic, progression) {
  const [word, setWord] = useState(WORD_DEFAULT);
  const [currentAnswer, setCurrentAnswer] = useState([]);
  const [statusAnswer, setStatusAnswer] = useState(null);
  const [thematicProgress, setThematicProgress] = useState(THEMATIC_DEFAULT);

  const refreshCancel = useRef(() => {});
  const refresh = useCallback((thematic, progression, upProgression) => {
    let cancelled = false;
    refreshCancel.current();
    refreshCancel.current = () => {
      cancelled = true;
    }
    const update = async () => {
      const progress = await progression;
      const dataAboutWordAndThematic = await fetchWord(thematic, progress, upProgression);
      if (!cancelled) {
        setWord(dataAboutWordAndThematic[0]);
        setThematicProgress(dataAboutWordAndThematic[1]);
        setStatusAnswer(null);
        setCurrentAnswer(Array(dataAboutWordAndThematic[0].answer.length).fill(null));
      }
    };
    update();
    return refreshCancel.current;
  }, [])

  useEffect(() => refresh(thematic, progression.progress, progression.updateThematicProgress), [thematic, progression.progress, progression.updateThematicProgress, refresh]);

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
    const firstUnsolvedIndex = fullAnswer.letters.findIndex(
      (letter, i) => !lettersMatch(letter.letter, word.answer[i])
    );
    const suggestionsIndex = extractOnlySuggestionId(fullAnswer);
    const suggestionIndex = word.suggestion.findIndex((letter, index) => {
      return (
        lettersMatch(letter, word.answer[firstUnsolvedIndex]) &&
        !suggestionsIndex.includes(index)
      );
    });
    if (suggestionIndex > -1) {
      addLetter(suggestionIndex, firstUnsolvedIndex);
    }
  };

  const solution = () => {
    const suggestionsIndex = [];
    fullAnswer.letters.forEach((letter, i) => {
      const suggestionIndex = word.suggestion.findIndex((letter, index) => {
        return (
          lettersMatch(letter, word.answer[i]) &&
          !suggestionsIndex.includes(index)
        );
      });
      suggestionsIndex.push(suggestionIndex);
      if (suggestionIndex > -1) {
        addLetter(suggestionIndex, i);
      }
    });
  };

  const resetWord = () => {
    setCurrentAnswer(Array(word.answer.length).fill(null));
  };

  const addLetter = useCallback((suggestionIndex, answerIndex) => {
    setCurrentAnswer((answer) => {
      answer[answerIndex] = suggestionIndex;
      return [...answer];
    });
  }, []);

  const victory = (fullAnswer, word ) => {
    const typed =
      fullAnswer.letters.reduce((a, { letter }) => a + letter, "");
    if (fullAnswer.letters.length === fullAnswer.focusedLetter || fullAnswer.focusedLetter === -1) {
      if (typed.toLowerCase() === word.answer.toLowerCase()) {
        setStatusAnswer(true);
      } else {
        setStatusAnswer(false);
      }
    } else {
      setStatusAnswer(null);
    }
  };

  const removeLast = useCallback(() => {
    setCurrentAnswer((a) => {
      const nbFilled = a.filter((indexSuggestion) => indexSuggestion !== null)
        .length;
      const afterRemovedLastLetter = a.map((indexSuggestion, i) => {
        return i < nbFilled - 1 ? indexSuggestion : null;
      });
      return afterRemovedLastLetter;
    });
  }, []);

  useEffect(() => {
    victory(fullAnswer, word);
  }, [fullAnswer, word]);

  useEffect(() => {
    const handleKeydown = (value) => {
      if(statusAnswer === null){
        if (value.which === 8) {
          removeLast();
        }
        const suggestionsIndex = extractOnlySuggestionId(fullAnswer);
        const suggestionIndex = word.suggestion.findIndex((letter, index) => {
          return (
            lettersMatch(letter, value.key) && !suggestionsIndex.includes(index)
          );
        });
        if (suggestionIndex > -1) {
          addLetter(suggestionIndex, fullAnswer.focusedLetter);
        }
      }else{
        // Next
        if(value.which === 13) progression.fullfillProgress(word.index, thematic);
      }
    };
    window.addEventListener("keydown", handleKeydown);
    return () => {
      window.removeEventListener("keydown", handleKeydown);
    };
  }, [addLetter, fullAnswer, word, removeLast, statusAnswer, progression, thematic]);

  const actions = {
    resetWord,
    jocker,
    solution,
    removeLast
  };

  return [word, fullAnswer, addLetter, statusAnswer, actions, thematicProgress, progression];
}

function Game() {
  const { thematic, updateThematic, progress, updateThematicProgress, fullfillProgress } = useThematic();
  const { setLang } = useContext(penduContext);

  const progression = {
    progress,
    fullfillProgress,
    updateThematicProgress
  }

  const [word, answer, addLetter, statusAnswer, actions, thematicProgress] = useWordAnswer(thematic, progression);

  useEffect(() => {
    setLang(getLangFromTheme(thematic));
  }, [setLang, thematic]);

  const handleLetter = (suggestionIndex, answerIndex) => {
    addLetter(suggestionIndex, answerIndex);
  };

  const handleNext = () => {
    fullfillProgress(word.index, thematic);
  }

  return (
    <>
      <div
        className={`contentWraper${
          statusAnswer === true ? " win" : ""}${
          statusAnswer === false ? " loose" : ""}${
          thematicProgress.unsolved === 0 ? " solved" : ""
          }
        `}
      >
        <div className="menu">
          <span onClick={() => updateThematic("home")}>home</span>
        </div>
        <div className="progressBar">
          <div 
            title={`you solved ${thematicProgress.totalThematic - thematicProgress.unsolved} words on ${thematicProgress.totalThematic}`}
            className="bar"
            style={{"clipPath": `inset(0% ${getPercent(thematicProgress.totalThematic, thematicProgress.unsolved)} 0% 0%)`}}>
            
          </div>
        </div>

        {thematicProgress.unsolved !== 0 ? 
          <>
            <div className="key">{word.hint}</div>
            <AnswerInput word={word} answer={answer} onLetter={handleLetter} />
            <span onClick={handleNext} className="next">Next</span>
            {!statusAnswer && (
              <ul className="options">
                <li>
                  <span onClick={actions.resetWord} className="eraseAll">
                    Clear
                  </span>
                </li>
                <li>
                  <span onClick={actions.solution} className="solve">
                    Solution
                  </span>
                </li>
                <li>
                  <span onClick={actions.jocker} className="jocker1">
                    Jocker
                  </span>
                </li>
              </ul>
            )}
            <Proposal
              word={word}
              cancel={actions.removeLast}
              answer={answer}
              statusAnswer={statusAnswer}
              onLetter={handleLetter}
            />
            <footer>
              <span
                className="lk restartAll"
                title="will erase the cookie listing if your answered or not to the challenges list"
              >
                erase all statistics from this thematic
              </span>
            </footer>
          </>
        : <Completed total={thematicProgress.totalThematic} />}


      </div>
    </>
  );
}

export default Game;
