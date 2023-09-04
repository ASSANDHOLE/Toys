import os
from threading import Lock

from werkzeug.datastructures import FileStorage

FILE_RECV_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'file_recv')


class MessageQueue:
    def __init__(self):
        self.lock = Lock()
        self.counter = 0
        self.lim = 99999
        self.queue = []

    def add_new_text(self, text: str):
        with self.lock:
            self.queue.append({'text': True, 'content': text})

    def add_new_file(self, file_name: str, file_content: FileStorage):
        with self.lock:
            self.counter = (self.counter + 1) % self.lim
            save_dir = os.path.join(FILE_RECV_PATH, f'f{self.counter}')
        file_content.save(save_dir)
        with self.lock:
            self.queue.append({
                'text': False, 'file_name': file_name,
                'save_path': save_dir
            })

    def get_new_messages(self):
        with self.lock:
            q = self.queue
            self.queue = []
            return q
