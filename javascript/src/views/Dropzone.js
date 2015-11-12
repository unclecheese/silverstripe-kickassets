import React from 'react';
import Dropzone from 'dropzone';
import assign from 'object-assign';

Dropzone.prototype.getActiveFiles = function() {
  return this.files;
};

const DropzoneComponent = React.createClass({

	getDefaultProps () {
		return {
			disabled: false			
		};
	},

    componentDidMount () {
    	if(!this.props.disabled) {
    		this._loadDropzone();	
    	}
    	
    },

    componentWillUnmount () {
        this.dropzone.destroy();
        this.dropzone = null;
    },

    componentWillReceiveProps (nextProps) {
    	if(nextProps.disabled && !this.props.disabled) {
    		this.dropzone.destroy();
    	}
    	else if(!nextProps.disabled && this.props.disabled) {
    		this._loadDropzone();
    	}

    	this.dropzone.options.url = nextProps.url;
    },
    
    _loadDropzone () {
        let options = {};

        for (var opt in Dropzone.prototype.defaultOptions) {
            let prop = this.props[opt];
            if (typeof prop !== 'undefined') {
                options[opt] = prop;
                continue;
            }
            if(!options[opt]) {
            	options[opt] = Dropzone.prototype.defaultOptions[opt];
        	}
        }

        this.dropzone = new Dropzone(React.findDOMNode(this), options);

        this._loadEvents(assign({}, options, this.props));
    },

    _loadEvents (props) {
        let reg, matches, evt;
        for (var p in props) {
            reg = new RegExp(/^on([A-Za-z]+)/);
            if (reg.test(p)) {
                matches = reg.exec(p);
                evt = matches[1].charAt(0).toLowerCase() + matches[1].slice(1);
                this.dropzone.on(evt, props[p].bind(null, this.dropzone));
            }
        }
    },

    render () {
        return ( 
        	<div {...this.props}> 
        		{this.props.children}
        	</div>
        );
    }
});

export default DropzoneComponent;