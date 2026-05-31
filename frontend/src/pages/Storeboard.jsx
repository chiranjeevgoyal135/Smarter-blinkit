import { useState, useEffect, useRef } from "react";
import MoneyMap from "./MoneyMap.jsx";

const CAT_EMOJI = { Dairy:"🥛",Biscuits:"🍪",Snacks:"🍿",Beverages:"☕",Grains:"🌾",Oils:"🫙",Health:"🍯",Personal:"🧴",Veggies:"🥬",Bakery:"🍞",General:"🛍️" };

export default function Storeboard({ user, onLogout }) {
  const [data,    setData]    = useState(null);
  const [tab,     setTab]     = useState("dashboard"); // dashboard | moneymap
  const [loading, setLoading] = useState(true);
  const [pulse,   setPulse]   = useState(false);
  const [secsSince, setSecsSince] = useState(0);
  const timerRef  = useRef(null);
  const pulseRef  = useRef(null);

  useEffect(() => {
    fetchData();
    timerRef.current = setInterval(fetchData, 7000);
    return () => { clearInterval(timerRef.current); clearInterval(pulseRef.current); };
  }, []);

  // Tick counter so user sees "updated X secs ago"
  useEffect(() => {
    pulseRef.current = setInterval(() => setSecsSince(s => s + 1), 1000);
    return () => clearInterval(pulseRef.current);
  }, []);

  async function fetchData() {
    try {
      const res  = await fetch("http://localhost:5000/api/analytics/dashboard");
      const json = await res.json();
      if (json.success) {
        setData(json);
        setSecsSince(0);
        setPulse(true);
        setTimeout(() => setPulse(false), 600);
      }
    } catch(e) { console.error(e); }
    setLoading(false);
  }

  if (loading || !data) return (
    <div style={s.page}>
      <div style={s.hdr}><span style={s.logo}>⚡ SmarterBlinkit</span><div style={s.ownerBadge}>👑 Owner</div></div>
      <div style={s.centreLoad}><div style={s.spinner}/><p style={{color:"#888"}}>Loading live data...</p></div>
    </div>
  );

  const d = data;

  return (
    <div style={s.page}>
      {/* ── HEADER ── */}
      <div style={s.hdr}>
        <div style={s.hdrLeft}>
          <span style={s.logo}>⚡ SmarterBlinkit</span>
          <div style={s.ownerBadge}>👑 Owner Dashboard</div>
          <div style={s.livePill}>
            <span style={{...s.liveDot, boxShadow: pulse?"0 0 10px #22c55e":"0 0 4px #22c55e"}}/>
            LIVE · updated {secsSince}s ago
          </div>
        </div>
        <div style={s.hdrRight}>
<div style={s.tabRow}>
            <button style={{...s.tabBtn,...(tab==="dashboard"?s.tabActive:{})}} onClick={()=>setTab("dashboard")}>📊 Dashboard</button>
            <button style={{...s.tabBtn,...(tab==="moneymap"?s.tabActive:{})}}  onClick={()=>setTab("moneymap")}>💰 Money Map</button>
          </div>
          <span style={s.uname}>👤 {user.name}</span>
          <button style={s.logoutBtn} onClick={onLogout}>Logout</button>
        </div>
      </div>

      {tab === "moneymap" ? <MoneyMap onBack={()=>setTab("dashboard")} /> : <div style={s.body}>
        {/* ── STAT CARDS ── */}
        <div style={s.statsRow}>
          {[
            { icon:"💰", label:"Revenue (1h)",   val:`₹${(d.summary.totalRevenue1h||0).toLocaleString()}`,  color:"#f6a623" },
            { icon:"📦", label:"Orders (1h)",    val: d.summary.totalOrders1h,                              color:"#3b82f6" },
            { icon:"💵", label:"Revenue (24h)",  val:`₹${(d.summary.allRevenue24h||0).toLocaleString()}`,  color:"#22c55e" },
            { icon:"🏪", label:"Active Shops",   val:`${d.summary.activeShops} / ${d.summary.totalShops}`, color:"#a855f7" },
          ].map((c,i) => (
            <div key={i} style={{...s.statCard, borderTop:`3px solid ${c.color}`}}>
              <div style={{...s.statIcon, background:c.color+"22", color:c.color}}>{c.icon}</div>
              <div>
                <div style={{...s.statVal, color:c.color}}>{c.val}</div>
                <div style={s.statLbl}>{c.label}</div>
              </div>
            </div>
          ))}
        </div>

        <div style={s.grid}>
          {/* LEFT */}
          <div style={s.col}>

            {/* ── FASTEST SELLING ── */}
            <div style={s.card}>
              <div style={s.cardHdr}>
                <div>
                  <div style={s.cardTitle}>🔥 Fastest Selling Right Now</div>
                  <div style={s.cardSub}>Last 1 hour · by units sold</div>
                </div>
                <span style={s.liveTag}>LIVE</span>
              </div>
              {(d.topProducts||[]).map((p,i) => {
                const pct = Math.round((p.unitsSold / (d.topProducts[0]?.unitsSold||1)) * 100);
                return (
                  <div key={i} style={s.prodRow}>
                    <div style={s.prodRank}>{i===0?"🥇":i===1?"🥈":i===2?"🥉":`#${i+1}`}</div>
                    <span style={s.prodEmoji}>{p.emoji||CAT_EMOJI[p.category]||"🛍️"}</span>
                    <div style={s.prodInfo}>
                      <div style={s.prodName}>{p.name}</div>
                      <div style={s.prodMeta}>{p.category} · ₹{p.price}</div>
                      <div style={s.barBg}>
                        <div style={{...s.barFill, width:`${pct}%`, background:i<3?"linear-gradient(90deg,#f6a623,#f97316)":"#334155"}}/>
                      </div>
                    </div>
                    <div style={s.prodRight}>
                      <div style={s.prodUnits}>{p.unitsSold}</div>
                      <div style={s.prodUnitLbl}>sold</div>
                      <div style={s.prodRev}>₹{(p.revenue||0).toLocaleString()}</div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* ── TREND CHART ── */}
            <div style={s.card}>
              <div style={s.cardHdr}>
                <div>
                  <div style={s.cardTitle}>📈 Order Trend</div>
                  <div style={s.cardSub}>Last 2 hours in 15-min buckets</div>
                </div>
              </div>
              <div style={s.chart}>
                {(d.trend||[]).map((b,i) => {
                  const maxO = Math.max(...(d.trend||[]).map(x=>x.orders),1);
                  const h    = Math.max(6, Math.round((b.orders/maxO)*110));
                  const isNow = i===d.trend.length-1;
                  return (
                    <div key={i} style={s.chartCol}>
                      <div style={s.chartVal}>{b.orders}</div>
                      <div style={{...s.chartBar, height:h, background: isNow?"linear-gradient(180deg,#f6a623,#f97316)":"#1e293b", border: isNow?"1px solid #f6a62366":"1px solid #334155"}}/>
                      <div style={s.chartLbl}>{b.label}</div>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>

          {/* RIGHT */}
          <div style={s.col}>

            {/* ── TOP RATED SHOPS ── */}
            <div style={s.card}>
              <div style={s.cardHdr}>
                <div>
                  <div style={s.cardTitle}>⭐ Top Rated Shops in India</div>
                  <div style={s.cardSub}>Ranked by average customer rating</div>
                </div>
              </div>
              {(d.topShops||[]).map((shop,i) => {
                const stars = Math.round(parseFloat(shop.avgRating));
                return (
                  <div key={i} style={s.shopRow}>
                    <div style={s.shopRankNum}>{i===0?"🏆":i===1?"🥈":i===2?"🥉":`#${i+1}`}</div>
                    <div style={s.shopInfo}>
                      <div style={s.shopName}>{shop.shopName}</div>
                      <div style={s.shopMeta}>
                        📍{shop.city} · {shop.totalRatings} ratings · {shop.orders} orders
                      </div>
                      <div style={s.shopStars}>
                        {"★".repeat(stars)}<span style={{color:"#334155"}}>{"★".repeat(5-stars)}</span>
                      </div>
                    </div>
                    <div style={s.shopRatingBubble}>
                      <div style={s.ratingNum}>{shop.avgRating}</div>
                      <div style={s.ratingLbl}>/ 5.0</div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* ── LIVE FEED ── */}
            <div style={s.card}>
              <div style={s.cardHdr}>
                <div>
                  <div style={s.cardTitle}>⚡ Live Order Feed</div>
                  <div style={s.cardSub}>Orders happening right now</div>
                </div>
                <span style={s.liveTag}>LIVE</span>
              </div>
              <div style={s.feed}>
                {(d.liveFeed||[]).map((f,i) => (
                  <div key={i} style={{...s.feedRow, opacity: i===0?1: Math.max(0.4, 1-i*0.07)}}>
                    <span style={s.feedEmoji}>{f.emoji}</span>
                    <div style={s.feedInfo}>
                      <span style={s.feedProduct}>{f.productName}</span>
                      <span style={s.feedShop}> from {f.shopName}</span>
                    </div>
                    <div style={s.feedRight}>
                      <div style={s.feedPrice}>₹{f.price * f.qty}</div>
                      <div style={s.feedTime}>{f.secsAgo < 60 ? `${f.secsAgo}s ago` : `${Math.floor(f.secsAgo/60)}m ago`}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>

        {/* ── CATEGORY BREAKDOWN (full width) ── */}
        <div style={s.card}>
          <div style={s.cardHdr}>
            <div>
              <div style={s.cardTitle}>📊 Category Performance (Last 1 Hour)</div>
              <div style={s.cardSub}>Units sold across all shops</div>
            </div>
          </div>
          <div style={s.catGrid}>
            {(d.categoryBreakdown||[]).map((c,i) => {
              const maxU = d.categoryBreakdown[0]?.units||1;
              return (
                <div key={i} style={s.catCard}>
                  <div style={s.catEmoji}>{CAT_EMOJI[c.category]||"🛍️"}</div>
                  <div style={s.catName}>{c.category}</div>
                  <div style={s.catBarH}>
                    <div style={{...s.catBarFill, width:`${(c.units/maxU)*100}%`}}/>
                  </div>
                  <div style={s.catUnits}>{c.units} units</div>
                </div>
              );
            })}
          </div>
        </div>

      </div>}
    </div>
  );
}

const s = {
  page: {
    minHeight: "100vh",
    background: "linear-gradient(135deg, #0a0f1e 0%, #1a1f35 100%)",
    fontFamily: "'Segoe UI', system-ui, sans-serif",
    color: "#fff",
    position: "relative",
    overflow: "hidden"
  },
  hdr: {
    background: "rgba(15, 23, 42, 0.95)",
    backdropFilter: "blur(20px)",
    borderBottom: "1px solid rgba(59, 130, 246, 0.2)",
    padding: "0 32px",
    height: 72,
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    position: "sticky",
    top: 0,
    zIndex: 100,
    boxShadow: "0 4px 24px rgba(0, 0, 0, 0.3)"
  },
  hdrLeft: {
    display: "flex",
    alignItems: "center",
    gap: 20
  },
  logo: {
    fontWeight: 900,
    fontSize: 22,
    background: "linear-gradient(135deg, #f6a623 0%, #f97316 100%)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    letterSpacing: -0.5
  },
  ownerBadge: {
    background: "linear-gradient(135deg, #7c3aed 0%, #a855f7 100%)",
    color: "#fff",
    borderRadius: 24,
    padding: "8px 20px",
    fontSize: 13,
    fontWeight: 700,
    boxShadow: "0 4px 16px rgba(124, 58, 237, 0.4)",
    display: "flex",
    alignItems: "center",
    gap: 8
  },
  livePill: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    background: "rgba(16, 185, 129, 0.1)",
    border: "1px solid rgba(16, 185, 129, 0.3)",
    borderRadius: 24,
    padding: "6px 16px",
    fontSize: 12,
    color: "#10b981",
    fontWeight: 600
  },
  liveDot: {
    width: 8,
    height: 8,
    background: "#10b981",
    borderRadius: "50%",
    display: "inline-block",
    transition: "box-shadow 0.3s",
    animation: "pulse 2s ease-in-out infinite"
  },
  hdrRight: {
    display: "flex",
    alignItems: "center",
    gap: 16
  },
  uname: {
    fontSize: 14,
    color: "#94a3b8",
    fontWeight: 500
  },
  tabRow: {
    display: "flex",
    gap: 8,
    background: "rgba(30, 41, 59, 0.5)",
    borderRadius: 12,
    padding: 4
  },
  tabBtn: {
    padding: "8px 20px",
    borderRadius: 10,
    border: "none",
    background: "transparent",
    cursor: "pointer",
    fontSize: 13,
    fontWeight: 600,
    color: "#64748b",
    transition: "all 0.3s"
  },
  tabActive: {
    background: "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)",
    color: "#fff",
    boxShadow: "0 4px 12px rgba(59, 130, 246, 0.4)"
  },
  logoutBtn: {
    padding: "8px 20px",
    borderRadius: 10,
    border: "1px solid rgba(148, 163, 184, 0.2)",
    background: "transparent",
    cursor: "pointer",
    fontSize: 13,
    color: "#94a3b8",
    fontWeight: 600,
    transition: "all 0.3s"
  },
  centreLoad: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    minHeight: "80vh",
    gap: 20
  },
  spinner: {
    width: 64,
    height: 64,
    border: "4px solid rgba(246, 166, 35, 0.1)",
    borderTopColor: "#f6a623",
    borderRadius: "50%",
    animation: "spin 0.8s linear infinite"
  },
  body: {
    padding: "32px 32px 100px",
    maxWidth: 1600,
    margin: "0 auto",
    display: "flex",
    flexDirection: "column",
    gap: 24
  },
  statsRow: {
    display: "grid",
    gridTemplateColumns: "repeat(4, 1fr)",
    gap: 20
  },
  statCard: {
    background: "rgba(15, 23, 42, 0.6)",
    backdropFilter: "blur(20px)",
    border: "1px solid rgba(59, 130, 246, 0.2)",
    borderRadius: 20,
    padding: "24px",
    display: "flex",
    alignItems: "center",
    gap: 20,
    transition: "all 0.3s",
    position: "relative",
    overflow: "hidden"
  },
  statIcon: {
    width: 56,
    height: 56,
    borderRadius: 16,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 28,
    flexShrink: 0,
    boxShadow: "0 8px 24px rgba(0, 0, 0, 0.2)"
  },
  statVal: {
    fontSize: 32,
    fontWeight: 900,
    letterSpacing: -1
  },
  statLbl: {
    fontSize: 13,
    color: "#94a3b8",
    marginTop: 4,
    fontWeight: 600
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 24
  },
  col: {
    display: "flex",
    flexDirection: "column",
    gap: 24
  },
  card: {
    background: "rgba(15, 23, 42, 0.6)",
    backdropFilter: "blur(20px)",
    border: "1px solid rgba(59, 130, 246, 0.2)",
    borderRadius: 20,
    padding: 28,
    boxShadow: "0 8px 32px rgba(0, 0, 0, 0.2)"
  },
  cardHdr: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 24
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 800,
    color: "#f1f5f9",
    letterSpacing: -0.5
  },
  cardSub: {
    fontSize: 13,
    color: "#64748b",
    marginTop: 4,
    fontWeight: 500
  },
  liveTag: {
    background: "rgba(16, 185, 129, 0.15)",
    border: "1px solid rgba(16, 185, 129, 0.3)",
    color: "#10b981",
    fontSize: 11,
    fontWeight: 800,
    padding: "4px 12px",
    borderRadius: 8,
    letterSpacing: 1
  },
  prodRow: {
    display: "flex",
    alignItems: "center",
    gap: 16,
    padding: "16px 0",
    borderBottom: "1px solid rgba(59, 130, 246, 0.1)",
    transition: "all 0.2s"
  },
  prodRank: {
    fontSize: 24,
    width: 36,
    textAlign: "center",
    flexShrink: 0,
    fontWeight: 800
  },
  prodEmoji: {
    fontSize: 32,
    flexShrink: 0
  },
  prodInfo: {
    flex: 1
  },
  prodName: {
    fontSize: 15,
    fontWeight: 700,
    color: "#f1f5f9",
    marginBottom: 4
  },
  prodMeta: {
    fontSize: 12,
    color: "#64748b",
    marginBottom: 8
  },
  barBg: {
    height: 6,
    background: "rgba(30, 41, 59, 0.5)",
    borderRadius: 3,
    overflow: "hidden"
  },
  barFill: {
    height: "100%",
    borderRadius: 3,
    transition: "width 0.8s cubic-bezier(0.4, 0, 0.2, 1)"
  },
  prodRight: {
    textAlign: "right",
    flexShrink: 0
  },
  prodUnits: {
    fontSize: 24,
    fontWeight: 900,
    color: "#f6a623"
  },
  prodUnitLbl: {
    fontSize: 11,
    color: "#64748b",
    marginTop: 2
  },
  prodRev: {
    fontSize: 13,
    color: "#94a3b8",
    marginTop: 4,
    fontWeight: 600
  },
  chart: {
    display: "flex",
    alignItems: "flex-end",
    gap: 10,
    height: 160,
    paddingTop: 16
  },
  chartCol: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 8
  },
  chartVal: {
    fontSize: 12,
    color: "#64748b",
    fontWeight: 700
  },
  chartBar: {
    width: "100%",
    borderRadius: "6px 6px 0 0",
    transition: "height 0.6s cubic-bezier(0.4, 0, 0.2, 1)",
    boxShadow: "0 -4px 12px rgba(0, 0, 0, 0.2)"
  },
  chartLbl: {
    fontSize: 10,
    color: "#475569",
    textAlign: "center",
    fontWeight: 600
  },
  shopRow: {
    display: "flex",
    alignItems: "center",
    gap: 16,
    padding: "16px 0",
    borderBottom: "1px solid rgba(59, 130, 246, 0.1)"
  },
  shopRankNum: {
    fontSize: 24,
    width: 36,
    textAlign: "center",
    flexShrink: 0,
    fontWeight: 800
  },
  shopInfo: {
    flex: 1
  },
  shopName: {
    fontSize: 15,
    fontWeight: 700,
    color: "#f1f5f9",
    marginBottom: 4
  },
  shopMeta: {
    fontSize: 12,
    color: "#64748b",
    margin: "4px 0",
    fontWeight: 500
  },
  shopStars: {
    fontSize: 16,
    color: "#f6a623",
    marginTop: 4
  },
  shopRatingBubble: {
    background: "rgba(246, 166, 35, 0.15)",
    borderRadius: 16,
    padding: "12px 20px",
    textAlign: "center",
    flexShrink: 0,
    border: "1px solid rgba(246, 166, 35, 0.3)"
  },
  ratingNum: {
    fontSize: 28,
    fontWeight: 900,
    color: "#f6a623",
    letterSpacing: -1
  },
  ratingLbl: {
    fontSize: 11,
    color: "#94a3b8",
    marginTop: 2
  },
  feed: {
    display: "flex",
    flexDirection: "column",
    gap: 0,
    maxHeight: 320,
    overflowY: "auto"
  },
  feedRow: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    padding: "12px 0",
    borderBottom: "1px solid rgba(59, 130, 246, 0.1)",
    transition: "opacity 0.3s"
  },
  feedEmoji: {
    fontSize: 24,
    flexShrink: 0
  },
  feedInfo: {
    flex: 1,
    fontSize: 13
  },
  feedProduct: {
    color: "#f1f5f9",
    fontWeight: 700
  },
  feedShop: {
    color: "#64748b",
    fontWeight: 500
  },
  feedRight: {
    textAlign: "right",
    flexShrink: 0
  },
  feedPrice: {
    fontSize: 15,
    fontWeight: 800,
    color: "#10b981"
  },
  feedTime: {
    fontSize: 11,
    color: "#475569",
    marginTop: 2
  },
  catGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(5, 1fr)",
    gap: 16
  },
  catCard: {
    background: "rgba(30, 41, 59, 0.5)",
    borderRadius: 16,
    padding: "20px 16px",
    textAlign: "center",
    border: "1px solid rgba(59, 130, 246, 0.1)",
    transition: "all 0.3s"
  },
  catEmoji: {
    fontSize: 36,
    marginBottom: 12
  },
  catName: {
    fontSize: 13,
    color: "#cbd5e1",
    marginBottom: 12,
    fontWeight: 700
  },
  catBarH: {
    height: 8,
    background: "rgba(15, 23, 42, 0.5)",
    borderRadius: 4,
    overflow: "hidden",
    marginBottom: 12
  },
  catBarFill: {
    height: "100%",
    background: "linear-gradient(90deg, #f6a623 0%, #f97316 100%)",
    borderRadius: 4,
    transition: "width 0.8s cubic-bezier(0.4, 0, 0.2, 1)",
    boxShadow: "0 0 12px rgba(246, 166, 35, 0.5)"
  },
  catUnits: {
    fontSize: 16,
    fontWeight: 900,
    color: "#f6a623"
  }
};