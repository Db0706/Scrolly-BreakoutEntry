import axios from 'axios';
import oauth1a from 'oauth-1.0a';
import crypto from 'crypto';

// Generate the OAuth signature
const oauth = new oauth1a({
    consumer: { key: process.env.TWITTER_API_KEY, secret: process.env.TWITTER_API_SECRET_KEY },
    signature_method: 'HMAC-SHA1',
    hash_function: (baseString, key) => crypto.createHmac('sha1', key).update(baseString).digest('base64'),
});

// Helper function to get OAuth header for each request
const getOAuthHeader = (url, method, token = {}) => {
  const request_data = {
    url,
    method,
  };

  const headers = oauth.toHeader(oauth.authorize(request_data, { key: process.env.TWITTER_ACCESS_TOKEN, secret: process.env.TWITTER_ACCESS_TOKEN_SECRET }));
  return headers.Authorization;
};

// Function to upload media to Twitter
export const uploadMedia = async (imageData) => {
  const url = 'https://upload.twitter.com/1.1/media/upload.json';

  const formData = new FormData();
  formData.append('media', imageData); // Append the base64-encoded image data

  const headers = {
    Authorization: getOAuthHeader(url, 'POST'),
    // In the browser, FormData headers are automatically managed.
  };

  try {
    const response = await axios.post(url, formData, { headers });
    return response.data.media_id_string; // Returns media ID
  } catch (error) {
    console.error('Error uploading media:', error.response ? error.response.data : error.message);
    throw error;
  }
};

// Function to post a tweet with media
export const postTweetWithMedia = async (status, mediaId) => {
  const url = 'https://api.twitter.com/1.1/statuses/update.json';

  const params = {
    status, // Tweet text
    media_ids: mediaId, // Attach media using the media ID
  };

  const headers = {
    Authorization: getOAuthHeader(url, 'POST'),
  };

  try {
    const response = await axios.post(url, params, { headers });
    return response.data;
  } catch (error) {
    console.error('Error posting tweet:', error.response ? error.response.data : error.message);
    throw error;
  }
};

// Function to tweet an image with the given status
export const tweetImage = async (status, imageBase64) => {
  try {
    const mediaId = await uploadMedia(imageBase64);
    const tweetResponse = await postTweetWithMedia(status, mediaId);
    return tweetResponse;
  } catch (error) {
    console.error('Error tweeting image:', error);
    throw error;
  }
};
