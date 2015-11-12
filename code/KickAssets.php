<?php

/**
 * API for the KickAssets UI. Although this is a subclass of LeftAndMain,
 * there is no LeftAndMain template for it. Rather, it is just a backend,
 * and LeftAndMain is inherited to provide consistentcy, i.e. with permissions
 */
class KickAssets extends LeftAndMain {

	/**
	 * The size of the generic file icons, in pixels
	 * 
	 * @var int 
	 */
	const ICON_SIZE = 64;

	/**
	 * The width of images, in pixels
	 * 
	 * @var int 
	 */
	const IMAGE_WIDTH = 198;

	/**
	 * The height of images, in pixels
	 * 
	 * @var int 
	 */
	const IMAGE_HEIGHT = 132;

	/**
	 * The fake extension to use for folders, in order to get them sorted first.
	 * 
	 * @var string
	 */
	const FOLDER_EXTENSION = ' ';

	/**
	 * The title for the menu in the left panel
	 * 
	 * @var string
	 */
	private static $menu_title = 'Browse files...';

	/**
	 * The URLSegment that resolves to KickAssets admin
	 * 
	 * @var string
	 */
	private static $url_segment = 'kickassets';

	/**
	 * URL handlers for various endpoints
	 * 
	 * @var array
	 */
	private static $url_handlers = array (
		'GET folder/$FolderID' => 'handleFolderContents',
		'GET recent' => 'handleRecentItems',
		'POST folder' => 'handleCreateFolder',
		'GET folders' => 'handleFolders',
		'PUT move' => 'handleMove',
		'upload/$FolderID' => 'handleUpload',
		'file/$FileID' => 'handleFile',
		'GET $Action/$ID/$OtherID' => 'handleIndex',		
		'DELETE ' => 'handleDelete',
		'GET ' => 'handleIndex'		
	);

	/**
	 * Allowed actions for endpoints
	 * 
	 * @var array
	 */
	private static $allowed_actions = array (
		'handleFolderContents',
		'handleRecentItems',
		'handleCreateFolder',
		'handleFolders',
		'handleFile',
		'handleIndex',
		'handleUpload',
		'handleDelete',
		'handleSearch',
		'handleMove',
	);

	/**
	 * Strips the assets directory from the beginning of a folder name
	 * 
	 * @param  string $filename
	 * @return string
	 */
	public static function remove_assets_dir($filename) {
		return preg_replace('/^'.ASSETS_DIR.'\//', '', $filename);
	}

	/**
	 * Defines the canView permission
	 * 
	 * @param  Member $member
	 * @return bool
	 */
	public function canView($member = null) {
		if(!$member && $member !== FALSE) $member = Member::currentUser();
				
		if(!$member) return false;
				
		return Permission::checkMember($member, "CMS_ACCESS_AssetAdmin");
	}	

	/**
	 * Bootstraps the module, adds JavaScript
	 */
	public function init() {	
		parent::init();

		Requirements::clear();
		Requirements::css(KICKASSETS_DIR.'/javascript/build/main.css');
		Requirements::add_i18n_javascript(KICKASSETS_DIR.'/lang');
		$js = $this->config()->js_file;

    	Requirements::javascript(KICKASSETS_DIR."/javascript/build/$js");
		Requirements::clear_combined_files();		
	}

	/**
	 * Index action, renders the main template
	 * 
	 * @param  SS_HTTPRequest $request
	 * @return SSViewer
	 */
	public function handleIndex($r) {		
		if($r->getVar('search') !== null) {			
			return $this->handleSearch($r);
		}

		return $this->renderWith('KickAssets');
	}

