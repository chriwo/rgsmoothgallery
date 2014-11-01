/* All code copyright 2007 Taras Mankovski */
/* email: tarasm@gmail.com */
/* website: http://www.oscandy.com/author/taras */

// This class adds lightbox functionality to smoothgallery
gallery = gallery.extend({
	initialize: function(element, options) {
		this.parent(element, options);
		this.addEvent('onPopulated', this.makeLink.bind(this));
		if (options.lightbox) this.lightbox2 = new lightboxforsmoothgallery(this.galleryData, {});
	},
	populateData: function() {
		currentArrayPlace = this.galleryData.length;
		options = this.options;
		data = this.galleryData;
		this.galleryElement.getElements(options.elementSelector).each(function(el) {
			elementDict = {
				imagepath: el.getElement(options.linkSelector).getProperty('href'),
				image: el.getElement(options.imageSelector).getProperty('src'),
				number: currentArrayPlace
			};
		// 14.2. show the title always
    //	if ((options.showInfopane) | (options.showCarousel)) {
				if (!el.getElement(options.titleSelector)) var temptitle = "";
				else var temptitle = el.getElement(options.titleSelector).innerHTML;
				if (!el.getElement(options.subtitleSelector)) var tempsubtitle = "";
				else var tempsubtitle = el.getElement(options.subtitleSelector).innerHTML;

				Object.extend(elementDict, {
					title: temptitle,
					description: tempsubtitle
				});
	//		}
			if (options.embedLinks)
				Object.extend(elementDict, {
					link: el.getElement(options.linkSelector).href||false,
					linkTitle: el.getElement(options.linkSelector).title||false
				});
			if ((!options.useThumbGenerator) && (options.showCarousel))
				Object.extend(elementDict, {
					thumbnail: el.getElement(options.thumbnailSelector).src
				});
			else if (options.useThumbGenerator)
				Object.extend(elementDict, {
					thumbnail: 'resizer.php?imgfile=' + elementDict.image + '&max_width=' + options.thumbWidth + '&max_height=' + options.thumbHeight
				});
			
			data[currentArrayPlace] = elementDict;
			currentArrayPlace++;
			if (this.options.destroyAfterPopulate)
				el.remove();
		});
		this.galleryData = data;
		this.fireEvent('onPopulated');
	},
	makeLink: function (num) {
		this.currentLink.setProperties({
			href: this.galleryData[num].link,
			title: this.galleryData[num].linkTitle
		})
		if (options.lightbox) this.currentLink.onclick = this.lightbox2.open.pass(num, this.lightbox2);
		if (!((this.options.embedLinks) && (!this.options.showArrows) && (!this.options.showCarousel)))
			this.currentLink.setStyle('display', 'block');	
	}
});

/*
	Slimbox v1.22 - The ultimate lightweight Lightbox clone
	by Christophe Beyls (http://www.digitalia.be) - MIT-style license.
	Inspired by the original Lightbox v2 by Lokesh Dhakar.
*/

