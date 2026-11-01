import os
import time
import pandas as pd

from codecarbon import OfflineEmissionsTracker

from sklearn.datasets import load_breast_cancer
from sklearn.model_selection import train_test_split
from sklearn.linear_model import LogisticRegression
from sklearn.tree import DecisionTreeClassifier
from sklearn.ensemble import RandomForestClassifier


def run_experiments():

    os.makedirs("results", exist_ok=True)

    data = load_breast_cancer()

    X_train, X_test, y_train, y_test = train_test_split(
        data.data,
        data.target,
        test_size=0.2,
        random_state=42
    )

    models = {
        "Logistic Regression": lambda: LogisticRegression(max_iter=2000),
        "Decision Tree": lambda: DecisionTreeClassifier(random_state=42),
        "Random Forest": lambda: RandomForestClassifier(
            n_estimators=100,
            random_state=42
        )
    }

    history = []

    for name, model_factory in models.items():

        print(f"\n===== {name} =====")

        for run in range(1, 6):

            model = model_factory()

            tracker = OfflineEmissionsTracker(
                project_name=f"{name}_Run_{run}",
                country_iso_code="IND",
                output_dir="results",
                output_file="experiment_emissions.csv",
                log_level="error",
                measure_power_secs=1
            )

            emissions = None

            try:
                tracker.start()

                start = time.perf_counter()
                model.fit(X_train, y_train)
                training_time = time.perf_counter() - start

            finally:
                emissions = tracker.stop()

            accuracy = model.score(X_test, y_test)

            history.append({
                "Model": name,
                "Run": run,
                "Accuracy (%)": accuracy * 100,
                "Training Time (seconds)": training_time,
                "CO2 Emissions (g)": (
                    emissions * 1000 if emissions is not None else None
                )
            })

            print(
                f"Run {run}: Accuracy={accuracy * 100:.2f}%, "
                f"Time={training_time:.4f}s, "
                f"CO2={emissions * 1000:.8f} g"
            )

    df = pd.DataFrame(history)

    df.to_csv(
        "results/experiment_history.csv",
        index=False
    )

    summary = df.groupby("Model").agg({
        "Accuracy (%)": "mean",
        "Training Time (seconds)": "mean",
        "CO2 Emissions (g)": "mean"
    }).reset_index()

    summary.to_csv(
        "results/experiment_summary.csv",
        index=False
    )

    print("\n===== AVERAGE EXPERIMENT RESULTS =====")
    print(summary.to_string(index=False))

    print("\nReports saved successfully!")


if __name__ == "__main__":
    run_experiments()
