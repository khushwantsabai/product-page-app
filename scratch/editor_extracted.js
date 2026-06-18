const links$2 = () => {
  return [{ rel: "stylesheet", href: editorStyles }];
};
const loader$7 = async ({ request, params }) => {
  var _a2;
  const { session } = await authenticate.admin(request);
  const pageId = params.id;
  if (!pageId) throw new Error("Page ID required");
  const [page, activeSub] = await Promise.all([
    prisma.productPage.findUnique({ where: { id: pageId } }),
    prisma.subscription.findFirst({ where: { shopId: session.shop, status: "active" } })
  ]);
  const activePlan = ((_a2 = activeSub == null ? void 0 : activeSub.planId) == null ? void 0 : _a2.toLowerCase()) || "free";
  return json({
    page: page || { name: "Untitled Product Page", id: pageId, templateId: pageId.replace("preview-", "") },
    activePlan
  });
};
const PLAN_LEVELS$1 = {
  free: 0,
  basic: 1,
  standard: 2,
  premium: 3
};
const TEMPLATE_MOCKS = {
  "1": {
    title: "Minimal Clean Lamp",
    plan: "Free",
    price: "$89.00",
    compareAt: "",
    desc: "Brighten your space with this elegant, minimalist modern lamp.",
    image: "https://cdn.shopify.com/s/files/1/0533/2089/files/placeholder-images-product-5_large.png",
    layout: "split"
  },
  "2": {
    title: "Modern Electronics Suite",
    plan: "Basic",
    price: "$299.00",
    compareAt: "$350.00",
    desc: "High-performance electronics for your smart home setup.",
    image: "https://cdn.shopify.com/s/files/1/0533/2089/files/placeholder-images-product-6_large.png",
    layout: "stacked"
  },
  "3": {
    title: "Luxury Watch Collection",
    plan: "Standard",
    price: "$450.00",
    compareAt: "$599.00",
    desc: "Timeless elegance meets modern engineering.",
    image: "https://cdn.shopify.com/s/files/1/0533/2089/files/placeholder-images-product-2_large.png",
    layout: "split"
  },
  "4": {
    title: "Beauty Glow Skincare",
    plan: "Premium",
    price: "$129.00",
    compareAt: "$150.00",
    desc: "Complete routine for glowing, healthy skin.",
    image: "https://cdn.shopify.com/s/files/1/0533/2089/files/placeholder-images-product-4_large.png",
    layout: "stacked"
  },
  "5": {
    title: "Fashion Store Collection",
    plan: "Basic",
    price: "$89.00",
    compareAt: "$110.00",
    desc: "Latest trends for your daily wardrobe.",
    image: "https://cdn.shopify.com/s/files/1/0533/2089/files/placeholder-images-collection-3_large.png",
    layout: "split"
  },
  "6": {
    title: "Sporty Performance Shoes",
    plan: "Standard",
    price: "$149.00",
    compareAt: "$180.00",
    desc: "Lightweight and durable shoes for maximum athletic performance.",
    image: "https://cdn.shopify.com/s/files/1/0533/2089/files/placeholder-images-product-1_large.png",
    layout: "split"
  },
  "default": {
    title: "Wireless Headphones Over Ear",
    price: "$199.00",
    compareAt: "$249.00",
    desc: "Experience high-quality sound with active noise cancellation and extra long battery life. Perfect for travel or focused work.",
    image: "https://cdn.shopify.com/s/files/1/0533/2089/files/placeholder-images-product-5_large.png",
    layout: "split"
  }
};
function Editor() {
  var _a2, _b, _c, _d, _e, _f, _g, _h;
  const loaderData = useLoaderData();
  const page = loaderData.page;
  const isPreview = page.id.startsWith("preview-");
  const navigate = useNavigate();
  const [activeDevice, setActiveDevice] = useState("desktop");
  const [activeSection, setActiveSection] = useState("title");
  const initialMockData = TEMPLATE_MOCKS[page.templateId] || TEMPLATE_MOCKS["1"];
  const [editorData, setEditorData] = useState({
    ...initialMockData,
    imageBgColor: initialMockData.imageBgColor || "#F9FAFB",
    vendor: initialMockData.vendor || {
      name: "Global Goods Inc.",
      manufacturer: "Apex Labs",
      wholesaler: "Midwest Distributing",
      source: "Direct Import"
    },
    stockWarning: initialMockData.stockWarning || {
      count: 8,
      max: 10,
      text: "Only {count} items left in stock!"
    },
    trustBadges: initialMockData.trustBadges || [
      { id: "1", title: "Free Shipping", desc: "On all orders", icon: "🚚" },
      { id: "2", title: "30-Day Returns", desc: "No questions asked", icon: "🔄" },
      { id: "3", title: "Secure Checkout", desc: "100% protected", icon: "🔒" },
      { id: "4", title: "24/7 Support", desc: "We're here to help", icon: "💬" }
    ],
    buttonText: "Add to Cart",
    buyNowText: "Buy it Now",
    quantity: 1,
    selectedColor: "Black",
    styles: {
      title: { fontFamily: "Poppins", fontSize: 24, fontWeight: "600", color: "#111827", textAlign: "left" },
      price: { fontFamily: "Poppins", fontSize: 20, fontWeight: "600", color: "#111827", textAlign: "left" },
      desc: { fontFamily: "Inter", fontSize: 15, fontWeight: "400", color: "#4B5563", textAlign: "left" },
      cart: { fontFamily: "Inter", fontSize: 16, fontWeight: "600", color: "#111827", textAlign: "center" },
      buy: { fontFamily: "Inter", fontSize: 16, fontWeight: "600", color: "#ffffff", textAlign: "center" }
    }
  });
  const activePlan = isPreview ? (editorData.plan || "Free").toLowerCase() : loaderData.activePlan;
  const updateStyle = (key, value) => {
    if (!["title", "price", "desc", "cart", "buy"].includes(activeSection)) return;
    setEditorData((prev) => ({
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
  return /* @__PURE__ */ jsxs("div", { className: "editor-container", children: [
    /* @__PURE__ */ jsxs("div", { className: "editor-topbar", children: [
      /* @__PURE__ */ jsxs("div", { className: "topbar-left", children: [
        /* @__PURE__ */ jsx("button", { className: "back-btn", onClick: () => navigate(page.id.startsWith("preview-") ? "/app/templates" : "/app"), children: /* @__PURE__ */ jsxs("svg", { width: "20", height: "20", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", children: [
          /* @__PURE__ */ jsx("line", { x1: "19", y1: "12", x2: "5", y2: "12" }),
          /* @__PURE__ */ jsx("polyline", { points: "12 19 5 12 12 5" })
        ] }) }),
        /* @__PURE__ */ jsx("input", { type: "text", className: "page-title-input", defaultValue: page.name })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "topbar-center", children: [
        /* @__PURE__ */ jsx(
          "button",
          {
            className: `device-btn ${activeDevice === "desktop" ? "active" : ""}`,
            onClick: () => setActiveDevice("desktop"),
            title: "Desktop View",
            children: /* @__PURE__ */ jsxs("svg", { width: "18", height: "18", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", children: [
              /* @__PURE__ */ jsx("rect", { x: "2", y: "3", width: "20", height: "14", rx: "2", ry: "2" }),
              /* @__PURE__ */ jsx("line", { x1: "8", y1: "21", x2: "16", y2: "21" }),
              /* @__PURE__ */ jsx("line", { x1: "12", y1: "17", x2: "12", y2: "21" })
            ] })
          }
        ),
        /* @__PURE__ */ jsx(
          "button",
          {
            className: `device-btn ${activeDevice === "mobile" ? "active" : ""}`,
            onClick: () => setActiveDevice("mobile"),
            title: "Mobile View",
            children: /* @__PURE__ */ jsxs("svg", { width: "18", height: "18", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", children: [
              /* @__PURE__ */ jsx("rect", { x: "5", y: "2", width: "14", height: "20", rx: "2", ry: "2" }),
              /* @__PURE__ */ jsx("line", { x1: "12", y1: "18", x2: "12.01", y2: "18" })
            ] })
          }
        )
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "topbar-right", children: [
        /* @__PURE__ */ jsxs("button", { className: "btn-outline", children: [
          /* @__PURE__ */ jsxs("svg", { width: "16", height: "16", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", style: { marginRight: "6px", verticalAlign: "text-bottom" }, children: [
            /* @__PURE__ */ jsx("polyline", { points: "1 4 1 10 7 10" }),
            /* @__PURE__ */ jsx("path", { d: "M3.51 15a9 9 0 1 0 2.13-9.36L1 10" })
          ] }),
          "Undo"
        ] }),
        /* @__PURE__ */ jsx("button", { className: "btn-outline", children: "Save Draft" }),
        /* @__PURE__ */ jsx("button", { className: "btn-solid", children: "Publish" })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "editor-workspace", children: [
      /* @__PURE__ */ jsxs("div", { className: "sidebar-left", children: [
        /* @__PURE__ */ jsx("div", { className: "sidebar-header", children: "Add Section" }),
        /* @__PURE__ */ jsx("div", { className: "section-list", children: [
          ...editorData.plan === "Premium" ? [{ id: "layout", icon: "📐", label: "Layout Settings" }] : [],
          ...activePlan === "standard" || activePlan === "premium" ? [{ id: "vendor", icon: "🏢", label: "Vendor Details" }] : [],
          ...activePlan === "premium" ? [{ id: "trust", icon: "🛡️", label: "Stock & Trust" }] : [],
          { id: "images", icon: "🖼️", label: "Product Images" },
          { id: "title", icon: "T", label: "Product Title" },
          { id: "price", icon: "💲", label: "Price" },
          { id: "desc", icon: "📝", label: "Description" },
          { id: "variants", icon: "🎨", label: "Variant Picker" },
          { id: "quantity", icon: "🔢", label: "Quantity Selector" },
          { id: "cart", icon: "🛒", label: "Add To Cart" },
          { id: "buy", icon: "⚡", label: "Buy Now Button" }
        ].map((section) => /* @__PURE__ */ jsxs(
          "div",
          {
            className: `section-item ${activeSection === section.id ? "active" : ""}`,
            onClick: () => setActiveSection(section.id),
            children: [
              /* @__PURE__ */ jsx("span", { className: "section-icon", children: section.icon }),
              " ",
              section.label
            ]
          },
          section.id
        )) })
      ] }),
      /* @__PURE__ */ jsx("div", { className: "canvas-area", children: /* @__PURE__ */ jsx("div", { className: "canvas-frame", style: {
        maxWidth: activeDevice === "mobile" ? "375px" : "900px",
        padding: activeDevice === "mobile" ? "16px" : "24px",
        transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
      }, children: /* @__PURE__ */ jsxs("div", { className: "mock-product", style: {
        flexDirection: editorData.layout === "stacked" || activeDevice === "mobile" ? "column" : "row",
        alignItems: editorData.layout === "stacked" || activeDevice === "mobile" ? "center" : "flex-start",
        gap: editorData.layout === "stacked" || activeDevice === "mobile" ? "32px" : "24px"
      }, children: [
        /* @__PURE__ */ jsxs("div", { className: "mock-gallery", style: {
          width: "100%",
          maxWidth: editorData.layout === "stacked" || activeDevice === "mobile" ? "100%" : "45%",
          minWidth: 0,
          position: editorData.layout === "split" && activeDevice === "desktop" ? "sticky" : "static",
          top: editorData.layout === "split" && activeDevice === "desktop" ? "24px" : "auto",
          alignSelf: editorData.layout === "split" && activeDevice === "desktop" ? "flex-start" : "stretch"
        }, children: [
          /* @__PURE__ */ jsx("img", { src: editorData.image, alt: "Product", style: { width: "100%", borderRadius: "8px", objectFit: "cover", backgroundColor: editorData.imageBgColor } }),
          activePlan !== "free" && /* @__PURE__ */ jsxs("div", { style: { display: "flex", gap: "8px", marginTop: "16px", flexWrap: "wrap", justifyContent: editorData.layout === "stacked" ? "center" : "flex-start" }, children: [
            Array.from({ length: activePlan === "basic" ? 3 : activePlan === "standard" ? 5 : 7 }).map((_, i) => /* @__PURE__ */ jsx("div", { style: { width: "64px", height: "64px", borderRadius: "6px", border: "1px dashed #D1D5DB", display: "flex", alignItems: "center", justifyContent: "center", color: "#9CA3AF", background: editorData.imageBgColor }, children: /* @__PURE__ */ jsxs("svg", { width: "24", height: "24", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", children: [
              /* @__PURE__ */ jsx("rect", { x: "3", y: "3", width: "18", height: "18", rx: "2", ry: "2" }),
              /* @__PURE__ */ jsx("circle", { cx: "8.5", cy: "8.5", r: "1.5" }),
              /* @__PURE__ */ jsx("polyline", { points: "21 15 16 10 5 21" })
            ] }) }, i)),
            activePlan === "premium" && /* @__PURE__ */ jsx("div", { style: { width: "64px", height: "64px", borderRadius: "6px", border: "1px dashed #D1D5DB", display: "flex", alignItems: "center", justifyContent: "center", color: "#9CA3AF", background: editorData.imageBgColor }, children: /* @__PURE__ */ jsx("svg", { width: "24", height: "24", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", children: /* @__PURE__ */ jsx("polygon", { points: "5 3 19 12 5 21 5 3" }) }) })
          ] }),
          editorData.layout === "split" && activeDevice === "desktop" && /* @__PURE__ */ jsxs("div", { style: { display: "flex", flexDirection: "column", gap: "20px", marginTop: "24px", width: "100%" }, children: [
            /* @__PURE__ */ jsxs("div", { className: "mock-desc", style: {
              ...editorData.styles.desc,
              width: "100%",
              borderTop: "1px solid #E5E7EB",
              paddingTop: "20px",
              textAlign: "left"
            }, children: [
              /* @__PURE__ */ jsx("div", { style: { fontWeight: 700, color: "#111827", marginBottom: "8px", fontSize: "13px", textTransform: "uppercase", letterSpacing: "0.5px" }, children: "Product Description" }),
              /* @__PURE__ */ jsx("div", { style: { lineHeight: "1.6", color: "#4B5563" }, children: editorData.desc })
            ] }),
            ["standard", "premium"].includes(activePlan) && editorData.vendor && /* @__PURE__ */ jsxs("div", { className: "mock-vendor-details", style: {
              padding: "12px",
              borderRadius: "8px",
              background: "#F9FAFB",
              border: "1px solid #E5E7EB",
              fontSize: "13px",
              width: "100%",
              boxSizing: "border-box",
              textAlign: "left"
            }, children: [
              /* @__PURE__ */ jsx("div", { style: { fontWeight: 600, color: "#374151", marginBottom: "6px" }, children: "Vendor Details" }),
              /* @__PURE__ */ jsxs("div", { style: { display: "grid", gridTemplateColumns: "auto 1fr", gap: "4px 12px", color: "#4B5563" }, children: [
                /* @__PURE__ */ jsx("span", { style: { color: "#6B7280" }, children: "Vendor:" }),
                " ",
                /* @__PURE__ */ jsx("span", { children: editorData.vendor.name || "N/A" }),
                /* @__PURE__ */ jsx("span", { style: { color: "#6B7280" }, children: "Manufacturer:" }),
                " ",
                /* @__PURE__ */ jsx("span", { children: editorData.vendor.manufacturer || "N/A" }),
                /* @__PURE__ */ jsx("span", { style: { color: "#6B7280" }, children: "Wholesaler:" }),
                " ",
                /* @__PURE__ */ jsx("span", { children: editorData.vendor.wholesaler || "N/A" }),
                /* @__PURE__ */ jsx("span", { style: { color: "#6B7280" }, children: "Original Source:" }),
                " ",
                /* @__PURE__ */ jsx("span", { children: editorData.vendor.source || "N/A" })
              ] })
            ] }),
            activePlan === "premium" && editorData.trustBadges && /* @__PURE__ */ jsx("div", { className: "mock-trust-badges", style: {
              width: "100%",
              padding: "14px 12px",
              background: "#F9FAFB",
              borderRadius: "8px",
              border: "1px solid #E5E7EB",
              display: "flex",
              flexDirection: "column",
              gap: "12px",
              boxSizing: "border-box"
            }, children: editorData.trustBadges.map((badge) => /* @__PURE__ */ jsxs("div", { style: { display: "flex", alignItems: "center", gap: "10px", textAlign: "left" }, children: [
              /* @__PURE__ */ jsx("div", { style: {
                width: "32px",
                height: "32px",
                borderRadius: "50%",
                background: "#E5E7EB",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "16px",
                flexShrink: 0
              }, children: badge.icon }),
              /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsx("div", { style: { fontSize: "12px", fontWeight: 700, color: "#111827", lineHeight: "1.2" }, children: badge.title }),
                /* @__PURE__ */ jsx("div", { style: { fontSize: "10px", color: "#6B7280", marginTop: "1px", lineHeight: "1.2" }, children: badge.desc })
              ] })
            ] }, badge.id)) })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "mock-details", style: {
          minWidth: 0,
          width: "100%",
          maxWidth: editorData.layout === "stacked" || activeDevice === "mobile" ? "500px" : "none",
          alignItems: editorData.layout === "stacked" || activeDevice === "mobile" ? "center" : "flex-start",
          textAlign: editorData.layout === "stacked" || activeDevice === "mobile" ? "center" : "left",
          gap: "16px",
          position: editorData.layout === "split" && activeDevice === "desktop" ? "sticky" : "static",
          top: editorData.layout === "split" && activeDevice === "desktop" ? "24px" : "auto",
          alignSelf: editorData.layout === "split" && activeDevice === "desktop" ? "flex-start" : "stretch"
        }, children: [
          /* @__PURE__ */ jsxs("div", { style: {
            display: "flex",
            flexDirection: "column",
            gap: "6px",
            width: "100%",
            alignItems: editorData.layout === "stacked" || activeDevice === "mobile" ? "center" : "flex-start"
          }, children: [
            /* @__PURE__ */ jsx("div", { className: "mock-title", style: editorData.styles.title, children: editorData.title }),
            activePlan !== "free" && /* @__PURE__ */ jsxs("div", { style: { display: "flex", alignItems: "center", gap: "8px" }, children: [
              /* @__PURE__ */ jsx("div", { style: { color: "#FBBF24", fontSize: "15px", letterSpacing: "1px" }, children: "★★★★★" }),
              /* @__PURE__ */ jsx("div", { style: { color: "#4B5563", fontSize: "13px", fontWeight: 600 }, children: "(4.9)" }),
              /* @__PURE__ */ jsx("div", { style: { color: "#9CA3AF", fontSize: "13px" }, children: "•" }),
              /* @__PURE__ */ jsx("div", { style: { color: "#6B7280", fontSize: "13px" }, children: "2,345 Reviews" })
            ] }),
            /* @__PURE__ */ jsxs("div", { style: { display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap", marginTop: "2px" }, children: [
              /* @__PURE__ */ jsxs("div", { className: "mock-price", style: editorData.styles.price, children: [
                editorData.price,
                activePlan !== "free" && editorData.compareAt && /* @__PURE__ */ jsx("s", { style: { marginLeft: "6px", fontSize: "14px", color: "#9CA3AF", fontWeight: 500 }, children: editorData.compareAt })
              ] }),
              activePlan !== "free" && editorData.compareAt && /* @__PURE__ */ jsx("div", { className: "mock-badge", style: { marginLeft: 0 }, children: "Save 20%" })
            ] })
          ] }),
          (editorData.layout === "stacked" || activeDevice === "mobile") && /* @__PURE__ */ jsx("div", { className: "mock-desc", style: { ...editorData.styles.desc, width: "100%" }, children: editorData.desc }),
          (editorData.layout === "stacked" || activeDevice === "mobile") && ["standard", "premium"].includes(activePlan) && editorData.vendor && /* @__PURE__ */ jsxs("div", { className: "mock-vendor-details", style: {
            padding: "12px",
            borderRadius: "8px",
            background: "#F9FAFB",
            border: "1px solid #E5E7EB",
            fontSize: "13px",
            width: "100%",
            boxSizing: "border-box",
            textAlign: "left"
          }, children: [
            /* @__PURE__ */ jsx("div", { style: { fontWeight: 600, color: "#374151", marginBottom: "6px" }, children: "Vendor Details" }),
            /* @__PURE__ */ jsxs("div", { style: { display: "grid", gridTemplateColumns: "auto 1fr", gap: "4px 12px", color: "#4B5563" }, children: [
              /* @__PURE__ */ jsx("span", { style: { color: "#6B7280" }, children: "Vendor:" }),
              " ",
              /* @__PURE__ */ jsx("span", { children: editorData.vendor.name || "N/A" }),
              /* @__PURE__ */ jsx("span", { style: { color: "#6B7280" }, children: "Manufacturer:" }),
              " ",
              /* @__PURE__ */ jsx("span", { children: editorData.vendor.manufacturer || "N/A" }),
              /* @__PURE__ */ jsx("span", { style: { color: "#6B7280" }, children: "Wholesaler:" }),
              " ",
              /* @__PURE__ */ jsx("span", { children: editorData.vendor.wholesaler || "N/A" }),
              /* @__PURE__ */ jsx("span", { style: { color: "#6B7280" }, children: "Original Source:" }),
              " ",
              /* @__PURE__ */ jsx("span", { children: editorData.vendor.source || "N/A" })
            ] })
          ] }),
          /* @__PURE__ */ jsx("div", { style: { width: "100%", height: "1px", background: "#F3F4F6", margin: "4px 0" } }),
          /* @__PURE__ */ jsxs("div", { style: {
            display: "flex",
            flexDirection: "column",
            gap: "16px",
            width: "100%",
            alignItems: editorData.layout === "stacked" || activeDevice === "mobile" ? "center" : "flex-start"
          }, children: [
            /* @__PURE__ */ jsxs("div", { style: { width: "100%" }, children: [
              /* @__PURE__ */ jsxs("div", { style: { fontSize: "13px", fontWeight: 600, marginBottom: "6px", color: "#374151", textAlign: editorData.layout === "stacked" || activeDevice === "mobile" ? "center" : "left" }, children: [
                "Color: ",
                /* @__PURE__ */ jsx("span", { style: { fontWeight: 400, color: "#6B7280" }, children: editorData.selectedColor })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "mock-variants", style: { justifyContent: editorData.layout === "stacked" || activeDevice === "mobile" ? "center" : "flex-start" }, children: [
                /* @__PURE__ */ jsx("div", { className: "mock-color", style: { background: "#111827", outlineColor: editorData.selectedColor === "Black" ? "#111827" : "transparent", cursor: "pointer" }, onClick: () => setEditorData({ ...editorData, selectedColor: "Black" }) }),
                /* @__PURE__ */ jsx("div", { className: "mock-color", style: { background: "#E5E7EB", outlineColor: editorData.selectedColor === "Silver" ? "#E5E7EB" : "transparent", cursor: "pointer" }, onClick: () => setEditorData({ ...editorData, selectedColor: "Silver" }) }),
                /* @__PURE__ */ jsx("div", { className: "mock-color", style: { background: "#3B82F6", outlineColor: editorData.selectedColor === "Blue" ? "#3B82F6" : "transparent", cursor: "pointer" }, onClick: () => setEditorData({ ...editorData, selectedColor: "Blue" }) })
              ] })
            ] }),
            /* @__PURE__ */ jsxs("div", { style: { width: "100%" }, children: [
              /* @__PURE__ */ jsx("div", { style: { fontSize: "13px", fontWeight: 600, marginBottom: "6px", color: "#374151", textAlign: editorData.layout === "stacked" || activeDevice === "mobile" ? "center" : "left" }, children: "Quantity" }),
              /* @__PURE__ */ jsxs("div", { style: { display: "flex", border: "1px solid #D1D5DB", borderRadius: "6px", width: "fit-content", margin: editorData.layout === "stacked" || activeDevice === "mobile" ? "0 auto" : "0", background: "white" }, children: [
                /* @__PURE__ */ jsx("button", { onClick: () => setEditorData({ ...editorData, quantity: Math.max(1, editorData.quantity - 1) }), style: { padding: "8px 14px", background: "transparent", border: "none", cursor: "pointer", color: "#4B5563", fontWeight: 500 }, children: "-" }),
                /* @__PURE__ */ jsx("div", { style: { padding: "8px 14px", borderLeft: "1px solid #D1D5DB", borderRight: "1px solid #D1D5DB", fontWeight: 600, color: "#111827", minWidth: "20px", textAlign: "center" }, children: editorData.quantity }),
                /* @__PURE__ */ jsx("button", { onClick: () => setEditorData({ ...editorData, quantity: editorData.quantity + 1 }), style: { padding: "8px 14px", background: "transparent", border: "none", cursor: "pointer", color: "#4B5563", fontWeight: 500 }, children: "+" })
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "mock-actions", style: { width: "100%", gap: "8px", marginTop: "4px" }, children: [
            /* @__PURE__ */ jsx("button", { className: "mock-btn add-to-cart", style: { ...editorData.styles.cart, padding: "12px 16px", fontSize: "15px" }, children: editorData.buttonText }),
            /* @__PURE__ */ jsx("button", { className: "mock-btn buy-now", style: { ...editorData.styles.buy, padding: "12px 16px", fontSize: "15px" }, children: editorData.buyNowText })
          ] }),
          activePlan === "premium" && editorData.stockWarning && /* @__PURE__ */ jsxs("div", { className: "mock-stock-warning", style: { width: "100%", marginTop: "12px", textAlign: "left" }, children: [
            /* @__PURE__ */ jsxs("div", { style: { display: "flex", alignItems: "center", gap: "8px", fontSize: "13px", fontWeight: 600, color: "#DC2626", marginBottom: "6px", justifyContent: editorData.layout === "stacked" || activeDevice === "mobile" ? "center" : "flex-start" }, children: [
              /* @__PURE__ */ jsx("span", { children: "🔥" }),
              /* @__PURE__ */ jsx("span", { children: editorData.stockWarning.text.replace("{count}", editorData.stockWarning.count) })
            ] }),
            /* @__PURE__ */ jsx("div", { style: { width: "100%", height: "6px", background: "#E5E7EB", borderRadius: "3px", overflow: "hidden" }, children: /* @__PURE__ */ jsx("div", { style: {
              width: `${Math.min(100, editorData.stockWarning.count / editorData.stockWarning.max * 100)}%`,
              height: "100%",
              background: "#EF4444",
              borderRadius: "3px",
              transition: "width 0.3s ease"
            } }) })
          ] }),
          (editorData.layout === "stacked" || activeDevice === "mobile") && activePlan === "premium" && editorData.trustBadges && /* @__PURE__ */ jsx("div", { className: "mock-trust-badges", style: {
            width: "100%",
            marginTop: "16px",
            padding: "14px 12px",
            background: "#F9FAFB",
            borderRadius: "8px",
            border: "1px solid #E5E7EB",
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "center",
            gap: "12px",
            boxSizing: "border-box"
          }, children: editorData.trustBadges.map((badge) => /* @__PURE__ */ jsxs("div", { style: {
            display: "flex",
            alignItems: "center",
            gap: "10px",
            textAlign: "left",
            minWidth: "200px",
            flex: "1 1 0"
          }, children: [
            /* @__PURE__ */ jsx("div", { style: {
              width: "32px",
              height: "32px",
              borderRadius: "50%",
              background: "#E5E7EB",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "16px",
              flexShrink: 0
            }, children: badge.icon }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("div", { style: { fontSize: "12px", fontWeight: 700, color: "#111827", lineHeight: "1.2" }, children: badge.title }),
              /* @__PURE__ */ jsx("div", { style: { fontSize: "10px", color: "#6B7280", marginTop: "1px", lineHeight: "1.2" }, children: badge.desc })
            ] })
          ] }, badge.id)) })
        ] })
      ] }) }) }),
      /* @__PURE__ */ jsxs("div", { className: "sidebar-right", children: [
        /* @__PURE__ */ jsxs("div", { className: "sidebar-header", style: { display: "flex", justifyContent: "space-between", textTransform: "capitalize" }, children: [
          activeSection === "desc" ? "Description" : activeSection === "cart" ? "Add To Cart" : activeSection === "buy" ? "Buy Now" : `Product ${activeSection}`,
          /* @__PURE__ */ jsx("span", { style: { cursor: "pointer", color: "#9CA3AF" }, children: "🗑️" })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "properties-tabs", children: [
          /* @__PURE__ */ jsx("div", { className: "prop-tab active", children: "Content" }),
          /* @__PURE__ */ jsx("div", { className: "prop-tab", children: "Style" }),
          PLAN_LEVELS$1[activePlan] >= PLAN_LEVELS$1["premium"] ? /* @__PURE__ */ jsx("div", { className: "prop-tab", children: "Advanced" }) : /* @__PURE__ */ jsx("div", { className: "prop-tab", style: { color: "#D1D5DB", cursor: "not-allowed" }, title: "Requires Premium Plan", children: "Advanced 🔒" })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "prop-section", children: [
          activeSection === "layout" && /* @__PURE__ */ jsxs(Fragment, { children: [
            /* @__PURE__ */ jsxs("span", { className: "prop-label", style: { display: "flex", justifyContent: "space-between" }, children: [
              "Product Layout",
              activePlan !== "premium" && /* @__PURE__ */ jsx("span", { style: { color: "#D1D5DB" }, title: "Requires Premium Plan", children: "🔒" })
            ] }),
            /* @__PURE__ */ jsxs("div", { style: { display: "flex", gap: "8px", marginBottom: "16px" }, children: [
              /* @__PURE__ */ jsx(
                "button",
                {
                  onClick: () => activePlan === "premium" && setEditorData({ ...editorData, layout: "split" }),
                  style: {
                    flex: 1,
                    padding: "8px",
                    borderRadius: "4px",
                    border: "1px solid #E5E7EB",
                    background: editorData.layout === "split" ? "#E5E7EB" : "white",
                    cursor: activePlan === "premium" ? "pointer" : "not-allowed",
                    opacity: activePlan === "premium" ? 1 : 0.5,
                    fontWeight: editorData.layout === "split" ? 600 : 400
                  },
                  children: "Side-by-Side"
                }
              ),
              /* @__PURE__ */ jsx(
                "button",
                {
                  onClick: () => activePlan === "premium" && setEditorData({ ...editorData, layout: "stacked" }),
                  style: {
                    flex: 1,
                    padding: "8px",
                    borderRadius: "4px",
                    border: "1px solid #E5E7EB",
                    background: editorData.layout === "stacked" ? "#E5E7EB" : "white",
                    cursor: activePlan === "premium" ? "pointer" : "not-allowed",
                    opacity: activePlan === "premium" ? 1 : 0.5,
                    fontWeight: editorData.layout === "stacked" ? 600 : 400
                  },
                  children: "Stacked"
                }
              )
            ] }),
            activePlan !== "premium" && /* @__PURE__ */ jsx("div", { style: { color: "#ef4444", fontSize: "12px", marginTop: "-8px", marginBottom: "16px" }, children: "Upgrade to Premium to customize the layout structure." })
          ] }),
          activeSection === "title" && /* @__PURE__ */ jsxs(Fragment, { children: [
            /* @__PURE__ */ jsx("span", { className: "prop-label", children: "Title Text" }),
            /* @__PURE__ */ jsx(
              "input",
              {
                type: "text",
                className: "prop-select",
                style: { marginBottom: "16px", background: "white" },
                value: editorData.title,
                onChange: (e) => setEditorData({ ...editorData, title: e.target.value })
              }
            )
          ] }),
          activeSection === "price" && /* @__PURE__ */ jsxs(Fragment, { children: [
            /* @__PURE__ */ jsx("span", { className: "prop-label", children: "Price Text" }),
            /* @__PURE__ */ jsx(
              "input",
              {
                type: "text",
                className: "prop-select",
                style: { marginBottom: "16px", background: "white" },
                value: editorData.price,
                onChange: (e) => setEditorData({ ...editorData, price: e.target.value })
              }
            ),
            /* @__PURE__ */ jsxs("span", { className: "prop-label", style: { display: "flex", justifyContent: "space-between" }, children: [
              "Compare At Price",
              activePlan === "free" && /* @__PURE__ */ jsx("span", { style: { color: "#D1D5DB" }, title: "Upgrade to use", children: "🔒" })
            ] }),
            /* @__PURE__ */ jsx(
              "input",
              {
                type: "text",
                className: "prop-select",
                style: {
                  marginBottom: "16px",
                  background: activePlan === "free" ? "#F9FAFB" : "white",
                  color: activePlan === "free" ? "#9CA3AF" : "inherit",
                  cursor: activePlan === "free" ? "not-allowed" : "text"
                },
                value: activePlan === "free" ? "" : editorData.compareAt,
                onChange: (e) => setEditorData({ ...editorData, compareAt: e.target.value }),
                disabled: activePlan === "free",
                placeholder: activePlan === "free" ? "Upgrade plan to use discounts" : ""
              }
            )
          ] }),
          activeSection === "desc" && /* @__PURE__ */ jsxs(Fragment, { children: [
            /* @__PURE__ */ jsx("span", { className: "prop-label", children: "Description Text" }),
            /* @__PURE__ */ jsx(
              "textarea",
              {
                className: "prop-select",
                style: { marginBottom: "16px", background: "white", minHeight: "120px", resize: "vertical" },
                value: editorData.desc,
                onChange: (e) => setEditorData({ ...editorData, desc: e.target.value })
              }
            )
          ] }),
          activeSection === "cart" && /* @__PURE__ */ jsxs(Fragment, { children: [
            /* @__PURE__ */ jsx("span", { className: "prop-label", children: "Button Label" }),
            /* @__PURE__ */ jsx(
              "input",
              {
                type: "text",
                className: "prop-select",
                style: { marginBottom: "16px", background: "white" },
                value: editorData.buttonText,
                onChange: (e) => setEditorData({ ...editorData, buttonText: e.target.value })
              }
            )
          ] }),
          activeSection === "buy" && /* @__PURE__ */ jsxs(Fragment, { children: [
            /* @__PURE__ */ jsx("span", { className: "prop-label", children: "Button Label" }),
            /* @__PURE__ */ jsx(
              "input",
              {
                type: "text",
                className: "prop-select",
                style: { marginBottom: "16px", background: "white" },
                value: editorData.buyNowText,
                onChange: (e) => setEditorData({ ...editorData, buyNowText: e.target.value })
              }
            )
          ] }),
          activeSection === "quantity" && /* @__PURE__ */ jsxs(Fragment, { children: [
            /* @__PURE__ */ jsx("span", { className: "prop-label", children: "Default Quantity" }),
            /* @__PURE__ */ jsx(
              "input",
              {
                type: "number",
                className: "prop-select",
                style: { marginBottom: "16px", background: "white" },
                value: editorData.quantity,
                onChange: (e) => setEditorData({ ...editorData, quantity: Number(e.target.value) }),
                min: 1
              }
            )
          ] }),
          activeSection === "images" && /* @__PURE__ */ jsxs(Fragment, { children: [
            /* @__PURE__ */ jsx("span", { className: "prop-label", children: "Main Product Image" }),
            /* @__PURE__ */ jsx(
              "input",
              {
                type: "file",
                accept: "image/*",
                onChange: (e) => {
                  var _a3;
                  const file = (_a3 = e.target.files) == null ? void 0 : _a3[0];
                  if (file) {
                    const reader = new FileReader();
                    reader.onload = (event) => {
                      var _a4;
                      if ((_a4 = event.target) == null ? void 0 : _a4.result) {
                        setEditorData({ ...editorData, image: event.target.result });
                      }
                    };
                    reader.readAsDataURL(file);
                  }
                },
                style: { display: "none" },
                id: "main-image-upload"
              }
            ),
            /* @__PURE__ */ jsxs(
              "label",
              {
                htmlFor: "main-image-upload",
                style: {
                  display: "block",
                  padding: "16px",
                  border: "1px dashed #D1D5DB",
                  borderRadius: "8px",
                  textAlign: "center",
                  marginBottom: "16px",
                  cursor: "pointer",
                  background: "white",
                  transition: "all 0.2s ease",
                  boxShadow: "0 1px 2px rgba(0,0,0,0.05)"
                },
                children: [
                  /* @__PURE__ */ jsx("div", { style: { fontSize: "28px", marginBottom: "8px" }, children: "📸" }),
                  /* @__PURE__ */ jsx("div", { style: { fontSize: "14px", fontWeight: 600, color: "#374151" }, children: "Upload Custom Image" }),
                  /* @__PURE__ */ jsx("div", { style: { fontSize: "11px", color: "#6B7280", marginTop: "4px" }, children: "PNG, JPG, or SVG up to 5MB" })
                ]
              }
            ),
            /* @__PURE__ */ jsx("span", { className: "prop-label", style: { marginTop: "12px" }, children: "Or Choose a Preset Product" }),
            /* @__PURE__ */ jsx("div", { style: { display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "8px", marginBottom: "16px" }, children: [
              { name: "💡 Minimal Lamp", url: "https://cdn.shopify.com/s/files/1/0533/2089/files/placeholder-images-product-5_large.png" },
              { name: "🔊 Smart Speaker", url: "https://cdn.shopify.com/s/files/1/0533/2089/files/placeholder-images-product-6_large.png" },
              { name: "⌚ Luxury Watch", url: "https://cdn.shopify.com/s/files/1/0533/2089/files/placeholder-images-product-2_large.png" },
              { name: "🧴 Glow Cream", url: "https://cdn.shopify.com/s/files/1/0533/2089/files/placeholder-images-product-4_large.png" },
              { name: "👟 Athletic Shoe", url: "https://cdn.shopify.com/s/files/1/0533/2089/files/placeholder-images-product-1_large.png" },
              { name: "👕 Fashion Store", url: "https://cdn.shopify.com/s/files/1/0533/2089/files/placeholder-images-collection-3_large.png" }
            ].map((preset) => /* @__PURE__ */ jsx(
              "button",
              {
                onClick: () => setEditorData({ ...editorData, image: preset.url }),
                style: {
                  padding: "8px",
                  borderRadius: "6px",
                  border: editorData.image === preset.url ? "2px solid #16A34A" : "1px solid #D1D5DB",
                  background: "white",
                  fontSize: "11px",
                  fontWeight: editorData.image === preset.url ? 700 : 500,
                  color: editorData.image === preset.url ? "#16A34A" : "#4B5563",
                  cursor: "pointer",
                  textAlign: "left",
                  boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
                  transition: "all 0.15s ease"
                },
                children: preset.name
              },
              preset.url
            )) }),
            /* @__PURE__ */ jsx("span", { className: "prop-label", children: "Or Paste Image URL" }),
            /* @__PURE__ */ jsx(
              "input",
              {
                type: "text",
                className: "prop-select",
                style: { marginBottom: "24px", background: "white" },
                value: editorData.image.startsWith("data:") ? "" : editorData.image,
                onChange: (e) => setEditorData({ ...editorData, image: e.target.value }),
                placeholder: "Paste URL (e.g. https://...)"
              }
            ),
            ["standard", "premium"].includes(activePlan) ? /* @__PURE__ */ jsxs("div", { style: { marginBottom: "24px" }, children: [
              /* @__PURE__ */ jsxs("span", { className: "prop-label", style: { display: "flex", justifyContent: "space-between", alignItems: "center" }, children: [
                "Image Background Color",
                /* @__PURE__ */ jsx("span", { style: { fontSize: "11px", color: "#16A34A", fontWeight: 600, background: "#D1FAE5", padding: "2px 6px", borderRadius: "4px" }, children: "Pro Feature ✨" })
              ] }),
              /* @__PURE__ */ jsx("div", { style: { display: "flex", flexWrap: "wrap", gap: "8px", marginBottom: "12px" }, children: [
                { name: "Transparent", value: "transparent" },
                { name: "Off-White", value: "#FAF9F6" },
                { name: "Light Gray", value: "#F3F4F6" },
                { name: "Soft Gray", value: "#E5E7EB" },
                { name: "Soft Blue", value: "#EFF6FF" },
                { name: "Soft Rose", value: "#FFF1F2" },
                { name: "Dark Gray", value: "#374151" }
              ].map((preset) => /* @__PURE__ */ jsx(
                "button",
                {
                  onClick: () => setEditorData({ ...editorData, imageBgColor: preset.value }),
                  style: {
                    padding: "6px 10px",
                    borderRadius: "4px",
                    border: editorData.imageBgColor === preset.value ? "2px solid #16A34A" : "1px solid #D1D5DB",
                    background: preset.value === "transparent" ? "white" : preset.value,
                    color: preset.value === "#374151" ? "white" : "#374151",
                    fontSize: "11px",
                    fontWeight: editorData.imageBgColor === preset.value ? 700 : 400,
                    cursor: "pointer"
                  },
                  children: preset.name
                },
                preset.value
              )) }),
              /* @__PURE__ */ jsxs("div", { style: { display: "flex", alignItems: "center", gap: "10px" }, children: [
                /* @__PURE__ */ jsx("span", { style: { fontSize: "12px", color: "#4B5563", fontWeight: 500 }, children: "Custom Color:" }),
                /* @__PURE__ */ jsx(
                  "input",
                  {
                    type: "color",
                    value: editorData.imageBgColor && editorData.imageBgColor.startsWith("#") ? editorData.imageBgColor : "#F9FAFB",
                    onChange: (e) => setEditorData({ ...editorData, imageBgColor: e.target.value }),
                    style: {
                      border: "1px solid #D1D5DB",
                      padding: "1px",
                      borderRadius: "4px",
                      width: "40px",
                      height: "28px",
                      cursor: "pointer"
                    }
                  }
                ),
                /* @__PURE__ */ jsx("span", { style: { fontSize: "12px", fontFamily: "monospace", color: "#6B7280" }, children: editorData.imageBgColor })
              ] })
            ] }) : /* @__PURE__ */ jsxs("div", { style: { marginBottom: "24px" }, children: [
              /* @__PURE__ */ jsxs("span", { className: "prop-label", style: { display: "flex", justifyContent: "space-between", alignItems: "center" }, children: [
                "Image Background Color",
                /* @__PURE__ */ jsx("span", { style: { color: "#D1D5DB" }, title: "Requires Standard or Premium Plan", children: "🔒" })
              ] }),
              /* @__PURE__ */ jsx("div", { style: {
                padding: "12px",
                background: "#F9FAFB",
                border: "1px solid #E5E7EB",
                borderRadius: "8px",
                fontSize: "12px",
                color: "#EF4444",
                fontWeight: 500
              }, children: "Upgrade to Standard or Premium to customize image background colors." })
            ] }),
            activePlan !== "free" && /* @__PURE__ */ jsxs(Fragment, { children: [
              /* @__PURE__ */ jsxs("span", { className: "prop-label", style: { display: "flex", justifyContent: "space-between" }, children: [
                "Additional Gallery",
                /* @__PURE__ */ jsxs("span", { style: { color: "#6B7280", fontSize: "12px", fontWeight: 400 }, children: [
                  activePlan === "basic" && "Max 3 images",
                  activePlan === "standard" && "Max 5 images",
                  activePlan === "premium" && "Max 7 images"
                ] })
              ] }),
              /* @__PURE__ */ jsxs("div", { style: { padding: "16px", border: "1px dashed #D1D5DB", borderRadius: "8px", textAlign: "center", marginBottom: "24px", cursor: "pointer", background: "#F9FAFB" }, children: [
                /* @__PURE__ */ jsx("div", { style: { fontSize: "24px", marginBottom: "8px" }, children: "🖼️" }),
                /* @__PURE__ */ jsx("div", { style: { fontSize: "14px", fontWeight: 500 }, children: "Upload Gallery Images" })
              ] })
            ] }),
            activePlan === "premium" ? /* @__PURE__ */ jsxs(Fragment, { children: [
              /* @__PURE__ */ jsxs("span", { className: "prop-label", style: { display: "flex", justifyContent: "space-between" }, children: [
                "Product Video",
                /* @__PURE__ */ jsx("span", { style: { color: "#6B7280", fontSize: "12px", fontWeight: 400 }, children: "Max 1 video" })
              ] }),
              /* @__PURE__ */ jsxs("div", { style: { padding: "16px", border: "1px dashed #D1D5DB", borderRadius: "8px", textAlign: "center", marginBottom: "24px", cursor: "pointer", background: "#F9FAFB" }, children: [
                /* @__PURE__ */ jsx("div", { style: { fontSize: "24px", marginBottom: "8px" }, children: "🎥" }),
                /* @__PURE__ */ jsx("div", { style: { fontSize: "14px", fontWeight: 500 }, children: "Upload Product Video" })
              ] })
            ] }) : /* @__PURE__ */ jsxs(Fragment, { children: [
              /* @__PURE__ */ jsxs("span", { className: "prop-label", style: { display: "flex", justifyContent: "space-between" }, children: [
                "Product Video",
                /* @__PURE__ */ jsx("span", { style: { color: "#D1D5DB" }, title: "Requires Premium Plan", children: "🔒" })
              ] }),
              /* @__PURE__ */ jsxs("div", { style: { padding: "16px", border: "1px dashed #E5E7EB", borderRadius: "8px", textAlign: "center", marginBottom: "24px", cursor: "not-allowed", background: "#F3F4F6", opacity: 0.5 }, children: [
                /* @__PURE__ */ jsx("div", { style: { fontSize: "24px", marginBottom: "8px" }, children: "🎥" }),
                /* @__PURE__ */ jsx("div", { style: { fontSize: "14px", fontWeight: 500 }, children: "Product Video (Premium Only)" })
              ] })
            ] })
          ] }),
          activeSection === "vendor" && /* @__PURE__ */ jsxs(Fragment, { children: [
            /* @__PURE__ */ jsx("span", { className: "prop-label", children: "Vendor Name" }),
            /* @__PURE__ */ jsx(
              "input",
              {
                type: "text",
                className: "prop-select",
                style: { marginBottom: "16px", background: "white" },
                value: ((_a2 = editorData.vendor) == null ? void 0 : _a2.name) || "",
                onChange: (e) => setEditorData({
                  ...editorData,
                  vendor: {
                    ...editorData.vendor,
                    name: e.target.value
                  }
                })
              }
            ),
            /* @__PURE__ */ jsx("span", { className: "prop-label", children: "Manufacturer" }),
            /* @__PURE__ */ jsx(
              "input",
              {
                type: "text",
                className: "prop-select",
                style: { marginBottom: "16px", background: "white" },
                value: ((_b = editorData.vendor) == null ? void 0 : _b.manufacturer) || "",
                onChange: (e) => setEditorData({
                  ...editorData,
                  vendor: {
                    ...editorData.vendor,
                    manufacturer: e.target.value
                  }
                })
              }
            ),
            /* @__PURE__ */ jsx("span", { className: "prop-label", children: "Wholesaler" }),
            /* @__PURE__ */ jsx(
              "input",
              {
                type: "text",
                className: "prop-select",
                style: { marginBottom: "16px", background: "white" },
                value: ((_c = editorData.vendor) == null ? void 0 : _c.wholesaler) || "",
                onChange: (e) => setEditorData({
                  ...editorData,
                  vendor: {
                    ...editorData.vendor,
                    wholesaler: e.target.value
                  }
                })
              }
            ),
            /* @__PURE__ */ jsx("span", { className: "prop-label", children: "Original Source" }),
            /* @__PURE__ */ jsx(
              "input",
              {
                type: "text",
                className: "prop-select",
                style: { marginBottom: "16px", background: "white" },
                value: ((_d = editorData.vendor) == null ? void 0 : _d.source) || "",
                onChange: (e) => setEditorData({
                  ...editorData,
                  vendor: {
                    ...editorData.vendor,
                    source: e.target.value
                  }
                })
              }
            )
          ] }),
          activeSection === "trust" && /* @__PURE__ */ jsxs(Fragment, { children: [
            /* @__PURE__ */ jsxs("div", { style: { borderBottom: "1px solid #E5E7EB", paddingBottom: "12px", marginBottom: "16px" }, children: [
              /* @__PURE__ */ jsx("span", { className: "prop-label", style: { fontWeight: 600, fontSize: "14px", color: "#111827" }, children: "Stock Warning Settings" }),
              /* @__PURE__ */ jsx("span", { className: "prop-label", style: { marginTop: "12px" }, children: "Warning Message Template" }),
              /* @__PURE__ */ jsx(
                "input",
                {
                  type: "text",
                  className: "prop-select",
                  style: { marginBottom: "12px", background: "white" },
                  value: ((_e = editorData.stockWarning) == null ? void 0 : _e.text) || "",
                  onChange: (e) => setEditorData({
                    ...editorData,
                    stockWarning: { ...editorData.stockWarning, text: e.target.value }
                  })
                }
              ),
              /* @__PURE__ */ jsxs("div", { style: { fontSize: "11px", color: "#6B7280", marginBottom: "12px", marginTop: "-8px" }, children: [
                "Use ",
                /* @__PURE__ */ jsx("code", { children: "{count}" }),
                " to display the stock number dynamically."
              ] }),
              /* @__PURE__ */ jsxs("div", { style: { display: "flex", gap: "12px", marginBottom: "16px" }, children: [
                /* @__PURE__ */ jsxs("div", { style: { flex: 1 }, children: [
                  /* @__PURE__ */ jsx("span", { className: "prop-label", children: "Current Stock" }),
                  /* @__PURE__ */ jsx(
                    "input",
                    {
                      type: "number",
                      className: "prop-select",
                      style: { background: "white" },
                      value: ((_f = editorData.stockWarning) == null ? void 0 : _f.count) ?? 8,
                      min: 0,
                      onChange: (e) => setEditorData({
                        ...editorData,
                        stockWarning: { ...editorData.stockWarning, count: Number(e.target.value) }
                      })
                    }
                  )
                ] }),
                /* @__PURE__ */ jsxs("div", { style: { flex: 1 }, children: [
                  /* @__PURE__ */ jsx("span", { className: "prop-label", children: "Max Stock (Scale)" }),
                  /* @__PURE__ */ jsx(
                    "input",
                    {
                      type: "number",
                      className: "prop-select",
                      style: { background: "white" },
                      value: ((_g = editorData.stockWarning) == null ? void 0 : _g.max) ?? 10,
                      min: 1,
                      onChange: (e) => setEditorData({
                        ...editorData,
                        stockWarning: { ...editorData.stockWarning, max: Number(e.target.value) }
                      })
                    }
                  )
                ] })
              ] })
            ] }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("span", { className: "prop-label", style: { fontWeight: 600, fontSize: "14px", color: "#111827", marginBottom: "12px" }, children: "Trust Badges Settings" }),
              (_h = editorData.trustBadges) == null ? void 0 : _h.map((badge, idx) => /* @__PURE__ */ jsxs("div", { style: { border: "1px solid #E5E7EB", borderRadius: "8px", padding: "12px", marginBottom: "16px", background: "#F9FAFB" }, children: [
                /* @__PURE__ */ jsxs("div", { style: { fontWeight: 600, fontSize: "12px", color: "#4B5563", marginBottom: "8px" }, children: [
                  "Badge #",
                  idx + 1
                ] }),
                /* @__PURE__ */ jsxs("div", { style: { display: "flex", gap: "8px", marginBottom: "8px" }, children: [
                  /* @__PURE__ */ jsxs("div", { style: { width: "60px" }, children: [
                    /* @__PURE__ */ jsx("span", { className: "prop-label", children: "Icon" }),
                    /* @__PURE__ */ jsx(
                      "input",
                      {
                        type: "text",
                        className: "prop-select",
                        style: { background: "white", textAlign: "center" },
                        value: badge.icon,
                        onChange: (e) => {
                          const newList = [...editorData.trustBadges];
                          newList[idx] = { ...badge, icon: e.target.value };
                          setEditorData({ ...editorData, trustBadges: newList });
                        }
                      }
                    )
                  ] }),
                  /* @__PURE__ */ jsxs("div", { style: { flex: 1 }, children: [
                    /* @__PURE__ */ jsx("span", { className: "prop-label", children: "Title" }),
                    /* @__PURE__ */ jsx(
                      "input",
                      {
                        type: "text",
                        className: "prop-select",
                        style: { background: "white" },
                        value: badge.title,
                        onChange: (e) => {
                          const newList = [...editorData.trustBadges];
                          newList[idx] = { ...badge, title: e.target.value };
                          setEditorData({ ...editorData, trustBadges: newList });
                        }
                      }
                    )
                  ] })
                ] }),
                /* @__PURE__ */ jsx("span", { className: "prop-label", children: "Description" }),
                /* @__PURE__ */ jsx(
                  "input",
                  {
                    type: "text",
                    className: "prop-select",
                    style: { background: "white", marginBottom: 0 },
                    value: badge.desc,
                    onChange: (e) => {
                      const newList = [...editorData.trustBadges];
                      newList[idx] = { ...badge, desc: e.target.value };
                      setEditorData({ ...editorData, trustBadges: newList });
                    }
                  }
                )
              ] }, badge.id))
            ] })
          ] }),
          ["variants"].includes(activeSection) && /* @__PURE__ */ jsx("div", { style: { color: "#6B7280", fontSize: "13px", marginBottom: "24px", fontStyle: "italic" }, children: "Content options coming soon for this section." }),
          ["title", "price", "desc", "cart", "buy"].includes(activeSection) && (() => {
            const currentStyle = editorData.styles[activeSection];
            return /* @__PURE__ */ jsxs(Fragment, { children: [
              /* @__PURE__ */ jsx("span", { className: "prop-label", style: { borderBottom: "1px solid #E5E7EB", paddingBottom: "8px", marginBottom: "16px", marginTop: "16px" }, children: "Typography" }),
              /* @__PURE__ */ jsx("span", { className: "prop-label", children: "Font Family" }),
              /* @__PURE__ */ jsxs("select", { className: "prop-select", style: { marginBottom: "16px" }, value: currentStyle.fontFamily, onChange: (e) => updateStyle("fontFamily", e.target.value), children: [
                /* @__PURE__ */ jsx("option", { children: "Poppins" }),
                /* @__PURE__ */ jsx("option", { children: "Inter" }),
                /* @__PURE__ */ jsx("option", { children: "Roboto" })
              ] }),
              /* @__PURE__ */ jsx("div", { className: "prop-row", style: { marginBottom: "16px" }, children: /* @__PURE__ */ jsxs("div", { style: { flex: 1 }, children: [
                /* @__PURE__ */ jsx("span", { className: "prop-label", children: "Font Size" }),
                /* @__PURE__ */ jsxs("div", { className: "prop-input-group", children: [
                  /* @__PURE__ */ jsx("input", { type: "number", value: currentStyle.fontSize, onChange: (e) => updateStyle("fontSize", Number(e.target.value)) }),
                  /* @__PURE__ */ jsx("span", { children: "px" })
                ] })
              ] }) }),
              /* @__PURE__ */ jsx("span", { className: "prop-label", children: "Font Weight" }),
              /* @__PURE__ */ jsxs("select", { className: "prop-select", style: { marginBottom: "16px" }, value: currentStyle.fontWeight, onChange: (e) => updateStyle("fontWeight", e.target.value), children: [
                /* @__PURE__ */ jsx("option", { value: "600", children: "Semi Bold 600" }),
                /* @__PURE__ */ jsx("option", { value: "700", children: "Bold 700" }),
                /* @__PURE__ */ jsx("option", { value: "400", children: "Regular 400" })
              ] }),
              /* @__PURE__ */ jsx("span", { className: "prop-label", children: "Text Color" }),
              /* @__PURE__ */ jsx("div", { className: "color-picker-mock", style: { marginBottom: "24px" }, children: /* @__PURE__ */ jsxs("div", { style: { display: "flex", gap: "8px", alignItems: "center" }, children: [
                /* @__PURE__ */ jsx("input", { type: "color", value: currentStyle.color, onChange: (e) => updateStyle("color", e.target.value), style: { width: "24px", height: "24px", padding: 0, border: "none", cursor: "pointer" } }),
                /* @__PURE__ */ jsx("div", { className: "color-hex", children: currentStyle.color })
              ] }) }),
              /* @__PURE__ */ jsx("span", { className: "prop-label", children: "Alignment" }),
              /* @__PURE__ */ jsxs("div", { className: "toggle-group", children: [
                /* @__PURE__ */ jsx("div", { className: `toggle-item ${currentStyle.textAlign === "left" ? "active" : ""}`, onClick: () => updateStyle("textAlign", "left"), children: /* @__PURE__ */ jsxs("svg", { width: "16", height: "16", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", children: [
                  /* @__PURE__ */ jsx("line", { x1: "3", y1: "6", x2: "21", y2: "6" }),
                  /* @__PURE__ */ jsx("line", { x1: "3", y1: "12", x2: "15", y2: "12" }),
                  /* @__PURE__ */ jsx("line", { x1: "3", y1: "18", x2: "21", y2: "18" })
                ] }) }),
                /* @__PURE__ */ jsx("div", { className: `toggle-item ${currentStyle.textAlign === "center" ? "active" : ""}`, onClick: () => updateStyle("textAlign", "center"), children: /* @__PURE__ */ jsxs("svg", { width: "16", height: "16", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", children: [
                  /* @__PURE__ */ jsx("line", { x1: "3", y1: "6", x2: "21", y2: "6" }),
                  /* @__PURE__ */ jsx("line", { x1: "6", y1: "12", x2: "18", y2: "12" }),
                  /* @__PURE__ */ jsx("line", { x1: "3", y1: "18", x2: "21", y2: "18" })
                ] }) }),
                /* @__PURE__ */ jsx("div", { className: `toggle-item ${currentStyle.textAlign === "right" ? "active" : ""}`, onClick: () => updateStyle("textAlign", "right"), children: /* @__PURE__ */ jsxs("svg", { width: "16", height: "16", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", children: [
                  /* @__PURE__ */ jsx("line", { x1: "3", y1: "6", x2: "21", y2: "6" }),
                  /* @__PURE__ */ jsx("line", { x1: "9", y1: "12", x2: "21", y2: "12" }),
                  /* @__PURE__ */ jsx("line", { x1: "3", y1: "18", x2: "21", y2: "18" })
                ] }) })
              ] })
            ] });
          })()
        ] })
      ] })
    ] })
  ] });
}
const route8 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: Editor,
  links: links$2,
  loader: loader$7
}, Symbol.toStringTag, { value: "Module" }));
const templatesStyles = "/assets/templates-CdeBw6Yn.css";
const links$1 = () => {
  return [{ rel: "stylesheet", href: templatesStyles }];
};
const action$4 = async ({ request }) => {
  const { session } = await authenticate.admin(request);
  const formData = await request.formData();
  const templateId = String(formData.get("templateId"));
  const templateName = String(formData.get("templateName"));
  const newPage = await prisma.productPage.create({
    data: {
      shopId: session.shop,
      templateId,
      planId: "free",
      // Defaulting to free plan for now
      name: `Untitled ${templateName}`,
      status: "Draft",
      settings: JSON.stringify({
        sections: [
          { id: "hero", type: "product-hero", settings: { showTitle: true, showPrice: true } }
        ]
      })
    }
  });
  return redirect(`/app/editor/${newPage.id}`);
};
const loader$6 = async ({ request }) => {
  var _a2;
  const { session } = await authenticate.admin(request);
  const activeSub = await prisma.subscription.findFirst({
    where: { shopId: session.shop, status: "active" }
  });
  const activePlan = ((_a2 = activeSub == null ? void 0 : activeSub.planId) == null ? void 0 : _a2.toLowerCase()) || "free";
  return json({ activePlan });
};
const PLAN_LEVELS = {
  free: 0,
  basic: 1,
  standard: 2,
  premium: 3
};
function Templates() {
  const { activePlan } = useLoaderData();
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedPlan, setSelectedPlan] = useState("All Plans");
  const [searchQuery, setSearchQuery] = useState("");
  const templates = [
    { id: "1", name: "Minimal Clean", plan: "Free", brand: "free", image: "https://cdn.shopify.com/s/files/1/0533/2089/files/placeholder-images-product-5_large.png", categories: ["Minimal", "Furniture"] },
    { id: "2", name: "Modern Electronics", plan: "Basic", brand: "basic", image: "https://cdn.shopify.com/s/files/1/0533/2089/files/placeholder-images-product-6_large.png", categories: ["Electronics"] },
    { id: "5", name: "Fashion Store", plan: "Basic", brand: "basic", image: "https://cdn.shopify.com/s/files/1/0533/2089/files/placeholder-images-collection-3_large.png", categories: ["Fashion"] },
    { id: "3", name: "Luxury Watch", plan: "Standard", brand: "standard", image: "https://cdn.shopify.com/s/files/1/0533/2089/files/placeholder-images-product-2_large.png", categories: ["Luxury", "Electronics"] },
    { id: "6", name: "Sporty Shoes", plan: "Standard", brand: "standard", image: "https://cdn.shopify.com/s/files/1/0533/2089/files/placeholder-images-product-1_large.png", categories: ["Fashion"] },
    { id: "4", name: "Beauty Glow", plan: "Premium", brand: "premium", image: "https://cdn.shopify.com/s/files/1/0533/2089/files/placeholder-images-product-4_large.png", categories: ["Beauty"] }
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
  return /* @__PURE__ */ jsxs("div", { className: "templates-container", children: [
    /* @__PURE__ */ jsxs("div", { className: "templates-header", children: [
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("h1", { className: "templates-title", children: "All Templates" }),
        /* @__PURE__ */ jsx("p", { className: "templates-subtitle", children: "Choose a template and start customizing" })
      ] }),
      /* @__PURE__ */ jsx("button", { className: "templates-top-btn", onClick: () => navigate("/app"), children: "View My Templates" })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "filters-bar", children: [
      /* @__PURE__ */ jsxs("div", { className: "search-bar", children: [
        /* @__PURE__ */ jsxs("svg", { className: "search-icon", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", children: [
          /* @__PURE__ */ jsx("circle", { cx: "11", cy: "11", r: "8" }),
          /* @__PURE__ */ jsx("line", { x1: "21", y1: "21", x2: "16.65", y2: "16.65" })
        ] }),
        /* @__PURE__ */ jsx(
          "input",
          {
            type: "text",
            placeholder: "Search templates...",
            value: searchQuery,
            onChange: (e) => setSearchQuery(e.target.value)
          }
        )
      ] }),
      /* @__PURE__ */ jsxs(
        "select",
        {
          className: "dropdown-select",
          value: selectedCategory,
          onChange: (e) => setSelectedCategory(e.target.value),
          children: [
            /* @__PURE__ */ jsx("option", { value: "All", children: "All Categories" }),
            /* @__PURE__ */ jsx("option", { value: "Minimal", children: "Minimal" }),
            /* @__PURE__ */ jsx("option", { value: "Fashion", children: "Fashion" }),
            /* @__PURE__ */ jsx("option", { value: "Electronics", children: "Electronics" }),
            /* @__PURE__ */ jsx("option", { value: "Beauty", children: "Beauty" }),
            /* @__PURE__ */ jsx("option", { value: "Furniture", children: "Furniture" }),
            /* @__PURE__ */ jsx("option", { value: "Luxury", children: "Luxury" })
          ]
        }
      ),
      /* @__PURE__ */ jsxs(
        "select",
        {
          className: "dropdown-select",
          value: selectedPlan,
          onChange: (e) => setSelectedPlan(e.target.value),
          children: [
            /* @__PURE__ */ jsx("option", { value: "All Plans", children: "All Plans" }),
            /* @__PURE__ */ jsx("option", { value: "Free", children: "Free" }),
            /* @__PURE__ */ jsx("option", { value: "Basic", children: "Basic" }),
            /* @__PURE__ */ jsx("option", { value: "Standard", children: "Standard" }),
            /* @__PURE__ */ jsx("option", { value: "Premium", children: "Premium" })
          ]
        }
      )
    ] }),
    /* @__PURE__ */ jsx("div", { className: "categories-scroll", children: ["All", "Minimal", "Fashion", "Electronics", "Beauty", "Furniture", "Luxury"].map((cat) => /* @__PURE__ */ jsx(
      "button",
      {
        className: `category-pill ${selectedCategory === cat ? "active" : ""}`,
        onClick: () => setSelectedCategory(cat),
        children: cat
      },
      cat
    )) }),
    /* @__PURE__ */ jsx("div", { className: "templates-grid", children: filteredTemplates.length > 0 ? filteredTemplates.map((tpl) => /* @__PURE__ */ jsxs("div", { className: "template-card", children: [
      /* @__PURE__ */ jsxs("div", { className: "template-image-wrapper", children: [
        /* @__PURE__ */ jsx("div", { className: `template-badge badge-${tpl.brand}`, children: tpl.plan }),
        /* @__PURE__ */ jsx("img", { src: tpl.image, alt: tpl.name })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "template-body", children: [
        /* @__PURE__ */ jsx("div", { className: "template-name", children: tpl.name }),
        /* @__PURE__ */ jsxs("div", { className: "template-actions", children: [
          /* @__PURE__ */ jsx(
            "button",
            {
              type: "button",
              className: "action-btn btn-preview",
              onClick: () => navigate(`/app/editor/preview-${tpl.id}`),
              children: "Preview"
            }
          ),
          PLAN_LEVELS[tpl.brand] > PLAN_LEVELS[activePlan] ? /* @__PURE__ */ jsx(
            "button",
            {
              type: "button",
              className: "action-btn",
              style: { width: "100%", background: "#F3F4F6", color: "#9CA3AF", cursor: "not-allowed", display: "flex", alignItems: "center", justifyContent: "center", gap: "6px" },
              onClick: () => navigate("/app/plans"),
              children: "🔒 Upgrade Plan"
            }
          ) : /* @__PURE__ */ jsxs(Form, { method: "post", style: { flex: 1, display: "flex" }, children: [
            /* @__PURE__ */ jsx("input", { type: "hidden", name: "templateId", value: tpl.id }),
            /* @__PURE__ */ jsx("input", { type: "hidden", name: "templateName", value: tpl.name }),
            /* @__PURE__ */ jsx("button", { type: "submit", className: `action-btn ${tpl.brand === "free" ? "btn-use-green" : tpl.brand === "premium" ? "btn-use-yellow" : "btn-use"}`, style: { width: "100%" }, children: "Use Template" })
          ] })
        ] })
      ] })
    ] }, tpl.id)) : /* @__PURE__ */ jsxs("div", { style: {
      gridColumn: "1 / -1",
      textAlign: "center",
      padding: "48px 24px",
      background: "white",
      borderRadius: "12px",
      border: "1px solid #E5E7EB",
      boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
      marginTop: "20px"
    }, children: [
      /* @__PURE__ */ jsx("div", { style: { fontSize: "48px", marginBottom: "16px" }, children: "🔍" }),
      /* @__PURE__ */ jsx("h3", { style: { fontSize: "18px", fontWeight: 600, color: "#111827", marginBottom: "8px" }, children: "No Templates Found" }),
      /* @__PURE__ */ jsx("p", { style: { fontSize: "14px", color: "#6B7280", marginBottom: "20px" }, children: "We couldn't find any templates matching your search or filters." }),
      /* @__PURE__ */ jsx(
        "button",
        {
          onClick: () => {
            setSearchQuery("");
            setSelectedCategory("All");
            setSelectedPlan("All Plans");
          },
          style: {
            padding: "8px 16px",
            background: "#16A34A",
            color: "white",
            border: "none",
            borderRadius: "6px",
            fontWeight: 600,
            cursor: "pointer"
          },
          children: "Clear All Filters"
        }
      )
    ] }) })
  ] });
}
const route9 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  action: action$4,
  default: Templates,
  links: links$1,
  loader: loader$6
}, Symbol.toStringTag, { value: "Module" }));
const SETTINGS_DIR = path.join(process.cwd(), "db_settings");
const DEFAULT_SETTINGS = {
  defaultButtonText: "Add to Cart",
  defaultCurrency: "USD ($)",
  autoPublish: true,
  storeMail: "support@mystore.com"
};
function ensureDirExists() {
  if (!fs.existsSync(SETTINGS_DIR)) {
    fs.mkdirSync(SETTINGS_DIR, { recursive: true });
  }
}
function getSettings(shopDomain) {
  ensureDirExists();
  const filePath = path.join(SETTINGS_DIR, `${shopDomain.replace(/[^a-zA-Z0-9.-]/g, "_")}.json`);
  if (!fs.existsSync(filePath)) {
    return { ...DEFAULT_SETTINGS };
  }
  try {
    const rawData = fs.readFileSync(filePath, "utf-8");
    return { ...DEFAULT_SETTINGS, ...JSON.parse(rawData) };
  } catch (error) {
    console.error(`Error reading settings for ${shopDomain}:`, error);
    return { ...DEFAULT_SETTINGS };
  }
}
function saveSettings(shopDomain, settings) {
  ensureDirExists();
  const filePath = path.join(SETTINGS_DIR, `${shopDomain.replace(/[^a-zA-Z0-9.-]/g, "_")}.json`);
  const currentSettings = getSettings(shopDomain);
  const updatedSettings = { ...currentSettings, ...settings };
  try {
    fs.writeFileSync(filePath, JSON.stringify(updatedSettings, null, 2), "utf-8");
  } catch (error) {
    console.error(`Error saving settings for ${shopDomain}:`, error);
  }
  return updatedSettings;
}
const loader$5 = async ({ request }) => {
  var _a2;
  const { session } = await authenticate.admin(request);
  const activeSub = await prisma.subscription.findFirst({
    where: { shopId: session.shop, status: "active" }
  });
  const activePlan = ((_a2 = activeSub == null ? void 0 : activeSub.planId) == null ? void 0 : _a2.toLowerCase()) || "free";
  const planName = activePlan.charAt(0).toUpperCase() + activePlan.slice(1);
  const settings = getSettings(session.shop);
  return json({
    ...settings,
    themeInstalled: true,
    activePlan: planName
  });
};
const action$3 = async ({ request }) => {
  const { session } = await authenticate.admin(request);
  const formData = await request.formData();
  const defaultButtonText = formData.get("defaultButtonText");
  const defaultCurrency = formData.get("defaultCurrency");
  const autoPublish = formData.get("autoPublish") === "true";
  const storeMail = formData.get("storeMail");
  saveSettings(session.shop, {
    defaultButtonText,
    defaultCurrency,
    autoPublish,
    storeMail
  });
  return json({ success: true, message: "Settings saved successfully!" });
};
function Settings() {
  const defaultData = useLoaderData();
  const actionData = useActionData();
  const submit = useSubmit();
  const navigation = useNavigation();
  const [btnText, setBtnText] = useState(defaultData.defaultButtonText);
  const [currency, setCurrency] = useState(defaultData.defaultCurrency);
  const [autoPublish, setAutoPublish] = useState(defaultData.autoPublish);
  const [storeMail, setStoreMail] = useState(defaultData.storeMail);
  const [toastMessage, setToastMessage] = useState(null);
  useEffect(() => {
    if ((actionData == null ? void 0 : actionData.success) && (actionData == null ? void 0 : actionData.message)) {
      setToastMessage(actionData.message);
    }
  }, [actionData]);
  const handleSave = () => {
    const formData = new FormData();
    formData.append("defaultButtonText", btnText);
    formData.append("defaultCurrency", currency);
    formData.append("autoPublish", String(autoPublish));
    formData.append("storeMail", storeMail);
    submit(formData, { method: "post" });
  };
  const isSaving = navigation.state === "submitting";
  return /* @__PURE__ */ jsxs(Frame, { children: [
    /* @__PURE__ */ jsx(Page, { title: "Settings", backAction: { content: "Dashboard", url: "/app" }, children: /* @__PURE__ */ jsxs(Layout, { children: [
      /* @__PURE__ */ jsx(Layout.Section, { children: /* @__PURE__ */ jsxs(BlockStack, { gap: "500", children: [
        /* @__PURE__ */ jsx(Card, { children: /* @__PURE__ */ jsxs(BlockStack, { gap: "400", children: [
          /* @__PURE__ */ jsx(Text, { as: "h2", variant: "headingMd", children: "⚙️ Store Defaults" }),
          /* @__PURE__ */ jsx(Text, { as: "p", tone: "subdued", children: "Configure default settings when creating new page templates." }),
          /* @__PURE__ */ jsxs(FormLayout, { children: [
            /* @__PURE__ */ jsx(
              TextField,
              {
                label: "Default Add to Cart Button Text",
                value: btnText,
                onChange: (val) => setBtnText(val),
                autoComplete: "off"
              }
            ),
            /* @__PURE__ */ jsx(
              TextField,
              {
                label: "Default Currency & Symbol",
                value: currency,
                onChange: (val) => setCurrency(val),
                autoComplete: "off"
              }
            ),
            /* @__PURE__ */ jsx(
              TextField,
              {
                type: "email",
                label: "Notification Email",
                value: storeMail,
                onChange: (val) => setStoreMail(val),
                autoComplete: "off"
              }
            )
          ] })
        ] }) }),
        /* @__PURE__ */ jsx(Card, { children: /* @__PURE__ */ jsxs(BlockStack, { gap: "400", children: [
          /* @__PURE__ */ jsx(Text, { as: "h2", variant: "headingMd", children: "🛠️ Automation & Integrations" }),
          /* @__PURE__ */ jsx(Text, { as: "p", tone: "subdued", children: "Control how template pages publish and interact with your Shopify admin." }),
          /* @__PURE__ */ jsx(FormLayout, { children: /* @__PURE__ */ jsxs(InlineStack, { align: "space-between", children: [
            /* @__PURE__ */ jsxs(BlockStack, { gap: "100", children: [
              /* @__PURE__ */ jsx(Text, { as: "h3", variant: "headingSm", children: "Auto-Apply to New Products" }),
              /* @__PURE__ */ jsx(Text, { as: "p", tone: "subdued", children: "Automatically attach default layouts to newly created draft products." })
            ] }),
            /* @__PURE__ */ jsx(Button, { onClick: () => setAutoPublish(!autoPublish), variant: "secondary", children: autoPublish ? "Enabled (Click to Disable)" : "Disabled (Click to Enable)" })
          ] }) })
        ] }) }),
        /* @__PURE__ */ jsx(Card, { children: /* @__PURE__ */ jsxs(BlockStack, { gap: "400", children: [
          /* @__PURE__ */ jsx(Text, { as: "h2", variant: "headingMd", children: "🔌 Theme Helper (Manual Embed)" }),
          /* @__PURE__ */ jsxs(Text, { as: "p", tone: "subdued", children: [
            "If templates are not showing on your store page automatically, paste this liquid tag directly inside your theme's ",
            /* @__PURE__ */ jsx("code", { children: "sections/main-product.liquid" }),
            " file:"
          ] }),
          /* @__PURE__ */ jsx(Box, { padding: "300", background: "bg-surface-secondary", borderRadius: "200", children: /* @__PURE__ */ jsx("pre", { style: { margin: 0, fontFamily: "monospace", fontSize: "13px", color: "#DC2626" }, children: "{% include 'pagecraft-product-builder' %}" }) }),
          /* @__PURE__ */ jsxs(InlineStack, { align: "start", gap: "300", children: [
            /* @__PURE__ */ jsx(Button, { onClick: () => {
              navigator.clipboard.writeText("{% include 'pagecraft-product-builder' %}");
              setToastMessage("Liquid code copied to clipboard!");
            }, variant: "secondary", children: "Copy Code Snippet" }),
            /* @__PURE__ */ jsx(Button, { variant: "plain", url: "https://shopify.dev", exte