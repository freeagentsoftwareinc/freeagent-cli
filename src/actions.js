
const chalk = require('chalk');
const { v4 }  = require('uuid');
const { set, get } = require('lodash');
const { modelsMap, createEntityMap, errorMessages } = require('../utils/constants');
const { findOne, findLast, findAll, insert } = require('./db');
const { createRecord, updateRecord, getSavedData, saveDataToFile } = require('./helper');
const {
    reWriteUpdateEntityConfigFiles,
    reWriteFieldsFiles,
    reWriteCreateUpdateEntityFiles,
    reWriteSaveCompositeEntityFiles,
    reWriteUpdateOrderFiles,
    reWriteCardConfigFiles,
} = require('./reComposeFiles');

const addChangeset = (data) => {
    return;
};

const addApp = (data, file) => {
    const option = {
        file,
        name: data.args.label,
        label_plural: data.args.label_plural,
        isLine: false
    };
    data = createRecord(data, 'fa_entity_config', option);
};

const updateApp = (data, file) => {
    const option = {
        name: data.args.label,
        isLine: false,
    }
    data = updateRecord(data, file, 'fa_entity_config', option);
};

const toggleApp = (data, file) => {
    const option = {
        name: data.args.name,
    };
    data = updateRecord(data, file, 'fa_entity_config', option, false, true);
    delete data.args.name;
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
}
const addField = (data, file) => {
    const option = {
        file,
        app: data.args.entity,
        name: data.args.name_label
    }
    const app = findOne('fa_entity_config', { name: data.args.entity });
    set(data, 'args.related_list_name', (app && app.label_plural) || data.args.entity);
    set(data, 'args.related_list_name_plural', (app && app.label_plural) || data.args.entity);
    data = createRecord(data, 'fa_field_config', option)
};

const updateField = (data, file) => {
    const option = {
        app: data.args.entity,
        name: data.args.name_label
    }
    data = updateRecord(data, file, 'fa_field_config', option);
};

const deleteField = (data, file) => {
    const option = {
        app: data.args.entity,
        name: data.args.name_label
    }
    data = updateRecord(data, file, 'fa_field_config', option, true);
    delete data.args.entity;
    delete data.args.name_label;
};

const toggleField = (data, file) => {
    const option = {
        app: data.args.entity,
        name: data.args.name_label
    }
    data = updateRecord(data, file, 'fa_field_config', option, false, true);
    delete data.args.entity;
    delete data.args.name_label;
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
};

const updateCardConfig = (data, file) => {
    insert('cards', {
        file,
        entity: data.args.entity,
        isExport: false
    });
};

const addRole = (data, file) => {
    const option = {
        file,
        name: data.args.field_values.name
    };
    data = createRecord(data, 'fa_role', option);
};

const updateRole = (data, file) => {
    const option = {
        name: data.args.field_values.name
    };
    data = updateRecord(data, file, 'fa_role', option);
};

const toggleRole = (data, file) => {
    const option = {
        name: data.args.name
    };
    data = updateRecord(data, file, 'fa_role', option, false, true);
    delete data.args.name;
};

const addSection = (data, file) => {
    const option = {
        file,
        app: data.args.field_values.entityName,
        name: data.args.field_values.title,
    }
    data = createRecord(data, 'layout', option);
};

const updateSection = (data, file) => {
    const option = {
        app: data.args.field_values.entityName,
        name: data.args.field_values.title,
    }
    data = updateRecord(data, file, 'layout', option);
};


const toggleSection = (data, file) => {
    const option = {
        app: data.args.targetApp,
        name: data.args.name,
    };
    data = updateRecord(data, file, 'layout', option, false, true );
    delete data.args.name;
    delete data.args.targetApp;
};

const addAppAction = (data, file) => {
    const option = {
        file,
        app: data.args.field_values.entityName,
        name: data.args.field_values.name,
    }; 
    data = createRecord(data, 'app_action', option);
};

const updateAppAction = (data, file) => {
    const option = {
        app: data.args.field_values.entityName,
        name: data.args.field_values.name,
    };
    data = updateRecord(data, file, 'app_action', option);
};

const toggleAction = (data, file) => {
    const option = {
        app: data.args.targetApp,
        name: data.args.name,
    };
    data = updateRecord(data, file, 'app_action', option, false, true);
    delete data.args.name;
    delete data.args.targetApp;
};

const addAcl = (data, file) => {
    const option = {
        file,
        app: data.args.field_values.entityName,
        name: data.args.field_values.fa_field_id,
    };
    data = createRecord(data, 'fa_acl', option);
};

const updateAcl = (data, file) => {
    const option = {
        app: data.args.field_values.entityName,
        name: data.args.field_values.fa_field_id,
    };
    data = updateRecord(data, file, 'fa_acl', option);
};

const toggleAcl = (data, file) => {
    const option = {
        app: data.args.targetApp,
        name: data.args.tragetField,
    };
    data = updateRecord(data, file, 'fa_acl', option, false, true);
    delete data.args.targetApp;
    delete data.args.fa_field_id;
};

const toggleChoiceList = (data, file) => {
    const option = {
        name: data.args.name,
    };
    data = updateRecord(data, file, 'catalog_type', option, false, true);
    delete data.args.name;
};

const toggleAutomation = (data, file) => {
    const option = {
        name: data.args.name,
    };
    data = updateRecord(data, file, 'rule_set', option, false, true);
    delete data.args.name;
};

const toggleFormrule = (data, file) => {
    const option = {
        name: data.args.description,
    };
    data = updateRecord(data, file, 'form_rule', option, false, true);
    delete data.args.description;
    delete data.args.entityName;
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
       console.log(chalk.red('name aleady is there, please new one'));
        throw new Error(
           'name exisits'
        )
    };
    data = createRecord(data, model, { file, ...option });
};

const createTransportIdsForChildren = async (instance) => {
    const savedData = await getSavedData(instance);
    if(!savedData){
        console.log(chalk.red('please provide correct choicelist name, if you are not editing system one'))
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
        console.log(chalk.red('data is not present please to update, must be updating system one'));
    };
    const updateSavedData = await createTransportIdsForChildren(instance);
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
};

const remapSaveComposite = async () => {
    try {
        modelsMap.forEach(async (value) => await reWriteSaveCompositeEntityFiles(findAll(value.model)));
        createEntityMap.map((model) => reWriteCreateUpdateEntityFiles(findAll(model), model));
        reWriteUpdateEntityConfigFiles();
        reWriteFieldsFiles();
        reWriteUpdateOrderFiles();
        reWriteCardConfigFiles();
    } catch(e) {
        throw e;
    }
};

const runQuery = {
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
    updateCardConfig,
    toggleAutomation,
    toggleFormrule
}

module.exports ={
    runQuery
}