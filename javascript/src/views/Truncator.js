import React from 'react';

const Truncator = React.createClass({

	propTypes: {
		startChars: React.PropTypes.number,
		endChars: React.PropTypes.number,
		middleString: React.PropTypes.string,
		component: React.PropTypes.oneOfType([
			React.PropTypes.func,
			React.PropTypes.string
		])
	},

	getDefaultProps () {
		return {
			startChars: 10,
			endChars: 10,
			middleString: '...',
			component: 'span'
		};
	},


	render () {
		return (
			<this.props.component {...this.props}>
				{this.truncate()}
			</this.props.component>
		);
	},


	truncate () {
		let str = this.props.children || '',			
			start = this.props.startChars,
			end = this.props.endChars,
			mid = this.props.middleString,
			max = this.props.startChars + this.props.endChars;

		if (str.length > max) {
			return str.substr(0, start) + mid + str.substr(str.length-end, str.length);
		}
		
		return str;
	}

});

export default Truncator;