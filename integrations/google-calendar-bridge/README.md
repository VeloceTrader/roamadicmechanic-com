# Roamadic Mechanic Google Calendar bridge

This Apps Script web app is the private bridge between the public booking page and the Roamadic Mechanic Google Calendar.

It supports two server-to-server actions:

- `slots`: returns start times where the requested job duration fits inside the configured workday without colliding with existing primary-calendar events. Existing events are expanded by the configured buffer time.
- `book`: locks the calendar, rechecks the requested block, and creates the exact-duration Google Calendar event with the customer as a guest.

## Deployment

1. Create a standalone Google Apps Script project while signed into the Roamadic Mechanic Google account.
2. Copy `Code.gs` into the project and set the project time zone to `America/Los_Angeles` (the included `appsscript.json` contains the same setting).
3. In **Project Settings > Script properties**, add `ROAMADIC_SHARED_SECRET` using the private bridge secret stored in the Supabase `scheduling_integrations` record. Do not put that secret in this repository or browser code.
4. Deploy the script as a **Web app**, executing as the Roamadic Mechanic account, with access allowed to anyone who can reach the web app. The shared secret is what authorizes requests.
5. Put the deployed `/exec` web-app URL into `scheduling_integrations.bridge_url` and set `enabled=true`.

Once enabled, the website booking flow uses the Supabase `booking-scheduler` Edge Function to calculate the job duration, obtain variable-length available blocks from this bridge, and create the final Google Calendar event.