	/**
	 * Gets the contents of a folder, and applies a sort. Splits the response
	 * into folder metadata and folder children
	 * 
	 * @param  SS_HTTPRequest $r
	 * @return SS_HTTPResponse
	 */
	public function handleFolderContents(SS_HTTPRequest $r) {
		if(!$r->param('FolderID')) {
			$folder = Injector::inst()->get('Folder');
			$folder->Filename = ASSETS_DIR;
		}
		else {
			$folder = Folder::get()->byID($r->param('FolderID'));
		}

		if(!$folder) {
			return $this->httpError(404, 'That folder does not exist');
		}

		$cursor = (int) $r->getVar('cursor');
		$result = array (
			'folder' => $this->createFolderJSON($folder),
			'breadcrumbs' => $this->createBreadcrumbJSON($folder),
			'children' => array ()
		);
				
		$files = File::get()
					->filter(array(
						'ParentID' => $folder->ID
				 	))
				 	->sort($this->getSortClause($r->getVar('sort')));				 	
		
		$totalFiles = (int) $files->count();		
		$files = $files->limit($this->config()->folder_items_limit, $cursor);
		
		foreach($files as $file) {
			if(!$file->canView()) continue;
			
			$result['children'][] = ($file instanceof Folder) ? 
									$this->createFolderJSON($file) : 
									$this->createFileJSON($file, $folder);			
		}

		$cursor += $files->count();
		$result['cursor'] = $cursor;
		$result['has_more'] = ($cursor < $totalFiles);		
		$result['total_items'] = $totalFiles;

    	return (new SS_HTTPResponse(
    		Convert::array2json($result), 200
    	))->addHeader('Content-Type', 'application/json');

	}

	/**
	 * Gets recently updated items
	 * 
	 * @param  SS_HTTPRequest $r
	 * @return SS_HTTPResponse
	 */
	public function handleRecentItems(SS_HTTPRequest $r) {
		$result = array ();

		$fileIDs = File::get()
				 	->sort('LastEdited', 'DESC')
				 	->limit($this->config()->recent_items_limit)
				 	->column('ID');				 	
		
		if(!empty($fileIDs)) {
			$files = File::get()
				 	->sort($this->getSortClause($r->getVar('sort')))
				 	->byIDs($fileIDs);

			foreach($files as $file) {
				if(!$file->canView()) continue;
				
				$result[] = ($file instanceof Folder) ? 
								$this->createFolderJSON($file) : 
								$this->createFileJSON($file);
				
			}
		}

    	return (new SS_HTTPResponse(
    		Convert::array2json($result), 200
    	))->addHeader('Content-Type', 'application/json');
	}

	/**
	 * Creates a folder, ensures uniqueness
	 * 
	 * @param  SS_HTTPRequest $r
	 * @return SS_HTTPResponse
	 */
	public function handleCreateFolder(SS_HTTPRequest $r) {

		if(!Injector::inst()->get('Folder')->canCreate()) return $this->httpError(403);

		$parentID = (int) $r->postVar('parentID');
		$parentRecord = Folder::get()->byID($parentID);
		$name = $r->postVar('title') ? $r->postVar('title') : _t('AssetAdmin.NEWFOLDER',"NewFolder");

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

		$record->write();

		return (new SS_HTTPResponse(
			Convert::array2json($this->createFolderJSON($record))
		))->addHeader('Content-Type','application/json');
	}

	/**
	 * Handles a specific file request
	 * 
	 * @param  SS_HTTPRequest $rq
	 * @return KickAssets_FileRequest
	 */
	public function handleFile(SS_HTTPRequest $r) {
		$file = File::get()->byID($r->param('FileID'));
		if($file) {
			$request = new KickAssets_FileRequest($this, $file);

			return $request->handlerequest($r, DataModel::inst());
		}

		return $this->httpError(404, 'File does not exist');
	}

	/**
	 * Gets a list of all the folders in the system
	 * 
	 * @param  SS_HTTPRequest $r
	 * @return SS_HTTPResponse
	 */
	public function handleFolders(SS_HTTPRequest $r) {
		$response = array ();
		
		foreach(Folder::get() as $f) {
			$response[] = array (
				'id' => $f->ID,
				'filename' => $f->Filename
			);
		}

		return (new SS_HTTPResponse(
			Convert::array2json($response)
		))->addHeader('Content-Type','application/json');		
	}

