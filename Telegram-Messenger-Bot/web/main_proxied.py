from flask import Flask, request

from messages import MessageQueue

app = Flask(__name__)
msg_queue = MessageQueue()

app.config['MAX_CONTENT_LENGTH'] = 200 * 1024 * 1024  # 200 MB

TOKEN = 'your_token'

HTML_CONTENT = """
<!doctype html>
<html lang="en">
<head>
    <title>File or Text Upload</title>
</head>
<body>
<h1>File or Text Upload</h1>
Send a text or a file, if a file is selected, the text will be the file name.
Or leave the text field empty and send only a file with it's original name.

<form method="POST" action="/auth_update" enctype="multipart/form-data">
    <p><input type="text" name="text"></p>
    <p><input type="file" name="file"></p>
    <p><input type="submit" value="Submit"></p>
</form>
</body>
</html>
"""


@app.route('/', methods=['GET'])
def simple_html():
    return HTML_CONTENT


@app.route('/auth_update', methods=['POST'])
def auth_update():
    ret = {'success': True, 'messages': ''}
    text = request.form.get('text')
    file = request.files.get('file')
    if not text and not file:
        ret['success'] = False
        ret['messages'] = 'No text or file'
    else:
        if file:
            f_name = text or file.filename
            msg_queue.add_new_file(f_name, file)
        else:
            msg_queue.add_new_text(text)
    return ret


@app.route('/update', methods=['POST'])
def update():
    ret = {'success': True, 'messages': ''}
    token = request.form.get('token')
    if not token or token != TOKEN:
        ret['success'] = False
        ret['messages'] = 'Invalid token'
        return ret
    text = request.form.get('text')
    file = request.files.get('file')
    if not text and not file:
        ret['success'] = False
        ret['messages'] = 'No text or file'
    else:
        if file:
            f_name = text or file.filename
            msg_queue.add_new_file(f_name, file)
        else:
            msg_queue.add_new_text(text)
    return ret


@app.route('/get', methods=['GET'])
def get_new_msg():
    token = request.args.get('token')
    if not token or token != TOKEN:
        return {'success': False, 'messages': 'Invalid token'}
    msg = msg_queue.get_new_messages()
    return {'success': True, 'messages': msg}


if __name__ == '__main__':
    app.run(debug=False, use_reloader=False)
