import React from 'react';
import FullHeightScroller from './FullHeightScroller';
import Truncator from './Truncator';

const SidePanel = React.createClass({

	propTypes: {
		onClose: React.PropTypes.func
	},

	close (e) {
		e.preventDefault();

		this.props.onClose && this.props.onClose();
	},

	render () {
		return (
			<FullHeightScroller className="ka-side-panel" {...this.props}>
				<div className="ka-edit-title">
					<Truncator startChars={20} endChars={20}>{this.props.title}</Truncator>
					<span onClick={this.close}>&times;</span>
				</div>
				{this.props.children}
			</FullHeightScroller>
		);
	}
});

export default SidePanel;