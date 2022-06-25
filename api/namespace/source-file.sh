#!/bin/bash
set -euo pipefail

# `import` debug logs are always enabled during build
export IMPORT_DEBUG=1
export IMPORT_CURL_OPTS="-s -H"
export IMPORT_RELOAD=0

IMPORT_LIB="$IMPORT_CACHE/bin/lib"
lastcmd="| last cmd = $? |" 

handler() {
    echo "Installing static \`package\` binary to \"$IMPORT_LIB\"" \
    eval "$(curl -sfLS \"https://github.com/jwerre/node-canvas-lambda/blob/master/node12_canvas_lib64_layer.zip?raw=true\" > $IMPORT_LIB && unzip -o $IMPORT_LIB $IMPORT_LIB/lib &&  rm -rf $IMPORT_LIB/lib.zip:)" \
    echo "$lastcmd" \
    echo "sourcing lib \`package\` and removed the zip file" \
    eval "$(. "$IMPORT_LIB/lib")" \
    echo "$lastcmd" \
    echo "listing the contents of the IMPORT_LIB dir" \
    echo "$(ls -laiR $IMPORT_CACHE/bin)" \
    echo "$lastcmd" \
    echo "listing the contents of the IMPORT_LIB dir"
    echo ""
    echo "Courtesy of Servingtokens.com"
    echo "code coming soon"
}

# ```html
# Installing static `package` binary to "/var/task/.import-cache/bin/lib" eval  echo | last cmd = 0 | echo sourcing lib `package` and removed the zip file eval  echo | last cmd = 0 | o | last cmd = 0 | echo listing the contents of the IMPORT_LIB dir echo /var/task/.import-cache/bin:
# total 5579
# 2 drwxr-xr-x 2 root root      51 May 26 06:44 .
# 1 drwxr-xr-x 3 root root      44 May 26 06:44 ..
# 3 -rwxr-xr-x 1 root root 2845128 Oct 20  2018 curl
# 4 -rwxr-xr-x 1 root root    8076 Oct 20  2018 import
# 5 -rwxr-xr-x 1 root root 2859048 Oct 20  2018 jq echo | last cmd = 0 | echo listing the contents of the IMPORT_LIB dir
# ```
