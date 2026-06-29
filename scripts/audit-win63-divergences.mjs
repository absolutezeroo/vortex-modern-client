#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const WIN63_ROOT = path.join(ROOT, 'sources', 'win63_version');
const TS_ROOTS = [
    path.join(ROOT, 'packages', 'helium-engine', 'src'),
    path.join(ROOT, 'packages', 'helium-client', 'src'),
];
const OUT_PATH = path.join(ROOT, 'docs', 'WIN63_DIVERGENCES_AUDIT.md');

const IGNORED_TS_BASENAMES = new Set([
    'index',
    'vite-env',
]);

const KEYWORDS = new Set([
    'if',
    'for',
    'while',
    'switch',
    'catch',
    'return',
    'super',
    'this',
]);

function walk(dir, ext)
{
    if(!fs.existsSync(dir)) return [];

    const results = [];
    const entries = fs.readdirSync(dir, { withFileTypes: true });

    for(const entry of entries)
    {
        const fullPath = path.join(dir, entry.name);

        if(entry.isDirectory())
        {
            results.push(...walk(fullPath, ext));
            continue;
        }

        if(entry.isFile() && fullPath.endsWith(ext))
        {
            results.push(fullPath);
        }
    }

    return results;
}

function rel(file)
{
    return path.relative(ROOT, file).replaceAll(path.sep, '/');
}

