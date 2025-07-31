// Modal functionality
function openCreateModal() {
    document.getElementById('createModal').classList.add('active');
    document.getElementById('mainContainer').classList.add('blurred');
}

function closeCreateModal() {
    document.getElementById('createModal').classList.remove('active');
    document.getElementById('mainContainer').classList.remove('blurred');
    document.getElementById('createGroupForm').reset();
    
    // Reset upload areas
    document.querySelectorAll('.upload-area').forEach(area => {
        area.classList.remove('has-file');
        area.querySelector('.upload-text').textContent = area.querySelector('.upload-text').textContent.includes('banner') ? 'Click to upload banner' : 'Click to upload profile picture';
    });
}

// File upload handling
function handleFileUpload(input, type) {
    const file = input.files[0];
    if (file) {
        const uploadArea = input.parentElement;
        uploadArea.classList.add('has-file');
        const uploadText = uploadArea.querySelector('.upload-text');
        uploadText.textContent = `${file.name} selected`;
        
        console.log(`${type} file selected:`, file.name);
    }
}

// Create group functionality
async function createGroup(event) {
    event.preventDefault();
    
    const formData = new FormData(event.target);
    const groupData = {
        groupName: formData.get('groupName'),
        description: formData.get('description'),
        ticker: formData.get('ticker'),
        tokenName: formData.get('tokenName'),
        contractAddress: formData.get('contractAddress'),
        banner: document.getElementById('bannerUpload').files[0],
        pfp: document.getElementById('pfpUpload').files[0]
    };

    console.log('Creating group:', groupData);
    
    try {
        // Send to backend
        const response = await fetch('/groups', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                name: groupData.groupName,
                description: groupData.description,
                ticker: groupData.ticker,
                tokenName: groupData.tokenName,
                contractAddress: groupData.contractAddress
                // Note: File uploads would need separate handling for images
            })
        });

        if (response.ok) {
            const result = await response.json();
            closeCreateModal();
            alert('Group created successfully!');
            
            // Reload groups
            loadGroups();
        } else {
            throw new Error('Failed to create group');
        }
    } catch (error) {
        console.error('Error creating group:', error);
        alert('Error creating group. Please try again.');
    }
}

// Join group functionality
function joinGroup(groupId) {
    console.log('Joining group:', groupId);
    
    // Get user's Twitter handle from URL if available
    const urlParams = new URLSearchParams(window.location.search);
    const twitterHandle = urlParams.get('twitter');
    
    // Redirect to group call page
    const params = new URLSearchParams();
    params.set('groupId', groupId);
    if (twitterHandle) {
        params.set('twitter', twitterHandle);
    }
    
    window.location.href = '/group-call?' + params.toString();
}

// Load groups from backend
async function loadGroups() {
    try {
        const response = await fetch('/groups');
        if (response.ok) {
            const groups = await response.json();
            displayGroups(groups);
        } else {
            console.error('Failed to load groups');
            showEmptyState();
        }
    } catch (error) {
        console.error('Error loading groups:', error);
        showEmptyState();
    }
}

// Display groups in grid
function displayGroups(groups) {
    const grid = document.getElementById('groupsGrid');
    const emptyState = document.getElementById('emptyState');
    
    if (groups.length === 0) {
        showEmptyState();
        return;
    }
    
    emptyState.style.display = 'none';
    grid.style.display = 'grid';
    grid.innerHTML = '';
    
    groups.forEach(group => {
        const card = createGroupCard(group);
        grid.appendChild(card);
    });
}

// Create group card element
function createGroupCard(group) {
    const card = document.createElement('div');
    card.className = 'group-card';
    card.onclick = () => joinGroup(group.id);
    
    // Truncate contract address for display
    const contractDisplay = group.contractAddress ? 
        group.contractAddress.substring(0, 6) + '...' + group.contractAddress.slice(-4) : 
        'No contract';
    
    // Get ticker initials for PFP
    const pfpText = group.ticker ? group.ticker.replace('$', '').substring(0, 3) : 'GRP';
    
    card.innerHTML = `
        <div class="group-banner">
            ${group.bannerUrl ? `<img src="${group.bannerUrl}" alt="Banner">` : '<span>Banner Image</span>'}
        </div>
        <div class="group-info">
            <div class="group-header">
                <div class="group-pfp">
                    ${group.pfpUrl ? `<img src="${group.pfpUrl}" alt="PFP">` : pfpText}
                </div>
                <div class="group-details">
                    <h3>${escapeHtml(group.name)}</h3>
                    <div class="group-ticker">${escapeHtml(group.ticker || '$TOKEN')}</div>
                </div>
            </div>
            <div class="group-description">
                ${escapeHtml(group.description || 'New community group')}
            </div>
            <div class="group-stats">
                <div class="member-count">
                    <span>●</span> ${group.memberCount || 0} members online
                </div>
                <div class="contract-info">${contractDisplay}</div>
            </div>
            <button class="join-btn" onclick="event.stopPropagation(); joinGroup('${group.id}')">
                Join Call
            </button>
        </div>
    `;
    
    return card;
}

// Show empty state
function showEmptyState() {
    const grid = document.getElementById('groupsGrid');
    const emptyState = document.getElementById('emptyState');
    
    grid.style.display = 'none';
    emptyState.style.display = 'block';
}

// Utility function to escape HTML
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Close modal when clicking outside
window.onclick = function(event) {
    const modal = document.getElementById('createModal');
    if (event.target === modal) {
        closeCreateModal();
    }
}

// Load groups on page load
document.addEventListener('DOMContentLoaded', function() {
    console.log('Groups page loaded');
    loadGroups();
});
