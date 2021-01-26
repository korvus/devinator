import { useCallback, useEffect, useMemo, useState, useRef } from "react";
import { Text } from "../store/lang";
import { useThematic } from "../store/thematic";
import { rand, getSuggestion } from "../utils/index.js";
import AnswerInput from "./answer-input";
import Proposal from "./proposal";
import Completed from "./completed";
import { lettersMatch, extractOnlySuggestionId, extractIndexBaseOnFalse, isEqual, getPercent } from "../utils";
import { useParams, Link } from "react-router-dom";

const WORD_DEFAULT = { hint: "", answer: "", suggestion: [] };
const THEMATIC_DEFAULT = {unsolved:10, totalThematic: 0};

async function fetchWord(thematic, progress, upProgression) {
  if (!thematic || !progress) {
    return [WORD_DEFAULT, THEMATIC_DEFAULT];
  }

  let allWords;
  try {
    allWords = await import(`../data/${thematic}.json`);
  } catch (error) {
    window.location = "/notfound";
  }

  progress = typeof(progress) === "object" ? progress : JSON.parse(progress)

  if(Object.keys(progress).length === 0 || progress[thematic] === undefined){
    upProgression(thematic);
    return [WORD_DEFAULT, THEMATIC_DEFAULT];
  }

  const listAllWords = progress[thematic];
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
    suggestion: getSuggestion(word[1].nom, thematic),
  }, {
    unsolved: unsolvedIndexWords.length,
    totalThematic: listAllWords.length,
  }];

}

function useWordAnswer(thematic, progression) {
  const [word, setWord] = useState(WORD_DEFAULT);
  const [currentAnswer, setCurrentAnswer] = useState([]);
  const [statusAnswer, setStatusAnswer] = useState(null);
  const [thematicProgress, setThematicProgress] = useState(THEMATIC_DEFAULT);

  const refreshCancel = useRef(() => {});
  const refresh = useCallback((thematic, progression, upProgression, updateThematic) => {
    updateThematic(thematic);
    // console.log("updateThematic", updateThematic);
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

  useEffect(() => refresh(
    thematic,
    progression.progress,
    progression.updateThematicProgress,
    progression.updateThematic
  ), [
    thematic,
    progression.progress,
    progression.updateThematicProgress,
    progression.updateThematic,
    refresh
  ]);

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

  const resetWord = useCallback(() => {
    setCurrentAnswer(Array(word.answer.length).fill(null));
  }, [word.answer.length]);

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
      if (isEqual(typed, word.answer)) {
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
        
          if(value.which === 13){
            if(statusAnswer === true){
              progression.fullfillProgress(word.index, thematic);
            } else {
              resetWord();
            }
          }
        
      }
    };
    window.addEventListener("keydown", handleKeydown);
    return () => {
      window.removeEventListener("keydown", handleKeydown);
    };
  }, [addLetter, fullAnswer, word, removeLast, statusAnswer, progression, resetWord, thematic]);

  const actions = {
    resetWord,
    jocker,
    solution,
    removeLast
  };

  return [word, fullAnswer, addLetter, statusAnswer, actions, thematicProgress, progression];
}

function Game() {
  let { thematic } = useParams();
  const { progress, updateThematicProgress, fullfillProgress, updateThematic, reinitThematicProgress } = useThematic();

  const progression = {
    progress,
    fullfillProgress,
    updateThematicProgress,
    updateThematic
  }

  const [word, answer, addLetter, statusAnswer, actions, thematicProgress] = useWordAnswer(thematic, progression);


  const resetThematic = () => {
    // Reset a false les mots dans le localstorage (mais ne retouche pas au state)
    reinitThematicProgress(thematic, thematicProgress.totalThematic);
    // Update le hooks pour provoquer un refresh
    updateThematicProgress(thematic);
  }

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
          <Link to="/">
            <Text tid="home" />
          </Link>
        </div>
        <div className="progressBar">
          <div 
            title={`${Text({tid: "YouSolved"})} ${thematicProgress.totalThematic - thematicProgress.unsolved} ${Text({tid: "wordsOn"})} ${thematicProgress.totalThematic}`}
            className="bar"
            style={{"clipPath": `inset(0% ${getPercent(thematicProgress.totalThematic, thematicProgress.unsolved)} 0% 0%)`}}>
          </div>
        </div>

        {thematicProgress.unsolved !== 0 ? 
          <>
            <div className="key">{word.hint}</div>
            <AnswerInput word={word} answer={answer} onLetter={handleLetter} />
            <span onClick={actions.resetWord} className="retry">Retry</span>
            <span onClick={handleNext} className="next">Next</span>
            {(!statusAnswer && statusAnswer !== false) && (
              <ul className="options">
                <li>
                  <span onClick={actions.resetWord} className="eraseAll">
                    <Text tid="clear" />
                  </span>
                </li>
                <li>
                  <span onClick={actions.solution} className="solve">
                    <Text tid="solution" />
                  </span>
                </li>
                <li>
                  <span onClick={actions.jocker} className="jocker1">
                    <Text tid="Jocker" />
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
                title={Text({tid: "resetEveryThing"})}
                onClick={resetThematic}
              >
                <Text tid="resetForThematic" />
              </span>
            </footer>
          </>
        : <Completed total={thematicProgress.totalThematic} />}


      </div>
    </>
  );
}

export default Game;
