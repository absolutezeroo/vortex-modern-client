import {Rectangle} from 'pixi.js';
import type {PooledChatBubble} from '@habbo/freeflowchat/viewer/visualization/PooledChatBubble';

/**
 * ChatBubbleSimulationEntity
 *
 * Per-bubble physics state driven by ChatFlowStage's collision-avoidance
 * simulation. Wraps a live PooledChatBubble with a `visualRect` (its real
 * on-screen box, minus style overlap) and an optional wider `wideRect` used
 * only for intersection tests - so two bubbles from the same speaker "reach"
 * toward each other for gravity/collision purposes even before their visual
 * boxes actually touch. `x`/`y` here are the simulated position; syncToVisualization()
 * pushes them back onto the real PooledChatBubble via moveTo()/warpTo().
 *
 * @see sources/win63_2026_crypted_version/src/com/sulake/habbo/freeflowchat/viewer/simulation/ChatBubbleSimulationEntity.as
 */
export class ChatBubbleSimulationEntity
{
    /** AS3: ChatBubbleSimulationEntity.as::VISUALIZATION_OVERLAP_VERTICAL */
    static readonly VISUALIZATION_OVERLAP_VERTICAL = 10;

    /** AS3: ChatBubbleSimulationEntity.as::MOVE_NEGATIVE_FEEDBACK */
    protected static readonly MOVE_NEGATIVE_FEEDBACK = 0.1;

    private static readonly WIDE_RECT_MARGIN = 2500;

    protected _visualization: PooledChatBubble | null;
    protected _x: number;
    protected _y: number;
    protected readonly _visualRect: Rectangle = new Rectangle();
    protected _wideRect: Rectangle | null = null;

