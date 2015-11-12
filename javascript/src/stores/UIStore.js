import Reflux from 'reflux';
import Actions from '../actions/Actions';

const _state = {
	errorMsg: null,
	totalProgress: null
};

export default Reflux.createStore({

	listenables: Actions,

	onThrowError (error) {		
		_state.errorMsg = error;
		this.trigger();
	},

	onClearError () {
		_state.errorMsg = null;
		this.trigger();
	},

	onSetTotalProgress (percent, bytes) {
		_state.totalProgress = percent;

		this.trigger();
	},

	onEndUploading () {
		_state.totalProgress = 100;;

		this.trigger();
	},
	
	get (key) {
		return key ? _state[key] : _state;
	}
});