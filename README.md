# monaco-prettier

[![github actions](https://github.com/remcohaszing/monaco-prettier/actions/workflows/ci.yaml/badge.svg)](https://github.com/remcohaszing/monaco-prettier/actions/workflows/ci.yaml)
[![npm version](https://img.shields.io/npm/v/monaco-prettier)](https://www.npmjs.com/package/monaco-prettier)
[![npm downloads](https://img.shields.io/npm/dm/monaco-prettier)](https://www.npmjs.com/package/monaco-prettier)

[Prettier](https://prettier.io) integratipn for
[Monaco editor](https://microsoft.github.io/monaco-editor/).

## Table of Contents

- [Installation](#installation)
- [Features](#features)
- [Usage](#usage)
- [API](#api)
  - [`monaco-prettier`](#monaco-prettier-1)
  - [`monaco-prettier/worker`](#monaco-prettierworker)
  - [Options](#options-1)
- [Compatibility](#compatibility)
- [License](#license)

## Installation

This package has a peer dependency on Prettier.

```sh
npm install monaco-prettier prettier
```

## Features

This package integrates the [Prettier](https://prettier.io) formatter into
[Monaco editor](https://microsoft.github.io/monaco-editor/). It uses a Monaco worker for efficiency.
The following Monaco editor features are supported:

- Document formatting edits
- Document range formatting edits

## Usage

First create a worker. Pass the desired Prettier plugins into the setup function.

```js
// prettier.worker.js
import { setup } from 'monaco-prettier/worker'
import * as babel from 'prettier/plugins/babel'
import * as estree from 'prettier/plugins/estree'

setup([
  // Supports parsing JavaScript into estree
  babel,
  // Supports formatting estree
  estree
])
```

Configure Monaco editor and Monaco Prettier in your application:

```js
import * as monaco from 'monaco-editor'
import { configureMonacoPrettier } from 'monaco-prettier'

// Configure the Monaco environment.
// The exact syntax to define a worker, depends on your bundler. The following works for Webpack.
globalThis.MonacoEnvironment = {
  getWorker(moduleId, label) {
    switch (label) {
      case 'editorWorkerService':
        return new Worker(new URL('monaco-editor/esm/vs/editor/editor.worker.js', import.meta.url))
      case 'css':
        return new Worker(
          new URL('monaco-editor/esm/vs/language/css/css.worker.js', import.meta.url)
        )
      case 'html':
        return new Worker(
          new URL('monaco-editor/esm/vs/language/html/html.worker.js', import.meta.url)
        )
      case 'json':
        return new Worker(
          new URL('monaco-editor/esm/vs/language/json/json.worker.js', import.meta.url)
        )
      case 'javascript':
      case 'typescript':
        return new Worker(
          new URL('monaco-editor/esm/vs/language/typescript/ts.worker.js', import.meta.url)
        )
      // Register your Prettier worker.
      case 'prettier':
        return new Worker(new URL('prettier.worker.js', import.meta.url))
      default:
        throw new Error(`Unknown label ${label}`)
    }
  }
}

// Disable the builtin formatting providers.
monaco.languages.css.cssDefaults.setModeConfiguration({
  documentFormattingEdits: false,
  documentRangeFormattingEdits: false
})

monaco.languages.json.jsonDefaults.setModeConfiguration({
  documentFormattingEdits: false,
  documentRangeFormattingEdits: false
})

monaco.languages.typescript.javascriptDefaults.setModeConfiguration({
  documentRangeFormattingEdits: false
})

monaco.languages.typescript.typescriptDefaults.setModeConfiguration({
  documentRangeFormattingEdits: false
})

// Configure Monaco Prettier
const printWidth = 80
configureMonacoPrettier(monaco, {
  // Map Monaco language IDs to a Prettier parser
  parsers: {
    javascript: 'babel',
    javascriptreact: 'babel'
  },

  // Optionally define Prettier options.
  prettier: {
    printWidth,
    proseWrap: 'always',
    semi: false,
    singleQuote: true,
    trailingComma: 'none'
  }
})

// Create a model
const model = monaco.editor.createModel(
  'console.log("Hello world!")',
  undefined,
  monaco.Uri.parse('file:///example.js')
)
// For the best experience, explicitly define formatting options on the model.
model.updateOptions({
  // Matches the inverse of Prettier option useTabs.
  insertSpaces: false,
  // Matches the Prettier option tabWidth.
  tabSize: 2
})

// Create an editor
const editor = monaco.editor.create(document.getElementById('editor'), {
  formatOnPaste: true,
  model,
  renderWhitespace: 'all',
  renderFinalNewline: 'on',
  renderControlCharacters: true,
  rulers: [printWidth]
})
```

## API

This package exports two modules.

### `monaco-prettier`

This module can be used in the main thread.

#### `configureMonacoPrettier(monaco, options)`

Configure Prettier as a formatter.

##### Arguments

- `monaco` (`MonacoEditor`) — The Monaco editor module to use.
- `options` (`configureMonacoPrettier.Options`) — Options to configure the Monaco Prettier
  integration.

##### Options

- `parsers` (`Record<string, string>`) — A mapping of Monaco language IDs to prettier parser names.
- `prettier` (`Object`, optional) — Prettier options.

##### Arguments

Configure a Monaco Prettier worker.

- `plugins` (`Plugin[]`) — The Prettier plugins to use.

### `monaco-prettier/worker`

This module can be used in the web worker.

#### `setup(plugins)`

##### Arguments

Configure a Monaco Prettier worker.

- `plugins` (`Plugin[]`) — The Prettier plugins to use.

### Options

## Compatibility

This project is compatible with
[baseline widely available](https://developer.mozilla.org/en-US/docs/Glossary/Baseline/Compatibility).

## License

[MIT](LICENSE.md) © [Remco Haszing](https://github.com/remcohaszing)
