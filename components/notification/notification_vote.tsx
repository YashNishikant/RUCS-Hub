import {
  formatProfessorName,
  formatReviewDate,
  getProfessorRoute,
} from "@/lib/utils";
import Link from "next/link";
import React from "react";

interface Props {
  notification: any;
  vote: any;
  review: any;
}

export default function NotificationVote({
  notification,
  vote,
  review,
}: Props) {
  const { upvote } = vote;
  const { read } = notification;

  return (
    <div
      className={`flex flex-col py-1 px-2 text-primary-white text-xs ${
        !read && "bg-primary-white/10 rounded"
      } relative`}
    >
      {!read && (
        <span className="absolute top-0 right-2 text-md font-bold italic text-primary-white/50">
          !
        </span>
      )}
      <h2 className="font-black">
        Your review has been {upvote ? "upvoted" : "downvoted"}
      </h2>
      <div className="flex space-x-2">
        <h3 className="font-bold">Course:</h3>
        <Link
          className="hover:underline"
          href={`/course/${review.course.code}`}
        >
          {review.course.code} - {review.course.name}
        </Link>
      </div>
      <div className="flex space-x-2">
        <h3 className="font-bold">Professor:</h3>
        <Link
          className="hover:underline"
          href={getProfessorRoute(
            review.professor?.lastName ?? "",
            review.professor?.firstName ?? "",
          )}
        >
          {formatProfessorName(
            review.professor?.lastName ?? "",
            review.professor?.firstName ?? "",
          )}
        </Link>
      </div>
      <div className="flex space-x-2">
        <h3 className="font-bold">Review:</h3>
        <Link
          className="hover:underline"
          href={`/my-reviews?searchTerm=${review.title}`}
        >
          {review.title}
        </Link>
      </div>
      <span className="text-[0.6rem] text-primary-white/50">
        {formatReviewDate(notification.createdAt)}
      </span>
    </div>
  );
}
