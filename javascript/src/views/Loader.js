import React from 'react';
import DelayedRender from './DelayedRender';

const Loader = React.createClass({

	propTypes: {
		type: React.PropTypes.oneOf(['bounce', 'wave']).isRequired,
		delay: React.PropTypes.number
	},

	getDefaultProps () {
		return {
			type: 'bounce',
			delay: 0
		}
	},

	renderBounce () {
		return (
			<div className="spinner bounce-loader">
			  <div className="bounce1"></div>
			  <div className="bounce2"></div>
			  <div className="bounce3"></div>
			</div>
		);
	},

	renderWave () {
		return (
			<div className="spinner wave-loader">
			  <div className="rect1"></div>
			  <div className="rect2"></div>
			  <div className="rect3"></div>
			  <div className="rect4"></div>
			  <div className="rect5"></div>
			</div>		
		);
	},

	render () {
		const type = this.props.type.charAt(0).toUpperCase() + this.props.type.slice(1);
		const renderFunc = `render${type}`;

		return (
			<DelayedRender delay={this.props.delay}>
				{this[renderFunc]()}
			</DelayedRender>
		);
	}
});

export default Loader;