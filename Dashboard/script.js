// script.js
document.addEventListener('DOMContentLoaded', () => {
    const links = document.querySelectorAll('.sidebar a');
    const sideMenu = document.querySelector('aside');
    const menuBtn = document.querySelector('#menu_bar');
    const closeBtn = document.querySelector('#close_btn');
    const themeToggler = document.querySelector('.theme-toggler');
    const sidebar = document.querySelector('.sidebar');
    const logoutBtn = document.querySelector('.logout');
    const addPatientBtn = document.getElementById('add_patient_btn');

    let patientCount = 5;

    // Handle sidebar link activation
    links.forEach(link => {
        link.addEventListener('click', function() {
            links.forEach(item => item.classList.remove('active'));
            this.classList.add('active');
        });
    });

    // Toggle side menu visibility
    menuBtn.addEventListener('click', () => sideMenu.style.display = 'block');
    closeBtn.addEventListener('click', () => sideMenu.style.display = 'none');

    // Handle theme toggling
    themeToggler.addEventListener('click', () => {
        document.body.classList.toggle('dark-theme-variables');
        themeToggler.querySelector('span:nth-child(1)').classList.toggle('active');
        themeToggler.querySelector('span:nth-child(2)').classList.toggle('active');
    });

    // Add new patient
    addPatientBtn.addEventListener('click', (e) => {
        e.preventDefault();
        const newPatient = document.createElement('a');
        newPatient.href = '#';
        newPatient.innerHTML = `
            <span class="material-symbols-outlined">person</span>
            <h3>Patient ${patientCount}</h3>
        `;
        newPatient.classList.add('new-patient');
        sidebar.insertBefore(newPatient, addPatientBtn);
        sidebar.appendChild(logoutBtn);
        patientCount++;
    });

    // Function to create a chart
    const createChart = (elementId, type) => {
        const ctx = document.getElementById(elementId).getContext('2d');
        return new Chart(ctx, {
            type: type,
            data: {
                labels: ['January', 'February', 'March', 'April', 'May', 'June', 'July'],
                datasets: [{
                    label: 'Sales',
                    data: [12, 19, 3, 5, 2, 3, 7],
                    backgroundColor: 'rgba(75, 192, 192, 0.2)',
                    borderColor: 'rgba(75, 192, 192, 1)',
                    borderWidth: 1
                }]
            },
            options: {
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });
    };

    // Create charts
    const salesChart = createChart('salesChart', 'line');
    const salineChart = createChart('salineChart', 'doughnut');
    const hrChart = createChart('hrChart', 'polarArea');

    // Update chart data dynamically
    const updateChart = (chart) => {
        chart.data.datasets[0].data = [5, 10, 15, 20, 25, 30, 35];
        chart.update();
    };

    // Example updates
    setTimeout(() => updateChart(salesChart), 5000);
    setTimeout(() => updateChart(salineChart), 5000);
    setTimeout(() => updateChart(hrChart), 5000);
});
