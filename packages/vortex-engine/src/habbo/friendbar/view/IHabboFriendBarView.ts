import type {EventEmitter} from 'eventemitter3';
import type {IWindowContainer} from '@core/window/IWindowContainer';
import type {ITab} from './tabs/ITab';

/**
 * IHabboFriendBarView
 *
 * The bar as its tabs see it: selection, the two notify lamps, and the image lookups a
 * slot needs to draw its avatar or group badge.
 *
 * The primary tree obfuscates this interface to `_SafeCls_1757` and no tree recovers
 * it. **The name `IHabboFriendBarView` is derived**, from its sole implementor
 * `HabboFriendBarView` (unobfuscated). It extends `IUnknown` in AS3, i.e. it is the
 * view's DI component interface.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/friendbar/view/_SafeCls_1757.as
 */
export interface IHabboFriendBarView
{
    // AS3: .../view/_SafeCls_1757.as::get events()
    readonly events: EventEmitter;

    // AS3: .../view/_SafeCls_1757.as::get visible()
    visible: boolean;

    // AS3: .../view/_SafeCls_1757.as::selectTab()
    selectTab(tab: ITab, animate: boolean): void;

    // AS3: .../view/_SafeCls_1757.as::deSelect()
    deSelect(animate: boolean): void;

    // AS3: .../view/_SafeCls_1757.as::getAvatarFaceBitmap()
    getAvatarFaceBitmap(figure: string): ImageBitmap | null;

    // AS3: .../view/_SafeCls_1757.as::getGroupIconBitmap()
    getGroupIconBitmap(badge: string): ImageBitmap | null;

    // AS3: .../view/_SafeCls_1757.as::setMessengerIconNotify()
    setMessengerIconNotify(notify: boolean): void;

    // AS3: .../view/_SafeCls_1757.as::setFriendListIconNotify()
    setFriendListIconNotify(notify: boolean): void;

    // AS3: .../view/_SafeCls_1757.as::removeMessengerNotifications()
    removeMessengerNotifications(): void;

    // AS3: .../view/_SafeCls_1757.as::get friendBarWidth()
    readonly friendBarWidth: number;

    // AS3: .../view/_SafeCls_1757.as::getIconLocation()
    getIconLocation(iconName: string): IWindowContainer | null;
}
