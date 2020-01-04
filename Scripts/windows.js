var jsEventTarget = function () {
    var mvoListeners = {};

    Object.defineProperty(this, "addEventListener", {
        value: function (type, callback) {
            if (!(type in mvoListeners)) mvoListeners[type] = [];

            mvoListeners[type].push(callback);
        }
    });

    Object.defineProperty(this, "removeEventListener", {
        value: function (type, callback) {
            if (!(type in mvoListeners)) {
                return;
            }
            var stack = mvoListeners[type];

            for (var i = 0, l = stack.length; i < l; i++) {
                if (stack[i] === callback) {
                    stack.splice(i, 1);
                    return;
                }
            }
        }
    });

    Object.defineProperty(this, "dispatchEvent", {
        value: function (event) {
            if (!(event.type in mvoListeners)) {
                return true;
            }
            var stack = mvoListeners[event.type];
            event.target = this;
            for (var i = 0, l = stack.length; i < l; i++) {
                if (event.stop === false) stack[i].call(this, event);
            }
            return !event.defaultPrevented;
        }
    });
}
var jsEvent = function (type, params) {
    var mvsType = null
    var mvoParams = params;
	var mvoStop = false

    if (typeof type === "string") { mvsType = type } else { throw new Error("invalid event name"); }

    Object.defineProperty(this, "type", {
        get: function () { return mvsType; },
        set: function (s) { if (typeof s === "string") mvsType = s; }
    });

    Object.defineProperty(this, "parameter", {
        get: function () { return mvoParams; },
        set: function (x) { mvoParams = x }
    });
	
	 Object.defineProperty(this, "stop", {
        get: function () { return mvoStop; },
        set: function (x) { if (jsValidation.isBool(x)) mvoStop = x; }
    });
}

