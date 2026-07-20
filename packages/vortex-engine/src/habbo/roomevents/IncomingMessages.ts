import type {IDisposable} from '@core/runtime/IDisposable';
import type {IMessageEvent} from '@core/communication/messages/IMessageEvent';
import {Logger} from '@core/utils/Logger';

import type {HabboUserDefinedRoomEvents} from './HabboUserDefinedRoomEvents';
import {OpenMessageComposer} from '@habbo/communication/messages/outgoing/userdefinedroomevents/OpenMessageComposer';

// Incoming events consumed by the wired system
import {WiredFurniTriggerEvent} from '@habbo/communication/messages/incoming/userdefinedroomevents/WiredFurniTriggerEvent';
import {WiredFurniActionEvent} from '@habbo/communication/messages/incoming/userdefinedroomevents/WiredFurniActionEvent';
import {WiredFurniConditionEvent} from '@habbo/communication/messages/incoming/userdefinedroomevents/WiredFurniConditionEvent';
import {WiredFurniAddonEvent} from '@habbo/communication/messages/incoming/userdefinedroomevents/WiredFurniAddonEvent';
import {WiredFurniVariableEvent} from '@habbo/communication/messages/incoming/userdefinedroomevents/WiredFurniVariableEvent';
import {WiredFurniSelectorEvent} from '@habbo/communication/messages/incoming/userdefinedroomevents/WiredFurniSelectorEvent';
import {WiredValidationErrorEvent} from '@habbo/communication/messages/incoming/userdefinedroomevents/WiredValidationErrorEvent';
import {WiredSaveSuccessEvent} from '@habbo/communication/messages/incoming/userdefinedroomevents/WiredSaveSuccessEvent';
import {WiredRewardResultMessageEvent} from '@habbo/communication/messages/incoming/userdefinedroomevents/WiredRewardResultMessageEvent';
import {OpenEvent} from '@habbo/communication/messages/incoming/userdefinedroomevents/OpenEvent';
import {GuildMembershipsMessageEvent} from '@habbo/communication/messages/incoming/users/GuildMembershipsMessageEvent';
import {ObjectRemoveMessageEvent} from '@habbo/communication/messages/incoming/room/engine/ObjectRemoveMessageEvent';
import {UserObjectMessageEvent} from '@habbo/communication/messages/incoming/handshake/UserObjectMessageEvent';
import {CloseConnectionMessageEvent} from '@habbo/communication/messages/incoming/room/session/CloseConnectionMessageEvent';

import type {Triggerable} from '@habbo/communication/messages/incoming/userdefinedroomevents/Triggerable';
import type {OpenMessageParser} from '@habbo/communication/messages/parser/userdefinedroomevents/OpenMessageParser';
import type {WiredValidationErrorParser} from '@habbo/communication/messages/parser/userdefinedroomevents/WiredValidationErrorParser';
import type {WiredRewardResultMessageEventParser} from '@habbo/communication/messages/parser/userdefinedroomevents/WiredRewardResultMessageEventParser';
import type {UserObjectMessageParser} from '@habbo/communication/messages/parser/handshake/UserObjectMessageParser';
import type {ObjectRemoveMessageParser} from '@habbo/communication/messages/parser/room/engine/ObjectRemoveMessageParser';

const log = Logger.getLogger('IncomingMessages');

/**
 * IncomingMessages — registers the wired system's incoming message handlers on the connection and
 * routes each to the wired-setup controller: the six furni definition pushes feed
 * wiredCtrl.prepareForUpdate(def); open/save/validation/reward/room-lifecycle events drive the rest.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/roomevents/_SafeCls_1951.as
 * (real name IncomingMessages, recovered from vortex-flash-client).
 */
export class IncomingMessages implements IDisposable
{
    private _roomEvents: HabboUserDefinedRoomEvents | null;

    private _messageEvents: IMessageEvent[];

    // AS3: _SafeCls_1951.as::_SafeCls_1951()
    constructor(roomEvents: HabboUserDefinedRoomEvents)
    {
        this._roomEvents = roomEvents;
        this._messageEvents = [];

        this.addMessageEvent(new WiredFurniVariableEvent((event: IMessageEvent) => this.onVariable(event)));
        this.addMessageEvent(new WiredFurniTriggerEvent((event: IMessageEvent) => this.onTrigger(event)));
        this.addMessageEvent(new WiredFurniConditionEvent((event: IMessageEvent) => this.onCondition(event)));
        this.addMessageEvent(new WiredValidationErrorEvent((event: IMessageEvent) => this.onValidationError(event)));
        this.addMessageEvent(new GuildMembershipsMessageEvent((event: IMessageEvent) => this.onGuildMemberships(event)));
        this.addMessageEvent(new ObjectRemoveMessageEvent((event: IMessageEvent) => this.onObjectRemove(event)));
        this.addMessageEvent(new WiredFurniAddonEvent((event: IMessageEvent) => this.onAddon(event)));
        this.addMessageEvent(new OpenEvent((event: IMessageEvent) => this.onOpen(event)));
        this.addMessageEvent(new UserObjectMessageEvent((event: IMessageEvent) => this.onUserObject(event)));
        this.addMessageEvent(new CloseConnectionMessageEvent((event: IMessageEvent) => this.onRoomExit(event)));
        this.addMessageEvent(new WiredFurniActionEvent((event: IMessageEvent) => this.onAction(event)));
        this.addMessageEvent(new WiredSaveSuccessEvent((event: IMessageEvent) => this.onSaveSuccess(event)));
        this.addMessageEvent(new WiredRewardResultMessageEvent((event: IMessageEvent) => this.onRewardFailed(event)));
        this.addMessageEvent(new WiredFurniSelectorEvent((event: IMessageEvent) => this.onSelector(event)));
    }

