
const youtubeEmbed = require('youtube-embed')
export default function youtubeEmbedConverter(url) {
  if (url.includes('embed')) {
    return url
  }
  return youtubeEmbed(url)
}
