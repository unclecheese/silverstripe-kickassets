import React from 'react';
import BS from 'react-bootstrap';
import Truncator from './Truncator';
import _t from '../utils/lang';
let	 { Input, DropdownMenu, DropdownStateMixin, MenuItem } = BS;

const AutoComplete = React.createClass({

	_timeout: null,

    mixins: [DropdownStateMixin],

    propTypes: {
    	delay: React.PropTypes.number,
    	loadingContent: React.PropTypes.string,
    	emptyContent: React.PropTypes.string,
    	freeText: React.PropTypes.bool,
    	onItemSelect: React.PropTypes.func,
    	onSearch: React.PropTypes.func,
    	onInvalid: React.PropTypes.func, 
    	onNewEntry: React.PropTypes.func    	
    },

    getInitialState () {
      return {
        searchResults: [],
        currentText: this.props.value,
        invalid: false,
        selectedIndex: null,
        hasSelected: false
      }
    },

    getDefaultProps () {
    	return {
    		delay: 300,
    		freeText: false,
    		loadingContent: _t('KickAssets.LOADINGRESULTS','Loading results...'),
    		emptyContent: 'No results'
    	}
    },
    
    componentWillReceiveProps (nextProps) {
    	if(!this.state.currentText) {
	    	this.setState({
	    		currentText: nextProps.value
	    	});
    	}
    },

    componentDidMount () {
		//Listen to events outside component
		document.addEventListener('click', this.clickListener);		
		React.findDOMNode(this.refs.input).addEventListener('keyup', this.keyUpListener);
    },
    
    componentWillUnmount () {
    	document.removeEventListener('click', this.clickListener);
    	React.findDOMNode(this.refs.input).removeEventListener('keyup', this.keyUpListener);
    	
    	this.detachArrowKeyNavigation();
    },

    clickListener (ev) {
		this.setState({
			showResults: false
		});
		this.detachArrowKeyNavigation();
    },
    
    keyUpListener (ev) {
		if (ev.keyCode !== 27) return;
		this.setState({
			showResults: false
		});
		this.detachArrowKeyNavigation();
    },

    showResults () {
		this.setState({
			showResults: true
		});
		this.attachArrowKeyNavigation();
    },

    attachArrowKeyNavigation () {
    	React.findDOMNode(this.refs.input).addEventListener('keydown', this.arrowKeyNav);
    },

    detachArrowKeyNavigation () {
    	React.findDOMNode(this.refs.input).removeEventListener('keydown', this.arrowKeyNav);	
    },

    arrowKeyNav (e) { 
    	switch (e.keyCode) {
    		case 38:
    			this.selectPrevious();
    			break;

    		case 40:    		
    			this.selectNext();
    			break;
    		case 13:
    			e.preventDefault(); 
    			e.stopPropagation();
    			this.searchResultClicked(this.state.selectedIndex)();
    			break;
    	}
    },

    selectPrevious () {
    	if(this.state.selectedIndex) {
    		this.setState({
    			selectedIndex: this.state.selectedIndex - 1
    		});
    	}
    },

    selectNext () {
    	let i = this.state.selectedIndex;
    	if(i === null) {
    		i = 0;
    	}
    	else if(this.state.searchResults[i+1]) {
    		i++;
    	}

		this.setState({
			selectedIndex: i
		});
    },
    
    handleTyping (ev) {
		var key = ev.target.value;

		this.setState({
			currentText: key
		});

		window.clearTimeout(this._timeout);
		this._timeout = window.setTimeout(() => {		
			if (this.props.onSearch) {
				this.setState({loading: true});
				this.props.onSearch(this.state.currentText, results => {
					const invalid = (!results.length && !this.props.freeText);
					const newEntry = (!results.length && this.props.freeText);
					this.setState({
						hasSelected: false,
						searchResults: results,
						loading: false,
						invalid
					});					
					this.props.onInvalid && this.props.onInvalid(invalid);
					this.props.onNewEntry && this.props.onNewEntry(newEntry ? key : false);
				});
				this.showResults();
			}
		}.bind(this),this.props.delay);
    },
    
    handleBlur () {
    	if(this.state.invalid) {    		
    		this.setState({
    			currentText: this.props.value,
    			invalid: false
    		});
    	}
    	if(this.props.onNewEntry) {	    	
	    	this.props.onNewEntry(this.state.hasSelected ? false : this.state.currentText);
    	}
    },

    searchResultClicked (i) {		
		const obj = this.state.searchResults[i];
		
		return ev => {
			if(ev) {
				ev.preventDefault();
				ev.stopPropagation();			
			}

			this.setState({
				hasSelected: true,
				showResults: false,
				currentText: obj.text
			});
			this.props.onItemSelect && this.props.onItemSelect(obj);
		};
    },
    
    renderResults () {
		if (this.state.loading) {
			return <li>{this.props.loadingContent}</li>;
		}
		if (!this.state.searchResults.length) {
			return this.props.freeText ? null : <li>{this.props.emptyContent}</li>;
		}

		
		return this.state.searchResults.map((one, i) => {
			const klass = (i === this.state.selectedIndex) ? 'selected' : '';
			return (
				<MenuItem key={i} className={klass} onClick={this.searchResultClicked(i)}>
					<Truncator startChars={30} endChars={30}>{one.text}</Truncator>
				</MenuItem>
			);
		});
    },
    
    render () {		
		let cls = 'dropdown';
		if (this.state.showResults) cls += ' open';

		if(this.state.invalid) {
			cls += ' invalid';
		}

		const results = this.renderResults();
		const dropdown = results ? <DropdownMenu ref="menu">{results}</DropdownMenu> : <div />;
		
		return (
			<div className={cls}>
				<Input className="dropdown-toggle"
					{...this.props}
					onChange={this.handleTyping}
					onBlur={this.handleBlur}
					key={0}
					type="text"
					ref="input"
					value={this.state.currentText} />
					{dropdown}
			</div>
		);
    }
});

export default AutoComplete;