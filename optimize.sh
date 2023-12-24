#!/bin/bash
set -ex
cd "$(dirname "$(readlink -e "$0" || realpath "$0")")"
NODE_MODULES="node_modules/"
NODE_MODULES_TAR="node_modules.tar.gz"
if [[ -d $NODE_MODULES ]]; then
rm -rf "$NODE_MODULES_TAR" 
tar -czvf "$NODE_MODULES_TAR" "$NODE_MODULES" 
else
echo "No 'node_modules' directory" >&2
fi