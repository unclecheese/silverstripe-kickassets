<?php

/**
 * Class KickAssetsUploadField
 *
 * @package  unclecheese/silverstripe-kickassets
 * @author  Uncle Cheese <unclecheese@leftandmain.com>
 */
class KickAssetsUploadField extends DataExtension {

	private static $allowed_actions = array (
		'folderid'
	);

	public function folderid(SS_HTTPRequest $request) {
		return new SS_HTTPResponse(
			Folder::find_or_make($this->owner->getFolderName())->ID
		);
	}
}