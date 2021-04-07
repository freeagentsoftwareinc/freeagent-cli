const chalk = require('chalk');
const { v4 } = require('uuid');
const { set, get, snakeCase } = require('lodash');
const { modelsMap, createEntityMap, faEntitiesName, errorMessages } = require('../utils/constants');
const { findOne, findLast, findAll, insert, resetDb } = require('./db');
const { createRecord, updateRecord, getSavedData, saveDataToFile, createDefaultField } = require('./helper');
const { reWriteAddEntityFiles } = require('./reComposeFiles');

const addChangeset = (operation, data) => {
  const option = {
    name: data.args.name,
    description: data.args.description,
  };
  // const changeset = findOne('fa_changeset', option);
  // if( changeset){
  //     console.log(chalk.red(`changeset name ${data.args.name} exists, please use different name`));
  //     return;
  // }
  createRecord(data, 'fa_changeset', option);
  return option;
};

const addApp = (operation, data, file) => {
  const id = v4();
  set(data, 'id', id);
  const option = {
    id,
    fa_entity_id: id,
    file,
    name: snakeCase(data.label),
    label_plural: data.label_plural,
    isLine: false,
  };
  if (faEntitiesName.includes(snakeCase(data.label))) {
    console.log(chalk.red(`The system app exists called ${data.label}, please use the different name`));
    return;
  }
  createRecord('fa_entity_config', operation, option);
  createDefaultField(id, option.name);
  return { ...data };
};

const updateApp = (operation, data, file) => {
  const option = {
    name: snakeCase(data.label),
    isLine: false,
  };
  data = updateRecord(data, file, 'fa_entity_config', operation, option);
  return { ...data };
};

const toggleApp = (operation, data, file) => {
  const option = {
    operation,
    name: data.args.name,
  };
  data = updateRecord(data, file, 'fa_entity_config', option, false, true);
  delete data.args.name;
  return { ...data };
};

const addLine = (operation, data, file) => {
  const where = {
    name: data.args.parent_id,
    isLine: false,
  };
  const app = findOne('fa_entity_config', where);
  const parentId = app && app.id ? app.id : '';
  if (!parentId) {
    console.log(errorMessages.notFoundEror);
  }
  const option = {
    operation,
    file,
    name: data.args.label,
    label_plural: data.args.label_plural,
    parent_id: parentId,
    isLine: true,
  };
  data = createRecord(data, 'fa_entity_config', option);
  set(data, 'args.parent_id', parentId);
  return { ...data };
};

const toggleLine = (operation, data, file) => {
  const where = {
    name: data.args.parent_id,
    isLine: false,
  };
  const app = findOne('fa_entity_config', where);
  const parentId = app && app.id ? app.id : '';
  const option = {
    operation,
    name: data.args.label,
    parent_id: parentId,
    isLine: true,
  };
  data = updateRecord(data, file, 'fa_entity_config', option, false, true);
  delete data.args.parent_id;
  delete data.args.label;
  return { ...data };
};
const addField = (operation, data, file) => {
  const option = {
    operation,
    file,
    app: data.entity,
    name: data.name_label,
  };
  const app = findOne('fa_entity_config', { name: data.entity });
  if (!app) {
    console.log(
      chalk.red(
        'Targeted app is not present in current changeset, adding field considering the system / other changeset app'
      )
    );
  }
  set(data, 'related_list_name', (app && app.label_plural) || data.entity);
  set(data, 'related_list_name_plural', (app && app.label_plural) || data.entity);
  data = createRecord(data, 'fa_field_config', option);
  return { ...data };
};

const updateField = (operation, data, file) => {
  const option = {
    operation,
    app: data.args.entity,
    name: data.args.name_label,
  };
  data = updateRecord(data, file, 'fa_field_config', option);
  return { ...data };
};

const deleteField = (operation, data, file) => {
  const option = {
    operation,
    app: data.args.entity,
    name: data.args.name_label,
  };
  data = updateRecord(data, file, 'fa_field_config', option, true);
  if (data.transports.length) {
    const id = get(data.transports.pop(), 'id');
    data.transports.push({
      delete_custom_field: {
        id,
        field: 'id',
        model: 'fa_field_config',
      },
    });
  }
  delete data.args.entity;
  delete data.args.name_label;
  return { ...data };
};

const toggleField = (operation, data, file) => {
  const option = {
    operation,
    app: data.args.entity,
    name: data.args.name_label,
  };
  data = updateRecord(data, file, 'fa_field_config', option, false, true);
  delete data.args.entity;
  delete data.args.name_label;
  return { ...data };
};

const addCatalog = (operation, data, file) => {
  const option = {
    operation,
    file,
    name: data.args.catalog.name,
    app: data.args.catalog.entityName,
    field: data.args.catalog.custom_field_id,
  };
  const field = findOne('fa_field_config', { name: option.field, app: option.entityName });
  if (!field) {
    set(data, 'args.catalog.fa_field_config_id', '');
    console.log(
      chalk.red(
        'Targeted field is not present in current changeset, adding stage considering the system / other changeset app'
      )
    );
  }
  const catalog = findLast('catalog', { name: option.name, field: option.field, app: option.entityName });
  const order = catalog && catalog.order ? catalog.order + 1 : 1;
  set(data, 'args.catalog.order', order);
  set(option, 'order', order);
  data = createRecord(data, 'catalog', option);
  return {
    ...data,
  };
};

