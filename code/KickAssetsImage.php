<?php

/**
 * Provides some some helper methods for generating images in the KickAssets UI
 *
 * @package  unclecheese/silverstripe-kickassets
 * @author  Uncle Cheese <unclecheese@leftandmain.com>
 */
class KickAssetsImage extends DataExtension {

	/**
	 * Returns an image properly formatted for the detail panel
	 * @return Image_Cached
	 */
	public function getKickAssetsDetailImage() {
		if($this->owner->getOrientation() === Image::ORIENTATION_PORTRAIT) {
			return $this->owner->SetHeight(400);
		}

		return $this->owner->SetWidth(600);
	}

}
