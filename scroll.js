
function Scroll(options) {
    var cssCore = function(testCss) {
        switch (true) {
            case testCss.webkitTransition === '':
            return 'webkit'; break;
            case testCss.MozTransition === '':
            return 'Moz'; break;
            case testCss.msTransition === '':
            return 'ms'; break;
            case testCss.OTransition === '':
            return 'O'; break;
            default:
            return '';
        }
    }(document.createElement('ComicView').style),
    translate = function() {
        if (cssCore !== '') {
            return function(o, x, y) {
                o[cssCore + 'Transform'] = 'translate(' + x +'px,' + y + 'px) translateZ(0)';
            } 
        } else {
            return function(o, x, y) {
                o.left = x + 'px';
                o.top = y + 'px';
            }
        }
    }(),
    addClass = function(o, cls) {
        var oN = o.className;

        if (oN.indexOf(cls) === -1) {
            o.className = oN + ' ' + cls;
        }
    },
    removeClass = function(o, cls) {
        var oN = o.className,
            arrName,
            arrNow;

        if (oN.indexOf(cls) === -1) return;
        arrName = oN.split(' ');
        arrNow  = arrName.length;
        while (arrNow--) {
            if (arrName[arrNow] === cls) {
                arrName.splice(arrNow, 1);
            }
        }
        o.className = arrName.join(' ');
    },
    $$ = function(s) {
        return document.getElementById(s);
    };

    var c  = $$(options.contain),
        w  = $$(options.wrap),
        sb = $$(options.scrollBg),
        sk = $$(options.scrollBlock),
        fd = options.factHeightDiff         || 0,
        fh = options.scrollBarHeightDiff    || 0,
        fx = options.heightFix              || 0,
        H  = c.offsetHeight,
        cs = c.style,
        bs = sk.style,
        ws = w.style,
        gs = sb.style,
        isValidDrag = false,
        start  = {},
        delta  = {},
        nowTop = 0,
        o = w,
        max, h, S, s, _top, _thisScroll;

    cs.position = 'absolute';
    while (o.tagName.toUpperCase() !== 'BODY') {
        _thisScroll = o.getAttribute('data-scroll');
        if (_thisScroll) {
            scrollArr.push(_thisScroll);
            break;
        } else {
            o = o.parentNode;
        }
    }

    function pull() {
        if (_top < 0) {
            _top = 0
        } else if (_top > max) {
            _top = max;
        }
        try {
            bs.top = _top + 'px';
            translate(cs, 0, (_top / max * (h - H)) >> 0);
        } catch(e) {

        }
    }

    sk.onmousedown = function(e) {
        isValidDrag = true;
        body.onmousemove = goScroll;
        addClass(sb, 'scroll-scrolling');
        removeClass(c, 'moved');
        e = e || window.event;
        start = {
            X: e.clientX,
            Y: e.clientY,
            time: +new Date
        }
        delta = {};
    }
    sb.onmousedown = function(e) {
        e = e || window.event;
        if ( (e.target || e.srcElement) === sk) return;
        _top = e.offsetY < nowTop ? nowTop - (s * .7) >> 0
                                  : nowTop + (s * .7) >> 0;
        pull();
        nowTop = _top;
    }

    return {
        init: function(width, height) {
            H = c.offsetHeight || H;
            h = fx ? fx : height - fd;
            h = H - 1 < h ? H : h;
            S = h - fh;
            s = h / H * S;
            s = s > S ? S + 1 : s;
            ws.width = c.offsetWidth + 'px';
            ws.height = h + 'px';
            try {
                gs.height = S + 'px';
                bs.height = s + 'px';
            } catch(e) {

            }
            if (H === h) {
                gs.display = 'none';
            } else {
                gs.display = 'block';
            }
            max = ~~(S - s + 1);
            setTimeout(function() {
                pull();
            }, 0);
        },
        set: function(p) {
            _top = ((S - s) * p);
            pull();
            nowTop = _top;
        },
        reStart: function() {
            isValidDrag = false;
            removeClass(sb, 'scroll-scrolling');
            addClass(c, 'moved');
            if (!delta.Y) return;
            nowTop = _top;
        },
        isValid: function() {
            return isValidDrag;
        },
        nowTop: function() {
            return nowTop;
        },
        runScroll: function(e) {
            _t = this;
            delta = {
                X: e.clientX - start.X,
                Y: e.clientY - start.Y
            }
            _top = nowTop + delta.Y;
            pull();
        },
        wheelMove: function(dir) {
            _top = nowTop + ~~(s * .1) * dir;
            pull();
            nowTop = _top;
        }
    }
}
var body = document.body,
    scrollArr = [],
    goScroll = function(e) {
        var len = scrollArr.length,
            o;
        e = e || window.event;
        if (e.preventDefault) {
            e.preventDefault();
        } else {
            e.returnValue = false;
        }
        while (len--) {
            o = new Function('return ' + scrollArr[len])();
            if (o.isValid()) {
                o.runScroll(e);
            }
        }
    },
    wheelScroll = function(e) {
        var isFromScroll = false,
            direct,
            thisScroll,
            o;
        e = e || window.event;
        o = e.target || e.srcElement;

        while (o.tagName.toUpperCase() !== 'BODY') {
            thisScroll = o.getAttribute('data-scroll');
            if (thisScroll) {
                isFromScroll = true;
                break;
            } else {
                o = o.parentNode;
            }
        }
        if (!isFromScroll) return;

        if (e.preventDefault) {
            e.preventDefault();
        } else {
            e.returnValue = false;
        }
        direct = - e.wheelDelta || e.detail;
        direct = direct < 0 ? -1 : 1;
        (new Function("return " + thisScroll)()).wheelMove(direct);
    },
    _t;

body.onmouseup = function() {
    body.onmousemove = null;
    if (_t) {
        _t.reStart();
    }
}

if (window.addEventListener) {
    document.addEventListener('DOMMouseScroll', wheelScroll, false);
}
window.onmousewheel = document.onmousewheel = wheelScroll;