globalThis.VERSION_TIMESTAMP = "000", globalThis.DEBUG = !0, globalThis.INCLUDE_CHEATS = !0, 
globalThis.ROLLUP_BUILD = !1, globalThis.PUBLISHER_BUILD = "none", function() {
    if ("undefined" != typeof document && !("adoptedStyleSheets" in document)) {
        var t = "ShadyCSS" in window && !ShadyCSS.nativeShadow, e = document.implementation.createHTMLDocument(""), i = new WeakMap, n = "object" == typeof DOMException ? Error : DOMException, r = Object.defineProperty, s = Array.prototype.forEach, a = /@import.+?;?$/gm, o = CSSStyleSheet.prototype;
        o.replace = function() {
            return Promise.reject(new n("Can't call replace on non-constructed CSSStyleSheets."));
        }, o.replaceSync = function() {
            throw new n("Failed to execute 'replaceSync' on 'CSSStyleSheet': Can't call replaceSync on non-constructed CSSStyleSheets.");
        };
        var l = new WeakMap, h = new WeakMap, c = new WeakMap, d = new WeakMap, u = A.prototype;
        u.replace = function(t) {
            try {
                return this.replaceSync(t), Promise.resolve(this);
            } catch (t) {
                return Promise.reject(t);
            }
        }, u.replaceSync = function(t) {
            if (E(this), "string" == typeof t) {
                var e = this;
                l.get(e).textContent = function(t) {
                    var e = t.replace(a, "");
                    return e !== t && console.warn("@import rules are not allowed here. See https://github.com/WICG/construct-stylesheets/issues/119#issuecomment-588352418"), 
                    e.trim();
                }(t), d.set(e, []), h.get(e).forEach((function(t) {
                    t.isConnected() && T(e, M(e, t));
                }));
            }
        }, r(u, "cssRules", {
            configurable: !0,
            enumerable: !0,
            get: function() {
                return E(this), l.get(this).sheet.cssRules;
            }
        }), r(u, "media", {
            configurable: !0,
            enumerable: !0,
            get: function() {
                return E(this), l.get(this).sheet.media;
            }
        }), [ "addRule", "deleteRule", "insertRule", "removeRule" ].forEach((function(t) {
            u[t] = function() {
                var e = this;
                E(e);
                var i = arguments;
                d.get(e).push({
                    method: t,
                    args: i
                }), h.get(e).forEach((function(n) {
                    if (n.isConnected()) {
                        var r = M(e, n).sheet;
                        r[t].apply(r, i);
                    }
                }));
                var n = l.get(e).sheet;
                return n[t].apply(n, i);
            };
        })), r(A, Symbol.hasInstance, {
            configurable: !0,
            value: S
        });
        var p = {
            childList: !0,
            subtree: !0
        }, g = new WeakMap, f = new WeakMap, m = new WeakMap, v = new WeakMap;
        if (I.prototype = {
            isConnected: function() {
                var t = f.get(this);
                return t instanceof Document ? "loading" !== t.readyState : function(t) {
                    return "isConnected" in t ? t.isConnected : document.contains(t);
                }(t.host);
            },
            connect: function() {
                var t = L(this);
                v.get(this).observe(t, p), m.get(this).length > 0 && D(this), R(t, (function(t) {
                    C(t).connect();
                }));
            },
            disconnect: function() {
                v.get(this).disconnect();
            },
            update: function(t) {
                var e = this, i = f.get(e) === document ? "Document" : "ShadowRoot";
                if (!Array.isArray(t)) throw new TypeError("Failed to set the 'adoptedStyleSheets' property on " + i + ": Iterator getter is not callable.");
                if (!t.every(S)) throw new TypeError("Failed to set the 'adoptedStyleSheets' property on " + i + ": Failed to convert value to 'CSSStyleSheet'");
                if (t.some(w)) throw new TypeError("Failed to set the 'adoptedStyleSheets' property on " + i + ": Can't adopt non-constructed stylesheets");
                e.sheets = t;
                var n, r, s = m.get(e), a = (n = t).filter((function(t, e) {
                    return n.indexOf(t) === e;
                }));
                (r = a, s.filter((function(t) {
                    return -1 === r.indexOf(t);
                }))).forEach((function(t) {
                    var i;
                    (i = M(t, e)).parentNode.removeChild(i), function(t, e) {
                        c.get(t).delete(e), h.set(t, h.get(t).filter((function(t) {
                            return t !== e;
                        })));
                    }(t, e);
                })), m.set(e, a), e.isConnected() && a.length > 0 && D(e);
            }
        }, window.CSSStyleSheet = A, P(Document), "ShadowRoot" in window) {
            P(ShadowRoot);
            var _ = Element.prototype, x = _.attachShadow;
            _.attachShadow = function(t) {
                var e = x.call(this, t);
                return "closed" === t.mode && i.set(this, e), e;
            };
        }
        var y = C(document);
        y.isConnected() ? y.connect() : document.addEventListener("DOMContentLoaded", y.connect.bind(y));
    }
    function b(t) {
        return t.shadowRoot || i.get(t);
    }
    function S(t) {
        return "object" == typeof t && (u.isPrototypeOf(t) || o.isPrototypeOf(t));
    }
    function w(t) {
        return "object" == typeof t && o.isPrototypeOf(t);
    }
    function M(t, e) {
        return c.get(t).get(e);
    }
    function T(t, e) {
        requestAnimationFrame((function() {
            e.textContent = l.get(t).textContent, d.get(t).forEach((function(t) {
                return e.sheet[t.method].apply(e.sheet, t.args);
            }));
        }));
    }
    function E(t) {
        if (!l.has(t)) throw new TypeError("Illegal invocation");
    }
    function A() {
        var t = this, i = document.createElement("style");
        e.body.appendChild(i), l.set(t, i), h.set(t, []), c.set(t, new WeakMap), d.set(t, []);
    }
    function C(t) {
        var e = g.get(t);
        return e || (e = new I(t), g.set(t, e)), e;
    }
    function P(t) {
        r(t.prototype, "adoptedStyleSheets", {
            configurable: !0,
            enumerable: !0,
            get: function() {
                return C(this).sheets;
            },
            set: function(t) {
                C(this).update(t);
            }
        });
    }
    function R(t, e) {
        for (var i = document.createNodeIterator(t, NodeFilter.SHOW_ELEMENT, (function(t) {
            return b(t) ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT;
        }), null, !1), n = void 0; n = i.nextNode(); ) e(b(n));
    }
    function L(t) {
        var e = f.get(t);
        return e instanceof Document ? e.body : e;
    }
    function D(t) {
        var e = document.createDocumentFragment(), i = m.get(t), n = v.get(t), r = L(t);
        n.disconnect(), i.forEach((function(i) {
            e.appendChild(M(i, t) || function(t, e) {
                var i = document.createElement("style");
                return c.get(t).set(e, i), h.get(t).push(e), i;
            }(i, t));
        })), r.insertBefore(e, null), n.observe(r, p), i.forEach((function(e) {
            T(e, M(e, t));
        }));
    }
    function I(e) {
        var i = this;
        i.sheets = [], f.set(i, e), m.set(i, []), v.set(i, new MutationObserver((function(e, n) {
            document ? e.forEach((function(e) {
                t || s.call(e.addedNodes, (function(t) {
                    t instanceof Element && R(t, (function(t) {
                        C(t).connect();
                    }));
                })), s.call(e.removedNodes, (function(e) {
                    e instanceof Element && (function(t, e) {
                        return e instanceof HTMLStyleElement && m.get(t).some((function(e) {
                            return M(e, t);
                        }));
                    }(i, e) && D(i), t || R(e, (function(t) {
                        C(t).disconnect();
                    })));
                }));
            })) : n.disconnect();
        })));
    }
}();

const t = new CSSStyleSheet;

t.replaceSync('#gameContainer {\n\toverflow: hidden;\n\tposition: relative;\n\ttouch-action: none;\n}\n\n#gameContainer::before {\n\tcontent: "";\n\tposition: absolute;\n\twidth: 100%;\n\theight: 100%;\n\tbackdrop-filter: blur(3px);\n\t-webkit-backdrop-filter: blur(3px);\n\t--mask: linear-gradient(black 15%, transparent 30%, transparent 70%, black 85%);\n\t-webkit-mask-image: var(--mask);\n\tmask-image: var(--mask);\n}\n\nbutton {\n\tborder-radius: var(--default-border-radius);\n\tborder: none;\n\tpadding: 9px 16px 11px 16px;\n\tfont-size: 16pt;\n\tcursor: pointer;\n\tposition: relative;\n\toutline: none;\n}\n\nbutton:focus-visible::before {\n\tcontent: "";\n\tposition: absolute;\n\tborder: #00a6ff 2px solid;\n\toutline: white 2px solid;\n\tinset: -6px;\n\tpointer-events: none;\n    border-radius: 12px;\n\tz-index: 100;\n}\n\nbutton.button-with-icon {\n\tdisplay: flex;\n\talign-items: center;\n\tgap: 5px;\n}\n\nbutton .button-icon {\n\twidth: 1.5em;\n\theight: 1em;\n}\n\nbutton:hover {\n\tfilter: brightness(110%);\n}\nbutton:active {\n\tfilter: brightness(90%);\n}\n\nbutton.blue {\n\t--button-color: #3f87ff;\n\tbackground-color: var(--button-color);\n\tcolor: white;\n    -webkit-text-stroke: 1px var(--not-black);\n\tborder: 1px solid #000980;\n\t--highlight-shadow: #85b3ff 0px 1px 0px inset;\n\t--bottom-shadow: #1963e0 0px -6px 0px inset;\n\t--outline-shadow: white 0px 0px 0px 2px;\n\tbox-shadow: var(--highlight-shadow),\n\t\tvar(--bottom-shadow),\n\t\tvar(--outline-shadow);\n}\n\nbutton.yellow {\n\tbackground-color: var(--yellow);\n\tcolor: white;\n    -webkit-text-stroke: 1px var(--not-black);\n\tborder: 1px solid #000980;\n\tbox-shadow: var(--yellow-highlight) 0px 1px 0px inset,\n\t\tvar(--yellow-shadow) 0px -6px 0px inset,\n\t\twhite 0px 0px 0px 2px;\n}\n');

const e = new CSSStyleSheet;

e.replaceSync("html {\n\t--text-white: white;\n\t--price-color: #fbbb23;\n\t--price-shadow-color: #4e5200;\n\t--default-border-radius: 7px;\n\t--yellow: #ffc313;\n\t--yellow-highlight: #ffd849;\n\t--yellow-shadow: #ff9b00;\n}\n");

const i = new CSSStyleSheet;

i.replaceSync(".corner-stats-container {\n\tposition: absolute;\n\tz-index: 10;\n\tleft: 0;\n\ttop: 0;\n\tfont-size: 30pt;\n\tmargin: 10px;\n\tcolor: var(--text-white);\n    text-shadow: 0px 4px var(--not-black);\n    -webkit-text-stroke: 2px var(--not-black);\n\tdisplay: flex;\n\tflex-direction: column;\n}\n\n@media (max-width: 550px), (max-height: 550px) {\n\t.corner-stats-container {\n\t\ttransform: scale(0.7);\n\t\ttransform-origin: top left;\n\t}\n}\n\n@keyframes intense-shaking {\n\t0% {transform: translate(-5px, 3px);}\n\t10% {transform: translate(2px, 2px);}\n\t20% {transform: translate(-3px, -2px);}\n\t30% {transform: translate(4px, -2px);}\n\t40% {transform: translate(-2px, 5px);}\n\t50% {transform: translate(3px, -1px);}\n\t60% {transform: translate(-2px, 2px);}\n\t70% {transform: translate(5px, -3px);}\n\t80% {transform: translate(-3px, -3px);}\n\t90% {transform: translate(-4px, 3px);}\n\t100% {transform: translate(4px, 4px);}\n}\n\n.intense-shaking {\n\tanimation: intense-shaking 0.3s linear infinite alternate;\n}\n");

const n = new CSSStyleSheet;

n.replaceSync(".rewarded-suggestion {\n\twidth: 170px;\n\theight: 70px;\n\tmargin-top: 20px;\n\tdisplay: flex;\n\talign-items: center;\n\tgap: 10px;\n}\n\n.rewarded-suggestion .icon-container {\n\twidth: 50px;\n\theight: 50px;\n\tfont-size: 12pt;\n\tdisplay: flex;\n\tflex-direction: column;\n\t-webkit-text-stroke: 0px transparent;\n}\n\n.rewarded-suggestion .icon-container img {\n\twidth: 50px;\n\theight: 30px;\n}\n\n.rewarded-suggestion .building-image-container {\n\twidth: 100px;\n\theight: 50px;\n}\n");

const r = new CSSStyleSheet;

r.replaceSync('.corner-buttons-container {\n\tposition: absolute;\n\ttop: 0;\n\tright: 0;\n\tmargin: 20px;\n\tdisplay: flex;\n\tflex-direction: column;\n\talign-items: flex-end;\n\tgap: 10px;\n\tpointer-events: none;\n}\n\n.corner-buttons-container .top-row {\n\tdisplay: flex;\n\tgap: 10px;\n}\n\n@media (max-width: 550px), (max-height: 550px) {\n\t.corner-buttons-container {\n\t\ttransform: scale(0.7);\n\t\ttransform-origin: top right;\n\t}\n}\n\n.corner-buttons-container button {\n\tpadding: 3px;\n\tpadding-bottom: 8px;\n\tpointer-events: auto;\n}\n\n.corner-buttons-container button .icon {\n\tdisplay: block;\n\twidth: 30px;\n\theight: 30px;\n}\n\n.corner-buttons-container button::before {\n\tcontent: var(--keyboard-indication);\n\tposition: absolute;\n\tfont-size: 12pt;\n\tz-index: 10;\n\tbackground: var(--button-color);\n\tborder: 0.5px solid #000980;\n\tleft: 0;\n\tbottom: 0;\n\ttransform: translate(-50%, 50%);\n\tpadding: 1px 3px;\n\tborder-radius: var(--default-border-radius);\n}\n\n.button-group > button.blue,\n.dpad-button-group > button.blue {\n\tbox-shadow: var(--highlight-shadow),\n\t\tvar(--bottom-shadow);\n}\n\n.button-group {\n\tborder-radius: var(--default-border-radius);\n\tbox-shadow: white 0px 0px 0px 2px;\n}\n.button-group > button,\n.dpad-button-group > button {\n\toutline: none;\n\tmargin: 0;\n}\n\n.button-group > button:not(:first-child) {\n\tborder-bottom-left-radius: 0;\n\tborder-top-left-radius: 0;\n\tborder-left: none;\n}\n.button-group > button:not(:last-child) {\n\tborder-bottom-right-radius: 0;\n\tborder-top-right-radius: 0;\n}\n\n.dpad-button-group {\n\tdisplay: grid;\n\tgrid-template-columns: repeat(3, 1fr);\n\tgrid-template-rows: 37px 38px 4px 37px;\n\tfilter: drop-shadow(2px 0px 0px white) drop-shadow(0px 2px 0px white) drop-shadow(-2px 0px 0px white) drop-shadow(0px -2px 0px white);\n\tgrid-template-areas:\n\t\t". up ."\n\t\t"left center right"\n\t\t"left down right"\n\t\t". down .";\n}\n\n.dpad-button-group > button.blue.left {\n\tgrid-area: left;\n\tborder-radius: var(--default-border-radius) 0 0 var(--default-border-radius);\n\tborder-right: none;\n}\n\n.dpad-button-group > button.blue.right {\n\tgrid-area: right;\n\tborder-radius: 0 var(--default-border-radius) var(--default-border-radius) 0;\n\tborder-left: none;\n}\n\n.dpad-button-group > button.blue.up {\n\tgrid-area: up;\n\tborder-radius: var(--default-border-radius) var(--default-border-radius) 0 0;\n\tborder-bottom: none;\n\tbox-shadow: var(--highlight-shadow);\n}\n\n.dpad-button-group > button.blue.down {\n\tgrid-area: down;\n\tborder-radius: 0 0 var(--default-border-radius) var(--default-border-radius);\n\tborder-top: none;\n}\n\n.dpad-button-group > button.blue.center {\n\tgrid-area: center;\n\tborder-radius: 0;\n\tbox-shadow: var(--highlight-shadow);\n}\n');

const s = new CSSStyleSheet;

s.replaceSync(".ui-particles {\n\twidth: 100%;\n\theight: 100%;\n\tposition: absolute;\n\tleft: 0;\n\ttop: 0;\n\tpointer-events: none;\n\tz-index: 100;\n}\n");

const a = new CSSStyleSheet;

a.replaceSync('.building-shop-container {\n\tposition: absolute;\n\tbottom: 0;\n\tleft: 50%;\n\ttransform: translateX(-50%);\n\tdisplay: flex;\n\tmargin: 0;\n\tmargin-bottom: 10px;\n\tgap: 5px;\n}\n\n@media (max-width: 550px), (max-height: 550px) {\n\t.building-shop-container {\n\t\ttransform: translateX(-50%) scale(0.7);\n\t\ttransform-origin: bottom center;\n\t}\n}\n\n.dock-shop-slot {\n\twidth: 80px;\n\theight: 90px;\n}\n\n.dock-collect-slot {\n\talign-self: flex-end;\n\tpadding-right: 10px;\n}\n\n.dock-shop-slot button {\n\twidth: 100%;\n\theight: 100%;\n\tpadding: 3px;\n\tpadding-bottom: 10px;\n}\n\n.building-shop-container .backdrop-gradient {\n\tz-index: -10;\n\tbackground: radial-gradient(closest-side, rgba(0, 0, 0, 0.728), rgba(0,0,0,0));\n\tbottom: -50px;\n\tleft: 50%;\n\ttransform: translate(-50%, 50%);\n\twidth: 700px;\n\theight: 400px;\n\tposition: absolute;\n\tpointer-events: none;\n}\n\n.shop-button-content {\n\tdisplay: flex;\n\tflex-direction: column;\n}\n\n.shop-button-content .building-image-container {\n\twidth: 70px;\n\theight: 50px;\n}\n\n.dock-open-shop-slot button:hover {\n\t--hovering: 1;\n}\n\n.dock-building-slot.red {\n\t--dock-color: #D64520;\n\t--dock-color-dark: #B82F0D;\n\t--dock-color-highlight: #fe643d;\n\t--border-color: #781c05;\n}\n\n.dock-building-slot.green {\n\t--dock-color: #21AD42;\n\t--dock-color-dark: #0D912C;\n\t--dock-color-highlight: #3ac65b;\n\t--border-color: #035115;\n}\n\n.dock-building-slot.blue {\n\t--dock-color: #3659F0;\n\t--dock-color-dark: #1C3FD9;\n\t--dock-color-highlight: #7089f5;\n\t--border-color: #0e2381;\n}\n\n.dock-building-slot.trophy {\n\t--dock-color: #ff7b22;\n\t--dock-color-dark: #ea6d1b;\n\t--dock-color-highlight: #ffa65d;\n\t--border-color: #c95e16;\n}\n\n.dock-building-slot {\n\tborder-radius: var(--default-border-radius);\n\tposition: relative;\n\tbackground-color: var(--dock-color);\n\tbox-shadow: 0px -3px var(--dock-color-dark) inset, 0px 1px var(--dock-color-highlight) inset;\n\tborder: 1px solid var(--border-color);\n}\n\n.dock-building-slot::before {\n\tcontent: "";\n\tposition: absolute;\n\tbackground: var(--dock-color-dark);\n\tborder-radius: 3px;\n\tleft: 5px;\n\tright: 5px;\n\ttop: 5px;\n\tbottom: 8px;\n}\n\n.dock-building-slot .building-image-container {\n\twidth: 70px;\n\theight: 50px;\n\tposition: absolute;\n\tleft: 50%;\n\tbottom: 15px;\n\ttransform: translateX(-50%);\n}\n\n.dock-building-slot.available {\n\tcursor: grab;\n}\n.dock-building-slot.available:hover {\n\t--hovering: 1;\n}\n');

const o = new CSSStyleSheet;

o.replaceSync(".building-image-container {\n\tposition: relative;\n}\n\n.building-base {\n\tposition: absolute;\n\tbottom: 0;\n\tleft: 50%;\n\twidth: 100%;\n\ttransform: translateX(-50%);\n}\n\n.building-image {\n\tpointer-events: none;\n\twidth: 100%;\n\taspect-ratio: 100  / 166;\n\tbackground-size: contain;\n\tbackground-repeat: no-repeat;\n\tposition: absolute;\n\tbottom: 0;\n\ttransition: transform 0.3s;\n\ttransform: translateY(calc(var(--hovering) * -7px));\n\tfilter: drop-shadow(0px 0.6px 0px var(--border-color)) drop-shadow(0px -0.6px 0px var(--border-color)) drop-shadow(0.6px 0px 0px var(--border-color)) drop-shadow(-0.6px 0px 0px var(--border-color));\n}\n\n.building-image.red {\n\t--border-color: #781c05;\n}\n\n.building-image.green {\n\t--border-color: #035115;\n}\n\n.building-image.blue {\n\t--border-color: #0e2381;\n}\n\n.building-image-container.grabbable.available {\n\tcursor: grab;\n\ttouch-action: none;\n}\n\n.building-image-container.available:hover .building-image,\n.rewarded-suggestion:hover .building-image {\n\t--hovering: 1;\n}\n\n.building-image-container.unavailable {\n\tfilter: brightness(50%);\n}\n\n.building-image-container.locked {\n\tfilter: brightness(0%);\n\topacity: 0.6;\n}\n");

const l = new CSSStyleSheet;

l.replaceSync(".shelfs {\n\tmax-width: 600px;\n\tdisplay: flex;\n\tflex-direction: column-reverse;\n\tmargin-bottom: 20px;\n}\n\n.shelf-container {\n\theight: 130px;\n\tposition: relative;\n}\n\n.shelf-container.red {\n\t--shelf-color: #D64520;\n\t--shelf-color-dark: #B82F0D;\n\t--shelf-color-highlight: #fe643d;\n}\n\n.shelf-container.green {\n\t--shelf-color: #21AD42;\n\t--shelf-color-dark: #0D912C;\n\t--shelf-color-highlight: #3ac65b;\n}\n\n.shelf-container.blue {\n\t--shelf-color: #3659F0;\n\t--shelf-color-dark: #1C3FD9;\n\t--shelf-color-highlight: #7089f5;\n}\n\n.shelf {\n\twidth: calc(100% - 20px);\n\tleft: 10px;\n\theight: 70px;\n\tposition: absolute;\n\tbottom: 0;\n\tpointer-events: none;\n\tborder-radius: var(--default-border-radius);\n\tbackground-color: var(--shelf-color);\n\tbox-shadow: 0px -3px var(--shelf-color-dark) inset, 0px 1px var(--shelf-color-highlight) inset;\n\tborder: 1px solid var(--border-color);\n}\n\n.shelf::before {\n\tcontent: \"\";\n\tposition: absolute;\n\tbackground: var(--shelf-color-dark);\n\tborder-radius: 3px;\n\tinset: 5px 5px 8px;\n}\n\n@property --left-fade-mask {\n\tsyntax: '<color>';\n\tinherits: false;\n\tinitial-value: transparent;\n}\n@property --right-fade-mask {\n\tsyntax: '<color>';\n\tinherits: false;\n\tinitial-value: transparent;\n}\n\n@property --scrollbar-color {\n\tsyntax: \"<color>\";\n\tinherits: true;\n\tinitial-value: transparent;\n}\n\n.buildings-container {\n\tdisplay: flex;\n\toverflow-y: hidden;\n\toverflow-x: scroll;\n\tscrollbar-color: rgba(0,0,0,0.4) transparent;\n\tscrollbar-width: thin;\n\tpadding: 0px 20px;\n\tposition: relative;\n\ttop: 5px;\n\t--left-fade-mask: black;\n\t--right-fade-mask: black;\n\ttransition: --left-fade-mask 0.5s, --right-fade-mask 0.5s, --scrollbar-color 0.5s;\n\t--mask: linear-gradient(to right, var(--left-fade-mask) 0%, black 10%, black 90%, var(--right-fade-mask) 100%),\n\t\tlinear-gradient(to top, black 3%, transparent 7%);\n\t-webkit-mask-image: var(--mask);\n\tmask-image: var(--mask);\n}\n\n.buildings-container:hover {\n\t--scrollbar-color: rgba(0, 0, 0, 0.2);\n}\n\n.buildings-container::-webkit-scrollbar {\n\theight: 17px;\n\tbackground: transparent;\n}\n\n.buildings-container::-webkit-scrollbar-track {\n\tbackground-color: transparent;\n}\n\n.buildings-container::-webkit-scrollbar-thumb {\n\tbackground-color: var(--scrollbar-color);\n\tborder-radius: 20px;\n\tborder: 5px solid transparent;\n\tbackground-clip: padding-box;\n}\n\n.buildings-container::-webkit-scrollbar-thumb:hover {\n\tbackground-color: rgba(0, 0, 0, 0.4);\n}\n\n.buildings-container.fade-left {\n\t--left-fade-mask: transparent;\n}\n.buildings-container.fade-right {\n\t--right-fade-mask: transparent;\n}\n\n.building-slot {\n\tmin-width: 80px;\n\theight: 130px;\n\tposition: relative;\n}\n\n.building-slot .building-image-container {\n\tposition: relative;\n\twidth: 80px;\n\theight: 130px;\n\tbottom: 15px;\n}\n\n.building-slot .free-purchase,\n.building-slot .price {\n\tposition: absolute;\n\tbottom: 0;\n\tleft: 50%;\n\ttransform: translateX(-50%);\n\tfont-size: 16pt;\n\ttext-align: center;\n}\n\n.building-slot .price {\n\tcolor: var(--price-color);\n\ttext-shadow: 0px 2px var(--price-shadow-color);\n\t-webkit-text-stroke: 1px var(--price-shadow-color);\n}\n\n.building-slot .free-purchase {\n\tbackground-color: rgb(26, 137, 233);\n\tborder: 1px solid rgb(1, 85, 229);\n\tborder-radius: var(--default-border-radius);\n\tcolor: white;\n\tpadding: 0px 3px;\n}\n\n.building-slot.locked .price,\n.building-slot.has-free-purchase .price {\n\tdisplay: none;\n}\n\n.building-slot.reward-purchaseable {\n\tcursor: pointer;\n}\n.building-slot.reward-purchaseable:hover {\n\tfilter: brightness(130%);\n}\n");

const h = new CSSStyleSheet;

h.replaceSync(".animated-hand {\n\tposition: absolute;\n\twidth: 100px;\n\theight: 100px;\n\tleft: 0;\n\ttop: 0;\n\tpointer-events: none;\n}\n\n.hand-image {\n\twidth: 100%;\n\theight: 100%;\n\ttop: 0;\n\tleft: 0;\n\tposition: absolute;\n}\n");

const c = new CSSStyleSheet;

c.replaceSync('dialog {\n\tbackground-color: var(--yellow);\n\tborder-radius: var(--default-border-radius);\n\tborder: 2px solid #804000;\n\tbox-shadow: 0px 5px 0px var(--yellow-highlight) inset,\n\t\t0px -10px 0px var(--yellow-shadow) inset;\n\tpadding: 0;\n\tbox-sizing: border-box;\n}\n\ndialog::backdrop {\n\tbackground-color: rgba(0, 0, 0, 0.6);\n}\n\ndialog h1 {\n\tmargin: 0;\n\tpadding-top: 10px;\n\tpadding-bottom: 5px;\n\ttext-align: center;\n\tcolor: #750000;\n\ttext-shadow: 0px 1px #ffe78c;\n\tposition: relative;\n}\n\ndialog h1::before {\n\tcontent: "";\n\twidth: 100%;\n\theight: 1px;\n\tbackground: linear-gradient(90deg, transparent, #00000030, transparent);\n\tdisplay: inline-block;\n\tposition: absolute;\n\tbottom: 0;\n\tleft: 0;\n}\n\ndialog h1::after {\n\tcontent: "";\n\tbottom: 0;\n\twidth: 100%;\n\theight: 40px;\n\tbackground: radial-gradient(ellipse 50% 50% at top, #00000017, transparent);\n\tdisplay: block;\n\tposition: absolute;\n\tbottom: 0;\n\ttransform: translateY(100%);\n\tpointer-events: none;\n}\n\n@media (max-width: 550px)  {\n\tdialog.mobile-bottom-sheet {\n\t\tmargin-bottom: 0;\n\t\tmax-width: 100vw;\n\t\tbox-shadow: 0px 5px 0px var(--yellow-highlight) inset;\n\t\tborder-bottom: 0;\n\t\tborder-left: 0;\n\t\tborder-right: 0;\n\t\tborder-radius: var(--default-border-radius) var(--default-border-radius) 0 0;\n\t}\n}\n\ndialog .buttons-container {\n\tdisplay: flex;\n\tgap: 10px;\n\tjustify-content: center;\n\tmargin-bottom: 20px;\n}\n');

const d = new CSSStyleSheet;

d.replaceSync(".collect-coins-dialog {\n\tmax-width: 80%;\n\twidth: 340px;\n}\n\n.collect-coins-dialog .coins-preview-container {\n\tmargin-bottom: 20px;\n}\n");

const u = new CSSStyleSheet;

u.replaceSync(".building-unlocked-dialog {\n\tmax-width: 80%;\n\twidth: 340px;\n}\n\n.building-unlocked-dialog .building-image-container {\n\twidth: 100px;\n\theight: 166px;\n\tmargin: auto;\n\tmargin-bottom: 20px;\n}\n");

const p = new CSSStyleSheet;

p.replaceSync(".coins-preview-container {\n\tdisplay: flex;\n\tflex-direction: column;\n\talign-items: center;\n}\n\n.coins-preview-container .coins-img {\n\twidth: 210px;\n\theight: 150px;\n\tpointer-events: none;\n\tuser-select: none;\n}\n.coins-preview-container.small .coins-img {\n\twidth: 70px;\n\theight: 50px;\n}\n\n.coins-preview-container:not(.small) .bill {\n\tcolor: #ffeb00;\n\tfont-size: 16pt;\n    -webkit-text-stroke: 1px var(--not-black);\n\tbackground-color: #00af00;\n\tborder: 1px solid #008d00;\n\tborder-radius: 2px;\n\twidth: 80px;\n\theight: 30px;\n\tdisplay: flex;\n\tjustify-content: center;\n\talign-items: center;\n}\n"), 
document.adoptedStyleSheets = [ t, e, i, n, r, s, o, a, l, h, c, d, u, p ];

class g {
    addEventListener(t, e) {
        void 0 === this._listeners && (this._listeners = {});
        const i = this._listeners;
        void 0 === i[t] && (i[t] = []), -1 === i[t].indexOf(e) && i[t].push(e);
    }
    hasEventListener(t, e) {
        if (void 0 === this._listeners) return !1;
        const i = this._listeners;
        return void 0 !== i[t] && -1 !== i[t].indexOf(e);
    }
    removeEventListener(t, e) {
        if (void 0 === this._listeners) return;
        const i = this._listeners[t];
        if (void 0 !== i) {
            const t = i.indexOf(e);
            -1 !== t && i.splice(t, 1);
        }
    }
    dispatchEvent(t) {
        if (void 0 === this._listeners) return;
        const e = this._listeners[t.type];
        if (void 0 !== e) {
            t.target = this;
            const i = e.slice(0);
            for (let e = 0, n = i.length; e < n; e++) i[e].call(this, t);
            t.target = null;
        }
    }
}

const f = [ "00", "01", "02", "03", "04", "05", "06", "07", "08", "09", "0a", "0b", "0c", "0d", "0e", "0f", "10", "11", "12", "13", "14", "15", "16", "17", "18", "19", "1a", "1b", "1c", "1d", "1e", "1f", "20", "21", "22", "23", "24", "25", "26", "27", "28", "29", "2a", "2b", "2c", "2d", "2e", "2f", "30", "31", "32", "33", "34", "35", "36", "37", "38", "39", "3a", "3b", "3c", "3d", "3e", "3f", "40", "41", "42", "43", "44", "45", "46", "47", "48", "49", "4a", "4b", "4c", "4d", "4e", "4f", "50", "51", "52", "53", "54", "55", "56", "57", "58", "59", "5a", "5b", "5c", "5d", "5e", "5f", "60", "61", "62", "63", "64", "65", "66", "67", "68", "69", "6a", "6b", "6c", "6d", "6e", "6f", "70", "71", "72", "73", "74", "75", "76", "77", "78", "79", "7a", "7b", "7c", "7d", "7e", "7f", "80", "81", "82", "83", "84", "85", "86", "87", "88", "89", "8a", "8b", "8c", "8d", "8e", "8f", "90", "91", "92", "93", "94", "95", "96", "97", "98", "99", "9a", "9b", "9c", "9d", "9e", "9f", "a0", "a1", "a2", "a3", "a4", "a5", "a6", "a7", "a8", "a9", "aa", "ab", "ac", "ad", "ae", "af", "b0", "b1", "b2", "b3", "b4", "b5", "b6", "b7", "b8", "b9", "ba", "bb", "bc", "bd", "be", "bf", "c0", "c1", "c2", "c3", "c4", "c5", "c6", "c7", "c8", "c9", "ca", "cb", "cc", "cd", "ce", "cf", "d0", "d1", "d2", "d3", "d4", "d5", "d6", "d7", "d8", "d9", "da", "db", "dc", "dd", "de", "df", "e0", "e1", "e2", "e3", "e4", "e5", "e6", "e7", "e8", "e9", "ea", "eb", "ec", "ed", "ee", "ef", "f0", "f1", "f2", "f3", "f4", "f5", "f6", "f7", "f8", "f9", "fa", "fb", "fc", "fd", "fe", "ff" ];

let m = 1234567;

const v = Math.PI / 180, _ = 180 / Math.PI;

function x() {
    const t = 4294967295 * Math.random() | 0, e = 4294967295 * Math.random() | 0, i = 4294967295 * Math.random() | 0, n = 4294967295 * Math.random() | 0;
    return (f[255 & t] + f[t >> 8 & 255] + f[t >> 16 & 255] + f[t >> 24 & 255] + "-" + f[255 & e] + f[e >> 8 & 255] + "-" + f[e >> 16 & 15 | 64] + f[e >> 24 & 255] + "-" + f[63 & i | 128] + f[i >> 8 & 255] + "-" + f[i >> 16 & 255] + f[i >> 24 & 255] + f[255 & n] + f[n >> 8 & 255] + f[n >> 16 & 255] + f[n >> 24 & 255]).toLowerCase();
}

function y(t, e, i) {
    return Math.max(e, Math.min(i, t));
}

function b(t, e) {
    return (t % e + e) % e;
}

function S(t, e, i) {
    return (1 - i) * t + i * e;
}

function w(t) {
    return 0 == (t & t - 1) && 0 !== t;
}

function M(t) {
    return Math.pow(2, Math.ceil(Math.log(t) / Math.LN2));
}

function T(t) {
    return Math.pow(2, Math.floor(Math.log(t) / Math.LN2));
}

function E(t, e) {
    switch (e.constructor) {
      case Float32Array:
        return t;

      case Uint16Array:
        return t / 65535;

      case Uint8Array:
        return t / 255;

      case Int16Array:
        return Math.max(t / 32767, -1);

      case Int8Array:
        return Math.max(t / 127, -1);

      default:
        throw new Error("Invalid component type.");
    }
}

function A(t, e) {
    switch (e.constructor) {
      case Float32Array:
        return t;

      case Uint16Array:
        return Math.round(65535 * t);

      case Uint8Array:
        return Math.round(255 * t);

      case Int16Array:
        return Math.round(32767 * t);

      case Int8Array:
        return Math.round(127 * t);

      default:
        throw new Error("Invalid component type.");
    }
}

const C = {
    DEG2RAD: v,
    RAD2DEG: _,
    generateUUID: x,
    clamp: y,
    euclideanModulo: b,
    mapLinear: function(t, e, i, n, r) {
        return n + (t - e) * (r - n) / (i - e);
    },
    inverseLerp: function(t, e, i) {
        return t !== e ? (i - t) / (e - t) : 0;
    },
    lerp: S,
    damp: function(t, e, i, n) {
        return S(t, e, 1 - Math.exp(-i * n));
    },
    pingpong: function(t, e = 1) {
        return e - Math.abs(b(t, 2 * e) - e);
    },
    smoothstep: function(t, e, i) {
        return t <= e ? 0 : t >= i ? 1 : (t = (t - e) / (i - e)) * t * (3 - 2 * t);
    },
    smootherstep: function(t, e, i) {
        return t <= e ? 0 : t >= i ? 1 : (t = (t - e) / (i - e)) * t * t * (t * (6 * t - 15) + 10);
    },
    randInt: function(t, e) {
        return t + Math.floor(Math.random() * (e - t + 1));
    },
    randFloat: function(t, e) {
        return t + Math.random() * (e - t);
    },
    randFloatSpread: function(t) {
        return t * (.5 - Math.random());
    },
    seededRandom: function(t) {
        void 0 !== t && (m = t);
        let e = m += 1831565813;
        return e = Math.imul(e ^ e >>> 15, 1 | e), e ^= e + Math.imul(e ^ e >>> 7, 61 | e), 
        ((e ^ e >>> 14) >>> 0) / 4294967296;
    },
    degToRad: function(t) {
        return t * v;
    },
    radToDeg: function(t) {
        return t * _;
    },
    isPowerOfTwo: w,
    ceilPowerOfTwo: M,
    floorPowerOfTwo: T,
    setQuaternionFromProperEuler: function(t, e, i, n, r) {
        const s = Math.cos, a = Math.sin, o = s(i / 2), l = a(i / 2), h = s((e + n) / 2), c = a((e + n) / 2), d = s((e - n) / 2), u = a((e - n) / 2), p = s((n - e) / 2), g = a((n - e) / 2);
        switch (r) {
          case "XYX":
            t.set(o * c, l * d, l * u, o * h);
            break;

          case "YZY":
            t.set(l * u, o * c, l * d, o * h);
            break;

          case "ZXZ":
            t.set(l * d, l * u, o * c, o * h);
            break;

          case "XZX":
            t.set(o * c, l * g, l * p, o * h);
            break;

          case "YXY":
            t.set(l * p, o * c, l * g, o * h);
            break;

          case "ZYZ":
            t.set(l * g, l * p, o * c, o * h);
            break;

          default:
            console.warn("THREE.MathUtils: .setQuaternionFromProperEuler() encountered an unknown order: " + r);
        }
    },
    normalize: A,
    denormalize: E
};

class P {
    constructor(t = 0, e = 0) {
        P.prototype.isVector2 = !0, this.x = t, this.y = e;
    }
    get width() {
        return this.x;
    }
    set width(t) {
        this.x = t;
    }
    get height() {
        return this.y;
    }
    set height(t) {
        this.y = t;
    }
    set(t, e) {
        return this.x = t, this.y = e, this;
    }
    setScalar(t) {
        return this.x = t, this.y = t, this;
    }
    setX(t) {
        return this.x = t, this;
    }
    setY(t) {
        return this.y = t, this;
    }
    setComponent(t, e) {
        switch (t) {
          case 0:
            this.x = e;
            break;

          case 1:
            this.y = e;
            break;

          default:
            throw new Error("index is out of range: " + t);
        }
        return this;
    }
    getComponent(t) {
        switch (t) {
          case 0:
            return this.x;

          case 1:
            return this.y;

          default:
            throw new Error("index is out of range: " + t);
        }
    }
    clone() {
        return new this.constructor(this.x, this.y);
    }
    copy(t) {
        return this.x = t.x, this.y = t.y, this;
    }
    add(t) {
        return this.x += t.x, this.y += t.y, this;
    }
    addScalar(t) {
        return this.x += t, this.y += t, this;
    }
    addVectors(t, e) {
        return this.x = t.x + e.x, this.y = t.y + e.y, this;
    }
    addScaledVector(t, e) {
        return this.x += t.x * e, this.y += t.y * e, this;
    }
    sub(t) {
        return this.x -= t.x, this.y -= t.y, this;
    }
    subScalar(t) {
        return this.x -= t, this.y -= t, this;
    }
    subVectors(t, e) {
        return this.x = t.x - e.x, this.y = t.y - e.y, this;
    }
    multiply(t) {
        return this.x *= t.x, this.y *= t.y, this;
    }
    multiplyScalar(t) {
        return this.x *= t, this.y *= t, this;
    }
    divide(t) {
        return this.x /= t.x, this.y /= t.y, this;
    }
    divideScalar(t) {
        return this.multiplyScalar(1 / t);
    }
    applyMatrix3(t) {
        const e = this.x, i = this.y, n = t.elements;
        return this.x = n[0] * e + n[3] * i + n[6], this.y = n[1] * e + n[4] * i + n[7], 
        this;
    }
    min(t) {
        return this.x = Math.min(this.x, t.x), this.y = Math.min(this.y, t.y), this;
    }
    max(t) {
        return this.x = Math.max(this.x, t.x), this.y = Math.max(this.y, t.y), this;
    }
    clamp(t, e) {
        return this.x = Math.max(t.x, Math.min(e.x, this.x)), this.y = Math.max(t.y, Math.min(e.y, this.y)), 
        this;
    }
    clampScalar(t, e) {
        return this.x = Math.max(t, Math.min(e, this.x)), this.y = Math.max(t, Math.min(e, this.y)), 
        this;
    }
    clampLength(t, e) {
        const i = this.length();
        return this.divideScalar(i || 1).multiplyScalar(Math.max(t, Math.min(e, i)));
    }
    floor() {
        return this.x = Math.floor(this.x), this.y = Math.floor(this.y), this;
    }
    ceil() {
        return this.x = Math.ceil(this.x), this.y = Math.ceil(this.y), this;
    }
    round() {
        return this.x = Math.round(this.x), this.y = Math.round(this.y), this;
    }
    roundToZero() {
        return this.x = this.x < 0 ? Math.ceil(this.x) : Math.floor(this.x), this.y = this.y < 0 ? Math.ceil(this.y) : Math.floor(this.y), 
        this;
    }
    negate() {
        return this.x = -this.x, this.y = -this.y, this;
    }
    dot(t) {
        return this.x * t.x + this.y * t.y;
    }
    cross(t) {
        return this.x * t.y - this.y * t.x;
    }
    lengthSq() {
        return this.x * this.x + this.y * this.y;
    }
    length() {
        return Math.sqrt(this.x * this.x + this.y * this.y);
    }
    manhattanLength() {
        return Math.abs(this.x) + Math.abs(this.y);
    }
    normalize() {
        return this.divideScalar(this.length() || 1);
    }
    angle() {
        return Math.atan2(-this.y, -this.x) + Math.PI;
    }
    angleTo(t) {
        const e = Math.sqrt(this.lengthSq() * t.lengthSq());
        if (0 === e) return Math.PI / 2;
        const i = this.dot(t) / e;
        return Math.acos(y(i, -1, 1));
    }
    distanceTo(t) {
        return Math.sqrt(this.distanceToSquared(t));
    }
    distanceToSquared(t) {
        const e = this.x - t.x, i = this.y - t.y;
        return e * e + i * i;
    }
    manhattanDistanceTo(t) {
        return Math.abs(this.x - t.x) + Math.abs(this.y - t.y);
    }
    setLength(t) {
        return this.normalize().multiplyScalar(t);
    }
    lerp(t, e) {
        return this.x += (t.x - this.x) * e, this.y += (t.y - this.y) * e, this;
    }
    lerpVectors(t, e, i) {
        return this.x = t.x + (e.x - t.x) * i, this.y = t.y + (e.y - t.y) * i, this;
    }
    equals(t) {
        return t.x === this.x && t.y === this.y;
    }
    fromArray(t, e = 0) {
        return this.x = t[e], this.y = t[e + 1], this;
    }
    toArray(t = [], e = 0) {
        return t[e] = this.x, t[e + 1] = this.y, t;
    }
    fromBufferAttribute(t, e) {
        return this.x = t.getX(e), this.y = t.getY(e), this;
    }
    rotateAround(t, e) {
        const i = Math.cos(e), n = Math.sin(e), r = this.x - t.x, s = this.y - t.y;
        return this.x = r * i - s * n + t.x, this.y = r * n + s * i + t.y, this;
    }
    random() {
        return this.x = Math.random(), this.y = Math.random(), this;
    }
    * [Symbol.iterator]() {
        yield this.x, yield this.y;
    }
}

class R {
    constructor() {
        R.prototype.isMatrix3 = !0, this.elements = [ 1, 0, 0, 0, 1, 0, 0, 0, 1 ];
    }
    set(t, e, i, n, r, s, a, o, l) {
        const h = this.elements;
        return h[0] = t, h[1] = n, h[2] = a, h[3] = e, h[4] = r, h[5] = o, h[6] = i, h[7] = s, 
        h[8] = l, this;
    }
    identity() {
        return this.set(1, 0, 0, 0, 1, 0, 0, 0, 1), this;
    }
    copy(t) {
        const e = this.elements, i = t.elements;
        return e[0] = i[0], e[1] = i[1], e[2] = i[2], e[3] = i[3], e[4] = i[4], e[5] = i[5], 
        e[6] = i[6], e[7] = i[7], e[8] = i[8], this;
    }
    extractBasis(t, e, i) {
        return t.setFromMatrix3Column(this, 0), e.setFromMatrix3Column(this, 1), i.setFromMatrix3Column(this, 2), 
        this;
    }
    setFromMatrix4(t) {
        const e = t.elements;
        return this.set(e[0], e[4], e[8], e[1], e[5], e[9], e[2], e[6], e[10]), this;
    }
    multiply(t) {
        return this.multiplyMatrices(this, t);
    }
    premultiply(t) {
        return this.multiplyMatrices(t, this);
    }
    multiplyMatrices(t, e) {
        const i = t.elements, n = e.elements, r = this.elements, s = i[0], a = i[3], o = i[6], l = i[1], h = i[4], c = i[7], d = i[2], u = i[5], p = i[8], g = n[0], f = n[3], m = n[6], v = n[1], _ = n[4], x = n[7], y = n[2], b = n[5], S = n[8];
        return r[0] = s * g + a * v + o * y, r[3] = s * f + a * _ + o * b, r[6] = s * m + a * x + o * S, 
        r[1] = l * g + h * v + c * y, r[4] = l * f + h * _ + c * b, r[7] = l * m + h * x + c * S, 
        r[2] = d * g + u * v + p * y, r[5] = d * f + u * _ + p * b, r[8] = d * m + u * x + p * S, 
        this;
    }
    multiplyScalar(t) {
        const e = this.elements;
        return e[0] *= t, e[3] *= t, e[6] *= t, e[1] *= t, e[4] *= t, e[7] *= t, e[2] *= t, 
        e[5] *= t, e[8] *= t, this;
    }
    determinant() {
        const t = this.elements, e = t[0], i = t[1], n = t[2], r = t[3], s = t[4], a = t[5], o = t[6], l = t[7], h = t[8];
        return e * s * h - e * a * l - i * r * h + i * a * o + n * r * l - n * s * o;
    }
    invert() {
        const t = this.elements, e = t[0], i = t[1], n = t[2], r = t[3], s = t[4], a = t[5], o = t[6], l = t[7], h = t[8], c = h * s - a * l, d = a * o - h * r, u = l * r - s * o, p = e * c + i * d + n * u;
        if (0 === p) return this.set(0, 0, 0, 0, 0, 0, 0, 0, 0);
        const g = 1 / p;
        return t[0] = c * g, t[1] = (n * l - h * i) * g, t[2] = (a * i - n * s) * g, t[3] = d * g, 
        t[4] = (h * e - n * o) * g, t[5] = (n * r - a * e) * g, t[6] = u * g, t[7] = (i * o - l * e) * g, 
        t[8] = (s * e - i * r) * g, this;
    }
    transpose() {
        let t;
        const e = this.elements;
        return t = e[1], e[1] = e[3], e[3] = t, t = e[2], e[2] = e[6], e[6] = t, t = e[5], 
        e[5] = e[7], e[7] = t, this;
    }
    getNormalMatrix(t) {
        return this.setFromMatrix4(t).invert().transpose();
    }
    transposeIntoArray(t) {
        const e = this.elements;
        return t[0] = e[0], t[1] = e[3], t[2] = e[6], t[3] = e[1], t[4] = e[4], t[5] = e[7], 
        t[6] = e[2], t[7] = e[5], t[8] = e[8], this;
    }
    setUvTransform(t, e, i, n, r, s, a) {
        const o = Math.cos(r), l = Math.sin(r);
        return this.set(i * o, i * l, -i * (o * s + l * a) + s + t, -n * l, n * o, -n * (-l * s + o * a) + a + e, 0, 0, 1), 
        this;
    }
    scale(t, e) {
        return this.premultiply(L.makeScale(t, e)), this;
    }
    rotate(t) {
        return this.premultiply(L.makeRotation(-t)), this;
    }
    translate(t, e) {
        return this.premultiply(L.makeTranslation(t, e)), this;
    }
    makeTranslation(t, e) {
        return this.set(1, 0, t, 0, 1, e, 0, 0, 1), this;
    }
    makeRotation(t) {
        const e = Math.cos(t), i = Math.sin(t);
        return this.set(e, -i, 0, i, e, 0, 0, 0, 1), this;
    }
    makeScale(t, e) {
        return this.set(t, 0, 0, 0, e, 0, 0, 0, 1), this;
    }
    equals(t) {
        const e = this.elements, i = t.elements;
        for (let t = 0; t < 9; t++) if (e[t] !== i[t]) return !1;
        return !0;
    }
    fromArray(t, e = 0) {
        for (let i = 0; i < 9; i++) this.elements[i] = t[i + e];
        return this;
    }
    toArray(t = [], e = 0) {
        const i = this.elements;
        return t[e] = i[0], t[e + 1] = i[1], t[e + 2] = i[2], t[e + 3] = i[3], t[e + 4] = i[4], 
        t[e + 5] = i[5], t[e + 6] = i[6], t[e + 7] = i[7], t[e + 8] = i[8], t;
    }
    clone() {
        return (new this.constructor).fromArray(this.elements);
    }
}

const L = new R;

function D(t) {
    for (let e = t.length - 1; e >= 0; --e) if (t[e] >= 65535) return !0;
    return !1;
}

function I(t) {
    return document.createElementNS("http://www.w3.org/1999/xhtml", t);
}

const U = {};

function N(t) {
    t in U || (U[t] = !0, console.warn(t));
}

function B(t) {
    return t < .04045 ? .0773993808 * t : Math.pow(.9478672986 * t + .0521327014, 2.4);
}

function O(t) {
    return t < .0031308 ? 12.92 * t : 1.055 * Math.pow(t, .41666) - .055;
}

const F = (new R).fromArray([ .8224621, .0331941, .0170827, .177538, .9668058, .0723974, -1e-7, 1e-7, .9105199 ]), k = (new R).fromArray([ 1.2249401, -.0420569, -.0196376, -.2249404, 1.0420571, -.0786361, 1e-7, 0, 1.0982735 ]);

const H = {
    "srgb-linear": t => t,
    srgb: t => t.convertSRGBToLinear(),
    "display-p3": function(t) {
        return t.convertSRGBToLinear().applyMatrix3(k);
    }
}, z = {
    "srgb-linear": t => t,
    srgb: t => t.convertLinearToSRGB(),
    "display-p3": function(t) {
        return t.applyMatrix3(F).convertLinearToSRGB();
    }
}, G = {
    enabled: !0,
    get legacyMode() {
        return console.warn("THREE.ColorManagement: .legacyMode=false renamed to .enabled=true in r150."), 
        !this.enabled;
    },
    set legacyMode(t) {
        console.warn("THREE.ColorManagement: .legacyMode=false renamed to .enabled=true in r150."), 
        this.enabled = !t;
    },
    get workingColorSpace() {
        return "srgb-linear";
    },
    set workingColorSpace(t) {
        console.warn("THREE.ColorManagement: .workingColorSpace is readonly.");
    },
    convert: function(t, e, i) {
        if (!1 === this.enabled || e === i || !e || !i) return t;
        const n = H[e], r = z[i];
        if (void 0 === n || void 0 === r) throw new Error(`Unsupported color space conversion, "${e}" to "${i}".`);
        return r(n(t));
    },
    fromWorkingColorSpace: function(t, e) {
        return this.convert(t, this.workingColorSpace, e);
    },
    toWorkingColorSpace: function(t, e) {
        return this.convert(t, e, this.workingColorSpace);
    }
};

let V;

class W {
    static getDataURL(t) {
        if (/^data:/i.test(t.src)) return t.src;
        if ("undefined" == typeof HTMLCanvasElement) return t.src;
        let e;
        if (t instanceof HTMLCanvasElement) e = t; else {
            void 0 === V && (V = I("canvas")), V.width = t.width, V.height = t.height;
            const i = V.getContext("2d");
            t instanceof ImageData ? i.putImageData(t, 0, 0) : i.drawImage(t, 0, 0, t.width, t.height), 
            e = V;
        }
        return e.width > 2048 || e.height > 2048 ? (console.warn("THREE.ImageUtils.getDataURL: Image converted to jpg for performance reasons", t), 
        e.toDataURL("image/jpeg", .6)) : e.toDataURL("image/png");
    }
    static sRGBToLinear(t) {
        if ("undefined" != typeof HTMLImageElement && t instanceof HTMLImageElement || "undefined" != typeof HTMLCanvasElement && t instanceof HTMLCanvasElement || "undefined" != typeof ImageBitmap && t instanceof ImageBitmap) {
            const e = I("canvas");
            e.width = t.width, e.height = t.height;
            const i = e.getContext("2d");
            i.drawImage(t, 0, 0, t.width, t.height);
            const n = i.getImageData(0, 0, t.width, t.height), r = n.data;
            for (let t = 0; t < r.length; t++) r[t] = 255 * B(r[t] / 255);
            return i.putImageData(n, 0, 0), e;
        }
        if (t.data) {
            const e = t.data.slice(0);
            for (let t = 0; t < e.length; t++) e instanceof Uint8Array || e instanceof Uint8ClampedArray ? e[t] = Math.floor(255 * B(e[t] / 255)) : e[t] = B(e[t]);
            return {
                data: e,
                width: t.width,
                height: t.height
            };
        }
        return console.warn("THREE.ImageUtils.sRGBToLinear(): Unsupported image type. No color space conversion applied."), 
        t;
    }
}

class j {
    constructor(t = null) {
        this.isSource = !0, this.uuid = x(), this.data = t, this.version = 0;
    }
    set needsUpdate(t) {
        !0 === t && this.version++;
    }
    toJSON(t) {
        const e = void 0 === t || "string" == typeof t;
        if (!e && void 0 !== t.images[this.uuid]) return t.images[this.uuid];
        const i = {
            uuid: this.uuid,
            url: ""
        }, n = this.data;
        if (null !== n) {
            let t;
            if (Array.isArray(n)) {
                t = [];
                for (let e = 0, i = n.length; e < i; e++) n[e].isDataTexture ? t.push(X(n[e].image)) : t.push(X(n[e]));
            } else t = X(n);
            i.url = t;
        }
        return e || (t.images[this.uuid] = i), i;
    }
}

function X(t) {
    return "undefined" != typeof HTMLImageElement && t instanceof HTMLImageElement || "undefined" != typeof HTMLCanvasElement && t instanceof HTMLCanvasElement || "undefined" != typeof ImageBitmap && t instanceof ImageBitmap ? W.getDataURL(t) : t.data ? {
        data: Array.from(t.data),
        width: t.width,
        height: t.height,
        type: t.data.constructor.name
    } : (console.warn("THREE.Texture: Unable to serialize Texture."), {});
}

let q = 0;

class K extends g {
    constructor(t = K.DEFAULT_IMAGE, e = K.DEFAULT_MAPPING, i = 1001, n = 1001, r = 1006, s = 1008, a = 1023, o = 1009, l = K.DEFAULT_ANISOTROPY, h = "") {
        super(), this.isTexture = !0, Object.defineProperty(this, "id", {
            value: q++
        }), this.uuid = x(), this.name = "", this.source = new j(t), this.mipmaps = [], 
        this.mapping = e, this.channel = 0, this.wrapS = i, this.wrapT = n, this.magFilter = r, 
        this.minFilter = s, this.anisotropy = l, this.format = a, this.internalFormat = null, 
        this.type = o, this.offset = new P(0, 0), this.repeat = new P(1, 1), this.center = new P(0, 0), 
        this.rotation = 0, this.matrixAutoUpdate = !0, this.matrix = new R, this.generateMipmaps = !0, 
        this.premultiplyAlpha = !1, this.flipY = !0, this.unpackAlignment = 4, "string" == typeof h ? this.colorSpace = h : (N("THREE.Texture: Property .encoding has been replaced by .colorSpace."), 
        this.colorSpace = 3001 === h ? "srgb" : ""), this.userData = {}, this.version = 0, 
        this.onUpdate = null, this.isRenderTargetTexture = !1, this.needsPMREMUpdate = !1;
    }
    get image() {
        return this.source.data;
    }
    set image(t = null) {
        this.source.data = t;
    }
    updateMatrix() {
        this.matrix.setUvTransform(this.offset.x, this.offset.y, this.repeat.x, this.repeat.y, this.rotation, this.center.x, this.center.y);
    }
    clone() {
        return (new this.constructor).copy(this);
    }
    copy(t) {
        return this.name = t.name, this.source = t.source, this.mipmaps = t.mipmaps.slice(0), 
        this.mapping = t.mapping, this.channel = t.channel, this.wrapS = t.wrapS, this.wrapT = t.wrapT, 
        this.magFilter = t.magFilter, this.minFilter = t.minFilter, this.anisotropy = t.anisotropy, 
        this.format = t.format, this.internalFormat = t.internalFormat, this.type = t.type, 
        this.offset.copy(t.offset), this.repeat.copy(t.repeat), this.center.copy(t.center), 
        this.rotation = t.rotation, this.matrixAutoUpdate = t.matrixAutoUpdate, this.matrix.copy(t.matrix), 
        this.generateMipmaps = t.generateMipmaps, this.premultiplyAlpha = t.premultiplyAlpha, 
        this.flipY = t.flipY, this.unpackAlignment = t.unpackAlignment, this.colorSpace = t.colorSpace, 
        this.userData = JSON.parse(JSON.stringify(t.userData)), this.needsUpdate = !0, this;
    }
    toJSON(t) {
        const e = void 0 === t || "string" == typeof t;
        if (!e && void 0 !== t.textures[this.uuid]) return t.textures[this.uuid];
        const i = {
            metadata: {
                version: 4.5,
                type: "Texture",
                generator: "Texture.toJSON"
            },
            uuid: this.uuid,
            name: this.name,
            image: this.source.toJSON(t).uuid,
            mapping: this.mapping,
            channel: this.channel,
            repeat: [ this.repeat.x, this.repeat.y ],
            offset: [ this.offset.x, this.offset.y ],
            center: [ this.center.x, this.center.y ],
            rotation: this.rotation,
            wrap: [ this.wrapS, this.wrapT ],
            format: this.format,
            internalFormat: this.internalFormat,
            type: this.type,
            colorSpace: this.colorSpace,
            minFilter: this.minFilter,
            magFilter: this.magFilter,
            anisotropy: this.anisotropy,
            flipY: this.flipY,
            generateMipmaps: this.generateMipmaps,
            premultiplyAlpha: this.premultiplyAlpha,
            unpackAlignment: this.unpackAlignment
        };
        return Object.keys(this.userData).length > 0 && (i.userData = this.userData), e || (t.textures[this.uuid] = i), 
        i;
    }
    dispose() {
        this.dispatchEvent({
            type: "dispose"
        });
    }
    transformUv(t) {
        if (300 !== this.mapping) return t;
        if (t.applyMatrix3(this.matrix), t.x < 0 || t.x > 1) switch (this.wrapS) {
          case 1e3:
            t.x = t.x - Math.floor(t.x);
            break;

          case 1001:
            t.x = t.x < 0 ? 0 : 1;
            break;

          case 1002:
            1 === Math.abs(Math.floor(t.x) % 2) ? t.x = Math.ceil(t.x) - t.x : t.x = t.x - Math.floor(t.x);
        }
        if (t.y < 0 || t.y > 1) switch (this.wrapT) {
          case 1e3:
            t.y = t.y - Math.floor(t.y);
            break;

          case 1001:
            t.y = t.y < 0 ? 0 : 1;
            break;

          case 1002:
            1 === Math.abs(Math.floor(t.y) % 2) ? t.y = Math.ceil(t.y) - t.y : t.y = t.y - Math.floor(t.y);
        }
        return this.flipY && (t.y = 1 - t.y), t;
    }
    set needsUpdate(t) {
        !0 === t && (this.version++, this.source.needsUpdate = !0);
    }
    get encoding() {
        return N("THREE.Texture: Property .encoding has been replaced by .colorSpace."), 
        "srgb" === this.colorSpace ? 3001 : 3e3;
    }
    set encoding(t) {
        N("THREE.Texture: Property .encoding has been replaced by .colorSpace."), this.colorSpace = 3001 === t ? "srgb" : "";
    }
}

K.DEFAULT_IMAGE = null, K.DEFAULT_MAPPING = 300, K.DEFAULT_ANISOTROPY = 1;

class Y {
    constructor(t = 0, e = 0, i = 0, n = 1) {
        Y.prototype.isVector4 = !0, this.x = t, this.y = e, this.z = i, this.w = n;
    }
    get width() {
        return this.z;
    }
    set width(t) {
        this.z = t;
    }
    get height() {
        return this.w;
    }
    set height(t) {
        this.w = t;
    }
    set(t, e, i, n) {
        return this.x = t, this.y = e, this.z = i, this.w = n, this;
    }
    setScalar(t) {
        return this.x = t, this.y = t, this.z = t, this.w = t, this;
    }
    setX(t) {
        return this.x = t, this;
    }
    setY(t) {
        return this.y = t, this;
    }
    setZ(t) {
        return this.z = t, this;
    }
    setW(t) {
        return this.w = t, this;
    }
    setComponent(t, e) {
        switch (t) {
          case 0:
            this.x = e;
            break;

          case 1:
            this.y = e;
            break;

          case 2:
            this.z = e;
            break;

          case 3:
            this.w = e;
            break;

          default:
            throw new Error("index is out of range: " + t);
        }
        return this;
    }
    getComponent(t) {
        switch (t) {
          case 0:
            return this.x;

          case 1:
            return this.y;

          case 2:
            return this.z;

          case 3:
            return this.w;

          default:
            throw new Error("index is out of range: " + t);
        }
    }
    clone() {
        return new this.constructor(this.x, this.y, this.z, this.w);
    }
    copy(t) {
        return this.x = t.x, this.y = t.y, this.z = t.z, this.w = void 0 !== t.w ? t.w : 1, 
        this;
    }
    add(t) {
        return this.x += t.x, this.y += t.y, this.z += t.z, this.w += t.w, this;
    }
    addScalar(t) {
        return this.x += t, this.y += t, this.z += t, this.w += t, this;
    }
    addVectors(t, e) {
        return this.x = t.x + e.x, this.y = t.y + e.y, this.z = t.z + e.z, this.w = t.w + e.w, 
        this;
    }
    addScaledVector(t, e) {
        return this.x += t.x * e, this.y += t.y * e, this.z += t.z * e, this.w += t.w * e, 
        this;
    }
    sub(t) {
        return this.x -= t.x, this.y -= t.y, this.z -= t.z, this.w -= t.w, this;
    }
    subScalar(t) {
        return this.x -= t, this.y -= t, this.z -= t, this.w -= t, this;
    }
    subVectors(t, e) {
        return this.x = t.x - e.x, this.y = t.y - e.y, this.z = t.z - e.z, this.w = t.w - e.w, 
        this;
    }
    multiply(t) {
        return this.x *= t.x, this.y *= t.y, this.z *= t.z, this.w *= t.w, this;
    }
    multiplyScalar(t) {
        return this.x *= t, this.y *= t, this.z *= t, this.w *= t, this;
    }
    applyMatrix4(t) {
        const e = this.x, i = this.y, n = this.z, r = this.w, s = t.elements;
        return this.x = s[0] * e + s[4] * i + s[8] * n + s[12] * r, this.y = s[1] * e + s[5] * i + s[9] * n + s[13] * r, 
        this.z = s[2] * e + s[6] * i + s[10] * n + s[14] * r, this.w = s[3] * e + s[7] * i + s[11] * n + s[15] * r, 
        this;
    }
    divideScalar(t) {
        return this.multiplyScalar(1 / t);
    }
    setAxisAngleFromQuaternion(t) {
        this.w = 2 * Math.acos(t.w);
        const e = Math.sqrt(1 - t.w * t.w);
        return e < 1e-4 ? (this.x = 1, this.y = 0, this.z = 0) : (this.x = t.x / e, this.y = t.y / e, 
        this.z = t.z / e), this;
    }
    setAxisAngleFromRotationMatrix(t) {
        let e, i, n, r;
        const s = .01, a = .1, o = t.elements, l = o[0], h = o[4], c = o[8], d = o[1], u = o[5], p = o[9], g = o[2], f = o[6], m = o[10];
        if (Math.abs(h - d) < s && Math.abs(c - g) < s && Math.abs(p - f) < s) {
            if (Math.abs(h + d) < a && Math.abs(c + g) < a && Math.abs(p + f) < a && Math.abs(l + u + m - 3) < a) return this.set(1, 0, 0, 0), 
            this;
            e = Math.PI;
            const t = (l + 1) / 2, o = (u + 1) / 2, v = (m + 1) / 2, _ = (h + d) / 4, x = (c + g) / 4, y = (p + f) / 4;
            return t > o && t > v ? t < s ? (i = 0, n = .707106781, r = .707106781) : (i = Math.sqrt(t), 
            n = _ / i, r = x / i) : o > v ? o < s ? (i = .707106781, n = 0, r = .707106781) : (n = Math.sqrt(o), 
            i = _ / n, r = y / n) : v < s ? (i = .707106781, n = .707106781, r = 0) : (r = Math.sqrt(v), 
            i = x / r, n = y / r), this.set(i, n, r, e), this;
        }
        let v = Math.sqrt((f - p) * (f - p) + (c - g) * (c - g) + (d - h) * (d - h));
        return Math.abs(v) < .001 && (v = 1), this.x = (f - p) / v, this.y = (c - g) / v, 
        this.z = (d - h) / v, this.w = Math.acos((l + u + m - 1) / 2), this;
    }
    min(t) {
        return this.x = Math.min(this.x, t.x), this.y = Math.min(this.y, t.y), this.z = Math.min(this.z, t.z), 
        this.w = Math.min(this.w, t.w), this;
    }
    max(t) {
        return this.x = Math.max(this.x, t.x), this.y = Math.max(this.y, t.y), this.z = Math.max(this.z, t.z), 
        this.w = Math.max(this.w, t.w), this;
    }
    clamp(t, e) {
        return this.x = Math.max(t.x, Math.min(e.x, this.x)), this.y = Math.max(t.y, Math.min(e.y, this.y)), 
        this.z = Math.max(t.z, Math.min(e.z, this.z)), this.w = Math.max(t.w, Math.min(e.w, this.w)), 
        this;
    }
    clampScalar(t, e) {
        return this.x = Math.max(t, Math.min(e, this.x)), this.y = Math.max(t, Math.min(e, this.y)), 
        this.z = Math.max(t, Math.min(e, this.z)), this.w = Math.max(t, Math.min(e, this.w)), 
        this;
    }
    clampLength(t, e) {
        const i = this.length();
        return this.divideScalar(i || 1).multiplyScalar(Math.max(t, Math.min(e, i)));
    }
    floor() {
        return this.x = Math.floor(this.x), this.y = Math.floor(this.y), this.z = Math.floor(this.z), 
        this.w = Math.floor(this.w), this;
    }
    ceil() {
        return this.x = Math.ceil(this.x), this.y = Math.ceil(this.y), this.z = Math.ceil(this.z), 
        this.w = Math.ceil(this.w), this;
    }
    round() {
        return this.x = Math.round(this.x), this.y = Math.round(this.y), this.z = Math.round(this.z), 
        this.w = Math.round(this.w), this;
    }
    roundToZero() {
        return this.x = this.x < 0 ? Math.ceil(this.x) : Math.floor(this.x), this.y = this.y < 0 ? Math.ceil(this.y) : Math.floor(this.y), 
        this.z = this.z < 0 ? Math.ceil(this.z) : Math.floor(this.z), this.w = this.w < 0 ? Math.ceil(this.w) : Math.floor(this.w), 
        this;
    }
    negate() {
        return this.x = -this.x, this.y = -this.y, this.z = -this.z, this.w = -this.w, this;
    }
    dot(t) {
        return this.x * t.x + this.y * t.y + this.z * t.z + this.w * t.w;
    }
    lengthSq() {
        return this.x * this.x + this.y * this.y + this.z * this.z + this.w * this.w;
    }
    length() {
        return Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z + this.w * this.w);
    }
    manhattanLength() {
        return Math.abs(this.x) + Math.abs(this.y) + Math.abs(this.z) + Math.abs(this.w);
    }
    normalize() {
        return this.divideScalar(this.length() || 1);
    }
    setLength(t) {
        return this.normalize().multiplyScalar(t);
    }
    lerp(t, e) {
        return this.x += (t.x - this.x) * e, this.y += (t.y - this.y) * e, this.z += (t.z - this.z) * e, 
        this.w += (t.w - this.w) * e, this;
    }
    lerpVectors(t, e, i) {
        return this.x = t.x + (e.x - t.x) * i, this.y = t.y + (e.y - t.y) * i, this.z = t.z + (e.z - t.z) * i, 
        this.w = t.w + (e.w - t.w) * i, this;
    }
    equals(t) {
        return t.x === this.x && t.y === this.y && t.z === this.z && t.w === this.w;
    }
    fromArray(t, e = 0) {
        return this.x = t[e], this.y = t[e + 1], this.z = t[e + 2], this.w = t[e + 3], this;
    }
    toArray(t = [], e = 0) {
        return t[e] = this.x, t[e + 1] = this.y, t[e + 2] = this.z, t[e + 3] = this.w, t;
    }
    fromBufferAttribute(t, e) {
        return this.x = t.getX(e), this.y = t.getY(e), this.z = t.getZ(e), this.w = t.getW(e), 
        this;
    }
    random() {
        return this.x = Math.random(), this.y = Math.random(), this.z = Math.random(), this.w = Math.random(), 
        this;
    }
    * [Symbol.iterator]() {
        yield this.x, yield this.y, yield this.z, yield this.w;
    }
}

class Z extends g {
    constructor(t = 1, e = 1, i = {}) {
        super(), this.isWebGLRenderTarget = !0, this.width = t, this.height = e, this.depth = 1, 
        this.scissor = new Y(0, 0, t, e), this.scissorTest = !1, this.viewport = new Y(0, 0, t, e);
        const n = {
            width: t,
            height: e,
            depth: 1
        };
        void 0 !== i.encoding && (N("THREE.WebGLRenderTarget: option.encoding has been replaced by option.colorSpace."), 
        i.colorSpace = 3001 === i.encoding ? "srgb" : ""), this.texture = new K(n, i.mapping, i.wrapS, i.wrapT, i.magFilter, i.minFilter, i.format, i.type, i.anisotropy, i.colorSpace), 
        this.texture.isRenderTargetTexture = !0, this.texture.flipY = !1, this.texture.generateMipmaps = void 0 !== i.generateMipmaps && i.generateMipmaps, 
        this.texture.internalFormat = void 0 !== i.internalFormat ? i.internalFormat : null, 
        this.texture.minFilter = void 0 !== i.minFilter ? i.minFilter : 1006, this.depthBuffer = void 0 === i.depthBuffer || i.depthBuffer, 
        this.stencilBuffer = void 0 !== i.stencilBuffer && i.stencilBuffer, this.depthTexture = void 0 !== i.depthTexture ? i.depthTexture : null, 
        this.samples = void 0 !== i.samples ? i.samples : 0;
    }
    setSize(t, e, i = 1) {
        this.width === t && this.height === e && this.depth === i || (this.width = t, this.height = e, 
        this.depth = i, this.texture.image.width = t, this.texture.image.height = e, this.texture.image.depth = i, 
        this.dispose()), this.viewport.set(0, 0, t, e), this.scissor.set(0, 0, t, e);
    }
    clone() {
        return (new this.constructor).copy(this);
    }
    copy(t) {
        this.width = t.width, this.height = t.height, this.depth = t.depth, this.scissor.copy(t.scissor), 
        this.scissorTest = t.scissorTest, this.viewport.copy(t.viewport), this.texture = t.texture.clone(), 
        this.texture.isRenderTargetTexture = !0;
        const e = Object.assign({}, t.texture.image);
        return this.texture.source = new j(e), this.depthBuffer = t.depthBuffer, this.stencilBuffer = t.stencilBuffer, 
        null !== t.depthTexture && (this.depthTexture = t.depthTexture.clone()), this.samples = t.samples, 
        this;
    }
    dispose() {
        this.dispatchEvent({
            type: "dispose"
        });
    }
}

class J extends K {
    constructor(t = null, e = 1, i = 1, n = 1) {
        super(null), this.isDataArrayTexture = !0, this.image = {
            data: t,
            width: e,
            height: i,
            depth: n
        }, this.magFilter = 1003, this.minFilter = 1003, this.wrapR = 1001, this.generateMipmaps = !1, 
        this.flipY = !1, this.unpackAlignment = 1;
    }
}

class Q extends K {
    constructor(t = null, e = 1, i = 1, n = 1) {
        super(null), this.isData3DTexture = !0, this.image = {
            data: t,
            width: e,
            height: i,
            depth: n
        }, this.magFilter = 1003, this.minFilter = 1003, this.wrapR = 1001, this.generateMipmaps = !1, 
        this.flipY = !1, this.unpackAlignment = 1;
    }
}

class $ {
    constructor(t = 0, e = 0, i = 0, n = 1) {
        this.isQuaternion = !0, this._x = t, this._y = e, this._z = i, this._w = n;
    }
    static slerpFlat(t, e, i, n, r, s, a) {
        let o = i[n + 0], l = i[n + 1], h = i[n + 2], c = i[n + 3];
        const d = r[s + 0], u = r[s + 1], p = r[s + 2], g = r[s + 3];
        if (0 === a) return t[e + 0] = o, t[e + 1] = l, t[e + 2] = h, void (t[e + 3] = c);
        if (1 === a) return t[e + 0] = d, t[e + 1] = u, t[e + 2] = p, void (t[e + 3] = g);
        if (c !== g || o !== d || l !== u || h !== p) {
            let t = 1 - a;
            const e = o * d + l * u + h * p + c * g, i = e >= 0 ? 1 : -1, n = 1 - e * e;
            if (n > Number.EPSILON) {
                const r = Math.sqrt(n), s = Math.atan2(r, e * i);
                t = Math.sin(t * s) / r, a = Math.sin(a * s) / r;
            }
            const r = a * i;
            if (o = o * t + d * r, l = l * t + u * r, h = h * t + p * r, c = c * t + g * r, 
            t === 1 - a) {
                const t = 1 / Math.sqrt(o * o + l * l + h * h + c * c);
                o *= t, l *= t, h *= t, c *= t;
            }
        }
        t[e] = o, t[e + 1] = l, t[e + 2] = h, t[e + 3] = c;
    }
    static multiplyQuaternionsFlat(t, e, i, n, r, s) {
        const a = i[n], o = i[n + 1], l = i[n + 2], h = i[n + 3], c = r[s], d = r[s + 1], u = r[s + 2], p = r[s + 3];
        return t[e] = a * p + h * c + o * u - l * d, t[e + 1] = o * p + h * d + l * c - a * u, 
        t[e + 2] = l * p + h * u + a * d - o * c, t[e + 3] = h * p - a * c - o * d - l * u, 
        t;
    }
    get x() {
        return this._x;
    }
    set x(t) {
        this._x = t, this._onChangeCallback();
    }
    get y() {
        return this._y;
    }
    set y(t) {
        this._y = t, this._onChangeCallback();
    }
    get z() {
        return this._z;
    }
    set z(t) {
        this._z = t, this._onChangeCallback();
    }
    get w() {
        return this._w;
    }
    set w(t) {
        this._w = t, this._onChangeCallback();
    }
    set(t, e, i, n) {
        return this._x = t, this._y = e, this._z = i, this._w = n, this._onChangeCallback(), 
        this;
    }
    clone() {
        return new this.constructor(this._x, this._y, this._z, this._w);
    }
    copy(t) {
        return this._x = t.x, this._y = t.y, this._z = t.z, this._w = t.w, this._onChangeCallback(), 
        this;
    }
    setFromEuler(t, e) {
        const i = t._x, n = t._y, r = t._z, s = t._order, a = Math.cos, o = Math.sin, l = a(i / 2), h = a(n / 2), c = a(r / 2), d = o(i / 2), u = o(n / 2), p = o(r / 2);
        switch (s) {
          case "XYZ":
            this._x = d * h * c + l * u * p, this._y = l * u * c - d * h * p, this._z = l * h * p + d * u * c, 
            this._w = l * h * c - d * u * p;
            break;

          case "YXZ":
            this._x = d * h * c + l * u * p, this._y = l * u * c - d * h * p, this._z = l * h * p - d * u * c, 
            this._w = l * h * c + d * u * p;
            break;

          case "ZXY":
            this._x = d * h * c - l * u * p, this._y = l * u * c + d * h * p, this._z = l * h * p + d * u * c, 
            this._w = l * h * c - d * u * p;
            break;

          case "ZYX":
            this._x = d * h * c - l * u * p, this._y = l * u * c + d * h * p, this._z = l * h * p - d * u * c, 
            this._w = l * h * c + d * u * p;
            break;

          case "YZX":
            this._x = d * h * c + l * u * p, this._y = l * u * c + d * h * p, this._z = l * h * p - d * u * c, 
            this._w = l * h * c - d * u * p;
            break;

          case "XZY":
            this._x = d * h * c - l * u * p, this._y = l * u * c - d * h * p, this._z = l * h * p + d * u * c, 
            this._w = l * h * c + d * u * p;
            break;

          default:
            console.warn("THREE.Quaternion: .setFromEuler() encountered an unknown order: " + s);
        }
        return !1 !== e && this._onChangeCallback(), this;
    }
    setFromAxisAngle(t, e) {
        const i = e / 2, n = Math.sin(i);
        return this._x = t.x * n, this._y = t.y * n, this._z = t.z * n, this._w = Math.cos(i), 
        this._onChangeCallback(), this;
    }
    setFromRotationMatrix(t) {
        const e = t.elements, i = e[0], n = e[4], r = e[8], s = e[1], a = e[5], o = e[9], l = e[2], h = e[6], c = e[10], d = i + a + c;
        if (d > 0) {
            const t = .5 / Math.sqrt(d + 1);
            this._w = .25 / t, this._x = (h - o) * t, this._y = (r - l) * t, this._z = (s - n) * t;
        } else if (i > a && i > c) {
            const t = 2 * Math.sqrt(1 + i - a - c);
            this._w = (h - o) / t, this._x = .25 * t, this._y = (n + s) / t, this._z = (r + l) / t;
        } else if (a > c) {
            const t = 2 * Math.sqrt(1 + a - i - c);
            this._w = (r - l) / t, this._x = (n + s) / t, this._y = .25 * t, this._z = (o + h) / t;
        } else {
            const t = 2 * Math.sqrt(1 + c - i - a);
            this._w = (s - n) / t, this._x = (r + l) / t, this._y = (o + h) / t, this._z = .25 * t;
        }
        return this._onChangeCallback(), this;
    }
    setFromUnitVectors(t, e) {
        let i = t.dot(e) + 1;
        return i < Number.EPSILON ? (i = 0, Math.abs(t.x) > Math.abs(t.z) ? (this._x = -t.y, 
        this._y = t.x, this._z = 0, this._w = i) : (this._x = 0, this._y = -t.z, this._z = t.y, 
        this._w = i)) : (this._x = t.y * e.z - t.z * e.y, this._y = t.z * e.x - t.x * e.z, 
        this._z = t.x * e.y - t.y * e.x, this._w = i), this.normalize();
    }
    angleTo(t) {
        return 2 * Math.acos(Math.abs(y(this.dot(t), -1, 1)));
    }
    rotateTowards(t, e) {
        const i = this.angleTo(t);
        if (0 === i) return this;
        const n = Math.min(1, e / i);
        return this.slerp(t, n), this;
    }
    identity() {
        return this.set(0, 0, 0, 1);
    }
    invert() {
        return this.conjugate();
    }
    conjugate() {
        return this._x *= -1, this._y *= -1, this._z *= -1, this._onChangeCallback(), this;
    }
    dot(t) {
        return this._x * t._x + this._y * t._y + this._z * t._z + this._w * t._w;
    }
    lengthSq() {
        return this._x * this._x + this._y * this._y + this._z * this._z + this._w * this._w;
    }
    length() {
        return Math.sqrt(this._x * this._x + this._y * this._y + this._z * this._z + this._w * this._w);
    }
    normalize() {
        let t = this.length();
        return 0 === t ? (this._x = 0, this._y = 0, this._z = 0, this._w = 1) : (t = 1 / t, 
        this._x = this._x * t, this._y = this._y * t, this._z = this._z * t, this._w = this._w * t), 
        this._onChangeCallback(), this;
    }
    multiply(t) {
        return this.multiplyQuaternions(this, t);
    }
    premultiply(t) {
        return this.multiplyQuaternions(t, this);
    }
    multiplyQuaternions(t, e) {
        const i = t._x, n = t._y, r = t._z, s = t._w, a = e._x, o = e._y, l = e._z, h = e._w;
        return this._x = i * h + s * a + n * l - r * o, this._y = n * h + s * o + r * a - i * l, 
        this._z = r * h + s * l + i * o - n * a, this._w = s * h - i * a - n * o - r * l, 
        this._onChangeCallback(), this;
    }
    slerp(t, e) {
        if (0 === e) return this;
        if (1 === e) return this.copy(t);
        const i = this._x, n = this._y, r = this._z, s = this._w;
        let a = s * t._w + i * t._x + n * t._y + r * t._z;
        if (a < 0 ? (this._w = -t._w, this._x = -t._x, this._y = -t._y, this._z = -t._z, 
        a = -a) : this.copy(t), a >= 1) return this._w = s, this._x = i, this._y = n, this._z = r, 
        this;
        const o = 1 - a * a;
        if (o <= Number.EPSILON) {
            const t = 1 - e;
            return this._w = t * s + e * this._w, this._x = t * i + e * this._x, this._y = t * n + e * this._y, 
            this._z = t * r + e * this._z, this.normalize(), this._onChangeCallback(), this;
        }
        const l = Math.sqrt(o), h = Math.atan2(l, a), c = Math.sin((1 - e) * h) / l, d = Math.sin(e * h) / l;
        return this._w = s * c + this._w * d, this._x = i * c + this._x * d, this._y = n * c + this._y * d, 
        this._z = r * c + this._z * d, this._onChangeCallback(), this;
    }
    slerpQuaternions(t, e, i) {
        return this.copy(t).slerp(e, i);
    }
    random() {
        const t = Math.random(), e = Math.sqrt(1 - t), i = Math.sqrt(t), n = 2 * Math.PI * Math.random(), r = 2 * Math.PI * Math.random();
        return this.set(e * Math.cos(n), i * Math.sin(r), i * Math.cos(r), e * Math.sin(n));
    }
    equals(t) {
        return t._x === this._x && t._y === this._y && t._z === this._z && t._w === this._w;
    }
    fromArray(t, e = 0) {
        return this._x = t[e], this._y = t[e + 1], this._z = t[e + 2], this._w = t[e + 3], 
        this._onChangeCallback(), this;
    }
    toArray(t = [], e = 0) {
        return t[e] = this._x, t[e + 1] = this._y, t[e + 2] = this._z, t[e + 3] = this._w, 
        t;
    }
    fromBufferAttribute(t, e) {
        return this._x = t.getX(e), this._y = t.getY(e), this._z = t.getZ(e), this._w = t.getW(e), 
        this;
    }
    toJSON() {
        return this.toArray();
    }
    _onChange(t) {
        return this._onChangeCallback = t, this;
    }
    _onChangeCallback() {}
    * [Symbol.iterator]() {
        yield this._x, yield this._y, yield this._z, yield this._w;
    }
}

class tt {
    constructor(t = 0, e = 0, i = 0) {
        tt.prototype.isVector3 = !0, this.x = t, this.y = e, this.z = i;
    }
    set(t, e, i) {
        return void 0 === i && (i = this.z), this.x = t, this.y = e, this.z = i, this;
    }
    setScalar(t) {
        return this.x = t, this.y = t, this.z = t, this;
    }
    setX(t) {
        return this.x = t, this;
    }
    setY(t) {
        return this.y = t, this;
    }
    setZ(t) {
        return this.z = t, this;
    }
    setComponent(t, e) {
        switch (t) {
          case 0:
            this.x = e;
            break;

          case 1:
            this.y = e;
            break;

          case 2:
            this.z = e;
            break;

          default:
            throw new Error("index is out of range: " + t);
        }
        return this;
    }
    getComponent(t) {
        switch (t) {
          case 0:
            return this.x;

          case 1:
            return this.y;

          case 2:
            return this.z;

          default:
            throw new Error("index is out of range: " + t);
        }
    }
    clone() {
        return new this.constructor(this.x, this.y, this.z);
    }
    copy(t) {
        return this.x = t.x, this.y = t.y, this.z = t.z, this;
    }
    add(t) {
        return this.x += t.x, this.y += t.y, this.z += t.z, this;
    }
    addScalar(t) {
        return this.x += t, this.y += t, this.z += t, this;
    }
    addVectors(t, e) {
        return this.x = t.x + e.x, this.y = t.y + e.y, this.z = t.z + e.z, this;
    }
    addScaledVector(t, e) {
        return this.x += t.x * e, this.y += t.y * e, this.z += t.z * e, this;
    }
    sub(t) {
        return this.x -= t.x, this.y -= t.y, this.z -= t.z, this;
    }
    subScalar(t) {
        return this.x -= t, this.y -= t, this.z -= t, this;
    }
    subVectors(t, e) {
        return this.x = t.x - e.x, this.y = t.y - e.y, this.z = t.z - e.z, this;
    }
    multiply(t) {
        return this.x *= t.x, this.y *= t.y, this.z *= t.z, this;
    }
    multiplyScalar(t) {
        return this.x *= t, this.y *= t, this.z *= t, this;
    }
    multiplyVectors(t, e) {
        return this.x = t.x * e.x, this.y = t.y * e.y, this.z = t.z * e.z, this;
    }
    applyEuler(t) {
        return this.applyQuaternion(it.setFromEuler(t));
    }
    applyAxisAngle(t, e) {
        return this.applyQuaternion(it.setFromAxisAngle(t, e));
    }
    applyMatrix3(t) {
        const e = this.x, i = this.y, n = this.z, r = t.elements;
        return this.x = r[0] * e + r[3] * i + r[6] * n, this.y = r[1] * e + r[4] * i + r[7] * n, 
        this.z = r[2] * e + r[5] * i + r[8] * n, this;
    }
    applyNormalMatrix(t) {
        return this.applyMatrix3(t).normalize();
    }
    applyMatrix4(t) {
        const e = this.x, i = this.y, n = this.z, r = t.elements, s = 1 / (r[3] * e + r[7] * i + r[11] * n + r[15]);
        return this.x = (r[0] * e + r[4] * i + r[8] * n + r[12]) * s, this.y = (r[1] * e + r[5] * i + r[9] * n + r[13]) * s, 
        this.z = (r[2] * e + r[6] * i + r[10] * n + r[14]) * s, this;
    }
    applyQuaternion(t) {
        const e = this.x, i = this.y, n = this.z, r = t.x, s = t.y, a = t.z, o = t.w, l = o * e + s * n - a * i, h = o * i + a * e - r * n, c = o * n + r * i - s * e, d = -r * e - s * i - a * n;
        return this.x = l * o + d * -r + h * -a - c * -s, this.y = h * o + d * -s + c * -r - l * -a, 
        this.z = c * o + d * -a + l * -s - h * -r, this;
    }
    project(t) {
        return this.applyMatrix4(t.matrixWorldInverse).applyMatrix4(t.projectionMatrix);
    }
    unproject(t) {
        return this.applyMatrix4(t.projectionMatrixInverse).applyMatrix4(t.matrixWorld);
    }
    transformDirection(t) {
        const e = this.x, i = this.y, n = this.z, r = t.elements;
        return this.x = r[0] * e + r[4] * i + r[8] * n, this.y = r[1] * e + r[5] * i + r[9] * n, 
        this.z = r[2] * e + r[6] * i + r[10] * n, this.normalize();
    }
    divide(t) {
        return this.x /= t.x, this.y /= t.y, this.z /= t.z, this;
    }
    divideScalar(t) {
        return this.multiplyScalar(1 / t);
    }
    min(t) {
        return this.x = Math.min(this.x, t.x), this.y = Math.min(this.y, t.y), this.z = Math.min(this.z, t.z), 
        this;
    }
    max(t) {
        return this.x = Math.max(this.x, t.x), this.y = Math.max(this.y, t.y), this.z = Math.max(this.z, t.z), 
        this;
    }
    clamp(t, e) {
        return this.x = Math.max(t.x, Math.min(e.x, this.x)), this.y = Math.max(t.y, Math.min(e.y, this.y)), 
        this.z = Math.max(t.z, Math.min(e.z, this.z)), this;
    }
    clampScalar(t, e) {
        return this.x = Math.max(t, Math.min(e, this.x)), this.y = Math.max(t, Math.min(e, this.y)), 
        this.z = Math.max(t, Math.min(e, this.z)), this;
    }
    clampLength(t, e) {
        const i = this.length();
        return this.divideScalar(i || 1).multiplyScalar(Math.max(t, Math.min(e, i)));
    }
    floor() {
        return this.x = Math.floor(this.x), this.y = Math.floor(this.y), this.z = Math.floor(this.z), 
        this;
    }
    ceil() {
        return this.x = Math.ceil(this.x), this.y = Math.ceil(this.y), this.z = Math.ceil(this.z), 
        this;
    }
    round() {
        return this.x = Math.round(this.x), this.y = Math.round(this.y), this.z = Math.round(this.z), 
        this;
    }
    roundToZero() {
        return this.x = this.x < 0 ? Math.ceil(this.x) : Math.floor(this.x), this.y = this.y < 0 ? Math.ceil(this.y) : Math.floor(this.y), 
        this.z = this.z < 0 ? Math.ceil(this.z) : Math.floor(this.z), this;
    }
    negate() {
        return this.x = -this.x, this.y = -this.y, this.z = -this.z, this;
    }
    dot(t) {
        return this.x * t.x + this.y * t.y + this.z * t.z;
    }
    lengthSq() {
        return this.x * this.x + this.y * this.y + this.z * this.z;
    }
    length() {
        return Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z);
    }
    manhattanLength() {
        return Math.abs(this.x) + Math.abs(this.y) + Math.abs(this.z);
    }
    normalize() {
        return this.divideScalar(this.length() || 1);
    }
    setLength(t) {
        return this.normalize().multiplyScalar(t);
    }
    lerp(t, e) {
        return this.x += (t.x - this.x) * e, this.y += (t.y - this.y) * e, this.z += (t.z - this.z) * e, 
        this;
    }
    lerpVectors(t, e, i) {
        return this.x = t.x + (e.x - t.x) * i, this.y = t.y + (e.y - t.y) * i, this.z = t.z + (e.z - t.z) * i, 
        this;
    }
    cross(t) {
        return this.crossVectors(this, t);
    }
    crossVectors(t, e) {
        const i = t.x, n = t.y, r = t.z, s = e.x, a = e.y, o = e.z;
        return this.x = n * o - r * a, this.y = r * s - i * o, this.z = i * a - n * s, this;
    }
    projectOnVector(t) {
        const e = t.lengthSq();
        if (0 === e) return this.set(0, 0, 0);
        const i = t.dot(this) / e;
        return this.copy(t).multiplyScalar(i);
    }
    projectOnPlane(t) {
        return et.copy(this).projectOnVector(t), this.sub(et);
    }
    reflect(t) {
        return this.sub(et.copy(t).multiplyScalar(2 * this.dot(t)));
    }
    angleTo(t) {
        const e = Math.sqrt(this.lengthSq() * t.lengthSq());
        if (0 === e) return Math.PI / 2;
        const i = this.dot(t) / e;
        return Math.acos(y(i, -1, 1));
    }
    distanceTo(t) {
        return Math.sqrt(this.distanceToSquared(t));
    }
    distanceToSquared(t) {
        const e = this.x - t.x, i = this.y - t.y, n = this.z - t.z;
        return e * e + i * i + n * n;
    }
    manhattanDistanceTo(t) {
        return Math.abs(this.x - t.x) + Math.abs(this.y - t.y) + Math.abs(this.z - t.z);
    }
    setFromSpherical(t) {
        return this.setFromSphericalCoords(t.radius, t.phi, t.theta);
    }
    setFromSphericalCoords(t, e, i) {
        const n = Math.sin(e) * t;
        return this.x = n * Math.sin(i), this.y = Math.cos(e) * t, this.z = n * Math.cos(i), 
        this;
    }
    setFromCylindrical(t) {
        return this.setFromCylindricalCoords(t.radius, t.theta, t.y);
    }
    setFromCylindricalCoords(t, e, i) {
        return this.x = t * Math.sin(e), this.y = i, this.z = t * Math.cos(e), this;
    }
    setFromMatrixPosition(t) {
        const e = t.elements;
        return this.x = e[12], this.y = e[13], this.z = e[14], this;
    }
    setFromMatrixScale(t) {
        const e = this.setFromMatrixColumn(t, 0).length(), i = this.setFromMatrixColumn(t, 1).length(), n = this.setFromMatrixColumn(t, 2).length();
        return this.x = e, this.y = i, this.z = n, this;
    }
    setFromMatrixColumn(t, e) {
        return this.fromArray(t.elements, 4 * e);
    }
    setFromMatrix3Column(t, e) {
        return this.fromArray(t.elements, 3 * e);
    }
    setFromEuler(t) {
        return this.x = t._x, this.y = t._y, this.z = t._z, this;
    }
    setFromColor(t) {
        return this.x = t.r, this.y = t.g, this.z = t.b, this;
    }
    equals(t) {
        return t.x === this.x && t.y === this.y && t.z === this.z;
    }
    fromArray(t, e = 0) {
        return this.x = t[e], this.y = t[e + 1], this.z = t[e + 2], this;
    }
    toArray(t = [], e = 0) {
        return t[e] = this.x, t[e + 1] = this.y, t[e + 2] = this.z, t;
    }
    fromBufferAttribute(t, e) {
        return this.x = t.getX(e), this.y = t.getY(e), this.z = t.getZ(e), this;
    }
    random() {
        return this.x = Math.random(), this.y = Math.random(), this.z = Math.random(), this;
    }
    randomDirection() {
        const t = 2 * (Math.random() - .5), e = Math.random() * Math.PI * 2, i = Math.sqrt(1 - t ** 2);
        return this.x = i * Math.cos(e), this.y = i * Math.sin(e), this.z = t, this;
    }
    * [Symbol.iterator]() {
        yield this.x, yield this.y, yield this.z;
    }
}

const et = new tt, it = new $;

class nt {
    constructor(t = new tt(1 / 0, 1 / 0, 1 / 0), e = new tt(-1 / 0, -1 / 0, -1 / 0)) {
        this.isBox3 = !0, this.min = t, this.max = e;
    }
    set(t, e) {
        return this.min.copy(t), this.max.copy(e), this;
    }
    setFromArray(t) {
        this.makeEmpty();
        for (let e = 0, i = t.length; e < i; e += 3) this.expandByPoint(st.fromArray(t, e));
        return this;
    }
    setFromBufferAttribute(t) {
        this.makeEmpty();
        for (let e = 0, i = t.count; e < i; e++) this.expandByPoint(st.fromBufferAttribute(t, e));
        return this;
    }
    setFromPoints(t) {
        this.makeEmpty();
        for (let e = 0, i = t.length; e < i; e++) this.expandByPoint(t[e]);
        return this;
    }
    setFromCenterAndSize(t, e) {
        const i = st.copy(e).multiplyScalar(.5);
        return this.min.copy(t).sub(i), this.max.copy(t).add(i), this;
    }
    setFromObject(t, e = !1) {
        return this.makeEmpty(), this.expandByObject(t, e);
    }
    clone() {
        return (new this.constructor).copy(this);
    }
    copy(t) {
        return this.min.copy(t.min), this.max.copy(t.max), this;
    }
    makeEmpty() {
        return this.min.x = this.min.y = this.min.z = 1 / 0, this.max.x = this.max.y = this.max.z = -1 / 0, 
        this;
    }
    isEmpty() {
        return this.max.x < this.min.x || this.max.y < this.min.y || this.max.z < this.min.z;
    }
    getCenter(t) {
        return this.isEmpty() ? t.set(0, 0, 0) : t.addVectors(this.min, this.max).multiplyScalar(.5);
    }
    getSize(t) {
        return this.isEmpty() ? t.set(0, 0, 0) : t.subVectors(this.max, this.min);
    }
    expandByPoint(t) {
        return this.min.min(t), this.max.max(t), this;
    }
    expandByVector(t) {
        return this.min.sub(t), this.max.add(t), this;
    }
    expandByScalar(t) {
        return this.min.addScalar(-t), this.max.addScalar(t), this;
    }
    expandByObject(t, e = !1) {
        if (t.updateWorldMatrix(!1, !1), void 0 !== t.boundingBox) null === t.boundingBox && t.computeBoundingBox(), 
        at.copy(t.boundingBox), at.applyMatrix4(t.matrixWorld), this.union(at); else {
            const i = t.geometry;
            if (void 0 !== i) if (e && void 0 !== i.attributes && void 0 !== i.attributes.position) {
                const e = i.attributes.position;
                for (let i = 0, n = e.count; i < n; i++) st.fromBufferAttribute(e, i).applyMatrix4(t.matrixWorld), 
                this.expandByPoint(st);
            } else null === i.boundingBox && i.computeBoundingBox(), at.copy(i.boundingBox), 
            at.applyMatrix4(t.matrixWorld), this.union(at);
        }
        const i = t.children;
        for (let t = 0, n = i.length; t < n; t++) this.expandByObject(i[t], e);
        return this;
    }
    containsPoint(t) {
        return !(t.x < this.min.x || t.x > this.max.x || t.y < this.min.y || t.y > this.max.y || t.z < this.min.z || t.z > this.max.z);
    }
    containsBox(t) {
        return this.min.x <= t.min.x && t.max.x <= this.max.x && this.min.y <= t.min.y && t.max.y <= this.max.y && this.min.z <= t.min.z && t.max.z <= this.max.z;
    }
    getParameter(t, e) {
        return e.set((t.x - this.min.x) / (this.max.x - this.min.x), (t.y - this.min.y) / (this.max.y - this.min.y), (t.z - this.min.z) / (this.max.z - this.min.z));
    }
    intersectsBox(t) {
        return !(t.max.x < this.min.x || t.min.x > this.max.x || t.max.y < this.min.y || t.min.y > this.max.y || t.max.z < this.min.z || t.min.z > this.max.z);
    }
    intersectsSphere(t) {
        return this.clampPoint(t.center, st), st.distanceToSquared(t.center) <= t.radius * t.radius;
    }
    intersectsPlane(t) {
        let e, i;
        return t.normal.x > 0 ? (e = t.normal.x * this.min.x, i = t.normal.x * this.max.x) : (e = t.normal.x * this.max.x, 
        i = t.normal.x * this.min.x), t.normal.y > 0 ? (e += t.normal.y * this.min.y, i += t.normal.y * this.max.y) : (e += t.normal.y * this.max.y, 
        i += t.normal.y * this.min.y), t.normal.z > 0 ? (e += t.normal.z * this.min.z, i += t.normal.z * this.max.z) : (e += t.normal.z * this.max.z, 
        i += t.normal.z * this.min.z), e <= -t.constant && i >= -t.constant;
    }
    intersectsTriangle(t) {
        if (this.isEmpty()) return !1;
        this.getCenter(pt), gt.subVectors(this.max, pt), ot.subVectors(t.a, pt), lt.subVectors(t.b, pt), 
        ht.subVectors(t.c, pt), ct.subVectors(lt, ot), dt.subVectors(ht, lt), ut.subVectors(ot, ht);
        let e = [ 0, -ct.z, ct.y, 0, -dt.z, dt.y, 0, -ut.z, ut.y, ct.z, 0, -ct.x, dt.z, 0, -dt.x, ut.z, 0, -ut.x, -ct.y, ct.x, 0, -dt.y, dt.x, 0, -ut.y, ut.x, 0 ];
        return !!vt(e, ot, lt, ht, gt) && (e = [ 1, 0, 0, 0, 1, 0, 0, 0, 1 ], !!vt(e, ot, lt, ht, gt) && (ft.crossVectors(ct, dt), 
        e = [ ft.x, ft.y, ft.z ], vt(e, ot, lt, ht, gt)));
    }
    clampPoint(t, e) {
        return e.copy(t).clamp(this.min, this.max);
    }
    distanceToPoint(t) {
        return this.clampPoint(t, st).distanceTo(t);
    }
    getBoundingSphere(t) {
        return this.isEmpty() ? t.makeEmpty() : (this.getCenter(t.center), t.radius = .5 * this.getSize(st).length()), 
        t;
    }
    intersect(t) {
        return this.min.max(t.min), this.max.min(t.max), this.isEmpty() && this.makeEmpty(), 
        this;
    }
    union(t) {
        return this.min.min(t.min), this.max.max(t.max), this;
    }
    applyMatrix4(t) {
        return this.isEmpty() || (rt[0].set(this.min.x, this.min.y, this.min.z).applyMatrix4(t), 
        rt[1].set(this.min.x, this.min.y, this.max.z).applyMatrix4(t), rt[2].set(this.min.x, this.max.y, this.min.z).applyMatrix4(t), 
        rt[3].set(this.min.x, this.max.y, this.max.z).applyMatrix4(t), rt[4].set(this.max.x, this.min.y, this.min.z).applyMatrix4(t), 
        rt[5].set(this.max.x, this.min.y, this.max.z).applyMatrix4(t), rt[6].set(this.max.x, this.max.y, this.min.z).applyMatrix4(t), 
        rt[7].set(this.max.x, this.max.y, this.max.z).applyMatrix4(t), this.setFromPoints(rt)), 
        this;
    }
    translate(t) {
        return this.min.add(t), this.max.add(t), this;
    }
    equals(t) {
        return t.min.equals(this.min) && t.max.equals(this.max);
    }
}

const rt = [ new tt, new tt, new tt, new tt, new tt, new tt, new tt, new tt ], st = new tt, at = new nt, ot = new tt, lt = new tt, ht = new tt, ct = new tt, dt = new tt, ut = new tt, pt = new tt, gt = new tt, ft = new tt, mt = new tt;

function vt(t, e, i, n, r) {
    for (let s = 0, a = t.length - 3; s <= a; s += 3) {
        mt.fromArray(t, s);
        const a = r.x * Math.abs(mt.x) + r.y * Math.abs(mt.y) + r.z * Math.abs(mt.z), o = e.dot(mt), l = i.dot(mt), h = n.dot(mt);
        if (Math.max(-Math.max(o, l, h), Math.min(o, l, h)) > a) return !1;
    }
    return !0;
}

const _t = new nt, xt = new tt, yt = new tt;

class bt {
    constructor(t = new tt, e = -1) {
        this.center = t, this.radius = e;
    }
    set(t, e) {
        return this.center.copy(t), this.radius = e, this;
    }
    setFromPoints(t, e) {
        const i = this.center;
        void 0 !== e ? i.copy(e) : _t.setFromPoints(t).getCenter(i);
        let n = 0;
        for (let e = 0, r = t.length; e < r; e++) n = Math.max(n, i.distanceToSquared(t[e]));
        return this.radius = Math.sqrt(n), this;
    }
    copy(t) {
        return this.center.copy(t.center), this.radius = t.radius, this;
    }
    isEmpty() {
        return this.radius < 0;
    }
    makeEmpty() {
        return this.center.set(0, 0, 0), this.radius = -1, this;
    }
    containsPoint(t) {
        return t.distanceToSquared(this.center) <= this.radius * this.radius;
    }
    distanceToPoint(t) {
        return t.distanceTo(this.center) - this.radius;
    }
    intersectsSphere(t) {
        const e = this.radius + t.radius;
        return t.center.distanceToSquared(this.center) <= e * e;
    }
    intersectsBox(t) {
        return t.intersectsSphere(this);
    }
    intersectsPlane(t) {
        return Math.abs(t.distanceToPoint(this.center)) <= this.radius;
    }
    clampPoint(t, e) {
        const i = this.center.distanceToSquared(t);
        return e.copy(t), i > this.radius * this.radius && (e.sub(this.center).normalize(), 
        e.multiplyScalar(this.radius).add(this.center)), e;
    }
    getBoundingBox(t) {
        return this.isEmpty() ? (t.makeEmpty(), t) : (t.set(this.center, this.center), t.expandByScalar(this.radius), 
        t);
    }
    applyMatrix4(t) {
        return this.center.applyMatrix4(t), this.radius = this.radius * t.getMaxScaleOnAxis(), 
        this;
    }
    translate(t) {
        return this.center.add(t), this;
    }
    expandByPoint(t) {
        if (this.isEmpty()) return this.center.copy(t), this.radius = 0, this;
        xt.subVectors(t, this.center);
        const e = xt.lengthSq();
        if (e > this.radius * this.radius) {
            const t = Math.sqrt(e), i = .5 * (t - this.radius);
            this.center.addScaledVector(xt, i / t), this.radius += i;
        }
        return this;
    }
    union(t) {
        return t.isEmpty() ? this : this.isEmpty() ? (this.copy(t), this) : (!0 === this.center.equals(t.center) ? this.radius = Math.max(this.radius, t.radius) : (yt.subVectors(t.center, this.center).setLength(t.radius), 
        this.expandByPoint(xt.copy(t.center).add(yt)), this.expandByPoint(xt.copy(t.center).sub(yt))), 
        this);
    }
    equals(t) {
        return t.center.equals(this.center) && t.radius === this.radius;
    }
    clone() {
        return (new this.constructor).copy(this);
    }
}

const St = new tt, wt = new tt, Mt = new tt, Tt = new tt, Et = new tt, At = new tt, Ct = new tt;

class Pt {
    constructor(t = new tt, e = new tt(0, 0, -1)) {
        this.origin = t, this.direction = e;
    }
    set(t, e) {
        return this.origin.copy(t), this.direction.copy(e), this;
    }
    copy(t) {
        return this.origin.copy(t.origin), this.direction.copy(t.direction), this;
    }
    at(t, e) {
        return e.copy(this.origin).addScaledVector(this.direction, t);
    }
    lookAt(t) {
        return this.direction.copy(t).sub(this.origin).normalize(), this;
    }
    recast(t) {
        return this.origin.copy(this.at(t, St)), this;
    }
    closestPointToPoint(t, e) {
        e.subVectors(t, this.origin);
        const i = e.dot(this.direction);
        return i < 0 ? e.copy(this.origin) : e.copy(this.origin).addScaledVector(this.direction, i);
    }
    distanceToPoint(t) {
        return Math.sqrt(this.distanceSqToPoint(t));
    }
    distanceSqToPoint(t) {
        const e = St.subVectors(t, this.origin).dot(this.direction);
        return e < 0 ? this.origin.distanceToSquared(t) : (St.copy(this.origin).addScaledVector(this.direction, e), 
        St.distanceToSquared(t));
    }
    distanceSqToSegment(t, e, i, n) {
        wt.copy(t).add(e).multiplyScalar(.5), Mt.copy(e).sub(t).normalize(), Tt.copy(this.origin).sub(wt);
        const r = .5 * t.distanceTo(e), s = -this.direction.dot(Mt), a = Tt.dot(this.direction), o = -Tt.dot(Mt), l = Tt.lengthSq(), h = Math.abs(1 - s * s);
        let c, d, u, p;
        if (h > 0) if (c = s * o - a, d = s * a - o, p = r * h, c >= 0) if (d >= -p) if (d <= p) {
            const t = 1 / h;
            c *= t, d *= t, u = c * (c + s * d + 2 * a) + d * (s * c + d + 2 * o) + l;
        } else d = r, c = Math.max(0, -(s * d + a)), u = -c * c + d * (d + 2 * o) + l; else d = -r, 
        c = Math.max(0, -(s * d + a)), u = -c * c + d * (d + 2 * o) + l; else d <= -p ? (c = Math.max(0, -(-s * r + a)), 
        d = c > 0 ? -r : Math.min(Math.max(-r, -o), r), u = -c * c + d * (d + 2 * o) + l) : d <= p ? (c = 0, 
        d = Math.min(Math.max(-r, -o), r), u = d * (d + 2 * o) + l) : (c = Math.max(0, -(s * r + a)), 
        d = c > 0 ? r : Math.min(Math.max(-r, -o), r), u = -c * c + d * (d + 2 * o) + l); else d = s > 0 ? -r : r, 
        c = Math.max(0, -(s * d + a)), u = -c * c + d * (d + 2 * o) + l;
        return i && i.copy(this.origin).addScaledVector(this.direction, c), n && n.copy(wt).addScaledVector(Mt, d), 
        u;
    }
    intersectSphere(t, e) {
        St.subVectors(t.center, this.origin);
        const i = St.dot(this.direction), n = St.dot(St) - i * i, r = t.radius * t.radius;
        if (n > r) return null;
        const s = Math.sqrt(r - n), a = i - s, o = i + s;
        return o < 0 ? null : a < 0 ? this.at(o, e) : this.at(a, e);
    }
    intersectsSphere(t) {
        return this.distanceSqToPoint(t.center) <= t.radius * t.radius;
    }
    distanceToPlane(t) {
        const e = t.normal.dot(this.direction);
        if (0 === e) return 0 === t.distanceToPoint(this.origin) ? 0 : null;
        const i = -(this.origin.dot(t.normal) + t.constant) / e;
        return i >= 0 ? i : null;
    }
    intersectPlane(t, e) {
        const i = this.distanceToPlane(t);
        return null === i ? null : this.at(i, e);
    }
    intersectsPlane(t) {
        const e = t.distanceToPoint(this.origin);
        if (0 === e) return !0;
        return t.normal.dot(this.direction) * e < 0;
    }
    intersectBox(t, e) {
        let i, n, r, s, a, o;
        const l = 1 / this.direction.x, h = 1 / this.direction.y, c = 1 / this.direction.z, d = this.origin;
        return l >= 0 ? (i = (t.min.x - d.x) * l, n = (t.max.x - d.x) * l) : (i = (t.max.x - d.x) * l, 
        n = (t.min.x - d.x) * l), h >= 0 ? (r = (t.min.y - d.y) * h, s = (t.max.y - d.y) * h) : (r = (t.max.y - d.y) * h, 
        s = (t.min.y - d.y) * h), i > s || r > n ? null : ((r > i || isNaN(i)) && (i = r), 
        (s < n || isNaN(n)) && (n = s), c >= 0 ? (a = (t.min.z - d.z) * c, o = (t.max.z - d.z) * c) : (a = (t.max.z - d.z) * c, 
        o = (t.min.z - d.z) * c), i > o || a > n ? null : ((a > i || i != i) && (i = a), 
        (o < n || n != n) && (n = o), n < 0 ? null : this.at(i >= 0 ? i : n, e)));
    }
    intersectsBox(t) {
        return null !== this.intersectBox(t, St);
    }
    intersectTriangle(t, e, i, n, r) {
        Et.subVectors(e, t), At.subVectors(i, t), Ct.crossVectors(Et, At);
        let s, a = this.direction.dot(Ct);
        if (a > 0) {
            if (n) return null;
            s = 1;
        } else {
            if (!(a < 0)) return null;
            s = -1, a = -a;
        }
        Tt.subVectors(this.origin, t);
        const o = s * this.direction.dot(At.crossVectors(Tt, At));
        if (o < 0) return null;
        const l = s * this.direction.dot(Et.cross(Tt));
        if (l < 0) return null;
        if (o + l > a) return null;
        const h = -s * Tt.dot(Ct);
        return h < 0 ? null : this.at(h / a, r);
    }
    applyMatrix4(t) {
        return this.origin.applyMatrix4(t), this.direction.transformDirection(t), this;
    }
    equals(t) {
        return t.origin.equals(this.origin) && t.direction.equals(this.direction);
    }
    clone() {
        return (new this.constructor).copy(this);
    }
}

class Rt {
    constructor() {
        Rt.prototype.isMatrix4 = !0, this.elements = [ 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1 ];
    }
    set(t, e, i, n, r, s, a, o, l, h, c, d, u, p, g, f) {
        const m = this.elements;
        return m[0] = t, m[4] = e, m[8] = i, m[12] = n, m[1] = r, m[5] = s, m[9] = a, m[13] = o, 
        m[2] = l, m[6] = h, m[10] = c, m[14] = d, m[3] = u, m[7] = p, m[11] = g, m[15] = f, 
        this;
    }
    identity() {
        return this.set(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1), this;
    }
    clone() {
        return (new Rt).fromArray(this.elements);
    }
    copy(t) {
        const e = this.elements, i = t.elements;
        return e[0] = i[0], e[1] = i[1], e[2] = i[2], e[3] = i[3], e[4] = i[4], e[5] = i[5], 
        e[6] = i[6], e[7] = i[7], e[8] = i[8], e[9] = i[9], e[10] = i[10], e[11] = i[11], 
        e[12] = i[12], e[13] = i[13], e[14] = i[14], e[15] = i[15], this;
    }
    copyPosition(t) {
        const e = this.elements, i = t.elements;
        return e[12] = i[12], e[13] = i[13], e[14] = i[14], this;
    }
    setFromMatrix3(t) {
        const e = t.elements;
        return this.set(e[0], e[3], e[6], 0, e[1], e[4], e[7], 0, e[2], e[5], e[8], 0, 0, 0, 0, 1), 
        this;
    }
    extractBasis(t, e, i) {
        return t.setFromMatrixColumn(this, 0), e.setFromMatrixColumn(this, 1), i.setFromMatrixColumn(this, 2), 
        this;
    }
    makeBasis(t, e, i) {
        return this.set(t.x, e.x, i.x, 0, t.y, e.y, i.y, 0, t.z, e.z, i.z, 0, 0, 0, 0, 1), 
        this;
    }
    extractRotation(t) {
        const e = this.elements, i = t.elements, n = 1 / Lt.setFromMatrixColumn(t, 0).length(), r = 1 / Lt.setFromMatrixColumn(t, 1).length(), s = 1 / Lt.setFromMatrixColumn(t, 2).length();
        return e[0] = i[0] * n, e[1] = i[1] * n, e[2] = i[2] * n, e[3] = 0, e[4] = i[4] * r, 
        e[5] = i[5] * r, e[6] = i[6] * r, e[7] = 0, e[8] = i[8] * s, e[9] = i[9] * s, e[10] = i[10] * s, 
        e[11] = 0, e[12] = 0, e[13] = 0, e[14] = 0, e[15] = 1, this;
    }
    makeRotationFromEuler(t) {
        const e = this.elements, i = t.x, n = t.y, r = t.z, s = Math.cos(i), a = Math.sin(i), o = Math.cos(n), l = Math.sin(n), h = Math.cos(r), c = Math.sin(r);
        if ("XYZ" === t.order) {
            const t = s * h, i = s * c, n = a * h, r = a * c;
            e[0] = o * h, e[4] = -o * c, e[8] = l, e[1] = i + n * l, e[5] = t - r * l, e[9] = -a * o, 
            e[2] = r - t * l, e[6] = n + i * l, e[10] = s * o;
        } else if ("YXZ" === t.order) {
            const t = o * h, i = o * c, n = l * h, r = l * c;
            e[0] = t + r * a, e[4] = n * a - i, e[8] = s * l, e[1] = s * c, e[5] = s * h, e[9] = -a, 
            e[2] = i * a - n, e[6] = r + t * a, e[10] = s * o;
        } else if ("ZXY" === t.order) {
            const t = o * h, i = o * c, n = l * h, r = l * c;
            e[0] = t - r * a, e[4] = -s * c, e[8] = n + i * a, e[1] = i + n * a, e[5] = s * h, 
            e[9] = r - t * a, e[2] = -s * l, e[6] = a, e[10] = s * o;
        } else if ("ZYX" === t.order) {
            const t = s * h, i = s * c, n = a * h, r = a * c;
            e[0] = o * h, e[4] = n * l - i, e[8] = t * l + r, e[1] = o * c, e[5] = r * l + t, 
            e[9] = i * l - n, e[2] = -l, e[6] = a * o, e[10] = s * o;
        } else if ("YZX" === t.order) {
            const t = s * o, i = s * l, n = a * o, r = a * l;
            e[0] = o * h, e[4] = r - t * c, e[8] = n * c + i, e[1] = c, e[5] = s * h, e[9] = -a * h, 
            e[2] = -l * h, e[6] = i * c + n, e[10] = t - r * c;
        } else if ("XZY" === t.order) {
            const t = s * o, i = s * l, n = a * o, r = a * l;
            e[0] = o * h, e[4] = -c, e[8] = l * h, e[1] = t * c + r, e[5] = s * h, e[9] = i * c - n, 
            e[2] = n * c - i, e[6] = a * h, e[10] = r * c + t;
        }
        return e[3] = 0, e[7] = 0, e[11] = 0, e[12] = 0, e[13] = 0, e[14] = 0, e[15] = 1, 
        this;
    }
    makeRotationFromQuaternion(t) {
        return this.compose(It, t, Ut);
    }
    lookAt(t, e, i) {
        const n = this.elements;
        return Ot.subVectors(t, e), 0 === Ot.lengthSq() && (Ot.z = 1), Ot.normalize(), Nt.crossVectors(i, Ot), 
        0 === Nt.lengthSq() && (1 === Math.abs(i.z) ? Ot.x += 1e-4 : Ot.z += 1e-4, Ot.normalize(), 
        Nt.crossVectors(i, Ot)), Nt.normalize(), Bt.crossVectors(Ot, Nt), n[0] = Nt.x, n[4] = Bt.x, 
        n[8] = Ot.x, n[1] = Nt.y, n[5] = Bt.y, n[9] = Ot.y, n[2] = Nt.z, n[6] = Bt.z, n[10] = Ot.z, 
        this;
    }
    multiply(t) {
        return this.multiplyMatrices(this, t);
    }
    premultiply(t) {
        return this.multiplyMatrices(t, this);
    }
    multiplyMatrices(t, e) {
        const i = t.elements, n = e.elements, r = this.elements, s = i[0], a = i[4], o = i[8], l = i[12], h = i[1], c = i[5], d = i[9], u = i[13], p = i[2], g = i[6], f = i[10], m = i[14], v = i[3], _ = i[7], x = i[11], y = i[15], b = n[0], S = n[4], w = n[8], M = n[12], T = n[1], E = n[5], A = n[9], C = n[13], P = n[2], R = n[6], L = n[10], D = n[14], I = n[3], U = n[7], N = n[11], B = n[15];
        return r[0] = s * b + a * T + o * P + l * I, r[4] = s * S + a * E + o * R + l * U, 
        r[8] = s * w + a * A + o * L + l * N, r[12] = s * M + a * C + o * D + l * B, r[1] = h * b + c * T + d * P + u * I, 
        r[5] = h * S + c * E + d * R + u * U, r[9] = h * w + c * A + d * L + u * N, r[13] = h * M + c * C + d * D + u * B, 
        r[2] = p * b + g * T + f * P + m * I, r[6] = p * S + g * E + f * R + m * U, r[10] = p * w + g * A + f * L + m * N, 
        r[14] = p * M + g * C + f * D + m * B, r[3] = v * b + _ * T + x * P + y * I, r[7] = v * S + _ * E + x * R + y * U, 
        r[11] = v * w + _ * A + x * L + y * N, r[15] = v * M + _ * C + x * D + y * B, this;
    }
    multiplyScalar(t) {
        const e = this.elements;
        return e[0] *= t, e[4] *= t, e[8] *= t, e[12] *= t, e[1] *= t, e[5] *= t, e[9] *= t, 
        e[13] *= t, e[2] *= t, e[6] *= t, e[10] *= t, e[14] *= t, e[3] *= t, e[7] *= t, 
        e[11] *= t, e[15] *= t, this;
    }
    determinant() {
        const t = this.elements, e = t[0], i = t[4], n = t[8], r = t[12], s = t[1], a = t[5], o = t[9], l = t[13], h = t[2], c = t[6], d = t[10], u = t[14];
        return t[3] * (+r * o * c - n * l * c - r * a * d + i * l * d + n * a * u - i * o * u) + t[7] * (+e * o * u - e * l * d + r * s * d - n * s * u + n * l * h - r * o * h) + t[11] * (+e * l * c - e * a * u - r * s * c + i * s * u + r * a * h - i * l * h) + t[15] * (-n * a * h - e * o * c + e * a * d + n * s * c - i * s * d + i * o * h);
    }
    transpose() {
        const t = this.elements;
        let e;
        return e = t[1], t[1] = t[4], t[4] = e, e = t[2], t[2] = t[8], t[8] = e, e = t[6], 
        t[6] = t[9], t[9] = e, e = t[3], t[3] = t[12], t[12] = e, e = t[7], t[7] = t[13], 
        t[13] = e, e = t[11], t[11] = t[14], t[14] = e, this;
    }
    setPosition(t, e, i) {
        const n = this.elements;
        return t.isVector3 ? (n[12] = t.x, n[13] = t.y, n[14] = t.z) : (n[12] = t, n[13] = e, 
        n[14] = i), this;
    }
    invert() {
        const t = this.elements, e = t[0], i = t[1], n = t[2], r = t[3], s = t[4], a = t[5], o = t[6], l = t[7], h = t[8], c = t[9], d = t[10], u = t[11], p = t[12], g = t[13], f = t[14], m = t[15], v = c * f * l - g * d * l + g * o * u - a * f * u - c * o * m + a * d * m, _ = p * d * l - h * f * l - p * o * u + s * f * u + h * o * m - s * d * m, x = h * g * l - p * c * l + p * a * u - s * g * u - h * a * m + s * c * m, y = p * c * o - h * g * o - p * a * d + s * g * d + h * a * f - s * c * f, b = e * v + i * _ + n * x + r * y;
        if (0 === b) return this.set(0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0);
        const S = 1 / b;
        return t[0] = v * S, t[1] = (g * d * r - c * f * r - g * n * u + i * f * u + c * n * m - i * d * m) * S, 
        t[2] = (a * f * r - g * o * r + g * n * l - i * f * l - a * n * m + i * o * m) * S, 
        t[3] = (c * o * r - a * d * r - c * n * l + i * d * l + a * n * u - i * o * u) * S, 
        t[4] = _ * S, t[5] = (h * f * r - p * d * r + p * n * u - e * f * u - h * n * m + e * d * m) * S, 
        t[6] = (p * o * r - s * f * r - p * n * l + e * f * l + s * n * m - e * o * m) * S, 
        t[7] = (s * d * r - h * o * r + h * n * l - e * d * l - s * n * u + e * o * u) * S, 
        t[8] = x * S, t[9] = (p * c * r - h * g * r - p * i * u + e * g * u + h * i * m - e * c * m) * S, 
        t[10] = (s * g * r - p * a * r + p * i * l - e * g * l - s * i * m + e * a * m) * S, 
        t[11] = (h * a * r - s * c * r - h * i * l + e * c * l + s * i * u - e * a * u) * S, 
        t[12] = y * S, t[13] = (h * g * n - p * c * n + p * i * d - e * g * d - h * i * f + e * c * f) * S, 
        t[14] = (p * a * n - s * g * n - p * i * o + e * g * o + s * i * f - e * a * f) * S, 
        t[15] = (s * c * n - h * a * n + h * i * o - e * c * o - s * i * d + e * a * d) * S, 
        this;
    }
    scale(t) {
        const e = this.elements, i = t.x, n = t.y, r = t.z;
        return e[0] *= i, e[4] *= n, e[8] *= r, e[1] *= i, e[5] *= n, e[9] *= r, e[2] *= i, 
        e[6] *= n, e[10] *= r, e[3] *= i, e[7] *= n, e[11] *= r, this;
    }
    getMaxScaleOnAxis() {
        const t = this.elements, e = t[0] * t[0] + t[1] * t[1] + t[2] * t[2], i = t[4] * t[4] + t[5] * t[5] + t[6] * t[6], n = t[8] * t[8] + t[9] * t[9] + t[10] * t[10];
        return Math.sqrt(Math.max(e, i, n));
    }
    makeTranslation(t, e, i) {
        return this.set(1, 0, 0, t, 0, 1, 0, e, 0, 0, 1, i, 0, 0, 0, 1), this;
    }
    makeRotationX(t) {
        const e = Math.cos(t), i = Math.sin(t);
        return this.set(1, 0, 0, 0, 0, e, -i, 0, 0, i, e, 0, 0, 0, 0, 1), this;
    }
    makeRotationY(t) {
        const e = Math.cos(t), i = Math.sin(t);
        return this.set(e, 0, i, 0, 0, 1, 0, 0, -i, 0, e, 0, 0, 0, 0, 1), this;
    }
    makeRotationZ(t) {
        const e = Math.cos(t), i = Math.sin(t);
        return this.set(e, -i, 0, 0, i, e, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1), this;
    }
    makeRotationAxis(t, e) {
        const i = Math.cos(e), n = Math.sin(e), r = 1 - i, s = t.x, a = t.y, o = t.z, l = r * s, h = r * a;
        return this.set(l * s + i, l * a - n * o, l * o + n * a, 0, l * a + n * o, h * a + i, h * o - n * s, 0, l * o - n * a, h * o + n * s, r * o * o + i, 0, 0, 0, 0, 1), 
        this;
    }
    makeScale(t, e, i) {
        return this.set(t, 0, 0, 0, 0, e, 0, 0, 0, 0, i, 0, 0, 0, 0, 1), this;
    }
    makeShear(t, e, i, n, r, s) {
        return this.set(1, i, r, 0, t, 1, s, 0, e, n, 1, 0, 0, 0, 0, 1), this;
    }
    compose(t, e, i) {
        const n = this.elements, r = e._x, s = e._y, a = e._z, o = e._w, l = r + r, h = s + s, c = a + a, d = r * l, u = r * h, p = r * c, g = s * h, f = s * c, m = a * c, v = o * l, _ = o * h, x = o * c, y = i.x, b = i.y, S = i.z;
        return n[0] = (1 - (g + m)) * y, n[1] = (u + x) * y, n[2] = (p - _) * y, n[3] = 0, 
        n[4] = (u - x) * b, n[5] = (1 - (d + m)) * b, n[6] = (f + v) * b, n[7] = 0, n[8] = (p + _) * S, 
        n[9] = (f - v) * S, n[10] = (1 - (d + g)) * S, n[11] = 0, n[12] = t.x, n[13] = t.y, 
        n[14] = t.z, n[15] = 1, this;
    }
    decompose(t, e, i) {
        const n = this.elements;
        let r = Lt.set(n[0], n[1], n[2]).length();
        const s = Lt.set(n[4], n[5], n[6]).length(), a = Lt.set(n[8], n[9], n[10]).length();
        this.determinant() < 0 && (r = -r), t.x = n[12], t.y = n[13], t.z = n[14], Dt.copy(this);
        const o = 1 / r, l = 1 / s, h = 1 / a;
        return Dt.elements[0] *= o, Dt.elements[1] *= o, Dt.elements[2] *= o, Dt.elements[4] *= l, 
        Dt.elements[5] *= l, Dt.elements[6] *= l, Dt.elements[8] *= h, Dt.elements[9] *= h, 
        Dt.elements[10] *= h, e.setFromRotationMatrix(Dt), i.x = r, i.y = s, i.z = a, this;
    }
    makePerspective(t, e, i, n, r, s) {
        const a = this.elements, o = 2 * r / (e - t), l = 2 * r / (i - n), h = (e + t) / (e - t), c = (i + n) / (i - n), d = -(s + r) / (s - r), u = -2 * s * r / (s - r);
        return a[0] = o, a[4] = 0, a[8] = h, a[12] = 0, a[1] = 0, a[5] = l, a[9] = c, a[13] = 0, 
        a[2] = 0, a[6] = 0, a[10] = d, a[14] = u, a[3] = 0, a[7] = 0, a[11] = -1, a[15] = 0, 
        this;
    }
    makeOrthographic(t, e, i, n, r, s) {
        const a = this.elements, o = 1 / (e - t), l = 1 / (i - n), h = 1 / (s - r), c = (e + t) * o, d = (i + n) * l, u = (s + r) * h;
        return a[0] = 2 * o, a[4] = 0, a[8] = 0, a[12] = -c, a[1] = 0, a[5] = 2 * l, a[9] = 0, 
        a[13] = -d, a[2] = 0, a[6] = 0, a[10] = -2 * h, a[14] = -u, a[3] = 0, a[7] = 0, 
        a[11] = 0, a[15] = 1, this;
    }
    equals(t) {
        const e = this.elements, i = t.elements;
        for (let t = 0; t < 16; t++) if (e[t] !== i[t]) return !1;
        return !0;
    }
    fromArray(t, e = 0) {
        for (let i = 0; i < 16; i++) this.elements[i] = t[i + e];
        return this;
    }
    toArray(t = [], e = 0) {
        const i = this.elements;
        return t[e] = i[0], t[e + 1] = i[1], t[e + 2] = i[2], t[e + 3] = i[3], t[e + 4] = i[4], 
        t[e + 5] = i[5], t[e + 6] = i[6], t[e + 7] = i[7], t[e + 8] = i[8], t[e + 9] = i[9], 
        t[e + 10] = i[10], t[e + 11] = i[11], t[e + 12] = i[12], t[e + 13] = i[13], t[e + 14] = i[14], 
        t[e + 15] = i[15], t;
    }
}

const Lt = new tt, Dt = new Rt, It = new tt(0, 0, 0), Ut = new tt(1, 1, 1), Nt = new tt, Bt = new tt, Ot = new tt, Ft = new Rt, kt = new $;

class Ht {
    constructor(t = 0, e = 0, i = 0, n = Ht.DEFAULT_ORDER) {
        this.isEuler = !0, this._x = t, this._y = e, this._z = i, this._order = n;
    }
    get x() {
        return this._x;
    }
    set x(t) {
        this._x = t, this._onChangeCallback();
    }
    get y() {
        return this._y;
    }
    set y(t) {
        this._y = t, this._onChangeCallback();
    }
    get z() {
        return this._z;
    }
    set z(t) {
        this._z = t, this._onChangeCallback();
    }
    get order() {
        return this._order;
    }
    set order(t) {
        this._order = t, this._onChangeCallback();
    }
    set(t, e, i, n = this._order) {
        return this._x = t, this._y = e, this._z = i, this._order = n, this._onChangeCallback(), 
        this;
    }
    clone() {
        return new this.constructor(this._x, this._y, this._z, this._order);
    }
    copy(t) {
        return this._x = t._x, this._y = t._y, this._z = t._z, this._order = t._order, this._onChangeCallback(), 
        this;
    }
    setFromRotationMatrix(t, e = this._order, i = !0) {
        const n = t.elements, r = n[0], s = n[4], a = n[8], o = n[1], l = n[5], h = n[9], c = n[2], d = n[6], u = n[10];
        switch (e) {
          case "XYZ":
            this._y = Math.asin(y(a, -1, 1)), Math.abs(a) < .9999999 ? (this._x = Math.atan2(-h, u), 
            this._z = Math.atan2(-s, r)) : (this._x = Math.atan2(d, l), this._z = 0);
            break;

          case "YXZ":
            this._x = Math.asin(-y(h, -1, 1)), Math.abs(h) < .9999999 ? (this._y = Math.atan2(a, u), 
            this._z = Math.atan2(o, l)) : (this._y = Math.atan2(-c, r), this._z = 0);
            break;

          case "ZXY":
            this._x = Math.asin(y(d, -1, 1)), Math.abs(d) < .9999999 ? (this._y = Math.atan2(-c, u), 
            this._z = Math.atan2(-s, l)) : (this._y = 0, this._z = Math.atan2(o, r));
            break;

          case "ZYX":
            this._y = Math.asin(-y(c, -1, 1)), Math.abs(c) < .9999999 ? (this._x = Math.atan2(d, u), 
            this._z = Math.atan2(o, r)) : (this._x = 0, this._z = Math.atan2(-s, l));
            break;

          case "YZX":
            this._z = Math.asin(y(o, -1, 1)), Math.abs(o) < .9999999 ? (this._x = Math.atan2(-h, l), 
            this._y = Math.atan2(-c, r)) : (this._x = 0, this._y = Math.atan2(a, u));
            break;

          case "XZY":
            this._z = Math.asin(-y(s, -1, 1)), Math.abs(s) < .9999999 ? (this._x = Math.atan2(d, l), 
            this._y = Math.atan2(a, r)) : (this._x = Math.atan2(-h, u), this._y = 0);
            break;

          default:
            console.warn("THREE.Euler: .setFromRotationMatrix() encountered an unknown order: " + e);
        }
        return this._order = e, !0 === i && this._onChangeCallback(), this;
    }
    setFromQuaternion(t, e, i) {
        return Ft.makeRotationFromQuaternion(t), this.setFromRotationMatrix(Ft, e, i);
    }
    setFromVector3(t, e = this._order) {
        return this.set(t.x, t.y, t.z, e);
    }
    reorder(t) {
        return kt.setFromEuler(this), this.setFromQuaternion(kt, t);
    }
    equals(t) {
        return t._x === this._x && t._y === this._y && t._z === this._z && t._order === this._order;
    }
    fromArray(t) {
        return this._x = t[0], this._y = t[1], this._z = t[2], void 0 !== t[3] && (this._order = t[3]), 
        this._onChangeCallback(), this;
    }
    toArray(t = [], e = 0) {
        return t[e] = this._x, t[e + 1] = this._y, t[e + 2] = this._z, t[e + 3] = this._order, 
        t;
    }
    _onChange(t) {
        return this._onChangeCallback = t, this;
    }
    _onChangeCallback() {}
    * [Symbol.iterator]() {
        yield this._x, yield this._y, yield this._z, yield this._order;
    }
}

Ht.DEFAULT_ORDER = "XYZ";

class zt {
    constructor() {
        this.mask = 1;
    }
    set(t) {
        this.mask = (1 << t | 0) >>> 0;
    }
    enable(t) {
        this.mask |= 1 << t | 0;
    }
    enableAll() {
        this.mask = -1;
    }
    toggle(t) {
        this.mask ^= 1 << t | 0;
    }
    disable(t) {
        this.mask &= ~(1 << t | 0);
    }
    disableAll() {
        this.mask = 0;
    }
    test(t) {
        return 0 != (this.mask & t.mask);
    }
    isEnabled(t) {
        return 0 != (this.mask & (1 << t | 0));
    }
}

let Gt = 0;

const Vt = new tt, Wt = new $, jt = new Rt, Xt = new tt, qt = new tt, Kt = new tt, Yt = new $, Zt = new tt(1, 0, 0), Jt = new tt(0, 1, 0), Qt = new tt(0, 0, 1), $t = {
    type: "added"
}, te = {
    type: "removed"
};

class ee extends g {
    constructor() {
        super(), this.isObject3D = !0, Object.defineProperty(this, "id", {
            value: Gt++
        }), this.uuid = x(), this.name = "", this.type = "Object3D", this.parent = null, 
        this.children = [], this.up = ee.DEFAULT_UP.clone();
        const t = new tt, e = new Ht, i = new $, n = new tt(1, 1, 1);
        e._onChange((function() {
            i.setFromEuler(e, !1);
        })), i._onChange((function() {
            e.setFromQuaternion(i, void 0, !1);
        })), Object.defineProperties(this, {
            position: {
                configurable: !0,
                enumerable: !0,
                value: t
            },
            rotation: {
                configurable: !0,
                enumerable: !0,
                value: e
            },
            quaternion: {
                configurable: !0,
                enumerable: !0,
                value: i
            },
            scale: {
                configurable: !0,
                enumerable: !0,
                value: n
            },
            modelViewMatrix: {
                value: new Rt
            },
            normalMatrix: {
                value: new R
            }
        }), this.matrix = new Rt, this.matrixWorld = new Rt, this.matrixAutoUpdate = ee.DEFAULT_MATRIX_AUTO_UPDATE, 
        this.matrixWorldNeedsUpdate = !1, this.matrixWorldAutoUpdate = ee.DEFAULT_MATRIX_WORLD_AUTO_UPDATE, 
        this.layers = new zt, this.visible = !0, this.castShadow = !1, this.receiveShadow = !1, 
        this.frustumCulled = !0, this.renderOrder = 0, this.animations = [], this.userData = {};
    }
    onBeforeRender() {}
    onAfterRender() {}
    applyMatrix4(t) {
        this.matrixAutoUpdate && this.updateMatrix(), this.matrix.premultiply(t), this.matrix.decompose(this.position, this.quaternion, this.scale);
    }
    applyQuaternion(t) {
        return this.quaternion.premultiply(t), this;
    }
    setRotationFromAxisAngle(t, e) {
        this.quaternion.setFromAxisAngle(t, e);
    }
    setRotationFromEuler(t) {
        this.quaternion.setFromEuler(t, !0);
    }
    setRotationFromMatrix(t) {
        this.quaternion.setFromRotationMatrix(t);
    }
    setRotationFromQuaternion(t) {
        this.quaternion.copy(t);
    }
    rotateOnAxis(t, e) {
        return Wt.setFromAxisAngle(t, e), this.quaternion.multiply(Wt), this;
    }
    rotateOnWorldAxis(t, e) {
        return Wt.setFromAxisAngle(t, e), this.quaternion.premultiply(Wt), this;
    }
    rotateX(t) {
        return this.rotateOnAxis(Zt, t);
    }
    rotateY(t) {
        return this.rotateOnAxis(Jt, t);
    }
    rotateZ(t) {
        return this.rotateOnAxis(Qt, t);
    }
    translateOnAxis(t, e) {
        return Vt.copy(t).applyQuaternion(this.quaternion), this.position.add(Vt.multiplyScalar(e)), 
        this;
    }
    translateX(t) {
        return this.translateOnAxis(Zt, t);
    }
    translateY(t) {
        return this.translateOnAxis(Jt, t);
    }
    translateZ(t) {
        return this.translateOnAxis(Qt, t);
    }
    localToWorld(t) {
        return this.updateWorldMatrix(!0, !1), t.applyMatrix4(this.matrixWorld);
    }
    worldToLocal(t) {
        return this.updateWorldMatrix(!0, !1), t.applyMatrix4(jt.copy(this.matrixWorld).invert());
    }
    lookAt(t, e, i) {
        t.isVector3 ? Xt.copy(t) : Xt.set(t, e, i);
        const n = this.parent;
        this.updateWorldMatrix(!0, !1), qt.setFromMatrixPosition(this.matrixWorld), this.isCamera || this.isLight ? jt.lookAt(qt, Xt, this.up) : jt.lookAt(Xt, qt, this.up), 
        this.quaternion.setFromRotationMatrix(jt), n && (jt.extractRotation(n.matrixWorld), 
        Wt.setFromRotationMatrix(jt), this.quaternion.premultiply(Wt.invert()));
    }
    add(t) {
        if (arguments.length > 1) {
            for (let t = 0; t < arguments.length; t++) this.add(arguments[t]);
            return this;
        }
        return t === this ? (console.error("THREE.Object3D.add: object can't be added as a child of itself.", t), 
        this) : (t && t.isObject3D ? (null !== t.parent && t.parent.remove(t), t.parent = this, 
        this.children.push(t), t.dispatchEvent($t)) : console.error("THREE.Object3D.add: object not an instance of THREE.Object3D.", t), 
        this);
    }
    remove(t) {
        if (arguments.length > 1) {
            for (let t = 0; t < arguments.length; t++) this.remove(arguments[t]);
            return this;
        }
        const e = this.children.indexOf(t);
        return -1 !== e && (t.parent = null, this.children.splice(e, 1), t.dispatchEvent(te)), 
        this;
    }
    removeFromParent() {
        const t = this.parent;
        return null !== t && t.remove(this), this;
    }
    clear() {
        for (let t = 0; t < this.children.length; t++) {
            const e = this.children[t];
            e.parent = null, e.dispatchEvent(te);
        }
        return this.children.length = 0, this;
    }
    attach(t) {
        return this.updateWorldMatrix(!0, !1), jt.copy(this.matrixWorld).invert(), null !== t.parent && (t.parent.updateWorldMatrix(!0, !1), 
        jt.multiply(t.parent.matrixWorld)), t.applyMatrix4(jt), this.add(t), t.updateWorldMatrix(!1, !0), 
        this;
    }
    getObjectById(t) {
        return this.getObjectByProperty("id", t);
    }
    getObjectByName(t) {
        return this.getObjectByProperty("name", t);
    }
    getObjectByProperty(t, e) {
        if (this[t] === e) return this;
        for (let i = 0, n = this.children.length; i < n; i++) {
            const n = this.children[i].getObjectByProperty(t, e);
            if (void 0 !== n) return n;
        }
    }
    getObjectsByProperty(t, e) {
        let i = [];
        this[t] === e && i.push(this);
        for (let n = 0, r = this.children.length; n < r; n++) {
            const r = this.children[n].getObjectsByProperty(t, e);
            r.length > 0 && (i = i.concat(r));
        }
        return i;
    }
    getWorldPosition(t) {
        return this.updateWorldMatrix(!0, !1), t.setFromMatrixPosition(this.matrixWorld);
    }
    getWorldQuaternion(t) {
        return this.updateWorldMatrix(!0, !1), this.matrixWorld.decompose(qt, t, Kt), t;
    }
    getWorldScale(t) {
        return this.updateWorldMatrix(!0, !1), this.matrixWorld.decompose(qt, Yt, t), t;
    }
    getWorldDirection(t) {
        this.updateWorldMatrix(!0, !1);
        const e = this.matrixWorld.elements;
        return t.set(e[8], e[9], e[10]).normalize();
    }
    raycast() {}
    traverse(t) {
        t(this);
        const e = this.children;
        for (let i = 0, n = e.length; i < n; i++) e[i].traverse(t);
    }
    traverseVisible(t) {
        if (!1 === this.visible) return;
        t(this);
        const e = this.children;
        for (let i = 0, n = e.length; i < n; i++) e[i].traverseVisible(t);
    }
    traverseAncestors(t) {
        const e = this.parent;
        null !== e && (t(e), e.traverseAncestors(t));
    }
    updateMatrix() {
        this.matrix.compose(this.position, this.quaternion, this.scale), this.matrixWorldNeedsUpdate = !0;
    }
    updateMatrixWorld(t) {
        this.matrixAutoUpdate && this.updateMatrix(), (this.matrixWorldNeedsUpdate || t) && (null === this.parent ? this.matrixWorld.copy(this.matrix) : this.matrixWorld.multiplyMatrices(this.parent.matrixWorld, this.matrix), 
        this.matrixWorldNeedsUpdate = !1, t = !0);
        const e = this.children;
        for (let i = 0, n = e.length; i < n; i++) {
            const n = e[i];
            !0 !== n.matrixWorldAutoUpdate && !0 !== t || n.updateMatrixWorld(t);
        }
    }
    updateWorldMatrix(t, e) {
        const i = this.parent;
        if (!0 === t && null !== i && !0 === i.matrixWorldAutoUpdate && i.updateWorldMatrix(!0, !1), 
        this.matrixAutoUpdate && this.updateMatrix(), null === this.parent ? this.matrixWorld.copy(this.matrix) : this.matrixWorld.multiplyMatrices(this.parent.matrixWorld, this.matrix), 
        !0 === e) {
            const t = this.children;
            for (let e = 0, i = t.length; e < i; e++) {
                const i = t[e];
                !0 === i.matrixWorldAutoUpdate && i.updateWorldMatrix(!1, !0);
            }
        }
    }
    toJSON(t) {
        const e = void 0 === t || "string" == typeof t, i = {};
        e && (t = {
            geometries: {},
            materials: {},
            textures: {},
            images: {},
            shapes: {},
            skeletons: {},
            animations: {},
            nodes: {}
        }, i.metadata = {
            version: 4.5,
            type: "Object",
            generator: "Object3D.toJSON"
        });
        const n = {};
        function r(e, i) {
            return void 0 === e[i.uuid] && (e[i.uuid] = i.toJSON(t)), i.uuid;
        }
        if (n.uuid = this.uuid, n.type = this.type, "" !== this.name && (n.name = this.name), 
        !0 === this.castShadow && (n.castShadow = !0), !0 === this.receiveShadow && (n.receiveShadow = !0), 
        !1 === this.visible && (n.visible = !1), !1 === this.frustumCulled && (n.frustumCulled = !1), 
        0 !== this.renderOrder && (n.renderOrder = this.renderOrder), Object.keys(this.userData).length > 0 && (n.userData = this.userData), 
        n.layers = this.layers.mask, n.matrix = this.matrix.toArray(), n.up = this.up.toArray(), 
        !1 === this.matrixAutoUpdate && (n.matrixAutoUpdate = !1), this.isInstancedMesh && (n.type = "InstancedMesh", 
        n.count = this.count, n.instanceMatrix = this.instanceMatrix.toJSON(), null !== this.instanceColor && (n.instanceColor = this.instanceColor.toJSON())), 
        this.isScene) this.background && (this.background.isColor ? n.background = this.background.toJSON() : this.background.isTexture && (n.background = this.background.toJSON(t).uuid)), 
        this.environment && this.environment.isTexture && !0 !== this.environment.isRenderTargetTexture && (n.environment = this.environment.toJSON(t).uuid); else if (this.isMesh || this.isLine || this.isPoints) {
            n.geometry = r(t.geometries, this.geometry);
            const e = this.geometry.parameters;
            if (void 0 !== e && void 0 !== e.shapes) {
                const i = e.shapes;
                if (Array.isArray(i)) for (let e = 0, n = i.length; e < n; e++) {
                    const n = i[e];
                    r(t.shapes, n);
                } else r(t.shapes, i);
            }
        }
        if (this.isSkinnedMesh && (n.bindMode = this.bindMode, n.bindMatrix = this.bindMatrix.toArray(), 
        void 0 !== this.skeleton && (r(t.skeletons, this.skeleton), n.skeleton = this.skeleton.uuid)), 
        void 0 !== this.material) if (Array.isArray(this.material)) {
            const e = [];
            for (let i = 0, n = this.material.length; i < n; i++) e.push(r(t.materials, this.material[i]));
            n.material = e;
        } else n.material = r(t.materials, this.material);
        if (this.children.length > 0) {
            n.children = [];
            for (let e = 0; e < this.children.length; e++) n.children.push(this.children[e].toJSON(t).object);
        }
        if (this.animations.length > 0) {
            n.animations = [];
            for (let e = 0; e < this.animations.length; e++) {
                const i = this.animations[e];
                n.animations.push(r(t.animations, i));
            }
        }
        if (e) {
            const e = s(t.geometries), n = s(t.materials), r = s(t.textures), a = s(t.images), o = s(t.shapes), l = s(t.skeletons), h = s(t.animations), c = s(t.nodes);
            e.length > 0 && (i.geometries = e), n.length > 0 && (i.materials = n), r.length > 0 && (i.textures = r), 
            a.length > 0 && (i.images = a), o.length > 0 && (i.shapes = o), l.length > 0 && (i.skeletons = l), 
            h.length > 0 && (i.animations = h), c.length > 0 && (i.nodes = c);
        }
        return i.object = n, i;
        function s(t) {
            const e = [];
            for (const i in t) {
                const n = t[i];
                delete n.metadata, e.push(n);
            }
            return e;
        }
    }
    clone(t) {
        return (new this.constructor).copy(this, t);
    }
    copy(t, e = !0) {
        if (this.name = t.name, this.up.copy(t.up), this.position.copy(t.position), this.rotation.order = t.rotation.order, 
        this.quaternion.copy(t.quaternion), this.scale.copy(t.scale), this.matrix.copy(t.matrix), 
        this.matrixWorld.copy(t.matrixWorld), this.matrixAutoUpdate = t.matrixAutoUpdate, 
        this.matrixWorldNeedsUpdate = t.matrixWorldNeedsUpdate, this.matrixWorldAutoUpdate = t.matrixWorldAutoUpdate, 
        this.layers.mask = t.layers.mask, this.visible = t.visible, this.castShadow = t.castShadow, 
        this.receiveShadow = t.receiveShadow, this.frustumCulled = t.frustumCulled, this.renderOrder = t.renderOrder, 
        this.animations = t.animations, this.userData = JSON.parse(JSON.stringify(t.userData)), 
        !0 === e) for (let e = 0; e < t.children.length; e++) {
            const i = t.children[e];
            this.add(i.clone());
        }
        return this;
    }
}

ee.DEFAULT_UP = new tt(0, 1, 0), ee.DEFAULT_MATRIX_AUTO_UPDATE = !0, ee.DEFAULT_MATRIX_WORLD_AUTO_UPDATE = !0;

const ie = new tt, ne = new tt, re = new tt, se = new tt, ae = new tt, oe = new tt, le = new tt, he = new tt, ce = new tt, de = new tt;

let ue = !1;

class pe {
    constructor(t = new tt, e = new tt, i = new tt) {
        this.a = t, this.b = e, this.c = i;
    }
    static getNormal(t, e, i, n) {
        n.subVectors(i, e), ie.subVectors(t, e), n.cross(ie);
        const r = n.lengthSq();
        return r > 0 ? n.multiplyScalar(1 / Math.sqrt(r)) : n.set(0, 0, 0);
    }
    static getBarycoord(t, e, i, n, r) {
        ie.subVectors(n, e), ne.subVectors(i, e), re.subVectors(t, e);
        const s = ie.dot(ie), a = ie.dot(ne), o = ie.dot(re), l = ne.dot(ne), h = ne.dot(re), c = s * l - a * a;
        if (0 === c) return r.set(-2, -1, -1);
        const d = 1 / c, u = (l * o - a * h) * d, p = (s * h - a * o) * d;
        return r.set(1 - u - p, p, u);
    }
    static containsPoint(t, e, i, n) {
        return this.getBarycoord(t, e, i, n, se), se.x >= 0 && se.y >= 0 && se.x + se.y <= 1;
    }
    static getUV(t, e, i, n, r, s, a, o) {
        return !1 === ue && (console.warn("THREE.Triangle.getUV() has been renamed to THREE.Triangle.getInterpolation()."), 
        ue = !0), this.getInterpolation(t, e, i, n, r, s, a, o);
    }
    static getInterpolation(t, e, i, n, r, s, a, o) {
        return this.getBarycoord(t, e, i, n, se), o.setScalar(0), o.addScaledVector(r, se.x), 
        o.addScaledVector(s, se.y), o.addScaledVector(a, se.z), o;
    }
    static isFrontFacing(t, e, i, n) {
        return ie.subVectors(i, e), ne.subVectors(t, e), ie.cross(ne).dot(n) < 0;
    }
    set(t, e, i) {
        return this.a.copy(t), this.b.copy(e), this.c.copy(i), this;
    }
    setFromPointsAndIndices(t, e, i, n) {
        return this.a.copy(t[e]), this.b.copy(t[i]), this.c.copy(t[n]), this;
    }
    setFromAttributeAndIndices(t, e, i, n) {
        return this.a.fromBufferAttribute(t, e), this.b.fromBufferAttribute(t, i), this.c.fromBufferAttribute(t, n), 
        this;
    }
    clone() {
        return (new this.constructor).copy(this);
    }
    copy(t) {
        return this.a.copy(t.a), this.b.copy(t.b), this.c.copy(t.c), this;
    }
    getArea() {
        return ie.subVectors(this.c, this.b), ne.subVectors(this.a, this.b), .5 * ie.cross(ne).length();
    }
    getMidpoint(t) {
        return t.addVectors(this.a, this.b).add(this.c).multiplyScalar(1 / 3);
    }
    getNormal(t) {
        return pe.getNormal(this.a, this.b, this.c, t);
    }
    getPlane(t) {
        return t.setFromCoplanarPoints(this.a, this.b, this.c);
    }
    getBarycoord(t, e) {
        return pe.getBarycoord(t, this.a, this.b, this.c, e);
    }
    getUV(t, e, i, n, r) {
        return !1 === ue && (console.warn("THREE.Triangle.getUV() has been renamed to THREE.Triangle.getInterpolation()."), 
        ue = !0), pe.getInterpolation(t, this.a, this.b, this.c, e, i, n, r);
    }
    getInterpolation(t, e, i, n, r) {
        return pe.getInterpolation(t, this.a, this.b, this.c, e, i, n, r);
    }
    containsPoint(t) {
        return pe.containsPoint(t, this.a, this.b, this.c);
    }
    isFrontFacing(t) {
        return pe.isFrontFacing(this.a, this.b, this.c, t);
    }
    intersectsBox(t) {
        return t.intersectsTriangle(this);
    }
    closestPointToPoint(t, e) {
        const i = this.a, n = this.b, r = this.c;
        let s, a;
        ae.subVectors(n, i), oe.subVectors(r, i), he.subVectors(t, i);
        const o = ae.dot(he), l = oe.dot(he);
        if (o <= 0 && l <= 0) return e.copy(i);
        ce.subVectors(t, n);
        const h = ae.dot(ce), c = oe.dot(ce);
        if (h >= 0 && c <= h) return e.copy(n);
        const d = o * c - h * l;
        if (d <= 0 && o >= 0 && h <= 0) return s = o / (o - h), e.copy(i).addScaledVector(ae, s);
        de.subVectors(t, r);
        const u = ae.dot(de), p = oe.dot(de);
        if (p >= 0 && u <= p) return e.copy(r);
        const g = u * l - o * p;
        if (g <= 0 && l >= 0 && p <= 0) return a = l / (l - p), e.copy(i).addScaledVector(oe, a);
        const f = h * p - u * c;
        if (f <= 0 && c - h >= 0 && u - p >= 0) return le.subVectors(r, n), a = (c - h) / (c - h + (u - p)), 
        e.copy(n).addScaledVector(le, a);
        const m = 1 / (f + g + d);
        return s = g * m, a = d * m, e.copy(i).addScaledVector(ae, s).addScaledVector(oe, a);
    }
    equals(t) {
        return t.a.equals(this.a) && t.b.equals(this.b) && t.c.equals(this.c);
    }
}

let ge = 0;

class fe extends g {
    constructor() {
        super(), this.isMaterial = !0, Object.defineProperty(this, "id", {
            value: ge++
        }), this.uuid = x(), this.name = "", this.type = "Material", this.blending = 1, 
        this.side = 0, this.vertexColors = !1, this.opacity = 1, this.transparent = !1, 
        this.blendSrc = 204, this.blendDst = 205, this.blendEquation = 100, this.blendSrcAlpha = null, 
        this.blendDstAlpha = null, this.blendEquationAlpha = null, this.depthFunc = 3, this.depthTest = !0, 
        this.depthWrite = !0, this.stencilWriteMask = 255, this.stencilFunc = 519, this.stencilRef = 0, 
        this.stencilFuncMask = 255, this.stencilFail = 7680, this.stencilZFail = 7680, this.stencilZPass = 7680, 
        this.stencilWrite = !1, this.clippingPlanes = null, this.clipIntersection = !1, 
        this.clipShadows = !1, this.shadowSide = null, this.colorWrite = !0, this.precision = null, 
        this.polygonOffset = !1, this.polygonOffsetFactor = 0, this.polygonOffsetUnits = 0, 
        this.dithering = !1, this.alphaToCoverage = !1, this.premultipliedAlpha = !1, this.forceSinglePass = !1, 
        this.visible = !0, this.toneMapped = !0, this.userData = {}, this.version = 0, this._alphaTest = 0;
    }
    get alphaTest() {
        return this._alphaTest;
    }
    set alphaTest(t) {
        this._alphaTest > 0 != t > 0 && this.version++, this._alphaTest = t;
    }
    onBuild() {}
    onBeforeRender() {}
    onBeforeCompile() {}
    customProgramCacheKey() {
        return this.onBeforeCompile.toString();
    }
    setValues(t) {
        if (void 0 !== t) for (const e in t) {
            const i = t[e];
            if (void 0 === i) {
                console.warn(`THREE.Material: parameter '${e}' has value of undefined.`);
                continue;
            }
            const n = this[e];
            void 0 !== n ? n && n.isColor ? n.set(i) : n && n.isVector3 && i && i.isVector3 ? n.copy(i) : this[e] = i : console.warn(`THREE.Material: '${e}' is not a property of THREE.${this.type}.`);
        }
    }
    toJSON(t) {
        const e = void 0 === t || "string" == typeof t;
        e && (t = {
            textures: {},
            images: {}
        });
        const i = {
            metadata: {
                version: 4.5,
                type: "Material",
                generator: "Material.toJSON"
            }
        };
        function n(t) {
            const e = [];
            for (const i in t) {
                const n = t[i];
                delete n.metadata, e.push(n);
            }
            return e;
        }
        if (i.uuid = this.uuid, i.type = this.type, "" !== this.name && (i.name = this.name), 
        this.color && this.color.isColor && (i.color = this.color.getHex()), void 0 !== this.roughness && (i.roughness = this.roughness), 
        void 0 !== this.metalness && (i.metalness = this.metalness), void 0 !== this.sheen && (i.sheen = this.sheen), 
        this.sheenColor && this.sheenColor.isColor && (i.sheenColor = this.sheenColor.getHex()), 
        void 0 !== this.sheenRoughness && (i.sheenRoughness = this.sheenRoughness), this.emissive && this.emissive.isColor && (i.emissive = this.emissive.getHex()), 
        this.emissiveIntensity && 1 !== this.emissiveIntensity && (i.emissiveIntensity = this.emissiveIntensity), 
        this.specular && this.specular.isColor && (i.specular = this.specular.getHex()), 
        void 0 !== this.specularIntensity && (i.specularIntensity = this.specularIntensity), 
        this.specularColor && this.specularColor.isColor && (i.specularColor = this.specularColor.getHex()), 
        void 0 !== this.shininess && (i.shininess = this.shininess), void 0 !== this.clearcoat && (i.clearcoat = this.clearcoat), 
        void 0 !== this.clearcoatRoughness && (i.clearcoatRoughness = this.clearcoatRoughness), 
        this.clearcoatMap && this.clearcoatMap.isTexture && (i.clearcoatMap = this.clearcoatMap.toJSON(t).uuid), 
        this.clearcoatRoughnessMap && this.clearcoatRoughnessMap.isTexture && (i.clearcoatRoughnessMap = this.clearcoatRoughnessMap.toJSON(t).uuid), 
        this.clearcoatNormalMap && this.clearcoatNormalMap.isTexture && (i.clearcoatNormalMap = this.clearcoatNormalMap.toJSON(t).uuid, 
        i.clearcoatNormalScale = this.clearcoatNormalScale.toArray()), void 0 !== this.iridescence && (i.iridescence = this.iridescence), 
        void 0 !== this.iridescenceIOR && (i.iridescenceIOR = this.iridescenceIOR), void 0 !== this.iridescenceThicknessRange && (i.iridescenceThicknessRange = this.iridescenceThicknessRange), 
        this.iridescenceMap && this.iridescenceMap.isTexture && (i.iridescenceMap = this.iridescenceMap.toJSON(t).uuid), 
        this.iridescenceThicknessMap && this.iridescenceThicknessMap.isTexture && (i.iridescenceThicknessMap = this.iridescenceThicknessMap.toJSON(t).uuid), 
        this.map && this.map.isTexture && (i.map = this.map.toJSON(t).uuid), this.matcap && this.matcap.isTexture && (i.matcap = this.matcap.toJSON(t).uuid), 
        this.alphaMap && this.alphaMap.isTexture && (i.alphaMap = this.alphaMap.toJSON(t).uuid), 
        this.lightMap && this.lightMap.isTexture && (i.lightMap = this.lightMap.toJSON(t).uuid, 
        i.lightMapIntensity = this.lightMapIntensity), this.aoMap && this.aoMap.isTexture && (i.aoMap = this.aoMap.toJSON(t).uuid, 
        i.aoMapIntensity = this.aoMapIntensity), this.bumpMap && this.bumpMap.isTexture && (i.bumpMap = this.bumpMap.toJSON(t).uuid, 
        i.bumpScale = this.bumpScale), this.normalMap && this.normalMap.isTexture && (i.normalMap = this.normalMap.toJSON(t).uuid, 
        i.normalMapType = this.normalMapType, i.normalScale = this.normalScale.toArray()), 
        this.displacementMap && this.displacementMap.isTexture && (i.displacementMap = this.displacementMap.toJSON(t).uuid, 
        i.displacementScale = this.displacementScale, i.displacementBias = this.displacementBias), 
        this.roughnessMap && this.roughnessMap.isTexture && (i.roughnessMap = this.roughnessMap.toJSON(t).uuid), 
        this.metalnessMap && this.metalnessMap.isTexture && (i.metalnessMap = this.metalnessMap.toJSON(t).uuid), 
        this.emissiveMap && this.emissiveMap.isTexture && (i.emissiveMap = this.emissiveMap.toJSON(t).uuid), 
        this.specularMap && this.specularMap.isTexture && (i.specularMap = this.specularMap.toJSON(t).uuid), 
        this.specularIntensityMap && this.specularIntensityMap.isTexture && (i.specularIntensityMap = this.specularIntensityMap.toJSON(t).uuid), 
        this.specularColorMap && this.specularColorMap.isTexture && (i.specularColorMap = this.specularColorMap.toJSON(t).uuid), 
        this.envMap && this.envMap.isTexture && (i.envMap = this.envMap.toJSON(t).uuid, 
        void 0 !== this.combine && (i.combine = this.combine)), void 0 !== this.envMapIntensity && (i.envMapIntensity = this.envMapIntensity), 
        void 0 !== this.reflectivity && (i.reflectivity = this.reflectivity), void 0 !== this.refractionRatio && (i.refractionRatio = this.refractionRatio), 
        this.gradientMap && this.gradientMap.isTexture && (i.gradientMap = this.gradientMap.toJSON(t).uuid), 
        void 0 !== this.transmission && (i.transmission = this.transmission), this.transmissionMap && this.transmissionMap.isTexture && (i.transmissionMap = this.transmissionMap.toJSON(t).uuid), 
        void 0 !== this.thickness && (i.thickness = this.thickness), this.thicknessMap && this.thicknessMap.isTexture && (i.thicknessMap = this.thicknessMap.toJSON(t).uuid), 
        void 0 !== this.attenuationDistance && this.attenuationDistance !== 1 / 0 && (i.attenuationDistance = this.attenuationDistance), 
        void 0 !== this.attenuationColor && (i.attenuationColor = this.attenuationColor.getHex()), 
        void 0 !== this.size && (i.size = this.size), null !== this.shadowSide && (i.shadowSide = this.shadowSide), 
        void 0 !== this.sizeAttenuation && (i.sizeAttenuation = this.sizeAttenuation), 1 !== this.blending && (i.blending = this.blending), 
        0 !== this.side && (i.side = this.side), this.vertexColors && (i.vertexColors = !0), 
        this.opacity < 1 && (i.opacity = this.opacity), !0 === this.transparent && (i.transparent = this.transparent), 
        i.depthFunc = this.depthFunc, i.depthTest = this.depthTest, i.depthWrite = this.depthWrite, 
        i.colorWrite = this.colorWrite, i.stencilWrite = this.stencilWrite, i.stencilWriteMask = this.stencilWriteMask, 
        i.stencilFunc = this.stencilFunc, i.stencilRef = this.stencilRef, i.stencilFuncMask = this.stencilFuncMask, 
        i.stencilFail = this.stencilFail, i.stencilZFail = this.stencilZFail, i.stencilZPass = this.stencilZPass, 
        void 0 !== this.rotation && 0 !== this.rotation && (i.rotation = this.rotation), 
        !0 === this.polygonOffset && (i.polygonOffset = !0), 0 !== this.polygonOffsetFactor && (i.polygonOffsetFactor = this.polygonOffsetFactor), 
        0 !== this.polygonOffsetUnits && (i.polygonOffsetUnits = this.polygonOffsetUnits), 
        void 0 !== this.linewidth && 1 !== this.linewidth && (i.linewidth = this.linewidth), 
        void 0 !== this.dashSize && (i.dashSize = this.dashSize), void 0 !== this.gapSize && (i.gapSize = this.gapSize), 
        void 0 !== this.scale && (i.scale = this.scale), !0 === this.dithering && (i.dithering = !0), 
        this.alphaTest > 0 && (i.alphaTest = this.alphaTest), !0 === this.alphaToCoverage && (i.alphaToCoverage = this.alphaToCoverage), 
        !0 === this.premultipliedAlpha && (i.premultipliedAlpha = this.premultipliedAlpha), 
        !0 === this.forceSinglePass && (i.forceSinglePass = this.forceSinglePass), !0 === this.wireframe && (i.wireframe = this.wireframe), 
        this.wireframeLinewidth > 1 && (i.wireframeLinewidth = this.wireframeLinewidth), 
        "round" !== this.wireframeLinecap && (i.wireframeLinecap = this.wireframeLinecap), 
        "round" !== this.wireframeLinejoin && (i.wireframeLinejoin = this.wireframeLinejoin), 
        !0 === this.flatShading && (i.flatShading = this.flatShading), !1 === this.visible && (i.visible = !1), 
        !1 === this.toneMapped && (i.toneMapped = !1), !1 === this.fog && (i.fog = !1), 
        Object.keys(this.userData).length > 0 && (i.userData = this.userData), e) {
            const e = n(t.textures), r = n(t.images);
            e.length > 0 && (i.textures = e), r.length > 0 && (i.images = r);
        }
        return i;
    }
    clone() {
        return (new this.constructor).copy(this);
    }
    copy(t) {
        this.name = t.name, this.blending = t.blending, this.side = t.side, this.vertexColors = t.vertexColors, 
        this.opacity = t.opacity, this.transparent = t.transparent, this.blendSrc = t.blendSrc, 
        this.blendDst = t.blendDst, this.blendEquation = t.blendEquation, this.blendSrcAlpha = t.blendSrcAlpha, 
        this.blendDstAlpha = t.blendDstAlpha, this.blendEquationAlpha = t.blendEquationAlpha, 
        this.depthFunc = t.depthFunc, this.depthTest = t.depthTest, this.depthWrite = t.depthWrite, 
        this.stencilWriteMask = t.stencilWriteMask, this.stencilFunc = t.stencilFunc, this.stencilRef = t.stencilRef, 
        this.stencilFuncMask = t.stencilFuncMask, this.stencilFail = t.stencilFail, this.stencilZFail = t.stencilZFail, 
        this.stencilZPass = t.stencilZPass, this.stencilWrite = t.stencilWrite;
        const e = t.clippingPlanes;
        let i = null;
        if (null !== e) {
            const t = e.length;
            i = new Array(t);
            for (let n = 0; n !== t; ++n) i[n] = e[n].clone();
        }
        return this.clippingPlanes = i, this.clipIntersection = t.clipIntersection, this.clipShadows = t.clipShadows, 
        this.shadowSide = t.shadowSide, this.colorWrite = t.colorWrite, this.precision = t.precision, 
        this.polygonOffset = t.polygonOffset, this.polygonOffsetFactor = t.polygonOffsetFactor, 
        this.polygonOffsetUnits = t.polygonOffsetUnits, this.dithering = t.dithering, this.alphaTest = t.alphaTest, 
        this.alphaToCoverage = t.alphaToCoverage, this.premultipliedAlpha = t.premultipliedAlpha, 
        this.forceSinglePass = t.forceSinglePass, this.visible = t.visible, this.toneMapped = t.toneMapped, 
        this.userData = JSON.parse(JSON.stringify(t.userData)), this;
    }
    dispose() {
        this.dispatchEvent({
            type: "dispose"
        });
    }
    set needsUpdate(t) {
        !0 === t && this.version++;
    }
}

const me = {
    aliceblue: 15792383,
    antiquewhite: 16444375,
    aqua: 65535,
    aquamarine: 8388564,
    azure: 15794175,
    beige: 16119260,
    bisque: 16770244,
    black: 0,
    blanchedalmond: 16772045,
    blue: 255,
    blueviolet: 9055202,
    brown: 10824234,
    burlywood: 14596231,
    cadetblue: 6266528,
    chartreuse: 8388352,
    chocolate: 13789470,
    coral: 16744272,
    cornflowerblue: 6591981,
    cornsilk: 16775388,
    crimson: 14423100,
    cyan: 65535,
    darkblue: 139,
    darkcyan: 35723,
    darkgoldenrod: 12092939,
    darkgray: 11119017,
    darkgreen: 25600,
    darkgrey: 11119017,
    darkkhaki: 12433259,
    darkmagenta: 9109643,
    darkolivegreen: 5597999,
    darkorange: 16747520,
    darkorchid: 10040012,
    darkred: 9109504,
    darksalmon: 15308410,
    darkseagreen: 9419919,
    darkslateblue: 4734347,
    darkslategray: 3100495,
    darkslategrey: 3100495,
    darkturquoise: 52945,
    darkviolet: 9699539,
    deeppink: 16716947,
    deepskyblue: 49151,
    dimgray: 6908265,
    dimgrey: 6908265,
    dodgerblue: 2003199,
    firebrick: 11674146,
    floralwhite: 16775920,
    forestgreen: 2263842,
    fuchsia: 16711935,
    gainsboro: 14474460,
    ghostwhite: 16316671,
    gold: 16766720,
    goldenrod: 14329120,
    gray: 8421504,
    green: 32768,
    greenyellow: 11403055,
    grey: 8421504,
    honeydew: 15794160,
    hotpink: 16738740,
    indianred: 13458524,
    indigo: 4915330,
    ivory: 16777200,
    khaki: 15787660,
    lavender: 15132410,
    lavenderblush: 16773365,
    lawngreen: 8190976,
    lemonchiffon: 16775885,
    lightblue: 11393254,
    lightcoral: 15761536,
    lightcyan: 14745599,
    lightgoldenrodyellow: 16448210,
    lightgray: 13882323,
    lightgreen: 9498256,
    lightgrey: 13882323,
    lightpink: 16758465,
    lightsalmon: 16752762,
    lightseagreen: 2142890,
    lightskyblue: 8900346,
    lightslategray: 7833753,
    lightslategrey: 7833753,
    lightsteelblue: 11584734,
    lightyellow: 16777184,
    lime: 65280,
    limegreen: 3329330,
    linen: 16445670,
    magenta: 16711935,
    maroon: 8388608,
    mediumaquamarine: 6737322,
    mediumblue: 205,
    mediumorchid: 12211667,
    mediumpurple: 9662683,
    mediumseagreen: 3978097,
    mediumslateblue: 8087790,
    mediumspringgreen: 64154,
    mediumturquoise: 4772300,
    mediumvioletred: 13047173,
    midnightblue: 1644912,
    mintcream: 16121850,
    mistyrose: 16770273,
    moccasin: 16770229,
    navajowhite: 16768685,
    navy: 128,
    oldlace: 16643558,
    olive: 8421376,
    olivedrab: 7048739,
    orange: 16753920,
    orangered: 16729344,
    orchid: 14315734,
    palegoldenrod: 15657130,
    palegreen: 10025880,
    paleturquoise: 11529966,
    palevioletred: 14381203,
    papayawhip: 16773077,
    peachpuff: 16767673,
    peru: 13468991,
    pink: 16761035,
    plum: 14524637,
    powderblue: 11591910,
    purple: 8388736,
    rebeccapurple: 6697881,
    red: 16711680,
    rosybrown: 12357519,
    royalblue: 4286945,
    saddlebrown: 9127187,
    salmon: 16416882,
    sandybrown: 16032864,
    seagreen: 3050327,
    seashell: 16774638,
    sienna: 10506797,
    silver: 12632256,
    skyblue: 8900331,
    slateblue: 6970061,
    slategray: 7372944,
    slategrey: 7372944,
    snow: 16775930,
    springgreen: 65407,
    steelblue: 4620980,
    tan: 13808780,
    teal: 32896,
    thistle: 14204888,
    tomato: 16737095,
    turquoise: 4251856,
    violet: 15631086,
    wheat: 16113331,
    white: 16777215,
    whitesmoke: 16119285,
    yellow: 16776960,
    yellowgreen: 10145074
}, ve = {
    h: 0,
    s: 0,
    l: 0
}, _e = {
    h: 0,
    s: 0,
    l: 0
};

function xe(t, e, i) {
    return i < 0 && (i += 1), i > 1 && (i -= 1), i < 1 / 6 ? t + 6 * (e - t) * i : i < .5 ? e : i < 2 / 3 ? t + 6 * (e - t) * (2 / 3 - i) : t;
}

class ye {
    constructor(t, e, i) {
        return this.isColor = !0, this.r = 1, this.g = 1, this.b = 1, void 0 === e && void 0 === i ? this.set(t) : this.setRGB(t, e, i);
    }
    set(t) {
        return t && t.isColor ? this.copy(t) : "number" == typeof t ? this.setHex(t) : "string" == typeof t && this.setStyle(t), 
        this;
    }
    setScalar(t) {
        return this.r = t, this.g = t, this.b = t, this;
    }
    setHex(t, e = "srgb") {
        return t = Math.floor(t), this.r = (t >> 16 & 255) / 255, this.g = (t >> 8 & 255) / 255, 
        this.b = (255 & t) / 255, G.toWorkingColorSpace(this, e), this;
    }
    setRGB(t, e, i, n = G.workingColorSpace) {
        return this.r = t, this.g = e, this.b = i, G.toWorkingColorSpace(this, n), this;
    }
    setHSL(t, e, i, n = G.workingColorSpace) {
        if (t = b(t, 1), e = y(e, 0, 1), i = y(i, 0, 1), 0 === e) this.r = this.g = this.b = i; else {
            const n = i <= .5 ? i * (1 + e) : i + e - i * e, r = 2 * i - n;
            this.r = xe(r, n, t + 1 / 3), this.g = xe(r, n, t), this.b = xe(r, n, t - 1 / 3);
        }
        return G.toWorkingColorSpace(this, n), this;
    }
    setStyle(t, e = "srgb") {
        function i(e) {
            void 0 !== e && parseFloat(e) < 1 && console.warn("THREE.Color: Alpha component of " + t + " will be ignored.");
        }
        let n;
        if (n = /^(\w+)\(([^\)]*)\)/.exec(t)) {
            let r;
            const s = n[1], a = n[2];
            switch (s) {
              case "rgb":
              case "rgba":
                if (r = /^\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(a)) return i(r[4]), 
                this.setRGB(Math.min(255, parseInt(r[1], 10)) / 255, Math.min(255, parseInt(r[2], 10)) / 255, Math.min(255, parseInt(r[3], 10)) / 255, e);
                if (r = /^\s*(\d+)\%\s*,\s*(\d+)\%\s*,\s*(\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(a)) return i(r[4]), 
                this.setRGB(Math.min(100, parseInt(r[1], 10)) / 100, Math.min(100, parseInt(r[2], 10)) / 100, Math.min(100, parseInt(r[3], 10)) / 100, e);
                break;

              case "hsl":
              case "hsla":
                if (r = /^\s*(\d*\.?\d+)\s*,\s*(\d*\.?\d+)\%\s*,\s*(\d*\.?\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(a)) return i(r[4]), 
                this.setHSL(parseFloat(r[1]) / 360, parseFloat(r[2]) / 100, parseFloat(r[3]) / 100, e);
                break;

              default:
                console.warn("THREE.Color: Unknown color model " + t);
            }
        } else if (n = /^\#([A-Fa-f\d]+)$/.exec(t)) {
            const i = n[1], r = i.length;
            if (3 === r) return this.setRGB(parseInt(i.charAt(0), 16) / 15, parseInt(i.charAt(1), 16) / 15, parseInt(i.charAt(2), 16) / 15, e);
            if (6 === r) return this.setHex(parseInt(i, 16), e);
            console.warn("THREE.Color: Invalid hex color " + t);
        } else if (t && t.length > 0) return this.setColorName(t, e);
        return this;
    }
    setColorName(t, e = "srgb") {
        const i = me[t.toLowerCase()];
        return void 0 !== i ? this.setHex(i, e) : console.warn("THREE.Color: Unknown color " + t), 
        this;
    }
    clone() {
        return new this.constructor(this.r, this.g, this.b);
    }
    copy(t) {
        return this.r = t.r, this.g = t.g, this.b = t.b, this;
    }
    copySRGBToLinear(t) {
        return this.r = B(t.r), this.g = B(t.g), this.b = B(t.b), this;
    }
    copyLinearToSRGB(t) {
        return this.r = O(t.r), this.g = O(t.g), this.b = O(t.b), this;
    }
    convertSRGBToLinear() {
        return this.copySRGBToLinear(this), this;
    }
    convertLinearToSRGB() {
        return this.copyLinearToSRGB(this), this;
    }
    getHex(t = "srgb") {
        return G.fromWorkingColorSpace(be.copy(this), t), 65536 * Math.round(y(255 * be.r, 0, 255)) + 256 * Math.round(y(255 * be.g, 0, 255)) + Math.round(y(255 * be.b, 0, 255));
    }
    getHexString(t = "srgb") {
        return ("000000" + this.getHex(t).toString(16)).slice(-6);
    }
    getHSL(t, e = G.workingColorSpace) {
        G.fromWorkingColorSpace(be.copy(this), e);
        const i = be.r, n = be.g, r = be.b, s = Math.max(i, n, r), a = Math.min(i, n, r);
        let o, l;
        const h = (a + s) / 2;
        if (a === s) o = 0, l = 0; else {
            const t = s - a;
            switch (l = h <= .5 ? t / (s + a) : t / (2 - s - a), s) {
              case i:
                o = (n - r) / t + (n < r ? 6 : 0);
                break;

              case n:
                o = (r - i) / t + 2;
                break;

              case r:
                o = (i - n) / t + 4;
            }
            o /= 6;
        }
        return t.h = o, t.s = l, t.l = h, t;
    }
    getRGB(t, e = G.workingColorSpace) {
        return G.fromWorkingColorSpace(be.copy(this), e), t.r = be.r, t.g = be.g, t.b = be.b, 
        t;
    }
    getStyle(t = "srgb") {
        G.fromWorkingColorSpace(be.copy(this), t);
        const e = be.r, i = be.g, n = be.b;
        return "srgb" !== t ? `color(${t} ${e.toFixed(3)} ${i.toFixed(3)} ${n.toFixed(3)})` : `rgb(${Math.round(255 * e)},${Math.round(255 * i)},${Math.round(255 * n)})`;
    }
    offsetHSL(t, e, i) {
        return this.getHSL(ve), ve.h += t, ve.s += e, ve.l += i, this.setHSL(ve.h, ve.s, ve.l), 
        this;
    }
    add(t) {
        return this.r += t.r, this.g += t.g, this.b += t.b, this;
    }
    addColors(t, e) {
        return this.r = t.r + e.r, this.g = t.g + e.g, this.b = t.b + e.b, this;
    }
    addScalar(t) {
        return this.r += t, this.g += t, this.b += t, this;
    }
    sub(t) {
        return this.r = Math.max(0, this.r - t.r), this.g = Math.max(0, this.g - t.g), this.b = Math.max(0, this.b - t.b), 
        this;
    }
    multiply(t) {
        return this.r *= t.r, this.g *= t.g, this.b *= t.b, this;
    }
    multiplyScalar(t) {
        return this.r *= t, this.g *= t, this.b *= t, this;
    }
    lerp(t, e) {
        return this.r += (t.r - this.r) * e, this.g += (t.g - this.g) * e, this.b += (t.b - this.b) * e, 
        this;
    }
    lerpColors(t, e, i) {
        return this.r = t.r + (e.r - t.r) * i, this.g = t.g + (e.g - t.g) * i, this.b = t.b + (e.b - t.b) * i, 
        this;
    }
    lerpHSL(t, e) {
        this.getHSL(ve), t.getHSL(_e);
        const i = S(ve.h, _e.h, e), n = S(ve.s, _e.s, e), r = S(ve.l, _e.l, e);
        return this.setHSL(i, n, r), this;
    }
    setFromVector3(t) {
        return this.r = t.x, this.g = t.y, this.b = t.z, this;
    }
    applyMatrix3(t) {
        const e = this.r, i = this.g, n = this.b, r = t.elements;
        return this.r = r[0] * e + r[3] * i + r[6] * n, this.g = r[1] * e + r[4] * i + r[7] * n, 
        this.b = r[2] * e + r[5] * i + r[8] * n, this;
    }
    equals(t) {
        return t.r === this.r && t.g === this.g && t.b === this.b;
    }
    fromArray(t, e = 0) {
        return this.r = t[e], this.g = t[e + 1], this.b = t[e + 2], this;
    }
    toArray(t = [], e = 0) {
        return t[e] = this.r, t[e + 1] = this.g, t[e + 2] = this.b, t;
    }
    fromBufferAttribute(t, e) {
        return this.r = t.getX(e), this.g = t.getY(e), this.b = t.getZ(e), this;
    }
    toJSON() {
        return this.getHex();
    }
    * [Symbol.iterator]() {
        yield this.r, yield this.g, yield this.b;
    }
}

const be = new ye;

ye.NAMES = me;

class Se extends fe {
    constructor(t) {
        super(), this.isMeshBasicMaterial = !0, this.type = "MeshBasicMaterial", this.color = new ye(16777215), 
        this.map = null, this.lightMap = null, this.lightMapIntensity = 1, this.aoMap = null, 
        this.aoMapIntensity = 1, this.specularMap = null, this.alphaMap = null, this.envMap = null, 
        this.combine = 0, this.reflectivity = 1, this.refractionRatio = .98, this.wireframe = !1, 
        this.wireframeLinewidth = 1, this.wireframeLinecap = "round", this.wireframeLinejoin = "round", 
        this.fog = !0, this.setValues(t);
    }
    copy(t) {
        return super.copy(t), this.color.copy(t.color), this.map = t.map, this.lightMap = t.lightMap, 
        this.lightMapIntensity = t.lightMapIntensity, this.aoMap = t.aoMap, this.aoMapIntensity = t.aoMapIntensity, 
        this.specularMap = t.specularMap, this.alphaMap = t.alphaMap, this.envMap = t.envMap, 
        this.combine = t.combine, this.reflectivity = t.reflectivity, this.refractionRatio = t.refractionRatio, 
        this.wireframe = t.wireframe, this.wireframeLinewidth = t.wireframeLinewidth, this.wireframeLinecap = t.wireframeLinecap, 
        this.wireframeLinejoin = t.wireframeLinejoin, this.fog = t.fog, this;
    }
}

const we = new tt, Me = new P;

class Te {
    constructor(t, e, i = !1) {
        if (Array.isArray(t)) throw new TypeError("THREE.BufferAttribute: array should be a Typed Array.");
        this.isBufferAttribute = !0, this.name = "", this.array = t, this.itemSize = e, 
        this.count = void 0 !== t ? t.length / e : 0, this.normalized = i, this.usage = 35044, 
        this.updateRange = {
            offset: 0,
            count: -1
        }, this.version = 0;
    }
    onUploadCallback() {}
    set needsUpdate(t) {
        !0 === t && this.version++;
    }
    setUsage(t) {
        return this.usage = t, this;
    }
    copy(t) {
        return this.name = t.name, this.array = new t.array.constructor(t.array), this.itemSize = t.itemSize, 
        this.count = t.count, this.normalized = t.normalized, this.usage = t.usage, this;
    }
    copyAt(t, e, i) {
        t *= this.itemSize, i *= e.itemSize;
        for (let n = 0, r = this.itemSize; n < r; n++) this.array[t + n] = e.array[i + n];
        return this;
    }
    copyArray(t) {
        return this.array.set(t), this;
    }
    applyMatrix3(t) {
        if (2 === this.itemSize) for (let e = 0, i = this.count; e < i; e++) Me.fromBufferAttribute(this, e), 
        Me.applyMatrix3(t), this.setXY(e, Me.x, Me.y); else if (3 === this.itemSize) for (let e = 0, i = this.count; e < i; e++) we.fromBufferAttribute(this, e), 
        we.applyMatrix3(t), this.setXYZ(e, we.x, we.y, we.z);
        return this;
    }
    applyMatrix4(t) {
        for (let e = 0, i = this.count; e < i; e++) we.fromBufferAttribute(this, e), we.applyMatrix4(t), 
        this.setXYZ(e, we.x, we.y, we.z);
        return this;
    }
    applyNormalMatrix(t) {
        for (let e = 0, i = this.count; e < i; e++) we.fromBufferAttribute(this, e), we.applyNormalMatrix(t), 
        this.setXYZ(e, we.x, we.y, we.z);
        return this;
    }
    transformDirection(t) {
        for (let e = 0, i = this.count; e < i; e++) we.fromBufferAttribute(this, e), we.transformDirection(t), 
        this.setXYZ(e, we.x, we.y, we.z);
        return this;
    }
    set(t, e = 0) {
        return this.array.set(t, e), this;
    }
    getX(t) {
        let e = this.array[t * this.itemSize];
        return this.normalized && (e = E(e, this.array)), e;
    }
    setX(t, e) {
        return this.normalized && (e = A(e, this.array)), this.array[t * this.itemSize] = e, 
        this;
    }
    getY(t) {
        let e = this.array[t * this.itemSize + 1];
        return this.normalized && (e = E(e, this.array)), e;
    }
    setY(t, e) {
        return this.normalized && (e = A(e, this.array)), this.array[t * this.itemSize + 1] = e, 
        this;
    }
    getZ(t) {
        let e = this.array[t * this.itemSize + 2];
        return this.normalized && (e = E(e, this.array)), e;
    }
    setZ(t, e) {
        return this.normalized && (e = A(e, this.array)), this.array[t * this.itemSize + 2] = e, 
        this;
    }
    getW(t) {
        let e = this.array[t * this.itemSize + 3];
        return this.normalized && (e = E(e, this.array)), e;
    }
    setW(t, e) {
        return this.normalized && (e = A(e, this.array)), this.array[t * this.itemSize + 3] = e, 
        this;
    }
    setXY(t, e, i) {
        return t *= this.itemSize, this.normalized && (e = A(e, this.array), i = A(i, this.array)), 
        this.array[t + 0] = e, this.array[t + 1] = i, this;
    }
    setXYZ(t, e, i, n) {
        return t *= this.itemSize, this.normalized && (e = A(e, this.array), i = A(i, this.array), 
        n = A(n, this.array)), this.array[t + 0] = e, this.array[t + 1] = i, this.array[t + 2] = n, 
        this;
    }
    setXYZW(t, e, i, n, r) {
        return t *= this.itemSize, this.normalized && (e = A(e, this.array), i = A(i, this.array), 
        n = A(n, this.array), r = A(r, this.array)), this.array[t + 0] = e, this.array[t + 1] = i, 
        this.array[t + 2] = n, this.array[t + 3] = r, this;
    }
    onUpload(t) {
        return this.onUploadCallback = t, this;
    }
    clone() {
        return new this.constructor(this.array, this.itemSize).copy(this);
    }
    toJSON() {
        const t = {
            itemSize: this.itemSize,
            type: this.array.constructor.name,
            array: Array.from(this.array),
            normalized: this.normalized
        };
        return "" !== this.name && (t.name = this.name), 35044 !== this.usage && (t.usage = this.usage), 
        0 === this.updateRange.offset && -1 === this.updateRange.count || (t.updateRange = this.updateRange), 
        t;
    }
    copyColorsArray() {
        console.error("THREE.BufferAttribute: copyColorsArray() was removed in r144.");
    }
    copyVector2sArray() {
        console.error("THREE.BufferAttribute: copyVector2sArray() was removed in r144.");
    }
    copyVector3sArray() {
        console.error("THREE.BufferAttribute: copyVector3sArray() was removed in r144.");
    }
    copyVector4sArray() {
        console.error("THREE.BufferAttribute: copyVector4sArray() was removed in r144.");
    }
}

class Ee extends Te {
    constructor(t, e, i) {
        super(new Uint16Array(t), e, i);
    }
}

class Ae extends Te {
    constructor(t, e, i) {
        super(new Uint32Array(t), e, i);
    }
}

class Ce extends Te {
    constructor(t, e, i) {
        super(new Float32Array(t), e, i);
    }
}

let Pe = 0;

const Re = new Rt, Le = new ee, De = new tt, Ie = new nt, Ue = new nt, Ne = new tt;

class Be extends g {
    constructor() {
        super(), this.isBufferGeometry = !0, Object.defineProperty(this, "id", {
            value: Pe++
        }), this.uuid = x(), this.name = "", this.type = "BufferGeometry", this.index = null, 
        this.attributes = {}, this.morphAttributes = {}, this.morphTargetsRelative = !1, 
        this.groups = [], this.boundingBox = null, this.boundingSphere = null, this.drawRange = {
            start: 0,
            count: 1 / 0
        }, this.userData = {};
    }
    getIndex() {
        return this.index;
    }
    setIndex(t) {
        return Array.isArray(t) ? this.index = new (D(t) ? Ae : Ee)(t, 1) : this.index = t, 
        this;
    }
    getAttribute(t) {
        return this.attributes[t];
    }
    setAttribute(t, e) {
        return this.attributes[t] = e, this;
    }
    deleteAttribute(t) {
        return delete this.attributes[t], this;
    }
    hasAttribute(t) {
        return void 0 !== this.attributes[t];
    }
    addGroup(t, e, i = 0) {
        this.groups.push({
            start: t,
            count: e,
            materialIndex: i
        });
    }
    clearGroups() {
        this.groups = [];
    }
    setDrawRange(t, e) {
        this.drawRange.start = t, this.drawRange.count = e;
    }
    applyMatrix4(t) {
        const e = this.attributes.position;
        void 0 !== e && (e.applyMatrix4(t), e.needsUpdate = !0);
        const i = this.attributes.normal;
        if (void 0 !== i) {
            const e = (new R).getNormalMatrix(t);
            i.applyNormalMatrix(e), i.needsUpdate = !0;
        }
        const n = this.attributes.tangent;
        return void 0 !== n && (n.transformDirection(t), n.needsUpdate = !0), null !== this.boundingBox && this.computeBoundingBox(), 
        null !== this.boundingSphere && this.computeBoundingSphere(), this;
    }
    applyQuaternion(t) {
        return Re.makeRotationFromQuaternion(t), this.applyMatrix4(Re), this;
    }
    rotateX(t) {
        return Re.makeRotationX(t), this.applyMatrix4(Re), this;
    }
    rotateY(t) {
        return Re.makeRotationY(t), this.applyMatrix4(Re), this;
    }
    rotateZ(t) {
        return Re.makeRotationZ(t), this.applyMatrix4(Re), this;
    }
    translate(t, e, i) {
        return Re.makeTranslation(t, e, i), this.applyMatrix4(Re), this;
    }
    scale(t, e, i) {
        return Re.makeScale(t, e, i), this.applyMatrix4(Re), this;
    }
    lookAt(t) {
        return Le.lookAt(t), Le.updateMatrix(), this.applyMatrix4(Le.matrix), this;
    }
    center() {
        return this.computeBoundingBox(), this.boundingBox.getCenter(De).negate(), this.translate(De.x, De.y, De.z), 
        this;
    }
    setFromPoints(t) {
        const e = [];
        for (let i = 0, n = t.length; i < n; i++) {
            const n = t[i];
            e.push(n.x, n.y, n.z || 0);
        }
        return this.setAttribute("position", new Ce(e, 3)), this;
    }
    computeBoundingBox() {
        null === this.boundingBox && (this.boundingBox = new nt);
        const t = this.attributes.position, e = this.morphAttributes.position;
        if (t && t.isGLBufferAttribute) return console.error('THREE.BufferGeometry.computeBoundingBox(): GLBufferAttribute requires a manual bounding box. Alternatively set "mesh.frustumCulled" to "false".', this), 
        void this.boundingBox.set(new tt(-1 / 0, -1 / 0, -1 / 0), new tt(1 / 0, 1 / 0, 1 / 0));
        if (void 0 !== t) {
            if (this.boundingBox.setFromBufferAttribute(t), e) for (let t = 0, i = e.length; t < i; t++) {
                const i = e[t];
                Ie.setFromBufferAttribute(i), this.morphTargetsRelative ? (Ne.addVectors(this.boundingBox.min, Ie.min), 
                this.boundingBox.expandByPoint(Ne), Ne.addVectors(this.boundingBox.max, Ie.max), 
                this.boundingBox.expandByPoint(Ne)) : (this.boundingBox.expandByPoint(Ie.min), this.boundingBox.expandByPoint(Ie.max));
            }
        } else this.boundingBox.makeEmpty();
        (isNaN(this.boundingBox.min.x) || isNaN(this.boundingBox.min.y) || isNaN(this.boundingBox.min.z)) && console.error('THREE.BufferGeometry.computeBoundingBox(): Computed min/max have NaN values. The "position" attribute is likely to have NaN values.', this);
    }
    computeBoundingSphere() {
        null === this.boundingSphere && (this.boundingSphere = new bt);
        const t = this.attributes.position, e = this.morphAttributes.position;
        if (t && t.isGLBufferAttribute) return console.error('THREE.BufferGeometry.computeBoundingSphere(): GLBufferAttribute requires a manual bounding sphere. Alternatively set "mesh.frustumCulled" to "false".', this), 
        void this.boundingSphere.set(new tt, 1 / 0);
        if (t) {
            const i = this.boundingSphere.center;
            if (Ie.setFromBufferAttribute(t), e) for (let t = 0, i = e.length; t < i; t++) {
                const i = e[t];
                Ue.setFromBufferAttribute(i), this.morphTargetsRelative ? (Ne.addVectors(Ie.min, Ue.min), 
                Ie.expandByPoint(Ne), Ne.addVectors(Ie.max, Ue.max), Ie.expandByPoint(Ne)) : (Ie.expandByPoint(Ue.min), 
                Ie.expandByPoint(Ue.max));
            }
            Ie.getCenter(i);
            let n = 0;
            for (let e = 0, r = t.count; e < r; e++) Ne.fromBufferAttribute(t, e), n = Math.max(n, i.distanceToSquared(Ne));
            if (e) for (let r = 0, s = e.length; r < s; r++) {
                const s = e[r], a = this.morphTargetsRelative;
                for (let e = 0, r = s.count; e < r; e++) Ne.fromBufferAttribute(s, e), a && (De.fromBufferAttribute(t, e), 
                Ne.add(De)), n = Math.max(n, i.distanceToSquared(Ne));
            }
            this.boundingSphere.radius = Math.sqrt(n), isNaN(this.boundingSphere.radius) && console.error('THREE.BufferGeometry.computeBoundingSphere(): Computed radius is NaN. The "position" attribute is likely to have NaN values.', this);
        }
    }
    computeTangents() {
        const t = this.index, e = this.attributes;
        if (null === t || void 0 === e.position || void 0 === e.normal || void 0 === e.uv) return void console.error("THREE.BufferGeometry: .computeTangents() failed. Missing required attributes (index, position, normal or uv)");
        const i = t.array, n = e.position.array, r = e.normal.array, s = e.uv.array, a = n.length / 3;
        !1 === this.hasAttribute("tangent") && this.setAttribute("tangent", new Te(new Float32Array(4 * a), 4));
        const o = this.getAttribute("tangent").array, l = [], h = [];
        for (let t = 0; t < a; t++) l[t] = new tt, h[t] = new tt;
        const c = new tt, d = new tt, u = new tt, p = new P, g = new P, f = new P, m = new tt, v = new tt;
        function _(t, e, i) {
            c.fromArray(n, 3 * t), d.fromArray(n, 3 * e), u.fromArray(n, 3 * i), p.fromArray(s, 2 * t), 
            g.fromArray(s, 2 * e), f.fromArray(s, 2 * i), d.sub(c), u.sub(c), g.sub(p), f.sub(p);
            const r = 1 / (g.x * f.y - f.x * g.y);
            isFinite(r) && (m.copy(d).multiplyScalar(f.y).addScaledVector(u, -g.y).multiplyScalar(r), 
            v.copy(u).multiplyScalar(g.x).addScaledVector(d, -f.x).multiplyScalar(r), l[t].add(m), 
            l[e].add(m), l[i].add(m), h[t].add(v), h[e].add(v), h[i].add(v));
        }
        let x = this.groups;
        0 === x.length && (x = [ {
            start: 0,
            count: i.length
        } ]);
        for (let t = 0, e = x.length; t < e; ++t) {
            const e = x[t], n = e.start;
            for (let t = n, r = n + e.count; t < r; t += 3) _(i[t + 0], i[t + 1], i[t + 2]);
        }
        const y = new tt, b = new tt, S = new tt, w = new tt;
        function M(t) {
            S.fromArray(r, 3 * t), w.copy(S);
            const e = l[t];
            y.copy(e), y.sub(S.multiplyScalar(S.dot(e))).normalize(), b.crossVectors(w, e);
            const i = b.dot(h[t]) < 0 ? -1 : 1;
            o[4 * t] = y.x, o[4 * t + 1] = y.y, o[4 * t + 2] = y.z, o[4 * t + 3] = i;
        }
        for (let t = 0, e = x.length; t < e; ++t) {
            const e = x[t], n = e.start;
            for (let t = n, r = n + e.count; t < r; t += 3) M(i[t + 0]), M(i[t + 1]), M(i[t + 2]);
        }
    }
    computeVertexNormals() {
        const t = this.index, e = this.getAttribute("position");
        if (void 0 !== e) {
            let i = this.getAttribute("normal");
            if (void 0 === i) i = new Te(new Float32Array(3 * e.count), 3), this.setAttribute("normal", i); else for (let t = 0, e = i.count; t < e; t++) i.setXYZ(t, 0, 0, 0);
            const n = new tt, r = new tt, s = new tt, a = new tt, o = new tt, l = new tt, h = new tt, c = new tt;
            if (t) for (let d = 0, u = t.count; d < u; d += 3) {
                const u = t.getX(d + 0), p = t.getX(d + 1), g = t.getX(d + 2);
                n.fromBufferAttribute(e, u), r.fromBufferAttribute(e, p), s.fromBufferAttribute(e, g), 
                h.subVectors(s, r), c.subVectors(n, r), h.cross(c), a.fromBufferAttribute(i, u), 
                o.fromBufferAttribute(i, p), l.fromBufferAttribute(i, g), a.add(h), o.add(h), l.add(h), 
                i.setXYZ(u, a.x, a.y, a.z), i.setXYZ(p, o.x, o.y, o.z), i.setXYZ(g, l.x, l.y, l.z);
            } else for (let t = 0, a = e.count; t < a; t += 3) n.fromBufferAttribute(e, t + 0), 
            r.fromBufferAttribute(e, t + 1), s.fromBufferAttribute(e, t + 2), h.subVectors(s, r), 
            c.subVectors(n, r), h.cross(c), i.setXYZ(t + 0, h.x, h.y, h.z), i.setXYZ(t + 1, h.x, h.y, h.z), 
            i.setXYZ(t + 2, h.x, h.y, h.z);
            this.normalizeNormals(), i.needsUpdate = !0;
        }
    }
    merge() {
        return console.error("THREE.BufferGeometry.merge() has been removed. Use THREE.BufferGeometryUtils.mergeGeometries() instead."), 
        this;
    }
    normalizeNormals() {
        const t = this.attributes.normal;
        for (let e = 0, i = t.count; e < i; e++) Ne.fromBufferAttribute(t, e), Ne.normalize(), 
        t.setXYZ(e, Ne.x, Ne.y, Ne.z);
    }
    toNonIndexed() {
        function t(t, e) {
            const i = t.array, n = t.itemSize, r = t.normalized, s = new i.constructor(e.length * n);
            let a = 0, o = 0;
            for (let r = 0, l = e.length; r < l; r++) {
                a = t.isInterleavedBufferAttribute ? e[r] * t.data.stride + t.offset : e[r] * n;
                for (let t = 0; t < n; t++) s[o++] = i[a++];
            }
            return new Te(s, n, r);
        }
        if (null === this.index) return console.warn("THREE.BufferGeometry.toNonIndexed(): BufferGeometry is already non-indexed."), 
        this;
        const e = new Be, i = this.index.array, n = this.attributes;
        for (const r in n) {
            const s = t(n[r], i);
            e.setAttribute(r, s);
        }
        const r = this.morphAttributes;
        for (const n in r) {
            const s = [], a = r[n];
            for (let e = 0, n = a.length; e < n; e++) {
                const n = t(a[e], i);
                s.push(n);
            }
            e.morphAttributes[n] = s;
        }
        e.morphTargetsRelative = this.morphTargetsRelative;
        const s = this.groups;
        for (let t = 0, i = s.length; t < i; t++) {
            const i = s[t];
            e.addGroup(i.start, i.count, i.materialIndex);
        }
        return e;
    }
    toJSON() {
        const t = {
            metadata: {
                version: 4.5,
                type: "BufferGeometry",
                generator: "BufferGeometry.toJSON"
            }
        };
        if (t.uuid = this.uuid, t.type = this.type, "" !== this.name && (t.name = this.name), 
        Object.keys(this.userData).length > 0 && (t.userData = this.userData), void 0 !== this.parameters) {
            const e = this.parameters;
            for (const i in e) void 0 !== e[i] && (t[i] = e[i]);
            return t;
        }
        t.data = {
            attributes: {}
        };
        const e = this.index;
        null !== e && (t.data.index = {
            type: e.array.constructor.name,
            array: Array.prototype.slice.call(e.array)
        });
        const i = this.attributes;
        for (const e in i) {
            const n = i[e];
            t.data.attributes[e] = n.toJSON(t.data);
        }
        const n = {};
        let r = !1;
        for (const e in this.morphAttributes) {
            const i = this.morphAttributes[e], s = [];
            for (let e = 0, n = i.length; e < n; e++) {
                const n = i[e];
                s.push(n.toJSON(t.data));
            }
            s.length > 0 && (n[e] = s, r = !0);
        }
        r && (t.data.morphAttributes = n, t.data.morphTargetsRelative = this.morphTargetsRelative);
        const s = this.groups;
        s.length > 0 && (t.data.groups = JSON.parse(JSON.stringify(s)));
        const a = this.boundingSphere;
        return null !== a && (t.data.boundingSphere = {
            center: a.center.toArray(),
            radius: a.radius
        }), t;
    }
    clone() {
        return (new this.constructor).copy(this);
    }
    copy(t) {
        this.index = null, this.attributes = {}, this.morphAttributes = {}, this.groups = [], 
        this.boundingBox = null, this.boundingSphere = null;
        const e = {};
        this.name = t.name;
        const i = t.index;
        null !== i && this.setIndex(i.clone(e));
        const n = t.attributes;
        for (const t in n) {
            const i = n[t];
            this.setAttribute(t, i.clone(e));
        }
        const r = t.morphAttributes;
        for (const t in r) {
            const i = [], n = r[t];
            for (let t = 0, r = n.length; t < r; t++) i.push(n[t].clone(e));
            this.morphAttributes[t] = i;
        }
        this.morphTargetsRelative = t.morphTargetsRelative;
        const s = t.groups;
        for (let t = 0, e = s.length; t < e; t++) {
            const e = s[t];
            this.addGroup(e.start, e.count, e.materialIndex);
        }
        const a = t.boundingBox;
        null !== a && (this.boundingBox = a.clone());
        const o = t.boundingSphere;
        return null !== o && (this.boundingSphere = o.clone()), this.drawRange.start = t.drawRange.start, 
        this.drawRange.count = t.drawRange.count, this.userData = t.userData, this;
    }
    dispose() {
        this.dispatchEvent({
            type: "dispose"
        });
    }
}

const Oe = new Rt, Fe = new Pt, ke = new bt, He = new tt, ze = new tt, Ge = new tt, Ve = new tt, We = new tt, je = new tt, Xe = new P, qe = new P, Ke = new P, Ye = new tt, Ze = new tt, Je = new tt, Qe = new tt, $e = new tt;

class ti extends ee {
    constructor(t = new Be, e = new Se) {
        super(), this.isMesh = !0, this.type = "Mesh", this.geometry = t, this.material = e, 
        this.updateMorphTargets();
    }
    copy(t, e) {
        return super.copy(t, e), void 0 !== t.morphTargetInfluences && (this.morphTargetInfluences = t.morphTargetInfluences.slice()), 
        void 0 !== t.morphTargetDictionary && (this.morphTargetDictionary = Object.assign({}, t.morphTargetDictionary)), 
        this.material = t.material, this.geometry = t.geometry, this;
    }
    updateMorphTargets() {
        const t = this.geometry.morphAttributes, e = Object.keys(t);
        if (e.length > 0) {
            const i = t[e[0]];
            if (void 0 !== i) {
                this.morphTargetInfluences = [], this.morphTargetDictionary = {};
                for (let t = 0, e = i.length; t < e; t++) {
                    const e = i[t].name || String(t);
                    this.morphTargetInfluences.push(0), this.morphTargetDictionary[e] = t;
                }
            }
        }
    }
    getVertexPosition(t, e) {
        const i = this.geometry, n = i.attributes.position, r = i.morphAttributes.position, s = i.morphTargetsRelative;
        e.fromBufferAttribute(n, t);
        const a = this.morphTargetInfluences;
        if (r && a) {
            je.set(0, 0, 0);
            for (let i = 0, n = r.length; i < n; i++) {
                const n = a[i], o = r[i];
                0 !== n && (We.fromBufferAttribute(o, t), s ? je.addScaledVector(We, n) : je.addScaledVector(We.sub(e), n));
            }
            e.add(je);
        }
        return e;
    }
    raycast(t, e) {
        const i = this.geometry, n = this.material, r = this.matrixWorld;
        if (void 0 !== n) {
            if (null === i.boundingSphere && i.computeBoundingSphere(), ke.copy(i.boundingSphere), 
            ke.applyMatrix4(r), Fe.copy(t.ray).recast(t.near), !1 === ke.containsPoint(Fe.origin)) {
                if (null === Fe.intersectSphere(ke, He)) return;
                if (Fe.origin.distanceToSquared(He) > (t.far - t.near) ** 2) return;
            }
            Oe.copy(r).invert(), Fe.copy(t.ray).applyMatrix4(Oe), null !== i.boundingBox && !1 === Fe.intersectsBox(i.boundingBox) || this._computeIntersections(t, e);
        }
    }
    _computeIntersections(t, e) {
        let i;
        const n = this.geometry, r = this.material, s = n.index, a = n.attributes.position, o = n.attributes.uv, l = n.attributes.uv1, h = n.attributes.normal, c = n.groups, d = n.drawRange;
        if (null !== s) if (Array.isArray(r)) for (let n = 0, a = c.length; n < a; n++) {
            const a = c[n], u = r[a.materialIndex];
            for (let n = Math.max(a.start, d.start), r = Math.min(s.count, Math.min(a.start + a.count, d.start + d.count)); n < r; n += 3) {
                const r = s.getX(n), c = s.getX(n + 1), d = s.getX(n + 2);
                i = ei(this, u, t, Fe, o, l, h, r, c, d), i && (i.faceIndex = Math.floor(n / 3), 
                i.face.materialIndex = a.materialIndex, e.push(i));
            }
        } else {
            for (let n = Math.max(0, d.start), a = Math.min(s.count, d.start + d.count); n < a; n += 3) {
                const a = s.getX(n), c = s.getX(n + 1), d = s.getX(n + 2);
                i = ei(this, r, t, Fe, o, l, h, a, c, d), i && (i.faceIndex = Math.floor(n / 3), 
                e.push(i));
            }
        } else if (void 0 !== a) if (Array.isArray(r)) for (let n = 0, s = c.length; n < s; n++) {
            const s = c[n], u = r[s.materialIndex];
            for (let n = Math.max(s.start, d.start), r = Math.min(a.count, Math.min(s.start + s.count, d.start + d.count)); n < r; n += 3) {
                i = ei(this, u, t, Fe, o, l, h, n, n + 1, n + 2), i && (i.faceIndex = Math.floor(n / 3), 
                i.face.materialIndex = s.materialIndex, e.push(i));
            }
        } else {
            for (let n = Math.max(0, d.start), s = Math.min(a.count, d.start + d.count); n < s; n += 3) {
                i = ei(this, r, t, Fe, o, l, h, n, n + 1, n + 2), i && (i.faceIndex = Math.floor(n / 3), 
                e.push(i));
            }
        }
    }
}

function ei(t, e, i, n, r, s, a, o, l, h) {
    t.getVertexPosition(o, ze), t.getVertexPosition(l, Ge), t.getVertexPosition(h, Ve);
    const c = function(t, e, i, n, r, s, a, o) {
        let l;
        if (l = 1 === e.side ? n.intersectTriangle(a, s, r, !0, o) : n.intersectTriangle(r, s, a, 0 === e.side, o), 
        null === l) return null;
        $e.copy(o), $e.applyMatrix4(t.matrixWorld);
        const h = i.ray.origin.distanceTo($e);
        return h < i.near || h > i.far ? null : {
            distance: h,
            point: $e.clone(),
            object: t
        };
    }(t, e, i, n, ze, Ge, Ve, Qe);
    if (c) {
        r && (Xe.fromBufferAttribute(r, o), qe.fromBufferAttribute(r, l), Ke.fromBufferAttribute(r, h), 
        c.uv = pe.getInterpolation(Qe, ze, Ge, Ve, Xe, qe, Ke, new P)), s && (Xe.fromBufferAttribute(s, o), 
        qe.fromBufferAttribute(s, l), Ke.fromBufferAttribute(s, h), c.uv1 = pe.getInterpolation(Qe, ze, Ge, Ve, Xe, qe, Ke, new P), 
        c.uv2 = c.uv1), a && (Ye.fromBufferAttribute(a, o), Ze.fromBufferAttribute(a, l), 
        Je.fromBufferAttribute(a, h), c.normal = pe.getInterpolation(Qe, ze, Ge, Ve, Ye, Ze, Je, new tt), 
        c.normal.dot(n.direction) > 0 && c.normal.multiplyScalar(-1));
        const t = {
            a: o,
            b: l,
            c: h,
            normal: new tt,
            materialIndex: 0
        };
        pe.getNormal(ze, Ge, Ve, t.normal), c.face = t;
    }
    return c;
}

class ii extends Be {
    constructor(t = 1, e = 1, i = 1, n = 1, r = 1, s = 1) {
        super(), this.type = "BoxGeometry", this.parameters = {
            width: t,
            height: e,
            depth: i,
            widthSegments: n,
            heightSegments: r,
            depthSegments: s
        };
        const a = this;
        n = Math.floor(n), r = Math.floor(r), s = Math.floor(s);
        const o = [], l = [], h = [], c = [];
        let d = 0, u = 0;
        function p(t, e, i, n, r, s, p, g, f, m, v) {
            const _ = s / f, x = p / m, y = s / 2, b = p / 2, S = g / 2, w = f + 1, M = m + 1;
            let T = 0, E = 0;
            const A = new tt;
            for (let s = 0; s < M; s++) {
                const a = s * x - b;
                for (let o = 0; o < w; o++) {
                    const d = o * _ - y;
                    A[t] = d * n, A[e] = a * r, A[i] = S, l.push(A.x, A.y, A.z), A[t] = 0, A[e] = 0, 
                    A[i] = g > 0 ? 1 : -1, h.push(A.x, A.y, A.z), c.push(o / f), c.push(1 - s / m), 
                    T += 1;
                }
            }
            for (let t = 0; t < m; t++) for (let e = 0; e < f; e++) {
                const i = d + e + w * t, n = d + e + w * (t + 1), r = d + (e + 1) + w * (t + 1), s = d + (e + 1) + w * t;
                o.push(i, n, s), o.push(n, r, s), E += 6;
            }
            a.addGroup(u, E, v), u += E, d += T;
        }
        p("z", "y", "x", -1, -1, i, e, t, s, r, 0), p("z", "y", "x", 1, -1, i, e, -t, s, r, 1), 
        p("x", "z", "y", 1, 1, t, i, e, n, s, 2), p("x", "z", "y", 1, -1, t, i, -e, n, s, 3), 
        p("x", "y", "z", 1, -1, t, e, i, n, r, 4), p("x", "y", "z", -1, -1, t, e, -i, n, r, 5), 
        this.setIndex(o), this.setAttribute("position", new Ce(l, 3)), this.setAttribute("normal", new Ce(h, 3)), 
        this.setAttribute("uv", new Ce(c, 2));
    }
    copy(t) {
        return super.copy(t), this.parameters = Object.assign({}, t.parameters), this;
    }
    static fromJSON(t) {
        return new ii(t.width, t.height, t.depth, t.widthSegments, t.heightSegments, t.depthSegments);
    }
}

function ni(t) {
    const e = {};
    for (const i in t) {
        e[i] = {};
        for (const n in t[i]) {
            const r = t[i][n];
            r && (r.isColor || r.isMatrix3 || r.isMatrix4 || r.isVector2 || r.isVector3 || r.isVector4 || r.isTexture || r.isQuaternion) ? r.isRenderTargetTexture ? (console.warn("UniformsUtils: Textures of render targets cannot be cloned via cloneUniforms() or mergeUniforms()."), 
            e[i][n] = null) : e[i][n] = r.clone() : Array.isArray(r) ? e[i][n] = r.slice() : e[i][n] = r;
        }
    }
    return e;
}

function ri(t) {
    const e = {};
    for (let i = 0; i < t.length; i++) {
        const n = ni(t[i]);
        for (const t in n) e[t] = n[t];
    }
    return e;
}

function si(t) {
    return null === t.getRenderTarget() ? t.outputColorSpace : "srgb-linear";
}

const ai = {
    clone: ni,
    merge: ri
};

class oi extends fe {
    constructor(t) {
        super(), this.isShaderMaterial = !0, this.type = "ShaderMaterial", this.defines = {}, 
        this.uniforms = {}, this.uniformsGroups = [], this.vertexShader = "void main() {\n\tgl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );\n}", 
        this.fragmentShader = "void main() {\n\tgl_FragColor = vec4( 1.0, 0.0, 0.0, 1.0 );\n}", 
        this.linewidth = 1, this.wireframe = !1, this.wireframeLinewidth = 1, this.fog = !1, 
        this.lights = !1, this.clipping = !1, this.forceSinglePass = !0, this.extensions = {
            derivatives: !1,
            fragDepth: !1,
            drawBuffers: !1,
            shaderTextureLOD: !1
        }, this.defaultAttributeValues = {
            color: [ 1, 1, 1 ],
            uv: [ 0, 0 ],
            uv1: [ 0, 0 ]
        }, this.index0AttributeName = void 0, this.uniformsNeedUpdate = !1, this.glslVersion = null, 
        void 0 !== t && this.setValues(t);
    }
    copy(t) {
        return super.copy(t), this.fragmentShader = t.fragmentShader, this.vertexShader = t.vertexShader, 
        this.uniforms = ni(t.uniforms), this.uniformsGroups = function(t) {
            const e = [];
            for (let i = 0; i < t.length; i++) e.push(t[i].clone());
            return e;
        }(t.uniformsGroups), this.defines = Object.assign({}, t.defines), this.wireframe = t.wireframe, 
        this.wireframeLinewidth = t.wireframeLinewidth, this.fog = t.fog, this.lights = t.lights, 
        this.clipping = t.clipping, this.extensions = Object.assign({}, t.extensions), this.glslVersion = t.glslVersion, 
        this;
    }
    toJSON(t) {
        const e = super.toJSON(t);
        e.glslVersion = this.glslVersion, e.uniforms = {};
        for (const i in this.uniforms) {
            const n = this.uniforms[i].value;
            n && n.isTexture ? e.uniforms[i] = {
                type: "t",
                value: n.toJSON(t).uuid
            } : n && n.isColor ? e.uniforms[i] = {
                type: "c",
                value: n.getHex()
            } : n && n.isVector2 ? e.uniforms[i] = {
                type: "v2",
                value: n.toArray()
            } : n && n.isVector3 ? e.uniforms[i] = {
                type: "v3",
                value: n.toArray()
            } : n && n.isVector4 ? e.uniforms[i] = {
                type: "v4",
                value: n.toArray()
            } : n && n.isMatrix3 ? e.uniforms[i] = {
                type: "m3",
                value: n.toArray()
            } : n && n.isMatrix4 ? e.uniforms[i] = {
                type: "m4",
                value: n.toArray()
            } : e.uniforms[i] = {
                value: n
            };
        }
        Object.keys(this.defines).length > 0 && (e.defines = this.defines), e.vertexShader = this.vertexShader, 
        e.fragmentShader = this.fragmentShader, e.lights = this.lights, e.clipping = this.clipping;
        const i = {};
        for (const t in this.extensions) !0 === this.extensions[t] && (i[t] = !0);
        return Object.keys(i).length > 0 && (e.extensions = i), e;
    }
}

class li extends ee {
    constructor() {
        super(), this.isCamera = !0, this.type = "Camera", this.matrixWorldInverse = new Rt, 
        this.projectionMatrix = new Rt, this.projectionMatrixInverse = new Rt;
    }
    copy(t, e) {
        return super.copy(t, e), this.matrixWorldInverse.copy(t.matrixWorldInverse), this.projectionMatrix.copy(t.projectionMatrix), 
        this.projectionMatrixInverse.copy(t.projectionMatrixInverse), this;
    }
    getWorldDirection(t) {
        this.updateWorldMatrix(!0, !1);
        const e = this.matrixWorld.elements;
        return t.set(-e[8], -e[9], -e[10]).normalize();
    }
    updateMatrixWorld(t) {
        super.updateMatrixWorld(t), this.matrixWorldInverse.copy(this.matrixWorld).invert();
    }
    updateWorldMatrix(t, e) {
        super.updateWorldMatrix(t, e), this.matrixWorldInverse.copy(this.matrixWorld).invert();
    }
    clone() {
        return (new this.constructor).copy(this);
    }
}

class hi extends li {
    constructor(t = 50, e = 1, i = .1, n = 2e3) {
        super(), this.isPerspectiveCamera = !0, this.type = "PerspectiveCamera", this.fov = t, 
        this.zoom = 1, this.near = i, this.far = n, this.focus = 10, this.aspect = e, this.view = null, 
        this.filmGauge = 35, this.filmOffset = 0, this.updateProjectionMatrix();
    }
    copy(t, e) {
        return super.copy(t, e), this.fov = t.fov, this.zoom = t.zoom, this.near = t.near, 
        this.far = t.far, this.focus = t.focus, this.aspect = t.aspect, this.view = null === t.view ? null : Object.assign({}, t.view), 
        this.filmGauge = t.filmGauge, this.filmOffset = t.filmOffset, this;
    }
    setFocalLength(t) {
        const e = .5 * this.getFilmHeight() / t;
        this.fov = 2 * _ * Math.atan(e), this.updateProjectionMatrix();
    }
    getFocalLength() {
        const t = Math.tan(.5 * v * this.fov);
        return .5 * this.getFilmHeight() / t;
    }
    getEffectiveFOV() {
        return 2 * _ * Math.atan(Math.tan(.5 * v * this.fov) / this.zoom);
    }
    getFilmWidth() {
        return this.filmGauge * Math.min(this.aspect, 1);
    }
    getFilmHeight() {
        return this.filmGauge / Math.max(this.aspect, 1);
    }
    setViewOffset(t, e, i, n, r, s) {
        this.aspect = t / e, null === this.view && (this.view = {
            enabled: !0,
            fullWidth: 1,
            fullHeight: 1,
            offsetX: 0,
            offsetY: 0,
            width: 1,
            height: 1
        }), this.view.enabled = !0, this.view.fullWidth = t, this.view.fullHeight = e, this.view.offsetX = i, 
        this.view.offsetY = n, this.view.width = r, this.view.height = s, this.updateProjectionMatrix();
    }
    clearViewOffset() {
        null !== this.view && (this.view.enabled = !1), this.updateProjectionMatrix();
    }
    updateProjectionMatrix() {
        const t = this.near;
        let e = t * Math.tan(.5 * v * this.fov) / this.zoom, i = 2 * e, n = this.aspect * i, r = -.5 * n;
        const s = this.view;
        if (null !== this.view && this.view.enabled) {
            const t = s.fullWidth, a = s.fullHeight;
            r += s.offsetX * n / t, e -= s.offsetY * i / a, n *= s.width / t, i *= s.height / a;
        }
        const a = this.filmOffset;
        0 !== a && (r += t * a / this.getFilmWidth()), this.projectionMatrix.makePerspective(r, r + n, e, e - i, t, this.far), 
        this.projectionMatrixInverse.copy(this.projectionMatrix).invert();
    }
    toJSON(t) {
        const e = super.toJSON(t);
        return e.object.fov = this.fov, e.object.zoom = this.zoom, e.object.near = this.near, 
        e.object.far = this.far, e.object.focus = this.focus, e.object.aspect = this.aspect, 
        null !== this.view && (e.object.view = Object.assign({}, this.view)), e.object.filmGauge = this.filmGauge, 
        e.object.filmOffset = this.filmOffset, e;
    }
}

class ci extends ee {
    constructor(t, e, i) {
        super(), this.type = "CubeCamera", this.renderTarget = i;
        const n = new hi(-90, 1, t, e);
        n.layers = this.layers, n.up.set(0, 1, 0), n.lookAt(1, 0, 0), this.add(n);
        const r = new hi(-90, 1, t, e);
        r.layers = this.layers, r.up.set(0, 1, 0), r.lookAt(-1, 0, 0), this.add(r);
        const s = new hi(-90, 1, t, e);
        s.layers = this.layers, s.up.set(0, 0, -1), s.lookAt(0, 1, 0), this.add(s);
        const a = new hi(-90, 1, t, e);
        a.layers = this.layers, a.up.set(0, 0, 1), a.lookAt(0, -1, 0), this.add(a);
        const o = new hi(-90, 1, t, e);
        o.layers = this.layers, o.up.set(0, 1, 0), o.lookAt(0, 0, 1), this.add(o);
        const l = new hi(-90, 1, t, e);
        l.layers = this.layers, l.up.set(0, 1, 0), l.lookAt(0, 0, -1), this.add(l);
    }
    update(t, e) {
        null === this.parent && this.updateMatrixWorld();
        const i = this.renderTarget, [n, r, s, a, o, l] = this.children, h = t.getRenderTarget(), c = t.toneMapping, d = t.xr.enabled;
        t.toneMapping = 0, t.xr.enabled = !1;
        const u = i.texture.generateMipmaps;
        i.texture.generateMipmaps = !1, t.setRenderTarget(i, 0), t.render(e, n), t.setRenderTarget(i, 1), 
        t.render(e, r), t.setRenderTarget(i, 2), t.render(e, s), t.setRenderTarget(i, 3), 
        t.render(e, a), t.setRenderTarget(i, 4), t.render(e, o), i.texture.generateMipmaps = u, 
        t.setRenderTarget(i, 5), t.render(e, l), t.setRenderTarget(h), t.toneMapping = c, 
        t.xr.enabled = d, i.texture.needsPMREMUpdate = !0;
    }
}

class di extends K {
    constructor(t, e, i, n, r, s, a, o, l, h) {
        super(t = void 0 !== t ? t : [], e = void 0 !== e ? e : 301, i, n, r, s, a, o, l, h), 
        this.isCubeTexture = !0, this.flipY = !1;
    }
    get images() {
        return this.image;
    }
    set images(t) {
        this.image = t;
    }
}

class ui extends Z {
    constructor(t = 1, e = {}) {
        super(t, t, e), this.isWebGLCubeRenderTarget = !0;
        const i = {
            width: t,
            height: t,
            depth: 1
        }, n = [ i, i, i, i, i, i ];
        void 0 !== e.encoding && (N("THREE.WebGLCubeRenderTarget: option.encoding has been replaced by option.colorSpace."), 
        e.colorSpace = 3001 === e.encoding ? "srgb" : ""), this.texture = new di(n, e.mapping, e.wrapS, e.wrapT, e.magFilter, e.minFilter, e.format, e.type, e.anisotropy, e.colorSpace), 
        this.texture.isRenderTargetTexture = !0, this.texture.generateMipmaps = void 0 !== e.generateMipmaps && e.generateMipmaps, 
        this.texture.minFilter = void 0 !== e.minFilter ? e.minFilter : 1006;
    }
    fromEquirectangularTexture(t, e) {
        this.texture.type = e.type, this.texture.colorSpace = e.colorSpace, this.texture.generateMipmaps = e.generateMipmaps, 
        this.texture.minFilter = e.minFilter, this.texture.magFilter = e.magFilter;
        const i = {
            uniforms: {
                tEquirect: {
                    value: null
                }
            },
            vertexShader: "\n\n\t\t\t\tvarying vec3 vWorldDirection;\n\n\t\t\t\tvec3 transformDirection( in vec3 dir, in mat4 matrix ) {\n\n\t\t\t\t\treturn normalize( ( matrix * vec4( dir, 0.0 ) ).xyz );\n\n\t\t\t\t}\n\n\t\t\t\tvoid main() {\n\n\t\t\t\t\tvWorldDirection = transformDirection( position, modelMatrix );\n\n\t\t\t\t\t#include <begin_vertex>\n\t\t\t\t\t#include <project_vertex>\n\n\t\t\t\t}\n\t\t\t",
            fragmentShader: "\n\n\t\t\t\tuniform sampler2D tEquirect;\n\n\t\t\t\tvarying vec3 vWorldDirection;\n\n\t\t\t\t#include <common>\n\n\t\t\t\tvoid main() {\n\n\t\t\t\t\tvec3 direction = normalize( vWorldDirection );\n\n\t\t\t\t\tvec2 sampleUV = equirectUv( direction );\n\n\t\t\t\t\tgl_FragColor = texture2D( tEquirect, sampleUV );\n\n\t\t\t\t}\n\t\t\t"
        }, n = new ii(5, 5, 5), r = new oi({
            name: "CubemapFromEquirect",
            uniforms: ni(i.uniforms),
            vertexShader: i.vertexShader,
            fragmentShader: i.fragmentShader,
            side: 1,
            blending: 0
        });
        r.uniforms.tEquirect.value = e;
        const s = new ti(n, r), a = e.minFilter;
        1008 === e.minFilter && (e.minFilter = 1006);
        return new ci(1, 10, this).update(t, s), e.minFilter = a, s.geometry.dispose(), 
        s.material.dispose(), this;
    }
    clear(t, e, i, n) {
        const r = t.getRenderTarget();
        for (let r = 0; r < 6; r++) t.setRenderTarget(this, r), t.clear(e, i, n);
        t.setRenderTarget(r);
    }
}

const pi = new tt, gi = new tt, fi = new R;

class mi {
    constructor(t = new tt(1, 0, 0), e = 0) {
        this.isPlane = !0, this.normal = t, this.constant = e;
    }
    set(t, e) {
        return this.normal.copy(t), this.constant = e, this;
    }
    setComponents(t, e, i, n) {
        return this.normal.set(t, e, i), this.constant = n, this;
    }
    setFromNormalAndCoplanarPoint(t, e) {
        return this.normal.copy(t), this.constant = -e.dot(this.normal), this;
    }
    setFromCoplanarPoints(t, e, i) {
        const n = pi.subVectors(i, e).cross(gi.subVectors(t, e)).normalize();
        return this.setFromNormalAndCoplanarPoint(n, t), this;
    }
    copy(t) {
        return this.normal.copy(t.normal), this.constant = t.constant, this;
    }
    normalize() {
        const t = 1 / this.normal.length();
        return this.normal.multiplyScalar(t), this.constant *= t, this;
    }
    negate() {
        return this.constant *= -1, this.normal.negate(), this;
    }
    distanceToPoint(t) {
        return this.normal.dot(t) + this.constant;
    }
    distanceToSphere(t) {
        return this.distanceToPoint(t.center) - t.radius;
    }
    projectPoint(t, e) {
        return e.copy(t).addScaledVector(this.normal, -this.distanceToPoint(t));
    }
    intersectLine(t, e) {
        const i = t.delta(pi), n = this.normal.dot(i);
        if (0 === n) return 0 === this.distanceToPoint(t.start) ? e.copy(t.start) : null;
        const r = -(t.start.dot(this.normal) + this.constant) / n;
        return r < 0 || r > 1 ? null : e.copy(t.start).addScaledVector(i, r);
    }
    intersectsLine(t) {
        const e = this.distanceToPoint(t.start), i = this.distanceToPoint(t.end);
        return e < 0 && i > 0 || i < 0 && e > 0;
    }
    intersectsBox(t) {
        return t.intersectsPlane(this);
    }
    intersectsSphere(t) {
        return t.intersectsPlane(this);
    }
    coplanarPoint(t) {
        return t.copy(this.normal).multiplyScalar(-this.constant);
    }
    applyMatrix4(t, e) {
        const i = e || fi.getNormalMatrix(t), n = this.coplanarPoint(pi).applyMatrix4(t), r = this.normal.applyMatrix3(i).normalize();
        return this.constant = -n.dot(r), this;
    }
    translate(t) {
        return this.constant -= t.dot(this.normal), this;
    }
    equals(t) {
        return t.normal.equals(this.normal) && t.constant === this.constant;
    }
    clone() {
        return (new this.constructor).copy(this);
    }
}

const vi = new bt, _i = new tt;

class xi {
    constructor(t = new mi, e = new mi, i = new mi, n = new mi, r = new mi, s = new mi) {
        this.planes = [ t, e, i, n, r, s ];
    }
    set(t, e, i, n, r, s) {
        const a = this.planes;
        return a[0].copy(t), a[1].copy(e), a[2].copy(i), a[3].copy(n), a[4].copy(r), a[5].copy(s), 
        this;
    }
    copy(t) {
        const e = this.planes;
        for (let i = 0; i < 6; i++) e[i].copy(t.planes[i]);
        return this;
    }
    setFromProjectionMatrix(t) {
        const e = this.planes, i = t.elements, n = i[0], r = i[1], s = i[2], a = i[3], o = i[4], l = i[5], h = i[6], c = i[7], d = i[8], u = i[9], p = i[10], g = i[11], f = i[12], m = i[13], v = i[14], _ = i[15];
        return e[0].setComponents(a - n, c - o, g - d, _ - f).normalize(), e[1].setComponents(a + n, c + o, g + d, _ + f).normalize(), 
        e[2].setComponents(a + r, c + l, g + u, _ + m).normalize(), e[3].setComponents(a - r, c - l, g - u, _ - m).normalize(), 
        e[4].setComponents(a - s, c - h, g - p, _ - v).normalize(), e[5].setComponents(a + s, c + h, g + p, _ + v).normalize(), 
        this;
    }
    intersectsObject(t) {
        if (void 0 !== t.boundingSphere) null === t.boundingSphere && t.computeBoundingSphere(), 
        vi.copy(t.boundingSphere).applyMatrix4(t.matrixWorld); else {
            const e = t.geometry;
            null === e.boundingSphere && e.computeBoundingSphere(), vi.copy(e.boundingSphere).applyMatrix4(t.matrixWorld);
        }
        return this.intersectsSphere(vi);
    }
    intersectsSprite(t) {
        return vi.center.set(0, 0, 0), vi.radius = .7071067811865476, vi.applyMatrix4(t.matrixWorld), 
        this.intersectsSphere(vi);
    }
    intersectsSphere(t) {
        const e = this.planes, i = t.center, n = -t.radius;
        for (let t = 0; t < 6; t++) {
            if (e[t].distanceToPoint(i) < n) return !1;
        }
        return !0;
    }
    intersectsBox(t) {
        const e = this.planes;
        for (let i = 0; i < 6; i++) {
            const n = e[i];
            if (_i.x = n.normal.x > 0 ? t.max.x : t.min.x, _i.y = n.normal.y > 0 ? t.max.y : t.min.y, 
            _i.z = n.normal.z > 0 ? t.max.z : t.min.z, n.distanceToPoint(_i) < 0) return !1;
        }
        return !0;
    }
    containsPoint(t) {
        const e = this.planes;
        for (let i = 0; i < 6; i++) if (e[i].distanceToPoint(t) < 0) return !1;
        return !0;
    }
    clone() {
        return (new this.constructor).copy(this);
    }
}

function yi() {
    let t = null, e = !1, i = null, n = null;
    function r(e, s) {
        i(e, s), n = t.requestAnimationFrame(r);
    }
    return {
        start: function() {
            !0 !== e && null !== i && (n = t.requestAnimationFrame(r), e = !0);
        },
        stop: function() {
            t.cancelAnimationFrame(n), e = !1;
        },
        setAnimationLoop: function(t) {
            i = t;
        },
        setContext: function(e) {
            t = e;
        }
    };
}

function bi(t, e) {
    const i = e.isWebGL2, n = new WeakMap;
    return {
        get: function(t) {
            return t.isInterleavedBufferAttribute && (t = t.data), n.get(t);
        },
        remove: function(e) {
            e.isInterleavedBufferAttribute && (e = e.data);
            const i = n.get(e);
            i && (t.deleteBuffer(i.buffer), n.delete(e));
        },
        update: function(e, r) {
            if (e.isGLBufferAttribute) {
                const t = n.get(e);
                return void ((!t || t.version < e.version) && n.set(e, {
                    buffer: e.buffer,
                    type: e.type,
                    bytesPerElement: e.elementSize,
                    version: e.version
                }));
            }
            e.isInterleavedBufferAttribute && (e = e.data);
            const s = n.get(e);
            void 0 === s ? n.set(e, function(e, n) {
                const r = e.array, s = e.usage, a = t.createBuffer();
                let o;
                if (t.bindBuffer(n, a), t.bufferData(n, r, s), e.onUploadCallback(), r instanceof Float32Array) o = t.FLOAT; else if (r instanceof Uint16Array) if (e.isFloat16BufferAttribute) {
                    if (!i) throw new Error("THREE.WebGLAttributes: Usage of Float16BufferAttribute requires WebGL2.");
                    o = t.HALF_FLOAT;
                } else o = t.UNSIGNED_SHORT; else if (r instanceof Int16Array) o = t.SHORT; else if (r instanceof Uint32Array) o = t.UNSIGNED_INT; else if (r instanceof Int32Array) o = t.INT; else if (r instanceof Int8Array) o = t.BYTE; else if (r instanceof Uint8Array) o = t.UNSIGNED_BYTE; else {
                    if (!(r instanceof Uint8ClampedArray)) throw new Error("THREE.WebGLAttributes: Unsupported buffer data format: " + r);
                    o = t.UNSIGNED_BYTE;
                }
                return {
                    buffer: a,
                    type: o,
                    bytesPerElement: r.BYTES_PER_ELEMENT,
                    version: e.version
                };
            }(e, r)) : s.version < e.version && (!function(e, n, r) {
                const s = n.array, a = n.updateRange;
                t.bindBuffer(r, e), -1 === a.count ? t.bufferSubData(r, 0, s) : (i ? t.bufferSubData(r, a.offset * s.BYTES_PER_ELEMENT, s, a.offset, a.count) : t.bufferSubData(r, a.offset * s.BYTES_PER_ELEMENT, s.subarray(a.offset, a.offset + a.count)), 
                a.count = -1), n.onUploadCallback();
            }(s.buffer, e, r), s.version = e.version);
        }
    };
}

class Si extends Be {
    constructor(t = 1, e = 1, i = 1, n = 1) {
        super(), this.type = "PlaneGeometry", this.parameters = {
            width: t,
            height: e,
            widthSegments: i,
            heightSegments: n
        };
        const r = t / 2, s = e / 2, a = Math.floor(i), o = Math.floor(n), l = a + 1, h = o + 1, c = t / a, d = e / o, u = [], p = [], g = [], f = [];
        for (let t = 0; t < h; t++) {
            const e = t * d - s;
            for (let i = 0; i < l; i++) {
                const n = i * c - r;
                p.push(n, -e, 0), g.push(0, 0, 1), f.push(i / a), f.push(1 - t / o);
            }
        }
        for (let t = 0; t < o; t++) for (let e = 0; e < a; e++) {
            const i = e + l * t, n = e + l * (t + 1), r = e + 1 + l * (t + 1), s = e + 1 + l * t;
            u.push(i, n, s), u.push(n, r, s);
        }
        this.setIndex(u), this.setAttribute("position", new Ce(p, 3)), this.setAttribute("normal", new Ce(g, 3)), 
        this.setAttribute("uv", new Ce(f, 2));
    }
    copy(t) {
        return super.copy(t), this.parameters = Object.assign({}, t.parameters), this;
    }
    static fromJSON(t) {
        return new Si(t.width, t.height, t.widthSegments, t.heightSegments);
    }
}

const wi = {
    alphamap_fragment: "#ifdef USE_ALPHAMAP\n\tdiffuseColor.a *= texture2D( alphaMap, vAlphaMapUv ).g;\n#endif",
    alphamap_pars_fragment: "#ifdef USE_ALPHAMAP\n\tuniform sampler2D alphaMap;\n#endif",
    alphatest_fragment: "#ifdef USE_ALPHATEST\n\tif ( diffuseColor.a < alphaTest ) discard;\n#endif",
    alphatest_pars_fragment: "#ifdef USE_ALPHATEST\n\tuniform float alphaTest;\n#endif",
    aomap_fragment: "#ifdef USE_AOMAP\n\tfloat ambientOcclusion = ( texture2D( aoMap, vAoMapUv ).r - 1.0 ) * aoMapIntensity + 1.0;\n\treflectedLight.indirectDiffuse *= ambientOcclusion;\n\t#if defined( USE_ENVMAP ) && defined( STANDARD )\n\t\tfloat dotNV = saturate( dot( geometry.normal, geometry.viewDir ) );\n\t\treflectedLight.indirectSpecular *= computeSpecularOcclusion( dotNV, ambientOcclusion, material.roughness );\n\t#endif\n#endif",
    aomap_pars_fragment: "#ifdef USE_AOMAP\n\tuniform sampler2D aoMap;\n\tuniform float aoMapIntensity;\n#endif",
    begin_vertex: "vec3 transformed = vec3( position );",
    beginnormal_vertex: "vec3 objectNormal = vec3( normal );\n#ifdef USE_TANGENT\n\tvec3 objectTangent = vec3( tangent.xyz );\n#endif",
    bsdfs: "float G_BlinnPhong_Implicit( ) {\n\treturn 0.25;\n}\nfloat D_BlinnPhong( const in float shininess, const in float dotNH ) {\n\treturn RECIPROCAL_PI * ( shininess * 0.5 + 1.0 ) * pow( dotNH, shininess );\n}\nvec3 BRDF_BlinnPhong( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in vec3 specularColor, const in float shininess ) {\n\tvec3 halfDir = normalize( lightDir + viewDir );\n\tfloat dotNH = saturate( dot( normal, halfDir ) );\n\tfloat dotVH = saturate( dot( viewDir, halfDir ) );\n\tvec3 F = F_Schlick( specularColor, 1.0, dotVH );\n\tfloat G = G_BlinnPhong_Implicit( );\n\tfloat D = D_BlinnPhong( shininess, dotNH );\n\treturn F * ( G * D );\n} // validated",
    iridescence_fragment: "#ifdef USE_IRIDESCENCE\n\tconst mat3 XYZ_TO_REC709 = mat3(\n\t\t 3.2404542, -0.9692660,  0.0556434,\n\t\t-1.5371385,  1.8760108, -0.2040259,\n\t\t-0.4985314,  0.0415560,  1.0572252\n\t);\n\tvec3 Fresnel0ToIor( vec3 fresnel0 ) {\n\t\tvec3 sqrtF0 = sqrt( fresnel0 );\n\t\treturn ( vec3( 1.0 ) + sqrtF0 ) / ( vec3( 1.0 ) - sqrtF0 );\n\t}\n\tvec3 IorToFresnel0( vec3 transmittedIor, float incidentIor ) {\n\t\treturn pow2( ( transmittedIor - vec3( incidentIor ) ) / ( transmittedIor + vec3( incidentIor ) ) );\n\t}\n\tfloat IorToFresnel0( float transmittedIor, float incidentIor ) {\n\t\treturn pow2( ( transmittedIor - incidentIor ) / ( transmittedIor + incidentIor ));\n\t}\n\tvec3 evalSensitivity( float OPD, vec3 shift ) {\n\t\tfloat phase = 2.0 * PI * OPD * 1.0e-9;\n\t\tvec3 val = vec3( 5.4856e-13, 4.4201e-13, 5.2481e-13 );\n\t\tvec3 pos = vec3( 1.6810e+06, 1.7953e+06, 2.2084e+06 );\n\t\tvec3 var = vec3( 4.3278e+09, 9.3046e+09, 6.6121e+09 );\n\t\tvec3 xyz = val * sqrt( 2.0 * PI * var ) * cos( pos * phase + shift ) * exp( - pow2( phase ) * var );\n\t\txyz.x += 9.7470e-14 * sqrt( 2.0 * PI * 4.5282e+09 ) * cos( 2.2399e+06 * phase + shift[ 0 ] ) * exp( - 4.5282e+09 * pow2( phase ) );\n\t\txyz /= 1.0685e-7;\n\t\tvec3 rgb = XYZ_TO_REC709 * xyz;\n\t\treturn rgb;\n\t}\n\tvec3 evalIridescence( float outsideIOR, float eta2, float cosTheta1, float thinFilmThickness, vec3 baseF0 ) {\n\t\tvec3 I;\n\t\tfloat iridescenceIOR = mix( outsideIOR, eta2, smoothstep( 0.0, 0.03, thinFilmThickness ) );\n\t\tfloat sinTheta2Sq = pow2( outsideIOR / iridescenceIOR ) * ( 1.0 - pow2( cosTheta1 ) );\n\t\tfloat cosTheta2Sq = 1.0 - sinTheta2Sq;\n\t\tif ( cosTheta2Sq < 0.0 ) {\n\t\t\t return vec3( 1.0 );\n\t\t}\n\t\tfloat cosTheta2 = sqrt( cosTheta2Sq );\n\t\tfloat R0 = IorToFresnel0( iridescenceIOR, outsideIOR );\n\t\tfloat R12 = F_Schlick( R0, 1.0, cosTheta1 );\n\t\tfloat R21 = R12;\n\t\tfloat T121 = 1.0 - R12;\n\t\tfloat phi12 = 0.0;\n\t\tif ( iridescenceIOR < outsideIOR ) phi12 = PI;\n\t\tfloat phi21 = PI - phi12;\n\t\tvec3 baseIOR = Fresnel0ToIor( clamp( baseF0, 0.0, 0.9999 ) );\t\tvec3 R1 = IorToFresnel0( baseIOR, iridescenceIOR );\n\t\tvec3 R23 = F_Schlick( R1, 1.0, cosTheta2 );\n\t\tvec3 phi23 = vec3( 0.0 );\n\t\tif ( baseIOR[ 0 ] < iridescenceIOR ) phi23[ 0 ] = PI;\n\t\tif ( baseIOR[ 1 ] < iridescenceIOR ) phi23[ 1 ] = PI;\n\t\tif ( baseIOR[ 2 ] < iridescenceIOR ) phi23[ 2 ] = PI;\n\t\tfloat OPD = 2.0 * iridescenceIOR * thinFilmThickness * cosTheta2;\n\t\tvec3 phi = vec3( phi21 ) + phi23;\n\t\tvec3 R123 = clamp( R12 * R23, 1e-5, 0.9999 );\n\t\tvec3 r123 = sqrt( R123 );\n\t\tvec3 Rs = pow2( T121 ) * R23 / ( vec3( 1.0 ) - R123 );\n\t\tvec3 C0 = R12 + Rs;\n\t\tI = C0;\n\t\tvec3 Cm = Rs - T121;\n\t\tfor ( int m = 1; m <= 2; ++ m ) {\n\t\t\tCm *= r123;\n\t\t\tvec3 Sm = 2.0 * evalSensitivity( float( m ) * OPD, float( m ) * phi );\n\t\t\tI += Cm * Sm;\n\t\t}\n\t\treturn max( I, vec3( 0.0 ) );\n\t}\n#endif",
    bumpmap_pars_fragment: "#ifdef USE_BUMPMAP\n\tuniform sampler2D bumpMap;\n\tuniform float bumpScale;\n\tvec2 dHdxy_fwd() {\n\t\tvec2 dSTdx = dFdx( vBumpMapUv );\n\t\tvec2 dSTdy = dFdy( vBumpMapUv );\n\t\tfloat Hll = bumpScale * texture2D( bumpMap, vBumpMapUv ).x;\n\t\tfloat dBx = bumpScale * texture2D( bumpMap, vBumpMapUv + dSTdx ).x - Hll;\n\t\tfloat dBy = bumpScale * texture2D( bumpMap, vBumpMapUv + dSTdy ).x - Hll;\n\t\treturn vec2( dBx, dBy );\n\t}\n\tvec3 perturbNormalArb( vec3 surf_pos, vec3 surf_norm, vec2 dHdxy, float faceDirection ) {\n\t\tvec3 vSigmaX = dFdx( surf_pos.xyz );\n\t\tvec3 vSigmaY = dFdy( surf_pos.xyz );\n\t\tvec3 vN = surf_norm;\n\t\tvec3 R1 = cross( vSigmaY, vN );\n\t\tvec3 R2 = cross( vN, vSigmaX );\n\t\tfloat fDet = dot( vSigmaX, R1 ) * faceDirection;\n\t\tvec3 vGrad = sign( fDet ) * ( dHdxy.x * R1 + dHdxy.y * R2 );\n\t\treturn normalize( abs( fDet ) * surf_norm - vGrad );\n\t}\n#endif",
    clipping_planes_fragment: "#if NUM_CLIPPING_PLANES > 0\n\tvec4 plane;\n\t#pragma unroll_loop_start\n\tfor ( int i = 0; i < UNION_CLIPPING_PLANES; i ++ ) {\n\t\tplane = clippingPlanes[ i ];\n\t\tif ( dot( vClipPosition, plane.xyz ) > plane.w ) discard;\n\t}\n\t#pragma unroll_loop_end\n\t#if UNION_CLIPPING_PLANES < NUM_CLIPPING_PLANES\n\t\tbool clipped = true;\n\t\t#pragma unroll_loop_start\n\t\tfor ( int i = UNION_CLIPPING_PLANES; i < NUM_CLIPPING_PLANES; i ++ ) {\n\t\t\tplane = clippingPlanes[ i ];\n\t\t\tclipped = ( dot( vClipPosition, plane.xyz ) > plane.w ) && clipped;\n\t\t}\n\t\t#pragma unroll_loop_end\n\t\tif ( clipped ) discard;\n\t#endif\n#endif",
    clipping_planes_pars_fragment: "#if NUM_CLIPPING_PLANES > 0\n\tvarying vec3 vClipPosition;\n\tuniform vec4 clippingPlanes[ NUM_CLIPPING_PLANES ];\n#endif",
    clipping_planes_pars_vertex: "#if NUM_CLIPPING_PLANES > 0\n\tvarying vec3 vClipPosition;\n#endif",
    clipping_planes_vertex: "#if NUM_CLIPPING_PLANES > 0\n\tvClipPosition = - mvPosition.xyz;\n#endif",
    color_fragment: "#if defined( USE_COLOR_ALPHA )\n\tdiffuseColor *= vColor;\n#elif defined( USE_COLOR )\n\tdiffuseColor.rgb *= vColor;\n#endif",
    color_pars_fragment: "#if defined( USE_COLOR_ALPHA )\n\tvarying vec4 vColor;\n#elif defined( USE_COLOR )\n\tvarying vec3 vColor;\n#endif",
    color_pars_vertex: "#if defined( USE_COLOR_ALPHA )\n\tvarying vec4 vColor;\n#elif defined( USE_COLOR ) || defined( USE_INSTANCING_COLOR )\n\tvarying vec3 vColor;\n#endif",
    color_vertex: "#if defined( USE_COLOR_ALPHA )\n\tvColor = vec4( 1.0 );\n#elif defined( USE_COLOR ) || defined( USE_INSTANCING_COLOR )\n\tvColor = vec3( 1.0 );\n#endif\n#ifdef USE_COLOR\n\tvColor *= color;\n#endif\n#ifdef USE_INSTANCING_COLOR\n\tvColor.xyz *= instanceColor.xyz;\n#endif",
    common: "#define PI 3.141592653589793\n#define PI2 6.283185307179586\n#define PI_HALF 1.5707963267948966\n#define RECIPROCAL_PI 0.3183098861837907\n#define RECIPROCAL_PI2 0.15915494309189535\n#define EPSILON 1e-6\n#ifndef saturate\n#define saturate( a ) clamp( a, 0.0, 1.0 )\n#endif\n#define whiteComplement( a ) ( 1.0 - saturate( a ) )\nfloat pow2( const in float x ) { return x*x; }\nvec3 pow2( const in vec3 x ) { return x*x; }\nfloat pow3( const in float x ) { return x*x*x; }\nfloat pow4( const in float x ) { float x2 = x*x; return x2*x2; }\nfloat max3( const in vec3 v ) { return max( max( v.x, v.y ), v.z ); }\nfloat average( const in vec3 v ) { return dot( v, vec3( 0.3333333 ) ); }\nhighp float rand( const in vec2 uv ) {\n\tconst highp float a = 12.9898, b = 78.233, c = 43758.5453;\n\thighp float dt = dot( uv.xy, vec2( a,b ) ), sn = mod( dt, PI );\n\treturn fract( sin( sn ) * c );\n}\n#ifdef HIGH_PRECISION\n\tfloat precisionSafeLength( vec3 v ) { return length( v ); }\n#else\n\tfloat precisionSafeLength( vec3 v ) {\n\t\tfloat maxComponent = max3( abs( v ) );\n\t\treturn length( v / maxComponent ) * maxComponent;\n\t}\n#endif\nstruct IncidentLight {\n\tvec3 color;\n\tvec3 direction;\n\tbool visible;\n};\nstruct ReflectedLight {\n\tvec3 directDiffuse;\n\tvec3 directSpecular;\n\tvec3 indirectDiffuse;\n\tvec3 indirectSpecular;\n};\nstruct GeometricContext {\n\tvec3 position;\n\tvec3 normal;\n\tvec3 viewDir;\n#ifdef USE_CLEARCOAT\n\tvec3 clearcoatNormal;\n#endif\n};\nvec3 transformDirection( in vec3 dir, in mat4 matrix ) {\n\treturn normalize( ( matrix * vec4( dir, 0.0 ) ).xyz );\n}\nvec3 inverseTransformDirection( in vec3 dir, in mat4 matrix ) {\n\treturn normalize( ( vec4( dir, 0.0 ) * matrix ).xyz );\n}\nmat3 transposeMat3( const in mat3 m ) {\n\tmat3 tmp;\n\ttmp[ 0 ] = vec3( m[ 0 ].x, m[ 1 ].x, m[ 2 ].x );\n\ttmp[ 1 ] = vec3( m[ 0 ].y, m[ 1 ].y, m[ 2 ].y );\n\ttmp[ 2 ] = vec3( m[ 0 ].z, m[ 1 ].z, m[ 2 ].z );\n\treturn tmp;\n}\nfloat luminance( const in vec3 rgb ) {\n\tconst vec3 weights = vec3( 0.2126729, 0.7151522, 0.0721750 );\n\treturn dot( weights, rgb );\n}\nbool isPerspectiveMatrix( mat4 m ) {\n\treturn m[ 2 ][ 3 ] == - 1.0;\n}\nvec2 equirectUv( in vec3 dir ) {\n\tfloat u = atan( dir.z, dir.x ) * RECIPROCAL_PI2 + 0.5;\n\tfloat v = asin( clamp( dir.y, - 1.0, 1.0 ) ) * RECIPROCAL_PI + 0.5;\n\treturn vec2( u, v );\n}\nvec3 BRDF_Lambert( const in vec3 diffuseColor ) {\n\treturn RECIPROCAL_PI * diffuseColor;\n}\nvec3 F_Schlick( const in vec3 f0, const in float f90, const in float dotVH ) {\n\tfloat fresnel = exp2( ( - 5.55473 * dotVH - 6.98316 ) * dotVH );\n\treturn f0 * ( 1.0 - fresnel ) + ( f90 * fresnel );\n}\nfloat F_Schlick( const in float f0, const in float f90, const in float dotVH ) {\n\tfloat fresnel = exp2( ( - 5.55473 * dotVH - 6.98316 ) * dotVH );\n\treturn f0 * ( 1.0 - fresnel ) + ( f90 * fresnel );\n} // validated",
    cube_uv_reflection_fragment: "#ifdef ENVMAP_TYPE_CUBE_UV\n\t#define cubeUV_minMipLevel 4.0\n\t#define cubeUV_minTileSize 16.0\n\tfloat getFace( vec3 direction ) {\n\t\tvec3 absDirection = abs( direction );\n\t\tfloat face = - 1.0;\n\t\tif ( absDirection.x > absDirection.z ) {\n\t\t\tif ( absDirection.x > absDirection.y )\n\t\t\t\tface = direction.x > 0.0 ? 0.0 : 3.0;\n\t\t\telse\n\t\t\t\tface = direction.y > 0.0 ? 1.0 : 4.0;\n\t\t} else {\n\t\t\tif ( absDirection.z > absDirection.y )\n\t\t\t\tface = direction.z > 0.0 ? 2.0 : 5.0;\n\t\t\telse\n\t\t\t\tface = direction.y > 0.0 ? 1.0 : 4.0;\n\t\t}\n\t\treturn face;\n\t}\n\tvec2 getUV( vec3 direction, float face ) {\n\t\tvec2 uv;\n\t\tif ( face == 0.0 ) {\n\t\t\tuv = vec2( direction.z, direction.y ) / abs( direction.x );\n\t\t} else if ( face == 1.0 ) {\n\t\t\tuv = vec2( - direction.x, - direction.z ) / abs( direction.y );\n\t\t} else if ( face == 2.0 ) {\n\t\t\tuv = vec2( - direction.x, direction.y ) / abs( direction.z );\n\t\t} else if ( face == 3.0 ) {\n\t\t\tuv = vec2( - direction.z, direction.y ) / abs( direction.x );\n\t\t} else if ( face == 4.0 ) {\n\t\t\tuv = vec2( - direction.x, direction.z ) / abs( direction.y );\n\t\t} else {\n\t\t\tuv = vec2( direction.x, direction.y ) / abs( direction.z );\n\t\t}\n\t\treturn 0.5 * ( uv + 1.0 );\n\t}\n\tvec3 bilinearCubeUV( sampler2D envMap, vec3 direction, float mipInt ) {\n\t\tfloat face = getFace( direction );\n\t\tfloat filterInt = max( cubeUV_minMipLevel - mipInt, 0.0 );\n\t\tmipInt = max( mipInt, cubeUV_minMipLevel );\n\t\tfloat faceSize = exp2( mipInt );\n\t\thighp vec2 uv = getUV( direction, face ) * ( faceSize - 2.0 ) + 1.0;\n\t\tif ( face > 2.0 ) {\n\t\t\tuv.y += faceSize;\n\t\t\tface -= 3.0;\n\t\t}\n\t\tuv.x += face * faceSize;\n\t\tuv.x += filterInt * 3.0 * cubeUV_minTileSize;\n\t\tuv.y += 4.0 * ( exp2( CUBEUV_MAX_MIP ) - faceSize );\n\t\tuv.x *= CUBEUV_TEXEL_WIDTH;\n\t\tuv.y *= CUBEUV_TEXEL_HEIGHT;\n\t\t#ifdef texture2DGradEXT\n\t\t\treturn texture2DGradEXT( envMap, uv, vec2( 0.0 ), vec2( 0.0 ) ).rgb;\n\t\t#else\n\t\t\treturn texture2D( envMap, uv ).rgb;\n\t\t#endif\n\t}\n\t#define cubeUV_r0 1.0\n\t#define cubeUV_v0 0.339\n\t#define cubeUV_m0 - 2.0\n\t#define cubeUV_r1 0.8\n\t#define cubeUV_v1 0.276\n\t#define cubeUV_m1 - 1.0\n\t#define cubeUV_r4 0.4\n\t#define cubeUV_v4 0.046\n\t#define cubeUV_m4 2.0\n\t#define cubeUV_r5 0.305\n\t#define cubeUV_v5 0.016\n\t#define cubeUV_m5 3.0\n\t#define cubeUV_r6 0.21\n\t#define cubeUV_v6 0.0038\n\t#define cubeUV_m6 4.0\n\tfloat roughnessToMip( float roughness ) {\n\t\tfloat mip = 0.0;\n\t\tif ( roughness >= cubeUV_r1 ) {\n\t\t\tmip = ( cubeUV_r0 - roughness ) * ( cubeUV_m1 - cubeUV_m0 ) / ( cubeUV_r0 - cubeUV_r1 ) + cubeUV_m0;\n\t\t} else if ( roughness >= cubeUV_r4 ) {\n\t\t\tmip = ( cubeUV_r1 - roughness ) * ( cubeUV_m4 - cubeUV_m1 ) / ( cubeUV_r1 - cubeUV_r4 ) + cubeUV_m1;\n\t\t} else if ( roughness >= cubeUV_r5 ) {\n\t\t\tmip = ( cubeUV_r4 - roughness ) * ( cubeUV_m5 - cubeUV_m4 ) / ( cubeUV_r4 - cubeUV_r5 ) + cubeUV_m4;\n\t\t} else if ( roughness >= cubeUV_r6 ) {\n\t\t\tmip = ( cubeUV_r5 - roughness ) * ( cubeUV_m6 - cubeUV_m5 ) / ( cubeUV_r5 - cubeUV_r6 ) + cubeUV_m5;\n\t\t} else {\n\t\t\tmip = - 2.0 * log2( 1.16 * roughness );\t\t}\n\t\treturn mip;\n\t}\n\tvec4 textureCubeUV( sampler2D envMap, vec3 sampleDir, float roughness ) {\n\t\tfloat mip = clamp( roughnessToMip( roughness ), cubeUV_m0, CUBEUV_MAX_MIP );\n\t\tfloat mipF = fract( mip );\n\t\tfloat mipInt = floor( mip );\n\t\tvec3 color0 = bilinearCubeUV( envMap, sampleDir, mipInt );\n\t\tif ( mipF == 0.0 ) {\n\t\t\treturn vec4( color0, 1.0 );\n\t\t} else {\n\t\t\tvec3 color1 = bilinearCubeUV( envMap, sampleDir, mipInt + 1.0 );\n\t\t\treturn vec4( mix( color0, color1, mipF ), 1.0 );\n\t\t}\n\t}\n#endif",
    defaultnormal_vertex: "vec3 transformedNormal = objectNormal;\n#ifdef USE_INSTANCING\n\tmat3 m = mat3( instanceMatrix );\n\ttransformedNormal /= vec3( dot( m[ 0 ], m[ 0 ] ), dot( m[ 1 ], m[ 1 ] ), dot( m[ 2 ], m[ 2 ] ) );\n\ttransformedNormal = m * transformedNormal;\n#endif\ntransformedNormal = normalMatrix * transformedNormal;\n#ifdef FLIP_SIDED\n\ttransformedNormal = - transformedNormal;\n#endif\n#ifdef USE_TANGENT\n\tvec3 transformedTangent = ( modelViewMatrix * vec4( objectTangent, 0.0 ) ).xyz;\n\t#ifdef FLIP_SIDED\n\t\ttransformedTangent = - transformedTangent;\n\t#endif\n#endif",
    displacementmap_pars_vertex: "#ifdef USE_DISPLACEMENTMAP\n\tuniform sampler2D displacementMap;\n\tuniform float displacementScale;\n\tuniform float displacementBias;\n#endif",
    displacementmap_vertex: "#ifdef USE_DISPLACEMENTMAP\n\ttransformed += normalize( objectNormal ) * ( texture2D( displacementMap, vDisplacementMapUv ).x * displacementScale + displacementBias );\n#endif",
    emissivemap_fragment: "#ifdef USE_EMISSIVEMAP\n\tvec4 emissiveColor = texture2D( emissiveMap, vEmissiveMapUv );\n\ttotalEmissiveRadiance *= emissiveColor.rgb;\n#endif",
    emissivemap_pars_fragment: "#ifdef USE_EMISSIVEMAP\n\tuniform sampler2D emissiveMap;\n#endif",
    encodings_fragment: "gl_FragColor = linearToOutputTexel( gl_FragColor );",
    encodings_pars_fragment: "vec4 LinearToLinear( in vec4 value ) {\n\treturn value;\n}\nvec4 LinearTosRGB( in vec4 value ) {\n\treturn vec4( mix( pow( value.rgb, vec3( 0.41666 ) ) * 1.055 - vec3( 0.055 ), value.rgb * 12.92, vec3( lessThanEqual( value.rgb, vec3( 0.0031308 ) ) ) ), value.a );\n}",
    envmap_fragment: "#ifdef USE_ENVMAP\n\t#ifdef ENV_WORLDPOS\n\t\tvec3 cameraToFrag;\n\t\tif ( isOrthographic ) {\n\t\t\tcameraToFrag = normalize( vec3( - viewMatrix[ 0 ][ 2 ], - viewMatrix[ 1 ][ 2 ], - viewMatrix[ 2 ][ 2 ] ) );\n\t\t} else {\n\t\t\tcameraToFrag = normalize( vWorldPosition - cameraPosition );\n\t\t}\n\t\tvec3 worldNormal = inverseTransformDirection( normal, viewMatrix );\n\t\t#ifdef ENVMAP_MODE_REFLECTION\n\t\t\tvec3 reflectVec = reflect( cameraToFrag, worldNormal );\n\t\t#else\n\t\t\tvec3 reflectVec = refract( cameraToFrag, worldNormal, refractionRatio );\n\t\t#endif\n\t#else\n\t\tvec3 reflectVec = vReflect;\n\t#endif\n\t#ifdef ENVMAP_TYPE_CUBE\n\t\tvec4 envColor = textureCube( envMap, vec3( flipEnvMap * reflectVec.x, reflectVec.yz ) );\n\t#else\n\t\tvec4 envColor = vec4( 0.0 );\n\t#endif\n\t#ifdef ENVMAP_BLENDING_MULTIPLY\n\t\toutgoingLight = mix( outgoingLight, outgoingLight * envColor.xyz, specularStrength * reflectivity );\n\t#elif defined( ENVMAP_BLENDING_MIX )\n\t\toutgoingLight = mix( outgoingLight, envColor.xyz, specularStrength * reflectivity );\n\t#elif defined( ENVMAP_BLENDING_ADD )\n\t\toutgoingLight += envColor.xyz * specularStrength * reflectivity;\n\t#endif\n#endif",
    envmap_common_pars_fragment: "#ifdef USE_ENVMAP\n\tuniform float envMapIntensity;\n\tuniform float flipEnvMap;\n\t#ifdef ENVMAP_TYPE_CUBE\n\t\tuniform samplerCube envMap;\n\t#else\n\t\tuniform sampler2D envMap;\n\t#endif\n\t\n#endif",
    envmap_pars_fragment: "#ifdef USE_ENVMAP\n\tuniform float reflectivity;\n\t#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )\n\t\t#define ENV_WORLDPOS\n\t#endif\n\t#ifdef ENV_WORLDPOS\n\t\tvarying vec3 vWorldPosition;\n\t\tuniform float refractionRatio;\n\t#else\n\t\tvarying vec3 vReflect;\n\t#endif\n#endif",
    envmap_pars_vertex: "#ifdef USE_ENVMAP\n\t#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )\n\t\t#define ENV_WORLDPOS\n\t#endif\n\t#ifdef ENV_WORLDPOS\n\t\t\n\t\tvarying vec3 vWorldPosition;\n\t#else\n\t\tvarying vec3 vReflect;\n\t\tuniform float refractionRatio;\n\t#endif\n#endif",
    envmap_physical_pars_fragment: "#if defined( USE_ENVMAP )\n\tvec3 getIBLIrradiance( const in vec3 normal ) {\n\t\t#if defined( ENVMAP_TYPE_CUBE_UV )\n\t\t\tvec3 worldNormal = inverseTransformDirection( normal, viewMatrix );\n\t\t\tvec4 envMapColor = textureCubeUV( envMap, worldNormal, 1.0 );\n\t\t\treturn PI * envMapColor.rgb * envMapIntensity;\n\t\t#else\n\t\t\treturn vec3( 0.0 );\n\t\t#endif\n\t}\n\tvec3 getIBLRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness ) {\n\t\t#if defined( ENVMAP_TYPE_CUBE_UV )\n\t\t\tvec3 reflectVec = reflect( - viewDir, normal );\n\t\t\treflectVec = normalize( mix( reflectVec, normal, roughness * roughness) );\n\t\t\treflectVec = inverseTransformDirection( reflectVec, viewMatrix );\n\t\t\tvec4 envMapColor = textureCubeUV( envMap, reflectVec, roughness );\n\t\t\treturn envMapColor.rgb * envMapIntensity;\n\t\t#else\n\t\t\treturn vec3( 0.0 );\n\t\t#endif\n\t}\n#endif",
    envmap_vertex: "#ifdef USE_ENVMAP\n\t#ifdef ENV_WORLDPOS\n\t\tvWorldPosition = worldPosition.xyz;\n\t#else\n\t\tvec3 cameraToVertex;\n\t\tif ( isOrthographic ) {\n\t\t\tcameraToVertex = normalize( vec3( - viewMatrix[ 0 ][ 2 ], - viewMatrix[ 1 ][ 2 ], - viewMatrix[ 2 ][ 2 ] ) );\n\t\t} else {\n\t\t\tcameraToVertex = normalize( worldPosition.xyz - cameraPosition );\n\t\t}\n\t\tvec3 worldNormal = inverseTransformDirection( transformedNormal, viewMatrix );\n\t\t#ifdef ENVMAP_MODE_REFLECTION\n\t\t\tvReflect = reflect( cameraToVertex, worldNormal );\n\t\t#else\n\t\t\tvReflect = refract( cameraToVertex, worldNormal, refractionRatio );\n\t\t#endif\n\t#endif\n#endif",
    fog_vertex: "#ifdef USE_FOG\n\tvFogDepth = - mvPosition.z;\n#endif",
    fog_pars_vertex: "#ifdef USE_FOG\n\tvarying float vFogDepth;\n#endif",
    fog_fragment: "#ifdef USE_FOG\n\t#ifdef FOG_EXP2\n\t\tfloat fogFactor = 1.0 - exp( - fogDensity * fogDensity * vFogDepth * vFogDepth );\n\t#else\n\t\tfloat fogFactor = smoothstep( fogNear, fogFar, vFogDepth );\n\t#endif\n\tgl_FragColor.rgb = mix( gl_FragColor.rgb, fogColor, fogFactor );\n#endif",
    fog_pars_fragment: "#ifdef USE_FOG\n\tuniform vec3 fogColor;\n\tvarying float vFogDepth;\n\t#ifdef FOG_EXP2\n\t\tuniform float fogDensity;\n\t#else\n\t\tuniform float fogNear;\n\t\tuniform float fogFar;\n\t#endif\n#endif",
    gradientmap_pars_fragment: "#ifdef USE_GRADIENTMAP\n\tuniform sampler2D gradientMap;\n#endif\nvec3 getGradientIrradiance( vec3 normal, vec3 lightDirection ) {\n\tfloat dotNL = dot( normal, lightDirection );\n\tvec2 coord = vec2( dotNL * 0.5 + 0.5, 0.0 );\n\t#ifdef USE_GRADIENTMAP\n\t\treturn vec3( texture2D( gradientMap, coord ).r );\n\t#else\n\t\tvec2 fw = fwidth( coord ) * 0.5;\n\t\treturn mix( vec3( 0.7 ), vec3( 1.0 ), smoothstep( 0.7 - fw.x, 0.7 + fw.x, coord.x ) );\n\t#endif\n}",
    lightmap_fragment: "#ifdef USE_LIGHTMAP\n\tvec4 lightMapTexel = texture2D( lightMap, vLightMapUv );\n\tvec3 lightMapIrradiance = lightMapTexel.rgb * lightMapIntensity;\n\treflectedLight.indirectDiffuse += lightMapIrradiance;\n#endif",
    lightmap_pars_fragment: "#ifdef USE_LIGHTMAP\n\tuniform sampler2D lightMap;\n\tuniform float lightMapIntensity;\n#endif",
    lights_lambert_fragment: "LambertMaterial material;\nmaterial.diffuseColor = diffuseColor.rgb;\nmaterial.specularStrength = specularStrength;",
    lights_lambert_pars_fragment: "varying vec3 vViewPosition;\nstruct LambertMaterial {\n\tvec3 diffuseColor;\n\tfloat specularStrength;\n};\nvoid RE_Direct_Lambert( const in IncidentLight directLight, const in GeometricContext geometry, const in LambertMaterial material, inout ReflectedLight reflectedLight ) {\n\tfloat dotNL = saturate( dot( geometry.normal, directLight.direction ) );\n\tvec3 irradiance = dotNL * directLight.color;\n\treflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );\n}\nvoid RE_IndirectDiffuse_Lambert( const in vec3 irradiance, const in GeometricContext geometry, const in LambertMaterial material, inout ReflectedLight reflectedLight ) {\n\treflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );\n}\n#define RE_Direct\t\t\t\tRE_Direct_Lambert\n#define RE_IndirectDiffuse\t\tRE_IndirectDiffuse_Lambert",
    lights_pars_begin: "uniform bool receiveShadow;\nuniform vec3 ambientLightColor;\nuniform vec3 lightProbe[ 9 ];\nvec3 shGetIrradianceAt( in vec3 normal, in vec3 shCoefficients[ 9 ] ) {\n\tfloat x = normal.x, y = normal.y, z = normal.z;\n\tvec3 result = shCoefficients[ 0 ] * 0.886227;\n\tresult += shCoefficients[ 1 ] * 2.0 * 0.511664 * y;\n\tresult += shCoefficients[ 2 ] * 2.0 * 0.511664 * z;\n\tresult += shCoefficients[ 3 ] * 2.0 * 0.511664 * x;\n\tresult += shCoefficients[ 4 ] * 2.0 * 0.429043 * x * y;\n\tresult += shCoefficients[ 5 ] * 2.0 * 0.429043 * y * z;\n\tresult += shCoefficients[ 6 ] * ( 0.743125 * z * z - 0.247708 );\n\tresult += shCoefficients[ 7 ] * 2.0 * 0.429043 * x * z;\n\tresult += shCoefficients[ 8 ] * 0.429043 * ( x * x - y * y );\n\treturn result;\n}\nvec3 getLightProbeIrradiance( const in vec3 lightProbe[ 9 ], const in vec3 normal ) {\n\tvec3 worldNormal = inverseTransformDirection( normal, viewMatrix );\n\tvec3 irradiance = shGetIrradianceAt( worldNormal, lightProbe );\n\treturn irradiance;\n}\nvec3 getAmbientLightIrradiance( const in vec3 ambientLightColor ) {\n\tvec3 irradiance = ambientLightColor;\n\treturn irradiance;\n}\nfloat getDistanceAttenuation( const in float lightDistance, const in float cutoffDistance, const in float decayExponent ) {\n\t#if defined ( LEGACY_LIGHTS )\n\t\tif ( cutoffDistance > 0.0 && decayExponent > 0.0 ) {\n\t\t\treturn pow( saturate( - lightDistance / cutoffDistance + 1.0 ), decayExponent );\n\t\t}\n\t\treturn 1.0;\n\t#else\n\t\tfloat distanceFalloff = 1.0 / max( pow( lightDistance, decayExponent ), 0.01 );\n\t\tif ( cutoffDistance > 0.0 ) {\n\t\t\tdistanceFalloff *= pow2( saturate( 1.0 - pow4( lightDistance / cutoffDistance ) ) );\n\t\t}\n\t\treturn distanceFalloff;\n\t#endif\n}\nfloat getSpotAttenuation( const in float coneCosine, const in float penumbraCosine, const in float angleCosine ) {\n\treturn smoothstep( coneCosine, penumbraCosine, angleCosine );\n}\n#if NUM_DIR_LIGHTS > 0\n\tstruct DirectionalLight {\n\t\tvec3 direction;\n\t\tvec3 color;\n\t};\n\tuniform DirectionalLight directionalLights[ NUM_DIR_LIGHTS ];\n\tvoid getDirectionalLightInfo( const in DirectionalLight directionalLight, const in GeometricContext geometry, out IncidentLight light ) {\n\t\tlight.color = directionalLight.color;\n\t\tlight.direction = directionalLight.direction;\n\t\tlight.visible = true;\n\t}\n#endif\n#if NUM_POINT_LIGHTS > 0\n\tstruct PointLight {\n\t\tvec3 position;\n\t\tvec3 color;\n\t\tfloat distance;\n\t\tfloat decay;\n\t};\n\tuniform PointLight pointLights[ NUM_POINT_LIGHTS ];\n\tvoid getPointLightInfo( const in PointLight pointLight, const in GeometricContext geometry, out IncidentLight light ) {\n\t\tvec3 lVector = pointLight.position - geometry.position;\n\t\tlight.direction = normalize( lVector );\n\t\tfloat lightDistance = length( lVector );\n\t\tlight.color = pointLight.color;\n\t\tlight.color *= getDistanceAttenuation( lightDistance, pointLight.distance, pointLight.decay );\n\t\tlight.visible = ( light.color != vec3( 0.0 ) );\n\t}\n#endif\n#if NUM_SPOT_LIGHTS > 0\n\tstruct SpotLight {\n\t\tvec3 position;\n\t\tvec3 direction;\n\t\tvec3 color;\n\t\tfloat distance;\n\t\tfloat decay;\n\t\tfloat coneCos;\n\t\tfloat penumbraCos;\n\t};\n\tuniform SpotLight spotLights[ NUM_SPOT_LIGHTS ];\n\tvoid getSpotLightInfo( const in SpotLight spotLight, const in GeometricContext geometry, out IncidentLight light ) {\n\t\tvec3 lVector = spotLight.position - geometry.position;\n\t\tlight.direction = normalize( lVector );\n\t\tfloat angleCos = dot( light.direction, spotLight.direction );\n\t\tfloat spotAttenuation = getSpotAttenuation( spotLight.coneCos, spotLight.penumbraCos, angleCos );\n\t\tif ( spotAttenuation > 0.0 ) {\n\t\t\tfloat lightDistance = length( lVector );\n\t\t\tlight.color = spotLight.color * spotAttenuation;\n\t\t\tlight.color *= getDistanceAttenuation( lightDistance, spotLight.distance, spotLight.decay );\n\t\t\tlight.visible = ( light.color != vec3( 0.0 ) );\n\t\t} else {\n\t\t\tlight.color = vec3( 0.0 );\n\t\t\tlight.visible = false;\n\t\t}\n\t}\n#endif\n#if NUM_RECT_AREA_LIGHTS > 0\n\tstruct RectAreaLight {\n\t\tvec3 color;\n\t\tvec3 position;\n\t\tvec3 halfWidth;\n\t\tvec3 halfHeight;\n\t};\n\tuniform sampler2D ltc_1;\tuniform sampler2D ltc_2;\n\tuniform RectAreaLight rectAreaLights[ NUM_RECT_AREA_LIGHTS ];\n#endif\n#if NUM_HEMI_LIGHTS > 0\n\tstruct HemisphereLight {\n\t\tvec3 direction;\n\t\tvec3 skyColor;\n\t\tvec3 groundColor;\n\t};\n\tuniform HemisphereLight hemisphereLights[ NUM_HEMI_LIGHTS ];\n\tvec3 getHemisphereLightIrradiance( const in HemisphereLight hemiLight, const in vec3 normal ) {\n\t\tfloat dotNL = dot( normal, hemiLight.direction );\n\t\tfloat hemiDiffuseWeight = 0.5 * dotNL + 0.5;\n\t\tvec3 irradiance = mix( hemiLight.groundColor, hemiLight.skyColor, hemiDiffuseWeight );\n\t\treturn irradiance;\n\t}\n#endif",
    lights_toon_fragment: "ToonMaterial material;\nmaterial.diffuseColor = diffuseColor.rgb;",
    lights_toon_pars_fragment: "varying vec3 vViewPosition;\nstruct ToonMaterial {\n\tvec3 diffuseColor;\n};\nvoid RE_Direct_Toon( const in IncidentLight directLight, const in GeometricContext geometry, const in ToonMaterial material, inout ReflectedLight reflectedLight ) {\n\tvec3 irradiance = getGradientIrradiance( geometry.normal, directLight.direction ) * directLight.color;\n\treflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );\n}\nvoid RE_IndirectDiffuse_Toon( const in vec3 irradiance, const in GeometricContext geometry, const in ToonMaterial material, inout ReflectedLight reflectedLight ) {\n\treflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );\n}\n#define RE_Direct\t\t\t\tRE_Direct_Toon\n#define RE_IndirectDiffuse\t\tRE_IndirectDiffuse_Toon",
    lights_phong_fragment: "BlinnPhongMaterial material;\nmaterial.diffuseColor = diffuseColor.rgb;\nmaterial.specularColor = specular;\nmaterial.specularShininess = shininess;\nmaterial.specularStrength = specularStrength;",
    lights_phong_pars_fragment: "varying vec3 vViewPosition;\nstruct BlinnPhongMaterial {\n\tvec3 diffuseColor;\n\tvec3 specularColor;\n\tfloat specularShininess;\n\tfloat specularStrength;\n};\nvoid RE_Direct_BlinnPhong( const in IncidentLight directLight, const in GeometricContext geometry, const in BlinnPhongMaterial material, inout ReflectedLight reflectedLight ) {\n\tfloat dotNL = saturate( dot( geometry.normal, directLight.direction ) );\n\tvec3 irradiance = dotNL * directLight.color;\n\treflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );\n\treflectedLight.directSpecular += irradiance * BRDF_BlinnPhong( directLight.direction, geometry.viewDir, geometry.normal, material.specularColor, material.specularShininess ) * material.specularStrength;\n}\nvoid RE_IndirectDiffuse_BlinnPhong( const in vec3 irradiance, const in GeometricContext geometry, const in BlinnPhongMaterial material, inout ReflectedLight reflectedLight ) {\n\treflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );\n}\n#define RE_Direct\t\t\t\tRE_Direct_BlinnPhong\n#define RE_IndirectDiffuse\t\tRE_IndirectDiffuse_BlinnPhong",
    lights_physical_fragment: "PhysicalMaterial material;\nmaterial.diffuseColor = diffuseColor.rgb * ( 1.0 - metalnessFactor );\nvec3 dxy = max( abs( dFdx( geometryNormal ) ), abs( dFdy( geometryNormal ) ) );\nfloat geometryRoughness = max( max( dxy.x, dxy.y ), dxy.z );\nmaterial.roughness = max( roughnessFactor, 0.0525 );material.roughness += geometryRoughness;\nmaterial.roughness = min( material.roughness, 1.0 );\n#ifdef IOR\n\tmaterial.ior = ior;\n\t#ifdef USE_SPECULAR\n\t\tfloat specularIntensityFactor = specularIntensity;\n\t\tvec3 specularColorFactor = specularColor;\n\t\t#ifdef USE_SPECULAR_COLORMAP\n\t\t\tspecularColorFactor *= texture2D( specularColorMap, vSpecularColorMapUv ).rgb;\n\t\t#endif\n\t\t#ifdef USE_SPECULAR_INTENSITYMAP\n\t\t\tspecularIntensityFactor *= texture2D( specularIntensityMap, vSpecularIntensityMapUv ).a;\n\t\t#endif\n\t\tmaterial.specularF90 = mix( specularIntensityFactor, 1.0, metalnessFactor );\n\t#else\n\t\tfloat specularIntensityFactor = 1.0;\n\t\tvec3 specularColorFactor = vec3( 1.0 );\n\t\tmaterial.specularF90 = 1.0;\n\t#endif\n\tmaterial.specularColor = mix( min( pow2( ( material.ior - 1.0 ) / ( material.ior + 1.0 ) ) * specularColorFactor, vec3( 1.0 ) ) * specularIntensityFactor, diffuseColor.rgb, metalnessFactor );\n#else\n\tmaterial.specularColor = mix( vec3( 0.04 ), diffuseColor.rgb, metalnessFactor );\n\tmaterial.specularF90 = 1.0;\n#endif\n#ifdef USE_CLEARCOAT\n\tmaterial.clearcoat = clearcoat;\n\tmaterial.clearcoatRoughness = clearcoatRoughness;\n\tmaterial.clearcoatF0 = vec3( 0.04 );\n\tmaterial.clearcoatF90 = 1.0;\n\t#ifdef USE_CLEARCOATMAP\n\t\tmaterial.clearcoat *= texture2D( clearcoatMap, vClearcoatMapUv ).x;\n\t#endif\n\t#ifdef USE_CLEARCOAT_ROUGHNESSMAP\n\t\tmaterial.clearcoatRoughness *= texture2D( clearcoatRoughnessMap, vClearcoatRoughnessMapUv ).y;\n\t#endif\n\tmaterial.clearcoat = saturate( material.clearcoat );\tmaterial.clearcoatRoughness = max( material.clearcoatRoughness, 0.0525 );\n\tmaterial.clearcoatRoughness += geometryRoughness;\n\tmaterial.clearcoatRoughness = min( material.clearcoatRoughness, 1.0 );\n#endif\n#ifdef USE_IRIDESCENCE\n\tmaterial.iridescence = iridescence;\n\tmaterial.iridescenceIOR = iridescenceIOR;\n\t#ifdef USE_IRIDESCENCEMAP\n\t\tmaterial.iridescence *= texture2D( iridescenceMap, vIridescenceMapUv ).r;\n\t#endif\n\t#ifdef USE_IRIDESCENCE_THICKNESSMAP\n\t\tmaterial.iridescenceThickness = (iridescenceThicknessMaximum - iridescenceThicknessMinimum) * texture2D( iridescenceThicknessMap, vIridescenceThicknessMapUv ).g + iridescenceThicknessMinimum;\n\t#else\n\t\tmaterial.iridescenceThickness = iridescenceThicknessMaximum;\n\t#endif\n#endif\n#ifdef USE_SHEEN\n\tmaterial.sheenColor = sheenColor;\n\t#ifdef USE_SHEEN_COLORMAP\n\t\tmaterial.sheenColor *= texture2D( sheenColorMap, vSheenColorMapUv ).rgb;\n\t#endif\n\tmaterial.sheenRoughness = clamp( sheenRoughness, 0.07, 1.0 );\n\t#ifdef USE_SHEEN_ROUGHNESSMAP\n\t\tmaterial.sheenRoughness *= texture2D( sheenRoughnessMap, vSheenRoughnessMapUv ).a;\n\t#endif\n#endif",
    lights_physical_pars_fragment: "struct PhysicalMaterial {\n\tvec3 diffuseColor;\n\tfloat roughness;\n\tvec3 specularColor;\n\tfloat specularF90;\n\t#ifdef USE_CLEARCOAT\n\t\tfloat clearcoat;\n\t\tfloat clearcoatRoughness;\n\t\tvec3 clearcoatF0;\n\t\tfloat clearcoatF90;\n\t#endif\n\t#ifdef USE_IRIDESCENCE\n\t\tfloat iridescence;\n\t\tfloat iridescenceIOR;\n\t\tfloat iridescenceThickness;\n\t\tvec3 iridescenceFresnel;\n\t\tvec3 iridescenceF0;\n\t#endif\n\t#ifdef USE_SHEEN\n\t\tvec3 sheenColor;\n\t\tfloat sheenRoughness;\n\t#endif\n\t#ifdef IOR\n\t\tfloat ior;\n\t#endif\n\t#ifdef USE_TRANSMISSION\n\t\tfloat transmission;\n\t\tfloat transmissionAlpha;\n\t\tfloat thickness;\n\t\tfloat attenuationDistance;\n\t\tvec3 attenuationColor;\n\t#endif\n};\nvec3 clearcoatSpecular = vec3( 0.0 );\nvec3 sheenSpecular = vec3( 0.0 );\nvec3 Schlick_to_F0( const in vec3 f, const in float f90, const in float dotVH ) {\n    float x = clamp( 1.0 - dotVH, 0.0, 1.0 );\n    float x2 = x * x;\n    float x5 = clamp( x * x2 * x2, 0.0, 0.9999 );\n    return ( f - vec3( f90 ) * x5 ) / ( 1.0 - x5 );\n}\nfloat V_GGX_SmithCorrelated( const in float alpha, const in float dotNL, const in float dotNV ) {\n\tfloat a2 = pow2( alpha );\n\tfloat gv = dotNL * sqrt( a2 + ( 1.0 - a2 ) * pow2( dotNV ) );\n\tfloat gl = dotNV * sqrt( a2 + ( 1.0 - a2 ) * pow2( dotNL ) );\n\treturn 0.5 / max( gv + gl, EPSILON );\n}\nfloat D_GGX( const in float alpha, const in float dotNH ) {\n\tfloat a2 = pow2( alpha );\n\tfloat denom = pow2( dotNH ) * ( a2 - 1.0 ) + 1.0;\n\treturn RECIPROCAL_PI * a2 / pow2( denom );\n}\n#ifdef USE_CLEARCOAT\n\tvec3 BRDF_GGX_Clearcoat( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in PhysicalMaterial material) {\n\t\tvec3 f0 = material.clearcoatF0;\n\t\tfloat f90 = material.clearcoatF90;\n\t\tfloat roughness = material.clearcoatRoughness;\n\t\tfloat alpha = pow2( roughness );\n\t\tvec3 halfDir = normalize( lightDir + viewDir );\n\t\tfloat dotNL = saturate( dot( normal, lightDir ) );\n\t\tfloat dotNV = saturate( dot( normal, viewDir ) );\n\t\tfloat dotNH = saturate( dot( normal, halfDir ) );\n\t\tfloat dotVH = saturate( dot( viewDir, halfDir ) );\n\t\tvec3 F = F_Schlick( f0, f90, dotVH );\n\t\tfloat V = V_GGX_SmithCorrelated( alpha, dotNL, dotNV );\n\t\tfloat D = D_GGX( alpha, dotNH );\n\t\treturn F * ( V * D );\n\t}\n#endif\nvec3 BRDF_GGX( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in PhysicalMaterial material ) {\n\tvec3 f0 = material.specularColor;\n\tfloat f90 = material.specularF90;\n\tfloat roughness = material.roughness;\n\tfloat alpha = pow2( roughness );\n\tvec3 halfDir = normalize( lightDir + viewDir );\n\tfloat dotNL = saturate( dot( normal, lightDir ) );\n\tfloat dotNV = saturate( dot( normal, viewDir ) );\n\tfloat dotNH = saturate( dot( normal, halfDir ) );\n\tfloat dotVH = saturate( dot( viewDir, halfDir ) );\n\tvec3 F = F_Schlick( f0, f90, dotVH );\n\t#ifdef USE_IRIDESCENCE\n\t\tF = mix( F, material.iridescenceFresnel, material.iridescence );\n\t#endif\n\tfloat V = V_GGX_SmithCorrelated( alpha, dotNL, dotNV );\n\tfloat D = D_GGX( alpha, dotNH );\n\treturn F * ( V * D );\n}\nvec2 LTC_Uv( const in vec3 N, const in vec3 V, const in float roughness ) {\n\tconst float LUT_SIZE = 64.0;\n\tconst float LUT_SCALE = ( LUT_SIZE - 1.0 ) / LUT_SIZE;\n\tconst float LUT_BIAS = 0.5 / LUT_SIZE;\n\tfloat dotNV = saturate( dot( N, V ) );\n\tvec2 uv = vec2( roughness, sqrt( 1.0 - dotNV ) );\n\tuv = uv * LUT_SCALE + LUT_BIAS;\n\treturn uv;\n}\nfloat LTC_ClippedSphereFormFactor( const in vec3 f ) {\n\tfloat l = length( f );\n\treturn max( ( l * l + f.z ) / ( l + 1.0 ), 0.0 );\n}\nvec3 LTC_EdgeVectorFormFactor( const in vec3 v1, const in vec3 v2 ) {\n\tfloat x = dot( v1, v2 );\n\tfloat y = abs( x );\n\tfloat a = 0.8543985 + ( 0.4965155 + 0.0145206 * y ) * y;\n\tfloat b = 3.4175940 + ( 4.1616724 + y ) * y;\n\tfloat v = a / b;\n\tfloat theta_sintheta = ( x > 0.0 ) ? v : 0.5 * inversesqrt( max( 1.0 - x * x, 1e-7 ) ) - v;\n\treturn cross( v1, v2 ) * theta_sintheta;\n}\nvec3 LTC_Evaluate( const in vec3 N, const in vec3 V, const in vec3 P, const in mat3 mInv, const in vec3 rectCoords[ 4 ] ) {\n\tvec3 v1 = rectCoords[ 1 ] - rectCoords[ 0 ];\n\tvec3 v2 = rectCoords[ 3 ] - rectCoords[ 0 ];\n\tvec3 lightNormal = cross( v1, v2 );\n\tif( dot( lightNormal, P - rectCoords[ 0 ] ) < 0.0 ) return vec3( 0.0 );\n\tvec3 T1, T2;\n\tT1 = normalize( V - N * dot( V, N ) );\n\tT2 = - cross( N, T1 );\n\tmat3 mat = mInv * transposeMat3( mat3( T1, T2, N ) );\n\tvec3 coords[ 4 ];\n\tcoords[ 0 ] = mat * ( rectCoords[ 0 ] - P );\n\tcoords[ 1 ] = mat * ( rectCoords[ 1 ] - P );\n\tcoords[ 2 ] = mat * ( rectCoords[ 2 ] - P );\n\tcoords[ 3 ] = mat * ( rectCoords[ 3 ] - P );\n\tcoords[ 0 ] = normalize( coords[ 0 ] );\n\tcoords[ 1 ] = normalize( coords[ 1 ] );\n\tcoords[ 2 ] = normalize( coords[ 2 ] );\n\tcoords[ 3 ] = normalize( coords[ 3 ] );\n\tvec3 vectorFormFactor = vec3( 0.0 );\n\tvectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 0 ], coords[ 1 ] );\n\tvectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 1 ], coords[ 2 ] );\n\tvectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 2 ], coords[ 3 ] );\n\tvectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 3 ], coords[ 0 ] );\n\tfloat result = LTC_ClippedSphereFormFactor( vectorFormFactor );\n\treturn vec3( result );\n}\n#if defined( USE_SHEEN )\nfloat D_Charlie( float roughness, float dotNH ) {\n\tfloat alpha = pow2( roughness );\n\tfloat invAlpha = 1.0 / alpha;\n\tfloat cos2h = dotNH * dotNH;\n\tfloat sin2h = max( 1.0 - cos2h, 0.0078125 );\n\treturn ( 2.0 + invAlpha ) * pow( sin2h, invAlpha * 0.5 ) / ( 2.0 * PI );\n}\nfloat V_Neubelt( float dotNV, float dotNL ) {\n\treturn saturate( 1.0 / ( 4.0 * ( dotNL + dotNV - dotNL * dotNV ) ) );\n}\nvec3 BRDF_Sheen( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, vec3 sheenColor, const in float sheenRoughness ) {\n\tvec3 halfDir = normalize( lightDir + viewDir );\n\tfloat dotNL = saturate( dot( normal, lightDir ) );\n\tfloat dotNV = saturate( dot( normal, viewDir ) );\n\tfloat dotNH = saturate( dot( normal, halfDir ) );\n\tfloat D = D_Charlie( sheenRoughness, dotNH );\n\tfloat V = V_Neubelt( dotNV, dotNL );\n\treturn sheenColor * ( D * V );\n}\n#endif\nfloat IBLSheenBRDF( const in vec3 normal, const in vec3 viewDir, const in float roughness ) {\n\tfloat dotNV = saturate( dot( normal, viewDir ) );\n\tfloat r2 = roughness * roughness;\n\tfloat a = roughness < 0.25 ? -339.2 * r2 + 161.4 * roughness - 25.9 : -8.48 * r2 + 14.3 * roughness - 9.95;\n\tfloat b = roughness < 0.25 ? 44.0 * r2 - 23.7 * roughness + 3.26 : 1.97 * r2 - 3.27 * roughness + 0.72;\n\tfloat DG = exp( a * dotNV + b ) + ( roughness < 0.25 ? 0.0 : 0.1 * ( roughness - 0.25 ) );\n\treturn saturate( DG * RECIPROCAL_PI );\n}\nvec2 DFGApprox( const in vec3 normal, const in vec3 viewDir, const in float roughness ) {\n\tfloat dotNV = saturate( dot( normal, viewDir ) );\n\tconst vec4 c0 = vec4( - 1, - 0.0275, - 0.572, 0.022 );\n\tconst vec4 c1 = vec4( 1, 0.0425, 1.04, - 0.04 );\n\tvec4 r = roughness * c0 + c1;\n\tfloat a004 = min( r.x * r.x, exp2( - 9.28 * dotNV ) ) * r.x + r.y;\n\tvec2 fab = vec2( - 1.04, 1.04 ) * a004 + r.zw;\n\treturn fab;\n}\nvec3 EnvironmentBRDF( const in vec3 normal, const in vec3 viewDir, const in vec3 specularColor, const in float specularF90, const in float roughness ) {\n\tvec2 fab = DFGApprox( normal, viewDir, roughness );\n\treturn specularColor * fab.x + specularF90 * fab.y;\n}\n#ifdef USE_IRIDESCENCE\nvoid computeMultiscatteringIridescence( const in vec3 normal, const in vec3 viewDir, const in vec3 specularColor, const in float specularF90, const in float iridescence, const in vec3 iridescenceF0, const in float roughness, inout vec3 singleScatter, inout vec3 multiScatter ) {\n#else\nvoid computeMultiscattering( const in vec3 normal, const in vec3 viewDir, const in vec3 specularColor, const in float specularF90, const in float roughness, inout vec3 singleScatter, inout vec3 multiScatter ) {\n#endif\n\tvec2 fab = DFGApprox( normal, viewDir, roughness );\n\t#ifdef USE_IRIDESCENCE\n\t\tvec3 Fr = mix( specularColor, iridescenceF0, iridescence );\n\t#else\n\t\tvec3 Fr = specularColor;\n\t#endif\n\tvec3 FssEss = Fr * fab.x + specularF90 * fab.y;\n\tfloat Ess = fab.x + fab.y;\n\tfloat Ems = 1.0 - Ess;\n\tvec3 Favg = Fr + ( 1.0 - Fr ) * 0.047619;\tvec3 Fms = FssEss * Favg / ( 1.0 - Ems * Favg );\n\tsingleScatter += FssEss;\n\tmultiScatter += Fms * Ems;\n}\n#if NUM_RECT_AREA_LIGHTS > 0\n\tvoid RE_Direct_RectArea_Physical( const in RectAreaLight rectAreaLight, const in GeometricContext geometry, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {\n\t\tvec3 normal = geometry.normal;\n\t\tvec3 viewDir = geometry.viewDir;\n\t\tvec3 position = geometry.position;\n\t\tvec3 lightPos = rectAreaLight.position;\n\t\tvec3 halfWidth = rectAreaLight.halfWidth;\n\t\tvec3 halfHeight = rectAreaLight.halfHeight;\n\t\tvec3 lightColor = rectAreaLight.color;\n\t\tfloat roughness = material.roughness;\n\t\tvec3 rectCoords[ 4 ];\n\t\trectCoords[ 0 ] = lightPos + halfWidth - halfHeight;\t\trectCoords[ 1 ] = lightPos - halfWidth - halfHeight;\n\t\trectCoords[ 2 ] = lightPos - halfWidth + halfHeight;\n\t\trectCoords[ 3 ] = lightPos + halfWidth + halfHeight;\n\t\tvec2 uv = LTC_Uv( normal, viewDir, roughness );\n\t\tvec4 t1 = texture2D( ltc_1, uv );\n\t\tvec4 t2 = texture2D( ltc_2, uv );\n\t\tmat3 mInv = mat3(\n\t\t\tvec3( t1.x, 0, t1.y ),\n\t\t\tvec3(    0, 1,    0 ),\n\t\t\tvec3( t1.z, 0, t1.w )\n\t\t);\n\t\tvec3 fresnel = ( material.specularColor * t2.x + ( vec3( 1.0 ) - material.specularColor ) * t2.y );\n\t\treflectedLight.directSpecular += lightColor * fresnel * LTC_Evaluate( normal, viewDir, position, mInv, rectCoords );\n\t\treflectedLight.directDiffuse += lightColor * material.diffuseColor * LTC_Evaluate( normal, viewDir, position, mat3( 1.0 ), rectCoords );\n\t}\n#endif\nvoid RE_Direct_Physical( const in IncidentLight directLight, const in GeometricContext geometry, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {\n\tfloat dotNL = saturate( dot( geometry.normal, directLight.direction ) );\n\tvec3 irradiance = dotNL * directLight.color;\n\t#ifdef USE_CLEARCOAT\n\t\tfloat dotNLcc = saturate( dot( geometry.clearcoatNormal, directLight.direction ) );\n\t\tvec3 ccIrradiance = dotNLcc * directLight.color;\n\t\tclearcoatSpecular += ccIrradiance * BRDF_GGX_Clearcoat( directLight.direction, geometry.viewDir, geometry.clearcoatNormal, material );\n\t#endif\n\t#ifdef USE_SHEEN\n\t\tsheenSpecular += irradiance * BRDF_Sheen( directLight.direction, geometry.viewDir, geometry.normal, material.sheenColor, material.sheenRoughness );\n\t#endif\n\treflectedLight.directSpecular += irradiance * BRDF_GGX( directLight.direction, geometry.viewDir, geometry.normal, material );\n\treflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );\n}\nvoid RE_IndirectDiffuse_Physical( const in vec3 irradiance, const in GeometricContext geometry, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {\n\treflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );\n}\nvoid RE_IndirectSpecular_Physical( const in vec3 radiance, const in vec3 irradiance, const in vec3 clearcoatRadiance, const in GeometricContext geometry, const in PhysicalMaterial material, inout ReflectedLight reflectedLight) {\n\t#ifdef USE_CLEARCOAT\n\t\tclearcoatSpecular += clearcoatRadiance * EnvironmentBRDF( geometry.clearcoatNormal, geometry.viewDir, material.clearcoatF0, material.clearcoatF90, material.clearcoatRoughness );\n\t#endif\n\t#ifdef USE_SHEEN\n\t\tsheenSpecular += irradiance * material.sheenColor * IBLSheenBRDF( geometry.normal, geometry.viewDir, material.sheenRoughness );\n\t#endif\n\tvec3 singleScattering = vec3( 0.0 );\n\tvec3 multiScattering = vec3( 0.0 );\n\tvec3 cosineWeightedIrradiance = irradiance * RECIPROCAL_PI;\n\t#ifdef USE_IRIDESCENCE\n\t\tcomputeMultiscatteringIridescence( geometry.normal, geometry.viewDir, material.specularColor, material.specularF90, material.iridescence, material.iridescenceFresnel, material.roughness, singleScattering, multiScattering );\n\t#else\n\t\tcomputeMultiscattering( geometry.normal, geometry.viewDir, material.specularColor, material.specularF90, material.roughness, singleScattering, multiScattering );\n\t#endif\n\tvec3 totalScattering = singleScattering + multiScattering;\n\tvec3 diffuse = material.diffuseColor * ( 1.0 - max( max( totalScattering.r, totalScattering.g ), totalScattering.b ) );\n\treflectedLight.indirectSpecular += radiance * singleScattering;\n\treflectedLight.indirectSpecular += multiScattering * cosineWeightedIrradiance;\n\treflectedLight.indirectDiffuse += diffuse * cosineWeightedIrradiance;\n}\n#define RE_Direct\t\t\t\tRE_Direct_Physical\n#define RE_Direct_RectArea\t\tRE_Direct_RectArea_Physical\n#define RE_IndirectDiffuse\t\tRE_IndirectDiffuse_Physical\n#define RE_IndirectSpecular\t\tRE_IndirectSpecular_Physical\nfloat computeSpecularOcclusion( const in float dotNV, const in float ambientOcclusion, const in float roughness ) {\n\treturn saturate( pow( dotNV + ambientOcclusion, exp2( - 16.0 * roughness - 1.0 ) ) - 1.0 + ambientOcclusion );\n}",
    lights_fragment_begin: "\nGeometricContext geometry;\ngeometry.position = - vViewPosition;\ngeometry.normal = normal;\ngeometry.viewDir = ( isOrthographic ) ? vec3( 0, 0, 1 ) : normalize( vViewPosition );\n#ifdef USE_CLEARCOAT\n\tgeometry.clearcoatNormal = clearcoatNormal;\n#endif\n#ifdef USE_IRIDESCENCE\n\tfloat dotNVi = saturate( dot( normal, geometry.viewDir ) );\n\tif ( material.iridescenceThickness == 0.0 ) {\n\t\tmaterial.iridescence = 0.0;\n\t} else {\n\t\tmaterial.iridescence = saturate( material.iridescence );\n\t}\n\tif ( material.iridescence > 0.0 ) {\n\t\tmaterial.iridescenceFresnel = evalIridescence( 1.0, material.iridescenceIOR, dotNVi, material.iridescenceThickness, material.specularColor );\n\t\tmaterial.iridescenceF0 = Schlick_to_F0( material.iridescenceFresnel, 1.0, dotNVi );\n\t}\n#endif\nIncidentLight directLight;\n#if ( NUM_POINT_LIGHTS > 0 ) && defined( RE_Direct )\n\tPointLight pointLight;\n\t#if defined( USE_SHADOWMAP ) && NUM_POINT_LIGHT_SHADOWS > 0\n\tPointLightShadow pointLightShadow;\n\t#endif\n\t#pragma unroll_loop_start\n\tfor ( int i = 0; i < NUM_POINT_LIGHTS; i ++ ) {\n\t\tpointLight = pointLights[ i ];\n\t\tgetPointLightInfo( pointLight, geometry, directLight );\n\t\t#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_POINT_LIGHT_SHADOWS )\n\t\tpointLightShadow = pointLightShadows[ i ];\n\t\tdirectLight.color *= ( directLight.visible && receiveShadow ) ? getPointShadow( pointShadowMap[ i ], pointLightShadow.shadowMapSize, pointLightShadow.shadowBias, pointLightShadow.shadowRadius, vPointShadowCoord[ i ], pointLightShadow.shadowCameraNear, pointLightShadow.shadowCameraFar ) : 1.0;\n\t\t#endif\n\t\tRE_Direct( directLight, geometry, material, reflectedLight );\n\t}\n\t#pragma unroll_loop_end\n#endif\n#if ( NUM_SPOT_LIGHTS > 0 ) && defined( RE_Direct )\n\tSpotLight spotLight;\n\tvec4 spotColor;\n\tvec3 spotLightCoord;\n\tbool inSpotLightMap;\n\t#if defined( USE_SHADOWMAP ) && NUM_SPOT_LIGHT_SHADOWS > 0\n\tSpotLightShadow spotLightShadow;\n\t#endif\n\t#pragma unroll_loop_start\n\tfor ( int i = 0; i < NUM_SPOT_LIGHTS; i ++ ) {\n\t\tspotLight = spotLights[ i ];\n\t\tgetSpotLightInfo( spotLight, geometry, directLight );\n\t\t#if ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS )\n\t\t#define SPOT_LIGHT_MAP_INDEX UNROLLED_LOOP_INDEX\n\t\t#elif ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )\n\t\t#define SPOT_LIGHT_MAP_INDEX NUM_SPOT_LIGHT_MAPS\n\t\t#else\n\t\t#define SPOT_LIGHT_MAP_INDEX ( UNROLLED_LOOP_INDEX - NUM_SPOT_LIGHT_SHADOWS + NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS )\n\t\t#endif\n\t\t#if ( SPOT_LIGHT_MAP_INDEX < NUM_SPOT_LIGHT_MAPS )\n\t\t\tspotLightCoord = vSpotLightCoord[ i ].xyz / vSpotLightCoord[ i ].w;\n\t\t\tinSpotLightMap = all( lessThan( abs( spotLightCoord * 2. - 1. ), vec3( 1.0 ) ) );\n\t\t\tspotColor = texture2D( spotLightMap[ SPOT_LIGHT_MAP_INDEX ], spotLightCoord.xy );\n\t\t\tdirectLight.color = inSpotLightMap ? directLight.color * spotColor.rgb : directLight.color;\n\t\t#endif\n\t\t#undef SPOT_LIGHT_MAP_INDEX\n\t\t#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )\n\t\tspotLightShadow = spotLightShadows[ i ];\n\t\tdirectLight.color *= ( directLight.visible && receiveShadow ) ? getShadow( spotShadowMap[ i ], spotLightShadow.shadowMapSize, spotLightShadow.shadowBias, spotLightShadow.shadowRadius, vSpotLightCoord[ i ] ) : 1.0;\n\t\t#endif\n\t\tRE_Direct( directLight, geometry, material, reflectedLight );\n\t}\n\t#pragma unroll_loop_end\n#endif\n#if ( NUM_DIR_LIGHTS > 0 ) && defined( RE_Direct )\n\tDirectionalLight directionalLight;\n\t#if defined( USE_SHADOWMAP ) && NUM_DIR_LIGHT_SHADOWS > 0\n\tDirectionalLightShadow directionalLightShadow;\n\t#endif\n\t#pragma unroll_loop_start\n\tfor ( int i = 0; i < NUM_DIR_LIGHTS; i ++ ) {\n\t\tdirectionalLight = directionalLights[ i ];\n\t\tgetDirectionalLightInfo( directionalLight, geometry, directLight );\n\t\t#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_DIR_LIGHT_SHADOWS )\n\t\tdirectionalLightShadow = directionalLightShadows[ i ];\n\t\tdirectLight.color *= ( directLight.visible && receiveShadow ) ? getShadow( directionalShadowMap[ i ], directionalLightShadow.shadowMapSize, directionalLightShadow.shadowBias, directionalLightShadow.shadowRadius, vDirectionalShadowCoord[ i ] ) : 1.0;\n\t\t#endif\n\t\tRE_Direct( directLight, geometry, material, reflectedLight );\n\t}\n\t#pragma unroll_loop_end\n#endif\n#if ( NUM_RECT_AREA_LIGHTS > 0 ) && defined( RE_Direct_RectArea )\n\tRectAreaLight rectAreaLight;\n\t#pragma unroll_loop_start\n\tfor ( int i = 0; i < NUM_RECT_AREA_LIGHTS; i ++ ) {\n\t\trectAreaLight = rectAreaLights[ i ];\n\t\tRE_Direct_RectArea( rectAreaLight, geometry, material, reflectedLight );\n\t}\n\t#pragma unroll_loop_end\n#endif\n#if defined( RE_IndirectDiffuse )\n\tvec3 iblIrradiance = vec3( 0.0 );\n\tvec3 irradiance = getAmbientLightIrradiance( ambientLightColor );\n\tirradiance += getLightProbeIrradiance( lightProbe, geometry.normal );\n\t#if ( NUM_HEMI_LIGHTS > 0 )\n\t\t#pragma unroll_loop_start\n\t\tfor ( int i = 0; i < NUM_HEMI_LIGHTS; i ++ ) {\n\t\t\tirradiance += getHemisphereLightIrradiance( hemisphereLights[ i ], geometry.normal );\n\t\t}\n\t\t#pragma unroll_loop_end\n\t#endif\n#endif\n#if defined( RE_IndirectSpecular )\n\tvec3 radiance = vec3( 0.0 );\n\tvec3 clearcoatRadiance = vec3( 0.0 );\n#endif",
    lights_fragment_maps: "#if defined( RE_IndirectDiffuse )\n\t#ifdef USE_LIGHTMAP\n\t\tvec4 lightMapTexel = texture2D( lightMap, vLightMapUv );\n\t\tvec3 lightMapIrradiance = lightMapTexel.rgb * lightMapIntensity;\n\t\tirradiance += lightMapIrradiance;\n\t#endif\n\t#if defined( USE_ENVMAP ) && defined( STANDARD ) && defined( ENVMAP_TYPE_CUBE_UV )\n\t\tiblIrradiance += getIBLIrradiance( geometry.normal );\n\t#endif\n#endif\n#if defined( USE_ENVMAP ) && defined( RE_IndirectSpecular )\n\tradiance += getIBLRadiance( geometry.viewDir, geometry.normal, material.roughness );\n\t#ifdef USE_CLEARCOAT\n\t\tclearcoatRadiance += getIBLRadiance( geometry.viewDir, geometry.clearcoatNormal, material.clearcoatRoughness );\n\t#endif\n#endif",
    lights_fragment_end: "#if defined( RE_IndirectDiffuse )\n\tRE_IndirectDiffuse( irradiance, geometry, material, reflectedLight );\n#endif\n#if defined( RE_IndirectSpecular )\n\tRE_IndirectSpecular( radiance, iblIrradiance, clearcoatRadiance, geometry, material, reflectedLight );\n#endif",
    logdepthbuf_fragment: "#if defined( USE_LOGDEPTHBUF ) && defined( USE_LOGDEPTHBUF_EXT )\n\tgl_FragDepthEXT = vIsPerspective == 0.0 ? gl_FragCoord.z : log2( vFragDepth ) * logDepthBufFC * 0.5;\n#endif",
    logdepthbuf_pars_fragment: "#if defined( USE_LOGDEPTHBUF ) && defined( USE_LOGDEPTHBUF_EXT )\n\tuniform float logDepthBufFC;\n\tvarying float vFragDepth;\n\tvarying float vIsPerspective;\n#endif",
    logdepthbuf_pars_vertex: "#ifdef USE_LOGDEPTHBUF\n\t#ifdef USE_LOGDEPTHBUF_EXT\n\t\tvarying float vFragDepth;\n\t\tvarying float vIsPerspective;\n\t#else\n\t\tuniform float logDepthBufFC;\n\t#endif\n#endif",
    logdepthbuf_vertex: "#ifdef USE_LOGDEPTHBUF\n\t#ifdef USE_LOGDEPTHBUF_EXT\n\t\tvFragDepth = 1.0 + gl_Position.w;\n\t\tvIsPerspective = float( isPerspectiveMatrix( projectionMatrix ) );\n\t#else\n\t\tif ( isPerspectiveMatrix( projectionMatrix ) ) {\n\t\t\tgl_Position.z = log2( max( EPSILON, gl_Position.w + 1.0 ) ) * logDepthBufFC - 1.0;\n\t\t\tgl_Position.z *= gl_Position.w;\n\t\t}\n\t#endif\n#endif",
    map_fragment: "#ifdef USE_MAP\n\tdiffuseColor *= texture2D( map, vMapUv );\n#endif",
    map_pars_fragment: "#ifdef USE_MAP\n\tuniform sampler2D map;\n#endif",
    map_particle_fragment: "#if defined( USE_MAP ) || defined( USE_ALPHAMAP )\n\t#if defined( USE_POINTS_UV )\n\t\tvec2 uv = vUv;\n\t#else\n\t\tvec2 uv = ( uvTransform * vec3( gl_PointCoord.x, 1.0 - gl_PointCoord.y, 1 ) ).xy;\n\t#endif\n#endif\n#ifdef USE_MAP\n\tdiffuseColor *= texture2D( map, uv );\n#endif\n#ifdef USE_ALPHAMAP\n\tdiffuseColor.a *= texture2D( alphaMap, uv ).g;\n#endif",
    map_particle_pars_fragment: "#if defined( USE_POINTS_UV )\n\tvarying vec2 vUv;\n#else\n\t#if defined( USE_MAP ) || defined( USE_ALPHAMAP )\n\t\tuniform mat3 uvTransform;\n\t#endif\n#endif\n#ifdef USE_MAP\n\tuniform sampler2D map;\n#endif\n#ifdef USE_ALPHAMAP\n\tuniform sampler2D alphaMap;\n#endif",
    metalnessmap_fragment: "float metalnessFactor = metalness;\n#ifdef USE_METALNESSMAP\n\tvec4 texelMetalness = texture2D( metalnessMap, vMetalnessMapUv );\n\tmetalnessFactor *= texelMetalness.b;\n#endif",
    metalnessmap_pars_fragment: "#ifdef USE_METALNESSMAP\n\tuniform sampler2D metalnessMap;\n#endif",
    morphcolor_vertex: "#if defined( USE_MORPHCOLORS ) && defined( MORPHTARGETS_TEXTURE )\n\tvColor *= morphTargetBaseInfluence;\n\tfor ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {\n\t\t#if defined( USE_COLOR_ALPHA )\n\t\t\tif ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ) * morphTargetInfluences[ i ];\n\t\t#elif defined( USE_COLOR )\n\t\t\tif ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ).rgb * morphTargetInfluences[ i ];\n\t\t#endif\n\t}\n#endif",
    morphnormal_vertex: "#ifdef USE_MORPHNORMALS\n\tobjectNormal *= morphTargetBaseInfluence;\n\t#ifdef MORPHTARGETS_TEXTURE\n\t\tfor ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {\n\t\t\tif ( morphTargetInfluences[ i ] != 0.0 ) objectNormal += getMorph( gl_VertexID, i, 1 ).xyz * morphTargetInfluences[ i ];\n\t\t}\n\t#else\n\t\tobjectNormal += morphNormal0 * morphTargetInfluences[ 0 ];\n\t\tobjectNormal += morphNormal1 * morphTargetInfluences[ 1 ];\n\t\tobjectNormal += morphNormal2 * morphTargetInfluences[ 2 ];\n\t\tobjectNormal += morphNormal3 * morphTargetInfluences[ 3 ];\n\t#endif\n#endif",
    morphtarget_pars_vertex: "#ifdef USE_MORPHTARGETS\n\tuniform float morphTargetBaseInfluence;\n\t#ifdef MORPHTARGETS_TEXTURE\n\t\tuniform float morphTargetInfluences[ MORPHTARGETS_COUNT ];\n\t\tuniform sampler2DArray morphTargetsTexture;\n\t\tuniform ivec2 morphTargetsTextureSize;\n\t\tvec4 getMorph( const in int vertexIndex, const in int morphTargetIndex, const in int offset ) {\n\t\t\tint texelIndex = vertexIndex * MORPHTARGETS_TEXTURE_STRIDE + offset;\n\t\t\tint y = texelIndex / morphTargetsTextureSize.x;\n\t\t\tint x = texelIndex - y * morphTargetsTextureSize.x;\n\t\t\tivec3 morphUV = ivec3( x, y, morphTargetIndex );\n\t\t\treturn texelFetch( morphTargetsTexture, morphUV, 0 );\n\t\t}\n\t#else\n\t\t#ifndef USE_MORPHNORMALS\n\t\t\tuniform float morphTargetInfluences[ 8 ];\n\t\t#else\n\t\t\tuniform float morphTargetInfluences[ 4 ];\n\t\t#endif\n\t#endif\n#endif",
    morphtarget_vertex: "#ifdef USE_MORPHTARGETS\n\ttransformed *= morphTargetBaseInfluence;\n\t#ifdef MORPHTARGETS_TEXTURE\n\t\tfor ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {\n\t\t\tif ( morphTargetInfluences[ i ] != 0.0 ) transformed += getMorph( gl_VertexID, i, 0 ).xyz * morphTargetInfluences[ i ];\n\t\t}\n\t#else\n\t\ttransformed += morphTarget0 * morphTargetInfluences[ 0 ];\n\t\ttransformed += morphTarget1 * morphTargetInfluences[ 1 ];\n\t\ttransformed += morphTarget2 * morphTargetInfluences[ 2 ];\n\t\ttransformed += morphTarget3 * morphTargetInfluences[ 3 ];\n\t\t#ifndef USE_MORPHNORMALS\n\t\t\ttransformed += morphTarget4 * morphTargetInfluences[ 4 ];\n\t\t\ttransformed += morphTarget5 * morphTargetInfluences[ 5 ];\n\t\t\ttransformed += morphTarget6 * morphTargetInfluences[ 6 ];\n\t\t\ttransformed += morphTarget7 * morphTargetInfluences[ 7 ];\n\t\t#endif\n\t#endif\n#endif",
    normal_fragment_begin: "float faceDirection = gl_FrontFacing ? 1.0 : - 1.0;\n#ifdef FLAT_SHADED\n\tvec3 fdx = dFdx( vViewPosition );\n\tvec3 fdy = dFdy( vViewPosition );\n\tvec3 normal = normalize( cross( fdx, fdy ) );\n#else\n\tvec3 normal = normalize( vNormal );\n\t#ifdef DOUBLE_SIDED\n\t\tnormal *= faceDirection;\n\t#endif\n#endif\n#ifdef USE_NORMALMAP_TANGENTSPACE\n\t#ifdef USE_TANGENT\n\t\tmat3 tbn = mat3( normalize( vTangent ), normalize( vBitangent ), normal );\n\t#else\n\t\tmat3 tbn = getTangentFrame( - vViewPosition, normal, vNormalMapUv );\n\t#endif\n\t#if defined( DOUBLE_SIDED ) && ! defined( FLAT_SHADED )\n\t\ttbn[0] *= faceDirection;\n\t\ttbn[1] *= faceDirection;\n\t#endif\n#endif\n#ifdef USE_CLEARCOAT_NORMALMAP\n\t#ifdef USE_TANGENT\n\t\tmat3 tbn2 = mat3( normalize( vTangent ), normalize( vBitangent ), normal );\n\t#else\n\t\tmat3 tbn2 = getTangentFrame( - vViewPosition, normal, vClearcoatNormalMapUv );\n\t#endif\n\t#if defined( DOUBLE_SIDED ) && ! defined( FLAT_SHADED )\n\t\ttbn2[0] *= faceDirection;\n\t\ttbn2[1] *= faceDirection;\n\t#endif\n#endif\nvec3 geometryNormal = normal;",
    normal_fragment_maps: "#ifdef USE_NORMALMAP_OBJECTSPACE\n\tnormal = texture2D( normalMap, vNormalMapUv ).xyz * 2.0 - 1.0;\n\t#ifdef FLIP_SIDED\n\t\tnormal = - normal;\n\t#endif\n\t#ifdef DOUBLE_SIDED\n\t\tnormal = normal * faceDirection;\n\t#endif\n\tnormal = normalize( normalMatrix * normal );\n#elif defined( USE_NORMALMAP_TANGENTSPACE )\n\tvec3 mapN = texture2D( normalMap, vNormalMapUv ).xyz * 2.0 - 1.0;\n\tmapN.xy *= normalScale;\n\tnormal = normalize( tbn * mapN );\n#elif defined( USE_BUMPMAP )\n\tnormal = perturbNormalArb( - vViewPosition, normal, dHdxy_fwd(), faceDirection );\n#endif",
    normal_pars_fragment: "#ifndef FLAT_SHADED\n\tvarying vec3 vNormal;\n\t#ifdef USE_TANGENT\n\t\tvarying vec3 vTangent;\n\t\tvarying vec3 vBitangent;\n\t#endif\n#endif",
    normal_pars_vertex: "#ifndef FLAT_SHADED\n\tvarying vec3 vNormal;\n\t#ifdef USE_TANGENT\n\t\tvarying vec3 vTangent;\n\t\tvarying vec3 vBitangent;\n\t#endif\n#endif",
    normal_vertex: "#ifndef FLAT_SHADED\n\tvNormal = normalize( transformedNormal );\n\t#ifdef USE_TANGENT\n\t\tvTangent = normalize( transformedTangent );\n\t\tvBitangent = normalize( cross( vNormal, vTangent ) * tangent.w );\n\t#endif\n#endif",
    normalmap_pars_fragment: "#ifdef USE_NORMALMAP\n\tuniform sampler2D normalMap;\n\tuniform vec2 normalScale;\n#endif\n#ifdef USE_NORMALMAP_OBJECTSPACE\n\tuniform mat3 normalMatrix;\n#endif\n#if ! defined ( USE_TANGENT ) && ( defined ( USE_NORMALMAP_TANGENTSPACE ) || defined ( USE_CLEARCOAT_NORMALMAP ) )\n\tmat3 getTangentFrame( vec3 eye_pos, vec3 surf_norm, vec2 uv ) {\n\t\tvec3 q0 = dFdx( eye_pos.xyz );\n\t\tvec3 q1 = dFdy( eye_pos.xyz );\n\t\tvec2 st0 = dFdx( uv.st );\n\t\tvec2 st1 = dFdy( uv.st );\n\t\tvec3 N = surf_norm;\n\t\tvec3 q1perp = cross( q1, N );\n\t\tvec3 q0perp = cross( N, q0 );\n\t\tvec3 T = q1perp * st0.x + q0perp * st1.x;\n\t\tvec3 B = q1perp * st0.y + q0perp * st1.y;\n\t\tfloat det = max( dot( T, T ), dot( B, B ) );\n\t\tfloat scale = ( det == 0.0 ) ? 0.0 : inversesqrt( det );\n\t\treturn mat3( T * scale, B * scale, N );\n\t}\n#endif",
    clearcoat_normal_fragment_begin: "#ifdef USE_CLEARCOAT\n\tvec3 clearcoatNormal = geometryNormal;\n#endif",
    clearcoat_normal_fragment_maps: "#ifdef USE_CLEARCOAT_NORMALMAP\n\tvec3 clearcoatMapN = texture2D( clearcoatNormalMap, vClearcoatNormalMapUv ).xyz * 2.0 - 1.0;\n\tclearcoatMapN.xy *= clearcoatNormalScale;\n\tclearcoatNormal = normalize( tbn2 * clearcoatMapN );\n#endif",
    clearcoat_pars_fragment: "#ifdef USE_CLEARCOATMAP\n\tuniform sampler2D clearcoatMap;\n#endif\n#ifdef USE_CLEARCOAT_NORMALMAP\n\tuniform sampler2D clearcoatNormalMap;\n\tuniform vec2 clearcoatNormalScale;\n#endif\n#ifdef USE_CLEARCOAT_ROUGHNESSMAP\n\tuniform sampler2D clearcoatRoughnessMap;\n#endif",
    iridescence_pars_fragment: "#ifdef USE_IRIDESCENCEMAP\n\tuniform sampler2D iridescenceMap;\n#endif\n#ifdef USE_IRIDESCENCE_THICKNESSMAP\n\tuniform sampler2D iridescenceThicknessMap;\n#endif",
    output_fragment: "#ifdef OPAQUE\ndiffuseColor.a = 1.0;\n#endif\n#ifdef USE_TRANSMISSION\ndiffuseColor.a *= material.transmissionAlpha + 0.1;\n#endif\ngl_FragColor = vec4( outgoingLight, diffuseColor.a );",
    packing: "vec3 packNormalToRGB( const in vec3 normal ) {\n\treturn normalize( normal ) * 0.5 + 0.5;\n}\nvec3 unpackRGBToNormal( const in vec3 rgb ) {\n\treturn 2.0 * rgb.xyz - 1.0;\n}\nconst float PackUpscale = 256. / 255.;const float UnpackDownscale = 255. / 256.;\nconst vec3 PackFactors = vec3( 256. * 256. * 256., 256. * 256., 256. );\nconst vec4 UnpackFactors = UnpackDownscale / vec4( PackFactors, 1. );\nconst float ShiftRight8 = 1. / 256.;\nvec4 packDepthToRGBA( const in float v ) {\n\tvec4 r = vec4( fract( v * PackFactors ), v );\n\tr.yzw -= r.xyz * ShiftRight8;\treturn r * PackUpscale;\n}\nfloat unpackRGBAToDepth( const in vec4 v ) {\n\treturn dot( v, UnpackFactors );\n}\nvec2 packDepthToRG( in highp float v ) {\n\treturn packDepthToRGBA( v ).yx;\n}\nfloat unpackRGToDepth( const in highp vec2 v ) {\n\treturn unpackRGBAToDepth( vec4( v.xy, 0.0, 0.0 ) );\n}\nvec4 pack2HalfToRGBA( vec2 v ) {\n\tvec4 r = vec4( v.x, fract( v.x * 255.0 ), v.y, fract( v.y * 255.0 ) );\n\treturn vec4( r.x - r.y / 255.0, r.y, r.z - r.w / 255.0, r.w );\n}\nvec2 unpackRGBATo2Half( vec4 v ) {\n\treturn vec2( v.x + ( v.y / 255.0 ), v.z + ( v.w / 255.0 ) );\n}\nfloat viewZToOrthographicDepth( const in float viewZ, const in float near, const in float far ) {\n\treturn ( viewZ + near ) / ( near - far );\n}\nfloat orthographicDepthToViewZ( const in float depth, const in float near, const in float far ) {\n\treturn depth * ( near - far ) - near;\n}\nfloat viewZToPerspectiveDepth( const in float viewZ, const in float near, const in float far ) {\n\treturn ( ( near + viewZ ) * far ) / ( ( far - near ) * viewZ );\n}\nfloat perspectiveDepthToViewZ( const in float depth, const in float near, const in float far ) {\n\treturn ( near * far ) / ( ( far - near ) * depth - far );\n}",
    premultiplied_alpha_fragment: "#ifdef PREMULTIPLIED_ALPHA\n\tgl_FragColor.rgb *= gl_FragColor.a;\n#endif",
    project_vertex: "vec4 mvPosition = vec4( transformed, 1.0 );\n#ifdef USE_INSTANCING\n\tmvPosition = instanceMatrix * mvPosition;\n#endif\nmvPosition = modelViewMatrix * mvPosition;\ngl_Position = projectionMatrix * mvPosition;",
    dithering_fragment: "#ifdef DITHERING\n\tgl_FragColor.rgb = dithering( gl_FragColor.rgb );\n#endif",
    dithering_pars_fragment: "#ifdef DITHERING\n\tvec3 dithering( vec3 color ) {\n\t\tfloat grid_position = rand( gl_FragCoord.xy );\n\t\tvec3 dither_shift_RGB = vec3( 0.25 / 255.0, -0.25 / 255.0, 0.25 / 255.0 );\n\t\tdither_shift_RGB = mix( 2.0 * dither_shift_RGB, -2.0 * dither_shift_RGB, grid_position );\n\t\treturn color + dither_shift_RGB;\n\t}\n#endif",
    roughnessmap_fragment: "float roughnessFactor = roughness;\n#ifdef USE_ROUGHNESSMAP\n\tvec4 texelRoughness = texture2D( roughnessMap, vRoughnessMapUv );\n\troughnessFactor *= texelRoughness.g;\n#endif",
    roughnessmap_pars_fragment: "#ifdef USE_ROUGHNESSMAP\n\tuniform sampler2D roughnessMap;\n#endif",
    shadowmap_pars_fragment: "#if NUM_SPOT_LIGHT_COORDS > 0\n\tvarying vec4 vSpotLightCoord[ NUM_SPOT_LIGHT_COORDS ];\n#endif\n#if NUM_SPOT_LIGHT_MAPS > 0\n\tuniform sampler2D spotLightMap[ NUM_SPOT_LIGHT_MAPS ];\n#endif\n#ifdef USE_SHADOWMAP\n\t#if NUM_DIR_LIGHT_SHADOWS > 0\n\t\tuniform sampler2D directionalShadowMap[ NUM_DIR_LIGHT_SHADOWS ];\n\t\tvarying vec4 vDirectionalShadowCoord[ NUM_DIR_LIGHT_SHADOWS ];\n\t\tstruct DirectionalLightShadow {\n\t\t\tfloat shadowBias;\n\t\t\tfloat shadowNormalBias;\n\t\t\tfloat shadowRadius;\n\t\t\tvec2 shadowMapSize;\n\t\t};\n\t\tuniform DirectionalLightShadow directionalLightShadows[ NUM_DIR_LIGHT_SHADOWS ];\n\t#endif\n\t#if NUM_SPOT_LIGHT_SHADOWS > 0\n\t\tuniform sampler2D spotShadowMap[ NUM_SPOT_LIGHT_SHADOWS ];\n\t\tstruct SpotLightShadow {\n\t\t\tfloat shadowBias;\n\t\t\tfloat shadowNormalBias;\n\t\t\tfloat shadowRadius;\n\t\t\tvec2 shadowMapSize;\n\t\t};\n\t\tuniform SpotLightShadow spotLightShadows[ NUM_SPOT_LIGHT_SHADOWS ];\n\t#endif\n\t#if NUM_POINT_LIGHT_SHADOWS > 0\n\t\tuniform sampler2D pointShadowMap[ NUM_POINT_LIGHT_SHADOWS ];\n\t\tvarying vec4 vPointShadowCoord[ NUM_POINT_LIGHT_SHADOWS ];\n\t\tstruct PointLightShadow {\n\t\t\tfloat shadowBias;\n\t\t\tfloat shadowNormalBias;\n\t\t\tfloat shadowRadius;\n\t\t\tvec2 shadowMapSize;\n\t\t\tfloat shadowCameraNear;\n\t\t\tfloat shadowCameraFar;\n\t\t};\n\t\tuniform PointLightShadow pointLightShadows[ NUM_POINT_LIGHT_SHADOWS ];\n\t#endif\n\tfloat texture2DCompare( sampler2D depths, vec2 uv, float compare ) {\n\t\treturn step( compare, unpackRGBAToDepth( texture2D( depths, uv ) ) );\n\t}\n\tvec2 texture2DDistribution( sampler2D shadow, vec2 uv ) {\n\t\treturn unpackRGBATo2Half( texture2D( shadow, uv ) );\n\t}\n\tfloat VSMShadow (sampler2D shadow, vec2 uv, float compare ){\n\t\tfloat occlusion = 1.0;\n\t\tvec2 distribution = texture2DDistribution( shadow, uv );\n\t\tfloat hard_shadow = step( compare , distribution.x );\n\t\tif (hard_shadow != 1.0 ) {\n\t\t\tfloat distance = compare - distribution.x ;\n\t\t\tfloat variance = max( 0.00000, distribution.y * distribution.y );\n\t\t\tfloat softness_probability = variance / (variance + distance * distance );\t\t\tsoftness_probability = clamp( ( softness_probability - 0.3 ) / ( 0.95 - 0.3 ), 0.0, 1.0 );\t\t\tocclusion = clamp( max( hard_shadow, softness_probability ), 0.0, 1.0 );\n\t\t}\n\t\treturn occlusion;\n\t}\n\tfloat getShadow( sampler2D shadowMap, vec2 shadowMapSize, float shadowBias, float shadowRadius, vec4 shadowCoord ) {\n\t\tfloat shadow = 1.0;\n\t\tshadowCoord.xyz /= shadowCoord.w;\n\t\tshadowCoord.z += shadowBias;\n\t\tbool inFrustum = shadowCoord.x >= 0.0 && shadowCoord.x <= 1.0 && shadowCoord.y >= 0.0 && shadowCoord.y <= 1.0;\n\t\tbool frustumTest = inFrustum && shadowCoord.z <= 1.0;\n\t\tif ( frustumTest ) {\n\t\t#if defined( SHADOWMAP_TYPE_PCF )\n\t\t\tvec2 texelSize = vec2( 1.0 ) / shadowMapSize;\n\t\t\tfloat dx0 = - texelSize.x * shadowRadius;\n\t\t\tfloat dy0 = - texelSize.y * shadowRadius;\n\t\t\tfloat dx1 = + texelSize.x * shadowRadius;\n\t\t\tfloat dy1 = + texelSize.y * shadowRadius;\n\t\t\tfloat dx2 = dx0 / 2.0;\n\t\t\tfloat dy2 = dy0 / 2.0;\n\t\t\tfloat dx3 = dx1 / 2.0;\n\t\t\tfloat dy3 = dy1 / 2.0;\n\t\t\tshadow = (\n\t\t\t\ttexture2DCompare( shadowMap, shadowCoord.xy + vec2( dx0, dy0 ), shadowCoord.z ) +\n\t\t\t\ttexture2DCompare( shadowMap, shadowCoord.xy + vec2( 0.0, dy0 ), shadowCoord.z ) +\n\t\t\t\ttexture2DCompare( shadowMap, shadowCoord.xy + vec2( dx1, dy0 ), shadowCoord.z ) +\n\t\t\t\ttexture2DCompare( shadowMap, shadowCoord.xy + vec2( dx2, dy2 ), shadowCoord.z ) +\n\t\t\t\ttexture2DCompare( shadowMap, shadowCoord.xy + vec2( 0.0, dy2 ), shadowCoord.z ) +\n\t\t\t\ttexture2DCompare( shadowMap, shadowCoord.xy + vec2( dx3, dy2 ), shadowCoord.z ) +\n\t\t\t\ttexture2DCompare( shadowMap, shadowCoord.xy + vec2( dx0, 0.0 ), shadowCoord.z ) +\n\t\t\t\ttexture2DCompare( shadowMap, shadowCoord.xy + vec2( dx2, 0.0 ), shadowCoord.z ) +\n\t\t\t\ttexture2DCompare( shadowMap, shadowCoord.xy, shadowCoord.z ) +\n\t\t\t\ttexture2DCompare( shadowMap, shadowCoord.xy + vec2( dx3, 0.0 ), shadowCoord.z ) +\n\t\t\t\ttexture2DCompare( shadowMap, shadowCoord.xy + vec2( dx1, 0.0 ), shadowCoord.z ) +\n\t\t\t\ttexture2DCompare( shadowMap, shadowCoord.xy + vec2( dx2, dy3 ), shadowCoord.z ) +\n\t\t\t\ttexture2DCompare( shadowMap, shadowCoord.xy + vec2( 0.0, dy3 ), shadowCoord.z ) +\n\t\t\t\ttexture2DCompare( shadowMap, shadowCoord.xy + vec2( dx3, dy3 ), shadowCoord.z ) +\n\t\t\t\ttexture2DCompare( shadowMap, shadowCoord.xy + vec2( dx0, dy1 ), shadowCoord.z ) +\n\t\t\t\ttexture2DCompare( shadowMap, shadowCoord.xy + vec2( 0.0, dy1 ), shadowCoord.z ) +\n\t\t\t\ttexture2DCompare( shadowMap, shadowCoord.xy + vec2( dx1, dy1 ), shadowCoord.z )\n\t\t\t) * ( 1.0 / 17.0 );\n\t\t#elif defined( SHADOWMAP_TYPE_PCF_SOFT )\n\t\t\tvec2 texelSize = vec2( 1.0 ) / shadowMapSize;\n\t\t\tfloat dx = texelSize.x;\n\t\t\tfloat dy = texelSize.y;\n\t\t\tvec2 uv = shadowCoord.xy;\n\t\t\tvec2 f = fract( uv * shadowMapSize + 0.5 );\n\t\t\tuv -= f * texelSize;\n\t\t\tshadow = (\n\t\t\t\ttexture2DCompare( shadowMap, uv, shadowCoord.z ) +\n\t\t\t\ttexture2DCompare( shadowMap, uv + vec2( dx, 0.0 ), shadowCoord.z ) +\n\t\t\t\ttexture2DCompare( shadowMap, uv + vec2( 0.0, dy ), shadowCoord.z ) +\n\t\t\t\ttexture2DCompare( shadowMap, uv + texelSize, shadowCoord.z ) +\n\t\t\t\tmix( texture2DCompare( shadowMap, uv + vec2( -dx, 0.0 ), shadowCoord.z ),\n\t\t\t\t\t texture2DCompare( shadowMap, uv + vec2( 2.0 * dx, 0.0 ), shadowCoord.z ),\n\t\t\t\t\t f.x ) +\n\t\t\t\tmix( texture2DCompare( shadowMap, uv + vec2( -dx, dy ), shadowCoord.z ),\n\t\t\t\t\t texture2DCompare( shadowMap, uv + vec2( 2.0 * dx, dy ), shadowCoord.z ),\n\t\t\t\t\t f.x ) +\n\t\t\t\tmix( texture2DCompare( shadowMap, uv + vec2( 0.0, -dy ), shadowCoord.z ),\n\t\t\t\t\t texture2DCompare( shadowMap, uv + vec2( 0.0, 2.0 * dy ), shadowCoord.z ),\n\t\t\t\t\t f.y ) +\n\t\t\t\tmix( texture2DCompare( shadowMap, uv + vec2( dx, -dy ), shadowCoord.z ),\n\t\t\t\t\t texture2DCompare( shadowMap, uv + vec2( dx, 2.0 * dy ), shadowCoord.z ),\n\t\t\t\t\t f.y ) +\n\t\t\t\tmix( mix( texture2DCompare( shadowMap, uv + vec2( -dx, -dy ), shadowCoord.z ),\n\t\t\t\t\t\t  texture2DCompare( shadowMap, uv + vec2( 2.0 * dx, -dy ), shadowCoord.z ),\n\t\t\t\t\t\t  f.x ),\n\t\t\t\t\t mix( texture2DCompare( shadowMap, uv + vec2( -dx, 2.0 * dy ), shadowCoord.z ),\n\t\t\t\t\t\t  texture2DCompare( shadowMap, uv + vec2( 2.0 * dx, 2.0 * dy ), shadowCoord.z ),\n\t\t\t\t\t\t  f.x ),\n\t\t\t\t\t f.y )\n\t\t\t) * ( 1.0 / 9.0 );\n\t\t#elif defined( SHADOWMAP_TYPE_VSM )\n\t\t\tshadow = VSMShadow( shadowMap, shadowCoord.xy, shadowCoord.z );\n\t\t#else\n\t\t\tshadow = texture2DCompare( shadowMap, shadowCoord.xy, shadowCoord.z );\n\t\t#endif\n\t\t}\n\t\treturn shadow;\n\t}\n\tvec2 cubeToUV( vec3 v, float texelSizeY ) {\n\t\tvec3 absV = abs( v );\n\t\tfloat scaleToCube = 1.0 / max( absV.x, max( absV.y, absV.z ) );\n\t\tabsV *= scaleToCube;\n\t\tv *= scaleToCube * ( 1.0 - 2.0 * texelSizeY );\n\t\tvec2 planar = v.xy;\n\t\tfloat almostATexel = 1.5 * texelSizeY;\n\t\tfloat almostOne = 1.0 - almostATexel;\n\t\tif ( absV.z >= almostOne ) {\n\t\t\tif ( v.z > 0.0 )\n\t\t\t\tplanar.x = 4.0 - v.x;\n\t\t} else if ( absV.x >= almostOne ) {\n\t\t\tfloat signX = sign( v.x );\n\t\t\tplanar.x = v.z * signX + 2.0 * signX;\n\t\t} else if ( absV.y >= almostOne ) {\n\t\t\tfloat signY = sign( v.y );\n\t\t\tplanar.x = v.x + 2.0 * signY + 2.0;\n\t\t\tplanar.y = v.z * signY - 2.0;\n\t\t}\n\t\treturn vec2( 0.125, 0.25 ) * planar + vec2( 0.375, 0.75 );\n\t}\n\tfloat getPointShadow( sampler2D shadowMap, vec2 shadowMapSize, float shadowBias, float shadowRadius, vec4 shadowCoord, float shadowCameraNear, float shadowCameraFar ) {\n\t\tvec2 texelSize = vec2( 1.0 ) / ( shadowMapSize * vec2( 4.0, 2.0 ) );\n\t\tvec3 lightToPosition = shadowCoord.xyz;\n\t\tfloat dp = ( length( lightToPosition ) - shadowCameraNear ) / ( shadowCameraFar - shadowCameraNear );\t\tdp += shadowBias;\n\t\tvec3 bd3D = normalize( lightToPosition );\n\t\t#if defined( SHADOWMAP_TYPE_PCF ) || defined( SHADOWMAP_TYPE_PCF_SOFT ) || defined( SHADOWMAP_TYPE_VSM )\n\t\t\tvec2 offset = vec2( - 1, 1 ) * shadowRadius * texelSize.y;\n\t\t\treturn (\n\t\t\t\ttexture2DCompare( shadowMap, cubeToUV( bd3D + offset.xyy, texelSize.y ), dp ) +\n\t\t\t\ttexture2DCompare( shadowMap, cubeToUV( bd3D + offset.yyy, texelSize.y ), dp ) +\n\t\t\t\ttexture2DCompare( shadowMap, cubeToUV( bd3D + offset.xyx, texelSize.y ), dp ) +\n\t\t\t\ttexture2DCompare( shadowMap, cubeToUV( bd3D + offset.yyx, texelSize.y ), dp ) +\n\t\t\t\ttexture2DCompare( shadowMap, cubeToUV( bd3D, texelSize.y ), dp ) +\n\t\t\t\ttexture2DCompare( shadowMap, cubeToUV( bd3D + offset.xxy, texelSize.y ), dp ) +\n\t\t\t\ttexture2DCompare( shadowMap, cubeToUV( bd3D + offset.yxy, texelSize.y ), dp ) +\n\t\t\t\ttexture2DCompare( shadowMap, cubeToUV( bd3D + offset.xxx, texelSize.y ), dp ) +\n\t\t\t\ttexture2DCompare( shadowMap, cubeToUV( bd3D + offset.yxx, texelSize.y ), dp )\n\t\t\t) * ( 1.0 / 9.0 );\n\t\t#else\n\t\t\treturn texture2DCompare( shadowMap, cubeToUV( bd3D, texelSize.y ), dp );\n\t\t#endif\n\t}\n#endif",
    shadowmap_pars_vertex: "#if NUM_SPOT_LIGHT_COORDS > 0\n\tuniform mat4 spotLightMatrix[ NUM_SPOT_LIGHT_COORDS ];\n\tvarying vec4 vSpotLightCoord[ NUM_SPOT_LIGHT_COORDS ];\n#endif\n#ifdef USE_SHADOWMAP\n\t#if NUM_DIR_LIGHT_SHADOWS > 0\n\t\tuniform mat4 directionalShadowMatrix[ NUM_DIR_LIGHT_SHADOWS ];\n\t\tvarying vec4 vDirectionalShadowCoord[ NUM_DIR_LIGHT_SHADOWS ];\n\t\tstruct DirectionalLightShadow {\n\t\t\tfloat shadowBias;\n\t\t\tfloat shadowNormalBias;\n\t\t\tfloat shadowRadius;\n\t\t\tvec2 shadowMapSize;\n\t\t};\n\t\tuniform DirectionalLightShadow directionalLightShadows[ NUM_DIR_LIGHT_SHADOWS ];\n\t#endif\n\t#if NUM_SPOT_LIGHT_SHADOWS > 0\n\t\tstruct SpotLightShadow {\n\t\t\tfloat shadowBias;\n\t\t\tfloat shadowNormalBias;\n\t\t\tfloat shadowRadius;\n\t\t\tvec2 shadowMapSize;\n\t\t};\n\t\tuniform SpotLightShadow spotLightShadows[ NUM_SPOT_LIGHT_SHADOWS ];\n\t#endif\n\t#if NUM_POINT_LIGHT_SHADOWS > 0\n\t\tuniform mat4 pointShadowMatrix[ NUM_POINT_LIGHT_SHADOWS ];\n\t\tvarying vec4 vPointShadowCoord[ NUM_POINT_LIGHT_SHADOWS ];\n\t\tstruct PointLightShadow {\n\t\t\tfloat shadowBias;\n\t\t\tfloat shadowNormalBias;\n\t\t\tfloat shadowRadius;\n\t\t\tvec2 shadowMapSize;\n\t\t\tfloat shadowCameraNear;\n\t\t\tfloat shadowCameraFar;\n\t\t};\n\t\tuniform PointLightShadow pointLightShadows[ NUM_POINT_LIGHT_SHADOWS ];\n\t#endif\n#endif",
    shadowmap_vertex: "#if ( defined( USE_SHADOWMAP ) && ( NUM_DIR_LIGHT_SHADOWS > 0 || NUM_POINT_LIGHT_SHADOWS > 0 ) ) || ( NUM_SPOT_LIGHT_COORDS > 0 )\n\tvec3 shadowWorldNormal = inverseTransformDirection( transformedNormal, viewMatrix );\n\tvec4 shadowWorldPosition;\n#endif\n#if defined( USE_SHADOWMAP )\n\t#if NUM_DIR_LIGHT_SHADOWS > 0\n\t\t#pragma unroll_loop_start\n\t\tfor ( int i = 0; i < NUM_DIR_LIGHT_SHADOWS; i ++ ) {\n\t\t\tshadowWorldPosition = worldPosition + vec4( shadowWorldNormal * directionalLightShadows[ i ].shadowNormalBias, 0 );\n\t\t\tvDirectionalShadowCoord[ i ] = directionalShadowMatrix[ i ] * shadowWorldPosition;\n\t\t}\n\t\t#pragma unroll_loop_end\n\t#endif\n\t#if NUM_POINT_LIGHT_SHADOWS > 0\n\t\t#pragma unroll_loop_start\n\t\tfor ( int i = 0; i < NUM_POINT_LIGHT_SHADOWS; i ++ ) {\n\t\t\tshadowWorldPosition = worldPosition + vec4( shadowWorldNormal * pointLightShadows[ i ].shadowNormalBias, 0 );\n\t\t\tvPointShadowCoord[ i ] = pointShadowMatrix[ i ] * shadowWorldPosition;\n\t\t}\n\t\t#pragma unroll_loop_end\n\t#endif\n#endif\n#if NUM_SPOT_LIGHT_COORDS > 0\n\t#pragma unroll_loop_start\n\tfor ( int i = 0; i < NUM_SPOT_LIGHT_COORDS; i ++ ) {\n\t\tshadowWorldPosition = worldPosition;\n\t\t#if ( defined( USE_SHADOWMAP ) && UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )\n\t\t\tshadowWorldPosition.xyz += shadowWorldNormal * spotLightShadows[ i ].shadowNormalBias;\n\t\t#endif\n\t\tvSpotLightCoord[ i ] = spotLightMatrix[ i ] * shadowWorldPosition;\n\t}\n\t#pragma unroll_loop_end\n#endif",
    shadowmask_pars_fragment: "float getShadowMask() {\n\tfloat shadow = 1.0;\n\t#ifdef USE_SHADOWMAP\n\t#if NUM_DIR_LIGHT_SHADOWS > 0\n\tDirectionalLightShadow directionalLight;\n\t#pragma unroll_loop_start\n\tfor ( int i = 0; i < NUM_DIR_LIGHT_SHADOWS; i ++ ) {\n\t\tdirectionalLight = directionalLightShadows[ i ];\n\t\tshadow *= receiveShadow ? getShadow( directionalShadowMap[ i ], directionalLight.shadowMapSize, directionalLight.shadowBias, directionalLight.shadowRadius, vDirectionalShadowCoord[ i ] ) : 1.0;\n\t}\n\t#pragma unroll_loop_end\n\t#endif\n\t#if NUM_SPOT_LIGHT_SHADOWS > 0\n\tSpotLightShadow spotLight;\n\t#pragma unroll_loop_start\n\tfor ( int i = 0; i < NUM_SPOT_LIGHT_SHADOWS; i ++ ) {\n\t\tspotLight = spotLightShadows[ i ];\n\t\tshadow *= receiveShadow ? getShadow( spotShadowMap[ i ], spotLight.shadowMapSize, spotLight.shadowBias, spotLight.shadowRadius, vSpotLightCoord[ i ] ) : 1.0;\n\t}\n\t#pragma unroll_loop_end\n\t#endif\n\t#if NUM_POINT_LIGHT_SHADOWS > 0\n\tPointLightShadow pointLight;\n\t#pragma unroll_loop_start\n\tfor ( int i = 0; i < NUM_POINT_LIGHT_SHADOWS; i ++ ) {\n\t\tpointLight = pointLightShadows[ i ];\n\t\tshadow *= receiveShadow ? getPointShadow( pointShadowMap[ i ], pointLight.shadowMapSize, pointLight.shadowBias, pointLight.shadowRadius, vPointShadowCoord[ i ], pointLight.shadowCameraNear, pointLight.shadowCameraFar ) : 1.0;\n\t}\n\t#pragma unroll_loop_end\n\t#endif\n\t#endif\n\treturn shadow;\n}",
    skinbase_vertex: "#ifdef USE_SKINNING\n\tmat4 boneMatX = getBoneMatrix( skinIndex.x );\n\tmat4 boneMatY = getBoneMatrix( skinIndex.y );\n\tmat4 boneMatZ = getBoneMatrix( skinIndex.z );\n\tmat4 boneMatW = getBoneMatrix( skinIndex.w );\n#endif",
    skinning_pars_vertex: "#ifdef USE_SKINNING\n\tuniform mat4 bindMatrix;\n\tuniform mat4 bindMatrixInverse;\n\tuniform highp sampler2D boneTexture;\n\tuniform int boneTextureSize;\n\tmat4 getBoneMatrix( const in float i ) {\n\t\tfloat j = i * 4.0;\n\t\tfloat x = mod( j, float( boneTextureSize ) );\n\t\tfloat y = floor( j / float( boneTextureSize ) );\n\t\tfloat dx = 1.0 / float( boneTextureSize );\n\t\tfloat dy = 1.0 / float( boneTextureSize );\n\t\ty = dy * ( y + 0.5 );\n\t\tvec4 v1 = texture2D( boneTexture, vec2( dx * ( x + 0.5 ), y ) );\n\t\tvec4 v2 = texture2D( boneTexture, vec2( dx * ( x + 1.5 ), y ) );\n\t\tvec4 v3 = texture2D( boneTexture, vec2( dx * ( x + 2.5 ), y ) );\n\t\tvec4 v4 = texture2D( boneTexture, vec2( dx * ( x + 3.5 ), y ) );\n\t\tmat4 bone = mat4( v1, v2, v3, v4 );\n\t\treturn bone;\n\t}\n#endif",
    skinning_vertex: "#ifdef USE_SKINNING\n\tvec4 skinVertex = bindMatrix * vec4( transformed, 1.0 );\n\tvec4 skinned = vec4( 0.0 );\n\tskinned += boneMatX * skinVertex * skinWeight.x;\n\tskinned += boneMatY * skinVertex * skinWeight.y;\n\tskinned += boneMatZ * skinVertex * skinWeight.z;\n\tskinned += boneMatW * skinVertex * skinWeight.w;\n\ttransformed = ( bindMatrixInverse * skinned ).xyz;\n#endif",
    skinnormal_vertex: "#ifdef USE_SKINNING\n\tmat4 skinMatrix = mat4( 0.0 );\n\tskinMatrix += skinWeight.x * boneMatX;\n\tskinMatrix += skinWeight.y * boneMatY;\n\tskinMatrix += skinWeight.z * boneMatZ;\n\tskinMatrix += skinWeight.w * boneMatW;\n\tskinMatrix = bindMatrixInverse * skinMatrix * bindMatrix;\n\tobjectNormal = vec4( skinMatrix * vec4( objectNormal, 0.0 ) ).xyz;\n\t#ifdef USE_TANGENT\n\t\tobjectTangent = vec4( skinMatrix * vec4( objectTangent, 0.0 ) ).xyz;\n\t#endif\n#endif",
    specularmap_fragment: "float specularStrength;\n#ifdef USE_SPECULARMAP\n\tvec4 texelSpecular = texture2D( specularMap, vSpecularMapUv );\n\tspecularStrength = texelSpecular.r;\n#else\n\tspecularStrength = 1.0;\n#endif",
    specularmap_pars_fragment: "#ifdef USE_SPECULARMAP\n\tuniform sampler2D specularMap;\n#endif",
    tonemapping_fragment: "#if defined( TONE_MAPPING )\n\tgl_FragColor.rgb = toneMapping( gl_FragColor.rgb );\n#endif",
    tonemapping_pars_fragment: "#ifndef saturate\n#define saturate( a ) clamp( a, 0.0, 1.0 )\n#endif\nuniform float toneMappingExposure;\nvec3 LinearToneMapping( vec3 color ) {\n\treturn toneMappingExposure * color;\n}\nvec3 ReinhardToneMapping( vec3 color ) {\n\tcolor *= toneMappingExposure;\n\treturn saturate( color / ( vec3( 1.0 ) + color ) );\n}\nvec3 OptimizedCineonToneMapping( vec3 color ) {\n\tcolor *= toneMappingExposure;\n\tcolor = max( vec3( 0.0 ), color - 0.004 );\n\treturn pow( ( color * ( 6.2 * color + 0.5 ) ) / ( color * ( 6.2 * color + 1.7 ) + 0.06 ), vec3( 2.2 ) );\n}\nvec3 RRTAndODTFit( vec3 v ) {\n\tvec3 a = v * ( v + 0.0245786 ) - 0.000090537;\n\tvec3 b = v * ( 0.983729 * v + 0.4329510 ) + 0.238081;\n\treturn a / b;\n}\nvec3 ACESFilmicToneMapping( vec3 color ) {\n\tconst mat3 ACESInputMat = mat3(\n\t\tvec3( 0.59719, 0.07600, 0.02840 ),\t\tvec3( 0.35458, 0.90834, 0.13383 ),\n\t\tvec3( 0.04823, 0.01566, 0.83777 )\n\t);\n\tconst mat3 ACESOutputMat = mat3(\n\t\tvec3(  1.60475, -0.10208, -0.00327 ),\t\tvec3( -0.53108,  1.10813, -0.07276 ),\n\t\tvec3( -0.07367, -0.00605,  1.07602 )\n\t);\n\tcolor *= toneMappingExposure / 0.6;\n\tcolor = ACESInputMat * color;\n\tcolor = RRTAndODTFit( color );\n\tcolor = ACESOutputMat * color;\n\treturn saturate( color );\n}\nvec3 CustomToneMapping( vec3 color ) { return color; }",
    transmission_fragment: "#ifdef USE_TRANSMISSION\n\tmaterial.transmission = transmission;\n\tmaterial.transmissionAlpha = 1.0;\n\tmaterial.thickness = thickness;\n\tmaterial.attenuationDistance = attenuationDistance;\n\tmaterial.attenuationColor = attenuationColor;\n\t#ifdef USE_TRANSMISSIONMAP\n\t\tmaterial.transmission *= texture2D( transmissionMap, vTransmissionMapUv ).r;\n\t#endif\n\t#ifdef USE_THICKNESSMAP\n\t\tmaterial.thickness *= texture2D( thicknessMap, vThicknessMapUv ).g;\n\t#endif\n\tvec3 pos = vWorldPosition;\n\tvec3 v = normalize( cameraPosition - pos );\n\tvec3 n = inverseTransformDirection( normal, viewMatrix );\n\tvec4 transmission = getIBLVolumeRefraction(\n\t\tn, v, material.roughness, material.diffuseColor, material.specularColor, material.specularF90,\n\t\tpos, modelMatrix, viewMatrix, projectionMatrix, material.ior, material.thickness,\n\t\tmaterial.attenuationColor, material.attenuationDistance );\n\tmaterial.transmissionAlpha = mix( material.transmissionAlpha, transmission.a, material.transmission );\n\ttotalDiffuse = mix( totalDiffuse, transmission.rgb, material.transmission );\n#endif",
    transmission_pars_fragment: "#ifdef USE_TRANSMISSION\n\tuniform float transmission;\n\tuniform float thickness;\n\tuniform float attenuationDistance;\n\tuniform vec3 attenuationColor;\n\t#ifdef USE_TRANSMISSIONMAP\n\t\tuniform sampler2D transmissionMap;\n\t#endif\n\t#ifdef USE_THICKNESSMAP\n\t\tuniform sampler2D thicknessMap;\n\t#endif\n\tuniform vec2 transmissionSamplerSize;\n\tuniform sampler2D transmissionSamplerMap;\n\tuniform mat4 modelMatrix;\n\tuniform mat4 projectionMatrix;\n\tvarying vec3 vWorldPosition;\n\tfloat w0( float a ) {\n\t\treturn ( 1.0 / 6.0 ) * ( a * ( a * ( - a + 3.0 ) - 3.0 ) + 1.0 );\n\t}\n\tfloat w1( float a ) {\n\t\treturn ( 1.0 / 6.0 ) * ( a *  a * ( 3.0 * a - 6.0 ) + 4.0 );\n\t}\n\tfloat w2( float a ){\n\t\treturn ( 1.0 / 6.0 ) * ( a * ( a * ( - 3.0 * a + 3.0 ) + 3.0 ) + 1.0 );\n\t}\n\tfloat w3( float a ) {\n\t\treturn ( 1.0 / 6.0 ) * ( a * a * a );\n\t}\n\tfloat g0( float a ) {\n\t\treturn w0( a ) + w1( a );\n\t}\n\tfloat g1( float a ) {\n\t\treturn w2( a ) + w3( a );\n\t}\n\tfloat h0( float a ) {\n\t\treturn - 1.0 + w1( a ) / ( w0( a ) + w1( a ) );\n\t}\n\tfloat h1( float a ) {\n\t\treturn 1.0 + w3( a ) / ( w2( a ) + w3( a ) );\n\t}\n\tvec4 bicubic( sampler2D tex, vec2 uv, vec4 texelSize, float lod ) {\n\t\tuv = uv * texelSize.zw + 0.5;\n\t\tvec2 iuv = floor( uv );\n\t\tvec2 fuv = fract( uv );\n\t\tfloat g0x = g0( fuv.x );\n\t\tfloat g1x = g1( fuv.x );\n\t\tfloat h0x = h0( fuv.x );\n\t\tfloat h1x = h1( fuv.x );\n\t\tfloat h0y = h0( fuv.y );\n\t\tfloat h1y = h1( fuv.y );\n\t\tvec2 p0 = ( vec2( iuv.x + h0x, iuv.y + h0y ) - 0.5 ) * texelSize.xy;\n\t\tvec2 p1 = ( vec2( iuv.x + h1x, iuv.y + h0y ) - 0.5 ) * texelSize.xy;\n\t\tvec2 p2 = ( vec2( iuv.x + h0x, iuv.y + h1y ) - 0.5 ) * texelSize.xy;\n\t\tvec2 p3 = ( vec2( iuv.x + h1x, iuv.y + h1y ) - 0.5 ) * texelSize.xy;\n\t\treturn g0( fuv.y ) * ( g0x * textureLod( tex, p0, lod ) + g1x * textureLod( tex, p1, lod ) ) +\n\t\t\tg1( fuv.y ) * ( g0x * textureLod( tex, p2, lod ) + g1x * textureLod( tex, p3, lod ) );\n\t}\n\tvec4 textureBicubic( sampler2D sampler, vec2 uv, float lod ) {\n\t\tvec2 fLodSize = vec2( textureSize( sampler, int( lod ) ) );\n\t\tvec2 cLodSize = vec2( textureSize( sampler, int( lod + 1.0 ) ) );\n\t\tvec2 fLodSizeInv = 1.0 / fLodSize;\n\t\tvec2 cLodSizeInv = 1.0 / cLodSize;\n\t\tvec4 fSample = bicubic( sampler, uv, vec4( fLodSizeInv, fLodSize ), floor( lod ) );\n\t\tvec4 cSample = bicubic( sampler, uv, vec4( cLodSizeInv, cLodSize ), ceil( lod ) );\n\t\treturn mix( fSample, cSample, fract( lod ) );\n\t}\n\tvec3 getVolumeTransmissionRay( const in vec3 n, const in vec3 v, const in float thickness, const in float ior, const in mat4 modelMatrix ) {\n\t\tvec3 refractionVector = refract( - v, normalize( n ), 1.0 / ior );\n\t\tvec3 modelScale;\n\t\tmodelScale.x = length( vec3( modelMatrix[ 0 ].xyz ) );\n\t\tmodelScale.y = length( vec3( modelMatrix[ 1 ].xyz ) );\n\t\tmodelScale.z = length( vec3( modelMatrix[ 2 ].xyz ) );\n\t\treturn normalize( refractionVector ) * thickness * modelScale;\n\t}\n\tfloat applyIorToRoughness( const in float roughness, const in float ior ) {\n\t\treturn roughness * clamp( ior * 2.0 - 2.0, 0.0, 1.0 );\n\t}\n\tvec4 getTransmissionSample( const in vec2 fragCoord, const in float roughness, const in float ior ) {\n\t\tfloat lod = log2( transmissionSamplerSize.x ) * applyIorToRoughness( roughness, ior );\n\t\treturn textureBicubic( transmissionSamplerMap, fragCoord.xy, lod );\n\t}\n\tvec3 applyVolumeAttenuation( const in vec3 radiance, const in float transmissionDistance, const in vec3 attenuationColor, const in float attenuationDistance ) {\n\t\tif ( isinf( attenuationDistance ) ) {\n\t\t\treturn radiance;\n\t\t} else {\n\t\t\tvec3 attenuationCoefficient = -log( attenuationColor ) / attenuationDistance;\n\t\t\tvec3 transmittance = exp( - attenuationCoefficient * transmissionDistance );\t\t\treturn transmittance * radiance;\n\t\t}\n\t}\n\tvec4 getIBLVolumeRefraction( const in vec3 n, const in vec3 v, const in float roughness, const in vec3 diffuseColor,\n\t\tconst in vec3 specularColor, const in float specularF90, const in vec3 position, const in mat4 modelMatrix,\n\t\tconst in mat4 viewMatrix, const in mat4 projMatrix, const in float ior, const in float thickness,\n\t\tconst in vec3 attenuationColor, const in float attenuationDistance ) {\n\t\tvec3 transmissionRay = getVolumeTransmissionRay( n, v, thickness, ior, modelMatrix );\n\t\tvec3 refractedRayExit = position + transmissionRay;\n\t\tvec4 ndcPos = projMatrix * viewMatrix * vec4( refractedRayExit, 1.0 );\n\t\tvec2 refractionCoords = ndcPos.xy / ndcPos.w;\n\t\trefractionCoords += 1.0;\n\t\trefractionCoords /= 2.0;\n\t\tvec4 transmittedLight = getTransmissionSample( refractionCoords, roughness, ior );\n\t\tvec3 attenuatedColor = applyVolumeAttenuation( transmittedLight.rgb, length( transmissionRay ), attenuationColor, attenuationDistance );\n\t\tvec3 F = EnvironmentBRDF( n, v, specularColor, specularF90, roughness );\n\t\treturn vec4( ( 1.0 - F ) * attenuatedColor * diffuseColor, transmittedLight.a );\n\t}\n#endif",
    uv_pars_fragment: "#ifdef USE_UV\n\tvarying vec2 vUv;\n#endif\n#ifdef USE_MAP\n\tvarying vec2 vMapUv;\n#endif\n#ifdef USE_ALPHAMAP\n\tvarying vec2 vAlphaMapUv;\n#endif\n#ifdef USE_LIGHTMAP\n\tvarying vec2 vLightMapUv;\n#endif\n#ifdef USE_AOMAP\n\tvarying vec2 vAoMapUv;\n#endif\n#ifdef USE_BUMPMAP\n\tvarying vec2 vBumpMapUv;\n#endif\n#ifdef USE_NORMALMAP\n\tvarying vec2 vNormalMapUv;\n#endif\n#ifdef USE_EMISSIVEMAP\n\tvarying vec2 vEmissiveMapUv;\n#endif\n#ifdef USE_METALNESSMAP\n\tvarying vec2 vMetalnessMapUv;\n#endif\n#ifdef USE_ROUGHNESSMAP\n\tvarying vec2 vRoughnessMapUv;\n#endif\n#ifdef USE_CLEARCOATMAP\n\tvarying vec2 vClearcoatMapUv;\n#endif\n#ifdef USE_CLEARCOAT_NORMALMAP\n\tvarying vec2 vClearcoatNormalMapUv;\n#endif\n#ifdef USE_CLEARCOAT_ROUGHNESSMAP\n\tvarying vec2 vClearcoatRoughnessMapUv;\n#endif\n#ifdef USE_IRIDESCENCEMAP\n\tvarying vec2 vIridescenceMapUv;\n#endif\n#ifdef USE_IRIDESCENCE_THICKNESSMAP\n\tvarying vec2 vIridescenceThicknessMapUv;\n#endif\n#ifdef USE_SHEEN_COLORMAP\n\tvarying vec2 vSheenColorMapUv;\n#endif\n#ifdef USE_SHEEN_ROUGHNESSMAP\n\tvarying vec2 vSheenRoughnessMapUv;\n#endif\n#ifdef USE_SPECULARMAP\n\tvarying vec2 vSpecularMapUv;\n#endif\n#ifdef USE_SPECULAR_COLORMAP\n\tvarying vec2 vSpecularColorMapUv;\n#endif\n#ifdef USE_SPECULAR_INTENSITYMAP\n\tvarying vec2 vSpecularIntensityMapUv;\n#endif\n#ifdef USE_TRANSMISSIONMAP\n\tuniform mat3 transmissionMapTransform;\n\tvarying vec2 vTransmissionMapUv;\n#endif\n#ifdef USE_THICKNESSMAP\n\tuniform mat3 thicknessMapTransform;\n\tvarying vec2 vThicknessMapUv;\n#endif",
    uv_pars_vertex: "#ifdef USE_UV\n\tvarying vec2 vUv;\n#endif\n#ifdef USE_MAP\n\tuniform mat3 mapTransform;\n\tvarying vec2 vMapUv;\n#endif\n#ifdef USE_ALPHAMAP\n\tuniform mat3 alphaMapTransform;\n\tvarying vec2 vAlphaMapUv;\n#endif\n#ifdef USE_LIGHTMAP\n\tuniform mat3 lightMapTransform;\n\tvarying vec2 vLightMapUv;\n#endif\n#ifdef USE_AOMAP\n\tuniform mat3 aoMapTransform;\n\tvarying vec2 vAoMapUv;\n#endif\n#ifdef USE_BUMPMAP\n\tuniform mat3 bumpMapTransform;\n\tvarying vec2 vBumpMapUv;\n#endif\n#ifdef USE_NORMALMAP\n\tuniform mat3 normalMapTransform;\n\tvarying vec2 vNormalMapUv;\n#endif\n#ifdef USE_DISPLACEMENTMAP\n\tuniform mat3 displacementMapTransform;\n\tvarying vec2 vDisplacementMapUv;\n#endif\n#ifdef USE_EMISSIVEMAP\n\tuniform mat3 emissiveMapTransform;\n\tvarying vec2 vEmissiveMapUv;\n#endif\n#ifdef USE_METALNESSMAP\n\tuniform mat3 metalnessMapTransform;\n\tvarying vec2 vMetalnessMapUv;\n#endif\n#ifdef USE_ROUGHNESSMAP\n\tuniform mat3 roughnessMapTransform;\n\tvarying vec2 vRoughnessMapUv;\n#endif\n#ifdef USE_CLEARCOATMAP\n\tuniform mat3 clearcoatMapTransform;\n\tvarying vec2 vClearcoatMapUv;\n#endif\n#ifdef USE_CLEARCOAT_NORMALMAP\n\tuniform mat3 clearcoatNormalMapTransform;\n\tvarying vec2 vClearcoatNormalMapUv;\n#endif\n#ifdef USE_CLEARCOAT_ROUGHNESSMAP\n\tuniform mat3 clearcoatRoughnessMapTransform;\n\tvarying vec2 vClearcoatRoughnessMapUv;\n#endif\n#ifdef USE_SHEEN_COLORMAP\n\tuniform mat3 sheenColorMapTransform;\n\tvarying vec2 vSheenColorMapUv;\n#endif\n#ifdef USE_SHEEN_ROUGHNESSMAP\n\tuniform mat3 sheenRoughnessMapTransform;\n\tvarying vec2 vSheenRoughnessMapUv;\n#endif\n#ifdef USE_IRIDESCENCEMAP\n\tuniform mat3 iridescenceMapTransform;\n\tvarying vec2 vIridescenceMapUv;\n#endif\n#ifdef USE_IRIDESCENCE_THICKNESSMAP\n\tuniform mat3 iridescenceThicknessMapTransform;\n\tvarying vec2 vIridescenceThicknessMapUv;\n#endif\n#ifdef USE_SPECULARMAP\n\tuniform mat3 specularMapTransform;\n\tvarying vec2 vSpecularMapUv;\n#endif\n#ifdef USE_SPECULAR_COLORMAP\n\tuniform mat3 specularColorMapTransform;\n\tvarying vec2 vSpecularColorMapUv;\n#endif\n#ifdef USE_SPECULAR_INTENSITYMAP\n\tuniform mat3 specularIntensityMapTransform;\n\tvarying vec2 vSpecularIntensityMapUv;\n#endif\n#ifdef USE_TRANSMISSIONMAP\n\tuniform mat3 transmissionMapTransform;\n\tvarying vec2 vTransmissionMapUv;\n#endif\n#ifdef USE_THICKNESSMAP\n\tuniform mat3 thicknessMapTransform;\n\tvarying vec2 vThicknessMapUv;\n#endif",
    uv_vertex: "#ifdef USE_UV\n\tvUv = vec3( uv, 1 ).xy;\n#endif\n#ifdef USE_MAP\n\tvMapUv = ( mapTransform * vec3( MAP_UV, 1 ) ).xy;\n#endif\n#ifdef USE_ALPHAMAP\n\tvAlphaMapUv = ( alphaMapTransform * vec3( ALPHAMAP_UV, 1 ) ).xy;\n#endif\n#ifdef USE_LIGHTMAP\n\tvLightMapUv = ( lightMapTransform * vec3( LIGHTMAP_UV, 1 ) ).xy;\n#endif\n#ifdef USE_AOMAP\n\tvAoMapUv = ( aoMapTransform * vec3( AOMAP_UV, 1 ) ).xy;\n#endif\n#ifdef USE_BUMPMAP\n\tvBumpMapUv = ( bumpMapTransform * vec3( BUMPMAP_UV, 1 ) ).xy;\n#endif\n#ifdef USE_NORMALMAP\n\tvNormalMapUv = ( normalMapTransform * vec3( NORMALMAP_UV, 1 ) ).xy;\n#endif\n#ifdef USE_DISPLACEMENTMAP\n\tvDisplacementMapUv = ( displacementMapTransform * vec3( DISPLACEMENTMAP_UV, 1 ) ).xy;\n#endif\n#ifdef USE_EMISSIVEMAP\n\tvEmissiveMapUv = ( emissiveMapTransform * vec3( EMISSIVEMAP_UV, 1 ) ).xy;\n#endif\n#ifdef USE_METALNESSMAP\n\tvMetalnessMapUv = ( metalnessMapTransform * vec3( METALNESSMAP_UV, 1 ) ).xy;\n#endif\n#ifdef USE_ROUGHNESSMAP\n\tvRoughnessMapUv = ( roughnessMapTransform * vec3( ROUGHNESSMAP_UV, 1 ) ).xy;\n#endif\n#ifdef USE_CLEARCOATMAP\n\tvClearcoatMapUv = ( clearcoatMapTransform * vec3( CLEARCOATMAP_UV, 1 ) ).xy;\n#endif\n#ifdef USE_CLEARCOAT_NORMALMAP\n\tvClearcoatNormalMapUv = ( clearcoatNormalMapTransform * vec3( CLEARCOAT_NORMALMAP_UV, 1 ) ).xy;\n#endif\n#ifdef USE_CLEARCOAT_ROUGHNESSMAP\n\tvClearcoatRoughnessMapUv = ( clearcoatRoughnessMapTransform * vec3( CLEARCOAT_ROUGHNESSMAP_UV, 1 ) ).xy;\n#endif\n#ifdef USE_IRIDESCENCEMAP\n\tvIridescenceMapUv = ( iridescenceMapTransform * vec3( IRIDESCENCEMAP_UV, 1 ) ).xy;\n#endif\n#ifdef USE_IRIDESCENCE_THICKNESSMAP\n\tvIridescenceThicknessMapUv = ( iridescenceThicknessMapTransform * vec3( IRIDESCENCE_THICKNESSMAP_UV, 1 ) ).xy;\n#endif\n#ifdef USE_SHEEN_COLORMAP\n\tvSheenColorMapUv = ( sheenColorMapTransform * vec3( SHEEN_COLORMAP_UV, 1 ) ).xy;\n#endif\n#ifdef USE_SHEEN_ROUGHNESSMAP\n\tvSheenRoughnessMapUv = ( sheenRoughnessMapTransform * vec3( SHEEN_ROUGHNESSMAP_UV, 1 ) ).xy;\n#endif\n#ifdef USE_SPECULARMAP\n\tvSpecularMapUv = ( specularMapTransform * vec3( SPECULARMAP_UV, 1 ) ).xy;\n#endif\n#ifdef USE_SPECULAR_COLORMAP\n\tvSpecularColorMapUv = ( specularColorMapTransform * vec3( SPECULAR_COLORMAP_UV, 1 ) ).xy;\n#endif\n#ifdef USE_SPECULAR_INTENSITYMAP\n\tvSpecularIntensityMapUv = ( specularIntensityMapTransform * vec3( SPECULAR_INTENSITYMAP_UV, 1 ) ).xy;\n#endif\n#ifdef USE_TRANSMISSIONMAP\n\tvTransmissionMapUv = ( transmissionMapTransform * vec3( TRANSMISSIONMAP_UV, 1 ) ).xy;\n#endif\n#ifdef USE_THICKNESSMAP\n\tvThicknessMapUv = ( thicknessMapTransform * vec3( THICKNESSMAP_UV, 1 ) ).xy;\n#endif",
    worldpos_vertex: "#if defined( USE_ENVMAP ) || defined( DISTANCE ) || defined ( USE_SHADOWMAP ) || defined ( USE_TRANSMISSION ) || NUM_SPOT_LIGHT_COORDS > 0\n\tvec4 worldPosition = vec4( transformed, 1.0 );\n\t#ifdef USE_INSTANCING\n\t\tworldPosition = instanceMatrix * worldPosition;\n\t#endif\n\tworldPosition = modelMatrix * worldPosition;\n#endif",
    background_vert: "varying vec2 vUv;\nuniform mat3 uvTransform;\nvoid main() {\n\tvUv = ( uvTransform * vec3( uv, 1 ) ).xy;\n\tgl_Position = vec4( position.xy, 1.0, 1.0 );\n}",
    background_frag: "uniform sampler2D t2D;\nuniform float backgroundIntensity;\nvarying vec2 vUv;\nvoid main() {\n\tvec4 texColor = texture2D( t2D, vUv );\n\ttexColor.rgb *= backgroundIntensity;\n\tgl_FragColor = texColor;\n\t#include <tonemapping_fragment>\n\t#include <encodings_fragment>\n}",
    backgroundCube_vert: "varying vec3 vWorldDirection;\n#include <common>\nvoid main() {\n\tvWorldDirection = transformDirection( position, modelMatrix );\n\t#include <begin_vertex>\n\t#include <project_vertex>\n\tgl_Position.z = gl_Position.w;\n}",
    backgroundCube_frag: "#ifdef ENVMAP_TYPE_CUBE\n\tuniform samplerCube envMap;\n#elif defined( ENVMAP_TYPE_CUBE_UV )\n\tuniform sampler2D envMap;\n#endif\nuniform float flipEnvMap;\nuniform float backgroundBlurriness;\nuniform float backgroundIntensity;\nvarying vec3 vWorldDirection;\n#include <cube_uv_reflection_fragment>\nvoid main() {\n\t#ifdef ENVMAP_TYPE_CUBE\n\t\tvec4 texColor = textureCube( envMap, vec3( flipEnvMap * vWorldDirection.x, vWorldDirection.yz ) );\n\t#elif defined( ENVMAP_TYPE_CUBE_UV )\n\t\tvec4 texColor = textureCubeUV( envMap, vWorldDirection, backgroundBlurriness );\n\t#else\n\t\tvec4 texColor = vec4( 0.0, 0.0, 0.0, 1.0 );\n\t#endif\n\ttexColor.rgb *= backgroundIntensity;\n\tgl_FragColor = texColor;\n\t#include <tonemapping_fragment>\n\t#include <encodings_fragment>\n}",
    cube_vert: "varying vec3 vWorldDirection;\n#include <common>\nvoid main() {\n\tvWorldDirection = transformDirection( position, modelMatrix );\n\t#include <begin_vertex>\n\t#include <project_vertex>\n\tgl_Position.z = gl_Position.w;\n}",
    cube_frag: "uniform samplerCube tCube;\nuniform float tFlip;\nuniform float opacity;\nvarying vec3 vWorldDirection;\nvoid main() {\n\tvec4 texColor = textureCube( tCube, vec3( tFlip * vWorldDirection.x, vWorldDirection.yz ) );\n\tgl_FragColor = texColor;\n\tgl_FragColor.a *= opacity;\n\t#include <tonemapping_fragment>\n\t#include <encodings_fragment>\n}",
    depth_vert: "#include <common>\n#include <uv_pars_vertex>\n#include <displacementmap_pars_vertex>\n#include <morphtarget_pars_vertex>\n#include <skinning_pars_vertex>\n#include <logdepthbuf_pars_vertex>\n#include <clipping_planes_pars_vertex>\nvarying vec2 vHighPrecisionZW;\nvoid main() {\n\t#include <uv_vertex>\n\t#include <skinbase_vertex>\n\t#ifdef USE_DISPLACEMENTMAP\n\t\t#include <beginnormal_vertex>\n\t\t#include <morphnormal_vertex>\n\t\t#include <skinnormal_vertex>\n\t#endif\n\t#include <begin_vertex>\n\t#include <morphtarget_vertex>\n\t#include <skinning_vertex>\n\t#include <displacementmap_vertex>\n\t#include <project_vertex>\n\t#include <logdepthbuf_vertex>\n\t#include <clipping_planes_vertex>\n\tvHighPrecisionZW = gl_Position.zw;\n}",
    depth_frag: "#if DEPTH_PACKING == 3200\n\tuniform float opacity;\n#endif\n#include <common>\n#include <packing>\n#include <uv_pars_fragment>\n#include <map_pars_fragment>\n#include <alphamap_pars_fragment>\n#include <alphatest_pars_fragment>\n#include <logdepthbuf_pars_fragment>\n#include <clipping_planes_pars_fragment>\nvarying vec2 vHighPrecisionZW;\nvoid main() {\n\t#include <clipping_planes_fragment>\n\tvec4 diffuseColor = vec4( 1.0 );\n\t#if DEPTH_PACKING == 3200\n\t\tdiffuseColor.a = opacity;\n\t#endif\n\t#include <map_fragment>\n\t#include <alphamap_fragment>\n\t#include <alphatest_fragment>\n\t#include <logdepthbuf_fragment>\n\tfloat fragCoordZ = 0.5 * vHighPrecisionZW[0] / vHighPrecisionZW[1] + 0.5;\n\t#if DEPTH_PACKING == 3200\n\t\tgl_FragColor = vec4( vec3( 1.0 - fragCoordZ ), opacity );\n\t#elif DEPTH_PACKING == 3201\n\t\tgl_FragColor = packDepthToRGBA( fragCoordZ );\n\t#endif\n}",
    distanceRGBA_vert: "#define DISTANCE\nvarying vec3 vWorldPosition;\n#include <common>\n#include <uv_pars_vertex>\n#include <displacementmap_pars_vertex>\n#include <morphtarget_pars_vertex>\n#include <skinning_pars_vertex>\n#include <clipping_planes_pars_vertex>\nvoid main() {\n\t#include <uv_vertex>\n\t#include <skinbase_vertex>\n\t#ifdef USE_DISPLACEMENTMAP\n\t\t#include <beginnormal_vertex>\n\t\t#include <morphnormal_vertex>\n\t\t#include <skinnormal_vertex>\n\t#endif\n\t#include <begin_vertex>\n\t#include <morphtarget_vertex>\n\t#include <skinning_vertex>\n\t#include <displacementmap_vertex>\n\t#include <project_vertex>\n\t#include <worldpos_vertex>\n\t#include <clipping_planes_vertex>\n\tvWorldPosition = worldPosition.xyz;\n}",
    distanceRGBA_frag: "#define DISTANCE\nuniform vec3 referencePosition;\nuniform float nearDistance;\nuniform float farDistance;\nvarying vec3 vWorldPosition;\n#include <common>\n#include <packing>\n#include <uv_pars_fragment>\n#include <map_pars_fragment>\n#include <alphamap_pars_fragment>\n#include <alphatest_pars_fragment>\n#include <clipping_planes_pars_fragment>\nvoid main () {\n\t#include <clipping_planes_fragment>\n\tvec4 diffuseColor = vec4( 1.0 );\n\t#include <map_fragment>\n\t#include <alphamap_fragment>\n\t#include <alphatest_fragment>\n\tfloat dist = length( vWorldPosition - referencePosition );\n\tdist = ( dist - nearDistance ) / ( farDistance - nearDistance );\n\tdist = saturate( dist );\n\tgl_FragColor = packDepthToRGBA( dist );\n}",
    equirect_vert: "varying vec3 vWorldDirection;\n#include <common>\nvoid main() {\n\tvWorldDirection = transformDirection( position, modelMatrix );\n\t#include <begin_vertex>\n\t#include <project_vertex>\n}",
    equirect_frag: "uniform sampler2D tEquirect;\nvarying vec3 vWorldDirection;\n#include <common>\nvoid main() {\n\tvec3 direction = normalize( vWorldDirection );\n\tvec2 sampleUV = equirectUv( direction );\n\tgl_FragColor = texture2D( tEquirect, sampleUV );\n\t#include <tonemapping_fragment>\n\t#include <encodings_fragment>\n}",
    linedashed_vert: "uniform float scale;\nattribute float lineDistance;\nvarying float vLineDistance;\n#include <common>\n#include <uv_pars_vertex>\n#include <color_pars_vertex>\n#include <fog_pars_vertex>\n#include <morphtarget_pars_vertex>\n#include <logdepthbuf_pars_vertex>\n#include <clipping_planes_pars_vertex>\nvoid main() {\n\tvLineDistance = scale * lineDistance;\n\t#include <uv_vertex>\n\t#include <color_vertex>\n\t#include <morphcolor_vertex>\n\t#include <begin_vertex>\n\t#include <morphtarget_vertex>\n\t#include <project_vertex>\n\t#include <logdepthbuf_vertex>\n\t#include <clipping_planes_vertex>\n\t#include <fog_vertex>\n}",
    linedashed_frag: "uniform vec3 diffuse;\nuniform float opacity;\nuniform float dashSize;\nuniform float totalSize;\nvarying float vLineDistance;\n#include <common>\n#include <color_pars_fragment>\n#include <uv_pars_fragment>\n#include <map_pars_fragment>\n#include <fog_pars_fragment>\n#include <logdepthbuf_pars_fragment>\n#include <clipping_planes_pars_fragment>\nvoid main() {\n\t#include <clipping_planes_fragment>\n\tif ( mod( vLineDistance, totalSize ) > dashSize ) {\n\t\tdiscard;\n\t}\n\tvec3 outgoingLight = vec3( 0.0 );\n\tvec4 diffuseColor = vec4( diffuse, opacity );\n\t#include <logdepthbuf_fragment>\n\t#include <map_fragment>\n\t#include <color_fragment>\n\toutgoingLight = diffuseColor.rgb;\n\t#include <output_fragment>\n\t#include <tonemapping_fragment>\n\t#include <encodings_fragment>\n\t#include <fog_fragment>\n\t#include <premultiplied_alpha_fragment>\n}",
    meshbasic_vert: "#include <common>\n#include <uv_pars_vertex>\n#include <envmap_pars_vertex>\n#include <color_pars_vertex>\n#include <fog_pars_vertex>\n#include <morphtarget_pars_vertex>\n#include <skinning_pars_vertex>\n#include <logdepthbuf_pars_vertex>\n#include <clipping_planes_pars_vertex>\nvoid main() {\n\t#include <uv_vertex>\n\t#include <color_vertex>\n\t#include <morphcolor_vertex>\n\t#if defined ( USE_ENVMAP ) || defined ( USE_SKINNING )\n\t\t#include <beginnormal_vertex>\n\t\t#include <morphnormal_vertex>\n\t\t#include <skinbase_vertex>\n\t\t#include <skinnormal_vertex>\n\t\t#include <defaultnormal_vertex>\n\t#endif\n\t#include <begin_vertex>\n\t#include <morphtarget_vertex>\n\t#include <skinning_vertex>\n\t#include <project_vertex>\n\t#include <logdepthbuf_vertex>\n\t#include <clipping_planes_vertex>\n\t#include <worldpos_vertex>\n\t#include <envmap_vertex>\n\t#include <fog_vertex>\n}",
    meshbasic_frag: "uniform vec3 diffuse;\nuniform float opacity;\n#ifndef FLAT_SHADED\n\tvarying vec3 vNormal;\n#endif\n#include <common>\n#include <dithering_pars_fragment>\n#include <color_pars_fragment>\n#include <uv_pars_fragment>\n#include <map_pars_fragment>\n#include <alphamap_pars_fragment>\n#include <alphatest_pars_fragment>\n#include <aomap_pars_fragment>\n#include <lightmap_pars_fragment>\n#include <envmap_common_pars_fragment>\n#include <envmap_pars_fragment>\n#include <fog_pars_fragment>\n#include <specularmap_pars_fragment>\n#include <logdepthbuf_pars_fragment>\n#include <clipping_planes_pars_fragment>\nvoid main() {\n\t#include <clipping_planes_fragment>\n\tvec4 diffuseColor = vec4( diffuse, opacity );\n\t#include <logdepthbuf_fragment>\n\t#include <map_fragment>\n\t#include <color_fragment>\n\t#include <alphamap_fragment>\n\t#include <alphatest_fragment>\n\t#include <specularmap_fragment>\n\tReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );\n\t#ifdef USE_LIGHTMAP\n\t\tvec4 lightMapTexel = texture2D( lightMap, vLightMapUv );\n\t\treflectedLight.indirectDiffuse += lightMapTexel.rgb * lightMapIntensity * RECIPROCAL_PI;\n\t#else\n\t\treflectedLight.indirectDiffuse += vec3( 1.0 );\n\t#endif\n\t#include <aomap_fragment>\n\treflectedLight.indirectDiffuse *= diffuseColor.rgb;\n\tvec3 outgoingLight = reflectedLight.indirectDiffuse;\n\t#include <envmap_fragment>\n\t#include <output_fragment>\n\t#include <tonemapping_fragment>\n\t#include <encodings_fragment>\n\t#include <fog_fragment>\n\t#include <premultiplied_alpha_fragment>\n\t#include <dithering_fragment>\n}",
    meshlambert_vert: "#define LAMBERT\nvarying vec3 vViewPosition;\n#include <common>\n#include <uv_pars_vertex>\n#include <displacementmap_pars_vertex>\n#include <envmap_pars_vertex>\n#include <color_pars_vertex>\n#include <fog_pars_vertex>\n#include <normal_pars_vertex>\n#include <morphtarget_pars_vertex>\n#include <skinning_pars_vertex>\n#include <shadowmap_pars_vertex>\n#include <logdepthbuf_pars_vertex>\n#include <clipping_planes_pars_vertex>\nvoid main() {\n\t#include <uv_vertex>\n\t#include <color_vertex>\n\t#include <morphcolor_vertex>\n\t#include <beginnormal_vertex>\n\t#include <morphnormal_vertex>\n\t#include <skinbase_vertex>\n\t#include <skinnormal_vertex>\n\t#include <defaultnormal_vertex>\n\t#include <normal_vertex>\n\t#include <begin_vertex>\n\t#include <morphtarget_vertex>\n\t#include <skinning_vertex>\n\t#include <displacementmap_vertex>\n\t#include <project_vertex>\n\t#include <logdepthbuf_vertex>\n\t#include <clipping_planes_vertex>\n\tvViewPosition = - mvPosition.xyz;\n\t#include <worldpos_vertex>\n\t#include <envmap_vertex>\n\t#include <shadowmap_vertex>\n\t#include <fog_vertex>\n}",
    meshlambert_frag: "#define LAMBERT\nuniform vec3 diffuse;\nuniform vec3 emissive;\nuniform float opacity;\n#include <common>\n#include <packing>\n#include <dithering_pars_fragment>\n#include <color_pars_fragment>\n#include <uv_pars_fragment>\n#include <map_pars_fragment>\n#include <alphamap_pars_fragment>\n#include <alphatest_pars_fragment>\n#include <aomap_pars_fragment>\n#include <lightmap_pars_fragment>\n#include <emissivemap_pars_fragment>\n#include <envmap_common_pars_fragment>\n#include <envmap_pars_fragment>\n#include <fog_pars_fragment>\n#include <bsdfs>\n#include <lights_pars_begin>\n#include <normal_pars_fragment>\n#include <lights_lambert_pars_fragment>\n#include <shadowmap_pars_fragment>\n#include <bumpmap_pars_fragment>\n#include <normalmap_pars_fragment>\n#include <specularmap_pars_fragment>\n#include <logdepthbuf_pars_fragment>\n#include <clipping_planes_pars_fragment>\nvoid main() {\n\t#include <clipping_planes_fragment>\n\tvec4 diffuseColor = vec4( diffuse, opacity );\n\tReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );\n\tvec3 totalEmissiveRadiance = emissive;\n\t#include <logdepthbuf_fragment>\n\t#include <map_fragment>\n\t#include <color_fragment>\n\t#include <alphamap_fragment>\n\t#include <alphatest_fragment>\n\t#include <specularmap_fragment>\n\t#include <normal_fragment_begin>\n\t#include <normal_fragment_maps>\n\t#include <emissivemap_fragment>\n\t#include <lights_lambert_fragment>\n\t#include <lights_fragment_begin>\n\t#include <lights_fragment_maps>\n\t#include <lights_fragment_end>\n\t#include <aomap_fragment>\n\tvec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + totalEmissiveRadiance;\n\t#include <envmap_fragment>\n\t#include <output_fragment>\n\t#include <tonemapping_fragment>\n\t#include <encodings_fragment>\n\t#include <fog_fragment>\n\t#include <premultiplied_alpha_fragment>\n\t#include <dithering_fragment>\n}",
    meshmatcap_vert: "#define MATCAP\nvarying vec3 vViewPosition;\n#include <common>\n#include <uv_pars_vertex>\n#include <color_pars_vertex>\n#include <displacementmap_pars_vertex>\n#include <fog_pars_vertex>\n#include <normal_pars_vertex>\n#include <morphtarget_pars_vertex>\n#include <skinning_pars_vertex>\n#include <logdepthbuf_pars_vertex>\n#include <clipping_planes_pars_vertex>\nvoid main() {\n\t#include <uv_vertex>\n\t#include <color_vertex>\n\t#include <morphcolor_vertex>\n\t#include <beginnormal_vertex>\n\t#include <morphnormal_vertex>\n\t#include <skinbase_vertex>\n\t#include <skinnormal_vertex>\n\t#include <defaultnormal_vertex>\n\t#include <normal_vertex>\n\t#include <begin_vertex>\n\t#include <morphtarget_vertex>\n\t#include <skinning_vertex>\n\t#include <displacementmap_vertex>\n\t#include <project_vertex>\n\t#include <logdepthbuf_vertex>\n\t#include <clipping_planes_vertex>\n\t#include <fog_vertex>\n\tvViewPosition = - mvPosition.xyz;\n}",
    meshmatcap_frag: "#define MATCAP\nuniform vec3 diffuse;\nuniform float opacity;\nuniform sampler2D matcap;\nvarying vec3 vViewPosition;\n#include <common>\n#include <dithering_pars_fragment>\n#include <color_pars_fragment>\n#include <uv_pars_fragment>\n#include <map_pars_fragment>\n#include <alphamap_pars_fragment>\n#include <alphatest_pars_fragment>\n#include <fog_pars_fragment>\n#include <normal_pars_fragment>\n#include <bumpmap_pars_fragment>\n#include <normalmap_pars_fragment>\n#include <logdepthbuf_pars_fragment>\n#include <clipping_planes_pars_fragment>\nvoid main() {\n\t#include <clipping_planes_fragment>\n\tvec4 diffuseColor = vec4( diffuse, opacity );\n\t#include <logdepthbuf_fragment>\n\t#include <map_fragment>\n\t#include <color_fragment>\n\t#include <alphamap_fragment>\n\t#include <alphatest_fragment>\n\t#include <normal_fragment_begin>\n\t#include <normal_fragment_maps>\n\tvec3 viewDir = normalize( vViewPosition );\n\tvec3 x = normalize( vec3( viewDir.z, 0.0, - viewDir.x ) );\n\tvec3 y = cross( viewDir, x );\n\tvec2 uv = vec2( dot( x, normal ), dot( y, normal ) ) * 0.495 + 0.5;\n\t#ifdef USE_MATCAP\n\t\tvec4 matcapColor = texture2D( matcap, uv );\n\t#else\n\t\tvec4 matcapColor = vec4( vec3( mix( 0.2, 0.8, uv.y ) ), 1.0 );\n\t#endif\n\tvec3 outgoingLight = diffuseColor.rgb * matcapColor.rgb;\n\t#include <output_fragment>\n\t#include <tonemapping_fragment>\n\t#include <encodings_fragment>\n\t#include <fog_fragment>\n\t#include <premultiplied_alpha_fragment>\n\t#include <dithering_fragment>\n}",
    meshnormal_vert: "#define NORMAL\n#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )\n\tvarying vec3 vViewPosition;\n#endif\n#include <common>\n#include <uv_pars_vertex>\n#include <displacementmap_pars_vertex>\n#include <normal_pars_vertex>\n#include <morphtarget_pars_vertex>\n#include <skinning_pars_vertex>\n#include <logdepthbuf_pars_vertex>\n#include <clipping_planes_pars_vertex>\nvoid main() {\n\t#include <uv_vertex>\n\t#include <beginnormal_vertex>\n\t#include <morphnormal_vertex>\n\t#include <skinbase_vertex>\n\t#include <skinnormal_vertex>\n\t#include <defaultnormal_vertex>\n\t#include <normal_vertex>\n\t#include <begin_vertex>\n\t#include <morphtarget_vertex>\n\t#include <skinning_vertex>\n\t#include <displacementmap_vertex>\n\t#include <project_vertex>\n\t#include <logdepthbuf_vertex>\n\t#include <clipping_planes_vertex>\n#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )\n\tvViewPosition = - mvPosition.xyz;\n#endif\n}",
    meshnormal_frag: "#define NORMAL\nuniform float opacity;\n#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )\n\tvarying vec3 vViewPosition;\n#endif\n#include <packing>\n#include <uv_pars_fragment>\n#include <normal_pars_fragment>\n#include <bumpmap_pars_fragment>\n#include <normalmap_pars_fragment>\n#include <logdepthbuf_pars_fragment>\n#include <clipping_planes_pars_fragment>\nvoid main() {\n\t#include <clipping_planes_fragment>\n\t#include <logdepthbuf_fragment>\n\t#include <normal_fragment_begin>\n\t#include <normal_fragment_maps>\n\tgl_FragColor = vec4( packNormalToRGB( normal ), opacity );\n\t#ifdef OPAQUE\n\t\tgl_FragColor.a = 1.0;\n\t#endif\n}",
    meshphong_vert: "#define PHONG\nvarying vec3 vViewPosition;\n#include <common>\n#include <uv_pars_vertex>\n#include <displacementmap_pars_vertex>\n#include <envmap_pars_vertex>\n#include <color_pars_vertex>\n#include <fog_pars_vertex>\n#include <normal_pars_vertex>\n#include <morphtarget_pars_vertex>\n#include <skinning_pars_vertex>\n#include <shadowmap_pars_vertex>\n#include <logdepthbuf_pars_vertex>\n#include <clipping_planes_pars_vertex>\nvoid main() {\n\t#include <uv_vertex>\n\t#include <color_vertex>\n\t#include <morphcolor_vertex>\n\t#include <beginnormal_vertex>\n\t#include <morphnormal_vertex>\n\t#include <skinbase_vertex>\n\t#include <skinnormal_vertex>\n\t#include <defaultnormal_vertex>\n\t#include <normal_vertex>\n\t#include <begin_vertex>\n\t#include <morphtarget_vertex>\n\t#include <skinning_vertex>\n\t#include <displacementmap_vertex>\n\t#include <project_vertex>\n\t#include <logdepthbuf_vertex>\n\t#include <clipping_planes_vertex>\n\tvViewPosition = - mvPosition.xyz;\n\t#include <worldpos_vertex>\n\t#include <envmap_vertex>\n\t#include <shadowmap_vertex>\n\t#include <fog_vertex>\n}",
    meshphong_frag: "#define PHONG\nuniform vec3 diffuse;\nuniform vec3 emissive;\nuniform vec3 specular;\nuniform float shininess;\nuniform float opacity;\n#include <common>\n#include <packing>\n#include <dithering_pars_fragment>\n#include <color_pars_fragment>\n#include <uv_pars_fragment>\n#include <map_pars_fragment>\n#include <alphamap_pars_fragment>\n#include <alphatest_pars_fragment>\n#include <aomap_pars_fragment>\n#include <lightmap_pars_fragment>\n#include <emissivemap_pars_fragment>\n#include <envmap_common_pars_fragment>\n#include <envmap_pars_fragment>\n#include <fog_pars_fragment>\n#include <bsdfs>\n#include <lights_pars_begin>\n#include <normal_pars_fragment>\n#include <lights_phong_pars_fragment>\n#include <shadowmap_pars_fragment>\n#include <bumpmap_pars_fragment>\n#include <normalmap_pars_fragment>\n#include <specularmap_pars_fragment>\n#include <logdepthbuf_pars_fragment>\n#include <clipping_planes_pars_fragment>\nvoid main() {\n\t#include <clipping_planes_fragment>\n\tvec4 diffuseColor = vec4( diffuse, opacity );\n\tReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );\n\tvec3 totalEmissiveRadiance = emissive;\n\t#include <logdepthbuf_fragment>\n\t#include <map_fragment>\n\t#include <color_fragment>\n\t#include <alphamap_fragment>\n\t#include <alphatest_fragment>\n\t#include <specularmap_fragment>\n\t#include <normal_fragment_begin>\n\t#include <normal_fragment_maps>\n\t#include <emissivemap_fragment>\n\t#include <lights_phong_fragment>\n\t#include <lights_fragment_begin>\n\t#include <lights_fragment_maps>\n\t#include <lights_fragment_end>\n\t#include <aomap_fragment>\n\tvec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + reflectedLight.directSpecular + reflectedLight.indirectSpecular + totalEmissiveRadiance;\n\t#include <envmap_fragment>\n\t#include <output_fragment>\n\t#include <tonemapping_fragment>\n\t#include <encodings_fragment>\n\t#include <fog_fragment>\n\t#include <premultiplied_alpha_fragment>\n\t#include <dithering_fragment>\n}",
    meshphysical_vert: "#define STANDARD\nvarying vec3 vViewPosition;\n#ifdef USE_TRANSMISSION\n\tvarying vec3 vWorldPosition;\n#endif\n#include <common>\n#include <uv_pars_vertex>\n#include <displacementmap_pars_vertex>\n#include <color_pars_vertex>\n#include <fog_pars_vertex>\n#include <normal_pars_vertex>\n#include <morphtarget_pars_vertex>\n#include <skinning_pars_vertex>\n#include <shadowmap_pars_vertex>\n#include <logdepthbuf_pars_vertex>\n#include <clipping_planes_pars_vertex>\nvoid main() {\n\t#include <uv_vertex>\n\t#include <color_vertex>\n\t#include <morphcolor_vertex>\n\t#include <beginnormal_vertex>\n\t#include <morphnormal_vertex>\n\t#include <skinbase_vertex>\n\t#include <skinnormal_vertex>\n\t#include <defaultnormal_vertex>\n\t#include <normal_vertex>\n\t#include <begin_vertex>\n\t#include <morphtarget_vertex>\n\t#include <skinning_vertex>\n\t#include <displacementmap_vertex>\n\t#include <project_vertex>\n\t#include <logdepthbuf_vertex>\n\t#include <clipping_planes_vertex>\n\tvViewPosition = - mvPosition.xyz;\n\t#include <worldpos_vertex>\n\t#include <shadowmap_vertex>\n\t#include <fog_vertex>\n#ifdef USE_TRANSMISSION\n\tvWorldPosition = worldPosition.xyz;\n#endif\n}",
    meshphysical_frag: "#define STANDARD\n#ifdef PHYSICAL\n\t#define IOR\n\t#define USE_SPECULAR\n#endif\nuniform vec3 diffuse;\nuniform vec3 emissive;\nuniform float roughness;\nuniform float metalness;\nuniform float opacity;\n#ifdef IOR\n\tuniform float ior;\n#endif\n#ifdef USE_SPECULAR\n\tuniform float specularIntensity;\n\tuniform vec3 specularColor;\n\t#ifdef USE_SPECULAR_COLORMAP\n\t\tuniform sampler2D specularColorMap;\n\t#endif\n\t#ifdef USE_SPECULAR_INTENSITYMAP\n\t\tuniform sampler2D specularIntensityMap;\n\t#endif\n#endif\n#ifdef USE_CLEARCOAT\n\tuniform float clearcoat;\n\tuniform float clearcoatRoughness;\n#endif\n#ifdef USE_IRIDESCENCE\n\tuniform float iridescence;\n\tuniform float iridescenceIOR;\n\tuniform float iridescenceThicknessMinimum;\n\tuniform float iridescenceThicknessMaximum;\n#endif\n#ifdef USE_SHEEN\n\tuniform vec3 sheenColor;\n\tuniform float sheenRoughness;\n\t#ifdef USE_SHEEN_COLORMAP\n\t\tuniform sampler2D sheenColorMap;\n\t#endif\n\t#ifdef USE_SHEEN_ROUGHNESSMAP\n\t\tuniform sampler2D sheenRoughnessMap;\n\t#endif\n#endif\nvarying vec3 vViewPosition;\n#include <common>\n#include <packing>\n#include <dithering_pars_fragment>\n#include <color_pars_fragment>\n#include <uv_pars_fragment>\n#include <map_pars_fragment>\n#include <alphamap_pars_fragment>\n#include <alphatest_pars_fragment>\n#include <aomap_pars_fragment>\n#include <lightmap_pars_fragment>\n#include <emissivemap_pars_fragment>\n#include <iridescence_fragment>\n#include <cube_uv_reflection_fragment>\n#include <envmap_common_pars_fragment>\n#include <envmap_physical_pars_fragment>\n#include <fog_pars_fragment>\n#include <lights_pars_begin>\n#include <normal_pars_fragment>\n#include <lights_physical_pars_fragment>\n#include <transmission_pars_fragment>\n#include <shadowmap_pars_fragment>\n#include <bumpmap_pars_fragment>\n#include <normalmap_pars_fragment>\n#include <clearcoat_pars_fragment>\n#include <iridescence_pars_fragment>\n#include <roughnessmap_pars_fragment>\n#include <metalnessmap_pars_fragment>\n#include <logdepthbuf_pars_fragment>\n#include <clipping_planes_pars_fragment>\nvoid main() {\n\t#include <clipping_planes_fragment>\n\tvec4 diffuseColor = vec4( diffuse, opacity );\n\tReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );\n\tvec3 totalEmissiveRadiance = emissive;\n\t#include <logdepthbuf_fragment>\n\t#include <map_fragment>\n\t#include <color_fragment>\n\t#include <alphamap_fragment>\n\t#include <alphatest_fragment>\n\t#include <roughnessmap_fragment>\n\t#include <metalnessmap_fragment>\n\t#include <normal_fragment_begin>\n\t#include <normal_fragment_maps>\n\t#include <clearcoat_normal_fragment_begin>\n\t#include <clearcoat_normal_fragment_maps>\n\t#include <emissivemap_fragment>\n\t#include <lights_physical_fragment>\n\t#include <lights_fragment_begin>\n\t#include <lights_fragment_maps>\n\t#include <lights_fragment_end>\n\t#include <aomap_fragment>\n\tvec3 totalDiffuse = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse;\n\tvec3 totalSpecular = reflectedLight.directSpecular + reflectedLight.indirectSpecular;\n\t#include <transmission_fragment>\n\tvec3 outgoingLight = totalDiffuse + totalSpecular + totalEmissiveRadiance;\n\t#ifdef USE_SHEEN\n\t\tfloat sheenEnergyComp = 1.0 - 0.157 * max3( material.sheenColor );\n\t\toutgoingLight = outgoingLight * sheenEnergyComp + sheenSpecular;\n\t#endif\n\t#ifdef USE_CLEARCOAT\n\t\tfloat dotNVcc = saturate( dot( geometry.clearcoatNormal, geometry.viewDir ) );\n\t\tvec3 Fcc = F_Schlick( material.clearcoatF0, material.clearcoatF90, dotNVcc );\n\t\toutgoingLight = outgoingLight * ( 1.0 - material.clearcoat * Fcc ) + clearcoatSpecular * material.clearcoat;\n\t#endif\n\t#include <output_fragment>\n\t#include <tonemapping_fragment>\n\t#include <encodings_fragment>\n\t#include <fog_fragment>\n\t#include <premultiplied_alpha_fragment>\n\t#include <dithering_fragment>\n}",
    meshtoon_vert: "#define TOON\nvarying vec3 vViewPosition;\n#include <common>\n#include <uv_pars_vertex>\n#include <displacementmap_pars_vertex>\n#include <color_pars_vertex>\n#include <fog_pars_vertex>\n#include <normal_pars_vertex>\n#include <morphtarget_pars_vertex>\n#include <skinning_pars_vertex>\n#include <shadowmap_pars_vertex>\n#include <logdepthbuf_pars_vertex>\n#include <clipping_planes_pars_vertex>\nvoid main() {\n\t#include <uv_vertex>\n\t#include <color_vertex>\n\t#include <morphcolor_vertex>\n\t#include <beginnormal_vertex>\n\t#include <morphnormal_vertex>\n\t#include <skinbase_vertex>\n\t#include <skinnormal_vertex>\n\t#include <defaultnormal_vertex>\n\t#include <normal_vertex>\n\t#include <begin_vertex>\n\t#include <morphtarget_vertex>\n\t#include <skinning_vertex>\n\t#include <displacementmap_vertex>\n\t#include <project_vertex>\n\t#include <logdepthbuf_vertex>\n\t#include <clipping_planes_vertex>\n\tvViewPosition = - mvPosition.xyz;\n\t#include <worldpos_vertex>\n\t#include <shadowmap_vertex>\n\t#include <fog_vertex>\n}",
    meshtoon_frag: "#define TOON\nuniform vec3 diffuse;\nuniform vec3 emissive;\nuniform float opacity;\n#include <common>\n#include <packing>\n#include <dithering_pars_fragment>\n#include <color_pars_fragment>\n#include <uv_pars_fragment>\n#include <map_pars_fragment>\n#include <alphamap_pars_fragment>\n#include <alphatest_pars_fragment>\n#include <aomap_pars_fragment>\n#include <lightmap_pars_fragment>\n#include <emissivemap_pars_fragment>\n#include <gradientmap_pars_fragment>\n#include <fog_pars_fragment>\n#include <bsdfs>\n#include <lights_pars_begin>\n#include <normal_pars_fragment>\n#include <lights_toon_pars_fragment>\n#include <shadowmap_pars_fragment>\n#include <bumpmap_pars_fragment>\n#include <normalmap_pars_fragment>\n#include <logdepthbuf_pars_fragment>\n#include <clipping_planes_pars_fragment>\nvoid main() {\n\t#include <clipping_planes_fragment>\n\tvec4 diffuseColor = vec4( diffuse, opacity );\n\tReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );\n\tvec3 totalEmissiveRadiance = emissive;\n\t#include <logdepthbuf_fragment>\n\t#include <map_fragment>\n\t#include <color_fragment>\n\t#include <alphamap_fragment>\n\t#include <alphatest_fragment>\n\t#include <normal_fragment_begin>\n\t#include <normal_fragment_maps>\n\t#include <emissivemap_fragment>\n\t#include <lights_toon_fragment>\n\t#include <lights_fragment_begin>\n\t#include <lights_fragment_maps>\n\t#include <lights_fragment_end>\n\t#include <aomap_fragment>\n\tvec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + totalEmissiveRadiance;\n\t#include <output_fragment>\n\t#include <tonemapping_fragment>\n\t#include <encodings_fragment>\n\t#include <fog_fragment>\n\t#include <premultiplied_alpha_fragment>\n\t#include <dithering_fragment>\n}",
    points_vert: "uniform float size;\nuniform float scale;\n#include <common>\n#include <color_pars_vertex>\n#include <fog_pars_vertex>\n#include <morphtarget_pars_vertex>\n#include <logdepthbuf_pars_vertex>\n#include <clipping_planes_pars_vertex>\n#ifdef USE_POINTS_UV\n\tvarying vec2 vUv;\n\tuniform mat3 uvTransform;\n#endif\nvoid main() {\n\t#ifdef USE_POINTS_UV\n\t\tvUv = ( uvTransform * vec3( uv, 1 ) ).xy;\n\t#endif\n\t#include <color_vertex>\n\t#include <morphcolor_vertex>\n\t#include <begin_vertex>\n\t#include <morphtarget_vertex>\n\t#include <project_vertex>\n\tgl_PointSize = size;\n\t#ifdef USE_SIZEATTENUATION\n\t\tbool isPerspective = isPerspectiveMatrix( projectionMatrix );\n\t\tif ( isPerspective ) gl_PointSize *= ( scale / - mvPosition.z );\n\t#endif\n\t#include <logdepthbuf_vertex>\n\t#include <clipping_planes_vertex>\n\t#include <worldpos_vertex>\n\t#include <fog_vertex>\n}",
    points_frag: "uniform vec3 diffuse;\nuniform float opacity;\n#include <common>\n#include <color_pars_fragment>\n#include <map_particle_pars_fragment>\n#include <alphatest_pars_fragment>\n#include <fog_pars_fragment>\n#include <logdepthbuf_pars_fragment>\n#include <clipping_planes_pars_fragment>\nvoid main() {\n\t#include <clipping_planes_fragment>\n\tvec3 outgoingLight = vec3( 0.0 );\n\tvec4 diffuseColor = vec4( diffuse, opacity );\n\t#include <logdepthbuf_fragment>\n\t#include <map_particle_fragment>\n\t#include <color_fragment>\n\t#include <alphatest_fragment>\n\toutgoingLight = diffuseColor.rgb;\n\t#include <output_fragment>\n\t#include <tonemapping_fragment>\n\t#include <encodings_fragment>\n\t#include <fog_fragment>\n\t#include <premultiplied_alpha_fragment>\n}",
    shadow_vert: "#include <common>\n#include <fog_pars_vertex>\n#include <morphtarget_pars_vertex>\n#include <skinning_pars_vertex>\n#include <logdepthbuf_pars_vertex>\n#include <shadowmap_pars_vertex>\nvoid main() {\n\t#include <beginnormal_vertex>\n\t#include <morphnormal_vertex>\n\t#include <skinbase_vertex>\n\t#include <skinnormal_vertex>\n\t#include <defaultnormal_vertex>\n\t#include <begin_vertex>\n\t#include <morphtarget_vertex>\n\t#include <skinning_vertex>\n\t#include <project_vertex>\n\t#include <logdepthbuf_vertex>\n\t#include <worldpos_vertex>\n\t#include <shadowmap_vertex>\n\t#include <fog_vertex>\n}",
    shadow_frag: "uniform vec3 color;\nuniform float opacity;\n#include <common>\n#include <packing>\n#include <fog_pars_fragment>\n#include <bsdfs>\n#include <lights_pars_begin>\n#include <logdepthbuf_pars_fragment>\n#include <shadowmap_pars_fragment>\n#include <shadowmask_pars_fragment>\nvoid main() {\n\t#include <logdepthbuf_fragment>\n\tgl_FragColor = vec4( color, opacity * ( 1.0 - getShadowMask() ) );\n\t#include <tonemapping_fragment>\n\t#include <encodings_fragment>\n\t#include <fog_fragment>\n}",
    sprite_vert: "uniform float rotation;\nuniform vec2 center;\n#include <common>\n#include <uv_pars_vertex>\n#include <fog_pars_vertex>\n#include <logdepthbuf_pars_vertex>\n#include <clipping_planes_pars_vertex>\nvoid main() {\n\t#include <uv_vertex>\n\tvec4 mvPosition = modelViewMatrix * vec4( 0.0, 0.0, 0.0, 1.0 );\n\tvec2 scale;\n\tscale.x = length( vec3( modelMatrix[ 0 ].x, modelMatrix[ 0 ].y, modelMatrix[ 0 ].z ) );\n\tscale.y = length( vec3( modelMatrix[ 1 ].x, modelMatrix[ 1 ].y, modelMatrix[ 1 ].z ) );\n\t#ifndef USE_SIZEATTENUATION\n\t\tbool isPerspective = isPerspectiveMatrix( projectionMatrix );\n\t\tif ( isPerspective ) scale *= - mvPosition.z;\n\t#endif\n\tvec2 alignedPosition = ( position.xy - ( center - vec2( 0.5 ) ) ) * scale;\n\tvec2 rotatedPosition;\n\trotatedPosition.x = cos( rotation ) * alignedPosition.x - sin( rotation ) * alignedPosition.y;\n\trotatedPosition.y = sin( rotation ) * alignedPosition.x + cos( rotation ) * alignedPosition.y;\n\tmvPosition.xy += rotatedPosition;\n\tgl_Position = projectionMatrix * mvPosition;\n\t#include <logdepthbuf_vertex>\n\t#include <clipping_planes_vertex>\n\t#include <fog_vertex>\n}",
    sprite_frag: "uniform vec3 diffuse;\nuniform float opacity;\n#include <common>\n#include <uv_pars_fragment>\n#include <map_pars_fragment>\n#include <alphamap_pars_fragment>\n#include <alphatest_pars_fragment>\n#include <fog_pars_fragment>\n#include <logdepthbuf_pars_fragment>\n#include <clipping_planes_pars_fragment>\nvoid main() {\n\t#include <clipping_planes_fragment>\n\tvec3 outgoingLight = vec3( 0.0 );\n\tvec4 diffuseColor = vec4( diffuse, opacity );\n\t#include <logdepthbuf_fragment>\n\t#include <map_fragment>\n\t#include <alphamap_fragment>\n\t#include <alphatest_fragment>\n\toutgoingLight = diffuseColor.rgb;\n\t#include <output_fragment>\n\t#include <tonemapping_fragment>\n\t#include <encodings_fragment>\n\t#include <fog_fragment>\n}"
}, Mi = {
    common: {
        diffuse: {
            value: new ye(16777215)
        },
        opacity: {
            value: 1
        },
        map: {
            value: null
        },
        mapTransform: {
            value: new R
        },
        alphaMap: {
            value: null
        },
        alphaMapTransform: {
            value: new R
        },
        alphaTest: {
            value: 0
        }
    },
    specularmap: {
        specularMap: {
            value: null
        },
        specularMapTransform: {
            value: new R
        }
    },
    envmap: {
        envMap: {
            value: null
        },
        flipEnvMap: {
            value: -1
        },
        reflectivity: {
            value: 1
        },
        ior: {
            value: 1.5
        },
        refractionRatio: {
            value: .98
        }
    },
    aomap: {
        aoMap: {
            value: null
        },
        aoMapIntensity: {
            value: 1
        },
        aoMapTransform: {
            value: new R
        }
    },
    lightmap: {
        lightMap: {
            value: null
        },
        lightMapIntensity: {
            value: 1
        },
        lightMapTransform: {
            value: new R
        }
    },
    bumpmap: {
        bumpMap: {
            value: null
        },
        bumpMapTransform: {
            value: new R
        },
        bumpScale: {
            value: 1
        }
    },
    normalmap: {
        normalMap: {
            value: null
        },
        normalMapTransform: {
            value: new R
        },
        normalScale: {
            value: new P(1, 1)
        }
    },
    displacementmap: {
        displacementMap: {
            value: null
        },
        displacementMapTransform: {
            value: new R
        },
        displacementScale: {
            value: 1
        },
        displacementBias: {
            value: 0
        }
    },
    emissivemap: {
        emissiveMap: {
            value: null
        },
        emissiveMapTransform: {
            value: new R
        }
    },
    metalnessmap: {
        metalnessMap: {
            value: null
        },
        metalnessMapTransform: {
            value: new R
        }
    },
    roughnessmap: {
        roughnessMap: {
            value: null
        },
        roughnessMapTransform: {
            value: new R
        }
    },
    gradientmap: {
        gradientMap: {
            value: null
        }
    },
    fog: {
        fogDensity: {
            value: 25e-5
        },
        fogNear: {
            value: 1
        },
        fogFar: {
            value: 2e3
        },
        fogColor: {
            value: new ye(16777215)
        }
    },
    lights: {
        ambientLightColor: {
            value: []
        },
        lightProbe: {
            value: []
        },
        directionalLights: {
            value: [],
            properties: {
                direction: {},
                color: {}
            }
        },
        directionalLightShadows: {
            value: [],
            properties: {
                shadowBias: {},
                shadowNormalBias: {},
                shadowRadius: {},
                shadowMapSize: {}
            }
        },
        directionalShadowMap: {
            value: []
        },
        directionalShadowMatrix: {
            value: []
        },
        spotLights: {
            value: [],
            properties: {
                color: {},
                position: {},
                direction: {},
                distance: {},
                coneCos: {},
                penumbraCos: {},
                decay: {}
            }
        },
        spotLightShadows: {
            value: [],
            properties: {
                shadowBias: {},
                shadowNormalBias: {},
                shadowRadius: {},
                shadowMapSize: {}
            }
        },
        spotLightMap: {
            value: []
        },
        spotShadowMap: {
            value: []
        },
        spotLightMatrix: {
            value: []
        },
        pointLights: {
            value: [],
            properties: {
                color: {},
                position: {},
                decay: {},
                distance: {}
            }
        },
        pointLightShadows: {
            value: [],
            properties: {
                shadowBias: {},
                shadowNormalBias: {},
                shadowRadius: {},
                shadowMapSize: {},
                shadowCameraNear: {},
                shadowCameraFar: {}
            }
        },
        pointShadowMap: {
            value: []
        },
        pointShadowMatrix: {
            value: []
        },
        hemisphereLights: {
            value: [],
            properties: {
                direction: {},
                skyColor: {},
                groundColor: {}
            }
        },
        rectAreaLights: {
            value: [],
            properties: {
                color: {},
                position: {},
                width: {},
                height: {}
            }
        },
        ltc_1: {
            value: null
        },
        ltc_2: {
            value: null
        }
    },
    points: {
        diffuse: {
            value: new ye(16777215)
        },
        opacity: {
            value: 1
        },
        size: {
            value: 1
        },
        scale: {
            value: 1
        },
        map: {
            value: null
        },
        alphaMap: {
            value: null
        },
        alphaTest: {
            value: 0
        },
        uvTransform: {
            value: new R
        }
    },
    sprite: {
        diffuse: {
            value: new ye(16777215)
        },
        opacity: {
            value: 1
        },
        center: {
            value: new P(.5, .5)
        },
        rotation: {
            value: 0
        },
        map: {
            value: null
        },
        mapTransform: {
            value: new R
        },
        alphaMap: {
            value: null
        },
        alphaTest: {
            value: 0
        }
    }
}, Ti = {
    basic: {
        uniforms: ri([ Mi.common, Mi.specularmap, Mi.envmap, Mi.aomap, Mi.lightmap, Mi.fog ]),
        vertexShader: wi.meshbasic_vert,
        fragmentShader: wi.meshbasic_frag
    },
    lambert: {
        uniforms: ri([ Mi.common, Mi.specularmap, Mi.envmap, Mi.aomap, Mi.lightmap, Mi.emissivemap, Mi.bumpmap, Mi.normalmap, Mi.displacementmap, Mi.fog, Mi.lights, {
            emissive: {
                value: new ye(0)
            }
        } ]),
        vertexShader: wi.meshlambert_vert,
        fragmentShader: wi.meshlambert_frag
    },
    phong: {
        uniforms: ri([ Mi.common, Mi.specularmap, Mi.envmap, Mi.aomap, Mi.lightmap, Mi.emissivemap, Mi.bumpmap, Mi.normalmap, Mi.displacementmap, Mi.fog, Mi.lights, {
            emissive: {
                value: new ye(0)
            },
            specular: {
                value: new ye(1118481)
            },
            shininess: {
                value: 30
            }
        } ]),
        vertexShader: wi.meshphong_vert,
        fragmentShader: wi.meshphong_frag
    },
    standard: {
        uniforms: ri([ Mi.common, Mi.envmap, Mi.aomap, Mi.lightmap, Mi.emissivemap, Mi.bumpmap, Mi.normalmap, Mi.displacementmap, Mi.roughnessmap, Mi.metalnessmap, Mi.fog, Mi.lights, {
            emissive: {
                value: new ye(0)
            },
            roughness: {
                value: 1
            },
            metalness: {
                value: 0
            },
            envMapIntensity: {
                value: 1
            }
        } ]),
        vertexShader: wi.meshphysical_vert,
        fragmentShader: wi.meshphysical_frag
    },
    toon: {
        uniforms: ri([ Mi.common, Mi.aomap, Mi.lightmap, Mi.emissivemap, Mi.bumpmap, Mi.normalmap, Mi.displacementmap, Mi.gradientmap, Mi.fog, Mi.lights, {
            emissive: {
                value: new ye(0)
            }
        } ]),
        vertexShader: wi.meshtoon_vert,
        fragmentShader: wi.meshtoon_frag
    },
    matcap: {
        uniforms: ri([ Mi.common, Mi.bumpmap, Mi.normalmap, Mi.displacementmap, Mi.fog, {
            matcap: {
                value: null
            }
        } ]),
        vertexShader: wi.meshmatcap_vert,
        fragmentShader: wi.meshmatcap_frag
    },
    points: {
        uniforms: ri([ Mi.points, Mi.fog ]),
        vertexShader: wi.points_vert,
        fragmentShader: wi.points_frag
    },
    dashed: {
        uniforms: ri([ Mi.common, Mi.fog, {
            scale: {
                value: 1
            },
            dashSize: {
                value: 1
            },
            totalSize: {
                value: 2
            }
        } ]),
        vertexShader: wi.linedashed_vert,
        fragmentShader: wi.linedashed_frag
    },
    depth: {
        uniforms: ri([ Mi.common, Mi.displacementmap ]),
        vertexShader: wi.depth_vert,
        fragmentShader: wi.depth_frag
    },
    normal: {
        uniforms: ri([ Mi.common, Mi.bumpmap, Mi.normalmap, Mi.displacementmap, {
            opacity: {
                value: 1
            }
        } ]),
        vertexShader: wi.meshnormal_vert,
        fragmentShader: wi.meshnormal_frag
    },
    sprite: {
        uniforms: ri([ Mi.sprite, Mi.fog ]),
        vertexShader: wi.sprite_vert,
        fragmentShader: wi.sprite_frag
    },
    background: {
        uniforms: {
            uvTransform: {
                value: new R
            },
            t2D: {
                value: null
            },
            backgroundIntensity: {
                value: 1
            }
        },
        vertexShader: wi.background_vert,
        fragmentShader: wi.background_frag
    },
    backgroundCube: {
        uniforms: {
            envMap: {
                value: null
            },
            flipEnvMap: {
                value: -1
            },
            backgroundBlurriness: {
                value: 0
            },
            backgroundIntensity: {
                value: 1
            }
        },
        vertexShader: wi.backgroundCube_vert,
        fragmentShader: wi.backgroundCube_frag
    },
    cube: {
        uniforms: {
            tCube: {
                value: null
            },
            tFlip: {
                value: -1
            },
            opacity: {
                value: 1
            }
        },
        vertexShader: wi.cube_vert,
        fragmentShader: wi.cube_frag
    },
    equirect: {
        uniforms: {
            tEquirect: {
                value: null
            }
        },
        vertexShader: wi.equirect_vert,
        fragmentShader: wi.equirect_frag
    },
    distanceRGBA: {
        uniforms: ri([ Mi.common, Mi.displacementmap, {
            referencePosition: {
                value: new tt
            },
            nearDistance: {
                value: 1
            },
            farDistance: {
                value: 1e3
            }
        } ]),
        vertexShader: wi.distanceRGBA_vert,
        fragmentShader: wi.distanceRGBA_frag
    },
    shadow: {
        uniforms: ri([ Mi.lights, Mi.fog, {
            color: {
                value: new ye(0)
            },
            opacity: {
                value: 1
            }
        } ]),
        vertexShader: wi.shadow_vert,
        fragmentShader: wi.shadow_frag
    }
};

Ti.physical = {
    uniforms: ri([ Ti.standard.uniforms, {
        clearcoat: {
            value: 0
        },
        clearcoatMap: {
            value: null
        },
        clearcoatMapTransform: {
            value: new R
        },
        clearcoatNormalMap: {
            value: null
        },
        clearcoatNormalMapTransform: {
            value: new R
        },
        clearcoatNormalScale: {
            value: new P(1, 1)
        },
        clearcoatRoughness: {
            value: 0
        },
        clearcoatRoughnessMap: {
            value: null
        },
        clearcoatRoughnessMapTransform: {
            value: new R
        },
        iridescence: {
            value: 0
        },
        iridescenceMap: {
            value: null
        },
        iridescenceMapTransform: {
            value: new R
        },
        iridescenceIOR: {
            value: 1.3
        },
        iridescenceThicknessMinimum: {
            value: 100
        },
        iridescenceThicknessMaximum: {
            value: 400
        },
        iridescenceThicknessMap: {
            value: null
        },
        iridescenceThicknessMapTransform: {
            value: new R
        },
        sheen: {
            value: 0
        },
        sheenColor: {
            value: new ye(0)
        },
        sheenColorMap: {
            value: null
        },
        sheenColorMapTransform: {
            value: new R
        },
        sheenRoughness: {
            value: 1
        },
        sheenRoughnessMap: {
            value: null
        },
        sheenRoughnessMapTransform: {
            value: new R
        },
        transmission: {
            value: 0
        },
        transmissionMap: {
            value: null
        },
        transmissionMapTransform: {
            value: new R
        },
        transmissionSamplerSize: {
            value: new P
        },
        transmissionSamplerMap: {
            value: null
        },
        thickness: {
            value: 0
        },
        thicknessMap: {
            value: null
        },
        thicknessMapTransform: {
            value: new R
        },
        attenuationDistance: {
            value: 0
        },
        attenuationColor: {
            value: new ye(0)
        },
        specularColor: {
            value: new ye(1, 1, 1)
        },
        specularColorMap: {
            value: null
        },
        specularColorMapTransform: {
            value: new R
        },
        specularIntensity: {
            value: 1
        },
        specularIntensityMap: {
            value: null
        },
        specularIntensityMapTransform: {
            value: new R
        }
    } ]),
    vertexShader: wi.meshphysical_vert,
    fragmentShader: wi.meshphysical_frag
};

const Ei = {
    r: 0,
    b: 0,
    g: 0
};

function Ai(t, e, i, n, r, s, a) {
    const o = new ye(0);
    let l, h, c = !0 === s ? 0 : 1, d = null, u = 0, p = null;
    function g(e, i) {
        e.getRGB(Ei, si(t)), n.buffers.color.setClear(Ei.r, Ei.g, Ei.b, i, a);
    }
    return {
        getClearColor: function() {
            return o;
        },
        setClearColor: function(t, e = 1) {
            o.set(t), c = e, g(o, c);
        },
        getClearAlpha: function() {
            return c;
        },
        setClearAlpha: function(t) {
            c = t, g(o, c);
        },
        render: function(s, f) {
            let m = !1, v = !0 === f.isScene ? f.background : null;
            if (v && v.isTexture) {
                v = (f.backgroundBlurriness > 0 ? i : e).get(v);
            }
            switch (null === v ? g(o, c) : v && v.isColor && (g(v, 1), m = !0), t.xr.getEnvironmentBlendMode()) {
              case "opaque":
                m = !0;
                break;

              case "additive":
                n.buffers.color.setClear(0, 0, 0, 1, a), m = !0;
                break;

              case "alpha-blend":
                n.buffers.color.setClear(0, 0, 0, 0, a), m = !0;
            }
            (t.autoClear || m) && t.clear(t.autoClearColor, t.autoClearDepth, t.autoClearStencil), 
            v && (v.isCubeTexture || 306 === v.mapping) ? (void 0 === h && (h = new ti(new ii(1, 1, 1), new oi({
                name: "BackgroundCubeMaterial",
                uniforms: ni(Ti.backgroundCube.uniforms),
                vertexShader: Ti.backgroundCube.vertexShader,
                fragmentShader: Ti.backgroundCube.fragmentShader,
                side: 1,
                depthTest: !1,
                depthWrite: !1,
                fog: !1
            })), h.geometry.deleteAttribute("normal"), h.geometry.deleteAttribute("uv"), h.onBeforeRender = function(t, e, i) {
                this.matrixWorld.copyPosition(i.matrixWorld);
            }, Object.defineProperty(h.material, "envMap", {
                get: function() {
                    return this.uniforms.envMap.value;
                }
            }), r.update(h)), h.material.uniforms.envMap.value = v, h.material.uniforms.flipEnvMap.value = v.isCubeTexture && !1 === v.isRenderTargetTexture ? -1 : 1, 
            h.material.uniforms.backgroundBlurriness.value = f.backgroundBlurriness, h.material.uniforms.backgroundIntensity.value = f.backgroundIntensity, 
            h.material.toneMapped = "srgb" !== v.colorSpace, d === v && u === v.version && p === t.toneMapping || (h.material.needsUpdate = !0, 
            d = v, u = v.version, p = t.toneMapping), h.layers.enableAll(), s.unshift(h, h.geometry, h.material, 0, 0, null)) : v && v.isTexture && (void 0 === l && (l = new ti(new Si(2, 2), new oi({
                name: "BackgroundMaterial",
                uniforms: ni(Ti.background.uniforms),
                vertexShader: Ti.background.vertexShader,
                fragmentShader: Ti.background.fragmentShader,
                side: 0,
                depthTest: !1,
                depthWrite: !1,
                fog: !1
            })), l.geometry.deleteAttribute("normal"), Object.defineProperty(l.material, "map", {
                get: function() {
                    return this.uniforms.t2D.value;
                }
            }), r.update(l)), l.material.uniforms.t2D.value = v, l.material.uniforms.backgroundIntensity.value = f.backgroundIntensity, 
            l.material.toneMapped = "srgb" !== v.colorSpace, !0 === v.matrixAutoUpdate && v.updateMatrix(), 
            l.material.uniforms.uvTransform.value.copy(v.matrix), d === v && u === v.version && p === t.toneMapping || (l.material.needsUpdate = !0, 
            d = v, u = v.version, p = t.toneMapping), l.layers.enableAll(), s.unshift(l, l.geometry, l.material, 0, 0, null));
        }
    };
}

function Ci(t, e, i, n) {
    const r = t.getParameter(t.MAX_VERTEX_ATTRIBS), s = n.isWebGL2 ? null : e.get("OES_vertex_array_object"), a = n.isWebGL2 || null !== s, o = {}, l = p(null);
    let h = l, c = !1;
    function d(e) {
        return n.isWebGL2 ? t.bindVertexArray(e) : s.bindVertexArrayOES(e);
    }
    function u(e) {
        return n.isWebGL2 ? t.deleteVertexArray(e) : s.deleteVertexArrayOES(e);
    }
    function p(t) {
        const e = [], i = [], n = [];
        for (let t = 0; t < r; t++) e[t] = 0, i[t] = 0, n[t] = 0;
        return {
            geometry: null,
            program: null,
            wireframe: !1,
            newAttributes: e,
            enabledAttributes: i,
            attributeDivisors: n,
            object: t,
            attributes: {},
            index: null
        };
    }
    function g() {
        const t = h.newAttributes;
        for (let e = 0, i = t.length; e < i; e++) t[e] = 0;
    }
    function f(t) {
        m(t, 0);
    }
    function m(i, r) {
        const s = h.newAttributes, a = h.enabledAttributes, o = h.attributeDivisors;
        if (s[i] = 1, 0 === a[i] && (t.enableVertexAttribArray(i), a[i] = 1), o[i] !== r) {
            (n.isWebGL2 ? t : e.get("ANGLE_instanced_arrays"))[n.isWebGL2 ? "vertexAttribDivisor" : "vertexAttribDivisorANGLE"](i, r), 
            o[i] = r;
        }
    }
    function v() {
        const e = h.newAttributes, i = h.enabledAttributes;
        for (let n = 0, r = i.length; n < r; n++) i[n] !== e[n] && (t.disableVertexAttribArray(n), 
        i[n] = 0);
    }
    function _(e, i, r, s, a, o) {
        !0 !== n.isWebGL2 || r !== t.INT && r !== t.UNSIGNED_INT ? t.vertexAttribPointer(e, i, r, s, a, o) : t.vertexAttribIPointer(e, i, r, a, o);
    }
    function x() {
        y(), c = !0, h !== l && (h = l, d(h.object));
    }
    function y() {
        l.geometry = null, l.program = null, l.wireframe = !1;
    }
    return {
        setup: function(r, l, u, x, y) {
            let b = !1;
            if (a) {
                const e = function(e, i, r) {
                    const a = !0 === r.wireframe;
                    let l = o[e.id];
                    void 0 === l && (l = {}, o[e.id] = l);
                    let h = l[i.id];
                    void 0 === h && (h = {}, l[i.id] = h);
                    let c = h[a];
                    void 0 === c && (c = p(n.isWebGL2 ? t.createVertexArray() : s.createVertexArrayOES()), 
                    h[a] = c);
                    return c;
                }(x, u, l);
                h !== e && (h = e, d(h.object)), b = function(t, e, i, n) {
                    const r = h.attributes, s = e.attributes;
                    let a = 0;
                    const o = i.getAttributes();
                    for (const e in o) {
                        if (o[e].location >= 0) {
                            const i = r[e];
                            let n = s[e];
                            if (void 0 === n && ("instanceMatrix" === e && t.instanceMatrix && (n = t.instanceMatrix), 
                            "instanceColor" === e && t.instanceColor && (n = t.instanceColor)), void 0 === i) return !0;
                            if (i.attribute !== n) return !0;
                            if (n && i.data !== n.data) return !0;
                            a++;
                        }
                    }
                    return h.attributesNum !== a || h.index !== n;
                }(r, x, u, y), b && function(t, e, i, n) {
                    const r = {}, s = e.attributes;
                    let a = 0;
                    const o = i.getAttributes();
                    for (const e in o) {
                        if (o[e].location >= 0) {
                            let i = s[e];
                            void 0 === i && ("instanceMatrix" === e && t.instanceMatrix && (i = t.instanceMatrix), 
                            "instanceColor" === e && t.instanceColor && (i = t.instanceColor));
                            const n = {};
                            n.attribute = i, i && i.data && (n.data = i.data), r[e] = n, a++;
                        }
                    }
                    h.attributes = r, h.attributesNum = a, h.index = n;
                }(r, x, u, y);
            } else {
                const t = !0 === l.wireframe;
                h.geometry === x.id && h.program === u.id && h.wireframe === t || (h.geometry = x.id, 
                h.program = u.id, h.wireframe = t, b = !0);
            }
            null !== y && i.update(y, t.ELEMENT_ARRAY_BUFFER), (b || c) && (c = !1, function(r, s, a, o) {
                if (!1 === n.isWebGL2 && (r.isInstancedMesh || o.isInstancedBufferGeometry) && null === e.get("ANGLE_instanced_arrays")) return;
                g();
                const l = o.attributes, h = a.getAttributes(), c = s.defaultAttributeValues;
                for (const e in h) {
                    const n = h[e];
                    if (n.location >= 0) {
                        let s = l[e];
                        if (void 0 === s && ("instanceMatrix" === e && r.instanceMatrix && (s = r.instanceMatrix), 
                        "instanceColor" === e && r.instanceColor && (s = r.instanceColor)), void 0 !== s) {
                            const e = s.normalized, a = s.itemSize, l = i.get(s);
                            if (void 0 === l) continue;
                            const h = l.buffer, c = l.type, d = l.bytesPerElement;
                            if (s.isInterleavedBufferAttribute) {
                                const i = s.data, l = i.stride, u = s.offset;
                                if (i.isInstancedInterleavedBuffer) {
                                    for (let t = 0; t < n.locationSize; t++) m(n.location + t, i.meshPerAttribute);
                                    !0 !== r.isInstancedMesh && void 0 === o._maxInstanceCount && (o._maxInstanceCount = i.meshPerAttribute * i.count);
                                } else for (let t = 0; t < n.locationSize; t++) f(n.location + t);
                                t.bindBuffer(t.ARRAY_BUFFER, h);
                                for (let t = 0; t < n.locationSize; t++) _(n.location + t, a / n.locationSize, c, e, l * d, (u + a / n.locationSize * t) * d);
                            } else {
                                if (s.isInstancedBufferAttribute) {
                                    for (let t = 0; t < n.locationSize; t++) m(n.location + t, s.meshPerAttribute);
                                    !0 !== r.isInstancedMesh && void 0 === o._maxInstanceCount && (o._maxInstanceCount = s.meshPerAttribute * s.count);
                                } else for (let t = 0; t < n.locationSize; t++) f(n.location + t);
                                t.bindBuffer(t.ARRAY_BUFFER, h);
                                for (let t = 0; t < n.locationSize; t++) _(n.location + t, a / n.locationSize, c, e, a * d, a / n.locationSize * t * d);
                            }
                        } else if (void 0 !== c) {
                            const i = c[e];
                            if (void 0 !== i) switch (i.length) {
                              case 2:
                                t.vertexAttrib2fv(n.location, i);
                                break;

                              case 3:
                                t.vertexAttrib3fv(n.location, i);
                                break;

                              case 4:
                                t.vertexAttrib4fv(n.location, i);
                                break;

                              default:
                                t.vertexAttrib1fv(n.location, i);
                            }
                        }
                    }
                }
                v();
            }(r, l, u, x), null !== y && t.bindBuffer(t.ELEMENT_ARRAY_BUFFER, i.get(y).buffer));
        },
        reset: x,
        resetDefaultState: y,
        dispose: function() {
            x();
            for (const t in o) {
                const e = o[t];
                for (const t in e) {
                    const i = e[t];
                    for (const t in i) u(i[t].object), delete i[t];
                    delete e[t];
                }
                delete o[t];
            }
        },
        releaseStatesOfGeometry: function(t) {
            if (void 0 === o[t.id]) return;
            const e = o[t.id];
            for (const t in e) {
                const i = e[t];
                for (const t in i) u(i[t].object), delete i[t];
                delete e[t];
            }
            delete o[t.id];
        },
        releaseStatesOfProgram: function(t) {
            for (const e in o) {
                const i = o[e];
                if (void 0 === i[t.id]) continue;
                const n = i[t.id];
                for (const t in n) u(n[t].object), delete n[t];
                delete i[t.id];
            }
        },
        initAttributes: g,
        enableAttribute: f,
        disableUnusedAttributes: v
    };
}

function Pi(t, e, i, n) {
    const r = n.isWebGL2;
    let s;
    this.setMode = function(t) {
        s = t;
    }, this.render = function(e, n) {
        t.drawArrays(s, e, n), i.update(n, s, 1);
    }, this.renderInstances = function(n, a, o) {
        if (0 === o) return;
        let l, h;
        if (r) l = t, h = "drawArraysInstanced"; else if (l = e.get("ANGLE_instanced_arrays"), 
        h = "drawArraysInstancedANGLE", null === l) return void console.error("THREE.WebGLBufferRenderer: using THREE.InstancedBufferGeometry but hardware does not support extension ANGLE_instanced_arrays.");
        l[h](s, n, a, o), i.update(a, s, o);
    };
}

function Ri(t, e, i) {
    let n;
    function r(e) {
        if ("highp" === e) {
            if (t.getShaderPrecisionFormat(t.VERTEX_SHADER, t.HIGH_FLOAT).precision > 0 && t.getShaderPrecisionFormat(t.FRAGMENT_SHADER, t.HIGH_FLOAT).precision > 0) return "highp";
            e = "mediump";
        }
        return "mediump" === e && t.getShaderPrecisionFormat(t.VERTEX_SHADER, t.MEDIUM_FLOAT).precision > 0 && t.getShaderPrecisionFormat(t.FRAGMENT_SHADER, t.MEDIUM_FLOAT).precision > 0 ? "mediump" : "lowp";
    }
    const s = "undefined" != typeof WebGL2RenderingContext && "WebGL2RenderingContext" === t.constructor.name;
    let a = void 0 !== i.precision ? i.precision : "highp";
    const o = r(a);
    o !== a && (console.warn("THREE.WebGLRenderer:", a, "not supported, using", o, "instead."), 
    a = o);
    const l = s || e.has("WEBGL_draw_buffers"), h = !0 === i.logarithmicDepthBuffer, c = t.getParameter(t.MAX_TEXTURE_IMAGE_UNITS), d = t.getParameter(t.MAX_VERTEX_TEXTURE_IMAGE_UNITS), u = t.getParameter(t.MAX_TEXTURE_SIZE), p = t.getParameter(t.MAX_CUBE_MAP_TEXTURE_SIZE), g = t.getParameter(t.MAX_VERTEX_ATTRIBS), f = t.getParameter(t.MAX_VERTEX_UNIFORM_VECTORS), m = t.getParameter(t.MAX_VARYING_VECTORS), v = t.getParameter(t.MAX_FRAGMENT_UNIFORM_VECTORS), _ = d > 0, x = s || e.has("OES_texture_float");
    return {
        isWebGL2: s,
        drawBuffers: l,
        getMaxAnisotropy: function() {
            if (void 0 !== n) return n;
            if (!0 === e.has("EXT_texture_filter_anisotropic")) {
                const i = e.get("EXT_texture_filter_anisotropic");
                n = t.getParameter(i.MAX_TEXTURE_MAX_ANISOTROPY_EXT);
            } else n = 0;
            return n;
        },
        getMaxPrecision: r,
        precision: a,
        logarithmicDepthBuffer: h,
        maxTextures: c,
        maxVertexTextures: d,
        maxTextureSize: u,
        maxCubemapSize: p,
        maxAttributes: g,
        maxVertexUniforms: f,
        maxVaryings: m,
        maxFragmentUniforms: v,
        vertexTextures: _,
        floatFragmentTextures: x,
        floatVertexTextures: _ && x,
        maxSamples: s ? t.getParameter(t.MAX_SAMPLES) : 0
    };
}

function Li(t) {
    const e = this;
    let i = null, n = 0, r = !1, s = !1;
    const a = new mi, o = new R, l = {
        value: null,
        needsUpdate: !1
    };
    function h(t, i, n, r) {
        const s = null !== t ? t.length : 0;
        let h = null;
        if (0 !== s) {
            if (h = l.value, !0 !== r || null === h) {
                const e = n + 4 * s, r = i.matrixWorldInverse;
                o.getNormalMatrix(r), (null === h || h.length < e) && (h = new Float32Array(e));
                for (let e = 0, i = n; e !== s; ++e, i += 4) a.copy(t[e]).applyMatrix4(r, o), a.normal.toArray(h, i), 
                h[i + 3] = a.constant;
            }
            l.value = h, l.needsUpdate = !0;
        }
        return e.numPlanes = s, e.numIntersection = 0, h;
    }
    this.uniform = l, this.numPlanes = 0, this.numIntersection = 0, this.init = function(t, e) {
        const i = 0 !== t.length || e || 0 !== n || r;
        return r = e, n = t.length, i;
    }, this.beginShadows = function() {
        s = !0, h(null);
    }, this.endShadows = function() {
        s = !1;
    }, this.setGlobalState = function(t, e) {
        i = h(t, e, 0);
    }, this.setState = function(a, o, c) {
        const d = a.clippingPlanes, u = a.clipIntersection, p = a.clipShadows, g = t.get(a);
        if (!r || null === d || 0 === d.length || s && !p) s ? h(null) : function() {
            l.value !== i && (l.value = i, l.needsUpdate = n > 0);
            e.numPlanes = n, e.numIntersection = 0;
        }(); else {
            const t = s ? 0 : n, e = 4 * t;
            let r = g.clippingState || null;
            l.value = r, r = h(d, o, e, c);
            for (let t = 0; t !== e; ++t) r[t] = i[t];
            g.clippingState = r, this.numIntersection = u ? this.numPlanes : 0, this.numPlanes += t;
        }
    };
}

function Di(t) {
    let e = new WeakMap;
    function i(t, e) {
        return 303 === e ? t.mapping = 301 : 304 === e && (t.mapping = 302), t;
    }
    function n(t) {
        const i = t.target;
        i.removeEventListener("dispose", n);
        const r = e.get(i);
        void 0 !== r && (e.delete(i), r.dispose());
    }
    return {
        get: function(r) {
            if (r && r.isTexture && !1 === r.isRenderTargetTexture) {
                const s = r.mapping;
                if (303 === s || 304 === s) {
                    if (e.has(r)) {
                        return i(e.get(r).texture, r.mapping);
                    }
                    {
                        const s = r.image;
                        if (s && s.height > 0) {
                            const a = new ui(s.height / 2);
                            return a.fromEquirectangularTexture(t, r), e.set(r, a), r.addEventListener("dispose", n), 
                            i(a.texture, r.mapping);
                        }
                        return null;
                    }
                }
            }
            return r;
        },
        dispose: function() {
            e = new WeakMap;
        }
    };
}

class Ii extends li {
    constructor(t = -1, e = 1, i = 1, n = -1, r = .1, s = 2e3) {
        super(), this.isOrthographicCamera = !0, this.type = "OrthographicCamera", this.zoom = 1, 
        this.view = null, this.left = t, this.right = e, this.top = i, this.bottom = n, 
        this.near = r, this.far = s, this.updateProjectionMatrix();
    }
    copy(t, e) {
        return super.copy(t, e), this.left = t.left, this.right = t.right, this.top = t.top, 
        this.bottom = t.bottom, this.near = t.near, this.far = t.far, this.zoom = t.zoom, 
        this.view = null === t.view ? null : Object.assign({}, t.view), this;
    }
    setViewOffset(t, e, i, n, r, s) {
        null === this.view && (this.view = {
            enabled: !0,
            fullWidth: 1,
            fullHeight: 1,
            offsetX: 0,
            offsetY: 0,
            width: 1,
            height: 1
        }), this.view.enabled = !0, this.view.fullWidth = t, this.view.fullHeight = e, this.view.offsetX = i, 
        this.view.offsetY = n, this.view.width = r, this.view.height = s, this.updateProjectionMatrix();
    }
    clearViewOffset() {
        null !== this.view && (this.view.enabled = !1), this.updateProjectionMatrix();
    }
    updateProjectionMatrix() {
        const t = (this.right - this.left) / (2 * this.zoom), e = (this.top - this.bottom) / (2 * this.zoom), i = (this.right + this.left) / 2, n = (this.top + this.bottom) / 2;
        let r = i - t, s = i + t, a = n + e, o = n - e;
        if (null !== this.view && this.view.enabled) {
            const t = (this.right - this.left) / this.view.fullWidth / this.zoom, e = (this.top - this.bottom) / this.view.fullHeight / this.zoom;
            r += t * this.view.offsetX, s = r + t * this.view.width, a -= e * this.view.offsetY, 
            o = a - e * this.view.height;
        }
        this.projectionMatrix.makeOrthographic(r, s, a, o, this.near, this.far), this.projectionMatrixInverse.copy(this.projectionMatrix).invert();
    }
    toJSON(t) {
        const e = super.toJSON(t);
        return e.object.zoom = this.zoom, e.object.left = this.left, e.object.right = this.right, 
        e.object.top = this.top, e.object.bottom = this.bottom, e.object.near = this.near, 
        e.object.far = this.far, null !== this.view && (e.object.view = Object.assign({}, this.view)), 
        e;
    }
}

const Ui = [ .125, .215, .35, .446, .526, .582 ], Ni = new Ii, Bi = new ye;

let Oi = null;

const Fi = (1 + Math.sqrt(5)) / 2, ki = 1 / Fi, Hi = [ new tt(1, 1, 1), new tt(-1, 1, 1), new tt(1, 1, -1), new tt(-1, 1, -1), new tt(0, Fi, ki), new tt(0, Fi, -ki), new tt(ki, 0, Fi), new tt(-ki, 0, Fi), new tt(Fi, ki, 0), new tt(-Fi, ki, 0) ];

class zi {
    constructor(t) {
        this._renderer = t, this._pingPongRenderTarget = null, this._lodMax = 0, this._cubeSize = 0, 
        this._lodPlanes = [], this._sizeLods = [], this._sigmas = [], this._blurMaterial = null, 
        this._cubemapMaterial = null, this._equirectMaterial = null, this._compileMaterial(this._blurMaterial);
    }
    fromScene(t, e = 0, i = .1, n = 100) {
        Oi = this._renderer.getRenderTarget(), this._setSize(256);
        const r = this._allocateTargets();
        return r.depthBuffer = !0, this._sceneToCubeUV(t, i, n, r), e > 0 && this._blur(r, 0, 0, e), 
        this._applyPMREM(r), this._cleanup(r), r;
    }
    fromEquirectangular(t, e = null) {
        return this._fromTexture(t, e);
    }
    fromCubemap(t, e = null) {
        return this._fromTexture(t, e);
    }
    compileCubemapShader() {
        null === this._cubemapMaterial && (this._cubemapMaterial = ji(), this._compileMaterial(this._cubemapMaterial));
    }
    compileEquirectangularShader() {
        null === this._equirectMaterial && (this._equirectMaterial = Wi(), this._compileMaterial(this._equirectMaterial));
    }
    dispose() {
        this._dispose(), null !== this._cubemapMaterial && this._cubemapMaterial.dispose(), 
        null !== this._equirectMaterial && this._equirectMaterial.dispose();
    }
    _setSize(t) {
        this._lodMax = Math.floor(Math.log2(t)), this._cubeSize = Math.pow(2, this._lodMax);
    }
    _dispose() {
        null !== this._blurMaterial && this._blurMaterial.dispose(), null !== this._pingPongRenderTarget && this._pingPongRenderTarget.dispose();
        for (let t = 0; t < this._lodPlanes.length; t++) this._lodPlanes[t].dispose();
    }
    _cleanup(t) {
        this._renderer.setRenderTarget(Oi), t.scissorTest = !1, Vi(t, 0, 0, t.width, t.height);
    }
    _fromTexture(t, e) {
        301 === t.mapping || 302 === t.mapping ? this._setSize(0 === t.image.length ? 16 : t.image[0].width || t.image[0].image.width) : this._setSize(t.image.width / 4), 
        Oi = this._renderer.getRenderTarget();
        const i = e || this._allocateTargets();
        return this._textureToCubeUV(t, i), this._applyPMREM(i), this._cleanup(i), i;
    }
    _allocateTargets() {
        const t = 3 * Math.max(this._cubeSize, 112), e = 4 * this._cubeSize, i = {
            magFilter: 1006,
            minFilter: 1006,
            generateMipmaps: !1,
            type: 1016,
            format: 1023,
            colorSpace: "srgb-linear",
            depthBuffer: !1
        }, n = Gi(t, e, i);
        if (null === this._pingPongRenderTarget || this._pingPongRenderTarget.width !== t || this._pingPongRenderTarget.height !== e) {
            null !== this._pingPongRenderTarget && this._dispose(), this._pingPongRenderTarget = Gi(t, e, i);
            const {_lodMax: n} = this;
            ({sizeLods: this._sizeLods, lodPlanes: this._lodPlanes, sigmas: this._sigmas} = function(t) {
                const e = [], i = [], n = [];
                let r = t;
                const s = t - 4 + 1 + Ui.length;
                for (let a = 0; a < s; a++) {
                    const s = Math.pow(2, r);
                    i.push(s);
                    let o = 1 / s;
                    a > t - 4 ? o = Ui[a - t + 4 - 1] : 0 === a && (o = 0), n.push(o);
                    const l = 1 / (s - 2), h = -l, c = 1 + l, d = [ h, h, c, h, c, c, h, h, c, c, h, c ], u = 6, p = 6, g = 3, f = 2, m = 1, v = new Float32Array(g * p * u), _ = new Float32Array(f * p * u), x = new Float32Array(m * p * u);
                    for (let t = 0; t < u; t++) {
                        const e = t % 3 * 2 / 3 - 1, i = t > 2 ? 0 : -1, n = [ e, i, 0, e + 2 / 3, i, 0, e + 2 / 3, i + 1, 0, e, i, 0, e + 2 / 3, i + 1, 0, e, i + 1, 0 ];
                        v.set(n, g * p * t), _.set(d, f * p * t);
                        const r = [ t, t, t, t, t, t ];
                        x.set(r, m * p * t);
                    }
                    const y = new Be;
                    y.setAttribute("position", new Te(v, g)), y.setAttribute("uv", new Te(_, f)), y.setAttribute("faceIndex", new Te(x, m)), 
                    e.push(y), r > 4 && r--;
                }
                return {
                    lodPlanes: e,
                    sizeLods: i,
                    sigmas: n
                };
            }(n)), this._blurMaterial = function(t, e, i) {
                const n = new Float32Array(20), r = new tt(0, 1, 0);
                return new oi({
                    name: "SphericalGaussianBlur",
                    defines: {
                        n: 20,
                        CUBEUV_TEXEL_WIDTH: 1 / e,
                        CUBEUV_TEXEL_HEIGHT: 1 / i,
                        CUBEUV_MAX_MIP: `${t}.0`
                    },
                    uniforms: {
                        envMap: {
                            value: null
                        },
                        samples: {
                            value: 1
                        },
                        weights: {
                            value: n
                        },
                        latitudinal: {
                            value: !1
                        },
                        dTheta: {
                            value: 0
                        },
                        mipInt: {
                            value: 0
                        },
                        poleAxis: {
                            value: r
                        }
                    },
                    vertexShader: Xi(),
                    fragmentShader: "\n\n\t\t\tprecision mediump float;\n\t\t\tprecision mediump int;\n\n\t\t\tvarying vec3 vOutputDirection;\n\n\t\t\tuniform sampler2D envMap;\n\t\t\tuniform int samples;\n\t\t\tuniform float weights[ n ];\n\t\t\tuniform bool latitudinal;\n\t\t\tuniform float dTheta;\n\t\t\tuniform float mipInt;\n\t\t\tuniform vec3 poleAxis;\n\n\t\t\t#define ENVMAP_TYPE_CUBE_UV\n\t\t\t#include <cube_uv_reflection_fragment>\n\n\t\t\tvec3 getSample( float theta, vec3 axis ) {\n\n\t\t\t\tfloat cosTheta = cos( theta );\n\t\t\t\t// Rodrigues' axis-angle rotation\n\t\t\t\tvec3 sampleDirection = vOutputDirection * cosTheta\n\t\t\t\t\t+ cross( axis, vOutputDirection ) * sin( theta )\n\t\t\t\t\t+ axis * dot( axis, vOutputDirection ) * ( 1.0 - cosTheta );\n\n\t\t\t\treturn bilinearCubeUV( envMap, sampleDirection, mipInt );\n\n\t\t\t}\n\n\t\t\tvoid main() {\n\n\t\t\t\tvec3 axis = latitudinal ? poleAxis : cross( poleAxis, vOutputDirection );\n\n\t\t\t\tif ( all( equal( axis, vec3( 0.0 ) ) ) ) {\n\n\t\t\t\t\taxis = vec3( vOutputDirection.z, 0.0, - vOutputDirection.x );\n\n\t\t\t\t}\n\n\t\t\t\taxis = normalize( axis );\n\n\t\t\t\tgl_FragColor = vec4( 0.0, 0.0, 0.0, 1.0 );\n\t\t\t\tgl_FragColor.rgb += weights[ 0 ] * getSample( 0.0, axis );\n\n\t\t\t\tfor ( int i = 1; i < n; i++ ) {\n\n\t\t\t\t\tif ( i >= samples ) {\n\n\t\t\t\t\t\tbreak;\n\n\t\t\t\t\t}\n\n\t\t\t\t\tfloat theta = dTheta * float( i );\n\t\t\t\t\tgl_FragColor.rgb += weights[ i ] * getSample( -1.0 * theta, axis );\n\t\t\t\t\tgl_FragColor.rgb += weights[ i ] * getSample( theta, axis );\n\n\t\t\t\t}\n\n\t\t\t}\n\t\t",
                    blending: 0,
                    depthTest: !1,
                    depthWrite: !1
                });
            }(n, t, e);
        }
        return n;
    }
    _compileMaterial(t) {
        const e = new ti(this._lodPlanes[0], t);
        this._renderer.compile(e, Ni);
    }
    _sceneToCubeUV(t, e, i, n) {
        const r = new hi(90, 1, e, i), s = [ 1, -1, 1, 1, 1, 1 ], a = [ 1, 1, 1, -1, -1, -1 ], o = this._renderer, l = o.autoClear, h = o.toneMapping;
        o.getClearColor(Bi), o.toneMapping = 0, o.autoClear = !1;
        const c = new Se({
            name: "PMREM.Background",
            side: 1,
            depthWrite: !1,
            depthTest: !1
        }), d = new ti(new ii, c);
        let u = !1;
        const p = t.background;
        p ? p.isColor && (c.color.copy(p), t.background = null, u = !0) : (c.color.copy(Bi), 
        u = !0);
        for (let e = 0; e < 6; e++) {
            const i = e % 3;
            0 === i ? (r.up.set(0, s[e], 0), r.lookAt(a[e], 0, 0)) : 1 === i ? (r.up.set(0, 0, s[e]), 
            r.lookAt(0, a[e], 0)) : (r.up.set(0, s[e], 0), r.lookAt(0, 0, a[e]));
            const l = this._cubeSize;
            Vi(n, i * l, e > 2 ? l : 0, l, l), o.setRenderTarget(n), u && o.render(d, r), o.render(t, r);
        }
        d.geometry.dispose(), d.material.dispose(), o.toneMapping = h, o.autoClear = l, 
        t.background = p;
    }
    _textureToCubeUV(t, e) {
        const i = this._renderer, n = 301 === t.mapping || 302 === t.mapping;
        n ? (null === this._cubemapMaterial && (this._cubemapMaterial = ji()), this._cubemapMaterial.uniforms.flipEnvMap.value = !1 === t.isRenderTargetTexture ? -1 : 1) : null === this._equirectMaterial && (this._equirectMaterial = Wi());
        const r = n ? this._cubemapMaterial : this._equirectMaterial, s = new ti(this._lodPlanes[0], r);
        r.uniforms.envMap.value = t;
        const a = this._cubeSize;
        Vi(e, 0, 0, 3 * a, 2 * a), i.setRenderTarget(e), i.render(s, Ni);
    }
    _applyPMREM(t) {
        const e = this._renderer, i = e.autoClear;
        e.autoClear = !1;
        for (let e = 1; e < this._lodPlanes.length; e++) {
            const i = Math.sqrt(this._sigmas[e] * this._sigmas[e] - this._sigmas[e - 1] * this._sigmas[e - 1]), n = Hi[(e - 1) % Hi.length];
            this._blur(t, e - 1, e, i, n);
        }
        e.autoClear = i;
    }
    _blur(t, e, i, n, r) {
        const s = this._pingPongRenderTarget;
        this._halfBlur(t, s, e, i, n, "latitudinal", r), this._halfBlur(s, t, i, i, n, "longitudinal", r);
    }
    _halfBlur(t, e, i, n, r, s, a) {
        const o = this._renderer, l = this._blurMaterial;
        "latitudinal" !== s && "longitudinal" !== s && console.error("blur direction must be either latitudinal or longitudinal!");
        const h = new ti(this._lodPlanes[n], l), c = l.uniforms, d = this._sizeLods[i] - 1, u = isFinite(r) ? Math.PI / (2 * d) : 2 * Math.PI / 39, p = r / u, g = isFinite(r) ? 1 + Math.floor(3 * p) : 20;
        g > 20 && console.warn(`sigmaRadians, ${r}, is too large and will clip, as it requested ${g} samples when the maximum is set to 20`);
        const f = [];
        let m = 0;
        for (let t = 0; t < 20; ++t) {
            const e = t / p, i = Math.exp(-e * e / 2);
            f.push(i), 0 === t ? m += i : t < g && (m += 2 * i);
        }
        for (let t = 0; t < f.length; t++) f[t] = f[t] / m;
        c.envMap.value = t.texture, c.samples.value = g, c.weights.value = f, c.latitudinal.value = "latitudinal" === s, 
        a && (c.poleAxis.value = a);
        const {_lodMax: v} = this;
        c.dTheta.value = u, c.mipInt.value = v - i;
        const _ = this._sizeLods[n];
        Vi(e, 3 * _ * (n > v - 4 ? n - v + 4 : 0), 4 * (this._cubeSize - _), 3 * _, 2 * _), 
        o.setRenderTarget(e), o.render(h, Ni);
    }
}

function Gi(t, e, i) {
    const n = new Z(t, e, i);
    return n.texture.mapping = 306, n.texture.name = "PMREM.cubeUv", n.scissorTest = !0, 
    n;
}

function Vi(t, e, i, n, r) {
    t.viewport.set(e, i, n, r), t.scissor.set(e, i, n, r);
}

function Wi() {
    return new oi({
        name: "EquirectangularToCubeUV",
        uniforms: {
            envMap: {
                value: null
            }
        },
        vertexShader: Xi(),
        fragmentShader: "\n\n\t\t\tprecision mediump float;\n\t\t\tprecision mediump int;\n\n\t\t\tvarying vec3 vOutputDirection;\n\n\t\t\tuniform sampler2D envMap;\n\n\t\t\t#include <common>\n\n\t\t\tvoid main() {\n\n\t\t\t\tvec3 outputDirection = normalize( vOutputDirection );\n\t\t\t\tvec2 uv = equirectUv( outputDirection );\n\n\t\t\t\tgl_FragColor = vec4( texture2D ( envMap, uv ).rgb, 1.0 );\n\n\t\t\t}\n\t\t",
        blending: 0,
        depthTest: !1,
        depthWrite: !1
    });
}

function ji() {
    return new oi({
        name: "CubemapToCubeUV",
        uniforms: {
            envMap: {
                value: null
            },
            flipEnvMap: {
                value: -1
            }
        },
        vertexShader: Xi(),
        fragmentShader: "\n\n\t\t\tprecision mediump float;\n\t\t\tprecision mediump int;\n\n\t\t\tuniform float flipEnvMap;\n\n\t\t\tvarying vec3 vOutputDirection;\n\n\t\t\tuniform samplerCube envMap;\n\n\t\t\tvoid main() {\n\n\t\t\t\tgl_FragColor = textureCube( envMap, vec3( flipEnvMap * vOutputDirection.x, vOutputDirection.yz ) );\n\n\t\t\t}\n\t\t",
        blending: 0,
        depthTest: !1,
        depthWrite: !1
    });
}

function Xi() {
    return "\n\n\t\tprecision mediump float;\n\t\tprecision mediump int;\n\n\t\tattribute float faceIndex;\n\n\t\tvarying vec3 vOutputDirection;\n\n\t\t// RH coordinate system; PMREM face-indexing convention\n\t\tvec3 getDirection( vec2 uv, float face ) {\n\n\t\t\tuv = 2.0 * uv - 1.0;\n\n\t\t\tvec3 direction = vec3( uv, 1.0 );\n\n\t\t\tif ( face == 0.0 ) {\n\n\t\t\t\tdirection = direction.zyx; // ( 1, v, u ) pos x\n\n\t\t\t} else if ( face == 1.0 ) {\n\n\t\t\t\tdirection = direction.xzy;\n\t\t\t\tdirection.xz *= -1.0; // ( -u, 1, -v ) pos y\n\n\t\t\t} else if ( face == 2.0 ) {\n\n\t\t\t\tdirection.x *= -1.0; // ( -u, v, 1 ) pos z\n\n\t\t\t} else if ( face == 3.0 ) {\n\n\t\t\t\tdirection = direction.zyx;\n\t\t\t\tdirection.xz *= -1.0; // ( -1, v, -u ) neg x\n\n\t\t\t} else if ( face == 4.0 ) {\n\n\t\t\t\tdirection = direction.xzy;\n\t\t\t\tdirection.xy *= -1.0; // ( -u, -1, v ) neg y\n\n\t\t\t} else if ( face == 5.0 ) {\n\n\t\t\t\tdirection.z *= -1.0; // ( u, v, -1 ) neg z\n\n\t\t\t}\n\n\t\t\treturn direction;\n\n\t\t}\n\n\t\tvoid main() {\n\n\t\t\tvOutputDirection = getDirection( uv, faceIndex );\n\t\t\tgl_Position = vec4( position, 1.0 );\n\n\t\t}\n\t";
}

function qi(t) {
    let e = new WeakMap, i = null;
    function n(t) {
        const i = t.target;
        i.removeEventListener("dispose", n);
        const r = e.get(i);
        void 0 !== r && (e.delete(i), r.dispose());
    }
    return {
        get: function(r) {
            if (r && r.isTexture) {
                const s = r.mapping, a = 303 === s || 304 === s, o = 301 === s || 302 === s;
                if (a || o) {
                    if (r.isRenderTargetTexture && !0 === r.needsPMREMUpdate) {
                        r.needsPMREMUpdate = !1;
                        let n = e.get(r);
                        return null === i && (i = new zi(t)), n = a ? i.fromEquirectangular(r, n) : i.fromCubemap(r, n), 
                        e.set(r, n), n.texture;
                    }
                    if (e.has(r)) return e.get(r).texture;
                    {
                        const s = r.image;
                        if (a && s && s.height > 0 || o && s && function(t) {
                            let e = 0;
                            const i = 6;
                            for (let n = 0; n < i; n++) void 0 !== t[n] && e++;
                            return e === i;
                        }(s)) {
                            null === i && (i = new zi(t));
                            const s = a ? i.fromEquirectangular(r) : i.fromCubemap(r);
                            return e.set(r, s), r.addEventListener("dispose", n), s.texture;
                        }
                        return null;
                    }
                }
            }
            return r;
        },
        dispose: function() {
            e = new WeakMap, null !== i && (i.dispose(), i = null);
        }
    };
}

function Ki(t) {
    const e = {};
    function i(i) {
        if (void 0 !== e[i]) return e[i];
        let n;
        switch (i) {
          case "WEBGL_depth_texture":
            n = t.getExtension("WEBGL_depth_texture") || t.getExtension("MOZ_WEBGL_depth_texture") || t.getExtension("WEBKIT_WEBGL_depth_texture");
            break;

          case "EXT_texture_filter_anisotropic":
            n = t.getExtension("EXT_texture_filter_anisotropic") || t.getExtension("MOZ_EXT_texture_filter_anisotropic") || t.getExtension("WEBKIT_EXT_texture_filter_anisotropic");
            break;

          case "WEBGL_compressed_texture_s3tc":
            n = t.getExtension("WEBGL_compressed_texture_s3tc") || t.getExtension("MOZ_WEBGL_compressed_texture_s3tc") || t.getExtension("WEBKIT_WEBGL_compressed_texture_s3tc");
            break;

          case "WEBGL_compressed_texture_pvrtc":
            n = t.getExtension("WEBGL_compressed_texture_pvrtc") || t.getExtension("WEBKIT_WEBGL_compressed_texture_pvrtc");
            break;

          default:
            n = t.getExtension(i);
        }
        return e[i] = n, n;
    }
    return {
        has: function(t) {
            return null !== i(t);
        },
        init: function(t) {
            t.isWebGL2 ? i("EXT_color_buffer_float") : (i("WEBGL_depth_texture"), i("OES_texture_float"), 
            i("OES_texture_half_float"), i("OES_texture_half_float_linear"), i("OES_standard_derivatives"), 
            i("OES_element_index_uint"), i("OES_vertex_array_object"), i("ANGLE_instanced_arrays")), 
            i("OES_texture_float_linear"), i("EXT_color_buffer_half_float"), i("WEBGL_multisampled_render_to_texture");
        },
        get: function(t) {
            const e = i(t);
            return null === e && console.warn("THREE.WebGLRenderer: " + t + " extension not supported."), 
            e;
        }
    };
}

function Yi(t, e, i, n) {
    const r = {}, s = new WeakMap;
    function a(t) {
        const o = t.target;
        null !== o.index && e.remove(o.index);
        for (const t in o.attributes) e.remove(o.attributes[t]);
        o.removeEventListener("dispose", a), delete r[o.id];
        const l = s.get(o);
        l && (e.remove(l), s.delete(o)), n.releaseStatesOfGeometry(o), !0 === o.isInstancedBufferGeometry && delete o._maxInstanceCount, 
        i.memory.geometries--;
    }
    function o(t) {
        const i = [], n = t.index, r = t.attributes.position;
        let a = 0;
        if (null !== n) {
            const t = n.array;
            a = n.version;
            for (let e = 0, n = t.length; e < n; e += 3) {
                const n = t[e + 0], r = t[e + 1], s = t[e + 2];
                i.push(n, r, r, s, s, n);
            }
        } else {
            const t = r.array;
            a = r.version;
            for (let e = 0, n = t.length / 3 - 1; e < n; e += 3) {
                const t = e + 0, n = e + 1, r = e + 2;
                i.push(t, n, n, r, r, t);
            }
        }
        const o = new (D(i) ? Ae : Ee)(i, 1);
        o.version = a;
        const l = s.get(t);
        l && e.remove(l), s.set(t, o);
    }
    return {
        get: function(t, e) {
            return !0 === r[e.id] || (e.addEventListener("dispose", a), r[e.id] = !0, i.memory.geometries++), 
            e;
        },
        update: function(i) {
            const n = i.attributes;
            for (const i in n) e.update(n[i], t.ARRAY_BUFFER);
            const r = i.morphAttributes;
            for (const i in r) {
                const n = r[i];
                for (let i = 0, r = n.length; i < r; i++) e.update(n[i], t.ARRAY_BUFFER);
            }
        },
        getWireframeAttribute: function(t) {
            const e = s.get(t);
            if (e) {
                const i = t.index;
                null !== i && e.version < i.version && o(t);
            } else o(t);
            return s.get(t);
        }
    };
}

function Zi(t, e, i, n) {
    const r = n.isWebGL2;
    let s, a, o;
    this.setMode = function(t) {
        s = t;
    }, this.setIndex = function(t) {
        a = t.type, o = t.bytesPerElement;
    }, this.render = function(e, n) {
        t.drawElements(s, n, a, e * o), i.update(n, s, 1);
    }, this.renderInstances = function(n, l, h) {
        if (0 === h) return;
        let c, d;
        if (r) c = t, d = "drawElementsInstanced"; else if (c = e.get("ANGLE_instanced_arrays"), 
        d = "drawElementsInstancedANGLE", null === c) return void console.error("THREE.WebGLIndexedBufferRenderer: using THREE.InstancedBufferGeometry but hardware does not support extension ANGLE_instanced_arrays.");
        c[d](s, l, a, n * o, h), i.update(l, s, h);
    };
}

function Ji(t) {
    const e = {
        frame: 0,
        calls: 0,
        triangles: 0,
        points: 0,
        lines: 0
    };
    return {
        memory: {
            geometries: 0,
            textures: 0
        },
        render: e,
        programs: null,
        autoReset: !0,
        reset: function() {
            e.frame++, e.calls = 0, e.triangles = 0, e.points = 0, e.lines = 0;
        },
        update: function(i, n, r) {
            switch (e.calls++, n) {
              case t.TRIANGLES:
                e.triangles += r * (i / 3);
                break;

              case t.LINES:
                e.lines += r * (i / 2);
                break;

              case t.LINE_STRIP:
                e.lines += r * (i - 1);
                break;

              case t.LINE_LOOP:
                e.lines += r * i;
                break;

              case t.POINTS:
                e.points += r * i;
                break;

              default:
                console.error("THREE.WebGLInfo: Unknown draw mode:", n);
            }
        }
    };
}

function Qi(t, e) {
    return t[0] - e[0];
}

function $i(t, e) {
    return Math.abs(e[1]) - Math.abs(t[1]);
}

function tn(t, e, i) {
    const n = {}, r = new Float32Array(8), s = new WeakMap, a = new Y, o = [];
    for (let t = 0; t < 8; t++) o[t] = [ t, 0 ];
    return {
        update: function(l, h, c) {
            const d = l.morphTargetInfluences;
            if (!0 === e.isWebGL2) {
                const n = h.morphAttributes.position || h.morphAttributes.normal || h.morphAttributes.color, r = void 0 !== n ? n.length : 0;
                let o = s.get(h);
                if (void 0 === o || o.count !== r) {
                    void 0 !== o && o.texture.dispose();
                    const t = void 0 !== h.morphAttributes.position, i = void 0 !== h.morphAttributes.normal, n = void 0 !== h.morphAttributes.color, l = h.morphAttributes.position || [], c = h.morphAttributes.normal || [], d = h.morphAttributes.color || [];
                    let u = 0;
                    !0 === t && (u = 1), !0 === i && (u = 2), !0 === n && (u = 3);
                    let p = h.attributes.position.count * u, g = 1;
                    p > e.maxTextureSize && (g = Math.ceil(p / e.maxTextureSize), p = e.maxTextureSize);
                    const f = new Float32Array(p * g * 4 * r), m = new J(f, p, g, r);
                    m.type = 1015, m.needsUpdate = !0;
                    const v = 4 * u;
                    for (let e = 0; e < r; e++) {
                        const r = l[e], s = c[e], o = d[e], h = p * g * 4 * e;
                        for (let e = 0; e < r.count; e++) {
                            const l = e * v;
                            !0 === t && (a.fromBufferAttribute(r, e), f[h + l + 0] = a.x, f[h + l + 1] = a.y, 
                            f[h + l + 2] = a.z, f[h + l + 3] = 0), !0 === i && (a.fromBufferAttribute(s, e), 
                            f[h + l + 4] = a.x, f[h + l + 5] = a.y, f[h + l + 6] = a.z, f[h + l + 7] = 0), !0 === n && (a.fromBufferAttribute(o, e), 
                            f[h + l + 8] = a.x, f[h + l + 9] = a.y, f[h + l + 10] = a.z, f[h + l + 11] = 4 === o.itemSize ? a.w : 1);
                        }
                    }
                    o = {
                        count: r,
                        texture: m,
                        size: new P(p, g)
                    }, s.set(h, o), h.addEventListener("dispose", (function t() {
                        m.dispose(), s.delete(h), h.removeEventListener("dispose", t);
                    }));
                }
                let l = 0;
                for (let t = 0; t < d.length; t++) l += d[t];
                const u = h.morphTargetsRelative ? 1 : 1 - l;
                c.getUniforms().setValue(t, "morphTargetBaseInfluence", u), c.getUniforms().setValue(t, "morphTargetInfluences", d), 
                c.getUniforms().setValue(t, "morphTargetsTexture", o.texture, i), c.getUniforms().setValue(t, "morphTargetsTextureSize", o.size);
            } else {
                const e = void 0 === d ? 0 : d.length;
                let i = n[h.id];
                if (void 0 === i || i.length !== e) {
                    i = [];
                    for (let t = 0; t < e; t++) i[t] = [ t, 0 ];
                    n[h.id] = i;
                }
                for (let t = 0; t < e; t++) {
                    const e = i[t];
                    e[0] = t, e[1] = d[t];
                }
                i.sort($i);
                for (let t = 0; t < 8; t++) t < e && i[t][1] ? (o[t][0] = i[t][0], o[t][1] = i[t][1]) : (o[t][0] = Number.MAX_SAFE_INTEGER, 
                o[t][1] = 0);
                o.sort(Qi);
                const s = h.morphAttributes.position, a = h.morphAttributes.normal;
                let l = 0;
                for (let t = 0; t < 8; t++) {
                    const e = o[t], i = e[0], n = e[1];
                    i !== Number.MAX_SAFE_INTEGER && n ? (s && h.getAttribute("morphTarget" + t) !== s[i] && h.setAttribute("morphTarget" + t, s[i]), 
                    a && h.getAttribute("morphNormal" + t) !== a[i] && h.setAttribute("morphNormal" + t, a[i]), 
                    r[t] = n, l += n) : (s && !0 === h.hasAttribute("morphTarget" + t) && h.deleteAttribute("morphTarget" + t), 
                    a && !0 === h.hasAttribute("morphNormal" + t) && h.deleteAttribute("morphNormal" + t), 
                    r[t] = 0);
                }
                const u = h.morphTargetsRelative ? 1 : 1 - l;
                c.getUniforms().setValue(t, "morphTargetBaseInfluence", u), c.getUniforms().setValue(t, "morphTargetInfluences", r);
            }
        }
    };
}

function en(t, e, i, n) {
    let r = new WeakMap;
    function s(t) {
        const e = t.target;
        e.removeEventListener("dispose", s), i.remove(e.instanceMatrix), null !== e.instanceColor && i.remove(e.instanceColor);
    }
    return {
        update: function(a) {
            const o = n.render.frame, l = a.geometry, h = e.get(a, l);
            return r.get(h) !== o && (e.update(h), r.set(h, o)), a.isInstancedMesh && (!1 === a.hasEventListener("dispose", s) && a.addEventListener("dispose", s), 
            i.update(a.instanceMatrix, t.ARRAY_BUFFER), null !== a.instanceColor && i.update(a.instanceColor, t.ARRAY_BUFFER)), 
            h;
        },
        dispose: function() {
            r = new WeakMap;
        }
    };
}

const nn = new K, rn = new J, sn = new Q, an = new di, on = [], ln = [], hn = new Float32Array(16), cn = new Float32Array(9), dn = new Float32Array(4);

function un(t, e, i) {
    const n = t[0];
    if (n <= 0 || n > 0) return t;
    const r = e * i;
    let s = on[r];
    if (void 0 === s && (s = new Float32Array(r), on[r] = s), 0 !== e) {
        n.toArray(s, 0);
        for (let n = 1, r = 0; n !== e; ++n) r += i, t[n].toArray(s, r);
    }
    return s;
}

function pn(t, e) {
    if (t.length !== e.length) return !1;
    for (let i = 0, n = t.length; i < n; i++) if (t[i] !== e[i]) return !1;
    return !0;
}

function gn(t, e) {
    for (let i = 0, n = e.length; i < n; i++) t[i] = e[i];
}

function fn(t, e) {
    let i = ln[e];
    void 0 === i && (i = new Int32Array(e), ln[e] = i);
    for (let n = 0; n !== e; ++n) i[n] = t.allocateTextureUnit();
    return i;
}

function mn(t, e) {
    const i = this.cache;
    i[0] !== e && (t.uniform1f(this.addr, e), i[0] = e);
}

function vn(t, e) {
    const i = this.cache;
    if (void 0 !== e.x) i[0] === e.x && i[1] === e.y || (t.uniform2f(this.addr, e.x, e.y), 
    i[0] = e.x, i[1] = e.y); else {
        if (pn(i, e)) return;
        t.uniform2fv(this.addr, e), gn(i, e);
    }
}

function _n(t, e) {
    const i = this.cache;
    if (void 0 !== e.x) i[0] === e.x && i[1] === e.y && i[2] === e.z || (t.uniform3f(this.addr, e.x, e.y, e.z), 
    i[0] = e.x, i[1] = e.y, i[2] = e.z); else if (void 0 !== e.r) i[0] === e.r && i[1] === e.g && i[2] === e.b || (t.uniform3f(this.addr, e.r, e.g, e.b), 
    i[0] = e.r, i[1] = e.g, i[2] = e.b); else {
        if (pn(i, e)) return;
        t.uniform3fv(this.addr, e), gn(i, e);
    }
}

function xn(t, e) {
    const i = this.cache;
    if (void 0 !== e.x) i[0] === e.x && i[1] === e.y && i[2] === e.z && i[3] === e.w || (t.uniform4f(this.addr, e.x, e.y, e.z, e.w), 
    i[0] = e.x, i[1] = e.y, i[2] = e.z, i[3] = e.w); else {
        if (pn(i, e)) return;
        t.uniform4fv(this.addr, e), gn(i, e);
    }
}

function yn(t, e) {
    const i = this.cache, n = e.elements;
    if (void 0 === n) {
        if (pn(i, e)) return;
        t.uniformMatrix2fv(this.addr, !1, e), gn(i, e);
    } else {
        if (pn(i, n)) return;
        dn.set(n), t.uniformMatrix2fv(this.addr, !1, dn), gn(i, n);
    }
}

function bn(t, e) {
    const i = this.cache, n = e.elements;
    if (void 0 === n) {
        if (pn(i, e)) return;
        t.uniformMatrix3fv(this.addr, !1, e), gn(i, e);
    } else {
        if (pn(i, n)) return;
        cn.set(n), t.uniformMatrix3fv(this.addr, !1, cn), gn(i, n);
    }
}

function Sn(t, e) {
    const i = this.cache, n = e.elements;
    if (void 0 === n) {
        if (pn(i, e)) return;
        t.uniformMatrix4fv(this.addr, !1, e), gn(i, e);
    } else {
        if (pn(i, n)) return;
        hn.set(n), t.uniformMatrix4fv(this.addr, !1, hn), gn(i, n);
    }
}

function wn(t, e) {
    const i = this.cache;
    i[0] !== e && (t.uniform1i(this.addr, e), i[0] = e);
}

function Mn(t, e) {
    const i = this.cache;
    if (void 0 !== e.x) i[0] === e.x && i[1] === e.y || (t.uniform2i(this.addr, e.x, e.y), 
    i[0] = e.x, i[1] = e.y); else {
        if (pn(i, e)) return;
        t.uniform2iv(this.addr, e), gn(i, e);
    }
}

function Tn(t, e) {
    const i = this.cache;
    if (void 0 !== e.x) i[0] === e.x && i[1] === e.y && i[2] === e.z || (t.uniform3i(this.addr, e.x, e.y, e.z), 
    i[0] = e.x, i[1] = e.y, i[2] = e.z); else {
        if (pn(i, e)) return;
        t.uniform3iv(this.addr, e), gn(i, e);
    }
}

function En(t, e) {
    const i = this.cache;
    if (void 0 !== e.x) i[0] === e.x && i[1] === e.y && i[2] === e.z && i[3] === e.w || (t.uniform4i(this.addr, e.x, e.y, e.z, e.w), 
    i[0] = e.x, i[1] = e.y, i[2] = e.z, i[3] = e.w); else {
        if (pn(i, e)) return;
        t.uniform4iv(this.addr, e), gn(i, e);
    }
}

function An(t, e) {
    const i = this.cache;
    i[0] !== e && (t.uniform1ui(this.addr, e), i[0] = e);
}

function Cn(t, e) {
    const i = this.cache;
    if (void 0 !== e.x) i[0] === e.x && i[1] === e.y || (t.uniform2ui(this.addr, e.x, e.y), 
    i[0] = e.x, i[1] = e.y); else {
        if (pn(i, e)) return;
        t.uniform2uiv(this.addr, e), gn(i, e);
    }
}

function Pn(t, e) {
    const i = this.cache;
    if (void 0 !== e.x) i[0] === e.x && i[1] === e.y && i[2] === e.z || (t.uniform3ui(this.addr, e.x, e.y, e.z), 
    i[0] = e.x, i[1] = e.y, i[2] = e.z); else {
        if (pn(i, e)) return;
        t.uniform3uiv(this.addr, e), gn(i, e);
    }
}

function Rn(t, e) {
    const i = this.cache;
    if (void 0 !== e.x) i[0] === e.x && i[1] === e.y && i[2] === e.z && i[3] === e.w || (t.uniform4ui(this.addr, e.x, e.y, e.z, e.w), 
    i[0] = e.x, i[1] = e.y, i[2] = e.z, i[3] = e.w); else {
        if (pn(i, e)) return;
        t.uniform4uiv(this.addr, e), gn(i, e);
    }
}

function Ln(t, e, i) {
    const n = this.cache, r = i.allocateTextureUnit();
    n[0] !== r && (t.uniform1i(this.addr, r), n[0] = r), i.setTexture2D(e || nn, r);
}

function Dn(t, e, i) {
    const n = this.cache, r = i.allocateTextureUnit();
    n[0] !== r && (t.uniform1i(this.addr, r), n[0] = r), i.setTexture3D(e || sn, r);
}

function In(t, e, i) {
    const n = this.cache, r = i.allocateTextureUnit();
    n[0] !== r && (t.uniform1i(this.addr, r), n[0] = r), i.setTextureCube(e || an, r);
}

function Un(t, e, i) {
    const n = this.cache, r = i.allocateTextureUnit();
    n[0] !== r && (t.uniform1i(this.addr, r), n[0] = r), i.setTexture2DArray(e || rn, r);
}

function Nn(t, e) {
    t.uniform1fv(this.addr, e);
}

function Bn(t, e) {
    const i = un(e, this.size, 2);
    t.uniform2fv(this.addr, i);
}

function On(t, e) {
    const i = un(e, this.size, 3);
    t.uniform3fv(this.addr, i);
}

function Fn(t, e) {
    const i = un(e, this.size, 4);
    t.uniform4fv(this.addr, i);
}

function kn(t, e) {
    const i = un(e, this.size, 4);
    t.uniformMatrix2fv(this.addr, !1, i);
}

function Hn(t, e) {
    const i = un(e, this.size, 9);
    t.uniformMatrix3fv(this.addr, !1, i);
}

function zn(t, e) {
    const i = un(e, this.size, 16);
    t.uniformMatrix4fv(this.addr, !1, i);
}

function Gn(t, e) {
    t.uniform1iv(this.addr, e);
}

function Vn(t, e) {
    t.uniform2iv(this.addr, e);
}

function Wn(t, e) {
    t.uniform3iv(this.addr, e);
}

function jn(t, e) {
    t.uniform4iv(this.addr, e);
}

function Xn(t, e) {
    t.uniform1uiv(this.addr, e);
}

function qn(t, e) {
    t.uniform2uiv(this.addr, e);
}

function Kn(t, e) {
    t.uniform3uiv(this.addr, e);
}

function Yn(t, e) {
    t.uniform4uiv(this.addr, e);
}

function Zn(t, e, i) {
    const n = this.cache, r = e.length, s = fn(i, r);
    pn(n, s) || (t.uniform1iv(this.addr, s), gn(n, s));
    for (let t = 0; t !== r; ++t) i.setTexture2D(e[t] || nn, s[t]);
}

function Jn(t, e, i) {
    const n = this.cache, r = e.length, s = fn(i, r);
    pn(n, s) || (t.uniform1iv(this.addr, s), gn(n, s));
    for (let t = 0; t !== r; ++t) i.setTexture3D(e[t] || sn, s[t]);
}

function Qn(t, e, i) {
    const n = this.cache, r = e.length, s = fn(i, r);
    pn(n, s) || (t.uniform1iv(this.addr, s), gn(n, s));
    for (let t = 0; t !== r; ++t) i.setTextureCube(e[t] || an, s[t]);
}

function $n(t, e, i) {
    const n = this.cache, r = e.length, s = fn(i, r);
    pn(n, s) || (t.uniform1iv(this.addr, s), gn(n, s));
    for (let t = 0; t !== r; ++t) i.setTexture2DArray(e[t] || rn, s[t]);
}

class tr {
    constructor(t, e, i) {
        this.id = t, this.addr = i, this.cache = [], this.setValue = function(t) {
            switch (t) {
              case 5126:
                return mn;

              case 35664:
                return vn;

              case 35665:
                return _n;

              case 35666:
                return xn;

              case 35674:
                return yn;

              case 35675:
                return bn;

              case 35676:
                return Sn;

              case 5124:
              case 35670:
                return wn;

              case 35667:
              case 35671:
                return Mn;

              case 35668:
              case 35672:
                return Tn;

              case 35669:
              case 35673:
                return En;

              case 5125:
                return An;

              case 36294:
                return Cn;

              case 36295:
                return Pn;

              case 36296:
                return Rn;

              case 35678:
              case 36198:
              case 36298:
              case 36306:
              case 35682:
                return Ln;

              case 35679:
              case 36299:
              case 36307:
                return Dn;

              case 35680:
              case 36300:
              case 36308:
              case 36293:
                return In;

              case 36289:
              case 36303:
              case 36311:
              case 36292:
                return Un;
            }
        }(e.type);
    }
}

class er {
    constructor(t, e, i) {
        this.id = t, this.addr = i, this.cache = [], this.size = e.size, this.setValue = function(t) {
            switch (t) {
              case 5126:
                return Nn;

              case 35664:
                return Bn;

              case 35665:
                return On;

              case 35666:
                return Fn;

              case 35674:
                return kn;

              case 35675:
                return Hn;

              case 35676:
                return zn;

              case 5124:
              case 35670:
                return Gn;

              case 35667:
              case 35671:
                return Vn;

              case 35668:
              case 35672:
                return Wn;

              case 35669:
              case 35673:
                return jn;

              case 5125:
                return Xn;

              case 36294:
                return qn;

              case 36295:
                return Kn;

              case 36296:
                return Yn;

              case 35678:
              case 36198:
              case 36298:
              case 36306:
              case 35682:
                return Zn;

              case 35679:
              case 36299:
              case 36307:
                return Jn;

              case 35680:
              case 36300:
              case 36308:
              case 36293:
                return Qn;

              case 36289:
              case 36303:
              case 36311:
              case 36292:
                return $n;
            }
        }(e.type);
    }
}

class ir {
    constructor(t) {
        this.id = t, this.seq = [], this.map = {};
    }
    setValue(t, e, i) {
        const n = this.seq;
        for (let r = 0, s = n.length; r !== s; ++r) {
            const s = n[r];
            s.setValue(t, e[s.id], i);
        }
    }
}

const nr = /(\w+)(\])?(\[|\.)?/g;

function rr(t, e) {
    t.seq.push(e), t.map[e.id] = e;
}

function sr(t, e, i) {
    const n = t.name, r = n.length;
    for (nr.lastIndex = 0; ;) {
        const s = nr.exec(n), a = nr.lastIndex;
        let o = s[1];
        const l = "]" === s[2], h = s[3];
        if (l && (o |= 0), void 0 === h || "[" === h && a + 2 === r) {
            rr(i, void 0 === h ? new tr(o, t, e) : new er(o, t, e));
            break;
        }
        {
            let t = i.map[o];
            void 0 === t && (t = new ir(o), rr(i, t)), i = t;
        }
    }
}

class ar {
    constructor(t, e) {
        this.seq = [], this.map = {};
        const i = t.getProgramParameter(e, t.ACTIVE_UNIFORMS);
        for (let n = 0; n < i; ++n) {
            const i = t.getActiveUniform(e, n);
            sr(i, t.getUniformLocation(e, i.name), this);
        }
    }
    setValue(t, e, i, n) {
        const r = this.map[e];
        void 0 !== r && r.setValue(t, i, n);
    }
    setOptional(t, e, i) {
        const n = e[i];
        void 0 !== n && this.setValue(t, i, n);
    }
    static upload(t, e, i, n) {
        for (let r = 0, s = e.length; r !== s; ++r) {
            const s = e[r], a = i[s.id];
            !1 !== a.needsUpdate && s.setValue(t, a.value, n);
        }
    }
    static seqWithValue(t, e) {
        const i = [];
        for (let n = 0, r = t.length; n !== r; ++n) {
            const r = t[n];
            r.id in e && i.push(r);
        }
        return i;
    }
}

function or(t, e, i) {
    const n = t.createShader(e);
    return t.shaderSource(n, i), t.compileShader(n), n;
}

let lr = 0;

function hr(t, e, i) {
    const n = t.getShaderParameter(e, t.COMPILE_STATUS), r = t.getShaderInfoLog(e).trim();
    if (n && "" === r) return "";
    const s = /ERROR: 0:(\d+)/.exec(r);
    if (s) {
        const n = parseInt(s[1]);
        return i.toUpperCase() + "\n\n" + r + "\n\n" + function(t, e) {
            const i = t.split("\n"), n = [], r = Math.max(e - 6, 0), s = Math.min(e + 6, i.length);
            for (let t = r; t < s; t++) {
                const r = t + 1;
                n.push(`${r === e ? ">" : " "} ${r}: ${i[t]}`);
            }
            return n.join("\n");
        }(t.getShaderSource(e), n);
    }
    return r;
}

function cr(t, e) {
    const i = function(t) {
        switch (t) {
          case "srgb-linear":
            return [ "Linear", "( value )" ];

          case "srgb":
            return [ "sRGB", "( value )" ];

          default:
            return console.warn("THREE.WebGLProgram: Unsupported color space:", t), [ "Linear", "( value )" ];
        }
    }(e);
    return "vec4 " + t + "( vec4 value ) { return LinearTo" + i[0] + i[1] + "; }";
}

function dr(t, e) {
    let i;
    switch (e) {
      case 1:
        i = "Linear";
        break;

      case 2:
        i = "Reinhard";
        break;

      case 3:
        i = "OptimizedCineon";
        break;

      case 4:
        i = "ACESFilmic";
        break;

      case 5:
        i = "Custom";
        break;

      default:
        console.warn("THREE.WebGLProgram: Unsupported toneMapping:", e), i = "Linear";
    }
    return "vec3 " + t + "( vec3 color ) { return " + i + "ToneMapping( color ); }";
}

function ur(t) {
    return "" !== t;
}

function pr(t, e) {
    const i = e.numSpotLightShadows + e.numSpotLightMaps - e.numSpotLightShadowsWithMaps;
    return t.replace(/NUM_DIR_LIGHTS/g, e.numDirLights).replace(/NUM_SPOT_LIGHTS/g, e.numSpotLights).replace(/NUM_SPOT_LIGHT_MAPS/g, e.numSpotLightMaps).replace(/NUM_SPOT_LIGHT_COORDS/g, i).replace(/NUM_RECT_AREA_LIGHTS/g, e.numRectAreaLights).replace(/NUM_POINT_LIGHTS/g, e.numPointLights).replace(/NUM_HEMI_LIGHTS/g, e.numHemiLights).replace(/NUM_DIR_LIGHT_SHADOWS/g, e.numDirLightShadows).replace(/NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS/g, e.numSpotLightShadowsWithMaps).replace(/NUM_SPOT_LIGHT_SHADOWS/g, e.numSpotLightShadows).replace(/NUM_POINT_LIGHT_SHADOWS/g, e.numPointLightShadows);
}

function gr(t, e) {
    return t.replace(/NUM_CLIPPING_PLANES/g, e.numClippingPlanes).replace(/UNION_CLIPPING_PLANES/g, e.numClippingPlanes - e.numClipIntersection);
}

const fr = /^[ \t]*#include +<([\w\d./]+)>/gm;

function mr(t) {
    return t.replace(fr, vr);
}

function vr(t, e) {
    const i = wi[e];
    if (void 0 === i) throw new Error("Can not resolve #include <" + e + ">");
    return mr(i);
}

const _r = /#pragma unroll_loop_start\s+for\s*\(\s*int\s+i\s*=\s*(\d+)\s*;\s*i\s*<\s*(\d+)\s*;\s*i\s*\+\+\s*\)\s*{([\s\S]+?)}\s+#pragma unroll_loop_end/g;

function xr(t) {
    return t.replace(_r, yr);
}

function yr(t, e, i, n) {
    let r = "";
    for (let t = parseInt(e); t < parseInt(i); t++) r += n.replace(/\[\s*i\s*\]/g, "[ " + t + " ]").replace(/UNROLLED_LOOP_INDEX/g, t);
    return r;
}

function br(t) {
    let e = "precision " + t.precision + " float;\nprecision " + t.precision + " int;";
    return "highp" === t.precision ? e += "\n#define HIGH_PRECISION" : "mediump" === t.precision ? e += "\n#define MEDIUM_PRECISION" : "lowp" === t.precision && (e += "\n#define LOW_PRECISION"), 
    e;
}

function Sr(t, e, i, n) {
    const r = t.getContext(), s = i.defines;
    let a = i.vertexShader, o = i.fragmentShader;
    const l = function(t) {
        let e = "SHADOWMAP_TYPE_BASIC";
        return 1 === t.shadowMapType ? e = "SHADOWMAP_TYPE_PCF" : 2 === t.shadowMapType ? e = "SHADOWMAP_TYPE_PCF_SOFT" : 3 === t.shadowMapType && (e = "SHADOWMAP_TYPE_VSM"), 
        e;
    }(i), h = function(t) {
        let e = "ENVMAP_TYPE_CUBE";
        if (t.envMap) switch (t.envMapMode) {
          case 301:
          case 302:
            e = "ENVMAP_TYPE_CUBE";
            break;

          case 306:
            e = "ENVMAP_TYPE_CUBE_UV";
        }
        return e;
    }(i), c = function(t) {
        let e = "ENVMAP_MODE_REFLECTION";
        t.envMap && 302 === t.envMapMode && (e = "ENVMAP_MODE_REFRACTION");
        return e;
    }(i), d = function(t) {
        let e = "ENVMAP_BLENDING_NONE";
        if (t.envMap) switch (t.combine) {
          case 0:
            e = "ENVMAP_BLENDING_MULTIPLY";
            break;

          case 1:
            e = "ENVMAP_BLENDING_MIX";
            break;

          case 2:
            e = "ENVMAP_BLENDING_ADD";
        }
        return e;
    }(i), u = function(t) {
        const e = t.envMapCubeUVHeight;
        if (null === e) return null;
        const i = Math.log2(e) - 2, n = 1 / e;
        return {
            texelWidth: 1 / (3 * Math.max(Math.pow(2, i), 112)),
            texelHeight: n,
            maxMip: i
        };
    }(i), p = i.isWebGL2 ? "" : function(t) {
        return [ t.extensionDerivatives || t.envMapCubeUVHeight || t.bumpMap || t.normalMapTangentSpace || t.clearcoatNormalMap || t.flatShading || "physical" === t.shaderID ? "#extension GL_OES_standard_derivatives : enable" : "", (t.extensionFragDepth || t.logarithmicDepthBuffer) && t.rendererExtensionFragDepth ? "#extension GL_EXT_frag_depth : enable" : "", t.extensionDrawBuffers && t.rendererExtensionDrawBuffers ? "#extension GL_EXT_draw_buffers : require" : "", (t.extensionShaderTextureLOD || t.envMap || t.transmission) && t.rendererExtensionShaderTextureLod ? "#extension GL_EXT_shader_texture_lod : enable" : "" ].filter(ur).join("\n");
    }(i), g = function(t) {
        const e = [];
        for (const i in t) {
            const n = t[i];
            !1 !== n && e.push("#define " + i + " " + n);
        }
        return e.join("\n");
    }(s), f = r.createProgram();
    let m, v, _ = i.glslVersion ? "#version " + i.glslVersion + "\n" : "";
    i.isRawShaderMaterial ? (m = [ g ].filter(ur).join("\n"), m.length > 0 && (m += "\n"), 
    v = [ p, g ].filter(ur).join("\n"), v.length > 0 && (v += "\n")) : (m = [ br(i), "#define SHADER_NAME " + i.shaderName, g, i.instancing ? "#define USE_INSTANCING" : "", i.instancingColor ? "#define USE_INSTANCING_COLOR" : "", i.useFog && i.fog ? "#define USE_FOG" : "", i.useFog && i.fogExp2 ? "#define FOG_EXP2" : "", i.map ? "#define USE_MAP" : "", i.envMap ? "#define USE_ENVMAP" : "", i.envMap ? "#define " + c : "", i.lightMap ? "#define USE_LIGHTMAP" : "", i.aoMap ? "#define USE_AOMAP" : "", i.bumpMap ? "#define USE_BUMPMAP" : "", i.normalMap ? "#define USE_NORMALMAP" : "", i.normalMapObjectSpace ? "#define USE_NORMALMAP_OBJECTSPACE" : "", i.normalMapTangentSpace ? "#define USE_NORMALMAP_TANGENTSPACE" : "", i.displacementMap ? "#define USE_DISPLACEMENTMAP" : "", i.emissiveMap ? "#define USE_EMISSIVEMAP" : "", i.clearcoatMap ? "#define USE_CLEARCOATMAP" : "", i.clearcoatRoughnessMap ? "#define USE_CLEARCOAT_ROUGHNESSMAP" : "", i.clearcoatNormalMap ? "#define USE_CLEARCOAT_NORMALMAP" : "", i.iridescenceMap ? "#define USE_IRIDESCENCEMAP" : "", i.iridescenceThicknessMap ? "#define USE_IRIDESCENCE_THICKNESSMAP" : "", i.specularMap ? "#define USE_SPECULARMAP" : "", i.specularColorMap ? "#define USE_SPECULAR_COLORMAP" : "", i.specularIntensityMap ? "#define USE_SPECULAR_INTENSITYMAP" : "", i.roughnessMap ? "#define USE_ROUGHNESSMAP" : "", i.metalnessMap ? "#define USE_METALNESSMAP" : "", i.alphaMap ? "#define USE_ALPHAMAP" : "", i.transmission ? "#define USE_TRANSMISSION" : "", i.transmissionMap ? "#define USE_TRANSMISSIONMAP" : "", i.thicknessMap ? "#define USE_THICKNESSMAP" : "", i.sheenColorMap ? "#define USE_SHEEN_COLORMAP" : "", i.sheenRoughnessMap ? "#define USE_SHEEN_ROUGHNESSMAP" : "", i.mapUv ? "#define MAP_UV " + i.mapUv : "", i.alphaMapUv ? "#define ALPHAMAP_UV " + i.alphaMapUv : "", i.lightMapUv ? "#define LIGHTMAP_UV " + i.lightMapUv : "", i.aoMapUv ? "#define AOMAP_UV " + i.aoMapUv : "", i.emissiveMapUv ? "#define EMISSIVEMAP_UV " + i.emissiveMapUv : "", i.bumpMapUv ? "#define BUMPMAP_UV " + i.bumpMapUv : "", i.normalMapUv ? "#define NORMALMAP_UV " + i.normalMapUv : "", i.displacementMapUv ? "#define DISPLACEMENTMAP_UV " + i.displacementMapUv : "", i.metalnessMapUv ? "#define METALNESSMAP_UV " + i.metalnessMapUv : "", i.roughnessMapUv ? "#define ROUGHNESSMAP_UV " + i.roughnessMapUv : "", i.clearcoatMapUv ? "#define CLEARCOATMAP_UV " + i.clearcoatMapUv : "", i.clearcoatNormalMapUv ? "#define CLEARCOAT_NORMALMAP_UV " + i.clearcoatNormalMapUv : "", i.clearcoatRoughnessMapUv ? "#define CLEARCOAT_ROUGHNESSMAP_UV " + i.clearcoatRoughnessMapUv : "", i.iridescenceMapUv ? "#define IRIDESCENCEMAP_UV " + i.iridescenceMapUv : "", i.iridescenceThicknessMapUv ? "#define IRIDESCENCE_THICKNESSMAP_UV " + i.iridescenceThicknessMapUv : "", i.sheenColorMapUv ? "#define SHEEN_COLORMAP_UV " + i.sheenColorMapUv : "", i.sheenRoughnessMapUv ? "#define SHEEN_ROUGHNESSMAP_UV " + i.sheenRoughnessMapUv : "", i.specularMapUv ? "#define SPECULARMAP_UV " + i.specularMapUv : "", i.specularColorMapUv ? "#define SPECULAR_COLORMAP_UV " + i.specularColorMapUv : "", i.specularIntensityMapUv ? "#define SPECULAR_INTENSITYMAP_UV " + i.specularIntensityMapUv : "", i.transmissionMapUv ? "#define TRANSMISSIONMAP_UV " + i.transmissionMapUv : "", i.thicknessMapUv ? "#define THICKNESSMAP_UV " + i.thicknessMapUv : "", i.vertexTangents ? "#define USE_TANGENT" : "", i.vertexColors ? "#define USE_COLOR" : "", i.vertexAlphas ? "#define USE_COLOR_ALPHA" : "", i.vertexUv1s ? "#define USE_UV1" : "", i.vertexUv2s ? "#define USE_UV2" : "", i.vertexUv3s ? "#define USE_UV3" : "", i.pointsUvs ? "#define USE_POINTS_UV" : "", i.flatShading ? "#define FLAT_SHADED" : "", i.skinning ? "#define USE_SKINNING" : "", i.morphTargets ? "#define USE_MORPHTARGETS" : "", i.morphNormals && !1 === i.flatShading ? "#define USE_MORPHNORMALS" : "", i.morphColors && i.isWebGL2 ? "#define USE_MORPHCOLORS" : "", i.morphTargetsCount > 0 && i.isWebGL2 ? "#define MORPHTARGETS_TEXTURE" : "", i.morphTargetsCount > 0 && i.isWebGL2 ? "#define MORPHTARGETS_TEXTURE_STRIDE " + i.morphTextureStride : "", i.morphTargetsCount > 0 && i.isWebGL2 ? "#define MORPHTARGETS_COUNT " + i.morphTargetsCount : "", i.doubleSided ? "#define DOUBLE_SIDED" : "", i.flipSided ? "#define FLIP_SIDED" : "", i.shadowMapEnabled ? "#define USE_SHADOWMAP" : "", i.shadowMapEnabled ? "#define " + l : "", i.sizeAttenuation ? "#define USE_SIZEATTENUATION" : "", i.logarithmicDepthBuffer ? "#define USE_LOGDEPTHBUF" : "", i.logarithmicDepthBuffer && i.rendererExtensionFragDepth ? "#define USE_LOGDEPTHBUF_EXT" : "", "uniform mat4 modelMatrix;", "uniform mat4 modelViewMatrix;", "uniform mat4 projectionMatrix;", "uniform mat4 viewMatrix;", "uniform mat3 normalMatrix;", "uniform vec3 cameraPosition;", "uniform bool isOrthographic;", "#ifdef USE_INSTANCING", "\tattribute mat4 instanceMatrix;", "#endif", "#ifdef USE_INSTANCING_COLOR", "\tattribute vec3 instanceColor;", "#endif", "attribute vec3 position;", "attribute vec3 normal;", "attribute vec2 uv;", "#ifdef USE_UV1", "\tattribute vec2 uv1;", "#endif", "#ifdef USE_UV2", "\tattribute vec2 uv2;", "#endif", "#ifdef USE_UV3", "\tattribute vec2 uv3;", "#endif", "#ifdef USE_TANGENT", "\tattribute vec4 tangent;", "#endif", "#if defined( USE_COLOR_ALPHA )", "\tattribute vec4 color;", "#elif defined( USE_COLOR )", "\tattribute vec3 color;", "#endif", "#if ( defined( USE_MORPHTARGETS ) && ! defined( MORPHTARGETS_TEXTURE ) )", "\tattribute vec3 morphTarget0;", "\tattribute vec3 morphTarget1;", "\tattribute vec3 morphTarget2;", "\tattribute vec3 morphTarget3;", "\t#ifdef USE_MORPHNORMALS", "\t\tattribute vec3 morphNormal0;", "\t\tattribute vec3 morphNormal1;", "\t\tattribute vec3 morphNormal2;", "\t\tattribute vec3 morphNormal3;", "\t#else", "\t\tattribute vec3 morphTarget4;", "\t\tattribute vec3 morphTarget5;", "\t\tattribute vec3 morphTarget6;", "\t\tattribute vec3 morphTarget7;", "\t#endif", "#endif", "#ifdef USE_SKINNING", "\tattribute vec4 skinIndex;", "\tattribute vec4 skinWeight;", "#endif", "\n" ].filter(ur).join("\n"), 
    v = [ p, br(i), "#define SHADER_NAME " + i.shaderName, g, i.useFog && i.fog ? "#define USE_FOG" : "", i.useFog && i.fogExp2 ? "#define FOG_EXP2" : "", i.map ? "#define USE_MAP" : "", i.matcap ? "#define USE_MATCAP" : "", i.envMap ? "#define USE_ENVMAP" : "", i.envMap ? "#define " + h : "", i.envMap ? "#define " + c : "", i.envMap ? "#define " + d : "", u ? "#define CUBEUV_TEXEL_WIDTH " + u.texelWidth : "", u ? "#define CUBEUV_TEXEL_HEIGHT " + u.texelHeight : "", u ? "#define CUBEUV_MAX_MIP " + u.maxMip + ".0" : "", i.lightMap ? "#define USE_LIGHTMAP" : "", i.aoMap ? "#define USE_AOMAP" : "", i.bumpMap ? "#define USE_BUMPMAP" : "", i.normalMap ? "#define USE_NORMALMAP" : "", i.normalMapObjectSpace ? "#define USE_NORMALMAP_OBJECTSPACE" : "", i.normalMapTangentSpace ? "#define USE_NORMALMAP_TANGENTSPACE" : "", i.emissiveMap ? "#define USE_EMISSIVEMAP" : "", i.clearcoat ? "#define USE_CLEARCOAT" : "", i.clearcoatMap ? "#define USE_CLEARCOATMAP" : "", i.clearcoatRoughnessMap ? "#define USE_CLEARCOAT_ROUGHNESSMAP" : "", i.clearcoatNormalMap ? "#define USE_CLEARCOAT_NORMALMAP" : "", i.iridescence ? "#define USE_IRIDESCENCE" : "", i.iridescenceMap ? "#define USE_IRIDESCENCEMAP" : "", i.iridescenceThicknessMap ? "#define USE_IRIDESCENCE_THICKNESSMAP" : "", i.specularMap ? "#define USE_SPECULARMAP" : "", i.specularColorMap ? "#define USE_SPECULAR_COLORMAP" : "", i.specularIntensityMap ? "#define USE_SPECULAR_INTENSITYMAP" : "", i.roughnessMap ? "#define USE_ROUGHNESSMAP" : "", i.metalnessMap ? "#define USE_METALNESSMAP" : "", i.alphaMap ? "#define USE_ALPHAMAP" : "", i.alphaTest ? "#define USE_ALPHATEST" : "", i.sheen ? "#define USE_SHEEN" : "", i.sheenColorMap ? "#define USE_SHEEN_COLORMAP" : "", i.sheenRoughnessMap ? "#define USE_SHEEN_ROUGHNESSMAP" : "", i.transmission ? "#define USE_TRANSMISSION" : "", i.transmissionMap ? "#define USE_TRANSMISSIONMAP" : "", i.thicknessMap ? "#define USE_THICKNESSMAP" : "", i.vertexTangents ? "#define USE_TANGENT" : "", i.vertexColors || i.instancingColor ? "#define USE_COLOR" : "", i.vertexAlphas ? "#define USE_COLOR_ALPHA" : "", i.vertexUv1s ? "#define USE_UV1" : "", i.vertexUv2s ? "#define USE_UV2" : "", i.vertexUv3s ? "#define USE_UV3" : "", i.pointsUvs ? "#define USE_POINTS_UV" : "", i.gradientMap ? "#define USE_GRADIENTMAP" : "", i.flatShading ? "#define FLAT_SHADED" : "", i.doubleSided ? "#define DOUBLE_SIDED" : "", i.flipSided ? "#define FLIP_SIDED" : "", i.shadowMapEnabled ? "#define USE_SHADOWMAP" : "", i.shadowMapEnabled ? "#define " + l : "", i.premultipliedAlpha ? "#define PREMULTIPLIED_ALPHA" : "", i.useLegacyLights ? "#define LEGACY_LIGHTS" : "", i.logarithmicDepthBuffer ? "#define USE_LOGDEPTHBUF" : "", i.logarithmicDepthBuffer && i.rendererExtensionFragDepth ? "#define USE_LOGDEPTHBUF_EXT" : "", "uniform mat4 viewMatrix;", "uniform vec3 cameraPosition;", "uniform bool isOrthographic;", 0 !== i.toneMapping ? "#define TONE_MAPPING" : "", 0 !== i.toneMapping ? wi.tonemapping_pars_fragment : "", 0 !== i.toneMapping ? dr("toneMapping", i.toneMapping) : "", i.dithering ? "#define DITHERING" : "", i.opaque ? "#define OPAQUE" : "", wi.encodings_pars_fragment, cr("linearToOutputTexel", i.outputColorSpace), i.useDepthPacking ? "#define DEPTH_PACKING " + i.depthPacking : "", "\n" ].filter(ur).join("\n")), 
    a = mr(a), a = pr(a, i), a = gr(a, i), o = mr(o), o = pr(o, i), o = gr(o, i), a = xr(a), 
    o = xr(o), i.isWebGL2 && !0 !== i.isRawShaderMaterial && (_ = "#version 300 es\n", 
    m = [ "precision mediump sampler2DArray;", "#define attribute in", "#define varying out", "#define texture2D texture" ].join("\n") + "\n" + m, 
    v = [ "#define varying in", "300 es" === i.glslVersion ? "" : "layout(location = 0) out highp vec4 pc_fragColor;", "300 es" === i.glslVersion ? "" : "#define gl_FragColor pc_fragColor", "#define gl_FragDepthEXT gl_FragDepth", "#define texture2D texture", "#define textureCube texture", "#define texture2DProj textureProj", "#define texture2DLodEXT textureLod", "#define texture2DProjLodEXT textureProjLod", "#define textureCubeLodEXT textureLod", "#define texture2DGradEXT textureGrad", "#define texture2DProjGradEXT textureProjGrad", "#define textureCubeGradEXT textureGrad" ].join("\n") + "\n" + v);
    const x = _ + m + a, y = _ + v + o, b = or(r, r.VERTEX_SHADER, x), S = or(r, r.FRAGMENT_SHADER, y);
    if (r.attachShader(f, b), r.attachShader(f, S), void 0 !== i.index0AttributeName ? r.bindAttribLocation(f, 0, i.index0AttributeName) : !0 === i.morphTargets && r.bindAttribLocation(f, 0, "position"), 
    r.linkProgram(f), t.debug.checkShaderErrors) {
        const e = r.getProgramInfoLog(f).trim(), i = r.getShaderInfoLog(b).trim(), n = r.getShaderInfoLog(S).trim();
        let s = !0, a = !0;
        if (!1 === r.getProgramParameter(f, r.LINK_STATUS)) if (s = !1, "function" == typeof t.debug.onShaderError) t.debug.onShaderError(r, f, b, S); else {
            const t = hr(r, b, "vertex"), i = hr(r, S, "fragment");
            console.error("THREE.WebGLProgram: Shader Error " + r.getError() + " - VALIDATE_STATUS " + r.getProgramParameter(f, r.VALIDATE_STATUS) + "\n\nProgram Info Log: " + e + "\n" + t + "\n" + i);
        } else "" !== e ? console.warn("THREE.WebGLProgram: Program Info Log:", e) : "" !== i && "" !== n || (a = !1);
        a && (this.diagnostics = {
            runnable: s,
            programLog: e,
            vertexShader: {
                log: i,
                prefix: m
            },
            fragmentShader: {
                log: n,
                prefix: v
            }
        });
    }
    let w, M;
    return r.deleteShader(b), r.deleteShader(S), this.getUniforms = function() {
        return void 0 === w && (w = new ar(r, f)), w;
    }, this.getAttributes = function() {
        return void 0 === M && (M = function(t, e) {
            const i = {}, n = t.getProgramParameter(e, t.ACTIVE_ATTRIBUTES);
            for (let r = 0; r < n; r++) {
                const n = t.getActiveAttrib(e, r), s = n.name;
                let a = 1;
                n.type === t.FLOAT_MAT2 && (a = 2), n.type === t.FLOAT_MAT3 && (a = 3), n.type === t.FLOAT_MAT4 && (a = 4), 
                i[s] = {
                    type: n.type,
                    location: t.getAttribLocation(e, s),
                    locationSize: a
                };
            }
            return i;
        }(r, f)), M;
    }, this.destroy = function() {
        n.releaseStatesOfProgram(this), r.deleteProgram(f), this.program = void 0;
    }, this.name = i.shaderName, this.id = lr++, this.cacheKey = e, this.usedTimes = 1, 
    this.program = f, this.vertexShader = b, this.fragmentShader = S, this;
}

let wr = 0;

class Mr {
    constructor() {
        this.shaderCache = new Map, this.materialCache = new Map;
    }
    update(t) {
        const e = t.vertexShader, i = t.fragmentShader, n = this._getShaderStage(e), r = this._getShaderStage(i), s = this._getShaderCacheForMaterial(t);
        return !1 === s.has(n) && (s.add(n), n.usedTimes++), !1 === s.has(r) && (s.add(r), 
        r.usedTimes++), this;
    }
    remove(t) {
        const e = this.materialCache.get(t);
        for (const t of e) t.usedTimes--, 0 === t.usedTimes && this.shaderCache.delete(t.code);
        return this.materialCache.delete(t), this;
    }
    getVertexShaderID(t) {
        return this._getShaderStage(t.vertexShader).id;
    }
    getFragmentShaderID(t) {
        return this._getShaderStage(t.fragmentShader).id;
    }
    dispose() {
        this.shaderCache.clear(), this.materialCache.clear();
    }
    _getShaderCacheForMaterial(t) {
        const e = this.materialCache;
        let i = e.get(t);
        return void 0 === i && (i = new Set, e.set(t, i)), i;
    }
    _getShaderStage(t) {
        const e = this.shaderCache;
        let i = e.get(t);
        return void 0 === i && (i = new Tr(t), e.set(t, i)), i;
    }
}

class Tr {
    constructor(t) {
        this.id = wr++, this.code = t, this.usedTimes = 0;
    }
}

function Er(t, e, i, n, r, s, a) {
    const o = new zt, l = new Mr, h = [], c = r.isWebGL2, d = r.logarithmicDepthBuffer, u = r.vertexTextures;
    let p = r.precision;
    const g = {
        MeshDepthMaterial: "depth",
        MeshDistanceMaterial: "distanceRGBA",
        MeshNormalMaterial: "normal",
        MeshBasicMaterial: "basic",
        MeshLambertMaterial: "lambert",
        MeshPhongMaterial: "phong",
        MeshToonMaterial: "toon",
        MeshStandardMaterial: "physical",
        MeshPhysicalMaterial: "physical",
        MeshMatcapMaterial: "matcap",
        LineBasicMaterial: "basic",
        LineDashedMaterial: "dashed",
        PointsMaterial: "points",
        ShadowMaterial: "shadow",
        SpriteMaterial: "sprite"
    };
    function f(t) {
        return 1 === t ? "uv1" : 2 === t ? "uv2" : 3 === t ? "uv3" : "uv";
    }
    return {
        getParameters: function(s, o, h, m, v) {
            const _ = m.fog, x = v.geometry, y = s.isMeshStandardMaterial ? m.environment : null, b = (s.isMeshStandardMaterial ? i : e).get(s.envMap || y), S = b && 306 === b.mapping ? b.image.height : null, w = g[s.type];
            null !== s.precision && (p = r.getMaxPrecision(s.precision), p !== s.precision && console.warn("THREE.WebGLProgram.getParameters:", s.precision, "not supported, using", p, "instead."));
            const M = x.morphAttributes.position || x.morphAttributes.normal || x.morphAttributes.color, T = void 0 !== M ? M.length : 0;
            let E, A, C, P, R = 0;
            if (void 0 !== x.morphAttributes.position && (R = 1), void 0 !== x.morphAttributes.normal && (R = 2), 
            void 0 !== x.morphAttributes.color && (R = 3), w) {
                const t = Ti[w];
                E = t.vertexShader, A = t.fragmentShader;
            } else E = s.vertexShader, A = s.fragmentShader, l.update(s), C = l.getVertexShaderID(s), 
            P = l.getFragmentShaderID(s);
            const L = t.getRenderTarget(), D = !0 === v.isInstancedMesh, I = !!s.map, U = !!s.matcap, N = !!b, B = !!s.aoMap, O = !!s.lightMap, F = !!s.bumpMap, k = !!s.normalMap, H = !!s.displacementMap, z = !!s.emissiveMap, G = !!s.metalnessMap, V = !!s.roughnessMap, W = s.clearcoat > 0, j = s.iridescence > 0, X = s.sheen > 0, q = s.transmission > 0, K = W && !!s.clearcoatMap, Y = W && !!s.clearcoatNormalMap, Z = W && !!s.clearcoatRoughnessMap, J = j && !!s.iridescenceMap, Q = j && !!s.iridescenceThicknessMap, $ = X && !!s.sheenColorMap, tt = X && !!s.sheenRoughnessMap, et = !!s.specularMap, it = !!s.specularColorMap, nt = !!s.specularIntensityMap, rt = q && !!s.transmissionMap, st = q && !!s.thicknessMap, at = !!s.gradientMap, ot = !!s.alphaMap, lt = s.alphaTest > 0, ht = !!s.extensions, ct = !!x.attributes.uv1, dt = !!x.attributes.uv2, ut = !!x.attributes.uv3;
            return {
                isWebGL2: c,
                shaderID: w,
                shaderName: s.type,
                vertexShader: E,
                fragmentShader: A,
                defines: s.defines,
                customVertexShaderID: C,
                customFragmentShaderID: P,
                isRawShaderMaterial: !0 === s.isRawShaderMaterial,
                glslVersion: s.glslVersion,
                precision: p,
                instancing: D,
                instancingColor: D && null !== v.instanceColor,
                supportsVertexTextures: u,
                outputColorSpace: null === L ? t.outputColorSpace : !0 === L.isXRRenderTarget ? L.texture.colorSpace : "srgb-linear",
                map: I,
                matcap: U,
                envMap: N,
                envMapMode: N && b.mapping,
                envMapCubeUVHeight: S,
                aoMap: B,
                lightMap: O,
                bumpMap: F,
                normalMap: k,
                displacementMap: u && H,
                emissiveMap: z,
                normalMapObjectSpace: k && 1 === s.normalMapType,
                normalMapTangentSpace: k && 0 === s.normalMapType,
                metalnessMap: G,
                roughnessMap: V,
                clearcoat: W,
                clearcoatMap: K,
                clearcoatNormalMap: Y,
                clearcoatRoughnessMap: Z,
                iridescence: j,
                iridescenceMap: J,
                iridescenceThicknessMap: Q,
                sheen: X,
                sheenColorMap: $,
                sheenRoughnessMap: tt,
                specularMap: et,
                specularColorMap: it,
                specularIntensityMap: nt,
                transmission: q,
                transmissionMap: rt,
                thicknessMap: st,
                gradientMap: at,
                opaque: !1 === s.transparent && 1 === s.blending,
                alphaMap: ot,
                alphaTest: lt,
                combine: s.combine,
                mapUv: I && f(s.map.channel),
                aoMapUv: B && f(s.aoMap.channel),
                lightMapUv: O && f(s.lightMap.channel),
                bumpMapUv: F && f(s.bumpMap.channel),
                normalMapUv: k && f(s.normalMap.channel),
                displacementMapUv: H && f(s.displacementMap.channel),
                emissiveMapUv: z && f(s.emissiveMap.channel),
                metalnessMapUv: G && f(s.metalnessMap.channel),
                roughnessMapUv: V && f(s.roughnessMap.channel),
                clearcoatMapUv: K && f(s.clearcoatMap.channel),
                clearcoatNormalMapUv: Y && f(s.clearcoatNormalMap.channel),
                clearcoatRoughnessMapUv: Z && f(s.clearcoatRoughnessMap.channel),
                iridescenceMapUv: J && f(s.iridescenceMap.channel),
                iridescenceThicknessMapUv: Q && f(s.iridescenceThicknessMap.channel),
                sheenColorMapUv: $ && f(s.sheenColorMap.channel),
                sheenRoughnessMapUv: tt && f(s.sheenRoughnessMap.channel),
                specularMapUv: et && f(s.specularMap.channel),
                specularColorMapUv: it && f(s.specularColorMap.channel),
                specularIntensityMapUv: nt && f(s.specularIntensityMap.channel),
                transmissionMapUv: rt && f(s.transmissionMap.channel),
                thicknessMapUv: st && f(s.thicknessMap.channel),
                alphaMapUv: ot && f(s.alphaMap.channel),
                vertexTangents: k && !!x.attributes.tangent,
                vertexColors: s.vertexColors,
                vertexAlphas: !0 === s.vertexColors && !!x.attributes.color && 4 === x.attributes.color.itemSize,
                vertexUv1s: ct,
                vertexUv2s: dt,
                vertexUv3s: ut,
                pointsUvs: !0 === v.isPoints && !!x.attributes.uv && (I || ot),
                fog: !!_,
                useFog: !0 === s.fog,
                fogExp2: _ && _.isFogExp2,
                flatShading: !0 === s.flatShading,
                sizeAttenuation: !0 === s.sizeAttenuation,
                logarithmicDepthBuffer: d,
                skinning: !0 === v.isSkinnedMesh,
                morphTargets: void 0 !== x.morphAttributes.position,
                morphNormals: void 0 !== x.morphAttributes.normal,
                morphColors: void 0 !== x.morphAttributes.color,
                morphTargetsCount: T,
                morphTextureStride: R,
                numDirLights: o.directional.length,
                numPointLights: o.point.length,
                numSpotLights: o.spot.length,
                numSpotLightMaps: o.spotLightMap.length,
                numRectAreaLights: o.rectArea.length,
                numHemiLights: o.hemi.length,
                numDirLightShadows: o.directionalShadowMap.length,
                numPointLightShadows: o.pointShadowMap.length,
                numSpotLightShadows: o.spotShadowMap.length,
                numSpotLightShadowsWithMaps: o.numSpotLightShadowsWithMaps,
                numClippingPlanes: a.numPlanes,
                numClipIntersection: a.numIntersection,
                dithering: s.dithering,
                shadowMapEnabled: t.shadowMap.enabled && h.length > 0,
                shadowMapType: t.shadowMap.type,
                toneMapping: s.toneMapped ? t.toneMapping : 0,
                useLegacyLights: t.useLegacyLights,
                premultipliedAlpha: s.premultipliedAlpha,
                doubleSided: 2 === s.side,
                flipSided: 1 === s.side,
                useDepthPacking: s.depthPacking >= 0,
                depthPacking: s.depthPacking || 0,
                index0AttributeName: s.index0AttributeName,
                extensionDerivatives: ht && !0 === s.extensions.derivatives,
                extensionFragDepth: ht && !0 === s.extensions.fragDepth,
                extensionDrawBuffers: ht && !0 === s.extensions.drawBuffers,
                extensionShaderTextureLOD: ht && !0 === s.extensions.shaderTextureLOD,
                rendererExtensionFragDepth: c || n.has("EXT_frag_depth"),
                rendererExtensionDrawBuffers: c || n.has("WEBGL_draw_buffers"),
                rendererExtensionShaderTextureLod: c || n.has("EXT_shader_texture_lod"),
                customProgramCacheKey: s.customProgramCacheKey()
            };
        },
        getProgramCacheKey: function(e) {
            const i = [];
            if (e.shaderID ? i.push(e.shaderID) : (i.push(e.customVertexShaderID), i.push(e.customFragmentShaderID)), 
            void 0 !== e.defines) for (const t in e.defines) i.push(t), i.push(e.defines[t]);
            return !1 === e.isRawShaderMaterial && (!function(t, e) {
                t.push(e.precision), t.push(e.outputColorSpace), t.push(e.envMapMode), t.push(e.envMapCubeUVHeight), 
                t.push(e.mapUv), t.push(e.alphaMapUv), t.push(e.lightMapUv), t.push(e.aoMapUv), 
                t.push(e.bumpMapUv), t.push(e.normalMapUv), t.push(e.displacementMapUv), t.push(e.emissiveMapUv), 
                t.push(e.metalnessMapUv), t.push(e.roughnessMapUv), t.push(e.clearcoatMapUv), t.push(e.clearcoatNormalMapUv), 
                t.push(e.clearcoatRoughnessMapUv), t.push(e.iridescenceMapUv), t.push(e.iridescenceThicknessMapUv), 
                t.push(e.sheenColorMapUv), t.push(e.sheenRoughnessMapUv), t.push(e.specularMapUv), 
                t.push(e.specularColorMapUv), t.push(e.specularIntensityMapUv), t.push(e.transmissionMapUv), 
                t.push(e.thicknessMapUv), t.push(e.combine), t.push(e.fogExp2), t.push(e.sizeAttenuation), 
                t.push(e.morphTargetsCount), t.push(e.morphAttributeCount), t.push(e.numDirLights), 
                t.push(e.numPointLights), t.push(e.numSpotLights), t.push(e.numSpotLightMaps), t.push(e.numHemiLights), 
                t.push(e.numRectAreaLights), t.push(e.numDirLightShadows), t.push(e.numPointLightShadows), 
                t.push(e.numSpotLightShadows), t.push(e.numSpotLightShadowsWithMaps), t.push(e.shadowMapType), 
                t.push(e.toneMapping), t.push(e.numClippingPlanes), t.push(e.numClipIntersection), 
                t.push(e.depthPacking);
            }(i, e), function(t, e) {
                o.disableAll(), e.isWebGL2 && o.enable(0);
                e.supportsVertexTextures && o.enable(1);
                e.instancing && o.enable(2);
                e.instancingColor && o.enable(3);
                e.matcap && o.enable(4);
                e.envMap && o.enable(5);
                e.normalMapObjectSpace && o.enable(6);
                e.normalMapTangentSpace && o.enable(7);
                e.clearcoat && o.enable(8);
                e.iridescence && o.enable(9);
                e.alphaTest && o.enable(10);
                e.vertexColors && o.enable(11);
                e.vertexAlphas && o.enable(12);
                e.vertexUv1s && o.enable(13);
                e.vertexUv2s && o.enable(14);
                e.vertexUv3s && o.enable(15);
                e.vertexTangents && o.enable(16);
                t.push(o.mask), o.disableAll(), e.fog && o.enable(0);
                e.useFog && o.enable(1);
                e.flatShading && o.enable(2);
                e.logarithmicDepthBuffer && o.enable(3);
                e.skinning && o.enable(4);
                e.morphTargets && o.enable(5);
                e.morphNormals && o.enable(6);
                e.morphColors && o.enable(7);
                e.premultipliedAlpha && o.enable(8);
                e.shadowMapEnabled && o.enable(9);
                e.useLegacyLights && o.enable(10);
                e.doubleSided && o.enable(11);
                e.flipSided && o.enable(12);
                e.useDepthPacking && o.enable(13);
                e.dithering && o.enable(14);
                e.transmission && o.enable(15);
                e.sheen && o.enable(16);
                e.opaque && o.enable(17);
                e.pointsUvs && o.enable(18);
                t.push(o.mask);
            }(i, e), i.push(t.outputColorSpace)), i.push(e.customProgramCacheKey), i.join();
        },
        getUniforms: function(t) {
            const e = g[t.type];
            let i;
            if (e) {
                const t = Ti[e];
                i = ai.clone(t.uniforms);
            } else i = t.uniforms;
            return i;
        },
        acquireProgram: function(e, i) {
            let n;
            for (let t = 0, e = h.length; t < e; t++) {
                const e = h[t];
                if (e.cacheKey === i) {
                    n = e, ++n.usedTimes;
                    break;
                }
            }
            return void 0 === n && (n = new Sr(t, i, e, s), h.push(n)), n;
        },
        releaseProgram: function(t) {
            if (0 == --t.usedTimes) {
                const e = h.indexOf(t);
                h[e] = h[h.length - 1], h.pop(), t.destroy();
            }
        },
        releaseShaderCache: function(t) {
            l.remove(t);
        },
        programs: h,
        dispose: function() {
            l.dispose();
        }
    };
}

function Ar() {
    let t = new WeakMap;
    return {
        get: function(e) {
            let i = t.get(e);
            return void 0 === i && (i = {}, t.set(e, i)), i;
        },
        remove: function(e) {
            t.delete(e);
        },
        update: function(e, i, n) {
            t.get(e)[i] = n;
        },
        dispose: function() {
            t = new WeakMap;
        }
    };
}

function Cr(t, e) {
    return t.groupOrder !== e.groupOrder ? t.groupOrder - e.groupOrder : t.renderOrder !== e.renderOrder ? t.renderOrder - e.renderOrder : t.material.id !== e.material.id ? t.material.id - e.material.id : t.z !== e.z ? t.z - e.z : t.id - e.id;
}

function Pr(t, e) {
    return t.groupOrder !== e.groupOrder ? t.groupOrder - e.groupOrder : t.renderOrder !== e.renderOrder ? t.renderOrder - e.renderOrder : t.z !== e.z ? e.z - t.z : t.id - e.id;
}

function Rr() {
    const t = [];
    let e = 0;
    const i = [], n = [], r = [];
    function s(i, n, r, s, a, o) {
        let l = t[e];
        return void 0 === l ? (l = {
            id: i.id,
            object: i,
            geometry: n,
            material: r,
            groupOrder: s,
            renderOrder: i.renderOrder,
            z: a,
            group: o
        }, t[e] = l) : (l.id = i.id, l.object = i, l.geometry = n, l.material = r, l.groupOrder = s, 
        l.renderOrder = i.renderOrder, l.z = a, l.group = o), e++, l;
    }
    return {
        opaque: i,
        transmissive: n,
        transparent: r,
        init: function() {
            e = 0, i.length = 0, n.length = 0, r.length = 0;
        },
        push: function(t, e, a, o, l, h) {
            const c = s(t, e, a, o, l, h);
            a.transmission > 0 ? n.push(c) : !0 === a.transparent ? r.push(c) : i.push(c);
        },
        unshift: function(t, e, a, o, l, h) {
            const c = s(t, e, a, o, l, h);
            a.transmission > 0 ? n.unshift(c) : !0 === a.transparent ? r.unshift(c) : i.unshift(c);
        },
        finish: function() {
            for (let i = e, n = t.length; i < n; i++) {
                const e = t[i];
                if (null === e.id) break;
                e.id = null, e.object = null, e.geometry = null, e.material = null, e.group = null;
            }
        },
        sort: function(t, e) {
            i.length > 1 && i.sort(t || Cr), n.length > 1 && n.sort(e || Pr), r.length > 1 && r.sort(e || Pr);
        }
    };
}

function Lr() {
    let t = new WeakMap;
    return {
        get: function(e, i) {
            const n = t.get(e);
            let r;
            return void 0 === n ? (r = new Rr, t.set(e, [ r ])) : i >= n.length ? (r = new Rr, 
            n.push(r)) : r = n[i], r;
        },
        dispose: function() {
            t = new WeakMap;
        }
    };
}

function Dr() {
    const t = {};
    return {
        get: function(e) {
            if (void 0 !== t[e.id]) return t[e.id];
            let i;
            switch (e.type) {
              case "DirectionalLight":
                i = {
                    direction: new tt,
                    color: new ye
                };
                break;

              case "SpotLight":
                i = {
                    position: new tt,
                    direction: new tt,
                    color: new ye,
                    distance: 0,
                    coneCos: 0,
                    penumbraCos: 0,
                    decay: 0
                };
                break;

              case "PointLight":
                i = {
                    position: new tt,
                    color: new ye,
                    distance: 0,
                    decay: 0
                };
                break;

              case "HemisphereLight":
                i = {
                    direction: new tt,
                    skyColor: new ye,
                    groundColor: new ye
                };
                break;

              case "RectAreaLight":
                i = {
                    color: new ye,
                    position: new tt,
                    halfWidth: new tt,
                    halfHeight: new tt
                };
            }
            return t[e.id] = i, i;
        }
    };
}

let Ir = 0;

function Ur(t, e) {
    return (e.castShadow ? 2 : 0) - (t.castShadow ? 2 : 0) + (e.map ? 1 : 0) - (t.map ? 1 : 0);
}

function Nr(t, e) {
    const i = new Dr, n = function() {
        const t = {};
        return {
            get: function(e) {
                if (void 0 !== t[e.id]) return t[e.id];
                let i;
                switch (e.type) {
                  case "DirectionalLight":
                  case "SpotLight":
                    i = {
                        shadowBias: 0,
                        shadowNormalBias: 0,
                        shadowRadius: 1,
                        shadowMapSize: new P
                    };
                    break;

                  case "PointLight":
                    i = {
                        shadowBias: 0,
                        shadowNormalBias: 0,
                        shadowRadius: 1,
                        shadowMapSize: new P,
                        shadowCameraNear: 1,
                        shadowCameraFar: 1e3
                    };
                }
                return t[e.id] = i, i;
            }
        };
    }(), r = {
        version: 0,
        hash: {
            directionalLength: -1,
            pointLength: -1,
            spotLength: -1,
            rectAreaLength: -1,
            hemiLength: -1,
            numDirectionalShadows: -1,
            numPointShadows: -1,
            numSpotShadows: -1,
            numSpotMaps: -1
        },
        ambient: [ 0, 0, 0 ],
        probe: [],
        directional: [],
        directionalShadow: [],
        directionalShadowMap: [],
        directionalShadowMatrix: [],
        spot: [],
        spotLightMap: [],
        spotShadow: [],
        spotShadowMap: [],
        spotLightMatrix: [],
        rectArea: [],
        rectAreaLTC1: null,
        rectAreaLTC2: null,
        point: [],
        pointShadow: [],
        pointShadowMap: [],
        pointShadowMatrix: [],
        hemi: [],
        numSpotLightShadowsWithMaps: 0
    };
    for (let t = 0; t < 9; t++) r.probe.push(new tt);
    const s = new tt, a = new Rt, o = new Rt;
    return {
        setup: function(s, a) {
            let o = 0, l = 0, h = 0;
            for (let t = 0; t < 9; t++) r.probe[t].set(0, 0, 0);
            let c = 0, d = 0, u = 0, p = 0, g = 0, f = 0, m = 0, v = 0, _ = 0, x = 0;
            s.sort(Ur);
            const y = !0 === a ? Math.PI : 1;
            for (let t = 0, e = s.length; t < e; t++) {
                const e = s[t], a = e.color, b = e.intensity, S = e.distance, w = e.shadow && e.shadow.map ? e.shadow.map.texture : null;
                if (e.isAmbientLight) o += a.r * b * y, l += a.g * b * y, h += a.b * b * y; else if (e.isLightProbe) for (let t = 0; t < 9; t++) r.probe[t].addScaledVector(e.sh.coefficients[t], b); else if (e.isDirectionalLight) {
                    const t = i.get(e);
                    if (t.color.copy(e.color).multiplyScalar(e.intensity * y), e.castShadow) {
                        const t = e.shadow, i = n.get(e);
                        i.shadowBias = t.bias, i.shadowNormalBias = t.normalBias, i.shadowRadius = t.radius, 
                        i.shadowMapSize = t.mapSize, r.directionalShadow[c] = i, r.directionalShadowMap[c] = w, 
                        r.directionalShadowMatrix[c] = e.shadow.matrix, f++;
                    }
                    r.directional[c] = t, c++;
                } else if (e.isSpotLight) {
                    const t = i.get(e);
                    t.position.setFromMatrixPosition(e.matrixWorld), t.color.copy(a).multiplyScalar(b * y), 
                    t.distance = S, t.coneCos = Math.cos(e.angle), t.penumbraCos = Math.cos(e.angle * (1 - e.penumbra)), 
                    t.decay = e.decay, r.spot[u] = t;
                    const s = e.shadow;
                    if (e.map && (r.spotLightMap[_] = e.map, _++, s.updateMatrices(e), e.castShadow && x++), 
                    r.spotLightMatrix[u] = s.matrix, e.castShadow) {
                        const t = n.get(e);
                        t.shadowBias = s.bias, t.shadowNormalBias = s.normalBias, t.shadowRadius = s.radius, 
                        t.shadowMapSize = s.mapSize, r.spotShadow[u] = t, r.spotShadowMap[u] = w, v++;
                    }
                    u++;
                } else if (e.isRectAreaLight) {
                    const t = i.get(e);
                    t.color.copy(a).multiplyScalar(b), t.halfWidth.set(.5 * e.width, 0, 0), t.halfHeight.set(0, .5 * e.height, 0), 
                    r.rectArea[p] = t, p++;
                } else if (e.isPointLight) {
                    const t = i.get(e);
                    if (t.color.copy(e.color).multiplyScalar(e.intensity * y), t.distance = e.distance, 
                    t.decay = e.decay, e.castShadow) {
                        const t = e.shadow, i = n.get(e);
                        i.shadowBias = t.bias, i.shadowNormalBias = t.normalBias, i.shadowRadius = t.radius, 
                        i.shadowMapSize = t.mapSize, i.shadowCameraNear = t.camera.near, i.shadowCameraFar = t.camera.far, 
                        r.pointShadow[d] = i, r.pointShadowMap[d] = w, r.pointShadowMatrix[d] = e.shadow.matrix, 
                        m++;
                    }
                    r.point[d] = t, d++;
                } else if (e.isHemisphereLight) {
                    const t = i.get(e);
                    t.skyColor.copy(e.color).multiplyScalar(b * y), t.groundColor.copy(e.groundColor).multiplyScalar(b * y), 
                    r.hemi[g] = t, g++;
                }
            }
            p > 0 && (e.isWebGL2 || !0 === t.has("OES_texture_float_linear") ? (r.rectAreaLTC1 = Mi.LTC_FLOAT_1, 
            r.rectAreaLTC2 = Mi.LTC_FLOAT_2) : !0 === t.has("OES_texture_half_float_linear") ? (r.rectAreaLTC1 = Mi.LTC_HALF_1, 
            r.rectAreaLTC2 = Mi.LTC_HALF_2) : console.error("THREE.WebGLRenderer: Unable to use RectAreaLight. Missing WebGL extensions.")), 
            r.ambient[0] = o, r.ambient[1] = l, r.ambient[2] = h;
            const b = r.hash;
            b.directionalLength === c && b.pointLength === d && b.spotLength === u && b.rectAreaLength === p && b.hemiLength === g && b.numDirectionalShadows === f && b.numPointShadows === m && b.numSpotShadows === v && b.numSpotMaps === _ || (r.directional.length = c, 
            r.spot.length = u, r.rectArea.length = p, r.point.length = d, r.hemi.length = g, 
            r.directionalShadow.length = f, r.directionalShadowMap.length = f, r.pointShadow.length = m, 
            r.pointShadowMap.length = m, r.spotShadow.length = v, r.spotShadowMap.length = v, 
            r.directionalShadowMatrix.length = f, r.pointShadowMatrix.length = m, r.spotLightMatrix.length = v + _ - x, 
            r.spotLightMap.length = _, r.numSpotLightShadowsWithMaps = x, b.directionalLength = c, 
            b.pointLength = d, b.spotLength = u, b.rectAreaLength = p, b.hemiLength = g, b.numDirectionalShadows = f, 
            b.numPointShadows = m, b.numSpotShadows = v, b.numSpotMaps = _, r.version = Ir++);
        },
        setupView: function(t, e) {
            let i = 0, n = 0, l = 0, h = 0, c = 0;
            const d = e.matrixWorldInverse;
            for (let e = 0, u = t.length; e < u; e++) {
                const u = t[e];
                if (u.isDirectionalLight) {
                    const t = r.directional[i];
                    t.direction.setFromMatrixPosition(u.matrixWorld), s.setFromMatrixPosition(u.target.matrixWorld), 
                    t.direction.sub(s), t.direction.transformDirection(d), i++;
                } else if (u.isSpotLight) {
                    const t = r.spot[l];
                    t.position.setFromMatrixPosition(u.matrixWorld), t.position.applyMatrix4(d), t.direction.setFromMatrixPosition(u.matrixWorld), 
                    s.setFromMatrixPosition(u.target.matrixWorld), t.direction.sub(s), t.direction.transformDirection(d), 
                    l++;
                } else if (u.isRectAreaLight) {
                    const t = r.rectArea[h];
                    t.position.setFromMatrixPosition(u.matrixWorld), t.position.applyMatrix4(d), o.identity(), 
                    a.copy(u.matrixWorld), a.premultiply(d), o.extractRotation(a), t.halfWidth.set(.5 * u.width, 0, 0), 
                    t.halfHeight.set(0, .5 * u.height, 0), t.halfWidth.applyMatrix4(o), t.halfHeight.applyMatrix4(o), 
                    h++;
                } else if (u.isPointLight) {
                    const t = r.point[n];
                    t.position.setFromMatrixPosition(u.matrixWorld), t.position.applyMatrix4(d), n++;
                } else if (u.isHemisphereLight) {
                    const t = r.hemi[c];
                    t.direction.setFromMatrixPosition(u.matrixWorld), t.direction.transformDirection(d), 
                    c++;
                }
            }
        },
        state: r
    };
}

function Br(t, e) {
    const i = new Nr(t, e), n = [], r = [];
    return {
        init: function() {
            n.length = 0, r.length = 0;
        },
        state: {
            lightsArray: n,
            shadowsArray: r,
            lights: i
        },
        setupLights: function(t) {
            i.setup(n, t);
        },
        setupLightsView: function(t) {
            i.setupView(n, t);
        },
        pushLight: function(t) {
            n.push(t);
        },
        pushShadow: function(t) {
            r.push(t);
        }
    };
}

function Or(t, e) {
    let i = new WeakMap;
    return {
        get: function(n, r = 0) {
            const s = i.get(n);
            let a;
            return void 0 === s ? (a = new Br(t, e), i.set(n, [ a ])) : r >= s.length ? (a = new Br(t, e), 
            s.push(a)) : a = s[r], a;
        },
        dispose: function() {
            i = new WeakMap;
        }
    };
}

class Fr extends fe {
    constructor(t) {
        super(), this.isMeshDepthMaterial = !0, this.type = "MeshDepthMaterial", this.depthPacking = 3200, 
        this.map = null, this.alphaMap = null, this.displacementMap = null, this.displacementScale = 1, 
        this.displacementBias = 0, this.wireframe = !1, this.wireframeLinewidth = 1, this.setValues(t);
    }
    copy(t) {
        return super.copy(t), this.depthPacking = t.depthPacking, this.map = t.map, this.alphaMap = t.alphaMap, 
        this.displacementMap = t.displacementMap, this.displacementScale = t.displacementScale, 
        this.displacementBias = t.displacementBias, this.wireframe = t.wireframe, this.wireframeLinewidth = t.wireframeLinewidth, 
        this;
    }
}

class kr extends fe {
    constructor(t) {
        super(), this.isMeshDistanceMaterial = !0, this.type = "MeshDistanceMaterial", this.map = null, 
        this.alphaMap = null, this.displacementMap = null, this.displacementScale = 1, this.displacementBias = 0, 
        this.setValues(t);
    }
    copy(t) {
        return super.copy(t), this.map = t.map, this.alphaMap = t.alphaMap, this.displacementMap = t.displacementMap, 
        this.displacementScale = t.displacementScale, this.displacementBias = t.displacementBias, 
        this;
    }
}

function Hr(t, e, i) {
    let n = new xi;
    const r = new P, s = new P, a = new Y, o = new Fr({
        depthPacking: 3201
    }), l = new kr, h = {}, c = i.maxTextureSize, d = {
        0: 1,
        1: 0,
        2: 2
    }, u = new oi({
        defines: {
            VSM_SAMPLES: 8
        },
        uniforms: {
            shadow_pass: {
                value: null
            },
            resolution: {
                value: new P
            },
            radius: {
                value: 4
            }
        },
        vertexShader: "void main() {\n\tgl_Position = vec4( position, 1.0 );\n}",
        fragmentShader: "uniform sampler2D shadow_pass;\nuniform vec2 resolution;\nuniform float radius;\n#include <packing>\nvoid main() {\n\tconst float samples = float( VSM_SAMPLES );\n\tfloat mean = 0.0;\n\tfloat squared_mean = 0.0;\n\tfloat uvStride = samples <= 1.0 ? 0.0 : 2.0 / ( samples - 1.0 );\n\tfloat uvStart = samples <= 1.0 ? 0.0 : - 1.0;\n\tfor ( float i = 0.0; i < samples; i ++ ) {\n\t\tfloat uvOffset = uvStart + i * uvStride;\n\t\t#ifdef HORIZONTAL_PASS\n\t\t\tvec2 distribution = unpackRGBATo2Half( texture2D( shadow_pass, ( gl_FragCoord.xy + vec2( uvOffset, 0.0 ) * radius ) / resolution ) );\n\t\t\tmean += distribution.x;\n\t\t\tsquared_mean += distribution.y * distribution.y + distribution.x * distribution.x;\n\t\t#else\n\t\t\tfloat depth = unpackRGBAToDepth( texture2D( shadow_pass, ( gl_FragCoord.xy + vec2( 0.0, uvOffset ) * radius ) / resolution ) );\n\t\t\tmean += depth;\n\t\t\tsquared_mean += depth * depth;\n\t\t#endif\n\t}\n\tmean = mean / samples;\n\tsquared_mean = squared_mean / samples;\n\tfloat std_dev = sqrt( squared_mean - mean * mean );\n\tgl_FragColor = pack2HalfToRGBA( vec2( mean, std_dev ) );\n}"
    }), p = u.clone();
    p.defines.HORIZONTAL_PASS = 1;
    const g = new Be;
    g.setAttribute("position", new Te(new Float32Array([ -1, -1, .5, 3, -1, .5, -1, 3, .5 ]), 3));
    const f = new ti(g, u), m = this;
    this.enabled = !1, this.autoUpdate = !0, this.needsUpdate = !1, this.type = 1;
    let v = this.type;
    function _(i, n) {
        const s = e.update(f);
        u.defines.VSM_SAMPLES !== i.blurSamples && (u.defines.VSM_SAMPLES = i.blurSamples, 
        p.defines.VSM_SAMPLES = i.blurSamples, u.needsUpdate = !0, p.needsUpdate = !0), 
        null === i.mapPass && (i.mapPass = new Z(r.x, r.y)), u.uniforms.shadow_pass.value = i.map.texture, 
        u.uniforms.resolution.value = i.mapSize, u.uniforms.radius.value = i.radius, t.setRenderTarget(i.mapPass), 
        t.clear(), t.renderBufferDirect(n, null, s, u, f, null), p.uniforms.shadow_pass.value = i.mapPass.texture, 
        p.uniforms.resolution.value = i.mapSize, p.uniforms.radius.value = i.radius, t.setRenderTarget(i.map), 
        t.clear(), t.renderBufferDirect(n, null, s, p, f, null);
    }
    function x(e, i, n, r) {
        let s = null;
        const a = !0 === n.isPointLight ? e.customDistanceMaterial : e.customDepthMaterial;
        if (void 0 !== a) s = a; else if (s = !0 === n.isPointLight ? l : o, t.localClippingEnabled && !0 === i.clipShadows && Array.isArray(i.clippingPlanes) && 0 !== i.clippingPlanes.length || i.displacementMap && 0 !== i.displacementScale || i.alphaMap && i.alphaTest > 0 || i.map && i.alphaTest > 0) {
            const t = s.uuid, e = i.uuid;
            let n = h[t];
            void 0 === n && (n = {}, h[t] = n);
            let r = n[e];
            void 0 === r && (r = s.clone(), n[e] = r), s = r;
        }
        if (s.visible = i.visible, s.wireframe = i.wireframe, s.side = 3 === r ? null !== i.shadowSide ? i.shadowSide : i.side : null !== i.shadowSide ? i.shadowSide : d[i.side], 
        s.alphaMap = i.alphaMap, s.alphaTest = i.alphaTest, s.map = i.map, s.clipShadows = i.clipShadows, 
        s.clippingPlanes = i.clippingPlanes, s.clipIntersection = i.clipIntersection, s.displacementMap = i.displacementMap, 
        s.displacementScale = i.displacementScale, s.displacementBias = i.displacementBias, 
        s.wireframeLinewidth = i.wireframeLinewidth, s.linewidth = i.linewidth, !0 === n.isPointLight && !0 === s.isMeshDistanceMaterial) {
            t.properties.get(s).light = n;
        }
        return s;
    }
    function y(i, r, s, a, o) {
        if (!1 === i.visible) return;
        if (i.layers.test(r.layers) && (i.isMesh || i.isLine || i.isPoints) && (i.castShadow || i.receiveShadow && 3 === o) && (!i.frustumCulled || n.intersectsObject(i))) {
            i.modelViewMatrix.multiplyMatrices(s.matrixWorldInverse, i.matrixWorld);
            const n = e.update(i), r = i.material;
            if (Array.isArray(r)) {
                const e = n.groups;
                for (let l = 0, h = e.length; l < h; l++) {
                    const h = e[l], c = r[h.materialIndex];
                    if (c && c.visible) {
                        const e = x(i, c, a, o);
                        t.renderBufferDirect(s, null, n, e, i, h);
                    }
                }
            } else if (r.visible) {
                const e = x(i, r, a, o);
                t.renderBufferDirect(s, null, n, e, i, null);
            }
        }
        const l = i.children;
        for (let t = 0, e = l.length; t < e; t++) y(l[t], r, s, a, o);
    }
    this.render = function(e, i, o) {
        if (!1 === m.enabled) return;
        if (!1 === m.autoUpdate && !1 === m.needsUpdate) return;
        if (0 === e.length) return;
        const l = t.getRenderTarget(), h = t.getActiveCubeFace(), d = t.getActiveMipmapLevel(), u = t.state;
        u.setBlending(0), u.buffers.color.setClear(1, 1, 1, 1), u.buffers.depth.setTest(!0), 
        u.setScissorTest(!1);
        const p = 3 !== v && 3 === this.type, g = 3 === v && 3 !== this.type;
        for (let l = 0, h = e.length; l < h; l++) {
            const h = e[l], d = h.shadow;
            if (void 0 === d) {
                console.warn("THREE.WebGLShadowMap:", h, "has no shadow.");
                continue;
            }
            if (!1 === d.autoUpdate && !1 === d.needsUpdate) continue;
            r.copy(d.mapSize);
            const f = d.getFrameExtents();
            if (r.multiply(f), s.copy(d.mapSize), (r.x > c || r.y > c) && (r.x > c && (s.x = Math.floor(c / f.x), 
            r.x = s.x * f.x, d.mapSize.x = s.x), r.y > c && (s.y = Math.floor(c / f.y), r.y = s.y * f.y, 
            d.mapSize.y = s.y)), null === d.map || !0 === p || !0 === g) {
                const t = 3 !== this.type ? {
                    minFilter: 1003,
                    magFilter: 1003
                } : {};
                null !== d.map && d.map.dispose(), d.map = new Z(r.x, r.y, t), d.map.texture.name = h.name + ".shadowMap", 
                d.camera.updateProjectionMatrix();
            }
            t.setRenderTarget(d.map), t.clear();
            const m = d.getViewportCount();
            for (let t = 0; t < m; t++) {
                const e = d.getViewport(t);
                a.set(s.x * e.x, s.y * e.y, s.x * e.z, s.y * e.w), u.viewport(a), d.updateMatrices(h, t), 
                n = d.getFrustum(), y(i, o, d.camera, h, this.type);
            }
            !0 !== d.isPointLightShadow && 3 === this.type && _(d, o), d.needsUpdate = !1;
        }
        v = this.type, m.needsUpdate = !1, t.setRenderTarget(l, h, d);
    };
}

function zr(t, e, i) {
    const n = i.isWebGL2;
    const r = new function() {
        let e = !1;
        const i = new Y;
        let n = null;
        const r = new Y(0, 0, 0, 0);
        return {
            setMask: function(i) {
                n === i || e || (t.colorMask(i, i, i, i), n = i);
            },
            setLocked: function(t) {
                e = t;
            },
            setClear: function(e, n, s, a, o) {
                !0 === o && (e *= a, n *= a, s *= a), i.set(e, n, s, a), !1 === r.equals(i) && (t.clearColor(e, n, s, a), 
                r.copy(i));
            },
            reset: function() {
                e = !1, n = null, r.set(-1, 0, 0, 0);
            }
        };
    }, s = new function() {
        let e = !1, i = null, n = null, r = null;
        return {
            setTest: function(e) {
                e ? H(t.DEPTH_TEST) : z(t.DEPTH_TEST);
            },
            setMask: function(n) {
                i === n || e || (t.depthMask(n), i = n);
            },
            setFunc: function(e) {
                if (n !== e) {
                    switch (e) {
                      case 0:
                        t.depthFunc(t.NEVER);
                        break;

                      case 1:
                        t.depthFunc(t.ALWAYS);
                        break;

                      case 2:
                        t.depthFunc(t.LESS);
                        break;

                      case 3:
                      default:
                        t.depthFunc(t.LEQUAL);
                        break;

                      case 4:
                        t.depthFunc(t.EQUAL);
                        break;

                      case 5:
                        t.depthFunc(t.GEQUAL);
                        break;

                      case 6:
                        t.depthFunc(t.GREATER);
                        break;

                      case 7:
                        t.depthFunc(t.NOTEQUAL);
                    }
                    n = e;
                }
            },
            setLocked: function(t) {
                e = t;
            },
            setClear: function(e) {
                r !== e && (t.clearDepth(e), r = e);
            },
            reset: function() {
                e = !1, i = null, n = null, r = null;
            }
        };
    }, a = new function() {
        let e = !1, i = null, n = null, r = null, s = null, a = null, o = null, l = null, h = null;
        return {
            setTest: function(i) {
                e || (i ? H(t.STENCIL_TEST) : z(t.STENCIL_TEST));
            },
            setMask: function(n) {
                i === n || e || (t.stencilMask(n), i = n);
            },
            setFunc: function(e, i, a) {
                n === e && r === i && s === a || (t.stencilFunc(e, i, a), n = e, r = i, s = a);
            },
            setOp: function(e, i, n) {
                a === e && o === i && l === n || (t.stencilOp(e, i, n), a = e, o = i, l = n);
            },
            setLocked: function(t) {
                e = t;
            },
            setClear: function(e) {
                h !== e && (t.clearStencil(e), h = e);
            },
            reset: function() {
                e = !1, i = null, n = null, r = null, s = null, a = null, o = null, l = null, h = null;
            }
        };
    }, o = new WeakMap, l = new WeakMap;
    let h = {}, c = {}, d = new WeakMap, u = [], p = null, g = !1, f = null, m = null, v = null, _ = null, x = null, y = null, b = null, S = !1, w = null, M = null, T = null, E = null, A = null;
    const C = t.getParameter(t.MAX_COMBINED_TEXTURE_IMAGE_UNITS);
    let P = !1, R = 0;
    const L = t.getParameter(t.VERSION);
    -1 !== L.indexOf("WebGL") ? (R = parseFloat(/^WebGL (\d)/.exec(L)[1]), P = R >= 1) : -1 !== L.indexOf("OpenGL ES") && (R = parseFloat(/^OpenGL ES (\d)/.exec(L)[1]), 
    P = R >= 2);
    let D = null, I = {};
    const U = t.getParameter(t.SCISSOR_BOX), N = t.getParameter(t.VIEWPORT), B = (new Y).fromArray(U), O = (new Y).fromArray(N);
    function F(e, i, r, s) {
        const a = new Uint8Array(4), o = t.createTexture();
        t.bindTexture(e, o), t.texParameteri(e, t.TEXTURE_MIN_FILTER, t.NEAREST), t.texParameteri(e, t.TEXTURE_MAG_FILTER, t.NEAREST);
        for (let o = 0; o < r; o++) !n || e !== t.TEXTURE_3D && e !== t.TEXTURE_2D_ARRAY ? t.texImage2D(i + o, 0, t.RGBA, 1, 1, 0, t.RGBA, t.UNSIGNED_BYTE, a) : t.texImage3D(i, 0, t.RGBA, 1, 1, s, 0, t.RGBA, t.UNSIGNED_BYTE, a);
        return o;
    }
    const k = {};
    function H(e) {
        !0 !== h[e] && (t.enable(e), h[e] = !0);
    }
    function z(e) {
        !1 !== h[e] && (t.disable(e), h[e] = !1);
    }
    k[t.TEXTURE_2D] = F(t.TEXTURE_2D, t.TEXTURE_2D, 1), k[t.TEXTURE_CUBE_MAP] = F(t.TEXTURE_CUBE_MAP, t.TEXTURE_CUBE_MAP_POSITIVE_X, 6), 
    n && (k[t.TEXTURE_2D_ARRAY] = F(t.TEXTURE_2D_ARRAY, t.TEXTURE_2D_ARRAY, 1, 1), k[t.TEXTURE_3D] = F(t.TEXTURE_3D, t.TEXTURE_3D, 1, 1)), 
    r.setClear(0, 0, 0, 1), s.setClear(1), a.setClear(0), H(t.DEPTH_TEST), s.setFunc(3), 
    j(!1), X(1), H(t.CULL_FACE), W(0);
    const G = {
        100: t.FUNC_ADD,
        101: t.FUNC_SUBTRACT,
        102: t.FUNC_REVERSE_SUBTRACT
    };
    if (n) G[103] = t.MIN, G[104] = t.MAX; else {
        const t = e.get("EXT_blend_minmax");
        null !== t && (G[103] = t.MIN_EXT, G[104] = t.MAX_EXT);
    }
    const V = {
        200: t.ZERO,
        201: t.ONE,
        202: t.SRC_COLOR,
        204: t.SRC_ALPHA,
        210: t.SRC_ALPHA_SATURATE,
        208: t.DST_COLOR,
        206: t.DST_ALPHA,
        203: t.ONE_MINUS_SRC_COLOR,
        205: t.ONE_MINUS_SRC_ALPHA,
        209: t.ONE_MINUS_DST_COLOR,
        207: t.ONE_MINUS_DST_ALPHA
    };
    function W(e, i, n, r, s, a, o, l) {
        if (0 !== e) {
            if (!1 === g && (H(t.BLEND), g = !0), 5 === e) s = s || i, a = a || n, o = o || r, 
            i === m && s === x || (t.blendEquationSeparate(G[i], G[s]), m = i, x = s), n === v && r === _ && a === y && o === b || (t.blendFuncSeparate(V[n], V[r], V[a], V[o]), 
            v = n, _ = r, y = a, b = o), f = e, S = !1; else if (e !== f || l !== S) {
                if (100 === m && 100 === x || (t.blendEquation(t.FUNC_ADD), m = 100, x = 100), l) switch (e) {
                  case 1:
                    t.blendFuncSeparate(t.ONE, t.ONE_MINUS_SRC_ALPHA, t.ONE, t.ONE_MINUS_SRC_ALPHA);
                    break;

                  case 2:
                    t.blendFunc(t.ONE, t.ONE);
                    break;

                  case 3:
                    t.blendFuncSeparate(t.ZERO, t.ONE_MINUS_SRC_COLOR, t.ZERO, t.ONE);
                    break;

                  case 4:
                    t.blendFuncSeparate(t.ZERO, t.SRC_COLOR, t.ZERO, t.SRC_ALPHA);
                    break;

                  default:
                    console.error("THREE.WebGLState: Invalid blending: ", e);
                } else switch (e) {
                  case 1:
                    t.blendFuncSeparate(t.SRC_ALPHA, t.ONE_MINUS_SRC_ALPHA, t.ONE, t.ONE_MINUS_SRC_ALPHA);
                    break;

                  case 2:
                    t.blendFunc(t.SRC_ALPHA, t.ONE);
                    break;

                  case 3:
                    t.blendFuncSeparate(t.ZERO, t.ONE_MINUS_SRC_COLOR, t.ZERO, t.ONE);
                    break;

                  case 4:
                    t.blendFunc(t.ZERO, t.SRC_COLOR);
                    break;

                  default:
                    console.error("THREE.WebGLState: Invalid blending: ", e);
                }
                v = null, _ = null, y = null, b = null, f = e, S = l;
            }
        } else !0 === g && (z(t.BLEND), g = !1);
    }
    function j(e) {
        w !== e && (e ? t.frontFace(t.CW) : t.frontFace(t.CCW), w = e);
    }
    function X(e) {
        0 !== e ? (H(t.CULL_FACE), e !== M && (1 === e ? t.cullFace(t.BACK) : 2 === e ? t.cullFace(t.FRONT) : t.cullFace(t.FRONT_AND_BACK))) : z(t.CULL_FACE), 
        M = e;
    }
    function q(e, i, n) {
        e ? (H(t.POLYGON_OFFSET_FILL), E === i && A === n || (t.polygonOffset(i, n), E = i, 
        A = n)) : z(t.POLYGON_OFFSET_FILL);
    }
    return {
        buffers: {
            color: r,
            depth: s,
            stencil: a
        },
        enable: H,
        disable: z,
        bindFramebuffer: function(e, i) {
            return c[e] !== i && (t.bindFramebuffer(e, i), c[e] = i, n && (e === t.DRAW_FRAMEBUFFER && (c[t.FRAMEBUFFER] = i), 
            e === t.FRAMEBUFFER && (c[t.DRAW_FRAMEBUFFER] = i)), !0);
        },
        drawBuffers: function(n, r) {
            let s = u, a = !1;
            if (n) if (s = d.get(r), void 0 === s && (s = [], d.set(r, s)), n.isWebGLMultipleRenderTargets) {
                const e = n.texture;
                if (s.length !== e.length || s[0] !== t.COLOR_ATTACHMENT0) {
                    for (let i = 0, n = e.length; i < n; i++) s[i] = t.COLOR_ATTACHMENT0 + i;
                    s.length = e.length, a = !0;
                }
            } else s[0] !== t.COLOR_ATTACHMENT0 && (s[0] = t.COLOR_ATTACHMENT0, a = !0); else s[0] !== t.BACK && (s[0] = t.BACK, 
            a = !0);
            a && (i.isWebGL2 ? t.drawBuffers(s) : e.get("WEBGL_draw_buffers").drawBuffersWEBGL(s));
        },
        useProgram: function(e) {
            return p !== e && (t.useProgram(e), p = e, !0);
        },
        setBlending: W,
        setMaterial: function(e, i) {
            2 === e.side ? z(t.CULL_FACE) : H(t.CULL_FACE);
            let n = 1 === e.side;
            i && (n = !n), j(n), 1 === e.blending && !1 === e.transparent ? W(0) : W(e.blending, e.blendEquation, e.blendSrc, e.blendDst, e.blendEquationAlpha, e.blendSrcAlpha, e.blendDstAlpha, e.premultipliedAlpha), 
            s.setFunc(e.depthFunc), s.setTest(e.depthTest), s.setMask(e.depthWrite), r.setMask(e.colorWrite);
            const o = e.stencilWrite;
            a.setTest(o), o && (a.setMask(e.stencilWriteMask), a.setFunc(e.stencilFunc, e.stencilRef, e.stencilFuncMask), 
            a.setOp(e.stencilFail, e.stencilZFail, e.stencilZPass)), q(e.polygonOffset, e.polygonOffsetFactor, e.polygonOffsetUnits), 
            !0 === e.alphaToCoverage ? H(t.SAMPLE_ALPHA_TO_COVERAGE) : z(t.SAMPLE_ALPHA_TO_COVERAGE);
        },
        setFlipSided: j,
        setCullFace: X,
        setLineWidth: function(e) {
            e !== T && (P && t.lineWidth(e), T = e);
        },
        setPolygonOffset: q,
        setScissorTest: function(e) {
            e ? H(t.SCISSOR_TEST) : z(t.SCISSOR_TEST);
        },
        activeTexture: function(e) {
            void 0 === e && (e = t.TEXTURE0 + C - 1), D !== e && (t.activeTexture(e), D = e);
        },
        bindTexture: function(e, i, n) {
            void 0 === n && (n = null === D ? t.TEXTURE0 + C - 1 : D);
            let r = I[n];
            void 0 === r && (r = {
                type: void 0,
                texture: void 0
            }, I[n] = r), r.type === e && r.texture === i || (D !== n && (t.activeTexture(n), 
            D = n), t.bindTexture(e, i || k[e]), r.type = e, r.texture = i);
        },
        unbindTexture: function() {
            const e = I[D];
            void 0 !== e && void 0 !== e.type && (t.bindTexture(e.type, null), e.type = void 0, 
            e.texture = void 0);
        },
        compressedTexImage2D: function() {
            try {
                t.compressedTexImage2D.apply(t, arguments);
            } catch (t) {
                console.error("THREE.WebGLState:", t);
            }
        },
        compressedTexImage3D: function() {
            try {
                t.compressedTexImage3D.apply(t, arguments);
            } catch (t) {
                console.error("THREE.WebGLState:", t);
            }
        },
        texImage2D: function() {
            try {
                t.texImage2D.apply(t, arguments);
            } catch (t) {
                console.error("THREE.WebGLState:", t);
            }
        },
        texImage3D: function() {
            try {
                t.texImage3D.apply(t, arguments);
            } catch (t) {
                console.error("THREE.WebGLState:", t);
            }
        },
        updateUBOMapping: function(e, i) {
            let n = l.get(i);
            void 0 === n && (n = new WeakMap, l.set(i, n));
            let r = n.get(e);
            void 0 === r && (r = t.getUniformBlockIndex(i, e.name), n.set(e, r));
        },
        uniformBlockBinding: function(e, i) {
            const n = l.get(i).get(e);
            o.get(i) !== n && (t.uniformBlockBinding(i, n, e.__bindingPointIndex), o.set(i, n));
        },
        texStorage2D: function() {
            try {
                t.texStorage2D.apply(t, arguments);
            } catch (t) {
                console.error("THREE.WebGLState:", t);
            }
        },
        texStorage3D: function() {
            try {
                t.texStorage3D.apply(t, arguments);
            } catch (t) {
                console.error("THREE.WebGLState:", t);
            }
        },
        texSubImage2D: function() {
            try {
                t.texSubImage2D.apply(t, arguments);
            } catch (t) {
                console.error("THREE.WebGLState:", t);
            }
        },
        texSubImage3D: function() {
            try {
                t.texSubImage3D.apply(t, arguments);
            } catch (t) {
                console.error("THREE.WebGLState:", t);
            }
        },
        compressedTexSubImage2D: function() {
            try {
                t.compressedTexSubImage2D.apply(t, arguments);
            } catch (t) {
                console.error("THREE.WebGLState:", t);
            }
        },
        compressedTexSubImage3D: function() {
            try {
                t.compressedTexSubImage3D.apply(t, arguments);
            } catch (t) {
                console.error("THREE.WebGLState:", t);
            }
        },
        scissor: function(e) {
            !1 === B.equals(e) && (t.scissor(e.x, e.y, e.z, e.w), B.copy(e));
        },
        viewport: function(e) {
            !1 === O.equals(e) && (t.viewport(e.x, e.y, e.z, e.w), O.copy(e));
        },
        reset: function() {
            t.disable(t.BLEND), t.disable(t.CULL_FACE), t.disable(t.DEPTH_TEST), t.disable(t.POLYGON_OFFSET_FILL), 
            t.disable(t.SCISSOR_TEST), t.disable(t.STENCIL_TEST), t.disable(t.SAMPLE_ALPHA_TO_COVERAGE), 
            t.blendEquation(t.FUNC_ADD), t.blendFunc(t.ONE, t.ZERO), t.blendFuncSeparate(t.ONE, t.ZERO, t.ONE, t.ZERO), 
            t.colorMask(!0, !0, !0, !0), t.clearColor(0, 0, 0, 0), t.depthMask(!0), t.depthFunc(t.LESS), 
            t.clearDepth(1), t.stencilMask(4294967295), t.stencilFunc(t.ALWAYS, 0, 4294967295), 
            t.stencilOp(t.KEEP, t.KEEP, t.KEEP), t.clearStencil(0), t.cullFace(t.BACK), t.frontFace(t.CCW), 
            t.polygonOffset(0, 0), t.activeTexture(t.TEXTURE0), t.bindFramebuffer(t.FRAMEBUFFER, null), 
            !0 === n && (t.bindFramebuffer(t.DRAW_FRAMEBUFFER, null), t.bindFramebuffer(t.READ_FRAMEBUFFER, null)), 
            t.useProgram(null), t.lineWidth(1), t.scissor(0, 0, t.canvas.width, t.canvas.height), 
            t.viewport(0, 0, t.canvas.width, t.canvas.height), h = {}, D = null, I = {}, c = {}, 
            d = new WeakMap, u = [], p = null, g = !1, f = null, m = null, v = null, _ = null, 
            x = null, y = null, b = null, S = !1, w = null, M = null, T = null, E = null, A = null, 
            B.set(0, 0, t.canvas.width, t.canvas.height), O.set(0, 0, t.canvas.width, t.canvas.height), 
            r.reset(), s.reset(), a.reset();
        }
    };
}

function Gr(t, e, i, n, r, s, a) {
    const o = r.isWebGL2, l = r.maxTextures, h = r.maxCubemapSize, c = r.maxTextureSize, d = r.maxSamples, u = e.has("WEBGL_multisampled_render_to_texture") ? e.get("WEBGL_multisampled_render_to_texture") : null, p = "undefined" != typeof navigator && /OculusBrowser/g.test(navigator.userAgent), g = new WeakMap;
    let f;
    const m = new WeakMap;
    let v = !1;
    try {
        v = "undefined" != typeof OffscreenCanvas && null !== new OffscreenCanvas(1, 1).getContext("2d");
    } catch (t) {}
    function _(t, e) {
        return v ? new OffscreenCanvas(t, e) : I("canvas");
    }
    function x(t, e, i, n) {
        let r = 1;
        if ((t.width > n || t.height > n) && (r = n / Math.max(t.width, t.height)), r < 1 || !0 === e) {
            if ("undefined" != typeof HTMLImageElement && t instanceof HTMLImageElement || "undefined" != typeof HTMLCanvasElement && t instanceof HTMLCanvasElement || "undefined" != typeof ImageBitmap && t instanceof ImageBitmap) {
                const n = e ? T : Math.floor, s = n(r * t.width), a = n(r * t.height);
                void 0 === f && (f = _(s, a));
                const o = i ? _(s, a) : f;
                o.width = s, o.height = a;
                return o.getContext("2d").drawImage(t, 0, 0, s, a), console.warn("THREE.WebGLRenderer: Texture has been resized from (" + t.width + "x" + t.height + ") to (" + s + "x" + a + ")."), 
                o;
            }
            return "data" in t && console.warn("THREE.WebGLRenderer: Image in DataTexture is too big (" + t.width + "x" + t.height + ")."), 
            t;
        }
        return t;
    }
    function y(t) {
        return w(t.width) && w(t.height);
    }
    function b(t, e) {
        return t.generateMipmaps && e && 1003 !== t.minFilter && 1006 !== t.minFilter;
    }
    function S(e) {
        t.generateMipmap(e);
    }
    function M(i, n, r, s, a = !1) {
        if (!1 === o) return n;
        if (null !== i) {
            if (void 0 !== t[i]) return t[i];
            console.warn("THREE.WebGLRenderer: Attempt to use non-existing WebGL internal format '" + i + "'");
        }
        let l = n;
        return n === t.RED && (r === t.FLOAT && (l = t.R32F), r === t.HALF_FLOAT && (l = t.R16F), 
        r === t.UNSIGNED_BYTE && (l = t.R8)), n === t.RG && (r === t.FLOAT && (l = t.RG32F), 
        r === t.HALF_FLOAT && (l = t.RG16F), r === t.UNSIGNED_BYTE && (l = t.RG8)), n === t.RGBA && (r === t.FLOAT && (l = t.RGBA32F), 
        r === t.HALF_FLOAT && (l = t.RGBA16F), r === t.UNSIGNED_BYTE && (l = "srgb" === s && !1 === a ? t.SRGB8_ALPHA8 : t.RGBA8), 
        r === t.UNSIGNED_SHORT_4_4_4_4 && (l = t.RGBA4), r === t.UNSIGNED_SHORT_5_5_5_1 && (l = t.RGB5_A1)), 
        l !== t.R16F && l !== t.R32F && l !== t.RG16F && l !== t.RG32F && l !== t.RGBA16F && l !== t.RGBA32F || e.get("EXT_color_buffer_float"), 
        l;
    }
    function E(t, e, i) {
        return !0 === b(t, i) || t.isFramebufferTexture && 1003 !== t.minFilter && 1006 !== t.minFilter ? Math.log2(Math.max(e.width, e.height)) + 1 : void 0 !== t.mipmaps && t.mipmaps.length > 0 ? t.mipmaps.length : t.isCompressedTexture && Array.isArray(t.image) ? e.mipmaps.length : 1;
    }
    function A(e) {
        return 1003 === e || 1004 === e || 1005 === e ? t.NEAREST : t.LINEAR;
    }
    function C(t) {
        const e = t.target;
        e.removeEventListener("dispose", C), function(t) {
            const e = n.get(t);
            if (void 0 === e.__webglInit) return;
            const i = t.source, r = m.get(i);
            if (r) {
                const n = r[e.__cacheKey];
                n.usedTimes--, 0 === n.usedTimes && R(t), 0 === Object.keys(r).length && m.delete(i);
            }
            n.remove(t);
        }(e), e.isVideoTexture && g.delete(e);
    }
    function P(e) {
        const i = e.target;
        i.removeEventListener("dispose", P), function(e) {
            const i = e.texture, r = n.get(e), s = n.get(i);
            void 0 !== s.__webglTexture && (t.deleteTexture(s.__webglTexture), a.memory.textures--);
            e.depthTexture && e.depthTexture.dispose();
            if (e.isWebGLCubeRenderTarget) for (let e = 0; e < 6; e++) t.deleteFramebuffer(r.__webglFramebuffer[e]), 
            r.__webglDepthbuffer && t.deleteRenderbuffer(r.__webglDepthbuffer[e]); else {
                if (t.deleteFramebuffer(r.__webglFramebuffer), r.__webglDepthbuffer && t.deleteRenderbuffer(r.__webglDepthbuffer), 
                r.__webglMultisampledFramebuffer && t.deleteFramebuffer(r.__webglMultisampledFramebuffer), 
                r.__webglColorRenderbuffer) for (let e = 0; e < r.__webglColorRenderbuffer.length; e++) r.__webglColorRenderbuffer[e] && t.deleteRenderbuffer(r.__webglColorRenderbuffer[e]);
                r.__webglDepthRenderbuffer && t.deleteRenderbuffer(r.__webglDepthRenderbuffer);
            }
            if (e.isWebGLMultipleRenderTargets) for (let e = 0, r = i.length; e < r; e++) {
                const r = n.get(i[e]);
                r.__webglTexture && (t.deleteTexture(r.__webglTexture), a.memory.textures--), n.remove(i[e]);
            }
            n.remove(i), n.remove(e);
        }(i);
    }
    function R(e) {
        const i = n.get(e);
        t.deleteTexture(i.__webglTexture);
        const r = e.source;
        delete m.get(r)[i.__cacheKey], a.memory.textures--;
    }
    let L = 0;
    function D(e, r) {
        const s = n.get(e);
        if (e.isVideoTexture && function(t) {
            const e = a.render.frame;
            g.get(t) !== e && (g.set(t, e), t.update());
        }(e), !1 === e.isRenderTargetTexture && e.version > 0 && s.__version !== e.version) {
            const t = e.image;
            if (null === t) console.warn("THREE.WebGLRenderer: Texture marked for update but no image data found."); else {
                if (!1 !== t.complete) return void F(s, e, r);
                console.warn("THREE.WebGLRenderer: Texture marked for update but image is incomplete");
            }
        }
        i.bindTexture(t.TEXTURE_2D, s.__webglTexture, t.TEXTURE0 + r);
    }
    const U = {
        1e3: t.REPEAT,
        1001: t.CLAMP_TO_EDGE,
        1002: t.MIRRORED_REPEAT
    }, N = {
        1003: t.NEAREST,
        1004: t.NEAREST_MIPMAP_NEAREST,
        1005: t.NEAREST_MIPMAP_LINEAR,
        1006: t.LINEAR,
        1007: t.LINEAR_MIPMAP_NEAREST,
        1008: t.LINEAR_MIPMAP_LINEAR
    };
    function B(i, s, a) {
        if (a ? (t.texParameteri(i, t.TEXTURE_WRAP_S, U[s.wrapS]), t.texParameteri(i, t.TEXTURE_WRAP_T, U[s.wrapT]), 
        i !== t.TEXTURE_3D && i !== t.TEXTURE_2D_ARRAY || t.texParameteri(i, t.TEXTURE_WRAP_R, U[s.wrapR]), 
        t.texParameteri(i, t.TEXTURE_MAG_FILTER, N[s.magFilter]), t.texParameteri(i, t.TEXTURE_MIN_FILTER, N[s.minFilter])) : (t.texParameteri(i, t.TEXTURE_WRAP_S, t.CLAMP_TO_EDGE), 
        t.texParameteri(i, t.TEXTURE_WRAP_T, t.CLAMP_TO_EDGE), i !== t.TEXTURE_3D && i !== t.TEXTURE_2D_ARRAY || t.texParameteri(i, t.TEXTURE_WRAP_R, t.CLAMP_TO_EDGE), 
        1001 === s.wrapS && 1001 === s.wrapT || console.warn("THREE.WebGLRenderer: Texture is not power of two. Texture.wrapS and Texture.wrapT should be set to THREE.ClampToEdgeWrapping."), 
        t.texParameteri(i, t.TEXTURE_MAG_FILTER, A(s.magFilter)), t.texParameteri(i, t.TEXTURE_MIN_FILTER, A(s.minFilter)), 
        1003 !== s.minFilter && 1006 !== s.minFilter && console.warn("THREE.WebGLRenderer: Texture is not power of two. Texture.minFilter should be set to THREE.NearestFilter or THREE.LinearFilter.")), 
        !0 === e.has("EXT_texture_filter_anisotropic")) {
            const a = e.get("EXT_texture_filter_anisotropic");
            if (1003 === s.magFilter) return;
            if (1005 !== s.minFilter && 1008 !== s.minFilter) return;
            if (1015 === s.type && !1 === e.has("OES_texture_float_linear")) return;
            if (!1 === o && 1016 === s.type && !1 === e.has("OES_texture_half_float_linear")) return;
            (s.anisotropy > 1 || n.get(s).__currentAnisotropy) && (t.texParameterf(i, a.TEXTURE_MAX_ANISOTROPY_EXT, Math.min(s.anisotropy, r.getMaxAnisotropy())), 
            n.get(s).__currentAnisotropy = s.anisotropy);
        }
    }
    function O(e, i) {
        let n = !1;
        void 0 === e.__webglInit && (e.__webglInit = !0, i.addEventListener("dispose", C));
        const r = i.source;
        let s = m.get(r);
        void 0 === s && (s = {}, m.set(r, s));
        const o = function(t) {
            const e = [];
            return e.push(t.wrapS), e.push(t.wrapT), e.push(t.wrapR || 0), e.push(t.magFilter), 
            e.push(t.minFilter), e.push(t.anisotropy), e.push(t.internalFormat), e.push(t.format), 
            e.push(t.type), e.push(t.generateMipmaps), e.push(t.premultiplyAlpha), e.push(t.flipY), 
            e.push(t.unpackAlignment), e.push(t.colorSpace), e.join();
        }(i);
        if (o !== e.__cacheKey) {
            void 0 === s[o] && (s[o] = {
                texture: t.createTexture(),
                usedTimes: 0
            }, a.memory.textures++, n = !0), s[o].usedTimes++;
            const r = s[e.__cacheKey];
            void 0 !== r && (s[e.__cacheKey].usedTimes--, 0 === r.usedTimes && R(i)), e.__cacheKey = o, 
            e.__webglTexture = s[o].texture;
        }
        return n;
    }
    function F(e, r, a) {
        let l = t.TEXTURE_2D;
        (r.isDataArrayTexture || r.isCompressedArrayTexture) && (l = t.TEXTURE_2D_ARRAY), 
        r.isData3DTexture && (l = t.TEXTURE_3D);
        const h = O(e, r), d = r.source;
        i.bindTexture(l, e.__webglTexture, t.TEXTURE0 + a);
        const u = n.get(d);
        if (d.version !== u.__version || !0 === h) {
            i.activeTexture(t.TEXTURE0 + a), t.pixelStorei(t.UNPACK_FLIP_Y_WEBGL, r.flipY), 
            t.pixelStorei(t.UNPACK_PREMULTIPLY_ALPHA_WEBGL, r.premultiplyAlpha), t.pixelStorei(t.UNPACK_ALIGNMENT, r.unpackAlignment), 
            t.pixelStorei(t.UNPACK_COLORSPACE_CONVERSION_WEBGL, t.NONE);
            const e = function(t) {
                return !o && (1001 !== t.wrapS || 1001 !== t.wrapT || 1003 !== t.minFilter && 1006 !== t.minFilter);
            }(r) && !1 === y(r.image);
            let n = x(r.image, e, !1, c);
            n = j(r, n);
            const p = y(n) || o, g = s.convert(r.format, r.colorSpace);
            let f, m = s.convert(r.type), v = M(r.internalFormat, g, m, r.colorSpace);
            B(l, r, p);
            const _ = r.mipmaps, w = o && !0 !== r.isVideoTexture, T = void 0 === u.__version || !0 === h, A = E(r, n, p);
            if (r.isDepthTexture) v = t.DEPTH_COMPONENT, o ? v = 1015 === r.type ? t.DEPTH_COMPONENT32F : 1014 === r.type ? t.DEPTH_COMPONENT24 : 1020 === r.type ? t.DEPTH24_STENCIL8 : t.DEPTH_COMPONENT16 : 1015 === r.type && console.error("WebGLRenderer: Floating point depth texture requires WebGL2."), 
            1026 === r.format && v === t.DEPTH_COMPONENT && 1012 !== r.type && 1014 !== r.type && (console.warn("THREE.WebGLRenderer: Use UnsignedShortType or UnsignedIntType for DepthFormat DepthTexture."), 
            r.type = 1014, m = s.convert(r.type)), 1027 === r.format && v === t.DEPTH_COMPONENT && (v = t.DEPTH_STENCIL, 
            1020 !== r.type && (console.warn("THREE.WebGLRenderer: Use UnsignedInt248Type for DepthStencilFormat DepthTexture."), 
            r.type = 1020, m = s.convert(r.type))), T && (w ? i.texStorage2D(t.TEXTURE_2D, 1, v, n.width, n.height) : i.texImage2D(t.TEXTURE_2D, 0, v, n.width, n.height, 0, g, m, null)); else if (r.isDataTexture) if (_.length > 0 && p) {
                w && T && i.texStorage2D(t.TEXTURE_2D, A, v, _[0].width, _[0].height);
                for (let e = 0, n = _.length; e < n; e++) f = _[e], w ? i.texSubImage2D(t.TEXTURE_2D, e, 0, 0, f.width, f.height, g, m, f.data) : i.texImage2D(t.TEXTURE_2D, e, v, f.width, f.height, 0, g, m, f.data);
                r.generateMipmaps = !1;
            } else w ? (T && i.texStorage2D(t.TEXTURE_2D, A, v, n.width, n.height), i.texSubImage2D(t.TEXTURE_2D, 0, 0, 0, n.width, n.height, g, m, n.data)) : i.texImage2D(t.TEXTURE_2D, 0, v, n.width, n.height, 0, g, m, n.data); else if (r.isCompressedTexture) if (r.isCompressedArrayTexture) {
                w && T && i.texStorage3D(t.TEXTURE_2D_ARRAY, A, v, _[0].width, _[0].height, n.depth);
                for (let e = 0, s = _.length; e < s; e++) f = _[e], 1023 !== r.format ? null !== g ? w ? i.compressedTexSubImage3D(t.TEXTURE_2D_ARRAY, e, 0, 0, 0, f.width, f.height, n.depth, g, f.data, 0, 0) : i.compressedTexImage3D(t.TEXTURE_2D_ARRAY, e, v, f.width, f.height, n.depth, 0, f.data, 0, 0) : console.warn("THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()") : w ? i.texSubImage3D(t.TEXTURE_2D_ARRAY, e, 0, 0, 0, f.width, f.height, n.depth, g, m, f.data) : i.texImage3D(t.TEXTURE_2D_ARRAY, e, v, f.width, f.height, n.depth, 0, g, m, f.data);
            } else {
                w && T && i.texStorage2D(t.TEXTURE_2D, A, v, _[0].width, _[0].height);
                for (let e = 0, n = _.length; e < n; e++) f = _[e], 1023 !== r.format ? null !== g ? w ? i.compressedTexSubImage2D(t.TEXTURE_2D, e, 0, 0, f.width, f.height, g, f.data) : i.compressedTexImage2D(t.TEXTURE_2D, e, v, f.width, f.height, 0, f.data) : console.warn("THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()") : w ? i.texSubImage2D(t.TEXTURE_2D, e, 0, 0, f.width, f.height, g, m, f.data) : i.texImage2D(t.TEXTURE_2D, e, v, f.width, f.height, 0, g, m, f.data);
            } else if (r.isDataArrayTexture) w ? (T && i.texStorage3D(t.TEXTURE_2D_ARRAY, A, v, n.width, n.height, n.depth), 
            i.texSubImage3D(t.TEXTURE_2D_ARRAY, 0, 0, 0, 0, n.width, n.height, n.depth, g, m, n.data)) : i.texImage3D(t.TEXTURE_2D_ARRAY, 0, v, n.width, n.height, n.depth, 0, g, m, n.data); else if (r.isData3DTexture) w ? (T && i.texStorage3D(t.TEXTURE_3D, A, v, n.width, n.height, n.depth), 
            i.texSubImage3D(t.TEXTURE_3D, 0, 0, 0, 0, n.width, n.height, n.depth, g, m, n.data)) : i.texImage3D(t.TEXTURE_3D, 0, v, n.width, n.height, n.depth, 0, g, m, n.data); else if (r.isFramebufferTexture) {
                if (T) if (w) i.texStorage2D(t.TEXTURE_2D, A, v, n.width, n.height); else {
                    let e = n.width, r = n.height;
                    for (let n = 0; n < A; n++) i.texImage2D(t.TEXTURE_2D, n, v, e, r, 0, g, m, null), 
                    e >>= 1, r >>= 1;
                }
            } else if (_.length > 0 && p) {
                w && T && i.texStorage2D(t.TEXTURE_2D, A, v, _[0].width, _[0].height);
                for (let e = 0, n = _.length; e < n; e++) f = _[e], w ? i.texSubImage2D(t.TEXTURE_2D, e, 0, 0, g, m, f) : i.texImage2D(t.TEXTURE_2D, e, v, g, m, f);
                r.generateMipmaps = !1;
            } else w ? (T && i.texStorage2D(t.TEXTURE_2D, A, v, n.width, n.height), i.texSubImage2D(t.TEXTURE_2D, 0, 0, 0, g, m, n)) : i.texImage2D(t.TEXTURE_2D, 0, v, g, m, n);
            b(r, p) && S(l), u.__version = d.version, r.onUpdate && r.onUpdate(r);
        }
        e.__version = r.version;
    }
    function k(e, r, a, o, l) {
        const h = s.convert(a.format, a.colorSpace), c = s.convert(a.type), d = M(a.internalFormat, h, c, a.colorSpace);
        n.get(r).__hasExternalTextures || (l === t.TEXTURE_3D || l === t.TEXTURE_2D_ARRAY ? i.texImage3D(l, 0, d, r.width, r.height, r.depth, 0, h, c, null) : i.texImage2D(l, 0, d, r.width, r.height, 0, h, c, null)), 
        i.bindFramebuffer(t.FRAMEBUFFER, e), V(r) ? u.framebufferTexture2DMultisampleEXT(t.FRAMEBUFFER, o, l, n.get(a).__webglTexture, 0, G(r)) : (l === t.TEXTURE_2D || l >= t.TEXTURE_CUBE_MAP_POSITIVE_X && l <= t.TEXTURE_CUBE_MAP_NEGATIVE_Z) && t.framebufferTexture2D(t.FRAMEBUFFER, o, l, n.get(a).__webglTexture, 0), 
        i.bindFramebuffer(t.FRAMEBUFFER, null);
    }
    function H(e, i, n) {
        if (t.bindRenderbuffer(t.RENDERBUFFER, e), i.depthBuffer && !i.stencilBuffer) {
            let r = t.DEPTH_COMPONENT16;
            if (n || V(i)) {
                const e = i.depthTexture;
                e && e.isDepthTexture && (1015 === e.type ? r = t.DEPTH_COMPONENT32F : 1014 === e.type && (r = t.DEPTH_COMPONENT24));
                const n = G(i);
                V(i) ? u.renderbufferStorageMultisampleEXT(t.RENDERBUFFER, n, r, i.width, i.height) : t.renderbufferStorageMultisample(t.RENDERBUFFER, n, r, i.width, i.height);
            } else t.renderbufferStorage(t.RENDERBUFFER, r, i.width, i.height);
            t.framebufferRenderbuffer(t.FRAMEBUFFER, t.DEPTH_ATTACHMENT, t.RENDERBUFFER, e);
        } else if (i.depthBuffer && i.stencilBuffer) {
            const r = G(i);
            n && !1 === V(i) ? t.renderbufferStorageMultisample(t.RENDERBUFFER, r, t.DEPTH24_STENCIL8, i.width, i.height) : V(i) ? u.renderbufferStorageMultisampleEXT(t.RENDERBUFFER, r, t.DEPTH24_STENCIL8, i.width, i.height) : t.renderbufferStorage(t.RENDERBUFFER, t.DEPTH_STENCIL, i.width, i.height), 
            t.framebufferRenderbuffer(t.FRAMEBUFFER, t.DEPTH_STENCIL_ATTACHMENT, t.RENDERBUFFER, e);
        } else {
            const e = !0 === i.isWebGLMultipleRenderTargets ? i.texture : [ i.texture ];
            for (let r = 0; r < e.length; r++) {
                const a = e[r], o = s.convert(a.format, a.colorSpace), l = s.convert(a.type), h = M(a.internalFormat, o, l, a.colorSpace), c = G(i);
                n && !1 === V(i) ? t.renderbufferStorageMultisample(t.RENDERBUFFER, c, h, i.width, i.height) : V(i) ? u.renderbufferStorageMultisampleEXT(t.RENDERBUFFER, c, h, i.width, i.height) : t.renderbufferStorage(t.RENDERBUFFER, h, i.width, i.height);
            }
        }
        t.bindRenderbuffer(t.RENDERBUFFER, null);
    }
    function z(e) {
        const r = n.get(e), s = !0 === e.isWebGLCubeRenderTarget;
        if (e.depthTexture && !r.__autoAllocateDepthBuffer) {
            if (s) throw new Error("target.depthTexture not supported in Cube render targets");
            !function(e, r) {
                if (r && r.isWebGLCubeRenderTarget) throw new Error("Depth Texture with cube render targets is not supported");
                if (i.bindFramebuffer(t.FRAMEBUFFER, e), !r.depthTexture || !r.depthTexture.isDepthTexture) throw new Error("renderTarget.depthTexture must be an instance of THREE.DepthTexture");
                n.get(r.depthTexture).__webglTexture && r.depthTexture.image.width === r.width && r.depthTexture.image.height === r.height || (r.depthTexture.image.width = r.width, 
                r.depthTexture.image.height = r.height, r.depthTexture.needsUpdate = !0), D(r.depthTexture, 0);
                const s = n.get(r.depthTexture).__webglTexture, a = G(r);
                if (1026 === r.depthTexture.format) V(r) ? u.framebufferTexture2DMultisampleEXT(t.FRAMEBUFFER, t.DEPTH_ATTACHMENT, t.TEXTURE_2D, s, 0, a) : t.framebufferTexture2D(t.FRAMEBUFFER, t.DEPTH_ATTACHMENT, t.TEXTURE_2D, s, 0); else {
                    if (1027 !== r.depthTexture.format) throw new Error("Unknown depthTexture format");
                    V(r) ? u.framebufferTexture2DMultisampleEXT(t.FRAMEBUFFER, t.DEPTH_STENCIL_ATTACHMENT, t.TEXTURE_2D, s, 0, a) : t.framebufferTexture2D(t.FRAMEBUFFER, t.DEPTH_STENCIL_ATTACHMENT, t.TEXTURE_2D, s, 0);
                }
            }(r.__webglFramebuffer, e);
        } else if (s) {
            r.__webglDepthbuffer = [];
            for (let n = 0; n < 6; n++) i.bindFramebuffer(t.FRAMEBUFFER, r.__webglFramebuffer[n]), 
            r.__webglDepthbuffer[n] = t.createRenderbuffer(), H(r.__webglDepthbuffer[n], e, !1);
        } else i.bindFramebuffer(t.FRAMEBUFFER, r.__webglFramebuffer), r.__webglDepthbuffer = t.createRenderbuffer(), 
        H(r.__webglDepthbuffer, e, !1);
        i.bindFramebuffer(t.FRAMEBUFFER, null);
    }
    function G(t) {
        return Math.min(d, t.samples);
    }
    function V(t) {
        const i = n.get(t);
        return o && t.samples > 0 && !0 === e.has("WEBGL_multisampled_render_to_texture") && !1 !== i.__useRenderToTexture;
    }
    function j(t, i) {
        const n = t.colorSpace, r = t.format, s = t.type;
        return !0 === t.isCompressedTexture || 1035 === t.format || "srgb-linear" !== n && "" !== n && ("srgb" === n ? !1 === o ? !0 === e.has("EXT_sRGB") && 1023 === r ? (t.format = 1035, 
        t.minFilter = 1006, t.generateMipmaps = !1) : i = W.sRGBToLinear(i) : 1023 === r && 1009 === s || console.warn("THREE.WebGLTextures: sRGB encoded textures have to use RGBAFormat and UnsignedByteType.") : console.error("THREE.WebGLTextures: Unsupported texture color space:", n)), 
        i;
    }
    this.allocateTextureUnit = function() {
        const t = L;
        return t >= l && console.warn("THREE.WebGLTextures: Trying to use " + t + " texture units while this GPU supports only " + l), 
        L += 1, t;
    }, this.resetTextureUnits = function() {
        L = 0;
    }, this.setTexture2D = D, this.setTexture2DArray = function(e, r) {
        const s = n.get(e);
        e.version > 0 && s.__version !== e.version ? F(s, e, r) : i.bindTexture(t.TEXTURE_2D_ARRAY, s.__webglTexture, t.TEXTURE0 + r);
    }, this.setTexture3D = function(e, r) {
        const s = n.get(e);
        e.version > 0 && s.__version !== e.version ? F(s, e, r) : i.bindTexture(t.TEXTURE_3D, s.__webglTexture, t.TEXTURE0 + r);
    }, this.setTextureCube = function(e, r) {
        const a = n.get(e);
        e.version > 0 && a.__version !== e.version ? function(e, r, a) {
            if (6 !== r.image.length) return;
            const l = O(e, r), c = r.source;
            i.bindTexture(t.TEXTURE_CUBE_MAP, e.__webglTexture, t.TEXTURE0 + a);
            const d = n.get(c);
            if (c.version !== d.__version || !0 === l) {
                i.activeTexture(t.TEXTURE0 + a), t.pixelStorei(t.UNPACK_FLIP_Y_WEBGL, r.flipY), 
                t.pixelStorei(t.UNPACK_PREMULTIPLY_ALPHA_WEBGL, r.premultiplyAlpha), t.pixelStorei(t.UNPACK_ALIGNMENT, r.unpackAlignment), 
                t.pixelStorei(t.UNPACK_COLORSPACE_CONVERSION_WEBGL, t.NONE);
                const e = r.isCompressedTexture || r.image[0].isCompressedTexture, n = r.image[0] && r.image[0].isDataTexture, u = [];
                for (let t = 0; t < 6; t++) u[t] = e || n ? n ? r.image[t].image : r.image[t] : x(r.image[t], !1, !0, h), 
                u[t] = j(r, u[t]);
                const p = u[0], g = y(p) || o, f = s.convert(r.format, r.colorSpace), m = s.convert(r.type), v = M(r.internalFormat, f, m, r.colorSpace), _ = o && !0 !== r.isVideoTexture, w = void 0 === d.__version || !0 === l;
                let T, A = E(r, p, g);
                if (B(t.TEXTURE_CUBE_MAP, r, g), e) {
                    _ && w && i.texStorage2D(t.TEXTURE_CUBE_MAP, A, v, p.width, p.height);
                    for (let e = 0; e < 6; e++) {
                        T = u[e].mipmaps;
                        for (let n = 0; n < T.length; n++) {
                            const s = T[n];
                            1023 !== r.format ? null !== f ? _ ? i.compressedTexSubImage2D(t.TEXTURE_CUBE_MAP_POSITIVE_X + e, n, 0, 0, s.width, s.height, f, s.data) : i.compressedTexImage2D(t.TEXTURE_CUBE_MAP_POSITIVE_X + e, n, v, s.width, s.height, 0, s.data) : console.warn("THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .setTextureCube()") : _ ? i.texSubImage2D(t.TEXTURE_CUBE_MAP_POSITIVE_X + e, n, 0, 0, s.width, s.height, f, m, s.data) : i.texImage2D(t.TEXTURE_CUBE_MAP_POSITIVE_X + e, n, v, s.width, s.height, 0, f, m, s.data);
                        }
                    }
                } else {
                    T = r.mipmaps, _ && w && (T.length > 0 && A++, i.texStorage2D(t.TEXTURE_CUBE_MAP, A, v, u[0].width, u[0].height));
                    for (let e = 0; e < 6; e++) if (n) {
                        _ ? i.texSubImage2D(t.TEXTURE_CUBE_MAP_POSITIVE_X + e, 0, 0, 0, u[e].width, u[e].height, f, m, u[e].data) : i.texImage2D(t.TEXTURE_CUBE_MAP_POSITIVE_X + e, 0, v, u[e].width, u[e].height, 0, f, m, u[e].data);
                        for (let n = 0; n < T.length; n++) {
                            const r = T[n].image[e].image;
                            _ ? i.texSubImage2D(t.TEXTURE_CUBE_MAP_POSITIVE_X + e, n + 1, 0, 0, r.width, r.height, f, m, r.data) : i.texImage2D(t.TEXTURE_CUBE_MAP_POSITIVE_X + e, n + 1, v, r.width, r.height, 0, f, m, r.data);
                        }
                    } else {
                        _ ? i.texSubImage2D(t.TEXTURE_CUBE_MAP_POSITIVE_X + e, 0, 0, 0, f, m, u[e]) : i.texImage2D(t.TEXTURE_CUBE_MAP_POSITIVE_X + e, 0, v, f, m, u[e]);
                        for (let n = 0; n < T.length; n++) {
                            const r = T[n];
                            _ ? i.texSubImage2D(t.TEXTURE_CUBE_MAP_POSITIVE_X + e, n + 1, 0, 0, f, m, r.image[e]) : i.texImage2D(t.TEXTURE_CUBE_MAP_POSITIVE_X + e, n + 1, v, f, m, r.image[e]);
                        }
                    }
                }
                b(r, g) && S(t.TEXTURE_CUBE_MAP), d.__version = c.version, r.onUpdate && r.onUpdate(r);
            }
            e.__version = r.version;
        }(a, e, r) : i.bindTexture(t.TEXTURE_CUBE_MAP, a.__webglTexture, t.TEXTURE0 + r);
    }, this.rebindTextures = function(e, i, r) {
        const s = n.get(e);
        void 0 !== i && k(s.__webglFramebuffer, e, e.texture, t.COLOR_ATTACHMENT0, t.TEXTURE_2D), 
        void 0 !== r && z(e);
    }, this.setupRenderTarget = function(e) {
        const l = e.texture, h = n.get(e), c = n.get(l);
        e.addEventListener("dispose", P), !0 !== e.isWebGLMultipleRenderTargets && (void 0 === c.__webglTexture && (c.__webglTexture = t.createTexture()), 
        c.__version = l.version, a.memory.textures++);
        const d = !0 === e.isWebGLCubeRenderTarget, u = !0 === e.isWebGLMultipleRenderTargets, p = y(e) || o;
        if (d) {
            h.__webglFramebuffer = [];
            for (let e = 0; e < 6; e++) h.__webglFramebuffer[e] = t.createFramebuffer();
        } else {
            if (h.__webglFramebuffer = t.createFramebuffer(), u) if (r.drawBuffers) {
                const i = e.texture;
                for (let e = 0, r = i.length; e < r; e++) {
                    const r = n.get(i[e]);
                    void 0 === r.__webglTexture && (r.__webglTexture = t.createTexture(), a.memory.textures++);
                }
            } else console.warn("THREE.WebGLRenderer: WebGLMultipleRenderTargets can only be used with WebGL2 or WEBGL_draw_buffers extension.");
            if (o && e.samples > 0 && !1 === V(e)) {
                const n = u ? l : [ l ];
                h.__webglMultisampledFramebuffer = t.createFramebuffer(), h.__webglColorRenderbuffer = [], 
                i.bindFramebuffer(t.FRAMEBUFFER, h.__webglMultisampledFramebuffer);
                for (let i = 0; i < n.length; i++) {
                    const r = n[i];
                    h.__webglColorRenderbuffer[i] = t.createRenderbuffer(), t.bindRenderbuffer(t.RENDERBUFFER, h.__webglColorRenderbuffer[i]);
                    const a = s.convert(r.format, r.colorSpace), o = s.convert(r.type), l = M(r.internalFormat, a, o, r.colorSpace, !0 === e.isXRRenderTarget), c = G(e);
                    t.renderbufferStorageMultisample(t.RENDERBUFFER, c, l, e.width, e.height), t.framebufferRenderbuffer(t.FRAMEBUFFER, t.COLOR_ATTACHMENT0 + i, t.RENDERBUFFER, h.__webglColorRenderbuffer[i]);
                }
                t.bindRenderbuffer(t.RENDERBUFFER, null), e.depthBuffer && (h.__webglDepthRenderbuffer = t.createRenderbuffer(), 
                H(h.__webglDepthRenderbuffer, e, !0)), i.bindFramebuffer(t.FRAMEBUFFER, null);
            }
        }
        if (d) {
            i.bindTexture(t.TEXTURE_CUBE_MAP, c.__webglTexture), B(t.TEXTURE_CUBE_MAP, l, p);
            for (let i = 0; i < 6; i++) k(h.__webglFramebuffer[i], e, l, t.COLOR_ATTACHMENT0, t.TEXTURE_CUBE_MAP_POSITIVE_X + i);
            b(l, p) && S(t.TEXTURE_CUBE_MAP), i.unbindTexture();
        } else if (u) {
            const r = e.texture;
            for (let s = 0, a = r.length; s < a; s++) {
                const a = r[s], o = n.get(a);
                i.bindTexture(t.TEXTURE_2D, o.__webglTexture), B(t.TEXTURE_2D, a, p), k(h.__webglFramebuffer, e, a, t.COLOR_ATTACHMENT0 + s, t.TEXTURE_2D), 
                b(a, p) && S(t.TEXTURE_2D);
            }
            i.unbindTexture();
        } else {
            let n = t.TEXTURE_2D;
            (e.isWebGL3DRenderTarget || e.isWebGLArrayRenderTarget) && (o ? n = e.isWebGL3DRenderTarget ? t.TEXTURE_3D : t.TEXTURE_2D_ARRAY : console.error("THREE.WebGLTextures: THREE.Data3DTexture and THREE.DataArrayTexture only supported with WebGL2.")), 
            i.bindTexture(n, c.__webglTexture), B(n, l, p), k(h.__webglFramebuffer, e, l, t.COLOR_ATTACHMENT0, n), 
            b(l, p) && S(n), i.unbindTexture();
        }
        e.depthBuffer && z(e);
    }, this.updateRenderTargetMipmap = function(e) {
        const r = y(e) || o, s = !0 === e.isWebGLMultipleRenderTargets ? e.texture : [ e.texture ];
        for (let a = 0, o = s.length; a < o; a++) {
            const o = s[a];
            if (b(o, r)) {
                const r = e.isWebGLCubeRenderTarget ? t.TEXTURE_CUBE_MAP : t.TEXTURE_2D, s = n.get(o).__webglTexture;
                i.bindTexture(r, s), S(r), i.unbindTexture();
            }
        }
    }, this.updateMultisampleRenderTarget = function(e) {
        if (o && e.samples > 0 && !1 === V(e)) {
            const r = e.isWebGLMultipleRenderTargets ? e.texture : [ e.texture ], s = e.width, a = e.height;
            let o = t.COLOR_BUFFER_BIT;
            const l = [], h = e.stencilBuffer ? t.DEPTH_STENCIL_ATTACHMENT : t.DEPTH_ATTACHMENT, c = n.get(e), d = !0 === e.isWebGLMultipleRenderTargets;
            if (d) for (let e = 0; e < r.length; e++) i.bindFramebuffer(t.FRAMEBUFFER, c.__webglMultisampledFramebuffer), 
            t.framebufferRenderbuffer(t.FRAMEBUFFER, t.COLOR_ATTACHMENT0 + e, t.RENDERBUFFER, null), 
            i.bindFramebuffer(t.FRAMEBUFFER, c.__webglFramebuffer), t.framebufferTexture2D(t.DRAW_FRAMEBUFFER, t.COLOR_ATTACHMENT0 + e, t.TEXTURE_2D, null, 0);
            i.bindFramebuffer(t.READ_FRAMEBUFFER, c.__webglMultisampledFramebuffer), i.bindFramebuffer(t.DRAW_FRAMEBUFFER, c.__webglFramebuffer);
            for (let i = 0; i < r.length; i++) {
                l.push(t.COLOR_ATTACHMENT0 + i), e.depthBuffer && l.push(h);
                const u = void 0 !== c.__ignoreDepthValues && c.__ignoreDepthValues;
                if (!1 === u && (e.depthBuffer && (o |= t.DEPTH_BUFFER_BIT), e.stencilBuffer && (o |= t.STENCIL_BUFFER_BIT)), 
                d && t.framebufferRenderbuffer(t.READ_FRAMEBUFFER, t.COLOR_ATTACHMENT0, t.RENDERBUFFER, c.__webglColorRenderbuffer[i]), 
                !0 === u && (t.invalidateFramebuffer(t.READ_FRAMEBUFFER, [ h ]), t.invalidateFramebuffer(t.DRAW_FRAMEBUFFER, [ h ])), 
                d) {
                    const e = n.get(r[i]).__webglTexture;
                    t.framebufferTexture2D(t.DRAW_FRAMEBUFFER, t.COLOR_ATTACHMENT0, t.TEXTURE_2D, e, 0);
                }
                t.blitFramebuffer(0, 0, s, a, 0, 0, s, a, o, t.NEAREST), p && t.invalidateFramebuffer(t.READ_FRAMEBUFFER, l);
            }
            if (i.bindFramebuffer(t.READ_FRAMEBUFFER, null), i.bindFramebuffer(t.DRAW_FRAMEBUFFER, null), 
            d) for (let e = 0; e < r.length; e++) {
                i.bindFramebuffer(t.FRAMEBUFFER, c.__webglMultisampledFramebuffer), t.framebufferRenderbuffer(t.FRAMEBUFFER, t.COLOR_ATTACHMENT0 + e, t.RENDERBUFFER, c.__webglColorRenderbuffer[e]);
                const s = n.get(r[e]).__webglTexture;
                i.bindFramebuffer(t.FRAMEBUFFER, c.__webglFramebuffer), t.framebufferTexture2D(t.DRAW_FRAMEBUFFER, t.COLOR_ATTACHMENT0 + e, t.TEXTURE_2D, s, 0);
            }
            i.bindFramebuffer(t.DRAW_FRAMEBUFFER, c.__webglMultisampledFramebuffer);
        }
    }, this.setupDepthRenderbuffer = z, this.setupFrameBufferTexture = k, this.useMultisampledRTT = V;
}

function Vr(t, e, i) {
    const n = i.isWebGL2;
    return {
        convert: function(i, r = "") {
            let s;
            if (1009 === i) return t.UNSIGNED_BYTE;
            if (1017 === i) return t.UNSIGNED_SHORT_4_4_4_4;
            if (1018 === i) return t.UNSIGNED_SHORT_5_5_5_1;
            if (1010 === i) return t.BYTE;
            if (1011 === i) return t.SHORT;
            if (1012 === i) return t.UNSIGNED_SHORT;
            if (1013 === i) return t.INT;
            if (1014 === i) return t.UNSIGNED_INT;
            if (1015 === i) return t.FLOAT;
            if (1016 === i) return n ? t.HALF_FLOAT : (s = e.get("OES_texture_half_float"), 
            null !== s ? s.HALF_FLOAT_OES : null);
            if (1021 === i) return t.ALPHA;
            if (1023 === i) return t.RGBA;
            if (1024 === i) return t.LUMINANCE;
            if (1025 === i) return t.LUMINANCE_ALPHA;
            if (1026 === i) return t.DEPTH_COMPONENT;
            if (1027 === i) return t.DEPTH_STENCIL;
            if (1035 === i) return s = e.get("EXT_sRGB"), null !== s ? s.SRGB_ALPHA_EXT : null;
            if (1028 === i) return t.RED;
            if (1029 === i) return t.RED_INTEGER;
            if (1030 === i) return t.RG;
            if (1031 === i) return t.RG_INTEGER;
            if (1033 === i) return t.RGBA_INTEGER;
            if (33776 === i || 33777 === i || 33778 === i || 33779 === i) if ("srgb" === r) {
                if (s = e.get("WEBGL_compressed_texture_s3tc_srgb"), null === s) return null;
                if (33776 === i) return s.COMPRESSED_SRGB_S3TC_DXT1_EXT;
                if (33777 === i) return s.COMPRESSED_SRGB_ALPHA_S3TC_DXT1_EXT;
                if (33778 === i) return s.COMPRESSED_SRGB_ALPHA_S3TC_DXT3_EXT;
                if (33779 === i) return s.COMPRESSED_SRGB_ALPHA_S3TC_DXT5_EXT;
            } else {
                if (s = e.get("WEBGL_compressed_texture_s3tc"), null === s) return null;
                if (33776 === i) return s.COMPRESSED_RGB_S3TC_DXT1_EXT;
                if (33777 === i) return s.COMPRESSED_RGBA_S3TC_DXT1_EXT;
                if (33778 === i) return s.COMPRESSED_RGBA_S3TC_DXT3_EXT;
                if (33779 === i) return s.COMPRESSED_RGBA_S3TC_DXT5_EXT;
            }
            if (35840 === i || 35841 === i || 35842 === i || 35843 === i) {
                if (s = e.get("WEBGL_compressed_texture_pvrtc"), null === s) return null;
                if (35840 === i) return s.COMPRESSED_RGB_PVRTC_4BPPV1_IMG;
                if (35841 === i) return s.COMPRESSED_RGB_PVRTC_2BPPV1_IMG;
                if (35842 === i) return s.COMPRESSED_RGBA_PVRTC_4BPPV1_IMG;
                if (35843 === i) return s.COMPRESSED_RGBA_PVRTC_2BPPV1_IMG;
            }
            if (36196 === i) return s = e.get("WEBGL_compressed_texture_etc1"), null !== s ? s.COMPRESSED_RGB_ETC1_WEBGL : null;
            if (37492 === i || 37496 === i) {
                if (s = e.get("WEBGL_compressed_texture_etc"), null === s) return null;
                if (37492 === i) return "srgb" === r ? s.COMPRESSED_SRGB8_ETC2 : s.COMPRESSED_RGB8_ETC2;
                if (37496 === i) return "srgb" === r ? s.COMPRESSED_SRGB8_ALPHA8_ETC2_EAC : s.COMPRESSED_RGBA8_ETC2_EAC;
            }
            if (37808 === i || 37809 === i || 37810 === i || 37811 === i || 37812 === i || 37813 === i || 37814 === i || 37815 === i || 37816 === i || 37817 === i || 37818 === i || 37819 === i || 37820 === i || 37821 === i) {
                if (s = e.get("WEBGL_compressed_texture_astc"), null === s) return null;
                if (37808 === i) return "srgb" === r ? s.COMPRESSED_SRGB8_ALPHA8_ASTC_4x4_KHR : s.COMPRESSED_RGBA_ASTC_4x4_KHR;
                if (37809 === i) return "srgb" === r ? s.COMPRESSED_SRGB8_ALPHA8_ASTC_5x4_KHR : s.COMPRESSED_RGBA_ASTC_5x4_KHR;
                if (37810 === i) return "srgb" === r ? s.COMPRESSED_SRGB8_ALPHA8_ASTC_5x5_KHR : s.COMPRESSED_RGBA_ASTC_5x5_KHR;
                if (37811 === i) return "srgb" === r ? s.COMPRESSED_SRGB8_ALPHA8_ASTC_6x5_KHR : s.COMPRESSED_RGBA_ASTC_6x5_KHR;
                if (37812 === i) return "srgb" === r ? s.COMPRESSED_SRGB8_ALPHA8_ASTC_6x6_KHR : s.COMPRESSED_RGBA_ASTC_6x6_KHR;
                if (37813 === i) return "srgb" === r ? s.COMPRESSED_SRGB8_ALPHA8_ASTC_8x5_KHR : s.COMPRESSED_RGBA_ASTC_8x5_KHR;
                if (37814 === i) return "srgb" === r ? s.COMPRESSED_SRGB8_ALPHA8_ASTC_8x6_KHR : s.COMPRESSED_RGBA_ASTC_8x6_KHR;
                if (37815 === i) return "srgb" === r ? s.COMPRESSED_SRGB8_ALPHA8_ASTC_8x8_KHR : s.COMPRESSED_RGBA_ASTC_8x8_KHR;
                if (37816 === i) return "srgb" === r ? s.COMPRESSED_SRGB8_ALPHA8_ASTC_10x5_KHR : s.COMPRESSED_RGBA_ASTC_10x5_KHR;
                if (37817 === i) return "srgb" === r ? s.COMPRESSED_SRGB8_ALPHA8_ASTC_10x6_KHR : s.COMPRESSED_RGBA_ASTC_10x6_KHR;
                if (37818 === i) return "srgb" === r ? s.COMPRESSED_SRGB8_ALPHA8_ASTC_10x8_KHR : s.COMPRESSED_RGBA_ASTC_10x8_KHR;
                if (37819 === i) return "srgb" === r ? s.COMPRESSED_SRGB8_ALPHA8_ASTC_10x10_KHR : s.COMPRESSED_RGBA_ASTC_10x10_KHR;
                if (37820 === i) return "srgb" === r ? s.COMPRESSED_SRGB8_ALPHA8_ASTC_12x10_KHR : s.COMPRESSED_RGBA_ASTC_12x10_KHR;
                if (37821 === i) return "srgb" === r ? s.COMPRESSED_SRGB8_ALPHA8_ASTC_12x12_KHR : s.COMPRESSED_RGBA_ASTC_12x12_KHR;
            }
            if (36492 === i) {
                if (s = e.get("EXT_texture_compression_bptc"), null === s) return null;
                if (36492 === i) return "srgb" === r ? s.COMPRESSED_SRGB_ALPHA_BPTC_UNORM_EXT : s.COMPRESSED_RGBA_BPTC_UNORM_EXT;
            }
            if (36283 === i || 36284 === i || 36285 === i || 36286 === i) {
                if (s = e.get("EXT_texture_compression_rgtc"), null === s) return null;
                if (36492 === i) return s.COMPRESSED_RED_RGTC1_EXT;
                if (36284 === i) return s.COMPRESSED_SIGNED_RED_RGTC1_EXT;
                if (36285 === i) return s.COMPRESSED_RED_GREEN_RGTC2_EXT;
                if (36286 === i) return s.COMPRESSED_SIGNED_RED_GREEN_RGTC2_EXT;
            }
            return 1020 === i ? n ? t.UNSIGNED_INT_24_8 : (s = e.get("WEBGL_depth_texture"), 
            null !== s ? s.UNSIGNED_INT_24_8_WEBGL : null) : void 0 !== t[i] ? t[i] : null;
        }
    };
}

class Wr extends hi {
    constructor(t = []) {
        super(), this.isArrayCamera = !0, this.cameras = t;
    }
}

class jr extends ee {
    constructor() {
        super(), this.isGroup = !0, this.type = "Group";
    }
}

const Xr = {
    type: "move"
};

class qr {
    constructor() {
        this._targetRay = null, this._grip = null, this._hand = null;
    }
    getHandSpace() {
        return null === this._hand && (this._hand = new jr, this._hand.matrixAutoUpdate = !1, 
        this._hand.visible = !1, this._hand.joints = {}, this._hand.inputState = {
            pinching: !1
        }), this._hand;
    }
    getTargetRaySpace() {
        return null === this._targetRay && (this._targetRay = new jr, this._targetRay.matrixAutoUpdate = !1, 
        this._targetRay.visible = !1, this._targetRay.hasLinearVelocity = !1, this._targetRay.linearVelocity = new tt, 
        this._targetRay.hasAngularVelocity = !1, this._targetRay.angularVelocity = new tt), 
        this._targetRay;
    }
    getGripSpace() {
        return null === this._grip && (this._grip = new jr, this._grip.matrixAutoUpdate = !1, 
        this._grip.visible = !1, this._grip.hasLinearVelocity = !1, this._grip.linearVelocity = new tt, 
        this._grip.hasAngularVelocity = !1, this._grip.angularVelocity = new tt), this._grip;
    }
    dispatchEvent(t) {
        return null !== this._targetRay && this._targetRay.dispatchEvent(t), null !== this._grip && this._grip.dispatchEvent(t), 
        null !== this._hand && this._hand.dispatchEvent(t), this;
    }
    connect(t) {
        if (t && t.hand) {
            const e = this._hand;
            if (e) for (const i of t.hand.values()) this._getHandJoint(e, i);
        }
        return this.dispatchEvent({
            type: "connected",
            data: t
        }), this;
    }
    disconnect(t) {
        return this.dispatchEvent({
            type: "disconnected",
            data: t
        }), null !== this._targetRay && (this._targetRay.visible = !1), null !== this._grip && (this._grip.visible = !1), 
        null !== this._hand && (this._hand.visible = !1), this;
    }
    update(t, e, i) {
        let n = null, r = null, s = null;
        const a = this._targetRay, o = this._grip, l = this._hand;
        if (t && "visible-blurred" !== e.session.visibilityState) {
            if (l && t.hand) {
                s = !0;
                for (const n of t.hand.values()) {
                    const t = e.getJointPose(n, i), r = this._getHandJoint(l, n);
                    null !== t && (r.matrix.fromArray(t.transform.matrix), r.matrix.decompose(r.position, r.rotation, r.scale), 
                    r.matrixWorldNeedsUpdate = !0, r.jointRadius = t.radius), r.visible = null !== t;
                }
                const n = l.joints["index-finger-tip"], r = l.joints["thumb-tip"], a = n.position.distanceTo(r.position), o = .02, h = .005;
                l.inputState.pinching && a > o + h ? (l.inputState.pinching = !1, this.dispatchEvent({
                    type: "pinchend",
                    handedness: t.handedness,
                    target: this
                })) : !l.inputState.pinching && a <= o - h && (l.inputState.pinching = !0, this.dispatchEvent({
                    type: "pinchstart",
                    handedness: t.handedness,
                    target: this
                }));
            } else null !== o && t.gripSpace && (r = e.getPose(t.gripSpace, i), null !== r && (o.matrix.fromArray(r.transform.matrix), 
            o.matrix.decompose(o.position, o.rotation, o.scale), o.matrixWorldNeedsUpdate = !0, 
            r.linearVelocity ? (o.hasLinearVelocity = !0, o.linearVelocity.copy(r.linearVelocity)) : o.hasLinearVelocity = !1, 
            r.angularVelocity ? (o.hasAngularVelocity = !0, o.angularVelocity.copy(r.angularVelocity)) : o.hasAngularVelocity = !1));
            null !== a && (n = e.getPose(t.targetRaySpace, i), null === n && null !== r && (n = r), 
            null !== n && (a.matrix.fromArray(n.transform.matrix), a.matrix.decompose(a.position, a.rotation, a.scale), 
            a.matrixWorldNeedsUpdate = !0, n.linearVelocity ? (a.hasLinearVelocity = !0, a.linearVelocity.copy(n.linearVelocity)) : a.hasLinearVelocity = !1, 
            n.angularVelocity ? (a.hasAngularVelocity = !0, a.angularVelocity.copy(n.angularVelocity)) : a.hasAngularVelocity = !1, 
            this.dispatchEvent(Xr)));
        }
        return null !== a && (a.visible = null !== n), null !== o && (o.visible = null !== r), 
        null !== l && (l.visible = null !== s), this;
    }
    _getHandJoint(t, e) {
        if (void 0 === t.joints[e.jointName]) {
            const i = new jr;
            i.matrixAutoUpdate = !1, i.visible = !1, t.joints[e.jointName] = i, t.add(i);
        }
        return t.joints[e.jointName];
    }
}

class Kr extends K {
    constructor(t, e, i, n, r, s, a, o, l, h) {
        if (1026 !== (h = void 0 !== h ? h : 1026) && 1027 !== h) throw new Error("DepthTexture format must be either THREE.DepthFormat or THREE.DepthStencilFormat");
        void 0 === i && 1026 === h && (i = 1014), void 0 === i && 1027 === h && (i = 1020), 
        super(null, n, r, s, a, o, h, i, l), this.isDepthTexture = !0, this.image = {
            width: t,
            height: e
        }, this.magFilter = void 0 !== a ? a : 1003, this.minFilter = void 0 !== o ? o : 1003, 
        this.flipY = !1, this.generateMipmaps = !1;
    }
}

class Yr extends g {
    constructor(t, e) {
        super();
        const i = this;
        let n = null, r = 1, s = null, a = "local-floor", o = 1, l = null, h = null, c = null, d = null, u = null, p = null;
        const g = e.getContextAttributes();
        let f = null, m = null;
        const v = [], x = [], y = new Set, b = new Map, S = new hi;
        S.layers.enable(1), S.viewport = new Y;
        const w = new hi;
        w.layers.enable(2), w.viewport = new Y;
        const M = [ S, w ], T = new Wr;
        T.layers.enable(1), T.layers.enable(2);
        let E = null, A = null;
        function C(t) {
            const e = x.indexOf(t.inputSource);
            if (-1 === e) return;
            const i = v[e];
            void 0 !== i && (i.update(t.inputSource, t.frame, l || s), i.dispatchEvent({
                type: t.type,
                data: t.inputSource
            }));
        }
        function P() {
            n.removeEventListener("select", C), n.removeEventListener("selectstart", C), n.removeEventListener("selectend", C), 
            n.removeEventListener("squeeze", C), n.removeEventListener("squeezestart", C), n.removeEventListener("squeezeend", C), 
            n.removeEventListener("end", P), n.removeEventListener("inputsourceschange", R);
            for (let t = 0; t < v.length; t++) {
                const e = x[t];
                null !== e && (x[t] = null, v[t].disconnect(e));
            }
            E = null, A = null, t.setRenderTarget(f), u = null, d = null, c = null, n = null, 
            m = null, N.stop(), i.isPresenting = !1, i.dispatchEvent({
                type: "sessionend"
            });
        }
        function R(t) {
            for (let e = 0; e < t.removed.length; e++) {
                const i = t.removed[e], n = x.indexOf(i);
                n >= 0 && (x[n] = null, v[n].disconnect(i));
            }
            for (let e = 0; e < t.added.length; e++) {
                const i = t.added[e];
                let n = x.indexOf(i);
                if (-1 === n) {
                    for (let t = 0; t < v.length; t++) {
                        if (t >= x.length) {
                            x.push(i), n = t;
                            break;
                        }
                        if (null === x[t]) {
                            x[t] = i, n = t;
                            break;
                        }
                    }
                    if (-1 === n) break;
                }
                const r = v[n];
                r && r.connect(i);
            }
        }
        this.cameraAutoUpdate = !0, this.enabled = !1, this.isPresenting = !1, this.getController = function(t) {
            let e = v[t];
            return void 0 === e && (e = new qr, v[t] = e), e.getTargetRaySpace();
        }, this.getControllerGrip = function(t) {
            let e = v[t];
            return void 0 === e && (e = new qr, v[t] = e), e.getGripSpace();
        }, this.getHand = function(t) {
            let e = v[t];
            return void 0 === e && (e = new qr, v[t] = e), e.getHandSpace();
        }, this.setFramebufferScaleFactor = function(t) {
            r = t, !0 === i.isPresenting && console.warn("THREE.WebXRManager: Cannot change framebuffer scale while presenting.");
        }, this.setReferenceSpaceType = function(t) {
            a = t, !0 === i.isPresenting && console.warn("THREE.WebXRManager: Cannot change reference space type while presenting.");
        }, this.getReferenceSpace = function() {
            return l || s;
        }, this.setReferenceSpace = function(t) {
            l = t;
        }, this.getBaseLayer = function() {
            return null !== d ? d : u;
        }, this.getBinding = function() {
            return c;
        }, this.getFrame = function() {
            return p;
        }, this.getSession = function() {
            return n;
        }, this.setSession = async function(h) {
            if (n = h, null !== n) {
                if (f = t.getRenderTarget(), n.addEventListener("select", C), n.addEventListener("selectstart", C), 
                n.addEventListener("selectend", C), n.addEventListener("squeeze", C), n.addEventListener("squeezestart", C), 
                n.addEventListener("squeezeend", C), n.addEventListener("end", P), n.addEventListener("inputsourceschange", R), 
                !0 !== g.xrCompatible && await e.makeXRCompatible(), void 0 === n.renderState.layers || !1 === t.capabilities.isWebGL2) {
                    const i = {
                        antialias: void 0 !== n.renderState.layers || g.antialias,
                        alpha: !0,
                        depth: g.depth,
                        stencil: g.stencil,
                        framebufferScaleFactor: r
                    };
                    u = new XRWebGLLayer(n, e, i), n.updateRenderState({
                        baseLayer: u
                    }), m = new Z(u.framebufferWidth, u.framebufferHeight, {
                        format: 1023,
                        type: 1009,
                        colorSpace: t.outputColorSpace,
                        stencilBuffer: g.stencil
                    });
                } else {
                    let i = null, s = null, a = null;
                    g.depth && (a = g.stencil ? e.DEPTH24_STENCIL8 : e.DEPTH_COMPONENT24, i = g.stencil ? 1027 : 1026, 
                    s = g.stencil ? 1020 : 1014);
                    const o = {
                        colorFormat: e.RGBA8,
                        depthFormat: a,
                        scaleFactor: r
                    };
                    c = new XRWebGLBinding(n, e), d = c.createProjectionLayer(o), n.updateRenderState({
                        layers: [ d ]
                    }), m = new Z(d.textureWidth, d.textureHeight, {
                        format: 1023,
                        type: 1009,
                        depthTexture: new Kr(d.textureWidth, d.textureHeight, s, void 0, void 0, void 0, void 0, void 0, void 0, i),
                        stencilBuffer: g.stencil,
                        colorSpace: t.outputColorSpace,
                        samples: g.antialias ? 4 : 0
                    });
                    t.properties.get(m).__ignoreDepthValues = d.ignoreDepthValues;
                }
                m.isXRRenderTarget = !0, this.setFoveation(o), l = null, s = await n.requestReferenceSpace(a), 
                N.setContext(n), N.start(), i.isPresenting = !0, i.dispatchEvent({
                    type: "sessionstart"
                });
            }
        }, this.getEnvironmentBlendMode = function() {
            if (null !== n) return n.environmentBlendMode;
        };
        const L = new tt, D = new tt;
        function I(t, e) {
            null === e ? t.matrixWorld.copy(t.matrix) : t.matrixWorld.multiplyMatrices(e.matrixWorld, t.matrix), 
            t.matrixWorldInverse.copy(t.matrixWorld).invert();
        }
        this.updateCamera = function(t) {
            if (null === n) return;
            T.near = w.near = S.near = t.near, T.far = w.far = S.far = t.far, E === T.near && A === T.far || (n.updateRenderState({
                depthNear: T.near,
                depthFar: T.far
            }), E = T.near, A = T.far);
            const e = t.parent, i = T.cameras;
            I(T, e);
            for (let t = 0; t < i.length; t++) I(i[t], e);
            2 === i.length ? function(t, e, i) {
                L.setFromMatrixPosition(e.matrixWorld), D.setFromMatrixPosition(i.matrixWorld);
                const n = L.distanceTo(D), r = e.projectionMatrix.elements, s = i.projectionMatrix.elements, a = r[14] / (r[10] - 1), o = r[14] / (r[10] + 1), l = (r[9] + 1) / r[5], h = (r[9] - 1) / r[5], c = (r[8] - 1) / r[0], d = (s[8] + 1) / s[0], u = a * c, p = a * d, g = n / (-c + d), f = g * -c;
                e.matrixWorld.decompose(t.position, t.quaternion, t.scale), t.translateX(f), t.translateZ(g), 
                t.matrixWorld.compose(t.position, t.quaternion, t.scale), t.matrixWorldInverse.copy(t.matrixWorld).invert();
                const m = a + g, v = o + g, _ = u - f, x = p + (n - f), y = l * o / v * m, b = h * o / v * m;
                t.projectionMatrix.makePerspective(_, x, y, b, m, v), t.projectionMatrixInverse.copy(t.projectionMatrix).invert();
            }(T, S, w) : T.projectionMatrix.copy(S.projectionMatrix), function(t, e, i) {
                null === i ? t.matrix.copy(e.matrixWorld) : (t.matrix.copy(i.matrixWorld), t.matrix.invert(), 
                t.matrix.multiply(e.matrixWorld));
                t.matrix.decompose(t.position, t.quaternion, t.scale), t.updateMatrixWorld(!0);
                const n = t.children;
                for (let t = 0, e = n.length; t < e; t++) n[t].updateMatrixWorld(!0);
                t.projectionMatrix.copy(e.projectionMatrix), t.projectionMatrixInverse.copy(e.projectionMatrixInverse), 
                t.isPerspectiveCamera && (t.fov = 2 * _ * Math.atan(1 / t.projectionMatrix.elements[5]), 
                t.zoom = 1);
            }(t, T, e);
        }, this.getCamera = function() {
            return T;
        }, this.getFoveation = function() {
            if (null !== d || null !== u) return o;
        }, this.setFoveation = function(t) {
            o = t, null !== d && (d.fixedFoveation = t), null !== u && void 0 !== u.fixedFoveation && (u.fixedFoveation = t);
        }, this.getPlanes = function() {
            return y;
        };
        let U = null;
        const N = new yi;
        N.setAnimationLoop((function(e, n) {
            if (h = n.getViewerPose(l || s), p = n, null !== h) {
                const e = h.views;
                null !== u && (t.setRenderTargetFramebuffer(m, u.framebuffer), t.setRenderTarget(m));
                let i = !1;
                e.length !== T.cameras.length && (T.cameras.length = 0, i = !0);
                for (let n = 0; n < e.length; n++) {
                    const r = e[n];
                    let s = null;
                    if (null !== u) s = u.getViewport(r); else {
                        const e = c.getViewSubImage(d, r);
                        s = e.viewport, 0 === n && (t.setRenderTargetTextures(m, e.colorTexture, d.ignoreDepthValues ? void 0 : e.depthStencilTexture), 
                        t.setRenderTarget(m));
                    }
                    let a = M[n];
                    void 0 === a && (a = new hi, a.layers.enable(n), a.viewport = new Y, M[n] = a), 
                    a.matrix.fromArray(r.transform.matrix), a.matrix.decompose(a.position, a.quaternion, a.scale), 
                    a.projectionMatrix.fromArray(r.projectionMatrix), a.projectionMatrixInverse.copy(a.projectionMatrix).invert(), 
                    a.viewport.set(s.x, s.y, s.width, s.height), 0 === n && (T.matrix.copy(a.matrix), 
                    T.matrix.decompose(T.position, T.quaternion, T.scale)), !0 === i && T.cameras.push(a);
                }
            }
            for (let t = 0; t < v.length; t++) {
                const e = x[t], i = v[t];
                null !== e && void 0 !== i && i.update(e, n, l || s);
            }
            if (U && U(e, n), n.detectedPlanes) {
                i.dispatchEvent({
                    type: "planesdetected",
                    data: n.detectedPlanes
                });
                let t = null;
                for (const e of y) n.detectedPlanes.has(e) || (null === t && (t = []), t.push(e));
                if (null !== t) for (const e of t) y.delete(e), b.delete(e), i.dispatchEvent({
                    type: "planeremoved",
                    data: e
                });
                for (const t of n.detectedPlanes) if (y.has(t)) {
                    const e = b.get(t);
                    t.lastChangedTime > e && (b.set(t, t.lastChangedTime), i.dispatchEvent({
                        type: "planechanged",
                        data: t
                    }));
                } else y.add(t), b.set(t, n.lastChangedTime), i.dispatchEvent({
                    type: "planeadded",
                    data: t
                });
            }
            p = null;
        })), this.setAnimationLoop = function(t) {
            U = t;
        }, this.dispose = function() {};
    }
}

function Zr(t, e) {
    function i(t, e) {
        !0 === t.matrixAutoUpdate && t.updateMatrix(), e.value.copy(t.matrix);
    }
    function n(n, r) {
        n.opacity.value = r.opacity, r.color && n.diffuse.value.copy(r.color), r.emissive && n.emissive.value.copy(r.emissive).multiplyScalar(r.emissiveIntensity), 
        r.map && (n.map.value = r.map, i(r.map, n.mapTransform)), r.alphaMap && (n.alphaMap.value = r.alphaMap, 
        i(r.alphaMap, n.alphaMapTransform)), r.bumpMap && (n.bumpMap.value = r.bumpMap, 
        i(r.bumpMap, n.bumpMapTransform), n.bumpScale.value = r.bumpScale, 1 === r.side && (n.bumpScale.value *= -1)), 
        r.normalMap && (n.normalMap.value = r.normalMap, i(r.normalMap, n.normalMapTransform), 
        n.normalScale.value.copy(r.normalScale), 1 === r.side && n.normalScale.value.negate()), 
        r.displacementMap && (n.displacementMap.value = r.displacementMap, i(r.displacementMap, n.displacementMapTransform), 
        n.displacementScale.value = r.displacementScale, n.displacementBias.value = r.displacementBias), 
        r.emissiveMap && (n.emissiveMap.value = r.emissiveMap, i(r.emissiveMap, n.emissiveMapTransform)), 
        r.specularMap && (n.specularMap.value = r.specularMap, i(r.specularMap, n.specularMapTransform)), 
        r.alphaTest > 0 && (n.alphaTest.value = r.alphaTest);
        const s = e.get(r).envMap;
        if (s && (n.envMap.value = s, n.flipEnvMap.value = s.isCubeTexture && !1 === s.isRenderTargetTexture ? -1 : 1, 
        n.reflectivity.value = r.reflectivity, n.ior.value = r.ior, n.refractionRatio.value = r.refractionRatio), 
        r.lightMap) {
            n.lightMap.value = r.lightMap;
            const e = !0 === t.useLegacyLights ? Math.PI : 1;
            n.lightMapIntensity.value = r.lightMapIntensity * e, i(r.lightMap, n.lightMapTransform);
        }
        r.aoMap && (n.aoMap.value = r.aoMap, n.aoMapIntensity.value = r.aoMapIntensity, 
        i(r.aoMap, n.aoMapTransform));
    }
    return {
        refreshFogUniforms: function(e, i) {
            i.color.getRGB(e.fogColor.value, si(t)), i.isFog ? (e.fogNear.value = i.near, e.fogFar.value = i.far) : i.isFogExp2 && (e.fogDensity.value = i.density);
        },
        refreshMaterialUniforms: function(t, r, s, a, o) {
            r.isMeshBasicMaterial || r.isMeshLambertMaterial ? n(t, r) : r.isMeshToonMaterial ? (n(t, r), 
            function(t, e) {
                e.gradientMap && (t.gradientMap.value = e.gradientMap);
            }(t, r)) : r.isMeshPhongMaterial ? (n(t, r), function(t, e) {
                t.specular.value.copy(e.specular), t.shininess.value = Math.max(e.shininess, 1e-4);
            }(t, r)) : r.isMeshStandardMaterial ? (n(t, r), function(t, n) {
                t.metalness.value = n.metalness, n.metalnessMap && (t.metalnessMap.value = n.metalnessMap, 
                i(n.metalnessMap, t.metalnessMapTransform));
                t.roughness.value = n.roughness, n.roughnessMap && (t.roughnessMap.value = n.roughnessMap, 
                i(n.roughnessMap, t.roughnessMapTransform));
                e.get(n).envMap && (t.envMapIntensity.value = n.envMapIntensity);
            }(t, r), r.isMeshPhysicalMaterial && function(t, e, n) {
                t.ior.value = e.ior, e.sheen > 0 && (t.sheenColor.value.copy(e.sheenColor).multiplyScalar(e.sheen), 
                t.sheenRoughness.value = e.sheenRoughness, e.sheenColorMap && (t.sheenColorMap.value = e.sheenColorMap, 
                i(e.sheenColorMap, t.sheenColorMapTransform)), e.sheenRoughnessMap && (t.sheenRoughnessMap.value = e.sheenRoughnessMap, 
                i(e.sheenRoughnessMap, t.sheenRoughnessMapTransform)));
                e.clearcoat > 0 && (t.clearcoat.value = e.clearcoat, t.clearcoatRoughness.value = e.clearcoatRoughness, 
                e.clearcoatMap && (t.clearcoatMap.value = e.clearcoatMap, i(e.clearcoatMap, t.clearcoatMapTransform)), 
                e.clearcoatRoughnessMap && (t.clearcoatRoughnessMap.value = e.clearcoatRoughnessMap, 
                i(e.clearcoatRoughnessMap, t.clearcoatRoughnessMapTransform)), e.clearcoatNormalMap && (t.clearcoatNormalMap.value = e.clearcoatNormalMap, 
                i(e.clearcoatNormalMap, t.clearcoatNormalMapTransform), t.clearcoatNormalScale.value.copy(e.clearcoatNormalScale), 
                1 === e.side && t.clearcoatNormalScale.value.negate()));
                e.iridescence > 0 && (t.iridescence.value = e.iridescence, t.iridescenceIOR.value = e.iridescenceIOR, 
                t.iridescenceThicknessMinimum.value = e.iridescenceThicknessRange[0], t.iridescenceThicknessMaximum.value = e.iridescenceThicknessRange[1], 
                e.iridescenceMap && (t.iridescenceMap.value = e.iridescenceMap, i(e.iridescenceMap, t.iridescenceMapTransform)), 
                e.iridescenceThicknessMap && (t.iridescenceThicknessMap.value = e.iridescenceThicknessMap, 
                i(e.iridescenceThicknessMap, t.iridescenceThicknessMapTransform)));
                e.transmission > 0 && (t.transmission.value = e.transmission, t.transmissionSamplerMap.value = n.texture, 
                t.transmissionSamplerSize.value.set(n.width, n.height), e.transmissionMap && (t.transmissionMap.value = e.transmissionMap, 
                i(e.transmissionMap, t.transmissionMapTransform)), t.thickness.value = e.thickness, 
                e.thicknessMap && (t.thicknessMap.value = e.thicknessMap, i(e.thicknessMap, t.thicknessMapTransform)), 
                t.attenuationDistance.value = e.attenuationDistance, t.attenuationColor.value.copy(e.attenuationColor));
                t.specularIntensity.value = e.specularIntensity, t.specularColor.value.copy(e.specularColor), 
                e.specularColorMap && (t.specularColorMap.value = e.specularColorMap, i(e.specularColorMap, t.specularColorMapTransform));
                e.specularIntensityMap && (t.specularIntensityMap.value = e.specularIntensityMap, 
                i(e.specularIntensityMap, t.specularIntensityMapTransform));
            }(t, r, o)) : r.isMeshMatcapMaterial ? (n(t, r), function(t, e) {
                e.matcap && (t.matcap.value = e.matcap);
            }(t, r)) : r.isMeshDepthMaterial ? n(t, r) : r.isMeshDistanceMaterial ? (n(t, r), 
            function(t, i) {
                const n = e.get(i).light;
                t.referencePosition.value.setFromMatrixPosition(n.matrixWorld), t.nearDistance.value = n.shadow.camera.near, 
                t.farDistance.value = n.shadow.camera.far;
            }(t, r)) : r.isMeshNormalMaterial ? n(t, r) : r.isLineBasicMaterial ? (function(t, e) {
                t.diffuse.value.copy(e.color), t.opacity.value = e.opacity, e.map && (t.map.value = e.map, 
                i(e.map, t.mapTransform));
            }(t, r), r.isLineDashedMaterial && function(t, e) {
                t.dashSize.value = e.dashSize, t.totalSize.value = e.dashSize + e.gapSize, t.scale.value = e.scale;
            }(t, r)) : r.isPointsMaterial ? function(t, e, n, r) {
                t.diffuse.value.copy(e.color), t.opacity.value = e.opacity, t.size.value = e.size * n, 
                t.scale.value = .5 * r, e.map && (t.map.value = e.map, i(e.map, t.uvTransform));
                e.alphaMap && (t.alphaMap.value = e.alphaMap);
                e.alphaTest > 0 && (t.alphaTest.value = e.alphaTest);
            }(t, r, s, a) : r.isSpriteMaterial ? function(t, e) {
                t.diffuse.value.copy(e.color), t.opacity.value = e.opacity, t.rotation.value = e.rotation, 
                e.map && (t.map.value = e.map, i(e.map, t.mapTransform));
                e.alphaMap && (t.alphaMap.value = e.alphaMap);
                e.alphaTest > 0 && (t.alphaTest.value = e.alphaTest);
            }(t, r) : r.isShadowMaterial ? (t.color.value.copy(r.color), t.opacity.value = r.opacity) : r.isShaderMaterial && (r.uniformsNeedUpdate = !1);
        }
    };
}

function Jr(t, e, i, n) {
    let r = {}, s = {}, a = [];
    const o = i.isWebGL2 ? t.getParameter(t.MAX_UNIFORM_BUFFER_BINDINGS) : 0;
    function l(t, e, i) {
        const n = t.value;
        if (void 0 === i[e]) {
            if ("number" == typeof n) i[e] = n; else {
                const t = Array.isArray(n) ? n : [ n ], r = [];
                for (let e = 0; e < t.length; e++) r.push(t[e].clone());
                i[e] = r;
            }
            return !0;
        }
        if ("number" == typeof n) {
            if (i[e] !== n) return i[e] = n, !0;
        } else {
            const t = Array.isArray(i[e]) ? i[e] : [ i[e] ], r = Array.isArray(n) ? n : [ n ];
            for (let e = 0; e < t.length; e++) {
                const i = t[e];
                if (!1 === i.equals(r[e])) return i.copy(r[e]), !0;
            }
        }
        return !1;
    }
    function h(t) {
        const e = {
            boundary: 0,
            storage: 0
        };
        return "number" == typeof t ? (e.boundary = 4, e.storage = 4) : t.isVector2 ? (e.boundary = 8, 
        e.storage = 8) : t.isVector3 || t.isColor ? (e.boundary = 16, e.storage = 12) : t.isVector4 ? (e.boundary = 16, 
        e.storage = 16) : t.isMatrix3 ? (e.boundary = 48, e.storage = 48) : t.isMatrix4 ? (e.boundary = 64, 
        e.storage = 64) : t.isTexture ? console.warn("THREE.WebGLRenderer: Texture samplers can not be part of an uniforms group.") : console.warn("THREE.WebGLRenderer: Unsupported uniform value type.", t), 
        e;
    }
    function c(e) {
        const i = e.target;
        i.removeEventListener("dispose", c);
        const n = a.indexOf(i.__bindingPointIndex);
        a.splice(n, 1), t.deleteBuffer(r[i.id]), delete r[i.id], delete s[i.id];
    }
    return {
        bind: function(t, e) {
            const i = e.program;
            n.uniformBlockBinding(t, i);
        },
        update: function(i, d) {
            let u = r[i.id];
            void 0 === u && (!function(t) {
                const e = t.uniforms;
                let i = 0;
                const n = 16;
                let r = 0;
                for (let t = 0, s = e.length; t < s; t++) {
                    const s = e[t], a = {
                        boundary: 0,
                        storage: 0
                    }, o = Array.isArray(s.value) ? s.value : [ s.value ];
                    for (let t = 0, e = o.length; t < e; t++) {
                        const e = h(o[t]);
                        a.boundary += e.boundary, a.storage += e.storage;
                    }
                    if (s.__data = new Float32Array(a.storage / Float32Array.BYTES_PER_ELEMENT), s.__offset = i, 
                    t > 0) {
                        r = i % n;
                        const t = n - r;
                        0 !== r && t - a.boundary < 0 && (i += n - r, s.__offset = i);
                    }
                    i += a.storage;
                }
                r = i % n, r > 0 && (i += n - r);
                t.__size = i, t.__cache = {};
            }(i), u = function(e) {
                const i = function() {
                    for (let t = 0; t < o; t++) if (-1 === a.indexOf(t)) return a.push(t), t;
                    return console.error("THREE.WebGLRenderer: Maximum number of simultaneously usable uniforms groups reached."), 
                    0;
                }();
                e.__bindingPointIndex = i;
                const n = t.createBuffer(), r = e.__size, s = e.usage;
                return t.bindBuffer(t.UNIFORM_BUFFER, n), t.bufferData(t.UNIFORM_BUFFER, r, s), 
                t.bindBuffer(t.UNIFORM_BUFFER, null), t.bindBufferBase(t.UNIFORM_BUFFER, i, n), 
                n;
            }(i), r[i.id] = u, i.addEventListener("dispose", c));
            const p = d.program;
            n.updateUBOMapping(i, p);
            const g = e.render.frame;
            s[i.id] !== g && (!function(e) {
                const i = r[e.id], n = e.uniforms, s = e.__cache;
                t.bindBuffer(t.UNIFORM_BUFFER, i);
                for (let e = 0, i = n.length; e < i; e++) {
                    const i = n[e];
                    if (!0 === l(i, e, s)) {
                        const e = i.__offset, n = Array.isArray(i.value) ? i.value : [ i.value ];
                        let r = 0;
                        for (let s = 0; s < n.length; s++) {
                            const a = n[s], o = h(a);
                            "number" == typeof a ? (i.__data[0] = a, t.bufferSubData(t.UNIFORM_BUFFER, e + r, i.__data)) : a.isMatrix3 ? (i.__data[0] = a.elements[0], 
                            i.__data[1] = a.elements[1], i.__data[2] = a.elements[2], i.__data[3] = a.elements[0], 
                            i.__data[4] = a.elements[3], i.__data[5] = a.elements[4], i.__data[6] = a.elements[5], 
                            i.__data[7] = a.elements[0], i.__data[8] = a.elements[6], i.__data[9] = a.elements[7], 
                            i.__data[10] = a.elements[8], i.__data[11] = a.elements[0]) : (a.toArray(i.__data, r), 
                            r += o.storage / Float32Array.BYTES_PER_ELEMENT);
                        }
                        t.bufferSubData(t.UNIFORM_BUFFER, e, i.__data);
                    }
                }
                t.bindBuffer(t.UNIFORM_BUFFER, null);
            }(i), s[i.id] = g);
        },
        dispose: function() {
            for (const e in r) t.deleteBuffer(r[e]);
            a = [], r = {}, s = {};
        }
    };
}

function Qr() {
    const t = I("canvas");
    return t.style.display = "block", t;
}

class $r {
    constructor(t = {}) {
        const {canvas: e = Qr(), context: i = null, depth: n = !0, stencil: r = !0, alpha: s = !1, antialias: a = !1, premultipliedAlpha: o = !0, preserveDrawingBuffer: l = !1, powerPreference: h = "default", failIfMajorPerformanceCaveat: c = !1} = t;
        let d;
        this.isWebGLRenderer = !0, d = null !== i ? i.getContextAttributes().alpha : s;
        let u = null, p = null;
        const g = [], f = [];
        this.domElement = e, this.debug = {
            checkShaderErrors: !0,
            onShaderError: null
        }, this.autoClear = !0, this.autoClearColor = !0, this.autoClearDepth = !0, this.autoClearStencil = !0, 
        this.sortObjects = !0, this.clippingPlanes = [], this.localClippingEnabled = !1, 
        this.outputColorSpace = "srgb", this.useLegacyLights = !0, this.toneMapping = 0, 
        this.toneMappingExposure = 1;
        const m = this;
        let v = !1, _ = 0, x = 0, y = null, b = -1, S = null;
        const w = new Y, M = new Y;
        let T = null, E = e.width, A = e.height, C = 1, P = null, R = null;
        const L = new Y(0, 0, E, A), D = new Y(0, 0, E, A);
        let I = !1;
        const U = new xi;
        let N = !1, B = !1, O = null;
        const F = new Rt, k = new tt, H = {
            background: null,
            fog: null,
            environment: null,
            overrideMaterial: null,
            isScene: !0
        };
        function z() {
            return null === y ? C : 1;
        }
        let G, V, W, j, X, q, K, J, Q, $, et, it, nt, rt, st, at, ot, lt, ht, ct, dt, ut, pt, gt, ft = i;
        function mt(t, i) {
            for (let n = 0; n < t.length; n++) {
                const r = t[n], s = e.getContext(r, i);
                if (null !== s) return s;
            }
            return null;
        }
        try {
            const t = {
                alpha: !0,
                depth: n,
                stencil: r,
                antialias: a,
                premultipliedAlpha: o,
                preserveDrawingBuffer: l,
                powerPreference: h,
                failIfMajorPerformanceCaveat: c
            };
            if ("setAttribute" in e && e.setAttribute("data-engine", "three.js r152"), e.addEventListener("webglcontextlost", xt, !1), 
            e.addEventListener("webglcontextrestored", yt, !1), e.addEventListener("webglcontextcreationerror", bt, !1), 
            null === ft) {
                const e = [ "webgl2", "webgl", "experimental-webgl" ];
                if (!0 === m.isWebGL1Renderer && e.shift(), ft = mt(e, t), null === ft) throw mt(e) ? new Error("Error creating WebGL context with your selected attributes.") : new Error("Error creating WebGL context.");
            }
            void 0 === ft.getShaderPrecisionFormat && (ft.getShaderPrecisionFormat = function() {
                return {
                    rangeMin: 1,
                    rangeMax: 1,
                    precision: 1
                };
            });
        } catch (t) {
            throw console.error("THREE.WebGLRenderer: " + t.message), t;
        }
        function vt() {
            G = new Ki(ft), V = new Ri(ft, G, t), G.init(V), ut = new Vr(ft, G, V), W = new zr(ft, G, V), 
            j = new Ji(ft), X = new Ar, q = new Gr(ft, G, W, X, V, ut, j), K = new Di(m), J = new qi(m), 
            Q = new bi(ft, V), pt = new Ci(ft, G, Q, V), $ = new Yi(ft, Q, j, pt), et = new en(ft, $, Q, j), 
            ht = new tn(ft, V, q), at = new Li(X), it = new Er(m, K, J, G, V, pt, at), nt = new Zr(m, X), 
            rt = new Lr, st = new Or(G, V), lt = new Ai(m, K, J, W, et, d, o), ot = new Hr(m, et, V), 
            gt = new Jr(ft, j, V, W), ct = new Pi(ft, G, j, V), dt = new Zi(ft, G, j, V), j.programs = it.programs, 
            m.capabilities = V, m.extensions = G, m.properties = X, m.renderLists = rt, m.shadowMap = ot, 
            m.state = W, m.info = j;
        }
        vt();
        const _t = new Yr(m, ft);
        function xt(t) {
            t.preventDefault(), console.log("THREE.WebGLRenderer: Context Lost."), v = !0;
        }
        function yt() {
            console.log("THREE.WebGLRenderer: Context Restored."), v = !1;
            const t = j.autoReset, e = ot.enabled, i = ot.autoUpdate, n = ot.needsUpdate, r = ot.type;
            vt(), j.autoReset = t, ot.enabled = e, ot.autoUpdate = i, ot.needsUpdate = n, ot.type = r;
        }
        function bt(t) {
            console.error("THREE.WebGLRenderer: A WebGL context could not be created. Reason: ", t.statusMessage);
        }
        function St(t) {
            const e = t.target;
            e.removeEventListener("dispose", St), function(t) {
                (function(t) {
                    const e = X.get(t).programs;
                    void 0 !== e && (e.forEach((function(t) {
                        it.releaseProgram(t);
                    })), t.isShaderMaterial && it.releaseShaderCache(t));
                })(t), X.remove(t);
            }(e);
        }
        this.xr = _t, this.getContext = function() {
            return ft;
        }, this.getContextAttributes = function() {
            return ft.getContextAttributes();
        }, this.forceContextLoss = function() {
            const t = G.get("WEBGL_lose_context");
            t && t.loseContext();
        }, this.forceContextRestore = function() {
            const t = G.get("WEBGL_lose_context");
            t && t.restoreContext();
        }, this.getPixelRatio = function() {
            return C;
        }, this.setPixelRatio = function(t) {
            void 0 !== t && (C = t, this.setSize(E, A, !1));
        }, this.getSize = function(t) {
            return t.set(E, A);
        }, this.setSize = function(t, i, n = !0) {
            _t.isPresenting ? console.warn("THREE.WebGLRenderer: Can't change size while VR device is presenting.") : (E = t, 
            A = i, e.width = Math.floor(t * C), e.height = Math.floor(i * C), !0 === n && (e.style.width = t + "px", 
            e.style.height = i + "px"), this.setViewport(0, 0, t, i));
        }, this.getDrawingBufferSize = function(t) {
            return t.set(E * C, A * C).floor();
        }, this.setDrawingBufferSize = function(t, i, n) {
            E = t, A = i, C = n, e.width = Math.floor(t * n), e.height = Math.floor(i * n), 
            this.setViewport(0, 0, t, i);
        }, this.getCurrentViewport = function(t) {
            return t.copy(w);
        }, this.getViewport = function(t) {
            return t.copy(L);
        }, this.setViewport = function(t, e, i, n) {
            t.isVector4 ? L.set(t.x, t.y, t.z, t.w) : L.set(t, e, i, n), W.viewport(w.copy(L).multiplyScalar(C).floor());
        }, this.getScissor = function(t) {
            return t.copy(D);
        }, this.setScissor = function(t, e, i, n) {
            t.isVector4 ? D.set(t.x, t.y, t.z, t.w) : D.set(t, e, i, n), W.scissor(M.copy(D).multiplyScalar(C).floor());
        }, this.getScissorTest = function() {
            return I;
        }, this.setScissorTest = function(t) {
            W.setScissorTest(I = t);
        }, this.setOpaqueSort = function(t) {
            P = t;
        }, this.setTransparentSort = function(t) {
            R = t;
        }, this.getClearColor = function(t) {
            return t.copy(lt.getClearColor());
        }, this.setClearColor = function() {
            lt.setClearColor.apply(lt, arguments);
        }, this.getClearAlpha = function() {
            return lt.getClearAlpha();
        }, this.setClearAlpha = function() {
            lt.setClearAlpha.apply(lt, arguments);
        }, this.clear = function(t = !0, e = !0, i = !0) {
            let n = 0;
            t && (n |= ft.COLOR_BUFFER_BIT), e && (n |= ft.DEPTH_BUFFER_BIT), i && (n |= ft.STENCIL_BUFFER_BIT), 
            ft.clear(n);
        }, this.clearColor = function() {
            this.clear(!0, !1, !1);
        }, this.clearDepth = function() {
            this.clear(!1, !0, !1);
        }, this.clearStencil = function() {
            this.clear(!1, !1, !0);
        }, this.dispose = function() {
            e.removeEventListener("webglcontextlost", xt, !1), e.removeEventListener("webglcontextrestored", yt, !1), 
            e.removeEventListener("webglcontextcreationerror", bt, !1), rt.dispose(), st.dispose(), 
            X.dispose(), K.dispose(), J.dispose(), et.dispose(), pt.dispose(), gt.dispose(), 
            it.dispose(), _t.dispose(), _t.removeEventListener("sessionstart", Mt), _t.removeEventListener("sessionend", Tt), 
            O && (O.dispose(), O = null), Et.stop();
        }, this.renderBufferDirect = function(t, e, i, n, r, s) {
            null === e && (e = H);
            const a = r.isMesh && r.matrixWorld.determinant() < 0, o = function(t, e, i, n, r) {
                !0 !== e.isScene && (e = H);
                q.resetTextureUnits();
                const s = e.fog, a = n.isMeshStandardMaterial ? e.environment : null, o = null === y ? m.outputColorSpace : !0 === y.isXRRenderTarget ? y.texture.colorSpace : "srgb-linear", l = (n.isMeshStandardMaterial ? J : K).get(n.envMap || a), h = !0 === n.vertexColors && !!i.attributes.color && 4 === i.attributes.color.itemSize, c = !!n.normalMap && !!i.attributes.tangent, d = !!i.morphAttributes.position, u = !!i.morphAttributes.normal, g = !!i.morphAttributes.color, f = n.toneMapped ? m.toneMapping : 0, v = i.morphAttributes.position || i.morphAttributes.normal || i.morphAttributes.color, _ = void 0 !== v ? v.length : 0, x = X.get(n), w = p.state.lights;
                if (!0 === N && (!0 === B || t !== S)) {
                    const e = t === S && n.id === b;
                    at.setState(n, t, e);
                }
                let M = !1;
                n.version === x.__version ? x.needsLights && x.lightsStateVersion !== w.state.version || x.outputColorSpace !== o || r.isInstancedMesh && !1 === x.instancing ? M = !0 : r.isInstancedMesh || !0 !== x.instancing ? r.isSkinnedMesh && !1 === x.skinning ? M = !0 : r.isSkinnedMesh || !0 !== x.skinning ? x.envMap !== l || !0 === n.fog && x.fog !== s ? M = !0 : void 0 === x.numClippingPlanes || x.numClippingPlanes === at.numPlanes && x.numIntersection === at.numIntersection ? (x.vertexAlphas !== h || x.vertexTangents !== c || x.morphTargets !== d || x.morphNormals !== u || x.morphColors !== g || x.toneMapping !== f || !0 === V.isWebGL2 && x.morphTargetsCount !== _) && (M = !0) : M = !0 : M = !0 : M = !0 : (M = !0, 
                x.__version = n.version);
                let T = x.currentProgram;
                !0 === M && (T = Dt(n, e, r));
                let E = !1, P = !1, R = !1;
                const L = T.getUniforms(), D = x.uniforms;
                W.useProgram(T.program) && (E = !0, P = !0, R = !0);
                n.id !== b && (b = n.id, P = !0);
                if (E || S !== t) {
                    if (L.setValue(ft, "projectionMatrix", t.projectionMatrix), V.logarithmicDepthBuffer && L.setValue(ft, "logDepthBufFC", 2 / (Math.log(t.far + 1) / Math.LN2)), 
                    S !== t && (S = t, P = !0, R = !0), n.isShaderMaterial || n.isMeshPhongMaterial || n.isMeshToonMaterial || n.isMeshStandardMaterial || n.envMap) {
                        const e = L.map.cameraPosition;
                        void 0 !== e && e.setValue(ft, k.setFromMatrixPosition(t.matrixWorld));
                    }
                    (n.isMeshPhongMaterial || n.isMeshToonMaterial || n.isMeshLambertMaterial || n.isMeshBasicMaterial || n.isMeshStandardMaterial || n.isShaderMaterial) && L.setValue(ft, "isOrthographic", !0 === t.isOrthographicCamera), 
                    (n.isMeshPhongMaterial || n.isMeshToonMaterial || n.isMeshLambertMaterial || n.isMeshBasicMaterial || n.isMeshStandardMaterial || n.isShaderMaterial || n.isShadowMaterial || r.isSkinnedMesh) && L.setValue(ft, "viewMatrix", t.matrixWorldInverse);
                }
                if (r.isSkinnedMesh) {
                    L.setOptional(ft, r, "bindMatrix"), L.setOptional(ft, r, "bindMatrixInverse");
                    const t = r.skeleton;
                    t && (V.floatVertexTextures ? (null === t.boneTexture && t.computeBoneTexture(), 
                    L.setValue(ft, "boneTexture", t.boneTexture, q), L.setValue(ft, "boneTextureSize", t.boneTextureSize)) : console.warn("THREE.WebGLRenderer: SkinnedMesh can only be used with WebGL 2. With WebGL 1 OES_texture_float and vertex textures support is required."));
                }
                const I = i.morphAttributes;
                (void 0 !== I.position || void 0 !== I.normal || void 0 !== I.color && !0 === V.isWebGL2) && ht.update(r, i, T);
                (P || x.receiveShadow !== r.receiveShadow) && (x.receiveShadow = r.receiveShadow, 
                L.setValue(ft, "receiveShadow", r.receiveShadow));
                n.isMeshGouraudMaterial && null !== n.envMap && (D.envMap.value = l, D.flipEnvMap.value = l.isCubeTexture && !1 === l.isRenderTargetTexture ? -1 : 1);
                P && (L.setValue(ft, "toneMappingExposure", m.toneMappingExposure), x.needsLights && (F = R, 
                (U = D).ambientLightColor.needsUpdate = F, U.lightProbe.needsUpdate = F, U.directionalLights.needsUpdate = F, 
                U.directionalLightShadows.needsUpdate = F, U.pointLights.needsUpdate = F, U.pointLightShadows.needsUpdate = F, 
                U.spotLights.needsUpdate = F, U.spotLightShadows.needsUpdate = F, U.rectAreaLights.needsUpdate = F, 
                U.hemisphereLights.needsUpdate = F), s && !0 === n.fog && nt.refreshFogUniforms(D, s), 
                nt.refreshMaterialUniforms(D, n, C, A, O), ar.upload(ft, x.uniformsList, D, q));
                var U, F;
                n.isShaderMaterial && !0 === n.uniformsNeedUpdate && (ar.upload(ft, x.uniformsList, D, q), 
                n.uniformsNeedUpdate = !1);
                n.isSpriteMaterial && L.setValue(ft, "center", r.center);
                if (L.setValue(ft, "modelViewMatrix", r.modelViewMatrix), L.setValue(ft, "normalMatrix", r.normalMatrix), 
                L.setValue(ft, "modelMatrix", r.matrixWorld), n.isShaderMaterial || n.isRawShaderMaterial) {
                    const t = n.uniformsGroups;
                    for (let e = 0, i = t.length; e < i; e++) if (V.isWebGL2) {
                        const i = t[e];
                        gt.update(i, T), gt.bind(i, T);
                    } else console.warn("THREE.WebGLRenderer: Uniform Buffer Objects can only be used with WebGL 2.");
                }
                return T;
            }(t, e, i, n, r);
            W.setMaterial(n, a);
            let l = i.index, h = 1;
            !0 === n.wireframe && (l = $.getWireframeAttribute(i), h = 2);
            const c = i.drawRange, d = i.attributes.position;
            let u = c.start * h, g = (c.start + c.count) * h;
            null !== s && (u = Math.max(u, s.start * h), g = Math.min(g, (s.start + s.count) * h)), 
            null !== l ? (u = Math.max(u, 0), g = Math.min(g, l.count)) : null != d && (u = Math.max(u, 0), 
            g = Math.min(g, d.count));
            const f = g - u;
            if (f < 0 || f === 1 / 0) return;
            let v;
            pt.setup(r, n, o, i, l);
            let _ = ct;
            if (null !== l && (v = Q.get(l), _ = dt, _.setIndex(v)), r.isMesh) !0 === n.wireframe ? (W.setLineWidth(n.wireframeLinewidth * z()), 
            _.setMode(ft.LINES)) : _.setMode(ft.TRIANGLES); else if (r.isLine) {
                let t = n.linewidth;
                void 0 === t && (t = 1), W.setLineWidth(t * z()), r.isLineSegments ? _.setMode(ft.LINES) : r.isLineLoop ? _.setMode(ft.LINE_LOOP) : _.setMode(ft.LINE_STRIP);
            } else r.isPoints ? _.setMode(ft.POINTS) : r.isSprite && _.setMode(ft.TRIANGLES);
            if (r.isInstancedMesh) _.renderInstances(u, f, r.count); else if (i.isInstancedBufferGeometry) {
                const t = void 0 !== i._maxInstanceCount ? i._maxInstanceCount : 1 / 0, e = Math.min(i.instanceCount, t);
                _.renderInstances(u, f, e);
            } else _.render(u, f);
        }, this.compile = function(t, e) {
            function i(t, e, i) {
                !0 === t.transparent && 2 === t.side && !1 === t.forceSinglePass ? (t.side = 1, 
                t.needsUpdate = !0, Dt(t, e, i), t.side = 0, t.needsUpdate = !0, Dt(t, e, i), t.side = 2) : Dt(t, e, i);
            }
            p = st.get(t), p.init(), f.push(p), t.traverseVisible((function(t) {
                t.isLight && t.layers.test(e.layers) && (p.pushLight(t), t.castShadow && p.pushShadow(t));
            })), p.setupLights(m.useLegacyLights), t.traverse((function(e) {
                const n = e.material;
                if (n) if (Array.isArray(n)) for (let r = 0; r < n.length; r++) {
                    i(n[r], t, e);
                } else i(n, t, e);
            })), f.pop(), p = null;
        };
        let wt = null;
        function Mt() {
            Et.stop();
        }
        function Tt() {
            Et.start();
        }
        const Et = new yi;
        function At(t, e, i, n) {
            if (!1 === t.visible) return;
            if (t.layers.test(e.layers)) if (t.isGroup) i = t.renderOrder; else if (t.isLOD) !0 === t.autoUpdate && t.update(e); else if (t.isLight) p.pushLight(t), 
            t.castShadow && p.pushShadow(t); else if (t.isSprite) {
                if (!t.frustumCulled || U.intersectsSprite(t)) {
                    n && k.setFromMatrixPosition(t.matrixWorld).applyMatrix4(F);
                    const e = et.update(t), r = t.material;
                    r.visible && u.push(t, e, r, i, k.z, null);
                }
            } else if ((t.isMesh || t.isLine || t.isPoints) && (!t.frustumCulled || U.intersectsObject(t))) {
                t.isSkinnedMesh && t.skeleton.frame !== j.render.frame && (t.skeleton.update(), 
                t.skeleton.frame = j.render.frame);
                const e = et.update(t), r = t.material;
                if (n && (null === e.boundingSphere && e.computeBoundingSphere(), k.copy(e.boundingSphere.center).applyMatrix4(t.matrixWorld).applyMatrix4(F)), 
                Array.isArray(r)) {
                    const n = e.groups;
                    for (let s = 0, a = n.length; s < a; s++) {
                        const a = n[s], o = r[a.materialIndex];
                        o && o.visible && u.push(t, e, o, i, k.z, a);
                    }
                } else r.visible && u.push(t, e, r, i, k.z, null);
            }
            const r = t.children;
            for (let t = 0, s = r.length; t < s; t++) At(r[t], e, i, n);
        }
        function Ct(t, e, i, n) {
            const r = t.opaque, s = t.transmissive, o = t.transparent;
            p.setupLightsView(i), !0 === N && at.setGlobalState(m.clippingPlanes, i), s.length > 0 && function(t, e, i, n) {
                if (null === O) {
                    const t = V.isWebGL2;
                    O = new Z(1024, 1024, {
                        generateMipmaps: !0,
                        type: G.has("EXT_color_buffer_half_float") ? 1016 : 1009,
                        minFilter: 1008,
                        samples: t && !0 === a ? 4 : 0
                    });
                }
                const r = m.getRenderTarget();
                m.setRenderTarget(O), m.clear();
                const s = m.toneMapping;
                m.toneMapping = 0, Pt(t, i, n), q.updateMultisampleRenderTarget(O), q.updateRenderTargetMipmap(O);
                let o = !1;
                for (let t = 0, r = e.length; t < r; t++) {
                    const r = e[t], s = r.object, a = r.geometry, l = r.material, h = r.group;
                    if (2 === l.side && s.layers.test(n.layers)) {
                        const t = l.side;
                        l.side = 1, l.needsUpdate = !0, Lt(s, i, n, a, l, h), l.side = t, l.needsUpdate = !0, 
                        o = !0;
                    }
                }
                !0 === o && (q.updateMultisampleRenderTarget(O), q.updateRenderTargetMipmap(O));
                m.setRenderTarget(r), m.toneMapping = s;
            }(r, s, e, i), n && W.viewport(w.copy(n)), r.length > 0 && Pt(r, e, i), s.length > 0 && Pt(s, e, i), 
            o.length > 0 && Pt(o, e, i), W.buffers.depth.setTest(!0), W.buffers.depth.setMask(!0), 
            W.buffers.color.setMask(!0), W.setPolygonOffset(!1);
        }
        function Pt(t, e, i) {
            const n = !0 === e.isScene ? e.overrideMaterial : null;
            for (let r = 0, s = t.length; r < s; r++) {
                const s = t[r], a = s.object, o = s.geometry, l = null === n ? s.material : n, h = s.group;
                a.layers.test(i.layers) && Lt(a, e, i, o, l, h);
            }
        }
        function Lt(t, e, i, n, r, s) {
            t.onBeforeRender(m, e, i, n, r, s), t.modelViewMatrix.multiplyMatrices(i.matrixWorldInverse, t.matrixWorld), 
            t.normalMatrix.getNormalMatrix(t.modelViewMatrix), r.onBeforeRender(m, e, i, n, t, s), 
            !0 === r.transparent && 2 === r.side && !1 === r.forceSinglePass ? (r.side = 1, 
            r.needsUpdate = !0, m.renderBufferDirect(i, e, n, r, t, s), r.side = 0, r.needsUpdate = !0, 
            m.renderBufferDirect(i, e, n, r, t, s), r.side = 2) : m.renderBufferDirect(i, e, n, r, t, s), 
            t.onAfterRender(m, e, i, n, r, s);
        }
        function Dt(t, e, i) {
            !0 !== e.isScene && (e = H);
            const n = X.get(t), r = p.state.lights, s = p.state.shadowsArray, a = r.state.version, o = it.getParameters(t, r.state, s, e, i), l = it.getProgramCacheKey(o);
            let h = n.programs;
            n.environment = t.isMeshStandardMaterial ? e.environment : null, n.fog = e.fog, 
            n.envMap = (t.isMeshStandardMaterial ? J : K).get(t.envMap || n.environment), void 0 === h && (t.addEventListener("dispose", St), 
            h = new Map, n.programs = h);
            let c = h.get(l);
            if (void 0 !== c) {
                if (n.currentProgram === c && n.lightsStateVersion === a) return It(t, o), c;
            } else o.uniforms = it.getUniforms(t), t.onBuild(i, o, m), t.onBeforeCompile(o, m), 
            c = it.acquireProgram(o, l), h.set(l, c), n.uniforms = o.uniforms;
            const d = n.uniforms;
            (t.isShaderMaterial || t.isRawShaderMaterial) && !0 !== t.clipping || (d.clippingPlanes = at.uniform), 
            It(t, o), n.needsLights = function(t) {
                return t.isMeshLambertMaterial || t.isMeshToonMaterial || t.isMeshPhongMaterial || t.isMeshStandardMaterial || t.isShadowMaterial || t.isShaderMaterial && !0 === t.lights;
            }(t), n.lightsStateVersion = a, n.needsLights && (d.ambientLightColor.value = r.state.ambient, 
            d.lightProbe.value = r.state.probe, d.directionalLights.value = r.state.directional, 
            d.directionalLightShadows.value = r.state.directionalShadow, d.spotLights.value = r.state.spot, 
            d.spotLightShadows.value = r.state.spotShadow, d.rectAreaLights.value = r.state.rectArea, 
            d.ltc_1.value = r.state.rectAreaLTC1, d.ltc_2.value = r.state.rectAreaLTC2, d.pointLights.value = r.state.point, 
            d.pointLightShadows.value = r.state.pointShadow, d.hemisphereLights.value = r.state.hemi, 
            d.directionalShadowMap.value = r.state.directionalShadowMap, d.directionalShadowMatrix.value = r.state.directionalShadowMatrix, 
            d.spotShadowMap.value = r.state.spotShadowMap, d.spotLightMatrix.value = r.state.spotLightMatrix, 
            d.spotLightMap.value = r.state.spotLightMap, d.pointShadowMap.value = r.state.pointShadowMap, 
            d.pointShadowMatrix.value = r.state.pointShadowMatrix);
            const u = c.getUniforms(), g = ar.seqWithValue(u.seq, d);
            return n.currentProgram = c, n.uniformsList = g, c;
        }
        function It(t, e) {
            const i = X.get(t);
            i.outputColorSpace = e.outputColorSpace, i.instancing = e.instancing, i.skinning = e.skinning, 
            i.morphTargets = e.morphTargets, i.morphNormals = e.morphNormals, i.morphColors = e.morphColors, 
            i.morphTargetsCount = e.morphTargetsCount, i.numClippingPlanes = e.numClippingPlanes, 
            i.numIntersection = e.numClipIntersection, i.vertexAlphas = e.vertexAlphas, i.vertexTangents = e.vertexTangents, 
            i.toneMapping = e.toneMapping;
        }
        Et.setAnimationLoop((function(t) {
            wt && wt(t);
        })), "undefined" != typeof self && Et.setContext(self), this.setAnimationLoop = function(t) {
            wt = t, _t.setAnimationLoop(t), null === t ? Et.stop() : Et.start();
        }, _t.addEventListener("sessionstart", Mt), _t.addEventListener("sessionend", Tt), 
        this.render = function(t, e) {
            if (void 0 !== e && !0 !== e.isCamera) return void console.error("THREE.WebGLRenderer.render: camera is not an instance of THREE.Camera.");
            if (!0 === v) return;
            !0 === t.matrixWorldAutoUpdate && t.updateMatrixWorld(), null === e.parent && !0 === e.matrixWorldAutoUpdate && e.updateMatrixWorld(), 
            !0 === _t.enabled && !0 === _t.isPresenting && (!0 === _t.cameraAutoUpdate && _t.updateCamera(e), 
            e = _t.getCamera()), !0 === t.isScene && t.onBeforeRender(m, t, e, y), p = st.get(t, f.length), 
            p.init(), f.push(p), F.multiplyMatrices(e.projectionMatrix, e.matrixWorldInverse), 
            U.setFromProjectionMatrix(F), B = this.localClippingEnabled, N = at.init(this.clippingPlanes, B), 
            u = rt.get(t, g.length), u.init(), g.push(u), At(t, e, 0, m.sortObjects), u.finish(), 
            !0 === m.sortObjects && u.sort(P, R), !0 === N && at.beginShadows();
            const i = p.state.shadowsArray;
            if (ot.render(i, t, e), !0 === N && at.endShadows(), !0 === this.info.autoReset && this.info.reset(), 
            lt.render(u, t), p.setupLights(m.useLegacyLights), e.isArrayCamera) {
                const i = e.cameras;
                for (let e = 0, n = i.length; e < n; e++) {
                    const n = i[e];
                    Ct(u, t, n, n.viewport);
                }
            } else Ct(u, t, e);
            null !== y && (q.updateMultisampleRenderTarget(y), q.updateRenderTargetMipmap(y)), 
            !0 === t.isScene && t.onAfterRender(m, t, e), pt.resetDefaultState(), b = -1, S = null, 
            f.pop(), p = f.length > 0 ? f[f.length - 1] : null, g.pop(), u = g.length > 0 ? g[g.length - 1] : null;
        }, this.getActiveCubeFace = function() {
            return _;
        }, this.getActiveMipmapLevel = function() {
            return x;
        }, this.getRenderTarget = function() {
            return y;
        }, this.setRenderTargetTextures = function(t, e, i) {
            X.get(t.texture).__webglTexture = e, X.get(t.depthTexture).__webglTexture = i;
            const n = X.get(t);
            n.__hasExternalTextures = !0, n.__hasExternalTextures && (n.__autoAllocateDepthBuffer = void 0 === i, 
            n.__autoAllocateDepthBuffer || !0 === G.has("WEBGL_multisampled_render_to_texture") && (console.warn("THREE.WebGLRenderer: Render-to-texture extension was disabled because an external texture was provided"), 
            n.__useRenderToTexture = !1));
        }, this.setRenderTargetFramebuffer = function(t, e) {
            const i = X.get(t);
            i.__webglFramebuffer = e, i.__useDefaultFramebuffer = void 0 === e;
        }, this.setRenderTarget = function(t, e = 0, i = 0) {
            y = t, _ = e, x = i;
            let n = !0, r = null, s = !1, a = !1;
            if (t) {
                const i = X.get(t);
                void 0 !== i.__useDefaultFramebuffer ? (W.bindFramebuffer(ft.FRAMEBUFFER, null), 
                n = !1) : void 0 === i.__webglFramebuffer ? q.setupRenderTarget(t) : i.__hasExternalTextures && q.rebindTextures(t, X.get(t.texture).__webglTexture, X.get(t.depthTexture).__webglTexture);
                const o = t.texture;
                (o.isData3DTexture || o.isDataArrayTexture || o.isCompressedArrayTexture) && (a = !0);
                const l = X.get(t).__webglFramebuffer;
                t.isWebGLCubeRenderTarget ? (r = l[e], s = !0) : r = V.isWebGL2 && t.samples > 0 && !1 === q.useMultisampledRTT(t) ? X.get(t).__webglMultisampledFramebuffer : l, 
                w.copy(t.viewport), M.copy(t.scissor), T = t.scissorTest;
            } else w.copy(L).multiplyScalar(C).floor(), M.copy(D).multiplyScalar(C).floor(), 
            T = I;
            if (W.bindFramebuffer(ft.FRAMEBUFFER, r) && V.drawBuffers && n && W.drawBuffers(t, r), 
            W.viewport(w), W.scissor(M), W.setScissorTest(T), s) {
                const n = X.get(t.texture);
                ft.framebufferTexture2D(ft.FRAMEBUFFER, ft.COLOR_ATTACHMENT0, ft.TEXTURE_CUBE_MAP_POSITIVE_X + e, n.__webglTexture, i);
            } else if (a) {
                const n = X.get(t.texture), r = e || 0;
                ft.framebufferTextureLayer(ft.FRAMEBUFFER, ft.COLOR_ATTACHMENT0, n.__webglTexture, i || 0, r);
            }
            b = -1;
        }, this.readRenderTargetPixels = function(t, e, i, n, r, s, a) {
            if (!t || !t.isWebGLRenderTarget) return void console.error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");
            let o = X.get(t).__webglFramebuffer;
            if (t.isWebGLCubeRenderTarget && void 0 !== a && (o = o[a]), o) {
                W.bindFramebuffer(ft.FRAMEBUFFER, o);
                try {
                    const a = t.texture, o = a.format, l = a.type;
                    if (1023 !== o && ut.convert(o) !== ft.getParameter(ft.IMPLEMENTATION_COLOR_READ_FORMAT)) return void console.error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not in RGBA or implementation defined format.");
                    const h = 1016 === l && (G.has("EXT_color_buffer_half_float") || V.isWebGL2 && G.has("EXT_color_buffer_float"));
                    if (!(1009 === l || ut.convert(l) === ft.getParameter(ft.IMPLEMENTATION_COLOR_READ_TYPE) || 1015 === l && (V.isWebGL2 || G.has("OES_texture_float") || G.has("WEBGL_color_buffer_float")) || h)) return void console.error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not in UnsignedByteType or implementation defined type.");
                    e >= 0 && e <= t.width - n && i >= 0 && i <= t.height - r && ft.readPixels(e, i, n, r, ut.convert(o), ut.convert(l), s);
                } finally {
                    const t = null !== y ? X.get(y).__webglFramebuffer : null;
                    W.bindFramebuffer(ft.FRAMEBUFFER, t);
                }
            }
        }, this.copyFramebufferToTexture = function(t, e, i = 0) {
            const n = Math.pow(2, -i), r = Math.floor(e.image.width * n), s = Math.floor(e.image.height * n);
            q.setTexture2D(e, 0), ft.copyTexSubImage2D(ft.TEXTURE_2D, i, 0, 0, t.x, t.y, r, s), 
            W.unbindTexture();
        }, this.copyTextureToTexture = function(t, e, i, n = 0) {
            const r = e.image.width, s = e.image.height, a = ut.convert(i.format), o = ut.convert(i.type);
            q.setTexture2D(i, 0), ft.pixelStorei(ft.UNPACK_FLIP_Y_WEBGL, i.flipY), ft.pixelStorei(ft.UNPACK_PREMULTIPLY_ALPHA_WEBGL, i.premultiplyAlpha), 
            ft.pixelStorei(ft.UNPACK_ALIGNMENT, i.unpackAlignment), e.isDataTexture ? ft.texSubImage2D(ft.TEXTURE_2D, n, t.x, t.y, r, s, a, o, e.image.data) : e.isCompressedTexture ? ft.compressedTexSubImage2D(ft.TEXTURE_2D, n, t.x, t.y, e.mipmaps[0].width, e.mipmaps[0].height, a, e.mipmaps[0].data) : ft.texSubImage2D(ft.TEXTURE_2D, n, t.x, t.y, a, o, e.image), 
            0 === n && i.generateMipmaps && ft.generateMipmap(ft.TEXTURE_2D), W.unbindTexture();
        }, this.copyTextureToTexture3D = function(t, e, i, n, r = 0) {
            if (m.isWebGL1Renderer) return void console.warn("THREE.WebGLRenderer.copyTextureToTexture3D: can only be used with WebGL2.");
            const s = t.max.x - t.min.x + 1, a = t.max.y - t.min.y + 1, o = t.max.z - t.min.z + 1, l = ut.convert(n.format), h = ut.convert(n.type);
            let c;
            if (n.isData3DTexture) q.setTexture3D(n, 0), c = ft.TEXTURE_3D; else {
                if (!n.isDataArrayTexture) return void console.warn("THREE.WebGLRenderer.copyTextureToTexture3D: only supports THREE.DataTexture3D and THREE.DataTexture2DArray.");
                q.setTexture2DArray(n, 0), c = ft.TEXTURE_2D_ARRAY;
            }
            ft.pixelStorei(ft.UNPACK_FLIP_Y_WEBGL, n.flipY), ft.pixelStorei(ft.UNPACK_PREMULTIPLY_ALPHA_WEBGL, n.premultiplyAlpha), 
            ft.pixelStorei(ft.UNPACK_ALIGNMENT, n.unpackAlignment);
            const d = ft.getParameter(ft.UNPACK_ROW_LENGTH), u = ft.getParameter(ft.UNPACK_IMAGE_HEIGHT), p = ft.getParameter(ft.UNPACK_SKIP_PIXELS), g = ft.getParameter(ft.UNPACK_SKIP_ROWS), f = ft.getParameter(ft.UNPACK_SKIP_IMAGES), v = i.isCompressedTexture ? i.mipmaps[0] : i.image;
            ft.pixelStorei(ft.UNPACK_ROW_LENGTH, v.width), ft.pixelStorei(ft.UNPACK_IMAGE_HEIGHT, v.height), 
            ft.pixelStorei(ft.UNPACK_SKIP_PIXELS, t.min.x), ft.pixelStorei(ft.UNPACK_SKIP_ROWS, t.min.y), 
            ft.pixelStorei(ft.UNPACK_SKIP_IMAGES, t.min.z), i.isDataTexture || i.isData3DTexture ? ft.texSubImage3D(c, r, e.x, e.y, e.z, s, a, o, l, h, v.data) : i.isCompressedArrayTexture ? (console.warn("THREE.WebGLRenderer.copyTextureToTexture3D: untested support for compressed srcTexture."), 
            ft.compressedTexSubImage3D(c, r, e.x, e.y, e.z, s, a, o, l, v.data)) : ft.texSubImage3D(c, r, e.x, e.y, e.z, s, a, o, l, h, v), 
            ft.pixelStorei(ft.UNPACK_ROW_LENGTH, d), ft.pixelStorei(ft.UNPACK_IMAGE_HEIGHT, u), 
            ft.pixelStorei(ft.UNPACK_SKIP_PIXELS, p), ft.pixelStorei(ft.UNPACK_SKIP_ROWS, g), 
            ft.pixelStorei(ft.UNPACK_SKIP_IMAGES, f), 0 === r && n.generateMipmaps && ft.generateMipmap(c), 
            W.unbindTexture();
        }, this.initTexture = function(t) {
            t.isCubeTexture ? q.setTextureCube(t, 0) : t.isData3DTexture ? q.setTexture3D(t, 0) : t.isDataArrayTexture || t.isCompressedArrayTexture ? q.setTexture2DArray(t, 0) : q.setTexture2D(t, 0), 
            W.unbindTexture();
        }, this.resetState = function() {
            _ = 0, x = 0, y = null, W.reset(), pt.reset();
        }, "undefined" != typeof __THREE_DEVTOOLS__ && __THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe", {
            detail: this
        }));
    }
    get physicallyCorrectLights() {
        return console.warn("THREE.WebGLRenderer: the property .physicallyCorrectLights has been removed. Set renderer.useLegacyLights instead."), 
        !this.useLegacyLights;
    }
    set physicallyCorrectLights(t) {
        console.warn("THREE.WebGLRenderer: the property .physicallyCorrectLights has been removed. Set renderer.useLegacyLights instead."), 
        this.useLegacyLights = !t;
    }
    get outputEncoding() {
        return console.warn("THREE.WebGLRenderer: Property .outputEncoding has been removed. Use .outputColorSpace instead."), 
        "srgb" === this.outputColorSpace ? 3001 : 3e3;
    }
    set outputEncoding(t) {
        console.warn("THREE.WebGLRenderer: Property .outputEncoding has been removed. Use .outputColorSpace instead."), 
        this.outputColorSpace = 3001 === t ? "srgb" : "srgb-linear";
    }
}

(class extends $r {}).prototype.isWebGL1Renderer = !0;

class ts extends ee {
    constructor() {
        super(), this.isScene = !0, this.type = "Scene", this.background = null, this.environment = null, 
        this.fog = null, this.backgroundBlurriness = 0, this.backgroundIntensity = 1, this.overrideMaterial = null, 
        "undefined" != typeof __THREE_DEVTOOLS__ && __THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe", {
            detail: this
        }));
    }
    copy(t, e) {
        return super.copy(t, e), null !== t.background && (this.background = t.background.clone()), 
        null !== t.environment && (this.environment = t.environment.clone()), null !== t.fog && (this.fog = t.fog.clone()), 
        this.backgroundBlurriness = t.backgroundBlurriness, this.backgroundIntensity = t.backgroundIntensity, 
        null !== t.overrideMaterial && (this.overrideMaterial = t.overrideMaterial.clone()), 
        this.matrixAutoUpdate = t.matrixAutoUpdate, this;
    }
    toJSON(t) {
        const e = super.toJSON(t);
        return null !== this.fog && (e.object.fog = this.fog.toJSON()), this.backgroundBlurriness > 0 && (e.object.backgroundBlurriness = this.backgroundBlurriness), 
        1 !== this.backgroundIntensity && (e.object.backgroundIntensity = this.backgroundIntensity), 
        e;
    }
    get autoUpdate() {
        return console.warn("THREE.Scene: autoUpdate was renamed to matrixWorldAutoUpdate in r144."), 
        this.matrixWorldAutoUpdate;
    }
    set autoUpdate(t) {
        console.warn("THREE.Scene: autoUpdate was renamed to matrixWorldAutoUpdate in r144."), 
        this.matrixWorldAutoUpdate = t;
    }
}

class es {
    constructor(t, e) {
        this.isInterleavedBuffer = !0, this.array = t, this.stride = e, this.count = void 0 !== t ? t.length / e : 0, 
        this.usage = 35044, this.updateRange = {
            offset: 0,
            count: -1
        }, this.version = 0, this.uuid = x();
    }
    onUploadCallback() {}
    set needsUpdate(t) {
        !0 === t && this.version++;
    }
    setUsage(t) {
        return this.usage = t, this;
    }
    copy(t) {
        return this.array = new t.array.constructor(t.array), this.count = t.count, this.stride = t.stride, 
        this.usage = t.usage, this;
    }
    copyAt(t, e, i) {
        t *= this.stride, i *= e.stride;
        for (let n = 0, r = this.stride; n < r; n++) this.array[t + n] = e.array[i + n];
        return this;
    }
    set(t, e = 0) {
        return this.array.set(t, e), this;
    }
    clone(t) {
        void 0 === t.arrayBuffers && (t.arrayBuffers = {}), void 0 === this.array.buffer._uuid && (this.array.buffer._uuid = x()), 
        void 0 === t.arrayBuffers[this.array.buffer._uuid] && (t.arrayBuffers[this.array.buffer._uuid] = this.array.slice(0).buffer);
        const e = new this.array.constructor(t.arrayBuffers[this.array.buffer._uuid]), i = new this.constructor(e, this.stride);
        return i.setUsage(this.usage), i;
    }
    onUpload(t) {
        return this.onUploadCallback = t, this;
    }
    toJSON(t) {
        return void 0 === t.arrayBuffers && (t.arrayBuffers = {}), void 0 === this.array.buffer._uuid && (this.array.buffer._uuid = x()), 
        void 0 === t.arrayBuffers[this.array.buffer._uuid] && (t.arrayBuffers[this.array.buffer._uuid] = Array.from(new Uint32Array(this.array.buffer))), 
        {
            uuid: this.uuid,
            buffer: this.array.buffer._uuid,
            type: this.array.constructor.name,
            stride: this.stride
        };
    }
}

const is = new tt;

class ns {
    constructor(t, e, i, n = !1) {
        this.isInterleavedBufferAttribute = !0, this.name = "", this.data = t, this.itemSize = e, 
        this.offset = i, this.normalized = n;
    }
    get count() {
        return this.data.count;
    }
    get array() {
        return this.data.array;
    }
    set needsUpdate(t) {
        this.data.needsUpdate = t;
    }
    applyMatrix4(t) {
        for (let e = 0, i = this.data.count; e < i; e++) is.fromBufferAttribute(this, e), 
        is.applyMatrix4(t), this.setXYZ(e, is.x, is.y, is.z);
        return this;
    }
    applyNormalMatrix(t) {
        for (let e = 0, i = this.count; e < i; e++) is.fromBufferAttribute(this, e), is.applyNormalMatrix(t), 
        this.setXYZ(e, is.x, is.y, is.z);
        return this;
    }
    transformDirection(t) {
        for (let e = 0, i = this.count; e < i; e++) is.fromBufferAttribute(this, e), is.transformDirection(t), 
        this.setXYZ(e, is.x, is.y, is.z);
        return this;
    }
    setX(t, e) {
        return this.normalized && (e = A(e, this.array)), this.data.array[t * this.data.stride + this.offset] = e, 
        this;
    }
    setY(t, e) {
        return this.normalized && (e = A(e, this.array)), this.data.array[t * this.data.stride + this.offset + 1] = e, 
        this;
    }
    setZ(t, e) {
        return this.normalized && (e = A(e, this.array)), this.data.array[t * this.data.stride + this.offset + 2] = e, 
        this;
    }
    setW(t, e) {
        return this.normalized && (e = A(e, this.array)), this.data.array[t * this.data.stride + this.offset + 3] = e, 
        this;
    }
    getX(t) {
        let e = this.data.array[t * this.data.stride + this.offset];
        return this.normalized && (e = E(e, this.array)), e;
    }
    getY(t) {
        let e = this.data.array[t * this.data.stride + this.offset + 1];
        return this.normalized && (e = E(e, this.array)), e;
    }
    getZ(t) {
        let e = this.data.array[t * this.data.stride + this.offset + 2];
        return this.normalized && (e = E(e, this.array)), e;
    }
    getW(t) {
        let e = this.data.array[t * this.data.stride + this.offset + 3];
        return this.normalized && (e = E(e, this.array)), e;
    }
    setXY(t, e, i) {
        return t = t * this.data.stride + this.offset, this.normalized && (e = A(e, this.array), 
        i = A(i, this.array)), this.data.array[t + 0] = e, this.data.array[t + 1] = i, this;
    }
    setXYZ(t, e, i, n) {
        return t = t * this.data.stride + this.offset, this.normalized && (e = A(e, this.array), 
        i = A(i, this.array), n = A(n, this.array)), this.data.array[t + 0] = e, this.data.array[t + 1] = i, 
        this.data.array[t + 2] = n, this;
    }
    setXYZW(t, e, i, n, r) {
        return t = t * this.data.stride + this.offset, this.normalized && (e = A(e, this.array), 
        i = A(i, this.array), n = A(n, this.array), r = A(r, this.array)), this.data.array[t + 0] = e, 
        this.data.array[t + 1] = i, this.data.array[t + 2] = n, this.data.array[t + 3] = r, 
        this;
    }
    clone(t) {
        if (void 0 === t) {
            console.log("THREE.InterleavedBufferAttribute.clone(): Cloning an interleaved buffer attribute will de-interleave buffer data.");
            const t = [];
            for (let e = 0; e < this.count; e++) {
                const i = e * this.data.stride + this.offset;
                for (let e = 0; e < this.itemSize; e++) t.push(this.data.array[i + e]);
            }
            return new Te(new this.array.constructor(t), this.itemSize, this.normalized);
        }
        return void 0 === t.interleavedBuffers && (t.interleavedBuffers = {}), void 0 === t.interleavedBuffers[this.data.uuid] && (t.interleavedBuffers[this.data.uuid] = this.data.clone(t)), 
        new ns(t.interleavedBuffers[this.data.uuid], this.itemSize, this.offset, this.normalized);
    }
    toJSON(t) {
        if (void 0 === t) {
            console.log("THREE.InterleavedBufferAttribute.toJSON(): Serializing an interleaved buffer attribute will de-interleave buffer data.");
            const t = [];
            for (let e = 0; e < this.count; e++) {
                const i = e * this.data.stride + this.offset;
                for (let e = 0; e < this.itemSize; e++) t.push(this.data.array[i + e]);
            }
            return {
                itemSize: this.itemSize,
                type: this.array.constructor.name,
                array: t,
                normalized: this.normalized
            };
        }
        return void 0 === t.interleavedBuffers && (t.interleavedBuffers = {}), void 0 === t.interleavedBuffers[this.data.uuid] && (t.interleavedBuffers[this.data.uuid] = this.data.toJSON(t)), 
        {
            isInterleavedBufferAttribute: !0,
            itemSize: this.itemSize,
            data: this.data.uuid,
            offset: this.offset,
            normalized: this.normalized
        };
    }
}

const rs = new tt, ss = new Y, as = new Y, os = new tt, ls = new Rt, hs = new tt;

class cs extends ti {
    constructor(t, e) {
        super(t, e), this.isSkinnedMesh = !0, this.type = "SkinnedMesh", this.bindMode = "attached", 
        this.bindMatrix = new Rt, this.bindMatrixInverse = new Rt, this.boundingBox = null, 
        this.boundingSphere = null;
    }
    computeBoundingBox() {
        const t = this.geometry;
        null === this.boundingBox && (this.boundingBox = new nt), this.boundingBox.makeEmpty();
        const e = t.getAttribute("position");
        for (let t = 0; t < e.count; t++) hs.fromBufferAttribute(e, t), this.applyBoneTransform(t, hs), 
        this.boundingBox.expandByPoint(hs);
    }
    computeBoundingSphere() {
        const t = this.geometry;
        null === this.boundingSphere && (this.boundingSphere = new bt), this.boundingSphere.makeEmpty();
        const e = t.getAttribute("position");
        for (let t = 0; t < e.count; t++) hs.fromBufferAttribute(e, t), this.applyBoneTransform(t, hs), 
        this.boundingSphere.expandByPoint(hs);
    }
    copy(t, e) {
        return super.copy(t, e), this.bindMode = t.bindMode, this.bindMatrix.copy(t.bindMatrix), 
        this.bindMatrixInverse.copy(t.bindMatrixInverse), this.skeleton = t.skeleton, this;
    }
    getVertexPosition(t, e) {
        return super.getVertexPosition(t, e), this.applyBoneTransform(t, e), e;
    }
    bind(t, e) {
        this.skeleton = t, void 0 === e && (this.updateMatrixWorld(!0), this.skeleton.calculateInverses(), 
        e = this.matrixWorld), this.bindMatrix.copy(e), this.bindMatrixInverse.copy(e).invert();
    }
    pose() {
        this.skeleton.pose();
    }
    normalizeSkinWeights() {
        const t = new Y, e = this.geometry.attributes.skinWeight;
        for (let i = 0, n = e.count; i < n; i++) {
            t.fromBufferAttribute(e, i);
            const n = 1 / t.manhattanLength();
            n !== 1 / 0 ? t.multiplyScalar(n) : t.set(1, 0, 0, 0), e.setXYZW(i, t.x, t.y, t.z, t.w);
        }
    }
    updateMatrixWorld(t) {
        super.updateMatrixWorld(t), "attached" === this.bindMode ? this.bindMatrixInverse.copy(this.matrixWorld).invert() : "detached" === this.bindMode ? this.bindMatrixInverse.copy(this.bindMatrix).invert() : console.warn("THREE.SkinnedMesh: Unrecognized bindMode: " + this.bindMode);
    }
    applyBoneTransform(t, e) {
        const i = this.skeleton, n = this.geometry;
        ss.fromBufferAttribute(n.attributes.skinIndex, t), as.fromBufferAttribute(n.attributes.skinWeight, t), 
        rs.copy(e).applyMatrix4(this.bindMatrix), e.set(0, 0, 0);
        for (let t = 0; t < 4; t++) {
            const n = as.getComponent(t);
            if (0 !== n) {
                const r = ss.getComponent(t);
                ls.multiplyMatrices(i.bones[r].matrixWorld, i.boneInverses[r]), e.addScaledVector(os.copy(rs).applyMatrix4(ls), n);
            }
        }
        return e.applyMatrix4(this.bindMatrixInverse);
    }
    boneTransform(t, e) {
        return console.warn("THREE.SkinnedMesh: .boneTransform() was renamed to .applyBoneTransform() in r151."), 
        this.applyBoneTransform(t, e);
    }
}

class ds extends ee {
    constructor() {
        super(), this.isBone = !0, this.type = "Bone";
    }
}

class us extends K {
    constructor(t = null, e = 1, i = 1, n, r, s, a, o, l = 1003, h = 1003, c, d) {
        super(null, s, a, o, l, h, n, r, c, d), this.isDataTexture = !0, this.image = {
            data: t,
            width: e,
            height: i
        }, this.generateMipmaps = !1, this.flipY = !1, this.unpackAlignment = 1;
    }
}

const ps = new Rt, gs = new Rt;

class fs {
    constructor(t = [], e = []) {
        this.uuid = x(), this.bones = t.slice(0), this.boneInverses = e, this.boneMatrices = null, 
        this.boneTexture = null, this.boneTextureSize = 0, this.frame = -1, this.init();
    }
    init() {
        const t = this.bones, e = this.boneInverses;
        if (this.boneMatrices = new Float32Array(16 * t.length), 0 === e.length) this.calculateInverses(); else if (t.length !== e.length) {
            console.warn("THREE.Skeleton: Number of inverse bone matrices does not match amount of bones."), 
            this.boneInverses = [];
            for (let t = 0, e = this.bones.length; t < e; t++) this.boneInverses.push(new Rt);
        }
    }
    calculateInverses() {
        this.boneInverses.length = 0;
        for (let t = 0, e = this.bones.length; t < e; t++) {
            const e = new Rt;
            this.bones[t] && e.copy(this.bones[t].matrixWorld).invert(), this.boneInverses.push(e);
        }
    }
    pose() {
        for (let t = 0, e = this.bones.length; t < e; t++) {
            const e = this.bones[t];
            e && e.matrixWorld.copy(this.boneInverses[t]).invert();
        }
        for (let t = 0, e = this.bones.length; t < e; t++) {
            const e = this.bones[t];
            e && (e.parent && e.parent.isBone ? (e.matrix.copy(e.parent.matrixWorld).invert(), 
            e.matrix.multiply(e.matrixWorld)) : e.matrix.copy(e.matrixWorld), e.matrix.decompose(e.position, e.quaternion, e.scale));
        }
    }
    update() {
        const t = this.bones, e = this.boneInverses, i = this.boneMatrices, n = this.boneTexture;
        for (let n = 0, r = t.length; n < r; n++) {
            const r = t[n] ? t[n].matrixWorld : gs;
            ps.multiplyMatrices(r, e[n]), ps.toArray(i, 16 * n);
        }
        null !== n && (n.needsUpdate = !0);
    }
    clone() {
        return new fs(this.bones, this.boneInverses);
    }
    computeBoneTexture() {
        let t = Math.sqrt(4 * this.bones.length);
        t = M(t), t = Math.max(t, 4);
        const e = new Float32Array(t * t * 4);
        e.set(this.boneMatrices);
        const i = new us(e, t, t, 1023, 1015);
        return i.needsUpdate = !0, this.boneMatrices = e, this.boneTexture = i, this.boneTextureSize = t, 
        this;
    }
    getBoneByName(t) {
        for (let e = 0, i = this.bones.length; e < i; e++) {
            const i = this.bones[e];
            if (i.name === t) return i;
        }
    }
    dispose() {
        null !== this.boneTexture && (this.boneTexture.dispose(), this.boneTexture = null);
    }
    fromJSON(t, e) {
        this.uuid = t.uuid;
        for (let i = 0, n = t.bones.length; i < n; i++) {
            const n = t.bones[i];
            let r = e[n];
            void 0 === r && (console.warn("THREE.Skeleton: No bone found with UUID:", n), r = new ds), 
            this.bones.push(r), this.boneInverses.push((new Rt).fromArray(t.boneInverses[i]));
        }
        return this.init(), this;
    }
    toJSON() {
        const t = {
            metadata: {
                version: 4.5,
                type: "Skeleton",
                generator: "Skeleton.toJSON"
            },
            bones: [],
            boneInverses: []
        };
        t.uuid = this.uuid;
        const e = this.bones, i = this.boneInverses;
        for (let n = 0, r = e.length; n < r; n++) {
            const r = e[n];
            t.bones.push(r.uuid);
            const s = i[n];
            t.boneInverses.push(s.toArray());
        }
        return t;
    }
}

class ms extends Te {
    constructor(t, e, i, n = 1) {
        super(t, e, i), this.isInstancedBufferAttribute = !0, this.meshPerAttribute = n;
    }
    copy(t) {
        return super.copy(t), this.meshPerAttribute = t.meshPerAttribute, this;
    }
    toJSON() {
        const t = super.toJSON();
        return t.meshPerAttribute = this.meshPerAttribute, t.isInstancedBufferAttribute = !0, 
        t;
    }
}

const vs = new Rt, _s = new Rt, xs = [], ys = new nt, bs = new Rt, Ss = new ti, ws = new bt;

class Ms extends ti {
    constructor(t, e, i) {
        super(t, e), this.isInstancedMesh = !0, this.instanceMatrix = new ms(new Float32Array(16 * i), 16), 
        this.instanceColor = null, this.count = i, this.boundingBox = null, this.boundingSphere = null;
        for (let t = 0; t < i; t++) this.setMatrixAt(t, bs);
    }
    computeBoundingBox() {
        const t = this.geometry, e = this.count;
        null === this.boundingBox && (this.boundingBox = new nt), null === t.boundingBox && t.computeBoundingBox(), 
        this.boundingBox.makeEmpty();
        for (let i = 0; i < e; i++) this.getMatrixAt(i, vs), ys.copy(t.boundingBox).applyMatrix4(vs), 
        this.boundingBox.union(ys);
    }
    computeBoundingSphere() {
        const t = this.geometry, e = this.count;
        null === this.boundingSphere && (this.boundingSphere = new bt), null === t.boundingSphere && t.computeBoundingSphere(), 
        this.boundingSphere.makeEmpty();
        for (let i = 0; i < e; i++) this.getMatrixAt(i, vs), ws.copy(t.boundingSphere).applyMatrix4(vs), 
        this.boundingSphere.union(ws);
    }
    copy(t, e) {
        return super.copy(t, e), this.instanceMatrix.copy(t.instanceMatrix), null !== t.instanceColor && (this.instanceColor = t.instanceColor.clone()), 
        this.count = t.count, this;
    }
    getColorAt(t, e) {
        e.fromArray(this.instanceColor.array, 3 * t);
    }
    getMatrixAt(t, e) {
        e.fromArray(this.instanceMatrix.array, 16 * t);
    }
    raycast(t, e) {
        const i = this.matrixWorld, n = this.count;
        if (Ss.geometry = this.geometry, Ss.material = this.material, void 0 !== Ss.material && (null === this.boundingSphere && this.computeBoundingSphere(), 
        ws.copy(this.boundingSphere), ws.applyMatrix4(i), !1 !== t.ray.intersectsSphere(ws))) for (let r = 0; r < n; r++) {
            this.getMatrixAt(r, vs), _s.multiplyMatrices(i, vs), Ss.matrixWorld = _s, Ss.raycast(t, xs);
            for (let t = 0, i = xs.length; t < i; t++) {
                const i = xs[t];
                i.instanceId = r, i.object = this, e.push(i);
            }
            xs.length = 0;
        }
    }
    setColorAt(t, e) {
        null === this.instanceColor && (this.instanceColor = new ms(new Float32Array(3 * this.instanceMatrix.count), 3)), 
        e.toArray(this.instanceColor.array, 3 * t);
    }
    setMatrixAt(t, e) {
        e.toArray(this.instanceMatrix.array, 16 * t);
    }
    updateMorphTargets() {}
    dispose() {
        this.dispatchEvent({
            type: "dispose"
        });
    }
}

class Ts extends fe {
    constructor(t) {
        super(), this.isLineBasicMaterial = !0, this.type = "LineBasicMaterial", this.color = new ye(16777215), 
        this.map = null, this.linewidth = 1, this.linecap = "round", this.linejoin = "round", 
        this.fog = !0, this.setValues(t);
    }
    copy(t) {
        return super.copy(t), this.color.copy(t.color), this.map = t.map, this.linewidth = t.linewidth, 
        this.linecap = t.linecap, this.linejoin = t.linejoin, this.fog = t.fog, this;
    }
}

const Es = new tt, As = new tt, Cs = new Rt, Ps = new Pt, Rs = new bt;

class Ls extends ee {
    constructor(t = new Be, e = new Ts) {
        super(), this.isLine = !0, this.type = "Line", this.geometry = t, this.material = e, 
        this.updateMorphTargets();
    }
    copy(t, e) {
        return super.copy(t, e), this.material = t.material, this.geometry = t.geometry, 
        this;
    }
    computeLineDistances() {
        const t = this.geometry;
        if (null === t.index) {
            const e = t.attributes.position, i = [ 0 ];
            for (let t = 1, n = e.count; t < n; t++) Es.fromBufferAttribute(e, t - 1), As.fromBufferAttribute(e, t), 
            i[t] = i[t - 1], i[t] += Es.distanceTo(As);
            t.setAttribute("lineDistance", new Ce(i, 1));
        } else console.warn("THREE.Line.computeLineDistances(): Computation only possible with non-indexed BufferGeometry.");
        return this;
    }
    raycast(t, e) {
        const i = this.geometry, n = this.matrixWorld, r = t.params.Line.threshold, s = i.drawRange;
        if (null === i.boundingSphere && i.computeBoundingSphere(), Rs.copy(i.boundingSphere), 
        Rs.applyMatrix4(n), Rs.radius += r, !1 === t.ray.intersectsSphere(Rs)) return;
        Cs.copy(n).invert(), Ps.copy(t.ray).applyMatrix4(Cs);
        const a = r / ((this.scale.x + this.scale.y + this.scale.z) / 3), o = a * a, l = new tt, h = new tt, c = new tt, d = new tt, u = this.isLineSegments ? 2 : 1, p = i.index, g = i.attributes.position;
        if (null !== p) {
            for (let i = Math.max(0, s.start), n = Math.min(p.count, s.start + s.count) - 1; i < n; i += u) {
                const n = p.getX(i), r = p.getX(i + 1);
                l.fromBufferAttribute(g, n), h.fromBufferAttribute(g, r);
                if (Ps.distanceSqToSegment(l, h, d, c) > o) continue;
                d.applyMatrix4(this.matrixWorld);
                const s = t.ray.origin.distanceTo(d);
                s < t.near || s > t.far || e.push({
                    distance: s,
                    point: c.clone().applyMatrix4(this.matrixWorld),
                    index: i,
                    face: null,
                    faceIndex: null,
                    object: this
                });
            }
        } else {
            for (let i = Math.max(0, s.start), n = Math.min(g.count, s.start + s.count) - 1; i < n; i += u) {
                l.fromBufferAttribute(g, i), h.fromBufferAttribute(g, i + 1);
                if (Ps.distanceSqToSegment(l, h, d, c) > o) continue;
                d.applyMatrix4(this.matrixWorld);
                const n = t.ray.origin.distanceTo(d);
                n < t.near || n > t.far || e.push({
                    distance: n,
                    point: c.clone().applyMatrix4(this.matrixWorld),
                    index: i,
                    face: null,
                    faceIndex: null,
                    object: this
                });
            }
        }
    }
    updateMorphTargets() {
        const t = this.geometry.morphAttributes, e = Object.keys(t);
        if (e.length > 0) {
            const i = t[e[0]];
            if (void 0 !== i) {
                this.morphTargetInfluences = [], this.morphTargetDictionary = {};
                for (let t = 0, e = i.length; t < e; t++) {
                    const e = i[t].name || String(t);
                    this.morphTargetInfluences.push(0), this.morphTargetDictionary[e] = t;
                }
            }
        }
    }
}

const Ds = new tt, Is = new tt;

class Us extends Ls {
    constructor(t, e) {
        super(t, e), this.isLineSegments = !0, this.type = "LineSegments";
    }
    computeLineDistances() {
        const t = this.geometry;
        if (null === t.index) {
            const e = t.attributes.position, i = [];
            for (let t = 0, n = e.count; t < n; t += 2) Ds.fromBufferAttribute(e, t), Is.fromBufferAttribute(e, t + 1), 
            i[t] = 0 === t ? 0 : i[t - 1], i[t + 1] = i[t] + Ds.distanceTo(Is);
            t.setAttribute("lineDistance", new Ce(i, 1));
        } else console.warn("THREE.LineSegments.computeLineDistances(): Computation only possible with non-indexed BufferGeometry.");
        return this;
    }
}

class Ns extends Ls {
    constructor(t, e) {
        super(t, e), this.isLineLoop = !0, this.type = "LineLoop";
    }
}

class Bs extends fe {
    constructor(t) {
        super(), this.isPointsMaterial = !0, this.type = "PointsMaterial", this.color = new ye(16777215), 
        this.map = null, this.alphaMap = null, this.size = 1, this.sizeAttenuation = !0, 
        this.fog = !0, this.setValues(t);
    }
    copy(t) {
        return super.copy(t), this.color.copy(t.color), this.map = t.map, this.alphaMap = t.alphaMap, 
        this.size = t.size, this.sizeAttenuation = t.sizeAttenuation, this.fog = t.fog, 
        this;
    }
}

const Os = new Rt, Fs = new Pt, ks = new bt, Hs = new tt;

class zs extends ee {
    constructor(t = new Be, e = new Bs) {
        super(), this.isPoints = !0, this.type = "Points", this.geometry = t, this.material = e, 
        this.updateMorphTargets();
    }
    copy(t, e) {
        return super.copy(t, e), this.material = t.material, this.geometry = t.geometry, 
        this;
    }
    raycast(t, e) {
        const i = this.geometry, n = this.matrixWorld, r = t.params.Points.threshold, s = i.drawRange;
        if (null === i.boundingSphere && i.computeBoundingSphere(), ks.copy(i.boundingSphere), 
        ks.applyMatrix4(n), ks.radius += r, !1 === t.ray.intersectsSphere(ks)) return;
        Os.copy(n).invert(), Fs.copy(t.ray).applyMatrix4(Os);
        const a = r / ((this.scale.x + this.scale.y + this.scale.z) / 3), o = a * a, l = i.index, h = i.attributes.position;
        if (null !== l) {
            for (let i = Math.max(0, s.start), r = Math.min(l.count, s.start + s.count); i < r; i++) {
                const r = l.getX(i);
                Hs.fromBufferAttribute(h, r), Gs(Hs, r, o, n, t, e, this);
            }
        } else {
            for (let i = Math.max(0, s.start), r = Math.min(h.count, s.start + s.count); i < r; i++) Hs.fromBufferAttribute(h, i), 
            Gs(Hs, i, o, n, t, e, this);
        }
    }
    updateMorphTargets() {
        const t = this.geometry.morphAttributes, e = Object.keys(t);
        if (e.length > 0) {
            const i = t[e[0]];
            if (void 0 !== i) {
                this.morphTargetInfluences = [], this.morphTargetDictionary = {};
                for (let t = 0, e = i.length; t < e; t++) {
                    const e = i[t].name || String(t);
                    this.morphTargetInfluences.push(0), this.morphTargetDictionary[e] = t;
                }
            }
        }
    }
}

function Gs(t, e, i, n, r, s, a) {
    const o = Fs.distanceSqToPoint(t);
    if (o < i) {
        const i = new tt;
        Fs.closestPointToPoint(t, i), i.applyMatrix4(n);
        const l = r.ray.origin.distanceTo(i);
        if (l < r.near || l > r.far) return;
        s.push({
            distance: l,
            distanceToRay: Math.sqrt(o),
            point: i,
            index: e,
            face: null,
            object: a
        });
    }
}

class Vs extends K {
    constructor(t, e, i, n, r, s, a, o, l) {
        super(t, e, i, n, r, s, a, o, l), this.isCanvasTexture = !0, this.needsUpdate = !0;
    }
}

class Ws extends fe {
    constructor(t) {
        super(), this.isMeshStandardMaterial = !0, this.defines = {
            STANDARD: ""
        }, this.type = "MeshStandardMaterial", this.color = new ye(16777215), this.roughness = 1, 
        this.metalness = 0, this.map = null, this.lightMap = null, this.lightMapIntensity = 1, 
        this.aoMap = null, this.aoMapIntensity = 1, this.emissive = new ye(0), this.emissiveIntensity = 1, 
        this.emissiveMap = null, this.bumpMap = null, this.bumpScale = 1, this.normalMap = null, 
        this.normalMapType = 0, this.normalScale = new P(1, 1), this.displacementMap = null, 
        this.displacementScale = 1, this.displacementBias = 0, this.roughnessMap = null, 
        this.metalnessMap = null, this.alphaMap = null, this.envMap = null, this.envMapIntensity = 1, 
        this.wireframe = !1, this.wireframeLinewidth = 1, this.wireframeLinecap = "round", 
        this.wireframeLinejoin = "round", this.flatShading = !1, this.fog = !0, this.setValues(t);
    }
    copy(t) {
        return super.copy(t), this.defines = {
            STANDARD: ""
        }, this.color.copy(t.color), this.roughness = t.roughness, this.metalness = t.metalness, 
        this.map = t.map, this.lightMap = t.lightMap, this.lightMapIntensity = t.lightMapIntensity, 
        this.aoMap = t.aoMap, this.aoMapIntensity = t.aoMapIntensity, this.emissive.copy(t.emissive), 
        this.emissiveMap = t.emissiveMap, this.emissiveIntensity = t.emissiveIntensity, 
        this.bumpMap = t.bumpMap, this.bumpScale = t.bumpScale, this.normalMap = t.normalMap, 
        this.normalMapType = t.normalMapType, this.normalScale.copy(t.normalScale), this.displacementMap = t.displacementMap, 
        this.displacementScale = t.displacementScale, this.displacementBias = t.displacementBias, 
        this.roughnessMap = t.roughnessMap, this.metalnessMap = t.metalnessMap, this.alphaMap = t.alphaMap, 
        this.envMap = t.envMap, this.envMapIntensity = t.envMapIntensity, this.wireframe = t.wireframe, 
        this.wireframeLinewidth = t.wireframeLinewidth, this.wireframeLinecap = t.wireframeLinecap, 
        this.wireframeLinejoin = t.wireframeLinejoin, this.flatShading = t.flatShading, 
        this.fog = t.fog, this;
    }
}

class js extends Ws {
    constructor(t) {
        super(), this.isMeshPhysicalMaterial = !0, this.defines = {
            STANDARD: "",
            PHYSICAL: ""
        }, this.type = "MeshPhysicalMaterial", this.clearcoatMap = null, this.clearcoatRoughness = 0, 
        this.clearcoatRoughnessMap = null, this.clearcoatNormalScale = new P(1, 1), this.clearcoatNormalMap = null, 
        this.ior = 1.5, Object.defineProperty(this, "reflectivity", {
            get: function() {
                return y(2.5 * (this.ior - 1) / (this.ior + 1), 0, 1);
            },
            set: function(t) {
                this.ior = (1 + .4 * t) / (1 - .4 * t);
            }
        }), this.iridescenceMap = null, this.iridescenceIOR = 1.3, this.iridescenceThicknessRange = [ 100, 400 ], 
        this.iridescenceThicknessMap = null, this.sheenColor = new ye(0), this.sheenColorMap = null, 
        this.sheenRoughness = 1, this.sheenRoughnessMap = null, this.transmissionMap = null, 
        this.thickness = 0, this.thicknessMap = null, this.attenuationDistance = 1 / 0, 
        this.attenuationColor = new ye(1, 1, 1), this.specularIntensity = 1, this.specularIntensityMap = null, 
        this.specularColor = new ye(1, 1, 1), this.specularColorMap = null, this._sheen = 0, 
        this._clearcoat = 0, this._iridescence = 0, this._transmission = 0, this.setValues(t);
    }
    get sheen() {
        return this._sheen;
    }
    set sheen(t) {
        this._sheen > 0 != t > 0 && this.version++, this._sheen = t;
    }
    get clearcoat() {
        return this._clearcoat;
    }
    set clearcoat(t) {
        this._clearcoat > 0 != t > 0 && this.version++, this._clearcoat = t;
    }
    get iridescence() {
        return this._iridescence;
    }
    set iridescence(t) {
        this._iridescence > 0 != t > 0 && this.version++, this._iridescence = t;
    }
    get transmission() {
        return this._transmission;
    }
    set transmission(t) {
        this._transmission > 0 != t > 0 && this.version++, this._transmission = t;
    }
    copy(t) {
        return super.copy(t), this.defines = {
            STANDARD: "",
            PHYSICAL: ""
        }, this.clearcoat = t.clearcoat, this.clearcoatMap = t.clearcoatMap, this.clearcoatRoughness = t.clearcoatRoughness, 
        this.clearcoatRoughnessMap = t.clearcoatRoughnessMap, this.clearcoatNormalMap = t.clearcoatNormalMap, 
        this.clearcoatNormalScale.copy(t.clearcoatNormalScale), this.ior = t.ior, this.iridescence = t.iridescence, 
        this.iridescenceMap = t.iridescenceMap, this.iridescenceIOR = t.iridescenceIOR, 
        this.iridescenceThicknessRange = [ ...t.iridescenceThicknessRange ], this.iridescenceThicknessMap = t.iridescenceThicknessMap, 
        this.sheen = t.sheen, this.sheenColor.copy(t.sheenColor), this.sheenColorMap = t.sheenColorMap, 
        this.sheenRoughness = t.sheenRoughness, this.sheenRoughnessMap = t.sheenRoughnessMap, 
        this.transmission = t.transmission, this.transmissionMap = t.transmissionMap, this.thickness = t.thickness, 
        this.thicknessMap = t.thicknessMap, this.attenuationDistance = t.attenuationDistance, 
        this.attenuationColor.copy(t.attenuationColor), this.specularIntensity = t.specularIntensity, 
        this.specularIntensityMap = t.specularIntensityMap, this.specularColor.copy(t.specularColor), 
        this.specularColorMap = t.specularColorMap, this;
    }
}

function Xs(t, e, i) {
    return Ks(t) ? new t.constructor(t.subarray(e, void 0 !== i ? i : t.length)) : t.slice(e, i);
}

function qs(t, e, i) {
    return !t || !i && t.constructor === e ? t : "number" == typeof e.BYTES_PER_ELEMENT ? new e(t) : Array.prototype.slice.call(t);
}

function Ks(t) {
    return ArrayBuffer.isView(t) && !(t instanceof DataView);
}

function Ys(t) {
    const e = t.length, i = new Array(e);
    for (let t = 0; t !== e; ++t) i[t] = t;
    return i.sort((function(e, i) {
        return t[e] - t[i];
    })), i;
}

function Zs(t, e, i) {
    const n = t.length, r = new t.constructor(n);
    for (let s = 0, a = 0; a !== n; ++s) {
        const n = i[s] * e;
        for (let i = 0; i !== e; ++i) r[a++] = t[n + i];
    }
    return r;
}

function Js(t, e, i, n) {
    let r = 1, s = t[0];
    for (;void 0 !== s && void 0 === s[n]; ) s = t[r++];
    if (void 0 === s) return;
    let a = s[n];
    if (void 0 !== a) if (Array.isArray(a)) do {
        a = s[n], void 0 !== a && (e.push(s.time), i.push.apply(i, a)), s = t[r++];
    } while (void 0 !== s); else if (void 0 !== a.toArray) do {
        a = s[n], void 0 !== a && (e.push(s.time), a.toArray(i, i.length)), s = t[r++];
    } while (void 0 !== s); else do {
        a = s[n], void 0 !== a && (e.push(s.time), i.push(a)), s = t[r++];
    } while (void 0 !== s);
}

class Qs {
    constructor(t, e, i, n) {
        this.parameterPositions = t, this._cachedIndex = 0, this.resultBuffer = void 0 !== n ? n : new e.constructor(i), 
        this.sampleValues = e, this.valueSize = i, this.settings = null, this.DefaultSettings_ = {};
    }
    evaluate(t) {
        const e = this.parameterPositions;
        let i = this._cachedIndex, n = e[i], r = e[i - 1];
        t: {
            e: {
                let s;
                i: {
                    n: if (!(t < n)) {
                        for (let s = i + 2; ;) {
                            if (void 0 === n) {
                                if (t < r) break n;
                                return i = e.length, this._cachedIndex = i, this.copySampleValue_(i - 1);
                            }
                            if (i === s) break;
                            if (r = n, n = e[++i], t < n) break e;
                        }
                        s = e.length;
                        break i;
                    }
                    if (t >= r) break t;
                    {
                        const a = e[1];
                        t < a && (i = 2, r = a);
                        for (let s = i - 2; ;) {
                            if (void 0 === r) return this._cachedIndex = 0, this.copySampleValue_(0);
                            if (i === s) break;
                            if (n = r, r = e[--i - 1], t >= r) break e;
                        }
                        s = i, i = 0;
                    }
                }
                for (;i < s; ) {
                    const n = i + s >>> 1;
                    t < e[n] ? s = n : i = n + 1;
                }
                if (n = e[i], r = e[i - 1], void 0 === r) return this._cachedIndex = 0, this.copySampleValue_(0);
                if (void 0 === n) return i = e.length, this._cachedIndex = i, this.copySampleValue_(i - 1);
            }
            this._cachedIndex = i, this.intervalChanged_(i, r, n);
        }
        return this.interpolate_(i, r, t, n);
    }
    getSettings_() {
        return this.settings || this.DefaultSettings_;
    }
    copySampleValue_(t) {
        const e = this.resultBuffer, i = this.sampleValues, n = this.valueSize, r = t * n;
        for (let t = 0; t !== n; ++t) e[t] = i[r + t];
        return e;
    }
    interpolate_() {
        throw new Error("call to abstract method");
    }
    intervalChanged_() {}
}

class $s extends Qs {
    constructor(t, e, i, n) {
        super(t, e, i, n), this._weightPrev = -0, this._offsetPrev = -0, this._weightNext = -0, 
        this._offsetNext = -0, this.DefaultSettings_ = {
            endingStart: 2400,
            endingEnd: 2400
        };
    }
    intervalChanged_(t, e, i) {
        const n = this.parameterPositions;
        let r = t - 2, s = t + 1, a = n[r], o = n[s];
        if (void 0 === a) switch (this.getSettings_().endingStart) {
          case 2401:
            r = t, a = 2 * e - i;
            break;

          case 2402:
            r = n.length - 2, a = e + n[r] - n[r + 1];
            break;

          default:
            r = t, a = i;
        }
        if (void 0 === o) switch (this.getSettings_().endingEnd) {
          case 2401:
            s = t, o = 2 * i - e;
            break;

          case 2402:
            s = 1, o = i + n[1] - n[0];
            break;

          default:
            s = t - 1, o = e;
        }
        const l = .5 * (i - e), h = this.valueSize;
        this._weightPrev = l / (e - a), this._weightNext = l / (o - i), this._offsetPrev = r * h, 
        this._offsetNext = s * h;
    }
    interpolate_(t, e, i, n) {
        const r = this.resultBuffer, s = this.sampleValues, a = this.valueSize, o = t * a, l = o - a, h = this._offsetPrev, c = this._offsetNext, d = this._weightPrev, u = this._weightNext, p = (i - e) / (n - e), g = p * p, f = g * p, m = -d * f + 2 * d * g - d * p, v = (1 + d) * f + (-1.5 - 2 * d) * g + (-.5 + d) * p + 1, _ = (-1 - u) * f + (1.5 + u) * g + .5 * p, x = u * f - u * g;
        for (let t = 0; t !== a; ++t) r[t] = m * s[h + t] + v * s[l + t] + _ * s[o + t] + x * s[c + t];
        return r;
    }
}

class ta extends Qs {
    constructor(t, e, i, n) {
        super(t, e, i, n);
    }
    interpolate_(t, e, i, n) {
        const r = this.resultBuffer, s = this.sampleValues, a = this.valueSize, o = t * a, l = o - a, h = (i - e) / (n - e), c = 1 - h;
        for (let t = 0; t !== a; ++t) r[t] = s[l + t] * c + s[o + t] * h;
        return r;
    }
}

class ea extends Qs {
    constructor(t, e, i, n) {
        super(t, e, i, n);
    }
    interpolate_(t) {
        return this.copySampleValue_(t - 1);
    }
}

class ia {
    constructor(t, e, i, n) {
        if (void 0 === t) throw new Error("THREE.KeyframeTrack: track name is undefined");
        if (void 0 === e || 0 === e.length) throw new Error("THREE.KeyframeTrack: no keyframes in track named " + t);
        this.name = t, this.times = qs(e, this.TimeBufferType), this.values = qs(i, this.ValueBufferType), 
        this.setInterpolation(n || this.DefaultInterpolation);
    }
    static toJSON(t) {
        const e = t.constructor;
        let i;
        if (e.toJSON !== this.toJSON) i = e.toJSON(t); else {
            i = {
                name: t.name,
                times: qs(t.times, Array),
                values: qs(t.values, Array)
            };
            const e = t.getInterpolation();
            e !== t.DefaultInterpolation && (i.interpolation = e);
        }
        return i.type = t.ValueTypeName, i;
    }
    InterpolantFactoryMethodDiscrete(t) {
        return new ea(this.times, this.values, this.getValueSize(), t);
    }
    InterpolantFactoryMethodLinear(t) {
        return new ta(this.times, this.values, this.getValueSize(), t);
    }
    InterpolantFactoryMethodSmooth(t) {
        return new $s(this.times, this.values, this.getValueSize(), t);
    }
    setInterpolation(t) {
        let e;
        switch (t) {
          case 2300:
            e = this.InterpolantFactoryMethodDiscrete;
            break;

          case 2301:
            e = this.InterpolantFactoryMethodLinear;
            break;

          case 2302:
            e = this.InterpolantFactoryMethodSmooth;
        }
        if (void 0 === e) {
            const e = "unsupported interpolation for " + this.ValueTypeName + " keyframe track named " + this.name;
            if (void 0 === this.createInterpolant) {
                if (t === this.DefaultInterpolation) throw new Error(e);
                this.setInterpolation(this.DefaultInterpolation);
            }
            return console.warn("THREE.KeyframeTrack:", e), this;
        }
        return this.createInterpolant = e, this;
    }
    getInterpolation() {
        switch (this.createInterpolant) {
          case this.InterpolantFactoryMethodDiscrete:
            return 2300;

          case this.InterpolantFactoryMethodLinear:
            return 2301;

          case this.InterpolantFactoryMethodSmooth:
            return 2302;
        }
    }
    getValueSize() {
        return this.values.length / this.times.length;
    }
    shift(t) {
        if (0 !== t) {
            const e = this.times;
            for (let i = 0, n = e.length; i !== n; ++i) e[i] += t;
        }
        return this;
    }
    scale(t) {
        if (1 !== t) {
            const e = this.times;
            for (let i = 0, n = e.length; i !== n; ++i) e[i] *= t;
        }
        return this;
    }
    trim(t, e) {
        const i = this.times, n = i.length;
        let r = 0, s = n - 1;
        for (;r !== n && i[r] < t; ) ++r;
        for (;-1 !== s && i[s] > e; ) --s;
        if (++s, 0 !== r || s !== n) {
            r >= s && (s = Math.max(s, 1), r = s - 1);
            const t = this.getValueSize();
            this.times = Xs(i, r, s), this.values = Xs(this.values, r * t, s * t);
        }
        return this;
    }
    validate() {
        let t = !0;
        const e = this.getValueSize();
        e - Math.floor(e) != 0 && (console.error("THREE.KeyframeTrack: Invalid value size in track.", this), 
        t = !1);
        const i = this.times, n = this.values, r = i.length;
        0 === r && (console.error("THREE.KeyframeTrack: Track is empty.", this), t = !1);
        let s = null;
        for (let e = 0; e !== r; e++) {
            const n = i[e];
            if ("number" == typeof n && isNaN(n)) {
                console.error("THREE.KeyframeTrack: Time is not a valid number.", this, e, n), t = !1;
                break;
            }
            if (null !== s && s > n) {
                console.error("THREE.KeyframeTrack: Out of order keys.", this, e, n, s), t = !1;
                break;
            }
            s = n;
        }
        if (void 0 !== n && Ks(n)) for (let e = 0, i = n.length; e !== i; ++e) {
            const i = n[e];
            if (isNaN(i)) {
                console.error("THREE.KeyframeTrack: Value is not a valid number.", this, e, i), 
                t = !1;
                break;
            }
        }
        return t;
    }
    optimize() {
        const t = Xs(this.times), e = Xs(this.values), i = this.getValueSize(), n = 2302 === this.getInterpolation(), r = t.length - 1;
        let s = 1;
        for (let a = 1; a < r; ++a) {
            let r = !1;
            const o = t[a];
            if (o !== t[a + 1] && (1 !== a || o !== t[0])) if (n) r = !0; else {
                const t = a * i, n = t - i, s = t + i;
                for (let a = 0; a !== i; ++a) {
                    const i = e[t + a];
                    if (i !== e[n + a] || i !== e[s + a]) {
                        r = !0;
                        break;
                    }
                }
            }
            if (r) {
                if (a !== s) {
                    t[s] = t[a];
                    const n = a * i, r = s * i;
                    for (let t = 0; t !== i; ++t) e[r + t] = e[n + t];
                }
                ++s;
            }
        }
        if (r > 0) {
            t[s] = t[r];
            for (let t = r * i, n = s * i, a = 0; a !== i; ++a) e[n + a] = e[t + a];
            ++s;
        }
        return s !== t.length ? (this.times = Xs(t, 0, s), this.values = Xs(e, 0, s * i)) : (this.times = t, 
        this.values = e), this;
    }
    clone() {
        const t = Xs(this.times, 0), e = Xs(this.values, 0), i = new (0, this.constructor)(this.name, t, e);
        return i.createInterpolant = this.createInterpolant, i;
    }
}

ia.prototype.TimeBufferType = Float32Array, ia.prototype.ValueBufferType = Float32Array, 
ia.prototype.DefaultInterpolation = 2301;

class na extends ia {}

na.prototype.ValueTypeName = "bool", na.prototype.ValueBufferType = Array, na.prototype.DefaultInterpolation = 2300, 
na.prototype.InterpolantFactoryMethodLinear = void 0, na.prototype.InterpolantFactoryMethodSmooth = void 0;

class ra extends ia {}

ra.prototype.ValueTypeName = "color";

class sa extends ia {}

sa.prototype.ValueTypeName = "number";

class aa extends Qs {
    constructor(t, e, i, n) {
        super(t, e, i, n);
    }
    interpolate_(t, e, i, n) {
        const r = this.resultBuffer, s = this.sampleValues, a = this.valueSize, o = (i - e) / (n - e);
        let l = t * a;
        for (let t = l + a; l !== t; l += 4) $.slerpFlat(r, 0, s, l - a, s, l, o);
        return r;
    }
}

class oa extends ia {
    InterpolantFactoryMethodLinear(t) {
        return new aa(this.times, this.values, this.getValueSize(), t);
    }
}

oa.prototype.ValueTypeName = "quaternion", oa.prototype.DefaultInterpolation = 2301, 
oa.prototype.InterpolantFactoryMethodSmooth = void 0;

class la extends ia {}

la.prototype.ValueTypeName = "string", la.prototype.ValueBufferType = Array, la.prototype.DefaultInterpolation = 2300, 
la.prototype.InterpolantFactoryMethodLinear = void 0, la.prototype.InterpolantFactoryMethodSmooth = void 0;

class ha extends ia {}

ha.prototype.ValueTypeName = "vector";

class ca {
    constructor(t, e = -1, i, n = 2500) {
        this.name = t, this.tracks = i, this.duration = e, this.blendMode = n, this.uuid = x(), 
        this.duration < 0 && this.resetDuration();
    }
    static parse(t) {
        const e = [], i = t.tracks, n = 1 / (t.fps || 1);
        for (let t = 0, r = i.length; t !== r; ++t) e.push(da(i[t]).scale(n));
        const r = new this(t.name, t.duration, e, t.blendMode);
        return r.uuid = t.uuid, r;
    }
    static toJSON(t) {
        const e = [], i = t.tracks, n = {
            name: t.name,
            duration: t.duration,
            tracks: e,
            uuid: t.uuid,
            blendMode: t.blendMode
        };
        for (let t = 0, n = i.length; t !== n; ++t) e.push(ia.toJSON(i[t]));
        return n;
    }
    static CreateFromMorphTargetSequence(t, e, i, n) {
        const r = e.length, s = [];
        for (let t = 0; t < r; t++) {
            let a = [], o = [];
            a.push((t + r - 1) % r, t, (t + 1) % r), o.push(0, 1, 0);
            const l = Ys(a);
            a = Zs(a, 1, l), o = Zs(o, 1, l), n || 0 !== a[0] || (a.push(r), o.push(o[0])), 
            s.push(new sa(".morphTargetInfluences[" + e[t].name + "]", a, o).scale(1 / i));
        }
        return new this(t, -1, s);
    }
    static findByName(t, e) {
        let i = t;
        if (!Array.isArray(t)) {
            const e = t;
            i = e.geometry && e.geometry.animations || e.animations;
        }
        for (let t = 0; t < i.length; t++) if (i[t].name === e) return i[t];
        return null;
    }
    static CreateClipsFromMorphTargetSequences(t, e, i) {
        const n = {}, r = /^([\w-]*?)([\d]+)$/;
        for (let e = 0, i = t.length; e < i; e++) {
            const i = t[e], s = i.name.match(r);
            if (s && s.length > 1) {
                const t = s[1];
                let e = n[t];
                e || (n[t] = e = []), e.push(i);
            }
        }
        const s = [];
        for (const t in n) s.push(this.CreateFromMorphTargetSequence(t, n[t], e, i));
        return s;
    }
    static parseAnimation(t, e) {
        if (!t) return console.error("THREE.AnimationClip: No animation in JSONLoader data."), 
        null;
        const i = function(t, e, i, n, r) {
            if (0 !== i.length) {
                const s = [], a = [];
                Js(i, s, a, n), 0 !== s.length && r.push(new t(e, s, a));
            }
        }, n = [], r = t.name || "default", s = t.fps || 30, a = t.blendMode;
        let o = t.length || -1;
        const l = t.hierarchy || [];
        for (let t = 0; t < l.length; t++) {
            const r = l[t].keys;
            if (r && 0 !== r.length) if (r[0].morphTargets) {
                const t = {};
                let e;
                for (e = 0; e < r.length; e++) if (r[e].morphTargets) for (let i = 0; i < r[e].morphTargets.length; i++) t[r[e].morphTargets[i]] = -1;
                for (const i in t) {
                    const t = [], s = [];
                    for (let n = 0; n !== r[e].morphTargets.length; ++n) {
                        const n = r[e];
                        t.push(n.time), s.push(n.morphTarget === i ? 1 : 0);
                    }
                    n.push(new sa(".morphTargetInfluence[" + i + "]", t, s));
                }
                o = t.length * s;
            } else {
                const s = ".bones[" + e[t].name + "]";
                i(ha, s + ".position", r, "pos", n), i(oa, s + ".quaternion", r, "rot", n), i(ha, s + ".scale", r, "scl", n);
            }
        }
        if (0 === n.length) return null;
        return new this(r, o, n, a);
    }
    resetDuration() {
        let t = 0;
        for (let e = 0, i = this.tracks.length; e !== i; ++e) {
            const i = this.tracks[e];
            t = Math.max(t, i.times[i.times.length - 1]);
        }
        return this.duration = t, this;
    }
    trim() {
        for (let t = 0; t < this.tracks.length; t++) this.tracks[t].trim(0, this.duration);
        return this;
    }
    validate() {
        let t = !0;
        for (let e = 0; e < this.tracks.length; e++) t = t && this.tracks[e].validate();
        return t;
    }
    optimize() {
        for (let t = 0; t < this.tracks.length; t++) this.tracks[t].optimize();
        return this;
    }
    clone() {
        const t = [];
        for (let e = 0; e < this.tracks.length; e++) t.push(this.tracks[e].clone());
        return new this.constructor(this.name, this.duration, t, this.blendMode);
    }
    toJSON() {
        return this.constructor.toJSON(this);
    }
}

function da(t) {
    if (void 0 === t.type) throw new Error("THREE.KeyframeTrack: track type undefined, can not parse");
    const e = function(t) {
        switch (t.toLowerCase()) {
          case "scalar":
          case "double":
          case "float":
          case "number":
          case "integer":
            return sa;

          case "vector":
          case "vector2":
          case "vector3":
          case "vector4":
            return ha;

          case "color":
            return ra;

          case "quaternion":
            return oa;

          case "bool":
          case "boolean":
            return na;

          case "string":
            return la;
        }
        throw new Error("THREE.KeyframeTrack: Unsupported typeName: " + t);
    }(t.type);
    if (void 0 === t.times) {
        const e = [], i = [];
        Js(t.keys, e, i, "value"), t.times = e, t.values = i;
    }
    return void 0 !== e.parse ? e.parse(t) : new e(t.name, t.times, t.values, t.interpolation);
}

const ua = {
    enabled: !1,
    files: {},
    add: function(t, e) {
        !1 !== this.enabled && (this.files[t] = e);
    },
    get: function(t) {
        if (!1 !== this.enabled) return this.files[t];
    },
    remove: function(t) {
        delete this.files[t];
    },
    clear: function() {
        this.files = {};
    }
};

class pa {
    constructor(t, e, i) {
        const n = this;
        let r, s = !1, a = 0, o = 0;
        const l = [];
        this.onStart = void 0, this.onLoad = t, this.onProgress = e, this.onError = i, this.itemStart = function(t) {
            o++, !1 === s && void 0 !== n.onStart && n.onStart(t, a, o), s = !0;
        }, this.itemEnd = function(t) {
            a++, void 0 !== n.onProgress && n.onProgress(t, a, o), a === o && (s = !1, void 0 !== n.onLoad && n.onLoad());
        }, this.itemError = function(t) {
            void 0 !== n.onError && n.onError(t);
        }, this.resolveURL = function(t) {
            return r ? r(t) : t;
        }, this.setURLModifier = function(t) {
            return r = t, this;
        }, this.addHandler = function(t, e) {
            return l.push(t, e), this;
        }, this.removeHandler = function(t) {
            const e = l.indexOf(t);
            return -1 !== e && l.splice(e, 2), this;
        }, this.getHandler = function(t) {
            for (let e = 0, i = l.length; e < i; e += 2) {
                const i = l[e], n = l[e + 1];
                if (i.global && (i.lastIndex = 0), i.test(t)) return n;
            }
            return null;
        };
    }
}

const ga = new pa;

class fa {
    constructor(t) {
        this.manager = void 0 !== t ? t : ga, this.crossOrigin = "anonymous", this.withCredentials = !1, 
        this.path = "", this.resourcePath = "", this.requestHeader = {};
    }
    load() {}
    loadAsync(t, e) {
        const i = this;
        return new Promise((function(n, r) {
            i.load(t, n, e, r);
        }));
    }
    parse() {}
    setCrossOrigin(t) {
        return this.crossOrigin = t, this;
    }
    setWithCredentials(t) {
        return this.withCredentials = t, this;
    }
    setPath(t) {
        return this.path = t, this;
    }
    setResourcePath(t) {
        return this.resourcePath = t, this;
    }
    setRequestHeader(t) {
        return this.requestHeader = t, this;
    }
}

const ma = {};

class va extends Error {
    constructor(t, e) {
        super(t), this.response = e;
    }
}

class _a extends fa {
    constructor(t) {
        super(t);
    }
    load(t, e, i, n) {
        void 0 === t && (t = ""), void 0 !== this.path && (t = this.path + t), t = this.manager.resolveURL(t);
        const r = ua.get(t);
        if (void 0 !== r) return this.manager.itemStart(t), setTimeout((() => {
            e && e(r), this.manager.itemEnd(t);
        }), 0), r;
        if (void 0 !== ma[t]) return void ma[t].push({
            onLoad: e,
            onProgress: i,
            onError: n
        });
        ma[t] = [], ma[t].push({
            onLoad: e,
            onProgress: i,
            onError: n
        });
        const s = new Request(t, {
            headers: new Headers(this.requestHeader),
            credentials: this.withCredentials ? "include" : "same-origin"
        }), a = this.mimeType, o = this.responseType;
        fetch(s).then((e => {
            if (200 === e.status || 0 === e.status) {
                if (0 === e.status && console.warn("THREE.FileLoader: HTTP Status 0 received."), 
                "undefined" == typeof ReadableStream || void 0 === e.body || void 0 === e.body.getReader) return e;
                const i = ma[t], n = e.body.getReader(), r = e.headers.get("Content-Length") || e.headers.get("X-File-Size"), s = r ? parseInt(r) : 0, a = 0 !== s;
                let o = 0;
                const l = new ReadableStream({
                    start(t) {
                        !function e() {
                            n.read().then((({done: n, value: r}) => {
                                if (n) t.close(); else {
                                    o += r.byteLength;
                                    const n = new ProgressEvent("progress", {
                                        lengthComputable: a,
                                        loaded: o,
                                        total: s
                                    });
                                    for (let t = 0, e = i.length; t < e; t++) {
                                        const e = i[t];
                                        e.onProgress && e.onProgress(n);
                                    }
                                    t.enqueue(r), e();
                                }
                            }));
                        }();
                    }
                });
                return new Response(l);
            }
            throw new va(`fetch for "${e.url}" responded with ${e.status}: ${e.statusText}`, e);
        })).then((t => {
            switch (o) {
              case "arraybuffer":
                return t.arrayBuffer();

              case "blob":
                return t.blob();

              case "document":
                return t.text().then((t => (new DOMParser).parseFromString(t, a)));

              case "json":
                return t.json();

              default:
                if (void 0 === a) return t.text();
                {
                    const e = /charset="?([^;"\s]*)"?/i.exec(a), i = e && e[1] ? e[1].toLowerCase() : void 0, n = new TextDecoder(i);
                    return t.arrayBuffer().then((t => n.decode(t)));
                }
            }
        })).then((e => {
            ua.add(t, e);
            const i = ma[t];
            delete ma[t];
            for (let t = 0, n = i.length; t < n; t++) {
                const n = i[t];
                n.onLoad && n.onLoad(e);
            }
        })).catch((e => {
            const i = ma[t];
            if (void 0 === i) throw this.manager.itemError(t), e;
            delete ma[t];
            for (let t = 0, n = i.length; t < n; t++) {
                const n = i[t];
                n.onError && n.onError(e);
            }
            this.manager.itemError(t);
        })).finally((() => {
            this.manager.itemEnd(t);
        })), this.manager.itemStart(t);
    }
    setResponseType(t) {
        return this.responseType = t, this;
    }
    setMimeType(t) {
        return this.mimeType = t, this;
    }
}

class xa extends fa {
    constructor(t) {
        super(t);
    }
    load(t, e, i, n) {
        void 0 !== this.path && (t = this.path + t), t = this.manager.resolveURL(t);
        const r = this, s = ua.get(t);
        if (void 0 !== s) return r.manager.itemStart(t), setTimeout((function() {
            e && e(s), r.manager.itemEnd(t);
        }), 0), s;
        const a = I("img");
        function o() {
            h(), ua.add(t, this), e && e(this), r.manager.itemEnd(t);
        }
        function l(e) {
            h(), n && n(e), r.manager.itemError(t), r.manager.itemEnd(t);
        }
        function h() {
            a.removeEventListener("load", o, !1), a.removeEventListener("error", l, !1);
        }
        return a.addEventListener("load", o, !1), a.addEventListener("error", l, !1), "data:" !== t.slice(0, 5) && void 0 !== this.crossOrigin && (a.crossOrigin = this.crossOrigin), 
        r.manager.itemStart(t), a.src = t, a;
    }
}

class ya extends fa {
    constructor(t) {
        super(t);
    }
    load(t, e, i, n) {
        const r = new K, s = new xa(this.manager);
        return s.setCrossOrigin(this.crossOrigin), s.setPath(this.path), s.load(t, (function(t) {
            r.image = t, r.needsUpdate = !0, void 0 !== e && e(r);
        }), i, n), r;
    }
}

class ba extends ee {
    constructor(t, e = 1) {
        super(), this.isLight = !0, this.type = "Light", this.color = new ye(t), this.intensity = e;
    }
    dispose() {}
    copy(t, e) {
        return super.copy(t, e), this.color.copy(t.color), this.intensity = t.intensity, 
        this;
    }
    toJSON(t) {
        const e = super.toJSON(t);
        return e.object.color = this.color.getHex(), e.object.intensity = this.intensity, 
        void 0 !== this.groundColor && (e.object.groundColor = this.groundColor.getHex()), 
        void 0 !== this.distance && (e.object.distance = this.distance), void 0 !== this.angle && (e.object.angle = this.angle), 
        void 0 !== this.decay && (e.object.decay = this.decay), void 0 !== this.penumbra && (e.object.penumbra = this.penumbra), 
        void 0 !== this.shadow && (e.object.shadow = this.shadow.toJSON()), e;
    }
}

const Sa = new Rt, wa = new tt, Ma = new tt;

class Ta {
    constructor(t) {
        this.camera = t, this.bias = 0, this.normalBias = 0, this.radius = 1, this.blurSamples = 8, 
        this.mapSize = new P(512, 512), this.map = null, this.mapPass = null, this.matrix = new Rt, 
        this.autoUpdate = !0, this.needsUpdate = !1, this._frustum = new xi, this._frameExtents = new P(1, 1), 
        this._viewportCount = 1, this._viewports = [ new Y(0, 0, 1, 1) ];
    }
    getViewportCount() {
        return this._viewportCount;
    }
    getFrustum() {
        return this._frustum;
    }
    updateMatrices(t) {
        const e = this.camera, i = this.matrix;
        wa.setFromMatrixPosition(t.matrixWorld), e.position.copy(wa), Ma.setFromMatrixPosition(t.target.matrixWorld), 
        e.lookAt(Ma), e.updateMatrixWorld(), Sa.multiplyMatrices(e.projectionMatrix, e.matrixWorldInverse), 
        this._frustum.setFromProjectionMatrix(Sa), i.set(.5, 0, 0, .5, 0, .5, 0, .5, 0, 0, .5, .5, 0, 0, 0, 1), 
        i.multiply(Sa);
    }
    getViewport(t) {
        return this._viewports[t];
    }
    getFrameExtents() {
        return this._frameExtents;
    }
    dispose() {
        this.map && this.map.dispose(), this.mapPass && this.mapPass.dispose();
    }
    copy(t) {
        return this.camera = t.camera.clone(), this.bias = t.bias, this.radius = t.radius, 
        this.mapSize.copy(t.mapSize), this;
    }
    clone() {
        return (new this.constructor).copy(this);
    }
    toJSON() {
        const t = {};
        return 0 !== this.bias && (t.bias = this.bias), 0 !== this.normalBias && (t.normalBias = this.normalBias), 
        1 !== this.radius && (t.radius = this.radius), 512 === this.mapSize.x && 512 === this.mapSize.y || (t.mapSize = this.mapSize.toArray()), 
        t.camera = this.camera.toJSON(!1).object, delete t.camera.matrix, t;
    }
}

class Ea extends Ta {
    constructor() {
        super(new hi(50, 1, .5, 500)), this.isSpotLightShadow = !0, this.focus = 1;
    }
    updateMatrices(t) {
        const e = this.camera, i = 2 * _ * t.angle * this.focus, n = this.mapSize.width / this.mapSize.height, r = t.distance || e.far;
        i === e.fov && n === e.aspect && r === e.far || (e.fov = i, e.aspect = n, e.far = r, 
        e.updateProjectionMatrix()), super.updateMatrices(t);
    }
    copy(t) {
        return super.copy(t), this.focus = t.focus, this;
    }
}

class Aa extends ba {
    constructor(t, e, i = 0, n = Math.PI / 3, r = 0, s = 2) {
        super(t, e), this.isSpotLight = !0, this.type = "SpotLight", this.position.copy(ee.DEFAULT_UP), 
        this.updateMatrix(), this.target = new ee, this.distance = i, this.angle = n, this.penumbra = r, 
        this.decay = s, this.map = null, this.shadow = new Ea;
    }
    get power() {
        return this.intensity * Math.PI;
    }
    set power(t) {
        this.intensity = t / Math.PI;
    }
    dispose() {
        this.shadow.dispose();
    }
    copy(t, e) {
        return super.copy(t, e), this.distance = t.distance, this.angle = t.angle, this.penumbra = t.penumbra, 
        this.decay = t.decay, this.target = t.target.clone(), this.shadow = t.shadow.clone(), 
        this;
    }
}

const Ca = new Rt, Pa = new tt, Ra = new tt;

class La extends Ta {
    constructor() {
        super(new hi(90, 1, .5, 500)), this.isPointLightShadow = !0, this._frameExtents = new P(4, 2), 
        this._viewportCount = 6, this._viewports = [ new Y(2, 1, 1, 1), new Y(0, 1, 1, 1), new Y(3, 1, 1, 1), new Y(1, 1, 1, 1), new Y(3, 0, 1, 1), new Y(1, 0, 1, 1) ], 
        this._cubeDirections = [ new tt(1, 0, 0), new tt(-1, 0, 0), new tt(0, 0, 1), new tt(0, 0, -1), new tt(0, 1, 0), new tt(0, -1, 0) ], 
        this._cubeUps = [ new tt(0, 1, 0), new tt(0, 1, 0), new tt(0, 1, 0), new tt(0, 1, 0), new tt(0, 0, 1), new tt(0, 0, -1) ];
    }
    updateMatrices(t, e = 0) {
        const i = this.camera, n = this.matrix, r = t.distance || i.far;
        r !== i.far && (i.far = r, i.updateProjectionMatrix()), Pa.setFromMatrixPosition(t.matrixWorld), 
        i.position.copy(Pa), Ra.copy(i.position), Ra.add(this._cubeDirections[e]), i.up.copy(this._cubeUps[e]), 
        i.lookAt(Ra), i.updateMatrixWorld(), n.makeTranslation(-Pa.x, -Pa.y, -Pa.z), Ca.multiplyMatrices(i.projectionMatrix, i.matrixWorldInverse), 
        this._frustum.setFromProjectionMatrix(Ca);
    }
}

class Da extends ba {
    constructor(t, e, i = 0, n = 2) {
        super(t, e), this.isPointLight = !0, this.type = "PointLight", this.distance = i, 
        this.decay = n, this.shadow = new La;
    }
    get power() {
        return 4 * this.intensity * Math.PI;
    }
    set power(t) {
        this.intensity = t / (4 * Math.PI);
    }
    dispose() {
        this.shadow.dispose();
    }
    copy(t, e) {
        return super.copy(t, e), this.distance = t.distance, this.decay = t.decay, this.shadow = t.shadow.clone(), 
        this;
    }
}

class Ia extends Ta {
    constructor() {
        super(new Ii(-5, 5, 5, -5, .5, 500)), this.isDirectionalLightShadow = !0;
    }
}

class Ua extends ba {
    constructor(t, e) {
        super(t, e), this.isDirectionalLight = !0, this.type = "DirectionalLight", this.position.copy(ee.DEFAULT_UP), 
        this.updateMatrix(), this.target = new ee, this.shadow = new Ia;
    }
    dispose() {
        this.shadow.dispose();
    }
    copy(t) {
        return super.copy(t), this.target = t.target.clone(), this.shadow = t.shadow.clone(), 
        this;
    }
}

class Na {
    static decodeText(t) {
        if ("undefined" != typeof TextDecoder) return (new TextDecoder).decode(t);
        let e = "";
        for (let i = 0, n = t.length; i < n; i++) e += String.fromCharCode(t[i]);
        try {
            return decodeURIComponent(escape(e));
        } catch (t) {
            return e;
        }
    }
    static extractUrlBase(t) {
        const e = t.lastIndexOf("/");
        return -1 === e ? "./" : t.slice(0, e + 1);
    }
    static resolveURL(t, e) {
        return "string" != typeof t || "" === t ? "" : (/^https?:\/\//i.test(e) && /^\//.test(t) && (e = e.replace(/(^https?:\/\/[^\/]+).*/i, "$1")), 
        /^(https?:)?\/\//i.test(t) || /^data:.*,.*$/i.test(t) || /^blob:.*$/i.test(t) ? t : e + t);
    }
}

class Ba extends fa {
    constructor(t) {
        super(t), this.isImageBitmapLoader = !0, "undefined" == typeof createImageBitmap && console.warn("THREE.ImageBitmapLoader: createImageBitmap() not supported."), 
        "undefined" == typeof fetch && console.warn("THREE.ImageBitmapLoader: fetch() not supported."), 
        this.options = {
            premultiplyAlpha: "none"
        };
    }
    setOptions(t) {
        return this.options = t, this;
    }
    load(t, e, i, n) {
        void 0 === t && (t = ""), void 0 !== this.path && (t = this.path + t), t = this.manager.resolveURL(t);
        const r = this, s = ua.get(t);
        if (void 0 !== s) return r.manager.itemStart(t), setTimeout((function() {
            e && e(s), r.manager.itemEnd(t);
        }), 0), s;
        const a = {};
        a.credentials = "anonymous" === this.crossOrigin ? "same-origin" : "include", a.headers = this.requestHeader, 
        fetch(t, a).then((function(t) {
            return t.blob();
        })).then((function(t) {
            return createImageBitmap(t, Object.assign(r.options, {
                colorSpaceConversion: "none"
            }));
        })).then((function(i) {
            ua.add(t, i), e && e(i), r.manager.itemEnd(t);
        })).catch((function(e) {
            n && n(e), r.manager.itemError(t), r.manager.itemEnd(t);
        })), r.manager.itemStart(t);
    }
}

const Oa = new RegExp("[\\[\\]\\.:\\/]", "g"), Fa = "[^" + "\\[\\]\\.:\\/".replace("\\.", "") + "]", ka = new RegExp("^" + /((?:WC+[\/:])*)/.source.replace("WC", "[^\\[\\]\\.:\\/]") + /(WCOD+)?/.source.replace("WCOD", Fa) + /(?:\.(WC+)(?:\[(.+)\])?)?/.source.replace("WC", "[^\\[\\]\\.:\\/]") + /\.(WC+)(?:\[(.+)\])?/.source.replace("WC", "[^\\[\\]\\.:\\/]") + "$"), Ha = [ "material", "materials", "bones", "map" ];

class za {
    constructor(t, e, i) {
        this.path = e, this.parsedPath = i || za.parseTrackName(e), this.node = za.findNode(t, this.parsedPath.nodeName), 
        this.rootNode = t, this.getValue = this._getValue_unbound, this.setValue = this._setValue_unbound;
    }
    static create(t, e, i) {
        return t && t.isAnimationObjectGroup ? new za.Composite(t, e, i) : new za(t, e, i);
    }
    static sanitizeNodeName(t) {
        return t.replace(/\s/g, "_").replace(Oa, "");
    }
    static parseTrackName(t) {
        const e = ka.exec(t);
        if (null === e) throw new Error("PropertyBinding: Cannot parse trackName: " + t);
        const i = {
            nodeName: e[2],
            objectName: e[3],
            objectIndex: e[4],
            propertyName: e[5],
            propertyIndex: e[6]
        }, n = i.nodeName && i.nodeName.lastIndexOf(".");
        if (void 0 !== n && -1 !== n) {
            const t = i.nodeName.substring(n + 1);
            -1 !== Ha.indexOf(t) && (i.nodeName = i.nodeName.substring(0, n), i.objectName = t);
        }
        if (null === i.propertyName || 0 === i.propertyName.length) throw new Error("PropertyBinding: can not parse propertyName from trackName: " + t);
        return i;
    }
    static findNode(t, e) {
        if (void 0 === e || "" === e || "." === e || -1 === e || e === t.name || e === t.uuid) return t;
        if (t.skeleton) {
            const i = t.skeleton.getBoneByName(e);
            if (void 0 !== i) return i;
        }
        if (t.children) {
            const i = function(t) {
                for (let n = 0; n < t.length; n++) {
                    const r = t[n];
                    if (r.name === e || r.uuid === e) return r;
                    const s = i(r.children);
                    if (s) return s;
                }
                return null;
            }, n = i(t.children);
            if (n) return n;
        }
        return null;
    }
    _getValue_unavailable() {}
    _setValue_unavailable() {}
    _getValue_direct(t, e) {
        t[e] = this.targetObject[this.propertyName];
    }
    _getValue_array(t, e) {
        const i = this.resolvedProperty;
        for (let n = 0, r = i.length; n !== r; ++n) t[e++] = i[n];
    }
    _getValue_arrayElement(t, e) {
        t[e] = this.resolvedProperty[this.propertyIndex];
    }
    _getValue_toArray(t, e) {
        this.resolvedProperty.toArray(t, e);
    }
    _setValue_direct(t, e) {
        this.targetObject[this.propertyName] = t[e];
    }
    _setValue_direct_setNeedsUpdate(t, e) {
        this.targetObject[this.propertyName] = t[e], this.targetObject.needsUpdate = !0;
    }
    _setValue_direct_setMatrixWorldNeedsUpdate(t, e) {
        this.targetObject[this.propertyName] = t[e], this.targetObject.matrixWorldNeedsUpdate = !0;
    }
    _setValue_array(t, e) {
        const i = this.resolvedProperty;
        for (let n = 0, r = i.length; n !== r; ++n) i[n] = t[e++];
    }
    _setValue_array_setNeedsUpdate(t, e) {
        const i = this.resolvedProperty;
        for (let n = 0, r = i.length; n !== r; ++n) i[n] = t[e++];
        this.targetObject.needsUpdate = !0;
    }
    _setValue_array_setMatrixWorldNeedsUpdate(t, e) {
        const i = this.resolvedProperty;
        for (let n = 0, r = i.length; n !== r; ++n) i[n] = t[e++];
        this.targetObject.matrixWorldNeedsUpdate = !0;
    }
    _setValue_arrayElement(t, e) {
        this.resolvedProperty[this.propertyIndex] = t[e];
    }
    _setValue_arrayElement_setNeedsUpdate(t, e) {
        this.resolvedProperty[this.propertyIndex] = t[e], this.targetObject.needsUpdate = !0;
    }
    _setValue_arrayElement_setMatrixWorldNeedsUpdate(t, e) {
        this.resolvedProperty[this.propertyIndex] = t[e], this.targetObject.matrixWorldNeedsUpdate = !0;
    }
    _setValue_fromArray(t, e) {
        this.resolvedProperty.fromArray(t, e);
    }
    _setValue_fromArray_setNeedsUpdate(t, e) {
        this.resolvedProperty.fromArray(t, e), this.targetObject.needsUpdate = !0;
    }
    _setValue_fromArray_setMatrixWorldNeedsUpdate(t, e) {
        this.resolvedProperty.fromArray(t, e), this.targetObject.matrixWorldNeedsUpdate = !0;
    }
    _getValue_unbound(t, e) {
        this.bind(), this.getValue(t, e);
    }
    _setValue_unbound(t, e) {
        this.bind(), this.setValue(t, e);
    }
    bind() {
        let t = this.node;
        const e = this.parsedPath, i = e.objectName, n = e.propertyName;
        let r = e.propertyIndex;
        if (t || (t = za.findNode(this.rootNode, e.nodeName), this.node = t), this.getValue = this._getValue_unavailable, 
        this.setValue = this._setValue_unavailable, !t) return void console.error("THREE.PropertyBinding: Trying to update node for track: " + this.path + " but it wasn't found.");
        if (i) {
            let n = e.objectIndex;
            switch (i) {
              case "materials":
                if (!t.material) return void console.error("THREE.PropertyBinding: Can not bind to material as node does not have a material.", this);
                if (!t.material.materials) return void console.error("THREE.PropertyBinding: Can not bind to material.materials as node.material does not have a materials array.", this);
                t = t.material.materials;
                break;

              case "bones":
                if (!t.skeleton) return void console.error("THREE.PropertyBinding: Can not bind to bones as node does not have a skeleton.", this);
                t = t.skeleton.bones;
                for (let e = 0; e < t.length; e++) if (t[e].name === n) {
                    n = e;
                    break;
                }
                break;

              case "map":
                if ("map" in t) {
                    t = t.map;
                    break;
                }
                if (!t.material) return void console.error("THREE.PropertyBinding: Can not bind to material as node does not have a material.", this);
                if (!t.material.map) return void console.error("THREE.PropertyBinding: Can not bind to material.map as node.material does not have a map.", this);
                t = t.material.map;
                break;

              default:
                if (void 0 === t[i]) return void console.error("THREE.PropertyBinding: Can not bind to objectName of node undefined.", this);
                t = t[i];
            }
            if (void 0 !== n) {
                if (void 0 === t[n]) return void console.error("THREE.PropertyBinding: Trying to bind to objectIndex of objectName, but is undefined.", this, t);
                t = t[n];
            }
        }
        const s = t[n];
        if (void 0 === s) {
            const i = e.nodeName;
            return void console.error("THREE.PropertyBinding: Trying to update property for track: " + i + "." + n + " but it wasn't found.", t);
        }
        let a = this.Versioning.None;
        this.targetObject = t, void 0 !== t.needsUpdate ? a = this.Versioning.NeedsUpdate : void 0 !== t.matrixWorldNeedsUpdate && (a = this.Versioning.MatrixWorldNeedsUpdate);
        let o = this.BindingType.Direct;
        if (void 0 !== r) {
            if ("morphTargetInfluences" === n) {
                if (!t.geometry) return void console.error("THREE.PropertyBinding: Can not bind to morphTargetInfluences because node does not have a geometry.", this);
                if (!t.geometry.morphAttributes) return void console.error("THREE.PropertyBinding: Can not bind to morphTargetInfluences because node does not have a geometry.morphAttributes.", this);
                void 0 !== t.morphTargetDictionary[r] && (r = t.morphTargetDictionary[r]);
            }
            o = this.BindingType.ArrayElement, this.resolvedProperty = s, this.propertyIndex = r;
        } else void 0 !== s.fromArray && void 0 !== s.toArray ? (o = this.BindingType.HasFromToArray, 
        this.resolvedProperty = s) : Array.isArray(s) ? (o = this.BindingType.EntireArray, 
        this.resolvedProperty = s) : this.propertyName = n;
        this.getValue = this.GetterByBindingType[o], this.setValue = this.SetterByBindingTypeAndVersioning[o][a];
    }
    unbind() {
        this.node = null, this.getValue = this._getValue_unbound, this.setValue = this._setValue_unbound;
    }
}

za.Composite = class {
    constructor(t, e, i) {
        const n = i || za.parseTrackName(e);
        this._targetGroup = t, this._bindings = t.subscribe_(e, n);
    }
    getValue(t, e) {
        this.bind();
        const i = this._targetGroup.nCachedObjects_, n = this._bindings[i];
        void 0 !== n && n.getValue(t, e);
    }
    setValue(t, e) {
        const i = this._bindings;
        for (let n = this._targetGroup.nCachedObjects_, r = i.length; n !== r; ++n) i[n].setValue(t, e);
    }
    bind() {
        const t = this._bindings;
        for (let e = this._targetGroup.nCachedObjects_, i = t.length; e !== i; ++e) t[e].bind();
    }
    unbind() {
        const t = this._bindings;
        for (let e = this._targetGroup.nCachedObjects_, i = t.length; e !== i; ++e) t[e].unbind();
    }
}, za.prototype.BindingType = {
    Direct: 0,
    EntireArray: 1,
    ArrayElement: 2,
    HasFromToArray: 3
}, za.prototype.Versioning = {
    None: 0,
    NeedsUpdate: 1,
    MatrixWorldNeedsUpdate: 2
}, za.prototype.GetterByBindingType = [ za.prototype._getValue_direct, za.prototype._getValue_array, za.prototype._getValue_arrayElement, za.prototype._getValue_toArray ], 
za.prototype.SetterByBindingTypeAndVersioning = [ [ za.prototype._setValue_direct, za.prototype._setValue_direct_setNeedsUpdate, za.prototype._setValue_direct_setMatrixWorldNeedsUpdate ], [ za.prototype._setValue_array, za.prototype._setValue_array_setNeedsUpdate, za.prototype._setValue_array_setMatrixWorldNeedsUpdate ], [ za.prototype._setValue_arrayElement, za.prototype._setValue_arrayElement_setNeedsUpdate, za.prototype._setValue_arrayElement_setMatrixWorldNeedsUpdate ], [ za.prototype._setValue_fromArray, za.prototype._setValue_fromArray_setNeedsUpdate, za.prototype._setValue_fromArray_setMatrixWorldNeedsUpdate ] ];

class Ga {
    constructor(t, e, i = 0, n = 1 / 0) {
        this.ray = new Pt(t, e), this.near = i, this.far = n, this.camera = null, this.layers = new zt, 
        this.params = {
            Mesh: {},
            Line: {
                threshold: 1
            },
            LOD: {},
            Points: {
                threshold: 1
            },
            Sprite: {}
        };
    }
    set(t, e) {
        this.ray.set(t, e);
    }
    setFromCamera(t, e) {
        e.isPerspectiveCamera ? (this.ray.origin.setFromMatrixPosition(e.matrixWorld), this.ray.direction.set(t.x, t.y, .5).unproject(e).sub(this.ray.origin).normalize(), 
        this.camera = e) : e.isOrthographicCamera ? (this.ray.origin.set(t.x, t.y, (e.near + e.far) / (e.near - e.far)).unproject(e), 
        this.ray.direction.set(0, 0, -1).transformDirection(e.matrixWorld), this.camera = e) : console.error("THREE.Raycaster: Unsupported camera type: " + e.type);
    }
    intersectObject(t, e = !0, i = []) {
        return Wa(t, this, i, e), i.sort(Va), i;
    }
    intersectObjects(t, e = !0, i = []) {
        for (let n = 0, r = t.length; n < r; n++) Wa(t[n], this, i, e);
        return i.sort(Va), i;
    }
}

function Va(t, e) {
    return t.distance - e.distance;
}

function Wa(t, e, i, n) {
    if (t.layers.test(e.layers) && t.raycast(e, i), !0 === n) {
        const n = t.children;
        for (let t = 0, r = n.length; t < r; t++) Wa(n[t], e, i, !0);
    }
}

function* ja(t, {skipObjsFn: e = null} = {}) {
    if (!e || e(t)) {
        yield t;
        for (const i of t.children) for (const t of ja(i, {
            skipObjsFn: e
        })) yield t;
    }
}

"undefined" != typeof __THREE_DEVTOOLS__ && __THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("register", {
    detail: {
        revision: "152"
    }
})), "undefined" != typeof window && (window.__THREE__ ? console.warn("WARNING: Multiple instances of Three.js being imported.") : window.__THREE__ = "152");

const Xa = new Se({
    name: "default",
    vertexColors: !0
}), qa = new Se({
    name: "lights",
    vertexColors: !0,
    depthWrite: !1,
    depthTest: !0,
    blending: 2
}), Ka = new Ws, Ya = new Se({
    name: "tile highlight",
    depthTest: !1,
    depthWrite: !1,
    blending: 2
}), Za = new Se({
    name: "building highlight",
    depthTest: !1,
    depthWrite: !1,
    blending: 2,
    color: new ye(1118464)
});

function Ja(t) {
    return "default" == t.name ? Xa : "lights" == t.name ? qa : t;
}

function Qa(t) {
    for (const e of ja(t)) if (e instanceof ti) if (Array.isArray(e.material)) {
        const t = [];
        for (let i = 0; i < e.material.length; i++) "lights" == e.material[i].name && (e.renderOrder = 100), 
        t[i] = Ja(e.material[i]);
        e.material = t;
    } else "lights" == e.material.name && (e.renderOrder = 100), e.material = Ja(e.material);
}

function $a(t, e) {
    for (const i of ja(t)) if (i instanceof ti) if (Array.isArray(i.material)) {
        const t = [];
        for (let n = 0; n < i.material.length; n++) t[n] = e;
        i.material = t;
    } else i.material = e;
}

const to = [ {
    color: new ye(16711680),
    additiveColor: new ye(16711680),
    assetPrefix: "r",
    cssClass: "red",
    startingPowerArea: 0
}, {
    color: new ye(65280),
    additiveColor: new ye(65280),
    assetPrefix: "g",
    cssClass: "green",
    startingPowerArea: 1
}, {
    color: new ye(255),
    additiveColor: new ye(255),
    assetPrefix: "b",
    cssClass: "blue",
    startingPowerArea: 2
}, {
    color: new ye(255),
    additiveColor: new ye(255),
    assetPrefix: "o",
    cssClass: "orange",
    startingPowerArea: 2,
    isTrophyBuilding: !0
} ], eo = [ {
    assetChances: {
        smallFlowers: .15,
        yellowFlower: .1,
        whiteFlower: .2,
        plants: .05,
        smallStones: .03
    }
}, {
    assetChances: {
        smallFlowers: .01,
        yellowFlower: .1,
        whiteFlower: .1,
        bigStone: .05,
        plants: .05,
        pineTree: .1,
        smallStones: .01
    }
}, {
    assetChances: {
        yellowFlower: .05,
        whiteFlower: .05,
        bigStone: .05,
        pineTree: .3
    }
}, {
    assetChances: {
        pineTree: .01,
        pineTreeSet1Size2: .2,
        pineTreeSet2Size2: .2
    }
}, {
    assetChances: {
        pineTreeSet1Size2: .01,
        pineTreeSet2Size2: .01,
        pineTreeSet1Size3: .2,
        pineTreeSet2Size3: .2,
        pineHill: .01
    }
}, {
    assetChances: {
        pineTreeSet1Size3: .01,
        pineTreeSet2Size3: .01,
        pineTreeSet1Size4: .2,
        pineTreeSet2Size4: .2,
        pineHill: .1,
        pineHillRock: .05
    }
}, {
    assetChances: {
        pineTreeSet1Size4: .01,
        pineTreeSet2Size4: .01,
        pineTreeSet1Size5: .2,
        pineTreeSet2Size5: .2,
        pineMountain: .1,
        pineHillRock: .01,
        pineHill: .01
    }
}, {
    assetChances: {
        pineTreeSet1Size5: .1,
        pineTreeSet2Size5: .1,
        pineMountain: .01,
        pineHillRock: .01,
        snowMountain: .05,
        snowMountainBig: .03
    }
}, {
    assetChances: {
        pineTreeSet1Size5: .02,
        pineTreeSet2Size5: .02,
        snowMountain: .03,
        snowMountainBig: .05
    }
} ];

class io {
    constructor({grabbable: t = !1} = {}) {
        this.el = document.createElement("div"), this.el.classList.add("building-image-container"), 
        this.el.classList.toggle("grabbable", t);
        const e = "http://www.w3.org/2000/svg", i = document.createElementNS(e, "svg");
        i.classList.add("building-base"), this.el.appendChild(i), i.setAttributeNS(null, "viewBox", "0 0 500 200");
        const n = document.createElementNS(e, "path");
        i.appendChild(n), n.setAttributeNS(null, "d", "M -37.391 -82.174 Q 0 -97.826 37.391 -82.174 L 196.304 -15.652 Q 233.695 0 196.304 15.652 L 37.391 82.174 Q 0 97.826 -37.391 82.174 L -196.304 15.652 Q -233.695 0 -196.304 -15.652 Z"), 
        n.setAttributeNS(null, "transform", "translate(250, 110)"), n.setAttributeNS(null, "fill", "rgba(0, 0, 0, 0.2)"), 
        this.buildingImageEl = document.createElement("div"), this.buildingImageEl.classList.add("building-image"), 
        this.el.appendChild(this.buildingImageEl);
    }
    async setBuildingData(t) {
        const e = await jh().assets.buildingCreator.getBuildingImageUrl(t);
        this.buildingImageEl.style.backgroundImage = `url(${e})`;
        for (const [e, i] of to.entries()) this.buildingImageEl.classList.toggle(i.cssClass, t.type == e);
    }
    setState({available: t, unlocked: e}) {
        this.el.classList.toggle("available", t), this.el.classList.toggle("unavailable", !t && e), 
        this.el.classList.toggle("locked", !e);
    }
}

class no {
    constructor() {
        this.el = document.createElement("div"), this.el.classList.add("dock-shop-slot");
    }
}

class ro extends no {
    constructor() {
        super(), this.el.classList.add("dock-open-shop-slot"), this.buttonEl = document.createElement("button"), 
        this.buttonEl.classList.add("yellow"), this.el.appendChild(this.buttonEl);
        const t = document.createElement("div");
        t.classList.add("shop-button-content"), this.buttonEl.appendChild(t), this.buildingImage = new io, 
        t.appendChild(this.buildingImage.el), this.buildingImage.setState({
            unlocked: !0,
            available: !1
        });
        const e = document.createElement("span");
        e.textContent = "Shop", t.appendChild(e), this.buttonEl.addEventListener("click", (() => {
            jh().game.shop.openShopDialog();
        })), this.lastReceivedAvailableBuilding = null, jh().game.shop.onBigAndAvailableBuildingChange((t => {
            t && (this.lastReceivedAvailableBuilding = t), this.buildingImage.setState({
                unlocked: !0,
                available: Boolean(t)
            }), this.updateBuildingImage();
        })), jh().game.shop.onMaxBuildingSizesChange((() => {
            this.updateBuildingImage();
        })), this.updateBuildingImage();
    }
    updateBuildingImage() {
        const t = this.lastReceivedAvailableBuilding || jh().game.shop.getMaxBuildingData(!0);
        t && this.buildingImage.setBuildingData(t);
    }
}

function so(t, e) {
    return (t % e + e) % e;
}

function ao(t, e, i) {
    return t + i * (e - t);
}

function oo(t, e, i) {
    return (i - t) / (e - t);
}

function lo(t, e, i) {
    return Math.max(e, Math.min(i, t));
}

function ho(t) {
    return lo(t, 0, 1);
}

function co(t, e, i, n, r, s = !0) {
    let a = oo(e, i, t);
    return s && (a = ho(a)), ao(n, r, a);
}

function uo(t) {
    const e = t.getBoundingClientRect(), i = e.left + e.width / 2, n = e.top + e.height / 2;
    return new P(i, n);
}

const po = [ "", "k", "m", "b", "t", "q", "qi", "sx", "sp", "o", "n", "d" ];

function go(t) {
    const e = Math.max(0, Math.floor(Math.log10(t) / 3));
    return (t / Math.pow(1e3, e)).toFixed(1) + po[e];
}

class fo {
    constructor({small: t = !1} = {}) {
        this.el = document.createElement("div"), this.el.classList.add("coins-preview-container"), 
        this.el.classList.toggle("small", t), this.currentCoinsImage = new Image;
        const e = t ? "moneySmall" : "moneyBig";
        this.currentCoinsImage.src = `./static/images/${e}.webp`, this.currentCoinsImage.classList.add("coins-img"), 
        this.el.appendChild(this.currentCoinsImage);
        const i = document.createElement("div");
        i.classList.add("bill"), this.el.appendChild(i), this.amountEl = document.createElement("div"), 
        this.amountEl.classList.add("amount"), i.appendChild(this.amountEl);
    }
    setAmount(t) {
        this.amountEl.textContent = "$" + go(t);
    }
}

class mo {
    constructor({className: t = "", mobileBottomSheet: e = !1, forceSingleInstance: i = !0, reopenAfterAd: n = !1} = {}) {
        this._forceSingleInstance = i, this._reopenAfterAd = n, this.el = document.createElement("dialog"), 
        t && this.el.classList.add(t), this.el.classList.toggle("mobile-bottom-sheet", e), 
        this.el.addEventListener("close", (() => {
            this.destructor();
        })), this.el.addEventListener("click", (t => {
            const e = this.el.getBoundingClientRect();
            (t.clientX < e.left || t.clientX > e.right || t.clientY < e.top || t.clientY > e.bottom) && this.el.close();
        })), document.body.appendChild(this.el), this.el.showModal(), this.allowRewardedAdOnClose = !0, 
        this.onCloseCbs = new Set;
    }
    destructor() {
        this.onCloseCbs.forEach((t => t(this.allowRewardedAdOnClose))), document.body.removeChild(this.el);
    }
    get forceSingleInstance() {
        return this._forceSingleInstance;
    }
    get reopenAfterAd() {
        return this._reopenAfterAd;
    }
    close({allowRewardedAd: t = !0} = {}) {
        this.allowRewardedAdOnClose = t, this.el.close();
    }
    onClose(t) {
        this.onCloseCbs.add(t);
    }
}

class vo extends mo {
    constructor() {
        super(), this.el.classList.add("collect-coins-dialog");
        const t = document.createElement("h1");
        t.textContent = "Revenue", this.el.appendChild(t), this.coinsPreview = new fo, this.el.appendChild(this.coinsPreview.el), 
        this.shop = jh().game.shop, this.onCollectedcbs = new Set, this.boundCollectableCoinsChanged = this.collectableCoinsChanged.bind(this), 
        this.shop.onCollectableCoinsChange(this.boundCollectableCoinsChanged);
        const e = document.createElement("div");
        e.classList.add("buttons-container"), this.el.appendChild(e);
        const i = document.createElement("button");
        i.classList.add("yellow"), i.textContent = "Collect", e.appendChild(i), i.focus(), 
        i.addEventListener("click", (() => {
            this.collect(), this.close();
        }));
        const n = jh().adLad;
        if (n.canShowRewardedAd) {
            const t = document.createElement("button");
            t.classList.add("blue", "button-with-icon");
            const i = new Image;
            i.src = "./static/svg/rewardButton.svg", i.classList.add("button-icon"), t.appendChild(i), 
            t.appendChild(document.createTextNode("Collect x3")), e.appendChild(t), t.addEventListener("click", (async () => {
                this.close();
                (await n.showRewardedAd()).didShowAd && this.collect(3);
            }));
        }
        this.collectableCoinsChanged();
    }
    destructor() {
        super.destructor(), this.shop.removeOnCollectableCoinsChange(this.boundCollectableCoinsChanged);
    }
    collectableCoinsChanged() {
        this.coinsPreview.setAmount(this.shop.collectableCoins);
    }
    collect(t = 1) {
        jh().sfx.playSound("collectCoins");
        const e = this.shop.coins, i = this.shop.collectCoins(t) / this.shop.incrementRate;
        this.onCollectedcbs.forEach((t => t(e, i)));
    }
    onCollected(t) {
        this.onCollectedcbs.add(t);
    }
}

function _o(t, e) {
    return Math.floor(yo(t, e));
}

function xo(t, e, i) {
    return i * (e - t) + t;
}

function yo(t, e) {
    return xo(t, e, Math.random());
}

function bo(t) {
    return function(t, e) {
        return t[Math.floor(e * t.length)];
    }(t, Math.random());
}

function So(t, e) {
    let i = 0;
    for (const e of t) i += e.probability;
    const n = xo(0, i, e);
    let r = 0;
    for (const e of t) if (r += e.probability, r > n) return e.item;
    return null;
}

class wo extends class {
    loop(t, e, i) {}
    get canDestroy() {
        return !1;
    }
} {
    constructor(t, e, {fillColor: i = "black", shadowColor: n = "black"} = {}) {
        super(), this.start = t, this.end = e, this.fillColor = i, this.shadowColor = n, 
        this.particles = new Set, this.stopped = !1, this.lastParticleTime = 0;
    }
    loop(t, e, i) {
        !this.stopped && e - this.lastParticleTime > 50 && (this.lastParticleTime = e, this.particles.add({
            t: 0,
            offset: new P(yo(-150, 150), yo(-150, 150)),
            size: yo(20, 30)
        }));
        for (const e of this.particles) {
            const n = this.start.clone();
            e.t += i;
            const r = e.t / 1e3;
            if (r > 1) {
                this.particles.delete(e);
                continue;
            }
            n.lerp(this.end, r);
            const s = 1 - Math.abs(2 * r - 1);
            n.addScaledVector(e.offset, Math.sin(r * Math.PI)), n.multiplyScalar(globalThis.devicePixelRatio);
            const a = Math.min(e.size, 300 * s);
            t.beginPath(), t.arc(n.x, n.y + 4 * globalThis.devicePixelRatio, a, 0, 2 * Math.PI, !0), 
            t.fillStyle = this.shadowColor, t.fill(), t.beginPath(), t.arc(n.x, n.y, a, 0, 2 * Math.PI, !0), 
            t.fillStyle = this.fillColor, t.fill();
        }
    }
    get canDestroy() {
        return this.stopped && this.particles.size <= 0;
    }
    setStartPos(t) {
        this.start.copy(t);
    }
    stop() {
        this.stopped = !0;
    }
}

class Mo extends no {
    constructor(t) {
        super(), this.game = t, this.el.classList.add("dock-collect-slot"), this.buttonEl = document.createElement("button"), 
        this.buttonEl.classList.add("yellow"), this.el.appendChild(this.buttonEl);
        const e = new fo({
            small: !0
        });
        this.buttonEl.appendChild(e.el), e.setAmount(t.shop.collectableCoins), t.shop.onCollectableCoinsChange((() => {
            e.setAmount(t.shop.collectableCoins);
        })), this.buttonEl.addEventListener("click", (() => {
            this.buttonEl.blur();
            jh().dialogManager.showDialog(vo).onCollected(((e, i) => {
                t.tutorialSuggestionsManager.actionOccurred("collect-coins");
                const n = co(i, 0, 300, 500, 5e3);
                this.game.cornerStats.showCollectCoinsAnimation(this.el, e, n);
            }));
        }));
    }
    click() {
        this.buttonEl.click();
    }
}

class To extends no {
    constructor() {
        super(), this.el.classList.add("dock-building-slot"), this.buildingImage = new io({
            grabbable: !0
        }), this.el.appendChild(this.buildingImage.el), this._available = !1, this.setAvailable(!1);
    }
    getBuildingData() {
        throw new Error("Not implemented");
    }
    setAvailable(t) {
        this._available = t, this.el.classList.toggle("available", t), this.buildingImage.setState({
            available: t,
            unlocked: !0
        });
    }
    get available() {
        return this._available;
    }
}

class Eo extends To {
    constructor(t, e) {
        super();
        const i = to[t];
        this.el.classList.add(i.cssClass), this.buildingImage.setBuildingData({
            type: t,
            height: 1,
            powerAreaSimplified: 3
        });
    }
}

class Ao extends To {
    constructor(t) {
        super(), this.game = t, this.el.classList.add("trophy"), this.powerAreaSimplified = 0, 
        t.shop.trophyBuildingsManager.onNextPowerAreaChange((() => {
            this.updatePowerArea();
        })), t.shop.trophyBuildingsManager.onAvailableChange((e => {
            !this.available && e && t.cornerStats.startTrophyAvailableAnimation(this.el), this.setAvailable(e);
        })), this.setAvailable(t.shop.trophyBuildingsManager.currentPowerAreaAvailable), 
        this.updatePowerArea();
    }
    getBuildingData() {
        return {
            type: 3,
            height: 1,
            powerAreaSimplified: this.powerAreaSimplified
        };
    }
    updatePowerArea() {
        this.powerAreaSimplified = this.game.shop.trophyBuildingsManager.currentPowerArea, 
        this.buildingImage.setBuildingData(this.getBuildingData());
    }
}

class Co {
    constructor(t, e) {
        this.game = e, this.el = document.createElement("div"), this.el.classList.add("building-shop-container"), 
        t.appendChild(this.el);
        const i = document.createElement("div");
        i.classList.add("backdrop-gradient"), this.el.appendChild(i), this._slots = [], 
        this.collectCoinsAdded = !1, this.game.shop.onItemPurchased((() => {
            this.updateCollectSlotNeeded();
        })), this.game.shop.onCollectableCoinsChange((() => {
            this.updateCollectSlotNeeded();
        }));
    }
    getBuildingSlotFromEl(t) {
        if (!(t instanceof Node)) return null;
        for (const e of this._slots) if (e instanceof To && e.el.contains(t)) return e;
        return null;
    }
    getTrophyBuildingSlot() {
        for (const t of this._slots) if (t instanceof Ao) return t;
        return null;
    }
    getCollectSlot() {
        for (const t of this._slots) if (t instanceof Mo) return t;
        return null;
    }
    getShopSlot() {
        for (const t of this._slots) if (t instanceof ro) return t;
        return null;
    }
    slotEntries() {
        return this._slots.entries();
    }
    updateCollectSlotNeeded() {
        if (this.collectCoinsAdded) return;
        this.game.shop.getCollectCoinsButtonNeeded() && this.addCollectSlot();
    }
    addRegularBuildingSlot(t) {
        const e = new Eo(t, this.game);
        this._slots.push(e), this.el.appendChild(e.el);
    }
    addTrophyBuildingSlot() {
        const t = new Ao(this.game);
        this._slots.push(t), this.el.appendChild(t.el);
    }
    addCollectSlot() {
        if (this.collectCoinsAdded) return;
        this.collectCoinsAdded = !0;
        const t = new Mo(this.game);
        this._slots.unshift(t), this.el.insertBefore(t.el, this.el.firstChild);
    }
    addOpenShopSlot() {
        const t = new ro;
        this._slots.unshift(t), this.el.insertBefore(t.el, this.el.firstChild);
    }
}

class Po {
    constructor(t) {
        this.el = document.createElement("div"), this.el.classList.add("corner-stats-container"), 
        t.appendChild(this.el), this.coinsEl = this.createStat(), this.rateEl = this.createStat(), 
        this.coins = 0, this.trophyProgress = 0, this.trophyProgressEl = document.createElement("progress"), 
        this.trophyProgressEl.setAttribute("max", "1"), this.trophyProgressEl.setAttribute("value", "0.5"), 
        this.trophyProgressEl.style.display = "none", this.el.appendChild(this.trophyProgressEl), 
        this.isAnimatingTrophy = !1, this.animatingTrophyT = 0, this.animatingTrophyStartValue = 0, 
        this.animatingTrophyParticles = null, this.isAnimatingCoins = !1, this.animatingCoinsT = 0, 
        this.animatingCoinsDuration = 0, this.animatingCoinsStartValue = 0, this.animatingCoinsParticles = null;
    }
    createStat() {
        const t = document.createElement("div");
        return t.classList.add("corner-stat"), this.el.appendChild(t), t;
    }
    addRewardedSuggestionButton(t) {
        this.el.appendChild(t);
    }
    setCoins(t) {
        this.coins = t, this.isAnimatingCoins || (this.coinsEl.textContent = "$" + go(t));
    }
    setIncrementRate(t) {
        this.rateEl.textContent = "$" + go(t) + "/sec";
    }
    showTrophyProgress() {
        this.trophyProgressEl.style.display = "";
    }
    setTrophyProgress(t) {
        this.trophyProgress = t, this.isAnimatingTrophy || this.trophyProgressEl.setAttribute("value", String(t));
    }
    startTrophyAvailableAnimation(t) {
        const e = uo(this.trophyProgressEl), i = uo(t);
        this.isAnimatingTrophy = !0, this.animatingTrophyT = 0, this.animatingTrophyStartValue = this.trophyProgress, 
        this.animatingTrophyParticles || (this.animatingTrophyParticles = jh().uiParticles.createGroup(wo, e, i, {
            fillColor: "#ff7b22",
            shadowColor: "#c95e16"
        })), this.trophyProgressEl.classList.add("intense-shaking");
    }
    showCollectCoinsAnimation(t, e, i) {
        const n = uo(t), r = uo(this.coinsEl);
        this.animatingCoinsParticles || (this.animatingCoinsParticles = jh().uiParticles.createGroup(wo, n, r, {
            fillColor: "#ffc313",
            shadowColor: "#ff9b00"
        })), this.isAnimatingCoins = !0, this.animatingCoinsT = 0, this.animatingCoinsDuration = i, 
        this.animatingCoinsStartValue = e;
    }
    loop(t, e) {
        if (this.isAnimatingCoins) {
            this.animatingCoinsT += e;
            let t = this.animatingCoinsT / this.animatingCoinsDuration;
            t = Math.min(1, t), t >= 1 && (this.isAnimatingCoins = !1, this.animatingCoinsParticles && (this.animatingCoinsParticles.stop(), 
            this.animatingCoinsParticles = null));
            const i = ao(this.animatingCoinsStartValue, this.coins, t);
            this.coinsEl.textContent = "$" + go(i);
        }
        if (this.isAnimatingTrophy) {
            this.animatingTrophyT += e;
            let t = this.animatingTrophyT / 1e3;
            t = Math.min(1, t), t >= 1 && (this.isAnimatingTrophy = !1, this.animatingTrophyParticles && (this.animatingTrophyParticles.stop(), 
            this.animatingTrophyParticles = null), this.trophyProgressEl.classList.remove("intense-shaking"));
            const i = ao(this.animatingTrophyStartValue, this.trophyProgress, t);
            this.trophyProgressEl.setAttribute("value", String(i));
            const n = this.trophyProgressEl.getBoundingClientRect(), r = n.left + n.width * i, s = n.top + n.height / 2, a = new P(r, s);
            this.animatingTrophyParticles && this.animatingTrophyParticles.setStartPos(a);
        }
    }
}

function Ro(t) {
    return t < .5 ? 8 * t * t * t * t : 1 - Math.pow(-2 * t + 2, 4) / 2;
}

function Lo(t) {
    return 1 - Math.pow(1 - t, 4);
}

class Do {
    constructor(t, e) {
        this.obj = t, this.pos = e, this.t = 0, this.updateTransform();
    }
    loop(t, e) {
        this.t += e, this.updateTransform();
    }
    updateTransform() {
        const t = ho(this.t / 1e3), e = .7 * Lo(t), i = this.pos.clone();
        i.y += e, this.obj.position.copy(i);
        let n = function(t) {
            return Math.pow(t, 4);
        }(t);
        n = ao(.25, 0, n), this.obj.scale.setScalar(n), this.obj.rotation.y = 5.3 * Lo(t);
    }
    get canDestroy() {
        return this.t > 1e3;
    }
}

class Io {
    constructor({onChange: t, onDestruct: e, type: i}) {
        this.coords = [], this.onChange = t, this.onDestruct = e, this._type = i;
    }
    get type() {
        return this._type;
    }
    setCoords(t) {
        this.coords = t, this.onChange();
    }
    destructor() {
        this.onDestruct();
    }
}

function Uo(t) {
    return function(t) {
        const e = 1e4 * Math.sin(t);
        return e - Math.floor(e);
    }(t.x + 100 * t.y);
}

function No(t, e, i, n) {
    function r(n) {
        const r = Math.pow(2, n), s = t.clone().divideScalar(r);
        return s.addScaledVector(i, n + e), function(t) {
            const e = t.clone();
            e.x = Math.floor(e.x), e.y = Math.floor(e.y);
            const i = t.clone();
            i.x = so(i.x, 1), i.y = so(i.y, 1);
            const n = i.clone();
            n.multiplyScalar(2), n.x = 3 - n.x, n.y = 3 - n.y;
            const r = i.clone().multiply(i).multiply(n), s = e.clone(), a = e.clone();
            a.x++;
            const o = e.clone();
            o.y++;
            const l = e.clone();
            l.x++, l.y++;
            const h = Uo(s), c = Uo(a), d = Uo(o), u = Uo(l), p = ao(h, c, r.x), g = ao(d, u, r.x);
            return ao(p, g, r.y);
        }(s);
    }
    const s = e, a = s + n, o = n / 2;
    let l = 0;
    for (let t = s; t < a; t++) {
        const i = 1 - Math.abs(t - o - s) / (o + 1);
        l += r(t - e) * i;
    }
    return l / n;
}

function Bo(t, e, i, n) {
    const r = Math.max(Math.abs(t.x + .5), Math.abs(t.y + .5)), s = Math.floor(Math.log2(r / e)), a = Math.pow(2, s), o = t.clone().divideScalar(a);
    return o.addScaledVector(i, s + n), o.x = Math.floor(o.x), o.y = Math.floor(o.y), 
    Uo(o);
}

function Oo(t, e) {
    const i = Bo(t.clone(), 3, new P(10, 5), e), n = Bo(t.clone(), 3, new P(8, 6), e);
    let r;
    const s = 12 / Math.pow(2, e);
    if (t.x < s && t.y < s && t.x >= -s && t.y >= -s) r = "any"; else {
        const t = [ {
            item: "any",
            probability: 1
        }, {
            item: "none",
            probability: .03
        } ];
        for (let e = 0; e < to.length; e++) {
            to[e].isTrophyBuilding || t.push({
                item: e,
                probability: .03
            });
        }
        r = So(t, i) ?? "any";
    }
    let a = function(t, e) {
        const i = t.length(), n = No(t.clone(), e, new P(10, 3), 4), r = Math.pow(2, 40 * (n - .5)), s = Math.log2(i) + e;
        let a = 5 * Math.pow(2, 4 * s) * r;
        return a = Math.pow(a, .4), a = Math.max(1, Math.floor(a)), a;
    }(t, e);
    0 == e && 0 == t.x && 0 == t.y && (a = 0);
    let o = null;
    {
        const i = Math.max(Math.abs(t.x + .5), Math.abs(t.y + .5)), r = Math.floor(Math.log2(i / 3)), s = Math.pow(2, r);
        if (0 == so(t.x, s) && 0 == so(t.y, s)) {
            const i = Math.max(0, r), s = eo[i + e];
            if (s) {
                const r = [];
                let a = 0;
                for (const [t, e] of Object.entries(s.assetChances)) r.push({
                    item: t,
                    probability: e
                }), a += e;
                a < 1 && r.push({
                    item: null,
                    probability: 1 - a
                });
                const l = So(r, n);
                if (l) {
                    const n = Bo(t.clone(), 3, new P(-3, 8), e);
                    o = {
                        asset: l,
                        rotation: Math.floor(ao(0, 4, n)),
                        powerSize: i
                    };
                }
            }
        }
    }
    return {
        allowedBuildings: r,
        price: a,
        environment: o
    };
}

class Fo {
    constructor({startValue: t = 0, springMultiplier: e = .02, maxSpring: i = 1 / 0, damping: n = .6, loopValue: r = !1, loopStart: s = -Math.PI, loopEnd: a = Math.PI} = {}) {
        this.value = t, this.target = t, this.velocity = 0, this.springMultiplier = e, this.maxSpring = i, 
        this.damping = n, this.loopValue = r, this.loopStart = s, this.loopEnd = a;
    }
    loop(t, e) {
        let i = this.target - this.value;
        if (this.loopValue) {
            this.target = this.performValueLoop(this.target);
            const t = this.loopEnd - this.loopStart, e = this.target, n = this.target - t, r = this.target + t, s = e - this.value, a = n - this.value, o = r - this.value;
            i = s, Math.abs(a) < Math.abs(i) && (i = a), Math.abs(o) < Math.abs(i) && (i = o);
        }
        i *= this.springMultiplier, i = lo(i, -this.maxSpring, this.maxSpring), this.velocity += i, 
        this.velocity *= this.damping, this.value += this.velocity * e, this.loopValue && (this.value = this.performValueLoop(this.value));
    }
    performValueLoop(t) {
        return e = t, i = this.loopStart, n = this.loopEnd, so(e - i, n - i) + i;
        var e, i, n;
    }
}

class ko {
    constructor({startValue: t = new tt, springMultiplier: e = .02, maxSpring: i = 1 / 0, damping: n = .6} = {}) {
        this.xValue = new Fo({
            startValue: t.x,
            springMultiplier: e,
            maxSpring: i,
            damping: n
        }), this.yValue = new Fo({
            startValue: t.y,
            springMultiplier: e,
            maxSpring: i,
            damping: n
        }), this.zValue = new Fo({
            startValue: t.z,
            springMultiplier: e,
            maxSpring: i,
            damping: n
        });
    }
    loop(t, e) {
        this.xValue.loop(t, e), this.yValue.loop(t, e), this.zValue.loop(t, e);
    }
    get velocity() {
        return new tt(this.xValue.velocity, this.yValue.velocity, this.zValue.velocity);
    }
    get value() {
        return new tt(this.xValue.value, this.yValue.value, this.zValue.value);
    }
    set value(t) {
        this.xValue.value = t.x, this.yValue.value = t.y, this.zValue.value = t.z;
    }
    get target() {
        return new tt(this.xValue.target, this.yValue.target, this.zValue.target);
    }
    set target(t) {
        this.xValue.target = t.x, this.yValue.target = t.y, this.zValue.target = t.z;
    }
    addImpulse(t) {
        this.xValue.velocity += t.x, this.yValue.velocity += t.y, this.zValue.velocity += t.z;
    }
}

class Ho {
    constructor(t, e, i, n, r) {
        this.game = t, this._type = e, this._powerArea = i, this._height = n, this.grid = r, 
        this._isTrophyBuilding = 3 == e;
        const s = Ka.clone(), a = to[e];
        s.color.copy(a.color), this.obj = new ee, this.buildingObjContainer = new ee, this.buildingObjContainer.name = "asset", 
        this.obj.add(this.buildingObjContainer), this.updateRenderScale(), this._draggingPos = null, 
        this.draggingOccupiedTileList = null, this.draggingPurchaseLandList = null, this._gridCoord = null, 
        this.animatedCoins = new Set, this.lastCoinAnimationTime = jh().now, this.assets = [], 
        this.mergeHighlight = null, this.mergeHighlightPosDirty = !0, this.mergeHighlightVisible = !1, 
        this.pointerHighlightObjects = null, this.randomRotY = _o(0, 3) * Math.PI * .5, 
        this.purchasedTetrinoTiles = !1, this.tetrinoOptions = null, this.isTrophyBuilding && (this.tetrinoOptions = {
            shapeId: _o(0, 5),
            rotation: _o(0, 4),
            flip: Math.random() > .5
        }), this.currentLoadedAssetData = "", this.currentlyLoadingAssetSym = null, this.loadAsset();
    }
    get type() {
        return this._type;
    }
    get powerArea() {
        return this._powerArea;
    }
    get powerAreaSimplified() {
        return this._powerArea + this.grid.simplifyCount;
    }
    get height() {
        return this._height;
    }
    get isTrophyBuilding() {
        return this._isTrophyBuilding;
    }
    get purchaseTetrinoOnDrop() {
        return this._isTrophyBuilding && !this.purchasedTetrinoTiles;
    }
    getBuildingData() {
        return {
            type: this._type,
            powerAreaSimplified: this.powerAreaSimplified,
            height: this._height
        };
    }
    async loadAsset() {
        const t = `${this._type}-${this.powerAreaSimplified}-${this._height}`;
        if (t == this.currentLoadedAssetData) return;
        const e = Symbol("Loading asset");
        this.currentlyLoadingAssetSym = e;
        const i = await jh().assets.buildingCreator.createBuildingAsset({
            type: this._type,
            powerAreaSimplified: this.powerAreaSimplified,
            height: this._height
        });
        if (e == this.currentlyLoadingAssetSym) {
            if (this.currentLoadedAssetData = t, this.assets) for (const t of this.assets) t.obj.parent?.remove(t.obj);
            this.assets = [];
            for (const t of i.assets) {
                const e = new tt(0, 0, 1);
                e.applyAxisAngle(new tt(0, 1, 1), Math.random() * Math.PI * 2), e.normalize(), this.assets.push({
                    obj: t.obj,
                    height: t.height,
                    physicsPos: new ko({
                        damping: co(t.height, 0, 3, .45, .35),
                        springMultiplier: co(t.height, 0, 3, .015, .005)
                    }),
                    physicsDragAmount: new Fo,
                    randomRotAxis: e
                });
            }
            for (const t of this.assets) this.buildingObjContainer.add(t.obj);
            this.mergeHighlight = i.mergeHighlight, this.obj.add(i.mergeHighlight), this.mergeHighlight.visible = this.mergeHighlightVisible, 
            this.setMergeHighlightPosDirty(), this.updateRenderScale(), this.startHeightAnimation();
        }
    }
    get gridCoord() {
        return this._gridCoord;
    }
    setDraggingPos(t) {
        if (this._draggingPos = {
            newCoord: t.newCoord.clone(),
            type: t.type
        }, this.draggingOccupiedTileList || (this.draggingOccupiedTileList = this.game.gridVisualiser.addTileHighlightList(1)), 
        this.draggingOccupiedTileList.setCoords(t.occupiedCoords || []), this.purchaseTetrinoOnDrop) {
            this.draggingPurchaseLandList || (this.draggingPurchaseLandList = this.game.gridVisualiser.addTileHighlightList(2));
            const e = [];
            if ("none" != t.type) for (const i of this.getTrophyPurchaseTiles(t.newCoord)) e.push(i.gridCoord.clone());
            this.draggingPurchaseLandList.setCoords(e);
        }
    }
    * getTrophyPurchaseTiles(t) {
        const e = Math.pow(2, this.powerArea);
        for (let i = -1; i <= 1; i++) for (let n = -1; n <= 1; n++) {
            const r = t.clone();
            r.x += i * e, r.y += n * e;
            for (const t of this.grid.getPowerTiles(r, this.powerArea)) t && (yield t);
        }
    }
    get draggingPos() {
        return this._draggingPos ? this._draggingPos.newCoord.clone() : null;
    }
    cancelDragging() {
        this._draggingPos = null, this.draggingOccupiedTileList && this.draggingOccupiedTileList.destructor(), 
        this.draggingOccupiedTileList = null, this.draggingPurchaseLandList && this.draggingPurchaseLandList.destructor(), 
        this.draggingPurchaseLandList = null;
    }
    setGridCoord(t, e) {
        const i = () => {
            this._gridCoord || (this._gridCoord = new P), this._gridCoord.copy(t);
        };
        if (e ? i() : this.changePropsWithoutAnimating((() => {
            i();
        })), this.isTrophyBuilding && !this.purchasedTetrinoTiles) {
            for (const e of this.getTrophyPurchaseTiles(t)) e.purchase();
            this.purchasedTetrinoTiles = !0;
        }
        this.setMergeHighlightPosDirty();
    }
    changePropsWithoutAnimating(t) {
        const e = [];
        for (const t of this.assets) e.push(this.getAssetTargetPos(t));
        t();
        for (const [t, i] of this.assets.entries()) {
            const n = e[t], r = this.getAssetTargetPos(i);
            if (!n || !r) continue;
            const s = n.sub(r), a = i.physicsPos.value.sub(s);
            i.physicsPos.value = a, i.obj.position.copy(i.physicsPos.value);
        }
    }
    repositionOnSimplifiedGrid(t) {
        this.changePropsWithoutAnimating((() => {
            this._gridCoord && (this._powerArea--, this._gridCoord.copy(t));
        })), this.updateRenderScale(), this.setMergeHighlightPosDirty();
    }
    upgradeHeight() {
        if (this.isMaxHeight()) throw new Error("Building is already at the max height");
        this._height++, this.updateRenderScale(), this.loadAsset();
    }
    isMaxHeight() {
        return !!this._isTrophyBuilding || 2 == this._height;
    }
    upgradePowerArea() {
        this._height = 1, this._powerArea++, this.updateRenderScale(), this.setMergeHighlightPosDirty(), 
        this.loadAsset();
    }
    isSimilar(t) {
        return t._type == this._type && t._height == this._height && t._powerArea == this._powerArea;
    }
    updateRenderScale() {
        const t = Math.pow(2, this._powerArea);
        this.obj.scale.setScalar(t);
    }
    getTargetPos() {
        let t = this._draggingPos?.newCoord || this._gridCoord;
        return t ? (t = t.clone(), t.divideScalar(Math.pow(2, this._powerArea)), new tt(t.x + .5, 0, t.y + .5)) : null;
    }
    getAssetTargetPos(t, {forcedHeightOffset: e, forcedHeightMultiplier: i} = {}) {
        const n = this.getTargetPos();
        if (!n) return null;
        let r = Boolean(this._draggingPos) ? 1.15 : 1;
        null != i && (r = i);
        let s = .25;
        return null != e ? s = e : "none" == this._draggingPos?.type ? s = .35 : "place" == this._draggingPos?.type ? s = .3 : "merge" == this._draggingPos?.type && (s = 1.2), 
        n.y = t.height * r + s, n;
    }
    loop(t, e) {
        if (this.assets) {
            const i = this._draggingPos || this._gridCoord, n = Boolean(this._draggingPos);
            if (i) for (const i of this.assets) {
                const r = this.getAssetTargetPos(i);
                if (!r) continue;
                i.physicsPos.target = r, i.physicsPos.loop(t, e), i.physicsDragAmount.target = n ? 1 : 0, 
                i.physicsDragAmount.loop(t, e);
                const s = i.physicsPos.velocity, a = new tt(0, 1, 0).cross(s).normalize(), o = new $;
                o.setFromAxisAngle(i.randomRotAxis, .1 * i.physicsDragAmount.value), i.obj.quaternion.setFromAxisAngle(a, 40 * s.length()), 
                i.obj.quaternion.multiply(o);
                const l = new $;
                l.setFromAxisAngle(new tt(0, 1, 0), this.randomRotY), i.obj.quaternion.multiply(l), 
                i.obj.position.copy(i.physicsPos.value);
            }
        }
        if (this.mergeHighlight?.visible) for (let [e, i] of this.mergeHighlight.children.entries()) i.scale.y = co(Math.cos(.002 * t + 935487 * e), -1, 1, .8, 1.2);
        t > this.lastCoinAnimationTime + 3e3 && this.playCoinAnimation();
        for (const i of this.animatedCoins) i.loop(t, e), i.canDestroy && (this.animatedCoins.delete(i), 
        this.obj.remove(i.obj));
    }
    playCoinAnimation() {
        const t = this.game.getCoinAsset();
        if (!t) return;
        this.obj.add(t);
        const e = this.getTargetPos();
        if (!e) return null;
        e.y = .5 * (this.height + .5), e.x += yo(-.3, .3), e.z += yo(-.3, .3);
        const i = new Do(t, e);
        this.animatedCoins.add(i), this.lastCoinAnimationTime = jh().now;
    }
    get raycastPhysicalHeight() {
        return 0 == this.powerAreaSimplified ? .4 * this.height : .5 * this.height * Math.pow(2, this._powerArea) + 1;
    }
    get centerPhysicalHeight() {
        return .2 * this.height * Math.pow(2, this._powerArea);
    }
    raycast(t) {
        return 0 == this.powerAreaSimplified || t.intersectObject(this.buildingObjContainer).length > 0;
    }
    startHeightAnimation() {
        for (const t of this.assets) {
            const e = this.getAssetTargetPos(t, {
                forcedHeightOffset: .25,
                forcedHeightMultiplier: 1.2
            });
            e && (t.physicsPos.target = e, t.physicsPos.value = e, t.physicsDragAmount.value = 1);
        }
    }
    setMergeHighlightVisible(t) {
        this.mergeHighlightVisible = t, this.mergeHighlight && (this.mergeHighlight.visible = t), 
        this.updateMergeHighlightPos();
    }
    setMergeHighlightPosDirty() {
        this.mergeHighlightPosDirty = !0, this.updateMergeHighlightPos();
    }
    updateMergeHighlightPos() {
        if (!this.mergeHighlightPosDirty || !this._gridCoord || !this.mergeHighlight) return;
        if (!this.mergeHighlight.visible) return;
        const t = new tt(this._gridCoord.x, 0, this._gridCoord.y);
        t.divideScalar(Math.pow(2, this._powerArea)), t.x += .5, t.z += .5, this.mergeHighlight.position.copy(t), 
        this.mergeHighlightPosDirty = !1;
    }
    setPointerHighlightVisible(t) {
        if (t) {
            if (this.pointerHighlightObjects) return;
            this.pointerHighlightObjects = [];
            for (const t of this.assets) {
                const e = t.obj.clone();
                this.obj.add(e), $a(e, Za);
                for (const t of ja(e)) t.renderOrder = 100;
                this.pointerHighlightObjects.push(e);
            }
        } else {
            if (!this.pointerHighlightObjects) return;
            for (const t of this.pointerHighlightObjects) this.obj.remove(t);
            this.pointerHighlightObjects = null;
        }
    }
    shiftPointerHighlightObjects(t) {
        if (!this.pointerHighlightObjects) return;
        const e = Math.pow(2, this.powerArea);
        for (const i of this.pointerHighlightObjects) i.position.x -= t.x / e, i.position.z -= t.y / e;
    }
    shiftDraggingPos(t) {
        this.changePropsWithoutAnimating((() => {
            this._draggingPos && this._draggingPos.newCoord.sub(t);
        }));
    }
    simplifyDraggingPos() {
        this.changePropsWithoutAnimating((() => {
            this._gridCoord || this._powerArea--, this._draggingPos && this._draggingPos.newCoord.divideScalar(2);
        })), this.updateRenderScale(), this.setMergeHighlightPosDirty();
    }
}

class zo {
    constructor({grid: t, tile: e, powerArea: i, onUnbox: n}) {
        this.grid = t, this.attachedTile = e, this._powerArea = i, this.onUnbox = n, this.obj = new ee, 
        this.obj.name = "crate", this.obj.position.y = 100, this.obj.rotation.y = _o(0, 4) * Math.PI * .5, 
        this.pointerHighlightObj = null, this.pointerHighlightVisible = !1, this.isFalling = !0, 
        this.fallT = 0, this.loadAsset(), this.updateGridPosition(), this.updateObjectScale();
    }
    destructor() {
        this.obj.parent && this.obj.parent.remove(this.obj);
    }
    get powerArea() {
        return this._powerArea;
    }
    get raycastPhysicalHeight() {
        return .5 * Math.pow(2, this._powerArea);
    }
    raycast(t) {
        return t.intersectObject(this.obj).length > 0;
    }
    attachToSimplifiedTile(t) {
        this.attachedTile = t, this._powerArea--, this.updateGridPosition(), this.updateObjectScale();
    }
    getGridCoord() {
        return this.attachedTile.gridCoord.clone();
    }
    getGridPosition() {
        return new P(this.obj.position.x, this.obj.position.z);
    }
    async loadAsset() {
        const t = (await jh().assets.crateAsset).clone();
        this.obj.add(t);
        const e = t.clone();
        $a(e, Za);
        for (const t of ja(e)) t.renderOrder = 100;
        this.obj.add(e), this.pointerHighlightObj = e, this.updatePointerHighlight();
    }
    loop(t, e) {
        if (this.isFalling) {
            let t;
            if (this.fallT += e, this.fallT < 700) t = co(this.fallT, 0, 700, 10, 0); else {
                const e = .005 * (this.fallT - 700);
                t = Math.abs(Math.sin(e * Math.PI)) * Math.pow(2, -Math.floor(e)) * .3, e > 3 && (t = 0, 
                this.isFalling = !1);
            }
            this.obj.position.y = t;
        }
    }
    updateGridPosition() {
        const t = Math.pow(2, this.powerArea - 1);
        this.obj.position.x = this.attachedTile.gridCoord.x + t, this.obj.position.z = this.attachedTile.gridCoord.y + t;
    }
    updateObjectScale() {
        this.obj.scale.setScalar(Math.pow(2, this.powerArea));
    }
    get canBeUnboxed() {
        return this.fallT > 700;
    }
    unbox() {
        this.canBeUnboxed && this.onUnbox();
    }
    setPointerHighlightVisible(t) {
        this.pointerHighlightVisible = t, this.updatePointerHighlight();
    }
    updatePointerHighlight() {
        this.pointerHighlightObj && (this.pointerHighlightObj.visible = this.pointerHighlightVisible);
    }
}

class Go {
    constructor(t, e, i, n, r) {
        this.grid = t, this._building = null, this._crate = null, this.gridCoord = e, this._purchased = !1, 
        this.material = Ka.clone();
        const s = Oo(i, n);
        this._allowedBuildings = s.allowedBuildings, this._needsEnvironmentAsset = !0, this.price = s.price, 
        0 == this.price && this._setPurchased(), this.environmentAssetObject = null, this.environmentPowerSize = 0;
        const {environment: a} = s;
        a && (async () => {
            const t = await jh().assets.environmentAssetManager.getAsset(a.asset);
            if (!this._needsEnvironmentAsset) return;
            const e = t.clone();
            this.environmentAssetObject = e, e.scale.setScalar(Math.pow(2, a.powerSize)), this.environmentPowerSize = a.powerSize, 
            e.rotation.y = .5 * Math.PI * a.rotation, Qa(e), r.add(e), this.updateRenderPos();
        })(), this.updateFloorColor();
    }
    destructor() {
        this.removeAssetObject();
    }
    removeAssetObject() {
        this._needsEnvironmentAsset = !1, this.environmentAssetObject && this.environmentAssetObject.parent && this.environmentAssetObject.parent.remove(this.environmentAssetObject);
    }
    get building() {
        return this._building;
    }
    get crate() {
        return this._crate;
    }
    get purchased() {
        return this._purchased;
    }
    get allowedBuildings() {
        return this._allowedBuildings;
    }
    canPlaceBuildingType(t, {ignoreColoredtiles: e = !1, ignorePurchased: i = !1} = {}) {
        if (!i && !this._purchased) return !1;
        if (this.occupied) return !1;
        if (!e) {
            if ("none" == this._allowedBuildings) return !1;
            if ("number" == typeof this._allowedBuildings && this._allowedBuildings != t) return !1;
        }
        return !0;
    }
    purchase() {
        this._setPurchased(), this.updateFloorColor();
    }
    _setPurchased() {
        this._purchased = !0, this.removeAssetObject();
    }
    setAllowedBuildings(t) {
        this._allowedBuildings = t;
    }
    updateFloorColor() {
        if (this.material.color.set(0), "any" == this._allowedBuildings) this.material.color.set(16777215); else if ("number" == typeof this._allowedBuildings) {
            const t = to[this._allowedBuildings];
            t && this.material.color.copy(t.color);
        }
        this._purchased || this.material.color.multiplyScalar(.3);
    }
    setPlacedBuilding(t) {
        if (t && this.occupied) throw new Error("Tile is already occupied");
        this._crate && this.grid.removeCrate(this._crate), this._building = t;
    }
    assignCrate(t) {
        if (t && (this.occupied || this._crate)) throw new Error("Tile is already occupied");
        this._crate = t;
    }
    get occupied() {
        return Boolean(this._building);
    }
    updateRenderPos() {
        if (this.environmentAssetObject) {
            const t = Math.pow(2, this.environmentPowerSize - 1);
            this.environmentAssetObject.position.set(this.gridCoord.x + t, 0, this.gridCoord.y + t);
        }
    }
}

class Vo {
    constructor() {
        this.obj = new ee, this.obj.name = "grid", this.unplacedDraggingBuildings = new Set, 
        this.width = 1, this.height = 1, this.simplifyCount = 0, this.canSimplify = !1, 
        this.onTileDataChangedCbs = new Set, this.onTilesPurchasedCbs = new Set, this.onSimplifyCbs = new Set, 
        this.onSimplifyFinishCbs = new Set, this.onGridShiftCbs = new Set, this.worldCenterOffset = new P, 
        this.tiles = [ [] ];
    }
    init() {
        const t = this.createTile(0, 0);
        this.tiles = [ [ t ] ];
    }
    onTileDataChanged(t) {
        this.onTileDataChangedCbs.add(t);
    }
    fireOnTileDataChangeCbs() {
        this.onTileDataChangedCbs.forEach((t => t()));
    }
    expandGrid(t, e, i, n) {
        if (t = Math.max(0, t), e = Math.max(0, e), i = Math.max(0, i), n = Math.max(0, n), 
        !(t <= 0 && e <= 0 && i <= 0 && n <= 0)) {
            for (let e = 0; e < t; e++) this.expandGridOnce("left");
            for (let t = 0; t < e; t++) this.expandGridOnce("right");
            for (let t = 0; t < i; t++) this.expandGridOnce("up");
            for (let t = 0; t < n; t++) this.expandGridOnce("down");
            this.fireOnTileDataChangeCbs();
        }
    }
    expandGridOnce(t) {
        if ("right" == t) {
            for (let t = 0; t < this.height; t++) {
                this.tiles[t].push(this.createTile(this.width, t));
            }
            this.width++;
        } else if ("down" == t) {
            const t = [];
            for (let e = 0; e < this.width; e++) t.push(this.createTile(e, this.height));
            this.tiles.push(t), this.height++;
        } else if ("left" == t) {
            const t = new P(-1, 0);
            this.shiftGrid(t);
            for (let t = 0; t < this.height; t++) {
                const e = this.tiles[t];
                for (const t of e) t.gridCoord.x++, t.updateRenderPos();
                e.unshift(this.createTile(0, t));
            }
            for (const t of this.allBuildings()) {
                if (!t.gridCoord) continue;
                const e = t.gridCoord.clone();
                e.x++, t.setGridCoord(e, !1);
            }
            this.width++, this.onGridShiftCbs.forEach((e => e(t)));
        } else if ("up" == t) {
            const t = new P(0, -1);
            this.shiftGrid(t);
            for (const t of this.allTiles()) t.gridCoord.y++, t.updateRenderPos();
            const e = [];
            for (let t = 0; t < this.width; t++) e.push(this.createTile(t, 0));
            this.tiles.unshift(e);
            for (const t of this.allBuildings()) {
                if (!t.gridCoord) continue;
                const e = t.gridCoord.clone();
                e.y++, t.setGridCoord(e, !1);
            }
            this.height++, this.onGridShiftCbs.forEach((e => e(t)));
        }
    }
    shiftGrid(t) {
        this.worldCenterOffset.sub(t);
    }
    worldToGridCoord(t) {
        return t.add(this.worldCenterOffset);
    }
    * allCoords() {
        for (let t = 0; t < this.width; t++) for (let e = 0; e < this.height; e++) yield new P(t, e);
    }
    * allTiles(t = this.tiles) {
        for (const e of t) for (const t of e) yield t;
    }
    * allBuildings(t = !1) {
        const e = new Set;
        for (const t of this.allTiles()) t.building && (e.has(t.building) || (yield t.building, 
        e.add(t.building)));
        if (t) for (const t of this.unplacedDraggingBuildings) yield t;
    }
    * allCrates() {
        const t = new Set;
        for (const e of this.allTiles()) e.crate && (t.has(e.crate) || (t.add(e.crate), 
        yield e.crate));
    }
    createTile(t, e) {
        const i = new P(t, e), n = i.clone();
        return n.sub(this.worldCenterOffset), new Go(this, i, n, this.simplifyCount, this.obj);
    }
    canMergeBuildingCoord(t, e) {
        const i = this.getTile(e);
        return !(!i || !i.building) && this.canMergeBuildings(i.building, t);
    }
    canMergeBuildings(t, e) {
        return t != e && (!t.isMaxHeight() && !!t.isSimilar(e));
    }
    canPlaceBuilding(t, e, i) {
        let n = !0, r = [];
        t.purchaseTetrinoOnDrop && (i = {
            ...i,
            ignorePurchased: !0,
            ignoreColoredtiles: !0
        });
        for (const s of this.getPowerTiles(e, t.powerArea)) s ? s.building != t && (s.canPlaceBuildingType(t.type, i) || (n = !1, 
        r.push(s.gridCoord.clone()))) : n = !1;
        return {
            canPlace: n,
            occupiedTileCoords: r
        };
    }
    canPlaceBuildingType(t, e, i, n) {
        for (const r of this.getPowerTiles(i, t)) {
            if (!r) return !1;
            if (!r.canPlaceBuildingType(e, n)) return !1;
        }
        return !0;
    }
    * getPowerTiles(t, e, i = this.tiles) {
        const n = Math.pow(2, e);
        for (let e = 0; e < n; e++) {
            const r = i[t.y + e];
            for (let e = 0; e < n; e++) if (r) {
                const i = r[t.x + e];
                yield i || null;
            } else yield null;
        }
    }
    hasAvailablePurchasedArea(t) {
        for (const e of this.allTiles()) {
            if (!e.purchased) continue;
            let i = !1;
            for (const n of this.getPowerTiles(e.gridCoord, t)) if (!n || !n.purchased || n.occupied) {
                i = !0;
                break;
            }
            if (!i) return !0;
        }
        return !1;
    }
    addDraggingBuilding(t) {
        this.unplacedDraggingBuildings.add(t), this.addBuilding(t);
    }
    addBuilding(t) {
        this.obj.add(t.obj);
    }
    removeDraggingBuilding(t) {
        if (!this.unplacedDraggingBuildings.has(t)) return;
        this.unplacedDraggingBuildings.delete(t);
        let e = !1;
        for (const i of this.allBuildings()) if (i.gridCoord && t == i) {
            e = !0;
            break;
        }
        e || this.obj.remove(t.obj);
    }
    removeBuilding(t, e = !1) {
        const i = t.gridCoord;
        if (i) for (const e of this.getPowerTiles(i, t.powerArea)) e?.setPlacedBuilding(null);
        e && t.obj.parent && t.obj.parent.remove(t.obj);
    }
    removeCrate(t) {
        t.destructor();
        for (const e of this.getPowerTiles(t.getGridCoord(), t.powerArea)) e && e.assignCrate(null);
    }
    moveBuilding(t, e, {purchasedBuilding: i = !1, sfx: n = !0, throwOnFailure: r = !0, ignoreColoredtiles: s = !1} = {}) {
        if (this.canMergeBuildingCoord(t, e)) {
            this.removeBuilding(t, !0);
            const r = this.getTile(e);
            if (!r) throw new Error("Assertion failed, no tile at this coord");
            const s = r.building;
            if (!s) throw new Error("Assertion failed, no building on this tile");
            return s.upgradeHeight(), this.checkChangedBuilding(s), this.simplifyIfPossible(), 
            i || jh().game.tutorialSuggestionsManager.actionOccurred("merge-buildings"), n && jh().sfx.playSound("building/upgradeHeight"), 
            {
                type: "merged",
                mergedBuilding: s
            };
        }
        if (this.canPlaceBuilding(t, e, {
            ignoreColoredtiles: s
        }).canPlace) {
            this.removeBuilding(t);
            for (const i of this.getPowerTiles(e, t.powerArea)) {
                if (!i) throw new Error("Assertion failed, tile does not exist");
                i.setPlacedBuilding(t);
            }
            return t.setGridCoord(e, !0), n && jh().sfx.playSound("building/drop"), this.checkChangedBuilding(t), 
            this.simplifyIfPossible(), {
                type: "placed"
            };
        }
        if (r) throw new Error("Unable to move building to this location");
        return null;
    }
    allTilesPurchased(t, e) {
        for (const i of this.getPowerTiles(t, e)) if (i && !i.purchased) return !1;
        return !0;
    }
    purchaseTiles(t, e) {
        for (const i of this.getPowerTiles(t, e)) i && this.purchaseTile(i.gridCoord, !1);
        this.firePurchaseTilesCallbacks();
    }
    purchaseTile(t, e = !0) {
        const i = this.getTile(t);
        return !!i && (!i.purchased && (i.purchase(), 0 == t.x && this.expandGridOnce("left"), 
        0 == t.y && this.expandGridOnce("up"), t.x == this.width - 1 && this.expandGridOnce("right"), 
        t.y == this.height - 1 && this.expandGridOnce("down"), e && this.firePurchaseTilesCallbacks(), 
        !0));
    }
    onTilesPurchased(t) {
        this.onTilesPurchasedCbs.add(t);
    }
    firePurchaseTilesCallbacks() {
        this.fireOnTileDataChangeCbs(), this.onTilesPurchasedCbs.forEach((t => t()));
    }
    getMergingBuildingCoord(t, e) {
        for (const i of this.getPowerTiles(e, t.powerArea)) if (i && i.building && this.canMergeBuildings(t, i.building)) return i.building.gridCoord;
    }
    getPlaceableBuildingCoord(t, e) {
        const i = this.getMergingBuildingCoord(t, e);
        if (i) return {
            newCoord: i.clone(),
            type: "merge"
        };
        const n = this.canPlaceBuilding(t, e);
        return n.canPlace ? {
            newCoord: e.clone(),
            type: "place"
        } : {
            type: "none",
            occupiedCoords: n.occupiedTileCoords,
            newCoord: e.clone()
        };
    }
    checkChangedBuilding(t) {
        this.checkQuadMerge(t);
    }
    checkQuadMerge(t) {
        if (!t.isMaxHeight()) return;
        if (!t.gridCoord) return;
        if (t.powerAreaSimplified >= 10) return;
        const e = t.gridCoord, i = Math.pow(2, t.powerArea), n = (n, r) => {
            const s = e.clone();
            s.x += n * i, s.y += r * i;
            const a = this.getBuildingAtCoord(s);
            return a && a.isSimilar(t) && a.gridCoord ? a.gridCoord.x != s.x || a.gridCoord.y != s.y ? null : a : null;
        }, r = n(-1, 0), s = n(-1, -1), a = n(0, -1);
        if (r && a && s) return void this.performQuadMerge(t, r, a, s);
        const o = n(1, -1), l = n(1, 0);
        if (a && l && o) return void this.performQuadMerge(t, a, l, o);
        const h = n(1, 1), c = n(0, 1);
        if (l && c && h) return void this.performQuadMerge(t, l, c, h);
        const d = n(-1, 1);
        c && r && d && this.performQuadMerge(t, c, r, d);
    }
    performQuadMerge(...t) {
        let e = null;
        for (const i of t) if (e) {
            const t = e.gridCoord, n = i.gridCoord;
            if (!t || !n) continue;
            (t.x > n.x || t.y > n.y) && (e = i);
        } else e = i;
        if (!e) throw Error("Assertion failed, no buildings provided");
        if (!e.gridCoord) throw new Error("Assertion failed, building doesn't have a grid coord");
        const i = [];
        for (const n of t) e != n && i.push(n);
        for (const t of i) this.removeBuilding(t, !0);
        e.upgradePowerArea();
        for (const t of this.getPowerTiles(e.gridCoord, e.powerArea)) t?.setPlacedBuilding(null), 
        t?.setPlacedBuilding(e);
        jh().sfx.playSound("building/upgradeArea"), jh().game.tutorialSuggestionsManager.actionOccurred("quad-merge-building"), 
        this.simplifyIfPossible();
    }
    getTile(t, e = this.tiles) {
        const i = e[t.y];
        if (!i) return null;
        const n = i[t.x];
        return n || null;
    }
    getBuildingAtCoord(t) {
        const e = this.getTile(t);
        return e ? e.building : null;
    }
    getCrateAtCoord(t) {
        const e = this.getTile(t);
        return e ? e.crate : null;
    }
    setCanSimplify(t) {
        t != this.canSimplify && (this.canSimplify = t, t && this.simplifyIfPossible());
    }
    mapSimplifiedNewToOld(t, e, i, n) {
        const r = new P(t, e);
        return r.multiplyScalar(2), r.x -= i, r.y -= n, r;
    }
    mapSimplifiedOldToNew(t, e, i) {
        const n = t.clone();
        return n.x += e, n.y += i, n.divideScalar(2), n;
    }
    getSimplifyGridData() {
        const t = so(this.worldCenterOffset.x, 2), e = so(this.worldCenterOffset.y, 2);
        return {
            xOffset: t,
            yOffset: e,
            newWidth: Math.ceil((this.width + t) / 2),
            newHeight: Math.ceil((this.height + e) / 2)
        };
    }
    gradualSimplifyGrid() {
        const {xOffset: t, yOffset: e, newWidth: i, newHeight: n} = this.getSimplifyGridData(), r = new Set, s = new Map, a = this.computeSimplifiedWorldCenterOffset();
        for (let o = 0; o < i; o++) for (let i = 0; i < n; i++) {
            const n = this.mapSimplifiedNewToOld(o, i, t, e), l = new P(o, i);
            l.sub(a);
            const h = Oo(l, this.simplifyCount + 1).allowedBuildings;
            let c = !1;
            const d = [];
            for (const t of this.getPowerTiles(n, 1)) t && (t.purchased ? c = !0 : d.push(t), 
            t.allowedBuildings != h && s.set(t, h));
            if (c) for (const t of d) r.add(t);
        }
        let o = !1;
        const l = bo(Array.from(r));
        l && (this.purchaseTile(l.gridCoord), o = !0);
        const h = bo(Array.from(s));
        if (h) {
            const [t, e] = h;
            t.setAllowedBuildings(e), o = !0;
        }
        return o && (this.simplifyIfPossible(), this.fireOnTileDataChangeCbs()), !o;
    }
    computeSimplifiedWorldCenterOffset() {
        const t = this.worldCenterOffset.clone();
        return t.divideScalar(2), t.x = Math.ceil(t.x), t.y = Math.ceil(t.y), t;
    }
    isCornerCoord(t) {
        const e = t.clone().add(this.worldCenterOffset);
        if (0 != so(e.x, 2)) return !1;
        return 0 == so(e.y, 2);
    }
    simplifyIfPossible() {
        if (!this.canSimplify) return;
        for (const t of this.allBuildings()) if (t.gridCoord) {
            if (0 == t.powerArea) return;
            if (!this.isCornerCoord(t.gridCoord)) return;
        }
        for (const t of this.allCrates()) {
            if (0 == t.powerArea) return;
            if (!this.isCornerCoord(t.getGridCoord())) return;
        }
        const {xOffset: t, yOffset: e, newWidth: i, newHeight: n} = this.getSimplifyGridData(), r = this.computeSimplifiedWorldCenterOffset();
        for (let s = 0; s < i; s++) for (let i = 0; i < n; i++) {
            const n = this.mapSimplifiedNewToOld(s, i, t, e), a = new P(s, i);
            a.sub(r);
            const o = Oo(a, this.simplifyCount + 1).allowedBuildings;
            let l = !1, h = !0;
            for (const t of this.getPowerTiles(n, 1)) if (t && (t.purchased ? l = !0 : h = !1, 
            t.allowedBuildings != o)) return;
            if (l && !h) return;
        }
        this.simplifyCount++;
        const s = Array.from(this.allBuildings());
        for (const i of s) {
            const n = i.gridCoord;
            if (!n) continue;
            const r = this.mapSimplifiedOldToNew(n, t, e);
            i.repositionOnSimplifiedGrid(r);
        }
        const a = [];
        for (const i of this.allCrates()) {
            const n = i.getGridCoord(), r = this.mapSimplifiedOldToNew(n, t, e);
            a.push({
                crate: i,
                newCoord: r
            });
        }
        const o = this.tiles;
        this.width = 1, this.height = 1, this.worldCenterOffset.copy(r);
        const l = this.createTile(0, 0);
        this.tiles = [ [ l ] ];
        for (let t = 0; t < i - 1; t++) this.expandGridOnce("right");
        for (let t = 0; t < n - 1; t++) this.expandGridOnce("down");
        for (const i of this.allTiles()) {
            const n = this.mapSimplifiedNewToOld(i.gridCoord.x, i.gridCoord.y, t, e);
            let r = !1;
            for (const t of this.getPowerTiles(n, 1, o)) if (t?.purchased) {
                r = !0;
                break;
            }
            r && i.purchase();
        }
        this.onSimplifyCbs.forEach((t => t()));
        const h = new P(t / -2, e / -2);
        this.onGridShiftCbs.forEach((t => t(h)));
        for (const t of s) if (t.gridCoord) for (const e of this.getPowerTiles(t.gridCoord, t.powerArea)) {
            if (!e) throw new Error("Assertion failed, tile does not exist");
            e.setPlacedBuilding(null), e.setPlacedBuilding(t);
        }
        for (const {crate: t, newCoord: e} of a) {
            const i = this.getTile(e);
            if (!i) throw new Error("Assertion failed, tile does not exist");
            t.attachToSimplifiedTile(i);
            for (const i of this.getPowerTiles(e, t.powerArea)) {
                if (!i) throw new Error("Assertion failed, tile does not exist");
                i.assignCrate(t);
            }
        }
        this.checkGridExpansion("left"), this.checkGridExpansion("right"), this.checkGridExpansion("up"), 
        this.checkGridExpansion("down"), this.fireOnTileDataChangeCbs(), this.onSimplifyFinishCbs.forEach((t => t()));
        for (const t of this.allTiles(o)) t.destructor();
    }
    checkGridExpansion(t) {
        let e = [];
        if ("left" == t || "right" == t) for (let i = 0; i < this.height; i++) {
            const n = this.tiles[i];
            "left" == t ? n[0] : n[this.width - 1], e.push(n[0]);
        } else e = "up" == t ? this.tiles[0] : this.tiles[this.height - 1];
        let i = !1;
        for (const t of e) if (t.purchased) {
            i = !0;
            break;
        }
        i && this.expandGridOnce(t);
    }
    onSimplify(t) {
        this.onSimplifyCbs.add(t);
    }
    onSimplifyFinish(t) {
        this.onSimplifyFinishCbs.add(t);
    }
    onGridShift(t) {
        this.onGridShiftCbs.add(t);
    }
    getSaveGameData() {
        const t = [];
        for (let e = 0; e < this.height; e++) {
            const i = this.tiles[e], n = [];
            t.push(n);
            for (let t = 0; t < this.width; t++) {
                const e = i[t], r = {};
                n.push(r), e.purchased && (r.p = !0);
                const s = e.building;
                s && (r.b = {
                    t: s.type,
                    a: s.powerAreaSimplified,
                    h: s.height
                });
            }
        }
        return {
            simplifyCount: this.simplifyCount,
            worldCenterOffset: [ this.worldCenterOffset.x, this.worldCenterOffset.y ],
            tiles: t
        };
    }
    loadSaveGameData(t) {
        this.simplifyCount = t.simplifyCount, this.width = 1, this.height = 1;
        const e = t.tiles[0].length, i = t.tiles.length, n = new P(t.worldCenterOffset[0], t.worldCenterOffset[1]), r = this.worldCenterOffset.clone().sub(n);
        this.shiftGrid(r), this.onGridShiftCbs.forEach((t => t(r)));
        const s = this.createTile(0, 0);
        this.tiles = [ [ s ] ];
        for (let t = 0; t < e - 1; t++) this.expandGridOnce("right");
        for (let t = 0; t < i - 1; t++) this.expandGridOnce("down");
        const a = [], o = t.tiles;
        for (let t = 0; t < this.height; t++) {
            const e = this.tiles[t], i = o[t];
            for (let t = 0; t < this.width; t++) {
                const n = i[t], r = e[t];
                n.p && r.purchase();
                const s = n.b;
                s && a.push({
                    coord: r.gridCoord,
                    type: s.t,
                    powerArea: s.a,
                    height: s.h
                });
            }
        }
        return this.fireOnTileDataChangeCbs(), a;
    }
}

class Wo {
    constructor(t, e) {
        this.grid = e, this.plane = new Si(500, 500), this.plane.rotateX(-.5 * Math.PI);
        const i = document.createElement("canvas"), n = i.getContext("2d");
        if (i.width = 256, i.height = 256, !n) throw new Error("Failed to create 2d canvas context");
        this.ctx = n, this.tilesTexture = new Vs(i, 300, 1001, 1001, 1003, 1003), this.minBuildingPowerArea = 0, 
        this.maxBuildingPowerArea = 0, this.tilePricesVisible = !0, this.gridConfigPowerAreasOffset = 0, 
        this.desiredMinPrice = 0, this.desiredMaxPrice = 0, this.desiredCurrentPrice = 0, 
        this.textureMinPrice = 0, this.textureMaxPrice = 0, this.occupiedTileLists = new Set, 
        this.tileHighlights = [];
        for (let t = 0; t < 256; t++) {
            const t = [];
            this.tileHighlights.push(t);
            for (let e = 0; e < 256; e++) t.push(0);
        }
        const r = t.renderer.supportsFwidth();
        this.mat = new oi({
            name: "grid",
            vertexShader: "\n\t\t\t\tvarying vec3 vPos;\n\n\t\t\t\tvoid main() {\n\t\t\t\t\tvPos = position;\n\t\t\t\t\tvec4 mvPosition = modelViewMatrix * vec4(position, 1.0);\n\t\t\t\t\tgl_Position = projectionMatrix * mvPosition;\n\t\t\t\t}\n\t\t\t",
            fragmentShader: `\n\t\t\t\t${r.needsEnable ? "#extension GL_OES_standard_derivatives : enable" : ""}\n\n\t\t\t\tstruct GridConfig {\n\t\t\t\t\tfloat scale;\n\t\t\t\t\tfloat strokeWidth;\n\t\t\t\t};\n\t\t\t\tuniform GridConfig grids[ 4 ];\n\n\t\t\t\tvarying vec3 vPos;\n\t\t\t\tuniform float time;\n\t\t\t\tuniform float tilesScale;\n\t\t\t\tuniform vec2 gridsOffset;\n\t\t\t\tuniform sampler2D tilesTextureSampler;\n\t\t\t\tuniform float minPrice;\n\t\t\t\tuniform float maxPrice;\n\t\t\t\tuniform float minTexturePrice;\n\t\t\t\tuniform float maxTexturePrice;\n\t\t\t\tuniform float currentPrice;\n\t\t\t\tuniform float priceOpacity;\n\n\t\t\t\tfloat grid1d(float x, float strokeWidth) {\n\t\t\t\t\tfloat fw = ${r.supported ? "fwidth(x)" : "0.01"};\n\t\t\t\t\tfloat grid = strokeWidth - abs(fract(x - 0.5) - 0.5) / fw;\n\n\t\t\t\t\tgrid *= max(1.0, fw * 2.0);\n\t\t\t\t\tgrid = clamp(grid, 0.0, 1.0);\n\t\t\t\t\treturn grid;\n\t\t\t\t}\n\n\t\t\t\tfloat grid2d(vec2 coord, float strokeWidth) {\n\t\t\t\t\tvec2 grid2d = vec2(grid1d(coord.x, strokeWidth), grid1d(coord.y, strokeWidth));\n\n\t\t\t\t\treturn max(grid2d.x, grid2d.y);\n\t\t\t\t}\n\n\t\t\t\t\n\t\t\t\tvec4 getExactColor(float textureChannel, float intRepresentation, vec3 outputColor) {\n\t\t\t\t\tfloat dist = 1.0 - clamp(abs(textureChannel - (intRepresentation / 255.0)) * 255.0, 0.0, 1.0);\n\t\t\t\t\treturn vec4(outputColor * dist, dist);\n\t\t\t\t}\n\n\t\t\t\tfloat iLerp(float a, float b, float t) {\n\t\t\t\t\treturn (t - a) / (b - a);\n\t\t\t\t}\n\n\t\t\t\tvoid main() {\n\t\t\t\t\tvec3 bgColorCheap = vec3(0.525, 0.756, 0.376);\n\t\t\t\t\tvec3 bgColorExpensive = vec3(0.007, 0.45, 0.37);\n\n\t\t\t\t\tvec3 gridColor = vec3(0.15, 0.15, 0.15);\n\n\t\t\t\t\tvec2 tilesCoord = (vPos.xz / tilesScale) + 1.0;\n\t\t\t\t\tvec4 texColor = texture2D(tilesTextureSampler, tilesCoord / 256.0);\n\n\t\t\t\t\tvec2 inverseGridsOffset = gridsOffset * -1.0;\n\n\t\t\t\t\tvec2 gridCoord = vPos.xz / tilesScale;\n\t\t\t\t\tfloat grid = 0.0;\n\t\t\t\t\tfor ( int i = 0; i < 4; i++) {\n\t\t\t\t\t\tGridConfig config = grids[i];\n\t\t\t\t\t\tfloat gridValue = grid2d((inverseGridsOffset * tilesScale + vPos.xz) / (config.scale * tilesScale), config.strokeWidth);\n\t\t\t\t\t\tgrid = max(grid, gridValue);\n\t\t\t\t\t}\n\n\t\t\t\t\tvec4 allowedBuildingsColor = vec4(0.0, 0.0, 0.0, 0.0);\n\t\t\t\t\tallowedBuildingsColor += getExactColor(texColor.g, 1.0, vec3(0.2, 0.2, 0.2));\n\t\t\t\t\tallowedBuildingsColor += getExactColor(texColor.g, 2.0, vec3(0.839, 0.270, 0.125));\n\t\t\t\t\tallowedBuildingsColor += getExactColor(texColor.g, 3.0, vec3(0.129, 0.678, 0.258));\n\t\t\t\t\tallowedBuildingsColor += getExactColor(texColor.g, 4.0, vec3(0.212, 0.35, 0.94));\n\t\t\t\t\tallowedBuildingsColor += getExactColor(texColor.g, 5.0, vec3(0.9, 0.7, 0.3));\n\n\t\t\t\t\tvec2 diagonalsPos = vPos.xz - gridsOffset * tilesScale;\n\t\t\t\t\tallowedBuildingsColor.a *= clamp(cos((diagonalsPos.x + diagonalsPos.y - time * 0.1) * 30.0) * 3.0, 0.0, 1.0);\n\n\t\t\t\t\tvec4 purchasedColor = getExactColor(texColor.r, 0.0, vec3(0.63, 0.63, 0.63));\n\n\t\t\t\t\tvec4 highlightColor = getExactColor(texColor.b, 1.0, vec3(1.0, 0.0, 0.0));\n\t\t\t\t\thighlightColor += getExactColor(texColor.b, 2.0, vec3(0.6, 0.4, 0.0));\n\n\t\t\t\t\tfloat tilePrice = mix(minTexturePrice, maxTexturePrice, texColor.r);\n\t\t\t\t\tfloat tilePrice01 = clamp(iLerp(minPrice, maxPrice, tilePrice), 0.0, 1.0);\n\t\t\t\t\ttilePrice01 = pow(tilePrice01, 0.3);\n\t\t\t\t\tvec3 col = mix(bgColorCheap, bgColorExpensive, tilePrice01);\n\t\t\t\t\tif (tilePrice < currentPrice) col += vec3(0.1, 0.03, 0.0);\n\t\t\t\t\tcol = mix(bgColorExpensive, col, priceOpacity);\n\t\t\t\t\tcol = purchasedColor.rgb * purchasedColor.a + col.rgb * (1.0 - purchasedColor.a);\n\t\t\t\t\tcol = allowedBuildingsColor.rgb * allowedBuildingsColor.a + col.rgb * (1.0 - allowedBuildingsColor.a);\n\t\t\t\t\tcol.rgb += highlightColor.rgb;\n\t\t\t\t\tcol = mix(col, gridColor, grid);\n\t\t\t\t\tgl_FragColor = vec4(col, 1.0);\n\t\t\t\t}\n\t\t\t`,
            uniforms: {
                time: {
                    value: 0
                },
                tilesScale: {
                    value: 1
                },
                grids: {
                    value: [ {
                        scale: 1,
                        strokeWidth: 0
                    }, {
                        scale: 2,
                        strokeWidth: 0
                    }, {
                        scale: 4,
                        strokeWidth: 0
                    }, {
                        scale: 8,
                        strokeWidth: 0
                    } ]
                },
                gridsOffset: {
                    value: new P(0, 0)
                },
                tilesTextureSampler: {
                    value: this.tilesTexture
                },
                minPrice: {
                    value: 0
                },
                maxPrice: {
                    value: 0
                },
                minTexturePrice: {
                    value: 0
                },
                maxTexturePrice: {
                    value: 0
                },
                currentPrice: {
                    value: 0
                },
                priceOpacity: {
                    value: 1
                }
            }
        }), this.obj = new ti(this.plane, this.mat);
    }
    loop(t, e) {
        this.mat.uniforms.time.value = t / 1e3;
        const i = Math.pow(2, this.minBuildingPowerArea), n = Math.pow(2, this.maxBuildingPowerArea + 1), r = this.getGridConfigs();
        for (let [t, e] of r.entries()) {
            const r = e.scale >= i && e.scale <= n ? .5 + .7 * t : 0;
            e.strokeWidth = ao(e.strokeWidth, r, .01);
        }
        for (;;) {
            const t = r[0];
            if (t.scale < i && t.strokeWidth < .01) r.shift(), this.gridConfigPowerAreasOffset++, 
            r.push({
                scale: Math.pow(2, this.gridConfigPowerAreasOffset + 3),
                strokeWidth: 0
            }); else {
                if (!(t.scale > i)) break;
                r.pop(), this.gridConfigPowerAreasOffset--, r.unshift({
                    scale: Math.pow(2, this.gridConfigPowerAreasOffset),
                    strokeWidth: 0
                });
            }
        }
        let s = this.mat.uniforms.priceOpacity.value;
        this.tilePricesVisible ? s += 5e-5 * e : s = 0, s = ho(s), this.mat.uniforms.priceOpacity.value = s;
    }
    setGridProperties(t, e, i) {
        this.mat.uniforms.tilesScale.value = t, this.mat.uniforms.gridsOffset.value.copy(e), 
        this.tilePricesVisible = i;
    }
    setMinMaxBuildingPowerArea(t, e) {
        this.minBuildingPowerArea = t, this.maxBuildingPowerArea = e;
    }
    setPriceRange(t, e, i) {
        this.desiredMinPrice = t, this.desiredMaxPrice = e, this.desiredCurrentPrice = i;
        Math.max(this.desiredMaxPrice, this.desiredCurrentPrice) > this.textureMaxPrice && this.updateTiles(), 
        this.updatePriceUniforms();
    }
    updatePriceUniforms() {
        this.mat.uniforms.currentPrice.value = this.desiredCurrentPrice, this.mat.uniforms.minPrice.value = this.desiredMinPrice, 
        this.mat.uniforms.maxPrice.value = this.desiredMaxPrice, this.mat.uniforms.minTexturePrice.value = this.textureMinPrice, 
        this.mat.uniforms.maxTexturePrice.value = this.textureMaxPrice;
    }
    getGridConfigs() {
        return this.mat.uniforms.grids.value;
    }
    getSmallestVisibleGrid() {
        let t = 1 / 0;
        for (const e of this.getGridConfigs()) t = Math.min(t, e.scale);
        return Math.log2(t);
    }
    canSimplifyGrid() {
        for (let t of this.getGridConfigs()) if (1 == t.scale) return !1;
        return !0;
    }
    gridSimplified() {
        this.maxBuildingPowerArea--, this.gridConfigPowerAreasOffset--;
        for (const t of this.getGridConfigs()) t.scale /= 2;
    }
    updateTiles() {
        this.textureMinPrice = this.desiredMinPrice, this.textureMaxPrice = Math.max(this.desiredMaxPrice, this.desiredCurrentPrice);
        const t = this.ctx.createImageData(256, 256);
        for (let e = 1; e < 255; e++) {
            const i = e - 1;
            for (let n = 1; n < 255; n++) {
                const r = 256 - n - 2, s = this.grid.getTile(new P(i, r));
                let a = 0, o = 0;
                s && (a = s.purchased ? 0 : co(s.price, this.textureMinPrice, this.textureMaxPrice, 1, 255), 
                "none" == s.allowedBuildings ? o = 1 : "number" == typeof s.allowedBuildings && (o = s.allowedBuildings + 2)), 
                a = Math.floor(a);
                const l = 256 * n * 4 + 4 * e, h = l + 1, c = l + 2, d = l + 3;
                t.data[l] = a, t.data[h] = o, t.data[c] = this.tileHighlights[i][r], t.data[d] = s ? 255 : 0;
            }
        }
        this.ctx.putImageData(t, 0, 0), this.tilesTexture.needsUpdate = !0, this.updatePriceUniforms();
    }
    addTileHighlightList(t) {
        const e = new Io({
            onChange: () => {
                this.updateTileHighlights();
            },
            onDestruct: () => {
                this.occupiedTileLists.delete(e), this.updateTileHighlights();
            },
            type: t
        });
        return this.occupiedTileLists.add(e), this.updateTileHighlights(), e;
    }
    updateTileHighlights() {
        for (let t = 0; t < 256; t++) {
            const e = this.tileHighlights[t];
            for (let t = 0; t < 256; t++) e[t] = 0;
        }
        for (const t of this.occupiedTileLists) for (const e of t.coords) this.tileHighlights[e.x][e.y] = t.type;
        this.updateTiles();
    }
}

class jo {
    constructor() {
        this.mat = Ya.clone();
        const t = new Si;
        this.obj = new ti(t, this.mat), this.obj.rotation.x = -.5 * Math.PI, this.obj.scale.setScalar(.9), 
        this.obj.name = "pointer highlight", this.obj.renderOrder = 100;
    }
    setData(t) {
        const e = Math.pow(2, t.purchasePowerArea);
        this.obj.position.x = t.gridCoord.x + e / 2, this.obj.position.z = t.gridCoord.y + e / 2, 
        this.obj.scale.setScalar(.9 * e);
        let i = 10055680;
        t.cheapEnough || (i = 6684672), t.alreadyPurchased && (i = 2236962), this.mat.color.set(i);
    }
    gridShifted(t) {
        this.obj.position.x -= t.x, this.obj.position.z -= t.y;
    }
}

class Xo {
    constructor(t, e) {
        this.gameContainer = e, this.game = t, this.tilePointerHighlights = new Map, this.buildingPointerHighlights = new Map, 
        this.cratePointerHighlights = new Map, this.hoveringPointerIdTimes = new Map, this.pointerData = new Map, 
        this.recentlyClickedPointerBuilding = null, this.lastMoveEventForKeyboardDragging = null, 
        this.lastKeyboardDraggingPointerEvent = null, this.lastEventForPanning = null, this.prevEventForPanning = null, 
        this.lastPanningXDir = 0, this.lastPanningYDir = 0, this.draggingBuildings = new Set, 
        this.leftPressed = !1, this.rightPressed = !1, this.upPressed = !1, this.downPressed = !1, 
        window.addEventListener("keydown", this.onKeyDown.bind(this)), window.addEventListener("keyup", this.onKeyUp.bind(this)), 
        e.addEventListener("pointerover", this.onPointerOver.bind(this)), e.addEventListener("pointerdown", this.onPointerDown.bind(this)), 
        e.addEventListener("pointermove", this.onPointerMove.bind(this)), e.addEventListener("pointerup", this.onPointerUp.bind(this)), 
        e.addEventListener("pointerleave", this.onPointerLeave.bind(this)), e.addEventListener("pointercancel", this.onPointerLeave.bind(this)), 
        e.addEventListener("wheel", this.onWheel.bind(this), {
            passive: !1
        });
    }
    pointerEventToScreenSpace(t) {
        const e = t.clientX / this.gameContainer.clientWidth * 2 - 1, i = -t.clientY / this.gameContainer.clientHeight * 2 + 1;
        return new P(e, i);
    }
    pointerEventToPlaneCoord(t, e) {
        return this.game.raycastToPlaneCoord(this.pointerEventToScreenSpace(t), e);
    }
    onKeyDown(t) {
        if (!this.lastMoveEventForKeyboardDragging) return;
        let e = !1;
        if ("Space" == t.code) {
            this.onPointerDown(this.lastMoveEventForKeyboardDragging);
            const i = this.pointerData.get(this.lastMoveEventForKeyboardDragging.pointerId);
            this.lastKeyboardDraggingPointerEvent = this.lastMoveEventForKeyboardDragging, i && (i.triggeredByKeyboard = t.code), 
            this.lastMoveEventForKeyboardDragging = null, e = !0;
        } else if (t.code.startsWith("Digit")) {
            if ("Digit1" == t.code) {
                const t = this.game.dockUi.getCollectSlot();
                t && (t.click(), e = !0);
            }
        } else "KeyQ" == t.code ? (jh().cam.rotateCam(!1), jh().game.cornerButtons.rotateKeyPressed("left"), 
        e = !0) : "KeyE" == t.code ? (jh().cam.rotateCam(!0), jh().game.cornerButtons.rotateKeyPressed("right"), 
        e = !0) : "KeyA" == t.code || "ArrowLeft" == t.code ? (jh().game.cornerButtons.panKeyPressed("left"), 
        this.leftPressed = !0, e = !0) : "KeyD" == t.code || "ArrowRight" == t.code ? (jh().game.cornerButtons.panKeyPressed("right"), 
        this.rightPressed = !0, e = !0) : "KeyW" == t.code || "ArrowUp" == t.code ? (jh().game.cornerButtons.panKeyPressed("up"), 
        this.upPressed = !0, e = !0) : "KeyS" != t.code && "ArrowDown" != t.code || (jh().game.cornerButtons.panKeyPressed("down"), 
        this.downPressed = !0, e = !0);
        e && t.preventDefault();
    }
    onKeyUp(t) {
        if (this.lastKeyboardDraggingPointerEvent) {
            const e = this.pointerData.get(this.lastKeyboardDraggingPointerEvent.pointerId);
            e && e.triggeredByKeyboard == t.code && (this.onPointerUp(this.lastKeyboardDraggingPointerEvent), 
            this.lastMoveEventForKeyboardDragging = this.lastKeyboardDraggingPointerEvent, this.lastKeyboardDraggingPointerEvent = null);
        }
        "KeyA" == t.code || "ArrowLeft" == t.code ? this.leftPressed = !1 : "KeyD" == t.code || "ArrowRight" == t.code ? this.rightPressed = !1 : "KeyW" == t.code || "ArrowUp" == t.code ? this.upPressed = !1 : "KeyS" != t.code && "ArrowDown" != t.code || (this.downPressed = !1);
    }
    setPanPressed(t, e) {
        "left" == t ? this.leftPressed = e : "right" == t ? this.rightPressed = e : "up" == t ? this.upPressed = e : "down" == t && (this.downPressed = e);
    }
    onPointerDown(t) {
        this.removeBuildingHighlights(t.pointerId);
        if (this.pointerData.get(t.pointerId)) return;
        const e = this.raycastPointerDown(t);
        if (e) {
            if (this.recentlyClickedPointerBuilding) {
                if ("grid" == e.type || "building" == e.type) return this.pointerData.set(t.pointerId, this.recentlyClickedPointerBuilding), 
                void (this.recentlyClickedPointerBuilding = null);
                this.cancelRecentlyClickedPointerBuilding();
            }
            if (jh().fireInitialGameplayStart(), this.gameContainer.setPointerCapture(t.pointerId), 
            "dock-building-slot" == e.type) {
                if (!e.slot.available) return;
                const i = e.slot.getBuildingData();
                this.createPurchasingDragBuilding(t, i);
            } else if ("building" == e.type) {
                const {building: i} = e, n = this.pointerEventToPlaneCoord(t, i.centerPhysicalHeight);
                if (n) {
                    const e = this.getBuildingDraggingPos(t, n, i);
                    i.setDraggingPos(e), this.draggingBuildings.add(i), jh().sfx.playSound("building/lift");
                }
                this.game.updateDraggingBuildingHighlights(this.draggingBuildings), this.pointerData.set(t.pointerId, {
                    downTime: performance.now(),
                    draggingBuilding: i,
                    pointerdownScreenPos: [ t.clientX, t.clientY ],
                    prevEvent: t
                });
            } else "crate" == e.type ? e.crate.unbox() : "grid" == e.type && this.pointerData.set(t.pointerId, {
                downTime: performance.now(),
                draggingBuilding: null,
                pointerdownScreenPos: [ t.clientX, t.clientY ],
                prevEvent: t
            });
        }
    }
    createPurchasingDragBuilding(t, e) {
        if (this.pointerData.get(t.pointerId)) throw new Error("Assertion failed, this pointer is already dragging a building.");
        const i = this.game.createDraggingBuilding(e.type, e.powerAreaSimplified, e.height), n = this.pointerEventToPlaneCoord(t, i.centerPhysicalHeight);
        if (this.draggingBuildings.add(i), this.game.updateDraggingBuildingHighlights(this.draggingBuildings), 
        n) {
            const e = this.getBuildingDraggingPos(t, n, i);
            i.setDraggingPos(e);
        }
        this.pointerData.set(t.pointerId, {
            downTime: performance.now(),
            draggingBuilding: i,
            pointerdownScreenPos: [ t.clientX, t.clientY ],
            prevEvent: t,
            isPurchasingBuilding: !0
        });
    }
    onPointerMove(t) {
        const e = this.pointerData.get(t.pointerId);
        if (e) {
            if (e.draggingBuilding) {
                this.lastEventForPanning = t;
                const i = this.pointerEventToPlaneCoord(t, e.draggingBuilding.centerPhysicalHeight);
                if (i) {
                    const n = this.getBuildingDraggingPos(t, i, e.draggingBuilding);
                    e.draggingBuilding.setDraggingPos(n);
                }
            } else {
                const i = this.pointerEventToPlaneCoord(e.prevEvent, 0), n = this.pointerEventToPlaneCoord(t, 0);
                if (i && n) {
                    const t = i.sub(n);
                    t.multiplyScalar(this.game.getGridScale()), jh().cam.panCamera(t);
                }
            }
            e.prevEvent = t, e.triggeredByKeyboard && (this.lastKeyboardDraggingPointerEvent = t);
        } else {
            if (this.recentlyClickedPointerBuilding) return this.pointerData.set(t.pointerId, this.recentlyClickedPointerBuilding), 
            void (this.recentlyClickedPointerBuilding = null);
            this.lastMoveEventForKeyboardDragging = t;
            const e = this.raycastPointerDown(t);
            let i = null, n = null, r = null;
            e && ("grid" == e.type && e.planeCoord && (i = this.getPurchaseLandData(e.planeCoord)), 
            "building" == e.type ? n = e.building : "crate" == e.type && (r = e.crate));
            let s = this.tilePointerHighlights.get(t.pointerId);
            i ? (s || (s = this.game.createTilePointerHighlight(), this.tilePointerHighlights.set(t.pointerId, s)), 
            s.setData(i)) : this.removeTileHighlights(t.pointerId), this.buildingPointerHighlights.get(t.pointerId) != n && (this.removeBuildingHighlights(t.pointerId), 
            n && (n.setPointerHighlightVisible(!0), this.buildingPointerHighlights.set(t.pointerId, n))), 
            this.cratePointerHighlights.get(t.pointerId) != r && (this.removeCrateHighlights(t.pointerId), 
            r && (r.setPointerHighlightVisible(!0), this.cratePointerHighlights.set(t.pointerId, r)));
        }
    }
    onPointerUp(t) {
        this.lastEventForPanning = null, this.removePointerHighlights(t.pointerId);
        const e = this.pointerData.get(t.pointerId);
        if (!e) return;
        this.pointerData.delete(t.pointerId);
        const i = e.draggingBuilding;
        if (i) {
            if (performance.now() - e.downTime < 200 && !this.recentlyClickedPointerBuilding) return void (this.recentlyClickedPointerBuilding = e);
            const n = this.pointerEventToPlaneCoord(t, i.centerPhysicalHeight);
            if (n) {
                this.lastEventForPanning = null;
                const r = this.getBuildingDraggingPos(t, n, i), s = this.game.grid.moveBuilding(i, r.newCoord, {
                    purchasedBuilding: e.isPurchasingBuilding,
                    throwOnFailure: !1
                });
                if (this.cancelDraggingBuilding(i), s) {
                    if (e.isPurchasingBuilding) if (i.isTrophyBuilding) this.game.shop.trophyBuildingsManager.currentBuildingPlaced(), 
                    this.game.tutorialSuggestionsManager.actionOccurred("place-trophy"); else {
                        const {purchaseSuccess: t, price: e} = this.game.shop.purchaseBuilding(i.getBuildingData());
                        if (!t) throw new Error("Assertion failed, expected player to have enough money.");
                        {
                            jh().sfx.playSound("building/purchase"), this.game.tutorialSuggestionsManager.actionOccurred("purchase-building");
                            const t = s.mergedBuilding || i, n = r.newCoord.clone();
                            n.add(this.game.getTileCenterOffset(t.powerArea));
                            const a = new tt(n.x, t.raycastPhysicalHeight, n.y);
                            this.game.createAnimatedPurchase(e, a);
                        }
                    }
                    this.game.draggingBuildingPlaced(), this.game.quadMergeTracker.markGroupsDirty(), 
                    this.game.saveGameState(), this.game.updateCrateDropFrequency();
                }
            }
        } else {
            const i = [ t.clientX, t.clientY ];
            if (Math.abs(i[0] - e.pointerdownScreenPos[0]) < 5 && Math.abs(i[1] - e.pointerdownScreenPos[1]) < 5) {
                const e = this.pointerEventToPlaneCoord(t, 0);
                if (e) {
                    const t = this.getPurchaseLandData(e);
                    if (t && !t.alreadyPurchased) {
                        const {gridCoord: e, tile: i, price: n, purchasePowerArea: r} = t;
                        if (this.game.shop.purchaseItem(i.price)) {
                            jh().sfx.playSound("purchaseLand");
                            const t = i.gridCoord.clone();
                            t.add(this.game.getTileCenterOffset(r));
                            const s = new tt(t.x, 0, t.y);
                            this.game.createAnimatedPurchase(n, s), this.game.grid.purchaseTiles(e, r), this.game.grid.simplifyIfPossible(), 
                            this.game.tutorialManager.updatePhase(), this.game.saveGameState(), this.game.quadMergeTracker.markGroupsDirty();
                        }
                    }
                }
            }
        }
    }
    onPointerOver(t) {
        this.hoveringPointerIdTimes.set(t.pointerId, performance.now());
    }
    onPointerLeave(t) {
        this.hoveringPointerIdTimes.delete(t.pointerId), this.lastEventForPanning = null;
    }
    onWheel(t) {
        t.preventDefault(), jh().cam.offsetZoom(.001 * t.deltaY);
    }
    loop(t, e) {
        this.performScreenEdgePanning(t, e);
        const i = new tt;
        if (this.leftPressed && (i.x = -1), this.rightPressed && (i.x = 1), this.upPressed && (i.z = -1), 
        this.downPressed && (i.z = 1), i.length() > 0) {
            i.applyQuaternion(jh().cam.cam.quaternion);
            const t = new P(i.x, i.z);
            t.setLength(.005 * e), jh().cam.panCamera(t);
        }
    }
    cancelRecentlyClickedPointerBuilding() {
        this.recentlyClickedPointerBuilding && (this.recentlyClickedPointerBuilding.draggingBuilding && this.cancelDraggingBuilding(this.recentlyClickedPointerBuilding.draggingBuilding), 
        this.recentlyClickedPointerBuilding = null);
    }
    cancelDraggingBuilding(t) {
        this.draggingBuildings.delete(t), this.game.updateDraggingBuildingHighlights(this.draggingBuildings), 
        t.cancelDragging(), this.game.grid.removeDraggingBuilding(t);
    }
    getPurchaseLandData(t) {
        if (!this.game.tutorialManager.canPurchaseLand) return null;
        const e = this.game.getPurchaseLandPowerArea(), i = this.game.snapCoordToGrid(t, e), n = this.game.grid.getTile(i);
        if (!n) return null;
        const r = this.game.grid.allTilesPurchased(i, e), s = this.game.shop.canPurchaseItem(n.price);
        return {
            gridCoord: i,
            purchasePowerArea: e,
            tile: n,
            price: n.price,
            cheapEnough: s,
            alreadyPurchased: r
        };
    }
    raycastPointerDown(t) {
        const e = this.game.dockUi.getBuildingSlotFromEl(t.target), i = jh().renderer.canvas;
        if (t.target != this.gameContainer && t.target != i && !e) return null;
        if (this.pointerData.get(t.pointerId)) return null;
        if (this.gameContainer.setPointerCapture(t.pointerId), e) return {
            type: "dock-building-slot",
            slot: e
        };
        {
            const e = this.pointerEventToScreenSpace(t), i = this.game.raycastObjects(e);
            if (i) return i;
            return {
                type: "grid",
                planeCoord: this.pointerEventToPlaneCoord(t, 0)
            };
        }
    }
    removeTileHighlights(t) {
        const e = this.tilePointerHighlights.get(t);
        e && this.game.removeTilePointerHighlight(e), this.tilePointerHighlights.delete(t);
    }
    removeBuildingHighlights(t) {
        const e = this.buildingPointerHighlights.get(t);
        e && e.setPointerHighlightVisible(!1), this.buildingPointerHighlights.delete(t);
    }
    removeCrateHighlights(t) {
        const e = this.cratePointerHighlights.get(t);
        e && e.setPointerHighlightVisible(!1), this.cratePointerHighlights.delete(t);
    }
    removePointerHighlights(t) {
        this.removeTileHighlights(t), this.removeBuildingHighlights(t), this.removeCrateHighlights(t);
    }
    performScreenEdgePanning(t, e) {
        const i = this.lastEventForPanning, n = this.prevEventForPanning;
        if (this.prevEventForPanning = i, !i || !n) return;
        if (this.game.dockUi.getBuildingSlotFromEl(i.target)) return;
        const r = this.gameContainer.clientWidth, s = this.gameContainer.clientHeight, a = .15 * Math.min(r, s);
        if (i.clientX > a && i.clientX < r - a && i.clientY > a && i.clientY < s - a) return;
        i.clientX < n.clientX && (this.lastPanningXDir = -1), i.clientX > n.clientX && (this.lastPanningXDir = 1), 
        i.clientY < n.clientY && (this.lastPanningYDir = -1), i.clientY > n.clientY && (this.lastPanningYDir = 1);
        const o = [ {
            moveTowardsEdge: this.lastPanningXDir < 0,
            dist: i.clientX,
            panDir: new P(-1, 0)
        }, {
            moveTowardsEdge: this.lastPanningXDir > 0,
            dist: r - i.clientX,
            panDir: new P(1, 0)
        }, {
            moveTowardsEdge: this.lastPanningYDir < 0,
            dist: i.clientY,
            panDir: new P(0, -1)
        }, {
            moveTowardsEdge: this.lastPanningYDir > 0,
            dist: s - i.clientY,
            panDir: new P(0, 1)
        } ];
        let l = null;
        for (const t of o) (!l || t.dist < l.dist) && (l = t);
        if (l && l.moveTowardsEdge) {
            const t = l.panDir, i = 1 - l.dist / a;
            t.multiplyScalar(.005 * e * i), jh().cam.panCameraRelative(l.panDir);
        }
    }
    onGridShifted(t) {
        for (const e of this.buildingPointerHighlights.values()) e.shiftPointerHighlightObjects(t);
        for (const e of this.draggingBuildings) e.shiftDraggingPos(t);
    }
    onGridSimplified() {
        for (const t of this.draggingBuildings) t.simplifyDraggingPos();
    }
    getBuildingDraggingPos(t, e, i) {
        const n = this.game.getTileCenterOffset(i.powerArea), r = e.clone();
        r.sub(n);
        const s = this.pointerEventToScreenSpace(t), a = this.game.raycastObjects(s);
        if (a && "building" == a.type) {
            const t = a.building;
            if (t.gridCoord && this.game.grid.canMergeBuildings(t, i)) return {
                type: "merge",
                newCoord: t.gridCoord.clone()
            };
        }
        let o = null, l = null;
        const h = Math.pow(2, i.powerArea);
        for (let t = -1; t <= 1; t++) for (let n = -1; n <= 1; n++) {
            const s = e.clone();
            s.x += t * h, s.y += n * h;
            const a = this.game.snapCoordToGrid(s, i.powerArea), c = this.game.grid.getPlaceableBuildingCoord(i, a), d = a.clone().sub(r), u = Math.max(Math.abs(d.x), Math.abs(d.y));
            u > .9 * h || ((!o || u < o.dist) && (o = {
                dist: u,
                result: c
            }), "none" != c.type && u < h && (!l || u < l.dist) && (l = {
                dist: u,
                result: c
            }));
        }
        if (l) return l.result;
        if (!o) throw new Error("Assertion failed, no closestResult");
        return {
            newCoord: r,
            occupiedCoords: o.result.occupiedCoords,
            type: "none"
        };
    }
    isDraggingBuilding() {
        return this.draggingBuildings.size > 0;
    }
}

class qo extends mo {
    constructor(t) {
        super(), this.el.classList.add("building-unlocked-dialog");
        const e = document.createElement("h1");
        e.textContent = "New Building Unlocked", this.el.appendChild(e);
        const i = new io;
        i.setBuildingData(t), this.el.appendChild(i.el);
        const n = document.createElement("div");
        n.classList.add("buttons-container"), this.el.appendChild(n);
        const r = document.createElement("button");
        r.classList.add("yellow"), r.textContent = "Ok", n.appendChild(r), r.focus(), r.addEventListener("click", (() => {
            this.close();
        }));
    }
}

class Ko extends mo {
    constructor(t) {
        super(), this.el.classList.add("building-unlocked-dialog");
        const e = document.createElement("h1");
        e.textContent = "Not Enough Money", this.el.appendChild(e);
        const i = new io;
        i.setBuildingData(t), this.el.appendChild(i.el);
        const n = document.createElement("div");
        n.classList.add("buttons-container"), this.el.appendChild(n);
        const r = document.createElement("button");
        r.classList.add("blue", "button-with-icon");
        const s = new Image;
        s.src = "./static/svg/rewardButton.svg", s.classList.add("button-icon"), r.appendChild(s), 
        r.appendChild(document.createTextNode("Get Free Building")), n.appendChild(r), r.focus(), 
        r.addEventListener("click", (async () => {
            this.close();
            (await jh().adLad.showRewardedAd()).didShowAd && jh().game.shop.addFreeBuilding(t);
        }));
    }
}

class Yo {
    constructor(t) {
        this.buildingData = t, this.available = !1, this.bigEnough = !1, this._unlocked = !1, 
        this.el = document.createElement("div"), this.el.classList.add("building-slot"), 
        this.el.addEventListener("pointerdown", (t => {
            this.available && (jh().game.inputManager.createPurchasingDragBuilding(t, this.buildingData), 
            this.onCloseRequestedCbs.forEach((t => t())));
        })), this.el.addEventListener("touchstart", (t => {
            this.available && t.preventDefault();
        }), {
            capture: !0,
            passive: !1
        }), this.el.addEventListener("click", (() => {
            !this.available && this.bigEnough && this._unlocked && jh().dialogManager.showDialog(Ko, t);
        })), this.buildingImage = new io({
            grabbable: !0
        }), this.el.appendChild(this.buildingImage.el), this.buildingImage.setBuildingData(this.buildingData), 
        this.onCloseRequestedCbs = new Set, this.priceEl = document.createElement("div"), 
        this.priceEl.classList.add("price"), this.el.appendChild(this.priceEl), this.onFreeCountChanged = e => {
            e.type == t.type && e.powerAreaSimplified == t.powerAreaSimplified && e.height == t.height && this.updateState();
        }, jh().game.shop.onFreeBuildingCountChanged(this.onFreeCountChanged), this.updateState();
    }
    destructor() {
        jh().game.shop.removeOnFreeBuildingCountChanged(this.onFreeCountChanged);
    }
    get unlocked() {
        return this._unlocked;
    }
    get powerAreaSimplified() {
        return this.buildingData.powerAreaSimplified;
    }
    get height() {
        return this.buildingData.height;
    }
    updateState() {
        const {available: t, unlocked: e, bigEnough: i, price: n, freePurchaseCount: r} = jh().game.shop.getBuildingState(this.buildingData);
        this.el.classList.toggle("available", t), this.el.classList.toggle("unavailable", !t && e), 
        this.el.classList.toggle("locked", !e), this.el.classList.toggle("reward-purchaseable", i && e && !t);
        const s = r > 0;
        this.el.classList.toggle("has-free-purchase", r > 0), s ? this.freePurchaseLabel || (this.freePurchaseLabel = document.createElement("div"), 
        this.freePurchaseLabel.classList.add("free-purchase"), this.freePurchaseLabel.textContent = 1 == r ? "Free" : r + "x Free", 
        this.el.appendChild(this.freePurchaseLabel)) : this.freePurchaseLabel && this.freePurchaseLabel.remove(), 
        this.available = t, this.bigEnough = i, this._unlocked = e, this.priceEl.textContent = "$" + go(n), 
        this.buildingImage.setState({
            available: t,
            unlocked: e
        });
    }
    onCloseRequested(t) {
        this.onCloseRequestedCbs.add(t);
    }
}

class Zo {
    constructor(t) {
        this._type = t, this.el = document.createElement("div");
        const e = to[t];
        this.el.classList.add("shelf-container", e.cssClass);
        const i = document.createElement("div");
        i.classList.add("shelf"), this.el.appendChild(i), this.buildingsContainer = document.createElement("div"), 
        this.buildingsContainer.classList.add("buildings-container"), this.buildingsContainer.addEventListener("scroll", (() => {
            this.updateFadeClasses();
        })), this.el.appendChild(this.buildingsContainer), this._slots = [];
        for (let e = 1; e <= 10; e++) for (let i = 1; i <= 2; i++) {
            const n = new Yo({
                type: t,
                powerAreaSimplified: e,
                height: i
            });
            this.buildingsContainer.appendChild(n.el), n.onCloseRequested((() => {
                this.onCloseRequestedCbs.forEach((t => t()));
            })), this._slots.push(n);
        }
        this.onCloseRequestedCbs = new Set;
    }
    destructor() {
        for (const t of this._slots) t.destructor();
    }
    get type() {
        return this._type;
    }
    init() {
        const t = this._slots.findLast((t => t.unlocked));
        if (t) {
            const e = this.buildingsContainer.getBoundingClientRect(), i = t.el.getBoundingClientRect(), n = 50, r = i.left - e.left - this.buildingsContainer.clientWidth + i.width + n;
            this.buildingsContainer.scrollTo({
                left: r,
                behavior: "instant"
            });
        }
    }
    updateFadeClasses() {
        this.buildingsContainer.classList.toggle("fade-left", this.buildingsContainer.scrollLeft > 10);
        const t = this.buildingsContainer.scrollWidth - (this.buildingsContainer.clientWidth + this.buildingsContainer.scrollLeft);
        this.buildingsContainer.classList.toggle("fade-right", t > 10);
    }
    onCloseRequested(t) {
        this.onCloseRequestedCbs.add(t);
    }
    * slots() {
        yield* this._slots;
    }
}

class Jo extends mo {
    constructor() {
        super({
            mobileBottomSheet: !0,
            reopenAfterAd: !0
        });
        const t = document.createElement("h1");
        t.textContent = "Shop", this.el.appendChild(t);
        const e = document.createElement("div");
        e.classList.add("shelfs"), this.el.appendChild(e), this.shelfs = [];
        const i = Array.from(jh().game.shop.availableBuildingTypes());
        i.reverse();
        for (const t of i) {
            const i = new Zo(t);
            e.appendChild(i.el), i.updateFadeClasses(), i.onCloseRequested((() => {
                this.close({
                    allowRewardedAd: !1
                });
            })), i.init(), this.shelfs.push(i);
        }
        this.onClose((() => {
            for (const t of this.shelfs) t.destructor();
        }));
    }
    getSlot(t) {
        for (const e of this.shelfs) if (e.type == t.type) for (const i of e.slots()) if (i.height == t.height && i.powerAreaSimplified == t.powerAreaSimplified) return {
            slot: i,
            shelf: e
        };
        return null;
    }
}

class Qo {
    constructor(t) {
        this.shopManager = t, this._currentPowerArea = 2, this._currentPowerAreaAvailable = !1, 
        this._powerAreaAvailableProgress = 0, this.onNextPowerAreaChangeCbs = new Set, this.onAvailableChangeCbs = new Set, 
        this.onAvailableProgressChangeCbs = new Set;
    }
    init() {
        this.shopManager.onIncrementRateChange((() => {
            this.updateNextPowerAreaAvailable();
        }));
    }
    get currentPowerArea() {
        return this._currentPowerArea;
    }
    get currentPowerAreaAvailable() {
        return this._currentPowerAreaAvailable;
    }
    get powerAreaAvailableProgress() {
        return this._powerAreaAvailableProgress;
    }
    onNextPowerAreaChange(t) {
        this.onNextPowerAreaChangeCbs.add(t);
    }
    currentBuildingPlaced() {
        let t = this._currentPowerArea + 1;
        t = Math.min(t, 10), t != this._currentPowerArea && (this._currentPowerArea = t, 
        this.onNextPowerAreaChangeCbs.forEach((t => t())), this.updateNextPowerAreaAvailable());
    }
    onAvailableChange(t) {
        this.onAvailableChangeCbs.add(t);
    }
    onAvailableProgressChange(t) {
        this.onAvailableProgressChangeCbs.add(t);
    }
    getRequiredIncrementRate(t) {
        return .8 * this.shopManager.getBuildingValue(t, 1);
    }
    powerAreaAvailable(t) {
        return this.shopManager.incrementRate > this.getRequiredIncrementRate(t);
    }
    updateNextPowerAreaAvailable() {
        let t = this._currentPowerArea;
        for (;;) {
            const e = t + 1;
            if (!this.powerAreaAvailable(e)) break;
            t = e;
        }
        t = Math.min(t, 10), t != this._currentPowerArea && (this._currentPowerArea = t, 
        this.onNextPowerAreaChangeCbs.forEach((t => t())));
        let e = this.powerAreaAvailable(this._currentPowerArea);
        this._currentPowerAreaAvailable != e && (this._currentPowerAreaAvailable = e, this.onAvailableChangeCbs.forEach((t => t(e))));
        const i = e ? 1 : 0, n = oo(this.getRequiredIncrementRate(this._currentPowerArea + i - 1), this.getRequiredIncrementRate(this._currentPowerArea + i), this.shopManager.incrementRate);
        n != this._powerAreaAvailableProgress && (this._powerAreaAvailableProgress = n, 
        this.onAvailableProgressChangeCbs.forEach((t => t(n))));
    }
}

function $o(t, e) {
    return 2 * t + (e - 1);
}

function tl(t) {
    return {
        powerArea: Math.floor(t / 2),
        height: 1 + so(t, 2)
    };
}

class el {
    constructor(t, e) {
        this.game = t, this._coins = 500, this._collectableCoins = 0, this._incrementRate = 0, 
        this.trophyBuildingsManager = new Qo(this), this.lastCoinIncrementTime = 0, this._availableBuildingTypes = [], 
        this.lastBigAndAvailableUpdateTime = 0, this.lastBigAndAvailableBuildingData = null, 
        this.onBigAndAvailableBuildingChangeCbs = new Set, this.currentBuildingFractions = [], 
        this.maxBuildingSizes = [], this.buildingPriceMultipliersDirty = !1, this.buildingPriceMultipliers = [], 
        this._shopDialog = null, this.onCoinsChangeCbs = new Set, this.onItemPurchasedCbs = new Set, 
        this.onCollectableCoinsChangeCbs = new Set, this.onIncrementRateChangeCbs = new Set, 
        this.onFreeBuildingCountChangedCbs = new Set, this.onMaxBuildingSizesChangeCbs = new Set, 
        this.freeBuildingCounts = new Map, this.trophyBuildingsManager.init();
    }
    get incrementRate() {
        return this._incrementRate;
    }
    get coins() {
        return this._coins;
    }
    get collectableCoins() {
        return this._collectableCoins;
    }
    get potentialCoinsAfterCollection() {
        return this._coins + this._collectableCoins;
    }
    setAvailableBuildingTypes(t) {
        this._availableBuildingTypes = [ ...t ];
    }
    * availableBuildingTypes() {
        yield* this._availableBuildingTypes;
    }
    get availableBuildingTypeCount() {
        return this._availableBuildingTypes.length;
    }
    canPurchaseItem(t) {
        return this.coins >= t;
    }
    purchaseItem(t) {
        return !!this.canPurchaseItem(t) && (this._coins -= t, this.onCoinsChangeCbs.forEach((t => t())), 
        this.onItemPurchasedCbs.forEach((t => t())), !0);
    }
    setCoinCount(t) {
        this._coins = t, this.onCoinsChangeCbs.forEach((t => t()));
    }
    setIncrementRate(t) {
        this._incrementRate = t, this.onIncrementRateChangeCbs.forEach((t => t()));
    }
    collectCoins(t = 1) {
        const e = this._collectableCoins * t;
        return this._coins += e, this._collectableCoins = 0, this.onCollectableCoinsChangeCbs.forEach((t => t())), 
        this.onCoinsChangeCbs.forEach((t => t())), e;
    }
    getBuildingState(t) {
        let e = !0, i = !0, n = !0;
        t.powerAreaSimplified < jh().game.grid.simplifyCount && (i = !1, e = !1);
        const r = this.getFreeBuildingCount(t), s = this.getBuildingPrice(t);
        return 0 == r && s > this.coins && (i = !1), this.buildingIsUnlocked(t) || (i = !1, 
        n = !1), {
            available: i,
            bigEnough: e,
            unlocked: n,
            price: s,
            freePurchaseCount: r
        };
    }
    getMaxBuildingData(t) {
        let e = t ? -1 / 0 : 1 / 0, i = null;
        for (const n of this._availableBuildingTypes) {
            const r = this.maxBuildingSizes[n];
            if (t && r > e || !t && r < e) {
                e = r;
                const t = tl(r);
                i = {
                    type: n,
                    height: t.height,
                    powerAreaSimplified: t.powerArea
                };
            }
        }
        return i;
    }
    _getBigAndAvailableBuildingData() {
        const t = Math.max(...this.maxBuildingSizes);
        for (let e = 0; e < 3; e++) {
            const i = t - e, {height: n, powerArea: r} = tl(i);
            let s = null;
            for (const t of this._availableBuildingTypes) {
                const e = this.getBuildingState({
                    type: t,
                    powerAreaSimplified: r,
                    height: n
                });
                e.available && (!s || e.price < s.price) && (s = {
                    type: t,
                    price: e.price
                });
            }
            if (s) return {
                type: s.type,
                height: n,
                powerAreaSimplified: r
            };
        }
        return null;
    }
    updateBigAndAvailableBuildingData() {
        const t = this._getBigAndAvailableBuildingData(), e = this.lastBigAndAvailableBuildingData;
        let i = !1;
        (Boolean(t) != Boolean(this.lastBigAndAvailableBuildingData) || t && e && (t.type != e.type || t.powerAreaSimplified != e.powerAreaSimplified || t.height != e.height)) && (i = !0), 
        i && (this.lastBigAndAvailableBuildingData = t, this.onBigAndAvailableBuildingChangeCbs.forEach((e => e(t)))), 
        this.lastBigAndAvailableUpdateTime = jh().now;
    }
    onBigAndAvailableBuildingChange(t) {
        this.onBigAndAvailableBuildingChangeCbs.add(t);
    }
    getBigAndAvailableBuildingData() {
        return this.updateBigAndAvailableBuildingData(), this.lastBigAndAvailableBuildingData;
    }
    getAvailableBuildingStatsAfterCollect() {
        const t = this.coins + this.collectableCoins;
        let e = 0, i = 0;
        for (const n of this._availableBuildingTypes) {
            const r = this.maxBuildingSizes[n];
            for (let s = 0; s <= r; s++) {
                const r = tl(s), a = this.getBuildingState({
                    type: n,
                    powerAreaSimplified: r.powerArea,
                    height: r.height
                });
                a.bigEnough && (i++, !a.available && a.price < t && e++);
            }
        }
        return {
            gainedBuildingCount: e,
            bigEnoughCount: i
        };
    }
    getCollectCoinsButtonNeeded() {
        let t = 0, e = 0;
        for (const i of this.game.grid.allTiles()) e++, !i.purchased && i.price < this.coins && t++;
        const {gainedBuildingCount: i} = this.getAvailableBuildingStatsAfterCollect();
        return e > 10 && t < 100 || i >= 1;
    }
    loop(t, e) {
        t > this.lastCoinIncrementTime + 1e3 && (this.lastCoinIncrementTime = t, this._collectableCoins += this._incrementRate, 
        this.onCollectableCoinsChangeCbs.forEach((t => t()))), t > this.lastBigAndAvailableUpdateTime + 1e3 && this.updateBigAndAvailableBuildingData();
    }
    openShopDialog() {
        this._shopDialog || (this._shopDialog = jh().dialogManager.showDialog(Jo), this._shopDialog.onClose((() => {
            this._shopDialog = null;
        })));
    }
    get shopDialog() {
        return this._shopDialog;
    }
    onCoinsChange(t) {
        this.onCoinsChangeCbs.add(t);
    }
    onItemPurchased(t) {
        this.onItemPurchasedCbs.add(t);
    }
    onCollectableCoinsChange(t) {
        this.onCollectableCoinsChangeCbs.add(t);
    }
    removeOnCollectableCoinsChange(t) {
        this.onCollectableCoinsChangeCbs.delete(t);
    }
    onIncrementRateChange(t) {
        this.onIncrementRateChangeCbs.add(t);
    }
    getBuildingValue(t, e, i = !0) {
        let n = Math.pow(2, 2 * (e - 1)) * Math.pow(2, 4 * t);
        return i && (n = Math.pow(n, .4)), n;
    }
    updatePlacedBuildings(t, e) {
        this.currentBuildingFractions = [ ...t ], this.buildingPriceMultipliersDirty = !0;
        let i = !1;
        this.maxBuildingSizes.length != e.length && (i = !0);
        let n = null;
        for (let t = 0; t < e.length; t++) if (e[t] != this.maxBuildingSizes[t] && (i = !0, 
        this.game.tutorialManager.tutorialEnded && this._availableBuildingTypes.includes(t))) {
            const {powerArea: i} = tl(this.maxBuildingSizes[t]), {powerArea: r} = tl(e[t]);
            r > i && (!n || r > n.powerArea) && (n = {
                type: t,
                powerArea: r
            });
        }
        i && (n && jh().dialogManager.showDialog(qo, {
            type: n.type,
            height: 1,
            powerAreaSimplified: n.powerArea
        }), this.maxBuildingSizes = [ ...e ], this.onMaxBuildingSizesChangeCbs.forEach((t => t())));
    }
    onMaxBuildingSizesChange(t) {
        this.onMaxBuildingSizesChangeCbs.add(t);
    }
    updateBuildingPriceMultipliers() {
        if (!this.buildingPriceMultipliersDirty) return;
        this.buildingPriceMultipliers = [];
        let t = 1 / 0, e = -1;
        for (const [i, n] of this.currentBuildingFractions.entries()) i >= this._availableBuildingTypes.length || n < t && (t = n, 
        e = i);
        for (const i of this._availableBuildingTypes) {
            const n = lo(this.currentBuildingFractions[i], .2, .99), r = 40, s = 10, a = this.availableBuildingTypeCount;
            let o, l;
            l = r / (1 - (n - 1 / a) / (1 - 1 / a)), l = (l - r) * s + r, l = Math.max(2, l);
            let h = 0;
            e != i && (h = 1 / t - a), o = Math.max(l, h), this.buildingPriceMultipliers.push(o);
        }
        this.buildingPriceMultipliersDirty = !1;
    }
    getBuildingPrice(t) {
        this.updateBuildingPriceMultipliers();
        let e = this.buildingPriceMultipliers[t.type] * this.incrementRate;
        const i = this.maxBuildingSizes[t.type], {powerArea: n, height: r} = tl(i), s = this.getBuildingValue(n, r);
        return e *= this.getBuildingValue(t.powerAreaSimplified, t.height) / s, e;
    }
    buildingIsUnlocked(t) {
        return $o(t.powerAreaSimplified, t.height) <= this.maxBuildingSizes[t.type];
    }
    addFreeBuilding(t) {
        this.offsetFreeBuildingCount(t, 1), this.game.saveGameState();
    }
    offsetFreeBuildingCount(t, e) {
        let i = this.freeBuildingCounts.get(t.type);
        i || (i = new Map, this.freeBuildingCounts.set(t.type, i));
        let n = i.get(t.powerAreaSimplified);
        n || (n = new Map, i.set(t.powerAreaSimplified, n));
        let r = n.get(t.height) || 0;
        r += e, n.set(t.height, r), this.onFreeBuildingCountChangedCbs.forEach((e => e(t)));
    }
    getFreeBuildingCount(t) {
        const e = this.freeBuildingCounts.get(t.type);
        if (!e) return 0;
        const i = e.get(t.powerAreaSimplified);
        return i && i.get(t.height) || 0;
    }
    getFreeBuildingCountsSaveGameData() {
        const t = [];
        for (const [e, i] of this.freeBuildingCounts) for (const [n, r] of i) for (const [i, s] of r) t.push({
            buildingData: {
                type: e,
                powerAreaSimplified: n,
                height: i
            },
            count: s
        });
        return t;
    }
    loadFreeBuildingCounts(t) {
        for (const e of t) this.offsetFreeBuildingCount(e.buildingData, e.count);
    }
    purchaseBuilding(t) {
        if (this.getFreeBuildingCount(t) > 0) return this.offsetFreeBuildingCount(t, -1), 
        {
            purchaseSuccess: !0,
            price: 0
        };
        {
            const e = this.getBuildingPrice(t);
            return {
                purchaseSuccess: this.game.shop.purchaseItem(e),
                price: e
            };
        }
    }
    onFreeBuildingCountChanged(t) {
        this.onFreeBuildingCountChangedCbs.add(t);
    }
    removeOnFreeBuildingCountChanged(t) {
        this.onFreeBuildingCountChangedCbs.delete(t);
    }
}

class il {
    constructor() {
        this.el = document.createElement("div"), this.el.classList.add("animated-hand"), 
        this.startPos = new P, this.endPos = new P, this.type = "drag";
        const t = [ "hand", "handClick", "handClicking" ];
        this.handImageEls = [];
        for (const e of t) {
            const t = document.createElement("div");
            t.classList.add("hand-image"), t.style.backgroundImage = `url(./static/svg/${e}.svg)`, 
            t.style.opacity = "0", this.handImageEls.push(t), this.el.appendChild(t);
        }
        this.t = 0, this.imageState = -1, this.currentImageEl = null, this.rotPhysics = new Fo;
    }
    updatePositions(t) {
        this.startPos = t.startPos.clone(), this.endPos = t.endPos.clone(), this.type = t.type || "drag";
        const e = t.parentEl || jh().gameContainer;
        this.el.parentElement != e && e.appendChild(this.el), this.el.style.position = t.parentEl ? "fixed" : "";
    }
    destructor() {
        this.el.remove();
    }
    loop(t, e) {
        const i = "drag" == this.type, n = i ? 600 : 200, r = n + 100, s = r + 100, a = s + (i ? 1e3 : 200), o = a + (i ? 500 : 100), l = o + (i ? 1e3 : 200);
        this.t += e;
        let h = 0, c = 0, d = new P, u = 0;
        if (this.t < n) h = 0, d.copy(this.screenOrGridPosToScreen(this.startPos)); else if (this.t < r) h = 1, 
        c = 1, d.copy(this.screenOrGridPosToScreen(this.startPos)), u = -10; else if (this.t < s) h = 2, 
        c = 2, d.copy(this.screenOrGridPosToScreen(this.startPos)), u = -10; else if (this.t < a) {
            h = 2, c = 3;
            const t = this.screenOrGridPosToScreen(this.startPos), e = this.screenOrGridPosToScreen(this.endPos);
            let i = oo(s, a, this.t);
            i = Ro(i), d.lerpVectors(t, e, i), u = -10;
        } else if (this.t < o) h = 0, c = 4, d.copy(this.screenOrGridPosToScreen(this.endPos)); else {
            c = 5;
            const t = this.screenOrGridPosToScreen(this.startPos), e = this.screenOrGridPosToScreen(this.endPos);
            let i = oo(o, l, this.t);
            i = Ro(i), d.lerpVectors(e, t, i), "drag" == this.type ? (u = 1 - Math.abs(2 * i - 1), 
            u *= 14) : u = 0, this.t > l && (this.t = 0);
        }
        if (h != this.imageState) for (const [t, e] of this.handImageEls.entries()) e.style.opacity = t == h ? "1" : "0";
        return this.rotPhysics.target = u, this.rotPhysics.loop(t, e), this.el.style.transform = `translate(${d.x}px, ${d.y}px) translate(-30px, -30px) rotate(${this.rotPhysics.value}deg)`, 
        {
            t: this.t,
            image: h,
            phase: c
        };
    }
    screenOrGridPosToScreen(t) {
        if (t instanceof P) return t;
        {
            const e = jh(), i = t.clone();
            i.multiplyScalar(e.game.getGridScale());
            const n = e.cam.worldToScreenPos(i), r = n.x * e.gameContainer.clientWidth, s = n.y * e.gameContainer.clientHeight;
            return new P(r, s);
        }
    }
    onGridShifted(t) {
        this.startPos instanceof tt && (this.startPos.x -= t.x, this.startPos.z -= t.y), 
        this.endPos instanceof tt && (this.endPos.x -= t.x, this.endPos.z -= t.y);
    }
}

class nl {
    constructor(t) {
        this.game = t, this.lastOccurTime = 0, this.occurCount = 0, this.minShowDuration = 5e3, 
        this.maxShowDuration = 3e4;
    }
    ocurred() {
        this.occurCount++, this.lastOccurTime = performance.now();
    }
    setShowDuration(t, e) {
        this.minShowDuration = t, this.maxShowDuration = e;
    }
    didOccurRecently() {
        const t = co(this.occurCount, 1, 5, this.minShowDuration, this.maxShowDuration);
        return performance.now() - this.lastOccurTime < t;
    }
    getAnimatedHandData() {
        throw new Error("Not implemented");
    }
    onVisibilityChange(t) {}
    loop(t) {}
}

class rl extends nl {
    constructor(...t) {
        super(...t), this.setShowDuration(5e3, 1e5);
    }
    getAnimatedHandData() {
        const t = this.game.dockUi.getCollectSlot();
        if (!t) return null;
        const {bigEnoughCount: e, gainedBuildingCount: i} = this.game.shop.getAvailableBuildingStatsAfterCollect();
        if (i <= 0) return null;
        if (i < e / 2) return null;
        const n = uo(t.el);
        return {
            startPos: n,
            endPos: n,
            type: "click"
        };
    }
}

class sl extends nl {
    constructor(...t) {
        super(...t), this.setShowDuration(5e3, 1e5);
    }
    getAnimatedHandData() {
        const t = new Map;
        for (const e of this.game.grid.allBuildings()) {
            if (e.isMaxHeight()) continue;
            const i = e.powerAreaSimplified + "_" + e.height + "_" + e.type;
            let n = t.get(i);
            if (n || (n = new Set, t.set(i, n)), !e.gridCoord) continue;
            const r = jh().cam.getRelativeCoordDist(e.gridCoord);
            n.add({
                building: e,
                cameraDistance: r
            });
        }
        let e = null;
        for (const i of t.values()) {
            const t = Array.from(i);
            if (t.length < 2) continue;
            t.sort(((t, e) => t.cameraDistance - e.cameraDistance));
            const n = t[0], r = t[1];
            if (e) {
                const t = e[0].cameraDistance + e[1].cameraDistance;
                n.cameraDistance + r.cameraDistance < t && (e = [ n, r ]);
            } else e = [ n, r ];
        }
        if (!e) return null;
        const i = e[0].building, n = e[1].building;
        if (!i.gridCoord || !n.gridCoord) return null;
        return {
            startPos: new tt(i.gridCoord.x + .5, 0, i.gridCoord.y + .5),
            endPos: new tt(n.gridCoord.x + .5, 0, n.gridCoord.y + .5)
        };
    }
}

class al extends nl {
    constructor(...t) {
        super(...t), this.currentBuildingEndPos = null, this.setShowDuration(5e3, 2e4);
    }
    generateHandData(t = !1) {
        const e = this.game.shop.getBigAndAvailableBuildingData();
        if (!e) return null;
        const i = this.game.shop.shopDialog;
        if (i) {
            const n = i.getSlot(e);
            if (n) {
                const e = uo(n.slot.el), r = n.shelf.el.getBoundingClientRect();
                if (e.x < r.left + 30) return null;
                if (e.x > r.right - 30) return null;
                const s = i.el.getBoundingClientRect();
                if (t || !this.currentBuildingEndPos) if (s.top > s.left) {
                    const t = s.top / 2;
                    this.currentBuildingEndPos = new P(e.x, t);
                } else {
                    const t = (s.right + window.innerWidth) / 2;
                    this.currentBuildingEndPos = new P(t, e.y);
                }
                return {
                    type: "drag",
                    startPos: e,
                    endPos: this.currentBuildingEndPos,
                    parentEl: i.el
                };
            }
        }
        const n = this.game.dockUi.getShopSlot();
        if (n) {
            const t = uo(n.el);
            return {
                startPos: t,
                endPos: t,
                type: "click"
            };
        }
        return null;
    }
    getAnimatedHandData() {
        return this.generateHandData();
    }
    loop(t) {
        let e = !1;
        t.handState && t.handState.phase < 2 && (e = !0), t.setAnimatedHandData(this.generateHandData(e));
    }
}

class ol extends nl {
    constructor(...t) {
        super(...t), this.setShowDuration(3e4, 2e5);
    }
    getAnimatedHandData() {
        const t = this.game.dockUi.getTrophyBuildingSlot();
        if (!t) return null;
        if (!t.available) return null;
        const e = uo(t.el), i = e.clone();
        return i.y = window.innerHeight / 2, {
            startPos: e,
            endPos: i
        };
    }
}

class ll extends nl {
    constructor(...t) {
        super(...t), this.highlight = null, this.suggestionVisilbe = !1, this.lastHighlightData = null, 
        this.setShowDuration(5e3, 6e4);
    }
    getAnimatedHandData() {
        if (this.game.tutorialManager.isForcingQuadMerge && Array.from(this.game.grid.allCrates()).length > 0) return null;
        let t = null, e = null, i = 1 / 0;
        for (const n of this.game.quadMergeTracker.getGroups()) for (const r of n.missingBuildingCoords) {
            const s = jh().cam.getRelativeCoordDist(r);
            (!t || s < i) && (t = r, i = s, e = n);
        }
        if (!t || !e) return null;
        const n = e, r = Math.pow(2, e.powerArea - 1), s = new tt(t.x + r, 0, t.y + r);
        this.lastHighlightData = {
            gridCoord: e.corner.clone(),
            powerArea: e.powerArea + 1,
            buildingType: e.type
        }, this.updateHighlight();
        const a = t => {
            let e = null;
            i = 1 / 0;
            for (const r of this.game.grid.allBuildings()) {
                if (!r.gridCoord) continue;
                if (r.type != n.type) continue;
                if (2 != r.height) continue;
                if (r.powerArea != n.powerArea) continue;
                if (!t(r)) continue;
                if (n.buildings.includes(r)) continue;
                const s = jh().cam.getRelativeCoordDist(r.gridCoord);
                (e || s < i) && (e = r, i = s);
            }
            return e;
        };
        let o = a((t => !this.game.quadMergeTracker.buildingIsPartOfGroup(t)));
        if (o || (o = a((t => !this.game.quadMergeTracker.buildingIsPartOfGroup(t, {
            checkTwoBuildingGroups: !1
        })))), o || (o = a((() => !0))), !o || !o.gridCoord) return null;
        return {
            startPos: new tt(o.gridCoord.x + r, 0, o.gridCoord.y + r),
            endPos: s
        };
    }
    onVisibilityChange(t) {
        this.suggestionVisilbe = t, this.updateHighlight();
    }
    updateHighlight() {
        this.suggestionVisilbe ? (this.highlight || (this.highlight = this.game.createQuadMergeHighlight()), 
        this.lastHighlightData && this.highlight.setData(this.lastHighlightData)) : this.highlight && (this.game.removeQuadMergeHighlight(this.highlight), 
        this.highlight = null);
    }
}

class hl extends nl {
    constructor(...t) {
        super(...t), this.setShowDuration(5e3, 25e3);
    }
    getAnimatedHandData() {
        let t = null, e = 1 / 0;
        for (const i of this.game.grid.allCrates()) {
            const n = i.getGridPosition(), r = jh().cam.getRelativeCoordDist(n);
            (!t || r < e) && (t = n, e = r);
        }
        if (!t) return null;
        const i = new tt(t.x, 0, t.y);
        return {
            startPos: i,
            endPos: i,
            type: "click"
        };
    }
}

class cl {
    constructor() {
        this.suggestions = new Map, this.currentHand = null, this.currentVisibleSuggestion = null, 
        this.lastVisibleUpdateTime = 0;
    }
    init(t) {
        this.suggestions.set("unbox-crate", new hl(t)), this.suggestions.set("purchase-building", new al(t)), 
        this.suggestions.set("quad-merge-building", new ll(t)), this.suggestions.set("place-trophy", new ol(t)), 
        this.suggestions.set("merge-buildings", new sl(t)), this.suggestions.set("collect-coins", new rl(t));
    }
    actionOccurred(t) {
        const e = this.suggestions.get(t);
        if (!e) throw new Error(`The action with type "${t}" does not exist`);
        e.ocurred(), this.updateVisibleSuggestion();
    }
    updateVisibleSuggestion() {
        this.lastVisibleUpdateTime = performance.now();
        const t = this.findBestSuggestion(), e = t?.suggestion || null;
        this.currentVisibleSuggestion != e && (this.currentVisibleSuggestion?.onVisibilityChange(!1), 
        e?.onVisibilityChange(!0), this.currentVisibleSuggestion = e), t ? this.setAnimatedHandData(t.handData) : this.setAnimatedHandData(null);
    }
    findBestSuggestion() {
        if (this.currentVisibleSuggestion && !this.currentVisibleSuggestion.didOccurRecently()) {
            const t = this.currentVisibleSuggestion.getAnimatedHandData();
            if (t) return {
                suggestion: this.currentVisibleSuggestion,
                handData: t
            };
        }
        for (const t of this.suggestions.values()) {
            if (t == this.currentVisibleSuggestion) continue;
            if (t.didOccurRecently()) continue;
            const e = t.getAnimatedHandData();
            if (e) return {
                suggestion: t,
                handData: e
            };
        }
        return null;
    }
    setAnimatedHandData(t) {
        t ? this.currentHand || (this.currentHand = new il) : this.currentHand && (this.currentHand.destructor(), 
        this.currentHand = null), this.currentHand && t && this.currentHand.updatePositions(t);
    }
    loop(t, e) {
        performance.now() > this.lastVisibleUpdateTime + 1326 && this.updateVisibleSuggestion();
        let i = null;
        this.currentHand && (i = this.currentHand.loop(t, e)), this.currentVisibleSuggestion && this.currentVisibleSuggestion.loop({
            now: t,
            dt: e,
            handState: i,
            setAnimatedHandData: t => {
                this.setAnimatedHandData(t);
            }
        });
    }
    onGridShifted(t) {
        this.currentHand && this.currentHand.onGridShifted(t);
    }
    getSaveGameData() {
        const t = {};
        for (const [e, i] of this.suggestions) t[e] = i.occurCount;
        return {
            occurCounts: t
        };
    }
    loadSaveGameData(t) {
        for (const [e, i] of Object.entries(t.occurCounts)) {
            const t = this.suggestions.get(e);
            t && (t.occurCount = i);
        }
    }
}

class dl {
    constructor({icon: t, iconRotation: e, cssClass: i, keyboardHint: n, onClick: r, onPointerDown: s, onPointerUp: a}) {
        this.el = document.createElement("button"), this.el.classList.add("blue"), i && this.el.classList.add(i), 
        this.keyboardHint = n, this.keyboardHintVisible = !1, this.keyPressCount = 0, this.iconEl = document.createElement("span"), 
        this.iconEl.classList.add("icon"), this.el.appendChild(this.iconEl), e && (this.iconEl.style.transform = `rotate(${e}deg)`), 
        this.setIcon(t), r && this.el.addEventListener("click", (() => {
            r();
        })), s && a && (this.el.addEventListener("pointerdown", (t => {
            t.preventDefault(), this.el.setPointerCapture(t.pointerId), s();
        })), this.el.addEventListener("pointerup", (t => {
            a();
        })));
    }
    setIcon(t) {
        this.iconEl.style.background = `url(./static/svg/${t}.svg)`;
    }
    showKeyboardHint() {
        this.keyboardHintVisible = !0, this.updateKeyboardHintVisibility();
    }
    updateKeyboardHintVisibility() {
        const t = this.keyboardHintVisible && this.keyPressCount < 2;
        this.el.style.setProperty("--keyboard-indication", t ? `"${this.keyboardHint}"` : "");
    }
    keyPressed() {
        this.keyPressCount++, this.updateKeyboardHintVisibility();
    }
}

class ul {
    constructor(t) {
        this.el = document.createElement("div"), this.el.classList.add("corner-buttons-container"), 
        t.appendChild(this.el);
        const e = document.createElement("div");
        e.classList.add("top-row"), this.el.appendChild(e), this.rotationButtonsContainer = document.createElement("div"), 
        this.rotationButtonsContainer.style.display = "none", this.rotationButtonsContainer.classList.add("button-group"), 
        e.appendChild(this.rotationButtonsContainer), this.rotateLeftButton = new dl({
            icon: "leftArrow",
            keyboardHint: "Q",
            onClick: () => {
                jh().cam.rotateCam(!1);
            }
        }), this.rotationButtonsContainer.appendChild(this.rotateLeftButton.el);
        const i = new dl({
            icon: "camera",
            onClick: () => {
                jh().cam.toggleCamHeight();
            }
        });
        this.rotationButtonsContainer.appendChild(i.el), this.rotateRightButton = new dl({
            icon: "leftArrow",
            keyboardHint: "E",
            iconRotation: 180,
            onClick: () => {
                jh().cam.rotateCam(!0);
            }
        }), this.rotationButtonsContainer.appendChild(this.rotateRightButton.el), this.sfxButton = new dl({
            icon: "sfx",
            onClick: () => {
                this.sfxMuted = !this.sfxMuted;
                try {
                    localStorage.setItem("sfxMuted", String(this.sfxMuted));
                } catch {}
                this.updateMuted();
            }
        }), e.appendChild(this.sfxButton.el), this.panButtonsContainer = document.createElement("div"), 
        this.panButtonsContainer.style.display = "none", this.panButtonsContainer.classList.add("dpad-button-group"), 
        this.el.appendChild(this.panButtonsContainer), this.panCameraButtons = new Map, 
        this.createPanCameraButton("left", "A", 0), this.createPanCameraButton("right", "D", 180), 
        this.createPanCameraButton("up", "W", 90), this.createPanCameraButton("down", "S", -90);
        const n = new dl({
            icon: "camera",
            cssClass: "center"
        });
        this.panButtonsContainer.appendChild(n.el), this.sfxMuted = !1;
    }
    init() {
        try {
            this.sfxMuted = "true" == localStorage.getItem("sfxMuted");
        } catch {}
        this.updateMuted();
    }
    createPanCameraButton(t, e, i) {
        const n = new dl({
            icon: "leftArrow",
            cssClass: t,
            keyboardHint: e,
            iconRotation: i,
            onPointerDown: () => {
                jh().game.inputManager.setPanPressed(t, !0);
            },
            onPointerUp: () => {
                jh().game.inputManager.setPanPressed(t, !1);
            }
        });
        this.panButtonsContainer.appendChild(n.el), this.panCameraButtons.set(t, n);
    }
    updateMuted() {
        jh().sfx.setMutedSettings(this.sfxMuted);
        const t = this.sfxMuted ? "sfxMuted" : "sfx";
        this.sfxButton.setIcon(t);
    }
    showRotationButtons() {
        this.rotationButtonsContainer.style.display = "";
    }
    showPanButtons() {
        this.panButtonsContainer.style.display = "";
    }
    showKeyboardHints() {
        this.rotateLeftButton.showKeyboardHint(), this.rotateRightButton.showKeyboardHint();
        for (const t of this.panCameraButtons.values()) t.showKeyboardHint();
    }
    rotateKeyPressed(t) {
        "left" == t ? this.rotateLeftButton.keyPressed() : "right" == t && this.rotateRightButton.keyPressed();
    }
    panKeyPressed(t) {
        const e = this.panCameraButtons.get(t);
        e && e.keyPressed();
    }
}

const pl = new Si(1, 1, 10, 1), gl = new oi({
    transparent: !0,
    depthTest: !1,
    depthWrite: !1,
    vertexShader: "\n\t\tvarying vec3 vPos;\n\t\tvarying vec2 vUv;\n\t\tuniform float time;\n\n\t\tvoid main() {\n\t\t\tvPos = position;\n\t\t\tvPos.y += cos(vPos.x * 2.0 + time * 3.0) * 0.3;\n\t\t\tvec4 mvPosition = modelViewMatrix * vec4(vPos, 1.0);\n\t\t\tgl_Position = projectionMatrix * mvPosition;\n\t\t\tvUv = uv;\n\t\t}\n\t",
    fragmentShader: "\n\t\tvarying vec3 vPos;\n\t\tvarying vec2 vUv;\n\t\tuniform sampler2D map;\n\t\tuniform float opacity;\n\n\t\tvoid main() {\n\t\t\tvec4 textureSample = texture2D(map, vUv);\n\t\t\tvec3 strokeColor = vec3(0.5, 0.1, 0.02);\n\t\t\tvec3 fillColor = vec3(0.83, 0.26, 0.12);\n\t\t\tvec3 col = mix(strokeColor, fillColor, textureSample.g);\n\t\t\tgl_FragColor = vec4(col, textureSample.r * opacity);\n\t\t}\n\t",
    uniforms: {
        map: {
            value: null
        },
        time: {
            value: 0
        },
        opacity: {
            value: 0
        }
    }
});

class fl {
    constructor(t, e) {
        const i = "$" + go(t), n = document.createElement("canvas");
        n.width = 100, n.height = 100;
        const r = n.getContext("2d");
        let s = 1;
        if (r) {
            const t = 5, e = 2, a = "50px " + getComputedStyle(document.body).fontFamily;
            r.font = a;
            const o = r.measureText(i), l = o.actualBoundingBoxAscent + o.actualBoundingBoxDescent;
            n.width = o.width + 2 * t, n.height = l + 2 * t, s = n.width / n.height, r.font = a;
            const h = t, c = n.height - o.actualBoundingBoxDescent - t;
            r.fillStyle = "#ff0000", r.strokeStyle = "#ff0000", r.lineWidth = 2 * e, r.strokeText(i, h, c), 
            r.fillText(i, h, c), r.fillStyle = "#ffff00", r.fillText(i, h, c);
        }
        const a = new Vs(n);
        this.mat = gl.clone(), this.mat.uniforms.map.value = a, this.t = 0, this.obj = new ee, 
        this.obj.position.copy(e), this.mesh = new ti(pl, this.mat), this.mesh.scale.x = s, 
        this.mesh.scale.multiplyScalar(.3), this.obj.add(this.mesh);
    }
    loop(t, e) {
        this.obj.quaternion.copy(jh().cam.cam.quaternion), this.t += .001 * e, this.mesh.position.y = this.t, 
        this.mat.uniforms.time.value = this.t, this.mat.uniforms.opacity.value = ho(1.5 - this.t);
    }
    get canDestroy() {
        return this.t > 1.5;
    }
}

class ml {
    constructor() {
        this.mat = Ya.clone(), this.obj = new ee, this.obj.scale.setScalar(.9), this.obj.name = "quad merge highlight", 
        this.obj.renderOrder = 100, this.loadAsset();
    }
    async loadAsset() {
        const t = (await jh().assets.mergedQuadMergeHighlight).clone();
        $a(t, this.mat), this.obj.add(t);
    }
    setData(t) {
        const e = Math.pow(2, t.powerArea);
        this.obj.position.x = t.gridCoord.x + e / 2, this.obj.position.z = t.gridCoord.y + e / 2, 
        this.obj.scale.setScalar(.9 * e);
        const i = to[t.buildingType];
        this.mat.color.set(i.additiveColor);
    }
    gridShifted(t) {
        this.obj.position.x -= t.x, this.obj.position.z -= t.y;
    }
}

class vl {
    constructor(t) {
        this.game = t, this.phase = 0;
    }
    init() {
        this.game.shop.setAvailableBuildingTypes([ 0 ]);
    }
    updatePhase() {
        for (;;) {
            if (!this.shouldIncrementPhase()) break;
            this.incrementPhase();
        }
    }
    shouldIncrementPhase() {
        const t = this.game.grid;
        if (this.phase <= 0) for (const e of t.allBuildings()) return !0;
        if (this.phase <= 1) for (const e of t.allBuildings()) if (!e.isTrophyBuilding && 2 == e.height) return !0;
        if (this.phase <= 2) for (const e of t.allBuildings()) if (!e.isTrophyBuilding && e.powerAreaSimplified >= 1) return !0;
        if (this.phase <= 3) for (const e of t.allBuildings()) if (!e.isTrophyBuilding && e.powerAreaSimplified >= 2) return !0;
        if (this.phase <= 4) for (const e of t.allBuildings()) if (!e.isTrophyBuilding && e.powerAreaSimplified >= 2 && 1 == e.type) return !0;
        if (this.phase <= 5) for (const e of t.allBuildings()) if (!e.isTrophyBuilding && e.powerAreaSimplified >= 3) return !0;
        return !1;
    }
    incrementPhase() {
        this.phase++;
        const t = this.game.grid;
        1 == this.phase ? t.purchaseTile(t.worldToGridCoord(new P(1, 0))) : 2 == this.phase ? (t.purchaseTile(t.worldToGridCoord(new P(1, 1))), 
        t.purchaseTile(t.worldToGridCoord(new P(0, 1))), t.purchaseTile(t.worldToGridCoord(new P(1, 2)))) : 3 == this.phase ? (t.purchaseTile(t.worldToGridCoord(new P(0, 2))), 
        t.purchaseTile(t.worldToGridCoord(new P(0, 3))), t.purchaseTile(t.worldToGridCoord(new P(1, 3))), 
        t.purchaseTile(t.worldToGridCoord(new P(2, 0))), t.purchaseTile(t.worldToGridCoord(new P(3, 0))), 
        t.purchaseTile(t.worldToGridCoord(new P(2, 1))), t.purchaseTile(t.worldToGridCoord(new P(3, 1))), 
        t.purchaseTile(t.worldToGridCoord(new P(2, 2))), t.purchaseTile(t.worldToGridCoord(new P(3, 2))), 
        t.purchaseTile(t.worldToGridCoord(new P(2, 3))), t.purchaseTile(t.worldToGridCoord(new P(3, 3))), 
        this.game.cornerStats.showTrophyProgress(), this.game.dockUi.addTrophyBuildingSlot()) : 4 == this.phase ? (this.game.shop.setAvailableBuildingTypes([ 1 ]), 
        this.game.cornerButtons.showRotationButtons()) : 5 == this.phase ? (this.game.shop.setAvailableBuildingTypes([ 0, 1, 2 ]), 
        this.game.cornerButtons.showPanButtons()) : 6 == this.phase && (this.game.dockUi.addOpenShopSlot(), 
        this.game.cornerButtons.showKeyboardHints(), this.game.enableRewardedSuggestionButton()), 
        this.tutorialEnded;
    }
    get progress() {
        return this.phase / 6;
    }
    get allowScaffolding() {
        return this.phase < 3;
    }
    getWorldCameraOffset() {
        let t = null;
        return 0 == this.phase ? t = new P(.5, .5) : this.phase < 2 ? t = new P(1, .5) : this.phase < 3 ? t = new P(1, 1.5) : this.phase < 4 && (t = new P(2, 2)), 
        {
            offset: t,
            locked: this.phase < 3,
            downOffset: this.tutorialEnded ? 1.5 : 0
        };
    }
    get canPurchaseLand() {
        return this.phase >= 3;
    }
    get shopVisible() {
        return this.phase >= 5;
    }
    get ultraFastCrateDrops() {
        return this.phase < 3;
    }
    getDroppedCratesConcurrent() {
        return this.allowScaffolding ? {
            min: 0,
            max: 0
        } : this.phase <= 5 ? {
            min: 0,
            max: 1
        } : null;
    }
    get isForcingQuadMerge() {
        return this.phase < 3;
    }
    get tutorialEnded() {
        return this.phase >= 6;
    }
}

const _l = [ [ new P(-1, -1), new P(0, -1), new P(-1, 0), new P(0, 0) ], [ new P(0, -1), new P(1, -1), new P(0, 0), new P(1, 0) ], [ new P(0, 0), new P(1, 0), new P(0, 1), new P(1, 1) ], [ new P(-1, 0), new P(0, 0), new P(-1, 1), new P(0, 1) ] ];

class xl {
    constructor(t) {
        this.game = t, this.twoBuildingGroups = [], this.threeBuildingGroups = [], this.foundTwoGroupBuildings = new Set, 
        this.foundThreeGroupBuildings = new Set, this.groupsDirty = !0, this.foundMissingBuildingTiles = new Set;
    }
    markGroupsDirty() {
        this.groupsDirty = !0;
    }
    updateGroups() {
        if (this.groupsDirty) {
            this.twoBuildingGroups = [], this.threeBuildingGroups = [], this.foundTwoGroupBuildings.clear(), 
            this.foundThreeGroupBuildings.clear(), this.foundMissingBuildingTiles.clear();
            for (const t of this.game.grid.allBuildings()) {
                if (!t.gridCoord) continue;
                const e = Math.pow(2, t.powerArea);
                t: for (const i of _l) {
                    const n = [], r = [], s = new Set;
                    for (const a of i) {
                        const i = t.gridCoord.clone().addScaledVector(a, e), o = this.game.grid.getTile(i);
                        let l = null;
                        if (!o) continue t;
                        if (o.building && o.building.gridCoord && o.building.powerArea == t.powerArea && o.building.type == t.type && o.building.gridCoord.x == i.x && o.building.gridCoord.y == i.y && (l = o.building), 
                        l) n.push(l); else {
                            if (!this.game.grid.canPlaceBuildingType(t.powerArea, t.type, i)) continue t;
                            r.push(i);
                        }
                        for (const e of this.game.grid.getPowerTiles(i, t.powerArea)) e && !e.occupied && s.add(e);
                    }
                    const a = n.filter((t => 2 == t.height));
                    if (n.length > 1) {
                        const o = {
                            corner: t.gridCoord.clone().addScaledVector(i[0], e),
                            missingBuildingCoords: r,
                            type: t.type,
                            powerArea: t.powerArea,
                            buildings: n
                        };
                        for (const t of s) this.foundMissingBuildingTiles.add(t);
                        if (2 == a.length) {
                            this.twoBuildingGroups.push(o);
                            for (const t of n) this.foundTwoGroupBuildings.add(t);
                        } else if (3 == a.length) {
                            this.threeBuildingGroups.push(o);
                            for (const t of n) this.foundThreeGroupBuildings.add(t);
                        }
                    }
                }
            }
            this.groupsDirty = !1;
        }
    }
    * getAllGroups() {
        yield* this.twoBuildingGroups, yield* this.threeBuildingGroups;
    }
    gridShifted(t) {
        for (const e of this.getAllGroups()) {
            e.corner.sub(t);
            for (const i of e.missingBuildingCoords) i.sub(t);
        }
    }
    * getGroups(t = {}) {
        this.updateGroups();
        let e = !1;
        for (const i of this.filterGroups(this.threeBuildingGroups, t)) yield i, e = !0;
        e || (yield* this.filterGroups(this.twoBuildingGroups, t));
    }
    * filterGroups(t, e) {
        yield* t.filter((t => {
            if (void 0 !== e.type && t.type != e.type) return !1;
            if (void 0 !== e.powerArea && t.powerArea != e.powerArea) return !1;
            if (void 0 !== e.height && 0 == t.missingBuildingCoords.length) {
                if (2 == e.height) return !1;
                if (!t.buildings.find((t => t.height == e.height))) return !1;
            }
            return !0;
        }));
    }
    buildingIsPartOfGroup(t, {checkTwoBuildingGroups: e = !0, checkThreeBuildingGroups: i = !0} = {}) {
        return this.updateGroups(), (!e || !this.foundTwoGroupBuildings.has(t)) && (!i || !this.foundThreeGroupBuildings.has(t));
    }
    isMissingBuildingTile(t) {
        return this.updateGroups(), this.foundMissingBuildingTiles.has(t);
    }
}

class yl {
    constructor(t) {
        this.shop = t, this.el = document.createElement("button"), this.el.classList.add("yellow", "rewarded-suggestion");
        const e = document.createElement("div");
        e.classList.add("icon-container"), this.el.appendChild(e);
        const i = document.createElement("img");
        i.src = "./static/svg/rewardButton.svg", i.classList.add("button-icon"), e.appendChild(i);
        const n = document.createElement("span");
        n.textContent = "FREE", e.appendChild(n), this.buildingImage = new io, this.el.appendChild(this.buildingImage.el), 
        this.buildingImage.setState({
            unlocked: !0,
            available: !0
        }), this.currentBuildingData = null, this.el.addEventListener("click", (async () => {
            const e = this.currentBuildingData;
            if (!e) return;
            (await jh().adLad.showRewardedAd()).didShowAd && (t.addFreeBuilding(e), t.openShopDialog());
        })), t.onMaxBuildingSizesChange((() => {
            this.updateCurrentBuildingData();
        }));
    }
    init() {
        this.updateCurrentBuildingData();
    }
    updateCurrentBuildingData() {
        const t = this.shop.getMaxBuildingData(!1);
        t && (this.currentBuildingData = t, this.buildingImage.setBuildingData(t));
    }
}

class bl {
    constructor(t, e, i) {
        this.grid = new Vo, e.add(this.grid.obj), this.scene = e, this.gameContainer = i, 
        this.shop = new el(this, t), this.cornerStats = new Po(i), this.cornerButtons = new ul(i), 
        this.dockUi = new Co(i, this), this.shop.onCoinsChange((() => {
            this.cornerStats.setCoins(this.shop.coins);
        })), this.shop.onIncrementRateChange((() => {
            this.cornerStats.setIncrementRate(this.shop.incrementRate);
        })), this.shop.trophyBuildingsManager.onAvailableProgressChange((t => {
            this.cornerStats.setTrophyProgress(t);
        })), this.rewardedSuggestion = new yl(this.shop), this.lastCanSimplifyUpdateTime = 0, 
        this.raycaster = new Ga, this.planeRaycaster = new Ga, this.plane = new mi(new tt(0, 1, 0)), 
        this.gridVisualiser = new Wo(t, this.grid), e.add(this.gridVisualiser.obj), this.gridPowerSizePhysics = new Fo({
            damping: .01
        }), this.lastGameplayScaleUpdateTime = 0, this.lastGradualSimplifyTime = 0, this.lastRemoveSmallBuildingsTime = 0, 
        this.smoothGameplayScale = 0, this.smoothGameplayScaleTarget = 0, this.purchaseLandPowerArea = 0, 
        this.lastMaxPowerAreaSimplified = 0, this._isGradualSimplifyingGrid = !1, this._doneGradualSimplifying = !1, 
        this.animatedPurchases = new Set, this.pointerHighlights = new Set, this.quadMergeHighlights = new Set, 
        this.draggingBuildingQuadMergeHighlights = new Set, this.quadMergeTracker = new xl(this), 
        this.tutorialSuggestionsManager = new cl, this.tutorialManager = new vl(this), this.lastCoinRateUpdateTime = 0, 
        this.lastDropCrateTime = 0, this.crateDropFrequency = 0, this.grid.onSimplify((() => {
            this.gridPowerSizePhysics.value--, this._isGradualSimplifyingGrid = !1, this._doneGradualSimplifying = !1, 
            this.gridVisualiser.gridSimplified(), this.inputManager.onGridSimplified();
        })), this.grid.onSimplifyFinish((() => {
            this.updateGameplayScale(), this.quadMergeTracker.markGroupsDirty();
        })), this.grid.onGridShift((t => {
            const e = t.clone().multiplyScalar(-this.getGridScale());
            jh().cam.shiftCamera(e), this.updateGridVisualiser(), this.tutorialSuggestionsManager.onGridShifted(t), 
            this.inputManager.onGridShifted(t);
            for (const t of this.grid.allCrates()) t.updateGridPosition();
            for (const e of this.pointerHighlights) e.gridShifted(t);
            for (const e of this.quadMergeHighlights) e.gridShifted(t);
            this.quadMergeTracker.gridShifted(t);
        })), this.grid.onTileDataChanged((() => {
            this.gridVisualiser.updateTiles();
        })), this.grid.onTilesPurchased((() => {
            this.updateCrateDropFrequency();
        })), this.coinAsset = null, this.inputManager = new Xo(this, i), this.gridVisualiser.updateTiles();
    }
    async init() {
        this.grid.init(), this.cornerButtons.init(), this.tutorialSuggestionsManager.init(this), 
        this.tutorialManager.init(), this.loadGameState(), jh().assets.buildingCreator.fetchRemainingBuildings();
        const t = await jh().assets.loadGlb("coin.glb");
        Qa(t.scene), this.coinAsset = t.scene, this.updateCanSimplify();
    }
    get doneGradualSimplifying() {
        return this._doneGradualSimplifying;
    }
    enableRewardedSuggestionButton() {
        this.cornerStats.addRewardedSuggestionButton(this.rewardedSuggestion.el), this.rewardedSuggestion.init();
    }
    getCoinAsset() {
        return this.coinAsset ? this.coinAsset.clone() : null;
    }
    getGridScale() {
        return 1 / Math.pow(2, this.gridPowerSizePhysics.value);
    }
    raycastToPlaneCoord(t, e = 0) {
        this.planeRaycaster.setFromCamera(t, jh().cam.cam), this.planeRaycaster.ray.origin.y -= e * this.getGridScale();
        const i = this.planeRaycaster.ray.intersectPlane(this.plane, new tt);
        return i ? (i.divideScalar(this.getGridScale()), new P(i.x, i.z)) : null;
    }
    raycastObjects(t) {
        let e = 0;
        for (const t of this.grid.allBuildings()) e = Math.max(e, t.raycastPhysicalHeight);
        for (const t of this.grid.allCrates()) e = Math.max(e, t.raycastPhysicalHeight);
        const i = new Set;
        this.raycaster.setFromCamera(t, jh().cam.cam);
        for (let n = 0; n <= 10; n++) {
            const r = e - n / 10 * e, s = this.raycastObjectsPlane(t, r);
            if (s) {
                let t = null;
                if ("building" == s.type ? t = s.building : "crate" == s.type && (t = s.crate), 
                t && !i.has(t)) {
                    if (t.raycast(this.raycaster)) return s;
                    i.add(t);
                }
            }
        }
        return null;
    }
    raycastObjectsPlane(t, e = 0) {
        const i = this.raycastToPlaneCoord(t, e);
        if (!i) return null;
        const n = this.snapCoordToGrid(i), r = this.grid.getBuildingAtCoord(n);
        if (r) return r.raycastPhysicalHeight < e ? null : {
            type: "building",
            building: r
        };
        const s = this.grid.getCrateAtCoord(n);
        return s ? s.raycastPhysicalHeight < e ? null : {
            type: "crate",
            crate: s
        } : null;
    }
    snapCoordToGrid(t, e = 0) {
        const i = Math.pow(2, e), n = this.grid.worldCenterOffset.clone();
        n.x = so(n.x, i), n.y = so(n.y, i);
        const r = Math.floor((t.x - n.x) / i) * i + n.x, s = Math.floor((t.y - n.y) / i) * i + n.y;
        return new P(r, s);
    }
    getPurchaseLandPowerArea() {
        return this.purchaseLandPowerArea;
    }
    getMinMaxBuildingIndices({typeFilter: t} = {}) {
        const e = [];
        for (const t of this.grid.allBuildings()) t.isTrophyBuilding || e.push({
            type: t.type,
            powerArea: t.powerArea,
            height: t.height
        });
        let i = 1 / 0, n = 0;
        for (const r of e) {
            if (null != t && r.type != t) continue;
            const e = $o(r.powerArea, r.height);
            i = Math.min(i, e), n = Math.max(n, e);
        }
        return {
            minIndex: i,
            maxIndex: n
        };
    }
    getTileCenterOffset(t) {
        const e = new P(.5, .5);
        return e.multiplyScalar(Math.pow(2, t)), e;
    }
    updateShopBuildingFractions() {
        const t = new Array(to.length).fill(0);
        for (const e of this.grid.allBuildings()) {
            const i = this.shop.getBuildingValue(e.powerAreaSimplified, e.height, !1);
            t[e.type] += i;
        }
        let e = 0;
        for (const [i, n] of t.entries()) {
            const r = n + 1e3;
            t[i] = r, e += r;
        }
        const i = [];
        for (const [n, r] of t.entries()) i[n] = r / e;
        const n = new Array(to.length).fill(0);
        for (const t of n.keys()) {
            const {maxIndex: e} = this.getMinMaxBuildingIndices({
                typeFilter: t
            }), i = tl(e);
            i.powerArea += this.grid.simplifyCount, n[t] = $o(i.powerArea, i.height);
        }
        this.shop.updatePlacedBuildings(i, n);
    }
    getSuitableNewBuildingProperties(t, {maxConcurrent: e, forceMinPlaced: i = !1, forcePowerArea: n}) {
        let {minIndex: r, maxIndex: s} = this.getMinMaxBuildingIndices({
            typeFilter: t
        });
        const a = r + 2 * this.grid.simplifyCount;
        let o = s + 2 * this.grid.simplifyCount - e;
        const l = 2 * this.grid.simplifyCount;
        if (o = Math.max(o, l), o = this.tutorialManager.allowScaffolding ? Math.max(o, 0) : Math.max(o, 2), 
        i) {
            let e = 0;
            for (const i of this.grid.allBuildings()) if (i.type == t) {
                $o(i.powerAreaSimplified, i.height) == a && e++;
            }
            let i = 2;
            1 == so(a, 2) && (i = 4), e > 0 && e < i && (o = Math.min(o, a));
        }
        if (void 0 !== n) {
            o = lo(o, 2 * n, 2 * (n + 1) - 1);
        }
        const h = tl(o);
        return {
            powerAreaSimplified: h.powerArea,
            height: h.height
        };
    }
    getAllSuitableNewBuildingProperties(t) {
        const e = [];
        for (const i of this.shop.availableBuildingTypes()) {
            const n = this.getSuitableNewBuildingProperties(i, t);
            e.push({
                type: i,
                buildingData: n
            });
        }
        return e;
    }
    loop(t, e) {
        if (this.inputManager.loop(t, e), this.scaleGridAroundCenter((() => {
            this.smoothGameplayScale = ao(this.smoothGameplayScale, this.smoothGameplayScaleTarget, .001), 
            this.gridPowerSizePhysics.loop(t, e);
        })), this.updateGridVisualiser(), this.gridVisualiser.loop(t, e), t - this.lastGameplayScaleUpdateTime > 2323 && (this.updateGameplayScale(), 
        this.lastGameplayScaleUpdateTime = t), this._isGradualSimplifyingGrid && t - this.lastGradualSimplifyTime > 953) {
            this.lastGradualSimplifyTime = t;
            this.grid.gradualSimplifyGrid() && (this._doneGradualSimplifying = !0);
        }
        t - this.lastRemoveSmallBuildingsTime > 1103 && (this.lastRemoveSmallBuildingsTime = t, 
        this.removeSmallBuildings()), t - this.lastDropCrateTime > this.crateDropFrequency && (this.lastDropCrateTime = t, 
        this.dropCrate()), t - this.lastCoinRateUpdateTime > 1e3 && (this.lastCoinRateUpdateTime = t, 
        this.updateShopIncrementRate()), t - this.lastCanSimplifyUpdateTime > 423 && (this.lastCanSimplifyUpdateTime = t, 
        this.updateCanSimplify());
        for (const i of this.grid.allBuildings(!0)) i.loop(t, e);
        for (const i of this.grid.allCrates()) i.loop(t, e);
        this.shop.loop(t, e), this.cornerStats.loop(t, e);
        const i = this.grid.worldCenterOffset.clone();
        let n = 0;
        const {offset: r, locked: s, downOffset: a} = this.tutorialManager.getWorldCameraOffset();
        r && i.add(r), s || (n = co(this.smoothGameplayScale, 0, 3, .1, 5)), i.multiplyScalar(this.getGridScale()), 
        jh().cam.setPositionClamp(i, a, n), this.tutorialSuggestionsManager.loop(t, e);
        for (const i of this.animatedPurchases) i.loop(t, e), i.canDestroy && (this.animatedPurchases.delete(i), 
        this.grid.obj.remove(i.obj));
    }
    updateCanSimplify() {
        this.grid.setCanSimplify(this.gridVisualiser.canSimplifyGrid());
    }
    updateGridVisualiser() {
        const t = this.getGridScale();
        this.gridVisualiser.setGridProperties(t, this.grid.worldCenterOffset, this.tutorialManager.canPurchaseLand), 
        this.gridVisualiser.setPriceRange(.4 * this.shop.incrementRate, 4 * this.shop.incrementRate, this.shop.coins);
    }
    updateShopIncrementRate() {
        let t = 0;
        for (const e of this.grid.allBuildings()) t += this.shop.getBuildingValue(e.powerAreaSimplified, e.height, !1);
        t = Math.pow(t, .4), this.shop.setIncrementRate(t);
    }
    updateDraggingBuildingHighlights(t) {
        this.updateMergeBuildingHighlights(t), this.updateQuadMergeBuildingHighlights(t);
    }
    updateMergeBuildingHighlights(t) {
        const e = new Set, i = Array.from(this.grid.allBuildings());
        for (const n of t) for (const t of i) t != n && (t.isMaxHeight() || t.isSimilar(n) && e.add(t));
        for (const t of i) t.setMergeHighlightVisible(e.has(t));
    }
    updateQuadMergeBuildingHighlights(t) {
        const e = new Map;
        for (const i of t) {
            const t = this.quadMergeTracker.getGroups({
                type: i.type,
                powerArea: i.powerArea,
                height: i.height
            });
            for (const i of t) {
                let t = e.get(i.corner.x);
                t || (t = new Map, e.set(i.corner.x, t));
                let n = t.get(i.corner.y);
                n || (n = new Map, t.set(i.corner.y, n));
                let r = n.get(i.type);
                r || (r = new Set, n.set(i.type, r)), r.add(i.powerArea);
            }
        }
        const i = Array.from(this.draggingBuildingQuadMergeHighlights);
        this.draggingBuildingQuadMergeHighlights.clear();
        const n = () => {
            let t = i.pop();
            return t || (t = this.createQuadMergeHighlight()), this.draggingBuildingQuadMergeHighlights.add(t), 
            t;
        };
        for (const [t, i] of e) for (const [e, r] of i) for (const [i, s] of r) for (const r of s) {
            n().setData({
                gridCoord: new P(t, e),
                buildingType: i,
                powerArea: r + 1
            });
        }
        for (const t of i) this.removeQuadMergeHighlight(t);
    }
    createDraggingBuilding(t, e, i) {
        const n = this.createBuilding(t, e, i);
        return this.grid.addDraggingBuilding(n), n;
    }
    getMergeableBuildings() {
        const t = new Map;
        for (const e of this.grid.allBuildings()) {
            if (e.isTrophyBuilding) continue;
            let i = t.get(e.type);
            i || (i = new Map, t.set(e.type, i));
            let n = i.get(e.powerArea);
            n || (n = new Map, i.set(e.powerArea, n));
            const r = n.get(e.height) || 0;
            n.set(e.height, r + 1);
        }
        let e = 0;
        for (const i of t.values()) for (const t of i.values()) for (const [i, n] of t) {
            let t;
            t = 2 == i ? 4 : 2, n >= t && (e += n - t + 1);
        }
        return e;
    }
    updateCrateDropFrequency() {
        if (this.tutorialManager.ultraFastCrateDrops) this.crateDropFrequency = 200; else {
            const t = new Set(this.grid.allCrates()).size;
            let e = 0;
            for (const t of this.grid.allTiles()) t.purchased && !t.occupied && e++;
            const i = t + lo(3 - e, 0, 3) + this.getMergeableBuildings();
            this.tutorialManager.tutorialEnded ? this.crateDropFrequency = co(i, 0, 5, 3e3, 6e4, !1) : this.crateDropFrequency = co(i, 0, 5, 500, 1e4, !1);
        }
    }
    dropCrate() {
        if (this.shop.shopDialog) return null;
        if (this.inputManager.isDraggingBuilding()) return null;
        const t = Math.random(), e = () => {
            const e = this.tutorialManager.getDroppedCratesConcurrent();
            let i;
            return i = e ? Math.floor(ao(e.min, e.max + 1, t)) : 2, {
                maxConcurrent: i,
                forceMinPlaced: !0
            };
        }, i = this.getAllSuitableNewBuildingProperties(e()).map((t => t.buildingData.powerAreaSimplified)), n = Math.max(bo(i) || 0, this.grid.simplifyCount), r = n - this.grid.simplifyCount;
        if (this.tutorialManager.isForcingQuadMerge) {
            if (Array.from(this.grid.allBuildings()).length + Array.from(this.grid.allCrates()).length >= 4) return null;
        }
        const s = [];
        t: for (const t of this.grid.allCoords()) {
            if (this.tutorialManager.isForcingQuadMerge) {
                const e = this.grid.worldToGridCoord(new P(1, 1));
                if (t.x == e.x && t.y == e.y) continue t;
            }
            const e = [];
            for (const i of this.grid.getPowerTiles(t, r)) {
                if (!i) continue t;
                if (!i.purchased) continue t;
                if (i.occupied) continue t;
                if (i.crate) continue t;
                if ("none" == i.allowedBuildings) continue t;
                if (this.tutorialManager.shopVisible && this.quadMergeTracker.isMissingBuildingTile(i)) continue t;
                e.push(i);
            }
            let i = null;
            for (const t of e) (!i || t.gridCoord.x < i.gridCoord.x || t.gridCoord.y < i.gridCoord.y) && (i = t);
            i && s.push({
                tiles: e,
                cornerTile: i
            });
        }
        let a = bo(s.filter((t => {
            const e = t.cornerTile.gridCoord;
            return this.grid.isCornerCoord(e);
        })));
        if (a || (a = bo(s)), !a) return null;
        if (a.tiles.length <= 0) return null;
        const o = new zo({
            grid: this.grid,
            tile: a.cornerTile,
            powerArea: r,
            onUnbox: () => {
                this.grid.removeCrate(o), this.tutorialSuggestionsManager.actionOccurred("unbox-crate"), 
                this.updateCrateDropFrequency();
                const t = bo(this.getAllSuitableNewBuildingProperties(e()).filter((t => t.buildingData.powerAreaSimplified == n)));
                if (void 0 !== t) {
                    const i = this.getSuitableNewBuildingProperties(t.type, {
                        ...e(),
                        forcePowerArea: n
                    }), r = this.createBuilding(t.type, i.powerAreaSimplified, i.height);
                    this.grid.addBuilding(r), this.grid.moveBuilding(r, o.getGridCoord(), {
                        ignoreColoredtiles: !0
                    });
                }
                this.tutorialManager.updatePhase(), this.updateShopBuildingFractions(), this.quadMergeTracker.markGroupsDirty();
            }
        });
        for (const t of a.tiles) t.assignCrate(o);
        return this.grid.obj.add(o.obj), this.updateCrateDropFrequency(), this.quadMergeTracker.markGroupsDirty(), 
        o;
    }
    draggingBuildingPlaced() {
        this.updateShopIncrementRate(), this.tutorialManager.updatePhase(), this.updateShopBuildingFractions();
    }
    createBuilding(t, e, i) {
        return new Ho(this, t, e - this.grid.simplifyCount, i, this.grid);
    }
    createAnimatedPurchase(t, e) {
        const i = new fl(t, e);
        this.grid.obj.add(i.obj), this.animatedPurchases.add(i);
    }
    updateGameplayScale() {
        const {minIndex: t, maxIndex: e} = this.getMinMaxBuildingIndices(), i = e + 2 * this.grid.simplifyCount, n = Math.floor(i / 2);
        n > this.lastMaxPowerAreaSimplified && (this.lastMaxPowerAreaSimplified = n);
        let {powerArea: r} = tl(t);
        for (const t of this.grid.allCrates()) r = Math.min(r, t.powerArea);
        const {powerArea: s} = tl(e);
        this.purchaseLandPowerArea = s, this.gridVisualiser.setMinMaxBuildingPowerArea(r, s), 
        this.gridPowerSizePhysics.target = e / 2, this._isGradualSimplifyingGrid = r >= 1, 
        this._isGradualSimplifyingGrid || (this._doneGradualSimplifying = !1), this.smoothGameplayScaleTarget = i / 2, 
        this.updateGridPowerSizeDamping();
    }
    removeSmallBuildings() {
        let t = this.grid.simplifyCount;
        t = Math.max(t, this.lastMaxPowerAreaSimplified - 2);
        for (const e of this.grid.allBuildings()) e.powerAreaSimplified < t && this.grid.removeBuilding(e, !0);
        for (const e of this.grid.allCrates()) {
            e.powerArea + this.grid.simplifyCount < t && this.grid.removeCrate(e);
        }
    }
    updateGridPowerSizeDamping() {
        this.gridPowerSizePhysics.damping = co(this.tutorialManager.progress, 0, 4, .02, .001);
    }
    expandGridFromFrustum() {
        const t = [ new P(-1, -1), new P(-1, 1), new P(1, -1), new P(1, 1) ].map((t => {
            const e = this.raycastToPlaneCoord(t);
            return e ? this.snapCoordToGrid(e) : null;
        }));
        let e = -1 / 0, i = -1 / 0, n = -1 / 0, r = -1 / 0;
        for (const s of t) s && (e = Math.max(e, -s.x), i = Math.max(i, -s.y), n = Math.max(n, s.x - this.grid.width + 1), 
        r = Math.max(r, s.y - this.grid.height + 1));
        this.grid.expandGrid(e, n, i, r);
    }
    createTilePointerHighlight() {
        const t = new jo;
        return this.grid.obj.add(t.obj), this.pointerHighlights.add(t), t;
    }
    removeTilePointerHighlight(t) {
        this.grid.obj.remove(t.obj), this.pointerHighlights.delete(t);
    }
    createQuadMergeHighlight() {
        const t = new ml;
        return this.grid.obj.add(t.obj), this.quadMergeHighlights.add(t), t;
    }
    removeQuadMergeHighlight(t) {
        this.grid.obj.remove(t.obj), this.quadMergeHighlights.delete(t);
    }
    saveGameState() {
        const t = this.grid.getSaveGameData(), e = {
            coins: this.shop.coins,
            freeBuildingCounts: this.shop.getFreeBuildingCountsSaveGameData(),
            grid: t,
            tutorialSuggestions: this.tutorialSuggestionsManager.getSaveGameData()
        };
        try {
            localStorage.setItem("cityStackerGameData", JSON.stringify(e));
        } catch {}
    }
    loadGameState() {
        let t = null;
        try {
            const e = localStorage.getItem("cityStackerGameData");
            e && (t = JSON.parse(e));
        } catch {}
        if (!t) return;
        this.shop.setCoinCount(t.coins), t.freeBuildingCounts && this.shop.loadFreeBuildingCounts(t.freeBuildingCounts), 
        t.tutorialSuggestions && this.tutorialSuggestionsManager.loadSaveGameData(t.tutorialSuggestions);
        const e = this.grid.loadSaveGameData(t.grid);
        for (const t of e) {
            const e = this.grid.getTile(t.coord);
            if (!e || e.building) continue;
            const i = Math.min(t.height, 2), n = this.createBuilding(t.type, t.powerArea, i);
            this.grid.addBuilding(n), this.grid.moveBuilding(n, t.coord, {
                sfx: !1,
                ignoreColoredtiles: !0
            });
        }
        this.draggingBuildingPlaced(), this.tutorialManager.updatePhase(), this.updateGameplayScale(), 
        this.scaleGridAroundCenter((() => {
            this.smoothGameplayScale = this.smoothGameplayScaleTarget, this.gridPowerSizePhysics.value = this.gridPowerSizePhysics.target;
        })), this.quadMergeTracker.markGroupsDirty();
    }
    scaleGridAroundCenter(t) {
        const e = this.raycastToPlaneCoord(new P(0, 0));
        t();
        const i = this.getGridScale();
        this.grid.obj.scale.setScalar(i);
        const n = this.raycastToPlaneCoord(new P(0, 0));
        if (e && n) {
            const t = e.clone().sub(n).multiplyScalar(this.getGridScale());
            jh().cam.shiftCamera(t);
        }
    }
}

class Sl {
    constructor(t) {
        this.cam = new hi(70, 1, .1, 20), this.cam.name = "cam", this._camPlaneTarget = new P, 
        this.smoothCamPlaneTarget = new P, this.clampPosition = new P, this.clampDownOffset = 0, 
        this.clampSize = 1, this.isHighCamera = !1, this.smoothCamHeight = 2, this.camYRotPhysics = new Fo({
            loopValue: !0,
            damping: .3,
            startValue: .25 * Math.PI
        }), this.zoomPhysics = new Fo({
            startValue: 1,
            damping: .4
        }), t.add(this.cam), window.addEventListener("resize", (() => {
            this.onResize();
        })), this.onResize(), this.updateCamPos();
    }
    onResize() {
        this.cam.aspect = window.innerWidth / window.innerHeight, Number.isFinite(this.cam.aspect) || (this.cam.aspect = 1), 
        this.cam.updateProjectionMatrix();
    }
    get camPlaneTarget() {
        return this._camPlaneTarget;
    }
    panCamera(t) {
        this._camPlaneTarget.add(t);
    }
    panCameraRelative(t) {
        const e = this.rotateVectorWithCamRot(t.clone());
        this.panCamera(e);
    }
    shiftCamera(t) {
        this._camPlaneTarget.x += t.x, this._camPlaneTarget.y += t.y, this.smoothCamPlaneTarget.x += t.x, 
        this.smoothCamPlaneTarget.y += t.y, this.updateCamPos();
    }
    setPositionClamp(t, e, i) {
        this.clampPosition.copy(t), this.clampDownOffset = e, this.clampSize = i;
    }
    rotateVectorWithCamRot(t) {
        return t.rotateAround(new P, -this.camYRotPhysics.value);
    }
    offsetZoom(t) {
        this.zoomPhysics.target += t, this.zoomPhysics.target = lo(this.zoomPhysics.target, .5, 1.3);
    }
    loop(t, e) {
        const i = this.clampPosition.clone(), n = new P(0, this.clampDownOffset);
        this.rotateVectorWithCamRot(n), i.add(n);
        const r = this._camPlaneTarget.clone().sub(i);
        r.clampLength(0, this.clampSize), this._camPlaneTarget.copy(i).add(r), this.smoothCamPlaneTarget.lerp(this._camPlaneTarget, .1);
        const s = this.isHighCamera ? 3 : 2;
        this.smoothCamHeight = ao(this.smoothCamHeight, s, .1), this.camYRotPhysics.loop(t, e), 
        this.zoomPhysics.loop(t, e), this.updateCamPos();
    }
    updateCamPos() {
        const t = new tt(this.smoothCamPlaneTarget.x, 0, this.smoothCamPlaneTarget.y);
        this.cam.position.copy(t);
        const e = new $;
        e.setFromAxisAngle(new tt(0, 1, 0), this.camYRotPhysics.value);
        const i = new tt(0, this.smoothCamHeight, 2.1);
        let n = co(this.cam.aspect, 0, 1, 2, 1);
        n *= this.zoomPhysics.value, i.multiplyScalar(n), i.applyQuaternion(e), this.cam.position.add(i), 
        this.cam.lookAt(t);
    }
    worldToScreenPos(t) {
        const e = this.cam.projectionMatrix.clone().multiply(this.cam.matrixWorldInverse);
        let i = t.clone();
        i.applyMatrix4(e);
        let n = new P(i.x, i.y);
        return n.multiplyScalar(.5), n.x += .5, n.y += .5, n.y = 1 - n.y, n;
    }
    toggleCamHeight() {
        this.isHighCamera = !this.isHighCamera, this.isHighCamera ? jh().sfx.playSound("camera/zoomOut") : jh().sfx.playSound("camera/zoomIn");
    }
    rotateCam(t) {
        const e = t ? 1 : -1;
        this.camYRotPhysics.target += e * Math.PI * .5, t ? jh().sfx.playSound("camera/rotateRight") : jh().sfx.playSound("camera/rotateLeft");
    }
    getRelativeCoordDist(t) {
        const e = this.camYRotPhysics.value;
        return t.x * -Math.sin(e) + t.y * -Math.cos(e);
    }
}

class wl {
    constructor(t) {
        this.webglCreationFailed = !1, this.renderer = null, this.canvas = null, this.waitForFrameRenderCbs = new Set;
        const e = new Ua;
        e.name = "light", e.position.set(-2, 4, 5), t.add(e), this.renderWidth = 0, this.renderHeight = 0, 
        this.requestedObjUrlScenes = [];
    }
    init(t) {
        try {
            this.renderer = new $r({
                antialias: !0,
                powerPreference: "high-performance",
                failIfMajorPerformanceCaveat: !0
            });
        } catch (t) {
            try {
                this.renderer = new $r({
                    antialias: !0,
                    alpha: !0,
                    failIfMajorPerformanceCaveat: !0
                });
            } catch (t) {
                try {
                    this.renderer = new $r({
                        antialias: !1,
                        alpha: !0,
                        failIfMajorPerformanceCaveat: !0
                    });
                } catch (t) {
                    try {
                        this.renderer = new $r;
                    } catch (t) {
                        console.error("Failed to create WebGLRenderer:", t), this.webglCreationFailed = !0;
                    }
                }
            }
        }
        this.renderer && (this.renderer.autoClear = !1, this.canvas = this.renderer.domElement, 
        this.canvas.classList.add("main-canvas"), this.canvas.inert = !0, t.appendChild(this.canvas)), 
        window.addEventListener("resize", (() => {
            this.onResize();
        })), this.onResize();
    }
    onResize() {
        this.renderWidth = window.innerWidth, this.renderHeight = window.innerHeight, this.renderer && this.renderer.setSize(this.renderWidth, this.renderHeight);
    }
    requestSceneObjectUrl(t, e, i, n) {
        const r = {
            scene: t,
            camera: e,
            width: i,
            height: n,
            resolvePromise: () => {},
            rejectPromise: () => {}
        };
        this.requestedObjUrlScenes.push(r);
        return new Promise(((t, e) => {
            r.resolvePromise = t, r.rejectPromise = e;
        }));
    }
    loop(t, e) {
        if (this.renderer) {
            for (const t of this.requestedObjUrlScenes) {
                const {camera: e, scene: i, width: n, height: r, resolvePromise: s, rejectPromise: a} = t;
                try {
                    this.renderer.setClearAlpha(0), this.renderer.clear();
                    const t = Math.min(n, this.renderWidth), o = Math.min(r, this.renderHeight);
                    this.renderer.setViewport(0, this.renderHeight - o, t, o), this.renderer.render(i, e);
                    const l = document.createElement("canvas"), h = l.getContext("2d");
                    if (!h) throw new Error("Assertion failed, canvas context was null");
                    l.width = n, l.height = r, h.drawImage(this.renderer.domElement, 0, 0, t, o, 0, 0, l.width, l.height), 
                    (async () => {
                        try {
                            const t = new Promise((t => {
                                if (!this.renderer) return null;
                                l.toBlob(t);
                            })), e = await t;
                            if (!e) throw new Error("Failed to get blob from canvas, is the width or height zero?");
                            const i = URL.createObjectURL(e);
                            s(i);
                        } catch (t) {
                            a(t);
                        }
                    })();
                } catch (t) {
                    a(t);
                }
            }
            this.requestedObjUrlScenes = [], this.renderer.clear(), this.renderer.setViewport(0, 0, this.renderWidth, this.renderHeight), 
            this.renderer.render(jh().scene, jh().cam.cam), this.waitForFrameRenderCbs.forEach((t => t())), 
            this.waitForFrameRenderCbs.clear();
        }
    }
    waitForFrameRender() {
        return new Promise((t => {
            this.waitForFrameRenderCbs.add(t);
        }));
    }
    supportsFwidth() {
        if (!this.renderer) throw new Error("Renderer is not initialized yet");
        if (this.renderer.capabilities.isWebGL2) return {
            supported: !0,
            needsEnable: !1
        };
        return this.renderer.getContext().getExtension("OES_standard_derivatives") ? {
            supported: !0,
            needsEnable: !0
        } : {
            supported: !1,
            needsEnable: !1
        };
    }
}

function Ml(t, {keepCustomProperties: e = [], rename: i = !0} = {}) {
    const n = i ? " merged" : "", r = new Set;
    for (const e of ja(t)) if (e instanceof ti) if (Array.isArray(e.material)) for (const t of e.material) r.add(t.name); else r.add(e.material.name);
    const s = new Map;
    for (const t of r) s.set(t, {
        geometries: []
    });
    for (const e of ja(t)) if (e instanceof ti) {
        let t;
        t = Array.isArray(e.material) ? e.material.map((t => t.name)) : [ e.material.name ];
        const i = e.geometry.clone();
        if (i.applyMatrix4(e.matrixWorld), i.groups.length <= 0) {
            const e = s.get(t[0]);
            if (!e) throw new Error("Assertion failed, material group doesn't exist.");
            let n = 0;
            i.index && (n = i.index.array.length);
            let r = 0;
            for (const t of Object.values(i.attributes)) r = t.count;
            e.geometries.push({
                geometry: i,
                rangeData: {
                    indexStart: 0,
                    indexCount: n,
                    vertexStart: 0,
                    vertexCount: r
                }
            });
        } else for (const e of i.groups) {
            if (e.count <= 0) continue;
            const n = t[e.materialIndex], r = s.get(n);
            if (!r) throw new Error("Assertion failed, material group doesn't exist.");
            let a = 1 / 0, o = -1 / 0;
            for (let t = 0; t < e.count; t++) {
                const n = i.index.array[e.start + t];
                a = Math.min(a, n), o = Math.max(o, n);
            }
            r.geometries.push({
                geometry: i,
                rangeData: {
                    indexStart: e.start,
                    indexCount: e.count,
                    vertexStart: a,
                    vertexCount: o - a + 1
                }
            });
        }
    }
    const a = new Map;
    for (const [t, e] of s) for (const i of e.geometries) {
        const e = Object.keys(i.geometry.attributes).join(",");
        let n = a.get(e);
        n || (n = new Map, a.set(e, n));
        let r = n.get(t);
        r || (r = {
            geometries: []
        }, n.set(t, r)), r.geometries.push(i);
    }
    const o = [];
    for (const [e, i] of a) {
        const r = Tl(i);
        r && (r.name = t.name + n, a.size > 1 && (r.name += " " + e)), r && o.push(r);
    }
    if (e.length > 0) for (const i of ja(t)) {
        const t = [];
        for (const n of e) Object.prototype.hasOwnProperty.call(i.userData, n) && t.push([ n, i.userData[n] ]);
        if (t.length > 0) {
            const e = new ee;
            e.name = i.name, i.updateMatrix(), i.updateMatrixWorld(), e.matrix.copy(i.matrix), 
            e.userData = {};
            for (const [i, n] of t) e.userData[i] = n;
            o.push(e);
        }
    }
    if (0 == o.length) return null;
    if (1 == o.length) return o[0];
    {
        const e = new ee;
        e.name = t.name + n;
        for (const t of o) e.add(t);
        return e;
    }
}

function Tl(t) {
    let e = 0;
    for (const i of t.values()) for (const {rangeData: t} of i.geometries) e += t.indexCount;
    const i = [], n = [], r = new Uint32Array(e);
    let s = 0, a = 0;
    for (const [e, o] of t) {
        const t = s;
        for (const {geometry: t, rangeData: e} of o.geometries) {
            if (!t.index) throw new Error("Merging eometries without indices is not supported.");
            for (let i = 0; i < e.indexCount; i++) r[s++] = t.index.array[e.indexStart + i] + a - e.vertexStart;
            a += e.vertexCount;
        }
        const l = s;
        i.push({
            start: t,
            count: l - t
        }), n.push(new Se({
            name: e
        }));
    }
    if (n.length <= 0) return null;
    const o = new Be;
    o.setIndex(new Ae(r, 1));
    const l = new Map;
    for (const e of t.values()) for (const t of e.geometries) for (const [e, i] of Object.entries(t.geometry.attributes)) {
        let n = l.get(e);
        n || (n = [], l.set(e, n)), n.push({
            attribute: i,
            rangeData: t.rangeData
        });
    }
    for (const [t, e] of l) {
        const i = Al(e);
        if (!i) return null;
        o.setAttribute(t, i);
    }
    for (const [t, {start: e, count: n}] of i.entries()) o.addGroup(e, n, t);
    return new ti(o, n);
}

const El = [ Uint8Array, Uint16Array, Float32Array ];

function Al(t) {
    let e, i = -1, n = null, r = null, s = 0;
    for (const {attribute: a, rangeData: o} of t) {
        const t = a.array.constructor;
        if (!El.includes(t)) throw new Error(`Unsupported attribute type: ${t.name}`);
        const l = El.indexOf(t);
        if (l > i && (n = t, i = l, e = a.normalized), null == r) r = a.itemSize; else if (a.itemSize != r) throw new Error(`Unable to merge attributes, item size differs: ${a.itemSize} != ${r}`);
        s += o.vertexCount * r;
    }
    if (!n || null === r) return null;
    const a = new n(s);
    let o = 0;
    for (const {attribute: i, rangeData: n} of t) {
        const t = n.vertexStart * r, s = n.vertexCount * r, l = t + s;
        let h = i.array, c = i.normalized;
        if (a instanceof Float32Array && h instanceof Uint16Array && !e && c) {
            const t = new Float32Array(h.length);
            for (let e = 0; e < h.length; e++) t[e] = h[e] / 65535;
            h = t, c = !1;
        }
        if (a.constructor !== h.constructor) throw new Error(`Assertion failed, array types are not the same: ${a.constructor.name} !== ${h.constructor.name}`);
        if (e != c) throw new Error(`Assertion failed, normalized values are not the same: ${e} !== ${c}`);
        a.set(h.subarray(t, l), o), o += s;
    }
    return new Te(a, r, e);
}

class Cl {
    constructor(t) {
        this.isDownloading = !1, this.loaded = !1, this.url = t, this.arrayBuffer = null, 
        this.fileLocations = [], this.onLoadCbs = [], this.onProgressCbs = [], this.lastProgressValue = 0, 
        this.textureCache = {};
    }
    async startDownloading() {
        if (this.loaded) return;
        if (this.isDownloading) return await this.waitForLoad();
        this.isDownloading = !0;
        const t = await (e = this.url, i = t => {
            for (const e of this.onProgressCbs) e(t);
            this.lastProgressValue = t;
        }, new Promise(((t, n) => {
            const r = new XMLHttpRequest;
            r.responseType = "blob", r.addEventListener("progress", (t => {
                if (i) {
                    let e = 0;
                    t.lengthComputable && (e = t.loaded / t.total), i(e);
                }
            })), r.onload = i => {
                200 == r.status || 0 == r.status ? t(r.response) : n(new Error(`"${e}" responded with a non ok status code`));
            }, r.onerror = t => {
                n(t);
            }, r.open("GET", e, !0), r.send();
        })));
        var e, i;
        this.arrayBuffer = await new Response(t).arrayBuffer(), this.parseFilePositions(this.arrayBuffer), 
        this.loaded = !0;
        for (const t of this.onLoadCbs) t();
        this.onLoadCbs = [], this.onProgressCbs = [], this.isDownloading = !1;
    }
    parseFilePositions(t) {
        let e = 0;
        for (;e < t.byteLength; ) {
            let i = new Uint32Array(t, e, 1)[0];
            const n = new Uint8Array(t, e + 4, i), r = new TextDecoder("utf-8").decode(n);
            i % 4 != 0 && (i = 4 * Math.ceil(i / 4));
            let s = new Uint32Array(t, e + 4 + i, 1)[0];
            this.fileLocations.push({
                path: r,
                start: e + 4 + i + 4,
                length: s
            }), s % 4 != 0 && (s = 4 * Math.ceil(s / 4)), e += 4 + i + 4 + s;
        }
    }
    onLoad(t) {
        this.loaded ? t() : this.onLoadCbs.push(t);
    }
    onProgress(t) {
        this.loaded ? t(1) : this.onProgressCbs.push(t);
    }
    async waitForLoad() {
        if (this.loaded) return;
        const t = new Promise(((t, e) => {
            this.onLoad((() => {
                t();
            }));
        }));
        await t;
    }
    async hasFile(t) {
        return this.loaded || await this.waitForLoad(), this.fileLocations.some((e => e.path == t));
    }
    async getFileAsBuffer(t) {
        if (this.loaded || await this.waitForLoad(), !this.arrayBuffer) throw new Error("Assertion failed, arrayBuffer not loaded");
        for (const e of this.fileLocations) if (e.path == t) return this.arrayBuffer.slice(e.start, e.start + e.length);
        throw new Error(`Trying to load asset at ${t} but it doesn't exist!`);
    }
    async getAsObjectUrl(t, e) {
        const i = await this.getFileAsBuffer(t);
        if (!i) return null;
        const n = new Blob([ new Uint8Array(i) ], {
            type: e
        });
        return URL.createObjectURL(n);
    }
    async getAsSvg(t) {
        return await this.getAsObjectUrl(t, "image/svg+xml");
    }
    async getAsText(t) {
        const e = await this.getFileAsBuffer(t), i = new Uint8Array(e);
        return new TextDecoder("utf-8").decode(i);
    }
    async getAsJSON(t) {
        const e = await this.getAsText(t);
        return JSON.parse(e);
    }
    async blobToArrayBuffer(t) {
        return await new Response(t).arrayBuffer();
    }
}

function Pl(t, e) {
    if (0 === e) return console.warn("THREE.BufferGeometryUtils.toTrianglesDrawMode(): Geometry already defined as triangles."), 
    t;
    if (2 === e || 1 === e) {
        let i = t.getIndex();
        if (null === i) {
            const e = [], n = t.getAttribute("position");
            if (void 0 === n) return console.error("THREE.BufferGeometryUtils.toTrianglesDrawMode(): Undefined position attribute. Processing not possible."), 
            t;
            for (let t = 0; t < n.count; t++) e.push(t);
            t.setIndex(e), i = t.getIndex();
        }
        const n = i.count - 2, r = [];
        if (2 === e) for (let t = 1; t <= n; t++) r.push(i.getX(0)), r.push(i.getX(t)), 
        r.push(i.getX(t + 1)); else for (let t = 0; t < n; t++) t % 2 == 0 ? (r.push(i.getX(t)), 
        r.push(i.getX(t + 1)), r.push(i.getX(t + 2))) : (r.push(i.getX(t + 2)), r.push(i.getX(t + 1)), 
        r.push(i.getX(t)));
        r.length / 3 !== n && console.error("THREE.BufferGeometryUtils.toTrianglesDrawMode(): Unable to generate correct amount of triangles.");
        const s = t.clone();
        return s.setIndex(r), s.clearGroups(), s;
    }
    return console.error("THREE.BufferGeometryUtils.toTrianglesDrawMode(): Unknown draw mode:", e), 
    t;
}

class Rl extends fa {
    constructor(t) {
        super(t), this.dracoLoader = null, this.ktx2Loader = null, this.meshoptDecoder = null, 
        this.pluginCallbacks = [], this.register((function(t) {
            return new Bl(t);
        })), this.register((function(t) {
            return new Vl(t);
        })), this.register((function(t) {
            return new Wl(t);
        })), this.register((function(t) {
            return new jl(t);
        })), this.register((function(t) {
            return new Fl(t);
        })), this.register((function(t) {
            return new kl(t);
        })), this.register((function(t) {
            return new Hl(t);
        })), this.register((function(t) {
            return new zl(t);
        })), this.register((function(t) {
            return new Nl(t);
        })), this.register((function(t) {
            return new Gl(t);
        })), this.register((function(t) {
            return new Ol(t);
        })), this.register((function(t) {
            return new Il(t);
        })), this.register((function(t) {
            return new Xl(t);
        })), this.register((function(t) {
            return new ql(t);
        }));
    }
    load(t, e, i, n) {
        const r = this;
        let s;
        s = "" !== this.resourcePath ? this.resourcePath : "" !== this.path ? this.path : Na.extractUrlBase(t), 
        this.manager.itemStart(t);
        const a = function(e) {
            n ? n(e) : console.error(e), r.manager.itemError(t), r.manager.itemEnd(t);
        }, o = new _a(this.manager);
        o.setPath(this.path), o.setResponseType("arraybuffer"), o.setRequestHeader(this.requestHeader), 
        o.setWithCredentials(this.withCredentials), o.load(t, (function(i) {
            try {
                r.parse(i, s, (function(i) {
                    e(i), r.manager.itemEnd(t);
                }), a);
            } catch (t) {
                a(t);
            }
        }), i, a);
    }
    setDRACOLoader(t) {
        return this.dracoLoader = t, this;
    }
    setDDSLoader() {
        throw new Error('THREE.GLTFLoader: "MSFT_texture_dds" no longer supported. Please update to "KHR_texture_basisu".');
    }
    setKTX2Loader(t) {
        return this.ktx2Loader = t, this;
    }
    setMeshoptDecoder(t) {
        return this.meshoptDecoder = t, this;
    }
    register(t) {
        return -1 === this.pluginCallbacks.indexOf(t) && this.pluginCallbacks.push(t), this;
    }
    unregister(t) {
        return -1 !== this.pluginCallbacks.indexOf(t) && this.pluginCallbacks.splice(this.pluginCallbacks.indexOf(t), 1), 
        this;
    }
    parse(t, e, i, n) {
        let r;
        const s = {}, a = {}, o = new TextDecoder;
        if ("string" == typeof t) r = JSON.parse(t); else if (t instanceof ArrayBuffer) {
            if (o.decode(new Uint8Array(t, 0, 4)) === Kl) {
                try {
                    s[Dl.KHR_BINARY_GLTF] = new Jl(t);
                } catch (t) {
                    return void (n && n(t));
                }
                r = JSON.parse(s[Dl.KHR_BINARY_GLTF].content);
            } else r = JSON.parse(o.decode(t));
        } else r = t;
        if (void 0 === r.asset || r.asset.version[0] < 2) return void (n && n(new Error("THREE.GLTFLoader: Unsupported asset. glTF versions >=2.0 are supported.")));
        const l = new Sh(r, {
            path: e || this.resourcePath || "",
            crossOrigin: this.crossOrigin,
            requestHeader: this.requestHeader,
            manager: this.manager,
            ktx2Loader: this.ktx2Loader,
            meshoptDecoder: this.meshoptDecoder
        });
        l.fileLoader.setRequestHeader(this.requestHeader);
        for (let t = 0; t < this.pluginCallbacks.length; t++) {
            const e = this.pluginCallbacks[t](l);
            a[e.name] = e, s[e.name] = !0;
        }
        if (r.extensionsUsed) for (let t = 0; t < r.extensionsUsed.length; ++t) {
            const e = r.extensionsUsed[t], i = r.extensionsRequired || [];
            switch (e) {
              case Dl.KHR_MATERIALS_UNLIT:
                s[e] = new Ul;
                break;

              case Dl.KHR_DRACO_MESH_COMPRESSION:
                s[e] = new Ql(r, this.dracoLoader);
                break;

              case Dl.KHR_TEXTURE_TRANSFORM:
                s[e] = new $l;
                break;

              case Dl.KHR_MESH_QUANTIZATION:
                s[e] = new th;
                break;

              default:
                i.indexOf(e) >= 0 && void 0 === a[e] && console.warn('THREE.GLTFLoader: Unknown extension "' + e + '".');
            }
        }
        l.setExtensions(s), l.setPlugins(a), l.parse(i, n);
    }
    parseAsync(t, e) {
        const i = this;
        return new Promise((function(n, r) {
            i.parse(t, e, n, r);
        }));
    }
}

function Ll() {
    let t = {};
    return {
        get: function(e) {
            return t[e];
        },
        add: function(e, i) {
            t[e] = i;
        },
        remove: function(e) {
            delete t[e];
        },
        removeAll: function() {
            t = {};
        }
    };
}

const Dl = {
    KHR_BINARY_GLTF: "KHR_binary_glTF",
    KHR_DRACO_MESH_COMPRESSION: "KHR_draco_mesh_compression",
    KHR_LIGHTS_PUNCTUAL: "KHR_lights_punctual",
    KHR_MATERIALS_CLEARCOAT: "KHR_materials_clearcoat",
    KHR_MATERIALS_IOR: "KHR_materials_ior",
    KHR_MATERIALS_SHEEN: "KHR_materials_sheen",
    KHR_MATERIALS_SPECULAR: "KHR_materials_specular",
    KHR_MATERIALS_TRANSMISSION: "KHR_materials_transmission",
    KHR_MATERIALS_IRIDESCENCE: "KHR_materials_iridescence",
    KHR_MATERIALS_UNLIT: "KHR_materials_unlit",
    KHR_MATERIALS_VOLUME: "KHR_materials_volume",
    KHR_TEXTURE_BASISU: "KHR_texture_basisu",
    KHR_TEXTURE_TRANSFORM: "KHR_texture_transform",
    KHR_MESH_QUANTIZATION: "KHR_mesh_quantization",
    KHR_MATERIALS_EMISSIVE_STRENGTH: "KHR_materials_emissive_strength",
    EXT_TEXTURE_WEBP: "EXT_texture_webp",
    EXT_TEXTURE_AVIF: "EXT_texture_avif",
    EXT_MESHOPT_COMPRESSION: "EXT_meshopt_compression",
    EXT_MESH_GPU_INSTANCING: "EXT_mesh_gpu_instancing"
};

class Il {
    constructor(t) {
        this.parser = t, this.name = Dl.KHR_LIGHTS_PUNCTUAL, this.cache = {
            refs: {},
            uses: {}
        };
    }
    _markDefs() {
        const t = this.parser, e = this.parser.json.nodes || [];
        for (let i = 0, n = e.length; i < n; i++) {
            const n = e[i];
            n.extensions && n.extensions[this.name] && void 0 !== n.extensions[this.name].light && t._addNodeRef(this.cache, n.extensions[this.name].light);
        }
    }
    _loadLight(t) {
        const e = this.parser, i = "light:" + t;
        let n = e.cache.get(i);
        if (n) return n;
        const r = e.json, s = ((r.extensions && r.extensions[this.name] || {}).lights || [])[t];
        let a;
        const o = new ye(16777215);
        void 0 !== s.color && o.fromArray(s.color);
        const l = void 0 !== s.range ? s.range : 0;
        switch (s.type) {
          case "directional":
            a = new Ua(o), a.target.position.set(0, 0, -1), a.add(a.target);
            break;

          case "point":
            a = new Da(o), a.distance = l;
            break;

          case "spot":
            a = new Aa(o), a.distance = l, s.spot = s.spot || {}, s.spot.innerConeAngle = void 0 !== s.spot.innerConeAngle ? s.spot.innerConeAngle : 0, 
            s.spot.outerConeAngle = void 0 !== s.spot.outerConeAngle ? s.spot.outerConeAngle : Math.PI / 4, 
            a.angle = s.spot.outerConeAngle, a.penumbra = 1 - s.spot.innerConeAngle / s.spot.outerConeAngle, 
            a.target.position.set(0, 0, -1), a.add(a.target);
            break;

          default:
            throw new Error("THREE.GLTFLoader: Unexpected light type: " + s.type);
        }
        return a.position.set(0, 0, 0), a.decay = 2, mh(a, s), void 0 !== s.intensity && (a.intensity = s.intensity), 
        a.name = e.createUniqueName(s.name || "light_" + t), n = Promise.resolve(a), e.cache.add(i, n), 
        n;
    }
    getDependency(t, e) {
        if ("light" === t) return this._loadLight(e);
    }
    createNodeAttachment(t) {
        const e = this, i = this.parser, n = i.json.nodes[t], r = (n.extensions && n.extensions[this.name] || {}).light;
        return void 0 === r ? null : this._loadLight(r).then((function(t) {
            return i._getNodeRef(e.cache, r, t);
        }));
    }
}

class Ul {
    constructor() {
        this.name = Dl.KHR_MATERIALS_UNLIT;
    }
    getMaterialType() {
        return Se;
    }
    extendParams(t, e, i) {
        const n = [];
        t.color = new ye(1, 1, 1), t.opacity = 1;
        const r = e.pbrMetallicRoughness;
        if (r) {
            if (Array.isArray(r.baseColorFactor)) {
                const e = r.baseColorFactor;
                t.color.fromArray(e), t.opacity = e[3];
            }
            void 0 !== r.baseColorTexture && n.push(i.assignTexture(t, "map", r.baseColorTexture, "srgb"));
        }
        return Promise.all(n);
    }
}

class Nl {
    constructor(t) {
        this.parser = t, this.name = Dl.KHR_MATERIALS_EMISSIVE_STRENGTH;
    }
    extendMaterialParams(t, e) {
        const i = this.parser.json.materials[t];
        if (!i.extensions || !i.extensions[this.name]) return Promise.resolve();
        const n = i.extensions[this.name].emissiveStrength;
        return void 0 !== n && (e.emissiveIntensity = n), Promise.resolve();
    }
}

class Bl {
    constructor(t) {
        this.parser = t, this.name = Dl.KHR_MATERIALS_CLEARCOAT;
    }
    getMaterialType(t) {
        const e = this.parser.json.materials[t];
        return e.extensions && e.extensions[this.name] ? js : null;
    }
    extendMaterialParams(t, e) {
        const i = this.parser, n = i.json.materials[t];
        if (!n.extensions || !n.extensions[this.name]) return Promise.resolve();
        const r = [], s = n.extensions[this.name];
        if (void 0 !== s.clearcoatFactor && (e.clearcoat = s.clearcoatFactor), void 0 !== s.clearcoatTexture && r.push(i.assignTexture(e, "clearcoatMap", s.clearcoatTexture)), 
        void 0 !== s.clearcoatRoughnessFactor && (e.clearcoatRoughness = s.clearcoatRoughnessFactor), 
        void 0 !== s.clearcoatRoughnessTexture && r.push(i.assignTexture(e, "clearcoatRoughnessMap", s.clearcoatRoughnessTexture)), 
        void 0 !== s.clearcoatNormalTexture && (r.push(i.assignTexture(e, "clearcoatNormalMap", s.clearcoatNormalTexture)), 
        void 0 !== s.clearcoatNormalTexture.scale)) {
            const t = s.clearcoatNormalTexture.scale;
            e.clearcoatNormalScale = new P(t, t);
        }
        return Promise.all(r);
    }
}

class Ol {
    constructor(t) {
        this.parser = t, this.name = Dl.KHR_MATERIALS_IRIDESCENCE;
    }
    getMaterialType(t) {
        const e = this.parser.json.materials[t];
        return e.extensions && e.extensions[this.name] ? js : null;
    }
    extendMaterialParams(t, e) {
        const i = this.parser, n = i.json.materials[t];
        if (!n.extensions || !n.extensions[this.name]) return Promise.resolve();
        const r = [], s = n.extensions[this.name];
        return void 0 !== s.iridescenceFactor && (e.iridescence = s.iridescenceFactor), 
        void 0 !== s.iridescenceTexture && r.push(i.assignTexture(e, "iridescenceMap", s.iridescenceTexture)), 
        void 0 !== s.iridescenceIor && (e.iridescenceIOR = s.iridescenceIor), void 0 === e.iridescenceThicknessRange && (e.iridescenceThicknessRange = [ 100, 400 ]), 
        void 0 !== s.iridescenceThicknessMinimum && (e.iridescenceThicknessRange[0] = s.iridescenceThicknessMinimum), 
        void 0 !== s.iridescenceThicknessMaximum && (e.iridescenceThicknessRange[1] = s.iridescenceThicknessMaximum), 
        void 0 !== s.iridescenceThicknessTexture && r.push(i.assignTexture(e, "iridescenceThicknessMap", s.iridescenceThicknessTexture)), 
        Promise.all(r);
    }
}

class Fl {
    constructor(t) {
        this.parser = t, this.name = Dl.KHR_MATERIALS_SHEEN;
    }
    getMaterialType(t) {
        const e = this.parser.json.materials[t];
        return e.extensions && e.extensions[this.name] ? js : null;
    }
    extendMaterialParams(t, e) {
        const i = this.parser, n = i.json.materials[t];
        if (!n.extensions || !n.extensions[this.name]) return Promise.resolve();
        const r = [];
        e.sheenColor = new ye(0, 0, 0), e.sheenRoughness = 0, e.sheen = 1;
        const s = n.extensions[this.name];
        return void 0 !== s.sheenColorFactor && e.sheenColor.fromArray(s.sheenColorFactor), 
        void 0 !== s.sheenRoughnessFactor && (e.sheenRoughness = s.sheenRoughnessFactor), 
        void 0 !== s.sheenColorTexture && r.push(i.assignTexture(e, "sheenColorMap", s.sheenColorTexture, "srgb")), 
        void 0 !== s.sheenRoughnessTexture && r.push(i.assignTexture(e, "sheenRoughnessMap", s.sheenRoughnessTexture)), 
        Promise.all(r);
    }
}

class kl {
    constructor(t) {
        this.parser = t, this.name = Dl.KHR_MATERIALS_TRANSMISSION;
    }
    getMaterialType(t) {
        const e = this.parser.json.materials[t];
        return e.extensions && e.extensions[this.name] ? js : null;
    }
    extendMaterialParams(t, e) {
        const i = this.parser, n = i.json.materials[t];
        if (!n.extensions || !n.extensions[this.name]) return Promise.resolve();
        const r = [], s = n.extensions[this.name];
        return void 0 !== s.transmissionFactor && (e.transmission = s.transmissionFactor), 
        void 0 !== s.transmissionTexture && r.push(i.assignTexture(e, "transmissionMap", s.transmissionTexture)), 
        Promise.all(r);
    }
}

class Hl {
    constructor(t) {
        this.parser = t, this.name = Dl.KHR_MATERIALS_VOLUME;
    }
    getMaterialType(t) {
        const e = this.parser.json.materials[t];
        return e.extensions && e.extensions[this.name] ? js : null;
    }
    extendMaterialParams(t, e) {
        const i = this.parser, n = i.json.materials[t];
        if (!n.extensions || !n.extensions[this.name]) return Promise.resolve();
        const r = [], s = n.extensions[this.name];
        e.thickness = void 0 !== s.thicknessFactor ? s.thicknessFactor : 0, void 0 !== s.thicknessTexture && r.push(i.assignTexture(e, "thicknessMap", s.thicknessTexture)), 
        e.attenuationDistance = s.attenuationDistance || 1 / 0;
        const a = s.attenuationColor || [ 1, 1, 1 ];
        return e.attenuationColor = new ye(a[0], a[1], a[2]), Promise.all(r);
    }
}

class zl {
    constructor(t) {
        this.parser = t, this.name = Dl.KHR_MATERIALS_IOR;
    }
    getMaterialType(t) {
        const e = this.parser.json.materials[t];
        return e.extensions && e.extensions[this.name] ? js : null;
    }
    extendMaterialParams(t, e) {
        const i = this.parser.json.materials[t];
        if (!i.extensions || !i.extensions[this.name]) return Promise.resolve();
        const n = i.extensions[this.name];
        return e.ior = void 0 !== n.ior ? n.ior : 1.5, Promise.resolve();
    }
}

class Gl {
    constructor(t) {
        this.parser = t, this.name = Dl.KHR_MATERIALS_SPECULAR;
    }
    getMaterialType(t) {
        const e = this.parser.json.materials[t];
        return e.extensions && e.extensions[this.name] ? js : null;
    }
    extendMaterialParams(t, e) {
        const i = this.parser, n = i.json.materials[t];
        if (!n.extensions || !n.extensions[this.name]) return Promise.resolve();
        const r = [], s = n.extensions[this.name];
        e.specularIntensity = void 0 !== s.specularFactor ? s.specularFactor : 1, void 0 !== s.specularTexture && r.push(i.assignTexture(e, "specularIntensityMap", s.specularTexture));
        const a = s.specularColorFactor || [ 1, 1, 1 ];
        return e.specularColor = new ye(a[0], a[1], a[2]), void 0 !== s.specularColorTexture && r.push(i.assignTexture(e, "specularColorMap", s.specularColorTexture, "srgb")), 
        Promise.all(r);
    }
}

class Vl {
    constructor(t) {
        this.parser = t, this.name = Dl.KHR_TEXTURE_BASISU;
    }
    loadTexture(t) {
        const e = this.parser, i = e.json, n = i.textures[t];
        if (!n.extensions || !n.extensions[this.name]) return null;
        const r = n.extensions[this.name], s = e.options.ktx2Loader;
        if (!s) {
            if (i.extensionsRequired && i.extensionsRequired.indexOf(this.name) >= 0) throw new Error("THREE.GLTFLoader: setKTX2Loader must be called before loading KTX2 textures");
            return null;
        }
        return e.loadTextureImage(t, r.source, s);
    }
}

class Wl {
    constructor(t) {
        this.parser = t, this.name = Dl.EXT_TEXTURE_WEBP, this.isSupported = null;
    }
    loadTexture(t) {
        const e = this.name, i = this.parser, n = i.json, r = n.textures[t];
        if (!r.extensions || !r.extensions[e]) return null;
        const s = r.extensions[e], a = n.images[s.source];
        let o = i.textureLoader;
        if (a.uri) {
            const t = i.options.manager.getHandler(a.uri);
            null !== t && (o = t);
        }
        return this.detectSupport().then((function(r) {
            if (r) return i.loadTextureImage(t, s.source, o);
            if (n.extensionsRequired && n.extensionsRequired.indexOf(e) >= 0) throw new Error("THREE.GLTFLoader: WebP required by asset but unsupported.");
            return i.loadTexture(t);
        }));
    }
    detectSupport() {
        return this.isSupported || (this.isSupported = new Promise((function(t) {
            const e = new Image;
            e.src = "data:image/webp;base64,UklGRiIAAABXRUJQVlA4IBYAAAAwAQCdASoBAAEADsD+JaQAA3AAAAAA", 
            e.onload = e.onerror = function() {
                t(1 === e.height);
            };
        }))), this.isSupported;
    }
}

class jl {
    constructor(t) {
        this.parser = t, this.name = Dl.EXT_TEXTURE_AVIF, this.isSupported = null;
    }
    loadTexture(t) {
        const e = this.name, i = this.parser, n = i.json, r = n.textures[t];
        if (!r.extensions || !r.extensions[e]) return null;
        const s = r.extensions[e], a = n.images[s.source];
        let o = i.textureLoader;
        if (a.uri) {
            const t = i.options.manager.getHandler(a.uri);
            null !== t && (o = t);
        }
        return this.detectSupport().then((function(r) {
            if (r) return i.loadTextureImage(t, s.source, o);
            if (n.extensionsRequired && n.extensionsRequired.indexOf(e) >= 0) throw new Error("THREE.GLTFLoader: AVIF required by asset but unsupported.");
            return i.loadTexture(t);
        }));
    }
    detectSupport() {
        return this.isSupported || (this.isSupported = new Promise((function(t) {
            const e = new Image;
            e.src = "data:image/avif;base64,AAAAIGZ0eXBhdmlmAAAAAGF2aWZtaWYxbWlhZk1BMUIAAADybWV0YQAAAAAAAAAoaGRscgAAAAAAAAAAcGljdAAAAAAAAAAAAAAAAGxpYmF2aWYAAAAADnBpdG0AAAAAAAEAAAAeaWxvYwAAAABEAAABAAEAAAABAAABGgAAABcAAAAoaWluZgAAAAAAAQAAABppbmZlAgAAAAABAABhdjAxQ29sb3IAAAAAamlwcnAAAABLaXBjbwAAABRpc3BlAAAAAAAAAAEAAAABAAAAEHBpeGkAAAAAAwgICAAAAAxhdjFDgQAMAAAAABNjb2xybmNseAACAAIABoAAAAAXaXBtYQAAAAAAAAABAAEEAQKDBAAAAB9tZGF0EgAKCBgABogQEDQgMgkQAAAAB8dSLfI=", 
            e.onload = e.onerror = function() {
                t(1 === e.height);
            };
        }))), this.isSupported;
    }
}

class Xl {
    constructor(t) {
        this.name = Dl.EXT_MESHOPT_COMPRESSION, this.parser = t;
    }
    loadBufferView(t) {
        const e = this.parser.json, i = e.bufferViews[t];
        if (i.extensions && i.extensions[this.name]) {
            const t = i.extensions[this.name], n = this.parser.getDependency("buffer", t.buffer), r = this.parser.options.meshoptDecoder;
            if (!r || !r.supported) {
                if (e.extensionsRequired && e.extensionsRequired.indexOf(this.name) >= 0) throw new Error("THREE.GLTFLoader: setMeshoptDecoder must be called before loading compressed files");
                return null;
            }
            return n.then((function(e) {
                const i = t.byteOffset || 0, n = t.byteLength || 0, s = t.count, a = t.byteStride, o = new Uint8Array(e, i, n);
                return r.decodeGltfBufferAsync ? r.decodeGltfBufferAsync(s, a, o, t.mode, t.filter).then((function(t) {
                    return t.buffer;
                })) : r.ready.then((function() {
                    const e = new ArrayBuffer(s * a);
                    return r.decodeGltfBuffer(new Uint8Array(e), s, a, o, t.mode, t.filter), e;
                }));
            }));
        }
        return null;
    }
}

class ql {
    constructor(t) {
        this.name = Dl.EXT_MESH_GPU_INSTANCING, this.parser = t;
    }
    createNodeMesh(t) {
        const e = this.parser.json, i = e.nodes[t];
        if (!i.extensions || !i.extensions[this.name] || void 0 === i.mesh) return null;
        const n = e.meshes[i.mesh];
        for (const t of n.primitives) if (t.mode !== rh.TRIANGLES && t.mode !== rh.TRIANGLE_STRIP && t.mode !== rh.TRIANGLE_FAN && void 0 !== t.mode) return null;
        const r = i.extensions[this.name].attributes, s = [], a = {};
        for (const t in r) s.push(this.parser.getDependency("accessor", r[t]).then((e => (a[t] = e, 
        a[t]))));
        return s.length < 1 ? null : (s.push(this.parser.createNodeMesh(t)), Promise.all(s).then((t => {
            const e = t.pop(), i = e.isGroup ? e.children : [ e ], n = t[0].count, r = [];
            for (const t of i) {
                const e = new Rt, i = new tt, s = new $, o = new tt(1, 1, 1), l = new Ms(t.geometry, t.material, n);
                for (let t = 0; t < n; t++) a.TRANSLATION && i.fromBufferAttribute(a.TRANSLATION, t), 
                a.ROTATION && s.fromBufferAttribute(a.ROTATION, t), a.SCALE && o.fromBufferAttribute(a.SCALE, t), 
                l.setMatrixAt(t, e.compose(i, s, o));
                for (const e in a) "TRANSLATION" !== e && "ROTATION" !== e && "SCALE" !== e && t.geometry.setAttribute(e, a[e]);
                ee.prototype.copy.call(l, t), this.parser.assignFinalMaterial(l), r.push(l);
            }
            return e.isGroup ? (e.clear(), e.add(...r), e) : r[0];
        })));
    }
}

const Kl = "glTF", Yl = 1313821514, Zl = 5130562;

class Jl {
    constructor(t) {
        this.name = Dl.KHR_BINARY_GLTF, this.content = null, this.body = null;
        const e = new DataView(t, 0, 12), i = new TextDecoder;
        if (this.header = {
            magic: i.decode(new Uint8Array(t.slice(0, 4))),
            version: e.getUint32(4, !0),
            length: e.getUint32(8, !0)
        }, this.header.magic !== Kl) throw new Error("THREE.GLTFLoader: Unsupported glTF-Binary header.");
        if (this.header.version < 2) throw new Error("THREE.GLTFLoader: Legacy binary file detected.");
        const n = this.header.length - 12, r = new DataView(t, 12);
        let s = 0;
        for (;s < n; ) {
            const e = r.getUint32(s, !0);
            s += 4;
            const n = r.getUint32(s, !0);
            if (s += 4, n === Yl) {
                const n = new Uint8Array(t, 12 + s, e);
                this.content = i.decode(n);
            } else if (n === Zl) {
                const i = 12 + s;
                this.body = t.slice(i, i + e);
            }
            s += e;
        }
        if (null === this.content) throw new Error("THREE.GLTFLoader: JSON content not found.");
    }
}

class Ql {
    constructor(t, e) {
        if (!e) throw new Error("THREE.GLTFLoader: No DRACOLoader instance provided.");
        this.name = Dl.KHR_DRACO_MESH_COMPRESSION, this.json = t, this.dracoLoader = e, 
        this.dracoLoader.preload();
    }
    decodePrimitive(t, e) {
        const i = this.json, n = this.dracoLoader, r = t.extensions[this.name].bufferView, s = t.extensions[this.name].attributes, a = {}, o = {}, l = {};
        for (const t in s) {
            const e = hh[t] || t.toLowerCase();
            a[e] = s[t];
        }
        for (const e in t.attributes) {
            const n = hh[e] || e.toLowerCase();
            if (void 0 !== s[e]) {
                const r = i.accessors[t.attributes[e]], s = sh[r.componentType];
                l[n] = s.name, o[n] = !0 === r.normalized;
            }
        }
        return e.getDependency("bufferView", r).then((function(t) {
            return new Promise((function(e) {
                n.decodeDracoFile(t, (function(t) {
                    for (const e in t.attributes) {
                        const i = t.attributes[e], n = o[e];
                        void 0 !== n && (i.normalized = n);
                    }
                    e(t);
                }), a, l);
            }));
        }));
    }
}

class $l {
    constructor() {
        this.name = Dl.KHR_TEXTURE_TRANSFORM;
    }
    extendTexture(t, e) {
        return void 0 !== e.texCoord && e.texCoord !== t.channel || void 0 !== e.offset || void 0 !== e.rotation || void 0 !== e.scale ? (t = t.clone(), 
        void 0 !== e.texCoord && (t.channel = e.texCoord), void 0 !== e.offset && t.offset.fromArray(e.offset), 
        void 0 !== e.rotation && (t.rotation = e.rotation), void 0 !== e.scale && t.repeat.fromArray(e.scale), 
        t.needsUpdate = !0, t) : t;
    }
}

class th {
    constructor() {
        this.name = Dl.KHR_MESH_QUANTIZATION;
    }
}

class eh extends Qs {
    constructor(t, e, i, n) {
        super(t, e, i, n);
    }
    copySampleValue_(t) {
        const e = this.resultBuffer, i = this.sampleValues, n = this.valueSize, r = t * n * 3 + n;
        for (let t = 0; t !== n; t++) e[t] = i[r + t];
        return e;
    }
    interpolate_(t, e, i, n) {
        const r = this.resultBuffer, s = this.sampleValues, a = this.valueSize, o = 2 * a, l = 3 * a, h = n - e, c = (i - e) / h, d = c * c, u = d * c, p = t * l, g = p - l, f = -2 * u + 3 * d, m = u - d, v = 1 - f, _ = m - d + c;
        for (let t = 0; t !== a; t++) {
            const e = s[g + t + a], i = s[g + t + o] * h, n = s[p + t + a], l = s[p + t] * h;
            r[t] = v * e + _ * i + f * n + m * l;
        }
        return r;
    }
}

const ih = new $;

class nh extends eh {
    interpolate_(t, e, i, n) {
        const r = super.interpolate_(t, e, i, n);
        return ih.fromArray(r).normalize().toArray(r), r;
    }
}

const rh = {
    FLOAT: 5126,
    FLOAT_MAT3: 35675,
    FLOAT_MAT4: 35676,
    FLOAT_VEC2: 35664,
    FLOAT_VEC3: 35665,
    FLOAT_VEC4: 35666,
    LINEAR: 9729,
    REPEAT: 10497,
    SAMPLER_2D: 35678,
    POINTS: 0,
    LINES: 1,
    LINE_LOOP: 2,
    LINE_STRIP: 3,
    TRIANGLES: 4,
    TRIANGLE_STRIP: 5,
    TRIANGLE_FAN: 6,
    UNSIGNED_BYTE: 5121,
    UNSIGNED_SHORT: 5123
}, sh = {
    5120: Int8Array,
    5121: Uint8Array,
    5122: Int16Array,
    5123: Uint16Array,
    5125: Uint32Array,
    5126: Float32Array
}, ah = {
    9728: 1003,
    9729: 1006,
    9984: 1004,
    9985: 1007,
    9986: 1005,
    9987: 1008
}, oh = {
    33071: 1001,
    33648: 1002,
    10497: 1e3
}, lh = {
    SCALAR: 1,
    VEC2: 2,
    VEC3: 3,
    VEC4: 4,
    MAT2: 4,
    MAT3: 9,
    MAT4: 16
}, hh = {
    POSITION: "position",
    NORMAL: "normal",
    TANGENT: "tangent",
    TEXCOORD_0: "uv",
    TEXCOORD_1: "uv1",
    TEXCOORD_2: "uv2",
    TEXCOORD_3: "uv3",
    COLOR_0: "color",
    WEIGHTS_0: "skinWeight",
    JOINTS_0: "skinIndex"
}, ch = {
    scale: "scale",
    translation: "position",
    rotation: "quaternion",
    weights: "morphTargetInfluences"
}, dh = {
    CUBICSPLINE: void 0,
    LINEAR: 2301,
    STEP: 2300
}, uh = "OPAQUE", ph = "MASK", gh = "BLEND";

function fh(t, e, i) {
    for (const n in i.extensions) void 0 === t[n] && (e.userData.gltfExtensions = e.userData.gltfExtensions || {}, 
    e.userData.gltfExtensions[n] = i.extensions[n]);
}

function mh(t, e) {
    void 0 !== e.extras && ("object" == typeof e.extras ? Object.assign(t.userData, e.extras) : console.warn("THREE.GLTFLoader: Ignoring primitive type .extras, " + e.extras));
}

function vh(t, e) {
    if (t.updateMorphTargets(), void 0 !== e.weights) for (let i = 0, n = e.weights.length; i < n; i++) t.morphTargetInfluences[i] = e.weights[i];
    if (e.extras && Array.isArray(e.extras.targetNames)) {
        const i = e.extras.targetNames;
        if (t.morphTargetInfluences.length === i.length) {
            t.morphTargetDictionary = {};
            for (let e = 0, n = i.length; e < n; e++) t.morphTargetDictionary[i[e]] = e;
        } else console.warn("THREE.GLTFLoader: Invalid extras.targetNames length. Ignoring names.");
    }
}

function _h(t) {
    const e = t.extensions && t.extensions[Dl.KHR_DRACO_MESH_COMPRESSION];
    let i;
    return i = e ? "draco:" + e.bufferView + ":" + e.indices + ":" + xh(e.attributes) : t.indices + ":" + xh(t.attributes) + ":" + t.mode, 
    i;
}

function xh(t) {
    let e = "";
    const i = Object.keys(t).sort();
    for (let n = 0, r = i.length; n < r; n++) e += i[n] + ":" + t[i[n]] + ";";
    return e;
}

function yh(t) {
    switch (t) {
      case Int8Array:
        return 1 / 127;

      case Uint8Array:
        return 1 / 255;

      case Int16Array:
        return 1 / 32767;

      case Uint16Array:
        return 1 / 65535;

      default:
        throw new Error("THREE.GLTFLoader: Unsupported normalized accessor component type.");
    }
}

const bh = new Rt;

class Sh {
    constructor(t = {}, e = {}) {
        this.json = t, this.extensions = {}, this.plugins = {}, this.options = e, this.cache = new Ll, 
        this.associations = new Map, this.primitiveCache = {}, this.nodeCache = {}, this.meshCache = {
            refs: {},
            uses: {}
        }, this.cameraCache = {
            refs: {},
            uses: {}
        }, this.lightCache = {
            refs: {},
            uses: {}
        }, this.sourceCache = {}, this.textureCache = {}, this.nodeNamesUsed = {};
        let i = !1, n = !1, r = -1;
        "undefined" != typeof navigator && (i = !0 === /^((?!chrome|android).)*safari/i.test(navigator.userAgent), 
        n = navigator.userAgent.indexOf("Firefox") > -1, r = n ? navigator.userAgent.match(/Firefox\/([0-9]+)\./)[1] : -1), 
        "undefined" == typeof createImageBitmap || i || n && r < 98 ? this.textureLoader = new ya(this.options.manager) : this.textureLoader = new Ba(this.options.manager), 
        this.textureLoader.setCrossOrigin(this.options.crossOrigin), this.textureLoader.setRequestHeader(this.options.requestHeader), 
        this.fileLoader = new _a(this.options.manager), this.fileLoader.setResponseType("arraybuffer"), 
        "use-credentials" === this.options.crossOrigin && this.fileLoader.setWithCredentials(!0);
    }
    setExtensions(t) {
        this.extensions = t;
    }
    setPlugins(t) {
        this.plugins = t;
    }
    parse(t, e) {
        const i = this, n = this.json, r = this.extensions;
        this.cache.removeAll(), this.nodeCache = {}, this._invokeAll((function(t) {
            return t._markDefs && t._markDefs();
        })), Promise.all(this._invokeAll((function(t) {
            return t.beforeRoot && t.beforeRoot();
        }))).then((function() {
            return Promise.all([ i.getDependencies("scene"), i.getDependencies("animation"), i.getDependencies("camera") ]);
        })).then((function(e) {
            const s = {
                scene: e[0][n.scene || 0],
                scenes: e[0],
                animations: e[1],
                cameras: e[2],
                asset: n.asset,
                parser: i,
                userData: {}
            };
            fh(r, s, n), mh(s, n), Promise.all(i._invokeAll((function(t) {
                return t.afterRoot && t.afterRoot(s);
            }))).then((function() {
                t(s);
            }));
        })).catch(e);
    }
    _markDefs() {
        const t = this.json.nodes || [], e = this.json.skins || [], i = this.json.meshes || [];
        for (let i = 0, n = e.length; i < n; i++) {
            const n = e[i].joints;
            for (let e = 0, i = n.length; e < i; e++) t[n[e]].isBone = !0;
        }
        for (let e = 0, n = t.length; e < n; e++) {
            const n = t[e];
            void 0 !== n.mesh && (this._addNodeRef(this.meshCache, n.mesh), void 0 !== n.skin && (i[n.mesh].isSkinnedMesh = !0)), 
            void 0 !== n.camera && this._addNodeRef(this.cameraCache, n.camera);
        }
    }
    _addNodeRef(t, e) {
        void 0 !== e && (void 0 === t.refs[e] && (t.refs[e] = t.uses[e] = 0), t.refs[e]++);
    }
    _getNodeRef(t, e, i) {
        if (t.refs[e] <= 1) return i;
        const n = i.clone(), r = (t, e) => {
            const i = this.associations.get(t);
            null != i && this.associations.set(e, i);
            for (const [i, n] of t.children.entries()) r(n, e.children[i]);
        };
        return r(i, n), n.name += "_instance_" + t.uses[e]++, n;
    }
    _invokeOne(t) {
        const e = Object.values(this.plugins);
        e.push(this);
        for (let i = 0; i < e.length; i++) {
            const n = t(e[i]);
            if (n) return n;
        }
        return null;
    }
    _invokeAll(t) {
        const e = Object.values(this.plugins);
        e.unshift(this);
        const i = [];
        for (let n = 0; n < e.length; n++) {
            const r = t(e[n]);
            r && i.push(r);
        }
        return i;
    }
    getDependency(t, e) {
        const i = t + ":" + e;
        let n = this.cache.get(i);
        if (!n) {
            switch (t) {
              case "scene":
                n = this.loadScene(e);
                break;

              case "node":
                n = this._invokeOne((function(t) {
                    return t.loadNode && t.loadNode(e);
                }));
                break;

              case "mesh":
                n = this._invokeOne((function(t) {
                    return t.loadMesh && t.loadMesh(e);
                }));
                break;

              case "accessor":
                n = this.loadAccessor(e);
                break;

              case "bufferView":
                n = this._invokeOne((function(t) {
                    return t.loadBufferView && t.loadBufferView(e);
                }));
                break;

              case "buffer":
                n = this.loadBuffer(e);
                break;

              case "material":
                n = this._invokeOne((function(t) {
                    return t.loadMaterial && t.loadMaterial(e);
                }));
                break;

              case "texture":
                n = this._invokeOne((function(t) {
                    return t.loadTexture && t.loadTexture(e);
                }));
                break;

              case "skin":
                n = this.loadSkin(e);
                break;

              case "animation":
                n = this._invokeOne((function(t) {
                    return t.loadAnimation && t.loadAnimation(e);
                }));
                break;

              case "camera":
                n = this.loadCamera(e);
                break;

              default:
                if (n = this._invokeOne((function(i) {
                    return i != this && i.getDependency && i.getDependency(t, e);
                })), !n) throw new Error("Unknown type: " + t);
            }
            this.cache.add(i, n);
        }
        return n;
    }
    getDependencies(t) {
        let e = this.cache.get(t);
        if (!e) {
            const i = this, n = this.json[t + ("mesh" === t ? "es" : "s")] || [];
            e = Promise.all(n.map((function(e, n) {
                return i.getDependency(t, n);
            }))), this.cache.add(t, e);
        }
        return e;
    }
    loadBuffer(t) {
        const e = this.json.buffers[t], i = this.fileLoader;
        if (e.type && "arraybuffer" !== e.type) throw new Error("THREE.GLTFLoader: " + e.type + " buffer type is not supported.");
        if (void 0 === e.uri && 0 === t) return Promise.resolve(this.extensions[Dl.KHR_BINARY_GLTF].body);
        const n = this.options;
        return new Promise((function(t, r) {
            i.load(Na.resolveURL(e.uri, n.path), t, void 0, (function() {
                r(new Error('THREE.GLTFLoader: Failed to load buffer "' + e.uri + '".'));
            }));
        }));
    }
    loadBufferView(t) {
        const e = this.json.bufferViews[t];
        return this.getDependency("buffer", e.buffer).then((function(t) {
            const i = e.byteLength || 0, n = e.byteOffset || 0;
            return t.slice(n, n + i);
        }));
    }
    loadAccessor(t) {
        const e = this, i = this.json, n = this.json.accessors[t];
        if (void 0 === n.bufferView && void 0 === n.sparse) {
            const t = lh[n.type], e = sh[n.componentType], i = !0 === n.normalized, r = new e(n.count * t);
            return Promise.resolve(new Te(r, t, i));
        }
        const r = [];
        return void 0 !== n.bufferView ? r.push(this.getDependency("bufferView", n.bufferView)) : r.push(null), 
        void 0 !== n.sparse && (r.push(this.getDependency("bufferView", n.sparse.indices.bufferView)), 
        r.push(this.getDependency("bufferView", n.sparse.values.bufferView))), Promise.all(r).then((function(t) {
            const r = t[0], s = lh[n.type], a = sh[n.componentType], o = a.BYTES_PER_ELEMENT, l = o * s, h = n.byteOffset || 0, c = void 0 !== n.bufferView ? i.bufferViews[n.bufferView].byteStride : void 0, d = !0 === n.normalized;
            let u, p;
            if (c && c !== l) {
                const t = Math.floor(h / c), i = "InterleavedBuffer:" + n.bufferView + ":" + n.componentType + ":" + t + ":" + n.count;
                let l = e.cache.get(i);
                l || (u = new a(r, t * c, n.count * c / o), l = new es(u, c / o), e.cache.add(i, l)), 
                p = new ns(l, s, h % c / o, d);
            } else u = null === r ? new a(n.count * s) : new a(r, h, n.count * s), p = new Te(u, s, d);
            if (void 0 !== n.sparse) {
                const e = lh.SCALAR, i = sh[n.sparse.indices.componentType], o = n.sparse.indices.byteOffset || 0, l = n.sparse.values.byteOffset || 0, h = new i(t[1], o, n.sparse.count * e), c = new a(t[2], l, n.sparse.count * s);
                null !== r && (p = new Te(p.array.slice(), p.itemSize, p.normalized));
                for (let t = 0, e = h.length; t < e; t++) {
                    const e = h[t];
                    if (p.setX(e, c[t * s]), s >= 2 && p.setY(e, c[t * s + 1]), s >= 3 && p.setZ(e, c[t * s + 2]), 
                    s >= 4 && p.setW(e, c[t * s + 3]), s >= 5) throw new Error("THREE.GLTFLoader: Unsupported itemSize in sparse BufferAttribute.");
                }
            }
            return p;
        }));
    }
    loadTexture(t) {
        const e = this.json, i = this.options, n = e.textures[t].source, r = e.images[n];
        let s = this.textureLoader;
        if (r.uri) {
            const t = i.manager.getHandler(r.uri);
            null !== t && (s = t);
        }
        return this.loadTextureImage(t, n, s);
    }
    loadTextureImage(t, e, i) {
        const n = this, r = this.json, s = r.textures[t], a = r.images[e], o = (a.uri || a.bufferView) + ":" + s.sampler;
        if (this.textureCache[o]) return this.textureCache[o];
        const l = this.loadImageSource(e, i).then((function(e) {
            e.flipY = !1, e.name = s.name || a.name || "", "" === e.name && "string" == typeof a.uri && !1 === a.uri.startsWith("data:image/") && (e.name = a.uri);
            const i = (r.samplers || {})[s.sampler] || {};
            return e.magFilter = ah[i.magFilter] || 1006, e.minFilter = ah[i.minFilter] || 1008, 
            e.wrapS = oh[i.wrapS] || 1e3, e.wrapT = oh[i.wrapT] || 1e3, n.associations.set(e, {
                textures: t
            }), e;
        })).catch((function() {
            return null;
        }));
        return this.textureCache[o] = l, l;
    }
    loadImageSource(t, e) {
        const i = this, n = this.json, r = this.options;
        if (void 0 !== this.sourceCache[t]) return this.sourceCache[t].then((t => t.clone()));
        const s = n.images[t], a = self.URL || self.webkitURL;
        let o = s.uri || "", l = !1;
        if (void 0 !== s.bufferView) o = i.getDependency("bufferView", s.bufferView).then((function(t) {
            l = !0;
            const e = new Blob([ t ], {
                type: s.mimeType
            });
            return o = a.createObjectURL(e), o;
        })); else if (void 0 === s.uri) throw new Error("THREE.GLTFLoader: Image " + t + " is missing URI and bufferView");
        const h = Promise.resolve(o).then((function(t) {
            return new Promise((function(i, n) {
                let s = i;
                !0 === e.isImageBitmapLoader && (s = function(t) {
                    const e = new K(t);
                    e.needsUpdate = !0, i(e);
                }), e.load(Na.resolveURL(t, r.path), s, void 0, n);
            }));
        })).then((function(t) {
            var e;
            return !0 === l && a.revokeObjectURL(o), t.userData.mimeType = s.mimeType || ((e = s.uri).search(/\.jpe?g($|\?)/i) > 0 || 0 === e.search(/^data\:image\/jpeg/) ? "image/jpeg" : e.search(/\.webp($|\?)/i) > 0 || 0 === e.search(/^data\:image\/webp/) ? "image/webp" : "image/png"), 
            t;
        })).catch((function(t) {
            throw console.error("THREE.GLTFLoader: Couldn't load texture", o), t;
        }));
        return this.sourceCache[t] = h, h;
    }
    assignTexture(t, e, i, n) {
        const r = this;
        return this.getDependency("texture", i.index).then((function(s) {
            if (!s) return null;
            if (void 0 !== i.texCoord && i.texCoord > 0 && ((s = s.clone()).channel = i.texCoord), 
            r.extensions[Dl.KHR_TEXTURE_TRANSFORM]) {
                const t = void 0 !== i.extensions ? i.extensions[Dl.KHR_TEXTURE_TRANSFORM] : void 0;
                if (t) {
                    const e = r.associations.get(s);
                    s = r.extensions[Dl.KHR_TEXTURE_TRANSFORM].extendTexture(s, t), r.associations.set(s, e);
                }
            }
            return void 0 !== n && (s.colorSpace = n), t[e] = s, s;
        }));
    }
    assignFinalMaterial(t) {
        const e = t.geometry;
        let i = t.material;
        const n = void 0 === e.attributes.tangent, r = void 0 !== e.attributes.color, s = void 0 === e.attributes.normal;
        if (t.isPoints) {
            const t = "PointsMaterial:" + i.uuid;
            let e = this.cache.get(t);
            e || (e = new Bs, fe.prototype.copy.call(e, i), e.color.copy(i.color), e.map = i.map, 
            e.sizeAttenuation = !1, this.cache.add(t, e)), i = e;
        } else if (t.isLine) {
            const t = "LineBasicMaterial:" + i.uuid;
            let e = this.cache.get(t);
            e || (e = new Ts, fe.prototype.copy.call(e, i), e.color.copy(i.color), e.map = i.map, 
            this.cache.add(t, e)), i = e;
        }
        if (n || r || s) {
            let t = "ClonedMaterial:" + i.uuid + ":";
            n && (t += "derivative-tangents:"), r && (t += "vertex-colors:"), s && (t += "flat-shading:");
            let e = this.cache.get(t);
            e || (e = i.clone(), r && (e.vertexColors = !0), s && (e.flatShading = !0), n && (e.normalScale && (e.normalScale.y *= -1), 
            e.clearcoatNormalScale && (e.clearcoatNormalScale.y *= -1)), this.cache.add(t, e), 
            this.associations.set(e, this.associations.get(i))), i = e;
        }
        t.material = i;
    }
    getMaterialType() {
        return Ws;
    }
    loadMaterial(t) {
        const e = this, i = this.json, n = this.extensions, r = i.materials[t];
        let s;
        const a = {}, o = [];
        if ((r.extensions || {})[Dl.KHR_MATERIALS_UNLIT]) {
            const t = n[Dl.KHR_MATERIALS_UNLIT];
            s = t.getMaterialType(), o.push(t.extendParams(a, r, e));
        } else {
            const i = r.pbrMetallicRoughness || {};
            if (a.color = new ye(1, 1, 1), a.opacity = 1, Array.isArray(i.baseColorFactor)) {
                const t = i.baseColorFactor;
                a.color.fromArray(t), a.opacity = t[3];
            }
            void 0 !== i.baseColorTexture && o.push(e.assignTexture(a, "map", i.baseColorTexture, "srgb")), 
            a.metalness = void 0 !== i.metallicFactor ? i.metallicFactor : 1, a.roughness = void 0 !== i.roughnessFactor ? i.roughnessFactor : 1, 
            void 0 !== i.metallicRoughnessTexture && (o.push(e.assignTexture(a, "metalnessMap", i.metallicRoughnessTexture)), 
            o.push(e.assignTexture(a, "roughnessMap", i.metallicRoughnessTexture))), s = this._invokeOne((function(e) {
                return e.getMaterialType && e.getMaterialType(t);
            })), o.push(Promise.all(this._invokeAll((function(e) {
                return e.extendMaterialParams && e.extendMaterialParams(t, a);
            }))));
        }
        !0 === r.doubleSided && (a.side = 2);
        const l = r.alphaMode || uh;
        if (l === gh ? (a.transparent = !0, a.depthWrite = !1) : (a.transparent = !1, l === ph && (a.alphaTest = void 0 !== r.alphaCutoff ? r.alphaCutoff : .5)), 
        void 0 !== r.normalTexture && s !== Se && (o.push(e.assignTexture(a, "normalMap", r.normalTexture)), 
        a.normalScale = new P(1, 1), void 0 !== r.normalTexture.scale)) {
            const t = r.normalTexture.scale;
            a.normalScale.set(t, t);
        }
        return void 0 !== r.occlusionTexture && s !== Se && (o.push(e.assignTexture(a, "aoMap", r.occlusionTexture)), 
        void 0 !== r.occlusionTexture.strength && (a.aoMapIntensity = r.occlusionTexture.strength)), 
        void 0 !== r.emissiveFactor && s !== Se && (a.emissive = (new ye).fromArray(r.emissiveFactor)), 
        void 0 !== r.emissiveTexture && s !== Se && o.push(e.assignTexture(a, "emissiveMap", r.emissiveTexture, "srgb")), 
        Promise.all(o).then((function() {
            const i = new s(a);
            return r.name && (i.name = r.name), mh(i, r), e.associations.set(i, {
                materials: t
            }), r.extensions && fh(n, i, r), i;
        }));
    }
    createUniqueName(t) {
        const e = za.sanitizeNodeName(t || "");
        let i = e;
        for (let t = 1; this.nodeNamesUsed[i]; ++t) i = e + "_" + t;
        return this.nodeNamesUsed[i] = !0, i;
    }
    loadGeometries(t) {
        const e = this, i = this.extensions, n = this.primitiveCache;
        function r(t) {
            return i[Dl.KHR_DRACO_MESH_COMPRESSION].decodePrimitive(t, e).then((function(i) {
                return wh(i, t, e);
            }));
        }
        const s = [];
        for (let i = 0, a = t.length; i < a; i++) {
            const a = t[i], o = _h(a), l = n[o];
            if (l) s.push(l.promise); else {
                let t;
                t = a.extensions && a.extensions[Dl.KHR_DRACO_MESH_COMPRESSION] ? r(a) : wh(new Be, a, e), 
                n[o] = {
                    primitive: a,
                    promise: t
                }, s.push(t);
            }
        }
        return Promise.all(s);
    }
    loadMesh(t) {
        const e = this, i = this.json, n = this.extensions, r = i.meshes[t], s = r.primitives, a = [];
        for (let t = 0, e = s.length; t < e; t++) {
            const e = void 0 === s[t].material ? (void 0 === (o = this.cache).DefaultMaterial && (o.DefaultMaterial = new Ws({
                color: 16777215,
                emissive: 0,
                metalness: 1,
                roughness: 1,
                transparent: !1,
                depthTest: !0,
                side: 0
            })), o.DefaultMaterial) : this.getDependency("material", s[t].material);
            a.push(e);
        }
        var o;
        return a.push(e.loadGeometries(s)), Promise.all(a).then((function(i) {
            const a = i.slice(0, i.length - 1), o = i[i.length - 1], l = [];
            for (let i = 0, h = o.length; i < h; i++) {
                const h = o[i], c = s[i];
                let d;
                const u = a[i];
                if (c.mode === rh.TRIANGLES || c.mode === rh.TRIANGLE_STRIP || c.mode === rh.TRIANGLE_FAN || void 0 === c.mode) d = !0 === r.isSkinnedMesh ? new cs(h, u) : new ti(h, u), 
                !0 === d.isSkinnedMesh && d.normalizeSkinWeights(), c.mode === rh.TRIANGLE_STRIP ? d.geometry = Pl(d.geometry, 1) : c.mode === rh.TRIANGLE_FAN && (d.geometry = Pl(d.geometry, 2)); else if (c.mode === rh.LINES) d = new Us(h, u); else if (c.mode === rh.LINE_STRIP) d = new Ls(h, u); else if (c.mode === rh.LINE_LOOP) d = new Ns(h, u); else {
                    if (c.mode !== rh.POINTS) throw new Error("THREE.GLTFLoader: Primitive mode unsupported: " + c.mode);
                    d = new zs(h, u);
                }
                Object.keys(d.geometry.morphAttributes).length > 0 && vh(d, r), d.name = e.createUniqueName(r.name || "mesh_" + t), 
                mh(d, r), c.extensions && fh(n, d, c), e.assignFinalMaterial(d), l.push(d);
            }
            for (let i = 0, n = l.length; i < n; i++) e.associations.set(l[i], {
                meshes: t,
                primitives: i
            });
            if (1 === l.length) return l[0];
            const h = new jr;
            e.associations.set(h, {
                meshes: t
            });
            for (let t = 0, e = l.length; t < e; t++) h.add(l[t]);
            return h;
        }));
    }
    loadCamera(t) {
        let e;
        const i = this.json.cameras[t], n = i[i.type];
        if (n) return "perspective" === i.type ? e = new hi(C.radToDeg(n.yfov), n.aspectRatio || 1, n.znear || 1, n.zfar || 2e6) : "orthographic" === i.type && (e = new Ii(-n.xmag, n.xmag, n.ymag, -n.ymag, n.znear, n.zfar)), 
        i.name && (e.name = this.createUniqueName(i.name)), mh(e, i), Promise.resolve(e);
        console.warn("THREE.GLTFLoader: Missing camera parameters.");
    }
    loadSkin(t) {
        const e = this.json.skins[t], i = [];
        for (let t = 0, n = e.joints.length; t < n; t++) i.push(this._loadNodeShallow(e.joints[t]));
        return void 0 !== e.inverseBindMatrices ? i.push(this.getDependency("accessor", e.inverseBindMatrices)) : i.push(null), 
        Promise.all(i).then((function(t) {
            const i = t.pop(), n = t, r = [], s = [];
            for (let t = 0, a = n.length; t < a; t++) {
                const a = n[t];
                if (a) {
                    r.push(a);
                    const e = new Rt;
                    null !== i && e.fromArray(i.array, 16 * t), s.push(e);
                } else console.warn('THREE.GLTFLoader: Joint "%s" could not be found.', e.joints[t]);
            }
            return new fs(r, s);
        }));
    }
    loadAnimation(t) {
        const e = this.json.animations[t], i = e.name ? e.name : "animation_" + t, n = [], r = [], s = [], a = [], o = [];
        for (let t = 0, i = e.channels.length; t < i; t++) {
            const i = e.channels[t], l = e.samplers[i.sampler], h = i.target, c = h.node, d = void 0 !== e.parameters ? e.parameters[l.input] : l.input, u = void 0 !== e.parameters ? e.parameters[l.output] : l.output;
            void 0 !== h.node && (n.push(this.getDependency("node", c)), r.push(this.getDependency("accessor", d)), 
            s.push(this.getDependency("accessor", u)), a.push(l), o.push(h));
        }
        return Promise.all([ Promise.all(n), Promise.all(r), Promise.all(s), Promise.all(a), Promise.all(o) ]).then((function(t) {
            const e = t[0], n = t[1], r = t[2], s = t[3], a = t[4], o = [];
            for (let t = 0, i = e.length; t < i; t++) {
                const i = e[t], l = n[t], h = r[t], c = s[t], d = a[t];
                if (void 0 === i) continue;
                let u;
                switch (i.updateMatrix(), ch[d.path]) {
                  case ch.weights:
                    u = sa;
                    break;

                  case ch.rotation:
                    u = oa;
                    break;

                  default:
                    u = ha;
                }
                const p = i.name ? i.name : i.uuid, g = void 0 !== c.interpolation ? dh[c.interpolation] : 2301, f = [];
                ch[d.path] === ch.weights ? i.traverse((function(t) {
                    t.morphTargetInfluences && f.push(t.name ? t.name : t.uuid);
                })) : f.push(p);
                let m = h.array;
                if (h.normalized) {
                    const t = yh(m.constructor), e = new Float32Array(m.length);
                    for (let i = 0, n = m.length; i < n; i++) e[i] = m[i] * t;
                    m = e;
                }
                for (let t = 0, e = f.length; t < e; t++) {
                    const e = new u(f[t] + "." + ch[d.path], l.array, m, g);
                    "CUBICSPLINE" === c.interpolation && (e.createInterpolant = function(t) {
                        return new (this instanceof oa ? nh : eh)(this.times, this.values, this.getValueSize() / 3, t);
                    }, e.createInterpolant.isInterpolantFactoryMethodGLTFCubicSpline = !0), o.push(e);
                }
            }
            return new ca(i, void 0, o);
        }));
    }
    createNodeMesh(t) {
        const e = this.json, i = this, n = e.nodes[t];
        return void 0 === n.mesh ? null : i.getDependency("mesh", n.mesh).then((function(t) {
            const e = i._getNodeRef(i.meshCache, n.mesh, t);
            return void 0 !== n.weights && e.traverse((function(t) {
                if (t.isMesh) for (let e = 0, i = n.weights.length; e < i; e++) t.morphTargetInfluences[e] = n.weights[e];
            })), e;
        }));
    }
    loadNode(t) {
        const e = this, i = this.json.nodes[t], n = e._loadNodeShallow(t), r = [], s = i.children || [];
        for (let t = 0, i = s.length; t < i; t++) r.push(e.getDependency("node", s[t]));
        const a = void 0 === i.skin ? Promise.resolve(null) : e.getDependency("skin", i.skin);
        return Promise.all([ n, Promise.all(r), a ]).then((function(t) {
            const e = t[0], i = t[1], n = t[2];
            null !== n && e.traverse((function(t) {
                t.isSkinnedMesh && t.bind(n, bh);
            }));
            for (let t = 0, n = i.length; t < n; t++) e.add(i[t]);
            return e;
        }));
    }
    _loadNodeShallow(t) {
        const e = this.json, i = this.extensions, n = this;
        if (void 0 !== this.nodeCache[t]) return this.nodeCache[t];
        const r = e.nodes[t], s = r.name ? n.createUniqueName(r.name) : "", a = [], o = n._invokeOne((function(e) {
            return e.createNodeMesh && e.createNodeMesh(t);
        }));
        return o && a.push(o), void 0 !== r.camera && a.push(n.getDependency("camera", r.camera).then((function(t) {
            return n._getNodeRef(n.cameraCache, r.camera, t);
        }))), n._invokeAll((function(e) {
            return e.createNodeAttachment && e.createNodeAttachment(t);
        })).forEach((function(t) {
            a.push(t);
        })), this.nodeCache[t] = Promise.all(a).then((function(e) {
            let a;
            if (a = !0 === r.isBone ? new ds : e.length > 1 ? new jr : 1 === e.length ? e[0] : new ee, 
            a !== e[0]) for (let t = 0, i = e.length; t < i; t++) a.add(e[t]);
            if (r.name && (a.userData.name = r.name, a.name = s), mh(a, r), r.extensions && fh(i, a, r), 
            void 0 !== r.matrix) {
                const t = new Rt;
                t.fromArray(r.matrix), a.applyMatrix4(t);
            } else void 0 !== r.translation && a.position.fromArray(r.translation), void 0 !== r.rotation && a.quaternion.fromArray(r.rotation), 
            void 0 !== r.scale && a.scale.fromArray(r.scale);
            return n.associations.has(a) || n.associations.set(a, {}), n.associations.get(a).nodes = t, 
            a;
        })), this.nodeCache[t];
    }
    loadScene(t) {
        const e = this.extensions, i = this.json.scenes[t], n = this, r = new jr;
        i.name && (r.name = n.createUniqueName(i.name)), mh(r, i), i.extensions && fh(e, r, i);
        const s = i.nodes || [], a = [];
        for (let t = 0, e = s.length; t < e; t++) a.push(n.getDependency("node", s[t]));
        return Promise.all(a).then((function(t) {
            for (let e = 0, i = t.length; e < i; e++) r.add(t[e]);
            return n.associations = (t => {
                const e = new Map;
                for (const [t, i] of n.associations) (t instanceof fe || t instanceof K) && e.set(t, i);
                return t.traverse((t => {
                    const i = n.associations.get(t);
                    null != i && e.set(t, i);
                })), e;
            })(r), r;
        }));
    }
}

function wh(t, e, i) {
    const n = e.attributes, r = [];
    function s(e, n) {
        return i.getDependency("accessor", e).then((function(e) {
            t.setAttribute(n, e);
        }));
    }
    for (const e in n) {
        const i = hh[e] || e.toLowerCase();
        i in t.attributes || r.push(s(n[e], i));
    }
    if (void 0 !== e.indices && !t.index) {
        const n = i.getDependency("accessor", e.indices).then((function(e) {
            t.setIndex(e);
        }));
        r.push(n);
    }
    return mh(t, e), function(t, e, i) {
        const n = e.attributes, r = new nt;
        if (void 0 === n.POSITION) return;
        {
            const t = i.json.accessors[n.POSITION], e = t.min, s = t.max;
            if (void 0 === e || void 0 === s) return void console.warn("THREE.GLTFLoader: Missing min/max properties for accessor POSITION.");
            if (r.set(new tt(e[0], e[1], e[2]), new tt(s[0], s[1], s[2])), t.normalized) {
                const e = yh(sh[t.componentType]);
                r.min.multiplyScalar(e), r.max.multiplyScalar(e);
            }
        }
        const s = e.targets;
        if (void 0 !== s) {
            const t = new tt, e = new tt;
            for (let n = 0, r = s.length; n < r; n++) {
                const r = s[n];
                if (void 0 !== r.POSITION) {
                    const n = i.json.accessors[r.POSITION], s = n.min, a = n.max;
                    if (void 0 !== s && void 0 !== a) {
                        if (e.setX(Math.max(Math.abs(s[0]), Math.abs(a[0]))), e.setY(Math.max(Math.abs(s[1]), Math.abs(a[1]))), 
                        e.setZ(Math.max(Math.abs(s[2]), Math.abs(a[2]))), n.normalized) {
                            const t = yh(sh[n.componentType]);
                            e.multiplyScalar(t);
                        }
                        t.max(e);
                    } else console.warn("THREE.GLTFLoader: Missing min/max properties for accessor POSITION.");
                }
            }
            r.expandByVector(t);
        }
        t.boundingBox = r;
        const a = new bt;
        r.getCenter(a.center), a.radius = r.min.distanceTo(r.max) / 2, t.boundingSphere = a;
    }(t, e, i), Promise.all(r).then((function() {
        return void 0 !== e.targets ? function(t, e, i) {
            let n = !1, r = !1, s = !1;
            for (let t = 0, i = e.length; t < i; t++) {
                const i = e[t];
                if (void 0 !== i.POSITION && (n = !0), void 0 !== i.NORMAL && (r = !0), void 0 !== i.COLOR_0 && (s = !0), 
                n && r && s) break;
            }
            if (!n && !r && !s) return Promise.resolve(t);
            const a = [], o = [], l = [];
            for (let h = 0, c = e.length; h < c; h++) {
                const c = e[h];
                if (n) {
                    const e = void 0 !== c.POSITION ? i.getDependency("accessor", c.POSITION) : t.attributes.position;
                    a.push(e);
                }
                if (r) {
                    const e = void 0 !== c.NORMAL ? i.getDependency("accessor", c.NORMAL) : t.attributes.normal;
                    o.push(e);
                }
                if (s) {
                    const e = void 0 !== c.COLOR_0 ? i.getDependency("accessor", c.COLOR_0) : t.attributes.color;
                    l.push(e);
                }
            }
            return Promise.all([ Promise.all(a), Promise.all(o), Promise.all(l) ]).then((function(e) {
                const i = e[0], a = e[1], o = e[2];
                return n && (t.morphAttributes.position = i), r && (t.morphAttributes.normal = a), 
                s && (t.morphAttributes.color = o), t.morphTargetsRelative = !0, t;
            }));
        }(t, e.targets, i) : t;
    }));
}

const Mh = new WeakMap;

class Th extends fa {
    constructor(t) {
        super(t), this.decoderPath = "", this.decoderConfig = {}, this.decoderBinary = null, 
        this.decoderPending = null, this.workerLimit = 4, this.workerPool = [], this.workerNextTaskID = 1, 
        this.workerSourceURL = "", this.defaultAttributeIDs = {
            position: "POSITION",
            normal: "NORMAL",
            color: "COLOR",
            uv: "TEX_COORD"
        }, this.defaultAttributeTypes = {
            position: "Float32Array",
            normal: "Float32Array",
            color: "Float32Array",
            uv: "Float32Array"
        };
    }
    setDecoderPath(t) {
        return this.decoderPath = t, this;
    }
    setDecoderConfig(t) {
        return this.decoderConfig = t, this;
    }
    setWorkerLimit(t) {
        return this.workerLimit = t, this;
    }
    load(t, e, i, n) {
        const r = new _a(this.manager);
        r.setPath(this.path), r.setResponseType("arraybuffer"), r.setRequestHeader(this.requestHeader), 
        r.setWithCredentials(this.withCredentials), r.load(t, (t => {
            this.parse(t, e, n);
        }), i, n);
    }
    parse(t, e, i) {
        this.decodeDracoFile(t, e, null, null, "srgb").catch(i);
    }
    decodeDracoFile(t, e, i, n, r = "srgb-linear") {
        const s = {
            attributeIDs: i || this.defaultAttributeIDs,
            attributeTypes: n || this.defaultAttributeTypes,
            useUniqueIDs: !!i,
            vertexColorSpace: r
        };
        return this.decodeGeometry(t, s).then(e);
    }
    decodeGeometry(t, e) {
        const i = JSON.stringify(e);
        if (Mh.has(t)) {
            const e = Mh.get(t);
            if (e.key === i) return e.promise;
            if (0 === t.byteLength) throw new Error("THREE.DRACOLoader: Unable to re-decode a buffer with different settings. Buffer has already been transferred.");
        }
        let n;
        const r = this.workerNextTaskID++, s = t.byteLength, a = this._getWorker(r, s).then((i => (n = i, 
        new Promise(((i, s) => {
            n._callbacks[r] = {
                resolve: i,
                reject: s
            }, n.postMessage({
                type: "decode",
                id: r,
                taskConfig: e,
                buffer: t
            }, [ t ]);
        }))))).then((t => this._createGeometry(t.geometry)));
        return a.catch((() => !0)).then((() => {
            n && r && this._releaseTask(n, r);
        })), Mh.set(t, {
            key: i,
            promise: a
        }), a;
    }
    _createGeometry(t) {
        const e = new Be;
        t.index && e.setIndex(new Te(t.index.array, 1));
        for (let i = 0; i < t.attributes.length; i++) {
            const n = t.attributes[i], r = n.name, s = n.array, a = n.itemSize, o = new Te(s, a);
            "color" === r && this._assignVertexColorSpace(o, n.vertexColorSpace), e.setAttribute(r, o);
        }
        return e;
    }
    _assignVertexColorSpace(t, e) {
        if ("srgb" !== e) return;
        const i = new ye;
        for (let e = 0, n = t.count; e < n; e++) i.fromBufferAttribute(t, e).convertSRGBToLinear(), 
        t.setXYZ(e, i.r, i.g, i.b);
    }
    _loadLibrary(t, e) {
        const i = new _a(this.manager);
        return i.setPath(this.decoderPath), i.setResponseType(e), i.setWithCredentials(this.withCredentials), 
        new Promise(((e, n) => {
            i.load(t, e, void 0, n);
        }));
    }
    preload() {
        return this._initDecoder(), this;
    }
    _initDecoder() {
        if (this.decoderPending) return this.decoderPending;
        const t = "object" != typeof WebAssembly || "js" === this.decoderConfig.type, e = [];
        return t ? e.push(this._loadLibrary("draco_decoder.js", "text")) : (e.push(this._loadLibrary("draco_wasm_wrapper.js", "text")), 
        e.push(this._loadLibrary("draco_decoder.wasm", "arraybuffer"))), this.decoderPending = Promise.all(e).then((e => {
            const i = e[0];
            t || (this.decoderConfig.wasmBinary = e[1]);
            const n = Eh.toString(), r = [ "/* draco decoder */", i, "", "/* worker */", n.substring(n.indexOf("{") + 1, n.lastIndexOf("}")) ].join("\n");
            this.workerSourceURL = URL.createObjectURL(new Blob([ r ]));
        })), this.decoderPending;
    }
    _getWorker(t, e) {
        return this._initDecoder().then((() => {
            if (this.workerPool.length < this.workerLimit) {
                const t = new Worker(this.workerSourceURL);
                t._callbacks = {}, t._taskCosts = {}, t._taskLoad = 0, t.postMessage({
                    type: "init",
                    decoderConfig: this.decoderConfig
                }), t.onmessage = function(e) {
                    const i = e.data;
                    switch (i.type) {
                      case "decode":
                        t._callbacks[i.id].resolve(i);
                        break;

                      case "error":
                        t._callbacks[i.id].reject(i);
                        break;

                      default:
                        console.error('THREE.DRACOLoader: Unexpected message, "' + i.type + '"');
                    }
                }, this.workerPool.push(t);
            } else this.workerPool.sort((function(t, e) {
                return t._taskLoad > e._taskLoad ? -1 : 1;
            }));
            const i = this.workerPool[this.workerPool.length - 1];
            return i._taskCosts[t] = e, i._taskLoad += e, i;
        }));
    }
    _releaseTask(t, e) {
        t._taskLoad -= t._taskCosts[e], delete t._callbacks[e], delete t._taskCosts[e];
    }
    debug() {
        console.log("Task load: ", this.workerPool.map((t => t._taskLoad)));
    }
    dispose() {
        for (let t = 0; t < this.workerPool.length; ++t) this.workerPool[t].terminate();
        return this.workerPool.length = 0, "" !== this.workerSourceURL && URL.revokeObjectURL(this.workerSourceURL), 
        this;
    }
}

function Eh() {
    let t, e;
    function i(t, e, i, n, r, s) {
        const a = s.num_components(), o = i.num_points() * a, l = o * r.BYTES_PER_ELEMENT, h = function(t, e) {
            switch (e) {
              case Float32Array:
                return t.DT_FLOAT32;

              case Int8Array:
                return t.DT_INT8;

              case Int16Array:
                return t.DT_INT16;

              case Int32Array:
                return t.DT_INT32;

              case Uint8Array:
                return t.DT_UINT8;

              case Uint16Array:
                return t.DT_UINT16;

              case Uint32Array:
                return t.DT_UINT32;
            }
        }(t, r), c = t._malloc(l);
        e.GetAttributeDataArrayForAllPoints(i, s, h, l, c);
        const d = new r(t.HEAPF32.buffer, c, o).slice();
        return t._free(c), {
            name: n,
            array: d,
            itemSize: a
        };
    }
    onmessage = function(n) {
        const r = n.data;
        switch (r.type) {
          case "init":
            t = r.decoderConfig, e = new Promise((function(e) {
                t.onModuleLoaded = function(t) {
                    e({
                        draco: t
                    });
                }, DracoDecoderModule(t);
            }));
            break;

          case "decode":
            const n = r.buffer, s = r.taskConfig;
            e.then((t => {
                const e = t.draco, a = new e.Decoder;
                try {
                    const t = function(t, e, n, r) {
                        const s = r.attributeIDs, a = r.attributeTypes;
                        let o, l;
                        const h = e.GetEncodedGeometryType(n);
                        if (h === t.TRIANGULAR_MESH) o = new t.Mesh, l = e.DecodeArrayToMesh(n, n.byteLength, o); else {
                            if (h !== t.POINT_CLOUD) throw new Error("THREE.DRACOLoader: Unexpected geometry type.");
                            o = new t.PointCloud, l = e.DecodeArrayToPointCloud(n, n.byteLength, o);
                        }
                        if (!l.ok() || 0 === o.ptr) throw new Error("THREE.DRACOLoader: Decoding failed: " + l.error_msg());
                        const c = {
                            index: null,
                            attributes: []
                        };
                        for (const n in s) {
                            const l = self[a[n]];
                            let h, d;
                            if (r.useUniqueIDs) d = s[n], h = e.GetAttributeByUniqueId(o, d); else {
                                if (d = e.GetAttributeId(o, t[s[n]]), -1 === d) continue;
                                h = e.GetAttribute(o, d);
                            }
                            const u = i(t, e, o, n, l, h);
                            "color" === n && (u.vertexColorSpace = r.vertexColorSpace), c.attributes.push(u);
                        }
                        h === t.TRIANGULAR_MESH && (c.index = function(t, e, i) {
                            const n = 3 * i.num_faces(), r = 4 * n, s = t._malloc(r);
                            e.GetTrianglesUInt32Array(i, r, s);
                            const a = new Uint32Array(t.HEAPF32.buffer, s, n).slice();
                            return t._free(s), {
                                array: a,
                                itemSize: 1
                            };
                        }(t, e, o));
                        return t.destroy(o), c;
                    }(e, a, new Int8Array(n), s), o = t.attributes.map((t => t.array.buffer));
                    t.index && o.push(t.index.array.buffer), self.postMessage({
                        type: "decode",
                        id: r.id,
                        geometry: t
                    }, o);
                } catch (t) {
                    console.error(t), self.postMessage({
                        type: "error",
                        id: r.id,
                        error: t.message
                    });
                } finally {
                    e.destroy(a);
                }
            }));
        }
    };
}

let Ah = null;

async function Ch(t) {
    return await new Promise(((e, i) => {
        if (!Ah) throw new Error("gltf loader not initialized");
        Ah.parse(t, "", (t => {
            e(t);
        }), (t => {
            i(t);
        }));
    }));
}

class Ph {
    constructor(t) {
        this.assetManager = t, this.assetCache = new Map, this.fetchCache = new Map, this.imageCache = new Map, 
        this.highlightAsset = (async () => {
            const e = (await t.loadGlbFromUrl("static/buildingHighlight.glb")).scene;
            return Qa(e), e;
        })(), this.resolveAllBuildingsFetched = () => {}, this.allBuildingsFetchedPromise = new Promise((t => {
            this.resolveAllBuildingsFetched = t;
        }));
    }
    async fetchRemainingBuildings() {
        for (let t = 0; t <= 10; t++) for (let e = 0; e < to.length; e++) await this.fetchBuilding(e, t);
        this.resolveAllBuildingsFetched();
    }
    async fetchBuilding(t, e) {
        let i = this.fetchCache.get(t);
        i || (i = new Map, this.fetchCache.set(t, i));
        let n = i.get(e);
        return n || (n = (async () => {
            const i = to[t], n = await fetch(`static/buildings/${i.assetPrefix}-${e}.glb`);
            return await n.arrayBuffer();
        })(), i.set(e, n)), await n;
    }
    async getBuildingData(t, e) {
        const i = await this.fetchBuilding(t, e), n = await Ch(i);
        Qa(n.scene);
        let r = "stacked";
        if (3 == t && (r = "one"), "stacked" == r) {
            function s(t) {
                for (const e of ja(n.scene)) if (e.name.startsWith(t)) return e.children;
                return [];
            }
            return Qa(n.scene), {
                assetType: r,
                base: s("base"),
                mid: s("mid"),
                top: s("top")
            };
        }
        if ("one" == r) return {
            assetType: r,
            asset: n.scene
        };
        throw new Error("Unknown asset type: " + r);
    }
    async getCachedBuildingAssetData(t, e) {
        let i = this.assetCache.get(t);
        i || (i = new Map, this.assetCache.set(t, i));
        let n = i.get(e);
        return n || (n = this.getBuildingData(t, e), i.set(e, n)), await n, n;
    }
    async createBuildingAsset(t) {
        let {type: e, height: i, powerAreaSimplified: n} = t;
        const r = await this.getCachedBuildingAssetData(t.type, t.powerAreaSimplified), s = [];
        if ("stacked" == r.assetType) {
            let t = bo(r.base);
            t = t ? t.clone() : new ee, s.push({
                obj: t,
                height: 0
            }), 0 == e && 0 == n && (i = Math.max(0, i - 1));
            for (let t = 0; t < i - 1; t++) {
                const e = bo(r.mid);
                if (!e) continue;
                const i = e.clone();
                s.push({
                    obj: i,
                    height: .5 * (t + 1)
                });
            }
            let a = bo(r.top);
            a = a ? a.clone() : new ee, s.push({
                obj: a,
                height: .5 * i
            });
        } else if ("one" == r.assetType) {
            const t = r.asset.clone();
            s.push({
                obj: t,
                height: 0
            });
        }
        return {
            assets: s,
            mergeHighlight: (await this.highlightAsset).clone()
        };
    }
    getBuildingImageUrl(t) {
        const e = `${t.type}-${t.powerAreaSimplified}-${t.height}`, i = this.imageCache.get(e);
        if (i) return i;
        const n = (async () => {
            const e = await this.createBuildingAsset(t), i = new ts;
            for (const t of e.assets) t.obj.position.y = t.height, i.add(t.obj);
            const n = 100 * globalThis.devicePixelRatio, r = 166 * globalThis.devicePixelRatio, s = new Ii(-.75, .75, 1.25, -1.25);
            return i.add(s), s.position.set(2, 2, 2), s.rotation.set(-.4, Math.PI / 4, 0, "YXZ"), 
            s.updateProjectionMatrix(), await jh().renderer.requestSceneObjectUrl(i, s, n, r);
        })();
        return this.imageCache.set(e, n), n;
    }
}

class Rh {
    constructor(t) {
        this.assetManager = t, this.cache = new Map;
    }
    getAsset(t) {
        const e = this.cache.get(t);
        if (e) return e;
        const i = (async () => {
            const e = await this.assetManager.loadGlb(`environment/${t}.glb`);
            e.scene.updateWorldMatrix(!0, !0);
            const i = Ml(e.scene);
            if (!i) throw new Error(`Failed to merge "${e}" environment asset`);
            return Qa(i), i;
        })();
        return this.cache.set(t, i), i;
    }
}

class Lh {
    constructor() {
        this.onPackageAddCbs = [], this.packages = {}, this.miscPackage = this.addPackage("misc", {
            manualDownload: !0
        }), function() {
            if (Ah) throw new Error("gltf loader already initialized");
            Ah = new Rl;
            const t = new Th;
            t.setDecoderPath("./draco/"), t.setWorkerLimit(1), t.setDecoderConfig({
                type: "wasm"
            }), Ah.setDRACOLoader(t);
            const e = JSON.stringify({
                asset: {
                    version: "2.0"
                },
                extensionsUsed: [ "KHR_draco_mesh_compression" ]
            }), i = (new TextEncoder).encode(e);
            Ah.parse(i, "", (() => {}), (() => {}));
        }(), this.buildingCreator = new Ph(this), this.environmentAssetManager = new Rh(this), 
        this.crateAsset = (async () => {
            const t = await this.loadGlbFromUrl("static/crate.glb");
            t.scene.updateWorldMatrix(!0, !0);
            const e = Ml(t.scene);
            if (!e) throw new Error("Failed to merge crate asset");
            return Qa(e), e;
        })(), this.mergedQuadMergeHighlight = (async () => {
            const t = await this.loadGlb("quadMergeHighlight.glb");
            t.scene.updateWorldMatrix(!0, !0);
            const e = Ml(t.scene);
            if (!e) throw new Error("Failed to merge quadMergeHighlight asset");
            return Qa(e), e;
        })();
    }
    async init() {
        await this.crateAsset, await this.buildingCreator.highlightAsset, await this.buildingCreator.allBuildingsFetchedPromise, 
        this.miscPackage.startDownloading();
    }
    addPackage(t, {waitForOtherPackages: e = null, expectedOtherPackageCount: i = 1, manualDownload: n = !1} = {}) {
        let r = null;
        if (t in this.packages) r = this.packages[t]; else {
            r = new Cl("assetPackages" + "/" + t + ".bin?v=1699441930"), this.packages[t] = r;
            for (const t of this.onPackageAddCbs) t();
            this.onPackageAddCbs = [];
        }
        return n || this.waitAndDownloadPack(r, e, i), r;
    }
    async waitAndDownloadPack(t, e, i) {
        if (e) for (;;) {
            const n = [];
            for (const [i, r] of Object.entries(this.packages)) for (const s of e) i.startsWith(s) && r != t && n.push(r);
            if (!(n.length < i)) {
                for (const t of n) await t.waitForLoad();
                break;
            }
            await this.waitForPackageAdd();
        }
        t.startDownloading();
    }
    async waitForPackageAdd() {
        const t = new Promise((t => this.onPackageAddCbs.push(t)));
        await t;
    }
    getPackage(t) {
        return this.packages[t];
    }
    async getPackageAsync(t) {
        for (;;) {
            const e = this.packages[t];
            if (e) return e;
            await this.waitForPackageAdd();
        }
    }
    async getFileAsBuffer(t) {
        for (const e of Object.values(this.packages)) if (await e.hasFile(t)) return await e.getFileAsBuffer(t);
        throw new Error(`Trying to load asset at ${t} but it doesn't exist!`);
    }
    async loadGlb(t, {packageName: e = "misc"} = {}) {
        return Ch(await this.getPackage(e).getFileAsBuffer(t));
    }
    async loadGlbFromUrl(t) {
        const e = await fetch(t), i = await e.arrayBuffer();
        return await Ch(i);
    }
}

class Dh {
    constructor(t, e) {
        this.opts = t, this.ctx = e, this.loaded = !1, this.loading = !1, this.buffer = null, 
        this.onLoadCbs = [];
    }
    async init() {
        if (this.loaded) return;
        if (this.loading) {
            const t = new Promise((t => {
                this.onLoadCbs.push(t);
            }));
            return await t;
        }
        this.loading = !0;
        const t = jh().assets.getPackage("sfx" + Uh.audioFormatCamelCase), e = await t.getFileAsBuffer(this.opts.name + "." + Uh.audioFormat);
        this.buffer = await new Promise((t => {
            this.ctx.decodeAudioData(e, t);
        })), this.loaded = !0;
        for (const t of this.onLoadCbs) t();
        this.onLoadCbs = [];
    }
    async waitForLoad() {
        if (this.loaded) return;
        const t = new Promise((t => this.onLoadCbs.push(t)));
        return await t;
    }
    async getBuffer() {
        return await this.waitForLoad(), this.buffer;
    }
}

class Ih {
    constructor(t, e = {}) {
        this.cachedSfx = t, this.opts = {
            autoPlay: !0,
            volume: 1,
            minPitch: 1,
            maxPitch: 1,
            volumeFront: 1,
            volumeBack: 0,
            isMusic: !1,
            loop: !1,
            allowWithoutUserEvent: !1,
            overrideMute: !1,
            pos: null,
            connectToDestination: !0,
            ...t.opts,
            ...e
        }, this.destructed = !1, this.sourceNode = null, this.gainNode = null, this.frontGainNode = null, 
        this.frontSplitterNode = null, this.backGainNode = null, this.backSplitterNode = null, 
        this.channelMergerNode = null, this.finalNode = null, this.pannerNode = null, this.preventDestructOnNextStop = !1, 
        this.lastSetVolume = 0, this.isLoopPlaying = null, this.muted = !1, this.forceMuted = !1, 
        this.startTime = 0;
        const i = this.opts.minPitch || 0, n = this.opts.maxPitch || 0;
        this.pitch = yo(i, n);
    }
    destructor() {
        this.destructed = !0, jh().sfx.sfxDestructed(this);
    }
    async init() {
        return !jh().sfx.muted || this.opts.loop || this.opts.overrideMute ? (this.setVolume(this.opts.volume || 0, !0), 
        this.opts.autoPlay && await this.start(!0), this.setMuted(jh().sfx.muted), !0) : (this.destructor(), 
        !1);
    }
    setVolume(t, e = !1) {
        const i = jh().sfx.ctx;
        if (!i) return;
        this.lastSetVolume = t;
        t *= 1, this.gainNode && (e ? this.gainNode.gain.value = t : this.gainNode.gain.linearRampToValueAtTime(t, i.currentTime + .1));
    }
    volumeSettingChanged(t) {
        this.setVolume(this.lastSetVolume);
    }
    setMuted(t, e = !1) {
        if (this.muted = t, this.forceMuted = e, this.opts.overrideMute && !e && (t = !1), 
        this.opts.loop) if (t) {
            const t = this.isLoopPlaying;
            this.pause(!0), this.isLoopPlaying = t;
        } else this.isLoopPlaying && this.resume(!0); else t && this.stop();
    }
    async start(t = !1) {
        if (!this.sourceNode) {
            const e = jh().sfx.ctx;
            if (!e) return;
            this.sourceNode = e.createBufferSource(), this.sourceNode.buffer = await this.cachedSfx.getBuffer(), 
            this.sourceNode.loop = this.opts.loop || !1, this.sourceNode.playbackRate.value = this.pitch, 
            this.finalNode = this.sourceNode, this.gainNode = e.createGain(), this.finalNode.connect(this.gainNode), 
            this.finalNode = this.gainNode, this.opts.pos && (this.pannerNode = e.createPanner(), 
            this.pannerNode.panningModel = "HRTF", this.pannerNode.distanceModel = "inverse", 
            this.pannerNode.refDistance = 1, this.pannerNode.maxDistance = 1e3, this.pannerNode.rolloffFactor = 1, 
            this.pannerNode.positionX ? (this.pannerNode.positionX.value = this.opts.pos.x, 
            this.pannerNode.positionY.value = this.opts.pos.y, this.pannerNode.positionZ.value = this.opts.pos.z) : this.pannerNode.setPosition(this.opts.pos.x, this.opts.pos.y, this.opts.pos.z), 
            this.finalNode.connect(this.pannerNode), this.finalNode = this.pannerNode), e.destination.maxChannelCount >= 6 && (this.frontGainNode = e.createGain(), 
            this.frontGainNode.gain.value = this.opts.volumeFront, this.finalNode.connect(this.frontGainNode), 
            this.frontSplitterNode = e.createChannelSplitter(2), this.frontGainNode.connect(this.frontSplitterNode), 
            this.backGainNode = e.createGain(), this.backGainNode.gain.value = this.opts.volumeBack, 
            this.finalNode.connect(this.backGainNode), this.backSplitterNode = e.createChannelSplitter(2), 
            this.backGainNode.connect(this.backSplitterNode), this.channelMergerNode = e.createChannelMerger(6), 
            this.frontSplitterNode.connect(this.channelMergerNode, 0, 0), this.frontSplitterNode.connect(this.channelMergerNode, 1, 1), 
            this.backSplitterNode.connect(this.channelMergerNode, 0, 4), this.backSplitterNode.connect(this.channelMergerNode, 1, 5), 
            this.finalNode = this.channelMergerNode), this.opts.connectToDestination && this.finalNode.connect(e.destination);
            const i = () => {
                this.sourceNode && this.sourceNode.removeEventListener("ended", i), this.preventDestructOnNextStop || this.destructor(), 
                this.preventDestructOnNextStop = !1;
            };
            this.sourceNode.addEventListener("ended", i), this.setVolume(this.lastSetVolume, t), 
            this.sourceNode.start(), this.startTime = e.currentTime, !1 === this.isLoopPlaying && this.pause(!0);
        }
        this.opts.loop && (this.isLoopPlaying = !0);
    }
    stop(t = !0) {
        if (this.destructed) return;
        const e = jh().sfx.ctx;
        e && (this.preventDestructOnNextStop = !t, this.sourceNode && (this.sourceNode.stop(), 
        this.sourceNode = null, this.opts.connectToDestination && this.finalNode && this.finalNode.disconnect(e.destination), 
        this.finalNode = null), this.opts.loop && (this.isLoopPlaying = !1));
    }
    pause(t = !1) {
        this.isLoopPlaying = !1, this.sourceNode && (this.sourceNode.playbackRate.value = 1e-4);
    }
    resume(t = !1) {
        this.isLoopPlaying = !0, (!this.muted || !this.opts.loop || this.opts.overrideMute && !this.forceMuted || t) && this.sourceNode && (this.sourceNode.playbackRate.value = this.pitch);
    }
    getEstimatedTime() {
        const t = jh().sfx.ctx;
        if (!t) return 0;
        if (!this.sourceNode) return 0;
        if (!this.sourceNode.buffer) return 0;
        return so(t.currentTime - this.startTime, this.sourceNode.buffer.duration);
    }
}

class Uh {
    constructor() {
        if (window.AudioContext = window.AudioContext || window.webkitAudioContext, this.supported = !!AudioContext, 
        this.packageName = "sfx" + Uh.audioFormatCamelCase, this.cachedSfx = {}, this.createdSfx = [], 
        this.settingsMuted = !0, this.adsMuted = !1, this.muted = !0, this.supported) {
            this.ctx = new AudioContext, this.ctx.destination.maxChannelCount >= 6 && (this.ctx.destination.channelCount = 6), 
            this.ctx.onstatechange = () => {
                this.onCtxStatechange();
            }, this.boundUserEvent = this.userEvent.bind(this), this.addedUserEventListeners = !1, 
            this.onCtxStatechange(), this.soundsConfig = [ {
                name: "backgroundMusic",
                isMusic: !0,
                loop: !0,
                volume: .6
            }, {
                name: "ambient",
                isMusic: !0,
                loop: !0,
                volume: .08
            }, {
                name: "purchaseLand",
                volume: .2
            }, {
                name: "collectCoins",
                volume: .5
            }, {
                name: "building/lift",
                volume: .28
            }, {
                name: "building/drop",
                volume: .35
            }, {
                name: "building/purchase",
                volume: .58
            }, {
                name: "building/upgradeArea",
                volume: .58
            }, {
                name: "building/upgradeHeight",
                volume: .6
            }, {
                name: "camera/rotateLeft",
                volume: .5
            }, {
                name: "camera/rotateRight",
                volume: .5
            }, {
                name: "camera/zoomIn",
                volume: .5
            }, {
                name: "camera/zoomOut",
                volume: .5
            } ];
            for (const t of this.soundsConfig) this.cachedSfx[t.name] = new Dh(t, this.ctx);
            this.ctxStatePossiblyInvalid = !1, document.addEventListener("visibilitychange", (t => {
                document.hidden ? this.ctx && this.ctx.suspend() : (this.ctxStatePossiblyInvalid = !0, 
                window.setTimeout((() => {
                    !document.hidden && this.ctx && this.ctx.resume();
                }), 300));
            }), !1), this.updateMuted();
        }
    }
    static get audioFormat() {
        if (!this._audioFormatSet) {
            const t = document.createElement("audio");
            t.canPlayType("audio/webm;codecs=opus") ? this._audioFormat = "webm" : t.canPlayType("audio/mp3") ? this._audioFormat = "mp3" : (this._audioFormat = null, 
            this.supported = !1), this._audioFormatSet = !0;
        }
        return this._audioFormat;
    }
    static get audioFormatCamelCase() {
        const t = this.audioFormat;
        return t ? t.charAt(0).toUpperCase() + t.substring(1) : null;
    }
    init() {
        if (this.supported) {
            jh().assets.addPackage(this.packageName, {
                waitForOtherPackages: [ "misc" ]
            });
            for (const t of Object.values(this.cachedSfx)) t.init();
        }
    }
    loop(t, e) {
        if (this.supported && this.ctx && "running" == this.ctx.state && this.ctx.listener) {
            const t = jh().cam.cam.position, e = jh().cam.cam.quaternion;
            this.ctx.listener.positionX ? (this.ctx.listener.positionX.value = t.x, this.ctx.listener.positionY.value = t.y, 
            this.ctx.listener.positionZ.value = t.z) : this.ctx.listener.setPosition(t.x, t.y, t.z);
            const i = new tt(0, 0, -1);
            i.applyQuaternion(e);
            const n = new tt(0, 1, 0);
            n.applyQuaternion(e), this.ctx.listener.forwardX ? (this.ctx.listener.forwardX.value = i.x, 
            this.ctx.listener.forwardY.value = i.y, this.ctx.listener.forwardZ.value = i.z, 
            this.ctx.listener.upX.value = n.x, this.ctx.listener.upY.value = n.y, this.ctx.listener.upZ.value = n.z) : this.ctx.listener.setOrientation(i.x, i.y, i.z, n.x, n.y, n.z);
        }
    }
    onCtxStatechange() {
        this.supported && this.ctx && ("running" != this.ctx.state || this.ctxStatePossiblyInvalid ? this.addUserEventListeners() : this.removeUserEventListeners());
    }
    addUserEventListeners() {
        this.supported && this.boundUserEvent && (this.addedUserEventListeners || (window.addEventListener("touchstart", this.boundUserEvent), 
        window.addEventListener("touchend", this.boundUserEvent), window.addEventListener("click", this.boundUserEvent), 
        window.addEventListener("keydown", this.boundUserEvent), this.addedUserEventListeners = !0));
    }
    removeUserEventListeners() {
        this.supported && this.boundUserEvent && this.addedUserEventListeners && (window.removeEventListener("touchstart", this.boundUserEvent), 
        window.removeEventListener("touchend", this.boundUserEvent), window.removeEventListener("click", this.boundUserEvent), 
        window.removeEventListener("keydown", this.boundUserEvent), this.addedUserEventListeners = !1);
    }
    async userEvent() {
        this.supported && this.ctx && (this.ctxStatePossiblyInvalid && await this.ctx.suspend(), 
        await this.ctx.resume(), this.ctxStatePossiblyInvalid = !1);
    }
    async playSound(t, e) {
        const i = this.cachedSfx[t];
        if (!i) return void console.warn("attempted to play sound " + t + " but it doesn't exist");
        const n = new Ih(i, e);
        return await n.init() ? (this.createdSfx.push(n), n) : null;
    }
    setMutedSettings(t) {
        this.settingsMuted = t, this.updateMuted();
    }
    setMutedAds(t) {
        this.adsMuted = t, this.updateMuted();
    }
    updateMuted() {
        this.muted = this.settingsMuted || this.adsMuted;
        for (let t = this.createdSfx.length - 1; t >= 0; t--) this.createdSfx[t].setMuted(this.muted, this.adsMuted);
    }
    sfxDestructed(t) {
        const e = this.createdSfx.indexOf(t);
        e >= 0 && this.createdSfx.splice(e, 1);
    }
}

class Nh {
    constructor({defaultState: t = !1, defaultPluginState: e = !1, pluginInitializePromise: i = null, trueCall: n, falseCall: r, stateName: s, pluginName: a}) {
        this.pluginInitializePromise = i, this.pluginInitialized = !1, this.trueCall = n, 
        this.falseCall = r, this.stateName = s, this.pluginName = a, this.lastSentState = e, 
        this.stateQueue = [ t ], this.onEmptyQueueCallbacks = new Set, this.lastSentStatePromise = Promise.resolve(), 
        this.lastUpdateSymbol = Symbol(), (async () => {
            await this.pluginInitializePromise, await this.updateState(), this.pluginInitialized = !0;
        })();
    }
    setState(t) {
        this.stateQueue.push(t), this.updateState();
    }
    async updateState() {
        const t = Symbol();
        if (this.lastUpdateSymbol = t, this.pluginInitializePromise && await this.pluginInitializePromise, 
        this.lastSentStatePromise && await this.lastSentStatePromise, this.lastUpdateSymbol == t) {
            if (this.pluginInitialized) {
                if (this.stateQueue.length > 0) {
                    const t = this.stateQueue[this.stateQueue.length - 1];
                    t == this.lastSentState ? this.stateQueue = [] : this.stateQueue = [ t ];
                }
            } else this.stateQueue = function(t, e) {
                (e = Bh(t, e)).length > 0 && (e = [ e[0], e[e.length - 1] ]);
                return Bh(t, e);
            }(this.lastSentState, this.stateQueue);
            if (this.stateQueue.length > 0) {
                const t = this.stateQueue.shift(), e = t ? this.trueCall : this.falseCall;
                this.lastSentStatePromise = (async () => {
                    try {
                        const t = e() || Promise.resolve();
                        await t;
                    } catch (t) {
                        console.error(`An error occurred while trying to change the ${this.stateName} state of the "${this.pluginName}" plugin:`, t);
                    }
                })(), this.lastSentState = t, this.updateState();
            } else this.onEmptyQueueCallbacks.forEach((t => t())), this.onEmptyQueueCallbacks.clear();
        }
    }
    async waitForEmptyQueue() {
        if (0 == this.stateQueue.length) return;
        const t = new Promise((t => {
            this.onEmptyQueueCallbacks.add(t);
        }));
        await t;
    }
}

function Bh(t, e) {
    const i = [];
    let n = t;
    for (const t of e) t != n && (i.push(t), n = t);
    return i;
}

class Oh {
    constructor(t) {
        this._value = t, this._onChangeCbs = new Set;
    }
    get value() {
        return this._value;
    }
    onChange(t) {
        this._onChangeCbs.add(t);
    }
    removeOnChange(t) {
        this._onChangeCbs.delete(t);
    }
    setValue(t) {
        t != this._value && (this._value = t, this._onChangeCbs.forEach((e => e(t))));
    }
}

const Fh = [ "error", "fallback", "none" ];

class kh {
    constructor(t) {
        let e = [], i = null, n = !0, r = "adlad", s = "fallback", a = !1;
        t && (Array.isArray(t) ? e = t : (e = t.plugins || [], void 0 !== t.plugin && (i = t.plugin), 
        !1 === t.allowQueryStringPluginSelection && (n = !1), t.pluginSelectQueryStringKey && (r = t.pluginSelectQueryStringKey), 
        t.invalidQueryStringPluginBehaviour && Fh.includes(t.invalidQueryStringPluginBehaviour) && (s = t.invalidQueryStringPluginBehaviour), 
        t.useTestAds && (a = !0)));
        for (const t of e) if (!t.name.match(/^[a-z]([a-z_-]*[a-z])?$/)) throw new Error(`The plugin "${t.name}" has an invalid name.`);
        this._plugin = null;
        let o = !1;
        if (n && window.location) {
            const t = new URL(window.location.href).searchParams.get(r);
            if (t) {
                const i = e.find((e => e.name == t)) || null;
                if (!i) {
                    if ("error" == s) throw new Error(`The plugin "${t}" does not exist.`);
                    "fallback" == s || "none" == s && (o = !0);
                }
                i && (o = !0, this._plugin = i);
            }
        }
        if (!o && null != i) {
            if ("none" != i) {
                const t = e.find((t => t.name == i));
                if (!t) throw new Error(`The plugin "${i}" does not exist.`);
                this._plugin = t;
            }
            o = !0;
        }
        o || (this._plugin = function(t = []) {
            const e = t.filter((t => !t.shouldBeActive || t.shouldBeActive()));
            return e.length > 0 ? e[0] : null;
        }(e), o = !0), this._manualNeedsPause = !1, this._plugin && this._plugin.manualNeedsPause && (this._manualNeedsPause = !0), 
        this._manualNeedsMute = !1, this._plugin && this._plugin.manualNeedsMute && (this._manualNeedsMute = !0), 
        this._needsPauseState = new Oh(!1), this._needsMuteState = new Oh(!1), this._canShowFullScreenAdState = new Oh(!1), 
        this._canShowRewardedAdState = new Oh(!1), this._canShowBannerAdState = new Oh(!1);
        let l = null;
        if (this._plugin) if (this._plugin.initialize) {
            const t = this._plugin.initialize, e = this._plugin.manualNeedsPause, i = this._plugin.manualNeedsMute, n = this._plugin.name;
            let r = !1, s = !1;
            const o = this._plugin.showFullScreenAd, h = this._plugin.showRewardedAd, c = this._plugin.showBannerAd;
            l = (async () => {
                try {
                    await t({
                        useTestAds: a,
                        setNeedsPause: t => {
                            if (!e) throw new Error("Plugin is not allowed to modify needsPause because 'manualNeedsPause' is not set.");
                            this._needsPauseState.setValue(t);
                        },
                        setNeedsMute: t => {
                            if (!i) throw new Error("Plugin is not allowed to modify needsMute because 'manualNeedsMute' is not set.");
                            this._needsMuteState.setValue(t);
                        },
                        setCanShowFullScreenAd: t => {
                            r = !0, this._canShowFullScreenAdState.setValue(t);
                        },
                        setCanShowRewardedAd: t => {
                            s = !0, this._canShowRewardedAdState.setValue(t);
                        },
                        loadScriptTag(t) {
                            const e = document.createElement("script");
                            return e.src = t, document.body.appendChild(e), new Promise(((t, i) => {
                                e.addEventListener("load", (() => {
                                    t();
                                })), e.addEventListener("error", (t => {
                                    i(t.error);
                                }));
                            }));
                        }
                    });
                } catch (t) {
                    console.warn(`The "${n}" AdLad plugin failed to initialize`, t);
                }
                !r && o && this._canShowFullScreenAdState.setValue(!0), !s && h && this._canShowRewardedAdState.setValue(!0), 
                c && this._canShowBannerAdState.setValue(!0);
            })();
        } else this._plugin.showFullScreenAd && this._canShowFullScreenAdState.setValue(!0), 
        this._plugin.showRewardedAd && this._canShowRewardedAdState.setValue(!0);
        this._pluginInitializePromise = l, this._isShowingAd = !1, this._loadingState = new Nh({
            defaultState: !0,
            defaultPluginState: !1,
            pluginInitializePromise: this._pluginInitializePromise,
            trueCall: () => {
                if (this._plugin && this._plugin.loadStart) return this._plugin.loadStart();
            },
            falseCall: () => {
                if (this._plugin && this._plugin.loadStop) return this._plugin.loadStop();
            },
            pluginName: this._plugin?.name || "",
            stateName: "loading"
        }), this._gameplayStartState = new Nh({
            pluginInitializePromise: this._pluginInitializePromise,
            trueCall: () => {
                if (this._plugin && this._plugin.gameplayStart) return this._plugin.gameplayStart();
            },
            falseCall: () => {
                if (this._plugin && this._plugin.gameplayStop) return this._plugin.gameplayStop();
            },
            pluginName: this._plugin?.name || "",
            stateName: "gameplay start/stop"
        }), this._lastGameplayStartCall = !1;
    }
    get activePlugin() {
        return this._plugin ? this._plugin.name : null;
    }
    async _updateGameplayStartState() {
        this._gameplayStartState.setState(this._lastGameplayStartCall && !this._isShowingAd), 
        await this._gameplayStartState.waitForEmptyQueue();
    }
    gameplayStart() {
        this._lastGameplayStartCall = !0, this._updateGameplayStartState();
    }
    gameplayStop() {
        this._lastGameplayStartCall = !1, this._updateGameplayStartState();
    }
    loadStart() {
        this._loadingState.setState(!0);
    }
    loadStop() {
        this._loadingState.setState(!1);
    }
    get needsPause() {
        return this._needsPauseState.value;
    }
    get needsMute() {
        return this._needsMuteState.value;
    }
    onNeedsPauseChange(t) {
        this._needsPauseState.onChange(t);
    }
    removeOnNeedsPauseChange(t) {
        this._needsPauseState.removeOnChange(t);
    }
    onNeedsMuteChange(t) {
        this._needsMuteState.onChange(t);
    }
    removeOnNeedsMuteChange(t) {
        this._needsMuteState.removeOnChange(t);
    }
    async _showPluginFullScreenAd(t) {
        if (this._isShowingAd) return {
            didShowAd: !1,
            errorReason: "already-playing"
        };
        this._isShowingAd = !0, await this._updateGameplayStartState();
        try {
            if (!this._plugin) return {
                didShowAd: !1,
                errorReason: "no-active-plugin"
            };
            if (!t) return {
                didShowAd: !1,
                errorReason: "not-supported"
            };
            let e;
            this._pluginInitializePromise && await this._pluginInitializePromise, this._manualNeedsPause || this._needsPauseState.setValue(!0), 
            this._manualNeedsMute || this._needsMuteState.setValue(!0);
            try {
                e = await t();
            } catch (t) {
                console.error(`An error occurred while trying to display an ad from the "${this._plugin.name}" plugin:`, t);
            }
            return e ? function(t) {
                let e;
                if (t && "object" == typeof t) if (!0 === t.didShowAd || null === t.didShowAd) e = {
                    didShowAd: t.didShowAd,
                    errorReason: null
                }; else {
                    const i = [ "not-supported", "no-ad-available", "adblocker", "time-constraint", "user-dismissed", "unknown" ], n = i.indexOf(t.errorReason);
                    let r = i[n];
                    r || (r = "unknown"), e = {
                        didShowAd: !1,
                        errorReason: r
                    };
                } else e = {
                    didShowAd: !1,
                    errorReason: "unknown"
                };
                return e;
            }(e) : {
                didShowAd: !1,
                errorReason: "unknown"
            };
        } finally {
            this._isShowingAd = !1, this._manualNeedsMute || this._needsMuteState.setValue(!1), 
            this._manualNeedsPause || this._needsPauseState.setValue(!1), this._updateGameplayStartState();
        }
    }
    get canShowFullScreenAd() {
        return this._canShowFullScreenAdState.value;
    }
    onCanShowFullScreenAdChange(t) {
        this._canShowFullScreenAdState.onChange(t);
    }
    removeOnCanShowFullScreenAdChange(t) {
        this._canShowFullScreenAdState.removeOnChange(t);
    }
    async showFullScreenAd() {
        let t;
        return this._plugin && (t = this._plugin.showFullScreenAd), await this._showPluginFullScreenAd(t);
    }
    get canShowRewardedAd() {
        return this._canShowRewardedAdState.value;
    }
    onCanShowRewardedAdChange(t) {
        this._canShowRewardedAdState.onChange(t);
    }
    removeOnCanShowRewardedAdChange(t) {
        this._canShowRewardedAdState.removeOnChange(t);
    }
    async showRewardedAd() {
        let t;
        return this._plugin && (t = this._plugin.showRewardedAd), await this._showPluginFullScreenAd(t);
    }
    get canShowBannerAd() {
        return this._canShowBannerAdState.value;
    }
    onCanShowBannerAdChange(t) {
        this._canShowBannerAdState.onChange(t);
    }
    removeOnCanShowBannerAdChange(t) {
        this._canShowBannerAdState.removeOnChange(t);
    }
    async showBannerAd(t, e = {}) {
        if ("string" == typeof t) {
            const e = document.getElementById(t);
            if (!e) throw new Error(`Element with id "${t}" was not found.`);
            t = e;
        }
        if (!this._plugin || !this.activePlugin || !this._plugin.showBannerAd) return;
        this._pluginInitializePromise && await this._pluginInitializePromise;
        const i = t.getBoundingClientRect(), n = document.createElement("div");
        t.appendChild(n), n.id = function() {
            let t = (new Date).getTime(), e = performance && performance.now && 1e3 * performance.now() || 0;
            return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (i => {
                let n = 16 * Math.random();
                return t > 0 ? (n = (t + n) % 16 | 0, t = Math.floor(t / 16)) : (n = (e + n) % 16 | 0, 
                e = Math.floor(e / 16)), ("x" === i ? n : 3 & n | 8).toString(16);
            }));
        }(), n.style.width = "100%", n.style.height = "100%";
        const r = (e.pluginOptions || {})[this.activePlugin];
        await this._plugin.showBannerAd({
            el: n,
            id: n.id,
            width: i.width,
            height: i.height
        }, r);
    }
    async destroyBannerAd(t, e = {}) {
        if ("string" == typeof t) {
            const e = document.getElementById(t);
            if (!e) throw new Error(`Element with id "${t}" was not found.`);
            t = e;
        }
        if (!this._plugin || !this.activePlugin || !this._plugin.destroyBannerAd) return;
        this._pluginInitializePromise && await this._pluginInitializePromise;
        const i = t.children[0];
        if (!(i instanceof HTMLElement)) return;
        const n = (e.pluginOptions || {})[this.activePlugin];
        await this._plugin.destroyBannerAd({
            el: i,
            id: i.id
        }, n), t.removeChild(i);
    }
    async customRequest(t, ...e) {
        if (this.activePlugin) return await this.customRequestSpecific(this.activePlugin, t, ...e);
    }
    async customRequestSpecific(t, e, ...i) {
        if (t != this.activePlugin || !this._plugin || !this._plugin.customRequests) return;
        this._pluginInitializePromise && await this._pluginInitializePromise;
        const n = this._plugin.customRequests[e];
        return n ? n(...i) : void 0;
    }
}

class Hh {
    constructor(t) {
        this.adLad = t, this.currentDialogs = new Set, this.currentConstructors = new Set, 
        this.isPlayingAd = !1;
        let e = null;
        t.onNeedsPauseChange((t => {
            if (this.isPlayingAd = t, t) {
                e = null;
                for (const t of this.currentDialogs) t.reopenAfterAd && (e = t.constructor), t.close();
            } else e && this.showDialog(e);
        }));
    }
    showDialog(t, ...e) {
        if (this.currentConstructors.has(t)) throw new Error("A dialog of this type only supports showing a single instance");
        const i = new t(...e);
        return this.currentDialogs.add(i), i.forceSingleInstance && this.currentConstructors.add(t), 
        this.updateGamplayStart(), i.onClose((e => {
            this.currentDialogs.delete(i), this.currentConstructors.delete(t), !this.isPlayingAd && e && this.adLad.showFullScreenAd(), 
            this.updateGamplayStart();
        })), i;
    }
    updateGamplayStart() {
        this.currentDialogs.size > 0 ? this.adLad.gameplayStop() : this.adLad.gameplayStart();
    }
}

class zh {
    constructor(t) {
        this.canvas = document.createElement("canvas"), this.canvas.classList.add("ui-particles"), 
        t.appendChild(this.canvas), this.ctx = this.canvas.getContext("2d"), window.addEventListener("resize", (() => {
            this.onResize();
        })), this.onResize(), this.groups = new Set;
    }
    onResize() {
        const t = globalThis.devicePixelRatio;
        this.canvas.width = window.innerWidth * t, this.canvas.height = window.innerHeight * t;
    }
    loop(t, e) {
        if (this.ctx) {
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
            for (const i of this.groups) i.loop(this.ctx, t, e), i.canDestroy && this.groups.delete(i);
        }
    }
    createGroup(t, ...e) {
        const i = new t(...e);
        return this.groups.add(i), i;
    }
}

class Gh {
    constructor() {
        this.scene = new ts, this.scene.background = new ye(0, 0, 0), this.maxDt = 100, 
        this.now = 0, this.prevNow = 0, this.dt = 0;
        const t = [];
        let e = "none";
        t.push(function() {
            let t, e = !1, i = !1;
            return {
                name: "poki",
                async initialize(i) {
                    if (e) throw new Error("Poki plugin is being initialized more than once");
                    e = !0, t = i, await i.loadScriptTag("/poki-sdk.js"), 
                    await PokiSDK.init();
                },
                manualNeedsMute: !0,
                async loadStop() {
                    i || (i = !0, PokiSDK.gameLoadingFinished());
                },
                async gameplayStart() {
                    PokiSDK.gameplayStart();
                },
                async gameplayStop() {
                    PokiSDK.gameplayStop();
                },
                async showFullScreenAd() {
                    let e = !1, i = null;
                    try {
                        await PokiSDK.commercialBreak((() => {
                            e = !0, t.setNeedsMute(!0);
                        }));
                    } catch (t) {
                        console.warn("PokiSDK commercialBreak call was rejected", t), e = !1, i = "unknown";
                    } finally {
                        t.setNeedsMute(!1);
                    }
                    return e || i || (i = "no-ad-available"), {
                        didShowAd: e,
                        errorReason: i
                    };
                },
                async showRewardedAd() {
                    let e = !1, i = null;
                    try {
                        e = await PokiSDK.rewardedBreak((() => {
                            t.setNeedsMute(!0);
                        }));
                    } catch (t) {
                        console.warn("PokiSDK rewardedBreak call was rejected", t), e = !1, i = "unknown";
                    } finally {
                        t.setNeedsMute(!1);
                    }
                    return {
                        didShowAd: e,
                        errorReason: i
                    };
                },
                showBannerAd(t) {
                    const e = [ {
                        w: 728,
                        h: 90
                    }, {
                        w: 300,
                        h: 250
                    }, {
                        w: 970,
                        h: 250
                    }, {
                        w: 160,
                        h: 600
                    }, {
                        w: 320,
                        h: 50
                    } ];
                    let i = null, n = 0;
                    for (const r of e) {
                        if (r.w > t.width) continue;
                        if (r.h > t.height) continue;
                        const e = r.w * r.h;
                        e > n && (n = e, i = r);
                    }
                    if (!i) return;
                    const r = i.w + "x" + i.h;
                    PokiSDK.displayAd(t.el, r);
                },
                destroyBannerAd(t) {
                    PokiSDK.destroyAd(t.el);
                },
                customRequests: {
                    async getShareableUrl(...t) {
                        const e = new URLSearchParams(...t), i = {};
                        for (const [t, n] of e.entries()) i[t] = n;
                        return await PokiSDK.shareableURL(i);
                    },
                    getUrlParam: t => PokiSDK.getURLParam(t)
                }
            };
        }()), e = "poki";
        const i = {
            plugins: t,
            plugin: "poki"
        };
        if (this.adLad = new kh(i), this.adLad.onNeedsMuteChange((t => {
            this.sfx.setMutedAds(t);
        })), this.assetsLoaded = !1, this.initialGameplayStartFired = !1, this.gameContainer = document.getElementById("gameContainer"), 
        !this.gameContainer) throw new Error("game elements not found");
        this.assets = new Lh, this.dialogManager = new Hh(this.adLad), this.renderer = new wl(this.scene), 
        this.renderer.init(this.gameContainer), this.game = new bl(this, this.scene, this.gameContainer), 
        this.cam = new Sl(this.scene), this.sfx = new Uh, this.uiParticles = new zh(this.gameContainer), 
        this.boundLoop = this.vsyncLoop.bind(this);
    }
    init() {
        this.assets.init(), this.sfx.init(), this.sfx.setMutedSettings(!1), this.sfx.playSound("backgroundMusic"), 
        this.sfx.playSound("ambient"), this.game.init(), (async () => {
            const t = new Promise((t => {
                const e = 0 - performance.now();
                e < 0 ? t() : setTimeout((() => {
                    t();
                }), e);
            }));
            await Promise.all([ t, this.assets.crateAsset ]), this.assetsLoaded = !0, this.adLad.loadStop(), 
            hideLoadingScreen(), this.adLad.showFullScreenAd();
        })(), window.requestAnimationFrame(this.boundLoop);
    }
    fireInitialGameplayStart() {
        this.assetsLoaded && (this.initialGameplayStartFired || (this.initialGameplayStartFired = !0, 
        this.adLad.gameplayStart()));
    }
    vsyncLoop() {
        this.loop(), window.requestAnimationFrame(this.boundLoop);
    }
    loop() {
        let t = performance.now();
        this.prevNow <= 0 && (this.prevNow = t);
        const e = t - this.prevNow;
        if (0 == e) return;
        const i = Math.min(e, this.maxDt);
        this.prevNow = t, this.now += i, t = this.now, this.dt = i, this.game.loop(t, i), 
        this.sfx.loop(t, i), this.cam.loop(t, i), this.game.expandGridFromFrustum(), this.renderer.loop(t, i), 
        this.uiParticles.loop(t, i);
    }
}

let Vh = "";

if (window.Intl && Intl.RelativeTimeFormat) {
    const t = new Intl.RelativeTimeFormat, e = Date.now() / 1e3 - Number("1699441930");
    Vh = e < 60 ? t.format(-Math.floor(e), "second") : e < 3600 ? t.format(-Math.floor(e / 60), "minute") : e < 86400 ? t.format(-Math.floor(e / 60 / 60), "hour") : e < 31536e3 ? t.format(-Math.floor(e / 60 / 60 / 24), "day") : t.format(-Math.floor(e / 60 / 60 / 24 / 365), "year"), 
    Vh = " (" + Vh + ")";
}

console.log("loading v1699441930" + Vh);

const Wh = new Gh;

function jh() {
    return Wh;
}

Wh.init();

export { Gh as Main, jh as getMainInstance };
