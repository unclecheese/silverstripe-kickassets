import React from 'react/addons';
import Router from 'react-router';
import TopBar from '../views/TopBar';
import BrowseBar from '../views/BrowseBar';
import Browse from './Browse';
import Actions from '../actions/Actions';
import Navigation from '../actions/Navigation';
import Immutable from 'immutable';
import SelectedItemsStore from '../stores/SelectedItemsStore';
import Config from '../stores/Config';

const Main = React.createClass({

	mixins: [
		Router.State
	],

	getInitialState () {
		return {
			routerParams: Immutable.Map()
		}
	},

	componentWillMount () {
		Navigation.initRouter(this.context.router);
		this.loadRouterParams();
	},

	componentDidMount () {
		Actions.getFolders();
		document.addEventListener('keyup', this.keyUpListener);
		document.addEventListener('keydown', this.keyDownListener);
	},

	componentWillReceiveProps (nextProps) {
		this.loadRouterParams(nextProps);
	},

	keyDownListener (e) {		
		if(e.metaKey && !SelectedItemsStore.get('multi')) {
			Actions.activateMultiSelect();
		}
	},

	keyUpListener (e) {		
		if(!e.metaKey && SelectedItemsStore.get('multi')) {
			Actions.deactivateMultiSelect();
		}
	},

	loadRouterParams (props) {
		props = props || this.props;
		const newParams = Immutable.Map({
			folderParams: Immutable.Map({
				folderID: props.params.folderID,
				sort: props.query.sort || Config.get('defaultSort')
			}),
			fileID: props.params.fileID,
			search: props.query.q,
			view: props.query.view || Config.get('defaultView'),
			path: this.context.router.getCurrentPathname(),
			recent: props.params.folderID === 'recent'
		});

		if(!Immutable.is(this.state.routerParams, newParams)) {	
			this.setState({
				routerParams: newParams
			});
		}
	},

	render() {	
		if(!this.state.routerParams.get('folderParams')) return <div />;

		return (
			<div id="kickassets">
				<TopBar routerParams={this.state.routerParams} />
				{!this.state.routerParams.get('recent') &&
					<BrowseBar routerParams={this.state.routerParams} />
				}
	            <div className="ka-folder-items">
	            	<Browse routerParams={this.state.routerParams} />
				</div>
			</div>
		);
	}

});

export default Main;