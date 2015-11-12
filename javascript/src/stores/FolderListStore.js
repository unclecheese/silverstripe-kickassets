import Reflux from 'reflux';
import Actions from '../actions/Actions';
import Immutable from 'immutable';
import ImmutableStoreMixin from '../mixins/ImmutableStoreMixin';

const _state = {
	data: Immutable.List()
};

const FolderListStore = Reflux.createStore({

	listenables: Actions,
	
	mixins: [ImmutableStoreMixin(_state)],

	onGetFoldersCompleted (data) {
		this.replace('data', data);
	},

	onEditItemCompleted (data) {
		this.updateItem(
			data.id,
			data
		);
	},

	onPersistFolderCompleted (data) {		
		_state.data = _state.data.push(Immutable.fromJS({
			filename: data.filename,
			id: data.id
		}));
		
		this.trigger();
	}

});

export default FolderListStore;