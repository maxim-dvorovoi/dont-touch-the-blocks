let popupEnable = false;
let reverse = false;
let keyPress = false;
let clickCount = 0;
let score = 0;
let width = 350;
let minAreaBetweenBlocks = 500;
let bestScore = 0;
let iOS = !!navigator.platform && /iPad|iPhone|iPod/.test(navigator.platform);
bird.style.backgroundImage = "url('./img/bird.png')";

if (getCookie('flappyBestScore')) {
	let cookie = getCookie('flappyBestScore').split(',')[0];
	bestScore = cookie ? parseInt(cookie) : 0;
	document.getElementById('bestScore').innerHTML = 'BEST SCORE: ' + bestScore;
}

showHidePopup();

start.onclick = startClick;
flyClickable.onclick = clickFly;
document.addEventListener('keydown', keyDown);
document.addEventListener('keyup', function() { keyPress = false });
if (iOS) document.addEventListener('touchmove', preventDefault, { passive: false });

isLandscape();
window.onresize = isLandscape;

function showPage() {
	loader.style.display = "none";
	index.style.opacity = "1";
}

function showHidePopup() {
	if (clickCount > 0) document.getElementById('start').innerHTML = 'RESTART';

	popupEnable = !popupEnable;
	popup.style.opacity = (popup.style.opacity == 1 ? 0 : 1);
	popup.style.zIndex = (popup.style.zIndex == 1000 ? -1 : 1000);
}

function isLandscape() {
	let orientation = screen.msOrientation || screen.mozOrientation || (screen.orientation || {}).type;

	if (orientation === 'landscape-primary'
		|| orientation === 'landscape-secondary'
		|| Math.abs(window.orientation) === 90
	) {
		rotate.style.display = 'none';
	} else {
		rotate.style.display = 'block';
	}

	let scale = null;
	if (window.innerHeight < field.offsetHeight) {
		scale = window.innerHeight / field.offsetHeight - 0.05;
	} else if (window.innerWidth < field.offsetWidth) {
		scale = window.innerWidth / field.offsetWidth - 0.05;
	} else {
		let scale = null;
	}

	if (scale) {
		zoom.style.transform = 'scale(' + scale + ')';
		zoom.style.position = 'absolute';
		zoom.style.left = ((window.innerWidth - field.offsetWidth * scale) / 2) + 'px';
		zoom.style.top = ((window.innerHeight - field.offsetHeight * scale) / 2) + 'px';
	} else {
		zoom.style.transform = 'none';
		zoom.style.position = 'static';
	}
}

function startClick(event) {
	score = 0;
	reverse = false;
	bird.style.transform = 'scale(1, 1)';
	let currentClick = ++clickCount;
	let height = field.clientHeight - bird.clientHeight;
	setScore();
	showHidePopup();

	animate({
		duration: 2400,
		timing: makeEaseOut(bounce),
		draw: function(progress) {
			if (popupEnable || currentClick !== clickCount) return;

			let top = height * progress;
			if (top >= 425) showHidePopup();

			bird.style.top = top + 'px';
		}
	});

	animate({
		duration: 2000,
		timing: makeEaseOut(quad),
		draw: function(progress) {
			if (popupEnable || currentClick !== clickCount) return;

			bird.style.left = width * progress + "px";
		}
	});
}

