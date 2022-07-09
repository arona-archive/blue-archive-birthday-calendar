#!/bin/bash

if [ -f .env ]
then
  export $(cat .env | sed 's/#.*//g' | xargs)
fi

set -ex

export GOOGLE_APIS_CREDENTIALS=$(cat ./credentials.json)
export GOOGLE_APIS_TOKEN=$(cat ./token.json)

npm start
