// YouTube and Video Helper Utility for Physics LMS

/**
 * Extracts a YouTube 11-character video ID from any valid YouTube URL format:
 * - https://www.youtube.com/watch?v=VIDEO_ID
 * - https://youtube.com/watch?feature=shared&v=VIDEO_ID
 * - https://youtu.be/VIDEO_ID
 * - https://www.youtube.com/shorts/VIDEO_ID
 * - https://www.youtube.com/live/VIDEO_ID
 * - https://www.youtube.com/embed/VIDEO_ID
 * - Raw 11-character video ID
 */
export const extractYouTubeId = (inputUrl) => {
  if (!inputUrl || typeof inputUrl !== "string") return null;
  const url = inputUrl.trim();

  // If user pasted raw 11-character video ID
  if (/^[a-zA-Z0-9_-]{11}$/.test(url)) {
    return url;
  }

  // Regex matching standard YouTube domains, shorts, embed, and youtu.be
  const regExp = /(?:youtube(?:-nocookie)?\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?|shorts|live)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/i;
  const match = url.match(regExp);
  if (match && match[1]) {
    return match[1];
  }

  // Fallback query parameter parsing
  try {
    const parsed = new URL(url.startsWith("http") ? url : `https://${url}`);
    if (parsed.hostname.includes("youtube.com")) {
      const v = parsed.searchParams.get("v");
      if (v && /^[a-zA-Z0-9_-]{11}$/.test(v)) {
        return v;
      }
    }
  } catch (e) {
    // Malformed URL check
  }

  return null;
};

/**
 * Generates the clean, embeddable iframe URL with privacy-enhanced and security flags
 */
export const getYouTubeEmbedUrl = (inputUrl) => {
  const videoId = extractYouTubeId(inputUrl);
  if (!videoId) return null;
  return `https://www.youtube-nocookie.com/embed/${videoId}?rel=0&modestbranding=1&enablejsapi=1`;
};

/**
 * Generates the canonical direct YouTube watch URL for external fallback
 */
export const getCanonicalWatchUrl = (inputUrl) => {
  const videoId = extractYouTubeId(inputUrl);
  if (videoId) {
    return `https://www.youtube.com/watch?v=${videoId}`;
  }
  return inputUrl;
};
