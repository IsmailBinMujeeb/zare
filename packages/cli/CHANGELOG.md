# @zare/cli

## 1.1.1

### Patch Changes

- 097b6b5: fix base templates static files import paths to work after build

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
