import React from 'react/addons';
import BS from 'react-bootstrap';
import _t from '../utils/lang';

const SearchForm = React.createClass({

	mixins: [
		React.addons.PureRenderMixin
	],

	propTypes: {
		value: React.PropTypes.string,
		onUpdate: React.PropTypes.func
	},

	getInitialState () {
		return {
			search: this.props.value 
		};
	},

	getDefaultProps () {
		return {
			onSearch: () => {},
			value: ''
		};
	},

	componentWillReceiveProps (nextProps) {		
		this.setState({
			search: nextProps.value
		})
	},

	handleChange (e) {
		this.setState({
			search: e.target.value
		});
	},

	reset () {
		this.setState({
			search: null
		});
		this.props.onUpdate(null);
	},

	handleSubmit (e) {
		e.preventDefault();
		this.props.onUpdate(this.state.search);
	},

	render () {
		return (
            <form className="ka-search" onSubmit={this.handleSubmit}>
                <div className="input-group">
                    <input 
                    	value={this.state.search} 
                    	onChange={this.handleChange} 
                    	type="text" 
                    	className="form-control input-sm" 
                    	name="search" 
                    	placeholder={_t('KickAssets.SEARCHFILES','Search files')} />
                    <BS.Glyphicon onClick={this.reset} glyph='remove-circle' />
                </div>
            </form>
		);
	}
});

export default SearchForm;