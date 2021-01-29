
const { args } = require('commander');
const fs = require('fs');
const chalk = require('chalk');
const low = require('lowdb');
const FileSync = require('lowdb/adapters/FileSync');
const adapter = new FileSync('db.json');
const db = low(adapter);
const uuid  = require('node-uuid');
const { drop, forEach } = require('lodash');
const dir = './fa_changeset';
db.defaults({ app: {}, fields:[], role: {}, section: [], action: [], acl: [], choiceList: {} })
  .write();

const notFoundEror = () => {
    console.log(chalk.red('it is not the part of current changeset must be editing system one or from other changeset'))
}

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

const addChoiceList = (data, file) => {
    const id = uuid.v4();
    const obj = [{
        id,
        field: 'transport_id',
        model: 'catalog_type'
    }];
    data.transports.push(obj);
    db.set(`choiceList.${data.args.name}`, {
        id,
        file
    })
    .write();
    data.args.parent_fields.push(['name', data.args.name]);
    delete data.args.name;
};

const mapTransportIds = (savedData, file) => {
    const childTransprots = {
        id: [],
        field: 'transport_id',
        model: 'catalog'
    };
    savedData.args.children.forEach(() => {
        childTransprots.id.push(uuid.v4());
    });
    savedData.transports.push(childTransprots);
    const jsonData =  JSON.stringify(savedData, null, 4);
    const filePath = `${dir}/${file}`
    fs.writeFileSync(`${filePath}`, jsonData);
    return childTransprots;
} 

const updateChoiceList = (data, file) => {
    const choiceList = db.get(`choiceList.${data.args.name}`)
        .value();
    if(!choiceList){
      return;
    }
    const parentTransport = {
        id: choiceList.id,
        field: 'instance_id',
        model: 'catalog_type'
    };
    const fileData = fs.readFileSync(`${dir}/${choiceList.file}`);
    const savedData = JSON.parse(fileData);
    data.transports = [];
    if(savedData.args.children.length && savedData.transports.length < 2){
        const childTransprots = mapTransportIds(savedData, choiceList.file);
        db.set(`choiceList.${data.args.name}.update`, file)
        .write();
        db.set(`choiceList.${data.args.name}.child`, childTransprots.id)
        .write();
        data.transports.push(childTransprots);
    };
    data.args = savedData.args;
    data.transports.push(parentTransport);
};

const remapSaveComposite = async () => {
    const choiceList = db.get('choiceList')
    .value();
    await Promise.all(
        Object.keys(choiceList).map((name) => {
            const choiceList = db.get(`choiceList.${name}`)
            .value();
            const file = choiceList.file;
            if(!file){
                return;
            }
            
            if(!fs.existsSync(`${dir}/${file}`)){
                return;
            }
            
            const fileData = fs.readFileSync(`${dir}/${file}`);
            const savedData = JSON.parse(fileData);
            if(savedData.args.children.length && savedData.transports.length < 2){
                mapTransportIds(savedData, file);
            };
        })
    );
}

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
    addChoiceList,
    updateChoiceList,
    remapSaveComposite
}

module.exports ={
    runQuery
}