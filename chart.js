   <script>
        document.addEventListener('DOMContentLoaded', function() {
            const ctx = document.getElementById('tokenChart').getContext('2d');
            
            // Token distribution data
            const data = {
                labels: ['Presale (40%)', 'Liquidity (30%)', 'Staking (20%)', 'Marketing (5%)', 'Team (5%)'],
                datasets: [{
                    data: [40, 30, 20, 5, 5],
                    backgroundColor: [
                        '#10B981', // Green
                        '#3B82F6', // Blue
                        '#F59E0B', // Yellow
                        '#EF4444', // Red
                        '#8B5CF6'  // Purple
                    ],
                    borderWidth: 0,
                    hoverOffset: 15
                }]
            };
            
            // Chart configuration
            const config = {
                type: 'doughnut',
                data: data,
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    cutout: '65%',
                    plugins: {
                        legend: {
                            position: 'bottom',
                            labels: {
                                color: '#E2E8F0',
                                font: {
                                    size: 14,
                                    family: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif"
                                },
                                padding: 20
                            }
                        },
                        tooltip: {
                            backgroundColor: 'rgba(15, 23, 42, 0.9)',
                            titleColor: '#10B981',
                            bodyColor: '#E2E8F0',
                            titleFont: {
                                size: 16,
                                weight: 'bold'
                            },
                            bodyFont: {
                                size: 14
                            },
                            padding: 15,
                            cornerRadius: 12,
                            callbacks: {
                                label: function(context) {
                                    return `${context.label.split(' (')[0]}: ${context.parsed}%`;
                                }
                            }
                        }
                    },
                    animation: {
                        animateScale: true,
                        animateRotate: true,
                        duration: 2000,
                        easing: 'easeOutQuart'
                    }
                }
            };
            
            // Create the chart
            const tokenChart = new Chart(ctx, config);
            
            // Add animation to progress bars
            document.querySelectorAll('.progress-fill').forEach((fill) => {
                const width = fill.style.width;
                fill.style.width = '0';
                setTimeout(() => {
                    fill.style.transition = 'width 1.5s ease-in-out';
                    fill.style.width = width;
                }, 500);
            });
        });
    </script>
