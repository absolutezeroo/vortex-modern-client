import type {IWindow} from '@core/window/IWindow';
import type {IWindowContainer} from '@core/window/IWindowContainer';
import type {IItemGridWindow} from '@core/window/components/IItemGridWindow';
import type {WindowEvent} from '@core/window/events/WindowEvent';
import type {ICategoryView} from '../common/ICategoryView';
import type {NftAvatarsModel} from './NftAvatarsModel';

/**
 * The NFT page: a grid of collectible avatars the user owns.
 *
 * Structurally identical to `HotLooksView` — the other page that implements `ICategoryView`
 * directly — down to the empty `switchCategory`/`showPalettes`/`reset` trio. The two are separate
 * classes in AS3 and stay separate here.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/avatar/nft/NftAvatarsView.as
 */
export class NftAvatarsView implements ICategoryView
{
    // AS3: .../avatar/nft/NftAvatarsView.as::_window
    private _window: IWindowContainer | null = null;

    // AS3: .../avatar/nft/NftAvatarsView.as::_model
    // Name DERIVED (`_SafeStr_4570`).
    private _model: NftAvatarsModel | null;

    // AS3: .../avatar/nft/NftAvatarsView.as::_grid
    // Name DERIVED (`_SafeStr_6329`).
    private _grid: IItemGridWindow | null = null;

    // AS3: .../avatar/nft/NftAvatarsView.as::NftAvatarsView()
    constructor(model: NftAvatarsModel | null)
    {
        this._model = model;
    }

    // AS3: .../avatar/nft/NftAvatarsView.as::init()
    public init(): void
    {
        this._grid?.removeGridItems();

        if(this._window === null)
        {
            this._window = (this._model?.controller?.view?.getCategoryContainer('nfts') as IWindowContainer | null) ?? null;
            this._grid = (this._window?.findChildByName('nfts') as IItemGridWindow | null) ?? null;

            if(this._window !== null) this._window.visible = false;
        }

        this.update();
    }

    // AS3: .../avatar/nft/NftAvatarsView.as::update()
    // Unlike the hot-looks grid this one is not gender-keyed — you own what you own.
    public update(): void
    {
        this._grid?.removeGridItems();

        for(const outfit of this._model?.nftAvatars ?? [])
        {
            const window = outfit?.view?.window ?? null;

            if(window === null) continue;

            this._grid?.addGridItem(window);
            window.procedure = this.nftAvatarsEventProc;
        }
    }

    // AS3: .../avatar/nft/NftAvatarsView.as::getWindowContainer()
    public getWindowContainer(): IWindowContainer | null
    {
        return this._window;
    }

    // AS3: .../avatar/nft/NftAvatarsView.as::switchCategory()
    public switchCategory(_partType: string): void
    {
    }

    // AS3: .../avatar/nft/NftAvatarsView.as::showPalettes()
    public showPalettes(_partType: string, _count: number): void
    {
    }

    // AS3: .../avatar/nft/NftAvatarsView.as::reset()
    // Empty, so the grid is only repopulated by re-entering the page.
    public reset(): void
    {
    }

    // AS3: .../avatar/nft/NftAvatarsView.as::dispose()
    public dispose(): void
    {
        this._grid?.removeGridItems();
        this._window = null;
        this._model = null;
    }

    // AS3: .../avatar/nft/NftAvatarsView.as::nftAvatarsEventProc()
    // The event lands on whichever child of the tile was hit, so the grid index is looked up on
    // `parent`. Same shape as `HotLooksView`'s.
    private nftAvatarsEventProc = (event: WindowEvent, window: IWindow | null = null): void =>
    {
        const target = window ?? event.target;

        if(target === null) return;
        if(event.type !== 'WME_CLICK') return;

        const parent = target.parent;

        if(parent === null) return;

        this._model?.selectNftAvatar(this._grid?.getGridItemIndex(parent) ?? -1);
    };
}
