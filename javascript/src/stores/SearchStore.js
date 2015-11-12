import Reflux from 'reflux';
import Actions from '../actions/Actions';
import Navigation from '../actions/Navigation';
import Immutable from 'immutable';
import ImmutableStoreMixin from '../mixins/ImmutableStoreMixin';

const _state = {
	term: null,
	data: Immutable.List(),
	loading: false
};

const SearchStore = Reflux.createStore({

	listenables: [
		Actions,	
		Navigation
	],

	mixins: [ImmutableStoreMixin(_state)],

	onGoToFolder () {
		_state.term = null;
		_state.data = _state.data.clear();
	},

	onSearch (term) {		
		_state.loading = true;
		_state.term = term;
		this.trigger();
	},

	onSearchCompleted (data) {
		_state.loading = false;
		this.replace('data', data);

		this.trigger();
	}
});

export default SearchStore;