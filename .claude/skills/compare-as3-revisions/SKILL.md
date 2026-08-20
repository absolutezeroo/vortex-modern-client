---
name: compare-as3-revisions
description: Compare two decompiled AS3 client revision trees under sources/ (e.g. two WIN63-* dumps) - diffs the message registry (packet headers moved/added/removed/shape-changed for composers and events), with a name-based match pass on top of the shape-based one so most moves are caught even when the wire shape alone is too generic to disambiguate. Use when a new client revision dump lands in sources/ and the port's packet IDs or features need re-syncing.
argument-hint: "<old-revision-dir> <new-revision-dir>"
---

## What this skill does

Compares two decompiled AS3 revision trees (directories like
`sources/WIN63-202607011411-782849652`) purely on the **communication/message
registry** — this is a revision-to-revision AS3 diff, never a comparison
against the TS client code or against the emulator/`vortex-client`.

1. **Message registry diff** — for both `_composers` (client→server) and the
   events map (server→client), matched in two passes:
   - **Shape pass**: same wire shape (constructor param types for composers,
     parser read sequence for events), unique in both revisions.
   - **Name pass**: for everything the shape pass couldn't disambiguate (a
     lone `(void)` or single `int` shared by dozens of messages), match by the
     usage-hint name instead (see recovery below) when that name is unique in
     both revisions. This is what actually keeps "Only in A"/"Only in B" down
     to genuine removals/additions instead of hundreds of same-message
     false-negatives.
   - Both passes feed one **HEADER REMAP TABLE** per side (composers/events):
     `old -> new`, tagged `via shape` or `via name`, plus the hint. This table
     is the actionable output — it's meant to be read straight into
     `HabboMessages.ts` updates, not just a diagnostic dump.
   - **SHAPE CHANGED**: same header, but the shape differs — the TS
     composer/parser itself needs re-porting, not just its ID.
   - **Only in A / Only in B**: no match by either pass — genuinely removed,
     genuinely added, or needs manual tracing (see below).
2. **Real-name recovery** — the dump has no real class names for obfuscated
   messages, but usage context in readable classes gives a strong hint: the
   callback passed to `addMessageEvent(new _SafeCls_N(onMarketPlaceOffers))`
   names the event, and the readable method that does
   `send(new _SafeCls_N(...))` names the composer
   (`HabboCatalog::getPublicMarketPlaceOffers()` →
   `GetMarketplaceOffersMessageComposer`). This hint is what powers the name
   pass above, and is shown in every table row. No hint = no readable call
   site found = needs manual tracing.
3. **Readable class-file structure diff** (`.as` files added/removed, obfuscated
   names excluded) — off by default (`--files` to include). This is
   informational context about the wider codebase, not a communication
   concern, so it doesn't clutter the default run.

## How to run

```bash
node .claude/skills/compare-as3-revisions/scripts/compare-revisions.mjs $0 $1
```

Where `$0` is the OLD revision root and `$1` is the NEW revision root. Add
`--files` for the file-structure diff, `--json <path>` (scratchpad, not the
repo) when the console lists (capped at 300 rows/table) aren't enough.

If the user gave no arguments, list the `sources/WIN63-*` directories and ask
which two to compare (oldest → newest is the usual direction).

## How to interpret and act on the results

- The **authoritative tree for this port is always the NEWEST revision** —
  see `CLAUDE.md`'s "AS3 sources" table for which directory is currently
  primary. Never derive packet IDs from the emulator, `vortex-client`,
  `win63_version`, or `flash_version`, and never use an older revision as a
  stepping stone to interpret the new one - only the single newest revision
  is ground truth for anything actually shipped in the port.
- The **HEADER REMAP TABLE is the thing to act on**: for each row, check
  `HabboMessages.ts` for a registration at the `old` header, confirm the class
  matches the hint (by its own `AS3:`/`@see` trace comment, not by guessing
  from the obfuscated name), and update it to `new`.
- `via name` rows are lower-confidence than `via shape` (a name can coincide
  by chance more easily than a full field-shape can) — spot-check the hint
  against the actual TS class before applying, especially for very short/
  generic method names.
- For every **SHAPE CHANGED** entry whose message is already ported, flag it
  for a real re-port pass (read the new AS3 class in full first, per
  `.claude/rules/00-mandate.md`) — do not just fix the header.
- Remaining **Only in A / Only in B** entries (no hint, or hint not unique on
  both sides) need manual tracing: find the feature's call site in each tree
  (e.g. the readable `HabboCatalog.as`), identify which obfuscated class it
  constructs, then look that class up in each registry.
- The registry file and the events-map property name are auto-detected in each
  tree (they are obfuscated differently per build), so no configuration is
  needed when a new dump lands.
