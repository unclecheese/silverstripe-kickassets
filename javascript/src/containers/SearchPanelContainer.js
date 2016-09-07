import React from 'react/addons';
import Reflux from 'reflux';
import SidePanelContainer from './SidePanelContainer';
import FolderItemContainer from './FolderItemContainer';
import SelectableGroup from '../views/SelectableGroup';
import SearchStore from '../stores/SearchStore';
import SelectedItemsStore from '../stores/SelectedItemsStore';
import Router from 'react-router';
import Actions from '../actions/Actions';
import Loader from '../views/Loader';
import _t, {sf} from '../utils/lang';

const getStoreState = () => {
	return {
		searchItems: SearchStore.get('data'),
		loading: SearchStore.get('loading'),
		selectedItems: SelectedItemsStore.get('data')		
	}
};

const SearchPanelContainer = React.createClass({
	
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
		const term = this.props.routerParams.get('search');
		this.listenTo(SearchStore, this.onStoresChanged);
		this.listenTo(SelectedItemsStore, this.onStoresChanged);

		if(term) {		
			Actions.search(term);
		}
	},

	componentWillReceiveProps (nextProps) {
		if(this.getTermFromProps() !== this.getTermFromProps(nextProps)) {
			Actions.search(nextProps.routerParams.get('search'));
		}
	},

	onStoresChanged () {
		this.setState(getStoreState());
	},

	getTermFromProps (props) {
		props = props || this.props;
		return props.routerParams.get('search');
	},

	render () {
		const items = this.state.searchItems;		
		const children = items.map(item => {
			return <FolderItemContainer 
				selected={this.state.selectedItems.contains(item)}
				selectedCount={this.state.selectedItems.count()}
				key={item.id} 
				data={item} />
		}).toJS();

		return (
			<SidePanelContainer title={sf(_t('KickAssets.SEARCHFOR','Search for %s'), this.getTermFromProps())}>
				{() => {
					if(this.state.loading) {
						return <Loader type='bounce' />
					}
					if(!items.count()) {
						return <div className="alert alert-danger">No results</div>
					}
					return (
						<div>
							{children}
						</div>
					);					
				}()}
			</SidePanelContainer>
		);
	}

});

export default SearchPanelContainer;