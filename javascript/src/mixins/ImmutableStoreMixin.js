import Immutable from 'immutable';

const ImmutableStoreMixin = (state) => {
	
	return {
		_hasInitialised: false,

		initialise (params) {
			if(this._hasInitialised) {
				console.warn('Store has already initialised its state.');
			}
			for(let k in params) {
				if(state[k] !== undefined) {
					state[k] = params[k]
				}
			}

			this._hasInitialised = true;
		},

		getByID (id) {
			return state.data.find(item => {
				return item.get('id') == id;
			})
		},

		getByIDs (ids) {
			return state.data.filter(item => {
				return ids.indexOf(item.get('id')) > -1
			});
		},

		indexForID (id) {
			return state.data.findIndex(item => {
				return item.get('id') == id;
			})
		},

		replace (key, newData) {		
			const newState = Immutable.fromJS(newData);
			if(!Immutable.is(state[key], newState)) {			
				state[key] = newState;
			}
		},

		get (key) {
			return key ? state[key] : state;
		},

		updateItem (id, data, trigger = true) {
			const index = this.indexForID(id);

			if(index > -1) {
				state.data = state.data.mergeIn([index], Immutable.fromJS(data));					
				if(trigger) {
					this.trigger();
				}
			}
		},

		forID (id, callback) {
			const index = this.indexForID(id);

			if(index > -1) {
				callback.call(this, index);
			}
		},

		column (col) {
			return state.data.map(item => item.get(col)).toJS();
		}
	}
};

export default ImmutableStoreMixin;