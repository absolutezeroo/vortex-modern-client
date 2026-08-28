/**
 * Why a Builders Club furni can or cannot be placed right now.
 *
 * `HabboCatalog.getBuilderFurniPlaceableStatus()` returns these as **bare integers** — AS3 never
 * references the enum from that method — and `BuilderCatalogWidget` switches on `status - 1` to
 * pick an error icon and message. That switch is where the two obfuscated members get their
 * meaning; see each one below.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/catalog/enum/BuilderFurniPlaceableStatus.as
 */
export const BuilderFurniPlaceableStatus = {
    /**
     * Name DERIVED — `_SafeStr_10697`, obfuscated in every tree including PRODUCTION's
     * (`_Str_8891`). It is the value `canPlaceWithBC()` tests for (`status == 0`) and the one
     * `BuilderCatalogWidget` enables both place buttons on.
     */
    // AS3: BuilderFurniPlaceableStatus.as::_SafeStr_10697
    PLACEABLE: 0,

    // AS3: BuilderFurniPlaceableStatus.as::MISSING_OFFER
    MISSING_OFFER: 1,

    /**
     * Name DERIVED — `_SafeStr_10739`, obfuscated in every tree (PRODUCTION: `_Str_14564`). It is
     * the only status `BuilderCatalogWidget` renders with the `icons_builder_error_furnilimit`
     * icon and `${builder.placement_widget.error.limit_reached}`, so the name is read off its own
     * message rather than guessed.
     */
    // AS3: BuilderFurniPlaceableStatus.as::_SafeStr_10739
    FURNI_LIMIT_REACHED: 2,

    // AS3: BuilderFurniPlaceableStatus.as::NOT_IN_ROOM
    NOT_IN_ROOM: 3,

    // AS3: BuilderFurniPlaceableStatus.as::NOT_ROOM_OWNER_OR_GROUP_ADMIN
    NOT_ROOM_OWNER_OR_GROUP_ADMIN: 4,

    // AS3: BuilderFurniPlaceableStatus.as::GUILD_ROOM
    GUILD_ROOM: 5,

    // AS3: BuilderFurniPlaceableStatus.as::VISITORS_IN_ROOM
    VISITORS_IN_ROOM: 6,
} as const;

export type BuilderFurniPlaceableStatusValue =
    typeof BuilderFurniPlaceableStatus[keyof typeof BuilderFurniPlaceableStatus];
