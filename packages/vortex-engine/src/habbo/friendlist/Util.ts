import type {IWindow} from '@core/window/IWindow';
import type {IWindowContainer} from '@core/window/IWindowContainer';
import {Logger} from '@core/utils/Logger';

const logger = Logger.getLogger('habbo.friendlist.Util');

/**
 * Util
 *
 * The friend list's own layout helpers. Every view here is built by stacking children
 * into a container of unknown final size, so the recurring question is "how far down
 * (or right) did the visible children actually reach" — that is what `getLowestPoint`
 * and `getRightmostPoint` answer, and the views resize themselves off it.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/friendlist/Util.as
 */
export class Util
{
    // AS3: .../Util.as::remove()
    static remove<T>(array: T[], item: T): void
    {
        const index = array.indexOf(item);

        if(index >= 0)
        {
            array.splice(index, 1);
        }
    }

    // AS3: .../Util.as::getLowestPoint()
    static getLowestPoint(container: IWindowContainer): number
    {
        let lowest = 0;

        for(let i = 0; i < container.numChildren; i++)
        {
            const child = container.getChildAt(i);

            if(child !== null && child.visible)
            {
                lowest = Math.max(lowest, child.y + child.height);
            }
        }

        return lowest;
    }

    // AS3: .../Util.as::getRightmostPoint()
    static getRightmostPoint(container: IWindowContainer): number
    {
        let rightmost = 0;

        for(let i = 0; i < container.numChildren; i++)
        {
            const child = container.getChildAt(i);

            if(child !== null && child.visible)
            {
                rightmost = Math.max(rightmost, child.x + child.width);
            }
        }

        return rightmost;
    }

    // AS3: .../Util.as::arrayToString()
    static arrayToString(array: unknown[], separator: string = ', ', quote: string = ''): string
    {
        let result = '';

        for(const item of array)
        {
            if(result !== '')
            {
                result += separator;
            }

            result += quote + String(item) + quote;
        }

        return result;
    }

    /**
     * Debug dump of a window subtree. The flag read is param flag 16, which AS3 passes
     * as a literal here.
     */
    // AS3: .../Util.as::print()
    static print(indent: string, window: IWindow): void
    {
        logger.trace(`${indent}${window} (${window.width}, ${window.height}), ${window.getParamFlag(16)}`);

        const container = window as IWindowContainer;

        if(container !== null && typeof container.numChildren === 'number')
        {
            for(let i = 0; i < container.numChildren; i++)
            {
                const child = container.getChildAt(i);

                if(child !== null)
                {
                    Util.print(indent + '-', child);
                }
            }
        }
    }

    // AS3: .../Util.as::hideChildren()
    static hideChildren(container: IWindowContainer): void
    {
        for(let i = 0; i < container.numChildren; i++)
        {
            const child = container.getChildAt(i);

            if(child !== null)
            {
                child.visible = false;
            }
        }
    }

    /**
     * Centres a `width` x `height` box on `window`. With no window to centre on, AS3
     * falls back to a fixed (300, 200) — kept verbatim.
     */
    // AS3: .../Util.as::getLocationRelativeTo()
    static getLocationRelativeTo(window: IWindow | null, width: number, height: number): {x: number; y: number; width: number; height: number}
    {
        if(window === null)
        {
            return {x: 300, y: 200, width: width, height: height};
        }

        const freeWidth = window.width - width;
        const freeHeight = window.height - height;

        return {
            x: window.x + 0.5 * freeWidth,
            y: window.y + 0.5 * freeHeight,
            width: width,
            height: height
        };
    }

    /**
     * Flow layout: lay visible children left to right, wrapping to a new `rowHeight`
     * row whenever the next child would cross `areaWidth`.
     */
    // AS3: .../Util.as::layoutChildrenInArea()
    static layoutChildrenInArea(container: IWindowContainer, areaWidth: number, rowHeight: number): void
    {
        let x = 0;
        let y = 0;

        for(let i = 0; i < container.numChildren; i++)
        {
            const child = container.getChildAt(i);

            if(child !== null && child.visible)
            {
                if(x > 0 && x + child.width > areaWidth)
                {
                    x = 0;
                    y += rowHeight;
                }

                child.x = x;
                child.y = y;
                x += child.width;
            }
        }
    }
}
