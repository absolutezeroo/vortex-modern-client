/**
 * InfoStandCrackableFurniView
 *
 * @see sources/win63_version/habbo/ui/widget/infostand/InfoStandCrackableFurniView.as
 */
import type {IWindowContainer} from '@core/window/IWindowContainer';
import type {IItemListWindow} from '@core/window/components/IItemListWindow';
import type {IRegionWindow} from '@core/window/components/IRegionWindow';
import {WindowMouseEvent} from '@core/window/events/WindowMouseEvent';
import type {IHabboCatalog} from '@habbo/catalog/IHabboCatalog';
import {CrackableStuffData} from '@habbo/room/object/data/CrackableStuffData';
import {InfoStandFurniView} from './InfoStandFurniView';
import type {RoomWidgetFurniInfoUpdateEvent} from '../events/RoomWidgetFurniInfoUpdateEvent';
import type {InfoStandWidget} from './InfoStandWidget';

export class InfoStandCrackableFurniView extends InfoStandFurniView
{
    // AS3: sources/win63_version/habbo/ui/widget/infostand/InfoStandCrackableFurniView.as::InfoStandCrackableFurniView()
    constructor(widget: InfoStandWidget, name: string, catalog: IHabboCatalog | null)
    {
        super(widget, name, catalog);
    }

    // AS3: sources/win63_version/habbo/ui/widget/infostand/InfoStandCrackableFurniView.as::update()
    public override update(event: RoomWidgetFurniInfoUpdateEvent): void
    {
        super.update(event);

        const stuffData = event.stuffData as CrackableStuffData | null;

        this.showButton('use', true);

        if(this._buttonList) this._buttonList.visible = true;

        if(stuffData instanceof CrackableStuffData)
        {
            this.setHitsAndTarget(stuffData.hits, stuffData.target);
        }
    }

    // AS3: sources/win63_version/habbo/ui/widget/infostand/InfoStandCrackableFurniView.as::setHitsAndTarget()
    private setHitsAndTarget(hits: number, target: number): void
    {
        const hitsRemaining = this._elementList?.getListItemByName('hits_remaining');

        if(!hitsRemaining) return;

        this._widget.localizations?.registerParameter('infostand.crackable_furni.hits_remaining', 'hits', String(hits));
        this._widget.localizations?.registerParameter('infostand.crackable_furni.hits_remaining', 'target', String(target));
        hitsRemaining.visible = true;
        this.updateWindow();
    }

    // AS3: sources/win63_version/habbo/ui/widget/infostand/InfoStandCrackableFurniView.as::createWindow()
    protected override createWindow(name: string): void
    {
        const window = this._widget.windowManager.buildWidgetLayout('crackable_furni_view') as IItemListWindow | null;

        if(!window)
        {
            throw new Error('Failed to construct window from layout: crackable_furni_view');
        }

        this._window = window;
        this._infoBorder = this._window.getListItemByName('info_border') as IWindowContainer | null;
        this._buttonList = this._window.getListItemByName('button_list') as IItemListWindow | null;

        if(this._infoBorder)
        {
            this._elementList = this._infoBorder.findChildByName('infostand_element_list') as IItemListWindow | null;
        }

        this._window.name = name;
        this._widget.mainContainer.addChild(this._window);

        const closeButton = this._infoBorder?.findChildByTag('close');

        closeButton?.addEventListener(WindowMouseEvent.CLICK, this.onClose);

        if(this._buttonList)
        {
            for(let i = 0; i < this._buttonList.numListItems; i++)
            {
                this._buttonList.getListItemAt(i)?.addEventListener(WindowMouseEvent.CLICK, this.onButtonClicked);
            }
        }

        this._catalogButton = this._infoBorder?.findChildByTag('catalog') ?? null;
        this._catalogButton?.addEventListener(WindowMouseEvent.CLICK, this.onCatalogButtonClicked);

        this._rentButton = this._infoBorder?.findChildByName('rent_button') ?? null;
        this._rentButton?.addEventListener(WindowMouseEvent.CLICK, this.onRentButtonClicked);

        this._extendButton = this._infoBorder?.findChildByName('extend_button') ?? null;
        this._extendButton?.addEventListener(WindowMouseEvent.CLICK, this.onExtendButtonClicked);

        this._buyoutButton = this._infoBorder?.findChildByName('buyout_button') ?? null;
        this._buyoutButton?.addEventListener(WindowMouseEvent.CLICK, this.onBuyoutButtonClicked);

        const ownerRegion = this._elementList?.getListItemByName('owner_region') as IRegionWindow | null;

        if(ownerRegion)
        {
            ownerRegion.addEventListener(WindowMouseEvent.CLICK, this.onOwnerRegion);
            ownerRegion.addEventListener(WindowMouseEvent.OVER, this.onOwnerRegion);
            ownerRegion.addEventListener(WindowMouseEvent.OUT, this.onOwnerRegion);
        }
    }
}
