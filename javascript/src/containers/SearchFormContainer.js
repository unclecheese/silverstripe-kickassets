import React from 'react';
import Reflux from 'reflux';
import Navigation from '../actions/Navigation';
import SearchForm from '../views/SearchForm';
import FolderItemsStore from '../stores/FolderItemsStore';

const SearchFormContainer = React.createClass({

	mixins: [
		React.addons.PureRenderMixin,
		Reflux.ListenerMixin
	],

	propTypes: {
		routerParams: React.PropTypes.object.isRequired
	},

	handleSearch (term) {		
		const folderID = FolderItemsStore.getCurrentFolderID();

		if(term) {
			Navigation.goToSearch(folderID, term);
		}
		else {
			Navigation.goToFolder(folderID);
		}
	},

	render () {		
		const search = this.props.routerParams.get('search');		
		return <SearchForm value={search} onUpdate={this.handleSearch} />
	}
});

export default SearchFormContainer;