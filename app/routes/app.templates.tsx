import type { ActionFunctionArgs, LoaderFunctionArgs, LinksFunction } from "@remix-run/node";
import { redirect, json } from "@remix-run/node";
import { Form, useLoaderData, useNavigate } from "@remix-run/react";
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
  const { session } = await authenticate.admin(request);
  
  const activeSub = await prisma.subscription.findFirst({
    where: { shopId: session.shop, status: "active" }
  });

  const activePlan = activeSub?.planId?.toLowerCase() || "free";
  return json({ activePlan });
};

const PLAN_LEVELS: Record<string, number> = {
  free: 0,
  basic: 1,
  standard: 2,
  premium: 3
};

export default function Templates() {
  const { activePlan } = useLoaderData<typeof loader>();
  const navigate = useNavigate();

  const templates = [
    { id: '1', name: "Minimal Clean", plan: "Free", brand: "free", image: "https://cdn.shopify.com/s/files/1/0533/2089/files/placeholder-images-product-5_large.png" },
    { id: '2', name: "Modern Electronics", plan: "Basic", brand: "basic", image: "https://cdn.shopify.com/s/files/1/0533/2089/files/placeholder-images-product-6_large.png" },
    { id: '5', name: "Fashion Store", plan: "Basic", brand: "basic", image: "https://cdn.shopify.com/s/files/1/0533/2089/files/placeholder-images-collection-3_large.png" },
    { id: '3', name: "Luxury Watch", plan: "Standard", brand: "standard", image: "https://cdn.shopify.com/s/files/1/0533/2089/files/placeholder-images-product-2_large.png" },
    { id: '6', name: "Sporty Shoes", plan: "Standard", brand: "standard", image: "https://cdn.shopify.com/s/files/1/0533/2089/files/placeholder-images-product-1_large.png" },
    { id: '4', name: "Beauty Glow", plan: "Premium", brand: "premium", image: "https://cdn.shopify.com/s/files/1/0533/2089/files/placeholder-images-product-4_large.png" },
  ];

  return (
    <div className="templates-container">
      <div className="templates-header">
        <div>
          <h1 className="templates-title">All Templates</h1>
          <p className="templates-subtitle">Choose a template and start customizing</p>
        </div>
        <button className="templates-top-btn">View My Templates</button>
      </div>

      <div className="filters-bar">
        <div className="search-bar">
          <svg className="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
          <input type="text" placeholder="Search templates..." />
        </div>
        <select className="dropdown-select">
          <option>All Categories</option>
          <option>Product Pages</option>
          <option>Landing Pages</option>
        </select>
        <select className="dropdown-select">
          <option>All Plans</option>
          <option>Free</option>
          <option>Premium</option>
        </select>
      </div>

      <div className="categories-scroll">
        <button className="category-pill active">All</button>
        <button className="category-pill">Minimal</button>
        <button className="category-pill">Fashion</button>
        <button className="category-pill">Electronics</button>
        <button className="category-pill">Beauty</button>
        <button className="category-pill">Furniture</button>
        <button className="category-pill">Luxury</button>
        <button className="category-pill">More</button>
      </div>

      <div className="templates-grid">
        {templates.map((tpl) => (
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
                     style={{width: '100%', background: '#F3F4F6', color: '#9CA3AF', cursor: 'not-allowed', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px'}}
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
        ))}
      </div>
    </div>
  );
}
