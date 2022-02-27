#!/bin/bash

set -e

if [ -f .env ]
then
  export $(cat .env | sed 's/#.*//g' | xargs)
fi

export GOOGLE_APIS_CREDENTIALS=$(cat ./credentials.json)
export GOOGLE_APIS_TOKEN=$(cat ./token.json)

npm start
