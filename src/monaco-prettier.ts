import type { CancellationToken, editor, IDisposable, languages, MonacoEditor } from 'monaco-types'
import type * as prettier from 'prettier'

import type { PrettierWorker } from './worker.js'

import { createWorkerManager } from 'monaco-worker-manager'

type Language =
  | 'css'
  | 'handlebars'
  | 'html'
  | 'javascript'
  | 'javascriptreact'
  | 'json'
  | 'jsonc'
  | 'markdown'
  | 'mdx'
  | 'sass'
  | 'scss'
  | 'typescript'
  | 'typescriptreact'
  | 'vue'
  | 'yaml'
  | (string & {})

export namespace configureMonacoPrettier {
  export interface Options {
    /**
     * A mapping of Monaco language IDs to prettier parser names.
     */
    parsers: Partial<Record<Language, prettier.BuiltInParserName | (string & {})>>

    /**
     * Prettier options.
     */
    prettier?:
      | Pick<
          prettier.Options,
          | 'arrowParens'
          | 'bracketSameLine'
          | 'bracketSpacing'
          | 'embeddedLanguageFormatting'
          | 'experimentalOperatorPosition'
          | 'experimentalTernaries'
          | 'htmlWhitespaceSensitivity'
          | 'insertPragma'
          | 'jsxSingleQuote'
          | 'objectWrap'
          | 'printWidth'
          | 'proseWrap'
          | 'requirePragma'
          | 'semi'
          | 'singleAttributePerLine'
          | 'singleQuote'
          | 'tabWidth'
          | 'trailingComma'
          | 'useTabs'
          | 'vueIndentScriptAndStyle'
        >
      | undefined
  }
}

/**
 * Configure Prettier as a formatter.
 *
 * @param monaco
 *   The Monaco editor module to use.
 * @param options
 *   Options to configure the Monaco Prettier integration.
 * @returns
 *   A disposable.
 */
export function configureMonacoPrettier(
  monaco: MonacoEditor,
  options: configureMonacoPrettier.Options
): IDisposable {
  const selector = Object.keys(options.parsers)

  const workerManager = createWorkerManager<PrettierWorker, configureMonacoPrettier.Options>(
    monaco,
    {
      label: 'prettier',
      moduleId: 'prettier',
      createData: options
    }
  )

  /**
   * Provide text edits to format the content of a model.
   *
   * @param model
   *   The model to format.
   * @param formattingOptions
   *   The Monaco formatting options.
   * @param token
   *   A cancellation token.
   * @param rangeStart
   *   The optional start of the range to format.
   * @param rangeEnd
   *   The optional end of the range to format.
   * @returns
   *   An array containing the Monaco text edits to apply.
   */
  async function format(
    model: editor.ITextModel,
    formattingOptions: languages.FormattingOptions,
    token: CancellationToken,
    rangeStart?: number,
    rangeEnd?: number
  ): Promise<languages.TextEdit[] | undefined> {
    const worker = await workerManager.getWorker(model.uri)

    if (token.isCancellationRequested) {
      return
    }

    const text = await worker.format(
      String(model.uri),
      model.getLanguageId(),
      formattingOptions,
      rangeStart,
      rangeEnd
    )

    if (text != null) {
      return [{ range: new monaco.Range(1, 1, Infinity, Infinity), text }]
    }
  }

  const formattingProvider = monaco.languages.registerDocumentFormattingEditProvider(selector, {
    displayName: 'Prettier',
    provideDocumentFormattingEdits: format
  })

  const rangeFormattingProvider = monaco.languages.registerDocumentRangeFormattingEditProvider(
    selector,
    {
      displayName: 'Prettier',
      provideDocumentRangeFormattingEdits: (model, range, formattingOptions, token) =>
        format(
          model,
          formattingOptions,
          token,
          model.getOffsetAt(range.getStartPosition()),
          model.getOffsetAt(range.getEndPosition())
        )
    }
  )

  return {
    dispose() {
      formattingProvider.dispose()
      rangeFormattingProvider.dispose()
      workerManager.dispose()
    }
  }
}
