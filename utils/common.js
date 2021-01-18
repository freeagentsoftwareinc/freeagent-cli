const chalk = require('chalk');

// map to map the commands and operaion
const operations = new Map([
    ['init', 'addChangeset'],
    ['add-app', 'addEntity'],
    ['add-field', 'addCustomField'],
    ['add-role', 'addRole'],
]);

/*  define all the success messages
    key: operantion i.e addCustomfield, addEnity etc
    value: string
*/
const sucessMessages = {
    addChangeset: chalk.green('changeset folder initialized'),
    addEntity: chalk.green('app created'),
    changeset_complete: `${chalk.green('changeset completed, please find the folder at root')}: ${chalk.yellow('fa_changeset.zip')}`,
    addCustomField: chalk.green('field created'),
    addRole: chalk.green('new role created'),
    editMode: chalk.green('field successfully edited'),
};

/*  define all the error messages
    key: operantion i.e addCustomfield, addEnity etc
    value: string
*/
const errorMessages = {
    addChangeset: chalk.red('changeset folder already initialized, delete the existing folder first'),
    addEntity: chalk.red('changeset dose not exist, please initialize the changeset first'),
    addCustomField: chalk.red('changeset dose not exist, please initialize the changeset first'),
    addRole: chalk.red('changeset dose not exist, please initialize the changeset first'),
};

module.exports ={
    operations,
    sucessMessages,
    errorMessages
};
