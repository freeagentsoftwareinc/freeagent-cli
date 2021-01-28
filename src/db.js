
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
    const app =  db.get('fields')
        .find({ app: data.args.entity, name: data.args.name_label })
        .value();
    const obj = {
        id: app.id,
        field: 'id',
        model: 'fa_field_config'
    };
    data.transports.push(obj);
    updateArgs(data, app.file);
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
    const app = db.get(`role.${data.args.field_values.name}`)
    .value();
    const obj = {
        id: app.id,
        field: 'id',
        model: 'fa_role'
    };
    data.transports.push(obj);
    updateArgs(data, app.file);
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

const addAcl = (data, file) => {
    const id = uuid.v4();
    const obj = {
        id,
        field: 'transport_id',
        model: 'fa_acl'
    };
    data.transports.push(obj);
    db.get('acl')
    .push({ app: data.args.field_values.entityName, resource_type: data.args.field_values.resource_type, id, file })
    .write();
};


const updateAcl = (data, file) => {
    const acl = db.get('acl')
        .find({ app: data.args.field_values.entityName, resource_type: data.args.field_values.resource_type })
        .value();
    const obj = {
        id: acl.id,
        field: 'transport_id',
        model: 'app_action'
    };
    data.transports.push(obj);
    updateArgs(data, acl.file);
};


const runQuery = {
    addApp,
    updateApp,
    addField,
    updateField,
    deleteField,
    addRole,
    updateRole,
    addSection,
    updateSection,
    addAppAction,
    updateAppAction,
    addAcl,
    updateAcl
}

module.exports ={
    runQuery
}