import React from 'react';
import Navbar from '../../shared/components/navbar';
import Footer from '../../shared/components/Footer';
import { useTheme } from '../../shared/context/ThemeContext';
import './Book.css';

/**
 * Shared page shell for every "book" chapter page.
 *
 * `data-theme={theme}` is what actually drives the [data-theme="light"]
 * rules in styles.css — the `theme-${theme}` className is kept too, for
 * any legacy selectors (e.g. in Boolforge.css) that still key off it.
 */
const BookPageLayout = ({ children }) => {
  const { theme, toggle: toggleTheme } = useTheme();

  return (
    <div className={`boolforge-page theme-${theme}`} data-theme={theme}>
      <div className="grid-background" />
      <Navbar toggleTheme={toggleTheme} theme={theme} />
      <main className="boolforge-main">{children}</main>
      <Footer />
    </div>
  );
};

export default BookPageLayout;
