class TaskManager {
    constructor() {
        this.tasks = [];
        this.currentTaskId = null;
        this.taskToDelete = null;
        this.filter = 'all';
        this.initElements();
        this.loadTasks();
        this.setupEventListeners();
        this.renderTasks();
    }

    initElements() {
        this.tasksList = document.getElementById('tasksList');
        this.addTaskBtn = document.getElementById('addTask');
        this.taskModal = document.getElementById('taskModal');
        this.confirmModal = document.getElementById('confirmModal');
        this.closeModalBtn = document.querySelector('.close-modal');
        this.cancelBtn = document.querySelector('.cancel-btn');
        this.saveTaskBtn = document.getElementById('saveTask');
        this.confirmBtn = document.querySelector('.confirm-btn');
        this.taskTitle = document.getElementById('taskTitle');
        this.taskDescription = document.getElementById('taskDescription');
        this.modalTaskTitle = document.getElementById('modalTaskTitle');
        this.filterButtons = document.querySelectorAll('.filter-btn');
    }

    loadTasks() {
        const savedTasks = localStorage.getItem('magicDiaryTasks');
        this.tasks = savedTasks ? JSON.parse(savedTasks) : [
            {
                id: this.generateId(),
                title: "Minha primeira tarefa",
                description: "Esta é uma tarefa de exemplo",
                completed: false,
                createdAt: new Date().toISOString()
            }
        ];
    }

    saveTasks() {
        localStorage.setItem('magicDiaryTasks', JSON.stringify(this.tasks));
    }

    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    renderTasks() {
        this.tasksList.innerHTML = '';

        const filteredTasks = this.tasks.filter(task => {
            if (this.filter === 'all') return true;
            if (this.filter === 'pending') return !task.completed;
            if (this.filter === 'completed') return task.completed;
            return true;
        });

        if (filteredTasks.length === 0) {
            this.tasksList.innerHTML = `
                <div class="empty-tasks">
                    <i class="fas fa-tasks"></i>
                    <p>Nenhuma tarefa ${this.filter === 'all' ? 'criada' : this.filter === 'pending' ? 'pendente' : 'concluída'}</p>
                </div>
            `;
            return;
        }

        filteredTasks.sort((a, b) => {
            if (a.completed && !b.completed) return 1;
            if (!a.completed && b.completed) return -1;
            return new Date(b.createdAt) - new Date(a.createdAt);
        });

        filteredTasks.forEach(task => {
            const taskElement = this.createTaskElement(task);
            this.tasksList.appendChild(taskElement);
        });
    }

    createTaskElement(task) {
        const taskElement = document.createElement('div');
        taskElement.className = `task-item ${task.completed ? 'completed' : ''}`;
        taskElement.dataset.id = task.id;

        const date = new Date(task.createdAt);
        const formattedDate = date.toLocaleDateString('pt-BR', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
        });

        taskElement.innerHTML = `
            <div class="task-header">
                <input type="checkbox" class="task-checkbox" ${task.completed ? 'checked' : ''}>
                <div class="task-title">${task.title}</div>
                <div class="task-actions">
                    <button class="task-action edit-btn"><i class="fas fa-edit"></i></button>
                    <button class="task-action delete-btn"><i class="fas fa-trash"></i></button>
                </div>
            </div>
            ${task.description ? `<div class="task-description">${task.description}</div>` : ''}
            <div class="task-date">Criada em: ${formattedDate}</div>
        `;

        const checkbox = taskElement.querySelector('.task-checkbox');
        const editBtn = taskElement.querySelector('.edit-btn');
        const deleteBtn = taskElement.querySelector('.delete-btn');

        checkbox.addEventListener('change', () => this.toggleTaskCompletion(task.id));
        editBtn.addEventListener('click', () => this.openEditModal(task.id));
        deleteBtn.addEventListener('click', () => this.showDeleteConfirmation(task.id));

        return taskElement;
    }

    openAddModal() {
        this.taskTitle.value = '';
        this.taskDescription.value = '';
        this.currentTaskId = null;
        this.modalTaskTitle.textContent = 'Nova Tarefa';
        this.taskModal.style.display = 'flex';
        this.taskTitle.focus();
    }

    openEditModal(taskId) {
        const task = this.tasks.find(t => t.id === taskId);
        if (task) {
            this.taskTitle.value = task.title;
            this.taskDescription.value = task.description || '';
            this.currentTaskId = taskId;
            this.modalTaskTitle.textContent = 'Editar Tarefa';
            this.taskModal.style.display = 'flex';
            this.taskTitle.focus();
        }
    }

    showDeleteConfirmation(taskId) {
        this.taskToDelete = taskId;
        document.getElementById('confirmMessage').textContent = 'Tem certeza que deseja excluir esta tarefa?';
        this.confirmModal.style.display = 'flex';
    }

    saveTask() {
        const title = this.taskTitle.value.trim();
        const description = this.taskDescription.value.trim();

        if (!title) {
            alert('Por favor, insira um título para a tarefa');
            return;
        }

        if (this.currentTaskId) {
            // Editar tarefa existente
            const index = this.tasks.findIndex(t => t.id === this.currentTaskId);
            if (index !== -1) {
                this.tasks[index] = {
                    ...this.tasks[index],
                    title,
                    description: description || undefined
                };
            }
        } else {
            // Adicionar nova tarefa
            this.tasks.push({
                id: this.generateId(),
                title,
                description: description || undefined,
                completed: false,
                createdAt: new Date().toISOString()
            });
        }

        this.saveTasks();
        this.renderTasks();
        this.closeTaskModal();
    }

    toggleTaskCompletion(taskId) {
        const index = this.tasks.findIndex(t => t.id === taskId);
        if (index !== -1) {
            this.tasks[index].completed = !this.tasks[index].completed;
            this.saveTasks();
            this.renderTasks();
        }
    }

    deleteTask() {
        this.tasks = this.tasks.filter(t => t.id !== this.taskToDelete);
        this.saveTasks();
        this.renderTasks();
        this.closeConfirmModal();
    }

    closeTaskModal() {
        this.taskModal.style.display = 'none';
    }

    closeConfirmModal() {
        this.confirmModal.style.display = 'none';
        this.taskToDelete = null;
    }

    setFilter(filter) {
        this.filter = filter;
        this.renderTasks();
        
        this.filterButtons.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.filter === filter);
        });
    }

    setupEventListeners() {
        // Botões
        this.addTaskBtn.addEventListener('click', () => this.openAddModal());
        this.saveTaskBtn.addEventListener('click', () => this.saveTask());
        this.confirmBtn.addEventListener('click', () => this.deleteTask());

        // Modais
        this.closeModalBtn.addEventListener('click', () => this.closeTaskModal());
        this.cancelBtn.addEventListener('click', () => {
            this.closeTaskModal();
            this.closeConfirmModal();
        });

        // Filtros
        this.filterButtons.forEach(btn => {
            btn.addEventListener('click', () => this.setFilter(btn.dataset.filter));
        });

        // Fechar modais ao clicar fora
        window.addEventListener('click', (e) => {
            if (e.target === this.taskModal) this.closeTaskModal();
            if (e.target === this.confirmModal) this.closeConfirmModal();
        });

        // Teclado
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeTaskModal();
                this.closeConfirmModal();
            }
        });
    }
}

// Inicializar o gerenciador de tarefas
document.addEventListener('DOMContentLoaded', () => {
    const taskManager = new TaskManager();
});