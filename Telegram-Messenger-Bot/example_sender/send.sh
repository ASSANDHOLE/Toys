#!/bin/bash

# if no argument is given, print usage and exit
if [ -z "$1" ]; then
    echo "Usage: $0 <message>, or $0 @<file_path>"
    exit 1
fi

TARGET_URL="https://example.com/endpoint"
TOKEN="your_token"

MESSAGE="$1"

# if MESSAGE starts with @, send file
USE_FILE=0
if [[ $MESSAGE == @* ]]; then
    USE_FILE=1
    MESSAGE=${MESSAGE:1}
fi

# if is file, get file name
if [ $USE_FILE -eq 1 ]; then
    FILENAME=$(basename "$MESSAGE")
fi

if [ $USE_FILE -eq 1 ]; then
    # send file
    curl -X POST -F text="$FILENAME" \
      -F "file=@$MESSAGE" \
      -F token=$TOKEN \
      -H "Content-Type: multipart/form-data" \
      $TARGET_URL
else
    # send message
    curl -X POST -F text="$MESSAGE" \
      -F token=$TOKEN \
      -H "Content-Type: multipart/form-data" \
      $TARGET_URL
fi

