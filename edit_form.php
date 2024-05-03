<?php
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
 * @package    block_quiz_behaviour
 * @category   blocks
 * @copyright  2018 Valery Fremaux (valery.fremaux@gmail.com)
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */
defined('MOODLE_INTERNAL') || die();

class block_data_behaviour_edit_form extends block_edit_form {

    protected function specific_definition($mform) {
        global $DB, $COURSE;

        $mform->addElement('header', 'configheader', get_string('databehaviourconfig', 'block_data_behaviour'));

        $datas = $DB->get_records('data', array('course' => $COURSE->id));

        foreach ($datas as $d) {

            $dname = format_string($d->name);

            $mform->addElement('static', 'config_dname'.$d->id, $dname);

            $mform->addElement('advcheckbox', 'config_seeonlymydata'.$d->id, get_string('seeonlymydata', 'block_data_behaviour'));

            $mform->addElement('advcheckbox', 'config_notabs'.$d->id, get_string('notabs', 'block_data_behaviour'));

            $mform->addElement('advcheckbox', 'config_nosearch'.$d->id, get_string('nosearch', 'block_data_behaviour'));

            $mform->addElement('advcheckbox', 'config_nosingle'.$d->id, get_string('nosingle', 'block_data_behaviour'));

            $mform->addElement('advcheckbox', 'config_noadmin'.$d->id, get_string('noadmin', 'block_data_behaviour'));

        }
    }
}
