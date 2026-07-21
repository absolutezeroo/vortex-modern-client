import type {IWindow} from '@core/window/IWindow';
import type {IWindowContainer} from '@core/window/IWindowContainer';
import type {IFrameWindow} from '@core/window/components/IFrameWindow';
import type {WindowEvent} from '@core/window/events/WindowEvent';
import type {WindowMouseEvent} from '@core/window/events/WindowMouseEvent';
import type {HabboUserDefinedRoomEvents} from '@habbo/roomevents/HabboUserDefinedRoomEvents';
import {WiredDebugCommandMessageComposer} from '@habbo/communication/messages/outgoing/userdefinedroomevents/WiredDebugCommandMessageComposer';

import {ActionTypeCodes} from '../../../actiontypes/ActionTypeCodes';
import type {PresetManager} from '../../PresetManager';
import type {WiredStyle} from '../../styles/WiredStyle';
import {ListScrollParams} from '../../params/ListScrollParams';
import {WiredUIPreset} from '../WiredUIPreset';
import type {IListPreset} from '../interfaces/IListPreset';
import {HeaderPreset} from './HeaderPreset';
import {FooterPreset} from './FooterPreset';
import {MenuPreset} from '../menu/MenuPreset';
import {MenuItem} from '../menu/elements/MenuItem';

/**
 * FramePreset — the wired configuration dialog window: a resizable frame around a (optionally
 * scrollable, optionally sticky header/footer) list of content presets, a close button, and an
 * optional quick menu (copy/paste/clear/reset/open/save/close).
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/roomevents/wired_setup/uibuilder/presets/main_layout/FramePreset.as
 */
export class FramePreset extends WiredUIPreset
{
    // AS3: FramePreset.as::MENU_COPY
    private static readonly MENU_COPY: number = 0;

    // AS3: FramePreset.as::MENU_PASTE
    private static readonly MENU_PASTE: number = 1;

    // AS3: FramePreset.as::MENU_COPY_INTO
    private static readonly MENU_COPY_INTO: number = 2;

    // AS3: FramePreset.as::MENU_CLEAR_PICKS
    private static readonly MENU_CLEAR_PICKS: number = 3;

    // AS3: FramePreset.as::MENU_RESET
    private static readonly MENU_RESET: number = 4;

    // AS3: FramePreset.as::MENU_OPEN_CREATOR_TOOLS
    private static readonly MENU_OPEN_CREATOR_TOOLS: number = 5;

    // AS3: FramePreset.as::MENU_SAVE
    private static readonly MENU_SAVE: number = 6;

    // AS3: FramePreset.as::MENU_CLOSE
    private static readonly MENU_CLOSE: number = 7;

    // AS3: FramePreset.as::_frame
    protected _frame: IFrameWindow;

    // AS3: FramePreset.as::_headerPreset
    protected _headerPreset: HeaderPreset | null = null;

    // AS3: FramePreset.as::_content
    protected _content!: IListPreset;

    // AS3: FramePreset.as::_onClose
    private _onClose: (() => void) | null;

    // AS3: FramePreset.as::_holderKey
    private _holderKey: string;

    // AS3: FramePreset.as::_code
    private _code: number;

    // AS3: FramePreset.as::_leftRightMargin
    private _leftRightMargin: number;

    // AS3: FramePreset.as::_topBottomMargin
    private _topBottomMargin: number;

    // AS3: FramePreset.as::_ignoreEvents
    private _ignoreEvents: boolean = false;

    // AS3: FramePreset.as::_showMenu
    private _showMenu: boolean;

    // AS3: FramePreset.as::_scrollParams
    private _scrollParams: ListScrollParams | null;

    // AS3: FramePreset.as::_menu
    private _menu: MenuPreset | null = null;

