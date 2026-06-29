import type {IHabboLocalizationManager} from '@habbo/localization/IHabboLocalizationManager';

type CompactUnit =
{
    readonly value: number;
    readonly key: string;
    readonly fallback: string;
};

const COMPACT_UNITS: CompactUnit[] = [
    {value: 1_000_000_000_000, key: 'trillion', fallback: 'T'},
    {value: 1_000_000_000, key: 'billion', fallback: 'B'},
    {value: 1_000_000, key: 'million', fallback: 'M'},
    {value: 1_000, key: 'thousand', fallback: 'K'}
];

export function formatPurseAmount(amount: number, localization: IHabboLocalizationManager | null = null): string
{
    const sign = amount < 0 ? '-' : '';
    const absolute = Math.abs(amount);

    if(absolute < 1000)
    {
        return amount.toString();
    }

    let unitIndex = findUnitIndex(absolute);
    let unit = COMPACT_UNITS[unitIndex];
    let compactValue = absolute / unit.value;
    let formattedValue = formatCompactValue(compactValue);

    if(Number(formattedValue) >= 1000 && unitIndex > 0)
    {
        unitIndex--;
        unit = COMPACT_UNITS[unitIndex];
        compactValue = absolute / unit.value;
        formattedValue = formatCompactValue(compactValue);
    }

    const suffix = getLocalization(localization, `purse.amount.compact.${unit.key}`, unit.fallback);
    const separator = getLocalization(localization, 'purse.amount.compact.decimal_separator', '.');
    const format = getLocalization(localization, 'purse.amount.compact.format', '%value%%suffix%');
    const localizedValue = formattedValue.replace('.', separator);

    return format
        .replace('%value%', `${sign}${localizedValue}`)
        .replace('%suffix%', suffix);
}

function findUnitIndex(amount: number): number
{
    for(let i = 0; i < COMPACT_UNITS.length; i++)
    {
        if(amount >= COMPACT_UNITS[i].value)
        {
            return i;
        }
    }

    return COMPACT_UNITS.length - 1;
}

function formatCompactValue(value: number): string
{
    const decimals = value >= 100 ? 0 : (value >= 10 ? 1 : 2);

    return value
        .toFixed(decimals)
        .replace(/\.0+$/, '')
        .replace(/(\.\d*[1-9])0+$/, '$1');
}

function getLocalization(localization: IHabboLocalizationManager | null, key: string, fallback: string): string
{
    return localization?.getLocalization(key, fallback) ?? fallback;
}
