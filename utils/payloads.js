const { v4 }  = require('uuid');

/*  define all the opration paylod
    key: operantion i.e addCustomfield, addEnity etc
    value: arguments
*/
const payloads = {
    addChangeset:  {
        args: {
            name: '',
            description: '',
        },
        transports:[]
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
                1: v4(),
                2: v4(),
                3: v4(),
                4: v4(),
                5: v4(),
                6: v4(),
                7: v4(),
                8: v4(),
                9: v4(),
                10: v4()
            },
            model: 'fa_field_config'
        },
        {
            order_transport_id_map: {
                1: v4(),
                2: v4()
            },
            model: 'app_action'
        },
        {
            order_transport_id_map: {
                1: v4(),
                2: v4()
            },
            model: 'fa_related_list'
        }]
    },

    updateApp: {
        args: {
            id:'',
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
            color: '',
            is_applet: null,
            parent_id: null,
            fields_configuration_attachment_id: null,
        },
        transports: []
    },

    activateApp: {
        args: {
            id: '',
            isVisible: true,
        },
        transports: []
    },

    deactivateApp: {
        args: {
            id: '',
            isVisible: false,
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

    updateOrder: {
        args: {
            entities: [],
            field: 'order',
            filters: [],
            order: {
                '1': ''
            }
        },
        transports: []
    },

    deleteField: {
        args: {
            id: ''
        },
        transports: []
    },

    activateField: {
        args: {
            id: '',
            isVisible: true,
            is_filterable: true
        },
        transports: []
    },

    deactivateField: {
        args: {
            id: '',
            isVisible: false,
            is_filterable: false
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
        transports:[]
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
                acl_type: '',
                operation: '',
                target_entity_id: '',
                fa_field_id: '',
                fa_acl_field_roles: [],
                active: true,
                type: 'grant',
                entityName: '',
                entity_operation: '',
                resource_type: 'field',
                conditions: '[{ "field_name": "" , "values": [], "operator": "" }]',
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
            parent_fields: {
                name: '',
                order_type: '',
                allow_choice_creation: true
            },
            children: [{
                entity_id: '6fc34d02-c890-5661-a157-565d99a4fe37',
                custom_fields: {
                    name: '',
                    icon: '',
                    color: '',
                    order: '',
                }
            }],
        },
        transports:[]
    },

    activateChoiceList: {
        args:{
            entity_value_id: '',
            entity: 'catalog_type',
            custom_fields: [['is_visible', 'true' ]]
        },
        transports:[]
    },

    deactivateChoiceList: {
        args:{
            entity_value_id: '',
            entity: 'catalog_type',
            custom_fields:  [["is_visible", 'false' ]]
        },
        transports:[]
    },

    addAutomation: {
        args: {
            instance_id: null,
            parent_entity_id: 'cf7de345-a40b-56cb-b70a-7fb707a5b4b0',
            parent_fields: {
                name: '',
                fa_entity_id : '',
                entityName: '',
                trigger: '',
                schedule_cron: '',
                schedule_datetime_field: null,
                on_update_field: null,
                filter_conditions: '[{ "field_name": "" , "values": [], "operator": "" }]',
            },
            children: [{
                entity_id: '37a890a4-01c4-56a7-8be0-6466b65db0dd',
                custom_fields: {
                    description: '',
                    type: '',
                    custom_code:'',
                    delay: null,
                    working_calendar: false,
                    due_date_field: false,
                }
            }],
        },
        transports:[]  
    },

    activateAutomation: {
        args:{
            entity_value_id: '',
            entity: 'rule_set',
            custom_fields: [['is_visible', 'true']]
        },
        transports:[]
    },

    deactivateAutomation: {
        args:{
            entity_value_id: '',
            entity: 'rule_set',
            custom_fields:  [["is_visible", 'false' ]]
        },
        transports:[]
    },

    addFormRule: {
        args: {
            instance_id: null,
            parent_entity_id: '2c05c9fa-568e-49e2-b435-b84f79fe1d32',
            parent_fields: {
                entityName: '',
                description: '',
                roles: [],
                conditions: '[{ "field_name": "" , "values": [], "operator": "" }]',
            },
            children: [{
                entity_id: '101328d1-3b44-4f19-a19e-9a645776761b',
                custom_fields: {
                    field_name: '',
                    section_name: '',
                    type: '',
                    app_action_id: '',
                    operation: '',
                    value: '',
                }
            }],
        },
        transports:[]
    },

    activateFormrule: {
        args:{
            entity_value_id: '',
            entity: 'form_rule',
            custom_fields: [['is_visible', 'true' ]]
        },
        transports:[]
    },

    deactivateFormrule: {
        args:{
            entity_value_id: '',
            entity: 'form_rule',
            custom_fields:  [["is_visible", 'false' ]]
        },
        transports:[]
    },


    updateCardConfig: {
        args:{
            id:'',
            entity: '',
            card_title: '',
            team_member: '',
            first_line: '',
            second_line: '',
            third_line: '',
            forth_line: '',
            fifith_line: '',
            primary_action: '',
            show_related_list: '',
            show_app_icon: false,
            landscape_mode: false,
            show_seq_id: false,
        },
        transports:[]
    },
};

module.exports = payloads;
