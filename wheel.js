
const poolList = document.getElementById('poolList');
const wheelList = document.getElementById('wheelList');
let selectedItems = [];
let lastClickedIndex = null;


// Initial pool items
['Artus', 'Jozsef', 'Julian', 'Kerstin', 'Korbinian', 'Poorti', 'Robert', 'Souzana']
        .forEach(text => {
        const li = createListItem(text);
        poolList.appendChild(li);
    });

// Initial wheel items
['Adrian', 'Alexander', 'Bárbara', 'Caroline', 'David', 'Eleni', 'Ethem', 'Felix', 'Frank', 'Lorenz', 'Mariana', 'Markus', 'Maryam', 
 'Massi', 'Michael', 'Nicholas', 'Noemi', 'Rosalind', 'Ryan', 'Sascha', 'Sebastian', 'Sonika', 'Talisson']
        .forEach(text => {
        const li = createListItem(text);
        wheelList.appendChild(li);
    });



function createListItem(text, listType = 'pool') {
    const li = document.createElement('li');
    li.draggable = true;

    const span = document.createElement('span');
    span.textContent = text;
    span.style.flex = '1';

    li.appendChild(span);
    li.style.display = 'flex';
    li.style.alignItems = 'center';

    //   if (listType === 'pool') {
    const deleteBtn = document.createElement('button');
    deleteBtn.textContent = '🗑️';
    deleteBtn.style.marginLeft = '10px';
    deleteBtn.style.cursor = 'pointer';
    deleteBtn.onclick = () => li.remove();
    li.appendChild(deleteBtn);
    //   }

    li.addEventListener('click', (e) => {
        if (e.target.tagName === 'BUTTON') return;

        const list = li.parentElement;
        const items = Array.from(list.children);
        const clickedIndex = items.indexOf(li);

        if (e.shiftKey && lastClickedIndex !== null) {
            const [start, end] = [lastClickedIndex, clickedIndex].sort((a, b) => a - b);
            items.forEach((item, index) => {
                if (index >= start && index <= end) {
                    item.classList.add('selected');
                }
            });
        } else if (e.ctrlKey || e.metaKey) {
            li.classList.toggle('selected');
            lastClickedIndex = clickedIndex;
        } else {
            items.forEach(item => item.classList.remove('selected'));
            li.classList.add('selected');
            lastClickedIndex = clickedIndex;
        }
    });

    li.addEventListener('dragstart', (e) => {
        selectedItems = Array.from(li.parentElement.querySelectorAll('.selected'));
        if (!li.classList.contains('selected')) {
            selectedItems = [li];
            li.classList.add('selected');
        }
        e.dataTransfer.setData('text/plain', 'dragging');
    });

    return li;
}

function allowDrop(e) {
    e.preventDefault();
}

function handleDrop(e, targetId) {
    e.preventDefault();
    const targetList = document.getElementById(targetId);
    const sourceList = targetList === poolList ? wheelList : poolList;

    selectedItems.forEach(item => {
        const text = item.querySelector('span')?.textContent || item.textContent;
        const newItem = createListItem(text, targetId === 'poolList' ? 'pool' : 'wheel');
        targetList.appendChild(newItem);
        item.remove();
    });

    selectedItems = [];
}

function moveSelected(fromId, toId) {
    const fromList = document.getElementById(fromId);
    const toList = document.getElementById(toId);
    const selected = Array.from(fromList.querySelectorAll('.selected'));

    selected.forEach(item => {
        const text = item.querySelector('span')?.textContent || item.textContent;
        const newItem = createListItem(text, toId === 'poolList' ? 'pool' : 'wheel');
        toList.appendChild(newItem);
        item.remove();
    });
}

