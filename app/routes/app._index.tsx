import type { LoaderFunctionArgs, LinksFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData, useNavigate } from "@remix-run/react";
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
            <button className="btn-secondary">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" fill="currentColor"/>
                <path fillRule="evenodd" clipRule="evenodd" d="M22 12c0 5.523-4.477 10-10 10S2 17.523 2 12 6.477 2 12 2s10 4.477 10 10zm-2 0a8 8 0 11-16 0 8 8 0 0116 0z" fill="currentColor"/>
              </svg>
              Watch Demo
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
          <button className="toggle-btn active">Monthly</button>
          <button className="toggle-btn">Yearly (Save 20%)</button>
        </div>
      </div>

      {/* Pricing Grid */}
      <div className="pricing-grid">
        {/* Free Plan */}
        <div className="pricing-card">
          <h3 className="plan-name">Free</h3>
          <div className="plan-price">$0 <span>/month</span></div>
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
          <div className="plan-price">$20 <span>/month</span></div>
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
          <div className="plan-price">$35 <span>/month</span></div>
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
          <div className="plan-price">$60 <span>/month</span></div>
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

      <div className="section-header" style={{marginTop: '0'}}>
        <h2 className="section-title">Dashboard Overview</h2>
      </div>

      {/* Stats Grid */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-header">
            <div className="stat-icon bg-green">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="3" y1="9" x2="21" y2="9"></line><line x1="9" y1="21" x2="9" y2="9"></line></svg>
            </div>
            <span className="stat-title">Total Templates</span>
          </div>
          <div className="stat-value">120</div>
          <div className="stat-growth">+ 12 this month</div>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <div className="stat-icon bg-orange">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
            </div>
            <span className="stat-title">Published Pages</span>
          </div>
          <div className="stat-value">28</div>
          <div className="stat-growth">+ 8 this month</div>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <div className="stat-icon bg-purple">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
            </div>
            <span className="stat-title">Total Views</span>
          </div>
          <div className="stat-value">15.6K</div>
          <div className="stat-growth">+ 24% this month</div>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <div className="stat-icon bg-pink">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21.21 15.89A10 10 0 1 1 8 2.83"></path><path d="M22 12A10 10 0 0 0 12 2v10z"></path></svg>
            </div>
            <span className="stat-title">Conversion Rate</span>
          </div>
          <div className="stat-value">3.42%</div>
          <div className="stat-growth">+ 0.8% this month</div>
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

        <div className="panel-card">
          <div className="panel-header">
            <h3 className="panel-title">Analytics Overview</h3>
            <select style={{padding: '6px 12px', border: '1px solid #E5E7EB', borderRadius: '6px', color: '#374151', fontSize: '13px'}}>
              <option>This Month</option>
              <option>Last Month</option>
            </select>
          </div>
          <div style={{height: '240px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F9FAFB', borderRadius: '8px', border: '1px dashed #D1D5DB'}}>
            <span style={{color: '#9CA3AF', fontSize: '14px'}}>Line Chart Graphic Here</span>
          </div>
        </div>
      </div>

    </div>
  );
}
