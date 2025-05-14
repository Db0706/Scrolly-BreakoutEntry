// components/TwitterEmbed.jsx
import React, { useEffect, useRef } from "react";

const TwitterEmbed = ({ tweetUrl }) => {
  const blockquoteRef = useRef(null);

  useEffect(() => {
    // Helper to (re)render widgets
    const render = () => {
      if (window.twttr && window.twttr.widgets && blockquoteRef.current) {
        window.twttr.widgets.load(blockquoteRef.current);
      }
    };

    // If Twitter script already present, just render
    if (window.twttr && window.twttr.widgets) {
      render();
      return;
    }

    // Otherwise inject script
    const script = document.createElement("script");
    script.src = "https://platform.twitter.com/widgets.js";
    script.async = true;
    script.onload = render;
    document.body.appendChild(script);

    return () => {
      // we leave the script in place (other embeds may need it),
      // but you can clean-up listeners if you attach any
    };
  }, [tweetUrl]);

  return (
    <div ref={blockquoteRef}>
      <blockquote className="twitter-tweet">
        <p lang="en" dir="ltr">
          Meet Scrolly, your playable social feed 📱<br />
          <br />
          Say goodbye to mind numbing scrolling across social media and hello
          to endless fun, while building your fully on-chain social profile! 🤯🎮{" "}
          <a href="https://t.co/glNq5YKApH">pic.twitter.com/glNq5YKApH</a>
        </p>
        &mdash; DD Gaming 🎮 (@DDGamingLabs){" "}
        <a
          href={tweetUrl}
          rel="noopener noreferrer"
          target="_blank"
        >
          May 13, 2025
        </a>
      </blockquote>
    </div>
  );
};

export default TwitterEmbed;
