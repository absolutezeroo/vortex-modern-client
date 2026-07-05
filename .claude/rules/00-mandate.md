# Mandatory: read before coding

Before writing any implementation code, you MUST complete these steps IN ORDER:

1. **Read the AS3 source file** — Find and read the corresponding AS3 file IN ITS ENTIRETY
   - Primary: `sources/win63_version/habbo/<module>/<Class>.as`
   - Secondary: `sources/flash_version/com/sulake/habbo/<module>/<Class>.as`
2. **Read the AS3 interface** — `I<Class>.as` + `handler/` directory if present
3. **Check `docs/PATTERNS.md`** if implementing a Composer, Parser, Event, Manager, or UI Window
4. **Check `docs/IMPLEMENTATION_STATUS.md`** for the current module status
5. **Read `docs/CLIENT-SERVER-ARCHITECTURE.md`** if touching anything in `habbo/communication/` (composers, parsers, message events/IDs) or any feature that sends/receives network messages — it documents how this client is expected to talk to a real Arcturus-Community-style server: the wire protocol, handshake/encryption sequence, message ID conventions, full per-system request/response flows (room, chat, catalog, inventory, trading, etc.), and a list of **known real-server bugs and protocol mismatches**. Some AS3 behavior that looks wrong may actually be a deliberate workaround for a documented server-side bug — check this doc before "fixing" wire-format code in `habbo/communication/`.

If you haven't read the AS3 source, your implementation is invalid. No exceptions.
