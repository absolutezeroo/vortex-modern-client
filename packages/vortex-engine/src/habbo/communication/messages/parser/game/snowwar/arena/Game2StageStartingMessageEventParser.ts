import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';
import type {IMessageParser} from '@core/communication/messages/IMessageParser';
import {GameObjectsData} from '../data/GameObjectsData';

/**
 * The stage is about to start: the countdown, and the arena's whole object set to build it from.
 *
 * `roomType` is read off the wire and used by nobody — dropping it would shift every field after
 * it, so it is parsed and exposed like the rest.
 *
 * Name recovered from `win63_version`'s readable filename; `_SafeCls_2264` in the primary tree.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_2265/_SafeCls_2264.as
 * @see sources/win63_version/habbo/communication/messages/parser/game/snowwar/arena/Game2StageStartingMessageEventParser.as
 */
export class Game2StageStartingMessageEventParser implements IMessageParser
{
    // AS3: _SafeCls_2264.as::_SafeStr_4750
    private _gameObjects: GameObjectsData | null = null;

    // AS3: _SafeCls_2264.as::_SafeStr_6884
    private _gameType: number = -1;

    // AS3: _SafeCls_2264.as::_SafeStr_7865
    private _roomType: string = '';

    // AS3: _SafeCls_2264.as::_SafeStr_6279
    private _countDown: number = 0;

    // AS3: _SafeCls_2264.as::get gameObjects()
    get gameObjects(): GameObjectsData | null
    {
        return this._gameObjects;
    }

    // AS3: _SafeCls_2264.as::get gameType()
    get gameType(): number
    {
        return this._gameType;
    }

    // AS3: _SafeCls_2264.as::get roomType()
    get roomType(): string
    {
        return this._roomType;
    }

    // AS3: _SafeCls_2264.as::get countDown()
    get countDown(): number
    {
        return this._countDown;
    }

    // AS3: _SafeCls_2264.as::flush()
    flush(): boolean
    {
        return true;
    }

    // AS3: _SafeCls_2264.as::parse()
    parse(wrapper: IMessageDataWrapper): boolean
    {
        this._gameType = wrapper.readInt();
        this._roomType = wrapper.readString();
        this._countDown = wrapper.readInt();
        this._gameObjects = new GameObjectsData(wrapper);

        return true;
    }
}
