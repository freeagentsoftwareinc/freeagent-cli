const chalk = require('chalk');

const changesetQuestion = [
    {
        type: 'input',
        name: 'name',
        message: chalk.yellow('enter the changeset name or press enter')
    },
    {
        type: 'input',
        name: 'description',
        message: chalk.yellow('enter the description for changeset or press enter')
    }
];

const entityQuestion = [
    {
        type: 'input',
        name: 'label',
        message: chalk.yellow('enter the app name or press enter')
    },
    {
        type: 'input',
        name: 'label_plural',
        message: chalk.yellow('enter the singular version of name for changeset or press enter')
    }
];

const questions = {
    addChangeset: changesetQuestion,
    addEntity: entityQuestion
}

module.exports = questions
