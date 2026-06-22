import type { ActionFunctionArgs, LoaderFunctionArgs, LinksFunction } from "@remix-run/node";
import { redirect, json } from "@remix-run/node";
import { Form, useLoaderData, useNavigate } from "@remix-run/react";
import { useState, useEffect } from "react";
import templatesStyles from "../styles/templates.css?url";
import { authenticate } from "../shopify.server";
import prisma from "../db.server";

export const links: LinksFunction = () => {
  return [{ rel: "stylesheet", href: templatesStyles }];
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const { session } = await authenticate.admin(request);
  const formData = await request.formData();
  const templateId = String(formData.get("templateId"));
  const templateName = String(formData.get("templateName"));
  
  // Create a new draft page in the database
  const newPage = await prisma.productPage.create({
    data: {
      shopId: session.shop,
      templateId: templateId,
      planId: "free", // Defaulting to free plan for now
      name: `Untitled ${templateName}`,
      status: "Draft",
      settings: JSON.stringify({
        sections: [
          { id: "hero", type: "product-hero", settings: { showTitle: true, showPrice: true } }
        ]
      })
    }
  });

  // Redirect cleanly into the rich visual editor
  return redirect(`/app/editor/${newPage.id}`);
};

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { admin, session } = await authenticate.admin(request);
  
  // Query Shopify for active subscriptions
  const response = await admin.graphql(`
    query {
      app {
        installation {
          activeSubscriptions {
            name
            status
          }
        }
      }
    }
  `);
  
  const responseJson = await response.json();
  const activeSubscriptions = responseJson.data?.app?.installation?.activeSubscriptions || [];
  const activeSub = activeSubscriptions.find((sub: any) => sub.status === "ACTIVE");
  
  let activePlan = "free";
  if (activeSub && activeSub.name) {
    if (activeSub.name.toLowerCase().includes("basic")) activePlan = "basic";
    if (activeSub.name.toLowerCase().includes("standard")) activePlan = "standard";
    if (activeSub.name.toLowerCase().includes("premium")) activePlan = "premium";
  }

  const url = new URL(request.url);
  const chargeId = url.searchParams.get("charge_id");

  return json({ activePlan, chargeId });
};

const PLAN_LEVELS: Record<string, number> = {
  free: 0,
  basic: 1,
  standard: 2,
  premium: 3
};

