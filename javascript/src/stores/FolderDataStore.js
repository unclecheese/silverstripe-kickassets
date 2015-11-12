import Reflux from 'reflux';
import Actions from '../actions/Actions';
import Navigation from '../actions/Navigation';
import Cache from './Cache';
import Immutable from 'immutable';
import ImmutableStoreMixin from '../mixins/ImmutableStoreMixin';

const _state = {
	data: Immutable.Map(),
	totalItems: null,
	elapsedTime: null,
	hasMore: false,
	cursor: 0
};

const FolderDataStore = Reflux.createStore({

	listenables: [
		Actions,
		Navigation
	],
	
	mixins: [ImmutableStoreMixin(_state)],

	onGetFolderItems (id, sortType) {		
		let cached;

		_state.totalItems = null;
		_state.hasMore = false;
		
		if(cached = Cache.retrieve(['folderData', id])) {
			_state.data = cached;
		}

		this.trigger();
	},

	onGetFolderItemsCompleted (data) {		
		this.replace('data', data.folder);
		_state.totalItems = data.total_items;
		_state.hasMore = data.has_more;
		_state.cursor = data.cursor;

		this.trigger();

		Cache.store(
			['folderData', _state.data.get('id')], 
			_state.data
		);

	},

	onGetRecentItems (params) {
		_state.totalItems = null;
		_state.hasMore = false;

		this.trigger();
	},

	onConcatFolderItemsCompleted (data) {
		_state.hasMore = data.has_more;
		_state.cursor = data.cursor;

		this.trigger();
	}


});

export default FolderDataStore;