function jsWindow() {
    jsEventTarget.call(this);
    jsRequest.call(this);

    var Me = this;
	var mvsToken = jsValidation.uuid();
	var mvoSettings = jsWindow.settings;
	var mvoTheme = jsWindow.theme;
	var mvsImageUrl = null;
	var mvoListener = null;
	var mvoHeader = null;
    var mvoBody = null;
    var mvoContainer = null;
	var mvoDragger = null;
	var mvoSizer = null;
	var mvoLastRect = null;
	var mvoParent = null;
	var mvbApplyToBadge = true;
	var mvoChildWindows = [];

    //Properties -------------------------------------------------------------
    Object.defineProperty(this, "header", {
        get: function () { return mvoHeader; }
    });

    Object.defineProperty(this, "container", {
        get: function () { return mvoContainer; }
    });

    Object.defineProperty(this, "body", {
        get: function () { return mvoBody; }
    });

    Object.defineProperty(this, "settings", {
        get: function () { return mvoSettings; },
		set: function (s) { if (s instanceof jsWindowSettings) { mvoSettings = s; applySettings(); } }
    });
	
	Object.defineProperty(this, "theme", {
        get: function () { return mvoTheme; },
		set: function (t) { if (t instanceof jsWindowTheme) { mvoTheme = t; applyTheme(); } }
    });
	
	Object.defineProperty(this, "locked", {
        get: function () { return mvoDragger.disabled && mvoSizer.disabled; },
		set: function (b) { if (jsValidation.isBool(b)) { mvoDragger.disabled = b; mvoSizer.disabled = b;  } }
    });
	
	Object.defineProperty(this, "title", {
        get: function () { return mvoHeader.title.innerText; },
		set: function (s) { if (jsValidation.isString(s)) mvoHeader.title.innerText = s;  } 
    });
	
	Object.defineProperty(this, "parent", {
        get: function () { return hasValidParent() ? mvoParent : document.body; },
		set: function (s) { if (s instanceof HTMLElement || (s instanceof jsWindow && s !== Me)) { mvoParent = s; jsValidation.callEvent(s, "js.setparent", Me); } } 
    });
	
	Object.defineProperty(this, "image", {
        get: function () { return mvsImageUrl; },
		set: function (s) { if (jsValidation.isString(s)) { mvsImageUrl = s; mvoHeader.setImage(); }  } 
    });

	Object.defineProperty(this, "token", {
        get: function () { return mvsToken; },
		set: function(s) { if (jsValidation.isString(s)) mvsToken = s; }
    });
    
	Object.defineProperty(this, "isShown", {
        get: function () { return mvoContainer.container.parentNode != null; }
    });

	Object.defineProperty(this, "applyToBadge", {
        get: function () { return mvbApplyToBadge; },
		set: function (s) { if (jsValidation.isBool(s)) { mvbApplyToBadge = s; }  } 
    });
	
	Object.defineProperty(this, "content", {
        get: function () { return mvoBody.container.innerHTML; },
		set: function (s) { appendContent(s);  } 
    });
	
	//Methods --------------------------------------------------------------
    Object.defineProperty(this, "close", {
        value: function () {
            var ev = jsValidation.callEvent(Me, "js.close")

			if (ev.stop !== true) {
				removeSelf();

				jsValidation.callEvent(Me, "js.closed")
			}
        }
    });

    Object.defineProperty(this, "maximize", {
        value: function () {
            if (mvoSettings.maximizeable === true) {
                jsValidation.callEvent(Me, "js.maximize")

				maximizeSelf();

                jsValidation.callEvent(Me, "js.maximized")
            }
        }
    });

    Object.defineProperty(this, "minimize", {
        value: function () {
            if (mvoSettings.minimizeable === true) {
                jsValidation.callEvent(Me, "js.minimize")

				removeFromDocument();
				
                jsValidation.callEvent(Me, "js.minimized")
            }
        }
    });

    Object.defineProperty(this, "load", {
        value: function (url, cb, fb) {
            Me.loadHTML(url, mvoBody.container, cb, fb);
        }
    });

    Object.defineProperty(this, "show", {
        value: function () {
            jsValidation.callEvent(this, "js.show");

            appendSelf();

            jsValidation.callEvent(this, "js.shown");
        }
    });
	
	Object.defineProperty(this, "appendToBadge", {
        value: function () {
            jsWindowBadge.append(Me);
        }
    });
	
	Object.defineProperty(this, "applySettings", {
        value: function (x) {
            if (x instanceof jsWindowSettings) mvoSettings = x;
			
			applySettings();
        }
    });
	
	Object.defineProperty(this, "applyTheme", {
        value: function (x) {
            if (x instanceof jsWindowTheme) mvoTheme = x;
			
			applyTheme();
        }
    });
	

	//####################################################################################
	
    function cstruct() {
		mvoContainer.setPosition(mvoSettings.x, mvoSettings.y);
        mvoContainer.setSize(mvoSettings.width, mvoSettings.height);
		
        mvoDragger = new jsFreeDraggable(mvoContainer.container, mvoHeader.container);
        mvoSizer = new jsFreeSizeable(mvoContainer.container);
		
		initKeyListener();
		initEvents();
		applySettings();
		applyTheme();
    }
	
	function initKeyListener() {
		mvoListener = new jsKeyListener();
		mvoListener.element = mvoContainer.container;
		mvoListener.append("stickLeft", [17, 18, 37], stickToLeftHalf, true);
		mvoListener.append("stickRight", [17, 18, 39], stickToRightHalf, true);
		mvoListener.append("minimize", [17, 18, 40], Me.minimize, true);
		mvoListener.append("maximize", [17, 18, 38], Me.maximize, true);
		mvoListener.append("maximize", [17, 18, 88], Me.close, true);
		mvoListener.append("maximize", [17, 18, 87], applyLastRect, true);
	}
	
	function initEvents() {
		mvoDragger.addEventListener("js.dragstart", checkDragElement);
		mvoDragger.addEventListener("js.drag", switchToLastRect);
		mvoSizer.addEventListener("js.resize", switchToLastRect);
		
		Me.addEventListener("js.setparent", appendChildWindow);
	}
	
	//####################################################################################
	
	function removeFromBadge(){	
		jsWindowBadge.remove(Me);
	}
	
	function removeFromDocument() {
		removeChildWindows();

		if (mvoContainer.container.parentNode instanceof HTMLElement) {
			mvoContainer.container.parentNode.removeChild(mvoContainer.container);
		}
	}
	
	function removeSelf(){
		removeFromBadge();
		removeFromDocument();
	}

	function appendToBadge() {
		jsWindowBadge.append(Me);
	}
	
	function appendToDocument() {
		if (hasValidParent() === true) {
			if (mvoParent instanceof HTMLElement) mvoParent.appendChild(mvoContainer.container);
			if (mvoParent instanceof jsWindow) document.body.appendChild(mvoContainer.container);
		} else{
			document.body.appendChild(mvoContainer.container);
		}
		
		mvoContainer.focus();
	}
	
	function appendSelf(){
		appendToBadge();
		appendToDocument();
		setLastRect();
	}

	function maximizeSelf() {
		mvoContainer.maximize();
	}
	
	function minimizeSelf() {
		mvoContainer.minimize();
	}

	function stickToLeftHalf() {
		setLastRect();
		
		mvoContainer.setPosition(0, 0);
		mvoContainer.setSize(window.outerWidth / 2, window.outerHeight);
	}
	
	function stickToRightHalf() {
		setLastRect();
		
		mvoContainer.setPosition(window.outerWidth / 2, 0);
		mvoContainer.setSize(window.outerWidth / 2, window.outerHeight);
	}

	function applySettings() {
		mvoDragger.disabled = !mvoSettings.draggable;
		mvoSizer.disabled = !mvoSettings.sizeable;
		mvoListener.disabled = !mvoSettings.listenToKeyboard;
	}
	
	function applyTheme() {
		var imgProperty = mvoHeader.imageType === "image" ? "image" : "icon";
		
		mvoHeader.container.className = buildClassName(jsWindow.style.header.container, mvoTheme.header.container);
		mvoHeader.title.className = buildClassName(jsWindow.style.header.title.label, mvoTheme.header.title.label);
		mvoHeader.titleContainer.className = buildClassName(jsWindow.style.header.title.container, mvoTheme.header.title.container);
		mvoHeader.image.className = buildClassName(jsWindow.style.header.title[imgProperty], mvoTheme.header.title[imgProperty]);
		mvoHeader.iconsContainer.className = buildClassName(jsWindow.style.header.icons.container, mvoTheme.header.icons.container);
		mvoHeader.closeIcon.className = buildClassName(jsWindow.style.header.icons.close, mvoTheme.header.icons.close);
		mvoHeader.maximizeIcon.className = buildClassName(jsWindow.style.header.icons.maximize, mvoTheme.header.icons.maximize);
		mvoHeader.minimizeIcon.className = buildClassName(jsWindow.style.header.icons.minimize, mvoTheme.header.icons.minimize);	
		mvoBody.container.className = buildClassName(jsWindow.style.body.container, mvoTheme.body.container);
		mvoContainer.container.className = buildClassName(jsWindow.style.container.container, mvoTheme.container.container);
		
		function buildClassName(def, arr) {
			return def + " " + arr.join(" "); 
		}
	}

	function applyLastRect(bPos, bSize) {
		if (mvoLastRect != null) {
			if (jsValidation.isBool(bPos) === false) bPos = true;	
			if (jsValidation.isBool(bSize) === false) bSize = true;
			
			if (bPos === true) mvoContainer.setPosition(mvoLastRect.left, mvoLastRect.top);
			if (bSize === true) mvoContainer.setSize(mvoLastRect.width, mvoLastRect.height);
			
			mvoLastRect = null;
		}
	}
	
	function setLastRect(){
		if (mvoLastRect == null) mvoLastRect = mvoContainer.container.getBoundingClientRect();
	}

	function switchToLastRect(e) {
		if (mvoContainer.isMaximized === true || mvoContainer.isStickedLeft === true || mvoContainer.isStickedRight === true) {		
			applyLastRect(false, true);
		}
	}

	function checkDragElement(e) {
		var target = e.parameter.target;
		
		e.stop = target === mvoHeader.closeIcon || target === mvoHeader.maximizeIcon || target === mvoHeader.minimizeIcon;
	}
    
	function hasValidParent() {
		return mvoParent instanceof HTMLElement || (mvoParent instanceof jsWindow && mvoParent !== Me)
	}
	
	function applyParent() {
		if (mvoContainer.container.parentNode instanceof HTMLElement) {
			mvoContainer.container.parentNode.removeChild(mvoContainer.container);
			
			appendToDocument();
		}
	}
	
	function removeChildWindows(ev) {
		if (ev instanceof jsEvent && (ev.parameter instanceof jsWindow === false || ev.parameter === Me)) return undefined
		
		jsValidation.iterate(mvoChildWindows, false, function(wnd) {		
			wnd.close();
		});	
			
	}
	
	function appendChildWindow(ev) {
		if (jsValidation.contains(mvoChildWindows, ev.parameter) === false && ev.parameter instanceof jsWindow && ev.parameter !== Me) {
			mvoChildWindows.push(ev.parameter);
		}
	}
	
	function appendContent(c){
		switch (true) {
			case jsValidation.isString(c): mvoBody.container.innerHTML = c; break;
			case c instanceof HTMLElement: jsValidation.clearChilds(mvoBody.container); mvoBody.container.appendChild(c); break;
		}
	}
	//####################################################################################
	mvoHeader = new jsHeader();
    mvoBody = new jsBody();
    mvoContainer = new jsContainer(mvoHeader, mvoBody);
	
    function jsHeader() {
        jsEventTarget.call(this);

        var mvoIcoClose = null; //:HtmlIElement
        var mvoIcoMax = null; //:HtmlIElement
        var mvoIcoMin = null; //:HtmlIElement
        var mvoHeaderContainer = null; //:HtmlDivElement
        var mvoHeaderTitle = null; //:HtmlLabelElement
		var mvoHeaderImage = null; //:HtmlImgElement
		var mvoTitleCont = null;
		var mvoIconsCont = null;
		var jsMeHeader = this;

        //Properties -------------------------------------------------------------
        Object.defineProperty(this, "closeIcon", {
            get: function () { return mvoIcoClose; }
        });

        Object.defineProperty(this, "maximizeIcon", {
            get: function () { return mvoIcoMax; }
        });

        Object.defineProperty(this, "minimizeIcon", {
            get: function () { return mvoIcoMin; }
        });

        Object.defineProperty(this, "container", {
            get: function () { return mvoHeaderContainer; }
        });

        Object.defineProperty(this, "title", {
            get: function () { return mvoHeaderTitle; }
        });
		
		Object.defineProperty(this, "titleContainer", {
            get: function () { return mvoTitleCont; }
        });
		
		Object.defineProperty(this, "iconsContainer", {
            get: function () { return mvoIconsCont; }
        });
		
		Object.defineProperty(this, "image", {
            get: function () { return mvoHeaderImage; }
        });
		
		Object.defineProperty(this, "imageType", {
			get: function() { return mvoHeaderImage instanceof HTMLImageElement ? "image" : "icon"; }
		});
		
		Object.defineProperty(this, "setImage", {
            value: function () {
				var img = jsWindowBadge.createWindowIcon(Me)
				
				mvoHeaderImage.parentNode.replaceChild(img, mvoHeaderImage);
				mvoHeaderImage = img;
				mvoHeaderImage.addEventListener("dblclick", Me.close)

				jsValidation.callEvent(Me, "js.imagechanged", Me)
			}
        });

        function create() {
            //Container
            var div_HeaderCont = document.createElement("div"); div_HeaderCont.className = jsWindow.style.header.container
            var div_HeaderTitle = document.createElement("div"); div_HeaderTitle.className = jsWindow.style.header.title.container;
            var div_HeaderIcons = document.createElement("div"); div_HeaderIcons.className = jsWindow.style.header.icons.container;
            //Elements
			var img_HeaderImage = document.createElement("span"); img_HeaderImage.className = jsWindow.style.header.title.icon;
            var lbl_HeaderTitle = document.createElement("label"); lbl_HeaderTitle.className = jsWindow.style.header.title.label;
            var ico_HeaderClose = document.createElement("span"); ico_HeaderClose.className = jsWindow.style.header.icons.close;
            var ico_HeaderMaximize = document.createElement("span"); ico_HeaderMaximize.className = jsWindow.style.header.icons.maximize;
            var ico_HeaderMinimize = document.createElement("span"); ico_HeaderMinimize.className = jsWindow.style.header.icons.minimize;
            //Events
            img_HeaderImage.addEventListener("dblclick", Me.close)
            ico_HeaderClose.addEventListener("click", Me.close)
            ico_HeaderMaximize.addEventListener("click", function() {
				if (mvoContainer.isMaximized === true) {
					applyLastRect(true, true);
				} else { Me.maximize(); }
			})
            ico_HeaderMinimize.addEventListener("click", Me.minimize)
            //Appending
			div_HeaderTitle.appendChild(img_HeaderImage);
            div_HeaderTitle.appendChild(lbl_HeaderTitle);
            div_HeaderIcons.appendChild(ico_HeaderMinimize);
            div_HeaderIcons.appendChild(ico_HeaderMaximize);
            div_HeaderIcons.appendChild(ico_HeaderClose);
            div_HeaderCont.appendChild(div_HeaderTitle);
            div_HeaderCont.appendChild(div_HeaderIcons);
            //Setting-Values
            lbl_HeaderTitle.innerText = "jsWindow";
            //Setting-Globals
            mvoHeaderContainer = div_HeaderCont;
            mvoIcoMin = ico_HeaderMinimize;
            mvoIcoMax = ico_HeaderMaximize;
            mvoIcoClose = ico_HeaderClose;
            mvoHeaderTitle = lbl_HeaderTitle;
			mvoHeaderImage = img_HeaderImage;
			mvoTitleCont = div_HeaderTitle;
			mvoIconsCont = div_HeaderIcons;
        }

        function headercstruct() {
            create();
        }

        
        headercstruct()
    }

    function jsBody() {
        jsEventTarget.call(this);

        var mvoBodyContainer = null; //:HtmlDivElement

        Object.defineProperty(this, "container", {
            get: function () { return mvoBodyContainer; }
        });


        function create() {
            //Container
            var div_BodyCont = document.createElement("div"); div_BodyCont.className = jsWindow.style.body.container;
            //Setting-Globals
            mvoBodyContainer = div_BodyCont;
        }

        function bodycstrct() {
            create();
        }


        bodycstrct();
    }

    function jsContainer(header, body) {
        jsEventTarget.call(this);

        var jsMeCont = this;
        var mvoJsContainerCont = null; //:HtmlDivElement
        var mvoJsHeader = header; //:jsHeader
        var mvoJsBody = body; //:jsBody
        var zStates = Object.freeze({ "focused": 5001, "normal": 5000 });

        Object.defineProperty(this, "container", {
            get: function () { return mvoJsContainerCont; }
        });

        Object.defineProperty(this, "header", {
            get: function () { return mvoJsHeader; }
        });

        Object.defineProperty(this, "body", {
            get: function () { return mvoJsBody; }
        });

        Object.defineProperty(this, "isFocused", {
            get: function () { return mvoJsContainerCont.style.zIndex === zStates.focused.toString(); }
        });

		Object.defineProperty(this, "isMaximized", {
            get: function() {
				var rect = mvoJsContainerCont.getBoundingClientRect();
				
				return rect.left === 0 && rect.top === 0 && rect.width === window.outerWidth && rect.height === window.outerHeight;
			}
        });
		
		Object.defineProperty(this, "isStickedLeft", {
            get: function() {
				var rect = mvoJsContainerCont.getBoundingClientRect();
				
				return rect.left === 0 && rect.top === 0 && rect.width === window.outerWidth / 2 && rect.height === window.outerHeight;
			}
        });
		
		Object.defineProperty(this, "isStickedRight", {
            get: function() {
				var rect = mvoJsContainerCont.getBoundingClientRect();
				
				return rect.left === window.outerWidth / 2 && rect.top === 0 && rect.width === window.outerWidth / 2 && rect.height === window.outerHeight;
			}
        });

        //Methods --------------------------------------------------------------
        Object.defineProperty(this, "setPosX", {
            value: function (piX) {
                mvoJsContainerCont.style.left = piX + "px";
				
				contCallResize();
            }
        });

        Object.defineProperty(this, "setPosY", {
            value: function (piY) {
                mvoJsContainerCont.style.top = piY + "px";
				
				contCallResize();
            }
        });

        Object.defineProperty(this, "setPosition", {
            value: function (piX, piY) {
                jsMeCont.setPosX(piX);
                jsMeCont.setPosY(piY);
            }
        });

        Object.defineProperty(this, "setSizeX", {
            value: function (piX) {
                mvoJsContainerCont.style.width = piX + "px";
				
				contCallResize();
            }
        });

        Object.defineProperty(this, "setSizeY", {
            value: function (piY) {
                mvoJsContainerCont.style.height = piY + "px";
				
				contCallResize()
            }
        });

        Object.defineProperty(this, "setSize", {
            value: function (piX, piY) {
                jsMeCont.setSizeX(piX);
                jsMeCont.setSizeY(piY);
            }
        });

        Object.defineProperty(this, "focus", {
            value: focus
        });

        Object.defineProperty(this, "defocus", {
            value: defocus
        });
		
		Object.defineProperty(this, "maximize", {
            value: function() {
				setLastRect();
				
				jsMeCont.setPosition(0, 0);
				jsMeCont.setSize(window.outerWidth, window.outerHeight);
			}
        });
		
		
        function create() {
            //Container
            var div_ContainerCont = document.createElement("div"); div_ContainerCont.className = jsWindow.style.container.container; div_ContainerCont.tabIndex = -1;
            //Events
            div_ContainerCont.addEventListener("mousedown", focus)
            //Appending
            div_ContainerCont.appendChild(header.container);
            div_ContainerCont.appendChild(body.container);
            //Setting-Globals
            mvoJsContainerCont = div_ContainerCont;
        }

        function focus() {
            jsWindowBadge.windows.forEach(function (w) {
                w.container.defocus();
            })

            mvoJsContainerCont.style.zIndex = zStates.focused.toString();
			mvoJsContainerCont.focus();
        }

        function defocus() {
            mvoJsContainerCont.style.zIndex = zStates.normal.toString();
        }

        function containercstruct() {
            create();
        }

		function contCallResize() {
			jsValidation.callDOMEvent(mvoJsContainerCont, "resize");
		}

        containercstruct();
    }


	jsHeader.prototype = Object.create(jsEventTarget.prototype);
	jsBody.prototype = Object.create(jsEventTarget.prototype);
	jsContainer.prototype = Object.create(jsEventTarget.prototype);
    //####################################################################################
    cstruct();
}

