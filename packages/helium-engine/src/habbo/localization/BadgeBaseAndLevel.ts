/**
 * Utility class for parsing badge IDs into base name and level
 *
 * Based on AS3 com.sulake.habbo.localization.BadgeBaseAndLevel
 */
export class BadgeBaseAndLevel
{
    constructor(badgeId: string)
    {
        // Find where the numeric suffix starts
        let index = badgeId.length - 1;

        while(index > 0 && this.isNumber(badgeId.charAt(index)))
        {
            index--;
        }

        this._base = badgeId.substring(0, index + 1);

        const levelStr = badgeId.substring(index + 1, badgeId.length);

        if(levelStr !== null && levelStr !== '')
        {
            this._level = parseInt(levelStr, 10);
        }
    }

    private _base: string = '';

    get base(): string
    {
        return this._base;
    }

    private _level: number = 1;

    get level(): number
    {
        return this._level;
    }

    set level(value: number)
    {
        this._level = Math.max(1, value);
    }

    get badgeId(): string
    {
        return this._base + this._level;
    }

    private isNumber(char: string): boolean
    {
        const code = char.charCodeAt(0);
        return code >= 48 && code <= 57; // '0' to '9'
    }
}
