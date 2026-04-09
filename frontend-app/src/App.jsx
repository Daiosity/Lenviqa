import { useEffect, useMemo, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  fetchMenus,
  fetchPages,
  fetchPosts,
  fetchPreviewContent,
  fetchSiteConfig,
  getCachedBootData,
  getCachedResolvedRoute,
  resolveContent
} from "./lib/api";
import { BlockContent } from "./blocks/BlockRenderer";

const SITE_TITLE = "Lenviqa";
const SITE_TAGLINE = "Connect WordPress to modern frontends.";

const STARTER_HOME = {
  eyebrow: "Headless-ready WordPress",
  title: "Same WordPress content. Better frontend.",
  intro:
    "Lenviqa keeps WordPress as the CMS while React handles the public presentation layer. The starter frontend resolves WordPress routes, supports preview flow, and gives you a cleaner foundation to build on.",
  note:
    "Use this starter as a reusable base. WordPress still manages content, menus, and editorial workflows.",
  capabilityCards: [
    {
      label: "Route truth",
      value: "Resolved by the plugin",
      copy: "The frontend asks Lenviqa what a path means instead of guessing WordPress routing."
    },
    {
      label: "Preview flow",
      value: "Editor-safe by default",
      copy: "Signed preview tokens keep draft previews working without breaking normal editorial flow."
    },
    {
      label: "Starter shell",
      value: "React + Vite",
      copy: "A practical frontend foundation that is ready for customization instead of a theme clone."
    }
  ],
  features: [
    {
      title: "Route resolution",
      copy: "Published pages, posts, archives, and previews are resolved through the plugin so React follows WordPress route truth."
    },
    {
      title: "Preview support",
      copy: "Editors can keep using WordPress preview while the frontend renders preview content through the bridge."
    },
    {
      title: "Safe public handoff",
      copy: "Redirect mode can hand public traffic to React without putting admin, login, REST, or preview behavior at risk."
    },
    {
      title: "Starter-ready rendering",
      copy: "The frontend handles normalized content, Gutenberg-aware block rendering, and HTML fallback for compatibility-heavy routes."
    }
  ],
  principles: [
    "WordPress stays the CMS",
    "The plugin owns bridge logic",
    "React owns the public experience",
    "Compatibility should not break editorial safety"
  ],
  workflow: [
    {
      step: "1",
      title: "WordPress owns content",
      copy: "Pages, posts, menus, previews, and permalink truth stay in WordPress."
    },
    {
      step: "2",
      title: "Lenviqa resolves routes",
      copy: "The plugin normalizes route data and preview payloads for the frontend."
    },
    {
      step: "3",
      title: "React presents the experience",
      copy: "The starter app renders the public UI while keeping the backend workflow familiar."
    }
  ]
};

function getSiteOrigin(siteHomeUrl) {
  try {
    return new URL(siteHomeUrl).origin;
  } catch (error) {
    return "";
  }
}

function getMenuLink(item, siteHomeUrl) {
  if (!item?.url) {
    return { href: "/", internal: true, target: "" };
  }

  try {
    const siteOrigin = getSiteOrigin(siteHomeUrl);
    const resolved = new URL(item.url, siteHomeUrl || window.location.origin);
    const internal =
      resolved.origin === window.location.origin ||
      (siteOrigin && resolved.origin === siteOrigin);

    return {
      href: internal ? `${resolved.pathname}${resolved.search}` || "/" : resolved.toString(),
      internal,
      target: item.target || ""
    };
  } catch (error) {
    return {
      href: item.url || "/",
      internal: false,
      target: item.target || ""
    };
  }
}

function getPreferredMenu(menus, preferredLocations = []) {
  const locations = menus?.locations || {};

  for (const location of preferredLocations) {
    if (locations[location]?.menu?.items?.length) {
      return locations[location].menu;
    }
  }

  const firstAssigned = Object.values(locations).find((entry) => entry?.menu?.items?.length);
  return firstAssigned ? firstAssigned.menu : null;
}

function isStarterPlaceholderContent(item) {
  if (!item) {
    return false;
  }

  const slug = String(item.slug || "").trim().toLowerCase();
  const title = String(item.title || "").trim().toLowerCase();

  return slug === "hello-world" || title === "hello world!" || title === "hello world";
}

function isUtilityPath(path = "") {
  return [
    "/cart",
    "/cart/",
    "/checkout",
    "/checkout/",
    "/checkout/confirmation",
    "/checkout/confirmation/",
    "/my-account",
    "/my-account/"
  ].includes(path);
}

