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

    header() {
	return __('div', {id: 'header'},
		  'header here')}
    
    body() {
	return __('div', {id: 'body'},
		  'body here')}	
    
    footer() {
	return __('div', {id: 'body'},
		  'footer here')}	
	    
    render() {
        return __(
	    'div', {id: 'wrapper'},
	    this.header(),
	    this.body(),
	    this.footer())}}

export default InfernoRedux.connect(map_state_to_props, map_dispatch_to_props)(Home)
