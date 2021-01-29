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
        transports:[
        {
            order_transport_id_map: {
                1: uuid.v4(),
                2: uuid.v4(),
                3: uuid.v4(),
                4: uuid.v4(),
                5: uuid.v4(),
                6: uuid.v4(),
                7: uuid.v4(),
                8: uuid.v4(),
                9: uuid.v4(),
                10: uuid.v4()
            },
            model: 'fa_field_config'
        },
        {
            order_transport_id_map: {
                1: uuid.v4(),
                2: uuid.v4()
            },
            model: 'app_action'
        },
        {
            order_transport_id_map: {
                1: uuid.v4(),
                2: uuid.v4()
            },
            model: 'fa_related_list'
        }]
    },

    updateApp: {
        args: {
            label: '',
            label_plural: '',
            is_visible: true,
            icon: '',
            roles: [],
            show_related_list: null,
            enforce_individual_access: true,
            info_segment_wide: '1 column',
            landscape_mode: null,
            template_file_url: '',
            title_field_name: 'seq_id',
            applet_config: {
                width: '',
                height: '',
                url: '',
                params:'',
                applet_id:'',
            },
            show_app_icon: null,
            show_seq_id: null,
            primary_action: null,
            enable_quick_add: false,    
            quick_add_custom_code: '',
            quick_add_hint: null,
            description: '',
            default_sorts: [],
            color: ''
        },
        transports: []
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
            reference_entity_name: null,
            reference_fa_entity_id: null,
            related_list_name_plural: '',
            reference_custom_field_id: null,
            reference_qualifier_value: null,
            fa_related_field_config_id: null,
        },
        transports:[]
    },

    deleteField: {
        args: {
            id: ''
        },
        transports: []
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
        transports:[]
    },

    deactivateRole: {
        args:{
            entity: 'fa_role',
            entity_value_id: '',
            custom_fields: [['deleted', 'true']]
        },
        transports:[]
    },
    activateRole: {
        args:{
            entity: 'fa_role',
            entity_value_id: '',
            custom_fields: [['deleted', 'false']]
        },
        transports:[]
    },

    addSection: {
        args:{
            entity: 'layout',
            field_values: {
                title: '',
                fa_entity_id: '',
                entityName: '',
            }
        },
        transports:[]
    },

    activateSection: {
        args:{
            entity_value_id: '',
            entity: 'layout',
            custom_fields: [['deleted', 'false'], ['is_visible', 'true']]
        },
        transports:[]
    },

    deactivateSection: {
        args:{
            entity: 'layout',
            entity_value_id: '',
            custom_fields: [['deleted', 'false'], ['is_visible', 'false']]
        },
        transports:[]
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
                entityName: '',
            }
        },
        transports:[
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
        transports:[]
    },

    deactivateAction: {
        args:{
            entity_value_id: '',
            entity: 'app_action',   
            custom_fields: [['is_visible', 'false']]
        },
        transports:[]
    },

    addAcl: {
        args:{
            entity: 'fa_acl',   
            field_values: {
                operation: null,
                acl_type: '',
                target_entity_id: '',
                fa_field_id: '',
                fa_acl_field_roles: [],
                active: true,
                resource_type: '',
                type: 'grant',
                entityName: '',
            }
        },
        transports:[]
    },

    activateAcl: {
        args:{
            entity_value_id: '',
            entity: 'fa_acl',   
            custom_fields: [['deleted', 'false'], ['active', 'true']],
        },
        transports:[]
    },
    deactivateAcl: {
        args:{
            entity_value_id: '',
            entity: 'fa_acl',   
            custom_fields: [['deleted', 'false'], ['active', 'false']]
        },
        transports:[]
    },

    addChoiceList: {
        args: {
            instance_id: null,
            parent_entity_id: '10913ac7-852e-516e-a2d7-3c24c34600d4',
            parent_fields: [
                ['order_type', ''],
                ['allow_choice_creation', 'true'],
            ],
            children: [{
                entity_id: '6fc34d02-c890-5661-a157-565d99a4fe37',
                custom_fields: [
                    ['name', ''],
                    ['icon', null],
                    ['color', null],
                    ['order', null]
                ]
            }],
        },
        transports:[]
    },

    updateChoiceList: {
        args: {
            instance_id: null,
            parent_entity_id: '10913ac7-852e-516e-a2d7-3c24c34600d4',
            parent_fields: [
                ['id', ''],
                ['name', ''],
                ['order_type', ''],
                ['allow_choice_creation', 'true'],
            ],
            children: [{
                entity_id: '6fc34d02-c890-5661-a157-565d99a4fe37',
                custom_fields: [
                    ['id', '']
                    ['name', ''],
                    ['icon', 'null'],
                    ['color', 'null'],
                    ['order', 'null']
                ]
            }],
        },
        transports:[]
    },

    addAutomation: {
        args: {
            instance_id: null,
            parent_entity_id: 'cf7de345-a40b-56cb-b70a-7fb707a5b4b0',
            parent_fields: [
                ['name', ''],
                ['entityName', ''],
                ['fa_entity_id', ''],
                ['trigger', ''],
                ['filter_conditions', [{'field_name':'task_type','values':[],'operator':'includes'}]]  
            ],
            children: [{
                entity_id: '37a890a4-01c4-56a7-8be0-6466b65db0dd',
                custom_fields: [
                    ['description', 'automation'],
                    ['type', 'custom_code'],
                    ['custom_code', ''],
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
            parent_entity_id: 'cf7de345-a40b-56cb-b70a-7fb707a5b4b0',
            parent_fields: [
                ['name', ''],
                ['entityName', ''],
                ['fa_entity_id', ''],
                ['trigger', ''],
                ['filter_conditions', [{'field_name':'','values':[],'operator':''}]]    
            ],
            children: [{
                entity_id: '37a890a4-01c4-56a7-8be0-6466b65db0dd',
                custom_fields: [
                    ['description', 'automation'],
                    ['type', 'custom_code'],
                    ['custom_code', ''],
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
            parent_entity_id: '2c05c9fa-568e-49e2-b435-b84f79fe1d32',
            parent_fields: [
                ['entityName', ''],
                ['fa_entity_id', ''],
                ['description', ''],
                ['roles', ''],
                ['conditions', [{'field_name':'','values':[],'operator':''}]]   
            ],
            children: [{
                entity_id: '101328d1-3b44-4f19-a19e-9a645776761b',
                custom_fields: [
                    ['field_name', null],
                    ['section_name', null],
                    ['type', ''],
                    ['app_action_id', ''],
                    ['operation', ''],
                    ['value', '']
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
            parent_entity_id: '2c05c9fa-568e-49e2-b435-b84f79fe1d32',
            parent_fields: [
                ['entityName', ''],
                ['fa_entity_id', ''],
                ['description', ''],
                ['roles', ''],
                ['conditions', [{'field_name':'','values':[],'operator':''}]]    
            ],
            children: [{
                entity_id: '101328d1-3b44-4f19-a19e-9a645776761b',
                custom_fields: [
                    ['field_name', null],
                    ['section_name', null],
                    ['type', ''],
                    ['app_action_id', ''],
                    ['operation', ''],
                    ['value', '']
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
