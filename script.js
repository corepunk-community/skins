document.addEventListener('DOMContentLoaded', function() {
    // DOM elements
    const classSelect = document.getElementById('class-select');
    const genderSelect = document.getElementById('gender-select');
    const skinSetsContainer = document.getElementById('skin-sets');
    const galleryContainer = document.getElementById('gallery');
    
    // State
    let skinData = {};
    let selectedClass = '';
    let selectedGender = '';
    let selectedSkinSet = '';
    
    // Fetch the skin data JSON
    fetch('skin_tags.json')
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to load skin data');
            }
            return response.json();
        })
        .then(data => {
            skinData = data;
            initializeFilters(data);
        })
        .catch(error => {
            console.error('Error loading skin data:', error);
            skinSetsContainer.innerHTML = `<p class="empty-message">Error loading skin data: ${error.message}</p>`;
        });
    
    // Initialize filter dropdowns with unique values
    function initializeFilters(data) {
        // Extract unique classes and genders
        const classes = new Set();
        const genders = new Set();
        
        Object.values(data).forEach(item => {
            if (item.class) classes.add(item.class);
            if (item.gender) genders.add(item.gender);
        });
        
        // Populate class dropdown
        classes.forEach(className => {
            const option = document.createElement('option');
            option.value = className;
            option.textContent = className;
            classSelect.appendChild(option);
        });
        
        // Populate gender dropdown
        genders.forEach(gender => {
            const option = document.createElement('option');
            option.value = gender;
            option.textContent = gender;
            genderSelect.appendChild(option);
        });
        
        // Add event listeners
        classSelect.addEventListener('change', handleFilterChange);
        genderSelect.addEventListener('change', handleFilterChange);
    }
    
    // Handle filter changes
    function handleFilterChange() {
        selectedClass = classSelect.value;
        selectedGender = genderSelect.value;
        selectedSkinSet = ''; // Reset skin set selection when filters change
        
        updateSkinSets();
        updateGallery();
    }
    
    // Update the skin sets based on selected class and gender
    function updateSkinSets() {
        // Clear previous skin sets
        skinSetsContainer.innerHTML = '';
        
        if (!selectedClass || !selectedGender) {
            skinSetsContainer.innerHTML = '<p class="empty-message">Please select a class and gender to see available skin sets.</p>';
            return;
        }
        
        // Filter items based on selected class and gender
        const filteredItems = Object.values(skinData).filter(item => 
            item.class === selectedClass && item.gender === selectedGender
        );
        
        // Extract unique skin set names
        const skinSets = new Map(); // Use Map to maintain uniqueness while preserving skin_set and skin_set_name pairs
        
        filteredItems.forEach(item => {
            if (item.skin_set && item.skin_set_name) {
                skinSets.set(item.skin_set, item.skin_set_name);
            }
        });
        
        // Check if we have any skin sets to display
        if (skinSets.size === 0) {
            skinSetsContainer.innerHTML = '<p class="empty-message">No skin sets found for the selected class and gender.</p>';
            return;
        }
        
        // Create and append skin set elements
        skinSets.forEach((name, id) => {
            if (name) { // Only add if there's a name
                const skinSetElement = document.createElement('div');
                skinSetElement.className = 'skin-set';
                skinSetElement.textContent = name;
                skinSetElement.dataset.setId = id;
                
                skinSetElement.addEventListener('click', function() {
                    // Remove active class from all skin sets
                    document.querySelectorAll('.skin-set').forEach(el => el.classList.remove('active'));
                    
                    // Add active class to clicked skin set
                    this.classList.add('active');
                    
                    // Update selection and gallery
                    selectedSkinSet = id;
                    updateGallery();
                });
                
                skinSetsContainer.appendChild(skinSetElement);
            }
        });
    }
    
    // Update the gallery based on all selected filters
    function updateGallery() {
        // Clear previous gallery
        galleryContainer.innerHTML = '';
        
        if (!selectedClass || !selectedGender || !selectedSkinSet) {
            galleryContainer.innerHTML = '<p class="empty-message">Select a skin set to view skins.</p>';
            return;
        }
        
        // Filter items based on all selections
        const filteredItems = Object.entries(skinData).filter(([filename, item]) => 
            item.class === selectedClass && 
            item.gender === selectedGender &&
            item.skin_set === selectedSkinSet
        );
        
        // Check if we have any items to display
        if (filteredItems.length === 0) {
            galleryContainer.innerHTML = '<p class="empty-message">No skins found for the selected filters.</p>';
            return;
        }
        
        // Create and append gallery items
        filteredItems.forEach(([filename, item]) => {
            const skinItem = document.createElement('div');
            skinItem.className = 'skin-item';
            
            // Create image element
            const img = document.createElement('img');
            img.src = `Sprite/${filename}`;
            img.alt = filename;
            img.onerror = function() {
                this.src = 'https://via.placeholder.com/200x200?text=Image+Not+Found';
            };
            
            // Create details section
            const details = document.createElement('div');
            details.className = 'skin-details';
            
            const title = document.createElement('h3');
            title.textContent = item.skin_set_name || 'Unknown Set';
            
            const slotPara = document.createElement('p');
            slotPara.textContent = `Slot: ${item.slot || 'Unknown'}`;
            
            const colorPara = document.createElement('p');
            colorPara.textContent = `Color: ${item.color || 'Unknown'}`;
            
            const rarityPara = document.createElement('p');
            rarityPara.textContent = `Rarity: ${item.rarity || 'Unknown'}`;
            
            // Append all elements
            details.appendChild(title);
            details.appendChild(slotPara);
            details.appendChild(colorPara);
            details.appendChild(rarityPara);
            
            skinItem.appendChild(img);
            skinItem.appendChild(details);
            
            galleryContainer.appendChild(skinItem);
        });
    }
}); 