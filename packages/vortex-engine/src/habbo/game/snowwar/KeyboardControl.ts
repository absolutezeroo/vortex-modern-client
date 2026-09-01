import type {IDisposable} from '@core/runtime/IDisposable';
import {Direction8} from './utils/Direction8';

/**
 * Keyboard steering for the arena: which of the eight directions the keys currently held add up to.
 *
 * Two layouts at once. The arrow keys give the four diagonals on their own and the four cardinals
 * in pairs — up+left is west, up+right is north — because the room is drawn isometric and "up" is
 * north-west. QWE/AD/ZXC is the same eight directions laid out as a keypad on the left hand.
 *
 * It answers a direction; it does not move anything. `GameArenaView.update()` reads it once per
 * turn, which is what keeps a held key from outrunning the lock-step clock.
 *
 * **DEVIATION**: AS3 subscribes to the Flash `Stage`'s `keyDown`/`keyUp`. There is no stage here,
 * so it listens on `document` and matches on `KeyboardEvent.key` rather than on Flash's `keyCode`.
 * AS3 also declares ~100 `private static const` keycodes as a general table, of which it uses
 * exactly twelve; the rest are unreferenced and a third of them are obfuscated beyond recovery
 * (`_SafeStr_10582` is C, `_SafeStr_11615` is Z, and so on), so only the twelve are kept.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/game/snowwar/KeyboardControl.as
 */
export class KeyboardControl implements IDisposable
{
    // AS3: KeyboardControl.as::A
    private static readonly KEY_A: string = 'a';

    // AS3: KeyboardControl.as::_SafeStr_10582
    private static readonly KEY_C: string = 'c';

    // AS3: KeyboardControl.as::D
    private static readonly KEY_D: string = 'd';

    // AS3: KeyboardControl.as::E
    private static readonly KEY_E: string = 'e';

    // AS3: KeyboardControl.as::_SafeStr_10873
    private static readonly KEY_Q: string = 'q';

    // AS3: KeyboardControl.as::W
    private static readonly KEY_W: string = 'w';

    // AS3: KeyboardControl.as::X
    private static readonly KEY_X: string = 'x';

    // AS3: KeyboardControl.as::_SafeStr_11615
    private static readonly KEY_Z: string = 'z';

    // AS3: KeyboardControl.as::_SafeStr_10286
    private static readonly KEY_UP: string = 'arrowup';

    // AS3: KeyboardControl.as::DOWN
    private static readonly KEY_DOWN: string = 'arrowdown';

    // AS3: KeyboardControl.as::_SafeStr_10087
    private static readonly KEY_LEFT: string = 'arrowleft';

    // AS3: KeyboardControl.as::RIGHT
    private static readonly KEY_RIGHT: string = 'arrowright';

    /** Derived name — `_SafeStr_5671`; the keys held right now, in the order they went down. */
    // AS3: KeyboardControl.as::_SafeStr_5671
    private _heldKeys: string[] = [];

    /** Derived name — `_SafeStr_4615`; what those keys currently mean, or null. */
    // AS3: KeyboardControl.as::_SafeStr_4615
    private _direction: Direction8 | null = null;

    // TS-only: AS3 subscribes a method reference; the port needs a stable bound one to unsubscribe.
    private readonly _onKey: (event: KeyboardEvent) => void;

    // AS3: KeyboardControl.as::KeyboardControl()
    constructor()
    {
        this._onKey = (event: KeyboardEvent): void => this.keyboardEventHandler(event);

        document.addEventListener('keydown', this._onKey);
        document.addEventListener('keyup', this._onKey);
    }

    /**
     * AS3 returns a hard `false` here — the object is disposable but never reports itself disposed,
     * and nothing asks.
     */
    // AS3: KeyboardControl.as::get disposed()
    public get disposed(): boolean
    {
        return false;
    }

    // AS3: KeyboardControl.as::get direction()
    public get direction(): Direction8 | null
    {
        return this._direction;
    }

    // AS3: KeyboardControl.as::keyboardEventHandler()
    private keyboardEventHandler(event: KeyboardEvent): void
    {
        const key = event.key.toLowerCase();
        const index = this._heldKeys.indexOf(key);

        if(event.type === 'keydown')
        {
            if(index === -1) this._heldKeys.push(key);
        }
        else if(event.type === 'keyup')
        {
            if(index > -1) this._heldKeys.splice(index, 1);
        }

        this._direction = null;

        if(this._heldKeys.length === 0) return;

        if(this._heldKeys.length >= 2)
        {
            if(this.isDown(KeyboardControl.KEY_UP) && this.isDown(KeyboardControl.KEY_LEFT))
            {
                this._direction = Direction8.W;
            }
            else if(this.isDown(KeyboardControl.KEY_UP) && this.isDown(KeyboardControl.KEY_RIGHT))
            {
                this._direction = Direction8.N;
            }
            else if(this.isDown(KeyboardControl.KEY_DOWN) && this.isDown(KeyboardControl.KEY_LEFT))
            {
                this._direction = Direction8.S;
            }
            else if(this.isDown(KeyboardControl.KEY_DOWN) && this.isDown(KeyboardControl.KEY_RIGHT))
            {
                this._direction = Direction8.E;
            }
        }
        else if(this.isDown(KeyboardControl.KEY_UP)) this._direction = Direction8.NW;
        else if(this.isDown(KeyboardControl.KEY_DOWN)) this._direction = Direction8.SE;
        else if(this.isDown(KeyboardControl.KEY_LEFT)) this._direction = Direction8.SW;
        else if(this.isDown(KeyboardControl.KEY_RIGHT)) this._direction = Direction8.NE;
        else if(this.isDown(KeyboardControl.KEY_Q)) this._direction = Direction8.W;
        else if(this.isDown(KeyboardControl.KEY_W)) this._direction = Direction8.NW;
        else if(this.isDown(KeyboardControl.KEY_E)) this._direction = Direction8.N;
        else if(this.isDown(KeyboardControl.KEY_A)) this._direction = Direction8.SW;
        else if(this.isDown(KeyboardControl.KEY_D)) this._direction = Direction8.NE;
        else if(this.isDown(KeyboardControl.KEY_Z)) this._direction = Direction8.S;
        else if(this.isDown(KeyboardControl.KEY_X)) this._direction = Direction8.SE;
        else if(this.isDown(KeyboardControl.KEY_C)) this._direction = Direction8.E;
    }

    // AS3: KeyboardControl.as::isDown()
    private isDown(key: string): boolean
    {
        return this._heldKeys.indexOf(key) > -1;
    }

    // AS3: KeyboardControl.as::dispose()
    public dispose(): void
    {
        document.removeEventListener('keydown', this._onKey);
        document.removeEventListener('keyup', this._onKey);

        this._direction = null;
        this._heldKeys = [];
    }
}
