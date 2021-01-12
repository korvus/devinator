import {
  Fragment,
  useState,
  useEffect,
  useContext
} from "react";
import { total } from "../data/index.js";
import { penduContext } from "../store/index";
import { alphabetFR, alphabetSL, shuffle } from "../utils/index.js";

const rand = (maximum) => {
  return Math.floor(Math.random() * maximum) + 1;
};

function getSuggestion(answer, lang) {
  const letters = lang === "sl" ? alphabetSL : alphabetFR;
  const commonLetters = shuffle(letters).slice(0, 10);
  const suggestion = shuffle(commonLetters + answer).toLowerCase();
  return suggestion.split("");
}

const Proposal = ({ suggestion, onChange }) => {
  return (
    <div className="proposal">
      {suggestion.map((letter, a) => (
        <div
          onClick={() => {
              console.log("this", this);
            onChange(letter);
          }}
          key={a}
          className="proposaletter"
        >
          {letter}
        </div>
      ))}
    </div>
  );
};

const AnswerInput = ({ value, onChange }) => {
  return (
    <div className="propal">
      {value.map((char, i) => (
        <input
          key={i}
          value={char}
          onChange={(e) => {
            onChange(e.target.value);
          }}
          type="text"
          className="letter"
        />
      ))}
    </div>
  );
};

async function fetchWord(thematic) {
  const allWords = await import(`../data/${thematic}.json`);
  const words = Object.entries(allWords);
  const word = words[rand(words.length)];

  return {
    hint: word[0],
    answer: word[1].nom,
    suggestion: getSuggestion(word[1].nom),
  };
}

const goHome = (setThematic) => {
  setThematic("home");
  localStorage.setItem("pendable-place", "");
};

const writeSessionStorage = (thematic, setLang) => {
  localStorage.setItem("pendable-place", thematic);
  const param = total.filter((params) => params[0] === thematic);
  setLang(param[2]);
};

const checkBeforeAdd = (letter, obj, suggestion) => {
    const pos = suggestion.indexOf(letter.toLowerCase());
    console.log(pos);
    addLetter(letter, obj);
}

const addLetter = (letter, {indexletter, setIndexletter, currentAnswer, setCurrentAnswer}) => {
    const arrAnswer = currentAnswer.slice();
    arrAnswer[indexletter] = letter;

    if(indexletter < currentAnswer.length){
        setIndexletter(i => i+1);
        setCurrentAnswer(arrAnswer);
    } else {
        alert("devrait check si c'est bon avant");
    }
}

function Game() {
  const { thematic, setThematic, setLang } = useContext(penduContext);
  const [word, setWord] = useState({ hint: "", answer: "", suggestion: [] });
  const [currentAnswer, setCurrentAnswer] = useState([]);
  // const [letter, setLetter] = useState("");
  const [indexletter, setIndexletter] = useState(0);

  // const arrLength = word.hint.split("").length;
  useEffect(() => {
    let cancelled = false;
    writeSessionStorage(thematic, setLang);
    const update = async () => {
      const word = await fetchWord(thematic);
      if (!cancelled) setWord(word);
    };
    update();
    return () => {
      cancelled = true;
    };
  }, [thematic]);

  useEffect(() => {
    setCurrentAnswer(() => Array(word.answer.length).fill(""));
    setIndexletter(0);
  }, [word]);

  const focusletter = {
    indexletter,
    setIndexletter,
    currentAnswer,
    setCurrentAnswer
  }

  return (
    <Fragment>
      <div className="contentWraper">
        <div className="menu">
          <span onClick={() => goHome(setThematic)}>home</span>
        </div>
        <div className="progressBar">
          <div className="bar"></div>
        </div>

        <div className="key">{word.hint}</div>

        <AnswerInput
          value={currentAnswer}
          onChange={(letter) => {
            checkBeforeAdd(letter, focusletter, word.suggestion);
          }}
        />

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

        <Proposal
          suggestion={word.suggestion}
          onChange={(letter) => {
            addLetter(letter, focusletter);
          }}
        />
      </div>

      <footer>
        <span
          className="lk restartAll"
          title="will erase the cookie listing if your answered or not to the challenges list"
        >
          erase all statistics from this thematic
        </span>
      </footer>
    </Fragment>
  );
}

export default Game;
