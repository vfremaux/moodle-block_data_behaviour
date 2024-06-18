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
 * @package    block_data_behaviour
 * @category   blocks
 * @copyright  2018 Valery Fremaux (valery.fremaux@gmail.com)
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */
namespace block_data_behaviour;

use \context_course;
use \moodle_exception;

defined('MOODLE_INTERNAL') || die();

class manager {

    public $name;

    protected $blockinstance;

    /**
     * Protected constructor. Singleton behaviour.
     * Get an internally instanciate the data_behaviour block instance for the course.
     */
    protected function __construct() {
        global $COURSE, $DB;

        $this->name = 'data manager';

        $coursecontext = context_course::instance($COURSE->id);
        $params = array('blockname' => 'data_behaviour', 'parentcontextid' => $coursecontext->id);
        $blockrec = $DB->get_record('block_instances', $params);

        if ($blockrec) {
            $this->blockinstance = block_instance('data_behaviour', $blockrec);
        }
        return null;
    }

    public static function instance() {
        global $COURSE, $DB;
        static $manager;

        if (isset($manager)) {
            return $manager;
        }

        $coursecontext = context_course::instance($COURSE->id);
        $params = array('blockname' => 'data_behaviour', 'parentcontextid' => $coursecontext->id);
        if ($DB->record_exists('block_instances', $params)) {
            $manager = new manager();
            return $manager;
        }

        // If no bloc instance in course, than null manager.
        return null;
    }

    /**
     * Get all databases in the current course.
     */
    public function get_datas() {
        global $DB, $COURSE;

        return $DB->get_records('data', array('course' => $COURSE->id), 'id,name');
    }

    /**
     * Checks a behaviour against an activity instance.
     * @param int $did a data activity id
     * @param string $behaviour a behaviour name
     */
    public function has_behaviour($did, $behaviour) {
        global $DB;

        if (!$DB->record_exists('data', array('id' => $did))) {
            if ($CFG->debug == DEBUG_DEVELOPER) {
                // TODO : auto cleanup of the deleted instances.
                throw moodle_exception("Invalid data. May be deleted");
            }
            return false;
        }

        if (empty($this->blockinstance)) {
            return false;
        }

        $key = $behaviour.$did;
        if (!empty($this->blockinstance->config->$key)) {
            return true;
        }

        // Silently answer false in any negative case.
    }

    /**
     * Checks a behaviour tag against an activity instance.
     * @param int $did a data activity id
     * @param string $behaviour a behaviour name
     */
    public function has_tag($did, $behaviourtag) {
        global $DB, $CFG;

        if (!$DB->record_exists('data', array('id' => $did))) {
            if ($CFG->debug == DEBUG_DEVELOPER) {
                // TODO : auto cleanup of the deleted instances.
                throw moodle_exception("Invalid data. May be deleted");
            }
            return false;
        }

        if (empty($this->blockinstance)) {
            return false;
        }

        $key = 'behaviourtags'.$did;
        if (preg_match('/\\b'.$behaviourtag.'\\b/', $this->blockinstance->config->$key)) {
            // returns true if the instance is tagged.
            return true;
        }
        return false;
    }

    public function is_powered_user($cm) {
        global $USER, $COURSE;

        $context = context_module::instance($cm->id);
        if (!has_capability('mod/data:rate', $context)) {
            return true;
        }
    }
}