function addBulkItems() {
    const input = document.getElementById('bulkItemInput');
    const targetId = document.getElementById('targetListSelect').value;
    const targetList = document.getElementById(targetId);
    const targetListPool = document.getElementById('poolList');
    const targetListWheel = document.getElementById('wheelList');
    const lines = input.value.split('\n').map(line => line.trim()).filter(line => line.length > 0);

    const existingItemsPool = Array.from(targetListPool.children).map(li =>
        li.querySelector('span')?.textContent.trim().toLowerCase()
    );
    const existingItemsWheel = Array.from(targetListWheel.children).map(li =>
        li.querySelector('span')?.textContent.trim().toLowerCase()
    );

    lines.forEach(text => {
        if (!existingItemsPool.includes(text.toLowerCase()) && !existingItemsWheel.includes(text.toLowerCase())) {
            const newItem = createListItem(text, targetId === 'poolList' ? 'pool' : 'wheel');
            targetList.appendChild(newItem);
        }
        else {
            updateNotification('Item/s already exist/s in the lists');
        }
    });

    input.value = '';
}

// Wheel logic
const canvas = document.getElementById('wheel');
const ctx = canvas.getContext('2d');
const radius = canvas.width / 2;
let segments = [];
let colors = [];
let angle = 0;
let spinning = false;
let spinVelocity = 0;

function generateColors(n) {
    const colors = [];
    for (let i = 0; i < n; i++) {
        const hue = Math.floor((360 / n) * i);
        colors.push(`hsl(${hue}, 80%, 60%)`);
    }
    return colors;
}

function drawWheel() {
    const segmentAngle = (2 * Math.PI) / segments.length;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.save();
    ctx.translate(radius, radius);
    ctx.rotate(angle);

    for (let i = 0; i < segments.length; i++) {
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.fillStyle = colors[i];
        ctx.arc(0, 0, radius, i * segmentAngle, (i + 1) * segmentAngle);
        ctx.lineTo(0, 0);
        ctx.fill();

        ctx.save();
        ctx.rotate((i + 0.5) * segmentAngle);
        ctx.translate(radius * 0.85, 0);
        ctx.rotate(Math.PI);
        ctx.fillStyle = '#000';
        ctx.font = '14px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(segments[i], 0, 0);
        ctx.restore();
    }

    ctx.restore();

    // Draw pointer on the left
    ctx.beginPath();
    ctx.moveTo(10, radius - 10);
    ctx.lineTo(10, radius + 10);
    ctx.lineTo(40, radius);
    ctx.fillStyle = '#000';
    ctx.fill();
}

function spin() {
    if (spinning || segments.length === 0) return;
    spinning = true;
    spinVelocity = Math.random() * 0.3 + 0.3;
    animateSpin();
}

function animateSpin() {
    if (spinVelocity > 0.002) {
        angle += spinVelocity;
        spinVelocity *= 0.98;
        drawWheel();
        requestAnimationFrame(animateSpin);
    } else {
        spinning = false;
        drawWheel();

        const segmentAngle = (2 * Math.PI) / segments.length;
        const normalizedAngle = angle % (2 * Math.PI);
        const leftAngle = (Math.PI - normalizedAngle + 2 * Math.PI) % (2 * Math.PI);
        const winningIndex = Math.floor(leftAngle / segmentAngle);

        updateNotification(`Next presenter: ${segments[winningIndex]}!`);
    }
}

function initializeWheel() {
    segments = Array.from(wheelList.children).map(li =>
        li.querySelector('span')?.textContent.trim()
    );
    const count = segments.length
    colors = generateColors(count);
    angle = 0;
    drawWheel();
    document.getElementById("wheelCountLabel").textContent = `Wheel Segments: ${count} item${count !== 1 ? 's' : ''}`;
}

function resetNotification() {
    notificationElement = document.getElementById("notification");
    notificationElement.classList.toggle('greenBox');
    notificationElement.textContent = "Notifications: -";
}

function updateNotification(msg) {
    notificationElement = document.getElementById("notification");
    notificationElement.classList.add('greenBox');
    notificationElement.textContent = `${msg} `;
    okElement = document.createElement('button');
    okElement.textContent = "OK";
    okElement.setAttribute('onclick', "resetNotification()");
    notificationElement.appendChild(okElement);
}





