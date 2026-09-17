import type { LoaderFunctionArgs } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import { Form, useLoaderData, useNavigation } from "@remix-run/react";
import { useState, useRef, useEffect } from "react";
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
  const navigation = useNavigation();

  // State management
  const [shop, setShop] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isLocallySubmitting, setIsLocallySubmitting] = useState(false);
  const [parallax, setParallax] = useState({ x: 0, y: 0 });

  const containerRef = useRef<HTMLDivElement>(null);
  const isNavigating = navigation.state === "submitting" || navigation.state === "loading";
  const isLoading = isLocallySubmitting || isNavigating;

  // Mouse Parallax Calculation
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (window.innerWidth < 768) return; // Disable parallax on mobile
    if (!containerRef.current) return;
    
    const rect = containerRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    const mouseX = (e.clientX - centerX) / (rect.width / 2);
    const mouseY = (e.clientY - centerY) / (rect.height / 2);
    
    setParallax({
      x: Math.min(Math.max(mouseX * 12, -12), 12),
      y: Math.min(Math.max(mouseY * 12, -12), 12)
    });
  };

  const handleMouseLeave = () => {
    setParallax({ x: 0, y: 0 });
  };

  // Validation & Form Submission
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    setErrorMessage("");
    const trimmedShop = shop.trim();

    if (!trimmedShop) {
      e.preventDefault();
      setErrorMessage("Please enter your Shopify store domain");
      return;
    }

    // Basic domain validation
    if (!trimmedShop.includes(".") && !trimmedShop.includes("myshopify")) {
      // Auto append .myshopify.com if single word
      setShop(`${trimmedShop}.myshopify.com`);
    }

    setIsLocallySubmitting(true);
  };

  return (
    <div 
      className={styles.pageContainer} 
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {/* Background Decorative Graphics */}
      <div className={styles.bgGraphics}>
        <div className={styles.blob1} />
        <div className={styles.blob2} />
        <div className={styles.dotGridTL} />
        <div className={styles.dotGridTR} />
        <div className={styles.dotGridBR} />
      </div>

      <div className={styles.contentGrid}>
        
        {/* LEFT SIDE - PROMOTIONAL HERO & INTERACTIVE MOCKUP */}
        <div className={styles.heroSection}>
          
          {/* Logo Brand Header */}
          <div className={styles.brandHeader}>
            <img 
              src="/logo.png?v=4" 
              alt="Pagecraft Product Builder Logo" 
              className={styles.brandLogo} 
            />
            <div className={styles.brandTitleGroup}>
              <span className={styles.brandName}>Pagecraft</span>
              <span className={styles.brandSub}>Product Builder</span>
            </div>
          </div>

          {/* Hero Typography */}
          <div className={styles.heroContent}>
            <h1 className={styles.headline}>
              Create Stunning <br />
              <span className={styles.highlightText}>Product Pages</span> with Ease
            </h1>
            <p className={styles.subtitle}>Customize. Design. Sell.</p>
            <p className={styles.description}>
              Build high-converting product pages that bring more customers to your store.
            </p>
          </div>

          {/* Visual Area: Features List + Floating Product Mockup */}
          <div className={styles.heroVisualWrapper}>
            
            {/* 3 Staggered Features */}
            <div className={styles.featuresList}>
              
              <div className={styles.featureItem}>
                <div className={styles.featureIconCircle}>
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
                </div>
                <div className={styles.featureTextGroup}>
                  <h3 className={styles.featureTitle}>Edit Images & Text</h3>
                  <p className={styles.featureSubtitle}>Make it yours in minutes</p>
                </div>
              </div>

              <div className={styles.featureItem}>
                <div className={styles.featureIconCircle}>
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="13.5" cy="6.5" r=".5" fill="currentColor"/><circle cx="17.5" cy="10.5" r=".5" fill="currentColor"/><circle cx="8.5" cy="7.5" r=".5" fill="currentColor"/><circle cx="6.5" cy="12.5" r=".5" fill="currentColor"/><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.92 0 1.7-.71 1.7-1.63 0-.44-.18-.85-.46-1.16-.3-.32-.46-.74-.46-1.21 0-.92.78-1.63 1.7-1.63h2.32c3.1 0 5.7-2.6 5.7-5.7 0-4.81-4.7-8.67-10.5-8.67z"/></svg>
                </div>
                <div className={styles.featureTextGroup}>
                  <h3 className={styles.featureTitle}>Customize Design</h3>
                  <p className={styles.featureSubtitle}>Colors, layout and more</p>
                </div>
              </div>

              <div className={styles.featureItem}>
                <div className={styles.featureIconCircle}>
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
                </div>
                <div className={styles.featureTextGroup}>
                  <h3 className={styles.featureTitle}>Boost Sales</h3>
                  <p className={styles.featureSubtitle}>Better pages. Higher conversions.</p>
                </div>
              </div>

            </div>

            {/* Product Page Mockup & Floating Badges */}
            <div className={styles.mockupArea}>
              
              <div 
                className={styles.mockupWrapper}
                style={{
                  transform: `translate3d(${parallax.x * 0.8}px, ${parallax.y * 0.8}px, 0)`
                }}
              >
                
                {/* 4 Floating Badges */}
                <div 
                  className={`${styles.floatingBadge} ${styles.badgeTopRight}`}
                  style={{ transform: `translate3d(${parallax.x * 1.2}px, ${parallax.y * 1.2}px, 0)` }}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                </div>

                <div 
                  className={`${styles.floatingBadge} ${styles.badgeLeft}`}
                  style={{ transform: `translate3d(${parallax.x * -1.1}px, ${parallax.y * -1.1}px, 0)` }}
                >
                  T
                </div>

                <div 
                  className={`${styles.floatingBadge} ${styles.badgeBottomLeft}`}
                  style={{ transform: `translate3d(${parallax.x * 1.3}px, ${parallax.y * 1.3}px, 0)` }}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m19 11-8-8-8.6 8.6a2 2 0 0 0 0 2.8l5.2 5.2c.8.8 2 .8 2.8 0L19 11Z"/><path d="m5 2 5 5"/><path d="M2 13h15"/><path d="M22 20a2 2 0 1 1-4 0c0-1.6 1.7-2.4 2-4 .3 1.6 2 2.4 2 4Z"/></svg>
                </div>

                <div 
                  className={`${styles.floatingBadge} ${styles.badgeBottomRight}`}
                  style={{ transform: `translate3d(${parallax.x * -0.9}px, ${parallax.y * -0.9}px, 0)` }}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1Z"/></svg>
                </div>

                {/* Curved Arrow Vector Graphic */}
                <svg className={styles.curvedArrowSVG} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M10 80 C 40 10, 80 10, 90 40" stroke="#16a34a" strokeWidth="2" strokeDasharray="4 4" fill="none" />
                  <polygon points="90,40 82,32 94,30" fill="#16a34a" />
                </svg>

                {/* Main Product Card Mockup */}
                <div className={styles.mockupCard}>
                  
                  {/* Browser Top Bar */}
                  <div className={styles.mockupHeader}>
                    <div className={styles.dotRed} />
                    <div className={styles.dotYellow} />
                    <div className={styles.dotGreen} />
                  </div>

                  {/* Body Gallery & Image */}
                  <div className={styles.mockupBody}>
                    <div className={styles.mockupGallery}>
                      <div className={`${styles.mockupThumb} ${styles.mockupThumbActive}`}>
                        <img src="/mockup_sneaker.png" alt="Sneaker thumb" />
                      </div>
                      <div className={styles.mockupThumb}>
                        <img src="/mockup_sneaker.png" alt="Sneaker thumb 2" />
                      </div>
                      <div className={styles.mockupThumb}>
                        <img src="/mockup_sneaker.png" alt="Sneaker thumb 3" />
                      </div>
                    </div>

                    <div className={styles.mockupMainImage}>
                      <img src="/mockup_sneaker.png" alt="Pagecraft Sneaker Mockup" />
                    </div>
                  </div>

                  {/* Product Details & Actions */}
                  <div className={styles.mockupDetails}>
                    <div className={styles.mockupTitleRow}>
                      <div className={styles.mockupTitleSkeleton} />
                      <span className={styles.mockupPrice}>$79.00</span>
                    </div>

                    <div className={styles.mockupOptionsRow}>
                      <div className={styles.mockupColors}>
                        <div className={styles.colorCircle1} />
                        <div className={styles.colorCircle2} />
                        <div className={styles.colorCircle3} />
                      </div>

                      <div className={styles.mockupQty}>
                        <span>-</span>
                        <span>1</span>
                        <span>+</span>
                      </div>
                    </div>

                    <div className={styles.mockupActions}>
                      <button className={styles.btnAddToCart} type="button">Add to Cart</button>
                      <button className={styles.btnShopNow} type="button">Shop Now</button>
                    </div>
                  </div>

                </div>

              </div>

            </div>

          </div>

          {/* Handwritten Cursive Text */}
          <div className={styles.cursiveCallout}>
            Your Product. Your Style.
          </div>

        </div>

        {/* RIGHT SIDE - PREMIUM SAAS LOGIN CARD */}
        <div className={styles.loginSection}>
          
          <div className={styles.loginCard}>
            
            {/* Header inside Card */}
            <div className={styles.loginHeader}>
              <div className={styles.loginLogoContainer}>
                <img 
                  src="/logo.png?v=4" 
                  alt="Pagecraft Builder" 
                  className={styles.loginLogoImg} 
                />
              </div>
              <h2 className={styles.loginTitle}>Welcome Back 👋</h2>
              <p className={styles.loginSubtitle}>
                Log in to your account and manage your store
              </p>
            </div>

            {/* Form */}
            {showForm && (
              <Form 
                className={styles.loginForm} 
                method="post" 
                action="/auth/login"
                onSubmit={handleSubmit}
              >
                <div className={styles.fieldGroup}>
                  <label htmlFor="shop-domain" className={styles.fieldLabel}>
                    Shop domain
                  </label>
                  
                  <div className={styles.inputWrapper}>
                    <div className={styles.inputStoreIcon}>
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m2 7 4.41-4.41A2 2 0 0 1 7.83 2h8.34a2 2 0 0 1 1.42.59L22 7"/><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><path d="M15 22v-4a2 2 0 0 0-2-2h-2a2 2 0 0 0-2 2v4"/><path d="M2 7h20"/><path d="M22 7v3a2 2 0 0 1-2 2v0a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 16 12a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 12 12a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 8 12a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 4 12v0a2 2 0 0 1-2-2V7"/></svg>
                    </div>
                    
                    <input 
                      id="shop-domain"
                      className={`${styles.shopInput} ${errorMessage ? styles.errorInput : ''}`} 
                      type="text" 
                      name="shop" 
                      value={shop}
                      onChange={(e) => {
                        setShop(e.target.value);
                        if (errorMessage) setErrorMessage("");
                      }}
                      placeholder="my-shop-domain.myshopify.com"
                      required
                      disabled={isLoading}
                    />
                  </div>

                  {errorMessage ? (
                    <div className={styles.errorMessage}>
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                      {errorMessage}
                    </div>
                  ) : (
                    <span className={styles.helperText}>Enter your Shopify store domain</span>
                  )}
                </div>

                <button 
                  className={styles.submitButton} 
                  type="submit"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <div className={styles.spinner} />
                      <span>Logging in...</span>
                    </>
                  ) : (
                    <>
                      <span>Log In</span>
                      <div className={styles.buttonArrow}>
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
                      </div>
                    </>
                  )}
                </button>

                <div className={styles.divider}>
                  <div className={styles.dividerLine} />
                  <span className={styles.dividerText}>OR</span>
                  <div className={styles.dividerLine} />
                </div>

                <div className={styles.secureFooter}>
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                  <span>Secure login powered by Shopify</span>
                </div>

              </Form>
            )}

          </div>

        </div>

      </div>
    </div>
  );
}
