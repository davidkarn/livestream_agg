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
var fs                   = require('fs')
var md5                  = require('md5')

var app              = express()
var server           = require('http').Server(app)
var port             = process.env.PORT || 8080


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

function search_twitter(term) {
    client.get('search/tweets', {q: term + ' filter:periscope'}, function(error, tweets, response) {
	console.log('got tweets', {tweets})
	for (var i in tweets) console.log(tweets[i])
	next(tweets)
    });}

function values(x) {
    var ar = []
    for (var i in x) ar.push(x[i])
    return ar }

function search_periscope(term, next) {
    request('https://www.periscope.tv/search?q=' + term, function (error, response, body) {
        body = body.replace(/(.||[\r\n\t])*data-store="/im, '')
        body = body.replace(/"><div id="PageView(.||[\r\n\t])*/im, '')
        body = entities.decode(body)
        body = JSON.parse(body)
        next(values(body.BroadcastCache.broadcasts).map((x) => x.broadcast))
    });}


app.get('/api/search', function(req, res){
    var term     = req.query.term
    search_periscope(term, (periscopes) => {
        search_twitter(term, (tweets) => {
            res.json({tweets, periscopes}) })})})

app.use(express.static(process.cwd() + '/public/', { setHeaders: function (res, path) {
    if (path.match('assets'))
        res.setHeader('Cache-Control', 'public, max-age=1296000')
    else
        res.setHeader('Cache-Control', process.env.NODE_ENV == 'production' ? 'public, max-age=7200' : '')}}))

server.listen(port);
