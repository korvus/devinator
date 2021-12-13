const fs = require('fs')
const path = require('path');

const directoryPath = path.join(__dirname, '../src/data/');

fs.readdir(directoryPath, function (err, files) {
    //handling error
    if (err) {
        return console.log('Unable to scan directory: ' + err);
    }

    const nbr = [];
    files.forEach(function (file) {
        if(file !== "index.js"){
            const identifiant = file.split(".")[0];
            console.log("file : ", file);
            let contentFiles = fs.readFileSync(`${directoryPath}${file}`);
            let contentParsed = JSON.parse(contentFiles);
            nbr.push({name: identifiant, number:Object.keys(contentParsed).length});                        
        }
    });
    
    console.log("-----------");

    let rawContent = fs.readFileSync(`${directoryPath}index.js`).toString();
    const [prefix, jsoncontent] = rawContent.split("=");
    // console.log("jsoncontent: ", jsoncontent);
    const contentToUpdate = JSON.parse(jsoncontent);

    for(a = 0; a < contentToUpdate.length; a++){
        for(b = 0; b < nbr.length; b++){
            if(contentToUpdate[a].id === nbr[b].name){
                contentToUpdate[a].number = nbr[b].number
            }
        }
    }

    const startDocument = prefix;
    const bodyDocument = JSON.stringify(contentToUpdate, null, 2);
    const document = startDocument+"= "+bodyDocument;

    fs.writeFileSync(`${directoryPath}index.js`, document);

    console.log("fichier réécrit");
});
