// BuyerDashboard.jsx — Buyer view with AI intent search, location, cart
import { useState, useEffect, useRef } from "react";
import CheckoutModal  from "./CheckoutModal.jsx";
import RecipeAgent    from "./RecipeAgent.jsx";
import ProductModal   from "./ProductModal.jsx";
import CartPage       from "./CartPage.jsx";
import ProductPairing from "./ProductPairing.jsx";

const API = "/api";

async function fetchNearestShops(lat, lng) {
  const res = await fetch(`${API}/shops/nearest?lat=${lat}&lng=${lng}`);
  return res.json();
}

async function getSuggestions(query) {
  const res = await fetch(`${API}/suggestions`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query }),
  });
  return res.json();
}

// Quick intent chips shown on the empty state
const INTENT_CHIPS = [
  { label: "🤧 I have a cold",    query: "I have a cold"    },
  { label: "🎬 Movie night",      query: "movie night"      },
  { label: "🍕 Make pizza",       query: "make pizza"       },
  { label: "🏋️ Gym & fitness",   query: "gym protein"      },
  { label: "🎉 House party",      query: "house party"      },
  { label: "☕ Morning routine",  query: "morning breakfast" },
  { label: "📚 Study night",      query: "study night"      },
  { label: "👶 Baby essentials",  query: "baby food"        },
];

