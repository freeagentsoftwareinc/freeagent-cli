const chalk = require('chalk');

// map to map the commands and operaion
const operations = new Map([
    ['init', {
        payload: 'addChangeset',
        api: 'changeset',
        query: 'addChangeset',
        sucessMessage: 'changeset folder initialized'
    }],
    ['add-app', {
        payload: 'addEntity',
        api: 'addEntity',
        query: 'addApp',
        sucessMessage: 'created app successfully'
    }],
    ['update-app', {
        payload: 'updateApp',
        api: 'updateEntityConfig',
        query: 'updateApp',
        sucessMessage: 'updated the app successfully'
    }],
    ['add-field', {
        payload: 'addCustomField',
        api: 'addCustomField',
        query: 'addField',
        sucessMessage: 'created new field successfully'
    }],
    ['update-field', {
        payload: 'addCustomField',
        api: 'updateFieldConfig',
        query: 'updateField',
        sucessMessage: 'updated the field successfully'
    }],
    ['reorder-field', {
        payload: 'updateOrder',
        api: 'bulkUpdateOrder',
        query: 'updateOrder',
        sucessMessage: 'reorderd the field successfully'
    }],
    ['delete-field', {
        payload: 'deleteField',
        api: 'deleteCustomField',
        query: 'deleteField',
        sucessMessage: 'deleted the field successfully'
    }],
    ['add-role', {
        payload: 'addRole',
        api: 'createEntity',
        query: 'addRole',
        sucessMessage: 'created the role successfully'
    }],
    ['update-role', {
        payload: 'addRole',
        api: 'updateEntity',
        query: 'updateRole',
        sucessMessage: 'updated the role successfully'
    }],
    ['deactivate-role', {
        payload: 'deactivateRole',
        api: 'updateEntityValue',
        query: 'toggleRole',
        sucessMessage: 'deactivated the field successfully'
    }],
    ['activate-role', {
        payload: 'activateRole',
        api: 'updateEntityValue',
        query: 'toggleRole',
        sucessMessage: 'activated the role successfully'
    }],
    ['add-section', {
        payload: 'addSection',
        api: 'createEntity',
        query: 'addSection',
        sucessMessage: 'created the section successfully'
    }],
    ['update-section', {
        payload: 'addSection',
        api: 'updateEntity',
        query: 'updateSection',
        sucessMessage: 'updated the section successfully'
    }],
    ['reorder-section', {
        payload: 'updateOrder',
        api: 'bulkUpdateOrder',
        query: 'updateOrder',
        sucessMessage: 'reorderd the section successfully'
    }],
    ['deactivate-section', {
        payload: 'deactivateSection',
        api: 'updateEntityValue',
        query: 'toggleSection',
        sucessMessage: 'deactivated the section successfully'
    }],
    ['activate-section', {
        payload: 'activateSection',
        api: 'updateEntityValue',
        query: 'toggleSection',
        sucessMessage: 'activated the section successfully'
    }],
    ['add-action', {
        payload: 'addAction',
        api: 'createEntity',
        query: 'addAppAction',
        sucessMessage: 'created the action successfully'
    }],
    ['update-action', {
        payload: 'addAction',
        api: 'updateEntity',
        query: 'updateAppAction',
        sucessMessage: 'updated the action successfully'
    }],
    ['reorder-action', {
        payload: 'updateOrder',
        api: 'bulkUpdateOrder',
        query: 'updateOrder',
        sucessMessage: 'reorderd the action successfully'
    }],
    ['activate-action', {
        payload: 'activateAction',
        api: 'updateEntityValue',
        query: 'toggleAction',
        sucessMessage: 'activated the action successfully'
    }],
    ['deactivate-action', {
        payload: 'deactivateAction',
        api: 'updateEntityValue',
        query: 'toggleAction',
        sucessMessage: 'deactivated the action successfully'
    }],
    ['add-acl', {
        payload: 'addAcl',
        api: 'createEntity',
        query: 'addAcl',
        sucessMessage: 'created the acl successfully'
    }],
    ['update-acl', {
        payload: 'addAcl',
        api: 'createEntity',
        query: 'updateAcl',
        sucessMessage: 'created the acl successfully'
    }],
    ['deactivate-acl', {
        payload: 'deactivateAcl',
        api: 'updateEntityValue',
        query: 'toggleAcl',
        sucessMessage: 'deactivated the acl successfully'
    }],
    ['activate-acl', {
        payload: 'activateAcl',
        api: 'updateEntityValue',
        query: 'toggleAcl',
        sucessMessage: 'activate the acl successfully'
    }],
    ['add-choicelist', {
        payload: 'addChoiceList',
        api: 'saveCompositeEntity',
        query: 'addSaveComposite',
        sucessMessage: 'created the choice list successfully'
    }],
    ['update-choicelist', {
        payload: 'addChoiceList',
        api: 'saveCompositeEntity',
        query: 'updateSaveComposite',
        sucessMessage: 'updated the choice list successfully'
    }],
    ['add-automation', {
        payload: 'addAutomation',
        api: 'saveCompositeEntity',
        query: 'addSaveComposite',
        sucessMessage: 'created the automation successfully'
    }],
    ['update-automation', {
        payload: 'addAutomation',
        api: 'saveCompositeEntity',
        query: 'updateSaveComposite',
        sucessMessage: 'updated the automation successfully'
    }],
    ['add-formrule', {
        payload: 'addFormRule',
        api: 'saveCompositeEntity',
        query: 'addSaveComposite',
        sucessMessage: 'created the field successfully'
    }],
    ['update-formrule', {
        payload: 'addFormRule',
        api: 'saveCompositeEntity',
        query: 'updateSaveComposite',
        sucessMessage: 'updated the formrule successfully'
    }],
    ['reorder-lines', {
        payload: 'updateOrder',
        api: 'bulkUpdateOrder',
        query: 'updateOrder',
        sucessMessage: 'reorderd the lines successfully'
    }]
]);

const errorMessages = {
    addChangeset: chalk.red('changeset folder already initialized, delete the existing folder first'),
    addEntity: chalk.red('changeset does not exist, please initialize the changeset first'),
    addCustomField: chalk.red('changeset does not exist, please initialize the changeset first'),
    addRole: chalk.red('changeset does not exist, please initialize the changeset first'),
};

module.exports ={
    operations,
    errorMessages
};
