import { useCallback, useEffect, useMemo, useState, useRef } from "react";
import { Text } from "../store/lang";
import { useThematic } from "../store/thematic";
import { rand, getSuggestion } from "../utils/index.js";
import AnswerInput from "./answer-input";
import Proposal from "./proposal";
import Score from "./score";
import Completed from "./completed";
import ButtonActions from "./ButtonActions.js";
import ProgressBar from "./ProgressBar";
import Footer from "./footer";
import { useScore } from "../store/score";

import {
  lettersMatch,
  extractOnlySuggestionId,
  extractIndexBaseOnFalse,
  isEqual,
} from "../utils";
import { useParams, Link } from "react-router-dom";

const WORD_DEFAULT = { hint: "", answer: "", suggestion: [] };
const THEMATIC_DEFAULT = { unsolved: 10, totalThematic: 0 };
const SCORE_DEFAULT = 0;

async function fetchWord(thematic, progress, updateThematicProgress) {
  if (!thematic || !progress) {
    return [WORD_DEFAULT, THEMATIC_DEFAULT];
  }

  let allWords;
  try {
    allWords = await import(`../data/${thematic}.json`);
  } catch (error) {
    window.location = "/notfound";
  }

  progress = typeof progress === "object" ? progress : JSON.parse(progress);

  if (Object.keys(progress).length === 0 || progress[thematic] === undefined) {
    await updateThematicProgress(thematic);
    return [WORD_DEFAULT, THEMATIC_DEFAULT];
  }

  const listAllWords = progress[thematic];
  if (!listAllWords) {
    return [WORD_DEFAULT, THEMATIC_DEFAULT];
  }
  const unsolvedIndexWords = extractIndexBaseOnFalse(listAllWords);

  const words = Object.entries(allWords.default);
  const randomNumber = rand(unsolvedIndexWords.length);

  const wordIndex = unsolvedIndexWords[randomNumber];
  const word = words[wordIndex];

  if (unsolvedIndexWords.length === 0) {
    return [
      WORD_DEFAULT,
      {
        unsolved: unsolvedIndexWords.length,
        totalThematic: listAllWords.length,
      },
    ];
  }

  return [
    {
      index: wordIndex,
      hint: word[0],
      answer: word[1].nom,
      suggestion: getSuggestion(word[1].nom, thematic),
    },
    {
      unsolved: unsolvedIndexWords.length,
      totalThematic: listAllWords.length,
    },
  ];
}