export default function BuyerDashboard({ user, onLogout }) {
  const [query,           setQuery]           = useState("");
  const [suggestions,     setSuggestions]     = useState([]);
  const [cart,            setCart]            = useState([]);
  const [loading,         setLoading]         = useState(false);
  const [shopInfo,        setShopInfo]        = useState(null);
  const [allShops,        setAllShops]        = useState([]);
  const [locStatus,       setLocStatus]       = useState("detecting");
  const [showShops,       setShowShops]       = useState(false);
  const [showCheckout,    setShowCheckout]    = useState(false);
  const [splitPlan,       setSplitPlan]       = useState(null);
  const [showRecipe,      setShowRecipe]      = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showCart,        setShowCart]        = useState(false);
  const [showPairing,     setShowPairing]     = useState(false);
  const [intentKeyword,   setIntentKeyword]   = useState("");
  const debounceRef = useRef(null);
  const inputRef    = useRef(null);

  // Location detection
  useEffect(() => {
    if (!navigator.geolocation) { setLocStatus("denied"); return; }
    navigator.geolocation.getCurrentPosition(
      async pos => {
        try {
          const data = await fetchNearestShops(pos.coords.latitude, pos.coords.longitude);
          if (data.success && data.nearest) {
            setShopInfo(data.nearest);
            setAllShops(data.all || []);
            setLocStatus("found");
          }
        } catch { setLocStatus("denied"); }
      },
      () => setLocStatus("denied"),
      { timeout: 8000 }
    );
  }, []);

  // AI intent search with debounce
  useEffect(() => {
    if (!query.trim()) { setSuggestions([]); setIntentKeyword(""); return; }
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const data = await getSuggestions(query);
        setSuggestions(data.matched ? data.suggestions : []);
        setIntentKeyword(data.keyword || query);
      } catch { setSuggestions([]); }
      setLoading(false);
    }, 600);
  }, [query]);

  function addToCart(item) {
    setCart(prev => {
      const exists = prev.find(c => c.name === item.name);
      if (exists) return prev.map(c => c.name === item.name ? { ...c, qty: c.qty + 1 } : c);
      return [...prev, { ...item, qty: 1, price: Number(item.price) || 0 }];
    });
  }

  function removeFromCart(name) {
    setCart(prev => prev.map(c => c.name === name ? { ...c, qty: c.qty - 1 } : c).filter(c => c.qty > 0));
  }

  const cartCount = cart.reduce((s, i) => s + i.qty, 0);
  const cartTotal = cart.reduce((s, i) => s + i.price * i.qty, 0);

  if (showPairing) return <ProductPairing onBack={() => setShowPairing(false)} />;

  if (showCart) return (
    <>
      <CartPage
        cart={cart} setCart={setCart}
        shopInfo={shopInfo} allShops={allShops}
        onBack={() => setShowCart(false)}
        onCheckout={(plan) => { setSplitPlan(plan); setShowCart(false); setShowCheckout(true); }}
      />
      {showCheckout && (
        <CheckoutModal
          cart={cart} shopInfo={shopInfo} splitPlan={splitPlan}
          onClose={() => setShowCheckout(false)}
          onSuccess={() => { setCart([]); setSplitPlan(null); }}
        />
      )}
    </>
  );

  return (
    <div style={s.page} className="app-page">
      {/* ── HEADER ── */}
      <div style={s.header} className="app-header">
        <div style={s.headerLeft} className="app-header-left">
          <span style={s.logo} className="app-logo">⚡ SmarterBlinkit</span>

          {/* Location pill */}
          <div style={s.locPill} className="app-loc-pill" onClick={() => setShowShops(!showShops)}>
            {locStatus === "found" && shopInfo ? (
              <>📍 <strong style={{ color: "#f6a623" }}>{shopInfo.deliveryMins} mins</strong>&nbsp;· {shopInfo.city} ▾</>
            ) : locStatus === "detecting" ? (
              <>📍 Detecting location…</>
            ) : (
              <>📍 Location unavailable</>
            )}
          </div>

          {showShops && allShops.length > 0 && (
            <div style={s.shopDropdown} className="app-shop-dropdown">
              <div style={s.shopDropTitle}>Nearby Stores</div>
              {allShops.slice(0, 5).map((shop, i) => (
                <div key={i} style={{ ...s.shopOption, ...(i === 0 ? s.shopOptionFirst : {}) }}
                  onClick={() => { setShopInfo(shop); setShowShops(false); }}>
                  <div>
                    <div style={s.shopOptName}>{shop.name}</div>
                    <div style={s.shopOptMeta}>{shop.area || shop.city} · ⭐ {shop.rating}</div>
                  </div>
                  <div style={s.shopOptRight}>
                    <div style={s.shopOptTime}>{shop.deliveryMins}m</div>
                    <div style={s.shopOptFee}>₹{shop.deliveryFee}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div style={s.headerRight} className="app-header-right">
          <span style={s.userName} className="app-username">👤 {user.name}</span>
          <button style={s.pairingBtn} className="app-pairing-btn" onClick={() => setShowPairing(true)}>
            🧠 Smart Pairing
          </button>
          <button style={s.cartBtn} className="app-cart-btn" onClick={() => setShowCart(true)}>
            🛒 Cart
            {cartCount > 0 && <span style={s.cartBadge}>{cartCount}</span>}
          </button>
          {cartCount > 0 && (
            <span style={s.cartTotal} className="app-cart-total">₹{cartTotal}</span>
          )}
          <button style={s.logoutBtn} className="app-logout-btn" onClick={onLogout}>Logout</button>
        </div>
      </div>

      {/* ── BODY ── */}
      <div style={s.body} className="app-body">

        {/* Search bar */}
        <div style={s.searchSection}>
          <div style={s.searchBox} className="app-search-box">
            <span style={s.searchIcon}>🔍</span>
            <input
              ref={inputRef}
              style={s.searchInput}
              placeholder='Try "I have a cold", "movie night", "make pizza for 4"…'
              value={query}
              onChange={e => setQuery(e.target.value)}
              autoFocus
            />
            {query && (
              <button style={s.clearBtn} onClick={() => { setQuery(""); setSuggestions([]); inputRef.current?.focus(); }}>✕</button>
            )}
          </div>
          <div style={s.searchHint}>
            💡 <strong>Intent Search</strong> — understands what you mean, not just what you type
          </div>
        </div>

        {/* Recipe Agent banner */}
        <button style={s.recipeBtn} className="app-recipe-btn" onClick={() => setShowRecipe(true)}>
          <span style={s.recipeBtnIcon}>🤖</span>
          <div style={s.recipeBtnText}>
            <div style={s.recipeBtnTitle}>Recipe Agent</div>
            <div style={s.recipeBtnSub}>Type a dish → get all ingredients added to cart in one click</div>
          </div>
          <span style={s.recipeBtnArrow}>→</span>
        </button>

        {/* Loading */}
        {loading && (
          <div style={s.loadingRow}>
            <div style={s.spinner} />
            <span>AI is understanding your intent…</span>
          </div>
        )}

        {/* No results */}
        {!loading && query && suggestions.length === 0 && (
          <div style={s.noResults}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>🤔</div>
            <div style={s.noResultsTitle}>No grocery items found for "{query}"</div>
            <div style={s.noResultsSub}>Try "milk", "chips", "I have a cold", or "movie night"</div>
          </div>
        )}

        {/* Empty state with intent chips */}
        {!query && (
          <div style={s.emptyState}>
            <div style={s.emptyEmoji}>🛒</div>
            <div style={s.emptyTitle}>What do you need today?</div>
            <div style={s.emptySub}>Search any product, brand, or describe your situation</div>
            <div style={s.intentSection}>
              <div style={s.intentLabel}>✨ Try these intent searches</div>
              <div style={s.intentGrid} className="intent-grid">
                {INTENT_CHIPS.map(chip => (
                  <button key={chip.query} style={s.intentChip}
                    onClick={() => { setQuery(chip.query); inputRef.current?.focus(); }}>
                    {chip.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Results */}
        {suggestions.length > 0 && (
          <div style={s.resultsWrap}>
            <div style={s.resultsHeader}>
              <div>
                <span style={s.resultsTitle}>
                  🤖 AI found <strong>{suggestions.length} products</strong>
                </span>
                {intentKeyword && intentKeyword.toLowerCase() !== query.toLowerCase() && (
                  <span style={s.intentBadge}>Intent: "{intentKeyword}"</span>
                )}
              </div>
              <span style={s.aiBadge}>Groq AI · llama-3.3-70b</span>
            </div>

            <div style={s.grid} className="products-grid">
              {suggestions.map((item, i) => {
                const inCart = cart.find(c => c.name === item.name);
                return (
                  <div key={i} style={s.card} onClick={() => setSelectedProduct(item)}>
                    <div style={s.cardEmoji}>{item.emoji || "🛍️"}</div>
                    <div style={s.cardName}>{item.name}</div>
                    {item.brand && <div style={s.cardBrand}>{item.brand}</div>}
                    <div style={s.cardReason}>{item.reason}</div>
                    {item.stock <= 10 && item.stock > 0 && (
                      <div style={s.lowStockBadge}>⚠️ Only {item.stock} left</div>
                    )}
                    <div style={s.cardBottom}>
                      <span style={s.cardPrice}>₹{item.price}</span>
                      {inCart ? (
                        <div style={s.qtyRow} onClick={e => e.stopPropagation()}>
                          <button style={s.qtyBtn} onClick={e => { e.stopPropagation(); removeFromCart(item.name); }}>−</button>
                          <span style={s.qtyNum}>{inCart.qty}</span>
                          <button style={s.qtyBtn} onClick={e => { e.stopPropagation(); addToCart(item); }}>+</button>
                        </div>
                      ) : (
                        <button style={s.addBtn} onClick={e => { e.stopPropagation(); addToCart(item); }}>+ Add</button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Add all to cart */}
            {suggestions.length > 1 && (
              <button style={s.addAllBtn} onClick={() => suggestions.forEach(addToCart)}>
                🛒 Add All {suggestions.length} Items to Cart
              </button>
            )}
          </div>
        )}
      </div>

      {/* Floating cart bar when items in cart */}
      {cartCount > 0 && !showCart && (
        <div style={s.floatingCart} onClick={() => setShowCart(true)}>
          <span style={s.floatingCartLeft}>🛒 {cartCount} item{cartCount > 1 ? "s" : ""} in cart</span>
          <span style={s.floatingCartRight}>₹{cartTotal} · View Cart →</span>
        </div>
      )}

      {/* Modals */}
      {selectedProduct && (
        <ProductModal
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
          onAddToCart={item => {
            setCart(prev => {
              const exists = prev.find(c => c.name === item.name);
              if (exists) return prev.map(c => c.name === item.name ? { ...c, qty: c.qty + 1 } : c);
              return [...prev, { ...item, qty: 1, price: Number(item.price) || 0 }];
            });
          }}
        />
      )}
      {showRecipe && (
        <RecipeAgent
          onAddToCart={items => items.forEach(addToCart)}
          onClose={() => setShowRecipe(false)}
        />
      )}
      {showCheckout && (
        <CheckoutModal
          cart={cart} shopInfo={shopInfo}
          onClose={() => setShowCheckout(false)}
          onSuccess={() => setCart([])}
        />
      )}
    </div>
  );
}

const s = {
  page:            { minHeight: "100vh", background: "#f5f5f5", fontFamily: "'Segoe UI',sans-serif" },
  header:          { background: "#1a1a1a", padding: "0 24px", height: 58, display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 100, boxShadow: "0 2px 12px #0004" },
  headerLeft:      { display: "flex", alignItems: "center", gap: 14, position: "relative" },
  logo:            { fontWeight: 800, fontSize: 18, color: "#fff", marginRight: 4 },
  locPill:         { padding: "5px 14px", borderRadius: 20, background: "#ffffff11", border: "1px solid #ffffff22", color: "#fff", fontSize: 13, cursor: "pointer", whiteSpace: "nowrap", userSelect: "none" },
  shopDropdown:    { position: "absolute", top: 48, left: 80, background: "#fff", borderRadius: 14, boxShadow: "0 8px 32px #0003", minWidth: 300, zIndex: 200, overflow: "hidden", border: "1px solid #eee" },
  shopDropTitle:   { padding: "12px 16px 8px", fontSize: 11, fontWeight: 700, color: "#aaa", textTransform: "uppercase", letterSpacing: 1 },
  shopOption:      { padding: "10px 16px", cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #f5f5f5" },
  shopOptionFirst: { background: "#fff8ee" },
  shopOptName:     { fontSize: 13, fontWeight: 600, color: "#1a1a1a" },
  shopOptMeta:     { fontSize: 11, color: "#aaa", marginTop: 2 },
  shopOptRight:    { textAlign: "right" },
  shopOptTime:     { fontSize: 14, fontWeight: 800, color: "#f6a623" },
  shopOptFee:      { fontSize: 11, color: "#aaa" },
  headerRight:     { display: "flex", alignItems: "center", gap: 10 },
  userName:        { fontSize: 13, color: "#aaa", whiteSpace: "nowrap" },
  pairingBtn:      { padding: "7px 14px", background: "linear-gradient(135deg,#1a0533,#0d1f35)", border: "1px solid #7c3aed", borderRadius: 20, color: "#c4b5fd", fontSize: 13, cursor: "pointer", fontWeight: 600, whiteSpace: "nowrap" },
  cartBtn:         { position: "relative", padding: "7px 16px", borderRadius: 10, border: "none", background: "linear-gradient(135deg,#f6a623,#f97316)", color: "#000", fontSize: 14, fontWeight: 700, cursor: "pointer" },
  cartBadge:       { position: "absolute", top: -6, right: -6, background: "#dc2626", color: "#fff", borderRadius: "50%", width: 18, height: 18, fontSize: 11, fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center" },
  cartTotal:       { fontSize: 13, fontWeight: 700, color: "#f6a623" },
  logoutBtn:       { padding: "6px 14px", borderRadius: 8, border: "1px solid #444", background: "transparent", cursor: "pointer", fontSize: 13, color: "#ccc" },

  body:            { maxWidth: 1000, margin: "0 auto", padding: "24px 24px 100px" },

  searchSection:   { marginBottom: 16 },
  searchBox:       { display: "flex", alignItems: "center", background: "#fff", borderRadius: 14, padding: "4px 16px", boxShadow: "0 2px 16px #0002", border: "2px solid #f6a62333" },
  searchIcon:      { fontSize: 20, marginRight: 10, flexShrink: 0 },
  searchInput:     { flex: 1, border: "none", outline: "none", fontSize: 16, padding: "12px 0", background: "transparent", color: "#1a1a1a" },
  clearBtn:        { background: "none", border: "none", fontSize: 18, cursor: "pointer", color: "#aaa", padding: 4, flexShrink: 0 },
  searchHint:      { fontSize: 12, color: "#aaa", marginTop: 8, paddingLeft: 4 },

  recipeBtn:       { width: "100%", padding: "14px 20px", borderRadius: 14, border: "2px dashed #f6a62355", background: "linear-gradient(135deg,#fff8ee,#fffdf7)", color: "#1a1a1a", fontSize: 14, cursor: "pointer", marginBottom: 24, display: "flex", alignItems: "center", gap: 14, textAlign: "left" },
  recipeBtnIcon:   { fontSize: 28, flexShrink: 0 },
  recipeBtnText:   { flex: 1 },
  recipeBtnTitle:  { fontWeight: 800, color: "#f6a623", fontSize: 15 },
  recipeBtnSub:    { fontSize: 12, color: "#888", marginTop: 2 },
  recipeBtnArrow:  { fontSize: 20, color: "#f6a623", fontWeight: 700 },

  loadingRow:      { display: "flex", alignItems: "center", gap: 12, color: "#888", fontSize: 14, padding: "24px 0" },
  spinner:         { width: 20, height: 20, border: "3px solid #eee", borderTopColor: "#f6a623", borderRadius: "50%", animation: "spin 0.8s linear infinite", flexShrink: 0 },

  noResults:       { textAlign: "center", padding: "60px 20px" },
  noResultsTitle:  { fontSize: 18, fontWeight: 700, color: "#1a1a1a", marginBottom: 8 },
  noResultsSub:    { fontSize: 14, color: "#aaa" },

  emptyState:      { textAlign: "center", padding: "40px 20px" },
  emptyEmoji:      { fontSize: 56, marginBottom: 12 },
  emptyTitle:      { fontSize: 22, fontWeight: 800, color: "#1a1a1a", marginBottom: 6 },
  emptySub:        { fontSize: 14, color: "#aaa", marginBottom: 28 },
  intentSection:   { textAlign: "left", maxWidth: 600, margin: "0 auto" },
  intentLabel:     { fontSize: 13, fontWeight: 700, color: "#888", marginBottom: 12, textAlign: "center" },
  intentGrid:      { display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(180px,1fr))", gap: 10 },
  intentChip:      { padding: "10px 16px", borderRadius: 12, border: "1.5px solid #eee", background: "#fff", cursor: "pointer", fontSize: 13, fontWeight: 600, color: "#333", textAlign: "left", boxShadow: "0 1px 4px #0001" },

  resultsWrap:     {},
  resultsHeader:   { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 },
  resultsTitle:    { fontSize: 15, color: "#555" },
  intentBadge:     { marginLeft: 10, background: "#f0fdf4", border: "1px solid #bbf7d0", color: "#15803d", fontSize: 11, fontWeight: 700, padding: "2px 10px", borderRadius: 20 },
  aiBadge:         { background: "linear-gradient(135deg,#f6a623,#f97316)", color: "#000", fontSize: 11, fontWeight: 700, padding: "3px 12px", borderRadius: 20, whiteSpace: "nowrap" },
  grid:            { display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(200px,1fr))", gap: 14, marginBottom: 16 },
  card:            { background: "#fff", borderRadius: 14, padding: 16, cursor: "pointer", boxShadow: "0 2px 8px #0001", border: "1px solid #eee", transition: "transform 0.15s,box-shadow 0.15s" },
  cardEmoji:       { fontSize: 40, marginBottom: 10 },
  cardName:        { fontSize: 14, fontWeight: 700, color: "#1a1a1a", marginBottom: 3 },
  cardBrand:       { fontSize: 11, color: "#f6a623", fontWeight: 600, marginBottom: 4 },
  cardReason:      { fontSize: 12, color: "#888", marginBottom: 8, fontStyle: "italic", lineHeight: 1.4 },
  lowStockBadge:   { fontSize: 11, color: "#ca8a04", background: "#fef9c3", borderRadius: 6, padding: "2px 8px", marginBottom: 8, display: "inline-block" },
  cardBottom:      { display: "flex", justifyContent: "space-between", alignItems: "center" },
  cardPrice:       { fontSize: 16, fontWeight: 800, color: "#1a1a1a" },
  qtyRow:          { display: "flex", alignItems: "center", gap: 6 },
  qtyBtn:          { width: 28, height: 28, borderRadius: 8, border: "1px solid #f6a623", background: "#fff8ee", color: "#f6a623", fontSize: 16, fontWeight: 800, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" },
  qtyNum:          { fontSize: 15, fontWeight: 800, color: "#1a1a1a", minWidth: 22, textAlign: "center" },
  addBtn:          { padding: "7px 14px", borderRadius: 8, border: "none", background: "linear-gradient(135deg,#f6a623,#f97316)", color: "#000", fontSize: 13, fontWeight: 700, cursor: "pointer" },
  addAllBtn:       { width: "100%", padding: "13px 0", borderRadius: 12, border: "none", background: "#1a1a1a", color: "#fff", fontSize: 14, fontWeight: 700, cursor: "pointer", marginTop: 4 },

  floatingCart:    { position: "fixed", bottom: 20, left: "50%", transform: "translateX(-50%)", background: "#1a1a1a", color: "#fff", borderRadius: 50, padding: "14px 28px", display: "flex", alignItems: "center", gap: 20, cursor: "pointer", boxShadow: "0 8px 32px #0005", zIndex: 50, fontSize: 14, fontWeight: 600, whiteSpace: "nowrap" },
  floatingCartLeft:  { color: "#aaa" },
  floatingCartRight: { color: "#f6a623", fontWeight: 800 },
};
