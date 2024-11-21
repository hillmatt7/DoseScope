window.onload = function() {
    // Initialize Chart.js line chart
    const ctx = document.getElementById('chartCanvas').getContext('2d');

    // Sample data for medication levels
    const chartData = {
        labels: ['12 AM', '4 AM', '8 AM', '12 PM', '4 PM', '8 PM', '12 AM'],
        datasets: [{
            label: 'Medication Level (mg)',
            data: [20, 40, 35, 50, 45, 30, 25],
            fill: true,
            backgroundColor: 'rgba(16, 185, 129, 0.2)',
            borderColor: '#10b981',
            tension: 0.4
        }]
    };

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
            x: {
                display: true,
                title: {
                    display: true,
                    text: 'Time',
                    font: {
                        size: 12
                    }
                },
                ticks: {
                    font: {
                        size: 10
                    }
                }
            },
            y: {
                display: true,
                title: {
                    display: true,
                    text: 'Medication Level (mg)',
                    font: {
                        size: 12
                    }
                },
                ticks: {
                    font: {
                        size: 10
                    }
                },
            },
        },
        plugins: {
            legend: {
                labels: {
                    font: {
                        size: 12
                    }
                }
            }
        }
    };

    const lineChart = new Chart(ctx, {
        type: 'line',
        data: chartData,
        options: chartOptions
    });

    // Medication Controls
    const addMedicationBtn = document.getElementById('addMedicationBtn');
    const medicationTabs = document.getElementById('medicationTabs');

    addMedicationBtn.addEventListener('click', () => {
        // For demo purposes, prompt for medication name
        const medName = prompt('Enter medication name:');
        if (medName) {
            addMedication(medName);
        }
    });

    function addMedication(medName) {
        // Create medication tab
        const medTab = document.createElement('div');
        medTab.classList.add('medication-tab');

        // Medication name
        const medNameSpan = document.createElement('span');
        medNameSpan.classList.add('med-name');
        medNameSpan.textContent = medName;

        // Remove button
        const removeBtn = document.createElement('span');
        removeBtn.classList.add('remove-med');
        removeBtn.innerHTML = '&times;'; // '×' symbol

        // Append to medTab
        medTab.appendChild(medNameSpan);
        medTab.appendChild(removeBtn);

        // Append to medicationTabs
        medicationTabs.appendChild(medTab);

        // Remove medication on click
        removeBtn.addEventListener('click', () => {
            medicationTabs.removeChild(medTab);
            // Additional logic to remove medication from data
        });

        // Additional logic to add medication to data
    }
};