function jsRequest() {
    var Me = this;

    Object.defineProperty(this, "request", {
        value: function (method, url, async, params, declare, prepare, cb, fb) {
            var xhr = new XMLHttpRequest();

            if (!jsValidation.isMethod(cb)) cb = function (r) { console.log(r); }
            if (!jsValidation.isMethod(fb)) fb = function (r) { console.error(r); }
            if (!jsValidation.isBool(async)) async = true;

            xhr.onload = function () {
                if (xhr.status === 200) {
                    jsValidation.call.call(cb, xhr.response, xhr.status, xhr);
                } else { jsValidation.call.call(fb, xhr.response, xhr.status, xhr); }
            }
            xhr.onerror = function () {
                console.error(xhr.response);
            }

            jsValidation.call.call(declare, xhr)

            xhr.open(method, url, async);

            jsValidation.call.call(prepare, xhr)
            
            xhr.send(params);
        }
    });

    Object.defineProperty(this, "formPOST", {
        value: function (url, async, params, cb, fb) {
            var data = Object.create(params);
            var fData = objectToFormData(data);

            Me.request("POST", url, async, fData, function (xhr) {

            }, function (xhr) {
                xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
            }, cb, fb);
        }
    });

    Object.defineProperty(this, "loadHTML", {
        value: function (url, target, cb, fb) {
            Me.request("GET", url, true, null, function (xhr) {
                xhr.responseType = "document";
            }, function (xhr) {

            }, function (r, status, xhr) {
                if (target instanceof HTMLElement) target.append(r.documentElement);

                jsValidation.call.call(cb, r, status, xhr);
            }, fb);
        }
    });

    function objectToFormData(obj) {
        var fData = new FormData();

        for (var key in obj) {
            form_data.append(key, obj[key]);
        }

        return fData;
    }
}

function jsWindowSettings() {
    var mvbTopWindow = true;
    var mviPosX = null;
    var mviPosY = null;
    var mviSizeX = null;
    var mviSizeY = null;
    var mvbMinimizeable = true;
    var mvbMaximizeable = true;
    var mvbDraggable = true;
	var mvbSizeable = true;
	var mvbListenKeys = true

    Object.defineProperty(this, "topWindow", {
        get: function () { return mvbTopWindow; },
        set: function (b) { if (jsValidation.isBool(b)) mvbTopWindow = b; }
    });

    Object.defineProperty(this, "minimizeable", {
        get: function () { return mvbMinimizeable; },
        set: function (b) { if (jsValidation.isBool(b)) mvbMinimizeable = b; }
    });

    Object.defineProperty(this, "maximizeable", {
        get: function () { return mvbMaximizeable; },
        set: function (b) { if (jsValidation.isBool(b)) mvbMaximizeable = b; }
    });

    Object.defineProperty(this, "draggable", {
        get: function () { return mvbDraggable; },
        set: function (b) { if (jsValidation.isBool(b)) mvbDraggable = b; }
    });
	
	Object.defineProperty(this, "sizeable", {
        get: function () { return mvbSizeable; },
        set: function (b) { if (jsValidation.isBool(b)) mvbSizeable = b; }
    });
	
	Object.defineProperty(this, "listenToKeyboard", {
        get: function () { return mvbListenKeys; },
        set: function (b) { if (jsValidation.isBool(b)) mvbListenKeys = b; }
    });

    Object.defineProperty(this, "x", {
        get: function () { return mviPosX; },
        set: function (b) { if (jsValidation.isUNumber(b) || b === null) mviPosX = b; }
    });


    Object.defineProperty(this, "y", {
        get: function () { return mviPosY; },
        set: function (b) { if (jsValidation.isUNumber(b) || b === null) mviPosY = b; }
    });

    Object.defineProperty(this, "width", {
        get: function () { return mviSizeX; },
        set: function (b) { if (jsValidation.isUNumber(b) || b === null) mviSizeX = b; }
    });


    Object.defineProperty(this, "height", {
        get: function () { return mviSizeY; },
        set: function (b) { if (jsValidation.isUNumber(b) || b === null) mviSizeY = b; }
    });
}

