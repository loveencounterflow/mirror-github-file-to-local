<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->
**Table of Contents**  *generated with [DocToc](https://github.com/thlorenz/doctoc)*

- [Mirror GitHub File to Local](#mirror-github-file-to-local)
  - [Use Together With](#use-together-with)
  - [Also See](#also-see)
  - [To Do](#to-do)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->



# Mirror GitHub File to Local

mirror files on GitHub (or other remote locations) to local files; intended for 'lightweight' NodeJS
modules (packages)

## Use Together With

* [@vercel/ncc](https://github.com/vercel/ncc) is a *"[s]imple CLI for compiling a Node.js module into a
  single file, together with all its dependencies, gcc-style"*. At the inevitable cost of potentially
  duplicating some dependencies, Vercel&nbsp;NCC should be a great tool to transform a medium-complexity
  project with not too many, not too big dependencies into a single-file dependency that should be easy to
  handle with `mirror-github-file-to-local`

* [sverweij/dependency-cruiser](https://github.com/sverweij/dependency-cruiser) analyses source files for
  `require` and `import` statements; allows individual rulesets to warn when e.g. when modules from the
  NodeJS standard library are used (so the module might not be usable in the browser).

  **Note**: in the documentation, always replace `depcruise` with `dependency-cruiser`; the former is
  apparently a holdover from an earlier version of the software.

## Also See

* https://github.com/npm/npm/issues/1772


## To Do

* **`[—]`** allow patching downloaded files (eg. to manipulate hard-coded `require` paths)
* **`[—]`** allow running build commands to make desired files available (??? for the time being, maybe
  recommend to store locally)
* **`[—]`** amend `gaps-and-islands` with the 'skeleton' / POC implementations `mirror-with-git`,
  `mirror-with-wget`
* **`[—]`** do we want or don't we want 'detached head state' in downloaded Git repos?
* **`[—]`** use an aliasing setting to enable checking out different versions of the same repo
* **`[—]`** implement setting to copy / hardlink files into a given location instead of using symlinks
* **`[—]`** two modes of operation:
  * **`[—]`** replace-to-target: `<<insert>>` commands themselves will be replaced by text of target and
    will leave no trace
  * **`[—]`** insert-in-place: `<<insert>>` commands insert lines of target texts into the source file
    (normally below their respective `<<insert>>` command), followed by an EOI marker (see below) to
    delineate the target region
    * note that in-situ operation requires a host syntax with comments
  * it's possible in replace-to-target mode to overwrite the source file but that is a one-shot operation as
    the replacements would obliterate the `<<insert>>` commands so is not repeatable
* **`[—]`** proposed syntax:
  * surrounded by doube pointy brackets `<<insert ${arguments} ${path}>>`
  * `insert` (in contrast to `import`, `include`, `require`) indicating that source text to be interpolated
    in place
  * `${arguments}`:
    * `below` for 'below this line' (default);
    * `above` for 'above this line' (only allowed once in a file so it's possible to `insert` even a shebang
      line);
    * <del>`left` for 'to the left of this `<<insert>>`'</del> <ins>maybe later</ins>
  * need ability to declare comment syntax, e.g. simply by re-using an `<<insert>>` command's 'prefix'
    (everything before `<<` to the start of line)
* extensible End Of Insert (EOI) marker:
  * use default: you write
    ```
    # <<<insert 'lantingxu.txt'>>>
    ```
    which will be rewritten to
    ```
    # <<<insert 'lantingxu.txt'>>>
    永和九年，岁在癸丑，暮春之初，会于会稽山阴之兰亭，修禊事也。
    # <<</insert 'lantingxu.txt'>>>
    ```
    (rule: closing insertion tag looks like the opening tag but with a slash inserted between left pointy
    brackets and `insert` command)
  * define custom EOI marker using parenthesized text between the two right pointy brackets: you write
    ```
    # <<<insert 'lantingxu.txt'>custom EOI marker text>>
    ```
    which will be expanded to
    ```
    # <<<insert 'lantingxu.txt'>custom EOI marker text>>
    永和九年，岁在癸丑，暮春之初，会于会稽山阴之兰亭，修禊事也。
    # <<</insert 'lantingxu.txt'>custom EOI marker text>>
    ```
  * invariants:
    * insert regions always start with `${prefix}<<<insert\s...>${suffix}`
    * headline of insert regions always ends with
      * either `>>>`
      * or with `>>>` followed by any number *n* of left parens, followed by an optional marker text
        `${eoimarkertxt}`; EOI marker text may not include parentheses, newlines or control characters
    * insert regions always end with the same text as they start with, except for `<<<insert` becoming
      `<<</insert`
  * `<<<insert>>>` commands can, in the first incarnation, not contain other `<<<insert>>>` commands
  * in the unlikely case that an included file should contain the text of an insertion tag, say `<!--
    <<<insert below 'brackets.txt'>>> -->`, then the opening text will be amended to something like `<!--
    <<<insert below 'brackets.txt'>>23sd34e0> -->`, and the closing tag will become `<!-- <<</insert below
    'brackets.txt'>>23sd34e0> -->`, matching each character except for the extra slash
  * can only have up to two paren pairs in opening tag, first one controlled by user, the other used for
    random text
  * ```
    /// ^
      (?<prefix> .*? )
      <
      (?<slash> \/? )
      <
      <
      (?<command> insert )
      \x20+
      ( (?<place> below | above ) \x20+ )?
      (?<path> (?: \\> | [^ > ]  )+ )
      >
      (?<user_eoi> [^ > ]* )
      >
      (?<system_eoi> [^ > ]* )
      >
      (?<suffix> .*? )
      $ ///
    ```
  * to be integrated:
    * shouldn't path be a named 'attribute' to approach a more HTML/XML-ish syntax?
    * should demand to always use quotes for path, otherwise interpret path specifier as a configured named
      value; arbitrary unquoted strings always cause problems (see YAML, Bash)




