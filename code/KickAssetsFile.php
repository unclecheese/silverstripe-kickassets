<?php



class KickAssetsFile extends DataExtension {



	public function IsAnImage() {
		return File::get_class_for_file_extension($this->owner->getExtension()) == "Image";
	}



	public function UpdateLink() {
		return Injector::inst()->get("KickAssets")->Link("updateitem/{$this->owner->ID}");	
	}




	public function getIconFilename() {
		$ext = $this->owner->Extension;
		if(!Director::fileExists("kickassets/images/icons/{$ext}.png")) {
			$ext = $this->owner->appCategory();
		}

		if(!Director::fileExists("kickassets/images/icons/{$ext}.png")) {
			$ext = "generic";
		}

		return $ext;
	}



	public function getKickIcon() {
		return "kickassets/images/icons/".$this->getIconFilename().".png";
	}


	public function BrowseLink() {
		return Injector::inst()->get('KickAssets')->Link("editkickassetsfile/{$this->owner->ID}");
	}


	public function getPlaceholderIcon() {
		return "kickassets/images/icons/".$this->getIconFilename()."_bw.png";
	}
	
}