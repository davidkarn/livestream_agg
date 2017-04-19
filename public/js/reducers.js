import {combineReducers} from 'redux'
import {LOAD_STREAMS, SET_SPINNING} from 'actions'

function streams(state = {loaded: {},
			 user: {}}, action) {
    switch (action.type) {

    case LOAD_STREAMS:
        return Object.assign({},
                             state,
                             {streams:  action.streams,
			      spinning: false})
    case SET_SPINNING:
	console.log('setting spinning', action)
        return Object.assign({},
                             state,
                             {spinning: action.spinning})
    default:
        return state }}

var Reducers = combineReducers({streams})
export default Reducers
