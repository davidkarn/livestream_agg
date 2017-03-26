import {load_streams} from 'actions'
import Konva              from 'react-konva'
import __                 from 'jsml'
import InfernoRedux       from 'inferno-redux'
import Home               from 'components/home'
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
    
    render() {
        return __(Home, {data: this.props.streams,
                         act:  this.props.act})}}

export default InfernoRedux.connect(map_state_to_props, map_dispatch_to_props)(Home)
