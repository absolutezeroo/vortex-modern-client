import type { EventEmitter } from 'eventemitter3';
import type { IUpdateReceiver } from '@core/runtime';
import type { IAssetLibrary } from '@core/assets';
import type {IWindow} from '@core/window/IWindow';
import type {IWindowContainer} from '@core/window/IWindowContainer';
import type {IHabboCommunicationManager} from '../communication/IHabboCommunicationManager';
import type {IHabboToolbar} from '../toolbar/IHabboToolbar';
import type {IRoomSessionManager} from '../session/IRoomSessionManager';
import type {ISessionDataManager} from '../session/ISessionDataManager';
import type {IHabboWindowManager} from '../window/IHabboWindowManager';
import type {IHabboHelp} from '../help/IHabboHelp';
import type {IMessageComposer} from '@core';
import type {IHabboNavigator} from './IHabboNavigator';
import type {NavigatorData} from './domain';
import type {Tabs} from './domain/Tabs';
import type {ITransitionalMainViewCtrl} from './mainview/ITransitionalMainViewCtrl';
import type {RoomInfoViewCtrl} from './inroom/RoomInfoViewCtrl';
import type {RoomCreateViewCtrl} from './roomsettings/RoomCreateViewCtrl';
import type {RoomSettingsCtrl} from './roomsettings/RoomSettingsCtrl';
import type {RoomEventViewCtrl} from './inroom/RoomEventViewCtrl';
import type {RoomEventInfoCtrl} from './inroom/RoomEventInfoCtrl';
import type {RoomFilterCtrl} from './roomsettings/RoomFilterCtrl';
import type {EnforceCategoryCtrl} from './roomsettings/EnforceCategoryCtrl';
import type {GuestRoomPasswordInput} from './GuestRoomPasswordInput';
import type {GuestRoomDoorbell} from './GuestRoomDoorbell';
import type {OfficialRoomEntryManager} from './mainview/OfficialRoomEntryManager';

/**
 * Transitional navigator interface bridging old and new navigator systems.
 *
 * Extends IHabboNavigator with access to all sub-controllers and utility methods
 * needed by the legacy navigator UI components.
 *
 * @see sources/win63_version/habbo/navigator/IHabboTransitionalNavigator.as
 */
export interface IHabboTransitionalNavigator extends IHabboNavigator
{
    readonly disposed: boolean;
    readonly events: EventEmitter;
    readonly assets: IAssetLibrary | null;
    readonly windowManager: IHabboWindowManager | null;
    readonly data: NavigatorData;
    readonly sessionData: ISessionDataManager | null;
    readonly tabs: Tabs;
    readonly mainViewCtrl: ITransitionalMainViewCtrl | null;
    readonly roomInfoViewCtrl: RoomInfoViewCtrl | null;
    readonly roomCreateViewCtrl: RoomCreateViewCtrl | null;
    readonly communication: IHabboCommunicationManager;
    readonly roomSettingsCtrl: RoomSettingsCtrl | null;
    readonly passwordInput: GuestRoomPasswordInput | null;
    readonly doorbell: GuestRoomDoorbell | null;
    readonly roomEventViewCtrl: RoomEventViewCtrl | null;
    readonly officialRoomEntryManager: OfficialRoomEntryManager | null;
    readonly toolbar: IHabboToolbar | null;
    readonly habboHelp: IHabboHelp | null;
    readonly roomEventInfoCtrl: RoomEventInfoCtrl | null;
    readonly roomFilterCtrl: RoomFilterCtrl | null;
    readonly roomSessionManager: IRoomSessionManager | null;
    readonly enforceCategoryCtrl: EnforceCategoryCtrl | null;

    registerUpdateReceiver(receiver: IUpdateReceiver, priority: number): void;

    removeUpdateReceiver(receiver: IUpdateReceiver): void;

    send(composer: IMessageComposer<unknown[]>): void;

    getXmlWindow(xmlFileName: string, style?: number): IWindow | null;

    getText(key: string): string;

    registerParameter(key: string, param: string, value: string): string;

    getButton(assetName: string, stateSuffix: string, callback: Function, x?: number, y?: number, index?: number): IWindowContainer | null;

    refreshButton(container: IWindowContainer, name: string, visible: boolean, callback: Function, index: number, tooltip?: string | null): void;

    getButtonImage(assetName: string, suffix?: string): unknown | null;

    openCatalogClubPage(source: string): void;

    openCatalogRoomAdsPage(): void;

    openCatalogRoomAdsExtendPage(eventName: string, eventDesc: string, eventDate: Date, eventCatId: number): void;

    showFavouriteRooms(): void;

    showHistoryRooms(): void;

    showFrequentRooms(): void;

    goToMainView(): void;

    goToRoom(roomId: number, closeNavigator: boolean, password?: string, roomCategory?: number, skipOpc?: boolean): void;

    isPerkAllowed(perkCode: string): boolean;

    trackGoogle(category: string, action: string, value?: number): void;

    trackNavigationDataPoint(category: string, action: string, label?: string, value?: number): void;

    getBoolean(key: string): boolean;

    getInteger(key: string, defaultValue: number): number;

    getProperty(key: string, params?: Record<string, string>): string;
}
