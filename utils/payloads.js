const uuid  = require('node-uuid');

/*  define all the opration paylod
    key: operantion i.e addCustomfield, addEnity etc
    value: arguments
*/
const payloads = {
    changeset:  {
        name: '',
        description: '',
        transport_id: uuid.v4(),
        created_at: new Date().toISOString()
    },
    addEntity: {
        transport_id: uuid.v4(),
        icon: '',
        label: '',
        roles: [],
        is_applet: null,
        parent_id: null,
        label_plural: '',
        info_segment_wide: '1 column',
        enforce_individual_access: true,
        tranpoort_id: '',
        fields_configuration_attachment_id: null
    },
    updateEntity: {
        transport_id: uuid.v4(),
        id: '',
        icon: '',
        color: null,
        label: '',
        roles: [],
        is_visible: null,
        description: null,
        show_seq_id: null,
        label_plural: '',
        applet_config: {},
        default_sorts: [],
        show_app_icon: null,
        landscape_mode: null,
        primary_action: null,
        quick_add_hint: null,
        enable_quick_add: false,
        title_field_name: 'seq_id',
        info_segment_wide: '1 column',
        show_related_list: null,
        template_file_url: '',
        quick_add_custom_code: '',
        enforce_individual_access: true
    },
    addCustomField: {
        transport_id: uuid.v4(),
        entity: '',
        data_type: 'boolean',
        help_text: null,
        is_unique: null,
        layout_id: null,
        date_field: null,
        hint_label: null,
        name_label: 'isActive',
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
        fa_related_field_config_id: null
    }
};

module.exports = payloads;