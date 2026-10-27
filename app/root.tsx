import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useRouteError,
  isRouteErrorResponse,
} from "@remix-run/react";

export default function App() {
  return (
    <html>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        <link rel="preconnect" href="https://cdn.shopify.com/" />
        <link
          rel="stylesheet"
          href="https://cdn.shopify.com/static/fonts/inter/v4/styles.css"
        />
        <Meta />
        <Links />
      </head>
      <body>
        <Outlet />
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export function ErrorBoundary() {
  const error = useRouteError();
  console.error(">>> Root ErrorBoundary caught error:", error);
  let errorMessage = "Unknown error";
  let errorStack = "";

  if (isRouteErrorResponse(error)) {
    const errorData = typeof error.data === 'object' ? JSON.stringify(error.data, null, 2) : error.data;
    errorMessage = `${error.status} ${error.statusText} - ${errorData}`;
  } else if (error instanceof Error) {
    errorMessage = error.message;
    errorStack = error.stack || "";
  } else if (typeof error === "object" && error !== null) {
    try {
      errorMessage = JSON.stringify(error, Object.getOwnPropertyNames(error), 2);
    } catch {
      errorMessage = String(error);
    }
  } else {
    errorMessage = String(error);
  }

  return (
    <html>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        <title>App Error</title>
        <Meta />
        <Links />
      </head>
      <body style={{ padding: '2rem', fontFamily: 'system-ui, sans-serif', color: '#333' }}>
        <div style={{ maxWidth: '700px', margin: '0 auto', textAlign: 'center' }}>
          <h1 style={{ color: '#E32929', marginBottom: '1rem' }}>Oops! Something went wrong.</h1>
          <p style={{ marginBottom: '1rem' }}>The app encountered an unexpected error. This usually happens if the environment variables (API Key/Secret) are incorrect or the database is unreachable.</p>
          <div style={{ background: '#f4f4f4', padding: '1rem', borderRadius: '8px', textAlign: 'left', overflowX: 'auto', marginBottom: '1rem' }}>
            <code style={{ fontSize: '14px', whiteSpace: 'pre-wrap' }}>{errorMessage}</code>
          </div>
          {errorStack ? (
            <details style={{ textAlign: 'left', background: '#fff', border: '1px solid #ddd', padding: '0.75rem', borderRadius: '6px' }} open>
              <summary style={{ cursor: 'pointer', fontWeight: 600 }}>Error Stack Trace</summary>
              <pre style={{ fontSize: '12px', marginTop: '0.5rem', overflowX: 'auto', whiteSpace: 'pre-wrap' }}>{errorStack}</pre>
            </details>
          ) : null}
        </div>
        <Scripts />
      </body>
    </html>
  );
}
