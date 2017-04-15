import {load_streams} from 'actions'
import __                 from 'jsml'
import InfernoRedux       from 'inferno-redux'
import config             from 'config'
import Component          from 'inferno-component'

function get_static_img(lat, lon) {
    var coords     = lon.toString() + ',' + lat.toString()
    return "https://maps.googleapis.com/maps/api/staticmap?center="
	+ coords + "&zoom=16&size=300x300&maptype=roadmap&markers=color:blue%7Clabel:S%7C"
	+ coords + "&key=AIzaSyA4eaooBciQJVFh82pP-034I6lzzJr2hZU"

    
    var gmAPI      = new GoogleMapsAPI();
    var params     = {
	center:     coords,
	zoom:       16,
	size:      '300x300',
	maptype:   'roadmap',
	markers:  [{location: coords,
		    label:    'l',
		    color:    'red',
		    shadow:    true}],
	style:    [{feature: 'road',
		    element: 'all',
		    rules:   {hue: '0x00ff00'}}]}
    return gmAPI.staticMap(params) }
    
function map_state_to_props(state) {
    return state }

function map_dispatch_to_props(dispatch) {
    var act = 
        {load_streams:        (term, geoloc)  => dispatch(load_streams(term, geoloc))}
    return {act}}

class Home extends Component {
    constructor(...args) {
        super(...args)
        var me = this }

    update_search(e) {
	var query = this.refs.search.value
	this.props.act.load_streams(query) }

    header() {
	return __(
	    'nav', {id:        'header',
		    className: 'nav'},
	    __('div', {className: 'nav-left'},
	       __('a', {className: 'nav-item'},
		  "LiveAgg")),
	    __('div', {className: 'nav-center'},
	       __('div', {className: 'nav-item'},
		  __('div', {className: 'field'},
		     __('p', {},
			__('input', {type:          "text",
				     className:     "input ",
				     ref:            ref_for(this, "search"),
				     onChange:       this.update_search.bind(this),
				     placeholder:   "Search terms"}))))),
	    __('div', {className: 'nav-right'},
	       __('div', {className: 'nav-item'},
		  __('div', {}, 'test'))))}

    streams() {
	var streams = ((this.props.streams
			&& this.props.streams.streams
			&& this.props.streams.streams.periscopes) || [])
	    .concat((this.props.streams
		     && this.props.streams.streams
		     && this.props.streams.streams.tweets) || [])
	    .sort(this.sort_streams)
	    .slice(0, 20)
	return streams }

    sort_streams(a, b) {
	return (new Date(a.created_at || (a.data && a.data.created_at))
		- new Date(b.created_at || (b.data && b.data.created_at))) }

    process_html(html) {
	var vids = html.match(/<a href="https:\/\/t.co.*?<\/a>/g)
	return html.replace(
		/<blockquote class="twitter-tweet">.*?<\/blockquote>/,
	    '<blockquote class="twitter-tweet"><p lang="en" dir="ltr">. ' + vids.join("")
		+ '</p></blockquote>')}
    
    render_stream(stream) {
	var img = false
	if (stream.lngLat) {
	    img = __('img', {src: get_static_img(stream.lngLat[0],
						 stream.lngLat[1]),
			     width: '150px',
			     height: '150px'}) }
	return __(
	    'div', {className: 'tile is-parent is-4'},
	    __('div', {className: 'tile is-child is-vertical card'},
	       __('div', {className: 'header'},
		  __('a', {href: 'https://periscope.tv/' + stream.username},
		     "@", stream.username)),
	       __('div', {className: 'card-content'},
		  __('div', {className: 'content'},
		     __('div', {dangerouslySetInnerHTML: {__html: stream.oembed && (stream.oembed.html || "")}}))),
	       img && img,
	       __('footer', {className: 'card-footer'},
		  __('div', {className: 'card-footer-item'},
		     stream.locationDescription || ""),
		  __('div', {className: 'card-footer-item'},
		     stream.state || ""))))}

    body() {
	return __('div', {id: 'body'},
		  __('section', {className: 'section'},
		     __('div', {className: 'container'},
			__('div', {className: ''},
			   this.render_streams(this.streams())))))}
    
    render_streams(streams) {
	var rendered = []
	var full     = []
	for (var i in streams) {
	    var stream = streams[i]
	    rendered.push(this.render_stream(stream))
	    if ((i + 1) % 3 == 0) {
		full.push(__('div', {className: "tile is-ancestor"}, rendered))
		rendered = [] }}
	full.push(__('div', {}, rendered))
	return full }
    
    footer() {
	return __('div', {id: 'body'},
		  'footer here')}	
	    
    render() {
	setTimeout(() => twttr.widgets.load(),
		   500)
        return __(
	    'div', {id: 'wrapper'},
	    this.header(),
	    this.body(),
	    this.footer())}}

export default InfernoRedux.connect(map_state_to_props, map_dispatch_to_props)(Home)
