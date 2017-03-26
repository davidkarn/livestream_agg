import NativeLink from 'native_link'

export const GOTO                = 'GOTO'
export const CLEAN               = 'CLEAN'
export const GO_BACK             = 'GO_BACK'
export const OPEN_GROUP          = 'OPEN_GROUP'
export const MOVE_SCREEN         = 'MOVE_SCREEN'
export const DONE_POSTING_MESSAGE    = 'DONE_POSTING_MESSAGE'
export const SEND_TYPED_MESSAGE      = 'SEND_TYPED_MESSAGE'
export const RECEIVE_NOTIFICATIONS   = 'RECEIVE_NOTIFICATIONS'
export const RECEIVE_NOTIFICATION    = 'RECEIVE_NOTIFICATION'
export const RECEIVE_STICKER_SETS    = 'RECEIVE_STICKER_SETS'
export const SET_USER            = 'SET_USER'
export const CLOSE_TUTORIAL      = 'CLOSE_TUTORIAL'
export const OPEN_GALAXY         = 'OPEN_GALAXY'
export const OPEN_PRIVATE_GALAXY = 'OPEN_PRIVATE_GALAXY'
export const ADD_FRIEND          = 'ADD_FRIEND'
export const OPEN_TOPIC          = 'OPEN_TOPIC'
export const REG_EVENT           = 'REG_EVENT'
export const SHOW_LOADING        = 'SHOW_LOADING'
export const RECEIVE_POSTS       = 'RECEIVE_POSTS'
export const RECEIVE_POST        = 'RECEIVE_POST'
export const RECEIVE_PMS         = 'RECEIVE_PMS'
export const RECEIVE_PM          = 'RECEIVE_PM'
export const HIDE_LOADING        = 'HIDE_LOADING'
export const CHECK_VIEWING       = 'CHECK_VIEWING'
export const RECEIVE_MESSAGES    = 'RECEIVE_MESSAGES'
export const RECEIVE_MESSAGE     = 'RECEIVE_MESSAGE'
export const RECEIVE_NEW_MESSAGE = 'RECEIVE_NEW_MESSAGE'
export const RECEIVE_TOPICS      = 'RECEIVE_TOPICS'
export const RECEIVE_TOPIC       = 'RECEIVE_TOPIC'
export const RECEIVE_GROUP       = 'RECEIVE_GROUP'
export const DELETE_GROUP        = 'DELETE_GROUP'
export const RECEIVE_PROFILE     = 'RECEIVE_PROFILE'
export const RECEIVE_PROFILES    = 'RECEIVE_PROFILES'
export const RECEIVE_GROUPS      = 'RECEIVE_GROUPS'
export const RECEIVE_EMOJI_SELECTION   = 'RECEIVE_EMOJI_SELECTION'
export const RECEIVE_MESSAGE_TYPING    = 'RECEIVE_MESSAGE_TYPING'
export const TOGGLE_INPUT_FOCUS        = 'TOGGLE_INPUT_FOCUS'
export const MARK_EVENT_PROCESSED      = 'MARK_EVENT_PROCESSED'
export const PROCESS_EVENT             = 'PROCESSED_EVENT'
export const CLEAR_INPUT_FOCUS         = 'CLEAR_INPUT_FOCUS'

export function open_group(group_id) {
    return (dispatch, get_state) => {
        get_group(group_id)(dispatch, get_state)}}

export function reg_event(event) {
    return (dispatch, get_state) => {
      dispatch({type:     REG_EVENT,
                event}) }}

export function open_profile(user_id) {
    return (dispatch, get_state) => {
        get_profile(user_id)(dispatch, get_state)}}

export function delete_group(group) {
    return (dispatch, get_state) => {
        dispatch({type:     DELETE_GROUP,
                  group:    group})}}

export function open_pms(user_id) {
    return (dispatch, get_state) => {
        get_private_messages(user_id)(dispatch, get_state)}}

export function show_loading(status) {
    return (dispatch, get_state) => {
      dispatch({type:     SHOW_LOADING,
                status:   status})}}

