
const fs = require('fs');
const chalk = require('chalk');
const low = require('lowdb');
const FileSync = require('lowdb/adapters/FileSync');
const adapter = new FileSync('db.json');
const db = low(adapter);
const { v4, validate }  = require('uuid');
const { set, filter, get } = require('lodash');
const dir = './fa_changeset';
db.defaults({ 
    app: {}, 
    fields:[], 
    role: {}, 
    section: [], 
    action: [], 
    acl: [], 
    catalog_type: {}, 
    rule_set: {},
    form_rule: {},
    reorder: [],
    cards: []
})
.write();

const notFoundEror = () => {
    console.log(chalk.red('it is not the part of current changeset must be editing system one or from other changeset'))
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
    db.set(`app.${data.args.label}`, {
        id,
        file
    })
    .write();
};

const updateApp = data => {
    let app =  db.get(`app.${data.args.label}`)
    .value();
    if(!app){
        return notFoundEror();
    }
    const obj = {
        id: app.id,
        field: 'id',
        model: 'fa_entity_config'
    };
    data.transports.push(obj);
    updateArgs(data, app.file);
};

const addField = (data, file) => {
    const id = v4();
    const obj = {
        id,
        field: 'transport_id',
        model: 'fa_field_config'
    };
    data.transports.push(obj);
    db.get('fields')
    .push({ app: data.args.entity, name: data.args.name_label, id, file })
    .write();
};

const updateField = (data, file) => {
    const field =  db.get('fields')
        .find({ app: data.args.entity, name: data.args.name_label })
        .value();
    if(!field){
        return notFoundEror();
    }
    const obj = {
        id: field.id,
        field: 'id',
        model: 'fa_field_config'
    };
    data.transports.push(obj);
    set(data, 'args.id', '');
    updateArgs(data, field.file);
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
    db.get('reorder')
    .push({
        file,
        entity,
        entityName,
        isExported: false,
    })
    .write();
};

const reWriteUpdateOrderFiles = () => {
    const instances = db.get('reorder').value();
    instances.map(async (instance) => {
        if(!instance){
            return;
        }

        if(instance.isExported){
            return;
        }

        const file = instance.file;
        if(!fs.existsSync(`${dir}/${file}`)){
            return;
        }

        const fileData = await fs.readFileSync(`${dir}/${file}`);
        const savedData = JSON.parse(fileData);
        savedData.transports.push( {
            order_transport_id_map: savedData.args.order,
            model: instance.entity
        });
        delete savedData.args.order;
        delete savedData.args.entityName;
        const jsonData =  JSON.stringify(savedData, null, 4);
        await fs.writeFileSync(`${dir}/${file}`, jsonData);
        db.get('reorder')
        .find({ entity: instance.entity, entityName: instance.entityName })
        .assign({ isExported: true })
        .write();
    });
};

const updateCardConfig = (data, file) => {
    db.get('cards')
    .push({
        file,
        entity: data.args.entity,
        isExport: false
    })
    .write();
};

const reWriteCardConfigFiles = () => {
    const instances = db.get('cards').value();
    instances.map(async (instance) => {
        if(!instance){
            return;
        }
        if(instance.isExported){
            return;
        }
        const file = instance.file;
        if(!fs.existsSync(`${dir}/${file}`)){
            return;
        }
        const fileData = await fs.readFileSync(`${dir}/${file}`);
        const savedData = JSON.parse(fileData);
        const transports = {};
        Object.keys(savedData.args.card_config_mappings).map((key)=> {
            const value = get(savedData.args.card_config_mappings, `${key}`);
            if(!validate(value)){
                const field = db.get('fields')
                .find({ app: savedData.args.entity, name: value })
                .value();
                field ? set(transports, get(cardConfigFieldsId, key), field.id)
                    : set(savedData.args.card_config_mappings, get(cardConfigFieldsId, key), value);
                delete savedData.args.card_config_mappings[key];
            }
        });
        savedData.transports.push({
            card_config_mappings: { ...transports }
        });
        const jsonData =  JSON.stringify(savedData, null, 4);
        await fs.writeFileSync(`${dir}/${file}`, jsonData);
        db.get('cards')
        .find({ file: file })
        .assign({ isExported: true })
        .write();
    });
};

