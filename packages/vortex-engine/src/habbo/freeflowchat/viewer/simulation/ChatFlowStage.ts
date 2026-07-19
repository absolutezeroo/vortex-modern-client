import type {IDisposable, IUpdateReceiver} from '@core/runtime';
import type {IHabboFreeFlowChat} from '@habbo/freeflowchat/IHabboFreeFlowChat';
import type {PooledChatBubble} from '../visualization/PooledChatBubble';
import {ChatBubbleSimulationEntity} from './ChatBubbleSimulationEntity';
import {ChatBubbleSimulationWithLimitedWideRect} from './ChatBubbleSimulationWithLimitedWideRect';
import {ChatBubbleCollisionEvent} from './ChatBubbleCollisionEvent';
import {ChatFlowGravity} from './ChatFlowGravity';

const CLEANUP_TIMER_DELAY = 5000;
/**
 * AS3: ChatFlowStage.as::MOVE_UP_TIMER_DEFAULT - a fallback only reachable if
 * refreshSettings() runs before roomChatSettings exists at all. In practice
 * this never happens (HabboFreeFlowChat self-initializes roomChatSettings in
 * its own constructor, before any ChatFlowStage is ever built) - the real
 * effective default is roomChatSettings.scrollSpeed's own default (1/normal),
 * which refreshSettings() below immediately resolves to 6000ms.
 */
const MOVE_UP_TIMER_DEFAULT = 10000;
const MAX_ITERATIONS = 20;
const MAX_COLLISION_SIDEWAYS_IMPULSE = 15;
const MOVE_UP_IMPULSE_LIMIT = 8;
const MINIMUM_COLLIDER_WIDTH = 240;

/**
 * ChatFlowStage
 *
 * The real AS3 collision-avoidance/gravity physics engine. insertBubble()
 * relaxes a newly-spawned bubble toward its speaker's other bubbles
 * (ChatFlowGravity) before clamping it back near the speaker; every tick
 * runs up to MAX_ITERATIONS rounds of pairwise AABB collision resolution
 * (simulate()) so simultaneously-visible bubbles push each other apart
 * instead of overlapping; scrollUp() jumps every bubble up
 * MOVE_UP_AMOUNT_PIXELS (19px) every scroll interval (6000ms by default -
 * see MOVE_UP_TIMER_DEFAULT's comment above) and re-simulates. Line-by-line
 * mode (spacer bubbles, vertical-only resolution) is ported and reachable
 * once the server sends an account-preferences message with chatMode=1 -
 * HabboFreeFlowChat.onAccountPreferences() is wired, it just defaults to
 * free-flow (mode 0) until a real preference says otherwise.
 *
 * @see sources/win63_2026_crypted_version/src/com/sulake/habbo/freeflowchat/viewer/simulation/ChatFlowStage.as
 */
export class ChatFlowStage implements IUpdateReceiver, IDisposable
{
    /** AS3: ChatFlowStage.as::MOVE_UP_AMOUNT_PIXELS */
    static readonly MOVE_UP_AMOUNT_PIXELS = 19;

    private _chatFlow: IHabboFreeFlowChat | null;
    private _simulationTime: number = 0;
    private _lastScrollTime: number = 0;
    private _lastCleanupTime: number = 0;
    private readonly _gravity: ChatFlowGravity = new ChatFlowGravity();
    private _bubbles: ChatBubbleSimulationEntity[] = [];
    private _toRemove: ChatBubbleSimulationEntity[] = [];

    // AS3 field _SafeStr_11387 ("_-v2") is declared in ChatFlowStage.as but never
    // referenced anywhere in the class - dead in the source itself, not ported.
    private _lineByLineMode: boolean = false;
    private _scrollIntervalMs: number = MOVE_UP_TIMER_DEFAULT;
    private _gravityEnabled: boolean = true;
    private _viewBottom: number = 0;

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/freeflowchat/viewer/simulation/ChatFlowStage.as::ChatFlowStage()
    constructor(chatFlow: IHabboFreeFlowChat)
    {
        this._chatFlow = chatFlow;
        chatFlow.registerUpdateReceiver(this, 2);
        this.refreshSettings();
    }

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/freeflowchat/viewer/simulation/ChatFlowStage.as::refreshSettings()
    refreshSettings(): void
    {
        const settings = this._chatFlow?.roomChatSettings;

        if(!settings) return;

        this._lineByLineMode = settings.mode === 1;
        this._gravityEnabled = !this._lineByLineMode;

        switch(settings.scrollSpeed)
        {
            case 0: this._scrollIntervalMs = 3000; break;
            case 1: this._scrollIntervalMs = 6000; break;
            case 2: this._scrollIntervalMs = 12000; break;
        }
    }

