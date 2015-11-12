import React from 'react';


export default class SelectableItem extends React.Component {

	static contextTypes = {
		registerSelectable: React.PropTypes.any
	}
	

	componentDidMount () {
		this.context.registerSelectable(React.findDOMNode(this), this.props.key);
	}


	render () {
		return <div>{this.props.children}</div>
	}
}