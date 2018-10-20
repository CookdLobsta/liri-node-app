//variables n stuff like that

require("dotenv").config();
var keys = require("./keys.js");
var Spotify = require("node-spotify-api");
var spotify = new Spotify(keys.spotify);
var execute = process.argv[2];
var at = process.argv[3];
var request = require("request");
var moment = require("moment");
var fs = require("fs");
var json = require("./package.json");


//commands
switch(execute) {
	case "concert-this":
	if(at){
		concertThis(at)
	} else {
		//    * Not sure what to do if they don't get this correct.
		console.log("Sorry this is not an event!")
	}
	break;
	
	case "spotify-this-song":
	if (at) {
		spotifyThisSong(at)
	} else {
		//    * If no song is provided then default to "The Sign" by Ace of Base.
		spotifyThisSong("The Sign")
	}
	break;
	
	case "movie-this":
	if (at) {
		movieThis(at)
	} else {
		//    * If the user doesn't type a movie in, output data for the movie 'Mr. Nobody.'
		movieThis("Mr. Nobody")
	}
	break;
	
	case "do-what-is-says":
	doWhatItSays();
	break;
};

//execute= "concert-this" at= "<artist/band name here>"  `node liri.js concert-this <artist/band name here>`
function concertThis(at) {

	var bandRequest = "https://rest.bandsintown.com/artists/"+at+"/events?app_id=codingbootcamp";

	request(bandRequest, function (error, response, json) {

		if(!error && response.statusCode === 200) {

			var venueInfo = JSON.parse(json);

			let output = {
				"Name of Venue": venueInfo[0].venue.name,
				"Venue Location": venueInfo[0].venue.city + " "+ venueInfo[0].venue.region + " " + venueInfo[0].venue.country,
				"Date of event": moment(venueInfo[0].venue.datetime).format("MM/DD/YYYY")
			};
			console.log(output);
			storeData(output);
		}
	})
};

//execute= "spotify-this-song" at= "<song name here>"
//`node liri.js spotify-this-song <song name here>`
function spotifyThisSong(at) {
	spotify.search({ 
		type: "track",
		query: at,
		limit: 1,
	},
	
	function(err, data) {
		if (!err) {
			var songInfo = data.tracks.items;

			let output = {
				"Artist: ": songInfo[0].album.artists[0].name,
				"Song ": songInfo[0].name,
				"Album: ": songInfo[0].album.name,
				"Preview: ": songInfo[0].preview_url
			};
			console.log(output);
			storeData(output);
		} else {
			return console.log('You broke it! ' + err);
		}
	})
};

//execute= "movie-this" at= "<movie name here>"
// 3. `node liri.js movie-this '<movie name here>'`
function movieThis(at) {
	var movieRequest = "http://www.omdbapi.com/?t=" +at+ "&y=&plot=short&apikey=974954d9";

	request(movieRequest, function (error, response, json) {
		if(!error && response.statusCode === 200) {
			var movieInfo = JSON.parse(json);
			let output = {
				"Title: ": movieInfo.Title,
				"Year: ": movieInfo.Year,
				"Rated: ": movieInfo.imdbRating,
				"Reviews: ": movieInfo.Ratings[0].value,
				"Lang: ": movieInfo.Language,
				"Plot: ": movieInfo.Plot,
				"Staring: ": movieInfo.Actors
			}
			console.log(output);
			storeData(output);
		} else {
			console.log("You broke it!: " + error);
			return;
		}
	})
};


// 4. `node liri.js do-what-it-says`
function doWhatItSays() {
	fs.readFile("random.txt", "utf8", function (error, data) {
		if (error) {
			console.log(error);
			return;
		} 
		var  dataArray = data.split(",");

		execute = dataArray[0];
		at = dataArray[1];

		console.log(execute+" "+at);
		if (execute === "concert-this") {
			concertThis(at);
		}
		if (execute === "spotify-this-song") {
			spotifyThisSong(at);
		}
		if (execute === "movie-this") {
			movieThis(at);
		}
	})
};


// this logs all inputs to log.txt
function storeData(output) {
	fs.appendFile("log.txt", output, function(err) {

		if (err) {
			console.log(err);
			return;
		}
		console.log("Object stored!");
	})
};