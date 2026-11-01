// Fallback data bundled directly so the application is immediately interactive
// even before the Python Flask backend is started.

export const FALLBACK_COMPARISON = [
  {
    "Model": "Decision Tree",
    "Accuracy (%)": 94.73684210526315,
    "Training Time (seconds)": 0.00351132,
    "CO2 Emissions (g)": 0.000016990359569638893
  },
  {
    "Model": "Logistic Regression",
    "Accuracy (%)": 95.6140350877193,
    "Training Time (seconds)": 0.32921226,
    "CO2 Emissions (g)": 0.006546816856049911
  },
  {
    "Model": "Random Forest",
    "Accuracy (%)": 96.49122807017544,
    "Training Time (seconds)": 0.09717904,
    "CO2 Emissions (g)": 0.0026591718402351845
  }
];

export const FALLBACK_HISTORY = [
  { "Model": "Logistic Regression", "Run": 1, "Accuracy (%)": 95.614035, "Training Time (seconds)": 0.421990, "CO2 Emissions (g)": 0.00782808 },
  { "Model": "Logistic Regression", "Run": 2, "Accuracy (%)": 95.614035, "Training Time (seconds)": 0.271097, "CO2 Emissions (g)": 0.00549047 },
  { "Model": "Logistic Regression", "Run": 3, "Accuracy (%)": 95.614035, "Training Time (seconds)": 0.317871, "CO2 Emissions (g)": 0.00628038 },
  { "Model": "Logistic Regression", "Run": 4, "Accuracy (%)": 95.614035, "Training Time (seconds)": 0.282416, "CO2 Emissions (g)": 0.00583090 },
  { "Model": "Logistic Regression", "Run": 5, "Accuracy (%)": 95.614035, "Training Time (seconds)": 0.352687, "CO2 Emissions (g)": 0.00730424 },
  { "Model": "Decision Tree", "Run": 1, "Accuracy (%)": 94.736842, "Training Time (seconds)": 0.003538, "CO2 Emissions (g)": 0.00001083 },
  { "Model": "Decision Tree", "Run": 2, "Accuracy (%)": 94.736842, "Training Time (seconds)": 0.003571, "CO2 Emissions (g)": 0.00006097 },
  { "Model": "Decision Tree", "Run": 3, "Accuracy (%)": 94.736842, "Training Time (seconds)": 0.003612, "CO2 Emissions (g)": 0.00000232 },
  { "Model": "Decision Tree", "Run": 4, "Accuracy (%)": 94.736842, "Training Time (seconds)": 0.003424, "CO2 Emissions (g)": 0.00000557 },
  { "Model": "Decision Tree", "Run": 5, "Accuracy (%)": 94.736842, "Training Time (seconds)": 0.003411, "CO2 Emissions (g)": 0.00000526 },
  { "Model": "Random Forest", "Run": 1, "Accuracy (%)": 96.491228, "Training Time (seconds)": 0.090742, "CO2 Emissions (g)": 0.00267076 },
  { "Model": "Random Forest", "Run": 2, "Accuracy (%)": 96.491228, "Training Time (seconds)": 0.120237, "CO2 Emissions (g)": 0.00308557 },
  { "Model": "Random Forest", "Run": 3, "Accuracy (%)": 96.491228, "Training Time (seconds)": 0.088674, "CO2 Emissions (g)": 0.00243075 },
  { "Model": "Random Forest", "Run": 4, "Accuracy (%)": 96.491228, "Training Time (seconds)": 0.094606, "CO2 Emissions (g)": 0.00250619 },
  { "Model": "Random Forest", "Run": 5, "Accuracy (%)": 96.491228, "Training Time (seconds)": 0.091636, "CO2 Emissions (g)": 0.00260259 }
];

export const HARDWARE_PRESETS = [
  { id: "h100", name: "NVIDIA H100 SXM5", watts: 700, category: "Datacenter GPU" },
  { id: "a100", name: "NVIDIA A100 Tensor Core", watts: 400, category: "Datacenter GPU" },
  { id: "rtx4090", name: "NVIDIA RTX 4090", watts: 450, category: "Workstation GPU" },
  { id: "rtx3090", name: "NVIDIA RTX 3090", watts: 350, category: "Workstation GPU" },
  { id: "t4", name: "NVIDIA Tesla T4", watts: 70, category: "Edge/Inference GPU" },
  { id: "m2ultra", name: "Apple M2 Ultra (76-core)", watts: 90, category: "Unified SoC" },
  { id: "xeon", name: "Intel Xeon Platinum (Dual)", watts: 350, category: "Server CPU" },
  { id: "i9", name: "Intel Core i9 Desktop CPU", watts: 125, category: "Desktop CPU" }
];

export const GRID_REGIONS = [
  { id: "nordic", name: "Nordics / Hydro (Greenest)", gPerKWh: 28 },
  { id: "france", name: "France (Nuclear & Renewables)", gPerKWh: 56 },
  { id: "eu_avg", name: "European Union Average", gPerKWh: 230 },
  { id: "california", name: "US West (California / Hydro & Solar)", gPerKWh: 210 },
  { id: "us_avg", name: "United States Average", gPerKWh: 386 },
  { id: "india", name: "India National Grid", gPerKWh: 710 },
  { id: "coal_heavy", name: "Coal-Heavy Grid (Global Max)", gPerKWh: 880 }
];

export const SAMPLE_CSV_DATA = [
  { "Model": "Decision Tree", "Accuracy": "94.74", "Emissions_mg": "0.017", "Time_sec": "0.0035", "Energy_kWh": "0.00000004", "Samples": "455" },
  { "Model": "Logistic Regression", "Accuracy": "95.61", "Emissions_mg": "6.547", "Time_sec": "0.3292", "Energy_kWh": "0.00001550", "Samples": "455" },
  { "Model": "Random Forest", "Accuracy": "96.49", "Emissions_mg": "2.659", "Time_sec": "0.0972", "Energy_kWh": "0.00000630", "Samples": "455" },
  { "Model": "Gradient Boosting", "Accuracy": "96.05", "Emissions_mg": "4.821", "Time_sec": "0.2104", "Energy_kWh": "0.00001140", "Samples": "455" },
  { "Model": "Support Vector Machine", "Accuracy": "95.18", "Emissions_mg": "1.120", "Time_sec": "0.0450", "Energy_kWh": "0.00000260", "Samples": "455" },
  { "Model": "K-Nearest Neighbors", "Accuracy": "93.86", "Emissions_mg": "0.340", "Time_sec": "0.0120", "Energy_kWh": "0.00000080", "Samples": "455" },
  { "Model": "Multi-Layer Perceptron", "Accuracy": "96.20", "Emissions_mg": "8.950", "Time_sec": "0.4850", "Energy_kWh": "0.00002120", "Samples": "455" }
];
