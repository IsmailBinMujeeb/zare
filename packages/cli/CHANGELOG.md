# @zare/cli

## 1.3.1

### Patch Changes

- ee851cd: add #deps in base template
- Updated dependencies [65b9c63]
- Updated dependencies [a750d15]
  - zare@3.1.1

## 1.3.0

### Minor Changes

- a4cfe37: create add command for adding components from registry

### Patch Changes

- ea52300: fix static files conflict
- Updated dependencies [43343ae]
- Updated dependencies [05cada1]
- Updated dependencies [f1d8ea2]
  - zare@3.1.0

## 1.2.0

### Minor Changes

- ecaccae: the zare config can be specified in the Express settings

### Patch Changes

- 097b6b5: fix base templates static files import paths to work after build
- e98c786: assign default values to missing config fields
- dfe71e3: load multi-level template files for serve command
- Updated dependencies [b80f555]
- Updated dependencies [cbd3c9d]
- Updated dependencies [f2d662b]
- Updated dependencies [3f2e30c]
- Updated dependencies [c27ee19]
- Updated dependencies [511513f]
- Updated dependencies [0a3e4e5]
- Updated dependencies [ecaccae]
- Updated dependencies [3e5d15f]
  - zare@3.0.0

## 1.1.0

### Minor Changes

- a084cac: deprecate includes

  output static files to the root directory

- bca8aa8: let path parameter optional
- 37301ef: support static generation for dynamic routes

### Patch Changes

- 83153fb: correctly get the directory path in ES modules
- 2237838: replaces myapp with . in serve and build command of cli base template
- Updated dependencies [83153fb]
  - zare@2.6.1

## 1.0.2

### Patch Changes

- 808230e: changed project path in serve and build command project package.json in init command
- Updated dependencies [77cdef0]
- Updated dependencies [d6d0c8c]
- Updated dependencies [c9b737f]
  - zare@2.6.0

## 1.0.1

### Patch Changes

- 4695622: package organization changed

## 1.0.1

### Patch Changes

- 9e3b376: fixed the initiale release for @zare/cli

## 1.0.0

### Major Changes

- 2dad150: ### 🎉 Initial Stable Release

  This is the first official stable release of **@zare/cli**, a CLI interface for the Zare Template Engine, designed for the JavaScript/TypeScript ecosystem.

  #### ✅ Features

  - **Project Initialization**

  - `zare init [path]` command to initialize a new Zare project.

  - Supports `base` template (more templates to be added in future).

  - **Build System**

  - `zare build [path]` compiles `.zare` templates to `.html`.

  - Supports configurable source/output directories.

  - **Development Server**

  - `zare serve [path]` starts an Express server to serve the project.

  - Automatic **hot reloading** powered by `chokidar`.

  - **Configuration**

  - Supports `zare.config.js` used `cosmiconfig`.

  - Easily define build and server behavior via config.

  - **File-Based Routing**

  - Generates routes based on the file structure inside `src`.

### Patch Changes

- Updated dependencies [be0f71c]
  - zare@2.5.2
