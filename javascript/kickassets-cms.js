window.KickAssets = {

	_dialog: null,

	_defaults: {
		allowSelection: false,
		maxSelection: 0,
		folderID: 0,
		canUpload: true,
		canDelete: true,
		canEdit: true,
		canCreateFolder: true,
		canBrowse: true,
		allowedTypes: 'file,image,folder',
		allowedExtensions: null
	},

	open: function (params, onComplete) {
		var dialog = jQuery('<div class="kickassets-dialog"/>');

		dialog.ssdialog({
			iframeUrl: this.getLink(params),
			height: (window.innerHeight*0.95), 
			minHeight: (window.innerHeight*0.95), 
			width: (window.innerWidth*0.95),
			minWidth: (window.innerWidth*0.95)
		});

		dialog.ssdialog('open');

		this._dialog = dialog;
		this.onComplete = onComplete;
	},	

	finish: function (files) {
		this._dialog.ssdialog('close');
		this._dialog = null;

		(typeof this.onComplete === 'function') && this.onComplete(files);
	},

	requestFile: function (a, b) {
		var params = (typeof a === 'function') ? {} : a;
		var callback = (typeof a === 'function') ? a : b;
		params.allowSelection = true;
		params.maxSelection = 1;

		this.open(params, function (files) {
			callback(files[0])
		});
	},

	requestFiles: function (a, b) {
		var params = (typeof a === 'function') ? {} : a;
		var callback = (typeof a === 'function') ? a : b;
		params.allowSelection = true;

		this.open(params, callback);
	},

	onComplete: function (files) {

	},	

	getLink: function (params) {
		var merged = {};
		if(!params) params = {};
		
		for(var setting in this._defaults) {
			if(params[setting] !== undefined) {
				merged[setting] = params[setting];
			}
			else {
				merged[setting] = this._defaults[setting];
			}
		}

		return 'admin/kickassets/show/'+merged.folderID+'?'+this._serialise(merged);	
	},

	_serialise: function(obj) {
	  var str = [];
	  for(var p in obj)
	    if (obj.hasOwnProperty(p)) {
	      if(obj[p] === true) obj[p] = 1;
	      if(obj[p] === false) obj[p] = 0;

	      str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
	    }
	  return str.join("&");
	}	
};

(function ($) {

$.entwine('ss', function($) {
	$('.cms #cms-menu ul.cms-menu-list li#Menu-KickAssets a').entwine({

		onclick: function (e) {			
			e.preventDefault();
			KickAssets.open();
		}
	});
});


})(jQuery);