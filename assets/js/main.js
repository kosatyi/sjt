(function () {


    var sjt = {};

    sjt.utils = {};

    sjt.window   = window;

    sjt.document = document;

    sjt.location = location;

    sjt.history = history;

    sjt.hasCreateEvent = ('createEvent' in document);

    sjt.historySupport = !!(sjt.history && sjt.history.pushState);

    sjt.toArray = function (value) {
        return Array.prototype.slice.call(value);
    };
    sjt.findAll = function (selector, parent) {
        return this.toArray((parent || this.document).querySelectorAll(String(selector)));
    };
    sjt.find = function (selector, parent) {
        return (parent || this.document).querySelector(String(selector)) || null;
    };

    sjt.requestAnimationFrame = sjt.window.requestAnimationFrame || (function () {
        return window.webkitRequestAnimationFrame ||
            window.mozRequestAnimationFrame ||
            window.oRequestAnimationFrame ||
            window.msRequestAnimationFrame ||
            function (callback) {
                sjt.window.setTimeout(callback, 1000 / 60);
            };
    })();

    sjt.domReady = function () {
        return (this.document.readyState === 'complete' ||
            this.document.readyState === 'loaded' ||
            this.document.readyState === 'interactive');
    };

    sjt.transitionEvent = (function () {
        var t, el = this.document.createElement('fakeelement');
        var transitions = {
            'transition': 'transitionend',
            'OTransition': 'oTransitionEnd',
            'MozTransition': 'transitionend',
            'WebkitTransition': 'webkitTransitionEnd'
        }
        for (t in transitions) {
            if (el.style[t] !== undefined) {
                return transitions[t];
            }
        }
    })();

    sjt.trigger = function (elem, name) {
        var event;
        if (this.hasCreateEvent) {
            event = this.document.createEvent('HTMLEvents');
            event.initEvent(name, true, true);
        } else {
            event = this.document.createEventObject();
            event.eventType = name;
        }
        event.eventName = name;
        if (this.hasCreateEvent) {
            elem.dispatchEvent(event);
        } else {
            elem.fireEvent('on' + event.eventType, event);
        }
    };

    sjt._event_ = function (c, a) {
        var s = a.length === 2,
            e = s ? this.window : a[0],
            n = s ? a[0] : a[1],
            f = s ? a[1] : a[2];
        e[c].apply(e,[n,f]);
    };

    sjt.on = function () {
        //console.log('addEventListener',arguments);
        this._event_('addEventListener', arguments);
    };

    sjt.off = function () {
        //console.log('removeEventListener',arguments);
        this._event_('removeEventListener', arguments);
    };

    sjt.replaceChild = function(item,replacer){
        item.parentNode && item.parentNode.replaceChild(replacer,item);
    };

    sjt.addClass = function(el,name){
        el.classList.add(name);
    };

    sjt.removeClass = function(el,name){
        el.classList.remove(name);
    };

    sjt.toggleClass = function(el,name){
        el.classList.toggle(name);
    };

    this.sjt = sjt;

})();



(function () {
    var anchorScrolls = {
        ANCHOR_REGEX: /^#[^ ]+$/,
        OFFSET_HEIGHT_PX: 57 + 16,
        init: function () {
            this.scrollToCurrent();
            sjt.on(sjt.window,'hashchange',this.scrollToCurrent.bind(this));
            sjt.on(sjt.document.body,'click',this.delegateAnchors.bind(this));
        },
        getFixedOffset: function () {
            return this.OFFSET_HEIGHT_PX;
        },
        scrollIfAnchor: function (href, pushToHistory) {
            var match, rect, anchorOffset;
            if (!this.ANCHOR_REGEX.test(href)) {
                return false;
            }
            match = sjt.document.getElementById(href.slice(1));
            if (match) {
                rect = match.getBoundingClientRect();
                anchorOffset = sjt.window.pageYOffset + rect.top - this.getFixedOffset();
                sjt.window.scrollTo(sjt.window.pageXOffset, anchorOffset);
                if (sjt.historySupport && pushToHistory) {
                    sjt.history.pushState({}, document.title, location.pathname + href);
                }
            }
            return !!match;
        },
        scrollToCurrent: function () {
            this.scrollIfAnchor(location.hash);
        },
        delegateAnchors: function (e) {
            var elem = e.target;
            if (
                elem.nodeName === 'A' &&
                this.scrollIfAnchor(elem.getAttribute('href'), true)
            ) {
                sjt.trigger(window,'historychange');
                e.preventDefault();
            }
        }
    };
    anchorScrolls.init();
})();