    private _horizontalImpulse: number = 0;
    private _verticalImpulse: number = 0;
    private _lastUserScreenPositionX: number;
    private _warpNextSync: boolean = false;
    private _collisionHandled: ChatBubbleSimulationEntity[] = [];
    private _isSpacer: boolean = false;

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/freeflowchat/viewer/simulation/ChatBubbleSimulationEntity.as::ChatBubbleSimulationEntity()
    constructor(bubble: PooledChatBubble, wideRect: boolean = false)
    {
        this._visualization = bubble;

        const overlap = bubble.overlap;

        this._x = bubble.x + (overlap ? overlap.x : 0);
        this._y = bubble.y + (overlap ? overlap.y : 0);

        this._visualRect.x = this._x;
        this._visualRect.y = this._y;
        this._visualRect.width = bubble.width - (overlap ? overlap.x + overlap.width : 0);
        this._visualRect.height = bubble.displayedHeight - ChatBubbleSimulationEntity.VISUALIZATION_OVERLAP_VERTICAL - (overlap ? overlap.y + overlap.height : 0);

        if(bubble.minHeight !== -1) this._visualRect.height = bubble.minHeight;

        if(wideRect)
        {
            this._wideRect = new Rectangle();
            this._wideRect.width = this._visualRect.width + 2 * ChatBubbleSimulationEntity.WIDE_RECT_MARGIN;
            this._wideRect.height = bubble.minHeight !== -1 ? bubble.minHeight : this._visualRect.height / 2;
            this._wideRect.x = this._visualRect.x - ChatBubbleSimulationEntity.WIDE_RECT_MARGIN;
            this._wideRect.y = this._visualRect.y;
        }

        this._lastUserScreenPositionX = bubble.scrolledUserPositionX;
    }

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/freeflowchat/viewer/simulation/ChatBubbleSimulationEntity.as::dispose()
    dispose(): void
    {
        if(this._visualization) this._visualization.readyToRecycle = true;

        this._visualization = null;
    }

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/freeflowchat/viewer/simulation/ChatBubbleSimulationEntity.as::get y()
    get y(): number
    {
        return this._y;
    }

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/freeflowchat/viewer/simulation/ChatBubbleSimulationEntity.as::set y()
    set y(value: number)
    {
        this._y = value;
        this._visualRect.y = this._y;

        if(this._wideRect) this._wideRect.y = this._visualRect.y;
    }

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/freeflowchat/viewer/simulation/ChatBubbleSimulationEntity.as::get x()
    get x(): number
    {
        return this._x;
    }

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/freeflowchat/viewer/simulation/ChatBubbleSimulationEntity.as::set x()
    // Applies the impulse with negative feedback (only 90% of the delta lands
    // each call) rather than snapping straight to the target - this is what
    // keeps repeated small impulses across simulate()'s iterations smooth
    // instead of oscillating.
    set x(value: number)
    {
        this._x += (value - this._x) * (1 - ChatBubbleSimulationEntity.MOVE_NEGATIVE_FEEDBACK);
        this._visualRect.x = this._x;

        if(this._wideRect) this._wideRect.x = this._visualRect.x - ChatBubbleSimulationEntity.WIDE_RECT_MARGIN;
    }

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/freeflowchat/viewer/simulation/ChatBubbleSimulationEntity.as::get visualRect()
    get visualRect(): Rectangle
    {
        return this._visualRect;
    }

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/freeflowchat/viewer/simulation/ChatBubbleSimulationEntity.as::get wideRect()
    get wideRect(): Rectangle
    {
        return this._wideRect ?? this._visualRect;
    }

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/freeflowchat/viewer/simulation/ChatBubbleSimulationEntity.as::get hasWideRect()
    get hasWideRect(): boolean
    {
        return this._wideRect !== null;
    }

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/freeflowchat/viewer/simulation/ChatBubbleSimulationEntity.as::get centerX()
    get centerX(): number
    {
        return this._x + this._visualRect.width / 2;
    }

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/freeflowchat/viewer/simulation/ChatBubbleSimulationEntity.as::initializePosition()
    initializePosition(x: number, y: number): void
    {
        const overlap = this._visualization?.overlap ?? null;

        this._x = x + (overlap ? overlap.x : 0);
        this._y = y + (overlap ? overlap.y : 0);
        this._visualRect.x = this._x;
        this._visualRect.y = this._y;

        if(this._wideRect)
        {
            this._wideRect.x = this._visualRect.x - ChatBubbleSimulationEntity.WIDE_RECT_MARGIN;
            this._wideRect.y = this._visualRect.y;
        }
    }

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/freeflowchat/viewer/simulation/ChatBubbleSimulationEntity.as::addHorizontalImpulse()
    addHorizontalImpulse(value: number): void
    {
        this._horizontalImpulse += value;
    }

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/freeflowchat/viewer/simulation/ChatBubbleSimulationEntity.as::addCollisionHandled()
    addCollisionHandled(other: ChatBubbleSimulationEntity): void
    {
        this._collisionHandled.push(other);
    }

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/freeflowchat/viewer/simulation/ChatBubbleSimulationEntity.as::hasCollidedWith()
    hasCollidedWith(other: ChatBubbleSimulationEntity): boolean
    {
        return this._collisionHandled.indexOf(other) !== -1;
    }

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/freeflowchat/viewer/simulation/ChatBubbleSimulationEntity.as::addVerticalImpulse()
    addVerticalImpulse(value: number): void
    {
        this._verticalImpulse += value;
    }

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/freeflowchat/viewer/simulation/ChatBubbleSimulationEntity.as::applyImpulseForces()
    applyImpulseForces(upwardLimit: number): void
    {
        this.x += this._horizontalImpulse;
        this.y += Math.max(this._verticalImpulse, -upwardLimit);
    }

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/freeflowchat/viewer/simulation/ChatBubbleSimulationEntity.as::resetSimulationStep()
    resetSimulationStep(): void
    {
        this._horizontalImpulse = 0;
        this._verticalImpulse = 0;
        this._collisionHandled = [];
    }

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/freeflowchat/viewer/simulation/ChatBubbleSimulationEntity.as::syncToVisualization()
    syncToVisualization(force: boolean = false): void
    {
        if(!this._visualization) return;

        const overlap = this._visualization.overlap;

        force ||= this._warpNextSync;
        this._warpNextSync = false;

        const px = Math.trunc(this._x - (overlap ? overlap.x : 0));
        const py = Math.trunc(this._y - (overlap ? overlap.y : 0));

        if(!force)
        {
            this._visualization.moveTo(px, py);
        }
        else
        {
            this._visualization.warpTo(px, py);
        }
    }

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/freeflowchat/viewer/simulation/ChatBubbleSimulationEntity.as::syncToUserScreenPosition()
    syncToUserScreenPosition(): void
    {
        if(!this._visualization) return;

        const current = this._visualization.scrolledUserPositionX;
        const delta = current - this._lastUserScreenPositionX;

        if(delta !== 0)
        {
            this._x += delta;
            this._visualRect.x += delta;

            if(this._wideRect) this._wideRect.x += delta;

            this._lastUserScreenPositionX = current;
            this._warpNextSync = true;
        }
    }

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/freeflowchat/viewer/simulation/ChatBubbleSimulationEntity.as::set fullHeightCollision()
    set fullHeightCollision(value: boolean)
    {
        if(this._wideRect) this._wideRect.height = value ? this._visualRect.height : this._visualRect.height / 2;
    }

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/freeflowchat/viewer/simulation/ChatBubbleSimulationEntity.as::get visualizationHasHitMargin()
    get visualizationHasHitMargin(): boolean
    {
        return this._visualization?.hasHitDesktopMargin ?? false;
    }

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/freeflowchat/viewer/simulation/ChatBubbleSimulationEntity.as::set readyToRecycle()
    set readyToRecycle(value: boolean)
    {
        if(this._visualization) this._visualization.readyToRecycle = value;
    }

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/freeflowchat/viewer/simulation/ChatBubbleSimulationEntity.as::get readyToRecycle()
    get readyToRecycle(): boolean
    {
        return this._visualization?.readyToRecycle ?? true;
    }

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/freeflowchat/viewer/simulation/ChatBubbleSimulationEntity.as::get timeStamp()
    get timeStamp(): number
    {
        return this._visualization?.timeStamp ?? 0;
    }

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/freeflowchat/viewer/simulation/ChatBubbleSimulationEntity.as::get isSpacer()
    get isSpacer(): boolean
    {
        return this._isSpacer;
    }

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/freeflowchat/viewer/simulation/ChatBubbleSimulationEntity.as::set isSpacer()
    set isSpacer(value: boolean)
    {
        this._isSpacer = value;
    }

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/freeflowchat/viewer/simulation/ChatBubbleSimulationEntity.as::intersectsWith()
    intersectsWith(other: ChatBubbleSimulationEntity): boolean
    {
        if(this._wideRect)
        {
            return this._visualRect.intersects(other._visualRect) || this._wideRect.intersects(other.wideRect);
        }

        if(other._wideRect)
        {
            return this._visualRect.intersects(other._visualRect) || this._visualRect.intersects(other._wideRect);
        }

        return this._visualRect.intersects(other._visualRect);
    }

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/freeflowchat/viewer/simulation/ChatBubbleSimulationEntity.as::visualIntertersectsWith()
    // AS3 spelling typo ("Intertersects") preserved so the trace stays literal.
    visualIntertersectsWith(other: ChatBubbleSimulationEntity): boolean
    {
        return this._visualRect.intersects(other._visualRect);
    }
}
