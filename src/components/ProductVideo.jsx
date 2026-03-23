import { getVideoEmbed } from "../lib/media";

export default function ProductVideo({ videoUrl, productName }) {
  const embed = getVideoEmbed(videoUrl);

  if (!embed) {
    return (
      <div className="card-surface p-6 text-sm text-slate-600">
        No product video uploaded yet.
      </div>
    );
  }

  if (embed.type === "iframe") {
    return (
      <div className="card-surface overflow-hidden p-0">
        <div className="aspect-video w-full bg-slate-950">
          <iframe
            src={embed.url}
            title={`${productName} video`}
            className="h-full w-full"
            loading="lazy"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      </div>
    );
  }

  return (
    <div className="card-surface overflow-hidden p-0">
      <video
        className="aspect-video w-full bg-slate-950 object-cover"
        src={embed.url}
        controls
        preload="metadata"
      />
    </div>
  );
}
