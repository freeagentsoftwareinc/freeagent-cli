const { validate } = require('uuid');
const { get, set, isArray, omit, find, fromPairs, has, filter, flattenDeep, indexOf, keys } = require('lodash');
const { entities, parentRefKeys }  = require('../utils/constants.js');
const config = require('../config.json');
const { valid } = require('joi');

// const findAllTransportIdsFromLocal = (modelName, where) => {
//   const instances = findAll(modelName);
//   const results = filter(instances, where);
//   return results.map((result) => get(result, 'id'));
// }

const getTransportIdFromLocalDB = async (id, config) => {
  // const whereField = get(config, 'where_field') || 'id';
  // const modelName = get(config, 'model');
  // const where = set({}, whereField, id);
  // if (config.bulk) {
  //   const r = findAllTransportIdsFromLocal(modelName, where);
  //   return r;
  // }
  // const result = findOne(modelName, where);
  // return get(result, 'id');
};

const getModel = (args, key) => {
  const modelKey = get(args, key);
  const model = validate(modelKey) ? get(entities, modelKey) : modelKey;
  return model;
};

const excludeProps = (data, configurations) => {
  const excludes = get(configurations, 'exclude_fields');
  if(excludes){
    const updatedArgs = omit(data.args, excludes);
    set(data, 'args', updatedArgs);
  }
  return data;
};

const getCompositeTransports = async (info, configurations, transports, models, transactionInstance) => {
  await Promise.all(info.props.map(async(field, index) => {
    const fieldName = field[0];
    let fieldValue = field[1];
    let filedConfig = find(configurations.transports, { field: fieldName });
    if (!fieldValue || !filedConfig || !validate(fieldValue)) {
      return;
    }
    const attribute = get(filedConfig, 'attribute') || null;
    const setField = get(filedConfig, 'set_field');
    if(get(filedConfig, 'comma_separated_values') && fieldValue) {
      const arrayValues = fieldValue.split(',');
      fieldValue = arrayValues[0];
    }
    const where = set({}, 'id', fieldValue);
    const transportId = await findTransportId(models, filedConfig.model, where, transactionInstance, attribute);
    if(!transportId){
      return;
    }

    if (attribute && transportId) {
      field[0] = setField;
      field[1] = transportId;
      return;
    }
   
    transports.push({
      id: transportId,
      field: `${info.key}[${index}][1]`,
      model: filedConfig.model
    });
  }));
};

const getParentsCompositeTransports = async (parentInfo, configurations, transports, models, transactionInstance) => {
  const where = { id: parentInfo.id };
  const id = await findTransportId(models, parentInfo.model, where, transactionInstance);
  if(!id) {
    return;
  }
  transports.push({
    id,
    field: parentInfo.isUpdate ? 'instance_id' : 'transport_id',
    model: parentInfo.model
  });
  await getCompositeTransports(parentInfo, configurations, transports, models, transactionInstance)
};

const childrensCompositeTransports = async (childInfo, configurations, transports, models, transactionInstance, newInstanceTrasports) => {
  await Promise.all(childInfo.fields.map(async (child, index) => {
    set(childInfo, 'key', `children[${index}].custom_fields`);
    set(childInfo, 'model', getModel(child, childInfo.modelKey));
    set(childInfo, 'props', child.custom_fields);
    const fields = fromPairs(child.custom_fields);
    const where = omit(fields, configurations.exclude_from_where_condition);
    set(where, get(parentRefKeys, childInfo.parent_model), childInfo.parent_id);
    const id = await findTransportId(models, childInfo.model, where, transactionInstance);
    const path = indexOf(keys(fields), 'id');
    console.log(path);
    if(!has(where, 'id') && id) {
      newInstanceTrasports.push(id)
    }
    if (path > 0) {
      transports.push({
        id,
        field: `${childInfo.key}[${indexOf(keys(fields), 'id')}][1]`,
        model: childInfo.model
      });
    }
    await getCompositeTransports(childInfo, configurations, transports, models, transactionInstance, newInstanceTrasports);
  }));
  
  if(newInstanceTrasports.length) {
    transports.push({
      id: newInstanceTrasports,
      field: 'transport_id',
      model: childInfo.model
    })
  };
};


const getCompositeArgsWithTransports = async (configurations, args, result, models, transactionInstance) => {
  const transports = [];
  const newInstanceTrasports = []
  const parentInfo = {
    id: get(result, 'parent_id'),
    model: getModel(args, configurations.parent_model_key),
    key: 'parent_fields',
    props: get(args, 'parent_fields'),
    isUpdate: get(args, configurations.id)
  };
  const childInfo = {
    fields: get(args, 'children'),
    modelKey: get(configurations, 'child_model_key'),
    parent_model: parentInfo.model,
    parent_id: parentInfo.id
  };
  await getParentsCompositeTransports(parentInfo, configurations, transports, models, transactionInstance);
  await childrensCompositeTransports(childInfo, configurations, transports, models, transactionInstance, newInstanceTrasports)
  return {
    args: { ...args },
    transports: [...transports],
  };
};

