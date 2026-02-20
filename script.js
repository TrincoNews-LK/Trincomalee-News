document.addEventListener('DOMContentLoaded', () => {
    loadNews();

    // Remove Preloader
    const preloader = document.getElementById('preloader');
    if (preloader) {
        setTimeout(() => {
            preloader.classList.add('opacity-0', 'pointer-events-none');
        }, 800);
    }
});

async function loadNews() {
    const container = document.getElementById('news-container');

    try {
        // Use global variable from news_data.js
        const newsData = window.newsData;

        if (!newsData) throw new Error('News data not found. Make sure news_data.js is loaded.');

        // Sort news by ID descending (Folder Name)
        // formats like 2026-02-15(2) will properly sort before 2026-02-15(1)
        newsData.sort((a, b) => b.id.localeCompare(a.id, undefined, { numeric: true, sensitivity: 'base' }));

        container.innerHTML = ''; // Clear loading state

        for (const item of newsData) {
            const card = createNewsCard(item); // removed await
            container.appendChild(card);
        }

    } catch (error) {
        console.error('Error loading news:', error);
        container.innerHTML = `
            <div class="col-span-full text-center py-20">
                <p class="text-red-500 font-medium">Failed to load news.</p>
                <p class="text-sm text-slate-400 mt-2">${error.message}</p>
            </div>
        `;
    }
}

function createNewsCard(item) {
    // Create card element
    const card = document.createElement('article');
    card.className = 'glass-card rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 flex flex-col h-full group animate-fade-in';

    // Content preview
    const text = item.content || 'No content description available.';
    const previewText = text.slice(0, 150) + (text.length > 150 ? '...' : '');

    // Format date
    const dateOptions = { year: 'numeric', month: 'long', day: 'numeric' };
    const formattedDate = new Date(item.date).toLocaleDateString('en-US', dateOptions);

    const imageUrl = item.image;

    // Create card content
    card.innerHTML = `
        <div class="relative h-64 overflow-hidden cursor-pointer">
            <img src="${imageUrl}" alt="${item.title}" 
                 class="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
                 onerror="this.src='https://images.unsplash.com/photo-1588528292866-51f228d70954?q=80&w=2070&auto=format&fit=crop'">
            <div class="absolute top-4 left-4">
                <span class="px-3 py-1 bg-slate-900/80 backdrop-blur-sm rounded-lg text-xs font-bold text-brand-400 shadow-lg border border-slate-700">
                    ${formattedDate}
                </span>
            </div>
            <div class="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent opacity-60"></div>
        </div>
        
        <div class="p-6 flex flex-col flex-grow">
            <h3 class="font-sinhala text-xl font-bold text-white mb-3 group-hover:text-brand-400 transition-colors line-clamp-2 cursor-pointer leading-relaxed tracking-wide">
                ${item.title}
            </h3>
            <p class="font-sinhala text-slate-400 text-sm leading-relaxed mb-6 flex-grow line-clamp-3">
                ${previewText}
            </p>
            
            <div class="mt-auto pt-4 border-t border-slate-700/50 flex justify-between items-center">
                <button class="read-more-btn text-brand-400 font-semibold text-sm hover:text-brand-300 flex items-center gap-1 group/btn">
                    Read Full Story
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 transform group-hover/btn:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                </button>
            </div>
        </div>
    `;

    // Attach click listeners
    const openModal = () => openNewsModal(item);
    card.querySelector('div.relative.h-64').addEventListener('click', openModal); // Image container
    card.querySelector('h3').addEventListener('click', openModal); // Title
    card.querySelector('.read-more-btn').addEventListener('click', openModal); // Read more button

    return card;
}

// Modal Logic
function openNewsModal(item) {
    // Check if modal already exists, if not create it
    let modal = document.getElementById('news-modal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'news-modal';
        modal.className = 'fixed inset-0 z-50 flex items-center justify-center p-4 opacity-0 pointer-events-none transition-opacity duration-300';
        modal.innerHTML = `
            <div class="absolute inset-0 bg-slate-900/80 backdrop-blur-sm transition-opacity" onclick="closeNewsModal()"></div>
            <div class="bg-slate-800 w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-3xl shadow-2xl relative transform scale-95 transition-transform duration-300 z-10 border border-slate-700">
                <button onclick="closeNewsModal()" class="absolute top-4 right-4 p-2 bg-slate-700/50 hover:bg-slate-700 rounded-full text-white transition-colors z-20 backdrop-blur-md">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
                <div class="relative h-64 md:h-96">
                    <img id="modal-image" src="" alt="" class="w-full h-full object-cover">
                    <div class="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent"></div>
                    <div class="absolute bottom-0 left-0 right-0 p-6 md:p-10 bg-gradient-to-t from-slate-900 to-transparent pt-32">
                         <span id="modal-date" class="px-3 py-1 bg-brand-500 text-white text-xs font-bold rounded-lg mb-3 inline-block shadow-lg"></span>
                         <h2 id="modal-title" class="font-sinhala text-2xl md:text-4xl font-bold text-white leading-tight shadow-black drop-shadow-md"></h2>
                    </div>
                </div>
                <div class="p-6 md:p-10">
                    <div id="modal-content" class="font-sinhala prose prose-invert prose-lg max-w-none text-slate-300 leading-relaxed">
                        Loading content...
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    }

    // Populate Data
    const modalImg = document.getElementById('modal-image');
    const modalTitle = document.getElementById('modal-title');
    const modalDate = document.getElementById('modal-date');
    const modalContent = document.getElementById('modal-content');

    modalImg.src = item.image;
    modalTitle.textContent = item.title;
    const dateOptions = { year: 'numeric', month: 'long', day: 'numeric' };
    modalDate.textContent = new Date(item.date).toLocaleDateString('en-US', dateOptions);

    // Set content directly
    const text = item.content || 'Content not available.';
    modalContent.innerHTML = text.split('\n\n').map(p => `<p class="mb-4">${p}</p>`).join('');

    // Show Modal
    modal.classList.remove('opacity-0', 'pointer-events-none');
    setTimeout(() => {
        modal.querySelector('div:nth-child(2)').classList.remove('scale-95');
        modal.querySelector('div:nth-child(2)').classList.add('scale-100');
    }, 10);
    document.body.style.overflow = 'hidden'; // Prevent background scrolling
}

function closeNewsModal() {
    const modal = document.getElementById('news-modal');
    if (!modal) return;

    modal.classList.add('opacity-0', 'pointer-events-none');
    modal.querySelector('div:nth-child(2)').classList.add('scale-95');
    modal.querySelector('div:nth-child(2)').classList.remove('scale-100');
    document.body.style.overflow = '';
}
