# Telegram Messenger Bot And REST API

This is a simple _Telegram_ bot that can be used
to send messages (text and files) to a Telegram user with id.

This is useful if you want to notify yourself about, e.g.,
when some tasks on your remote Linux server are finished,
only use simple tools like `curl` and `wget` and don't want
to install a full-fledged Telegram client.

It also provides a REST API in `Flask` to send notifications.

## Bot

All files are in folder [tgbot](./tgbot).

It simply queries the api to get new messages periodically
and sends them to the user.

Requirements:
```shell
# requires python-telegram-bot version 20.0, i.e. `--pre`
# see https://github.com/python-telegram-bot/python-telegram-bot
pip install python-telegram-bot --pre
pip install python-telegram-bot[job-queue] --pre
pip install requests
```


## REST API

All files are in folder [web](./web).

It provides a REST API to send notifications to a user.
It also provides a simple web page for send notifications.

Requirements:
```shell
pip install flask
```


## Usage

Some examples are in folder [example_sender](./example_sender)

The [listen_on_file.py](./example_sender/listen_on_file.py) script
listens on changes of a file and sends the file to the user if it changes.
Requires `requests`.

The [send.sh](./example_sender/send.sh) script sends a message to the user
using cURL.
