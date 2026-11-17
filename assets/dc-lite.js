/* dc-lite: tiny template runtime for this site.
   Supports {{path}} holes, <sc-for>, <sc-if>, on* handlers and setState re-renders. */
(function () {
  'use strict';

  function DCLogic(props) { this.props = props || {}; this.state = {}; }
  DCLogic.prototype.setState = function (patch) {
    var next = typeof patch === 'function' ? patch(this.state, this.props) : patch;
    this.state = Object.assign({}, this.state, next);
    if (this.__render) this.__render();
  };
  DCLogic.prototype.forceUpdate = function () { if (this.__render) this.__render(); };
  window.DCLogic = DCLogic;

  var HOLE = /\{\{\s*([^}]+?)\s*\}\}/g;
  var WHOLE = /^\s*\{\{\s*([^}]+?)\s*\}\}\s*$/;

  function lookup(scope, path) {
    if (path === 'true') return true;
    if (path === 'false') return false;
    if (/^-?\d+(\.\d+)?$/.test(path)) return Number(path);
    if (/^'.*'$/.test(path)) return path.slice(1, -1);
    var parts = path.split('.');
    var v = scope;
    for (var i = 0; i < parts.length; i++) {
      if (v == null) return undefined;
      v = v[parts[i]];
    }
    return v;
  }
  function interp(str, scope) {
    return str.replace(HOLE, function (_, p) {
      var v = lookup(scope, p);
      return v == null ? '' : String(v);
    });
  }

  function renderChildren(src, out, scope, ctx) {
    for (var c = src.firstChild; c; c = c.nextSibling) renderNode(c, out, scope, ctx);
  }

  function renderNode(node, out, scope, ctx) {
    if (node.nodeType === 3) {
      out.appendChild(document.createTextNode(interp(node.nodeValue, scope)));
      return;
    }
    if (node.nodeType !== 1) return;
    var tag = node.localName;
    if (tag === 'sc-for') {
      var m = WHOLE.exec(node.getAttribute('list') || '');
      var list = m ? lookup(scope, m[1]) : [];
      var as = node.getAttribute('as') || 'item';
      (list || []).forEach(function (item, i) {
        var s = Object.create(scope);
        s[as] = item; s.$index = i;
        renderChildren(node, out, s, ctx);
      });
      return;
    }
    if (tag === 'sc-if') {
      var mm = WHOLE.exec(node.getAttribute('value') || '');
      if (mm && lookup(scope, mm[1])) renderChildren(node, out, scope, ctx);
      return;
    }
    var el = node.namespaceURI && node.namespaceURI !== 'http://www.w3.org/1999/xhtml'
      ? document.createElementNS(node.namespaceURI, node.tagName)
      : document.createElement(tag);
    for (var a = 0; a < node.attributes.length; a++) {
      var at = node.attributes[a];
      var name = at.name, val = at.value;
      if (name.indexOf('hint-') === 0) continue;
      if (/^on[a-z]+$/i.test(name)) {
        var hm = WHOLE.exec(val);
        var fn = hm ? lookup(scope, hm[1]) : null;
        if (typeof fn === 'function') {
          var id = 'h' + (ctx.n++);
          ctx.handlers[id] = fn;
          el.setAttribute('data-dc-' + name.slice(2).toLowerCase(), id);
        }
        continue;
      }
      try { el.setAttribute(name, interp(val, scope)); } catch (e) {}
    }
    renderChildren(node.content || node, el, scope, ctx);
    out.appendChild(el);
  }

  function boot() {
    var tpl = document.getElementById('dc-template');
    var logic = document.getElementById('dc-logic');
    var app = document.getElementById('app');
    if (!tpl || !app) return;
    var props = {};
    try {
      var decl = JSON.parse(logic.getAttribute('data-props') || '{}');
      Object.keys(decl).forEach(function (k) {
        if (k.charAt(0) !== '$' && decl[k] && 'default' in decl[k]) props[k] = decl[k]['default'];
      });
    } catch (e) {}
    var Comp = new Function('DCLogic', logic.textContent + '\nreturn Component;')(DCLogic);
    var inst = new Comp(props);
    inst.props = props;
    inst.state = inst.state || {};
    var handlers = {};
    var first = true;
    inst.__render = function () {
      var ctx = { handlers: {}, n: 0 };
      var vals = inst.renderVals ? inst.renderVals() : {};
      var frag = document.createElement('div');
      frag.id = 'app';
      renderChildren(tpl.content, frag, vals, ctx);
      handlers = ctx.handlers;
      if (first) { app.replaceWith(frag); app = frag; first = false; }
      else {
        window.morphdom(app, frag, {
          onBeforeElUpdated: function (from, to) {
            if (from.tagName === 'VIDEO') {
              for (var i = 0; i < to.attributes.length; i++) {
                var at = to.attributes[i];
                if (from.getAttribute(at.name) !== at.value) from.setAttribute(at.name, at.value);
              }
              return false;
            }
            return true;
          }
        });
      }
    };
    inst.__render();
    ['click', 'input', 'change'].forEach(function (type) {
      document.addEventListener(type, function (e) {
        var t = e.target && e.target.closest ? e.target.closest('[data-dc-' + type + ']') : null;
        if (!t) return;
        var fn = handlers[t.getAttribute('data-dc-' + type)];
        if (fn) {
          var ev = { currentTarget: t, target: e.target, nativeEvent: e, preventDefault: function () { e.preventDefault(); } };
          fn(ev);
        }
      });
    });
    if (inst.componentDidMount) inst.componentDidMount();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
