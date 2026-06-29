import re

with open('app/routes/app.proxy.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# I need to extract the parts that render details on the right side.
start_marker = "        <!-- Right Side: Details -->\n        <div class=\"pp-details\">"
end_marker = "      </div>\n    `;"

chunk = content[content.find(start_marker):content.find(end_marker)]

# Split chunk into blocks
header_str = """          <h1 class="pp-title">${title}</h1>
          
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
          </div>"""

desc_str = """          ${layout !== 'split' ? `
            <div class="pp-desc" style="margin-top: 16px;">${desc}</div>
          ` : ''}"""

vendor_str = """          ${layout !== 'split' && vendor && vendor.name ? `
              <div class="pp-vendor-details">
                <div style="font-weight: 600; color: #374151; margin-bottom: 6px;">Vendor Details</div>
                <div style="display: grid; grid-template-columns: auto 1fr; gap: 4px 12px; color: #4B5563;">
                  <span style="color: #6B7280;">Vendor:</span> <span>${vendor.name}</span>
                </div>
              </div>
          ` : ''}"""

trust_str = """          ${layout !== 'split' && trustBadges && trustBadges.length > 0 ? `
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
          ` : ''}"""

options_str = """          <!-- Color Options -->
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
          </div>"""

actions_str = """          <!-- Action Buttons -->
          <div class="pp-actions">
            <button class="pp-add-btn">${buttonText}</button>
            <button class="pp-buy-btn">${buyNowText}</button>
          </div>"""

stock_str = """          <!-- Stock Warning -->
          ${settingsObj.stockWarning ? `
            <div class="mock-stock-warning" style="width: 100%; margin-top: 12px; text-align: left;">
              <div style="display: flex; align-items: center; gap: 8px; font-size: 13px; font-weight: 600; color: #DC2626; margin-bottom: 6px;">
                <span>🔥</span>
                <span>${settingsObj.stockWarning.text.replace('{count}', settingsObj.stockWarning.count)}</span>
              </div>
              <div style="width: 100%; height: 6px; background: #E5E7EB; border-radius: 3px; overflow: hidden;">
                <div style="width: ${Math.min(100, (settingsObj.stockWarning.count / settingsObj.stockWarning.max) * 100)}%; height: 100%; background: #EF4444; border-radius: 3px;"></div>
              </div>
            </div>
          ` : ''}"""

new_right_side = """        <!-- Right Side: Details -->
        <div class="pp-details">
          ${(settingsObj.sectionOrder || ['header', 'desc', 'vendor', 'options', 'actions', 'stock', 'trust']).map((sectionId: string) => {
            if (sectionId === 'header') return `""" + header_str + """`;
            if (sectionId === 'desc') return `""" + desc_str + """`;
            if (sectionId === 'vendor') return `""" + vendor_str + """`;
            if (sectionId === 'options') return `""" + options_str + """`;
            if (sectionId === 'actions') return `""" + actions_str + """`;
            if (sectionId === 'stock') return `""" + stock_str + """`;
            if (sectionId === 'trust') return `""" + trust_str + """`;
            return '';
          }).join('')}
        </div>"""

new_content = content[:content.find(start_marker)] + new_right_side + "\n      </div>\n    `;" + content[content.find("      </div>\n    `;")+18:]

with open('app/routes/app.proxy.tsx', 'w', encoding='utf-8') as f:
    f.write(new_content)

print("Proxy patched successfully!")
