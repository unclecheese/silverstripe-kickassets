import React from 'react';
import FilePreview from '../views/FilePreview';
import Dropzone from '../views/Dropzone';
import Config from '../stores/Config';
import Actions from '../actions/Actions';
import FolderItemsStore from '../stores/FolderItemsStore';

const FilePreviewContainer = React.createClass({

	propTypes: {
		file: React.PropTypes.object.isRequired
	},


    addFile (Dropzone, file) {
    	Actions.replaceDetailItem(file);
    },
    
    handleThumbnail (Dropzone, file, dataUrl) { 
        Actions.alterDetailItem({
        	iconURL: dataUrl
        });       	
    },

    handleProgress (Dropzone, file, percent, bytes) {
		Actions.alterDetailItem({
			progress: percent
		});

    },

    handleUpload (Dropzone, file, response) {    	
        Dropzone.removeFile(file);        
        Actions.alterDetailItem({
        	newID: response
        });
    },

    handleError (Dropzone, file, msg) {
    	Dropzone.removeFile(file);
    	Actions.throwError(msg);
    },

	render () {
		return (
			<FilePreview file={this.props.file} />
		);
	}
});

export default FilePreviewContainer;