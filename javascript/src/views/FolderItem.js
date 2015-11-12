import React from 'react/addons';
import Truncator from './Truncator';
import classNames from 'classnames';
import {DropdownButton, Glyphicon, MenuItem} from 'react-bootstrap';
import FolderItemImage from './FolderItemImage';
import ErrorOverlay from './ErrorOverlay';
import Config from '../stores/Config';
import _t from '../utils/lang';

const FolderItem = React.createClass({

	_mouseTimeout: null,

	propTypes: {
		data: React.PropTypes.object,
		editing: React.PropTypes.bool,
		selected: React.PropTypes.bool,
		selectedCount: React.PropTypes.number,
		layout: React.PropTypes.oneOf(['list','grid']),
		onFilenameUpdated: React.PropTypes.func,
		onEditFilename: React.PropTypes.func,
		onUneditFilename: React.PropTypes.func,
		onClearError: React.PropTypes.func,
		onEdit: React.PropTypes.func,
		onMove: React.PropTypes.func,
		onDelete: React.PropTypes.func
	},

	getDefaultProps () {
		return {
			onFilenameUpdated: () => {},
			layout: 'grid',
			selectedCount: 0
		};
	},

	getInitialState () {
		return {
			isEditing: false,
			modifiedData: this.props.data,
			showAction: false
		};
	},

	componentWillReceiveProps (nextProps) {
		this.setState({
			modifiedData: nextProps.data
		});		
	},

	componentDidMount () {
		const {data} = this.props;
		if(data.isNew && data.type === 'folder') {
			this.editFilename();
		}
	},

	handleKeyUp (e) {
		this.updateData('title', e.target.value);
	},

	handleKeyDown (e) {
		if(e.keyCode === 13) {
			e.preventDefault();
		}
	},

	editFilename (e) {
		if(e) {
			e.stopPropagation();
		}
		if(this.props.data.canEdit === false) return;
		
		document.addEventListener('click', this.clickListener);
		document.addEventListener('keyup', this.keyListener);
		
		this.props.onEditFilename && this.props.onEditFilename();

		this.setState({
			isEditing: true
		}, () => {		
			React.findDOMNode(this.refs.filename).select();
		});
	},

	uneditFilename () {
		document.removeEventListener('click', this.clickListener);
		document.removeEventListener('keyup', this.keyListener);
		
		this.props.onUneditFilename && this.props.onUneditFilename();
		
		this.setState({
			isEditing: false			
		});
	},

	handleDoubleClick (e) {
		e.preventDefault();
		this.props.onDoubleClick && this.props.onDoubleClick();
	},

	handleMouseEnter (e) {
		this._mouseTimeout = window.setTimeout(() => {
			this.setState({showAction: true});
		}, this.props.layout === 'grid' ? 350 : 0);
	},

	handleMouseLeave (e) {
		if(this._mouseTimeout) {
			window.clearTimeout(this._mouseTimeout);
		}

		this.setState({
			showAction: false
		});
	},

	handleFilenameUpdate (e) {			
		const newTitle = e.target.value.trim();

		if(!newTitle) {			
			return this.reset();
		}

		this.updateData('title', newTitle);
		this.props.onFilenameUpdated(newTitle);
		this.uneditFilename();
	},

	clickListener (e) {
		if(e.target !== React.findDOMNode(this.refs.filename)) {
			this.handleFilenameUpdate(e);
		}
	},

	keyListener (e) {		
		if(e.keyCode === 13) {			
			this.handleFilenameUpdate(e);
		}

		if(e.keyCode === 27) {
			this.reset();
		}
	},

	handleAction (action) {		
		switch (action) {
			case 'edit':
				this.props.onEdit && this.props.onEdit(this.props.data);
			break;

			case 'move':
				this.props.onMove && this.props.onMove(this.props.data);				
			break;

			case 'delete':
				this.props.onDelete && this.props.onDelete(this.props.data);				
			break;
		}
	},

	reset () {
		this.updateData('title', this.props.data.title);

		return this.uneditFilename();	
	},

	updateData (k, v) {
		const data = this.state.modifiedData;
		data[k] = v;

		this.setState({
			modifiedData: data
		});
	},

	getClasses () {
		const c = classNames({
			'file-box': true,			
			'selected': this.props.selected,
			'editing': this.props.editing,
			'list': this.props.layout === 'list',
			'grid': this.props.layout === 'grid',
			'droppable': this.props.dropTarget
		});

		return c;
	},

	getType () {
		return this.props.data.type === 'image' ? 'image' : 'icon';
	},

	getCreated () {
		return this.props.data.isNew ? _t('KickAssets.JUSTNOW','Just now') : this.props.data.created;
	},

	getTitle () {
		const title = this.props.data.title ? this.props.data.title.trim() : null;
		
		return title || '\u00a0';
	},

	getExtension () {
		return this.props.data.extension === Config.get('folderExtension') ? 'folder' : this.props.data.extension;
	},

	renderFilename () {
		const preview = this.props.data.isNew && this.props.data.type !== 'folder';
		
		if(!preview && !this.state.isEditing) {
			return <Truncator onDoubleClick={this.editFilename} className="wrap">{this.getTitle()}</Truncator>
		}

		if(!preview && this.state.isEditing) {
			return <textarea 
						rows={1} 
						onKeyDown={this.handleKeyDown} 
						onChange={this.handleKeyUp} 
						onBlur={this.handleFilenameUpdate} 
						className="filename-editable" 
						ref="filename" 
						value={this.props.data.title} />
		}
		
		if(preview) {
			return <Truncator className="wrap">{this.getTitle()}</Truncator>;
		}
	},

	renderProgress () {		
		return 	(
			<div className="progress">
				<div className="progress-bar" role="progressbar" style={{width: `${this.props.data.progress}%`}} />
			</div>
		);
	},

	renderAction () {
		const cog = <Glyphicon glyph="pencil" />;
		const space = '\u00a0\u00a0';
		const {data} = this.props;

		return (
	        <div className="file-action badged-button">
	        	{this.props.selectedCount > 1 && this.props.selected &&
	        		<span className="badge badge-danger">{this.props.selectedCount}</span>
	        	}
	        	{(data.canEdit || data.canDelete) && 
		            <DropdownButton noCaret onSelect={this.handleAction} title={cog}>
						{data.canEdit &&
							<MenuItem eventKey='edit'><Glyphicon glyph="edit" />{space}{_t('KickAssets.EDIT','Edit')}</MenuItem>
						}
						{data.canEdit &&
							<MenuItem eventKey='move'><Glyphicon glyph="share" />{space}{_t('KickAssets.MOVETO','Move to...')}</MenuItem>
						}
						{data.canDelete && Config.get('canDelete') &&
							<MenuItem eventKey='delete'><Glyphicon glyph="trash" />{space}{_t('KickAssets.DELETE','Delete')}</MenuItem>					
						}
					</DropdownButton>
				}
	        </div>
	    );
	},

	renderError () {
		return (
			<ErrorOverlay header={_t('KickAssets.OHNO','Oh no!')} onAccept={this.props.onClearError}>
				{this.props.data.error}
			</ErrorOverlay>		
		);
	},

	renderList () {
		const {data} = this.props;

		return (
        <div {...this.props} className={this.getClasses()} onMouseEnter={this.handleMouseEnter} onMouseLeave={this.handleMouseLeave}>
            {data.error && this.renderError()}

            <div className={`folder-item-cell ${this.getType()}`}>
                <FolderItemImage {...data} />
            </div>
            <div className="folder-item-cell file-name">
            	{this.renderFilename()}
            </div>
            <div className="folder-item-cell file-created">
            	{this.getCreated()}
            </div>
            <div className="folder-item-cell file-kind">
            	{this.getExtension()}
            </div>

            <div className="folder-item-cell action">
            	{this.state.showAction && this.renderAction()}
            </div>

			{data.progress && this.renderProgress()}
        </div>
        );

	},

	renderGrid () {
		const {data} = this.props;		
		return (
		<div className="ka-folder-item-wrap">			
	        <div {...this.props} className={this.getClasses()}>
	            <div className="file" onMouseEnter={this.handleMouseEnter} onMouseLeave={this.handleMouseLeave}>                
		            {data.error && this.renderError()}
	                
	                <span className="corner"></span>

	                <div className={`file-preview ${this.getType()}`}>
	                    <FolderItemImage {...data} />
	                </div>
	                <div className="file-name">
	                	{this.renderFilename()}
	                    <small>{_t('KickAssets.ADDED','Added')}: {this.getCreated()}</small>
	                </div>
	                {this.state.showAction && this.renderAction()}
					{data.progress && this.renderProgress()}
	            </div>
	        </div>
        </div>
        );
	},

	render () {
		return this.props.layout === 'list' ? this.renderList() : this.renderGrid();
	}


});

export default FolderItem;