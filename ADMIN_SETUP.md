# Basic TCHA admin

These files add a small login and one museum announcement editor. The existing visitor experience remains in your original `App.tsx`.

## Add the files

Copy the supplied `src` files into the same locations in the repository. Copy `firestore.rules` and `firebase.json` into the repository root.

The repository already uses Firebase and keeps its dependencies in `pnpm-lock.yaml`.

## Run locally

```sh
pnpm install --frozen-lockfile
pnpm dev
```

Open the local site and add `/admin` to its URL.

## Enable admin access

1. In the Firebase Console for `tcha-bfc71`, enable **Authentication → Email/Password**.
2. Create a Firestore database if the project does not have one yet.
3. Create your staff account at `/admin`. Verify the email using the link from Firebase.
4. In Authentication → Users, copy the staff member's UID.
5. In Firestore, create document `admins/UID` with a Boolean field `active` set to `true`.
6. Sign in again. The admin page can now publish the museum announcement.

Only a project owner can approve admins. Admins cannot add or approve their own accounts.

Publish the Firestore rules with the Firebase CLI after signing in:

```sh
firebase login
firebase deploy --only firestore:rules --project tcha-bfc71
```

The included Firebase Hosting configuration serves the built site and routes `/admin` back to the app. Deploy the site when ready:

```sh
pnpm build
firebase deploy --only hosting --project tcha-bfc71
```
