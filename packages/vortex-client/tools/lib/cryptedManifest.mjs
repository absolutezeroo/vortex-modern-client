// Shared name-resolution core for the `import-crypted-*.mjs` tools.
//
// sources/WIN63-202607011411-782849652's *Com.as manifests (src/binaryData/*Com.as) are the
// only authoritative source for the true (runtime) name of every embedded asset - the
// field identifier itself, used verbatim by assets.getAssetByName(...). Neither the
// win63_2023 XML's own internal <layout name="...">/<skin name="..."> label nor the
// embed's own Flex-generated linkage name (e.g. "ae_tabs_effects_png$<hash>") can be
// trusted for naming - only the *Com.as field can. See docs/architectures if present, or
// the git history of this file's introduction, for the full chain of evidence.
//
// Two things in the obfuscated tree are NOT scrambled:
//   1) Every *Com.as file declares `public static var <fieldName>:Class = <refClass>;` -
//      fieldName is the real, unobfuscated lookup key.
//   2) Wherever <refClass> is itself scrambled to `_SafeCls_NNN`, some other .as file in
//      the tree carries a `@identifier _SafeCls_NNN = "realName_<type>$hash-num"` comment
//      left behind by the obfuscator, recovering the original embed identifier.
// Cross-referencing both gives an authoritative name for every asset the real client
// knows about, for any embed type (image, xml layout, xml skin, sound, font).
import fs from 'node:fs';
import path from 'node:path';

// AS3 identifiers may contain `$` (Flex embed-generated names like `foo_png$<hash>` are
// common *direct*, non-obfuscated refClass values) - `\w` alone misses those and silently
// drops the whole field, so the value group must allow `$` too.
const FIELD_RE = /public\s+static\s+(?:var|const)\s+(\w+)\s*:\s*Class\s*=\s*([\w$]+)\s*;/g;
const IDENTIFIER_RE = /@identifier\s+(\S+)\s*=\s*"([^"]+)"/g;
const TYPE_SUFFIX_RE = /_(png|gif|jpg|swf|mp3|ttf|xml)\$/;

export function findAsFiles(dir)
{
    const result = [];
    const stack = [dir];

    while(stack.length > 0)
    {
        const current = stack.pop();
        const entries = fs.readdirSync(current, {withFileTypes: true});

        for(const entry of entries)
        {
            const fullPath = path.join(current, entry.name);

            if(entry.isDirectory()) stack.push(fullPath);
            else if(entry.isFile() && entry.name.endsWith('.as')) result.push(fullPath);
        }
    }

    return result;
}

export function findComFiles(dir)
{
    return fs.readdirSync(dir, {withFileTypes: true})
        .filter((entry) => entry.isFile() && /Com\.as$/.test(entry.name))
        .map((entry) => path.join(dir, entry.name));
}

// Strips a trailing "_<type>$<hash>" (or bare "_<type>") to recover the embed's own
// clean linkage name - e.g. "ae_tabs_effects_png$<hash>" -> "ae_tabs_effects". This is
// NOT the true runtime name (see module doc comment) - only useful for correlating a raw
// dump filename/refClass back to a single embed across obfuscation renames.
export function stripTypeSuffix(rawName)
{
    const match = TYPE_SUFFIX_RE.exec(rawName);

    if(match) return rawName.slice(0, match.index);

    const bareMatch = /_(png|gif|jpg|swf|mp3|ttf|xml)$/i.exec(rawName);

    return bareMatch ? rawName.slice(0, bareMatch.index) : rawName;
}

export function buildObfuscatedNameMap(asFiles)
{
    const map = new Map();

    for(const asFile of asFiles)
    {
        const content = fs.readFileSync(asFile, 'utf8');
        let match;

        while((match = IDENTIFIER_RE.exec(content)) !== null)
        {
            const [, scrambledName, rawValue] = match;

            if(map.has(scrambledName) && map.get(scrambledName) !== rawValue) continue;

            map.set(scrambledName, rawValue);
        }
    }

    return map;
}

// Builds embedShortName -> Set(true field names) across every *Com.as manifest. One
// embed can be declared under more than one field (the same bitmap/layout/skin reused
// under several logical identities across modules).
export function buildEmbedToFieldNames(comFiles, obfuscatedNameMap)
{
    const embedToFieldNames = new Map();

    for(const comFile of comFiles)
    {
        const content = fs.readFileSync(comFile, 'utf8');
        let match;

        while((match = FIELD_RE.exec(content)) !== null)
        {
            const [, fieldName, refClass] = match;

            let rawValue = null;

            if(/_(png|gif|jpg|swf|mp3|ttf|xml)\$/.test(refClass)) rawValue = refClass;
            else if(obfuscatedNameMap.has(refClass)) rawValue = obfuscatedNameMap.get(refClass);

            if(!rawValue) continue;

            const embedShortName = stripTypeSuffix(rawValue);

            if(!embedToFieldNames.has(embedShortName)) embedToFieldNames.set(embedShortName, new Set());

            embedToFieldNames.get(embedShortName).add(fieldName);
        }
    }

    return embedToFieldNames;
}

