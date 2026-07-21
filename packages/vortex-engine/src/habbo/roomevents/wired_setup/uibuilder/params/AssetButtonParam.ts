/**
 * AssetButtonParam — value object describing one asset-icon button in an AssetButtonRowPreset: the
 * asset name, tooltip, click callback, whether a splitter follows it, and right-alignment.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/roomevents/wired_setup/uibuilder/params/AssetButtonParam.as
 */
export class AssetButtonParam
{
    // AS3: AssetButtonParam.as::_assetName
    private _assetName: string;

    // AS3: AssetButtonParam.as::tooltip (backing field)
    private _tooltip: string;

    // AS3: AssetButtonParam.as::onClick (backing field)
    private _onClick: () => void;

    // AS3: AssetButtonParam.as::isFollowedBySplitter (backing field)
    private _isFollowedBySplitter: boolean;

    // AS3: AssetButtonParam.as::_alignRight
    private _alignRight: boolean;

    // AS3: AssetButtonParam.as::AssetButtonParam()
    constructor(assetName: string, tooltip: string, onClick: () => void, isFollowedBySplitter: boolean = false, alignRight: boolean = false)
    {
        this._assetName = assetName;
        this._tooltip = tooltip;
        this._onClick = onClick;
        this._isFollowedBySplitter = isFollowedBySplitter;
        this._alignRight = alignRight;
    }

    // AS3: AssetButtonParam.as::get assetName()
    get assetName(): string
    {
        return this._assetName;
    }

    // AS3: AssetButtonParam.as::get tooltip()
    get tooltip(): string
    {
        return this._tooltip;
    }

    // AS3: AssetButtonParam.as::get onClick()
    get onClick(): () => void
    {
        return this._onClick;
    }

    // AS3: AssetButtonParam.as::get isFollowedBySplitter()
    get isFollowedBySplitter(): boolean
    {
        return this._isFollowedBySplitter;
    }

    // AS3: AssetButtonParam.as::get alignRight()
    get alignRight(): boolean
    {
        return this._alignRight;
    }
}
