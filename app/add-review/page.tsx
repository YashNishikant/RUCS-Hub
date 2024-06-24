import ReviewCreateForm from "@/components/Review/ReviewCreateForm";
import { getAllCourses } from "@/lib/data/course";
import { getAllProfessors } from "@/lib/data/professor";
import { Course, Professor } from "@prisma/client";
import React from "react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Add Review",
};

export default async function Page({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const professors = await getAllProfessors();
  const courses = await getAllCourses();
  const { professorId, code } = searchParams;
  const professor = professorId
    ? professors.find(
        (p: Professor) => p.id == parseInt(professorId.toString()),
      )
    : null;
  const course = code
    ? courses.find((c: Course) => c.code == parseInt(code.toString()))
    : null;

  return (
    <div className="flex flex-col justify-center items-center">
      <h1 className="text-4xl max-sm:text-2xl font-bold text-primary-white">
        Add Review
      </h1>
      <ReviewCreateForm
        professors={professors}
        professor={professor}
        courses={courses}
        course={course}
      />
    </div>
  );
}
