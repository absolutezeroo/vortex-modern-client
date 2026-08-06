/**
 * A pending "play this song" request, one per priority slot.
 *
 * `startPos` is the interesting member: it is not the position asked for, but that position plus
 * however long the request has been waiting — so a song whose samples took four seconds to load
 * starts four seconds in, and stays in sync with everyone else in the room.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/sound/music/SongStartRequestData.as
 */
export class SongStartRequestData
{
    // AS3: .../SongStartRequestData.as::_songId
    private _songId: number;

    // AS3: .../SongStartRequestData.as::_startPos
    private _startPos: number;

    // AS3: .../SongStartRequestData.as::_playLength
    private _playLength: number;

    // AS3: .../SongStartRequestData.as::_playRequestTime
    private _playRequestTime: number;

    // AS3: .../SongStartRequestData.as::_fadeInSeconds
    private _fadeInSeconds: number;

    // AS3: .../SongStartRequestData.as::_fadeOutSeconds
    private _fadeOutSeconds: number;

    // AS3: .../SongStartRequestData.as::SongStartRequestData()
    // AS3 stamps `getTimer()` — milliseconds since the player started — which `performance.now()`
    // is the equivalent of here.
    constructor(
        songId: number,
        startPos: number,
        playLength: number,
        fadeInSeconds: number = 2,
        fadeOutSeconds: number = 1
    )
    {
        this._songId = songId;
        this._startPos = startPos;
        this._playLength = playLength;
        this._fadeInSeconds = fadeInSeconds;
        this._fadeOutSeconds = fadeOutSeconds;
        this._playRequestTime = performance.now();
    }

    // AS3: .../SongStartRequestData.as::get songId()
    get songId(): number
    {
        return this._songId;
    }

    // AS3: .../SongStartRequestData.as::get startPos()
    // A negative requested position means "from the top", and does *not* accumulate the wait.
    get startPos(): number
    {
        if(this._startPos < 0) return 0;

        return this._startPos + (performance.now() - this._playRequestTime) / 1000;
    }

    // AS3: .../SongStartRequestData.as::get playLength()
    get playLength(): number
    {
        return this._playLength;
    }

    // AS3: .../SongStartRequestData.as::get fadeInSeconds()
    get fadeInSeconds(): number
    {
        return this._fadeInSeconds;
    }

    // AS3: .../SongStartRequestData.as::get fadeOutSeconds()
    get fadeOutSeconds(): number
    {
        return this._fadeOutSeconds;
    }
}
