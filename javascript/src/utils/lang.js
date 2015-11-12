window.jQuery = () => {
	return {
		attr: () => {}		
	}
};
jQuery.fn = {};

export default (entity, fallbackString, priority, context) => {
	return ss.i18n._t(entity, fallbackString, priority, context);
};

export const sf = window.ss.i18n.sprintf;