export default function Templates() {
  const { activePlan, chargeId } = useLoaderData<typeof loader>();
  const navigate = useNavigate();

  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedPlan, setSelectedPlan] = useState("All Plans");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (chargeId) {
      window.shopify?.toast?.show("Plan activated successfully!");
      // Remove charge_id from URL without refreshing
      const url = new URL(window.location.href);
      url.searchParams.delete('charge_id');
      window.history.replaceState({}, '', url.toString());
    }
  }, [chargeId]);

  const templates = [
    { id: '1', name: "Minimal Clean", plan: "Free", brand: "free", image: "https://cdn.shopify.com/s/files/1/0533/2089/files/placeholder-images-product-5_large.png", categories: ["Minimal", "Furniture"] },
    { id: '2', name: "Modern Electronics", plan: "Basic", brand: "basic", image: "https://cdn.shopify.com/s/files/1/0533/2089/files/placeholder-images-product-6_large.png", categories: ["Electronics"] },
    { id: '5', name: "Fashion Store", plan: "Basic", brand: "basic", image: "https://cdn.shopify.com/s/files/1/0533/2089/files/placeholder-images-collection-3_large.png", categories: ["Fashion"] },
    { id: '3', name: "Luxury Watch", plan: "Standard", brand: "standard", image: "https://cdn.shopify.com/s/files/1/0533/2089/files/placeholder-images-product-2_large.png", categories: ["Luxury", "Electronics"] },
    { id: '6', name: "Sporty Shoes", plan: "Standard", brand: "standard", image: "https://cdn.shopify.com/s/files/1/0533/2089/files/placeholder-images-product-1_large.png", categories: ["Fashion"] },
    { id: '4', name: "Beauty Glow", plan: "Premium", brand: "premium", image: "https://cdn.shopify.com/s/files/1/0533/2089/files/placeholder-images-product-4_large.png", categories: ["Beauty"] },
  ];

  const filteredTemplates = templates.filter((tpl) => {
    const matchesSearch = tpl.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "All" || tpl.categories.includes(selectedCategory);
    
    let matchesPlan = true;
    if (selectedPlan !== "All Plans") {
      matchesPlan = tpl.brand.toLowerCase() === selectedPlan.toLowerCase();
    }
    
    return matchesSearch && matchesCategory && matchesPlan;
  });

  return (
    <div className="templates-container">
      <div className="templates-header">
        <div>
          <h1 className="templates-title">All Templates</h1>
          <p className="templates-subtitle">Choose a template and start customizing</p>
        </div>
        <button className="templates-top-btn" onClick={() => navigate('/app')}>View My Templates</button>
      </div>

      <div className="filters-bar">
        <div className="search-bar">
          <svg className="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
          <input 
            type="text" 
            placeholder="Search templates..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <select 
          className="dropdown-select"
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
        >
          <option value="All">All Categories</option>
          <option value="Minimal">Minimal</option>
          <option value="Fashion">Fashion</option>
          <option value="Electronics">Electronics</option>
          <option value="Beauty">Beauty</option>
          <option value="Furniture">Furniture</option>
          <option value="Luxury">Luxury</option>
        </select>
        <select 
          className="dropdown-select"
          value={selectedPlan}
          onChange={(e) => setSelectedPlan(e.target.value)}
        >
          <option value="All Plans">All Plans</option>
          <option value="Free">Free</option>
          <option value="Basic">Basic</option>
          <option value="Standard">Standard</option>
          <option value="Premium">Premium</option>
        </select>
      </div>

      <div className="categories-scroll">
        {["All", "Minimal", "Fashion", "Electronics", "Beauty", "Furniture", "Luxury"].map((cat) => (
          <button 
            key={cat} 
            className={`category-pill ${selectedCategory === cat ? 'active' : ''}`}
            onClick={() => setSelectedCategory(cat)}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="templates-grid">
        {filteredTemplates.length > 0 ? (
          filteredTemplates.map((tpl) => (
            <div className="template-card" key={tpl.id}>
              <div className="template-image-wrapper">
                <div className={`template-badge badge-${tpl.brand}`}>{tpl.plan}</div>
                <img src={tpl.image} alt={tpl.name} />
              </div>
              <div className="template-body">
                <div className="template-name">{tpl.name}</div>
                <div className="template-actions">
                  <button 
                    type="button"
                    className="action-btn btn-preview"
                    onClick={() => navigate(`/app/editor/preview-${tpl.id}`)}
                  >Preview</button>
                  
                  {PLAN_LEVELS[tpl.brand] > PLAN_LEVELS[activePlan] ? (
                     <button 
                       type="button" 
                       className="action-btn" 
                       style={{width: '100%', background: '#F3F4F6', color: '#9CA3AF', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px'}}
                       onClick={() => navigate('/app/plans')}
                     >
                       🔒 Upgrade Plan
                     </button>
                  ) : (
                    <Form method="post" style={{flex: 1, display: 'flex'}}>
                      <input type="hidden" name="templateId" value={tpl.id} />
                      <input type="hidden" name="templateName" value={tpl.name} />
                      <button type="submit" className={`action-btn ${tpl.brand === 'free' ? 'btn-use-green' : tpl.brand === 'premium' ? 'btn-use-yellow' : 'btn-use'}`} style={{width: '100%'}}>
                        Use Template
                      </button>
                    </Form>
                  )}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div style={{ 
            gridColumn: '1 / -1', 
            textAlign: 'center', 
            padding: '48px 24px', 
            background: 'white', 
            borderRadius: '12px',
            border: '1px solid #E5E7EB',
            boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
            marginTop: '20px'
          }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>🔍</div>
            <h3 style={{ fontSize: '18px', fontWeight: 600, color: '#111827', marginBottom: '8px' }}>No Templates Found</h3>
            <p style={{ fontSize: '14px', color: '#6B7280', marginBottom: '20px' }}>We couldn't find any templates matching your search or filters.</p>
            <button 
              onClick={() => {
                setSearchQuery("");
                setSelectedCategory("All");
                setSelectedPlan("All Plans");
              }}
              style={{
                padding: '8px 16px',
                background: '#16A34A',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              Clear All Filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
