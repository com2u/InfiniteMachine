import time
import threading
import random
from flask import Flask, jsonify, request
from flask_cors import CORS

class MachineSimulator:
    def __init__(self):
        self.variables = {
            "generator1.value": 5,
            "generator1.temp": 20.1,
            "generator1.active": True,
            "generator2.value": 6,
            "generator2.temp": 20.1,
            "generator2.active": True,
            "generator3.value": 4,
            "generator3.temp": 19.9,
            "generator3.active": True,
            "akku1.capacity": 10000,
            "akku1.value": 0,
            "akku1.active": True,
            "akku2.capacity": 10000,
            "akku2.value": 0,
            "akku2.active": True,
            "akku3.capacity": 10000,
            "akku3.value": 0,
            "akku3.active": True,
            "aggregator.value": 0,
            "aggregator.active": True,
            "producer.consumption": 20,
            "producer.output": 0,
            "producer.active": True,
            "productCounter.value": 0,
            "room.temp": 20.0
        }
        self.cycle_count = 0
        self.running = False
        self.lock = threading.Lock() # Lock for thread-safe access to variables

    def status_dict(self):
        with self.lock:
            return self.variables.copy()

    def print_status(self): # Renamed from status to avoid conflict
        print("--- Machine Status ---")
        current_vars = self.status_dict()
        for key, value in sorted(current_vars.items()):
            print(f"{key}: {value}")
        print("----------------------")

    def update_variable(self, key, value):
        with self.lock:
            if key in self.variables:
                # Type conversion for values coming from frontend (usually strings)
                current_type = type(self.variables[key])
                try:
                    if current_type == bool:
                        self.variables[key] = str(value).lower() in ['true', '1', 'yes']
                    elif current_type == int:
                        self.variables[key] = int(value)
                    elif current_type == float:
                        self.variables[key] = float(value)
                    else:
                        self.variables[key] = value # Fallback for other types
                    
                    # Apply constraints for specific variables
                    if key == "generator1.value" or key == "generator2.value" or key == "generator3.value":
                        self.variables[key] = max(0, min(10, self.variables[key]))
                    if key == "producer.consumption":
                         self.variables[key] = max(1, min(10, int(value))) # Assuming consumption is int

                except ValueError:
                    print(f"Error: Could not convert value '{value}' for key '{key}' to {current_type}")
                return True
            return False

    def update_components(self):
        with self.lock:
            # Generator 1
            if not self.variables["generator1.active"]:
                self.variables["generator1.value"] = 0 # Keep it at user set value if active, otherwise 0
            if not self.variables["generator1.active"] and self.variables["generator1.temp"] > 20:
                self.variables["generator1.temp"] -= 0.1
                self.variables["generator1.temp"] = round(self.variables["generator1.temp"], 2)
            if self.variables["generator1.temp"] > 120:
                self.variables["generator1.active"] = False
            if self.variables["generator1.active"]:
                temp_change = (self.variables["generator1.value"] - 3) / 20
                self.variables["generator1.temp"] += temp_change
                self.variables["generator1.temp"] = round(max(20, self.variables["generator1.temp"]), 2)

            # Generator 2
            if not self.variables["generator2.active"]:
                self.variables["generator2.value"] = 0
            if not self.variables["generator2.active"] and self.variables["generator2.temp"] > 20:
                self.variables["generator2.temp"] -= 0.1
                self.variables["generator2.temp"] = round(self.variables["generator2.temp"], 2)
            if self.variables["generator2.active"]:
                temp_change = (self.variables["generator2.value"] - 3) / 20
                self.variables["generator2.temp"] += temp_change
                self.variables["generator2.temp"] = round(max(20, self.variables["generator2.temp"]), 2)
            if self.variables["generator2.temp"] > 120:
                self.variables["generator2.active"] = False

            # Generator 3
            if not self.variables["generator3.active"]:
                self.variables["generator3.value"] = 0
            if not self.variables["generator3.active"] and self.variables["generator3.temp"] > 20:
                self.variables["generator3.temp"] -= 0.1
                self.variables["generator3.temp"] = round(self.variables["generator3.temp"], 2)
            if self.variables["generator3.active"]:
                temp_change = (self.variables["generator3.value"] - 3) / 20
                self.variables["generator3.temp"] += temp_change
                self.variables["generator3.temp"] = round(max(20, self.variables["generator3.temp"]), 2)
            if self.variables["generator3.temp"] > 120:
                self.variables["generator3.active"] = False

            # Akkus
            if self.variables["akku1.active"] and self.variables["akku1.value"] < self.variables["akku1.capacity"]:
                self.variables["akku1.value"] += self.variables["generator1.value"]
                if self.variables["akku1.value"] > self.variables["akku1.capacity"]:
                    self.variables["akku1.value"] = self.variables["akku1.capacity"]
            if self.variables["akku2.active"] and self.variables["akku2.value"] < self.variables["akku2.capacity"]:
                self.variables["akku2.value"] += self.variables["generator2.value"]
                if self.variables["akku2.value"] > self.variables["akku2.capacity"]:
                    self.variables["akku2.value"] = self.variables["akku2.capacity"]
            if self.variables["akku3.active"] and self.variables["akku3.value"] < self.variables["akku3.capacity"]:
                self.variables["akku3.value"] += self.variables["generator3.value"]
                if self.variables["akku3.value"] > self.variables["akku3.capacity"]:
                    self.variables["akku3.value"] = self.variables["akku3.capacity"]
            
            # Aggregator
            if self.variables["aggregator.active"]:
                # Ensure akku values are positive before summing
                akku1_val = self.variables["akku1.value"] if self.variables["akku1.active"] else 0
                akku2_val = self.variables["akku2.value"] if self.variables["akku2.active"] else 0
                akku3_val = self.variables["akku3.value"] if self.variables["akku3.active"] else 0
                self.variables["aggregator.value"] = akku1_val + akku2_val + akku3_val
            else: 
                self.variables["aggregator.value"] = 0

            # Producer
            if self.variables["producer.active"] and self.variables["aggregator.active"] and self.variables["aggregator.value"] >= self.variables["producer.consumption"]:
                consumed_amount = self.variables["producer.consumption"]
                # self.variables["aggregator.value"] -= consumed_amount # This will be re-calculated from akkus
                self.variables["producer.output"] = 1

                active_akkus_with_charge = []
                if self.variables["akku1.active"] and self.variables["akku1.value"] > 0:
                    active_akkus_with_charge.append("akku1")
                if self.variables["akku2.active"] and self.variables["akku2.value"] > 0:
                    active_akkus_with_charge.append("akku2")
                if self.variables["akku3.active"] and self.variables["akku3.value"] > 0:
                    active_akkus_with_charge.append("akku3")
                
                if active_akkus_with_charge:
                    chosen_akku_key_base = random.choice(active_akkus_with_charge)
                    akku_value_key = f"{chosen_akku_key_base}.value"
                    
                    amount_to_drain = min(consumed_amount, self.variables[akku_value_key])
                    self.variables[akku_value_key] -= amount_to_drain
                    self.variables[akku_value_key] = max(0, self.variables[akku_value_key]) # Ensure not negative
                
                # Recalculate aggregator value after draining
                akku1_val = self.variables["akku1.value"] if self.variables["akku1.active"] else 0
                akku2_val = self.variables["akku2.value"] if self.variables["akku2.active"] else 0
                akku3_val = self.variables["akku3.value"] if self.variables["akku3.active"] else 0
                self.variables["aggregator.value"] = akku1_val + akku2_val + akku3_val

            else:
                self.variables["producer.output"] = 0
            
            # Product Counter
            self.variables["productCounter.value"] += self.variables["producer.output"]

            # Room Temperature Calculation
            self.variables["room.temp"] = (self.variables["generator1.temp"] + 
                                           self.variables["generator2.temp"] + 
                                           self.variables["generator3.temp"]) / 3
            self.variables["room.temp"] = round(self.variables["room.temp"], 2)

            # Room Temperature Effect on Akkus
            if self.variables["room.temp"] > 110:
                self.variables["akku1.active"] = False
                self.variables["akku2.active"] = False
                self.variables["akku3.active"] = False

    def run_simulation_loop(self):
        self.running = True
        print("Machine simulation loop started.")
        try:
            while self.running:
                start_time = time.time()
                self.update_components()
                self.cycle_count += 1
                if self.cycle_count % 4 == 0:
                    # self.print_status() # Optionally print to console
                    pass
                
                elapsed_time = time.time() - start_time
                sleep_time = 0.3 - elapsed_time 
                if sleep_time > 0:
                    time.sleep(sleep_time)
        except Exception as e:
            print(f"Error in simulation loop: {e}")
        finally:
            print("Machine simulation loop stopped.")
        
    def start_simulation(self):
        if not self.running:
            self.simulation_thread = threading.Thread(target=self.run_simulation_loop, daemon=True)
            self.simulation_thread.start()
            print("Machine simulator thread started.")

    def stop_simulation(self):
        self.running = False
        if hasattr(self, 'simulation_thread') and self.simulation_thread.is_alive():
            self.simulation_thread.join(timeout=1) # Wait for thread to finish
        print("Machine simulator thread stopped.")

