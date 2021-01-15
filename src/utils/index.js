export const alphabetFR =
    "eeeeeeeeeeeeeeessssssssaaaaaaaaiiiiiiiiittttttttnnnnnnnrrrrrrruuuuuullllloooooddddcccpppmmm---éévvqqfbghjàxyèêzwçkîïë ";

export const alphabetSL =
    "eeeeeeeeeeeeeaaaaaaaaaaaaiiiiiiiiooooooonrrrrrrrrsssssslllllllttttttjjjjjvvvvkkkkddddpppmmmuuuzzbbgghhččccššžžfy";

// https://stackoverflow.com/questions/3943772/how-do-i-shuffle-the-characters-in-a-string-in-javascript
export const shuffle = (str) => {
    return str
        .split("")
        .sort(function () {
            return 0.5 - Math.random();
        })
        .join("");
};

export const rand = (maximum) => {
    return Math.floor(Math.random() * maximum);
};

export function lettersMatch(a, b) {
    // new Intl.Collator("fr-FR", { sensitivity: "base" }).compare(a, b);
    return a.toLowerCase() === b.toLowerCase();
}

export function extractOnlySuggestionId(answer) {
    let suggestionsIndex = answer.letters.map(letter => letter.suggestionIndex);
    suggestionsIndex = suggestionsIndex.filter(suggestion => suggestion !== null);
    return suggestionsIndex;
}