// Builds true field name -> Set(full embed linkage names, hash included) across every
// *Com.as manifest.
//
// This is the same walk as buildEmbedToFieldNames() but keyed the other way round and,
// crucially, WITHOUT collapsing the linkage name to its short form. Two embeds can share
// a short name and hold completely different pixels - `move_0_png$15bdb80d...` (the
// volter wired arrow) and `move_0_png$0ecb60e7...` (the illumina one) both strip to
// `move_0`, so a short-name join picks whichever the caller happened to enumerate first
// and silently ships one style's icon under the other style's name. There are 100 such
// collisions in src/images alone. Join on the whole linkage name and the ambiguity is
// gone (9 field names genuinely map to more than one embed; callers pick the first that
// has pixel data).
export function buildFieldNameToLinkages(comFiles, obfuscatedNameMap)
{
    const fieldNameToLinkages = new Map();

    for(const comFile of comFiles)
    {
        const content = fs.readFileSync(comFile, 'utf8');
        let match;

        while((match = FIELD_RE.exec(content)) !== null)
        {
            const [, fieldName, refClass] = match;

            let rawValue = null;

            if(/_(png|gif|jpg|swf|mp3|ttf|xml)\$/.test(refClass)) rawValue = refClass;
            else if(obfuscatedNameMap.has(refClass)) rawValue = obfuscatedNameMap.get(refClass);

            if(!rawValue) continue;

            if(!fieldNameToLinkages.has(fieldName)) fieldNameToLinkages.set(fieldName, new Set());

            fieldNameToLinkages.get(fieldName).add(rawValue);
        }
    }

    return fieldNameToLinkages;
}

/**
 * Computes the full crypted-tree name-resolution manifest once.
 *
 * @param {string} cryptedRoot - absolute path to sources/WIN63-202607011411-782849652
 * @returns {{obfuscatedNameMap: Map<string,string>, embedToFieldNames: Map<string,Set<string>>, fieldNameToLinkages: Map<string,Set<string>>}}
 */
export function loadCryptedManifest(cryptedRoot)
{
    const cryptedSrc = path.join(cryptedRoot, 'src');
    const binaryDataDir = path.join(cryptedSrc, 'binaryData');

    const asFiles = findAsFiles(cryptedSrc);
    const obfuscatedNameMap = buildObfuscatedNameMap(asFiles);

    const comFiles = findComFiles(binaryDataDir);
    const embedToFieldNames = buildEmbedToFieldNames(comFiles, obfuscatedNameMap);
    const fieldNameToLinkages = buildFieldNameToLinkages(comFiles, obfuscatedNameMap);

    return {
        obfuscatedNameMap,
        embedToFieldNames,
        fieldNameToLinkages,
        asFileCount: asFiles.length,
        comFileCount: comFiles.length
    };
}

// Raw dump filenames (both src/images and src/layouts) look like "<id>_<rest>.<ext>",
// where <rest> is either a direct "name_<type>$hash" embed identifier or an obfuscated
// "_SafeCls_NNN" needing the same @identifier resolution used for *Com.as refClass
// values. Resolves one raw dump filename to its embedShortName, or null if unresolvable.
export function resolveRawFileName(fileName, obfuscatedNameMap)
{
    const rawValue = resolveRawLinkageName(fileName, obfuscatedNameMap);

    return rawValue ? stripTypeSuffix(rawValue) : null;
}

// Same resolution as resolveRawFileName(), stopping one step earlier: returns the embed's
// WHOLE linkage name ("move_0_png$0ecb60e7...", hash included) instead of its short form.
// That is what buildFieldNameToLinkages() joins against - see its comment for why the
// short form is not safe to join on.
export function resolveRawLinkageName(fileName, obfuscatedNameMap)
{
    const match = /^\d+_(.+)\.\w+$/i.exec(fileName);

    if(!match) return null;

    const stem = match[1];

    return /_(png|gif|jpg|swf|mp3|ttf|xml)\$/.test(stem) ? stem : (obfuscatedNameMap.get(stem) ?? null);
}
