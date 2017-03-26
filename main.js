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
//	next(tweets)

    });}

function lookup_by_search_term() {
    var request = require('request');
    request('http://www.google.com', function (error, response, body) {
	console.log('error:', error); // Print the error if one occurred
	console.log('statusCode:', response && response.statusCode); // Print the response status code if a response was received
	console.log('body:', body); // Print the HTML for the Google homepage.
    });}


search_twitter("maga")
search_twitter("trump")
