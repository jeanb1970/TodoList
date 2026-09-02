from enum import Enum
from typing import Optional
from datetime import datetime
from pydantic import BaseModel, Field


class PriorityEnum(str, Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"


class TaskBase(BaseModel):
    title: str = Field(..., min_length=1, max_length=200, description="Titre de la tâche")
    description: Optional[str] = Field(default="", description="Description ou notes complémentaires")
    priority: PriorityEnum = Field(default=PriorityEnum.MEDIUM, description="Niveau de priorité")
    due_date: Optional[str] = Field(default=None, description="Date d'échéance format YYYY-MM-DD")


class TaskCreate(TaskBase):
    pass


class TaskUpdate(BaseModel):
    title: Optional[str] = Field(default=None, min_length=1, max_length=200)
    description: Optional[str] = None
    completed: Optional[bool] = None
    priority: Optional[PriorityEnum] = None
    due_date: Optional[str] = None


class Task(TaskBase):
    id: str = Field(..., description="Identifiant unique de la tâche")
    completed: bool = Field(default=False, description="Statut de réalisation")
    created_at: str = Field(..., description="Horodatage ISO de création")
