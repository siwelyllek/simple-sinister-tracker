# Simple & Sinister Workout Tracker

<div align="center">
  <a href="https://github.com/yourusername/workout-tracker">
    <img src="frontend/public/favicon.svg" alt="Logo" width="80" height="80">
  </a>

  <h3 align="center">Simple & Sinister Workout Tracker</h3>

  <p align="center">
    A clean, modern, and mobile-friendly kettlebell workout tracker designed specifically for Pavel Tsatsouline's Simple & Sinister program.
    <br />
    <a href="#about-the-project"><strong>Explore the docs »</strong></a>
    <br />
    <br />
    <a href="#getting-started">Quick Start</a>
    ·
    <a href="https://github.com/siwelyllek/workout-tracker/issues">Report Bug</a>
    ·
    <a href="https://github.com/siwelyllek/workout-tracker/issues">Request Feature</a>
  </p>
</div>

## About The Project

![Simple & Sinister Workout Tracker Screenshot](Simple%20and%20Sinister%20App.png)

Simple & Sinister is a minimalist kettlebell program that focuses on just two exercises: kettlebell swings and Turkish get-ups. This tracker helps you log your workouts, track your progress, and maintain consistency in your training.

### Key Features

* **🏋️ Dual Weight Tracking** - Support for progressive get-up training with two different weights
* **📊 Visual Progress** - Interactive heatmap showing training consistency over time
* **📱 Mobile-Friendly** - Glassmorphism dark theme optimized for all devices
* **⚖️ Unit Conversion** - Switch between kg and lbs seamlessly
* **🔄 Swing Styles** - Track 1-handed vs 2-handed swings
* **📈 Volume Metrics** - Calculate total training volume automatically
* **🌙 Dark Theme** - Beautiful glassmorphism UI with dark theme
* **🔥 Streak Tracking** - Monitor your training consistency
* **📅 Workout History** - Detailed view of all your training sessions

### Built With

This project is built using modern web technologies with Docker for easy deployment:

* [![React][React.js]][React-url]
* [![Vite][Vite]][Vite-url]
* [![FastAPI][FastAPI]][FastAPI-url]
* [![Docker][Docker]][Docker-url]
* [![Tailwind CSS][TailwindCSS]][Tailwind-url]
* [![SQLite][SQLite]][SQLite-url]

## Getting Started

Get a local copy up and running with these simple steps.

### Prerequisites

The only requirement is Docker and Docker Compose. No need to install Node.js, Python, or any other dependencies locally.

* Docker
  ```sh
  # On Ubuntu/Debian
  sudo apt install docker.io docker-compose-plugin
  
  # On Windows/macOS
  # Download Docker Desktop from https://docker.com
  ```

### Installation

1. Clone the repository
   ```sh
   git clone https://github.com/yourusername/workout-tracker.git
   ```

2. Navigate to the project directory
   ```sh
   cd workout-tracker
   ```

3. Start the application with Docker Compose
   ```sh
   docker compose up -d --build
   ```

4. Open your browser and visit `http://localhost:3000`

That's it! The application will be running with:
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- Database: SQLite (local file)

## Usage

### Logging a Workout

1. **Kettlebell Swings**
   - Enter the number of swings (default: 100)
   - Select weight (kg or lbs)
   - Choose swing style (1-handed or 2-handed)

2. **Turkish Get-ups**
   - Enter reps for Weight 1
   - Optionally add Weight 2 for progressive training
   - Total get-ups calculated automatically

3. **Set Date** - Defaults to today, but you can log past workouts

### Viewing Progress

- **Heatmap** - Visual representation of training consistency
- **Workout History** - Detailed cards showing all past sessions
- **Statistics** - Track total volume, streaks, and averages

### Switching Units

Toggle between kilograms and pounds using the unit switcher in the interface.

## Project Structure

```
workout-tracker/
├── frontend/                 # React + Vite frontend
│   ├── src/
│   │   ├── components/      # React components
│   │   ├── App.jsx         # Main application
│   │   └── index.css       # Tailwind styles
│   ├── public/             # Static assets
│   └── Dockerfile          # Frontend container
├── backend/                # FastAPI backend
│   ├── main.py            # FastAPI application
│   ├── models.py          # Database models
│   ├── crud.py            # Database operations
│   ├── schemas.py         # Pydantic schemas
│   └── Dockerfile         # Backend container
├── docker-compose.yml     # Multi-container orchestration
└── README.md             # Project documentation
```

## API Documentation

Once running, visit `http://localhost:8000/docs` for interactive API documentation powered by FastAPI's automatic OpenAPI generation.

### Key Endpoints

- `GET /workouts` - Retrieve all workouts
- `POST /workouts` - Create a new workout
- `DELETE /workouts/{id}` - Delete a workout
- `GET /health` - Health check endpoint

## Contributing

Contributions make the open source community amazing! Any contributions you make are **greatly appreciated**.

If you have a suggestion that would make this better, please fork the repo and create a pull request. You can also simply open an issue with the tag "enhancement".

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

Distributed under the MIT License. See `LICENSE.txt` for more information.


## Acknowledgments

* [Pavel Tsatsouline](https://www.strongfirst.com/) - Creator of the Simple & Sinister program
* [Best-README-Template](https://github.com/othneildrew/Best-README-Template) - README inspiration
* [React Calendar Heatmap](https://github.com/kevinsqi/react-calendar-heatmap) - Heatmap component
* [Tailwind CSS](https://tailwindcss.com/) - Styling framework
* [FastAPI](https://fastapi.tiangolo.com/) - Backend framework

<!-- MARKDOWN LINKS & IMAGES -->
[React.js]: https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB
[React-url]: https://reactjs.org/
[Vite]: https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white
[Vite-url]: https://vitejs.dev/
[FastAPI]: https://img.shields.io/badge/FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white
[FastAPI-url]: https://fastapi.tiangolo.com/
[Docker]: https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white
[Docker-url]: https://docker.com/
[TailwindCSS]: https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white
[Tailwind-url]: https://tailwindcss.com/
[SQLite]: https://img.shields.io/badge/SQLite-003B57?style=for-the-badge&logo=sqlite&logoColor=white
[SQLite-url]: https://www.sqlite.org/