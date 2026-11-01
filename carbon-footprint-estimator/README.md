# EcoML — AI Carbon Footprint Estimator & Sustainable Intelligence

An enterprise-grade, single-screen dashboard for tracking, comparing, and projecting the environmental carbon footprint of Machine Learning models and cloud GPU training.

---

## 🌟 Key Architecture & Features

1. **Executive Cockpit (Single-Screen Overview)**
   - Fits the standard desktop viewport (`100vh`) with an organized, balanced hierarchy.
   - **4 Hero KPIs**: Total CO₂ recorded (with real-world smartphone charge equivalency), Best Accuracy Model, Fastest Execution Model, and Eco Champion algorithm.
   - **Multi-Metric Benchmark Visualizer**: Interactive dual-axis comparison, emissions in milligrams, and compute latency.
   - **Algorithmic Sustainability Matrix**: Model scores, latency, carbon footprint, and Eco-Efficiency grades (`A+`, `A`, `B`).
   - **Automated AI Engineering Insights**: Dynamic trade-off analysis comparing algorithms (e.g. Decision Tree vs Random Forest vs Logistic Regression).

2. **Model Benchmarks & Green Pareto Frontier**
   - Interactive scatter analysis plotting Model Accuracy vs Carbon Footprint.
   - Visual identification of optimal green ML models along the Pareto frontier.
   - Compute latency and Eco-Efficiency ratio breakdown.

3. **Experiment Ledger & Run Logs**
   - Filter by Algorithm, Iteration/Run, or search keyword.
   - Multi-metric sorting (Accuracy, Lowest CO₂, Fastest Time).
   - Detailed ledger with execution status and CSV export.

4. **CSV Studio & Dataset Inspector**
   - Upload any CSV or load the built-in ML Benchmark Preset with one click.
   - Dataset health metrics (Records, Columns, Numeric features, Parse status).
   - **Sub-Tools**:
     - *Visualizer*: Bar, Line, Area, and Pie chart generators.
     - *Correlation Heatmap*: Full Pearson correlation matrix with dynamic color scaling.
     - *Outlier Engine*: Tukey's IQR detection for anomalous compute telemetry.
     - *Data Grid*: Paginated, searchable raw record explorer.

5. **Green AI Compute Simulator (What-If Calculator)**
   - Real-time cloud GPU training emissions calculator based on CodeCarbon formulas.
   - Hardware selector: NVIDIA H100, A100, RTX 4090, T4, Apple M2 Ultra, Intel Xeon.
   - Configurable GPU count, training hours, PUE cooling factor, and regional power grids (Nordics, France, EU, US, India, Coal-heavy).
   - Real-world equivalencies (Car km driven, phone battery charges, tree-years needed for offset).
   - Actionable Green ML engineering advice (Mixed Precision, Carbon-Aware Scheduling, Early Stopping).

6. **Senior Aesthetic Polish**
   - Seamless **Dark Slate** & **Clean Light** themes.
   - Resilient state: Runs in **Live Sync** with Flask backend on port 5000, or gracefully displays bundled benchmark snapshot when offline.
   - Zero layout shifts, custom sleek scrollbars, and smooth micro-interactions.

---

## 🚀 How to Run

### 1. Start the Flask Backend
```bash
cd backend
python app.py
```
*(Runs on `http://127.0.0.1:5000`)*

### 2. Start the React Frontend
```bash
cd frontend
npm run dev
```
*(Opens on `http://localhost:5173`)*

### Deploy the frontend to Netlify

The repository-root `netlify.toml` configures Netlify to build the Vite frontend from `carbon-footprint-estimator/frontend`, publish its `dist` directory, and serve the app for direct URL requests. In Netlify, connect this repository and leave the build settings to the configuration file.

The Flask backend is not deployed by this configuration. The hosted dashboard will use its bundled fallback data unless you deploy the backend separately and configure the frontend to use its public API URL.
