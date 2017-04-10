/**
 * ==============================
 * Artemis 0.1.0 | MIT License
 * http://aegisframework.com/
 * ==============================
 */

"use strict";
class Artemis {

	constructor(selector){
		if(typeof selector == "string"){
			this.collection = document.querySelectorAll(selector);
			this.length = this.collection.length;
		}else if(typeof selector == "object"){
			if(selector.length >= 1){
				this.collection = selector;
			}else{
				this.collection = [selector];
			}
			this.length = this.collection.length;
		}else{
			return null;
		}
	}

	hide(){
		for(let i = 0; i < this.collection.length; i++){
			this.collection[i].style.display = "none";
		}
	}

	show(){
		for(let i = 0; i < this.collection.length; i++){
			this.collection[i].style.display = "block";
		}
	}

	addClass(newClass){
		for(let i = 0; i < this.collection.length; i++){
			this.collection[i].classList.add(newClass);
		}
	}

	removeClass(oldClass){
		for(let i = 0; i < this.collection.length; i++){
			this.collection[i].classList.remove(oldClass);
		}
	}

	toggleClass(classes){
		classes = classes.split(" ");
		for(let i = 0; i < this.collection.length; i++){
			for(let j = 0; j < classes.length; j++){
				this.collection[i].classList.toggle(classes[j]);
			}
		}
	}

	hasClass(classToCheck){
		if(this.collection[0]){
			for(let j = 0; j < this.collection[0].classList.length; j++){
				if(this.collection[0].classList[j] == classToCheck){
					return true;
				}
			}
		}
		return false;
	}

	value(value){
		if(this.length > 0){
			if (typeof value === 'undefined'){
				return this.collection[0].value;
			}else{
				this.collection[0].value = value;
			}
		}
	}

	click(callback){
		for(let i = 0; i < this.collection.length; i++){
			this.collection[i].addEventListener("click", callback, false);
		}
	}

	keyup(callback){
		for(let i = 0; i < this.collection.length; i++){
			this.collection[i].addEventListener("keyup", callback, false);
		}
	}

	keydown(callback){
		for(let i = 0; i < this.collection.length; i++){
			this.collection[i].addEventListener("keydown", callback, false);
		}
	}

	submit(callback){
		for(let i = 0; i < this.collection.length; i++){
			this.collection[i].addEventListener("submit", callback, false);
		}
	}

	change(callback){
		for(let i = 0; i < this.collection.length; i++){
			this.collection[i].addEventListener("change", callback, false);
		}
	}

	scroll(callback){
		for(let i = 0; i < this.collection.length; i++){
			this.collection[i].addEventListener("scroll", callback, false);
		}
	}

	on(event, callback, target){
		event = event.split(" ");
		for(let i = 0; i < this.collection.length; i++){
			for(let j = 0; j < event.length; j++){
				if(typeof callback === "string" && typeof target !== "undefined"){

					this.collection[i].addEventListener(event[j], function(e){
						if(e.target && $_(e.target).matches(callback)) {
							target.call(e.target, e);
						}
					}, false);

				}else{
					this.collection[i].addEventListener(event[j], callback, false);
				}
			}
		}
	}

	filter(element){
		if(this.length > 0){
			return new Artemis(this.collection[0].querySelector(element));
		}
	}

	data(name, value){
		if(this.length > 0){
			if (typeof value === 'undefined'){
				return this.collection[0].dataset[name];
			}else{
				this.collection[0].dataset[name] = value;
			}
		}
	}

	text(value){
		if(this.length > 0){
			if (typeof value === 'undefined'){
				return this.collection[0].textContent;
			}else{
				this.collection[0].textContent = value;
			}
		}
	}

	html(value){
		if(this.length > 0){
			if (typeof value === 'undefined'){
				return this.collection[0].innerHTML;
			}else{
				this.collection[0].innerHTML = value;
			}
		}
	}

	append(data){
		if(this.length > 0){
			var div = document.createElement('div');
			div.innerHTML = data;
			this.collection[0].appendChild(div.firstChild);
		}
	}

	each(callback){
		for(let i = 0; i < this.collection.length; i++){
			callback(this.collection[i]);
		}
	}

	get(index){
		return this.collection[index];
	}

	first(){
		if(this.length > 0){
			return new Artemis(this.collection[0]);
		}
	}

	isVisible(){
		for(let i = 0; i < this.collection.length; i++){
			if (this.collection[i].display != "none" && this.collection[i].offsetWidth > 0 && this.collection[i].offsetHeight > 0){
				return true;
			}
		}
		return false;
	}

	parent(){
		if(this.collection[0]){
			return new Artemis(this.collection[0].parentElement);
		}
	}

	find(selector){
		if(this.collection[0]){
			return new Artemis(this.collection[0].querySelectorAll(selector));
		}
	}

	offset(){
		if(this.collection[0]){
			var rect = this.collection[0].getBoundingClientRect();
			var offset = {
				top: rect.top + document.body.scrollTop,
				left: rect.left + document.body.scrollLeft
			};
			return offset;
		}
	}

