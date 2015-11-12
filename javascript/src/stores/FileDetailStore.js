import Reflux from 'reflux';
import Actions from '../actions/Actions';
import Navigation from '../actions/Navigation';
import Immutable from 'immutable';
import ImmutableStoreMixin from '../mixins/ImmutableStoreMixin';
import FolderItemsStore from './FolderItemsStore';
import FolderListStore from './FolderListStore';
import uuid from '../utils/uuid';
const _state = {
	data: Immutable.Map(),
	fileID: null,
	loading: false,
	updated: false
};

const FileDetailStore = Reflux.createStore({

	listenables: [
		Actions,
		Navigation
	],

	mixins: [ImmutableStoreMixin(_state)],

	onShowItem (fileID) {
		const existing = FolderItemsStore.getByID(fileID);
		_state.updated = false;
		if(existing) {
			_state.fileID = fileID;		
			this.replace('data', existing);
			this.trigger();
		}
	},

	onShowItemCompleted (data) {
		_state.fileID = data.id;
		this.replace('data', data);
		
		this.trigger();
	},

	onEditItemCompleted (data) {
		_state.updated = true;	
		this.replace('data', data);

		this.trigger();
	},

	onGoToFolder (folderID) {
		_state.updated = false;
		_state.fileID = null;
		_state.data = Immutable.Map();	
	},

	onDeleteItems (items) {
		if(_state.fileID && items.indexOf(_state.fileID) > -1) {
			_state.fileID = null;
			_state.data = Immutable.Map();
			
			this.trigger();
		}
	},
	
	onReplaceDetailItem (file) {
        file.uuid = uuid();
        this.replace('data', {
            id: file.uuid,
            title: file.name,
            type: file.type.match(/image.*/) ? 'image' : 'file',
            isNew: true,
            iconURL: null,
            progress: null
        });

        this.trigger();
	},

	onAlterDetailItem (data) {		
		_state.data = _state.data.merge(data);

		this.trigger();
	}
});

export default FileDetailStore;