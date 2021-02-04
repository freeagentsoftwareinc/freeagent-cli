
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
const { createRecord, updateRecord, getSavedData } = require('./helper')

const addChangeset = (data) => {
    return;
};

const addApp = (data, file) => {
    const option = {
        name: data.args.label,
        label_plural: data.args.label_plural
    };
    data = createRecord(data, file, 'fa_entity_config', option);
};

const updateApp = (data, file) => {
    const option = {
        name: data.args.label,
    }
    data = updateRecord(data, file, 'fa_entity_config', option);
};

const addField = (data, file) => {
    const option = {
        app: data.args.entity,
        name: data.args.name_label
    }
    const app = find('fa_entity_config', { name: data.args.entity });
    set(data, 'args.related_list_name', (app && app.label_plural) || data.args.entity);
    set(data, 'args.related_list_name_plural', (app && app.label_plural) || data.args.entity);
    data = createRecord(data, file, 'fa_field_config', option)
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
        name: data.args.field_values.name
    };
    data = createRecord(data, file, 'fa_role', option);
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
        app: data.args.field_values.entityName,
        name: data.args.field_values.title,
    }
    data = createRecord(data, file, 'layout', option);
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
    data = updateRecord(data, file, 'layout', false, true );
    delete data.args.name;
    delete data.args.targetApp;
};

const addAppAction = (data, file) => {
    const option = {
        app: data.args.field_values.entityName,
        name: data.args.field_values.name,
    }; 
    data = createRecord(data, file, 'app_action', option);
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
        app: data.args.field_values.entityName,
        name: data.args.field_values.fa_field_id,
    };
    data = createRecord(data, file, 'fa_acl', option);
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

const addSaveComposite = (data, file) => {
    const { model, childModel} = modelsMap.get(data.args.parent_entity_id);
    const id = v4();
    const tansport = {
        id,
        field: 'transport_id',
        model: model
    };
    data.transports.push(tansport);
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
    const savedData = await getSavedData(instance);
    if(!savedData){
        return;
    }
    if(savedData.args.children.length){
        const childTransprots = await createTransportIdsForChildren(savedData, savedFile, childModel, isExport);
        update(model, { name: data.args.name }, {
            update: file,
            isExported:  false 
        });
        const mapedChildTransprots = mapTransportIdsForUpatedChildren(savedData.args.children, childTransprots.id, childModel);
        data.transports = mapedChildTransprots;
    };
    const parentTransport = {
        id: instance.id,
        field: 'instance_id',
        model
    };
    data.args = savedData.args;
    data.transports.push(parentTransport);
    isExport && delete data.args.name;
};

const reWriteSaveCompositeEntityFiles = async (instances, model) => Promise.all(
    Object.keys(instances).map(async (name) => {
    const instance = find(model, { name });
    const savedData = await getSavedData(instance)
    const file = instance.file;
    if(savedData && savedData.args.children.length){
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