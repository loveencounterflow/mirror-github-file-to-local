#!/usr/bin/env bash
set -euo pipefail

# shellcheck disable=SC2034
function set_colors() {
  rainbow=🌈🌈🌈
  blink='\x1b[5m'
  bold='\x1b[1m'
  reverse='\x1b[7m'
  underline='\x1b[4m'
  reset='\x1b[0m'
  black='\x1b[38;05;16m'
  blue='\x1b[38;05;27m'
  green='\x1b[38;05;34m'
  cyan='\x1b[38;05;51m'
  sepia='\x1b[38;05;52m'
  indigo='\x1b[38;05;54m'
  steel='\x1b[38;05;67m'
  brown='\x1b[38;05;94m'
  olive='\x1b[38;05;100m'
  lime='\x1b[38;05;118m'
  red='\x1b[38;05;124m'
  crimson='\x1b[38;05;161m'
  plum='\x1b[38;05;176m'
  pink='\x1b[38;05;199m'
  orange='\x1b[38;05;208m'
  gold='\x1b[38;05;214m'
  tan='\x1b[38;05;215m'
  yellow='\x1b[38;05;226m'
  grey='\x1b[38;05;240m'
  darkgrey='\x1b[38;05;234m'
  white='\x1b[38;05;255m'
  warn="$red$reverse$bold"
  }
set_colors

#-----------------------------------------------------------------------------------------------------------
function check_is_repo() {
  git status > /dev/null ; if [[ $? -eq 129 ]]; then
    echo
    echo -e "❌$warn Not a git repo. $reset"
    echo
    exit 111
    fi
  }

#-----------------------------------------------------------------------------------------------------------
function check_no_changes() {
  if ! git diff --quiet || ! git diff --cached --quiet; then
    echo
    git status -sb
    echo
    echo -e "❌$warn Uncommitted changes detected. Please commit or stash them first. $reset"
    echo
    exit 111
    fi
  }

# #-----------------------------------------------------------------------------------------------------------
# function join_paths() {
#   local left="${1%/}"   # remove trailing slash from first
#   local right="${2#/}"  # remove leading slash from second
#   echo "$left/$right"
#   }

#-----------------------------------------------------------------------------------------------------------
function prepend_message() {
  local url="$1"
  local local_file_path="$2"
  local comment_marker="$3"
  #.........................................................................................................
  { echo
    echo "$comment_marker==========================================================================================================="
    echo "$comment_marker updated on $(date '+%Y-%m-%d %H:%M:%S %Z')"
    echo "$comment_marker from $url"
    echo "$comment_marker==========================================================================================================="
    echo
    cat "$local_file_path"
    } > temp && mv temp "$local_file_path"
  }
