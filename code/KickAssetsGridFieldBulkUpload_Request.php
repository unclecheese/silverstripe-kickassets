<?php

/**
 * @property GridFieldBulkUpload_Request $owner
 */
class KickAssetsGridFieldBulkUpload_Request extends DataExtension {

    private static $allowed_actions = array(
        'folderid'
    );

    public function folderid(SS_HTTPRequest $r) {
        return $this->owner->getUploadField()->folderid($r);
    }

}
