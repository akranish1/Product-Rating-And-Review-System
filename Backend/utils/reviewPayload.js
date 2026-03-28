const validateReviewPayload = (body = {}) => {
  const product = body.product?.trim();
  const category = body.category?.trim();
  const review = body.review?.trim();
  const rating = Number(body.rating);
  const details = [];

  if (!product) {
    details.push({
      category: "product",
      message: "Product name is required",
    });
  }

  if (!category) {
    details.push({
      category: "category",
      message: "Category is required",
    });
  }

  if (!review) {
    details.push({
      category: "review",
      message: "Review text is required",
    });
  }

  if (!Number.isFinite(rating) || rating < 1 || rating > 5) {
    details.push({
      category: "rating",
      message: "Rating must be between 1 and 5",
    });
  }

  return {
    details,
    payload: {
      product,
      category,
      rating,
      review,
    },
  };
};

module.exports = {
  validateReviewPayload,
};
