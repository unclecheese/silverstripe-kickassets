(function() {
	tinymce.create('tinymce.plugins.kickassets', {
		
		init : function(ed, url) {
			var self = this;
			ed.addButton ('kickassets', {
				'title' : 'Browse files...',
				'image' : url+'/../images/ka-tinymce.png',
				'onclick' : function () {
					var selection = ed.selection.getContent();
					var method = selection ? 'requestFile' : 'requestFiles';
					var params = {
						allowedTypes: 'file,image'
					};
					window.KickAssets[method](params, function (result) {
						var files = selection ? [result] : result;
						files.forEach(function (f) {
							if(f.type === 'image') {
								var img = new Image();
								img.src = f.path;
								img.onload = function() {
									var w = Math.min(this.width, 450);
									var imgTag = '<img src="'+f.path+'" title="'+f.title+'" alt="'+f.title+'" width="'+w+'" />';
									if(selection) {
										ed.selection.setContent(imgTag);
									}
									else {
										ed.execCommand('mceInsertContent', false, imgTag);
									}
								};
							}
							else if(f.type === 'file') {
								var downloadTitle = selection || f.title;
								var downloadTag = '<a href="'+f.path+'">'+downloadTitle+'</a> ';
								if(selection) {
									ed.selection.setContent(downloadTag);
								}
								else {
									ed.execCommand('mceInsertContent', false, downloadTag);
								}
							}
						});
					})
				}
			});
			
		},
		
		getInfo : function() {
			return {
				longname  : 'kickassets',
				author	  : 'Uncle Cheese',				
				infourl   : 'http://github.com/unclecheese/silverstripe-kickassets',
				version   : "3.0"
			};
		}
	});
	
	tinymce.PluginManager.add('kickassets', tinymce.plugins.kickassets);
})();
