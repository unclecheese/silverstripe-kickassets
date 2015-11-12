import React from 'react/addons';
import Reflux from 'reflux';
import Actions from '../actions/Actions';
import Navigation from '../actions/Navigation';
import FileDetailStore from '../stores/FileDetailStore';
import FolderItemsStore from '../stores/FolderItemsStore';
import ItemEditForm from '../views/ItemEditForm';

const getStoreState = () => {	
	return {
		fileData: FileDetailStore.get('data'),
		transaction: FileDetailStore.get('updated') ? 'SAVED' : 'DEFAULT'
	};
};

const ItemEditFormContainer = React.createClass({

	propTypes: {
		routerParams: React.PropTypes.object.isRequired
	},

	mixins: [
		Reflux.ListenerMixin,
		React.addons.PureRenderMixin
	],

	getInitialState() {
		return getStoreState();
	},

	componentDidMount () {
		this.listenTo(FileDetailStore, this.onFileChanged);
		Actions.showItem(this.getFileFromProps());
	},

	componentWillReceiveProps (nextProps) {
		if(this.getFileFromProps() !== this.getFileFromProps(nextProps)) {			
			Actions.showItem(nextProps.routerParams.get('fileID'));
		}
	},

	componentDidUpdate (prevProps, prevState) {
		if(prevState.fileData && !this.state.fileData) {
			Navigation.goToFolder()
		}

		if(prevState.transaction === 'SAVING' && this.state.transaction === 'SAVED') {
			setTimeout(() => {
				this.setState({transaction: 'DEFAULT'});
			},2000)
		}
	},

	onFileChanged () {
		this.setState(getStoreState());
	},

	handleSubmit (fileData) {
		this.setState({
			transaction: 'SAVING'
		});

		Actions.editItem(
			{id: fileData.id},
			fileData
		);		
	},

	getFileFromProps (props) {
		props = props || this.props;
		return props.routerParams.get('fileID');
	},

	render() {		
		const fileData = this.state.fileData.toJS();

		if(fileData.id) {
			return (
				<ItemEditForm 
					transaction={this.state.transaction}
					file={fileData} 
					onSubmit={this.handleSubmit} />		
			);			
		}

		return <div />;
	}
});

export default ItemEditFormContainer;