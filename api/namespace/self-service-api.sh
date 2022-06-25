#!/usr/bin/env import
import "querystring@1.3.0"

build() {
    date > build-time-1.txt
}

# https://servingtokens-com-bash-api-endpoint-examples-servingtokens.vercel.app/api/self-service-api?a=foo&b=bar&c=baz
handler() {
	http_response_json
	local path
	local query
	path="$(jq -r '.path' < "$1")"
	query="$(querystring "$path")"

    local STS_PROJECT_NAME="$1"
    local STS_NAMESPACE="$query"
    local STS_PUBLIC_API_KEY="$(jq -r '.path' < "$1")"
	local b=$(echo "$query" | sed -n 's/^.*b=\([^&]*\).*$/\1/p' | sed "s/%20/ /g")
    echo "$?" >&2
    local json_data="
        {
            {
                \"STS_NAMESPACE\": \"$STS_PUBLIC_API_KEY\",
                \"STS_API_TOKEN\": \"$b\",
                \"STS_PROJECT_NAME\": \"$STS_PROJECT_NAME\"
            },
        }
    " 
    echo "$?" >&2
    echo "$json_data"

    echo "Courtesy of Servingtokens.com"
    echo "code coming soon"
    echo "to use https://servingtokens-com-bash-api-endpoint-examples-servingtokens.vercel.app/api/self-service-api?a=foo&b=bar&c=baz"
}
