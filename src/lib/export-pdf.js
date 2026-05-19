// Lazy-load the PDF renderer + TripPDF component on demand. The library is
// ~500KB gzipped, so we keep it out of the main bundle and only fetch it
// when the user clicks Export.

import React from "react";

function slugify(s) {
  return String(s || "trip")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export async function exportTripAsPDF(trip) {
  if (!trip) throw new Error("No trip to export");

  const [{ pdf }, { TripPDF }] = await Promise.all([
    import("@react-pdf/renderer"),
    import("../components/TripPDF.jsx"),
  ]);

  const blob = await pdf(React.createElement(TripPDF, { trip })).toBlob();
  const url = URL.createObjectURL(blob);
  const dateTag = (trip.dateFrom || "").replace(/\s/g, "");
  const fileName = `trvlplnr-${slugify(trip.title)}${dateTag ? "-" + slugify(dateTag) : ""}.pdf`;

  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  // Give the browser a beat to start the download before revoking.
  setTimeout(() => URL.revokeObjectURL(url), 500);
}
