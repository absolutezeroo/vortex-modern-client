import type {IWindow} from '@core/window/IWindow';
import type {WindowController} from '@core/window/WindowController';
import {Theme} from '@habbo/window/theme/Theme';
import type {EditorState} from '../state/EditorState';

interface IThemeManagerLike
{
    getStyle(themeName: string, elementType: number, intent: string): number;
    getThemeAndIntent(elementType: number, style: number): { theme: string; intent: string };
}

interface IContainerLike { numChildren: number; getChildAt(index: number): IWindow | null; }

/** Themes offered by the "Set Theme" control (the real, style-backed themes). */
export const GLAZE_THEMES = [Theme.VOLTER, Theme.UBUNTU, Theme.ILLUMINA_LIGHT, Theme.ILLUMINA_DARK];

/**
 * Re-themes the whole open layout by remapping every window's `style` to the
 * target theme, preserving each element's intent — exactly how Glaze's
 * "Set Theme" works. Uses the engine `ThemeManager`
 * (`getThemeAndIntent` → intent, `getStyle` → the target theme's equivalent).
 */
export function setTheme(state: EditorState, themeName: string): void
{
    const tm = (state.runtime.windowManager as unknown as { getThemeManager(): IThemeManagerLike }).getThemeManager();
    const root = state.rootWindow;

    if(!tm || !root || root.disposed)
    {
        return;
    }

    state.pushHistory();

    const visit = (win: IWindow): void =>
    {
        const wc = win as unknown as WindowController;
        const {intent} = tm.getThemeAndIntent(wc.type, wc.style);
        const style = tm.getStyle(themeName, wc.type, intent);

        wc.style = style;

        const container = win as unknown as IContainerLike;

        if(typeof container.numChildren === 'number' && typeof container.getChildAt === 'function')
        {
            for(let i = 0; i < container.numChildren; i++)
            {
                const child = container.getChildAt(i);

                if(child) visit(child);
            }
        }
    };

    visit(root);
    state.notifyTreeChanged();
}
