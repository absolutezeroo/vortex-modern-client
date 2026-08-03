import {Logger} from '@core/utils/Logger';
import type {EditorState} from '../state/EditorState';

const log = Logger.getLogger('glaze.ops.ScreenshotOps');

/**
 * PNG export of the edited layout.
 *
 * Glaze's Save Screenshot dumped the whole editor canvas — chrome panels, checker
 * background and all — which is never what the shot is for. This renders the root
 * window on its own through the window system's snapshot path and crops to its
 * global rectangle, so the file is exactly the layout, at 1:1, on transparency.
 */
export async function downloadLayoutPng(state: EditorState): Promise<void>
{
    const root = state.rootWindow;

    if(!root || root.disposed)
    {
        log.warn('Nothing to export — no layout open');

        return;
    }

    const rect = {x: 0, y: 0, width: 0, height: 0};

    root.getGlobalRectangle(rect);

    const width = Math.max(1, Math.round(rect.width));
    const height = Math.max(1, Math.round(rect.height));
    // The snapshot buffer is in canvas space, so it must reach the window's far
    // edge before the crop can pick the window out of it.
    const snapshot = state.runtime.windowManager.renderWindowSnapshot(
        root,
        Math.ceil(rect.x) + width,
        Math.ceil(rect.y) + height
    );

    if(!snapshot)
    {
        log.warn('The window system returned no snapshot buffer');

        return;
    }

    const out = document.createElement('canvas');

    out.width = width;
    out.height = height;

    const ctx = out.getContext('2d');

    if(!ctx)
    {
        return;
    }

    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(snapshot, Math.round(rect.x), Math.round(rect.y), width, height, 0, 0, width, height);

    const url = out.toDataURL('image/png');
    const link = document.createElement('a');

    link.href = url;
    link.download = `${state.currentLayoutName ?? 'glaze'}.png`;
    link.click();
}
