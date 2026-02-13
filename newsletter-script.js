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
        .on('postgres_changes', { event: '*', schema: 'public', table: 'newsletter_messages' }, () => {
            fetchMessages();
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

            renderMessages(data || []);
        } catch (error) {
            console.error("Error fetching messages:", error);
        }
    }

    function renderMessages(messages) {
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

    function createMessageElement(msg) {
        const div = document.createElement('div');
        div.className = 'message-bubble self'; // Assuming all are self/sent by "us" for now

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

        if (!text && !currentImageFile) return;

        // Visual Feedback (Disable button)
        sendBtn.disabled = true;
        sendBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i>';

        let publicURL = null;

        try {
            // 1. Upload Image if exists
            if (currentImageFile) {
                const fileName = `img_${Date.now()}_${Math.random().toString(36).substring(7)}`;
                const { data, error } = await window.supabaseClient.storage
                    .from('newsletter_images')
                    .upload(fileName, currentImageFile);

                if (error) throw error;

                // Get Public URL
                const urlData = window.supabaseClient.storage
                    .from('newsletter_images')
                    .getPublicUrl(fileName);

                publicURL = urlData.data.publicUrl;
            }

            // 2. Insert Message
            const { error: insertError } = await window.supabaseClient
                .from('newsletter_messages')
                .insert([{
                    content: text,
                    image_url: publicURL
                }]);

            if (insertError) throw insertError;

            // Success: clear inputs (feed updates via realtime)
            messageInput.value = '';
            messageInput.style.height = 'auto';
            clearImageSelection();

        } catch (error) {
            console.error("Error sending message:", error);
            alert("Erro ao enviar mensagem: " + error.message);
        } finally {
            sendBtn.disabled = false;
            sendBtn.innerHTML = '<i class="fa-solid fa-paper-plane"></i>';
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
        feed.scrollTop = feed.scrollHeight;
    }

    function formatText(text) {
        return text.replace(/\n/g, '<br>');
    }

    // Expose delete function globally
    window.deleteMessage = async function (id) {
        if (!confirm('Excluir este aviso?')) return;

        try {
            const { error } = await window.supabaseClient
                .from('newsletter_messages')
                .delete()
                .eq('id', id);

            if (error) throw error;
            // UI updates via realtime subscription
        } catch (e) {
            console.error("Error deleting:", e);
            alert("Erro ao excluir.");
        }
    };
});
