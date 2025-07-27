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
* need an extensible End Of Insert (EOI) marker:
  * use default: you write
    ```
    # <<insert lantingxu.txt>>
    ```
    which will be rewritten to
    ```
    # <<insert lantingxu.txt>>
    永和九年，岁在癸丑，暮春之初，会于会稽山阴之兰亭，修禊事也。
    # <</insert>>
    ```
  * define custom using `>>$EOI`: you write
    ```
    # <<insert lantingxu.txt>>custom EOI marker text
    ```
    which will be expanded to
    ```
    # <<insert lantingxu.txt>>custom EOI marker text
    永和九年，岁在癸丑，暮春之初，会于会稽山阴之兰亭，修禊事也。
    # custom EOI marker text<</insert>>
    ```
  * define custom using parenthesized `>>$EOI`: you write
    ```
    # <<insert lantingxu.txt>>((custom EOI marker text
    ```
    which will be rewritten to
    ```
    # <<insert lantingxu.txt>>((custom EOI marker text
    永和九年，岁在癸丑，暮春之初，会于会稽山阴之兰亭，修禊事也。
    # custom EOI marker text))<</insert>>
    ```
  * the number of parentheses you give is a minimum—at least as many right parentheses will be
    auto-inserted at the closing insertion tag, and where necessary, the number of left parens on the
    opening insertion tag will be amended
  * `mirror-github-file-to-local` will check for the maximum number of consecutive right parens *m* in the
    inserted text; say you have
    ```
    # <<insert brackets.txt>>(((
    ```
    and `brackets.txt` contains the text `abc ))))) xyz` with 5 closing parens, then the result of the
    interpolation will be that text and a closing tag with *n*&nbsp;=&nbsp;*m*&nbsp;+&nbsp;1&nbsp;=&nbsp;6
    right parens:
    ```
    # <<insert brackets.txt>>((((((
    abc ))))) xyz
    # ))))))<</insert>>
    ```
  * invariants:
    * insert regions always start with `${prefix}<<insert\b`
    * headline of insert regions always ends with
      * either `>>` (for the default, will be expanded to `>>(${default_eoimarkertxt}`)
      * or with `>>` followed by any number *n* of left parens, followed by an optional marker text
        `${eoimarkertxt}`; EOI marker text may not include parentheses, newlines or control characters
    * insert regions always end with `${prefix}`, followed by `${eoimarkertxt}` (if any), followed by *n*
      right parens, followed by the constant `<</insert>>` (and discardable trailing whitespace), to the
      end of the line
    * `<<insert>>` commands can, in the first incarnation, not contain other `<<insert>>` commands
    * `<<insert>>` commands, `$eoimarkertxt`s and *functional* parentheses (in distinction to any
      parentheses that the inserted target may contain) are always balanced
  * **`[—]`** problem with the above: does not account for cases where host language has only surrounding
    comment syntax as is the case in HTML and MarkDown; this:
    ```
    <!-- <<insert brackets.txt>>( -->
    ```
    doesn't work in MarkDown. Maybe this is better:
    ```
    <!-- <<insert below brackets.txt (CUSTOM EOI MARKER)>> -->
      ...
    <!-- <</insert below brackets.txt (CUSTOM EOI MARKER)>> -->
    ```
    * text of closing insertion marker is exactly text of opening marker, sole difference being the slash
      inserted into `<<insert`
    * inserted text will be checked for the entire text of the opening insertion marker; by default, that
      would look like `<!-- <<insert below brackets.txt>> -->`
    * an additional text without parens can be included inside of round parens or will be automatically
      generated; so in the unlikely case that an included file should contain the text `<!-- <<insert below
      brackets.txt>> -->`, then the opening text will be amended to something like `<!-- <<insert below
      brackets.txt (random 23sd34e0)>> -->`, and the closing tag will become `<!-- <</insert below
      brackets.txt (random 23sd34e0)>> -->`, matching each character except for the extra slash

* **`[—]`** make usable for other purposes:
  * **`[—]`** modular MarkDown documents
  * **`[—]`** bash scripts with inlined dependencies; consider to use something like `# <<insert above
    path/to/source>>`





