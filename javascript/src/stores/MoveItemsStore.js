import Reflux from 'reflux';
import ImmutableStoreMixin from '../mixins/ImmutableStoreMixin';
import Actions from '../actions/Actions';
import Navigation from '../actions/Navigation';
import Immutable from 'immutable';

const _state = {
	data: Immutable.List()
};

const MoveItemsStore = Reflux.createStore({

	listenables: [
		Actions,
		Navigation
	],

	mixins: [ImmutableStoreMixin(_state)],

	onGoToMoveItems (folderID, items) {
		_state.data = _state.data.clear().concat(Immutable.fromJS(items));

		this.trigger();
	},

	onMoveItems () {
		_state.data = _state.data.clear();

		this.trigger();
	},

	onRemoveMoveItem (id) {
		_state.data = _state.data.filter(item => {
			return item.get('id') !== id
		});

		this.trigger();
	}
});

export default MoveItemsStore;