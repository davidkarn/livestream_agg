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
    redisCache.wrap(key, fn, {ttl: ttl || hours(1)}, next) }

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

function search_twitter(term, next) {
    memoize(mkey('search', term),
	    (next) => {
		client.get('search/tweets', {q: term + ' filter:periscope'}, function(error, tweets, response) {
		    console.log('got tweets', {tweets})
		    for (var i in tweets) console.log(tweets[i])
		    next(tweets)})},
	    next) }

function values(x) {
    var ar = []
    for (var i in x) ar.push(x[i])
    return ar }

function search_periscope(term, next) {
    memoize(mkey('search', 'periscope', term),
	    (next) => {
		request('https://www.periscope.tv/search?q=' + term, function (error, response, body) {
		    body = body.replace(/(.||[\r\n\t])*data-store="/im, '')
		    body = body.replace(/"><div id="PageView(.||[\r\n\t])*/im, '')
		    body = entities.decode(body)
		    body = JSON.parse(body)
		    next(values(body.BroadcastCache.broadcasts).map((x) => x.broadcast))})},
	    next)}

function get_oembed(tweet_id, username, next) {
    memoize(mkey('oembed', tweet_id, username),
	    (next) => {
		request('https://publish.twitter.com/oembed?url=https://twitter.com/'
			+ username + '/status/' + tweet_id, function (error, response, body) {
			    try {
				body = JSON.parse(body) }
			    catch (e) {
				body = false }
			    next(body) })},
	    next)}

function periscopes_oembed(periscopes, next) {
    async.map(periscopes,
	      (item, done) => {
		  if (item.data && item.data.tweet_id)
		      get_oembed(item.data.tweet_id,
				 item.data.twitter_username,
				 (oembed) => {
				     item.oembed = oembed
				     done(item)})
		  else {
		      done(item) }},
	      (err, results) => {
		  next(results) })}

function tweets_oembed(tweets, next) {
    async.map(tweets,
	      (item, done) => {
		  console.log('item', item)
		  item.username = item.user.screen_name
		  item.locationDescription = item.place
		  if (item && item.id_str)
		      get_oembed(item.id_str,
				 item.user.screen_name,
				 (oembed) => {
				     console.log('tweet_oembed')
				     item.oembed = oembed
				     done(item)})
		  else {
		      done(item) }},
	      (err, results) => {
		  next(results) })}

app.get('/api/search', function(req, res){
    var term     = req.query.query
    search_periscope(term, (periscopes) => {
	var old_periscopes = periscopes
	periscopes = periscopes
	    .filter((x) => x.data && x.data.tweet_id)
	    .slice(0, 100)
	periscopes_oembed(periscopes, (results) => {
	    search_twitter(term, (tweets) => {
		tweets_oembed(tweets.statuses, (twitter_results) => {
		    res.json(process_streams(tweets.statuses, periscopes))})})})})})

function process_streams(tweets, periscopes) {
    tweets = tweets.filter((t) => t.oembed)
    periscopes = periscopes.filter((t) => t.oembed)
    return {tweets: tweets, periscopes}}

app.use(express.static(process.cwd() + '/public/', { setHeaders: function (res, path) {
    if (path.match('assets'))
        res.setHeader('Cache-Control', 'public, max-age=1296000')
    else
        res.setHeader('Cache-Control', process.env.NODE_ENV == 'production' ? 'public, max-age=7200' : '')}}))

server.listen(port);
