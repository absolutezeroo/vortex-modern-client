import type {IWindow} from '@core/window/IWindow';
import type {IWindowContainer} from '@core/window/IWindowContainer';
import type {ITextWindow} from '@core/window/components/ITextWindow';
import type {WindowEvent} from '@core/window/events/WindowEvent';
import type {IBinarySearchTest} from './IBinarySearchTest';
import {CutToWidth} from './CutToWidth';
import {CutToHeight} from './CutToHeight';

/**
 * Static utility class for navigator layout and text operations.
 *
 * @see sources/win63_version/habbo/navigator/Util.as
 */
export class Util
{
    private static CUT_TO_WIDTH: CutToWidth = new CutToWidth();
    private static CUT_TO_HEIGHT: CutToHeight = new CutToHeight();

    /**
	 * Removes an element from an array.
	 *
	 * @param array - The array to remove from
	 * @param obj - The object to remove
	 * @returns The index of the removed element, or -1 if not found
	 */
    static remove<T>(array: T[], obj: T): number
    {
        const index = array.indexOf(obj);

        if(index >= 0)
        {
            array.splice(index, 1);
        }

        return index;
    }

    /**
	 * Gets a centered rectangle position relative to a window.
	 *
	 * @param window - The reference window
	 * @param width - Desired width
	 * @param height - Desired height
	 * @returns A rectangle centered within the window
	 */
    static getLocationRelativeTo(window: IWindow | null, width: number, height: number): {
        x: number;
        y: number;
        width: number;
        height: number
    }
    {
        if(window === null)
        {
            return {x: 300, y: 200, width, height};
        }

        const dx = window.width - width;
        const dy = window.height - height;

        return {
            x: window.x + 0.5 * dx,
            y: window.y + 0.5 * dy,
            width,
            height
        };
    }

    /**
	 * Finds the lowest visible child Y+height in a container.
	 *
	 * @param container - The window container
	 * @returns The lowest point Y coordinate
	 */
    static getLowestPoint(container: IWindowContainer): number
    {
        let lowest = 0;

        for(let i = 0; i < container.numChildren; i++)
        {
            const child = container.getChildAt(i);

            if(child && child.visible)
            {
                lowest = Math.max(lowest, child.y + child.height);
            }
        }

        return lowest;
    }

    /**
	 * Checks if a container has any visible children.
	 *
	 * @param container - The window container
	 * @returns True if at least one child is visible
	 */
    static hasVisibleChildren(container: IWindowContainer): boolean
    {
        for(let i = 0; i < container.numChildren; i++)
        {
            const child = container.getChildAt(i);

            if(child && child.visible)
            {
                return true;
            }
        }

        return false;
    }

    /**
	 * Hides all children in a container.
	 *
	 * @param container - The window container
	 */
    static hideChildren(container: IWindowContainer): void
    {
        for(let i = 0; i < container.numChildren; i++)
        {
            const child = container.getChildAt(i);

            if(child)
            {
                child.visible = false;
            }
        }
    }

    /**
	 * Lays out named children horizontally in a row.
	 *
	 * @param container - The window container
	 * @param names - Child names to position
	 * @param startX - Starting X position
	 * @param startY - Y position for the row
	 * @param spacing - Horizontal spacing between children
	 */
    static moveChildrenToRow(container: IWindowContainer, names: string[], startX: number, startY: number, spacing: number): void
    {
        let currentX = startX;

        for(const name of names)
        {
            const child = container.getChildByName(name);

            if(child && child.visible)
            {
                child.x = currentX;
                child.y = startY;
                currentX += child.width + spacing;
            }
        }
    }

    /**
	 * Lays out named children vertically in a column.
	 *
	 * @param container - The window container
	 * @param names - Child names to position
	 * @param startY - Starting Y position
	 * @param spacing - Vertical spacing between children
	 */
    static moveChildrenToColumn(container: IWindowContainer, names: string[], startY: number, spacing: number): void
    {
        let currentY = startY;

        for(const name of names)
        {
            const child = container.getChildByName(name);

            if(child && child.visible && child.height > 0)
            {
                child.y = currentY;
                currentY += child.height + spacing;
            }
        }
    }

