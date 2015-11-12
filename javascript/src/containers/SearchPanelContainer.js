import React from 'react/addons';
import Reflux from 'reflux';
import SidePanelContainer from './SidePanelContainer';
import FolderItemContainer from './FolderItemContainer';
import SearchStore from '../stores/SearchStore';
import Router from 'react-router';
import Actions from '../actions/Actions';
import Loader from '../views/Loader';
import _t, {sf} from '../utils/lang';

const getStoreState = () => {
	return {
		searchItems: SearchStore.get('data'),
		loading: SearchStore.get('loading')
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
		this.listenTo(SearchStore, this.onSearchChanged);		
		if(term) {		
			Actions.search(term);
		}
	},

	componentWillReceiveProps (nextProps) {
		if(this.getTermFromProps() !== this.getTermFromProps(nextProps)) {
			Actions.search(nextProps.routerParams.get('search'));
		}
	},

	onSearchChanged () {
		this.setState(getStoreState());
	},

	getTermFromProps (props) {
		props = props || this.props;
		return props.routerParams.get('search');
	},

	render () {
		const items = this.state.searchItems;
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
							{items.map(item => {
								return <FolderItemContainer key={item.id} data={item} />
							})}
						</div>
					);					
				}()}
			</SidePanelContainer>
		);
	}

});

export default SearchPanelContainer;