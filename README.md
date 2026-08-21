# Omni Product Catalog Service

Product Catalog & Inventory Service (TMF620) for the Omni-Channel microservices
project. Owns broadband package data and VAS (value-added service) addon data,
re-implementing 3 legacy mySLT APIs as TMF-aligned, database-backed endpoints.

## The 3 APIs in this service

| # | Legacy API | TMF Method | Endpoint |
|---|---|---|---|
| 1 | GetVASDataBundlePackages | listVASDataBundlePackages | `GET /internal-api/product-catalog/v1/vasDataBundlePackages` |
| 2 | GetBBPackages | listBBPackages | `GET /internal-api/product-catalog/v1/bbPackages?type=ADSL&package=WEB FAMILY PLUS` |
| 3 | GetBBPackageDetails | listBBPackageDetails | `GET /internal-api/product-catalog/v1/bbPackageDetails?code=ADSL-WFP` |

All 3 only read from this service's own MongoDB database - no synchronous calls
to any other microservice, per the assignment rules.

## Setup

1. Install dependencies:
   ```
   npm install
   ```
2. Copy `.env.example` to `.env` (already done in this generated project) and
   double check the `MONGODB_URI` and `PORT` match what's in the team's
   MongoDB/env docs for the **Product Catalog & Inventory** service (port 3005).
3. Seed the database with sample data pulled from the API params sheet:
   ```
   npm run seed
   ```
4. Start the service:
   ```
   npm run dev
   ```
   You should see `MongoDB connected` and `running on http://localhost:3005`.

## Try it without the gateway yet

You don't need the API Gateway or IAM service running to build and test these
3 endpoints on their own - just hit them directly with Postman:

```
GET http://localhost:3005/internal-api/product-catalog/v1/vasDataBundlePackages
GET http://localhost:3005/internal-api/product-catalog/v1/bbPackages?type=ADSL&package=WEB FAMILY PLUS
GET http://localhost:3005/internal-api/product-catalog/v1/bbPackageDetails?code=ADSL-WFP
```

The gateway + IAM only matter once the team wants to test the *whole* flow
(client -> gateway -> auth check -> this service), which is a later step.

## Data notes

- `npm run seed` only has real pricing (`monthlyRental`, `standardGB`, `freeGB`)
  for package `ADSL-WFP` (Web Family Plus), taken from the one sample response
  in the params sheet. Every other seeded package has those fields as `null`
  until the real figures are available - fill them in via MongoDB
  Compass/Atlas or extend the seed script.
- VAS addon data (Meet Lite/Max, LMS Lite/Max, Entertainment Combo, PeoTV Go)
  is seeded with the real values from the params sheet.

## Git workflow

Don't push directly to `main` or `dev`. For each API/feature:

```
git checkout dev
git pull origin dev
git checkout -b feature/get-vas-data-bundle-packages

# ...make changes...

git add [file path]
git commit -m "[message]"

git push origin feature/get-vas-data-bundle-packages
```

Then open a pull request into `dev` (not `main`) so the team can review before
it merges in.
