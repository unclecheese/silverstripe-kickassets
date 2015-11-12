import React from 'react';
import Reflux from 'reflux';
import AutoComplete from '../views/AutoComplete';
import FolderListStore from '../stores/FolderListStore';
import escapeRegExp from '../utils/escapeRegExp';

const getStoreState = () => {
	return {
		folders: FolderListStore.get('data')
	}	
}
const FolderSearch = React.createClass({

	propTypes: {
		currentFolder: React.PropTypes.string,
		onSelected: React.PropTypes.func
	},

	mixins: [
		Reflux.ListenerMixin,
		React.PureRenderMixin
	],

	getInitialState () {
		return getStoreState();
	},

	componentDidMount () {
		this.listenTo(FolderListStore, this.updateFromStore);
	},

	updateFromStore () {
		this.setState(getStoreState());
	},

	selectFolder (item) {
		this.props.onSelected && this.props.onSelected(item);
	},

	handleSearch (term, cb) {
	 	return cb(this.state.folders
		 			.map(item => {
						return {
							id: item.get('id'),
							text: item.get('filename')
						}
					})
					.filter(item => {
						return item.text.match(new RegExp(escapeRegExp(term),'i'));
					})
					.slice(0,10)
					.toJS()
				);
	},

	render () {
		return <AutoComplete
					delay={100} 
					value={this.props.currentFolder}
					onSearch={this.handleSearch}
					onItemSelect={this.selectFolder}
					{...this.props} />
	}
});

export default FolderSearch;