

#!/bin/bash
# -----------------------------------------------------------------------------
#  Copyright (c) TM Forum. All rights reserved.
#
#  Licensed under the Apache License, Version 2.0 (the "License");
#  you may not use this file except in compliance with the License.
#  You may obtain a copy of the License at
#
#      http://www.apache.org/licenses/LICENSE-2.0
#
#  Unless required by applicable law or agreed to in writing, software
#  distributed under the License is distributed on an "AS IS" BASIS,
#  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
#  See the License for the specific language governing permissions and
#  limitations under the License.
# -----------------------------------------------------------------------------

cd "$(dirname "$0")"

# clean up
rm -rf ./reports
mkdir -p ./reports

 
[ $# -gt 0 ] && export TEST_BASE_URL=$1

docker network inspect tmf >/dev/null 2>&1 || docker network create tmf

export DOCKER_UID=$(id -u) DOCKER_GID=$(id -g)

ctk_container=$(docker compose run -d ctk)

docker logs -f "$ctk_container"

# extract the report
reportPath="./reports/htmlResults.html"

# Check if the report exists
if [ ! -f "$reportPath" ]; then
    echo "Report file $reportPath does not exist. Exiting."
    exit 1    
fi

if [[ "$OSTYPE" == "linux-gnu"* ]]; then
    xdg-open $reportPath
elif [[ "$OSTYPE" == "darwin"* ]]; then
    open $reportPath
else
    echo "Unsupported OS. Please open ${reportPath} manually."
fi

cleanup() {
    docker rm -f "$ctk_container"
}
trap cleanup EXIT