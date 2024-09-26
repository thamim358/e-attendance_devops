# Flask and React Project

This project consists of a Flask backend API and a React frontend application.

## Backend Setup

1. Navigate to the backend directory.
2. Create a virtual environment:
   ```
   python -m venv venv
   ```
3. Activate the virtual environment:
   - On Windows:
     ```
     venv\Scripts\activate
     ```
   - On macOS and Linux:
     ```
     source venv/bin/activate
     ```
4. Install the required Python packages:
   ```
   pip install -r requirements.txt
   ```
5. Run the Flask application:
   ```
   flask run
   ```

## Frontend Setup

1. Navigate to the frontend directory.
2. Install the required Node.js packages:
   ```
   npm install
   ```
3. Start the development server:
   ```
   npm run dev
   ```

## Project Structure

- The backend is built with Flask and serves as the API.
- The frontend is built with React and uses Redux for state management.
- The frontend communicates with the backend to fetch and display data.

## Docker Setup

To containerize and run this application using Docker, follow these steps:

1. Install Docker:

   - Visit the official Docker website (https://www.docker.com/get-started)
   - Download and install Docker for your operating system
   - Follow the installation instructions provided

2. Create a `Dockerfile` in the root directory of the project:

   - This file will define how to build the Docker image for your application
   - Include instructions for setting up both frontend and backend environments

3. Create a `docker-compose.yml` file in the root directory:

   - This file will define and run multi-container Docker applications
   - Specify services for frontend, backend, and nginx

4. Create an `nginx.conf` file in the root directory:

   - Nginx will serve as a reverse proxy and web server
   - In the Dockerfile, Nginx is used to:
     - Serve static frontend files
     - Route API requests to the backend service
     - Handle load balancing and improve performance
     - Enable serving both frontend and backend from the same domain

5. Navigate to the frontend directory and build it:

   ```
   cd frontend
   npm run build
   cd ..
   ```

6. Build and run the Docker containers:

   ```
   docker-compose build
   docker-compose up -d
   ```

7. Open a web browser and navigate to:
   ```
   http://localhost:8080
   ```

8. To check the logs of the Docker containers:
   ```
   docker-compose logs
   ```

9. To stop the server and remove the containers:
   ```
   docker-compose down