# --- Flask App ---
app = Flask(__name__)
CORS(app) # Enable CORS for all routes
simulator = MachineSimulator()

@app.route('/api/status', methods=['GET'])
def get_status():
    return jsonify(simulator.status_dict())

@app.route('/api/update', methods=['POST'])
def update_vars():
    data = request.get_json()
    if not data:
        return jsonify({"error": "Invalid JSON"}), 400
    
    updated_keys = []
    for key, value in data.items():
        if simulator.update_variable(key, value):
            updated_keys.append(key)
            # Special handling for generator values if they become 0 due to inactivity
            if key.endswith(".active") and value is False:
                if key.startswith("generator"):
                    gen_value_key = key.replace(".active", ".value")
                    simulator.update_variable(gen_value_key, 0)


    if updated_keys:
        return jsonify({"message": "Variables updated", "updated_keys": updated_keys, "new_values": simulator.status_dict()}), 200
    else:
        return jsonify({"error": "No valid variables found to update or values unchanged"}), 400

if __name__ == "__main__":
    simulator.start_simulation()
    print("Starting Flask server for Machine Simulator API...")
    app.run(host='0.0.0.0', port=5000) # Runs on port 5000
    # When Flask server stops (e.g., Ctrl+C), stop the simulation
    # This might not be reached if app.run() blocks indefinitely without debug=True
    # Consider a more robust shutdown mechanism if needed
    # simulator.stop_simulation()
