
const chalk = require('chalk');
const { v4 }  = require('uuid');
const { set, get, snakeCase } = require('lodash');
const { modelsMap, createEntityMap, faEntitiesName, errorMessages } = require('../utils/constants');
const { findOne, findLast, findAll, insert, resetDb } = require('./db');
const { createRecord, updateRecord, getSavedData, saveDataToFile, createDefaultField } = require('./helper');
const {
    reWriteUpdateEntityConfigFiles,
    reWriteFieldsFiles,
    reWriteCreateUpdateEntityFiles,
    reWriteSaveCompositeEntityFiles,
    reWriteUpdateOrderFiles,
    reWriteCardConfigFiles,
    reWriteStageFields,
    reWriteViewFiles,
    reWriteDashboardFiles
} = require('./reComposeFiles');

const addChangeset = (data) => {
    const option = {
        name: data.args.name,
        description: data.args.description
    }
    // const changeset = findOne('fa_changeset', option);
    // if( changeset){
    //     console.log(chalk.red(`changeset name ${data.args.name} exists, please use different name`));
    //     return;
    // }
    createRecord(data, 'fa_changeset', option);
    return option;
};

const addApp = (data, file) => {
    const option = {
        file,
        name: data.args.label,
        label_plural: data.args.label_plural,
        isLine: false
    };
    if(faEntitiesName.includes(snakeCase(data.args.label))){
        console.log(chalk.red(`The system app exists called ${data.args.label}, please use the different name`));
        return;
    };
    data = createRecord(data, 'fa_entity_config', option);
    const defaultFeildTransports = createDefaultField(data.args.label);
    data.transports.push(defaultFeildTransports);
    return { ...data }
};

const updateApp = (data, file) => {
    const option = {
        name: data.args.label,
        isLine: false,
    }
    data = updateRecord(data, file, 'fa_entity_config', option);
    return { ...data }
};

const toggleApp = (data, file) => {
    const option = {
        name: data.args.name,
    };
    data = updateRecord(data, file, 'fa_entity_config', option, false, true);
    delete data.args.name;
    return { ...data }
};

const addLine = (data, file) => {
    const where = {
        name: data.args.parent_id,
        isLine: false,
    };
    const app = findOne('fa_entity_config', where);
    const parentId = (app && app.id) ? app.id : '';
    if(!parentId){
        console.log(errorMessages.notFoundEror);
    }
    const option = {
        file,
        name: data.args.label,
        label_plural: data.args.label_plural,
        parent_id: parentId,
        isLine: true,
        
    };
    data = createRecord(data, 'fa_entity_config', option);
    set(data, 'args.parent_id', parentId);
    return { ...data }
};

const toggleLine = (data, file) => {
    const where = {
        name: data.args.parent_id,
        isLine: false,
    };
    const app = findOne('fa_entity_config', where);
    const parentId = (app && app.id) ? app.id : '';
    const option = {
        name: data.args.label,
        parent_id: parentId,
        isLine: true,
    };
    data = updateRecord(data, file, 'fa_entity_config', option, false, true);
    delete data.args.parent_id;
    delete data.args.label;
    return { ...data }
}
const addField = (data, file) => {
    const option = {
        file,
        app: data.args.entity,
        name: data.args.name_label
    }
    const app = findOne('fa_entity_config', { name: data.args.entity });
    if(!app){
        console.log(chalk.red('Targeted app is not present in current changeset, adding field considering the system / other changeset app'));
    };
    set(data, 'args.related_list_name', (app && app.label_plural) || data.args.entity);
    set(data, 'args.related_list_name_plural', (app && app.label_plural) || data.args.entity);
    data = createRecord(data, 'fa_field_config', option);
    return { ...data }
};

const updateField = (data, file) => {
    const option = {
        app: data.args.entity,
        name: data.args.name_label
    }
    data = updateRecord(data, file, 'fa_field_config', option);
    return { ...data }
};

const deleteField = (data, file) => {
    const option = {
        app: data.args.entity,
        name: data.args.name_label
    }
    data = updateRecord(data, file, 'fa_field_config', option, true);
    if(data.transports.length){
        const id = get(data.transports.pop(), 'id');
        data.transports.push({
            delete_custom_field: {
            id,
            field: 'id',
            model: 'fa_field_config'
          }
        });
    }
    delete data.args.entity;
    delete data.args.name_label;
    return { ...data }
};

const toggleField = (data, file) => {
    const option = {
        app: data.args.entity,
        name: data.args.name_label
    }
    data = updateRecord(data, file, 'fa_field_config', option, false, true);
    delete data.args.entity;
    delete data.args.name_label;
    return { ...data }
};

