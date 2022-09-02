#!/bin/bash

set -ex

if [ -f .env ]; then
	export $(cat .env | sed 's/#.*//g' | xargs)
fi

if [ -z "$GOOGLE_APIS_CREDENTIALS" ]; then
	export GOOGLE_APIS_CREDENTIALS=$(cat ./credentials.json)
fi

if [ -z "$GOOGLE_APIS_TOKEN" ]; then
	export GOOGLE_APIS_TOKEN=$(cat ./token.json)
fi

npm start
