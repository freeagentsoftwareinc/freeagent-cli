const { validate } = require('uuid');
const { get, set, isArray, omit, find, fromPairs, has, filter, flattenDeep, indexOf, keys } = require('lodash');
const { entities, parentRefKeys, parentEntitiesMap }  = require('../utils/constants.js');
const config = require('../config.json');
const { argsToFindOptions } = require('graphql-sequelize');
const { condition } = require('sequelize');
const { assertUnionType } = require('graphql');

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

const reMapArgsAndConfigurations = async (configurations, args, result, models) => {
  const result_path = get(configurations, 'result_path');
  const result_value_path = get(result, result_path);
  const result_dataValues = get(result_value_path, 'dataValues');
  const resultObj = result_path 
    ? { ...result, ...result_value_path, ...result_dataValues }
    : { ...result.dataValues, ...result }
    
  const field = get(configurations, 'id');
  const modelKey = get(configurations, 'entity_field');
  const parsePath = get(configurations, 'args_parse_path');

  if (field) {
    const id = get(resultObj, field);
    set(args, 'id', id);
  }

  if (parsePath) {
    set(args, parsePath, JSON.parse(args[parsePath]));
  }

  if (modelKey) {
    let model = get(args, modelKey);
    if(validate(model)) {
      model = get(entities, model);
    }
    if(configurations.transports.length && model){
      configurations.transports.forEach((transport) => {
        if(!transport.model) {
          if(transport.has_parent){
            const childModel = get(parentEntitiesMap, model);
            set(transport, 'model', childModel);
            return;
          }
          set(transport, 'model', model);
        }
      })
    }
  };
};

const findTransportId = async (models, modelName, where, transactionInstance, attribute = null) => {
  try {
    if (!models[modelName]) {
      return;
    }
    const attributes = attribute ? attribute : 'transport_id';
    const result = await models[modelName].findOne({
      where,
      attributes: [attributes],
      raw: true,
      transaction: transactionInstance,
    });
    return get(result, attributes);
  } catch (err) {
    console.log(err);
    return err;
  }
};

const findAllTransportIds = async (models, modelName, where, transactionInstance) => {
  try {
    if (!models[modelName]) {
      return;
    }
    const results = await models[modelName].findAll({
      raw: true,
      attributes: ['transport_id'],
      where,
      transaction: transactionInstance
    });
    return results.map((result) => get(result, 'transport_id'));
  } catch (err) {
    console.log(err);
    return err;
  }
};

const getTransportIdFromDB = async (where, config, models, transactionInstance) => {
  const modelName = get(config, 'model');
  const transports = config.bulk 
    ? await findAllTransportIds(models, modelName, where, transactionInstance)
    : await findTransportId(models, modelName, where, transactionInstance);
  return transports;
};

const generateWhere = (id, args, config, field, instance) => {
  const where = {};
  const whereField = get(config, 'where_field');
  if(!whereField) {
    set(where, 'id', id);
    return where;
  };

  if(typeof whereField === 'string'){
    set(where, whereField, id);
    return where;
  }
  config.where_field.forEach(whereConfig => {
    const value = whereConfig.root ? get(args, whereConfig.value) : get(instance, whereConfig.value);
    set(where, whereConfig.key, value);
  });
  return where;
};

const getModelValue = (args, config) => {
  if(config.model){
    return config.model;
  }
  const modelValue = get(args, config.model_key);
  if(!validate(modelValue)){
    return modelValue;
  }
  const model = get(entities, modelValue);
  return model;
}

const getTransportIds = async (id, args, config, models, field, transactionInstance, position=null, instance) => {
  const model = getModelValue(args, config) ;
  const setAttribute = get(config, 'set_attribute')
  const where = generateWhere(id, args, config, field, instance);
  const transportId = models ? await getTransportIdFromDB(where, config, models, transactionInstance) : await getTransportIdFromLocalDB(id, config);
  if (!transportId) {
    return null;
  }
  const transport = {
    id: transportId,
    field: position !==null ? `${field}[${position}]` : field,
    model,
  };

  if (setAttribute) {
    set(transport, 'attribute', setAttribute);
  }
  return transport;
}

const getTransport = async (id, args, config, models, field, transactionInstance, instance) => {
  const transports = isArray(id)
    ? await Promise.all(id.map(async (value, index) => await getTransportIds(value, args, config, models, field, transactionInstance, index, instance)))
    : await getTransportIds(id, args, config, models, field, transactionInstance, null, instance);
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

const setArgsFromDB = async (id, args, config, models, transactionInstance) => {
  const attribute = get(config, 'attribute') || null;
  const setField = get(config, 'set_field') || null;
  const where = set({}, get(config, 'where_field') || 'id', id);
  if(!id || !setField){
    return;
  }
  const result = await findTransportId(models, config.model, where, transactionInstance, attribute)
  if(!result){
    return;
  }

  set(args, setField, result)
};

const getMappedTransport = async (args, config, models, field, transactionInstance, instance=null) => {
  const id = get(args, field) || get(args, config.field); 
  if(!id || (isArray(id) && !id.length)){
    return;
  }
  const isNonUuid = get(config, 'non_uuid')
  if(!config.skip_non_uuid_check) {
    if (config.field !== 'id' && (!isNonUuid && !validate(id)) || (isNonUuid && validate(id))){
      return;
    }
  }

  if (id && !config.set_field) {
    return getTransport(id, args, config, models, field, transactionInstance, instance);
  }
  await setArgsFromDB(id, args, config, models, transactionInstance);
};

const getMappedTransports = async (args, config, models, transactionInstance) => {
  const instances = get(args, config.array_path);
  if (!isArray(instances)) {
    return;
  }
  const transports = await Promise.all(
    instances.map(async (instance, index) => {
    const field = `${config.array_path}[${index}].${config.field}`;
    const transport = await getMappedTransport(args, config, models, field, transactionInstance, instance);
    return transport;
  }));
  return flattenDeep(filter(transports, transport => transport));
};

const getArgsWithTransports = async (args, configurations, models, transactionInstance) => {
  const results = await Promise.all(
    configurations.map(async (config) => {
      const field = get(config, 'transport_field') ? 'transport_id' : config.field;
      const transport = !config.array_path
        ? await getMappedTransport(args, config, models, field, transactionInstance)
        : await getMappedTransports(args, config, models, transactionInstance);
        return transport;
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

  if(!get(config, operation)){
    return;
  }
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

  reMapArgsAndConfigurations(configurations, args, result, operation);
  const data = await getArgsWithTransports(args, configurations.transports, models, transactionInstance);
  return excludeProps(data, configurations);
};

module.exports = {
  reMapTransports
};
