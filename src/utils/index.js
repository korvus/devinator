import { themeSummaries } from "../data/index.js";

// Anglais : https://www3.nd.edu/~busiforc/handouts/cryptography/letterfrequencies.html
// Slovenian : https://en.wikipedia.org/wiki/Scrabble_letter_distributions#Slovenian
const alphabets = {
  fr: "eeeeeeeeeeeeeeessssssssaaaaaaaaiiiiiiiiittttttttnnnnnnnrrrrrrruuuuuullllloooooddddcccpppmmm---éévvqqfbghjàxyèêzwçkîïë ",
  sl: "eeeeeeeeeeeeeaaaaaaaaaaaaiiiiiiiiooooooonrrrrrrrrsssssslllllllttttttjjjjjvvvvkkkkddddpppmmmuuuzzbbgghhččccššžžfy---",
  en: "eeeeeeeeeeeaaaaaaaarrrrrrrriiiiiiioooooootttttttnnnnnnnsssssslllllcccccuuuudddpppmmmggbbffyywkvxzjq---",
};

// https://stackoverflow.com/questions/3943772/how-do-i-shuffle-the-characters-in-a-string-in-javascript
const shuffle = (str) => {
  return str
    .split("")
    .sort(function () {
      return 0.5 - Math.random();
    })
    .join("");
};

function getLangFromTheme(thematic) {
  return themeSummaries.filter((params) => params.id === thematic)[0].alphabet;
}

export function getSuggestion(answer, thematic) {
  //thematic
  const lang = getLangFromTheme(thematic) ?? "fr";
  const letters = alphabets[lang];
  const commonLetters = shuffle(letters).slice(0, 10);
  const suggestion = shuffle(commonLetters + answer).toLowerCase();
  return suggestion.split("");
}

export const rand = (maximum) => {
  return Math.floor(Math.random() * maximum);
};

export function lettersMatch(a, b) {
  // new Intl.Collator("fr-FR", { sensitivity: "base" }).compare(a, b);
  return a.toLowerCase() === b.toLowerCase();
}

export function isEqual(a, b) {
  const compare = a.localeCompare(b, "fr", { sensitivity: "base" });
  return compare === 0;
}

export function extractOnlySuggestionId(answer) {
  let suggestionsIndex = answer.letters.map((letter) => letter.suggestionIndex);
  suggestionsIndex = suggestionsIndex.filter(
    (suggestion) => suggestion !== null
  );
  return suggestionsIndex;
}

export function extractIndexBaseOnFalse(obj) {
  return obj.reduce((res, value, index) => {
    if (value === false) {
      res.push(index);
    }
    return res;
  }, []);
}

export const Hint = ({ wordhint }) => {
  const [hint, complement] = wordhint.split("@@");
  return (
    <>
      <div
        className={`key${
          wordhint.split("").length > 10 ? " longWord" : " shortWord"
        }`}
      >
        {hint}
      </div>
      {complement && <span className="hint">{complement}</span>}
    </>
  );
};

export function getPercent(total, unsolved) {
  const percent = Math.round(Math.round(unsolved * 100) / total);
  return percent + "%";
}
