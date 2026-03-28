const reviewDateFormatter = new Intl.DateTimeFormat("en-US", {
  dateStyle: "medium",
  timeStyle: "short",
});

export function formatReviewTimestamp(review) {
  const updatedAt = review?.updatedAt ? new Date(review.updatedAt) : null;
  const createdAt = review?.createdAt ? new Date(review.createdAt) : null;

  if (updatedAt && !Number.isNaN(updatedAt.getTime())) {
    const wasEdited =
      createdAt &&
      !Number.isNaN(createdAt.getTime()) &&
      updatedAt.getTime() - createdAt.getTime() > 60 * 1000;

    const formattedUpdatedAt = reviewDateFormatter.format(updatedAt);
    return wasEdited ? `Updated ${formattedUpdatedAt}` : formattedUpdatedAt;
  }

  if (createdAt && !Number.isNaN(createdAt.getTime())) {
    return reviewDateFormatter.format(createdAt);
  }

  return review?.time || "Unknown date";
}
