# Backlog Port Messages AS3 -> TS

**Date:** 2026-07-28 (remesuré ; version précédente 2026-07-01)
**Source de comptage:** `sources/win63_version/habbo/communication/messages/`
**Scope:** `incoming/`, `outgoing/`, `parser/`
**Méthode:** comptage filesystem. Ces chiffres indiquent les fichiers présents, pas une validation de
parité AS3 complète.

> On compte contre `win63_version` et non contre l'arbre primaire : le primaire range presque toutes
> les classes de message sous `src/unknowns/`, sans découpage par catégorie. Voir CLAUDE.md.

## Snapshot actuel

| Type      | AS3       | TS 2026-07-01 | TS 2026-07-28 | Delta brut restant |
|-----------|-----------|---------------|---------------|--------------------|
| incoming  | 700       | 341           | **480**       | 220                |
| outgoing  | 547       | 283           | **373**       | 174                |
| parser    | 630       | 339           | **445**       | 185                |
| **Total** | **1,877** | **963**       | **1,298**     | **579**            |

**+335 fichiers en quatre semaines.** Le delta brut sous-estime le reste à faire : il compense les
catégories où le port a *plus* de fichiers que `win63_version` (voir « Piège de nommage »). Somme
des deltas par catégorie : **~711 fichiers**.

## Top catégories manquantes

### incoming

| Catégorie      | AS3 | TS | Delta |
|----------------|-----|----|-------|
| game           | 44  | 5  | 39    |
| users          | 55  | 28 | 27    |
| catalog        | 51  | 28 | 23    |
| inventory      | 56  | 35 | 21    |
| collectibles   | 20  | 0  | 20    |
| room           | 106 | 89 | 17    |
| moderation     | 26  | 14 | 12    |
| navigator      | 51  | 40 | 11    |
| sound          | 10  | 0  | 10    |
| groupforums    | 9   | 0  | 9     |
| roomsettings   | 18  | 10 | 8     |
| quest          | 20  | 12 | 8     |
| friendlist     | 24  | 17 | 7     |
| callforhelp    | 7   | 0  | 7     |
| nux            | 6   | 0  | 6     |
| camera         | 6   | 0  | 6     |

Queue : `vault` 4, `crafting` 4, `talent`/`gifts`/`friendfurni`/`avatar` 3, puis ≤2.

### outgoing

| Catégorie      | AS3 | TS | Delta |
|----------------|-----|----|-------|
| game           | 27  | 0  | 27    |
| users          | 47  | 24 | 23    |
| moderator      | 21  | 0  | 21    |
| room           | 97  | 78 | 19    |
| collectibles   | 18  | 0  | 18    |
| catalog        | 40  | 26 | 14    |
| groupforums    | 12  | 0  | 12    |
| help           | 34  | 23 | 11    |
| camera         | 10  | 0  | 10    |
| sound          | 9   | 0  | 9     |
| roomsettings   | 9   | 0  | 9     |

Queue : `nft`/`gifts`/`crafting`/`avatar` 5, `vault`/`nux` 4, puis ≤3.

### parser

| Catégorie      | AS3 | TS | Delta |
|----------------|-----|----|-------|
| game           | 61  | 5  | 56    |
| collectibles   | 29  | 0  | 29    |
| inventory      | 55  | 37 | 18    |
| users          | 39  | 22 | 17    |
| catalog        | 39  | 25 | 14    |
| room           | 102 | 89 | 13    |
| groupforums    | 13  | 0  | 13    |
| talent         | 8   | 0  | 8     |
| sound          | 8   | 0  | 8     |
| navigator      | 28  | 22 | 6     |
| crafting       | 6   | 0  | 6     |
| camera         | 6   | 0  | 6     |

Queue : `vault`/`callforhelp` 5, `userdefinedroomevents`/`nux`/`nft`/`gifts`/`friendfurni`/`campaign` 3, puis ≤2.

## Ce qui a changé depuis le 2026-07-01

- **`userdefinedroomevents` est clos.** C'était le plus gros bloc totalement absent (55 incoming / 25
  outgoing / 31 parser à zéro). Il est aujourd'hui à `60/55`, `27/25`, `28/31` — complet, plus les
  ajouts propres au port. C'est ce qui a débloqué `habbo/roomevents` (395 fichiers TS).
- **`marketplace` a disparu du backlog** : les 9 composers / 8 events / 8 parsers sont portés, avec
  le recycler et les palettes de pets vendables.
- **`room` s'est nettement resserré** (45/30/43 → 17/19/13) grâce à l'audit room du 2026-07-24.
- **`game` prend la première place** avec 122 fichiers manquants sur les trois directions, cohérent
  avec `habbo/game` à 0/63.
- **`inventory` outgoing est complet** (29/29) ; il ne reste que l'incoming et les parsers.

## Piège de nommage

Certaines catégories paraissent sur-portées parce que le port les range ailleurs que
`win63_version` : `moderation` affiche `24/0` en outgoing pendant que `moderator` affiche `0/21` —
ce sont les mêmes messages sous deux noms de dossier. Idem pour `help` (`34/32` incoming) et
`roomsettings` (`15/12` parser). Un comptage par catégorie est un indice de routage, pas une mesure
de parité : seul le registre AS3
(`sources/WIN63-202607011411-782849652/src/com/sulake/habbo/communication/_SafeCls_2046.as`) fait
foi sur ce qui existe.

## Un fichier porté n'est pas un message qui arrive

L'audit du 2026-07-24 a trouvé **23 messages entrants écrits ET enregistrés que rien n'écoutait**, et
42 autres enregistrés-mais-jamais-consommés. Tous comptaient comme portés dans les tableaux
ci-dessus et ne faisaient rien à l'exécution. Le comptage fichier est une borne haute ; la mesure
utile est « combien de messages ont un abonné ». Voir `docs/IMPLEMENTATION_STATUS.md` → « Recent Work
Recorded » pour la commande de re-mesure.

## Batchs recommandés

1. **Game + sound**
   Les deux plus gros blocs encore entièrement absents (122 et 27 fichiers), et sans dépendance sur
   ce qui est en cours. `habbo/game` est à 0/63, `habbo/sound` à 0/29.

2. **Users**
   67 fichiers sur les trois directions ; débloque les flux profil/utilisateur.

3. **Collectibles + groupforums**
   67 et 34 fichiers, catégories intactes.

4. **Catalog finishing**
   51 fichiers : offres ciblées, room ads, LTD raffle, vouchers.

5. **Room + inventory finishing**
   Deltas devenus modestes (49 et 39) ; continuer par flux fonctionnel complet plutôt que par
   fichiers isolés.

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
