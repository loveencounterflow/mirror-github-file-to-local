(async function() {
  'use strict';
  var $, GUY, Nn, alert, cfg, debug, demo_execa, demo_walk_js_paths_from_coffee_path, echo, execa, gold, help, info, inspect, lines_of, log, mirror_github_file_to_local_json, plain, praise, reverse, rpr, urge, warn, whisper, white;

  //===========================================================================================================
  GUY = require('guy');

  ({alert, debug, help, info, plain, praise, urge, warn, whisper} = GUY.trm.get_loggers('demo-execa'));

  ({rpr, inspect, echo, white, gold, reverse, log} = GUY.trm);

  ({execa, $} = require('execa'));

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
    constructor(paths) {
      this.cfg = this.paths_by_repo_from_paths(paths);
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
      var derived_path, filename, i, key, len, match, original_path, paths_by_repo, repo, user, user_and_repo_re;
      user_and_repo_re = /^(?<user>[^\/]+)\/(?<repo>[^\/]+)\/(?<filename>.+)$/;
      paths_by_repo = {};
      for (i = 0, len = paths.length; i < len; i++) {
        original_path = paths[i];
        for (derived_path of this.walk_additional_paths(original_path)) {
          if ((match = derived_path.match(user_and_repo_re)) == null) {
            warn(`Ω___7 malformed path: ${rpr(derived_path)}`);
            continue;
          }
          ({user, repo, filename} = match.groups);
          key = `${user}/${repo}`;
          (paths_by_repo[key] != null ? paths_by_repo[key] : paths_by_repo[key] = []).push(filename);
        }
      }
      return {paths_by_repo};
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
          whisper('Ω___8', ref, line);
        }
        return null;
      };
      show('Ω___9', $.sync`mkdir -p ${local_mirror_path}`);
      show('Ω__10', ($.sync({
        cwd: local_mirror_path
      }))`git init`);
      show('Ω__11', ($.sync({
        cwd: local_mirror_path
      }))`git remote add origin ${github_url}`);
      show('Ω__12', ($.sync({
        cwd: local_mirror_path
      }))`git fetch --depth=1 origin`);
      show('Ω__13', ($.sync({
        cwd: local_mirror_path
      }))`git config core.sparseCheckout true`);
      /* TAINT get file list from walk_additional_paths: */
      show('Ω__14', ($.sync({
        cwd: local_mirror_path
      }))`echo ''                 >  .git/info/sparse-checkout`);
      show('Ω__15', ($.sync({
        cwd: local_mirror_path
      }))`echo 'src/main.coffee'  >> .git/info/sparse-checkout`);
      show('Ω__16', ($.sync({
        cwd: local_mirror_path
      }))`echo 'lib/main.js'      >> .git/info/sparse-checkout`);
      show('Ω__17', ($.sync({
        cwd: local_mirror_path
      }))`echo 'lib/main.js.map'  >> .git/info/sparse-checkout`);
      /* TAINT this should become an update/checkout command: */
      show('Ω__18', ($.sync({
        cwd: local_mirror_path
      }))`git checkout --quiet origin/main`);
      return null;
    }

    //---------------------------------------------------------------------------------------------------------
    compile_cfg(cfg) {
      var R, ref1, ref2, ref3, ref4, user_and_repo;
      if (cfg == null) {
        cfg = {};
      }
      R = {};
      R.target = cfg.target != null ? cfg.target : cfg.target = 'github-mirrors';
      Object.assign(R, this.paths_by_repo_from_paths((ref1 = cfg.files) != null ? ref1 : []));
      R.checkouts = {};
      for (user_and_repo in R.paths_by_repo) {
        R.checkouts[user_and_repo] = (ref2 = ((ref3 = cfg.checkouts) != null ? ref3 : {})[user_and_repo]) != null ? ref2 : 'origin/main';
      }
      R.symlinks = (ref4 = cfg.symlinks) != null ? ref4 : {};
      return R;
    }

    //---------------------------------------------------------------------------------------------------------
    show_config(cfg = null) {
      var i, j, key, keycolor, len, len1, object_prototype, ref1, sub_key, sub_value, v, value, valuecolor;
      object_prototype = Object.getPrototypeOf({});
      keycolor = gold;
      valuecolor = white;
      if (cfg == null) {
        cfg = this.cfg;
      }
      for (key in cfg) {
        value = cfg[key];
        switch (true) {
          case Array.isArray(value):
            echo(keycolor(key + ':'));
            for (i = 0, len = value.length; i < len; i++) {
              sub_value = value[i];
              echo(' ', valuecolor(sub_value));
            }
            break;
          case (ref1 = Object.getPrototypeOf(value)) === null || ref1 === object_prototype:
            echo(keycolor(key + ':'));
            for (sub_key in value) {
              sub_value = value[sub_key];
              if (Array.isArray(sub_value)) {
                echo(' ', keycolor(sub_key + ':'));
                for (j = 0, len1 = sub_value.length; j < len1; j++) {
                  v = sub_value[j];
                  echo('   ', valuecolor(v));
                }
              } else {
                echo(' ', `${keycolor(sub_key + ':')} ${valuecolor(sub_value)}`);
              }
            }
            break;
          default:
            echo(keycolor(key + ':'), valuecolor(rpr(value)));
        }
      }
      return null;
    }

  };

  //===========================================================================================================
  demo_walk_js_paths_from_coffee_path = function() {
    var cfg, i, j, len, len1, nn, original_path, path, paths, ref1, repo;
    paths = ['loveencounterflow/cleartype/artwork/logo.png', 'loveencounterflow/cleartype/src/foo.coffee', 'loveencounterflow/cleartype/src/main.coffee+++', 'loveencounterflow/cleartype/src/helpers.coffee+++', 'loveencounterflow/mirror-github-file-to-local/bin/mirror-with-git'];
    nn = new Nn(paths);
//.........................................................................................................
    for (i = 0, len = paths.length; i < len; i++) {
      original_path = paths[i];
// whisper 'Ω__19', original_path
      for (path of nn.walk_additional_paths(original_path)) {
        info('Ω__20', path);
      }
    }
    ref1 = nn.cfg.paths_by_repo;
    //.........................................................................................................
    // cfg = nn.paths_by_repo_from_paths paths
    for (repo in ref1) {
      paths = ref1[repo];
      urge('Ω__21', repo);
      for (j = 0, len1 = paths.length; j < len1; j++) {
        path = paths[j];
        help('Ω__22', ' ', path);
      }
    }
    //.........................................................................................................
    // help()
    // help 'Ω__23', ( rpr line ) for line in ( $.sync { lines: true, } )"ls -AlF"
    // help()
    // help 'Ω__24', line for line in lines_of $.sync"ls -AlF"
    // help()
    // help 'Ω__25', line for line in lines_of $.sync"realpath ."
    // help 'Ω__26', line for line in lines_of $.sync"pwd"
    // # help()
    // # help 'Ω__27', line for line in lines_of $.sync"cd src"
    // help()
    // help 'Ω__28', line for line in lines_of ( $.sync { cwd: 'src', } )"pwd"
    // help()
    // help 'Ω__29', line for line in lines_of ( $.sync {} )"pwd"
    // help 'Ω__30', nn.prepare_git_mirror
    //   local_mirror_path:  'github-mirrors/loveencounterflow/cleartype'
    //   github_url:         'https://github.com/loveencounterflow/cleartype'
    //.........................................................................................................
    cfg = nn.compile_cfg(mirror_github_file_to_local_json);
    info('Ω__31', '————————————————————————————————————————————————————');
    nn.show_config(cfg);
    debug('Ω__32', cfg.paths_by_repo);
    return null;
  };

  //===========================================================================================================
  cfg = {
    git_mirrors_path: './github-mirrors',
    user_and_repo: 'loveencounterflow/cleartype',
    github_url: "https://github.com/$user_and_repo",
    local_mirror_path: "$git_mirrors_path/$user_and_repo"
  };

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
      demo_walk_js_paths_from_coffee_path();
      return null;
    })();
  }

  // f = ->
//   ### NOTE commit ID can be shortened ###
//   "https://raw.githubusercontent.com/loveencounterflow/mirror-github-file-to-local/7fccc7ec115302ab4d1e44e0a4c78b60d8215d94/index.js"
//   "https://raw.githubusercontent.com/#{user_and_repo}/7fccc7ec115302ab4d1e44e0a4c78b60d8215d94/#{relative_path}"

}).call(this);

//# sourceMappingURL=demo-mirror-with-git.js.map