import numpy as np
import pandas as pd
import random
from pathlib import Path

# ─── Fault class definitions ────────────────────────────────────────────────
FAULT_CLASSES = {
    0: "Normal",
    1: "Overtemperature",
    2: "Grid_Undervoltage",
    3: "Grid_Overvoltage",
    4: "IGBT_Fault",
    5: "DC_String_Fault",
    6: "Communication_Timeout",
    7: "Phase_Imbalance",
}

N_SAMPLES_PER_CLASS = 6250   # 50k total
NORMAL_SAMPLES = 6250


def _normal_operational():
    """Generate a realistic nominal solar inverter reading."""
    irradiance = random.uniform(200, 1100)  # W/m²
    power_factor = float(np.random.normal(0.98, 0.01))
    power_factor = float(np.clip(power_factor, 0.92, 1.0))

    vab = random.uniform(400, 420)
    vbc = vab + random.uniform(-3, 3)
    vac = vab + random.uniform(-3, 3)

    ia = random.uniform(20, 60)
    ib = ia + random.uniform(-1, 1)
    ic = ia + random.uniform(-1, 1)

    active_power = (vab * ia * power_factor * np.sqrt(3)) / 1000  # kW approx
    reactive_power = active_power * random.uniform(0.0, 0.2)
    freq = random.uniform(49.8, 50.2)
    temp = random.uniform(25, 48)

    return {
        "voltage_ab": round(vab, 2),
        "voltage_bc": round(vbc, 2),
        "voltage_ac": round(vac, 2),
        "current_a": round(ia, 2),
        "current_b": round(ib, 2),
        "current_c": round(ic, 2),
        "active_power": round(float(active_power), 2),
        "reactive_power": round(float(reactive_power), 2),
        "frequency": round(freq, 3),
        "temperature": round(temp, 1),
        "irradiance": round(irradiance, 1),
    }


def _inject_fault(base: dict, fault_class: int) -> dict:
    """Inject physics-accurate deviations for each fault type."""
    d = base.copy()

    if fault_class == 1:  # Overtemperature
        d["temperature"] = round(random.uniform(55, 85), 1)
        d["active_power"] *= random.uniform(0.7, 0.95)  # slight derating

    elif fault_class == 2:  # Grid Undervoltage
        drop = random.uniform(0.75, 0.93)
        d["voltage_ab"] = round(d["voltage_ab"] * drop, 2)
        d["voltage_bc"] = round(d["voltage_bc"] * drop, 2)
        d["voltage_ac"] = round(d["voltage_ac"] * drop, 2)
        d["frequency"] = round(random.uniform(48.0, 49.5), 3)

    elif fault_class == 3:  # Grid Overvoltage
        boost = random.uniform(1.08, 1.20)
        d["voltage_ab"] = round(d["voltage_ab"] * boost, 2)
        d["voltage_bc"] = round(d["voltage_bc"] * boost, 2)
        d["voltage_ac"] = round(d["voltage_ac"] * boost, 2)
        d["frequency"] = round(random.uniform(50.5, 51.5), 3)

    elif fault_class == 4:  # IGBT Fault — asymmetric currents
        # One phase current spikes or drops dramatically
        phase = random.choice(["current_a", "current_b", "current_c"])
        d[phase] = round(d[phase] * random.uniform(0.1, 0.3), 2)
        d["temperature"] = round(random.uniform(50, 70), 1)

    elif fault_class == 5:  # DC String Fault — power low vs irradiance
        d["active_power"] = round(d["active_power"] * random.uniform(0.05, 0.25), 2)
        d["current_a"] = round(d["current_a"] * random.uniform(0.05, 0.25), 2)
        d["current_b"] = round(d["current_b"] * random.uniform(0.05, 0.25), 2)
        d["current_c"] = round(d["current_c"] * random.uniform(0.05, 0.25), 2)
        # irradiance stays high — that's the key anomaly

    elif fault_class == 6:  # Communication Timeout — all zeros
        d.update({
            "voltage_ab": 0.0, "voltage_bc": 0.0, "voltage_ac": 0.0,
            "current_a": 0.0, "current_b": 0.0, "current_c": 0.0,
            "active_power": 0.0, "reactive_power": 0.0,
            "frequency": 0.0, "temperature": round(random.uniform(20, 35), 1),
        })

    elif fault_class == 7:  # Phase Imbalance
        imbalance = random.uniform(0.06, 0.20)
        d["voltage_bc"] = round(d["voltage_ab"] * (1 + imbalance), 2)
        d["voltage_ac"] = round(d["voltage_ab"] * (1 - imbalance / 2), 2)
        d["current_b"] = round(d["current_a"] * (1 + imbalance), 2)
        d["current_c"] = round(d["current_a"] * (1 - imbalance / 2), 2)

    d["active_power"] = round(max(0.0, float(d["active_power"])), 2)
    return d


def build_features(d: dict) -> dict:
    """Compute derived features from raw telemetry."""
    voltages = [d["voltage_ab"], d["voltage_bc"], d["voltage_ac"]]
    currents = [d["current_a"], d["current_b"], d["current_c"]]

    v_mean = np.mean(voltages) or 1e-9
    c_mean = np.mean(currents) or 1e-9

    voltage_imbalance = (max(voltages) - min(voltages)) / v_mean
    current_imbalance = (max(currents) - min(currents)) / c_mean

    apparent_power = (v_mean * c_mean * np.sqrt(3)) / 1000 + 1e-9
    power_factor = min(d["active_power"] / float(apparent_power), 1.0)
    power_to_irradiance = d["active_power"] / (d["irradiance"] + 1e-9)

    return {
        **d,
        "voltage_imbalance": round(float(voltage_imbalance), 4),
        "current_imbalance": round(float(current_imbalance), 4),
        "power_factor": round(float(power_factor), 4),
        "power_to_irradiance": round(float(power_to_irradiance), 6),
    }


def generate_dataset() -> pd.DataFrame:
    records = []

    # Normal samples
    for _ in range(NORMAL_SAMPLES):
        base = _normal_operational()
        row = build_features(base)
        row["fault_class"] = 0
        row["fault_label"] = FAULT_CLASSES[0]
        records.append(row)

    # Fault samples
    for fault_class in range(1, 8):
        for _ in range(N_SAMPLES_PER_CLASS):
            base = _normal_operational()
            faulted = _inject_fault(base, fault_class)
            row = build_features(faulted)
            row["fault_class"] = fault_class
            row["fault_label"] = FAULT_CLASSES[fault_class]
            records.append(row)

    df = pd.DataFrame(records)
    df = df.sample(frac=1, random_state=42).reset_index(drop=True)
    return df


if __name__ == "__main__":
    out_dir = Path(__file__).parent / "data"
    out_dir.mkdir(exist_ok=True)
    df = generate_dataset()
    out_path = out_dir / "training.csv"
    df.to_csv(out_path, index=False)
    print(f"✅ Dataset generated: {len(df)} samples → {out_path}")
    print(df["fault_label"].value_counts())