    /**
	 * Lays out visible children in a word-wrap flow layout.
	 *
	 * @param container - The window container
	 * @param width - Available width
	 * @param rowHeight - Height of each row
	 * @param colSpacing - Horizontal spacing between items
	 * @param startX - Initial X offset
	 */
    static layoutChildrenInArea(container: IWindowContainer, width: number, rowHeight: number, colSpacing: number = 0, startX: number = 0): void
    {
        let currentX = startX;
        let currentY = 0;

        for(let i = 0; i < container.numChildren; i++)
        {
            const child = container.getChildAt(i);

            if(child && child.visible)
            {
                if(currentX > 0 && currentX + child.width > width)
                {
                    currentX = 0;
                    currentY += rowHeight;
                }

                child.x = currentX;
                child.y = currentY;
                currentX += child.width + colSpacing;
            }
        }
    }

    /**
	 * Sets a procedure on a named child window.
	 *
	 * @param container - The window container
	 * @param childName - Name of the child to set procedure on
	 * @param procedure - The event handler procedure
	 */
    static setProc(container: IWindowContainer, childName: string, procedure: (event: WindowEvent, window: IWindow) => void): void
    {
        const child = container.findChildByName(childName);

        if(child)
        {
            child.setParamFlag(1, true);
            child.procedure = procedure;
        }
    }

    /**
	 * Sets a procedure directly on a window.
	 *
	 * @param window - The window to set procedure on
	 * @param procedure - The event handler procedure
	 */
    static setProcDirectly(window: IWindow, procedure: (event: WindowEvent, window: IWindow) => void): void
    {
        window.setParamFlag(1, true);
        window.procedure = procedure;
    }

    /**
	 * Trims whitespace from both ends of a string.
	 *
	 * @param str - The string to trim
	 * @returns The trimmed string
	 */
    static trim(str: string): string
    {
        if(!str || str.length < 1)
        {
            return str;
        }

        return str.trim();
    }

    /**
	 * Cuts text to fit within a given width, appending "..." if needed.
	 *
	 * @param textWindow - The text window to measure
	 * @param text - The full text
	 * @param maxWidth - Maximum allowed width
	 */
    static cutTextToWidth(textWindow: ITextWindow, text: string, maxWidth: number): void
    {
        textWindow.text = text;

        if(textWindow.textWidth <= maxWidth)
        {
            return;
        }

        Util.CUT_TO_WIDTH.beforeSearch(text, textWindow, maxWidth);
        Util.binarySearch(Util.CUT_TO_WIDTH, text.length - 1);
    }

    /**
	 * Performs a generic binary search using a BinarySearchTest.
	 *
	 * @param test - The binary search test implementation
	 * @param maxIndex - Maximum index to search
	 */
    static binarySearch(test: IBinarySearchTest, maxIndex: number): void
    {
        let low = 0;
        let high = maxIndex;
        let bestIndex = 0;

        while(low < high)
        {
            const mid = low + Math.floor((high - low) / 2);
            const exceeds = test.test(mid);

            if(exceeds)
            {
                high = mid - 1;
            }
            else
            {
                bestIndex = Math.max(bestIndex, mid);
                low = mid + 1;
            }
        }

        test.test(bestIndex);
    }

    /**
	 * Checks if the mouse is over a window.
	 *
	 * @param window - The window to test
	 * @returns True if mouse is within the window bounds
	 */
    static containsMouse(window: IWindow): boolean
    {
        const point = {x: 0, y: 0};

        window.getRelativeMousePosition(point);

        return point.x >= 0 && point.y >= 0 && point.x < window.width && point.y < window.height;
    }
}
