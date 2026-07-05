import type {IWindowLayoutNode} from './IWindowLayout';

/**
 * Represents an open window instance managed by HabboWindowManager.
 *
 * @see sources/win63_version/habbo/window/HabboWindowManagerComponent.as
 */
export interface IWindowInstance
{
    /** Unique window instance ID */
    readonly id: number;

    /** Layout name used to create this window */
    readonly layoutName: string;

    /** Context layer (0=background, 1=default, 2=dialogs, 3=tooltips) */
    readonly layer: number;

    /** Resolved layout tree root node */
    readonly layoutTree: IWindowLayoutNode;

    /** Whether the window is currently visible */
    visible: boolean;

    /** Z-order within its layer (higher = on top) */
    zOrder: number;

    /** Variable overrides passed at open time */
    readonly vars: Record<string, unknown>;
}
