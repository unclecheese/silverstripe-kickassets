<?php

/**
 * A subcontroller designed to deal with the CRUD for a specific file
 *
 * @package  unclecheese/silverstripe-kickassets
 * @author  Uncle Cheese <unclecheese@leftandmain.com>
 */
class KickAssetsFileRequest extends RequestHandler
{
    /**
     * A list of various endpoints
     *
     * @var array
     */
    private static $url_handlers = array(
        'GET ' => 'handleRead',
        'PUT ' => 'handleUpdate',
        'DELETE ' => 'handleDelete'
    );

    /**
     * A list of allowed controller actions
     *
     * @var array
     */
    private static $allowed_actions = array(
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
     * @param File $file
     */
    public function __construct(KickAssets $parent, File $file)
    {
        parent::__construct();
        $this->parent = $parent;
        $this->file = $file;
    }

    /**
     * Serves up the details for the file bound to this controller
     *
     * @param  SS_HTTPRequest $request
     * @return SS_HTTPResponse
     */
    public function handleRead(SS_HTTPRequest $request)
    {
        if (!$this->file->canView()) {
            return $this->httpError(403);
        }

        return $this->jsonResponse($this->buildJSON());
    }

    /**
     * Applies edits to the file bound to this controller
     *
     * @param  SS_HTTPRequest $request
     * @return SS_HTTPResponse
     */
    public function handleUpdate(SS_HTTPRequest $request)
    {
        if (!$this->file->canEdit()) {
            return $this->httpError(403);
        }

        parse_str($request->getBody(), $vars);

        if (isset($vars['parentID'])) {
            $this->file->ParentID = $vars['parentID'];
            $this->file->write();
        }
        $this->file->Title = $vars['title'];
        if (isset($vars['filename']) && !empty($vars['filename'])) {
            $this->file->Filename = $this->file->Parent()->Filename . '/' . $vars['filename'];
        }
        $this->file->write();

        return $this->jsonResponse($this->buildJSON());
    }

    /**
     * Deletes the file bound to this controller
     *
     * @param  SS_HTTPRequest $request
     * @return SS_HTTPResponse
     */
    public function handleDelete(SS_HTTPRequest $request)
    {
        if (!$this->file->canDelete()) {
            return $this->httpError(403);
        }

        $this->file->delete();

        return new SS_HTTPResponse('OK');
    }

    /**
     * Adds new properties to the parent (KickAssets) file JSON
     *
     * @return array
     */
    protected function buildJSON()
    {
        $json = $this->parent->createFileJson($this->file);
        $json['created'] = $this->file->obj('Created')->FormatFromSettings();
        $json['lastEdited'] = $this->file->obj('LastEdited')->FormatFromSettings();
        $json['url'] = $this->file->getAbsoluteURL();

        $json['size'] = $this->file->getSize();
        $json['folder'] = $this->file->Parent()->Filename;

        if ($this->file instanceof Image) {
            $preview = $this->file->Fill(400, 133);
            $detail = $this->file->getKickAssetsDetailImage();
            $json['previewImage'] = $preview ? $preview->URL : $this->file->getPreviewThumbnail(128, 128)->URL;
            $json['detailImage'] = $detail ? $detail->URL : $this->file->getPreviewThumbnail(128, 128)->URL;
        }

        return $json;
    }

    /**
     * Helper method for generating an HTTPResponse based on given JSON
     *
     * @param array $json
     * @return SS_HTTPResponse
     */
    protected function jsonResponse($json = null)
    {
        if (!$json) {
            $json = $this->file instanceof Folder ? $this->parent->createFolderJson($this->file)
                : $this->parent->createFileJson($this->file);
        }

        $response = new SS_HTTPResponse(
            Convert::array2json($json), 200
        );

        return $response->addHeader('Content-Type', 'application/json');
    }
}
