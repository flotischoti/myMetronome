-- CreateTable
CREATE TABLE "Metronome" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "bpm" INTEGER NOT NULL,
    "lastOpened" TIMESTAMP(3) NOT NULL,
    "timerValue" INTEGER NOT NULL DEFAULT 120,
    "timerActive" BOOLEAN NOT NULL DEFAULT false,
    "timeUsed" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "owner" TEXT NOT NULL,

    CONSTRAINT "Metronome_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("email")
);

-- AddForeignKey
ALTER TABLE "Metronome" ADD CONSTRAINT "Metronome_owner_fkey" FOREIGN KEY ("owner") REFERENCES "User"("email") ON DELETE RESTRICT ON UPDATE CASCADE;
