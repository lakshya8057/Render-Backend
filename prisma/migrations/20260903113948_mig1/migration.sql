-- CreateTable
CREATE TABLE "photos" (
    "id" TEXT NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "filename" VARCHAR(500) NOT NULL,
    "originalName" VARCHAR(500) NOT NULL,
    "mimeType" VARCHAR(50) NOT NULL,
    "size" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "photos_pkey" PRIMARY KEY ("id")
);
