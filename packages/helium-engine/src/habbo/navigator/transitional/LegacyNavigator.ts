import type {IWindow} from '@core/window/IWindow';
import type {IWindowContainer} from '@core/window/IWindowContainer';
import type {IMessageComposer} from '@core';
import type {IUpdateReceiver} from '@core/runtime';
import type {IAssetLibrary} from '@core/assets';
import type {IHabboCommunicationManager} from '../../communication/IHabboCommunicationManager';
import type {IHabboToolbar} from '../../toolbar/IHabboToolbar';
import type {IRoomSessionManager} from '../../session/IRoomSessionManager';
import type {ISessionDataManager} from '../../session/ISessionDataManager';
import type {IHabboWindowManager} from '../../window/IHabboWindowManager';
import type {IHabboHelp} from '../../help/IHabboHelp';
import type {EventCategory, GuestRoomData} from '../../communication/messages/incoming/navigator';
import type {IHabboTransitionalNavigator} from '../IHabboTransitionalNavigator';
import type {ITransitionalMainViewCtrl} from '../mainview/ITransitionalMainViewCtrl';
import type {HabboNewNavigator} from '../HabboNewNavigator';
import type {HabboNavigator} from '../HabboNavigator';
import {EventEmitter} from 'eventemitter3';
import {NavigatorData} from '../domain';
import {Tabs} from '../domain/Tabs';
import {FakeMainViewCtrl} from './FakeMainViewCtrl';
import {RoomSettingsCtrl} from '../roomsettings/RoomSettingsCtrl';
import {RoomInfoViewCtrl} from '../inroom/RoomInfoViewCtrl';
import {RoomCreateViewCtrl} from '../roomsettings/RoomCreateViewCtrl';
import {GuestRoomPasswordInput} from '../GuestRoomPasswordInput';
import {GuestRoomDoorbell} from '../GuestRoomDoorbell';
import {OfficialRoomEntryManager} from '../mainview/OfficialRoomEntryManager';
import {RoomEventViewCtrl} from '../inroom/RoomEventViewCtrl';
import {RoomEventInfoCtrl} from '../inroom/RoomEventInfoCtrl';
import {RoomFilterCtrl} from '../roomsettings/RoomFilterCtrl';
import {EnforceCategoryCtrl} from '../roomsettings/EnforceCategoryCtrl';

/**
 * Legacy navigator facade implementing IHabboTransitionalNavigator.
 *
 * Bridges HabboNewNavigator and HabboNavigator, creates and holds all
 * sub-controllers, and delegates calls to the appropriate navigator.
 *
 * @see sources/win63_version/habbo/navigator/transitional/LegacyNavigator.as
 */
export class LegacyNavigator implements IHabboTransitionalNavigator
{
	private _newNavigator: HabboNewNavigator | null;
	private _oldNavigator: HabboNavigator | null;
	private _fakeMainViewCtrl: FakeMainViewCtrl;
	private readonly _events: EventEmitter = new EventEmitter();
	private _tabs: Tabs;

	constructor(newNavigator: HabboNewNavigator, oldNavigator: HabboNavigator)
	{
		this._newNavigator = newNavigator;
		this._oldNavigator = oldNavigator;
		this._tabs = new Tabs(this);
		this._fakeMainViewCtrl = new FakeMainViewCtrl(newNavigator, oldNavigator);
		this._roomSettingsCtrl = new RoomSettingsCtrl(this);
		this._roomInfoViewCtrl = new RoomInfoViewCtrl(this);
		this._roomCreateViewCtrl = new RoomCreateViewCtrl(this);
		this._passwordInput = new GuestRoomPasswordInput(this);
		this._doorbell = new GuestRoomDoorbell(this);
		this._officialRoomEntryManager = new OfficialRoomEntryManager(this);
		this._roomEventViewCtrl = new RoomEventViewCtrl(this);
		this._roomEventInfoCtrl = new RoomEventInfoCtrl(this);
		this._roomFilterCtrl = new RoomFilterCtrl(this);
		this._enforceCategoryCtrl = new EnforceCategoryCtrl(this);
	}

	private _roomSettingsCtrl: RoomSettingsCtrl;

	get roomSettingsCtrl(): RoomSettingsCtrl
	{
		return this._roomSettingsCtrl;
	}

	private _roomInfoViewCtrl: RoomInfoViewCtrl;

	get roomInfoViewCtrl(): RoomInfoViewCtrl
	{
		return this._roomInfoViewCtrl;
	}

	private _roomCreateViewCtrl: RoomCreateViewCtrl;

	get roomCreateViewCtrl(): RoomCreateViewCtrl
	{
		return this._roomCreateViewCtrl;
	}

	private _passwordInput: GuestRoomPasswordInput;

	get passwordInput(): GuestRoomPasswordInput
	{
		return this._passwordInput;
	}

