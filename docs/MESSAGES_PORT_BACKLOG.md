# Backlog Port Messages AS3 -> TS

**Date:** 2026-07-01
**Source primaire:** `sources/win63_version/habbo/communication/messages/`
**Scope:** `incoming/`, `outgoing/`, `parser/`
**Méthode:** comptage filesystem. Ces chiffres indiquent les fichiers présents, pas une validation de parité AS3 complète.

## Snapshot actuel

| Type      | AS3       | TS      | Delta brut restant |
|-----------|-----------|---------|--------------------|
| incoming  | 700       | 341     | 359                |
| outgoing  | 547       | 283     | 264                |
| parser    | 630       | 339     | 291                |
| **Total** | **1,877** | **963** | **914**            |

## Top catégories manquantes

### incoming

| Catégorie             | AS3 | TS | Delta |
|-----------------------|-----|----|-------|
| userdefinedroomevents | 55  | 0  | 55    |
| catalog               | 51  | 3  | 48    |
| room                  | 106 | 61 | 45    |
| game                  | 44  | 5  | 39    |
| users                 | 55  | 26 | 29    |
| inventory             | 56  | 30 | 26    |
| collectibles          | 20  | 0  | 20    |
| moderation            | 26  | 14 | 12    |
| navigator             | 51  | 40 | 11    |
| sound                 | 10  | 0  | 10    |
| groupforums           | 9   | 0  | 9     |
| marketplace           | 9   | 0  | 9     |

### outgoing

| Catégorie             | AS3 | TS | Delta |
|-----------------------|-----|----|-------|
| catalog               | 40  | 2  | 38    |
| room                  | 97  | 67 | 30    |
| game                  | 27  | 0  | 27    |
| users                 | 47  | 22 | 25    |
| userdefinedroomevents | 25  | 0  | 25    |
| moderator             | 21  | 0  | 21    |
| collectibles          | 18  | 0  | 18    |
| groupforums           | 12  | 0  | 12    |
| help                  | 34  | 23 | 11    |
| camera                | 10  | 0  | 10    |
| marketplace           | 10  | 0  | 10    |
| sound                 | 9   | 0  | 9     |

### parser

| Catégorie             | AS3 | TS | Delta |
|-----------------------|-----|----|-------|
| game                  | 61  | 5  | 56    |
| room                  | 102 | 59 | 43    |
| catalog               | 39  | 3  | 36    |
| userdefinedroomevents | 31  | 0  | 31    |
| collectibles          | 29  | 0  | 29    |
| inventory             | 55  | 31 | 24    |
| users                 | 39  | 21 | 18    |
| groupforums           | 13  | 0  | 13    |
| sound                 | 8   | 0  | 8     |
| marketplace           | 8   | 0  | 8     |
| talent                | 8   | 0  | 8     |
| navigator             | 28  | 22 | 6     |

## Corrections importantes depuis l'ancien backlog

- `help` n'est plus à zéro : incoming `33/32`, outgoing `23/34`, parser `33/33` en comptage brut.
- `moderation` n'est plus à zéro : incoming `14/26`, parser `25/19`, plus un shell manager côté module.
- `quest` n'est plus à zéro : incoming `12/20`, outgoing `15/18`, parser `19/16`.
- `catalog` a commencé côté module et messages, mais reste un des plus gros trous.
- `userdefinedroomevents` est le plus gros bloc totalement absent côté messages TS.

## Batchs recommandés

1. **Wired / userdefinedroomevents**
   Port prioritaire si l'objectif est de débloquer les Wired et `habbo/roomevents`.

2. **Catalog + marketplace + collectibles**
   Nécessaire pour rendre le commerce réaliste. Porter les triplets event/parser/composer et le wiring manager.

3. **Room protocol remaining**
   Le moteur room est avancé, mais le protocole room a encore de gros deltas entrants/parsers.

4. **Game + sound**
   Modules non démarrés ou presque absents.

5. **Users + inventory finishing**
   Plusieurs batches existent déjà. Continuer par flux fonctionnel complet plutôt que par fichiers isolés.

## Règle de port obligatoire

Pour chaque message :

- Lire l'AS3 source avant d'écrire le TS.
- Porter le triplet complet quand il existe : event, parser, composer.
- Exporter dans le `index.ts` du dossier.
- Enregistrer dans `packages/helium-engine/src/habbo/communication/HabboMessages.ts`.
- Brancher le handler/manager consommateur.
- Ajouter les commentaires `AS3:` requis au-dessus des déclarations portées.
- Valider avec `pnpm build` quand le batch touche du code.
