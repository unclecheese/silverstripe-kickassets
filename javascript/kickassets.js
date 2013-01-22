(function($) {

$('#kickassets').entwine({

	DefaultThumbnailSize: 64,

	MaxThumbnailSize: 400,

	FileCounter: 0,
	
	Placeholders: {},

	onmatch: function() {
		var self = this;
		this.getToolbar().deactivateBulkActions();		
		this.activate();
		this.loadPlaceholders();
		this.fileupload({
			url: this.data('upload-url'),
			dropZone: this.getList(),
		    uploadTemplateId: null,
		    downloadTemplateId: null,
		    start: function () {
		    	self.getProgressIndicator().reveal();
		    },
		    add: function(event, data) {
		    	$.each(data.files, function(i, file) {
		    		self.setFileCounter(self.getFileCounter()+1);
    				var fileid = "kickassets-placeholder-"+self.getFileCounter();
    				var ext = file.name.split('.').pop();
		    		self.getList().find('ul').append("<li id='"+fileid+"' class='kickassets-item placeholder'><img class='kickassets-icon' src='"+self.getPlaceholderFor(ext)+"' /><span class='kickassets-filename'></span></li>");
		    		data.containerID = fileid;
		    		console.log("file id ", fileid);
		    	});
				self.getSlider().applySize();
				data.submit();

		    },
		    done: function() {
		    	self.refresh();
		    	self.getProgressIndicator().conceal();		    
		    },
		    progress: function(e, data) {
		    	var progress = parseInt(data.loaded / data.total *100, 10);
		    	var opacity = progress/100;
		    	if(opacity < 0.1) opacity = 0.1;		    		    	
		    	$('#'+data.containerID).css({'opacity': opacity }).find('.kickassets-filename').text(progress+"%");		    	
		    	if(progress == 100) {
		    		setTimeout(function() {
		    			$('#'+data.containerID).find('.kickassets-filename').text(" ").addClass("processing");
		    		},1000);
		    	}
		    },
		    progressall: function(e, data) {
		    	var progress = parseInt(data.loaded / data.total * 100, 10);		    	
		    	$('#kickassets-progress-all').val(progress).trigger('change');
		    	if(progress == 100) {
		    		setTimeout(function() {
		    			$('#'+data.containerID).find('.kickassets-filename').text('Processing...');
		    		},1000);
		    	}
		    }
		});


		this.selectable({
			cancel: "[contenteditable], #kickassets-edit-form",
			filter : '.kickassets-item',
			selected : function() {	
				self.toggleSelection($('.ui-selected').length > 1);
			},
			unselected : function() {
				self.toggleSelection(false);
			},
			distance: 50
		});


	},

	activate: function() {
		this.getSlider().setValue(this.getThumbnailSize());				
		this.getList().getItems().show();
	},
	
	refresh: function() {
		var self = this;
		$.ajax({
			url: this.getList().data('refresh-url'),
			success: function(data) {
				self.getList().html(data);				
				self.activate();
			}
		})
	},

	getList: function() {
		return $('#kickassets-main');
	},


	getToolbar: function() {
		return $('#kickassets-toolbar');
	},


	getSlider: function () {
		return $('#kickassets-slider');
	},

	getEditForm: function() {
		return $('#kickassets-edit-form');
	},

	toggleSelection: function(bool) {
		if(bool) {
			this.getToolbar().activateBulkActions();
		}
		else {
			this.getToolbar().deactivateBulkActions();
		}
	},


	moveFiles: function(fileList, destinationID) {
		var self = this;
		$.ajax({
			url: this.getList().data('move-url'),
			data: {
				items: fileList,
				destination: destinationID
			},
			type: "POST",
			success: function(data) {
				self.refresh();
			}
		})
	},


	getThumbnailSize: function() {
		return window.localStorage.getItem("KickAssets.SliderPosition") || this.getDefaultThumbnailSize()
	},


	linkTo: function(Action, ID, OtherID) {
		var url = this.data('base-url');
		if(Action) url += Action+"/";
		if(ID) url += ID+"/";
		if(OtherID) url += OtherID+"/";
		return url;
	},


	getItemByID: function(id) {
		return this.find('.kickassets-item[data-id='+id+']');
	},

	getProgressIndicator: function() {
		return $('#kickassets-progress-all-wrap');
	},


	loadPlaceholders: function() {
		self = this;
		$.ajax({
			url: this.linkTo("getplaceholders"),
			dataType: "JSON",
			success: function(json) {
				self.setPlaceholders(json);
			}
		})
	},

	getPlaceholderFor: function(ext) {
		list = this.getPlaceholders();
		if(result = list[ext.toLowerCase()]) {
			return "kickassets/images/icons/"+result+"_bw.png";
		}
		return "kickassets/images/icons/generic_bw.png";
	}


});


$('#kickassets *').entwine({
	getContainer: function() {
		return $('#kickassets');
	}	
});


$('#kickassets-main').entwine({


	onclick: function(e) {		
		if($(e.target).attr('id') == this.attr('id')) {
			this.unselectAll();
		}
	},


	getSelectedItems: function() {
		return $('.ui-selected', this);
	},


	unselectAll: function() {		
		this.getSelectedItems().removeClass('ui-selected');
		$('.kickassets-filename:focus').blur().removeClass('selected');
	},


	selectAll: function() {
		this.find('.kickassets-item').select();
	},


	getImages: function() {
		return this.find('.kickassets-image');
	},

	getItems: function() {
		return this.find('.kickassets-item');
	},


	resizeTo: function(size) {
		var self = this;
		this.getItems().css({
			width: size,
			height: size
		});	
		var $icons = this.find('.kickassets-icon');
		var w = self.getContainer().getSlider().getValue();		
		if($icons) {			
			$icons.each(function() {				
				var $icon = $(this);
				var max = parseInt($icon.css('max-width'));
				var width = w > max ? max : w;				
				$icon.css({
					"margin-left": ((width/2)*-1)+"px",
					"margin-top": ((width/2)*-1)+"px"
				})
				
			})
		}	
	},
});


$('#kickassets-toolbar').entwine({

	activateBulkActions: function() {
		this.find('.kickassets-bulk-action').attr('disabled', false);
	},

	deactivateBulkActions: function() {
		this.find('.kickassets-bulk-action').attr('disabled', true);
	}
})

$('li.kickassets-item').entwine({
	
	onmatch: function() {
		var self = this;		
		this.draggable({			
			delay: 500,
			distance: 30,
			helper: function(){
				var selected = self.getContainer().getList().getSelectedItems();
				if (selected.length === 0) {
				  selected = $(this);
				}
				var container = $('<div/>').attr('id', 'draggingContainer');
				container.append(selected.clone());
				return container; 
			}
		});
	},

	updateTitle: function(title) {
		var self = this;
		$.ajax({
			url: this.data('update-url'),
			data: {
				title: title
			},
			success: function() {
				self.getContainer().refresh();
			}
		})
	},


	setSelected: function(bool) {
		console.log("set selected");
		this.toggleClass('ui-selected', bool);
	}



});


$('.kickassets-item a').entwine({

	onclick: function(e) {		
		e.preventDefault();
	},

});


$('.kickassets-folder a').entwine({
	ondblclick: function(e) {
		var href = this.attr('href'), 
			url = (href && !href.match(/^#/)) ? href : this.data('href'),
			data = {pjax: this.data('pjaxTarget')};
		

		$('.cms-container').entwine('ss').loadPanel(url, null, data);
		e.preventDefault();

	}
});

$('.kickassets-file a').entwine({

	ondblclick: function(e) {
		var self = this;
		$.ajax({
			url: this.attr('href'),
			success: function(data) {
				self.getContainer().getEditForm().html(data);
				self.getContainer().getEditForm().reveal();
			}
		});		
	}
})


$('.kickassets-item img').entwine({

	onclick: function(e) {		
		if(!e.metaKey) {
			this.getContainer().getList().unselectAll();			
		}
		$(this).closest('li').setSelected(true);
		var items = this.getContainer().getList().getSelectedItems();
		if(items.length) {
			this.getContainer().toggleSelection(items.length > 1);
		}
		else {
			this.getContainer().toggleSelection(false);
		}
		this._super(e);
	},


});

$('.kickassets-item *').entwine({
	getItem: function() {
		return this.closest('.kickassets-item');
	},


});


$('.kickassets-item').entwine({
	
	getID: function() {
		return this.data('id');
	},


});



$('.kickassets-item .kickassets-filename').entwine({
	
	OriginalText: null,


	onclick: function() {
		this.addClass('selected');
		this.focus();
	},


	onfocusin: function() {
		this.setOriginalText(this.text());
	},

	onfocusout: function() {				
		if(this.getOriginalText() && this.text() != this.getOriginalText()) {
			this.getItem().updateTitle(this.text());	
		}			
	},

	onkeydown: function(e) {
		if(e.keyCode == 13) {
			e.preventDefault();
			this.blur();
		}
	}

});


$('.kickassets-folder:not(.ui-selected)').entwine({

	onmatch: function() {
		var self = this;
		this.droppable({			
			over: function() {
				self.css('background','#ddd');
			},
			out: function() {
				self.css('background','transparent');			
			},
			drop: function(event, ui) {								
				var files = [];
				$('#draggingContainer li').each(function() {
					files.push($(this).data('id'));
				});
				self.getContainer().moveFiles(files, $(event.target).data('id'));
			},
			tolerance: 'pointer'
		});

	}
});


$('#kickassets-slider').entwine({

	onmatch: function() {
		var self = this;
		this.slider({
			slide: function () {
				window.localStorage.setItem("KickAssets.SliderPosition", self.getValue());
				self.applySize();
			},
			change: function() {
				window.localStorage.setItem("KickAssets.SliderPosition", self.getValue());
				self.applySize();				
			},
			min: self.getContainer().getDefaultThumbnailSize(),
			max: self.getContainer().getMaxThumbnailSize()
		})
	},


	applySize: function() {
		var val = this.getValue();
		this.getContainer().getList().resizeTo(val);		
	},


	setValue: function (val) {
		this.slider("value", val);		
		this.applySize();
	},


	getValue: function() {
		return this.slider("value");
	}
})


$('.kickassets-list-refresh').entwine({
	onclick: function(e) {
		e.preventDefault();
		var self = this;
		$.ajax({
			url: this.data('url'),
			success: function(data) {
				self.getContainer().refresh()
			}
		})
	}
});



$('.kickassets-bulk-action').entwine({

	onclick: function(e) {
		list = [];
		var self = this;
		this.getContainer().getList().getSelectedItems().each(function() {
			list.push($(this).data('id'));
		});
		$.ajax({
			url: this.data('url'),
			data: {
				ids: list
			},
			type: "POST",
			success: function() {				
				self.getContainer().refresh();
			}
		})
	}
});


$('.kickassets-progress').entwine({
	onmatch: function() {
		var self = this;		
		self.hide();
		setTimeout(function() {
			self.show();
			self.knob({	       
				readOnly: true,
				fgColor: "#aaa",
				bgColor: "#ddd",
				thickness: 0.3
			});
		}, 1000);
	}
});


$('#kickassets-progress-all-wrap').entwine({

	reveal: function() {
		this.find('> div').css({"left": "10px"});
	},

	conceal: function() {		
		this.find('> div').css({"left": "-9999px"});
	}
});


$('#kickassets-edit-form').entwine({

	reveal: function() {
		console.log("reveal");
		this.animate({
			width: "600px"
		});
	},

	obscure: function() {
		this.animate({
			width:0
		})
	}

});


$('#kickassets-edit-form form').entwine({
	onsubmit: function(e) {
		e.preventDefault();
		var self = this;
		$.ajax({
			url: this.attr('action'),
			type: "POST",
			data: this.serialize(),
			success: function(data) {
				self.find("#Form_EditForm_error").text(data).addClass("good").slideDown();
				setTimeout(function() {
					self.find("#Form_EditForm_error").fadeOut()
				},3000);
			}
		});
	}
});

$('#kickassets-edit-form [name=action_doFileCancel]').entwine({
	onclick: function(e) {
		e.preventDefault();
		this.getContainer().getEditForm().obscure();
	}
})






})(jQuery);