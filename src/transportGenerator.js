const { get, set } = require('lodash');
const config = require('./config.json');

const getTransportIdFromLocalDB = async (id, config) => {};

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

const getTransport = async (id, config, models) => {
  const model = config.model;
  const field = get(config, 'transport_field') ? 'transport_id' : config.field;
  const transportId = models ? await getTransportIdFromDB(id, config, models) : getTransportIdFromLocalDB(id, config);
  if (!transportId) {
    return null;
  }
  return {
    id: transportId,
    field,
    model,
  };
};

const getArgsWithTransports = async (args, configurations, models) => {
  const transports = [];
  return await Promise.all(
    configurations.map(async (config) => {
      const id = get(args, config.field);
      if (id) {
        const transport = await getTransport(id, config, models);
        if (transport) {
          transports.push(transport);
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

const reMapTransports = async (args, operation, models) => {
  const configurations = get(config, operation);
  return await getArgsWithTransports(args, configurations, models);
};

exports.reMapTransports = reMapTransports;