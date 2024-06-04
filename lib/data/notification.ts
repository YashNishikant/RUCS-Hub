import { prisma } from "@/prisma/prisma";

/**
 * Gets notifications for a user
 *
 * @param userId - ID of the user
 */
export async function getNotifications(userId: string) {
  return prisma.notification.findMany({
    where: {
      recipientId: userId,
    },
    include: {
      review: {
        include: {
          course: true,
          professor: true,
        },
      },
      vote: true,
    },
  });
}

/**
 * Creates a notification
 *
 * @param userId - ID of the user who is subscribing
 * @param courseCode - Course code of the course the user is subscribing to
 * @param professorId - ID of the professor the user is subscribing to
 * @param reviewId - ID of the review the user is subscribing to
 * @param voteId - ID of the vote placed on the review the user is subscribing to
 */
export async function createNotification(
  userId: string,
  courseCode?: number,
  professorId?: number,
  reviewId?: number,
  voteId?: number,
) {
  if (!userId) {
    throw new Error("Must provide userId to create notification");
  }

  if (!courseCode && !professorId && !reviewId) {
    throw new Error(
      "Must provide a courseCode, professorId, or reviewId to create notification",
    );
  }

  if ([courseCode, professorId, reviewId].filter(Boolean).length !== 1) {
    throw new Error(
      "Must provide exactly one of courseCode, professorId, or reviewId to create subscription",
    );
  }

  return await prisma.notification.create({
    data: {
      recipientId: userId,
      courseCode: courseCode,
      professorId: professorId,
      reviewId: reviewId,
      voteId: voteId,
    },
  });
}

/**
 * Deletes a notification
 *
 * @param notificationId - ID of the notification to delete
 */
export async function deleteNotification(notificationId: number) {
  if (!notificationId) {
    throw new Error("Must provide notificationId to delete notification");
  }

  return prisma.notification.delete({
    where: {
      id: notificationId,
    },
  });
}

/**
 * Notifies subscribers of a review that a post has been voted upon
 *
 * @param reviewId - ID of the review that got a vote
 * @param voteId - ID of the vote placed on the review
 */
export async function notifySubscribersReviewVote(
  reviewId: number,
  voteId: number,
) {
  const subscribers = await prisma.subscription.findMany({
    where: {
      reviewId: reviewId,
    },
  });

  if (subscribers.length === 0) {
    return;
  }

  for (const subscriber of subscribers) {
    await createNotification(
      subscriber.userId,
      undefined,
      undefined,
      subscriber.reviewId ?? undefined,
      voteId,
    );
  }
}

/**
 * Notifies subscribers of a vote that has been deleted
 *
 * @param reviewId - ID of the review
 * @param voteId - ID of the vote removed
 */
export async function notifySubscribersReviewVoteDeleted(
  reviewId: number,
  voteId: number,
) {
  const subscribers = await prisma.subscription.findMany({
    where: {
      reviewId: reviewId,
    },
  });

  if (subscribers.length === 0) {
    return;
  }

  for (const subscriber of subscribers) {
    const notification = await prisma.notification.findFirst({
      where: {
        recipientId: subscriber.userId,
        voteId: voteId,
      },
    });

    if (notification) {
      await deleteNotification(notification.id);
    }
  }
}
