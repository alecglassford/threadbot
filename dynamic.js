const util = require('./util');

module.exports = function dynamicThreads(T) {
  const quoteThread = function quoteThreadFunc(sendTweet) {
    T.get(
      'statuses/user_timeline',
      { screen_name: process.env.SCREEN_NAME, count: 200 },
      (err, data) => {
        if (err) {
          sendTweet(err);
        }
        const index = util.randomInt(data.length);
        const id = data[index].id;
        sendTweet(null, {
          status: `👇 https://twitter.com/${process.env.SCREEN_NAME}/status/${id}`,
        });
      },
    );
  };

  const outOfThread = function outOfThreadFunc(sendTweet) {
    sendTweet(null, { status: `<THREAD> 1/${util.randomInt(2000)}` });
  };

  return [
    [quoteThread, 10],
    [outOfThread, 5],
  ];
};
