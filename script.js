let currentPage = 1;
const itemsPerPage = 10;
let filteredData = [];

document.addEventListener('DOMContentLoaded', () => {
    // Initialize data
    const newsData = window.newsData;
    if (newsData) {
        newsData.sort((a, b) => b.id.localeCompare(a.id, undefined, { numeric: true, sensitivity: 'base' }));
        filteredData = [...newsData];
    }

    createParticles(); // Inject advanced animated background
    initPremiumAnimations();
    loadNews();

    // Search functionality
    const searchInput = document.getElementById('search-input');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            const query = e.target.value.toLowerCase();
            const allData = window.newsData || [];
            
            filteredData = allData.filter(item => 
                item.title.toLowerCase().includes(query) || 
                (item.content && item.content.toLowerCase().includes(query))
            );
            
            currentPage = 1; // Reset to page 1
            loadNews();
        });
    }

    // Remove Preloader
    const preloader = document.getElementById('preloader');
    if (preloader) {
        setTimeout(() => {
            preloader.classList.add('opacity-0', 'pointer-events-none');
        }, 800);
    }
});

function loadNews() {
    const container = document.getElementById('news-container');

    try {
        if (!window.newsData) throw new Error('News data not found. Make sure news_data.js is loaded.');

        container.innerHTML = ''; // Clear loading state

        if (filteredData.length === 0) {
            container.innerHTML = `<div class="col-span-full text-center py-20 text-slate-500">No news found matching your search.</div>`;
            renderPagination(0);
            return;
        }

        const totalPages = Math.ceil(filteredData.length / itemsPerPage);
        if (currentPage > totalPages) currentPage = totalPages;

        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        const currentData = filteredData.slice(startIndex, endIndex);

        for (const item of currentData) {
            const card = createNewsCard(item); 
            container.appendChild(card);
        }

        renderPagination(totalPages);

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

function renderPagination(totalPages) {
    const paginationContainer = document.getElementById('pagination-container');
    if (!paginationContainer) return;
    
    paginationContainer.innerHTML = '';

    if (totalPages <= 1) return;

    // Previous Button
    const prevBtn = document.createElement('button');
    prevBtn.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clip-rule="evenodd" />
        </svg>
    `;
    prevBtn.className = `w-10 h-10 flex items-center justify-center rounded-xl font-medium transition-all duration-300 ${currentPage === 1 ? 'bg-slate-800/50 text-slate-600 cursor-not-allowed' : 'bg-slate-800 text-brand-400 hover:bg-brand-600 hover:text-white shadow-lg hover:shadow-brand-500/30'}`;
    prevBtn.disabled = currentPage === 1;
    prevBtn.onclick = () => {
        if (currentPage > 1) {
            currentPage--;
            loadNews();
            scrollToNews();
        }
    };
    paginationContainer.appendChild(prevBtn);

    // Page Buttons
    for (let i = 1; i <= totalPages; i++) {
        if (i === 1 || i === totalPages || (i >= currentPage - 1 && i <= currentPage + 1)) {
            const pageBtn = document.createElement('button');
            pageBtn.textContent = i;
            if (i === currentPage) {
                pageBtn.className = 'w-10 h-10 flex items-center justify-center rounded-xl bg-brand-600 text-white font-bold shadow-lg shadow-brand-500/30 transform scale-110';
            } else {
                pageBtn.className = 'w-10 h-10 flex items-center justify-center rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-brand-300 transition-all duration-300';
            }
            pageBtn.onclick = () => {
                currentPage = i;
                loadNews();
                scrollToNews();
            };
            paginationContainer.appendChild(pageBtn);
        } else if (i === currentPage - 2 || i === currentPage + 2) {
            const dots = document.createElement('span');
            dots.textContent = '...';
            dots.className = 'text-slate-500 px-2';
            paginationContainer.appendChild(dots);
        }
    }

    // Next Button
    const nextBtn = document.createElement('button');
    nextBtn.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd" />
        </svg>
    `;
    nextBtn.className = `w-10 h-10 flex items-center justify-center rounded-xl font-medium transition-all duration-300 ${currentPage === totalPages ? 'bg-slate-800/50 text-slate-600 cursor-not-allowed' : 'bg-slate-800 text-brand-400 hover:bg-brand-600 hover:text-white shadow-lg hover:shadow-brand-500/30'}`;
    nextBtn.disabled = currentPage === totalPages;
    nextBtn.onclick = () => {
        if (currentPage < totalPages) {
            currentPage++;
            loadNews();
            scrollToNews();
        }
    };
    paginationContainer.appendChild(nextBtn);
}

function scrollToNews() {
    const container = document.getElementById('news-container');
    if (container) {
        const y = container.getBoundingClientRect().top + window.scrollY - 150;
        window.scrollTo({top: y, behavior: 'smooth'});
    }
}

function createParticles() {
    const container = document.createElement('div');
    container.className = 'fixed inset-0 pointer-events-none z-[0] overflow-hidden'; 
    for (let i = 0; i < 40; i++) {
        const particle = document.createElement('div');
        particle.className = 'absolute rounded-full';
        
        const size = Math.random() * 60 + 10; 
        const posX = Math.random() * 100;
        const posY = Math.random() * 100;
        const duration = Math.random() * 30 + 20;
        const delay = Math.random() * 5;
        
        particle.style.width = `${size}px`;
        particle.style.height = `${size}px`;
        particle.style.left = `${posX}%`;
        particle.style.top = `${posY}%`;
        
        // Deep, rich colors for dark premium look
        const colors = ['rgba(14, 165, 233, 0.15)', 'rgba(79, 70, 229, 0.15)', 'rgba(56, 189, 248, 0.1)', 'rgba(99, 102, 241, 0.1)'];
        const color = colors[Math.floor(Math.random() * colors.length)];
        
        particle.style.background = `radial-gradient(circle, ${color} 0%, transparent 70%)`;
        particle.style.filter = 'blur(8px)';
        
        particle.animate([
            { transform: 'translate(0, 0) scale(1)', opacity: 0.1 },
            { transform: `translate(${Math.random()*150 - 75}px, ${Math.random()*150 - 75}px) scale(1.5)`, opacity: 0.8 },
            { transform: 'translate(0, 0) scale(1)', opacity: 0.1 }
        ], {
            duration: duration * 1000,
            iterations: Infinity,
            delay: delay * 1000,
            direction: 'alternate',
            easing: 'ease-in-out'
        });
        
        container.appendChild(particle);
    }
    
    const overlay = document.querySelector('.bg-overlay');
    if (overlay) {
        overlay.insertAdjacentElement('afterend', container);
    } else {
        document.body.prepend(container);
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

function initPremiumAnimations() {
    const titleEl = document.getElementById('hero-title');
    const descEl = document.getElementById('hero-desc');
    
    if (titleEl) {
        titleEl.innerHTML = '';
        titleEl.classList.remove('opacity-0');
        
        const line1 = document.createElement('span');
        const br = document.createElement('br');
        const line2 = document.createElement('span');
        line2.className = 'text-transparent bg-clip-text bg-gradient-to-r from-brand-400 to-indigo-400 filter drop-shadow-lg';
        
        const cursor = document.createElement('span');
        cursor.className = 'inline-block w-1 md:w-2 h-10 md:h-14 bg-brand-400 ml-2 animate-pulse align-middle translate-y-[-4px] md:translate-y-[-8px]';
        
        titleEl.appendChild(line1);
        titleEl.appendChild(cursor);
        
        const text1 = "Trincomalee";
        const text2 = "News Update";
        
        let i = 0;
        let j = 0;
        
        function typeWriter() {
            if (i < text1.length) {
                line1.innerHTML += text1.charAt(i);
                i++;
                setTimeout(typeWriter, 120);
            } else if (i === text1.length) {
                titleEl.insertBefore(br, cursor);
                titleEl.insertBefore(line2, cursor);
                i++;
                setTimeout(typeWriter, 400); // Pause before typing the second line
            } else if (j < text2.length) {
                line2.innerHTML += text2.charAt(j);
                j++;
                setTimeout(typeWriter, 100);
            } else {
                cursor.classList.add('opacity-50');
                animateDescription();
            }
        }
        
        // Start typing after a short delay so the preloader can fade
        setTimeout(typeWriter, 600);
    }
    
    function animateDescription() {
        if (!descEl) return;
        descEl.classList.remove('opacity-0');
        
        const text = "The latest special events and important news from our beautiful Trincomalee will be updated directly for your information";
        descEl.innerHTML = '';
        
        const words = text.split(' ');
        words.forEach((word, idx) => {
            const span = document.createElement('span');
            // Advanced premium blur-up reveal effect
            span.className = 'inline-block opacity-0 transform translate-y-6 blur-sm transition-all duration-700 ease-out';
            span.innerText = word + ' ';
            descEl.appendChild(span);
            
            setTimeout(() => {
                span.classList.remove('opacity-0', 'translate-y-6', 'blur-sm');
                span.classList.add('opacity-100', 'translate-y-0', 'blur-none');
            }, idx * 60); // Staggering effect for each word
        });
    }
}
