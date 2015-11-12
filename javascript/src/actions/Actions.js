import Reflux from 'reflux';
import API from '../utils/API';
import _t from '../utils/lang';

const Actions = Reflux.createActions({
	'getFolderItems': { asyncResult: true },
	'getRecentItems': { asyncResult: true },
	'concatFolderItems': { asyncResult: true },
	'getFolders': { asyncResult: true },	
	'editItem': { asyncResult: true },
	'showItem': { asyncResult: true },
	'persistFolder': { asyncResult: true },
	'deleteItems': { asyncResult: true },	
	'moveItems': { asyncResult: true },	
	'search': { asyncResult: true },

	'alterItem': {},
	'replaceItem': {},
	'throwError': {},
	'clearError': {},
	'addFile': {},
	'removeFile': {},
	'insertFolder': {},
	'activateMultiSelect': {},
	'deactivateMultiSelect': {},
	'toggleSelection': {},
	'groupSelect': {},
	'clearSelection': {},
	'beginUploading': {},
	'endUploading': {},
	'replaceDetailItem': {},
	'alterDetailItem': {},
	'setTotalProgress': {},
	'removeMoveItem': {},
	'refreshFolderItems': {},
	'clearFileError': {},
	'dragSelectedItems': {},
	'dragItem': {},
	'endDragging': {}

});

const responseHandler = (success) => {
    return (err, res) => {
        if (err || !res.ok) {
        	Actions.throwError(_t(
        		'KickAssets.GENERICERROR',
        		'<p>You may have found a bug.</p><p>If you have discovered a problem with this module, <a href=\"http://github.com/unclecheese/silverstripe-kickassets\">post an issue on the Github page.</a></p>'
        	));
        }
        else if(typeof success === 'function') {
        	success(res.body);
        }
    };	
};

/* Read actions */
Actions.getFolderItems.listen((params) => {
	if(params.folderID === null) return;

	API.getFolderContents(params.folderID, {
			sort: params.sort
		})
		.end(responseHandler(
			Actions.getFolderItems.completed
		));
});

Actions.getRecentItems.listen((params) => {
	API.getRecentItems(params)		
		.end(responseHandler(
			Actions.getRecentItems.completed
		));
});

Actions.concatFolderItems.listen((params, cursor = 0) => {
	if(params.folderID === null) return;

	API.getFolderContents(params.folderID, {
			sort: params.sort,
			cursor
		})
		.end(responseHandler(
			Actions.concatFolderItems.completed
		));
});

Actions.search.listen(term => {	
	if(!term) return;

	API.findByTerm(term)
		.end(responseHandler(
			Actions.search.completed
		));
});

Actions.getFolders.listen(() => {
	API.getFolders()
		.end(responseHandler(
			Actions.getFolders.completed
		));
});

Actions.showItem.listen(fileID => {
	API.getFileDetail(fileID)
		.end(responseHandler(
			Actions.showItem.completed
		));
});

/* Write actions */
Actions.editItem.listen((oldData, newData) => {
	API.updateFile(oldData.id, newData)
		.end(responseHandler(
			Actions.editItem.completed
		));
});

Actions.persistFolder.listen((parentID, newData) => {
	API.createFolder(parentID, newData)
		.end(responseHandler(
			Actions.persistFolder.completed
		));
});

Actions.deleteItems.listen((ids) => {
	API.deleteItems(ids)
		.end(responseHandler());
});

Actions.moveItems.listen((newFolder, ids) => {
	API.moveItems(newFolder, ids)
		.end(responseHandler(
			Actions.moveItems.completed
		));
});


export default Actions;