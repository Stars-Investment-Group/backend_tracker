/*
  Warnings:

  - Changed the type of `alert_type` on the `alerts` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "alerts" DROP COLUMN "alert_type",
ADD COLUMN     "alert_type" "alert_type_enum" NOT NULL;
