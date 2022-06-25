#!/bin/bash
set -euo pipefail
# https://runtime-tests-0334.vercel.app/api/shred-individual-file

build() {
	date > build-time.txt
}


# `import` debug logs are always enabled during build
export IMPORT_DEBUG=1
export IMPORT_CURL_OPTS="-s -H"
export IMPORT_RELOAD=0

IMPORT_SCRIPTTOFOLDER="$IMPORT_CACHE/bin/scripttofolder.raw"

handler() {
  echo $(shred --version)
  echo
  echo "attempting to remove an individual file static \`scripttofolder\` binary to \"$IMPORT_SCRIPTTOFOLDER\"" \
    eval "$(curl -sfLS "https://raw.githubusercontent.com/servingtokens-sh/scripts/main/scripttofolder.sh" > "$IMPORT_SCRIPTTOFOLDER" \
    chmod +x "$IMPORT_SCRIPTTOFOLDER")" \
    # cp "$/runtime.sh" "$IMPORT_CACHE"
    eval "$(. "$IMPORT_SCRIPTTOFOLDER")"
    echo "$(ls -laiR $IMPORT_CACHE)"

    echo "Build time:   $(cat build-time.txt)"


	  echo "Current time: $(date)"
    echo ""
    echo "Courtesy of Servingtokens.com"
    echo "code coming soon"
}

# ```html
# shred (GNU coreutils) 8.22 Copyright (C) 2013 Free Software Foundation, Inc. License GPLv3+: GNU GPL version 3 or later <http://gnu.org/licenses/gpl.html>. This is free software: you are free to change and redistribute it. There is NO WARRANTY, to the extent permitted by law. Written by Colin Plumb.

# attempting to remove an individual file static `scripttofolder` binary to "/var/task/.import-cache/bin/scripttofolder.raw" eval 
# /var/task/.import-cache:
# total 4
#  1 drwxr-xr-x 3 root root   44 May 27 22:36 .
# 11 drwxr-xr-x 4 root root   86 May 27 22:36 ..
#  2 drwxr-xr-x 2 root root   51 May 27 22:36 bin
#  6 -rwxr-xr-x 1 root root 3517 Oct 20  2018 runtime.sh

# /var/task/.import-cache/bin:
# total 5579
# 2 drwxr-xr-x 2 root root      51 May 27 22:36 .
# 1 drwxr-xr-x 3 root root      44 May 27 22:36 ..
# 3 -rwxr-xr-x 1 root root 2845128 Oct 20  2018 curl
# 4 -rwxr-xr-x 1 root root    8076 Oct 20  2018 import
# 5 -rwxr-xr-x 1 root root 2859048 Oct 20  2018 jq
# Build time:   Fri May 27 22:36:08 UTC 2022
# Current time: Fri May 27 22:41:50 UTC 2022
# ```
