import type {IWindow} from '../IWindow';
import type {IWindowContainer} from '../IWindowContainer';
import {TYPE_CODE_TO_NAME} from '../enum/WindowType';

export interface IWindowDebugRect {
    x: number;
    y: number;
    width: number;
    height: number;
}

export interface IWindowDebugNode {
    window: IWindow;
    name: string;
    caption: string;
    typeName: string;
    type: number;
    style: number;
    state: number;
    param: number;
    rect: IWindowDebugRect;
    globalRect: IWindowDebugRect;
    visible: boolean;
    dynamicStyle: string;
    tags: string[];
    children: IWindowDebugNode[];
}

/**
 * Dev-only tooling for the visual window debugger (helium-engine/src/core/window/debugger).
 * Walks a live IWindow tree through its public IWindow/IWindowContainer API only —
 * no engine internals, no AS3 equivalent.
 */
export class WindowTreeInspector 
{
    public static snapshot(window: IWindow): IWindowDebugNode 
    {
        const globalRect: IWindowDebugRect = {x: 0, y: 0, width: 0, height: 0};

        window.getGlobalRectangle(globalRect);

        const node: IWindowDebugNode =
            {
                window,
                name: window.name,
                caption: window.caption,
                typeName: TYPE_CODE_TO_NAME[window.type] ?? `unknown(${window.type})`,
                type: window.type,
                style: window.style,
                state: window.state,
                param: window.param,
                rect: {x: window.x, y: window.y, width: window.width, height: window.height},
                globalRect,
                visible: window.visible,
                dynamicStyle: window.dynamicStyle,
                tags: [...window.tags],
                children: []
            };

        if(WindowTreeInspector.isContainer(window)) 
        {
            for(let i = 0; i < window.numChildren; i++) 
            {
                const child = window.getChildAt(i);

                if(child) 
                {
                    node.children.push(WindowTreeInspector.snapshot(child));
                }
            }
        }

        return node;
    }

    private static isContainer(window: IWindow): window is IWindowContainer 
    {
        return (typeof (window as IWindowContainer).numChildren === 'number')
            && (typeof (window as IWindowContainer).getChildAt === 'function');
    }
}
