import type {IWindow} from './IWindow';

/**
 * Core window manager interface.
 *
 * Top-level manager that creates/destroys windows across contexts,
 * provides desktop access, notification, and window search.
 *
 * @see sources/win63_2021_version/com/sulake/core/window/ICoreWindowManager.as
 */
export interface ICoreWindowManager
{
    create(
        name: string,
        type: number,
        style: number,
        param: number,
        rect: { x: number; y: number; width: number; height: number },
        procedure?: ((event: unknown, window: IWindow) => void) | null,
        dynamicStyle?: string,
        id?: number,
        tags?: string[] | null,
        parent?: IWindow | null,
        properties?: unknown[] | null,
        layerName?: string
    ): IWindow;

    destroy(window: IWindow): void;

    buildFromXML(
        layout: string | Document | Element,
        contextLayer?: number,
        namedWindows?: Map<string, IWindow> | null
    ): IWindow | null;

    windowToXMLString(window: IWindow): string;

    getDesktop(contextLayer: number): IWindow | null;

    notify(title: string, message: string, callback: Function, flags?: number): IWindow | null;

    confirm(title: string, message: string, callback: Function, flags?: number): IWindow | null;

    findWindowByName(name: string): IWindow | null;

    findWindowByTag(tag: string): IWindow | null;

    groupWindowsWithTag(tag: string, result: IWindow[], depth?: number): number;
}