	/**
	 * The endpoint for file uploads. Hands off to Dropzone module
	 * 
	 * @param  SS_HTTPRequest $r
	 * @return SS_HTTPResponse
	 */
	public function handleUpload(SS_HTTPRequest $r) {
		$r->setUrl('upload');
		$folder = Folder::get()->byID($r->param('FolderID'));
		$uploader = FileAttachmentField::create('dummy');

		
		if($folder) {
			$uploader->setFolderName(self::remove_assets_dir($folder->Filename));
		}
		else {
			$uploader->setFolderName('/');
		}

		$httpResponse = $uploader->handleRequest($r, DataModel::inst());
		
		if($httpResponse->getStatusCode() !== 200) {
			return $httpResponse;
		}
		
		$ids = $httpResponse->getBody();
		$files = File::get()->byIDs(explode(',', $ids));
		$response = array ();

		foreach($files as $f) {
			$response[] = $this->createFileJSON($f, $folder);
		}

		return (new SS_HTTPResponse(
			Convert::array2json($response)
		))->addHeader('Content-Type','application/json');
	}

	/**
	 * Deletes a list of files
	 * 
	 * @param  SS_HTTPRequest $r
	 * @return SS_HTTPResponse
	 */
	public function handleDelete(SS_HTTPRequest $r) {
		parse_str($r->getBody(), $vars);
		$count = 0;
		if($vars['ids']) {
			foreach(explode(',',$vars['ids']) as $id) {
				if($file = File::get()->byID($id)) {
					if($file->canDelete()) {
						$file->delete();
						$count++;
					}
				}
			}
		}
		return (new SS_HTTPResponse(
			Convert::array2json(array(
				'deleted' => $count
			))
		))->addHeader('Content-Type','application/json');

	}

	/**
	 * Searches for files by PartialMatch
	 * 
	 * @param  SS_HTTPRequest $r
	 * @return SS_HTTPResponse
	 */
	public function handleSearch(SS_HTTPRequest $r) {

		if($r->getVar('search') === null) return;

		$results = array ();
		$list = File::get()->filterAny(array(
			'Title:PartialMatch' => $r->getVar('search'),
			'Filename:PartialMatch' => $r->getVar('search')
		))->limit(100);
		
		foreach($list as $item) {
			if(!$item->canView()) continue;
			$results[] = $item instanceof Folder ? $this->createFolderJSON($item) : $this->createFileJSON($item);
		}

		return (new SS_HTTPResponse(
			Convert::array2json($results)
		))->addHeader('Content-Type','application/json');
	}

	/**
	 * Creates a JSON string of all the variables that can be set in the Config
	 *
	 * @return string
	 */
	public function JSONConfig() {
		$r = $this->request;

		// Remove null values and normalise leading dot
		$exts = array_map(function($item) {
				return $item[0] == '.' ? $item : '.'.$item;
		}, array_filter(
			File::config()->allowed_extensions,
			'strlen'
		));
		
		$types = explode(',',$r->getVar('allowedTypes'));
		
		return Convert::array2json(array(
			'baseRoute' => $this->Link(),
			'maxFilesize' => FileAttachmentField::get_filesize_from_ini(),
			'allowedExtensions' => implode(',', $exts),
			'thumbnailsDir' => DROPZONE_DIR.'/images/file-icons',			
			'langNewFolder' => _t('AssetAdmin.NEWFOLDER','NewFolder'),
			'iconSize' => self::ICON_SIZE,
			'thumbnailWidth' => self::IMAGE_WIDTH,
			'thumbnailHeight' => self::IMAGE_HEIGHT,
			'defaultSort' => $this->config()->default_sort,
			'defaultView' => $this->config()->default_view,
			'maxCacheSize' => $this->config()->max_cache_size,
			'folderExtension' => self::FOLDER_EXTENSION,

			'allowSelection' => (boolean) $r->getVar('allowSelection'),
			'maxSelection' => (int) $r->getVar('maxSelection'),
			'canUpload' => (boolean) $r->getVar('canUpload'),
			'canDelete' => (boolean) $r->getVar('canDelete'),
			'canEdit' => (boolean) $r->getVar('canEdit'),
			'canCreateFolder' => (boolean) $r->getVar('canCreateFolder'),
			'allowedTypes' => !empty($types) ? $types : null
		));
	}