function useWordAnswer(thematic, progression) {
  const [word, setWord] = useState(WORD_DEFAULT);
  const [score, setScore] = useState(SCORE_DEFAULT);
  const [currentAnswer, setCurrentAnswer] = useState([]);
  const [statusAnswer, setStatusAnswer] = useState(null);
  const [thematicProgress, setThematicProgress] = useState(THEMATIC_DEFAULT);
  const notifyScore = useScore();

  const refreshCancel = useRef(() => {});
  const refresh = useCallback(
    (thematic, progression, updateThematicProgress, updateThematic) => {
      updateThematic(thematic);
      let cancelled = false;
      refreshCancel.current();
      refreshCancel.current = () => {
        cancelled = true;
      };
      const update = async () => {
        const progress = await progression;
        const dataAboutWordAndThematic = await fetchWord(
          thematic,
          progress,
          updateThematicProgress
        );
        if (!cancelled) {
          setThematicProgress(dataAboutWordAndThematic[1]);
          setStatusAnswer(null);
          setCurrentAnswer(
            Array(dataAboutWordAndThematic[0].answer.length).fill(null)
          );
          setWord(dataAboutWordAndThematic[0]);
          setScore(0);
        }
      };
      update();
      return refreshCancel.current;
    },
    []
  );

  useEffect(
    () =>
      refresh(
        thematic,
        progression.progress,
        progression.updateThematicProgress,
        progression.updateThematic
      ),
    [
      thematic,
      progression.progress,
      progression.updateThematicProgress,
      progression.updateThematic,
      refresh,
    ]
  );

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

  const jocker = (e) => {
    e.target.blur();
    const firstUnsolvedIndex = fullAnswer.letters.findIndex(
      (letter, i) => !lettersMatch(letter.letter, word.answer[i])
    );
    // console.log("first unsolved Index", firstUnsolvedIndex);
    const suggestionsIndex = extractOnlySuggestionId(fullAnswer);
    /*
    console.log("suggestionsIndex", suggestionsIndex);
    console.log("word.answer[firstUnsolvedIndex]", word.answer[firstUnsolvedIndex]);
    console.log("word.suggestion", word.suggestion);
    */
    const suggestionIndex = word.suggestion.findIndex((letter, index) => {
      return (
        lettersMatch(letter, word.answer[firstUnsolvedIndex]) &&
        !suggestionsIndex.includes(index)
      );
    });
    if (suggestionIndex > -1) {
      addLetter(suggestionIndex, firstUnsolvedIndex);
    }
    if ( suggestionIndex === -1 ){
      const indexLetterAlreayTooken = word.suggestion.findIndex(letter => lettersMatch(letter, word.answer[firstUnsolvedIndex]));
      const indexAnswerUsingLetter = suggestionsIndex.findIndex(indexSuggestion => indexLetterAlreayTooken === indexSuggestion)
      // console.log("switch les valeurs", indexLetterAlreayTooken, " and ", suggestionsIndex[firstUnsolvedIndex], "dont les index dans le tableau sont : ", indexAnswerUsingLetter, firstUnsolvedIndex);
      // addLetter reçoit en premier argument l'index des lettres des suggestions
      addLetter(indexLetterAlreayTooken, firstUnsolvedIndex);
      addLetter(suggestionsIndex[firstUnsolvedIndex], indexAnswerUsingLetter);
    }
    notifyScore("-1", "failure");
    setScore((s) => s - 1);
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
    notifyScore("-5", "failure");
    setScore((s) => s - 5);
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

  useEffect(() => {
    const typed = fullAnswer.letters.reduce((a, { letter }) => a + letter, "");
    if (
      (fullAnswer.letters.length === fullAnswer.focusedLetter ||
        fullAnswer.focusedLetter === -1) &&
      fullAnswer.letters.length > 0
    ) {
      if (isEqual(typed, word.answer)) {
        setScore((s) => s + 5);
        setStatusAnswer(true);
        notifyScore("+5", "victory");
      } else {
        setScore((s) => s - 2);
        setStatusAnswer(false);
        notifyScore("-2", "defeat");
      }
    } else {
      setStatusAnswer(null);
    }
  }, [notifyScore, fullAnswer, word]);


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
    const handleKeydown = (value) => {
      if (statusAnswer === null) {
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
      } else {
        if (value.which === 13) {
          if (statusAnswer === true) {
            progression.fullfillProgress(word.index, thematic, score);
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
  }, [
    addLetter,
    fullAnswer,
    word,
    removeLast,
    statusAnswer,
    progression,
    resetWord,
    thematic,
    score,
  ]);

  const actions = {
    resetWord,
    jocker,
    solution,
    removeLast,
  };

  return [
    word,
    fullAnswer,
    addLetter,
    statusAnswer,
    actions,
    thematicProgress,
    score,
  ];
}

function Game() {
  let { thematic } = useParams();
  const {
    progress,
    updateThematicProgress,
    fullfillProgress,
    updateThematic,
    reinitThematicProgress,
  } = useThematic();

  const progression = {
    progress,
    fullfillProgress,
    updateThematicProgress,
    updateThematic,
  };

  const [
    word,
    answer,
    addLetter,
    statusAnswer,
    actions,
    thematicProgress,
    score,
  ] = useWordAnswer(thematic, progression);

  const [hint, complement] = word.hint.split("@@");

  const resetThematic = () => {
    // Reset a false les mots dans le localstorage (mais ne retouche pas au state)
    reinitThematicProgress(thematic, thematicProgress.totalThematic);
    // Update le hooks pour provoquer un refresh
    updateThematicProgress(thematic);
  };

  const handleLetter = (suggestionIndex, answerIndex) => {
    addLetter(suggestionIndex, answerIndex);
  };

  const handleNext = () => {
    fullfillProgress(word.index, thematic, score);
  };

  return (
    <>
      <div
        className={`contentWraper${statusAnswer === true ? " win" : ""}${
          statusAnswer === false ? " loose" : ""
        }${thematicProgress.unsolved === 0 ? " solved" : ""}
        `}
      >
        <div className="menu">
          <div className="menuWrapper">
            <Link to="/">
              <Text tid="home" />
            </Link>
            <span
              className="lk restartAll"
              title={Text({ tid: "resetEveryThing" })}
              onClick={resetThematic}
            >
              <Text tid="resetForThematic" />
            </span>
          </div>
        </div>

        <ProgressBar prog={thematicProgress} />

        <Score score={score} total={thematicProgress.totalThematic} />

        {thematicProgress.unsolved !== 0 ? (
          <>
            <div
              className={`key${
                word.hint.split("").length > 10 ? " longWord" : " shortWord"
              }`}
            >
              {hint}
              {complement && <span>{complement}</span>}
            </div>
            <AnswerInput word={word} answer={answer} onLetter={handleLetter} />

            <span onClick={actions.resetWord} className="retry">
              Retry
            </span>

            <span onClick={handleNext} className="next">
              Next
            </span>

            <ButtonActions
              visible={!statusAnswer && statusAnswer !== false}
              actions={actions}
            />

            <Proposal
              word={word}
              cancel={actions.removeLast}
              answer={answer}
              statusAnswer={statusAnswer}
              onLetter={handleLetter}
            />
            <Footer />
          </>
        ) : (
          <Completed total={thematicProgress.totalThematic} />
        )}
      </div>
    </>
  );
}

export default Game;
