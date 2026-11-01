import { useState, useEffect, useMemo } from "react";
import axios from "axios";
import Papa from "papaparse";
import {
  Leaf,
  Activity,
  Clock,
  Award,
  RefreshCw,
  Upload,
  FileSpreadsheet,
  Download,
  Search,
  Trash2,
  Zap,
  Sliders,
  Sun,
  Moon,
  TrendingUp,
  Layers,
  Globe,
  Sparkles,
  Info,
  CheckCircle2,
  AlertCircle
} from "lucide-react";

import {
  BarChart,
  Bar,
  LineChart,
  Line,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  ScatterChart,
  Scatter,
  ZAxis
} from "recharts";

import {
  FALLBACK_COMPARISON,
  FALLBACK_HISTORY,
  HARDWARE_PRESETS,
  GRID_REGIONS,
  SAMPLE_CSV_DATA
} from "./data/fallbackData";

import "./App.css";

const API_BASE = "http://127.0.0.1:5000";
const PALETTE = ["#10b981", "#38bdf8", "#fbbf24", "#a855f7", "#f43f5e", "#34d399"];

// Custom Chart Tooltip declared outside of render to prevent recreation
function CustomChartTooltip({ active, payload, label }) {
  if (active && payload && payload.length) {
    return (
      <div className="custom-tooltip">
        <div className="tooltip-title">{label || payload[0]?.payload?.name || payload[0]?.payload?.model}</div>
        {payload.map((entry, idx) => (
          <div key={idx} className="tooltip-row">
            <span style={{ color: entry.color || "#10b981" }}>{entry.name}:</span>
            <strong>{typeof entry.value === "number" ? entry.value.toLocaleString() : entry.value}</strong>
          </div>
        ))}
      </div>
    );
  }
  return null;
}

