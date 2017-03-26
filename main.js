var Entities    = require('html-entities').XmlEntities;
var entities    = new Entities();
var request     = require('request');
var Twitter     = require('twitter')
var twitter_key = 'o4PvV5Pj4po3DIZjab49AAsI8'
 
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
//	console.log(JSON.stringify(body, undefined, 2)); // Print the HTML for the Google homepage.
    });}
//search_twitter("maga")
//search_twitter("trump")
search_periscope("maga", (x) => console.log(x))
