import React from 'react';
import SidePanel from '../views/SidePanel';
import FolderItemsStore from '../stores/FolderItemsStore';
import Navigation from '../actions/Navigation';

const SidePanelContainer = React.createClass({

	handleClose () {
		Navigation.goToFolder(FolderItemsStore.getCurrentFolderID());
	},

	render () {
		return <SidePanel {...this.props} onClose={this.handleClose} />;
	}

});

export default SidePanelContainer;