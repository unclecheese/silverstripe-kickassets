import Reflux from 'reflux';
import Actions from '../actions/Actions';
import ImmutableStoreMixin from '../mixins/ImmutableStoreMixin';
import SelectedItemsStore from './SelectedItemsStore';
import Immutable from 'immutable';

const _state = {
	data: Immutable.List(),
	active: false
};

export default Reflux.createStore({

	listenables: Actions,

	mixins: [ImmutableStoreMixin(_state)],

	onDragSelectedItems () {		
		_state.data = SelectedItemsStore.get('data');
		_state.active = true;

		this.trigger();
	},

	onDragItem (item) {
		_state.data = Immutable.List().push(item);
		_state.active = true;

		this.trigger();
	},

	onMoveItems () {
		_state.data = Immutable.List();
		_state.active = false;
		
		this.trigger();
	},

	onEndDragging () {
		_state.data = Immutable.List();
		_state.active = false;

		this.trigger();
	}
	
});