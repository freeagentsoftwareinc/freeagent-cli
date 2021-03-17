#!/usr/bin/env node

const { program } = require('commander');
const payloads = require('../utils/payloads');
const { handleOperation, exportChangeset } = require('./operations');
const { resetDb } = require('./db');
const { reMapTransports } = require('./transportGenerator');

program
    .version('0.1')
    // .option('-i, --interactive', 'run in interactive mode')
    .option('-e, --editmode', 'run in vi edit mode')
    .description('freeagent changeset generator system');

program
    .command('init <name> [description]')
    .description('initialize the changeset folder')
    .action((name, description, option) => {
        const args = { name, description: description || '' }
        handleOperation(option._name, args, program.editmode, program.interactive)
    });

program
    .command('add-app <name> <pluralName>')
    .description('create new app')
    .action((name, pluralName, option) => {
        /*
           option._name : command name 
           program.editmode : -e option
           program.interactive: -i option
        */
       const args = { label: name, label_plural: pluralName  }
        handleOperation(option._name, args, program.editmode, program.interactive)
    });

program
    .command('update-app <label>')
    .description('update the app')
    .action((label, option) => {
        /*
           option._name : command name 
           program.editmode : -e option
           program.interactive: -i option
        */
       const args = { label: label }
        handleOperation(option._name, args, program.editmode, program.interactive)
    });

program
    .command('activate-app <name>')
    .description('activate the app')
    .action((name, option) => {
        handleOperation(option._name, { name }, program.editmode, program.interactive)
    });

program
    .command('deactivate-app <name>')
    .description('deactivate the app')
    .action((name, option) => {
        handleOperation(option._name, { name }, program.editmode, program.interactive)
    });

program
    .command('reorder-app')
    .description('reorder apps')
    .action((option) => {
        const args =  { entity: 'fa_entity_config', field_name: 'fa_entity.is_primary', field_value: true }
        handleOperation(option._name, args, program.editmode, program.interactive)
    });

program
    .command('add-line <targetApp> <name> <pluralName>')
    .description('create new line to the target app')
    .action((targetApp, name, pluralName, option) => {
       const args = { label: name, label_plural: pluralName, parent_id: targetApp }
        handleOperation(option._name, args, program.editmode, program.interactive)
    });

    program
    .command('activate-line <targetApp> <name> >')
    .description('activate the line')
    .action((targetApp, name, option) => {
        const args = { label: name, parent_id: targetApp }
        handleOperation(option._name, args, program.editmode, program.interactive)
     });

program
    .command('deactivate-line <targetApp> <name> >')
    .description('deactivate the line')
    .action((targetApp, name, option) => {
        const args = { label: name, parent_id: targetApp }
        handleOperation(option._name, args, program.editmode, program.interactive)
     });

program
    .command('add-field <targetApp> <name>')
    .description('create new field')
    .action((targetApp, name, option) => {
        const args = { parent_id: targetApp, name_label: name, entity: targetApp }
        handleOperation(option._name, args, program.editmode, program.interactive)
    });

program
    .command('update-field <targetApp> <name>')
    .description('update the field')
    .action((targetApp, name, option) => {
        const args = { name_label: name, entity: targetApp };
        handleOperation(option._name, args, program.editmode, program.interactive)
    });

program
    .command('delete-field <targetApp> <name>')
    .description('delete the field')
    .action((targetApp, name, option) => {
        const args = { name_label: name, entity: targetApp }
        handleOperation(option._name, args, program.editmode, program.interactive)
    });

program
    .command('activate-field <targetApp> <name>')
    .description('activate the field')
    .action((targetApp, name, option) => {
        const args = { name_label: name, entity: targetApp }
        handleOperation(option._name, args, program.editmode, program.interactive)
    });

program
    .command('deactivate-field <targetApp> <name>')
    .description('deactivate the field')
    .action((targetApp, name, option) => {
        const args = { name_label: name, entity: targetApp }
        handleOperation(option._name, args, program.editmode, program.interactive)
    });

program
    .command('add-stage <targetApp> <targetField> <name>')
    .description('add new satge to stage type field')
    .action((targetApp, targetField, name, option) => {
        const args = { ...payloads.addCatalog.args }
        args.catalog = { ...args.catalog, ...{ entityName: targetApp, custom_field_id: targetField, name }}
        handleOperation(option._name, args, program.editmode, program.interactive)
    });

program
    .command('reorder-field <targetApp>')
    .description('reorder fields')
    .action((targetApp, option) => {
        const args =  { entity: 'fa_field_config', entityName: targetApp, field_name: 'entityName', field_value: targetApp }
        handleOperation(option._name, args, program.editmode, program.interactive)
    });


program
    .command('add-role <name>')
    .description('create new role')
    .action((name, option) => {
        const args = { ...payloads.addRole.args }
        args.field_values = { ...args.field_values, ...{ name: name || ''} };
        handleOperation(option._name, args, program.editmode, program.interactive)
    });

