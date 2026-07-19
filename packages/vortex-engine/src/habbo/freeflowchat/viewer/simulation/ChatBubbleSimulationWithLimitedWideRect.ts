import {Rectangle} from 'pixi.js';
import type {PooledChatBubble} from '@habbo/freeflowchat/viewer/visualization/PooledChatBubble';
import {ChatBubbleSimulationEntity} from './ChatBubbleSimulationEntity';

/**
 * ChatBubbleSimulationWithLimitedWideRect
 *
 * A ChatBubbleSimulationEntity variant used for narrow bubbles (width < 240,
 * see ChatFlowStage.insertBubble()) - instead of a wideRect proportional to
 * the bubble's own width (the base class), it gets a fixed 240px-wide
 * wideRect centered on the bubble, offset by a mutable `wideRectOffset` that
 * the collision/relaxation passes can nudge independently of `x`.
 *
 * @see sources/win63_2026_crypted_version/src/com/sulake/habbo/freeflowchat/viewer/simulation/ChatBubbleSimulationWithLimitedWideRect.as
 */
export class ChatBubbleSimulationWithLimitedWideRect extends ChatBubbleSimulationEntity
{
    /** AS3: ChatBubbleSimulationWithLimitedWideRect.as::WIDERECT_WIDTH */
    static readonly WIDERECT_WIDTH = 240;

    private _wideRectOffset: number;

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/freeflowchat/viewer/simulation/ChatBubbleSimulationWithLimitedWideRect.as::ChatBubbleSimulationWithLimitedWideRect()
    constructor(bubble: PooledChatBubble)
    {
        super(bubble, false);

        this._wideRect = new Rectangle();
        this._wideRect.width = ChatBubbleSimulationWithLimitedWideRect.WIDERECT_WIDTH;
        this._wideRect.height = this._visualRect.height / 2;
        this._wideRectOffset = -(ChatBubbleSimulationWithLimitedWideRect.WIDERECT_WIDTH - this._visualRect.width) / 2;
        this._wideRect.x = this._visualRect.x + this._wideRectOffset;
        this._wideRect.y = this._visualRect.y;
    }

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/freeflowchat/viewer/simulation/ChatBubbleSimulationWithLimitedWideRect.as::get x()
    // Not overridden in AS3 either - re-declared here only because JS/TS accessor
    // pairs are defined per-prototype-level (unlike AS3's independently overridable
    // get/set method slots), so overriding just the setter below would otherwise
    // shadow the inherited getter entirely.
    override get x(): number
    {
        return super.x;
    }

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/freeflowchat/viewer/simulation/ChatBubbleSimulationWithLimitedWideRect.as::set x()
    override set x(value: number)
    {
        this._x += (value - this._x) * (1 - ChatBubbleSimulationWithLimitedWideRect.MOVE_NEGATIVE_FEEDBACK);
        this._visualRect.x = this._x;

        if(this._wideRect) this._wideRect.x = this._visualRect.x + this._wideRectOffset;
    }

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/freeflowchat/viewer/simulation/ChatBubbleSimulationWithLimitedWideRect.as::initializePosition()
    override initializePosition(x: number, y: number): void
    {
        const overlap = this._visualization?.overlap ?? null;

        this._x = x + (overlap ? overlap.x : 0);
        this._y = y + (overlap ? overlap.y : 0);
        this._visualRect.x = this._x;
        this._visualRect.y = this._y;

        if(this._wideRect)
        {
            this._wideRect.x = this._visualRect.x + this._wideRectOffset;
            this._wideRect.y = this._visualRect.y;
        }
    }

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/freeflowchat/viewer/simulation/ChatBubbleSimulationWithLimitedWideRect.as::get wideRectOffset()
    get wideRectOffset(): number
    {
        return this._wideRectOffset;
    }

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/freeflowchat/viewer/simulation/ChatBubbleSimulationWithLimitedWideRect.as::set wideRectOffset()
    set wideRectOffset(value: number)
    {
        this._wideRectOffset = value;
    }
}
