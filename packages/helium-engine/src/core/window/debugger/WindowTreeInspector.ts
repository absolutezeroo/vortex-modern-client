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
    /** For static_bitmap windows: the configured asset_uri, if any. */
    assetUri: string | null;
    /** For static_bitmap windows: whether bitmapData has actually loaded (vs still pending/failed). */
    bitmapLoaded: boolean | null;
    /** For static_bitmap windows with a loaded bitmap: its actual pixel dimensions. */
    bitmapSize: {width: number; height: number} | null;
    /** stretchedX/Y, zoomX/Y, pivotPoint, flipX/Y - the exact inputs BitmapDataRenderer scales/positions by. */
    bitmapParams: {
        stretchedX: boolean;
        stretchedY: boolean;
        zoomX: number;
        zoomY: number;
        pivotPoint: number;
        flipX: boolean;
        flipY: boolean;
    } | null;
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

        const bmp = window as unknown as {
            assetUri?: string;
            bitmapData?: {width: number; height: number} | null;
            stretchedX?: boolean;
            stretchedY?: boolean;
            zoomX?: number;
            zoomY?: number;
            pivotPoint?: number;
            flipX?: boolean;
            flipY?: boolean;
        };
        const hasAssetUri = typeof bmp.assetUri === 'string';

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
                assetUri: hasAssetUri ? (bmp.assetUri as string) : null,
                bitmapLoaded: hasAssetUri ? (bmp.bitmapData != null) : null,
                bitmapSize: bmp.bitmapData != null
                    ? {width: bmp.bitmapData.width, height: bmp.bitmapData.height}
                    : null,
                bitmapParams: hasAssetUri
                    ? {
                        stretchedX: bmp.stretchedX ?? false,
                        stretchedY: bmp.stretchedY ?? false,
                        zoomX: bmp.zoomX ?? 1,
                        zoomY: bmp.zoomY ?? 1,
                        pivotPoint: bmp.pivotPoint ?? 0,
                        flipX: bmp.flipX ?? false,
                        flipY: bmp.flipY ?? false,
                    }
                    : null,
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
