'use strict';

const request = require('request');
const moment = require('moment');
const _ = require('underscore');

module.exports.chill = chill;
function chill(event, context, callback) {
  if (!process.env.GithubAccessToken) throw new Error('Github token must be set via GithubAccessToken env vars');
  if (!process.env.SlackHookURL) throw new Error('Slack hook URL must be set via SlackHookURL env vars');

  module.exports.getJSON('https://api.github.com/users/'+ process.env.GithubUsername +'/events', (err, data) => {
    if (err) return callback(err);

    let events = process.env.EventsJSON ? JSON.parse(process.env.EventsJSON) : data;
    const today = process.env.TodaysDate || moment().format('YYYY-MM-DD');

    // Optional: exclude certain events. See: https://developer.github.com/v3/activity/events/types/
    let exclude = process.env.ExcludeEvents || []; // Example: ['IssueCommentEvent', 'GollumEvent'];
    if (exclude.length > 0) events = _.filter(events, (item) => exclude.indexOf(item.type) == -1);

    // Collect every recent date that you contributed to GitHub.
    let dates = [];
    events.forEach((datum) => {
      dates.push(moment(datum.created_at).format('YYYY-MM-DD'));
    });
    // Make array of dates unique.
    dates = _.uniq(dates);

    // Get your current streak.
    let daysInRow = 0;
    for (let i = 0; i < events.length; i++) {
      const date = moment(today, 'YYYY-MM-DD').subtract(i + 1, 'day').format('YYYY-MM-DD');
      if (dates.indexOf(date) > -1) daysInRow++;
      else break;
    }

    // If your streak is greater than or equal to your max streak, post to Slack.
    if (daysInRow >= process.env.Streak) {
      const message = 'Your GitHub contribution streak is ' + daysInRow + ' days 🙀\n\n*Time to take a break!*';
      module.exports.post(message, callback);
    } else {
      // If you broke your streak, then don't post to Slack.
      return callback(null, 'No streak, no Slack post.');
    }
  });
}

/**
* Posts chill message to Slack webhook URL.
*
* @function post
* @param {String} message - Message that reminds me to chill
* @param {Callback} callback - if error, returns error message; otherwise,
* returns request body
*/
module.exports.post = post;
function post(message, callback) {

  const json = {
    channel: process.env.SlackChannel,
    username: 'ChillBot',
    icon_emoji: ':massage:',
    parse: 'full',
    text: message,
    markdown: true
  };

  request.post({
    url: process.env.SlackHookURL,
    json: json
  }, (err, resp) => {
    if (err) return callback(err);
    if (resp.statusCode !== 200) return callback(new Error('Got HTTP status ' + resp.statusCode + ' from slack'));
    return callback(null, 'Posted to Slack.');
  });
}

/**
* Makes a request to a GitHub API URL.
*
* @function getJSON
* @param {String} url - a GitHub API get request URL
* @param {Callback} callback - if error, returns error message; otherwise,
* returns JSON object
*/
module.exports.getJSON = getJSON;
function getJSON(url, callback) {
  let results = [];

  let params = {
    page: 1,
    per_page: 30
  };

  getEvents(params);

  function getEvents(params) {
    let opts = {
      url: url + '?page=' + params.page,
      headers: {
        'User-Agent': process.env.GithubUsername,
        'Authorization': 'token ' + process.env.GithubAccessToken
      }
    };

    request(opts, (err, res, body) => {
      if (err) return callback(err);
      if (res.statusCode !== 200) return callback(new Error('HTTP ' + res.statusCode + ' for ' + url));

      const response = JSON.parse(body);
      results = results.concat(response);
      if (response.length === params.per_page && params.page < 10) {
        params.page++;
        getEvents(params);
      } else {
        callback(null, results);
      }
    });
  }
}