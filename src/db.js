
const fs = require('fs');
const { v4 }  = require('uuid');
const { set, filter, get } = require('lodash');
const { modelsMap, errorMessages, createEntityMap } = require('../utils/common');
const { find, findAll, update, insert } = require('./query');
const {
    reWriteUpdateEntityConfigFiles,
    reWriteFieldsFiles,
    reWriteCreateUpdaTeEntityFiles,
    reWriteUpdateOrderFiles,
    reWriteCardConfigFiles
} = require('./reComposeFiles');
const dir = './fa_changeset';

const addChangeset = (data) => {
    return;
};

const updateArgs = (data, file) => {
    if(!fs.existsSync(`${dir}/${file}`)){
        return;
    }
    const fileData = fs.readFileSync(`${dir}/${file}`);
    const savedData = JSON.parse(fileData);
    data.args = { ...data.args, ...savedData.args };
};

const addApp = (data, file) => {
    const id = v4();
    const obj = {
        id,
        field: 'transport_id',
        model: 'fa_entity_config'
    };
    data.transports.push(obj);
    insert('fa_entity_config', {
        id,
        file,
        label: data.args.label,
        label_plural: data.args.label_plural, 
        isSystem: false,
        isExported: false,
        isUpdate: false
    });
};

const updateApp = (data, file) => {
    console.log(findAll('fa_entity_config'));
    let app = find('fa_entity_config', { 
        label: data.args.label, 
        isSystem: false,
        isUpdate: false,
    });
    if(!app || !app.id){
       insert('fa_entity_config', {
            file,
            label: data.args.label, 
            isSystem: true,
            isUpdate: true,
            isExported: false
        });
        return console.log(errorMessages.notFoundEror);
    }
    console.log("here", app);
    const obj = {
        id: app.id,
        field: 'id',
        model: 'fa_entity_config'
    };
    data.transports.push(obj);
    updateArgs(data, app.file);
    update('fa_entity_config', {
        file,
        label: data.args.label, 
        isSystem: true,
        isExported: false,
        isUpdate: true
    });
};

const addField = (data, file) => {
    const id = v4();
    const obj = {
        id,
        field: 'transport_id',
        model: 'fa_field_config'
    };
    const app = find('fa_entity_config', { name: data.args.entity });
    set(data, 'args.related_list_name', (app && app.label_plural) || data.args.entity);
    set(data, 'args.related_list_name_plural', (app && app.label_plural) || data.args.entity);
    data.transports.push(obj);
    insert('fa_field_config', {  
        id,
        file,
        app: data.args.entity,
        name: data.args.name_label,
        isUpdate: false,
        isSystem: false
    });
};

const updateField = (data, file) => {
    const field = find('fa_field_config', { 
        app: data.args.entity,
        name: data.args.name_label,
        isSystem: false
    });
    set(data, 'args.id', '');
    if(!field || !field.id){
        insert('fa_field_config', {
            file,
            label: data.args.name_label, 
            isSystem: true,
            isExported: false,
            isUpdate: true,
        });
        return console.log(errorMessages.notFoundEror);
    }
    const obj = {
        id: field.id,
        field: 'id',
        model: 'fa_field_config'
    };
    data.transports.push(obj);
    updateArgs(data, field.file);
    insert('fa_field_config', {
        file,
        label: data.args.name_label, 
        isSystem: false,
        isExported: false,
        isUpdate: true,
    });
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
    const field =  find('fa_field_config', { 
        app: data.args.entity,
        name: data.args.name_label,
        isSystem: false,
    });
    if(!field || !field.id){
        insert('fa_field_config', {
            file,
            label: data.args.name_label, 
            isSystem: true,
            isExported: false,
            isDelete: true,
        });
        return console.log(errorMessages.notFoundEror);
    }
    const obj = {
        delete_custom_field: {
            id: field.id,
            field: 'id',
            model: 'fa_field_config'
        }
    };
    data.transports.push(obj);
    data.args = {
        id: ''
    };
    insert('fa_field_config', {
        file,
        label: data.args.name_label, 
        isSystem: false,
        isExported: false,
        isDelete: true,
    });
};