    get disposed(): boolean
    {
        return this._chatFlow === null;
    }

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/freeflowchat/viewer/simulation/ChatFlowStage.as::dispose()
    dispose(): void
    {
        if(this.disposed) return;

        this._chatFlow?.removeUpdateReceiver(this);
        this._chatFlow = null;
    }

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/freeflowchat/viewer/simulation/ChatFlowStage.as::insertBubble()
    insertBubble(bubble: PooledChatBubble): {x: number; y: number}
    {
        const chatFlow = this._chatFlow;

        if(!chatFlow?.chatFlowViewer) return {x: 0, y: 0};

        if(this._viewBottom === 0) this._viewBottom = chatFlow.chatFlowViewer.viewBottom;

        const offset = chatFlow.roomEngine?.getRoomCanvasScreenOffset(bubble.roomId) ?? null;

        bubble.roomPanOffsetX = offset?.x ?? 0;

        const entity = !this._lineByLineMode && bubble.width < MINIMUM_COLLIDER_WIDTH
            ? new ChatBubbleSimulationWithLimitedWideRect(bubble)
            : new ChatBubbleSimulationEntity(bubble, this._lineByLineMode);

        const overlap = bubble.overlap;
        const point = {
            x: bubble.userScreenPos.x - entity.visualRect.width / 2,
            y: chatFlow.chatFlowViewer.viewBottom
        };

        if(offset) point.x -= offset.x;

        point.y -= overlap ? overlap.y : 0;
        point.x -= overlap ? overlap.x : 0;

        entity.initializePosition(point.x, point.y);

        if(this._gravityEnabled && !this._lineByLineMode)
        {
            for(let i = 0; i < MAX_ITERATIONS / 2; i++)
            {
                let pull = 0;

                for(const other of this._bubbles)
                {
                    pull += this._gravity.getAttraction(entity, other, ChatFlowGravity.INPUT_GRAVITY_COEFFICIENT, ChatFlowGravity.INPUT_GRAVITY_MAX_IMPULSE);
                }

                entity.x += pull;
            }

            let clampedX = entity.x;

            const speakerX = bubble.userScreenPos.x - (offset ? offset.x : 0);

            if(entity.x > speakerX - ChatFlowGravity.INPUT_GRAVITY_USERPOS_MARGIN)
            {
                clampedX = speakerX - ChatFlowGravity.INPUT_GRAVITY_USERPOS_MARGIN;

                if(entity instanceof ChatBubbleSimulationWithLimitedWideRect)
                {
                    const delta = entity.x - clampedX;

                    entity.wideRectOffset = Math.min(0, entity.wideRectOffset + delta);
                }
            }
            else if(entity.x + entity.visualRect.width < speakerX + ChatFlowGravity.INPUT_GRAVITY_USERPOS_MARGIN)
            {
                clampedX = speakerX - entity.visualRect.width + ChatFlowGravity.INPUT_GRAVITY_USERPOS_MARGIN;

                if(entity instanceof ChatBubbleSimulationWithLimitedWideRect)
                {
                    const delta = entity.x - clampedX;

                    entity.wideRectOffset = Math.max(-(entity.wideRect.width - entity.visualRect.width), entity.wideRectOffset + delta);
                }
            }

            entity.x = point.x = clampedX;
        }

        this._bubbles.push(entity);

        point.x -= overlap ? overlap.x : 0;

        if(this._lineByLineMode) this._lastScrollTime = this._simulationTime;

        return point;
    }

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/freeflowchat/viewer/simulation/ChatFlowStage.as::update()
    update(deltaMs: number): void
    {
        this._simulationTime += deltaMs;

        for(const entity of this._bubbles)
        {
            if(!entity.isSpacer) entity.syncToUserScreenPosition();
        }

        this.simulate();

        if(this._lastScrollTime + this._scrollIntervalMs < this._simulationTime)
        {
            this.scrollUp();
            this._lastScrollTime = this._simulationTime;
        }

        for(let i = 0; i < this._bubbles.length; i++)
        {
            const entity = this._bubbles[i];

            entity.syncToVisualization();

            if(!entity.isSpacer)
            {
                entity.fullHeightCollision = false;

                if(i > 0 && entity.visualizationHasHitMargin)
                {
                    entity.fullHeightCollision = true;
                    this._bubbles[i - 1].fullHeightCollision = true;
                }
            }
        }

        if(this._lastCleanupTime + CLEANUP_TIMER_DELAY < this._simulationTime)
        {
            this.cleanup();
            this._lastCleanupTime = this._simulationTime;
        }
    }

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/freeflowchat/viewer/simulation/ChatFlowStage.as::clear()
    clear(): void
    {
        for(const entity of this._bubbles) entity.readyToRecycle = true;

        this.update(0);
        this._chatFlow?.chatFlowViewer?.update(0);
    }

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/freeflowchat/viewer/simulation/ChatFlowStage.as::simulate()
    private simulate(): void
    {
        for(let round = 0; round < MAX_ITERATIONS; round++)
        {
            const collisions: ChatBubbleCollisionEvent[] = [];

            for(const entity of this._bubbles)
            {
                entity.resetSimulationStep();

                for(const other of this._bubbles)
                {
                    if(entity !== other && entity.intersectsWith(other))
                    {
                        collisions.push(new ChatBubbleCollisionEvent(entity, other));
                    }
                }
            }

            if(collisions.length === 0) break;

            if(this._lineByLineMode)
            {
                for(const collision of collisions)
                {
                    if(!collision.first.hasCollidedWith(collision.second) && !collision.second.hasCollidedWith(collision.first))
                    {
                        if(collision.areSameY)
                        {
                            collision.older.addVerticalImpulse(-collision.older.wideRect.height);
                        }
                        else
                        {
                            const topBottom = collision.first.visualIntertersectsWith(collision.second)
                                ? collision.top.visualRect.bottom
                                : collision.top.wideRect.bottom;

                            collision.top.addVerticalImpulse(-(topBottom - collision.bottom.y + 1));
                        }
                    }

                    collision.first.addCollisionHandled(collision.second);
                    collision.second.addCollisionHandled(collision.first);
                }
            }
            else
            {
                for(const collision of collisions)
                {
                    if(!collision.first.hasCollidedWith(collision.second) && !collision.second.hasCollidedWith(collision.first))
                    {
                        const leftX = collision.left instanceof ChatBubbleSimulationWithLimitedWideRect
                            ? collision.left.wideRectOffset + collision.left.x
                            : collision.left.x;
                        const rightX = collision.right instanceof ChatBubbleSimulationWithLimitedWideRect
                            ? collision.right.wideRectOffset + collision.right.x
                            : collision.right.x;
                        const leftWidth = collision.left instanceof ChatBubbleSimulationWithLimitedWideRect
                            ? collision.left.wideRect.width
                            : collision.left.visualRect.width;
                        const sidewaysOverlap = Math.abs(leftX + leftWidth - rightX) / 2;

                        if(sidewaysOverlap <= MAX_COLLISION_SIDEWAYS_IMPULSE)
                        {
                            collision.left.addHorizontalImpulse(-sidewaysOverlap);
                            collision.right.addHorizontalImpulse(sidewaysOverlap + 1);
                        }
                        else if(collision.areSameY)
                        {
                            collision.older.addVerticalImpulse(-collision.older.visualRect.height);
                        }
                        else
                        {
                            collision.top.addVerticalImpulse(-(collision.top.visualRect.bottom - collision.bottom.y + 1));
                        }

                        collision.first.addCollisionHandled(collision.second);
                        collision.second.addCollisionHandled(collision.first);
                    }
                }
            }

            for(const entity of this._bubbles) entity.applyImpulseForces(MOVE_UP_IMPULSE_LIMIT);
        }
    }

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/freeflowchat/viewer/simulation/ChatFlowStage.as::scrollUp()
    private scrollUp(): void
    {
        const chatFlow = this._chatFlow;

        if(!chatFlow?.chatFlowViewer) return;

        for(const entity of this._bubbles)
        {
            if(this._gravityEnabled)
            {
                for(const other of this._bubbles)
                {
                    if(entity !== other) entity.x += this._gravity.getAttraction(entity, other);
                }
            }

            entity.y -= ChatFlowStage.MOVE_UP_AMOUNT_PIXELS;
        }

        if(this._lineByLineMode)
        {
            const spacer = chatFlow.chatBubbleFactory?.getNewEmptySpace(ChatFlowStage.MOVE_UP_AMOUNT_PIXELS) ?? null;

            if(spacer)
            {
                this.insertBubble(spacer);

                const last = this._bubbles[this._bubbles.length - 1];

                last.fullHeightCollision = true;
                last.isSpacer = true;
            }
        }

        this.simulate();
    }

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/freeflowchat/viewer/simulation/ChatFlowStage.as::cleanup()
    private cleanup(): void
    {
        for(const entity of this._bubbles)
        {
            if(entity.visualRect.bottom < -10 || entity.readyToRecycle)
            {
                entity.readyToRecycle = true;

                if(this._toRemove.indexOf(entity) === -1) this._toRemove.push(entity);
            }
        }

        if(this._toRemove.length > 0)
        {
            for(const entity of this._toRemove)
            {
                const index = this._bubbles.indexOf(entity);

                entity.dispose();

                if(index !== -1) this._bubbles.splice(index, 1);
            }

            this._toRemove = [];
        }
    }

    // AS3: sources/win63_2026_crypted_version/src/com/sulake/habbo/freeflowchat/viewer/simulation/ChatFlowStage.as::resize()
    resize(_width: number, _height: number): void
    {
        const chatFlow = this._chatFlow;

        if(!chatFlow?.chatFlowViewer) return;

        const viewBottom = chatFlow.chatFlowViewer.viewBottom;

        if(this._viewBottom !== viewBottom)
        {
            if(this._viewBottom < viewBottom)
            {
                const delta = viewBottom - this._viewBottom;

                for(const entity of this._bubbles)
                {
                    entity.y += delta;
                    entity.syncToVisualization(true);
                }
            }
            else
            {
                const delta = this._viewBottom - viewBottom;

                for(const entity of this._bubbles)
                {
                    entity.y -= delta;
                    entity.syncToVisualization(true);
                }
            }
        }

        this._viewBottom = viewBottom;
    }
}
