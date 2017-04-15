import {load_streams} from 'actions'
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
        {load_streams:        (term, geoloc)  => dispatch(load_streams(term, geoloc))}
    return {act}}

class Home extends Component {
    constructor(...args) {
        super(...args)
        var me = this }

    update_search(e) {
	var query = this.refs.search.value
	this.props.act.load_streams(query, undefined, this.refs.only_live.value) }

    perform_serach(term) {
	this.refs.search.value = term
	this.update_search() }

    componentDidMount() {
	if (query_parameter('term'))
	    this.perform_serach(query_parameter('term')) }

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
				      onChange:       this.update_columns.bind(this),
				     },
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
					defaultChecked: true,
					defaultSelected: true,
					ref: ref_for(this, 'only_live')}),
			   'live streams only'))),
		  __('div', {className: 'field',
			     style: 'margin-bottom:0.75em;margin-left:0.5em'},
		     __('p', {},
			__('button', {className: 'button',
				      onClick:    this.update_search.bind(this)},
			   'search')
		       )))),
			
	    __('div', {className: 'nav-right'},
	       __('div', {className: 'nav-item'},
		  __('div', {dangerouslySetInnerHTML: {__html: "&nbsp;"}}, ''))))}

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
	var coords = get_coords(stream)
	if (coords) {
	    img = __('img', {src: get_static_img(coords[0],
						 coords[1]),
			     width: '150px',
			     height: '150px'}) }
	return __(
	    'div', {key: stream.data.id || stream.data.broadcast.data.id,
		    className: 'tile is-parent is-3'},
	    __('div', {className: 'tile is-child is-vertical card'},
	       __('div', {className: 'header'},
		  __('a', {href: 'https://periscope.tv/' + stream.username},
		     "@", stream.username)),
	       __('div', {className: 'card-content'},
		  __('div', {className: 'content'},
		     __('div', {className: 'tweet-wrapper'},
			__('div', {className: 'tweet-inner-wrapper',
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
		     __('div', {className: 'container'},
			__('div', {className: ''},
			   this.render_streams(this.streams())))))}
    
    render_streams(streams) {
	var rendered = []
	var full     = []
	for (var i in streams) {
	    var stream = streams[i]
	    rendered.push(this.render_stream(stream))
	    var j = Number.parseInt(i) + 1
	    console.log(i, j, j % 4, i % 4)
	    if (j % 4 == 0) {
		full.push(__('div', {className: "tile is-ancestor"}, rendered))
		rendered = [] }}
	full.push(__('div',  {className: "tile is-ancestor"}, rendered))
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
