import React from 'react';
import Reflux from 'reflux';
import BreadcrumbsContainer from '../containers/BreadcrumbsContainer';
import FolderDataStore from '../stores/FolderDataStore';
import Config from '../stores/Config';
import BreadcrumbsStore from '../stores/BreadcrumbsStore';
import UIStore from '../stores/UIStore';
import FolderSearch from '../containers/FolderSearch';
import Navigation from '../actions/Navigation';
import Actions from '../actions/Actions';
import {DropdownButton, MenuItem, Glyphicon} from 'react-bootstrap';
import DelayedRender from './DelayedRender';
import nodeInRoot from '../utils/nodeInRoot';
import _t from '../utils/lang';

const BrowseBar = React.createClass({

	mixins: [
		React.addons.PureRenderMixin,
		Reflux.ListenerMixin
	],

	getInitialState () {		
		return {
			showFolderSearch: false,
			canUpload: FolderDataStore.get('data').get('canUpload') && Config.get('canUpload'),
			canCreateFolder: FolderDataStore.get('data').get('canCreate') && Config.get('canCreateFolder'),
			totalProgress: null,
			hasBreadcrumbs: BreadcrumbsStore.get('data').count() > 0
		}
	},

	componentDidMount () {
		this.listenTo(FolderDataStore, this.updateFolderData);
		this.listenTo(BreadcrumbsStore, this.updateBreadcrumbs);
		this.listenTo(UIStore, this.updateUI);
	},

	componentDidUpdate () {		
		if(this.state.totalProgress === 100) {
			window.setTimeout(() => {
				Actions.setTotalProgress(0);
			}, 1000);
		}
	},

	updateFolderData () {
		this.setState({
			canUpload: FolderDataStore.get('data').get('canUpload') && Config.get('canUpload'),
			canCreateFolder: FolderDataStore.get('data').get('canCreate') && Config.get('canCreateFolder')
		});
	},

	updateUI () {
		this.setState({
			totalProgress: UIStore.get('totalProgress')
		});
	},

	updateBreadcrumbs () {
		this.setState({
			hasBreadcrumbs: BreadcrumbsStore.get('data').count() > 0
		});
	},

	toggleSearch () {
		this.setState({
			showFolderSearch: !this.state.showFolderSearch
		}, () => {
			if(this.state.showFolderSearch) {
				React.findDOMNode(this.refs.search).querySelector('input').focus();
				document.addEventListener('click', this.cancelSearchClick);
				document.addEventListener('keyup', this.cancelSearchEscape);				
			}
			else {
				document.removeEventListener('click', this.cancelSearchClick);
				document.removeEventListener('keyup', this.cancelSearchEscape);
			}
		});

	},

	cancelSearchEscape (e) {
		if(e.keyCode === 27) {
			this.toggleSearch();
		}
	},

	cancelSearchClick (e) {
		const node = React.findDOMNode(this.refs.search);
		if(node && !nodeInRoot(e.target, node)) {			
			this.toggleSearch();
		}
	},

	jumpToFolder (item) {
		this.setState({
			showFolderSearch: false
		}, () => {
			Navigation.goToFolder(item.id);		
		});
	},

	handleNew (e) {
		if(e === 'new-folder') {
			Actions.insertFolder();
		}		
	},

	render () {
		const space = '\u00a0\u00a0';		
		const plus = <Glyphicon glyph='plus' />;	

		return (
			<div className="row top-bar browse-bar utility-bar">
				<div className="col-md-8 col-sm-8">
				{() => {
					if(this.state.showFolderSearch) {
						return (
							<FolderSearch ref='search' 
										  className='jump-to-folder-search' 
										  placeholder={_t('KickAssets.JUMPTOFOLDER','Jump to folder...')}
										  onSelected={this.jumpToFolder} />
						);
					}
					else if(this.state.hasBreadcrumbs) {
						return (
							<h2>
								<BreadcrumbsContainer />
								<Glyphicon glyph='search' className='jump-to-folder' onClick={this.toggleSearch} />
							</h2>
						);
					}
					return <div />;
				}()}

				</div>
				<div className="ka-tools">
					<DropdownButton bsStyle='success' noCaret onSelect={this.handleNew} title={plus} pullRight>
						{this.state.canCreateFolder &&
							<MenuItem key='new-folder' eventKey='new-folder'>
								<Glyphicon glyph="folder-open" />{space} {_t('KickAssets.NEWFOLDER','New folder')}
							</MenuItem>
						}
						<MenuItem style={{display: !!this.state.canUpload ? 'block' : 'none'}} id="ka-add-files" key='new-files' eventKey='new-files'>
							<Glyphicon glyph="open" />{space} {_t('KickAssets.UPLOADFILES','Upload files...')}
						</MenuItem>

					</DropdownButton>

				</div>
				{!!this.state.totalProgress &&
					<DelayedRender delay={300}>
						<div className="progress">
							<div className="progress-bar" role="progressbar" style={{width: `${this.state.totalProgress}%`}} />
						</div>
					</DelayedRender>
				}

			</div>
		);
	}
});

export default BrowseBar;