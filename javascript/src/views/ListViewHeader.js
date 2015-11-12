import React from 'react';
import ListViewColumn from './ListViewColumn';

const ListViewHeader = React.createClass({

	propTypes: {
		sort: React.PropTypes.string,
		onSortChange: React.PropTypes.func.isRequired
	},

	handleSortChange (key) {
		this.props.onSortChange(key);
	},

	render () {
		const s = this.props.sort;

		return (
			<div className="list-view-header">
				<div className="folder-item-cell icon" />
				<ListViewColumn onSortChange={this.handleSortChange} className="folder-item-cell file-name" sort={s} ascKey='az' descKey='za'>Filename</ListViewColumn>
				<ListViewColumn onSortChange={this.handleSortChange} className="folder-item-cell file-created" sort={s} ascKey='newest' descKey='oldest'>Date added</ListViewColumn>
				<ListViewColumn onSortChange={this.handleSortChange} className="folder-item-cell file-kind" sort={s} ascKey='kind' descKey='kinddesc'>Kind</ListViewColumn>
				<div className="folder-item-cell action" />
			</div>
		);
	}
});

export default ListViewHeader;