const addCatalog = (data, file) => {
    const option = {
        file,
        name: data.args.catalog.name,
        app: data.args.catalog.entityName,
        field: data.args.catalog.custom_field_id,
    };
    const field = findOne('fa_field_config', { name: option.field, app: option.entityName });
    if(!field){
        set(data, 'args.catalog.fa_field_config_id', '');
        console.log(chalk.red('Targeted field is not present in current changeset, adding stage considering the system / other changeset app'));
    };
    const catalog = findLast('catalog', { name: option.name, field: option.field, app: option.entityName });
    const order = (catalog && catalog.order) ? (catalog.order + 1) : 1;
    set(data, 'args.catalog.order', order);
    set(option, 'order', order);
    data = createRecord(data, 'catalog', option);
    return {
        ...data
    }
};

const updateOrder = (data, file) => {
    const entityName = get(data, 'args.entityName');
    const entity = get(data, 'args.entity');
    const field_name = get(data, 'args.field_name');
    const field_value = get(data, 'args.field_value');
    if(field_name && field_value) {
        data.args.filters.push({
            field_name,
            values: [field_value]
        });
        delete data.args.field_name;
        delete data.args.field_value;
    }
    insert('reorder', {
        file,
        entity,
        entityName,
        isExported: false,
    });
    return { ...data }
};

const updateCardConfigs = (data, file) => {
    insert('cards', {
        file,
        entity: data.args.entity,
        isExported: false
    });
    return { ...data }
};

const addRole = (data, file) => {
    const option = {
        file,
        name: data.args.field_values.name
    };
    data = createRecord(data, 'fa_role', option);
    return { ...data }
};

const updateRole = (data, file) => {
    const option = {
        name: data.args.field_values.name
    };
    data = updateRecord(data, file, 'fa_role', option);
    return { ...data }
};

const toggleRole = (data, file) => {
    const option = {
        name: data.args.name
    };
    data = updateRecord(data, file, 'fa_role', option, false, true);
    delete data.args.name;
    return { ...data }
};

const addSection = (data, file) => {
    const option = {
        file,
        app: data.args.field_values.entityName,
        name: data.args.field_values.title,
    }
    const app = findOne('fa_entity_config', { name: data.args.field_values.entityName });
    if(!app){
        console.log(chalk.red('Targeted app is not present in current changeset, adding section considering the system / other changeset app'));
    };
    data = createRecord(data, 'layout', option);
    return { ...data }
};

const updateSection = (data, file) => {
    const option = {
        app: data.args.field_values.entityName,
        name: data.args.field_values.title,
    }
    data = updateRecord(data, file, 'layout', option);
    return { ...data }
};


const toggleSection = (data, file) => {
    const option = {
        app: data.args.targetApp,
        name: data.args.name,
    };
    data = updateRecord(data, file, 'layout', option, false, true );
    delete data.args.name;
    delete data.args.targetApp;
    return { ...data }
};

const addAppAction = (data, file) => {
    const option = {
        file,
        app: data.args.field_values.entityName,
        name: data.args.field_values.name,
    };
    const app = findOne('fa_entity_config', { name: data.args.field_values.entityName });
    if(!app){
        console.log(chalk.red('Targeted app is not present in current changeset, adding action considering the system / other changeset app'));
    };
    data = createRecord(data, 'app_action', option);
    return { ...data }
};

const updateAppAction = (data, file) => {
    const option = {
        app: data.args.field_values.entityName,
        name: data.args.field_values.name,
    };
    data = updateRecord(data, file, 'app_action', option);
    return { ...data }
};

const toggleAction = (data, file) => {
    const option = {
        app: data.args.targetApp,
        name: data.args.name,
    };
    data = updateRecord(data, file, 'app_action', option, false, true);
    delete data.args.name;
    delete data.args.targetApp;
    return { ...data }
};

const addAcl = (data, file) => {
    const option = {
        file,
        app: data.args.field_values.entityName,
        name: data.args.field_values.fa_field_id,
    };
    const app = findOne('fa_entity_config', { name: data.args.field_values.entityName });
    if(!app){
        console.log(chalk.red('Targeted app is not present in current changeset, adding ACL considering the system / other changeset app'));
    };
    data = createRecord(data, 'fa_acl', option);
    return { ...data }
};

const updateAcl = (data, file) => {
    const option = {
        app: data.args.field_values.entityName,
        name: data.args.field_values.fa_field_id,
    };
    data = updateRecord(data, file, 'fa_acl', option);
    return { ...data }
};

const toggleAcl = (data, file) => {
    const option = {
        app: data.args.targetApp,
        name: data.args.targetField,
    };
    data = updateRecord(data, file, 'fa_acl', option, false, true);
    delete data.args.targetApp;
    delete data.args.fa_field_id;
    return { ...data }
};

const toggleChoiceList = (data, file) => {
    const option = {
        name: data.args.name,
    };
    data = updateRecord(data, file, 'catalog_type', option, false, true);
    delete data.args.name;
    return { ...data }
};

