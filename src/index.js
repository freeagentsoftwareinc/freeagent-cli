#!/usr/bin/env node

const { program } = require('commander');
const { handleAction_intialize, handleAction, exportChangeset } = require('./actions');

program
    .version('0.1')
    .option('-i, --intractive', 'run in inractive mode')
    .option('-e, --editmode', 'run in vi edit mode')
    .description('freeagent changeset generator system');

program
    .command('init')
    .description('intialize the changeset folder')
    .action(() => {
       handleAction_intialize(program.editmode, program.intractive)
    });

program
    .command('add-app')
    .description('create new app')
    .action((option) => {
        /*
           option._name : command name 
           program.editmode : -e option
           program.intractive: -i option
        */
        handleAction(option._name, program.editmode, program.intractive)
    });

program
    .command('add-field')
    .description('create new field')
    .action((option) => {
        handleAction(option._name, program.editmode, program.intractive)
    });

program
    .command('export')
    .description('zip the created changeset')
    .action(() => {
        return exportChangeset();
    });

program.parse(process.argv);