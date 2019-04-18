#!/usr/bin/env node
'use strict';

const chillbot = require('../index.js');
const argv = require('minimist')(process.argv.slice(2));

if (!argv.github || !argv.streak || !argv.channel) {
  console.log(
    'Usage:   chillbot --channel=<Slack channel> --github=<Github username> --streak=<Number of days>'
  );
  console.log(
    'Example: chillbot --channel=@katydecorah --github=katydecorah --streak=7'
  );
  process.exit(1);
}

process.env.SlackChannel = argv.channel;
process.env.GithubUsername = argv.github;
process.env.Streak = argv.streak;

chillbot.chill({}, null, (err, callback) => {
  if (err) {
    console.error(err);
    process.exit(1);
  }
  console.log(callback);
});