	private _doorbell: GuestRoomDoorbell;

	get doorbell(): GuestRoomDoorbell
	{
		return this._doorbell;
	}

	private _officialRoomEntryManager: OfficialRoomEntryManager;

	get officialRoomEntryManager(): OfficialRoomEntryManager
	{
		return this._officialRoomEntryManager;
	}

	private _roomEventViewCtrl: RoomEventViewCtrl;

	get roomEventViewCtrl(): RoomEventViewCtrl
	{
		return this._roomEventViewCtrl;
	}

	private _roomEventInfoCtrl: RoomEventInfoCtrl;

	get roomEventInfoCtrl(): RoomEventInfoCtrl
	{
		return this._roomEventInfoCtrl;
	}

	private _roomFilterCtrl: RoomFilterCtrl;

	get roomFilterCtrl(): RoomFilterCtrl
	{
		return this._roomFilterCtrl;
	}

	private _enforceCategoryCtrl: EnforceCategoryCtrl;

	get enforceCategoryCtrl(): EnforceCategoryCtrl
	{
		return this._enforceCategoryCtrl;
	}

	get disposed(): boolean
	{
		return this._oldNavigator === null;
	}

	get events(): EventEmitter
	{
		return this._events;
	}

	get assets(): IAssetLibrary | null
	{
		return (this._oldNavigator as unknown as { assets?: IAssetLibrary })?.assets ?? null;
	}

	get sessionData(): ISessionDataManager | null
	{
		return (this._oldNavigator as unknown as { _sessionData?: ISessionDataManager })?._sessionData ?? null;
	}

	get tabs(): Tabs
	{
		return this._tabs;
	}

	get context(): { configuration: { getBoolean(key: string): boolean } }
	{
		return { configuration: { getBoolean: (key: string) => this.getBoolean(key) } };
	}

	registerUpdateReceiver(receiver: IUpdateReceiver, priority: number): void
	{
		(this._oldNavigator as unknown as { registerUpdateReceiver?(r: IUpdateReceiver, p: number): void })
			?.registerUpdateReceiver?.(receiver, priority);
	}

	removeUpdateReceiver(receiver: IUpdateReceiver): void
	{
		(this._oldNavigator as unknown as { removeUpdateReceiver?(r: IUpdateReceiver): void })
			?.removeUpdateReceiver?.(receiver);
	}

	get windowManager(): IHabboWindowManager | null
	{
		return this._newNavigator?.windowManager ?? null;
	}

	get data(): NavigatorData
	{
		return this._oldNavigator!.data;
	}

	get mainViewCtrl(): ITransitionalMainViewCtrl
	{
		return this._fakeMainViewCtrl;
	}

	get communication(): IHabboCommunicationManager
	{
		return this._oldNavigator!.communication;
	}

	get toolbar(): IHabboToolbar | null
	{
		return (this._oldNavigator as any)?._toolbar ?? null;
	}

	get habboHelp(): IHabboHelp | null
	{
		return (this._oldNavigator as any)?.habboHelp ?? null;
	}

	get roomSessionManager(): IRoomSessionManager | null
	{
		return (this._oldNavigator as any)?._roomSessionManager ?? null;
	}

	get homeRoomId(): number
	{
		return this._oldNavigator?.homeRoomId ?? 0;
	}

	get enteredGuestRoomData(): GuestRoomData | null
	{
		return this._oldNavigator?.enteredGuestRoomData ?? null;
	}

	get visibleEventCategories(): EventCategory[]
	{
		return this._oldNavigator?.data.visibleEventCategories ?? [];
	}

	send(composer: IMessageComposer<unknown[]>): void
	{
		this._oldNavigator?.send(composer);
	}

	getXmlWindow(xmlFileName: string, style: number = 1): IWindow | null
	{
		return this._oldNavigator?.getXmlWindow(xmlFileName, style) ?? null;
	}

	getText(key: string): string
	{
		return this._oldNavigator?.getText(key) ?? key;
	}

	registerParameter(key: string, param: string, value: string): string
	{
		return this._oldNavigator?.registerParameter(key, param, value) ?? key;
	}

	getButton(assetName: string, stateSuffix: string, callback: Function, x: number = 0, y: number = 0, index: number = 0): IWindowContainer | null
	{
		return this._oldNavigator?.getButton(assetName, stateSuffix, callback, x, y, index) ?? null;
	}

	refreshButton(container: IWindowContainer, name: string, visible: boolean, callback: Function, index: number, tooltip: string | null = null): void
	{
		this._oldNavigator?.refreshButton(container, name, visible, callback, index, tooltip);
	}

	getButtonImage(assetName: string, suffix: string = '_png'): unknown | null
	{
		return this._oldNavigator?.getButtonImage(assetName, suffix) ?? null;
	}

