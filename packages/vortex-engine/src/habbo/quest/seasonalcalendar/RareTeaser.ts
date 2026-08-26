import type {IDisposable} from '@core/runtime';
import type {IWindowContainer} from '@core/window/IWindowContainer';
import type {IWindow} from '@core/window/IWindow';
import type {IStaticBitmapWrapperWindow} from '@core/window/components/IStaticBitmapWrapperWindow';
import type {WindowEvent} from '@core/window/events/WindowEvent';
import {WindowMouseEvent} from '@core/window/events/WindowMouseEvent';
import type {HabboQuestEngine} from '../HabboQuestEngine';

/**
 * The seasonal calendar footer's "rare teaser" panel: up to three catalogue rares, each unlocked
 * on its own configured calendar day and clickable through to its own catalogue page.
 *
 * @see sources/WIN63-202607011411-782849652/src/com/sulake/habbo/quest/seasonalcalendar/RareTeaser.as
 */
export class RareTeaser implements IDisposable
{
    // AS3: .../RareTeaser.as::_questEngine
    private _questEngine: HabboQuestEngine | null;
    // AS3: .../RareTeaser.as::_window
    private _window: IWindowContainer | null = null;
    // AS3: .../RareTeaser.as::_SafeStr_7489 (name DERIVED — obfuscated in every available
    // tree). The calendar day each slot unlocks on, parsed from
    // `quests.seasonalcalendar.rareteaser.days`.
    private _days: number[] = [];
    // AS3: .../RareTeaser.as::_SafeStr_8893 (name DERIVED — obfuscated in every available
    // tree). Per-slot image name, parsed from `quests.seasonalcalendar.rareteaser.images`.
    private _images: string[] = [];
    // AS3: .../RareTeaser.as::_pages
    private _pages: string[] = [];

    // AS3: .../RareTeaser.as::RareTeaser()
    constructor(questEngine: HabboQuestEngine)
    {
        this._questEngine = questEngine;
    }

    // AS3: .../RareTeaser.as::dispose()
    dispose(): void
    {
        this._questEngine = null;
        this._window = null;
    }

    // AS3: .../RareTeaser.as::get disposed()
    get disposed(): boolean
    {
        return this._questEngine === null;
    }

    // AS3: .../RareTeaser.as::prepare()
    prepare(container: IWindowContainer): void
    {
        this._days = this.parseInts('quests.seasonalcalendar.rareteaser.days');
        this._images = this.parseStrings('quests.seasonalcalendar.rareteaser.images');
        this._pages = this.parseStrings('quests.seasonalcalendar.rareteaser.pages');
        this._window = container.findChildByName('rare_teaser_cont') as unknown as IWindowContainer | null;

        const galleryHost = this._questEngine?.questController?.seasonalCalendarWindow?.getCalendarImageGalleryHost() ?? '';

        for(let slot = 1; slot <= this._days.length; slot++)
        {
            const furniPic = this.getFurniPic(slot);

            if(furniPic !== null) furniPic.assetUri = `${galleryHost}${this._images[slot - 1]}.png`;
        }

        const firstRegion = this.getClickRegion(1);
        const secondRegion = this.getClickRegion(2);
        const thirdRegion = this.getClickRegion(3);

        if(firstRegion !== null) firstRegion.procedure = this.onFirstSlot;
        if(secondRegion !== null) secondRegion.procedure = this.onSecondSlot;
        if(thirdRegion !== null) thirdRegion.procedure = this.onThirdSlot;
    }

    // AS3: .../RareTeaser.as::parseInts()
    private parseInts(key: string): number[]
    {
        const raw = this._questEngine?.localization?.getLocalization(key, '') ?? '';
        const result: number[] = [];

        for(const part of raw.split(','))
        {
            if(!isNaN(Number(part))) result.push(parseInt(part, 10));
        }

        return result;
    }

