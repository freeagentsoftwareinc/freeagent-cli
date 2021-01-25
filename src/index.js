#!/usr/bin/env node

const { program } = require('commander');
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
    .command('add-app [label]')
    .description('create new app')
    .action((label, option) => {
        /*
           option._name : command name 
           program.editmode : -e option
           program.interactive: -i option
        */
       const args = { label, label_plural: label }
        handleAction(option._name, args, program.editmode, program.interactive)
    });

program
    .command('add-field <targetApp> [name]')
    .description('Create New Field')
    .action((targetApp, name, option) => {
        const args = { name_label: name, entity: targetApp }
        handleAction(option._name, args, program.editmode, program.interactive)
    });

program
    .command('add-role [name]')
    .description('Create New Role')
    .action((name, option) => {
        const args = { ...payloads.addRole.args }
        args.field_values = { ...args.field_values, ...{ name: name || ''} };
        handleAction(option._name, args, program.editmode, program.interactive)
    });

program
    .command('update-role')
    .description('Update The Exisiting Role')
    .action((option) => {
        handleAction(option._name, {}, program.editmode, program.interactive)
    });

program
    .command('deactivate-role')
    .description('Deactivate The Role')
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
    .command('add-section <targetApp> [name]')
    .description('Add New Section')
    .action((targetApp, name, option) => {
        const args = { ...payloads.addSection.args }
        args.field_values = { ...args.field_values, title: name, entity: targetApp }
        handleAction(option._name, program.editmode, program.interactive)
    });

program
    .command('update-section <targetApp> [name]')
    .description('Update Exisiting Section')
    .action((targetApp, name, option) => {
        const args = { ...payloads.addSection.args }
        args.field_values = { ...args.field_values, title: name, entity: targetApp }
        handleAction(option._name, program.editmode, program.interactive)
    });
  
program
    .command('activate-section')
    .description('Activate Section')
    .action((option) => {
        handleAction(option._name, {}, program.editmode, program.interactive)
    });
   
   
program
    .command('deactivate-section')
    .description('Deactivate Section')
    .action((option) => {
        handleAction(option._name, {}, program.editmode, program.interactive)
    });
program
    .command('add-action <targetApp> [name]')
    .description('add new action')
    .action((targetApp, name, option) => {
        const args = { ...payloads.addAction.args }
        args.field_values = { ...args.field_values, name, entity: targetApp }
        handleAction(option._name, program.editmode, program.interactive)
    });

program
    .command('update-action <targetApp> [name]')
    .description('update new action')
    .action((targetApp, name, option) => {
        const args = { ...payloads.addAction.args }
        args.field_values = { ...args.field_values, name, entity: targetApp }
        handleAction(option._name, program.editmode, program.interactive)
    });

program
    .command('activate-action')
    .description('update Action')
    .action((option) => {
        handleAction(option._name, {}, program.editmode, program.interactive)
    });
   
   
program
    .command('deactivate-action')
    .description('update Action')
    .action((option) => {
        handleAction(option._name, {}, program.editmode, program.interactive)
    });

program
    .command('add-acl <targetApp>')
    .description('add new ACL')
    .action((targetApp, option) => {
        const args = { ...payloads.addAcl.args }
        args.field_values = { ...args.field_values, entity: targetApp }
        handleAction(option._name, program.editmode, program.interactive)
    });

program
    .command('update-acl <name>')
    .description('update the exisiting ACL')
    .action((targetApp, option) => {
        const args = { ...payloads.addAcl.args }
        args.field_values = { ...args.field_values, entity: targetApp }
        handleAction(option._name, program.editmode, program.interactive)
    });

program
    .command('activate-acl')
    .description('update ACL')
    .action((option) => {
        handleAction(option._name, {}, program.editmode, program.interactive)
    });
   
   
program
    .command('deactivate-acl')
    .description('update ACL')
    .action((option) => {
        handleAction(option._name, {}, program.editmode, program.interactive)
    });

program
    .command('add-choicelist')
    .description('add choice list')
    .action((option) => {
        handleAction(option._name, {}, program.editmode, program.interactive)
    });

program
    .command('udpate-choicelist')
    .description('udpate choice list')
    .action((option) => {
        handleAction(option._name, {}, program.editmode, program.interactive)
    });


program
    .command('add-automation')
    .description('add automation')
    .action((option) => {
        handleAction(option._name, {}, program.editmode, program.interactive)
    });

program
    .command('udpate-automation')
    .description('update automation')
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
