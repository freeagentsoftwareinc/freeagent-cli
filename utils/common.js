const chalk = require('chalk');

// map to map the commands and operaion
const operations = new Map([
    ['init', {
        payload: 'addChangeset',
        api: 'changeset'
    }],
    ['add-app', {
        payload: 'addEntity',
        api: 'addEntity'
    }],
    ['add-field', {
        payload: 'addCustomField',
        api: 'addCustomField'
    }],
    ['add-role', {
        payload: 'addRole',
        api: 'createEntity'
    }],
    ['update-role', {
        payload: 'updateRole',
        api: 'updateEntity'
    }],
    ['deactivate-role', {
        payload: 'deactivateRole',
        api: 'updateEntityValue'
    }],
    ['activate-role', {
        payload: 'activateRole',
        api: 'updateEntityValue'
    }],
    ['add-section', {
        payload: 'addSection',
        api: 'createEntity'
    }],
    ['update-section', {
        payload: 'updateSection',
        api: 'updateEntity'
    }],
    ['deactivate-section', {
        payload: 'deactivateSection',
        api: 'updateEntityValue'
    }],
    ['activate-section', {
        payload: 'activateSection',
        api: 'updateEntityValue'
    }],
    ['add-action', {
        payload: 'addAction',
        api: 'createEntity'
    }],
    ['update-action', {
        payload: 'addAction',
        api: 'createEntity'
    }],
    ['activate-action', {
        payload: 'activateAction',
        api: 'updateEntityValue'
    }],
    ['deactivate-action', {
        payload: 'deactivateAction',
        api: 'updateEntityValue'
    }],
    ['add-acl', {
        payload: 'addAcl',
        api: 'createEntity'
    }],
    ['deactivate-acl', {
        payload: 'deactivateAcl',
        api: 'updateEntityValue'
    }],
    ['activate-acl', {
        payload: 'activateAcl',
        api: 'updateEntityValue'
    }]
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
    updateRole: chalk.green('role updated'),
    activateRole: chalk.green('role activated'),
    deactivateRole: chalk.green('role deactivated'),
    addSection: chalk.green('new section created'),
    updateSection: chalk.green('section updated'),
    activateSection: chalk.green('section activated'),
    deactivateSection: chalk.green('section deactivated'),
    addAction: chalk.green('new action created'),
    updateAction: chalk.green('action updated'),
    activateAction: chalk.green('action activated'),
    deactivateAction: chalk.green('action deactivated'),
    addAcl: chalk.green('new ACL created'),
    updateAcl: chalk.green('ACL updated'),
    activateAcl: chalk.green('ACL activated'),
    deactivateAcl: chalk.green('ACL deactivated'),
    editMode: chalk.green('field successfully edited'),
};

/*  define all the error messages
    key: operantion i.e addCustomfield, addEnity etc
    value: string
*/
const errorMessages = {
    addChangeset: chalk.red('changeset folder already initialized, delete the existing folder first'),
    addEntity: chalk.red('changeset does not exist, please initialize the changeset first'),
    addCustomField: chalk.red('changeset does not exist, please initialize the changeset first'),
    addRole: chalk.red('changeset does not exist, please initialize the changeset first'),
};

module.exports ={
    operations,
    sucessMessages,
    errorMessages
};
