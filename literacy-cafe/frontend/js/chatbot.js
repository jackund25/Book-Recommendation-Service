document.addEventListener('DOMContentLoaded', function() {
    const chatbotToggle = document.getElementById('chatbotToggle');
    const notificationBadge = document.getElementById('notificationBadge');
    let isMinimized = true;

    const chatbotContainer = document.getElementById('chatbotContainer');
    if (!chatbotContainer) {
        console.error('Chatbot container not found!');
        return;
    }

    function initializeChatbot() {
        try {
            // Initial state
            setTimeout(() => {
                notificationBadge.classList.add('active');
            }, 2000);

            function toggleChatbot() {
                isMinimized = !isMinimized;
                chatbotContainer.classList.toggle('minimized', isMinimized);
                chatbotContainer.classList.toggle('active', !isMinimized);
                chatbotToggle.classList.toggle('minimized', isMinimized);
                
                if (!isMinimized) {
                    notificationBadge.classList.remove('active');
                }
            }

            // Show chatbot on toggle click
            chatbotToggle.addEventListener('click', toggleChatbot);

            // Hide chatbot when clicking outside
            document.addEventListener('click', (e) => {
                const chatbotWrapper = document.getElementById('chatbotWrapper');
                if (!chatbotWrapper.contains(e.target) && !isMinimized) {
                    toggleChatbot();
                }
            });

            // Handle escape key
            document.addEventListener('keydown', (e) => {
                if (e.key === 'Escape' && !isMinimized) {
                    toggleChatbot();
                }
            });

            // Handle resize for mobile
            window.addEventListener('resize', () => {
                if (window.innerWidth <= 768) {
                    chatbotContainer.style.width = '100%';
                } else {
                    chatbotContainer.style.width = 'auto';
                }
            });

        } catch (error) {
            console.error('Failed to initialize chatbot:', error);
            // Tampilkan pesan error yang user-friendly
        }
    }

    // Panggil fungsi initializeChatbot
    initializeChatbot();
});