const updateOrder = (operation, data, file) => {
  const entityName = get(data, 'args.entityName');
  const entity = get(data, 'args.entity');
  const field_name = get(data, 'args.field_name');
  const field_value = get(data, 'args.field_value');
  if (field_name && field_value) {
    data.args.filters.push({
      field_name,
      values: [field_value],
    });
    delete data.args.field_name;
    delete data.args.field_value;
  }
  insert('reorder', {
    operation,
    file,
    entity,
    entityName,
    isExported: false,
  });
  return { ...data };
};

const updateCardConfigs = (operation, data, file) => {
  insert('cards', {
    operation,
    file,
    entity: data.args.entity,
    isExported: false,
  });
  return { ...data };
};

const addRole = (operation, data, file) => {
  const option = {
    operation,
    file,
    name: data.args.field_values.name,
  };
  data = createRecord(data, 'fa_role', option);
  return { ...data };
};

const updateRole = (operation, data, file) => {
  const option = {
    operation,
    name: data.args.field_values.name,
  };
  data = updateRecord(data, file, 'fa_role', option);
  return { ...data };
};

const toggleRole = (operation, data, file) => {
  const option = {
    operation,
    name: data.args.name,
  };
  data = updateRecord(data, file, 'fa_role', option, false, true);
  delete data.args.name;
  return { ...data };
};

const addSection = (operation, data, file) => {
  const option = {
    operation,
    file,
    app: data.args.field_values.entityName,
    name: data.args.field_values.title,
  };
  const app = findOne('fa_entity_config', { name: data.args.field_values.entityName });
  if (!app) {
    console.log(
      chalk.red(
        'Targeted app is not present in current changeset, adding section considering the system / other changeset app'
      )
    );
  }
  data = createRecord(data, 'layout', option);
  return { ...data };
};

const updateSection = (operation, data, file) => {
  const option = {
    operation,
    app: data.args.field_values.entityName,
    name: data.args.field_values.title,
  };
  data = updateRecord(data, file, 'layout', option);
  return { ...data };
};

const toggleSection = (operation, data, file) => {
  const option = {
    operation,
    app: data.args.targetApp,
    name: data.args.name,
  };
  data = updateRecord(data, file, 'layout', option, false, true);
  delete data.args.name;
  delete data.args.targetApp;
  return { ...data };
};

const addAppAction = (operation, data, file) => {
  const option = {
    operation,
    file,
    app: data.args.field_values.entityName,
    name: data.args.field_values.name,
  };
  const app = findOne('fa_entity_config', { name: data.args.field_values.entityName });
  if (!app) {
    console.log(
      chalk.red(
        'Targeted app is not present in current changeset, adding action considering the system / other changeset app'
      )
    );
  }
  data = createRecord(data, 'app_action', option);
  return { ...data };
};

const updateAppAction = (operation, data, file) => {
  const option = {
    operation,
    app: data.args.field_values.entityName,
    name: data.args.field_values.name,
  };
  data = updateRecord(data, file, 'app_action', option);
  return { ...data };
};

const toggleAction = (operation, data, file) => {
  const option = {
    operation,
    app: data.args.targetApp,
    name: data.args.name,
  };
  data = updateRecord(data, file, 'app_action', option, false, true);
  delete data.args.name;
  delete data.args.targetApp;
  return { ...data };
};

const addAcl = (operation, data, file) => {
  const option = {
    operation,
    file,
    app: data.args.field_values.entityName,
    name: data.args.field_values.fa_field_id,
  };
  const app = findOne('fa_entity_config', { name: data.args.field_values.entityName });
  if (!app) {
    console.log(
      chalk.red(
        'Targeted app is not present in current changeset, adding ACL considering the system / other changeset app'
      )
    );
  }
  data = createRecord(data, 'fa_acl', option);
  return { ...data };
};

const updateAcl = (operation, data, file) => {
  const option = {
    operation,
    app: data.args.field_values.entityName,
    name: data.args.field_values.fa_field_id,
  };
  data = updateRecord(data, file, 'fa_acl', option);
  return { ...data };
};

const toggleAcl = (operation, data, file) => {
  const option = {
    operation,
    app: data.args.targetApp,
    name: data.args.targetField,
  };
  data = updateRecord(data, file, 'fa_acl', option, false, true);
  delete data.args.targetApp;
  delete data.args.fa_field_id;
  return { ...data };
};

const toggleChoiceList = (operation, data, file) => {
  const option = {
    operation,
    name: data.args.name,
  };
  data = updateRecord(data, file, 'catalog_type', option, false, true);
  delete data.args.name;
  return { ...data };
};

const toggleAutomation = (operation, data, file) => {
  const option = {
    operation,
    name: data.args.name,
  };
  data = updateRecord(data, file, 'rule_set', option, false, true);
  delete data.args.name;
  return { ...data };
};

