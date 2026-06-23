import type { LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { authenticate } from "../shopify.server";
import prisma from "../db.server"; // eslint-disable-line

export const loader = async ({ request }: LoaderFunctionArgs) => {
  // authenticate.public.appProxy securely validates the request came from Shopify
  await authenticate.public.appProxy(request);
  
  const url = new URL(request.url);
  const shop = url.searchParams.get("shop");

  if (!shop) {
    return json({ error: "Missing shop parameter" }, { status: 400 });
  }

  const isDesignMode = url.searchParams.get("designMode") === 'true';

  try {
    const page = await prisma.productPage.findFirst({
      where: isDesignMode 
        ? { shopId: shop } // order by updated at desc
        : { shopId: shop, status: 'Published' },
      orderBy: isDesignMode ? { updatedAt: 'desc' } : undefined
    });

    if (!page) {
      return json({ html: "" }); // Return empty if no template
    }

    // Try parsing settings if it's a string, otherwise use directly
    let settingsObj: any = page.settings || {};
    if (typeof settingsObj === 'string') {
      try {
        settingsObj = JSON.parse(settingsObj);
      } catch(e) {}
    }

    const title = settingsObj.title || page.name;
    const desc = settingsObj.desc || settingsObj.description || "";
    const price = settingsObj.price || "$0.00";
    const compareAt = settingsObj.compareAt || "";
    const image = settingsObj.image || "";
    const imageBgColor = settingsObj.imageBgColor || "transparent";
    const thumbnails = settingsObj.thumbnails || [];
    const layout = settingsObj.layout || "split";
    const sizes = settingsObj.sizes || [];
    const reviews = settingsObj.reviews || { rating: 0, count: 0 };
    const selectedSize = settingsObj.selectedSize || sizes[0];
    const unavailableSizes = settingsObj.unavailableSizes || [];
    const buttonText = settingsObj.buttonText || "Add to Cart";
    const buyNowText = settingsObj.buyNowText || "Buy it Now";
    const vendor = settingsObj.vendor || null;
    const trustBadges = settingsObj.trustBadges || [];
    
    // Dynamic Styles
    const styles = settingsObj.styles || {
      title: { fontFamily: 'inherit', fontSize: 28, fontWeight: '700', color: '#111827', textAlign: 'left' },
      price: { fontFamily: 'inherit', fontSize: 24, fontWeight: '700', color: '#111827', textAlign: 'left' },
      desc: { fontFamily: 'inherit', fontSize: 16, fontWeight: '400', color: '#4B5563', textAlign: 'left' },
      cart: { fontFamily: 'inherit', fontSize: 16, fontWeight: '700', color: '#111827', textAlign: 'center' },
      buy: { fontFamily: 'inherit', fontSize: 16, fontWeight: '700', color: '#ffffff', textAlign: 'center' },
      badge: { backgroundColor: '#FEE2E2', color: '#EF4444' }
    };

    const fullHtml = `
      <style>
        .pp-container {
          font-family: inherit;
          max-width: 1200px;
          margin: 0 auto;
          display: flex;
          flex-direction: ${layout === 'stacked' ? 'column' : 'row'};
          gap: 40px;
          align-items: flex-start;
        }
        .pp-gallery-section {
          flex: 1;
          width: 100%;
          min-width: 0;
        }
        .pp-gallery img {
          width: 100%;
          border-radius: 8px;
          object-fit: cover;
          background-color: ${imageBgColor};
        }
        .pp-thumbnails {
          display: flex;
          gap: 12px;
          margin-top: 16px;
        }
        .pp-thumbnail {
          width: 80px;
          height: 80px;
          border-radius: 8px;
          border: 1px dashed #D1D5DB;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #9CA3AF;
          background: ${imageBgColor !== 'transparent' ? imageBgColor : '#F9FAFB'};
        }
        .pp-thumbnail img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          border-radius: 8px;
        }
        .pp-desc-left {
          margin-top: 32px;
          padding-top: 24px;
          border-top: 1px solid #E5E7EB;
        }
        .pp-desc-title {
          font-weight: 700;
          color: #111827;
          margin-bottom: 12px;
          font-size: 13px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        .pp-details {
          flex: 1;
          width: 100%;
          min-width: 0;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        .pp-title {
          font-family: ${styles.title?.fontFamily || 'inherit'};
          font-size: ${styles.title?.fontSize || 28}px;
          font-weight: ${styles.title?.fontWeight || 700};
          color: ${styles.title?.color || '#111827'};
          text-align: ${styles.title?.textAlign || 'left'};
          margin: 0;
        }
        .pp-reviews {
          display: flex;
          align-items: center;
          gap: 8px;
          color: #4B5563;
          font-size: 14px;
          justify-content: ${styles.title?.textAlign === 'center' ? 'center' : 'flex-start'};
        }
        .pp-price-wrap {
          display: flex;
          align-items: center;
          gap: 12px;
          justify-content: ${styles.price?.textAlign === 'center' ? 'center' : 'flex-start'};
        }
        .pp-price {
          font-family: ${styles.price?.fontFamily || 'inherit'};
          font-size: ${styles.price?.fontSize || 24}px;
          font-weight: ${styles.price?.fontWeight || 700};
          color: ${styles.price?.color || '#111827'};
        }
        .pp-compare {
          text-decoration: line-through;
          color: #9CA3AF;
          font-size: 16px;
        }
        .pp-save {
          background: ${styles.badge?.backgroundColor || '#FEE2E2'};
          color: ${styles.badge?.color || '#EF4444'};
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 12px;
          font-weight: 600;
        }
        .pp-desc {
          font-family: ${styles.desc?.fontFamily || 'inherit'};
          font-size: ${styles.desc?.fontSize || 16}px;
          font-weight: ${styles.desc?.fontWeight || 400};
          color: ${styles.desc?.color || '#4B5563'};
          text-align: ${styles.desc?.textAlign || 'left'};
          line-height: 1.6;
        }
        .pp-options {
          margin-top: 16px;
          text-align: ${styles.desc?.textAlign === 'center' ? 'center' : 'left'};
        }
        .pp-opt-title {
          font-weight: 600;
          margin-bottom: 8px;
          font-size: 14px;
          color: #111827;
        }
        .pp-colors {
          display: flex;
          gap: 12px;
          justify-content: ${styles.desc?.textAlign === 'center' ? 'center' : 'flex-start'};
        }
        .pp-color {
          width: 32px; height: 32px; border-radius: 50%;
          border: 2px solid transparent;
          cursor: pointer;
        }
        .pp-color.active { border-color: #111827; padding: 2px; background-clip: content-box; }
        .pp-sizes {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
          justify-content: ${styles.desc?.textAlign === 'center' ? 'center' : 'flex-start'};
        }
        .pp-size {
          padding: 8px 16px;
          border: 1px solid #D1D5DB;
          border-radius: 6px;
          font-size: 14px;
          font-weight: 600;
          color: #374151;
          background: white;
          cursor: pointer;
        }
        .pp-size.active {
          border-color: #16A34A;
          color: #16A34A;
          background: #F0FDF4;
        }
        .pp-size.disabled {
          color: #D1D5DB;
          position: relative;
          background: #F9FAFB;
          cursor: not-allowed;
          overflow: hidden;
        }
        .pp-size.disabled::after {
          content: "";
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: linear-gradient(to top right, transparent 48%, #D1D5DB 49%, #D1D5DB 51%, transparent 52%);
        }
        .pp-qty-wrap {
          display: inline-flex;
          border: 1px solid #D1D5DB;
          border-radius: 6px;
          overflow: hidden;
          margin-top: 8px;
        }
        .pp-qty-btn {
          padding: 8px 16px;
          background: white;
          border: none;
          cursor: pointer;
          font-size: 16px;
        }
        .pp-qty-input {
          width: 40px;
          text-align: center;
          border: none;
          border-left: 1px solid #D1D5DB;
          border-right: 1px solid #D1D5DB;
          font-weight: 600;
        }
        .pp-actions {
          display: flex;
          flex-direction: column;
          gap: 12px;
          margin-top: 16px;
        }
        .pp-add-btn {
          width: 100%;
          padding: 16px;
          background: transparent;
          color: ${styles.cart?.color || '#111827'};
          border: 2px solid ${styles.cart?.color || '#111827'};
          border-radius: 8px;
          font-family: ${styles.cart?.fontFamily || 'inherit'};
          font-size: ${styles.cart?.fontSize || 16}px;
          font-weight: ${styles.cart?.fontWeight || 700};
          cursor: pointer;
          transition: all 0.2s;
        }
        .pp-add-btn:hover {
          background: ${styles.cart?.color || '#111827'};
          color: white;
        }
        .pp-buy-btn {
          width: 100%;
          padding: 16px;
          background: #16A34A;
          color: ${styles.buy?.color || '#ffffff'};
          border: none;
          border-radius: 8px;
          font-family: ${styles.buy?.fontFamily || 'inherit'};
          font-size: ${styles.buy?.fontSize || 16}px;
          font-weight: ${styles.buy?.fontWeight || 700};
          cursor: pointer;
          transition: all 0.2s;
        }
        .pp-buy-btn:hover {
          background: #15803D;
        }
        .pp-vendor-details {
          padding: 12px;
          border-radius: 8px;
          background: #F9FAFB;
          border: 1px solid #E5E7EB;
          font-size: 13px;
          width: 100%;
          box-sizing: border-box;
          margin-top: 20px;
        }
        .pp-trust-badges {
          padding: 14px 12px;
          background: #F9FAFB;
          border-radius: 8px;
          border: 1px solid #E5E7EB;
          display: flex;
          flex-direction: column;
          gap: 12px;
          margin-top: 20px;
        }
        @media (max-width: 768px) {
          .pp-container { flex-direction: column !important; align-items: center !important; }
          .pp-details, .pp-desc-left { width: 100% !important; text-align: left !important; }
        }
      </style>

      <div class="pp-container">
        <!-- Left Side: Gallery & (if split) Description -->
        <div class="pp-gallery-section">
          <div class="pp-gallery">
            <img src="${image || 'https://cdn.shopify.com/s/files/1/0533/2089/files/placeholder-images-product-5_large.png'}" alt="${title}" />
          </div>
          
          ${thumbnails.length > 0 ? `
            <div class="pp-thumbnails">
              ${thumbnails.map((t: string) => `
                <div class="pp-thumbnail">
                  <img src="${t}" alt="Thumbnail" />
                </div>
              `).join('')}
            </div>
          ` : ''}

          ${layout === 'split' ? `
            <div class="pp-desc-left">
              <div class="pp-desc-title">Product Description</div>
              <div class="pp-desc">${desc}</div>
            </div>
            
            ${vendor && vendor.name ? `
              <div class="pp-vendor-details">
                <div style="font-weight: 600; color: #374151; margin-bottom: 6px;">Vendor Details</div>
                <div style="display: grid; grid-template-columns: auto 1fr; gap: 4px 12px; color: #4B5563;">
                  <span style="color: #6B7280;">Vendor:</span> <span>${vendor.name}</span>
                  ${vendor.manufacturer ? `<span style="color: #6B7280;">Manufacturer:</span> <span>${vendor.manufacturer}</span>` : ''}
                </div>
              </div>
            ` : ''}

            ${trustBadges && trustBadges.length > 0 ? `
              <div class="pp-trust-badges">
                ${trustBadges.map((badge: any) => `
                  <div style="display: flex; align-items: center; gap: 10px;">
                    <div style="width: 32px; height: 32px; border-radius: 50%; background: #E5E7EB; display: flex; align-items: center; justify-content: center; font-size: 16px;">
                      ${badge.icon}
                    </div>
                    <div>
                      <div style="font-size: 12px; font-weight: 700; color: #111827;">${badge.title}</div>
                      <div style="font-size: 10px; color: #6B7280;">${badge.desc}</div>
                    </div>
                  </div>
                `).join('')}
              </div>
            ` : ''}
          ` : ''}
        </div>

        <!-- Right Side: Details -->
        <div class="pp-details">
          <h1 class="pp-title">${title}</h1>
          
          ${reviews.count > 0 ? `
            <div class="pp-reviews">
              <span style="color: #FBBF24;">★★★★★</span>
              <span style="font-weight: 600; color: #111827;">(${reviews.rating})</span>
              <span>• ${reviews.count} Reviews</span>
            </div>
          ` : ''}

          <div class="pp-price-wrap">
            <span class="pp-price">${price}</span>
            ${compareAt ? `<span class="pp-compare">${compareAt}</span>` : ''}
            ${compareAt ? `<span class="pp-save">Save 15%</span>` : ''}
          </div>

          ${layout !== 'split' ? `
            <div class="pp-desc" style="margin-top: 16px;">${desc}</div>
            
            ${vendor && vendor.name ? `
              <div class="pp-vendor-details">
                <div style="font-weight: 600; color: #374151; margin-bottom: 6px;">Vendor Details</div>
                <div style="display: grid; grid-template-columns: auto 1fr; gap: 4px 12px; color: #4B5563;">
                  <span style="color: #6B7280;">Vendor:</span> <span>${vendor.name}</span>
                </div>
              </div>
            ` : ''}

            ${trustBadges && trustBadges.length > 0 ? `
              <div class="pp-trust-badges">
                ${trustBadges.map((badge: any) => `
                  <div style="display: flex; align-items: center; gap: 10px;">
                    <div style="width: 32px; height: 32px; border-radius: 50%; background: #E5E7EB; display: flex; align-items: center; justify-content: center; font-size: 16px;">
                      ${badge.icon}
                    </div>
                    <div>
                      <div style="font-size: 12px; font-weight: 700; color: #111827;">${badge.title}</div>
                      <div style="font-size: 10px; color: #6B7280;">${badge.desc}</div>
                    </div>
                  </div>
                `).join('')}
              </div>
            ` : ''}
          ` : ''}

          <!-- Color Options -->
          <div class="pp-options">
            <div class="pp-opt-title">Color: <span style="font-weight: normal; color: #6B7280;">Black</span></div>
            <div class="pp-colors">
              <div class="pp-color active" style="background-color: #111827;"></div>
              <div class="pp-color" style="background-color: #E5E7EB;"></div>
              <div class="pp-color" style="background-color: #3B82F6;"></div>
            </div>
          </div>

          <!-- Size Options -->
          ${sizes.length > 0 ? `
            <div class="pp-options">
              <div class="pp-opt-title">Size: <span style="font-weight: bold;">${selectedSize}</span></div>
              <div class="pp-sizes">
                ${sizes.map((s: string) => `
                  <div class="pp-size ${s === selectedSize ? 'active' : ''} ${unavailableSizes.includes(s) ? 'disabled' : ''}">${s}</div>
                `).join('')}
              </div>
              <div style="color: #16A34A; font-size: 13px; font-weight: 600; margin-top: 8px; cursor: pointer;">Size Chart ▼</div>
            </div>
          ` : ''}

          <!-- Quantity -->
          <div class="pp-options">
            <div class="pp-opt-title">Quantity</div>
            <div class="pp-qty-wrap">
              <button class="pp-qty-btn">-</button>
              <input type="text" class="pp-qty-input" value="1" readonly />
              <button class="pp-qty-btn">+</button>
            </div>
          </div>

          <!-- Action Buttons -->
          <div class="pp-actions">
            <button class="pp-add-btn">${buttonText}</button>
            <button class="pp-buy-btn">${buyNowText}</button>
          </div>
        </div>
      </div>
    `;

    return new Response(JSON.stringify({ html: fullHtml }), {
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
        "Pragma": "no-cache",
        "Expires": "0"
      }
    });
  } catch (error) {
    console.error("Error fetching product page:", error);
    return json({ error: "Internal Server Error" }, { status: 500 });
  }
};
