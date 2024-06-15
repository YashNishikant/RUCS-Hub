"use server";

import {
  notifySubscribersCourseReviewCreated,
  notifySubscribersProfessorReviewCreated,
} from "../data/notification";
import { downvoteReview, upvoteReview } from "../data/review";
import { createSubscription } from "../data/subscription";
import { ReviewForm } from "../definitions/review";
import { prisma } from "@/prisma/prisma";

/**
 * Creates a new review and subscribes the user to updates on the review
 *
 * @param reviewForm - The review form data
 * @param userId - The ID of the user creating the review
 */
export default async function createReview(
  reviewForm: ReviewForm,
  userId: string,
) {
  let professorFirstName, professorLastName;
  const professorNameSplit = reviewForm.professor.split(" ");

  if (professorNameSplit.length === 1) {
    professorLastName = professorNameSplit[0];
  } else {
    professorFirstName = professorNameSplit[0];
    professorLastName = professorNameSplit[1];
  }

  const professor = await prisma.professor.findFirst({
    where: {
      firstName: professorFirstName?.toUpperCase(),
      lastName: professorLastName.toUpperCase(),
    },
  });

  const professorId = professor?.id || -1;
  const code = Number(reviewForm.course.split(" ")[0]);

  const review = await prisma.review.create({
    data: {
      userId,
      courseCode: code,
      professorId: professorId,
      year: Number(reviewForm.year),
      semester: Number(reviewForm.term),
      title: reviewForm.title,
      content: reviewForm.content,
      rating: Number(reviewForm.courseRating),
      difficultyRating: Number(reviewForm.courseDifficultyRating),
      workload: Number(reviewForm.courseWorkload),
      professorQualityRating: Number(reviewForm.professorRating),
      professorDifficultyRating: Number(reviewForm.professorDifficultyRating),
      lectureRating: Number(reviewForm.lectureRating),
    },
  });

  if (!review) {
    throw new Error("Failed to create review");
  }

  await createSubscription(userId, undefined, undefined, review.id);

  const { id: reviewId } = review;
  await notifySubscribersCourseReviewCreated(code, reviewId);
  await notifySubscribersProfessorReviewCreated(professorId, reviewId);
}

/**
 * Updates a review
 *
 * @param reviewId - The ID of the review to update
 * @param reviewForm - The updated review form data
 */
export async function updateReview(reviewId: number, reviewForm: ReviewForm) {
  await prisma.review.update({
    where: {
      id: reviewId,
    },
    data: {
      title: reviewForm.title,
      content: reviewForm.content,
      rating: Number(reviewForm.courseRating),
      difficultyRating: Number(reviewForm.courseDifficultyRating),
      workload: Number(reviewForm.courseWorkload),
      professorQualityRating: Number(reviewForm.professorRating),
      professorDifficultyRating: Number(reviewForm.professorDifficultyRating),
      lectureRating: Number(reviewForm.lectureRating),
    },
  });

  await prisma.review.update({
    where: {
      id: reviewId,
    },
    data: {
      lastModified: new Date(),
    },
  });
}

/**
 * Votes on a review
 *
 * @param userId - The ID of the user voting
 * @param reviewId - The ID of the review being voted on
 * @param upvote - Whether the user is voting up or down
 */
export async function vote(userId: string, reviewId: number, upvote: boolean) {
  return upvote
    ? await upvoteReview(userId, reviewId)
    : await downvoteReview(userId, reviewId);
}

/**
 * Deletes a review
 *
 * @param reviewId - The ID of the review to delete
 */
export async function deleteReview(reviewId: number) {
  return await prisma.review.delete({
    where: {
      id: reviewId,
    },
  });
}
