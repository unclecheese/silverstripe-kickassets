import React from 'react';
import {Button} from 'react-bootstrap';
import _t from '../utils/lang';

const ErrorOverlay = React.createClass({

	propTypes: {
		header: React.PropTypes.string
	},

	getDefaultProps () {
		return {
			header: null,
			onAccept: React.PropTypes.func
		}
	},

	handleAccept (e) {
		e.preventDefault();
		this.props.onAccept && this.props.onAccept();
	},

	render () {
    	return (
	    	<div className="error-overlay">
	    		{this.props.header &&
	    			<h5>{this.props.header}</h5>
	    		}
	    		<span className="error-message">{this.props.children}</span>
	    		<Button onClick={this.handleAccept}>{_t('KickAssets.OK','OK')}</Button>

	    	</div>
    	);
	}
});

export default ErrorOverlay;