# slack-pokebot

`slack-pokebot` is a little node.js program that posts a message to Slack whenever a new Pokemon is detected near your location. You can install it for your own Slack team in ten minutes!

![There is a Poliwag](image.png)

## Features

- Posts one message for each interesting Pokemon
- Configurable algorithm to determine which Pokemon are interesting
- Links to Google Map directions from start location to Pokemon location

## Quick start

In order to install `slack-pokebot`, you'll need to have permission to add an Incoming Webhook to your Slack team (or be an admin), and will need a Heroku* account.

### 1. Add Incoming Webhook to Slack

Make sure you're logged in to the Slack team you want to install slack-pokebot on, and go to

[![Deploy](https://www.herokucdn.com/deploy/button.svg)](https://heroku.com/deploy)

## Contributors

Idea and most of the code by [@katyemoe](https://twitter.com/katyemoe). Awesome metrics feature and many other improvements by [@ChrisJMajor](https://twitter.com/ChrisJMajor).

PRs welcome!

===

*It's also easy to install on any other cloud platform that can run node.js programs.
