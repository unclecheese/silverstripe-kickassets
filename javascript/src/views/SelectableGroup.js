import React from 'react';
import isNodeInRoot from '../utils/nodeInRoot';
import getBoundsForNode from '../utils/getBoundsForNode';
import doObjectsCollide from '../utils/doObjectsCollide';
const noop = () => {};

export default class SelectableGroup extends React.Component {


	static propTypes = {

		/**
		 * Event that will fire when items are selected. Passes an array of keys		 
		 */
		onSelection: React.PropTypes.func,
		
		/**
		 * The component that will represent the Selectable DOM node		 
		 */
		component: React.PropTypes.node,
		
		/**
		 * Expands the boundary of the selectable area. It can be an integer, which 
		 * applies to all sides, or an object containing "top", "bottom", "left", 
		 * and "right" values for custom distance on each side
		 */
		distance: React.PropTypes.oneOfType([
			React.PropTypes.object,
			React.PropTypes.number
		]),

		/**
		 * Amount of forgiveness an item will offer to the selectbox before registering
		 * a selection, i.e. if only 1px of the item is in the selection, it shouldn't be 
		 * included.		 
		 */
		tolerance: React.PropTypes.number,

		/**
		 * If true, allow mouse lasso selection
		 */
		allowBoxSelection: React.PropTypes.bool,
		
		/**
		 * An array of nodes representing selectable items
		 * @type {[type]}
		 */
		items: function (props) {
			if(!props.itemResolver) {
				return new Error('If using custom items, you must define a itemResolver prop to get DOM nodes from child components');
			}
			if(!Array.isArray(props.items)) {
				return new Error('items must be an array');
			}
		},

		itemResolver: React.PropTypes.func

	}


	static defaultProps = {
		onSelection: noop,
		allowBoxSelection: true,
		component: 'div',
		distance: 0,
		tolerance: 0,
	}


	state = {
		isBoxSelecting: false,
		boxWidth: 0,
		boxHeight: 0
	}


	_mouseDownData = null


	componentDidMount () {
		if(this.props.allowBoxSelection) {
			React.findDOMNode(this).addEventListener('mousedown', this._mouseDown);		
		}
	}
	

	/**	 
	 * Remove global event listeners
	 */
	componentWillUnmount () {
		if(this.props.allowBoxSelection) {		
			React.findDOMNode(this).removeEventListener('mousedown', this._mouseDown);
		}
	}


	/**
	 * Resolve the disance prop from either an Int or an Object
	 * @return {Object}
	 */
	_getDistanceData () {
		let distance = this.props.distance;

		if(!distance) {
			distance = 0;
		}
	
		if(typeof distance !== 'object') {
			return {
				top: distance,
				left: distance, 
				right: distance, 
				bottom: distance
			};
		}

		return distance;
	}


	/**
	 * Called while moving the mouse with the button down. Changes the boundaries
	 * of the selection box
	 */
	_openSelector = (e) => {		
	    const w = Math.abs(this._mouseDownData.initialW - e.pageX);
	    const h = Math.abs(this._mouseDownData.initialH - e.pageY);

	    this.setState({
	    	isBoxSelecting: true,
	    	boxWidth: w,
	    	boxHeight: h,
	    	boxLeft: Math.min(e.pageX, this._mouseDownData.initialW),
	    	boxTop: Math.min(e.pageY, this._mouseDownData.initialH)
	    });
	}


	/**
	 * Called when a user presses the mouse button. Determines if a select box should
	 * be added, and if so, attach event listeners
	 */
	_mouseDown = (e) => {
		const node = React.findDOMNode(this);
		let collides, offsetData, distanceData;
		const children = this.props.items || this.props.children;
		
		React.findDOMNode(this).addEventListener('mouseup', this._mouseUp);
		
		// Right clicks
		if(e.which === 3 || e.button === 2) return;

		if(!isNodeInRoot(e.target, node)) {	
			distanceData = this._getDistanceData();
			offsetData = getBoundsForNode(node);
			collides = doObjectsCollide(
				{
					top: offsetData.top - distanceData.top,
					left: offsetData.left - distanceData.left,
					bottom: offsetData.offsetHeight + distanceData.bottom,
					right: offsetData.offsetWidth + distanceData.right
				},
				{
					top: e.pageY,
					left: e.pageX,
					offsetWidth: 0,
					offsetHeight: 0
				}
			);
		
			if(!collides) return;
		} 
		else if (this._someItems((childNode, child) => isNodeInRoot(e.target, childNode))) {
			return;
		}


		this._mouseDownData = {			
			boxLeft: e.pageX,
			boxTop: e.pageY,
	        initialW: e.pageX,
        	initialH: e.pageY        	
		};		

		e.preventDefault();

		React.findDOMNode(this).addEventListener('mousemove', this._openSelector);
	}


	/**
	 * Called when the user has completed selection
	 */
	_mouseUp = (e) => {
	    React.findDOMNode(this).removeEventListener('mousemove', this._openSelector);
	    React.findDOMNode(this).removeEventListener('mouseup', this._mouseUp);

	    if(!this._mouseDownData) return;
	    
		return this._selectElements(e);			
	}


	/**
	 * Selects multiple children given x/y coords of the mouse
	 */
	_selectElements = (e) => {
	    this._mouseDownData = null;
	    const currentItems = [],
		      selectbox = React.findDOMNode(this.refs.selectbox),
		      {tolerance} = this.props;

		if(!selectbox) return;
		
		this._eachItem((node, child) => {
			if(node && doObjectsCollide(selectbox, node, tolerance)) {
				currentItems.push(child.key);
			}
		});

		this.setState({
			isBoxSelecting: false,
			boxWidth: 0,
			boxHeight: 0
		});

		this.props.onSelection(currentItems);
	}


	_itemLoop (method, callback) {
    	const children = this.props.items || this.props.children;
		const resolver = (key) => {
			return this.props.items ? 
				   this.props.itemResolver(key) :
				   React.findDOMNode(this.refs[`selectable__${key}`]);
		};
		return children[method](			
			child => callback(resolver(child.key), child)
		);
	}


	_eachItem (callback) {
		return this._itemLoop('forEach', callback);
	}


	_someItems (callback) {
		return this._itemLoop('some', callback);
	}



	/**
	 * Renders the component
	 * @return {ReactComponent}
	 */
	render () {

		const boxStyle = {
			left: this.state.boxLeft,
			top: this.state.boxTop,
			width: this.state.boxWidth,
			height: this.state.boxHeight,
			zIndex: 9000,
			position: 'fixed',
			cursor: 'default'
		};

		const spanStyle = {
			backgroundColor: 'transparent',
			border: '1px dashed #999',
			width: '100%',
			height: '100%',
			float: 'left'			
		};

		return (
			<this.props.component {...this.props}>				
				{this.state.isBoxSelecting &&
				  <div style={boxStyle} ref="selectbox"><span style={spanStyle}></span></div>
				}
				{this.props.children}
			</this.props.component>
		);
	}
}