/**
 * Static utility class for cursor management.
 *
 * In AS3 this manipulated the Flash Stage's Mouse cursor, supporting
 * custom DisplayObject cursors and standard cursor types. In TypeScript,
 * this provides a simplified interface that maps cursor types to CSS
 * cursor values for the SolidJS client to consume.
 *
 * @see sources/win63_2021_version/com/sulake/core/window/utils/MouseCursorControl.as
 */
export class MouseCursorControl
{
    private static _dirty: boolean = true;

    private static _type: number = 0;

    /**
	 * Gets the current cursor type.
	 */
    public static get type(): number
    {
        return MouseCursorControl._type;
    }

    /**
	 * Sets the cursor type. Only marks dirty if the type actually changes.
	 *
	 * @param value - The cursor type constant
	 */
    public static set type(value: number)
    {
        if(MouseCursorControl._type !== value)
        {
            MouseCursorControl._type = value;
            MouseCursorControl._dirty = true;
        }
    }

    private static _visible: boolean = true;

    /**
	 * Gets cursor visibility.
	 */
    public static get visible(): boolean
    {
        return MouseCursorControl._visible;
    }

    /**
	 * Sets cursor visibility.
	 *
	 * @param value - Whether the cursor should be visible
	 */
    public static set visible(value: boolean)
    {
        MouseCursorControl._visible = value;

        if(value)
        {
            document.body.style.cursor = '';
        }
        else
        {
            document.body.style.cursor = 'none';
        }
    }

    private static _disposed: boolean = false;

    /**
	 * Whether the cursor control has been disposed.
	 */
    public static get disposed(): boolean
    {
        return MouseCursorControl._disposed;
    }

    /**
	 * Disposes the cursor control.
	 */
    public static dispose(): void
    {
        if(!MouseCursorControl._disposed)
        {
            MouseCursorControl._disposed = true;
        }
    }

    /**
	 * Applies the current cursor type by mapping it to a CSS cursor.
	 * Only updates the DOM if the cursor type has changed.
	 */
    public static change(): void
    {
        if(!MouseCursorControl._dirty)
        {
            return;
        }

        MouseCursorControl._dirty = false;

        let cssCursor: string;

        switch(MouseCursorControl._type)
        {
            case 0:
            case 1:
                cssCursor = 'auto';
                break;
            case 2:
                cssCursor = 'pointer';
                break;
            case 5:
            case 6:
                cssCursor = 'grab';
                break;
            case 7:
                cssCursor = 'ns-resize';
                break;
            case 8:
                cssCursor = 'ew-resize';
                break;
            case 9:
                cssCursor = 'ns-resize';
                break;
            case 10:
                cssCursor = 'ew-resize';
                break;
            case 11:
                cssCursor = 'nwse-resize';
                break;
            case 12:
                cssCursor = 'not-allowed';
                break;
            case 13:
                cssCursor = 'wait';
                break;
            case 0xFFFFFFFE:
                cssCursor = 'none';
                break;
            default:
                cssCursor = 'auto';
                break;
        }

        document.body.style.cursor = cssCursor;
    }

    /**
	 * Returns the CSS cursor string for the current type.
	 *
	 * @returns The CSS cursor value
	 */
    public static getCursor(): string
    {
        return document.body.style.cursor || 'auto';
    }
}
