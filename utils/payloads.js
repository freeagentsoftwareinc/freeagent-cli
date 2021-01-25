const uuid  = require('node-uuid');

/*  define all the opration paylod
    key: operantion i.e addCustomfield, addEnity etc
    value: arguments
*/
const payloads = {
    addChangeset:  {
        args: {
            name: '',
            description: '',
            created_at: new Date().toISOString()
        },
        transports:[{
            id: uuid.v4(),
            field: 'transport_id',
            model: 'changeset'
        }]
    },
    addEntity: {
        args: {
            icon: '',
            label: '',
            roles: [],
            is_applet: null,
            parent_id: null,
            label_plural: '',
            info_segment_wide: '1 column',
            enforce_individual_access: true,
            fields_configuration_attachment_id: null,
        },
        transports:[{
            id: uuid.v4(),
            field: 'transport_id',
            model: 'fa_entity_config'
        },
        {
            field_config_order_transport_id_map: {
               1: uuid.v4(),
               2: uuid.v4(),
               3: uuid.v4(),
               4: uuid.v4(),
               5: uuid.v4(),
               6: uuid.v4(),
               7: uuid.v4(),
               8: uuid.v4(),
               9: uuid.v4(),
               10: uuid.v4(),
            }
         }]
    },
    addCustomField: {
        args:{
            entity: '',
            data_type: '',
            help_text: null,
            is_unique: null,
            layout_id: null,
            date_field: null,
            hint_label: null,
            name_label: '',
            guess_field: null,
            is_required: null,
            is_immutable: null,
            track_status: null,
            all_day_field: null,
            default_value: null,
            icon_for_true: null,
            is_calculated: null,
            sub_data_type: null,
            color_for_true: null,
            end_date_field: null,
            icon_for_false: null,
            label_for_true: 'Yes',
            resource_field: null,
            catalog_type_id: null,
            color_for_false: null,
            label_for_false: 'No',
            new_field_order: null,
            parent_field_id: null,
            start_date_field: null,
            related_list_name: '',
            advanced_formatter: null,
            parent_fa_field_id: null,
            calculated_function: null,
            fa_entity_config_id: null,
            reference_qualifier: null,
            reference_fa_field_id: null,
            parent_custom_field_id: null,
            reference_fa_entity_id: null,
            related_list_name_plural: '',
            reference_custom_field_id: null,
            reference_qualifier_value: null,
            fa_related_field_config_id: null,
        },
        transports:[{
            id: uuid.v4(),
            field: 'transport_id',
            model: 'fa_field_config'
        }]
    },
    addRole: {
        args:{
            entity: 'fa_role',
            field_values: {
                name: '',
                description: '',
                fa_role_field_users: [],
                bulk_delete: true,
                bulk_edit: true,
                export: true,
                import: true,
                is_qualifier: true,
                task_delete: true,
                unassigned: true,
            }
        },
        transports:[{
            id: uuid.v4(),
            field: 'transport_id',
            model: 'fa_role'
        }]
    },
    updateRole: {
        args:{
            entity: 'fa_role',
            id: '',
            field_values: {
                name: 'newRole4',
                description: '',
                fa_role_field_users: [],
                bulk_delete: true,
                bulk_edit: true,
                export: true,
                import: true,
                is_qualifier: true,
                task_delete: true,
                unassigned: true,
            }
        },
        transports:[{
            id: '',
            field: 'id',
            model: 'fa_role'
        }]
    },
    deactivateRole: {
        args:{
            entity: 'fa_role',
            entity_value_id: '',
            custom_fields: [['deleted', 'true']]
        },
        transports:[{
            id: '',
            field: 'entity_value_id',
            model: 'fa_role'
        }]
    },
    activateRole: {
        args:{
            entity: 'fa_role',
            entity_value_id: '',
            custom_fields: [['deleted', 'false']]
        },
        transports:[{
            id: '',
            field: 'entity_value_id',
            model: 'fa_role'
        }]
    },
    addSection: {
        args:{
            entity: 'layout',
            field_values: {
                title: '',
                fa_entity_id: '',
            }
        },
        transports:[{
            id: uuid.v4(),
            field: 'transport_id',
            model: 'layout'
        },
        {
            id: '',
            field: 'field_values.fa_entity_id',
            model: 'fa_entity_config'
        }]
    },
    updateSection: {
        args:{
            id: '',
            entity: 'layout',
            field_values: {
                title: '',
                is_visible: true,
                fa_entity_id: '',
            }
        },
        transports:[{
            id: '',
            field: 'id',
            model: 'layout'
        },
        {
            id: '',
            field: 'field_values.fa_entity_id',
            model: 'fa_entity_config'
        }]
    },
    activateSection: {
        args:{
            entity_value_id: '',
            entity: 'layout',
            custom_fields: [['deleted', 'false'], ['is_visible', 'true']]
        },
        transports:[{
            id: '',
            field: 'entity_value_id',
            model: 'layout'
        }]
    },
    deactivateSection: {
        args:{
            entity: 'layout',
            entity_value_id: '',
            custom_fields: [['deleted', 'false'], ['is_visible', 'false']]
        },
        transports:[{
            id: '',
            field: 'entity_value_id',
            model: 'layout'
        }]
    },
    addAction: {
        args:{
            entity: 'app_action',   
            field_values: {
                name: '',
                description: '',
                icon: null,
                appearance_id: null,
                roles: [],
                placement: [],
                type:'',
                custom_code: null,
                rule_set_id: null,
                fa_entity_id: '',
            }
        },
        transports:[{
            id: uuid.v4(),
            field: 'transport_id',
            model: 'app_action'
        },
        {
            id: '',
            field: 'field_values.fa_entity_id',
            model: 'fa_entity_config'
        },
        {
            id: '',
            field: 'field_values.rule_set_id',
            model: 'rule_set'
        }]
    },
    updateAction: {
        args:{
            id: '',
            entity: 'app_action',   
            field_values: {
                name: '',
                description: '',
                icon: null,
                appearance_id: null,
                roles: [],
                placement: [],
                type:'',
                custom_code: null,
                rule_set_id: null,
                fa_entity_id: '',
            }
        },
        transports:[{
            id: '',
            field: 'id',
            model: 'app_action'
        },
        {
            id: '',
            field: 'field_values.fa_entity_id',
            model: 'rule_set'
        },
        {
            id: '',
            field: 'field_values.rule_set_id',
            model: 'rule_set'
        }]
    },
    activateAction: {
        args:{
            entity_value_id: '',
            entity: 'app_action',   
            custom_fields: [['is_visible', 'true']],
        },
        transports:[{
            id: '',
            field: 'entity_value_id',
            model: 'app_action'
        }]
    },
    deactivateAction: {
        args:{
            entity_value_id: '',
            entity: 'app_action',   
            custom_fields: [['is_visible', 'false']]
        },
        transports:[{
            id: '',
            field: 'entity_value_id',
            model: 'app_action'
        }]
    },
    addAcl: {
        args:{
            entity: 'fa_acl',   
            field_values: {
                operation: null,
                target_entity_id: '',
                fa_field_id: '',
                fa_acl_field_roles: [],
                active: true,
                resource_type: 'field',
                type: 'grant',
            }
        },
        transports:[{
            id: uuid.v4(),
            field: 'transport_id',
            model: 'app_action'
        },
        {
            id: '',
            field: 'field_values.target_entity_id',
            model: 'fa_entities'
        },
        {
            id: '',
            field: 'field_values.fa_field_id',
            model: 'fa_field_config'
        },
        {
            id: '',
            field: 'field_values.fa_acl_field_roles',
            model: 'fa_role'
        }]
    },
    updateAcl: {
        args:{
            id: '',
            entity: 'fa_acl',   
            field_values: {
                fa_field_id: '',
                fa_acl_field_roles: [],
                operation: null,
                active: true,
            }
        },
        transports:[{
            id: '',
            field: 'id',
            model: 'fa_acl'
        },
        {
            id: '',
            field: 'field_values.fa_field_id',
            model: 'fa_field_config'
        },
        {
            id: '',
            field: 'field_values.fa_acl_field_roles',
            model: 'fa_role'
        }]
    },
    activateAcl: {
        args:{
            entity_value_id: '',
            entity: 'fa_acl',   
            custom_fields: [['deleted', 'false'], ['active', 'true']],
        },
        transports:[{
            id: '',
            field: 'entity_value_id',
            model: 'fa_acl'
        }]
    },
    deactivateAcl: {
        args:{
            entity_value_id: '',
            entity: 'fa_acl',   
            custom_fields: [['deleted', 'false'], ['active', 'false']]
        },
        transports:[{
            id: '',
            field: 'entity_value_id',
            model: 'fa_acl'
        }]
    },

    addChoiceList: {
        args: {
            instance_id: null,
            parent_entity_id: '10913ac7-852e-516e-a2d7-3c24c34600d4',
            parent_fields: [
                ['name', Math.random().toString()],
                ['order_type', 'b672222d-f782-48d9-99bf-71608605d8de'],
                ['allow_choice_creation', 'true'],
            ],
            children: [{
                entity_id: '6fc34d02-c890-5661-a157-565d99a4fe37',
                custom_fields: [
                    ['name', 'bro'],
                    ['icon', null],
                    ['color', null],
                    ['order', null]
                ]
            },
            {
                entity_id: '6fc34d02-c890-5661-a157-565d99a4fe37',
                custom_fields: [
                    ['name', 'done'],
                    ['icon', null],
                    ['color', null],
                    ['order', null]
                ]
            }],
        },
        transports:[
        {
            id: uuid.v4(),
            field: 'transport_id',
            model: 'catalog_type'
        },
        {
            id: [uuid.v4(), uuid.v4()],
            field: 'transport_id',
            model: 'catalog'
        }]
    },

    updateChoiceList: {
        args: {
            instance_id: null,
            parent_entity_id: '10913ac7-852e-516e-a2d7-3c24c34600d4',
            parent_fields: [
                ['id', ''],
                ['name', 'import testing'],
                ['order_type', 'b672222d-f782-48d9-99bf-71608605d8de'],
                ['allow_choice_creation', 'true'],
            ],
            children: [{
                entity_id: '6fc34d02-c890-5661-a157-565d99a4fe37',
                custom_fields: [
                    ['id', '']
                    ['name', 'bro'],
                    ['icon', "null"],
                    ['color', "null"],
                    ['order', "null"]
                ]
            }],
        },
        transports:[
        {
            id: '1f9a375b-fa81-4158-8b9a-add0889d4bec',
            field: 'instance_id',
            model: 'catalog_type'
        },
        {
            id: '',
            field: 'children[0].custom_fields[0][1]',
            model: 'catalog'
        }]
    },

    addAutomation: {
        args: {
            instance_id: null,
            parent_entity_id: "cf7de345-a40b-56cb-b70a-7fb707a5b4b0",
            parent_fields: [
                ["name", Math.random().toString()],
                ["fa_entity_id", "ac12096d-027b-57f5-b389-93c1920222a3"],
                ["trigger", "9d02d813-fd95-48ba-8c78-2608a1c9f9a5"],
                [{"field_name":"task_type","values":["2bd5151a-9db3-49c4-ad1a-7b482bd3acae"],"operator":"includes"}]    
            ],
            children: [{
                entity_id: "37a890a4-01c4-56a7-8be0-6466b65db0dd",
                custom_fields: [
                    ['description', 'automation'],
                    ['type', 'custom_code'],
                    ['custom_code', "(function(contact, context){↵  // You can define operations here↵  // Example:↵  // var a = 1, b = contact.myField;↵  // var c = a + b;↵  //↵  // Use 'CTRL + space' to display a list↵  // of fields and select one for your operation↵  //↵  // Return something for your function↵  // Example:↵  // return c;↵  return 0;↵}(contact, context));"],
                    ['delay', null],
                    ['working_calendar', 'false'],
                    ['due_date_field', 'false']
                ]
            }],
        },
        transports:[
        {
            id: uuid.v4(),
            field: 'transport_id',
            model: 'rule_set'
        },
        {
            id: [uuid.v4()],
            field: 'transport_id',
            model: 'rule_action'
        }]
        
    },

    updateAutomation: {
        args: {
            instance_id: null,
            parent_entity_id: "cf7de345-a40b-56cb-b70a-7fb707a5b4b0",
            parent_fields: [
                ['name', Math.random().toString()],
                ["fa_entity_id", "ac12096d-027b-57f5-b389-93c1920222a3"],
                ["trigger", "9d02d813-fd95-48ba-8c78-2608a1c9f9a5"],
                ["filter_conditions", [{"field_name":"full_name","values":["martin"],"operator":"contains"}]]    
            ],
            children: [{
                entity_id: "37a890a4-01c4-56a7-8be0-6466b65db0dd",
                custom_fields: [
                    ['description', 'automation'],
                    ['type', 'custom_code'],
                    ['custom_code', "(function(contact, context){↵  // You can define operations here↵  // Example:↵  // var a = 1, b = contact.myField;↵  // var c = a + b;↵  //↵  // Use 'CTRL + space' to display a list↵  // of fields and select one for your operation↵  //↵  // Return something for your function↵  // Example:↵  // return c;↵  return 0;↵}(contact, context));"],
                    ['delay', null],
                    ['working_calendar', 'false'],
                    ['due_date_field', 'false']
                ]
            }],
        },
        transports:[
        {
            id: uuid.v4(),
            field: 'transport_id',
            model: 'rule_set'
        },
        {
            id: [uuid.v4()],
            field: 'transport_id',
            model: 'rule_action'
        }]
        
    },

    addFormRule: {
        args: {
            instance_id: null,
            parent_entity_id: "2c05c9fa-568e-49e2-b435-b84f79fe1d32",
            parent_fields: [
                ["fa_entity_id", "ac12096d-027b-57f5-b389-93c1920222a3"],
                ["description", "testin rule"],
                ["roles", "12"],
                ["conditions", [{"field_name":"full_name","values":["martin"],"operator":"contains"}]]   
            ],
            children: [{
                entity_id: "101328d1-3b44-4f19-a19e-9a645776761b",
                custom_fields: [
                    ["field_name", null],
                    ["section_name", null],
                    ["type", "1eb3aa53-4247-412c-a241-2e65acdef107"],
                    ["app_action_id", "213c1c8b-ffc1-4719-a8a7-4c0fc532de9c"],
                    ["operation", "2630fba4-3da4-44a3-b05e-eb74fe6acee0"],
                    ["value", "a6e198ae-c959-431c-bb0d-4dfedea022ae"]
                ]
            }],
        },
        transports:[
        {
            id: uuid.v4(),
            field: 'transport_id',
            model: 'form_rule'
        },
        {
            id: [uuid.v4()],
            field: 'transport_id',
            model: 'form_action'
        }]
    },

    updateFormRule: {
        args: {
            instance_id: null,
            parent_entity_id: "2c05c9fa-568e-49e2-b435-b84f79fe1d32",
            parent_fields: [
                ["fa_entity_id", "ac12096d-027b-57f5-b389-93c1920222a3"],
                ["description", "testin rule"],
                ["roles", "12"],
                ["conditions", [{"field_name":"full_name","values":["martin"],"operator":"contains"}]]    
            ],
            children: [{
                entity_id: "101328d1-3b44-4f19-a19e-9a645776761b",
                custom_fields: [
                    ["field_name", null],
                    ["section_name", null],
                    ["type", "1eb3aa53-4247-412c-a241-2e65acdef107"],
                    ["app_action_id", "213c1c8b-ffc1-4719-a8a7-4c0fc532de9c"],
                    ["operation", "2630fba4-3da4-44a3-b05e-eb74fe6acee0"],
                    ["value", "a6e198ae-c959-431c-bb0d-4dfedea022ae"]
                ]
            }],
        },
        transports:[
        {
            id: '',
            field: 'instance_id',
            model: 'form_rule'
        },
        {
            id: '',
            field: 'children[0].custom_fields[0][1]',
            model: 'form_action'
        }]
    },
};

module.exports = payloads;
