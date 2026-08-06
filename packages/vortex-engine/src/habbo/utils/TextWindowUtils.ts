import type {ITextWindow} from '@core/window/components/ITextWindow';

/**
 * Styling helpers for HTML text windows.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/utils/TextWindowUtils.as
 */
export class TextWindowUtils
{
    /**
     * AS3: .../habbo/utils/TextWindowUtils.as::setHTMLLinkStyle()
     *
     * Builds Flash's four link styles — `a:link`, `a:hover`, `a:active` and `.visited` — and
     * assigns them to the text window's `styleSheet`.
     *
     * TODO(AS3): sources/WIN63-202607011411-782849652/src/com/sulake/habbo/utils/TextWindowUtils.as::setHTMLLinkStyle()
     * — the assignment cannot be made: this port's `ITextWindow` has no `styleSheet` member and
     * the Canvas2D text renderer has no notion of a `flash.text.StyleSheet`, so nothing carries
     * per-state link colours. Porting it needs (1) `styleSheet` on `ITextWindow` /
     * `TextController`, (2) the renderer honouring `a:link` / `a:hover` / `a:active` / `.visited`
     * while drawing HTML text, and (3) hover/active state tracking per anchor. Until then the
     * colours are computed and dropped, and links render in the layout's own text colour.
     * The one caller is `PhoneNumberCollectView.createWindow()` (`collect_summary`).
     */
    // AS3: .../src/com/sulake/habbo/utils/TextWindowUtils.as::setHTMLLinkStyle()
    public static setHTMLLinkStyle(
        textWindow: ITextWindow | null,
        hoverColor: number,
        linkColor: number,
        activeColor: number,
        underlineLinks: boolean = true
    ): void
    {
        if(!textWindow)
        {
            return;
        }

        const hoverStyle: Record<string, string> = {color: TextWindowUtils.toHexString(hoverColor)};
        const linkStyle: Record<string, string> = {};

        if(underlineLinks)
        {
            linkStyle.textDecoration = 'underline';
        }

        linkStyle.color = TextWindowUtils.toHexString(linkColor);

        const activeStyle: Record<string, string> = {color: TextWindowUtils.toHexString(activeColor)};
        const visitedStyle: Record<string, string> = {textDecoration: 'underline'};

        void hoverStyle;
        void linkStyle;
        void activeStyle;
        void visitedStyle;
    }

    /**
     * AS3: .../habbo/utils/TextWindowUtils.as::toHexString()
     *
     * Zero-pads to six digits so `0x0033ff` does not come out as `#33ff`.
     */
    // AS3: .../src/com/sulake/habbo/utils/TextWindowUtils.as::toHexString()
    public static toHexString(color: number): string
    {
        let hex = color.toString(16);

        while(hex.length < 6)
        {
            hex = '0' + hex;
        }

        return '#' + hex;
    }
}
