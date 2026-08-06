import type {IWindow} from '@core/window/IWindow';
import type {IWindowContainer} from '@core/window/IWindowContainer';
import type {IItemListWindow} from '@core/window/components/IItemListWindow';
import type {ITextWindow} from '@core/window/components/ITextWindow';
import type {IStaticBitmapWrapperWindow} from '@core/window/components/IStaticBitmapWrapperWindow';
import type {WindowEvent} from '@core/window/events/WindowEvent';
import {WindowMouseEvent} from '@core/window/events/WindowMouseEvent';
import type {IProductDataListener} from '@habbo/session/product/IProductDataListener';
import type {
    NewUserExperienceGiftOptions
} from '@habbo/communication/messages/parser/nux/NewUserExperienceGiftOptions';
import {
    NewUserExperienceGiftSelection
} from '@habbo/communication/messages/outgoing/nux/NewUserExperienceGiftSelection';
import type {HabboNuxDialogs} from './HabboNuxDialogs';

/**
 * The NUX gift picker: one step at a time, one list row per option.
 *
 * The server can offer several steps in one message, so the view walks them with a cursor,
 * rebuilding its list per step and captioning the frame "n/total" while more than one is pending.
 * The answers accumulate locally and are sent in a single message once the last step is answered.
 *
 * It is an `IProductDataListener` because the option captions come from catalog product data:
 * the constructor only shows the frame if that data is already loaded, and otherwise waits for
 * `productDataReady()`.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/nux/NuxGiftSelectionView.as
 */
export class NuxGiftSelectionView implements IProductDataListener
{
    // AS3: .../nux/NuxGiftSelectionView.as::_frame
    private _frame: IWindowContainer | null = null;

    // AS3: .../nux/NuxGiftSelectionView.as::_SafeStr_4617
    private _nuxDialogs: HabboNuxDialogs | null;

    /**
     * AS3: .../nux/NuxGiftSelectionView.as::_SafeStr_7158
     *
     * The list's row 0 as built by the layout, kept as the template every row is cloned from.
     * Captured once, before the first `removeListItems()` throws it away.
     */
    private _listItemTemplate: IWindowContainer | null = null;

    // AS3: .../nux/NuxGiftSelectionView.as::_SafeStr_6117
    private _giftOptions: NewUserExperienceGiftOptions[];

    // AS3: .../nux/NuxGiftSelectionView.as::_SafeStr_4643
    private _stepCursor: number;

    // AS3: .../nux/NuxGiftSelectionView.as::_SafeStr_8622
    private _selections: NewUserExperienceGiftSelection[];

    // AS3: .../nux/NuxGiftSelectionView.as::NuxGiftSelectionView()
    constructor(nuxDialogs: HabboNuxDialogs, giftOptions: NewUserExperienceGiftOptions[])
    {
        this._nuxDialogs = nuxDialogs;
        this._giftOptions = giftOptions;
        this._stepCursor = 0;
        this._selections = [];

        this.onSelectOption = this.onSelectOption.bind(this);

        if(this._nuxDialogs.sessionDataManager && this._nuxDialogs.sessionDataManager.loadProductData(this))
        {
            this.show();
        }
    }

    // AS3: .../nux/NuxGiftSelectionView.as::get disposed()
    get disposed(): boolean
    {
        return this._nuxDialogs == null;
    }

    // AS3: .../nux/NuxGiftSelectionView.as::productDataReady()
    productDataReady(): void
    {
        this.show();
    }

    /**
     * AS3: .../nux/NuxGiftSelectionView.as::show()
     *
     * Rebuilds the whole frame per step — AS3 disposes the previous one rather than repopulating
     * it, which is also why `_listItemTemplate` has to survive across calls.
     */
    // AS3: .../src/com/sulake/habbo/nux/NuxGiftSelectionView.as::show()
    private show(): void
    {
        if(this._frame != null)
        {
            this._frame.dispose();
        }

        this._frame = this._nuxDialogs?.windowManager
            ?.buildWidgetLayout('nux_gift_selection_xml') as IWindowContainer | null ?? null;

        if(this._frame == null)
        {
            throw new Error('Failed to construct window from XML!');
        }

        const closeButton = this._frame.findChildByTag('close');

        if(closeButton)
        {
            closeButton.visible = false;
        }

        this.populateStep();
    }

