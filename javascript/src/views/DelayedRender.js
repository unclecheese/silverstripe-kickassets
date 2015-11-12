import React from 'react';

const DelayedRender = React.createClass({

	propTypes: {
		delay: React.PropTypes.number
	},

	_timeout: null,

	getDefaultProps () {
		return {
			delay: 0
		}
	},

	getInitialState () {
		return {
			active: !this.props.delay
		}
	},

	componentWillUnmount () {
		if(this._timeout) {
			window.clearTimeout(this._timeout);	
		}
	},

	render () {
		if(this.props.delay && !this.state.active && !this._timeout) {
			this._timeout = window.setTimeout(() => {
				this.setState({active: true});
			}, this.props.delay);

			return null;
		}
		else if(this.state.active) {
			return <div>{this.props.children}</div>
		}

		return null;
	}

});

export default DelayedRender;