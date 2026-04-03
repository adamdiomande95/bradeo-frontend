import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { getAnnonces, createAnnonce, uploadPhoto, register, verifyOtp, sendMessage, getMessages } from './api';
const FONT = `@import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;0,9..40,800;1,9..40,400&family=Syne:wght@700;800&display=swap');`;

const CSS = `
  *{box-sizing:border-box;margin:0;padding:0;-webkit-tap-highlight-color:transparent}
  :root{
    --g1:#0d5c35;--g2:#1a8a52;--g3:#22b96e;--g4:#d4f5e3;--g5:#f0faf5;
    --white:#fff;--ink:#0d1a14;--ink2:#3a4a42;--ink3:#7a8c84;--ink4:#b8c8c0;
    --red:#e03030;--gold:#e8a020;--gold-lt:#fff8e7;
    --wa:#25D366;--wa-dark:#128C7E;
    --radius:20px;--radius-sm:12px;--radius-xs:8px;
    --shadow:0 4px 24px rgba(13,92,53,.10);--shadow-lg:0 12px 48px rgba(13,92,53,.18);
    --t:all .22s cubic-bezier(.34,1.56,.64,1);
  }
  body{font-family:'DM Sans',sans-serif;background:var(--g5);color:var(--ink)}
  .phone-wrap{display:flex;justify-content:center;align-items:center;min-height:100vh;padding:20px;
    background:linear-gradient(135deg,#071f12 0%,#0d3d21 50%,#0a2e1a 100%)}
  .phone{width:390px;height:844px;background:var(--g5);border-radius:48px;overflow:hidden;
    position:relative;box-shadow:0 48px 120px rgba(0,0,0,.6),0 0 0 1px rgba(255,255,255,.12),
    inset 0 0 0 1px rgba(255,255,255,.06);display:flex;flex-direction:column}
  .status-bar{height:48px;background:var(--white);display:flex;align-items:center;
    justify-content:space-between;padding:0 24px 0 28px;flex-shrink:0;
    border-bottom:1px solid rgba(13,92,53,.05)}
  .status-bar .time{font-weight:700;font-size:15px}
  .status-bar .icons{display:flex;gap:6px;align-items:center}
  .screen{flex:1;overflow-y:auto;overflow-x:hidden;scroll-behavior:smooth}
  .screen::-webkit-scrollbar{display:none}
  .navbar{height:80px;background:rgba(255,255,255,.97);backdrop-filter:blur(20px);
    display:flex;align-items:center;justify-content:space-around;padding:0 8px 12px;
    flex-shrink:0;border-top:1px solid rgba(13,92,53,.07);
    box-shadow:0 -8px 32px rgba(13,92,53,.07);position:relative;z-index:10}
  .nav-item{display:flex;flex-direction:column;align-items:center;gap:4px;cursor:pointer;
    padding:8px 14px;border-radius:16px;transition:var(--t);min-width:52px}
  .nav-item:active{transform:scale(.9)}
  .nav-item.active{background:var(--g5)}
  .nav-icon{width:24px;height:24px;display:flex;align-items:center;justify-content:center}
  .nav-label{font-size:10px;font-weight:600;color:var(--ink3);letter-spacing:.3px}
  .nav-item.active .nav-label{color:var(--g1)}
  .nav-add{width:56px;height:56px;border-radius:50%;
    background:linear-gradient(135deg,var(--g2),var(--g1));
    display:flex;align-items:center;justify-content:center;cursor:pointer;margin-bottom:8px;
    box-shadow:0 8px 24px rgba(26,138,82,.45);transition:var(--t);flex-shrink:0}
  .nav-add:active{transform:scale(.92)}
  .nav-badge{width:8px;height:8px;border-radius:50%;background:var(--red);
    position:absolute;top:-1px;right:-1px;border:2px solid white}

  /* ── ONBOARDING ── */
  .onb-wrap{flex:1;display:flex;flex-direction:column;background:var(--white)}
  .onb-hero{background:linear-gradient(160deg,var(--g1) 0%,var(--g2) 100%);
    padding:56px 32px 48px;text-align:center;position:relative;overflow:hidden}
  .onb-hero::before{content:'';position:absolute;top:-40px;right:-40px;width:180px;height:180px;
    border-radius:50%;background:rgba(255,255,255,.06)}
  .onb-hero::after{content:'';position:absolute;bottom:-60px;left:-40px;width:200px;height:200px;
    border-radius:50%;background:rgba(255,255,255,.04)}
  .onb-logo{font-family:'Syne',sans-serif;font-weight:800;font-size:48px;color:white;
    letter-spacing:-2px;margin-bottom:8px;position:relative}
  .onb-tag{font-size:16px;color:rgba(255,255,255,.8);font-weight:500;position:relative}
  .onb-body{flex:1;padding:32px 24px;display:flex;flex-direction:column;gap:20px}
  .onb-step{display:flex;align-items:flex-start;gap:16px;padding:16px;
    background:var(--g5);border-radius:16px}
  .onb-step-ico{width:44px;height:44px;border-radius:14px;display:flex;align-items:center;
    justify-content:center;font-size:22px;flex-shrink:0}
  .onb-step-t{font-size:15px;font-weight:700;color:var(--ink);margin-bottom:3px}
  .onb-step-s{font-size:13px;color:var(--ink3);line-height:1.4}
  .onb-cta{margin:0 24px 24px;padding:18px;border-radius:16px;
    background:linear-gradient(135deg,var(--g2),var(--g1));color:white;
    font-family:'DM Sans',sans-serif;font-weight:700;font-size:16px;border:none;cursor:pointer;
    box-shadow:0 8px 24px rgba(26,138,82,.4);transition:var(--t)}
  .onb-cta:active{transform:scale(.98)}
  .onb-sub{text-align:center;font-size:12px;color:var(--ink3);margin-bottom:24px;padding:0 24px}

  /* phone step */
  .phone-step{flex:1;display:flex;flex-direction:column;padding:32px 24px}
  .phone-step h2{font-family:'Syne',sans-serif;font-size:26px;font-weight:800;color:var(--ink);margin-bottom:6px}
  .phone-step p{font-size:14px;color:var(--ink3);margin-bottom:32px;line-height:1.5}
  .phone-input-wrap{display:flex;align-items:center;background:var(--g5);border-radius:14px;
    border:1.5px solid var(--g4);overflow:hidden;margin-bottom:16px;transition:border-color .2s}
  .phone-input-wrap:focus-within{border-color:var(--g3)}
  .phone-flag{padding:14px 12px 14px 16px;font-size:22px;border-right:1.5px solid var(--g4);
    background:var(--white);cursor:pointer}
  .phone-prefix{padding:0 8px;font-size:15px;font-weight:700;color:var(--ink2)}
  .phone-input-wrap input{flex:1;border:none;background:none;font-family:'DM Sans',sans-serif;
    font-size:18px;color:var(--ink);outline:none;padding:14px 16px 14px 4px;letter-spacing:.5px}
  .otp-wrap{display:flex;gap:10px;justify-content:center;margin-bottom:24px}
  .otp-box{width:52px;height:60px;border-radius:14px;border:1.5px solid var(--g4);
    background:var(--g5);font-family:'Syne',sans-serif;font-size:24px;font-weight:800;
    color:var(--ink);text-align:center;outline:none;transition:border-color .2s}
  .otp-box:focus{border-color:var(--g3);background:white}
  .resend-link{text-align:center;font-size:13px;color:var(--ink3);margin-bottom:20px}
  .resend-link span{color:var(--g2);font-weight:700;cursor:pointer}
  .back-link{display:flex;align-items:center;gap:6px;font-size:14px;font-weight:600;
    color:var(--ink2);cursor:pointer;margin-bottom:24px}

  /* ── HOME ── */
  .header{background:var(--white);padding:20px 20px 0;border-bottom:1px solid rgba(13,92,53,.05)}
  .header-top{display:flex;align-items:center;justify-content:space-between;margin-bottom:16px}
  .logo{font-family:'Syne',sans-serif;font-weight:800;font-size:30px;
    background:linear-gradient(135deg,var(--g1),var(--g3));-webkit-background-clip:text;
    -webkit-text-fill-color:transparent;background-clip:text;letter-spacing:-1px}
  .notif-btn{width:40px;height:40px;border-radius:12px;background:var(--g5);
    display:flex;align-items:center;justify-content:center;cursor:pointer;position:relative}
  .notif-dot{width:8px;height:8px;border-radius:50%;background:var(--red);
    position:absolute;top:8px;right:8px;border:2px solid var(--white)}
  .search-bar{display:flex;align-items:center;gap:10px;background:var(--g5);
    border-radius:14px;padding:12px 16px;border:1.5px solid transparent;
    transition:border-color .2s;margin-bottom:16px}
  .search-bar:focus-within{border-color:var(--g3)}
  .search-bar input{flex:1;border:none;background:none;font-family:'DM Sans',sans-serif;
    font-size:14px;color:var(--ink);outline:none}
  .search-bar input::placeholder{color:var(--ink3)}

  /* ── CAT GRID ── */
  .cat-section{background:var(--white);padding:14px 20px 6px;border-bottom:1px solid rgba(13,92,53,.05)}
  .cat-pills{display:flex;gap:8px;overflow-x:auto;margin-bottom:12px}
  .cat-pills::-webkit-scrollbar{display:none}
  .cat-pill{padding:7px 14px;border-radius:50px;font-size:12px;font-weight:700;white-space:nowrap;
    cursor:pointer;transition:var(--t);flex-shrink:0;border:1.5px solid var(--g4);
    color:var(--ink2);background:var(--white)}
  .cat-pill.on{background:var(--g1);color:white;border-color:var(--g1)}
  .cat-grid{display:grid;grid-template-columns:repeat(5,1fr);gap:8px;padding-bottom:10px}
  .cg-item{display:flex;flex-direction:column;align-items:center;gap:4px;cursor:pointer;
    padding:7px 4px;border-radius:14px;transition:var(--t)}
  .cg-item:active{transform:scale(.9)}
  .cg-item.on .cg-ico{border-color:var(--g3)}
  .cg-ico{width:42px;height:42px;border-radius:13px;display:flex;align-items:center;
    justify-content:center;font-size:20px;border:1.5px solid transparent;transition:var(--t)}
  .cg-lbl{font-size:9px;font-weight:700;color:var(--ink2);text-align:center;line-height:1.2}
  .cg-item.on .cg-lbl{color:var(--g1)}
  .show-more-cats{display:flex;align-items:center;justify-content:center;gap:5px;
    padding:6px 0 12px;font-size:12px;font-weight:700;color:var(--g2);cursor:pointer}
  .chev{display:inline-block;transition:transform .25s}
  .chev.open{transform:rotate(180deg)}

  /* ── FLASH SALE ── */
  .flash-section{background:linear-gradient(135deg,#1a0a00,#3d1800);padding:16px 20px}
  .flash-header{display:flex;align-items:center;justify-content:space-between;margin-bottom:12px}
  .flash-title{font-family:'Syne',sans-serif;font-size:17px;font-weight:800;color:white;
    display:flex;align-items:center;gap:8px}
  .flash-timer{display:flex;align-items:center;gap:6px}
  .timer-block{background:rgba(255,255,255,.15);border-radius:8px;padding:4px 8px;
    font-family:'Syne',sans-serif;font-size:16px;font-weight:800;color:white;
    min-width:36px;text-align:center}
  .timer-sep{color:rgba(255,255,255,.6);font-weight:700;font-size:14px}
  .flash-cards{display:flex;gap:10px;overflow-x:auto}
  .flash-cards::-webkit-scrollbar{display:none}
  .flash-card{min-width:150px;background:rgba(255,255,255,.08);border-radius:16px;
    padding:14px;cursor:pointer;flex-shrink:0;border:1px solid rgba(255,255,255,.12);
    transition:var(--t);position:relative}
  .flash-card:active{transform:scale(.96)}
  .flash-badge{position:absolute;top:8px;right:8px;background:#e03030;color:white;
    font-size:10px;font-weight:800;padding:2px 7px;border-radius:50px}
  .flash-em{font-size:36px;display:block;margin-bottom:8px}
  .flash-name{font-size:12px;font-weight:700;color:rgba(255,255,255,.9);
    margin-bottom:4px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
  .flash-price-wrap{display:flex;align-items:baseline;gap:6px;flex-wrap:wrap}
  .flash-price{font-family:'Syne',sans-serif;font-size:15px;font-weight:800;color:white}
  .flash-old{font-size:11px;color:rgba(255,255,255,.45);text-decoration:line-through}
  .flash-pct{background:var(--red);color:white;font-size:9px;font-weight:800;
    padding:2px 5px;border-radius:4px}

  /* ── CARDS ── */
  .section-title{font-weight:700;font-size:18px;color:var(--ink);margin-bottom:2px}
  .section-sub{font-size:13px;color:var(--ink3)}
  .section-header{padding:20px 20px 12px;display:flex;justify-content:space-between;align-items:flex-end}
  .see-all{font-size:13px;font-weight:600;color:var(--g2);cursor:pointer}
  .cards-grid{padding:0 20px 16px;display:grid;grid-template-columns:1fr 1fr;gap:12px}
  .article-card{background:var(--white);border-radius:var(--radius);overflow:hidden;
    box-shadow:var(--shadow);cursor:pointer;transition:var(--t);
    border:1px solid rgba(13,92,53,.06);position:relative}
  .article-card:active{transform:scale(.97);box-shadow:var(--shadow-lg)}
  .article-card.boosted{border:1.5px solid var(--gold);box-shadow:0 4px 24px rgba(232,160,32,.18)}
  .boost-crown{position:absolute;top:8px;right:8px;z-index:2;background:var(--gold);
    border-radius:50%;width:22px;height:22px;display:flex;align-items:center;
    justify-content:center;font-size:11px;box-shadow:0 2px 8px rgba(232,160,32,.4)}
  .card-img{width:100%;aspect-ratio:1;position:relative;overflow:hidden;background:var(--g5)}
  .card-img-inner{width:100%;height:100%;display:flex;align-items:center;
    justify-content:center;font-size:52px;position:relative}
  .card-img-inner::after{content:'';position:absolute;inset:0;
    background:linear-gradient(to bottom,transparent 55%,rgba(0,0,0,.1) 100%)}
  .card-badge{position:absolute;top:8px;left:8px;background:var(--g1);color:var(--white);
    font-size:10px;font-weight:700;padding:3px 8px;border-radius:50px;letter-spacing:.5px;z-index:1}
  .card-badge.hot{background:linear-gradient(135deg,#e03030,#ff6b6b)}
  .heart-btn{position:absolute;bottom:8px;right:8px;width:30px;height:30px;
    background:rgba(255,255,255,.92);backdrop-filter:blur(8px);border-radius:50%;
    display:flex;align-items:center;justify-content:center;cursor:pointer;z-index:1;transition:var(--t)}
  .heart-btn:active{transform:scale(1.35)}
  .card-body{padding:10px 12px 12px}
  .card-title{font-size:13px;font-weight:600;color:var(--ink);margin-bottom:2px;
    line-height:1.3;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
  .card-price{font-size:16px;font-weight:800;color:var(--g1);margin-bottom:4px;font-family:'Syne',sans-serif}
  .card-meta{display:flex;align-items:center;justify-content:space-between}
  .card-loc{font-size:11px;color:var(--ink3);display:flex;align-items:center;gap:3px}
  .card-stats{font-size:11px;color:var(--ink3);display:flex;align-items:center;gap:3px}
  .tag-livraison{display:inline-flex;align-items:center;gap:3px;background:#EDF9F4;
    color:var(--g1);font-size:10px;font-weight:700;padding:2px 7px;border-radius:50px;
    border:1px solid var(--g4);margin-top:4px}

  /* featured */
  .featured-scroll{padding:0 20px 16px;display:flex;gap:12px;overflow-x:auto}
  .featured-scroll::-webkit-scrollbar{display:none}
  .featured-card{min-width:260px;border-radius:var(--radius);overflow:hidden;
    background:linear-gradient(135deg,var(--g1) 0%,var(--g2) 100%);padding:20px;
    cursor:pointer;position:relative;flex-shrink:0;transition:var(--t);
    box-shadow:0 8px 32px rgba(13,92,53,.3)}
  .featured-card:active{transform:scale(.97)}
  .featured-emoji{font-size:56px;margin-bottom:8px;display:block}
  .featured-label{font-size:11px;color:rgba(255,255,255,.7);font-weight:600;
    letter-spacing:1px;text-transform:uppercase;margin-bottom:4px}
  .featured-name{font-size:17px;font-weight:800;color:var(--white);margin-bottom:8px;font-family:'Syne',sans-serif}
  .featured-price{font-size:22px;font-weight:800;color:var(--white);font-family:'Syne',sans-serif}
  .featured-badge{position:absolute;top:16px;right:16px;background:rgba(255,255,255,.2);
    backdrop-filter:blur(8px);color:white;font-size:11px;font-weight:700;
    padding:4px 10px;border-radius:50px;letter-spacing:.5px}

  /* ── DETAIL ── */
  .detail-header{position:sticky;top:0;z-index:10;padding:16px 20px;
    background:rgba(255,255,255,.96);backdrop-filter:blur(20px);
    display:flex;align-items:center;gap:12px;border-bottom:1px solid rgba(13,92,53,.06)}
  .back-btn{width:36px;height:36px;border-radius:10px;background:var(--g5);
    display:flex;align-items:center;justify-content:center;cursor:pointer;transition:.15s}
  .back-btn:active{background:var(--g4)}
  .detail-img{width:100%;aspect-ratio:1;background:var(--g4);
    display:flex;align-items:center;justify-content:center;font-size:110px;position:relative}
  .detail-boost-badge{position:absolute;top:16px;left:16px;
    background:linear-gradient(135deg,#e8a020,#f5c842);color:white;font-size:11px;
    font-weight:800;padding:5px 12px;border-radius:50px;box-shadow:0 4px 12px rgba(232,160,32,.4)}
  .detail-body{padding:20px}
  .detail-cats{display:flex;gap:8px;margin-bottom:12px;flex-wrap:wrap}
  .detail-cat{padding:4px 12px;background:var(--g5);border-radius:50px;font-size:12px;font-weight:600;color:var(--g1)}
  .detail-title{font-family:'Syne',sans-serif;font-size:22px;font-weight:800;color:var(--ink);margin-bottom:6px;line-height:1.2}
  .detail-price{font-family:'Syne',sans-serif;font-size:32px;font-weight:800;color:var(--g1);margin-bottom:16px}
  .detail-desc{font-size:14px;color:var(--ink2);line-height:1.65;margin-bottom:16px;
    padding:14px 16px;background:var(--g5);border-radius:var(--radius-sm)}
  .detail-stats{display:flex;gap:16px;margin-bottom:16px;padding:16px;
    background:var(--g5);border-radius:var(--radius-sm)}
  .stat-item{display:flex;flex-direction:column;align-items:center;gap:2px;flex:1}
  .stat-val{font-size:18px;font-weight:800;color:var(--ink);font-family:'Syne',sans-serif}
  .stat-lbl{font-size:11px;color:var(--ink3);font-weight:500}
  .livraison-row{display:flex;align-items:center;gap:10px;padding:12px 16px;
    background:#EDF9F4;border-radius:var(--radius-sm);margin-bottom:16px;border:1.5px solid var(--g4)}
  .livraison-price{font-size:12px;font-weight:800;color:var(--g1);background:var(--g4);padding:4px 10px;border-radius:50px}
  .seller-row{display:flex;align-items:center;gap:12px;padding:16px;
    background:var(--white);border-radius:var(--radius-sm);border:1.5px solid var(--g4);margin-bottom:16px}
  .seller-avatar{width:44px;height:44px;border-radius:50%;
    background:linear-gradient(135deg,var(--g2),var(--g1));display:flex;
    align-items:center;justify-content:center;font-size:18px;color:white;font-weight:700}
  .seller-name{font-size:15px;font-weight:700;color:var(--ink);margin-bottom:2px}
  .seller-badge{margin-left:auto;padding:4px 10px;background:var(--g5);border-radius:50px;font-size:11px;font-weight:700;color:var(--g1)}
  .rating-row{display:flex;align-items:center;gap:2px;margin-top:2px}
  .star{color:var(--gold);font-size:13px}
  .cta-row{display:flex;gap:10px;margin-top:4px}
  .btn-primary{flex:1;padding:16px;border-radius:var(--radius-sm);
    background:linear-gradient(135deg,var(--g2),var(--g1));color:white;
    font-family:'DM Sans',sans-serif;font-weight:700;font-size:15px;border:none;
    cursor:pointer;transition:var(--t);box-shadow:0 8px 24px rgba(26,138,82,.35)}
  .btn-primary:active{transform:scale(.97)}
  .btn-whatsapp{flex:1;padding:16px;border-radius:var(--radius-sm);
    background:linear-gradient(135deg,#25D366,#128C7E);color:white;
    font-family:'DM Sans',sans-serif;font-weight:700;font-size:14px;border:none;
    cursor:pointer;transition:var(--t);box-shadow:0 8px 24px rgba(37,211,102,.35);
    display:flex;align-items:center;justify-content:center;gap:6px}
  .btn-whatsapp:active{transform:scale(.97)}
  .btn-secondary{width:52px;height:52px;border-radius:var(--radius-sm);
    background:var(--g5);border:1.5px solid var(--g4);display:flex;
    align-items:center;justify-content:center;cursor:pointer;transition:var(--t);flex-shrink:0}
  .btn-secondary:active{transform:scale(.95)}
  .live-tag{font-size:11px;font-weight:700;color:#22c55e;display:flex;align-items:center;margin-bottom:16px}
  .live-dot{width:8px;height:8px;border-radius:50%;background:#22c55e;display:inline-block;
    margin-right:4px;animation:pulse 1.5s ease-in-out infinite}

  /* ── OFFER MODAL ── */
  .offer-suggestions{display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px;margin-bottom:16px}
  .offer-chip{padding:12px 8px;border-radius:12px;background:var(--g5);border:1.5px solid var(--g4);
    text-align:center;cursor:pointer;transition:var(--t)}
  .offer-chip.on{background:var(--g5);border-color:var(--g2)}
  .offer-chip:active{transform:scale(.95)}
  .offer-chip .pct{font-family:'Syne',sans-serif;font-size:16px;font-weight:800;color:var(--g1)}
  .offer-chip .amt{font-size:11px;color:var(--ink3);margin-top:2px}
  .offer-custom-row{display:flex;align-items:center;gap:10px;margin-bottom:20px}
  .offer-custom-input{flex:1;padding:14px;border-radius:12px;border:1.5px solid var(--g4);
    background:var(--white);font-family:'Syne',sans-serif;font-size:18px;font-weight:800;
    color:var(--ink);outline:none;transition:border-color .2s}
  .offer-custom-input:focus{border-color:var(--g2)}
  .offer-fcfa{font-size:13px;font-weight:700;color:var(--ink3)}

  /* ── CHAT ── */
  .chat-header{position:sticky;top:0;z-index:10;background:rgba(255,255,255,.97);
    backdrop-filter:blur(20px);padding:12px 16px;display:flex;align-items:center;gap:12px;
    border-bottom:1px solid rgba(13,92,53,.06)}
  .chat-avatar{width:40px;height:40px;border-radius:50%;background:var(--g5);
    display:flex;align-items:center;justify-content:center;font-size:20px;position:relative}
  .chat-online{width:10px;height:10px;border-radius:50%;background:#22c55e;
    position:absolute;bottom:1px;right:1px;border:2px solid white}
  .chat-name{font-size:15px;font-weight:700;color:var(--ink)}
  .chat-status{font-size:12px;color:var(--g2)}
  .chat-article-banner{margin:12px;background:var(--g5);border-radius:var(--radius-sm);
    padding:10px 12px;display:flex;align-items:center;gap:10px;border:1px solid var(--g4)}
  .chat-messages{padding:12px 16px;display:flex;flex-direction:column;gap:10px;min-height:300px}
  .msg-row{display:flex;gap:8px;align-items:flex-end}
  .msg-row.mine{flex-direction:row-reverse}
  .msg-bubble{max-width:75%;padding:10px 14px;border-radius:18px;font-size:14px;line-height:1.4}
  .msg-bubble.them{background:var(--white);color:var(--ink);border-bottom-left-radius:4px;
    box-shadow:0 2px 8px rgba(0,0,0,.06)}
  .msg-bubble.mine{background:linear-gradient(135deg,var(--g2),var(--g1));color:white;border-bottom-right-radius:4px}
  .msg-time{font-size:10px;margin-top:3px;opacity:.6}
  .msg-time.mine{text-align:right;color:white}
  .msg-time.them{color:var(--ink3)}
  .chat-input-row{padding:12px 16px;background:rgba(255,255,255,.97);backdrop-filter:blur(20px);
    display:flex;gap:10px;align-items:center;border-top:1px solid rgba(13,92,53,.06)}
  .chat-input{flex:1;background:var(--g5);border:1.5px solid var(--g4);border-radius:50px;
    padding:10px 16px;font-family:'DM Sans',sans-serif;font-size:14px;color:var(--ink);
    outline:none;transition:border-color .2s}
  .chat-input:focus{border-color:var(--g3)}
  .chat-send-btn{width:42px;height:42px;border-radius:50%;
    background:linear-gradient(135deg,var(--g2),var(--g1));border:none;cursor:pointer;
    display:flex;align-items:center;justify-content:center;
    box-shadow:0 4px 12px rgba(26,138,82,.4);transition:var(--t);flex-shrink:0}
  .chat-send-btn:active{transform:scale(.92)}

  /* ── NOTIFS ── */
  .notif-header{background:var(--white);padding:20px;border-bottom:1px solid rgba(13,92,53,.06)}
  .notif-header h1{font-family:'Syne',sans-serif;font-size:24px;font-weight:800;color:var(--ink)}
  .notif-tabs{display:flex;gap:0;background:var(--g5);border-radius:12px;padding:3px;margin-top:14px}
  .notif-tab{flex:1;padding:8px;border-radius:10px;font-size:13px;font-weight:600;
    color:var(--ink3);text-align:center;cursor:pointer;transition:.2s}
  .notif-tab.active{background:var(--white);color:var(--g1);box-shadow:0 2px 8px rgba(13,92,53,.1)}
  .notif-item{display:flex;align-items:flex-start;gap:14px;padding:16px 20px;cursor:pointer;
    transition:.15s;border-bottom:1px solid rgba(13,92,53,.05)}
  .notif-item:active{background:var(--g5)}
  .notif-item.unread{background:linear-gradient(90deg,rgba(212,245,227,.35),transparent)}
  .notif-icon-wrap{width:44px;height:44px;border-radius:14px;display:flex;align-items:center;
    justify-content:center;font-size:20px;flex-shrink:0}
  .notif-title{font-size:14px;font-weight:700;color:var(--ink);margin-bottom:2px}
  .notif-text{font-size:13px;color:var(--ink3);line-height:1.4;margin-bottom:4px}
  .notif-time{font-size:11px;color:var(--ink4)}
  .notif-article{font-size:12px;color:var(--ink2);margin-top:5px;background:var(--g5);
    padding:5px 10px;border-radius:8px;display:inline-block}

  /* ── SEARCH ── */
  .search-screen-header{background:var(--white);padding:20px 20px 12px;border-bottom:1px solid rgba(13,92,53,.06)}
  .search-screen-header h1{font-family:'Syne',sans-serif;font-size:24px;font-weight:800;color:var(--ink);margin-bottom:14px}
  .filter-chips{display:flex;gap:8px;overflow-x:auto;margin-top:12px;padding-bottom:4px}
  .filter-chips::-webkit-scrollbar{display:none}
  .filter-chip{padding:6px 14px;border-radius:50px;font-size:12px;font-weight:600;white-space:nowrap;
    cursor:pointer;flex-shrink:0;border:1.5px solid var(--g4);color:var(--ink2);background:var(--white);transition:.15s}
  .filter-chip.on{background:var(--g1);color:white;border-color:var(--g1)}
  .trending{padding:20px}
  .trending-title{font-size:11px;font-weight:700;color:var(--ink3);text-transform:uppercase;letter-spacing:1px;margin-bottom:12px}
  .trending-item{display:flex;align-items:center;gap:12px;padding:11px 0;border-bottom:1px solid rgba(13,92,53,.06);cursor:pointer}
  .trend-rank{font-family:'Syne',sans-serif;font-size:18px;font-weight:800;color:var(--g4);min-width:28px}
  .trend-name{font-size:14px;font-weight:600;color:var(--ink);flex:1}
  .trend-count{font-size:12px;color:var(--ink3)}
  .trend-arrow{font-size:13px;color:var(--g2);font-weight:700}

  /* ── PUBLISH ── */
  .post-header{background:var(--white);padding:20px;border-bottom:1px solid rgba(13,92,53,.06)}
  .post-header h1{font-family:'Syne',sans-serif;font-size:24px;font-weight:800;color:var(--ink);margin-bottom:4px}
  .post-header p{font-size:13px;color:var(--ink3)}
  .photo-zone{margin:20px;display:grid;grid-template-columns:1fr;gap:8px}
  .photo-main{border-radius:16px;border:2px dashed var(--g4);background:var(--g5);height:140px;
    display:flex;flex-direction:column;align-items:center;justify-content:center;gap:8px;cursor:pointer;transition:.2s}
  .photo-main:active{border-color:var(--g2)}
  .photo-thumb{display:flex;gap:8px}
  .photo-thumb-slot{flex:1;height:60px;border-radius:12px;border:1.5px dashed var(--g4);
    background:var(--g5);display:flex;align-items:center;justify-content:center;
    font-size:20px;color:var(--ink3);cursor:pointer;transition:.2s}
  .photo-thumb-slot:active{background:var(--g4)}
  .form-body{padding:0 20px 24px;display:flex;flex-direction:column;gap:14px}
  .form-group label{font-size:11px;font-weight:700;color:var(--ink2);display:block;margin-bottom:5px;letter-spacing:.4px;text-transform:uppercase}
  .form-input{width:100%;padding:13px 15px;border-radius:var(--radius-sm);border:1.5px solid var(--g4);
    background:var(--white);font-family:'DM Sans',sans-serif;font-size:15px;color:var(--ink);outline:none;transition:border-color .2s}
  .form-input:focus{border-color:var(--g2)}
  .form-input.error{border-color:var(--red)}
  .form-input::placeholder{color:var(--ink4)}
  .form-row{display:grid;grid-template-columns:1fr 1fr;gap:12px}
  .error-msg{font-size:11px;color:var(--red);font-weight:600;margin-top:3px;display:block}
  .char-count{font-size:11px;color:var(--ink4)}
  .toggle-row{display:flex;align-items:center;justify-content:space-between;padding:13px 15px;
    background:var(--g5);border-radius:var(--radius-sm)}
  .toggle-label{font-size:14px;font-weight:600;color:var(--ink2)}
  .toggle{width:48px;height:28px;border-radius:50px;background:var(--g2);
    position:relative;cursor:pointer;transition:background .2s}
  .toggle::after{content:'';width:22px;height:22px;border-radius:50%;background:white;
    position:absolute;top:3px;right:3px;transition:all .2s cubic-bezier(.34,1.56,.64,1);
    box-shadow:0 2px 8px rgba(0,0,0,.2)}
  .toggle.off{background:var(--ink4)}
  .toggle.off::after{right:auto;left:3px}
  .boost-banner{display:flex;align-items:center;gap:12px;padding:14px 16px;
    background:var(--gold-lt);border-radius:var(--radius-sm);border:1.5px solid #FFD54F;cursor:pointer}
  .boost-banner-title{font-size:14px;font-weight:700;color:#7B4F00}
  .boost-banner-sub{font-size:12px;color:#9B6F20}
  .boost-banner-arrow{font-size:18px;color:#9B6F20;margin-left:auto}
  .submit-btn{width:100%;padding:17px;border-radius:var(--radius-sm);
    background:linear-gradient(135deg,var(--g2),var(--g1));color:white;
    font-family:'DM Sans',sans-serif;font-weight:700;font-size:16px;border:none;cursor:pointer;
    box-shadow:0 8px 24px rgba(26,138,82,.35);transition:var(--t)}
  .submit-btn:active{transform:scale(.98)}

  /* ── MESSAGES ── */
  .msg-header{background:var(--white);padding:20px;border-bottom:1px solid rgba(13,92,53,.06)}
  .msg-header h1{font-family:'Syne',sans-serif;font-size:24px;font-weight:800;color:var(--ink);margin-bottom:16px}
  .msg-tabs{display:flex;gap:0;background:var(--g5);border-radius:12px;padding:3px}
  .msg-tab{flex:1;padding:8px;border-radius:10px;font-size:13px;font-weight:600;
    color:var(--ink3);text-align:center;cursor:pointer;transition:.2s}
  .msg-tab.active{background:var(--white);color:var(--g1);box-shadow:0 2px 8px rgba(13,92,53,.1)}
  .conv-list{padding:8px 0}
  .conv-item{display:flex;align-items:center;gap:14px;padding:14px 20px;cursor:pointer;transition:.15s}
  .conv-item:active{background:var(--g5)}
  .conv-avatar{width:52px;height:52px;border-radius:50%;flex-shrink:0;display:flex;
    align-items:center;justify-content:center;font-size:22px;position:relative;background:var(--g5)}
  .conv-online{width:12px;height:12px;border-radius:50%;background:#22c55e;position:absolute;bottom:2px;right:2px;border:2px solid white}
  .conv-body{flex:1;min-width:0}
  .conv-name{font-size:15px;font-weight:700;color:var(--ink);margin-bottom:2px}
  .conv-preview{font-size:13px;color:var(--ink3);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
  .conv-right{display:flex;flex-direction:column;align-items:flex-end;gap:6px;flex-shrink:0}
  .conv-time{font-size:11px;color:var(--ink3)}
  .conv-badge{width:20px;height:20px;border-radius:50%;background:var(--g1);color:white;font-size:11px;font-weight:700;display:flex;align-items:center;justify-content:center}
  .conv-article{margin:0 20px 12px 86px;padding:8px 12px;background:var(--g5);border-radius:10px;font-size:12px;color:var(--ink2);border-left:3px solid var(--g3)}

  /* ── PROFILE ── */
  .profile-hero{background:linear-gradient(160deg,var(--g1) 0%,var(--g2) 100%);
    padding:32px 24px 28px;position:relative;overflow:hidden}
  .profile-hero::before{content:'';position:absolute;inset:0;
    background:radial-gradient(circle at 80% 20%,rgba(255,255,255,.1) 0%,transparent 60%)}
  .profile-avatar-wrap{position:relative;display:inline-flex;margin-bottom:12px}
  .profile-avatar{width:72px;height:72px;border-radius:50%;background:rgba(255,255,255,.2);
    backdrop-filter:blur(10px);border:3px solid rgba(255,255,255,.5);display:flex;align-items:center;justify-content:center;font-size:32px}
  .profile-verified{width:22px;height:22px;border-radius:50%;background:var(--gold);
    position:absolute;bottom:0;right:0;border:2px solid white;display:flex;align-items:center;justify-content:center;font-size:10px}
  .profile-name{font-family:'Syne',sans-serif;font-size:22px;font-weight:800;color:white;margin-bottom:4px}
  .profile-handle{font-size:13px;color:rgba(255,255,255,.7);margin-bottom:16px}
  .profile-stats-row{display:flex}
  .profile-stat{flex:1;text-align:center;padding:12px 0}
  .profile-stat+.profile-stat{border-left:1px solid rgba(255,255,255,.15)}
  .pstat-val{font-family:'Syne',sans-serif;font-size:20px;font-weight:800;color:white;display:block}
  .pstat-lbl{font-size:11px;color:rgba(255,255,255,.6);margin-top:2px;display:block}
  .profile-body{padding:20px}
  .menu-section{margin-bottom:20px}
  .menu-section-title{font-size:12px;font-weight:700;color:var(--ink3);text-transform:uppercase;letter-spacing:1px;margin-bottom:8px}
  .menu-card{background:var(--white);border-radius:var(--radius);overflow:hidden;box-shadow:var(--shadow)}
  .menu-item{display:flex;align-items:center;gap:14px;padding:16px;cursor:pointer;transition:.15s;border-bottom:1px solid rgba(13,92,53,.05)}
  .menu-item:last-child{border-bottom:none}
  .menu-item:active{background:var(--g5)}
  .menu-icon{width:38px;height:38px;border-radius:10px;display:flex;align-items:center;justify-content:center;font-size:18px;flex-shrink:0}
  .menu-text{flex:1}
  .menu-title{font-size:14px;font-weight:600;color:var(--ink);margin-bottom:1px}
  .menu-sub{font-size:12px;color:var(--ink3)}

  /* ── MES ANNONCES ── */
  .my-ads-header{background:var(--white);padding:16px 20px;border-bottom:1px solid rgba(13,92,53,.06);
    display:flex;align-items:center;gap:12px}
  .my-ads-tabs{display:flex;gap:0;background:var(--g5);border-radius:12px;padding:3px;margin:12px 20px 0}
  .my-ads-tab{flex:1;padding:8px;border-radius:10px;font-size:12px;font-weight:600;
    color:var(--ink3);text-align:center;cursor:pointer;transition:.2s}
  .my-ads-tab.active{background:var(--white);color:var(--g1);box-shadow:0 2px 8px rgba(13,92,53,.1)}
  .my-ad-item{display:flex;gap:12px;padding:14px 20px;border-bottom:1px solid rgba(13,92,53,.05);cursor:pointer;transition:.15s}
  .my-ad-item:active{background:var(--g5)}
  .my-ad-img{width:64px;height:64px;border-radius:12px;background:var(--g5);display:flex;align-items:center;justify-content:center;font-size:30px;flex-shrink:0;border:1px solid rgba(13,92,53,.07)}
  .my-ad-body{flex:1;min-width:0}
  .my-ad-title{font-size:14px;font-weight:700;color:var(--ink);margin-bottom:2px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
  .my-ad-price{font-family:'Syne',sans-serif;font-size:16px;font-weight:800;color:var(--g1);margin-bottom:6px}
  .my-ad-stats{display:flex;gap:12px}
  .my-ad-stat{font-size:11px;color:var(--ink3);display:flex;align-items:center;gap:3px}
  .my-ad-actions{display:flex;flex-direction:column;align-items:flex-end;gap:6px;flex-shrink:0}
  .my-ad-status{font-size:10px;font-weight:700;padding:3px 8px;border-radius:50px}
  .my-ad-status.active{background:#E8F5E9;color:var(--g1)}
  .my-ad-status.sold{background:#FDF0EF;color:var(--red)}
  .my-ad-boost-btn{font-size:10px;font-weight:700;padding:4px 10px;border-radius:50px;
    background:var(--gold-lt);color:#7B4F00;border:1px solid #FFD54F;cursor:pointer;transition:.15s}

  /* ── MODALS ── */
  .overlay{position:absolute;inset:0;background:rgba(0,0,0,.5);z-index:50;
    display:flex;align-items:flex-end;animation:fadeIn .2s ease}
  .bottom-sheet{width:100%;background:var(--white);border-radius:28px 28px 0 0;
    padding:20px;animation:slideUp .3s cubic-bezier(.22,1,.36,1) both}
  .sheet-handle{width:40px;height:4px;background:var(--ink4);border-radius:2px;margin:0 auto 20px}
  .share-preview{display:flex;gap:12px;padding:12px;background:var(--g5);border-radius:14px;margin-bottom:20px;align-items:center}
  .share-options{display:flex;gap:12px;justify-content:center;margin-bottom:16px}
  .share-option{display:flex;flex-direction:column;align-items:center;gap:6px;cursor:pointer;flex:1}
  .share-option-icon{width:56px;height:56px;border-radius:16px;display:flex;align-items:center;justify-content:center;font-size:26px;transition:.15s}
  .share-option-icon:active{transform:scale(.9)}
  .share-option-label{font-size:11px;font-weight:600;color:var(--ink2)}
  .sheet-cancel{width:100%;padding:16px;border-radius:var(--radius-sm);
    background:var(--g5);color:var(--ink2);font-family:'DM Sans',sans-serif;font-weight:700;font-size:15px;border:none;cursor:pointer}
  .boost-plan{display:flex;align-items:center;gap:14px;padding:14px 16px;border-radius:14px;
    cursor:pointer;border:2px solid var(--g4);transition:.15s;background:var(--white);margin-bottom:10px}
  .boost-plan.selected{border-color:var(--gold);background:#FFFBF0}
  .boost-plan-icon{font-size:24px}
  .boost-plan-text{flex:1}
  .boost-plan-name{font-size:14px;font-weight:700;color:var(--ink)}
  .boost-plan-desc{font-size:12px;color:var(--ink3)}
  .boost-plan-price{font-family:'Syne',sans-serif;font-size:16px;font-weight:800;color:var(--gold)}
  .boost-cta{width:100%;padding:16px;border-radius:var(--radius-sm);
    background:linear-gradient(135deg,#e8a020,#f5c842);color:white;
    font-family:'DM Sans',sans-serif;font-weight:700;font-size:15px;border:none;cursor:pointer;
    margin-bottom:10px;box-shadow:0 8px 24px rgba(232,160,32,.35)}

  /* toast */
  .toast{position:absolute;bottom:90px;left:50%;transform:translateX(-50%) translateY(20px);
    background:var(--ink);color:white;padding:12px 20px;border-radius:50px;font-size:13px;
    font-weight:600;white-space:nowrap;z-index:200;opacity:0;
    transition:all .3s cubic-bezier(.34,1.56,.64,1);pointer-events:none}
  .toast.show{opacity:1;transform:translateX(-50%) translateY(0)}
  .toast.wa{background:linear-gradient(135deg,#25D366,#128C7E)}
  .toast.gold{background:linear-gradient(135deg,#e8a020,#f5c842);color:white}
  .empty-state{display:flex;flex-direction:column;align-items:center;justify-content:center;
    padding:60px 20px;gap:12px;text-align:center}
  .empty-state .emoji{font-size:48px}
  .empty-state h3{font-size:17px;font-weight:700;color:var(--ink)}
  .empty-state p{font-size:14px;color:var(--ink3);max-width:220px;line-height:1.4}
  @keyframes slideUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}
  @keyframes fadeIn{from{opacity:0}to{opacity:1}}
  @keyframes pulse{0%,100%{opacity:1}50%{opacity:.4}}
  @keyframes heartPop{0%{transform:scale(1)}40%{transform:scale(1.4)}70%{transform:scale(.9)}100%{transform:scale(1)}}
  .animate-in{animation:slideUp .32s cubic-bezier(.22,1,.36,1) both}
  .animate-in-2{animation:slideUp .32s .06s cubic-bezier(.22,1,.36,1) both}
  .animate-in-3{animation:slideUp .32s .12s cubic-bezier(.22,1,.36,1) both}
  .heart-pop{animation:heartPop .35s cubic-bezier(.34,1.56,.64,1)}

  /* ── PAYMENT ── */
  .pay-header{background:var(--white);padding:16px 20px;border-bottom:1px solid rgba(13,92,53,.06);display:flex;align-items:center;gap:12px}
  .pay-hero{margin:20px;background:linear-gradient(135deg,var(--g1),var(--g2));border-radius:20px;padding:20px;display:flex;align-items:center;gap:14px}
  .pay-hero-em{font-size:48px;flex-shrink:0}
  .pay-hero-name{font-family:'Syne',sans-serif;font-size:16px;font-weight:800;color:white;margin-bottom:4px}
  .pay-hero-price{font-family:'Syne',sans-serif;font-size:28px;font-weight:800;color:white}
  .pay-hero-comm{font-size:12px;color:rgba(255,255,255,.7);margin-top:2px}
  .pay-section{padding:0 20px 16px}
  .pay-section-title{font-size:11px;font-weight:700;color:var(--ink3);text-transform:uppercase;letter-spacing:.5px;margin-bottom:10px}
  .pay-method{display:flex;align-items:center;gap:14px;padding:14px 16px;background:var(--white);border-radius:16px;border:2px solid var(--g4);cursor:pointer;transition:var(--t);margin-bottom:10px}
  .pay-method.selected{border-color:var(--g2);background:var(--g5)}
  .pay-method-logo{width:44px;height:44px;border-radius:12px;display:flex;align-items:center;justify-content:center;font-size:24px;flex-shrink:0}
  .pay-method-name{font-size:15px;font-weight:700;color:var(--ink)}
  .pay-method-desc{font-size:12px;color:var(--ink3)}
  .pay-radio{width:20px;height:20px;border-radius:50%;border:2px solid var(--g4);margin-left:auto;display:flex;align-items:center;justify-content:center;flex-shrink:0;transition:var(--t)}
  .pay-method.selected .pay-radio{border-color:var(--g2);background:var(--g2)}
  .pay-radio-dot{width:8px;height:8px;border-radius:50%;background:white}
  .pay-number-wrap{background:var(--g5);border-radius:14px;padding:14px 16px;display:flex;align-items:center;gap:12px;border:1.5px solid var(--g4);margin-bottom:16px;transition:border-color .2s}
  .pay-number-wrap:focus-within{border-color:var(--g2)}
  .pay-number-flag{font-size:22px}
  .pay-number-wrap input{flex:1;border:none;background:none;font-family:'DM Sans',sans-serif;font-size:16px;color:var(--ink);outline:none;letter-spacing:.5px}
  .pay-summary{background:var(--g5);border-radius:16px;padding:16px;margin-bottom:20px}
  .pay-row{display:flex;justify-content:space-between;align-items:center;padding:6px 0}
  .pay-row+.pay-row{border-top:1px solid rgba(13,92,53,.08)}
  .pay-row-label{font-size:13px;color:var(--ink3)}
  .pay-row-val{font-size:14px;font-weight:600;color:var(--ink)}
  .pay-row.total .pay-row-label{font-size:15px;font-weight:700;color:var(--ink)}
  .pay-row.total .pay-row-val{font-family:'Syne',sans-serif;font-size:18px;font-weight:800;color:var(--g1)}
  .pay-btn{width:100%;padding:18px;border-radius:16px;border:none;cursor:pointer;
    font-family:'DM Sans',sans-serif;font-weight:700;font-size:16px;transition:var(--t);
    box-shadow:0 8px 24px rgba(0,0,0,.15)}
  .pay-btn:active{transform:scale(.98)}
  .pay-btn.wave{background:linear-gradient(135deg,#1B7FE0,#0F5CB8);color:white}
  .pay-btn.om{background:linear-gradient(135deg,#FF6B00,#E05500);color:white}
  .pay-btn.cash{background:linear-gradient(135deg,var(--g2),var(--g1));color:white}
  .pay-success{display:flex;flex-direction:column;align-items:center;justify-content:center;padding:48px 32px;text-align:center;gap:16px;flex:1}
  .pay-success-circle{width:96px;height:96px;border-radius:50%;background:linear-gradient(135deg,var(--g2),var(--g1));display:flex;align-items:center;justify-content:center;font-size:44px;box-shadow:0 12px 40px rgba(26,138,82,.35)}
  @keyframes checkPop{0%{transform:scale(0)}60%{transform:scale(1.15)}100%{transform:scale(1)}}
  .pay-success-circle{animation:checkPop .5s cubic-bezier(.34,1.56,.64,1) both}

  /* ── SELLER PROFILE ── */
  .seller-profile-hero{background:linear-gradient(160deg,var(--g1),var(--g2));padding:28px 20px 24px;position:relative;overflow:hidden}
  .seller-profile-hero::before{content:'';position:absolute;top:-30px;right:-30px;width:140px;height:140px;border-radius:50%;background:rgba(255,255,255,.07)}
  .sp-avatar{width:68px;height:68px;border-radius:50%;background:rgba(255,255,255,.2);border:3px solid rgba(255,255,255,.5);display:flex;align-items:center;justify-content:center;font-size:28px;font-weight:700;color:white;margin-bottom:10px}
  .sp-name{font-family:'Syne',sans-serif;font-size:20px;font-weight:800;color:white;margin-bottom:2px}
  .sp-handle{font-size:12px;color:rgba(255,255,255,.65);margin-bottom:12px}
  .sp-badges{display:flex;gap:8px;flex-wrap:wrap}
  .sp-badge{padding:4px 10px;border-radius:50px;font-size:11px;font-weight:700;background:rgba(255,255,255,.15);color:white;border:1px solid rgba(255,255,255,.25)}
  .sp-stats{display:flex;margin-top:16px}
  .sp-stat{flex:1;text-align:center;padding:10px 0}
  .sp-stat+.sp-stat{border-left:1px solid rgba(255,255,255,.15)}
  .sp-stat-val{font-family:'Syne',sans-serif;font-size:18px;font-weight:800;color:white;display:block}
  .sp-stat-lbl{font-size:10px;color:rgba(255,255,255,.6);margin-top:1px;display:block}
  .sp-body{padding:16px 20px}
  .sp-section-title{font-size:11px;font-weight:700;color:var(--ink3);text-transform:uppercase;letter-spacing:1px;margin-bottom:12px}
  .review-item{padding:14px 0;border-bottom:1px solid rgba(13,92,53,.06)}
  .review-top{display:flex;align-items:center;gap:10px;margin-bottom:6px}
  .review-avatar{width:36px;height:36px;border-radius:50%;background:var(--g5);display:flex;align-items:center;justify-content:center;font-size:16px;flex-shrink:0}
  .review-name{font-size:13px;font-weight:700;color:var(--ink)}
  .review-date{font-size:11px;color:var(--ink3);margin-left:auto}
  .review-stars{display:flex;gap:2px;margin-bottom:4px}
  .review-text{font-size:13px;color:var(--ink2);line-height:1.5}

  /* ── REVIEW MODAL ── */
  .stars-picker{display:flex;justify-content:center;gap:10px;margin:16px 0 24px}
  .star-pick{font-size:36px;cursor:pointer;transition:var(--t);filter:grayscale(1);opacity:.4}
  .star-pick.on{filter:none;opacity:1;animation:heartPop .3s cubic-bezier(.34,1.56,.64,1)}
  .review-textarea{width:100%;padding:14px;border-radius:14px;border:1.5px solid var(--g4);background:var(--g5);font-family:'DM Sans',sans-serif;font-size:14px;color:var(--ink);outline:none;resize:none;line-height:1.5;transition:border-color .2s}
  .review-textarea:focus{border-color:var(--g2);background:white}
  .review-tags{display:flex;gap:8px;flex-wrap:wrap;margin-bottom:16px}
  .review-tag{padding:7px 14px;border-radius:50px;font-size:12px;font-weight:600;cursor:pointer;transition:var(--t);border:1.5px solid var(--g4);color:var(--ink2);background:var(--white)}
  .review-tag.on{background:var(--g1);color:white;border-color:var(--g1)}

  /* ── ADVANCED FILTER ── */
  .filter-modal{max-height:85%;overflow-y:auto}
  .filter-modal::-webkit-scrollbar{display:none}
  .filter-title{font-family:'Syne',sans-serif;font-size:20px;font-weight:800;color:var(--ink);margin-bottom:4px}
  .filter-sub{font-size:13px;color:var(--ink3);margin-bottom:20px}
  .filter-section{margin-bottom:22px}
  .filter-section-title{font-size:11px;font-weight:700;color:var(--ink3);text-transform:uppercase;letter-spacing:.5px;margin-bottom:12px}
  .price-range-wrap{padding:8px 0}
  .price-slider{width:100%;accent-color:var(--g2);cursor:pointer;height:4px}
  .price-labels{display:flex;justify-content:space-between;margin-top:8px}
  .price-label{font-family:'Syne',sans-serif;font-size:15px;font-weight:700;color:var(--g1)}
  .sort-options{display:grid;grid-template-columns:1fr 1fr;gap:8px}
  .sort-opt{padding:12px;border-radius:12px;font-size:13px;font-weight:600;cursor:pointer;text-align:center;border:1.5px solid var(--g4);color:var(--ink2);background:var(--white);transition:var(--t)}
  .sort-opt.on{background:var(--g1);color:white;border-color:var(--g1)}
  .commune-grid{display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px}
  .commune-chip{padding:9px 8px;border-radius:10px;font-size:12px;font-weight:600;cursor:pointer;text-align:center;border:1.5px solid var(--g4);color:var(--ink2);background:var(--white);transition:var(--t)}
  .commune-chip.on{background:var(--g1);color:white;border-color:var(--g1)}
  .state-opts{display:flex;gap:8px}
  .state-opt{flex:1;padding:11px 8px;border-radius:12px;font-size:13px;font-weight:600;cursor:pointer;text-align:center;border:1.5px solid var(--g4);color:var(--ink2);background:var(--white);transition:var(--t)}
  .state-opt.on{background:var(--g1);color:white;border-color:var(--g1)}
  .filter-footer{display:flex;gap:10px;margin-top:4px}
  .filter-reset{flex:1;padding:15px;border-radius:14px;background:var(--g5);color:var(--ink2);font-family:'DM Sans',sans-serif;font-weight:700;font-size:15px;border:none;cursor:pointer}
  .filter-apply{flex:2;padding:15px;border-radius:14px;background:linear-gradient(135deg,var(--g2),var(--g1));color:white;font-family:'DM Sans',sans-serif;font-weight:700;font-size:15px;border:none;cursor:pointer;box-shadow:0 6px 20px rgba(26,138,82,.3)}

  /* ── DASHBOARD ── */
  .dash-header{background:linear-gradient(160deg,var(--g1),var(--g2));padding:24px 20px 20px;position:relative;overflow:hidden}
  .dash-header::before{content:'';position:absolute;top:-30px;right:-30px;width:160px;height:160px;border-radius:50%;background:rgba(255,255,255,.06)}
  .dash-back{display:flex;align-items:center;gap:8px;color:rgba(255,255,255,.75);font-size:13px;font-weight:600;cursor:pointer;margin-bottom:16px}
  .dash-title{font-family:'Syne',sans-serif;font-size:22px;font-weight:800;color:white;margin-bottom:4px}
  .dash-sub{font-size:13px;color:rgba(255,255,255,.65)}
  .dash-kpis{display:grid;grid-template-columns:1fr 1fr;gap:10px;padding:16px 20px}
  .kpi-card{background:var(--white);border-radius:16px;padding:14px 16px;box-shadow:var(--shadow);border:1px solid rgba(13,92,53,.06)}
  .kpi-label{font-size:11px;font-weight:700;color:var(--ink3);text-transform:uppercase;letter-spacing:.4px;margin-bottom:6px}
  .kpi-val{font-family:'Syne',sans-serif;font-size:24px;font-weight:800;color:var(--ink);margin-bottom:4px}
  .kpi-delta{font-size:12px;font-weight:600}
  .kpi-delta.up{color:var(--g2)}
  .kpi-delta.down{color:var(--red)}
  .chart-card{margin:0 20px 16px;background:var(--white);border-radius:18px;padding:16px;box-shadow:var(--shadow);border:1px solid rgba(13,92,53,.06)}
  .chart-title{font-size:14px;font-weight:700;color:var(--ink);margin-bottom:4px}
  .chart-sub{font-size:12px;color:var(--ink3);margin-bottom:14px}
  .chart-wrap{position:relative;height:120px}
  .chart-bars{display:flex;align-items:flex-end;gap:5px;height:100%}
  .chart-bar-col{flex:1;display:flex;flex-direction:column;align-items:center;gap:4px}
  .chart-bar{width:100%;border-radius:6px 6px 0 0;background:linear-gradient(to top,var(--g1),var(--g3));transition:height .4s cubic-bezier(.34,1.56,.64,1);min-height:4px;cursor:pointer;position:relative}
  .chart-bar:hover::after{content:attr(data-val);position:absolute;top:-24px;left:50%;transform:translateX(-50%);background:var(--ink);color:white;font-size:10px;font-weight:700;padding:3px 6px;border-radius:6px;white-space:nowrap}
  .chart-bar.active{background:linear-gradient(to top,var(--gold),#f5c842)}
  .chart-lbl{font-size:9px;color:var(--ink3);font-weight:600}
  .dash-section{padding:0 20px 16px}
  .dash-section-title{font-size:12px;font-weight:700;color:var(--ink3);text-transform:uppercase;letter-spacing:.8px;margin-bottom:10px}
  .perf-row{display:flex;align-items:center;gap:12px;padding:12px 0;border-bottom:1px solid rgba(13,92,53,.06);cursor:pointer}
  .perf-row:last-child{border-bottom:none}
  .perf-em{width:44px;height:44px;border-radius:12px;background:var(--g5);display:flex;align-items:center;justify-content:center;font-size:22px;flex-shrink:0}
  .perf-body{flex:1;min-width:0}
  .perf-title{font-size:13px;font-weight:700;color:var(--ink);margin-bottom:2px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
  .perf-stats{display:flex;gap:10px}
  .perf-stat{font-size:11px;color:var(--ink3)}
  .perf-right{text-align:right;flex-shrink:0}
  .perf-price{font-family:'Syne',sans-serif;font-size:14px;font-weight:800;color:var(--g1)}
  .perf-views-bar{height:4px;border-radius:2px;background:var(--g4);margin-top:6px;overflow:hidden}
  .perf-views-fill{height:100%;border-radius:2px;background:linear-gradient(90deg,var(--g2),var(--g3));transition:width .6s ease}
  .tips-card{margin:0 20px 16px;background:linear-gradient(135deg,#1a0a3d,#2d1060);border-radius:18px;padding:16px;position:relative;overflow:hidden}
  .tips-card::before{content:'✨';position:absolute;top:12px;right:16px;font-size:28px}
  .tips-title{font-family:'Syne',sans-serif;font-size:15px;font-weight:800;color:white;margin-bottom:6px}
  .tips-text{font-size:13px;color:rgba(255,255,255,.75);line-height:1.5;margin-bottom:12px}
  .tips-cta{padding:8px 16px;background:rgba(255,255,255,.15);border-radius:50px;font-size:12px;font-weight:700;color:white;border:1px solid rgba(255,255,255,.25);cursor:pointer;display:inline-block}

  /* ── MAP ── */
  .map-header{background:var(--white);padding:16px 20px;border-bottom:1px solid rgba(13,92,53,.06);display:flex;align-items:center;gap:12px;position:sticky;top:0;z-index:10}
  .map-container{position:relative;background:#e8f4e8;overflow:hidden;flex:1}
  .map-svg{width:100%;height:340px}
  .map-zone{cursor:pointer;transition:var(--t)}
  .map-zone:hover{filter:brightness(1.05)}
  .map-zone.active{filter:brightness(1.1)}
  .map-label{font-family:'DM Sans',sans-serif;font-size:11px;font-weight:700;fill:#fff;pointer-events:none}
  .map-count{font-family:'Syne',sans-serif;font-size:14px;font-weight:800;fill:#fff;pointer-events:none}
  .map-legend{padding:12px 20px;display:flex;gap:8px;overflow-x:auto;background:var(--white);border-top:1px solid rgba(13,92,53,.06)}
  .map-legend::-webkit-scrollbar{display:none}
  .legend-chip{padding:6px 12px;border-radius:50px;font-size:11px;font-weight:700;white-space:nowrap;flex-shrink:0;cursor:pointer;transition:var(--t)}
  .map-annonces{padding:16px 20px}
  .map-annonces-title{font-size:14px;font-weight:700;color:var(--ink);margin-bottom:12px}

  /* ── AI RECO ── */
  .reco-header{position:sticky;top:0;background:rgba(255,255,255,.97);backdrop-filter:blur(20px);padding:14px 20px;border-bottom:1px solid rgba(13,92,53,.06);display:flex;align-items:center;gap:12px;z-index:10}
  .reco-hero{padding:20px;background:linear-gradient(135deg,#1a0a3d,#3d0f7a);margin:16px;border-radius:20px;position:relative;overflow:hidden}
  .reco-hero::before{content:'🤖';position:absolute;right:16px;top:50%;transform:translateY(-50%);font-size:48px;opacity:.3}
  .reco-hero-title{font-family:'Syne',sans-serif;font-size:18px;font-weight:800;color:white;margin-bottom:4px}
  .reco-hero-sub{font-size:13px;color:rgba(255,255,255,.7);line-height:1.5}
  .reco-section{padding:0 20px 16px}
  .reco-section-title{font-size:12px;font-weight:700;color:var(--ink3);text-transform:uppercase;letter-spacing:.8px;margin-bottom:12px;display:flex;align-items:center;gap:6px}
  .reco-cards{display:flex;gap:10px;overflow-x:auto;padding-bottom:4px}
  .reco-cards::-webkit-scrollbar{display:none}
  .reco-card{min-width:150px;background:var(--white);border-radius:16px;overflow:hidden;flex-shrink:0;border:1px solid rgba(13,92,53,.07);cursor:pointer;transition:var(--t);box-shadow:var(--shadow)}
  .reco-card:active{transform:scale(.96)}
  .reco-img{height:100px;background:var(--g5);display:flex;align-items:center;justify-content:center;font-size:40px;position:relative}
  .reco-match{position:absolute;top:6px;right:6px;background:var(--g1);color:white;font-size:9px;font-weight:800;padding:2px 6px;border-radius:50px}
  .reco-body{padding:8px 10px 10px}
  .reco-name{font-size:12px;font-weight:700;color:var(--ink);margin-bottom:2px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
  .reco-price{font-family:'Syne',sans-serif;font-size:14px;font-weight:800;color:var(--g1)}
  .reco-reason{font-size:10px;color:var(--ink3);margin-top:2px}
  .reco-tag{display:inline-flex;align-items:center;gap:4px;padding:6px 12px;border-radius:50px;font-size:12px;font-weight:600;background:var(--g5);color:var(--g1);border:1px solid var(--g4);cursor:pointer;transition:var(--t);flex-shrink:0}
  .reco-tag.on{background:var(--g1);color:white;border-color:var(--g1)}
  .reco-interest-row{display:flex;gap:8px;overflow-x:auto;margin-bottom:16px;padding-bottom:4px}
  .reco-interest-row::-webkit-scrollbar{display:none}
  .ai-thinking{display:flex;align-items:center;gap:8px;padding:12px 16px;background:linear-gradient(135deg,rgba(26,10,61,.08),rgba(61,15,122,.08));border-radius:12px;margin:0 20px 16px;border:1px solid rgba(26,10,61,.12)}
  .ai-thinking-dot{width:6px;height:6px;border-radius:50%;background:#7c3aed;animation:pulse 1s ease-in-out infinite}
  .ai-thinking-dot:nth-child(2){animation-delay:.15s}
  .ai-thinking-dot:nth-child(3){animation-delay:.3s}

  /* ── HISTORY ── */
  .hist-header{background:var(--white);padding:16px 20px;border-bottom:1px solid rgba(13,92,53,.06);display:flex;align-items:center;gap:12px}
  .hist-tabs{display:flex;gap:0;background:var(--g5);border-radius:12px;padding:3px;margin:12px 20px 0}
  .hist-tab{flex:1;padding:8px;border-radius:10px;font-size:12px;font-weight:600;color:var(--ink3);text-align:center;cursor:pointer;transition:.2s}
  .hist-tab.active{background:var(--white);color:var(--g1);box-shadow:0 2px 8px rgba(13,92,53,.1)}
  .hist-item{padding:14px 20px;border-bottom:1px solid rgba(13,92,53,.05);cursor:pointer;transition:.15s}
  .hist-item:active{background:var(--g5)}
  .hist-top{display:flex;align-items:center;gap:12px;margin-bottom:8px}
  .hist-em{width:48px;height:48px;border-radius:14px;background:var(--g5);display:flex;align-items:center;justify-content:center;font-size:24px;flex-shrink:0;border:1px solid rgba(13,92,53,.07)}
  .hist-info{flex:1;min-width:0}
  .hist-title{font-size:14px;font-weight:700;color:var(--ink);margin-bottom:2px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
  .hist-date{font-size:11px;color:var(--ink3)}
  .hist-amount{font-family:'Syne',sans-serif;font-size:16px;font-weight:800;text-align:right;flex-shrink:0}
  .hist-amount.out{color:var(--red)}
  .hist-amount.in{color:var(--g2)}
  .hist-row{display:flex;align-items:center;justify-content:space-between}
  .hist-method{display:flex;align-items:center;gap:5px;font-size:11px;color:var(--ink3);font-weight:600}
  .hist-status{font-size:10px;font-weight:700;padding:3px 9px;border-radius:50px}
  .hist-status.done{background:#E8F5E9;color:var(--g1)}
  .hist-status.pending{background:#FFF4E0;color:#7B4F00}
  .hist-status.cancel{background:#FDF0EF;color:var(--red)}
  .hist-summary{margin:16px 20px;background:var(--white);border-radius:16px;padding:16px;box-shadow:var(--shadow);display:flex;gap:0}
  .hist-sum-item{flex:1;text-align:center;padding:8px 0}
  .hist-sum-item+.hist-sum-item{border-left:1px solid rgba(13,92,53,.08)}
  .hist-sum-val{font-family:'Syne',sans-serif;font-size:18px;font-weight:800;color:var(--ink);display:block}
  .hist-sum-lbl{font-size:10px;color:var(--ink3);margin-top:2px;display:block}

  /* ── DARK MODE ── */
  .dark{--g5:#0d1a14;--white:#162212;--ink:#e8f5ef;--ink2:#b8d4c4;--ink3:#7a9c8a;--ink4:#2a4234;--g4:#1e3228;--shadow:0 4px 24px rgba(0,0,0,.4)}
  .dark .status-bar,.dark .header,.dark .navbar,.dark .cat-section,.dark .categories,.dark .search-screen-header,.dark .post-header,.dark .msg-header,.dark .notif-header,.dark .map-header,.dark .reco-header,.dark .hist-header,.dark .my-ads-header,.dark .detail-header,.dark .pay-header,.dark .chat-header,.dark .settings-header,.dark .support-header{filter:none}
  .dark .article-card,.dark .menu-card,.dark .kpi-card,.dark .chart-card,.dark .settings-card,.dark .boost-plan,.dark .pay-method,.dark .pay-summary,.dark .hist-summary,.dark .seller-row,.dark .reco-card,.dark .my-ad-item{background:var(--white);border-color:var(--g4)}
  .dark .featured-card{border-color:transparent}
  .dark .cat-pill:not(.on),.dark .filter-chip:not(.on),.dark .form-input,.dark .chat-input,.dark .otp-box,.dark .review-textarea,.dark .offer-custom-input,.dark .cg-lbl,.dark .conv-name,.dark .conv-preview,.dark .atitle,.dark .card-title,.dark .card-loc,.dark .card-stats,.dark .perf-title,.dark .perf-stat{color:var(--ink)}
  .dark .search-bar,.dark .sb,.dark .phone-input-wrap,.dark .pay-number-wrap,.dark .toggle-row,.dark .detail-desc,.dark .detail-stats,.dark .ai-thinking,.dark .photo-main,.dark .photo-thumb-slot,.dark .conv-article,.dark .hist-item{background:var(--g5);border-color:var(--g4)}
  .dark .form-input{background:var(--g5);border-color:var(--g4)}
  .dark .notif-item.unread{background:rgba(34,185,110,.08)}
  .dark .support-bubble.bot,.dark .msg-bubble.them{background:var(--white)}
  .dark .bottom-sheet,.dark .share-preview,.dark .pay-hero{background:var(--white)}
  .dark body{background:#0a1410}

  /* ── SETTINGS ── */
  .settings-header{background:var(--white);padding:16px 20px;border-bottom:1px solid rgba(13,92,53,.06);display:flex;align-items:center;gap:12px;position:sticky;top:0;z-index:10}
  .settings-section{padding:20px 20px 4px}
  .settings-section-title{font-size:11px;font-weight:700;color:var(--ink3);text-transform:uppercase;letter-spacing:.8px;margin-bottom:10px}
  .settings-card{background:var(--white);border-radius:18px;overflow:hidden;box-shadow:var(--shadow);margin-bottom:16px;border:1px solid rgba(13,92,53,.06)}
  .settings-item{display:flex;align-items:center;gap:14px;padding:15px 16px;cursor:pointer;transition:.15s;border-bottom:1px solid rgba(13,92,53,.04)}
  .settings-item:last-child{border-bottom:none}
  .settings-item:active{background:var(--g5)}
  .settings-ico{width:36px;height:36px;border-radius:10px;display:flex;align-items:center;justify-content:center;font-size:17px;flex-shrink:0}
  .settings-label{flex:1;font-size:14px;font-weight:600;color:var(--ink)}
  .settings-val{font-size:13px;color:var(--ink3);margin-right:6px}
  .settings-toggle{width:44px;height:26px;border-radius:50px;position:relative;cursor:pointer;transition:background .2s;flex-shrink:0}
  .settings-toggle::after{content:'';width:20px;height:20px;border-radius:50%;background:white;position:absolute;top:3px;right:3px;transition:all .2s cubic-bezier(.34,1.56,.64,1);box-shadow:0 2px 6px rgba(0,0,0,.2)}
  .settings-toggle.off{background:var(--ink4)}
  .settings-toggle.off::after{right:auto;left:3px}
  .settings-toggle.on{background:var(--g2)}

  /* ── REPORT ── */
  .report-reasons{display:flex;flex-direction:column;gap:8px;margin-bottom:20px}
  .report-reason{display:flex;align-items:center;gap:12px;padding:13px 14px;border-radius:14px;border:1.5px solid var(--g4);background:var(--white);cursor:pointer;transition:var(--t)}
  .report-reason.on{border-color:var(--red);background:#FDF5F5}
  .report-reason-ico{font-size:20px;flex-shrink:0;width:28px;text-align:center}
  .report-reason-text{font-size:14px;font-weight:600;color:var(--ink)}
  .report-radio{width:18px;height:18px;border-radius:50%;border:2px solid var(--ink4);margin-left:auto;flex-shrink:0;display:flex;align-items:center;justify-content:center;transition:var(--t)}
  .report-reason.on .report-radio{border-color:var(--red);background:var(--red)}
  .report-cta{width:100%;padding:15px;border-radius:14px;background:var(--red);color:white;font-family:'DM Sans',sans-serif;font-weight:700;font-size:15px;border:none;cursor:pointer;margin-bottom:10px;box-shadow:0 6px 20px rgba(224,48,48,.3)}
  .report-cta:disabled{opacity:.4;cursor:not-allowed}

  /* ── PREMIUM ── */
  .premium-hero{background:linear-gradient(160deg,#1a0a3d,#4a1580,#7c3aed);padding:36px 24px 32px;position:relative;overflow:hidden;text-align:center}
  .premium-hero::before{content:'👑';position:absolute;font-size:180px;opacity:.06;right:-20px;top:-20px}
  .premium-badge{display:inline-flex;align-items:center;gap:6px;padding:6px 16px;border-radius:50px;background:rgba(255,255,255,.15);border:1px solid rgba(255,255,255,.25);color:white;font-size:12px;font-weight:700;letter-spacing:.5px;margin-bottom:16px}
  .premium-title{font-family:'Syne',sans-serif;font-size:28px;font-weight:800;color:white;margin-bottom:8px;line-height:1.2}
  .premium-sub{font-size:14px;color:rgba(255,255,255,.75);line-height:1.5;margin-bottom:8px}
  .premium-plans{display:flex;gap:10px;padding:20px}
  .premium-plan{flex:1;border-radius:18px;border:2px solid var(--g4);background:var(--white);padding:16px;cursor:pointer;transition:var(--t);position:relative;text-align:center}
  .premium-plan.selected{border-color:#7c3aed;box-shadow:0 4px 20px rgba(124,58,237,.2)}
  .premium-plan.popular{border-color:#7c3aed}
  .popular-badge{position:absolute;top:-10px;left:50%;transform:translateX(-50%);background:#7c3aed;color:white;font-size:10px;font-weight:800;padding:3px 10px;border-radius:50px;white-space:nowrap}
  .plan-period{font-size:11px;font-weight:700;color:var(--ink3);text-transform:uppercase;letter-spacing:.5px;margin-bottom:6px}
  .plan-price{font-family:'Syne',sans-serif;font-size:22px;font-weight:800;color:var(--ink);margin-bottom:2px}
  .plan-save{font-size:11px;font-weight:700;color:#7c3aed;margin-top:2px}
  .premium-perks{padding:0 20px 16px}
  .perk-item{display:flex;align-items:flex-start;gap:12px;padding:12px 0;border-bottom:1px solid rgba(13,92,53,.06)}
  .perk-item:last-child{border-bottom:none}
  .perk-ico{width:38px;height:38px;border-radius:12px;background:linear-gradient(135deg,#f5f0ff,#ede8ff);display:flex;align-items:center;justify-content:center;font-size:18px;flex-shrink:0}
  .perk-title{font-size:14px;font-weight:700;color:var(--ink);margin-bottom:2px}
  .perk-desc{font-size:12px;color:var(--ink3);line-height:1.4}
  .premium-cta{margin:4px 20px 8px;padding:18px;border-radius:16px;background:linear-gradient(135deg,#7c3aed,#4a1580);color:white;font-family:'DM Sans',sans-serif;font-weight:800;font-size:16px;border:none;cursor:pointer;width:calc(100% - 40px);box-shadow:0 8px 28px rgba(124,58,237,.4);transition:var(--t);display:block}
  .premium-cta:active{transform:scale(.98)}
  .premium-cancel{display:block;text-align:center;font-size:13px;color:var(--ink3);padding:12px;cursor:pointer;margin-bottom:8px}

  /* ── SUPPORT CHAT ── */
  .support-header{background:linear-gradient(135deg,var(--g1),var(--g2));padding:14px 16px 14px 20px;display:flex;align-items:center;gap:12px}
  .support-bot-avatar{width:42px;height:42px;border-radius:50%;background:rgba(255,255,255,.2);display:flex;align-items:center;justify-content:center;font-size:22px;border:2px solid rgba(255,255,255,.4);flex-shrink:0}
  .support-online{font-size:11px;color:rgba(255,255,255,.75);margin-top:2px;display:flex;align-items:center;gap:4px}
  .support-online::before{content:'';width:6px;height:6px;border-radius:50%;background:#4ade80;display:inline-block}
  .support-messages{padding:16px;display:flex;flex-direction:column;gap:12px}
  .support-bubble{max-width:82%;padding:12px 15px;border-radius:18px;font-size:14px;line-height:1.5}
  .support-bubble.bot{background:var(--white);color:var(--ink);border-bottom-left-radius:4px;box-shadow:0 2px 8px rgba(0,0,0,.07);align-self:flex-start}
  .support-bubble.user{background:linear-gradient(135deg,var(--g2),var(--g1));color:white;border-bottom-right-radius:4px;align-self:flex-end}
  .support-quick-btn{padding:8px 14px;border-radius:50px;background:var(--g5);border:1.5px solid var(--g4);font-size:12px;font-weight:600;color:var(--g1);cursor:pointer;transition:var(--t);white-space:nowrap;flex-shrink:0}
  .support-quick-btn:active{transform:scale(.95)}
  .typing-dot{width:6px;height:6px;border-radius:50%;background:var(--ink3);animation:pulse .9s ease-in-out infinite}
  .typing-dot:nth-child(2){animation-delay:.15s}
  .typing-dot:nth-child(3){animation-delay:.3s}`;

