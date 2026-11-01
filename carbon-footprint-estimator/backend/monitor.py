import psutil
import time

def monitor_system():

    print("\n===== SYSTEM MONITORING STARTED =====")

    try:
        while True:

            # Get CPU usage
            cpu_usage = psutil.cpu_percent(interval=1)

            # Get RAM usage
            ram = psutil.virtual_memory()
            ram_usage = ram.percent

            # Display results
            print("----------------------------")
            print("CPU Usage:", cpu_usage, "%")
            print("RAM Usage:", ram_usage, "%")
            print("----------------------------")

            time.sleep(2)

    except KeyboardInterrupt:
        print("\nMonitoring stopped.")


if __name__ == "__main__":
    monitor_system()
