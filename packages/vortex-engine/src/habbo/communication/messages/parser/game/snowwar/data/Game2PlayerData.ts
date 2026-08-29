import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';
import type {IDisposable} from '@core/runtime/IDisposable';

/**
 * A player as the lobby and the scoreboards know them — the account-level identity, not the arena
 * object. `HumanGameObjectData` is the in-game half and shares only the figure.
 *
 * `referenceId` is what ties the two together.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/communication/messages/parser/game/snowwar/data/Game2PlayerData.as
 */
export class Game2PlayerData implements IDisposable
{
    /** Derived name — `_SafeStr_8684`, from the `referenceId` getter that reads it. */
    // AS3: Game2PlayerData.as::_SafeStr_8684
    private _referenceId: number = 0;

    // AS3: Game2PlayerData.as::_userName
    private _userName: string | null = '';

    // AS3: Game2PlayerData.as::_figureString
    private _figureString: string | null = '';

    /** Derived name — `_SafeStr_4645`, from the `gender` getter that reads it. */
    // AS3: Game2PlayerData.as::_SafeStr_4645
    private _gender: string = '';

    /** Derived name — `_SafeStr_9381`, from the `teamId` getter that reads it. */
    // AS3: Game2PlayerData.as::_SafeStr_9381
    private _teamId: number = 0;

    /** Derived name — `_SafeStr_5769`, from the `disposed` getter that reads it. */
    // AS3: Game2PlayerData.as::_SafeStr_5769
    private _disposed: boolean = false;

    // AS3: Game2PlayerData.as::parse()
    public parse(wrapper: IMessageDataWrapper): void
    {
        this._referenceId = wrapper.readInt();
        this._userName = wrapper.readString();
        this._figureString = wrapper.readString();
        this._gender = wrapper.readString();
        this._teamId = wrapper.readInt();
    }

    // AS3: Game2PlayerData.as::toString()
    public toString(): string
    {
        return `[Game Player] ${this._referenceId}: ${this._userName}`;
    }

    // AS3: Game2PlayerData.as::get referenceId()
    public get referenceId(): number
    {
        return this._referenceId;
    }

    // AS3: Game2PlayerData.as::get userName()
    public get userName(): string | null
    {
        return this._userName;
    }

    // AS3: Game2PlayerData.as::get figureString()
    public get figureString(): string | null
    {
        return this._figureString;
    }

    // AS3: Game2PlayerData.as::get gender()
    public get gender(): string
    {
        return this._gender;
    }

    // AS3: Game2PlayerData.as::get teamId()
    public get teamId(): number
    {
        return this._teamId;
    }

    /**
     * AS3 declares both `disposed` and `isDisposed` over the same field. Only the first satisfies
     * `IDisposable`; the second is kept because it is part of the class's public API.
     */
    // AS3: Game2PlayerData.as::get isDisposed()
    public get isDisposed(): boolean
    {
        return this._disposed;
    }

    // AS3: Game2PlayerData.as::get disposed()
    public get disposed(): boolean
    {
        return this._disposed;
    }

    /**
     * Clears the two strings and nothing else — `_gender` and the two integers are left as they
     * were, which is AS3's own choice and not an omission here.
     */
    // AS3: Game2PlayerData.as::dispose()
    public dispose(): void
    {
        this._userName = null;
        this._figureString = null;
        this._disposed = true;
    }
}
