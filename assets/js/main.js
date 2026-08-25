// Roamadic Mechanic — small progressive enhancements
(function () {
  var yearEl = document.getElementById('year');
  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }

  var oldGoogleBookingUrl = 'https://calendar.app.google/qG533FuFE7YUvCbU6';
  var serviceIntakeUrl = '/schedule/';

  // Every public booking entry point goes through the service/vehicle intake
  // before the customer reaches the live Google appointment slot picker.
  document.querySelectorAll('a[href="' + oldGoogleBookingUrl + '"]').forEach(function (link) {
    link.setAttribute('href', serviceIntakeUrl);
    link.removeAttribute('target');
    link.removeAttribute('rel');
  });

  var bookingCta = document.querySelector('#booking .contact-cta');
  if (bookingCta) {
    bookingCta.innerHTML = [
      '<a class="btn btn-primary" href="' + serviceIntakeUrl + '">Schedule Mobile Service</a>',
      '<p>Select the service, enter the vehicle and job details, review what Roamadic Mechanic will see, then choose an available appointment time.</p>'
    ].join('');
  }
})();