var LightboxSmoothgallery = new Class({
	
	initialize: function(options) {
		this.options = Object.extend({
			resizeDuration: 400,		// Duration of height and width resizing (ms)
			initialWidth: 250,		// Initial width of the box (px)
			initialHeight: 250,		// Initial height of the box (px)
			animateCaption: true		// Enable/Disable caption animation
		}, options || {});
		this.anchors = [];


		this.eventKeyDown = this.keyboardListener.bindAsEventListener(this);
		this.eventPosition = this.position.bind(this);

		this.buildbox();

		var nextEffect = this.nextEffect.bind(this);
		this.fx = {
			overlay: this.overlay.effect('opacity', { duration: 500 }).hide(),
			resize: this.center.effects({ duration: this.options.resizeDuration, onComplete: nextEffect }),
			image: this.image.effect('opacity', { duration: 500, onComplete: nextEffect }),
			bottom: this.bottom.effects({ duration: 400, onComplete: nextEffect })
		};
		
		this.preloadPrev = new Image();
		this.preloadNext = new Image();
	},
	buildbox : function () {
		this.overlay = new Element('div').setProperty('id', 'rglbOverlay').injectInside(document.body);	
		this.center = new Element('div').setProperty('id', 'rglbCenter').setStyles({width: this.options.initialWidth+'px', height: this.options.initialHeight+'px', marginLeft: '-'+(this.options.initialWidth/2)+'px', display: 'none'}).injectInside(document.body);
		this.image = new Element('div').setProperty('id', 'rglbImage').injectInside(this.center);
		this.prevLink = new Element('a').setProperties({id: 'rglbPrevLink', href: 'javascript:void(0)'}).setStyle('display', 'none').injectInside(this.image);
		this.nextLink = this.prevLink.clone().setProperty('id', 'rglbNextLink').injectInside(this.image);
		this.prevLink.onclick = this.previous.bind(this);
		this.nextLink.onclick = this.next.bind(this);
	
		this.bottom = new Element('div').setProperty('id', 'rglbBottom').setStyle('display', 'none').injectInside(document.body);
		new Element('a').setProperties({id: 'rglbCloseLink', href: 'javascript:void(0)'}).injectInside(this.bottom).onclick = this.overlay.onclick = this.close.bind(this);
		this.number = new Element('div').setProperty('id', 'rglbNumber').injectInside(this.bottom);
		this.caption = new Element('div').setProperty('id', 'rglbCaption').injectInside(this.bottom);
		new Element('div').setStyle('clear', 'both').injectInside(this.bottom);
	},
	click: function(link) {
		if(link.rel.length == 8) {
			return this.show(link.href, link.title);
		}
		var j, imageNum, images = [];
		this.anchors.each(function(el){
			if(el.rel == link.rel) {
				for(j = 0; j < images.length; j++)
					if(images[j][0] == el.href) break;
				if(j == images.length) {			
					images.push([el.href, el.title]);
					if(el.href == link.href) imageNum = j;
				}
			}
		}, this);
		return this.open(images, imageNum);
	},

	show: function(url, title) {
		return this.open([[url, title]], 0);
	},

	open: function(images, imageNum) {
		this.images = images;
		this.position();
		this.setup(true);
		this.top = Window.getScrollTop() + (Window.getHeight() / 15);
		this.center.setStyles({top: this.top+'px', display: ''});
		this.fx.overlay.custom(0.8);
		return this.changeImage(imageNum);
	},

	position: function() {
		this.overlay.setStyles({top: Window.getScrollTop()+'px', height: Window.getHeight()+'px'});
	},

	setup: function(open) {
		var elements = $A(document.getElementsByTagName('object'));
		elements.extend(document.getElementsByTagName(window.ActiveXObject ? 'select' : 'embed'));
		elements.each(function(el){ el.style.visibility = open ? 'hidden' : ''; });
		var fn = open ? 'addEvent' : 'removeEvent';
		window[fn]('scroll', this.eventPosition)[fn]('resize', this.eventPosition);
		document[fn]('keydown', this.eventKeyDown);
		this.step = 0;
	},

	keyboardListener: function(event) {
		switch(event.keyCode) {
			case 27: case 88: case 67: this.close(); break;
			case 37: case 80: this.previous(); break;	
			case 39: case 78: this.next();
		}
	},

	previous: function() {
		return this.changeImage(this.activeImage-1);
	},

	next: function() {
		return this.changeImage(this.activeImage+1);
	},
			printOrSave: function(mode){
	//alert(this.images[this.activeImage].imagepath);
	 this.options.psScriptPath = "typo3conf/ext/rgsmoothgallery/savefile.php";
		if (this.options.psScriptPath) {
			var myRef = window.open(this.options.psScriptPath+'?mode='+mode+'&image='+this.images[this.activeImage].imagepath,'printsave', 'left=0,top=0,width='+(parseInt(this.center.style.width))+',height='+ (parseInt(this.center.style.height)) +',toolbar=0,resizable=1');
		}
		return true;
	},


	changeImage: function(imageNum) {		
		if(this.step || (imageNum < 0) || (imageNum >= this.images.length)) return false;
		this.step = 1;
		this.activeImage = imageNum;
		
		this.prevLink.style.display = this.nextLink.style.display = 'none';
		this.bottom.setStyles({opacity: '0', height: '0px', display: 'none'});
		this.fx.image.hide();
		this.center.className = 'rglbLoading';
		
		this.preload = new Image();
		this.preload.onload = this.nextEffect.bind(this);
		this.preload.src = this.images[imageNum][0];
		return false;
	},

	nextEffect: function() {
		switch(this.step++) {
		case 1:
			this.center.className = '';
			this.image.setStyles({backgroundImage: 'url('+this.images[this.activeImage][0]+')', width: this.preload.width+'px'});
			this.image.style.height = this.prevLink.style.height = this.nextLink.style.height = this.preload.height+'px';
			
			this.caption.setHTML(this.images[this.activeImage][1] || '');
			this.number.setHTML((this.images.length == 1) ? '' : (this.activeImage+1)+' / '+this.images.length);
			
			if(this.activeImage != 0) this.preloadPrev.src = this.images[this.activeImage - 1][0];
			if(this.activeImage != (this.images.length - 1)) this.preloadNext.src = this.images[this.activeImage + 1][0];
			if(this.center.clientHeight != this.image.offsetHeight+20) {
				this.fx.resize.custom({height: [this.center.clientHeight, this.image.offsetHeight]});
				break;
			}
			this.step++;
		case 2:
			if(this.center.clientWidth != this.image.offsetWidth+20) {
				this.fx.resize.custom({width: [this.center.clientWidth, this.image.offsetWidth], marginLeft: [-this.center.clientWidth/2, -this.image.offsetWidth/2]});
				break;
			}
			this.step++;
		case 3:
			this.bottom.setStyles({top: (this.top + this.center.clientHeight)+'px', width: this.image.style.width, marginLeft: this.center.style.marginLeft, display: ''});
			this.fx.image.custom(0, 1);
			break;
		case 4:
			if(this.options.animateCaption) {
				this.fx.bottom.custom({opacity: [0, 1], height: [0, this.bottom.scrollHeight]});
				break;
			}
			this.bottom.setStyles({opacity: '1', height: this.bottom.scrollHeight+'px'});
		case 5:
			if(this.activeImage != 0) this.prevLink.style.display = '';
			if(this.activeImage != (this.images.length - 1)) this.nextLink.style.display = '';
			this.step = 0;
		}
	},

	close: function() {
		if(this.step < 0) return;
		this.step = -1;
		if(this.preload) {
			this.preload.onload = Class.empty;
			this.preload = null;
		}
		for(var f in this.fx) this.fx[f].clearTimer();
		this.center.style.display = this.bottom.style.display = 'none';
		this.fx.overlay.chain(this.setup.pass(false, this)).custom(0);
		return false;
	}
});