	closest(searchSelector){
		var element = this.find(searchSelector);
		while (element.get(0) == null && this.parent().get(0) != null) {
			element = this.parent().find(searchSelector);
		}
		return element;
	}

	attribute(attribute, value){
		if(this.collection[0]){
			if (typeof value === 'undefined'){
				this.collection[0].getAttribute(attribute);
			}else{
				return this.collection[0].setAttribute(attribute, value);
			}
		}
	}

	after(content){
		for(let i = 0; i < this.collection.length; i++){
			this.collection[i].insertAdjacentHTML('afterend', content);
		}
	}

	before(content){
		for(let i = 0; i < this.collection.length; i++){
			this.collection[i].insertAdjacentHTML('beforebegin', content);
		}
	}

	style(properties, value){
		for(let i = 0; i < this.collection.length; i++){
			if(typeof properties === "string" && value !== "undefined"){
				this.collection[i].style[properties] = value;
			}else if(typeof properties === "string" && value === "undefined"){
				return this.collection[i].style[properties];
			}else if(typeof properties === "object"){
				for(var property in properties){
					this.collection[i].style[property] = properties[property];
				}
			}
		}
	}

	animate(style, time){
		for(let i = 0; i < this.collection.length; i++){
			for(var property in style){

				var start = new Date().getTime();
				var collection = this.collection;

				if(typeof this.collection[i].style[property] !== "undefined"){
					var initialValue = this.collection[i].style[property];

					var timer = setInterval(function() {
						var step = Math.min(1, (new Date().getTime() - start) / time);

						collection[i].style[property] = (initialValue + step * (style[property] - initialValue));

						if(step == 1){
							clearInterval(timer);
						}
					}, 25);
					this.collection[i].style[property] = initialValue;

				}else if(typeof (this.collection[i])[property] !== "undefined"){
					var initialValue = (this.collection[i])[property];

					var timer = setInterval(function() {
						var step = Math.min(1, (new Date().getTime() - start) / time);

						(collection[i])[property] = (initialValue + step * (style[property] - initialValue));

						if(step == 1){
							clearInterval(timer);
						}
					}, 25);
					(this.collection[i])[property] = initialValue;
				}
			}
		}
	}

	fadeIn(time = 400, callback){
		if(this.collection[0]){
			var element = this.collection[0];
			element.style.opacity = 0;

			var last = +new Date();

			var tick = function(){
				element.style.opacity = +element.style.opacity + (new Date() - last) / time;
				last = +new Date();

				if (+element.style.opacity < 1) {
					(window.requestAnimationFrame && requestAnimationFrame(tick)) || setTimeout(tick, 16);
				}else{
					if(typeof callback === "function"){
						callback();
					}
				}
			};

			tick();
		}
	}

	fadeOut(time = 400, callback){
		if(this.collection[0]){
			var last = +new Date();
			var element = this.collection[0];
			var tick = function(){
				element.style.opacity = +element.style.opacity - (new Date() - last) / time;
				last = +new Date();

				if (+element.style.opacity > 0) {
					(window.requestAnimationFrame && requestAnimationFrame(tick)) || setTimeout(tick, 16);
				}else{
					if(typeof callback === "function"){
						callback();
					}
				}
			};

			tick();
		}
	}

	matches(selector){
		var check = Element.prototype;
		var polyfill = check.matches || check.webkitMatchesSelector || check.mozMatchesSelector || check.msMatchesSelector || function() {
			return [].indexOf.call(document.querySelectorAll(selector), this) !== -1;
		};
		return polyfill.call(this.collection[0], selector);
	}

	remove(){
		for(let i = 0; i < this.collection.length; i++){
			this.collection[i].parentNode.removeChild(this.collection[i]);
		}
	}

	replaceWith(data){
		var div = document.createElement('div');
		div.innerHTML = data;
		this.collection[0].parentElement.replaceChild(div, this.collection[0]);
	}

	reset(){
		if(this.length > 0){
			this.collection[0].reset();
		}
	}

	property(property, value){
		if(this.collection[0]){
			if(typeof value !== "undefined"){
				this.collection[0][property] = value;
			}else{
				return this.collection[0][property];
			}
		}
	}
}

function $_(selector){
	if(typeof selector != "undefined"){
		return new Artemis(selector);
	}else{
		return Artemis;
	}

}

function $_ready(callback){
	window.addEventListener("load", callback);
}

/**
* ==============================
* Request
* ==============================
*/

class Request {

	static get(url, data, events, responseType = ""){
		var request = new XMLHttpRequest();
		request.open('GET', url, true);
		request.responseType = responseType;

		if(typeof events.onload === "function"){
			request.onload = function(){
				events.onload(request);
			}
		}

		if(typeof events.onerror === "function"){
			request.onerror = function(){
				events.onerror(request);
			}
		}

		request.send(data);
	}

