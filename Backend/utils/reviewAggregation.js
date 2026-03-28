const Review = require("../models/Review");
const { normalizeProductName } = require("./productName");

const buildDefaultStats = () => ({
  avgRating: 0,
  totalReviews: 0,
});

const getStatsAggregationPipeline = (normalizedProducts = null) => {
  const pipeline = [
    {
      $addFields: {
        normalizedProduct: {
          $ifNull: [
            "$productKey",
            {
              $toLower: {
                $trim: {
                  input: {
                    $ifNull: ["$product", ""],
                  },
                },
              },
            },
          ],
        },
      },
    },
  ];

  if (Array.isArray(normalizedProducts) && normalizedProducts.length) {
    pipeline.push({
      $match: {
        normalizedProduct: {
          $in: normalizedProducts,
        },
      },
    });
  }

  pipeline.push(
    {
      $group: {
        _id: "$normalizedProduct",
        avgRating: {
          $avg: "$rating",
        },
        totalReviews: {
          $sum: 1,
        },
      },
    },
    {
      $project: {
        _id: 0,
        productKey: "$_id",
        avgRating: {
          $round: ["$avgRating", 1],
        },
        totalReviews: 1,
      },
    }
  );

  return pipeline;
};

const getProductReviewStats = async (product) => {
  const productKey = normalizeProductName(product);
  if (!productKey) {
    return buildDefaultStats();
  }

  const [result] = await Review.aggregate(
    getStatsAggregationPipeline([productKey])
  );

  return result ? { avgRating: result.avgRating, totalReviews: result.totalReviews } : buildDefaultStats();
};

const getProductReviewStatsMap = async (products = []) => {
  const normalizedProducts = [...new Set(products.map(normalizeProductName).filter(Boolean))];
  if (!normalizedProducts.length) {
    return {};
  }

  const stats = await Review.aggregate(
    getStatsAggregationPipeline(normalizedProducts)
  );

  return stats.reduce((acc, item) => {
    acc[item.productKey] = {
      avgRating: item.avgRating,
      totalReviews: item.totalReviews,
    };
    return acc;
  }, {});
};

module.exports = {
  getProductReviewStats,
  getProductReviewStatsMap,
  normalizeProductName,
};
