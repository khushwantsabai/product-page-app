import { json, type LoaderFunctionArgs, type LinksFunction, type ActionFunctionArgs } from "@remix-run/node";
import { useLoaderData, useNavigate, useSubmit, useActionData, useNavigation } from "@remix-run/react";
import { useState, useEffect, useRef } from "react";
import editorStyles from "../styles/editor.css?url";
import { authenticate } from "../shopify.server";
import prisma from "../db.server";

export const links: LinksFunction = () => {
  return [{ rel: "stylesheet", href: editorStyles }];
};

export const action = async ({ request, params }: ActionFunctionArgs) => {
  const pageId = params.id;
  if (!pageId || pageId.startsWith('preview-')) return json({ success: false, error: "Cannot save preview" });
  
  const { session } = await authenticate.admin(request);
  const formData = await request.formData();
  
  const status = formData.get("status") as string;
  const settingsStr = formData.get("settings") as string;
  const title = formData.get("title") as string;
  const templateId = formData.get("templateId") as string;
  
  if (!settingsStr) return json({ success: false, error: "No settings provided" });
  
  const settings = JSON.parse(settingsStr);

  // If this is a brand-new page (id=new), create a DB record for the first time
  if (pageId === 'new') {
    const templateName = formData.get("templateName") as string || "Untitled";
    const newPage = await prisma.productPage.create({
      data: {
        shopId: session.shop,
        templateId: templateId || '1',
        planId: "free",
        name: title || `Untitled ${templateName}`,
        status,
        settings
      }
    });
    return json({ success: true, status, newId: newPage.id });
  }

  await prisma.productPage.update({
    where: { id: pageId, shopId: session.shop },
    data: { status, name: title || undefined, settings }
  });
  
  return json({ success: true, status });
};

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  const pageId = params.id;
  if (!pageId) throw new Error("Page ID required");

  let session: any = { shop: "mock-shop.myshopify.com" };
  let activePlan = "free";
  let isAuthenticated = false;
  let admin: any = null;

  try {
    const authResult = await authenticate.admin(request);
    session = authResult.session;
    admin = authResult.admin;
    isAuthenticated = true;
  } catch (e) {
    if (!pageId.startsWith('preview-')) {
      throw e;
    }
  }

  let page = null;
  if (isAuthenticated) {
    try {
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
      
      activePlan = "free";
      if (activeSub && activeSub.name) {
        if (activeSub.name.toLowerCase().includes("basic")) activePlan = "basic";
        if (activeSub.name.toLowerCase().includes("standard")) activePlan = "standard";
        if (activeSub.name.toLowerCase().includes("premium")) activePlan = "premium";
      }
    } catch (_) {}
  }
  
  const url = new URL(request.url);
  const queryTemplateId = url.searchParams.get("templateId") || '1';
  const queryTemplateName = url.searchParams.get("templateName") || "Untitled";

  if (!pageId.startsWith('preview-') && pageId !== 'new') {
    page = await prisma.productPage.findUnique({ where: { id: pageId } });
  } else if (pageId.startsWith('preview-') && !isAuthenticated) {
    const templateId = pageId.replace('preview-', '');
    if (['4'].includes(templateId)) activePlan = "premium";
    else if (['3', '6'].includes(templateId)) activePlan = "standard";
    else if (['2', '5'].includes(templateId)) activePlan = "basic";
  }

  // For new pages, use the template from query param
  const effectiveTemplateId = pageId === 'new' ? queryTemplateId : (page?.templateId ?? pageId.replace('preview-', ''));

  return json({
    page: page || { name: queryTemplateName, id: pageId, templateId: effectiveTemplateId },
    activePlan,
    isNew: pageId === 'new',
    newTemplateId: queryTemplateId,
    newTemplateName: queryTemplateName,
  });
};

const PLAN_LEVELS: Record<string, number> = {
  free: 0,
  basic: 1,
  standard: 2,
  premium: 3
};

export const TEMPLATE_MOCKS: Record<string, any> = {
  '1': {
    title: 'Minimal Clean Lamp',
    plan: 'Free',
    price: '$89.00',
    compareAt: '',
    desc: 'Brighten your space with this elegant, minimalist modern lamp.',
    image: 'https://cdn.shopify.com/s/files/1/0533/2089/files/placeholder-images-product-5_large.png',
    layout: 'split',
    reviews: { rating: 0, count: 0 },
    discountBadge: '',
    sizes: ['S', 'M', 'L', 'XL'],
    selectedSize: 'M',
    unavailableSizes: ['L'],
    showSizeChart: true,
    sizeChartOpen: false,
    crossUnavailable: true
  },
  '2': {
    title: 'Modern Electronics Suite',
    plan: 'Basic',
    price: '$299.00',
    compareAt: '$350.00',
    desc: 'High-performance electronics for your smart home setup.',
    image: 'https://cdn.shopify.com/s/files/1/0533/2089/files/placeholder-images-product-6_large.png',
    layout: 'stacked',
    reviews: { rating: 4.8, count: 1248 },
    discountBadge: 'Save 15%',
    sizes: ['S', 'M', 'L', 'XL'],
    selectedSize: 'M',
    unavailableSizes: ['L'],
    showSizeChart: true,
    sizeChartOpen: false,
    crossUnavailable: true
  },
  '3': {
    title: 'Luxury Watch Collection',
    plan: 'Standard',
    price: '$450.00',
    compareAt: '$599.00',
    desc: 'Timeless elegance meets modern engineering.',
    image: 'https://cdn.shopify.com/s/files/1/0533/2089/files/placeholder-images-product-2_large.png',
    layout: 'split',
    reviews: { rating: 4.9, count: 2345 },
    discountBadge: 'Save 25%',
    sizes: ['S', 'M', 'L', 'XL'],
    selectedSize: 'M',
    unavailableSizes: ['L'],
    showSizeChart: true,
    sizeChartOpen: false,
    crossUnavailable: true
  },
  '4': {
    title: 'Beauty Glow Skincare',
    plan: 'Premium',
    price: '$129.00',
    compareAt: '$150.00',
    desc: 'Complete routine for glowing, healthy skin.',
    image: 'https://cdn.shopify.com/s/files/1/0533/2089/files/placeholder-images-product-4_large.png',
    layout: 'stacked',
    reviews: { rating: 5.0, count: 876 },
    discountBadge: 'Save 14%',
    sizes: ['S', 'M', 'L', 'XL'],
    selectedSize: 'M',
    unavailableSizes: ['L'],
    showSizeChart: true,
    sizeChartOpen: false,
    crossUnavailable: true
  },
  '5': {
    title: 'Fashion Store Collection',
    plan: 'Basic',
    price: '$89.00',
    compareAt: '$110.00',
    desc: 'Latest trends for your daily wardrobe.',
    image: 'https://cdn.shopify.com/s/files/1/0533/2089/files/placeholder-images-collection-3_large.png',
    layout: 'split',
    reviews: { rating: 4.6, count: 432 },
    discountBadge: 'Save 19%',
    sizes: ['S', 'M', 'L', 'XL'],
    selectedSize: 'M',
    unavailableSizes: ['L'],
    showSizeChart: true,
    sizeChartOpen: false,
    crossUnavailable: true
  },
  '6': {
    title: 'Sporty Performance Shoes',
    plan: 'Standard',
    price: '$149.00',
    compareAt: '$180.00',
    desc: 'Lightweight and durable shoes for maximum athletic performance.',
    image: 'https://cdn.shopify.com/s/files/1/0533/2089/files/placeholder-images-product-1_large.png',
    layout: 'split',
    reviews: { rating: 4.7, count: 1890 },
    discountBadge: 'Save 17%',
    sizes: ['S', 'M', 'L', 'XL'],
    selectedSize: 'M',
    unavailableSizes: ['L'],
    showSizeChart: true,
    sizeChartOpen: false,
    crossUnavailable: true
  },
  'default': {
    title: 'Wireless Headphones Over Ear',
    price: '$199.00',
    compareAt: '$249.00',
    desc: 'Experience high-quality sound with active noise cancellation and extra long battery life. Perfect for travel or focused work.',
    image: 'https://cdn.shopify.com/s/files/1/0533/2089/files/placeholder-images-product-5_large.png',
    layout: 'split',
    reviews: { rating: 4.5, count: 512 },
    discountBadge: 'Save 20%',
    sizes: ['S', 'M', 'L', 'XL'],
    selectedSize: 'M',
    unavailableSizes: ['L'],
    showSizeChart: true,
    sizeChartOpen: false,
    crossUnavailable: true
  }
};

