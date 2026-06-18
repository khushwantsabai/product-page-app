import type { LoaderFunctionArgs, LinksFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData, useNavigate } from "@remix-run/react";
import { useState } from "react";
import { authenticate } from "../shopify.server";
import dashboardStyles from "../styles/dashboard.css?url";

export const links: LinksFunction = () => {
  return [{ rel: "stylesheet", href: dashboardStyles }];
};

export const loader = async ({ request }: LoaderFunctionArgs) => {
  await authenticate.admin(request);
  
  // Dummy data for skeleton layout
  return json({
    merchantPlan: "Free",
    pagesCreated: 3,
    pagesPublished: 1,
    pageLimit: 5,
    recentPages: [
      { id: 1, name: "Wireless Headphones", template: "Modern Electronics", status: "Published", updated: "2 hours ago", image: "https://cdn.shopify.com/s/files/1/0533/2089/files/placeholder-images-product-5_large.png" },
      { id: 2, name: "Smart Watch Series 8", template: "Luxury Watch", status: "Published", updated: "1 day ago", image: "https://cdn.shopify.com/s/files/1/0533/2089/files/placeholder-images-product-6_large.png" },
      { id: 3, name: "Premium Serum", template: "Beauty Glow", status: "Draft", updated: "2 days ago", image: "https://cdn.shopify.com/s/files/1/0533/2089/files/placeholder-images-product-4_large.png" },
    ],
  });
};

