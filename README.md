# Omni Product Catalog Service

Product Catalog & Inventory microservice for the Omni-Channel project, owned
by the Product Catalog and Inventory team. Re-implements legacy mySLT APIs
(broadband packages, VAS add-ons, data gift packages, subscriber usage) as
TMF-aligned, database-backed endpoints, following TM Forum Open API
standards (TMF620 Product Catalog Management, TMF637 Product Inventory
Management).

## What this service owns

- Broadband package catalog and upgrade/downgrade logic
- VAS (value-added service) add-on catalog
- Data gift package catalogs (standard and mobile)
- Advanced reporting package catalog
- Per-subscriber usage snapshots (main package usage and VAS dashboard usage)
- Call-forwarding request submissions (workbook entry 289, requestType Y)

APIs use this service's own MongoDB database, with no synchronous calls to
other microservices. Call-forwarding submissions persist an acknowledged
request; they do not activate a telephone service.

## Architecture

- **Models** (`src/models/`) - named after the TMF resource they represent,
  not the business feature: `TMF620_productOffering.js` for catalog items,
  `TMF637_product.js` for usage snapshots. One collection per model,
  discriminated by a type field, instead of one collection per feature.
- **Mappers** (`src/mappers/` and each API's own `mappers/` folder) - convert
  data into the TMF-aligned response shape (id/href/@type, characteristic
  arrays for anything without a fixed TMF field) before it's sent.
- **Services** - read from the database, no business logic changes from the
  legacy behaviour.
- **Controllers** - call the service, pass the result through the mapper,
  send it via the shared TMF response helper.
- **Responses** - no custom envelope. Successful responses return the TMF
  resource directly; errors follow TM Forum's standard Error shape
  (`code`/`reason`/`message`/`status`).

## Setup

1. `npm install`
2. Copy `.env.example` to `.env` and confirm `MONGODB_URI` / `PORT` match the
   team's assigned values for this service (port 3005).
3. `npm run seed` - populates the database with sample catalog and usage data.
4. `npm run dev` - starts the service on `http://localhost:3005`.

## Testing

Each endpoint can be tested directly against this service (no gateway or
IAM needed), or through the API Gateway with a Bearer token once that's
wired up. Base paths:

- TMF620 (Product Catalog Management): `/tmf-api/productCatalogManagement/v4`
- TMF637 (Product Inventory Management): `/tmf-api/productInventoryManagement/v4`

The call-forwarding compatibility extension is
`GET /tmf-api/serviceInventory/v5/callForwardingRequest`. It requires a valid
IAM bearer token and `JWT_ACCESS_SECRET` matching IAM. See
[its contract and CTK coverage](docs/createCallForwardingRequest.md).
The extension does not implement the standard TMF638 Service CRUD API.

## Notes on data completeness

- Only broadband package `ADSL-WFP` has real pricing figures seeded; other
  packages have those fields as `null` until real figures are available.
- Data gift package catalogs are seeded with placeholder data - no sample
  response existed in the source reference for those two.
- The team's tracking sheet's "TMF-ALIGNED OUTPUT" column isn't filled in
  yet for any API, so the mapper's exact field names are a first-pass
  standard TMF mapping. Confirm and adjust once the team agrees on exact
  field names.

## Git workflow

Feature branches off `dev`, one per API/change - no direct pushes to `dev`
or `main`. Small, descriptive commits per file. Open a PR into `dev` once
locally tested.
