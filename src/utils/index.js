
export const alphabetFR = "eeeeeeeeeeeeeeessssssssaaaaaaaaiiiiiiiiittttttttnnnnnnnrrrrrrruuuuuullllloooooddddcccpppmmm---éévvqqfbghjàxyèêzwçkîïë ";

export const alphabetSL = "eeeeeeeeeeeeeaaaaaaaaaaaaiiiiiiiiooooooonrrrrrrrrsssssslllllllttttttjjjjjvvvvkkkkddddpppmmmuuuzzbbgghhččccššžžfy";

// https://stackoverflow.com/questions/3943772/how-do-i-shuffle-the-characters-in-a-string-in-javascript
export const shuffle = (str) => {
    return str.split('').sort(function(){return 0.5-Math.random()}).join('');
}