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
 * @subpackage  backup-moodle2
 * @copyright   2016 onwards Valery Fremaux (valery.fremaux@gmail.com)
 * @license     http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */
defined('MOODLE_INTERNAL') || die;

/**
 * Specialised restore task for the data_behaviour block
 * (has own DB structures to backup)
 *
 * TODO: Finish phpdocs
 */
class restore_data_behaviour_block_task extends restore_block_task {

    protected function define_my_settings() {
    }

    protected function define_my_steps() {
    }

    public function get_fileareas() {
        // No associated fileareas.
        return array();
    }

    public function get_configdata_encoded_attributes() {
        // No special handling of configdata.
        return array();
    }

    static public function define_decode_contents() {
        return array();
    }

    static public function define_decode_rules() {
        return array();
    }

    // Each block will be responsible for his own remapping in is associated pageid.
    public function after_restore() {
        global $DB;

        $courseid = $this->get_courseid();
        $blockid = $this->get_blockid();
        $oldblockid = $this->get_old_blockid();

        // These are fake blocks that can be cached in backup.
        if (!$blockid) {
            return;
        }

        // Adjust the serialized configdata->keybase<quid> to the actualized restored database ids.
        // Get the configdata.
        $configdata = $DB->get_field('block_instances', 'configdata', array('id' => $blockid));
        // Extract configdata.
        $config = unserialize(base64_decode($configdata));
        // Set array of used rss feeds.
        // TODO check this, not sure course modules are stored in backup mapping tables as this.
        if (!empty($config)) {

            $newconfig = new StdClass;
            foreach ($config as $key => $value) {
                if (preg_match('/(.+)(\d+)$/' , $key, $matches)) {
                    $keybase = $matches[1];
                    $olddataid = $matches[2];

                    $newid = $this->get_mappingid('data', $olddataid);

                    $newkey = $keybase.$newid;
                    $newconfig->$newkey = $value;
                } else {
                    $newconfig->$key = $value;
                }
            }

            // Serialize back the configdata
            $configdata = base64_encode(serialize($newconfig));
            // Set the configdata back.
            $DB->set_field('block_instances', 'configdata', $configdata, array('id' => $blockid));
        }
    }

    /**
     * Return the new id of a mapping for the given itemname
     *
     * @param string $itemname the type of item
     * @param int $oldid the item ID from the backup
     * @param mixed $ifnotfound what to return if $oldid wasnt found. Defaults to false
     */
    public function get_mappingid($itemname, $oldid, $ifnotfound = false) {
        $mapping = $this->get_mapping($itemname, $oldid);
        return $mapping ? $mapping->newitemid : $ifnotfound;
    }

    /**
     * Return the complete mapping from the given itemname, itemid
     */
    public function get_mapping($itemname, $oldid) {
        return restore_dbops::get_backup_ids_record($this->plan->get_restoreid(), $itemname, $oldid);
    }
}
