# Semantic Segmentation Annotation Tool

## Overview
This project is a **semantic segmentation annotation tool** that allows users to annotate images using **brush strokes** or **polygon drawing**. Users can **create classes**, **upload images**, **annotate data**, and **export the results in COCO format**.

The interface is **responsive**, supporting smaller screens and touch interactions.

---

## 🚀 Features Overview
1. **Setup Page**  
   - Add or remove **classes** (each with a unique color).  
   - Upload or delete **images**.

2. **Annotation Page**  
   - Draw using **brush** or **polygon** tools.  
   - **Eraser tool** (only for brush strokes).  
   - **Undo functionality**.  
   - Change active **class** for annotation.  
   - Switch between uploaded images.  

3. **Export Page**  
   - Review annotated images before exporting.  
   - Download annotations in **COCO JSON format**.

---

## 📥 Installation & Setup
### Requirements
- **Node.js** (latest stable version recommended)
- **npm** (included with Node.js)

### Steps
1. **Clone the repository:**
   ```sh
   git clone https://github.com/ninaschramm/overview-test.git
   cd overview-annotation-tool
2. **Install dependencies:**
    ```sh
    npm install
3. **Start the development server:**
    ```sh
    npm start
The app will be available at http://localhost:3000/.

## 🛠 Tech Stack
- **React.js** – Frontend framework
- **MUI (Material UI)** – UI components & styling
- **Styled Components** – Additional styling
- **Konva.js & React-Konva** – Canvas manipulation
- **React Router** – Page navigation

---

## 💡 Design Decisions & Justifications
### 🔹 Why **Konva.js** instead of **Fabric.js**?
Konva.js was chosen because it provides **better support for real-time drawing performance** and **built-in eraser functionality**.

### 🔹 Why **React-Konva**?
Using **React-Konva** ensures optimal **performance** by efficiently managing re-renders and leveraging **Konva.js’s lower-level canvas API**.

### 🔹 Why **RLE (Run-Length Encoding)** for Annotations?
The **test requirements explicitly stated** that annotations should be stored in **COCO format**, which supports **RLE encoding**.  
RLE **compresses binary masks efficiently**, reducing file size by **storing consecutive pixel values as (length, value) pairs**, making it more optimized than storing full-resolution bitmaps.

---

## 🎥 Demo Video
📌 **[Demo Video Link - Coming Soon]**  

---

## ⚠️ Known Issues
1. **No pixel overlap prevention** – The application currently allows pixels to have multiple class labels if drawn over with different classes.
2. **Eraser only works for brush strokes** – Users cannot erase polygons; they must use the **Undo** feature instead.

---

## 🤝 Contribution
If you’d like to improve the tool, **fork** the repository and submit a **pull request**.

---

