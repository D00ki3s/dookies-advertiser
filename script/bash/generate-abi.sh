#!/bin/sh

# This script generates the ABI files for the contracts in the project.
# It is intended to be run from the project root directory
# the generated ABI will be used to call the contracts from the frontend
mkdir -p ./abi
touch ./abi/DookiesAdvertiser.json
touch ./abi/Dookies.json

echo "{\n  \"abi\": $(forge inspect DookiesAdvertiser abi)\n}" >| ./abi/DookiesAdvertiser.json
echo "{\n  \"abi\": $(forge inspect Dookies abi)\n}" >| ./abi/Dookies.json
