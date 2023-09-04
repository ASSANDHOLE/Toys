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
# requires python-telegram-bot version >= 20.0
# see https://github.com/python-telegram-bot/python-telegram-bot
pip install python-telegram-bot
pip install python-telegram-bot[job-queue]
pip install requests
```


## REST API

All files are in folder [web](./web).

It provides a REST API to send notifications to a user.
It also provides a simple web page for send notifications.

**Note**

If you plan to use [login_and_proxy](https://github.com/ASSANDHOLE/login_and_proxy) as a proxy for web-based upload,
Use [main_proxied.py](./web/main_proxied.py) instead of [main.py](./web/main.py).

And in your reverse proxy software, like `nginx`, you should add rules:

```nginx
server {
    ...
    
    location / {
        proxy_redirect off;
        proxy_pass http://127.0.0.1:12345;  # login_and_proxy port
        proxy_http_version 1.1;
        proxy_set_header Host $host;
    }

    location /update {  # for upload througn REST API
        proxy_redirect off;
        proxy_pass http://127.0.0.1:23456;  # this app's port
        proxy_http_version 1.1;
        proxy_set_header Host $host;
    }
}
```

And remember to change the service file to use `main_proxied.py` instead of `main.py`.

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
