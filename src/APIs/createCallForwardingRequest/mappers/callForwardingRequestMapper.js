const ACKNOWLEDGEMENT = 'Submitted your Request successfully. Thank you!';

function toLegacyResponse() {
  // Exact acknowledgement from workbook #289 / response sheet 94.
  return {
    isSuccess: true,
    errorMessege: ACKNOWLEDGEMENT,
    exceptionDetail: null,
    dataBundle: null,
    errorShow: ACKNOWLEDGEMENT,
    errorCode: null,
  };
}

function toTmfResponse(request) {
  // A typed request acknowledgement extension, not the standard TMF638 Service.
  // No Service lifecycle state or unimplemented resource href is fabricated.
  return {
    id: String(request._id),
    '@type': 'CallForwardingRequest',
    name: 'Call forwarding request',
    requestStatus: request.requestStatus,
    requestedDate: request.createdAt.toISOString(),
    serviceCharacteristic: ['telephoneNo', 'mobileNo', 'requestType'].map((name) => ({
      '@type': 'StringCharacteristic',
      name,
      valueType: 'string',
      value: request[name],
    })),
  };
}

module.exports = { toLegacyResponse, toTmfResponse };
