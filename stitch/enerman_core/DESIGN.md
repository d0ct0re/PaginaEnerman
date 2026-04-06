# High-End Industrial Editorial: The Design System

## 1. Overview & Creative North Star: "The Kinetic Gallery"
This design system moves beyond the utility of a standard distributor to create a premium, editorial-grade shopping experience. Our Creative North Star is **The Kinetic Gallery**. We treat heavy-duty electrical components like pieces of high-tech art. 

The aesthetic marries the precision of **Tesla’s** industrial minimalism with **Stripe’s** airy, fluid layouts. We break the traditional grid-heavy "e-commerce" look by using intentional white space, staggered content blocks, and overlapping "glass" layers that suggest depth and transparency—mimicking the complex but organized nature of electrical systems.

---

## 2. Colors & Surface Philosophy

### Surface Hierarchy & Nesting
We do not use lines to separate ideas. We use **Tonal Layering**. The UI is a series of stacked sheets of fine paper and frosted glass.

*   **The "No-Line" Rule:** 1px solid borders are prohibited for sectioning. Boundaries are defined by background shifts (e.g., a `surface-container-low` section sitting on a `background` page).
*   **The Glass & Gradient Rule:** For floating navigation or product "quick-looks," use Glassmorphism. Apply a `surface_container_lowest` color at 80% opacity with a `24px` backdrop-blur. 
*   **Signature Textures:** For high-impact areas (Hero CTAs), use a subtle radial gradient: `primary` (#765b00) transitioning into `primary_container` (#E0B11E) at a 45-degree angle.

| Token | Hex | Role |
| :--- | :--- | :--- |
| `background` | #F9F9FB | The base canvas. |
| `surface_container_lowest` | #FFFFFF | Cards, elevated sheets, and product containers. |
| `surface_container_low` | #F3F3F5 | Section backgrounds to create subtle contrast against the base. |
| `on_surface` | #1A1C1D | Primary high-contrast text and iconography. |
| `on_surface_variant` | #6E6E73 | Secondary metadata and de-emphasized labels. |
| `primary` | #E0B11E | The "Golden Current." Used for action, momentum, and branding. |

---

## 3. Typography: Authoritative Precision
We use **Inter** as our typographic engine. It provides the technical legibility of a manual with the elegance of a luxury magazine.

*   **Display & Headlines:** Use `display-lg` for hero statements. Tighten letter spacing by `-0.02em` to create an "industrial-tight" feel.
*   **Product Boldness:** Product names must always use `title-lg` or `headline-sm` with a **Bold (700)** weight. This creates a hard anchor for the eye amidst the soft grey layouts.
*   **Scale Contrast:** We emphasize the difference between `display` (large/loud) and `label` (small/precise) to create architectural hierarchy.

| Level | Size | Weight | Tracking | Case |
| :--- | :--- | :--- | :--- | :--- |
| `display-lg` | 3.5rem | 700 | -0.02em | Sentence |
| `headline-md` | 1.75rem | 600 | -0.01em | Sentence |
| `title-sm` | 1rem | 700 | 0 | Sentence |
| `body-md` | 0.875rem | 400 | 0 | Sentence |
| `label-md` | 0.75rem | 600 | +0.05em | ALL CAPS |

---

## 4. Elevation & Depth: Tonal Layering

### The Layering Principle
Depth is achieved by stacking surface tiers.
1.  **Level 0 (Base):** `background` (#F9F9FB).
2.  **Level 1 (Section):** `surface-container-low` (#F3F3F5) to define large content areas.
3.  **Level 2 (Interaction):** `surface-container-lowest` (#FFFFFF) for cards and inputs.

### Ambient Shadows & "Ghost Borders"
*   **Shadows:** Use only on Level 2 elements when they overlap other content. Specs: `0px 12px 32px rgba(26, 28, 29, 0.06)`. The shadow is a whisper, not a statement.
*   **Ghost Borders:** If accessibility requires a border, use `outline-variant` (#D2C5AD) at **15% opacity**. Never use a 100% opaque border.
*   **Corner Radii:** Use the `md` (1.5rem / 24px) scale for all primary cards to create a friendly, "held" object feel.

---

## 5. Components

### Buttons: The "Gold Standard"
*   **Primary:** `primary_container` (#E0B11E) background with `on_primary_fixed` (#241A00) text. Shape: `full` (pill). Transitions: `300ms ease-out`.
*   **Secondary (Outlined):** No background. "Ghost Border" at 20% opacity. Text: `on_surface`.
*   **Hover State:** Shift to `primary_fixed_dim` (#F1C030) with a slight `Y-minus` lift of 2px.

### Product Cards & Lists
*   **Structure:** No divider lines. Use `spacing-6` (2rem) between items.
*   **Image Handling:** Products should be shot on `surface-container-highest` (#E2E2E4) backgrounds to create a "frame-within-a-frame" effect.
*   **Category Tags:** `pill-style`. Background: `primary` at 10% opacity. Text: `primary` (bold).

### Input Fields
*   **Style:** `surface_container_lowest` background. 
*   **Active State:** Instead of a thick border, use a 2px "Ghost Border" and a subtle `primary` glow (4px blur).
*   **Floating Labels:** Small, `label-md` weight, positioned above the field, never inside it during the active state.

---

## 6. Do’s and Don’ts

### Do
*   **DO** use extreme vertical white space (e.g., `spacing-20`) to separate major product categories.
*   **DO** use asymmetric layouts—place a product image off-center to create visual interest.
*   **DO** use 300ms `ease-out` for all hover and transition states to mimic the "smooth start" of a high-end motor.

### Don't
*   **DON'T** use black (#000000). Use `inverse_surface` (#2F3132) for the darkest elements.
*   **DON'T** use 1px dividers. If you feel the need for a line, increase the `spacing` scale instead.
*   **DON'T** use standard "Drop Shadows." If the element isn't floating in a modal, it should rely on background color shifts for its "lift."