DoseScope
DoseScope is a tracking application designed to help users monitor the presence of substances in their bloodstream. Initially focused on tracking drugs, the app allows for flexible configuration to accommodate foods and supplements, making it a versatile tool for health and wellness tracking.

Features
Bloodstream Tracking: Real-time tracking of various substances, including drugs, food, and supplements.
Customizable Protocols: Configure intake schedules and set custom protocols.
Timeline Navigation: Visualize intake and metabolization of substances over time.
Flexible Integration: Easily extendable to track food timing and other health metrics, such as blood glucose or growth hormone.
Installation
Prerequisites
Python 3.8+: Make sure Python is installed on your system. You can download it here.
pip: Package installer for Python (should come installed with Python).
Step 1: Clone the Repository
bash
Copy code
git clone https://github.com/hillmatt7/DoseScope.git
cd DoseScope
Step 2: Set Up Virtual Environment (Recommended)
bash
Copy code
python3 -m venv venv
source venv/bin/activate   # For Linux/Mac
venv\Scripts\activate      # For Windows
Step 3: Install Dependencies
bash
Copy code
pip install -r requirements.txt
Step 4: Configure the App
API Configuration: Set up any necessary API keys or environment variables.
Database Setup: If the app requires a database, configure it according to config.py.
Step 5: Run the Application
bash
Copy code
python app.py
The application should now be running locally on http://localhost:5000.

Usage
Adding Substances: Navigate to the “Add Substance” page and input the name, dosage, and intake schedule.
Tracking Progress: Use the timeline feature to monitor how each substance metabolizes over time.
Contributing
Fork the repository.
Create a new branch (git checkout -b feature-branch).
Commit your changes (git commit -am 'Add a new feature').
Push the branch (git push origin feature-branch).
Open a Pull Request.
License
This project is licensed under the MIT License. See the LICENSE file for more information.
