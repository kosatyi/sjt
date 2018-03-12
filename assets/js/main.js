(function(){
    this.noopElement = document.createElement('span');
    this.toArray = function(value){
        return Array.prototype.slice.call(value);
    };
    this.findAll = function(selector){
        return toArray(document.querySelectorAll(String(selector)));
    };
    this.find = function(selector){
        return document.querySelector(String(selector)) || noopElement;
    };
})();

(function(){
    var wrapper  = find('html');
    findAll('[data-toggle]').forEach(function(item){
        item.addEventListener('click',function(ev){
            ev.preventDefault();
            wrapper.classList.toggle(this.getAttribute('data-toggle'));
        })
    });
})();


(function(){
    var wrapper  = find('html');
    var toolbar  = find('.page-toolbar');
    var onscroll = function(){
        if( wrapper.scrollTop>0) {
            toolbar.classList.add('scrolled');
        } else {
            toolbar.classList.remove('scrolled');
        }
    };
    window.addEventListener('scroll',onscroll);
    onscroll();
})();

(function(){
    var href = location.href;
    findAll('[href],[data-rel]').filter(function(el,expr){
        expr = el.getAttribute('data-rel');
        return expr ? href.match(expr) : el.href ? href.indexOf(el.href) !== -1 : false;
    }).map(function(el){
        el.classList.add('active');
    });
})();