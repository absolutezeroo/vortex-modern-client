import type {IMessageEvent} from '@core/communication/messages/IMessageEvent';
import type {CategoryData} from '../common/CategoryData';
import type {ICategoryModel} from '../common/ICategoryModel';
import type {ICategoryModelOwner} from '../common/ICategoryModelOwner';
import {CategoryBaseModel} from '../common/CategoryBaseModel';
import {NftOutfit} from '../wardrobe/NftOutfit';
import {NftAvatarsView} from './NftAvatarsView';
import {NftWardrobeParamView} from './NftWardrobeParamView';
import type {UserNftWardrobeMessageParser} from '@habbo/communication/messages/parser/nftwardrobe/UserNftWardrobeMessageParser';
import {UserNftWardrobeMessageEvent} from '@habbo/communication/messages/incoming/nftwardrobe/UserNftWardrobeMessageEvent';
import {GetUserNftWardrobeMessageComposer} from '@habbo/communication/messages/outgoing/nftwardrobe/GetUserNftWardrobeMessageComposer';

/**
 * The NFT page: the collectible avatars the user owns, requested from the server the moment the
 * model is constructed.
 *
 * Selecting one is a two-step commitment. It is **staged** — `setNftOutfit()` remembers it and
 * captures the current figure so the choice can be rolled back — and only `saveCurrentSelection()`
 * turns that into a `SaveUserNftWardrobeMessageComposer`. Leaving the page without saving is what
 * `AvatarEditorView.onTabSelected()`'s rollback branch is for.
 *
 * Like `HotLooksModel` it is a `CategoryBaseModel` in name only: three methods are overridden to do
 * nothing and `init()` never calls up.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/avatar/nft/NftAvatarsModel.as
 */
export class NftAvatarsModel extends CategoryBaseModel implements ICategoryModel
{
    // AS3: .../avatar/nft/NftAvatarsModel.as::_nftAvatars
    private _nftAvatars: NftOutfit[] | null = [];

    // AS3: .../avatar/nft/NftAvatarsModel.as::_userNftWardrobeEvent
    // Name DERIVED (`_SafeStr_6890`): registered on the connection by this model itself.
    private _userNftWardrobeEvent: IMessageEvent | null = null;

    // AS3: .../avatar/nft/NftAvatarsModel.as::_paramView
    // Name DERIVED (`_SafeStr_8908`).
    private _paramView: NftWardrobeParamView | null = null;

    // AS3: .../avatar/nft/NftAvatarsModel.as::_selectedNftOutfit
    // The tile currently lit — kept so the previous one can be un-lit before the new one lights.
    private _selectedNftOutfit: NftOutfit | null = null;

    // AS3: .../avatar/nft/NftAvatarsModel.as::NftAvatarsModel()
    constructor(controller: ICategoryModelOwner | null)
    {
        super(controller);

        this.requestNftAvatars(controller);
    }

    // AS3: .../avatar/nft/NftAvatarsModel.as::get nftAvatars()
    public get nftAvatars(): NftOutfit[]
    {
        return this._nftAvatars ?? [];
    }

    /**
     * AS3: .../avatar/nft/NftAvatarsModel.as::selectNftAvatar()
     *
     * The highlight bookkeeping runs **outside** the null and empty-figure guards, so clicking a
     * tile whose render never arrived still un-lights the previous selection and lights nothing —
     * the grid ends up with no active tile. Kept.
     *
     * An out-of-range index likewise clears the highlight and hides the caption rather than being
     * ignored.
     */
    // AS3: .../avatar/nft/NftAvatarsModel.as::selectNftAvatar()
    public selectNftAvatar(index: number): void
    {
        const outfit = this._nftAvatars?.[index] ?? null;

        if(outfit !== null && outfit.figure !== '')
        {
            this._controller?.setNftOutfit(outfit);
            this._controller?.loadAvatarInEditor(outfit.figure, outfit.gender, this._controller.clubMemberLevel);
        }

        this._selectedNftOutfit?.view?.toggleActive(false);
        this._selectedNftOutfit = outfit;
        this._selectedNftOutfit?.view?.toggleActive(true);

        this._paramView?.updateView(outfit);
    }

    // AS3: .../avatar/nft/NftAvatarsModel.as::getNftAvatarByTokenId()
    // What `HabboAvatarEditor.loadNftFigure()` uses to restore a *saved* NFT when the page opens.
    public getNftAvatarByTokenId(tokenId: string): NftOutfit | null
    {
        for(const outfit of this._nftAvatars ?? [])
        {
            if(outfit.tokenId === tokenId) return outfit;
        }

        return null;
    }

    // AS3: .../avatar/nft/NftAvatarsModel.as::switchCategory()
    public override switchCategory(_partType: string = ''): void
    {
    }

    // AS3: .../avatar/nft/NftAvatarsModel.as::getCategoryData()
    public override getCategoryData(_partType: string): CategoryData | null
    {
        return null;
    }

    // AS3: .../avatar/nft/NftAvatarsModel.as::selectPart()
    public override selectPart(_partType: string, _index: number): void
    {
    }

    /**
     * AS3: .../avatar/nft/NftAvatarsModel.as::dispose()
     *
     * Unregisters **before** `super.dispose()` nulls the controller — the opposite order to
     * `HotLooksModel.dispose()`, which is why this one actually works and that one leaks its
     * listener. The asymmetry is AS3's.
     */
    public override dispose(): void
    {
        if(this._controller !== null && this._userNftWardrobeEvent !== null)
        {
            this._controller.manager?.connection?.removeMessageEvent(this._userNftWardrobeEvent);
            this._userNftWardrobeEvent = null;
        }

        this._nftAvatars = null;

        super.dispose();
    }

    // AS3: .../avatar/nft/NftAvatarsModel.as::init()
    // Builds both views on the first pass and never again; `_initialised` is set last here, unlike
    // every other page.
    protected override init(): void
    {
        if(this._view === null)
        {
            this._view = new NftAvatarsView(this);
            this._paramView = new NftWardrobeParamView(this);
        }

        this._view.init();
        this._initialised = true;
    }

    // AS3: .../avatar/nft/NftAvatarsModel.as::requestNftAvatars()
    private requestNftAvatars(controller: ICategoryModelOwner | null): void
    {
        const connection = controller?.manager?.connection ?? null;

        if(connection === null) return;

        this._userNftWardrobeEvent = new UserNftWardrobeMessageEvent(this.onUserNftWardrobeMessage);
        connection.addMessageEvent(this._userNftWardrobeEvent);
        connection.send(new GetUserNftWardrobeMessageComposer());
    }

    /**
     * AS3: .../avatar/nft/NftAvatarsModel.as::onUserNftWardrobeMessage()
     *
     * Appends without clearing, and — like the hot-looks equivalent — does **not** tell the view,
     * so avatars arriving after the page was last opened only appear when it is re-entered.
     */
    // AS3: .../avatar/nft/NftAvatarsModel.as::onUserNftWardrobeMessage()
    private onUserNftWardrobeMessage = (rawEvent: IMessageEvent): void =>
    {
        const parser = (rawEvent as UserNftWardrobeMessageEvent).getParser() as UserNftWardrobeMessageParser | null;

        if(parser === null) return;

        for(const item of parser.nftAvatars)
        {
            this._nftAvatars?.push(new NftOutfit(
                this._controller, item.id, item.figureString, item.gender, item.tokenId, item.contractKey
            ));
        }
    };
}
