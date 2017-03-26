import NativeLink from 'native_link'

export const LOAD_STREAMS            = 'LOAD_STREAMS'

export function receive_search(query, location, streams) {
    return (dispatch, get_state) => {
        dispatch({type: LOAD_STREAMS,
                  query,
                  location,
                  streams})}}


export function load_streams(query, geo_loc) {
    return (dispatch, get_state) => {
        http('get',
             "/api/search",
             {query:          query,
              latitude:       geo_loc && geo_loc.latitude || '',
              longitude:      geo_loc && geo_loc.longitude || ''},
             function(response) {
                 dispatch(receive_search(query, geo_loc, response))})}}