	/**
	 * Moves a list of files ('ids') to a new folder ('newFolder' named file path or ID)
	 * If newFolder is a string, the folder will be created if it doesn't exist.
	 * 	
	 * @param  SS_HTTPRequest $r
	 * @return SS_HTTPResponse
	 */
	public function handleMove(SS_HTTPRequest $r) {
		parse_str($r->getBody(), $vars);

		if(!isset($vars['ids'])) return $this->httpError(400,'No ids provided');
		if(!isset($vars['newFolder'])) return $this->httpError(400, 'No new folder provided');

		if(is_numeric($vars['newFolder'])) {
			$folderID = $vars['newFolder'];
		}
		else if(!empty($vars['newFolder'])) {
			if(!Injector::inst()->get('folder')->canCreate()) {
				return $this->httpError(403, 'Cannot create folder: ' . $vars['newFolder']);
	
			}
			$folderID = Folder::find_or_make(self::remove_assets_dir($vars['newFolder']))->ID;
		}

		$files = File::get()->byIDs(explode(',',$vars['ids']));

		foreach($files as $file) {
			if(!$file->canEdit()) return $this->httpError(403,'Cannot edit file: ' . $file->Filename);

			$file->ParentID = $folderID;
			$file->write();
		}

		return new SS_HTTPResponse('OK', 200);
	}
	
	/**
	 * Given a Folder object, create an array of its properties and values
	 * ready to be transformed to JSON
	 * 	
	 * @param  Folder $folder
	 * @return array
	 */
	public function createFolderJSON(Folder $folder) {
		$size = self::ICON_SIZE;
		$file = Injector::inst()->get('File');

		return array (
			'id' => $folder->ID,
			'parentID' => $folder->ParentID,
			'title' => $folder->Title,
			'filename' => $folder->Filename,
			'type' => 'folder',
			'extension' => self::FOLDER_EXTENSION,
			'created' => $folder->Created,
			'iconURL' => $folder->getPreviewThumbnail($size, $size)->URL,
			'canEdit' => $folder->canEdit(),
			'canCreate' => $folder->canCreate(),
			'canDelete' => $folder->canDelete(),
			'canUpload' => $folder->canEdit() && $file->canCreate()
		);
	}

	/**
	 * Given a File object, create an array of its properties and values
	 * ready to be transformed to JSON
	 * 	
	 * @param  Folder $folder
	 * @return array
	 */
	public function createFileJSON(File $file, $folder = null) {
		$isImage = $file instanceof Image;
		$w = $isImage ? self::IMAGE_WIDTH : self::ICON_SIZE;
		$h = $isImage ? self::IMAGE_HEIGHT : self::ICON_SIZE;
		$folder = $folder ?: $file->Parent();

		return array (
			'id' => $file->ID,
			'parentID' => $file->ParentID,
			'title' => $file->Title,
			'filename' => basename($file->Filename),
			'folderName' => $folder->Filename,
			'type' => $isImage ? 'image' : 'file',
			'extension' => $file->getExtension(),
			'created' => $file->Created,
			'updated' => $file->LastEdited,
			'iconURL' => $file->getPreviewThumbnail($w, $h)->URL,
			'canEdit' => $file->canEdit(),
			'canCreate' => $file->canCreate(),
			'canDelete' => $file->canDelete()
		);		
	}

	/**
	 * Creates an array of breadcrumbs for a given Folder, ready to be
	 * transformed to JSON
	 * 
	 * @param  Folder $folder 
	 * @return array
	 */
	protected function createBreadcrumbJSON(Folder $folder) {
		$breadcrumbs = array();
		while($folder->exists()) {
			$breadcrumbs[] = array (
				'title' => $folder->Title,
				'id' => $folder->ID
			);

			$folder = $folder->Parent();
		}
		$breadcrumbs[] = array (
			'title' => ASSETS_DIR,
			'id' => 0
		);

		return array_reverse($breadcrumbs);
	}

	/**
	 * Given a sort field, generate a string of SQL to apply the sort
	 * 
	 * @param  string $sort
	 * @return string
	 */
	protected function getSortClause($sort) {
		$folder = "ClassName != 'Folder' ASC";
		$case = "CASE WHEN ClassName='Folder' THEN '".self::FOLDER_EXTENSION."' ELSE SUBSTRING_INDEX(Filename,'.',-1) END";
		
		switch($sort) {
			case 'az':
				return "$folder, Title ASC";
			case 'za':
				return "$folder, Title DESC";
			case 'oldest':
				return "$folder, Created ASC";
			case 'newest':
				return "$folder, Created DESC";
			case 'latest':
				return "$folder, LastEdited DESC";
			case 'kind':
				return "$folder, $case ASC";
			case 'kinddesc':
				return "$folder, $case DESC";
			default:
				return "$folder, Created DESC";
		}
	}
}

