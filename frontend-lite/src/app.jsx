const { useEffect, useMemo, useState } = React;
const { BrowserRouter, Link, useLocation } = ReactRouterDOM;

const SITE_TITLE = "PressBridge";
const SITE_TAGLINE = "Connect WordPress to modern frontends.";
const DEFAULT_API_BASE = "http://wp-to-react.local/wp-json/pressbridge/v1";
const CACHE_PREFIX = "pressbridge-lite:";
const memoryCache = new Map();
const SESSION_ROUTE_PATTERNS = [/^\/cart\/?$/i, /^\/checkout\/?$/i, /^\/my-account\/?$/i];

const STARTER_HOME = {
  eyebrow: "Headless-ready WordPress",
  title: "Same WordPress content. Better frontend.",
  intro:
    "PressBridge keeps WordPress as the CMS while React handles the public presentation layer. This lightweight frontend is here for smoke testing route resolution, preview flow, and starter rendering without a build step.",
  note:
    "Use the Vite app for long-term frontend work. Use this lite app when you want a quick local check that the bridge is working."
};

function getApiBase() {
  const params = new URLSearchParams(window.location.search);
  const fromQuery = params.get("apiBase");

  if (fromQuery) {
    window.sessionStorage.setItem(`${CACHE_PREFIX}apiBase`, fromQuery.replace(/\/$/, ""));
    return fromQuery.replace(/\/$/, "");
  }

  const stored = window.sessionStorage.getItem(`${CACHE_PREFIX}apiBase`);
  return (stored || DEFAULT_API_BASE).replace(/\/$/, "");
}

function buildCacheKey(key) {
  return `${CACHE_PREFIX}${key}`;
}

function readCache(key, maxAgeMs = 0) {
  const cacheKey = buildCacheKey(key);
  const inMemory = memoryCache.get(cacheKey);

  if (inMemory && (!maxAgeMs || Date.now() - inMemory.timestamp <= maxAgeMs)) {
    return inMemory.value;
  }

  try {
    const raw = window.sessionStorage.getItem(cacheKey);

    if (!raw) {
      return null;
    }

    const parsed = JSON.parse(raw);

    if (maxAgeMs && Date.now() - parsed.timestamp > maxAgeMs) {
      window.sessionStorage.removeItem(cacheKey);
      return null;
    }

    memoryCache.set(cacheKey, parsed);
    return parsed.value;
  } catch (error) {
    return null;
  }
}

function writeCache(key, value) {
  const cacheKey = buildCacheKey(key);
  const entry = { value, timestamp: Date.now() };
  memoryCache.set(cacheKey, entry);

  try {
    window.sessionStorage.setItem(cacheKey, JSON.stringify(entry));
  } catch (error) {
    // Ignore sessionStorage write failures.
  }
}

function isSessionSensitivePath(pathname = "") {
  return SESSION_ROUTE_PATTERNS.some((pattern) => pattern.test(pathname));
}

async function apiFetch(path) {
  const apiBase = getApiBase();
  let response;

  try {
    response = await fetch(`${apiBase}${path}`, {
      credentials: "include",
      headers: {
        Accept: "application/json"
      }
    });
  } catch (networkError) {
    throw new Error(
      "Unable to reach the PressBridge API. Confirm WordPress is running, the plugin is active, and the API base URL is correct."
    );
  }

  if (!response.ok) {
    let message = "Request failed.";

    try {
      const error = await response.json();
      message = error.message || message;
    } catch (parseError) {
      message = response.statusText || message;
    }

    const error = new Error(message);
    error.status = response.status;
    throw error;
  }

  try {
    return await response.json();
  } catch (parseError) {
    throw new Error("The PressBridge API returned an invalid JSON response.");
  }
}

async function cachedApiFetch(path, { cacheKey, maxAgeMs = 0 } = {}) {
  if (cacheKey) {
    const cached = readCache(cacheKey, maxAgeMs);

    if (cached) {
      return cached;
    }
  }

  const data = await apiFetch(path);

  if (cacheKey) {
    writeCache(cacheKey, data);
  }

  return data;
}

function fetchSiteConfig() {
  return cachedApiFetch("/site", { cacheKey: "site", maxAgeMs: 1000 * 60 * 10 });
}

function fetchMenus() {
  return cachedApiFetch("/menus", { cacheKey: "menus", maxAgeMs: 1000 * 60 * 10 });
}

function fetchPages() {
  return cachedApiFetch("/pages?per_page=10", { cacheKey: "pages", maxAgeMs: 1000 * 60 * 5 });
}

function fetchPosts() {
  return cachedApiFetch("/posts?per_page=10", { cacheKey: "posts", maxAgeMs: 1000 * 60 * 5 });
}

function fetchPreviewContent(token) {
  return apiFetch(`/preview/${encodeURIComponent(token)}`);
}

