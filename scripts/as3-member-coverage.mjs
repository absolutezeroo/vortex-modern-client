#!/usr/bin/env node
/**
 * The inverse of scripts/audit-as3-traces.mjs, and the first member-level parity measure in this
 * repo.
 *
 * That script asks, of every `AS3:` citation the port writes: does the cited file exist, and does
 * it declare the member named? This one asks the question that actually measures parity — of every
 * AS3 file the port cites, which of its declared members has **no** citation pointing at it?
 *
 * Why this works even though the port deobfuscates as it writes. `_SafeCls_90.as` becomes
 * `RoomEngine.ts`, so no name-to-name diff across the boundary is possible. It does not have to
 * be: the ~15k `AS3:` trace comments *are* the deobfuscation map, written by hand, and the
 * obfuscator left member names alone in 90% of cases (39,228 of 43,306 function declarations in
 * the primary tree are readable). So follow the trace to reach the file, then compare member names
 * *inside* that file, where they are readable.
 *
 * A gap is a worklist entry, not a verdict. Four legitimate reasons a member carries no citation:
 * a private helper folded into its caller, a member the port deliberately does not implement, an
 * accessor traced bare rather than as `get x`, and a member whose AS3 name is obfuscated — those
 * last are counted apart and never as gaps, because .claude/rules/30-as3-traceability.md forbids
 * citing a `_SafeStr_N` placeholder, so they *cannot* be covered by name. Read the AS3 body before
 * porting anything this reports.
 *
 * What it does NOT measure: whether a cited member's TypeScript actually behaves like the AS3. A
 * `TODO(AS3)` stub carrying a correct trace counts as covered here. Coverage is "nothing is
 * missing", not "everything is right".
 *
 * Usage:
 *   node scripts/as3-member-coverage.mjs [module-substring ...] [--list] [--private] [--top N]
 *
 *   module-substring  restrict to AS3 paths containing it, e.g. `habbo/room habbo/catalog`.
 *                     Without one, every cited file is measured.
 *   --list            enumerate the uncited members, not just the per-file counts.
 *   --private         include private members in the enumeration (they are always counted).
 *   --top N           how many files to list (default 15; `--top 0` for all).
 *   --all-trees       also measure files cited in `win63_version` / PRODUCTION. Off by default:
 *                     those trees are cited for names, so nearly every member reads as a gap, and
 *                     the same class gets counted once per tree.
 */
import { readFileSync, existsSync, readdirSync, statSync } from 'node:fs';
import { join, dirname, relative, basename } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');

const SRC_ROOTS =
[
    'packages/vortex-engine/src',
    'packages/vortex-client/src',
    'packages/vortex-glaze/src',
    'packages/vortex-imager/src'
];

// Only the primary tree is measured by default. The port cites `win63_version` and PRODUCTION for
// *names*, not member-by-member, so nearly every member there reads as a gap — and worse, the same
// class is counted once per tree: RoomEngine appeared three times in the first run, as
// `_SafeCls_90.as`, `class_34.as` and `RoomEngine.as`, tripling both the denominator and the noise.
const PRIMARY_TREE = 'sources/WIN63-202607011411-782849652/';

const argv = process.argv.slice(2);
const LIST = argv.includes('--list');
const WITH_PRIVATE = argv.includes('--private');
const ALL_TREES = argv.includes('--all-trees');
const TOP = (() =>
{
    const at = argv.indexOf('--top');

    return at >= 0 && argv[at + 1] !== undefined ? Number(argv[at + 1]) : 15;
})();
const FILTERS = argv.filter((arg, index) => !arg.startsWith('--') && argv[index - 1] !== '--top');

// ---------------------------------------------------------------------------------------------
// AS3 member extraction
//
// `declares()` in audit-as3-traces.mjs is a word-boundary test over the whole file — deliberately
// lenient, because it only has to confirm a citation is plausible. Enumerating declarations needs
// the opposite, so this is a real (if regex-based) parser rather than a reuse of that helper.
// ---------------------------------------------------------------------------------------------

const BLOCK_COMMENT = /\/\*[\s\S]*?\*\//g;

