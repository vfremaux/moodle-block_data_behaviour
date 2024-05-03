<?php

class block_data_behaviour_renderer extends plugin_renderer_base {

    public function user_selector($data, $baseurl) {
        global $COURSE, $USER, $OUTPUT;

        $userid = optional_param('db_userid'.$data->id, $USER->id, PARAM_INT);

        $context = context_course::instance($COURSE->id);
        $enrolledusers = get_enrolled_users($context);

        $users = array();
        if ($enrolledusers) {
            foreach ($enrolledusers as $eu) {
                $users[$eu->id] = fullname($eu);
            }
        }

        $name = 'db_userid'.$data->id;
        $str = $OUTPUT->box_start('format-page-data-list-userselect');
        $str .= $OUTPUT->single_select($baseurl, $name, $users, $userid, $nothing = array('' => 'choosedots'), 'data-behaviour-'.$data->id);
        $str .= $OUTPUT->box_end();
        return $str;
    }

}