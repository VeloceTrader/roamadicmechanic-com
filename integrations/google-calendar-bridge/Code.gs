var SCRIPT_TZ = 'America/Los_Angeles';

function doGet() {
  return json_({ ok: true, service: 'Roamadic Mechanic calendar bridge' });
}

function doPost(e) {
  try {
    var body = JSON.parse((e && e.postData && e.postData.contents) || '{}');
    var expected = PropertiesService.getScriptProperties().getProperty('ROAMADIC_SHARED_SECRET');
    if (!expected || body.secret !== expected) return json_({ ok: false, code: 'unauthorized' });

    if (body.action === 'slots') return json_(findSlots_(body));
    if (body.action === 'book') return json_(book_(body));
    return json_({ ok: false, code: 'unknown_action' });
  } catch (err) {
    return json_({ ok: false, code: 'bridge_error', message: String(err && err.message || err) });
  }
}

function findSlots_(p) {
  var durationMs = positiveInt_(p.durationMinutes, 90) * 60000;
  var incrementMs = positiveInt_(p.slotIncrementMinutes, 30) * 60000;
  var bufferMs = Math.max(0, positiveInt_(p.bufferMinutes, 30)) * 60000;
  var start = new Date(p.windowStart);
  var end = new Date(p.windowEnd);
  var workStart = parseClock_(p.workdayStart || '09:00');
  var workEnd = parseClock_(p.workdayEnd || '18:00');
  var busy = readBusy_(new Date(start.getTime() - bufferMs), new Date(end.getTime() + bufferMs), bufferMs);
  var slots = [];
  var cursor = startOfLocalDay_(start);
  var lastDay = startOfLocalDay_(end);

  while (cursor.getTime() <= lastDay.getTime() && slots.length < 60) {
    var dayStart = atLocalClock_(cursor, workStart.h, workStart.m);
    var dayEnd = atLocalClock_(cursor, workEnd.h, workEnd.m);
    var effectiveStart = new Date(Math.max(dayStart.getTime(), start.getTime()));
    var candidate = ceilToIncrement_(effectiveStart, incrementMs);

    while (candidate.getTime() + durationMs <= dayEnd.getTime() && candidate.getTime() < end.getTime() && slots.length < 60) {
      var cStart = candidate.getTime();
      var cEnd = cStart + durationMs;
      var conflict = busy.some(function(b) { return cStart < b.end && cEnd > b.start; });
      if (!conflict) {
        slots.push({
          start: new Date(cStart).toISOString(),
          end: new Date(cEnd).toISOString(),
          label: Utilities.formatDate(new Date(cStart), SCRIPT_TZ, 'EEE MMM d, h:mm a')
        });
      }
      candidate = new Date(candidate.getTime() + incrementMs);
    }
    cursor = addLocalDays_(cursor, 1);
  }

  return { ok: true, slots: slots };
}

function book_(p) {
  var lock = LockService.getScriptLock();
  if (!lock.tryLock(15000)) return { ok: false, code: 'calendar_busy' };

  try {
    var start = new Date(p.start);
    var end = new Date(p.end);
    if (!isFinite(start.getTime()) || !isFinite(end.getTime()) || end <= start) return { ok: false, code: 'invalid_time' };

    var bufferMs = Math.max(0, positiveInt_(p.bufferMinutes, 30)) * 60000;
    var workStart = parseClock_(p.workdayStart || '09:00');
    var workEnd = parseClock_(p.workdayEnd || '18:00');
    var localDay = startOfLocalDay_(start);
    var dayStart = atLocalClock_(localDay, workStart.h, workStart.m);
    var dayEnd = atLocalClock_(localDay, workEnd.h, workEnd.m);
    if (start.getTime() < dayStart.getTime() || end.getTime() > dayEnd.getTime()) return { ok: false, code: 'outside_workday' };

    var busy = readBusy_(new Date(start.getTime() - bufferMs), new Date(end.getTime() + bufferMs), bufferMs);
    var overlap = busy.some(function(b) { return start.getTime() < b.end && end.getTime() > b.start; });
    if (overlap) return { ok: false, code: 'slot_conflict' };

    var event = {
      summary: String(p.title || 'Roamadic Mechanic Service').slice(0, 200),
      description: String(p.description || '').slice(0, 8000),
      location: String(p.location || '').slice(0, 500),
      start: { dateTime: start.toISOString(), timeZone: SCRIPT_TZ },
      end: { dateTime: end.toISOString(), timeZone: SCRIPT_TZ }
    };
    if (p.guestEmail) event.attendees = [{ email: String(p.guestEmail).trim() }];

    var created = Calendar.Events.insert(event, 'primary', { sendUpdates: 'all' });
    return {
      ok: true,
      eventId: created.id,
      eventUrl: created.htmlLink || null,
      start: created.start && created.start.dateTime ? created.start.dateTime : start.toISOString(),
      end: created.end && created.end.dateTime ? created.end.dateTime : end.toISOString()
    };
  } finally {
    lock.releaseLock();
  }
}

function readBusy_(start, end, bufferMs) {
  var response = Calendar.Freebusy.query({
    timeMin: start.toISOString(),
    timeMax: end.toISOString(),
    timeZone: SCRIPT_TZ,
    items: [{ id: 'primary' }]
  });
  var blocks = (((response || {}).calendars || {}).primary || {}).busy || [];
  return blocks.map(function(b) {
    return {
      start: new Date(b.start).getTime() - bufferMs,
      end: new Date(b.end).getTime() + bufferMs
    };
  });
}

function parseClock_(value) {
  var parts = String(value || '09:00').split(':');
  return { h: Number(parts[0]) || 0, m: Number(parts[1]) || 0 };
}

function startOfLocalDay_(d) {
  var y = Number(Utilities.formatDate(d, SCRIPT_TZ, 'yyyy'));
  var m = Number(Utilities.formatDate(d, SCRIPT_TZ, 'M')) - 1;
  var day = Number(Utilities.formatDate(d, SCRIPT_TZ, 'd'));
  return new Date(y, m, day, 0, 0, 0, 0);
}

function atLocalClock_(d, h, m) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate(), h, m, 0, 0);
}

function addLocalDays_(d, n) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate() + n, 0, 0, 0, 0);
}

function ceilToIncrement_(d, incrementMs) {
  return new Date(Math.ceil(d.getTime() / incrementMs) * incrementMs);
}

function positiveInt_(v, fallback) {
  var n = Number(v);
  return isFinite(n) && n >= 0 ? Math.floor(n) : fallback;
}

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
