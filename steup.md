### setup
1. Rename the `config.json.sample` file to `config.json`, the .sample is provided as an example
1. Setup twitch developer, and discord developer, and create an app for both
1. Obtain a twitch OAuth token using their API, place into the `config.json` file as ttv_token
1. Obtain the discord bot token, place into the `config.json` file as token
1. In the `config.json` file, replace `host` with your domain name

##### setup for testing
1. update nginx to ip
1. update config.json to ip
1. before stopping, clear webhooks