/* ── DATA ── */
const ALL_CATS = [
  {id:"mode",    ico:"👗", lbl:"Mode",         bg:"#FFF0F5"},
  {id:"electro", ico:"🖥️", lbl:"Électro",      bg:"#EEF4FF"},
  {id:"tel",     ico:"📱", lbl:"Téléphones",   bg:"#F0FAF5"},
  {id:"maison",  ico:"🛋️", lbl:"Maison",       bg:"#FFFBEE"},
  {id:"vehicule",ico:"🚗", lbl:"Véhicules",    bg:"#FFF4E0"},
  {id:"moto",    ico:"🏍️", lbl:"Motos",        bg:"#FDF0EF"},
  {id:"info",    ico:"💻", lbl:"Informatique", bg:"#EEF4FF"},
  {id:"sport",   ico:"⚽", lbl:"Sport",        bg:"#F0FAF5"},
  {id:"beaute",  ico:"💄", lbl:"Beauté",       bg:"#FFF0F5"},
  {id:"bebe",    ico:"🧸", lbl:"Bébé",         bg:"#FFFBEE"},
  {id:"livre",   ico:"📚", lbl:"Livres",       bg:"#EEF4FF"},
  {id:"musique", ico:"🎸", lbl:"Musique",      bg:"#F5F0FF"},
  {id:"jeux",    ico:"🎮", lbl:"Jeux",         bg:"#F0F5FF"},
  {id:"jardin",  ico:"🌿", lbl:"Jardin",       bg:"#F0FAF5"},
  {id:"bricolage",ico:"🔧",lbl:"Bricolage",    bg:"#FFF4E0"},
  {id:"art",     ico:"🎨", lbl:"Art",          bg:"#FFF0F5"},
  {id:"animal",  ico:"🐾", lbl:"Animaux",      bg:"#F0FAF5"},
  {id:"cuisine", ico:"🍳", lbl:"Cuisine",      bg:"#FFFBEE"},
  {id:"bijoux",  ico:"💍", lbl:"Bijoux",       bg:"#FFF4E0"},
  {id:"sante",   ico:"💊", lbl:"Santé",        bg:"#F0FAF5"},
  {id:"voyage",  ico:"🧳", lbl:"Voyage",       bg:"#EEF4FF"},
  {id:"photo",   ico:"📷", lbl:"Photo",        bg:"#F0FAF5"},
  {id:"agri",    ico:"🌾", lbl:"Agricole",     bg:"#F0FAF5"},
  {id:"service", ico:"🤝", lbl:"Services",     bg:"#FFF4E0"},
  {id:"autre",   ico:"📦", lbl:"Autre",        bg:"#F5F5F5"},
];
const CAT_PILLS = ["Tout","Mode","Électro","Maison","Véhicules","Sport"];

