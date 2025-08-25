import type { languages } from 'monaco-types'
import type { Plugin } from 'prettier'

import type { configureMonacoPrettier } from './monaco-prettier.js'

import { initialize } from 'monaco-worker-manager/worker'
import { format } from 'prettier/standalone'

/**
 * @internal
 */
export interface PrettierWorker {
  /**
   * Format a document using Prettier.
   *
   * @param uri
   *   The URI of the Monaco model to format.
   * @param languageId
   *   The language ID of the Monaco model to format.
   * @param formattingOptions
   *   Monaco editor formatting options.
   * @param rangeStart
   *   The range start offset to format.
   * @param rangeEnd
   *   The range end offset to format.
   * @returns
   *   If the document is matched and there are changes, the formatted document. Otherwise
   *   undefined.
   */
  format: (
    uri: string,
    languageId: string,
    formattingOptions: languages.FormattingOptions,
    rangeStart?: number,
    rangeEnd?: number
  ) => string | undefined
}

/**
 * Configure a Monaco Prettier worker.
 *
 * @param plugins
 *   The Prettier plugins to use.
 */
export function setup(plugins: (object & Plugin)[]): undefined {
  initialize<PrettierWorker, configureMonacoPrettier.Options>((context, { parsers, prettier }) => ({
    async format(uri, languageId, formattingOptions, rangeStart, rangeEnd) {
      const model = context.getMirrorModels().find((m) => String(m.uri) === uri)
      if (!model) {
        return
      }

      const value = model.getValue()
      const formatted = await format(value, {
        tabWidth: formattingOptions.tabSize,
        useTabs: !formattingOptions.insertSpaces,
        ...prettier,
        filepath: String(model.uri),
        parser: parsers[languageId],
        plugins,
        rangeEnd,
        rangeStart
      })
      if (value !== formatted) {
        return formatted
      }
    }
  }))
}
