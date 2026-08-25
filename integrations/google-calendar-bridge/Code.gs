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
  var calendar = CalendarApp.getDefaultCalendar();
  var durationMs = positiveInt_(p.durationMinutes, 90) * 60000;
  var incrementMs = positiveInt_(p.slotIncrementMinutes, 30) * 60000;
  var bufferMs = Math.max(0, positiveInt_(p.bufferMinutes, 30)) * 60000;
  var start = new Date(p.windowStart);
  var end = new Date(p.windowEnd);
  var workStart = parseClock_(p.workdayStart || '09:00');
  var workEnd = parseClock_(p.workdayEnd || '18:00');
  var slots = [];
  var cursor = startOfLocalDay_(start);
  var lastDay = startOfLocalDay_(end);

  while (cursor.getTime() <= lastDay.getTime() && slots.length < 60) {
    var dayStart = atLocalClock_(cursor, workStart.h, workStart.m);
    var dayEnd = atLocalClock_(cursor, workEnd.h, workEnd.m);
    var effectiveStart = new Date(Math.max(dayStart.getTime(), start.getTime()));
    var candidate = ceilToIncrement_(effectiveStart, incrementMs);
    var events = calendar.getEvents(new Date(dayStart.getTime() - bufferMs), new Date(dayEnd.getTime() + bufferMs));
    var busy = events.map(function(ev) {
      return {
        start: ev.getStartTime().getTime() - bufferMs,
        end: ev.getEndTime().getTime() + bufferMs
      };
    });

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
    var calendar = CalendarApp.getDefaultCalendar();
    var start = new Date(p.start);
    var end = new Date(p.end);
    if (!isFinite(start.getTime()) || !isFinite(end.getTime()) || end <= start) return { ok: false, code: 'invalid_time' };

    var bufferMs = Math.max(0, positiveInt_(p.bufferMinutes, 30)) * 60000;
    var workStart = parseClock_(p.workdayStart || '09:00');
    var workEnd = parseClock_(p.workdayEnd || '18:00');
    var dayStart = atLocalClock_(startOfLocalDay_(start), workStart.h, workStart.m);
    var dayEnd = atLocalClock_(startOfLocalDay_(start), workEnd.h, workEnd.m);
    if (start.getTime() < dayStart.getTime() || end.getTime() > dayEnd.getTime()) return { ok: false, code: 'outside_workday' };

    var conflicts = calendar.getEvents(new Date(start.getTime() - bufferMs), new Date(end.getTime() + bufferMs));
    var overlap = conflicts.some(function(ev) {
      var s = ev.getStartTime().getTime() - bufferMs;
      var e = ev.getEndTime().getTime() + bufferMs;
      return start.getTime() < e && end.getTime() > s;
    });
    if (overlap) return { ok: false, code: 'slot_conflict' };

    var options = {
      description: String(p.description || '').slice(0, 8000),
      location: String(p.location || '').slice(0, 500),
      sendInvites: true
    };
    if (p.guestEmail) options.guests = String(p.guestEmail).trim();

    var event = calendar.createEvent(String(p.title || 'Roamadic Mechanic Service').slice(0, 200), start, end, options);
    return {
      ok: true,
      eventId: event.getId(),
      start: event.getStartTime().toISOString(),
      end: event.getEndTime().toISOString()
    };
  } finally {
    lock.releaseLock();
  }
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
