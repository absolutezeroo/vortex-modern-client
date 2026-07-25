import {Component, ComponentDependency, type IContext} from '@core/runtime';
import type {IAssetLibrary} from '@core/assets';
import {Logger} from '@core/utils/Logger';
import type {IMessageEvent} from '@core/communication/messages/IMessageEvent';
import type {IHabboCommunicationManager} from '@habbo/communication/IHabboCommunicationManager';
import type {IHabboWindowManager} from '@habbo/window/IHabboWindowManager';
import type {IHabboLocalizationManager} from '@habbo/localization/IHabboLocalizationManager';
import {IID_HabboCommunicationManager} from '@iid/IIDHabboCommunicationManager';
import {IID_HabboWindowManager} from '@iid/IIDHabboWindowManager';
import {IID_HabboLocalizationManager} from '@iid/IIDHabboLocalizationManager';
import {
    VortexFurniEditorDataMessageEvent
} from '@habbo/communication/messages/incoming/vortex/VortexFurniEditorDataMessageEvent';
import {
    VortexFurniEditorRightsMessageEvent
} from '@habbo/communication/messages/incoming/vortex/VortexFurniEditorRightsMessageEvent';
import type {
    VortexFurniEditorDataMessageParser
} from '@habbo/communication/messages/parser/vortex/VortexFurniEditorDataMessageParser';
import type {
    VortexFurniEditorRightsMessageParser
} from '@habbo/communication/messages/parser/vortex/VortexFurniEditorRightsMessageParser';
import {
    VortexGetFurniEditorDataComposer
} from '@habbo/communication/messages/outgoing/vortex/VortexGetFurniEditorDataComposer';
import {
    VortexApplyFurniEditComposer
} from '@habbo/communication/messages/outgoing/vortex/VortexApplyFurniEditComposer';
import {
    VortexGetFurniDefinitionComposer
} from '@habbo/communication/messages/outgoing/vortex/VortexGetFurniDefinitionComposer';
import {
    VortexApplyFurniDefinitionComposer
} from '@habbo/communication/messages/outgoing/vortex/VortexApplyFurniDefinitionComposer';
import {
    VortexFurniDefinitionMessageEvent
} from '@habbo/communication/messages/incoming/vortex/VortexFurniDefinitionMessageEvent';
import type {
    VortexFurniDefinitionMessageParser
} from '@habbo/communication/messages/parser/vortex/VortexFurniDefinitionMessageParser';

import type {IFurniEditorState} from './IFurniEditorState';
import type {IFurniEditPayload} from './IFurniEditPayload';
import {FurniEditorView} from './FurniEditorView';
import {FurniDefinitionView} from './FurniDefinitionView';
import type {IFurniDefinition} from './IFurniDefinition';
import type {IHabboFurniEditor} from './IHabboFurniEditor';

/* eslint-disable @typescript-eslint/no-explicit-any */

const log = Logger.getLogger('HabboFurniEditor');

/**
 * The Vortex furni editor.
 *
 * NOT ported from AS3 — this tool has no Habbo equivalent, so there is no AS3 source to trace to.
 * It follows the project's manager convention (DI Component + IID) rather than inventing a new
 * lifecycle.
 *
 * Holds no authoritative state of its own: every value shown comes from the server's editor-data
 * message, and every commit is echoed back by the same message. The room's own live refresh (the
 * furni visibly moving for everyone in the room) is not this component's doing — the server
 * broadcasts the ordinary ObjectUpdate / ObjectDataUpdate / ItemUpdate composers that
 * RoomMessageHandler already handles.
 */
export class HabboFurniEditor extends Component implements IHabboFurniEditor
{
    private _communication: IHabboCommunicationManager | null = null;
    private _windowManager: IHabboWindowManager | null = null;
    private _localization: IHabboLocalizationManager | null = null;
    private _messageEvents: IMessageEvent[] = [];
    private _view: FurniEditorView | null = null;
    private _definitionView: FurniDefinitionView | null = null;

    private _canEdit: boolean = false;
    private _openObjectId: number = -1;

    constructor(context: IContext, flags: number = 0, assetLibrary: IAssetLibrary | null = null)
    {
        super(context, flags, assetLibrary);
    }

    protected override get dependencies(): Array<ComponentDependency<any>>
    {
        return [
            new ComponentDependency(
                IID_HabboCommunicationManager,
                (manager: IHabboCommunicationManager | null) =>
                {
                    this._communication = manager;
                },
                true
            ),
            new ComponentDependency(
                IID_HabboWindowManager,
                (manager: IHabboWindowManager | null) =>
                {
                    this._windowManager = manager;
                },
                true
            ),
            new ComponentDependency(
                IID_HabboLocalizationManager,
                (manager: IHabboLocalizationManager | null) =>
                {
                    this._localization = manager;
                },
                false
            ),
        ];
    }

    get canEdit(): boolean
    {
        return this._canEdit;
    }

