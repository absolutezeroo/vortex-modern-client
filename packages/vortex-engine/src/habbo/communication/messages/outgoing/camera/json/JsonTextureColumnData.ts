/**
 * One texture column of a room plane, inside the room-render JSON payload.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_2901/JsonTextureColumnData.as
 */
export class JsonTextureColumnData
{
    // AS3: .../_SafePkg_2901/JsonTextureColumnData.as::_assetNames
    private readonly _assetNames: string[] = [];

    // AS3: .../_SafePkg_2901/JsonTextureColumnData.as::addAssetName()
    addAssetName(assetName: string): void
    {
        this._assetNames.push(assetName);
    }

    // AS3: .../_SafePkg_2901/JsonTextureColumnData.as::get assetNames()
    get assetNames(): string[]
    {
        return this._assetNames;
    }

    // TS-only: see JsonPoint.toJSON() — AS3 serializes the getter, TypeScript would serialize the
    // backing field under the wrong key.
    toJSON(): { assetNames: string[] }
    {
        return {assetNames: this._assetNames};
    }
}
