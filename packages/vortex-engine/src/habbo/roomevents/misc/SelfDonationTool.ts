import {Component, ComponentDependency} from '@core/runtime';
import type {IContext} from '@core/runtime';
import type {IAssetLibrary} from '@core/assets';
import type {IMessageEvent} from '@core/communication/messages/IMessageEvent';
import type {ILinkEventTracker} from '@core/runtime/events/ILinkEventTracker';

import {IID_HabboCommunicationManager} from '@iid/IIDHabboCommunicationManager';
import type {IHabboCommunicationManager} from '@habbo/communication/IHabboCommunicationManager';
import type {IHabboLocalizationManager} from '@habbo/localization/IHabboLocalizationManager';
import type {IFurnitureData} from '@habbo/session/furniture/IFurnitureData';
import type {
    ChestItemType
} from '@habbo/communication/messages/parser/userdefinedroomevents/wiredtrading/trade/requirements/ChestItemType';
import {
    SelfDonationResultMessageEvent
} from '@habbo/communication/messages/incoming/userdefinedroomevents/misc/SelfDonationResultMessageEvent';
import type {
    SelfDonationResultMessageParser
} from '@habbo/communication/messages/parser/userdefinedroomevents/misc/SelfDonationResultMessageParser';
import {
    SelfDonationComposer
} from '@habbo/communication/messages/outgoing/userdefinedroomevents/misc/SelfDonationComposer';

import type {HabboUserDefinedRoomEvents} from '../HabboUserDefinedRoomEvents';
import type {PresetManager} from '../wired_setup/uibuilder/PresetManager';
import {UbuntuPresetManager} from '../wired_trading/UbuntuPresetManager';
import type {ISelfDonationTool} from './ISelfDonationTool';
import {SelfDonationToolView} from './SelfDonationToolView';

/**
 * SelfDonationTool — a sandbox-only window that gives the player furniture, opened by the
 * `selfdonation/open` link.
 *
 * **It is gated three times over**, which is deliberate rather than redundant: `open()` refuses
 * outside a sandbox environment so the window cannot be shown, `validate()` refuses again before
 * sending so a link that slipped through cannot donate, and the server refuses a third time. Only
 * the first two are this port's business.
 *
 * There is no toolbar entry — the link tracker is the only way in, which is why the tool can exist
 * in a production build without being reachable.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/roomevents/misc/SelfDonationTool.as
 */
export class SelfDonationTool extends Component implements ILinkEventTracker, ISelfDonationTool
{
    /**
	 * The environments the tool is allowed in. AS3 matches `environment.id` exactly against this
	 * list — there is no prefix or pattern rule, so a new sandbox has to be added here.
	 */
    // AS3: SelfDonationTool.as::ALLOWED_ENVIRONMENT_IDS
    private static readonly ALLOWED_ENVIRONMENT_IDS: string[] = ['s1', 's2', 'd63', 'dev', 'local'];

    // AS3: SelfDonationTool.as::_communication
    private _communication: IHabboCommunicationManager | null = null;

    // AS3: SelfDonationTool.as::_roomEvents
    private _roomEvents: HabboUserDefinedRoomEvents;

    // AS3: SelfDonationTool.as::_SafeStr_4640 (name derived: the preset manager)
    private _presetManager: PresetManager | null;

    // AS3: SelfDonationTool.as::_SafeStr_4550 (name derived: the view)
    private _view: SelfDonationToolView | null = null;

    // AS3: SelfDonationTool.as::_messageEvents
    private _messageEvents: IMessageEvent[] = [];

    // AS3: SelfDonationTool.as::_SafeStr_5769 (name derived: disposed)
    private _toolDisposed: boolean = false;

    // AS3: SelfDonationTool.as::SelfDonationTool()
    constructor(roomEvents: HabboUserDefinedRoomEvents, context: IContext, flags: number = 0, assets: IAssetLibrary | null = null)
    {
        super(context, flags, assets);

        this._roomEvents = roomEvents;
        this._presetManager = new UbuntuPresetManager(roomEvents);
    }

    // AS3: SelfDonationTool.as::get dependencies()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- variance: typed ComponentDependency<T> is contravariant in T
    protected override get dependencies(): Array<ComponentDependency<any>>
    {
        return [
            new ComponentDependency(
                IID_HabboCommunicationManager,
                (manager: IHabboCommunicationManager | null) => { this._communication = manager; },
                true
            ),
        ];
    }

    // AS3: SelfDonationTool.as::initComponent()
    protected override initComponent(): void
    {
        this.context.addLinkEventTracker(this);

        this._messageEvents = [new SelfDonationResultMessageEvent((event) => this.onSelfDonationResult(event))];

        for(const messageEvent of this._messageEvents)
        {
            this.addMessageEvent(messageEvent);
        }
    }

    // AS3: SelfDonationTool.as::get linkPattern()
    get linkPattern(): string
    {
        return 'selfdonation/';
    }

    // AS3: SelfDonationTool.as::linkReceived()
    linkReceived(link: string): void
    {
        const parts = link.split('/');

        if(parts.length < 2) return;

        if(parts[1] === 'open') this.open();
    }

    // AS3: SelfDonationTool.as::open()
    open(): void
    {
        if(this._toolDisposed) return;
        if(!this.isSandboxEnvironment) return;

        this.ensureView();
        this._view?.showTool();
    }

