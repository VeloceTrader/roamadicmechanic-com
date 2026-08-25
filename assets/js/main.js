// Roamadic Mechanic — small progressive enhancements
(function () {
  var yearEl = document.getElementById('year');
  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }

  var inspectionBookingUrl = 'https://calendar.app.google/qG533FuFE7YUvCbU6';

  // The public Google appointment schedule above is specifically for
  // pre-purchase inspections. Do not send every customer directly there.
  document.querySelectorAll('a[href="' + inspectionBookingUrl + '"]').forEach(function (link) {
    link.setAttribute('href', '#booking');
    link.removeAttribute('target');
    link.removeAttribute('rel');
  });

  var bookingCta = document.querySelector('#booking .contact-cta');
  if (bookingCta) {
    bookingCta.innerHTML = [
      '<div class="services-grid booking-choices">',
        '<div class="service-card">',
          '<h3>Service / Repair Request</h3>',
          '<p>For diagnostics, maintenance, repairs, batteries, warning lights, noises, leaks, or anything else you need looked at.</p>',
          '<a class="btn btn-primary" href="mailto:robert@roamadicmechanic.com?subject=Service%20%2F%20Repair%20Request&amp;body=Name%3A%0APhone%3A%0AService%20location%3A%0AYear%20%2F%20Make%20%2F%20Model%3A%0AVIN%20(optional)%3A%0AWhat%20do%20you%20need%20help%20with%3F%0APreferred%20day%20%2F%20time%3A%0APhotos%20or%20other%20details%3A">Describe What You Need</a>',
        '</div>',
        '<div class="service-card">',
          '<h3>Pre-Purchase Inspection</h3>',
          '<p>Buying a vehicle? Use the dedicated inspection calendar to choose an available 90-minute appointment.</p>',
          '<a class="btn btn-primary" href="' + inspectionBookingUrl + '" target="_blank" rel="noopener">Book Inspection</a>',
        '</div>',
      '</div>',
      '<p class="services-note">For service requests, include the vehicle, service location, what it is doing or what work you need, and your preferred day or time. VIN and photos are optional.</p>'
    ].join('');
  }
})();
