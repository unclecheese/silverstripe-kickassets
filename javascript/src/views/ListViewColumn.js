import React from 'react';
import {Glyphicon} from 'react-bootstrap';

const ListViewColumn = React.createClass({

	propTypes: {
		sort: React.PropTypes.string,
		ascKey: React.PropTypes.string,
		descKey: React.PropTypes.string,
		onSortChange: React.PropTypes.func
	},

	getArrow () {
		const {sort} = this.props;
		
		if(sort) {
			if(sort === this.props.ascKey) {			
				return <Glyphicon glyph='chevron-down' />;
			}
			if(sort === this.props.descKey) {
				return <Glyphicon glyph='chevron-up' />;	
			}
		}
		return <span />;
	},

	handleClick (e) {
		const {sort} = this.props;
		
		if(!sort) return;

		e.preventDefault();
		
		if(sort === this.props.ascKey) {
			this.props.onSortChange(this.props.descKey);
		}
		else {
			this.props.onSortChange(this.props.ascKey);
		}
	},

	render () {		
		return (
			<div {...this.props} onClick={this.handleClick}>
				{this.props.children} {this.getArrow()}
			</div>
		);
	}
});

export default ListViewColumn;