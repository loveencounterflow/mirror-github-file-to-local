(async function() {
  'use strict';
  var $, GUY, Nn, PATH, alert, debug, demo_execa, demo_walk_js_paths_from_coffee_path, echo, execa, gold, help, info, inspect, lines_of, log, mirror_github_file_to_local_json, plain, praise, reverse, rpr, urge, warn, whisper, white;

  //===========================================================================================================
  GUY = require('guy');

  ({alert, debug, help, info, plain, praise, urge, warn, whisper} = GUY.trm.get_loggers('demo-execa'));

  ({rpr, inspect, echo, white, gold, reverse, log} = GUY.trm);

  PATH = require('node:path');

  ({execa, $} = require('execa'));

  // { f }                     = require 'effstring'
  // write                     = ( p ) -> process.stdout.write p

  // debug 'Ω___1', require 'execa'
  // debug 'Ω___2', execa
  // debug 'Ω___3', $
  // debug 'Ω___4', $.sync
  // # { $: zx, cd: zx_cd }      = require 'zx'

  //===========================================================================================================
  demo_execa = function() {
    var count, line, lines;
    // debug 'Ω___5', d for d from await execa"trash nosuchfile"
    count = 0;
    // for await line from ( execa { cwd: '/home/flow/jzr/bing-image-creator-downloader', } )"cat /usr/share/dict/ngerman"
    lines = ($.sync({
      cwd: '/home/flow/jzr/bing-image-creator-downloader'
    }))`ls -AlF`;
    lines = lines.stdout;
    lines = lines.split('\n');
// for line from ( $.sync { cwd: '/home/flow/jzr/bing-image-creator-downloader', } )"ls -AlF"
    for (line of lines) {
      count++;
      if (count > 10000) {
        break;
      }
      help('Ω___6', rpr(line));
    }
    return null;
  };

  //===========================================================================================================
  lines_of = function(execa_sync_result) {
    var lines;
    lines = execa_sync_result.stdout;
    return lines.split('\n');
  };

  //===========================================================================================================
  Nn = class Nn {
    //---------------------------------------------------------------------------------------------------------
    constructor(cfg) {
      this.cfg = this.compile_cfg(cfg);
      return void 0;
    }

    //---------------------------------------------------------------------------------------------------------
    * walk_additional_paths(path) {
      var basename, coffee_path_re, match, multiply_marker_re, prefix;
      //.......................................................................................................
      multiply_marker_re = /^(?<path>.+)\+\+\+$/;
      if ((match = path.match(multiply_marker_re)) == null) {
        yield path;
        return null;
      }
      ({path} = match.groups);
      yield path;
      //.......................................................................................................
      /* NOTE could have several clauses for other file types below */
      coffee_path_re = /^(?<prefix>.+)\/src\/(?<basename>[^\/]+)\.coffee$/;
      if ((match = path.match(coffee_path_re)) == null) {
        return null;
      }
      ({prefix, basename} = match.groups);
      yield `${prefix}/lib/${basename}.js`;
      yield `${prefix}/lib/${basename}.js.map`;
      //.......................................................................................................
      return null;
    }

    //---------------------------------------------------------------------------------------------------------
    paths_by_repo_from_paths(paths) {
      var R, derived_path, filename, i, key, len, match, original_path, repo, user, user_and_repo_re;
      user_and_repo_re = /^(?<user>[^\/]+)\/(?<repo>[^\/]+)\/(?<filename>.+)$/;
      R = {};
      for (i = 0, len = paths.length; i < len; i++) {
        original_path = paths[i];
        for (derived_path of this.walk_additional_paths(original_path)) {
          if ((match = derived_path.match(user_and_repo_re)) == null) {
            warn(`Ω__15 malformed path: ${rpr(derived_path)}`);
            continue;
          }
          ({user, repo, filename} = match.groups);
          key = `${user}/${repo}`;
          (R[key] != null ? R[key] : R[key] = []).push(filename);
        }
      }
      return R;
    }

    //---------------------------------------------------------------------------------------------------------
    prepare_git_mirror({local_mirror_path, github_url}) {
      var show;
      /* TAINT use proper cfg instead */
      // set -x
      show = function(ref, execa_sync_result) {
        var i, len, line, ref1;
        ref1 = lines_of(execa_sync_result);
        for (i = 0, len = ref1.length; i < len; i++) {
          line = ref1[i];
          if (line === '') {
            continue;
          }
          whisper('Ω__16', ref, line);
        }
        return null;
      };
      show('Ω__17', $.sync`mkdir -p ${local_mirror_path}`);
      show('Ω__18', ($.sync({
        cwd: local_mirror_path
      }))`git init`);
      show('Ω__19', ($.sync({
        cwd: local_mirror_path
      }))`git remote add origin ${github_url}`);
      show('Ω__20', ($.sync({
        cwd: local_mirror_path
      }))`git fetch --depth=1 origin`);
      show('Ω__21', ($.sync({
        cwd: local_mirror_path
      }))`git config core.sparseCheckout true`);
      /* TAINT get file list from walk_additional_paths: */
      show('Ω__22', ($.sync({
        cwd: local_mirror_path
      }))`echo ''                 >  .git/info/sparse-checkout`);
      show('Ω__23', ($.sync({
        cwd: local_mirror_path
      }))`echo 'src/main.coffee'  >> .git/info/sparse-checkout`);
      show('Ω__24', ($.sync({
        cwd: local_mirror_path
      }))`echo 'lib/main.js'      >> .git/info/sparse-checkout`);
      show('Ω__25', ($.sync({
        cwd: local_mirror_path
      }))`echo 'lib/main.js.map'  >> .git/info/sparse-checkout`);
      /* TAINT this should become an update/checkout command: */
      show('Ω__26', ($.sync({
        cwd: local_mirror_path
      }))`git checkout --quiet origin/main`);
      return null;
    }

    //---------------------------------------------------------------------------------------------------------
    compile_cfg(cfg) {
      var R, paths, paths_by_repo, ref1, ref2, ref3, ref4, repo, user_and_repo;
      if (cfg == null) {
        cfg = {};
      }
      R = {};
      R.target = cfg.target != null ? cfg.target : cfg.target = 'github-mirrors';
      R.files = (ref1 = cfg.files) != null ? ref1 : [];
      paths_by_repo = this.paths_by_repo_from_paths(R.files);
      R.symlinks = (ref2 = cfg.symlinks) != null ? ref2 : {};
      // R.checkouts   = {}
      // #.......................................................................................................
      // for user_and_repo of R.paths_by_repo
      //   R.checkouts[ user_and_repo ] = ( cfg.checkouts ? {} )[ user_and_repo ] ? 'origin/main'
      // #.......................................................................................................
      // R.github_urls = {}
      // for user_and_repo of R.paths_by_repo
      //   R.github_urls[ user_and_repo ] = "https://github.com/#{user_and_repo}"
      // #.......................................................................................................
      // R.local_mirror_paths = {}
      // for user_and_repo of R.paths_by_repo
      //   R.local_mirror_paths[ user_and_repo ] = PATH.join R.target, user_and_repo
      //.......................................................................................................
      R.repos = {};
      for (user_and_repo in paths_by_repo) {
        paths = paths_by_repo[user_and_repo];
        repo = {
          paths: paths,
          checkout: (ref3 = ((ref4 = cfg.checkouts) != null ? ref4 : {})[user_and_repo]) != null ? ref3 : 'origin/main',
          local: PATH.join(R.target, user_and_repo),
          url: `https://github.com/${user_and_repo}`
        };
        R.repos[user_and_repo] = repo;
      }
      //.......................................................................................................
      return R;
    }

    //---------------------------------------------------------------------------------------------------------
    show_config(cfg = null) {
      var i, j, key, keycolor, len, len1, object_prototype, ref1, rpr_list_key, rpr_other_key, rpr_value, sub_key, sub_value, v, value, valuecolor;
      object_prototype = Object.getPrototypeOf({});
      keycolor = gold;
      valuecolor = white;
      if (cfg == null) {
        cfg = this.cfg;
      }
      rpr_list_key = function(key) {
        return keycolor(key + ': []');
      };
      rpr_other_key = function(key) {
        return keycolor(key + ':');
      };
      rpr_value = function(value) {
        return valuecolor(rpr(value));
      };
      for (key in cfg) {
        value = cfg[key];
        switch (true) {
          case Array.isArray(value):
            echo(rpr_list_key(key));
            for (i = 0, len = value.length; i < len; i++) {
              sub_value = value[i];
              echo(' ', rpr_value(sub_value));
            }
            break;
          case (ref1 = Object.getPrototypeOf(value)) === null || ref1 === object_prototype:
            echo(rpr_other_key(key));
            for (sub_key in value) {
              sub_value = value[sub_key];
              if (Array.isArray(sub_value)) {
                echo(' ', rpr_list_key(sub_key));
                for (j = 0, len1 = sub_value.length; j < len1; j++) {
                  v = sub_value[j];
                  echo('   ', rpr_value(v));
                }
              } else {
                echo(' ', rpr_other_key(sub_key), rpr_value(sub_value));
              }
            }
            break;
          default:
            echo(rpr_other_key(key), rpr_value(value));
        }
      }
      return null;
    }

  };

  //===========================================================================================================
  demo_walk_js_paths_from_coffee_path = function() {
    var nn;
    nn = new Nn(mirror_github_file_to_local_json);
    info('Ω__27', '————————————————————————————————————————————————————');
    info();
    nn.show_config();
    info();
    return null;
  };

  //===========================================================================================================
  // cfg =
  //   git_mirrors_path:   './github-mirrors'
  //   user_and_repo:      'loveencounterflow/cleartype'
  //   github_url:         "https://github.com/$user_and_repo"
  //   local_mirror_path:  "$git_mirrors_path/$user_and_repo"

  //===========================================================================================================
  mirror_github_file_to_local_json = {
    /* path to folder where git repos are going to be mirrored */
    target: 'github-mirrors',
    /* Revision to checkout; keys are `$user/$repo` pairs, values are strings that can appear behind `git
     checkout`, such as
     * 'main'
     * 'HEAD'
     * '6f39a6032243cb81c2351091cd3b611edf94433a'
     * '6f39a603'
     * 'origin/main'
     The default is 'origin/main' for missing `$user/$repo` entries.
      */
    checkouts: {
      'loveencounterflow/cleartype': 'a5d688cf9b'
    },
    /* List of file paths; all paths must start with a `$user/$repo` pair; paths that end in `+++` will be
     expanded to several paths by `Nn::walk_additional_paths()`. */
    files: ['loveencounterflow/cleartype/src/main.coffee+++', 'loveencounterflow/cleartype/src/helpers.coffee+++', 'loveencounterflow/cleartype/src/builtins.coffee+++', 'loveencounterflow/mirror-github-file-to-local/bin/mirror-with-git'],
    /* Paths of symlinks to be prepared for files, keyed by their local origin paths, relative to `target`.
     Note that file paths may be implicitly added by `Nn::walk_additional_paths()`. */
    symlinks: {
      /* NOTE implicit consequence of entry 'loveencounterflow/cleartype/src/builtins.coffee+++': */
      'loveencounterflow/cleartype/lib/builtins.js': 'lib/cleartype-builtins.js'
    }
  };

  //===========================================================================================================
  if (module === require.main) {
    await (() => {
      // await demo_execa()
      return demo_walk_js_paths_from_coffee_path();
    })();
  }

  // f = ->
//   ### NOTE commit ID can be shortened ###
//   "https://raw.githubusercontent.com/loveencounterflow/mirror-github-file-to-local/7fccc7ec115302ab4d1e44e0a4c78b60d8215d94/index.js"
//   "https://raw.githubusercontent.com/#{user_and_repo}/7fccc7ec115302ab4d1e44e0a4c78b60d8215d94/#{relative_path}"

}).call(this);

//# sourceMappingURL=demo-mirror-with-git.js.map