import {
  Fragment,
  useState,
  useEffect,
  useContext,
  useRef,
  createRef,
  useLayoutEffect,
} from "react";
import { penduContext } from "../store/index";
import { total } from "../data/index.js";
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

/*
const setSuggestion = (word, lang, setSuggestionletter, focusindex, elRefs) => {
  const arrLetters = [];
  let a = 0;

  let alphabet = alphabetFR;
  if (lang === "sl") {
    alphabet = alphabetSL;
  }

  const aphlatbe = shuffle(alphabet).substring(0, 10);
  const embrouille = shuffle(aphlatbe + word);

  [...embrouille].forEach((letter) => {
    a++;
    letter = letter.toLowerCase();
    arrLetters.push(letter);
  });

  setSuggestionletter(arrLetters);

  window.addEventListener("keydown", (e) =>
    downHandler(e.key, focusindex, arrLetters, elRefs)
  );
};
*/

const Proposal = ({ suggestion, onChange }) => {
  return (
    <div className="proposal">
      {suggestion.map((letter, a) => (
        <div
          onClick={() => {
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
  /*
    function downHandler(key, focusindex, available, elRefs) {
        key = key.toLowerCase();
        const found = available.indexOf(key);
        if (found === -1 || undefined) {
          console.log("passe bien là");
          elRefs.current[focusindex].current.value = `_`;
          // document.querySelectorAll(".propal input")[focusindex].reset();
          return false;
        }
    }
    */

  /*
    useEffect(() => {
        const downHandler = (e) => {
            e.key.toLowerCase();
            onChange();
        };
        
        window.addEventListener("keydown", downHandler);
        return () => {window.removeEventListener("keydown", downhandler)};
    }, [])
    */

  return (
    <div className="propal">
      {value.map((char, i) => (
        <input
          key={i}
          value={char}
          maxLength="1"
          type="text"
          className="letter"
        />
      ))}
    </div>
  );
};

const getFocus = (divRef) => {
  if (divRef.current) {
    if (divRef.current[0]) {
      divRef.current[0].current.focus();
    }
  }
};

/*
function getRandomWord(allWords) {
  const nbTotal = Object.keys(allWords).length - 1;
  const extractRand = rand(nbTotal);
  for (let word in allWords) {
    arrayAllWords.push([word, allWords[word].nom]);
  }
  return word;
}
*/

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

/*
const initialisation = async (
    thematic,
    setWord,
    setLang,
    lang,
    setSuggestionletter,
    focusindex,
    elRefs
) => {
    localStorage.setItem("pendable-place", thematic);

    const param = total.filter(params => params[0] === thematic);
    setLang(param[2]);

    const arrayAllWords = [];
    let allWords = await import(`../data/${thematic}.json`);
    const nbTotal = Object.keys(allWords).length - 1;
    const extractRand = rand(nbTotal);
    for (let word in allWords) {
        arrayAllWords.push([word, allWords[word].nom]);
        // console.log()
        // console.log("word is " + word + "  " + allWords[word]);
    }

    setWord([arrayAllWords[extractRand][0], arrayAllWords[extractRand][1]]);
    setSuggestion(arrayAllWords[extractRand][1], lang, setSuggestionletter, focusindex, elRefs);
}
*/

const goHome = (setThematic) => {
  setThematic("home");
  localStorage.setItem("pendable-place", "");
};

function Game() {
  const { thematic, setThematic, lang, setLang } = useContext(penduContext);
  const [word, setWord] = useState({ hint: "", answer: "", suggestion: [] });
  const [currentAnswer, setCurrentAnswer] = useState([]);
  // const [done, setDone] = useState([]);
  const [focusindex, setFocusindex] = useState(0);

  const arrLength = word.hint.split("").length;
  /*
  const elRefs = useRef([]);

  if (elRefs.current.length !== arrLength) {
    elRefs.current = Array(arrLength)
      .fill()
      .map((_, i) => elRefs.current[i] || createRef());
  }
*/
  useEffect(() => {
    let cancelled = false;
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
    setCurrentAnswer(Array(word.answer.length).fill(""));
  }, [word]);

  /*
  useLayoutEffect(() => {
    getFocus(elRefs);
  });
  */

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

        <AnswerInput value={currentAnswer} onChange={setCurrentAnswer} />

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
            setCurrentAnswer(a => [letter, ...a.slice(1)]);
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
