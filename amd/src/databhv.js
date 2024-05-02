// This file is part of Moodle - http://moodle.org/
//
// Moodle is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// Moodle is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.
//
// You should have received a copy of the GNU General Public License
// along with Moodle.  If not, see <http://www.gnu.org/licenses/>.

// jshint unused: true, undef:true

define(['jquery', 'core/log', 'core/config'], function($, log, cfg) {

    var databhv = {

        init: function() {

            log.debug('AMD js initialized for data behaviour');
        },

        // Multiple fields have fieldnames indexed by "_<indexletter><indexnum>" suffix.
        // Multiple fields will be shown from index 1 to n when not empty values.
        // There should not be any empty gap between two indexes (say 1 filled, 2 empty, 3 filled)
        // As multiple values remain an unordered principe, empty gaps will be refilled with subsequent values
        // The first empty set available (if available) and subsequent will be hidden.
        // In this case will a "Add value" be proposed to the user.

        // Multiple fields can be assembled in sets (if there is any fieldset tag in the form template).
        // All fields in a multiple fieldset must be indexed with the same indexletter and same indexnum
        // The field set but be marked also with the indexletter and num in the template.
        // All fields NOT in a fieldset need to be marked with a surrounding "single" class, so multiple process applies to the field.

        // Preload some fields with internal values.
        preload_fields: function() {
            // Fetches a mapping described by form field id and 
            var url = cfg.wwwroot + '/blocks/data_behaviour/ajax/service.php';
            url += '?cid=';
            url += '?cmid=';
            url += '?what=getmapped';

            // Get mapped info from server, then force values.
            // Mapping is a associative array keying moodle data forced values to form field ids.
            $.get(url, function(data) {
                for (key in data) {
                    // start with simple text fields.
                    $('#' + key).val(data[key]);
                }
            }, 'json');

        }

        // process field instances matching multiple field pattern
        init_multiple_fields: function() {
            // Identify all multiple single fields.

            
        }

        // process fieldset instances matching multiple fieldset pattern
        init_multiple_fieldsets: function() {
            
        }

        add_multiple_field_value: function() {
            
        }

        remove_multiple_field_value: function() {
            
        }

        remove_multiple_fieldset_index: function() {
            
        }

    return databhv;
});