    // AS3: .../nux/NuxGiftSelectionView.as::populateStep()
    private populateStep(): void
    {
        if(!this._giftOptions || !this._giftOptions.length) return;

        const step = this._giftOptions[this._stepCursor];
        const list = this._frame?.findChildByName('nux_gift_selection_list') as unknown as IItemListWindow | null;

        if(!list) return;

        if(!this._listItemTemplate)
        {
            this._listItemTemplate = list.getListItemAt(0) as unknown as IWindowContainer | null;
        }

        list.removeListItems();

        const localization = this._nuxDialogs?.localizationManager ?? null;
        const separator = decodeURI(localization?.getLocalization('nux.gift.selection.separator', ', ') ?? ', ');

        for(let i = 0; i < step.options.length; i++)
        {
            const option = step.options[i];
            const item = this._listItemTemplate?.clone() as unknown as IWindowContainer | null;

            if(!item) continue;

            const heading = item.getChildByName('option_heading') as unknown as ITextWindow | null;
            // AS3 casts to its button interface, but only touches `name` and `procedure`, both of
            // which are plain IWindow members.
            const button = item.getChildByName('option_button');
            const thumbnail = item.getChildByName('option_thumbnail') as unknown as IWindowContainer | null;
            const bitmap = thumbnail?.getChildByName('option_bitmap') as unknown as IStaticBitmapWrapperWindow | null;

            let caption = '';

            for(let j = 0; j < option.productOfferList.length; j++)
            {
                const productOffer = option.productOfferList[j];
                const productCode = productOffer.productCode;
                const localizationKey = productOffer.localizationKey;

                if(localizationKey != null)
                {
                    caption += localization?.getLocalization(localizationKey, localizationKey) ?? localizationKey;
                }
                else
                {
                    const productData = this._nuxDialogs?.catalog?.getProductData(productCode) ?? null;

                    if(productData && productData.name)
                    {
                        caption += productData.name;
                    }
                    else
                    {
                        const fallbackKey = 'product_' + productCode + '_name';

                        caption += localization?.getLocalization(fallbackKey, fallbackKey) ?? fallbackKey;
                    }
                }

                if(j < option.productOfferList.length - 1)
                {
                    caption += separator;
                }
            }

            const thumbnailUrl = option.thumbnailUrl;

            if(thumbnailUrl && bitmap)
            {
                bitmap.assetUri = (this._nuxDialogs?.configuration.getProperty('image.library.url') ?? '') + thumbnailUrl;
            }

            if(heading)
            {
                heading.text = caption;
            }

            if(button)
            {
                button.name = i.toString();
                button.procedure = this.onSelectOption;
            }

            list.addListItem(item as unknown as IWindow);
        }

        list.arrangeListItems();

        if(this._giftOptions.length > 1 && this._frame)
        {
            this._frame.caption = (localization?.getLocalization('nux.gift.selection.title') ?? '')
                + ' ' + (this._stepCursor + 1) + '/' + this._giftOptions.length;
        }

        this._frame?.center();
    }

    /**
     * AS3: .../nux/NuxGiftSelectionView.as::onSelectOption()
     *
     * The picked index is the row's position in the list, resolved from the clicked button's
     * parent — not the button's `name`, which `populateStep()` also sets to the same number.
     */
    // AS3: .../src/com/sulake/habbo/nux/NuxGiftSelectionView.as::onSelectOption()
    private onSelectOption(event: WindowEvent, window: IWindow): void
    {
        if(event.type !== WindowMouseEvent.CLICK) return;

        const step = this._giftOptions[this._stepCursor];
        const list = this._frame?.findChildByName('nux_gift_selection_list') as unknown as IItemListWindow | null;

        if(!list || !window.parent) return;

        const index = list.getListItemIndex(window.parent);

        if(index === -1) return;

        this._selections.push(new NewUserExperienceGiftSelection(step.dayIndex, step.stepIndex, index));

        this._stepCursor = this._stepCursor + 1;

        if(this._stepCursor === this._giftOptions.length)
        {
            this._nuxDialogs?.onSendGetGifts(this._selections);
        }
        else
        {
            this.show();
        }
    }

    /**
     * AS3: .../nux/NuxGiftSelectionView.as::hide()
     *
     * Destroys the *phone-offer* view rather than this one — the same copy-paste leftover as in
     * `NuxNoobRoomOfferView`. Only `onClose()` reaches it, and nothing attaches `onClose()`
     * because `show()` hides the close button.
     */
    // AS3: .../src/com/sulake/habbo/nux/NuxGiftSelectionView.as::hide()
    private hide(): void
    {
        this._nuxDialogs?.destroyNuxOfferView();
    }

    /**
     * AS3: .../nux/NuxGiftSelectionView.as::onClose()
     *
     * Dead in AS3: the frame's close button is hidden, never listened to.
     */
    // AS3: .../src/com/sulake/habbo/nux/NuxGiftSelectionView.as::onClose()
    private onClose(): void
    {
        this.hide();
    }

    // AS3: .../nux/NuxGiftSelectionView.as::dispose()
    dispose(): void
    {
        if(this._frame)
        {
            this._frame.dispose();
            this._frame = null;
        }

        this._nuxDialogs = null;
        this._listItemTemplate = null;
    }
}
