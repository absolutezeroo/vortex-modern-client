import type {IDisposable} from '@core/runtime/IDisposable';
import type {IWindowContainer} from '@core/window/IWindowContainer';
import type {ITextWindow} from '@core/window/components/ITextWindow';
import type {NftAvatarsModel} from './NftAvatarsModel';
import {NftOutfit} from '../wardrobe/NftOutfit';

/**
 * The one-line caption under the NFT grid: which collection the selected avatar came from, and its
 * number, in the collection's own colour.
 *
 * Far simpler than the effects page's equivalent — no timer, no bar, and it hides itself outright
 * when nothing is selected.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/avatar/nft/NftWardrobeParamView.as
 */
export class NftWardrobeParamView implements IDisposable
{
    // AS3: .../avatar/nft/NftWardrobeParamView.as::_model
    // Name DERIVED (`_SafeStr_4570`).
    private _model: NftAvatarsModel | null;

    // AS3: .../avatar/nft/NftWardrobeParamView.as::_container
    private _container: IWindowContainer | null;

    // AS3: .../avatar/nft/NftWardrobeParamView.as::_infoText
    // Name DERIVED (`_SafeStr_8523`).
    private _infoText: ITextWindow | null;

    // AS3: .../avatar/nft/NftWardrobeParamView.as::NftWardrobeParamView()
    constructor(model: NftAvatarsModel | null)
    {
        this._model = model;
        this._container = model?.controller?.view?.collectiblesAvatarInfoContainer ?? null;
        this._infoText = (this._container?.findChildByName('avatar_info_text') as ITextWindow | null) ?? null;

        this.updateView(null);
    }

    // AS3: .../avatar/nft/NftWardrobeParamView.as::get disposed()
    // Reports on the model reference, like `EffectsParamView` does.
    public get disposed(): boolean
    {
        return this._model === null;
    }

    /**
     * AS3: .../avatar/nft/NftWardrobeParamView.as::updateView()
     *
     * 🐛 An **unknown** contract key makes `getLocalizedCollectionName()` return null, and the
     * caption is then built by concatenation — so the strip reads `null #<id>` rather than being
     * hidden or falling back. Kept: the colour path has a real default, the name path does not.
     */
    // AS3: .../avatar/nft/NftWardrobeParamView.as::updateView()
    public updateView(outfit: NftOutfit | null): void
    {
        if(this._container === null) return;

        if(outfit === null)
        {
            this._container.visible = false;

            return;
        }

        if(this._infoText !== null)
        {
            this._infoText.text = `${this.getLocalizedCollectionName(outfit.contractKey)} #${outfit.id}`;
            this._infoText.textColor = NftWardrobeParamView.getCollectionTextColor(outfit.contractKey);
        }

        this._container.visible = true;
    }

    // AS3: .../avatar/nft/NftWardrobeParamView.as::dispose()
    // Leaves the container and the text field alone — both belong to the editor's window.
    public dispose(): void
    {
        this._model = null;
    }

    /**
     * AS3: .../avatar/nft/NftWardrobeParamView.as::getCollectionTextColor()
     *
     * Note these are **not** the same values `NftOutfit.initNftColors()` uses for the tile: the
     * avatar and clothes collections reuse their *active* background colour as the text colour,
     * while genesis gets a colour of its own (0xFF1E3B21) that appears nowhere else.
     */
    // AS3: .../avatar/nft/NftWardrobeParamView.as::getCollectionTextColor()
    private static getCollectionTextColor(contractKey: string): number
    {
        switch(contractKey)
        {
            // 0xFFFFA323
            case NftOutfit.COLLECTION_AVATAR:
                return 4294936611;

            // 0xFFBDC5C5
            case NftOutfit.COLLECTION_CLOTHES:
                return 4289965509;

            // 0xFF1E3B21
            case NftOutfit.COLLECTION_GENESIS:
                return 4279945953;

            // 0xFFFFFFFF
            default:
                return 4294967295;
        }
    }

    // AS3: .../avatar/nft/NftWardrobeParamView.as::getLocalizedCollectionName()
    // Returns **null** for an unrecognised collection — see `updateView()`.
    private getLocalizedCollectionName(contractKey: string): string | null
    {
        let key: string;

        switch(contractKey)
        {
            case NftOutfit.COLLECTION_AVATAR:
                key = 'wardrobe.token.avatar.name';
                break;

            case NftOutfit.COLLECTION_CLOTHES:
                key = 'wardrobe.token.clothing.name';
                break;

            case NftOutfit.COLLECTION_GENESIS:
                key = 'wardrobe.token.crafted_avatar.name';
                break;

            default:
                return null;
        }

        return this._model?.controller?.manager?.getLocalization(key) ?? key;
    }
}
