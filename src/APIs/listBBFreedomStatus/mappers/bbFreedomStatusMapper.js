function mapBBFreedomStatus(product) {
  const freedomRequested = product.freedomRequested || 'N';

  if (freedomRequested === 'Y') {
    return {
      isSuccess: true,
      errorMessege: 'Your service request is In Progress',
      exceptionDetail: null,
      dataBundle: {
        'freedom requested': 'Y'
      },
      errorShow: 'Your service request is In Progress',
      errorCode: null
    };
  }

  return {
    isSuccess: true,
    errorMessege: null,
    exceptionDetail: null,
    dataBundle: {
      'freedom Requested': 'N'
    },
    errorShow: null,
    errorCode: null
  };
}

module.exports = {
  mapBBFreedomStatus
};