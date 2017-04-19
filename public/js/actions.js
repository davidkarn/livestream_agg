export const LOAD_STREAMS            = 'LOAD_STREAMS'
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

export function load_streams(query, geo_loc, only_live) {
    return (dispatch, get_state) => {
	set_spinning(true)(dispatch, get_state)
        http('get',
             "/api/search",
             {query:          query,
	      only_live:      only_live ? 'yes' : undefined,
              latitude:       geo_loc && geo_loc.latitude || '',
              longitude:      geo_loc && geo_loc.longitude || ''},
             function(response) {
		 set_spinning(false)(dispatch, get_state)		 
                 dispatch(receive_search(query, geo_loc, response))})}}
