import React from 'react';
import Reflux from 'reflux';
import Navigation from '../actions/Navigation';
import ViewToggle from '../views/ViewToggle';

const ViewToggleContainer = React.createClass({

	mixins: [
		React.addons.PureRenderMixin,
		Reflux.ListenerMixin
	],

	propTypes: {
		routerParams: React.PropTypes.object.isRequired
	},

	handleToggle (view) {
		Navigation.updateView(view);
	},

	render () {
		return <ViewToggle onToggle={this.handleToggle} view={this.props.routerParams.get('view')} />
	}

});

export default ViewToggleContainer;