program
    .command('update-role <name>')
    .description('update the role')
    .action((name, option) => {
        const args = { ...payloads.addRole.args }
        args.field_values = { ...args.field_values, ...{ name: name || ''} };
        handleOperation(option._name, args, program.editmode, program.interactive)
    });

program
    .command('deactivate-role <name>')
    .description('deactivate the role')
    .action((name, option) => {
        handleOperation(option._name, { name }, program.editmode, program.interactive)
    });

program
    .command('activate-role <name>')
    .description('activate the role')
    .action((name, option) => {
        handleOperation(option._name, { name }, program.editmode, program.interactive)
    });

program
    .command('add-section <targetApp> <name>')
    .description('add new section')
    .action((targetApp, name, option) => {
        const args = { ...payloads.addSection.args }
        args.field_values = { ...args.field_values, ...{ title: name, entityName: targetApp } }
        handleOperation(option._name, args, program.editmode, program.interactive)
    });

program
    .command('update-section <targetApp> <name>')
    .description('update the section')
    .action((targetApp, name, option) => {
        const args = { ...payloads.addSection.args }
        args.field_values = { ...args.field_values, ...{ title: name, entityName: targetApp} }
        handleOperation(option._name, args, program.editmode, program.interactive)
    });

program
    .command('reorder-section <targetApp>')
    .description('reorder sections')
    .action((targetApp, option) => {
        handleOperation(option._name, { entity: 'layout',  entityName: targetApp }, program.editmode, program.interactive)
    });
  
program
    .command('activate-section  <targetApp> <name>')
    .description('activate the section')
    .action((targetApp, name, option) => {
        handleOperation(option._name, { targetApp, name }, program.editmode, program.interactive)
    });
   
   
program
    .command('deactivate-section  <targetApp> <name>')
    .description('deactivate the section')
    .action((targetApp, name, option) => {
        handleOperation(option._name, { targetApp, name }, program.editmode, program.interactive)
    });

program
    .command('add-action <targetApp> <name>')
    .description('add new app action')
    .action((targetApp, name, option) => {
        const args = { ...payloads.addAction.args }
        args.field_values = { ...args.field_values, ...{ name, entityName: targetApp }}
        handleOperation(option._name, args, program.editmode, program.interactive)
    });

program
    .command('update-action <targetApp> <name>')
    .description('update the app action')
    .action((targetApp, name, option) => {
        const args = { ...payloads.addAction.args }
        args.field_values = { ...args.field_values, ...{name, entityName: targetApp} }
        handleOperation(option._name, args, program.editmode, program.interactive)
    });

program
    .command('reorder-action <targetApp>')
    .description('reorder app actions')
    .action((targetApp, option) => {
        handleOperation(option._name, { entity: 'app_action',  entityName: targetApp }, program.editmode, program.interactive)
    });

program
    .command('activate-action <targetApp> <name>')
    .description('activate the app action')
    .action((targetApp, name, option) => {
        handleOperation(option._name, { targetApp, name }, program.editmode, program.interactive)
    });
   
   
program
    .command('deactivate-action <targetApp> <name>')
    .description('deactivate the app action')
    .action((targetApp, name, option) => {
        handleOperation(option._name, { targetApp, name }, program.editmode, program.interactive)
    });

program
    .command('add-acl <targetApp> <targetField>')
    .description('add new ACL')
    .action((targetApp, targetField, option) => {
        const args = { ...payloads.addAcl.args }
        args.field_values = { ...args.field_values, ...{ entityName: targetApp, fa_field_id: targetField }}
        handleOperation(option._name, args, program.editmode, program.interactive)
    });

program
    .command('update-acl <targetApp> <targetField>')
    .description('update the ACL')
    .action((targetApp, targetField, option) => {
        const args = { ...payloads.addAcl.args }
        args.field_values = { ...args.field_values, ...{ entityName: targetApp, fa_field_id: targetField }}
        handleOperation(option._name, args, program.editmode, program.interactive)
    });

program
    .command('activate-acl  <targetApp> <targetField>')
    .description('activate the ACL')
    .action((targetApp, targetField, option) => {
        handleOperation(option._name, { targetApp, targetField }, program.editmode, program.interactive)
    });
   
   
program
    .command('deactivate-acl  <targetApp> <targetField>')
    .description('deactivate the ACL')
    .action((targetApp, targetField, option) => {
        handleOperation(option._name, { targetApp, targetField }, program.editmode, program.interactive)
    });

program
    .command('add-choicelist <name>')
    .description('add new choice list')
    .action((name, option) => {
        const args = { ...payloads.addChoiceList.args }
        args.parent_fields = {...args.parent_fields, name}
        handleOperation(option._name, args, program.editmode, program.interactive)
    });

