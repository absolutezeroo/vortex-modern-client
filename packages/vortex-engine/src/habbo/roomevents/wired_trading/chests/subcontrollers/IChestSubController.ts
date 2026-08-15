import type {IWindowContainer} from '@core/window/IWindowContainer';

/**
 * One tab's worth of chest contents — furniture or coins — as the wrapper view sees it.
 *
 * `allowResizing` is what lets the furniture tab grow with its grid while the coin tab stays a
 * fixed height, so the wrapper resizes only when the active tab says it may.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/roomevents/wired_trading/chests/subcontrollers/_SafeCls_3430.as
 * (name derived: obfuscated in every tree, named for what it describes)
 */
export interface IChestSubController
{
    // AS3: _SafeCls_3430.as::get type()
    readonly type: number;

    // AS3: _SafeCls_3430.as::get title()
    readonly title: string;

    // AS3: _SafeCls_3430.as::get view()
    readonly view: IWindowContainer | null;

    // AS3: _SafeCls_3430.as::get isEmpty()
    readonly isEmpty: boolean;

    // AS3: _SafeCls_3430.as::get itemCount()
    readonly itemCount: number;

    // AS3: _SafeCls_3430.as::clear()
    clear(): void;

    // AS3: _SafeCls_3430.as::updateUI()
    updateUI(): void;

    // AS3: _SafeCls_3430.as::get allowResizing()
    readonly allowResizing: boolean;

    // AS3: _SafeCls_3430.as::dispose() (from the _SafeCls_47 base)
    dispose(): void;

    // AS3: _SafeCls_3430.as::get disposed() (from the _SafeCls_47 base)
    readonly disposed: boolean;
}
