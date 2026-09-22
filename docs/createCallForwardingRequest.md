# Call forwarding request

Implements workbook entry **289**, `Voice / CallForwardingRequest`, in
`Product Catalog and Inventory S` (Excel row 36). The source is API Params
**A94**, response sheet **94**. The supplied contract is GET with three query
parameters and an acknowledgement. Its TMF response and endpoint-path cells
are blank.

## Endpoint

```http
GET /tmf-api/serviceInventory/v5/callForwardingRequest?telephoneNo=0382222802&mobileNo=0715364923&requestType=Y
Authorization: Bearer <IAM access token>
x-response-format: legacy
```

The local origin is `http://localhost:3005`. This is a legacy submission
extension under the TMF638 namespace. It is not standard `GET /service` or
`POST /service`. The existing gateway must separately route this namespace
before it is available through port 8080; this change does not edit gateway
or IAM code.

The endpoint validates an IAM HS256 access token using `JWT_ACCESS_SECRET`.
Use the same secret as IAM and gateway. A token must have a nonempty string
subject and an unexpired numeric expiry. Missing authentication returns 401;
an unconfigured signing secret returns 503. The authenticated subject is
stored as `requestedBy`. Subscriber ownership cannot be verified from the
supplied mapping because it contains no account-to-telephone relationship.

## Input and persistence

All three query parameters must be single, nonempty strings. Numbers retain
leading zeroes and accept 1 to 15 digits, with an optional leading `+`.
Surrounding whitespace is removed; country codes are not rewritten. Repeated
keys, objects, malformed numbers, and unsupported request types return 400
before any write. `requestType` accepts **Y only**, as confirmed by the user.
The workbook does not document cancellation.

The service saves one acknowledged request in its own MongoDB collection,
`call_forwarding_requests`, including both numbers, request type, caller ID,
and timestamps. It responds only after the write succeeds. Every accepted
GET is a new request; callers should not automatically retry it after an
ambiguous connection failure. No idempotency contract was supplied.

This records a submission. There is no supplied SLT provisioning contract,
so this implementation does not activate forwarding, call a telecom system,
or report the telephone's current forwarding status. The separate workbook
entry 290 is outside this change.

Responses use `Cache-Control: no-store`. HEAD and unsupported mutation methods
return 405 without submitting a request. Browser CORS preflight is handled by
the existing application middleware and also does not submit a request.

## Responses

With `x-response-format: legacy`, HTTP 200 returns the exact workbook acknowledgement:

```json
{
  "isSuccess": true,
  "errorMessege": "Submitted your Request successfully. Thank you!",
  "exceptionDetail": null,
  "dataBundle": null,
  "errorShow": "Submitted your Request successfully. Thank you!",
  "errorCode": null
}
```

Without that header, HTTP 200 returns a typed `CallForwardingRequest`
acknowledgement with its database ID, `requestStatus: acknowledged`, creation
date, and typed string characteristics for the three inputs. This follows the
service's resource/legacy selection pattern, but is an extension response,
not a standard inventory `Service`. It invents no Service specification,
lifecycle state, or retrieval href.

All failures use the existing TMF-style Error shape. A persistence failure
returns 500 and never returns the legacy success acknowledgement.

## CTK verification

The feature test file and npm test script were removed at the user's request.
Those feature tests were never run. The user has approved running the supplied
TMF638 v5 CTK.

The supplied CTK checks standard `/service` create, list, retrieve, and patch
operations. It has no case for this custom `GET /callForwardingRequest`.
A CTK run therefore does not validate this feature's authentication, query
validation, persistence, or acknowledgement response. Unsupported standard
operations must be identified in the report; this extension alone does not
establish full TMF638 conformance.

Keep the supplied CTK specifications and test cases unchanged, and use a fresh
report from the approved run rather than reports included with the kit.
