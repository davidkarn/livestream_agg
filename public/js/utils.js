'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

function print_stack() {
  var e = new Error('dummy');
  var stack = e.stack.replace(/^[^\(]+?[\n$]/gm, '')
      .replace(/^\s+at\s+/gm, '')
      .replace(/^Object.<anonymous>\s*\(/gm, '{anonymous}()@')
      .split('\n');
  console.log(stack); }

function param_caller(param) {
    return function (o) {
        return o[param]()}}

function remove_element(element) {
    if (element && element.parentNode)
        element.parentNode.removeChild(element) }

function get_option(key) {
    return get_options()[key] }

function set_option(key, value) {
    var options   = get_options()
    options[key]  = value
    set_options(options)
    return value }

function get_options() {
    if (!localStorage['settings']) return {}
    return JSON.parse(localStorage['settings']) }

function set_options(options) {
    return localStorage['settings'] = JSON.stringify(options) }

function concat(a1, a2) {
    return a1.concat(a2) }

function plot_group_title(group) {
    var dims      = canvas_word_dims(group.name, 14)
    var center    = bubble_center(group)
    group.title_position = { x: center.x - dims.width / 2,
                             y: center.y - dims.height / 2 }}

function curry(that) {
    var args = to_array(arguments).slice(1)

    return function () {
        var oldargs   = args.slice(0)
        var newargs   = to_array(arguments)
        var j         = 0
        
        for (var i in oldargs) {
            if (oldargs[i] === undefined) {
                oldargs[i] = newargs[j];
                j += 1 }}

        var as = oldargs.concat(newargs.slice(j));
        
        if (that instanceof Array)
            return that[0].apply(that[1], as)
        else return that.apply(that, as) }}

function to_array(what) {
    var i
    var ar = []

    for (i = 0; i < what.length; i++) 
        ar.push(what[i])

    return ar }

function param_tester(key, value) {
    return function (obj) {
        return obj[key] == value }}

function tester(value) {
    return function (v) {
        return v == value }}

function not_tester(value) {
    return function (v) {
        return v != value }}

function clone(i) {
    if (i instanceof Array) return i.map(clone)

    if ((typeof i === 'undefined'
         ? 'undefined'
         : _typeof(i)) != "object") return i

    var o = {}
    for (var j in i) 
        o[j] = clone(i[j])

    return o }

function http_ws(method, url, data, success, fail) {
    var id = Math.rand()
    socket.emit('web_command', { method:  method,
                                 url:     url,
                                 data:    data,
                                 id:      id })
    socket.on('web_command_response_' + id, function (response) {
        success(response) })}

function http(method, url, data, success, fail) {
  var xmlhttp = new XMLHttpRequest()

    var url = url + (method == 'get' ? '?' + obj_to_urlstring(data) : '')
    
    fail = fail || function (x) {
        console.error('error on http call', method, url, data, x) }

    xmlhttp.open(method || 'get', url, true);
    xmlhttp.setRequestHeader("Content-Type", method == 'get' ? "application/x-www-form-urlencoded" : "application/json")

    xmlhttp.onreadystatechange = function () {
        if (xmlhttp.readyState == 4) {
            if (xmlhttp.status == 200) {
                success(JSON.parse(xmlhttp.responseText));
            } else {
		fail(xmlhttp.responseText)
                Raven.captureMessage(xmlhttp.responseText, {
                    extra: {
                        method: method,
                        url: url,
                        data: data,
                        status: xmlhttp.status,
                        error: xmlhttp.responseText } }); }}}

    if ((typeof data === 'undefined'
         ? 'undefined'
         : _typeof(data)) == "object"
        && method == 'get')
        data = obj_to_urlstring(data)
    else if ((typeof data === 'undefined'
              ? 'undefined'
              : _typeof(data)) == "object"
             && (method == 'post' || method == 'put'))
        data = JSON.stringify(data)

    xmlhttp.send(data ? data : null) }

function http_json(method, url, data, success, fail, tries) {
    tries = tries || 1;
    if (!method || method == 'get') url += "?" + obj_to_urlstring(data);

    var xmlhttp = new XMLHttpRequest();
    xmlhttp.open(method || 'get', url, true);
    xmlhttp.timeout = 45 * 1000;
    xmlhttp.ontimeout = function () {
        tries += 1;
        if (tries > 2) return;

        setTimeout(curry(http_json, method, url, data, success, fail, tries), Math.random() * 3000);
    };
    xmlhttp.setRequestHeader("Content-Type", method == 'get' ? "application/x-www-form-urlencoded" : "application/json");
    xmlhttp.onreadystatechange = function () {
        if (xmlhttp.readyState == 4) {
            if (xmlhttp.status == 200) {
                console.log("HTTPRESPONSE", {method, url, data, tries,
                                             response: xmlhttp.responseText})  
                success(xmlhttp.responseText);
            } else fail(xmlhttp.responseText);
        }
    };

    if ((typeof data === 'undefined' ? 'undefined' : _typeof(data)) == "object" && method == 'get') data = obj_to_urlstring(data);else if ((typeof data === 'undefined' ? 'undefined' : _typeof(data)) == "object" && method == 'post') data = JSON.stringify(data);

    xmlhttp.send(data ? data : null);
}

function obj_to_urlstring(obj) {
    var strs = []

    for (var key in obj) 
        strs.push(key + "=" + encodeURIComponent(obj[key]))

    return strs.join("&") }

function do_nothing() {}

function sel(sel, el) {
    return (el || document).querySelector(sel) }

function sel_all(sel, el) {
    return to_array((el || document).querySelectorAll(sel))}

function o(fna, fnb) {
    return function (arg) {
        fna(fnb(arg)) }}

function member(ar, value) {
    return ar.indexOf(value) >= 0 }

function object_matches(obj, pattern) {
    for (var i in pattern) 
        if (obj[i] != pattern[i])
            return false
    
    return true }

function set_styles(el, styles) {
    for (var i in styles) 
        el.style[i] = styles[i]

    return el }

function set_attributes(el, attrs) {
    for (var key in attrs) 
        el.setAttribute(key, attrs[key])

    return el }

function set_styles(el, attrs) {
    for (var key in attrs) 
        el.style[key] = attrs[key]
    return el }

function add_style(css) {
    var head = document.getElementsByTagName('head')[0]
    if (!head) head = document.body

    var style    = document.createElement('style')
    style.type   = 'text/css'
    if (style.styleSheet)
        style.styleSheet.cssText = css
    else style.appendChild(document.createTextNode(css))

    head.appendChild(style) }

function get_offset(el, addto) {
    var offset = { top: el.offsetTop,
        left: el.offsetLeft };

    if (addto) {
        offset.top += addto.top;
        offset.left += addto.left;
    }

    if (!el.offsetParent) return offset;

    return get_offset(el.offsetParent, offset);
}

function get_bounds(el) {
    var offset = get_offset(el);
    var bounds = el.getBoundingClientRect();

    offset.width = bounds.width;
    offset.height = bounds.height;

    return offset;
}

function create_element(tag_name, attributes, inner_html) {
    var tag = document.createElement(tag_name);
    set_attributes(tag, attributes);
    tag.innerHTML = inner_html || '';
    return tag;
}

function create_text(text) {
    return document.createTextNode(text);
}

function post_message(message) {
    console.log(message);
}

function go_to(path) {
    var splitup = path.split('/').filter(function (x) {
        return x;
    });
    var id = splitup[1];

    if (splitup[0] == 'conversation') return Android.goto_conversation(id);
    if (splitup[0] == 'group') return Android.goto_group(id);

    post_message({ command: 'go_to',
        where: path });
}
//  window.location.hash = "#" + path; }

function returner(x) {
    return function () {
        return x;
    };
}

function random_id(length) {
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    for (var i = 0; i < (length || 16); i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    }return text;
}

function print(x) {
    console.log(x);
}

function print_err(x) {
    console.log('error', x);
}

function lookup_gravatar(email, size, default_url, user) {
    var hash = md5(email.toString().trim().toLowerCase());
    size = size || 50;

    return 'https://www.gravatar.com/avatar/' + hash + '&s=' + size.toString();
}

function lookup_gravatar_list(emails, size, default_url, user) {
    uniq(emails).slice(0, 3).reverse().map(function (email) {
        if (email) url = lookup_gravatar(email, size);
    });
    return url;
}

function extractor(key) {
    return function (d, i) {
        return d[key];
    };
}

function uniq(ar) {
    var found = [];

    for (var i in ar) {
        if (found.indexOf(ar[i]) < 0) found.push(ar[i]);
    }return found;
}

function hash(obj) {
    if (!obj) return 0
    if (typeof obj != "string") obj = JSON.stringify(obj);
    var hash = 0,
        i,
        chr,
        len;
    if (obj.length == 0) return hash;
    for (i = 0, len = obj.length; i < len; i++) {
        chr = obj.charCodeAt(i);
        hash = (hash << 5) - hash + chr;
        hash |= 0; // Convert to 32bit integer 
    }
    return hash;
}

function values(ar) {
    var ret = [];
    for (var i in ar) {
        ret.push(ar[i]);
    }return ret;
}

Object.values = values

function keys(ar) {
    var ret = [];
    for (var i in ar) {
        ret.push(i);
    }return ret;
}

Object.keys = keys

function overlaps(list1, list2) {
    for (var i in list1) {
        for (var j in list2) {
            if (list1[i] == list2[j]) return true;
        }
    }return false;
}

function keys_set(array) {
    var ret = [];
    for (var key in array) {
        if (array[key]) ret.push(key);
    }return ret;
}

function toast(type, message) {
    toastr.options = {
        "closeButton": true,
        "debug": false,
        "positionClass": "toast-bottom-right",
        "onclick": null,
        "showDuration": "300",
        "hideDuration": "1000",
        "timeOut": "5000",
        "extendedTimeOut": "1000",
        "showEasing": "swing",
        "hideEasing": "linear",
        "showMethod": "fadeIn",
        "hideMethod": "fadeOut"
    };

    toastr[type](message);
}

function sort_sections(sections, fieldname) {
    var list = values(sections).map(function (section) {
        section[fieldname].sort(function (c1, c2) {
            return c1 < c2 ? -1 : c1 == c2 ? 0 : 1;
        });
        return section;
    });

    list.sort(function (section1, section2) {
        return section1.letter < section2.letter ? -1 : 1;
    });

    return list.filter(extractor('letter'));
}

function parse_file_on_change(input, next) {
    if (!$(input)[0].files[0]) return next(undefined);
    var reader = new FileReader();

    reader.onload = function (e) {
        next(new Parse.File($(input)[0].files[0].name, { base64: btoa(e.target.result) }));
    };

    reader.readAsBinaryString($(input)[0].files[0]);
}

function ref_checked(ref) {
    return ref.checked;
}

function ref_value(ref) {
    return ref.value;
}

function ref_set_checked(ref, value) {
    return ref.checked = value;
}

function ref_set_value(ref, value) {
    return ref.value = value || "";
}

function ref_set_image(ref, image) {
    if (image) return ref.src = image.url();
}

function ref_inner_html(ref) {
    return ref.innerHTML;
}

function ref_set_html(ref, html) {
    return ref.innerHTML = html;
}

function ref_set_src(ref, val) {
    return $(ref).attr('src', val);
}

function success(next) {
    return { success: next || do_nothing, error: print_err };
}

function in_sequence(callbacks, next) {
    function go() {
        var callback = callbacks.shift();

        if (!callback) (next || do_nothing)();else callback(go);
    }

    go();
}

function inject_into(obj1, obj2) {
    for (var i in obj2) {
        obj1[i] = obj2[i];
    }return obj1;
}

function view_contact(contact) {
    go_to('/profile/view/' + contact.id);
}

function object_in_list(object, list) {
    for (var i in list) {
        if (list[i].id == object.id) return true;
    }return false;
}

function joiner(a1, a2) {
    return a1.concat(a2);
}

function user_media() {
    get_user_media.apply(navigator, arguments);
}

function link_user_media(next, options) {
    options = options || {};
    return user_media(array_merge({ video: false, audio: true }, options), function (stream) {
        next(stream);
    }, options.error || do_nothing);
}

function link_video(el, stream) {
    el.src = URL.createObjectURL(stream);
}

function array_intersect(a1, a2) {
    var intersection = [];
    for (var i in a1) {
        if (member(a2, a1[i])) intersection.push(a1[i]);
    }return intersection;
}

function array_merge(a1, a2) {
    var a1 = clone(a1);
    for (var i in a2) {
        a1[i] = a2[i];
    }return a1;
}

function members_not_in(from, inn) {
    var exceptions = [];
    for (var i in from) {
        if (!member(inn, from[i])) exceptions.push(from[i]);
    }return exceptions;
}

function extractor() {
    var fields = to_array(arguments);
    return function (obj) {
        var extracted = {};
        for (var i in fields) {
            extracted[fields[i]] = obj[fields[i]];
        }return extracted;
    };
}

function print() {
    console.log(arguments);
}

function is_empty_object(o) {
    if (!((typeof o === 'undefined' ? 'undefined' : _typeof(o)) == "object") || o instanceof Array) return false;

    var j = 0;
    for (var i in o) {
        j++;
    }return j == 0;
}

function query_parameters() {
    var params = {};
    var s = window.location.href.split('?');
    if (!s[1]) return {};

    var lines = s[1].split('&');
    lines.map(function (line) {
        var param = line.split('=');
        if (param[0] && param[1]) params[param[0]] = decodeURIComponent(param[1] || '');
    });

    return params;
}

function query_parameter(key) {
    return (query_parameters() || {})[key];
}

function last(lis) {
    return (lis || []).length == 0 ? null : lis[lis.length - 1];
}

function first(lis) {
    return (lis || []).length >= 1 ? lis[0] : undefined;
}

function rest(lis) {
    return (lis || []).slice(1);
}

function position_difference(a, b) {
//    a = a || {x: 0, y: 0}
//    b = b || {x: 0, y: 0}
    return { x: a.x - b.x,
             y: a.y - b.y };
}

function position_sum(a, b) {
    var pos = { x: a.x, y: a.y };
    for (var i = 1; i < arguments.length; i++) {
        pos.y += arguments[i].y;
        pos.x += arguments[i].x;
    }
    return pos;
}

               function random_member(list) {
    var x = Math.floor(Math.random() * list.length);
    return list[x];
}

function random_color() {
    return { hue: Number.parseInt(Math.random() * 360),
        saturation: 84, //30,
        lightness: 97, //75,
        opacity: 0.95 };
}

function seeded_random(seed) {
    var x = Math.sin(hash(seed)) * 10000;
    return x - Math.floor(x); }

function random_color_seeded(seed) {
    var x = seeded_random(seed)
    return { hue: x * 360,
        saturation: 84, //30,
        lightness: 40,
        opacity: 0.95 }}

function hsla_color(color) {
    return 'hsla(' + color.hue + ',' + color.saturation + '%,' + color.lightness + '%, ' + color.opacity + ')';
}

function rgba_color(color) {
    return 'rgba(' + color[0] + ',' + color[1] + ',' + color[2] + ',' + (color[3] || '1.0') + ')';
}

Math.seed = function (s) {
    var m_w = 987654321 + s;
    var m_z = 123456789 - s;
    var mask = 0xffffffff;

    return function () {
        m_z = 36969 * (m_z & 65535) + (m_z >> 16) & mask;
        m_w = 18000 * (m_w & 65535) + (m_w >> 16) & mask;

        var result = (m_z << 16) + m_w & mask;
        result /= 4294967296;

        return result + 0.5;
    };
};

function param_returner(x) {
    return function (y) {
        return y[x];
    };
}


function slice_every(str, len) {
    var sliced = []
    var i = 0;
    while (i < str.length) {
        sliced.push(str.slice(i, i + len))
        i += len }
    return sliced }
function get_boundries(positions) {
    var boundries = { top: 9999999,
        bottom: 0,
        left: 9999999,
        right: 0 };

    for (var i in positions) {
        var pos = positions[i].position;
        var radius = positions[i].radius;
        if (pos && radius) {
            boundries.top = Math.min(boundries.top, pos.y - radius);
            boundries.bottom = Math.max(boundries.bottom, pos.y + radius);
            boundries.left = Math.min(boundries.left, pos.x - radius);
            boundries.right = Math.max(boundries.right, pos.x + radius); }
    }

    return boundries;
}

function obj_eq( x, y, filter_paths, filter_functions, deep_filter_paths) {
  if ( x === y ) return true;
    // if both x and y are null or undefined and exactly the same

  if ( ! ( x instanceof Object ) || ! ( y instanceof Object ) ) return false;
    // if they are not strictly equal, they both need to be Objects

    for ( var p in x ) {
        if ((filter_functions && typeof x[p] == 'function')
            || (filter_paths && member(filter_paths, p))) continue;
        if ( ! x.hasOwnProperty( p ) ) continue;
      // other properties were tested using x.constructor === y.constructor

        if ( ! y.hasOwnProperty( p ) )  { return false;}
      // allows to compare x[ p ] and y[ p ] when set to undefined

        if ( x[ p ] === y[ p ] ) continue;
      // if they have the same strict value or identity then they are equal

        if ( typeof( x[ p ] ) !== "object" ) { return false;}
      // Numbers, Strings, Functions, Booleans must be strictly equal

        if ( ! obj_eq( x[p],
                       y[p],
                       deep_filter_paths && (deep_filter_paths[p] instanceof Array) && deep_filter_paths[p],
                       filter_functions,
                       deep_filter_paths && deep_filter_paths[p]) )  { return false;}
      // Objects and Arrays must be tested recursively
  }

  for ( p in y ) {
    if ( y.hasOwnProperty( p ) && ! x.hasOwnProperty( p ) )  { return false;}
      // allows x[ p ] to be set to undefined
  }
  return true;
}
 
function reverse_safe(a) {
    var x = []
    for (var i = a.length - 1;
         i >= 0;
         i--)
        x.push(a[i])
    return x }

function asset(relative_path) {
//    if (query_parameter('path'))
//        return 'nebulas-resource://' + relative_path
//        return atob(query_parameter('path')).match(/^.+\//)[0] + relative_path
    return '/assets/images/' + relative_path }

function zero_or(val, default_val) { 
    return (!val && val !== 0 && val !== 0.0) ? default_val : val }

function is_component(x) {
    if (!x)                         return false
    if (x.type)                     return is_component(x.type)
    if (x.name == "Component")      return true
    if (x.__proto__)                return is_component(x.__proto__)
    return false }

function ref_for(component, name) {
  return function(val) {
    if (!component.refs) component.refs = {}
        component.refs[name]       = val }}

function update_tester() {
    return function(props, new_props) {
        var r = false
        for (var i in arguments)
            if (props[arguments[i]] != new_props[arguments[i]]) {
                r = true }
        return r }}


// since atob doesnt work with foreign characters
var Base64 = {
    _keyStr : "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",
    encode : function (input) {
        var output = "";
        var chr1, chr2, chr3, enc1, enc2, enc3, enc4;
        var i = 0;
        input = Base64._utf8_encode(input);
        while (i < input.length) {
            chr1 = input.charCodeAt(i++);
            chr2 = input.charCodeAt(i++);
            chr3 = input.charCodeAt(i++);
            enc1 = chr1 >> 2;
            enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
            enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
            enc4 = chr3 & 63;
            if (isNaN(chr2)) {
                enc3 = enc4 = 64;
            } else if (isNaN(chr3)) {
                enc4 = 64;
            }
            output = output +
            this._keyStr.charAt(enc1) + this._keyStr.charAt(enc2) +
            this._keyStr.charAt(enc3) + this._keyStr.charAt(enc4);
        }
        return output;
    },
    decode : function (input) {
        var output = "";
        var chr1, chr2, chr3;
        var enc1, enc2, enc3, enc4;
        var i = 0;
        input = input.replace(/[^A-Za-z0-9\+\/\=]/g, "");
        while (i < input.length) {
            enc1 = this._keyStr.indexOf(input.charAt(i++));
            enc2 = this._keyStr.indexOf(input.charAt(i++));
            enc3 = this._keyStr.indexOf(input.charAt(i++));
            enc4 = this._keyStr.indexOf(input.charAt(i++));
            chr1 = (enc1 << 2) | (enc2 >> 4);
            chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
            chr3 = ((enc3 & 3) << 6) | enc4;
            output = output + String.fromCharCode(chr1);
            if (enc3 != 64) {
                output = output + String.fromCharCode(chr2);
            }
            if (enc4 != 64) {
                output = output + String.fromCharCode(chr3);
            }
        }
        output = Base64._utf8_decode(output);
        return output;
    },
    _utf8_encode : function (string) {
        string = string.replace(/\r\n/g,"\n");
        var utftext = "";
        for (var n = 0; n < string.length; n++) {
            var c = string.charCodeAt(n);
            if (c < 128) {
                utftext += String.fromCharCode(c);
            }
            else if((c > 127) && (c < 2048)) {
                utftext += String.fromCharCode((c >> 6) | 192);
                utftext += String.fromCharCode((c & 63) | 128);
            }
            else {
                utftext += String.fromCharCode((c >> 12) | 224);
                utftext += String.fromCharCode(((c >> 6) & 63) | 128);
                utftext += String.fromCharCode((c & 63) | 128);
            }
        }
        return utftext;
    },
    _utf8_decode : function (utftext) {
        var string = "";
        var i = 0;
      var c = 0
      var c1 = 0
      var c2 = 0;
        while ( i < utftext.length ) {
            c = utftext.charCodeAt(i);
            if (c < 128) {
                string += String.fromCharCode(c);
                i++;
            }
            else if((c > 191) && (c < 224)) {
                c2 = utftext.charCodeAt(i+1);
                string += String.fromCharCode(((c & 31) << 6) | (c2 & 63));
                i += 2;
            }
            else {
                c2 = utftext.charCodeAt(i+1);
                c3 = utftext.charCodeAt(i+2);
                string += String.fromCharCode(((c & 15) << 12) | ((c2 & 63) << 6) | (c3 & 63));
                i += 3;
            }
        }
        return string;
    }
}


function xform_for(x, y) {
    return ('translate('
            + (x || 0) + ','
            + (y || 0) + ')') }
