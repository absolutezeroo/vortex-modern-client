import {Component} from '@core/runtime/Component';
import type {IContext} from '@core/runtime/IContext';
import type {ILocalizable} from '@core/localization/ILocalizable';

/**
 * GlazeLocalizationStub — the only DI dependency the window subsystem strictly needs.
 *
 * `HabboWindowManager`'s single *required* dependency is `IID_HabboLocalizationManager`.
 * The real `HabboLocalizationManager` drags in the configuration + communication
 * managers (and therefore the external_variables / game-data download pipeline), none
 * of which a window-layout editor needs. The window system only ever calls
 * `getLocalization` / `register|removeLocalizationListener` / `interpolate` on the
 * localization manager, so this stub implements exactly those and returns raw tokens —
 * which is precisely how Glaze itself displays untranslated captions.
 *
 * It is attached under `IID_HabboLocalizationManager`; consumers retrieve it typed as
 * `IHabboLocalizationManager`, but only the methods below are exercised at runtime.
 */
export class GlazeLocalizationStub extends Component
{
    public constructor(context: IContext)
    {
        super(context);
    }

    public getLocalization(key: string, defaultValue?: string): string
    {
        return defaultValue ?? key;
    }

    public getLocalizationWithParams(key: string, defaultValue?: string): string
    {
        return defaultValue ?? key;
    }

    public getLocalizationWithParamMap(key: string, defaultValue?: string): string
    {
        return defaultValue ?? key;
    }

    public hasLocalization(_key: string): boolean
    {
        return false;
    }

    public registerLocalizationListener(_key: string, _listener: ILocalizable): boolean
    {
        return false;
    }

    public removeLocalizationListener(_key: string, _listener: ILocalizable): boolean
    {
        return false;
    }

    public override interpolate(value: string): string
    {
        return value;
    }
}
