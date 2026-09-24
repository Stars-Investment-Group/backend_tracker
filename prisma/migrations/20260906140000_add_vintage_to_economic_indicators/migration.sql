-- Ajout du versionnement (millesimes) sur economic_indicators.
-- Objectif : conserver l'historique des revisions au lieu d'ecraser la valeur.
-- Les 130 lignes existantes recoivent leur date de recuperation comme millesime.

-- 1. Colonnes ajoutees en NULL autorise (la table contient deja des donnees)
ALTER TABLE "economic_indicators"
  ADD COLUMN "vintage_date"  DATE,
  ADD COLUMN "is_latest"     BOOLEAN      NOT NULL DEFAULT true,
  ADD COLUMN "last_seen_at"  TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- 2. Retro-remplissage : le millesime des lignes existantes est leur date de recuperation
UPDATE "economic_indicators"
   SET "vintage_date" = COALESCE("fetched_at"::date, CURRENT_DATE)
 WHERE "vintage_date" IS NULL;

-- 3. La colonne devient obligatoire une fois remplie
ALTER TABLE "economic_indicators"
  ALTER COLUMN "vintage_date" SET NOT NULL;

-- 4. Remplacement de la contrainte d'unicite : le millesime en fait desormais partie
DROP INDEX IF EXISTS "economic_indicators_provider_dataset_series_code_period_key";

CREATE UNIQUE INDEX "economic_indicators_provider_dataset_series_code_period_vin_key"
  ON "economic_indicators" ("provider", "dataset", "series_code", "period", "vintage_date");

-- 5. Index de lecture
CREATE INDEX "idx_indicator_latest"
  ON "economic_indicators" ("provider", "dataset", "series_code", "period", "is_latest");

CREATE INDEX "idx_indicator_country_dataset"
  ON "economic_indicators" ("country", "dataset");
