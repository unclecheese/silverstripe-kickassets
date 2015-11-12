let _data = {};

const Config = {

	init: function (data) {
		_data = data;
	},

	get: function (k) {
		return _data[k];
	}
};

export default Config;