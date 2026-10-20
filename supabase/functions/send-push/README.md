# send-push

Web Push notifications without Firebase (VAPID keys + the `web-push` library).

## One-time setup

1. Run `supabase/push_subscriptions.sql` in the SQL Editor.
2. Generate a VAPID key pair (keep the private key secret — never commit it):
   ```
   npx web-push generate-vapid-keys
   ```
3. Put the **public** key in `.env` as `VITE_VAPID_PUBLIC_KEY`.
4. Store the keys as function secrets:
   ```
   supabase secrets set VAPID_PUBLIC_KEY=... VAPID_PRIVATE_KEY=... VAPID_SUBJECT=mailto:you@example.com
   ```
   `VAPID_SUBJECT` is a contact for the push services (a `mailto:` or the site's `https://` URL).
5. Create the shared secret the database uses to call this function, and store it in both places:
   ```
   supabase secrets set PUSH_INTERNAL_SECRET=<random string>
   ```
   ```sql
   select vault.create_secret('<same random string>', 'push_internal_secret');
   ```
6. Deploy (no JWT gate — the database calls it with `x-push-secret` instead; user calls are checked in code):
   ```
   supabase functions deploy send-push --no-verify-jwt
   ```
7. Run `supabase/push_notifications.sql` (schedule reminders cron, message trigger, announcements).

Changing the VAPID keys invalidates every existing subscription — users have to turn notifications on again.

## Calling it

From the app (signed in): `supabase.functions.invoke("send-push", { body: { title, body, url } })` notifies the caller's own devices.
Admins can add `user_ids: [...]` to notify other users.

## Notes

- Push only works in a production build / deployed site (the service worker isn't registered by `vite dev`).
- iPhone/iPad: iOS 16.4+, and only after "Add to Home Screen".
