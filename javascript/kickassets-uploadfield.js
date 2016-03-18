(function($) {
$.entwine('ss', function ($) {
	$('body div.ss-upload').entwine({

			FolderID: null,

			onmatch: function () {
				this._super();
				var iFrameURL = this.getConfig().urlSelectDialog,
					self = this,
					folderURL = iFrameURL.replace(/select/,'folderid');

				$.ajax({
					url: folderURL,
					type: 'GET',
					success: function (response) {
						self.setFolderID(parseInt(response));
					}
				})
			},

			openSelectDialog: function(uploadedFile) {

				if(this.getFolderID() === null) return;

				// Create dialog and load iframe
				var self = this, config = this.getConfig();				
				var method = config.allowedMaxFileNumber === 1 ? 'requestFile' : 'requestFiles';
				var params = {
					maxSelection: config.allowedMaxFileNumber || 0,
					maxFilesize: null,
					folderID: this.getFolderID(),
					canUpload: config.canUpload,
					canDelete: false,
					canEdit: true,
					canCreateFolder: true,										
					allowedExtensions: config.acceptFileTypes.split(')(')[1].slice(0, -2).split('|')
				};
				
				var uploadedFileId = null;
				if (uploadedFile && uploadedFile.attr('data-fileid') > 0){
					uploadedFileId = uploadedFile.attr('data-fileid');
				}

				window.KickAssets[method](params, function (result) {
					var files = (method === 'requestFile') ? [result] : result;
					var ids = files.map(function (file) {
						return file.id;
					});
					self.attachFiles(ids, uploadedFileId);
				});
			}

	})
})

}(jQuery));
