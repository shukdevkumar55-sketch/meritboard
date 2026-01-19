# 🎓 MeritBoard - Visual Learning & Mock Test Platform

> **Tagline:** Visualizing Knowledge, Mastering Merit.

MeritBoard is a next-generation educational platform designed for competitive exam aspirants (HSSC, SSC, etc.). Unlike traditional platforms, MeritBoard focuses on **Visual Learning** using advanced SVGs, **Dynamic Negative Marking**, and **Deep Performance Analysis**.

---

## 🚀 Key Features

### 🧠 Smart Quiz Engine
- **Bilingual Support:** Switch between Hindi and English instantly during the test.
- **Dynamic Negative Marking:** The system automatically adapts marking schemes (e.g., 0.25, 0.50, or No Negative Marking) based on the JSON configuration.
- **Section-based Navigation:** Auto-generated tabs for subjects (Math, Reasoning, GK, etc.).
- **Resume Capability:** Timer and answers are saved in real-time (Session State).

### 🎨 Premium UI/UX
- **Theme:** Professional Navy Blue (`#1A237E`) & Sky Blue (`#03A9F4`) color palette.
- **Visuals:** Custom Duotone SVGs used throughout the UI for a modern look.
- **Responsive:** Fully optimized for Mobile, Tablet, and Desktop.
- **Glassmorphism:** Subtle glass effects on modals and buttons.

### 📊 Advanced Analytics
- **Result Dashboard:** Detailed Scorecard with Accuracy, Correct/Wrong counts.
- **Section Analysis:** Subject-wise performance breakdown cards.
- **Smart Solutions:** Explanations with HTML support (Images, Formulas, Bold text).
- **Shareable:** One-click WhatsApp score sharing.

---

## 📂 Project Structure

The project follows a modular directory structure for easy maintenance.

```text
MeritBoard/
│
├── index.html              # Home Page (Landing)
├── quiz-view.html          # Main Quiz Interface
├── README.md               # Documentation
│
├── assets/                 # Images & Icons
│   ├── team/               # Team photos
│   └── thumbnails/         # Quiz cover images
│
├── css/                    # Core Stylesheets
│   ├── quiz-style.css      # Main Quiz UI Styles
│   └── (other styles)
│
├── js/                     # Logic Layer
│   └── quiz-core.js        # The Brain of the Quiz System
│
├── data/                   # Data Layer
│   └── quizzes/
│       └── sample-test.json # Quiz Data File
│
└── pages/                  # Static Pages Folder
    ├── about.html
    ├── contact.html
    ├── privacy.html
    ├── terms.html
    ├── disclaimer.html
    └── css/                # Styles specifically for static pages
        ├── about-style.css
        ├── contact-style.css
        ├── terms-style.css
        ├── privacy-style.css
        └── disclaimer-style.css
