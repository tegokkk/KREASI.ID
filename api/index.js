// CommonJS entrypoint; all application code remains JavaScript ESM in backend/.
module.exports = async function handler(req, res) {
  const { default: api } = await import('../backend/src/vercel-handler.js');
  return api(req, res);
};
