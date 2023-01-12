import logging
import os

from telegram import Update
from telegram.ext import Application, CommandHandler, ContextTypes, MessageHandler, filters

import requests

# Enable logging
logging.basicConfig(
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s', level=logging.INFO
)
logger = logging.getLogger(__name__)

# os.environ['no_proxy'] = '*'

ALLOWED_USER = 123456789
CHAT_ID = ALLOWED_USER

MSG_URL = 'http://127.0.0.1:5000/get'
BOT_TOKEN = '12345:ABCdefGH'
MSG_TOKEN = 'your_token'


# Define a few command handlers. These usually take the two arguments update and
# context.
async def start(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    """Send a message when the command /start is issued."""
    if update.effective_user.id != ALLOWED_USER:
        await update.message.reply_text('You are not allowed to use this bot')
    else:
        await update.message.reply_text(f'Hello {update.effective_user.name}')


async def do_nothing(update: Update, context: ContextTypes.DEFAULT_TYPE):
    # acknowledge the message
    pass


async def send_new_data(callback: ContextTypes.DEFAULT_TYPE, data: dict):
    if data['text']:
        await callback.bot.send_message(chat_id=CHAT_ID, text=data['content'])
    else:
        file_name = data['file_name']
        file_save_path = data['save_path']
        doc = open(file_save_path, 'rb')
        await callback.bot.send_document(chat_id=CHAT_ID, document=doc, filename=file_name)
        doc.close()
        os.remove(file_save_path)


async def retrieve_new_data(callback: ContextTypes.DEFAULT_TYPE):
    data = requests.get(MSG_URL, params={'token': MSG_TOKEN}).json()
    print(data)
    if data['success']:
        for msg in data['messages']:
            await send_new_data(callback, msg)


def main() -> None:
    application = Application.builder().token(BOT_TOKEN).build()
    application.add_handler(CommandHandler('start', start))
    application.add_handler(MessageHandler(filters.ALL, do_nothing))
    # interval is in seconds when use numeric value
    application.job_queue.run_repeating(retrieve_new_data, interval=1, first=1)
    application.run_polling()


if __name__ == '__main__':
    main()
