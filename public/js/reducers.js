import {combineReducers} from 'redux'
import NativeLink        from 'native_link'
import {OPEN_GROUP, RECEIVE_MESSAGES, OPEN_GALAXY, GOTO, RECEIVE_MESSAGE, HIDE_LOADING,
        OPEN_TOPIC, RECEIVE_TOPIC, GO_BACK, CHECK_VIEWING, SET_USER, SHOW_LOADING, ADD_FRIEND,
        RECEIVE_TOPICS, RECEIVE_GROUP, RECEIVE_GROUPS, RECEIVE_PROFILE, RECEIVE_PROFILES,
        RECEIVE_PMS, RECEIVE_PM, RECEIVE_NOTIFICATIONS, RECEIVE_NOTIFICATION,
        RECEIVE_POST, RECEIVE_POSTS, RECEIVE_RECENTS, OPEN_PRIVATE_GALAXY,
        RECEIVE_NEW_MESSAGE, DELETE_GROUP, CLOSE_TUTORIAL, REG_EVENT, 
        RECEIVE_STICKER_SETS, RECEIVE_EMOJI_SELECTION, CLEAN, MOVE_SCREEN,
        RECEIVE_MESSAGE_TYPING, SEND_TYPED_MESSAGE, DONE_POSTING_MESSAGE,
	MARK_EVENT_PROCESSED, TOGGLE_INPUT_FOCUS, CLEAR_INPUT_FOCUS,
	PROCESS_EVENT} from 'actions'

