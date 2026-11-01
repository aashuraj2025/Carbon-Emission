import os
import time
import pandas as pd

from codecarbon import OfflineEmissionsTracker

from sklearn.datasets import load_breast_cancer
from sklearn.model_selection import train_test_split
from sklearn.linear_model import LogisticRegression
from sklearn.tree import DecisionTreeClassifier
from sklearn.ensemble import RandomForestClassifier


def compare_models():

    print("\n===== ML MODEL CARBON COMPARISON =====")

    os.makedirs("results", exist_ok=True)

    # Load dataset
    data = load_breast_cancer()

    X = data.data
    y = data.target

    X_train, X_test, y_train, y_test = train_test_split(
        X,
        y,
        test_size=0.2,
        random_state=42
    )

    models = {
        "Logistic Regression": LogisticRegression(max_iter=2000),
        "Decision Tree": DecisionTreeClassifier(random_state=42),
        "Random Forest": RandomForestClassifier(
            n_estimators=100,
            random_state=42
        )
    }

    results = []

    for name, model in models.items():

        print(f"\nTraining {name}...")

        tracker = OfflineEmissionsTracker(
            project_name=name,
            country_iso_code="IND",
            output_dir="results",
            output_file=f"{name.replace(' ', '_').lower()}_emissions.csv",
            log_level="error",
            measure_power_secs=1
        )

        emissions = None
        start_time = time.perf_counter()

        try:
            tracker.start()
            model.fit(X_train, y_train)

        finally:
            emissions = tracker.stop()

        training_time = time.perf_counter() - start_time

        accuracy = model.score(X_test, y_test)

        emission_grams = (
            emissions * 1000 if emissions is not None else None
        )

        results.append({
            "Model": name,
            "Accuracy (%)": round(accuracy * 100, 2),
            "Training Time (seconds)": round(training_time, 4),
            "CO2 Emissions (g)": emission_grams
        })

        print("Accuracy:", round(accuracy * 100, 2), "%")
        print("Training Time:", round(training_time, 4), "seconds")
        print("CO2 Emissions:", emission_grams, "g")

    # Save comparison report
    df = pd.DataFrame(results)

    df.to_csv(
        "results/model_comparison.csv",
        index=False
    )

    print("\n===== FINAL MODEL COMPARISON =====")
    print(df.to_string(index=False))

    print("\nReport saved to results/model_comparison.csv")


if __name__ == "__main__":
    compare_models()