/**
 * A subcontroller designed to deal with the CRUD for a specific file
 *
 * @package  unclecheese/silverstripe-kickassets
 * @author  Uncle Cheese <unclecheese@leftandmain.com>
 */
class KickAssets_FileRequest extends RequestHandler {

	/**
	 * A list of various endpoints
	 * 
	 * @var array
	 */
	private static $url_handlers = array (
		'GET ' => 'handleRead',
		'PUT ' => 'handleUpdate',
		'DELETE ' => 'handleDelete'
	);

	/**
	 * A list of allowed controller actions
	 * 
	 * @var array
	 */
	private static $allowed_actions = array (
		'handleRead',
		'handleUpdate',
		'handleDelete'
	);

	/**
	 * The parent controller
	 * 
	 * @var KickAssets
	 */
	protected $parent;

	/**
	 * The file that this controller will be editing/reading/deleting
	 * 
	 * @var File
	 */
	protected $file;

	/**
	 * Constructor, sets the parent and file
	 * 
	 * @param KickAssets $parent
	 * @param File       $file
	 */
	public function __construct(KickAssets $parent, File $file) {
		parent::__construct();
		$this->parent = $parent;
		$this->file = $file;	
	}

	/**
	 * Serves up the details for the file bound to this controller
	 * 
	 * @param  SS_HTTPRequest $r
	 * @return SS_HTTPResponse
	 */
	public function handleRead(SS_HTTPRequest $r) {
		if(!$this->file->canView()) return $this->httpError(403);

		return $this->JSONResponse($this->buildJSON());
	}	

	/**
	 * Applies edits to the file bound to this controller
	 * 
	 * @param  SS_HTTPRequest $r
	 * @return SS_HTTPResponse
	 */
	public function handleUpdate(SS_HTTPRequest $r) {
		if(!$this->file->canEdit()) return $this->httpError(403);

		parse_str($r->getBody(), $vars);
		
		if(isset($vars['parentID'])) {
			$this->file->ParentID = $vars['parentID'];
			$this->file->write();
		}
		$this->file->Title = $vars['title'];
		if(isset($vars['filename']) && !empty($vars['filename'])) {
			$this->file->Filename = $this->file->Parent()->Filename.'/'.$vars['filename'];
		}
		$this->file->write();			

		return $this->JSONResponse($this->buildJSON());
	}

	/**
	 * Deletes the file bound to this controller
	 * 	
	 * @param  SS_HTTPRequest $r
	 * @return SS_HTTPResponse
	 */
	public function handleDelete(SS_HTTPRequest $r) {
		if(!$this->file->canDelete()) return $this->httpError(403);

		$this->file->delete();

		return new SS_HTTPResponse('OK');
	}

	/**
	 * Adds new properties to the parent (KickAssets) file JSON
	 * 
	 * @return array
	 */
	protected function buildJSON() {
		$json = $this->parent->createFileJSON($this->file);
		$json['created'] = $this->file->obj('Created')->FormatFromSettings();
		$json['lastEdited'] = $this->file->obj('LastEdited')->FormatFromSettings();
		$json['url'] = $this->file->getAbsoluteURL();

		$json['size'] = $this->file->getSize();
		$json['folder'] = $this->file->Parent()->Filename;

		if($this->file instanceof Image) {
			$json['previewImage'] = $this->file->CroppedImage(400, 133)->URL;
			$json['detailImage'] = $this->file->getKickAssetsDetailImage()->URL;
		}

		return $json;
	}

	/**
	 * Helper method for generating an HTTPResponse based on given JSON
	 * 
	 * @param array $json
	 */
	protected function JSONResponse($json = null) {
		if(!$json) {
			$json = $this->file instanceof Folder ? $this->parent->createFolderJSON($this->file)
												  : $this->parent->createFileJSON($this->file);
		}
		return (new SS_HTTPResponse(
			Convert::array2json($json)
		))->addHeader('Content-Type','application/json');		
	}
}