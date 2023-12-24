#!/bin/sh

set -ex

tee ~/.npmrc <<EOF
registry=$NPM_REGISTRY_URL
_auth=$NPM_AUTH_KEY
email=$NPM_EMAIL
always-auth=true
EOF

npm i