const annonces = [
  {id:1,emoji:"👟",title:"Nike Air Max 270",price:"35 000",priceNum:35000,commune:"Cocody",views:142,likes:18,catId:"mode",cat:"Mode",state:"Bon état",badge:"TENDANCE",badgeType:"hot",seller:"Adjoua K.",sellerInitial:"A",sellerPhone:"2250700000001",sellerScore:4.8,sellerSales:23,livraison:true,livraisonPrice:"500",description:"Pointure 42, coloris blanc/noir. Porté 3 fois seulement. Très bon état général."},
  {id:2,emoji:"📱",title:"iPhone 12 Pro",price:"280 000",priceNum:280000,commune:"Plateau",views:389,likes:54,catId:"tel",cat:"Électro",state:"Bon état",badge:"VÉRIFIÉ",seller:"Konan M.",sellerInitial:"K",sellerPhone:"2250700000002",sellerScore:4.9,sellerSales:41,livraison:true,livraisonPrice:"1 000",description:"128Go, débloqué tout opérateur. Batterie à 89%. Vendu avec chargeur original et boîte."},
  {id:3,emoji:"🛋️",title:"Canapé 3 places",price:"85 000",priceNum:85000,commune:"Marcory",views:67,likes:9,catId:"maison",cat:"Maison",state:"Usagé",badge:null,seller:"Bamba S.",sellerInitial:"B",sellerPhone:"2250700000003",sellerScore:4.5,sellerSales:8,livraison:false,description:"Canapé velours vert, quelques traces d'usure. Idéal pour compléter un salon. À venir récupérer sur place."},
  {id:4,emoji:"👜",title:"Sac Louis Vuitton",price:"120 000",priceNum:120000,commune:"Cocody",views:201,likes:37,catId:"mode",cat:"Mode",state:"Bon état",badge:"FLASH",badgeType:"hot",seller:"Marie T.",sellerInitial:"M",sellerPhone:"2250700000004",sellerScore:5.0,sellerSales:15,livraison:true,livraisonPrice:"500",description:"Sac authentique avec certificat. Modèle Neverfull MM. Acheté à Paris il y a 8 mois."},
  {id:5,emoji:"💻",title:"MacBook Air M1",price:"480 000",priceNum:480000,commune:"Yopougon",views:520,likes:88,catId:"info",cat:"Électro",state:"Neuf",badge:"PREMIUM",seller:"Eric D.",sellerInitial:"E",sellerPhone:"2250700000005",sellerScore:4.7,sellerSales:29,livraison:false,description:"MacBook Air M1 8Go RAM 256Go SSD. Jamais utilisé, encore sous blister. Facture disponible."},
  {id:6,emoji:"🏍️",title:"Moto Honda CBF 125",price:"650 000",priceNum:650000,commune:"Abobo",views:310,likes:42,catId:"moto",cat:"Véhicules",state:"Bon état",badge:null,seller:"Diallo A.",sellerInitial:"D",sellerPhone:"2250700000006",sellerScore:4.6,sellerSales:7,livraison:false,description:"Honda CBF 125, 2021, 12 000 km. Révision faite en janvier 2024. Documents à jour."},
  {id:7,emoji:"🎮",title:"PS5 + 2 manettes",price:"320 000",priceNum:320000,commune:"Cocody",views:450,likes:73,catId:"jeux",cat:"Jeux",state:"Bon état",badge:"TENDANCE",badgeType:"hot",seller:"Frank K.",sellerInitial:"F",sellerPhone:"2250700000007",sellerScore:4.8,sellerSales:12,livraison:true,livraisonPrice:"1 000",description:"PS5 edition disc, 2 manettes DualSense, 3 jeux inclus. Très bon état."},
  {id:8,emoji:"📷",title:"Canon EOS 250D",price:"180 000",priceNum:180000,commune:"Marcory",views:134,likes:22,catId:"photo",cat:"Photo",state:"Bon état",badge:null,seller:"Aya N.",sellerInitial:"A",sellerPhone:"2250700000008",sellerScore:4.6,sellerSales:18,livraison:true,livraisonPrice:"500",description:"Appareil photo reflex, objectif 18-55mm inclus. Moins de 500 déclenchements. Idéal débutant."},
];

