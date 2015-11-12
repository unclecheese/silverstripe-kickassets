import Reflux from 'reflux';
import Actions from '../actions/Actions';
import Navigation from '../actions/Navigation';
import Sorter from '../utils/Sort';
import uuid from '../utils/uuid';
import Cache from './Cache';
import Immutable from 'immutable';
import Config from './Config';
import ImmutableStoreMixin from '../mixins/ImmutableStoreMixin';
import FolderDataStore from './FolderDataStore';

const _state = {
	data: Immutable.List(),
	folderID: null,
	sort: null,
	unsavedItems: false,
	loading: false,
	needsRefresh: false
};

const FolderItemsStore = Reflux.createStore({

	listenables: [
		Actions,
		Navigation
	],

	mixins: [ImmutableStoreMixin(_state)],

	onGetFolderItems (params) {
		let cached;
		const {folderID} = _state;

		if(!FolderDataStore.get('hasMore') && folderID === parseInt(params.folderID) && _state.sort !== params.sort) {
			_state.sort = params.sort;
			this._sortItems(params.sort);
			this.trigger();
			
			return;
		}

		_state.sort = params.sort;
		_state.loading = true;
		_state.needsRefresh = false;

		cached = Cache.retrieve(['folderItems', params.folderID]);
		
		if(cached) {			
			_state.data = cached.items;
			_state.folderID = params.folderID;
			if(cached.sort !== _state.sort) {
				this._sortItems(_state.sort);
			}
		}
		else {
			_state.data = _state.data.clear();
		}

		this.trigger();
	},

	onGetFolderItemsCompleted (data) {		
		_state.folderID = data.folder.id;
		_state.loading = false;

		this.replace('data', data.children);
		this.trigger();
		this.cache();
	},

	onGetRecentItems (params) {
		if(_state.folderID === 'recent' && _state.sort !== params.sort) {
			_state.sort = params.sort;
			this._sortItems(params.sort);
			this.trigger();
			
			return;
		}

		_state.sort = params.sort;
		_state.data = _state.data.clear();
		_state.needsRefresh = false;

		this.trigger();
	},

	onGetRecentItemsCompleted (data) {
		_state.folderID = 'recent';
		_state.loading = false;

		this.replace('data', data);
		this.trigger();
	},

	onConcatFolderItems () {
		_state.loading = true;

		this.trigger();
	},

	onConcatFolderItemsCompleted (data) {
		_state.loading = false;
		_state.data = _state.data.concat(Immutable.fromJS(data.children));
		
		this.trigger();
	},

	onAddFile (file, error) {
        file.uuid = uuid();
        _state.data = _state.data.unshift(Immutable.fromJS({
            id: file.uuid,
            title: file.name,
            type: file.type.match(/image\/(gif|jpeg|png)/) ? 'image' : 'file',
            isNew: true,
            iconURL: null,
            progress: null,
            error: error
        }));

        this.trigger();
        this.cache();
	},

	onInsertFolder () {
		const thumbDir = Config.get('thumbnailsDir');
		const iconSize = Config.get('iconSize');
		const folder = Immutable.fromJS({
			id: uuid(),
			title: Config.get('langNewFolder'),
			filename: '',
			type: 'folder',
			isNew: true,
			iconURL: `${thumbDir}/${iconSize}px/_folder.png`
		});

		_state.data = _state.data.unshift(folder);
		_state.unsavedItems = true;
		
		this.trigger();
		this.cache();
	},

	onEditItem (file, newData) {		
		this.updateItem(file.id, newData);
		this.cache();
	},

	onAlterItem (file, newData) {		
		this.updateItem(file.id, newData);
		this.cache();
	},

	onEditItemCompleted (data) {
		if(data.parentID != this.getCurrentFolderID()) {
			_state.data = _state.data.delete(this.indexForID(data.id));
			this.trigger();
		}
		else {
			this.updateItem(
				data.id,
				data
			);
		}

		this.cache();
	},

	onPersistFolderCompleted (data) {
		_state.data = _state.data.set(0, Immutable.fromJS(data));
		_state.unsavedItems = false;
		this.trigger();
		this.cache();
	},

	onDeleteItems (items) {
		_state.data = _state.data.filter(item => items.indexOf(item.get('id')) === -1);

		this.trigger();
		this.cache();
	},

	onReplaceItem (file, newData) {
		this.forID(file.id, index => {
			_state.data = _state.data.set(index, Immutable.fromJS(newData));
			this.trigger();
			this.cache();	
		});
	},

	_sortItems (sort) {	
		if(!sort) sort = _state.sort
		const s = Sorter[sort];
		
		if(s) {
			_state.data = _state.data.sort(s.func);
		}
	},

	getCurrentFolderID () {
		return _state.folderID;
	},

	onMoveItems (newParentID, ids) {		
		_state.data = _state.data.filter(item => ids.indexOf(item.get('id')) === -1);

		this.trigger();
		this.cache();
	},
	
	onBeginUploading () {
		if(!_state.unsavedItems) {
			_state.unsavedItems = true;
			this.trigger();
		}
	},

	onEndUploading () {
		if(_state.unsavedItems) {
			_state.unsavedItems = false;
			this.trigger();
			this.cache();
		}
	},

	onRefreshFolderItems () {
		_state.needsRefresh = true;
		this.trigger();
	},

	onClearFileError (fileData) {
		_state.data = _state.data.filterNot(item => item === fileData);
		
		this.trigger();
	},

	cache (folderID) {
		const folder = folderID || _state.folderID;
		Cache.store(['folderItems', folder], {
			items: _state.data,
			sort: _state.sort
		});		
	}

});

export default FolderItemsStore;