---
"@zare/cli": major
---

### 🎉 Initial Stable Release

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