function jsWindowTheme(name) {
	var mvsName = typeof name === "string" ? name : "";
	var mvoContainer = new jsContainerTheme();
	var mvoHeader = new jsHeaderTheme();
	var mvoBody = new jsBodyTheme()
	var Me = this;

	function jsHeaderTheme() {
		var mvasContainer = [];
		var mvoTitleTheme = new jsTitleTheme();
		var mvoIconsTheme = new jsIconsTheme();
			
		function jsTitleTheme() {
			var mvasTitleContainer = [];	
			var mvasImage = [];
			var mvasLabel = [];
			var mvasIcon = [];
			
			Object.defineProperty(this, "container", {
				get: function () { return mvasTitleContainer; },
				set: function (a) { mvasTitleContainer = readClassFromObject(a, mvasTitleContainer); }
			});
			
			Object.defineProperty(this, "image", {
				get: function () { return mvasImage; },
				set: function (a) { mvasImage = readClassFromObject(a, mvasImage); }
			});
			
			Object.defineProperty(this, "label", {
				get: function () { return mvasLabel; },
				set: function (a) { mvasLabel = readClassFromObject(a, mvasLabel); }
			});
			
			Object.defineProperty(this, "icon", {
				get: function () { return mvasIcon; },
				set: function (a) { mvasIcon = readClassFromObject(a, mvasIcon); }
			});
		}
		
		function jsIconsTheme() {
			var mvasIcons = [];
			var mvasCloseIcon = [];
			var mvasMaximizeIcon = [];
			var mvasMinimizeIcon = [];
			
			Object.defineProperty(this, "container", {
				get: function () { return mvasIcons; },
				set: function (a) { mvasIcons = readClassFromObject(a, mvasIcons); }
			});
			
			Object.defineProperty(this, "close", {
				get: function () { return mvasCloseIcon; },
				set: function (a) { mvasCloseIcon = readClassFromObject(a, mvasCloseIcon); }
			});
		
			Object.defineProperty(this, "minimize", {
				get: function () { return mvasMinimizeIcon; },
				set: function (a) { mvasMinimizeIcon = readClassFromObject(a, mvasMinimizeIcon); }
			});
		
			Object.defineProperty(this, "maximize", {
				get: function () { return mvasMaximizeIcon; },
					set: function (a) { mvasMaximizeIcon = readClassFromObject(a, mvasMaximizeIcon); }
			});
		}
	
		Object.defineProperty(this, "container", {
			get: function () { return mvasContainer; },
			set: function (a) { mvasContainer = readClassFromObject(a, mvasContainer); }
		});
	
		Object.defineProperty(this, "title", {
			get: function () { return mvoTitleTheme; },
		});
		
		Object.defineProperty(this, "icons", {
			get: function () { return mvoIconsTheme; },
		});
	}
	
	function jsBodyTheme() {
		var mvasBody = [];
		
		Object.defineProperty(this, "container", {
			get: function () { return mvasBody; },
			set: function (a) { mvasBody = readClassFromObject(a, mvasBody); }
		});
	}
	
	function jsContainerTheme() {
		var mvasContainer = [];
		
		Object.defineProperty(this, "container", {
			get: function () { return mvasContainer; },
			set: function (a) { mvasContainer = readClassFromObject(a, mvasContainer); }
		});
	}
		
	Object.defineProperty(this, "header", {
		get: function () { return mvoHeader; },
	});
		
	Object.defineProperty(this, "body", {
		get: function () { return mvoBody; },
	});
		
	Object.defineProperty(this, "container", {
		get: function () { return mvoContainer; },
	});
	
	Object.defineProperty(this, "name", {
		get: function () { return mvsName; },
		set: function (s) { if (jsValidation.isString(s)) mvsName = s; }
	});
		
			
		
	//#############################################################################
	Object.defineProperty(this, "applyToWindow", {
		value: function(wnd) {
			if (wnd instanceof jsWindow) {
				wnd.theme = Me;
			}
		}
	});
		
	Object.defineProperty(this, "readFromObject", {
		value: function(obj) {
			if (obj != null && typeof obj === "object") {
				if (obj.header) {
					if (obj.header.container) {
						Me.header.container = obj.header.container;
					}
					if (obj.header.title) {
						Me.header.title.container = obj.header.title.container;
						Me.header.title.image = obj.header.title.image;
						Me.header.title.icon = obj.header.title.icon;
						Me.header.title.label = obj.header.title.label;
					}
					if (obj.header.icons) {
						Me.header.icons.close = obj.header.icons.close
						Me.header.icons.maximize = obj.header.icons.maximize
						Me.header.icons.minimize = obj.header.icons.minimize
					}
				}
				if (obj.body) {
					Me.body.container = obj.body.container;
				}
				if (obj.container) {
					Me.container.container = obj.container.container;
				}
			}
		}
	});
		
		
		
	function readClassFromObject(x, def) {
		var ret = def instanceof Array ? def : [];
			
		if (x instanceof Array) {
			jsValidation.removeIf(x, function(s) {
				return typeof s !== "string";
			}); ret = x;
		}
			
		if (typeof x === "string") {
			ret = x.split(" ");
		}
			
		return ret;
	}
		
}

function jsFreeDraggable(elem, dragger) {
    if (elem instanceof HTMLElement && dragger instanceof HTMLElement) {
		jsEventTarget.call(this);
		
        var triggerPadding = 7;
        var isHovering = false;
        var isHolding = false;
        var offsetX = 0;
        var offsetY = 0;
		var mvoRect = null;
		var mvbDisabled = false
		var Me = this;
		
		Object.defineProperty(this, "disabled", {
			get: function() { return mvbDisabled; },
			set: function(b) { if (jsValidation.isBool(b)) mvbDisabled = b; }
		});

        dragger.addEventListener("mousedown", function (e) {
            var rect = elem.getBoundingClientRect();

            if (e.pageX > rect.left + triggerPadding && e.pageX < rect.right - triggerPadding && e.pageY > rect.top + triggerPadding && e.pageY < rect.bottom - triggerPadding) {
                var ev = jsValidation.callEvent(Me, "js.dragstart", e);
				
				if (ev.stop === false) {
					isHolding = true;
					offsetX = e.pageX - rect.left;
					offsetY = e.pageY - rect.top;
					mvoRect = rect;
				}
            }
        });

        dragger.onmouseenter = function () {
            isHovering = true;
        }

		elem.addEventListener("resize", function() {
			var rect = elem.getBoundingClientRect();
			
			if (isHolding === true && (offsetX > rect.width || offsetY > rect.height)) {
				offsetX = rect.width * (offsetX / mvoRect.width);
				offsetY = rect.height * (offsetY / mvoRect.height);
			}
		});

        window.addEventListener("mouseup", function (e) {
			jsValidation.callEvent("js.dragend", e);
			
            isHolding = false; 
			mvoRect = null;
			offsetX = 0;
			offsetY = 0;		
        });

        window.addEventListener("mousemove", move)

        function move(e) {
            if (mvbDisabled === false && isHolding === true && isHovering === true) {    
				jsValidation.callEvent(Me, "js.drag", e)

				if (e.pageX >= 0 && e.pageX <= window.outerWidth) elem.style.left = (e.pageX - offsetX) + "px";
				if (e.pageY >= 0 && e.pageY <= window.innerHeight) elem.style.top = (e.pageY - offsetY) + "px";
				
				jsValidation.callEvent(Me, "js.draged", e);				
            }
        }
    }
}

