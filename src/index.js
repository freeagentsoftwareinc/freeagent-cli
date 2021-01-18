#!/usr/bin/env node

const { program } = require('commander');
const { handleAction, exportChangeset } = require('./actions');

program
    .version('0.1')
    .option('-i, --interactive', 'run in inractive mode')
    .option('-e, --editmode', 'run in vi edit mode')
    .description('freeagent changeset generator system');

program
    .command('init')
    .description('initialize the changeset folder')
    .action((option) => {
        handleAction(option._name, program.editmode, program.interactive)
    });

program
    .command('add-app')
    .description('create new app')
    .action((option) => {
        /*
           option._name : command name 
           program.editmode : -e option
           program.interactive: -i option
        */
        handleAction(option._name, program.editmode, program.interactive)
    });

program
    .command('add-field')
    .description('create new field')
    .action((option) => {
        handleAction(option._name, program.editmode, program.interactive)
    });

program
    .command('add-role')
    .description('create new role')
    .action((option) => {
        handleAction(option._name, program.editmode, program.interactive)
    });

program
    .command('export')
    .description('zip the created changeset')
    .action(() => {
        return exportChangeset();
    });

program.parse(process.argv);
