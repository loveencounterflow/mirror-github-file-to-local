


'use strict'

#===========================================================================================================
GUY                       = require 'guy'
{ alert
  debug
  help
  info
  plain
  praise
  urge
  warn
  whisper }               = GUY.trm.get_loggers 'demo-execa'
{ rpr
  inspect
  echo
  white
  gold
  reverse
  log     }               = GUY.trm

{ execa
  $ }                     = require 'execa'
# debug 'Ω___1', require 'execa'
# debug 'Ω___2', execa
# debug 'Ω___3', $
# debug 'Ω___4', $.sync
# # { $: zx, cd: zx_cd }      = require 'zx'

#===========================================================================================================
demo_execa = ->
  # debug 'Ω___5', d for d from await execa"trash nosuchfile"
  count = 0
  # for await line from ( execa { cwd: '/home/flow/jzr/bing-image-creator-downloader', } )"cat /usr/share/dict/ngerman"
  lines = ( $.sync { cwd: '/home/flow/jzr/bing-image-creator-downloader', } )"ls -AlF"
  lines = lines.stdout
  lines = lines.split '\n'
  # for line from ( $.sync { cwd: '/home/flow/jzr/bing-image-creator-downloader', } )"ls -AlF"
  for line from lines
    count++; break if count > 10000
    help 'Ω___6', rpr line
  return null

#===========================================================================================================
lines_of = ( execa_sync_result ) ->
  lines = execa_sync_result.stdout
  return lines.split '\n'

#===========================================================================================================
class Nn

  #---------------------------------------------------------------------------------------------------------
  constructor: ( cfg ) ->
    @cfg = @compile_cfg cfg
    return undefined

  #---------------------------------------------------------------------------------------------------------
  walk_additional_paths: ( path ) ->
    #.......................................................................................................
    multiply_marker_re = ///^ (?<path> .+ ) \+\+\+ $///
    unless ( match = path.match multiply_marker_re )?
      yield path
      return null
    { path } = match.groups
    yield path
    #.......................................................................................................
    ### NOTE could have several clauses for other file types below ###
    coffee_path_re = ///^ (?<prefix>.+) /src/ (?<basename> [^ \/ ]+ )\.coffee $///
    unless ( match = path.match coffee_path_re )?
      return null
    { prefix
      basename } = match.groups
    yield "#{prefix}/lib/#{basename}.js"
    yield "#{prefix}/lib/#{basename}.js.map"
    #.......................................................................................................
    return null

  #---------------------------------------------------------------------------------------------------------
  paths_by_repo_from_paths: ( paths ) ->
    user_and_repo_re = ///^ (?<user> [^ \/ ]+ ) / (?<repo> [^ \/ ]+ ) / (?<filename> .+ ) $///
    paths_by_repo = {}
    for original_path in paths
      for derived_path from @walk_additional_paths original_path
        unless ( match = derived_path.match user_and_repo_re )?
          warn "Ω___7 malformed path: #{rpr derived_path}"
          continue
        { user
          repo
          filename } = match.groups
        key = "#{user}/#{repo}"
        ( paths_by_repo[ key ] ?= [] ).push filename
    return { paths_by_repo, }

  #---------------------------------------------------------------------------------------------------------
  prepare_git_mirror: ({ local_mirror_path, github_url, }) ->
    ### TAINT use proper cfg instead ###
    # set -x
    show = ( ref, execa_sync_result ) ->
      for line in lines_of execa_sync_result
        continue if line is ''
        whisper 'Ω___8', ref, line
      return null
    show 'Ω___9', ( $.sync                            )"mkdir -p #{local_mirror_path}"
    show 'Ω__10', ( $.sync { cwd: local_mirror_path } )"git init"
    show 'Ω__11', ( $.sync { cwd: local_mirror_path } )"git remote add origin #{github_url}"
    show 'Ω__12', ( $.sync { cwd: local_mirror_path } )"git fetch --depth=1 origin"
    show 'Ω__13', ( $.sync { cwd: local_mirror_path } )"git config core.sparseCheckout true"
    ### TAINT get file list from walk_additional_paths: ###
    show 'Ω__14', ( $.sync { cwd: local_mirror_path } )"echo ''                 >  .git/info/sparse-checkout"
    show 'Ω__15', ( $.sync { cwd: local_mirror_path } )"echo 'src/main.coffee'  >> .git/info/sparse-checkout"
    show 'Ω__16', ( $.sync { cwd: local_mirror_path } )"echo 'lib/main.js'      >> .git/info/sparse-checkout"
    show 'Ω__17', ( $.sync { cwd: local_mirror_path } )"echo 'lib/main.js.map'  >> .git/info/sparse-checkout"
    ### TAINT this should become an update/checkout command: ###
    show 'Ω__18', ( $.sync { cwd: local_mirror_path } )"git checkout --quiet origin/main"
    return null

  #---------------------------------------------------------------------------------------------------------
  compile_cfg: ( cfg ) ->
    cfg        ?= {}
    R           = {}
    R.target    = cfg.target ?= 'github-mirrors'
    R.files     = cfg.files ? []
    Object.assign R, @paths_by_repo_from_paths R.files
    R.checkouts = {}
    for user_and_repo of R.paths_by_repo
      R.checkouts[ user_and_repo ] = ( cfg.checkouts ? {} )[ user_and_repo ] ? 'origin/main'
    R.symlinks  = cfg.symlinks ? {}
    return R

  #---------------------------------------------------------------------------------------------------------
  show_config: ( cfg = null ) ->
    object_prototype  = Object.getPrototypeOf {}
    keycolor          = gold
    valuecolor        = white
    cfg              ?= @cfg
    for key, value of cfg
      switch true
        when Array.isArray value
          echo keycolor key + ':' + ' []'
          for sub_value in value
            echo ' ', valuecolor rpr sub_value
        when ( Object.getPrototypeOf value ) in [ null, object_prototype, ]
          echo keycolor key + ':' # + ' {}'
          for sub_key, sub_value of value
            if Array.isArray sub_value
              echo ' ', ( keycolor sub_key + ':' + ' []' )
              echo '   ', ( valuecolor rpr v ) for v in sub_value
            else
              echo ' ', "#{keycolor sub_key + ':'} #{valuecolor sub_value}"
        else
          echo ( keycolor key + ':' ), ( valuecolor rpr value )
    return null

