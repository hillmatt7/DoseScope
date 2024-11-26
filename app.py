# app.py

from flask import Flask, request, jsonify
from flask_cors import CORS
import numpy as np
from scipy.integrate import odeint

app = Flask(__name__)
CORS(app)

def one_compartment_iv_model(y, t, k_elim):
    C = y[0]
    dCdt = -k_elim * C
    return [dCdt]

def one_compartment_extravascular_model(y, t, ka, k_elim):
    A_abs = y[0]  # Amount in absorption site
    C = y[1]      # Concentration in central compartment
    dA_abs_dt = -ka * A_abs
    dCdt = (ka * A_abs) - (k_elim * C)
    return [dA_abs_dt, dCdt]

@app.route('/calculate', methods=['POST'])
def calculate():
    data = request.get_json()
    compound = data.get('compound', {})
    dosing_info = data.get('dosingInfo', {})

    try:
        # Extract parameters
        dose = float(dosing_info.get('dose', 0))
        dosing_interval = float(dosing_info.get('dosingSchedule', 24))  # in hours
        route = dosing_info.get('route', 'oral').lower()
        bioavailability_key = f"bioavailability_{route}"
        bioavailability = float(compound.get(bioavailability_key, compound.get('bioavailability_oral', 1)))
        half_life = float(compound.get('halfLife', 0))
        Vd = float(compound.get('volume_of_distribution', 70))  # in liters
        ka = float(compound.get('ka', 1))  # Absorption rate constant (1/h)

        if half_life == 0 or Vd == 0:
            return jsonify({'success': False, 'message': 'Half-life or Volume of Distribution is missing'}), 400

        # Calculate elimination rate constant
        k_elim = np.log(2) / half_life  # in per hour

        # Adjust dose for bioavailability
        actual_dose = dose * bioavailability

        # Time points
        total_time = 24 * 7  # Simulate for 7 days
        time = np.linspace(0, total_time, num=int(total_time * 2) + 1)  # Every 0.5 hour

        # Dosing times
        dosing_times = np.arange(0, total_time + dosing_interval, dosing_interval)

        # Initialize concentration array
        concentration = np.zeros_like(time)

        if route == 'iv':
            # Intravenous bolus dosing
            for t_dose in dosing_times:
                y0 = [actual_dose / Vd]  # Initial concentration in central compartment
                t_span = time[time >= t_dose]
                t_local = t_span - t_dose  # Time since the last dose
                sol = odeint(one_compartment_iv_model, y0, t_local, args=(k_elim,))
                idx = time >= t_dose
                concentration[idx] += sol[:, 0]
        else:
            # Extravascular dosing (e.g., oral, im)
            for t_dose in dosing_times:
                y0 = [actual_dose, 0]  # [Amount in absorption site, Concentration in central compartment]
                t_span = time[time >= t_dose]
                t_local = t_span - t_dose  # Time since the last dose
                sol = odeint(one_compartment_extravascular_model, y0, t_local, args=(ka, k_elim))
                idx = time >= t_dose
                concentration[idx] += sol[:, 1]

            # Convert amount to concentration in central compartment
            concentration = concentration / Vd

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
