let active = false;

const scrollToElement = (el, container, scrollDuration = 300, padding = 0) => {	
	let topFunc;

	if(active) return;

	container = container || window;	
	
	if(typeof el === "string") {
		el = document.querySelector(el);		
	}

	if(!el) return;

	active = true;
	var interval = 10;
	const step = () => {
		setTimeout(() => {			
			if(scrollDuration < 1) {
				active = false;
				return;
			}
			let scrollPos = container === window ? window.scrollY : container.scrollTop,
				offset = el.getBoundingClientRect().top,
				togo = offset - padding,
				clicksRemaining = scrollDuration/interval,
				stepSize = togo/clicksRemaining,
				nextY;
			if(offset - stepSize < padding) {
				stepSize = offset - padding;
			}
			nextY = scrollPos+stepSize;
			if(container === window) {
				container.scrollTo( 0, nextY );	
			}
			else {
				container.scrollTop = nextY;
			}
			
			scrollDuration -= interval;

			requestAnimationFrame(step);
		}, interval );
	};

	requestAnimationFrame(step);

}

export default scrollToElement;