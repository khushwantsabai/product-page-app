import type { LoaderFunctionArgs, LinksFunction, ActionFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData, useNavigate, Link, Form } from "@remix-run/react";

import { authenticate } from "../shopify.server";
import db from "../db.server";
import dashboardStyles from "../styles/dashboard.css?url";

function formatRelativeTime(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - new Date(date).getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);
  if (diffMins < 60) return `${diffMins} minute${diffMins === 1 ? '' : 's'} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours === 1 ? '' : 's'} ago`;
  return `${diffDays} day${diffDays === 1 ? '' : 's'} ago`;
}

export const links: LinksFunction = () => {
  return [{ rel: "stylesheet", href: dashboardStyles }];
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const { session } = await authenticate.admin(request);
  const formData = await request.formData();
  const actionType = formData.get("actionType");
  const pageId = String(formData.get("pageId"));

  if (actionType === "delete" && pageId) {
    await db.productPage.delete({
      where: {
        id: pageId,
        shopId: session.shop,
      }
    });
    return json({ success: true });
  }

  if (actionType === "deleteAll") {
    await db.productPage.deleteMany({
      where: {
        shopId: session.shop,
      }
    });
    return json({ success: true });
  }

  if (actionType === "unpublish" && pageId) {
    await db.productPage.update({
      where: {
        id: pageId,
        shopId: session.shop,
      },
      data: {
        status: "Draft"
      }
    });
    return json({ success: true });
  }

  return json({ error: "Invalid action" }, { status: 400 });
};

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { session, admin } = await authenticate.admin(request);
  const shopId = session.shop;

  // Fetch active subscription from Shopify
  let activePlan = "Free";
  try {
    const response = await admin.graphql(`
      #graphql
      query ShopPlan {
        app {
          installation {
            activeSubscriptions {
              id
              name
              status
            }
          }
        }
      }
    `);
    const data = await response.json();
    const activeSubs = data.data?.app?.installation?.activeSubscriptions || [];
    if (activeSubs.length > 0) {
      activePlan = activeSubs[0].name;
    }
  } catch (error) {
    console.error("Failed to fetch active subscriptions:", error);
  }

  // Fetch real pages from DB
  const recentPages = await db.productPage.findMany({
    where: { shopId },
    orderBy: { updatedAt: "desc" },
    take: 5,
    select: {
      id: true,
      name: true,
      templateId: true,
      status: true,
      updatedAt: true,
    },
  });

  const pagesCreated = await db.productPage.count({ where: { shopId } });
  const pagesPublished = await db.productPage.count({ where: { shopId, status: { equals: "Published", mode: "insensitive" } } });

  return json({
    activePlan,
    merchantPlan: activePlan,
    pagesCreated,
    pagesPublished,
    recentPages: recentPages.map((p: { id: string; name: string; templateId: string; status: string; updatedAt: Date }) => ({
      id: p.id,
      name: p.name,
      template: p.templateId,
      status: p.status.toLowerCase() === "published" ? "Published" : "Draft",
      updated: formatRelativeTime(p.updatedAt),
    })),
  });
};

