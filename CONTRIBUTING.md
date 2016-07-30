# Contributing

Thank you for considering contributing to slack-pokebot!

## Development environment setup

The following steps set up a development environment so you can run slack-pokebot locally.

### Prerequisites

- git
- nvm or node v6 and npm v3

### Setup

First, fork the repo and clone it to your local machine.

```
git clone git@github.com:GITHUB_USERNAME/slack-pokebot.git
cd slack-pokebot
```

If you use nvm, ensure it is using the version specified in the `.nvmrc`:
```
nvm use
```
This should output `Now using node v6.3.1 (npm v3.10.3)`.

Now install the npm dependencies:
```
npm install
```

Finally, check that linting succeeds:
```
npm run lint
```
This will probably output several warnings, but as long as it exits with status `0` you should be fine.

You will then need to set the appropriate environment variables so that the bot can log in. These will be added to the README soon (:troll:).

Now you're ready to make changes to the code!

## Linting

There is a pre-commit hook that ensures linting passes before you can commit. I am using ESLint with a customised version of the Airbnb config to do this. Please note that you don't need ESLint installed globally for this to work.


## Submitting a pull request

When you've made and fully tested your changes, you're welcome to propose them as an upstream change. 

- **Please squash commits and write sensible commit messages before submitting your PR.** This makes it much easier to review.
- Travis CI runs the install and lint scripts on every PR. CI **must** pass before I can merge the PR.
- Rebase or merge upstream master into your branch before you submit or there will be merge conflicts.

I'll review your PR as soon as I can. I use labels to track the progress of this.

## Filing bugs and feature requests

Please use the [kmoe/slack-pokebot/issues](https://github.com/kmoe/slack-pokebot/issues) to submit bugs and feature requests. If submitting a bug, please try to include as much context as possible.

Feature requests may be approved or rejected by the project maintainers. If your feature request is rejected, feel free to fork the repo and implement the feature yourself.
