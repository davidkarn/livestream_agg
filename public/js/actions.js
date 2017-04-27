export const LOAD_STREAMS            = 'LOAD_STREAMS'
export const RECEIVE_STREAM          = 'RECEIVE_STREAM'
export const RECEIVE_DOCUMENT        = 'RECEIVE_DOCUMENT'
export const SET_DOCUMENT            = 'SET_DOCUMENT'
export const SET_SPINNING            = 'SET_SPINNING'

export function receive_search(query, location, streams) {
    return (dispatch, get_state) => {
        dispatch({type: LOAD_STREAMS,
                  query,
                  location,
                  streams})}}

export function set_spinning(spinning) {
    return (dispatch, get_state) => {
	console.log('set spinning', spinning)
        dispatch({type: SET_SPINNING,
                  spinning})}}

export function receive_document(document) {
    return (dispatch, get_state) => {
        dispatch({type: RECEIVE_DOCUMENT,
                  document})}}

export function receive_stream(stream) {
    return (dispatch, get_state) => {
        dispatch({type: RECEIVE_STREAM,
                  stream})}}

export function load_streams(socket, query, geo_loc, only_live) {
    return (dispatch, get_state) => {
	set_spinning(true)(dispatch, get_state)
	setTimeout(() => { // FIX THIS SHIT!
	    console.log("REMOVING THE SPINNER")
	    set_spinning(false)(dispatch, get_state) },
		   30000)
	socket.emit('search',
		    {query:          query,
		     only_live:      only_live ? 'yes' : undefined,
		     latitude:       geo_loc && geo_loc.latitude || '',
		     longitude:      geo_loc && geo_loc.longitude || ''})}}
//             function(response) {
//		 set_spinning(false)(dispatch, get_state)		 
//                 dispatch(receive_search(query, geo_loc, response))})}}
