import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';
import type {IMessageParser} from '@core/communication/messages/IMessageParser';
import {Vector3d} from '@room/utils/Vector3d';
import {WiredUserMoveData} from './WiredUserMoveData';
import {WiredFurniMoveData} from './WiredFurniMoveData';
import {WiredWallItemMoveData} from './WiredWallItemMoveData';
import {WiredUserDirectionUpdateData} from './WiredUserDirectionUpdateData';

/**
 * WiredMovementsMessageParser — a bundle of wired-triggered movements (WIN63 header 325): a count
 * followed by that many tagged entries, each dispatched on its leading type int
 * (0 = user move, 1 = furni move, 2 = wall-item move, 3 = user direction update).
 *
 * Name derived: fully obfuscated in AS3 (class `_SafeCls_3809`); named after its readable consumer
 * `RoomMessageHandler.onWiredMovements`.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_2184/_SafeCls_3809.as
 */
export class WiredMovementsMessageParser implements IMessageParser
{
    // AS3: _SafeCls_3809.as::_SafeStr_7430 (name recovered from `get userMoves()`)
    private _userMoves: WiredUserMoveData[] = [];

    // AS3: _SafeCls_3809.as::_SafeStr_7266 (name recovered from `get furniMoves()`)
    private _furniMoves: WiredFurniMoveData[] = [];

    // AS3: _SafeCls_3809.as::_SafeStr_7427 (name recovered from `get wallItemMoves()`)
    private _wallItemMoves: WiredWallItemMoveData[] = [];

    // AS3: _SafeCls_3809.as::_SafeStr_7086 (name recovered from `get userDirectionUpdates()`)
    private _userDirectionUpdates: WiredUserDirectionUpdateData[] = [];

    // AS3: _SafeCls_3809.as::parseUserMove()
    private static parseUserMove(wrapper: IMessageDataWrapper): WiredUserMoveData
    {
        // The two z coordinates travel as strings; everything else is an int. Read order is NOT
        // ctor order — the ids and the animation fields come after both positions.
        const x = wrapper.readInt();
        const y = wrapper.readInt();
        const targetX = wrapper.readInt();
        const targetY = wrapper.readInt();
        const z = Number(wrapper.readString());
        const targetZ = Number(wrapper.readString());
        const userIndex = wrapper.readInt();
        const moveTypeFlag = wrapper.readInt();
        const animationTime = wrapper.readInt();
        const bodyDirection = wrapper.readInt();
        const headDirection = wrapper.readInt();

        let jumpPower = NaN;

        if(wrapper.readBoolean())
        {
            jumpPower = wrapper.readInt();
        }

        return new WiredUserMoveData(
            userIndex,
            new Vector3d(x, y, z),
            new Vector3d(targetX, targetY, targetZ),
            moveTypeFlag === 0 ? 'mv' : 'sld',
            animationTime,
            bodyDirection,
            headDirection,
            jumpPower
        );
    }

    // AS3: _SafeCls_3809.as::parseFurniMove()
    private static parseFurniMove(wrapper: IMessageDataWrapper): WiredFurniMoveData
    {
        const x = wrapper.readInt();
        const y = wrapper.readInt();
        const targetX = wrapper.readInt();
        const targetY = wrapper.readInt();
        const z = Number(wrapper.readString());
        const targetZ = Number(wrapper.readString());
        const furniId = wrapper.readInt();
        const animationTime = wrapper.readInt();
        const rotation = wrapper.readInt();

        // Two independent optional fields, each with its own presence boolean.
        let overshootingDistance = NaN;

        if(wrapper.readBoolean())
        {
            overshootingDistance = wrapper.readInt();
        }

        let curveStrength = NaN;

        if(wrapper.readBoolean())
        {
            curveStrength = wrapper.readInt();
        }

        return new WiredFurniMoveData(
            furniId,
            new Vector3d(x, y, z),
            new Vector3d(targetX, targetY, targetZ),
            animationTime,
            rotation,
            overshootingDistance,
            curveStrength
        );
    }

    // AS3: _SafeCls_3809.as::parseWallItemMove()
    private static parseWallItemMove(wrapper: IMessageDataWrapper): WiredWallItemMoveData
    {
        const itemId = wrapper.readInt();
        const isDirectionRight = wrapper.readBoolean();
        const oldWallX = wrapper.readInt();
        const oldWallY = wrapper.readInt();
        const oldOffsetX = wrapper.readInt();
        const oldOffsetY = wrapper.readInt();
        const newWallX = wrapper.readInt();
        const newWallY = wrapper.readInt();
        const newOffsetX = wrapper.readInt();
        const newOffsetY = wrapper.readInt();
        const animationTime = wrapper.readInt();

        return new WiredWallItemMoveData(
            itemId,
            isDirectionRight,
            oldWallX,
            oldWallY,
            oldOffsetX,
            oldOffsetY,
            newWallX,
            newWallY,
            newOffsetX,
            newOffsetY,
            animationTime
        );
    }

    // AS3: _SafeCls_3809.as::parseUserDirUpdate()
    private static parseUserDirUpdate(wrapper: IMessageDataWrapper): WiredUserDirectionUpdateData
    {
        const userIndex = wrapper.readInt();
        const bodyDirection = wrapper.readInt();
        const headDirection = wrapper.readInt();

        return new WiredUserDirectionUpdateData(userIndex, bodyDirection, headDirection);
    }

    // AS3: _SafeCls_3809.as::get userMoves()
    get userMoves(): WiredUserMoveData[]
    {
        return this._userMoves;
    }

    // AS3: _SafeCls_3809.as::get furniMoves()
    get furniMoves(): WiredFurniMoveData[]
    {
        return this._furniMoves;
    }

    // AS3: _SafeCls_3809.as::get wallItemMoves()
    get wallItemMoves(): WiredWallItemMoveData[]
    {
        return this._wallItemMoves;
    }

    // AS3: _SafeCls_3809.as::get userDirectionUpdates()
    get userDirectionUpdates(): WiredUserDirectionUpdateData[]
    {
        return this._userDirectionUpdates;
    }

    // AS3: _SafeCls_3809.as::flush()
    flush(): boolean
    {
        this._userMoves = [];
        this._furniMoves = [];
        this._wallItemMoves = [];
        this._userDirectionUpdates = [];
        return true;
    }

    // AS3: _SafeCls_3809.as::parse()
    parse(wrapper: IMessageDataWrapper): boolean
    {
        if(wrapper == null)
        {
            return false;
        }

        // AS3 re-clears the four arrays here as well as in flush() — preserved verbatim.
        this._userMoves = [];
        this._furniMoves = [];
        this._wallItemMoves = [];
        this._userDirectionUpdates = [];

        const count = wrapper.readInt();

        for(let i = 0; i < count; i++)
        {
            const type = wrapper.readInt();

            switch(type)
            {
                case 0:
                    this._userMoves.push(WiredMovementsMessageParser.parseUserMove(wrapper));
                    break;
                case 1:
                    this._furniMoves.push(WiredMovementsMessageParser.parseFurniMove(wrapper));
                    break;
                case 2:
                    this._wallItemMoves.push(WiredMovementsMessageParser.parseWallItemMove(wrapper));
                    break;
                case 3:
                    this._userDirectionUpdates.push(WiredMovementsMessageParser.parseUserDirUpdate(wrapper));
                    break;
            }
        }

        return true;
    }
}
