// Every legacy Omni API replies in this envelope (see API_Params_SLTOMNI_V2_0_1.xlsx
// sample responses) - keep the same shape so the API Gateway / mySLT app front end
// doesn't need to change how it parses responses.
function success(res, dataBundle) {
  return res.status(200).json({
    isSuccess: true,
    errorMessege: null,
    exceptionDetail: null,
    dataBundle,
    errorShow: null,
    errorCode: null,
  });
}

function failure(res, statusCode, errorMessege, exceptionDetail = null) {
  return res.status(statusCode).json({
    isSuccess: false,
    errorMessege,
    exceptionDetail,
    dataBundle: null,
    errorShow: true,
    errorCode: statusCode,
  });
}

module.exports = { success, failure };
