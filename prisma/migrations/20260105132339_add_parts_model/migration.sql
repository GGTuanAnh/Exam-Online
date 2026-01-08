-- CreateTable
CREATE TABLE "parts" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "duration" INTEGER NOT NULL,
    "course_id" TEXT NOT NULL,
    "question_bank_id" TEXT,
    "score" INTEGER NOT NULL DEFAULT 100,
    "max_retake" INTEGER NOT NULL DEFAULT 1,
    "randomize_questions" BOOLEAN NOT NULL DEFAULT false,
    "enable_anti_cheat" BOOLEAN NOT NULL DEFAULT false,
    "enable_tab_warning" BOOLEAN NOT NULL DEFAULT false,
    "open_time" TIMESTAMP(3),
    "close_time" TIMESTAMP(3),
    "show_answer_after_submit" BOOLEAN NOT NULL DEFAULT false,
    "scoring_mode" TEXT NOT NULL DEFAULT 'latest',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "parts_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "parts" ADD CONSTRAINT "parts_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "courses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "parts" ADD CONSTRAINT "parts_question_bank_id_fkey" FOREIGN KEY ("question_bank_id") REFERENCES "question_banks"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "exam_result_details" ADD CONSTRAINT "exam_result_details_question_id_fkey" FOREIGN KEY ("question_id") REFERENCES "questions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
