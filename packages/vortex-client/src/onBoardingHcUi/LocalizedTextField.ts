/**
 * LocalizedTextField
 *
 * AS3: sources/WIN63-202607011411-782849652/src/onBoardingHcUi/LocalizedTextField.as
 *
 * The TextField every `LoaderUI.createTextField()` call produces. Assigning `htmlText` also
 * registers the field against the localisation manager when the text is a `${key}` placeholder,
 * which is how the login titles ("${connection.login.title}") resolve.
 */
import type {ILocalizable} from '@core/localization/ILocalizable';
import type {ICoreLocalizationManager} from '@core/localization/ICoreLocalizationManager';
import {TextField} from './display/TextField';

export class LocalizedTextField extends TextField implements ILocalizable
{
    // AS3: _localizationManager
    private static _localizationManager: ICoreLocalizationManager | null = null;

    // AS3: _localized
    protected _localized: boolean = false;

    // AS3: _key
    private _key: string = '';

    // AS3: set localizationManager(_arg_1:ILocalizationManager)
    public static set localizationManager(value: ICoreLocalizationManager | null)
    {
        LocalizedTextField._localizationManager = value;
    }

    // AS3: get localizationManager():ILocalizationManager
    public static get localizationManager(): ICoreLocalizationManager | null
    {
        return LocalizedTextField._localizationManager;
    }

    // AS3: override set htmlText(_arg_1:String)
    public override set htmlText(value: string)
    {
        super.htmlText = value;
        this.checkLocalization(value);
    }

    // AS3: set localization(_arg_1:String)
    public set localization(value: string)
    {
        super.htmlText = value;
    }

    // AS3: removeOldLocalization(_arg_1:String)
    protected removeOldLocalization(key: string): void
    {
        if(!this._localized || !key) return;

        LocalizedTextField._localizationManager?.removeLocalizationListener(
            key.slice(2, key.indexOf('}')),
            this
        );
        this._localized = false;
    }

    // AS3: checkLocalization(_arg_1:String)
    protected checkLocalization(key: string): void
    {
        const manager = LocalizedTextField._localizationManager;

        if(!manager || !key || key.charAt(0) !== '$' || key.charAt(1) !== '{') return;

        this.removeOldLocalization(this._key);
        this._key = key;
        this._localized = true;
        manager.registerLocalizationListener(key.slice(2, key.indexOf('}')), this);
    }

    // AS3: dispose()
    public dispose(): void
    {
        this.removeOldLocalization(this._key);
    }
}
