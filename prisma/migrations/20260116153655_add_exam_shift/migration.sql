/*
  Warnings:

  - You are about to drop the column `close_time` on the `exams` table. All the data in the column will be lost.
  - You are about to drop the column `open_time` on the `exams` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "exam_sessions" ADD COLUMN     "exam_shift_id" TEXT;

-- AlterTable
ALTER TABLE "exams" DROP COLUMN "close_time",
DROP COLUMN "open_time";

-- CreateTable
CREATE TABLE "exam_shifts" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "exam_id" TEXT NOT NULL,
    "start_time" TIMESTAMP(3) NOT NULL,
    "end_time" TIMESTAMP(3) NOT NULL,
    "password" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "exam_shifts_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "exam_shifts" ADD CONSTRAINT "exam_shifts_exam_id_fkey" FOREIGN KEY ("exam_id") REFERENCES "exams"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "exam_sessions" ADD CONSTRAINT "exam_sessions_exam_shift_id_fkey" FOREIGN KEY ("exam_shift_id") REFERENCES "exam_shifts"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "exam_results" ADD CONSTRAINT "exam_results_exam_id_fkey" FOREIGN KEY ("exam_id") REFERENCES "exams"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
