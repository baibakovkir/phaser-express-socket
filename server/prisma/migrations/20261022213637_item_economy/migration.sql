-- AlterTable
ALTER TABLE "match_players" ADD COLUMN     "last_hits" INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "items" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "price" INTEGER NOT NULL,
    "stats" JSONB NOT NULL,
    "active_kind" TEXT,
    "cooldown" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "item_components" (
    "item_id" TEXT NOT NULL,
    "component_id" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "item_components_pkey" PRIMARY KEY ("item_id","component_id")
);

-- AddForeignKey
ALTER TABLE "item_components" ADD CONSTRAINT "item_components_item_id_fkey" FOREIGN KEY ("item_id") REFERENCES "items"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "item_components" ADD CONSTRAINT "item_components_component_id_fkey" FOREIGN KEY ("component_id") REFERENCES "items"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
