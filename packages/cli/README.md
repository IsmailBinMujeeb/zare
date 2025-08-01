# @Zare/CLI

> **@ZareCLI** — The official command-line interface for the **Zare Template Engine**. Designed for the modern JavaScript ecosystem, Zare CLI helps you initialize projects, compile templates, serve with hot-reload, and configure your application with ease.

---

## Features

- **Initialize New Project**  
  Quickly initialize a new Zare project using predefined templates (currently supports the `base` template).

- **Build HTML from Zare Templates**  
  Compile your `.zare` files into static HTML.

- **Serve Project**  
  Start a local server to preview your compiled project.

- **Hot Reloading**  
  Real-time reloads using `chokidar` to monitor file changes during development.

- **Configurable via `zare.config.js`**  
  Customizable build and runtime options using [`cosmiconfig`](https://github.com/cosmiconfig/cosmiconfig) standard.

- 🗂 **File-Based Routing**  
  Build routes based on your folder and file structure, enabling navigation setup.

---

## Installation

```bash
npm install -g @zare/cli
```

## Usage
### Initialize a New Project
```bash
zare init [path]
```
Initializes a new Zare project using the base template.

Supports extensible templates in future releases.

### Build HTML Files
```bash
zare build [path]
```
Parses .zare files and outputs compiled .html files.

### Serve Project
```bash
zare serve [path]
```

Starts an Express server to serve compiled files.

Automatically enables hot reloading using chokidar.

## Configuration

Customize your setup using zare.config.js:

```js
// zare.config.js
module.exports = {
    "port": 8185,
    "static": "./static",
    "pages": "./pages",
    "outdir": "./dist"
}
```

## File-Based Routing

Automatically builds routes based on your folder structure:

```bash
pages/
├── index.zare   →  /
├── about.zare   →  /about
├── blog/
├    └── post.zare → /blog/post
└── user/
    └── [id].zare → /user/:id
```

## Contributing
Feel free to fork and contribute! PRs are welcome.

## License
MIT [License](LICENSE) © 2025