/* All code copyright 2007 Taras Mankovski */
/* email: tarasm@gmail.com */
/* website: http://www.oscandy.com/author/taras */

// This class extends lightbox class and makes the lightbox compatible with smoothgallery
var lightboxforsmoothgallery = LightboxSmoothgallery.extend({
	initialize: function(galleryData, options) {
		this.options = Object.extend({
			resizeDuration: 400,	// Duration of height and width resizing (ms)
			initialWidth: 250,		// Initial width of the box (px)
			initialHeight: 250,		// Initial height of the box (px)
			animateCaption: true	// Enable/Disable caption animation
		}, options || {});
		
		this.images = galleryData;
		
		this.eventKeyDown = this.keyboardListener.bindAsEventListener(this);
		this.eventPosition = this.position.bind(this);
		
		this.overlay = new Element('div').setProperty('id', 'rglbOverlay').injectInside(document.body);
		
		this.center = new Element('div').setProperty('id', 'rglbCenter').setStyles({width: this.options.initialWidth+'px', height: this.options.initialHeight+'px', marginLeft: '-'+(this.options.initialWidth/2)+'px', display: 'none'}).injectInside(document.body);
		this.image = new Element('div').setProperty('id', 'rglbImage').injectInside(this.center);
		this.prevLink = new Element('a').setProperties({id: 'rglbPrevLink', href: 'javascript:void(0)'}).setStyle('display', 'none').injectInside(this.image);
		this.nextLink = this.prevLink.clone().setProperty('id', 'rglbNextLink').injectInside(this.image);
		this.prevLink.onclick = this.previous.bind(this);
		this.nextLink.onclick = this.next.bind(this);
		
		this.bottom = new Element('div').setProperty('id', 'rglbBottom').setStyle('display', 'none').injectInside(document.body);
		this.close = new Element('a').setProperties({id: 'rglbCloseLink', href: 'javascript:void(0)'}).injectInside(this.bottom).onclick = this.overlay.onclick = this.close.bind(this);
		this.number = new Element('div').setProperty('id', 'rglbNumber').addClass('gallery').injectInside(this.bottom);
		this.description = new Element('div').setProperty('id', 'rglbDescription').injectInside(this.bottom);
		this.title = new Element('div').setProperty('id', 'rglbTitle').injectInside(this.description);
		new Element('div').setStyle('clear', 'both').injectInside(this.description);
		this.caption = new Element('div').setProperty('id', 'rglbCaption').injectInside(this.description);

    buttons = $$('.rgsg-btn');
    if (buttons.length >0) {
    buttonsConf = buttons[0].innerHTML;    

    if (buttonsConf == 10 || buttonsConf == 11 ) 	 new Element('a').setProperties({id: 'rglbSaveLink', href: 'javascript:void(0)'}).injectInside(this.bottom).onclick = this.printOrSave.bind(this,'save');
    if (buttonsConf == 01 || buttonsConf == 11 ) 	 new Element('a').setProperties({id: 'rglbPrintLink', href: 'javascript:void(0)'}).injectInside(this.bottom).onclick = this.printOrSave.bind(this,'print');
    }
    new Element('div').setStyle('clear', 'both').injectInside(this.bottom);

		var nextEffect = this.nextEffect.bind(this);
		this.fx = {
			overlay: this.overlay.effect('opacity', { duration: 500 }).hide(),
			resize: this.center.effects({ duration: this.options.resizeDuration, onComplete: nextEffect }),
			image: this.image.effect('opacity', { duration: 500, onComplete: nextEffect }),
			bottom: this.bottom.effects({ duration: 400, onComplete: nextEffect })
		};
		
		this.preloadPrev = new Image();
		this.preloadNext = new Image();
		
		this.open.bind(this);
		this.changeImage.bind(this);		
	},
	buildbox : function () {
		this.overlay = new Element('div').setProperty('id', 'rglbOverlay').injectInside(document.body);	
		this.center = new Element('div').setProperty('id', 'rglbCenter').setStyles({width: this.options.initialWidth+'px', height: this.options.initialHeight+'px', marginLeft: '-'+(this.options.initialWidth/2)+'px', display: 'none'}).injectInside(document.body);
		this.image = new Element('div').setProperty('id', 'rglbImage').injectInside(this.center);
		this.prevLink = new Element('a').setProperties({id: 'rglbPrevLink', href: 'javascript:void(0)'}).setStyle('display', 'none').injectInside(this.image);
		this.nextLink = this.prevLink.clone().setProperty('id', 'rglbNextLink').injectInside(this.image);
		this.prevLink.onclick = this.previous.bind(this);
		this.nextLink.onclick = this.next.bind(this);
	
		this.bottom = new Element('div').setProperty('id', 'rglbBottom').setStyle('display', 'none').injectInside(document.body);
		new Element('a').setProperties({id: 'rglbCloseLink', href: 'javascript:void(0)'}).injectInside(this.bottom).onclick = this.overlay.onclick = this.close.bind(this);
		new Element('div').setProperty('id', 'rglbDescription').injectInside(this.bottom);
		this.number = new Element('div').setProperty('id', 'rglbNumber').injectInside(this.bottom);
		this.title = new Element('div').setProperty('id', 'rglbTitle').injectInside(this.description);
		this.caption = new Element('div').setProperty('id', 'rglbCaption').injectInside(this.description);
     alert("xxx"+buttonsConf);
    buttons = $$('.rgsg-btn');
    buttonsConf = buttons[0].innerHTML;    

    if (buttonsConf == 10 || buttonsConf == 11 ) 	 new Element('a').setProperties({id: 'rglbSaveLink', href: 'javascript:void(0)'}).injectInside(this.bottom).onclick = this.printOrSave.bind(this,'save');
    if (buttonsConf == 01 || buttonsConf == 11 ) 	 new Element('a').setProperties({id: 'rglbPrintLink', href: 'javascript:void(0)'}).injectInside(this.bottom).onclick = this.printOrSave.bind(this,'print');
		new Element('a').setProperties({id: 'rglbPrintLink', href: 'javascript:void(0)'}).injectInside(this.bottom).onclick = this.printOrSave.bind(this,'print');
    
    new Element('div').setStyle('clear', 'both').injectInside(this.bottom);
	},
	open: function(num) {
		this.position();
		this.setup(true);
		this.top = Window.getScrollTop() + (Window.getHeight() / 15);
		this.center.setStyles({top: this.top+'px', display: ''});
		this.fx.overlay.custom(0.8);
		return this.changeImage(num);
	},
		printOrSave: function(mode){
	//alert(this.images[this.activeImage].imagepath);
	 this.options.psScriptPath = "/typo3conf/ext/rgsmoothgallery/savefile.php";
		if (this.options.psScriptPath) {
			var myRef = window.open(this.options.psScriptPath+'?mode='+mode+'&image='+this.images[this.activeImage].imagepath,'printsave', 'left=0,top=0,width='+(parseInt(this.center.style.width))+',height='+ (parseInt(this.center.style.height)) +',toolbar=0,resizable=1');
		}
		return true;
	},
	changeImage: function(num) {		
		if(this.step || (num < 0) || (num >= this.images.length)) return false;
		this.step = 1;
		this.activeImage = num;
		
		this.prevLink.style.display = this.nextLink.style.display = 'none';
		this.bottom.setStyles({opacity: '0', height: '0px', display: 'none'});
		this.fx.image.hide();
		this.center.className = 'rglbLoading';
		
		this.preload = new Image();
		this.preload.onload = this.nextEffect.bind(this);
		this.preload.src = this.images[num].imagepath;
		return false;
	},
	nextEffect: function() {
		switch(this.step++) {
		case 1:
			this.center.className = '';
			this.image.setStyles({backgroundImage: 'url('+this.images[this.activeImage].imagepath+')', width: this.preload.width+'px'});
			this.image.style.height = this.prevLink.style.height = this.nextLink.style.height = this.preload.height+'px';
			
			this.title.setHTML(this.images[this.activeImage].title || '');
			this.caption.setHTML(this.images[this.activeImage].description || '');
			this.number.setHTML((this.images.length == 1) ? '' : (this.activeImage+1)+' / '+this.images.length);
	
			if(this.activeImage != 0) this.preloadPrev.src = this.images[this.activeImage - 1].imagepath;
			if(this.activeImage != (this.images.length - 1)) this.preloadNext.src = this.images[this.activeImage + 1].imagepath;
			if(this.center.clientHeight != this.image.offsetHeight+20) {
				this.fx.resize.custom({height: [this.center.clientHeight, this.image.offsetHeight]});
				break;
			}
			this.step++;
		case 2:
			if(this.center.clientWidth != this.image.offsetWidth+20) {
				this.fx.resize.custom({width: [this.center.clientWidth, this.image.offsetWidth], marginLeft: [-this.center.clientWidth/2, -this.image.offsetWidth/2]});
				break;
			}
			this.step++;
		case 3:
			this.bottom.setStyles({top: (this.top + this.center.clientHeight)+'px', width: this.image.style.width, marginLeft: this.center.style.marginLeft, display: ''});
			this.fx.image.custom(0, 1);
			break;
		case 4:
			if(this.options.animateCaption) {
				this.fx.bottom.custom({opacity: [0, 1], height: [0, this.bottom.scrollHeight]});
				break;
			}
			this.bottom.setStyles({opacity: '1', height: this.bottom.scrollHeight+'px'});
		case 5:
			if(this.activeImage != 0) this.prevLink.style.display = '';
			if(this.activeImage != (this.images.length - 1)) this.nextLink.style.display = '';
			this.step = 0;
		}
	}
});