    // AS3: FramePreset.as::FramePreset()
    constructor(roomEvents: HabboUserDefinedRoomEvents, presetManager: PresetManager, wiredStyle: WiredStyle, elements: WiredUIPreset[], onClose: (() => void) | null, holderKey: string, code: number, resizable: boolean = false, showMenu: boolean = false, scrollParams: ListScrollParams | null = null)
    {
        super(roomEvents, presetManager, wiredStyle);

        this._onClose = onClose;
        this._holderKey = holderKey;
        this._code = code;
        this._showMenu = showMenu;
        this._scrollParams = scrollParams;
        this._frame = wiredStyle.createFrame();
        this._leftRightMargin = this._frame.width - this._frame.margins.right + this._frame.margins.left;
        this._topBottomMargin = this._frame.height - this._frame.margins.bottom + this._frame.margins.top;
        this.createListView(elements);
        this._content.window.addEventListener('WE_RESIZED', this._onContentsResized);
        (this._frame as unknown as IWindowContainer).findChildByTag('close')!.addEventListener('WME_CLICK', this._onCloseClicked);
        this._frame.content.addChild(this._content.window);
        this._frame.color = this._wiredStyle.frameColor;

        if(resizable)
        {
            this._frame.setParamFlag(65536, true);
            this._frame.addEventListener('WE_RESIZED', this._onFrameResized);
        }

        const menuButton = this._frame.menuButton;

        if(menuButton != null && showMenu)
        {
            this._frame.menuButtonVisible = true;
            menuButton.addEventListener('WME_CLICK', this._onMenuButtonClick);
            this.createMenuPreset();
        }
    }

    // AS3: FramePreset.as::createListView()
    protected createListView(elements: WiredUIPreset[]): void
    {
        const spacing = this._wiredStyle.sectionSpacing;
        const listItems: WiredUIPreset[] = [];
        let stickyHeader: HeaderPreset | null = null;
        let stickyFooter: FooterPreset | null = null;
        let working = elements;

        if(this._scrollParams != null && this._scrollParams.stickyHeader && working.length > 0 && working[0] instanceof HeaderPreset)
        {
            stickyHeader = working[0] as HeaderPreset;
            working = working.slice(1);
        }

        if(this._scrollParams != null && this._scrollParams.stickyFooter && working.length > 0 && working[working.length - 1] instanceof FooterPreset)
        {
            stickyFooter = working[working.length - 1] as FooterPreset;
            working = working.slice(0, working.length - 1);
        }

        for(let i = 0; i < working.length; i++)
        {
            const element = working[i];

            if(element instanceof HeaderPreset)
            {
                this._headerPreset = element;
            }

            listItems.push(element);

            if(i < working.length - 1)
            {
                const spacer = this._presetManager.createSpacer(spacing);

                element.blendSpacer = spacer;
                listItems.push(spacer);
            }
        }

        if(this._scrollParams != null)
        {
            if(stickyHeader != null || stickyFooter != null)
            {
                let extraHeight = 0;

                if(stickyHeader != null)
                {
                    extraHeight += stickyHeader.window.height + spacing;
                    listItems.unshift(this._presetManager.createSpacer(spacing));
                }

                if(stickyFooter != null)
                {
                    extraHeight += stickyFooter.window.height + spacing;
                    listItems.push(this._presetManager.createSpacer(spacing));
                }

                const minHeight = Math.max(0, this._scrollParams.minHeight - extraHeight);
                const maxHeight = Math.max(minHeight, this._scrollParams.maxHeight - extraHeight);
                const innerScrollParams = new ListScrollParams(this._scrollParams.alwaysShowScrollbar, minHeight, maxHeight, false, false);
                const scroll = this._presetManager.createScrollList(listItems, innerScrollParams);

                scroll.spacing = 0;

                const outer: WiredUIPreset[] = [];

                if(stickyHeader != null)
                {
                    outer.push(stickyHeader);
                }

                outer.push(scroll);

                if(stickyFooter != null)
                {
                    outer.push(stickyFooter);
                }

                this._content = this._presetManager.createSimpleListView(true, outer);
                this._content.spacing = 0;

                return;
            }

            this._content = this._presetManager.createScrollList(listItems, this._scrollParams);
        }
        else
        {
            this._content = this._presetManager.createSimpleListView(true, listItems);
        }

        this._content.spacing = 0;
    }