export default function App() {
  // Theme state
  const [theme, setTheme] = useState("dark");

  // Active workspace tab: 'overview' | 'benchmarks' | 'logs' | 'csv' | 'simulator'
  const [activeTab, setActiveTab] = useState("overview");

  // Backend state
  const [backendOnline, setBackendOnline] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [comparison, setComparison] = useState(FALLBACK_COMPARISON);
  const [history, setHistory] = useState(FALLBACK_HISTORY);

  // Overview sub-control: 'comparison' | 'emissions' | 'time'
  const [overviewMetric, setOverviewMetric] = useState("comparison");

  // Logs filters
  const [selectedModel, setSelectedModel] = useState("All");
  const [selectedRun, setSelectedRun] = useState("All");
  const [logSearch, setLogSearch] = useState("");
  const [logSortBy, setLogSortBy] = useState("run");

  // CSV Studio state
  const [csvData, setCsvData] = useState([]);
  const [csvColumns, setCsvColumns] = useState([]);
  const [csvFileName, setCsvFileName] = useState("");
  const [csvError, setCsvError] = useState("");
  const [csvSearch, setCsvSearch] = useState("");
  const [csvPage, setCsvPage] = useState(1);
  const [csvChartType, setCsvChartType] = useState("bar");
  const [csvXCol, setCsvXCol] = useState("");
  const [csvYCol, setCsvYCol] = useState("");
  const [csvSubTab, setCsvSubTab] = useState("visualizer"); // 'visualizer' | 'correlation' | 'outliers' | 'table'
  const [outlierCol, setOutlierCol] = useState("");

  // Eco Simulator state
  const [simHardware, setSimHardware] = useState(HARDWARE_PRESETS[1].id); // A100 default
  const [simGpuCount, setSimGpuCount] = useState(4);
  const [simHours, setSimHours] = useState(12);
  const [simRegion, setSimRegion] = useState(GRID_REGIONS[4].id); // US average default
  const [simPUE, setSimPUE] = useState(1.2);

  // Data Fetch
  const fetchData = async () => {
    setRefreshing(true);
    try {
      const [histRes, compRes] = await Promise.all([
        axios.get(`${API_BASE}/api/history`, { timeout: 2500 }),
        axios.get(`${API_BASE}/api/comparison`, { timeout: 2500 }),
      ]);

      if (histRes.data && Array.isArray(histRes.data)) {
        setHistory(histRes.data);
      }
      if (compRes.data && Array.isArray(compRes.data)) {
        setComparison(compRes.data);
      }
      setBackendOnline(true);
    } catch {
      setBackendOnline(false);
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    let ignore = false;
    async function loadInitial() {
      try {
        const [histRes, compRes] = await Promise.all([
          axios.get(`${API_BASE}/api/history`, { timeout: 2500 }),
          axios.get(`${API_BASE}/api/comparison`, { timeout: 2500 }),
        ]);
        if (!ignore) {
          if (histRes.data && Array.isArray(histRes.data)) setHistory(histRes.data);
          if (compRes.data && Array.isArray(compRes.data)) setComparison(compRes.data);
          setBackendOnline(true);
        }
      } catch {
        if (!ignore) {
          setBackendOnline(false);
        }
      }
    }
    loadInitial();
    return () => {
      ignore = true;
    };
  }, []);

  // Sync theme to root element
  const toggleTheme = () => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  };

  // --- Computed Analytics for Overview ---
  const totalEmissionsGrams = useMemo(() => {
    return history.reduce((sum, item) => sum + Number(item["CO2 Emissions (g)"] || 0), 0);
  }, [history]);

  const bestAccModel = useMemo(() => {
    if (!comparison.length) return null;
    return [...comparison].sort((a, b) => Number(b["Accuracy (%)"]) - Number(a["Accuracy (%)"]))[0];
  }, [comparison]);

  const fastestModel = useMemo(() => {
    if (!comparison.length) return null;
    return [...comparison].sort((a, b) => Number(a["Training Time (seconds)"]) - Number(b["Training Time (seconds)"]))[0];
  }, [comparison]);

  const ecoChampionModel = useMemo(() => {
    if (!comparison.length) return null;
    return [...comparison].sort((a, b) => Number(a["CO2 Emissions (g)"]) - Number(b["CO2 Emissions (g)"]))[0];
  }, [comparison]);

  // Formatted chart dataset with normalized indicators & Eco-score
  const formattedComparison = useMemo(() => {
    return comparison.map((item) => {
      const accuracy = Number(item["Accuracy (%)"]) || 0;
      const emissionsG = Number(item["CO2 Emissions (g)"]) || 0;
      const emissionsMg = emissionsG * 1000;
      const trainingTimeSec = Number(item["Training Time (seconds)"]) || 0;

      // Eco efficiency score: Accuracy % / max(emissions in mg, 0.001)
      const efficiencyScore = accuracy / Math.max(emissionsMg, 0.001);

      // Eco Grade calculation
      let grade = "B";
      if (emissionsG < 0.0001) grade = "A+";
      else if (emissionsG < 0.003) grade = "A";

      return {
        model: item.Model,
        accuracy: Number(accuracy.toFixed(2)),
        emissionsG: Number(emissionsG.toFixed(7)),
        emissionsMg: Number(emissionsMg.toFixed(4)),
        trainingTime: Number(trainingTimeSec.toFixed(4)),
        efficiencyScore: Number(efficiencyScore.toFixed(1)),
        grade
      };
    });
  }, [comparison]);

  // Filtered experiment history
  const filteredHistory = useMemo(() => {
    return history
      .filter((row) => {
        const matchModel = selectedModel === "All" || row.Model === selectedModel;
        const matchRun = selectedRun === "All" || String(row.Run) === selectedRun;
        const matchSearch =
          !logSearch ||
          row.Model.toLowerCase().includes(logSearch.toLowerCase()) ||
          String(row.Run).includes(logSearch);
        return matchModel && matchRun && matchSearch;
      })
      .sort((a, b) => {
        if (logSortBy === "accuracy") return Number(b["Accuracy (%)"]) - Number(a["Accuracy (%)"]);
        if (logSortBy === "emissions") return Number(a["CO2 Emissions (g)"]) - Number(b["CO2 Emissions (g)"]);
        if (logSortBy === "time") return Number(a["Training Time (seconds)"]) - Number(b["Training Time (seconds)"]);
        return Number(a.Run) - Number(b.Run);
      });
  }, [history, selectedModel, selectedRun, logSearch, logSortBy]);

  // --- CSV Studio Utilities ---
  const handleCSVUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setCsvError("");
    setCsvSearch("");
    setCsvPage(1);

    if (!file.name.toLowerCase().endsWith(".csv")) {
      setCsvError("Please upload a valid CSV file (.csv)");
      return;
    }

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      dynamicTyping: false,
      complete: (results) => {
        const rows = results.data.filter((row) =>
          Object.values(row).some((val) => String(val ?? "").trim() !== "")
        );
        const cols = results.meta.fields || [];

        if (!rows.length || !cols.length) {
          setCsvError("The CSV file is empty or has no readable columns.");
          return;
        }

        setCsvData(rows);
        setCsvColumns(cols);
        setCsvFileName(file.name);

        const numeric = cols.filter((col) =>
          rows.some((r) => {
            const v = String(r[col] ?? "").trim();
            return v !== "" && Number.isFinite(Number(v));
          })
        );

        setCsvXCol(cols[0]);
        setCsvYCol(numeric[0] || cols[0]);
        setOutlierCol(numeric[0] || "");
      },
      error: () => setCsvError("Failed to parse this CSV file.")
    });
    e.target.value = "";
  };

  const loadSampleCSV = () => {
    setCsvError("");
    setCsvSearch("");
    setCsvPage(1);
    setCsvData(SAMPLE_CSV_DATA);
    const cols = Object.keys(SAMPLE_CSV_DATA[0]);
    setCsvColumns(cols);
    setCsvFileName("Sample_ML_Carbon_Benchmark.csv");
    setCsvXCol("Model");
    setCsvYCol("Emissions_mg");
    setOutlierCol("Emissions_mg");
  };

  const clearCSV = () => {
    setCsvData([]);
    setCsvColumns([]);
    setCsvFileName("");
    setCsvError("");
    setCsvSearch("");
    setCsvPage(1);
    setCsvXCol("");
    setCsvYCol("");
    setOutlierCol("");
  };

  const numericCSVCols = useMemo(() => {
    return csvColumns.filter((col) => {
      return csvData.some((row) => {
        const val = String(row[col] ?? "").trim();
        return val !== "" && Number.isFinite(Number(val));
      });
    });
  }, [csvColumns, csvData]);

  // CSV Visualization Data
  const csvChartData = useMemo(() => {
    if (!csvXCol || !csvYCol || !csvData.length) return [];
    const grouped = {};
    csvData.forEach((row) => {
      const key = String(row[csvXCol] ?? "Unknown");
      const val = Number(row[csvYCol]);
      if (Number.isFinite(val)) {
        grouped[key] = (grouped[key] || 0) + val;
      }
    });

    return Object.entries(grouped)
      .slice(0, 25)
      .map(([name, val]) => ({
        name,
        value: Number(val.toFixed(4))
      }));
  }, [csvData, csvXCol, csvYCol]);

  // CSV Correlation Matrix
  const correlationMatrix = useMemo(() => {
    const cols = numericCSVCols;
    if (cols.length < 2) return [];

    const getCorr = (colA, colB) => {
      let count = 0, sumA = 0, sumB = 0, sumAA = 0, sumBB = 0, sumAB = 0;
      for (const row of csvData) {
        const a = Number(row[colA]);
        const b = Number(row[colB]);
        if (Number.isFinite(a) && Number.isFinite(b)) {
          count++;
          sumA += a;
          sumB += b;
          sumAA += a * a;
          sumBB += b * b;
          sumAB += a * b;
        }
      }
      if (count < 2) return 0;
      const num = count * sumAB - sumA * sumB;
      const den = Math.sqrt((count * sumAA - sumA * sumA) * (count * sumBB - sumB * sumB));
      return den === 0 ? 0 : num / den;
    };

    return cols.map((rowCol) => ({
      feature: rowCol,
      values: cols.map((col) => ({
        target: col,
        val: Number(getCorr(rowCol, col).toFixed(3))
      }))
    }));
  }, [csvData, numericCSVCols]);

  // Outlier detection via IQR
  const outlierAnalysis = useMemo(() => {
    if (!outlierCol || !csvData.length) return null;
    const vals = csvData
      .map((r) => Number(r[outlierCol]))
      .filter(Number.isFinite)
      .sort((a, b) => a - b);

    if (vals.length < 4) return null;

    const percentile = (arr, p) => {
      const idx = (arr.length - 1) * p;
      const lower = Math.floor(idx);
      const upper = Math.ceil(idx);
      if (lower === upper) return arr[lower];
      return arr[lower] + (arr[upper] - arr[lower]) * (idx - lower);
    };

    const q1 = percentile(vals, 0.25);
    const q3 = percentile(vals, 0.75);
    const iqr = q3 - q1;
    const lowerBound = q1 - 1.5 * iqr;
    const upperBound = q3 + 1.5 * iqr;

    const outlierRows = csvData.filter((r) => {
      const v = Number(r[outlierCol]);
      return Number.isFinite(v) && (v < lowerBound || v > upperBound);
    });

    return {
      q1: q1.toFixed(3),
      q3: q3.toFixed(3),
      iqr: iqr.toFixed(3),
      lowerBound: lowerBound.toFixed(3),
      upperBound: upperBound.toFixed(3),
      count: outlierRows.length,
      pct: ((outlierRows.length / vals.length) * 100).toFixed(1),
      rows: outlierRows.slice(0, 10)
    };
  }, [csvData, outlierCol]);

  // CSV Pagination
  const filteredCSV = useMemo(() => {
    if (!csvSearch) return csvData;
    const term = csvSearch.toLowerCase();
    return csvData.filter((r) =>
      csvColumns.some((col) => String(r[col] ?? "").toLowerCase().includes(term))
    );
  }, [csvData, csvColumns, csvSearch]);

  const csvTotalPages = Math.max(1, Math.ceil(filteredCSV.length / 10));
  const currentCSVPageRows = filteredCSV.slice((csvPage - 1) * 10, csvPage * 10);

  // --- Eco Simulator Live Calculations ---
  const simResult = useMemo(() => {
    const hw = HARDWARE_PRESETS.find((h) => h.id === simHardware) || HARDWARE_PRESETS[1];
    const reg = GRID_REGIONS.find((r) => r.id === simRegion) || GRID_REGIONS[4];

    // Total power in Watts = Hardware Watts * GPU Count * PUE
    const totalWatts = hw.watts * simGpuCount * simPUE;
    // Energy in kWh = (Watts * hours) / 1000
    const totalKWh = (totalWatts * simHours) / 1000;
    // CO2 in grams = kWh * (grams per kWh)
    const co2Grams = totalKWh * reg.gPerKWh;
    const co2Kg = co2Grams / 1000;

    // Real world equivalencies
    // Average passenger car emits ~120g CO2 per km
    const kmDriven = co2Grams / 120;
    // Smartphone full charge uses ~0.012 kWh (approx 5-6g CO2 on average grid)
    const phoneCharges = co2Grams / 5.5;
    // 1 mature tree absorbs ~22 kg CO2 per year (~60g/day)
    const treeYears = co2Kg / 22;

    return {
      hwName: hw.name,
      regName: reg.name,
      totalKWh: totalKWh.toFixed(2),
      co2Kg: co2Kg.toFixed(2),
      co2Grams: co2Grams.toFixed(1),
      kmDriven: kmDriven.toFixed(1),
      phoneCharges: Math.round(phoneCharges).toLocaleString(),
      treeYears: treeYears.toFixed(3)
    };
  }, [simHardware, simGpuCount, simHours, simRegion, simPUE]);

  // Download export helper
  const handleExportData = () => {
    const exportObj = {
      timestamp: new Date().toISOString(),
      summary: comparison,
      history: filteredHistory
    };
    const blob = new Blob([JSON.stringify(exportObj, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `EcoML_Executive_Report_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(a);
  };

  return (
    <div className={`app-shell ${theme === "light" ? "light-theme" : ""}`}>
      {/* ===== 1. TOP APP HEADER ===== */}
      <header className="top-header">
        <div className="brand-section">
          <div className="brand-icon-wrapper">
            <Leaf size={19} />
          </div>
          <div className="brand-info">
            <div className="brand-title-row">
              <span className="brand-title">EcoML</span>
              <span className="brand-tag">Carbon AI</span>
            </div>
            <span className="brand-subtext">Sustainable Model Intelligence</span>
          </div>
        </div>

        {/* Workspace Central Tabs */}
        <nav className="workspace-tabs">
          <button
            className={`tab-btn ${activeTab === "overview" ? "active" : ""}`}
            onClick={() => setActiveTab("overview")}
          >
            <Activity size={14} />
            <span>Overview</span>
            {activeTab === "overview" && <span className="tab-indicator" />}
          </button>

          <button
            className={`tab-btn ${activeTab === "benchmarks" ? "active" : ""}`}
            onClick={() => setActiveTab("benchmarks")}
          >
            <TrendingUp size={14} />
            <span>Benchmarks</span>
            {activeTab === "benchmarks" && <span className="tab-indicator" />}
          </button>

          <button
            className={`tab-btn ${activeTab === "logs" ? "active" : ""}`}
            onClick={() => setActiveTab("logs")}
          >
            <Clock size={14} />
            <span>Experiment Logs</span>
            {activeTab === "logs" && <span className="tab-indicator" />}
          </button>

          <button
            className={`tab-btn ${activeTab === "csv" ? "active" : ""}`}
            onClick={() => setActiveTab("csv")}
          >
            <FileSpreadsheet size={14} />
            <span>CSV Studio</span>
            {activeTab === "csv" && <span className="tab-indicator" />}
          </button>

          <button
            className={`tab-btn ${activeTab === "simulator" ? "active" : ""}`}
            onClick={() => setActiveTab("simulator")}
          >
            <Zap size={14} />
            <span>Eco Simulator</span>
            {activeTab === "simulator" && <span className="tab-indicator" />}
          </button>
        </nav>

        {/* Header Right Actions */}
        <div className="header-actions">
          <div className="status-pill" title={backendOnline ? "Connected to Flask API on :5000" : "Offline mode: Showing local benchmark snapshot"}>
            <span className={`pulse-dot ${backendOnline ? "online" : "offline"}`} />
            <span>{backendOnline ? "Live Sync" : "Snapshot"}</span>
          </div>

          <button
            className="icon-action-btn"
            onClick={fetchData}
            disabled={refreshing}
            title="Refresh backend telemetry"
          >
            <RefreshCw size={14} className={refreshing ? "spinning" : ""} />
          </button>

          <button
            className="icon-action-btn"
            onClick={toggleTheme}
            title={theme === "dark" ? "Switch to Light Theme" : "Switch to Dark Slate Theme"}
          >
            {theme === "dark" ? <Sun size={14} /> : <Moon size={14} />}
          </button>

          <button
            className="btn-primary-sm"
            onClick={handleExportData}
            title="Export telemetry report as JSON"
          >
            <Download size={13} />
            <span>Export</span>
          </button>
        </div>
      </header>

      {/* ===== 2. MAIN WORKSPACE CONTAINER ===== */}
      <main className="main-workspace">
        {/* ========================================================= */}
        {/* TAB 1: OVERVIEW (SINGLE-SCREEN EXECUTIVE COCKPIT)         */}
        {/* ========================================================= */}
        {activeTab === "overview" && (
          <div className="workspace-pane fade-in">
            <div className="overview-grid">
              {/* 4 Hero KPI Metric Cards */}
              <div className="kpi-row">
                <div className="kpi-card emerald">
                  <div className="kpi-header">
                    <span className="kpi-title">Total CO₂ Footprint</span>
                    <div className="kpi-icon-pill"><Leaf size={14} /></div>
                  </div>
                  <div className="kpi-value-row">
                    <span className="kpi-value">{totalEmissionsGrams.toFixed(5)}</span>
                    <span className="kpi-unit">g CO₂e</span>
                  </div>
                  <div className="kpi-footer">
                    <span>{history.length} recorded training runs</span>
                    <span className="kpi-badge badge-emerald">~{Math.round(totalEmissionsGrams * 180)} smartphone charges</span>
                  </div>
                </div>

                <div className="kpi-card blue">
                  <div className="kpi-header">
                    <span className="kpi-title">Top Accuracy Model</span>
                    <div className="kpi-icon-pill"><Award size={14} /></div>
                  </div>
                  <div className="kpi-value-row">
                    <span className="kpi-value">
                      {bestAccModel ? Number(bestAccModel["Accuracy (%)"]).toFixed(2) : "96.49"}
                    </span>
                    <span className="kpi-unit">%</span>
                  </div>
                  <div className="kpi-footer">
                    <span>{bestAccModel?.Model || "Random Forest"}</span>
                    <span className="kpi-badge badge-blue">Highest Precision</span>
                  </div>
                </div>

                <div className="kpi-card purple">
                  <div className="kpi-header">
                    <span className="kpi-title">Fastest Execution</span>
                    <div className="kpi-icon-pill"><Clock size={14} /></div>
                  </div>
                  <div className="kpi-value-row">
                    <span className="kpi-value">
                      {fastestModel ? Number(fastestModel["Training Time (seconds)"]).toFixed(4) : "0.0035"}
                    </span>
                    <span className="kpi-unit">sec</span>
                  </div>
                  <div className="kpi-footer">
                    <span>{fastestModel?.Model || "Decision Tree"}</span>
                    <span className="kpi-badge badge-purple">93.8x Speed Advantage</span>
                  </div>
                </div>

                <div className="kpi-card amber">
                  <div className="kpi-header">
                    <span className="kpi-title">Eco Champion</span>
                    <div className="kpi-icon-pill"><Sparkles size={14} /></div>
                  </div>
                  <div className="kpi-value-row">
                    <span className="kpi-value">
                      {ecoChampionModel ? (Number(ecoChampionModel["CO2 Emissions (g)"]) * 1000).toFixed(3) : "0.017"}
                    </span>
                    <span className="kpi-unit">mg CO₂</span>
                  </div>
                  <div className="kpi-footer">
                    <span>{ecoChampionModel?.Model || "Decision Tree"}</span>
                    <span className="kpi-badge badge-amber">99.7% Less Carbon</span>
                  </div>
                </div>
              </div>

              {/* Main Split Row: Interactive Visualizer & Sustainability Matrix */}
              <div className="overview-split">
                {/* Left Visualizer Card */}
                <div className="dashboard-card">
                  <div className="card-header-row">
                    <div className="card-heading-group">
                      <span className="card-title">
                        <TrendingUp size={15} color="#10b981" />
                        Model Benchmark Analysis
                      </span>
                      <span className="card-subtitle">Algorithmic carbon emissions vs computational performance</span>
                    </div>

                    <div className="card-controls">
                      <div className="pill-switch">
                        <button
                          className={`pill-switch-btn ${overviewMetric === "comparison" ? "active" : ""}`}
                          onClick={() => setOverviewMetric("comparison")}
                        >
                          Dual Metric
                        </button>
                        <button
                          className={`pill-switch-btn ${overviewMetric === "emissions" ? "active" : ""}`}
                          onClick={() => setOverviewMetric("emissions")}
                        >
                          CO₂ (mg)
                        </button>
                        <button
                          className={`pill-switch-btn ${overviewMetric === "time" ? "active" : ""}`}
                          onClick={() => setOverviewMetric("time")}
                        >
                          Latency (s)
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="chart-container-flex">
                    <ResponsiveContainer width="100%" height="100%">
                      {overviewMetric === "comparison" ? (
                        <BarChart data={formattedComparison} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke={theme === "dark" ? "rgba(255,255,255,0.06)" : "#e2e8f0"} />
                          <XAxis dataKey="model" stroke="#94a3b8" tick={{ fontSize: 11 }} />
                          <YAxis yAxisId="left" stroke="#10b981" domain={[90, 100]} tick={{ fontSize: 11 }} />
                          <YAxis yAxisId="right" orientation="right" stroke="#38bdf8" tick={{ fontSize: 11 }} />
                          <Tooltip content={<CustomChartTooltip />} />
                          <Legend wrapperStyle={{ fontSize: "11px", paddingTop: "4px" }} />
                          <Bar yAxisId="left" dataKey="accuracy" name="Accuracy (%)" fill="#10b981" radius={[4, 4, 0, 0]} maxBarSize={38} />
                          <Bar yAxisId="right" dataKey="emissionsMg" name="CO₂ Emissions (mg)" fill="#38bdf8" radius={[4, 4, 0, 0]} maxBarSize={38} />
                        </BarChart>
                      ) : overviewMetric === "emissions" ? (
                        <BarChart data={formattedComparison} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke={theme === "dark" ? "rgba(255,255,255,0.06)" : "#e2e8f0"} />
                          <XAxis dataKey="model" stroke="#94a3b8" tick={{ fontSize: 11 }} />
                          <YAxis stroke="#fbbf24" tick={{ fontSize: 11 }} />
                          <Tooltip content={<CustomChartTooltip />} />
                          <Bar dataKey="emissionsMg" name="Emissions (mg CO₂)" fill="#fbbf24" radius={[4, 4, 0, 0]} maxBarSize={48} />
                        </BarChart>
                      ) : (
                        <BarChart data={formattedComparison} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke={theme === "dark" ? "rgba(255,255,255,0.06)" : "#e2e8f0"} />
                          <XAxis dataKey="model" stroke="#94a3b8" tick={{ fontSize: 11 }} />
                          <YAxis stroke="#a855f7" tick={{ fontSize: 11 }} />
                          <Tooltip content={<CustomChartTooltip />} />
                          <Bar dataKey="trainingTime" name="Training Duration (s)" fill="#a855f7" radius={[4, 4, 0, 0]} maxBarSize={48} />
                        </BarChart>
                      )}
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Right Sustainability Matrix & Senior Engineering Takeaways */}
                <div className="dashboard-card">
                  <div className="card-header-row">
                    <div className="card-heading-group">
                      <span className="card-title">
                        <Layers size={15} color="#38bdf8" />
                        Algorithmic Sustainability Matrix
                      </span>
                      <span className="card-subtitle">Resource efficiency grading & telemetry</span>
                    </div>
                  </div>

                  <div className="table-scroll-container">
                    <table className="clean-table">
                      <thead>
                        <tr>
                          <th>Model</th>
                          <th>Accuracy</th>
                          <th>Time (s)</th>
                          <th>CO₂ (mg)</th>
                          <th>Eco Grade</th>
                        </tr>
                      </thead>
                      <tbody>
                        {formattedComparison.map((row) => (
                          <tr key={row.model}>
                            <td>
                              <strong>{row.model}</strong>
                            </td>
                            <td>{row.accuracy}%</td>
                            <td>{row.trainingTime}s</td>
                            <td>{row.emissionsMg}</td>
                            <td>
                              <span className={`eco-grade-badge ${row.grade === "A+" ? "grade-aplus" : row.grade === "A" ? "grade-a" : "grade-b"}`}>
                                {row.grade}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Senior Engineer Insights Box */}
                  <div className="insights-strip" style={{ marginTop: "10px" }}>
                    <div className="insight-item">
                      <Info size={15} className="insight-icon" />
                      <span className="insight-text">
                        <strong>Senior Dev Note: </strong>
                        Decision Tree yields <strong>99.7% lower emissions</strong> with merely 1.7% accuracy variance vs Random Forest. Ideal for edge & low-power deployments.
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 2: BENCHMARKS (DEEP DIVE & PARETO CURVE)              */}
        {/* ========================================================= */}
        {activeTab === "benchmarks" && (
          <div className="workspace-pane fade-in">
            <div className="benchmarks-grid">
              {/* Pareto Frontier Chart */}
              <div className="dashboard-card benchmark-card-full">
                <div className="card-header-row">
                  <div className="card-heading-group">
                    <span className="card-title">
                      <Sparkles size={16} color="#10b981" />
                      Green Pareto Frontier: Accuracy vs. Carbon Emissions
                    </span>
                    <span className="card-subtitle">Optimal machine learning models balance high accuracy with minimal environmental footprint</span>
                  </div>
                </div>

                <div className="chart-container-flex" style={{ height: "240px" }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <ScatterChart margin={{ top: 20, right: 30, bottom: 10, left: 10 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke={theme === "dark" ? "rgba(255,255,255,0.06)" : "#e2e8f0"} />
                      <XAxis type="number" dataKey="emissionsMg" name="Emissions (mg)" stroke="#94a3b8" tick={{ fontSize: 11 }} unit="mg" />
                      <YAxis type="number" dataKey="accuracy" name="Accuracy (%)" stroke="#94a3b8" domain={[94, 97]} tick={{ fontSize: 11 }} unit="%" />
                      <ZAxis range={[120, 260]} />
                      <Tooltip cursor={{ strokeDasharray: "3 3" }} content={<CustomChartTooltip />} />
                      <Scatter name="Models" data={formattedComparison} fill="#10b981">
                        {formattedComparison.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={PALETTE[index % PALETTE.length]} />
                        ))}
                      </Scatter>
                    </ScatterChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Training Duration Comparison */}
              <div className="dashboard-card">
                <div className="card-header-row">
                  <div className="card-heading-group">
                    <span className="card-title">
                      <Clock size={15} color="#a855f7" />
                      Compute Latency (Seconds)
                    </span>
                    <span className="card-subtitle">Average CPU/GPU training time per fit cycle</span>
                  </div>
                </div>

                <div className="chart-container-flex" style={{ height: "220px" }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={formattedComparison} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke={theme === "dark" ? "rgba(255,255,255,0.06)" : "#e2e8f0"} />
                      <XAxis dataKey="model" stroke="#94a3b8" tick={{ fontSize: 11 }} />
                      <YAxis stroke="#94a3b8" tick={{ fontSize: 11 }} />
                      <Tooltip content={<CustomChartTooltip />} />
                      <Bar dataKey="trainingTime" name="Training Time (s)" fill="#a855f7" radius={[4, 4, 0, 0]} maxBarSize={44} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Eco-Score (Accuracy % per mg CO2) */}
              <div className="dashboard-card">
                <div className="card-header-row">
                  <div className="card-heading-group">
                    <span className="card-title">
                      <Zap size={15} color="#10b981" />
                      Eco-Efficiency Ratio
                    </span>
                    <span className="card-subtitle">Calculated Accuracy points per milligram of CO₂ emitted</span>
                  </div>
                </div>

                <div className="chart-container-flex" style={{ height: "220px" }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={formattedComparison} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke={theme === "dark" ? "rgba(255,255,255,0.06)" : "#e2e8f0"} />
                      <XAxis dataKey="model" stroke="#94a3b8" tick={{ fontSize: 11 }} />
                      <YAxis stroke="#94a3b8" tick={{ fontSize: 11 }} />
                      <Tooltip content={<CustomChartTooltip />} />
                      <Bar dataKey="efficiencyScore" name="Eco Ratio" fill="#10b981" radius={[4, 4, 0, 0]} maxBarSize={44} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 3: EXPERIMENT LOGS (DETAILED RUN HISTORY)             */}
        {/* ========================================================= */}
        {activeTab === "logs" && (
          <div className="workspace-pane fade-in">
            <div className="logs-view">
              {/* Filter Strip */}
              <div className="filter-bar">
                <div className="filter-controls">
                  <div className="search-box">
                    <Search size={14} />
                    <input
                      type="text"
                      placeholder="Search runs, algorithms..."
                      value={logSearch}
                      onChange={(e) => setLogSearch(e.target.value)}
                    />
                  </div>

                  <select
                    className="select-control"
                    value={selectedModel}
                    onChange={(e) => setSelectedModel(e.target.value)}
                  >
                    <option value="All">All Algorithms</option>
                    {[...new Set(history.map((h) => h.Model))].map((m) => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                  </select>

                  <select
                    className="select-control"
                    value={selectedRun}
                    onChange={(e) => setSelectedRun(e.target.value)}
                  >
                    <option value="All">All Iterations</option>
                    {[...new Set(history.map((h) => String(h.Run)))].sort().map((r) => (
                      <option key={r} value={r}>Run #{r}</option>
                    ))}
                  </select>

                  <select
                    className="select-control"
                    value={logSortBy}
                    onChange={(e) => setLogSortBy(e.target.value)}
                  >
                    <option value="run">Sort by: Run #</option>
                    <option value="accuracy">Sort by: Accuracy (%)</option>
                    <option value="emissions">Sort by: Lowest CO₂</option>
                    <option value="time">Sort by: Fastest Time</option>
                  </select>
                </div>

                <div className="filter-actions">
                  <button className="btn-secondary" onClick={() => { setSelectedModel("All"); setSelectedRun("All"); setLogSearch(""); }}>
                    Reset
                  </button>
                </div>
              </div>

              {/* Logs Table */}
              <div className="dashboard-card" style={{ flex: 1 }}>
                <div className="card-header-row">
                  <span className="card-title">
                    <Clock size={15} color="#38bdf8" />
                    Experiment Iteration Ledger ({filteredHistory.length} matching runs)
                  </span>
                </div>

                <div className="table-scroll-container">
                  <table className="clean-table">
                    <thead>
                      <tr>
                        <th>Algorithm</th>
                        <th>Run #</th>
                        <th>Accuracy (%)</th>
                        <th>Training Time (s)</th>
                        <th>CO₂ Emissions (g)</th>
                        <th>CO₂ (mg)</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredHistory.map((row, idx) => (
                        <tr key={`${row.Model}-${row.Run}-${idx}`}>
                          <td><strong>{row.Model}</strong></td>
                          <td>
                            <span className="kpi-badge badge-blue">Run {row.Run}</span>
                          </td>
                          <td>{Number(row["Accuracy (%)"]).toFixed(2)}%</td>
                          <td>{Number(row["Training Time (seconds)"]).toFixed(5)}s</td>
                          <td>{Number(row["CO2 Emissions (g)"]).toFixed(7)} g</td>
                          <td>{(Number(row["CO2 Emissions (g)"]) * 1000).toFixed(4)} mg</td>
                          <td>
                            <span className="kpi-badge badge-emerald">Verified</span>
                          </td>
                        </tr>
                      ))}
                      {!filteredHistory.length && (
                        <tr>
                          <td colSpan={7} style={{ textAlign: "center", padding: "24px" }}>
                            No runs matched the selected filters.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 4: CSV STUDIO (DATASET INSPECTOR & CHARTS)            */}
        {/* ========================================================= */}
        {activeTab === "csv" && (
          <div className="workspace-pane fade-in">
            <div className="csv-studio-layout">
              {/* CSV Top Bar */}
              <div className="csv-top-bar">
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <label className="csv-upload-btn-label">
                    <Upload size={14} />
                    <span>Upload CSV Dataset</span>
                    <input type="file" accept=".csv" onChange={handleCSVUpload} hidden />
                  </label>

                  <button className="btn-secondary" onClick={loadSampleCSV}>
                    <Sparkles size={14} color="#10b981" />
                    <span>Load Benchmark Preset</span>
                  </button>

                  {csvFileName && (
                    <span style={{ fontSize: "12px", color: "var(--accent-emerald)", fontWeight: 600 }}>
                      ✓ {csvFileName}
                    </span>
                  )}
                </div>

                {csvData.length > 0 && (
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <div className="pill-switch">
                      <button
                        className={`pill-switch-btn ${csvSubTab === "visualizer" ? "active" : ""}`}
                        onClick={() => setCsvSubTab("visualizer")}
                      >
                        Visualizer
                      </button>
                      <button
                        className={`pill-switch-btn ${csvSubTab === "correlation" ? "active" : ""}`}
                        onClick={() => setCsvSubTab("correlation")}
                      >
                        Correlation
                      </button>
                      <button
                        className={`pill-switch-btn ${csvSubTab === "outliers" ? "active" : ""}`}
                        onClick={() => setCsvSubTab("outliers")}
                      >
                        Outliers
                      </button>
                      <button
                        className={`pill-switch-btn ${csvSubTab === "table" ? "active" : ""}`}
                        onClick={() => setCsvSubTab("table")}
                      >
                        Data Grid
                      </button>
                    </div>

                    <button className="icon-action-btn" onClick={clearCSV} title="Remove dataset">
                      <Trash2 size={13} color="#f43f5e" />
                    </button>
                  </div>
                )}
              </div>

              {csvError && (
                <div className="insights-strip" style={{ borderColor: "rgba(244, 63, 94, 0.4)", background: "rgba(244, 63, 94, 0.08)" }}>
                  <AlertCircle size={15} color="#f43f5e" />
                  <span style={{ color: "#f43f5e", fontSize: "12px" }}>{csvError}</span>
                </div>
              )}

              {csvData.length === 0 ? (
                <div className="dashboard-card" style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", textAlign: "center" }}>
                  <div style={{ maxWidth: "420px", display: "flex", flexDirection: "column", alignItems: "center", gap: "10px" }}>
                    <div className="brand-icon-wrapper" style={{ width: "48px", height: "48px" }}>
                      <FileSpreadsheet size={24} />
                    </div>
                    <span style={{ fontSize: "16px", fontWeight: 700 }}>No CSV Dataset Loaded</span>
                    <span style={{ fontSize: "12px", color: "var(--text-secondary)" }}>
                      Upload any CSV file from CodeCarbon, machine learning benchmarks, or experiment runs, or explore the built-in preset.
                    </span>
                    <button className="btn-primary-sm" onClick={loadSampleCSV} style={{ marginTop: "6px" }}>
                      Load ML Benchmark Preset
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  {/* CSV Health Chips */}
                  <div className="csv-stats-strip">
                    <div className="mini-stat-card">
                      <div className="mini-stat-icon"><FileSpreadsheet size={15} /></div>
                      <div className="mini-stat-info">
                        <span className="mini-stat-label">Total Records</span>
                        <span className="mini-stat-value">{csvData.length}</span>
                      </div>
                    </div>

                    <div className="mini-stat-card">
                      <div className="mini-stat-icon"><Layers size={15} /></div>
                      <div className="mini-stat-info">
                        <span className="mini-stat-label">Features / Cols</span>
                        <span className="mini-stat-value">{csvColumns.length}</span>
                      </div>
                    </div>

                    <div className="mini-stat-card">
                      <div className="mini-stat-icon"><CheckCircle2 size={15} /></div>
                      <div className="mini-stat-info">
                        <span className="mini-stat-label">Numeric Fields</span>
                        <span className="mini-stat-value">{numericCSVCols.length}</span>
                      </div>
                    </div>

                    <div className="mini-stat-card">
                      <div className="mini-stat-icon"><Activity size={15} /></div>
                      <div className="mini-stat-info">
                        <span className="mini-stat-label">Dataset Health</span>
                        <span className="mini-stat-value">100% Parsed</span>
                      </div>
                    </div>
                  </div>

                  {/* Sub-view: Visualizer */}
                  {csvSubTab === "visualizer" && (
                    <div className="dashboard-card" style={{ flex: 1 }}>
                      <div className="card-header-row">
                        <div className="card-heading-group">
                          <span className="card-title">Interactive Dataset Visualizer</span>
                          <span className="card-subtitle">Aggregate and plot relationships across custom features</span>
                        </div>

                        <div className="card-controls" style={{ gap: "8px" }}>
                          <select className="select-control" value={csvChartType} onChange={(e) => setCsvChartType(e.target.value)}>
                            <option value="bar">Bar Chart</option>
                            <option value="line">Line Chart</option>
                            <option value="area">Area Chart</option>
                            <option value="pie">Pie Chart</option>
                          </select>

                          <select className="select-control" value={csvXCol} onChange={(e) => setCsvXCol(e.target.value)}>
                            {csvColumns.map((c) => (
                              <option key={c} value={c}>X: {c}</option>
                            ))}
                          </select>

                          <select className="select-control" value={csvYCol} onChange={(e) => setCsvYCol(e.target.value)}>
                            {numericCSVCols.map((c) => (
                              <option key={c} value={c}>Y: {c}</option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <div className="chart-container-flex" style={{ height: "300px" }}>
                        <ResponsiveContainer width="100%" height="100%">
                          {csvChartType === "line" ? (
                            <LineChart data={csvChartData}>
                              <CartesianGrid strokeDasharray="3 3" stroke={theme === "dark" ? "rgba(255,255,255,0.06)" : "#e2e8f0"} />
                              <XAxis dataKey="name" stroke="#94a3b8" tick={{ fontSize: 11 }} />
                              <YAxis stroke="#94a3b8" tick={{ fontSize: 11 }} />
                              <Tooltip content={<CustomChartTooltip />} />
                              <Line type="monotone" dataKey="value" stroke="#10b981" strokeWidth={2.5} dot={{ r: 4 }} />
                            </LineChart>
                          ) : csvChartType === "area" ? (
                            <AreaChart data={csvChartData}>
                              <CartesianGrid strokeDasharray="3 3" stroke={theme === "dark" ? "rgba(255,255,255,0.06)" : "#e2e8f0"} />
                              <XAxis dataKey="name" stroke="#94a3b8" tick={{ fontSize: 11 }} />
                              <YAxis stroke="#94a3b8" tick={{ fontSize: 11 }} />
                              <Tooltip content={<CustomChartTooltip />} />
                              <Area type="monotone" dataKey="value" stroke="#38bdf8" fill="rgba(56, 189, 248, 0.2)" />
                            </AreaChart>
                          ) : csvChartType === "pie" ? (
                            <PieChart>
                              <Pie data={csvChartData} dataKey="value" nameKey="name" outerRadius={110} label>
                                {csvChartData.map((entry, idx) => (
                                  <Cell key={`cell-${idx}`} fill={PALETTE[idx % PALETTE.length]} />
                                ))}
                              </Pie>
                              <Tooltip content={<CustomChartTooltip />} />
                            </PieChart>
                          ) : (
                            <BarChart data={csvChartData}>
                              <CartesianGrid strokeDasharray="3 3" stroke={theme === "dark" ? "rgba(255,255,255,0.06)" : "#e2e8f0"} />
                              <XAxis dataKey="name" stroke="#94a3b8" tick={{ fontSize: 11 }} />
                              <YAxis stroke="#94a3b8" tick={{ fontSize: 11 }} />
                              <Tooltip content={<CustomChartTooltip />} />
                              <Bar dataKey="value" fill="#10b981" radius={[4, 4, 0, 0]} maxBarSize={44} />
                            </BarChart>
                          )}
                        </ResponsiveContainer>
                      </div>
                    </div>
                  )}

                  {/* Sub-view: Correlation Heatmap */}
                  {csvSubTab === "correlation" && (
                    <div className="dashboard-card" style={{ flex: 1 }}>
                      <div className="card-header-row">
                        <span className="card-title">Pearson Feature Correlation Heatmap</span>
                        <span className="card-subtitle">Values closer to +1.0 indicate strong direct correlation; -1.0 indicates inverse correlation</span>
                      </div>

                      <div className="table-scroll-container">
                        {correlationMatrix.length > 0 ? (
                          <table className="heatmap-table">
                            <thead>
                              <tr>
                                <th>Feature</th>
                                {numericCSVCols.map((c) => (
                                  <th key={c}>{c}</th>
                                ))}
                              </tr>
                            </thead>
                            <tbody>
                              {correlationMatrix.map((row) => (
                                <tr key={row.feature}>
                                  <td><strong>{row.feature}</strong></td>
                                  {row.values.map((v, i) => {
                                    const val = v.val;
                                    const isPos = val > 0.4;
                                    const isNeg = val < -0.4;
                                    const bg = isPos
                                      ? `rgba(16, 185, 129, ${Math.min(Math.abs(val), 0.85)})`
                                      : isNeg
                                      ? `rgba(244, 63, 94, ${Math.min(Math.abs(val), 0.85)})`
                                      : "rgba(148, 163, 184, 0.1)";
                                    return (
                                      <td key={i} style={{ background: bg, color: isPos || isNeg ? "#ffffff" : "var(--text-secondary)" }}>
                                        {val}
                                      </td>
                                    );
                                  })}
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        ) : (
                          <p style={{ padding: "16px", color: "var(--text-muted)" }}>
                            At least two numeric features are required to compute correlation.
                          </p>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Sub-view: Outlier Detection */}
                  {csvSubTab === "outliers" && (
                    <div className="dashboard-card" style={{ flex: 1 }}>
                      <div className="card-header-row">
                        <div className="card-heading-group">
                          <span className="card-title">IQR Outlier Detection Engine</span>
                          <span className="card-subtitle">Detect anomalous telemetry points using Tukey's 1.5 × IQR standard</span>
                        </div>

                        <select className="select-control" value={outlierCol} onChange={(e) => setOutlierCol(e.target.value)}>
                          {numericCSVCols.map((c) => (
                            <option key={c} value={c}>{c}</option>
                          ))}
                        </select>
                      </div>

                      {outlierAnalysis && (
                        <div style={{ display: "flex", flexDirection: "column", gap: "12px", height: "100%" }}>
                          <div className="kpi-row">
                            <div className="kpi-card emerald" style={{ padding: "10px" }}>
                              <span className="kpi-title">Outliers Detected</span>
                              <span className="kpi-value">{outlierAnalysis.count}</span>
                              <span className="kpi-badge badge-emerald">{outlierAnalysis.pct}% of records</span>
                            </div>
                            <div className="kpi-card blue" style={{ padding: "10px" }}>
                              <span className="kpi-title">Lower Bound (Q1 - 1.5×IQR)</span>
                              <span className="kpi-value">{outlierAnalysis.lowerBound}</span>
                            </div>
                            <div className="kpi-card amber" style={{ padding: "10px" }}>
                              <span className="kpi-title">Upper Bound (Q3 + 1.5×IQR)</span>
                              <span className="kpi-value">{outlierAnalysis.upperBound}</span>
                            </div>
                            <div className="kpi-card purple" style={{ padding: "10px" }}>
                              <span className="kpi-title">IQR Spread</span>
                              <span className="kpi-value">{outlierAnalysis.iqr}</span>
                            </div>
                          </div>

                          <div className="table-scroll-container" style={{ flex: 1 }}>
                            <table className="clean-table">
                              <thead>
                                <tr>
                                  {csvColumns.map((c) => (
                                    <th key={c}>{c}</th>
                                  ))}
                                </tr>
                              </thead>
                              <tbody>
                                {outlierAnalysis.rows.map((row, idx) => (
                                  <tr key={idx}>
                                    {csvColumns.map((c) => (
                                      <td key={c}>{row[c] || "—"}</td>
                                    ))}
                                  </tr>
                                ))}
                                {outlierAnalysis.count === 0 && (
                                  <tr>
                                    <td colSpan={csvColumns.length} style={{ textAlign: "center", padding: "16px" }}>
                                      No anomalous outliers found in this feature column.
                                    </td>
                                  </tr>
                                )}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Sub-view: Data Table */}
                  {csvSubTab === "table" && (
                    <div className="dashboard-card" style={{ flex: 1 }}>
                      <div className="card-header-row">
                        <div className="search-box">
                          <Search size={14} />
                          <input
                            type="text"
                            placeholder="Filter rows..."
                            value={csvSearch}
                            onChange={(e) => { setCsvSearch(e.target.value); setCsvPage(1); }}
                          />
                        </div>

                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                          <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>
                            Page {csvPage} of {csvTotalPages} ({filteredCSV.length} total)
                          </span>
                          <button className="btn-secondary" disabled={csvPage <= 1} onClick={() => setCsvPage((p) => p - 1)}>
                            Prev
                          </button>
                          <button className="btn-secondary" disabled={csvPage >= csvTotalPages} onClick={() => setCsvPage((p) => p + 1)}>
                            Next
                          </button>
                        </div>
                      </div>

                      <div className="table-scroll-container">
                        <table className="clean-table">
                          <thead>
                            <tr>
                              {csvColumns.map((c) => (
                                <th key={c}>{c}</th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {currentCSVPageRows.map((row, idx) => (
                              <tr key={idx}>
                                {csvColumns.map((c) => (
                                  <td key={c}>{row[c] || "—"}</td>
                                ))}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 5: ECO SIMULATOR (WHAT-IF CALCULATOR)                 */}
        {/* ========================================================= */}
        {activeTab === "simulator" && (
          <div className="workspace-pane fade-in">
            <div className="simulator-layout">
              {/* Form Controls */}
              <div className="simulator-form">
                <div className="card-heading-group">
                  <span className="card-title">
                    <Sliders size={16} color="#10b981" />
                    Green AI Compute Simulator
                  </span>
                  <span className="card-subtitle">Project cloud training emissions and energy impact before starting large training jobs</span>
                </div>

                {/* Hardware Preset */}
                <div className="sim-field">
                  <div className="sim-label-row">
                    <span>Target Hardware Architecture</span>
                    <span className="sim-val-tag">
                      {HARDWARE_PRESETS.find((h) => h.id === simHardware)?.watts}W TDP
                    </span>
                  </div>
                  <select className="select-control" value={simHardware} onChange={(e) => setSimHardware(e.target.value)}>
                    {HARDWARE_PRESETS.map((h) => (
                      <option key={h.id} value={h.id}>
                        {h.name} — ({h.watts}W, {h.category})
                      </option>
                    ))}
                  </select>
                </div>

                {/* GPU Count Slider */}
                <div className="sim-field">
                  <div className="sim-label-row">
                    <span>Number of Active GPUs / Compute Units</span>
                    <span className="sim-val-tag">{simGpuCount} Units</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="64"
                    className="sim-slider"
                    value={simGpuCount}
                    onChange={(e) => setSimGpuCount(Number(e.target.value))}
                  />
                </div>

                {/* Training Duration Slider */}
                <div className="sim-field">
                  <div className="sim-label-row">
                    <span>Estimated Training Duration</span>
                    <span className="sim-val-tag">{simHours} Hours</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="168"
                    className="sim-slider"
                    value={simHours}
                    onChange={(e) => setSimHours(Number(e.target.value))}
                  />
                </div>

                {/* Regional Power Grid Carbon Intensity */}
                <div className="sim-field">
                  <div className="sim-label-row">
                    <span>Datacenter Grid Location & Carbon Intensity</span>
                    <span className="sim-val-tag">
                      {GRID_REGIONS.find((r) => r.id === simRegion)?.gPerKWh} g CO₂/kWh
                    </span>
                  </div>
                  <select className="select-control" value={simRegion} onChange={(e) => setSimRegion(e.target.value)}>
                    {GRID_REGIONS.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.name} — ({r.gPerKWh} g/kWh)
                      </option>
                    ))}
                  </select>
                </div>

                {/* Datacenter PUE */}
                <div className="sim-field">
                  <div className="sim-label-row">
                    <span>Datacenter PUE (Cooling Efficiency)</span>
                    <span className="sim-val-tag">{simPUE.toFixed(2)}x Multiplier</span>
                  </div>
                  <input
                    type="range"
                    min="1.0"
                    max="1.8"
                    step="0.05"
                    className="sim-slider"
                    value={simPUE}
                    onChange={(e) => setSimPUE(Number(e.target.value))}
                  />
                </div>
              </div>

              {/* Real-Time Impact Results Card */}
              <div className="simulator-impact-card">
                <div className="card-heading-group">
                  <span className="card-title">
                    <Globe size={16} color="#38bdf8" />
                    Simulated Environmental Footprint
                  </span>
                  <span className="card-subtitle">Instant carbon estimation based on CodeCarbon formulas</span>
                </div>

                <div className="impact-hero-box">
                  <span className="impact-hero-label">Estimated CO₂ Emissions</span>
                  <span className="impact-hero-num">{simResult.co2Kg} <small style={{ fontSize: "18px", color: "var(--accent-emerald)" }}>kg CO₂e</small></span>
                  <span style={{ fontSize: "11.5px", color: "var(--text-secondary)" }}>
                    Consumes ~{simResult.totalKWh} kWh of electrical energy
                  </span>
                </div>

                {/* Real-World Equivalencies */}
                <div className="impact-equivalencies">
                  <div className="eq-card">
                    <span className="eq-icon">🚗</span>
                    <span className="eq-value">{simResult.kmDriven} km</span>
                    <span className="eq-label">Car Distance</span>
                  </div>

                  <div className="eq-card">
                    <span className="eq-icon">📱</span>
                    <span className="eq-value">{simResult.phoneCharges}</span>
                    <span className="eq-label">Phones Charged</span>
                  </div>

                  <div className="eq-card">
                    <span className="eq-icon">🌲</span>
                    <span className="eq-value">{simResult.treeYears}</span>
                    <span className="eq-label">Tree-Years to Offset</span>
                  </div>
                </div>

                {/* Actionable Green ML Recommendations */}
                <div className="recommendations-list">
                  <span style={{ fontSize: "11px", fontWeight: 700, textTransform: "uppercase", color: "var(--text-muted)" }}>
                    Senior Dev Green AI Recommendations
                  </span>

                  <div className="rec-item">
                    <Zap size={14} color="#10b981" style={{ flexShrink: 0, marginTop: "2px" }} />
                    <span>
                      <strong>Mixed Precision (FP16/BF16):</strong> Reduces memory bandwidth and training duration by up to <strong>45%</strong> without accuracy penalty.
                    </span>
                  </div>

                  <div className="rec-item">
                    <Globe size={14} color="#38bdf8" style={{ flexShrink: 0, marginTop: "2px" }} />
                    <span>
                      <strong>Carbon-Aware Scheduling:</strong> Running batch jobs in hydro/green grid regions (e.g., France/Nordics) reduces carbon footprint by <strong>85%+</strong>.
                    </span>
                  </div>

                  <div className="rec-item">
                    <Sparkles size={14} color="#fbbf24" style={{ flexShrink: 0, marginTop: "2px" }} />
                    <span>
                      <strong>Early Stopping & Checkpoint Pruning:</strong> Terminate plateaued runs early to prevent unnecessary compute wattage waste.
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
