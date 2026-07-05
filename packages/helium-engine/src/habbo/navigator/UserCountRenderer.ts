import type {IWindowContainer} from '@core/window/IWindowContainer';
import type {ITextWindow} from '@core/window/components/ITextWindow';
import type {IHabboTransitionalNavigator} from './IHabboTransitionalNavigator';

/**
 * Renders user count badges with color-coded backgrounds based on room capacity.
 *
 * Colors by threshold: b (black/empty), g (green), y (yellow/50%), o (orange/80%), r (red/92%)
 *
 * @see sources/win63_version/habbo/navigator/UserCountRenderer.as
 */
export class UserCountRenderer
{
    static readonly USERCOUNT_ELEMENT_NAME: string = 'usercount';

    private _navigator: IHabboTransitionalNavigator | null;

    constructor(navigator: IHabboTransitionalNavigator)
    {
        this._navigator = navigator;
    }

    /**
	 * Refreshes the user count badge in a container.
	 *
	 * @param capacity - Maximum room capacity
	 * @param container - Parent container
	 * @param userCount - Current user count
	 * @param tooltip - Tooltip text
	 * @param xPos - X position
	 * @param yPos - Y position
	 */
    refreshUserCount(capacity: number, container: IWindowContainer, userCount: number, tooltip: string, xPos: number, yPos: number): void
    {
        if(!this._navigator) return;

        let userCountWindow = container.findChildByName('usercount') as IWindowContainer | null;

        if(!userCountWindow)
        {
            const xmlWindow = this._navigator.getXmlWindow('grs_usercount');

            if(!xmlWindow) return;

            userCountWindow = xmlWindow as unknown as IWindowContainer;
            userCountWindow.name = 'usercount';
            userCountWindow.x = xPos;
            userCountWindow.y = yPos;
            container.addChild(userCountWindow);
        }

        const textWindow = userCountWindow.findChildByName('txt') as ITextWindow | null;

        if(textWindow)
        {
            textWindow.text = '' + userCount;
        }

        const bgColor = this.getBgColor(capacity, userCount);

        this.refreshBg(userCountWindow, bgColor);
        userCountWindow.visible = true;
    }

    dispose(): void
    {
        this._navigator = null;
    }

    private getBgColor(capacity: number, userCount: number): string
    {
        if(userCount === 0)
        {
            return 'b';
        }

        if(this.isOverBgColorLimit(capacity, userCount, 'red', 92))
        {
            return 'r';
        }

        if(this.isOverBgColorLimit(capacity, userCount, 'orange', 80))
        {
            return 'o';
        }

        if(this.isOverBgColorLimit(capacity, userCount, 'yellow', 50))
        {
            return 'y';
        }

        return 'g';
    }

    private isOverBgColorLimit(capacity: number, userCount: number, colorName: string, defaultPercent: number): boolean
    {
        if(!this._navigator) return false;

        const key = 'navigator.colorlimit.' + colorName;
        const percent = this._navigator.getInteger(key, defaultPercent);
        const threshold = capacity * percent / 100;

        return userCount >= threshold;
    }

    private refreshBg(container: IWindowContainer, bgColor: string): void
    {
        if(!this._navigator) return;

        const bgWindow = container.findChildByName('usercount_bg');

        if(!bgWindow) return;

        if(bgWindow.tags[0] !== bgColor)
        {
            bgWindow.tags.splice(0, bgWindow.tags.length);
            bgWindow.tags.push(bgColor);

            const assetName = 'usercount_fixed_' + bgColor;
            const bitmapData = this._navigator.getButtonImage(assetName);

            if(bitmapData)
            {
                // Apply bitmap to the wrapper window
                (bgWindow as any).bitmap = bitmapData;
                (bgWindow as any).disposesBitmap = false;
            }

            bgWindow.invalidate();
        }
    }
}
