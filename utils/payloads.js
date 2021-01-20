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
                fa_entity_id: 'dee22db4-fb61-4ece-a82d-c1d68729685e',
            }
        },
        transports:[{
            id: uuid.v4(),
            field: 'transport_id',
            model: 'layout'
        }]
    },
    updateSection: {
        args:{
            id: '',
            entity: 'layout',
            field_values: {
                title: '',
                is_visible: true,
                fa_entity_id: 'dee22db4-fb61-4ece-a82d-c1d68729685e',
            }
        },
        transports:[{
            id: '',
            field: 'id',
            model: 'layout'
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
            field: 'fa_entity_id',
            model: 'fa_entities'
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
                fa_acl_field_roles: [],
                fa_field_id: '',
                target_entity_id: '',
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
            field: 'target_entity_id',
            model: 'fa_entities'
        },
        {
            id: '',
            field: 'fa_field_id',
            model: 'fa_field_config'
        }]
    },
    updateAcl: {
        args:{
            id: '',
            entity: 'fa_acl',   
            field_values: {
                fa_acl_field_roles: [],
                operation: null,
                fa_field_id: '',
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
            field: 'fa_field_id',
            model: 'fa_field_config'
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
    
};

module.exports = payloads;
