import json
import os
import uuid
from threading import Lock
from datetime import datetime, timezone
from typing import List, Optional
from backend.models import Task, TaskCreate, TaskUpdate

# Chemin relatif vers le fichier JSON de stockage
DATA_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "data")
TASKS_FILE = os.path.join(DATA_DIR, "tasks.json")

# Verrou pour assurer la sécurité en cas d'accès concurrents
_file_lock = Lock()


def _ensure_data_file_exists():
    """S'assure que le dossier data/ et le fichier tasks.json existent."""
    if not os.path.exists(DATA_DIR):
        os.makedirs(DATA_DIR, exist_ok=True)
    if not os.path.exists(TASKS_FILE):
        # Initialisation avec quelques exemples de tâches de démonstration au design zen
        initial_tasks = [
            {
                "id": str(uuid.uuid4()),
                "title": "Bienvenue dans votre TodoList épurée",
                "description": "Prenez un instant pour vous organiser dans le calme et la simplicité.",
                "completed": False,
                "priority": "low",
                "due_date": None,
                "created_at": datetime.now(timezone.utc).isoformat()
            },
            {
                "id": str(uuid.uuid4()),
                "title": "Planifier les priorités de la journée",
                "description": "Sélectionnez les tâches essentielles à accomplir en premier.",
                "completed": False,
                "priority": "high",
                "due_date": datetime.now(timezone.utc).strftime("%Y-%m-%d"),
                "created_at": datetime.now(timezone.utc).isoformat()
            }
        ]
        with open(TASKS_FILE, "w", encoding="utf-8") as f:
            json.dump(initial_tasks, f, ensure_ascii=False, indent=2)


def get_all_tasks() -> List[Task]:
    """Récupère l'ensemble des tâches enregistrées."""
    _ensure_data_file_exists()
    with _file_lock:
        try:
            with open(TASKS_FILE, "r", encoding="utf-8") as f:
                data = json.load(f)
                return [Task(**task_dict) for task_dict in data]
        except (json.JSONDecodeError, FileNotFoundError):
            return []


def get_task_by_id(task_id: str) -> Optional[Task]:
    """Recherche une tâche par son identifiant unique."""
    tasks = get_all_tasks()
    for task in tasks:
        if task.id == task_id:
            return task
    return None


def create_task(task_in: TaskCreate) -> Task:
    """Crée et enregistre une nouvelle tâche."""
    _ensure_data_file_exists()
    tasks = get_all_tasks()

    new_task = Task(
        id=str(uuid.uuid4()),
        title=task_in.title,
        description=task_in.description or "",
        completed=False,
        priority=task_in.priority,
        due_date=task_in.due_date,
        created_at=datetime.now(timezone.utc).isoformat()
    )

    tasks.append(new_task)
    _save_tasks(tasks)
    return new_task


def update_task(task_id: str, task_in: TaskUpdate) -> Optional[Task]:
    """Met à jour une tâche existante."""
    tasks = get_all_tasks()
    target_index = None

    for i, t in enumerate(tasks):
        if t.id == task_id:
            target_index = i
            break

    if target_index is None:
        return None

    current_task = tasks[target_index]
    update_data = task_in.model_dump(exclude_unset=True)

    updated_dict = current_task.model_dump()
    updated_dict.update(update_data)

    updated_task = Task(**updated_dict)
    tasks[target_index] = updated_task
    _save_tasks(tasks)
    return updated_task


def delete_task(task_id: str) -> bool:
    """Supprime une tâche par son identifiant."""
    tasks = get_all_tasks()
    filtered_tasks = [t for t in tasks if t.id != task_id]

    if len(filtered_tasks) == len(tasks):
        return False

    _save_tasks(filtered_tasks)
    return True


def _save_tasks(tasks: List[Task]):
    """Sauvegarde la liste complète des tâches dans le fichier JSON."""
    _ensure_data_file_exists()
    with _file_lock:
        data = [t.model_dump() for t in tasks]
        with open(TASKS_FILE, "w", encoding="utf-8") as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
