
const { args } = require('commander');
const fs = require('fs');
const low = require('lowdb');
const FileSync = require('lowdb/adapters/FileSync');
const adapter = new FileSync('db.json');
const db = low(adapter);
const uuid  = require('node-uuid');
const dir = './fa_changeset';
db.defaults({ app: {}, fields:[], role: {}, section: [], action: [], acl: [] })
  .write();

const addChangeset = (data) => {
    return;
}

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
    const app =  db.get(`app.${data.args.label}`)
    .value();
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
    const obj = {
        id: field.id,
        field: 'id',
        model: 'fa_field_config'
    };
    data.transports.push(obj);
    updateArgs(data, field.file);
};

const deleteField = (data) => {
    const app =  db.get('fields')
        .find({ app: data.args.entity, name: data.args.name_label })
        .value();
    const obj = {
        delete_custom_field: {
            id: app.id,
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
    const obj = {
        id: role.id,
        field: 'id',
        model: 'fa_role'
    };
    data.transports.push(obj);
    updateArgs(data, app.file);
};

const toggleRole = (data, file) => {
    const role = db.get(`role.${data.args.name}`)
    .value();
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
    },
    {
        id: field.id,
        field: 'field_values.fa_field_id',
        model: 'fa_field_config'
    }];
    data.transports.push(obj);
    db.get('acl')
    .push({ app: data.args.field_values.entityName, field: data.args.field_values.fa_field_id, id, file })
    .write();
};

const updateAcl = (data, file) => {
    const acl = db.get('acl')
        .find({ app: data.args.field_values.entityName, field: data.args.field_values.fa_field_id })
        .value();
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
    const obj = {
        id: acl.id,
        field: 'entity_value_id',
        model: 'fa_acl'
    };
    data.transports.push(obj);
    delete data.args.targetApp;
    delete data.args.tragetField;
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
    toggleAcl
}

module.exports ={
    runQuery
}