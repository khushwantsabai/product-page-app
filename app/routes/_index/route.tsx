import type { LoaderFunctionArgs } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import { Form, useLoaderData } from "@remix-run/react";
import { login } from "../../shopify.server";
import styles from "./styles.module.css";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const url = new URL(request.url);

  if (url.searchParams.get("shop")) {
    throw redirect(`/app?${url.searchParams.toString()}`);
  }

  return { showForm: Boolean(login) };
};

export default function App() {
  const { showForm } = useLoaderData<typeof loader>();

  return (
    <div className={styles.index}>
      <div className={styles.content}>
        
        <div className={styles.hero}>
          <h1 className={styles.heading}>Pagecraft Builder</h1>
          <p className={styles.text}>
            A tagline about Pagecraft that describes your value proposition.
          </p>
        </div>

        {showForm && (
          <div className={styles.formWrapper}>
            
            <div className={styles.formHeader}>
              <div className={styles.formHeaderIcon}>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
              </div>
              <div>
                <h2 className={styles.formHeading}>Log in to your store</h2>
                <p className={styles.formSubheading}>Access your dashboard and manage your store</p>
              </div>
            </div>

            <Form className={styles.form} method="post" action="/auth/login">
              <label className={styles.label}>
                Shop domain
                <div className={styles.inputGroup}>
                  <div className={styles.inputIcon}>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m2 7 4.41-4.41A2 2 0 0 1 7.83 2h8.34a2 2 0 0 1 1.42.59L22 7"/><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><path d="M15 22v-4a2 2 0 0 0-2-2h-2a2 2 0 0 0-2 2v4"/><path d="M2 7h20"/><path d="M22 7v3a2 2 0 0 1-2 2v0a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 16 12a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 12 12a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 8 12a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 4 12v0a2 2 0 0 1-2-2V7"/></svg>
                  </div>
                  <input 
                    className={styles.input} 
                    type="text" 
                    name="shop" 
                    placeholder="my-shop-domain.myshopify.com"
                    required
                  />
                </div>
                <span className={styles.hint}>Enter your Shopify store domain</span>
              </label>

              <button className={styles.buttonPrimary} type="submit">
                Log in
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
              </button>

              <div className={styles.divider}>or</div>

              <button className={styles.buttonSecondary} type="button" onClick={() => window.location.href="https://shopify.com/login"}>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#95bf47" stroke="none"><path d="M16.923 8.358c-.378-2.613-1.637-4.225-3.328-4.225-.262 0-.528.04-.79.117v-.118c0-2.28-1.565-4.132-3.488-4.132-1.922 0-3.488 1.852-3.488 4.132v2.301c-.815.176-1.583.56-2.183 1.13-.538.514-.848 1.144-1.026 1.77-.384 1.343-.274 3.12-.132 4.96.16 2.054.403 5.166.425 5.568.04 1.096.536 2.08 1.402 2.775.87.7 2.053 1.056 3.328 1.002.585-.025 1.15-.098 1.688-.216a6.993 6.993 0 0 0 2.65-.99c1.077-.665 1.727-1.42 1.95-2.257l.004-.015.003-.016.035-.119.043-.16.002-.01v-.002l.142-.516c.338-1.228 1.084-2.228 2.122-2.842a2.388 2.388 0 0 1 .442-.206c.928-.312 2.147-.282 3.25.076.62.203 1.2.49 1.716.852l.462-1.233c.31-1.393.428-3.385.424-5.323-.005-2.09-.133-4.108-.532-4.99-.214-.47-.565-.892-1.01-1.218-.63-.46-1.44-.66-2.11-.635m-5.462 6.556c-1.353-.162-2.138-.89-2.205-1.527-.067-.643.593-1.47 2.016-1.306 1.512.18 2.213 1.007 2.256 1.63.044.623-.557 1.38-2.067 1.203m1.406-3.84c-1.503-.18-2.906.185-3.167.822-.26.638.742 1.314 2.246 1.493 1.34.16 2.645-.078 2.925-.662.28-.586-.5-1.474-2.004-1.653m-3.55-5.918c0-1.642 1.07-2.977 2.385-2.977 1.264 0 2.298 1.23 2.382 2.784l-4.767-.57v.763" /></svg>
                Log in with Shopify
              </button>

              <div className={styles.secureText}>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                Secure login powered by Shopify
              </div>
            </Form>
          </div>
        )}

        <div className={styles.featuresContainer}>
          <div className={styles.featureCard}>
            <div className={styles.featureIconWrapper}>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 3v18h18"/><path d="M18 17V9"/><path d="M13 17V5"/><path d="M8 17v-3"/></svg>
            </div>
            <div className={styles.featureContent}>
              <h3 className={styles.featureTitle}>Visual Editor</h3>
              <p className={styles.featureDesc}>Drag and drop components to build beautiful pages without writing a single line of code.</p>
            </div>
          </div>
          <div className={styles.featureCard}>
            <div className={styles.featureIconWrapper}>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12.586 2.586A2 2 0 0 0 11.172 2H4a2 2 0 0 0-2 2v7.172a2 2 0 0 0 .586 1.414l8.704 8.704a2.426 2.426 0 0 0 3.42 0l6.58-6.58a2.426 2.426 0 0 0 0-3.42l-8.704-8.704z"/><circle cx="7.5" cy="7.5" r=".5" fill="currentColor"/></svg>
            </div>
            <div className={styles.featureContent}>
              <h3 className={styles.featureTitle}>High Converting</h3>
              <p className={styles.featureDesc}>Built-in templates designed using e-commerce best practices to maximize your sales.</p>
            </div>
          </div>
          <div className={styles.featureCard}>
            <div className={styles.featureIconWrapper}>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/></svg>
            </div>
            <div className={styles.featureContent}>
              <h3 className={styles.featureTitle}>Lightning Fast</h3>
              <p className={styles.featureDesc}>Pages are optimized for speed, ensuring your customers never wait to see your products.</p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
