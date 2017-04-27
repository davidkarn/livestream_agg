var Entities    = require('html-entities').XmlEntities;
var entities    = new Entities();
var request     = require('request');
var Twitter     = require('twitter')
var twitter_key = 'o4PvV5Pj4po3DIZjab49AAsI8'
var express         = require('express'),
    errorHandler    = require('errorhandler'),
    http            = require('http'),
    querystring     = require('querystring')
var bodyParser           = require('body-parser')
var session              = require('express-session')
var cookieParser         = require('cookie-parser')
var cookieSession        = require('cookie-session') 
var bcrypt               = require('bcrypt')
var async                = require('async')
var fs                   = require('fs')
var md5                  = require('md5')
var Redis                = require('ioredis');
var redis                = new Redis({
	host: 'ec2-34-204-242-91.compute-1.amazonaws.com', // default value
	port: 9319, // default value
	password: 'p95161335d374a0a9d33222dbb35d37b8570f09ef65b1ae466e4fdf64f01f05da',
	db: 0,
    family: 4
});

var app              = express()
var server           = require('http').Server(app)
var io               = require('socket.io')(server);
var port             = process.env.PORT || 8080

var cacheManager = require('cache-manager');
var redisStore = require('cache-manager-redis');

var redisCache = cacheManager.caching({
	store: redisStore,
	host: 'ec2-34-204-242-91.compute-1.amazonaws.com', // default value
	port: 9319, // default value
	auth_pass: 'p95161335d374a0a9d33222dbb35d37b8570f09ef65b1ae466e4fdf64f01f05da',
	db: 0,
	ttl: 3600
});

function minutes(mins) {
    return mins * 60 }

function hours(hrs) {
    return hrs * 60 * 60 }

function memoize(key, fn, next, ttl) {
    console.log('key', key)
    redisCache.wrap('-' + key, fn, {ttl: minutes(5) || ttl || hours(1)}, next) }

function mkey() {
    var id = ''
    for (var i in arguments)
	id += arguments[i].toString() + ':'
    return id }

app.use(cookieParser())
app.use(bodyParser({ uploadDir: '/tmp' }))
app.use(session({ secret:               'adsfj203092r0hagh08Hu9#%RT',
                  cookie:               { maxAge: + 1000 * 60 * 60 * 24 * 14}}));

var client = new Twitter({
  consumer_key: 'o4PvV5Pj4po3DIZjab49AAsI8',
  consumer_secret: 'YLJKk8562bgWdtBotN5vhSQf2bHfOJegx2iWbAw80yvRYKSwt4',
  access_token_key: '758861054445166592-AL2SOIBLkzs0s0kStcAISrVWo2Qzmnz',
  access_token_secret: 'ajbbl9tsYbpcHcj9rY5v6mSHwzwNIFoVenanSDz1G1Isb'
});

function search_twitter_term(term, next) {
    memoize(mkey('s earch ', term),
	    (next) => {
		client.get('search/tweets', {q: term + ' filter:periscope',
					     count: 100,
					     result_type: 'recent'}, function(error, tweets, response) {

						 if (tweets.statuses)
						     tweets = tweets.statuses

						 tweets = values(tweets || [])
						     .map((x) => Object.assign({search_term: term}, x))

						 next(null, {statuses: tweets})})},
	    caller_with_error(next)) }

function values(x) {
    var ar = []
    for (var i in x) ar.push(x[i])
    return ar }

function caller_with_error(fn) {
    return (err, res) =>
	fn(res) }