function jsFreeSizeable(elem) {
    if (elem instanceof HTMLElement) {
		jsEventTarget.call(this);
		
        var triggerWidth = 7;
        var defaultCursor = elem.style.cursor;

        var evSizeLeft = document.createEvent("CustomEvent");
        var evSizeRight = document.createEvent("CustomEvent");
        var evSizeTop = document.createEvent("CustomEvent");
        var evSizeBottom = document.createEvent("CustomEvent");
        var evSizeTopLeft = document.createEvent("CustomEvent");
        var evSizeTopRight = document.createEvent("CustomEvent");
        var evSizeBottomLeft = document.createEvent("CustomEvent");
        var evSizeBottomRight = document.createEvent("CustomEvent");

        evSizeLeft.initCustomEvent("onsizeleft", false, false, {})
        evSizeRight.initCustomEvent("onsizeright", false, false, {})
        evSizeTop.initCustomEvent("onsizetop", false, false, {})
        evSizeBottom.initCustomEvent("onsizebottom", false, false, {})
        evSizeTopLeft.initCustomEvent("onsizetopleft", false, false, {})
        evSizeTopRight.initCustomEvent("onsizetopright", false, false, {})
        evSizeBottomLeft.initCustomEvent("onsizebottomleft", false, false, {})
        evSizeBottomRight.initCustomEvent("onsizebottomright", false, false, {})

		var mvbDisabled = false;
        var isHovering = false;
        var isHolding = false;
        var isBordering = true;
        var oCurrEvent = null;
        var oSnapState = null;
		var Me = this;
		
		Object.defineProperty(this, "disabled", {
			get: function() { return mvbDisabled; },
			set: function(b) { if (jsValidation.isBool(b)) mvbDisabled = b; }
		});

        elem.addEventListener("mousedown", function (e) {
            if (isBordering === true) { isHolding = true; oSnapState = elem.getBoundingClientRect(); }
        });

        elem.addEventListener("mousemove", function (e) {
            if (isHovering === false) {
                var rect = elem.getBoundingClientRect();
                var bN = false, bW = false, bS = false, bE = false;

                if (e.pageX > rect.left - triggerWidth && e.pageX < rect.left + triggerWidth) { bE = true; isBordering = true; }
                if (e.pageX > rect.right - triggerWidth && e.pageX < rect.right + triggerWidth) { bW = true; isBordering = true; }
                if (e.pageY > rect.top - triggerWidth && e.pageY < rect.top + triggerWidth) { bN = true; isBordering = true; }
                if (e.pageY > rect.bottom - triggerWidth && e.pageY < rect.bottom + triggerWidth) { bS = true; isBordering = true; }


                switch (true) {
                    case bE === true && bN === true:
                        elem.style.cursor = "nwse-resize"; oCurrEvent = evSizeTopLeft;
                        break;
                    case bE === true && bS === true:
                        elem.style.cursor = "nesw-resize"; oCurrEvent = evSizeBottomLeft;
                        break;
                    case bW === true && bN === true:
                        elem.style.cursor = "nesw-resize"; oCurrEvent = evSizeTopRight;
                        break;
                    case bW === true && bS === true:
                        elem.style.cursor = "nwse-resize"; oCurrEvent = evSizeBottomRight;
                        break;
                    case bE === true:
                        elem.style.cursor = "e-resize"; oCurrEvent = evSizeLeft;
                        break;
                    case bW === true:
                        elem.style.cursor = "w-resize"; oCurrEvent = evSizeRight;
                        break;
                    case bN === true:
                        elem.style.cursor = "n-resize"; oCurrEvent = evSizeTop; 
                        break;
                    case bS === true:
                        elem.style.cursor = "s-resize"; oCurrEvent = evSizeBottom; 
                        break;
                    default:
                        elem.style.cursor = defaultCursor; oCurrEvent = null; isBordering = false;
                }
            }
        });

        window.addEventListener("mouseup", function () {
            isHolding = false; isBordering = false; isHovering = false;
        });

        window.addEventListener("mousemove", function (e) {
            if (mvbDisabled === false && isBordering === true && isHolding === true && oCurrEvent && oSnapState) {
                oCurrEvent.mouse = e; 
				jsValidation.callEvent(Me, "js.resize", e); 
				elem.dispatchEvent(oCurrEvent); 
				jsValidation.callEvent(Me, "js.resized", e); 
				jsValidation.callDOMEvent(elem, "resize");
				isHovering = true;
            }
        })

        //Size-Functions
        elem.addEventListener("onsizeleft", function (e) {
            var x = e.mouse.pageX;

			if (oSnapState.right > x) {
				elem.style.left = x + "px";
				elem.style.width = (oSnapState.width + (oSnapState.left - x)) + "px";
			}
        });

        elem.addEventListener("onsizeright", function (e) {
            var x = e.mouse.pageX;

            elem.style.width = (oSnapState.width + (x - oSnapState.right)) + "px";
        });

        elem.addEventListener("onsizetop", function (e) {	
            var y = e.mouse.pageY;

			if (oSnapState.bottom > y) {
				elem.style.top = y + "px";
				elem.style.height = (oSnapState.height + (oSnapState.top - y)) + "px"
			}
        });

        elem.addEventListener("onsizebottom", function (e) {
            var y = e.mouse.pageY;

            elem.style.height = (oSnapState.height + (y - oSnapState.bottom)) + "px";
        });

        elem.addEventListener("onsizetopleft", function (e) {
            var x = e.mouse.pageX;
            var y = e.mouse.pageY;

            elem.style.left = x + "px";
            elem.style.top = y + "px";

            elem.style.top = y + "px";
            elem.style.width = (oSnapState.width + (oSnapState.left - x)) + "px";
            elem.style.height = (oSnapState.height + (oSnapState.top - y)) + "px"
        });

        elem.addEventListener("onsizetopright", function (e) {
            var x = e.mouse.pageX;
            var y = e.mouse.pageY;

            elem.style.top = y + "px";
            elem.style.width = (oSnapState.width + (x - oSnapState.right)) + "px";
            elem.style.height = (oSnapState.height + (oSnapState.top - y)) + "px"
        });

        elem.addEventListener("onsizebottomleft", function (e) {
            var x = e.mouse.pageX;
            var y = e.mouse.pageY;

            elem.style.left = x + "px";
            elem.style.width = (oSnapState.width + (oSnapState.left - x)) + "px";
            elem.style.height = (oSnapState.height + (y - oSnapState.bottom)) + "px";
        });

        elem.addEventListener("onsizebottomright", function (e) {
            var x = e.mouse.pageX;
            var y = e.mouse.pageY;

            elem.style.width = (oSnapState.width + (x - oSnapState.right)) + "px";
            elem.style.height = (oSnapState.height + (y - oSnapState.bottom)) + "px";
        });
    }
}

function jsKeyListener() {
	var mvaCombinations = [];
	var mvaCurrent = [];
	var mvoElement = null;
	var mvbDisabled = false;
	
	window.addEventListener("keydown", function(e) {
		mvaCurrent.push(e.keyCode); trigger();
	});
	
	window.addEventListener("keyup", function(e) {
		jsValidation.remove(mvaCurrent, e.keyCode);
	});
	
	Object.defineProperty(this, "disabled", {
		get: function() { return mvbDisabled; },
		set: function(b) { if (jsValidation.isBool(b)) mvbDisabled = b; }
	});
	
	Object.defineProperty(this, "append", {
		value: function(name, keys, cb, foc) { 
			if (jsValidation.isString(name) && checkKeys(keys) && jsValidation.isMethod(cb)) {
				var oKeyCombi = new jsKeyCombination(name);
				
				oKeyCombi.keys = keys;
				oKeyCombi.handler = cb;
				oKeyCombi.needFocus = foc;
				
				mvaCombinations.push(oKeyCombi);
			} else { throw new Error("invalid keylistener Parameter") }
		}
	});
	
	Object.defineProperty(this, "remove", {
		value: function(name) { 
			if (jsValidation.isString(name)) {
				var len = mvaCombinations.length - 1;
			
				for (var i = len; i >= 0; i--) {
					if (mvaCombinations[i].name === name) mvaCombinations.splice(i, 1);
				}
			}
		}
	});
	
	Object.defineProperty(this, "combinations", {
		get: function() { return mvaCombinations; }
	});
	
	Object.defineProperty(this, "element", {
		get: function() { return mvoElement; },
		set: function(e) { if (e instanceof HTMLElement) mvoElement = e; }
	});
	
	function trigger() {
		if (mvbDisabled === false) {
			mvaCombinations.forEach(function(x) {
				if (jsValidation.compareArray(mvaCurrent, x.keys) && (x.needFocus === false || jsValidation.isChildOf(document.activeElement, mvoElement))) {
					jsValidation.call.call(x.handler);
				}
			});
		}
	}
	
	function checkKeys(arr) {
		if (arr instanceof Array && arr.length > 0) {
			var len = arr.length;
			
			for(var i = 0; i < len; i++) {
				if (!isNaN(arr[i])) {
					arr[i] = parseInt(arr[i]);
				} else { return false; }
			}
			
			return true
		}
		
		return false;
	}
	
	function jsKeyCombination(name) {
		var mvaKeys = [];
		var mvbNeedFocus = false;
		var mvoCallback = null;
		var mvsName = name
		
		
		Object.defineProperty(this, "keys", {
			get: function() { return mvaKeys; },
			set: function(a) { if (jsValidation.isArray(a)) mvaKeys = a; }
		});
		
		Object.defineProperty(this, "needFocus", {
			get: function() { return mvbNeedFocus; },
			set: function(b) { if (jsValidation.isBool(b)) mvbNeedFocus = b; }
		});
		
		Object.defineProperty(this, "handler", {
			get: function() { return mvoCallback; },
			set: function(f) { if (jsValidation.isMethod(f)) mvoCallback = f; }
		});
		
		Object.defineProperty(this, "name", {
			get: function() { return mvsName; }
		});
		

	}
}

