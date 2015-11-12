import React from 'react';
import Reflux from 'reflux';
import ListViewHeader from '../views/ListViewHeader';
import Navigation from '../actions/Navigation';

const ListViewHeaderContainer = React.createClass({

	mixins: [
		React.addons.PureRenderMixin
	],

	propTypes: {
		routerParams: React.PropTypes.object.isRequired
	},

	handleSortChange (sort) {
		Navigation.updateSort(sort);
	},

	render () {
		return <ListViewHeader 
					onSortChange={this.handleSortChange} 
					sort={this.props.routerParams.getIn(['folderParams','sort'])} />;
	}
});

export default ListViewHeaderContainer;