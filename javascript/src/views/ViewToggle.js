import React from 'react';
import {ButtonGroup, Button, Glyphicon} from 'react-bootstrap';

const ViewToggle = React.createClass({

	propTypes: {
		view: React.PropTypes.string,
		onToggle: React.PropTypes.func
	},

	toggleList () {
		this.props.onToggle('list');
	},

	toggleGrid () {
		this.props.onToggle('grid');
	},

	render () {
		return this.props.view === 'list' ? (					
					<Button onClick={this.toggleGrid}>
						<Glyphicon glyph='th' />
					</Button>
				) : (

					<Button onClick={this.toggleList}>
						<Glyphicon glyph='list' />
					</Button>
				);
	}
});

export default ViewToggle;