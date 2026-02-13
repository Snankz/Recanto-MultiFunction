document.addEventListener('DOMContentLoaded', async () => {
    // Ensure Supabase is initialized
    if (typeof initSupabase === 'function') {
        initSupabase();
    } else {
        console.error("initSupabase function not found. Make sure db-service.js is loaded.");
        alert("Erro: Serviço de banco de dados não carregado.");
        return;
    }

    const feed = document.getElementById('messages-feed');
    const messageInput = document.getElementById('message-input');
    const sendBtn = document.getElementById('send-btn');
    const imageUpload = document.getElementById('image-upload');
    const imagePreviewContainer = document.getElementById('image-preview-container');
    const imagePreview = document.getElementById('image-preview');
    const clearImageBtn = document.getElementById('clear-image');
    const emptyState = document.getElementById('empty-state');

    let currentImageFile = null;

    // Load Messages from Supabase
    fetchMessages();

    // Subscribe to Realtime Changes
    const subscription = window.supabaseClient
        .channel('public:newsletter_messages')
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'newsletter_messages' }, payload => {
            console.log('New message received:', payload);
            handleNewMessage(payload.new);
        })
        .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'newsletter_messages' }, payload => {
            console.log('Message deleted:', payload);
            handleDeleteMessage(payload.old.id);
        })
        .subscribe();

    // Event Listeners
    sendBtn.addEventListener('click', sendMessage);

    messageInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    });

    // Auto-resize textarea
    messageInput.addEventListener('input', function () {
        this.style.height = 'auto';
        this.style.height = (this.scrollHeight) + 'px';
        if (this.value === '') this.style.height = 'auto';
    });

    // Image Handling
    imageUpload.addEventListener('change', handleImageSelect);
    clearImageBtn.addEventListener('click', clearImageSelection);

    // --- Core Functions ---

    async function fetchMessages() {
        try {
            const { data, error } = await window.supabaseClient
                .from('newsletter_messages')
                .select('*')
                .order('created_at', { ascending: true });

            if (error) throw error;

            // Render all
            renderFeed(data || []);
        } catch (error) {
            console.error("Error fetching messages:", error);
        }
    }

    function renderFeed(messages) {
        feed.innerHTML = '';

        if (messages.length === 0) {
            feed.appendChild(emptyState);
            emptyState.style.display = 'flex';
        } else {
            emptyState.style.display = 'none';
            messages.forEach(msg => {
                const el = createMessageElement(msg);
                feed.appendChild(el);
            });
            scrollToBottom();
        }
    }

    function handleNewMessage(msg) {
        // Check if message already exists (optimistic update prevention)
        if (document.getElementById(`msg-${msg.id}`)) return;

        emptyState.style.display = 'none';
        const el = createMessageElement(msg);
        feed.appendChild(el);
        scrollToBottom();
    }

    function handleDeleteMessage(id) {
        const el = document.getElementById(`msg-${id}`);
        if (el) {
            el.remove();
            if (feed.children.length === 0 || (feed.children.length === 1 && feed.children[0].id === 'empty-state')) {
                feed.appendChild(emptyState);
                emptyState.style.display = 'flex';
            }
        }
    }

    function createMessageElement(msg) {
        const div = document.createElement('div');
        div.className = 'message-bubble self';
        div.id = `msg-${msg.id}`; // Add ID for easy removal

        // Image
        let imgHtml = '';
        if (msg.image_url) {
            imgHtml = `<div class="message-image"><img src="${msg.image_url}" alt="Imagem"></div>`;
        }

        // Text
        const textHtml = `<div class="message-text">${formatText(msg.content || '')}</div>`;

        // Format Date
        const dateObj = new Date(msg.created_at);
        const timeStr = dateObj.toLocaleString('pt-BR', {
            day: '2-digit', month: '2-digit', year: '2-digit',
            hour: '2-digit', minute: '2-digit'
        });

        // Footer (Time + Delete)
        const footerHtml = `
            <div class="message-footer">
                <span class="message-time">${timeStr}</span>
                <button class="delete-msg-btn" onclick="deleteMessage(${msg.id})">
                    <i class="fa-solid fa-trash"></i>
                </button>
            </div>
        `;

        div.innerHTML = imgHtml + textHtml + footerHtml;
        return div;
    }

    async function sendMessage() {
        const text = messageInput.value.trim();
        const fileToSend = currentImageFile; // Capture file reference before clearing

        if (!text && !fileToSend) return;

        // --- 1. Optimistic Render ---
        const tempId = `temp-${Date.now()}`;
        let optimisticImageSrc = null;

        // Prepare local preview for optimistic render
        if (fileToSend) {
            optimisticImageSrc = await new Promise(resolve => {
                const reader = new FileReader();
                reader.onload = (e) => resolve(e.target.result);
                reader.readAsDataURL(fileToSend);
            });
        }

        const optimisticMsg = {
            id: tempId,
            content: text,
            image_url: optimisticImageSrc,
            created_at: new Date().toISOString()
        };

        // Render immediately
        handleNewMessage(optimisticMsg);

        // Clear Inputs Immediately
        messageInput.value = '';
        messageInput.style.height = 'auto';
        clearImageSelection();
        messageInput.focus();

        // --- 2. Background Upload & Insert ---
        let publicURL = null;

        try {
            // Upload Image if exists
            if (fileToSend) {
                const fileName = `img_${Date.now()}_${Math.random().toString(36).substring(7)}`;
                const { data, error } = await window.supabaseClient.storage
                    .from('newsletter_images')
                    .upload(fileName, fileToSend);

                if (error) throw error;

                const urlData = window.supabaseClient.storage
                    .from('newsletter_images')
                    .getPublicUrl(fileName);

                publicURL = urlData.data.publicUrl;
            }

            // Insert Message
            const payload = {
                content: text,
                image_url: publicURL
            };

            const { data, error: insertError } = await window.supabaseClient
                .from('newsletter_messages')
                .insert([payload])
                .select();

            if (insertError) throw insertError;

            // --- 3. Reconcile Optimistic Message ---
            if (data && data.length > 0) {
                const realMsg = data[0];
                const tempEl = document.getElementById(`msg-${tempId}`);

                if (tempEl) {
                    // Update ID so real-time events don't dupe it
                    tempEl.id = `msg-${realMsg.id}`;

                    // Update Delete Button ID
                    const btn = tempEl.querySelector('.delete-msg-btn');
                    if (btn) {
                        btn.setAttribute('onclick', `deleteMessage(${realMsg.id})`);
                    }

                    // Optionally update image src to remote URL (usually same visual)
                    if (realMsg.image_url) {
                        const img = tempEl.querySelector('img');
                        if (img) img.src = realMsg.image_url;
                    }
                }
            }

        } catch (error) {
            console.error("Error sending message:", error);
            alert("Erro ao enviar mensagem: " + error.message);
            // Revert optimistic update on failure
            handleDeleteMessage(tempId);
        }
    }

    function handleImageSelect(e) {
        const file = e.target.files[0];
        if (!file) return;

        currentImageFile = file;

        // Preview
        const reader = new FileReader();
        reader.onload = (event) => {
            showImagePreview(event.target.result);
        };
        reader.readAsDataURL(file);
    }

    function showImagePreview(src) {
        imagePreview.src = src;
        imagePreviewContainer.classList.remove('hidden');
    }

    function clearImageSelection() {
        currentImageFile = null;
        imageUpload.value = '';
        imagePreviewContainer.classList.add('hidden');
    }

    function scrollToBottom() {
        feed.scrollTo({
            top: feed.scrollHeight,
            behavior: 'smooth'
        });
    }

    function formatText(text) {
        return text.replace(/\n/g, '<br>');
    }

    // Expose delete function globally
    window.deleteMessage = async function (id) {
        if (!confirm('Excluir este aviso?')) return;

        // Optimistic Delete (Remove immediately)
        handleDeleteMessage(id);

        try {
            const { error } = await window.supabaseClient
                .from('newsletter_messages')
                .delete()
                .eq('id', id);

            if (error) {
                console.error("Error deleting:", error);
                alert("Erro ao excluir no servidor. Recarregando...");
                fetchMessages(); // Revert/Reload if failed
            }
        } catch (e) {
            console.error("Error deleting:", e);
        }
    };
});
