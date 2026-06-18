import { json, type LoaderFunctionArgs, type LinksFunction } from "@remix-run/node";
import { useLoaderData, useNavigate } from "@remix-run/react";
import { useState } from "react";
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
    page: page || { name: "Untitled Product Page", id: pageId, templateId: pageId.replace('preview-', '') },
    activePlan
  });
};

const PLAN_LEVELS: Record<string, number> = {
  free: 0,
  basic: 1,
  standard: 2,
  premium: 3
};

const TEMPLATE_MOCKS: Record<string, any> = {
  '1': {
    title: 'Minimal Clean Lamp',
    plan: 'Free',
    price: '$89.00',
    compareAt: '',
    desc: 'Brighten your space with this elegant, minimalist modern lamp.',
    image: 'https://cdn.shopify.com/s/files/1/0533/2089/files/placeholder-images-product-5_large.png',
    layout: 'split'
  },
  '2': {
    title: 'Modern Electronics Suite',
    plan: 'Basic',
    price: '$299.00',
    compareAt: '$350.00',
    desc: 'High-performance electronics for your smart home setup.',
    image: 'https://cdn.shopify.com/s/files/1/0533/2089/files/placeholder-images-product-6_large.png',
    layout: 'stacked'
  },
  '3': {
    title: 'Luxury Watch Collection',
    plan: 'Standard',
    price: '$450.00',
    compareAt: '$599.00',
    desc: 'Timeless elegance meets modern engineering.',
    image: 'https://cdn.shopify.com/s/files/1/0533/2089/files/placeholder-images-product-2_large.png',
    layout: 'split'
  },
  '4': {
    title: 'Beauty Glow Skincare',
    plan: 'Premium',
    price: '$129.00',
    compareAt: '$150.00',
    desc: 'Complete routine for glowing, healthy skin.',
    image: 'https://cdn.shopify.com/s/files/1/0533/2089/files/placeholder-images-product-4_large.png',
    layout: 'stacked'
  },
  '5': {
    title: 'Fashion Store Collection',
    plan: 'Basic',
    price: '$89.00',
    compareAt: '$110.00',
    desc: 'Latest trends for your daily wardrobe.',
    image: 'https://cdn.shopify.com/s/files/1/0533/2089/files/placeholder-images-collection-3_large.png',
    layout: 'split'
  },
  '6': {
    title: 'Sporty Performance Shoes',
    plan: 'Standard',
    price: '$149.00',
    compareAt: '$180.00',
    desc: 'Lightweight and durable shoes for maximum athletic performance.',
    image: 'https://cdn.shopify.com/s/files/1/0533/2089/files/placeholder-images-product-1_large.png',
    layout: 'split'
  },
  'default': {
    title: 'Wireless Headphones Over Ear',
    price: '$199.00',
    compareAt: '$249.00',
    desc: 'Experience high-quality sound with active noise cancellation and extra long battery life. Perfect for travel or focused work.',
    image: 'https://cdn.shopify.com/s/files/1/0533/2089/files/placeholder-images-product-5_large.png',
    layout: 'split'
  }
};