function isUtilityPage(page) {
  const slug = page?.slug || "";
  const path = page?.path || "";

  return (
    ["cart", "checkout", "confirmation", "my-account", "checkout-2", "checkout-2-2"].includes(slug) ||
    isUtilityPath(path)
  );
}

function buildFallbackLinks(pages, posts) {
  const links = [{ id: "home", title: "Home", href: "/" }];

  pages
    .filter((page) => !isUtilityPage(page) && page.path !== "/")
    .slice(0, 4)
    .forEach((page) => {
      links.push({ id: `page-${page.id}`, title: page.title, href: page.path });
    });

  const hasRealPosts = posts.some((item) => !isStarterPlaceholderContent(item));

  if (hasRealPosts) {
    links.push({ id: "updates", title: "Updates", href: "/" });
  }

  return links.filter(
    (item, index, items) => items.findIndex((candidate) => candidate.href === item.href) === index
  );
}

function buildFeaturedPages(pages) {
  const preferred = ["test-page", "sample-page", "about", "blog", "updates"];
  const selected = [];

  preferred.forEach((slug) => {
    const page = pages.find((item) => item.slug === slug);

    if (page && !isUtilityPage(page) && !selected.some((item) => item.id === page.id)) {
      selected.push(page);
    }
  });

  pages.forEach((page) => {
    if (!selected.some((item) => item.id === page.id) && page.path !== "/" && !isUtilityPage(page)) {
      selected.push(page);
    }
  });

  return selected.slice(0, 4);
}

function describeRouteMode(site) {
  if (!site?.headless_mode) {
    return "WordPress safe mode";
  }

  return site.route_handling_mode === "redirect"
    ? "Redirect handoff enabled"
    : "WordPress safe mode";
}

function getWordPressOrigin(site) {
  const candidates = [site?.home_url, site?.url, site?.site_url];

  for (const candidate of candidates) {
    if (!candidate) {
      continue;
    }

    try {
      return new URL(candidate).origin;
    } catch (error) {
      // Ignore invalid values and keep trying.
    }
  }

  return window.location.origin;
}

function isHomeRoute(route) {
  if (!route) {
    return false;
  }

  if (route.route_type === "archive" && route.path === "/") {
    return true;
  }

  return (
    route.route_type === "singular" &&
    route.post_type === "page" &&
    (route.is_front_page || route.path === "/" || route.slug === "home")
  );
}

function routeMatchesPath(route, pathname) {
  if (!route) {
    return false;
  }

  if (route.path) {
    return route.path === pathname;
  }

  return route.route_type === "archive" && route.path === pathname;
}

function getDocumentTitle(route, pathname = "") {
  const normalizedPath = pathname.replace(/\/+$/, "") || "/";

  if (normalizedPath === "/") {
    return SITE_TITLE;
  }

  if (!route) {
    return SITE_TITLE;
  }

  if (isHomeRoute(route)) {
    return SITE_TITLE;
  }

  if (route.route_type === "singular" && route.title) {
    return `${route.title} | ${SITE_TITLE}`;
  }

  if (route.route_type === "archive") {
    const archiveTitle = route.title || route.label || "Archive";
    return `${archiveTitle} | ${SITE_TITLE}`;
  }

  return SITE_TITLE;
}

function getNavPresentation(item, siteHomeUrl) {
  const link = getMenuLink(item, siteHomeUrl);
  const path = link.internal ? link.href.split("?")[0] : "";

  if (isUtilityPath(path)) {
    return { hidden: true, title: item.title };
  }

  return { hidden: false, title: item.title };
}

function getPageSpotlightCopy(page) {
  const copyBySlug = {
    "test-page": "A sample Gutenberg-heavy route that is useful for checking how the starter translates WordPress content into React.",
    "sample-page": "A simple WordPress page rendered through the starter so you can see route resolution and content rendering in action.",
    about: "An example of a normal WordPress page presented through the Lenviqa frontend layer.",
    blog: "A publishing section that can grow from starter content into a proper archive or editorial area."
  };

  return (
    page.excerpt ||
    copyBySlug[page.slug] ||
    "This route is still managed in WordPress and rendered through the React starter."
  );
}

function LinkedChainIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" focusable="false">
      <path
        d="M10.6 13.4a4 4 0 0 0 5.66 0l2.12-2.12a4 4 0 1 0-5.66-5.66L11.5 6.84"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M13.4 10.6a4 4 0 0 0-5.66 0l-2.12 2.12a4 4 0 1 0 5.66 5.66l1.22-1.22"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function CartIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" focusable="false">
      <path
        d="M7 6h14l-1.6 7.2a2 2 0 0 1-2 1.6H10.2a2 2 0 0 1-2-1.5L6.2 4.8H3"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="10.4" cy="19" r="1.5" fill="currentColor" />
      <circle cx="17.2" cy="19" r="1.5" fill="currentColor" />
    </svg>
  );
}