(function () {
    sjt.findAll('[data-toggle]').forEach(function (item) {
        sjt.on(item,'click',function(ev){
            ev.preventDefault();
            sjt.toggleClass(sjt.find('html'),this.getAttribute('data-toggle'));
        });
    });
})();

(function () {
    function FitHeight(elem) {
        var parent = elem.parentNode;
        var total  = parent.offsetHeight;
        var height = 0;
        sjt.toArray(parent.childNodes).forEach(function(child){
            if (child.nodeType === 1 && child !== elem)
                height += child.offsetHeight;
        });
        elem.style.height = String(total - height).concat('px');
    }

    function eventHandler(){
        sjt.findAll('.page-nav-scroll').forEach(FitHeight);
    }

    eventHandler();

    sjt.on(sjt.window,'resize',eventHandler);
    sjt.on(sjt.window,sjt.transitionEvent,eventHandler);

})();


(function () {


    function normalizeNode(node){
        var new_node;
        console.log(node);
        for (var i = 0, children = node.childNodes, nodeCount = children.length; i < nodeCount; i++) {
            var child = children[i];
            if (child.nodeType == 1) {
                normalizeNode(child);
                continue;
            }
            if (child.nodeType != 3) {
                continue;
            }
            var next = child.nextSibling;
            if (next == null || next.nodeType != 3) {
                continue;
            }
            var combined_text = child.nodeValue + next.nodeValue;
            new_node = node.ownerDocument.createTextNode(combined_text);
            node.insertBefore(new_node, child);
            node.removeChild(child);
            node.removeChild(next);
            i--;
            nodeCount--;
        }
    }

    function removeHighlight(node) {
        sjt.findAll('mark',node).forEach(function (item,parent) {
            parent = item.parentNode;
            sjt.replaceChild(item,item.firstChild);
            normalizeNode(parent);
        });
    }

    function innerHighlight(node, value) {
        var skip = 0, pos, i;
        if (node.nodeType == 3) {
            pos = node.data.toUpperCase().indexOf(value);
            if (pos >= 0) {
                var mark = document.createElement('mark');
                var middlebit = node.splitText(pos);
                var endbit = middlebit.splitText(value.length);
                var middleclone = middlebit.cloneNode(true);
                mark.appendChild(middleclone);
                middlebit.parentNode.replaceChild(mark, middlebit);
                skip = 1;
            }
        }
        else if (node.nodeType == 1 && node.childNodes && !/(script|style)/i.test(node.tagName)) {
            for (i = 0; i < node.childNodes.length; ++i) {
                i += innerHighlight(node.childNodes[i], value);
            }
        }
        return skip;
    }

    function inputHandler() {
        var value = String(this.value).toUpperCase();
        var menu = sjt.find('.page-nav-menu');
        removeHighlight(menu);
        if (value) {
            innerHighlight(menu, value);
        }
        sjt.findAll('a', menu).forEach(function (item) {
            if (value) {
                if (sjt.find('mark', item)) {
                    item.style.display = '';
                } else {
                    item.style.display = 'none';
                }
            } else {
                item.style.display = '';
            }
        });
    };

    sjt.findAll('.search').forEach(function (input) {
        sjt.on(input,'input',inputHandler);
    });

})();


(function () {
    var timeout = null;
    var wrapper = sjt.find('html');
    var toolbar = sjt.find('.page-toolbar');
    var event   = null;
    var eventHandler = function () {
        var currentOffset = toolbar.getBoundingClientRect().top;
        var stickyOffset = parseInt( getComputedStyle(toolbar).top.replace('px','') );
        var isStuck = currentOffset <= stickyOffset;
        if (isStuck) {
            toolbar.classList.add('is-sticky');
        } else {
            toolbar.classList.remove('is-sticky');
        }
    };
    eventHandler();
    sjt.on(window,'scroll',function(e){
        event = e;
        clearTimeout(timeout);
        timeout = setTimeout(eventHandler, 0);
    });
    sjt.on(sjt.window,'historychange',function(e){
        event = e;
        eventHandler()
    });
})();

(function () {
    function matchLinks() {
        var href = location.href, expr;
        sjt.findAll('[href],[data-rel]').filter(function (el) {
            el.classList.remove('active');
            expr = el.getAttribute('data-rel');
            return expr ? href.match(expr) : el.href ? href.indexOf(el.href) !== -1 : false;
        }).map(function (el) {
            el.classList.add('active');
        });
    }
    matchLinks();
    sjt.on(window,'historychange',matchLinks);
})();