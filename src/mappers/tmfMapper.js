// Shared helpers so every mapper builds TMF-aligned resources the same way.
//
// TMF resources share a few common "envelope" fields on every resource:
//   id, href, @type, @baseType, @schemaLocation
// For any data that doesn't have a fixed field in the base TMF schema (prices,
// usage numbers, tax values, etc.) the standard TMF pattern is a *characteristic*
// array - a list of { name, value } pairs. That's what we use here so legacy
// fields don't get lost, they just move into a standard shape.
//
// NOTE: the team's tracking sheet "TMF-ALIGNED OUTPUT" column is still empty
// for every API (not just these 8) as of now - this is a first-pass, standard
// TMF-style mapping. Once the team agrees on exact field names, only the
// per-API mapper files need small edits - this shared helper shouldn't need
// to change.

function toCharacteristics(obj) {
  return Object.entries(obj)
    .filter(([, value]) => value !== undefined)
    .map(([name, value]) => ({ name, value }));
}

function buildResource({ id, type, baseType, extra = {} }) {
  return {
    id,
    href: `/${type.charAt(0).toLowerCase()}${type.slice(1)}/${id}`,
    '@type': type,
    '@baseType': baseType || type,
    ...extra,
  };
}

module.exports = { toCharacteristics, buildResource };
