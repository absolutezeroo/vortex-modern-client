// habbo.com's own French strings, fetched from `images.habbo.com/habbo-web-l10n/fr.json` — the file
// its index shell loads. 1688 keys, and they settle every label on the site: the navigation is
// "Habbo Shopping" and "Les clés du jeu", not "Boutique" and "Jouer"; the community's rooms tab is
// "Apparts"; the home's tabs are "Quoi de neuf?" and "Messages privés". Every one of those was
// invented here before, and inventing them is exactly what a copy is not.
//
// The templates in sources/templates/ name their key in a `translate="…"` attribute, so a label is
// never a guess: find the element, read the key, look it up here.
//
// The whole file ships (about 40 KB gzipped). Pruning it to the keys in use would need a build step
// and would break the next person who adds a `t()` call for a key that was pruned away.
import fr from './fr.json';

/** What an interpolated key is given: `t('PROFILE_JOINED', {date: '12 mai 2025'})`. */
export type ITranslationValues = Record<string, string | number>;

export function t(key: string, values?: ITranslationValues): string
{
    // A key-presence test rather than a comparison against the value: the styleguide forbids
    // `| undefined` in an annotation, and an absent key is a question about the MAP, not about what
    // it holds — the same distinction as the port's own `hasString()` versus `getString()`.
    if(!Object.hasOwn(fr, key))
    {
        // A missing key is a porting mistake, not a runtime condition — show it rather than an empty
        // space, so it is visible on the page instead of silently blank.
        return key;
    }

    const template = (fr as Record<string, string>)[key];

    if(!values)
    {
        return template;
    }

    // habbo.com interpolates with `{{name}}` (angular-translate), e.g.
    // PROFILE_JOINED = "A rejoint Habbo le {{date}}".
    return template.replace(/\{\{\s*([a-zA-Z0-9_]+)\s*\}\}/g, (whole, name) =>
        (values[name] !== undefined ? String(values[name]) : whole));
}