    // AS3: .../RareTeaser.as::parseStrings()
    private parseStrings(key: string): string[]
    {
        const raw = this._questEngine?.localization?.getLocalization(key, '') ?? '';
        const result: string[] = [];

        for(const part of raw.split(','))
        {
            if(part !== '') result.push(part);
        }

        return result;
    }

    // AS3: .../RareTeaser.as::getFurniPic()
    private getFurniPic(slot: number): IStaticBitmapWrapperWindow | null
    {
        return (this.getRare(slot)?.findChildByName('furni_pic') ?? null) as unknown as IStaticBitmapWrapperWindow | null;
    }

    // AS3: .../RareTeaser.as::getLockIcon()
    private getLockIcon(slot: number): IWindow | null
    {
        return this.getRare(slot)?.findChildByName('locked_icon') ?? null;
    }

    // AS3: .../RareTeaser.as::getLockedBg()
    private getLockedBg(slot: number): IWindow | null
    {
        return this.getRare(slot)?.findChildByName('locked_bg') ?? null;
    }

    // AS3: .../RareTeaser.as::getOpenBg()
    private getOpenBg(slot: number): IWindow | null
    {
        return this.getRare(slot)?.findChildByName('open_bg') ?? null;
    }

    // AS3: .../RareTeaser.as::getClickRegion()
    private getClickRegion(slot: number): IWindow | null
    {
        return this.getRare(slot)?.findChildByName('click_region') ?? null;
    }

    // AS3: .../RareTeaser.as::getRare()
    private getRare(slot: number): IWindowContainer | null
    {
        return (this._window?.findChildByName(`rare_cont_${slot}`) ?? null) as unknown as IWindowContainer | null;
    }

    // AS3: .../RareTeaser.as::refresh()
    refresh(): void
    {
        const currentDay = this._questEngine?.questController?.seasonalCalendarWindow?.currentDay ?? 0;
        let daysUntilNextUnlock = -1;

        for(let slot = 1; slot <= this._days.length; slot++)
        {
            const locked = this._days[slot - 1] > currentDay;

            const furniPic = this.getFurniPic(slot);
            const lockIcon = this.getLockIcon(slot);
            const openBg = this.getOpenBg(slot);
            const lockedBg = this.getLockedBg(slot);
            const clickRegion = this.getClickRegion(slot);

            if(furniPic !== null) furniPic.visible = !locked;
            if(lockIcon !== null) lockIcon.visible = locked;
            if(openBg !== null) openBg.visible = !locked;
            if(lockedBg !== null) lockedBg.visible = locked;
            if(clickRegion !== null) clickRegion.visible = !locked;

            if(locked && daysUntilNextUnlock === -1)
            {
                daysUntilNextUnlock = this._days[slot - 1] - currentDay;
            }
        }

        const teaserInfo = this._window?.findChildByName('teaser_info');

        if(teaserInfo !== null && teaserInfo !== undefined) teaserInfo.visible = daysUntilNextUnlock !== -1;

        this._questEngine?.localization?.registerParameter('quests.seasonalcalendar.rareteaser.info', 'days', String(daysUntilNextUnlock));
    }

    // AS3: .../RareTeaser.as::onFirstSlot()
    private onFirstSlot = (event: WindowEvent, _window: IWindow): void =>
    {
        this.onSlot(event, 0);
    };

    // AS3: .../RareTeaser.as::onSecondSlot()
    private onSecondSlot = (event: WindowEvent, _window: IWindow): void =>
    {
        this.onSlot(event, 1);
    };

    // AS3: .../RareTeaser.as::onThirdSlot()
    private onThirdSlot = (event: WindowEvent, _window: IWindow): void =>
    {
        this.onSlot(event, 2);
    };

    // AS3: .../RareTeaser.as::onSlot()
    private onSlot(event: WindowEvent, index: number): void
    {
        if(event.type === WindowMouseEvent.CLICK && this._pages[index] !== undefined && this._pages[index] !== null)
        {
            this._questEngine?.catalog?.openCatalogPage(this._pages[index]);
        }
    }
}
