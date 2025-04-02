document.addEventListener('DOMContentLoaded', function() {
    // DOM elements
    const classSelect = document.getElementById('class-select');
    const genderSelect = document.getElementById('gender-select');
    const skinSetsContainer = document.getElementById('skin-sets');
    const galleryContainer = document.getElementById('gallery');
    const secondaryFilters = document.getElementById('secondary-filters');
    const raritySelect = document.getElementById('rarity-select');
    const colorSelect = document.getElementById('color-select');
    const slotSelect = document.getElementById('slot-select');
    
    // Modal elements
    const modal = document.getElementById('image-modal');
    const modalImg = document.getElementById('modal-image');
    const modalCaption = document.getElementById('modal-caption');
    const closeBtn = document.getElementsByClassName('close')[0];
    
    // State
    let skinData = {};
    let selectedClass = '';
    let selectedGender = '';
    let selectedSkinSet = '';
    let selectedRarity = '';
    let selectedColor = '';
    let selectedSlot = '';
    let potentialIssues = []; // Track items with potential display issues
    
    // Process data to identify potential display issues
    function preprocessData(data) {
        // Check each skin entry for required fields and identify potential issues
        Object.entries(data).forEach(([filename, item]) => {
            // Track items that might have display issues
            if (!item.class || !item.gender) {
                potentialIssues.push({
                    filename: filename,
                    issue: "Missing required field (class or gender)",
                    details: JSON.stringify(item)
                });
            }
            
            if (!item.slot) {
                potentialIssues.push({
                    filename: filename,
                    issue: "Missing slot information",
                    details: JSON.stringify(item)
                });
            }
        });
        
        console.log(`Found ${potentialIssues.length} potential display issues`);
        if (potentialIssues.length > 0) {
            console.table(potentialIssues);
        }
        
        // Debug: Check how many "Other" items we have
        const otherItems = Object.values(data).filter(item => 
            item.skin_set_name === "Other" || item.skin_set === "other"
        );
        console.log(`Found ${otherItems.length} items categorized as "Other"`);
        
        return data;
    }
    
    // Fetch the skin data JSON
    fetch('skin_tags.json')
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to load skin data');
            }
            return response.json();
        })
        .then(data => {
            // Preprocess and check for potential display issues
            skinData = preprocessData(data);
            initializeFilters(skinData);
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
        raritySelect.addEventListener('change', handleSecondaryFilterChange);
        colorSelect.addEventListener('change', handleSecondaryFilterChange);
        slotSelect.addEventListener('change', handleSecondaryFilterChange);
        
        // Modal close button
        closeBtn.addEventListener('click', function() {
            modal.style.display = 'none';
        });
        
        // Close modal when clicking outside
        window.addEventListener('click', function(event) {
            if (event.target === modal) {
                modal.style.display = 'none';
            }
        });
    }
    
    // Handle primary filter changes
    function handleFilterChange() {
        selectedClass = classSelect.value;
        selectedGender = genderSelect.value;
        selectedSkinSet = ''; // Reset skin set selection when filters change
        
        // Reset secondary filters
        secondaryFilters.style.display = 'none';
        resetSecondaryFilters();
        
        updateSkinSets();
        updateGallery();
    }
    
    // Handle secondary filter changes
    function handleSecondaryFilterChange() {
        selectedRarity = raritySelect.value;
        selectedColor = colorSelect.value;
        selectedSlot = slotSelect.value;
        
        updateGallery();
    }
    
    // Reset secondary filters
    function resetSecondaryFilters() {
        selectedRarity = '';
        selectedColor = '';
        selectedSlot = '';
        
        // Clear dropdown options except the first one
        raritySelect.innerHTML = '<option value="">All Rarities</option>';
        colorSelect.innerHTML = '<option value="">All Colors</option>';
        slotSelect.innerHTML = '<option value="">All Slots</option>';
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
        
        // Debug: Check filtered items count
        console.log(`Found ${filteredItems.length} items for ${selectedClass}/${selectedGender}`);
        
        // Extract unique skin set names
        const skinSets = new Map(); // Use Map to maintain uniqueness while preserving skin_set and skin_set_name pairs
        
        // Make sure we have an "Other" category if applicable
        let hasOtherItems = false;
        
        filteredItems.forEach(item => {
            if (item.skin_set) {
                skinSets.set(item.skin_set, item.skin_set_name);
                
                // Check if we have "Other" categorized items
                if (item.skin_set === "other" || item.skin_set_name === "Other") {
                    hasOtherItems = true;
                }
            }
        });
        
        // Check if we have any skin sets to display
        if (skinSets.size === 0) {
            skinSetsContainer.innerHTML = '<p class="empty-message">No skin sets found for the selected class and gender.</p>';
            return;
        }
        
        // Debug: Check skin sets found
        console.log(`Found ${skinSets.size} unique skin sets, including "Other": ${hasOtherItems}`);
        
        // Create and append skin set elements, sorted alphabetically by name
        const sortedSkinSets = Array.from(skinSets.entries())
            .sort((a, b) => {
                // Put "Other" at the end
                if (a[1] === "Other") return 1;
                if (b[1] === "Other") return -1;
                return a[1].localeCompare(b[1]);
            });
        
        sortedSkinSets.forEach(([id, name]) => {
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
                populateSecondaryFilters();
                updateGallery();
            });
            
            skinSetsContainer.appendChild(skinSetElement);
        });
    }
    
    // Populate secondary filters based on the selected skin set
    function populateSecondaryFilters() {
        // Reset secondary filters
        resetSecondaryFilters();
        
        // Filter items based on the current primary selections
        const filteredItems = Object.values(skinData).filter(item => 
            item.class === selectedClass && 
            item.gender === selectedGender &&
            item.skin_set === selectedSkinSet
        );
        
        if (filteredItems.length === 0) {
            secondaryFilters.style.display = 'none';
            return;
        }
        
        // Extract unique values for each secondary filter
        const rarities = new Set();
        const colors = new Set();
        const slots = new Set();
        
        filteredItems.forEach(item => {
            if (item.rarity) rarities.add(item.rarity);
            if (item.color) colors.add(item.color);
            if (item.slot) slots.add(item.slot);
        });
        
        // Populate rarity dropdown
        rarities.forEach(rarity => {
            const option = document.createElement('option');
            option.value = rarity;
            option.textContent = capitalizeFirstLetter(rarity);
            raritySelect.appendChild(option);
        });
        
        // Populate color dropdown
        colors.forEach(color => {
            const option = document.createElement('option');
            option.value = color;
            option.textContent = capitalizeFirstLetter(color);
            colorSelect.appendChild(option);
        });
        
        // Populate slot dropdown
        slots.forEach(slot => {
            const option = document.createElement('option');
            option.value = slot;
            option.textContent = capitalizeFirstLetter(slot);
            slotSelect.appendChild(option);
        });
        
        // Show secondary filters
        secondaryFilters.style.display = 'block';
    }
    
    // Helper function to capitalize first letter
    function capitalizeFirstLetter(string) {
        if (!string) return '';
        return string.charAt(0).toUpperCase() + string.slice(1);
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
        let filteredItems = Object.entries(skinData).filter(([filename, item]) => 
            item.class === selectedClass && 
            item.gender === selectedGender &&
            item.skin_set === selectedSkinSet
        );
        
        // Apply secondary filters if they're set
        if (selectedRarity) {
            filteredItems = filteredItems.filter(([_, item]) => item.rarity === selectedRarity);
        }
        
        if (selectedColor) {
            filteredItems = filteredItems.filter(([_, item]) => item.color === selectedColor);
        }
        
        if (selectedSlot) {
            filteredItems = filteredItems.filter(([_, item]) => item.slot === selectedSlot);
        }
        
        // Check if we have any items to display
        if (filteredItems.length === 0) {
            galleryContainer.innerHTML = '<p class="empty-message">No skins found for the selected filters.</p>';
            return;
        }
        
        // Debug: Show how many items we're displaying
        console.log(`Displaying ${filteredItems.length} items in the gallery`);
        
        // Create and append gallery items
        filteredItems.forEach(([filename, item]) => {
            const skinItem = document.createElement('div');
            skinItem.className = 'skin-item';
            
            // Add rarity class for styling
            if (item.rarity) {
                skinItem.classList.add(`rarity-${item.rarity}`);
            }
            
            // Create image element
            const img = document.createElement('img');
            img.src = `Sprite/${filename}`;
            img.alt = filename;
            img.onerror = function() {
                this.src = 'https://via.placeholder.com/200x200?text=Image+Not+Found';
            };
            
            // Make image clickable
            img.addEventListener('click', function() {
                openModal(this.src, filename, item);
            });
            
            // Create details section
            const details = document.createElement('div');
            details.className = 'skin-details';
            
            const title = document.createElement('h3');
            title.textContent = item.skin_set_name;
            
            const slotPara = document.createElement('p');
            slotPara.textContent = `Slot: ${capitalizeFirstLetter(item.slot) || 'Unknown'}`;
            
            const colorPara = document.createElement('p');
            colorPara.textContent = `Color: ${capitalizeFirstLetter(item.color) || 'Unknown'}`;
            
            const rarityPara = document.createElement('p');
            rarityPara.textContent = `Rarity: ${capitalizeFirstLetter(item.rarity) || 'Unknown'}`;
            
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
    
    // Open modal with full-size image
    function openModal(src, filename, item) {
        modalImg.src = src;
        
        // Build caption with skin details
        let captionText = filename;
        if (item) {
            captionText += `<br>Set: ${item.skin_set_name}`;
            captionText += `<br>Slot: ${capitalizeFirstLetter(item.slot) || 'Unknown'}`;
            captionText += `<br>Color: ${capitalizeFirstLetter(item.color) || 'Unknown'}`;
            captionText += `<br>Rarity: ${capitalizeFirstLetter(item.rarity) || 'Unknown'}`;
        }
        
        modalCaption.innerHTML = captionText;
        modal.style.display = 'block';
    }
}); 