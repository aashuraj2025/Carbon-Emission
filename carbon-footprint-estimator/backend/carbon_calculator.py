from codecarbon import OfflineEmissionsTracker

from sklearn.datasets import load_breast_cancer
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split


def calculate_carbon_footprint():

    print("\n===== CARBON FOOTPRINT CALCULATION =====")

    # 1. Load dataset
    print("\nLoading dataset...")

    data = load_breast_cancer()

    X = data.data
    y = data.target

    # 2. Split dataset
    X_train, X_test, y_train, y_test = train_test_split(
        X,
        y,
        test_size=0.2,
        random_state=42
    )

    print("Dataset loaded successfully!")

    # 3. Initialize CodeCarbon tracker
    tracker = OfflineEmissionsTracker(
        project_name="Carbon Footprint Estimator",
        country_iso_code="IND",
        output_dir="results",
        output_file="emissions.csv",
        log_level="error",
        measure_power_secs=1
    )

    emissions = None
    model = RandomForestClassifier(
        n_estimators=100,
        random_state=42
    )

    try:
        # 4. Start energy monitoring
        print("\nStarting energy monitoring...")

        tracker.start()

        # 5. Train ML model
        print("Training Random Forest model...")

        model.fit(X_train, y_train)

    finally:
        # 6. Stop energy monitoring
        emissions = tracker.stop()

    # 7. Evaluate model
    accuracy = model.score(X_test, y_test)

    # 8. Display results
    print("\n===== TRAINING RESULTS =====")

    print("Model: Random Forest")
    print("Training Samples:", len(X_train))
    print("Testing Samples:", len(X_test))
    print("Model Accuracy:", round(accuracy * 100, 2), "%")

    if emissions is not None:
        print(
            "Carbon Emissions:",
            round(emissions * 1000, 6),
            "g CO2eq"
        )
    else:
        print("Carbon emissions could not be estimated.")

    print("\nEnergy and emissions report:")
    print("results/emissions.csv")


if __name__ == "__main__":
    calculate_carbon_footprint()