    // AS3: _SafeCls_1951.as::addMessageEvent()
    private addMessageEvent(event: IMessageEvent): void
    {
        const registered = this._roomEvents?.communication?.addHabboConnectionMessageEvent(event);
        if(registered) this._messageEvents.push(registered);
    }

    // AS3: _SafeCls_1951.as::onOpen()
    private onOpen(event: IMessageEvent): void
    {
        const parser = event.parser as OpenMessageParser;
        this._roomEvents?.send(new OpenMessageComposer(parser.stuffId));
    }

    // AS3: _SafeCls_1951.as::onTrigger()
    private onTrigger(event: IMessageEvent): void
    {
        this._roomEvents?.wiredCtrl.prepareForUpdate((event.parser as unknown as { def: Triggerable }).def);
    }

    // AS3: _SafeCls_1951.as::onAction()
    private onAction(event: IMessageEvent): void
    {
        this._roomEvents?.wiredCtrl.prepareForUpdate((event.parser as unknown as { def: Triggerable }).def);
    }

    // AS3: _SafeCls_1951.as::onCondition()
    private onCondition(event: IMessageEvent): void
    {
        this._roomEvents?.wiredCtrl.prepareForUpdate((event.parser as unknown as { def: Triggerable }).def);
    }

    // AS3: _SafeCls_1951.as::onAddon()
    private onAddon(event: IMessageEvent): void
    {
        this._roomEvents?.wiredCtrl.prepareForUpdate((event.parser as unknown as { def: Triggerable }).def);
    }

    // AS3: _SafeCls_1951.as::onVariable()
    private onVariable(event: IMessageEvent): void
    {
        this._roomEvents?.wiredCtrl.prepareForUpdate((event.parser as unknown as { def: Triggerable }).def);
    }

    // AS3: _SafeCls_1951.as::onSelector()
    private onSelector(event: IMessageEvent): void
    {
        this._roomEvents?.wiredCtrl.prepareForUpdate((event.parser as unknown as { def: Triggerable }).def);
    }

    // AS3: _SafeCls_1951.as::onUserObject()
    private onUserObject(event: IMessageEvent): void
    {
        if(!this._roomEvents) return;
        const parser = event.parser as UserObjectMessageParser;
        this._roomEvents.userName = parser.name;
    }

    // AS3: _SafeCls_1951.as::onRoomExit()
    private onRoomExit(_event: IMessageEvent): void
    {
        this._roomEvents?.wiredCtrl.close();
    }

    // AS3: _SafeCls_1951.as::onObjectRemove()
    private onObjectRemove(event: IMessageEvent): void
    {
        const parser = event.parser as ObjectRemoveMessageParser;
        log.debug(`Received object remove event: ${parser.objectId}, ${parser.isExpired}`);
        this._roomEvents?.wiredCtrl.stuffRemoved(parser.objectId);
    }

    // AS3: _SafeCls_1951.as::onRewardFailed()
    private onRewardFailed(event: IMessageEvent): void
    {
        if(!this._roomEvents) return;
        const parser = event.parser as WiredRewardResultMessageEventParser;
        const localization = this._roomEvents.localization;
        const windowManager = this._roomEvents.windowManager;

        if(parser.reason === 6)
        {
            windowManager?.alert(localization.getLocalization('wiredfurni.rewardsuccess.title'), localization.getLocalization('wiredfurni.rewardsuccess.body'), 0, null);
        }
        else if(parser.reason === 7)
        {
            windowManager?.alert(localization.getLocalization('wiredfurni.badgereceived.title'), localization.getLocalization('wiredfurni.badgereceived.body'), 0, null);
        }
        else
        {
            windowManager?.alert(localization.getLocalization('wiredfurni.rewardfailed.title'), localization.getLocalization('wiredfurni.rewardfailed.reason.' + parser.reason), 0, null);
        }
    }

    // AS3: _SafeCls_1951.as::onValidationError()
    private onValidationError(event: IMessageEvent): void
    {
        if(!this._roomEvents) return;
        const parser = event.parser as WiredValidationErrorParser;

        const paramMap: Map<string, string> = new Map<string, string>();
        for(const param of parser.parameters)
        {
            paramMap.set(param.key, param.value);
        }

        const message: string = this._roomEvents.localization.getLocalizationWithParamMap(parser.localizationKey, parser.localizationKey, paramMap);
        const title: string = this._roomEvents.localization.getLocalization('wiredfurni.error.title', 'Update failed');
        this._roomEvents.windowManager?.alert(title, message, 0, null);
        this._roomEvents.wiredCtrl.onSaveFailure();
    }

    // AS3: _SafeCls_1951.as::onSaveSuccess()
    private onSaveSuccess(_event: IMessageEvent): void
    {
        this._roomEvents?.wiredCtrl.onSaveSuccess();
    }

    // AS3: _SafeCls_1951.as::onGuildMemberships()
    private onGuildMemberships(event: IMessageEvent): void
    {
        this._roomEvents?.wiredCtrl.onGuildMemberships(event);
    }

    // AS3: _SafeCls_1951.as::dispose()
    dispose(): void
    {
        if(this.disposed) return;

        const communication = this._roomEvents?.communication;
        if(this._messageEvents != null && communication != null)
        {
            for(const messageEvent of this._messageEvents)
            {
                communication.removeHabboConnectionMessageEvent(messageEvent);
            }
        }
        this._roomEvents = null;
    }

    // AS3: _SafeCls_1951.as::get disposed()
    get disposed(): boolean
    {
        return this._roomEvents === null;
    }
}