const addRole = (data, file) => {
    const id = v4();
    const obj = {
        id,
        field: 'transport_id',
        model: 'fa_role'
    };
    data.transports.push(obj);
    insert('fa_role', {
        id,
        file,
        name: data.args.field_values.name,
        isSystem: false,
        isUpdate: false,
        isExported: false
    });
};

const updateRole = (data, file) => {
    const role = find('fa_role', {
        name: data.args.field_values.name,
        isSystem: false,
        isUpdate: false,
    });
    set(data, 'args.id', '');
    if(!role || !role.id){
        insert('fa_role', {
            file,
            name: data.args.field_values.name,
            isSystem: true,
            isUpdate: true
        });
        return console.log(errorMessages.notFoundEror);
    }
    const obj = {
        id: role.id,
        field: 'id',
        model: 'fa_role'
    };
    data.transports.push(obj);
    updateArgs(data, role.file);
    insert('fa_role', {
        file,
        name: data.args.field_values.name,
        isSystem: false,
        isUpdate: true,
        isExported: false
    });
};

const toggleRole = (data, file) => {
    const role = find('fa_role', { 
        name: data.args.name,
        isSystem: false,
        isUpdate: false,
    });
    if(!role || !role.id){
        insert('fa_role', {
            file,
            name: data.args.name,
            isSystem: true,
            isToggle: true,
            isUpdate: true,
        });
        return console.log(errorMessages.notFoundEror);
    }
    const obj = {
        id: role.id,
        field: 'entity_value_id',
        model: 'fa_role'
    };
    data.transports.push(obj);
    update('fa_role', { name: data.args.name,isSystem: true }, { isUpdate: true })
    delete data.args.name;
};

const addSection = (data, file) => {
    const id = v4();
    const obj = {
        id,
        field: 'transport_id',
        model: 'layout'
    };
    data.transports.push(obj);
    insert('layout', { 
        id,
        file,
        app: data.args.field_values.entityName,
        name: data.args.field_values.title,
        isSystem: false,
        isUpdate: false,
        isExported: false
    });
};

const updateSection = (data, file) => {
    const section = find('layout', {
        app: data.args.field_values.entityName,
        name: data.args.field_values.title,
        isSystem: false,
        isUpdate: false,
    });
    set(data, 'args.id', '');
    if(!section || !section.id){
        insert('layout', {
            file,
            app: data.args.field_values.entityName,
            name: data.args.field_values.title,
            isSystem: true,
            isUpdate: true,
            isExported: false
        });
        return console.log(errorMessages.notFoundEror);
    }
    const obj = {
        id: section.id,
        field: 'id',
        model: 'layout'
    };
    data.transports.push(obj);
    updateArgs(data, section.file);
    insert('layout', {
        file,
        app: data.args.field_values.entityName,
        name: data.args.field_values.title,
        isSystem: false,
        isUpdate: true,
        isExported: false
    });
};


const toggleSection = (data, file) => {
    const section = find('layout', {
        app: data.args.targetApp,
        name: data.args.name,
        isSystem: false,
        isUpdate: false,
    });
    if(!section){
        insert('layout', {
            file,
            app: data.args.targetApp,
            name: data.args.name,
            isSystem: true,
            isToggle: true,
            isExported: false
        });
        return console.log(errorMessages.notFoundEror);
    }
    const obj = {
        id: section.id,
        field: 'entity_value_id',
        model: 'layout'
    };
    data.transports.push(obj);
    insert('layout', {
        file,
        app: data.args.targetApp,
        name: data.args.name,
        isSystem: false,
        isToggle: true,
        isExported: false
    });
    delete data.args.name;
    delete data.args.targetApp;
};

const addAppAction = (data, file) => {
    const id = v4();
    const obj = {
        id,
        field: 'transport_id',
        model: 'app_action'
    };
    data.transports.push(obj);
    insert('app_action', {
        id,
        file,
        app: data.args.field_values.entityName,
        name: data.args.field_values.name,
        isSystem: false,
        isUpdate: false,
        isExported: false
    });
};

