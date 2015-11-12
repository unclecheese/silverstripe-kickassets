import request from 'superagent';
import Config from '../stores/Config';

const TIMEOUT = 10000;
const _pendingRequests = {};
const _errorHandlers = {};
const _loadingHandlers = {};
const _endHandlers = {};

function abortPendingRequests(key) {
    if (_pendingRequests[key]) {
        _pendingRequests[key]._callback = () => {};
        _pendingRequests[key].abort();
        _pendingRequests[key] = null;	
    }
}

function makeUrl(part) {
    return Config.get('baseRoute') + part;
}

// a get request with an authtoken param
function get(url, data) {     
    return request
        .get(url)
        .query(data || {})
        .timeout(TIMEOUT);
}

function post(url, data) {
    return request        
        .post(url)
        .type('form')
        .send(data || {})
        .timeout(TIMEOUT);
}

function put(url, data) {	
    return request        
        .put(url)
        .type('form')
        .send(data || {})
        .timeout(TIMEOUT);
}

function del(url, data) {
	return request
		.del(url)
		.type('form')
		.send(data || {})
		.timeout(TIMEOUT);
}



export default {
    
    getFolderContents (id, params) {
        const url = makeUrl(`folder/${id}`);
        const key = 'GET_FOLDER';
        abortPendingRequests(key);

        return _pendingRequests[key] = get(url, params);
    },

    getRecentItems (params) {
        const url = makeUrl(`recent`);
        const key = 'GET_FOLDER';
        abortPendingRequests(key);

        return _pendingRequests[key] = get(url, params);
    },

    createFolder (parentID, folderData) {
    	const url = makeUrl('folder');
    	const key = 'CREATE_FOLDER';
        abortPendingRequests(key);

    	folderData.parentID = parentID;

    	return _pendingRequests[key] = post(url, folderData);
    },


    updateFile (fileID, data) {
    	const url = makeUrl('file/'+fileID);
    	const key = 'UPDATE_FILE';
    	abortPendingRequests(key);

    	return _pendingRequests[key] = put(url, data);
    },


    deleteItems (items) {
    	const url = Config.get('baseRoute');
    	const key = 'DELETE_ITEMS';
        abortPendingRequests(key);

    	return _pendingRequests[key] = del(url, {ids: items});
    },


    getFileDetail (fileID) {
    	const url = makeUrl('file/'+fileID);
    	const key = 'FILE_DETAIL';
    	abortPendingRequests(key);
    	
    	return _pendingRequests[key] = get(url);
    },


    findByTerm (search) {
    	const url = Config.get('baseRoute');
    	const key = 'SEARCH';
    	abortPendingRequests(key);

    	return _pendingRequests[key] = get(url, {search});
    },


    findFolder (term) {
    	const url = makeUrl(`?search=${term}&type=folder`);
    	const key = 'SEARCH';
    	abortPendingRequests(key);

    	return _pendingRequests[key] = get(url);
    },

    getFolders () {
    	const url = makeUrl('folders');
    	const key = 'FOLDERS';
    	abortPendingRequests(key);

    	return _pendingRequests[key] = get(url);
    },

    moveItems (newFolder, ids) {    	
    	const url = makeUrl('move');
    	const key = 'MOVE';
    	abortPendingRequests(key);

    	return _pendingRequests[key] = put(url, {
    		newFolder, 
    		ids: ids.join(',')
    	});
    }
};