// Registry of every script under tools/, for the local dashboard (server.ts).
// Each entry maps directly onto a pnpm script in package.json - see that file's
// "scripts" block for the canonical CLI invocations this mirrors. Every directory a
// script reads from or writes to is exposed here as a `path` option, pre-filled with
// that script's own real default (see its DEFAULT_*/parseArgs()) - never a value invented
// for this dashboard - so the wizard always shows what will actually run, and nothing is
// hardcoded past what the user can see and override.
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const TOOLS_DIR = path.resolve(__dirname, '..');
const CLIENT_DIR = path.resolve(TOOLS_DIR, '..');
const REPO_ROOT = path.resolve(CLIENT_DIR, '..', '..');

const SRC_ASSETS = path.join(CLIENT_DIR, 'src', 'assets');
const WIN63_2026_CRYPTED_ROOT = path.join(REPO_ROOT, 'sources', 'WIN63-202607011411-782849652');

export interface FlagOption {
    readonly key: string;
    readonly type: 'flag';
    readonly label: string;
    readonly flag: string;
    readonly default: boolean;
}

export interface TextOption {
    readonly key: string;
    readonly type: 'text';
    readonly label: string;
    readonly flag: string;
    readonly placeholder?: string;
}

export interface PathOption {
    readonly key: string;
    readonly type: 'path';
    readonly label: string;
    readonly flag: string;
    readonly default: string;
    // 'input': must already exist and contain real files - nobody's fork of this repo ships
    // sources/ (gitignored), so this is never guaranteed to exist and the wizard must say
    // so plainly instead of letting the script crash. 'output': fine if missing, the script
    // creates it.
    readonly kind: 'input' | 'output';
}

export interface SelectChoice {
    readonly label: string;
    readonly flag: string | null;
}

export interface SelectOption {
    readonly key: string;
    readonly type: 'select';
    readonly label: string;
    readonly choices: readonly SelectChoice[];
}

export type ToolOption = FlagOption | TextOption | PathOption | SelectOption;

export interface ToolDefinition {
    readonly id: string;
    readonly label: string;
    readonly description: string;
    readonly script: string;
    readonly options: readonly ToolOption[];
}

export interface InstallStep {
    readonly id: string;
    readonly title: string;
    readonly description: string;
    readonly kind: 'source-folder' | 'run-tool';
    readonly toolId?: string;
    // Which of the tool's own path-option keys receives the folder chosen at the
    // 'source-folder' step, optionally joined with sourceFolderSubpath - e.g.
    // import-crypted-images's 'crypted-root' takes the chosen root as-is, but
    // organize-binary-layouts's 'input' needs '<root>/src/layouts' specifically (the flat
    // raw XML dump lives one level deeper there).
    readonly sourceFolderOptionKey?: string;
    readonly sourceFolderSubpath?: readonly string[];
    // Forces an option's value for this step, regardless of that tool's own standalone
    // default (e.g. organize-binary-layouts defaults its --dry-run checkbox to checked when
    // run on its own, for safety - the installer needs it to actually sort files).
    readonly overrides?: Readonly<Record<string, string | boolean>>;
}

const writeFlag = (): FlagOption => (
    {
        key: 'write',
        type: 'flag',
        label: '--write (sinon dry-run)',
        flag: '--write',
        default: false
    });

const filterOption = (placeholder: string): TextOption => (
    {
        key: 'filter',
        type: 'text',
        label: 'Filtre (--filter)',
        flag: '--filter',
        placeholder
    });

const inputPath = (key: string, label: string, flag: string, defaultValue: string): PathOption => (
    {
        key,
        type: 'path',
        label,
        flag,
        default: defaultValue,
        kind: 'input'
    });

const outputPath = (key: string, label: string, flag: string, defaultValue: string): PathOption => (
    {
        key,
        type: 'path',
        label,
        flag,
        default: defaultValue,
        kind: 'output'
    });

