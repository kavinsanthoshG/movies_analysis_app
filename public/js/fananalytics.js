document.addEventListener('DOMContentLoaded', async () => {
    const ctx = document.getElementById('genreChart').getContext('2d');
    
    // Fetch the genre data
    const response = await fetch('/api/genres');
    const data = await response.json();
    
    // Process the data to get the top 5 genres by average rating
    const labels = data.map(item => item.genre);
    const ratings = data.map(item => item.averageRating);

    // Create the chart
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Top 5 Genres by Average Rating',
                data: ratings,
                backgroundColor: [
                    'rgba(255, 99, 132, 0.2)',
                    'rgba(54, 162, 235, 0.2)',
                    'rgba(255, 206, 86, 0.2)',
                    'rgba(75, 192, 192, 0.2)',
                    'rgba(153, 102, 255, 0.2)'
                ],
                borderColor: [
                    'rgba(255, 99, 132, 1)',
                    'rgba(54, 162, 235, 1)',
                    'rgba(255, 206, 86, 1)',
                    'rgba(75, 192, 192, 1)',
                    'rgba(153, 102, 255, 1)'
                ],
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
});