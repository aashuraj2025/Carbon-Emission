import time
import pynvml


def monitor_gpu():

    initialized = False

    try:
        pynvml.nvmlInit()
        initialized = True

        handle = pynvml.nvmlDeviceGetHandleByIndex(0)

        print("\n===== GPU MONITORING STARTED =====")

        while True:

            print("--------------------------------")

            # GPU utilization
            try:
                utilization = pynvml.nvmlDeviceGetUtilizationRates(handle)
                print("GPU Usage:", utilization.gpu, "%")
            except pynvml.NVMLError:
                print("GPU Usage: Unavailable")

            # GPU memory
            try:
                memory = pynvml.nvmlDeviceGetMemoryInfo(handle)
                print("GPU Memory Used:",
                      round(memory.used / (1024 ** 2)), "MB")
                print("GPU Memory Total:",
                      round(memory.total / (1024 ** 2)), "MB")
            except pynvml.NVMLError:
                print("GPU Memory: Unavailable")

            # GPU temperature
            try:
                temperature = pynvml.nvmlDeviceGetTemperature(
                    handle, pynvml.NVML_TEMPERATURE_GPU
                )
                print("GPU Temperature:", temperature, "°C")
            except pynvml.NVMLError:
                print("GPU Temperature: Unavailable")

            # GPU power
            try:
                power = pynvml.nvmlDeviceGetPowerUsage(handle) / 1000
                print("GPU Power:", round(power, 2), "W")
            except pynvml.NVMLError:
                print("GPU Power: Unavailable")

            print("--------------------------------")

            time.sleep(2)

    except pynvml.NVMLError as error:
        print("GPU initialization error:", error)

    except KeyboardInterrupt:
        print("\nGPU monitoring stopped.")

    finally:
        if initialized:
            pynvml.nvmlShutdown()


if __name__ == "__main__":
    monitor_gpu()
