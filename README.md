# 🧁 SusatBakes (@susatbakes) — Full-Stack Bakery Web Application

A production-ready home bakery pre-order web application for **@susatbakes** in Karachi, built with **Next.js 14 (App Router)**, **Tailwind CSS**, and **Node.js API routes**.

---

## 🎨 Brand Design System

- **Background:** Soft Pastel Pink (`#FDF0F5`)
- **Text & Accents:** Warm Chocolate Brown (`#4A2C2A`, `#7A4C4A`, `#2E1A18`)
- **Branding & Highlights:** Vibrant Magenta (`#E6007E`, `#FF4DB2`)
- **Cream & Cards:** Pure Cream (`#FFF5F9`)
- **Typography:** *Playfair Display* (Editorial headings) + *Poppins* (Clean UI copy)

---

## 🚀 Core Features

### 1. Pre-Order & Scheduling Engine
- **Calendar Selection:** Customers pick any future bake date.
- **Daily Capacity Cap:** Strictly capped at **15 orders per bake day**. Real-time capacity checks update every date badge on the calendar.
- **Cutoff System:** Orders close strictly at **8:00 PM the previous day** (e.g., Friday orders close Thursday at 8:00 PM).
- **Time Slots:** Morning (9:00 AM – 12:00 PM), Afternoon (12:00 PM – 5:00 PM), Evening (5:00 PM – 8:00 PM).

### 2. Menu & Pricing Structure
- **Artisanal Brownies:**
  - Box of 4: **Rs. 1,349**
  - Box of 6: **Rs. 1,849**
  - Box of 9: **Rs. 1,999**
  - *Flavors:* Chocolate Chip, Chocolate Fudge, Salted Caramel, Cookies 'N Cream.
- **NYC Cookies (Box of 6):**
  - NYC Chocolate Chip: **Rs. 1,199**
  - Red Velvet: **Rs. 1,299**
  - Nutella Stuffed: **Rs. 1,399**
  - Lotus Biscoff: **Rs. 1,499**
- **Muffins & Breads:**
  - Golden Banana Muffins (Box of 9): **Rs. 1,449**
  - Nutella Lava Muffins (Box of 9): **Rs. 1,549**
  - Classic Banana Bread (1.5 lb Loaf): **Rs. 1,549**

### 3. Cart & Dual Checkout Options
- **Dynamic Slide-out Drawer:** Interactive quantity increment/decrement, custom note per item, and live subtotal calculations.
- **Dual Checkout Flow:**
  1. **Option A — Instant WhatsApp Redirect:** Formats all items, quantities, chosen date/slot, and total, directly sending it to `+92 370 6572463`.
  2. **Option B — Direct Submission & Proof Upload:** Customers can upload bank transfer screenshots (JPG/PNG/PDF up to 5MB) or select Cash on Delivery (COD).
- **Admin Dashboard (`/admin`):** Real-time order tracker with status updates (Pending, Confirmed, Baking, Out for Delivery, Delivered) and bank receipt previewer.

---

## 📁 Project Architecture

```
susatbakes/
├── src/
│   ├── app/
│   │   ├── layout.tsx              # Root layout with fonts, metadata, providers
│   │   ├── page.tsx                # Customer storefront home page
│   │   ├── globals.css             # Tailwind styling, theme tokens & animations
│   │   ├── menu/page.tsx           # Full menu & pricing tables
│   │   ├── order/page.tsx          # Pre-order calendar & review page
│   │   ├── admin/page.tsx          # Live admin order management dashboard
│   │   └── api/
│   │       ├── orders/route.ts     # GET capacity & orders / POST new orders
│   │       └── upload/route.ts     # POST bank receipt file upload handler
│   ├── components/
│   │   ├── Navbar.tsx              # Sticky header with cart drawer trigger
│   │   ├── Footer.tsx              # Brand footer with schedule guidelines
│   │   ├── Hero.tsx                # Hero section with animated CTAs
│   │   ├── MenuCard.tsx            # Interactive box/flavor product card
│   │   ├── MenuSection.tsx         # Category filtered menu grid
│   │   ├── CartDrawer.tsx          # Slide-out animated cart drawer
│   │   ├── OrderCalendar.tsx       # Live interactive calendar with capacity limits
│   │   └── CheckoutModal.tsx       # Dual-flow checkout & upload modal
│   ├── context/
│   │   └── CartContext.tsx         # React Context with localStorage persistence
│   ├── data/
│   │   └── products.ts             # Exact product catalogue & pricing
│   ├── lib/
│   │   ├── capacity.ts             # 15/day capacity limits & 8 PM cutoff rules
│   │   ├── db.ts                   # JSON file-based database store
│   │   └── whatsapp.ts             # Message builder for +92 370 6572463
│   └── types/
│       └── bakery.ts               # Core TypeScript definitions
├── public/
│   └── uploads/                    # Stored receipt screenshots
├── data/
│   └── orders.json                 # Auto-generated JSON database
├── package.json
├── tailwind.config.ts
├── tsconfig.json
└── README.md
```

---

## 🛠️ Local Development & Running

### 1. Install Dependencies
```bash
npm install
```

### 2. Start the Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to view the application.

### 3. Production Build
```bash
npm run build
npm start
```

---

## 🌐 WhatsApp Integration Details

- **Contact Number:** `+92 370 657 2463`
- **Direct Chat Link:** [wa.me/923706572463](https://wa.me/923706572463)