function MenuAnchor({ item, siteHomeUrl, className = "nav-link" }) {
  const link = getMenuLink(item, siteHomeUrl);
  const presentation = getNavPresentation(item, siteHomeUrl);

  if (link.internal) {
    return (
      <Link className={className} to={link.href}>
        {presentation.title}
      </Link>
    );
  }

  return (
    <a
      className={className}
      href={link.href}
      target={link.target || "_self"}
      rel={link.target === "_blank" ? "noreferrer" : undefined}
    >
      {presentation.title}
    </a>
  );
}

function MenuItem({ item, siteHomeUrl }) {
  const presentation = getNavPresentation(item, siteHomeUrl);

  if (presentation.hidden) {
    return null;
  }

  const visibleChildren = (item.children || []).filter(
    (child) => !getNavPresentation(child, siteHomeUrl).hidden
  );
  const hasChildren = Boolean(visibleChildren.length);

  return (
    <li className={`nav-item${hasChildren ? " has-children" : ""}`}>
      <MenuAnchor item={item} siteHomeUrl={siteHomeUrl} />
      {hasChildren ? (
        <ul className="submenu">
          {visibleChildren.map((child) => (
            <MenuItem key={child.id} item={child} siteHomeUrl={siteHomeUrl} />
          ))}
        </ul>
      ) : null}
    </li>
  );
}

function FallbackNavigation({ items, onNavigate }) {
  return (
    <ul className="nav-list">
      {items.map((item) => (
        <li key={item.id} className="nav-item">
          <Link className="nav-link" to={item.href} onClick={onNavigate}>
            {item.title}
          </Link>
        </li>
      ))}
    </ul>
  );
}

function Navigation({ menus, pages, posts, siteHomeUrl, className = "", onNavigate }) {
  const preferredMenu = getPreferredMenu(menus, ["primary", "header", "menu-1", "main"]);

  return (
    <nav id="primary-site-nav" className={`site-nav ${className}`.trim()} aria-label="Primary navigation">
      {preferredMenu?.items?.length ? (
        <ul className="nav-list">
          {preferredMenu.items.map((item) => (
            <MenuItem key={item.id} item={item} siteHomeUrl={siteHomeUrl} />
          ))}
        </ul>
      ) : (
        <FallbackNavigation items={buildFallbackLinks(pages, posts)} onNavigate={onNavigate} />
      )}
    </nav>
  );
}

function FooterNavigation({ menus, pages, posts, siteHomeUrl }) {
  const preferredMenu = getPreferredMenu(menus, ["primary", "footer", "menu-1", "main"]);

  if (preferredMenu?.items?.length) {
    return (
      <ul className="footer-links">
        {preferredMenu.items
          .filter((item) => !getNavPresentation(item, siteHomeUrl).hidden)
          .slice(0, 5)
          .map((item) => (
            <li key={item.id}>
              <MenuAnchor item={item} siteHomeUrl={siteHomeUrl} className="footer-link" />
            </li>
          ))}
      </ul>
    );
  }

  return (
    <ul className="footer-links">
      {buildFallbackLinks(pages, posts)
        .filter((item) => item.href !== "/")
        .map((item) => (
          <li key={item.id}>
            <Link className="footer-link" to={item.href}>
              {item.title}
            </Link>
          </li>
        ))}
    </ul>
  );
}

