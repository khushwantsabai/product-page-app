import type { MetaFunction } from "@remix-run/node";

export const meta: MetaFunction = () => {
  return [
    { title: "Privacy Policy | Pagecraft Product Builder" },
    { name: "description", content: "Privacy Policy for the Pagecraft Product Builder app." },
  ];
};

export default function Privacy() {
  return (
    <div style={{
      fontFamily: "system-ui, -apple-system, sans-serif",
      lineHeight: "1.6",
      color: "#333",
      maxWidth: "800px",
      margin: "0 auto",
      padding: "3rem 2rem"
    }}>
      <h1 style={{ fontSize: "2.5rem", marginBottom: "0.5rem", fontWeight: "bold" }}>Privacy Policy</h1>
      <p style={{ color: "#666", marginBottom: "2rem" }}>Last Updated: {new Date().toLocaleDateString()}</p>

      <section style={{ marginBottom: "2rem" }}>
        <h2 style={{ fontSize: "1.5rem", marginBottom: "1rem", fontWeight: "600" }}>1. Introduction</h2>
        <p>
          Welcome to Pagecraft Product Builder. We respect your privacy and are committed to protecting your personal data. 
          This privacy policy will inform you as to how we look after your personal data when you use our application and tell you about your privacy rights.
        </p>
      </section>

      <section style={{ marginBottom: "2rem" }}>
        <h2 style={{ fontSize: "1.5rem", marginBottom: "1rem", fontWeight: "600" }}>2. Data We Collect</h2>
        <p style={{ marginBottom: "0.5rem" }}>
          When you install and use the App, we are automatically able to access certain types of information from your Shopify account:
        </p>
        <ul style={{ paddingLeft: "1.5rem", listStyleType: "disc" }}>
          <li style={{ marginBottom: "0.5rem" }}><strong>Store contact information:</strong> We use this to communicate with you about your account and provide support.</li>
          <li style={{ marginBottom: "0.5rem" }}><strong>Product and inventory data:</strong> Required for the app to function and allow you to configure products.</li>
          <li style={{ marginBottom: "0.5rem" }}><strong>Theme data:</strong> To inject snippets and render custom pages correctly within your storefront.</li>
        </ul>
      </section>

      <section style={{ marginBottom: "2rem" }}>
        <h2 style={{ fontSize: "1.5rem", marginBottom: "1rem", fontWeight: "600" }}>3. How We Use Your Data</h2>
        <p style={{ marginBottom: "0.5rem" }}>We use the collected information for the following purposes:</p>
        <ul style={{ paddingLeft: "1.5rem", listStyleType: "disc" }}>
          <li style={{ marginBottom: "0.5rem" }}>To provide and maintain our Service</li>
          <li style={{ marginBottom: "0.5rem" }}>To notify you about changes to our Service</li>
          <li style={{ marginBottom: "0.5rem" }}>To provide customer support</li>
          <li style={{ marginBottom: "0.5rem" }}>To gather analysis or valuable information so that we can improve our Service</li>
        </ul>
      </section>

      <section style={{ marginBottom: "2rem" }}>
        <h2 style={{ fontSize: "1.5rem", marginBottom: "1rem", fontWeight: "600" }}>4. Data Security</h2>
        <p>
          We have put in place appropriate security measures to prevent your personal data from being accidentally lost, used, or accessed in an unauthorized way, altered, or disclosed.
          However, please remember that no method of transmission over the internet, or method of electronic storage is 100% secure.
        </p>
      </section>

      <section style={{ marginBottom: "2rem" }}>
        <h2 style={{ fontSize: "1.5rem", marginBottom: "1rem", fontWeight: "600" }}>5. Contact Us</h2>
        <p>
          If you have any questions about this Privacy Policy, please contact us at support@pagecraft.com.
        </p>
      </section>
    </div>
  );
}
