/**
 * TodoList — Logique Applicative (JS ES6 Vanille)
 * Interactions fluides, réactivité localisée et requêtes vers l'API FastAPI.
 */

document.addEventListener('DOMContentLoaded', () => {
    // --- État de l'application ---
    let tasks = [];
    let currentStatusFilter = 'all';
    let currentPriorityFilter = '';
    let currentSortBy = 'created_desc';

    // --- Éléments du DOM ---
    const taskForm = document.getElementById('taskForm');
    const taskTitleInput = document.getElementById('taskTitle');
    const taskDescInput = document.getElementById('taskDesc');
    const taskPrioritySelect = document.getElementById('taskPriority');
    const taskDueDateInput = document.getElementById('taskDueDate');

    const taskList = document.getElementById('taskList');
    const emptyState = document.getElementById('emptyState');
    const emptyStateText = document.getElementById('emptyStateText');

    const countTotal = document.getElementById('countTotal');
    const countActive = document.getElementById('countActive');
    const countCompleted = document.getElementById('countCompleted');

    const filterBtns = document.querySelectorAll('.filter-btn');
    const priorityFilterSelect = document.getElementById('priorityFilter');
    const sortSelect = document.getElementById('sortSelect');

    // Éléments du Modal d'édition
    const editModal = document.getElementById('editModal');
    const editForm = document.getElementById('editForm');
    const editTaskId = document.getElementById('editTaskId');
    const editTaskTitle = document.getElementById('editTaskTitle');
    const editTaskDesc = document.getElementById('editTaskDesc');
    const editTaskPriority = document.getElementById('editTaskPriority');
    const editTaskDueDate = document.getElementById('editTaskDueDate');
    const closeModalBtn = document.getElementById('closeModalBtn');
    const cancelEditBtn = document.getElementById('cancelEditBtn');

    const toast = document.getElementById('toast');

    // --- Initialisation ---
    fetchTasks();

    // --- Écouteurs d'Événements ---

    // Soumission du formulaire d'ajout
    taskForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const title = taskTitleInput.value.trim();
        if (!title) return;

        const newTaskData = {
            title: title,
            description: taskDescInput.value.trim(),
            priority: taskPrioritySelect.value,
            due_date: taskDueDateInput.value || null
        };

        try {
            const response = await fetch('/api/tasks', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newTaskData)
            });

            if (response.ok) {
                taskForm.reset();
                taskPrioritySelect.value = 'medium';
                showToast('Tâche ajoutée avec succès');
                fetchTasks();
            } else {
                showToast('Erreur lors de la création de la tâche');
            }
        } catch (err) {
            console.error(err);
            showToast('Impossible de contacter le serveur');
        }
    });

    // Filtres de statut
    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentStatusFilter = btn.dataset.filter;
            renderTasks();
        });
    });

    // Filtre de priorité
    priorityFilterSelect.addEventListener('change', (e) => {
        currentPriorityFilter = e.target.value;
        renderTasks();
    });

    // Tri des tâches
    sortSelect.addEventListener('change', (e) => {
        currentSortBy = e.target.value;
        renderTasks();
    });

    // Fermeture du Modal
    closeModalBtn.addEventListener('click', hideModal);
    cancelEditBtn.addEventListener('click', hideModal);
    editModal.addEventListener('click', (e) => {
        if (e.target === editModal) hideModal();
    });

    // Soumission du formulaire d'édition
    editForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const id = editTaskId.value;
        const updatedData = {
            title: editTaskTitle.value.trim(),
            description: editTaskDesc.value.trim(),
            priority: editTaskPriority.value,
            due_date: editTaskDueDate.value || null
        };

        try {
            const response = await fetch(`/api/tasks/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updatedData)
            });

            if (response.ok) {
                hideModal();
                showToast('Tâche mise à jour');
                fetchTasks();
            } else {
                showToast('Erreur lors de la mise à jour');
            }
        } catch (err) {
            console.error(err);
            showToast('Erreur de connexion serveur');
        }
    });

    // --- Fonctions d'API et Rendu ---

    async function fetchTasks() {
        try {
            const response = await fetch('/api/tasks');
            if (response.ok) {
                tasks = await response.json();
                updateStats();
                renderTasks();
            }
        } catch (err) {
            console.error("Erreur de récupération des tâches:", err);
        }
    }

    function updateStats() {
        const total = tasks.length;
        const active = tasks.filter(t => !t.completed).length;
        const completed = tasks.filter(t => t.completed).length;

        countTotal.textContent = total;
        countActive.textContent = active;
        countCompleted.textContent = completed;
    }

    function renderTasks() {
        // Filtrage
        let filtered = tasks.filter(task => {
            if (currentStatusFilter === 'active' && task.completed) return false;
            if (currentStatusFilter === 'completed' && !task.completed) return false;
            if (currentPriorityFilter && task.priority !== currentPriorityFilter) return false;
            return true;
        });

        // Tri
        filtered.sort((a, b) => {
            if (currentSortBy === 'created_desc') {
                return new Date(b.created_at) - new Date(a.created_at);
            }
            if (currentSortBy === 'created_asc') {
                return new Date(a.created_at) - new Date(b.created_at);
            }
            if (currentSortBy === 'due_date') {
                if (!a.due_date) return 1;
                if (!b.due_date) return -1;
                return new Date(a.due_date) - new Date(b.due_date);
            }
            if (currentSortBy === 'priority') {
                const priorityWeight = { high: 3, medium: 2, low: 1 };
                return priorityWeight[b.priority] - priorityWeight[a.priority];
            }
            return 0;
        });

        taskList.innerHTML = '';

        if (filtered.length === 0) {
            emptyState.classList.remove('hidden');
            if (currentStatusFilter === 'completed') {
                emptyStateText.textContent = "Aucune tâche terminée pour l'instant.";
            } else if (currentStatusFilter === 'active') {
                emptyStateText.textContent = "Aucune tâche en cours. Vous êtes à jour !";
            } else {
                emptyStateText.textContent = "Aucune tâche enregistrée pour le moment. Profitez de cet instant ou ajoutez une tâche.";
            }
        } else {
            emptyState.classList.add('hidden');
            filtered.forEach(task => {
                const itemEl = createTaskDOMElement(task);
                taskList.appendChild(itemEl);
            });
        }
    }

    function createTaskDOMElement(task) {
        const li = document.createElement('li');
        li.className = `task-item ${task.completed ? 'completed' : ''}`;
        li.dataset.id = task.id;

        const priorityLabels = { low: 'Basse', medium: 'Moyenne', high: 'Haute' };
        
        // Calcul pour l'échéance
        let dueBadgeHTML = '';
        if (task.due_date) {
            const today = new Date().toISOString().split('T')[0];
            const isOverdue = !task.completed && task.due_date < today;
            const formattedDate = formatDateFR(task.due_date);
            
            dueBadgeHTML = `
                <span class="due-badge ${isOverdue ? 'overdue' : ''}">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                        <line x1="16" y1="2" x2="16" y2="6"></line>
                        <line x1="8" y1="2" x2="8" y2="6"></line>
                        <line x1="3" y1="10" x2="21" y2="10"></line>
                    </svg>
                    ${isOverdue ? 'En retard: ' : ''}${formattedDate}
                </span>
            `;
        }

        li.innerHTML = `
            <label class="checkbox-container">
                <input type="checkbox" ${task.completed ? 'checked' : ''}>
                <span class="checkmark"></span>
            </label>

            <div class="task-content">
                <div class="task-header-row">
                    <span class="task-title">${escapeHTML(task.title)}</span>
                </div>
                ${task.description ? `<p class="task-desc">${escapeHTML(task.description)}</p>` : ''}
                <div class="task-meta">
                    <span class="priority-badge priority-${task.priority}">
                        ${priorityLabels[task.priority]}
                    </span>
                    ${dueBadgeHTML}
                </div>
            </div>

            <div class="task-actions">
                <button class="action-btn edit-btn" title="Modifier">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                    </svg>
                </button>
                <button class="action-btn delete-btn" title="Supprimer">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <polyline points="3 6 5 6 21 6"></polyline>
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                    </svg>
                </button>
            </div>
        `;

        // Événement Cocher / Décocher
        const checkbox = li.querySelector('input[type="checkbox"]');
        checkbox.addEventListener('change', async () => {
            await toggleTaskCompletion(task.id, checkbox.checked);
        });

        // Événement Éditer
        const editBtn = li.querySelector('.edit-btn');
        editBtn.addEventListener('click', () => {
            openEditModal(task);
        });

        // Événement Supprimer
        const deleteBtn = li.querySelector('.delete-btn');
        deleteBtn.addEventListener('click', async () => {
            await deleteTask(task.id);
        });

        return li;
    }

    async function toggleTaskCompletion(id, completed) {
        try {
            const response = await fetch(`/api/tasks/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ completed: completed })
            });

            if (response.ok) {
                showToast(completed ? 'Tâche terminée' : 'Tâche réactivée');
                fetchTasks();
            }
        } catch (err) {
            console.error(err);
            showToast('Erreur lors du changement de statut');
        }
    }

    async function deleteTask(id) {
        try {
            const response = await fetch(`/api/tasks/${id}`, {
                method: 'DELETE'
            });

            if (response.ok) {
                showToast('Tâche supprimée');
                fetchTasks();
            }
        } catch (err) {
            console.error(err);
            showToast('Erreur lors de la suppression');
        }
    }

    function openEditModal(task) {
        editTaskId.value = task.id;
        editTaskTitle.value = task.title;
        editTaskDesc.value = task.description || '';
        editTaskPriority.value = task.priority;
        editTaskDueDate.value = task.due_date || '';
        
        editModal.classList.remove('hidden');
        editTaskTitle.focus();
    }

    function hideModal() {
        editModal.classList.add('hidden');
        editForm.reset();
    }

    function showToast(message) {
        toast.textContent = message;
        toast.classList.remove('hidden');
        setTimeout(() => {
            toast.classList.add('hidden');
        }, 2500);
    }

    function formatDateFR(dateString) {
        if (!dateString) return '';
        const parts = dateString.split('-');
        if (parts.length === 3) {
            return `${parts[2]}/${parts[1]}/${parts[0]}`;
        }
        return dateString;
    }

    function escapeHTML(str) {
        if (!str) return '';
        return str
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }
});