    protected override initComponent(): void
    {
        this.addMessageEvent(
            new VortexFurniEditorRightsMessageEvent(this.onFurniEditorRights.bind(this))
        );
        this.addMessageEvent(
            new VortexFurniEditorDataMessageEvent(this.onFurniEditorData.bind(this))
        );
        this.addMessageEvent(
            new VortexFurniDefinitionMessageEvent(this.onFurniDefinition.bind(this))
        );
    }

    open(objectId: number): void
    {
        if(this._disposed || !this._canEdit) return;

        this._openObjectId = objectId;

        this.getOrCreateView()?.show();

        this.requestState(objectId);
    }

    close(): void
    {
        this._openObjectId = -1;
        this._view?.hide();
    }

    private getOrCreateView(): FurniEditorView | null
    {
        if(this._view != null) return this._view;

        if(this._windowManager == null)
        {
            log.warn('Cannot open the furni editor: no window manager');

            return null;
        }

        this._view = new FurniEditorView(
            this._windowManager,
            this._localization,
            this.onCommitField.bind(this),
            this.requestState.bind(this),
            this.openDefinition.bind(this)
        );

        return this._view;
    }

    /**
     * Opens the furniture *definition* editor. Gated on the same capability flag as the placed-item
     * editor client-side, but the server checks `furniture.definition.edit` separately — a hotel can
     * grant one without the other, and the definition window simply never receives a row if it does.
     */
    openDefinition(definitionId: number): void
    {
        if(this._disposed || this._windowManager == null) return;

        if(this._definitionView == null)
        {
            this._definitionView = new FurniDefinitionView(
                this._windowManager,
                this._localization,
                this.onSaveDefinition.bind(this),
                this.requestDefinition.bind(this)
            );
        }

        this._definitionView.show();

        this.requestDefinition(definitionId);
    }

    private requestDefinition(definitionId: number): void
    {
        this._communication?.connection?.send(new VortexGetFurniDefinitionComposer(definitionId));
    }

    private onSaveDefinition(definition: IFurniDefinition): void
    {
        if(this._disposed) return;

        this._communication?.connection?.send(new VortexApplyFurniDefinitionComposer(definition));
    }

    private onFurniDefinition(event: IMessageEvent): void
    {
        const parser = event.parser as VortexFurniDefinitionMessageParser;

        if(parser == null || this._definitionView == null || parser.definition == null) return;

        this._definitionView.setDefinition(parser.definition, parser.error);
    }

    private requestState(objectId: number): void
    {
        this._communication?.connection?.send(new VortexGetFurniEditorDataComposer(objectId));
    }

    /**
     * Sends one field's edit. The payload carries every value the window currently holds, but the
     * mask carries exactly the one bit this commit is for, so the server reads only that field and
     * the rest are inert filler.
     */
    private onCommitField(objectId: number, field: number, payload: IFurniEditPayload): void
    {
        if(this._disposed || !this._canEdit) return;

        this._communication?.connection?.send(
            new VortexApplyFurniEditComposer(
                objectId,
                field,
                payload.x,
                payload.y,
                payload.zHundredths,
                payload.direction,
                payload.wallOffset,
                payload.extraData,
                payload.ownerName,
                payload.definitionId
            )
        );
    }

    private onFurniEditorRights(event: IMessageEvent): void
    {
        const parser = event.parser as VortexFurniEditorRightsMessageParser;

        if(parser == null) return;

        this._canEdit = parser.canEdit;

        // Logged unconditionally: "the button is missing" has two very different causes — the
        // capability was not granted, or the packet never arrived at all — and without this line
        // they look identical from the client.
        log.info(`Furni editor rights received: canEdit=${this._canEdit}`);

        // Losing the right mid-session (a role change) must take the window with it, not just the
        // button that opens it.
        if(!this._canEdit)
        {
            this.close();
        }
    }

    private onFurniEditorData(event: IMessageEvent): void
    {
        const parser = event.parser as VortexFurniEditorDataMessageParser;

        if(parser == null || this._view == null) return;

        // A response for an item the operator has since navigated away from would overwrite the
        // window with the wrong furni.
        if(parser.objectId !== this._openObjectId) return;

        const state: IFurniEditorState = {
            objectId: parser.objectId,
            productType: parser.productType,
            definitionId: parser.definitionId,
            spriteId: parser.spriteId,
            definitionName: parser.definitionName,
            x: parser.x,
            y: parser.y,
            zHundredths: parser.zHundredths,
            direction: parser.direction,
            wallOffset: parser.wallOffset,
            extraData: parser.extraData,
            ownerId: parser.ownerId,
            ownerName: parser.ownerName,
            error: parser.error
        };

        this._view.setState(state);
    }

    private addMessageEvent(event: IMessageEvent): void
    {
        if(this._communication != null)
        {
            this._communication.addMessageEvent(event);
            this._messageEvents.push(event);
        }
    }

    override dispose(): void
    {
        if(this._disposed) return;

        for(const event of this._messageEvents)
        {
            this._communication?.removeMessageEvent(event);
        }

        this._messageEvents = [];

        this._view?.dispose();
        this._view = null;

        this._definitionView?.dispose();
        this._definitionView = null;

        this._communication = null;
        this._windowManager = null;
        this._localization = null;

        super.dispose();
    }
}