function stripComments(source)
{
    return source
        .replace(/\/\*[\s\S]*?\*\//g, '')
        .replace(/\/\/.*$/gm, '');
}

function basenameNoExt(file)
{
    return path.basename(file).replace(/\.[^.]+$/, '');
}

function countParams(params)
{
    const clean = params
        .replace(/\/\*[\s\S]*?\*\//g, '')
        .replace(/\/\/.*$/gm, '')
        .trim();

    if(!clean) return 0;

    let depth = 0;
    let count = 1;

    for(const char of clean)
    {
        if(char === '<' || char === '(' || char === '[' || char === '{') depth++;
        else if(char === '>' || char === ')' || char === ']' || char === '}') depth = Math.max(0, depth - 1);
        else if(char === ',' && depth === 0) count++;
    }

    return count;
}

function normalizeReadName(name)
{
    return name
        .replace(/^read/i, '')
        .replace(/^Integer$/i, 'Int')
        .replace(/^int$/i, 'Int')
        .replace(/^boolean$/i, 'Boolean')
        .replace(/^string$/i, 'String')
        .replace(/^short$/i, 'Short')
        .replace(/^byte$/i, 'Byte')
        .replace(/^long$/i, 'Long')
        .replace(/^float$/i, 'Float')
        .replace(/^double$/i, 'Double');
}

function extractReadSequence(source, isAs3)
{
    const reads = [];
    const regex = isAs3
        ? /\.read(Integer|String|Boolean|Short|Byte|Long|Float|Double)\s*\(/g
        : /\.read(Int|String|Boolean|Short|Byte|Long|Float|Double)\s*\(/g;
    let match;

    while((match = regex.exec(source)) !== null)
    {
        reads.push(normalizeReadName(match[1]));
    }

    return reads;
}

function extractAs3Info(file, source)
{
    const clean = stripComments(source);
    const declaration = clean.match(/\b(public\s+)?(?:(?:final|dynamic|internal)\s+)*(class|interface)\s+([A-Za-z_]\w*)(?:\s+extends\s+([A-Za-z_][\w.]*))?(?:\s+implements\s+([^{]+))?/);
    const info = {
        path: rel(file),
        basename: basenameNoExt(file),
        kind: declaration?.[2] ?? null,
        name: declaration?.[3] ?? basenameNoExt(file),
        extends: declaration?.[4] ?? null,
        implements: splitImplements(declaration?.[5] ?? ''),
        methods: new Map(),
        accessors: new Map(),
        publicVars: new Set(),
        constructorParams: null,
        readSequence: extractReadSequence(clean, true),
        imports: extractAs3Imports(clean),
        listenerAdds: countMatches(clean, /addEventListener\s*\(/g) + countMatches(clean, /addMessageEvent\s*\(/g),
        listenerRemoves: countMatches(clean, /removeEventListener\s*\(/g) + countMatches(clean, /removeMessageEvent\s*\(/g),
    };

    const fnRegex = /\b(?:(public|protected|private|internal)\s+)?(?:(?:override|static|final)\s+)*function\s+(?:(get|set)\s+)?([A-Za-z_]\w*)\s*\(([^)]*)\)/g;
    let match;

    while((match = fnRegex.exec(clean)) !== null)
    {
        const visibility = match[1] ?? (info.kind === 'interface' ? 'public' : 'internal');
        const accessor = match[2] ?? null;
        const name = match[3];
        const params = countParams(match[4] ?? '');

        if(name === info.name)
        {
            info.constructorParams = params;
            continue;
        }

        if(visibility !== 'public') continue;

        if(accessor)
        {
            const key = `${accessor}:${name}`;
            info.accessors.set(key, { name, accessor, params });
            continue;
        }

        info.methods.set(name, { name, params });
    }

    const varRegex = /\bpublic\s+(?:(?:static|const|var|readonly|final)\s+)*(?:const|var)\s+([A-Za-z_]\w*)/g;

    while((match = varRegex.exec(clean)) !== null)
    {
        info.publicVars.add(match[1]);
    }

    return info;
}

function extractTsInfo(file, source)
{
    const clean = stripComments(source);
    const declaration = findTsDeclaration(clean, basenameNoExt(file));
    const info = {
        path: rel(file),
        basename: basenameNoExt(file),
        kind: declaration?.kind ?? null,
        name: declaration?.name ?? basenameNoExt(file),
        extends: declaration?.extendsName ?? null,
        implements: splitImplements(declaration?.implementsText ?? ''),
        methods: new Map(),
        accessors: new Map(),
        publicVars: new Set(),
        constructorParams: null,
        readSequence: extractReadSequence(clean, false),
        references: extractWin63References(source),
        basedOn: extractBasedOn(source),
        listenerAdds: countMatches(clean, /\.(?:on|addEventListener|addMessageEvent)\s*\(/g),
        listenerRemoves: countMatches(clean, /\.(?:off|removeEventListener|removeMessageEvent)\s*\(/g),
        hasDispose: /\bdispose\s*\(/.test(clean),
        hasDisposedGuard: /\bif\s*\(\s*this\._disposed\s*\)\s*return\b/.test(clean) || /\bif\s*\(\s*this\.disposed\s*\)\s*return\b/.test(clean),
    };

    const ctorRegex = /^\s*(?:public\s+)?constructor\s*\(([^)]*)\)/gm;
    let match;

    while((match = ctorRegex.exec(clean)) !== null)
    {
        info.constructorParams = countParams(match[1] ?? '');
        break;
    }

    const methodRegex = /^\s*(?:(public|protected|private)\s+)?(?:(?:override|async|static|readonly)\s+)*(?:(get|set)\s+)?([A-Za-z_$][\w$]*)\s*\(([^)]*)\)\s*(?::|{|;)/gm;

    while((match = methodRegex.exec(clean)) !== null)
    {
        const visibility = match[1] ?? 'public';
        const accessor = match[2] ?? null;
        const name = match[3];
        const params = countParams(match[4] ?? '');

        if(KEYWORDS.has(name)) continue;
        if(name === 'constructor') continue;
        if(visibility !== 'public') continue;

        if(accessor)
        {
            const key = `${accessor}:${name}`;
            info.accessors.set(key, { name, accessor, params });
            continue;
        }

        info.methods.set(name, { name, params });
    }

    const interfaceMethodRegex = /^\s*([A-Za-z_$][\w$]*)\s*\(([^)]*)\)\s*:/gm;

    while((match = interfaceMethodRegex.exec(clean)) !== null)
    {
        const name = match[1];

        if(KEYWORDS.has(name)) continue;
        if(info.methods.has(name)) continue;

        info.methods.set(name, { name, params: countParams(match[2] ?? '') });
    }

    const varRegex = /^\s*(?:public\s+)?(?:(?:static|readonly)\s+)*([A-Za-z_$][\w$]*)\s*(?::|=)/gm;

    while((match = varRegex.exec(clean)) !== null)
    {
        const name = match[1];

        if(KEYWORDS.has(name)) continue;
        info.publicVars.add(name);
    }

    return info;
}

function findTsDeclaration(source, preferredName)
{
    const declarations = [];
    const regex = /\bexport\s+(?:(?:abstract|declare)\s+)*(class|interface)\s+([A-Za-z_]\w*)(?:\s+extends\s+([A-Za-z_][\w.]*))?(?:\s+implements\s+([^{]+))?/g;
    let match;

    while((match = regex.exec(source)) !== null)
    {
        declarations.push({
            kind: match[1],
            name: match[2],
            extendsName: match[3] ?? null,
            implementsText: match[4] ?? '',
        });
    }

    return declarations.find(declaration => declaration.name === preferredName) ?? declarations[0] ?? null;
}

function splitImplements(value)
{
    if(!value) return [];

    return value
        .replace(/\{[\s\S]*$/, '')
        .split(',')
        .map(item => item.trim().replace(/\s.*$/, ''))
        .filter(Boolean);
}

function extractAs3Imports(source)
{
    const imports = [];
    const regex = /^\s*import\s+([A-Za-z0-9_.*]+)\s*;/gm;
    let match;

    while((match = regex.exec(source)) !== null)
    {
        imports.push(match[1]);
    }

    return imports;
}

function extractWin63References(source)
{
    const refs = [];
    const regex = /sources\/win63_version\/([A-Za-z0-9_./-]+\.as)/g;
    let match;

    while((match = regex.exec(source.replaceAll('\\', '/'))) !== null)
    {
        refs.push(`sources/win63_version/${match[1]}`);
    }

    return [...new Set(refs)];
}

function extractBasedOn(source)
{
    const match = source.match(/Based on AS3:?\s+([A-Za-z0-9_.]+)/);

    return match?.[1] ?? null;
}

function countMatches(source, regex)
{
    return [...source.matchAll(regex)].length;
}

function classPathFromBasedOn(basedOn)
{
    if(!basedOn) return null;

    const normalized = basedOn
        .replace(/^com\.sulake\./, '')
        .replace(/^com\.sulke\./, '');

    return path.join(WIN63_ROOT, ...normalized.split('.')) + '.as';
}

function classPathFromTsPath(file)
{
    const normalized = rel(file);
    const enginePrefix = 'packages/helium-engine/src/';
    const clientPrefix = 'packages/helium-client/src/';

    if(normalized.startsWith(enginePrefix))
    {
        return path.join(WIN63_ROOT, normalized.slice(enginePrefix.length).replace(/\.ts$/, '.as'));
    }

    if(normalized.startsWith(clientPrefix))
    {
        return path.join(WIN63_ROOT, normalized.slice(clientPrefix.length).replace(/\.ts$/, '.as'));
    }

    return null;
}

function chooseAs3ForTs(tsFile, tsInfo, asByBase)
{
    const candidates = [];
    const tsBase = basenameNoExt(tsFile);

    const direct = classPathFromTsPath(tsFile);
    if(direct && fs.existsSync(direct)) candidates.push({ file: direct, reason: 'same relative path' });

    const basedPath = classPathFromBasedOn(tsInfo.basedOn);
    if(basedPath && fs.existsSync(basedPath))
    {
        const basedBase = basenameNoExt(basedPath);

        if(basedBase === tsBase || basedBase.startsWith('class_'))
        {
            candidates.push({ file: basedPath, reason: 'Based on AS3' });
        }
    }

    for(const ref of tsInfo.references)
    {
        const refFile = path.join(ROOT, ref);
        const refBase = basenameNoExt(refFile);

        if(fs.existsSync(refFile) && (refBase === tsBase || refBase.startsWith('class_')))
        {
            candidates.push({ file: refFile, reason: '@see win63' });
        }
    }

    const sameBase = asByBase.get(tsBase.toLowerCase()) ?? [];

    if(sameBase.length === 1 && sameModuleHint(tsFile, sameBase[0]))
    {
        candidates.push({ file: sameBase[0], reason: 'unique basename' });
    }
    else if(sameBase.length > 1)
    {
        const preferred = sameBase.find(file => sameModuleHint(tsFile, file));

        if(preferred) candidates.push({ file: preferred, reason: 'basename + module hint' });
    }

    const unique = [];
    const seen = new Set();

    for(const candidate of candidates)
    {
        const key = rel(candidate.file);

        if(seen.has(key)) continue;

        seen.add(key);
        unique.push(candidate);
    }

    return unique[0] ?? null;
}

function sameModuleHint(tsFile, asFile)
{
    const tsParts = rel(tsFile).split('/');
    const asParts = rel(asFile).split('/');
    const srcIndex = tsParts.indexOf('src');
    const win63Index = asParts.indexOf('win63_version');

    if(srcIndex < 0 || win63Index < 0) return false;

    const tsRoot = tsParts[srcIndex + 1];
    const asRoot = asParts[win63Index + 1];

    if(tsRoot !== asRoot) return false;
    if(tsRoot === 'iid') return true;
    if(tsRoot === 'room') return true;

    return tsParts[srcIndex + 2] === asParts[win63Index + 2];
}

function comparePair(tsInfo, as3Info)
{
    const issues = [];

    if(tsInfo.kind && as3Info.kind && tsInfo.kind !== as3Info.kind)
    {
        issues.push({
            severity: 'high',
            type: 'kind',
            detail: `AS3 is ${as3Info.kind}, TS is ${tsInfo.kind}`,
        });
    }

    if(as3Info.extends && tsInfo.extends && as3Info.extends !== tsInfo.extends)
    {
        issues.push({
            severity: 'medium',
            type: 'extends',
            detail: `AS3 extends ${as3Info.extends}, TS extends ${tsInfo.extends}`,
        });
    }

    if(as3Info.constructorParams !== null && tsInfo.constructorParams !== null && as3Info.constructorParams !== tsInfo.constructorParams)
    {
        issues.push({
            severity: 'medium',
            type: 'constructor',
            detail: `constructor param count AS3=${as3Info.constructorParams}, TS=${tsInfo.constructorParams}`,
        });
    }

    const asImplements = new Set(as3Info.implements.map(shortName));
    const tsImplements = new Set(tsInfo.implements.map(shortName));

    for(const item of asImplements)
    {
        if(!item || tsImplements.has(item)) continue;

        issues.push({
            severity: 'medium',
            type: 'implements',
            detail: `AS3 implements ${item}, TS does not declare it`,
        });
    }

    for(const [name, method] of as3Info.methods)
    {
        if(isIgnorableAs3Method(name)) continue;

        const tsMethod = tsInfo.methods.get(name);

        if(!tsMethod)
        {
            issues.push({
                severity: 'high',
                type: 'missing-public-method',
                detail: `public AS3 method ${name}() is absent in TS`,
            });
            continue;
        }

        if(method.params !== tsMethod.params)
        {
            issues.push({
                severity: 'medium',
                type: 'method-signature',
                detail: `${name}() param count AS3=${method.params}, TS=${tsMethod.params}`,
            });
        }
    }

    for(const [key, accessor] of as3Info.accessors)
    {
        if(tsInfo.accessors.has(key)) continue;

        const fallbackMethod = tsInfo.methods.get(accessor.name);
        const fallbackVar = tsInfo.publicVars.has(accessor.name);

        if(fallbackMethod || fallbackVar) continue;

        issues.push({
            severity: 'medium',
            type: 'missing-public-accessor',
            detail: `public AS3 ${accessor.accessor} ${accessor.name} is absent in TS`,
        });
    }

    for(const [name] of tsInfo.methods)
    {
        if(isIgnorableTsMethod(name)) continue;
        if(as3Info.methods.has(name)) continue;
        if([...as3Info.accessors.values()].some(accessor => accessor.name === name)) continue;

        issues.push({
            severity: 'low',
            type: 'ts-only-public-method',
            detail: `TS public method ${name}() has no AS3 equivalent in this file`,
        });
    }

    if(isProtocolFile(as3Info.path) || isProtocolFile(tsInfo.path))
    {
        const asReads = as3Info.readSequence.join(',');
        const tsReads = tsInfo.readSequence.join(',');

        if((as3Info.readSequence.length > 0 || tsInfo.readSequence.length > 0) && asReads !== tsReads)
        {
            issues.push({
                severity: 'high',
                type: 'read-sequence',
                detail: `message/data read sequence differs AS3=[${asReads}] TS=[${tsReads}]`,
            });
        }
    }

    if(as3Info.methods.has('dispose') && !tsInfo.hasDispose)
    {
        issues.push({
            severity: 'high',
            type: 'dispose',
            detail: 'AS3 has dispose(), TS has no dispose()',
        });
    }
    else if(as3Info.methods.has('dispose') && tsInfo.hasDispose && !tsInfo.hasDisposedGuard && tsInfo.extends !== 'Component')
    {
        issues.push({
            severity: 'medium',
            type: 'dispose-guard',
            detail: 'TS dispose() has no obvious _disposed guard',
        });
    }

    if(tsInfo.listenerAdds > 0 && tsInfo.listenerRemoves === 0 && tsInfo.hasDispose)
    {
        issues.push({
            severity: 'medium',
            type: 'listener-cleanup',
            detail: `TS registers ${tsInfo.listenerAdds} listener(s) but no matching off/remove call was detected`,
        });
    }

    return issues;
}

function isProtocolFile(file)
{
    return file.includes('/communication/messages/');
}

function shortName(value)
{
    return value.split('.').at(-1)?.trim() ?? value;
}

function isIgnorableAs3Method(name)
{
    return name === 'toString' || name === 'valueOf' || name === 'dispose';
}

function isIgnorableTsMethod(name)
{
    return name === 'dispose'
        || name === 'flush'
        || name === 'parse'
        || name === 'getMessageArray'
        || name === 'emit'
        || name === 'on'
        || name === 'off';
}

function moduleNameFromPath(file)
{
    const parts = rel(file).split('/');
    const srcIndex = parts.indexOf('src');

    if(srcIndex >= 0 && parts.length > srcIndex + 1)
    {
        if(parts[srcIndex + 1] === 'habbo' && parts.length > srcIndex + 2) return `habbo/${parts[srcIndex + 2]}`;
        if(parts[srcIndex + 1] === 'core' && parts.length > srcIndex + 2) return `core/${parts[srcIndex + 2]}`;

        return parts[srcIndex + 1];
    }

    return 'unknown';
}

function severityRank(severity)
{
    if(severity === 'high') return 3;
    if(severity === 'medium') return 2;
    return 1;
}

function makeReport(results, unmappedTs, stats)
{
    const now = new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Paris' }).format(new Date());
    const byModule = new Map();
    const issueCounts = { high: 0, medium: 0, low: 0 };
    const typeCounts = new Map();

    for(const result of results)
    {
        const moduleName = moduleNameFromPath(result.tsFile);

        if(!byModule.has(moduleName)) byModule.set(moduleName, []);

        byModule.get(moduleName).push(result);

        for(const issue of result.issues)
        {
            issueCounts[issue.severity]++;
            typeCounts.set(issue.type, (typeCounts.get(issue.type) ?? 0) + 1);
        }
    }

    const topResults = [...results]
        .filter(result => result.issues.length > 0)
        .sort((a, b) =>
        {
            const scoreA = a.issues.reduce((sum, issue) => sum + severityRank(issue.severity), 0);
            const scoreB = b.issues.reduce((sum, issue) => sum + severityRank(issue.severity), 0);

            return scoreB - scoreA;
        })
        .slice(0, 40);

    const lines = [];

    lines.push('# Audit des divergences win63 AS3 -> TypeScript');
    lines.push('');
    lines.push(`Date: ${now}`);
    lines.push('Reference AS3 unique: `sources/win63_version/`');
    lines.push('Reference exclue: `sources/flash_version/`');
    lines.push('');
    lines.push('## Perimetre');
    lines.push('');
    lines.push('- Ce rapport compare uniquement les fichiers TypeScript existants qui ont un equivalent AS3 win63 identifiable.');
    lines.push('- Les classes AS3 absentes cote TypeScript ne sont pas listees comme divergences ici.');
    lines.push('- Les resultats sont des divergences structurelles detectees automatiquement: API publique, heritage, interfaces, signatures, sequences de lecture protocolaire et nettoyage de listeners.');
    lines.push('- Les optimisations JS/Pixi documentees restent a confirmer manuellement quand elles apparaissent comme ecarts structurels.');
    lines.push('');
    lines.push('## Synthese');
    lines.push('');
    lines.push('| Metrique | Valeur |');
    lines.push('|---|---:|');
    lines.push(`| Fichiers TS inspectes | ${stats.tsFiles} |`);
    lines.push(`| Fichiers AS3 win63 indexes | ${stats.asFiles} |`);
    lines.push(`| Paires TS/AS3 comparees | ${results.length} |`);
    lines.push(`| Fichiers TS sans equivalent win63 retenu | ${unmappedTs.length} |`);
    lines.push(`| Fichiers avec au moins une divergence detectee | ${results.filter(result => result.issues.length > 0).length} |`);
    lines.push(`| Divergences high | ${issueCounts.high} |`);
    lines.push(`| Divergences medium | ${issueCounts.medium} |`);
    lines.push(`| Divergences low | ${issueCounts.low} |`);
    lines.push('');
    lines.push('## Types de divergences');
    lines.push('');
    lines.push('| Type | Nombre |');
    lines.push('|---|---:|');

    for(const [type, count] of [...typeCounts.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0])))
    {
        lines.push(`| ${type} | ${count} |`);
    }

    lines.push('');
    lines.push('## Top divergences a verifier');
    lines.push('');

    if(topResults.length === 0)
    {
        lines.push('Aucune divergence detectee.');
    }
    else
    {
        lines.push('| TS | AS3 win63 | Divergences principales |');
        lines.push('|---|---|---|');

        for(const result of topResults)
        {
            const mainIssues = result.issues
                .sort((a, b) => severityRank(b.severity) - severityRank(a.severity))
                .slice(0, 5)
                .map(issue => `${issue.severity}:${issue.type} - ${issue.detail}`)
                .join('<br>');

            lines.push(`| \`${rel(result.tsFile)}\` | \`${rel(result.as3File)}\` | ${escapeCell(mainIssues)} |`);
        }
    }

    lines.push('');
    lines.push('## Divergences par module');
    lines.push('');

    for(const [moduleName, moduleResults] of [...byModule.entries()].sort((a, b) => a[0].localeCompare(b[0])))
    {
        const moduleWithIssues = moduleResults.filter(result => result.issues.length > 0);

        if(moduleWithIssues.length === 0) continue;

        lines.push(`### ${moduleName}`);
        lines.push('');
        lines.push('| TS | AS3 win63 | Severite | Type | Detail |');
        lines.push('|---|---|---|---|---|');

        for(const result of moduleWithIssues.sort((a, b) => rel(a.tsFile).localeCompare(rel(b.tsFile))))
        {
            for(const issue of result.issues.sort((a, b) => severityRank(b.severity) - severityRank(a.severity) || a.type.localeCompare(b.type)))
            {
                lines.push(`| \`${rel(result.tsFile)}\` | \`${rel(result.as3File)}\` | ${issue.severity} | ${issue.type} | ${escapeCell(issue.detail)} |`);
            }
        }

        lines.push('');
    }

    lines.push('## Fichiers TS non compares');
    lines.push('');
    lines.push('Ces fichiers existent cote TS mais aucun equivalent AS3 win63 fiable n a ete retenu par le script. Ils ne sont pas comptes comme divergences.');
    lines.push('');

    const shownUnmapped = unmappedTs
        .map(file => rel(file))
        .filter(file => !file.includes('/assets/'))
        .sort();

    if(shownUnmapped.length === 0)
    {
        lines.push('Aucun fichier non compare hors assets.');
    }
    else
    {
        for(const file of shownUnmapped)
        {
            lines.push(`- \`${file}\``);
        }
    }

    lines.push('');
    lines.push('## Commande de regeneration');
    lines.push('');
    lines.push('```bash');
    lines.push('node scripts/audit-win63-divergences.mjs --write');
    lines.push('```');
    lines.push('');

    return lines.join('\n');
}

function escapeCell(value)
{
    return value.replaceAll('|', '\\|').replace(/\r?\n/g, '<br>');
}

function main()
{
    const write = process.argv.includes('--write');
    const asFiles = walk(WIN63_ROOT, '.as');
    const tsFiles = TS_ROOTS.flatMap(root => walk(root, '.ts'))
        .filter(file => !file.endsWith('.d.ts'))
        .filter(file => !IGNORED_TS_BASENAMES.has(basenameNoExt(file)))
        .filter(file => !rel(file).includes('/assets/'));

    const asByBase = new Map();
    const asInfoByFile = new Map();

    for(const asFile of asFiles)
    {
        const base = basenameNoExt(asFile).toLowerCase();

        if(!asByBase.has(base)) asByBase.set(base, []);

        asByBase.get(base).push(asFile);
    }

    const results = [];
    const unmappedTs = [];

    for(const tsFile of tsFiles)
    {
        const tsSource = fs.readFileSync(tsFile, 'utf8');
        const tsInfo = extractTsInfo(tsFile, tsSource);
        const mapping = chooseAs3ForTs(tsFile, tsInfo, asByBase);

        if(!mapping)
        {
            unmappedTs.push(tsFile);
            continue;
        }

        let as3Info = asInfoByFile.get(mapping.file);

        if(!as3Info)
        {
            as3Info = extractAs3Info(mapping.file, fs.readFileSync(mapping.file, 'utf8'));
            asInfoByFile.set(mapping.file, as3Info);
        }

        const issues = comparePair(tsInfo, as3Info);

        results.push({
            tsFile,
            as3File: mapping.file,
            reason: mapping.reason,
            issues,
        });
    }

    const report = makeReport(results, unmappedTs, {
        tsFiles: tsFiles.length,
        asFiles: asFiles.length,
    });

    if(write)
    {
        fs.writeFileSync(OUT_PATH, report, 'utf8');
        console.log(`Wrote ${rel(OUT_PATH)}`);
    }
    else
    {
        console.log(report);
    }
}

main();