function Header({ pages, posts, menus, site }) {
  const location = useLocation();
  const commercePage = pages.find((page) => ["cart", "checkout"].includes(page.slug)) || null;
  const featuredPage = buildFeaturedPages(pages)[0] || null;
  const siteOrigin = getWordPressOrigin(site);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname, location.search]);

  return (
    <header className="site-header-shell">
      <div className="brand-identity">
        <div className="brand-mark" aria-hidden="true">
          <span className="brand-mark-text">PB</span>
        </div>
        <div className="brand-block">
          <p className="eyebrow">Starter frontend</p>
          <Link className="site-title" to="/">
            Lenviqa
          </Link>
          <p className="site-description">{SITE_TAGLINE}</p>
        </div>
      </div>

      <div className="header-nav-block">
        <div className="header-actions">
          <button
            type="button"
            className="icon-link mobile-nav-toggle"
            onClick={() => setMenuOpen((open) => !open)}
            aria-expanded={menuOpen ? "true" : "false"}
            aria-controls="primary-site-nav"
            aria-label={menuOpen ? "Close navigation menu" : "Open navigation menu"}
          >
            <span className="mobile-nav-toggle__bar" />
            <span className="mobile-nav-toggle__bar" />
            <span className="mobile-nav-toggle__bar" />
          </button>
          {commercePage ? (
            <a
              className="icon-link icon-link-cart"
              href={`${siteOrigin}${commercePage.path}`}
              aria-label={`Open ${commercePage.title}`}
              title={commercePage.title}
            >
              <CartIcon />
            </a>
          ) : null}
          {featuredPage ? (
            <Link className="button-link button-link-primary header-cta" to={featuredPage.path}>
              Open sample page
            </Link>
          ) : null}
        </div>
        <Navigation
          menus={menus}
          pages={pages}
          posts={posts}
          siteHomeUrl={site?.home_url || site?.url || ""}
          className={menuOpen ? "is-open" : ""}
          onNavigate={() => setMenuOpen(false)}
        />
      </div>
    </header>
  );
}

function RouteLoadingShell() {
  return (
    <section className="route-loading-shell" aria-hidden="true">
      <div className="route-loading-shell__hero">
        <span className="route-loading-line route-loading-line--eyebrow" />
        <span className="route-loading-line route-loading-line--title" />
        <span className="route-loading-line route-loading-line--title route-loading-line--short" />
        <span className="route-loading-line route-loading-line--copy" />
        <span className="route-loading-line route-loading-line--copy route-loading-line--short" />
      </div>
      <div className="route-loading-shell__grid">
        <span className="route-loading-card" />
        <span className="route-loading-card" />
        <span className="route-loading-card" />
      </div>
    </section>
  );
}

function Footer({ site, menus, pages, posts }) {
  return (
    <footer className="site-footer-shell">
      <div className="footer-column">
        <p className="eyebrow">Lenviqa</p>
        <h2>A reusable WordPress-to-React starter.</h2>
        <p>
          WordPress still manages content, menus, previews, and permalink truth. Lenviqa owns
          the bridge layer. React owns the public presentation.
        </p>
      </div>

      <div className="footer-column">
        <p className="eyebrow">Navigation</p>
        <FooterNavigation
          menus={menus}
          pages={pages}
          posts={posts}
          siteHomeUrl={site?.home_url || site?.url || ""}
        />
      </div>

      <div className="footer-column">
        <p className="eyebrow">Current starter state</p>
        <ul className="stack-list">
          <li>{describeRouteMode(site)}</li>
          <li>{pages.length} WordPress page{pages.length === 1 ? "" : "s"} available to explore</li>
          <li>{posts.filter((item) => !isStarterPlaceholderContent(item)).length} recent post route{posts.length === 1 ? "" : "s"} ready for rendering</li>
        </ul>
        <div className="footer-contact">
          <span className="footer-link footer-link-strong">WordPress as CMS. React as frontend.</span>
          <a className="footer-link footer-link-inline" href="https://github.com/Daiosity/Lenviqa" target="_blank" rel="noreferrer">
            <LinkedChainIcon />
            <span>View repository</span>
          </a>
        </div>
      </div>
    </footer>
  );
}

