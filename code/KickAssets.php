<?php


class KickAssets extends LeftAndMain implements PermissionProvider {



	static $url_segment = "files";



	static $menu_title = "Browse files";



	static $menu_priority = 0;



	static $url_priority = 30;



	static $menu_icon = "framework/admin/images/menu-icons/16x16/picture.png";



	static $icons = array (

	);



	static $url_handlers = array (
		'editkickassetsfile/$ID' => 'handleEdit'
	);


	static $allowed_actions = array (
		'browse',
		'getplaceholders',
		'editkickassetsfile',
		'deleteitems',
		'newfolder',
		'updateitem',
		'moveitems',
		'upload',
		'handleEdit'
	);



	protected $currentFolder;




	public function init() {
		parent::init();
		Requirements::javascript(THIRDPARTY_DIR . '/jquery-fileupload/jquery.iframe-transport.js');
		Requirements::javascript(THIRDPARTY_DIR . '/jquery-fileupload/cors/jquery.xdr-transport.js');

		Requirements::javascript(THIRDPARTY_DIR . '/jquery-fileupload/jquery.fileupload.js');
//		Requirements::javascript(THIRDPARTY_DIR . '/jquery-fileupload/jquery.fileupload-ui.js');

		Requirements::css("kickassets/css/kickassets.css");
		Requirements::javascript("kickassets/javascript/progress.js");
		Requirements::javascript("kickassets/javascript/kickassets.js");

		if(!file_exists(ASSETS_PATH)) {
			Filesystem::makeFolder(ASSETS_PATH);
		}

		Config::inst()->update("File","default_sort","Created ASC");
	}




	public function index($request) {
		return $this->redirect($this->Link("browse/".ASSETS_DIR));
	}





	public function browse(SS_HTTPRequest $request) {
		$child  = null;
		$previous = $request->param('ID');
		$next = $request->param('OtherID');
		if($previous == ASSETS_DIR) {
			$this->currentFolder = $this->createRootFolder();
		}

		if(!$next) {
			if($request->isAjax()) {
				if($request->getVar('refresh')) {
					$content = $this->renderWith('FolderContents');
				}
				else {
					$content = $this->renderWith($this->getTemplatesWithSuffix('_Content'));
				}
			} else {
				$content = $this->renderWith($this->getViewer('browse'));
			}
			return $content;
		}

		$parentID = $this->currentFolder->ID;
		$child = Folder::get()->filter(array(
			'Name' => $next,
			'ParentID' => $parentID
		))->first();
		if($child) {
			$this->currentFolder = $child;
			$request->shiftAllParams();
			$request->shift();
			return $this->browse($request);
		}
		die("Couldn't find \"$next\" under folder {$this->currentFolder->Name}");



	}



	public function handleEdit(SS_HTTPRequest $r) {
		if($file = File::get()->byID($r->param('ID'))) {
			return KickAssets_FileRequest::create($file)->handleRequest($r, DataModel::inst());
		}
		return $this->httpError(404);
	}


	public function deleteitems(SS_HTTPRequest $r) {
		if($ids = $r->requestVar('ids')) {
			foreach($ids as $id) {
				if($file = File::get()->byID((int) $id)) {
					$file->delete();
				}
			}
		}
		return new SS_HTTPResponse("OK");
	}




	public function newfolder(SS_HTTPRequest $r) {
		if(!singleton("Folder")->canCreate()) return Security::permissionFailure($this);

		$parentID = (int) $r->param('ID');
		$parentRecord = Folder::get()->byID($parentID);
		$name =_t('AssetAdmin.NEWFOLDER',"NewFolder");

		if($parentRecord && $parentRecord->ID) {
			$filename = $parentRecord->FullPath . $name;
		}
		else $filename = ASSETS_PATH . '/' . $name;


		$record = Folder::create(array(
			'ParentID' => $parentID,
			'Name' => basename($filename),
			'Title' => basename($filename),
			'Filename' => $filename
		));


		// Ensure uniqueness
		$i = 2;
		$baseFilename = substr($record->Filename, 0, -1) . '-';
		while(file_exists($record->FullPath)) {
			$record->Filename = $baseFilename . $i . '/';
			$i++;
		}

		$record->Name = $record->Title = basename($record->Filename);

		mkdir($record->FullPath);
		@chmod($record->FullPath, Config::inst()->get('Filesystem','file_create_mask'));

		return new SS_HTTPResponse($record->write());
	}




