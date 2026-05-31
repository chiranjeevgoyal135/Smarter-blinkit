// SellerDashboard.jsx — Barcode-based Inventory Management System
import { useState, useEffect, useRef } from "react";

const API = "/api/shop-inventory";

export default function SellerDashboard({ user, onLogout }) {
  const [inventory,  setInventory]  = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [barcode,    setBarcode]    = useState("");
  const [scanned,    setScanned]    = useState(null);
  const [qty,        setQty]        = useState(1);
  const [action,     setAction]     = useState("add");
  const [msg,        setMsg]        = useState(null);
  const [search,     setSearch]     = useState("");
  const [filterCat,  setFilterCat]  = useState("All");
  const [bulkMode,   setBulkMode]   = useState(false);
  const [bulkQueue,  setBulkQueue]  = useState([]);
  const [addQuery,   setAddQuery]   = useState("");
  const [addLoading, setAddLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [activeTab,  setActiveTab]  = useState("scan"); // scan | inventory | analytics
  const barcodeRef = useRef(null);

  const shopId   = user.shopId   || "shop_1";
  const shopName = user.shopName || "My Shop";

  useEffect(() => { loadInventory(); }, []);

  async function loadInventory() {
    setLoading(true);
    try {
      const res  = await fetch(`${API}/${shopId}?shopName=${encodeURIComponent(shopName)}`);
      const data = await res.json();
      if (data.success) setInventory(data.inventory);
    } catch { showMsg("Cannot reach server.", "err"); }
    setLoading(false);
  }

  async function regenerateInventory() {
    setGenerating(true);
    showMsg("🤖 AI is generating fresh inventory…", "ok");
    try {
      const res  = await fetch(`${API}/${shopId}?shopName=${encodeURIComponent(shopName)}&refresh=true`);
      const data = await res.json();
      if (data.success) { setInventory(data.inventory); showMsg(`✅ Generated ${data.inventory.length} products!`, "ok"); }
    } catch { showMsg("Generation failed.", "err"); }
    setGenerating(false);
  }

  function handleBarcodeInput(val) {
    setBarcode(val); setScanned(null);
    if (val.length >= 5) {
      const product = inventory.find(p => p.barcode === val);
      if (product) setScanned(product);
    }
  }

  async function handleUpdate() {
    if (!scanned) { showMsg("Scan a valid barcode first.", "err"); return; }
    try {
      const res  = await fetch(`${API}/${shopId}/update`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ barcode, action, quantity: qty }),
      });
      const data = await res.json();
      if (data.success) {
        showMsg(`✅ ${data.product.name}: ${data.before} → ${data.after} units`, "ok");
        setInventory(prev => prev.map(p => p.barcode === barcode ? data.product : p));
        if (bulkMode) setBulkQueue(prev => [...prev, { barcode, name: scanned.name, action, qty }]);
        setBarcode(""); setScanned(null); setQty(1);
        barcodeRef.current?.focus();
      }
    } catch { showMsg("Server error.", "err"); }
  }

  async function handleBulkSubmit() {
    try {
      const res  = await fetch(`${API}/${shopId}/bulk`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ updates: bulkQueue.map(b => ({ barcode: b.barcode, action: b.action, quantity: b.qty })) }),
      });
      const data = await res.json();
      if (data.success) {
        showMsg(`✅ Bulk updated ${data.results.filter(r => r.success).length} products`, "ok");
        setBulkQueue([]); loadInventory();
      }
    } catch { showMsg("Bulk failed.", "err"); }
  }

  async function handleAddProduct() {
    if (!addQuery.trim()) return;
    setAddLoading(true);
    try {
      const res  = await fetch(`${API}/${shopId}/add-product`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: addQuery }),
      });
      const data = await res.json();
      if (data.success) {
        setInventory(prev => [...prev, data.product]);
        showMsg(`✅ Added: ${data.product.name}`, "ok");
        setAddQuery("");
      }
    } catch { showMsg("Failed to add product.", "err"); }
    setAddLoading(false);
  }

  function printLabels() {
    const win = window.open("", "_blank");
    win.document.write(`<html><head><title>Labels - ${shopName}</title>
    <style>body{font-family:Arial;margin:20px}.grid{display:grid;grid-template-columns:repeat(3,1fr);gap:12px}.label{border:2px solid #333;border-radius:8px;padding:12px;text-align:center;break-inside:avoid}.brand{font-size:10px;color:#f6a623;font-weight:bold}.name{font-size:13px;font-weight:bold;margin:4px 0}.bars{font-family:'Libre Barcode 128',monospace;font-size:48px;line-height:1}.code{font-size:11px;color:#666}.price{font-size:12px;font-weight:bold}@import url('https://fonts.googleapis.com/css2?family=Libre+Barcode+128&display=swap');@media print{body{margin:0}}</style></head>
    <body><h2 style="color:#f6a623">⚡ ${shopName} — Inventory Labels</h2>
    <div class="grid">${inventory.map(p => `<div class="label"><div class="brand">${p.brand || shopName}</div><div class="name">${p.name}</div><div class="bars">${p.barcode}</div><div class="code">${p.barcode}</div><div class="price">₹${p.price}/${p.unit}</div></div>`).join("")}</div>
    <script>window.onload=()=>window.print()</script></body></html>`);
    win.document.close();
  }

  function showMsg(text, type) {
    setMsg({ text, type });
    setTimeout(() => setMsg(null), 4000);
  }

  const categories = ["All", ...new Set(inventory.map(p => p.category).filter(Boolean))];
  const filtered   = inventory
    .filter(p => filterCat === "All" || p.category === filterCat)
    .filter(p => p.name?.toLowerCase().includes(search.toLowerCase()) || p.barcode?.includes(search));

  const outOfStock = inventory.filter(p => p.stock === 0).length;
  const lowStock   = inventory.filter(p => p.stock > 0 && p.stock <= (p.lowStockThreshold || 10)).length;
  const totalUnits = inventory.reduce((s, p) => s + p.stock, 0);
  const totalValue = inventory.reduce((s, p) => s + p.stock * p.price, 0);

  return (
    <div style={s.page} className="seller-page">
      {/* HEADER */}
      <div style={s.header} className="seller-header">
        <div style={s.headerLeft} className="seller-header-left">
          <span style={s.logo}>⚡ SmarterBlinkit</span>
          <div style={s.shopPill}>🏪 {shopName}<span style={s.shopId}>#{shopId}</span></div>
        </div>
        <div style={s.tabs} className="seller-tabs">
          {[
            { id: "scan",      icon: "📦", label: "Scan & Update" },
            { id: "inventory", icon: "📋", label: "Inventory"     },
            { id: "analytics", icon: "📊", label: "Analytics"     },
          ].map(t => (
            <button key={t.id}
              style={{ ...s.tab, ...(activeTab === t.id ? s.tabActive : {}) }}
              onClick={() => setActiveTab(t.id)}>
              {t.icon} {t.label}
            </button>
          ))}
        </div>
        <div style={s.headerRight} className="seller-header-right">
          <span style={s.userName}>👤 {user.name}</span>
          <button style={s.logoutBtn} onClick={onLogout}>Logout</button>
        </div>
      </div>

      {loading ? (
        <div style={s.fullLoading}>
          <div style={s.bigSpinner} />
          <div style={s.loadingTitle}>🤖 AI is generating your shop's inventory…</div>
          <div style={s.loadingSub}>Creating real branded products for {shopName}</div>
        </div>
      ) : (
        <div style={s.body} className="seller-body">
          {/* ── STAT STRIP ── */}
          <div style={s.statsRow} className="seller-stats-row">
            {[
              { val: inventory.length, lbl: "Products",    color: "#3b82f6" },
              { val: totalUnits,       lbl: "Total Units",  color: "#22c55e" },
              { val: `₹${totalValue.toLocaleString()}`, lbl: "Stock Value", color: "#f6a623" },
              { val: lowStock,         lbl: "Low Stock",    color: "#f59e0b", warn: lowStock > 0 },
              { val: outOfStock,       lbl: "Out of Stock", color: "#ef4444", warn: outOfStock > 0 },
            ].map((st, i) => (
              <div key={i} style={{ ...s.stat, ...(st.warn ? { background: st.color + "11", border: `1px solid ${st.color}33` } : {}) }}>
                <span style={{ ...s.statVal, color: st.color }}>{st.val}</span>
                <span style={s.statLbl}>{st.lbl}</span>
              </div>
            ))}
          </div>

          {/* ── SCAN TAB ── */}
          {activeTab === "scan" && (
            <div style={s.scanLayout} className="seller-scan-layout">
              <div style={s.scanLeft}>
                {/* AI Add Product */}
                <div style={s.card}>
                  <div style={s.cardTitle}>🤖 AI Add Product</div>
                  <div style={s.cardSub}>Type a product name and AI will add it with all details</div>
                  <div style={s.aiRow}>
                    <input style={s.aiInput}
                      placeholder="e.g. 'Maggi noodles', 'Amul butter'"
                      value={addQuery}
                      onChange={e => setAddQuery(e.target.value)}
                      onKeyDown={e => e.key === "Enter" && handleAddProduct()} />
                    <button style={s.aiBtn} onClick={handleAddProduct} disabled={addLoading}>
                      {addLoading ? "…" : "🤖 Add"}
                    </button>
                  </div>
                  <button style={s.regenBtn} onClick={regenerateInventory} disabled={generating}>
                    {generating ? "🤖 Generating…" : "🔄 Regenerate Full Inventory with AI"}
                  </button>
                </div>

                {/* Mode toggle */}
                <div style={s.card}>
                  <div style={s.modeRow}>
                    <button style={{ ...s.modeBtn, ...(!bulkMode ? s.modeBtnActive : {}) }} onClick={() => setBulkMode(false)}>
                      Single Scan
                    </button>
                    <button style={{ ...s.modeBtn, ...(bulkMode ? s.modeBtnActive : {}) }} onClick={() => setBulkMode(true)}>
                      Bulk Mode
                    </button>
                  </div>

                  {/* Barcode input */}
                  <label style={s.sectionLabel}>📦 Scan or Type Barcode</label>
                  <div style={s.barcodeRow}>
                    <input ref={barcodeRef} style={s.barcodeInput}
                      placeholder="Scan barcode or type manually…"
                      value={barcode}
                      onChange={e => handleBarcodeInput(e.target.value)}
                      onKeyDown={e => e.key === "Enter" && scanned && handleUpdate()}
                      autoFocus />
                    {barcode && (
                      <button style={s.clearX} onClick={() => { setBarcode(""); setScanned(null); }}>✕</button>
                    )}
                  </div>

                  {scanned && (
                    <div style={s.foundCard}>
                      <div style={s.foundTop}>
                        <div>
                          <div style={s.foundName}>{scanned.emoji} {scanned.name}</div>
                          <div style={s.foundMeta}>{scanned.brand} · {scanned.category} · ₹{scanned.price}/{scanned.unit}</div>
                        </div>
                        <div style={{ ...s.stockBadge, ...(scanned.stock === 0 ? s.stockOut : scanned.stock <= 10 ? s.stockLow : s.stockOk) }}>
                          {scanned.stock} in stock
                        </div>
                      </div>
                      <div style={s.actionRow}>
                        {[
                          { val: "add",      label: "➕ Add",    color: "#16a34a" },
                          { val: "subtract", label: "➖ Remove", color: "#dc2626" },
                          { val: "set",      label: "✏️ Set",    color: "#7c3aed" },
                        ].map(a => (
                          <button key={a.val}
                            style={{ ...s.actionBtn, ...(action === a.val ? { background: a.color, color: "#fff", borderColor: a.color } : {}) }}
                            onClick={() => setAction(a.val)}>{a.label}</button>
                        ))}
                      </div>
                      <div style={s.qtyRow}>
                        <button style={s.qtyBtn} onClick={() => setQty(q => Math.max(1, q - 1))}>−</button>
                        <input style={s.qtyInput} type="number" min="0" value={qty}
                          onChange={e => setQty(Math.max(0, parseInt(e.target.value) || 0))} />
                        <button style={s.qtyBtn} onClick={() => setQty(q => q + 1)}>+</button>
                        <span style={s.qtyLbl}>{scanned.unit}s</span>
                      </div>
                      <button style={s.updateBtn} onClick={handleUpdate}>
                        {action === "add" ? "Add" : action === "subtract" ? "Remove" : "Set"} {qty} {scanned.unit}(s)
                      </button>
                    </div>
                  )}
                  {barcode.length >= 5 && !scanned && (
                    <div style={s.notFound}>❌ Barcode not found. Use AI Add above to add new items.</div>
                  )}
                </div>

                {/* Bulk queue */}
                {bulkMode && bulkQueue.length > 0 && (
                  <div style={s.card}>
                    <div style={s.cardTitle}>📋 Bulk Queue ({bulkQueue.length})</div>
                    {bulkQueue.map((b, i) => (
                      <div key={i} style={s.bulkItem}>
                        <span style={s.bulkName}>{b.name}</span>
                        <span style={{ ...s.bulkAction, color: b.action === "add" ? "#16a34a" : b.action === "subtract" ? "#dc2626" : "#7c3aed" }}>
                          {b.action} {b.qty}
                        </span>
                        <button style={s.bulkRemove} onClick={() => setBulkQueue(prev => prev.filter((_, j) => j !== i))}>✕</button>
                      </div>
                    ))}
                    <button style={s.bulkSubmitBtn} onClick={handleBulkSubmit}>
                      ✅ Apply All {bulkQueue.length} Updates
                    </button>
                  </div>
                )}

                {msg && <div style={{ ...s.msg, ...(msg.type === "ok" ? s.msgOk : s.msgErr) }}>{msg.text}</div>}
                <button style={s.printBtn} onClick={printLabels}>🖨️ Print Barcode Labels</button>
              </div>

              {/* Quick inventory preview */}
              <div style={s.scanRight}>
                <div style={s.card}>
                  <div style={s.cardTitle}>⚠️ Needs Attention</div>
                  <div style={s.cardSub}>Low stock and out-of-stock items</div>
                  {inventory
                    .filter(p => p.stock === 0 || p.stock <= (p.lowStockThreshold || 10))
                    .sort((a, b) => a.stock - b.stock)
                    .slice(0, 10)
                    .map(p => (
                      <div key={p.barcode} style={s.alertRow}
                        onClick={() => { handleBarcodeInput(p.barcode); setActiveTab("scan"); barcodeRef.current?.focus(); }}>
                        <span style={s.alertEmoji}>{p.emoji}</span>
                        <div style={s.alertInfo}>
                          <div style={s.alertName}>{p.name}</div>
                          <div style={s.alertMeta}>{p.category}</div>
                        </div>
                        <span style={{ ...s.alertBadge, ...(p.stock === 0 ? s.alertOut : s.alertLow) }}>
                          {p.stock === 0 ? "Out" : `${p.stock} left`}
                        </span>
                      </div>
                    ))}
                  {inventory.filter(p => p.stock === 0 || p.stock <= (p.lowStockThreshold || 10)).length === 0 && (
                    <div style={s.allGood}>✅ All products are well stocked!</div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ── INVENTORY TAB ── */}
          {activeTab === "inventory" && (
            <div style={s.card}>
              <div style={s.tableHeader}>
                <span style={s.cardTitle}>📦 {shopName} — Full Inventory ({filtered.length} products)</span>
                <div style={s.tableControls}>
                  <input style={s.searchInput} placeholder="Search products…" value={search}
                    onChange={e => setSearch(e.target.value)} />
                  <select style={s.catSelect} value={filterCat} onChange={e => setFilterCat(e.target.value)}>
                    {categories.map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
              </div>
              <div style={s.tableWrap}>
                <table style={s.table}>
                  <thead>
                    <tr style={s.thead}>
                      {["Product", "Brand", "Category", "Price", "Stock", "Status"].map(h => (
                        <th key={h} style={s.th}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map(p => (
                      <tr key={p.barcode} style={s.tr}
                        onClick={() => { handleBarcodeInput(p.barcode); setActiveTab("scan"); barcodeRef.current?.focus(); }}>
                        <td style={s.td}><span style={s.productCell}>{p.emoji} {p.name}</span></td>
                        <td style={s.td}><span style={s.brandCell}>{p.brand}</span></td>
                        <td style={s.td}>{p.category}</td>
                        <td style={s.td}>₹{p.price}</td>
                        <td style={s.td}><strong>{p.stock}</strong> {p.unit}s</td>
                        <td style={s.td}>
                          <span style={{ ...s.statusBadge, ...(p.stock === 0 ? s.statusOut : p.stock <= (p.lowStockThreshold || 10) ? s.statusLow : s.statusOk) }}>
                            {p.stock === 0 ? "Out of Stock" : p.stock <= (p.lowStockThreshold || 10) ? "Low Stock" : "In Stock"}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ── ANALYTICS TAB ── */}
          {activeTab === "analytics" && (
            <div style={s.analyticsGrid} className="seller-analytics-grid">
              <div style={s.card}>
                <div style={s.cardTitle}>📊 Category Breakdown</div>
                {categories.filter(c => c !== "All").map(cat => {
                  const items = inventory.filter(p => p.category === cat);
                  const units = items.reduce((s, p) => s + p.stock, 0);
                  const value = items.reduce((s, p) => s + p.stock * p.price, 0);
                  const maxUnits = Math.max(...categories.filter(c => c !== "All").map(c => inventory.filter(p => p.category === c).reduce((s, p) => s + p.stock, 0)), 1);
                  return (
                    <div key={cat} style={s.catRow}>
                      <span style={s.catLabel}>{cat}</span>
                      <div style={s.catBarBg}>
                        <div style={{ ...s.catBarFill, width: `${(units / maxUnits) * 100}%` }} />
                      </div>
                      <span style={s.catUnits}>{units} units</span>
                      <span style={s.catValue}>₹{value.toLocaleString()}</span>
                    </div>
                  );
                })}
              </div>
              <div style={s.card}>
                <div style={s.cardTitle}>🏆 Top Products by Value</div>
                {[...inventory].sort((a, b) => (b.stock * b.price) - (a.stock * a.price)).slice(0, 8).map((p, i) => (
                  <div key={p.barcode} style={s.topProdRow}>
                    <span style={s.topProdRank}>{i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : `#${i + 1}`}</span>
                    <span style={s.topProdEmoji}>{p.emoji}</span>
                    <div style={s.topProdInfo}>
                      <div style={s.topProdName}>{p.name}</div>
                      <div style={s.topProdMeta}>{p.stock} units × ₹{p.price}</div>
                    </div>
                    <span style={s.topProdValue}>₹{(p.stock * p.price).toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

const s = {
  page:          { minHeight: "100vh", background: "#f0f0f0", fontFamily: "'Segoe UI',sans-serif" },
  header:        { background: "#1a1a1a", padding: "0 24px", height: 56, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16 },
  headerLeft:    { display: "flex", alignItems: "center", gap: 12 },
  logo:          { fontWeight: 800, fontSize: 18, color: "#fff" },
  shopPill:      { background: "#f6a62322", border: "1px solid #f6a62344", color: "#f6a623", borderRadius: 20, padding: "3px 12px", fontSize: 12, fontWeight: 600, display: "flex", alignItems: "center", gap: 6 },
  shopId:        { background: "#f6a62333", borderRadius: 10, padding: "1px 6px", fontSize: 11 },
  tabs:          { display: "flex", gap: 4, background: "#111", borderRadius: 10, padding: 4 },
  tab:           { padding: "7px 14px", borderRadius: 8, border: "none", background: "transparent", color: "#888", fontSize: 13, fontWeight: 600, cursor: "pointer" },
  tabActive:     { background: "#f6a623", color: "#000" },
  headerRight:   { display: "flex", alignItems: "center", gap: 12 },
  userName:      { fontSize: 13, color: "#aaa" },
  logoutBtn:     { padding: "5px 14px", borderRadius: 8, border: "1px solid #444", background: "transparent", cursor: "pointer", fontSize: 13, color: "#ccc" },
  fullLoading:   { display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "80vh", textAlign: "center" },
  bigSpinner:    { width: 72, height: 72, border: "6px solid #eee", borderTopColor: "#f6a623", borderRadius: "50%", animation: "spin 0.8s linear infinite", marginBottom: 24 },
  loadingTitle:  { fontSize: 22, fontWeight: 700, color: "#1a1a1a", marginBottom: 8 },
  loadingSub:    { fontSize: 14, color: "#888" },
  body:          { padding: 20, maxWidth: 1300, margin: "0 auto", display: "flex", flexDirection: "column", gap: 16 },
  statsRow:      { display: "grid", gridTemplateColumns: "repeat(5,1fr)", gap: 10 },
  stat:          { background: "#fff", borderRadius: 12, padding: "14px 16px", textAlign: "center", border: "1px solid #eee" },
  statVal:       { display: "block", fontSize: 22, fontWeight: 800 },
  statLbl:       { display: "block", fontSize: 11, color: "#888", marginTop: 3 },
  card:          { background: "#fff", borderRadius: 14, padding: 18, border: "1px solid #eee" },
  cardTitle:     { fontSize: 14, fontWeight: 700, color: "#1a1a1a", marginBottom: 4 },
  cardSub:       { fontSize: 12, color: "#aaa", marginBottom: 14 },
  scanLayout:    { display: "grid", gridTemplateColumns: "380px 1fr", gap: 16 },
  scanLeft:      { display: "flex", flexDirection: "column", gap: 14 },
  scanRight:     { display: "flex", flexDirection: "column", gap: 14 },
  aiRow:         { display: "flex", gap: 8, marginBottom: 10 },
  aiInput:       { flex: 1, padding: "9px 12px", borderRadius: 8, border: "1px solid #eee", fontSize: 13, outline: "none" },
  aiBtn:         { padding: "9px 14px", borderRadius: 8, border: "none", background: "linear-gradient(135deg,#f6a623,#f97316)", color: "#000", fontSize: 13, fontWeight: 700, cursor: "pointer" },
  regenBtn:      { width: "100%", padding: "9px 0", borderRadius: 8, border: "1px dashed #f6a62366", background: "#fff8ee", color: "#f6a623", fontSize: 13, fontWeight: 600, cursor: "pointer" },
  modeRow:       { display: "flex", gap: 6, background: "#f5f5f5", padding: 4, borderRadius: 10, marginBottom: 14 },
  modeBtn:       { flex: 1, padding: "8px 0", borderRadius: 8, border: "none", background: "transparent", cursor: "pointer", fontSize: 13, fontWeight: 600, color: "#888" },
  modeBtnActive: { background: "#1a1a1a", color: "#fff" },
  sectionLabel:  { display: "block", fontSize: 13, fontWeight: 700, color: "#555", marginBottom: 8 },
  barcodeRow:    { position: "relative", display: "flex", marginBottom: 12 },
  barcodeInput:  { flex: 1, padding: "11px 14px", borderRadius: 10, border: "2px solid #f6a623", fontSize: 15, outline: "none", fontFamily: "monospace", background: "#fffdf7" },
  clearX:        { position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", fontSize: 16, color: "#aaa" },
  foundCard:     { background: "#f9fafb", borderRadius: 10, padding: 14, border: "1px solid #e5e7eb" },
  foundTop:      { display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 },
  foundName:     { fontSize: 15, fontWeight: 700, color: "#1a1a1a" },
  foundMeta:     { fontSize: 12, color: "#888", marginTop: 2 },
  stockBadge:    { padding: "4px 10px", borderRadius: 20, fontSize: 12, fontWeight: 600 },
  stockOk:       { background: "#dcfce7", color: "#16a34a" },
  stockLow:      { background: "#fef9c3", color: "#ca8a04" },
  stockOut:      { background: "#fee2e2", color: "#dc2626" },
  actionRow:     { display: "flex", gap: 6, marginBottom: 12 },
  actionBtn:     { flex: 1, padding: "7px 0", borderRadius: 8, border: "1.5px solid #ddd", background: "#fff", cursor: "pointer", fontSize: 12, fontWeight: 600, color: "#555" },
  qtyRow:        { display: "flex", alignItems: "center", gap: 8, marginBottom: 12 },
  qtyBtn:        { width: 32, height: 32, borderRadius: 8, border: "1px solid #ddd", background: "#fff", cursor: "pointer", fontSize: 18, fontWeight: 700 },
  qtyInput:      { width: 60, textAlign: "center", padding: "6px 0", borderRadius: 8, border: "1px solid #ddd", fontSize: 16, fontWeight: 700 },
  qtyLbl:        { fontSize: 13, color: "#888" },
  updateBtn:     { width: "100%", padding: 12, borderRadius: 10, border: "none", background: "linear-gradient(135deg,#f6a623,#f97316)", color: "#000", fontSize: 14, fontWeight: 700, cursor: "pointer" },
  notFound:      { background: "#fff5f5", border: "1px solid #fecaca", color: "#dc2626", borderRadius: 8, padding: "10px 14px", fontSize: 13 },
  bulkItem:      { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "7px 0", borderBottom: "1px solid #f5f5f5" },
  bulkName:      { fontSize: 13, color: "#1a1a1a", flex: 1 },
  bulkAction:    { fontSize: 13, fontWeight: 700, marginRight: 10 },
  bulkRemove:    { background: "none", border: "none", cursor: "pointer", color: "#aaa", fontSize: 14 },
  bulkSubmitBtn: { width: "100%", marginTop: 10, padding: 11, borderRadius: 10, border: "none", background: "#1a1a1a", color: "#fff", fontSize: 14, fontWeight: 700, cursor: "pointer" },
  msg:           { borderRadius: 10, padding: "12px 14px", fontSize: 13, fontWeight: 600 },
  msgOk:         { background: "#dcfce7", border: "1px solid #86efac", color: "#15803d" },
  msgErr:        { background: "#fee2e2", border: "1px solid #fca5a5", color: "#dc2626" },
  printBtn:      { padding: 12, borderRadius: 10, border: "1.5px dashed #ddd", background: "#fff", cursor: "pointer", fontSize: 13, color: "#555", fontWeight: 600, textAlign: "center" },
  alertRow:      { display: "flex", alignItems: "center", gap: 10, padding: "10px 0", borderBottom: "1px solid #f5f5f5", cursor: "pointer" },
  alertEmoji:    { fontSize: 22, flexShrink: 0 },
  alertInfo:     { flex: 1 },
  alertName:     { fontSize: 13, fontWeight: 600, color: "#1a1a1a" },
  alertMeta:     { fontSize: 11, color: "#aaa" },
  alertBadge:    { padding: "3px 10px", borderRadius: 20, fontSize: 12, fontWeight: 700 },
  alertOut:      { background: "#fee2e2", color: "#dc2626" },
  alertLow:      { background: "#fef9c3", color: "#ca8a04" },
  allGood:       { padding: "20px 0", textAlign: "center", color: "#16a34a", fontSize: 14, fontWeight: 600 },
  tableHeader:   { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 },
  tableControls: { display: "flex", gap: 10 },
  searchInput:   { padding: "8px 14px", borderRadius: 10, border: "1px solid #ddd", fontSize: 13, outline: "none", width: 200 },
  catSelect:     { padding: "8px 12px", borderRadius: 10, border: "1px solid #ddd", fontSize: 13, outline: "none", background: "#fff" },
  tableWrap:     { borderRadius: 10, border: "1px solid #eee", overflow: "hidden" },
  table:         { width: "100%", borderCollapse: "collapse" },
  thead:         { background: "#f9fafb" },
  th:            { padding: "12px 16px", textAlign: "left", fontSize: 11, fontWeight: 700, color: "#888", textTransform: "uppercase", letterSpacing: 0.5, borderBottom: "1px solid #eee" },
  tr:            { borderBottom: "1px solid #f5f5f5", cursor: "pointer" },
  td:            { padding: "12px 16px", fontSize: 14, color: "#1a1a1a" },
  productCell:   { fontWeight: 600 },
  brandCell:     { color: "#f6a623", fontWeight: 600, fontSize: 12 },
  statusBadge:   { padding: "3px 10px", borderRadius: 20, fontSize: 12, fontWeight: 600 },
  statusOk:      { background: "#dcfce7", color: "#16a34a" },
  statusLow:     { background: "#fef9c3", color: "#ca8a04" },
  statusOut:     { background: "#fee2e2", color: "#dc2626" },
  analyticsGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 },
  catRow:        { display: "flex", alignItems: "center", gap: 10, padding: "8px 0", borderBottom: "1px solid #f5f5f5" },
  catLabel:      { fontSize: 13, fontWeight: 600, color: "#555", width: 90, flexShrink: 0 },
  catBarBg:      { flex: 1, height: 8, background: "#f0f0f0", borderRadius: 4, overflow: "hidden" },
  catBarFill:    { height: "100%", background: "linear-gradient(90deg,#f6a623,#f97316)", borderRadius: 4, transition: "width 0.6s" },
  catUnits:      { fontSize: 12, color: "#888", width: 60, textAlign: "right" },
  catValue:      { fontSize: 12, fontWeight: 700, color: "#1a1a1a", width: 80, textAlign: "right" },
  topProdRow:    { display: "flex", alignItems: "center", gap: 10, padding: "10px 0", borderBottom: "1px solid #f5f5f5" },
  topProdRank:   { fontSize: 18, width: 28, textAlign: "center", flexShrink: 0 },
  topProdEmoji:  { fontSize: 22, flexShrink: 0 },
  topProdInfo:   { flex: 1 },
  topProdName:   { fontSize: 13, fontWeight: 600, color: "#1a1a1a" },
  topProdMeta:   { fontSize: 11, color: "#aaa", marginTop: 2 },
  topProdValue:  { fontSize: 14, fontWeight: 800, color: "#f6a623" },
};