function resolveContent(pathname) {
  if (isSessionSensitivePath(pathname)) {
    return apiFetch(`/resolve?path=${encodeURIComponent(pathname)}`);
  }

  return cachedApiFetch(`/resolve?path=${encodeURIComponent(pathname)}`, {
    cacheKey: `resolve:${pathname}`,
    maxAgeMs: 1000 * 60 * 5
  });
}

function getCachedBootData() {
  return {
    site: readCache("site", 1000 * 60 * 10),
    menus: readCache("menus", 1000 * 60 * 10),
    pages: readCache("pages", 1000 * 60 * 5),
    posts: readCache("posts", 1000 * 60 * 5)
  };
}

function getCachedResolvedRoute(pathname) {
  if (isSessionSensitivePath(pathname)) {
    return null;
  }

  return readCache(`resolve:${pathname}`, 1000 * 60 * 5);
}

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
  return ["/cart", "/cart/", "/checkout", "/checkout/", "/checkout/confirmation", "/checkout/confirmation/", "/my-account", "/my-account/"].includes(path);
}

function isUtilityPage(page) {
  return isUtilityPath(page?.path || "") || ["cart", "checkout", "confirmation", "my-account"].includes(page?.slug || "");
}

function buildFallbackLinks(pages, posts) {
  const links = [{ id: "home", title: "Home", href: "/" }];

  pages
    .filter((page) => !isUtilityPage(page) && page.path !== "/")
    .slice(0, 4)
    .forEach((page) => {
      links.push({ id: `page-${page.id}`, title: page.title, href: page.path });
    });

  if (posts.some((item) => !isStarterPlaceholderContent(item))) {
    links.push({ id: "updates", title: "Updates", href: "/" });
  }

  return links.filter((item, index, items) => items.findIndex((candidate) => candidate.href === item.href) === index);
}

function buildFeaturedPages(pages) {
  const preferred = ["test-page", "sample-page", "about", "blog"];
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

  return site.route_handling_mode === "redirect" ? "Redirect handoff enabled" : "WordPress safe mode";
}

function isHomeRoute(route) {
  if (!route) {
    return false;
  }

  if (route.route_type === "archive" && route.path === "/") {
    return true;
  }

  return route.route_type === "singular" && route.post_type === "page" && (route.is_front_page || route.path === "/" || route.slug === "home");
}

function routeMatchesPath(route, pathname) {
  if (!route) {
    return false;
  }

  return route.path ? route.path === pathname : route.route_type === "archive" && route.path === pathname;
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
    return `${route.title || route.label || "Archive"} | ${SITE_TITLE}`;
  }

  return SITE_TITLE;
}

function renderHtml(content) {
  return { __html: content || "" };
}

function BlockContent({ content }) {
  const htmlClassName = [
    "content-body",
    "content-body-html",
    content?.compatibility?.is_shortcode_content ? "content-body-html--shortcode" : "",
    content?.compatibility?.is_woocommerce_shortcode_page ? "content-body-html--woocommerce" : ""
  ]
    .filter(Boolean)
    .join(" ");

  return <div className={htmlClassName} dangerouslySetInnerHTML={renderHtml(content?.content)} />;
}

function MenuAnchor({ item, siteHomeUrl, className = "nav-link" }) {
  const link = getMenuLink(item, siteHomeUrl);

  if (link.internal) {
    return <Link className={className} to={link.href}>{item.title}</Link>;
  }

  return <a className={className} href={link.href} target={link.target || "_self"} rel={link.target === "_blank" ? "noreferrer" : undefined}>{item.title}</a>;
}

