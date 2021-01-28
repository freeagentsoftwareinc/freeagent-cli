
const { args } = require('commander');
const fs = require('fs');
const low = require('lowdb');
const FileSync = require('lowdb/adapters/FileSync');
const adapter = new FileSync('db.json');
const db = low(adapter);
const uuid  = require('node-uuid');
const dir = './fa_changeset';
db.defaults({ app: {}, fields:[], role: {}, section: [] })
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

const runQuery = (operation, args, file) => {
    if(operation.api === 'addEntity'){
        addApp(args, file)
    }

    if(operation.api === 'updateEntityConfig') {
        updateApp(args, file)
    }

    if(operation.api === 'addCustomField') {
        addField(args, file);
    }
    
    if(operation.api === 'updateFieldConfig'){
        updateField(args, file)
    }

    if(operation.api === 'deleteCustomField'){
        deleteField(args)
    }

    if(operation.api === 'createEntity' && operation.payload === 'addRole'){
        addRole(args, file);
    }

    if(operation.api === 'updateEntity' && operation.payload === 'addRole'){
        updateRole(args, file);
    }

    if(operation.api === 'createEntity' && operation.payload === 'addSection'){
        addSection(args, file);
    }

    if(operation.api === 'updateEntity' && operation.payload === 'addSection'){
        updateSection(args, file);
    }
}

module.exports ={
    runQuery
}