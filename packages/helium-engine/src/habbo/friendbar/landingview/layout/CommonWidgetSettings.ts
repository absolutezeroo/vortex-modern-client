import type {HabboLandingView} from '../HabboLandingView';

/**
 * Shared campaign text/etching color overrides for landing view widgets,
 * read once from `landing.view.common.*` configuration keys.
 *
 * @see sources/win63_2026_crypted_version/src/com/sulake/habbo/friendbar/landingview/layout/CommonWidgetSettings.as
 */
export class CommonWidgetSettings
{
    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/friendbar/landingview/layout/CommonWidgetSettings.as::TEXTCOLOR_DEFAULT
    private static readonly TEXTCOLOR_DEFAULT: number = 0xFF000000;
    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/friendbar/landingview/layout/CommonWidgetSettings.as::ETCHINGCOLOR_DEFAULT
    private static readonly ETCHINGCOLOR_DEFAULT: number = 0xFFFFFFFF;
    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/friendbar/landingview/layout/CommonWidgetSettings.as::ETCHINGPOSITION_DEFAULT
    private static readonly ETCHINGPOSITION_DEFAULT: string = 'bottom';

    private _textColor: number = CommonWidgetSettings.TEXTCOLOR_DEFAULT;
    private _etchingColor: number = CommonWidgetSettings.ETCHINGCOLOR_DEFAULT;
    private _etchingPosition: string = CommonWidgetSettings.ETCHINGPOSITION_DEFAULT;

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/friendbar/landingview/layout/CommonWidgetSettings.as::CommonWidgetSettings()
    constructor(configSource: HabboLandingView)
    {
        if(configSource.getProperty('landing.view.common.textcolor') !== '')
        {
            this._textColor = parseInt(configSource.getProperty('landing.view.common.textcolor'), 16);
        }

        if(configSource.getProperty('landing.view.common.etchingcolor') !== '')
        {
            this._etchingColor = parseInt(configSource.getProperty('landing.view.common.etchingcolor'), 16);
        }

        if(configSource.getProperty('landing.view.common.etchingposition') !== '')
        {
            this._etchingPosition = configSource.getProperty('landing.view.common.etchingposition');
        }
    }

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/friendbar/landingview/layout/CommonWidgetSettings.as::get isTextColorSet()
    get isTextColorSet(): boolean
    {
        return this._textColor !== CommonWidgetSettings.TEXTCOLOR_DEFAULT;
    }

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/friendbar/landingview/layout/CommonWidgetSettings.as::get isEtchingColorSet()
    get isEtchingColorSet(): boolean
    {
        return this._etchingColor !== CommonWidgetSettings.ETCHINGCOLOR_DEFAULT;
    }

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/friendbar/landingview/layout/CommonWidgetSettings.as::get isEtchingPositionSet()
    get isEtchingPositionSet(): boolean
    {
        return this._etchingPosition !== CommonWidgetSettings.ETCHINGPOSITION_DEFAULT;
    }

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/friendbar/landingview/layout/CommonWidgetSettings.as::get textColor()
    get textColor(): number
    {
        return this._textColor;
    }

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/friendbar/landingview/layout/CommonWidgetSettings.as::get etchingColor()
    get etchingColor(): number
    {
        return this._etchingColor;
    }

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/friendbar/landingview/layout/CommonWidgetSettings.as::get etchingPosition()
    get etchingPosition(): string
    {
        return this._etchingPosition;
    }
}
