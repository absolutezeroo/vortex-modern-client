import {TradingNameScamDetectionResult} from './TradingNameScamDetectionResult';

/**
 * Decides whether one name is a lookalike of another — the check behind the trade window's
 * "this name resembles someone else's" warning.
 *
 * Two names match if they can be walked character by character allowing only: an exact match, a
 * *case-only* difference (up to MAX_CASE_CHANGES of them), a swap between characters that look
 * alike (`0`/`O`/`o`/`Ö`/`ö`, `1`/`l`/`I`/`!`, …, unlimited), or a skipped `.`/`,`/`:` on either
 * side (up to MAX_SMALL_PUNCTUATION_DEVIATIONS). A name containing anything outside the allowed
 * alphabet is never compared at all.
 *
 * **Class name DERIVED, not recovered**: the AS3 class is `_SafeCls_3934` and is obfuscated in
 * every available tree, including PRODUCTION — it postdates the 2016 build. Named here after what
 * it does and after the package it lives in.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/inventory/trading/namescam/_SafeCls_3934.as
 */
export class TradingNameScamDetector
{
    // AS3: .../_SafeCls_3934.as::MAX_CASE_CHANGES
    private static readonly MAX_CASE_CHANGES: number = 2;

    // AS3: .../_SafeCls_3934.as::MAX_SMALL_PUNCTUATION_DEVIATIONS
    private static readonly MAX_SMALL_PUNCTUATION_DEVIATIONS: number = 2;

    // AS3: .../_SafeCls_3934.as::ALLOWED_PUNCTUATION
    private static readonly ALLOWED_PUNCTUATION: string = '_-=?!@:.,;';

    // AS3: .../_SafeCls_3934.as::SMALL_PUNCTUATION
    private static readonly SMALL_PUNCTUATION: string = '.,:';

    // AS3: .../_SafeCls_3934.as::EXTRA_ALLOWED_LETTERS
    private static readonly EXTRA_ALLOWED_LETTERS: string = 'ÅÄÖåäöŞÇÜĞşçıüğ';

    // AS3: .../_SafeCls_3934.as::CONFUSABLE_GROUPS
    private static readonly CONFUSABLE_GROUPS: string[] = [
        '0OoÖö', '1lI!', '.,', ';:', 'AÅÄaåä', 'CÇcç', 'GĞgğ', 'SŞsş', 'UÜuü'
    ];

    // AS3: .../_SafeCls_3934.as::_confusableGroupByCharacter
    // Name DERIVED (`_SafeStr_7602`): the lazily-built character → group index.
    private static _confusableGroupByCharacter: Map<string, string> | null = null;

    // AS3: .../_SafeCls_3934.as::detect()
    static detect(name: string, roomNames: string[], friendNames: string[]): TradingNameScamDetectionResult
    {
        return new TradingNameScamDetectionResult(
            TradingNameScamDetector.collectMatchingNames(name, roomNames),
            TradingNameScamDetector.collectMatchingNames(name, friendNames)
        );
    }

    // AS3: .../_SafeCls_3934.as::isPotentialScamName()
    static isPotentialScamName(name: string | null, other: string | null): boolean
    {
        if(name === null || other === null) return false;

        if(name.length === 0 || other.length === 0 || name === other) return false;

        if(!TradingNameScamDetector.isAllowedName(name) || !TradingNameScamDetector.isAllowedName(other))
        {
            return false;
        }

        return TradingNameScamDetector.compareNames(name, other, 0, 0, 0, 0, new Map<string, boolean>());
    }

    // AS3: .../_SafeCls_3934.as::collectMatchingNames()
    // The `seen` set is AS3's: a name repeated in the list is compared once and listed once.
    private static collectMatchingNames(name: string | null, candidates: string[] | null): string[]
    {
        const matches: string[] = [];

        if(candidates === null || name === null || name.length === 0) return matches;

        const seen = new Set<string>();

        for(const candidate of candidates)
        {
            if(candidate === null || candidate.length === 0 || candidate === name) continue;

            if(seen.has(candidate)) continue;

            if(TradingNameScamDetector.isPotentialScamName(name, candidate))
            {
                seen.add(candidate);
                matches.push(candidate);
            }
        }

        return matches;
    }

