from fastapi import FastAPI
from pydantic import BaseModel

class TaskCreate(BaseModel):
    title: str
    description: str

class Task(BaseModel):
    id: int
    title: str
    description: str
    status: str

app = FastAPI()
tasks = []
next_id = len(tasks)

@app.get("/health")
async def health():
    return {"status": "ok","service": "taskflow"}
        
@app.post("/tasks")
async def create_task(task: TaskCreate):
    tasks.append(new_task)
    return task

@app.get("/tasks")
async def get_tasks(task: Task):
    
    return tasks

