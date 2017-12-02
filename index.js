'use strict';

const request = require('request');
const moment = require('moment');
const _ = require('underscore');

const chill = (event, context, callback) => {
  if (!process.env.GithubAccessToken) throw new Error('Github token must be set via GithubAccessToken env vars');
  if (!process.env.SlackHookURL) throw new Error('Slack hook URL must be set via SlackHookURL env vars');

  module.exports.getJSON()
  .catch(err => callback(err))
  .then(module.exports.getEvents)
  .then(module.exports.getDates)
  .then(module.exports.getDaysInRow)
  .then(module.exports.post)
  .then(chill => callback(null, chill))
  .catch(err => callback(err));
};

/**
* Posts chill message to Slack webhook URL.
*
* @function post
* @param {String} message - Message that reminds me to chill
* @param {Callback} callback - if error, returns error message; otherwise,
* returns request body
*/
const post = (message) => {
  const json = {
    channel: process.env.SlackChannel,
    username: 'ChillBot',
    icon_emoji: ':massage:',
    parse: 'full',
    text: message,
    markdown: true
  };

  return new Promise((resolve, reject) => {
    if (message) {
      request.post({
        url: process.env.SlackHookURL,
        json: json
      }, (err, resp) => {
        if (err) reject(err);
        if (resp.statusCode !== 200) reject(`Got HTTP status ${resp.statusCode} from Slack`);
        return resolve('Posted to Slack.');
      });
    } else {
      resolve('No streak, no Slack post.');
    }
  });
};

const getJSON = () => {
  let results = [];
  return new Promise((resolve, reject) => {
    const recurse = (page) => {
      let opts = {
        url: `https://api.github.com/users/${process.env.GithubUsername}/events?page=${page}`,
        headers: {
          'User-Agent': process.env.GithubUsername,
          'Authorization': `token ${process.env.GithubAccessToken}`
        }
      };
      return request(opts, (err, res, body) => {
        if (err) reject(err);
        if (res.statusCode !== 200) reject(`HTTP ${res.statusCode}`);
        const response = JSON.parse(body);
        results = results.concat(response);
        if (response.length === 30 && page < 10) {
          recurse(page + 1);
        } else {
          resolve(results);
        }
      });
    };
    recurse(1);
  });
};

const getDates = (events) => {
  return new Promise((resolve) => {
    resolve({
      dates:_.uniq(events.reduce((dates, datum) => {
        dates.push(moment(datum.created_at).format('YYYY-MM-DD'));
        return dates;
      }, [])),
      events: events
    });
  });
};

const getDaysInRow = (data) => {
  return new Promise((resolve) => {
    const today = process.env.TodaysDate || moment().format('YYYY-MM-DD');
    let daysInRow = 0;
    for (let i = 0; i < data.events.length; i++) {
      const date = moment(today, 'YYYY-MM-DD').subtract(i + 1, 'day').format('YYYY-MM-DD');
      if (data.dates.indexOf(date) > -1) daysInRow++;
      else break;
    }
    if (daysInRow >= process.env.Streak) {
      resolve(`Your GitHub contribution streak is ${daysInRow} days 🙀\n\n*Time to take a break!*`);
    } else resolve();
  });
};

const getEvents = (data) => {
  return new Promise((resolve) => {
    let events = process.env.EventsJSON ? JSON.parse(process.env.EventsJSON) : data;
    // Optional: exclude certain events.
    // See: https://developer.github.com/v3/activity/events/types/
    // Example: ['IssueCommentEvent', 'GollumEvent'];
    const exclude = process.env.ExcludeEvents || [];
    if (exclude.length > 0) events = _.filter(events, (item) => exclude.indexOf(item.type) == -1);
    resolve(events);
  });
};

module.exports = {
  chill,
  post,
  getJSON,
  getEvents,
  getDates,
  getDaysInRow
};
