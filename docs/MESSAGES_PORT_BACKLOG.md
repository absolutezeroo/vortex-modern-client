# Backlog Port Messages AS3 -> TS

**Date:** 2026-08-13 (remesuré ; versions précédentes 2026-07-28, 2026-07-01)
**Source de comptage:** `sources/win63_version/habbo/communication/messages/`
**Scope:** `incoming/`, `outgoing/`, `parser/`
**Méthode:** comptage filesystem. Ces chiffres indiquent les fichiers présents, pas une validation de
parité AS3 complète.

> On compte contre `win63_version` et non contre l'arbre primaire : le primaire range presque toutes
> les classes de message sous `src/unknowns/`, sans découpage par catégorie. Voir CLAUDE.md.

## Snapshot actuel

| Type      | AS3       | TS 2026-07-01 | TS 2026-07-28 | TS 2026-08-13 | Delta brut restant |
|-----------|-----------|---------------|---------------|---------------|--------------------|
| incoming  | 700       | 341           | 480           | **630**       | 70                 |
| outgoing  | 547       | 283           | 373           | **527**       | 20                 |
| parser    | 630       | 339           | 445           | **614**       | 16                 |
| **Total** | **1,877** | **963**       | **1,298**     | **1,771**     | **106**            |

**+473 fichiers en seize jours** (après +335 le mois précédent). Le delta brut sous-estime le reste à
faire : il compense les catégories où le port a *plus* de fichiers que `win63_version` (voir « Piège
de nommage »). Somme des deltas par catégorie : **361 fichiers**, dont 21 relèvent de l'artefact de
nommage `moderator`/`moderation` — soit **~340 nets**, contre ~711 le 2026-07-28.

**`game` représente à lui seul 122 de ces 361 fichiers.** C'est le dernier gros bloc entièrement
absent, et il n'a pas bougé d'un fichier depuis le 2026-07-19.

> ## ⚠ Les tableaux par catégorie ci-dessous sont un indice de routage, pas un backlog
>
> Vérifié à la main le 2026-08-13, et le « piège de nommage » plus bas n'est pas un cas limite,
> c'est l'essentiel du chiffre :
>
> - `roomsettings` outgoing affiche `0/9` — **les 9 composers existent**, sous
>   `outgoing/room/settings/` (+2 en plus), et `RoomSettingsCtrl` (1 358 l.) est construit par
>   `LegacyNavigator`. Écart réel ≈ 1.
> - `vault` outgoing affiche `0/4` — les 4 existent sous `outgoing/inventory/`.
> - `gifts` outgoing affiche `0/5` — le dossier AS3 nommé `gifts` contient en fait les composers
>   **phone number**, tous présents sous `outgoing/preferences/`. Écart réel 0.
> - `moderator` outgoing `0/21` — le vieux dédoublement avec `moderation/`.
> - S'ajoute une part importante de fichiers `class_N.as` obfusqués, impossibles à apparier par nom
>   (24 dans `incoming/navigator`, 16 dans `incoming/users`, 14 dans `incoming/catalog`) : ils
>   comptent comme manquants qu'ils soient portés ou non.
>
> **La mesure fiable est `node scripts/wire-coverage.mjs`** (voir « Couverture fil » plus bas) :
> elle joint le registre du client aux en-têtes de l'émulateur **par id**, donc elle est immunisée
> contre le nommage, les renommages et l'obfuscation, et elle dit si le serveur implémente vraiment
> le message.

## Top catégories manquantes

### incoming

| Catégorie      | AS3 | TS | Delta |
|----------------|-----|----|-------|
| game           | 44  | 5  | 39    |
| moderation     | 26  | 15 | 11    |
| catalog        | 51  | 40 | 11    |
| roomsettings   | 18  | 10 | 8     |
| callforhelp    | 7   | 0  | 7     |
| quest          | 20  | 15 | 5     |
| navigator      | 51  | 46 | 5     |
| friendlist     | 24  | 19 | 5     |

Queue : `vault`/`users`/`crafting` 4, `talent`/`nux`/`inventory`/`friendfurni`/`avatar` 3, puis ≤2.

### outgoing

| Catégorie      | AS3 | TS | Delta |
|----------------|-----|----|-------|
| game           | 27  | 0  | 27    |
| moderator      | 21  | 0  | 21    |
| roomsettings   | 9   | 0  | 9     |
| catalog        | 40  | 34 | 6     |
| users          | 47  | 42 | 5     |
| nft            | 5   | 0  | 5     |
| gifts          | 5   | 0  | 5     |
| crafting       | 5   | 0  | 5     |

Queue : `vault` 4, `avatar` 4, `help` 3, puis ≤2. Les 21 de `moderator` sont l'artefact de nommage,
pas un vrai manque.

### parser

