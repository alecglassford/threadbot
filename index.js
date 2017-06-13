/* eslint-disable no-console */

require('dotenv').config();
const Twit = require('twit');

const T = new Twit({
  consumer_key: process.env.CONSUMER_KEY,
  consumer_secret: process.env.CONSUMER_SECRET,
  access_token: process.env.ACCESS_TOKEN,
  access_token_secret: process.env.ACCESS_TOKEN_SECRET,
});

const SCREEN_NAME = process.env.SCREEN_NAME;

// ~~~ Define all the things we can tweet, along with probability weights!

const fixedThreads = [
  ['<THREAD>', 100],
  ['1/', 70],
  ['THREAD', 90],
  ['thread', 40],
  ['#thread', 20],
  ['[THREAD]', 10],
  ['(THREAD)', 50],
  ['(thread)', 10],
  ['thread:', 40],
  ['time for a thread', 5],
  ['It\'s time for some game theory.', 1],
  ['tweetstorm:', 1],
];

let quoteThread;
let outOfThread;
const dynamicThreads = [
  [quoteThread, 10],
  [outOfThread, 5],
];

// ~~~ End defining the things we want to tweet

const totalWeight = [...fixedThreads, ...dynamicThreads].reduce(
  (soFar, curr) => soFar + curr[1],
  0,
);

const randomInt = function randomIntFunc(max) {
  return Math.floor(Math.random() * max);
};

let sendTweet;
const chooseTweet = function chooseTweetFunc() {
  const choice = randomInt(totalWeight);
  let weightSoFar = 0;

  // Iterate through fixed threads first
  for (let i = 0; i < fixedThreads.length; i += 1) {
    const thread = fixedThreads[i];
    weightSoFar += thread[1];
    if (weightSoFar > choice) { // This means we're done iterating!
      sendTweet({ status: thread[0] });
      return;
    }
  }

  // Then if we still haven't gotten there, iterate through dynamic thread
  for (let i = 0; i < dynamicThreads.length; i += 1) {
    const thread = dynamicThreads[i];
    weightSoFar += thread[1];
    if (weightSoFar > choice) { // This means we're done iterating!
      thread[0]();
      return;
    }
  }

  console.error(`did not find thread for choice ${choice}`);
  chooseTweet();
};

let schedule;
sendTweet = function sendTweetFunc(params) {
  T.post('statuses/update', params, (err) => {
    if (err) {
      console.error(err);
    }
    schedule();
  });
};

schedule = function scheduleFunc() {
  const MS_PER_SEC = 1000;
  const SEC_PER_MIN = 60;
  const MIN_PER_HR = 60;
  const MAX_HRS = 24;
  const MAX_MS = MAX_HRS * MIN_PER_HR * SEC_PER_MIN * MS_PER_SEC;
  const waitTime = randomInt(MAX_MS);
  console.log(`waiting for ${waitTime} ms until next tweet...`);
  setTimeout(chooseTweet, waitTime);
};

// ~~~ Dynamic threads!

quoteThread = function quoteThreadFunc() {
  T.get(
    'statuses/user_timeline',
    { screen_name: SCREEN_NAME, count: 200 },
    (err, data) => {
      if (err) {
        console.error(err);
        schedule();
      }
      const index = randomInt(data.length);
      const id = data[index].id;
      sendTweet({
        status: `👇 https://twitter.com/${SCREEN_NAME}/status/${id}`,
      });
    },
  );
};

outOfThread = function outOfThreadFunc() {
  sendTweet({ status: `<THREAD> 1/${randomInt(2000)}` });
};

// ~~~ End dynamic threads!

chooseTweet();
