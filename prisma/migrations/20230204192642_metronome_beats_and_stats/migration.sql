-- AlterTable
ALTER TABLE "Metronome" ADD COLUMN     "beats" INTEGER NOT NULL DEFAULT 4,
ADD COLUMN     "showStats" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "stressFirst" BOOLEAN NOT NULL DEFAULT false,
ALTER COLUMN "timerValue" SET DEFAULT 120000;
