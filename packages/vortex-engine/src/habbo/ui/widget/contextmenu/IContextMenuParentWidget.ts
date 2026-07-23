/**
 * IContextMenuParentWidget — the widget a ContextInfoView calls back into.
 *
 * AS3 interface is obfuscated to `_SafeCls_1870`; real name recovered from the
 * PRODUCTION 2016 tree (`ui/widget/contextmenu/IContextMenuParentWidget.as`).
 * Implemented by AvatarInfoWidget.
 *
 * @see sources/WIN63-202607011411-782849652/src/com/sulake/habbo/ui/widget/contextmenu/_SafeCls_1870.as
 */
import type {IHabboWindowManager} from '@habbo/window/IHabboWindowManager';
import type {IAssetLibrary} from '@core/assets/IAssetLibrary';
import type {IHabboLocalizationManager} from '@habbo/localization/IHabboLocalizationManager';
import type {IHabboCatalog} from '@habbo/catalog/IHabboCatalog';
import type {IHabboFriendList} from '@habbo/friendlist/IHabboFriendList';
import type {IRoomWidgetMessageListener} from '@habbo/ui/IRoomWidgetMessageListener';
import type {ContextInfoView} from './ContextInfoView';

export interface IContextMenuParentWidget
{
    readonly windowManager: IHabboWindowManager;
    readonly assets: IAssetLibrary | null;
    readonly localizations: IHabboLocalizationManager | null;
    readonly messageListener: IRoomWidgetMessageListener | null;
    readonly catalog: IHabboCatalog | null;
    readonly friendList: IHabboFriendList | null;

    // AS3: _SafeCls_1870.as::removeView()
    removeView(view: ContextInfoView, animate: boolean): void;
}
