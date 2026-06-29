# Backlog Port Messages AS3 -> TS

**Date:** 2026-02-19
**Source primaire:** `sources/win63_version/habbo/communication/messages/`
**Scope:** `outgoing/`, `incoming/`, `parser/`

## Snapshot actuel

| Type      | AS3      | TS      | Manquants |
|-----------|----------|---------|-----------|
| outgoing  | 518      | 224     | 294       |
| incoming  | 656      | 262     | 394       |
| parser    | 588      | 259     | 329       |
| **Total** | **1762** | **745** | **1017**  |

## Top catégories manquantes (priorité par impact)

### outgoing
| Catégorie             | AS3 | TS | Manquants |
|-----------------------|-----|----|-----------|
| room                  | 97  | 46 | 51        |
| users                 | 40  | 5  | 35        |
| catalog               | 37  | 1  | 36        |
| game                  | 27  | 0  | 27        |
| moderator             | 21  | 0  | 21        |
| userdefinedroomevents | 19  | 0  | 19        |
| collectibles          | 13  | 0  | 13        |
| groupforums           | 12  | 0  | 12        |
| marketplace           | 10  | 0  | 10        |
| camera                | 10  | 0  | 10        |

### incoming
| Catégorie             | AS3 | TS | Manquants |
|-----------------------|-----|----|-----------|
| room                  | 107 | 53 | 54        |
| users                 | 51  | 5  | 46        |
| userdefinedroomevents | 44  | 0  | 44        |
| game                  | 44  | 3  | 41        |
| catalog               | 43  | 2  | 41        |
| inventory             | 53  | 20 | 33        |
| roomsettings          | 18  | 0  | 18        |
| collectibles          | 14  | 0  | 14        |
| moderation            | 25  | 13 | 12        |
| sound                 | 10  | 0  | 10        |

### parser
| Catégorie             | AS3 | TS | Manquants |
|-----------------------|-----|----|-----------|
| game                  | 70  | 3  | 67        |
| room                  | 103 | 51 | 52        |
| catalog               | 34  | 2  | 32        |
| users                 | 35  | 5  | 30        |
| inventory             | 51  | 21 | 30        |
| userdefinedroomevents | 19  | 0  | 19        |
| collectibles          | 19  | 0  | 19        |
| groupforums           | 13  | 0  | 13        |
| roomsettings          | 12  | 0  | 12        |
| marketplace           | 8   | 0  | 8         |

## Batchs recommandés

1. **Batch Users + Inventory**
- Continuer `incoming/users`, `outgoing/users`, `parser/users`
- Finir `incoming/inventory`, `parser/inventory`, `outgoing/inventory`
- Brancher les managers/session listeners associés

2. **Batch Catalog + Marketplace + Collectibles**
- Cohérence complète des triplets event/parser/composer
- Wiring dans managers catalog/inventory

3. **Batch Game + Wired + RoomSettings**
- `game`, `userdefinedroomevents`, `roomsettings`
- Brancher listeners dans handlers/managers dédiés

## Avancement récent (2026-02-19)

- Batch `users` (profil/email/badges/SCR) porté:
  - `incoming/users`: `ApproveNameMessageEvent`, `ChangeEmailResultEvent`, `ExtendedProfileMessageEvent`, `ExtendedProfileChangedMessageEvent`, `HabboUserBadgesMessageEvent`, `HandItemReceivedMessageEvent`, `RelationshipStatusInfoEvent`, `ScrSendKickbackInfoMessageEvent`, `ScrSendUserInfoEvent`
  - `parser/users`: parsers correspondants + data classes (`ExtendedProfileData`, `HabboGroupEntryData`, `RelationshipStatusInfo`, `ScrKickbackData`)
  - `outgoing/users`: `ApproveNameMessageComposer`, `ChangeEmailComposer`, `GetEmailStatusComposer`, `GetExtendedProfileByNameMessageComposer`, `GetSelectedBadgesMessageComposer`, `ScrGetKickbackInfoMessageComposer`, `ScrGetUserInfoMessageComposer`
  - `HabboMessages.ts`: IDs entrants/sortants enregistrés
  - Wiring: `UserDataManager.getUserBadges()` envoie désormais `GetSelectedBadgesMessageComposer`, `RoomUsersHandler` traite `HabboUserBadgesMessageEvent`

- Batch `users` (group/guild details) porté:
  - `incoming/users`: `HabboGroupDetailsMessageEvent`, `GroupDetailsChangedMessageEvent`, `HabboGroupDeactivatedMessageEvent`, `HabboGroupJoinFailedMessageEvent` + data class `HabboGroupDetailsData`
  - `parser/users`: parsers correspondants
  - `outgoing/users`: `GetHabboGroupDetailsMessageComposer`, `JoinHabboGroupMessageComposer`, `SelectFavouriteHabboGroupMessageComposer`, `DeselectFavouriteHabboGroupMessageComposer`
  - `HabboMessages.ts`: IDs entrants/sortants enregistrés
  - Wiring: `HabboGroupsManager.openGroupInfo()` et `showExtendedProfile()` envoient désormais leurs composers AS3, listeners groupes de base branchés

4. **Batch Moderation + Help + Sound**
- Finaliser événements outils modération, CFH, audio

## Règle de port (obligatoire)

Pour chaque message:
- Lire AS3 `incoming/<...>/<Event>.as` ou `outgoing/<...>/<Composer>.as`
- Lire AS3 parser associé (`parser/<...>/<Parser>.as`)
- Implémenter TS (Allman, `import type`, `flush/parse` AS3-conformes)
- Exporter dans `index.ts` du dossier
- Enregistrer dans `packages/helium-engine/src/habbo/communication/HabboMessages.ts`
- Brancher le handler/manager consommateur
- Valider avec `pnpm build`
