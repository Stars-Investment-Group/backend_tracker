-- CreateTable
CREATE TABLE "reports" (
    "id" UUID NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "category" VARCHAR(50) NOT NULL,
    "frequency" VARCHAR(50),
    "reading_time_min" INTEGER,
    "page_count" INTEGER,
    "publish_date" DATE NOT NULL,
    "file_url" VARCHAR(500),
    "file_size_kb" INTEGER,
    "is_featured" BOOLEAN NOT NULL DEFAULT false,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "tags" JSONB NOT NULL DEFAULT '[]',
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "reports_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "report_bookmarks" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "report_id" UUID NOT NULL,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "report_bookmarks_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "idx_reports_category" ON "reports"("category");

-- CreateIndex
CREATE INDEX "idx_reports_publish_date" ON "reports"("publish_date" DESC);

-- CreateIndex
CREATE INDEX "idx_reports_featured" ON "reports"("is_featured");

-- CreateIndex
CREATE INDEX "idx_report_bookmarks_user" ON "report_bookmarks"("user_id");

-- CreateIndex
CREATE INDEX "idx_report_bookmarks_report" ON "report_bookmarks"("report_id");

-- CreateIndex
CREATE UNIQUE INDEX "report_bookmarks_user_id_report_id_key" ON "report_bookmarks"("user_id", "report_id");

-- AddForeignKey
ALTER TABLE "report_bookmarks" ADD CONSTRAINT "report_bookmarks_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "report_bookmarks" ADD CONSTRAINT "report_bookmarks_report_id_fkey" FOREIGN KEY ("report_id") REFERENCES "reports"("id") ON DELETE CASCADE ON UPDATE CASCADE;
