# Product Catalog Service CTK Report

Run date: 2026-11-11 (Asia/Colombo)

Branch: `sanju_working`

Result: **FAIL — the service does not currently pass the full TM Forum CTKs.**

## Scope and environment

- Service URL: `http://127.0.0.1:3005`
- Isolated MongoDB database seeded with 84 TMF620 ProductOffering records, 2 TMF637 Product records, and 1 diagnostic TMF638 Service record.
- Authentication: short-lived HS256 JWT generated from the local development configuration and injected into CTK requests.
- CTK sources:
  - `tmforum-rand/CTK-TMF620-ProductCatalog` (TMF620 v4.0)
  - `tmforum-rand/CTK-TMF637-ProductInventory` (TMF637 v4.0)
  - `tmforum-rand/CTK-TMF638-ServiceInventory` (v4/R18.5 suite)
- TMF638 limitation: the implementation exposes TMF638 v5. The publicly available repository contains a v4 CTK, so that suite was run against the v5 endpoint for diagnostics only. It is not a certification-valid result.

## CTK results

| Suite | Requests executed | Assertions passed | Assertions failed | Pass rate | Result |
| --- | ---: | ---: | ---: | ---: | --- |
| TMF620 v4.0 | 47/47 | 1,468 | 853 | 63.25% | FAIL |
| TMF637 v4.0 | 8/8 | 17 | 44 | 27.87% | FAIL |
| TMF638 v4 diagnostic against v5 | 9/9 | 45 | 218 | 17.11% | FAIL / version mismatch |

`Requests executed` means Newman completed the HTTP request; it does not mean the request passed its assertions.

## Main conformance gaps

### TMF620 Product Catalog Management

1. `productSpecification` is not implemented. The CTK requires collection/ID retrieval, creation and filtering behavior.
2. `productOfferingPrice` is not implemented as its own resource. Prices currently exist only as embedded ProductOffering data.
3. ProductOffering supports GET collection and retrieval, but the CTK also requires POST, PATCH and DELETE.
4. Generic ProductOffering responses do not consistently include mandatory CTK attributes, principally `lifecycleStatus` and `productSpecification`.
5. Generic filtering is incomplete. The CTK exercises `id`, `lastUpdate`, `lifecycleStatus` and `name`; unsupported or unresolved filters returned 400.
6. Several later CTK failures are cascading failures because the initial POST could not create an offering and therefore did not populate the CTK ID variables.

### TMF637 Product Inventory Management

1. Collection results do not provide the complete CTK-required Product profile, particularly `productPrice` and `relatedParty` across every returned record.
2. The main Product collection handler is specialized for `subscriberID`; standard CTK filters such as `id` and `status` return 400.
3. The implemented ID retrieval route works for owned records, but the complete collection/search conformance profile is not implemented.

### TMF638 Service Inventory Management

1. `GET /service` collection retrieval is not implemented; only `GET /service/:id` and `PATCH /service/:id` exist.
2. Collection filtering by `category`, `state`, `name`, and `fields` is missing.
3. The implemented voice-service subset does not expose the full v4 CTK Service profile, including service relationships, supporting resources/services, service specification, related parties and places.
4. The CTK could not discover service IDs because the collection route is absent, causing cascading ID-retrieval failures.
5. The implementation is v5 while this public CTK is v4; a matching official v5 CTK is required for a valid final TMF638 result.

## Product Catalog API endpoint matrix

All 18 workbook-selected APIs passed an authenticated endpoint smoke and basic TMF-shape check. This confirms that the implemented routes work with seeded data; it does **not** override the failed CTK results.

| ID | Unique method | API | HTTP result | Basic shape | Official CTK position |
| --- | --- | --- | ---: | --- | --- |
| A35 | `retrieveSubscription` | TMF637 | 200 | PASS | TMF637 suite FAIL |
| A48 | `getMyPackage` | TMF637 | 200 | PASS | TMF637 suite FAIL |
| A49 | `listOfferingAdv` | TMF620 | 200 | PASS | TMF620 suite FAIL |
| A71 | `listProductOffering` | TMF620 | 200 | PASS | TMF620 suite FAIL |
| A73 | `retrieveService` | TMF638 v5 | 200 | PASS | v4 diagnostic FAIL; version mismatch |
| A74 | `listProductOrderBb` | Custom | 200 | PASS | Outside TMF CTK scope |
| A76 | `retrieveOfferingBb` | TMF620 | 200 | PASS | TMF620 suite FAIL |
| A78 | `getDashboardVas` | Custom | 200 | PASS | Outside TMF CTK scope |
| A91 | `listOfferingBbPkg` | TMF620 | 200 | PASS | TMF620 suite FAIL |
| A94 | `patchService` | TMF638 v5 | 200 | PASS | Not covered by downloaded v4 GET-only CTK |
| A95 | `retrieveServiceStatus` | TMF638 v5 | 200 | PASS | v4 diagnostic FAIL; version mismatch |
| A99 | `listOfferingCurrentBb` | TMF620 | 200 | PASS | TMF620 suite FAIL |
| A104 | `getBbPackagesInterim` | TMF620 | 200 | PASS | TMF620 suite FAIL |
| A105 | `getPeoPackages` | TMF620 | 200 | PASS | TMF620 suite FAIL |
| A106 | `getVoicePackages` | TMF620 | 200 | PASS | TMF620 suite FAIL |
| A119 | `listOffering` | TMF620 | 200 | PASS | TMF620 suite FAIL |
| A120 | `listProduct` | TMF637 | 200, empty collection | PASS | TMF637 suite FAIL |
| A62 | `listOfferingVas` | TMF620 | 200 | PASS | TMF620 suite FAIL |

## Recommended implementation order

1. Complete the TMF620 mandatory resource surface: ProductSpecification, ProductOfferingPrice, and ProductOffering CRUD.
2. Add mandatory ProductOffering fields and standard filters before re-running TMF620.
3. Expand TMF637 Product collection filtering and ensure every Product representation contains the conformance-profile mandatory attributes.
4. Add TMF638 v5 collection retrieval and filtering, then obtain the matching official v5 CTK.
5. Re-run each suite after each resource group is completed; do not treat the 18/18 endpoint smoke result as CTK conformance.

## Evidence files

- `api-matrix.json`: results for all 18 selected APIs.
- `TMF620-v4.0.html` and `TMF620-v4.0.newman.json`: raw TMF620 CTK output.
- `TMF637-v4.0.html` and `TMF637-v4.0.newman.json`: raw TMF637 CTK output.
- `TMF638-v4-CTK-against-v5-endpoint.html` and matching Newman JSON: diagnostic TMF638 output.
- `*.summary.json`: reduced per-suite failure details.
