import React from 'react/addons';
import Truncator from './Truncator';
import {DropdownButton, MenuItem, Glyphicon} from 'react-bootstrap';

const MAX_TOTAL_LENGTH = 60;
const MAX_ITEM_LENGTH = 23;

const Breadcrumbs = React.createClass({

	propTypes: {
		breadcrumbs: React.PropTypes.array,
		onSelect: React.PropTypes.func
	},

	getTruncatedBreadcrumbs () {
		let {breadcrumbs} = this.props;
		
		if(!breadcrumbs) return;
		
		let truncated = false;

		while(breadcrumbs.length) {
			let strLen = 0;
			breadcrumbs.forEach(item => {
				let len = item.title.length;
				if(len > MAX_ITEM_LENGTH) len = MAX_ITEM_LENGTH;
				strLen += len;
			});

			if(strLen < MAX_TOTAL_LENGTH) break;

			breadcrumbs.shift();
			truncated = true;
		}
		
		if(truncated) {
			breadcrumbs.unshift({
				title: '...',
				id: null				
			});
		}

		return breadcrumbs;
	},

	render () {
		const breadcrumbs = this.getTruncatedBreadcrumbs();
		if(!breadcrumbs) return <h2 />;

		return (
            <div>
				{breadcrumbs.map((item, i) => {
					const last = (i == breadcrumbs.length-1);
					const title = (i === 0) ? <Glyphicon glyph='home' /> : <Truncator>{item.title}</Truncator>;

					return (
						<span key={i}>
						{() => {
							if(item.id === null) {
								return title;
							}
							return (
								<a onClick={last ? null : this.props.onSelect.bind(null, item)}>
									{title}
								</a>
							);
						}()}
						</span>
					);
				})}
            </div>
		);
	}
});

export default Breadcrumbs;