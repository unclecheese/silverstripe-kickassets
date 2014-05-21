<?php


class KickAssetsFolder extends DataExtension {
	


	public function ChildFiles() {
		$files = File::get()
			->filter(array(
				'ParentID' => $this->owner->ID			
			))
			->exclude(array(
				'ClassName' => 'Folder'
			))
		;

		$set = ArrayList::create(array());
		foreach($files as $file) {
			if(is_subclass_of($file->ClassName, "Image") || $file->ClassName == "Image") {				
				$file = $file->newClassInstance("Image");
			}
			$set->push($file);
		}
		return $set;
	}




	public function BrowseLink() {
		return Injector::inst()->get("KickAssets")->Link("browse/".$this->owner->Filename);
	}



	public function UpdateLink() {
		return Injector::inst()->get("KickAssets")->Link("updateitem/{$this->owner->ID}");	
	}

}
