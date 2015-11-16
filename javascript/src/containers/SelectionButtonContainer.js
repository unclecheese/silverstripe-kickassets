import React from 'react';
import Reflux from 'reflux';
import {Button} from 'react-bootstrap';
import SelectedItemsStore from '../stores/SelectedItemsStore';
import Actions from '../actions/Actions';
import Config from '../stores/Config';
import {Glyphicon, Popover} from 'react-bootstrap';
import cx from 'classnames';
import sizeFormatter from '../utils/sizeFormatter';
import _t, {sf} from '../utils/lang';

const getStoreData = () => {
	return {
		selectedItems: SelectedItemsStore.get('data'),
		valid: SelectedItemsStore.isValid(),
		error: null
	}
};

const SelectionButtonContainer = React.createClass({

	mixins: [Reflux.ListenerMixin],

	getInitialState() {
		return getStoreData();
	},

	componentDidMount () {
		this.listenTo(SelectedItemsStore, this.updateSelection);
	},

	updateSelection () {
		this.setState(getStoreData());
	},

	handleSelect (e) {
		e.preventDefault();
		
		const items = this.state.selectedItems.toJS();
		const max = Config.get('maxSelection');
		const types = Config.get('allowedTypes');
		const extensions = Config.get('allowedExtensions')
								.split(',')
								.map(ex => ex.replace(/^\./,''));

		let error;

		if(!SelectedItemsStore.isValidCount()) {
			error = sf(_t(
				'KickAssets.TOOMANYSELECTED',
				'You have selected too many items. Please select no more than %s.'
			), max);
		}

		if(!SelectedItemsStore.isValidTypes()) {
			error = sf(_t(
				'KickAssets.INVALIDTYPESSELECTED',
				'You have selected some invalid items. Please select only %s'
			), types.join(', '));
		}

		if(!SelectedItemsStore.isValidExtensions()) {
			error = sf(_t(
				'KickAssets.INVALIDEXTENSIONSSELECTED',
				'You have selected some files with invalid extensions. Please select only %s'
			), extensions.join(', '));
		}

		if(error) {
			this.setState({error});
		}

		else {
			window.parent.KickAssets.finish(
				items
			);
		}
	},

	render () {
		const count = this.state.valid ? this.state.selectedItems.count() : "!";
		const classes = cx({
			'badged-button': true,
			'btn': true,
			'btn-success': true,			
		});
		return (
			<div>
				<Button className={classes} onClick={this.handleSelect}>
					{(!this.state.valid || count > 0) &&
	        			<span className="badge badge-danger">{count}</span>
	        		}

					{sf(_t('KickAssets.SELECTNUMBERITEMS','Done'), count)}
					<Glyphicon glyph="chevron-right" />
				</Button>
				{this.state.error && 
				    <Popover placement="left" positionLeft={50} positionTop={-10}>
				    	{this.state.error}
				    </Popover>
				}
			</div>			
		);
	}
});

export default SelectionButtonContainer;