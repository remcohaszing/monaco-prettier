import * as monaco from 'monaco-editor'

import { configureMonacoPrettier } from '../src/monaco-prettier.js'

configureMonacoPrettier(monaco, {
  parsers: {
    javascript: 'babel',
    javascriptreact: 'babel',
    typescript: 'babel-ts',
    typescriptreact: 'babel-ts',
    css: 'css',
    json: 'jsonc',
    jsonc: 'jsonc',
    markdown: 'markdown',
    yaml: 'yaml'
  },
  prettier: {
    proseWrap: 'always',
    semi: false,
    singleQuote: true,
    trailingComma: 'none'
  }
})

// eslint-disable-next-line unicorn/prefer-global-this
window.MonacoEnvironment = {
  getWorker(moduleId, label) {
    switch (label) {
      case 'editorWorkerService':
        return new Worker(
          new URL('monaco-editor/esm/vs/editor/editor.worker.js', import.meta.url),
          { type: 'module' }
        )
      case 'css':
        return new Worker(
          new URL('monaco-editor/esm/vs/language/css/css.worker.js', import.meta.url),
          { type: 'module' }
        )
      case 'html':
        return new Worker(
          new URL('monaco-editor/esm/vs/language/html/html.worker.js', import.meta.url),
          { type: 'module' }
        )
      case 'json':
        return new Worker(
          new URL('monaco-editor/esm/vs/language/json/json.worker.js', import.meta.url),
          { type: 'module' }
        )
      case 'javascript':
      case 'typescript':
        return new Worker(
          new URL('monaco-editor/esm/vs/language/typescript/ts.worker.js', import.meta.url),
          { type: 'module' }
        )
      case 'prettier':
        return new Worker(new URL('prettier.worker.js', import.meta.url), { type: 'module' })
      default:
        throw new Error(`Unknown label ${label}`)
    }
  }
}

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

/**
 * Create an example model from a file extension and content.
 *
 * The created model will have explicit formatting options.
 *
 * @param extension
 *   The file extension to use.
 * @param content
 *   The content of the model.
 * @returns The created model.
 */
function createModel(extension: string, content: string): monaco.editor.ITextModel {
  const model = monaco.editor.createModel(
    content,
    undefined,
    monaco.Uri.file(`example.${extension}`)
  )
  model.updateOptions({
    insertSpaces: true,
    tabSize: 2
  })
  return model
}

createModel(
  'css',
  `
  .prettier{color: \t#DEDEDE}
`
)

createModel(
  'html',
  `<!DOCTYPE html><html><head>
  \t <meta charset="utf-8"   >
  <title
  \t>Example</title>
    \t <meta name="description" content="YAML support for Monaco editor" />
    <meta name="theme-color" content="#42e3ff" ></head>
  \t<body><p>Hello world!</p></body>
  </html>
`
)

createModel(
  'json',
  `
{
  "name": "monaco-prettier",

\t

\t"version": "1.0.0",}
`
)

createModel(
  'jsx',
  `\t
  function  print(argument     )
{\r
\r


console.log( "Hello" , argument )}


print(
  'Prettier'
,);
`
)

createModel(
  'md',
  `
# Monaco Prettier
## Features
-\tFormatting
-\tRange formatting

##    Links
* [GitHub](https://github.com/remcohaszing/monaco-prettier)
  `
)

createModel(
  'tsx',
  `
  function  print(argument   :string  ):undefined
{\r
\r


console.log( "Hello" , argument )}


print(
  'Prettier'
,);
`
)

const modelSelection = document.getElementById('model-selection')! as HTMLSelectElement

const dark = matchMedia('(prefers-color-scheme: dark)')
monaco.editor.setTheme(dark.matches ? 'vs-dark' : 'vs-light')
dark.addEventListener('change', () => {
  monaco.editor.setTheme(dark.matches ? 'vs-dark' : 'vs-light')
})

const editor = monaco.editor.create(document.getElementById('editor')!, {
  formatOnPaste: true,
  model: monaco.editor.getModel(monaco.Uri.file(`example.${modelSelection.value}`)),
  renderWhitespace: 'all',
  renderFinalNewline: 'on',
  renderControlCharacters: true,
  rulers: [80]
})

modelSelection.addEventListener('change', () => {
  editor.setModel(monaco.editor.getModel(monaco.Uri.file(`example.${modelSelection.value}`)))
})
