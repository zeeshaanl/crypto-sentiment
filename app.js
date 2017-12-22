import dotenv from 'dotenv';
import express from 'express';
import socket from 'socket.io';

const app = express();

dotenv.config();

import Twit from 'twit';
import sentiment from 'sentiment';

const twit = new Twit({
    consumer_key: process.env.CONSUMER_KEY,
    consumer_secret: process.env.CONSUMER_SECRET,
    access_token: process.env.ACCESS_TOKEN,
    access_token_secret: process.env.ACCESS_TOKEN_SECRET
});

const startTweetStream = (tweetCount, tweetTotalSentiment, phrase, client) => {
    const stream = twit.stream('statuses/filter', { track: `#${phrase}`, language: 'en' });
    console.log(`Tweet Text: ${phrase}`);

    stream.on('tweet', function (tweet) {
        console.log('tweet received!');
        sentiment(tweet.text, (err, result) => {
            tweetCount++;
            tweetTotalSentiment += result.score;
        });
        console.log(tweetCount);
        console.log(tweetTotalSentiment);
        client.emit('sentiment', {
            [phrase]: `Out of a total of ${tweetCount} tweets the sentiment for ${phrase} is ${tweetTotalSentiment / tweetCount}`
        })
    });

};

const server = app.listen(2200, (req, res) => {
    console.log('Listening on 2200');
});

const io = socket(server);

io.on('connection', (client) => {
    // here you can start emitting events to the client 
    console.log(client.id, 'HERE');

    client.on('subscribeToSentiment', (phrase) => {
        let tweetCount = 0;
        let tweetTotalSentiment = 0;

        startTweetStream(tweetCount, tweetTotalSentiment, phrase, client);
    });
});

//
// const getTweetsAsString = async (topic, startDate) => {
//     try {
//         const { data, error, response } = await twit.get('search/tweets', { q: `${topic} since:${startDate}`, count: 100 });
//         return data.statuses.map(status => status.text).join(' ');
//     } catch (err) {
//         console.log(err);
//     }
// };
//

//
// const logSentiment = (tweetCount, tweetTotalSentiment) => {
//     console.log(`Tweets Monitored: ${tweetCount}`);
//     console.log(`Tweet Average Sentiment: ${tweetTotalSentiment / tweetCount}`);
// };
//
// startTweetStream();