function search_periscope_term(term, next) {
    memoize(mkey('search', 'periscope', term),
	    (next) => {
		request('https://www.periscope.tv/search?q=' + term, function (error, response, body) {
		    body = body.replace(/(.||[\r\n\t])*data-store="/im, '')
		    body = body.replace(/"><div id="PageView(.||[\r\n\t])*/im, '')
		    body = entities.decode(body)
		    body = JSON.parse(body)

		    next(null, Object.assign({search_term: term},
					     values(body.BroadcastCache.broadcasts).map((x) => x.broadcast)))})},
	    caller_with_error(next))}

function search_periscope(terms, next) {
    var terms = terms.split(/\s+/).filter((t) => t != '')

    async.map(terms,
	      (item, done) => {
		  search_periscope_term(item, (res) => {
		      done(null, res) })},
	      (err, res) => {
		  next(res.reduce((a, b) => a.concat(b), [])) }) }

function search_twitter(terms, next) {
    var terms = terms.split(/\s+/).filter((t) => t != '')

    async.map(terms,
	      (item, done) => {
		  search_twitter_term(item, (res) => {
		      done(null, res) })},
	      (err, res) => {
		  var combined = res.reduce((a, b) => (a.statuses || []).concat(b.statuses || []), [])
		  next({statuses: combined}) }) }

function get_oembed(tweet_id, username, next) {
    memoize(mkey('oembed2', tweet_id, username),
	    (next) => {
		request('https://publish.twitter.com/oembed?url=https://twitter.com/'
			+ username + '/status/' + tweet_id, function (error, response, body) {
			    try {
				body = JSON.parse(body) }
			    catch (e) {
				body = false }
			    next(null, body) })},
	    caller_with_error(next))}

function get_periscope_from_tweet(tweet, next) {
    memoize(mkey('periscope','from','tweet', tweet.id_str),
	    (next) => {
		var tweet_url = false
		if (tweet.entities && tweet.entities.urls && tweet.entities.urls[0]) {
		    
		    for (var i in tweet.entities.urls) {
			var url = tweet.entities.urls[i]
			if (url.expanded_url && url.expanded_url.match('pscp.tv')) {
			    tweet_url = url.expanded_url }}}
		if (!tweet_url) {
		    return next(null, false) }
		request(tweet_url, function (error, response, body) {
		    body = body.replace(/(.||[\r\n\t])*data-store="/im, '')
		    body = body.replace(/"><div id="PageView(.||[\r\n\t])*/im, '')
		    body = entities.decode(body)
		    body = JSON.parse(body)

		    next(null, body) })},
	    caller_with_error(next))}

function periscopes_oembed(periscopes, next) {
    periscopes.map(
	      (item) => {
		  if (item.data && item.data.tweet_id)
		      get_oembed(item.data.tweet_id,
				 item.data.twitter_username,
				 (oembed) => {
				     item.oembed = oembed
				     next(item, item.search_term)})})}

function data_from_scope(scope) {
    if (!scope
	|| !scope.BroadcastCache
	|| !scope.BroadcastCache.broadcasts)
	return
    for (var i in scope.BroadcastCache.broadcasts) {
	var bc = scope.BroadcastCache.broadcasts[i]
	return bc }
    return undefined }

function tweets_oembed(tweets, next) {
    tweets.map((item) => {
		  get_periscope_from_tweet(
		      item,
		      (scope) => {
			  item.data        = data_from_scope(scope)
			  item.username    = item.user.screen_name
			  item.locationDescription = item.place
			  if (item && item.id_str)
			      get_oembed(item.id_str,
					 item.user.screen_name,
					 (oembed) => {
					     item.oembed = oembed
					     next(item, item.search_term)})})})}

app.get('/api/search', function(req, res){
    var term      = req.query.query
    var only_live = req.query.only_live == 'yes'

    do_query(res, term, only_live) })

function do_query(socket, document, term, only_live) {
    var push_the_stream = (is_tweet, stream, term) => {
	push_stream(stream, document, term, socket, only_live, is_tweet) }
    
    search_periscope(term, (periscopes) => {
	var old_periscopes = periscopes
	periscopes = values(periscopes[0])
	    .filter((x) => x.data && x.data.tweet_id)

	periscopes_oembed(periscopes,
			  (term, stream) => push_the_stream(false, term, stream))})
    search_twitter(term, (tweets) => {

	tweets_oembed(tweets.statuses,
		      (term, stream) => push_the_stream(true, term, stream))})}

function push_stream(stream, document, search_term, socket, only_live, is_tweet) {

/*    if (only_live && is_tweet) 
	if (!stream.oembed || !stream.oembed.html|| !stream.data
	    || !stream.data.broadcast
	    || stream.data.broadcast.isEnded)
	    return
    if (only_live && !is_tweet)
	if (!stream.oembed || stream.isEnded || !stream.oembed.html)
	    return*/

    if (is_tweet && (!stream.oembed
		     || !stream.data
		     || !stream.data.broadcast))
	return
    if (!is_tweet && !stream.oembed)
	return

    if (is_tweet)
	stream.stream_id = stream.data.broadcast.data.id
    else
	stream.stream_id = stream.data.id

    stream.document_id = document ? document.id : 0

    redis.set(mkey('stream', is_tweet, stream.stream_id),
	      stream)
    redis.sadd(key_doc_streams(document),
	       mkey('stream', is_tweet, stream.stream_id))
    console.log('pushing', stream.stream_id)
    socket.emit('receive_stream', stream) }

function key_doc_streams(document) {
    return mkey('streams_for', 'document', document && document.id)}

function process_streams(tweets, periscopes, only_live) {
    var n_tweets = []
    var n_scopes = []
    var used_ids = {}

    if (only_live) {
	tweets = tweets.filter((t) => t.oembed && t.data
			       && t.data.broadcast
			       && !t.data.broadcast.isEnded)
	periscopes = periscopes.filter((t) => t.oembed && !t.isEnded)}
    else {
	tweets = tweets.filter((t) => t.oembed && t.data
			       && t.data.broadcast)
	periscopes = periscopes.filter((t) => t.oembed)}
    
    for (var i in tweets) {
	if (!used_ids[tweets[i].data.broadcast.data.id])
	    n_tweets.push(tweets[i])
	used_ids[tweets[i].data.broadcast.data.id] = true }
    
    for (var i in periscopes) {
	if (!used_ids[periscopes[i].data.id])
	    n_scopes.push(periscopes[i])
	used_ids[periscopes[i].data.id] = true }

    return {tweets: n_tweets, scopes: n_scopes}}

app.use(express.static(process.cwd() + '/public/', { setHeaders: function (res, path) {
    if (path.match('assets'))
        res.setHeader('Cache-Control', 'public, max-age=0')
    else
        res.setHeader('Cache-Control', process.env.NODE_ENV == 'production' ? 'public, max-age=7200' : '')}}))


io.on('connection', function (socket) {
    var document
    socket.on('init_document', function (data) {
	var id        = 'document-' + data.id
	document      = {id:               id,
			 searches:        "",
			 searched_vids:   [],
			 added_vids:      []}

	redis.sadd('documents', id)
	redis.set(id, document)
	socket.emit('receive_document', document)
    });

    socket.on('get_document', function (data) {
	var id        = 'document-' + data.id
	redis.get(id, (err, result) => {
	    if (!result) return
	    document = result
	    socket.emit('receive_document', document)
	    redis.get(key_doc_streams(document), (err, result) => {
		if (!result) return
		for (var i in result)
		    redis.get(result[i], (err, stream) => {
			console.log('got stream', err, !stream)
			stream && socket.emit('receive_stream', result[i])})})})})

    socket.on('search', (data) => {
	document.searches = data.query
	redis.set(document.id, document)
	do_query(socket, document, data.query, data.only_live == 'yes')})})

server.listen(port);