const updateAppAction = (data, file) => {
    const action = find('app_action', {
        app: data.args.field_values.entityName,
        name: data.args.field_values.name,
        isSystem: false,
        isUpdate: false,
    });
    set(data, 'args.id', '');
    if(!action || !action.id){
        insert('app_action', {
            file,
            app: data.args.field_values.entityName,
            name: data.args.field_values.name,
            isSystem: true,
            isUpdate: true,
            isExported: false
        });
        return console.log(errorMessages.notFoundEror);
    }
    const obj = {
        id: action.id,
        field: 'transport_id',
        model: 'app_action'
    };
    data.transports.push(obj);
    updateArgs(data, action.file);
    insert('app_action', {
        file,
        app: data.args.field_values.entityName,
        name: data.args.field_values.name,
        isSystem: false,
        isUpdate: true,
        isExported: false
    });
};

const toggleAction = (data, file) => {
    const action = find('app_action', {
        app: data.args.targetApp,
        name: data.args.name,
        isSystem: false,
        isUpdate: false,
    });
    if(!action && !action.id){
        insert('app_action', {
            file,
            app: data.args.targetApp,
            name: data.args.name,
            isSystem: true,
            isToggle: true,
            isExported: false
        });
        return console.log(errorMessages.notFoundEror);
    }
    const obj = {
        id: action.id,
        field: 'entity_value_id',
        model: 'app_action'
    };
    data.transports.push(obj);
    insert('app_action', {
        file,
        app: data.args.targetApp,
        name: data.args.name,
        isSystem: false,
        isToggle: true,
        isExported: false
    });
    delete data.args.name;
    delete data.args.targetApp;
};

const addAcl = (data, file) => {
    const id = v4();
    const obj = [{
        id,
        field: 'transport_id',
        model: 'fa_acl'
    }];
    data.transports = data.transports.concat(obj);
    insert('fa_acl', {
        id,
        file,
        app: data.args.field_values.entityName,
        name: data.args.field_values.fa_field_id,
        isSystem: false,
        isUpdate: false,
        isExported: false
    });
};

const updateAcl = (data, file) => {
    const acl = find('fa_acl', {
        app: data.args.field_values.entityName,
        name: data.args.field_values.fa_field_id,
        isSystem: false,
        isUpdate: false,
    });
    set(data, 'args.id', '');
    if(!acl || !acl.id){
        insert('fa_acl', {
            file,
            app: data.args.field_values.entityName,
            name: data.args.field_values.fa_field_id,
            isSystem: true,
            isUpdate: true,
            isExported: false
        });
        return console.log(errorMessages.notFoundEror);
    }
    const obj = {
        id: acl.id,
        field: 'transport_id',
        model: 'app_action'
    };
    data.transports.push(obj);
    updateArgs(data, acl.file);
    insert('fa_acl', {
        id: acl.id,
        file,
        app: data.args.field_values.entityName,
        name: data.args.field_values.fa_field_id,
        isSystem: false,
        isUpdate: true,
        isExported: false
    });
};

const toggleAcl = (data, file) => {
    const acl = find('fa_acl', {
        app: data.args.targetApp,
        name: data.args.tragetField,
        isSystem: false,
        isUpdate: false,
    });
    if(!acl && !acl.id){
        insert('fa_acl', {
            file,
            app: data.args.targetApp,
            name: data.args.tragetField,
            isSystem: true,
            isToggle: true,
            isExported: false
        });
        return console.log(errorMessages.notFoundEror);
    }
    const obj = {
        id: acl.id,
        field: 'entity_value_id',
        model: 'fa_acl'
    };
    data.transports.push(obj);
    insert('fa_acl', {
        file,
        app: data.args.targetApp,
        name: data.args.tragetField,
        isSystem: true,
        isToggle: true,
        isExported: false
    });
    delete data.args.targetApp;
    delete data.args.fa_field_id;
};

const addSaveComposite = (data, file) => {
    const { model, childModel} = modelsMap.get(data.args.parent_entity_id);
    const id = v4();
    const obj = {
        id,
        field: 'transport_id',
        model: model
    };
    data.transports.push(obj);
    insert(model, {
        id,
        file,
        model,
        childModel,
        name: data.args.name,
    });
    data.args.name && data.args.parent_fields.push(['name', data.args.name]);
    data.args.entityName && data.args.parent_fields.shift() 
        && data.args.parent_fields.push(['entityName', data.args.entityName]);
    if(data.args.tragetField){
        const field = find('fa_field_config',{
            app: data.args.entityName,
            name: data.args.tragetField
        });
        if(field && field.id){
            data.transports.push({
                id: field.id,
                field: 'parent_fields[0][1]',
                model: 'fa_field_config'
            });
        }
    }
};