#===========================================================================================================
demo_walk_js_paths_from_coffee_path = ->
  nn = new Nn mirror_github_file_to_local_json
  info 'Ω__31', '————————————————————————————————————————————————————'
  info()
  nn.show_config()
  info()
  return null

#===========================================================================================================
# cfg =
#   git_mirrors_path:   './github-mirrors'
#   user_and_repo:      'loveencounterflow/cleartype'
#   github_url:         "https://github.com/$user_and_repo"
#   local_mirror_path:  "$git_mirrors_path/$user_and_repo"

#===========================================================================================================
mirror_github_file_to_local_json =
  ### path to folder where git repos are going to be mirrored ###
  target: 'github-mirrors'

  ### Revision to checkout; keys are `$user/$repo` pairs, values are strings that can appear behind `git
  checkout`, such as
  * 'main'
  * 'HEAD'
  * '6f39a6032243cb81c2351091cd3b611edf94433a'
  * '6f39a603'
  * 'origin/main'
  The default is 'origin/main' for missing `$user/$repo` entries.
  ###
  checkouts:
    'loveencounterflow/cleartype': 'a5d688cf9b'

  ### List of file paths; all paths must start with a `$user/$repo` pair; paths that end in `+++` will be
  expanded to several paths by `Nn::walk_additional_paths()`. ###
  files: [
    'loveencounterflow/cleartype/src/main.coffee+++'
    'loveencounterflow/cleartype/src/helpers.coffee+++'
    'loveencounterflow/cleartype/src/builtins.coffee+++'
    'loveencounterflow/mirror-github-file-to-local/bin/mirror-with-git'
    ]

  ### Paths of symlinks to be prepared for files, keyed by their local origin paths, relative to `target`.
  Note that file paths may be implicitly added by `Nn::walk_additional_paths()`. ###
  symlinks:
    ### NOTE implicit consequence of entry 'loveencounterflow/cleartype/src/builtins.coffee+++': ###
    'loveencounterflow/cleartype/lib/builtins.js': 'lib/cleartype-builtins.js'


#===========================================================================================================
if module is require.main then await do =>
  # await demo_execa()
  demo_walk_js_paths_from_coffee_path()
  return null

# f = ->
#   ### NOTE commit ID can be shortened ###
#   "https://raw.githubusercontent.com/loveencounterflow/mirror-github-file-to-local/7fccc7ec115302ab4d1e44e0a4c78b60d8215d94/index.js"
#   "https://raw.githubusercontent.com/#{user_and_repo}/7fccc7ec115302ab4d1e44e0a4c78b60d8215d94/#{relative_path}"



