import {load_streams, receive_document, receive_stream} from 'actions'
import __                 from 'jsml'
import InfernoRedux       from 'inferno-redux'
import config             from 'config'
import Component          from 'inferno-component'


function get_static_img(lat, lon) {
    var coords     = lat.toString() + ',' + lon.toString()
    return "https://maps.googleapis.com/maps/api/staticmap?center="
	+ coords + "&zoom=17&size=300x300&maptype=roadmap&markers=color:blue%7Clabel:S%7C"
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

function get_coords(tweet) {
    if (tweet.lngLat) 
	return [tweet.lngLat[1],
		tweet.lngLat[0]]
    if (tweet.ip_lat)
	return [tweet.ip_lat,
		tweet.ip_lng]
    if (tweet.data
	&& tweet.data.broadcast
	&& tweet.data.broadcast.data) {
	var data = tweet.data.broadcast.data
	if (data.lngLat) 
	    return [data.lngLat[1],
		    data.lngLat[0]]
	if (data.ip_lat)
	    return [data.ip_lat,
		    data.ip_lng] }
    return false }


function map_dispatch_to_props(dispatch) {
    var act = 
        {load_streams:      (term, geoloc)  => dispatch(load_streams(term, geoloc)),
	 receive_document:  (document)      => dispatch(receive_document(document)),
	 receive_stream:    (stream)        => dispatch(receive_stream(stream))}
    return {act}}

class Home extends Component {
    constructor(...args) {
        super(...args)
        var me = this

	this.state  = {only_live: false}
	this.socket = io();
	this.socket.on('connect', () => {
	    this.socket.on('receive_stream', (data) => {
		console.log('receive_stream', data)
		this.props.act.receive_stream(data) })
	    this.socket.on('receive_document', (data) => {
		this.props.act.receive_document(data) })
	    console.log('constructing')
	    if (window.location.hash) 
		this.load_document(window.location.hash.slice(1))
	    else 
		this.create_document() })}

    create_document() {
	var id = [(new Date() - 1).toString(),
		  Math.random().toString().slice(2)].join(':')
	console.log('creating')
	this.socket.emit('init_document', { id: id }); }

    update_search(e) {
	var query = this.refs.search.value
	this.props.act.load_streams(this.socket, query, undefined, this.refs.only_live.value) }

    perform_search(term) {
	this.refs.search.value = term
	this.update_search() }

    componentDidMount() {
	if (query_parameter('term'))
	    this.perform_search(query_parameter('term')) }

    load_document(id) {
	this.socket.emit('get_document', {id: id})}
    
    update_columns(e) {
	var val = Number.parseInt(this.refs.columns.value)
	console.log('new val', val, this.refs.columns.value, this.refs.columns)
	this.setState({columns_count: val}) }

    header() {
	return __(
	    'nav', {id:        'header',
		    className: 'nav'},
	    __('div', {className: 'nav-left'},
	       __('a', {className: 'nav-item'},
		  "hiveStream")),
	    __('div', {className: 'nav-center'},
	       __('div', {className: 'nav-item'},
		  __('div', {className: 'field'},
		     __('p', {},
			__('input', {type:          "text",
				     className:     "input ",
				     ref:            ref_for(this, "search"),
				     onChange:       this.update_search.bind(this),
				     placeholder:   "Search terms"}),
			false && __('select', {className:     "select input ",
				      ref:            ref_for(this, "columns"),
				      onChange:       this.update_columns.bind(this)},
			   __('option', {value: 3}, "Columns #"),
			   __('option', {value: 1}, "1"),
			   __('option', {value: 2}, "2"),
			   __('option', {value: 3}, "3"),
			   __('option', {value: 4}, "4"),
			   __('option', {value: 5}, "5"),
			   __('option', {value: 6}, "6"),
			   __('option', {value: 7}, "7"),
			   __('option', {value: 8}, "8"),
			   __('option', {value: 9}, "9"), 
				   ))),
		  __('div', {className: 'field',
			     style: 'margin-bottom:0.75em;margin-left:0.5em'},
		     __('p', {},
			__('label', {},
			   __('input', {className: 'field',
					type: 'checkbox',
					selected:  this.state.only_live,
					value:     this.state.only_live,
					onChange: () => {
					    this.setState({only_live: !this.state.only_live})},
					ref: ref_for(this, 'only_live')}),
			   'live streams only'))),
		  __('div', {className: 'field',
			     style: 'margin-bottom:0.75em;margin-left:0.5em'},
		     __('p', {},
			__('button', {className: 'button',
				      onClick:    this.update_search.bind(this)},
			   'search')
		       )))),
	    __('div', {className: 'field',
			     style: 'margin-bottom:0.75em;margin-left:0.5em'},
	       __('p', {},
		  this.props.streams.spinning && __('div', {className: "spinner"},
					    __('div', {className: "bounce1"}),
					    __('div', {className: "bounce2"}),
					    __('div', {className: "bounce3"})))),
			
	    __('div', {className: 'nav-right'},
	       __('div', {className: 'nav-item'},
		  __('div', {dangerouslySetInnerHTML: {__html: "&nbsp;"}}, ''))))}

    streams() {
	var streams = (this.props.streams
		       && this.props.streams.streams || [])
	    .sort(this.sort_streams.bind(this))
	    .filter((stream) => !this.state.only_live
		    ? true
		    : this.is_live(stream))
	    .slice(0, 40)
	return streams }

    sort_streams(a, b) {
	return ((this.is_live(a) ? new Date() - 1 : 0) + (new Date(a.created_at || (a.data && a.data.created_at)))
		- ((this.is_live(b) ? new Date() - 1 : 0) + new Date(b.created_at || (b.data && b.data.created_at)))) }

    process_html(html) {
	var vids = html.match(/<a href="https:\/\/t.co.*?<\/a>/g)
	return html.replace(
		/<blockquote class="twitter-tweet">.*?<\/blockquote>/,
	    '<blockquote class="twitter-tweet"><p lang="en" dir="ltr">. ' + vids.join("")
		+ '</p></blockquote>')}

    tweet_offset(oembed, stream) {
	if (!oembed)
	    return console.log('no ombed', stream)
	var html = oembed.replace(
	    /.*<blockquote class="twitter-tweet"><p lang="en" dir="ltr">(.*?)<\/p>.*/,
	    '$1')
	var tester = document.getElementById('tweet-size-tester')
	tester.innerHTML = html
	return tester.getBoundingClientRect().height  + 114}


    is_live(stream) {
	if (stream.data
	    && stream.data.broadcast 
 	    && stream.data.broadcast.isEnded)
	    return false
	if (stream.isEnded
	    || (stream.data && stream.data.isEnded))
	    return false
	return true }
    
    render_stream(stream) {
	var img = false
	var coords = get_coords(stream)
	if (coords) {
	    img = __('img', {src: get_static_img(coords[0],
						 coords[1]),
			     width: '150px',
			     height: '150px'}) }
	return __(
	    'div', {key: stream.data.id || stream.data.broadcast.data.id,
		    className: 'stream'},
	    __('div', {className: 'card'},
	       __('div', {className: 'header'},
		  __('a', {href: 'https://periscope.tv/' + stream.username},
		     "@", stream.username)),
	       __('div', {className: 'card-content'},
		  __('div', {className: 'content'},
		     __('div', {className: 'tweet-wrapper'},
			__('div', {className: 'tweet-inner-wrapper',
				   style:     "top: " + ((0 - this.tweet_offset(stream.oembed.html, stream)).toString() + 'px!important'),
				   dangerouslySetInnerHTML: {__html: stream.oembed && (stream.oembed.html || "")}})))),
	       img && img,
	       false && __('footer', {className: 'card-footer'},
		  __('div', {className: 'card-footer-item'},
		     stream.locationDescription || ""),
		  __('div', {className: 'card-footer-item'},
		     stream.state || ""))))}

    body() {
	return __('div', {id: 'body'},
		  __('section', {className: 'section'},
			__('div', {className: ''},
			   this.render_streams(this.streams()))))}
    
    render_streams(streams) {
	var rendered = []
	var full     = []
	for (var i in streams) {
	    var stream = streams[i]
	    rendered.push(this.render_stream(stream))
	    var j = Number.parseInt(i) + 1

	    if (j % 4 == 0 && false) {
		full.push(__('div', {className: "tile is-ancestor"}, rendered))
		rendered = [] }}
	full.push(__('div',  {className: "stream-container"}, rendered))
	return full }
    
    footer() {
	return __('div', {id: 'body'},
		  __('a', {href: 'https://github.com/davidkarn/livestream_agg'},
		     ' github'),
		  '')}	
	    
    render() {
	setTimeout(() => twttr.widgets.load(),
		   500)
        return __(
	    'div', {id: 'wrapper'},
	    this.header(),
	    this.body(),
	    this.footer())}}

export default InfernoRedux.connect(map_state_to_props, map_dispatch_to_props)(Home)
