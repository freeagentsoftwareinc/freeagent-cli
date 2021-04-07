const fs = require('fs');
const { set } = require('lodash');
const { v4 } = require('uuid');
const { errorMessages, modelsForEntityValueId, defaultFields } = require('../utils/constants');
const { insert, findOne, findAll } = require('./db');

const dir = './fa_changeset';

const updateArgs = (operation, data, file) => {
  if (!fs.existsSync(`${dir}/${file}`)) {
    return;
  }
  const fileData = fs.readFileSync(`${dir}/${file}`);
  const savedData = JSON.parse(fileData);
  delete savedData.args.widgets;
  data.args = { ...data.args, ...savedData.args };
};

const createRecord = (model, operation, option, isDelete = false) => {
  insert(model, {
    ...option,
    operation,
    isDelete,
    isSystem: false,
    isExported: false,
    isUpdate: false,
  });
};
const updateRecord = (data, file, model, operation, option, isDelete = false, isToggle = false) => {
  console.log(findAll(model), option);
  let instance = findOne(model, {
    ...option,
    isDelete: false,
    isSystem: false,
    isUpdate: false,
  });
  if (!instance || !instance.id) {
    insert(model, {
      ...option,
      operation,
      file,
      isDelete,
      isToggle,
      isSystem: true,
      isUpdate: true,
      isExported: false,
    });
    console.log(errorMessages.notFoundEror);
    return {
      ...data,
    };
  }
  const tansport = {
    id: instance.id,
    field: !isToggle || !modelsForEntityValueId.includes(model) ? 'id' : 'entity_value_id',
    model,
  };
  !isToggle && !isDelete && updateArgs(data, instance.file);
  insert(model, {
    ...option,
    operation,
    file,
    isDelete,
    isToggle,
    isSystem: false,
    isExported: false,
    isUpdate: true,
  });
  return {
    args: { ...data },
    transports: [tansport],
  };
};

const getSavedData = async (instance) => {
  if (!instance) {
    return null;
  }

  const file = instance.file;
  if (!fs.existsSync(`${dir}/${file}`)) {
    return null;
  }
  const fileData = await fs.readFileSync(`${dir}/${file}`);
  return {
    ...JSON.parse(fileData),
  };
};

const saveDataToFile = async (data, file) => {
  const jsonData = JSON.stringify(data, null, 4);
  const filePath = `${dir}/${file}`;
  await fs.writeFileSync(`${filePath}`, jsonData);
};

const createDefaultField = (id, app) => {
  [v4(), v4()].map((newId) =>
    insert('app_action', {
      id: newId,
      app,
      fa_entity_id: id,
      isDelete: false,
      isSystem: false,
      isExported: false,
      isUpdate: false,
    })
  );

  [v4(), v4()].map((newId) =>
    insert('fa_related_list', {
      id: newId,
      app,
      fa_entity_id: id,
      isDelete: false,
      isSystem: false,
      isExported: false,
      isUpdate: false,
    })
  );

  defaultFields.map((name) => {
    const option = {
      id: v4(),
      fa_entity_id: id,
      name,
      app,
      isDelete: false,
      isSystem: false,
      isExported: false,
      isUpdate: false,
    };
    insert('fa_field_config', option);
  });
};

module.exports = {
  createRecord,
  updateRecord,
  getSavedData,
  saveDataToFile,
  createDefaultField,
};
