export class ApiError extends Error {
  constructor(statusCode, message) {
    super(message);
    this.statusCode = statusCode;
  }
}
export const asyncHandler = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
export const paginate = async (model, filter = {}, reqQuery = {}) => {
  const page = Math.max(1, parseInt(reqQuery.page) || 1);
  const limit = Math.min(100, parseInt(reqQuery.limit) || 20);
  const skip = (page - 1) * limit;
  const sort = reqQuery.sort || '-createdAt';
  const [data, total] = await Promise.all([
    model.find(filter).sort(sort).skip(skip).limit(limit),
    model.countDocuments(filter)
  ]);
  return { data, meta: { total, page, limit, pages: Math.ceil(total / limit) } };
};
export const toCSV = (rows) => {
  if (!rows.length) return '';
  const headers = Object.keys(rows[0]);
  // Prevent CSV formula injection (=,+,-,@,tab,carriage) by prefixing with single quote
  const sanitize = (v) => {
    let s = String(v ?? '');
    if (/^[=+\-@\t\r]/.test(s)) s = `'${s}`;
    return `"${s.replace(/"/g, '""')}"`;
  };
  return [headers.join(','), ...rows.map(r => headers.map(h => sanitize(r[h])).join(','))].join('\n');
};
