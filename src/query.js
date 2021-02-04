const chalk = require('chalk');
const low = require('lowdb');
const FileSync = require('lowdb/adapters/FileSync');
const adapter = new FileSync('db.json');
const db = low(adapter);

db.defaults({ 
    fa_entity_config: [],
    fa_field_config:[], 
    fa_role: [], 
    layout: [], 
    app_action: [], 
    fa_acl: [], 
    catalog_type: [], 
    rule_set: [],
    form_rule:[],
    reorder: [],
    cards: []
})
.write();

const insert = (model, data) => db.get(model)
    .push(data)
    .write();

const find = (model, where ) => db.get(model)
    .find(where)
    .value();

const findAll = (model) => db.get(model).value();

const update = (model, where, data) => db.get(model)
    .find(where)
    .assign(data)
    .write();

const resetDb = () => {
    db.setState({});
    db.write()
    console.log(chalk.green('your data is erased successfully'))
} 

module.exports = {
    insert,
    find,
    findAll,
    update,
    resetDb
}