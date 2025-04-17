document.addEventListener('DOMContentLoaded', function() {
    // Elementos DOM
    const book = document.querySelector('.magic-book');
    const pagesContainer = document.getElementById('diaryPages');
    const prevBtn = document.getElementById('prevPage');
    const nextBtn = document.getElementById('nextPage');
    const addBtn = document.getElementById('addPage');
    const currentPageSpan = document.getElementById('currentPage');
    const totalPagesSpan = document.getElementById('totalPages');


    document.getElementById("deletePage").addEventListener("click", function () {
        const pages = JSON.parse(localStorage.getItem("magicDiaryEntries")) || [];
        const currentPageIndex = parseInt(document.getElementById("currentPage").textContent) - 1;
    
        if (pages.length === 0) return;
    
        if (confirm("Tem certeza que deseja excluir esta página? Essa ação não pode ser desfeita.")) {
            pages.splice(currentPageIndex, 1);
            localStorage.setItem("magicDiaryEntries", JSON.stringify(pages));
            location.reload();
        }
    });
    

    
    // Estado do diário
    let currentPage = 0;
    let diaryEntries = [];
    let currentEditingId = null;

    // Inicialização
    loadEntries();
    renderPages();
    setupEventListeners();

    function loadEntries() {
        const savedEntries = localStorage.getItem('magicDiaryEntries');
        diaryEntries = savedEntries ? JSON.parse(savedEntries) : [
            {
                id: generateId(),
                content: "Escreva aqui sua primeira entrada...\n\nClique para editar a qualquer momento.",
                date: new Date().toLocaleDateString('pt-BR', { 
                    day: 'numeric', 
                    month: 'long', 
                    year: 'numeric' 
                })
            }
        ];
        updatePageCount();
    }

    function saveEntries() {
        localStorage.setItem('magicDiaryEntries', JSON.stringify(diaryEntries));
        updatePageCount();
    }

    function generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    function updatePageCount() {
        currentPageSpan.textContent = currentPage + 1;
        totalPagesSpan.textContent = diaryEntries.length;
    }

    function renderPages() {
        pagesContainer.innerHTML = '';
        
        diaryEntries.forEach((entry, index) => {
            const page = createPageElement(entry, index);
            pagesContainer.appendChild(page);
        });

        positionPages();
        updatePageCount();
    }

    function createPageElement(entry, index) {
        const page = document.createElement('div');
        page.className = 'page';
        page.dataset.id = entry.id;

        const pageContent = document.createElement('div');
        pageContent.className = 'page-content';
        pageContent.contentEditable = 'true';
        
        const dateElement = document.createElement('div');
        dateElement.className = 'page-date';
        dateElement.textContent = entry.date;
        dateElement.contentEditable = 'false';
        
        const textElement = document.createElement('div');
        textElement.className = 'page-text';
        textElement.textContent = entry.content;
        
        pageContent.appendChild(dateElement);
        pageContent.appendChild(textElement);

        const pageNumber = document.createElement('div');
        pageNumber.className = 'page-number';
        pageNumber.textContent = `Página ${index + 1}`;

        page.appendChild(pageContent);
        page.appendChild(pageNumber);

        // Evento para salvar ao sair do foco
        pageContent.addEventListener('blur', () => {
            savePageContent(entry.id, pageContent);
        });

        return page;
    }

    function savePageContent(id, pageContent) {
        const textElement = pageContent.querySelector('.page-text');
        const entryIndex = diaryEntries.findIndex(e => e.id === id);
        
        if (entryIndex !== -1 && textElement) {
            diaryEntries[entryIndex].content = textElement.textContent;
            saveEntries();
        }
    }

    function positionPages() {
        const pages = document.querySelectorAll('.page');
        const angleIncrement = 180 / (diaryEntries.length + 1);

        pages.forEach((page, index) => {
            const angle = angleIncrement * (index + 1);
            const zOffset = Math.sin(angle * Math.PI / 180) * 100;

            if (index < currentPage) {
                page.style.transform = `rotateY(-180deg) translateZ(${zOffset}px)`;
                page.style.zIndex = diaryEntries.length - index;
            } else if (index === currentPage) {
                page.style.transform = `rotateY(0deg) translateZ(${zOffset}px)`;
                page.style.zIndex = diaryEntries.length;
            } else {
                page.style.transform = `rotateY(0deg) translateZ(${zOffset}px)`;
                page.style.zIndex = diaryEntries.length - index;
            }
        });
    }

    function goToPrevPage() {
        if (currentPage > 0) {
            currentPage--;
            positionPages();
            updatePageCount();
        }
    }

    function goToNextPage() {
        if (currentPage < diaryEntries.length - 1) {
            currentPage++;
            positionPages();
            updatePageCount();
        }
    }

    function addNewPage() {
        const newEntry = {
            id: generateId(),
            content: "Nova entrada...",
            date: new Date().toLocaleDateString('pt-BR', { 
                day: 'numeric', 
                month: 'long', 
                year: 'numeric' 
            })
        };
        
        diaryEntries.push(newEntry);
        currentPage = diaryEntries.length - 1;
        saveEntries();
        renderPages();
        
        // Focar na nova página
        const newPage = pagesContainer.lastChild;
        const pageContent = newPage.querySelector('.page-content');
        const textElement = pageContent.querySelector('.page-text');
        setTimeout(() => {
            textElement.focus();
        }, 100);
    }

    function setupEventListeners() {
        // Navegação
        prevBtn.addEventListener('click', goToPrevPage);
        nextBtn.addEventListener('click', goToNextPage);
        addBtn.addEventListener('click', addNewPage);

        // Navegação por teclado
        document.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowLeft') goToPrevPage();
            if (e.key === 'ArrowRight') goToNextPage();
        });

        // Navegação por arrastar
        let startX = 0;
        let isDragging = false;

        book.addEventListener('mousedown', (e) => {
            startX = e.clientX;
            isDragging = true;
        });

        window.addEventListener('mousemove', (e) => {
            if (!isDragging) return;
            
            const deltaX = e.clientX - startX;
            if (deltaX > 50 && currentPage > 0) {
                goToPrevPage();
                isDragging = false;
            } else if (deltaX < -50 && currentPage < diaryEntries.length - 1) {
                goToNextPage();
                isDragging = false;
            }
        });

        window.addEventListener('mouseup', () => {
            isDragging = false;
        });

        // Touch events
        book.addEventListener('touchstart', (e) => {
            startX = e.touches[0].clientX;
            isDragging = true;
        });

        window.addEventListener('touchmove', (e) => {
            if (!isDragging) return;
            
            const deltaX = e.touches[0].clientX - startX;
            if (deltaX > 50 && currentPage > 0) {
                goToPrevPage();
                isDragging = false;
            } else if (deltaX < -50 && currentPage < diaryEntries.length - 1) {
                goToNextPage();
                isDragging = false;
            }
        });

        window.addEventListener('touchend', () => {
            isDragging = false;
        });
    }
});