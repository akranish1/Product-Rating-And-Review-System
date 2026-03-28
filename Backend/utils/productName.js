const normalizeProductName = (product = "") =>
  String(product || "").trim().toLowerCase();

const escapeRegex = (value = "") =>
  String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const buildProductExactRegex = (product = "") =>
  new RegExp(`^\\s*${escapeRegex(String(product || "").trim())}\\s*$`, "i");

module.exports = {
  buildProductExactRegex,
  normalizeProductName,
};
