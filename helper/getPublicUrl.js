function getPublicUrl(key) {
  //https://klu0926-public.s3.ap-southeast-2.amazonaws.com/portfolio/Bots/1.png
  return process.env.AWS_PUBLIC_BUCKET_URL + '/' + key
}

module.exports = getPublicUrl