| Catégorie      | AS3 | TS | Delta |
|----------------|-----|----|-------|
| game           | 61  | 5  | 56    |
| talent         | 8   | 0  | 8     |
| crafting       | 6   | 0  | 6     |
| vault          | 5   | 0  | 5     |
| users          | 39  | 34 | 5     |
| callforhelp    | 5   | 0  | 5     |
| catalog        | 39  | 35 | 4     |

Queue : `nft`/`friendfurni`/`campaign` 3, `avatar`/`availability` 2, puis ≤1.

## Ce qui a changé depuis le 2026-07-28

- **`room` est clos** (49 → 0 : `107/106`, `116/97`, `106/102`). C'était le 5ᵉ plus gros bloc.
- **`users` s'est effondré** (67 → 14) — la plus forte baisse d'une catégorie sur la période.
- **`collectibles` et `groupforums` sont clos** (0 chacun, les 2026-08-12 et 2026-08-10), avec leurs
  consommateurs branchés (`CollectiblesController`, `GroupForumController`).
- **`sound` est passé de 25 à 2** : la couche fil du jukebox/trax a suivi le port de
  `habbo/sound/music` + `trax`, qui n'existait pas non plus le 2026-07-28.
- **`inventory` est à 3** (39 avant), **`catalog` à 21** (51 avant), **`navigator` à 6** (18 avant).
- **`game` n'a pas bougé** : 39/27/56, comme au premier comptage. `habbo/game` reste à 0/63.
- **`camera` est clos** (22 → 0 : `6/6`, `10/10`, `6/6`, le 2026-08-13), widget et handlers compris.
- **Intacts** : `crafting` (15, avec `ui/widget/crafting` à 0/13), `vault` (13), `callforhelp` (12).

## Piège de nommage

Certaines catégories paraissent sur-portées parce que le port les range ailleurs que
`win63_version` : `moderation` affiche `24/0` en outgoing pendant que `moderator` affiche `0/21` —
ce sont les mêmes messages sous deux noms de dossier, et ils pèsent 21 des 361 fichiers comptés.
Idem pour `help` (`33/32` incoming), `roomsettings` (`15/12` parser) et `quest` (`24/16` parser). Le
port possède en plus cinq catégories absentes de `win63_version` (`newnavigator`, `nftwardrobe`,
`rent`, `wardrobe`, `vortex` — 45 fichiers), ce qui explique que la somme des deltas dépasse le delta
brut des colonnes. Un comptage par catégorie est un indice de routage, pas une mesure de parité :
seul le registre AS3
(`sources/WIN63-202607011411-782849652/src/com/sulake/habbo/communication/_SafeCls_2046.as`) fait
foi sur ce qui existe.

## Un fichier porté n'est pas un message qui arrive

L'audit du 2026-07-24 a trouvé **23 messages entrants écrits ET enregistrés que rien n'écoutait**, et
42 autres enregistrés-mais-jamais-consommés. Tous comptaient comme portés dans les tableaux
ci-dessus et ne faisaient rien à l'exécution. Le comptage fichier est une borne haute ; la mesure
utile est « combien de messages ont un abonné » :

```bash
node scripts/unlistened-server-messages.mjs
```

Au 2026-08-13 : l'émulateur peut envoyer 512 messages, le client en écoute 480, **58 restent sans
abonné** — dont 52 présents aussi dans le registre AS3, et la majorité sont des `Game2*`/SnowWar.
`scripts/wire-coverage.mjs` mesure la même chose dans les deux sens et ajoute la question qui décide
de la priorité : le serveur a-t-il un handler derrière.

## Couverture fil — la mesure de référence

```bash
node scripts/wire-coverage.mjs          # résumé + les familles qui comptent
node scripts/wire-coverage.mjs --full   # chaque écart avec son id
```

Au 2026-08-13, après le port de la couche message camera — émulateur 506 client→serveur / 511
serveur→client, registre client 486 / 486 :

- **47 écarts en émission** (le client ne peut pas déclencher), dont **10 ont un vrai handler
  serveur** qui attend et **29 un handler qui est un stub vide**.
- **51 écarts en réception** (le serveur envoie, rien ne lit).

> ⚠ **« A un handler » ≠ « le serveur implémente ».** Le script comptait les *fichiers*
> `*MessageHandler.cs` et annonçait 44 handlers réels ; en lisant les *corps*, il n'y en a que 10.
> **117 des 515 handlers de l'émulateur sont un simple
> `await ValueTask.CompletedTask.ConfigureAwait(false);`** — le message est accepté puis jeté, aucune
> réponse n'est émise. Camera et crafting sont à 5 stubs sur 5 chacun : porter le client seul donne
> une fenêtre qui s'ouvre et ne reçoit jamais rien. Le script classe désormais le corps et affiche
> `[STUB — accepted and dropped]`.

Hors SnowWar (17 émission / 22 réception, cf. `habbo/game`), chaque famille restante est petite et
autonome :