function jsTask() {
	jsEventTarget.call(this);
	
	var mvoCurrentWindows = [];
	var mvoContent = null;
	var mvsImageURL = null;
	var mvbRemoveID = false;
	var mvsName = "jsTask";
	var mvsToken = jsValidation.uuid();
	var mvoSettings = jsWindow.settings;
	var mvoTheme = jsWindow.theme;
	var mviMaxWindows = 8;
	var Me = this
	
	
	Object.defineProperty(this, "image", {
        get: function () { return mvsImageURL; },
		set: function (s) { if (jsValidation.isString(s)) { mvsImageURL = s; }  } 
    })
	
	Object.defineProperty(this, "defaultSettings", {
        get: function () { return mvoSettings; },
		set: function (s) { if (s instanceof jsWindowSettings) { mvoSettings = s;} }
    });
	
	Object.defineProperty(this, "name", {
        get: function () { return mvsName; },
		set: function (s) { if (jsValidation.isString(s)) { mvsName = s;} }
    });
	
	Object.defineProperty(this, "defaultTheme", {
        get: function () { return mvoTheme; },
		set: function (t) { if (t instanceof jsWindowTheme) { mvoTheme = t; } }
    });
	
	Object.defineProperty(this, "maxWindows", {
        get: function () { return mviMaxWindows; },
		set: function (t) { if (jsValidation.isUNumber(t)) { mviMaxWindows = t; } }
    });
	
	Object.defineProperty(this, "windows", {
		get: function() { return mvoCurrentWindows; }
	});
	
	Object.defineProperty(this, "removeID", {
		get: function() { return mvbRemoveID; },
		set: function(b) { if (jsValidation.isBool(b)) mvbRemoveID = b; }
	});
	
	Object.defineProperty(this, "content", {
		get: function() { return mvoContent; },
		set: function(b) { if (jsValidation.isString(b) || b instanceof HTMLElement) mvoContent = b; }
	});
	
	Object.defineProperty(this, "contentType", {
		get: function() {
			switch (true) {
				case mvoContent instanceof HTMLElement: return jsTask.content.element;
				case typeof mvoContent === "string": return jsTask.content.url;
			}
		}
	});
	
	Object.defineProperty(this, "createWindow", {
		value: function(cb) {	
			if (mviMaxWindows > mvoCurrentWindows.length) {
				var wnd = new jsWindow();

				jsValidation.callEvent(Me, "js.createwindow", wnd);
			
				wnd.token = mvsToken;
				wnd.settings = mvoSettings;
				wnd.theme = mvoTheme;
				wnd.applyToBadge = false;

				wnd.addEventListener("js.close", function() {
					jsValidation.remove(mvoCurrentWindows, wnd);
				});
			
				contentToElement(wnd, cb); mvoCurrentWindows.push(wnd);
			
				return wnd;
			}
			
			return null;
		}
	});
	
	function contentToElement(wnd, cb) {
		switch (Me.contentType) {
			case jsTask.content.url:
				wnd.load(mvoContent, function() {
					removeIDs(wnd.container.container); jsValidation.call.call(cb, wnd);
				})
				break;
			case jsTask.content.element:
				wnd.body.container.appendChild(mvoContent.cloneNode(true)); removeIDs(wnd.container.container); jsValidation.call.call(cb, wnd);
				break;
		}
	}
	
	function removeIDs(elem) {
		if (mvbRemoveID === true) {
			jsValidation.iterate(elem.querySelectorAll('[id]'), false, function(x) {
				x.removeAttribute("id");
			});
		}
	}
}

function jsTooltip(elem) {
	if (elem instanceof HTMLElement) {
		jsEventTarget.call(this);
		
		var mvoTarget = elem;
		var mvoContainer = null;
		var mvoContent = null;
		var mvoParent = null;
		var mvsPosition = null;
		var mviMargin = 5;
		var Me = this;
		
		Object.defineProperty(this, "container", {
			get: function() { return mvoContainer; },
			set: function(c) { if (c instanceof HTMLElement) mvoContainer = c; }		
		});
		
		Object.defineProperty(this, "content", {
			get: function() { return mvoContent; },
			set: function(c) { if (c instanceof HTMLElement) mvoContent = c; }		
		});
		
		Object.defineProperty(this, "parent", {
			get: function() { return mvoParent; },
			set: function(c) { if (c instanceof HTMLElement) mvoParent = c; }		
		});
		
		Object.defineProperty(this, "direction", {
			get: function() { return mvsPosition; },
			set: function(c) { if (jsValidation.isString(c)) mvsPosition = c; }		
		});
		
		
		Object.defineProperty(this, "show", {
			value: function() {
				appendToParent();
			}
		});
		
		function removeFromParent() {
			if (mvoContainer.parentNode instanceof HTMLElement) mvoContainer.parentNode.removeChild(mvoContainer);
		}
		
		function appendToParent() {
			jsValidation.callEvent(Me, "js.show", Me);
			
			removeFromParent(); appendContent(); setPosition();
			
			if (mvoParent instanceof HTMLElement) { mvoParent.appendChild(mvoContainer) } else {
				document.body.appendChild(mvoContainer);
			}
			
			jsValidation.callEvent(Me, "js.shown", Me);
		}
		
		function appendContent() {
			if (mvoContent instanceof HTMLElement) {
				if (mvoContent.parentNode != null) mvoContainer.removeChild(mvoContent);
			
				mvoContainer.appendChild(mvoContent);
			}
		}
		
		function setPosition() {
			var rect = jsValidation.dimensionOf(mvoTarget);
			var cont = jsValidation.dimensionOf(mvoContainer);
			
			switch (mvsPosition) {
				case "top": setTop(); break;
				case "bottom": setBottom(); break;
				case "left": setLeft(); break;
				case "right": setRight(); break;
				
				default: setBottom();
			}
			
			function setTop() {
				mvoContainer.style.left = corHorizontal(rect.left + (rect.width / 2) - (cont.width / 2), cont.width) + "px";
				mvoContainer.style.top = corVertical(rect.top - mviMargin, cont.height) + "px";
			}
			function setBottom() {
				mvoContainer.style.left = corHorizontal(rect.left + (rect.width / 2) - (cont.width / 2), cont.width) + "px";
				mvoContainer.style.top = corVertical(rect.bottom + mviMargin, cont.height) + "px";
			}
			function setLeft() {
				mvoContainer.style.left = corHorizontal(rect.left - mviMargin, cont.width) + "px";
				mvoContainer.style.top = corVertical(rect.top + (rect.height / 2) - (cont.height / 2)) + "px";	
			}
			function setRight() {
				mvoContainer.style.left = corHorizontal(rect.right + mviMargin, cont.width) + "px";
				mvoContainer.style.top = corVertical(rect.top + (rect.height / 2) - (cont.height / 2)) + "px";	
			}
		
		
			function corHorizontal(x, w) {
				if (x + w > window.outerWidth) x -= x - window.outerWidth;
				if (x < 0) x = mviMargin;
				
				return x;
			}
			
			function corVertical(y, h) {
				if (y + h > window.outerHeight) y -= y - window.outerHeight;
				if (y < 0) y = mviMargin;
				
				return y;
			}
		}
	
		//################################################################
		
		function cstruct() {
			create(); initEvents();
		}
		
		function create() {
			mvoContainer = document.createElement("div"); mvoContainer.className = "jsw-tooltip";
		}
		
		function initEvents() {
			mvoTarget.addEventListener("mouseenter", appendToParent);
			mvoTarget.addEventListener("mouseleave", removeFromParent);
		}
		
		cstruct();
	}
}

