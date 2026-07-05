# AS3 traceability

Every TypeScript class, method, accessor, property, interface member, handler, parser, composer, or event ported from AS3 MUST include an `AS3:` source trace comment immediately above the declaration.

Required format:

```ts
// AS3: sources/win63_version/<path>/<Class>.as::<memberName>()
```

For AS3 accessors and properties:

```ts
// AS3: sources/win63_version/<path>/<Class>.as::get propertyName()
// AS3: sources/win63_version/<path>/<Class>.as::propertyName
```

If the primary source does not contain the member and the secondary Flash source is used, the trace MUST point to `sources/flash_version/...`.

Incomplete members still require a compatible TypeScript signature and a `TODO(AS3)` comment with source path, class/member name, and exact remaining behavior. Never silently omit an AS3 member because it is currently unused; incomplete behavior must be visible as a TODO/stub, not missing from the interface.
