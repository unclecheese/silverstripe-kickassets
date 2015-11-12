import React from 'react/addons';
import BS from 'react-bootstrap';

const ProgressBar = React.createClass({

	mixins: [React.addons.PureRenderMixin],

	propTypes: {
		delay: React.PropTypes.number,
		onHide: React.PropTypes.func,
		onShow: React.PropTypes.func
	},

	_timeout: null,

	getInitialState () {		
		return {
			isShowing: !this.props.delay
		};
	},


	componentWillReceiveProps (nextProps) {		
		if(!this.state.isShowing && !this._timeout && this.props.delay) {	
			this._timeout = window.setTimeout(() => {
				this.setState({
					isShowing: true
				});
				if(this.props.onShow) this.props.onShow();
			}, this.props.delay)
		}

		if(nextProps.now >= this.props.max && this._timeout) {				
			window.clearTimeout(this._timeout);
			if(this.state.isShowing && this.props.onHide) {
				this.props.onHide();
			}
			this.setState({
				isShowing: false
			});			
		}
	},


	render () {
		if(!this.state.isShowing) return <div />;

		return (
			<BS.ProgressBar {...this.props} />
		);
	}

});

export default ProgressBar;