# TCHA admin portal

This change extends the `database-dev` React/Vite application using its existing Firebase project. It does not modify the Figma Make file or deploy anything automatically.

## Included

- `/admin`: responsive staff login, invitation-based setup, password visibility toggle, password reset, and sign out.
- Admins choose a unique username, invited email, and a 12–128 character password. Login accepts username or email. Firebase Authentication manages password hashing and token renewal.
- Default sessions last for the browser session; “Keep me signed in” opts into persistent Firebase login.
- Protected editor for all ten events: title, date/year, introduction, and source credit. Publishing stores content in Firestore and updates visitor screens live.
- Revision checks prevent one editor from silently overwriting another editor's work. Unsaved edits prompt before leaving.
- Admin-only invitations are email-bound, expire after 48 hours, and are one-use. Only a hash of each code is stored. Invitations are shared manually; this change does not send invitation emails.
- No public admin enrollment or first-visitor bootstrap. The first invitation requires a trusted operator.
- Every privileged callable checks both the current Firebase Auth user/claims and the active admin profile. Firestore denies all direct client writes, including attempts to self-promote.
- The previous import-time test writes to the `users` collection have been removed.

Historical figures, activity questions, game logic, and chatbot responses are still maintained in source code. The editor changes event headings and introductions; it is not an editor for every activity. Bundled content remains available if live content cannot be loaded. Admin editing requires a connection.

## Prerequisites

Use Node **24.12 or newer** for the frontend because Firebase 13 requires it. Cloud Functions deploy to Node **22**, configured separately in `functions/package.json`.

You need deployment permissions on the Firebase project (currently `tcha-bfc71`), a Firestore database, and a billing plan that supports Cloud Functions. In Firebase Authentication, enable **Email/Password**, configure your site's authorized domains, and review the password-reset email template.

Install dependencies from the repository root:

```sh
npm ci
npm --prefix functions ci
```

Copy `.env.example` to `.env.local` and set the project's public Firebase web configuration. Leave `VITE_USE_FIREBASE_EMULATORS=false` for production. Never put Admin SDK credentials in a `VITE_` variable or commit a service-account key.

Copy `functions/.env.example` to `functions/.env.tcha-bfc71` and set `TCHA_WEB_API_KEY` to the **same Firebase web API key**. This value is public configuration, but the backend needs it to verify username/password login with Firebase. Configure other project IDs using the corresponding `.env.<project-id>` filename.

## Validate and deploy

Install the current Firebase CLI using the official npm package and authenticate with your project account.

```sh
npm run typecheck
npm test
npm run build
firebase deploy --project tcha-bfc71 --only functions:admin,firestore:rules
```

Review `firestore.rules` against any other collections added after this branch before deploying it. This branch previously had no tracked rules; the supplied rules intentionally deny access to unlisted collections.

The function runtime must be able to create Firebase Auth users, write Firestore documents, and sign custom tokens. If production custom-token signing reports a permission error, enable the IAM Service Account Credentials API and grant the runtime service account permission to sign tokens (typically Service Account Token Creator on the signing service account).

Build and host `dist/` using your project's normal hosting workflow. For Firebase Hosting, this repository includes an SPA rewrite so refreshing `/admin` works:

```sh
firebase deploy --project tcha-bfc71 --only hosting
```

The Figma Make preview is not a deployment target for the backend functions. Integrate these source changes into the repository and deploy Firebase separately.

## Bootstrap the first approved administrator

From a trusted operator machine, configure Google Application Default Credentials with access to your project. Do not share those credentials with the admin recipient.

PowerShell:

```powershell
$env:GOOGLE_CLOUD_PROJECT = 'tcha-bfc71'
$env:GCLOUD_PROJECT = 'tcha-bfc71'
npm --prefix functions run invite -- approved-admin@example.org
```

The command prints a private invitation code. Give that code to the named admin through your normal private channel. They open `/admin`, choose **Set up account**, and enter their invited email, username, code, and password. No initial production password is shipped in the source.

After setup, admins can create additional invitations in the dashboard. Creating an invitation does **not** send an email.

## Disable an administrator

Using a trusted backend/operator, set `admins/<uid>.active` to `false`, disable the Firebase Auth user, and revoke refresh tokens. The active-profile check immediately blocks callable edits and profile reads, and the UI signs the admin out when it observes the revoked profile. Do not delete invitation or username records indiscriminately.

If registration was interrupted by a process crash between Auth and Firestore, inspect the reserved `usedBy` UID, its Auth identity, `admins/<uid>`, and `adminUsernames/<username>`. Remove an incomplete identity before releasing its reservations and issuing a fresh invitation.

## Local emulator testing

Use a **demo project ID** so fixtures cannot touch production. Current Firebase CLI versions require Java 21 or later. The integration was also verified here with Firebase CLI 13.35.1 and Java 17.

Frontend `.env.local`:

```dotenv
VITE_FIREBASE_API_KEY=demo-key
VITE_FIREBASE_AUTH_DOMAIN=demo-tcha-admin.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=demo-tcha-admin
VITE_USE_FIREBASE_EMULATORS=true
```

Functions `functions/.env.local`:

```dotenv
TCHA_WEB_API_KEY=demo-key
```

Start emulators in one terminal, then the frontend in another:

```sh
firebase emulators:start --only auth,firestore,functions --project demo-tcha-admin
npm run dev
```

Run the opt-in integration test in PowerShell:

```powershell
$env:GCLOUD_PROJECT = 'demo-tcha-admin'
$env:FIRESTORE_EMULATOR_HOST = '127.0.0.1:8080'
$env:FIREBASE_AUTH_EMULATOR_HOST = '127.0.0.1:9099'
$env:RUN_FIREBASE_EMULATOR_TESTS = 'true'
node --test functions/test/emulator.test.mjs
```

The integration test creates disposable accounts and event content in the demo emulator. It checks invitation redemption, username/email login, rejection of non-admin accounts, publishing, revision conflicts, private collection rules, direct-write denial, and immediate role deactivation. No real email is sent. Normal `npm test` runs nine isolated service tests and skips this emulator test unless explicitly enabled.

For local UI testing, create an emulator-only initial invitation with the bootstrap command after setting the emulator variables, then set up an account in the portal. Remove or replace the demo environment files before a production build. Local environment files, emulator data, logs, credentials, and dependencies are excluded from Git/source deliverables.
