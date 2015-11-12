import React from 'react';
import Config from '../stores/Config';

const FolderItemImage = React.createClass({
	
	propTypes: {
		type: React.PropTypes.oneOf(['image', 'file', 'folder']),
		iconURL: React.PropTypes.string,
		title: React.PropTypes.string,
		extension: React.PropTypes.string
	},

	getInitialState () {
		return {
			src: this.props.iconURL || this.getIconPath(this.props.extension)
		}
	},

	componentWillReceiveProps (nextProps) {		
		this.setState({
			src: nextProps.iconURL || this.getIconPath(nextProps.extension)
		});
	},

	getIconPath () {
		const ext = this.props.extension || this.props.title.split('.').pop().toLowerCase(),
			  iconSize = Config.get('iconSize'),
			  thumbnailsDir = Config.get('thumbnailsDir');

		return `${thumbnailsDir}/${iconSize}px/${ext}.png`;	
	},

	showBlank () {
		this.setState({
			src: this.getIconPath('_blank')
		});
	},

	render () {
		return <img draggable={false} src={this.state.src} onError={this.showBlank} />
	}
});

export default FolderItemImage;