export function hide_loading() {
    return (dispatch, get_state) => {
        dispatch({type:     HIDE_LOADING})}}                  

export function check_viewing(hsh) {
    return {type:     CHECK_VIEWING,
            hash:     hsh}}

export function toggle_input_focus(component_id, text) {
    return {type:     TOGGLE_INPUT_FOCUS,
	    text: text || '',
            component_id}}

export function mark_event_processed(event) {
    return {type:     MARK_EVENT_PROCESSED,
	    event}}

export function clear_focus() {
    return {type:        CLEAR_INPUT_FOCUS} }

export function check_command(hsh) {
    return (dispatch, get_state) => {  
        if (hsh.slice(0, 9) == "#command-") {
            var command = JSON.parse(Base64.decode(hsh.slice(9)))
	    console.log('got command', command)
            window.location.hash = "#"
            if (command.command == 'emoji_tapped') 
                dispatch({type:        RECEIVE_EMOJI_SELECTION,
                          message:     command})

            if (command.command == 'message_typing') 
                dispatch({type:        RECEIVE_MESSAGE_TYPING,
                          message:     command})

            if (command.command == 'move_screen') 
                dispatch({type:        MOVE_SCREEN,
                          amount:      command.amount})

	    if (command.command == 'reload_login') 
		http('post',
		     '/login',
		     {username: command.username,
		      password: command.password},
		     get_user,
		     (err) => {
			 NativeLink.log_out()})
	    
            if (command.command == 'clear_focus')  {
                dispatch({type:        CLEAR_INPUT_FOCUS}) }

            if (command.command == 'get_stickers')
		get_sticker_sets()(dispatch, get_state);		

            if (command.command == 'report_message')
		http('get', "/api/flag_post/" + command.message_id, {},
		     function(message) {
			 NativeLink.toast('The message has been flagged and is awaiting review');
			 dispatch(receive_message(message))})


            if (command.command == 'save_sticker')
		http('get', "/api/save_sticker/" + command.sticker_id, {},
		     function(message) {
			 NativeLink.toast('Sticker saved to your drawer.');
			 get_sticker_sets()(dispatch, get_state);
			 NativeLink.reload_stickers() })


            if (command.command == 'block_user')
		dispatch(block_user(command.user_id))


            if (command.command == 'process_event') {
		if (command.event.type != 'typed_character'
		    || command.event.character != 'nil')
                    dispatch({type:        PROCESS_EVENT,
                              event:       command.event})}

            if (command.command == 'send_message')
                return send_typed_message(dispatch, get_state, command) }}}

export function send_typed_message(dispatch, get_state, command) {
    dispatch({type:     SEND_TYPED_MESSAGE})

    var message = get_state().groups.typing_message
    http('put',
         "/api/message/",
         {id:     message.viewing_id,
          viewing_type:   message.viewing_type,
	  location:       command.location,
          emoji:          message.emoji,
          message:        message.message},
         function(response) {
             dispatch(receive_message(response.message))
             dispatch({type: DONE_POSTING_MESSAGE})})}

export function clear_posting_message() {
    return (dispatch, get_state) => {
        dispatch({type: DONE_POSTING_MESSAGE})}}
    
export function invite_friend_to_group(group_id, friend_id) {
    http('get',
         "/api/group/" + group_id + "/invite/" + friend_id,
         {},
         function(group) {})}

export function open_galaxy(reload) {
    return (dispatch, get_state) => {
        dispatch({type:     OPEN_GALAXY})
        if (!reload)
        get_galaxy()(dispatch, get_state)}}

export function clean() {
    return (dispatch, get_state) => {
        dispatch({type:     CLEAN})}}

export function open_private_galaxy(reload) {
    return (dispatch, get_state) => {
        dispatch({type:     OPEN_PRIVATE_GALAXY})
        if (!reload)
        get_galaxy()(dispatch, get_state)}}

export function load_galaxy(reload) {
    return (dispatch, get_state) => {
        get_galaxy()(dispatch, get_state)}}