const FLASH_annonces = [
  {id:101,emoji:"👟",name:"Basket Puma RS-X",price:"22 000",oldPrice:"38 000",pct:42,commune:"Cocody"},
  {id:102,emoji:"📱",name:"Samsung A52",price:"95 000",oldPrice:"145 000",pct:34,commune:"Plateau"},
  {id:103,emoji:"🎧",name:"Casque Sony WH-1000",price:"48 000",oldPrice:"75 000",pct:36,commune:"Yopougon"},
  {id:104,emoji:"💺",name:"Chaise gaming",price:"35 000",oldPrice:"60 000",pct:42,commune:"Marcory"},
];

const CONVERSATIONS = [
  {id:1,name:"Adjoua Kouamé",emoji:"👩🏾",articleId:1,preview:"Toujours disponible?",time:"09:14",unread:2,online:true,
    messages:[{id:1,mine:false,text:"Bonjour ! L'article est toujours disponible ?",time:"09:10"},{id:2,mine:true,text:"Oui, toujours dispo 😊",time:"09:12"},{id:3,mine:false,text:"Toujours disponible?",time:"09:14"}]},
  {id:2,name:"Konan Mensah",emoji:"👨🏾",articleId:2,preview:"Ok je passe demain matin 👍",time:"Hier",unread:0,online:false,
    messages:[{id:1,mine:false,text:"Bonjour, je suis intéressé par l'iPhone",time:"Hier"},{id:2,mine:true,text:"Bienvenue ! C'est toujours dispo",time:"Hier"},{id:3,mine:false,text:"Ok je passe demain matin 👍",time:"Hier"}]},
  {id:3,name:"Bamba Soro",emoji:"🧑🏾",articleId:3,preview:"1 500 FCFA de moins possible?",time:"Mar",unread:1,online:true,
    messages:[{id:1,mine:false,text:"Bonjour, 1 500 FCFA de moins possible?",time:"Mar"}]},
  {id:4,name:"Marie Touré",emoji:"👩🏾‍💼",articleId:4,preview:"Tu peux envoyer plus de photos?",time:"Lun",unread:0,online:false,
    messages:[{id:1,mine:false,text:"Tu peux envoyer plus de photos?",time:"Lun"}]},
];

const NOTIFICATIONS = [
  {id:1,type:"message",icon:"💬",bg:"#E8F5E9",title:"Nouveau message",text:"Adjoua Kouamé t'a envoyé un message pour Nike Air Max 270",time:"Il y a 5 min",articleId:1,unread:true},
  {id:2,type:"view",icon:"👁️",bg:"#E3F2FD",title:"Annonce vue 50 fois",text:"Ton iPhone 12 Pro a atteint 350 vues aujourd'hui !",time:"Il y a 30 min",articleId:2,unread:true},
  {id:3,type:"like",icon:"❤️",bg:"#FCE4EC",title:"Nouveau favori",text:"Quelqu'un a ajouté ton MacBook Air à ses favoris",time:"Il y a 1h",articleId:5,unread:true},
  {id:4,type:"boost",icon:"👑",bg:"#FFF8E1",title:"Boost expiré",text:"Le boost de ton Canapé 3 places est terminé. Renouvelle !",time:"Il y a 3h",articleId:3,unread:false},
  {id:5,type:"offer",icon:"💰",bg:"#F3E5F5",title:"Proposition de prix",text:"Eric D. propose 450 000 FCFA pour ton MacBook Air M1",time:"Hier",articleId:5,unread:false},
  {id:6,type:"sold",icon:"✅",bg:"#E8F5E9",title:"Article vendu !",text:"Félicitations ! Ton Sac LV est marqué comme vendu",time:"Hier",articleId:4,unread:false},
];

const TRENDING = [
  {rank:1,name:"iPhone 14 Pro Max",count:"234 annonces",up:true},
  {rank:2,name:"Chaussures Nike",count:"189 annonces",up:true},
  {rank:3,name:"MacBook",count:"156 annonces",up:false},
  {rank:4,name:"Canapé salon",count:"142 annonces",up:true},
  {rank:5,name:"Réfrigérateur",count:"98 annonces",up:false},
];

const BOOST_PLANS = [
  {id:"starter",icon:"🚀",name:"Starter",desc:"Top des résultats · 3 jours",price:"500"},
  {id:"pro",icon:"⚡",name:"Pro",desc:"Mise en avant + badge · 7 jours",price:"1 000"},
  {id:"premium",icon:"👑",name:"Premium",desc:"Featured + notif acheteurs · 14 jours",price:"2 500"},
];

/* ── ICONS ── */
function Icon({name,size=22,color="var(--ink2)"}) {
  const icons = {
    home:<svg width={size} height={size} viewBox="0 0 24 24" fill="none"><path d="M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1H4a1 1 0 01-1-1V9.5z" fill={color}/><path d="M9 21V12h6v9" fill="white"/></svg>,
    search:<svg width={size} height={size} viewBox="0 0 24 24" fill="none"><circle cx="11" cy="11" r="7" stroke={color} strokeWidth="2"/><path d="M20 20l-3-3" stroke={color} strokeWidth="2.5" strokeLinecap="round"/></svg>,
    plus:<svg width={size} height={size} viewBox="0 0 24 24" fill="none"><path d="M12 5v14M5 12h14" stroke="white" strokeWidth="2.5" strokeLinecap="round"/></svg>,
    msg:<svg width={size} height={size} viewBox="0 0 24 24" fill="none"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2v10z" fill={color}/></svg>,
    user:<svg width={size} height={size} viewBox="0 0 24 24" fill="none"><circle cx="12" cy="8" r="4" fill={color}/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" fill={color}/></svg>,
    bell:<svg width={size} height={size} viewBox="0 0 24 24" fill="none"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0" stroke={color} strokeWidth="2" strokeLinecap="round"/></svg>,
    heart:<svg width={size} height={size} viewBox="0 0 24 24" fill="none"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" stroke={color} strokeWidth="2"/></svg>,
    heartFill:<svg width={size} height={size} viewBox="0 0 24 24" fill="none"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" fill="#e03030" stroke="#e03030" strokeWidth="2"/></svg>,
    back:<svg width={size} height={size} viewBox="0 0 24 24" fill="none"><path d="M19 12H5M5 12l7 7M5 12l7-7" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>,
    loc:<svg width={size} height={size} viewBox="0 0 24 24" fill="none"><path d="M12 21s-7-6.9-7-11a7 7 0 1114 0c0 4.1-7 11-7 11z" fill={color}/><circle cx="12" cy="10" r="2" fill="white"/></svg>,
    eye:<svg width={size} height={size} viewBox="0 0 24 24" fill="none"><path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7z" stroke={color} strokeWidth="2"/><circle cx="12" cy="12" r="3" stroke={color} strokeWidth="2"/></svg>,
    share:<svg width={size} height={size} viewBox="0 0 24 24" fill="none"><circle cx="18" cy="5" r="3" stroke={color} strokeWidth="2"/><circle cx="6" cy="12" r="3" stroke={color} strokeWidth="2"/><circle cx="18" cy="19" r="3" stroke={color} strokeWidth="2"/><path d="M8.59 13.51l6.83 3.98M15.41 6.51L8.59 10.49" stroke={color} strokeWidth="2" strokeLinecap="round"/></svg>,
    chevron:<svg width={size} height={size} viewBox="0 0 24 24" fill="none"><path d="M9 18l6-6-6-6" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>,
    send:<svg width={size} height={size} viewBox="0 0 24 24" fill="none"><path d="M22 2L11 13M22 2L15 22l-4-9-9-4 20-7z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>,
    wa:<svg width={size} height={size} viewBox="0 0 24 24" fill="white"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 00-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>,
    check:<svg width={size} height={size} viewBox="0 0 24 24" fill="none"><path d="M20 6L9 17l-5-5" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>,
    camera:<svg width={size} height={size} viewBox="0 0 24 24" fill="none"><path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z" stroke={color} strokeWidth="2"/><circle cx="12" cy="13" r="4" stroke={color} strokeWidth="2"/></svg>,
    down:<svg width={size} height={size} viewBox="0 0 24 24" fill="none"><path d="M6 9l6 6 6-6" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  };
  return icons[name] || null;
}

/* ── FLASH TIMER ── */
function FlashTimer() {
  const [time, setTime] = useState({h:"05",m:"47",s:"23"});
  useEffect(() => {
    const t = setInterval(() => {
      setTime(prev => {
        let s = parseInt(prev.s)-1, m = parseInt(prev.m), h = parseInt(prev.h);
        if(s<0){s=59;m--;}if(m<0){m=59;h--;}if(h<0){h=5;m=59;s=59;}
        return {h:String(h).padStart(2,"0"),m:String(m).padStart(2,"0"),s:String(s).padStart(2,"0")};
      });
    },1000);
    return ()=>clearInterval(t);
  },[]);
  return (
    <div className="flash-timer">
      <div className="timer-block">{time.h}</div>
      <span className="timer-sep">:</span>
      <div className="timer-block">{time.m}</div>
      <span className="timer-sep">:</span>
      <div className="timer-block">{time.s}</div>
    </div>
  );
}

/* ── ARTICLE CARD ── */
function ArticleCard({article,boosted,liked,onLike,onClick}) {
  const [popping,setPopping] = useState(false);
  const handleLike = (e) => {
    e.stopPropagation();setPopping(true);setTimeout(()=>setPopping(false),350);onLike(article.id);
  };
  return (
    <div className={`article-card ${boosted?"boosted":""}`} onClick={onClick}>
      {boosted && <div className="boost-crown">👑</div>}
      <div className="card-img">
        <div className="card-img-inner">{article.photo ? <img src={article.photo} style={{width:'100%',height:'100%',objectFit:'cover'}} alt={article.title}/> : article.emoji}</div>
        {article.badge && <span className={`card-badge ${article.badgeType||""}`}>{article.badge}</span>}
        <div className={`heart-btn ${popping?"heart-pop":""}`} onClick={handleLike}>
          <Icon name={liked?"heartFill":"heart"} size={14} color="var(--red)"/>
        </div>
      </div>
      <div className="card-body">
        <div className="card-title">{article.title}</div>
        <div className="card-price">{article.price} <span style={{fontSize:11,fontWeight:500,color:"var(--ink3)"}}>FCFA</span></div>
        {article.livraison && <div className="tag-livraison">🛵 Livraison dispo</div>}
        <div className="card-meta" style={{marginTop:4}}>
          <span className="card-loc"><Icon name="loc" size={10} color="var(--ink3)"/>{article.commune}</span>
          <span className="card-stats"><Icon name="eye" size={10} color="var(--ink3)"/>{article.views}</span>
        </div>
      </div>
    </div>
  );
}

