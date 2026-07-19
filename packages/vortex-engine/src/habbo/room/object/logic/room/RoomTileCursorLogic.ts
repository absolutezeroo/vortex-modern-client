/**
 * RoomTileCursorLogic
 *
 * @see source_as_win63/habbo/room/object/logic/room/RoomTileCursorLogic.as
 *
 * Logic for the tile cursor (hover indicator on floor tiles).
 * Shows the cursor position and optionally a height number when stacking is high.
 */
import {ObjectLogicBase} from '@room/object/logic/ObjectLogicBase';
import type {RoomObjectUpdateMessage} from '@room/messages/RoomObjectUpdateMessage';
import {RoomObjectTileCursorUpdateMessage} from '@habbo/room/messages/RoomObjectTileCursorUpdateMessage';

export class RoomTileCursorLogic extends ObjectLogicBase
{
    private static readonly STATE_ENABLED: number = 0;
    private static readonly STATE_DISABLED: number = 1;
    private static readonly STATE_SHOW_TILE_HEIGHT: number = 6;

    private _lastSourceEventId: string | null = null;
    private _hiddenOnPurpose: boolean = false;

    override getEventTypes(): string[]
    {
        return [];
    }

    /**
	 * @see AS3 RoomTileCursorLogic.initialize()
	 */
    override initialize(_data: unknown): void
    {
        if(this.object !== null)
        {
            const model = this.object.getModelController();

            if(model !== null)
            {
                model.setNumber('furniture_alpha_multiplier', 1);

                this.object.setState(RoomTileCursorLogic.STATE_DISABLED, 0);
            }
        }
    }

    /**
	 * Process tile cursor update messages.
	 *
	 * @see AS3 RoomTileCursorLogic.processUpdateMessage()
	 */
    override processUpdateMessage(message: RoomObjectUpdateMessage): void
    {
        const cursorMessage = message instanceof RoomObjectTileCursorUpdateMessage ? message : null;

        if(cursorMessage === null)
        {
            return;
        }

        // Skip duplicate events from the same source
        if(this._lastSourceEventId !== null && this._lastSourceEventId === cursorMessage.sourceEventId)
        {
            return;
        }

        // Handle visibility toggle
        if(cursorMessage.toggleVisibility)
        {
            this._hiddenOnPurpose = !this._hiddenOnPurpose;
        }

        // Call super to set location/direction from message
        super.processUpdateMessage(message);

        if(this.object !== null)
        {
            if(this._hiddenOnPurpose)
            {
                this.object.setState(RoomTileCursorLogic.STATE_DISABLED, 0);
            }
            else if(!cursorMessage.visible)
            {
                this.object.setState(RoomTileCursorLogic.STATE_DISABLED, 0);
            }
            else
            {
                const height = cursorMessage.height;

                this.object.getModelController().setNumber('tile_cursor_height', height);

                const state = height > 0.8 ? RoomTileCursorLogic.STATE_SHOW_TILE_HEIGHT : RoomTileCursorLogic.STATE_ENABLED;

                this.object.setState(state, 0);
            }
        }

        this._lastSourceEventId = cursorMessage.sourceEventId;
    }
}
