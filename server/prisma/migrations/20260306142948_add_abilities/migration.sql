-- CreateTable
CREATE TABLE "abilities" (
    "id" TEXT NOT NULL,
    "hero_id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "cooldown" INTEGER NOT NULL DEFAULT 10000,
    "manaCost" INTEGER NOT NULL DEFAULT 50,
    "damage" INTEGER NOT NULL DEFAULT 0,
    "range" INTEGER NOT NULL DEFAULT 200,

    CONSTRAINT "abilities_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "abilities" ADD CONSTRAINT "abilities_hero_id_fkey" FOREIGN KEY ("hero_id") REFERENCES "heroes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
