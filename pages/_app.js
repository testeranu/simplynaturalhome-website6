import axios from 'axios';
import App from 'next/app';
import Head from 'next/head';
import Link from 'next/link';
import '../styles/globals.css';
import config from '../config';

const Header = ({ siteName, menuItems }) => (
  <header className="app-header">
    <h1><a href="/">{siteName}</a></h1>
    <nav>
      {Object.entries(menuItems).map(([name, url]) => (
        <Link href={url} key={name}>
          <a className="nav-link">{name}</a>
        </Link>
      ))}
    </nav>
  </header>
);

const Footer = ({ siteName }) => (
  <footer className="app-footer">
    <div className="SiteMap">
      <p><a href='/sitemap'>sitemap</a></p>
    </div>
    <p>Copyright © {new Date().getFullYear()} {siteName}. All rights reserved.</p>
  </footer>
);

class MyApp extends App {
  static async getInitialProps(appContext) {
    const appProps = await App.getInitialProps(appContext);
    
    let domainStyles = '';
    let siteName = 'Default Site Name';
    let menuItems = {};

    try {

// Fetch styles filtered by domain
const styleResponse = await axios.get(`${process.env.STRAPI_STYLING}?filters[domain][$eq]=${config.HARDCODED_DOMAIN}`, {
  headers: { Authorization: `Bearer ${config.API_TOKEN}` }
});

const styles = styleResponse.data.data[0]?.attributes?.style || {};
      domainStyles = Object.entries(styles).reduce((acc, [key, value]) => {
        return `${acc}${key} { ${Object.entries(value).map(([prop, val]) => `${prop}: ${val};`).join(' ')} } `;
      }, '');

      const articleResponse = await axios.get(config.API_URL, {
        headers: {
          Authorization: `Bearer ${config.API_TOKEN}`
        }
      });
      const homeArticle = articleResponse.data.data.find(
        article => 
          article.attributes.Domain === config.HARDCODED_DOMAIN &&
          article.attributes.urlSlug === '/'
      );
      if (homeArticle && homeArticle.attributes.SiteName) {
        siteName = homeArticle.attributes.SiteName;
      }

      const menuResponse = await axios.get(`${process.env.STRAPI_MENU}/api/menu2s?filters[domain][$eq]=${config.HARDCODED_DOMAIN}`, {
  headers: { Authorization: `Bearer ${config.API_TOKEN}` }
});
        headers: {
          Authorization: `Bearer ${config.API_TOKEN}`
        }
      });


const menuData = menuResponse.data.data[0]?.attributes || {};
const menuItems = {
  [menuData.link1anchor]: menuData.link1url,
  [menuData.link2anchor]: menuData.link2url,
  [menuData.link3anchor]: menuData.link3url
};

    } catch (error) {
      console.error("Failed to fetch data:", error);
    }
    
    return { ...appProps, domainStyles, siteName, menuItems };
  }

  render() {
    const { Component, pageProps, domainStyles, siteName, menuItems } = this.props;
    return (
      <>
        <Head>
          <style>{domainStyles}</style>
        </Head>
        <Header siteName={siteName} menuItems={menuItems} />
        <main style={{ paddingBottom: '120px' }}>
          <Component {...pageProps} />
        </main>
        <Footer siteName={siteName} />
      </>
    );
  }
}

export default MyApp;




