import type {ICategoryModelOwner} from '../common/ICategoryModelOwner';
import {Outfit} from './Outfit';

/**
 * An outfit that came from an NFT: the same tile, plus the token's identity and a colour scheme
 * chosen by which contract minted it.
 *
 * The three known contracts each get their own two-or-four colour set; anything else falls back to
 * plain white with no gradient. The values are opaque ARGB (`0xFF……`), assigned as decimal in AS3.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/avatar/wardrobe/NftOutfit.as
 */
export class NftOutfit extends Outfit
{
    /**
     * AS3: .../avatar/wardrobe/NftOutfit.as::collectionAvatar
     *
     * Name DERIVED (`_SafeStr_11689`): the only one of the three collection constants whose
     * identifier is obfuscated. Named for its value, `habbo:avatar`, and for the two siblings that
     * kept their names.
     */
    // AS3: .../avatar/wardrobe/NftOutfit.as::collectionAvatar
    public static readonly COLLECTION_AVATAR: string = 'habbo:avatar';

    // AS3: .../avatar/wardrobe/NftOutfit.as::collectionClothes
    public static readonly COLLECTION_CLOTHES: string = 'habbo:clothes';

    // AS3: .../avatar/wardrobe/NftOutfit.as::collectionGenesis
    public static readonly COLLECTION_GENESIS: string = 'habbo:avatar_genesis';

    // AS3: .../avatar/wardrobe/NftOutfit.as::NO_GRADIENT
    // Name DERIVED: the −1 passed as both gradient colours when a collection has none.
    private static readonly NO_GRADIENT: number = -1;

    // AS3: .../avatar/wardrobe/NftOutfit.as::_id
    // Name DERIVED (`_SafeStr_4872`): the wardrobe id, distinct from the token id below.
    private _id: string;

    // AS3: .../avatar/wardrobe/NftOutfit.as::_tokenId
    // Name DERIVED (`_SafeStr_9568`).
    private _tokenId: string;

    // AS3: .../avatar/wardrobe/NftOutfit.as::_contractKey
    private _contractKey: string;

    // AS3: .../avatar/wardrobe/NftOutfit.as::NftOutfit()
    constructor(
        controller: ICategoryModelOwner | null,
        id: string,
        figure: string,
        gender: string,
        tokenId: string,
        contractKey: string
    )
    {
        super(controller, figure, gender);

        this._id = id;
        this._tokenId = tokenId;
        this._contractKey = contractKey;

        this.initNftColors();
    }

    // AS3: .../avatar/wardrobe/NftOutfit.as::get id()
    public get id(): string
    {
        return this._id;
    }

    // AS3: .../avatar/wardrobe/NftOutfit.as::get tokenId()
    public get tokenId(): string
    {
        return this._tokenId;
    }

    // AS3: .../avatar/wardrobe/NftOutfit.as::get contractKey()
    public get contractKey(): string
    {
        return this._contractKey;
    }

    /**
     * AS3: .../avatar/wardrobe/NftOutfit.as::initNftColors()
     *
     * Only the genesis collection has a gradient; the other two and the fallback pass −1 twice,
     * which `OutfitView` reads as "hide it".
     */
    // AS3: .../avatar/wardrobe/NftOutfit.as::initNftColors()
    private initNftColors(): void
    {
        const view = this.view;

        if(view === null) return;

        switch(this._contractKey)
        {
            // 0xFFFF8000 / 0xFFFFA323 — orange.
            case NftOutfit.COLLECTION_AVATAR:
                view.setColors(4294928384, 4294936611, NftOutfit.NO_GRADIENT, NftOutfit.NO_GRADIENT);
                break;

            // 0xFFAAB3B3 / 0xFFBDC5C5 — grey.
            case NftOutfit.COLLECTION_CLOTHES:
                view.setColors(4288715443, 4289965509, NftOutfit.NO_GRADIENT, NftOutfit.NO_GRADIENT);
                break;

            // 0xFF1B2C27 / 0xFF3A5039 over 0xFF9C7333 / 0xFFAF8D43 — dark green on gold.
            case NftOutfit.COLLECTION_GENESIS:
                view.setColors(4280129447, 4282165689, 4287901875, 4289219523);
                break;

            // 0xFFFFFFFF — plain white.
            default:
                view.setColors(4294967295, 4294967295, NftOutfit.NO_GRADIENT, NftOutfit.NO_GRADIENT);
                break;
        }
    }
}
