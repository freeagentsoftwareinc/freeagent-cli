const fs = require('fs');
const { set, get, camelCase, toPairs, sortBy, find, omit } = require('lodash');
const { findAll, update, insert, findOne } = require('./db');
const { choiceListOrderTypes, automationsTriggers, updateEntityConfigKeys } = require('../utils/constants');
const { getSavedData, saveDataToFile } = require('./helper');
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
    modelForFieldReference,
    formRuleOperatoinValues,
    formRuleOperatoins,
    formRuleTypes,
} = require('../utils/constants');
const chalk = require('chalk');

const findInAllModels = (id) => {
    const foundRecord = {};
    modelForFieldReference.forEach((model) => {
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
        if(!savedData || instance.isExported){
            return;
        }

        if(!instance.isLine && (!instance.isUpdate || !instance.isSystem)){
            return;
        }

        if(instance.isToggle && !instance.isSystem){
            return;
        }
        const id = get(savedData, 'args.id') || get(savedData, 'args.parent_id');
        if(!id && !validate(id)){
            console.log(`please provide the correct id to ${file}`);
            return;
        };

        const field = !instance.isLine ? 'id' : 'parent_id';
        savedData.transports.push( {
            id,
            field,
            model: 'fa_entity_config'
        });
        set(savedData, `args.${field}`, '');
        delete savedData.args.id;
        delete savedData.args.parent_id;
        await saveDataToFile(savedData, file);
        update('fa_entity_config', { name: instance.label, isExported: false }, { isExported: true });
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
        const layout = get(savedData, 'args.layout_id');
        if(instance.isSystem && instance.isUpdate && !id && !validate(id)){
            console.log(`please provide the correct id to ${file}`);
           return;
        };

        if(instance.isSystem && instance.isUpdate && !instance.isDelete) {
            savedData.transports.push({
                id,
                field: 'id',
                model: 'fa_field_config'
            });
            set(savedData, 'args.id', '');
        };
        
        if(instance.isSystem && instance.isUpdate && instance.isDelete) {
            savedData.transports.push({
                delete_custom_field: {
                    id,
                    field: 'id',
                    model: 'fa_field_config'
                }
            });
            set(savedData, 'args.id', '');
        };

        if(layout){
            const layoutId = validate(layout) ? layout : get(findOne('layout', { name: layout }), 'id') || null;
            savedData.transports.push({
                id: layoutId,
                field: 'layout_id',
                model: 'layout'
            });
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
        await saveDataToFile(savedData, file);
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
        await saveDataToFile(savedData, file);
        update('reorder', { entity: instance.entity, entityName: instance.entityName }, { isExported: true });
    });
};

const reWriteCardConfigFiles = () => {
    const instances = findAll('cards');
    instances.map(async (instance) => {
        const file = instance.file;
        const savedData = await getSavedData(instance);
        if(!savedData || instance.isExported){
            return;
        };
        const entityName = get(savedData, 'args.entity');
        const changeSetAppId = get(findOne('fa_entity_config', { name: entityName }), 'id');
        const id = changeSetAppId ? changeSetAppId : validate(get(savedData, 'args.id')) || null;
        if(!id){
            console.log(chalk.red(`please provide the correct id to ${file}`));
            return;
        }
        const cardTransports = {};
        const updateEntityConfigFile = `${Date.now()}_updateEntityConfig_${v4()}.json`;
        const savedArgs = get(savedData, 'args');
        const args = omit(savedArgs, ['entity', 'id']);
        const entityConfigArgs = {
            args: {
                id: '',
                label: entityName,
                is_visible: true
            },
            transports: [{
                id,
                field: 'id',
                model: 'fa_entity_config'
            }]
        };
        Object.keys(args).map((key) => {
            const value = get(args, key);
            const transportId = ((typeof value === 'boolean') ||  validate(value))
                ? value : get(findOne('fa_field_config', { app: entityName, name: value }), 'id') || null;
            if(updateEntityConfigKeys.includes(key)){
                if(typeof transportId === 'boolean'){
                    return set(entityConfigArgs, `args.${key}`, transportId);
                }
                set(entityConfigArgs, `args.${key}`, '');
                if(transportId){
                    entityConfigArgs.transports.push({
                        id: transportId,
                        field: key,
                        model: 'fa_field_config'
                    });
                }
            };
            set(cardTransports, get(cardConfigFieldsId, key), transportId);
        });
        const cardConfigArgs = {
            args:{
                entity: entityName,
                card_config_mappings: null,
            },
            transports: [{
                card_config_mappings:{
                    ...cardTransports
                }
            }]
        };
        await saveDataToFile(cardConfigArgs, file);
        await saveDataToFile(entityConfigArgs, updateEntityConfigFile);
        update('cards',{ file, entity: entityName, isExported: false }, { isExported: true });
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
        const id = validate(automationId) ? automationId : get(findOne('rule_set', { name: automationId }), 'id') || null;
        data.transports.push({
            id,
            field: `field_values.rule_set_id`,
            model: 'rule_set'
        });
    };
    set(data, 'args.field_values.appearance_id', 
    get(appearanceTypes, camelCase(appearanceType)) || null);
    set(data, 'args.field_values.type', get(actionTypes, camelCase(actionType)) || null);
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
        const id = validate(fieldId) ? fieldId : get(findOne('fa_field_config', { name: fieldId }), 'id') || null;
        data.transports.push({
            id,
            field: `field_values.fa_field_id`,
            model: 'fa_field_config'
        });
        set(data, 'args.field_values.fa_field_id', '');
    };
    set(data, 'args.field_values.acl_type', get(aclTypes,  camelCase(aclType)) || null);
    set(data, 'args.field_values.operation', get(operantionTypes, camelCase(operaionType)) || null);
    set(data, 'args.field_values.entity_operation', get(entityOperationTypes, entityOperationType) || null);
};


const reWriteCreateUpdateEntityFiles = (instances, model) => {
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
            console.log(`please provide the correct id to ${file}`);
            return;
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

        await saveDataToFile(savedData, file);
        update(model, { name: instance.name, isUpdate: true, isExported: false }, { isExported: true });
    });
};

