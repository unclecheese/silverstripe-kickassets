import React from 'react';
import Reflux from 'reflux';
import Navigation from '../actions/Navigation';
import Actions from '../actions/Actions';
import Config from '../stores/Config';
import FolderItemsStore from '../stores/FolderItemsStore';
import SelectedItemsStore from '../stores/SelectedItemsStore';
import DragAndDropStore from '../stores/DragAndDropStore';
import FolderItem from '../views/FolderItem';
import Immutable from 'immutable';

const FolderItemContainer = React.createClass({

	_lastToggle: null,

	_ghost: null,

	propTypes: {
		data: React.PropTypes.object.isRequired
	},

	mixins: [
		Reflux.ListenerMixin,
		React.addons.PureRenderMixin
	],

	getInitialState () {
		return {
			isDropTarget: false
		};
	},

	handleDoubleClick () {
		if(document.selection && document.selection.empty) {
			document.selection.empty();
		} 
		else if(window.getSelection) {
			window.getSelection().removeAllRanges();			
		}
				
		if(this.props.data.get('type') === 'folder') {
			Navigation.goToFolder(this.props.data.get('id'));	
		}
		else {
			Actions.clearSelection();
			Navigation.goToEditItem(this.props.data.toJS());
		}
	},

	handleClick (e) {
		e.preventDefault();

		let node = e.target;
		while (node && node !== React.findDOMNode(this)) {	
			if (node.classList.contains('file-action')) return;
			node = node.parentNode;
		}
		const now = +new Date();
		
		if(this._lastToggle && (now - this._lastToggle < 300)) return;

		Actions.toggleSelection(this.props.data.get('id'));		
		this._lastToggle = now;		
	},

	handleFilenameUpdated (title) {
		if(this.props.data.get('isNew') && this.props.data.get('type') === 'folder') {
			Actions.persistFolder(
				FolderItemsStore.getCurrentFolderID(),
				{title}
			);
		}
		else {
			Actions.editItem(this.props.data.toJS(), {title});
		}
	},

	handleEdit (data) {
		Navigation.goToEditItem(this.props.data.toJS());
	},

	handleMove (data) {		
		Navigation.goToMoveItems(
			FolderItemsStore.get('folderID'),
			this.state.selected ? SelectedItemsStore.get('data').toJS() : [data.id]

		);
	},

	handleDelete (data) {
		const items = this.props.selected ? SelectedItemsStore.column('id') : [data.id];
		
		Actions.deleteItems(items);
	},

	handleClearError () {
		Actions.clearFileError(this.props.data);
	},

	handleDragStart (e) {
		const count = SelectedItemsStore.get('data').count();
		e.dataTransfer.effectAllowed = 'move';
		e.dataTransfer.setData('text', 'drag');
		if(this.props.selected) {			
			if(count > 1 && ('setDragImage' in e.dataTransfer)) {
				this.createGhost(count);
				e.dataTransfer.setDragImage(this._ghost, 0, 0);				
			}

			Actions.dragSelectedItems();
		}
		else {
			Actions.dragItem(this.props.data)
		}
	},

	handleDragOver (e) {
		e.preventDefault();

		if(this.props.data.get('type') !== 'folder') return;

		if(DragAndDropStore.get('data').contains(this.props.data)) {
			return;			
		}	
		this.setState({
			isDropTarget: true
		});
	},

	handleDragEnter (e) {
		e.preventDefault();
	},

	handleDragLeave (e) {
		this.setState({
			isDropTarget: false
		})
	},

	handleDrop (e) {
		e.preventDefault();
		if(!this.state.isDropTarget) return;
		
		Actions.moveItems(
			this.props.data.get('filename'),
			DragAndDropStore.get('data').map(item => item.get('id')).toJS()
		);

		this.setState({isDropTarget: false});
		this.removeGhost();
	},

	handleDragEnd (e) {
		this.removeGhost();
		Actions.endDragging();
	},

	createGhost (count) {
		const ghostHolder = document.createElement('DIV');
		ghostHolder.id = 'ghost-holder';
		ghostHolder.style.position = 'relative';
		const node = React.findDOMNode(this);
		for(let i = 0; i < count; i++) {
			let ghost = node.cloneNode(true);
			ghost.style.top = `${i * 10}px`;
			ghost.style.left = `${i * 10}px`;
			ghost.style.width = '200px';
			ghost.style.height = '176px';
			ghost.style.position = 'absolute';
			ghost.style.zIndex = (count-i);
			ghost.querySelector('.file-action').innerHTML = '';
			ghostHolder.appendChild(ghost);
		}

		this._ghost = ghostHolder;
		document.body.appendChild(ghostHolder);	
	},

	removeGhost () {
		this._ghost && this._ghost.parentNode.removeChild(this._ghost);
	},

	render () {
		const folder = this.props.data.get('type') === 'folder';
		return <FolderItem
					{...this.props}
					data={this.props.data.toJS()}
					selected={this.props.selected}
					dropTarget={this.state.isDropTarget}
					onClick={this.handleClick}
					onDoubleClick={this.handleDoubleClick}
					onFilenameUpdated={this.handleFilenameUpdated}
					onEditFilename={Actions.clearSelection}
					onClearError={this.handleClearError}
					onEdit={this.handleEdit}
					onMove={this.handleMove}
					draggable={true}
					onDragStart={this.handleDragStart}
					onDragLeave={this.handleDragLeave}
					onDragEnter={this.handleDragEnter}
					onDragOver={this.handleDragOver}
					onDragEnd={this.handleDragEnd}
					onDrop={this.handleDrop}
					onDelete={this.handleDelete} />
	}
});

export default FolderItemContainer;