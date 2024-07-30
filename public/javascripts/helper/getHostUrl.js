function getUrl(path = '') {
  // Get the current hostname
  const hostname = window.location.hostname;
  const localHost = 'http://localhost:3000'
  const heroku = 'https://klu-portfolio-server-5858060573f4.herokuapp.com'

  // Check if the hostname is 'localhost'
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return localHost + path
  } else {
    return heroku + path
  }
}

export default getUrl