export const TOOLS: readonly ToolDefinition[] = [
    {
        id: 'bundle-assets',
        label: 'Bundle assets',
        description: 'Empaquette les assets en .bundle. Tourne aussi automatiquement avant dev/build.',
        script: 'bundle-assets.mjs',
        options: [
            inputPath('input', 'Dossier assets source (--input)', '--input', SRC_ASSETS),
            outputPath('output', 'Dossier de sortie (--output)', '--output', path.join(CLIENT_DIR, 'public'))
        ]
    },
    {
        id: 'asset-manifest',
        label: 'Build asset name manifest',
        description: 'Reconstruit uid-to-name-manifest.json depuis un checkout de vortex-client, pour resoudre les vrais noms d\'assets win63.',
        script: 'build-asset-name-manifest.mjs',
        options: [
            inputPath('vortex-root', 'Checkout vortex-client (--vortex-root)', '--vortex-root', path.resolve(REPO_ROOT, '..', 'vortex-client'))
        ]
    },
    {
        id: 'compile-window-layouts',
        label: 'Compile window layouts',
        description: 'Compile un dossier de layouts XML organises en JSON.',
        script: 'compile-window-layouts.mjs',
        options: [
            inputPath('input', 'Dossier XML source (--input)', '--input', path.join(WIN63_2026_CRYPTED_ROOT, 'binaryDataXml_organized', 'layouts')),
            outputPath('out', 'Dossier de sortie (--out)', '--out', path.join(SRC_ASSETS, 'window-layouts')),
            filterOption('ex: chat_bubble')
        ]
    },
    {
        id: 'compile-window-skins',
        label: 'Compile window skins',
        description: 'Compile un dossier de skins XML organises en JSON.',
        script: 'compile-window-skins.mjs',
        options: [
            inputPath('input', 'Dossier XML source (--input)', '--input', path.join(WIN63_2026_CRYPTED_ROOT, 'binaryDataXml_organized', 'skins')),
            outputPath('out', 'Dossier de sortie (--out)', '--out', path.join(SRC_ASSETS, 'window-skins')),
            filterOption('ex: habbo_skin_header')
        ]
    },
    {
        id: 'organize-binary-layouts',
        label: 'Organize binary layout XML',
        description: 'Trie un dump brut binaryDataXml en layouts/skins/non-layouts.',
        script: 'organize-binary-layout-xml.mjs',
        options: [
            inputPath('input', 'Dump brut source (--input)', '--input', path.join(WIN63_2026_CRYPTED_ROOT, 'src', 'layouts')),
            outputPath('out', 'Sortie layouts (--out)', '--out', path.join(WIN63_2026_CRYPTED_ROOT, 'binaryDataXml_organized', 'layouts')),
            outputPath('skins-out', 'Sortie skins (--skins-out)', '--skins-out', path.join(WIN63_2026_CRYPTED_ROOT, 'binaryDataXml_organized', 'skins')),
            outputPath('bad-out', 'Sortie rejets (--bad-out)', '--bad-out', path.join(WIN63_2026_CRYPTED_ROOT, 'binaryDataXml_organized', 'non-layouts')),
            filterOption('ex: club_center'),
            {key: 'move', type: 'flag', label: '--move (deplacer au lieu de copier)', flag: '--move', default: false},
            {key: 'dryRun', type: 'flag', label: '--dry-run (previsualiser)', flag: '--dry-run', default: true},
            {key: 'anyLayout', type: 'flag', label: '--any-layout', flag: '--any-layout', default: false},
            {key: 'quiet', type: 'flag', label: '--quiet', flag: '--quiet', default: false},
            {
                key: 'clean',
                type: 'select',
                label: 'Nettoyage de sortie',
                choices: [
                    {label: 'Par defaut', flag: null},
                    {label: '--clean', flag: '--clean'},
                    {label: '--no-clean', flag: '--no-clean'}
                ]
            }
        ]
    },
    {
        id: 'import-crypted-images',
        label: 'Import crypted images',
        description: 'Stage 2 - complete le dossier d\'images depuis le dump crypted win63_2026 (additif, jamais d\'ecrasement).',
        script: 'import-crypted-images.mjs',
        options: [
            inputPath('crypted-root', 'Dump crypted win63_2026 (--crypted-root)', '--crypted-root', WIN63_2026_CRYPTED_ROOT),
            inputPath('layouts-dir', 'Layouts compiles, pour les refs asset_uri (--layouts-dir)', '--layouts-dir', path.join(SRC_ASSETS, 'window-layouts')),
            inputPath('skins-dir', 'Skins compiles, pour les refs asset_uri (--skins-dir)', '--skins-dir', path.join(SRC_ASSETS, 'window-skins')),
            outputPath('images-dir', 'Dossier images de sortie (--images-dir)', '--images-dir', path.join(SRC_ASSETS, 'images')),
            writeFlag()
        ]
    },
    {
        id: 'import-crypted-layouts',
        label: 'Import crypted layouts',
        description: 'Stage 2 - complete les layouts compiles depuis le dump crypted win63_2026 (additif).',
        script: 'import-crypted-layouts.mjs',
        options: [
            inputPath('crypted-root', 'Dump crypted win63_2026 (--crypted-root)', '--crypted-root', WIN63_2026_CRYPTED_ROOT),
            outputPath('out', 'Dossier de sortie (--out)', '--out', path.join(SRC_ASSETS, 'window-layouts')),
            writeFlag()
        ]
    },
    {
        id: 'import-crypted-skins',
        label: 'Import crypted skins',
        description: 'Stage 2 - complete les skins compiles depuis le dump crypted win63_2026 (additif).',
        script: 'import-crypted-skins.mjs',
        options: [
            inputPath('crypted-root', 'Dump crypted win63_2026 (--crypted-root)', '--crypted-root', WIN63_2026_CRYPTED_ROOT),
            outputPath('out', 'Dossier de sortie (--out)', '--out', path.join(SRC_ASSETS, 'window-skins')),
            writeFlag()
        ]
    }
];

