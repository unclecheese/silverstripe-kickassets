<?php

/**
 * API for the KickAssets UI. Although this is a subclass of LeftAndMain,
 * there is no LeftAndMain template for it. Rather, it is just a backend,
 * and LeftAndMain is inherited to provide consistentcy, i.e. with permissions
 */
class KickAssets extends LeftAndMain
{
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
    private static $url_handlers = array(
        'GET folder/$FolderID' => 'handleFolderContents',
        'GET recent' => 'handleRecentItems',
        'POST folder' => 'handleCreateFolder',
        'GET folders' => 'handleFolders',
        'PUT move' => 'handleMove',
        'upload/$FolderID' => 'handleUpload',
        'file/$FileID' => 'handleFile',
        'GET $Action/$ID/$NestedAction/$OtherID' => 'handleIndex',
        'GET $Action/$ID/$OtherID' => 'handleIndex',
        'DELETE ' => 'handleDelete',
        'GET ' => 'handleIndex'
    );

    /**
     * Allowed actions for endpoints
     *
     * @var array
     */
    private static $allowed_actions = array(
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
     * Icon for the CMS menu
     * @var string
     */
    private static $menu_icon = 'kickassets/images/icon.png';

    /**
     * Strips the assets directory from the beginning of a folder name
     *
     * @param  string $filename
     * @return string
     */
    public static function remove_assets_dir($filename)
    {
        return preg_replace('/^' . ASSETS_DIR . '\//', '', $filename);
    }

    /**
     * Defines the canView permission
     *
     * @param  Member $member
     * @return bool
     */
    public function canView($member = null)
    {
        if (!$member && $member !== false) {
            $member = Member::currentUser();
        }

        if (!$member) {
            return false;
        }

        return Permission::checkMember($member, "CMS_ACCESS_AssetAdmin");
    }

    /**
     * Bootstraps the module, adds JavaScript
     */
    public function init()
    {
        parent::init();

        Requirements::clear();
        Requirements::css(KICKASSETS_DIR . '/javascript/build/main.css');
        Requirements::add_i18n_javascript(KICKASSETS_DIR . '/lang');
        $js = $this->config()->js_file;

        Requirements::javascript(KICKASSETS_DIR . "/javascript/build/$js");
        Requirements::clear_combined_files();
    }

    /**
     * Index action, renders the main template
     *
     * @param  SS_HTTPRequest $request
     * @return HTMLText|SS_HTTPResponse
     */
    public function handleIndex($request)
    {
        if ($request->getVar('search') !== null) {
            return $this->handleSearch($request);
        }

        return $this->renderWith('KickAssets');
    }

    /**
     * Gets the contents of a folder, and applies a sort. Splits the response
     * into folder metadata and folder children
     *
     * @param  SS_HTTPRequest $request
     * @return SS_HTTPResponse
     */
    public function handleFolderContents(SS_HTTPRequest $request)
    {
        if (!$request->param('FolderID')) {
            $folder = Injector::inst()->get('Folder');
            $folder->Filename = ASSETS_DIR;
        } else {
            $folder = Folder::get()->byID($request->param('FolderID'));
        }

        if (!$folder) {
            return $this->httpError(404, 'That folder does not exist');
        }

        $cursor = (int)$request->getVar('cursor');
        $result = array(
            'folder' => $this->createFolderJson($folder),
            'breadcrumbs' => $this->createBreadcrumbJson($folder),
            'children' => array()
        );

        $files = File::get()
            ->filter(array(
                'ParentID' => $folder->ID
            ))
            ->sort($this->getSortClause($request->getVar('sort')));

        $totalFiles = (int)$files->count();
        $files = $files->limit($this->config()->folder_items_limit, $cursor);

        foreach ($files as $file) {
            if (!$file->canView()) {
                continue;
            }

            $result['children'][] = ($file instanceof Folder) ?
                $this->createFolderJson($file) :
                $this->createFileJson($file, $folder);
        }

        $cursor += $files->count();
        $result['cursor'] = $cursor;
        $result['has_more'] = ($cursor < $totalFiles);
        $result['total_items'] = $totalFiles;

        $response = new SS_HTTPResponse(
            Convert::array2json($result), 200
        );

        return $response->addHeader('Content-Type', 'application/json');
    }

    /**
     * Gets recently updated items
     *
     * @param  SS_HTTPRequest $request
     * @return SS_HTTPResponse
     */
    public function handleRecentItems(SS_HTTPRequest $request)
    {
        $result = array();

        $fileIDs = File::get()
            ->sort('LastEdited', 'DESC')
            ->limit($this->config()->recent_items_limit)
            ->column('ID');

        if (!empty($fileIDs)) {
            $files = File::get()
                ->sort($this->getSortClause($request->getVar('sort')))
                ->byIDs($fileIDs);

            foreach ($files as $file) {
                if (!$file->canView()) {
                    continue;
                }

                $result[] = ($file instanceof Folder) ?
                    $this->createFolderJson($file) :
                    $this->createFileJson($file);

            }
        }

        $response = new SS_HTTPResponse(
            Convert::array2json($result), 200
        );

        return $response->addHeader('Content-Type', 'application/json');
    }

    /**
     * Creates a folder, ensures uniqueness
     *
     * @param  SS_HTTPRequest $request
     * @return SS_HTTPResponse
     */
    public function handleCreateFolder(SS_HTTPRequest $request)
    {

        if (!Injector::inst()->get('Folder')->canCreate()) {
            return $this->httpError(403);
        }

        $parentID = (int)$request->postVar('parentID');

        /** @var Folder $parentRecord */
        $parentRecord = Folder::get()->byID($parentID);

        $name = $request->postVar('title') ? $request->postVar('title') : _t('AssetAdmin.NEWFOLDER', "NewFolder");
        if ($parentRecord && $parentRecord->ID) {
            $filename = Controller::join_links($parentRecord->FullPath, $name);
        } else {
            $filename = Controller::join_links(ASSETS_PATH, $name);
        }

        /** @var Folder $record */
        $record = Folder::create(array(
            'ParentID' => $parentID,
            'Name' => basename($filename),
            'Title' => basename($filename),
            'Filename' => $filename
        ));

        // Ensure uniqueness
        $i = 2;
        if (substr($record->Filename, -1) == "/") {
            $baseFilename = substr($record->Filename, 0, -1);
        } else {
            $baseFilename = $record->Filename;
        }
        $baseFilename .= "-";
        while (file_exists($record->FullPath)) {
            $record->Filename = $baseFilename . $i . '/';
            $i++;
        }

        $record->Name = $record->Title = basename($record->Filename);

        mkdir($record->FullPath);
        @chmod($record->FullPath, (int)Config::inst()->get('Filesystem', 'file_create_mask'));

        $record->write();

        $response = new SS_HTTPResponse(
            Convert::array2json($this->createFolderJson($record)), 200
        );

        return $response->addHeader('Content-Type', 'application/json');
    }

    /**
     * Handles a specific file request
     *
     * @param  SS_HTTPRequest $request
     * @return KickAssetsFileRequest|SS_HTTPResponse
     */
    public function handleFile(SS_HTTPRequest $request)
    {
        /** @var File $file */
        $file = File::get()->byID($request->param('FileID'));

        if ($file) {
            $fileRequest = new KickAssetsFileRequest($this, $file);

            return $fileRequest->handlerequest($request, DataModel::inst());
        }

        return $this->httpError(404, 'File does not exist');
    }

    /**
     * Gets a list of all the folders in the system
     *
     * @param  SS_HTTPRequest $request
     * @return SS_HTTPResponse
     */
    public function handleFolders(SS_HTTPRequest $request)
    {
        $result = array();

        foreach (Folder::get() as $folder) {
            $result[] = array(
                'id' => $folder->ID,
                'filename' => $folder->Filename
            );
        }

        $response = new SS_HTTPResponse(
            Convert::array2json($result), 200
        );

        return $response->addHeader('Content-Type', 'application/json');
    }

    /**
     * The endpoint for file uploads. Hands off to Dropzone module
     *
     * @param  SS_HTTPRequest $request
     * @return SS_HTTPResponse
     */
    public function handleUpload(SS_HTTPRequest $request)
    {
        $request->setUrl('upload');

        /** @var Folder $folder */
        $folder = Folder::get()->byID($request->param('FolderID'));

        /** @var FileAttachmentField $uploader */
        $uploader = FileAttachmentField::create('dummy');

        if ($folder) {
            $uploader->setFolderName(self::remove_assets_dir($folder->Filename));
        } else {
            $uploader->setFolderName('/');
        }

        /** @var SS_HTTPResponse $httpResponse */
        $httpResponse = $uploader->handleRequest($request, DataModel::inst());

        if ($httpResponse->getStatusCode() !== 200) {
            return $httpResponse;
        }

        $ids = $httpResponse->getBody();
        $files = File::get()->byIDs(explode(',', $ids));
        $result = array();

        foreach ($files as $f) {
            $result[] = $this->createFileJson($f, $folder);
        }

        $response = new SS_HTTPResponse(
            Convert::array2json($result), 200
        );

        return $response->addHeader('Content-Type', 'application/json');
    }

    /**
     * Deletes a list of files
     *
     * @param  SS_HTTPRequest $request
     * @return SS_HTTPResponse
     */
    public function handleDelete(SS_HTTPRequest $request)
    {
        parse_str($request->getBody(), $vars);
        $count = 0;
        if ($vars['ids']) {
            foreach (explode(',', $vars['ids']) as $id) {
                if ($file = File::get()->byID($id)) {
                    if ($file->canDelete()) {
                        $file->delete();
                        $count++;
                    }
                }
            }
        }

        $result = array(
            'deleted' => $count
        );

        $response = new SS_HTTPResponse(
            Convert::array2json($result), 200
        );

        return $response->addHeader('Content-Type', 'application/json');
    }

    /**
     * Searches for files by PartialMatch
     *
     * @param  SS_HTTPRequest $request
     * @return SS_HTTPResponse
     */
    public function handleSearch(SS_HTTPRequest $request)
    {

        if ($request->getVar('search') === null) {
            return null;
        }

        $result = array();
        $searchTerm = $request->getVar('search');
        $list = File::get()->filterAny(array(
            'Title:PartialMatch' => $searchTerm,
            'Filename:PartialMatch' => $searchTerm
        ))->limit(100);

        $this->extend('beforeHandleSearch', $list, $searchTerm);

        foreach ($list as $item) {
            if (!$item->canView()) {
                continue;
            }
            $result[] = $item instanceof Folder ? $this->createFolderJson($item) : $this->createFileJson($item);
        }

        $response = new SS_HTTPResponse(
            Convert::array2json($result), 200
        );

        return $response->addHeader('Content-Type', 'application/json');
    }

    /**
     * Creates a JSON string of all the variables that can be set in the Config
     *
     * @return string
     */
    public function jsonConfig()
    {
        $request = $this->request;

        // Remove null values and normalise leading dot
        $allExts = $request->getVar('allowedExtensions') ?
            explode(',', $request->getVar('allowedExtensions')) :
            File::config()->allowed_extensions;

        $exts = array_map(function ($item) {
            return $item[0] == '.' ? $item : '.' . $item;
        }, array_filter(
            $allExts,
            'strlen'
        ));

        $currentLinkParts = parse_url(Controller::join_links(Director::baseURL(), $this->Link()));
        $types = explode(',', $request->getVar('allowedTypes'));

        return Convert::array2json(array(
            'baseRoute' => $currentLinkParts['path'],
            'maxFilesize' => FileAttachmentField::get_filesize_from_ini(),
            'allowedExtensions' => implode(',', $exts),
            'thumbnailsDir' => DROPZONE_DIR . '/images/file-icons',
            'langNewFolder' => _t('AssetAdmin.NEWFOLDER', 'NewFolder'),
            'iconSize' => self::ICON_SIZE,
            'thumbnailWidth' => self::IMAGE_WIDTH,
            'thumbnailHeight' => self::IMAGE_HEIGHT,
            'defaultSort' => $this->config()->default_sort,
            'defaultView' => $this->config()->default_view,
            'maxCacheSize' => $this->config()->max_cache_size,
            'folderExtension' => self::FOLDER_EXTENSION,

            'allowSelection' => (boolean)$request->getVar('allowSelection'),
            'maxSelection' => (int)$request->getVar('maxSelection'),
            'canUpload' => (boolean)$request->getVar('canUpload'),
            'canDelete' => (boolean)$request->getVar('canDelete'),
            'canEdit' => (boolean)$request->getVar('canEdit'),
            'canCreateFolder' => (boolean)$request->getVar('canCreateFolder'),
            'allowedTypes' => !empty($types) ? $types : null
        ));
    }

    /**
     * Moves a list of files ('ids') to a new folder ('newFolder' named file path or ID)
     * If newFolder is a string, the folder will be created if it doesn't exist.
     *
     * @param  SS_HTTPRequest $request
     * @return SS_HTTPResponse
     */
    public function handleMove(SS_HTTPRequest $request)
    {
        parse_str($request->getBody(), $vars);

        if (!isset($vars['ids'])) {
            return $this->httpError(400, 'No ids provided');
        }
        if (!isset($vars['newFolder'])) {
            return $this->httpError(400, 'No new folder provided');
        }

        $folderID = null;

        if (is_numeric($vars['newFolder'])) {
            $folderID = $vars['newFolder'];
        } else if (!empty($vars['newFolder'])) {
            if (!Injector::inst()->get('folder')->canCreate()) {
                return $this->httpError(403, 'Cannot create folder: ' . $vars['newFolder']);

            }
            $folderID = Folder::find_or_make(self::remove_assets_dir($vars['newFolder']))->ID;
        }

        $files = File::get()->byIDs(explode(',', $vars['ids']));

        foreach ($files as $file) {
            if (!$file->canEdit()) {
                return $this->httpError(403, 'Cannot edit file: ' . $file->Filename);
            }

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
    public function createFolderJson(Folder $folder)
    {
        $size = self::ICON_SIZE;
        $file = Injector::inst()->get('File');

        return array(
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
     * @param File $file
     * @param Folder $folder
     * @return array
     */
    public function createFileJson(File $file, $folder = null)
    {
        $isImage = $file instanceof Image;
        $w = $isImage ? self::IMAGE_WIDTH : self::ICON_SIZE;
        $h = $isImage ? self::IMAGE_HEIGHT : self::ICON_SIZE;
        $folder = $folder ?: $file->Parent();

        return array(
            'id' => $file->ID,
            'parentID' => $file->ParentID,
            'title' => ($file->Title) ? $file->Title : basename($file->Filename),
            'filename' => basename($file->Filename),
            'path' => $file->Filename,
            'filesize' => $file->getAbsoluteSize(),
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
    protected function createBreadcrumbJson(Folder $folder)
    {
        $breadcrumbs = array();
        while ($folder->exists()) {
            $breadcrumbs[] = array(
                'title' => $folder->Title,
                'id' => $folder->ID
            );

            $folder = $folder->Parent();
        }
        $breadcrumbs[] = array(
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
    protected function getSortClause($sort)
    {
        $folder = "Case \"File\".\"ClassName\" when 'Folder' then '0' else \"File\".\"ClassName\" end";
        $case = "CASE WHEN ClassName='Folder' THEN '" . self::FOLDER_EXTENSION . "' ELSE SUBSTRING_INDEX(Filename,'.',-1) END";

        switch ($sort) {
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