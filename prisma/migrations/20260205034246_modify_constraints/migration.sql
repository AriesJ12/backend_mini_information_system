/*
  Warnings:

  - A unique constraint covering the columns `[student_id,subject_id,course_id]` on the table `grades` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[student_id,subject_id]` on the table `subject_reservations` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[course_id,code]` on the table `subjects` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "grades_student_id_subject_id_course_id_key" ON "grades"("student_id", "subject_id", "course_id");

-- CreateIndex
CREATE UNIQUE INDEX "subject_reservations_student_id_subject_id_key" ON "subject_reservations"("student_id", "subject_id");

-- CreateIndex
CREATE UNIQUE INDEX "subjects_course_id_code_key" ON "subjects"("course_id", "code");
