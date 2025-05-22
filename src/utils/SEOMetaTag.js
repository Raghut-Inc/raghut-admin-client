import React from "react";
import { Helmet } from "react-helmet-async";

const SEOMetaTag = (props) => {
  return (
    <Helmet>
      <title>{props.title}</title>
      <meta name="description" content={props.description} />
      <meta name="keywords" content={props.keywords} />
      <meta property="og:type" content="website" />
      <meta property="og:title" content={props.title} />
      <meta property="og:site_name" content="Raghut" /> {/* Changed to static site name */}
      <meta property="og:description" content={props.description} />
      <meta property="og:image" content={props.imgsrc || ""} />
      <meta property="og:url" content={props.url || "https://www.raghut.com"} /> {/* Fallback URL */}
      <meta name="twitter:card" content="summary_large_image" /> {/* Added this meta tag */}
      <meta name="twitter:title" content={props.title} />
      <meta name="twitter:description" content={props.description} />
      <meta name="twitter:image" content={props.imgsrc || ""} />
      <link rel="canonical" href={props.url || "https://www.raghut.com"} /> {/* Fallback URL */}
    </Helmet>
  );
};

export default SEOMetaTag;
