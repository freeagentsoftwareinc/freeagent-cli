const { validate } = require('uuid');
const { get, set, isArray, omit, find, fromPairs, has } = require('lodash');
const { entities, parentRefKeys } = require('../utils/constants.js');
const config = require('../config.json');

const getTransportIdFromLocalDB = async (id, config) => {};

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
    const fieldValue = field[1];
    const isUniqeField = configurations.unique_fields.includes(fieldName) && parent;
    let filedConfig = find(configurations.fields, { field: fieldName });
    const model = filedConfig ? filedConfig.model : info.model;
    const conditionField = isUniqeField ? fieldName : 'id';
    if(!fieldValue || (!filedConfig && !isUniqeField)){
      return;
    }

    const where = set({}, conditionField, fieldValue);
    parent && set(where, get(parentRefKeys, parent.model), parent.id);
    const transportId = await findTransportId(models, model, where);
    if(!transportId){
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
      field: parentInfo.field ? 'id' : 'transport_id',
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

const findTransportId = async (models, modelName, where) => {
  const result = await models[modelName].find({
    raw: true,
    attributes: ['transport_id'],
    where,
  });
  return get(result, 'transport_id');
};

const findAllTransportIds = async (models, modelName, where) => {
  const results = await models[modelName].findAll({
    raw: true,
    attributes: ['transport_id'],
    where,
  });
  return results.map((result) => get(result, 'transport_id'));
};

const getTransportIdFromDB = async (id, config, models) => {
  const whereField = get(config, 'where_field') || 'id';
  const modelName = get(config, 'model');
  const where = set({}, whereField, id);
  if (config.bulk) {
    return await findAllTransportIds(models, modelName, where);
  }
  return await findTransportId(models, modelName, where);
};

const getTransportIds = async (id, config, models, position=null) => {
  const model = config.model;
  const field = get(config, 'transport_field') ? 'transport_id' : config.field;
  const transportId = models ? await getTransportIdFromDB(id, config, models) : getTransportIdFromLocalDB(id, config);
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
  if (isArray(id)) {
    return await Promise.all(id.map(async (value, index) => await getTransportIds(value, config, models, index)));
  }
  return await getTransportIds(id, config, models);
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
  let transports = [];
  return await Promise.all(
    configurations.map(async (config) => {
      const id = get(args, config.field);
      if (id) {
        const transport = await getTransport(id, config, models);
        if (transport) {
          transports = transports.concat(transport);
        }
      }
      return config;
    })
  ).then(() => {
    return {
      args: { ...args },
      transports: [...transports],
    };
  });
};

const checkIfExcluded = (args, configurations) => {
  const excludeEntities = get(configurations, 'exclude_entities');
  const propPath = get(configurations, 'entity_field');
  const entity = get(args, propPath);
  const entityName = validate(entity) ? get(entities, entity) : entity;
  if(entityName){
    return excludeEntities.includes(entityName);
  }
};

const reMapTransports = async (args, result, operation, models) => {
  const configurations = get(config, operation);
  const hasExcludeFlag = get(configurations, 'exclude_entities');
  if(!configurations) {
    return result;
  }

  if (hasExcludeFlag) {
    const isExcluded = checkIfExcluded(args, configurations);
    if (isExcluded){
      return result;
    }
  }
  
  if (configurations.set_dyanamic_transport) {
    setDyanamicConfigurations(args, configurations)
  }

  if (configurations.has_child) {
    getCompositeArgsWithTransports(configurations, args, result, models);
    return result;
  }

  reMapArgsAndConfigurations(configurations, args, result, operation);
  const data = await getArgsWithTransports(args, configurations.transports, models);
  excludeProps(data, configurations);
  return result;
};

module.exports = {
  reMapTransports
};
