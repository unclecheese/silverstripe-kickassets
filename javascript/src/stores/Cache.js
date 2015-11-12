import sizeof from 'object-sizeof';
import Config from './Config';

const __data = {};

const Cache = {

	store (keys, data) {
		const dataSize = sizeof(data);
		const maxSize = Config.get('maxCacheSize');
		const k = key(keys);

		if(__data[k]) delete __data[k];

		while( ((cacheSize() + dataSize) > maxSize)) {
			if(!numItems()) {
				return;
			}
			
			purgeOldest();
		}

		__data[k] = {
			lastAccessed: now(),
			data
		};
	},


	retrieve (keys) {		
		const result = __data[key(keys)];
		
		if(result) {
			result.lastAccessed = now();

			return result.data;
		}

		return false;
	}	
};

const key = (keys) => {
	return Array.isArray(keys) ? keys.join('') : keys;
};

const now = () => {
	return +new Date();
};

const cacheSize = () => {
	return sizeof(__data);
};

const numItems = () => {
	return Object.keys(__data).length
};

const purgeOldest = () => {
	let oldestKey;
	for (let key in __data) {
		if(!oldestKey || __data[key].lastAccessed < __data[oldestKey].lastAccessed) {
			oldestKey = key;
		}
	}

	delete __data[oldestKey];
};


export default Cache;