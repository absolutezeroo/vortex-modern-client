// habbo.com's AngularJS bundle carries every one of its templates inline, in the minified
// `templates` module: `e.put("home/news/news.html", '<section …>')`. That is the only complete
// record of the site's DOM structure anywhere in this repo — `mockup/habbo.css` says how a
// `.news-header--single` looks, and only these templates say what is inside one.
//
//   node tools/extract-templates.mjs
//
// writes sources/templates/<path>.html, one file per template, unescaped. Read-only tooling: it
// never touches src/.
import {readFileSync, writeFileSync, mkdirSync} from 'node:fs';
import {dirname, join} from 'node:path';

const ROOT = new URL('..', import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1');
const SOURCE = join(ROOT, 'sources', 'habbo.js');
const OUT = join(ROOT, 'sources', 'templates');

const source = readFileSync(SOURCE, 'utf8');

// `e.put("<name>", <literal>)`. The literal is a single- or double-quoted JS string whose closing
// quote is the first unescaped one — hence the backslash-aware scan rather than a lazy regex, which
// stops at the first `\'` inside an ng-click handler.
const OPEN = /\.put\("([^"]+\.html)",\s*(['"])/g;

let written = 0;
let match;

while((match = OPEN.exec(source)) !== null)
{
    const [, name, quote] = match;
    let index = OPEN.lastIndex;
    let out = '';

    while(index < source.length)
    {
        const char = source[index];

        if(char === '\\')
        {
            const next = source[index + 1];

            // Only the escapes these templates actually use; anything else keeps its backslash.
            out += next === 'n' ? '\n' : next === 't' ? '\t' : next;
            index += 2;
            continue;
        }

        if(char === quote)
        {
            break;
        }

        out += char;
        index += 1;
    }

    const target = join(OUT, name);

    mkdirSync(dirname(target), {recursive: true});
    writeFileSync(target, out, 'utf8');
    written += 1;
}

process.stdout.write(`${written} templates -> sources/templates/\n`);
