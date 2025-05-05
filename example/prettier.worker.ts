import * as babel from 'prettier/plugins/babel'
import * as estree from 'prettier/plugins/estree'
import * as html from 'prettier/plugins/html'
import * as markdown from 'prettier/plugins/markdown'
import * as postcss from 'prettier/plugins/postcss'

import { setup } from '../src/worker.js'

setup([babel, estree, html, markdown, postcss])
