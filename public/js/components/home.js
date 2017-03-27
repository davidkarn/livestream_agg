import {load_streams} from 'actions'
import __                 from 'jsml'
import InfernoRedux       from 'inferno-redux'
import config             from 'config'
import Component          from 'inferno-component'

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
	return this.props.streams.streams.periscopes.slice(0, 4) }

    render_stream(stream) {
	return __(
	    'div', {className: 'tile is-parent is-4'},
	    __('div', {className: 'tile is-child is-vertical card'},
	    __('div', {className: 'header'},
	       __('a', {href: 'https://periscope.tv/' + stream.username},
		  "@", stream.username)),
	    __('div', {className: 'card-content'},
	       __('div', {className: 'content'},
		  __('div', {dangerouslySetInnerHTML: {__html: stream.oembed.html}}))),
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
	    if ((i + 1) % 3 == 0 ) {
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
