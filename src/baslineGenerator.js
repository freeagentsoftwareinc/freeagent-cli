const configurations = require('../baseline_config.json');
const { reMapTransports } = require('./transportGenerator');
const { v4 } = require('uuid');
const { get, set } = require('lodash');

const createBaselinePlugin = async (models)=>  {
  const name = `baseline_plugin_${Date.now()}`
  const baselinePluing = await models['changeset'].create({
    name,
    description: "baseline plugin",
    status: "completed",
    stage: '2387084e-3f6a-4f21-80ce-9425ae6594d8',
    is_active: false,
    dependencies: "",
    dependency_metadata: "",
    transport_id: v4()
  },
  {
    raw: true
  });
  return {
    parent_entity_reference_id: baselinePluing.id,
    scopes: baselinePluing.scopes
  }
};

const saveCustomizationToPlugin = async (models, customizations, baselinePlugin) => {
  await Promise.all((customizations.pop() || []) .map(async (customization) => {
  const newChangeset = {
    metadata: JSON.stringify(
      {
        ...customization.data,
      },
      null,
      4
    ),
    operation: customization.api,
    name: `${Date.now()}_${customization.api}.json`,
    ...baselinePlugin
  };
  await models['changeset_customization'].create(newChangeset);
  }));
};

const getRecords = async (models, scopes, attributes, config) => {
  const model = get(config, 'model');
  if(!model || !models[model]){
    return;
  }
  const result = await models[model].findAll({
    skipScopes: true,
    where: {
      scopes
    },
    raw: true,
    attributes,
  });
  return result
};

const getInstance = async (models, model, where, attributes) => {
  try {
    if(!models[model]){
      return;
    }
    attributes = attributes || ['id'];
    const result = await models[model].findOne({
      where,
      attributes,
      raw: true,
    });
    return result;
  } catch (err) {
    console.log(err);
    return err;
  }
};

const setArgsField = (instance, result, attribute, setField) => {
  attribute.forEach((attr, index) => {
    const value = get(result, attr);
    const key = setField[index] || attr;
    set(instance, key, value);
  });
};

const getArgs = async (models, apiConfig, instance) => {
  await Promise.all(apiConfig.args.map(async (config)=> {
    const field = get(config, 'field');
    const value = get(instance, field);
    const whereField = get(config, 'where_field');
    const where = set({}, whereField || 'id', value);
    const result = await getInstance(models, config.model, where, config.attributes);
    setArgsField(instance, result, config.attributes, config.set_field);
  }));
  return {...instance };
};

const getMetaDataWithTransports = async (models, args, configuration, apiConfig) => {
  const customConfig = apiConfig.transports ? apiConfig : null;
  const data = await reMapTransports(args, {}, configuration.api, models, null, customConfig);
  return {
    data,
    api: configuration.api
  };
};

const getMetaData = async (models, configuration, apiConfig, instances) => {
  return await Promise.all(instances.map(async (instance) => {
    const args = await getArgs(models, apiConfig, instance);
    return await getMetaDataWithTransports(models, args, configuration, apiConfig);
  }));
};

const captureMetaData = async (models, scopes) => {
  const modelsConfig = get(configurations, 'models_config');
  return await Promise.all(modelsConfig.map(async (configuration) => {
    const apiConfig = get(configurations.api_config, configuration.api_config);
    const instances = await getRecords(models, scopes, apiConfig.attributes, configuration);
    return await getMetaData(models,  configuration, apiConfig, instances);
  }));
};

const getBaseline = async (models, scopes) => {
  try {
    const baselinePlugin = await createBaselinePlugin(models);
    const customizations = await captureMetaData(models, scopes);
    await saveCustomizationToPlugin(models, customizations, baselinePlugin);
    return baselinePlugin;
  } catch (err) {
    console.log(err);
    throw err;
  }
};

module.exports = {
  getBaseline,
};