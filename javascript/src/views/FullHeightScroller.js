import React from 'react/addons';

var FullHeightScroller = React.createClass({

	mixins: [React.addons.PureRenderMixin],

	propTypes: {
		component: React.PropTypes.string,
		pad: React.PropTypes.number
	},

	getDefaultProps () {
		return {
			component: 'div',
			pad: 0
		};
	},

	getInitialState () {
		return {
			height: 0
		};
	},

	componentDidMount () {
		window.addEventListener('resize', this.setSize);		
		this.setSize();
	},

	componentDidUnmount () {
		window.removeEventListener('resize', this.setSize);
	},

	componentDidUpdate () {
		this.setSize();
	},

	render () {
		let style = {
			overflowY: 'auto',
			height: this.state.height
		};

		return (
			<this.props.component {...this.props} style={style}>
				{this.props.children}
			</this.props.component>
		);
	},

	getSize () {
		if(!this.isMounted()) return 0;

		const top = React.findDOMNode(this).getBoundingClientRect().top;
		
		return window.innerHeight - top - this.props.pad;
	},

	setSize () {		
		this.setState({
			height: this.getSize()
		});
	}

});

export default FullHeightScroller;