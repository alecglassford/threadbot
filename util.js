/* eslint-disable no-console */

const randomInt = function randomIntFunc(max) {
  return Math.floor(Math.random() * max);
};

const MS_PER_SEC = 1000;
const SEC_PER_MIN = 60;
const MIN_PER_HR = 60;
const MAX_HRS_BETWEEN_TWEETS = 24;
const MAX_MS_BETWEEN_TWEETS = MAX_HRS_BETWEEN_TWEETS * MIN_PER_HR * SEC_PER_MIN * MS_PER_SEC;

const futureTime = function futureTimeFunc(msFromNow) {
  const future = new Date(Date.now() + msFromNow);
  return future.toString();
};

const schedule = function scheduleFunc(func, ...funcParams) {
  const waitTime = randomInt(MAX_MS_BETWEEN_TWEETS);
  console.log(`Will execute ${func.name} at ~ ${futureTime(waitTime)}`);
  setTimeout(func, waitTime, ...funcParams);
};

module.exports = {
  schedule,
  randomInt,
};
