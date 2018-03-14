(function () {
    this.toArray = function (value) {
        return Array.prototype.slice.call(value);
    };
    this.findAll = function (selector, parent) {
        return toArray((parent || document).querySelectorAll(String(selector)));
    };
    this.find = function (selector, parent) {
        return (parent || document).querySelector(String(selector)) || null;
    };
})();


(function () {
    var wrapper = find('html');
    findAll('[data-toggle]').forEach(function (item) {
        item.addEventListener('click', function (ev) {
            ev.preventDefault();
            wrapper.classList.toggle(this.getAttribute('data-toggle'));
        })
    });
})();


(function () {

    var search = find('.search');

    function newNormalize(node) {
        var new_node;
        for (var i = 0, children = node.childNodes, nodeCount = children.length; i < nodeCount; i++) {
            var child = children[i];
            if (child.nodeType == 1) {
                newNormalize(child);
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
    };

    function removeHighlight(node) {
        findAll('mark', node).forEach(function (item) {
            var thisParent = item.parentNode;
            thisParent.replaceChild(item.firstChild, item);
            newNormalize(thisParent);
        })
    };

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
    };
    search.addEventListener('input', function (ev) {
        var value = String(this.value).toUpperCase();
        var menu = find('.page-nav-menu');
        removeHighlight(menu);
        if (value) {
            innerHighlight(menu, value);
        }
        findAll('a', menu).forEach(function (item) {
            console.log(find('mark', item));
        });
    });
})();


(function () {
    var wrapper = find('html');
    var toolbar = find('.page-toolbar');
    var callback = function () {
        if (wrapper.scrollTop > 0) {
            toolbar.classList.add('scrolled');
        } else{
            toolbar.classList.remove('scrolled');
        }
    };
    var timeout = null;
    window.addEventListener('scroll', function () {
        clearTimeout(timeout);
        timeout = setTimeout(callback, 0);
    });
    callback();
})();

(function () {
    var href = location.href;
    findAll('[href],[data-rel]').filter(function (el, expr) {
        expr = el.getAttribute('data-rel');
        return expr ? href.match(expr) : el.href ? href.indexOf(el.href) !== -1 : false;
    }).map(function (el) {
        el.classList.add('active');
    });
})();