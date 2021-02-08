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
    ['activate-app', {
        payload: 'activateApp',
        api: 'updateEntityConfig',
        query: 'toggleApp',
        sucessMessage: 'activated the apps successfully'
    }],
    ['deactivate-app', {
        payload: 'deactivateApp',
        api: 'updateEntityConfig',
        query: 'toggleApp',
        sucessMessage: 'deactivated the app successfully'
    }],
    ['add-line', {
        payload: 'addEntity',
        api: 'addEntity',
        query: 'addLine',
        sucessMessage: 'created new line successfully'
    }],
    ['activate-line', {
        payload: 'activateApp',
        api: 'updateEntityConfig',
        query: 'toggleLine',
        sucessMessage: 'activated the line successfully'
    }],
    ['deactivate-line', {
        payload: 'deactivateApp',
        api: 'updateEntityConfig',
        query: 'toggleLine',
        sucessMessage: 'deactivated the line successfully'
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
    ['activate-field', {
        payload: 'activateField',
        api: 'updateFieldConfig',
        query: 'toggleField',
        sucessMessage: 'activated the field successfully'
    }],
    ['deactivate-field', {
        payload: 'deactivateField',
        api: 'updateFieldConfig',
        query: 'toggleField',
        sucessMessage: 'deactivated the field successfully'
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
        sucessMessage: 'deactivated the role successfully'
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
        api: 'updateEntity',
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
    ['activate-choicelist', {
        payload: 'activateChoiceList',
        api: 'updateEntityValue',
        query: 'toggleChoiceList',
        sucessMessage: 'activated the choicelist successfully'
    }],
    ['deactivate-choicelist', {
        payload: 'deactivateChoiceList',
        api: 'updateEntityValue',
        query: 'toggleChoiceList',
        sucessMessage: 'deactivated the choicelist successfully'
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
    ['activate-automation', {
        payload: 'activateAutomation',
        api: 'updateEntityValue',
        query: 'toggleAutomation',
        sucessMessage: 'activated the automation successfully'
    }],
    ['deactivate-automation', {
        payload: 'deactivateAutomation',
        api: 'updateEntityValue',
        query: 'toggleAutomation',
        sucessMessage: 'deactivated the automation successfully'
    }],
    ['add-formrule', {
        payload: 'addFormRule',
        api: 'saveCompositeEntity',
        query: 'addSaveComposite',
        sucessMessage: 'created the form rule successfully'
    }],
    ['update-formrule', {
        payload: 'addFormRule',
        api: 'saveCompositeEntity',
        query: 'updateSaveComposite',
        sucessMessage: 'updated the form rule successfully'
    }],
    ['reorder-formrule', {
        payload: 'updateOrder',
        api: 'bulkUpdateOrder',
        query: 'updateOrder',
        sucessMessage: 'reorderd the form rules successfully'
    }],
    ['reorder-lines', {
        payload: 'updateOrder',
        api: 'bulkUpdateOrder',
        query: 'updateOrder',
        sucessMessage: 'reorderd the lines successfully'
    }],
    ['reorder-relatedlist', {
        payload: 'updateOrder',
        api: 'bulkUpdateOrder',
        query: 'updateOrder',
        sucessMessage: 'reorderd the realated list successfully'
    }],
    ['update-cardconfig', {
        payload: 'updateCardConfig',
        api: 'updateCardConfig',
        query: 'updateCardConfig',
        sucessMessage: 'updated the card configuration successfully'
    }]
]);

const errorMessages = {
    addChangeset: chalk.red('changeset folder already initialized, delete the existing folder first'),
    addEntity: chalk.red('changeset does not exist, please initialize the changeset first'),
    addCustomField: chalk.red('changeset does not exist, please initialize the changeset first'),
    addRole: chalk.red('changeset does not exist, please initialize the changeset first'),
    notFoundEror: chalk.red('it is not the part of current changeset must be editing system one or from other changeset')
};

const modelsMap = new Map([
    ['10913ac7-852e-516e-a2d7-3c24c34600d4', {
        model: 'catalog_type',
        childModel: 'catalog'
    }],
    ['cf7de345-a40b-56cb-b70a-7fb707a5b4b0', {
        model: 'rule_set',
        childModel: 'rule_action'
    }],
    ['2c05c9fa-568e-49e2-b435-b84f79fe1d32', {
        model: 'form_rule',
        childModel: 'form_action'
    }]
]);

const cardConfigFieldsId = {
    still_looking: "3ee6c6c7-3a5e-4a53-9735-154300aebd4f",
    card_title: "99250395-196f-46e9-8a72-046d497a06ca",
    team_member:"2837a12e-d3ef-41ec-9a31-166b9aad1149",
    first_line: "7d37035b-c3ac-4a6c-a468-1e1b42d5e2c5",
    second_line: "407534b0-938e-4919-9223-1a9e922d5e0e",
    third_line: "07762e81-a620-4a3a-a24f-905837797e1a",
    forth_line: "d16ef822-d217-4020-bc20-2ff57a7bd757",
    fifith_line: "e17e3d22-6c9e-41e8-ae12-1d93f84eeb24",
};

const fieldReferenceKeys = new Map([
    ['catalog_type_id', 'catalog_type'],
    ['parent_field_id', 'fa_field_config'],
    ['parent_fa_field_id', 'fa_field_config'],
    ['fa_entity_config_id', 'fa_entity_config'],
    ['reference_qualifier', 'fa_field_config'],
    ['reference_fa_field_id', 'fa_field_config'],
    ['parent_custom_field_id', 'fa_field_config'],
    ['reference_fa_entity_id', 'fa_entity'],
    ['reference_custom_field_id','fa_field_config'],
    ['reference_qualifier_value', 'fa_field_config'],
    ['fa_related_field_config_id', 'fa_field_config']
]);

const createEntityMap = ['fa_role', 'layout', 'app_action', 'fa_acl'];

const appActionPlacemenTypes = {
    detailPage: 'e3031818-c9fb-4b7e-99ae-f1f855967758',
    card: 'e3031818-c9fb-4b7e-99ae-f1f855967759',
    activityTimeline: 'e3031818-c9fb-4b7e-99ae-f1f85596775a',
    mobile: 'e3031818-c9fb-4b7e-99ae-f1f85596775b',
};

const actionTypes = {
    customCode: 'b635cae1-8529-45bd-8b99-c157b166a554',
    automation: '93083487-cad0-4c15-a9e5-37bd9c58ba59',
    system: '4aa48ded-3741-434e-aa4b-1415485d8286',
};
const appearanceTypes = {
    default: '85c641fc-d048-4ae1-87a0-80317453e70b',
    primary: '62edfc67-ff72-4e4f-a1a0-6842f14d7179',
    secondary: 'e10466ce-ede2-44d8-af81-58c7becdbae7'
};

const operantionTypes = {
    write: 'c0fe6002-6472-4196-85f9-2f1854b3eb99',
    read: '2b37f58d-e49b-44c2-9624-1d2c8f89c427',
};

const aclTypes = {
    field: 'bda73cdb-4e7b-482c-bf41-ef9746324853',
    record: 'ada73cdb-4e7b-482c-bf41-ef9746324853'
};

const entityOperationTypes = {
    create: 'b22d45c0-f2fe-43ad-86e5-b31bf3e4f3db',
    delete: 'd22d45c0-f2fe-43ad-86e5-b31bf3e4f3db',
    read: 'a22d45c0-f2fe-43ad-86e5-b31bf3e4f3db',
    update: 'c22d45c0-f2fe-43ad-86e5-b31bf3e4f3db'
};

const choiceListOrderTypes = {
    alphabetical : 'b672222d-f782-48d9-99bf-71608605d8de',
    order: '901f9fd9-161b-40fa-8dd9-09bd292a9de8'
};

const automationsTriggers = {
    onCreate: '9d02d813-fd95-48ba-8c78-2608a1c9f9a5',
    onUpdate: '603307d5-f4ed-4174-b380-df0228e6a3bb',
    onAppAction: 'f8b862e0-a13f-4708-ab3e-b973de1e781e',
    scheduleDatetimeField: '1398b293-35e4-416a-a57c-5d10f7f93af6',
    scheduleCron: 'e824d06c-e41a-4bee-97de-35c84a53736f',
};

const formRuleOperatoins= {
    visible: '2630fba4-3da4-44a3-b05e-eb74fe6acee0',
    mandatory: 'a98cc27e-3fac-491a-b5a1-61f6c4e06125',
    readOnly: 'd3366cc1-2a43-4ed3-9cde-7c73846f9e9b',
    reset: '5bcd7f9a-e6cd-4d38-b1a5-e7619cc41a4d',
    setValue: 'aab04614-2eea-4dff-ae7d-7e84af294f9e',
  };
  
  const formRuleOperatoinValues = {
    true: 'a6e198ae-c959-431c-bb0d-4dfedea022ae',
    false: 'f1b720c1-04ee-458f-b0a5-008962a15244',
    noChange: 'cca22add-81f8-45e8-bf2c-89c424a96cdb',
  };
  
  const formRuleTypes = {
    appAction: '1eb3aa53-4247-412c-a241-2e65acdef107',
    formSection: '1eb3aa53-4247-412c-a241-2e65acdef108',
    formField: '5b67a8c1-2bef-4250-a7eb-8668260a08cf',
  };

const modelForFieldReference = ['fa_entity_config', 'fa_field_config','fa_role', 'layout', 'catalog_type', 'catalog'];

const modelsForEntityValueId = ['fa_role', 'layout', 'catalog_type']

module.exports = {
    operations,
    errorMessages,
    modelsMap,
    cardConfigFieldsId,
    fieldReferenceKeys,
    createEntityMap,
    appActionPlacemenTypes,
    actionTypes,
    appearanceTypes,
    operantionTypes,
    aclTypes,
    entityOperationTypes,
    modelForFieldReference,
    choiceListOrderTypes,
    automationsTriggers,
    formRuleOperatoins,
    formRuleOperatoinValues,
    formRuleTypes,
    modelsForEntityValueId
};