    // AS3: FramePreset.as::set title()
    set title(value: string)
    {
        this._frame.caption = value;
    }

    // AS3: FramePreset.as::onMenuButtonClick()
    private _onMenuButtonClick = (_event: WindowMouseEvent): void =>
    {
        if(this._menu != null)
        {
            this._menu.requestOpen();
        }
    };

    // AS3: FramePreset.as::refreshForNewTriggerable()
    refreshForNewTriggerable(): void
    {
        if(this._menu != null)
        {
            this._menu.setSelected(FramePreset.MENU_COPY_INTO, false);
            this.updateButtonDisabledStates();
        }
    }

    // AS3: FramePreset.as::updateButtonDisabledStates()
    updateButtonDisabledStates(): void
    {
        if(this._menu != null)
        {
            const wiredCtrl = this._roomEvents.wiredCtrl;
            const hasWrite = this._roomEvents.wiredMenu.hasWritePermission;

            this._menu.setDisabled(FramePreset.MENU_COPY, !hasWrite);
            this._menu.setDisabled(FramePreset.MENU_PASTE, !hasWrite || !wiredCtrl.hasCurrentElementInClipboard());
            this._menu.setDisabled(FramePreset.MENU_COPY_INTO, !hasWrite);
            this._menu.setDisabled(FramePreset.MENU_CLEAR_PICKS, !hasWrite || wiredCtrl.getStuffIds().length + wiredCtrl.getStuffIds2().length === 0);
            this._menu.setDisabled(FramePreset.MENU_RESET, !hasWrite);
            this._menu.setDisabled(FramePreset.MENU_OPEN_CREATOR_TOOLS, false);
            this._menu.setDisabled(FramePreset.MENU_SAVE, !hasWrite);
            this._menu.setDisabled(FramePreset.MENU_CLOSE, false);
        }
    }

    // AS3: FramePreset.as::createMenuPreset()
    private createMenuPreset(): void
    {
        const items = [
            new MenuItem('${wiredfurni.params.menu.copy}', this.onCopyConfigMenuClick, '${wiredfurni.params.menu.copy_paste.tooltip}'),
            new MenuItem('${wiredfurni.params.menu.paste}', this.onPasteConfigMenuClick, '${wiredfurni.params.menu.copy_paste.tooltip}'),
            new MenuItem('${wiredfurni.params.menu.paste_into}', null, '${wiredfurni.params.menu.paste_into.tooltip}', true),
            MenuPreset.SPACER,
            new MenuItem('${wiredfurni.params.menu.clear_picks}', this.onClearPicksMenuClick),
            new MenuItem('${wiredfurni.params.menu.reset}', this.onResetMenuClick),
            MenuPreset.SPACER,
            new MenuItem('${wiredfurni.params.menu.open_menu}', this.onOpenMenuMenuClick),
            MenuPreset.SPACER,
            new MenuItem('${wiredfurni.params.menu.save}', this.onSaveMenuClick, '${wiredfurni.params.menu.save.tooltip}'),
            new MenuItem('${wiredfurni.params.menu.close}', this.onCloseMenuClick)
        ];

        if(this._holderKey === 'action' && this._code === ActionTypeCodes.RESET)
        {
            items.push(MenuPreset.SPACER);
            items.push(new MenuItem('Erase from existence', this.onEraseClick));
        }

        this._menu = this._presetManager.createMenuPreset(items, this._frame.menuButton!);
    }

    // AS3: FramePreset.as::onFrameResized()
    private _onFrameResized = (_event: WindowEvent): void =>
    {
        if(!this._ignoreEvents)
        {
            this.resizeToWidth(this._frame.width);
        }
    };

    // AS3: FramePreset.as::onContentsResized()
    private _onContentsResized = (_event: WindowEvent): void =>
    {
        if(!this._ignoreEvents)
        {
            this.fixHeight();
        }
    };