function clickFly(event) {
	if (popupEnable) return;

	bird.style.backgroundImage = "url('./img/birdFly.png')";
	setTimeout(function() {
		bird.style.backgroundImage = "url('./img/bird.png')";
	}, 200);

	let currentClick = ++clickCount;
	let spikesHeight = document.getElementsByClassName('triangle-up')[0].offsetHeight - 5;
	let maxFieldWidth = field.offsetWidth - bird.offsetWidth;
	let maxFieldHeight = field.offsetHeight - bird.offsetHeight - spikesHeight;

	let startTop = Number.parseInt(bird.style.top.substring(0,  bird.style.left.length - 2));
	let startLeft = Number.parseInt(bird.style.left.substring(0,  bird.style.left.length - 2));
	let height = field.clientHeight - bird.clientHeight;

	animate({
		duration: 1150,
		timing: makeInOut(jump),
		draw: function(progress) {
			if (popupEnable || currentClick !== clickCount) return;
			let top = startTop + height * progress;

			if ((top >= maxFieldHeight || top <= spikesHeight) && !popupEnable) showHidePopup();

			bird.style.top = (top > maxFieldHeight ? maxFieldHeight : (top < spikesHeight ? spikesHeight : top)) + 'px';
		}
	});

	animate({
		duration: 2000,
		timing: makeEaseOut(quad),
		draw: function(progress) {
			if (popupEnable || currentClick !== clickCount) return;
			if (progress < 0) progress = 0;

			let left = startLeft + width * progress * (reverse === true ? -1 : 1);

			if (left > maxFieldWidth || left < 0) {
				reverse = !reverse;
				left = left > maxFieldWidth ? maxFieldWidth : (left < 0 ? 0 : left);
				startLeft = left + (left - startLeft);
				++score;
				setScore();
			}

			let blocks = document.getElementsByClassName('block');
			for (let i = 0; i < blocks.length; i++) {
				if (
					bird.offsetLeft + bird.offsetWidth > blocks[i].offsetLeft &&
					bird.offsetLeft < blocks[i].offsetLeft + blocks[i].offsetWidth &&
					bird.offsetTop + bird.offsetHeight > blocks[i].offsetTop &&
					bird.offsetTop < blocks[i].offsetTop + blocks[i].offsetHeight
				) showHidePopup();
			}

			bird.style.transform = 'scale(' + (reverse ? -1 : 1) + ', 1)';
			bird.style.left = left + "px";
		}
	});
}

function jump(timeFraction) {
	return  Math.pow(timeFraction - 0.4, 2) * (timeFraction / 2 + 0.82) - 0.13;
}

function makeInOut(timing) {
	return function(timeFraction) {
		return timing(timeFraction);
	}
}

function makeEaseOut(timing) {
	return function(timeFraction) {
		return 1 - timing(1 - timeFraction);
	}
}

function bounce(timeFraction) {
	for (let a = 0, b = 1, result; 1; a += b, b /= 2) {
		if (timeFraction >= (7 - 4 * a) / 11) {
			return -Math.pow((11 - 6 * a - 11 * timeFraction) / 4, 2) + Math.pow(b, 2)
		}
	}
}

function quad(timeFraction) {
	return timeFraction;
}

function animate(options) {
	let start = performance.now();

	requestAnimationFrame(function animate(time) {
		let timeFraction = (time - start) / options.duration;
		if (timeFraction > 1) timeFraction = 1;

		let progress = options.timing(timeFraction);
		options.draw(progress);

		if (timeFraction < 1) requestAnimationFrame(animate);
	});
}

function setScore() {
	if (score > bestScore) {
		deleteCookie('flappyBestScore');
		setCookie('flappyBestScore', score, 180);
		bestScore = score;
	}

	document.getElementById('score').innerHTML = score;
	document.getElementById('bestScore').innerHTML = 'BEST SCORE: ' + bestScore;
	setStage();
}

