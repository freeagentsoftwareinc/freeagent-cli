const { validate } = require('uuid');
const { get, set, isArray, omit, find, fromPairs, has, filter, flattenDeep } = require('lodash');
const { entities, parentRefKeys } = require('../utils/constants');
const config = require('../config.json');

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
  const excludes = get(configurations, 'excludes');
  if(excludes){
    const updatedArgs = omit(data.args, excludes);
    set(data, 'args', updatedArgs);
  }
  return data;
};

const getCompositeTransports = async (info, configurations, transports, models, parent=null, newInstanceTrasports=null) => {
  const fieldObj =  parent && fromPairs(info.props)
  const isNewInstance = fieldObj && !has(fieldObj, 'id');
  await Promise.all(info.props.map(async(field, index) => {
    const fieldName = field[0];
    let fieldValue = field[1];
    const isUniqeField = configurations.unique_fields.includes(fieldName) && parent;
    let filedConfig = find(configurations.fields, { field: fieldName });
    const model = filedConfig ? filedConfig.model : info.model;
    const conditionField = isUniqeField ? fieldName : 'id';
    const attribute = get(filedConfig, 'attribute') || null;
    const setField = get(filedConfig, 'set_field');
    if(get(filedConfig, 'comma_values') && fieldValue) {
      const arrayValues = fieldValue.split(',');
      fieldValue = arrayValues[0];
    }

    if(!fieldValue || (!filedConfig && !isUniqeField)){
      return;
    }

    const where = set({}, conditionField, fieldValue);
    parent && set(where, get(parentRefKeys, parent.model), parent.id);
    const transportId = await findTransportId(models, model, where, attribute);

    if(!transportId){
      return;
    }

    if (attribute && transportId) {
      field[0] = setField;
      field[1] = transportId;
      return;
    }

    isNewInstance && isUniqeField
      ? newInstanceTrasports.push(transportId)
      : transports.push({
      id: transportId,
      field: `${info.key}[${index}][1]`,
      model
    });
  }));
};

const getCompositeArgsWithTransports = async (configurations, args, result, models) => {
  let childModelName;
  const transports = [];
  const newInstanceTrasports = []
  const parentInfo = {
    id: get(result, 'parent_id'),
    model: getModel(args, configurations.parent_model_key),
    key: 'parent_fields',
    props: get(args, 'parent_fields'),
    field: get(args, configurations.field)
  };
  const childInfo = {
    fields: get(args, 'children'),
    modelKey: get(configurations, 'child_model_key'),
  };
  const where = { id: parentInfo.id };
  const transportId = await findTransportId(models, parentInfo.model, where);
  await getCompositeTransports(parentInfo, configurations, transports, models);
  await Promise.all(childInfo.fields.map(async (child, index) => {
    set(childInfo, 'key', `children[${index}].custom_fields`);
    set(childInfo, 'props', child.custom_fields);
    !childModelName && set(childInfo, 'model', getModel(child, childInfo.modelKey));
    await getCompositeTransports(childInfo, configurations, transports, models, parentInfo, newInstanceTrasports);
  }));

  if(transportId) {
    transports.push({
      id: transportId,
      field: parentInfo.field ? 'instance_id' : 'transport_id',
      model: parentInfo.model
    });
  }

  if(newInstanceTrasports.length) {
    transports.push({
      id: newInstanceTrasports,
      field: 'transport_id',
      model: childInfo.model
    })
  };
  return {
    args: { ...args },
    transports: [...transports],
  };
};

const reMapArgsAndConfigurations = (configurations, args, result) => {
  const resultObj = { ...result.dataValues, ...result }
  const field = get(configurations, 'args.field');
  const modelKey = get(configurations, 'model_key');
  if (field) {
    const id = get(resultObj, field);
    set(args, 'id', id);;
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

const findTransportId = async (models, modelName, where, attribute = null) => {
  if(models[modelName]) {
    const attributes = attribute ? attribute : 'transport_id';
    const result = await models[modelName].find({
      raw: true,
      attributes: [attributes],
      where,
    });
    return get(result, attributes);
  }
};

const findAllTransportIds = async (models, modelName, where) => {
  if(models[modelName]) {
    const results = await models[modelName].findAll({
      raw: true,
      attributes: ['transport_id'],
      where,
    });
    return results.map((result) => get(result, 'transport_id'));
  }
};

const getTransportIdFromDB = async (id, config, models) => {
  const whereField = get(config, 'where_field') || 'id';
  const modelName = get(config, 'model');
  const where = set({}, whereField, id);
  console.log(where, "where", modelName);

  const transports = config.bulk 
    ? await findAllTransportIds(models, modelName, where)
    : await findTransportId(models, modelName, where);
    return transports;
};

const getTransportIds = async (id, config, models, position=null) => {
  const model = config.model;
  const field = get(config, 'transport_field') ? 'transport_id' : config.field;
  const transportId = models ? await getTransportIdFromDB(id, config, models) : await getTransportIdFromLocalDB(id, config);
  if (!transportId) {
    return null;
  }
  return {
    id: transportId,
    field: position !==null ? `${field}[${position}]` : field,
    model,
  };
}

const getTransport = async (id, config, models) => {
  const transports = isArray(id)
    ? await Promise.all(id.map(async (value, index) => await getTransportIds(value, config, models, index)))
    : await getTransportIds(id, config, models);
  return transports;
};

const setDyanamicConfigurations = (args, configurations) => {
  const model = getModel(args, configurations.model_key);
  const arrayProp = configurations.array_prop;
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

const getArgsWithTransports = async (args, configurations, models) => {
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
        const transport = await getTransport(id, config, models);
        return transport;
      }
    })
  );
  console.log(results);
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

const reMapTransports = async (args, result, operation, models) => {
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
    return getCompositeArgsWithTransports(configurations, args, result, models);
  }

  reMapArgsAndConfigurations(configurations, args, result, operation);
  const data = await getArgsWithTransports(args, configurations.transports, models);
  return excludeProps(data, configurations);
};

module.exports = {
  reMapTransports
};
