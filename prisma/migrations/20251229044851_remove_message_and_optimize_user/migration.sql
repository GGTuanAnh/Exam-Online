/*
  Warnings:

  - You are about to drop the column `major` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `phone` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `student_id` on the `users` table. All the data in the column will be lost.
  - You are about to drop the `messages` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "messages" DROP CONSTRAINT "messages_sender_id_fkey";

-- AlterTable
ALTER TABLE "users" DROP COLUMN "major",
DROP COLUMN "phone",
DROP COLUMN "student_id";

-- DropTable
DROP TABLE "messages";
