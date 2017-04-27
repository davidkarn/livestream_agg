import {combineReducers} from 'redux'
import {LOAD_STREAMS, SET_SPINNING, SET_DOCUMENTS, RECEIVE_DOCUMENT,
	RECEIVE_STREAM} from 'actions'

function streams(state = {loaded: {},
			 user: {}}, action) {
    switch (action.type) {

    case RECEIVE_DOCUMENT:
	if (action.document)
	    window.location.hash = action.document.id
        return Object.assign({},
			     state,
			     {document: action.document})
    case LOAD_STREAMS:
        return Object.assign({},
                             state,
                             {streams:  action.streams,
			      spinning: false})

    case RECEIVE_STREAM: 
	var available_streams = Object.assign({}, state.available_streams)
	available_streams[action.stream.stream_id] = action.stream
	console.log(action, state)
	return Object.assign({},
			     state,
			     {available_streams,
			      streams: values(available_streams)})
			     
	
    case SET_SPINNING:
	console.log('setting spinning', action)
        return Object.assign({},
                             state,
                             {spinning: action.spinning})
    default:
        return state }}

var Reducers = combineReducers({streams})
export default Reducers