const setTransportidForChildValues = (children) => {
    const transports = [];
    const updatedCildren = children.map((child, parentIndex)=> {
        child.custom_fields = child.custom_fields.map((props, index)=> {
            if(!props[1]){
                return [props[0], props[1]];
            }
            if(props[0] === 'field_name' && props[1]){
                transports.push({
                    id: (validate(props[1]) ? props[1] : get(findOne('fa_field_config', { name: props[1]}), 'id') || null),
                    field: `children[${parentIndex}].custom_fields[${index}][1]`,
                    model: 'fa_field_config'
                })
            };
           
            if(props[0] === 'section_name' && props[1]){
                transports.push({
                    id: (validate(props[1]) ? props[1] : get(findOne('layout', { name: props[1]}), 'id') || null),
                    field: `children[${parentIndex}].custom_fields[${index}][1]`,
                    model: 'layout'
                })
            };

            if(props[0] === 'app_action_id' && props[1]){
                transports.push({
                    id: (validate(props[1]) ? props[1] : get(findOne('app_action', { name: props[1]}), 'id') || null),
                    field: `children[${parentIndex}].custom_fields[${index}][1]`,
                    model: 'app_action'
                })
            };

            if(props[0] === 'type'){
                props[1] = get(formRuleTypes, camelCase(props[1])) || props[1];
            };

            if(props[0] === 'operation'){
                props[1] = get(formRuleOperatoins, camelCase(props[1])) || props[1];
            };

            if(props[0] === 'value'){
                props[1] = get(formRuleOperatoinValues, camelCase(props[1])) || props[1];
            };
            return [props[0], props[1]]
        });
        return child;
    });
    return {
        transports,
        updatedCildren
    }
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
            custom_fields: toPairs(get(record, 'custom_fields'))
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
            field: `children[${index}].custom_fields[0][1]`,
            model: childModel
        });
        remapedChild.custom_fields.unshift(['id', '']);
        return remapedChild;
    });
    newTransportIds.length && transports.push({
        id: newTransportIds,
        field: 'transport_id',
        model: childModel
    });
    return{
        children: mapedChildren,
        transports
    }
};

