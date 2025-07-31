let allTags = [];
let twitterHandle = '';

// Interest tags functionality
document.getElementById('interests').addEventListener('keydown', function(e) {
    if (e.key === 'Enter' || e.key === ',') {
        e.preventDefault();
        const value = this.value.trim();
        if (value && !allTags.includes(value)) {
            allTags.push(value);
            addTag(value);
            this.value = '';
        }
    }
});

// Twitter handle functionality
document.getElementById('twitter').addEventListener('input', function(e) {
    let value = this.value;
    // Remove @ if user types it
    if (value.startsWith('@')) {
        value = value.substring(1);
    }
    // Store the handle without @
    twitterHandle = value;
    // Update display
    this.value = value;
});

function addTag(text) {
    const container = document.getElementById('tags-container');
    const tag = document.createElement('div');
    tag.classList.add('tag');
    tag.innerHTML = `${escapeHtml(text)} <span class="remove" onclick="removeTag('${text}', this.parentElement)">×</span>`;
    container.appendChild(tag);
}

function removeTag(text, element) {
    allTags = allTags.filter(tag => tag !== text);
    element.remove();
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function openModal() {
    document.getElementById('feedbackModal').style.display = 'block';
}

function closeModal() {
    document.getElementById('feedbackModal').style.display = 'none';
}

async function submitFeedback(e) {
    e.preventDefault();
    const feedback = document.getElementById('feedbackText').value;
    
    try {
        await fetch('/feedback', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ feedback })
        });
        alert('Thank you for your feedback!');
    } catch (error) {
        alert('Error submitting feedback. Please try again.');
    }
    
    closeModal();
    document.getElementById('feedbackText').value = '';
}

function startGroupChat() {
    const params = new URLSearchParams();
    if (allTags.length > 0) {
        params.set('interests', allTags.join(','));
    }
    if (twitterHandle) {
        params.set('twitter', twitterHandle);
    }
    window.location.href = '/chat?' + params.toString();
}

function startVideoChat() {
    const params = new URLSearchParams();
    if (allTags.length > 0) {
        params.set('interests', allTags.join(','));
    }
    if (twitterHandle) {
        params.set('twitter', twitterHandle);
    }
    window.location.href = '/video?' + params.toString();
}

// Close modal when clicking outside
window.onclick = function(event) {
    const modal = document.getElementById('feedbackModal');
    if (event.target === modal) {
        closeModal();
    }
}
