# AS3 traceability

Every TypeScript class, method, accessor, property, interface member, handler, parser, composer, or event ported from AS3 MUST include an `AS3:` source trace comment immediately above the declaration.

Required format:

```ts
// AS3: sources/win63_2026_crypted_version/src/com/sulake/<path>/<Class>.as::<memberName>()
```

For AS3 accessors and properties:

```ts
// AS3: sources/win63_2026_crypted_version/src/com/sulake/<path>/<Class>.as::get propertyName()
// AS3: sources/win63_2026_crypted_version/src/com/sulake/<path>/<Class>.as::propertyName
```

Always trace to the primary (`win63_2026_crypted_version`) path even if the member's identifier had to be recovered by cross-referencing `sources/win63_version/<path>/<Class>.as` — the trace comment must still use a real, human-readable member name, never an obfuscated `_SafeStr_N`/`_SafeCls_N` placeholder.

If the primary source does not contain the member, fall back to `sources/win63_version/...`, then `sources/flash_version/...`, and point the trace at whichever tree actually has it.

Incomplete members still require a compatible TypeScript signature and a `TODO(AS3)` comment with source path, class/member name, and exact remaining behavior. Never silently omit an AS3 member because it is currently unused; incomplete behavior must be visible as a TODO/stub, not missing from the interface.