export function open_topic(topic) {
    return (dispatch, get_state) => {
        dispatch({type:     GOTO,
                  page:    'topic',
                  params:  {topic_id: topic.id,
                            topic:    topic}})

        get_topic(topic, false)(dispatch, get_state)}}

export function open_topic_by_id(topic_id, topic) {
    return (dispatch, get_state) => {
        var state = get_state()
        if (state.groups.topics[topic_id]) {
            if (topic)
                dispatch({type:     GOTO,
                          page:    'topic',
                          params:  {topic_id: topic_id,
                                    topic:    topic}})}

        get_topic(false, topic_id, !topic)(dispatch, get_state)}}

export function flag_post(message) {
    http('get', "/api/flag_post/" + message.id, {}, function(message) {
        NativeLink.toast('The message has been flagged and is awaiting review');
        dispatch(receive_message(message)) })}

export function go_to(page, params) {
  return {type:    GOTO,
          page:    page,
          params:  params}}

export function go_back() {
    return {type:    GO_BACK}}

export function receive_messages(messages) {
    return {type:     RECEIVE_MESSAGES,
            messages}}

export function set_user(user) {
    return {type:     SET_USER,
            user}}

export function receive_message(message) {
    return {type:     RECEIVE_MESSAGE,
            message}}

export function receive_post(post) {
    return {type:     RECEIVE_POST,
            post}}

export function receive_posts(posts, group_id) {
    return {type:     RECEIVE_POSTS,
            group_id,
            posts}}

export function close_tutorial(name) {
    return {type:     CLOSE_TUTORIAL,
            name}}

export function receive_notifications(notifications) {
    return {type:     RECEIVE_NOTIFICATIONS,
            notifications}}

export function submit_post(form) {
    var request       = new XMLHttpRequest()
    request.open("PUT", "/api/post");
    request.send(new FormData(form));
    request.onreadystatechange = function() {
        if(request.readyState == 4 ){
            if(request.status == 200){
                dispatch(receive_post(JSON.parse(request.responseText))); }
            else
                console.log('failed', xmlhttp.responseText); }}; }

export function receive_notification(notification) {
    return {type:     RECEIVE_NOTIFICATION,
            notification}}

export function receive_topics(messages, group_id) {
    return {type:     RECEIVE_TOPICS,
            group_id,
            messages}}

export function receive_sticker_sets(sticker_sets) {
    return {type:     RECEIVE_STICKER_SETS,
            sticker_sets}}

export function receive_profile(profile) {
    return {type:     RECEIVE_PROFILE,
            profile}}

export function receive_profiles(profiles) {
    return {type:     RECEIVE_PROFILES,
            profiles}}

export function receive_topic(topic, topic_id, messages) {
    return {type:     RECEIVE_TOPIC,
            id:       topic_id,
            topic,
            messages}}

export function receive_pms(user_id, messages) {
    return {type:     RECEIVE_PMS,
            id:       user_id,
            messages}}

export function receive_private_message(message) {
    return {type:     RECEIVE_PM,
            message}}

export function receive_group(group) {
    return {type:     RECEIVE_GROUP,
            group}}

export function receive_groups(groups, id) {
    return {type:     RECEIVE_GROUPS,
            id,
            groups}}

export function load_post(id) {
    return (dispatch, get_state) => {
      http('get', '/api/post/' + id, {},
           (post) => {
             dispatch(receive_post(post)) })}}  

function get_group(id) {
    return (dispatch, get_state) => {
        var state = get_state()
        http('get', '/api/group/' + id, {},
             (group) => {
               group.color    = random_color()
                 dispatch(receive_group(group)) })
            
        http('get', '/api/group/' + id + '/hot', {},
             (data) => {
                 dispatch(receive_posts(data.posts, id))
                 dispatch(receive_topics(data.messages.map((message) => {
                     message.from_http = true
                     return message; }),
                                         id))})}}

function get_profile(id, dont_navigate) {
    return (dispatch, get_statep) => {
	console.log('getting profile');
        if (!dont_navigate)
            dispatch({type:     GOTO,
                      page:    'profile',
                      params:  {profile_id: id}})
            
        http('get', '/api/profile/' + id, {}, function(profile) {
	    console.log('got profile from http', profile)
            dispatch(receive_profile(profile))})}}

