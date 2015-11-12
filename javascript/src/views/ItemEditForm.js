import React from 'react/addons';
import FilePreviewContainer from '../containers/FilePreviewContainer';
import SidePanelContainer from '../containers/SidePanelContainer';
import FolderSearch from '../containers/FolderSearch';
import _t from '../utils/lang';

const ItemEditForm = React.createClass({

	propTypes: {
		file: React.PropTypes.object.isRequired,
		onSubmit: React.PropTypes.func,
		transaction: React.PropTypes.oneOf(['DEFAULT','SAVING','SAVED'])
	},

	getInitialState () {
		return {
			file: this.props.file
		}
	},

	componentWillReceiveProps (nextProps) {
		this.setState({
			file: nextProps.file
		})
	},

	handleSubmit (e) {
		e.preventDefault();
		this.props.onSubmit && this.props.onSubmit(this.state.file);
	},

	createHandler (key) {
		return e => {			
			var data = this.state.file;
			data[key] = e.target.value;
			this.setState({
				file: data
			});
		};
	},

	handleFolderSelect (item) {
		const data = this.state.file;
		
		data.parentID = item.id;
		data.folderName = item.text;
		this.setState({
			file: data
		});
	},

	getButtonText () {
		switch(this.props.transaction) {
			case 'DEFAULT':
				return _t('KickAssets.SAVE','Save');
			case 'SAVING':
				return _t('KickAssets.SAVING','Saving...')
			case 'SAVED':
				return _t('KickAssets.SAVED','Saved!')
		}
	},

	render() {

		const {file} = this.state;

		if(!file) return <div className="ka-side-panel" />;

		let title = file.title ? file.title.trim() : '';

		if(!title) title = <em>{_t('KickAssets.UNTITLED','Untitled')}</em>;

		return (
			<SidePanelContainer title={title}>
				<FilePreviewContainer file={file} />
							
				<form role="form" onSubmit={this.handleSubmit}>

					<div className="form-group">
						<label>{_t('KickAssets.TITLE','Title')}</label>
						<input disabled={!file.canEdit} className="form-control" name="title" value={file.title} onChange={this.createHandler('title')} />
					</div>
					<div className="form-group">
						<label>{_t('KickAssets.FILENAME','Filename')}</label>
						<input disabled={!file.canEdit} className="form-control" name="filename" value={file.filename} onChange={this.createHandler('filename')} />
					</div>

					<div className="form-group">
						<label>{_t('KickAssets.FOLDER','Folder')}</label>
						<FolderSearch disabled={!file.canEdit} currentFolder={file.folderName} onSelected={this.handleFolderSelect} />
					</div>
					<button type="submit" disabled={this.props.transaction !== 'DEFAULT' || !file.canEdit} className="btn btn-primary pull-right">{this.getButtonText()}</button>
				</form>
			</SidePanelContainer>
		);
	},


});

export default ItemEditForm;