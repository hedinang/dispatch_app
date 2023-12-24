#!/bin/sh

BUILD_DIR="/usr/share/nginx/html/"

CONTAINER_ALREADY_STARTED="CONTAINER_ALREADY_STARTED"
if [ ! -e $CONTAINER_ALREADY_STARTED ]; then
    touch $CONTAINER_ALREADY_STARTED
    JSFILES="$(find $BUILD_DIR -type f \( -iname \*.js -o -iname \*.html \) )"
    for JSF in $JSFILES; do
        perl -pe 's/__ENV__([a-zA-Z0-9_]+)__END__/$ENV{$1}/g' $JSF > $JSF.tmp
        mv $JSF.tmp $JSF
    done 
fi

envsubst '\$PORT' < /etc/nginx/nginx.conf.tepmplate > /etc/nginx/nginx.conf

# Clean sourcemap
if [ -z "$KEEP_SOURCEMAP" ] || [ "$KEEP_SOURCEMAP" = "false" ]; then
  find /usr/share/nginx/html/static -name "*.map" -type f -delete || true
elif [ "$KEEP_SOURCEMAP" = "true" ]; then
  echo "SOURCEMAP WILL BE KEPT!!!"
fi

exec nginx -g 'daemon off;'