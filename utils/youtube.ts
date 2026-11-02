// Accepts a bare video ID or any common YouTube link and returns just the 11-character ID.
export const getYouTubeId = (value?: string): string | null => {
  const input = (value || '').trim();
  if (/^[\w-]{11}$/.test(input)) return input;
  const match = input.match(/(?:youtu\.be\/|[?&]v=|\/(?:embed|shorts|live)\/)([\w-]{11})(?![\w-])/);
  return match ? match[1] : null;
};
