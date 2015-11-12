import Reflux from 'reflux';
import Actions from '../actions/Actions';
import Navigation from '../actions/Navigation';
import Cache from './Cache';
import Immutable from 'immutable';
import ImmutableStoreMixin from '../mixins/ImmutableStoreMixin';

const _state = {
	data: Immutable.List(),
	currentFolderID: null
};

const BreadcrumbsStore = Reflux.createStore({

	listenables: [
		Actions,
		Navigation
	],
	
	mixins: [ImmutableStoreMixin(_state)],

	onGetFolderItems (params) {
		let cached;

		_state.currentFolderID = params.folderID;
		cached = Cache.retrieve(['breadcrumbs', _state.currentFolderID]);

		if(cached) {
			_state.data = cached;
			this.trigger();
		}

	},

	onGetFolderItemsCompleted (data) {
		this.replace('data', data.breadcrumbs);		
		this.trigger();

		Cache.store(
			['breadcrumbs', _state.currentFolderID], 
			_state.data
		);

	},

	onGetRecentItems () {
		_state.data = _state.data.clear();
		this.trigger();		
	}

});

export default BreadcrumbsStore;