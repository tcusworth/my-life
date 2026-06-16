export interface MicrosoftCalendar {
  id: string;
  name: string;
  hexColor: string;
}

export interface MicrosoftEvent {
  id: string;
  subject?: string;
  bodyPreview?: string;
  location?: { displayName?: string };
  start: { dateTime: string; timeZone: string };
  end: { dateTime: string; timeZone: string };
  isAllDay?: boolean;
}

export async function fetchMicrosoftCalendars(
  accessToken: string
): Promise<MicrosoftCalendar[]> {
  const res = await fetch("https://graph.microsoft.com/v1.0/me/calendars", {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Microsoft calendar list failed: ${err}`);
  }

  const data = await res.json();
  return (data.value ?? []) as MicrosoftCalendar[];
}

export async function fetchMicrosoftEvents(
  accessToken: string,
  calendarId: string,
  startDateTime: string,
  endDateTime: string
): Promise<MicrosoftEvent[]> {
  const params = new URLSearchParams({ startDateTime, endDateTime });
  const url = `https://graph.microsoft.com/v1.0/me/calendars/${encodeURIComponent(calendarId)}/calendarView?${params}`;

  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Prefer: 'outlook.timezone="UTC"',
    },
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Microsoft events fetch failed for ${calendarId}: ${err}`);
  }

  const data = await res.json();
  return (data.value ?? []) as MicrosoftEvent[];
}
