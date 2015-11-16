<?php

class KickAssetsUploadField extends DataExtension {

	private static $allowed_actions = array (
		'folderid'
	);


	public function folderid(SS_HTTPRequest $r) {
		return new SS_HTTPResponse(
			Folder::find_or_make($this->owner->getFolderName())->ID
		);
	}
}