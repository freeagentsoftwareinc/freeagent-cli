
const fs = require('fs');
const uuid  = require('node-uuid');
const dir = './fa_changeset';
const child_process = require('child_process');
const editor = process.env.EDITOR || 'vi';
const archiver = require('archiver');
const { get } = require('lodash');
const { prompt } = require('inquirer');
const payloads = require('../utils/payloads');
const questions = require('../utils/questions')
const { operations, sucessMessages, errorMessages } = require('../utils/common');

const runOperation = (operation, args={}) => {
    if (!fs.existsSync(dir)){
        console.log(get(errorMessages, operation)); 
        return;
    }
    const data = {...get(payloads, operation), ...args};
    const jsonData = JSON.stringify(data, null, 4);
    const file = `${Date.now()}_${operation}_${uuid.v4()}.json`;
    const path = `${dir}/${file}`
        fs.writeFileSync(`${path}`, jsonData);
    console.log(get(sucessMessages, operation));
    return path;
};

const openFileInViEditor = (file) => {
    const child = child_process.spawn(editor, [`${file}`], {
        stdio: 'inherit'
    });

    child.on('exit', function (e, code) {
        console.log(get(sucessMessages, 'editMode'));
    });
};

const runOperationInEditMode = (opration) => {
   const filePath = runOperation(opration);
   return openFileInViEditor(filePath);
};

const runOperationInIntractionMode = (opration) => prompt(get(questions, opration))
        .then(answer => runOperation(opration, answer));

const handleAction = (command, editMode, intractiveMode) => {
    const operationName = operations.get(command);
    if(editMode) {
        runOperationInEditMode(operationName) 
    }
    if(intractiveMode) {
        return runOperationInIntractionMode(operationName)
    };
    return runOperation(operationName);
};

const initializeChangeSet = (editMode=false, args) => {
    if (fs.existsSync(dir)){
        console.log(global.messages.error.changeset_intialized);
        return;
    };
    const changeset = {...payloads.changeset, ...args};
    const data = JSON.stringify(changeset, null, 4);
    const name = `${Date.now()}_changeset_${uuid.v4()}`;
    fs.mkdirSync(dir);
    fs.writeFileSync(`${dir}/${name}.json`, data);
    if (editMode){
        const child = child_process.spawn(editor, [`${dir}/${name}.json`], {
            stdio: 'inherit'
        });

        child.on('exit', function (e, code) {
            console.log(sucessMessages.changeset_intialized);
        });
        return;
    }
    console.log(sucessMessages.changeset_intialized);
};

const handleAction_intialize = (editMode, intractiveMode) => {

    if(intractiveMode){
        return prompt(questions.addChangeSet).then(answer => initializeChangeSet(editMode, answer));
    }
    initializeChangeSet(editMode);
}

const exportChangeset= () => {
    if (!fs.existsSync(dir)){
        console.log(errorMessages.app_created);
        return;
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
        console.log(sucessMessages.changeset_complete);
    });
}

module.exports = {
    handleAction_intialize,
    handleAction,
    exportChangeset
}