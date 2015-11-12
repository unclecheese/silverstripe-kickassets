import React from 'react';
import LazyLoad from './LazyLoad';

const LazyLoadList = React.createClass({

	propTypes: {
		viewHeight: React.PropTypes.number.isRequired,
		viewWidth: React.PropTypes.number.isRequired,
		itemWidth: React.PropTypes.number.isRequired,
		itemHeight: React.PropTypes.number.isRequired,
		visibleIndexes: React.PropTypes.array,
		scroll: React.PropTypes.number,
		component: React.PropTypes.string
	},

	getDefaultProps () {
		return {
			component: 'div'
		}
	},

	render () {
		const {viewHeight, viewWidth, itemWidth, itemHeight} = this.props;
		const itemsPerRow = Math.floor(viewWidth / itemWidth);
		const rowsPerView = Math.ceil(viewHeight / itemHeight);
		const itemsPerView = itemsPerRow * rowsPerView;
		const lazyLoadHeight = rowsPerView*itemHeight;
		const items = this.props.children;
		
		let lazyLoadGroup = [];
		let allItems = [];
		let visible = false;
		items.forEach((item, index) => {
			if(!visible) {
				visible = (this.props.visibleIndexes && this.props.visibleIndexes.indexOf(index) > -1);
			}
			lazyLoadGroup.push(item);

			if ((index + 1) % itemsPerView === 0 || (index + 1) === items.length) {
				let h = lazyLoadHeight;
				if(lazyLoadGroup.length < itemsPerView) {					
					let rows = Math.ceil(lazyLoadGroup.length/itemsPerRow);
					h = rows*itemHeight;
				}
				let lazyLoadWrap = (
					<LazyLoad scroll={this.props.scroll} key={allItems.length} height={`${h}px`} visibleByDefault={visible}>
						{lazyLoadGroup}
					</LazyLoad>
				);	
				
				allItems.push(lazyLoadWrap);
				lazyLoadWrap = false;
				lazyLoadGroup = [];
				visible = false;
			}
		});

		return <this.props.component>{allItems}</this.props.component>
	}

});

export default LazyLoadList;