export function get_private_messages(user_id) {
    return (dispatch, get_state) => {
        dispatch({type:     GOTO,
                  page:    'private_messages',
                  params:  {user_id: user_id}})
            
        http('get', '/api/profile/' + user_id + '/private_messages', {}, function(messages) {
            dispatch(receive_pms(user_id, messages))})}}

export function add_friend(id) {
    return (dispatch, get_state) => {
        http('get', '/api/profile/' + id + '/add_friend', {}, function(profile) {
            dispatch(receive_profile(profile))})}}

function get_galaxy() {
    return (dispatch, get_state) => {
        http('get', '/api/galaxy', {}, function(galaxy) {
            dispatch(receive_groups(galaxy, 'galaxy'))})}}

function get_topic(topic, topic_id, navigate) {
    var id = topic_id || topic.id
    return (dispatch, get_state) => {
        http('get', "/api/topic/" + id, {}, function(messages) {
            messages.map((message) => {
                if (message.id == topic_id) topic = message
                message.from_http = true
                return message})
            dispatch(receive_topic(topic, id, messages))
            if (navigate)
                dispatch({type:     GOTO,
                          page:    'topic',
                          params:  {topic_id: topic_id,
                                    topic:    topic}})})}}            

export function block_user(id) {
    return (dispatch, get_state) => {
        http('post', "/api/block_user", {id: id}, function(user) {
            dispatch(set_user(user))})}}

export function get_sticker_sets(id) {
    return (dispatch, get_state) => {
        http('get', "/api/sticker_sets", {}, function(sets) {
            dispatch(receive_sticker_sets(sets))})}}

export function join_group(group) {
    return (dispatch, get_state) => {
        group.user_membership = 1
        dispatch(receive_group(group))
        http('get', "/api/group/" + group.id + "/join", {}, function(group) {
            dispatch(receive_group(group))})}}

export function join_subgroups(group) {
    return (dispatch, get_state) => {
        http('get', "/api/group/" + group.id + "/join_subgroups", {}, function(groups) {
            dispatch(receive_groups(groups))})}}

export function leave_group(group) {
    return (dispatch, get_state) => {
        group.user_membership = 0
        dispatch(receive_group(group))
        http('get', "/api/group/" + group.id + "/leave", {}, function(group) {
            dispatch(receive_group(group))})}}

export function unblock_user(id) {
    return (dispatch, get_state) => {
        http('post', "/api/unblock_user", {id: id}, function(user) {
            dispatch(set_user(user))})}}

export function get_user(next) {
    return (dispatch, get_state) => {
	console.log('getting the user');
        http('get', "/api/user", {}, function(user) {
	    console.log('got the user', user)
            get_profile(user.id, true)(dispatch, get_state)
            dispatch(set_user(user))
	    next()},
	     function(failure) {
		 NativeLink.request_user_login()
	     })}}

export function get_notifications() {
    return (dispatch, get_state) => {
        http('get', "/api/notifications", {}, function(notifications) {
            dispatch(receive_notifications(notifications))})}}

export function read_pms(messages) {
    return (dispatch, get_state) => {
        http('get', "/api/read_pms", {messages_ids: messages.map(param_returner('id')).join(',')}, function(result) {
            get_notifications()(dispatch, get_state) })}}

export function read_notifications(notifications) {
    return (dispatch, get_state) => {
        http('get', "/api/read_notifications", {}, function(notifications) {
            dispatch(receive_notifications(notifications))})}}

export function read_notification(notification_id) {
    return (dispatch, get_state) => {
        http('get', "/api/read_notification", {id: notification_id}, function(notifications) {
            dispatch(receive_notifications(notifications))})}}

export function log_out(next) {
    return (dispatch, get_state) => {
        http('post', "/logout", {}, function(result) {
          next()})}}

var preloaded = {}
export function preload(options) {
    return (dispatch, get_state) => {
        if (preloaded[hash(options)])
            return
        preloaded[hash(options)] = true
        socket.emit('preload', options)}}
