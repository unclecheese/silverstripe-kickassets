import React from 'react/addons';
import Reflux from 'reflux';
import SidePanelContainer from './SidePanelContainer';
import FolderItemContainer from './FolderItemContainer';
import MoveItemsStore from '../stores/MoveItemsStore';
import FolderDataStore from '../stores/FolderDataStore';
import Actions from '../actions/Actions';
import FolderSearch from '../containers/FolderSearch';
import {Button, Alert, Glyphicon} from 'react-bootstrap';
import Navigation from '../actions/Navigation';
import FolderItemImage from '../views/FolderItemImage';
import _t, {sf} from '../utils/lang';

const MovePanelContainer = React.createClass({
	
	mixins: [
		Reflux.ListenerMixin,
		React.addons.PureRenderMixin
	],

	getInitialState () {
		return {
			moveItems: MoveItemsStore.get('data'),
			newEntry: null,
			folder: null
		}
	},

	componentDidMount () {	
		this.listenTo(MoveItemsStore, this.onMoveChanged);
	},

	componentDidUpdate (prevProps, prevState) {
		if(!this.state.moveItems.count()) {
			this.close();
		}
	},

	onMoveChanged () {
		this.setState({
			moveItems: MoveItemsStore.get('data')
		});
	},

	removeItem (id) {
		Actions.removeMoveItem(id);
	},

	handleSubmit (e) {
		e.preventDefault();	
		const ids = MoveItemsStore.column('id');

		if(typeof this.state.folder === 'string') {
			Actions.moveItems(this.state.folder, ids);
			Actions.refreshFolderItems();
		}
		else {
			Actions.moveItems(this.state.folder.id, ids);
		}
	},

	handleFolderSelect (folder) {
		this.setState({folder})
	},

	handleNewEntry (newEntry) {
		this.setState({folder: newEntry});
	},

	close () {
		Navigation.goToFolder(
			this.props.routerParams.getIn(['folderParams','folderID'])
		);		
	},

	render () {
		const items = this.state.moveItems.toJS();
		return (
			<SidePanelContainer title='Move items'>
				<form className="ka-move-form" role="form" onSubmit={this.handleSubmit}>
					<div className="form-group">
						<label>{sf(_t('KickAssets.MOVEITEMSTO','Move %s item(s) to:'), items.length)}</label>
						<FolderSearch 							
							freeText={true} 
							currentFolder={FolderDataStore.get('data').get('filename')}
							onNewEntry={this.handleNewEntry}
							onSelected={this.handleFolderSelect} />
					</div>
					{typeof this.state.folder === 'string' &&
						<Alert bsStyle='success'>
							{_t('KickAssets.FOLDERNOTEXIST','This folder does not exist. It will be created.')}
						</Alert>
					}
					<ul className='move-list'>
						{items.map(item => {
							return (
								<li key={item.id}>
									<span className='ka-file-image'><FolderItemImage {...item} /></span>
									<span className='ka-file-title'>{item.title}</span>
									<a onClick={this.removeItem.bind(null, item.id)}><Glyphicon glyph='minus-sign' /></a>
								</li>
							);
						})}
					</ul>

					<Button block bsStyle='primary' type='submit'>{sf(_t('KickAssets.MOVEITEMS','Move %s items'), items.length)}</Button>
				</form>				

			</SidePanelContainer>
		);
	}

});

export default MovePanelContainer;