import { json, type LoaderFunctionArgs, type LinksFunction } from "@remix-run/node";
import { useLoaderData, useNavigate } from "@remix-run/react";
import editorStyles from "../styles/editor.css?url";
import { authenticate } from "../shopify.server";
import prisma from "../db.server";

export const links: LinksFunction = () => {
  return [{ rel: "stylesheet", href: editorStyles }];
};

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  const { session } = await authenticate.admin(request);
  const pageId = params.id;
  
  if (!pageId) throw new Error("Page ID required");

  const [page, activeSub] = await Promise.all([
    prisma.productPage.findUnique({ where: { id: pageId } }),
    prisma.subscription.findFirst({ where: { shopId: session.shop, status: "active" } })
  ]);

  const activePlan = activeSub?.planId?.toLowerCase() || "free";

  return json({
    page: page || { name: "Untitled Product Page", id: pageId },
    activePlan
  });
};

const PLAN_LEVELS: Record<string, number> = {
  free: 0,
  basic: 1,
  standard: 2,
  premium: 3
};

export default function Editor() {
  const { page, activePlan } = useLoaderData<typeof loader>();
  const navigate = useNavigate();

  return (
    <div className="editor-container">
      {/* Top Bar */}
      <div className="editor-topbar">
        <div className="topbar-left">
          <button className="back-btn" onClick={() => navigate("/app")}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="19" y1="12" x2="5" y2="12"></line>
              <polyline points="12 19 5 12 12 5"></polyline>
            </svg>
          </button>
          <input type="text" className="page-title-input" defaultValue={page.name} />
        </div>
        
        <div className="topbar-center">
          <button className="device-btn active">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect><line x1="8" y1="21" x2="16" y2="21"></line><line x1="12" y1="17" x2="12" y2="21"></line></svg>
          </button>
          <button className="device-btn">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="5" y="2" width="14" height="20" rx="2" ry="2"></rect><line x1="12" y1="18" x2="12.01" y2="18"></line></svg>
          </button>
        </div>

        <div className="topbar-right">
          <button className="btn-outline">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{marginRight: '6px', verticalAlign: 'text-bottom'}}>
              <polyline points="1 4 1 10 7 10"></polyline>
              <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"></path>
            </svg>
            Undo
          </button>
          <button className="btn-outline">Save Draft</button>
          <button className="btn-solid">Publish</button>
        </div>
      </div>

      <div className="editor-workspace">
        {/* Left Sidebar */}
        <div className="sidebar-left">
          <div className="sidebar-header">Add Section</div>
          <div className="section-list">
            <div className="section-item">
              <span className="section-icon">📦</span> Product Information
            </div>
            <div className="section-item">
              <span className="section-icon">🖼️</span> Product Images
            </div>
            <div className="section-item active">
              <span className="section-icon">T</span> Product Title
            </div>
            <div className="section-item">
              <span className="section-icon">💲</span> Price
            </div>
            <div className="section-item">
              <span className="section-icon">📝</span> Description
            </div>
            <div className="section-item">
              <span className="section-icon">🎨</span> Variant Picker
            </div>
            <div className="section-item">
              <span className="section-icon">🔢</span> Quantity Selector
            </div>
            <div className="section-item">
              <span className="section-icon">🛒</span> Add To Cart
            </div>
            <div className="section-item">
              <span className="section-icon">⚡</span> Buy Now Button
            </div>
            <div className="section-item">
              <span className="section-icon">🛡️</span> Trust Badges
            </div>
            <div className="section-item">
              <span className="section-icon">🚚</span> Delivery Info
            </div>
            <div className="section-item">
              <span className="section-icon">⭐</span> Reviews
            </div>
          </div>
        </div>

        {/* Center Canvas */}
        <div className="canvas-area">
          <div className="canvas-frame">
            <div className="mock-product">
              <div className="mock-gallery">
                <img src="https://cdn.shopify.com/s/files/1/0533/2089/files/placeholder-images-product-5_large.png" className="mock-main-img" alt="Product" />
                <div className="mock-thumbs">
                  <div className="mock-thumb"></div>
                  <div className="mock-thumb"></div>
                  <div className="mock-thumb"></div>
                  <div className="mock-thumb"></div>
                </div>
              </div>
              <div className="mock-details">
                <div>
                  <div className="mock-title">Wireless Headphones Over Ear</div>
                  <div className="mock-reviews">★★★★★ <span style={{color: '#6B7280', fontSize: '12px', fontWeight: 500}}>(4.8) 1,248 reviews</span></div>
                </div>
                
                <div style={{display: 'flex', alignItems: 'center'}}>
                  <div className="mock-price">$199.00 <s>$249.00</s></div>
                  <div className="mock-badge">Save 20%</div>
                </div>

                <div className="mock-desc">
                  Experience high-quality sound with active noise cancellation and extra long battery life. Perfect for travel or focused work.
                </div>

                <div>
                  <div style={{fontSize: '13px', fontWeight: 600, marginBottom: '8px'}}>Color: Black</div>
                  <div className="mock-variants">
                    <div className="mock-color" style={{background: '#111827', outlineColor: '#111827'}}></div>
                    <div className="mock-color" style={{background: '#E5E7EB'}}></div>
                    <div className="mock-color" style={{background: '#3B82F6'}}></div>
                  </div>
                </div>

                <div>
                  <div style={{fontSize: '13px', fontWeight: 600, marginBottom: '8px'}}>Quantity</div>
                  <div style={{display: 'flex', border: '1px solid #D1D5DB', borderRadius: '6px', width: 'fit-content'}}>
                    <button style={{padding: '8px 12px', background: 'transparent', border: 'none', cursor: 'pointer', color: '#6B7280'}}>-</button>
                    <div style={{padding: '8px 12px', borderLeft: '1px solid #D1D5DB', borderRight: '1px solid #D1D5DB', fontWeight: 600}}>1</div>
                    <button style={{padding: '8px 12px', background: 'transparent', border: 'none', cursor: 'pointer', color: '#6B7280'}}>+</button>
                  </div>
                </div>

                <div className="mock-actions">
                  <button className="mock-btn add-to-cart">Add to Cart</button>
                  <button className="mock-btn buy-now">Buy it Now</button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="sidebar-right">
          <div className="sidebar-header" style={{display: 'flex', justifyContent: 'space-between'}}>
            Product Title
            <span style={{cursor: 'pointer', color: '#9CA3AF'}}>🗑️</span>
          </div>
          
          <div className="properties-tabs">
            <div className="prop-tab">Content</div>
            <div className="prop-tab active">Style</div>
            {PLAN_LEVELS[activePlan] >= PLAN_LEVELS["premium"] ? (
              <div className="prop-tab">Advanced</div>
            ) : (
              <div className="prop-tab" style={{color: '#D1D5DB', cursor: 'not-allowed'}} title="Requires Premium Plan">Advanced 🔒</div>
            )}
          </div>

          <div className="prop-section">
            <span className="prop-label" style={{borderBottom: '1px solid #E5E7EB', paddingBottom: '8px', marginBottom: '16px'}}>Typography</span>
            
            <span className="prop-label">Font Family</span>
            <select className="prop-select" style={{marginBottom: '16px'}}>
              <option>Poppins</option>
              <option>Inter</option>
              <option>Roboto</option>
            </select>

            <div className="prop-row" style={{marginBottom: '16px'}}>
              <div style={{flex: 1}}>
                <span className="prop-label">Font Size</span>
                <div className="prop-input-group">
                  <input type="number" defaultValue={28} />
                  <span>px</span>
                </div>
              </div>
            </div>

            <span className="prop-label">Font Weight</span>
            <select className="prop-select" style={{marginBottom: '16px'}}>
              <option>Semi Bold 600</option>
              <option>Bold 700</option>
              <option>Regular 400</option>
            </select>

            <span className="prop-label">Text Color</span>
            <div className="color-picker-mock" style={{marginBottom: '24px'}}>
              <div style={{display: 'flex', gap: '8px', alignItems: 'center'}}>
                 <div className="color-swatch"></div>
                 <div className="color-hex">#111827</div>
              </div>
              <div style={{color: '#9CA3AF'}}>▼</div>
            </div>

            <span className="prop-label">Alignment</span>
            <div className="toggle-group">
              <div className="toggle-item"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="12" x2="15" y2="12"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg></div>
              <div className="toggle-item active"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="3" y1="6" x2="21" y2="6"></line><line x1="6" y1="12" x2="18" y2="12"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg></div>
              <div className="toggle-item"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="3" y1="6" x2="21" y2="6"></line><line x1="9" y1="12" x2="21" y2="12"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg></div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
