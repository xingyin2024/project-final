const getPagination = (page = 1, limit = 10) => {
  const sanitizedPage = Math.max(1, Number(page) || 1);
  const sanitizedLimit = Math.min(100, Math.max(1, Number(limit) || 10));
  return { page: sanitizedPage, limit: sanitizedLimit };
};

module.exports = getPagination;