/*
  Warnings:

  - Added the required column `referenceNumber` to the `applications` table without a default value. This is not possible if the table is not empty.

*/
-- CreateTable
CREATE TABLE "news_categories" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "slug" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "news_articles" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "excerpt" TEXT,
    "content" TEXT NOT NULL,
    "featuredImage" TEXT,
    "metaTitle" TEXT,
    "metaDescription" TEXT,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "isBreaking" BOOLEAN NOT NULL DEFAULT false,
    "isFeatured" BOOLEAN NOT NULL DEFAULT false,
    "viewCount" INTEGER NOT NULL DEFAULT 0,
    "publishedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "authorId" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    CONSTRAINT "news_articles_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "news_articles_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "news_categories" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "news_tags" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "news_comments" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "content" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "isReply" BOOLEAN NOT NULL DEFAULT false,
    "parentId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "authorId" TEXT NOT NULL,
    "articleId" TEXT NOT NULL,
    CONSTRAINT "news_comments_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "news_comments_articleId_fkey" FOREIGN KEY ("articleId") REFERENCES "news_articles" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "news_comments_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "news_comments" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "_NewsArticleToNewsTag" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,
    CONSTRAINT "_NewsArticleToNewsTag_A_fkey" FOREIGN KEY ("A") REFERENCES "news_articles" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "_NewsArticleToNewsTag_B_fkey" FOREIGN KEY ("B") REFERENCES "news_tags" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_applications" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "referenceNumber" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "data" TEXT,
    "businessName" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "applications_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_applications" ("createdAt", "data", "id", "status", "type", "updatedAt", "userId") SELECT "createdAt", "data", "id", "status", "type", "updatedAt", "userId" FROM "applications";
DROP TABLE "applications";
ALTER TABLE "new_applications" RENAME TO "applications";
CREATE UNIQUE INDEX "applications_referenceNumber_key" ON "applications"("referenceNumber");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "news_categories_name_key" ON "news_categories"("name");

-- CreateIndex
CREATE UNIQUE INDEX "news_categories_slug_key" ON "news_categories"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "news_articles_slug_key" ON "news_articles"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "news_tags_name_key" ON "news_tags"("name");

-- CreateIndex
CREATE UNIQUE INDEX "news_tags_slug_key" ON "news_tags"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "_NewsArticleToNewsTag_AB_unique" ON "_NewsArticleToNewsTag"("A", "B");

-- CreateIndex
CREATE INDEX "_NewsArticleToNewsTag_B_index" ON "_NewsArticleToNewsTag"("B");