const toggleAutomation = (data, file) => {
    const option = {
        name: data.args.name,
    };
    data = updateRecord(data, file, 'rule_set', option, false, true);
    delete data.args.name;
    return { ...data }
};

const toggleFormrule = (data, file) => {
    const option = {
        name: data.args.description,
    };
    data = updateRecord(data, file, 'form_rule', option, false, true);
    delete data.args.description;
    delete data.args.entityName;
    return { ...data }
};

const addView = (data, file) => {
    const option = {
        file,
        app: data.args.entity,
        name: data.args.name,
    };
    const view = findOne('view', { app: data.args.entity, name: data.args.name });
    if(view){
        console.log(chalk.red('given view name already present, please use name different name'));
        return;
    };
    data = createRecord(data, 'view', option);
    return { ...data }
};

const updateView = (data, file) => {
    const option = {
        app: data.args.entity,
        name: data.args.name,
    };
    data = updateRecord(data, file, 'view', option);
    return { ...data }
};

const addDashboard = (data, file) => {
    const option = {
        file,
        name: data.args.title,
    };
    const dashboard = findOne('dashboard', { name: data.args.title});
    if(dashboard){
        console.log(chalk.red('given dashboard name already present, please use name different name'));
        return;
    };
    data = createRecord(data, 'dashboard', option);
    return { ...data }
};

const updateDashboard = (data, file) => {
    const option = {
        name: data.args.title,
    };
    data = updateRecord(data, file, 'dashboard', option);
    return { ...data }
};


const addSaveComposite = async (data, file) => {
    const { model, childModel } = modelsMap.get(data.args.parent_entity_id);
    const option = {
        model,
        childModel,
        name: data.args.parent_fields.name,
    };

    if(model === 'form_rule'){
        set(option, 'name', data.args.parent_fields.description);
    }
    const isExisingChoiceList = findOne(model, option);
    if(isExisingChoiceList){
       console.log(chalk.red('name already exists in current changeset, please use different name'));
        throw new Error(
           'name exisits'
        )
    };
    data = createRecord(data, model, { file, ...option });
    return { ...data }
};

const createTransportIdsForChildren = async (instance) => {
    const savedData = await getSavedData(instance);
    if(!savedData){
        console.log(chalk.red('Data is not exists in current changeset'))
        return;
    };
    const children = savedData.args.children.map((child) => {
        if(!child.id){
            const id = v4();
            set(child, 'id', id);
            insert(instance.childModel, {
                id,
                file: instance.file,
                parentId: instance.id,
                parentName: instance.name,
            });
            return child;
        }
        return child;
    });
    set(savedData, 'args.children', children);
    return {
        ...savedData
    }
};

const updateSaveComposite = async (data, file) => {
    const { model, childModel } = modelsMap.get(data.args.parent_entity_id);
    const option = {
        model,
        childModel,
        name: data.args.parent_fields.name,
    };

    if(model === 'form_rule'){
        set(option, 'name', data.args.parent_fields.description);
    }

    const instance = findLast(model, option);
    if(!instance){
        console.log(chalk.red('Data is not exists in current changeset'));
    };
    const updateSavedData = instance && await createTransportIdsForChildren(instance);
    if(updateSavedData){
        await saveDataToFile(updateSavedData, instance.file);
        data.args = {...updateSavedData.args };
        data.transports = [{
            id: instance.id,
            field: 'instance_id',
            model
        }];
    };
    if(data.args.children.length){
        data.args.children.forEach((child) => {
            if(!child.id){
                child.id = '';
            }
        })
    }
    insert(model, { file, model, childModel, isUpdate: true, isExported: false, ...option });
    return { ...data }
};

const remapSaveComposite = async () => {
    try {
        modelsMap.forEach(async (value) => await reWriteSaveCompositeEntityFiles(findAll(value.model)));
        createEntityMap.map((model) => reWriteCreateUpdateEntityFiles(findAll(model), model));
        reWriteUpdateEntityConfigFiles();
        reWriteFieldsFiles();
        reWriteUpdateOrderFiles();
        reWriteCardConfigFiles();
        reWriteStageFields();
        reWriteViewFiles();
        reWriteDashboardFiles();
    } catch(e) {
        throw e;
    }
};

const runAction = {
    addChangeset,
    addApp,
    updateApp,
    toggleApp,
    addLine,
    toggleLine,
    addField,
    updateField,
    toggleField,
    updateOrder,
    deleteField,
    addRole,
    updateRole,
    toggleRole,
    addSection,
    updateSection,
    toggleSection,
    addAppAction,
    updateAppAction,
    toggleAction,
    toggleChoiceList,
    addAcl,
    updateAcl,
    toggleAcl,
    addSaveComposite,
    updateSaveComposite,
    remapSaveComposite,
    updateCardConfigs,
    toggleAutomation,
    toggleFormrule,
    addCatalog,
    addView,
    updateView,
    addDashboard,
    updateDashboard
}

module.exports = {
    runAction
}