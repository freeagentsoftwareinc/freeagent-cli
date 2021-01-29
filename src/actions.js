
const fs = require('fs');
const uuid  = require('node-uuid');
const dir = './fa_changeset';
const child_process = require('child_process');
const editor = process.env.EDITOR || 'vi';
const archiver = require('archiver');
const { get } = require('lodash');
const { prompt } = require('inquirer');
const payloads = require('../utils/payloads');
const questions = require('../utils/questions');
const chalk = require('chalk');
const { operations, sucessMessages, errorMessages } = require('../utils/common');
const { runQuery } = require('./db');
 
const getPayload = (operation, args) => {
    const payload = {...get(payloads, operation)}
    const data = { args: {...payload.args, ...args}, transports: [ ...payload.transports]};
    return data;
};

const runOperation = (operation, args={}) => {
    const folderPath = initializeFolder(operation.payload);
    if (!folderPath) {
        console.log(get(errorMessages, operation.payload)); 
        return;
    }
    const data = getPayload(operation.payload, args);
    const file = `${Date.now()}_${operation.api}_${uuid.v4()}.json`;
    runQuery[operation.query](data, file);
    const jsonData =  JSON.stringify(data, null, 4);
    const filePath = `${dir}/${file}`
    fs.writeFileSync(`${filePath}`, jsonData);
    console.log(chalk.green(operation.sucessMessage));
    return filePath;
};

const openFileInViEditor = (file) => {
    const child = child_process.spawn(editor, [`${file}`], {
        stdio: 'inherit'
    });

    child.on('exit', function (e, code) {
        console.log(get(sucessMessages, 'editMode'));
    });
};

const runOperationInEditMode = (opration, args) => {
   const filePath = runOperation(opration, args);
   return openFileInViEditor(filePath);
};

const runOperationInIntractionMode = (opration) => prompt(get(questions, opration))
        .then(answer => runOperation(opration, answer));


const initializeFolder = (operation) => {
    if (!fs.existsSync(dir) && operation === 'addChangeset') {
        fs.mkdirSync(dir);
        return true;
    };

    if (fs.existsSync(dir) && operation !== 'addChangeset'){
        return true;
    };
    return false;
};   

const handleAction = (command, args={}, editMode, interactiveMode) => {
    const operation = operations.get(command);
    if (editMode) {
        return runOperationInEditMode(operation, args) 
    }
    if (interactiveMode) {
        return runOperationInIntractionMode(operation, args)
    };
    return runOperation(operation, args);
};

const exportChangeset= () => {
    if (!fs.existsSync(dir)){
        console.log(errorMessages.app_created);
        return false;
    };
    const zipFolderName = "fa_changeset.zip";
    const archive = archiver('zip', { zlib: { level: 9 }});
    const data = fs.createWriteStream(zipFolderName);

    archive
        .directory(dir, false)
        .on('error', err => { throw err; })
        .pipe(data);

    archive.finalize()
    .then(() => {
        console.log(chalk.green('please find changeset.zip in root'));
        return true;
    });
}

module.exports = {
    handleAction,
    exportChangeset
};
