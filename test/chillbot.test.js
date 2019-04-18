'use strict';

const chillbot = require('../index.js');
const test = require('tape');

const streak = require('./fixtures/streak.json');
test('[chillbot] success streak', assert => {
  process.env.SlackChannel = 'test-channel';
  process.env.SlackHookURL = 'http://test.hook.com';
  process.env.GithubUsername = 'katydecorah';
  process.env.Streak = '7';
  process.env.TodaysDate = '2017-04-25';
  process.env.EventsJSON = JSON.stringify(streak);

  const originalPost = chillbot.post;
  chillbot.post = message => {
    assert.equal(
      message,
      'Your GitHub contribution streak is 7 days 🙀\n\n*Time to take a break!*'
    );
    return new Promise(resolve => {
      resolve('success');
    });
  };

  chillbot.chill({}, null, (err, res) => {
    assert.ifError(err, 'Should not error');
    assert.deepEqual(
      res,
      'success',
      'Success message from post() should appear in callback'
    );
    chillbot.post = originalPost;
    assert.end();
  });
});

const noStreak = require('./fixtures/no-streak.json');
test('[chillbot] success no streak', assert => {
  process.env.SlackChannel = 'test-channel';
  process.env.SlackHookURL = 'http://test.hook.com';
  process.env.GithubUsername = 'katydecorah';
  process.env.Streak = '7';
  process.env.TodaysDate = '2017-04-25';
  process.env.EventsJSON = JSON.stringify(noStreak);

  chillbot.chill({}, null, (err, res) => {
    assert.ifError(err, 'Should not error');
    assert.deepEqual(
      res,
      'No streak, no Slack post.',
      'Message should appear in callback'
    );
    assert.end();
  });
});

const streakExclude = require('./fixtures/streak-exclude.json');
test('[chillbot] exclude events, streak', assert => {
  process.env.SlackChannel = 'test-channel';
  process.env.SlackHookURL = 'http://test.hook.com';
  process.env.GithubUsername = 'katydecorah';
  process.env.Streak = '7';
  process.env.TodaysDate = '2017-04-25';
  process.env.EventsJSON = JSON.stringify(streakExclude);
  process.env.ExcludeEvents = ['IssueCommentEvent'];

  const originalPost = chillbot.post;
  chillbot.post = message => {
    assert.equal(
      message,
      'Your GitHub contribution streak is 7 days 🙀\n\n*Time to take a break!*'
    );
    return new Promise(resolve => {
      resolve('success');
    });
  };

  chillbot.chill({}, null, (err, res) => {
    assert.ifError(err, 'Should not error');
    assert.deepEqual(res, 'success');
    chillbot.post = originalPost;
    assert.end();
  });
});

test('[chillbot] exclude events, no streak', assert => {
  process.env.SlackChannel = 'test-channel';
  process.env.SlackHookURL = 'http://test.hook.com';
  process.env.GithubUsername = 'katydecorah';
  process.env.Streak = '7';
  process.env.TodaysDate = '2017-04-25';
  process.env.EventsJSON = JSON.stringify(streak);
  process.env.ExcludeEvents = ['IssueCommentEvent'];

  chillbot.chill({}, null, (err, res) => {
    assert.ifError(err, 'Should not error');
    assert.deepEqual(
      res,
      'No streak, no Slack post.',
      'Message should appear in callback'
    );
    assert.end();
  });
});
