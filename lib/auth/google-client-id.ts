/** Web client ID from Google Cloud Console (OAuth 2.0 Web application). */
export function getGoogleClientId(): string | undefined {
  const raw = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ?? "";
  const trimmed = raw.replace(/^["']|["']$/g, "").trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

export function isGoogleSignInEnabled(): boolean {
  return !!getGoogleClientId();
}
