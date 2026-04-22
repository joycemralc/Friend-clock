# Chronos & Logic: Editorial Precision Instrument

Welcome to **Chronos & Logic**, a high-precision temporal dashboard designed with an **Editorial Aesthetic** and powered by **Gemini AI**. This guide will walk you through the unique features and how to operate your personalized precision instrument.

---

## Quick Start Guide

### Step 1: Establish Your Home Coordinate
By default, the dashboard is anchored to **Los Angeles**. 
- Look at the top right header to see your **Local Coordinate** and **UTC Offset**.
- The **Reference ID** (e.g., `LA-24A`) identifies your current monitoring profile.

### Step 2: Configure Your Monitoring Format
Toggle between global standard and traditional time formats:
- Click the **[24H]** or **[12H]** button in the header.
- The analog face and digital readout will instantly synchronize to your preferred format.

### Step 3: Register Global Observers (Friends)
Track friends across the globe without manually calculating offsets.
1.  Locate the **Global Coordinates** section on the left sidebar.
2.  Click the **(+) Add Observer** icon.
3.  Enter your friend's **Full Name** and their **City** (e.g., "Tokyo", "London", "New York").
4.  Click **Assign Coordinate**. 
    - *Note: Our Gemini AI will automatically synchronize the city with its specific IANA timezone, ensuring 100% accuracy including Daylight Saving Time.*

### Step 4: Manage Your Observer Roster
- **Visual Profiles**: The system automatically generates a unique avatar for every observer added.
- **Removing Observers**: Hover over an observer's card and click the small **(X)** to remove them.
- **Fresh Start**: Click the **(X)** icon in the Global Coordinates header to erase all observers and start over.

---

## Technical Specifications & Customizations

### 1. AI-Powered Synchronization
The dashboard utilizes the **Gemini 3 Flash** model to resolve natural language city names into valid IANA timezone strings. This eliminates the need for manual UTC offset calculations.

### 2. Editorial Aesthetic
The interface uses a custom design system inspired by high-end periodicals:
- **Typography**: Playfair Display (Serif) for elegance, Inter (Sans) for data.
- **Palette**: A refined `#F7F5F0` (Cream) and `#141414` (Ink) contrast.
- **Accents**: Vertical "Reference No." labels and skewed "Observation Mode" badges for a distinct signature look.

### 3. High-Fidelity Motion
Unlike standard clocks that update every second, this instrument uses `requestAnimationFrame`. This results in a sub-millisecond "sweeping" motion for the second hand, mirroring a high-frequency mechanical movement.

### 4. Local-First Persistence
Your Global Observers roster is saved securely in your browser's **Local Storage**. No external account is required, and your data stays on your device.

---

*Ref. No. 445-X — Built for the Curated Observer.*
