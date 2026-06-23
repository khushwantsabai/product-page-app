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
  let errorMessage = "Unknown error";
  if (isRouteErrorResponse(error)) {
    const errorData = typeof error.data === 'object' ? JSON.stringify(error.data, null, 2) : error.data;
    errorMessage = `${error.status} ${error.statusText} - ${errorData}`;
  } else if (error instanceof Error) {
    errorMessage = error.message;
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
        <div style={{ maxWidth: '600px', margin: '0 auto', textAlign: 'center' }}>
          <h1 style={{ color: '#E32929', marginBottom: '1rem' }}>Oops! Something went wrong.</h1>
          <p style={{ marginBottom: '1rem' }}>The app encountered an unexpected error. This usually happens if the environment variables (API Key/Secret) are incorrect or the database is unreachable.</p>
          <div style={{ background: '#f4f4f4', padding: '1rem', borderRadius: '8px', textAlign: 'left', overflowX: 'auto' }}>
            <code style={{ fontSize: '14px' }}>{errorMessage}</code>
          </div>
        </div>
        <Scripts />
      </body>
    </html>
  );
}
