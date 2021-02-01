
const { args } = require('commander');
const fs = require('fs');
const chalk = require('chalk');
const low = require('lowdb');
const FileSync = require('lowdb/adapters/FileSync');
const adapter = new FileSync('db.json');
const db = low(adapter);
const uuid  = require('node-uuid');
const { set, filter, get, isArguments } = require('lodash');
const { chdir } = require('process');
const dir = './fa_changeset';
db.defaults({ app: {}, fields:[], role: {}, section: [], action: [], acl: [], catalog_type: {}, rule_set: {}, form_rule: {} })
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

const addChangeset = (data) => {
    return;
};

const updateArgs = (data, file) => {
    const fileData = fs.readFileSync(`${dir}/${file}`);
    const savedData = JSON.parse(fileData);
    data.args = { ...data.args, ...savedData.args };
};

const addApp = (data, file) => {
    const id = uuid.v4();
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
    const id = uuid.v4();
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
    updateArgs(data, field.file);
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
    const id = uuid.v4();
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
    const id = uuid.v4();
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
    const id = uuid.v4();
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
    const id = uuid.v4();
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
    const id = uuid.v4();
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
    data.args.parent_fields.push(['name', data.args.name]);
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

const createTransportIdsForChildren = (savedData, file, model, isExport=false) => {
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
        const id = uuid.v4()
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
    fs.writeFileSync(`${filePath}`, jsonData);
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

const updateSaveComposite = (data, file, isExport=false) => {
    const { model, childModel} = modelsMap.get(data.args.parent_entity_id);
    const instance = db.get(`${model}.${data.args.name}`)
        .value();
    if(!instance){
      return;
    }
    const parentTransport = {
        id: instance.id,
        field: 'instance_id',
        model
    };
    const savedFile = instance.update || instance.file;
    const fileData = fs.readFileSync(`${dir}/${savedFile}`);
    const savedData = JSON.parse(fileData);
    if(savedData.args.children.length){
        const childTransprots = createTransportIdsForChildren(savedData, savedFile, childModel, isExport);
        db.set(`${model}.${data.args.name}.update`, file)
        .write();
        const mapedChildTransprots = mapTransportIdsForUpatedChildren(savedData.args.children, childTransprots.id, childModel);
        data.transports = mapedChildTransprots;
    };
    data.args = savedData.args;
    data.transports.push(parentTransport);
    isExport && delete data.args.name;
};

const reWriteFiles = async (instances, model) => Promise.all(
    Object.keys(instances).map((name) => {
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
    const fileData = fs.readFileSync(`${dir}/${file}`);
    const savedData = JSON.parse(fileData);
    if(savedData.args.children.length){
        instance.update ? updateSaveComposite(savedData, file, true) : 
        createTransportIdsForChildren(savedData, file, instance.childModel, true);
        db.set(`${model}.${name}`, {
            isExported: true
        }).write();
    };
}));

const remapSaveComposite = async () => {
    try {
        await modelsMap.forEach((value) => reWriteFiles(db.get(value.model).value(), value.model));
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
    remapSaveComposite
}

module.exports ={
    runQuery
}