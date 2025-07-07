const fileInput = document.getElementById('fileInput');
const fileList = document.getElementById('fileList');
const dropZone = document.getElementById('dropZone');
const combineBtn = document.querySelector('.combine');
let files = [];

fileInput.addEventListener('change', () => {
    for (let file of fileInput.files) {
        files.push(file);
    }
    updateFileList();
});

dropZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropZone.style.borderColor = '#1976d2';
});

dropZone.addEventListener('dragleave', () => {
    dropZone.style.borderColor = '#bbb';
});

dropZone.addEventListener('drop', (e) => {
    e.preventDefault();
    dropZone.style.borderColor = '#bbb';
    for (let file of e.dataTransfer.files) {
        files.push(file);
    }
    updateFileList();
});

function updateFileList() {
    fileList.innerHTML = '';
    files.forEach((file, i) => {
        const li = document.createElement('li');
        li.textContent = file.name;
        li.setAttribute('draggable', true);
        li.dataset.index = i;
        fileList.appendChild(li);
    });
    combineBtn.textContent = `GABUNGKAN (${files.length})`;
}

fileList.addEventListener('dragstart', (e) => {
    e.dataTransfer.setData('text/plain', e.target.dataset.index);
});

fileList.addEventListener('drop', (e) => {
    e.preventDefault();
    const fromIndex = e.dataTransfer.getData('text');
    const toIndex = e.target.dataset.index;
    if (fromIndex !== undefined && toIndex !== undefined) {
        const item = files.splice(fromIndex, 1)[0];
        files.splice(toIndex, 0, item);
        updateFileList();
    }
});

fileList.addEventListener('dragover', (e) => e.preventDefault());

function clearFiles() {
    files = [];
    updateFileList();
}

async function combineFiles() {
    const fileInput = document.getElementById('fileInput');
    const files = fileInput.files;

    if (!files.length) {
        alert('Silakan unggah minimal satu file PDF.');
        return;
    }

    document.getElementById('progressContainer').style.display = 'block';
    updateProgress(0);

    const { PDFDocument } = PDFLib;
    const mergedPdf = await PDFDocument.create();

    for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await PDFDocument.load(arrayBuffer);
        const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());

        copiedPages.forEach((page) => mergedPdf.addPage(page));

        // Update progress
        const percent = Math.round(((i + 1) / files.length) * 100);
        updateProgress(percent);
    }

    const mergedPdfBytes = await mergedPdf.save();
    const blob = new Blob([mergedPdfBytes], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = 'gabungan.pdf';
    a.click();

    URL.revokeObjectURL(url);
    updateProgress(100);
    setTimeout(() => {
        document.getElementById('progressContainer').style.display = 'none';
        updateProgress(0);
    }, 2000);
}

function updateProgress(percent) {
    const progressBar = document.getElementById('progressBar');
    const progressText = document.getElementById('progressText');
    progressBar.style.width = percent + '%';
    progressText.textContent = 'Menggabungkan: ' + percent + '%';
}