// Anchoring at start-of-line with a strict modifier set is what keeps commented-out declarations
// out: `// public function x()` and asdoc's ` * public function x()` both fail the anchor. Block
// comments are stripped first because they can contain a genuinely line-anchored declaration.
const MODIFIERS = '(?:(?:public|private|protected|internal|static|final|override|native)[ \\t]+)*';
const FUNCTION_RE = new RegExp(`^[ \\t]*(${MODIFIERS})function[ \\t]+(?:(get|set)[ \\t]+)?([A-Za-z_$][\\w$]*)[ \\t]*\\(`, 'gm');

// A field must carry an explicit modifier — `+` here, not the `*` the function rule uses. A
// decompiled method body is full of line-anchored `var _loc3_:int`, and with `*` those matched:
// `_SafeCls_90.as` (RoomEngine) read as 581 fields, 518 of them locals, against 63 real ones.
const FIELD_MODIFIERS = '(?:(?:public|private|protected|internal|static|final)[ \\t]+)+';
const FIELD_RE = new RegExp(`^[ \\t]*(${FIELD_MODIFIERS})(?:var|const)[ \\t]+([A-Za-z_$][\\w$]*)[ \\t]*:`, 'gm');
const TYPE_RE = /\b(?:class|interface)[ \t]+([A-Za-z_$][\w$]*)/;

// The obfuscator's own naming. These can never be cited by name — the traceability rule requires a
// real member name in a trace — so they are counted apart rather than reported as gaps.
const OBFUSCATED_RE = /^_Safe[A-Za-z]*_\d+$/;

function visibilityOf(modifiers, isInterface)
{
    if(/\bprivate\b/.test(modifiers)) return 'private';
    if(/\bprotected\b/.test(modifiers)) return 'protected';
    if(/\binternal\b/.test(modifiers)) return 'internal';
    if(/\bpublic\b/.test(modifiers)) return 'public';

    // An interface member carries no modifier and is public by definition. A bare `function` in a
    // class is package-internal.
    return isInterface ? 'public' : 'internal';
}

function extractMembers(source)
{
    const stripped = source.replace(BLOCK_COMMENT, '');
    const typeMatch = stripped.match(TYPE_RE);
    const typeName = typeMatch ? typeMatch[1] : null;
    const isInterface = /\binterface[ \t]+[A-Za-z_$]/.test(stripped);
    const members = [];

    for(const match of stripped.matchAll(FUNCTION_RE))
    {
        const [, modifiers, accessor, name] = match;

        members.push({
            name,
            accessor: accessor ?? null,
            kind: 'function',
            visibility: visibilityOf(modifiers, isInterface),
            isConstructor: name === typeName
        });
    }

    for(const match of stripped.matchAll(FIELD_RE))
    {
        const [, modifiers, name] = match;

        members.push({
            name,
            accessor: null,
            kind: 'field',
            visibility: visibilityOf(modifiers, isInterface),
            isConstructor: false
        });
    }

    return { typeName, isInterface, members };
}

// ---------------------------------------------------------------------------------------------
// Citation index: AS3 path -> the set of member names the port cites in it
// ---------------------------------------------------------------------------------------------

