import React from 'react';
import ClassNames from 'classnames';

const LazyLoad = React.createClass({
	displayName: 'LazyLoad',
	
	propTypes: {
		height: React.PropTypes.string,
		scroll: React.PropTypes.number,
		visibleByDefault: React.PropTypes.bool
	},

	getInitialState () {
		return {
			visible: this.props.visibleByDefault
		};
	},

	getDefaultProps () {
		return {
			scroll: null,
			visibleByDefault: false
		};
	},

	handleScroll () {
		const bounds = React.findDOMNode(this).getBoundingClientRect(),
			  scrollTop = this.props.scroll === null ? window.pageYOffset : this.props.scroll,
			  top = bounds.top + scrollTop,
			  height = bounds.bottom - bounds.top,
			  viewHeight = this.props.scroll === null ? window.innerHeight : height;

		if(top < (scrollTop + viewHeight) && (top + viewHeight) > scrollTop){
			this.setState({visible: true});
			this.handleVisible();
		}
	},

	handleVisible () {
		if(this.props.scroll === null) {
			window.removeEventListener('scroll', this.handleScroll);
			window.removeEventListener('resize', this.handleScroll);
		}
	},

	componentDidMount() {
		if(this.props.scroll === null) {
			window.addEventListener('scroll', this.handleScroll);
			window.addEventListener('resize', this.handleScroll);
		}
		this.handleScroll();
	},

	componentDidUpdate () {
		if(!this.state.visible) this.handleScroll();
	},

	componentWillUnmount () {
		this.handleVisible();
	},

	render () {
		let renderEl = '',
			preloadHeight = {
				height: this.props.height
			},
			classes = ClassNames({
				'lazy-load': true,
				'lazy-load-visible': this.state.visible
			});

		return (
			<div style={preloadHeight} className={classes}>
				{() => {
					return this.state.visible ? this.props.children : ''
				}()}
			</div>
		);
	}
});

module.exports = LazyLoad;