// The mandatory, linear install sequence - this IS the dashboard's only flow. No tool/
// pipeline picker: every fork's sources/ is empty (gitignored), so step 1 is always
// "tell me where you put your own Habbo dump", then every later step runs automatically
// against it, in this fixed order, with no alternative path.
export const INSTALL_STEPS: readonly InstallStep[] = [
    {
        id: 'source',
        kind: 'source-folder',
        title: 'Dossier source Habbo',
        description: 'Ce depot ne contient aucun fichier Habbo (sources/ est ignore par git). Recupere toi-meme un dump XML/images d\'un client Habbo (type WIN63-202607011411-782849652) et choisis ici le dossier racine ou tu l\'as place.'
    },
    {
        id: 'sort',
        kind: 'run-tool',
        toolId: 'organize-binary-layouts',
        sourceFolderOptionKey: 'input',
        sourceFolderSubpath: ['src', 'layouts'],
        overrides: {dryRun: false},
        title: 'Trier le dump',
        description: 'Separe le dump brut (melange) en layouts / skins / non-layouts.'
    },
    {
        id: 'layouts',
        kind: 'run-tool',
        toolId: 'compile-window-layouts',
        title: 'Compiler les layouts',
        description: 'Compile les layouts tries a l\'etape precedente en JSON.'
    },
    {
        id: 'skins',
        kind: 'run-tool',
        toolId: 'compile-window-skins',
        title: 'Compiler les skins',
        description: 'Compile les skins tries a l\'etape precedente en JSON.'
    },
    {
        id: 'images',
        kind: 'run-tool',
        toolId: 'import-crypted-images',
        sourceFolderOptionKey: 'crypted-root',
        overrides: {write: true},
        title: 'Completer les images',
        description: 'Ajoute les images encore manquantes referencees par les layouts/skins compiles.'
    },
    {
        id: 'import-layouts',
        kind: 'run-tool',
        toolId: 'import-crypted-layouts',
        sourceFolderOptionKey: 'crypted-root',
        overrides: {write: true},
        title: 'Completer les layouts',
        description: 'Ajoute les layouts presents dans le dump brut mais pas encore compiles.'
    },
    {
        id: 'import-skins',
        kind: 'run-tool',
        toolId: 'import-crypted-skins',
        sourceFolderOptionKey: 'crypted-root',
        overrides: {write: true},
        title: 'Completer les skins',
        description: 'Ajoute les skins presents dans le dump brut mais pas encore compiles.'
    }
];

export function findTool(id: string): ToolDefinition | undefined {
    return TOOLS.find((tool) => tool.id === id);
}
