import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';
import type {IVector3d} from '@room/utils/IVector3d';
import {ColorConverter} from '@room/utils/ColorConverter';
import {GuildBadgePartData} from './GuildBadgePartData';
import {GuildColorData} from './GuildColorData';

/**
 * GuildEditorData
 *
 * Everything the badge editor and the colour grids need: the selectable badge bases and
 * layers, and the three palettes (badge, guild primary, guild secondary).
 *
 * `findMatchingPrimaryColorId()` / `findMatchingSecondaryColorId()` exist because the
 * badge palette and the guild palettes are *different* palettes: when creating a group
 * the wizard pre-selects the guild colours nearest to whatever badge colours the player
 * picked, matched in CIE-Lab so "nearest" means perceptually nearest rather than nearest
 * in RGB.
 *
 * Class and member names are recovered from
 * sources/PRODUCTION-201601012205-226667486/src/com/sulake/habbo/communication/messages/incoming/users/GuildEditorData.as
 *
 * AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_1731/_SafeCls_2215.as
 */
export class GuildEditorData
{
    // AS3: sources/PRODUCTION-201601012205-226667486/src/com/sulake/habbo/communication/messages/incoming/users/GuildEditorData.as::_baseParts
    private _baseParts: GuildBadgePartData[] = [];
    // AS3: sources/PRODUCTION-201601012205-226667486/src/com/sulake/habbo/communication/messages/incoming/users/GuildEditorData.as::_layerParts
    private _layerParts: GuildBadgePartData[] = [];
    // AS3: sources/PRODUCTION-201601012205-226667486/src/com/sulake/habbo/communication/messages/incoming/users/GuildEditorData.as::_badgeColors
    private _badgeColors: GuildColorData[] = [];
    // AS3: sources/PRODUCTION-201601012205-226667486/src/com/sulake/habbo/communication/messages/incoming/users/GuildEditorData.as::_guildPrimaryColors
    private _guildPrimaryColors: GuildColorData[] = [];
    // AS3: sources/PRODUCTION-201601012205-226667486/src/com/sulake/habbo/communication/messages/incoming/users/GuildEditorData.as::_guildSecondaryColors
    private _guildSecondaryColors: GuildColorData[] = [];

    // AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_1731/_SafeCls_2215.as::_SafeCls_2215()
    constructor(wrapper: IMessageDataWrapper)
    {
        let count = wrapper.readInt();

        for(let i = 0; i < count; i++) this._baseParts.push(new GuildBadgePartData(wrapper));

        count = wrapper.readInt();

        for(let i = 0; i < count; i++) this._layerParts.push(new GuildBadgePartData(wrapper));

        count = wrapper.readInt();

        for(let i = 0; i < count; i++) this._badgeColors.push(new GuildColorData(wrapper));

        count = wrapper.readInt();

        for(let i = 0; i < count; i++) this._guildPrimaryColors.push(new GuildColorData(wrapper));

        count = wrapper.readInt();

        for(let i = 0; i < count; i++) this._guildSecondaryColors.push(new GuildColorData(wrapper));
    }

    // AS3: .../_SafeCls_2215.as::get baseParts()
    get baseParts(): GuildBadgePartData[]
    {
        return this._baseParts;
    }

    // AS3: .../_SafeCls_2215.as::get layerParts()
    get layerParts(): GuildBadgePartData[]
    {
        return this._layerParts;
    }

    // AS3: .../_SafeCls_2215.as::get badgeColors()
    get badgeColors(): GuildColorData[]
    {
        return this._badgeColors;
    }

    // AS3: .../_SafeCls_2215.as::get guildPrimaryColors()
    get guildPrimaryColors(): GuildColorData[]
    {
        return this._guildPrimaryColors;
    }

    // AS3: .../_SafeCls_2215.as::get guildSecondaryColors()
    get guildSecondaryColors(): GuildColorData[]
    {
        return this._guildSecondaryColors;
    }

    // AS3: .../_SafeCls_2215.as::findMatchingPrimaryColorId()
    findMatchingPrimaryColorId(badgeColorIndex: number): number
    {
        if(badgeColorIndex < 0 || this._badgeColors.length <= 0 || this._badgeColors.length < badgeColorIndex || this._guildPrimaryColors.length <= 0)
        {
            return 0;
        }

        return this.findClosestColor(this._badgeColors[badgeColorIndex], this._guildPrimaryColors);
    }

    // AS3: .../_SafeCls_2215.as::findMatchingSecondaryColorId()
    findMatchingSecondaryColorId(badgeColorIndex: number): number
    {
        if(badgeColorIndex < 0 || this._badgeColors.length <= 0 || this._badgeColors.length < badgeColorIndex || this._guildSecondaryColors.length <= 0)
        {
            return 0;
        }

        return this.findClosestColor(this._badgeColors[badgeColorIndex], this._guildSecondaryColors);
    }

    // AS3: .../_SafeCls_2215.as::findClosestColor()
    private findClosestColor(color: GuildColorData, palette: GuildColorData[]): number
    {
        const source: IVector3d = ColorConverter.rgb2CieLab(color.color);
        let closestIndex: number = 0;
        let closestDistance: number = Number.MAX_VALUE;

        for(let i = 0; i < palette.length; i++)
        {
            const candidate: IVector3d = ColorConverter.rgb2CieLab(palette[i].color);
            const distance: number = Math.pow(source.x - candidate.x, 2) + Math.pow(source.y - candidate.y, 2) + Math.pow(source.z - candidate.z, 2);

            if(distance < closestDistance)
            {
                closestDistance = distance;
                closestIndex = i;
            }
        }

        return palette[closestIndex].id;
    }
}