// Same shape as audit-as3-traces.mjs's REF, so the two scripts agree on what a citation is.
const REF = /(sources\/[A-Za-z0-9_\-.]+\/[^\s)'"`,;]*?\.as)(?:::((?:get |set )?[A-Za-z_][A-Za-z0-9_]*(?:\(\))?))?/g;

// Half the port writes its member traces short — `// AS3: TalentTrackController.as::createWindow()`
// — with the full primary path given once in the file's own header `@see`. Reading only the long
// form counted every one of those files as "cited at file level only", i.e. unmeasurable: all six
// talent controllers, 182 member traces between them, read as a blank. So a short citation is
// resolved against the full paths the *same file* cites, by basename. Same-file only, deliberately:
// a repo-wide basename map would bind `IHabboTalent.as` to whichever tree happened to be indexed
// first, and a wrong binding here silently mis-attributes gaps.
const SHORT_REF = /AS3:\s*([A-Za-z0-9_]+\.as)::((?:get |set )?[A-Za-z_][A-Za-z0-9_]*(?:\(\))?)/g;

function collectFiles(dir, ext, out)
{
    for(const entry of readdirSync(dir))
    {
        const path = join(dir, entry);

        if(statSync(path).isDirectory())
        {
            if(entry !== 'dist' && entry !== 'node_modules') collectFiles(path, ext, out);
        }
        else if(path.endsWith(ext))
        {
            out.push(path);
        }
    }

    return out;
}

function buildCitationIndex()
{
    const tsFiles = [];

    for(const root of SRC_ROOTS)
    {
        const abs = join(ROOT, root);

        if(existsSync(abs)) collectFiles(abs, '.ts', tsFiles);
    }

    indexTsByBasename(tsFiles);

    // path -> { cited: Set<name>, citedBy: Set<ts file> }
    const index = new Map();

    for(const file of tsFiles)
    {
        const source = readFileSync(file, 'utf8');
        const byBasename = new Map();
        const cites = [];

        for(const match of source.matchAll(REF))
        {
            const [, path, member] = match;

            byBasename.set(path.slice(path.lastIndexOf('/') + 1), path);
            cites.push([path, member]);
        }

        for(const [, short, member] of source.matchAll(SHORT_REF))
        {
            const path = byBasename.get(short);

            if(path !== undefined) cites.push([path, member]);
        }

        for(const [path, member] of cites)
        {
            let entry = index.get(path);

            if(entry === undefined)
            {
                entry = { cited: new Set(), citedBy: new Set() };
                index.set(path, entry);
            }

            entry.citedBy.add(relative(ROOT, file));

            if(member === undefined) continue;

            // `::get foo()` and `::foo()` both cover `foo`. Keeping only the bare name is the
            // lenient reading: a TS accessor is frequently traced without the `get `, and
            // reporting those as gaps would bury the real ones.
            entry.cited.add(member.replace(/^(get|set)\s+/, '').replace(/\(\)$/, '').trim());
        }
    }

    return index;
}

// ---------------------------------------------------------------------------------------------
// "Uncited" is two different findings, and they need different work
//
// `IMAGE_QUERY_SCALE` is declared in RoomObjectVariableEnum.as, is declared in the TS that ports
// it, and carries no trace. Reporting that next to a member the port never wrote at all makes the
// worklist useless. So each gap is checked against the TS files that cite the AS3 file: present
// there means a traceability gap (cheap to fix), absent means a port gap (the real worklist).
//
// This leans on the port keeping the AS3 name for readable members, which is the convention here.
// A member the port deliberately renamed reads as a port gap and is a false positive — one more
// reason a line of output is a worklist entry, not a verdict.
// ---------------------------------------------------------------------------------------------

// A second place to look, and the reason it is needed: `IRoomObjectSprite.ts` ports
// `IRoomObjectSprite.as` faithfully and carries no `AS3:` citation at all, so it was invisible to
// the citing-files check and all 30 of its members read as "absent from the TS". Searching only
// the citers assumes the port lives where the traces are; an untraced sibling breaks that.
//
// The widening is deliberately narrow — a TS file whose basename equals the AS3 *type* name. That
// only fires for readable names, which is right: for `_SafeCls_90.as` nothing but the trace links
// the file to `RoomEngine.ts`, so there is no sibling to find and the citers stay the only source.
const tsByBase = new Map();

function indexTsByBasename(tsFiles)
{
    for(const file of tsFiles)
    {
        const key = basename(file, '.ts');

        if(!tsByBase.has(key)) tsByBase.set(key, []);
        tsByBase.get(key).push(relative(ROOT, file));
    }
}

const tsBodies = new Map();

function tsBody(tsFile)
{
    let body = tsBodies.get(tsFile);

    if(body === undefined)
    {
        const abs = join(ROOT, tsFile);

        body = existsSync(abs) ? readFileSync(abs, 'utf8') : '';
        tsBodies.set(tsFile, body);
    }

    return body;
}

// The path aliases both packages declare, so an `extends` can be followed across them.
const ALIASES =
{
    '@core/': 'packages/vortex-engine/src/core/',
    '@habbo/': 'packages/vortex-engine/src/habbo/',
    '@room/': 'packages/vortex-engine/src/room/',
    '@iid/': 'packages/vortex-engine/src/iid/',
    '@ui/': 'packages/vortex-client/src/ui/'
};

function resolveImport(fromFile, spec)
{
    let path = null;

    for(const [alias, target] of Object.entries(ALIASES))
    {
        if(spec.startsWith(alias)) { path = target + spec.slice(alias.length); break; }
    }

    if(path === null && spec.startsWith('.')) path = join(dirname(fromFile), spec).split('\\').join('/');

    if(path === null) return null;

    for(const candidate of [`${path}.ts`, `${path}/index.ts`])
    {
        if(existsSync(join(ROOT, candidate))) return candidate;
    }

    return null;
}

// AS3 has no shared base for composers and parsers, so every one of them re-declares `dispose()`
// and `get disposed()`; this port declares both once on `MessageComposer`/`MessageEvent` and the
// 200-odd subclasses inherit them. Searching only the file itself counted all of those as absent —
// 234 of 449 gaps on the 2026-08-26 run, over half the worklist, none of them a real gap. So a
// member not found in the file is looked for up the `extends` chain, which is what "does the port
// have this member" actually means for an instance. Capped at four hops: deeper than that and a
// coincidental name match up a long chain is likelier than a real inheritance.
function tsDeclares(tsFile, name, depth = 0)
{
    const body = tsBody(tsFile);

    if(new RegExp(`\\b${name}\\b`).test(body)) return true;

    if(depth >= 4) return false;

    const extendsMatch = body.match(/\bclass\s+\w+(?:<[^>]*>)?\s+extends\s+(\w+)/);

    if(extendsMatch === null) return false;

    const base = extendsMatch[1];
    const importMatch = body.match(new RegExp(`import\\s*(?:type\\s*)?\\{[^}]*\\b${base}\\b[^}]*\\}\\s*from\\s*['"]([^'"]+)['"]`));

    if(importMatch === null) return false;

    const baseFile = resolveImport(tsFile.split('\\').join('/'), importMatch[1]);

    return baseFile === null ? false : tsDeclares(baseFile, name, depth + 1);
}

function main()
{
    const index = buildCitationIndex();
    const report = [];
    const totals =
    {
        files: 0,
        declared: 0,
        covered: 0,
        traceOnlyPublic: 0,
        traceOnlyPrivate: 0,
        missingPublic: 0,
        missingPrivate: 0,
        obfuscated: 0,
        constructors: 0,
        unreadable: 0,
        otherTrees: 0,
        fileLevelOnly: 0,
        fileLevelMembers: 0
    };

    for(const [path, entry] of index)
    {
        if(!ALL_TREES && !path.startsWith(PRIMARY_TREE)) { totals.otherTrees++; continue; }

        if(FILTERS.length > 0 && !FILTERS.some((filter) => path.includes(filter))) continue;

        const abs = join(ROOT, path);

        // Broken citations are audit-as3-traces.mjs's job — counted here, not re-reported.
        if(!existsSync(abs)) { totals.unreadable++; continue; }

        const { typeName, members } = extractMembers(readFileSync(abs, 'utf8'));
        const gaps = [];

        // Two populations, and mixing them destroys the number. 68% of cited primary-tree files
        // carry no `::member` trace at all — the port references them once at file level and never
        // per-member. Counting those as 100% uncovered is arithmetically true and analytically
        // useless: it says nothing about whether the class is ported, only that
        // .claude/rules/30-as3-traceability.md was not applied at member level there. That is a
        // real finding, but a different one, so it gets its own line rather than the denominator.
        if(entry.cited.size === 0)
        {
            totals.fileLevelOnly++;
            totals.fileLevelMembers += members.filter((member) => !member.isConstructor && !OBFUSCATED_RE.test(member.name)).length;
            continue;
        }

        totals.files++;

        for(const member of members)
        {
            if(member.isConstructor) { totals.constructors++; continue; }

            if(OBFUSCATED_RE.test(member.name)) { totals.obfuscated++; continue; }

            totals.declared++;

            if(entry.cited.has(member.name)) { totals.covered++; continue; }

            const isPrivate = member.visibility === 'private';
            const searchIn = [...entry.citedBy, ...(typeName ? tsByBase.get(typeName) ?? [] : [])];
            const inTypeScript = searchIn.some((tsFile) => tsDeclares(tsFile, member.name));

            member.inTypeScript = inTypeScript;

            if(inTypeScript)
            {
                if(isPrivate) totals.traceOnlyPrivate++;
                else totals.traceOnlyPublic++;
            }
            else if(isPrivate) totals.missingPrivate++;
            else totals.missingPublic++;

            gaps.push(member);
        }

        const missingPublic = gaps.filter((member) => member.visibility !== 'private' && !member.inTypeScript);

        if(gaps.length > 0) report.push({ path, typeName, gaps, missingPublic, entry });
    }

    report.sort((a, b) => b.missingPublic.length - a.missingPublic.length || b.gaps.length - a.gaps.length);

    const pct = (part, whole) => whole === 0 ? '—' : `${Math.round((part / whole) * 1000) / 10}%`;

    console.log('Couverture membre AS3 → TS');
    if(FILTERS.length > 0) console.log(`filtre                            : ${FILTERS.join(' ')}`);
    console.log('');
    console.log('MESURABLE — fichiers portés avec au moins une trace ::membre');
    console.log(`  fichiers AS3                    : ${totals.files}`);
    console.log(`  membres déclarés (nom lisible)  : ${totals.declared}`);
    console.log(`    couverts par une trace        : ${totals.covered}  (${pct(totals.covered, totals.declared)})`);
    console.log('');
    console.log('    ABSENTS du TS  — le vrai manque');
    console.log(`      public/protected            : ${totals.missingPublic}   <- la worklist`);
    console.log(`      private                     : ${totals.missingPrivate}   (souvent replié dans l'appelant)`);
    console.log('    PRÉSENTS dans le TS, non tracés');
    console.log(`      public/protected            : ${totals.traceOnlyPublic}   (règle 30-as3-traceability)`);
    console.log(`      private                     : ${totals.traceOnlyPrivate}`);
    console.log('');
    console.log('NON MESURABLE — fichiers cités au niveau fichier seul');
    console.log(`  fichiers AS3                    : ${totals.fileLevelOnly}`);
    console.log(`  membres hors mesure             : ${totals.fileLevelMembers}`);
    console.log('  → leur TS ne trace aucun membre : règle 30-as3-traceability non appliquée là,');
    console.log('    donc on ne peut pas dire si la classe est portée ou seulement référencée.');
    console.log('');
    console.log(`membres au nom obfusqué          : ${totals.obfuscated}  (non citables par nom, jamais comptés comme manques)`);
    console.log(`constructeurs                     : ${totals.constructors}  (ignorés)`);
    console.log(`citations vers un fichier absent  : ${totals.unreadable}  (voir audit-as3-traces.mjs)`);
    if(!ALL_TREES) console.log(`fichiers hors arbre primaire      : ${totals.otherTrees}  (ignorés — \`--all-trees\` pour les inclure)`);

    const shown = TOP === 0 ? report : report.slice(0, TOP);

    if(shown.length > 0)
    {
        console.log(`\n--- ${shown.length} fichier(s) sur ${report.length}, par membres ABSENTS du TS ---`);

        for(const item of shown)
        {
            const name = item.typeName ?? basename(item.path, '.as');

            console.log(`\n  ${item.missingPublic.length} absents / ${item.gaps.length} sans trace  ${item.path}  (${name})`);
            console.log(`      porté par : ${[...item.entry.citedBy].join(', ')}`);

            if(!LIST) continue;

            for(const member of item.gaps)
            {
                if(member.visibility === 'private' && !WITH_PRIVATE) continue;

                const accessor = member.accessor ? `${member.accessor} ` : '';
                const mark = member.inTypeScript ? 'non tracé' : 'ABSENT   ';

                console.log(`      · ${mark}  ${member.visibility.padEnd(9)} ${accessor}${member.name}`);
            }
        }
    }

    console.log('\nUn manque est une entrée de worklist, pas un verdict — lire le corps AS3 avant de porter.');

    // A measurement, not a gate: it must stay runnable while the numbers are large.
    process.exitCode = 0;
}

main();
