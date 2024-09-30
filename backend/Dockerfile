# Use the official Python image as a base
FROM python:3.9

# Set the working directory
WORKDIR /app

# Copy requirements.txt
COPY requirements.txt ./

# Install dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy the rest of the application code
COPY . . 

# Expose the application port (change if necessary)
EXPOSE 5000

# Command to run the application
CMD ["python", "app.py"]
    