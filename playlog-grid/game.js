// Playlog Grid: DOOH Dispatcher
// Realistic Flagship DOOH Asset Management (2026 Playlog Brand Guidelines)

(function() {
  'use strict';

  // --- REALISTIC CAMPAIGNS ROSTER ---
  const CAMPAIGNS = [
    { brand: 'Tokopedia WIB 15s', category: 'E-Commerce', sov: '16.6%' },
    { brand: 'BCA Priority Wealth 15s', category: 'Banking', sov: '16.6%' },
    { brand: 'Samsung Galaxy S26 15s', category: 'Consumer Tech', sov: '16.6%' },
    { brand: 'Unilever Clear Fresh 15s', category: 'FMCG', sov: '16.6%' },
    { brand: 'Gojek Instant On-Demand 15s', category: 'Mobility', sov: '16.6%' },
    { brand: 'Indomie HypeAbis 15s', category: 'Food & Beverage', sov: '16.6%' }
  ];

  // --- PLAYLOG BRAND PRODUCT LINES ---
  const FORMATS = {
    ROADSIDE: { 
      id: 'ROADSIDE', 
      name: 'Playlog Roadside', 
      color: '#36f1cd', // Playlog Green
      shape: 'trapezoid',
      desc: 'High-reach highway & arterial corridors'
    },
    TRANSIT: { 
      id: 'TRANSIT', 
      name: 'Playlog Transit', 
      color: '#fe7743', // Brand Transit Orange
      shape: 'flow',
      desc: 'Airport & train terminal network'
    },
    PLACEBASED: { 
      id: 'PLACEBASED', 
      name: 'Playlog Place-Based', 
      color: '#dc4648', // Brand Place-Based Red
      shape: 'square',
      desc: 'Precision commercial & mall screens'
    },
    AMBIENCE: { 
      id: 'AMBIENCE', 
      name: 'Playlog Ambience', 
      color: '#b771e5', // Brand Ambience Purple
      shape: 'radial',
      desc: 'Experiential CBD spectaculars'
    }
  };

  // --- REALISTIC 5 FLAGSHIP LANDMARK ASSETS (NO ENDLESS SCREEN SPAM) ---
  const LANDMARK_PRESETS = [
    {
      id: 1,
      name: 'Sudirman Landmark Megaboard',
      district: 'Sudirman Corridor',
      format: FORMATS.ROADSIDE,
      aspect: '16:9 Landscape',
      footfall: '480,000 / day',
      width: 44,
      height: 26,
      eCPM: 220,
      relX: -0.28,
      relY: -0.22
    },
    {
      id: 2,
      name: 'Thamrin Grand Videotron',
      district: 'Thamrin Plaza',
      format: FORMATS.PLACEBASED,
      aspect: 'Curved Wall 32:9',
      footfall: '390,000 / day',
      width: 48,
      height: 22,
      eCPM: 195,
      relX: 0.28,
      relY: -0.25
    },
    {
      id: 3,
      name: 'Bandara T3 LED Pillar',
      district: 'Airport Expressway',
      format: FORMATS.TRANSIT,
      aspect: '9:16 Vertical Totem',
      footfall: '290,000 / day',
      width: 22,
      height: 42,
      eCPM: 260,
      relX: -0.32,
      relY: 0.24
    },
    {
      id: 4,
      name: 'Pacific Place SCBD Spectacular',
      district: 'SCBD Avenue',
      format: FORMATS.AMBIENCE,
      aspect: 'Interactive Cube',
      footfall: '340,000 / day',
      width: 34,
      height: 34,
      eCPM: 240,
      relX: 0.30,
      relY: 0.22
    },
    {
      id: 5,
      name: 'Kuningan Flyover Digital',
      district: 'Kuningan Epicentrum',
      format: FORMATS.ROADSIDE,
      aspect: 'Double-Deck LED',
      footfall: '310,000 / day',
      width: 42,
      height: 24,
      eCPM: 180,
      relX: 0.0,
      relY: 0.35
    }
  ];

  // --- GAME STATE ---
  const state = {
    running: false,
    paused: false,
    gameSpeed: 1,
    score: 0,
    revenue: 8000,
    spentRevenue: 0,
    sla: 100,
    shift: 1,
    shiftTimer: 60,
    shiftDuration: 60,
    cableLimit: 4,
    basePacketSpeed: 190,
    nodes: [],
    cables: [],
    packets: [],
    floatingTexts: [],
    mobileTrucks: [],
    
    // Rush Hour Event
    rushDistrict: null,
    rushTimer: 0,

    // Upgrades
    purchases: {
      trunks: 0,
      bandwidth: 0,
      caches: 0,
      buffers: 0
    },

    costs: {
      trunk: 5000,
      bandwidth: 4000,
      cache: 10000,
      buffer: 6000
    },

    // Free Power-Ups Inventory
    inventory: {
      flush: 1,
      shield: 0,
      turbo: 0,
      surge: 0,
      sentinel: 1 // Starts with 1 free Self-Restore Sentinel!
    },

    buffs: {
      shieldTimer: 0,
      turboTimer: 0,
      surgeDeliveries: 0,
      sentinelTimer: 0 // Self-Restore AI Sentinel
    },

    // Interaction State
    dragSourceNode: null,
    mousePos: { x: 0, y: 0 },
    isDragging: false,
    inspectedNode: null
  };

  // --- CANVAS SETUP ---
  const canvas = document.getElementById('game-canvas');
  const ctx = canvas.getContext('2d');
  let animationFrameId = null;
  let lastTime = performance.now();

  function resizeCanvas() {
    const dpr = window.devicePixelRatio || 1;
    canvas.width = window.innerWidth * dpr;
    canvas.height = window.innerHeight * dpr;
    ctx.scale(dpr, dpr);
  }
  window.addEventListener('resize', resizeCanvas);
  resizeCanvas();

  // --- ENTITY CLASSES ---

  // 1. FLAGSHIP SCREEN & NODE
  class Node {
    constructor(preset, x, y, type = 'SCREEN') {
      this.type = type; // 'SSP_HUB', 'EDGE_CACHE', 'SCREEN'
      this.id = preset.id || 0;
      this.x = x;
      this.y = y;
      this.name = preset.name || 'Node';
      this.district = preset.district || 'Central';
      this.format = preset.format || FORMATS.ROADSIDE;
      this.aspect = preset.aspect || '16:9';
      this.footfall = preset.footfall || '300,000 / day';
      this.width = preset.width || 36;
      this.height = preset.height || 26;
      this.baseECPM = preset.eCPM || 180;
      this.radius = type === 'SSP_HUB' ? 36 : (type === 'EDGE_CACHE' ? 26 : Math.max(this.width, this.height) / 2 + 6);
      
      // Playlist Cache (Seconds)
      this.maxCache = 70; // 70 seconds of offline loop storage
      this.cache = 70;
      this.depleteRate = 1.35; // realistic playback consumption
      this.glitched = false;
      this.glitchTimer = 0;
      this.pulsePhase = Math.random() * Math.PI * 2;
      this.tier = 1;

      // Active Rotating Campaign
      this.campaignIndex = Math.floor(Math.random() * CAMPAIGNS.length);
      this.campaignTimer = 0;

      // Relay wireless zone
      this.wirelessRadius = 150;
    }

    update(dt) {
      this.pulsePhase += dt * 3;
      
      if (this.type === 'SCREEN') {
        // Rotating brand campaign every 12s
        this.campaignTimer += dt;
        if (this.campaignTimer >= 12) {
          this.campaignTimer = 0;
          this.campaignIndex = (this.campaignIndex + 1) % CAMPAIGNS.length;
        }

        // Cache consumption
        if (!this.glitched) {
          const decayMult = Math.pow(0.85, state.purchases.buffers);
          const rushMult = (state.rushDistrict === this.district) ? 1.35 : 1.0;
          this.cache -= this.depleteRate * decayMult * rushMult * dt;
          if (this.cache < 0) this.cache = 0;
        }

        // Glitch timer
        if (this.glitched) {
          this.glitchTimer -= dt;
        }

        // Self-Restore AI Sentinel Active: Autonomously heals glitches and refills low cache!
        if (state.buffs.sentinelTimer > 0) {
          if (this.glitched) {
            this.reboot();
            addFloatingText(this.x, this.y - 25, '🤖 AI AUTO-RESTORED', '#36f1cd');
          } else if (this.cache < 35) {
            this.cache = Math.min(this.maxCache, this.cache + 25);
            addFloatingText(this.x, this.y - 25, '🤖 SENTINEL TOP-UP (+25s)', '#36f1cd');
          }
        }
      }
    }

    upgradePriority() {
      const cost = 5000 * this.tier;
      if (state.revenue >= cost) {
        state.revenue -= cost;
        state.spentRevenue += cost;
        this.tier++;
        this.maxCache += 20;
        this.cache = this.maxCache;
        this.depleteRate *= 0.88;
        window.soundFX.playPurchase();
        addFloatingText(this.x, this.y - 25, `TIER ${this.tier} 4K!`, '#36f1cd');
        addTelemetry(`[TIER UPGRADE] ${this.name} upgraded to Tier ${this.tier} (+50% eCPM).`);
        updateHUD();
        updateInspector();
      } else {
        notEnoughCash(cost);
      }
    }

    fastSync() {
      const cost = 1200;
      if (state.revenue >= cost) {
        state.revenue -= cost;
        state.spentRevenue += cost;
        this.cache = Math.min(this.maxCache, this.cache + 30);
        this.glitched = false;
        window.soundFX.playPurchase();
        addFloatingText(this.x, this.y - 20, '+30s FAST-SYNC', '#36f1cd');
        addTelemetry(`[FAST-SYNC] ${this.name} playlist loop topped up.`);
        updateHUD();
        updateInspector();
      } else {
        notEnoughCash(cost);
      }
    }

    reboot() {
      if (this.glitched) {
        this.glitched = false;
        this.cache = Math.max(this.cache, 45);
        addTelemetry(`[TELEMETRY RECOVERED] ${this.name} player re-authenticated.`);
        window.soundFX.playConnect();
        addFloatingText(this.x, this.y - 20, 'REBOOTED', '#36f1cd');
        updateInspector();
      }
    }

    draw(ctx) {
      ctx.save();
      
      // 1. MASTER PLAYLOG SSP HUB
      if (this.type === 'SSP_HUB') {
        const glow = Math.sin(this.pulsePhase) * 6 + 14;
        
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.wirelessRadius, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(74, 179, 244, 0.15)';
        ctx.lineWidth = 1;
        ctx.setLineDash([4, 6]);
        ctx.stroke();
        ctx.setLineDash([]);

        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius + glow, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(0, 77, 159, 0.1)';
        ctx.fill();

        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = '#004d9f';
        ctx.strokeStyle = '#36f1cd';
        ctx.lineWidth = 3;
        ctx.shadowColor = '#36f1cd';
        ctx.shadowBlur = 18;
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 11px "Reddit Sans", sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('PLAYLOG', this.x, this.y - 5);
        ctx.fillStyle = '#36f1cd';
        ctx.font = 'bold 9px "Reddit Sans", sans-serif';
        ctx.fillText('SSP HUB', this.x, this.y + 7);
      } 
      // 2. DISTRICT EDGE RELAY
      else if (this.type === 'EDGE_CACHE') {
        const wave = (Date.now() / 30) % this.wirelessRadius;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.wirelessRadius, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(54, 241, 205, 0.18)';
        ctx.lineWidth = 1.2;
        ctx.setLineDash([5, 5]);
        ctx.stroke();
        ctx.setLineDash([]);

        ctx.beginPath();
        ctx.arc(this.x, this.y, wave, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(54, 241, 205, ${1 - wave / this.wirelessRadius})`;
        ctx.lineWidth = 1;
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = '#081f3d';
        ctx.strokeStyle = '#36f1cd';
        ctx.lineWidth = 2.5;
        ctx.shadowColor = '#36f1cd';
        ctx.shadowBlur = 12;
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = '#36f1cd';
        ctx.font = 'bold 9.5px "Reddit Sans", sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('DISTRICT', this.x, this.y - 5);
        ctx.fillText('RELAY', this.x, this.y + 6);
      } 
      // 3. REALISTIC LANDMARK DOOH SCREEN
      else {
        const w = this.width;
        const h = this.height;
        const isRush = state.rushDistrict === this.district;

        // Rush Hour Glow
        if (isRush) {
          ctx.beginPath();
          ctx.roundRect(this.x - w / 2 - 8, this.y - h / 2 - 8, w + 16, h + 16, 8);
          ctx.fillStyle = 'rgba(254, 119, 67, 0.2)';
          ctx.fill();
        }

        // Screen Mounting Pole / Stand
        ctx.fillStyle = '#091b35';
        ctx.fillRect(this.x - 3, this.y + h / 2, 6, 14);

        // Screen Outer Bezel Frame
        let borderColor = this.format.color;
        let screenBg = '#050f20';

        if (this.glitched) {
          borderColor = '#dc4648';
          screenBg = 'rgba(220, 70, 72, 0.25)';
        } else if (this.tier > 1) {
          borderColor = '#36f1cd';
        }

        ctx.beginPath();
        ctx.roundRect(this.x - w / 2, this.y - h / 2, w, h, 4);
        ctx.fillStyle = screenBg;
        ctx.strokeStyle = borderColor;
        ctx.lineWidth = this.tier > 1 ? 2.5 : 1.8;
        ctx.shadowColor = borderColor;
        ctx.shadowBlur = this.cache < 18 ? 14 : 8;
        ctx.fill();
        ctx.stroke();

        // Screen Content Preview (Rotating Campaign brand)
        if (!this.glitched) {
          const currentCampaign = CAMPAIGNS[this.campaignIndex];
          ctx.fillStyle = this.format.color;
          ctx.font = 'bold 7.5px "Reddit Sans", sans-serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(currentCampaign.brand.split(' ')[0], this.x, this.y - 2);

          // Small Format Icon
          drawBrandFormatIcon(ctx, this.x, this.y + 6, this.format, 4.5);
        } else {
          ctx.fillStyle = '#dc4648';
          ctx.font = 'bold 8.5px "Reddit Sans", sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText('GLITCH', this.x, this.y);
        }

        // Circular Cache Gauge
        const cacheRatio = Math.max(0, this.cache / this.maxCache);
        const radiusGauge = Math.max(w, h) / 2 + 7;
        ctx.beginPath();
        ctx.arc(this.x, this.y, radiusGauge, -Math.PI / 2, (-Math.PI / 2) + (Math.PI * 2 * cacheRatio));
        ctx.strokeStyle = this.cache < 18 ? '#dc4648' : (this.cache < 35 ? '#fe7743' : this.format.color);
        ctx.lineWidth = 3;
        ctx.lineCap = 'round';
        ctx.stroke();

        // Countdown timer badge above screen
        ctx.fillStyle = this.cache < 18 ? '#dc4648' : (this.cache < 35 ? '#fe7743' : '#36f1cd');
        ctx.font = 'bold 10px "JetBrains Mono", monospace';
        ctx.textAlign = 'center';
        ctx.fillText(`${Math.ceil(this.cache)}s`, this.x, this.y - radiusGauge - 5);

        // Tier / Aspect Badge
        if (this.tier > 1) {
          ctx.fillStyle = '#36f1cd';
          ctx.font = 'bold 8.5px "JetBrains Mono", monospace';
          ctx.fillText(`T${this.tier} 4K`, this.x + w / 2 + 16, this.y - 4);
        }
      }

      // Screen Landmark Name & Footfall
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 10.5px "Reddit Sans", sans-serif';
      ctx.textAlign = 'center';
      ctx.shadowBlur = 0;
      ctx.fillText(this.name, this.x, this.y + this.radius + 18);

      ctx.fillStyle = '#9cb3d3';
      ctx.font = '9px "Reddit Sans", sans-serif';
      ctx.fillText(`${this.footfall} • ${this.format.name}`, this.x, this.y + this.radius + 30);

      ctx.restore();
    }
  }

  // --- DRAW OFFICIAL BRAND LOGOGRAMS (Page 22-25) ---
  function drawBrandFormatIcon(ctx, x, y, format, size) {
    ctx.save();
    ctx.fillStyle = format.color;
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1;

    if (format.shape === 'trapezoid') {
      ctx.beginPath();
      ctx.moveTo(x - size * 0.7, y - size);
      ctx.lineTo(x + size * 0.7, y - size);
      ctx.lineTo(x + size * 1.2, y + size);
      ctx.lineTo(x - size * 1.2, y + size);
      ctx.closePath();
      ctx.fill();
    } else if (format.shape === 'flow') {
      ctx.beginPath();
      ctx.moveTo(x - size * 1.1, y - size * 0.6);
      ctx.bezierCurveTo(x, y - size * 1.2, x, y + size * 1.2, x + size * 1.1, y + size * 0.6);
      ctx.strokeStyle = format.color;
      ctx.lineWidth = 2.5;
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(x, y, size * 0.45, 0, Math.PI * 2);
      ctx.fillStyle = format.color;
      ctx.fill();
    } else if (format.shape === 'square') {
      ctx.fillRect(x - size * 0.9, y - size * 0.9, size * 1.8, size * 1.8);
      ctx.strokeRect(x - size * 0.9, y - size * 0.9, size * 1.8, size * 1.8);
    } else if (format.shape === 'radial') {
      ctx.beginPath();
      ctx.arc(x, y, size * 1.05, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(x, y, size * 0.4, 0, Math.PI * 2);
      ctx.fillStyle = '#07152b';
      ctx.fill();
    }

    ctx.restore();
  }

  // 2. STICKEARN ROAMING MOBILE-LED TRUCK
  class MobileLEDTruck {
    constructor(id) {
      this.id = id;
      this.x = 100;
      this.y = 100;
      this.targetX = 300;
      this.targetY = 300;
      this.speed = 68;
      this.syncTimer = 0;
      this.syncingNode = null;
      this.cache = 50;
      this.maxCache = 50;
      this.chooseNextDestination();
    }

    chooseNextDestination() {
      // Pick one of the 5 landmark screens to drive to
      const screens = state.nodes.filter(n => n.type === 'SCREEN');
      if (screens.length > 0) {
        const target = screens[Math.floor(Math.random() * screens.length)];
        this.targetX = target.x + (Math.random() - 0.5) * 70;
        this.targetY = target.y + (Math.random() - 0.5) * 70;
      }
    }

    update(dt) {
      const dx = this.targetX - this.x;
      const dy = this.targetY - this.y;
      const dist = Math.hypot(dx, dy);

      if (dist < 20) {
        this.chooseNextDestination();
      } else {
        this.x += (dx / dist) * this.speed * dt * state.gameSpeed;
        this.y += (dy / dist) * this.speed * dt * state.gameSpeed;
      }

      this.syncingNode = null;
      const transmitters = state.nodes.filter(n => n.type === 'SSP_HUB' || n.type === 'EDGE_CACHE');
      for (const t of transmitters) {
        if (Math.hypot(t.x - this.x, t.y - this.y) <= t.wirelessRadius) {
          this.syncingNode = t;
          break;
        }
      }

      if (this.syncingNode) {
        this.syncTimer += dt * state.gameSpeed;
        if (this.syncTimer >= 1.8) {
          this.syncTimer = 0;
          this.deliverMobileImpression();
        }
      }
    }

    deliverMobileImpression() {
      const rev = Math.floor(Math.random() * 800 + 2600);
      state.revenue += rev;
      state.score += 2;
      this.cache = this.maxCache;
      window.soundFX.playImpression(5);
      addFloatingText(this.x, this.y - 18, `+$${rev.toLocaleString()} MOBILE-LED!`, '#36f1cd');
      addTelemetry(`[MOBILE-LED SYNC] Truck #${this.id} beamed playlog via ${this.syncingNode.name}.`);
      updateHUD();
    }

    honkAndBoost() {
      window.soundFX.playHonk();
      const bonus = 3500;
      state.revenue += bonus;
      this.speed = 125;
      setTimeout(() => { this.speed = 68; }, 4000);
      addFloatingText(this.x, this.y - 25, `HONK! +$${bonus.toLocaleString()} RECALL!`, '#36f1cd');
      addTelemetry(`[ROADSIDE RECALL] StickEarn MobileLED #${this.id} triggered roadside recall.`);
      updateHUD();
    }

    draw(ctx) {
      ctx.save();

      if (this.syncingNode) {
        ctx.beginPath();
        ctx.moveTo(this.syncingNode.x, this.syncingNode.y);
        ctx.lineTo(this.x, this.y);
        ctx.strokeStyle = '#36f1cd';
        ctx.lineWidth = 2;
        ctx.setLineDash([4, 6]);
        ctx.stroke();
        ctx.setLineDash([]);
      }

      const tw = 40;
      const th = 22;

      // Trailer Screen
      ctx.fillStyle = '#07152b';
      ctx.strokeStyle = '#36f1cd';
      ctx.lineWidth = 1.8;
      ctx.shadowColor = '#36f1cd';
      ctx.shadowBlur = 10;
      ctx.fillRect(this.x - tw / 2, this.y - th / 2, tw - 10, th);
      ctx.strokeRect(this.x - tw / 2, this.y - th / 2, tw - 10, th);

      // Digital Screen inside
      ctx.fillStyle = '#36f1cd';
      ctx.fillRect(this.x - tw / 2 + 3, this.y - th / 2 + 3, tw - 16, th - 6);

      // Cab front
      ctx.fillStyle = '#4ab3f4';
      ctx.fillRect(this.x + tw / 2 - 10, this.y - th / 2 + 2, 8, th - 4);

      // Wheels
      ctx.fillStyle = '#030a17';
      ctx.fillRect(this.x - tw / 2 + 4, this.y + th / 2, 6, 3);
      ctx.fillRect(this.x - tw / 2 + 14, this.y + th / 2, 6, 3);
      ctx.fillRect(this.x + tw / 2 - 8, this.y + th / 2, 6, 3);

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 9px "Reddit Sans", sans-serif';
      ctx.textAlign = 'center';
      ctx.shadowBlur = 0;
      ctx.fillText(`MobileLED #${this.id}`, this.x, this.y + th + 10);

      ctx.restore();
    }
  }

  // 3. CABLE CLASS
  class Cable {
    constructor(nodeA, nodeB) {
      this.nodeA = nodeA;
      this.nodeB = nodeB;
      this.active = true;
    }

    draw(ctx) {
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(this.nodeA.x, this.nodeA.y);
      ctx.lineTo(this.nodeB.x, this.nodeB.y);
      ctx.strokeStyle = 'rgba(74, 179, 244, 0.2)';
      ctx.lineWidth = 6;
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(this.nodeA.x, this.nodeA.y);
      ctx.lineTo(this.nodeB.x, this.nodeB.y);
      ctx.strokeStyle = '#4ab3f4';
      ctx.lineWidth = 2.2;
      ctx.shadowColor = '#4ab3f4';
      ctx.shadowBlur = 8;
      ctx.stroke();

      ctx.restore();
    }
  }

  // 4. PACKET CLASS
  class Packet {
    constructor(fromNode, toNode, format) {
      this.fromNode = fromNode;
      this.toNode = toNode;
      this.format = format;
      this.progress = 0;
      
      const dist = Math.hypot(toNode.x - fromNode.x, toNode.y - fromNode.y);
      const speedMult = (1 + state.purchases.bandwidth * 0.25) * (state.buffs.turboTimer > 0 ? 3 : 1);
      this.speed = (state.basePacketSpeed * speedMult) / Math.max(dist, 1);
    }

    update(dt) {
      this.progress += this.speed * dt * state.gameSpeed;
      if (this.progress >= 1) {
        this.progress = 1;
        this.deliver();
        return true;
      }
      return false;
    }

    deliver() {
      if (this.toNode.type === 'SCREEN') {
        if (this.toNode.glitched && state.buffs.shieldTimer <= 0) {
          addFloatingText(this.toNode.x, this.toNode.y, 'DROPPED: GLITCH', '#dc4648');
          return;
        }

        const match = this.toNode.format.id === this.format.id;
        const addCache = match ? 30 : 12;
        this.toNode.cache = Math.min(this.toNode.maxCache, this.toNode.cache + addCache);

        state.score++;
        let rev = this.toNode.baseECPM + Math.floor(Math.random() * 30);
        if (this.toNode.tier > 1) rev *= (1 + this.toNode.tier * 0.5);
        if (state.rushDistrict === this.toNode.district) rev *= 2.5;
        if (state.buffs.surgeDeliveries > 0) {
          rev *= 3;
          state.buffs.surgeDeliveries--;
          if (state.buffs.surgeDeliveries === 0) updateActiveBuffIndicators();
        }

        state.revenue += Math.round(rev);
        const currentCampaign = CAMPAIGNS[this.toNode.campaignIndex];
        window.soundFX.playImpression(state.score % 6 + 1);
        addFloatingText(this.toNode.x, this.toNode.y - 12, `+$${Math.round(rev).toLocaleString()} (${currentCampaign.brand.split(' ')[0]})`, '#36f1cd');
        addTelemetry(`[PLAYLOG VERIFIED] ${this.toNode.name}: ${currentCampaign.brand} (${currentCampaign.sov} SOV)`);
        updateInspector();
      } else if (this.toNode.type === 'EDGE_CACHE') {
        forwardFromCache(this.toNode, this.format);
      }
    }

    draw(ctx) {
      const curX = this.fromNode.x + (this.toNode.x - this.fromNode.x) * this.progress;
      const curY = this.fromNode.y + (this.toNode.y - this.fromNode.y) * this.progress;

      ctx.save();
      ctx.shadowColor = this.format.color;
      ctx.shadowBlur = 10;
      drawBrandFormatIcon(ctx, curX, curY, this.format, 5.5);
      ctx.restore();
    }
  }

  // --- FLOATING TEXT ---
  function addFloatingText(x, y, text, color = '#ffffff') {
    state.floatingTexts.push({ x, y, text, color, alpha: 1, vy: -24 });
  }

  function updateFloatingTexts(dt) {
    for (let i = state.floatingTexts.length - 1; i >= 0; i--) {
      const ft = state.floatingTexts[i];
      ft.y += ft.vy * dt;
      ft.alpha -= 0.85 * dt;
      if (ft.alpha <= 0) state.floatingTexts.splice(i, 1);
    }
  }

  function drawFloatingTexts(ctx) {
    ctx.save();
    ctx.font = 'bold 11px "Reddit Sans", sans-serif';
    ctx.textAlign = 'center';
    state.floatingTexts.forEach(ft => {
      ctx.fillStyle = ft.color;
      ctx.globalAlpha = Math.max(0, ft.alpha);
      ctx.fillText(ft.text, ft.x, ft.y);
    });
    ctx.restore();
  }

  function addTelemetry(msg) {
    const container = document.getElementById('live-telemetry');
    if (!container) return;
    const el = document.createElement('div');
    el.className = 'telemetry-log';
    el.innerText = msg;
    container.prepend(el);
    while (container.children.length > 5) {
      container.removeChild(container.lastChild);
    }
  }

  // --- PACKET DISPATCH ENGINE ---
  let packetDispatchTimer = 0;
  function handlePacketDispatch(dt) {
    packetDispatchTimer += dt * state.gameSpeed;
    if (packetDispatchTimer >= 1.05) {
      packetDispatchTimer = 0;
      dispatchFromSSP();
    }
  }

  function dispatchFromSSP() {
    const sspNode = state.nodes.find(n => n.type === 'SSP_HUB');
    if (!sspNode) return;

    const neighbors = getConnectedNeighbors(sspNode);
    if (neighbors.length === 0) return;

    neighbors.forEach(target => {
      let format = target.format || FORMATS.ROADSIDE;
      if (target.type === 'EDGE_CACHE') {
        const keys = Object.keys(FORMATS);
        format = FORMATS[keys[Math.floor(Math.random() * keys.length)]];
      }
      state.packets.push(new Packet(sspNode, target, format));
    });
  }

  function forwardFromCache(cacheNode, format) {
    const neighbors = getConnectedNeighbors(cacheNode).filter(n => n.type === 'SCREEN');
    if (neighbors.length === 0) return;
    neighbors.sort((a, b) => a.cache - b.cache);
    state.packets.push(new Packet(cacheNode, neighbors[0], format));
  }

  function getConnectedNeighbors(node) {
    const list = [];
    state.cables.forEach(c => {
      if (c.nodeA === node) list.push(c.nodeB);
      else if (c.nodeB === node) list.push(c.nodeA);
    });
    return list;
  }

  // --- RUSH HOUR DYNAMIC EVENT ---
  let rushEventTimer = 0;
  function handleRushHourEvents(dt) {
    if (state.rushDistrict) {
      state.rushTimer -= dt;
      if (state.rushTimer <= 0) {
        state.rushDistrict = null;
        document.getElementById('event-banner').classList.remove('active');
        addTelemetry('[RUSH ENDED] Metropolitan traffic stabilized.');
      }
    } else {
      rushEventTimer += dt;
      if (rushEventTimer >= 45) {
        rushEventTimer = 0;
        triggerRushHour();
      }
    }
  }

  function triggerRushHour() {
    const screens = state.nodes.filter(n => n.type === 'SCREEN');
    if (screens.length === 0) return;

    const chosen = screens[Math.floor(Math.random() * screens.length)].district;
    state.rushDistrict = chosen;
    state.rushTimer = 22;

    const banner = document.getElementById('event-banner');
    banner.innerText = `🔥 RUSH HOUR: ${chosen.toUpperCase()} (2.5x eCPM SURGE!)`;
    banner.classList.add('active');
    window.soundFX.playShiftUpgrade();
    addTelemetry(`[EVENT ACTIVE] Prime time traffic surge in ${chosen}!`);
  }

  // --- INCIDENTS ---
  let incidentTimer = 0;
  function handleIncidents(dt) {
    if (state.buffs.shieldTimer > 0 || state.buffs.sentinelTimer > 0) return;

    incidentTimer += dt * state.gameSpeed;
    if (incidentTimer >= 24) {
      incidentTimer = 0;
      triggerRandomIncident();
    }
  }

  function triggerRandomIncident() {
    const screens = state.nodes.filter(n => n.type === 'SCREEN' && !n.glitched);
    if (screens.length === 0) return;

    const target = screens[Math.floor(Math.random() * screens.length)];
    target.glitched = true;
    target.glitchTimer = 10;

    window.soundFX.playWarning();
    addFloatingText(target.x, target.y - 20, 'FIRMWARE GLITCH!', '#dc4648');
    addTelemetry(`[INCIDENT] ${target.name} player unresponsive. Tap to reboot!`);
    updateInspector();
  }

  // --- SLA CALCULATION ---
  function updateSLA(dt) {
    if (state.buffs.shieldTimer > 0) {
      state.sla = 100;
      return;
    }

    const screens = state.nodes.filter(n => n.type === 'SCREEN');
    if (screens.length === 0) return;

    let satisfiedScreens = 0;
    screens.forEach(s => {
      if (s.cache > 15 && !s.glitched) satisfiedScreens++;
    });

    const targetSLA = (satisfiedScreens / screens.length) * 100;
    state.sla += (targetSLA - state.sla) * (dt * 1.5);
    state.sla = Math.max(0, Math.min(100, state.sla));

    const slaEl = document.getElementById('stat-sla');
    if (slaEl) {
      slaEl.innerText = `${Math.round(state.sla)}%`;
      slaEl.className = 'stat-val ' + (state.sla >= 90 ? 'sla-healthy' : (state.sla >= 70 ? 'sla-warning' : 'sla-danger'));
    }

    if (state.sla < 50) {
      triggerGameOver('SLA BREACH: Network reliability dipped below 50%. Enterprise advertisers halted campaigns.');
    }
  }

  // --- ACTIVE POWER-UP TIMERS ---
  function updateBuffs(dt) {
    if (state.buffs.shieldTimer > 0) {
      state.buffs.shieldTimer -= dt;
      if (state.buffs.shieldTimer <= 0) {
        state.buffs.shieldTimer = 0;
        addTelemetry('[SHIELD EXPIRED] Uptime shield offline.');
      }
    }

    if (state.buffs.turboTimer > 0) {
      state.buffs.turboTimer -= dt;
      if (state.buffs.turboTimer <= 0) {
        state.buffs.turboTimer = 0;
        addTelemetry('[TURBO EXPIRED] Routing speed normalized.');
      }
    }

    if (state.buffs.sentinelTimer > 0) {
      state.buffs.sentinelTimer -= dt;
      if (state.buffs.sentinelTimer <= 0) {
        state.buffs.sentinelTimer = 0;
        addTelemetry('[SENTINEL EXPIRED] AI Autonomous Maintenance protocol completed.');
      }
    }

    updateActiveBuffIndicators();
  }

  function updateActiveBuffIndicators() {
    const container = document.getElementById('active-powerup-indicator');
    if (!container) return;
    container.innerHTML = '';

    if (state.buffs.shieldTimer > 0) {
      const pill = document.createElement('div');
      pill.className = 'powerup-pill';
      pill.innerHTML = `🛡️ Uptime Shield (${Math.ceil(state.buffs.shieldTimer)}s)`;
      container.appendChild(pill);
    }
    if (state.buffs.sentinelTimer > 0) {
      const pill = document.createElement('div');
      pill.className = 'powerup-pill';
      pill.style.borderColor = '#36f1cd';
      pill.style.color = '#36f1cd';
      pill.innerHTML = `🤖 AI Sentinel Active (${Math.ceil(state.buffs.sentinelTimer)}s)`;
      container.appendChild(pill);
    }
    if (state.buffs.turboTimer > 0) {
      const pill = document.createElement('div');
      pill.className = 'powerup-pill';
      pill.style.borderColor = '#4ab3f4';
      pill.style.color = '#4ab3f4';
      pill.innerHTML = `⚡ 3x Hyper-Routing (${Math.ceil(state.buffs.turboTimer)}s)`;
      container.appendChild(pill);
    }
    if (state.buffs.surgeDeliveries > 0) {
      const pill = document.createElement('div');
      pill.className = 'powerup-pill';
      pill.style.borderColor = '#fe7743';
      pill.style.color = '#fe7743';
      pill.innerHTML = `💎 3x eCPM Surge (${state.buffs.surgeDeliveries} left)`;
      container.appendChild(pill);
    }
  }

  // --- TRIGGER POWER-UPS ---
  window.triggerPowerUp = function(type) {
    if ((state.inventory[type] || 0) <= 0) {
      addTelemetry(`[POWER-UP] No ${type} units available.`);
      window.soundFX.playWarning();
      return;
    }

    state.inventory[type]--;

    if (type === 'sentinel') {
      state.buffs.sentinelTimer = 40; // 40 seconds of autonomous self-restore!
      window.soundFX.playSelfRestore();
      state.nodes.forEach(n => {
        if (n.type === 'SCREEN') {
          n.glitched = false;
          n.cache = Math.max(n.cache, 50);
        }
      });
      addFloatingText(window.innerWidth / 2, window.innerHeight / 2, '🤖 AI SELF-RESTORE SENTINEL ENGAGED!', '#36f1cd');
      addTelemetry('[SENTINEL ACTIVE] Autonomous AI maintenance bots deployed across all screens (40s).');
    } else if (type === 'flush') {
      window.soundFX.playPowerUpTrigger();
      state.nodes.forEach(n => {
        if (n.type === 'SCREEN') {
          n.cache = n.maxCache;
          n.glitched = false;
        }
      });
      addFloatingText(window.innerWidth / 2, window.innerHeight / 2, '⚡ FULL NETWORK CACHE RESTORED!', '#36f1cd');
      addTelemetry('[POWER-UP] Full playlist caches restored to 100%.');
    } else if (type === 'shield') {
      window.soundFX.playPowerUpTrigger();
      state.buffs.shieldTimer = 35;
      state.nodes.forEach(n => n.glitched = false);
      addFloatingText(window.innerWidth / 2, window.innerHeight / 2, '🛡️ UPTIME SHIELD ENGAGED!', '#4ab3f4');
      addTelemetry('[POWER-UP] 35s Uptime Shield active.');
    } else if (type === 'turbo') {
      window.soundFX.playPowerUpTrigger();
      state.buffs.turboTimer = 22;
      addFloatingText(window.innerWidth / 2, window.innerHeight / 2, '⚡ 3X HYPER-SPEED ENGAGED!', '#fe7743');
      addTelemetry('[POWER-UP] 3x Hyper-Routing active for 22s.');
    } else if (type === 'surge') {
      window.soundFX.playPowerUpTrigger();
      state.buffs.surgeDeliveries = 50;
      addFloatingText(window.innerWidth / 2, window.innerHeight / 2, '💎 3X eCPM SURGE ACTIVE!', '#b771e5');
      addTelemetry('[POWER-UP] Next 50 playlogs payout 300% eCPM.');
    }

    updateHUD();
    updateInspector();
  };

  // --- INFRASTRUCTURE UPGRADES ---
  window.buyUpgrade = function(type) {
    if (type === 'trunk') {
      const cost = state.costs.trunk + (state.purchases.trunks * 3000);
      if (state.revenue >= cost) {
        state.revenue -= cost;
        state.purchases.trunks++;
        state.cableLimit++;
        window.soundFX.playPurchase();
        addTelemetry(`[INFRASTRUCTURE] +1 Active Trunk Cable (Now ${state.cableLimit}).`);
        updateHUD();
      } else {
        notEnoughCash(cost);
      }
    } else if (type === 'bandwidth') {
      const cost = state.costs.bandwidth + (state.purchases.bandwidth * 2500);
      if (state.revenue >= cost) {
        state.revenue -= cost;
        state.purchases.bandwidth++;
        window.soundFX.playPurchase();
        addTelemetry(`[INFRASTRUCTURE] +25% Fiber Transmission Velocity.`);
        updateHUD();
      } else {
        notEnoughCash(cost);
      }
    } else if (type === 'cache') {
      const cost = state.costs.cache;
      if (state.revenue >= cost) {
        state.revenue -= cost;
        state.purchases.caches++;
        spawnEdgeRelay();
        window.soundFX.playPurchase();
        addTelemetry(`[INFRASTRUCTURE] District Edge Relay deployed with wireless sync.`);
        updateHUD();
      } else {
        notEnoughCash(cost);
      }
    } else if (type === 'buffer') {
      const cost = state.costs.buffer + (state.purchases.buffers * 3500);
      if (state.revenue >= cost) {
        state.revenue -= cost;
        state.purchases.buffers++;
        state.nodes.forEach(n => {
          if (n.type === 'SCREEN') {
            n.maxCache += 20;
            n.cache = Math.min(n.maxCache, n.cache + 20);
          }
        });
        window.soundFX.playPurchase();
        addTelemetry(`[INFRASTRUCTURE] Screen storage expanded (+20s cap, -15% drain).`);
        updateHUD();
      } else {
        notEnoughCash(cost);
      }
    }
  };

  function notEnoughCash(needed) {
    window.soundFX.playWarning();
    addTelemetry(`[INSUFFICIENT FUNDS] Need $${needed.toLocaleString()} for this upgrade.`);
    addFloatingText(window.innerWidth / 2, window.innerHeight - 90, `NEED $${needed.toLocaleString()}!`, '#dc4648');
  }

  function spawnEdgeRelay() {
    const ssp = state.nodes.find(n => n.type === 'SSP_HUB');
    const x = ssp ? ssp.x + (Math.random() > 0.5 ? 200 : -200) : window.innerWidth / 2;
    const y = ssp ? ssp.y + (Math.random() > 0.5 ? 130 : -130) : window.innerHeight / 2;
    const cacheNode = new Node({ id: state.purchases.caches, name: `District Relay #${state.purchases.caches}` }, x, y, 'EDGE_CACHE');
    state.nodes.push(cacheNode);
    addFloatingText(x, y - 20, 'DISTRICT RELAY DEPLOYED', '#36f1cd');
    window.soundFX.playConnect();
  }

  // --- INTERACTIVE NODE INSPECTOR POPOVER ---
  function openInspector(node, screenX, screenY) {
    state.inspectedNode = node;
    const panel = document.getElementById('node-inspector');
    panel.style.left = `${Math.min(window.innerWidth - 320, Math.max(10, screenX + 15))}px`;
    panel.style.top = `${Math.min(window.innerHeight - 270, Math.max(80, screenY - 50))}px`;
    panel.classList.add('active');
    updateInspector();
  }

  window.closeInspector = function() {
    state.inspectedNode = null;
    document.getElementById('node-inspector').classList.remove('active');
  };

  function updateInspector() {
    const node = state.inspectedNode;
    if (!node) return;

    document.getElementById('inspect-name').innerText = node.name;
    const badge = document.getElementById('inspect-format');
    badge.innerText = node.format ? node.format.name : node.type;
    badge.style.color = node.format ? node.format.color : '#36f1cd';
    badge.style.border = `1px solid ${node.format ? node.format.color : '#36f1cd'}`;

    document.getElementById('inspect-aspect').innerText = node.aspect;
    document.getElementById('inspect-footfall').innerText = node.footfall;

    const currentCampaign = CAMPAIGNS[node.campaignIndex];
    document.getElementById('inspect-campaign').innerText = currentCampaign ? `${currentCampaign.brand}` : 'Rotating Ad Loop';

    const percent = Math.round((node.cache / node.maxCache) * 100);
    document.getElementById('inspect-cache-val').innerText = `${Math.ceil(node.cache)}s / ${node.maxCache}s (${percent}%)`;
    const fill = document.getElementById('inspect-cache-fill');
    fill.style.width = `${percent}%`;
    fill.style.background = node.cache < 18 ? '#dc4648' : (node.cache < 35 ? '#fe7743' : '#36f1cd');

    const upgradeCost = 5000 * node.tier;
    const btnUpgrade = document.getElementById('btn-inspect-upgrade');
    btnUpgrade.innerHTML = `<span>🚀 Tier ${node.tier + 1} 4K Upgrade</span><span>$${upgradeCost.toLocaleString()}</span>`;
    btnUpgrade.disabled = state.revenue < upgradeCost;

    const btnSync = document.getElementById('btn-inspect-sync');
    btnSync.disabled = state.revenue < 1200;

    const btnReboot = document.getElementById('btn-inspect-reboot');
    btnReboot.style.display = node.glitched ? 'flex' : 'none';
  }

  window.inspectFastSync = function() {
    if (state.inspectedNode) state.inspectedNode.fastSync();
  };

  window.inspectUpgradePriority = function() {
    if (state.inspectedNode) state.inspectedNode.upgradePriority();
  };

  window.inspectReboot = function() {
    if (state.inspectedNode) state.inspectedNode.reboot();
  };

  // --- SHIFTS & LEVEL UP ---
  function updateShift(dt) {
    state.shiftTimer -= dt * state.gameSpeed;
    const timerEl = document.getElementById('stat-timer');
    if (timerEl) {
      timerEl.innerText = `${Math.ceil(Math.max(0, state.shiftTimer))}s`;
    }

    if (state.shiftTimer <= 0) {
      state.shiftTimer = state.shiftDuration;
      state.shift++;

      if (state.shift % 2 === 0 && state.mobileTrucks.length < 3) {
        state.mobileTrucks.push(new MobileLEDTruck(state.mobileTrucks.length + 1));
        addTelemetry('[FLEET EXPANSION] Additional StickEarn MobileLED truck dispatched.');
      }

      showLevelUpModal();
    }
  }

  function showLevelUpModal() {
    state.paused = true;
    window.soundFX.playShiftUpgrade();

    const overlay = document.getElementById('upgrade-modal');
    const titleEl = document.getElementById('upgrade-shift-title');
    const container = document.getElementById('upgrade-options');

    titleEl.innerText = `Shift ${state.shift - 1} Level Up!`;

    const powerUpChoices = [
      {
        id: 'sentinel',
        title: 'AI Self-Restore Sentinel',
        desc: 'Autonomous maintenance protocol (40s): Automatically heals glitches and refills low buffers on all screens.',
        icon: '🤖',
        badge: 'FREE POWER-UP',
        apply: () => {
          state.inventory.sentinel++;
          addTelemetry('[REWARD] +1 AI Self-Restore Sentinel added.');
        }
      },
      {
        id: 'flush',
        title: 'Instant Buffer Flush',
        desc: 'Refills all screen playlist caches to 100% capacity across the network.',
        icon: '🌊',
        badge: 'FREE POWER-UP',
        apply: () => {
          state.inventory.flush++;
          addTelemetry('[REWARD] +1 Instant Buffer Flush added.');
        }
      },
      {
        id: 'shield',
        title: 'Zero-Glitch Uptime Shield',
        desc: '35 seconds of total firmware glitch immunity and 100% SLA lock.',
        icon: '🛡️',
        badge: 'FREE POWER-UP',
        apply: () => {
          state.inventory.shield++;
          addTelemetry('[REWARD] +1 Uptime Shield added.');
        }
      },
      {
        id: 'turbo',
        title: '3x Hyper-Routing Turbo',
        desc: 'All packet transmissions accelerate to 300% velocity for 22 seconds.',
        icon: '⚡',
        badge: 'FREE POWER-UP',
        apply: () => {
          state.inventory.turbo++;
          addTelemetry('[REWARD] +1 Hyper-Routing Turbo added.');
        }
      }
    ];

    container.innerHTML = '';
    powerUpChoices.forEach(opt => {
      const card = document.createElement('div');
      card.className = 'upgrade-item';
      card.innerHTML = `
        <span class="upgrade-badge">${opt.badge}</span>
        <div class="upgrade-icon">${opt.icon}</div>
        <div class="upgrade-title">${opt.title}</div>
        <div class="upgrade-desc">${opt.desc}</div>
      `;
      card.onclick = () => {
        opt.apply();
        overlay.classList.remove('active');
        state.paused = false;
        updateHUD();
      };
      container.appendChild(card);
    });

    overlay.classList.add('active');
  }

  // --- GAME OVER ---
  function triggerGameOver(reason) {
    state.running = false;
    window.soundFX.playGameOver();

    const modal = document.getElementById('game-over-modal');
    document.getElementById('game-over-reason').innerText = reason;
    document.getElementById('final-impressions').innerText = state.score.toLocaleString();
    document.getElementById('final-revenue').innerText = `$${state.revenue.toLocaleString()}`;

    modal.classList.add('active');
  }

  // --- MOUSE & TOUCH CONTROLS ---
  function getNodeAt(x, y) {
    return state.nodes.find(n => Math.hypot(n.x - x, n.y - y) <= n.radius + 8);
  }

  function getTruckAt(x, y) {
    return state.mobileTrucks.find(t => Math.hypot(t.x - x, t.y - y) <= 26);
  }

  function getCableAt(x, y) {
    const threshold = 10;
    return state.cables.find(c => {
      return distanceToSegment(x, y, c.nodeA.x, c.nodeA.y, c.nodeB.x, c.nodeB.y) <= threshold;
    });
  }

  function distanceToSegment(px, py, x1, y1, x2, y2) {
    const dx = x2 - x1;
    const dy = y2 - y1;
    const lenSq = dx * dx + dy * dy;
    if (lenSq === 0) return Math.hypot(px - x1, py - y1);
    let t = ((px - x1) * dx + (py - y1) * dy) / lenSq;
    t = Math.max(0, Math.min(1, t));
    return Math.hypot(px - (x1 + t * dx), py - (y1 + t * dy));
  }

  function onMouseDown(e) {
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const clickedTruck = getTruckAt(x, y);
    if (clickedTruck) {
      clickedTruck.honkAndBoost();
      return;
    }

    const clickedNode = getNodeAt(x, y);

    if (e.button === 2) {
      const cable = getCableAt(x, y);
      if (cable) removeCable(cable);
      return;
    }

    if (clickedNode && clickedNode.glitched) {
      clickedNode.reboot();
      return;
    }

    if (clickedNode && clickedNode.type === 'SCREEN') {
      openInspector(clickedNode, e.clientX, e.clientY);
    }

    if (clickedNode) {
      state.isDragging = true;
      state.dragSourceNode = clickedNode;
      state.mousePos = { x, y };
    }
  }

  function onMouseMove(e) {
    const rect = canvas.getBoundingClientRect();
    state.mousePos = { x: e.clientX - rect.left, y: e.clientY - rect.top };
  }

  function onMouseUp(e) {
    if (!state.isDragging) return;
    state.isDragging = false;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const targetNode = getNodeAt(x, y);
    if (targetNode && targetNode !== state.dragSourceNode) {
      tryConnectNodes(state.dragSourceNode, targetNode);
    }
    state.dragSourceNode = null;
  }

  function tryConnectNodes(nodeA, nodeB) {
    const exists = state.cables.some(c => 
      (c.nodeA === nodeA && c.nodeB === nodeB) || 
      (c.nodeA === nodeB && c.nodeB === nodeA)
    );

    if (exists) {
      addFloatingText((nodeA.x + nodeB.x) / 2, (nodeA.y + nodeB.y) / 2, 'ALREADY LINKED', '#fe7743');
      return;
    }

    if (state.cables.length >= state.cableLimit) {
      addFloatingText((nodeA.x + nodeB.x) / 2, (nodeA.y + nodeB.y) / 2, 'TRUNK LIMIT REACHED', '#dc4648');
      window.soundFX.playWarning();
      return;
    }

    state.cables.push(new Cable(nodeA, nodeB));
    window.soundFX.playConnect();
    addTelemetry(`[CIRCUIT OPENED] ${nodeA.name} ↔ ${nodeB.name}`);
    updateHUD();
  }

  function removeCable(cable) {
    const index = state.cables.indexOf(cable);
    if (index !== -1) {
      state.cables.splice(index, 1);
      window.soundFX.playDisconnect();
      addTelemetry(`[CIRCUIT DISMANTLED] Fiber reclaimed.`);
      updateHUD();
    }
  }

  // Touch Support
  function onTouchStart(e) {
    if (e.touches.length === 1) {
      const touch = e.touches[0];
      const rect = canvas.getBoundingClientRect();
      const x = touch.clientX - rect.left;
      const y = touch.clientY - rect.top;
      
      const truck = getTruckAt(x, y);
      if (truck) {
        truck.honkAndBoost();
        e.preventDefault();
        return;
      }

      const node = getNodeAt(x, y);
      if (node && node.glitched) {
        node.reboot();
        e.preventDefault();
        return;
      }
      if (node) {
        if (node.type === 'SCREEN') openInspector(node, touch.clientX, touch.clientY);
        state.isDragging = true;
        state.dragSourceNode = node;
        state.mousePos = { x, y };
        e.preventDefault();
      }
    }
  }

  function onTouchMove(e) {
    if (e.touches.length === 1 && state.isDragging) {
      const touch = e.touches[0];
      const rect = canvas.getBoundingClientRect();
      state.mousePos = { x: touch.clientX - rect.left, y: touch.clientY - rect.top };
      e.preventDefault();
    }
  }

  function onTouchEnd(e) {
    if (state.isDragging) {
      state.isDragging = false;
      const target = getNodeAt(state.mousePos.x, state.mousePos.y);
      if (target && target !== state.dragSourceNode) {
        tryConnectNodes(state.dragSourceNode, target);
      }
      state.dragSourceNode = null;
      e.preventDefault();
    }
  }

  // --- HUD UPDATES ---
  function updateHUD() {
    document.getElementById('stat-impressions').innerText = state.score.toLocaleString();
    document.getElementById('stat-revenue').innerText = `$${state.revenue.toLocaleString()}`;
    document.getElementById('stat-cables').innerText = `${state.cables.length}/${state.cableLimit}`;
    document.getElementById('stat-shift').innerText = `Shift ${state.shift}`;

    const trunkCost = state.costs.trunk + (state.purchases.trunks * 3000);
    const bandCost = state.costs.bandwidth + (state.purchases.bandwidth * 2500);
    const cacheCost = state.costs.cache;
    const bufferCost = state.costs.buffer + (state.purchases.buffers * 3500);

    const btnTrunk = document.getElementById('buy-trunk');
    const btnBand = document.getElementById('buy-bandwidth');
    const btnCache = document.getElementById('buy-cache');
    const btnBuffer = document.getElementById('buy-buffer');

    if (btnTrunk) {
      btnTrunk.innerHTML = `<span class="buy-title">⚡ +1 Trunk Cable</span><span class="buy-cost">$${trunkCost.toLocaleString()}</span>`;
      btnTrunk.disabled = state.revenue < trunkCost;
    }
    if (btnBand) {
      btnBand.innerHTML = `<span class="buy-title">🚀 +25% Speed</span><span class="buy-cost">$${bandCost.toLocaleString()}</span>`;
      btnBand.disabled = state.revenue < bandCost;
    }
    if (btnCache) {
      btnCache.innerHTML = `<span class="buy-title">🏢 Edge Relay</span><span class="buy-cost">$${cacheCost.toLocaleString()}</span>`;
      btnCache.disabled = state.revenue < cacheCost;
    }
    if (btnBuffer) {
      btnBuffer.innerHTML = `<span class="buy-title">🔋 Expand Cache (+20s)</span><span class="buy-cost">$${bufferCost.toLocaleString()}</span>`;
      btnBuffer.disabled = state.revenue < bufferCost;
    }

    // Power-Up buttons
    updatePowerUpButton('btn-pow-sentinel', 'sentinel', '🤖 Self-Restore', '5');
    updatePowerUpButton('btn-pow-flush', 'flush', '🌊 Flush', '1');
    updatePowerUpButton('btn-pow-shield', 'shield', '🛡️ Shield', '2');
    updatePowerUpButton('btn-pow-turbo', 'turbo', '⚡ Turbo', '3');
    updatePowerUpButton('btn-pow-surge', 'surge', '💎 Surge', '4');
  }

  function updatePowerUpButton(btnId, type, label, keyNum) {
    const btn = document.getElementById(btnId);
    if (!btn) return;
    const count = state.inventory[type] || 0;
    btn.innerHTML = `<span class="powerup-key">${keyNum}</span> ${label} <span class="powerup-count">x${count}</span>`;
    btn.disabled = count <= 0;
  }

  // --- BACKGROUND & ROADS ---
  function drawBackground(ctx) {
    const w = window.innerWidth;
    const h = window.innerHeight;

    const grad = ctx.createRadialGradient(w / 2, h / 2, 90, w / 2, h / 2, w * 0.85);
    grad.addColorStop(0, '#061329');
    grad.addColorStop(1, '#020814');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);

    // Subtle City Arterial Grid
    ctx.save();
    ctx.strokeStyle = 'rgba(74, 179, 244, 0.035)';
    ctx.lineWidth = 1;
    const gridSize = 45;

    for (let x = 0; x < w; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, h);
      ctx.stroke();
    }
    for (let y = 0; y < h; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
      ctx.stroke();
    }
    ctx.restore();
  }

  function drawDragLine(ctx) {
    if (!state.isDragging || !state.dragSourceNode) return;
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(state.dragSourceNode.x, state.dragSourceNode.y);
    ctx.lineTo(state.mousePos.x, state.mousePos.y);
    ctx.strokeStyle = '#4ab3f4';
    ctx.lineWidth = 2.5;
    ctx.setLineDash([7, 7]);
    ctx.shadowColor = '#4ab3f4';
    ctx.shadowBlur = 10;
    ctx.stroke();
    ctx.restore();
  }

  // --- MAIN LOOP ---
  function gameLoop(now) {
    const dt = Math.min((now - lastTime) / 1000, 0.1);
    lastTime = now;

    if (state.running && !state.paused) {
      state.nodes.forEach(n => n.update(dt * state.gameSpeed));
      state.mobileTrucks.forEach(t => t.update(dt * state.gameSpeed));
      
      for (let i = state.packets.length - 1; i >= 0; i--) {
        if (state.packets[i].update(dt)) {
          state.packets.splice(i, 1);
        }
      }

      updateFloatingTexts(dt);
      handlePacketDispatch(dt);
      handleRushHourEvents(dt);
      handleIncidents(dt);
      updateSLA(dt);
      updateBuffs(dt);
      updateShift(dt);
      updateHUD();
    }

    drawBackground(ctx);
    state.cables.forEach(c => c.draw(ctx));
    drawDragLine(ctx);
    state.packets.forEach(p => p.draw(ctx));
    state.mobileTrucks.forEach(t => t.draw(ctx));
    state.nodes.forEach(n => n.draw(ctx));
    drawFloatingTexts(ctx);

    animationFrameId = requestAnimationFrame(gameLoop);
  }

  // --- INITIALIZATION (CURATED REALISTIC NETWORK) ---
  function initGame() {
    state.running = true;
    state.paused = false;
    state.score = 0;
    state.revenue = 8000;
    state.spentRevenue = 0;
    state.sla = 100;
    state.shift = 1;
    state.shiftTimer = state.shiftDuration;
    state.cableLimit = 4;
    state.purchases = { trunks: 0, bandwidth: 0, caches: 0, buffers: 0 };
    state.inventory = { flush: 1, shield: 1, turbo: 0, surge: 0, sentinel: 1 };
    state.buffs = { shieldTimer: 0, turboTimer: 0, surgeDeliveries: 0, sentinelTimer: 0 };
    state.nodes = [];
    state.cables = [];
    state.packets = [];
    state.floatingTexts = [];
    state.mobileTrucks = [];
    state.rushDistrict = null;

    const cx = window.innerWidth / 2;
    const cy = window.innerHeight / 2;

    // Center Playlog Master SSP Hub
    const ssp = new Node({ id: 0, name: 'Playlog Master SSP', format: FORMATS.ROADSIDE }, cx, cy, 'SSP_HUB');
    state.nodes.push(ssp);

    // Deploy the 5 Realistic Landmark Screens
    LANDMARK_PRESETS.forEach(preset => {
      const sx = cx + (preset.relX * window.innerWidth);
      const sy = cy + (preset.relY * window.innerHeight);
      const screen = new Node(preset, sx, sy, 'SCREEN');
      state.nodes.push(screen);
    });

    // Deploy 2 StickEarn MobileLED trucks roaming the city circuit
    const truck1 = new MobileLEDTruck(1);
    truck1.x = cx - 180;
    truck1.y = cy - 60;
    state.mobileTrucks.push(truck1);

    const truck2 = new MobileLEDTruck(2);
    truck2.x = cx + 180;
    truck2.y = cy + 80;
    state.mobileTrucks.push(truck2);

    addTelemetry('[SYSTEM INITIALIZED] Playlog Flagship DOOH Network active.');
    addTelemetry('[REALISTIC INVENTORY] 5 Flagship Landmark Displays loaded. Zero screen clutter.');
    updateHUD();

    document.getElementById('start-modal').classList.remove('active');
    document.getElementById('game-over-modal').classList.remove('active');
    document.getElementById('upgrade-modal').classList.remove('active');
  }

  // --- EVENT LISTENERS ---
  canvas.addEventListener('mousedown', onMouseDown);
  canvas.addEventListener('mousemove', onMouseMove);
  window.addEventListener('mouseup', onMouseUp);
  canvas.addEventListener('contextmenu', e => e.preventDefault());

  canvas.addEventListener('touchstart', onTouchStart, { passive: false });
  canvas.addEventListener('touchmove', onTouchMove, { passive: false });
  window.addEventListener('touchend', onTouchEnd);

  document.getElementById('btn-start').onclick = () => {
    window.soundFX.init();
    initGame();
  };

  document.getElementById('btn-restart').onclick = () => {
    initGame();
  };

  document.getElementById('btn-pause').onclick = () => {
    state.paused = !state.paused;
    const btn = document.getElementById('btn-pause');
    btn.innerText = state.paused ? '▶ Resume' : '⏸ Pause';
    btn.classList.toggle('active', state.paused);
  };

  document.getElementById('btn-speed').onclick = () => {
    state.gameSpeed = state.gameSpeed === 1 ? 2 : 1;
    const btn = document.getElementById('btn-speed');
    btn.innerText = `${state.gameSpeed}x Speed`;
    btn.classList.toggle('active', state.gameSpeed === 2);
  };

  document.getElementById('btn-audio').onclick = () => {
    const isMuted = window.soundFX.toggleMute();
    document.getElementById('btn-audio').innerText = isMuted ? '🔇 Muted' : '🔊 Sound';
  };

  window.addEventListener('keydown', e => {
    if (e.code === 'Space') {
      e.preventDefault();
      document.getElementById('btn-pause').click();
    } else if (e.key === '1') {
      window.triggerPowerUp('flush');
    } else if (e.key === '2') {
      window.triggerPowerUp('shield');
    } else if (e.key === '3') {
      window.triggerPowerUp('turbo');
    } else if (e.key === '4') {
      window.triggerPowerUp('surge');
    } else if (e.key === '5') {
      window.triggerPowerUp('sentinel');
    } else if (e.key === 'Escape') {
      window.closeInspector();
    }
  });

  animationFrameId = requestAnimationFrame(gameLoop);

})();
