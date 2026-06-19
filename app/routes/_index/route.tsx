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
            Design stunning, high-converting product pages effortlessly with our visual drag-and-drop editor.
          </p>
        </div>

        {showForm && (
          <div className={styles.formWrapper}>
            <h2 className={styles.formHeading}>Connect your store</h2>
            <Form className={styles.form} method="post" action="/auth/login">
              <label className={styles.label}>
                <span>Shop domain</span>
                <input 
                  className={styles.input} 
                  type="text" 
                  name="shop" 
                  placeholder="e.g: my-shop.myshopify.com"
                  required
                />
              </label>
              <button className={styles.button} type="submit">
                Log in
              </button>
            </Form>
          </div>
        )}

        <div className={styles.features}>
          <div className={styles.featureCard}>
            <span className={styles.featureIcon}>✨</span>
            <h3 className={styles.featureTitle}>Visual Editor</h3>
            <p className={styles.featureDesc}>Drag and drop components to build beautiful pages without writing a single line of code.</p>
          </div>
          <div className={styles.featureCard}>
            <span className={styles.featureIcon}>⚡</span>
            <h3 className={styles.featureTitle}>Lightning Fast</h3>
            <p className={styles.featureDesc}>Pages are optimized for speed, ensuring your customers never wait to see your products.</p>
          </div>
          <div className={styles.featureCard}>
            <span className={styles.featureIcon}>📈</span>
            <h3 className={styles.featureTitle}>High Converting</h3>
            <p className={styles.featureDesc}>Built-in templates designed using e-commerce best practices to maximize your sales.</p>
          </div>
        </div>

      </div>
    </div>
  );
}
