
const fs = require('fs');
const { set } = require('lodash');
const { v4 }  = require('uuid');
const { errorMessages, modelsForEntityValueId, defaultFields } = require('../utils/constants');
const { insert, findOne, findAll } = require('./db');
const dir = './fa_changeset';

const updateArgs = (operation, data, file) => {
    if(!fs.existsSync(`${dir}/${file}`)){
        return;
    }
    const fileData = fs.readFileSync(`${dir}/${file}`);
    const savedData = JSON.parse(fileData);
    delete savedData.args.widgets;
    data.args = { ...data.args, ...savedData.args };
};

const createRecord = (data, model, option, isDelete=false) => {
    const id = v4();
    const tansport = {
        id,
        field: 'transport_id',
        model
    };
    // data.transports.push(tansport);
    insert(model, {
        ...option,
        id,
        isDelete,
        isSystem: false,
        isExported: false,
        isUpdate: false
    });
    return {
        ...data
    }
};
const updateRecord = (data, file, model, option, isDelete=false, isToggle=false) => {
    let instance = findOne(model, { 
        ...option,
        isDelete: false,
        isSystem: false,
        isUpdate: false
    });
    !isToggle && set(data, 'args.id', '');
    if(!instance || !instance.id){
       insert(model, {
            ...option,
            file,
            isDelete,
            isToggle,
            isSystem: true,
            isUpdate: true,
            isExported: false
        });
        console.log(errorMessages.notFoundEror);
        return {
            ...data
        }
    };
    const tansport = {
        id: instance.id,
        field: (!isToggle || !modelsForEntityValueId.includes(model)) ? 'id' : 'entity_value_id',
        model
    };
    data.transports.push(tansport);
    (!isToggle && !isDelete) && updateArgs(data, instance.file);
    insert(model, {
        ...option,
        file,
        isDelete,
        isToggle,
        isSystem: false,
        isExported: false,
        isUpdate: true
    });
    return {
        ...data
    }
};

const getSavedData = async (instance) => {
    if(!instance){
        return null;
    }

    const file = instance.file;
    if(!fs.existsSync(`${dir}/${file}`)){
        return null;
    }
    const fileData = await fs.readFileSync(`${dir}/${file}`);
    return {
        ...JSON.parse(fileData)
    }
};

const saveDataToFile = async (data, file) => {
    const jsonData =  JSON.stringify(data, null, 4);
    const filePath = `${dir}/${file}`
    await fs.writeFileSync(`${filePath}`, jsonData);
};

const createDefaultField = (app) => {
    const transportObj = {
        order_transport_id_map: {},
        model: 'fa_field_config'
    };
    defaultFields.map((name, index)=> {
        const id = v4();
        insert('fa_field_config', {
            name,
            app,
            id,
            isDelete: false,
            isSystem: false,
            isExported: false,
            isUpdate: false
        });
        set(transportObj, `order_transport_id_map.${index+1}`, id);
    });
    return transportObj;
};

module.exports = {
    createRecord,
    updateRecord,
    getSavedData,
    saveDataToFile,
    createDefaultField
}