const reMapParentfields = (parentFields) => {
    const parentTransports = [];
    const entityName = get(parentFields, 'entityName');
    const orderType = get(parentFields, 'order_type');
    const triggerType = get(parentFields, 'trigger');
    const roles = get(parentFields, 'roles');
    const scheduleDatetimeField = get(parentFields, 'schedule_datetime_field');
    const onUpdateField = get(parentFields, 'on_update_field');
    if(orderType){
        set(parentFields, 'order_type', get(choiceListOrderTypes, orderType));
    };
    
    if(triggerType){
        set(parentFields, 'trigger', get(automationsTriggers, camelCase(triggerType)));
    }
    if(scheduleDatetimeField && !validate(scheduleDatetimeField)){
        set(parentFields, 'schedule_datetime_field', 
            get(findOne('fa_field_config', { name: scheduleDatetimeField, app: entityName }), 'id'));
    };

    if(onUpdateField && !validate(onUpdateField)){
        set(parentFields, 'schedule_datetime_field',
            get(findOne('fa_field_config', { name: onUpdateField, app: entityName }), 'id'));
    };
    
    if(roles && roles.length){
        parentTransports.push(...reMapRoelsIds(roles, 'parent_fields.roles'));
    };

    if(!entityName){
        delete parentFields.entityName;
    }

    Object.keys(parentFields).forEach((key, index) => {
        if((key === 'schedule_datetime_field' && get(parentFields, 'schedule_datetime_field'))
            || (key === 'on_update_field' && get(parentFields, 'schedule_datetime_field')) ){
            parentTransports.push({
                id: key,
                field: `parent_fields[${index}][1]`,
                model: 'fa_field_config'
            })
        }
    });
    return {
        parentFields: toPairs(parentFields),
        parentTransports 
    }
};

const covertDataForupdateEntityValueApi = (savedData) => {
    const entityValueId   = get(savedData, 'args.entity_value_id');
    if(!entityValueId && !validate(entityValueId)){
        return;
    }
    const systemTrasportId = {
        id: entityValueId,
        field: 'entity_value_id',
        model: savedData.args.entity
    };
    set(savedData, 'args.entity_value_id', '');
    set(savedData, 'transports', [systemTrasportId]);
};

const covertDataForSaveCompositeApi= (savedData, instance) => {
    const instanceId   = get(savedData, 'args.instance_id');
    const parentFields = reMapParentfields(savedData.args.parent_fields);
    const afterMapedPerentData = reMapChildrend(get(savedData, 'args.children'), instance);
    set(savedData, 'args.parent_fields', parentFields.parentFields)
    set(savedData, 'args.children', afterMapedPerentData.children);
    set(savedData, 'transports', [...savedData.transports, ...parentFields.parentTransports, ...afterMapedPerentData.transports]);
    if(instanceId){
        const systemTrasportId = {
            id: instanceId,
            field: 'instance_id',
            model: instance.model
        }
        set(savedData, 'args.instance_id', '');
        set(savedData, 'transports', [...savedData.transports, systemTrasportId]);
    }
};

const reWriteSaveCompositeEntityFiles = async (instances) => {
    instances.map(async (instance) => {
        const savedData = await getSavedData(instance);
        const { model, file, isExported } = instance;
        if(!savedData || isExported){
            return;
        };
        if(!instance.isToggle){
            covertDataForSaveCompositeApi(savedData, instance);
        }
        if(model === 'form_rule'){
           const updatedData = setTransportidForChildValues(get(savedData,'args.children'));
            set(savedData, 'args.children', updatedData.updatedCildren)
            savedData.transports.push(...updatedData.transports);
        };
            //for active or deactive case
        covertDataForupdateEntityValueApi(savedData, model);
        await saveDataToFile(savedData, file);
        update(model, { file: file, isExported: false }, { isExported: true });
    });
};

const reWriteStageFields = () => {
    const instances = findAll('catalog');
    instances.map( async(instance) => {
        if(!instance){
            return;
        }
        const savedData = await getSavedData(instance);
        const { model, file, isExported } = instance;
        if(!savedData || isExported){
            return;
        };
        const customFieldId = get(savedData, 'args.catalog.custom_field_id');
        const entityName = get(savedData,'args.catalog.entityName' );
        const id = (customFieldId && validate(customFieldId)) ? customFieldId : get(findOne('fa_field_config', { name: id,  app: entityName }), 'id') || null;
        if(!id){
            console.log(chalk.red(`empty or invalid id provided for stage field ${file}`));
            return;
        };
        delete savedData.args.catalog.targetApp;
        set(savedData, 'args.catalog.custom_field_id', '');
        savedData.transports.push({
            id,
            field: 'custom_field_id',
            model: 'catalog.fa_field_config'
        });
        await saveDataToFile(savedData, file);
        update(model, { file: file, isExported: false }, { isExported: true });
    });
}

module.exports = {
    reWriteUpdateEntityConfigFiles,
    reWriteCreateUpdateEntityFiles,
    reWriteFieldsFiles,
    reWriteUpdateOrderFiles,
    reWriteCardConfigFiles,
    reWriteSaveCompositeEntityFiles,
    reWriteStageFields
};