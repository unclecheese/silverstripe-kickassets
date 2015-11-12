const isElementInView = (el, container) => {
	if(typeof el === "string") {
		el = document.querySelector(el);
	}

	if(typeof container === "string") {
		container = document.querySelector(container);
	}

	if(!el || !container) return null;

	const rect = el.getBoundingClientRect();

	return rect.bottom < container.offsetHeight;
};


export default isElementInView;