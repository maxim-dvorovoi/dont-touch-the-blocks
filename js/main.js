let popupEnable = false;
let reverse = false;
let keyPress = false;
let clickCount = 0;
let score = 0;
let width = 350;
let minAreaBetweenBlocks = 500;
let bestScore = 0;

if (getCookie('flappyBestScore')) {
	let cookie = getCookie('flappyBestScore').split(',')[0];
	bestScore = cookie ? parseInt(cookie) : 0;
	document.getElementById('bestScore').innerHTML = 'BEST SCORE: ' + bestScore;
}

showHidePopup();
start.onclick = function(event) { startClick(event) };
field2.onclick = function(event) { clickFly(event) };

document.addEventListener('keydown', keyDown);
document.addEventListener('keyup', function() { keyPress = false });

isLandscape();
window.onresize = isLandscape;

function showPage() {
	document.getElementById("loader").style.display = "none";
	document.getElementById("index").style.display = "block";
}

function isLandscape() {
	let orientation = screen.msOrientation || screen.mozOrientation || (screen.orientation || {}).type;

	if (orientation == 'landscape-primary' || orientation == 'landscape-secondary') {
		rotate.style.display = 'none';
	} else {
		rotate.style.display = 'block';
	}
}

function keyDown(event) {
	if (keyPress) return;
	if (event.keyCode === 32) {
		keyPress = true;
		return popupEnable ? startClick(event) : clickFly(event);
	}
}

function startClick(event) {
	score = 0;
	reverse = false;
	let height = field.clientHeight - bird.clientHeight;
	bird.style.transform = 'scale(1, 1)';
	let currentClick = ++clickCount;
	setScore();
	showHidePopup();

	animate({
		duration: 2200,
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

	let spikesHeight = document.getElementsByClassName('triangle-up')[0].offsetHeight - 5;
	let maxFieldWidth = field.offsetWidth - bird.offsetWidth;
	let maxFieldHeight = field.offsetHeight - bird.offsetHeight - spikesHeight;

	let startTop = Number.parseInt(bird.style.top.substring(0,  bird.style.left.length - 2));
	let startLeft = Number.parseInt(bird.style.left.substring(0,  bird.style.left.length - 2));
	let height = field.clientHeight - bird.clientHeight;
	let currentClick = ++clickCount;

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

function showHidePopup() {
	if (clickCount > 0) document.getElementById('start').innerHTML = 'RESTART';

	popupEnable = !popupEnable;
	popup.style.opacity = (popup.style.opacity == 1 ? 0 : 1);
	popup.style.zIndex = (popup.style.zIndex == 1000 ? -1 : 1000);
}

function setScore() {
	if (score > bestScore) {
		deleteCookie('flappyBestScore');
		setCookie('flappyBestScore', score, 180);
		bestScore = score;
	}

	document.getElementById('score').innerHTML = 'SCORE: ' + score;
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
		width = width + 20;
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
	if (score >= 5) {
		minAreaBetweenBlocks = 520;
		changeColor('#6b747b', '#bed5ea');
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
}

function changeColor(primary, secondary) {
	field.style.backgroundColor = secondary;
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

function jump(timeFraction) {
	return  Math.pow(timeFraction*1.2, 2) * (2.2 * (timeFraction + 0.1) - 1.8)
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

function setCookie(name,value,days) {
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

function removeMobileOnclick() {
	if (isMobile()) {
		start.onclick  = '';
		field.onclick  = '';
	}
}

function isMobile() {
	if (navigator.userAgent.match(/Android/i)
		|| navigator.userAgent.match(/iPhone/i)
		|| navigator.userAgent.match(/iPad/i)
		|| navigator.userAgent.match(/iPod/i)
		|| navigator.userAgent.match(/BlackBerry/i)
		|| navigator.userAgent.match(/Windows Phone/i)
		|| navigator.userAgent.match(/Opera Mini/i)
		|| navigator.userAgent.match(/IEMobile/i)
	) return true;
}