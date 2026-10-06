import React from "react";
import katex from "katex";
import "katex/dist/katex.min.css";

const Tex = ({ children }) => (
  <span
    className="law-tex"
    dangerouslySetInnerHTML={{
      __html: katex.renderToString(children, { throwOnError: false }),
    }}
  />
);

export default Tex;