function Navigation({ menus, pages, posts }) {
  const preferredMenu = getPreferredMenu(menus, ["primary", "header", "menu-1", "main"]);
  const siteHomeUrl = readCache("site", 1000 * 60 * 10)?.home_url || "";

  if (preferredMenu?.items?.length) {
    return (
      <nav className="site-nav" aria-label="Primary navigation">
        <ul className="nav-list">
          {preferredMenu.items
            .filter((item) => !isUtilityPath(getMenuLink(item, siteHomeUrl).href.split("?")[0]))
            .map((item) => (
              <li key={item.id} className="nav-item">
                <MenuAnchor item={item} siteHomeUrl={siteHomeUrl} />
              </li>
            ))}
        </ul>
      </nav>
    );
  }

  return (
    <nav className="site-nav" aria-label="Primary navigation">
      <ul className="nav-list">
        {buildFallbackLinks(pages, posts).map((item) => (
          <li key={item.id} className="nav-item">
            <Link className="nav-link" to={item.href}>{item.title}</Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}

function Header({ site, menus, pages, posts }) {
  const commercePage = pages.find((page) => ["cart", "checkout"].includes(page.slug)) || null;
  const siteOrigin = getSiteOrigin(site?.home_url || site?.url || "");
  const featuredPage = buildFeaturedPages(pages)[0] || null;

  return (
    <header className="site-header-shell">
      <div className="brand-identity">
        <div className="brand-mark" aria-hidden="true">
          <span className="brand-mark-text">PB</span>
        </div>
        <div className="brand-block">
          <p className="eyebrow">Lite smoke frontend</p>
          <Link className="site-title" to="/">PressBridge</Link>
          <p className="site-description">{SITE_TAGLINE}</p>
        </div>
      </div>
      <div className="header-nav-block">
        <Navigation menus={menus} pages={pages} posts={posts} />
        <div className="header-actions">
          {commercePage ? (
            <a className="icon-link icon-link-cart" href={`${siteOrigin}${commercePage.path}`} title={commercePage.title} aria-label={`Open ${commercePage.title}`}>
              <svg aria-hidden="true" viewBox="0 0 24 24" focusable="false">
                <path d="M7 6h14l-1.6 7.2a2 2 0 0 1-2 1.6H10.2a2 2 0 0 1-2-1.5L6.2 4.8H3" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                <circle cx="10.4" cy="19" r="1.5" fill="currentColor" />
                <circle cx="17.2" cy="19" r="1.5" fill="currentColor" />
              </svg>
            </a>
          ) : null}
          {featuredPage ? <Link className="button-link button-link-primary header-cta" to={featuredPage.path}>Open sample page</Link> : null}
        </div>
      </div>
    </header>
  );
}

function Footer({ site, menus, pages, posts }) {
  return (
    <footer className="site-footer-shell">
      <div className="footer-column">
        <p className="eyebrow">PressBridge</p>
        <h2>Quick smoke checks without the Vite build.</h2>
        <p>This frontend is intentionally lightweight. It exists to verify route resolution, preview flow, and starter rendering against a live WordPress site.</p>
      </div>
      <div className="footer-column">
        <p className="eyebrow">Navigation</p>
        <ul className="footer-links">
          {buildFallbackLinks(pages, posts).filter((item) => item.href !== "/").map((item) => (
            <li key={item.id}><Link className="footer-link" to={item.href}>{item.title}</Link></li>
          ))}
        </ul>
      </div>
      <div className="footer-column">
        <p className="eyebrow">Current starter state</p>
        <ul className="stack-list">
          <li>{describeRouteMode(site)}</li>
          <li>{pages.length} WordPress page{pages.length === 1 ? "" : "s"} available to explore</li>
          <li>{posts.filter((item) => !isStarterPlaceholderContent(item)).length} recent post route{posts.length === 1 ? "" : "s"} ready for rendering</li>
        </ul>
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
          {primaryPage ? <Link className="button-link button-link-primary" to={primaryPage.path}>Open {primaryPage.title}</Link> : null}
          {secondaryPage ? <Link className="button-link" to={secondaryPage.path}>Explore {secondaryPage.title}</Link> : null}
        </div>
        <div className="hero-meta-row">
          <span>WordPress remains the CMS</span>
          <span>Route truth comes from the plugin</span>
          <span>React shapes the public experience</span>
        </div>
        <p className="inline-note">{STARTER_HOME.note} {realPosts.length ? "Recent posts are available below for route and archive testing." : ""}</p>
      </div>

      <div className="hero-stage">
        <div className="hero-stage-composition">
          <article className="hero-composition-primary">
            <div className="hero-composition-surface hero-composition-surface--window">
              <div className="hero-window-bar"><span /><span /><span /></div>
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
              <p className="proof-copy">This no-build frontend keeps the same high-level contract as the Vite starter while staying lightweight.</p>
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
                <span className="proof-label">Smoke frontend</span>
                <strong>Fast to run locally when you want to test the bridge without a build step.</strong>
              </div>
            </article>
            <article className="hero-composition-card">
              <div className="hero-composition-surface hero-composition-surface--signals">
                <span className="hero-signal hero-signal--one" />
                <span className="hero-signal hero-signal--two" />
                <span className="hero-signal hero-signal--three" />
              </div>
              <div className="hero-showcase-copy">
                <span className="proof-label">Local workflow</span>
                <strong>Useful for validating route resolution, preview behavior, and content rendering against Local WordPress.</strong>
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
          <div className="proof-card">
            <span className="proof-label">Mode</span>
            <strong>{describeRouteMode(site)}</strong>
            <p className="proof-copy">The smoke frontend uses the same bridge settings the plugin is exposing right now.</p>
          </div>
        </div>
      </div>
    </section>
  );
}

function RouteExamples({ pages }) {
  const featuredPages = buildFeaturedPages(pages);
  if (!featuredPages.length) return null;
  return (
    <section className="content-card content-card--open">
      <p className="eyebrow">Explore routes</p>
      <div className="section-heading">
        <h2>Real WordPress paths, resolved through the plugin.</h2>
        <p className="lede">These routes are still authored and managed in WordPress. The frontend simply presents them through the starter shell.</p>
      </div>
      <div className="archive-grid">
        {featuredPages.map((page) => (
          <article key={page.id} className="archive-card">
            <p className="eyebrow">WordPress route</p>
            <h3><Link to={page.path}>{page.title}</Link></h3>
            <p>{page.excerpt || "This route is still managed in WordPress and rendered through the React starter."}</p>
            <div className="action-row"><Link className="button-link" to={page.path}>Open route</Link></div>
          </article>
        ))}
      </div>
    </section>
  );
}

function LatestContentSection({ route, posts }) {
  const sourceItems = route?.items?.length ? route.items : posts;
  const items = sourceItems.filter((item) => !isStarterPlaceholderContent(item));
  if (!items.length) return null;
  return (
    <section className="content-card content-card--open">
      <p className="eyebrow">Latest content</p>
      <div className="archive-grid">
        {items.slice(0, 3).map((item) => (
          <article key={item.id} className="archive-card">
            <p className="eyebrow">{item.post_type_label || item.post_type}</p>
            <h3><Link to={item.path}>{item.title}</Link></h3>
            <p>{item.excerpt || "Published in WordPress and delivered through the PressBridge frontend layer."}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

function PreviewBanner({ content, currentPath }) {
  if (!content?.is_preview) return null;
  const preview = content.preview || {};
  const publishedPath = preview.canonical_path || content.path || "/";
  return (
    <section className="content-card preview-card">
      <p className="eyebrow">Preview mode</p>
      <h2>Signed WordPress preview</h2>
      <p className="lede">{preview.source_label || "You are looking at a temporary preview being served directly from WordPress."}</p>
      <p className="inline-note">
        Preview content is intentionally temporary and does not change the published public route.
      </p>
      <div className="action-row"><Link className="button-link" to={publishedPath}>Open published route</Link></div>
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
          ? "PressBridge is rendering server-side WooCommerce output for this route so the starter can keep working without pretending WooCommerce is a normal starter-level content type."
          : "PressBridge is rendering server-side HTML for this route because block translation is not the right fit for the content it contains."}
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

function ContentView({ content }) {
  return (
    <article className={`content-card ${content?.post_type === "page" ? "content-card--document" : ""}`.trim()}>
      <p className="eyebrow">{content.post_type_label || content.post_type}</p>
      <h1>{content.title}</h1>
      {content.featured_image?.url ? <img className="hero-image" src={content.featured_image.url} alt={content.featured_image.alt || content.title} /> : null}
      <BlockContent content={content} />
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
      {items.length ? (
        <div className="archive-grid">
          {items.map((item) => (
            <article key={item.id} className="archive-card">
              <p className="eyebrow">{item.post_type_label || item.post_type}</p>
              <h3><Link to={item.path}>{item.title}</Link></h3>
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
        <li>Confirm the PressBridge plugin is active and the custom REST routes are available.</li>
        <li>Confirm the frontend API base matches the WordPress site you want to render.</li>
      </ul>
    </section>
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

function RouteLoadingShell() {
  return (
    <section className="route-loading-shell" aria-hidden="true">
      <div className="route-loading-shell__hero">
        <span className="route-loading-line route-loading-line--eyebrow" />
        <span className="route-loading-line route-loading-line--title" />
        <span className="route-loading-line route-loading-line--title route-loading-line--short" />
        <span className="route-loading-line route-loading-line--copy" />
      </div>
      <div className="route-loading-shell__grid">
        <span className="route-loading-card" />
        <span className="route-loading-card" />
        <span className="route-loading-card" />
      </div>
    </section>
  );
}

function HomeExperience({ site, route, pages, posts }) {
  return (
    <>
      <HeroSection site={site} pages={pages} posts={posts} />
      <RouteExamples pages={pages} />
      <LatestContentSection route={route} posts={posts} />
    </>
  );
}

function App() {
  const location = useLocation();
  const currentPath = `${location.pathname}${location.search}`;
  const cachedBoot = getCachedBootData();
  const cachedRoute = location.search.includes("wtr_preview_token") ? null : getCachedResolvedRoute(location.pathname);
  const [site, setSite] = useState(cachedBoot.site);
  const [menus, setMenus] = useState(cachedBoot.menus || {});
  const [pages, setPages] = useState(cachedBoot.pages?.items || []);
  const [posts, setPosts] = useState(cachedBoot.posts?.items || []);
  const [routeData, setRouteData] = useState(cachedRoute);
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
        setError(bootstrapError.message || "Unable to load the WordPress bridge configuration for this frontend.");
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
            <div key={currentPath} className="page-transition">{pageContent}</div>
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

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);
