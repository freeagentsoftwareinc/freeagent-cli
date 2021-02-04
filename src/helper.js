
const fs = require('fs');
const { set } = require('lodash');
const { v4 }  = require('uuid');
const { errorMessages } = require('../utils/common');
const { find, update, insert, findAll } = require('./query');
const dir = './fa_changeset';

const updateArgs = (data, file) => {
    if(!fs.existsSync(`${dir}/${file}`)){
        return;
    }
    const fileData = fs.readFileSync(`${dir}/${file}`);
    const savedData = JSON.parse(fileData);
    data.args = { ...data.args, ...savedData.args };
};

const createRecord = (data, file, model, option, isDelete=false) => {
    const id = v4();
    const tansport = {
        id,
        field: 'transport_id',
        model
    };
    data.transports.push(tansport);
    insert(model, {
        ...option,
        id,
        file,
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
    let instance = find(model, { 
        ...option,
        isDelete,
        isSystem: false,
        isUpdate: false,
    });
    set(data, 'args.id', '');
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
        field: 'id',
        model
    };
    data.transports.push(tansport);
    updateArgs(data, instance.file);
    update(model, {
        ...option,
        file,
        isDelete,
        isToggle,
        isSystem: true,
        isExported: false,
        isUpdate: true
    });
    return {
        ...data
    }
};

const getSavedData = async (instance) => {
    if(!instance || instance.isExported){
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
}


module.exports = {
    createRecord,
    updateRecord,
    getSavedData
}