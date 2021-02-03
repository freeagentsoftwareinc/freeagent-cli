const fs = require('fs');
const { set, get, camelCase } = require('lodash');
const { find, findAll, update } = require('./query');
const { validate }  = require('uuid');
const dir = './fa_changeset';
const {
    cardConfigFieldsId,
    fieldReferenceKeys,
    appearanceTypes,
    appActionPlacemenTypes,
    actionTypes,
    operantionTypes,
    aclTypes,
    entityOperationTypes
} = require('../utils/common');

const reWriteUpdateEntityConfigFiles = () => {
    const instances = findAll('fa_entity_config');
    instances.map(async ( instance ) => {
        if(!instance || !instance.isUpdate || !instance.isSystem || instance.isExported){
            return;
        }

        const file = instance.file;
        if(!fs.existsSync(`${dir}/${file}`)){
            return;
        }

        const fileData = await fs.readFileSync(`${dir}/${file}`);
        const savedData = JSON.parse(fileData);
        const id = get(savedData, 'args.id');

        if(!id && !validate(id)){
            console.log(`please provide the id to ${file}`);
            throw new Error('empty or invalid id provided for update');
        };
        savedData.transports.push( {
            id,
            field: 'id',
            model: 'fa_entity_config'
        });
        set(savedData, 'args.id', '');
        const jsonData =  JSON.stringify(savedData, null, 4);
        await fs.writeFileSync(`${dir}/${file}`, jsonData);
        update('fa_entity_config', { label: instance.label, isExported: false }, { isExported: true });
    });
};

const reWriteFieldsFiles = () => {
    const instances = findAll('fa_field_config');
    instances.map(async ( instance ) => {
       console.log("instance", instance)
        if(!instance || instance.isExported){
            return;
        }

        const file = instance.file;
        if(!fs.existsSync(`${dir}/${file}`)){
            return;
        }

        const fileData = await fs.readFileSync(`${dir}/${file}`);
        const savedData = JSON.parse(fileData);
        const id = get(savedData, 'args.id');

        if(instance.isSystem && (instance.isUpdate || instance.delete) && !id && !validate(id)){
            console.log(`please provide the id to ${file}`);
            throw new Error('empty or invalid id provided for update');
        };

        if(instance.isSystem && (instance.isUpdate || instance.isDelete)) {
            savedData.transports.push({
                id,
                field: 'id',
                model: 'fa_field_config'
            });
            set(savedData, 'args.id', '');
        };

        if(!instance.delete){
            const referenceTypes = ['reference_array', 'reference'];
            if(referenceTypes.includes(savedData.args.data_type)){
                fieldReferenceKeys.forEach((value, key) => {
                    const id = get(savedData, `args.${key}`);
                    if(id && validate(id)){
                        savedData.transports.push({
                            id,
                            field: key,
                            model: value
                        });
                        set(savedData, `args.${key}`, '');
                    }
                });
            };
        }
        const jsonData =  JSON.stringify(savedData, null, 4);
        await fs.writeFileSync(`${dir}/${file}`, jsonData);
        update('fa_field_config', { name: instance.name, app: instance.app, isExported: false }, { isExported: true });
        console.log("trhis", find('fa_field_config',{label: instance.label}))
    });
};

const reWriteUpdateOrderFiles = () => {
    const instances = findAll('reorder');
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
        update('reorder', { entity: instance.entity, entityName: instance.entityName }, { isExported: true });
    });
};

