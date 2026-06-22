import type { LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { authenticate } from "../shopify.server";
import prisma from "../db.server"; // eslint-disable-line

export const loader = async ({ request }: LoaderFunctionArgs) => {
  // authenticate.public.appProxy securely validates the request came from Shopify
  const { session } = await authenticate.public.appProxy(request);
  
  const url = new URL(request.url);
  const pageId = url.searchParams.get("pageId");
  const shop = url.searchParams.get("shop");

  if (!pageId || !shop) {
    return json({ error: "Missing pageId or shop parameter" }, { status: 400 });
  }

  try {
    const page = await prisma.productPage.findUnique({
      where: { id: pageId, shopId: shop },
    });

    if (!page) {
      return json({ html: `<p style="padding: 20px; text-align: center; border: 1px dashed #ccc;">Product Page (ID: ${pageId}) not found or unpublished.</p>` });
    }

    // Try parsing settings, otherwise fallback
    let settingsObj: any = {};
    try {
      settingsObj = JSON.parse(page.settings as string);
    } catch(e) {}

    const title = settingsObj.title || page.name;
    const desc = settingsObj.desc || settingsObj.description || "";
    const price = settingsObj.price || "$0.00";
    const compareAt = settingsObj.compareAt || "";
    const image = settingsObj.image || "";
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
          background: #F9FAFB;
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
          font-size: 14px;
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
          font-size: 28px;
          font-weight: 700;
          color: #111827;
          margin: 0;
        }
        .pp-reviews {
          display: flex;
          align-items: center;
          gap: 8px;
          color: #4B5563;
          font-size: 14px;
        }
        .pp-price-wrap {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .pp-price {
          font-size: 24px;
          font-weight: 700;
          color: #111827;
        }
        .pp-compare {
          text-decoration: line-through;
          color: #9CA3AF;
          font-size: 16px;
        }
        .pp-save {
          background: #FEE2E2;
          color: #EF4444;
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 12px;
          font-weight: 600;
        }
        .pp-desc {
          color: #4B5563;
          line-height: 1.6;
          font-size: 16px;
        }
        .pp-options {
          margin-top: 16px;
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
          background: white;
          color: #111827;
          border: 2px solid #111827;
          border-radius: 8px;
          font-size: 16px;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.2s;
        }
        .pp-add-btn:hover {
          background: #111827;
          color: white;
        }
        .pp-buy-btn {
          width: 100%;
          padding: 16px;
          background: #16A34A;
          color: white;
          border: none;
          border-radius: 8px;
          font-size: 16px;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.2s;
        }
        .pp-buy-btn:hover {
          background: #15803D;
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
          ` : `
            <div class="pp-thumbnails">
              <div class="pp-thumbnail">
                 <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>
              </div>
              <div class="pp-thumbnail">
                 <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>
              </div>
              <div class="pp-thumbnail">
                 <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>
              </div>
            </div>
          `}

          ${layout === 'split' ? `
            <div class="pp-desc-left">
              <div class="pp-desc-title">Product Description</div>
              <div class="pp-desc">${desc}</div>
            </div>
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

    return json({ html: fullHtml });
  } catch (error) {
    console.error("Error fetching product page:", error);
    return json({ error: "Internal Server Error" }, { status: 500 });
  }
};