| Famille                   | Émis | Reçus | Serveur | État côté client                                          |
|---------------------------|------|-------|---------|------------------------------------------------------------|
| Crafting                  | 5    | 4     | **0 — 5 stubs** | `ui/widget/crafting` 0/13, messages 0/15            |
| Camera / photos           | ~~5~~ 0 | ~~4~~ 0 | **0 — 5 stubs** | **client complet le 2026-08-13** (messages + `ui/widget/camera` 9/9 + 2 handlers + 2 cas RWE) |
| YouTube / Vimeo furni     | 3    | 3     | **0 — stubs** | les **2 seuls fichiers manquants** de `ui/widget/furniture` (51/54) |
| Talent track              | 3    | 3     | **0**   | `friendbar/talent` 0/6                                      |
| Room state / interaction  | 8    | 2     | **4 réels** | unités isolées (entry tile, occupied tiles, click-character, inventaire furni hors room) |
| Offres ciblées / boutique | 3    | —     | **2 réels** | finition `habbo/catalog`                                |
| Achievements de résolution| 2    | —     | **2 réels** | `GetResolutionAchievements`, `ResetResolutionAchievement` |
| NFT / collectibles        | 1    | 1     | **1 réel** | `GetNftCredits`                                          |
| Wired                     | 1    | 2     | **1 réel** | tranche variables permanentes                            |
| Treasure hunt             | 1    | 3     | 0       | aucun module client                                         |
| Income reward / vault     | —    | 3     | —       | composers présents ; rien ne lit les réponses               |
| Modération (staff)        | 2    | 1     | 0       | `habbo/moderation` 8/43                                     |
| Calendrier saisonnier     | 1    | 1     | 0       | stub documenté dans `QuestController`                       |

## Batchs recommandés

Deux classements, parce qu'ils ne donnent pas le même ordre : ce qui est **jouable de bout en bout
aujourd'hui**, et ce qui **complète le port** (l'objectif déclaré du projet, cf. CLAUDE.md → règle 8,
« ALL AS3 files are ported »). Le précédent existe : `habbo/quest` a été porté alors que le serveur
de référence l'implémente en stub vide, et c'est documenté comme un état accepté.

### A — exerçable de bout en bout sans toucher à l'émulateur

1. **Room state / interaction** — 4 écarts avec un vrai handler
   `ClickCharacter` (785), `GetOccupiedTiles` (3426), `GetRoomEntryTile` (880),
   `RequestFurniInventoryWhenNotInRoom` (3862). Des trous unitaires dans du code déjà vivant : la
   passe courte au meilleur rendement.

2. **Catalog + achievements de résolution + NFT + Wired** — 6 écarts avec un vrai handler
   `GetHabboClubExtendOffer` (2931), `GetSilver` (394), `GetResolutionAchievements` (1760),
   `ResetResolutionAchievement` (916), `GetNftCredits` (2069),
   `WiredSetObjectVariableValue` (625).

Au-delà de ces 10, **plus rien n'est exerçable sans travail côté émulateur**.

### B — complétude du port (serveur muet, à assumer)

1. **YouTube / Vimeo furni** — le plus petit chantier complet
   2 widgets (`YoutubeDisplayWidget`, `VimeoDisplayWidget`) + 6 messages. Ces 2 fichiers sont les
   **seuls** manquants de `ui/widget/furniture` (51/54).

2. ~~**Camera**~~ — **fait le 2026-08-13**, y compris les deux trous moteur :
   `IRoomEngine.snapshotRoomCanvasToBitmap()` (sur `takeScreenShot()`) et
   `getRenderRoomMessage()` (via un `SpriteDataCollector` porté). Le viseur est live et
   l'obturateur envoie un vrai payload.

3. **Crafting** — `ui/widget/crafting` 0/13 + 15 messages.

4. **Talent track** — 6 écarts fil + `friendbar/talent` 0/6.

5. **Game (SnowWar)** — le seul gros bloc encore entièrement absent : 39 des écarts fil,
   `habbo/game` à 0/63, 122 fichiers de messages.

Pour chacun de ces cinq, la question à trancher d'abord est : **porte-t-on aussi le handler côté
`vortex-emulator`** ? Sans lui la fenêtre s'ouvre et reste vide, et le port n'est pas testable
autrement qu'en injectant des données synthétiques dans le chemin `onXxx()` réel — la méthode déjà
utilisée pour valider `AchievementController`.

## Règle de port obligatoire

Pour chaque message :

- Lire l'AS3 source avant d'écrire le TS.
- Porter le triplet complet quand il existe : event, parser, composer.
- Exporter dans le `index.ts` du dossier.
- Enregistrer dans `packages/vortex-engine/src/habbo/communication/HabboMessages.ts`.
- **Brancher le handler/manager consommateur** — sans abonné, le message est du code mort qui compte
  quand même dans les tableaux ci-dessus.
- Ajouter les commentaires `AS3:` requis au-dessus des déclarations portées.
- Valider avec `pnpm build` quand le batch touche du code.
