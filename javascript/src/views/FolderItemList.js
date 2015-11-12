import React from 'react/addons';
import Reflux from 'reflux';
import Actions from '../actions/Actions';
import FolderItemContainer from '../containers/FolderItemContainer';
import ListViewHeaderContainer from '../containers/ListViewHeaderContainer';
import FullHeightScroller from './FullHeightScroller';
import LazyLoadList from './LazyLoadList';
import scrollToElement from '../utils/scrollToElement';
import isElementInView from '../utils/isElementInView';
import Immutable from 'immutable';
import DragAndDropStore from '../stores/DragAndDropStore';
import SelectedItemsStore from '../stores/SelectedItemsStore';
import FolderItemsStore from '../stores/FolderItemsStore';
import SelectableGroup from '../views/SelectableGroup';
import Loader from './Loader';
import {Button} from 'react-bootstrap';
import _t from '../utils/lang';

const getStoreState = () => {
	return {		
		unsavedItems: FolderItemsStore.get('unsavedItems'),
		loading: FolderItemsStore.get('loading'),
		selectedItems: SelectedItemsStore.get('data')
	}
};

const FolderItemList = React.createClass({

	propTypes: {
		items: React.PropTypes.object,
		routerParams: React.PropTypes.object.isRequired,
		hasMore: React.PropTypes.bool,
		cursor: React.PropTypes.number		
	},

	mixins: [
		Reflux.ListenerMixin,
		React.addons.PureRenderMixin
	],

	_mouseData: null,

	getInitialState () {
		const state = getStoreState();
		state.scroll = 0;

		return state;
	},

	componentDidMount() {
		this.listenTo(FolderItemsStore, this.updateStoreState);
		this.listenTo(SelectedItemsStore, this.updateStoreState);

		this.scrollToEdited();
		document.addEventListener('mousedown', this.mouseDownListener);
		document.addEventListener('click', this.clickListener);		
	},

	componentWillUnmount () {
		document.removeEventListener('mousedown', this.mouseDownListener);
		document.removeEventListener('click', this.clickListener);
	},

	componentDidUpdate (prevProps, prevState) {
		if(!Immutable.is(this.props.items, prevProps.items)) {
			if(this.getFileFromProps()) {
				this.scrollToEdited();
			}
		}
		else if(this.getFileFromProps() && !this.getFileFromProps(prevProps)) {
			this.scrollToEdited();
		}
		else if(!prevState.unsavedItems && this.state.unsavedItems) {			
			this.scrollToTop();
		}
	},

	updateStoreState () {
		this.setState(getStoreState());
	},

	scrollToEdited () {
		const fileID = this.getFileFromProps();
		if(fileID) {
			const id = `#item_${fileID}`;
			const result = isElementInView(id, this.getScroller());
			const pad = this.props.routerParams.get('view') === 'list' ? 210 : 110;			
			if(result === false) {
				scrollToElement(id, this.getScroller(), 100, pad);				
			}
		}
	},

	scrollToTop () {
		const file = this.props.items.get(0);
		
		if(!file) return;

		const fileID = file.toJS().id;
		const pad = this.props.routerParams.get('view') === 'list' ? 210 : 110;			

		scrollToElement(
			`#item_${fileID}`, 
			this.getScroller(),
			100,
			pad
		);
	},


	mouseDownListener (e) {		
		this._mouseData = {
			x: e.pageX,
			y: e.pageY
		};
	},

	clickListener (e) {

		if(e.pageX !== this._mouseData.x || e.pageY !== this._mouseData.y) {
			// This is a drag
			return;
		}

		let node = e.target;
		let file = false;
		let scroller = false;

		while (node && node !== document) {
			if (node.classList.contains('file-box')) {
				file = true;
				break;
			}
			if(node === this.getScroller()) {
				scroller = true;
				break;
			}
			node = node.parentNode;
		}

		if(scroller && !file) {
			Actions.clearSelection();		
		}

	},

	handleScroll () {
		this.setState({
			scroll: this.getScroller().scrollTop
		})
	},

	getFileFromProps (props) {
		props = props || this.props;
		return props.routerParams.get('fileID');
	},

	getScroller () {
		return React.findDOMNode(this.refs.scroller);
	},

	getFileItems () {
		return this.props.items || [];
	},

	loadMore (e) {
		e.preventDefault();
		Actions.concatFolderItems(
			this.props.routerParams.get('folderParams').toJS(),
			this.props.cursor
		);
	},

	resolveItemToDOM (key) {		
		return document.getElementById(`item_${key}`);
	},

	handleSelction (keys) {
		Actions.groupSelect(keys);
	},

	render() {
		if(!this.props.items.count() && this.state.loading) {
			return <Loader delay={200} type='bounce' />
		}

		const recent = this.props.routerParams.get('recent');
		const view = this.props.routerParams.get('view');		
		const fileID = this.getFileFromProps();
		const children = [];

		const props = {
			viewHeight: window.innerHeight - 110,
			viewWidth: window.innerWidth - 40,
			itemHeight: view === 'list' ? 64 : 176,
			itemWidth: view === 'list' ? window.innerWidth : 220,
			scroll: this.state.scroll,
			visibleIndexes: []
		};

		this.getFileItems().forEach((item, index) => {
			if(item.get('id') == fileID) { 
				props.visibleIndexes.push(index);
			}

			children.push(	
				<FolderItemContainer
					ref={`item_${item.get('id')}`}
					key={item.get('id')}
					id={`item_${item.get('id')}`}
					data={item}
					layout={view}
					selected={this.state.selectedItems.contains(item)}
					selectedCount={this.state.selectedItems.count()}
					editing={(item.get('id') == fileID)} />			
			);

		});
		
		if(this.props.hasMore) {
			children.push(
				<Button key='loadmore' bsStyle='primary' onClick={this.loadMore} className='load-more'>
					{this.state.loading ? _t('KickAssets.LOADING','Loading...') : _t('KickAssets.LOADMORE','Load more')}
				</Button>
			);
		}
		
		return (
			<div>
				{view === 'list' &&
					<ListViewHeaderContainer routerParams={this.props.routerParams} />
				}
				<FullHeightScroller ref="scroller" onScroll={this.handleScroll} className={`ka-selectzone ${view}`}>			
					<SelectableGroup style={{height:'100%'}} onSelection={this.handleSelction} items={children} itemResolver={this.resolveItemToDOM}>
						<LazyLoadList {...props}>
							{children}
						</LazyLoadList>
					</SelectableGroup>
	 			</FullHeightScroller>
 			</div>

		);
	}

});

export default FolderItemList;