function jsMessager() {
	jsWindow.call(this);
	
	var Me = this;
	var mvoLabel = null;
	var mvoReturn = null;
	var mvoBtnContainer = null;
	
	
	Object.defineProperty(this, "text", {
		get: function() { return mvoLabel.innerText; },
		set: function(s) { if (jsValidation.isString(s)) mvoLabel.innerText = s; }
	});
	
	Object.defineProperty(this, "textContainer", {
		get: function() { return mvoLabel; }
	});
	
	
	Object.defineProperty(this, "addButton", {
		value: addButton
	});
	
	function cstruct() {
		initContent();
		initSettings();
		initTheme();
		initEvents();
	}
	
	function initTheme() {
		var theme = new jsWindowTheme("messager");
		var obj = JSON.parse('{"header":{"title":{"icon":"icon-info"},"icons":{"minimize":"jsm-icon-disable", "maximize":"jsm-icon-disable"}},"container":{"container":"jsm-container"},"body":{"container":"jsm-body"}}');
		
		theme.readFromObject(obj);
		
		Me.theme = theme;
	}
	
	function initSettings() {
		var settings = new jsWindowSettings();
		
		settings.maximizeable = false;
		settings.minimizeable = false;
		settings.draggable = true;
		settings.sizeable = false;
		settings.x = null;
		settings.y = null;
		settings.height = null;
		settings.width = null;
		
		Me.settings = settings;
	}
	
	function initContent() {
		var textContainer = document.createElement("div"); textContainer.className = "jsm-text-container";
		var buttonContainer = document.createElement("div"); buttonContainer.className = "jsm-button-container";
		var text = document.createElement("div"); text.className = "jsm-text";
			
		textContainer.appendChild(text);	
		Me.body.container.appendChild(textContainer);
		Me.body.container.appendChild(buttonContainer);
		
		mvoLabel = text;
		mvoBtnContainer = buttonContainer;
	}


	function addButton(text, ret, exit, cb) {
		if (!jsValidation.isBool(exit)) exit = true;
		if (jsValidation.isString(text)) {
			var button = document.createElement("button"); button.className = "jsm-button"; button.innerText = text;
			
			button.addEventListener("click", function() {
				mvoReturn = ret; returnDialog(); 
				
				if (exit === true) { jsValidation.call.call(cb); Me.close(); }			
			});
			
			mvoBtnContainer.appendChild(button);
		}
	}

	function initEvents() {
		window.addEventListener("resize", calcPosition);

		Me.addEventListener("js.show", calcPosition);
	}

	function calcPosition() {
		var rect = jsValidation.dimensionOf(Me.container.container);
		var x = (window.innerWidth / 2) - (rect.width / 2);
		var y = (window.innerHeight / 2) - (rect.height / 2);
		
		Me.container.setPosition(x, y);		
	}

	function returnDialog(e) {
		var ev = jsValidation.callEvent(Me, "js.return", mvoReturn);
	}


	cstruct();
}

var jsValidation = new function () {
    this.isBool = function (b) { return typeof b === "boolean"; }
    this.isNumber = function (n) { return typeof n === "number"; }
    this.isUNumber = function (n) { return typeof n === "number" && n >= 0; }
	this.isString = function (s) { return typeof s === "string"; }
    this.isMethod = function (f) { return typeof f === "function"; }
    this.isArray = function (a) { return a instanceof Array; }
    this.isNone = function (v) { return v == null }
    this.isValue = function (v) { return v != null && v !== "" }
    this.isObject = function (v) { return !jsValidation.isNone(v) && typeof v === "object"; }
    this.onValue = function (v, cb) { if (jsValidation.isValue(v) && jsValidation.isMethod(cb)) cb(v) }
    this.callEvent = function (src, name, params) {
        if (src instanceof jsEventTarget && typeof name === "string") {
            var ev = new jsEvent(name); ev.parameter = params;

            src.dispatchEvent(ev);
			
			return ev;
        }
    }
    this.call = function () {
        if (typeof this === "function") return this.apply(this, arguments);
    }
    this.callDOMEvent = function(elem, name) {
		var ev = new Event(name);
		
		elem.dispatchEvent(ev);
	}
	this.isChildOf = function(elem, cont) {
        if (cont instanceof HTMLElement && elem instanceof HTMLElement) {
            var parent = elem;

            while (parent != null) {
                if (parent == cont) return true;

                parent = parent.parentNode;
            }
        }

        return false;
    }
	this.remove = function(arr, item) {
		var len = arr.length - 1;
		
		for(var i = len; i >= 0; i--) {
			if (arr[i] === item) arr.splice(i, 1);
		}
	}
	this.removeIf = function(arr, cb) {
		var len = arr.length - 1;
		
		for (var i = len; i >= 0; i--) {
			if (cb(arr[i]) === true) arr.splice(i, 1);
		}
	}
	this.contains = function(arr, item) {
		var len = arr.length - 1;
		
		for(var i = len; i >= 0; i--) {
			if (arr[i] === item) return true;
		}
		
		return false;
	}
	this.uuid = function() {
		return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
			var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
			return v.toString(16);
   });
	}
	this.compareArray = function(a, b) {
		if (a.length === b.length) {
			var len = a.length;
		
			for (var i = 0; i < len; i++) {
				if (!jsValidation.contains(b, a[i])) return false;
			}
			
			return true
		}
		
		return false;
	}
	this.isNullOrWhitespace = function(s) {
		return s == null || s.match(/^ *$/) != null;
	}
	this.iterate = function(elem, deep, cb) {
		if (typeof cb !== "function") return undefined;
		
		var len = 0;
		var arr = null;
		
		if (elem instanceof HTMLElement) arr = elem.children;		
		if (elem instanceof Array || elem instanceof HTMLCollection || elem instanceof NodeList) arr = elem;
				
		if (arr != null) {
			if (typeof deep != "boolean") deep = false;
			
			len = arr.length;
			
			for (var i = 0; i < len; i++) {
				if (deep === true) jsValidation.iterate(arr[i], deep, cb);
				
				cb(arr[i]);
			}
		}
	}
	this.dimensionOf = function(elem) {
		if (elem instanceof HTMLElement) {
			if (jsValidation.isChildOf(elem, document.body)) {
				return elem.getBoundingClientRect();
			} else { 
				var pos = elem.style.position;
				var dis = elem.style.display;
				var vis = elem.style.visibility;
				var rect = null;
				
				elem.style.position = "absolute";
				elem.style.visibility = "hidden";
				elem.style.display = "block";
				
				document.body.appendChild(elem);
				
				rect = elem.getBoundingClientRect();
				
				elem.style.position = pos;
				elem.style.visibility = vis;
				elem.style.display = dis;
				
				elem.className = elem.className;
				
				document.body.removeChild(elem);
				
				return rect;
			}
		}
		
		return null;
	}
	this.clearChilds = function(elem) {
		if (elem instanceof HTMLElement) {
			while (elem.lastChild != null) elem.removeChild(elem.lastChild);
		}
	}
}

