import os
from typing import List, Optional
from fastapi import FastAPI, HTTPException, Query, status
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse

from backend.models import Task, TaskCreate, TaskUpdate, PriorityEnum
from backend import storage

app = FastAPI(
    title="TodoList Épurée API",
    description="API REST locale pour la gestion simple et efficace de tâches",
    version="1.0.0"
)

# --- Routes API REST ---

@app.get("/api/tasks", response_model=List[Task], summary="Obtenir la liste des tâches")
def list_tasks(
    status_filter: Optional[str] = Query(None, alias="status", description="Filtrer par statut: 'active', 'completed'"),
    priority_filter: Optional[PriorityEnum] = Query(None, alias="priority", description="Filtrer par priorité: 'low', 'medium', 'high'")
):
    """Récupère l'ensemble des tâches avec options de filtrage."""
    tasks = storage.get_all_tasks()

    if status_filter == "completed":
        tasks = [t for t in tasks if t.completed]
    elif status_filter == "active":
        tasks = [t for t in tasks if not t.completed]

    if priority_filter:
        tasks = [t for t in tasks if t.priority == priority_filter]

    return tasks


@app.post("/api/tasks", response_model=Task, status_code=status.HTTP_201_CREATED, summary="Créer une tâche")
def create_task(task_in: TaskCreate):
    """Crée une nouvelle tâche et la sauvegarde dans le stockage local JSON."""
    return storage.create_task(task_in)


@app.get("/api/tasks/{task_id}", response_model=Task, summary="Obtenir une tâche par son ID")
def get_task(task_id: str):
    """Récupère les détails d'une tâche spécifique."""
    task = storage.get_task_by_id(task_id)
    if not task:
        raise HTTPException(status_code=404, detail="Tâche non trouvée")
    return task


@app.put("/api/tasks/{task_id}", response_model=Task, summary="Mettre à jour une tâche")
def update_task(task_id: str, task_in: TaskUpdate):
    """Met à jour le statut, le titre, la priorité ou l'échéance d'une tâche."""
    updated = storage.update_task(task_id, task_in)
    if not updated:
        raise HTTPException(status_code=404, detail="Tâche non trouvée")
    return updated


@app.delete("/api/tasks/{task_id}", status_code=status.HTTP_204_NO_CONTENT, summary="Supprimer une tâche")
def delete_task(task_id: str):
    """Supprime définitivement une tâche."""
    success = storage.delete_task(task_id)
    if not success:
        raise HTTPException(status_code=404, detail="Tâche non trouvée")
    return None


# --- Montage de l'interface Frontend statique ---

FRONTEND_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "frontend")

if os.path.exists(FRONTEND_DIR):
    app.mount("/", StaticFiles(directory=FRONTEND_DIR, html=True), name="frontend")
