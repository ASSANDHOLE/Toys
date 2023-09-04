import os
import time

import requests

URL = 'https://example.com/endpoint'
TOKEN = 'your_token'
FILE = 'test.txt'


class SimpleFileWatcher:
    def __init__(self, file_path):
        self.file_path = file_path
        self.EPS = 1e-6
        if not os.path.exists(file_path) and not os.path.isfile(file_path):
            raise FileNotFoundError(f'File {file_path} not found')
        try:
            self.last_modified = os.path.getmtime(file_path)
        except OSError:
            raise ValueError(f'File {file_path} maybe inaccessible')

    def get_status(self):
        if not os.path.exists(self.file_path) and not os.path.isfile(self.file_path):
            return -1
        try:
            last_modified = os.path.getmtime(self.file_path)
        except OSError:
            return -2
        if abs(last_modified - self.last_modified) < self.EPS:
            return 0
        else:
            self.last_modified = last_modified
            return 1


def main():
    file_path = FILE
    if os.path.isabs(file_path):
        file_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), file_path)
    watcher = SimpleFileWatcher(file_path)
    data = {
        'text': '',
        'token': TOKEN
    }
    files = {
        'file': None
    }
    while True:
        time.sleep(1)
        status = watcher.get_status()
        print(status)
        if status != 0:
            if status == -1 or status == -2:
                data['text'] = 'File error with status ' + str(status)
                requests.post(url=URL, data=data)
                break
            else:
                files['file'] = open(file_path, 'rb')
                data['text'] = 'test.txt'
                requests.post(url=URL, data=data, files=files)
                files['file'] = None


if __name__ == '__main__':
    main()