export default function Editor() {
  const loaderData = useLoaderData<typeof loader>();
  const page = loaderData.page;
  const isPreview = page.id.startsWith('preview-');
  const navigate = useNavigate();

  const [activeSection, setActiveSection] = useState('title');
  const initialMockData = TEMPLATE_MOCKS[page.templateId] || TEMPLATE_MOCKS['1'];
  const [editorData, setEditorData] = useState({
    ...initialMockData,
    buttonText: 'Add to Cart',
    buyNowText: 'Buy it Now',
    quantity: 1,
    selectedColor: 'Black',
    styles: {
      title: { fontFamily: 'Poppins', fontSize: 24, fontWeight: '600', color: '#111827', textAlign: 'left' },
      price: { fontFamily: 'Poppins', fontSize: 20, fontWeight: '600', color: '#111827', textAlign: 'left' },
      desc: { fontFamily: 'Inter', fontSize: 15, fontWeight: '400', color: '#4B5563', textAlign: 'left' },
      cart: { fontFamily: 'Inter', fontSize: 16, fontWeight: '600', color: '#111827', textAlign: 'center' },
      buy: { fontFamily: 'Inter', fontSize: 16, fontWeight: '600', color: '#ffffff', textAlign: 'center' }
    }
  });

  const activePlan = isPreview ? (editorData.plan || 'Free').toLowerCase() : loaderData.activePlan;

  const updateStyle = (key: string, value: string | number) => {
    if (!['title', 'price', 'desc', 'cart', 'buy'].includes(activeSection)) return;
    setEditorData((prev: any) => ({
      ...prev,
      styles: {
        ...prev.styles,
        [activeSection]: {
          ...prev.styles[activeSection],
          [key]: value
        }
      }
    }));
  };

  return (
    <div className="editor-container">
      {/* Top Bar */}
      <div className="editor-topbar">
        <div className="topbar-left">
          <button className="back-btn" onClick={() => navigate(page.id.startsWith('preview-') ? '/app/templates' : '/app')}>
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
            {[
              ...(editorData.plan === 'Premium' ? [{ id: 'layout', icon: '📐', label: 'Layout Settings' }] : []),
              { id: 'images', icon: '🖼️', label: 'Product Images' },
              { id: 'title', icon: 'T', label: 'Product Title' },
              { id: 'price', icon: '💲', label: 'Price' },
              { id: 'desc', icon: '📝', label: 'Description' },
              { id: 'variants', icon: '🎨', label: 'Variant Picker' },
              { id: 'quantity', icon: '🔢', label: 'Quantity Selector' },
              { id: 'cart', icon: '🛒', label: 'Add To Cart' },
              { id: 'buy', icon: '⚡', label: 'Buy Now Button' },
            ].map(section => (
              <div 
                key={section.id} 
                className={`section-item ${activeSection === section.id ? 'active' : ''}`}
                onClick={() => setActiveSection(section.id)}
              >
                <span className="section-icon">{section.icon}</span> {section.label}
              </div>
            ))}
          </div>
        </div>

        {/* Center Canvas */}
        <div className="canvas-area">
          <div className="canvas-frame">
            <div className={`mock-product ${editorData.layout === 'stacked' ? 'mock-product-stacked' : ''}`}>
              <div className="mock-gallery">
                <img src={editorData.image} className="mock-main-img" alt="Product" />
                <div className="mock-thumbs" style={{ justifyContent: editorData.layout === 'stacked' ? 'center' : 'flex-start' }}>
                  <div className="mock-thumb"></div>
                  <div className="mock-thumb"></div>
                  <div className="mock-thumb"></div>
                  <div className="mock-thumb"></div>
                </div>
              </div>
              <div className="mock-details" style={{ alignItems: editorData.layout === 'stacked' ? 'center' : 'flex-start', textAlign: editorData.layout === 'stacked' ? 'center' : 'left' }}>
                <div>
                  <div className="mock-title" style={editorData.styles.title}>{editorData.title}</div>
                </div>
                
                <div style={{display: 'flex', alignItems: 'center', justifyContent: editorData.layout === 'stacked' ? 'center' : 'flex-start'}}>
                  <div className="mock-price" style={editorData.styles.price}>{editorData.price} {activePlan !== 'free' && editorData.compareAt && <s>{editorData.compareAt}</s>}</div>
                  {activePlan !== 'free' && editorData.compareAt && <div className="mock-badge">Save 20%</div>}
                </div>

                {activePlan !== 'free' && (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: editorData.layout === 'stacked' ? 'center' : 'flex-start', gap: '8px', marginTop: '12px', marginBottom: '8px' }}>
                    <div style={{ color: '#FBBF24', fontSize: '16px', letterSpacing: '2px' }}>★★★★★</div>
                    <div style={{ color: '#4B5563', fontSize: '14px', fontWeight: 600 }}>(4.9)</div>
                    <div style={{ color: '#6B7280', fontSize: '14px' }}>2,345 Reviews</div>
                  </div>
                )}

                <div className="mock-desc" style={editorData.styles.desc}>
                  {editorData.desc}
                </div>

                <div>
                  <div style={{fontSize: '13px', fontWeight: 600, marginBottom: '8px'}}>Color: {editorData.selectedColor}</div>
                  <div className="mock-variants">
                    <div className="mock-color" style={{background: '#111827', outlineColor: editorData.selectedColor === 'Black' ? '#111827' : 'transparent', cursor: 'pointer'}} onClick={() => setEditorData({...editorData, selectedColor: 'Black'})}></div>
                    <div className="mock-color" style={{background: '#E5E7EB', outlineColor: editorData.selectedColor === 'Silver' ? '#E5E7EB' : 'transparent', cursor: 'pointer'}} onClick={() => setEditorData({...editorData, selectedColor: 'Silver'})}></div>
                    <div className="mock-color" style={{background: '#3B82F6', outlineColor: editorData.selectedColor === 'Blue' ? '#3B82F6' : 'transparent', cursor: 'pointer'}} onClick={() => setEditorData({...editorData, selectedColor: 'Blue'})}></div>
                  </div>
                </div>

                <div>
                  <div style={{fontSize: '13px', fontWeight: 600, marginBottom: '8px'}}>Quantity</div>
                  <div style={{display: 'flex', border: '1px solid #D1D5DB', borderRadius: '6px', width: 'fit-content', margin: editorData.layout === 'stacked' ? '0 auto' : '0'}}>
                    <button onClick={() => setEditorData({...editorData, quantity: Math.max(1, editorData.quantity - 1)})} style={{padding: '8px 12px', background: 'transparent', border: 'none', cursor: 'pointer', color: '#6B7280'}}>-</button>
                    <div style={{padding: '8px 12px', borderLeft: '1px solid #D1D5DB', borderRight: '1px solid #D1D5DB', fontWeight: 600}}>{editorData.quantity}</div>
                    <button onClick={() => setEditorData({...editorData, quantity: editorData.quantity + 1})} style={{padding: '8px 12px', background: 'transparent', border: 'none', cursor: 'pointer', color: '#6B7280'}}>+</button>
                  </div>
                </div>

                <div className="mock-actions">
                  <button className="mock-btn add-to-cart" style={editorData.styles.cart}>{editorData.buttonText}</button>
                  <button className="mock-btn buy-now" style={editorData.styles.buy}>{editorData.buyNowText}</button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="sidebar-right">
          <div className="sidebar-header" style={{display: 'flex', justifyContent: 'space-between', textTransform: 'capitalize'}}>
            {activeSection === 'desc' ? 'Description' : activeSection === 'cart' ? 'Add To Cart' : activeSection === 'buy' ? 'Buy Now' : `Product ${activeSection}`}
            <span style={{cursor: 'pointer', color: '#9CA3AF'}}>🗑️</span>
          </div>
          
          <div className="properties-tabs">
            <div className="prop-tab active">Content</div>
            <div className="prop-tab">Style</div>
            {PLAN_LEVELS[activePlan] >= PLAN_LEVELS["premium"] ? (
              <div className="prop-tab">Advanced</div>
            ) : (
              <div className="prop-tab" style={{color: '#D1D5DB', cursor: 'not-allowed'}} title="Requires Premium Plan">Advanced 🔒</div>
            )}
          </div>

          <div className="prop-section">
            {activeSection === 'layout' && (
              <>
                <span className="prop-label" style={{ display: 'flex', justifyContent: 'space-between' }}>
                  Product Layout
                  {activePlan !== 'premium' && <span style={{color: '#D1D5DB'}} title="Requires Premium Plan">🔒</span>}
                </span>
                <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
                  <button 
                    onClick={() => activePlan === 'premium' && setEditorData({...editorData, layout: 'split'})}
                    style={{
                      flex: 1, padding: '8px', borderRadius: '4px', border: '1px solid #E5E7EB',
                      background: editorData.layout === 'split' ? '#E5E7EB' : 'white',
                      cursor: activePlan === 'premium' ? 'pointer' : 'not-allowed',
                      opacity: activePlan === 'premium' ? 1 : 0.5,
                      fontWeight: editorData.layout === 'split' ? 600 : 400
                    }}
                  >
                    Side-by-Side
                  </button>
                  <button 
                    onClick={() => activePlan === 'premium' && setEditorData({...editorData, layout: 'stacked'})}
                    style={{
                      flex: 1, padding: '8px', borderRadius: '4px', border: '1px solid #E5E7EB',
                      background: editorData.layout === 'stacked' ? '#E5E7EB' : 'white',
                      cursor: activePlan === 'premium' ? 'pointer' : 'not-allowed',
                      opacity: activePlan === 'premium' ? 1 : 0.5,
                      fontWeight: editorData.layout === 'stacked' ? 600 : 400
                    }}
                  >
                    Stacked
                  </button>
                </div>
                {activePlan !== 'premium' && (
                  <div style={{color: '#ef4444', fontSize: '12px', marginTop: '-8px', marginBottom: '16px'}}>
                    Upgrade to Premium to customize the layout structure.
                  </div>
                )}
              </>
            )}

            {activeSection === 'title' && (
              <>
                <span className="prop-label">Title Text</span>
                <input 
                  type="text" 
                  className="prop-select" 
                  style={{marginBottom: '16px', background: 'white'}} 
                  value={editorData.title}
                  onChange={(e) => setEditorData({...editorData, title: e.target.value})}
                />
              </>
            )}
            
            {activeSection === 'price' && (
              <>
                <span className="prop-label">Price Text</span>
                <input 
                  type="text" 
                  className="prop-select" 
                  style={{marginBottom: '16px', background: 'white'}} 
                  value={editorData.price}
                  onChange={(e) => setEditorData({...editorData, price: e.target.value})}
                />
                <span className="prop-label" style={{ display: 'flex', justifyContent: 'space-between' }}>
                  Compare At Price
                  {activePlan === 'free' && <span style={{color: '#D1D5DB'}} title="Upgrade to use">🔒</span>}
                </span>
                <input 
                  type="text" 
                  className="prop-select" 
                  style={{
                    marginBottom: '16px', 
                    background: activePlan === 'free' ? '#F9FAFB' : 'white',
                    color: activePlan === 'free' ? '#9CA3AF' : 'inherit',
                    cursor: activePlan === 'free' ? 'not-allowed' : 'text'
                  }} 
                  value={activePlan === 'free' ? '' : editorData.compareAt}
                  onChange={(e) => setEditorData({...editorData, compareAt: e.target.value})}
                  disabled={activePlan === 'free'}
                  placeholder={activePlan === 'free' ? 'Upgrade plan to use discounts' : ''}
                />
              </>
            )}

            {activeSection === 'desc' && (
              <>
                <span className="prop-label">Description Text</span>
                <textarea 
                  className="prop-select" 
                  style={{marginBottom: '16px', background: 'white', minHeight: '120px', resize: 'vertical'}} 
                  value={editorData.desc}
                  onChange={(e) => setEditorData({...editorData, desc: e.target.value})}
                />
              </>
            )}

            {activeSection === 'cart' && (
              <>
                <span className="prop-label">Button Label</span>
                <input 
                  type="text" 
                  className="prop-select" 
                  style={{marginBottom: '16px', background: 'white'}} 
                  value={editorData.buttonText}
                  onChange={(e) => setEditorData({...editorData, buttonText: e.target.value})}
                />
              </>
            )}

            {activeSection === 'buy' && (
              <>
                <span className="prop-label">Button Label</span>
                <input 
                  type="text" 
                  className="prop-select" 
                  style={{marginBottom: '16px', background: 'white'}} 
                  value={editorData.buyNowText}
                  onChange={(e) => setEditorData({...editorData, buyNowText: e.target.value})}
                />
              </>
            )}

            {activeSection === 'quantity' && (
              <>
                <span className="prop-label">Default Quantity</span>
                <input 
                  type="number" 
                  className="prop-select" 
                  style={{marginBottom: '16px', background: 'white'}} 
                  value={editorData.quantity}
                  onChange={(e) => setEditorData({...editorData, quantity: Number(e.target.value)})}
                  min={1}
                />
              </>
            )}

            {['images', 'variants'].includes(activeSection) && (
              <div style={{color: '#6B7280', fontSize: '13px', marginBottom: '24px', fontStyle: 'italic'}}>
                Content options coming soon for this section.
              </div>
            )}

            {['title', 'price', 'desc', 'cart', 'buy'].includes(activeSection) && (() => {
              const currentStyle = (editorData.styles as any)[activeSection];
              return (
                <>
                  <span className="prop-label" style={{borderBottom: '1px solid #E5E7EB', paddingBottom: '8px', marginBottom: '16px', marginTop: '16px'}}>Typography</span>
                  
                  <span className="prop-label">Font Family</span>
                  <select className="prop-select" style={{marginBottom: '16px'}} value={currentStyle.fontFamily} onChange={e => updateStyle('fontFamily', e.target.value)}>
                    <option>Poppins</option>
                    <option>Inter</option>
                    <option>Roboto</option>
                  </select>

                  <div className="prop-row" style={{marginBottom: '16px'}}>
                    <div style={{flex: 1}}>
                      <span className="prop-label">Font Size</span>
                      <div className="prop-input-group">
                        <input type="number" value={currentStyle.fontSize} onChange={e => updateStyle('fontSize', Number(e.target.value))} />
                        <span>px</span>
                      </div>
                    </div>
                  </div>

                  <span className="prop-label">Font Weight</span>
                  <select className="prop-select" style={{marginBottom: '16px'}} value={currentStyle.fontWeight} onChange={e => updateStyle('fontWeight', e.target.value)}>
                    <option value="600">Semi Bold 600</option>
                    <option value="700">Bold 700</option>
                    <option value="400">Regular 400</option>
                  </select>

                  <span className="prop-label">Text Color</span>
                  <div className="color-picker-mock" style={{marginBottom: '24px'}}>
                    <div style={{display: 'flex', gap: '8px', alignItems: 'center'}}>
                       <input type="color" value={currentStyle.color} onChange={e => updateStyle('color', e.target.value)} style={{width: '24px', height: '24px', padding: 0, border: 'none', cursor: 'pointer'}} />
                       <div className="color-hex">{currentStyle.color}</div>
                    </div>
                  </div>

                  <span className="prop-label">Alignment</span>
                  <div className="toggle-group">
                    <div className={`toggle-item ${currentStyle.textAlign === 'left' ? 'active' : ''}`} onClick={() => updateStyle('textAlign', 'left')}><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="12" x2="15" y2="12"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg></div>
                    <div className={`toggle-item ${currentStyle.textAlign === 'center' ? 'active' : ''}`} onClick={() => updateStyle('textAlign', 'center')}><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="3" y1="6" x2="21" y2="6"></line><line x1="6" y1="12" x2="18" y2="12"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg></div>
                    <div className={`toggle-item ${currentStyle.textAlign === 'right' ? 'active' : ''}`} onClick={() => updateStyle('textAlign', 'right')}><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="3" y1="6" x2="21" y2="6"></line><line x1="9" y1="12" x2="21" y2="12"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg></div>
                  </div>
                </>
              );
            })()}
          </div>
        </div>

      </div>
    </div>
  );
}