/* ── CHAT SCREEN ── */
function ChatScreen({conv,article,onBack,onWhatsApp}) {
  const [messages,setMessages] = useState(conv.messages);
  const [input,setInput] = useState("");
  const bottomRef = useRef(null);
  const nowTime = () => { const d=new Date(); return `${d.getHours()}:${String(d.getMinutes()).padStart(2,"0")}`; };
  const send = () => {
    if(!input.trim()) return;
    const text = input.trim();
    setMessages(m=>[...m,{id:Date.now(),mine:true,text,time:nowTime()}]);
    setInput("");
    sendMessage({
      annonce_id: null,
      sender_id: null,
      receiver_id: null,
      contenu: text
    }).catch(()=>{});
    setTimeout(()=>{
      const r=["Ok merci 😊","Je viens voir demain","C'est négociable ?","Ça m'intéresse !","Tu es dispo ce soir ?"];
      setMessages(m=>[...m,{id:Date.now()+1,mine:false,text:r[Math.floor(Math.random()*r.length)],time:nowTime()}]);
    },1200);
  };
  useEffect(()=>{bottomRef.current?.scrollIntoView({behavior:"smooth"})},[messages]);
  return (
    <div style={{display:"flex",flexDirection:"column",height:"100%"}}>
      <div className="chat-header">
        <div className="back-btn" onClick={onBack}><Icon name="back" size={18} color="var(--ink)"/></div>
        <div className="chat-avatar">
          <span style={{fontSize:22}}>{conv.emoji}</span>
          {conv.online && <div className="chat-online"/>}
        </div>
        <div style={{flex:1}}>
          <div className="chat-name">{conv.name}</div>
          <div className="chat-status">{conv.online?"En ligne":"Hors ligne"}</div>
        </div>
        <div style={{width:36,height:36,borderRadius:10,background:"#E8F5FE",display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer"}} onClick={()=>onWhatsApp(article)}>
          <Icon name="wa" size={18} color="#25D366"/>
        </div>
      </div>
      <div style={{flex:1,overflowY:"auto"}} className="screen">
        {article && (
          <div className="chat-article-banner">
            <span style={{fontSize:28}}>{article.emoji}</span>
            <div style={{flex:1}}>
              <div style={{fontSize:13,fontWeight:700,color:"var(--ink)"}}>{article.title}</div>
              <div style={{fontSize:14,fontWeight:800,color:"var(--g1)"}}>{article.price} FCFA</div>
            </div>
            <span style={{fontSize:11,color:"var(--ink3)"}}>📍 {article.commune}</span>
          </div>
        )}
        <div className="chat-messages">
          {messages.map(msg=>(
            <div key={msg.id} className={`msg-row ${msg.mine?"mine":""}`}>
              {!msg.mine && <div style={{width:28,height:28,borderRadius:"50%",background:"var(--g5)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:14,flexShrink:0}}>{conv.emoji}</div>}
              <div>
                <div className={`msg-bubble ${msg.mine?"mine":"them"}`}>{msg.text}</div>
                <div className={`msg-time ${msg.mine?"mine":"them"}`}>{msg.time}</div>
              </div>
            </div>
          ))}
          <div ref={bottomRef}/>
        </div>
      </div>
      <div className="chat-input-row">
        <input className="chat-input" placeholder="Écrire un message..." value={input}
          onChange={e=>setInput(e.target.value)} onKeyDown={e=>e.key==="Enter"&&send()}/>
        <button className="chat-send-btn" onClick={send}><Icon name="send" size={18}/></button>
      </div>
    </div>
  );
}

/* ── MES ANNONCES ── */
function MesAnnonces({onBack,onBoost,likes,boostedIds,onDetail}) {
  const [tab,setTab] = useState("actives");
  const myAds = annonces.slice(0,4);
  const sold = annonces.slice(4,6);
  const list = tab==="actives" ? myAds : sold;
  return (
    <div style={{animation:"slideUp .32s cubic-bezier(.22,1,.36,1) both"}}>
      <div className="my-ads-header">
        <div className="back-btn" onClick={onBack}><Icon name="back" size={18} color="var(--ink)"/></div>
        <span style={{fontFamily:"Syne,sans-serif",fontWeight:800,fontSize:18,color:"var(--ink)"}}>Mes annonces</span>
      </div>
      <div className="my-ads-tabs">
        {["actives","vendus","favoris"].map(t=>(
          <div key={t} className={`my-ads-tab ${tab===t?"active":""}`} onClick={()=>setTab(t)}>
            {t==="actives"?"✅ Actives":t==="vendus"?"📦 Vendus":"❤️ Favoris"}
          </div>
        ))}
      </div>
      <div style={{marginTop:12}}>
        {tab==="favoris" ? (
          annonces.filter(a=>likes[a.id]).length > 0 ? (
            annonces.filter(a=>likes[a.id]).map(a=>(
              <MyAdItem key={a.id} a={a} tab="actives" boosted={boostedIds.includes(a.id)} onBoost={onBoost} onClick={()=>onDetail(a)}/>
            ))
          ) : (
            <div className="empty-state"><div className="emoji">❤️</div><h3>Aucun favori</h3><p>Ajoute des annonces à tes favoris pour les retrouver ici</p></div>
          )
        ) : list.map(a=>(
          <MyAdItem key={a.id} a={a} tab={tab} boosted={boostedIds.includes(a.id)} onBoost={onBoost} onClick={()=>onDetail(a)}/>
        ))}
      </div>
    </div>
  );
}
function MyAdItem({a,tab,boosted,onBoost,onClick}) {
  return (
    <div className="my-ad-item" onClick={onClick}>
      <div className="my-ad-img">{a.emoji}</div>
      <div className="my-ad-body">
        <div className="my-ad-title">{a.title}</div>
        <div className="my-ad-price">{a.price} FCFA</div>
        <div className="my-ad-stats">
          <span className="my-ad-stat"><Icon name="eye" size={10} color="var(--ink3)"/>{a.views}</span>
          <span className="my-ad-stat">❤️ {a.likes}</span>
          <span className="my-ad-stat">📍 {a.commune}</span>
        </div>
      </div>
      <div className="my-ad-actions">
        <span className={`my-ad-status ${tab==="vendus"?"sold":"active"}`}>{tab==="vendus"?"Vendu":"En ligne"}</span>
        {tab!=="vendus" && (
          <div className="my-ad-boost-btn" onClick={e=>{e.stopPropagation();onBoost(a);}}>
            {boosted?"👑 Boosté":"🚀 Booster"}
          </div>
        )}
      </div>
    </div>
  );
}

/* ── CAT GRID ── */
function CatGrid({activeCat,onSelect}) {
  const [expanded,setExpanded] = useState(false);
  const visible = expanded ? ALL_CATS : ALL_CATS.slice(0,10);
  return (
    <div className="cat-section">
      <div className="cat-pills">
        {CAT_PILLS.map(c=>(
          <div key={c} className={`cat-pill ${activeCat===c?"on":""}`} onClick={()=>onSelect(c)}>{c}</div>
        ))}
      </div>
      <div className="cat-grid">
        {visible.map(c=>{
          const isOn = activeCat===c.lbl;
          return (
            <div key={c.id} className={`cg-item ${isOn?"on":""}`} onClick={()=>onSelect(c.lbl)}>
              <div className="cg-ico" style={{background:c.bg}}>{c.ico}</div>
              <span className="cg-lbl">{c.lbl}</span>
            </div>
          );
        })}
      </div>
      <div className="show-more-cats" onClick={()=>setExpanded(e=>!e)}>
        <span>{expanded?"Voir moins":`Voir les ${ALL_CATS.length} catégories`}</span>
        <Icon name="down" size={14} color="var(--g2)" style={{transform:expanded?"rotate(180deg)":"none"}}/>
      </div>
    </div>
  );
}

/* ── OFFER MODAL ── */
function OfferModal({article,onClose,onSend}) {
  const [selected,setSelected] = useState(null);
  const [custom,setCustom] = useState("");
  const suggestions = [
    {pct:"-5%",  amt: Math.round(article.priceNum*0.95).toLocaleString()},
    {pct:"-10%", amt: Math.round(article.priceNum*0.90).toLocaleString()},
    {pct:"-15%", amt: Math.round(article.priceNum*0.85).toLocaleString()},
  ];
  const finalAmt = selected!==null ? suggestions[selected].amt.replace(/\s/g,"") : custom;
  const canSend = selected!==null || (custom && !isNaN(custom) && Number(custom)>0);
  return (
    <div className="overlay" onClick={onClose}>
      <div className="bottom-sheet" onClick={e=>e.stopPropagation()}>
        <div className="sheet-handle"/>
        <div style={{textAlign:"center",marginBottom:20}}>
          <div style={{fontSize:36,marginBottom:8}}>{article.emoji}</div>
          <div style={{fontFamily:"Syne,sans-serif",fontSize:20,fontWeight:800,color:"var(--ink)"}}>Proposer un prix</div>
          <div style={{fontSize:13,color:"var(--ink3)",marginTop:4}}>Prix actuel : <strong style={{color:"var(--g1)"}}>{article.price} FCFA</strong></div>
        </div>
        <div style={{fontSize:11,fontWeight:700,color:"var(--ink3)",textTransform:"uppercase",letterSpacing:".5px",marginBottom:10}}>Suggestions</div>
        <div className="offer-suggestions">
          {suggestions.map((s,i)=>(
            <div key={i} className={`offer-chip ${selected===i?"on":""}`} onClick={()=>{setSelected(i);setCustom("");}}>
              <div className="pct">{s.pct}</div>
              <div className="amt">{s.amt} F</div>
            </div>
          ))}
        </div>
        <div style={{fontSize:11,fontWeight:700,color:"var(--ink3)",textTransform:"uppercase",letterSpacing:".5px",marginBottom:8}}>Ou saisir un montant</div>
        <div className="offer-custom-row">
          <input className="offer-custom-input" placeholder="Ex: 30 000"
            value={custom} type="number"
            onChange={e=>{setCustom(e.target.value);setSelected(null);}}/>
          <span className="offer-fcfa">FCFA</span>
        </div>
        <button className="btn-primary" style={{marginBottom:10,padding:16,fontSize:15}}
          disabled={!canSend}
          onClick={()=>{if(canSend){onSend(finalAmt);onClose();}}}
          style={{opacity:canSend?1:.5,flex:"none",width:"100%",padding:16,borderRadius:"var(--radius-sm)",background:"linear-gradient(135deg,var(--g2),var(--g1))",color:"white",fontFamily:"DM Sans,sans-serif",fontWeight:700,fontSize:15,border:"none",cursor:canSend?"pointer":"not-allowed",marginBottom:10}}>
          💰 Envoyer l'offre {finalAmt?`· ${parseInt(finalAmt).toLocaleString()} FCFA`:""}
        </button>
        <button className="sheet-cancel" onClick={onClose}>Annuler</button>
      </div>
    </div>
  );
}

/* ── DASHBOARD STATS ── */
const CHART_DATA = [
  {day:"Lun",vues:24,msg:2},{day:"Mar",vues:38,msg:5},{day:"Mer",vues:31,msg:3},
  {day:"Jeu",vues:55,msg:8},{day:"Ven",vues:89,msg:14},{day:"Sam",vues:120,msg:19},{day:"Dim",vues:76,msg:11},
];
const PERF_ADS = [
  {id:1,emoji:"📱",title:"iPhone 12 Pro",price:"280 000",views:389,msgs:12,likes:54,conv:3.1},
  {id:2,emoji:"💻",title:"MacBook Air M1",price:"480 000",views:520,msgs:18,likes:88,conv:3.5},
  {id:3,emoji:"👟",title:"Nike Air Max 270",price:"35 000",views:142,msgs:7,likes:18,conv:4.9},
  {id:4,emoji:"👜",title:"Sac Louis Vuitton",price:"120 000",views:201,msgs:9,likes:37,conv:4.5},
];
function Dashboard({onBack,onBoost,onDetail}) {
  const [activeDay,setActiveDay] = useState(4);
  const maxVues = Math.max(...CHART_DATA.map(d=>d.vues));
  const totalVues = CHART_DATA.reduce((s,d)=>s+d.vues,0);
  const totalMsgs = CHART_DATA.reduce((s,d)=>s+d.msg,0);
  return (
    <div style={{animation:"slideUp .32s cubic-bezier(.22,1,.36,1) both",overflowY:"auto",height:"100%"}} className="screen">
      <div className="dash-header">
        <div className="dash-back" onClick={onBack}><Icon name="back" size={16} color="rgba(255,255,255,.75)"/>Retour</div>
        <div className="dash-title">📊 Statistiques</div>
        <div className="dash-sub">Cette semaine · 7 jours glissants</div>
      </div>

      <div className="dash-kpis">
        {[
          {label:"Vues totales",val:totalVues,delta:"+23%",up:true,icon:"👁"},
          {label:"Messages reçus",val:totalMsgs,delta:"+41%",up:true,icon:"💬"},
          {label:"Annonces actives",val:4,delta:"stable",up:true,icon:"📦"},
          {label:"Taux de réponse",val:"94%",delta:"+2%",up:true,icon:"⚡"},
        ].map((k,i)=>(
          <div key={i} className="kpi-card">
            <div className="kpi-label">{k.icon} {k.label}</div>
            <div className="kpi-val">{k.val}</div>
            <div className={`kpi-delta ${k.up?"up":"down"}`}>{k.delta} vs semaine dernière</div>
          </div>
        ))}
      </div>

      <div className="chart-card">
        <div className="chart-title">Vues par jour</div>
        <div className="chart-sub">Cliquez sur une barre pour les détails</div>
        <div className="chart-wrap">
          <div className="chart-bars">
            {CHART_DATA.map((d,i)=>(
              <div key={i} className="chart-bar-col" onClick={()=>setActiveDay(i)}>
                <div className={`chart-bar ${i===activeDay?"active":""}`}
                  style={{height:`${(d.vues/maxVues)*100}%`}}
                  data-val={`${d.vues} vues`}/>
                <span className="chart-lbl">{d.day}</span>
              </div>
            ))}
          </div>
        </div>
        {activeDay!==null && (
          <div style={{marginTop:12,padding:10,background:"var(--g5)",borderRadius:10,display:"flex",gap:16}}>
            <div style={{fontSize:12,fontWeight:600,color:"var(--ink2)"}}>📅 {CHART_DATA[activeDay].day}</div>
            <div style={{fontSize:12,fontWeight:600,color:"var(--g1)"}}>👁 {CHART_DATA[activeDay].vues} vues</div>
            <div style={{fontSize:12,fontWeight:600,color:"var(--ink2)"}}>💬 {CHART_DATA[activeDay].msg} messages</div>
          </div>
        )}
      </div>

      <div className="tips-card">
        <div className="tips-title">💡 Conseil de la semaine</div>
        <div className="tips-text">Tes annonces ont 3× plus de vues le vendredi soir entre 18h et 20h. Publie à ce moment pour maximiser ta visibilité.</div>
        <div className="tips-cta" onClick={()=>{}}>Programmer une publication</div>
      </div>

      <div className="dash-section">
        <div className="dash-section-title">Performance par annonce</div>
        {PERF_ADS.map(a=>(
          <div key={a.id} className="perf-row" onClick={()=>onDetail(annonces.find(x=>x.id===a.id))}>
            <div className="perf-em">{a.emoji}</div>
            <div className="perf-body">
              <div className="perf-title">{a.title}</div>
              <div className="perf-stats">
                <span className="perf-stat">👁 {a.views}</span>
                <span className="perf-stat">💬 {a.msgs}</span>
                <span className="perf-stat">❤️ {a.likes}</span>
              </div>
              <div className="perf-views-bar">
                <div className="perf-views-fill" style={{width:`${(a.views/maxVues*100).toFixed(0)}%`}}/>
              </div>
            </div>
            <div className="perf-right">
              <div className="perf-price">{a.price} F</div>
              <div style={{fontSize:10,color:"var(--g2)",fontWeight:700,marginTop:4}}>Conv. {a.conv}%</div>
              <div style={{fontSize:10,color:"var(--ink3)",marginTop:2,cursor:"pointer",textDecoration:"underline"}} onClick={e=>{e.stopPropagation();onBoost(annonces.find(x=>x.id===a.id));}}>Booster →</div>
            </div>
          </div>
        ))}
      </div>
      <div style={{height:16}}/>
    </div>
  );
}
const maxVues = Math.max(...CHART_DATA.map(d=>d.vues));

/* ── MAP SCREEN ── */
const COMMUNES_MAP = [
  {id:"cocody",    name:"Cocody",     x:310, y:120, w:110, h:90,  color:"#0d5c35", count:89,  annonces:[1,4]},
  {id:"plateau",   name:"Plateau",    x:200, y:145, w:70,  h:60,  color:"#1a8a52", count:34,  annonces:[2]},
  {id:"adjame",    name:"Adjamé",     x:140, y:100, w:80,  h:70,  color:"#22b96e", count:21,  annonces:[]},
  {id:"abobo",     name:"Abobo",      x:130, y:40,  w:120, h:80,  color:"#0d5c35", count:56,  annonces:[6]},
  {id:"yopougon",  name:"Yopougon",   x:20,  y:110, w:130, h:120, color:"#1a8a52", count:112, annonces:[5]},
  {id:"treichville",name:"Treichville",x:195,y:200, w:85,  h:65,  color:"#22b96e", count:28,  annonces:[]},
  {id:"marcory",   name:"Marcory",    x:240, y:230, w:90,  h:70,  color:"#0d5c35", count:43,  annonces:[3]},
  {id:"koumassi",  name:"Koumassi",   x:310, y:210, w:80,  h:80,  color:"#1a8a52", count:37,  annonces:[]},
  {id:"portbouet", name:"Port-Bouët", x:290, y:280, w:110, h:60,  color:"#22b96e", count:19,  annonces:[]},
];
function MapScreen({onBack,onDetail}) {
  const [selected,setSelected] = useState(null);
  const sel = selected ? COMMUNES_MAP.find(c=>c.id===selected) : null;
  const selannonces = sel ? annonces.filter(a=>sel.annonces.includes(a.id)) : [];
  return (
    <div style={{animation:"slideUp .32s cubic-bezier(.22,1,.36,1) both",display:"flex",flexDirection:"column",height:"100%"}}>
      <div className="map-header">
        <div className="back-btn" onClick={onBack}><Icon name="back" size={18} color="var(--ink)"/></div>
        <span style={{fontFamily:"Syne,sans-serif",fontWeight:800,fontSize:17,color:"var(--ink)",flex:1}}>Carte · Abidjan</span>
        <span style={{fontSize:12,color:"var(--ink3)"}}>{annonces.length} annonces</span>
      </div>
      <div style={{overflowY:"auto",flex:1}} className="screen">
        <div className="map-container">
          <svg className="map-svg" viewBox="0 0 430 360" xmlns="http://www.w3.org/2000/svg">
            <rect width="430" height="360" fill="#c8dfc8"/>
            <ellipse cx="280" cy="320" rx="120" ry="30" fill="#a8c8e8" opacity=".6"/>
            <text x="280" y="325" textAnchor="middle" fontSize="10" fill="#5a8aaa" fontWeight="700">Lagune Ébrié</text>
            {COMMUNES_MAP.map(c=>(
              <g key={c.id} className="map-zone" onClick={()=>setSelected(selected===c.id?null:c.id)}>
                <rect x={c.x} y={c.y} width={c.w} height={c.h} rx="12"
                  fill={selected===c.id?"var(--gold)":c.color}
                  opacity={selected&&selected!==c.id?.7:1}
                  stroke="white" strokeWidth="2"/>
                <text x={c.x+c.w/2} y={c.y+c.h/2-8} textAnchor="middle" className="map-label">{c.name}</text>
                <text x={c.x+c.w/2} y={c.y+c.h/2+10} textAnchor="middle" className="map-count">{c.count}</text>
                <text x={c.x+c.w/2} y={c.y+c.h/2+22} textAnchor="middle" fontSize="9" fill="rgba(255,255,255,.75)">annonces</text>
              </g>
            ))}
          </svg>
        </div>
        <div className="map-legend">
          <div className="legend-chip" style={{background:"var(--g5)",color:"var(--ink3)",border:"1px solid var(--g4)"}} onClick={()=>setSelected(null)}>Tout</div>
          {COMMUNES_MAP.sort((a,b)=>b.count-a.count).map(c=>(
            <div key={c.id} className="legend-chip"
              style={{background:selected===c.id?"var(--g1)":c.color+"22",color:selected===c.id?"white":c.color,border:`1.5px solid ${c.color}40`}}
              onClick={()=>setSelected(selected===c.id?null:c.id)}>
              {c.name} · {c.count}
            </div>
          ))}
        </div>
        <div className="map-annonces">
          <div className="map-annonces-title">
            {sel ? `📍 ${sel.name} — ${selannonces.length} annonce${selannonces.length>1?"s":""}` : `📍 Toutes les communes — ${annonces.length} annonces`}
          </div>
          <div className="cards-grid" style={{padding:0}}>
            {(selannonces.length>0?selannonces:annonces).map(a=>(
              <div key={a.id} className="article-card" onClick={()=>onDetail(a)}>
                <div className="card-img"><div className="card-img-inner">{a.photo ? <img src={a.photo} style={{width:'100%',height:'100%',objectFit:'cover'}} alt={a.title}/> : a.emoji}</div></div>
                <div className="card-body">
                  <div className="card-title">{a.title}</div>
                  <div className="card-price">{a.price} <span style={{fontSize:10,color:"var(--ink3)"}}>FCFA</span></div>
                  <div className="card-meta"><span className="card-loc">📍{a.commune}</span><span className="card-stats">👁{a.views}</span></div>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div style={{height:16}}/>
      </div>
    </div>
  );
}

/* ── AI RECOMMENDATIONS ── */
const INTERESTS = ["Mode","Électronique","Sport","Maison","Véhicules","Gaming","Photo","Musique"];
const AI_RECOS = [
  {id:1,emoji:"👟",name:"Nike Air Max 270",price:"35 000",match:97,reason:"Basé sur tes favoris Mode",comm:"Cocody",articleId:1},
  {id:2,emoji:"📱",name:"iPhone 12 Pro",price:"280 000",match:94,reason:"Très regardé cette semaine",comm:"Plateau",articleId:2},
  {id:3,emoji:"🎮",name:"PS5 + 2 manettes",price:"320 000",match:89,reason:"Gaming populaire près de toi",comm:"Cocody",articleId:7},
  {id:4,emoji:"💻",name:"MacBook Air M1",price:"480 000",match:86,reason:"Dans ton budget habituel",comm:"Yopougon",articleId:5},
  {id:5,emoji:"📷",name:"Canon EOS 250D",price:"180 000",match:82,reason:"Souvent consulté ensemble",comm:"Marcory",articleId:8},
  {id:6,emoji:"🏍️",name:"Moto Honda CBF",price:"650 000",match:78,reason:"Tendance cette semaine",comm:"Abobo",articleId:6},
];
function AIReco({onBack,onDetail,likes,onLike}) {
  const [activeInterests,setActiveInterests] = useState(["Mode","Électronique"]);
  const [thinking,setThinking] = useState(false);
  const toggleInt = i=>{
    setThinking(true);
    setActiveInterests(prev=>prev.includes(i)?prev.filter(x=>x!==i):[...prev,i]);
    setTimeout(()=>setThinking(false),1200);
  };
  const filtered = AI_RECOS.filter(r=>activeInterests.length===0||activeInterests.some(i=>r.reason.toLowerCase().includes(i.toLowerCase())||Math.random()>.3));
  return (
    <div style={{animation:"slideUp .32s cubic-bezier(.22,1,.36,1) both",display:"flex",flexDirection:"column",height:"100%"}}>
      <div className="reco-header">
        <div className="back-btn" onClick={onBack}><Icon name="back" size={18} color="var(--ink)"/></div>
        <span style={{fontFamily:"Syne,sans-serif",fontWeight:800,fontSize:17,color:"var(--ink)",flex:1}}>Pour toi</span>
        <span style={{fontSize:20}}>🤖</span>
      </div>
      <div style={{flex:1,overflowY:"auto"}} className="screen">
        <div className="reco-hero">
          <div className="reco-hero-title">Recommandé par l'IA</div>
          <div className="reco-hero-sub">Sélectionné pour toi en analysant tes habitudes, tes favoris et les tendances à Abidjan.</div>
        </div>
        <div className="reco-section">
          <div className="reco-section-title">🎯 Tes centres d'intérêt</div>
          <div className="reco-interest-row">
            {INTERESTS.map(i=>(
              <div key={i} className={`reco-tag ${activeInterests.includes(i)?"on":""}`} onClick={()=>toggleInt(i)}>{i}</div>
            ))}
          </div>
        </div>
        {thinking && (
          <div className="ai-thinking">
            <div className="ai-thinking-dot"/><div className="ai-thinking-dot"/><div className="ai-thinking-dot"/>
            <span style={{fontSize:13,color:"#7c3aed",fontWeight:600,marginLeft:4}}>L'IA analyse tes préférences...</span>
          </div>
        )}
        <div className="reco-section">
          <div className="reco-section-title">⭐ Sélection du jour</div>
          <div className="reco-cards">
            {AI_RECOS.slice(0,4).map(r=>(
              <div key={r.id} className="reco-card" onClick={()=>onDetail(annonces.find(a=>a.id===r.articleId))}>
                <div className="reco-img">
                  {r.emoji}
                  <span className="reco-match">{r.match}% match</span>
                </div>
                <div className="reco-body">
                  <div className="reco-name">{r.name}</div>
                  <div className="reco-price">{r.price} FCFA</div>
                  <div className="reco-reason">{r.reason}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="reco-section">
          <div className="reco-section-title">🔥 Tendances près de toi</div>
          <div className="cards-grid" style={{padding:0}}>
            {AI_RECOS.slice(2,6).map(r=>(
              <div key={r.id} className="article-card" onClick={()=>onDetail(annonces.find(a=>a.id===r.articleId))}>
                <div className="card-img">
                  <div className="card-img-inner">{r.emoji}</div>
                  <div style={{position:"absolute",top:7,left:7,background:"#7c3aed",color:"white",fontSize:9,fontWeight:800,padding:"2px 7px",borderRadius:50}}>IA {r.match}%</div>
                  <div className="heart-btn" onClick={e=>{e.stopPropagation();onLike(r.articleId);}}>
                    <Icon name={likes[r.articleId]?"heartFill":"heart"} size={14} color="var(--red)"/>
                  </div>
                </div>
                <div className="card-body">
                  <div className="card-title">{r.name}</div>
                  <div className="card-price">{r.price} <span style={{fontSize:10,color:"var(--ink3)"}}>F</span></div>
                  <div className="card-meta"><span className="card-loc">📍{r.comm}</span></div>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div style={{height:16}}/>
      </div>
    </div>
  );
}

/* ── HISTORY SCREEN ── */
const TRANSACTIONS = [
  {id:1,type:"achat",emoji:"📱",title:"iPhone 12 Pro",amount:"280 000",date:"Aujourd'hui, 14h32",method:"wave",status:"done",other:"Konan M."},
  {id:2,type:"vente",emoji:"👟",title:"Nike Air Max 270",amount:"35 000",date:"Hier, 09h15",method:"cash",status:"done",other:"Adjoua K."},
  {id:3,type:"achat",emoji:"🎮",title:"PS5 + 2 manettes",amount:"320 000",date:"Il y a 3 jours",method:"om",status:"pending",other:"Frank K."},
  {id:4,type:"vente",emoji:"👜",title:"Sac Louis Vuitton",amount:"120 000",date:"Il y a 5 jours",method:"wave",status:"done",other:"Marie T."},
  {id:5,type:"achat",emoji:"💻",title:"MacBook Air M1",amount:"480 000",date:"Il y a 1 sem",method:"wave",status:"cancel",other:"Eric D."},
  {id:6,type:"vente",emoji:"🛋️",title:"Canapé 3 places",amount:"85 000",date:"Il y a 2 sem",method:"cash",status:"done",other:"Bamba S."},
];
const METHOD_LABELS = {wave:"🌊 Wave",om:"🟠 Orange Money",cash:"💵 Cash"};
const STATUS_LABELS = {done:"Confirmé",pending:"En attente",cancel:"Annulé"};
function History({onBack}) {
  const [tab,setTab] = useState("tout");
  const list = tab==="tout"?TRANSACTIONS:TRANSACTIONS.filter(t=>t.type===tab.replace("s",""));
  const totalIn = TRANSACTIONS.filter(t=>t.type==="vente"&&t.status==="done").reduce((s,t)=>s+parseInt(t.amount.replace(/\s/g,"")),0);
  const totalOut = TRANSACTIONS.filter(t=>t.type==="achat"&&t.status==="done").reduce((s,t)=>s+parseInt(t.amount.replace(/\s/g,"")),0);
  return (
    <div style={{animation:"slideUp .32s cubic-bezier(.22,1,.36,1) both",display:"flex",flexDirection:"column",height:"100%"}}>
      <div className="hist-header">
        <div className="back-btn" onClick={onBack}><Icon name="back" size={18} color="var(--ink)"/></div>
        <span style={{fontFamily:"Syne,sans-serif",fontWeight:800,fontSize:18,color:"var(--ink)"}}>Historique</span>
      </div>
      <div style={{flex:1,overflowY:"auto"}} className="screen">
        <div className="hist-summary">
          <div className="hist-sum-item"><span className="hist-sum-val" style={{color:"var(--g1)"}}>+{totalIn.toLocaleString()}</span><span className="hist-sum-lbl">Revenus FCFA</span></div>
          <div className="hist-sum-item"><span className="hist-sum-val" style={{color:"var(--red)"}}>{totalOut.toLocaleString()}</span><span className="hist-sum-lbl">Dépenses FCFA</span></div>
          <div className="hist-sum-item"><span className="hist-sum-val">{TRANSACTIONS.filter(t=>t.status==="done").length}</span><span className="hist-sum-lbl">Transactions</span></div>
        </div>
        <div className="hist-tabs">
          {["tout","achats","ventes"].map(t=>(
            <div key={t} className={`hist-tab ${tab===t?"active":""}`} onClick={()=>setTab(t)}>
              {t==="tout"?"Tout":t==="achats"?"🛍️ Achats":"📦 Ventes"}
            </div>
          ))}
        </div>
        <div style={{marginTop:12}}>
          {list.map(t=>(
            <div key={t.id} className="hist-item">
              <div className="hist-top">
                <div className="hist-em">{t.emoji}</div>
                <div className="hist-info">
                  <div className="hist-title">{t.title}</div>
                  <div className="hist-date">{t.date}</div>
                </div>
                <div className={`hist-amount ${t.type==="achat"?"out":"in"}`}>
                  {t.type==="achat"?"-":"+"}  {t.amount} F
                </div>
              </div>
              <div className="hist-row">
                <span className="hist-method">{METHOD_LABELS[t.method]} · {t.type==="achat"?"Acheté à":"Vendu à"} {t.other}</span>
                <span className={`hist-status ${t.status}`}>{STATUS_LABELS[t.status]}</span>
              </div>
            </div>
          ))}
        </div>
        <div style={{height:16}}/>
      </div>
    </div>
  );
}

/* ── SETTINGS SCREEN ── */
function Settings({onBack,darkMode,setDarkMode,notifs,setNotifs,showPremium}) {
  const [sounds, setSounds] = useState(true);
  const [location, setLocation] = useState(true);
  const [biometric, setBiometric] = useState(false);
  const [lang, setLang] = useState("Français");
  return (
    <div style={{animation:"slideUp .32s cubic-bezier(.22,1,.36,1) both",display:"flex",flexDirection:"column",height:"100%"}}>
      <div className="settings-header">
        <div className="back-btn" onClick={onBack}><Icon name="back" size={18} color="var(--ink)"/></div>
        <span style={{fontFamily:"Syne,sans-serif",fontWeight:800,fontSize:18,color:"var(--ink)"}}>Paramètres</span>
      </div>
      <div style={{flex:1,overflowY:"auto"}} className="screen">

        {/* Compte */}
        <div className="settings-section">
          <div className="settings-section-title">Mon compte</div>
          <div className="settings-card">
            <div style={{padding:"16px",display:"flex",alignItems:"center",gap:14}}>
              <div style={{width:56,height:56,borderRadius:"50%",background:"linear-gradient(135deg,var(--g2),var(--g1))",display:"flex",alignItems:"center",justifyContent:"center",fontSize:24,color:"white",fontWeight:700}}>👤</div>
              <div style={{flex:1}}>
                <div style={{fontSize:16,fontWeight:700,color:"var(--ink)"}}>Mon Profil</div>
                <div style={{fontSize:12,color:"var(--ink3)"}}>@bradeo_user · +225 07 98 90 78</div>
                <div style={{fontSize:11,color:"var(--g2)",fontWeight:700,marginTop:3,cursor:"pointer"}}>Modifier le profil →</div>
              </div>
              <div style={{padding:"5px 12px",background:"var(--g5)",borderRadius:50,fontSize:11,fontWeight:700,color:"var(--g1)",border:"1px solid var(--g4)"}}>✅ Vérifié</div>
            </div>
          </div>
        </div>

        {/* Apparence */}
        <div className="settings-section">
          <div className="settings-section-title">Apparence</div>
          <div className="settings-card">
            {[
              {ico:"🌙",bg:"#EEF0FF",label:"Mode sombre",val:darkMode?"Activé":"Désactivé",toggle:true,state:darkMode,setState:setDarkMode},
              {ico:"🌐",bg:"var(--g5)",label:"Langue",val:lang,toggle:false,action:()=>setLang(l=>l==="Français"?"English":"Français")},
            ].map((s,i)=>(
              <div key={i} className="settings-item" onClick={s.toggle?()=>s.setState(v=>!v):s.action}>
                <div className="settings-ico" style={{background:s.bg}}>{s.ico}</div>
                <span className="settings-label">{s.label}</span>
                {s.toggle ? <div className={`settings-toggle ${s.state?"on":"off"}`}/> : <span className="settings-val">{s.val}</span>}
              </div>
            ))}
          </div>
        </div>

        {/* Notifications */}
        <div className="settings-section">
          <div className="settings-section-title">Notifications</div>
          <div className="settings-card">
            {[
              {ico:"💬",bg:"#E8F5E9",label:"Messages",state:notifs.messages,key:"messages"},
              {ico:"👁",bg:"#E3F2FD",label:"Vues et favoris",state:notifs.views,key:"views"},
              {ico:"💰",bg:"#FFF8E1",label:"Offres de prix",state:notifs.offers,key:"offers"},
              {ico:"👑",bg:"#FFF4E0",label:"Boosts et promotions",state:notifs.boosts,key:"boosts"},
              {ico:"🔊",bg:"var(--g5)",label:"Sons",state:sounds,action:()=>setSounds(v=>!v)},
            ].map((s,i)=>(
              <div key={i} className="settings-item" onClick={s.key?()=>setNotifs(n=>({...n,[s.key]:!n[s.key]})):s.action}>
                <div className="settings-ico" style={{background:s.bg}}>{s.ico}</div>
                <span className="settings-label">{s.label}</span>
                <div className={`settings-toggle ${(s.key?s.state:sounds)?"on":"off"}`}/>
              </div>
            ))}
          </div>
        </div>

        {/* Confidentialité */}
        <div className="settings-section">
          <div className="settings-section-title">Confidentialité & Sécurité</div>
          <div className="settings-card">
            {[
              {ico:"📍",bg:"#FFF0F5",label:"Partager ma localisation",state:location,action:()=>setLocation(v=>!v),toggle:true},
              {ico:"🔐",bg:"var(--g5)",label:"Connexion biométrique",state:biometric,action:()=>setBiometric(v=>!v),toggle:true},
              {ico:"🔒",bg:"var(--g5)",label:"Compte privé",state:false,action:()=>{},toggle:false,val:"Public"},
              {ico:"🗑",bg:"#FDF0EF",label:"Supprimer mon compte",toggle:false,val:"",style:{color:"var(--red)"},action:()=>{}},
            ].map((s,i)=>(
              <div key={i} className="settings-item" onClick={s.action}>
                <div className="settings-ico" style={{background:s.bg}}>{s.ico}</div>
                <span className="settings-label" style={s.style}>{s.label}</span>
                {s.toggle ? <div className={`settings-toggle ${s.state?"on":"off"}`}/> : s.val?<span className="settings-val">{s.val}</span>:<Icon name="chevron" size={18} color="var(--ink4)"/>}
              </div>
            ))}
          </div>
        </div>

        {/* Premium */}
        <div className="settings-section">
          <div className="settings-section-title">Abonnement</div>
          <div className="settings-card">
            <div className="settings-item" onClick={showPremium}>
              <div className="settings-ico" style={{background:"linear-gradient(135deg,#f5f0ff,#ede8ff)"}}>👑</div>
              <div style={{flex:1}}>
                <div className="settings-label">BRADEO Premium</div>
                <div style={{fontSize:12,color:"#7c3aed",fontWeight:600}}>Boost 10x · Stats avancées · Badge Premium</div>
              </div>
              <div style={{padding:"5px 12px",background:"linear-gradient(135deg,#7c3aed,#4a1580)",borderRadius:50,fontSize:11,fontWeight:700,color:"white"}}>Voir →</div>
            </div>
          </div>
        </div>

        {/* App */}
        <div className="settings-section">
          <div className="settings-section-title">Application</div>
          <div className="settings-card">
            {[
              {ico:"⭐",bg:"var(--g5)",label:"Noter l'app",val:"App Store →"},
              {ico:"📤",bg:"var(--g5)",label:"Partager BRADEO",val:""},
              {ico:"📋",bg:"var(--g5)",label:"Conditions d'utilisation",val:""},
              {ico:"🛡",bg:"var(--g5)",label:"Politique de confidentialité",val:""},
              {ico:"ℹ️",bg:"var(--g5)",label:"Version",val:"2.0.0"},
            ].map((s,i)=>(
              <div key={i} className="settings-item" onClick={()=>{}}>
                <div className="settings-ico" style={{background:s.bg}}>{s.ico}</div>
                <span className="settings-label">{s.label}</span>
                {s.val?<span className="settings-val">{s.val}</span>:<Icon name="chevron" size={18} color="var(--ink4)"/>}
              </div>
            ))}
          </div>
        </div>
        <div style={{height:16}}/>
      </div>
    </div>
  );
}

/* ── REPORT MODAL ── */
const REPORT_REASONS = [
  {ico:"🚫",text:"Article inexistant ou indisponible"},
  {ico:"💸",text:"Prix frauduleux ou arnaque"},
  {ico:"🔞",text:"Contenu inapproprié ou choquant"},
  {ico:"📋",text:"Article interdit (armes, drogues, etc.)"},
  {ico:"🤖",text:"Faux compte ou spam"},
  {ico:"©️",text:"Violation de droits d'auteur"},
  {ico:"💬",text:"Comportement abusif du vendeur"},
];
function ReportModal({item,onClose,onSubmit}) {
  const [selected,setSelected] = useState(null);
  const [detail,setDetail] = useState("");
  const label = item?.title || item?.seller || "cet élément";
  return (
    <div className="overlay" onClick={onClose}>
      <div className="bottom-sheet filter-modal" onClick={e=>e.stopPropagation()}>
        <div className="sheet-handle"/>
        <div style={{marginBottom:16}}>
          <div style={{fontFamily:"Syne,sans-serif",fontSize:20,fontWeight:800,color:"var(--ink)",marginBottom:4}}>Signaler</div>
          <div style={{fontSize:13,color:"var(--ink3)"}}>Pourquoi tu signales <strong>{label}</strong> ?</div>
        </div>
        <div className="report-reasons">
          {REPORT_REASONS.map((r,i)=>(
            <div key={i} className={`report-reason ${selected===i?"on":""}`} onClick={()=>setSelected(i)}>
              <span className="report-reason-ico">{r.ico}</span>
              <span className="report-reason-text">{r.text}</span>
              <div className="report-radio">{selected===i&&<div style={{width:7,height:7,borderRadius:"50%",background:"white"}}/>}</div>
            </div>
          ))}
        </div>
        {selected!==null && (
          <textarea style={{width:"100%",padding:"12px 14px",borderRadius:12,border:"1.5px solid var(--g4)",background:"var(--g5)",fontFamily:"DM Sans,sans-serif",fontSize:13,color:"var(--ink)",outline:"none",resize:"none",marginBottom:14,lineHeight:1.5}} rows={2} placeholder="Détails supplémentaires (optionnel)..." value={detail} onChange={e=>setDetail(e.target.value)}/>
        )}
        <button className="report-cta" disabled={selected===null} onClick={()=>{onSubmit();onClose();}}>
          🚩 Envoyer le signalement
        </button>
        <button className="sheet-cancel" onClick={onClose}>Annuler</button>
      </div>
    </div>
  );
}

/* ── PREMIUM SCREEN ── */
const PREMIUM_PERKS = [
  {ico:"🚀",title:"Boost automatique",desc:"Tes annonces apparaissent en tête des résultats pendant 7 jours par mois."},
  {ico:"👑",title:"Badge Premium",desc:"Un badge visible sur toutes tes annonces et ton profil. Inspire confiance."},
  {ico:"📊",title:"Statistiques avancées",desc:"Suivi quotidien : vues, taux de conversion, meilleur moment pour publier."},
  {ico:"💨",title:"Publication prioritaire",desc:"Tes nouvelles annonces sont indexées instantanément et mises en avant."},
  {ico:"🔔",title:"Alertes acheteurs",desc:"Tes followers reçoivent une notification quand tu publies une nouvelle annonce."},
  {ico:"🤝",title:"Support prioritaire",desc:"Accès direct à l'équipe BRADEO via chat — réponse en moins de 2h."},
];
const PREMIUM_PLANS_DATA = [
  {id:"monthly",period:"Mensuel",price:"3 000",sub:"/mois",save:""},
  {id:"quarterly",period:"Trimestriel",price:"7 500",sub:"/3 mois",save:"Économise 1 500 F",popular:true},
  {id:"yearly",period:"Annuel",price:"25 000",sub:"/an",save:"Économise 11 000 F"},
];
function PremiumScreen({onBack,showToast}) {
  const [plan,setPlan] = useState("quarterly");
  const [done,setDone] = useState(false);
  if(done) return (
    <div style={{display:"flex",flexDirection:"column",height:"100%",alignItems:"center",justifyContent:"center",padding:32,textAlign:"center",background:"var(--white)"}}>
      <div style={{width:96,height:96,borderRadius:"50%",background:"linear-gradient(135deg,#7c3aed,#4a1580)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:44,marginBottom:20,boxShadow:"0 12px 40px rgba(124,58,237,.4)",animation:"checkPop .5s cubic-bezier(.34,1.56,.64,1) both"}}>👑</div>
      <div style={{fontFamily:"Syne,sans-serif",fontSize:26,fontWeight:800,color:"var(--ink)",marginBottom:8}}>Bienvenue dans Premium !</div>
      <div style={{fontSize:14,color:"var(--ink3)",lineHeight:1.6,maxWidth:260,marginBottom:32}}>Ton compte est maintenant Premium. Toutes les fonctionnalités sont débloquées.</div>
      <button style={{width:"100%",padding:16,borderRadius:14,background:"linear-gradient(135deg,#7c3aed,#4a1580)",color:"white",fontFamily:"DM Sans,sans-serif",fontWeight:700,fontSize:15,border:"none",cursor:"pointer"}} onClick={onBack}>
        Découvrir mes avantages →
      </button>
    </div>
  );
  return (
    <div style={{animation:"slideUp .32s cubic-bezier(.22,1,.36,1) both",display:"flex",flexDirection:"column",height:"100%"}}>
      <div style={{flex:1,overflowY:"auto"}} className="screen">
        <div className="premium-hero">
          <div style={{display:"flex",justifyContent:"flex-start",marginBottom:16}}>
            <div className="back-btn" style={{background:"rgba(255,255,255,.15)"}} onClick={onBack}><Icon name="back" size={18} color="white"/></div>
          </div>
          <div className="premium-badge">✨ BRADEO PREMIUM</div>
          <div className="premium-title">Vends 10× plus vite</div>
          <div className="premium-sub">Rejoins les vendeurs Premium qui génèrent 3× plus de ventes chaque semaine à Abidjan.</div>
        </div>

        <div className="premium-plans">
          {PREMIUM_PLANS_DATA.map(p=>(
            <div key={p.id} className={`premium-plan ${plan===p.id?"selected":""} ${p.popular?"popular":""}`} onClick={()=>setPlan(p.id)}>
              {p.popular && <div className="popular-badge">⭐ Populaire</div>}
              <div className="plan-period">{p.period}</div>
              <div className="plan-price">{p.price} F<span style={{fontSize:11,fontWeight:400,color:"var(--ink3)"}}>{p.sub}</span></div>
              {p.save && <div className="plan-save">{p.save}</div>}
            </div>
          ))}
        </div>

        <div className="premium-perks">
          <div style={{fontSize:12,fontWeight:700,color:"var(--ink3)",textTransform:"uppercase",letterSpacing:".8px",marginBottom:12}}>Ce qui est inclus</div>
          {PREMIUM_PERKS.map((p,i)=>(
            <div key={i} className="perk-item">
              <div className="perk-ico">{p.ico}</div>
              <div><div className="perk-title">{p.title}</div><div className="perk-desc">{p.desc}</div></div>
            </div>
          ))}
        </div>

        <button className="premium-cta" onClick={()=>{setDone(true);showToast("👑 Premium activé !","gold");}}>
          👑 Activer Premium · {PREMIUM_PLANS_DATA.find(p=>p.id===plan)?.price} F
        </button>
        <div className="premium-cancel" onClick={onBack}>Pas maintenant</div>
        <div style={{textAlign:"center",fontSize:11,color:"var(--ink4)",padding:"0 24px 24px",lineHeight:1.5}}>Paiement sécurisé via Wave ou Orange Money. Annulable à tout moment.</div>
      </div>
    </div>
  );
}

/* ── SUPPORT CHAT ── */
const BOT_RESPONSES = {
  "publier":"Pour publier une annonce, appuie sur le bouton **+** en bas au centre. Tu peux ajouter jusqu'à 5 photos, un titre, un prix et ta commune. En moins de 30 secondes, c'est en ligne ! 🚀",
  "paiement":"BRADEO supporte Wave 🌊, Orange Money 🟠 et le paiement cash en main 💵. Pour payer, ouvre une annonce et appuie sur 'Acheter maintenant'.",
  "boost":"Le boost met ton annonce en tête des résultats. Starter (500F / 3j), Pro (1000F / 7j), Premium (2500F / 14j). Tu peux booster depuis la page de ton annonce !",
  "arnaque":"Si tu penses être victime d'une arnaque, signale l'annonce via le bouton ⚠️ et contacte-nous ici. Ne transfère jamais d'argent avant de voir l'article.",
  "livraison":"Certains vendeurs proposent la livraison à Abidjan. Vérifie le tag 🛵 sur les annonces. Le prix de livraison est indiqué sur la page de l'article.",
  "default":"Je suis là pour t'aider ! Tu peux me poser des questions sur la publication, les paiements, la livraison, les signalements ou ton compte. 😊",
};
const QUICK_REPLIES = ["Comment publier ?","Modes de paiement","Signaler une arnaque","Comment booster ?","Livraison disponible ?"];
function SupportChat({onBack}) {
  const [messages,setMessages] = useState([
    {id:1,type:"bot",text:"Bonjour 👋 Je suis l'assistant BRADEO. Comment puis-je t'aider aujourd'hui ?",time:"maintenant",quick:QUICK_REPLIES}
  ]);
  const [input,setInput] = useState("");
  const [typing,setTyping] = useState(false);
  const bottomRef = useRef(null);

  const getBotReply = (text) => {
    const t = text.toLowerCase();
    if(t.includes("publi")||t.includes("vendre")||t.includes("annonce")) return BOT_RESPONSES.publier;
    if(t.includes("paie")||t.includes("wave")||t.includes("orange")||t.includes("cash")) return BOT_RESPONSES.paiement;
    if(t.includes("boost")||t.includes("visib")) return BOT_RESPONSES.boost;
    if(t.includes("arnaq")||t.includes("fraude")||t.includes("signal")) return BOT_RESPONSES.arnaque;
    if(t.includes("livrai")) return BOT_RESPONSES.livraison;
    return BOT_RESPONSES.default;
  };

  const sendMsg = (text) => {
    if(!text.trim()) return;
    const userMsg = {id:Date.now(),type:"user",text:text.trim(),time:"maintenant"};
    setMessages(m=>[...m,userMsg]);
    setInput("");
    setTyping(true);
    setTimeout(()=>{
      setTyping(false);
      const reply = getBotReply(text);
      const hasFollowup = Math.random()>.5;
      setMessages(m=>[...m,{
        id:Date.now()+1,type:"bot",text:reply,time:"maintenant",
        quick:hasFollowup?QUICK_REPLIES.filter(q=>q!==text).slice(0,3):undefined
      }]);
    },1400+Math.random()*600);
  };

  useEffect(()=>{bottomRef.current?.scrollIntoView({behavior:"smooth"})},[messages,typing]);

  return (
    <div style={{animation:"slideUp .32s cubic-bezier(.22,1,.36,1) both",display:"flex",flexDirection:"column",height:"100%"}}>
      <div className="support-header">
        <div className="back-btn" style={{background:"rgba(255,255,255,.15)"}} onClick={onBack}><Icon name="back" size={18} color="white"/></div>
        <div className="support-bot-avatar">🤖</div>
        <div style={{flex:1}}>
          <div style={{fontFamily:"Syne,sans-serif",fontSize:16,fontWeight:800,color:"white"}}>Support BRADEO</div>
          <div className="support-online">En ligne — Répond en quelques secondes</div>
        </div>
      </div>
      <div style={{flex:1,overflowY:"auto"}} className="screen">
        <div className="support-messages">
          {messages.map(m=>(
            <div key={m.id} style={{display:"flex",flexDirection:"column",alignItems:m.type==="bot"?"flex-start":"flex-end",gap:6}}>
              <div className={`support-bubble ${m.type}`} dangerouslySetInnerHTML={{__html:m.text.replace(/\*\*(.*?)\*\*/g,"<strong>$1</strong>")}}/>
              {m.quick && (
                <div style={{display:"flex",gap:6,flexWrap:"wrap",maxWidth:"90%"}}>
                  {m.quick.map((q,i)=>(
                    <div key={i} className="support-quick-btn" onClick={()=>sendMsg(q)}>{q}</div>
                  ))}
                </div>
              )}
            </div>
          ))}
          {typing && (
            <div style={{display:"flex",alignItems:"center",gap:4,padding:"12px 15px",background:"var(--white)",borderRadius:18,borderBottomLeftRadius:4,alignSelf:"flex-start",boxShadow:"0 2px 8px rgba(0,0,0,.07)"}}>
              <div className="typing-dot"/><div className="typing-dot"/><div className="typing-dot"/>
            </div>
          )}
          <div ref={bottomRef}/>
        </div>
      </div>
      <div style={{padding:"12px 16px",background:"rgba(255,255,255,.97)",backdropFilter:"blur(20px)",display:"flex",gap:10,alignItems:"center",borderTop:"1px solid rgba(13,92,53,.06)"}}>
        <input className="chat-input" placeholder="Pose ta question..." value={input}
          onChange={e=>setInput(e.target.value)} onKeyDown={e=>e.key==="Enter"&&sendMsg(input)}/>
        <button className="chat-send-btn" onClick={()=>sendMsg(input)}><Icon name="send" size={18}/></button>
      </div>
    </div>
  );
}

/* ── PAYMENT SCREEN ── */
function PaymentScreen({article,onBack,onSuccess}) {
  const [method,setMethod] = useState("wave");
  const [phone,setPhone] = useState("");
  const [step,setStep] = useState("choose"); // choose | confirm | success
  const fees = method==="cash"?0:Math.round(article.priceNum*0.02);
  const total = article.priceNum + fees;
  const methods = [
    {id:"wave",  logo:"🌊", name:"Wave",         desc:"Paiement instantané · Gratuit",       color:"#1B7FE0"},
    {id:"om",    logo:"🟠", name:"Orange Money",  desc:"Paiement sécurisé · Commission 2%",   color:"#FF6B00"},
    {id:"cash",  logo:"💵", name:"Cash en main",  desc:"Paiement à la livraison · Gratuit",    color:"var(--g1)"},
  ];
  if(step==="success") return (
    <div style={{display:"flex",flexDirection:"column",height:"100%",background:"var(--white)"}}>
      <div className="pay-header">
        <div className="back-btn" onClick={onBack}><Icon name="back" size={18} color="var(--ink)"/></div>
        <span style={{fontFamily:"Syne,sans-serif",fontWeight:800,fontSize:17,color:"var(--ink)"}}>Paiement</span>
      </div>
      <div className="pay-success">
        <div className="pay-success-circle">✅</div>
        <div style={{fontFamily:"Syne,sans-serif",fontSize:24,fontWeight:800,color:"var(--ink)"}}>Paiement confirmé !</div>
        <div style={{fontSize:14,color:"var(--ink3)",lineHeight:1.6,maxWidth:260}}>
          {method==="cash"?"Le vendeur a été notifié. Convenez d'un lieu de rencontre via le chat.":"Ton paiement de "+total.toLocaleString()+" FCFA a été envoyé avec succès."}
        </div>
        <div style={{background:"var(--g5)",borderRadius:16,padding:16,width:"100%",textAlign:"center"}}>
          <div style={{fontSize:32,marginBottom:8}}>{article.emoji}</div>
          <div style={{fontSize:14,fontWeight:700,color:"var(--ink)"}}>{article.title}</div>
          <div style={{fontFamily:"Syne,sans-serif",fontSize:20,fontWeight:800,color:"var(--g1)",marginTop:4}}>{total.toLocaleString()} FCFA</div>
        </div>
        <button style={{width:"100%",padding:16,borderRadius:14,background:"linear-gradient(135deg,var(--g2),var(--g1))",color:"white",fontFamily:"DM Sans,sans-serif",fontWeight:700,fontSize:15,border:"none",cursor:"pointer"}} onClick={onSuccess}>
          💬 Contacter le vendeur
        </button>
        <span style={{fontSize:13,color:"var(--ink3)",cursor:"pointer"}} onClick={onBack}>Retour aux annonces</span>
      </div>
    </div>
  );
  return (
    <div style={{display:"flex",flexDirection:"column",height:"100%",background:"var(--g5)",overflowY:"auto"}} className="screen">
      <div className="pay-header" style={{background:"var(--white)"}}>
        <div className="back-btn" onClick={onBack}><Icon name="back" size={18} color="var(--ink)"/></div>
        <span style={{fontFamily:"Syne,sans-serif",fontWeight:800,fontSize:17,color:"var(--ink)",flex:1}}>Paiement</span>
        <span style={{fontSize:12,color:"var(--ink3)"}}>Sécurisé 🔒</span>
      </div>
      <div className="pay-hero">
        <span className="pay-hero-em">{article.emoji}</span>
        <div>
          <div className="pay-hero-name">{article.title}</div>
          <div className="pay-hero-price">{article.price} FCFA</div>
          <div className="pay-hero-comm">📍 {article.commune} · {article.seller}</div>
        </div>
      </div>
      <div className="pay-section" style={{marginTop:16}}>
        <div className="pay-section-title">Mode de paiement</div>
        {methods.map(m=>(
          <div key={m.id} className={`pay-method ${method===m.id?"selected":""}`} onClick={()=>setMethod(m.id)}>
            <div className="pay-method-logo" style={{background:m.id==="wave"?"#E8F0FE":m.id==="om"?"#FFF0E6":"var(--g5)"}}>{m.logo}</div>
            <div><div className="pay-method-name">{m.name}</div><div className="pay-method-desc">{m.desc}</div></div>
            <div className="pay-radio">{method===m.id&&<div className="pay-radio-dot"/>}</div>
          </div>
        ))}
      </div>
      {method!=="cash" && (
        <div className="pay-section">
          <div className="pay-section-title">Numéro {method==="wave"?"Wave":"Orange Money"}</div>
          <div className="pay-number-wrap">
            <span className="pay-number-flag">{method==="wave"?"🌊":"🟠"}</span>
            <span style={{fontSize:15,fontWeight:700,color:"var(--ink2)",marginRight:6}}>+225</span>
            <input type="tel" placeholder="07 00 00 00 00" value={phone} onChange={e=>setPhone(e.target.value.replace(/\D/g,"").slice(0,10))}/>
          </div>
        </div>
      )}
      <div className="pay-section">
        <div className="pay-section-title">Récapitulatif</div>
        <div className="pay-summary">
          <div className="pay-row"><span className="pay-row-label">Article</span><span className="pay-row-val">{article.price} FCFA</span></div>
          {article.livraison && <div className="pay-row"><span className="pay-row-label">🛵 Livraison</span><span className="pay-row-val">{article.livraisonPrice} FCFA</span></div>}
          {fees>0 && <div className="pay-row"><span className="pay-row-label">Frais de service</span><span className="pay-row-val">{fees.toLocaleString()} FCFA</span></div>}
          <div className="pay-row total"><span className="pay-row-label">Total</span><span className="pay-row-val">{total.toLocaleString()} FCFA</span></div>
        </div>
        <button className={`pay-btn ${method}`} onClick={()=>setStep("success")}>
          {method==="wave"?"🌊 Payer avec Wave":method==="om"?"🟠 Payer avec Orange Money":"💵 Confirmer · Payer en main"} · {total.toLocaleString()} F
        </button>
      </div>
      <div style={{height:20}}/>
    </div>
  );
}

/* ── SELLER PROFILE ── */
const SELLER_REVIEWS = [
  {id:1,name:"Kofi M.",emoji:"👨🏾",stars:5,text:"Vendeur sérieux, article exactement comme décrit. Je recommande !",date:"Il y a 2j"},
  {id:2,name:"Aïcha D.",emoji:"👩🏾",stars:5,text:"Livraison rapide et produit en parfait état. Merci !",date:"Il y a 5j"},
  {id:3,name:"Serge T.",emoji:"🧑🏾",stars:4,text:"Bon vendeur, petite négociation possible. Satisfait.",date:"Il y a 1 sem"},
  {id:4,name:"Fatou B.",emoji:"👩🏾‍💼",stars:5,text:"Top ! Réactif et honnête. Je reviendrai.",date:"Il y a 2 sem"},
];
function SellerProfile({seller,annonces,onBack,onArticle,onContact}) {
  const avgScore = SELLER_REVIEWS.reduce((s,r)=>s+r.stars,0)/SELLER_REVIEWS.length;
  return (
    <div style={{animation:"slideUp .32s cubic-bezier(.22,1,.36,1) both"}}>
      <div className="seller-profile-hero">
        <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between"}}>
          <div className="back-btn" style={{background:"rgba(255,255,255,.15)"}} onClick={onBack}><Icon name="back" size={18} color="white"/></div>
          <button style={{padding:"8px 16px",borderRadius:50,background:"rgba(255,255,255,.15)",color:"white",border:"1px solid rgba(255,255,255,.25)",fontSize:13,fontWeight:700,cursor:"pointer"}} onClick={onContact}>💬 Contacter</button>
        </div>
        <div style={{marginTop:16}}>
          <div className="sp-avatar">{seller.sellerInitial}</div>
          <div className="sp-name">{seller.seller}</div>
          <div className="sp-handle">@bradeo_vendeur · Abidjan</div>
          <div className="sp-badges">
            <span className="sp-badge">✅ Vendeur vérifié</span>
            <span className="sp-badge">🛵 Livraison</span>
            <span className="sp-badge">⚡ Répond vite</span>
          </div>
        </div>
        <div className="sp-stats">
          <div className="sp-stat"><span className="sp-stat-val">{seller.sellerSales}</span><span className="sp-stat-lbl">Ventes</span></div>
          <div className="sp-stat"><span className="sp-stat-val">{avgScore.toFixed(1)}★</span><span className="sp-stat-lbl">Note</span></div>
          <div className="sp-stat"><span className="sp-stat-val">{annonces.length}</span><span className="sp-stat-lbl">Annonces</span></div>
          <div className="sp-stat"><span className="sp-stat-val">2023</span><span className="sp-stat-lbl">Membre</span></div>
        </div>
      </div>
      <div className="sp-body">
        <div className="sp-section-title">Annonces actives</div>
        <div className="cards-grid" style={{padding:0,marginBottom:24}}>
          {annonces.map(a=>(
            <div key={a.id} className="article-card" onClick={()=>onArticle(a)}>
              <div className="card-img"><div className="card-img-inner">{a.photo ? <img src={a.photo} style={{width:'100%',height:'100%',objectFit:'cover'}} alt={a.title}/> : a.emoji}</div></div>
              <div className="card-body">
                <div className="card-title">{a.title}</div>
                <div className="card-price">{a.price} <span style={{fontSize:11,color:"var(--ink3)"}}>FCFA</span></div>
                <div className="card-meta"><span className="card-loc">📍{a.commune}</span><span className="card-stats">👁{a.views}</span></div>
              </div>
            </div>
          ))}
        </div>
        <div className="sp-section-title">Avis ({SELLER_REVIEWS.length})</div>
        {SELLER_REVIEWS.map(r=>(
          <div key={r.id} className="review-item">
            <div className="review-top">
              <div className="review-avatar">{r.emoji}</div>
              <div><div className="review-name">{r.name}</div>
                <div className="review-stars">{[1,2,3,4,5].map(i=><span key={i} style={{fontSize:12,color:i<=r.stars?"var(--gold)":"var(--ink4)"}}>★</span>)}</div>
              </div>
              <span className="review-date">{r.date}</span>
            </div>
            <div className="review-text">{r.text}</div>
          </div>
        ))}
        <div style={{height:16}}/>
      </div>
    </div>
  );
}

/* ── REVIEW MODAL ── */
const REVIEW_TAGS = ["Rapide","Honnête","Bien emballé","Conforme à l'annonce","Livraison top","Prix juste"];
function ReviewModal({article,onClose,onSubmit}) {
  const [stars,setStars] = useState(0);
  const [hover,setHover] = useState(0);
  const [text,setText] = useState("");
  const [tags,setTags] = useState([]);
  const toggleTag = t => setTags(ts=>ts.includes(t)?ts.filter(x=>x!==t):[...ts,t]);
  const canSubmit = stars>0;
  return (
    <div className="overlay" onClick={onClose}>
      <div className="bottom-sheet filter-modal" onClick={e=>e.stopPropagation()}>
        <div className="sheet-handle"/>
        <div style={{textAlign:"center",marginBottom:4}}>
          <div style={{fontSize:32,marginBottom:6}}>{article.emoji}</div>
          <div style={{fontFamily:"Syne,sans-serif",fontSize:19,fontWeight:800,color:"var(--ink)"}}>Laisser un avis</div>
          <div style={{fontSize:13,color:"var(--ink3)",marginTop:3}}>{article.title} · {article.seller}</div>
        </div>
        <div className="stars-picker">
          {[1,2,3,4,5].map(i=>(
            <span key={i} className={`star-pick ${i<=(hover||stars)?"on":""}`}
              onMouseEnter={()=>setHover(i)} onMouseLeave={()=>setHover(0)}
              onClick={()=>setStars(i)}>★</span>
          ))}
        </div>
        {stars>0 && (
          <>
            <div style={{fontSize:11,fontWeight:700,color:"var(--ink3)",textTransform:"uppercase",letterSpacing:".4px",marginBottom:10}}>Que retiens-tu ?</div>
            <div className="review-tags">
              {REVIEW_TAGS.map(t=>(
                <div key={t} className={`review-tag ${tags.includes(t)?"on":""}`} onClick={()=>toggleTag(t)}>{t}</div>
              ))}
            </div>
            <textarea className="review-textarea" rows={3} placeholder="Dis-nous en plus (optionnel)..."
              value={text} onChange={e=>setText(e.target.value)} maxLength={300}/>
            <div style={{fontSize:11,color:"var(--ink4)",textAlign:"right",marginTop:4,marginBottom:14}}>{text.length}/300</div>
          </>
        )}
        <div className="filter-footer">
          <button className="filter-reset" onClick={onClose}>Annuler</button>
          <button className="filter-apply" style={{opacity:canSubmit?1:.5}} onClick={()=>{if(canSubmit){onSubmit(stars,text,tags);onClose();}}}>
            ⭐ Publier l'avis
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── ADVANCED FILTER MODAL ── */
const COMMUNES = ["Cocody","Yopougon","Marcory","Plateau","Abobo","Treichville","Adjamé","Koumassi","Tout Abidjan"];
const SORT_OPTS = [
  {id:"recent",  label:"Plus récents"},
  {id:"price_asc",label:"Prix croissant"},
  {id:"price_desc",label:"Prix décroissant"},
  {id:"popular", label:"Populaires"},
];
function FilterModal({current,onClose,onApply}) {
  const [maxPrice,setMaxPrice] = useState(current.maxPrice||2000000);
  const [sort,setSort] = useState(current.sort||"recent");
  const [communes,setCommunes] = useState(current.communes||[]);
  const [states,setStates] = useState(current.states||[]);
  const [livraison,setLivraison] = useState(current.livraison||false);
  const toggleCommune = c=>setCommunes(cs=>cs.includes(c)?cs.filter(x=>x!==c):[...cs,c]);
  const toggleState = s=>setStates(ss=>ss.includes(s)?ss.filter(x=>x!==s):[...ss,s]);
  const reset = ()=>{setMaxPrice(2000000);setSort("recent");setCommunes([]);setStates([]);setLivraison(false);};
  const count = (communes.length)+(states.length)+(livraison?1:0)+(sort!=="recent"?1:0)+(maxPrice<2000000?1:0);
  return (
    <div className="overlay" style={{alignItems:"flex-end"}} onClick={onClose}>
      <div className="bottom-sheet filter-modal" onClick={e=>e.stopPropagation()}>
        <div className="sheet-handle"/>
        <div className="filter-title">Filtres avancés {count>0&&<span style={{fontSize:13,color:"var(--g2)",fontWeight:700}}>· {count} actifs</span>}</div>
        <div className="filter-sub">Affine ta recherche pour trouver la perle rare</div>
        <div className="filter-section">
          <div className="filter-section-title">Budget maximum</div>
          <div className="price-range-wrap">
            <input type="range" className="price-slider" min={5000} max={2000000} step={5000} value={maxPrice} onChange={e=>setMaxPrice(Number(e.target.value))}/>
            <div className="price-labels">
              <span style={{fontSize:12,color:"var(--ink3)"}}>0 FCFA</span>
              <span className="price-label">{maxPrice>=2000000?"Sans limite":maxPrice.toLocaleString()+" FCFA"}</span>
            </div>
          </div>
        </div>
        <div className="filter-section">
          <div className="filter-section-title">Trier par</div>
          <div className="sort-options">
            {SORT_OPTS.map(o=><div key={o.id} className={`sort-opt ${sort===o.id?"on":""}`} onClick={()=>setSort(o.id)}>{o.label}</div>)}
          </div>
        </div>
        <div className="filter-section">
          <div className="filter-section-title">Commune</div>
          <div className="commune-grid">
            {COMMUNES.map(c=><div key={c} className={`commune-chip ${communes.includes(c)?"on":""}`} onClick={()=>toggleCommune(c)}>{c}</div>)}
          </div>
        </div>
        <div className="filter-section">
          <div className="filter-section-title">État de l'article</div>
          <div className="state-opts">
            {["Neuf","Bon état","Usagé"].map(s=><div key={s} className={`state-opt ${states.includes(s)?"on":""}`} onClick={()=>toggleState(s)}>{s}</div>)}
          </div>
        </div>
        <div className="filter-section" style={{marginBottom:12}}>
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"12px 14px",background:"var(--g5)",borderRadius:12}}>
            <div>
              <div style={{fontSize:13,fontWeight:700,color:"var(--ink)"}}>🛵 Livraison uniquement</div>
              <div style={{fontSize:11,color:"var(--ink3)"}}>Afficher seulement les annonces livrables</div>
            </div>
            <div style={{width:44,height:26,borderRadius:50,background:livraison?"var(--g2)":"var(--ink4)",position:"relative",cursor:"pointer",transition:"background .2s",flexShrink:0}} onClick={()=>setLivraison(l=>!l)}>
              <div style={{width:20,height:20,borderRadius:"50%",background:"white",position:"absolute",top:3,transition:"all .2s cubic-bezier(.34,1.56,.64,1)",right:livraison?3:"auto",left:livraison?"auto":3}}/>
            </div>
          </div>
        </div>
        <div className="filter-footer">
          <button className="filter-reset" onClick={reset}>Réinitialiser</button>
          <button className="filter-apply" onClick={()=>{onApply({maxPrice,sort,communes,states,livraison});onClose();}}>
            Appliquer {count>0?`(${count})`:""}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── ONBOARDING ── */
function Onboarding({onDone}) {
  const [step,setStep] = useState("welcome"); // welcome | phone | otp | success
  const [phone,setPhone] = useState("");
  const [otp,setOtp] = useState(["","","","",""]);
  const otpRefs = [useRef(),useRef(),useRef(),useRef(),useRef()];

  const handleOtp = (i,val) => {
    if(!/^\d?$/.test(val)) return;
    const next = [...otp]; next[i]=val; setOtp(next);
    if(val && i<4) otpRefs[i+1].current?.focus();
  };
  const otpFilled = otp.every(d=>d!=="");

  if(step==="success") return (
    <div className="onb-wrap" style={{justifyContent:"center",alignItems:"center",padding:32,textAlign:"center"}}>
      <div style={{fontSize:72,marginBottom:16}}>🎉</div>
      <div style={{fontFamily:"Syne,sans-serif",fontSize:28,fontWeight:800,color:"var(--ink)",marginBottom:8}}>Bienvenue sur</div>
      <div style={{fontFamily:"Syne,sans-serif",fontSize:40,fontWeight:800,background:"linear-gradient(135deg,var(--g1),var(--g3))",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",marginBottom:16}}>bradeo</div>
      <div style={{fontSize:15,color:"var(--ink3)",marginBottom:40,lineHeight:1.5}}>La première marketplace ivoirienne de l'occasion. Vends. Achète. Brads. ⚡</div>
      <button className="onb-cta" style={{width:"100%"}} onClick={onDone}>Découvrir les annonces →</button>
    </div>
  );

  if(step==="otp") return (
    <div className="onb-wrap">
      <div className="onb-hero" style={{padding:"40px 32px"}}>
        <div className="onb-logo">bradeo</div>
      </div>
      <div className="phone-step">
        <div className="back-link" onClick={()=>setStep("phone")}>
          <Icon name="back" size={16} color="var(--ink2)"/> Retour
        </div>
        <h2>Code de vérification</h2>
        <p>Nous avons envoyé un SMS au <strong>+225 {phone}</strong>. Saisis le code à 5 chiffres.</p>
        <div className="otp-wrap">
          {otp.map((d,i)=>(
            <input key={i} ref={otpRefs[i]} className="otp-box" maxLength={1} value={d}
              onChange={e=>handleOtp(i,e.target.value)}
              onKeyDown={e=>{if(e.key==="Backspace"&&!d&&i>0)otpRefs[i-1].current?.focus();}}/>
          ))}
        </div>
        <div className="resend-link">Pas reçu ? <span onClick={()=>{}}>Renvoyer le code</span></div>
        <button className="onb-cta" style={{marginLeft:0,marginRight:0,width:"100%",opacity:otpFilled?1:.5}}
          onClick={()=>{if(otpFilled){
  verifyOtp({phone:"+225"+phone, otp:otp.join("")})
    .then(()=>setStep("success"))
    .catch(()=>alert("⚠️ Code incorrect, essaie 12345"));
}}}>
          Vérifier ✓
        </button>
      </div>
    </div>
  );

  if(step==="phone") return (
    <div className="onb-wrap">
      <div className="onb-hero" style={{padding:"40px 32px"}}>
        <div className="onb-logo">bradeo</div>
      </div>
      <div className="phone-step">
        <div className="back-link" onClick={()=>setStep("welcome")}>
          <Icon name="back" size={16} color="var(--ink2)"/> Retour
        </div>
        <h2>Mon numéro</h2>
        <p>Saisis ton numéro WhatsApp pour créer ton compte. Simple et rapide.</p>
        <div className="phone-input-wrap">
          <div className="phone-flag">🇨🇮</div>
          <span className="phone-prefix">+225</span>
          <input type="tel" placeholder="07 00 00 00 00" value={phone}
            onChange={e=>setPhone(e.target.value.replace(/\D/g,"").slice(0,10))}
            onKeyDown={e=>e.key==="Enter"&&phone.length>=8&&setStep("otp")}/>
        </div>
        <div style={{fontSize:12,color:"var(--ink3)",marginBottom:24}}>Tu recevras un SMS de confirmation gratuit.</div>
        <button className="onb-cta" style={{marginLeft:0,marginRight:0,width:"100%",opacity:phone.length>=8?1:.5}}
          onClick={()=>{if(phone.length>=8){
  register({phone:"+225"+phone,nom:"Utilisateur",commune:"Abidjan"})
    .catch(()=>{});
  setStep("otp");
}}}>
          Continuer →
        </button>
        <div style={{textAlign:"center",marginTop:16,fontSize:12,color:"var(--ink3)"}}>
          En continuant, tu acceptes les <span style={{color:"var(--g2)",fontWeight:700,cursor:"pointer"}}>Conditions d'utilisation</span> de BRADEO.
        </div>
      </div>
    </div>
  );

  return (
    <div className="onb-wrap">
      <div className="onb-hero">
        <div className="onb-logo">bradeo</div>
        <div className="onb-tag">Vends. Achète. Brads. ⚡</div>
      </div>
      <div className="onb-body">
        {[
          {ico:"📸",bg:"#F0FAF5",t:"Publie en 30 secondes",s:"Photos + prix + commune. C'est tout. Ton annonce est en ligne."},
          {ico:"🤝",bg:"#EEF4FF",t:"Négocie directement",s:"Chat intégré et proposition de prix. Comme au marché."},
          {ico:"🛵",bg:"#FFF4E0",t:"Livraison à Abidjan",s:"Certains vendeurs livrent directement chez toi. Pratique !"},
        ].map((s,i)=>(
          <div key={i} className="onb-step">
            <div className="onb-step-ico" style={{background:s.bg}}>{s.ico}</div>
            <div><div className="onb-step-t">{s.t}</div><div className="onb-step-s">{s.s}</div></div>
          </div>
        ))}
      </div>
      <button className="onb-cta" onClick={()=>setStep("phone")}>Créer mon compte →</button>
      <div className="onb-sub">Tu as déjà un compte ? <span style={{color:"var(--g2)",fontWeight:700,cursor:"pointer"}} onClick={()=>setStep("phone")}>Se connecter</span></div>
    </div>
  );
}

/* ── MAIN APP ── */
export default function BradeoApp() {
  const [onboarded, setOnboarded] = useState(false);
  const [tab, setTab] = useState("home");const [annonces, setAnnonces] = useState([]);

useEffect(() => {
  getAnnonces().then(res => setAnnonces(res.data));
}, []);
  const [activeCat, setActiveCat] = useState("Tout");
  const [likes, setLikes] = useState({});
  const [detail, setDetail] = useState(null);
  const [chat, setChat] = useState(null);
  const [mesAnnonces, setMesAnnonces] = useState(false);
  const [payment, setPayment] = useState(null);
  const [sellerProfile, setSellerProfile] = useState(null);
  const [reviewItem, setReviewItem] = useState(null);
  const [showFilter, setShowFilter] = useState(false);
  const [activeFilters, setActiveFilters] = useState({maxPrice:2000000,sort:"recent",communes:[],states:[],livraison:false});
  const [dashboard, setDashboard] = useState(false);
  const [mapScreen, setMapScreen] = useState(false);
  const [aiReco, setAiReco] = useState(false);
  const [history, setHistory] = useState(false);
  const [settings, setSettings] = useState(false);
  const [premiumScreen, setPremiumScreen] = useState(false);
  const [supportChat, setSupportChat] = useState(false);
  const [reportItem, setReportItem] = useState(null);
  const [darkMode, setDarkMode] = useState(false);
  const [notifPrefs, setNotifPrefs] = useState({messages:true,views:true,offers:true,boosts:false});
  const [toast, setToast] = useState({msg:"",show:false,type:""});
  const [filters, setFilters] = useState([]);
  const [toggle, setToggle] = useState(true);
  const [toggleLivraison, setToggleLivraison] = useState(false);
  const [msgTab, setMsgTab] = useState("achats");
  const [shareItem, setShareItem] = useState(null);
  const [boostItem, setBoostItem] = useState(null);
  const [offerItem, setOfferItem] = useState(null);
  const [selectedPlan, setSelectedPlan] = useState("pro");
  const [boostedIds, setBoostedIds] = useState([2,4]);
  const [notifTab, setNotifTab] = useState("toutes");
  const [readNotifs, setReadNotifs] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [photoFile, setPhotoFile] = useState(null);
const [photoPreview, setPhotoPreview] = useState(null);
  const [formData, setFormData] = useState({title:"",price:"",cat:"Mode",commune:"Cocody",desc:"",state:""});
  const [formErrors, setFormErrors] = useState({});
  const [liveViewers] = useState(()=>Object.fromEntries(annonces.map(a=>[a.id,Math.floor(Math.random()*5)+1])));

  const showToast = useCallback((msg,type="") => {
    setToast({msg,show:true,type});
    setTimeout(()=>setToast(t=>({...t,show:false})),2500);
  },[]);

  // BUG FIX: toggleLike ne dépend plus de `likes`
  const toggleLike = useCallback((id) => {
    setLikes(l => {
      const newVal = !l[id];
      showToast(newVal ? "❤️ Ajouté aux favoris" : "Retiré des favoris");
      return {...l,[id]:newVal};
    });
  },[showToast]);

  const toggleFilter = (f) => setFilters(fs=>fs.includes(f)?fs.filter(x=>x!==f):[...fs,f]);
  const openWhatsApp = () => showToast("✅ Ouverture WhatsApp...","wa");

  const confirmBoost = () => {
    if(boostItem){setBoostedIds(ids=>[...new Set([...ids,boostItem.id])]);showToast("🚀 Annonce boostée !","gold");}
    setBoostItem(null);
  };

  const validateForm = () => {
    const e={};
    if(!formData.title.trim()) e.title="Le titre est obligatoire";
    else if(formData.title.length<5) e.title="Minimum 5 caractères";
    if(!formData.price) e.price="Le prix est obligatoire";
    else if(isNaN(formData.price)||Number(formData.price)<=0) e.price="Prix invalide";
    if(!formData.state) e.state="Choisissez un état";
    return e;
  };

const handleSubmit = async () => {
    const e = validateForm(); setFormErrors(e);
    if(Object.keys(e).length===0){
      try {
        let photoUrl = null;
      if(photoFile){
        const fd = new FormData();
        fd.append('photo', photoFile);
        const uploadRes = await uploadPhoto(fd);
        photoUrl = uploadRes.data.url;
      }
      await createAnnonce({titre:formData.title,prix:parseInt(formData.price),categorie:formData.cat,commune:formData.commune,description:formData.desc,emoji:'📦',statut:'active',vues:0,photos:photoUrl?[photoUrl]:[]});
        const res = await getAnnonces();
        setAnnonces(res.data);
        showToast("🎉 Annonce publiée !");
        setActiveCat("Tout");
        setTab("home");
        setFormData({title:"",price:"",cat:"Mode",commune:"Cocody",desc:"",state:""});
        setFormErrors({});
      } catch(err) {
        showToast("⚠️ Erreur lors de la publication");
      }
    } else showToast("⚠️ Corrige les erreurs");
  };

  const filtered = useMemo(()=>{
    let arr;
    if(activeCat==="Tout") arr=[...annonces];
    else {
      const catObj = ALL_CATS.find(c=>c.lbl===activeCat);
      if(catObj) arr=annonces.filter(a=>a.catId===catObj.id);
      else arr=annonces.filter(a=>a.cat===activeCat);
    }
    if(filters.includes("Livraison")) arr=arr.filter(a=>a.livraison);
    if(filters.includes("Neuf")) arr=arr.filter(a=>a.state==="Neuf");
    return arr.sort((a,b)=>(boostedIds.includes(b.id)?1:0)-(boostedIds.includes(a.id)?1:0));
  },[activeCat,filters,boostedIds,annonces]);

  const unreadMsgs = CONVERSATIONS.filter(c=>c.unread>0).length;
  const unreadNotifs = NOTIFICATIONS.filter(n=>n.unread&&!readNotifs.includes(n.id)).length;

  const goHome = () => {setDetail(null);setChat(null);setMesAnnonces(false);setPayment(null);setSellerProfile(null);setDashboard(false);setMapScreen(false);setAiReco(false);setHistory(false);setSettings(false);setPremiumScreen(false);setSupportChat(false);};
  const openDetail = (a) => {setDetail(a);setChat(null);setMesAnnonces(false);setPayment(null);setSellerProfile(null);setDashboard(false);setMapScreen(false);setAiReco(false);setHistory(false);setSettings(false);setPremiumScreen(false);setSupportChat(false);};

  // BUG FIX: openChat marque les notifs liées comme lues
  const openChat = useCallback((conv) => {
    const ids=NOTIFICATIONS.filter(n=>n.articleId===conv.articleId).map(n=>n.id);
    setReadNotifs(r=>[...new Set([...r,...ids])]);
    setChat(conv);
  },[]);

  const searchResults = useMemo(()=>{
    if(!searchQuery.trim()) return [];
    const q=searchQuery.toLowerCase();
    return annonces.filter(a=>a.title.toLowerCase().includes(q)||a.commune.toLowerCase().includes(q)||a.cat.toLowerCase().includes(q));
  },[searchQuery]);

  const isOverlay = chat||payment||sellerProfile||mesAnnonces||dashboard||mapScreen||aiReco||history||settings||premiumScreen||supportChat;

  if(!onboarded) return (
    <>
      <style>{FONT}{CSS}</style>
      <div className="phone-wrap">
        <div className="phone">
          <div className="status-bar">
            <span className="time">9:41</span>
            <div className="icons">
              <svg width="16" height="12" viewBox="0 0 16 12" fill="currentColor"><rect x="0" y="3" width="3" height="9" rx="1"/><rect x="4" y="2" width="3" height="10" rx="1"/><rect x="8" y="0" width="3" height="12" rx="1"/><rect x="12" y="0" width="3" height="12" rx="1" opacity=".3"/></svg>
              <svg width="16" height="12" viewBox="0 0 16 12" fill="currentColor"><path d="M8 2.4A9.6 9.6 0 0115.6 6L14 7.6a7.2 7.2 0 00-6-3.2A7.2 7.2 0 002 7.6L.4 6A9.6 9.6 0 018 2.4zM8 6a4 4 0 012.83 1.17L8 10 5.17 7.17A4 4 0 018 6z"/></svg>
              <svg width="25" height="12" viewBox="0 0 25 12" fill="currentColor"><rect x="0" y="1" width="22" height="10" rx="3" stroke="currentColor" strokeWidth="1.5" fill="none"/><rect x="23" y="4" width="2" height="4" rx="1"/><rect x="1.5" y="2.5" width="17" height="7" rx="2"/></svg>
            </div>
          </div>
          <Onboarding onDone={()=>setOnboarded(true)}/>
        </div>
      </div>
    </>
  );

  return (
    <>
      <style>{FONT}{CSS}</style>
      <div className="phone-wrap">
        <div className={`phone${darkMode?" dark":""}`}>
          <div className="status-bar" style={darkMode?{background:"#162212",borderColor:"rgba(34,185,110,.1)"}:{}}>
            <span className="time" style={darkMode?{color:"#e8f5ef"}:{}}>9:41</span>
            <div className="icons" style={darkMode?{color:"#e8f5ef"}:{}}>
              <svg width="16" height="12" viewBox="0 0 16 12" fill="currentColor"><rect x="0" y="3" width="3" height="9" rx="1"/><rect x="4" y="2" width="3" height="10" rx="1"/><rect x="8" y="0" width="3" height="12" rx="1"/><rect x="12" y="0" width="3" height="12" rx="1" opacity=".3"/></svg>
              <svg width="16" height="12" viewBox="0 0 16 12" fill="currentColor"><path d="M8 2.4A9.6 9.6 0 0115.6 6L14 7.6a7.2 7.2 0 00-6-3.2A7.2 7.2 0 002 7.6L.4 6A9.6 9.6 0 018 2.4zM8 6a4 4 0 012.83 1.17L8 10 5.17 7.17A4 4 0 018 6z"/></svg>
              <svg width="25" height="12" viewBox="0 0 25 12" fill="currentColor"><rect x="0" y="1" width="22" height="10" rx="3" stroke="currentColor" strokeWidth="1.5" fill="none"/><rect x="23" y="4" width="2" height="4" rx="1"/><rect x="1.5" y="2.5" width="17" height="7" rx="2"/></svg>
            </div>
          </div>

          <div className="screen" style={{...(isOverlay?{display:"flex",flexDirection:"column"}:{}), ...(darkMode?{background:"#0a1410"}:{})}}>

            {/* CHAT */}
            {chat && <ChatScreen conv={chat} article={annonces.find(a=>a.id===chat.articleId)} onBack={()=>setChat(null)} onWhatsApp={openWhatsApp}/>}

            {/* PAYMENT */}
            {!chat && payment && <PaymentScreen article={payment} onBack={()=>setPayment(null)} onSuccess={()=>{setPayment(null);setTab("messages");showToast("🎉 Transaction confirmée !");}}/>}

            {/* PREMIUM */}
            {!chat && !payment && premiumScreen && <PremiumScreen onBack={()=>setPremiumScreen(false)} showToast={showToast}/>}

            {/* SUPPORT */}
            {!chat && !payment && !premiumScreen && supportChat && <SupportChat onBack={()=>setSupportChat(false)}/>}

            {/* SETTINGS */}
            {!chat && !payment && !premiumScreen && !supportChat && settings && <Settings onBack={()=>setSettings(false)} darkMode={darkMode} setDarkMode={setDarkMode} notifs={notifPrefs} setNotifs={setNotifPrefs} showPremium={()=>{setSettings(false);setPremiumScreen(true);}}/>}

            {/* SELLER PROFILE */}
            {!chat && !payment && sellerProfile && (
              <SellerProfile seller={sellerProfile} annonces={annonces.filter(a=>a.seller===sellerProfile.seller).slice(0,4)}
                onBack={()=>setSellerProfile(null)} onArticle={openDetail}
                onContact={()=>{const c=CONVERSATIONS.find(cv=>cv.articleId===annonces.find(a=>a.seller===sellerProfile.seller)?.id)||CONVERSATIONS[0];setSellerProfile(null);setTab("messages");setTimeout(()=>setChat(c),50);}}/>
            )}

            {/* MES ANNONCES */}
            {!chat && !payment && !premiumScreen && !supportChat && !settings && !sellerProfile && mesAnnonces && <MesAnnonces onBack={()=>setMesAnnonces(false)} onBoost={setBoostItem} likes={likes} boostedIds={boostedIds} onDetail={openDetail}/>}

            {/* DASHBOARD */}
            {!chat && !payment && !premiumScreen && !supportChat && !settings && !sellerProfile && !mesAnnonces && dashboard && <Dashboard onBack={()=>setDashboard(false)} onBoost={setBoostItem} onDetail={openDetail}/>}

            {/* MAP */}
            {!chat && !payment && !premiumScreen && !supportChat && !settings && !sellerProfile && !mesAnnonces && !dashboard && mapScreen && <MapScreen onBack={()=>setMapScreen(false)} onDetail={openDetail}/>}

            {/* AI RECO */}
            {!chat && !payment && !premiumScreen && !supportChat && !settings && !sellerProfile && !mesAnnonces && !dashboard && !mapScreen && aiReco && <AIReco onBack={()=>setAiReco(false)} onDetail={openDetail} likes={likes} onLike={toggleLike}/>}

            {/* HISTORY */}
            {!chat && !payment && !premiumScreen && !supportChat && !settings && !sellerProfile && !mesAnnonces && !dashboard && !mapScreen && !aiReco && history && <History onBack={()=>setHistory(false)}/>}

            {/* DETAIL */}
            {!chat && !payment && !premiumScreen && !supportChat && !settings && !sellerProfile && !mesAnnonces && !dashboard && !mapScreen && !aiReco && !history && detail && (
              <div style={{animation:"slideUp .3s cubic-bezier(.22,1,.36,1) both"}}>
                <div className="detail-header">
                  <div className="back-btn" onClick={goHome}><Icon name="back" size={18} color="var(--ink)"/></div>
                  <span style={{fontFamily:"Syne,sans-serif",fontWeight:800,fontSize:17,color:"var(--ink)",flex:1}}>Détail annonce</span>
                  <div className="back-btn" style={{marginRight:4}} onClick={()=>setReportItem(detail)} title="Signaler">
                    <span style={{fontSize:16}}>🚩</span>
                  </div>
                  <div className="back-btn" onClick={()=>setShareItem(detail)}><Icon name="share" size={18} color="var(--ink)"/></div>
                </div>
                <div className="detail-img">
                  <span style={{fontSize:110}}>{detail.emoji}</span>
                  {boostedIds.includes(detail.id) && <div className="detail-boost-badge">👑 BOOSTÉ</div>}
                </div>
                <div className="detail-body">
                  <div className="detail-cats">
                    <span className="detail-cat">{detail.cat}</span>
                    <span className="detail-cat">{detail.state}</span>
                    {detail.badge && <span className="detail-cat" style={{background:"var(--g1)",color:"white"}}>{detail.badge}</span>}
                  </div>
                  <div className="detail-title">{detail.title}</div>
                  <div className="detail-price">{detail.price} FCFA</div>
                  {detail.description && <div className="detail-desc">{detail.description}</div>}
                  <div className="detail-stats">
                    <div className="stat-item"><span className="stat-val">{detail.views}</span><span className="stat-lbl">👁 vues</span></div>
                    <div className="stat-item"><span className="stat-val">{detail.likes}</span><span className="stat-lbl">❤️ favoris</span></div>
                    <div className="stat-item"><span className="stat-val">{detail.commune}</span><span className="stat-lbl">📍 lieu</span></div>
                  </div>
                  <div className="live-tag">
                    <span className="live-dot"/>{liveViewers[detail.id]} {liveViewers[detail.id]>1?"personnes regardent":"personne regarde"}
                  </div>
                  {detail.livraison && (
                    <div className="livraison-row">
                      <div style={{fontSize:22}}>🛵</div>
                      <div style={{flex:1}}>
                        <div style={{fontSize:13,fontWeight:700,color:"var(--g1)"}}>Livraison disponible</div>
                        <div style={{fontSize:11,color:"var(--ink3)"}}>Paiement à la livraison · Abidjan</div>
                      </div>
                      <div className="livraison-price">{detail.livraisonPrice} FCFA</div>
                    </div>
                  )}
                  <div className="seller-row" style={{cursor:"pointer"}} onClick={()=>{setSellerProfile(detail);}}>
                    <div className="seller-avatar">{detail.sellerInitial}</div>
                    <div>
                      <div className="seller-name">{detail.seller} <span style={{fontSize:11,color:"var(--g2)",fontWeight:600}}>· Voir profil →</span></div>
                      <div className="rating-row">
                        {"★★★★★".split("").map((s,i)=><span key={i} className="star" style={{opacity:i<Math.floor(detail.sellerScore)?1:.25}}>{s}</span>)}
                        <span style={{fontSize:12,color:"var(--ink3)",marginLeft:4}}>{detail.sellerScore} · {detail.sellerSales} ventes</span>
                      </div>
                    </div>
                    <span className="seller-badge">Fiable ✓</span>
                  </div>
                  <div className="cta-row">
                    <button className="btn-primary" onClick={()=>{const c=CONVERSATIONS.find(cv=>cv.articleId===detail.id)||CONVERSATIONS[0];setDetail(null);setTab("messages");setTimeout(()=>setChat(c),50);}}>💬 Contacter</button>
                    <button className="btn-whatsapp" onClick={openWhatsApp}><Icon name="wa" size={18}/>WA</button>
                    <div className="btn-secondary" onClick={()=>toggleLike(detail.id)}>
                      <Icon name={likes[detail.id]?"heartFill":"heart"} size={20} color="var(--red)"/>
                    </div>
                  </div>
                  <button style={{width:"100%",marginTop:10,padding:15,borderRadius:14,background:"linear-gradient(135deg,#1a6aff,#0047cc)",color:"white",fontFamily:"DM Sans,sans-serif",fontWeight:700,fontSize:15,border:"none",cursor:"pointer",boxShadow:"0 8px 24px rgba(26,106,255,.3)"}} onClick={()=>setPayment(detail)}>
                    💳 Acheter maintenant · {detail.price} FCFA
                  </button>
                  <div style={{marginTop:12,display:"flex",gap:10,justifyContent:"center"}}>
                    <span style={{fontSize:13,color:"var(--g2)",fontWeight:700,cursor:"pointer",padding:"9px 18px",background:"var(--g5)",borderRadius:50,border:"1.5px solid var(--g4)"}} onClick={()=>setOfferItem(detail)}>
                      💰 Proposer un prix
                    </span>
                    <span style={{fontSize:13,color:"var(--ink2)",fontWeight:700,cursor:"pointer",padding:"9px 18px",background:"var(--g5)",borderRadius:50,border:"1.5px solid var(--g4)"}} onClick={()=>setReviewItem(detail)}>
                      ⭐ Laisser un avis
                    </span>
                  </div>
                  <div style={{height:24}}/>
                </div>
              </div>
            )}

            {/* HOME */}
            {!chat && !payment && !premiumScreen && !supportChat && !settings && !sellerProfile && !mesAnnonces && !dashboard && !mapScreen && !aiReco && !history && !detail && tab==="home" && (
              <div className="animate-in">
                <div className="header">
                  <div className="header-top">
                    <span className="logo">bradeo</span>
                    <div className="notif-btn" onClick={()=>setTab("notifs")}>
                      <Icon name="bell" size={20} color="var(--ink)"/>
                      {unreadNotifs>0 && <div className="notif-dot"/>}
                    </div>
                  </div>
                  <div className="search-bar" onClick={()=>setTab("search")}>
                    <Icon name="search" size={18} color="var(--ink3)"/>
                    <input readOnly placeholder="Rechercher un article..."/>
                  </div>
                </div>

                <CatGrid activeCat={activeCat} onSelect={setActiveCat}/>

                {/* QUICK ACCESS */}
                <div style={{padding:"14px 20px 6px",display:"flex",gap:10,overflowX:"auto"}} className="categories">
                  {[
                    {ico:"🤖",label:"Pour toi",color:"#F5F0FF",action:()=>setAiReco(true)},
                    {ico:"🗺️",label:"Carte",color:"var(--g5)",action:()=>setMapScreen(true)},
                    {ico:"📊",label:"Stats",color:"#EEF4FF",action:()=>setDashboard(true)},
                    {ico:"🗓",label:"Historique",color:"#FFF4E0",action:()=>setHistory(true)},
                    {ico:"👑",label:"Premium",color:"linear-gradient(135deg,#f5f0ff,#ede8ff)",action:()=>setPremiumScreen(true)},
                    {ico:"🤝",label:"Support",color:"var(--g5)",action:()=>setSupportChat(true)},
                  ].map((q,i)=>(
                    <div key={i} onClick={q.action} style={{display:"flex",flexDirection:"column",alignItems:"center",gap:5,cursor:"pointer",flexShrink:0,transition:"transform .15s"}}
                      onMouseDown={e=>e.currentTarget.style.transform="scale(.9)"}
                      onMouseUp={e=>e.currentTarget.style.transform="scale(1)"}
                      onTouchStart={e=>e.currentTarget.style.transform="scale(.9)"}
                      onTouchEnd={e=>e.currentTarget.style.transform="scale(1)"}>
                      <div style={{width:48,height:48,borderRadius:16,background:q.color,display:"flex",alignItems:"center",justifyContent:"center",fontSize:22,border:"1px solid rgba(13,92,53,.06)"}}>{q.ico}</div>
                      <span style={{fontSize:10,fontWeight:700,color:"var(--ink2)"}}>{q.label}</span>
                    </div>
                  ))}
                </div>

                {/* BRADERIE FLASH */}
                <div className="flash-section animate-in-2">
                  <div className="flash-header">
                    <div className="flash-title">⚡ Braderie Flash</div>
                    <FlashTimer/>
                  </div>
                  <div className="flash-cards">
                    {FLASH_annonces.map(a=>(
                      <div key={a.id} className="flash-card" onClick={()=>showToast("🔥 "+a.name)}>
                        <span className="flash-badge">-{a.pct}%</span>
                        <span className="flash-em">{a.emoji}</span>
                        <div className="flash-name">{a.name}</div>
                        <div className="flash-price-wrap">
                          <span className="flash-price">{a.price}</span>
                          <span className="flash-old">{a.oldPrice}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="section-header animate-in-2">
                  <div><div className="section-title">🔥 En ce moment</div><div className="section-sub">Les meilleures affaires du jour</div></div>
                  <span className="see-all">Voir tout</span>
                </div>
                <div className="featured-scroll animate-in-2">
                  {annonces.filter(a=>a.badge).slice(0,3).map(a=>(
                    <div key={a.id} className="featured-card" onClick={()=>openDetail(a)}>
                      <span className="featured-badge">{a.badge}</span>
                      <span className="featured-emoji">{a.emoji}</span>
                      <div className="featured-label">{a.cat} · {a.commune}</div>
                      <div className="featured-name">{a.title}</div>
                      <div className="featured-price">{a.price} FCFA</div>
                    </div>
                  ))}
                </div>
                <div className="section-header animate-in-3">
                  <div><div className="section-title">{activeCat==="Tout"?"Toutes les annonces":activeCat}</div></div>
                  <span className="see-all">{filtered.length} annonces</span>
                </div>
                <div className="cards-grid animate-in-3">
                  {filtered.length>0 ? filtered.map(a=>(
                    <ArticleCard key={a.id} article={a} boosted={boostedIds.includes(a.id)} liked={!!likes[a.id]} onLike={toggleLike} onClick={()=>openDetail(a)}/>
                  )) : (
                    <div style={{gridColumn:"1/-1"}}>
                      <div className="empty-state">
                        <div className="emoji">🔍</div>
                        <h3>Aucune annonce</h3>
                        <p>Pas encore d'annonces dans cette catégorie. Sois le premier !</p>
                      </div>
                    </div>
                  )}
                </div>
                <div style={{height:16}}/>
              </div>
            )}

            {/* SEARCH */}
            {!chat && !payment && !premiumScreen && !supportChat && !settings && !sellerProfile && !mesAnnonces && !dashboard && !mapScreen && !aiReco && !history && !detail && tab==="search" && (
              <div className="animate-in">
                <div className="search-screen-header">
                  <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:14}}>
                    <h1 style={{marginBottom:0}}>Recherche</h1>
                    <div style={{display:"flex",alignItems:"center",gap:6,padding:"8px 14px",borderRadius:50,background:Object.values(activeFilters).some(v=>v&&v!==2000000&&v!=="recent"&&(Array.isArray(v)?v.length>0:true))?"var(--g1)":"var(--g5)",cursor:"pointer",transition:"var(--t)"}} onClick={()=>setShowFilter(true)}>
                      <span style={{fontSize:16}}>⚙️</span>
                      <span style={{fontSize:12,fontWeight:700,color:Object.values(activeFilters).some(v=>v&&v!==2000000&&v!=="recent"&&(Array.isArray(v)?v.length>0:true))?"white":"var(--ink2)"}}>Filtres{[activeFilters.communes.length,activeFilters.states.length,activeFilters.livraison?1:0,activeFilters.maxPrice<2000000?1:0,activeFilters.sort!=="recent"?1:0].reduce((a,b)=>a+b,0)>0?` (${[activeFilters.communes.length,activeFilters.states.length,activeFilters.livraison?1:0,activeFilters.maxPrice<2000000?1:0,activeFilters.sort!=="recent"?1:0].reduce((a,b)=>a+b,0)})`:""}</span>
                    </div>
                  </div>
                  <div className="search-bar" style={{marginBottom:0}}>
                    <Icon name="search" size={18} color="var(--g2)"/>
                    <input autoFocus placeholder="iPhone, Nike, canapé..." value={searchQuery} onChange={e=>setSearchQuery(e.target.value)}/>
                    {searchQuery && <span style={{fontSize:18,cursor:"pointer",color:"var(--ink3)"}} onClick={()=>setSearchQuery("")}>×</span>}
                  </div>
                  <div className="filter-chips">
                    {["Cocody","Yopougon","Marcory","Plateau","Livraison","Neuf","Négociable"].map(f=>(
                      <div key={f} className={`filter-chip ${filters.includes(f)?"on":""}`} onClick={()=>toggleFilter(f)}>{f}</div>
                    ))}
                  </div>
                </div>
                {searchQuery ? (
                  <>
                    <div className="section-header"><div className="section-title">Résultats</div><span className="see-all">{searchResults.length} trouvés</span></div>
                    {searchResults.length>0 ? (
                      <div className="cards-grid" style={{paddingTop:0}}>
                        {searchResults.map(a=><ArticleCard key={a.id} article={a} boosted={boostedIds.includes(a.id)} liked={!!likes[a.id]} onLike={toggleLike} onClick={()=>openDetail(a)}/>)}
                      </div>
                    ) : <div className="empty-state"><div className="emoji">🔍</div><h3>Aucun résultat</h3><p>Essaie d'autres mots-clés</p></div>}
                  </>
                ) : (
                  <>
                    <div style={{padding:"16px 20px 8px"}}>
                      <div style={{fontSize:11,fontWeight:700,color:"var(--ink3)",textTransform:"uppercase",letterSpacing:"1px",marginBottom:12}}>Toutes les catégories</div>
                      <div style={{display:"grid",gridTemplate:"repeat(5,1fr)",gap:8}}>
                        {ALL_CATS.map(c=>(
                          <div key={c.id} style={{display:"flex",flexDirection:"column",alignItems:"center",gap:5,cursor:"pointer",padding:"8px 4px",borderRadius:14,background:"var(--white)",border:"1px solid rgba(13,92,53,.07)"}} onClick={()=>{setActiveCat(c.lbl);setTab("home");}}>
                            <div style={{width:40,height:40,borderRadius:12,background:c.bg,display:"flex",alignItems:"center",justifyContent:"center",fontSize:20}}>{c.ico}</div>
                            <span style={{fontSize:"9px",fontWeight:700,color:"var(--ink2)",textAlign:"center",lineHeight:1.2}}>{c.lbl}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="trending">
                      <div className="trending-title">🔥 Tendances à Abidjan</div>
                      {TRENDING.map(t=>(
                        <div key={t.rank} className="trending-item" onClick={()=>setSearchQuery(t.name)}>
                          <span className="trend-rank">#{t.rank}</span>
                          <span className="trend-name">{t.name}</span>
                          <span className="trend-count">{t.count}</span>
                          <span className="trend-arrow">{t.up?"↑":"→"}</span>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            )}

            {/* POST */}
            {!chat && !payment && !premiumScreen && !supportChat && !settings && !sellerProfile && !mesAnnonces && !dashboard && !mapScreen && !aiReco && !history && !detail && tab==="post" && (
              <div className="animate-in">
                <div className="post-header"><h1>Publier</h1><p>Mets ton article en vente en 30 sec ⚡</p></div>
                <div className="photo-zone">
                  <div className="photo-main" onClick={()=>document.getElementById('photo-input').click()}>
                    <Icon name="camera" size={28} color="var(--g2)"/>
                    <p style={{fontSize:14,fontWeight:700,color:"var(--g1)"}}>Photo principale</p>
                    <small style={{fontSize:12,color:"var(--ink3)"}}>Appuie pour ajouter</small>
                  </div><input id="photo-input" type="file" accept="image/*" style={{display:'none'}} onChange={(e)=>{const file=e.target.files[0];if(file){setPhotoFile(file);setPhotoPreview(URL.createObjectURL(file));}}}/>
{photoPreview && <img src={photoPreview} style={{width:'100%',height:140,objectFit:'cover',borderRadius:16,marginBottom:8}} alt="preview"/>}
                  <div className="photo-thumb">{[0,1,2].map(i=><div key={i} className="photo-thumb-slot" onClick={()=>showToast("📸 Galerie")}>+</div>)}</div>
                </div>
                <div className="form-body">
                  <div className="form-group">
                    <label>Titre *</label>
                    <input className={`form-input ${formErrors.title?"error":""}`} placeholder="Ex: iPhone 12 Pro 128Go..." value={formData.title} onChange={e=>{setFormData(f=>({...f,title:e.target.value}));setFormErrors(er=>({...er,title:""}));}} maxLength={60}/>
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginTop:3}}>
                      {formErrors.title && <span className="error-msg">{formErrors.title}</span>}
                      <span className="char-count" style={{marginLeft:"auto"}}>{formData.title.length}/60</span>
                    </div>
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Prix (FCFA) *</label>
                      <input className={`form-input ${formErrors.price?"error":""}`} placeholder="0" type="number" value={formData.price} onChange={e=>{setFormData(f=>({...f,price:e.target.value}));setFormErrors(er=>({...er,price:""}));}}/>
                      {formErrors.price && <span className="error-msg">{formErrors.price}</span>}
                    </div>
                    <div className="form-group">
                      <label>Catégorie *</label>
                      <select className="form-input" value={formData.cat} onChange={e=>setFormData(f=>({...f,cat:e.target.value}))}>
                        {ALL_CATS.map(c=><option key={c.id} value={c.lbl}>{c.ico} {c.lbl}</option>)}
                      </select>
                    </div>
                  </div>
                  <div className="form-group">
                    <label>Commune *</label>
                    <select className="form-input" value={formData.commune} onChange={e=>setFormData(f=>({...f,commune:e.target.value}))}>
                      {["Cocody","Yopougon","Marcory","Plateau","Abobo","Treichville","Adjamé","Koumassi","Port-Bouët","Autre"].map(c=><option key={c}>{c}</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Description</label>
                    <textarea className="form-input" rows={3} style={{resize:"none",lineHeight:1.5}} placeholder="État, caractéristiques, raison de la vente..." value={formData.desc} maxLength={300} onChange={e=>setFormData(f=>({...f,desc:e.target.value}))}/>
                    <span className="char-count">{formData.desc.length}/300</span>
                  </div>
                  <div className="form-group">
                    <label>État *</label>
                    <div style={{display:"flex",gap:8}}>
                      {["Neuf","Bon état","Usagé"].map(st=>(
                        <div key={st} style={{flex:1,textAlign:"center",padding:"10px 0",borderRadius:50,fontSize:13,fontWeight:600,cursor:"pointer",transition:".15s",background:formData.state===st?"var(--g1)":"var(--g5)",color:formData.state===st?"white":"var(--ink2)",border:formErrors.state&&!formData.state?"1.5px solid var(--red)":"1.5px solid transparent"}} onClick={()=>{setFormData(f=>({...f,state:st}));setFormErrors(er=>({...er,state:""}));}}>
                          {st}
                        </div>
                      ))}
                    </div>
                    {formErrors.state && <span className="error-msg">{formErrors.state}</span>}
                  </div>
                  <div className="toggle-row"><span className="toggle-label">💰 Prix négociable</span><div className={`toggle ${toggle?"":"off"}`} onClick={()=>setToggle(t=>!t)}/></div>
                  <div className="toggle-row"><span className="toggle-label">🛵 Livraison possible</span><div className={`toggle ${toggleLivraison?"":"off"}`} onClick={()=>setToggleLivraison(t=>!t)}/></div>
                  {toggleLivraison && <div className="form-group"><label>Frais de livraison (FCFA)</label><input className="form-input" placeholder="Ex: 500" type="number"/></div>}
                  <div className="boost-banner" onClick={()=>setBoostItem({id:99,title:"Votre annonce",emoji:"📦",sellerInitial:"?",priceNum:0})}>
                    <div style={{fontSize:24}}>👑</div>
                    <div className="boost-banner-text"><div className="boost-banner-title">Booster mon annonce</div><div className="boost-banner-sub">Soyez vu 10x plus · dès 500 FCFA</div></div>
                    <div className="boost-banner-arrow">›</div>
                  </div>
                  <button className="submit-btn" onClick={handleSubmit}>✅ Publier mon article</button>
                </div>
              </div>
            )}

            {/* MESSAGES */}
            {!chat && !payment && !premiumScreen && !supportChat && !settings && !sellerProfile && !mesAnnonces && !dashboard && !mapScreen && !aiReco && !history && !detail && tab==="messages" && (
              <div className="animate-in">
                <div className="msg-header">
                  <h1>Messages</h1>
                  <div className="msg-tabs">
                    {["achats","ventes"].map(t=><div key={t} className={`msg-tab ${msgTab===t?"active":""}`} onClick={()=>setMsgTab(t)}>{t==="achats"?"🛍️ Achats":"📦 Ventes"}</div>)}
                  </div>
                </div>
                <div className="conv-list">
                  {CONVERSATIONS.map(c=>(
                    <div key={c.id}>
                      <div className="conv-item" onClick={()=>openChat(c)}>
                        <div className="conv-avatar"><span style={{fontSize:26}}>{c.emoji}</span>{c.online&&<div className="conv-online"/>}</div>
                        <div className="conv-body"><div className="conv-name">{c.name}</div><div className="conv-preview">{c.preview}</div></div>
                        <div className="conv-right"><span className="conv-time">{c.time}</span>{c.unread>0&&<div className="conv-badge">{c.unread}</div>}</div>
                      </div>
                      <div className="conv-article">📦 {annonces.find(a=>a.id===c.articleId)?.title}<span style={{marginLeft:8,color:"var(--wa)",fontWeight:700,fontSize:11,cursor:"pointer"}} onClick={()=>showToast("✅ WhatsApp","wa")}>· WA →</span></div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* NOTIFS */}
            {!chat && !payment && !premiumScreen && !supportChat && !settings && !sellerProfile && !mesAnnonces && !dashboard && !mapScreen && !aiReco && !history && !detail && tab==="notifs" && (
              <div className="animate-in">
                <div className="notif-header">
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                    <h1>Notifications</h1>
                    {unreadNotifs>0&&<span style={{fontSize:13,fontWeight:600,color:"var(--g2)",cursor:"pointer"}} onClick={()=>setReadNotifs(NOTIFICATIONS.map(n=>n.id))}>Tout lire</span>}
                  </div>
                  <div className="notif-tabs">
                    {["toutes","non lues"].map(t=><div key={t} className={`notif-tab ${notifTab===t?"active":""}`} onClick={()=>setNotifTab(t)}>{t==="toutes"?"Toutes":`Non lues ${unreadNotifs>0?`(${unreadNotifs})`:""}`}</div>)}
                  </div>
                </div>
                <div>
                  {NOTIFICATIONS.filter(n=>notifTab==="toutes"||(n.unread&&!readNotifs.includes(n.id))).map(n=>(
                    <div key={n.id} className={`notif-item ${n.unread&&!readNotifs.includes(n.id)?"unread":""}`} onClick={()=>{setReadNotifs(r=>[...new Set([...r,n.id])]);const a=annonces.find(x=>x.id===n.articleId);if(a)openDetail(a);}}>
                      <div className="notif-icon-wrap" style={{background:n.bg}}>{n.icon}</div>
                      <div style={{flex:1}}>
                        <div className="notif-title">{n.title}</div>
                        <div className="notif-text">{n.text}</div>
                        <div className="notif-time">{n.time}</div>
                        {n.articleId&&(()=>{const a=annonces.find(x=>x.id===n.articleId);return a?<div className="notif-article">{a.emoji} {a.title} · <span style={{color:"var(--g1)",fontWeight:700}}>{a.price} FCFA</span></div>:null;})()}
                      </div>
                    </div>
                  ))}
                  {notifTab==="non lues"&&unreadNotifs===0&&<div className="empty-state"><div className="emoji">🎉</div><h3>Tout est lu !</h3><p>Tu es à jour sur toutes tes notifications</p></div>}
                </div>
              </div>
            )}

            {/* PROFILE */}
            {!chat && !payment && !premiumScreen && !supportChat && !settings && !sellerProfile && !mesAnnonces && !dashboard && !mapScreen && !aiReco && !history && !detail && tab==="profile" && (
              <div className="animate-in">
                <div className="profile-hero">
                  <div className="profile-avatar-wrap"><div className="profile-avatar">👤</div><div className="profile-verified">⭐</div></div>
                  <div className="profile-name">Mon Profil</div>
                  <div className="profile-handle">@bradeo_user · Abidjan</div>
                  <div className="profile-stats-row">
                    <div className="profile-stat"><span className="pstat-val">12</span><span className="pstat-lbl">Annonces</span></div>
                    <div className="profile-stat"><span className="pstat-val">4.8★</span><span className="pstat-lbl">Note</span></div>
                    <div className="profile-stat"><span className="pstat-val">8</span><span className="pstat-lbl">Ventes</span></div>
                    <div className="profile-stat"><span className="pstat-val">3</span><span className="pstat-lbl">Achats</span></div>
                  </div>
                </div>
                <div className="profile-body">
                  <div className="menu-section">
                    <div className="menu-section-title">Mes annonces</div>
                    <div className="menu-card">
                      {[
                        {icon:"📦",bg:"#FFF4E0",title:"Mes annonces actives",sub:"4 annonces en ligne",action:()=>setMesAnnonces(true)},
                        {icon:"✅",bg:"#F0FAF5",title:"annonces vendus",sub:"8 transactions réussies",action:()=>setMesAnnonces(true)},
                        {icon:"❤️",bg:"#FDF0EF",title:"Mes favoris",sub:`${Object.values(likes).filter(Boolean).length} annonces sauvegardés`,action:()=>setMesAnnonces(true)},
                      ].map((m,i)=>(
                        <div key={i} className="menu-item" onClick={m.action}>
                          <div className="menu-icon" style={{background:m.bg}}>{m.icon}</div>
                          <div className="menu-text"><div className="menu-title">{m.title}</div><div className="menu-sub">{m.sub}</div></div>
                          <Icon name="chevron" size={18} color="var(--ink4)"/>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="menu-section">
                    <div className="menu-section-title">Compte</div>
                    <div className="menu-card">
                      {[
                        {icon:"👑",bg:"#FFF4E0",title:"Booster mes annonces",sub:"Soyez vu 10x plus · dès 500 FCFA",action:()=>setBoostItem({id:99,title:"Votre annonce",emoji:"📦",sellerInitial:"?",priceNum:0})},
                        {icon:"✨",bg:"linear-gradient(135deg,#f5f0ff,#ede8ff)",title:"BRADEO Premium",sub:"Débloquer toutes les fonctionnalités",action:()=>setPremiumScreen(true)},
                        {icon:"📊",bg:"#EEF4FF",title:"Statistiques",sub:"Vues, messages, performances",action:()=>setDashboard(true)},
                        {icon:"🤖",bg:"#F5F0FF",title:"Recommandations IA",sub:"Annonces sélectionnées pour toi",action:()=>setAiReco(true)},
                        {icon:"🗓",bg:"var(--g5)",title:"Historique transactions",sub:"Achats, ventes, paiements",action:()=>setHistory(true)},
                        {icon:"🔔",bg:"var(--g5)",title:"Notifications",sub:`${unreadNotifs} non lues`,action:()=>setTab("notifs")},
                        {icon:"⚙️",bg:"var(--g5)",title:"Paramètres",sub:"Apparence, confidentialité, compte",action:()=>setSettings(true)},
                        {icon:"🤝",bg:"var(--g5)",title:"Support & Aide",sub:"Chat avec notre assistant IA",action:()=>setSupportChat(true)},
                        {icon:"🚪",bg:"#FDF0EF",title:"Déconnexion",sub:"",action:()=>{setOnboarded(false);showToast("À bientôt !");}},
                      ].map((m,i)=>(
                        <div key={i} className="menu-item" onClick={m.action}>
                          <div className="menu-icon" style={{background:m.bg}}>{m.icon}</div>
                          <div className="menu-text"><div className="menu-title">{m.title}</div>{m.sub&&<div className="menu-sub">{m.sub}</div>}</div>
                          <Icon name="chevron" size={18} color="var(--ink4)"/>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div style={{height:8}}/>
                </div>
              </div>
            )}
          </div>

          {/* BOTTOM NAV */}
          {!chat && !payment && !premiumScreen && !supportChat && !settings && !sellerProfile && (
            <div className="navbar">
              {[{id:"home",label:"Accueil",icon:"home"},{id:"search",label:"Recherche",icon:"search"}].map(n=>(
                <div key={n.id} className={`nav-item ${tab===n.id&&!detail&&!mesAnnonces&&!dashboard&&!mapScreen&&!aiReco&&!history?"active":""}`} onClick={()=>{goHome();setTab(n.id);}}>
                  <div className="nav-icon"><Icon name={n.icon} size={22} color={tab===n.id&&!detail&&!mesAnnonces&&!dashboard&&!mapScreen&&!aiReco&&!history?"var(--g1)":"var(--ink3)"}/></div>
                  <span className="nav-label">{n.label}</span>
                </div>
              ))}
              <div className="nav-add" onClick={()=>{goHome();setTab("post");}}>
                <Icon name="plus" size={24}/>
              </div>
              {[{id:"messages",label:"Messages",icon:"msg",badge:unreadMsgs},{id:"profile",label:"Profil",icon:"user",badge:0}].map(n=>(
                <div key={n.id} className={`nav-item ${tab===n.id&&!detail&&!mesAnnonces&&!dashboard&&!mapScreen&&!aiReco&&!history?"active":""}`} onClick={()=>{goHome();setTab(n.id);}}>
                  <div className="nav-icon" style={{position:"relative"}}>
                    <Icon name={n.icon} size={22} color={tab===n.id&&!detail&&!mesAnnonces&&!dashboard&&!mapScreen&&!aiReco&&!history?"var(--g1)":"var(--ink3)"}/>
                    {n.badge>0&&<div className="nav-badge"/>}
                  </div>
                  <span className="nav-label">{n.label}</span>
                </div>
              ))}
            </div>
          )}

          <div className={`toast ${toast.show?"show":""} ${toast.type}`}>{toast.msg}</div>

          {/* SHARE SHEET */}
          {shareItem && (
            <div className="overlay" onClick={()=>setShareItem(null)}>
              <div className="bottom-sheet" onClick={e=>e.stopPropagation()}>
                <div className="sheet-handle"/>
                <div style={{fontFamily:"Syne,sans-serif",fontWeight:800,fontSize:18,marginBottom:4}}>Partager l'annonce</div>
                <div style={{fontSize:13,color:"var(--ink3)",marginBottom:16}}>Fais découvrir cette affaire !</div>
                <div className="share-preview">
                  <span style={{fontSize:36}}>{shareItem.emoji}</span>
                  <div style={{flex:1}}>
                    <div style={{fontSize:14,fontWeight:700}}>{shareItem.title}</div>
                    <div style={{fontSize:16,fontWeight:800,color:"var(--g1)",fontFamily:"Syne,sans-serif"}}>{shareItem.price} FCFA</div>
                    <div style={{fontSize:11,color:"var(--ink3)",marginTop:2}}>📍 {shareItem.commune}</div>
                  </div>
                </div>
                <div className="share-options">
                  {[
                    {icon:<Icon name="wa" size={28}/>,bg:"#25D366",label:"WhatsApp",action:()=>{showToast("✅ Partagé sur WhatsApp !","wa");setShareItem(null);}},
                    {icon:"🔗",bg:"var(--g5)",label:"Copier lien",action:()=>{showToast("📋 Lien copié !");setShareItem(null);}},
                    {icon:"📤",bg:"#E3F2FD",label:"Autres",action:()=>{showToast("📤 Partagé !");setShareItem(null);}},
                  ].map((o,i)=>(
                    <div key={i} className="share-option" onClick={o.action}>
                      <div className="share-option-icon" style={{background:o.bg}}>{o.icon}</div>
                      <span className="share-option-label">{o.label}</span>
                    </div>
                  ))}
                </div>
                <button className="sheet-cancel" onClick={()=>setShareItem(null)}>Annuler</button>
              </div>
            </div>
          )}

          {/* BOOST MODAL */}
          {boostItem && (
            <div className="overlay" onClick={()=>setBoostItem(null)}>
              <div className="bottom-sheet" onClick={e=>e.stopPropagation()}>
                <div className="sheet-handle"/>
                <div style={{textAlign:"center",marginBottom:20}}>
                  <div style={{fontSize:40,marginBottom:8}}>👑</div>
                  <div style={{fontFamily:"Syne,sans-serif",fontSize:22,fontWeight:800}}>Booster l'annonce</div>
                  <div style={{fontSize:13,color:"var(--ink3)",marginTop:4}}>Soyez vu en premier · Vendez plus vite</div>
                </div>
                {BOOST_PLANS.map(p=>(
                  <div key={p.id} className={`boost-plan ${selectedPlan===p.id?"selected":""}`} onClick={()=>setSelectedPlan(p.id)}>
                    <div className="boost-plan-icon">{p.icon}</div>
                    <div className="boost-plan-text"><div className="boost-plan-name">{p.name}</div><div className="boost-plan-desc">{p.desc}</div></div>
                    <div style={{display:"flex",alignItems:"center",gap:6}}>
                      <div className="boost-plan-price">{p.price} F</div>
                      {selectedPlan===p.id&&<span style={{color:"var(--gold)",fontSize:16}}>✓</span>}
                    </div>
                  </div>
                ))}
                <button className="boost-cta" onClick={()=>{setBoostedIds(ids=>[...new Set([...ids,boostItem.id])]);showToast("🚀 Annonce boostée !","gold");setBoostItem(null);}}>
                  🚀 Activer le boost · {BOOST_PLANS.find(p=>p.id===selectedPlan)?.price} FCFA
                </button>
                <button className="sheet-cancel" onClick={()=>setBoostItem(null)}>Pas maintenant</button>
              </div>
            </div>
          )}

          {/* OFFER MODAL */}
          {offerItem && <OfferModal article={offerItem} onClose={()=>setOfferItem(null)} onSend={(amt)=>showToast(`💰 Offre de ${parseInt(amt).toLocaleString()} FCFA envoyée !`)}/>}

          {/* REVIEW MODAL */}
          {reviewItem && <ReviewModal article={reviewItem} onClose={()=>setReviewItem(null)} onSubmit={(stars,text,tags)=>showToast(`⭐ Avis ${stars}/5 publié ! Merci`)}/>}

          {/* REPORT MODAL */}
          {reportItem && <ReportModal item={reportItem} onClose={()=>setReportItem(null)} onSubmit={()=>showToast("🚩 Signalement envoyé. Merci !")}/>}

          {/* FILTER MODAL */}
          {showFilter && <FilterModal current={activeFilters} onClose={()=>setShowFilter(false)} onApply={(f)=>{setActiveFilters(f);showToast("✅ Filtres appliqués");}}/>}

        </div>
      </div>
    </>
  );
}
