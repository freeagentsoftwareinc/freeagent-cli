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
    .command('add-app <label_plural> [label]')
    .description('create new app')
    .action((label_plural, label, option) => {
        /*
           option._name : command name 
           program.editmode : -e option
           program.interactive: -i option
        */
       const args = { label: label_plural || label, label_plural: label_plural }
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
        const args = { name_label: name, entityName: targetApp }
        handleAction(option._name, args, program.editmode, program.interactive)
    });

program
    .command('update-field <targetApp> <name> [new_name]')
    .description('update the Field')
    .action((targetApp, name, new_name, option) => {
        const args = { name_label: name, entityName: targetApp }
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
    .command('deactivate-role')
    .description('deactivate the Role')
    .action((option) => {
        handleAction(option._name, {}, program.editmode, program.interactive)
    });

program
    .command('activate-role')
    .description('Activate The Role')
    .action((option) => {
        handleAction(option._name, {}, program.editmode, program.interactive)
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
    .command('activate-section')
    .description('cctivate the section')
    .action((option) => {
        handleAction(option._name, {}, program.editmode, program.interactive)
    });
   
   
program
    .command('deactivate-section')
    .description('deactivate the section')
    .action((option) => {
        handleAction(option._name, {}, program.editmode, program.interactive)
    });
program
    .command('add-action <targetApp> [name]')
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
    .command('activate-action')
    .description('activate the app action')
    .action((option) => {
        handleAction(option._name, {}, program.editmode, program.interactive)
    });
   
   
program
    .command('deactivate-action')
    .description('deactivate the app action')
    .action((option) => {
        handleAction(option._name, {}, program.editmode, program.interactive)
    });

program
    .command('add-acl <targetApp> <type>')
    .description('add new ACL')
    .action((targetApp, type, option) => {
        const args = { ...payloads.addAcl.args }
        args.field_values = { ...args.field_values, ...{ entityName: targetApp, resource_type: type }}
        handleAction(option._name, args, program.editmode, program.interactive)
    });

program
    .command('update-acl <targetApp> <type>')
    .description('update the ACL')
    .action((targetApp, type, option) => {
        const args = { ...payloads.addAcl.args }
        args.field_values = { ...args.field_values, ...{ entityName: targetApp, resource_type: type }}
        handleAction(option._name, args, program.editmode, program.interactive)
    });

program
    .command('activate-acl')
    .description('activate the ACL')
    .action((option) => {
        handleAction(option._name, {}, program.editmode, program.interactive)
    });
   
   
program
    .command('deactivate-acl')
    .description('deactivate the ACL')
    .action((option) => {
        handleAction(option._name, {}, program.editmode, program.interactive)
    });

program
    .command('add-choicelist')
    .description('add new choice list')
    .action((option) => {
        handleAction(option._name, {}, program.editmode, program.interactive)
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
