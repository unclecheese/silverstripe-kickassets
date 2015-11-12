import React from 'react';
import Reflux from 'reflux';
import {DropdownButton, Glyphicon, MenuItem} from 'react-bootstrap';
import Sorter from '../utils/Sort';
import Navigation from '../actions/Navigation';

const SortDropdownContainer = React.createClass({

	mixins: [
		Reflux.ListenerMixin,
		React.addons.PureRenderMixin
	],

	propTypes: {
		routerParams: React.PropTypes.object.isRequired
	},

	handleSort (sort) {
		Navigation.updateSort(sort);
	},

	render () {
		const sortIcon = <Glyphicon glyph='sort' />,
			  check = <Glyphicon glyph="ok" />,
			  space = '\u00a0\u00a0',
			  sort = this.props.routerParams.get('folderParams').get('sort'),
			  keys = Object.keys(Sorter);

		keys.pop(); // remove "kind descending"

		return (
	    	<DropdownButton onSelect={this.handleSort} title={sortIcon}>
	    		{keys.map(key => {
	    			let c = sort === key ? check : space;
	    			return (
	    					<MenuItem key={key} eventKey={key}>
	    						{c} {Sorter[key].label}
	    					</MenuItem>
	    			);
	    		})}
	    	</DropdownButton>
        );

	}
});

export default SortDropdownContainer;