    // AS3: FramePreset.as::onCloseClicked()
    private _onCloseClicked = (_event: WindowMouseEvent): void =>
    {
        if(this._onClose != null)
        {
            this._onClose();
        }
    };

    // AS3: FramePreset.as::get isCopyingIntoMode()
    get isCopyingIntoMode(): boolean
    {
        return this._menu != null && this._menu.getSelected(FramePreset.MENU_COPY_INTO);
    }

    // AS3: FramePreset.as::get window()
    override get window(): IWindow
    {
        return this._frame;
    }

    // AS3: FramePreset.as::resizeToWidth()
    override resizeToWidth(width: number): void
    {
        super.resizeToWidth(width);
        this._ignoreEvents = true;
        this._frame.width = width;
        this._content.resizeToWidth(width - this._leftRightMargin);
        this._ignoreEvents = false;
        this.fixHeight();
    }

    // AS3: FramePreset.as::get headerFrameBackground()
    private get headerFrameBackground(): IWindow | null
    {
        return (this._frame as unknown as IWindowContainer).findChildByTag('wired_header_bg');
    }

    // AS3: FramePreset.as::fixHeight()
    private fixHeight(): void
    {
        this._ignoreEvents = true;

        const height = this._content.window.height + this._topBottomMargin;

        this._frame.limits.minHeight = height;
        this._frame.limits.maxHeight = height;
        this._frame.height = height;
        this._ignoreEvents = false;

        const background = this.headerFrameBackground;

        if(background != null && this._headerPreset != null)
        {
            background.height = this._headerPreset.window.height + this._frame.margins.top + this._wiredStyle.sectionSpacing;
        }
    }

    // AS3: FramePreset.as::get childPresets()
    protected override get childPresets(): WiredUIPreset[]
    {
        if(this._menu == null)
        {
            return [this._content as unknown as WiredUIPreset];
        }

        return [this._content as unknown as WiredUIPreset, this._menu];
    }

    // AS3: FramePreset.as::dispose()
    override dispose(): void
    {
        this._content.window.removeEventListener('WE_RESIZED', this._onContentsResized);
        this._frame.removeEventListener('WE_RESIZED', this._onFrameResized);

        if(this.disposed)
        {
            return;
        }

        super.dispose();
        this._frame.dispose();
        this._frame = null as unknown as IFrameWindow;
        this._content = null as unknown as IListPreset;
        this._onClose = null;
        this._menu = null;
    }

    // AS3: FramePreset.as::onCopyConfigMenuClick()
    public onCopyConfigMenuClick = (): void =>
    {
        this._roomEvents.wiredCtrl.createClipboardCopy();
    };

    // AS3: FramePreset.as::onPasteConfigMenuClick()
    public onPasteConfigMenuClick = (): void =>
    {
        this._roomEvents.wiredCtrl.pasteFromClipboard();
    };

    // AS3: FramePreset.as::onClearPicksMenuClick()
    public onClearPicksMenuClick = (): void =>
    {
        this._roomEvents.wiredCtrl.clearStuffPicks();
    };

    // AS3: FramePreset.as::onResetMenuClick()
    public onResetMenuClick = (): void =>
    {
        this._roomEvents.wiredCtrl.resetToDefault();
    };

    // AS3: FramePreset.as::onOpenMenuMenuClick()
    public onOpenMenuMenuClick = (): void =>
    {
        this._roomEvents.context.createLinkEvent('wiredmenu/open');
    };

    // AS3: FramePreset.as::onSaveMenuClick()
    public onSaveMenuClick = (): void =>
    {
        this._roomEvents.wiredCtrl.update(1);
    };

    // AS3: FramePreset.as::onCloseMenuClick()
    public onCloseMenuClick = (): void =>
    {
        this._roomEvents.wiredCtrl.close();
    };

    // AS3: FramePreset.as::onEraseClick()
    public onEraseClick = (): void =>
    {
        this._roomEvents.send(new WiredDebugCommandMessageComposer('wf15', this._holderKey + this._code));
        this._roomEvents.wiredCtrl.close();
    };
}
