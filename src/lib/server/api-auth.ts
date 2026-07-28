export function unauthenticatedResponse(
  user: { id: string } | null | undefined,
  message: string
): Response | null {
  return user ? null : Response.json({ error: message }, { status: 401 });
}
