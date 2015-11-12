import React from 'react/addons';
import BS from 'react-bootstrap';
import _t from '../utils/lang';

const FilePreview = React.createClass({

	mixins: [
		React.addons.PureRenderMixin
	],
	
	getInitialState () {
		return {
			showModal: false
		}
	},

	handleImageClick (e) {
		this.setState({
			showModal: true
		})
	},

	handlePreviewHide () {
		this.setState({
			showModal: false
		});
	},

	render () {
		var renderFunc = this.props.file.type === 'image' ? 'renderImage' : 'renderFile';

		return this[renderFunc](this.props.file);

	},



	renderImage (data) {
		return (
		<div>
			<div className="ka-edit-preview image">
				<img onClick={this.handleImageClick} src={data.previewImage} />
			</div>
			<div className="ka-edit-metadata">
				{data.created} &bull; {data.size} {data.extension}
			</div>
			<div className="ka-edit-download">
				<BS.Button block bsStyle='primary' href={data.url}><BS.Glyphicon glyph='download' /> {_t('KickAssets.DOWNLOAD', 'Download')} {data.size && `(${data.size})`}</BS.Button>
			</div>
			{this.state.showModal && 
				<BS.Modal onRequestHide={this.handlePreviewHide} closeButton>
					<img src={data.detailImage} />
				</BS.Modal>
			}
		</div>
		);			
	},

	renderFile (data) {
		return (
		<div>
			<div className="ka-edit-preview generic">
				<img src={data.iconURL} />
				<h3><span className="size">{data.size}</span> / <span className="extension">{data.extension}</span> {_t('KickAssets.FILE','File')}</h3>

				<div className="ka-edit-download">
					<BS.Button block bsStyle='primary' href={data.url}><BS.Glyphicon glyph='download' /> {_t('KickAssets.DOWNLOAD', 'Download')} {data.size && `(${data.size})`}</BS.Button>
				</div>
			</div>
			<div className="ka-edit-metadata">
				{data.created}
			</div>
		</div>
		);			

	}

});

export default FilePreview;