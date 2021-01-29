#!/usr/bin/env node

const { program } = require('commander');
const { array } = require('yargs');
const payloads = require('../utils/payloads');
const { handleAction, exportChangeset } = require('./actions');

program
    .version('0.1')
    .option('-i, --interactive', 'run in interactive mode')
    .option('-e, --editmode', 'run in vi edit mode')
    .description('freeagent changeset generator system');

program
    .command('init [name]')
    .description('initialize the changeset folder')
    .action((name, option) => {
        const args = { name }
        handleAction(option._name, args, program.editmode, program.interactive)
    });

program
    .command('add-app <name> [pluralName]')
    .description('create new app')
    .action((name, singularName, option) => {
        /*
           option._name : command name 
           program.editmode : -e option
           program.interactive: -i option
        */
       const args = { label: name, label_plural: pluralName || name }
        handleAction(option._name, args, program.editmode, program.interactive)
    });

program
    .command('update-app <label> [new_label]')
    .description('update the app')
    .action((label, new_label, option) => {
        /*
           option._name : command name 
           program.editmode : -e option
           program.interactive: -i option
        */
       const args = { label: label, new_label }
        handleAction(option._name, args, program.editmode, program.interactive)
    });

program
    .command('add-field <targetApp> [name]')
    .description('create new field')
    .action((targetApp, name, option) => {
        const args = { name_label: name, entity: targetApp }
        handleAction(option._name, args, program.editmode, program.interactive)
    });

program
    .command('update-field <targetApp> <name> [new_name]')
    .description('update the Field')
    .action((targetApp, name, new_name, option) => {
        const args = { name_label: name, entity: targetApp }
        handleAction(option._name, args, program.editmode, program.interactive)
    });

program
    .command('delete-field <targetApp> <name>')
    .description('delete the Field')
    .action((targetApp, name, option) => {
        const args = { name_label: name, entityName: targetApp }
        handleAction(option._name, args, program.editmode, program.interactive)
    });

program
    .command('add-role <name>')
    .description('create new Role')
    .action((name, option) => {
        const args = { ...payloads.addRole.args }
        args.field_values = { ...args.field_values, ...{ name: name || ''} };
        handleAction(option._name, args, program.editmode, program.interactive)
    });

program
    .command('update-role <name>')
    .description('update the Role')
    .action((name, option) => {
        const args = { ...payloads.addRole.args }
        args.field_values = { ...args.field_values, ...{ name: name || ''} };
        handleAction(option._name, args, program.editmode, program.interactive)
    });

program
    .command('deactivate-role <name>')
    .description('deactivate the Role')
    .action((name, option) => {
        handleAction(option._name, { name }, program.editmode, program.interactive)
    });

program
    .command('activate-role <name>')
    .description('activate the Role')
    .action((name, option) => {
        handleAction(option._name, { name }, program.editmode, program.interactive)
    });

program
    .command('add-section <targetApp> <name>')
    .description('add new section')
    .action((targetApp, name, option) => {
        const args = { ...payloads.addSection.args }
        args.field_values = { ...args.field_values, ...{ title: name, entityName: targetApp } }
        handleAction(option._name, args, program.editmode, program.interactive)
    });

program
    .command('update-section <targetApp> <name>')
    .description('upate the section')
    .action((targetApp, name, option) => {
        const args = { ...payloads.addSection.args }
        args.field_values = { ...args.field_values, ...{ title: name, entityName: targetApp} }
        handleAction(option._name, args, program.editmode, program.interactive)
    });
  
program
    .command('activate-section  <targetApp> <name>')
    .description('cctivate the section')
    .action((targetApp, name, option) => {
        handleAction(option._name, { targetApp, name }, program.editmode, program.interactive)
    });
   
   
program
    .command('deactivate-section  <targetApp> <name>')
    .description('deactivate the section')
    .action((targetApp, name, option) => {
        handleAction(option._name, { targetApp, name }, program.editmode, program.interactive)
    });

program
    .command('add-action <targetApp> <name>')
    .description('add new app action')
    .action((targetApp, name, option) => {
        const args = { ...payloads.addAction.args }
        args.field_values = { ...args.field_values, name, entityName: targetApp }
        handleAction(option._name, program.editmode, program.interactive)
    });

program
    .command('update-action <targetApp> [name]')
    .description('update the app action')
    .action((targetApp, name, option) => {
        const args = { ...payloads.addAction.args }
        args.field_values = { ...args.field_values, name, entityName: targetApp }
        handleAction(option._name, program.editmode, program.interactive)
    });

program
    .command('activate-action <targetApp> <name>')
    .description('activate the app action')
    .action((targetApp, name, option) => {
        handleAction(option._name, { targetApp, name }, program.editmode, program.interactive)
    });
   
   
program
    .command('deactivate-action <targetApp> <name>')
    .description('deactivate the app action')
    .action((targetApp, name, option) => {
        handleAction(option._name, { targetApp, name }, program.editmode, program.interactive)
    });

program
    .command('add-acl <targetApp> <tragetField>')
    .description('add new ACL')
    .action((targetApp, tragetField, option) => {
        const args = { ...payloads.addAcl.args }
        args.field_values = { ...args.field_values, ...{ entityName: targetApp, fa_field_id: tragetField }}
        handleAction(option._name, args, program.editmode, program.interactive)
    });

program
    .command('update-acl <targetApp> <tragetField>')
    .description('update the ACL')
    .action((targetApp, tragetField, option) => {
        const args = { ...payloads.addAcl.args }
        args.field_values = { ...args.field_values, ...{ entityName: targetApp, fa_field_id: tragetField }}
        handleAction(option._name, args, program.editmode, program.interactive)
    });

program
    .command('activate-acl  <targetApp> <tragetField>')
    .description('activate the ACL')
    .action((targetApp, tragetField, option) => {
        handleAction(option._name, { targetApp, tragetField }, program.editmode, program.interactive)
    });
   
   
program
    .command('deactivate-acl  <targetApp> <tragetField>')
    .description('deactivate the ACL')
    .action((targetApp, tragetField, option) => {
        handleAction(option._name, { targetApp, tragetField }, program.editmode, program.interactive)
    });

program
    .command('add-choicelist <name>')
    .description('add new choice list')
    .action((name, option) => {
        handleAction(option._name, { name }, program.editmode, program.interactive)
    });

program
    .command('udpate-choicelist')
    .description('udpate the choice list')
    .action((option) => {
        handleAction(option._name, {}, program.editmode, program.interactive)
    });


program
    .command('add-automation')
    .description('add new automation')
    .action((option) => {
        handleAction(option._name, {}, program.editmode, program.interactive)
    });

program
    .command('udpate-automation')
    .description('update the automation')
    .action((option) => {
        handleAction(option._name, {}, program.editmode, program.interactive)
    });

program
    .command('add-formrule')
    .description('add new form rule')
    .action((option) => {
        handleAction(option._name, {}, program.editmode, program.interactive)
    });

program
    .command('udpate-formrule')
    .description('update the form rule')
    .action((option) => {
        handleAction(option._name, {}, program.editmode, program.interactive)
    });


program
    .command('export')
    .description('zip the created changeset')
    .action(() => {
        return exportChangeset();
    });

program.parse(process.argv);
