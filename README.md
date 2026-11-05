# TRXIA Marketing Website

Production-grade marketing website for **TRXIA**, a women's-safety technology startup engineered for ultra-low power emergency transmission.

---

## 🚀 Quick Start

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Run local dev server**:
   ```bash
   npm run dev
   ```
   Open `http://localhost:3000` in your browser.

3. **Build for production**:
   ```bash
   npm run build
   ```
   Build artifacts will be output to `/dist`.

---

## 📝 How to Edit Website Content

All copy, claims, navigation links, and settings are managed in a single source-of-truth file:
👉 **`src/data/content.ts`**

### To edit text, headlines, or claims:
Open `src/data/content.ts` and modify the relevant key (e.g., `hero`, `problem`, `solution`, `privacy`, `closure`).

---

## 🎥 How to Swap or Update the Founder's Video

The video player supports YouTube embeds or direct HTML5 video:

1. Open `src/data/content.ts`
2. Locate the `founders.video` object:
   ```typescript
   video: {
     youtubeUrl: "https://youtu.be/YOUR_NEW_VIDEO_ID",
     embedUrl: "https://www.youtube.com/embed/YOUR_NEW_VIDEO_ID?autoplay=1&rel=0&modestbranding=1",
     title: "Founders' Vision & System Design",
     captionsLabel: "Founder's Intro",
   }
   ```
3. Replace `YOUR_NEW_VIDEO_ID` with your new YouTube video ID. Save the file, and the player will update instantly.

---

## 🛡️ Privacy Compliance

This website strictly reflects the statutory requirements of the **Digital Personal Data Protection (DPDP) Act, 2023 (India)**. No unverified certifications or dummy metrics are introduced.