const reMapTransportIds = (data, model, isExport) => {
    const newlyAddedTransports = filter(data.transports, (transport) => (transport.field === 'transport_id' || transport.field === 'instance_id')  );
    const updatedChildren = [];
    data.args.children.forEach((child, index) => {
        if(!child.id){
            return;
        }
        const id = get(child, 'id')
        isExport && delete child.id;
        updatedChildren.push({
            id,
            field:`children[${index}].custom_fields[0][1]`,
            model
        });
    });
    data.transports = [...newlyAddedTransports, ...updatedChildren];
}

const createTransportIdsForChildren = async (savedData, file, model, isExport=false) => {
    const newChildren = [];
    const updatedChildren = [];
    const newTransprotIds = {
        id: [],
        field: 'transport_id',
        model
    };
    savedData.args.children.forEach((child) => {

        if(child.id){
            return updatedChildren.push(child);
        }
        const id = v4()
        newChildren.push(child);
        newTransprotIds.id.push(id);
    });
    savedData.args.children = [...newChildren, ...updatedChildren];
    newTransprotIds.id.length && savedData.transports.unshift(newTransprotIds);

    if(updatedChildren.length){
        reMapTransportIds(savedData, model, isExport);
    }
    isExport && delete savedData.args.name;
    const jsonData =  JSON.stringify(savedData, null, 4);
    const filePath = `${dir}/${file}`
    await fs.writeFileSync(`${filePath}`, jsonData);
    return newTransprotIds;
};

const mapTransportIdsForUpatedChildren = (children, transportIds, model) => children.map((child, index) => {
        const id = transportIds[index] || child.id;
        set(child, 'id', id)
        child.custom_fields.unshift(['id', '']);
        return {
            id,
            field:`children[${index}].custom_fields[0][1]`,
            model
        };
    });

const updateSaveComposite = async (data, file, isExport=false) => {
    const { model, childModel} = modelsMap.get(data.args.parent_entity_id);
    const instance = find(model, { name: data.args.name, model, childModel });

    if(!instance){
      return;
    }
    
    if(!fs.existsSync(`${dir}/${file}`)){
        return;
    };

    const parentTransport = {
        id: instance.id,
        field: 'instance_id',
        model
    };
    const savedFile = instance.update || instance.file;
    const fileData = fs.readFileSync(`${dir}/${savedFile}`);
    const savedData = JSON.parse(fileData);

    if(savedData.args.children.length){
        const childTransprots = await createTransportIdsForChildren(savedData, savedFile, childModel, isExport);
        update(model, { name: data.args.name }, {
            update: file,
            isExported:  false 
        });
        const mapedChildTransprots = mapTransportIdsForUpatedChildren(savedData.args.children, childTransprots.id, childModel);
        data.transports = mapedChildTransprots;
    };
    data.args = savedData.args;
    data.transports.push(parentTransport);
    isExport && delete data.args.name;
};

const reWriteSaveCompositeEntityFiles = async (instances, model) => Promise.all(
    Object.keys(instances).map(async (name) => {
    const instance = find(model, { name });

    if(!instance){
        return;
    }

    if(instance.isExported){
        return;
    }

    const file = instance.update || instance.file;
    if(!fs.existsSync(`${dir}/${file}`)){
        return;
    }
    const fileData = await fs.readFileSync(`${dir}/${file}`);
    const savedData = JSON.parse(fileData);
    if(savedData.args.children.length){
        instance.update ? await updateSaveComposite(savedData, file, true) : 
        await createTransportIdsForChildren(savedData, file, instance.childModel, true);
        update(model, { name }, { isExported: true });
    };
}));

const remapSaveComposite = () => {
    try {
        modelsMap.forEach((value) => reWriteSaveCompositeEntityFiles(findAll(value.model), value.model));
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