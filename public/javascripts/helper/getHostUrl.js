function getUrl() {
  // Get the current hostname
  const hostname = window.location.hostname;
  const localHost = 'http://localhost:3000/api'
  const heroku = 'https://klu-portfolio-server-5858060573f4.herokuapp.com/api'

  // Check if the hostname is 'localhost'
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return localHost
  } else {
    return heroku
  }
}

export default getUrl