const reviewDateFormatter = new Intl.DateTimeFormat("en-US", {
  dateStyle: "medium",
  timeStyle: "short",
});

const formatReviewTime = (value = new Date()) => {
  const date = value instanceof Date ? value : new Date(value);

  if (Number.isNaN(date.getTime())) {
    return reviewDateFormatter.format(new Date());
  }

  return reviewDateFormatter.format(date);
};

module.exports = {
  formatReviewTime,
};
