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

/**
 * Javascript controller for controlling the sections.
 *
 * @module     block_multicourse_navigation/collapse_control
 * @package    block_multicourse_navigation
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */
// jshint unused: true, undef:true
define(['jquery', 'core/log', 'core/config', 'block_data_cart/datacart'], function ($, log, cfg, datacart) {

    var cvtheque = {

        courseid: 0,

        dataid: 0,

        blockid: 0,

        recordid: 0,

        init: function (params) {

            log.debug("AMD Cvtheque start init !");
            var isview;
            var isedit;

            cvtheque.courseid = params.courseid;
            cvtheque.dataid = params.dataid;
            cvtheque.recordid = params.recordid;

            // Detect we have cvtheque environnement.
            if ($('.cvthequetemplate').length === 0) {
                log.debug("AMD Cvtheque not found in DOM !");
                return;
            }

            isview = $('.cvthequetemplate.view').length > 0;
            isedit = $('.cvthequetemplate.edit').length > 0;

            if (isedit) {
                // Sync/force some fields values from profile (only if creating the record.
                if (parseInt($('INPUT[name="rid"]').val()) === 0) {
                    var profileurl = cfg.wwwroot + '/blocks/data_behaviour/ajax/service.php';
                    profileurl += '?what=getuserinfo';
                    profileurl += '&courseid=' + cvtheque.courseid;
                    profileurl += '&dataid=' + cvtheque.dataid;
                    $.get(profileurl, function (data) {
                        $('#cv_nom INPUT').val(data.cv_nom);
                        $('#cv_prenom INPUT').val(data.cv_prenom);
                        $('#cv_ville INPUT').val(data.cv_ville);
                        $('#cv_tel1 INPUT').val(data.cv_tel1);
                        $('#cv_tel2 INPUT').val(data.cv_tel2);
                        $('#cv_mail INPUT').val(data.cv_mail);
                        $('#cv_adresse INPUT').val(data.cv_adresse);
                    }, 'json');
                }

                // Set initial handlers

                $('.delete-fieldset div.btn').addClass('dimmed');

                // $('.delete-fieldset').bind('click', this.delete_fieldset);
                $('.data-fs-master').on('change', '.mod-data-input', [], this.set_fieldset_controls);

                // Check all master fields initial states.
                $('.data-fs-master .mod-data-input').trigger('change');

                // Expand all selects.
                $('.cvthequetemplate.edit select[multiple="multiple"]').attr('size', 8);

                // Initiate status color
                let publishedstate = $('#cv_state-value input[value*="Pub"]').is(':checked');
                // let draftstate = $('#cv_state-value input[value*="Brou"]').is(':checked');
                if (publishedstate) {
                    $('#cv_state-value').addClass('published');
                } else {
                    if (!publishedstate) {
                        $('#cv_state-value input[value*="Brou"]').prop('checked', true);
                    }
                    $('#cv_state-value').addClass('draft');
                }
                $('#cv_state-value input[value*="Pub"]').bind('click', this.publish);
                $('#cv_state-value input[value*="Brou"]').bind('click', this.unpublish);
                log.debug("AMD Cvtheque Initialized for editing !");
            }

            if (isview) {
                this.check_all_fieldsets();

                // Add "add to cart handler"
                $('#id-add-to-cart').on('click', this.add_to_data_cart);
                $('#id-add-to-cart').attr('data-recordid', cvtheque.recordid);
                $('#id-add-to-cart').attr('data-dataid', cvtheque.dataid);
                log.debug("AMD Cvtheque Initialized for viewing " + cvtheque.dataid + "/" + cvtheque.recordid + " !");
            }
        },

        // Check fieldset empty state and show relevant info.
        check_all_fieldsets: function () {
            var fieldsetelm, fselm;

            $('.data-fs-master').each(function () {
                if ( $(this).html() != '' ) {
                    // fieldset has content.
                    fieldsetelm = $(this).closest('.multiple-fieldset');
                    fselm = fieldsetelm.attr('data-fs');

                    // Hide set-empty of the set.
                    log.debug('Hiding empty signal on fieldset[data-fs="' + fselm + '"][data-fsix="0"]');
                    $('fieldset[data-fs="' + fselm + '"][data-fsix="0"]').addClass('set-hidden');

                    // Show this fieldset.
                    fieldsetelm.removeClass('set-hidden');
                }
            });
        },

        // Examinates the completion state of th emaster field and
        // sets the appropriate state of the "add more" button.
        set_fieldset_controls: function (e) {
            e.stopPropagation();
            e.preventDefault();

            var that, fieldsetelm, fselm, fsix, fieldsetinputs, fieldsetselects, fieldsettextareas, masterinput;
            var isfile, isempty, filehiddenfieldelm;

            that = $(this);

            log.debug("AMD Cvtheque Setting " + that.attr('id') + " initial state !");

            // identify fselm and fsix
            fieldsetelm = that.closest('.multiple-fieldset');
            fieldsetinputs = $('#' + fieldsetelm.attr('id') + ' :not(.template-token.data-fs-master) INPUT');
            fieldsetselects = $('#' + fieldsetelm.attr('id') + ' :not(.template-token.data-fs-master) SELECT');
            fieldsettextareas = $('#' + fieldsetelm.attr('id') + ' :not(.template-token.data-fs-master) TEXTAREA');
            masterinput = $('#' + fieldsetelm.attr('id') + ' .template-token.data-fs-master INPUT');
            fselm = fieldsetelm.attr('data-fs');
            fsix = fieldsetelm.attr('data-fsix');

            log.debug("AMD Cvtheque Setting : Seeing val '" + that.val() + "' for " + fselm + ':' + fsix + " !");

            isfile = that.children('.filemanager').length > 0;
            if (isfile) {
                log.debug("AMD Cvtheque : isfile ? " + isfile);
                // Direct testing is not possible as file manager is not yet loaded.
                // isempty = filemanagerelm.hasClass('fm-nofiles');
                // so test by ajax.
                filehiddenfieldelm = fieldsetelm.find('input[type="hidden"]').first();
                var url = cfg.wwwroot + '/blocks/data_behaviour/ajax/service.php';
                url += '?what=checkfilearea';
                url += '&filearea=draft&itemid=' + filehiddenfieldelm.val();
                $.ajax(url, {
                    'success': function(result) {
                    isempty = result.isempty;
                },
                    'async': false,
                    'dataType': 'json'}
                );
                log.debug("AMD Cvtheque : isempty ? " + isempty);
            }

            if ((!isfile && (that.val() === '' || that.val() === undefined)) || (isfile && isempty)) {
                // Will ignore last one as button does not exist.
                cvtheque.disable_add_one_more(fselm, parseInt(fsix) + 1);
                fieldsetinputs.prop('disabled', true);
                fieldsetselects.prop('disabled', true);
                fieldsettextareas.prop('disabled', true);
                masterinput.prop('disabled', null);
                cvtheque.disable_delete(fselm, fsix);
            } else {
                // Will ignore last one as button does not exist.
                $('fieldset[data-fs="' + fselm + '"][data-fsix="' + fsix + '"]').removeClass('set-hidden');
                cvtheque.enable_add_one_more(fselm, parseInt(fsix) + 1);
                cvtheque.disable_add_one_more(fselm, fsix); // Disable previous add_more.
                fieldsetinputs.prop('disabled', null);
                fieldsetselects.prop('disabled', null);
                fieldsettextareas.prop('disabled', null);
                cvtheque.enable_delete(fselm, fsix);
            }
        },

        /*
         * Potentially on all master input field whose null value tells it is empty.
         */
        enable_add_one_more: function (fselm, fsix) {
            log.debug("AMD Cvtheque Enabling add one more : " + fselm + ':' + fsix + " !");
            $('.add-more[data-fs="' + fselm + '"][data-fsix="' + fsix + '"] div.btn').removeClass('dimmed');
            $('.add-more[data-fs="' + fselm + '"][data-fsix="' + fsix + '"]').bind('click', cvtheque.add_one_more);
        },

        disable_add_one_more: function (fselm, fsix) {
            log.debug("AMD Cvtheque Disabling add one more : " + fselm + ':' + fsix + " !");
            $('.add-more[data-fs="' + fselm + '"][data-fsix="' + fsix + '"] div.btn').addClass('dimmed');
            $('.add-more[data-fs="' + fselm + '"][data-fsix="' + fsix + '"]').unbind('click', cvtheque.add_one_more);
        },

        /*
         * Potentially on all master input field whose null value tells it is empty.
         */
        enable_delete: function (fselm, fsix) {
            log.debug("AMD Cvtheque Enabling delete : " + fselm + ':' + fsix + " !");
            $('.delete-fieldset[data-fs="' + fselm + '"][data-fsix="' + fsix + '"] div.btn').removeClass('dimmed');
            $('.delete-fieldset[data-fs="' + fselm + '"][data-fsix="' + fsix + '"]').bind('click', cvtheque.delete_fieldset);
        },

        disable_delete: function (fselm, fsix) {
            log.debug("AMD Cvtheque Disabling delete : " + fselm + ':' + fsix + " !");
            $('.delete-fieldset[data-fs="' + fselm + '"][data-fsix="' + fsix + '"] div.btn').addClass('dimmed');
            $('.delete-fieldset[data-fs="' + fselm + '"][data-fsix="' + fsix + '"]').unbind('click', cvtheque.delete_fieldset);
        },

        add_one_more: function (e) {
            e.stopPropagation();
            e.preventDefault();

            var that, fselm, fsix, prevfsix, fieldsetelm, fieldsetinputs, fieldsetselects, fieldsettextareas;
            that = $(this);

            fieldsetelm = that.closest('.multiple-fieldset');
            fieldsetinputs = $('#' + fieldsetelm.attr('id') + ' :not(.template-token.data-fs-master) INPUT');
            fieldsetselects = $('#' + fieldsetelm.attr('id') + ' :not(.template-token.data-fs-master) SELECT');
            fieldsettextareas = $('#' + fieldsetelm.attr('id') + ' :not(.template-token.data-fs-master) TEXTAREA');


            fselm = that.attr('data-fs');
            fsix = that.attr('data-fsix');
            prevfsix = parseInt(fsix) - 1;
            $('.multiple-fieldset[data-fs="' + fselm + '"][data-fsix="' + fsix + '"]').toggleClass('set-hidden');
            cvtheque.disable_add_one_more(fselm, prevfsix);
            // wake up fields.
            fieldsetinputs.prop('disabled', null);
            fieldsetselects.prop('disabled', null);
            fieldsettextareas.prop('disabled', null);
        },

        /**
         * Synopsys : if first element of a set (set-first), than empty all set inputs, but keep the form visible.
         * if not first, If next set is hidden (empty) or does not exist (last), empty values and hide. If next set
         * is shown, copy all values in current, and iterate to next.
         */
        delete_fieldset: function (e) {

            e.stopPropagation();
            e.preventDefault();

            var that, fselm, fsix, jqfieldsetelm, loopctl, nextfsix, nextjqfieldset, textareaelm;
            that = $(this);
            fselm = that.attr('data-fs');
            fsix = that.attr('data-fsix');

            log.debug("AMD Cvtheque deleting/emptying : " + fselm + ':' + fsix + " !");

            jqfieldsetelm = that.closest('.multiple-fieldset');

            // Empty everything in the deleted element.
            $('input[type="text"]', jqfieldsetelm).val(null);
            $('textarea', jqfieldsetelm).val(null);
            $('input[type="select"]', jqfieldsetelm).val(null);
            $('input[type="checkbox"]', jqfieldsetelm).attr('checked', null);
            $('input[type="radio"]', jqfieldsetelm).attr('checked', null);

            // Additional cleaning if a textarea is a whisiwhyg
            textareaelm = $('input[type="textarea"]', jqfieldsetelm).first();
            if (textareaelm !== undefined) {
                $('#' + textareaelm.attr('id') + 'editable').html('');
            }

            // Disable the add more button.
            cvtheque.disable_add_one_more(fselm, fsix);

            nextfsix = fsix + 1;
            nextjqfieldset = jqfieldsetelm.next();
            if (nextjqfieldset != undefined) {
                loopctl = true;
            }
            while (loopctl) {
                if (nextjqfieldset.length == 0) {
                    // jqfieldset was the last one. so empty values.
                    $('input[type="text"]', jqfieldsetelm).val(null);
                    $('textarea', jqfieldsetelm).val(null);
                    $('input[type="select"]', jqfieldsetelm).val(null);
                    $('input[type="checkbox"]', jqfieldsetelm).attr('checked', null);
                    $('input[type="radio"]', jqfieldsetelm).attr('checked', null);
                    jqfieldsetelm.toggleClass('set-hidden');

                    // Additional cleaning if a textarea is a whisiwhyg
                    textareaelm = $('input[type="textarea"]', jqfieldsetelm).first();
                    if (textareaelm !== undefined) {
                        $('#' + textareaelm.attr('id') + 'editable').html('');
                    }

                    // Allow adding one more to previous item
                    cvtheque.enable_add_one_more(fselm, nextfsix - 2);
                    // Stop processing.
                    loopctl = false;

                } else {
                    // Next exists but might be empty or not
                    if (nextjqfieldset.hasClass('set-hidden')) {
                        // Next is empty (should be).
                        jqfieldsetelm.toggleClass('set-hidden');

                        // Allow adding one more to previous item
                        cvtheque.enable_add_one_more(fselm, nextfsix - 2);
                    } else {
                        // Next is not empty. We need copy values.
                        $('input[type="text"]', nextjqfieldset).each(cvtheque.copy_text(jqfieldsetelm, nextfsix));
                        $('textarea', nextjqfieldset).each(cvtheque.copy_textarea(jqfieldsetelm, nextfsix));
                        $('input[type="select"]', nextjqfieldset).each(cvtheque.copy_select(jqfieldsetelm, nextfsix));
                        $('input[type="checkbox"]', nextjqfieldset).each(cvtheque.copy_check(jqfieldsetelm, nextfsix));
                        $('input[type="radio"]', nextjqfieldset).each(cvtheque.copy_radio(jqfieldsetelm, nextfsix));
                        jqfieldsetelm.toggleClass('set-hidden');
                        cvtheque.disable_add_one_more(fselm, fsix);
                    }
                    nextfsix = nextfsix + 1;
                    jqfieldsetelm = nextjqfieldset;
                    nextjqfieldset = $('.multiple-fieldset[data-fs="' + fselm + '"][data-fsix="' + nextfsix + '"]');
                }
            }
        },

        copy_text: function(jqfieldsetelm, nextfsix) {
            var inputname = $(this).attr('name');
            var inputvalue = $(this).val();
            var lastfsix = nextfsix - 1;
            inputname.replace(/\\d+$/, '');
            inputname += lastfsix;
            $('input[name="' + inputname + '"]', jqfieldsetelm).val(inputvalue);
        },

        copy_textarea: function(jqfieldsetelm, nextfsix) {
            var inputname = $(this).attr('name');
            var inputvalue = $(this).val();
            var inputid = $(this).attr('id');
            var lastfsix = nextfsix - 1;
            inputname.replace(/\\d+$/, '');
            inputname += lastfsix;
            $('textarea[name="' + inputname + '"]', jqfieldsetelm).val(inputvalue);

            // Additional cleaning if a textarea is a whisiwhyg
            var targetareaid = $('textarea[name="' + inputname + '"]', jqfieldsetelm).first().attr('id');
            $('#' + targetareaid + 'editable').html(inputvalue);

        },

        copy_select: function(jqfieldsetelm, nextfsix) {
            var inputname = $(this).attr('name');
            var inputvalue = $(this).val();
            var lastfsix = nextfsix - 1;
            inputname.replace(/\\d+$/, '');
            inputname += lastfsix;
            $('input[name="' + inputname + '"]', jqfieldsetelm).val(inputvalue);
        },

        copy_check: function(jqfieldsetelm, nextfsix) {
            var inputname = $(this).attr('name');
            var inputchecked = $(this).attr('checked');
            var lastfsix = nextfsix - 1;
            inputname.replace(/\\d+$/, '');
            inputname += lastfsix;
            $('input[name="' + inputname + '"]', jqfieldsetelm).attr('checked', inputchecked);
        },

        copy_radio: function(jqfieldsetelm, nextfsix) {
            var inputname = $(this).attr('name');
            var inputchecked = $(this).attr('checked');
            var lastfsix = nextfsix - 1;
            inputname.replace(/\\d+$/, '');
            inputname += lastfsix;
            $('input[name="' + inputname + '"]', jqfieldsetelm).attr('checked', inputchecked);
        },

        publish: function(e) {
            e.stopPropagation();
            e.preventDefault();
            $('#cv_state-value').removeClass('draft');
            $('#cv_state-value').addClass('published');
        },

        unpublish: function(e) {
            e.stopPropagation();
            e.preventDefault();
            $('#cv_state-value').removeClass('published');
            $('#cv_state-value').addClass('draft');
        },

        add_to_data_cart: function (e) {
            e.stopPropagation();
            e.preventDefault();

            var that, url, recordid;
            that = $(this);
            recordid = that.attr('data-recordid');
            datacart.add_record(recordid);
        }

    };

    return cvtheque;
});

