const path = require('path');
const fs = require('fs');

const codeFolder = 'test';
const jsonFolder = 'full_json';
const parsedFolder = 'parsed_json';

//joining path of directory 
const directoryPath = path.join(__dirname, codeFolder, jsonFolder);

//passing directoryPath and callback function
fs.readdir(directoryPath, function (err, files) {

    //handling error
    if (err) {
        return console.log('Unable to scan directory: ' + err);
    } 
    //listing all files using forEach
    files.forEach(function (file) {
        
        let violationsArray = [];
        let seenViolations = [];
        
        const pathToFullJsonFiles = path.join(__dirname, codeFolder, jsonFolder, file);

        let rawdata = fs.readFileSync(pathToFullJsonFiles);

        let pmdOutput = JSON.parse(rawdata);

        pmdOutput.files.forEach((jsonfile) => {
            let allViolations = jsonfile.violations
            let fileName = jsonfile.filename;

            allViolations.forEach((violation) => {
                if(seenViolations.indexOf(violation.rule) === -1){
                    violationsArray.push({
                        fileName,
                        ...violation
                    })

                    seenViolations.push(violation.rule)
                }
            })
        })

        let data = JSON.stringify(violationsArray, null, 2);

        const pathToParsedJsonFiles = path.join(__dirname, codeFolder, parsedFolder, file);

        fs.writeFileSync(pathToParsedJsonFiles, data)
        
    });
});