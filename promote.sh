#!/bin/bash
git checkout dev
git pull
git checkout -b release-$2
sed -i.bak "s/\"version\": \"$1-SNAPSHOT/\"version\": \"$2/" package.json
echo "add change"
git add package.json
echo "commit"
git commit -m "release $2"
git checkout master
git pull
git merge --no-ff release-$2 -m "Merge branch release-$2"
git checkout dev
git merge --no-ff release-$2 -m "Merge branch release-$2"
sed -i.bak "s/\"version\": \"$2/\"version\": \"$3-SNAPSHOT/" package.json
git add package.json
git commit -m "new snapshot"