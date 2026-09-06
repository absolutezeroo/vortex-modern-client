-- Least-privilege database account for vortex-imager.
--
-- The imager is an HTTP service. Every statement it runs is a SELECT (src/db/Database.ts) and
-- every one is parameterised, so there is no injection to exploit today — but it used to connect
-- as `root`, which means one day's bug, one day's dependency, or one day's exposed port is the
-- whole hotel database rather than seven readable tables. The grant below is the guard the
-- application code cannot give itself.
--
-- Run it as root, once:
--
--   mysql -u root -p < tools/grant-readonly.sql
--
-- then put the same password in `.env` as IMAGER_DB_PASSWORD.
--
-- `127.0.0.1` and not `%`: the imager runs on the database host. If it ever moves, name that
-- host explicitly rather than opening the account to the network.

CREATE USER IF NOT EXISTS 'vortex_imager'@'127.0.0.1' IDENTIFIED BY '__PASSWORD__';
ALTER USER 'vortex_imager'@'127.0.0.1' IDENTIFIED BY '__PASSWORD__';

-- Named table by table on purpose. `GRANT SELECT ON turbo.*` would quietly extend to every
-- table added later — password hashes, tickets, tokens, the bans table — and the imager draws
-- avatars, badges and rooms out of exactly these.
GRANT SELECT (`name`, `figure`, `gender`) ON `turbo`.`players`              TO 'vortex_imager'@'127.0.0.1';
GRANT SELECT                              ON `turbo`.`rooms`                TO 'vortex_imager'@'127.0.0.1';
GRANT SELECT                              ON `turbo`.`room_models`          TO 'vortex_imager'@'127.0.0.1';
GRANT SELECT                              ON `turbo`.`furniture`            TO 'vortex_imager'@'127.0.0.1';
GRANT SELECT                              ON `turbo`.`furniture_definitions`TO 'vortex_imager'@'127.0.0.1';
GRANT SELECT                              ON `turbo`.`group_badge_parts`    TO 'vortex_imager'@'127.0.0.1';
GRANT SELECT                              ON `turbo`.`group_colors`         TO 'vortex_imager'@'127.0.0.1';

-- Not read by the service, only by `tools/pregenerate.mjs`, which needs the list of badge codes
-- to bake. Two columns of it: the badge and whether the guild still exists.
GRANT SELECT (`badge`, `deleted_at`)      ON `turbo`.`groups`               TO 'vortex_imager'@'127.0.0.1';

FLUSH PRIVILEGES;
