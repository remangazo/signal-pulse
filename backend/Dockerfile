FROM python:3.13-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 8000

CMD python -c "from fastapi import FastAPI; import uvicorn; app = FastAPI(); app.get('/')(lambda: {'ok': True}); uvicorn.run(app, host='0.0.0.0', port=int(__import__('os').environ.get('PORT', 8000)))"