function setStage() {
	let styleTop = 0;
	if (score >= 0 && score <2) {
		width = 350;
		minAreaBetweenBlocks = 500;
		changeColor('#7b7b7b', '#eaeaea');
		styleTop = Math.floor(Math.random() * (450 - 250)) + 250;
		block11.style.top = '-300px';
		block12.style.top = '500px';
		block21.style.top = (styleTop - minAreaBetweenBlocks) + 'px';
		block22.style.top = styleTop + 'px';
		block31.style.top = '-300px';
		block32.style.top = '500px';
	}
	if (score >= 2 && score <3) {
		changeColor('#7b6d6d', '#f5eeec');
		styleTop = Math.floor(Math.random() * (450 - 250)) + 250;
		block21.style.top = '-300px';
		block22.style.top = '500px';
		block31.style.top = (styleTop - minAreaBetweenBlocks) + 'px';
		block32.style.top = styleTop + 'px';
		width = width + 10;
	}
	if (score >= 3 && score <5) {
		styleTop = Math.floor(Math.random() * (450 - 250)) + 250;
		block11.style.top = (styleTop - minAreaBetweenBlocks) + 'px';
		block12.style.top = styleTop + 'px';
		styleTop = Math.floor(Math.random() * (450 - 250)) + 250;
		block31.style.top = (styleTop - minAreaBetweenBlocks) + 'px';
		block32.style.top = styleTop + 'px';
		width = width + 10;
	}
	if (score >= 5 && score < 15) {
		if (score < 10) changeColor('#6b747b', '#bed5ea');
		styleTop = Math.floor(Math.random() * (450 - 250)) + 250;
		block11.style.top = (styleTop - minAreaBetweenBlocks) + 'px';
		block12.style.top = styleTop + 'px';
		block21.style.top = '-300px';
		block22.style.top = '500px';
		styleTop = Math.floor(Math.random() * (450 - 250)) + 250;
		block31.style.top = (styleTop - minAreaBetweenBlocks) + 'px';
		block32.style.top = styleTop + 'px';
		width = width + 10;
	}
	if (score >= 10 && score < 15) {
		changeColor('#667b67', '#bfeac4');
	}
	if (score >= 15) {
		if (score < 20) changeColor('#7b5c62', '#eab5bb');

		minAreaBetweenBlocks = 540;
		styleTop = Math.floor(Math.random() * (450 - 250)) + 250;
		block11.style.top = (styleTop - minAreaBetweenBlocks) + 'px';
		block12.style.top = styleTop + 'px';
		styleTop = Math.floor(Math.random() * (450 - 250)) + 250;
		block21.style.top = (styleTop - minAreaBetweenBlocks) + 'px';
		block22.style.top = styleTop + 'px';
		styleTop = Math.floor(Math.random() * (450 - 250)) + 250;
		block31.style.top = (styleTop - minAreaBetweenBlocks) + 'px';
		block32.style.top = styleTop + 'px';
		width = width + 10;
	}
	if (score >= 20 && score < 25) {
		changeColor('#7b7861', '#eae6b6');
	}
	if (score >= 25) {
		changeColor('#6f637b', '#d9c5ea');
	}
}

function changeColor(primary, secondary) {
	field.style.backgroundColor = secondary;
	document.getElementById('score').style.color = secondary;
	document.body.style.backgroundColor = primary;
	let triangleUp = document.getElementsByClassName('triangle-up');
	let triangleDown = document.getElementsByClassName('triangle-down');
	let blocks = document.getElementsByClassName('block');

	for (let i = 0; i < triangleUp.length; i++) {
		triangleUp[i].style.borderBottomColor = primary;
	}
	for (let i = 0; i < triangleDown.length; i++) {
		triangleDown[i].style.borderTopColor = primary;
	}
	for (let i = 0; i < blocks.length; i++) {
		blocks[i].style.backgroundColor = primary;
	}
}

function setCookie(name, value, days) {
	let expires = "";
	if (days) {
		let date = new Date();
		date.setTime(date.getTime() + (days*24*60*60*1000));
		expires = ", expires=" + date.toUTCString();
	}
	document.cookie = name + "=" + (value || "")  + expires + ", path=/";
}

function getCookie(name) {
	let nameEQ = name + "=";
	let ca = document.cookie.split(';');
	for(let i=0;i < ca.length;i++) {
		let c = ca[i];
		while (c.charAt(0)==' ') c = c.substring(1,c.length);
		if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length,c.length);
	}
	return null;
}

function deleteCookie(name) {
	document.cookie = name+'=, Max-Age=-99999999';
}

function keyDown(event) {
	if (keyPress) return;
	if (event.keyCode === 32) {
		keyPress = true;
		return popupEnable ? startClick(event) : clickFly(event);
	}
}

function preventDefault(e){
	e.preventDefault();
}