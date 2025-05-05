import { define } from '@remcohaszing/eslint'

export default define([
  {
    rules: {
      'capitalized-comments': [
        'error',
        'always',
        {
          ignoreConsecutiveComments: true,
          ignorePattern: /^\s*(c8|type-coverage:|webpack\w|([\w.-]+\.\w+$))/.source
        }
      ],
      'import-x/no-extraneous-dependencies': 'off'
    }
  }
])