	openCatalogClubPage(source: string): void
	{
		this._oldNavigator?.openCatalogClubPage(source);
	}

	openCatalogRoomAdsPage(): void
	{
		this._oldNavigator?.openCatalogRoomAdsPage();
	}

	openCatalogRoomAdsExtendPage(eventName: string, eventDesc: string, eventDate: Date, eventCatId: number): void
	{
		this._oldNavigator?.openCatalogRoomAdsExtendPage(eventName, eventDesc, eventDate, eventCatId);
	}

	showFavouriteRooms(): void
	{
		this._newNavigator?.performSearch('favorites');
	}

	showHistoryRooms(): void
	{
		this._newNavigator?.performSearch('history');
	}

	showFrequentRooms(): void
	{
		this._newNavigator?.performSearch('history_freq');
	}

	goToMainView(): void
	{
		this._roomCreateViewCtrl.hide();
	}

	goToRoom(roomId: number, closeNavigator: boolean, password: string = '', _roomCategory: number = -1, skipOpc: boolean = false): void
	{
		this._oldNavigator?.goToRoom(roomId, false, password, -1, skipOpc);
	}

	isPerkAllowed(perkCode: string): boolean
	{
		return this._oldNavigator?.isPerkAllowed(perkCode) ?? false;
	}

	trackGoogle(category: string, action: string, value: number = -1): void
	{
		this._oldNavigator?.trackGoogle(category, action, value);
	}

	trackNavigationDataPoint(category: string, action: string, label: string = '', value: number = 0): void
	{
		this._oldNavigator?.trackNavigationDataPoint(category, action, label, value);
	}

	getBoolean(key: string): boolean
	{
		return this._oldNavigator?.getBoolean(key) ?? false;
	}

	getInteger(key: string, defaultValue: number): number
	{
		return this._oldNavigator?.getInteger(key, defaultValue) ?? defaultValue;
	}

	getProperty(key: string, params?: Record<string, string>): string
	{
		return this._oldNavigator?.getProperty(key, params) ?? '';
	}

	goToHomeRoom(): boolean
	{
		this._newNavigator?.goToHomeRoom();

		return true;
	}

	performTagSearch(tag: string): void
	{
		this._newNavigator?.performTagSearch(tag);
	}

	performTextSearch(text: string): void
	{
		this._newNavigator?.performTextSearch(text);
	}

	performGuildBaseSearch(): void
	{
		this._newNavigator?.performSearch('groups');
	}

	performCompetitionRoomsSearch(_goalId: number, _pageIndex: number): void
	{
		this._newNavigator?.performSearch('competition');
	}

	showOwnRooms(): void
	{
		this._newNavigator?.performSearch('myworld_view');
	}

	goToPrivateRoom(roomId: number): void
	{
		this._newNavigator?.goToRoom(roomId);
	}

	hasRoomRightsButIsNotOwner(roomId: number): boolean
	{
		return this._oldNavigator?.hasRoomRightsButIsNotOwner(roomId) ?? false;
	}

	removeRoomRights(roomId: number): void
	{
		this._oldNavigator?.removeRoomRights(roomId);
	}

	goToRoomNetwork(roomId: number, useHomeRoom: boolean): void
	{
		this._oldNavigator?.goToRoomNetwork(roomId, useHomeRoom);
	}

	startRoomCreation(): void
	{
		(this._newNavigator as any)?.createRoom?.();
	}

	createRoom(name: string, description: string, model: string, categoryId: number, maxUsers: number, tradeMode: number): void
	{
		this._oldNavigator?.createRoom(name, description, model, categoryId, maxUsers, tradeMode);
	}

	openNavigator(): void
	{
		this._newNavigator?.open();
	}

	closeNavigator(): void
	{
		this._newNavigator?.close();
	}

	toggleRoomInfoVisibility(): void
	{
		this._roomInfoViewCtrl?.toggle();
	}

	canRateRoom(): boolean
	{
		return this._oldNavigator?.canRateRoom() ?? false;
	}

	isRoomFavorite(roomId: number): boolean
	{
		return this._oldNavigator?.isRoomFavorite(roomId) ?? false;
	}

	isRoomHome(roomId: number): boolean
	{
		return this._oldNavigator?.isRoomHome(roomId) ?? false;
	}

	dispose(): void
	{
		this._roomSettingsCtrl.dispose();
		this._roomInfoViewCtrl.dispose();
		this._roomCreateViewCtrl.dispose();
		this._passwordInput.dispose();
		this._doorbell.dispose();
		this._officialRoomEntryManager.dispose();
		this._roomEventViewCtrl.dispose();
		this._roomEventInfoCtrl.dispose();
		this._roomFilterCtrl.dispose();
		this._enforceCategoryCtrl.dispose();
		this._oldNavigator = null;
		this._newNavigator = null;
	}
}