export default function Editor() {
  const loaderData = useLoaderData<typeof loader>();
  const page = loaderData.page;
  const isPreview = page.id.startsWith('preview-');
  const navigate = useNavigate();

  const renderStars = (rating: number) => {
    const rounded = Math.round(rating);
    return "★".repeat(Math.max(0, Math.min(5, rounded))) + "☆".repeat(Math.max(0, Math.min(5, 5 - rounded)));
  };

  const [activeDevice, setActiveDevice] = useState<'desktop' | 'mobile'>('desktop');
  const [activeSection, setActiveSection] = useState('title');
  const initialMockData = TEMPLATE_MOCKS[page.templateId] || TEMPLATE_MOCKS['1'];
  
  const [editorData, setEditorDataState] = useState(() => ({
    ...initialMockData,
    imageBgColor: initialMockData.imageBgColor || '#F9FAFB',
    vendor: initialMockData.vendor || {
      name: 'Global Goods Inc.',
      manufacturer: 'Apex Labs',
      wholesaler: 'Midwest Distributing',
      source: 'Direct Import'
    },
    stockWarning: initialMockData.stockWarning || {
      count: 8,
      max: 10,
      text: 'Only {count} items left in stock!'
    },
    trustBadges: initialMockData.trustBadges || [
      { id: '1', title: 'Shipping', desc: 'On all orders', icon: '🚚' },
      { id: '2', title: '30-Day Returns', desc: 'No questions asked', icon: '🔄' },
      { id: '3', title: 'Secure Checkout', desc: '100% protected', icon: '🔒' },
      { id: '4', title: '24/7 Support', desc: 'We\'re here to help', icon: '💬' }
    ],
    buttonText: 'Add to Cart',
    buyNowText: 'Buy it Now',
    quantity: 1,
    selectedColor: 'Black',
    unavailableSizes: initialMockData.unavailableSizes || [],
    crossUnavailable: initialMockData.crossUnavailable !== undefined ? initialMockData.crossUnavailable : true,
    styles: {
      title: { fontFamily: 'Poppins', fontSize: 24, fontWeight: '600', color: '#111827', textAlign: 'left' },
      price: { fontFamily: 'Poppins', fontSize: 20, fontWeight: '600', color: '#111827', textAlign: 'left' },
      desc: { fontFamily: 'Inter', fontSize: 15, fontWeight: '400', color: '#4B5563', textAlign: 'left' },
      cart: { fontFamily: 'Inter', fontSize: 16, fontWeight: '600', color: '#111827', textAlign: 'center' },
      buy: { fontFamily: 'Inter', fontSize: 16, fontWeight: '600', color: '#ffffff', textAlign: 'center' },
      badge: { backgroundColor: '#FEE2E2', color: '#EF4444' }
    }
  }));

  const historyRef = useRef<any[]>([editorData]);
  const historyIndexRef = useRef<number>(0);
  const timeoutRef = useRef<any>(null);

  const setEditorData = (newDataOrUpdater: any) => {
    setEditorDataState((prev: any) => {
      const nextData = typeof newDataOrUpdater === 'function' ? newDataOrUpdater(prev) : newDataOrUpdater;
      
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => {
        const history = historyRef.current;
        const index = historyIndexRef.current;
        const newHistory = history.slice(0, index + 1);
        newHistory.push(nextData);
        if (newHistory.length > 50) newHistory.shift();
        historyRef.current = newHistory;
        historyIndexRef.current = newHistory.length - 1;
      }, 500);

      return nextData;
    });
  };

  const handleUndo = () => {
    if (historyIndexRef.current > 0) {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      historyIndexRef.current -= 1;
      setEditorDataState(historyRef.current[historyIndexRef.current]);
    }
  };

  const submit = useSubmit();
  const navigation = useNavigation();
  const actionData = useActionData<typeof action>();

  const [sizesRaw, setSizesRaw] = useState<string | null>(null);
  const [unavailableRaw, setUnavailableRaw] = useState<string | null>(null);

  useEffect(() => {
    setSizesRaw(null);
    setUnavailableRaw(null);
  }, [page.id]);

  const handleSave = (status: 'Draft' | 'Published') => {
    const formData = new FormData();
    formData.append("status", status);
    formData.append("settings", JSON.stringify(editorData));
    formData.append("title", editorData.title || page.name);
    // For new pages, pass template info so the action can create the record
    if (loaderData.isNew) {
      formData.append("templateId", loaderData.newTemplateId || page.templateId);
      formData.append("templateName", loaderData.newTemplateName || page.name);
    }
    submit(formData, { method: "post" });
  };

  const userPlan = loaderData.activePlan;
  const templatePlan = (editorData.plan || 'Free').toLowerCase();
  
  // Use the user's plan for editing permissions, unless it's a preview in which case we show what the template requires
  const activePlan = isPreview ? templatePlan : userPlan;
  
  // A template is locked in preview mode if the template plan level is higher than the user's plan level
  const isLockedPreview = isPreview && PLAN_LEVELS[templatePlan] > PLAN_LEVELS[userPlan];
  const isEditablePreview = isPreview && PLAN_LEVELS[templatePlan] <= PLAN_LEVELS[userPlan];

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
          <button 
            className={`device-btn ${activeDevice === 'desktop' ? 'active' : ''}`}
            onClick={() => setActiveDevice('desktop')}
            title="Desktop View"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect><line x1="8" y1="21" x2="16" y2="21"></line><line x1="12" y1="17" x2="12" y2="21"></line></svg>
          </button>
          <button 
            className={`device-btn ${activeDevice === 'mobile' ? 'active' : ''}`}
            onClick={() => setActiveDevice('mobile')}
            title="Mobile View"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="5" y="2" width="14" height="20" rx="2" ry="2"></rect><line x1="12" y1="18" x2="12.01" y2="18"></line></svg>
          </button>
        </div>

        <div className="topbar-right">
          <button 
            className="btn-outline" 
            onClick={handleUndo}
            disabled={historyIndexRef.current === 0}
            style={{ opacity: historyIndexRef.current === 0 ? 0.5 : 1, cursor: historyIndexRef.current === 0 ? 'not-allowed' : 'pointer' }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{marginRight: '6px', verticalAlign: 'text-bottom'}}>
              <polyline points="1 4 1 10 7 10"></polyline>
              <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"></path>
            </svg>
            Undo
          </button>
          {isPreview ? (
            <form method="post" action="/app/templates" style={{ margin: 0 }}>
              <input type="hidden" name="templateId" value={page?.templateId || editorData.id || page.id.replace('preview-', '')} />
              <input type="hidden" name="templateName" value={editorData.title || "Template"} />
              <button type="submit" className="btn-solid">Use Template</button>
            </form>
          ) : (
            <>
              <button 
                className="btn-outline" 
                onClick={() => handleSave("Draft")}
                disabled={navigation.state === 'submitting'}
              >
                {navigation.state === 'submitting' && navigation.formData?.get('status') === 'Draft' ? 'Saving...' : 'Save Draft'}
              </button>
              <button 
                className="btn-solid" 
                onClick={() => handleSave("Published")}
                disabled={navigation.state === 'submitting'}
              >
                {navigation.state === 'submitting' && navigation.formData?.get('status') === 'Published' ? 'Publishing...' : 'Publish'}
              </button>
            </>
          )}
        </div>
      </div>

      <div className="editor-workspace">
        {/* Left Sidebar */}
        <div className="sidebar-left">
          {isLockedPreview ? (
            <div style={{ padding: '24px', textAlign: 'center', color: '#6B7280', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: '16px' }}>
              <span style={{ fontSize: '32px' }}>🔒</span>
              <h3 style={{ margin: 0, color: '#111827' }}>Preview Mode</h3>
              <p style={{ margin: 0, fontSize: '13px' }}>Upgrade to {editorData.plan} to customize this template.</p>
              <button onClick={() => navigate('/app/plans')} className="btn-solid" style={{ width: '100%', marginTop: '8px' }}>Upgrade Plan</button>
            </div>
          ) : (
            <>
          <div className="sidebar-header">Add Section</div>
          <div className="section-list">
            {[
              ...(editorData.plan === 'Premium' ? [{ id: 'layout', icon: '📐', label: 'Layout Settings' }] : []),
              ...((activePlan === 'standard' || activePlan === 'premium') ? [{ id: 'vendor', icon: '🏢', label: 'Vendor Details' }] : []),
              ...(activePlan === 'premium' ? [{ id: 'trust', icon: '🛡️', label: 'Stock & Trust' }] : []),
              { id: 'images', icon: '🖼️', label: 'Product Images' },
              { id: 'title', icon: 'T', label: 'Product Title' },
              { id: 'price', icon: '💲', label: 'Price' },
              ...(activePlan !== 'free' ? [{ id: 'reviews', icon: '⭐', label: 'Reviews' }] : []),
              { id: 'desc', icon: '📝', label: 'Description' },
              { id: 'variants', icon: '🎨', label: 'Variant Picker' },
              { id: 'sizes', icon: '📏', label: 'Size Options' },
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
          </>
          )}
        </div>

        {/* Center Canvas */}
        <div className="canvas-area">
          <div className="canvas-frame" style={{
            maxWidth: activeDevice === 'mobile' ? '375px' : '900px',
            padding: activeDevice === 'mobile' ? '16px' : '24px',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
          }}>
            <div className="mock-product" style={{ 
              flexDirection: (editorData.layout === 'stacked' || activeDevice === 'mobile') ? 'column' : 'row', 
              alignItems: (editorData.layout === 'stacked' || activeDevice === 'mobile') ? 'center' : 'flex-start', 
              gap: (editorData.layout === 'stacked' || activeDevice === 'mobile') ? '32px' : '24px' 
            }}>
              <div className="mock-gallery" style={{ 
                width: '100%', 
                maxWidth: (editorData.layout === 'stacked' || activeDevice === 'mobile') ? '100%' : '45%', 
                minWidth: 0,
                position: (editorData.layout === 'split' && activeDevice === 'desktop') ? 'sticky' : 'static',
                top: (editorData.layout === 'split' && activeDevice === 'desktop') ? '24px' : 'auto',
                alignSelf: (editorData.layout === 'split' && activeDevice === 'desktop') ? 'flex-start' : 'stretch'
              }}>
                <img src={editorData.image} alt="Product" style={{ width: '100%', borderRadius: '8px', objectFit: 'cover', backgroundColor: editorData.imageBgColor }} />
                
                {activePlan !== 'free' && (
                  <div style={{ display: 'flex', gap: '8px', marginTop: '16px', flexWrap: 'wrap', justifyContent: (editorData.layout === 'stacked' || activeDevice === 'mobile') ? 'center' : 'flex-start' }}>
                    {Array.from({ length: activePlan === 'basic' ? 3 : activePlan === 'standard' ? 5 : 7 }).map((_, i) => (
                      <div key={i} style={{ width: '64px', height: '64px', borderRadius: '6px', border: '1px dashed #D1D5DB', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9CA3AF', background: editorData.imageBgColor }}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>
                      </div>
                    ))}
                    {activePlan === 'premium' && (
                      <div style={{ width: '64px', height: '64px', borderRadius: '6px', border: '1px dashed #D1D5DB', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9CA3AF', background: editorData.imageBgColor }}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
                      </div>
                    )}
                  </div>
                )}

                {/* Split Layout Only: Description, Vendor Details, and Trust Badges on the left below gallery */}
                {editorData.layout === 'split' && activeDevice === 'desktop' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginTop: '24px', width: '100%' }}>
                    {/* Description in split layout to balance heights */}
                    <div className="mock-desc" style={{ 
                      ...editorData.styles.desc, 
                      width: '100%', 
                      borderTop: '1px solid #E5E7EB', 
                      paddingTop: '20px',
                      textAlign: 'left'
                    }}>
                      <div style={{ fontWeight: 700, color: '#111827', marginBottom: '8px', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Product Description</div>
                      <div style={{ lineHeight: '1.6', color: '#4B5563' }}>{editorData.desc}</div>
                    </div>

                    {['standard', 'premium'].includes(activePlan) && editorData.vendor && (
                      <div className="mock-vendor-details" style={{
                        padding: '12px',
                        borderRadius: '8px',
                        background: '#F9FAFB',
                        border: '1px solid #E5E7EB',
                        fontSize: '13px',
                        width: '100%',
                        boxSizing: 'border-box',
                        textAlign: 'left'
                      }}>
                        <div style={{ fontWeight: 600, color: '#374151', marginBottom: '6px' }}>Vendor Details</div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '4px 12px', color: '#4B5563' }}>
                          <span style={{ color: '#6B7280' }}>Vendor:</span> <span>{editorData.vendor.name || 'N/A'}</span>
                          <span style={{ color: '#6B7280' }}>Manufacturer:</span> <span>{editorData.vendor.manufacturer || 'N/A'}</span>
                          <span style={{ color: '#6B7280' }}>Wholesaler:</span> <span>{editorData.vendor.wholesaler || 'N/A'}</span>
                          <span style={{ color: '#6B7280' }}>Original Source:</span> <span>{editorData.vendor.source || 'N/A'}</span>
                        </div>
                      </div>
                    )}

                    {activePlan === 'premium' && editorData.trustBadges && (
                      <div className="mock-trust-badges" style={{ 
                        width: '100%', 
                        padding: '14px 12px', 
                        background: '#F9FAFB', 
                        borderRadius: '8px', 
                        border: '1px solid #E5E7EB',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '12px',
                        boxSizing: 'border-box'
                      }}>
                        {editorData.trustBadges.map((badge: any) => (
                          <div key={badge.id} style={{ display: 'flex', alignItems: 'center', gap: '10px', textAlign: 'left' }}>
                            <div style={{ 
                              width: '32px', 
                              height: '32px', 
                              borderRadius: '50%', 
                              background: '#E5E7EB', 
                              display: 'flex', 
                              alignItems: 'center', 
                              justifyContent: 'center', 
                              fontSize: '16px', 
                              flexShrink: 0 
                            }}>
                              {badge.icon}
                            </div>
                            <div>
                              <div style={{ fontSize: '12px', fontWeight: 700, color: '#111827', lineHeight: '1.2' }}>{badge.title}</div>
                              <div style={{ fontSize: '10px', color: '#6B7280', marginTop: '1px', lineHeight: '1.2' }}>{badge.desc}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
              
              <div className="mock-details" style={{ 
                minWidth: 0, 
                width: '100%',
                maxWidth: (editorData.layout === 'stacked' || activeDevice === 'mobile') ? '500px' : 'none',
                alignItems: (editorData.layout === 'stacked' || activeDevice === 'mobile') ? 'center' : 'flex-start', 
                textAlign: (editorData.layout === 'stacked' || activeDevice === 'mobile') ? 'center' : 'left',
                gap: '16px',
                position: (editorData.layout === 'split' && activeDevice === 'desktop') ? 'sticky' : 'static',
                top: (editorData.layout === 'split' && activeDevice === 'desktop') ? '24px' : 'auto',
                alignSelf: (editorData.layout === 'split' && activeDevice === 'desktop') ? 'flex-start' : 'stretch'
              }}>
                {/* Header Group: Title, Reviews, Price */}
                <div style={{ 
                  display: 'flex', 
                  flexDirection: 'column', 
                  gap: '6px', 
                  width: '100%',
                  alignItems: (editorData.layout === 'stacked' || activeDevice === 'mobile') ? 'center' : 'flex-start'
                }}>
                  <div className="mock-title" style={editorData.styles.title}>{editorData.title}</div>
                  
                  {activePlan !== 'free' && editorData.reviews && (
                    <div 
                      style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}
                      onClick={() => setActiveSection('reviews')}
                    >
                      <div style={{ color: '#FBBF24', fontSize: '15px', letterSpacing: '1px' }}>
                        {renderStars(editorData.reviews.rating || 5)}
                      </div>
                      <div style={{ color: '#4B5563', fontSize: '13px', fontWeight: 600 }}>
                        ({editorData.reviews.rating || '5.0'})
                      </div>
                      <div style={{ color: '#9CA3AF', fontSize: '13px' }}>•</div>
                      <div style={{ color: '#6B7280', fontSize: '13px' }}>
                        {(editorData.reviews.count || 0).toLocaleString()} Reviews
                      </div>
                    </div>
                  )}

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginTop: '2px' }}>
                    <div className="mock-price" style={editorData.styles.price}>
                      {editorData.price} 
                      {activePlan !== 'free' && editorData.compareAt && <s style={{ marginLeft: '6px', fontSize: '14px', color: '#9CA3AF', fontWeight: 500 }}>{editorData.compareAt}</s>}
                    </div>
                    {activePlan !== 'free' && editorData.compareAt && editorData.discountBadge && (
                      <div 
                        className="mock-badge" 
                        style={{ 
                          marginLeft: 0,
                          backgroundColor: editorData.styles.badge?.backgroundColor || '#FEE2E2',
                          color: editorData.styles.badge?.color || '#EF4444'
                        }}
                      >
                        {editorData.discountBadge}
                      </div>
                    )}
                  </div>
                </div>

                {/* Description Group (Only when layout is stacked or in mobile view) */}
                {(editorData.layout === 'stacked' || activeDevice === 'mobile') && (
                  <div className="mock-desc" style={{ ...editorData.styles.desc, width: '100%' }}>
                    {editorData.desc}
                  </div>
                )}

                {/* Vendor Details (Only when layout is stacked or in mobile view) */}
                {(editorData.layout === 'stacked' || activeDevice === 'mobile') && ['standard', 'premium'].includes(activePlan) && editorData.vendor && (
                  <div className="mock-vendor-details" style={{
                    padding: '12px',
                    borderRadius: '8px',
                    background: '#F9FAFB',
                    border: '1px solid #E5E7EB',
                    fontSize: '13px',
                    width: '100%',
                    boxSizing: 'border-box',
                    textAlign: 'left'
                  }}>
                    <div style={{ fontWeight: 600, color: '#374151', marginBottom: '6px' }}>Vendor Details</div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '4px 12px', color: '#4B5563' }}>
                      <span style={{ color: '#6B7280' }}>Vendor:</span> <span>{editorData.vendor.name || 'N/A'}</span>
                      <span style={{ color: '#6B7280' }}>Manufacturer:</span> <span>{editorData.vendor.manufacturer || 'N/A'}</span>
                      <span style={{ color: '#6B7280' }}>Wholesaler:</span> <span>{editorData.vendor.wholesaler || 'N/A'}</span>
                      <span style={{ color: '#6B7280' }}>Original Source:</span> <span>{editorData.vendor.source || 'N/A'}</span>
                    </div>
                  </div>
                )}

                {/* Options Group: Variants, Quantity */}
                <div style={{ 
                  display: 'flex', 
                  flexDirection: 'column', 
                  gap: '16px', 
                  width: '100%',
                  alignItems: (editorData.layout === 'stacked' || activeDevice === 'mobile') ? 'center' : 'flex-start'
                }}>
                  {/* Color Variants */}
                  <div style={{ width: '100%' }}>
                    <div style={{ fontSize: '13px', fontWeight: 600, marginBottom: '6px', color: '#374151', textAlign: (editorData.layout === 'stacked' || activeDevice === 'mobile') ? 'center' : 'left' }}>Color: <span style={{ fontWeight: 400, color: '#6B7280' }}>{editorData.selectedColor}</span></div>
                    <div className="mock-variants" style={{ justifyContent: (editorData.layout === 'stacked' || activeDevice === 'mobile') ? 'center' : 'flex-start' }}>
                      <div className="mock-color" style={{ background: '#111827', outlineColor: editorData.selectedColor === 'Black' ? '#111827' : 'transparent', cursor: 'pointer' }} onClick={() => setEditorData({ ...editorData, selectedColor: 'Black' })}></div>
                      <div className="mock-color" style={{ background: '#E5E7EB', outlineColor: editorData.selectedColor === 'Silver' ? '#E5E7EB' : 'transparent', cursor: 'pointer' }} onClick={() => setEditorData({ ...editorData, selectedColor: 'Silver' })}></div>
                      <div className="mock-color" style={{ background: '#3B82F6', outlineColor: editorData.selectedColor === 'Blue' ? '#3B82F6' : 'transparent', cursor: 'pointer' }} onClick={() => setEditorData({ ...editorData, selectedColor: 'Blue' })}></div>
                    </div>
                  </div>

                  {/* Size Options */}
                  {editorData.sizes && (
                    <div 
                      style={{ 
                        width: '100%', 
                        display: 'flex', 
                        flexDirection: 'column', 
                        gap: '6px', 
                        alignItems: (editorData.layout === 'stacked' || activeDevice === 'mobile') ? 'center' : 'flex-start',
                        cursor: 'pointer'
                      }}
                      onClick={(e) => {
                        if (e.target === e.currentTarget || (e.target as HTMLElement).tagName === 'DIV') {
                          setActiveSection('sizes');
                        }
                      }}
                    >
                      <div style={{ fontSize: '13px', fontWeight: 600, color: '#374151', textAlign: (editorData.layout === 'stacked' || activeDevice === 'mobile') ? 'center' : 'left' }}>
                        Size: <span style={{ fontWeight: 700, color: '#111827' }}>{editorData.selectedSize || 'M'}</span>
                      </div>
                      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center', justifyContent: (editorData.layout === 'stacked' || activeDevice === 'mobile') ? 'center' : 'flex-start' }}>
                        {editorData.sizes.map((sz: string) => {
                          const isUnavailable = editorData.unavailableSizes?.includes(sz);
                          const isSelected = editorData.selectedSize === sz;
                          const showCross = isUnavailable && editorData.crossUnavailable;

                          const borderStyle = isSelected 
                            ? '2px solid #16A34A' 
                            : isUnavailable 
                              ? (showCross ? '1px solid #D1D5DB' : '1px dashed #D1D5DB')
                              : '1px solid #D1D5DB';

                          const backgroundStyle = isSelected 
                            ? '#F0FDF4' 
                            : 'white';

                          return (
                            <button
                              key={sz}
                              onClick={(e) => {
                                e.stopPropagation();
                                if (isUnavailable) return;
                                setEditorData({ ...editorData, selectedSize: sz });
                                setActiveSection('sizes');
                              }}
                              style={{
                                width: '44px',
                                height: '38px',
                                padding: 0,
                                boxSizing: 'border-box',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                borderRadius: '6px',
                                border: borderStyle,
                                background: backgroundStyle,
                                color: isSelected 
                                  ? '#16A34A' 
                                  : isUnavailable 
                                    ? '#9CA3AF' 
                                    : '#374151',
                                fontWeight: 600,
                                fontSize: '13px',
                                cursor: isUnavailable ? 'not-allowed' : 'pointer',
                                transition: 'all 0.15s ease',
                                position: 'relative',
                                opacity: isUnavailable ? 0.6 : 1
                              }}
                              title={isUnavailable ? `${sz} - Out of stock` : ''}
                            >
                              {sz}
                              {showCross && (
                                <div style={{
                                  position: 'absolute',
                                  top: 0,
                                  left: 0,
                                  width: '100%',
                                  height: '100%',
                                  pointerEvents: 'none'
                                }}>
                                  <svg width="100%" height="100%" style={{ position: 'absolute', top: 0, left: 0 }}>
                                    <line x1="10%" y1="10%" x2="90%" y2="90%" stroke="#D1D5DB" strokeWidth="1.2" />
                                    <line x1="10%" y1="90%" x2="90%" y2="10%" stroke="#D1D5DB" strokeWidth="1.2" />
                                  </svg>
                                </div>
                              )}
                            </button>
                          );
                        })}
                      </div>
                      
                      {editorData.showSizeChart && (
                        <div style={{ marginTop: '2px', width: '100%', display: 'flex', flexDirection: 'column', alignItems: (editorData.layout === 'stacked' || activeDevice === 'mobile') ? 'center' : 'flex-start' }}>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setEditorData({ ...editorData, sizeChartOpen: !editorData.sizeChartOpen });
                              setActiveSection('sizes');
                            }}
                            style={{
                              background: 'transparent',
                              border: 'none',
                              color: '#16A34A',
                              fontSize: '13px',
                              fontWeight: 600,
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px',
                              padding: 0
                            }}
                          >
                            Size Chart {editorData.sizeChartOpen ? '▲' : '▼'}
                          </button>
                          
                          {editorData.sizeChartOpen && (
                            <div 
                              onClick={(e) => e.stopPropagation()}
                              style={{
                                marginTop: '8px',
                                padding: '12px',
                                borderRadius: '8px',
                                background: '#F9FAFB',
                                border: '1px solid #E5E7EB',
                                fontSize: '12px',
                                color: '#4B5563',
                                width: '100%',
                                maxWidth: '320px',
                                boxSizing: 'border-box'
                              }}
                            >
                              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'center' }}>
                                <thead>
                                  <tr style={{ borderBottom: '1px solid #E5E7EB', fontWeight: 700, color: '#111827' }}>
                                    <th style={{ padding: '4px' }}>Size</th>
                                    <th style={{ padding: '4px' }}>Chest (in)</th>
                                    <th style={{ padding: '4px' }}>Waist (in)</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {[
                                    { s: 'S', c: '34-36', w: '28-30' },
                                    { s: 'M', c: '38-40', w: '32-34' },
                                    { s: 'L', c: '42-44', w: '36-38' },
                                    { s: 'XL', c: '46-48', w: '40-42' }
                                  ].map((row) => (
                                    <tr key={row.s} style={{ borderBottom: '1px solid #F3F4F6' }}>
                                      <td style={{ padding: '6px', fontWeight: 600, color: '#111827' }}>{row.s}</td>
                                      <td style={{ padding: '6px' }}>{row.c}</td>
                                      <td style={{ padding: '6px' }}>{row.w}</td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Quantity Selector */}
                  <div style={{ width: '100%' }}>
                    <div style={{ fontSize: '13px', fontWeight: 600, marginBottom: '6px', color: '#374151', textAlign: (editorData.layout === 'stacked' || activeDevice === 'mobile') ? 'center' : 'left' }}>Quantity</div>
                    <div style={{ display: 'flex', border: '1px solid #D1D5DB', borderRadius: '6px', width: 'fit-content', margin: (editorData.layout === 'stacked' || activeDevice === 'mobile') ? '0 auto' : '0', background: 'white' }}>
                      <button onClick={() => setEditorData({ ...editorData, quantity: Math.max(1, editorData.quantity - 1) })} style={{ padding: '8px 14px', background: 'transparent', border: 'none', cursor: 'pointer', color: '#4B5563', fontWeight: 500 }}>-</button>
                      <div style={{ padding: '8px 14px', borderLeft: '1px solid #D1D5DB', borderRight: '1px solid #D1D5DB', fontWeight: 600, color: '#111827', minWidth: '20px', textAlign: 'center' }}>{editorData.quantity}</div>
                      <button onClick={() => setEditorData({ ...editorData, quantity: editorData.quantity + 1 })} style={{ padding: '8px 14px', background: 'transparent', border: 'none', cursor: 'pointer', color: '#4B5563', fontWeight: 500 }}>+</button>
                    </div>
                  </div>
                </div>

                {/* Checkout Actions */}
                <div className="mock-actions" style={{ width: '100%', gap: '8px', marginTop: '4px' }}>
                  <button className="mock-btn add-to-cart" style={{ ...editorData.styles.cart, padding: '12px 16px', fontSize: '15px' }}>{editorData.buttonText}</button>
                  <button className="mock-btn buy-now" style={{ ...editorData.styles.buy, padding: '12px 16px', fontSize: '15px' }}>{editorData.buyNowText}</button>
                </div>

                {/* Stock Warning */}
                {activePlan === 'premium' && editorData.stockWarning && (
                  <div className="mock-stock-warning" style={{ width: '100%', marginTop: '12px', textAlign: 'left' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', fontWeight: 600, color: '#DC2626', marginBottom: '6px', justifyContent: (editorData.layout === 'stacked' || activeDevice === 'mobile') ? 'center' : 'flex-start' }}>
                      <span>🔥</span>
                      <span>{editorData.stockWarning.text.replace('{count}', editorData.stockWarning.count)}</span>
                    </div>
                    <div style={{ width: '100%', height: '6px', background: '#E5E7EB', borderRadius: '3px', overflow: 'hidden' }}>
                      <div style={{ 
                        width: `${Math.min(100, (editorData.stockWarning.count / editorData.stockWarning.max) * 100)}%`, 
                        height: '100%', 
                        background: '#EF4444', 
                        borderRadius: '3px',
                        transition: 'width 0.3s ease'
                      }}></div>
                    </div>
                  </div>
                )}

                {/* Trust Badges (Only when layout is stacked or in mobile view) */}
                {(editorData.layout === 'stacked' || activeDevice === 'mobile') && activePlan === 'premium' && editorData.trustBadges && (
                  <div className="mock-trust-badges" style={{ 
                    width: '100%', 
                    marginTop: '16px', 
                    padding: '14px 12px', 
                    background: '#F9FAFB', 
                    borderRadius: '8px', 
                    border: '1px solid #E5E7EB',
                    display: 'flex',
                    flexWrap: 'wrap',
                    justifyContent: 'center',
                    gap: '12px',
                    boxSizing: 'border-box'
                  }}>
                    {editorData.trustBadges.map((badge: any) => (
                      <div key={badge.id} style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '10px', 
                        textAlign: 'left',
                        minWidth: '200px',
                        flex: '1 1 0'
                      }}>
                        <div style={{ 
                          width: '32px', 
                          height: '32px', 
                          borderRadius: '50%', 
                          background: '#E5E7EB', 
                          display: 'flex', 
                          alignItems: 'center', 
                          justifyContent: 'center', 
                          fontSize: '16px', 
                          flexShrink: 0 
                        }}>
                          {badge.icon}
                        </div>
                        <div>
                          <div style={{ fontSize: '12px', fontWeight: 700, color: '#111827', lineHeight: '1.2' }}>{badge.title}</div>
                          <div style={{ fontSize: '10px', color: '#6B7280', marginTop: '1px', lineHeight: '1.2' }}>{badge.desc}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="sidebar-right">
          {isLockedPreview ? (
             <div style={{ padding: '24px', textAlign: 'center', color: '#6B7280', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: '16px', background: '#F9FAFB' }}>
               <span style={{ fontSize: '32px' }}>⚙️</span>
               <h3 style={{ margin: 0, color: '#111827' }}>Settings Locked</h3>
               <p style={{ margin: 0, fontSize: '13px' }}>You can only view the layout of paid templates in preview mode. Customization requires an active subscription.</p>
             </div>
          ) : (
            <>
          <div className="sidebar-header" style={{display: 'flex', justifyContent: 'space-between', textTransform: 'capitalize'}}>
            {activeSection === 'desc' ? 'Description' : activeSection === 'cart' ? 'Add To Cart' : activeSection === 'buy' ? 'Buy Now' : `Product ${activeSection}`}
            <span style={{cursor: 'pointer', color: '#9CA3AF'}}>🗑️</span>
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
                
                {activePlan !== 'free' && (
                  <>
                    <span className="prop-label">Discount Badge Label</span>
                    <input 
                      type="text" 
                      className="prop-select" 
                      style={{marginBottom: '16px', background: 'white'}} 
                      value={editorData.discountBadge}
                      onChange={(e) => setEditorData({...editorData, discountBadge: e.target.value})}
                      placeholder="e.g. Save 20%"
                    />
                    
                    <span className="prop-label">Badge Style Preset</span>
                    <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', flexWrap: 'wrap' }}>
                      {[
                        { label: 'Red', bg: '#FEE2E2', text: '#EF4444' },
                        { label: 'Green', bg: '#DCFCE7', text: '#16A34A' },
                        { label: 'Blue', bg: '#DBEAFE', text: '#2563EB' },
                        { label: 'Yellow', bg: '#FEF3C7', text: '#D97706' },
                        { label: 'Purple', bg: '#F3E8FF', text: '#9333EA' }
                      ].map((preset) => (
                        <button
                          key={preset.label}
                          onClick={() => setEditorData({
                            ...editorData,
                            styles: {
                              ...editorData.styles,
                              badge: { backgroundColor: preset.bg, color: preset.text }
                            }
                          })}
                          style={{
                            padding: '6px 12px',
                            borderRadius: '6px',
                            border: '1px solid #D1D5DB',
                            background: preset.bg,
                            color: preset.text,
                            fontSize: '12px',
                            fontWeight: 700,
                            cursor: 'pointer',
                            transition: 'all 0.15s ease'
                          }}
                        >
                          {preset.label}
                        </button>
                      ))}
                    </div>
                  </>
                )}
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

            {activeSection === 'reviews' && activePlan !== 'free' && editorData.reviews && (
              <>
                <span className="prop-label">Rating Score (0.0 - 5.0)</span>
                <input 
                  type="number" 
                  className="prop-select" 
                  style={{marginBottom: '16px', background: 'white'}} 
                  value={editorData.reviews.rating}
                  onChange={(e) => {
                    const val = Math.max(0, Math.min(5, Number(e.target.value)));
                    setEditorData({
                      ...editorData,
                      reviews: { ...editorData.reviews, rating: val }
                    });
                  }}
                  min={0}
                  max={5}
                  step={0.1}
                />
                
                <span className="prop-label">Review Count</span>
                <input 
                  type="number" 
                  className="prop-select" 
                  style={{marginBottom: '16px', background: 'white'}} 
                  value={editorData.reviews.count}
                  onChange={(e) => {
                    const val = Math.max(0, Math.round(Number(e.target.value)));
                    setEditorData({
                      ...editorData,
                      reviews: { ...editorData.reviews, count: val }
                    });
                  }}
                  min={0}
                  step={1}
                />
              </>
            )}

            {activeSection === 'sizes' && editorData.sizes && (
              <>
                <span className="prop-label">Custom Sizes (comma separated)</span>
                <input 
                  type="text" 
                  className="prop-select" 
                  style={{marginBottom: '16px', background: 'white'}} 
                  value={sizesRaw !== null ? sizesRaw : editorData.sizes.join(', ')}
                  onChange={(e) => {
                    const val = e.target.value;
                    setSizesRaw(val);
                    const list = val.split(',').map(s => s.trim()).filter(Boolean);
                    setEditorData({
                      ...editorData,
                      sizes: list,
                      selectedSize: list.includes(editorData.selectedSize) ? editorData.selectedSize : (list[0] || '')
                    });
                  }}
                  placeholder="e.g. S, M, L, XL"
                />

                <span className="prop-label">Default Selected Size</span>
                <select
                  className="prop-select"
                  style={{marginBottom: '16px', background: 'white'}}
                  value={editorData.selectedSize}
                  onChange={(e) => setEditorData({ ...editorData, selectedSize: e.target.value })}
                >
                  {editorData.sizes.map((sz: string) => (
                    <option key={sz} value={sz}>{sz}</option>
                  ))}
                </select>

                <span className="prop-label">Unavailable Sizes (comma separated)</span>
                <input 
                  type="text" 
                  className="prop-select" 
                  style={{marginBottom: '16px', background: 'white'}} 
                  value={unavailableRaw !== null ? unavailableRaw : (editorData.unavailableSizes || []).join(', ')}
                  onChange={(e) => {
                    const val = e.target.value;
                    setUnavailableRaw(val);
                    const list = val.split(',').map(s => s.trim()).filter(Boolean);
                    setEditorData({
                      ...editorData,
                      unavailableSizes: list
                    });
                  }}
                  placeholder="e.g. L, XL"
                />

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '8px' }}>
                  <input
                    type="checkbox"
                    id="show-size-chart"
                    checked={editorData.showSizeChart}
                    onChange={(e) => setEditorData({ ...editorData, showSizeChart: e.target.checked })}
                    style={{ cursor: 'pointer', width: '16px', height: '16px' }}
                  />
                  <label htmlFor="show-size-chart" style={{ fontSize: '13px', fontWeight: 600, color: '#374151', cursor: 'pointer' }}>
                    Show Size Chart collapsible link
                  </label>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '12px' }}>
                  <input
                    type="checkbox"
                    id="cross-unavailable"
                    checked={editorData.crossUnavailable}
                    onChange={(e) => setEditorData({ ...editorData, crossUnavailable: e.target.checked })}
                    style={{ cursor: 'pointer', width: '16px', height: '16px' }}
                  />
                  <label htmlFor="cross-unavailable" style={{ fontSize: '13px', fontWeight: 600, color: '#374151', cursor: 'pointer' }}>
                    Cross out unavailable sizes
                  </label>
                </div>
              </>
            )}

            {activeSection === 'images' && (
              <>
                <span className="prop-label">Main Product Image</span>
                
                {/* Hidden File Input for Custom Image Upload */}
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onload = (event) => {
                        if (event.target?.result) {
                          setEditorData({ ...editorData, image: event.target.result as string });
                        }
                      };
                      reader.readAsDataURL(file);
                    }
                  }} 
                  style={{ display: 'none' }}
                  id="main-image-upload"
                />

                {/* Upload Button */}
                <label 
                  htmlFor="main-image-upload" 
                  style={{ 
                    display: 'block',
                    padding: '16px', 
                    border: '1px dashed #D1D5DB', 
                    borderRadius: '8px', 
                    textAlign: 'center', 
                    marginBottom: '16px', 
                    cursor: 'pointer', 
                    background: 'white',
                    transition: 'all 0.2s ease',
                    boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
                  }}
                >
                  <div style={{ fontSize: '28px', marginBottom: '8px' }}>📸</div>
                  <div style={{ fontSize: '14px', fontWeight: 600, color: '#374151' }}>Upload Custom Image</div>
                  <div style={{ fontSize: '11px', color: '#6B7280', marginTop: '4px' }}>PNG, JPG, or SVG up to 5MB</div>
                </label>

                <span className="prop-label" style={{ marginTop: '12px' }}>Or Choose a Preset Product</span>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px', marginBottom: '16px' }}>
                  {[
                    { name: '💡 Minimal Lamp', url: 'https://cdn.shopify.com/s/files/1/0533/2089/files/placeholder-images-product-5_large.png' },
                    { name: '🔊 Smart Speaker', url: 'https://cdn.shopify.com/s/files/1/0533/2089/files/placeholder-images-product-6_large.png' },
                    { name: '⌚ Luxury Watch', url: 'https://cdn.shopify.com/s/files/1/0533/2089/files/placeholder-images-product-2_large.png' },
                    { name: '🧴 Glow Cream', url: 'https://cdn.shopify.com/s/files/1/0533/2089/files/placeholder-images-product-4_large.png' },
                    { name: '👟 Athletic Shoe', url: 'https://cdn.shopify.com/s/files/1/0533/2089/files/placeholder-images-product-1_large.png' },
                    { name: '👕 Fashion Store', url: 'https://cdn.shopify.com/s/files/1/0533/2089/files/placeholder-images-collection-3_large.png' }
                  ].map(preset => (
                    <button 
                      key={preset.url}
                      onClick={() => setEditorData({ ...editorData, image: preset.url })}
                      style={{
                        padding: '8px',
                        borderRadius: '6px',
                        border: editorData.image === preset.url ? '2px solid #16A34A' : '1px solid #D1D5DB',
                        background: 'white',
                        fontSize: '11px',
                        fontWeight: editorData.image === preset.url ? 700 : 500,
                        color: editorData.image === preset.url ? '#16A34A' : '#4B5563',
                        cursor: 'pointer',
                        textAlign: 'left',
                        boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      {preset.name}
                    </button>
                  ))}
                </div>

                <span className="prop-label">Or Paste Image URL</span>
                <input 
                  type="text" 
                  className="prop-select" 
                  style={{marginBottom: '24px', background: 'white'}} 
                  value={editorData.image.startsWith('data:') ? '' : editorData.image}
                  onChange={(e) => setEditorData({...editorData, image: e.target.value})}
                  placeholder="Paste URL (e.g. https://...)"
                />

                {['standard', 'premium'].includes(activePlan) ? (
                  <div style={{ marginBottom: '24px' }}>
                    <span className="prop-label" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      Image Background Color
                      <span style={{ fontSize: '11px', color: '#16A34A', fontWeight: 600, background: '#D1FAE5', padding: '2px 6px', borderRadius: '4px' }}>Pro Feature ✨</span>
                    </span>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '12px' }}>
                      {[
                        { name: 'Transparent', value: 'transparent' },
                        { name: 'Off-White', value: '#FAF9F6' },
                        { name: 'Light Gray', value: '#F3F4F6' },
                        { name: 'Soft Gray', value: '#E5E7EB' },
                        { name: 'Soft Blue', value: '#EFF6FF' },
                        { name: 'Soft Rose', value: '#FFF1F2' },
                        { name: 'Dark Gray', value: '#374151' }
                      ].map(preset => (
                        <button
                          key={preset.value}
                          onClick={() => setEditorData({ ...editorData, imageBgColor: preset.value })}
                          style={{
                            padding: '6px 10px',
                            borderRadius: '4px',
                            border: editorData.imageBgColor === preset.value ? '2px solid #16A34A' : '1px solid #D1D5DB',
                            background: preset.value === 'transparent' ? 'white' : preset.value,
                            color: preset.value === '#374151' ? 'white' : '#374151',
                            fontSize: '11px',
                            fontWeight: editorData.imageBgColor === preset.value ? 700 : 400,
                            cursor: 'pointer'
                          }}
                        >
                          {preset.name}
                        </button>
                      ))}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span style={{ fontSize: '12px', color: '#4B5563', fontWeight: 500 }}>Custom Color:</span>
                      <input 
                        type="color" 
                        value={editorData.imageBgColor && editorData.imageBgColor.startsWith('#') ? editorData.imageBgColor : '#F9FAFB'}
                        onChange={(e) => setEditorData({ ...editorData, imageBgColor: e.target.value })}
                        style={{
                          border: '1px solid #D1D5DB',
                          padding: '1px',
                          borderRadius: '4px',
                          width: '40px',
                          height: '28px',
                          cursor: 'pointer'
                        }}
                      />
                      <span style={{ fontSize: '12px', fontFamily: 'monospace', color: '#6B7280' }}>{editorData.imageBgColor}</span>
                    </div>
                  </div>
                ) : (
                  <div style={{ marginBottom: '24px' }}>
                    <span className="prop-label" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      Image Background Color
                      <span style={{color: '#D1D5DB'}} title="Requires Standard or Premium Plan">🔒</span>
                    </span>
                    <div style={{
                      padding: '12px',
                      background: '#F9FAFB',
                      border: '1px solid #E5E7EB',
                      borderRadius: '8px',
                      fontSize: '12px',
                      color: '#EF4444',
                      fontWeight: 500
                    }}>
                      Upgrade to Standard or Premium to customize image background colors.
                    </div>
                  </div>
                )}

                {activePlan !== 'free' && (
                  <>
                    <span className="prop-label" style={{ display: 'flex', justifyContent: 'space-between' }}>
                      Additional Gallery
                      <span style={{ color: '#6B7280', fontSize: '12px', fontWeight: 400 }}>
                        {activePlan === 'basic' && 'Max 3 images'}
                        {activePlan === 'standard' && 'Max 5 images'}
                        {activePlan === 'premium' && 'Max 7 images'}
                      </span>
                    </span>
                    <div style={{ padding: '16px', border: '1px dashed #D1D5DB', borderRadius: '8px', textAlign: 'center', marginBottom: '24px', cursor: 'pointer', background: '#F9FAFB' }}>
                      <div style={{ fontSize: '24px', marginBottom: '8px' }}>🖼️</div>
                      <div style={{ fontSize: '14px', fontWeight: 500 }}>Upload Gallery Images</div>
                    </div>
                  </>
                )}

                {activePlan === 'premium' ? (
                  <>
                    <span className="prop-label" style={{ display: 'flex', justifyContent: 'space-between' }}>
                      Product Video
                      <span style={{ color: '#6B7280', fontSize: '12px', fontWeight: 400 }}>Max 1 video</span>
                    </span>
                    <div style={{ padding: '16px', border: '1px dashed #D1D5DB', borderRadius: '8px', textAlign: 'center', marginBottom: '24px', cursor: 'pointer', background: '#F9FAFB' }}>
                      <div style={{ fontSize: '24px', marginBottom: '8px' }}>🎥</div>
                      <div style={{ fontSize: '14px', fontWeight: 500 }}>Upload Product Video</div>
                    </div>
                  </>
                ) : (
                  <>
                    <span className="prop-label" style={{ display: 'flex', justifyContent: 'space-between' }}>
                      Product Video
                      <span style={{color: '#D1D5DB'}} title="Requires Premium Plan">🔒</span>
                    </span>
                    <div style={{ padding: '16px', border: '1px dashed #E5E7EB', borderRadius: '8px', textAlign: 'center', marginBottom: '24px', cursor: 'not-allowed', background: '#F3F4F6', opacity: 0.5 }}>
                      <div style={{ fontSize: '24px', marginBottom: '8px' }}>🎥</div>
                      <div style={{ fontSize: '14px', fontWeight: 500 }}>Product Video (Premium Only)</div>
                    </div>
                  </>
                )}
              </>
            )}

            {activeSection === 'vendor' && (
              <>
                <span className="prop-label">Vendor Name</span>
                <input 
                  type="text" 
                  className="prop-select" 
                  style={{marginBottom: '16px', background: 'white'}} 
                  value={editorData.vendor?.name || ''}
                  onChange={(e) => setEditorData({
                    ...editorData,
                    vendor: {
                      ...editorData.vendor,
                      name: e.target.value
                    }
                  })}
                />

                <span className="prop-label">Manufacturer</span>
                <input 
                  type="text" 
                  className="prop-select" 
                  style={{marginBottom: '16px', background: 'white'}} 
                  value={editorData.vendor?.manufacturer || ''}
                  onChange={(e) => setEditorData({
                    ...editorData,
                    vendor: {
                      ...editorData.vendor,
                      manufacturer: e.target.value
                    }
                  })}
                />

                <span className="prop-label">Wholesaler</span>
                <input 
                  type="text" 
                  className="prop-select" 
                  style={{marginBottom: '16px', background: 'white'}} 
                  value={editorData.vendor?.wholesaler || ''}
                  onChange={(e) => setEditorData({
                    ...editorData,
                    vendor: {
                      ...editorData.vendor,
                      wholesaler: e.target.value
                    }
                  })}
                />

                <span className="prop-label">Original Source</span>
                <input 
                  type="text" 
                  className="prop-select" 
                  style={{marginBottom: '16px', background: 'white'}} 
                  value={editorData.vendor?.source || ''}
                  onChange={(e) => setEditorData({
                    ...editorData,
                    vendor: {
                      ...editorData.vendor,
                      source: e.target.value
                    }
                  })}
                />
              </>
            )}

            {activeSection === 'trust' && (
              <>
                <div style={{ borderBottom: '1px solid #E5E7EB', paddingBottom: '12px', marginBottom: '16px' }}>
                  <span className="prop-label" style={{ fontWeight: 600, fontSize: '14px', color: '#111827' }}>Stock Warning Settings</span>
                  
                  <span className="prop-label" style={{ marginTop: '12px' }}>Warning Message Template</span>
                  <input 
                    type="text" 
                    className="prop-select" 
                    style={{ marginBottom: '12px', background: 'white' }} 
                    value={editorData.stockWarning?.text || ''}
                    onChange={(e) => setEditorData({
                      ...editorData,
                      stockWarning: { ...editorData.stockWarning, text: e.target.value }
                    })}
                  />
                  <div style={{ fontSize: '11px', color: '#6B7280', marginBottom: '12px', marginTop: '-8px' }}>Use <code>{'{count}'}</code> to display the stock number dynamically.</div>

                  <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
                    <div style={{ flex: 1 }}>
                      <span className="prop-label">Current Stock</span>
                      <input 
                        type="number" 
                        className="prop-select" 
                        style={{ background: 'white' }} 
                        value={editorData.stockWarning?.count ?? 8}
                        min={0}
                        onChange={(e) => setEditorData({
                          ...editorData,
                          stockWarning: { ...editorData.stockWarning, count: Number(e.target.value) }
                        })}
                      />
                    </div>
                    <div style={{ flex: 1 }}>
                      <span className="prop-label">Max Stock (Scale)</span>
                      <input 
                        type="number" 
                        className="prop-select" 
                        style={{ background: 'white' }} 
                        value={editorData.stockWarning?.max ?? 10}
                        min={1}
                        onChange={(e) => setEditorData({
                          ...editorData,
                          stockWarning: { ...editorData.stockWarning, max: Number(e.target.value) }
                        })}
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <span className="prop-label" style={{ fontWeight: 600, fontSize: '14px', color: '#111827', marginBottom: '12px' }}>Trust Badges Settings</span>
                  {editorData.trustBadges?.map((badge: any, idx: number) => (
                    <div key={badge.id} style={{ border: '1px solid #E5E7EB', borderRadius: '8px', padding: '12px', marginBottom: '16px', background: '#F9FAFB' }}>
                      <div style={{ fontWeight: 600, fontSize: '12px', color: '#4B5563', marginBottom: '8px' }}>Badge #{idx + 1}</div>
                      <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                        <div style={{ width: '60px' }}>
                          <span className="prop-label">Icon</span>
                          <input 
                            type="text" 
                            className="prop-select" 
                            style={{ background: 'white', textAlign: 'center' }} 
                            value={badge.icon}
                            onChange={(e) => {
                              const newList = [...editorData.trustBadges];
                              newList[idx] = { ...badge, icon: e.target.value };
                              setEditorData({ ...editorData, trustBadges: newList });
                            }}
                          />
                        </div>
                        <div style={{ flex: 1 }}>
                          <span className="prop-label">Title</span>
                          <input 
                            type="text" 
                            className="prop-select" 
                            style={{ background: 'white' }} 
                            value={badge.title}
                            onChange={(e) => {
                              const newList = [...editorData.trustBadges];
                              newList[idx] = { ...badge, title: e.target.value };
                              setEditorData({ ...editorData, trustBadges: newList });
                            }}
                          />
                        </div>
                      </div>
                      <span className="prop-label">Description</span>
                      <input 
                        type="text" 
                        className="prop-select" 
                        style={{ background: 'white', marginBottom: 0 }} 
                        value={badge.desc}
                        onChange={(e) => {
                          const newList = [...editorData.trustBadges];
                          newList[idx] = { ...badge, desc: e.target.value };
                          setEditorData({ ...editorData, trustBadges: newList });
                        }}
                      />
                    </div>
                  ))}
                </div>
              </>
            )}

            {['variants'].includes(activeSection) && (
              <div style={{color: '#6B7280', fontSize: '13px', marginBottom: '24px', fontStyle: 'italic'}}>
                Content options coming soon for this section.
              </div>
            )}

          </div>
          </>
          )}
        </div>
      </div>
    </div>
  );
}
