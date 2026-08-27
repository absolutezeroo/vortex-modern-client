import type {IWindow} from '@core/window/IWindow';
import type {IHabboLocalizationManager} from '@habbo/localization/IHabboLocalizationManager';

/**
 * INameChangeUI
 *
 * What `NameChangeView` and `NameSuggestionListRenderer` are allowed to see of their controller.
 * Unobfuscated in the primary tree, so this name is recovered, not derived.
 *
 * AS3 declares `get assets()` here too, because its views build windows out of the component's own
 * `IAssetLibrary`. This port has no per-component library — `buildXmlWindow()` goes through the
 * window manager's layout map instead (see `HabboHelp.getXmlWindow()`) — so that accessor would
 * have no caller and no meaning, and is deliberately absent rather than stubbed.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/help/INameChangeUI.as
 */
export interface INameChangeUI
{
    // AS3: .../src/com/sulake/habbo/help/INameChangeUI.as::get localization()
    readonly localization: IHabboLocalizationManager | null;

    // AS3: .../src/com/sulake/habbo/help/INameChangeUI.as::get myName()
    readonly myName: string;

    // AS3: .../src/com/sulake/habbo/help/INameChangeUI.as::buildXmlWindow()
    buildXmlWindow(name: string, layer?: number): IWindow | null;

    // AS3: .../src/com/sulake/habbo/help/INameChangeUI.as::checkName()
    checkName(name: string): void;

    // AS3: .../src/com/sulake/habbo/help/INameChangeUI.as::changeName()
    changeName(name: string): void;

    // AS3: .../src/com/sulake/habbo/help/INameChangeUI.as::showView()
    showView(): void;

    // AS3: .../src/com/sulake/habbo/help/INameChangeUI.as::hideView()
    hideView(): void;
}
