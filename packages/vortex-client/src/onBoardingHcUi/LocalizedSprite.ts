/**
 * LocalizedSprite
 *
 * AS3: sources/WIN63-202607011411-782849652/src/onBoardingHcUi/LocalizedSprite.as
 *
 * A Sprite that subscribes itself to the localisation manager when its caption is a `${key}`
 * placeholder, so the text swaps in as soon as the environment's texts land. `Button` extends it,
 * which is why every button caption in the login flow can be written as `"${generic.cancel}"`.
 */
import type {ILocalizable} from '@core/localization/ILocalizable';
import type {ICoreLocalizationManager} from '@core/localization/ICoreLocalizationManager';
import {Sprite} from './display/DisplayObjectContainer';

export class LocalizedSprite extends Sprite implements ILocalizable
{
    // AS3: _localizationManager
    private static _localizationManager: ICoreLocalizationManager | null = null;

    // AS3: _localized
    protected _localized: boolean = false;

    // AS3: set localizationManager(_arg_1:ILocalizationManager)
    public static set localizationManager(value: ICoreLocalizationManager | null)
    {
        LocalizedSprite._localizationManager = value;
    }

    // AS3: get localizationManager():ILocalizationManager
    public static get localizationManager(): ICoreLocalizationManager | null
    {
        return LocalizedSprite._localizationManager;
    }

    /**
     * AS3: set localization(_arg_1:String)
     *
     * The manager pushes the resolved text back through here. AS3 checks `this is Button` because
     * only a Button has somewhere to put it.
     */
    // AS3: .../src/onBoardingHcUi/LocalizedSprite.as::set localization()
    public set localization(value: string)
    {
        const button = this as unknown as {localizedText?: string};

        if('localizedText' in button)
        {
            button.localizedText = value;
        }
    }

    // AS3: removeOldLocalization(_arg_1:String)
    protected removeOldLocalization(key: string): void
    {
        if(!this._localized) return;

        LocalizedSprite._localizationManager?.removeLocalizationListener(
            key.slice(2, key.indexOf('}')),
            this
        );
        this._localized = false;
    }

    // AS3: checkLocalization(_arg_1:String)
    protected checkLocalization(key: string): void
    {
        const manager = LocalizedSprite._localizationManager;

        if(!manager || !key || key.charAt(0) !== '$' || key.charAt(1) !== '{') return;

        this._localized = true;
        manager.registerLocalizationListener(key.slice(2, key.indexOf('}')), this);
    }

    /**
     * AS3: dispose()
     *
     * AS3 reads the caption back off the Button to know which key to unsubscribe.
     */
    // AS3: .../src/onBoardingHcUi/LocalizedSprite.as::dispose()
    public dispose(): void
    {
        const button = this as unknown as {label?: string};

        this.removeOldLocalization(button.label ?? '');
    }
}
