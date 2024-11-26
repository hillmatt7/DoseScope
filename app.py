# app.py

from flask import Flask, request, jsonify
from flask_cors import CORS
import numpy as np

app = Flask(__name__)
CORS(app)

@app.route('/calculate', methods=['POST'])
def calculate():
    data = request.get_json()
    compound = data.get('compound', {})
    dosing_info = data.get('dosingInfo', {})

    try:
        # Extract parameters
        dose = float(dosing_info.get('dose', 0))
        dosing_interval = float(dosing_info.get('dosingSchedule', 24))  # in hours
        route = dosing_info.get('route', 'oral')
        bioavailability_key = f"bioavailability_{route}"
        bioavailability = float(compound.get(bioavailability_key, compound.get('bioavailability_oral', 1)))
        half_life = float(compound.get('half_life', 0))
        Vd = float(compound.get('volume_of_distribution', 70))  # Default to 70 L if not provided

        if half_life == 0:
            return jsonify({'success': False, 'message': 'Half-life is missing'}), 400

        # Calculate elimination rate constant
        kel = np.log(2) / half_life

        # Adjust dose for bioavailability
        actual_dose = dose * bioavailability

        # Time points
        total_time = 24 * 7  # Simulate for 7 days
        time = np.linspace(0, total_time, num=int(total_time * 2) + 1)  # Every 0.5 hour

        # Dosing times
        dosing_times = np.arange(0, total_time + dosing_interval, dosing_interval)

        # Initialize concentration array
        concentration = np.zeros_like(time)

        # Calculate concentrations for multiple doses
        for t_dose in dosing_times:
            idx = time >= t_dose
            concentration[idx] += (actual_dose / Vd) * np.exp(-kel * (time[idx] - t_dose))

        result = [{'time': float(t), 'concentration': float(c)} for t, c in zip(time, concentration)]

        return jsonify({'success': True, 'data': result})

    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500

@app.route('/validate', methods=['POST'])
def validate():
    data = request.get_json()
    # Implement validation logic here
    return jsonify({'success': True, 'errors': None})

if __name__ == '__main__':
    app.run(port=8000)