const toggleFormrule = (operation, data, file) => {
  const option = {
    operation,
    name: data.args.description,
  };
  data = updateRecord(data, file, 'form_rule', option, false, true);
  delete data.args.description;
  delete data.args.entityName;
  return { ...data };
};

const addView = (operation, data, file) => {
  const option = {
    operation,
    file,
    app: data.args.entity,
    name: data.args.name,
  };
  const view = findOne('view', { app: data.args.entity, name: data.args.name });
  if (view) {
    console.log(chalk.red('given view name already present, please use name different name'));
    return;
  }
  data = createRecord(data, 'view', option);
  return { ...data };
};

const updateView = (operation, data, file) => {
  const option = {
    operation,
    app: data.args.entity,
    name: data.args.name,
  };
  data = updateRecord(data, file, 'view', option);
  return { ...data };
};

const addDashboard = (operation, data, file) => {
  const option = {
    operation,
    file,
    name: data.args.title,
  };
  const dashboard = findOne('dashboard', { name: data.args.title });
  if (dashboard) {
    console.log(chalk.red('given dashboard name already present, please use name different name'));
    return;
  }
  data = createRecord(data, 'dashboard', option);
  return { ...data };
};

const updateDashboard = (operation, data, file) => {
  const option = {
    operation,
    name: data.args.title,
  };
  data = updateRecord(data, file, 'dashboard', option);
  return { ...data };
};

const addSaveComposite = async (operation, data, file) => {
  const { model, childModel } = modelsMap.get(data.args.parent_entity_id);
  const option = {
    operation,
    model,
    childModel,
    name: data.args.parent_fields.name,
  };

  if (model === 'form_rule') {
    set(option, 'name', data.args.parent_fields.description);
  }
  const isExisingChoiceList = findOne(model, option);
  if (isExisingChoiceList) {
    console.log(chalk.red('name already exists in current changeset, please use different name'));
    throw new Error('name exisits');
  }
  data = createRecord(data, model, { file, ...option });
  return { ...data };
};

const createTransportIdsForChildren = async (instance) => {
  const savedData = await getSavedData(instance);
  if (!savedData) {
    console.log(chalk.red('Data is not exists in current changeset'));
    return;
  }
  const children = savedData.args.children.map((child) => {
    if (!child.id) {
      const id = v4();
      set(child, 'id', id);
      insert(instance.childModel, {
        id,
        file: instance.file,
        parentId: instance.id,
        parentName: instance.name,
      });
      return child;
    }
    return child;
  });
  set(savedData, 'args.children', children);
  return {
    ...savedData,
  };
};

const updateSaveComposite = async (operation, data, file) => {
  const { model, childModel } = modelsMap.get(data.args.parent_entity_id);
  const option = {
    operation,
    model,
    childModel,
    name: data.args.parent_fields.name,
  };

  if (model === 'form_rule') {
    set(option, 'name', data.args.parent_fields.description);
  }

  const instance = findLast(model, option);
  if (!instance) {
    console.log(chalk.red('Data is not exists in current changeset'));
  }
  const updateSavedData = instance && (await createTransportIdsForChildren(instance));
  if (updateSavedData) {
    await saveDataToFile(updateSavedData, instance.file);
    data.args = { ...updateSavedData.args };
    data.transports = [
      {
        id: instance.id,
        field: 'instance_id',
        model,
      },
    ];
  }
  if (data.args.children.length) {
    data.args.children.forEach((child) => {
      if (!child.id) {
        child.id = '';
      }
    });
  }
  insert(model, { file, model, childModel, isUpdate: true, isExported: false, ...option });
  return { ...data };
};

const remapSaveComposite = async () => {
  try {
    reWriteAddEntityFiles();
    // modelsMap.forEach(async (value) => await reWriteSaveCompositeEntityFiles(findAll(value.model)));
    // createEntityMap.map((model) => reWriteCreateUpdateEntityFiles(findAll(model), model));
    // reWriteUpdateEntityConfigFiles();
    // reWriteFieldsFiles();
    // reWriteUpdateOrderFiles();
    // reWriteCardConfigFiles();
    // reWriteStageFields();
    // reWriteViewFiles();
    // reWriteDashboardFiles();
  } catch (e) {
    throw e;
  }
};

const runAction = {
  addChangeset,
  addApp,
  updateApp,
  toggleApp,
  addLine,
  toggleLine,
  addField,
  updateField,
  toggleField,
  updateOrder,
  deleteField,
  addRole,
  updateRole,
  toggleRole,
  addSection,
  updateSection,
  toggleSection,
  addAppAction,
  updateAppAction,
  toggleAction,
  toggleChoiceList,
  addAcl,
  updateAcl,
  toggleAcl,
  addSaveComposite,
  updateSaveComposite,
  remapSaveComposite,
  updateCardConfigs,
  toggleAutomation,
  toggleFormrule,
  addCatalog,
  addView,
  updateView,
  addDashboard,
  updateDashboard,
};

module.exports = {
  runAction,
};
