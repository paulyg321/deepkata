const fetch = require('node-fetch');
const fs = require('fs');
const path = require('path');
const {exec} = require('child_process')

const codeFolder = 'test';
const jsonFolder = 'full_json';
const parsedFolder = 'parsed_json'; 

const fetchNames = () => {
    return fetch('https://api.github.com/search/repositories?q=+language:java&sort=stars&order=desc')
    .then((response) => response.json())
    .then((body) => {
        return body;
    })
}

const retrieveFromUrl = (repoName) => {
    return fetch(`https://api.github.com/search/code?q=+in:file+language:java+repo:${repoName}`)
        .then((response) => response.json())
        .then((body) => {
            const filesData = body.items;
            
            if(typeof filesData !== 'undefined' && filesData.length > 0){
                let directoryName = repoName.replace('/', '_');

                const codeFolderPath = path.join(__dirname, codeFolder, directoryName);

                if(!fs.existsSync(codeFolderPath)){
                    fs.mkdirSync(codeFolderPath)
                }

                filesData.forEach((file) => {
                    let fileUrl = file.html_url;
                    let fileName = file.name;
                    fileUrl = fileUrl.replace('/blob', '');
                    fileUrl = fileUrl.replace('https://github.com', 'https://raw.githubusercontent.com');

                    fetch(fileUrl)
                        .then(response => {
                            return response.text()
                        })
                        .then(body => {
                            
                            const codeFilesPath = path.join(__dirname, codeFolder,directoryName, fileName)

                            fs.writeFileSync(codeFilesPath, body)
                        })
                })
                console.log("Pre PMD")
                executePMD(directoryName);
            }
        })
}

const executePMD = (folderName) => {
    exec(
        // `./pmd-bin-6.26.0/bin/run.sh pmd -d ./${codeFolder}/${folderName}/ -R ruleset.xml -f json > ./${codeFolder}/${jsonFolder}/${folderName}.json`, 
        `node parse.js`,
        (err, stdout, stderr) => {
            if(err){
                console.log("error:", err);
                console.log("stdout:", stdout);
                console.log("stderr:", stderr);
                return;
            }

            console.log("stdout:", stdout);
            console.log("stderr:", stderr);
        })

    console.log("after exec")
    }




const mkdir = (dirPath) => {

    if(!fs.existsSync(dirPath)){
        fs.mkdirSync(dirPath)
    }

}


const parseRepos = async () => {
    
    const directoryPath = path.join(__dirname, codeFolder);
    const fullJsonPath = path.join(__dirname, codeFolder, jsonFolder)
    const parsedJsonPath = path.join(__dirname, codeFolder, parsedFolder)

    mkdir(directoryPath);
    mkdir(fullJsonPath);
    mkdir(parsedJsonPath);

    const body = await fetchNames();
    const allRepos = body.items;

    if(typeof allRepos !== 'undefined'){
        for(let i = 0; i < allRepos.length; i++){
            retrieveFromUrl(allRepos[i].full_name);
        }
    }

}

parseRepos();