import { auth } from "@/auth";
import AskClient from "./AskClient";

// Server wrapper: resolves the session so the client UI can gate the "Post to the
// feed" action behind sign-in. Posting is also auth-checked server-side in
// createThread (server actions are reachable by direct POST), so this is UX, not the
// security boundary.
export default async function AskPage() {
  const session = await auth();
  return <AskClient signedIn={!!session?.user} />;
}