const reMapArgsAndConfigurations = (configurations, args, result) => {
  const resultObj = { ...result.dataValues, ...result }
  const field = get(configurations, 'id');
  const modelKey = get(configurations, 'entity_field');
  if (field) {
    const id = get(resultObj, field);
    set(args, 'id', id);
  }

  if (modelKey) {
    const model = get(args, modelKey);
    if(configurations.transports.length){
      configurations.transports.forEach((transport) => {
        if(!transport.model) {
          set(transport, 'model', model);
        }
      })
    }
  }
};

const findTransportId = async (models, modelName, where, transactionInstance, attribute = null) => {
  if(models[modelName]) {
    const attributes = attribute ? attribute : 'transport_id';
    const result = await models[modelName].findOne({
      logging: console.log,
      where,
      attributes: [attributes],
      raw: true,
      transaction: transactionInstance
    });
    console.log("result", result)
    console.log("result", result)
    return get(result, attributes);
  }
};

const findAllTransportIds = async (models, modelName, where, transactionInstance) => {
  if(models[modelName]) {
    const results = await models[modelName].findAll({
      raw: true,
      attributes: ['transport_id'],
      where,
      transaction: transactionInstance
    });
    return results.map((result) => get(result, 'transport_id'));
  }
};

const getTransportIdFromDB = async (id, config, models, transactionInstance) => {
  const whereField = get(config, 'where_field') || 'id';
  const modelName = get(config, 'model');
  const where = set({}, whereField, id);

  const transports = config.bulk 
    ? await findAllTransportIds(models, modelName, where, transactionInstance)
    : await findTransportId(models, modelName, where, transactionInstance);
    return transports;
};

const getTransportIds = async (id, config, models, transactionInstance, position=null) => {
  const model = config.model;
  const field = get(config, 'transport_field') ? 'transport_id' : config.field;
  const transportId = models ? await getTransportIdFromDB(id, config, models, transactionInstance) : await getTransportIdFromLocalDB(id, config);
  if (!transportId) {
    return null;
  }
  return {
    id: transportId,
    field: position !==null ? `${field}[${position}]` : field,
    model,
  };
}

const getTransport = async (id, config, models, transactionInstance) => {
  const transports = isArray(id)
    ? await Promise.all(id.map(async (value, index) => await getTransportIds(value, config, models, transactionInstance, index)))
    : await getTransportIds(id, config, models, transactionInstance);
  return transports;
};

const setDyanamicConfigurations = (args, configurations) => {
  const model = getModel(args, configurations.entity_field);
  const arrayProp = configurations.fields_key;
  const data = get(args, arrayProp);
  const field = configurations.field;
  const transports = data.map((obj, index) => {
    return {
      field: `${arrayProp}[${index}].${field}`,
      model
    };
  });
  set(configurations, 'transports', transports);
};

const getArgsWithTransports = async (args, configurations, models, transactionInstance) => {
  const results = await Promise.all(
    configurations.map(async (config) => {
      const id = get(args, config.field);
      
      if(isArray(id) && !id.length){
        return;
      }
      const acceptString = get(config, 'accept_string');
      if (acceptString && !validate(id)){
        return;
      }
      if (id) {
        const transport = await getTransport(id, config, models, transactionInstance);
        return transport;
      }
    })
  );
  const transports = flattenDeep(filter(results, result => result));
  
  if(!transports.length){
    throw new Error('could not find transport_id');
  }
  return {
    args: { ...args },
    transports, 
  };
};

const checkForEntities = (args, configurations) => {
  const excludeEntities = get(configurations, 'include_entities');
  const propPath = get(configurations, 'entity_field');
  const entity = get(args, propPath);
  const entityName = validate(entity) ? get(entities, entity) : entity;
  if(entityName){
    return excludeEntities.includes(entityName);
  }
};

const reMapTransports = async (args, result, operation, models, transactionInstance) => {
  const configurations = JSON.parse(JSON.stringify(get(config, operation)));
  const hasIncludedFlag = get(configurations, 'include_entities');
  if(!configurations) {
    return;
  }

  if (hasIncludedFlag) {
    const isIncluded = checkForEntities(args, configurations);
    if (!isIncluded){
      return;
    }
  }
  
  if (configurations.set_dyanamic_transport) {
    setDyanamicConfigurations(args, configurations)
  }

  if (configurations.has_child) {
    return getCompositeArgsWithTransports(configurations, args, result, models, transactionInstance);
  }

  reMapArgsAndConfigurations(configurations, args, result, operation);
  const data = await getArgsWithTransports(args, configurations.transports, models, transactionInstance);
  return excludeProps(data, configurations);
};

module.exports = {
  reMapTransports
};
