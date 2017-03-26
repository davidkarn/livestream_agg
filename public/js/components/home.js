import {load_streams} from 'actions'
import Konva              from 'react-konva'
import __                 from 'jsml'
import InfernoRedux       from 'inferno-redux'
import config             from 'config'
import Component          from 'inferno-component'

function map_state_to_props(state) {
    return state }

function map_dispatch_to_props(dispatch) {
    var act = 
        {load_streamd:        (term, geoloc)  => dispatch(load_streams(term, geoloc))}
    return {act}}

class Home extends Component {
    constructor(...args) {
        super(...args)
        var me = this }
    
    render() {
        var viewing       = this.props.groups.viewing || false
        var viewing_name  = viewing ? this.props.groups.viewing.page : 'private_galaxy'
        var comp = this.get_component()

        return __('div', {key: 'rootdiv',
                          onScroll: this.on_scroll.bind(this)},
                  comp)}}

export default InfernoRedux.connect(map_state_to_props, map_dispatch_to_props)(Home)