var jsWindowBadge = new function () {
	jsEventTarget.call(this);
	
	var mvoKeyListener = new jsKeyListener();
    var mvoArrWindows = [];
	var mvoArrTasks = [];
	var mvoBadge = new jsBadge();
	var Me = this;

    Object.defineProperty(this, "windows", {
        get: function () { return mvoArrWindows.slice(); }
    });

	Object.defineProperty(this, "badge", {
        get: function () { return mvoBadge; }
    });

    Object.defineProperty(this, "focusedWindow", {
        get: function () {
            var len = mvoArrWindows.length;
            var arr = mvoArrWindows.filter(function (w) {
                return w.container.isFocused;
            });;

            if (len > 0) {
                if (len > 1) {
                    for (var i = 1; i < len; i++) arr[i].container.defocus();
                } 

                return arr[0];
            }

            return null;
        }
    })

	Object.defineProperty(this, "remove", {
        value: function (wnd) { 
			if (wnd instanceof jsWindow) {
				jsValidation.callEvent(this, "js.remove", wnd)

				jsValidation.remove(mvoArrWindows, wnd); mvoBadge.remove(wnd);

				jsValidation.callEvent(this, "js.removed", wnd)
			}
			
			if (wnd instanceof jsTask) {
				jsValidation.callEvent(this, "js.remove", wnd)

				jsValidation.remove(mvoArrTasks, wnd); mvoBadge.remove(wnd);

				jsValidation.callEvent(this, "js.removed", wnd)
			}
		}
    });
	
	Object.defineProperty(this, "append", {
        value: function (wnd) {
			if (wnd instanceof jsWindow && !jsValidation.contains(mvoArrWindows, wnd)) {
				jsValidation.callEvent(this, "js.append", wnd)

				mvoArrWindows.push(wnd); mvoBadge.append(wnd);

				jsValidation.callEvent(this, "js.appended", wnd)
			}

			if (wnd instanceof jsTask && !jsValidation.contains(mvoArrTasks, wnd)) {
				jsValidation.callEvent(this, "js.append", wnd)

				mvoArrTasks.push(wnd); mvoBadge.append(wnd);

				jsValidation.callEvent(this, "js.appended", wnd)				
			}
		}
    });

	Object.defineProperty(this, "createWindowIcon", {
		value: function(wnd) {
			var img = null;
			
			if((wnd instanceof jsWindow || wnd instanceof jsTask) && wnd.image) { 
				img = document.createElement("img");
				img.src = wnd.image; 
			} else {
				img = document.createElement("span");
				img.className = "icon-window"; 
			}
			
			
			return img;
		}
	});

	Object.defineProperty(this, "createTask", {
        value: function (content) {
			var task = new jsTask(); task.content = content;
			
			return task;
		}
    });

	//#######################################################################
	function cstruct() {
		mvoKeyListener.append("minimizeAll", [17, 18, 77], minimizeAll);
		mvoKeyListener.append("showAll", [17, 18, 83], showAll);
	}
	
	cstruct();

	//#######################################################################
	
	function minimizeAll() {
		mvoArrWindows.forEach(function(w) {
			w.minimize();
		})
	}
	
	function showAll() {
		mvoArrWindows.forEach(function(w) {
			w.show();
		})
	}

	//#######################################################################
	function jsBadge(direction) {
		jsEventTarget.call(this);
		
		var mvaDirections = ["horizontal", "vertical"];
		var mvsDirection = jsValidation.contains(mvaDirections, direction) ? direction : "horizontal";
		var mvoList = null;
		var mvoParent = null;
		var mvoContainer = null;
		var MeBadge = this;
		
		Object.defineProperty(this, "append", {
			value: function(wnd) {
				if (wnd instanceof jsWindow && wnd.applyToBadge === true) {		
					var li = document.createElement("li"); //li.innerText = wnd.title;
					var img =  Me.createWindowIcon(wnd);
					var tooltip = new jsTooltip(li);					
					var label = document.createElement("label");
					
					li.appendChild(img);
					
					li.addEventListener("click", function() {
						wnd.show();
						wnd.container.focus();					
					});
					li.addEventListener("remove", function(e) {
						if (e.detail.item === wnd) mvoList.removeChild(li);
					});
					
					tooltip.addEventListener("js.show", function() {
						label.innerText = wnd.title;
					});
					
					tooltip.content = label;
					tooltip.parent = mvoList;
					
					wnd.addEventListener("js.closed", function() {
						if (jsValidation.isChildOf(mvoList, li)) mvoList.removeChild(li);
					});
					wnd.addEventListener("js.imagechanged", function() {
						var rep = Me.createWindowIcon(wnd);
						
						li.replaceChild(rep, img);
						img = rep;
					});
					
					mvoList.appendChild(li);
				}
				
				if (wnd instanceof jsTask) {
					var li = document.createElement("li");
					var img =  Me.createWindowIcon(wnd);
					var tooltip = new jsTooltip(li);					
					var label = document.createElement("label");
					
					li.appendChild(img);
					
					li.addEventListener("click", function() {
						if (wnd.windows.length > 0) {
							wnd.windows[0].show();
							wnd.windows[0].container.focus();
						} else { 
							wnd.createWindow(function(w) {
								w.show(); w.container.focus();
							}); 
						}
					});
					li.addEventListener("remove", function(e) {
						if (e.detail.item === wnd) mvoList.removeChild(li);
					});
				
					tooltip.addEventListener("js.show", function() {
						label.innerText = wnd.name;
					});
					
					tooltip.content = label;
					tooltip.parent = mvoList;
				
					mvoList.appendChild(li);
				}
			}
		});
		
		Object.defineProperty(this, "remove", {
			value: function(wnd) {
				if (wnd instanceof jsWindow || wnd instanceof jsTask) {				
					var arr = mvoList.children;
					var len = arr.length - 1;
					var evRemove = new CustomEvent("remove", { "detail": { "item": wnd }});

					for(var i = len; i >= 0; i--) {
						arr[i].dispatchEvent(evRemove);
					}
				}
			}
		});
		
		Object.defineProperty(this, "parent", {
			get: function() { return mvoContainer.parentNode; },
			set: function (elem) { 
				if (elem instanceof HTMLElement) {
					if (mvoContainer.parentNode instanceof HTMLElement){
						mvoContainer.parentNode.removeChild(mvoContainer);
					}
					
					mvoParent = elem;
					mvoParent.appendChild(mvoContainer);
				}
			}
		});
		
		Object.defineProperty(this, "setDirection", {
			value: function (direction) { 
				if (jsValidation.contains(mvaDirections, direction)) {
					mvsDirection = direction;
					mvoList.className = "jsw-badge-" + mvsDirection;
				}
			}
		});
		
		Object.defineProperty(this, "removeSelf", {
			value: function () { 
				if (mvoContainer.parentNode instanceof HTMLElement) {
					mvoContainer.parentNode.removeChild(mvoContainer);
				}
			}
		});
		
		function badgecstruct() {
			create();
		}
		
		function create() {
			//Container
			var div_BadgeCont = document.createElement("div"); div_BadgeCont.className = "jsw-badge-container";
			var ul_BadgeWindows = document.createElement("ul"); ul_BadgeWindows.className = "jsw-badge jsw-badge-" + mvsDirection;
			//Appending
			div_BadgeCont.appendChild(ul_BadgeWindows);
			//Setting-Globals
			mvoContainer = div_BadgeCont;
			mvoList = ul_BadgeWindows;
		}
		
		
		badgecstruct();
	}
	
	jsBadge.prototype = Object.create(jsEventTarget.prototype);
}

jsWindow.prototype = Object.create(jsEventTarget.prototype);
jsWindowBadge.prototype = Object.create(jsEventTarget.prototype);
jsFreeDraggable.prototype = Object.create(jsEventTarget.prototype);
jsFreeSizeable.prototype = Object.create(jsEventTarget.prototype);
jsTask.prototype = Object.create(jsEventTarget.prototype);
jsTooltip.prototype = Object.create(jsEventTarget.prototype);
jsMessager.prototype = Object.create(jsEventTarget.prototype);

new function() {
	var defaultClasses = JSON.parse('{"header":{"container":"jsw-header","title":{"container":"jsw-header-title","image":"","icon":"icon-window","label":""},"icons":{"container":"jsw-header-icons","close":"jsw-header-icon icon-cross","maximize":"jsw-header-icon icon-window-maximize","minimize":"jsw-header-icon icon-minus"}},"body":{"container":"jsw-body"},"container":{"container":"jsw-container"}}');
	var defaultTheme = new jsWindowTheme("default");
	var defaultSettings = new jsWindowSettings();
	var taskTypes = Object.freeze({ "url":"url", "element":"element" })
	var messagerButtons = Object.freeze({"ok":"ok","cancel":"cancel","no":"no","yes":"yes"});
	var messagerTexts = {"ok":"OK","cancel":"Cancel","no":"No","yes":"Yes"}

	Object.defineProperty(jsWindow, "style", {
		get: function() { return defaultClasses; }
	});
	
	Object.defineProperty(jsWindow, "theme", {
		get: function() { return defaultTheme; },
		set : function(t) { if (t instanceof jsWindowTheme) defaultTheme = t; }
	});
	
	Object.defineProperty(jsWindow, "settings", {
		get: function() { return defaultSettings; },
		set: function(s) { if (s instanceof jsWindowSettings) defaultSettings = s; }
	});
	
	Object.defineProperty(jsTask, "content", {
		get: function() { return taskTypes; }
	});
	
	Object.defineProperty(jsMessager, "buttons", {
		get: function() { return messagerButtons; }
	});
	
	Object.defineProperty(jsMessager, "texts", {
		get: function() { return messagerTexts; },
		set: function(o) { if (jsValidation.isObject(o)) Object.assign(o, messagerTexts); }
	});
	
	Object.defineProperty(jsMessager, "alert", {
		value: function(text, title) {
			var messager = new jsMessager();
			
			messager.text = text;
			messager.title = title;
			
			messager.addButton(jsMessager.texts.ok, jsMessager.buttons.ok)
			
			messager.show();
			
			return messager;
		}
	});
	
	Object.defineProperty(jsMessager, "confirm", {
		value: function(text, title, cb) {
			var messager = new jsMessager();
			
			messager.text = text;
			messager.title = title;
			
			messager.addButton(jsMessager.texts.yes, jsMessager.buttons.yes)
			messager.addButton(jsMessager.texts.no, jsMessager.buttons.no)
			messager.addButton(jsMessager.texts.cancel, jsMessager.buttons.cancel)
			
			messager.addEventListener("js.return", function(e) {
				if (e.parameter === jsMessager.buttons.yes) jsValidation.call.call(cb);
			});
			
			messager.show();
			
			return messager;
		}
	});
}