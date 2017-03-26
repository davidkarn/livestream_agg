import {combineReducers} from 'redux'
import {LOAD_STREAMS} from 'actions'

function streams(state = {loaded: {},
			 user: {}}, action) {
    switch (action.type) {

    case LOAD_STREAMS:
        return Object.assign({},
                             state,
                             {streams: action.streams})
    default:
        return state }}

var Reducers = combineReducers({streams})
export default Reducers