function groups(state = {loaded: {},
			 user: {}}, action) {
    switch (action.type) {

    case CLOSE_TUTORIAL:
        var definition = {}
        definition[action.name] = true
        return Object.assign({},
                             state,
                             {dialogs: Object.assign({},
                                                     state.dialogs || {},
                                                     definition)})

    case SET_USER:
	console.log('SETTING THE USER', action, state)
        return Object.assign({}, state, {user: action.user})
 
    case REG_EVENT:
        action.event.id = (new Date() - 1) + Math.rand()
        return Object.assign({}, state, {event: action.event})

    case SHOW_LOADING:
        return Object.assign({}, state, {loading: action.status})

    case RECEIVE_PMS:
        var obj  = {}
        obj[action.id] = Object.assign(state.profiles && state.profiles[action.id]
                                       ? state.profiles[action.id]
                                       : {},
                                       {private_messages: action.messages})

        return Object.assign({}, state,
                             {profiles: Object.assign({},
                                                      state.profiles || {},
                                                      obj)})
        
    case RECEIVE_PM:
        var obj  = {}
        var msg  = action.message
        state.profiles[msg.to_id] && state.profiles[msg.to_id].private_messages.push(action.message)
        state.profiles[msg.from_id] && state.profiles[msg.from_id].private_messages.push(action.message)
        
        return Object.assign({}, state)
        
    case RECEIVE_PROFILE:
        var obj  = {}
	var user = state.user
        obj[action.profile.id] = action.profile
	if (user && user.id == action.profile.id)
	    user = Object.assign(user, action.profile)
        console.log('receiving profile', action.profile, action, state, user)
        return Object.assign({}, state,
                             {user:     user,
			      profiles: Object.assign({},
                                                      state.profiles || {},
                                                      obj)})
        
    case RECEIVE_STICKER_SETS:
        var obj  = {sticker_sets: action.sticker_sets}
        
        return Object.assign({}, state,
                             obj)
        
    case RECEIVE_PROFILES:
        var obj  = {}
        action.profiles.map((profile) => {
            obj[profile.id] = profile })
        
        return Object.assign({}, state,
                             {profiles: Object.assign({},
                                                      state.profiles || {},
                                                      obj)})
        
    case HIDE_LOADING:
        return Object.assign({}, state, {loading: false})
        
    case OPEN_GROUP:
    case OPEN_TOPIC:
    case OPEN_GALAXY:
    case OPEN_PRIVATE_GALAXY:
        if (action.type == OPEN_GROUP) {
            action.page   = 'group'
            action.page = 'group'
            action.params = {viewing_group_id: action.group_id}}
        if (action.type == OPEN_GALAXY) {
            action.page   = 'galaxy'
            action.params = {loading: "loader galaxy-loader"}}
        if (action.type == OPEN_PRIVATE_GALAXY) {
            action.page   = 'private_galaxy'
            action.params = {loading: "loader galaxy-loader"}}
        
    case GOTO:
        
        var viewing_groups = [['subgroups', 'group_wall', 'group'],
                              ['profile', 'profile_friends', 'profile_messages', 'notifications']];

        function matches_same_page_group(viewing1, viewing2) {
            for (var i in viewing_groups) {
                if (member(viewing_groups[i], viewing1.page)
                    && member(viewing_groups[i], viewing2.page)
                    && (i > 0 || viewing1.params.viewing_group_id == viewing2.params.viewing_group_id))
                    return true }
            return false }
        
        var new_viewing         = {page:     action.page,
                                   params:   action.params}

        if (hash(new_viewing || "") == hash(state.viewing || ""))
            return state

        var new_viewing_hash, new_hash_history;
        if (state.viewing && matches_same_page_group(new_viewing, state.viewing)) {
            new_viewing_hash    = state.current_hash
            new_hash_history    = state.hash_history }
        else {
            new_viewing_hash    = '#hsh' + hash(Math.random())
            new_hash_history    = (state.hash_history || []).concat(new_viewing_hash)}


        var new_history         = Object.assign({},
                                                state.history || {},
                                                {[new_viewing_hash]:  new_viewing}) 

        window.location.hash    = new_viewing_hash
	
        return Object.assign({},
                             state,
                             {viewing:       new_viewing,
                              loading:       action.params.loading,
                              current_hash:  new_viewing_hash,
                              hash_history:  new_hash_history,
                              history:       new_history})

    case CHECK_VIEWING: 
        if (action.hash  != state.current_hash && (state.history || {})[action.hash])
            return Object.assign({}, state,
                                 {viewing: state.history[action.hash],
                                  current_hash: action.hash})
        return Object.assign({}, state)
        
    case GO_BACK:
        var new_state     = Object.assign({},
                                           state)

        new_state.hash_history.pop()
        var new_hash      = last(new_state.hash_history)

//        window.location.hash    = new_hash
        var retting = Object.assign({}, state,
                                    {viewing:      state.history[new_hash],
                                     hash_history: new_state.hash_history,
                                     current_hash: new_hash})

        return retting

    case PROCESS_EVENT:
        state             = Object.assign({},
					  state,
					  {unprocessed_events: Object.assign([],
									     state.unprocessed_events, [])})
	action.event.id   = "event" + Math.random().toString().slice(2)
	if (state.focused_input)
	    action.event.component_id = state.focused_input
	state.unprocessed_events.push(action.event)

	return state
	
    case MARK_EVENT_PROCESSED:
	var events        = Object.assign([], state.unprocessed_events)
	for (var i in events)
	    if (events[i].id == action.event.id || events[i] == action.event)
		delete events[i]
	for (var i in events)
	    if (events[i].component_id != state.focused_input)
		delete events[i]
        state             = Object.assign({},
					  state,
					  {unprocessed_events: events})
	
	return state
	
    case TOGGLE_INPUT_FOCUS:
	var focused       = action.component_id == state.focused_input
	if (!focused) NativeLink.start_typing(action.text)
	else NativeLink.clear_keyboard()
	
        state             = Object.assign({},
					  state,
					  {focused_input: focused ? false : action.component_id})
	return state
	
    case CLEAR_INPUT_FOCUS:
        state             = Object.assign({},
					  state,
					  {focused_input: false})
	console.log('clearing focus', state)
	NativeLink.clear_keyboard()
	return state
	
    case RECEIVE_MESSAGES:
        state             = Object.assign({}, state)
        state.messages    = state.messages || {}
        state.topics      = state.topics || {}

        action.messages.map((message) => {
            if (message.root_id == message.id || message.subtopic_id == message.id)
                state.topics[message.id]   = message 
            state.messages[message.id] = message })
        return state

    case RECEIVE_EMOJI_SELECTION:
        state                   = Object.assign({}, state)
        state.typing_message    = Object.assign(
            {"avatar":            state.profiles[state.user.id].avatar,
             "children":         [],
             "created_at":        new Date(),
             "id":                id,
             "fake":              1,
             "image_url":        "",
             "message":          "",
             "name":              state.profiles[state.user.id].name,
             "viewing_id":        Number.parseInt(action.message.viewing_id),
             "viewing_type":      action.message.viewing_type,             
             "replies":           0,
             "user_id":           state.user.id},
            state.typing_message,
            {emoji:  {sticker_set_id: action.message.set_id,
                      emoji_id:       action.message.emoji_id}})
        return state

    case RECEIVE_MESSAGE_TYPING:
        state                   = Object.assign({}, state)
        if (state.typing_message && state.typing_message.being_posted)
            return state
        state.typing_message    = Object.assign(
            {"avatar":            state.profiles[state.user.id].avatar,
             "children":         [],
             "created_at":        new Date(),
             "id":                id,
             "fake":              1,
             "image_url":        "",
             "message":          "",
             "viewing_id":        Number.parseInt(action.message.viewing_id),
             "viewing_type":      action.message.viewing_type,
             "name":              state.profiles[state.user.id].name,
             "replies":           0,
             "user_id":           state.user.id},
            state.typing_message,
            {message: action.message.message})

        return state

    case DONE_POSTING_MESSAGE:
        return Object.assign({},
                             state,
                             {typing_message: false})

    case SEND_TYPED_MESSAGE:
        return Object.assign(
            {},
            state,
            {typing_message: Object.assign({},
                                           state.typing_message,
                                           {being_posted:  true})})
        
    case MOVE_SCREEN:
        return Object.assign({}, state, {top_pos: action.amount})
        
    case CLEAN:
        var updates = {}
        for (var key in state) 
            if (!member(['profiles', 'messages', 'topics', 'groups', 'notifications', 'posts', 'sticker_sets', 'dialogs'], key))
                updates[key] = false
	updates['history'] = {"#hsh1408363404":{"page":"private_galaxy","params":{"loading":"loader galaxy-loader"}},"#hsh1950332610":{"page":"galaxy","params":{"loading":"loader galaxy-loader"}},"#hsh-1545344221":{"page":"group","params":{"viewing_group_id":592}}}
	updates['hash_history'] = ["#hsh1408363404","#hsh1950332610","#hsh-1545344221"];
	updates['current_hash'] = 'hsh-1545344221'
	updates['viewing'] = {"page":"group","params":{"viewing_group_id":592}}
	
        return Object.assign({}, state, updates)
        
    case RECEIVE_NEW_MESSAGE:
        var fields = {}
        var id     = new Date() - 1
        if (action.message.viewing_type == 'topic'
            || action.message.viewing_type == 'subtopic'
            || action.message.viewing_type == 'topic_root'
            || action.message.viewing_type == 'message') {
            var viewing_message = (state.messages[action.message.viewing_id]
                                   || state.topics[action.message.viewing_id])
            fields.group_id = viewing_message.group_id
            fields.reply_to = viewing_message.id
            fields.root_id  = viewing_message.root_id
            fields.subtopic_id = (action.message.viewing_type == 'topic'
                                  || action.message.viewing_type == 'message'
                                  ? viewing_message.id : viewing_message.subtopic_id)
            fields.subtopic_parent = (action.message.viewing_type == 'topic'
                                  || action.message.viewing_type == 'subtopic'
                                      ? viewing_message.subtopic_parent : viewing_message.subtopic_id)
            
            if (action.message.viewing_type == 'topic_root') {
                fields.subtopic_id = id
                fields.subtopic_parent = id }}
                
        else if (action.message.viewing_type == 'group') {
            fields.root_id         = id
            fields.subtopic_id     = id
            fields.subtopic_parent = id
            fields.group_id        = action.message.viewing_id }
        else {
            return  state}
            
        var msg = {"avatar":            state.profiles[state.user.id].avatar,
                   "children":         [],
                   "created_at":        new Date(),
                   "group_id":          fields.group_id,
                   "id":                id,
                   "fake":              1,
                   "image_url":        "",
                   "message":           action.message.message,
                   "name":              state.profiles[state.user.id].name,
                   "post_id":           fields.post_id,
                   "replies":           0,
                   "reply_to":          fields.reply_to,
                   "root_id":           fields.root_id,
                   "subtopic_id":       fields.subtopic_id,
                   "subtopic_parent":   fields.subtopic_parent,
                   "user_id":           state.user.id}

        action.message                  = msg
        state.new_messages              = state.new_messages || {}
        state.new_messages[msg.message] = msg

    case RECEIVE_MESSAGE:
        var message       = action.message
        state             = Object.assign({}, state)
        state.messages    = state.messages || {}
        state.new_messages= state.new_messages || {}
        state.topics      = state.topics || {}

        if (state.new_messages[message.message] && !message.fake) {
            var new_message = state.new_messages[message.message]
            delete state.messages[new_message.id]
            delete state.topics[new_message.id] }
        
        state.messages[message.id] = message 
        state.topics[message.id]   = message
        
        if (message.post_id) {
            var found   = false
            state.posts = state.posts || {}
            for (var group_id in state.posts) {
                if (state.posts[group_id][message.post_id]) {
                    var post    = state.posts[group_id][message.post_id]
                    for (var i in (post.messages || [])) {
                        if (post.messages[i].id == message.id)
                            found = true }
                    if (!found)
                        post.messages.push(message) }}}

        if (state.typing_message
            && state.user
            && message.user_id == state.user.id
            && ((message.message || '').slice(0, 50)
                == (state.typing_message.message || '').slice(0, 50))) 
            state.typing_message = false
            
        return state

    case RECEIVE_POST:
        state             = Object.assign({}, state)
        state.posts       = state.posts || {}
        state.posts[action.post.group_id] = state.posts[action.post.group_id] || {}
        if (state.posts[action.post.group_id][action.post.id]
            && action.post.messages && action.post.messages.length == 0)
            action.post.messages = values(state.posts[action.post.group_id][action.post.id].messages || [])
        state.posts[action.post.group_id][action.post.id] = action.post

        if (action.post.from_socket)
            state = groups(state, {type:    GOTO,
                                   page:    'wall_post',
                                   params:  {viewing_group_id: action.post.group_id,
                                             post_id:          action.post.id}})
        
        return state
        
    case RECEIVE_POSTS:
        state             = Object.assign({}, state)
        state.posts       = state.posts || {}
        state.loaded      = state.loaded || {}
        if (action.group_id)
            state.loaded['group-posts-' + action.group_id] = true
        
        action.posts.map((post) => {
            state.posts[post.group_id] = state.posts[post.group_id] || {}
            if (state.posts[post.group_id][post.id]
                && (!post.messages || post.messages.length == 0))
                post.messages = values(state.posts[post.group_id][post.id].messages || [])
            state.posts[post.group_id][post.id] = post })
        
        return state
        
    case RECEIVE_TOPICS:
        state             = Object.assign({}, state)
        state.topics      = state.topics || {}
        state.messages    = state.messages || {}
        state.loaded      = state.loaded || {}

        if (action.group_id)
            state.loaded['group-topics-' + action.group_id] = true
        
        action.messages.forEach(message => {
            state.messages[message.id]   = message;
            state.topics[message.id]     = message })
        return state

      case RECEIVE_RECENTS:
        state             = Object.assign({}, state,
                                          {recents: action.recents})
        return state

    case DELETE_GROUP:
        delete state.groups[action.group.id]
        return state
        
    case RECEIVE_GROUP:
	if (!action.group) return state
        action.group.is_group            = true
        action.group.messages            = action.group.messages || []
        let state_group                  = state.groups[action.group.id] || {}
        state_group.messages             = state_group.messages || []
        action.group.messages            = (action.group.messages.length > state_group.messages.length
                                            ? action.group.messages
                                            : state_group.messages)
        action.group.hotness             = (action.group.hotness > state_group.hotness
                                            ? action.group.hotness
                                            : state_group.hotness)
        
        action.group.cnt                 = (action.group.cnt > state_group.cnt
                                            ? action.group.cnt
                                            : state_group.cnt)
        
        state                            = Object.assign({}, state)
        state.groups                     = state.groups || {}
        state.groups[action.group.id]    = action.group
        state.loading                    = false

        return state

    case RECEIVE_TOPIC:
        state                            = Object.assign({}, state)
        state.topics                     = state.topics || {}
        state.messages    = state.messages || {}
        
        action.messages.forEach(message => {
            if (message.id == action.topic.id)
                state.topics[message.id]    = message
            state.messages[message.id] = message })
        return state

    case RECEIVE_GROUPS:
        state                   = Object.assign({}, state)
        state.groups            = state.groups || {}
        state.loading           = false
        state.loaded            = Object.assign({}, state.loaded)

        if (action.id) state.loaded[action.id] = true
           
        for (var i in action.groups) {
            action.groups[i].is_group            = true
            state.groups[action.groups[i].id]    = action.groups[i] }

        if (action.id == 'galaxy')
            for (var i in state.groups) {
                var found = false
                for (var j in action.groups)
                    if (action.groups[j].id == i)
                        found = true
                if (!found)
                    delete state.groups[i] }
        
        return state

    case RECEIVE_NOTIFICATIONS:
        return Object.assign({},
                             state,
                             {notifications: merge_notifications(state.notifications || [],
                                                                 action.notifications)})
    case RECEIVE_NOTIFICATION:
        return Object.assign({},
                             state,
                             {notifications: merge_notifications(state.notifications || [],
                                                                 [action.notification])})

    default:
        return state }}

function merge_notifications(old_notifications, new_notifications) {
    var notes = {}
    for (var i in old_notifications)
        notes[old_notifications[i].notification.id] = old_notifications[i]
    for (var i in new_notifications)
        notes[new_notifications[i].notification.id] = new_notifications[i]

  return values(notes)
        .filter((x) => x.object)
        .sort((a, b) => a.id - b.id)}

var Reducers = combineReducers({groups})
export default Reducers
