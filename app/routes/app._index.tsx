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
          <div style={{ marginBottom: "1rem" }}>
            <img src="/logo.png" alt="Pagecraft Builder" style={{ height: "60px", objectFit: "contain" }} />
          </div>
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
