
const youtubeEmbed = require('youtube-embed')

export default function youtubeEmbedConverter(url, autoplay = true, loop = true) {
  if (!url.includes('youtube')) return url
  if (url.includes('embed')) return url

  // youtube embed url
  let embedUrl = youtubeEmbed(url)
  const videoId = embedUrl.split('/').pop()

  embedUrl = youtubeEmbed(url) + '?'
  if (autoplay) embedUrl += 'autoplay=1&mute=1&'
  if (loop) embedUrl += `loop=1&playlist=${videoId}`
  return embedUrl
}
