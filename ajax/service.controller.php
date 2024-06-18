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
 * @package     block_data_behaviour
 * @category    blocks
 * @author      Valery Fremaux
 *
 * Ajax services for data_behaviour bloc.
 */

namespace block_data_behaviour;

use StdClass;
use coding_exception;
use context_user;

class service_controller {

    protected $received = false;

    public function receive($action, $data = null) {

        if (!is_null($data)) {
            $this->data = $data;
        } else {
            switch ($action) {
                case "getmapped": {
                    $this->data->courseid = required_param('cid', PARAM_INT);
                    $this->data->cmid = required_param('cmid', PARAM_INT);
                    break;
                }

                case "getuserinfo": {
                    break;
                }

                case "checkfilearea": {
                    $this->data->filearea = required_param('filearea', PARAM_TEXT);
                    $this->data->itemid = required_param('itemid', PARAM_INT);
                    break;
                }
            }
        }

        $this->received = true;
    }

    public function process($action) {
        global $USER;

        if (!$this->received) {
            throw new coding_exception("Controller was invoked with no data loaded\n");
        }

        switch ($action) {
            case "getmapped": {
                // Load maps, get data and build the response structure.
                $mapsdir = $CFG->dirroot.'/blocks/data_behaviour/local';
                $mapfiles = glob($mapsdir.'/*.json');

                foreach ($mapfiles as $file) {
                    $json = file($file);
                    $map = json_decode($json);

                    foreach ($map as $key => $target) {
                        
                    }
                }
                break;
            }

            case "getuserinfo": {
                $data = new StdClass;
                $data->cv_nom = $USER->lastname;
                $data->cv_prenom = $USER->firstname;
                $data->cv_adresse = $USER->address;
                $data->cv_ville = $USER->city;
                $data->cv_tel1 = $USER->phone1;
                $data->cv_tel2 = $USER->phone2;
                $data->cv_mail = $USER->email;
                return json_encode($data);
            }

            case 'checkfilearea': {
                // Answer true if empty.
                $fs = get_file_storage();
                $data = new StdClass;
                $context = context_user::instance($USER->id);
                $data->isempty = $fs->is_area_empty($context->id, 'user', $this->data->filearea, $this->data->itemid);
                return json_encode($data);
            }
        }
    }
}