const {
    fieldReferenceKeys,
    modelForFieldReference
} = require('../utils/constants');

const { set, get } = require('lodash');

const findInAllModels = (id) => {
    const foundRecord = {};
    modelForFieldReference.forEach((model) => {
        const instance = findOne(model, { name: id });
        if(instance && instance.id && !foundRecord.id){
            set(foundRecord, 'transport_id', instance.id);
            set(foundRecord, 'model', model);
        }
    });
    return foundRecord;
};

const getTransportIdFromLocal = (id) => {
   const transport =  !(id && validate(id)) ? findInAllModels(id) : { transport_id: id } ;
   return transport;
};

const getTransportIdFromLocalByModel = (id, model) => {
    const transportId = validate(id) ? { id } : findOne(model, { name: id }) || null;
    return transportId;
}

const createFieldTransports = async (savedData, operation, modelfn, isCli=true) => {
    const id = get(savedData, 'args.id');
    const layout = get(savedData, 'args.layout_id');
    if(operation === 'updateFieldConfig') {
        savedData.transports.push({
            id,
            field: 'id',
            model: 'fa_field_config'
        });
        set(savedData, 'args.id', '');
    }
    if(layout){
        const layout = isCli ? getTransportIdFromLocalByModel(id, 'layout') : await modelfn['layout'];
        savedData.transports.push({
            id: get(layout, 'id'),
            field: 'layout_id',
            model: 'layout'
        });
    };
    fieldReferenceKeys.forEach(async (value, key) => {
        const id = get(savedData, `args.${key}`)
        const result = isCli ? getTransportIdFromLocal(id) : await modelfn[value]({
            raw: true,
            attributes: ['transport_id'],
            where: {
                id
            }
        });
        if (result) {
            const transport = typeof result === 'string' ? result : result.transport_id;
            savedData.transports.push({
                id: transport,
                field: key,
                model: transport.model || value
            });
            set(savedData, `args.${key}`, '');
        }
    });
};

module.exports = {
    createFieldTransports
};