
const fs = require('fs');
const { v4 }  = require('uuid');
const { set, get } = require('lodash');
const { modelsMap, createEntityMap } = require('../utils/common');
const { findOne, findLast, findAll, update, insert } = require('./query');
const {
    reWriteUpdateEntityConfigFiles,
    reWriteFieldsFiles,
    reWriteCreateUpdaTeEntityFiles,
    reWriteSaveCompositeEntityFiles,
    reWriteUpdateOrderFiles,
    reWriteCardConfigFiles,
} = require('./reComposeFiles');
const dir = './fa_changeset';
const { createRecord, updateRecord, getSavedData, saveDataToFile } = require('./helper');
const chalk = require('chalk');

const addChangeset = (data) => {
    return;
};

const addApp = (data, file) => {
    const option = {
        file,
        name: data.args.label,
        label_plural: data.args.label_plural
    };
    data = createRecord(data, 'fa_entity_config', option);
};

const updateApp = (data, file) => {
    const option = {
        name: data.args.label,
    }
    data = updateRecord(data, file, 'fa_entity_config', option);
};

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

const deleteField = (data, file) => {
    const option = {
        app: data.args.entity,
        label: data.args.name_label
    }
    data = updateRecord(data, file, 'fa_field_config', option, true);
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
        name: data.args.field_values.name
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
        file,
        app: data.args.field_values.entityName,
        name: data.args.field_values.title,
    }
    data = updateRecord(data, 'layout', option);
};


const toggleSection = (data, file) => {
    const option = {
        app: data.args.targetApp,
        name: data.args.name,
    };
    data = updateRecord(data, file, 'layout', false, true );
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
        file,
        app: data.args.field_values.entityName,
        name: data.args.field_values.name,
    };
    data = updateRecord(data, 'app_action', option);
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
        file,
        app: data.args.field_values.entityName,
        name: data.args.field_values.fa_field_id,
    };
    data = updateRecord(data, 'fa_acl', option);
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

const addSaveComposite = async (data, file) => {
    const { model, childModel } = modelsMap.get(data.args.parent_entity_id);
    const option = {
        model,
        childModel,
        name: data.args.parent_fields.name,
    };
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
        console.log(chalk.red('please provide correct choicelist name'))
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
    const instance = findLast(model, option);
    if(!instance){
        console.log(chalk.red('data is not present please to update, must be updating system one'));
    };
    const updateSavedData = await createTransportIdsForChildren(instance);
    await saveDataToFile(updateSavedData, instance.file);
    data.args = {...updateSavedData.args };
    data.transports = [{
        id: instance.id,
        field: 'insatnce_id',
        model
    }];
    insert(model, { file, isUpdate: true, isExported: false, ...option });
};

const remapSaveComposite = async () => {
    try {
        modelsMap.forEach(async (value) => await reWriteSaveCompositeEntityFiles(findAll(value.model)));
        createEntityMap.map((model) => reWriteCreateUpdaTeEntityFiles(findAll(model), model));
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
    addField,
    updateField,
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
    addAcl,
    updateAcl,
    toggleAcl,
    addSaveComposite,
    updateSaveComposite,
    remapSaveComposite,
    updateCardConfig,
}

module.exports ={
    runQuery
}