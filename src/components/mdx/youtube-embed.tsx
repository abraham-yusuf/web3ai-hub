interface YoutubeEmbedProps {
  id: string
  title?: string
}

export function YoutubeEmbed({ id, title = "YouTube video player" }: YoutubeEmbedProps) {
  return (
    <div className="my-6 aspect-video overflow-hidden rounded-lg border">
      <iframe
        width="100%"
        height="100%"
        src={`https://www.youtube.com/embed/${id}`}
        title={title}
        frameBorder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen
      ></iframe>
    </div>
  )
}