const reWriteCardConfigFiles = () => {
    const instances = findAll('cards');
    instances.map(async (instance) => {
        if(!instance || instance.isExported){
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
                const field = find('fa_field_config', { app: savedData.args.entity, name: value });
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
        update('cards',{ file: file },{ isExported: true });
    });
};

const reMapRoelsIds = (roles, path) => roles.map((value, index) => {
        let id;
        if(validate(value)){
            id = value;
        } else {
            const role = find('fa_role', { name: value, isSystem: false });
            if(!role || !role.id){
                throw new Error('empty or invalid id provided for update');
            }
            id = role.id;
        }
        return {
            id,
            field: `${path}[${index}]`,
            model: 'fa_role'
        };
    });

const reMapAppAction = (data) => {
    const roles = data.args.field_values.roles;
    const placements = data.args.field_values.placement;
    const automationId = data.args.field_values.rule_set_id;
    const appearanceType = data.args.field_values.appearance_id;
    const actionType = data.args.field_values.type;
    if(roles && roles.length){
        const transports = [...data.transports, ...reMapRoelsIds(roles, 'field_values.roles')];
        set(data, 'transports', transports);
        set(data, 'args.field_values.roles', []);
    };
    if(placements && placements.length){
        const placement = placements.map( value =>  get(appActionPlacemenTypes, camelCase(value)));
        set(data, 'args.field_values.placement', placement);
    };
    if(automationId) {
        const id = validate(automationId) ? automationId : find('rule_set', { name: automationId }).id;
        data.transports.push({
            id,
            field: `field_values.rule_set_id`,
            model: 'rule_set'
        });
    };
    set(data, 'args.field_values.appearance_id', 
    get(appearanceTypes, camelCase(appearanceType)) || null);
    set(data, 'data.args.field_values.type', get(actionTypes, camelCase(actionType)) || null);
};

const reMapAcl = (data) => {
    const roles = data.args.field_values.fa_acl_field_roles;
    const aclType = data.args.field_values.acl_type;
    const operaionType = data.args.field_values.operation;
    const fieldId = data.args.field_values.fa_field_id;
    const entityOperationType = data.args.field_values.entity_operation;
    if(roles && roles.length){
        const transports = [...data.transports, ...reMapRoelsIds(roles, 'field_values.fa_acl_field_roles')];
        set(data, 'transports', transports);
        set(data, 'args.field_values.fa_acl_field_roles', []);
    };
    if(fieldId){
        const id = validate(fieldId) ? fieldId : find('fa_field_config', { name: fieldId }).id;
        data.transports.push({
            id,
            field: `field_values.fa_field_id`,
            model: 'fa_field_config'
        });
        set(data, 'args.field_values.fa_field_id', '');
    };
    set(data, 'args.field_values.acl_type', get(aclTypes, aclType) || null);
    set(data, 'args.field_values.operation', get(operantionTypes, operaionType) || null);
    set(data, 'args.field_values.entity_operation', get(entityOperationTypes, entityOperationType) || null);
};


const reWriteCreateUpdaTeEntityFiles = (instances, model) => {
    instances.map(async ( instance ) => {
       
        if(!instance || instance.isExported){
            return;
        }

        const file = instance.file;
        if(!fs.existsSync(`${dir}/${file}`)){
            return;
        }

        const fileData = await fs.readFileSync(`${dir}/${file}`);
        const savedData = JSON.parse(fileData);
        const id = get(savedData, 'args.id');
        const entityValueId = get(savedData, 'args.entity_value_id');
        if(instance.isSystem && instance.isUpdate && !entityValueId && !id && !validate(id)){
            console.log(`please provide the id to ${file}`);
            throw new Error('empty or invalid id provided for update');
        };
        if(instance.isSystem && instance.isUpdate && !entityValueId) {
            savedData.transports.push({
                id,
                field: 'id',
                model
            });
            set(savedData, 'args.id', '');
        };

        if(instance.isSystem && instance.isToggle && !entityValueId && !validate(entityValueId)){
            console.log(`please provide the id to ${file}`);
            throw new Error('empty or invalid id provided for update');
        };

        if(instance.isSystem && instance.isToggle) {
            savedData.transports.push({
                id: entityValueId,
                field: 'entity_value_id',
                model
            });
            set(savedData, 'args.entity_value_id', '');   
        };

        if(model === 'app_action' && savedData.args.field_values){
            reMapAppAction(savedData)
        };
        
        if(model === 'fa_acl' && savedData.args.field_values){
            reMapAcl(savedData);
        };

        const jsonData =  JSON.stringify(savedData, null, 4);
        await fs.writeFileSync(`${dir}/${file}`, jsonData);
        update(model, { name: instance.name, isUpdate: true, isExported: false }, { isExported: true });
    });
};


module.exports = {
    reWriteUpdateEntityConfigFiles,
    reWriteCreateUpdaTeEntityFiles,
    reWriteFieldsFiles,
    reWriteUpdateOrderFiles,
    reWriteCardConfigFiles
};