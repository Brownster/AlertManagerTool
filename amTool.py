import requests
from tkinter import *

# Define the API endpoint URLs for the Prometheus instances
PROMETHEUS_URLS = {
    "Prometheus Instance 1": "https://prometheus-instance-1.example.com/api/v1",
    "Prometheus Instance 2": "https://prometheus-instance-2.example.com/api/v1",
    # Add more instances as needed
}

# Define the pre-created silences
PRE_CREATED_SILENCES = [
    {"name": "Silence 1", "expr": "up == 0", "duration": "1h"},
    {"name": "Silence 2", "expr": "job == 'node_exporter'", "duration": "30m"},
    {"name": "Silence 3", "expr": "sum(rate(http_requests_total[5m])) by (job) > 10", "duration": "2h"},
    # Add more silences as needed
]

# Define a function to create a silence for one or more Prometheus instances
def create_silence(instance_names, silence_data):
    responses = {}
    for instance_name in instance_names:
        prometheus_url = PROMETHEUS_URLS.get(instance_name)
        if not prometheus_url:
            raise ValueError(f"Invalid instance name: {instance_name}")
        url = f"{prometheus_url}/silences"
        response = requests.post(url, json=silence_data)
        response.raise_for_status()
        responses[instance_name] = response.json()
    return responses

def display_silences():
    # Create the GUI
    silence_window = Toplevel()
    silence_window.title("Silences")

    # Create a text widget to display the silences
    silence_text = Text(silence_window, width=80, height=30)
    silence_text.pack()

    # Loop over each Prometheus instance
    for instance_name, prometheus_url in PROMETHEUS_URLS.items():
        # Retrieve the active and expired silences for this instance
        active_url = f"{prometheus_url}/silences?active=true"
        expired_url = f"{prometheus_url}/silences?active=false"
        active_response = requests.get(active_url)
        expired_response = requests.get(expired_url)
        active_response.raise_for_status()
        expired_response.raise_for_status()

        # Parse the JSON response for the active and expired silences
        active_silences = active_response.json()["data"]
        expired_silences = expired_response.json()["data"]

        # Add the active and expired silences to the text widget
        silence_text.insert(END, f"Prometheus instance: {instance_name}\n\nActive silences:\n")
        for silence in active_silences:
            silence_text.insert(END, json.dumps(silence, indent=4) + "\n\n")
        silence_text.insert(END, "Expired silences:\n")
        for silence in expired_silences:
            silence_text.insert(END, json.dumps(silence, indent=4) + "\n\n")



# Define the main function to handle user input and create a silence
def main():
    # Create the GUI
    root = Tk()
    root.title("Create Silence")

    # Create a drop-down list of pre-created silences
    pre_created_silence_var = StringVar(root)
    pre_created_silence_var.set("Select a pre-created silence")
    pre_created_silence_menu = OptionMenu(root, pre_created_silence_var, *["Select a pre-created silence"] + [s["name"] for s in PRE_CREATED_SILENCES])

    # Create a text field for the silence data
    silence_data_label = Label(root, text="Enter the silence data in standard Prometheus format:")
    silence_data_entry = Entry(root)

    # Create a drop-down list of Prometheus instances
    instance_names_label = Label(root, text="Choose the Prometheus instances to use:")
    instance_names_var = StringVar(root)
    instance_names_var.set("Select Prometheus instances")
    instance_names_menu = OptionMenu(root, instance_names_var, *["Select Prometheus instances"] + list(PROMETHEUS_URLS.keys()))

    # Create a send button
    send_button = Button(root, text="Send Silence", command=lambda: create_silence(instance_names_var.get().split(","), silence_data_entry.get()))

    # Create a display silences button
    display_button = Button(root, text="Display Silences", command=display_silences)

    # Pack the GUI elements
    pre_created_silence_menu.pack()
    silence_data_label.pack()
    silence_data_entry.pack()
    instance_names_label.pack()
    instance_names_menu.pack()
    send_button.pack()
    display_button.pack()

# Start the GUI main loop

# Run the main function when the script is executed
if __name__ == "__main__":
    main()