const deleteField = (data) => {
    const field =  db.get('fields')
        .find({ app: data.args.entity, name: data.args.name_label })
        .value();
    if(!field){
        return notFoundEror();
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
};

const addRole = (data, file) => {
    const id = v4();
    const obj = {
        id,
        field: 'transport_id',
        model: 'fa_role'
    };
    data.transports.push(obj);
    db.set(`role.${data.args.field_values.name}`, {
        id,
        file
    })
    .write();
    
};

const updateRole = (data, file) => {
    const role = db.get(`role.${data.args.field_values.name}`)
    .value();
    if(!role){
        return notFoundEror();
    }
    const obj = {
        id: role.id,
        field: 'id',
        model: 'fa_role'
    };
    data.transports.push(obj);
    updateArgs(data, role.file);
};

const toggleRole = (data, file) => {
    const role = db.get(`role.${data.args.name}`)
    .value();
    if(!role){
        return notFoundEror();
    }
    const obj = {
        id: role.id,
        field: 'entity_value_id',
        model: 'fa_role'
    };
    data.transports.push(obj);
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
    db.get('section')
    .push({ app: data.args.field_values.entityName, title: data.args.field_values.title, id, file })
    .write();
}

const updateSection = (data, file) => {
    const section = db.get('section')
        .find({ app: data.args.field_values.entityName, title: data.args.field_values.title })
        .value();
    if(!section){
        return notFoundEror();
    }
    const obj = {
        id: section.id,
        field: 'transport_id',
        model: 'layout'
    };
    data.transports.push(obj);
    updateArgs(data, section.file);
};


const toggleSection = (data, file) => {
    const section = db.get('section')
        .find({ app: data.args.targetApp, title: data.args.name })
        .value();
    if(!section){
        return notFoundEror();
    }
    const obj = {
        id: section.id,
        field: 'entity_value_id',
        model: 'layout'
    };
    data.transports.push(obj);
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
    db.get('action')
    .push({ app: data.args.field_values.entityName, name: data.args.field_values.name, id, file })
    .write();
};

const updateAppAction = (data, file) => {
    const action = db.get('action')
        .find({ app: data.args.field_values.entityName, name: data.args.field_values.name })
        .value();
    if(!action){
        return notFoundEror();
    }
    const obj = {
        id: action.id,
        field: 'transport_id',
        model: 'app_action'
    };
    data.transports.push(obj);
    updateArgs(data, action.file);
};

const toggleAction = (data, file) => {
    const action = db.get('action')
        .find({ app: data.args.targetApp, name: data.args.name })
        .value();
    if(!action){
        return notFoundEror();
    }
    const obj = {
        id: action.id,
        field: 'entity_value_id',
        model: 'app_action'
    };
    data.transports.push(obj);
    delete data.args.name;
    delete data.args.targetApp;
};

const addAcl = (data, file) => {
    const id = v4();
    const field =  db.get('fields')
    .find({ app: data.args.field_values.entityName, name: data.args.field_values.fa_field_id })
    .value();
    const obj = [{
        id,
        field: 'transport_id',
        model: 'fa_acl'
    }];
    if(field){
        obj.push({
            id: field.id,
            field: 'field_values.fa_field_id',
            model: 'fa_field_config'
        });
    }else {
        console.log(chalk.red('field is not the part of current changeset must be applying on system one or on other changeset'))
    };
    data.transports = data.transports.concat(obj);
    db.get('acl')
    .push({ app: data.args.field_values.entityName, field: data.args.field_values.fa_field_id, id, file })
    .write();
};

const updateAcl = (data, file) => {
    const acl = db.get('acl')
        .find({ app: data.args.field_values.entityName, field: data.args.field_values.fa_field_id })
        .value();
    if(!acl){
        return notFoundEror();
    }
    const obj = {
        id: acl.id,
        field: 'transport_id',
        model: 'app_action'
    };
    data.transports.push(obj);
    updateArgs(data, acl.file);
};

const toggleAcl = (data, file) => {
    const acl = db.get('acl')
    .find({ app: data.args.targetApp, field: data.args.tragetField })
    .value();
    if(!acl){
        return notFoundEror();
    }
    const obj = {
        id: acl.id,
        field: 'entity_value_id',
        model: 'fa_acl'
    };
    data.transports.push(obj);
    delete data.args.targetApp;
    delete data.args.tragetField;
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
    db.set(`${model}.${data.args.name}`, {
        id,
        file,
        childModel
    })
    .write();
    data.args.name && data.args.parent_fields.push(['name', data.args.name]);
    data.args.entityName && data.args.parent_fields.shift() && data.args.parent_fields.push(['entityName', data.args.entityName]);
    if(data.args.tragetField){
        const field = db.get('fields')
        .find({ app: data.args.entityName, name: data.args.tragetField })
        .value();
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
    const instance = db.get(`${model}.${data.args.name}`)
        .value();
    
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
        db.set(`${model}.${data.args.name}.update`, file)
        .write();
        db.set(`${model}.${data.args.name}.isExported`, false).write();
        const mapedChildTransprots = mapTransportIdsForUpatedChildren(savedData.args.children, childTransprots.id, childModel);
        data.transports = mapedChildTransprots;
    };
    data.args = savedData.args;
    data.transports.push(parentTransport);
    isExport && delete data.args.name;
};

const reWriteSaveCompositeEntityFiles = async (instances, model) => Promise.all(
    Object.keys(instances).map(async (name) => {
    const instance = db.get(`${model}.${name}`)
    .value();

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
        db.set(`${model}.${name}.isExported`, true).write();
    };
}));

const remapSaveComposite =  () => {
    try {
        modelsMap.forEach((value) => reWriteSaveCompositeEntityFiles(db.get(value.model).value(), value.model));
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