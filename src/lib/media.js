export function normalizeUrlList(value) {
  if (Array.isArray(value)) {
    return value
      .map((entry) => String(entry || "").trim())
      .filter(Boolean);
  }

  return String(value || "")
    .split(/\r?\n|,/)
    .map((entry) => entry.trim())
    .filter(Boolean);
}

export function uniqueUrls(list) {
  return Array.from(new Set(normalizeUrlList(list)));
}

export function classifyMediaFiles(files) {
  const images = [];
  const videos = [];

  for (const file of files) {
    if (file.type.startsWith("video/")) {
      videos.push(file);
      continue;
    }

    images.push(file);
  }

  return { images, videos };
}

export function getYouTubeEmbedUrl(url) {
  const value = String(url || "").trim();
  if (!value) {
    return "";
  }

  try {
    const parsed = new URL(value);

    if (parsed.hostname.includes("youtube.com")) {
      const videoId = parsed.searchParams.get("v");
      if (videoId) {
        return `https://www.youtube.com/embed/${videoId}`;
      }
    }

    if (parsed.hostname.includes("youtu.be")) {
      const videoId = parsed.pathname.replace("/", "");
      if (videoId) {
        return `https://www.youtube.com/embed/${videoId}`;
      }
    }
  } catch {
    return "";
  }

  return "";
}

export function getVimeoEmbedUrl(url) {
  const value = String(url || "").trim();
  if (!value) {
    return "";
  }

  try {
    const parsed = new URL(value);
    if (!parsed.hostname.includes("vimeo.com")) {
      return "";
    }

    const id = parsed.pathname
      .split("/")
      .filter(Boolean)
      .at(-1);

    if (!id) {
      return "";
    }

    return `https://player.vimeo.com/video/${id}`;
  } catch {
    return "";
  }
}

export function getVideoEmbed(url) {
  const youTube = getYouTubeEmbedUrl(url);
  if (youTube) {
    return { type: "iframe", url: youTube };
  }

  const vimeo = getVimeoEmbedUrl(url);
  if (vimeo) {
    return { type: "iframe", url: vimeo };
  }

  if (String(url || "").trim()) {
    return { type: "video", url };
  }

  return null;
}
