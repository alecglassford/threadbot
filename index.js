/* eslint-disable no-console */

require('dotenv').config();
const Twit = require('twit');

const T = new Twit({
  consumer_key: process.env.CONSUMER_KEY,
  consumer_secret: process.env.CONSUMER_SECRET,
  access_token: process.env.ACCESS_TOKEN,
  access_token_secret: process.env.ACCESS_TOKEN_SECRET,
});

const util = require('./util');
const fixedThreads = require('./fixed');
const dynamicThreads = require('./dynamic')(T);

const totalWeight = [...fixedThreads, ...dynamicThreads].reduce(
  (soFar, curr) => soFar + curr[1],
  0,
);

const chooseTweet = function chooseTweetFunc(sendTweet) {
  const choice = util.randomInt(totalWeight);
  let weightSoFar = 0;

  // Iterate through fixed threads first
  for (let i = 0; i < fixedThreads.length; i += 1) {
    const thread = fixedThreads[i];
    weightSoFar += thread[1];
    if (weightSoFar > choice) { // This means we're done iterating!
      sendTweet(null, { status: thread[0] });
      return;
    }
  }

  // Then if we still haven't gotten there, iterate through dynamic thread
  for (let i = 0; i < dynamicThreads.length; i += 1) {
    const thread = dynamicThreads[i];
    weightSoFar += thread[1];
    if (weightSoFar > choice) { // This means we're done iterating!
      thread[0](sendTweet);
      return;
    }
  }

  console.error(`did not find thread for choice ${choice}`);
  console.log('Trying again ...');
  chooseTweet(sendTweet);
};

const sendTweet = function sendTweetFunc(err, params) {
  if (err) {
    console.error('Error composing tweet:');
    console.error(err);
    console.log('Trying again ...');
    chooseTweet(sendTweet);
    return;
  }
  T.post('statuses/update', params, (tErr) => {
    if (tErr) {
      console.error('Error posting tweet:');
      console.error(tErr);
      console.log('Trying again ...');
      chooseTweet(sendTweet);
      return;
    }
    util.schedule(chooseTweet, sendTweet);
  });
};

chooseTweet(sendTweet);

// Maybe this will make Zeit Now happy?
require('http').createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain; charset="utf-8"' });
  res.end('threadbot is 📯-ing intermittently …\n');
}).listen(8000);
