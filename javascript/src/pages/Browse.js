import React from 'react/addons';
import Reflux from 'reflux';
import FolderItemList from '../views/FolderItemList';
import DropzoneContainer from '../containers/DropzoneContainer';
import Router from 'react-router';
import Actions from '../actions/Actions';
import FolderItemsStore from '../stores/FolderItemsStore';
import FileDetailStore from '../stores/FileDetailStore';
import FolderDataStore from '../stores/FolderDataStore';
import SearchStore from '../stores/SearchStore';
import UIStore from '../stores/UIStore';
import {Modal} from 'react-bootstrap';
import Immutable from 'immutable';
import _t from '../utils/lang';

const getStoreState = () => {
	return {
		folderItems: FolderItemsStore.get('data'),
		folderData: FolderDataStore.get('data'),
		hasMore: FolderDataStore.get('hasMore'),
		cursor: FolderDataStore.get('cursor'),
		errorMsg: UIStore.get('errorMsg')
	};
};

const Browse = React.createClass({
	
	mixins: [
		Reflux.ListenerMixin,
		React.addons.PureRenderMixin
	],

	propTypes: {
		routerParams: React.PropTypes.object.isRequired
	},

	getInitialState () {
		return getStoreState();
	},

	componentDidMount () {
		const params = this.getParamsFromProps().toJS();

		this.listenTo(FolderItemsStore, this.updateStoreState);
		this.listenTo(FolderDataStore, this.updateStoreState);
		this.listenTo(UIStore, this.updateStoreState);		

		this.getItems(params);
	},

	componentWillReceiveProps (nextProps) {
		if(!Immutable.is(this.getParamsFromProps(), this.getParamsFromProps(nextProps))) {			
			this.getItems(this.getParamsFromProps(nextProps).toJS());
		}
	},

	componentDidUpdate () {
		if(FolderItemsStore.get('needsRefresh')) {
			this.getItems(this.getParamsFromProps().toJS());
		}
	},

	updateStoreState () {	
		this.setState(getStoreState());
	},
	
	getParamsFromProps (props) {
		props = props || this.props;
		return props.routerParams.get('folderParams');
	},

	getItems (params) {
		if(params.folderID === 'recent') {
			Actions.getRecentItems(params);
		}
		else {
			Actions.getFolderItems(params);	
		}		
	},

	clearError () {
		Actions.clearError();
	},

	render () {			
		const params = this.props.routerParams;
		const folderID = this.getParamsFromProps().get('folderID');
		const items = this.state.folderItems;
		const list = <FolderItemList 
						routerParams={params} 
						hasMore={this.state.hasMore} 
						cursor={this.state.cursor}
						items={items} />;
		let container;

		if(this.state.folderData.get('canUpload')) {
			container = <DropzoneContainer folderID={folderID} items={items}>{list}</DropzoneContainer>;
		}
		else {
			container = <div className="ka-main">{list}</div>;
		}

		return (
			<div className="ka-browse-container">
				{container}
				<Router.RouteHandler className="ka-sidebar" routerParams={params} />
				<div style={{display:'none'}} id="ka-previews" />
				{this.state.errorMsg &&
				<Modal onRequestHide={this.clearError} closeButton title={_t("KickAssets.DIDNTWORK","Well, that didn't work.")}>
					<div className='modal-body' dangerouslySetInnerHTML={{__html: this.state.errorMsg}} />
				</Modal>
				}

			</div>
		);
	}

});

export default Browse;