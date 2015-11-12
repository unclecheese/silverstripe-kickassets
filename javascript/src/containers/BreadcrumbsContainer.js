import React from 'react/addons';
import Reflux from 'reflux';
import Navigation from '../actions/Navigation';
import BreadcrumbsStore from '../stores/BreadcrumbsStore';
import Breadcrumbs from '../views/Breadcrumbs';

const getStoreState = () => {
	return {
		breadcrumbs: BreadcrumbsStore.get('data')
	}
};

const BreadcrumbsContainer = React.createClass({

	mixins: [
		React.addons.PureRenderMixin,
		Reflux.ListenerMixin
	],

	getInitialState () {
		return getStoreState();
	},

	componentDidMount () {
		this.listenTo(BreadcrumbsStore, this.updateBreadcrumbs);
	},

	updateBreadcrumbs () {
		this.setState(getStoreState());
	},

	handleLink (item) {
		Navigation.goToFolder(item.id);
	},

	render () {	
		const breadcrumbs = this.state.breadcrumbs.toJS();
		
		return (
			<Breadcrumbs onSelect={this.handleLink} breadcrumbs={breadcrumbs} />
		);
	}

});

export default BreadcrumbsContainer;