    /**
     * AS3: .../_SafeCls_3934.as::compareNames()
     *
     * A memoised recursive walk over both names at once. `memo` is keyed by the whole position —
     * both indices and both deviation counts — because the same pair of indices can be reached
     * with different budgets spent and the answer differs.
     *
     * The two `> 2` tests in the dump are the constants above, inlined by the decompiler.
     */
    private static compareNames(
        name: string,
        other: string,
        nameIndex: number,
        otherIndex: number,
        punctuationDeviations: number,
        caseChanges: number,
        memo: Map<string, boolean>
    ): boolean
    {
        if(punctuationDeviations > TradingNameScamDetector.MAX_SMALL_PUNCTUATION_DEVIATIONS
            || caseChanges > TradingNameScamDetector.MAX_CASE_CHANGES)
        {
            return false;
        }

        const key = `${nameIndex}|${otherIndex}|${punctuationDeviations}|${caseChanges}`;
        const memoised = memo.get(key);

        if(memoised !== undefined) return memoised;

        let matched = false;

        if(nameIndex === name.length && otherIndex === other.length)
        {
            matched = true;
        }
        else if(nameIndex < name.length && otherIndex < other.length)
        {
            const left = name.charAt(nameIndex);
            const right = other.charAt(otherIndex);

            if(left === right)
            {
                matched = TradingNameScamDetector.compareNames(
                    name, other, nameIndex + 1, otherIndex + 1, punctuationDeviations, caseChanges, memo
                );
            }
            else if(TradingNameScamDetector.isCaseOnlyChange(left, right))
            {
                matched = TradingNameScamDetector.compareNames(
                    name, other, nameIndex + 1, otherIndex + 1, punctuationDeviations, caseChanges + 1, memo
                );
            }
            else if(TradingNameScamDetector.areConfusable(left, right))
            {
                // Not counted against any budget: a lookalike swap is free, however many there are.
                matched = TradingNameScamDetector.compareNames(
                    name, other, nameIndex + 1, otherIndex + 1, punctuationDeviations, caseChanges, memo
                );
            }
        }

        if(!matched && nameIndex < name.length && TradingNameScamDetector.isSmallPunctuation(name.charAt(nameIndex)))
        {
            matched = TradingNameScamDetector.compareNames(
                name, other, nameIndex + 1, otherIndex, punctuationDeviations + 1, caseChanges, memo
            );
        }

        if(!matched && otherIndex < other.length && TradingNameScamDetector.isSmallPunctuation(other.charAt(otherIndex)))
        {
            matched = TradingNameScamDetector.compareNames(
                name, other, nameIndex, otherIndex + 1, punctuationDeviations + 1, caseChanges, memo
            );
        }

        memo.set(key, matched);

        return matched;
    }

    // AS3: .../_SafeCls_3934.as::isAllowedName()
    private static isAllowedName(name: string): boolean
    {
        for(let i = 0; i < name.length; i++)
        {
            if(!TradingNameScamDetector.isAllowedCharacter(name.charAt(i))) return false;
        }

        return true;
    }

    // AS3: .../_SafeCls_3934.as::isAllowedCharacter()
    private static isAllowedCharacter(character: string): boolean
    {
        if(character === null || character.length !== 1) return false;

        const code = character.charCodeAt(0);

        if((code >= 48 && code <= 57) || (code >= 65 && code <= 90) || (code >= 97 && code <= 122))
        {
            return true;
        }

        return TradingNameScamDetector.ALLOWED_PUNCTUATION.indexOf(character) >= 0
            || TradingNameScamDetector.EXTRA_ALLOWED_LETTERS.indexOf(character) >= 0;
    }

    // AS3: .../_SafeCls_3934.as::isLetter()
    private static isLetter(character: string): boolean
    {
        if(character === null || character.length !== 1) return false;

        const code = character.charCodeAt(0);

        return (code >= 65 && code <= 90)
            || (code >= 97 && code <= 122)
            || TradingNameScamDetector.EXTRA_ALLOWED_LETTERS.indexOf(character) >= 0;
    }

    // AS3: .../_SafeCls_3934.as::isCaseOnlyChange()
    // The double test rules out characters whose case maps unevenly (Turkish dotless ı, say):
    // both directions have to agree for it to count as a mere case change.
    private static isCaseOnlyChange(left: string, right: string): boolean
    {
        if(!TradingNameScamDetector.isLetter(left) || !TradingNameScamDetector.isLetter(right) || left === right)
        {
            return false;
        }

        return left.toLowerCase() === right.toLowerCase() && left.toUpperCase() === right.toUpperCase();
    }

    // AS3: .../_SafeCls_3934.as::isSmallPunctuation()
    private static isSmallPunctuation(character: string): boolean
    {
        return TradingNameScamDetector.SMALL_PUNCTUATION.indexOf(character) >= 0;
    }

    // AS3: .../_SafeCls_3934.as::areConfusable()
    private static areConfusable(left: string, right: string): boolean
    {
        if(left === null || right === null || left === right) return false;

        const groups = TradingNameScamDetector.getConfusableGroupByCharacter();
        const leftGroup = groups.get(left);
        const rightGroup = groups.get(right);

        return leftGroup !== undefined && leftGroup === rightGroup;
    }

    // AS3: .../_SafeCls_3934.as::getConfusableGroupByCharacter()
    private static getConfusableGroupByCharacter(): Map<string, string>
    {
        if(TradingNameScamDetector._confusableGroupByCharacter === null)
        {
            const groups = new Map<string, string>();

            for(const group of TradingNameScamDetector.CONFUSABLE_GROUPS)
            {
                for(let i = 0; i < group.length; i++)
                {
                    groups.set(group.charAt(i), group);
                }
            }

            TradingNameScamDetector._confusableGroupByCharacter = groups;
        }

        return TradingNameScamDetector._confusableGroupByCharacter;
    }
}
