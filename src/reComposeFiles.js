const fs = require('fs');
const { set, get, camelCase, toPairsIn, sortBy } = require('lodash');
const { findAll, update, insert, findOne } = require('./query');
const { choiceListOrderTypes } = require('../utils/common');
const { getSavedData } = require('./helper');
const { validate, v4 }  = require('uuid');
const dir = './fa_changeset';
const {
    cardConfigFieldsId,
    fieldReferenceKeys,
    appearanceTypes,
    appActionPlacemenTypes,
    actionTypes,
    operantionTypes,
    aclTypes,
    entityOperationTypes,
    modelConstant
} = require('../utils/common');
const { chdir } = require('process');

const findInAllModels = (id) => {
    const foundRecord = {};
    modelConstant.forEach((model) => {
        const instance = findOne(model, { name: id });
        if(instance && instance.id && !foundRecord.id){
            set(foundRecord, 'id', instance.id);
            set(foundRecord, 'model', model);
        }
    });
    return foundRecord;
};

const reWriteUpdateEntityConfigFiles = () => {
    const instances = findAll('fa_entity_config');
    instances.map(async ( instance ) => {
        const file = instance.file;
        const savedData = await getSavedData(instance)
        if(!savedData || !instance.isUpdate || !instance.isSystem){
            return;
        }
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
        const file = instance.file;
        const savedData = await getSavedData(instance)

        if(!savedData){
            return;
        };
        const id = get(savedData, 'args.id');
        if(instance.isSystem && instance.isUpdate && !id && !validate(id)){
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
                    const transport = !(id && validate(id)) ? findInAllModels(id) : id;
                    if(typeof transport === 'string' || transport.id){
                        savedData.transports.push({
                            id: transport.id || transport,
                            field: key,
                            model: transport.model || value
                        });
                        set(savedData, `args.${key}`, '');
                    }
                });
            };
        };
        const jsonData =  JSON.stringify(savedData, null, 4);
        await fs.writeFileSync(`${dir}/${file}`, jsonData);
        update('fa_field_config', { name: instance.name, app: instance.app, isExported: false }, { isExported: true });
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
                const field = findOne('fa_field_config', { app: savedData.args.entity, name: value });
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
            const role = findOne('fa_role', { name: value, isSystem: false });
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
        const id = validate(automationId) ? automationId : findOne('rule_set', { name: automationId }).id;
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
        const id = validate(fieldId) ? fieldId : findOne('fa_field_config', { name: fieldId }).id;
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

const reMapChildrend = (children, instance) => {
    const { name, file, childModel } = instance;
    const newTransportIds = [];
    const transports = [];
    const childWithUpdateStatus = children.map((child) => {
        const childRecord = findOne(childModel, {
            id: child.id
        });
        (!child.id || (childRecord && childRecord.file === file)) ?
            set(child, 'isUpdate', false) 
                : set(child, 'isUpdate', true);
        return child
    });
    //need to move newly created child to the start
    const sortedChildList = sortBy(childWithUpdateStatus, ({ isUpdate }) => !isUpdate);
    const mapedChildren = sortedChildList.map((record, index) => {
        const remapedChild = {
            entity_id: record.entity_id,
            custom_fields: toPairsIn(get(record, 'custom_fields'))
        };
        if(!record.isUpdate) {
            const id = v4();
            newTransportIds.push(record.id || id);
            insert(childModel, {
                id: record.id || id,
                file: file,
                parentId: id,
                parentName: name
            });
            return remapedChild;
        };
        transports.push({
            id: record.id,
            field: `children[${index}].custom_fields[1]`,
            model: childModel
        });
        remapedChild.custom_fields.push(['id', record.id]);
        return remapedChild;
    });
    newTransportIds.length && transports.push({
        id: newTransportIds,
        field: 'trasnports_id',
        model: childModel
    });
    return{
        children: mapedChildren,
        transports
    }
};

const reMapParentfields = (savedData) => {
    const orderType = get(savedData, 'args.parent_fields.order_type');
    set(savedData, 'args.parent_fields.order_type', get(choiceListOrderTypes, orderType));
    return toPairsIn(get(savedData, 'args.parent_fields'));
};

const reWriteSaveCompositeEntityFiles = async (instances) => {
    instances.map(async (instance) => {
        const savedData = await getSavedData(instance);
        if(!savedData){
            return;
        };
        const parentFields = reMapParentfields(savedData);
        const afterMapedPerentData = reMapChildrend(get(savedData, 'args.children'), instance);
        set(savedData, 'args.parent_fields', parentFields)
        set(savedData, 'args.children', afterMapedPerentData.children);
        set(savedData, 'transports', [...savedData.transports, ...afterMapedPerentData.transports]);
        const jsonData =  JSON.stringify({...savedData}, null, 4);
        await fs.writeFileSync(`${dir}/${instance.file}`, jsonData);
        update(model, { file: instance.file, isExported: false }, { isExported: true });
    });
}


module.exports = {
    reWriteUpdateEntityConfigFiles,
    reWriteCreateUpdaTeEntityFiles,
    reWriteFieldsFiles,
    reWriteUpdateOrderFiles,
    reWriteCardConfigFiles,
    reWriteSaveCompositeEntityFiles
};