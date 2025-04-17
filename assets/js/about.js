document.addEventListener('DOMContentLoaded', function() {
    // Elementos DOM
    const profileImage = document.getElementById('profileImage');
    const changePhotoBtn = document.getElementById('changePhotoBtn');
    const profilePhotoInput = document.getElementById('profilePhotoInput');
    const profileName = document.getElementById('profileName');
    const profileAge = document.getElementById('profileAge');
    const profileLocation = document.getElementById('profileLocation');
    const aboutText = document.getElementById('aboutText');
    const favoriteColor = document.getElementById('favoriteColor');
    const favoriteBook = document.getElementById('favoriteBook');
    const favoriteSong = document.getElementById('favoriteSong');
    const favoriteFood = document.getElementById('favoriteFood');
    const saveProfileBtn = document.getElementById('saveProfileBtn');

    // Carregar perfil salvo
    loadProfile();

    // Event Listeners
    changePhotoBtn.addEventListener('click', () => profilePhotoInput.click());
    
    profilePhotoInput.addEventListener('change', function(e) {
        if (e.target.files[0]) {
            const reader = new FileReader();
            reader.onload = function(event) {
                const img = document.createElement('img');
                img.src = event.target.result;
                profileImage.innerHTML = '';
                profileImage.appendChild(img);
                autoSaveProfile();
            };
            reader.readAsDataURL(e.target.files[0]);
        }
    });

    // Auto-save quando conteúdo editável muda
    [profileName, profileAge, profileLocation, aboutText].forEach(element => {
        element.addEventListener('input', autoSaveProfile);
    });

    // Auto-save para favoritos
    [favoriteColor, favoriteBook, favoriteSong, favoriteFood].forEach(element => {
        element.addEventListener('change', autoSaveProfile);
        element.addEventListener('input', autoSaveProfile);
    });

    // Botão de salvar
    saveProfileBtn.addEventListener('click', saveProfile);

    function loadProfile() {
        const savedProfile = localStorage.getItem('magicDiaryProfile');
        if (savedProfile) {
            const profile = JSON.parse(savedProfile);
            
            if (profile.imageUrl) {
                const img = document.createElement('img');
                img.src = profile.imageUrl;
                profileImage.innerHTML = '';
                profileImage.appendChild(img);
            }
            
            profileName.textContent = profile.name || 'Seu Nome';
            profileAge.textContent = profile.age || 'Sua idade';
            profileLocation.textContent = profile.location || 'Sua localização';
            aboutText.innerHTML = profile.about || 'Escreva aqui um pouco sobre você, seus gostos, personalidade e coisas que gosta.';
            
            if (profile.favorites) {
                favoriteColor.value = profile.favorites.color || '#9f7aea';
                favoriteBook.value = profile.favorites.book || '';
                favoriteSong.value = profile.favorites.song || '';
                favoriteFood.value = profile.favorites.food || '';
            }
        }
    }

    function autoSaveProfile() {
        saveProfile(false);
    }

    function saveProfile(showFeedback = true) {
        const profile = {
            imageUrl: profileImage.querySelector('img')?.src || null,
            name: profileName.textContent,
            age: profileAge.textContent,
            location: profileLocation.textContent,
            about: aboutText.innerHTML,
            favorites: {
                color: favoriteColor.value,
                book: favoriteBook.value,
                song: favoriteSong.value,
                food: favoriteFood.value
            },
            updatedAt: new Date().toISOString()
        };

        localStorage.setItem('magicDiaryProfile', JSON.stringify(profile));
        
        // Feedback visual
        if (showFeedback) {
            const originalText = saveProfileBtn.innerHTML;
            saveProfileBtn.innerHTML = '<i class="fas fa-check"></i> Salvo!';
            setTimeout(() => {
                saveProfileBtn.innerHTML = originalText;
            }, 2000);
        }
    }
});