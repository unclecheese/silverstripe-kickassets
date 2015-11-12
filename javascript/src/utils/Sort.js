import _t from './lang';

const createSort = (prop, dir, formatter) => {
	return (a, b) => {	
		let comp, result, aVal, bVal;
		
		aVal = a.get(prop);
		bVal = b.get(prop);

		if(formatter) {
			aVal = formatter(aVal);
			bVal = formatter(bVal);
		}

		comp = dir === 'asc' ? -1 : 1;
		result = (aVal < bVal) ? comp : ( (aVal > bVal) ? (comp * -1) : 0 );

		if(a.get('type') === 'folder' && b.get('type') !== 'folder') return -1;
		if(a.get('type') !== 'folder' && b.get('type') === 'folder') return 1;
		
		return result === 0 ? (a.get('id') - b.get('id')) : result;
	};
};

const Sorter = {
	
	'az': {
		label: _t('KickAssets.SORTTITLEAZ','Title: A-Z'),
		func: createSort ('title', 'asc', val => {
			return String(val).toLowerCase();
		})
	},

	'za': {
		label: _t('KickAssets.SORTTITLEZA','Title Z-A'),
		func: createSort ('title', 'desc', val => {
			return String(val).toLowerCase();
		})
	},

	'oldest': {
		label: _t('KickAssets.SORTOLDEST','Oldest'),
		func: createSort ('created', 'asc', val => {
			return new Date(val);
		})
	},

	'newest': {
		label: _t('KickAssets.SORTNEWEST','Newest'),
		func: createSort ('created', 'desc', val => {
			return new Date(val);
		})
	},

	'latest' : {
		label: _t('KickAssets.SORTLASTUPDATED','Last updated'),
		func: createSort ('updated', 'desc', val => {
			return new Date(val);
		})		
	},

	'kind': {
		label: _t('KickAssets.SORTKIND','Kind'),
		func: createSort ('extension', 'asc', val => {
			return String(val).toLowerCase();
		})
	},

	'kinddesc': {
		label: _t('KickAssets.SORTKIND','Kind'),
		func: createSort ('extension', 'desc', val => {
			return String(val).toLowerCase();
		})
	}
};

export default Sorter;