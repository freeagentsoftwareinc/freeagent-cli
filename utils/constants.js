const chalk = require('chalk');

// map to map the commands and operaion
const operations = new Map([
    ['init', {
        payload: 'addChangeset',
        api: 'changeset',
        action: 'addChangeset',
        sucessMessage: `new changeset initialized, please find fa_changeset folder at ${process.cwd()}`
    }],
    ['add-app', {
        payload: 'addEntity',
        api: 'addEntity',
        action: 'addApp',
        sucessMessage: 'created app successfully'
    }],
    ['update-app', {
        payload: 'updateApp',
        api: 'updateEntityConfig',
        action: 'updateApp',
        sucessMessage: 'updated the app successfully'
    }],
    ['activate-app', {
        payload: 'activateApp',
        api: 'updateEntityConfig',
        action: 'toggleApp',
        sucessMessage: 'activated the apps successfully'
    }],
    ['deactivate-app', {
        payload: 'deactivateApp',
        api: 'updateEntityConfig',
        action: 'toggleApp',
        sucessMessage: 'deactivated the app successfully'
    }],
    ['reorder-app', {
        payload: 'updateOrder',
        api: 'bulkUpdateOrder',
        action: 'updateOrder',
        sucessMessage: 'reorderd the apps successfully'
    }],
    ['add-line', {
        payload: 'addEntity',
        api: 'addEntity',
        action: 'addLine',
        sucessMessage: 'created new line successfully'
    }],
    ['activate-line', {
        payload: 'activateApp',
        api: 'updateEntityConfig',
        action: 'toggleLine',
        sucessMessage: 'activated the line successfully'
    }],
    ['deactivate-line', {
        payload: 'deactivateApp',
        api: 'updateEntityConfig',
        action: 'toggleLine',
        sucessMessage: 'deactivated the line successfully'
    }],
    ['add-field', {
        payload: 'addCustomField',
        api: 'addCustomField',
        action: 'addField',
        sucessMessage: 'created new field successfully'
    }],
    ['update-field', {
        payload: 'addCustomField',
        api: 'updateFieldConfig',
        action: 'updateField',
        sucessMessage: 'updated the field successfully'
    }],
    ['activate-field', {
        payload: 'activateField',
        api: 'updateFieldConfig',
        action: 'toggleField',
        sucessMessage: 'activated the field successfully'
    }],
    ['deactivate-field', {
        payload: 'deactivateField',
        api: 'updateFieldConfig',
        action: 'toggleField',
        sucessMessage: 'deactivated the field successfully'
    }],
    ['reorder-field', {
        payload: 'updateOrder',
        api: 'bulkUpdateOrder',
        action: 'updateOrder',
        sucessMessage: 'reorderd the field successfully'
    }],
    ['delete-field', {
        payload: 'deleteField',
        api: 'deleteCustomField',
        action: 'deleteField',
        sucessMessage: 'deleted the field successfully'
    }],
    ['add-role', {
        payload: 'addRole',
        api: 'createEntity',
        action: 'addRole',
        sucessMessage: 'created the role successfully'
    }],
    ['update-role', {
        payload: 'addRole',
        api: 'updateEntity',
        action: 'updateRole',
        sucessMessage: 'updated the role successfully'
    }],
    ['deactivate-role', {
        payload: 'deactivateRole',
        api: 'updateEntityValue',
        action: 'toggleRole',
        sucessMessage: 'deactivated the role successfully'
    }],
    ['activate-role', {
        payload: 'activateRole',
        api: 'updateEntityValue',
        action: 'toggleRole',
        sucessMessage: 'activated the role successfully'
    }],
    ['add-section', {
        payload: 'addSection',
        api: 'createEntity',
        action: 'addSection',
        sucessMessage: 'created the section successfully'
    }],
    ['update-section', {
        payload: 'addSection',
        api: 'updateEntity',
        action: 'updateSection',
        sucessMessage: 'updated the section successfully'
    }],
    ['reorder-section', {
        payload: 'updateOrder',
        api: 'bulkUpdateOrder',
        action: 'updateOrder',
        sucessMessage: 'reorderd the section successfully'
    }],
    ['deactivate-section', {
        payload: 'deactivateSection',
        api: 'updateEntityValue',
        action: 'toggleSection',
        sucessMessage: 'deactivated the section successfully'
    }],
    ['activate-section', {
        payload: 'activateSection',
        api: 'updateEntityValue',
        action: 'toggleSection',
        sucessMessage: 'activated the section successfully'
    }],
    ['add-action', {
        payload: 'addAction',
        api: 'createEntity',
        action: 'addAppAction',
        sucessMessage: 'created the action successfully'
    }],
    ['update-action', {
        payload: 'addAction',
        api: 'updateEntity',
        action: 'updateAppAction',
        sucessMessage: 'updated the action successfully'
    }],
    ['reorder-action', {
        payload: 'updateOrder',
        api: 'bulkUpdateOrder',
        action: 'updateOrder',
        sucessMessage: 'reorderd the action successfully'
    }],
    ['activate-action', {
        payload: 'activateAction',
        api: 'updateEntityValue',
        action: 'toggleAction',
        sucessMessage: 'activated the action successfully'
    }],
    ['deactivate-action', {
        payload: 'deactivateAction',
        api: 'updateEntityValue',
        action: 'toggleAction',
        sucessMessage: 'deactivated the action successfully'
    }],
    ['add-acl', {
        payload: 'addAcl',
        api: 'createEntity',
        action: 'addAcl',
        sucessMessage: 'created the acl successfully'
    }],
    ['update-acl', {
        payload: 'addAcl',
        api: 'updateEntity',
        action: 'updateAcl',
        sucessMessage: 'created the acl successfully'
    }],
    ['deactivate-acl', {
        payload: 'deactivateAcl',
        api: 'updateEntityValue',
        action: 'toggleAcl',
        sucessMessage: 'deactivated the acl successfully'
    }],
    ['activate-acl', {
        payload: 'activateAcl',
        api: 'updateEntityValue',
        action: 'toggleAcl',
        sucessMessage: 'activate the acl successfully'
    }],
    ['add-choicelist', {
        payload: 'addChoiceList',
        api: 'saveCompositeEntity',
        action: 'addSaveComposite',
        sucessMessage: 'created the choice list successfully'
    }],
    ['update-choicelist', {
        payload: 'addChoiceList',
        api: 'saveCompositeEntity',
        action: 'updateSaveComposite',
        sucessMessage: 'updated the choice list successfully'
    }],
    ['activate-choicelist', {
        payload: 'activateChoiceList',
        api: 'updateEntityValue',
        action: 'toggleChoiceList',
        sucessMessage: 'activated the choicelist successfully'
    }],
    ['deactivate-choicelist', {
        payload: 'deactivateChoiceList',
        api: 'updateEntityValue',
        action: 'toggleChoiceList',
        sucessMessage: 'deactivated the choicelist successfully'
    }],
    ['add-automation', {
        payload: 'addAutomation',
        api: 'saveCompositeEntity',
        action: 'addSaveComposite',
        sucessMessage: 'created the automation successfully'
    }],
    ['update-automation', {
        payload: 'addAutomation',
        api: 'saveCompositeEntity',
        action: 'updateSaveComposite',
        sucessMessage: 'updated the automation successfully'
    }],
    ['activate-automation', {
        payload: 'activateAutomation',
        api: 'updateEntityValue',
        action: 'toggleAutomation',
        sucessMessage: 'activated the automation successfully'
    }],
    ['deactivate-automation', {
        payload: 'deactivateAutomation',
        api: 'updateEntityValue',
        action: 'toggleAutomation',
        sucessMessage: 'deactivated the automation successfully'
    }],
    ['add-formrule', {
        payload: 'addFormRule',
        api: 'saveCompositeEntity',
        action: 'addSaveComposite',
        sucessMessage: 'created the form rule successfully'
    }],
    ['update-formrule', {
        payload: 'addFormRule',
        api: 'saveCompositeEntity',
        action: 'updateSaveComposite',
        sucessMessage: 'updated the form rule successfully'
    }],
    ['reorder-formrule', {
        payload: 'updateOrder',
        api: 'bulkUpdateOrder',
        action: 'updateOrder',
        sucessMessage: 'reorderd the form rules successfully'
    }],
    ['activate-formrule', {
        payload: 'activateFormrule',
        api: 'updateEntityValue',
        action: 'toggleFormrule',
        sucessMessage: 'activated the form rule successfully'
    }],
    ['deactivate-formrule', {
        payload: 'deactivateFormrule',
        api: 'updateEntityValue',
        action: 'toggleFormrule',
        sucessMessage: 'deactivated the form rule successfully'
    }],
    ['reorder-lines', {
        payload: 'updateOrder',
        api: 'bulkUpdateOrder',
        action: 'updateOrder',
        sucessMessage: 'reorderd the lines successfully'
    }],
    ['reorder-relatedlist', {
        payload: 'updateOrder',
        api: 'bulkUpdateOrder',
        action: 'updateOrder',
        sucessMessage: 'reorderd the realated list successfully'
    }],
    ['update-cardconfig', {
        payload: 'updateCardConfigs',
        api: 'updateCardConfigs',
        action: 'updateCardConfigs',
        sucessMessage: 'updated the card configuration successfully'
    }],
    ['add-stage',{
        payload: 'addCatalog',
        api: 'addCatalog',
        action: 'addCatalog',
        sucessMessage: 'new stage got added to the field successfully'
    }],
    ['add-view',{
        payload: 'addView',
        api: 'saveView',
        action: 'addView',
        sucessMessage: 'the new view got added entity successfully'
    }],
    ['update-view',{
        payload: 'addView',
        api: 'updateView',
        action: 'updateView',
        sucessMessage: 'updated the view successfully'
    }],
    ['add-dashboard',{
        payload: 'addDashboard',
        api: 'upsertDashboard',
        action: 'addDashboard',
        sucessMessage: 'the dashboard got added successfully'
    }],
    ['update-dashboard',{
        payload: 'updateDashboard',
        api: 'upsertDashboard',
        action: 'updateDashboard',
        sucessMessage: 'updated dashboard successfully'
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
    card_title: "99250395-196f-46e9-8a72-046d497a06ca",
    team_member:"2837a12e-d3ef-41ec-9a31-166b9aad1149",
    first_line: "7d37035b-c3ac-4a6c-a468-1e1b42d5e2c5",
    second_line: "407534b0-938e-4919-9223-1a9e922d5e0e",
    third_line: "07762e81-a620-4a3a-a24f-905837797e1a",
    fourth_line: "d16ef822-d217-4020-bc20-2ff57a7bd757",
    fifth_line: "e17e3d22-6c9e-41e8-ae12-1d93f84eeb24",
    next_step_card_template_field_id: "3ee6c6c7-3a5e-4a53-9735-154300aebd4f",
};

const fieldReferenceKeys = new Map([
    ['catalog_type_id', 'catalog_type'],
    ['parent_field_id', 'fa_field_config'],
    ['parent_fa_field_id', 'fa_field_config'],
    ['fa_entity_config_id', 'fa_entity_config'],
    ['reference_qualifier', 'fa_field_config'],
    ['reference_fa_field_id', 'fa_field_config'],
    ['parent_custom_field_id', 'fa_field_config'],
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
    automation: 'b635cae1-8529-45bd-8b99-c157b166a553',
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

//   const chartTypes = {
//     horizontalBarChart: '112a90c8-0ac3-4584-abe6-c6ae26d455f8',
//     pieChart: '6382dbb6-cf0d-4ad6-8c4c-24c4e99911d2',
//     barChart: '4270f50a-4acf-4236-9bda-75764b13d596',
//     donutChart: '03eac40b-f356-40a3-b798-c34f7e676713',
//     funnelChart: '69fabbb1-7bb4-4ada-8686-8fb6027b54fd',
//     cycletime: 'f13f96ba-5cfc-464b-bead-e88912fa9a61',
//   }

  const faEntitiesName = [
    'deal',
    'contact', 
    'agent',
    'logo', 
    'team', 
    'even',
    'sync_account_email',
    'task', 
    'email_analytics',
    'task_mention',
    'import',
    'import_column', 
    'import_row', 
    'import_cell_error', 
    'fa_entity_value',
    'catalog',
    'fa_entities',
];

const modelForFieldReference = ['fa_entity_config', 'fa_field_config','fa_role', 'layout', 'catalog_type', 'catalog'];

const modelsForEntityValueId = ['fa_role', 'layout', 'catalog_type', 'form_rule', 'rule_set', 'app_action'];

const updateEntityConfigKeys = [ 'primary_action', 'show_related_list', 'show_app_icon', 'landscape_mode', 'show_seq_id' ];

const chartIds = {
    column_chart: '112a90c8-0ac3-4584-abe6-c6ae26d455f8',
    pie_chart: '6382dbb6-cf0d-4ad6-8c4c-24c4e99911d2',
    bar_chart: '4270f50a-4acf-4236-9bda-75764b13d596',
    donut_chart: '03eac40b-f356-40a3-b798-c34f7e676713',
    funnel: '69fabbb1-7bb4-4ada-8686-8fb6027b54fd',
    cycle_time: 'f13f96ba-5cfc-464b-bead-e88912fa9a61',
    number: '39734cbf-7133-4944-8194-4edf68299b0e'
};
  
const chartTypes = {
    column_chart: 'bar2d',
    pie_chart: 'pie2d',
    bar_chart: 'column2d',
    donut_chart: 'doughnut2d',
    funnel: 'funnel',
    cycle_time: 'cycleTime',
    number: 'number'
};

const defaultFields = ['seq_id', 'description', 'owner_id', 'created_at', 'updated_at', 'created_by', 'updated_by', 'last_activity', 'subteam_id', 'subscribers']


const teamAccess = {
    private: 'cf526280-1be0-441c-b59a-49167556ef01',
    readonly: 'cf526280-1be0-441c-b59a-49167556ef02',
    editable: 'cf526280-1be0-441c-b59a-49167556ef03',
};

const entities = {
    '10913ac7-852e-516e-a2d7-3c24c34600d4': 'catalog_type',
    '6fc34d02-c890-5661-a157-565d99a4fe37': 'catalog',
    'cf7de345-a40b-56cb-b70a-7fb707a5b4b0' : 'rule_set',
    '2c05c9fa-568e-49e2-b435-b84f79fe1d32': 'form_rule',
    'b8bc20b4-cd64-4bc3-98d1-f4584bc8e4ad': 'changeset'
};

const parentRefKeys = {
    catalog_type: 'catalog_type_id',
    rule_set: 'rule_action',
    form_rule: 'app_action'
};

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
    modelsForEntityValueId,
    faEntitiesName,
    updateEntityConfigKeys,
    chartTypes,
    chartIds,
    defaultFields,
    teamAccess,
    entities,
    parentRefKeys
};
