import React from 'react/addons';
import SearchFormContainer from '../containers/SearchFormContainer';
import SortDropdownContainer from '../containers/SortDropdownContainer';
import ViewToggleContainer from '../containers/ViewToggleContainer';
import SelectionButtonContainer from '../containers/SelectionButtonContainer';
import Navigation from '../actions/Navigation';
import Config from '../stores/Config';
import _t from '../utils/lang';

const TopBar = React.createClass({

	propTypes: {
		routerParams: React.PropTypes.object.isRequired
	},

	render() {
		const recent = this.props.routerParams.get('recent');

		return (
			<div className="row top-bar search-bar utility-bar">
				<div className="col-md-2 col-sm-2 top-nav">
					<a onClick={Navigation.goToAllFiles} className={recent ? '' : 'current'}>{_t('KickAssets.BROWSEFILES','Browse files')}</a>
					<a onClick={Navigation.goToRecentFiles} className={recent ? 'current' : ''}>{_t('KickAssets.MOSTRECENT','Most recent')}</a>
				</div>
				<div className="col-md-4 col-sm-4 search-container">
					<SearchFormContainer routerParams={this.props.routerParams} />
				</div>
				<div className="ka-tools">
				{Config.get('allowSelection') &&
					<SelectionButtonContainer />
				}
					<SortDropdownContainer routerParams={this.props.routerParams} />
					<ViewToggleContainer routerParams={this.props.routerParams} />
				</div>
			</div>
		);
	}
});

export default TopBar;