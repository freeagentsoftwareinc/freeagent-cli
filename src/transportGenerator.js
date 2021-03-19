const { validate } = require('graphql');
const { get, set, isArray, omit, find } = require('lodash');
const { entities, parentRefKeys } = require('../utils/constants');
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

const getCompositeTransports = async (fields, models, modelName, configurations, parentId) => {
  const transports = [];
  if (fields) {
    return await Promise.all(fields.map(async(field, index) => {
      const fieldName = field[0];
      const fieldValue = field[1];
      let filedConfig = find(configurations.fields, { field: fieldName })
      if (fieldValue && fieldName === 'id' || fieldName === 'name') {
        filedConfig = {
          model: modelName,
        }
      };

      if (filedConfig) {
        let where = filedConfig.where ? set({}, filedConfig.where, fieldValue) : set({}, 'id', fieldValue);
        if(fieldName === 'name' && parentId) {
          const parentRefKey = get(parentRefKeys)
          where = {

          }
        }
        const model = filedConfig.model;
        const transportId = await findTransportId(models, model, where);
        transports.push({
          id: transportId,
          field: `${propName}[${index}].[0][1]`,
          model 
        });
      }
    }))
    .then(()=> {
      return transports;
    });
  }
};

const reMapUpsertConfigurations = async (configurations, args, result) => {
  const modelName = getModel(args, configurations.parent_model_key);
  const id = get(args, configurations.field);
  const parentId = get(result.parent_id);
  const parentProp = get(configurations, parent_prop);
  const childProp = get(configurations, child_prop);
  const where = { id: parentId };
  const transportId = await findTransportId(models, modelName, where);
  const transports = [{
    id: transportId,
    field: id ? 'configurations.field' : 'tranpsort_id',
    model: modelName
  }];
  const parentTransports = getCompositeTransports(args, configurations, parentProp, parentId);
  const childTransports = getCompositeTransports(args, configurations, childProp, parentId);
};


const reMapArgsAndConfigurations = (configurations, args, result) => {
  const field = get(configurations, 'args.field');
  const modelKey = get(configurations, 'model_key');
  if (field) {
    const id = get(result, field);
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
  // const transports = dynamicTransports(data, );  
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

const reMapTransports = async (args, result, operation, models) => {
  const configurations = get(config, operation);
  if(!configurations) {
    return;
  }
  
  if(configurations.set_dyanamic_transport){
    setDyanamicConfigurations(args, configurations)
  }

  // if (configurations.has_child && configurations.has_child){
  //   reMapUpsertConfigurations(configurations, args, result);
  // }
  reMapArgsAndConfigurations(configurations, args, result, operation);
  const data = await getArgsWithTransports(args, configurations.transports, models);
  return excludeProps(data, configurations);
};

module.exports = {
  reMapTransports
};