	static post(url, data, events, responseType = "", contentType = 'application/x-www-form-urlencoded'){
		var request = new XMLHttpRequest();
		request.open('POST', url, true);
		request.responseType = responseType;
		if(typeof events.onload === "function"){
			request.onload = function(){
				events.onload(request);
			}
		}

		if(typeof events.onerror === "function"){
			request.onerror = function(){
				events.onerror(request);
			}
		}

		request.setRequestHeader('Content-Type', `${contentType}; charset=UTF-8`);
		request.send(data);
	}

	static json(url, events){
		var request = new XMLHttpRequest();

		request.responseType = "json";

		if(typeof events.onload === "function"){
			request.onload = function(){
				events.onload(request);
			}
		}

		if(typeof events.onerror === "function"){
			request.onerror = function(){
				events.onerror(request);
			}
		}

		request.open('GET', url, true);
		request.send();
	}

}
/**
* ==============================
* Screen
* ==============================
*/

class Screen {

	static isRetina(){
		return window.devicePixelRatio >= 2;
	}

	static isPortrait(){
		return window.innerHeight > window.innerWidth;
	}

	static isLandscape(){
		return (window.orientation === 90 || window.orientation === -90);
	}

	static getOrientation(){
		return this.isPortrait ? "Portrait" : "Landscape";
	}

	static getMaximumWidth(){
		return window.screen.availWidth;
	}

	static getMaximumHeight(){
		return window.screen.availHeight;
	}
}
/**
* ==============================
* Storage
* ==============================
*/

class Storage {

	static get(key){
		if(window.localStorage){
			return localStorage.getItem(key);
		}else{
			console.warn("Your browser does not support Local Storage");
		}
	}

	static set(key, value){
		if(window.localStorage){
			localStorage.setItem(key, value);
		}else{
			console.warn("Your browser does not support Local Storage");
		}
	}

	static clear(){
		if(window.localStorage){
			localStorage.clear();
		}else{
			console.warn("Your browser does not support Local Storage");
		}
	}

	static remove(key) {
		if(window.localStorage){
			localStorage.removeItem(key);
		}else{
			console.warn("Your browser does not support Local Storage");
		}
	}
}
/**
* ==============================
* Text
* ==============================
*/

class Text {

    static capitalize(text){
        return text.charAt(0).toUpperCase() + text.slice(1);
    }

    static getSuffix(text, key){
        var suffix = "";
        var position = text.indexOf(key);
        if(position != -1){
            position += key.length;
            suffix = text.substr(position, text.length - position);
        }
        return suffix;
    }

    static getPrefix(text, key){
        var prefix = "";
        var position = text.indexOf(key);
        if(position != -1){
            prefix = text.substr(0, position);
        }
        return prefix;
    }

    static getSelection(){
	    return window.getSelection().toString();
    }

    static buildText(array, wrapper){
        var result = "";
        if(array[0]){
            for(let i in array){
                result += Text.buildText(array[i], wrapper);
            }
            return result;
        }else{
            var string = wrapper;
            for(let i in array){
                string = string.replace(new RegExp('@' + i, 'g'), array[i]);
            }
            return string;
        }

    }

    static removeSpecialCharacters(text){
        var special = Array("#", ":", "ñ", "í", "ó", "ú", "á", "é", "Í", "Ó", "Ú", "Á", "É", "\(", "\)", "¡", "¿", "\/");
        var common   = Array("", "", "n", "i", "o", "u", "a", "e", "I", "O", "U", "A", "E", "", "", "", "", "");
        for(let character in special){
            text = text.replace(new RegExp(special[character], 'g'), common[character]);
        }
        return text;
    }

    static removePunctuation(text){
        var special = new Array(";", "," ,".", ":");
        for(let character in special){
            text = text.replace(new RegExp(special[character], 'g'), "");
        }
        return text;
    }

    static toFriendlyUrl(text){
		var expressions = {
			'[áàâãªä]'   :   'a',
	        '[ÁÀÂÃÄ]'    :   'A',
	        '[ÍÌÎÏ]'     :   'I',
	        '[íìîï]'     :   'i',
	        '[éèêë]'     :   'e',
	        '[ÉÈÊË]'     :   'E',
	        '[óòôõºö]'   :   'o',
	        '[ÓÒÔÕÖ]'    :   'O',
	        '[úùûü]'     :   'u',
	        '[ÚÙÛÜ]'     :   'U',
	        'ç'          :   'c',
	        'Ç'          :   'C',
	        'ñ'          :   'n',
	        'Ñ'          :   'N',
	        '_'          :   '-',
	        '[’‘‹›<>\']' :   '',
	        '[“”«»„\"]'  :   '',
	        '[\(\)\{\}\[\]]' : '',
	        '[?¿!¡#$%&^*´`~\/°\|]' : '',
	        '[,.:;]'     : '',
	        ' '         :   '-'
	    };

	    for(let regex in expressions){
		   text = text.replace(new RegExp(regex, 'g'), expressions[regex]);
	    }

		return text;
    }

    static toUrl(text){
	    return encodeURI(text);
    }

}
