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

var app              = express()
var server           = require('http').Server(app)
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
    redisCache.wrap('-' + key, fn, {ttl: minutes(3) || ttl || hours(1)}, next) }

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
    memoize(mkey('search', term),
	    (next) => {
		client.get('search/tweets', {q: term + ' filter:periscope'}, function(error, tweets, response) {
		    next(null, tweets)})},
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
		    next(null, values(body.BroadcastCache.broadcasts).map((x) => x.broadcast))})},
	    caller_with_error(next))}

function search_periscope(terms, next) {
    var terms = terms.split(/\s+/).filter((t) => t != '')
    console.log('terms', terms)    
    async.map(terms,
	      (item, done) => {
		  search_periscope_term(item, (res) => {
		      done(null, res) })},
	      (err, res) => {
		  next(res.reduce((a, b) => a.concat(b), [])) }) }

function search_twitter(terms, next) {
    var terms = terms.split(/\s+/).filter((t) => t != '')
    console.log('terms', terms)
    async.map(terms,
	      (item, done) => {
		  search_twitter_term(item, (res) => {
		      done(null, res) })},
	      (err, res) => {
		  var combined = res.reduce((a, b) => (a.statuses || []).concat(b.statuses || []), [])
		  console.log(res.length, combined.length)
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
		    console.log('no tweet url for')
		    return next(null, false) }
		console.log('twurl', tweet_url)
		request(tweet_url, function (error, response, body) {
		    body = body.replace(/(.||[\r\n\t])*data-store="/im, '')
		    body = body.replace(/"><div id="PageView(.||[\r\n\t])*/im, '')
		    body = entities.decode(body)
		    body = JSON.parse(body)

		    next(null, body) })},
	    caller_with_error(next))}

function periscopes_oembed(periscopes, next) {
    async.map(periscopes,
	      (item, done) => {
		  if (item.data && item.data.tweet_id)
		      get_oembed(item.data.tweet_id,
				 item.data.twitter_username,
				 (oembed) => {
				     item.oembed = oembed
				     done(null, item)})
		  else {
		      done(null, item) }},
	      (err, results) => {
		  next(results) })}

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
    async.map(tweets,
	      (item, done) => {
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
					     done(null, item)})
			  else {
			      done(null, item) }})},
	      (err, results) => {
		  next(results) })}

app.get('/api/search', function(req, res){
    var term      = req.query.query
    var only_live = req.query.only_live == 'yes'

    do_query(res, term, only_live) })

function do_query(res, term, only_live) {
    memoize(mkey('main','query',term,'live',only_live.toString()),
	    (next) => {
		search_periscope(term, (periscopes) => {
		    var old_periscopes = periscopes
		    periscopes = periscopes
			.filter((x) => x.data && x.data.tweet_id)
			.slice(0, 100)
		    periscopes_oembed(periscopes, (results) => {
			search_twitter(term, (tweets) => {
			    tweets_oembed(tweets.statuses, (twitter_results) => {
				next(null,
				     process_streams(tweets.statuses, periscopes, only_live))})})})})},
	    (err, result) => res.json(result))}

function process_streams(tweets, periscopes, only_live) {
    var n_tweets = []
    var n_scopes = []
    var used_ids = {}
    console.log('filtering', only_live)
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

server.listen(port);