    /**
	 * Validate, then send. Both refusals raise the same alert title (`wiredfurni.error.title`) with
	 * a different body, which is AS3's shape — there is no separate "no connection" dialog.
	 */
    // AS3: SelfDonationTool.as::onDonate()
    onDonate(item: ChestItemType | null, amount: number): void
    {
        const error = this.validate(item, amount);

        if(error !== null)
        {
            this._roomEvents.windowManager?.alert('${wiredfurni.error.title}', error, 0, null);

            return;
        }

        if(this._communication?.connection == null)
        {
            this._roomEvents.windowManager?.alert(
                '${wiredfurni.error.title}',
                this.localization?.getLocalization('selfdonation.no_connection', 'Connection is not ready yet.')
                    ?? 'Connection is not ready yet.',
                0,
                null
            );

            return;
        }

        this._communication.connection.send(new SelfDonationComposer(
            item!.isWallItem,
            item!.typeId,
            item!.legacyPosterId,
            amount
        ));
    }

    /**
	 * Success and refusal both surface as an alert; only the strings differ. AS3 falls through to
	 * the generic failure for any code it does not know, including 2.
	 */
    // AS3: SelfDonationTool.as::onSelfDonationResult()
    private onSelfDonationResult(event: IMessageEvent): void
    {
        const parser = event.parser as SelfDonationResultMessageParser | null;

        if(parser == null) return;

        let bodyKey: string;
        let titleKey: string;

        switch(parser.resultCode)
        {
            case 0:
                bodyKey = 'selfdonation.result.success';
                titleKey = 'selfdonation.success';
                break;
            case 1:
                bodyKey = 'selfdonation.result.not_allowed';
                titleKey = 'selfdonation.fail';
                break;
            default:
                bodyKey = 'selfdonation.result.failed';
                titleKey = 'selfdonation.fail';
        }

        // AS3 passes the key as its own fallback, so an undefined key shows the key rather than
        // an empty dialog.
        this._roomEvents.windowManager?.alert(
            this.localization?.getLocalization(titleKey, titleKey) ?? titleKey,
            this.localization?.getLocalization(bodyKey, bodyKey) ?? bodyKey,
            0,
            null
        );
    }

    /**
	 * Four refusals, in AS3's order. The last is the interesting one: an item whose furniture data
	 * cannot be resolved is rejected client-side rather than sent and refused, because the wire
	 * carries only a type id and the server would have nothing to report back.
	 */
    // AS3: SelfDonationTool.as::validate()
    private validate(item: ChestItemType | null, amount: number): string | null
    {
        if(!this.isSandboxEnvironment) return this.sandboxWarningText;

        if(item === null)
        {
            return this.localization?.getLocalization('selfdonation.select_item', 'Select a furniture item first.')
                ?? 'Select a furniture item first.';
        }

        if(amount < 1 || amount > SelfDonationToolView.MAX_AMOUNT)
        {
            return this.localization?.getLocalizationWithParams(
                'selfdonation.invalid_amount',
                'Please enter an amount between 1 and %max%.',
                'max', String(SelfDonationToolView.MAX_AMOUNT)
            ) ?? 'Please enter an amount between 1 and 500.';
        }

        if(this.getFurnitureData(item) === null)
        {
            return this.localization?.getLocalization('selfdonation.invalid_item', 'This item cannot be donated from the sandbox tool.')
                ?? 'This item cannot be donated from the sandbox tool.';
        }

        return null;
    }

    // AS3: SelfDonationTool.as::getFurnitureData()
    private getFurnitureData(item: ChestItemType | null): IFurnitureData | null
    {
        const sessionData = this._roomEvents?.sessionDataManager ?? null;

        if(sessionData === null || item === null) return null;

        return item.isWallItem
            ? sessionData.getWallItemData(item.typeId)
            : sessionData.getFloorItemData(item.typeId);
    }

    // AS3: SelfDonationTool.as::ensureView()
    private ensureView(): void
    {
        if(this._view === null && this._presetManager !== null)
        {
            this._view = new SelfDonationToolView(this, this._presetManager);
        }
    }

    // AS3: SelfDonationTool.as::get sandboxWarningText()
    private get sandboxWarningText(): string
    {
        return this.localization?.getLocalization('selfdonation.sandbox_only', 'Self donation only works in the sandbox environment.')
            ?? 'Self donation only works in the sandbox environment.';
    }

    // AS3: SelfDonationTool.as::get roomEvents()
    get roomEvents(): HabboUserDefinedRoomEvents
    {
        return this._roomEvents;
    }

    // AS3: SelfDonationTool.as::get localization()
    private get localization(): IHabboLocalizationManager | null
    {
        return this._roomEvents?.localization ?? null;
    }

    // AS3: SelfDonationTool.as::get isSandboxEnvironment()
    get isSandboxEnvironment(): boolean
    {
        return SelfDonationTool.ALLOWED_ENVIRONMENT_IDS.indexOf(this.getProperty('environment.id') ?? '') !== -1;
    }

    // AS3: SelfDonationTool.as::addMessageEvent()
    private addMessageEvent(event: IMessageEvent): void
    {
        this._communication?.addHabboConnectionMessageEvent(event);
    }

    // AS3: SelfDonationTool.as::removeMessageEvent()
    private removeMessageEvent(event: IMessageEvent): void
    {
        this._communication?.removeHabboConnectionMessageEvent(event);
    }

    // AS3: SelfDonationTool.as::get disposed()
    override get disposed(): boolean
    {
        return this._toolDisposed;
    }

    // AS3: SelfDonationTool.as::dispose()
    override dispose(): void
    {
        if(this._toolDisposed)
        {
            return;
        }

        this._toolDisposed = true;

        for(const messageEvent of this._messageEvents)
        {
            this.removeMessageEvent(messageEvent);
        }

        this._messageEvents = [];

        if(this._view !== null)
        {
            this._view.dispose();
            this._view = null;
        }

        this._presetManager = null;
        this._roomEvents = null as unknown as HabboUserDefinedRoomEvents;
        this._communication = null;

        super.dispose();
    }
}