program
    .command('update-choicelist <name>')
    .description('update the choice list')
    .action((name, option) => {
        const args = { ...payloads.addChoiceList.args }
        args.parent_fields = {...args.parent_fields, name}
        handleOperation(option._name, args, program.editmode, program.interactive)
    });

program
    .command('activate-choicelist <name>')
    .description('activate the choicelist')
    .action((name, option) => {
        handleOperation(option._name, { name }, program.editmode, program.interactive)
    });
   
   
program
    .command('deactivate-choicelist <name>')
    .description('deactivate the choicelist')
    .action((name, option) => {
        handleOperation(option._name, { name}, program.editmode, program.interactive)
    });

program
    .command('add-automation <name>')
    .description('add new automation')
    .action((name, option) => {
        const args = { ...payloads.addAutomation.args }
        args.parent_fields = {...args.parent_fields, name}
        handleOperation(option._name, args, program.editmode, program.interactive)
    });

program
    .command('update-automation <name>')
    .description('update the automation')
    .action((name, option) => {
        const args = { ...payloads.addAutomation.args }
        args.parent_fields = {...args.parent_fields, name}
        handleOperation(option._name, args, program.editmode, program.interactive)
    });

program
    .command('activate-automation <name>')
    .description('activate the automation')
    .action((name, option) => {
        handleOperation(option._name, { name }, program.editmode, program.interactive)
    });
   
program
    .command('deactivate-automation <name>')
    .description('deactivate the automation')
    .action((name, option) => {
        handleOperation(option._name, { name}, program.editmode, program.interactive)
    });

program
    .command('add-formrule <targetApp> <description>')
    .description('add new form rule')
    .action((targetApp, description, option) => {
        const args = { ...payloads.addFormRule.args }
        args.parent_fields = {...args.parent_fields, description, entityName: targetApp}
        handleOperation(option._name, args, program.editmode, program.interactive)
    });

program
    .command('update-formrule <targetApp> <description>')
    .description('update the form rule')
    .action((targetApp, description, option) => {
        const args = { ...payloads.addFormRule.args }
        args.parent_fields = {...args.parent_fields, description, entityName: targetApp}
        handleOperation(option._name, args, program.editmode, program.interactive)
    });

program
    .command('activate-formrule <targetApp> <description>')
    .description('activate the automation')
    .action((targetApp, description, option) => {
        handleOperation(option._name, { entityName: targetApp, description }, program.editmode, program.interactive)
    });
   
program
    .command('deactivate-formrule <targetApp> <description>')
    .description('deactivate the automation')
    .action((targetApp, description, option) => {
        handleOperation(option._name, { entityName: targetApp, description }, program.editmode, program.interactive)
    });

program
    .command('reorder-formrule <targetApp>')
    .description('reorder form rules')
    .action((targetApp, option) => {
        const args =  { entity: 'form_rule', entityName: targetApp, field: "order" }
        handleOperation(option._name, args, program.editmode, program.interactive)
    });

program
    .command('reorder-lines <targetApp>')
    .description('reorder lines')
    .action((targetApp, option) => {
        const args =  { entity: 'fa_entity_config', entityName: targetApp, field_name: 'fa_entity.is_primary', field_value: true }
        handleOperation(option._name, args, program.editmode, program.interactive)
    });

program
    .command('add-view <targetApp> <name>')
    .description('add the new view')
    .action((targetApp, name, option) => {
        const args = { ...payloads.addView.args, name, entity: targetApp };
        handleOperation(option._name, args, program.editmode, program.interactive)
    });

program
    .command('update-view <targetApp> <name>')
    .description('update the view')
    .action((targetApp, name, option) => {
        const args = { ...payloads.addView.args, name, entity: targetApp };
        handleOperation(option._name, args, program.editmode, program.interactive)
    });

program
    .command('add-dashboard <name>')
    .description('add the new dashboard')
    .action((name, option) => {
        handleOperation(option._name, { title: name }, program.editmode, program.interactive)
    });

program
    .command('update-dashboard <name>')
    .description('udpate the dashboard')
    .action((name, option) => {
        handleOperation(option._name, { title: name }, program.editmode, program.interactive)
    });

// program
//     .command('reorder-relatedlist <targetApp>')
//     .description('reorder related lists')
//     .action((targetApp, option) => {
//         const args =  { entity: 'fa_related_list', entityName: targetApp, field_name: 'entityName', field_value: targetApp }
//         handleOperation(option._name, args, program.editmode, program.interactive)
//     });

program
    .command('update-cardconfig <targetApp>')
    .description('update the card configuration')
    .action((targetApp, option) => {
        handleOperation(option._name, { entity: targetApp }, program.editmode, program.interactive)
    });

program
    .command('export')
    .description('complete and zip the created changeset')
    .action(() => {
        return exportChangeset();
    });

program
    .command('reset-db')
    .description('reset local CLI db')
    .action(() => {
        return resetDb();
    });

program.parse(process.argv);

exports.reMapTransports = reMapTransports;
