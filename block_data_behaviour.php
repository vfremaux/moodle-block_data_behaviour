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
 * Block LP main file.
 *
 * @package    block_lp
 * @copyright  2018 Valery Fremaux
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */
defined('MOODLE_INTERNAL') || die();
require_once($CFG->dirroot.'/blocks/data_behaviour/classes/manager.php');
require_once($CFG->dirroot.'/mod/data/locallib.php');

/**
 * Block Quiz Behaviour.
 *
 * @package    block_data_behaviour
 * @copyright  2018 Valery Fremaux
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */
class block_data_behaviour extends block_base {

    /**
     * Applicable formats.
     *
     * @return array
     */
    public function applicable_formats() {
        return array('site' => false, 'course' => true, 'my' => false);
    }

    public function instance_allow_multiple() {
        return false;
    }

    /**
     * Init.
     *
     * @return void
     */
    public function init() {
        $this->title = get_string('pluginname', 'block_data_behaviour');
    }

    /**
     * Get content.
     *
     * @return stdClass
     */
    public function get_content() {
        global $COURSE, $DB;

        if (isset($this->content)) {
            return $this->content;
        }
        $this->content = new stdClass();

        $coursecontext = context_course::instance($COURSE->id);
        if (!has_capability('moodle/course:manageactivities', $coursecontext)) {
            $this->content->text = '';
            $this->content->footer = '';
            return $this->content;
        }

        $this->content->text = get_string('help', 'block_data_behaviour');
        $datanum = $DB->count_records('data', array('course' => $COURSE->id));
        $this->content->text .= get_string('youhave', 'block_data_behaviour', $datanum);
        $this->content->footer = '';

        return $this->content;
    }

    /**
     * Screen protect copy should be setup in all possible screens in the course.
     * We require it in the block it self to lock the overriding course content if possible.
     * Thi is absolutely NOT a full secure solution, just ennoying dummy users.
     */
    public function get_required_javascript() {
        global $PAGE, $COURSE, $DB;

        $manager = \block_data_behaviour\manager::instance();

        $PAGE->requires->jquery();
        $datas = $manager->get_datas();

        $currentdataid = optional_param('d', 0, PARAM_INT);
        $currentpage = optional_param('page', 0, PARAM_INT);
        $currentmode = optional_param('mode', 'single', PARAM_TEXT);
        $currentrecordid = optional_param('rid', 0, PARAM_INT);

        foreach ($datas as $d) {
            if ($manager->has_tag($d->id, 'cvtheque')) {
                debug_trace("CVTheque detected in {$d->id} ", TRACE_DEBUG);

                // Get recordid info if available.
                // debug_trace("$currentdataid {$d->id} $currentmode", TRACE_DEBUG);
                if ((!empty($currentdataid) && ($d->id == $currentdataid) && ($currentmode == 'single')) ||
                    !empty($currentrecordid)) {
                    if ($currentrecordid == 0) {
                        $currentdata = $DB->get_record('data', ['id' => $currentdataid]);
                        $perpage = 1;
                        $cm = get_coursemodule_from_instance('data', $currentdataid);
                        $context = context_module::instance($cm->id);
                        $currentgroup = groups_get_course_group($COURSE);
                        list($records, $maxcount, $totalcount, $page, $nowperpage, $sort, $currentmode) =
                            data_search_entries($currentdata, $cm, $context, 'single', $currentgroup, '', '', '', $currentpage, $perpage, '', [], null);
                        // We must find one or there is no records in this DB.
                        if (!empty($records)) {
                            $record = array_shift($records);
                            $currentrecordid = $record->id;
                        }
                    }

                    $params = new StdClass;
                    $params->courseid = $COURSE->id;
                    $params->dataid = $currentdataid;
                    $params->recordid = $currentrecordid;
                    // debug_trace("CVTheque pluging AMD ", TRACE_DEBUG);
                    $PAGE->requires->js_call_amd('block_data_behaviour/cvtheque', 'init', [$params]);
                    return;
                }
            } else {
                debug_trace("CVTheque missed in {$d->id} ", TRACE_DEBUG);
            }
        }
    }

    public function get_aria_role() {
        return 'teachertool';
    }
}