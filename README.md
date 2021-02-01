# freeagent-cli

Run `npm install`

Run `npm link`

`opend new terminal window`

Run `freeagent-cli init` To initialize the changset

# Options
`-i  --interactive` To Run command in interactive Mode

`-e  --editmode` To Run command in edit Mode, to edit file in `vi editor`


# commands
  `init [name]`                                        initialize the changeset folder

  `add-app <name> [pluralName]`                      create new app
  
  `update-app <label>`                               update the app
  
  `add-field <targetApp> <name>`                     create new field
  
  `update-field <targetApp> <name>`                  update the Field
  
  `reorder-field <targetApp>`                        reorder fields
  
  `delete-field <targetApp> <name>`                  delete the Field
  
  `add-role <name>`                                  create new Role
  
  `update-role <name>`                               update the Role
  
  `deactivate-role <name>`                           deactivate the Role
  
  `activate-role <name>`                             activate the Role
  
  `add-section <targetApp> <name>`                   add new section
  
  `update-section <targetApp> <name>`                upate the section
  
  `reorder-section`                                  reorder sections
  
  `activate-section <targetApp> <name>`              cctivate the section
  
  `deactivate-section <targetApp> <name>`            deactivate the section
  
  `add-action <targetApp> <name>`                    add new app action
  
  `update-action <targetApp> <name>`                 update the app action
  
  `reorder-action`                                   reorder app actions
  
  `activate-action <targetApp> <name>`               activate the app action
  
  `deactivate-action <targetApp> <name>`             deactivate the app action
  
  `add-acl <targetApp> <tragetField>`                add new ACL
  
  `update-acl <targetApp> <tragetField>`             update the ACL
  
  `activate-acl <targetApp> <tragetField>`           activate the ACL
  
  `deactivate-acl <targetApp> <tragetField>`         deactivate the ACL
  
  `add-choicelist <name>`                            add new choice list
  
  `update-choicelist <name>`                         udpate the choice list
  
  `add-automation <name> <targetApp> [tragetField]`  add new automation
  
  `update-automation <name>`                         update the automation
  
  `add-formrule <name> <targetApp>`                  add new form rule
  
  `update-formrule <name>`                           update the form rule
  
  `reorder-formrule`                                 reorder form rules
  
  `reorder-lines`                                    reorder lines
  
  `reorder-relatedlist <targetApp>`                  reorder realted lists
  
  `update-cardconfig <targetApp>`                    update the card configuration
  
  `export`                                           zip the created changeset
