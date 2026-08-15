import type {IWindow} from '@core/window/IWindow';
import type {
    WiredContractContentsMessageParser
} from '@habbo/communication/messages/parser/userdefinedroomevents/wiredtrading/contracts/WiredContractContentsMessageParser';

/**
 * What every contract editor must offer its controller: show yourself for this payload, hide, write
 * your fields into the outgoing array, say which type you are, and validate.
 *
 * `validate()` returns **null when valid** and an error message otherwise — the inversion is AS3's,
 * and `WiredContractController.saveContract()` treats any non-null as a refusal.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/roomevents/wired_trading/contracts/subcontrollers/_SafeCls_2710.as
 * (name derived: obfuscated in every tree, named for what it describes)
 */
export interface IContract
{
    // AS3: _SafeCls_2710.as::show()
    show(parser: WiredContractContentsMessageParser): void;

    // AS3: _SafeCls_2710.as::hide()
    hide(): void;

    // AS3: _SafeCls_2710.as::addContentsToComposer()
    addContentsToComposer(contents: unknown[]): void;

    // AS3: _SafeCls_2710.as::contractType()
    contractType(): number;

    // AS3: _SafeCls_2710.as::validate()
    validate(): string | null;

    // AS3: _SafeCls_2710.as::get window()
    readonly window: IWindow | null;
}