export default function Dashboard() {
  const { activePlan, recentPages } = useLoaderData<typeof loader>();
  const navigate = useNavigate();

  const getPlanDescription = (planName: string) => {
    switch(planName.toLowerCase()) {
      case 'premium':
        return 'Your Premium plan unlocks the ultimate page building experience with all customization options.';
      case 'standard':
        return 'Your Standard plan provides advanced split/stacked structures and live image backgrounds.';
      case 'basic':
        return 'Your Basic plan includes premium designs and advanced image & color controls.';
      default:
        return 'Your Free plan allows you to edit product text and build standard pages.';
    }
  };

  const getPlanTemplates = (planName: string) => {
    const plan = planName.toLowerCase();
    
    if (plan === 'premium') {
      return [{ name: '6 Templates Unlocked', color: '#92400E', bg: '#FEF3C7' }];
    }
    if (plan === 'standard') {
      return [{ name: '5 Templates Unlocked', color: '#5B21B6', bg: '#EDE9FE' }];
    }
    if (plan === 'basic') {
      return [{ name: '3 Templates Unlocked', color: '#065F46', bg: '#D1FAE5' }];
    }
    
    return [{ name: '3 Templates Unlocked', color: '#374151', bg: '#F3F4F6' }];
  };

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
          <div className="panel-header" style={{ marginBottom: '16px' }}>
            <h3 className="panel-title" style={{ fontSize: '18px', fontWeight: 'bold', color: '#111827' }}>Subscription Details</h3>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
            <span style={{ fontSize: '15px', color: '#374151' }}>Current Plan:</span>
            <span style={{ background: '#A7F3D0', color: '#065F46', padding: '4px 12px', fontSize: '13px', borderRadius: '8px', fontWeight: '500' }}>
              {activePlan}
            </span>
          </div>
          <p style={{ fontSize: '15px', color: '#4B5563', lineHeight: '1.5', marginBottom: '16px' }}>
            {getPlanDescription(activePlan)}
          </p>
          
          <div style={{ marginBottom: '24px' }}>
            <h4 style={{ fontSize: '14px', fontWeight: '600', color: '#111827', marginBottom: '10px' }}>Unlocked Templates:</h4>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {getPlanTemplates(activePlan).map(t => (
                <span key={t.name} style={{ background: t.bg, color: t.color, padding: '4px 10px', borderRadius: '6px', fontSize: '13px', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                  {t.name}
                </span>
              ))}
            </div>
          </div>
          <hr style={{ border: 'none', borderTop: '1px solid #E5E7EB', margin: '0 0 16px 0' }} />
          <button 
            className="plan-btn" 
            onClick={() => navigate('/app/plans')}
          >
            Change Plan
          </button>
        </div>

        <div className="panel-card">
          <div className="panel-header">
            <h3 className="panel-title">Recent Product Pages</h3>
            <div style={{ display: 'flex', gap: '12px' }}>
              <Form method="post" onSubmit={(e) => {
                if (!confirm('Are you sure you want to delete ALL templates? This cannot be undone.')) e.preventDefault();
              }}>
                <input type="hidden" name="actionType" value="deleteAll" />
                <button type="submit" style={{ background: 'none', border: '1px solid #EF4444', color: '#EF4444', cursor: 'pointer', fontSize: '13px', fontWeight: '500', padding: '6px 12px', borderRadius: '6px' }}>
                  Delete All
                </button>
              </Form>
              <Link to="/app/pages" className="view-all-link">+ New Page</Link>
            </div>
          </div>
          <div className="page-list">
            {recentPages.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '32px 0', color: '#9CA3AF' }}>
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ margin: '0 auto 12px' }}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                <p style={{ fontSize: '14px', fontWeight: '500', marginBottom: '4px' }}>No pages yet</p>
                <p style={{ fontSize: '13px' }}>Create your first product page to get started.</p>
              </div>
            ) : (
              recentPages.map((page: { id: string; name: string; template: string; status: string; updated: string }) => (
                <div className="page-item" key={page.id}>
                  <div className="page-info" style={{ flex: 1 }}>
                    <div className="page-thumb" style={{ background: '#F0FDF4', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#16A34A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                    </div>
                    <div>
                      <div className="page-name">{page.name}</div>
                      <div className="page-date" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span>Updated {page.updated}</span>
                      </div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div className={`status-badge ${page.status === 'Published' ? 'status-published' : 'status-draft'}`}>
                      {page.status}
                    </div>
                    {(page.status === 'Draft' || page.status === 'Published') && (
                      <Link to={`/app/editor/${page.id}`} style={{ textDecoration: 'none', color: '#4F46E5', fontSize: '14px', fontWeight: '500' }}>
                        Edit
                      </Link>
                    )}
                    {page.status === 'Published' && (
                      <Form method="post">
                        <input type="hidden" name="actionType" value="unpublish" />
                        <input type="hidden" name="pageId" value={page.id} />
                        <button type="submit" style={{ background: 'none', border: 'none', color: '#F59E0B', cursor: 'pointer', fontSize: '14px', fontWeight: '500' }}>
                          Unpublish
                        </button>
                      </Form>
                    )}
                    <Form method="post" onSubmit={(e) => {
                      if (!confirm('Are you sure you want to delete this page?')) e.preventDefault();
                    }}>
                      <input type="hidden" name="actionType" value="delete" />
                      <input type="hidden" name="pageId" value={page.id} />
                      <button type="submit" style={{ background: 'none', border: 'none', color: '#EF4444', cursor: 'pointer', fontSize: '14px', fontWeight: '500' }}>
                        Delete
                      </button>
                    </Form>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

    </div>
  );
}