	public function updateitem(SS_HTTPRequest $r) {
		if($item = File::get()->byID((int) $r->param('ID'))) {
			if($title = $r->requestVar('title')) {
				$item->Title = $title;
				$item->write();
			}
		}
	}




	public function moveitems(SS_HTTPRequest $r) {
		if($destination = Folder::get()->byID((int) $r->requestVar('destination'))) {
			if(is_array($r->requestVar('items'))) {
				foreach($r->requestVar('items') as $id) {
					if($item = File::get()->byID((int) $id)) {
						$item->ParentID = $destination->ID;
						$item->write();
					}
				}
				return new SS_HTTPResponse("OK");
			}
		}
	}




	public function upload(SS_HTTPRequest $r) {
		$destination = Folder::get()->byId((int) $r->param('ID'));
		if(!$destination) {
			$path = false;
			Config::inst()->update('Upload', 'uploads_folder', '');
		}
		else {
			$path = preg_replace('/^'.ASSETS_DIR.'/','', $destination->Filename);
		}
		$files = array ();
		foreach($_FILES['files'] as $k => $list) {
			foreach($list as $i => $file) {
				if(!isset($files[$i])) $files[$i] = array ();
				$files[$i][$k] = $file;
			}
		}

		foreach($files as $tmpFile) {
			if(preg_match('/^image\//', $tmpFile['type'])) {
				$o = Image::create();
			}
			else {
				$o = File::create();
			}
			Upload::create()->loadIntoFile($tmpFile, $o, $path);
			if($o instanceof Image) {
				$o->deleteFormattedImages();
			}
		}

	}




	public function getplaceholders(SS_HTTPRequest $r) {
		$json = array (
			'pdf' => 'pdf',
			'jpeg' => 'image',
			'png' => 'image',
			'gif' => 'image',
			'jpg' => 'image',
			'xls' => 'xls',
			'xlsx' => 'xls',
			'mov' => 'mov',
			'zip' => 'zip',
			'doc' => 'doc',
			'docx' => 'doc'
		);
		foreach(Config::inst()->get('File','app_categories') as $cat => $exts) {
			foreach($exts as $ext) {
				$json[$ext] = $cat;
			}
		}
		return new SS_HTTPResponse(Convert::array2json($json));
	}



	public function FolderBreadcrumbs() {
		$list = array ();
		$folder = $this->currentFolder;
		while($folder) {
			$list [] = $folder;
			$folder = $folder->Parent;
		}
		if(!$this->isRoot()) {
			$list[] = $this->createRootFolder();
		}
		$crumbs = array_reverse($list);
		$set = ArrayList::create($crumbs);
		return $set;
	}



	public function getCurrentFolder() {
		return $this->currentFolder;
	}




	public function createRootFolder() {
		return Folder::create(array(
			'ID' => 0,
			'Name' => ASSETS_DIR
		));
	}



	public function isRoot() {
		return !$this->currentFolder->exists();
	}


	public function canView($member = null) {
		return Permission::check("CMS_ACCESS_CMSMain");
	}

	public function Link($action = null) {
		$link = parent::Link($action);
		if (strpos($link, "?locale=") > 0) {
			$link = preg_replace("/\?locale=([A-Za-z_]+)/", "", $link);
		}

		return $link;
	}

}



class KickAssets_FileRequest extends RequestHandler {

	static $allowed_actions = array (
		'EditForm',
		'doFileSave'
	);


	protected $file;


	public function __construct(File $f) {
		$this->file = $f;
		parent::__construct();
	}



	public function index(SS_HTTPRequest $r) {
		return $this->renderWith('KickAssetsEditForm');
	}



	public function Link($action = null) {
		return Controller::join_links(
			Injector::inst()->get("KickAssets")->Link(),
			"editkickassetsfile",
			$this->file->ID,
			$action
		);
	}




	public function EditForm() {
		return Form::create(
			$this,
			"EditForm",
			$this->file->getCMSFields(),
			FieldList::create(
				FormAction::create("doFileSave",_t('KickAssets.SAVE','Save'))
					->addExtraClass("ss-ui-button ss-ui-action-constructive"),
				FormAction::create("doFileCancel", _t('KickAssets.CANCEL','Cancel'))
			)
		)
		->loadDataFrom($this->file);
	}



	public function doFileSave($data, $form) {
		$form->saveInto($this->file);
		$this->file->write();

		if($this->file instanceof Image) {
			$this->file->deleteFormattedImages();
		}
		return new SS_HTTPResponse(_t('KickAssets.FILEUPDATED','File updated'));
	}
}
