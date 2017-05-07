# chillbot [![Build Status](https://travis-ci.org/katydecorah/chillbot.svg?branch=master)](https://travis-ci.org/katydecorah/chillbot)

A Slack bot that will help you break your GitHub contribution streak and idk do something else like read a book or go outside. Runs every Saturday and Sunday morning at 8 AM EST.

This bot uses the [Github Events API](https://developer.github.com/v3/activity/events/) by fetching the last 300 events (maximum allowed in the request) that you performed on GitHub.

## Set up

:bulb: **New to deploying code to Amazon Web Services (AWS)?** Try the [get started steps in SETUP.md](SETUP.md) for a walk-through of the process and the code.

Run:

```
npm install
npm link
```

Set GitHub access token as environment variable:

```
echo "export GithubAccessToken=0000ffff0000ffff0000ffff0000ffff0000ffff" >> ~/.bash_profile
```

Create a [Slack Webhook](https://api.slack.com/incoming-webhooks) and set the url as environment variable:

```
echo "export SlackHookURL=0000ffff0000ffff0000ffff0000ffff0000ffff" >> ~/.bash_profile
```

## Test locally

Run:

```
chillbot --channel=<Slack channel> --github=<Github username> --streak=<Number of days>
```

Example:

```
chillbot --channel=@katydecorah --github=katydecorah --streak=7
```