function HeroSection({ site, pages, posts }) {
  const featuredPages = buildFeaturedPages(pages);
  const primaryPage = featuredPages[0] || null;
  const secondaryPage = featuredPages[1] || null;
  const realPosts = posts.filter((item) => !isStarterPlaceholderContent(item));

  return (
    <section className="hero-panel">
      <div className="hero-copy">
        <p className="eyebrow">{STARTER_HOME.eyebrow}</p>
        <h1>{STARTER_HOME.title}</h1>
        <p className="hero-lede">{STARTER_HOME.intro}</p>
        <div className="action-row">
          {primaryPage ? (
            <Link className="button-link button-link-primary" to={primaryPage.path}>
              Open {primaryPage.title}
            </Link>
          ) : null}
          {secondaryPage ? (
            <Link className="button-link" to={secondaryPage.path}>
              Explore {secondaryPage.title}
            </Link>
          ) : null}
        </div>
        <div className="hero-meta-row">
          <span>WordPress remains the CMS</span>
          <span>Route truth comes from the plugin</span>
          <span>React shapes the public experience</span>
        </div>
        <p className="inline-note">
          {STARTER_HOME.note} {realPosts.length ? "Recent posts are available below for route and archive testing." : ""}
        </p>
      </div>

      <div className="hero-stage">
        <div className="hero-stage-composition">
          <article className="hero-composition-primary">
            <div className="hero-composition-surface hero-composition-surface--window">
              <div className="hero-window-bar">
                <span />
                <span />
                <span />
              </div>
              <div className="hero-window-grid">
                <div className="hero-window-panel hero-window-panel--large" />
                <div className="hero-window-panel hero-window-panel--tall" />
                <div className="hero-window-panel hero-window-panel--wide" />
                <div className="hero-window-panel hero-window-panel--metric" />
              </div>
            </div>
            <div className="hero-showcase-copy">
              <span className="proof-label">Bridge behavior</span>
              <strong>Use WordPress as the source of truth without forcing the frontend to behave like a theme.</strong>
              <p className="proof-copy">
                The starter is meant to be customized, but the bridge behavior stays consistent:
                route resolution, preview handling, content mapping, and safe public handoff.
              </p>
            </div>
          </article>

          <div className="hero-composition-stack">
            <article className="hero-composition-card">
              <div className="hero-composition-surface hero-composition-surface--code">
                <span className="hero-code-line hero-code-line--short" />
                <span className="hero-code-line hero-code-line--long" />
                <span className="hero-code-line hero-code-line--medium" />
              </div>
              <div className="hero-showcase-copy">
                <span className="proof-label">Content rendering</span>
                <strong>Gutenberg-aware blocks with safe HTML fallback for compatibility-heavy routes.</strong>
              </div>
            </article>

            <article className="hero-composition-card">
              <div className="hero-composition-surface hero-composition-surface--signals">
                <span className="hero-signal hero-signal--one" />
                <span className="hero-signal hero-signal--two" />
                <span className="hero-signal hero-signal--three" />
              </div>
              <div className="hero-showcase-copy">
                <span className="proof-label">Operational safety</span>
                <strong>Preview, admin, REST, and safe-mode concerns stay in the plugin where they belong.</strong>
              </div>
            </article>
          </div>
        </div>

        <div className="hero-stage-grid">
          <div className="proof-card">
            <span className="proof-label">Content source</span>
            <strong>{site?.name || "WordPress"}</strong>
            <p className="proof-copy">The current site config comes from the WordPress backend, not a hardcoded demo.</p>
          </div>
          {STARTER_HOME.capabilityCards.map((item) => (
            <div key={item.label} className="proof-card">
              <span className="proof-label">{item.label}</span>
              <strong>{item.value}</strong>
              <p className="proof-copy">{item.copy}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function CapabilityGrid() {
  return (
    <section className="content-card content-card--open">
      <p className="eyebrow">Core capabilities</p>
      <div className="section-heading">
        <h2>What the starter is here to prove.</h2>
        <p className="lede">
          Lenviqa is not a full theme replacement. It is a bridge layer and a starter frontend
          that make a modern WordPress-to-React setup more practical.
        </p>
      </div>
      <div className="overview-grid">
        {STARTER_HOME.features.map((item, index) => (
          <article key={item.title} className="overview-card">
            <span className="overview-index">{String(index + 1).padStart(2, "0")}</span>
            <h3>{item.title}</h3>
            <p>{item.copy}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

function WhyLenviqa() {
  return (
    <section className="content-card content-card--open story-card story-card-feature">
      <p className="eyebrow">Why it exists</p>
      <div className="story-layout">
        <div className="story-copy">
          <h2>Headless WordPress does not need to start with a blank slate.</h2>
          <p className="lede">
            Many WordPress-to-React builds lose time on route guessing, broken preview flow, or
            frontend assumptions that fight WordPress instead of respecting it.
          </p>
          <p className="inline-note">
            Lenviqa keeps the editorial backend strong and puts the bridge concerns in the
            plugin so the frontend can stay focused on presentation and product work.
          </p>
        </div>
        <div className="principles-panel">
          <p className="overview-label">Starter principles</p>
          <ul className="principles-list">
            {STARTER_HOME.principles.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
          <div className="status-chip-row">
            <span className="status-chip">WordPress</span>
            <span className="status-chip">Preview-ready</span>
            <span className="status-chip">Route-aware</span>
            <span className="status-chip">React starter</span>
          </div>
        </div>
      </div>
    </section>
  );
}

function WorkflowOverview({ site, pages, posts }) {
  const realPostCount = posts.filter((item) => !isStarterPlaceholderContent(item)).length;

  return (
    <section className="content-card section-bleed section-contrast">
      <p className="eyebrow">How it works</p>
      <div className="split-heading">
        <div>
          <h2>WordPress, Lenviqa, and React each keep a clear job.</h2>
          <p className="lede">
            The frontend does not need to guess WordPress routes, and WordPress does not need to
            become a React app. The bridge layer keeps those responsibilities clean.
          </p>
        </div>
        <div className="status-chip-row">
          <span className="status-chip">{pages.length} page routes</span>
          <span className="status-chip">{realPostCount} recent posts</span>
          <span className="status-chip">{describeRouteMode(site)}</span>
        </div>
      </div>
      <div className="overview-grid">
        {STARTER_HOME.workflow.map((item) => (
          <article key={item.step} className="overview-card">
            <span className="overview-index">{item.step}</span>
            <h3>{item.title}</h3>
            <p>{item.copy}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

function RouteExamples({ pages }) {
  const featuredPages = buildFeaturedPages(pages);

  if (!featuredPages.length) {
    return null;
  }

  return (
    <section className="content-card content-card--open">
      <p className="eyebrow">Explore routes</p>
      <div className="section-heading">
        <h2>Real WordPress paths, resolved through the plugin.</h2>
        <p className="lede">
          These routes are still authored and managed in WordPress. The frontend simply presents
          them through the starter shell.
        </p>
      </div>
      <div className="archive-grid">
        {featuredPages.map((page) => (
          <article key={page.id} className="archive-card">
            <p className="eyebrow">WordPress route</p>
            <h3>
              <Link to={page.path}>{page.title}</Link>
            </h3>
            <p>{getPageSpotlightCopy(page)}</p>
            <div className="action-row">
              <Link className="button-link" to={page.path}>
                Open route
              </Link>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function LatestContentSection({ route, posts = [] }) {
  const sourceItems = route?.items?.length ? route.items : posts;
  const items = sourceItems.filter((item) => !isStarterPlaceholderContent(item));

  if (!items.length) {
    return null;
  }

  return (
    <section className="content-card content-card--open">
      <p className="eyebrow">Latest content</p>
      <div className="section-heading">
        <h2>Published in WordPress, available through the starter.</h2>
        <p className="lede">
          Use this section to verify archive rendering, post routes, and starter-level card
          layouts before replacing them with project-specific designs.
        </p>
      </div>
      <div className="archive-grid">
        {items.slice(0, 3).map((item) => (
          <article key={item.id} className="archive-card">
            <p className="eyebrow">{item.post_type_label || item.post_type}</p>
            <h3>
              <Link to={item.path}>{item.title}</Link>
            </h3>
            <p>
              {item.excerpt ||
                "Published in WordPress and delivered through the Lenviqa frontend layer."}
            </p>
          </article>
        ))}
      </div>
    </section>
  );
}

function BridgeStatus({ site, pages, posts }) {
  const realPosts = posts.filter((item) => !isStarterPlaceholderContent(item));

  return (
    <section className="content-card contact-panel contact-panel-home">
      <p className="eyebrow">Starter status</p>
      <div className="split-heading">
        <div>
          <h2>Built to be customized, but useful before customization.</h2>
          <p className="lede">
            The starter should be clear enough to explore immediately and plain enough to become
            your own frontend foundation.
          </p>
        </div>
        <div className="contact-summary">
          <span className="status-badge">Current mode</span>
          <p>{describeRouteMode(site)}</p>
        </div>
      </div>
      <div className="archive-grid">
        <article className="archive-card">
          <p className="eyebrow">Site config</p>
          <h3>{site?.name || "WordPress site"}</h3>
          <p>Configured through the plugin and available to the frontend at boot time.</p>
        </article>
        <article className="archive-card">
          <p className="eyebrow">Route coverage</p>
          <h3>{pages.length} pages available</h3>
          <p>Use the route explorer above to verify how WordPress paths resolve through Lenviqa.</p>
        </article>
        <article className="archive-card">
          <p className="eyebrow">Publishing</p>
          <h3>{realPosts.length} recent posts</h3>
          <p>Starter archive cards make it easier to test posts and list views without extra setup.</p>
        </article>
      </div>
    </section>
  );
}

function CompatibilityNotice({ content }) {
  const compatibility = content?.compatibility;

  if (!compatibility?.is_shortcode_content) {
    return null;
  }

  const isWoo = Boolean(compatibility?.is_woocommerce_shortcode_page);
  const tags = Array.isArray(compatibility?.shortcodes) ? compatibility.shortcodes.filter(Boolean) : [];
  const sourceLabel = isWoo ? "WooCommerce compatibility" : "HTML compatibility";
  const detail =
    tags.length > 0 ? `Shortcodes detected: ${tags.join(", ")}` : "Server-rendered compatibility mode is active.";

  return (
    <section className="content-card compatibility-card">
      <p className="eyebrow">{sourceLabel}</p>
      <h2>
        {isWoo
          ? "This route is using the advanced WooCommerce compatibility path."
          : "This route is using the HTML compatibility path instead of normal block rendering."}
      </h2>
      <p className="lede">
        {isWoo
          ? "Lenviqa is rendering server-side WooCommerce output for this route so the starter can keep working without pretending WooCommerce is a normal starter-level content type."
          : "Lenviqa is rendering server-side HTML for this route because block translation is not the right fit for the content it contains."}
      </p>
      <div className="status-chip-row">
        <span className="status-chip">Render mode: {content?.render_mode || "html"}</span>
        <span className="status-chip">{isWoo ? "Advanced feature path" : "Compatibility route"}</span>
      </div>
      <p className="inline-note">
        {detail}{" "}
        {isWoo
          ? "WooCommerce cart and checkout flows are easiest when the public frontend and store share the same primary domain."
          : "This keeps the route functional while the richer compatibility story is still being hardened."}
      </p>
    </section>
  );
}

function PreviewBanner({ content, currentPath }) {
  if (!content?.is_preview) {
    return null;
  }

  const preview = content.preview || {};
  const publishedPath = preview.canonical_path || content.path || "/";

  return (
    <section className="content-card preview-card">
      <p className="eyebrow">Preview mode</p>
      <h2>Signed WordPress preview</h2>
      <p className="lede">
        {preview.source_label ||
          "You are looking at a temporary preview being served directly from WordPress."}
      </p>
      <p className="inline-note">
        Preview content is intentionally temporary and does not change the published public route.
      </p>
      <div className="action-row">
        <Link className="button-link" to={publishedPath}>
          Open published route
        </Link>
      </div>
    </section>
  );
}

function ContentView({ content }) {
  const isDocumentPage =
    content?.post_type === "page" && Array.isArray(content?.blocks) && content.blocks.length > 0;
  const className = ["content-card", isDocumentPage ? "content-card--document" : ""]
    .filter(Boolean)
    .join(" ");

  return (
    <article className={className}>
      <p className="eyebrow">{content.post_type_label || content.post_type}</p>
      <h1>{content.title}</h1>
      {content.featured_image?.url ? (
        <img
          className="hero-image"
          src={content.featured_image.url}
          alt={content.featured_image.alt || content.title}
        />
      ) : null}
      <BlockContent
        blocks={content.blocks || []}
        html={content.content}
        renderMode={content.render_mode}
        compatibility={content.compatibility}
      />
    </article>
  );
}

function ArchiveView({ route }) {
  const items = route.items || [];

  return (
    <section className="content-card">
      <p className="eyebrow">{route.post_type_label || route.post_type} archive</p>
      <h2>{route.title}</h2>
      {route.description ? <p className="lede">{route.description}</p> : null}
      <p className="meta-row">
        {route.totalItems} item{route.totalItems === 1 ? "" : "s"}
        {route.search ? ` matching "${route.search}"` : ""}
      </p>

      {items.length ? (
        <div className="archive-grid">
          {items.map((item) => (
            <article key={item.id} className="archive-card">
              <p className="eyebrow">{item.post_type_label || item.post_type}</p>
              <h3>
                <Link to={item.path}>{item.title}</Link>
              </h3>
              {item.excerpt ? <p>{item.excerpt}</p> : null}
            </article>
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <h3>No published content yet</h3>
          <p>This archive route is connected, but WordPress does not have any published items here yet.</p>
        </div>
      )}
    </section>
  );
}

function FailureState({ message }) {
  return (
    <section className="content-card">
      <p className="eyebrow">Connection issue</p>
      <h2>The React frontend could not complete the bridge request</h2>
      <p className="lede">{message}</p>
      <ul className="stack-list">
        <li>Confirm WordPress is running and reachable from this frontend.</li>
        <li>Confirm the Lenviqa plugin is active and the custom REST routes are available.</li>
        <li>Confirm the frontend API base matches the WordPress site you want to render.</li>
      </ul>
    </section>
  );
}

function HomeExperience({ site, route, pages, posts }) {
  return (
    <>
      <HeroSection site={site} pages={pages} posts={posts} />
      <CapabilityGrid />
      <WhyLenviqa />
      <WorkflowOverview site={site} pages={pages} posts={posts} />
      <RouteExamples pages={pages} />
      <LatestContentSection route={route} posts={posts} />
      <BridgeStatus site={site} pages={pages} posts={posts} />
    </>
  );
}

function EmptyRoute() {
  return (
    <section className="content-card">
      <p className="eyebrow">Route not found</p>
      <h1>This path is not published in WordPress yet</h1>
      <p>Publish content for this route, or update the frontend to point at a path that WordPress can resolve.</p>
    </section>
  );
}

export default function App() {
  const location = useLocation();
  const currentPath = `${location.pathname}${location.search}`;
  const cachedBoot = getCachedBootData();
  const cachedRoute =
    location.search.includes("wtr_preview_token") ? null : getCachedResolvedRoute(location.pathname);
  const [site, setSite] = useState(cachedBoot.site);
  const [menus, setMenus] = useState(cachedBoot.menus);
  const [pages, setPages] = useState(cachedBoot.pages?.items || []);
  const [routeData, setRouteData] = useState(cachedRoute);
  const [posts, setPosts] = useState(cachedBoot.posts?.items || []);
  const [bootLoading, setBootLoading] = useState(!(cachedBoot.site && cachedBoot.menus));
  const [routeLoading, setRouteLoading] = useState(!cachedRoute);
  const [error, setError] = useState("");

  useEffect(() => {
    async function bootstrap() {
      const [siteData, menuData, pageData, postData] = await Promise.all([
        fetchSiteConfig(),
        fetchMenus(),
        fetchPages(),
        fetchPosts()
      ]);
      setSite(siteData);
      setMenus(menuData);
      setPages(pageData.items || []);
      setPosts(postData.items || []);
    }

    bootstrap()
      .catch((bootstrapError) => {
        setError(
          bootstrapError.message ||
            "Unable to load the WordPress bridge configuration for this frontend."
        );
      })
      .finally(() => {
        setBootLoading(false);
      });
  }, []);

  useEffect(() => {
    async function loadRoute() {
      setError("");
      const params = new URLSearchParams(location.search);
      const previewToken = params.get("wtr_preview_token");
      const hasUsableRoute = !previewToken && routeMatchesPath(routeData, location.pathname);

      if (!hasUsableRoute) {
        setRouteLoading(true);
      }

      try {
        if (previewToken) {
          setRouteLoading(true);
          const previewData = await fetchPreviewContent(previewToken);
          setRouteData(previewData);
          return;
        }

        const resolved = await resolveContent(location.pathname);
        setRouteData(resolved);
      } catch (routeError) {
        if (routeError?.status === 404) {
          setRouteData(null);
          return;
        }

        setError(routeError.message || "Route lookup failed.");
      } finally {
        setRouteLoading(false);
      }
    }

    if (site) {
      loadRoute();
    }
  }, [location.pathname, location.search, site]);

  useEffect(() => {
    document.title = getDocumentTitle(routeData, location.pathname);
  }, [routeData, location.pathname]);

  const pageContent = useMemo(() => {
    if (bootLoading || error) {
      return null;
    }

    return (
      <>
        {routeData?.is_preview ? <PreviewBanner content={routeData} currentPath={currentPath} /> : null}
        {isHomeRoute(routeData) ? <HomeExperience site={site} route={routeData} pages={pages} posts={posts} /> : null}
        {routeData?.route_type === "singular" && !isHomeRoute(routeData) ? (
          <>
            <CompatibilityNotice content={routeData} />
            <ContentView content={routeData} />
          </>
        ) : null}
        {routeData?.route_type === "archive" && routeData?.path !== "/" ? <ArchiveView route={routeData} /> : null}
        {!routeLoading && !routeData ? <EmptyRoute /> : null}
      </>
    );
  }, [bootLoading, currentPath, error, pages, posts, routeData, routeLoading, site]);

  const showRouteOverlay = Boolean(routeData && routeLoading && pageContent);

  return (
    <div className="app-shell">
      <Header site={site} menus={menus} pages={pages} posts={posts} />

      <main className="site-main">
        {bootLoading || (!routeData && routeLoading) ? <RouteLoadingShell /> : null}
        {!bootLoading && !routeLoading && error ? <FailureState message={error} /> : null}
        {pageContent ? (
          <div className="page-stage">
            <div key={currentPath} className="page-transition">
              {pageContent}
            </div>
            {showRouteOverlay ? (
              <div className="route-loading-overlay">
                <div className="route-loading-veil" />
                <div className="route-loading-chip" aria-hidden="true">
                  <span className="route-loading-chip__dot" />
                  <span>Loading next page</span>
                </div>
                <div className="route-loading-progress" aria-hidden="true" />
              </div>
            ) : null}
          </div>
        ) : null}
      </main>

      <Footer site={site} menus={menus} pages={pages} posts={posts} />
    </div>
  );
}
