# What Is
login and proxy server (**DO NOT USE IN PRODUCTION**)

# How To Use
install npm

then `npm install`

create a new folder named `config` in the root directory

create a new file named `config.json` in the `config` folder

see `config_template/config.json` for the format of `config.json`

then change `auth/accounts.json` to your own accounts and passwords

then can install this as a systemd service, see the `login_and_proxy.service` file

# License

The Unlicense, part of the code was based on [todos-express-password](https://github.com/passport/todos-express-password)
