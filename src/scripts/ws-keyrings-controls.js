document.addEventListener('DOMContentLoaded', () => {
    const imageContainers = document.querySelectorAll('.card-image-container');

    imageContainers.forEach(container => {
        const rawAttr = container.getAttribute('data-images') || '[]';
        
        // Decode HTML entities (e.g. &quot; -> ") before parsing JSON
        const decodedAttr = rawAttr.replace(/&quot;/g, '"').replace(/&apos;/g, "'");
        
        let imagesData = [];
        try {
            imagesData = JSON.parse(decodedAttr);
        } catch (err) {
            console.error('Failed to parse images JSON:', err);
            return;
        }

        // Hide slider controls if there's only 1 image or fewer
        if (imagesData.length <= 1) {
            container.setAttribute('data-single', 'true');
            return;
        }

        const imgEl = container.querySelector('.keyring-thumb');
        const prevBtn = container.querySelector('.prev-btn');
        const nextBtn = container.querySelector('.next-btn');
        const counterEl = container.querySelector('.image-counter');

        let currentIndex = 0;

        const updateImage = (index) => {
            currentIndex = index;
            const imageName = imagesData[currentIndex];
            imgEl.src = `/webp-images/workshop/keyrings/${imageName}`;
            counterEl.textContent = `${currentIndex + 1}/${imagesData.length}`;
            container.setAttribute('data-current-index', currentIndex);
        };

        // Initialize counter display
        counterEl.textContent = `1/${imagesData.length}`;

        prevBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            const newIndex = (currentIndex - 1 + imagesData.length) % imagesData.length;
            updateImage(newIndex);
        });

        nextBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            const newIndex = (currentIndex + 1) % imagesData.length;
            updateImage(newIndex);
        });
    });
});