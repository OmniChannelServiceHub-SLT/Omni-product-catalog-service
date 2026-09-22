const { listBBFreedomStatus } = require('../services/bbFreedomStatusService');
const { mapBBFreedomStatus } = require('../mappers/bbFreedomStatusMapper');

async function listBBFreedomStatusHandler(req, res) {
  try {
    const { tpNo } = req.query;

    if (!tpNo) {
      return res.status(400).json({
        isSuccess: false,
        errorMessege: 'tpNo query parameter is required',
        exceptionDetail: null,
        dataBundle: null,
        errorShow: true,
        errorCode: 400
      });
    }

    const result = await listBBFreedomStatus(tpNo);

    if (!result) {
      return res.status(404).json({
        isSuccess: false,
        errorMessege: 'BB Freedom Status not found',
        exceptionDetail: null,
        dataBundle: null,
        errorShow: true,
        errorCode: 404
      });
    }

    return res.status(200).json(mapBBFreedomStatus(result));

  } catch (err) {
    console.error('listBBFreedomStatus failed:', err);

    return res.status(500).json({
      isSuccess: false,
      errorMessege: 'Failed to fetch BB Freedom Status',
      exceptionDetail: err.message,
      dataBundle: null,
      errorShow: true,
      errorCode: 500
    });
  }
}

module.exports = {
  listBBFreedomStatus: listBBFreedomStatusHandler
};