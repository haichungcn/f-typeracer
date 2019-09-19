import React from "react";

const Footer = () => {
  return (
    <div className="footer">
      Source code available on{" "}
      <a
        target="_blank"
        rel="noopener noreferrer"
        href="https://github.com/sinapinto/react-typing-test"
      >
        Github
      </a>
      . Colorscheme used is{" "}
      <a
        target="_blank"
        rel="noopener noreferrer"
        href="https://github.com/morhetz/gruvbox"
      >
        Gruvbox
      </a>
      . Retouch by{" "}
      <a
        target="_blank"
        rel="noopener noreferrer"
        href="https://github.com/kyakaze/react_typing_test_retouch"
      >
        {" "}
        kyakaze :){" "}
      </a>
    </div>
  );
}

export default Footer;
