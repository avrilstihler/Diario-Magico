class DreamManager {
    constructor() {
        this.dreams = [];
        this.currentDreamId = null;
        this.dreamToDelete = null;
        this.filter = 'all';
        this.initElements();
        this.loadDreams();
        this.setupEventListeners();
        this.renderDreams();
    }

    initElements() {
        this.dreamsList = document.getElementById('dreamsList');
        this.addDreamBtn = document.getElementById('addDream');
        this.dreamModal = document.getElementById('dreamModal');
        this.confirmModal = document.getElementById('confirmModal');
        this.closeModalBtn = document.querySelector('.close-modal');
        this.cancelBtn = document.querySelector('.cancel-btn');
        this.saveDreamBtn = document.getElementById('saveDream');
        this.confirmBtn = document.querySelector('.confirm-btn');
        this.dreamTitle = document.getElementById('dreamTitle');
        this.dreamDescription = document.getElementById('dreamDescription');
        this.lucidCheckbox = document.getElementById('lucidDream');
        this.recurringCheckbox = document.getElementById('recurringDream');
        this.nightmareCheckbox = document.getElementById('nightmare');
        this.modalDreamTitle = document.getElementById('modalDreamTitle');
        this.filterButtons = document.querySelectorAll('.filter-btn');
    }

    loadDreams() {
        const savedDreams = localStorage.getItem('magicDiaryDreams');
        this.dreams = savedDreams ? JSON.parse(savedDreams) : [
            {
                id: this.generateId(),
                title: "Meu primeiro sonho registrado",
                description: "Eu estava voando sobre campos coloridos... foi incrível!",
                isLucid: true,
                isRecurring: false,
                isNightmare: false,
                createdAt: new Date().toISOString()
            }
        ];
    }

    saveDreams() {
        localStorage.setItem('magicDiaryDreams', JSON.stringify(this.dreams));
    }

    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    renderDreams() {
        this.dreamsList.innerHTML = '';

        const filteredDreams = this.dreams.filter(dream => {
            if (this.filter === 'all') return true;
            if (this.filter === 'lucid') return dream.isLucid;
            if (this.filter === 'recurring') return dream.isRecurring;
            if (this.filter === 'nightmare') return dream.isNightmare;
            return true;
        });

        if (filteredDreams.length === 0) {
            this.dreamsList.innerHTML = `
                <div class="empty-dreams">
                    <i class="fas fa-cloud"></i>
                    <p>Nenhum sonho ${this.getFilterText()} registrado</p>
                </div>
            `;
            return;
        }

        filteredDreams.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        filteredDreams.forEach(dream => {
            const dreamElement = this.createDreamElement(dream);
            this.dreamsList.appendChild(dreamElement);
        });
    }

    getFilterText() {
        switch (this.filter) {
            case 'all': return '';
            case 'lucid': return 'lúcido';
            case 'recurring': return 'recorrente';
            case 'nightmare': return 'pesadelo';
            default: return '';
        }
    }

    createDreamElement(dream) {
        const dreamElement = document.createElement('div');
        dreamElement.className = 'dream-item';
        
        if (dream.isLucid) dreamElement.classList.add('lucid');
        if (dream.isRecurring) dreamElement.classList.add('recurring');
        if (dream.isNightmare) dreamElement.classList.add('nightmare');

        dreamElement.dataset.id = dream.id;

        const date = new Date(dream.createdAt);
        const formattedDate = date.toLocaleDateString('pt-BR', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });

        const tags = [];
        if (dream.isLucid) tags.push({text: 'Lúcido', class: 'lucid'});
        if (dream.isRecurring) tags.push({text: 'Recorrente', class: 'recurring'});
        if (dream.isNightmare) tags.push({text: 'Pesadelo', class: 'nightmare'});

        dreamElement.innerHTML = `
            <div class="dream-title">${dream.title}</div>
            ${tags.length > 0 ? `
                <div class="dream-tags">
                    ${tags.map(tag => `<span class="dream-tag ${tag.class}">${tag.text}</span>`).join('')}
                </div>
            ` : ''}
            <div class="dream-description">${dream.description.replace(/\n/g, '<br>')}</div>
            <div class="dream-date">Registrado em: ${formattedDate}</div>
            <div class="dream-actions">
                <button class="dream-action edit-btn"><i class="fas fa-edit"></i></button>
                <button class="dream-action delete-btn"><i class="fas fa-trash"></i></button>
            </div>
        `;

        const editBtn = dreamElement.querySelector('.edit-btn');
        const deleteBtn = dreamElement.querySelector('.delete-btn');

        editBtn.addEventListener('click', () => this.openEditModal(dream.id));
        deleteBtn.addEventListener('click', () => this.showDeleteConfirmation(dream.id));

        return dreamElement;
    }

    openAddModal() {
        this.dreamTitle.value = '';
        this.dreamDescription.value = '';
        this.lucidCheckbox.checked = false;
        this.recurringCheckbox.checked = false;
        this.nightmareCheckbox.checked = false;
        this.currentDreamId = null;
        this.modalDreamTitle.textContent = 'Registrar Sonho';
        this.dreamModal.style.display = 'flex';
        this.dreamTitle.focus();
    }

    openEditModal(dreamId) {
        const dream = this.dreams.find(d => d.id === dreamId);
        if (dream) {
            this.dreamTitle.value = dream.title;
            this.dreamDescription.value = dream.description || '';
            this.lucidCheckbox.checked = dream.isLucid;
            this.recurringCheckbox.checked = dream.isRecurring;
            this.nightmareCheckbox.checked = dream.isNightmare;
            this.currentDreamId = dreamId;
            this.modalDreamTitle.textContent = 'Editar Sonho';
            this.dreamModal.style.display = 'flex';
            this.dreamTitle.focus();
        }
    }

    showDeleteConfirmation(dreamId) {
        this.dreamToDelete = dreamId;
        document.getElementById('confirmMessage').textContent = 'Tem certeza que deseja excluir este sonho?';
        this.confirmModal.style.display = 'flex';
    }

    saveDream() {
        const title = this.dreamTitle.value.trim();
        const description = this.dreamDescription.value.trim();
        const isLucid = this.lucidCheckbox.checked;
        const isRecurring = this.recurringCheckbox.checked;
        const isNightmare = this.nightmareCheckbox.checked;

        if (!title) {
            alert('Por favor, insira um título para o sonho');
            return;
        }

        if (this.currentDreamId) {
            // Editar sonho existente
            const index = this.dreams.findIndex(d => d.id === this.currentDreamId);
            if (index !== -1) {
                this.dreams[index] = {
                    ...this.dreams[index],
                    title,
                    description: description || undefined,
                    isLucid,
                    isRecurring,
                    isNightmare
                };
            }
        } else {
            // Adicionar novo sonho
            this.dreams.push({
                id: this.generateId(),
                title,
                description: description || undefined,
                isLucid,
                isRecurring,
                isNightmare,
                createdAt: new Date().toISOString()
            });
        }

        this.saveDreams();
        this.renderDreams();
        this.closeDreamModal();
    }

    deleteDream() {
        this.dreams = this.dreams.filter(d => d.id !== this.dreamToDelete);
        this.saveDreams();
        this.renderDreams();
        this.closeConfirmModal();
    }

    closeDreamModal() {
        this.dreamModal.style.display = 'none';
    }

    closeConfirmModal() {
        this.confirmModal.style.display = 'none';
        this.dreamToDelete = null;
    }

    setFilter(filter) {
        this.filter = filter;
        this.renderDreams();
        
        this.filterButtons.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.filter === filter);
        });
    }

    setupEventListeners() {
        // Botões
        this.addDreamBtn.addEventListener('click', () => this.openAddModal());
        this.saveDreamBtn.addEventListener('click', () => this.saveDream());
        this.confirmBtn.addEventListener('click', () => this.deleteDream());

        // Modais
        this.closeModalBtn.addEventListener('click', () => this.closeDreamModal());
        this.cancelBtn.addEventListener('click', () => {
            this.closeDreamModal();
            this.closeConfirmModal();
        });

        // Filtros
        this.filterButtons.forEach(btn => {
            btn.addEventListener('click', () => this.setFilter(btn.dataset.filter));
        });

        // Fechar modais ao clicar fora
        window.addEventListener('click', (e) => {
            if (e.target === this.dreamModal) this.closeDreamModal();
            if (e.target === this.confirmModal) this.closeConfirmModal();
        });

        // Teclado
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeDreamModal();
                this.closeConfirmModal();
            }
        });
    }
}

// Inicializar o gerenciador de sonhos
document.addEventListener('DOMContentLoaded', () => {
    const dreamManager = new DreamManager();
});