export default function Dashboard() {
  const { merchantPlan, pagesCreated, pagesPublished, pageLimit, recentPages } = useLoaderData<typeof loader>();
  const navigate = useNavigate();
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');

  const getPrice = (monthly: number) => {
    if (monthly === 0) return '$0';
    if (billingCycle === 'yearly') return `$${Math.round(monthly * 0.8)}`;
    return `$${monthly}`;
  };
  const getPeriod = () => billingCycle === 'yearly' ? '/month, billed yearly' : '/month';

  return (
    <div className="dashboard-container">
      {/* Hero Banner */}
      <div className="hero-banner">
        <div className="hero-content">
          <h1 className="hero-title">
            Create High Converting <span className="hero-title-highlight">Product Pages</span> Without Coding
          </h1>
          <p className="hero-subtitle">
            Choose a template, customize every detail, and publish in one click.
          </p>
          <div className="hero-buttons">
            <button className="btn-primary" onClick={() => navigate("/app/templates")}>
              Browse Templates
            </button>
          </div>
        </div>
        <div className="hero-mockups">
          <img 
            src="https://cdn.shopify.com/s/files/1/0533/2089/files/placeholder-images-product-1_large.png" 
            alt="Product Mockups"
            style={{height: '100%', objectFit: 'contain', filter: 'drop-shadow(0 20px 13px rgba(0,0,0,0.15))'}}
            onError={(e) => e.currentTarget.style.display = 'none'}
          />
        </div>
      </div>

      {/* Plan Header */}
      <div className="section-header">
        <h2 className="section-title">Choose Your Plan</h2>
        <div className="toggle-container">
          <button
            className={`toggle-btn ${billingCycle === 'monthly' ? 'active' : ''}`}
            onClick={() => setBillingCycle('monthly')}
          >Monthly</button>
          <button
            className={`toggle-btn ${billingCycle === 'yearly' ? 'active' : ''}`}
            onClick={() => setBillingCycle('yearly')}
          >Yearly (Save 20%)</button>
        </div>
      </div>

      {/* Pricing Grid */}
      <div className="pricing-grid">
        {/* Free Plan */}
        <div className="pricing-card">
          <h3 className="plan-name">Free</h3>
          <div className="plan-price">{getPrice(0)} <span>{getPeriod()}</span></div>
          <p className="plan-desc">Perfect for getting started</p>
          <ul className="features-list">
            <li className="feature-item"><span className="feature-check">✓</span> 3 Free Templates</li>
            <li className="feature-item"><span className="feature-check">✓</span> Basic Features</li>
            <li className="feature-item"><span className="feature-check">✓</span> Edit Product Text Only</li>
            <li className="feature-item"><span className="feature-check">✓</span> Responsive Design</li>
          </ul>
          <button className="plan-btn" onClick={() => navigate('/app/plans')}>Choose Free</button>
        </div>

        {/* Basic Plan */}
        <div className="pricing-card">
          <h3 className="plan-name" style={{color: '#16A34A'}}>Basic</h3>
          <div className="plan-price">{getPrice(39)} <span>{getPeriod()}</span></div>
          <p className="plan-desc">Best for small stores</p>
          <ul className="features-list">
            <li className="feature-item"><span className="feature-check">✓</span> 15+ Premium Templates</li>
            <li className="feature-item"><span className="feature-check">✓</span> 2 Template Types</li>
            <li className="feature-item"><span className="feature-check">✓</span> Advanced Customization</li>
            <li className="feature-item"><span className="feature-check">✓</span> Image & Color Control</li>
            <li className="feature-item"><span className="feature-check">✓</span> Priority Support</li>
          </ul>
          <button className="plan-btn btn-green" onClick={() => navigate('/app/plans')}>Upgrade to Basic</button>
        </div>

        {/* Standard Plan */}
        <div className="pricing-card standard-border">
          <h3 className="plan-name" style={{color: '#8B5CF6'}}>Standard</h3>
          <div className="plan-price">{getPrice(69)} <span>{getPeriod()}</span></div>
          <p className="plan-desc">Best for growing stores</p>
          <ul className="features-list">
            <li className="feature-item"><span className="feature-check">✓</span> 35+ Premium Templates</li>
            <li className="feature-item"><span className="feature-check">✓</span> Advanced Styling</li>
            <li className="feature-item"><span className="feature-check">✓</span> Reviews & Ratings</li>
            <li className="feature-item"><span className="feature-check">✓</span> Delivery & Stock Info</li>
            <li className="feature-item"><span className="feature-check">✓</span> Premium Support</li>
          </ul>
          <button className="plan-btn btn-purple" onClick={() => navigate('/app/plans')}>Upgrade to Standard</button>
        </div>

        {/* Premium Plan */}
        <div className="pricing-card premium-border">
          <div className="best-value-badge">Best Value</div>
          <h3 className="plan-name" style={{color: '#F59E0B'}}>Premium</h3>
          <div className="plan-price">{getPrice(99)} <span>{getPeriod()}</span></div>
          <p className="plan-desc">Best for high volume stores</p>
          <ul className="features-list">
            <li className="feature-item"><span className="feature-check">✓</span> Unlimited Templates</li>
            <li className="feature-item"><span className="feature-check">✓</span> Video & 360 Gallery</li>
            <li className="feature-item"><span className="feature-check">✓</span> Volume Discounts</li>
            <li className="feature-item"><span className="feature-check">✓</span> Related Products</li>
            <li className="feature-item"><span className="feature-check">✓</span> All Customization Features</li>
            <li className="feature-item"><span className="feature-check">✓</span> 24/7 Priority Support</li>
          </ul>
          <button className="plan-btn btn-yellow" onClick={() => navigate('/app/plans')}>Upgrade to Premium</button>
        </div>
      </div>



      {/* Bottom Split */}
      <div className="split-grid">
        <div className="panel-card">
          <div className="panel-header">
            <h3 className="panel-title">Recent Product Pages</h3>
            <a href="#" className="view-all-link">View All</a>
          </div>
          <div className="page-list">
            {recentPages.map((page) => (
              <div className="page-item" key={page.id}>
                <div className="page-info">
                  <div className="page-thumb">
                    <img src={page.image} alt={page.name} />
                  </div>
                  <div>
                    <div className="page-name">{page.name}</div>
                    <div className="page-date">Updated {page.updated}</div>
                  </div>
                </div>
                <div className={`status-badge ${page.status === 'Published' ? 'status-published' : 'status-draft'}`}>
                  {page.status}
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
}
