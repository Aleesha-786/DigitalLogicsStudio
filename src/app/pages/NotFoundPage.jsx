import React from "react";
import { Link } from "react-router-dom";
import "./NotFoundPage.css";

const NotFoundPage = () => (
  <main className="not-found-page">
    <section className="not-found-card">
      <p className="not-found-eyebrow">Page Not Found</p>
      <h1>This learning path doesn&apos;t exist yet.</h1>
      <p className="not-found-copy">
        Return to the core digital logic topics, open the problem library, or
        continue with one of Boolforge&apos;s interactive tools.
      </p>
      <div className="not-found-actions">
        <Link to="/" className="not-found-link not-found-link--primary">
          Explore Topics
        </Link>
        <Link to="/problems" className="not-found-link">
          Open Problems
        </Link>
      </div>
    </section>
  </main>
);

export default NotFoundPage;
