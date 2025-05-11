// components/TwitterEmbed.js
import React, { useEffect } from 'react';

const TwitterEmbed = ({ tweetUrl }) => {
  useEffect(() => {
    // Load Twitter's widgets.js script if it's not already loaded
    if (!window.twttr) {
      const script = document.createElement('script');
      script.src = 'https://platform.twitter.com/widgets.js';
      script.async = true;
      document.body.appendChild(script);

      return () => {
        document.body.removeChild(script);
      };
    } else {
      // If widgets.js is already loaded, re-render the tweet
      window.twttr.widgets.load();
    }
  }, []);

  return (
    <blockquote className="twitter-tweet">
      <a href={tweetUrl}>Loading tweet...</a>
    </blockquote>
  );
};

export default TwitterEmbed;
