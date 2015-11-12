import React from 'react';
import Reflux from 'reflux';
import Dropzone from '../views/Dropzone';
import Config from '../stores/Config';
import Actions from '../actions/Actions';
import DragAndDropStore from '../stores/DragAndDropStore';
import _t, {sf} from '../utils/lang';

const getStoreState = () => {
	return {
		dragging: DragAndDropStore.get('active')
	}
}
const DropzoneContainer = React.createClass({

	mixins: [
		React.addons.PureRenderMixin,
		Reflux.ListenerMixin
	],

	propTypes: {
		items: React.PropTypes.object.isRequired,
		folderID: React.PropTypes.oneOfType([
			React.PropTypes.string,
			React.PropTypes.number
		]),
		enabled: React.PropTypes.bool
	},

	getDefaultProps () {
		return {
			enabled: true
		}
	},

	getInitialState () {
		return getStoreState();
	},

	componentDidMount () {
		this.listenTo(DragAndDropStore, this.updateFromStores);
	},

	updateFromStores () {
		this.setState(getStoreState());
	},

    addFile (Dropzone, file) {
    	Actions.beginUploading();
    	
    	let error;
		if (file.size > Dropzone.options.maxFilesize * 1024 * 1024) {
			const filesize = Math.round(file.size / 1024 / 10.24) / 100;
			const maxSize = Dropzone.options.maxFilesize;
			error = sf(_t('KickAssets.FILETOOBIG','File is too big. (%sMB). Max size: %sMB'), filesize, maxSize);
		} 
		else if (!Dropzone.constructor.isValidFile(file, Dropzone.options.acceptedFiles)) {
			error = _t('KickAssets.INVALIDFILETYPE','Invalid file type');
		} 
		else if ((Dropzone.options.maxFiles != null) && this.getAcceptedFiles().length >= this.options.maxFiles) {
			const maxFiles = Dropzone.options.maxFiles;
			error = sf(_t('KickAssets.TOOMANYFILES','Too many files. Upload no more than %s'),maxFiles);
		}

		Actions.addFile(file, error);
    },
    
    handleThumbnail (Dropzone, file, dataUrl) {
        const f = this.getFileByID(file.uuid);

        if(f) {
        	Actions.alterItem(f.toJS(), {
        		iconURL: dataUrl
        	});       	
    	}
    },

    handleProgress (Dropzone, file, percent, bytes) {
        const f = this.getFileByID(file.uuid);

    	if(f) {
    		Actions.alterItem(f.toJS(), {
    			progress: percent
    		});
        }
    },

    handleTotalProgress (Dropzone, percent, bytes) {    	
    	Actions.setTotalProgress(percent, bytes);
    },

    handleUpload (Dropzone, files, response) {
        files.forEach(file => {
            let f = this.getFileByID(file.uuid);
            if(f) {
            	Dropzone.removeFile(f);
            }        	
        });

        setTimeout(() => {
			files.forEach((f, i) => {
				Actions.replaceItem(
					this.getFileByID(f.uuid).toJS(),
					response[i]
				);		
			});

    	}, 0);
    },

    handleQueueComplete () {
    	Actions.endUploading();
    },

    // handleError (Dropzone, file, msg) {
    // 	setTimeout(() => {
    // 		Actions.removeFile(file);    		
    // 	}, 0);
    // 	Dropzone.removeFile(file);
    // 	Actions.throwError(msg);
    // },

	getFileByID (uuid) {
        return this.props.items.find(item => uuid === item.get('id'));
	},

    render () {
    	let kls = 'ka-folder-items ka-dropzone ka-main';
    	if(this.state.dragging) {
    		kls += ' dragging';
    	}
    	return <Dropzone 
		        	url={`${Config.get('baseRoute')}upload/${this.props.folderID}`}
		            previewTemplate='<span></span>'
		            acceptedFiles={Config.get('allowedExtensions')}
		            maxFilesize={Config.get('maxFilesize')}
		            uploadMultiple={true}
		            onSuccessmultiple={this.handleUpload}
		            onQueuecomplete={this.handleQueueComplete}
		            onAddedfile={this.addFile}
		            onThumbnail={this.handleThumbnail}
		            onUploadprogress={this.handleProgress}
		            onTotaluploadprogress={this.handleTotalProgress}

					parallelUploads={1}
					clickable='#ka-add-files'					
					thumbnailWidth={198}
					thumbnailHeight={132}
					previewsContainer="#ka-previews"
					disabled={this.state.dragging}
					className={kls}>
    					
    					{this.props.children}
    			
    			</Dropzone>
    }

});

export default DropzoneContainer;