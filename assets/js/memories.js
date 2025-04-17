class MemoryManager {
    constructor() {
        this.memories = [];
        this.currentMemoryId = null;
        this.memoryToDelete = null;
        this.filter = 'all';
        this.searchQuery = '';
        this.initElements();
        this.loadMemories();
        this.setupEventListeners();
        this.renderMemories();
    }

    initElements() {
        this.memoriesGrid = document.getElementById('memoriesGrid');
        this.addMemoryBtn = document.getElementById('addMemory');
        this.memoryModal = document.getElementById('memoryModal');
        this.viewMemoryModal = document.getElementById('viewMemoryModal');
        this.confirmModal = document.getElementById('confirmModal');
        this.closeModalBtns = document.querySelectorAll('.close-modal');
        this.cancelBtn = document.querySelector('.cancel-btn');
        this.saveMemoryBtn = document.getElementById('saveMemory');
        this.confirmBtn = document.querySelector('.confirm-btn');
        this.memoryImage = document.getElementById('memoryImage');
        this.memoryTitle = document.getElementById('memoryTitle');
        this.memoryDescription = document.getElementById('memoryDescription');
        this.memoryPreview = document.getElementById('memoryPreview');
        this.memoryImageContainer = document.getElementById('memoryImageContainer');
        this.viewMemoryTitle = document.getElementById('viewMemoryTitle');
        this.viewMemoryDate = document.getElementById('viewMemoryDate');
        this.viewMemoryDescription = document.getElementById('viewMemoryDescription');
        this.editMemoryBtn = document.getElementById('editMemoryBtn');
        this.deleteMemoryBtn = document.getElementById('deleteMemoryBtn');
        this.filterButtons = document.querySelectorAll('.filter-btn');
        this.memorySearch = document.getElementById('memorySearch');
        this.modalMemoryTitle = document.getElementById('modalMemoryTitle');
    }

    loadMemories() {
        const savedMemories = localStorage.getItem('magicDiaryMemories');
        this.memories = savedMemories ? JSON.parse(savedMemories) : [
            {
                id: this.generateId(),
                title: "Minha primeira memória",
                description: "Este é um exemplo de memória com imagem",
                imageUrl: "assets/images/sample-memory.jpg",
                createdAt: new Date().toISOString()
            }
        ];
    }

    saveMemories() {
        localStorage.setItem('magicDiaryMemories', JSON.stringify(this.memories));
    }

    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    renderMemories() {
        this.memoriesGrid.innerHTML = '';

        let filteredMemories = [...this.memories];

        // Aplicar filtro
        if (this.filter === 'recent') {
            filteredMemories.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        } else if (this.filter === 'oldest') {
            filteredMemories.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
        }

        // Aplicar busca
        if (this.searchQuery) {
            const query = this.searchQuery.toLowerCase();
            filteredMemories = filteredMemories.filter(memory => {
                const title = memory.title?.toLowerCase() || '';
                const description = memory.description?.toLowerCase() || '';
                return title.includes(query) || description.includes(query);
            });
        }

        if (filteredMemories.length === 0) {
            this.memoriesGrid.innerHTML = `
                <div class="empty-memories">
                    <i class="fas fa-images"></i>
                    <p>Nenhuma memória encontrada</p>
                </div>
            `;
            return;
        }

        filteredMemories.forEach(memory => {
            const memoryElement = this.createMemoryElement(memory);
            this.memoriesGrid.appendChild(memoryElement);
        });
    }

    createMemoryElement(memory) {
        const memoryElement = document.createElement('div');
        memoryElement.className = 'memory-item';
        memoryElement.dataset.id = memory.id;

        const date = new Date(memory.createdAt);
        const formattedDate = date.toLocaleDateString('pt-BR', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
        });

        memoryElement.innerHTML = `
            <img src="${memory.imageUrl}" alt="${memory.title || 'Memória'}" class="memory-image">
            ${memory.title ? `<div class="memory-title">${memory.title}</div>` : ''}
            <div class="memory-date">${formattedDate}</div>
            ${memory.description ? `<div class="memory-description">${memory.description}</div>` : ''}
        `;

        memoryElement.addEventListener('click', () => this.viewMemory(memory.id));

        return memoryElement;
    }

    viewMemory(memoryId) {
        const memory = this.memories.find(m => m.id === memoryId);
        if (memory) {
            this.currentMemoryId = memoryId;
            
            // Preencher modal de visualização
            this.memoryImageContainer.innerHTML = `<img src="${memory.imageUrl}" alt="${memory.title || 'Memória'}">`;
            this.viewMemoryTitle.textContent = memory.title || 'Sem título';
            
            const date = new Date(memory.createdAt);
            const formattedDate = date.toLocaleDateString('pt-BR', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
            this.viewMemoryDate.textContent = `Adicionada em: ${formattedDate}`;
            
            this.viewMemoryDescription.textContent = memory.description || 'Sem descrição';
            
            this.viewMemoryModal.style.display = 'flex';
        }
    }

    openAddModal() {
        this.memoryImage.value = '';
        this.memoryTitle.value = '';
        this.memoryDescription.value = '';
        this.currentMemoryId = null;
        this.modalMemoryTitle.textContent = 'Adicionar Memória';
        
        // Resetar pré-visualização
        this.memoryPreview.innerHTML = `
            <i class="fas fa-image"></i>
            <p>Pré-visualização aparecerá aqui</p>
        `;
        
        this.memoryModal.style.display = 'flex';
    }

    openEditModal() {
        const memory = this.memories.find(m => m.id === this.currentMemoryId);
        if (memory) {
            this.memoryTitle.value = memory.title || '';
            this.memoryDescription.value = memory.description || '';
            this.modalMemoryTitle.textContent = 'Editar Memória';
            
            // Configurar pré-visualização
            this.memoryPreview.innerHTML = `
                <img src="${memory.imageUrl}" alt="Pré-visualização">
            `;
            
            this.memoryModal.style.display = 'flex';
            this.viewMemoryModal.style.display = 'none';
        }
    }

    showDeleteConfirmation() {
        this.memoryToDelete = this.currentMemoryId;
        document.getElementById('confirmMessage').textContent = 'Tem certeza que deseja excluir esta memória?';
        this.confirmModal.style.display = 'flex';
        this.viewMemoryModal.style.display = 'none';
    }

    saveMemory() {
        const title = this.memoryTitle.value.trim();
        const description = this.memoryDescription.value.trim();
        
        if (!this.memoryImage.files[0] && !this.currentMemoryId) {
            alert('Por favor, selecione uma imagem');
            return;
        }

        if (this.currentMemoryId) {
            // Editar memória existente
            const index = this.memories.findIndex(m => m.id === this.currentMemoryId);
            if (index !== -1) {
                const updatedMemory = {
                    ...this.memories[index],
                    title: title || undefined,
                    description: description || undefined
                };

                // Se uma nova imagem foi selecionada
                if (this.memoryImage.files[0]) {
                    const reader = new FileReader();
                    reader.onload = (e) => {
                        updatedMemory.imageUrl = e.target.result;
                        this.memories[index] = updatedMemory;
                        this.saveMemories();
                        this.renderMemories();
                        this.closeMemoryModal();
                    };
                    reader.readAsDataURL(this.memoryImage.files[0]);
                } else {
                    this.memories[index] = updatedMemory;
                    this.saveMemories();
                    this.renderMemories();
                    this.closeMemoryModal();
                }
            }
        } else {
            // Adicionar nova memória
            const reader = new FileReader();
            reader.onload = (e) => {
                const newMemory = {
                    id: this.generateId(),
                    title: title || undefined,
                    description: description || undefined,
                    imageUrl: e.target.result,
                    createdAt: new Date().toISOString()
                };
                
                this.memories.push(newMemory);
                this.saveMemories();
                this.renderMemories();
                this.closeMemoryModal();
            };
            
            if (this.memoryImage.files[0]) {
                reader.readAsDataURL(this.memoryImage.files[0]);
            }
        }
    }

    deleteMemory() {
        this.memories = this.memories.filter(m => m.id !== this.memoryToDelete);
        this.saveMemories();
        this.renderMemories();
        this.closeConfirmModal();
    }

    closeMemoryModal() {
        this.memoryModal.style.display = 'none';
    }

    closeViewMemoryModal() {
        this.viewMemoryModal.style.display = 'none';
    }

    closeConfirmModal() {
        this.confirmModal.style.display = 'none';
        this.memoryToDelete = null;
    }

    setFilter(filter) {
        this.filter = filter;
        this.renderMemories();
        
        this.filterButtons.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.filter === filter);
        });
    }

    setupEventListeners() {
        // Botões
        this.addMemoryBtn.addEventListener('click', () => this.openAddModal());
        this.saveMemoryBtn.addEventListener('click', () => this.saveMemory());
        this.confirmBtn.addEventListener('click', () => this.deleteMemory());
        this.editMemoryBtn.addEventListener('click', () => this.openEditModal());
        this.deleteMemoryBtn.addEventListener('click', () => this.showDeleteConfirmation());
    
        // Pré-visualização da imagem
        this.memoryImage.addEventListener('change', (e) => {
            if (e.target.files[0]) {
                const reader = new FileReader();
                reader.onload = (event) => {
                    this.memoryPreview.innerHTML = `
                        <img src="${event.target.result}" alt="Pré-visualização">
                    `;
                };
                reader.readAsDataURL(e.target.files[0]);
            }
        });
    
        // Modais
        this.closeModalBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                this.closeMemoryModal();
                this.closeViewMemoryModal();
                this.closeConfirmModal();
            });
        });
    
        // Corrigido: fecha os modais com todos os botões de cancelar
        document.querySelectorAll('.cancel-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                this.closeMemoryModal();
                this.closeConfirmModal();
            });
        });
    
        // Filtros
        this.filterButtons.forEach(btn => {
            btn.addEventListener('click', () => this.setFilter(btn.dataset.filter));
        });
    
        // Busca
        this.memorySearch.addEventListener('input', (e) => {
            this.searchQuery = e.target.value.toLowerCase();
            this.renderMemories();
        });
    
        // Fechar modais ao clicar fora
        window.addEventListener('click', (e) => {
            if (e.target === this.memoryModal) this.closeMemoryModal();
            if (e.target === this.viewMemoryModal) this.closeViewMemoryModal();
            if (e.target === this.confirmModal) this.closeConfirmModal();
        });
    
        // Teclado
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeMemoryModal();
                this.closeViewMemoryModal();
                this.closeConfirmModal();
            }
        });
    }
    
}

// Inicializar o gerenciador de memórias
document.addEventListener('DOMContentLoaded', () => {
    const memoryManager = new MemoryManager();
});