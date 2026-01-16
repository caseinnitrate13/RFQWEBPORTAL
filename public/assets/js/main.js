// Index Page
document.addEventListener("DOMContentLoaded", () => {
    const dragDropArea = document.getElementById("dragDropArea");
    const dragWrapper = document.getElementById("dragWrapper");
    const fileInput = document.getElementById("fileInput");
    const filePreview = document.getElementById("filePreview");
    const addFileBtn = document.getElementById("addFileBtn");

    const uploadAttachmentBtn = document.getElementById("uploadAttachmentBtn");
    const uploadAttachmentModalEl = document.getElementById("uploadAttachmentModal");
    const uploadAttachmentModal = new bootstrap.Modal(uploadAttachmentModalEl, {
        backdrop: true,
        keyboard: true
    });

    uploadAttachmentBtn.addEventListener("click", (e) => {
        e.preventDefault();
        uploadAttachmentModal.show();
        uploadAttachmentModalEl.style.zIndex = 1060;
        const backdrops = document.querySelectorAll('.modal-backdrop');
        if (backdrops.length) {
            backdrops[backdrops.length - 1].style.zIndex = 1055;
        }
    });

    uploadAttachmentModalEl.addEventListener('hidden.bs.modal', () => {
        const backdrops = document.querySelectorAll('.modal-backdrop');
        if (backdrops.length > 1) {
            backdrops[backdrops.length - 1].remove();
        }
    });

    let filesArray = [];
    let savedFilesArray = [];

    const formatAccept = {
        pdf: ".pdf",
        docx: ".docx",
        img: ".png,.jpg,.jpeg",
        xlsx: ".xls,.xlsx"
    };

    document.querySelectorAll(".fileTypeRadio").forEach(radio => {
        radio.addEventListener("change", () => {
            hideFileTypeError();
            const val = document.querySelector('input[name="fileType"]:checked').value;
            fileInput.setAttribute("accept", formatAccept[val]);
        });
    });

    function showFileTypeError() {
        const error = document.getElementById("fileTypeError");
        error.classList.remove("d-none");
        error.classList.add("d-block");
    }

    function hideFileTypeError() {
        const error = document.getElementById("fileTypeError");
        error.classList.add("d-none");
    }

    dragDropArea.addEventListener("click", () => {
        const selected = document.querySelector('input[name="fileType"]:checked');
        if (selected) {
            hideFileTypeError();
            fileInput.click();
        } else {
            showFileTypeError();
        }
    });

    addFileBtn.addEventListener("click", () => {
        const selected = document.querySelector('input[name="fileType"]:checked');
        if (selected) {
            hideFileTypeError();
            fileInput.click();
        } else {
            showFileTypeError();
        }
    });

    document.querySelectorAll('.fileTypeRadio').forEach(radio => {
        radio.addEventListener('change', hideFileTypeError);
    });

    function resetUpload(index) {
        filesArray.splice(index, 1);
        updatePreview();
    }

    function updatePreview() {
        filePreview.innerHTML = "";

        dragWrapper.classList.toggle("d-none", filesArray.length > 0);

        filesArray.forEach((file, index) => {
            const displayName = file.displayName || file.name;
            const ext = file.name.split('.').pop().toLowerCase();
            let previewHTML = "";

            if (['jpg', 'jpeg', 'png'].includes(ext)) {
                previewHTML = `<div class="preview-box"><img src="${URL.createObjectURL(file)}"></div>`;
            }
            else if (ext === 'pdf') {
                previewHTML = `<div class="preview-box"><iframe src="${URL.createObjectURL(file)}"></iframe></div>`;
            }
            else if (['xls', 'xlsx'].includes(ext)) {
                previewHTML = `<div class="preview-box"><i class="bi bi-file-earmark-excel text-success" style="font-size:48px;"></i></div>`;
            }
            else if (ext === 'docx') {
                previewHTML = `<div class="preview-box"><i class="bi bi-file-earmark-word text-primary" style="font-size:48px;"></i></div>`;
            }
            else {
                previewHTML = `<div class="preview-box"><i class="bi bi-file-earmark fs-1"></i></div>`;
            }

            const wrapper = document.createElement("div");
            wrapper.classList.add("file-preview-wrapper", "border", "rounded", "p-2", "mb-2");

            wrapper.innerHTML = `
                <button class="close-preview fs-4 btn btn-sm btn-outline-danger" title="Remove">&times;</button>
                ${previewHTML}
                <div class="file-name-container">
                    <small style="display:block; margin-bottom: 2px;">Filename:</small>
                    <span class="file-preview-name pointer" 
                        style="cursor:text; display:block;" 
                        contenteditable="true">${displayName}</span>
                </div>

            `;

            wrapper.querySelector(".file-preview-name").addEventListener("blur", (e) => {
                file.displayName = e.target.textContent.trim();
            });

            wrapper.querySelector(".file-preview-name").addEventListener("dblclick", (e) => {
                e.stopPropagation();
                window.open(URL.createObjectURL(file));
            });

            wrapper.querySelector(".close-preview").onclick = () => resetUpload(index);

            filePreview.appendChild(wrapper);
        });
    }

    function showFeedback(message) {
        const msgEl = document.getElementById("feedbackMessage");
        msgEl.textContent = message;
        const feedbackModalEl = document.getElementById("feedbackModal");
        const feedbackModal = new bootstrap.Modal(feedbackModalEl);
        feedbackModal.show();
        feedbackModalEl.style.zIndex = 1070;
        const backdrops = document.querySelectorAll('.modal-backdrop');
        if (backdrops.length) {
            backdrops[backdrops.length - 1].style.zIndex = 1065;
        }
        setTimeout(() => feedbackModal.hide(), 5000);
    }

    fileInput.addEventListener("change", () => {
        const selectedFormat = document.querySelector('input[name="fileType"]:checked').value;

        Array.from(fileInput.files).forEach(file => {
            const ext = file.name.split('.').pop().toLowerCase();
            const valid =
                (selectedFormat === "pdf" && ext === "pdf") ||
                (selectedFormat === "docx" && ext === "docx") ||
                (selectedFormat === "img" && ["png", "jpg", "jpeg"].includes(ext)) ||
                (selectedFormat === "xlsx" && ["xls", "xlsx"].includes(ext));

            if (valid) {
                filesArray.push(file);
            } else {
                showFeedback(`⚠️ File "${file.name}" is not allowed for the selected format.`);
            }
        });

        fileInput.value = "";
        updatePreview();
    });

    dragDropArea.addEventListener("dragover", (e) => {
        e.preventDefault();
        dragDropArea.classList.add("border-primary");
    });

    dragDropArea.addEventListener("dragleave", (e) => {
        e.preventDefault();
        dragDropArea.classList.remove("border-primary");
    });

    dragDropArea.addEventListener("drop", (e) => {
        e.preventDefault();
        dragDropArea.classList.remove("border-primary");

        const selected = document.querySelector('input[name="fileType"]:checked');

        if (!selected) {
            showFileTypeError();
            return;
        }
        hideFileTypeError();

        fileInput.files = e.dataTransfer.files;
        fileInput.dispatchEvent(new Event("change"));
    });

    document.getElementById("uploadAttachmentForm").addEventListener("submit", function (e) {
        e.preventDefault();
        savedFilesArray = structuredClone(filesArray);
        uploadAttachmentModal.hide();
        renderAttachmentPreviewOnRFQ();
    });

    function renderAttachmentPreviewOnRFQ() {
        const wrapper = document.getElementById("attachmentPreviewWrapper");
        wrapper.innerHTML = "";

        if (filesArray.length === 0) {
            wrapper.innerHTML = `
            <a id="uploadAttachmentBtn" class="btn btn-main btn-md w-100">
                <i class="bi bi-upload me-2"></i> Upload Attachment/s
            </a>
        `;
            rebindUploadButton();
            return;
        }

        let html = `
            <div id="savedAttachmentPreview" class="border rounded p-2 bg-light" style="cursor:pointer;">
                <strong>Uploaded Attachments:</strong>

                <div class="attachment-scroll mt-2">
                    <ul class="mb-0">
            `;

        savedFilesArray.forEach(f => {
            html += `<li>${f.displayName || f.name}</li>`;
        });

        html += `
                    </ul>
                </div>

                <small class="text-muted fst-italic">Click to edit / add more</small>
            </div>
        `;

        wrapper.innerHTML = html;

        document.getElementById("savedAttachmentPreview").addEventListener("click", () => {
            uploadAttachmentModalEl.addEventListener("show.bs.modal", restoreSavedFiles, { once: true });

            uploadAttachmentModal.show();
        });

        function restoreSavedFiles() {
            filesArray = structuredClone(savedFilesArray);
            updatePreview();
        }

    }

    function rebindUploadButton() {
        document.getElementById("uploadAttachmentBtn").addEventListener("click", (e) => {
            e.preventDefault();
            uploadAttachmentModal.show();
        });
    }
    rebindUploadButton();

    document.querySelectorAll("input, textarea, select").forEach(field => {
        field.addEventListener("input", () => {

            if (
                field.closest("#uploadAttachmentModal") ||
                field.closest("#loginForm")
            ) {
                return;
            }

            const wrapper = field.closest(".mb-3");
            const feedback = wrapper?.querySelector(".invalid-feedback");

            if (field.checkValidity()) {
                field.classList.remove("is-invalid");
                field.classList.add("is-valid");

                if (feedback) {
                    feedback.classList.add("d-none");
                    feedback.classList.remove("d-block");
                }
            } else {
                field.classList.remove("is-valid");
                field.classList.add("is-invalid");

                if (feedback) {
                    feedback.classList.remove("d-none");
                    feedback.classList.add("d-block");
                }
            }

        });
    });

    let scannedPages = [];
    let tempCapturedImage = null;

    let canvas, ctx, imgObj;
    let points = {};
    let activePoint = null;


    const scanDocumentModalEl = document.getElementById('scanDocumentModal');
    const scanDocumentModal = bootstrap.Modal.getOrCreateInstance(scanDocumentModalEl);

    document.getElementById('openScanModalBtn').addEventListener('click', (e) => {
        e.preventDefault();
        scanDocumentModal.show();
        scanDocumentModalEl.style.zIndex = 1060;
        const backdrops = document.querySelectorAll('.modal-backdrop');
        if (backdrops.length) {
            backdrops[backdrops.length - 1].style.zIndex = 1055;
        }
    });

    document.getElementById('scanBtn').addEventListener('click', function () {
        document.getElementById('scanFileInput').click();
    });

    document.getElementById('scanFileInput').addEventListener('change', function (e) {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = function (event) {
            tempCapturedImage = {
                file,
                src: event.target.result
            };

            openCropModal(event.target.result);

        };

        reader.readAsDataURL(file);
        e.target.value = '';
    });

    function openCropModal(imageSrc) {
        const modalEl = document.getElementById('cropScanModal');
        const modal = bootstrap.Modal.getOrCreateInstance(modalEl);

        modalEl.style.zIndex = 1070;
        modal.show();

        modalEl.addEventListener('shown.bs.modal', () => {
            canvas = document.getElementById('scanCanvas');
            ctx = canvas.getContext('2d');

            imgObj = new Image();
            imgObj.onload = () => {
                const body = modalEl.querySelector('.modal-body');
                const maxW = body.clientWidth;
                const maxH = window.innerHeight * 0.7;

                canvas.width = imgObj.naturalWidth;
                canvas.height = imgObj.naturalHeight;

                ctx.clearRect(0, 0, canvas.width, canvas.height);
                ctx.drawImage(imgObj, 0, 0);

                const displayScale = Math.min(maxW / canvas.width, maxH / canvas.height, 1);
                canvas.style.width = canvas.width * displayScale + 'px';
                canvas.style.height = canvas.height * displayScale + 'px';

                canvas._scaleX = canvas.width / canvas.getBoundingClientRect().width;
                canvas._scaleY = canvas.height / canvas.getBoundingClientRect().height;

                detectPaperEdges(imgObj);
            };

            imgObj.src = imageSrc;
        }, { once: true });
    }

    function detectPaperEdges(imgObj) {
        const DETECT_MAX_SIZE = 1000;
        const scale = Math.min(DETECT_MAX_SIZE / imgObj.width, DETECT_MAX_SIZE / imgObj.height, 1);

        const detectCanvas = document.createElement('canvas');
        detectCanvas.width = imgObj.width * scale;
        detectCanvas.height = imgObj.height * scale;
        const dctx = detectCanvas.getContext('2d');
        dctx.drawImage(imgObj, 0, 0, detectCanvas.width, detectCanvas.height);

        const { width, height } = detectCanvas;
        const imageData = dctx.getImageData(0, 0, width, height);
        const data = imageData.data;

        const gray = new Uint8ClampedArray(width * height);
        for (let i = 0; i < width * height; i++) {
            const r = data[i * 4];
            const g = data[i * 4 + 1];
            const b = data[i * 4 + 2];
            gray[i] = 0.299 * r + 0.587 * g + 0.114 * b;
        }

        const edges = new Uint8ClampedArray(width * height);
        const THRESHOLD = 30;
        for (let y = 1; y < height - 1; y++) {
            for (let x = 1; x < width - 1; x++) {
                const idx = x + y * width;
                const gx = gray[idx + 1] - gray[idx - 1];
                const gy = gray[idx + width] - gray[idx - width];
                edges[idx] = Math.hypot(gx, gy) > THRESHOLD ? 255 : 0;
            }
        }

        let edgePixels = [];
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                if (edges[x + y * width] === 255) {
                    edgePixels.push({ x, y });
                }
            }
        }

        let tl, tr, bl, br;
        if (edgePixels.length) {
            tl = edgePixels.reduce((a, p) => (p.x + p.y < a.x + a.y ? p : a), edgePixels[0]);
            tr = edgePixels.reduce((a, p) => (p.x - p.y > a.x - a.y ? p : a), edgePixels[0]);
            bl = edgePixels.reduce((a, p) => (p.x - p.y < a.x - a.y ? p : a), edgePixels[0]);
            br = edgePixels.reduce((a, p) => (p.x + p.y > a.x + a.y ? p : a), edgePixels[0]);
        } else {
            tl = { x: 30, y: 30 };
            tr = { x: width - 30, y: 30 };
            bl = { x: 30, y: height - 30 };
            br = { x: width - 30, y: height - 30 };
        }

        const invScale = 1 / scale;
        points = {
            tl: { x: tl.x * invScale, y: tl.y * invScale },
            tr: { x: tr.x * invScale, y: tr.y * invScale },
            br: { x: br.x * invScale, y: br.y * invScale },
            bl: { x: bl.x * invScale, y: bl.y * invScale }
        };

        redraw();
    }

    const cornerEls = {
        tl: document.querySelector('.corner.tl'),
        tr: document.querySelector('.corner.tr'),
        br: document.querySelector('.corner.br'),
        bl: document.querySelector('.corner.bl')
    };

    function positionCorners() {
        const rect = canvas.getBoundingClientRect();
        const scaleX = rect.width / canvas.width;
        const scaleY = rect.height / canvas.height;

        for (const k in cornerEls) {
            cornerEls[k].style.left = points[k].x * scaleX + 'px';
            cornerEls[k].style.top = points[k].y * scaleY + 'px';
        }
    }

    function startDrag(e, key) {
        e.preventDefault();
        activePoint = key;
    }

    Object.keys(cornerEls).forEach(k => {
        const el = cornerEls[k];
        el.addEventListener('mousedown', e => startDrag(e, k));
        el.addEventListener('touchstart', e => startDrag(e, k), { passive: false });
    });

    function movePoint(e) {
        if (!activePoint) return;
        e.preventDefault();

        const rect = canvas.getBoundingClientRect();
        const touch = e.touches ? e.touches[0] : e;

        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;

        points[activePoint].x = Math.max(
            0,
            Math.min(canvas.width, (touch.clientX - rect.left) * scaleX)
        );

        points[activePoint].y = Math.max(
            0,
            Math.min(canvas.height, (touch.clientY - rect.top) * scaleY)
        );

        redraw();
    }

    window.addEventListener('mousemove', movePoint);
    window.addEventListener('touchmove', movePoint, { passive: false });
    window.addEventListener('mouseup', () => activePoint = null);
    window.addEventListener('touchend', () => activePoint = null);

    function redraw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(imgObj, 0, 0, canvas.width, canvas.height);

        ctx.strokeStyle = '#2196F3';
        ctx.lineWidth = 10;
        ctx.beginPath();
        ctx.moveTo(points.tl.x, points.tl.y);
        ctx.lineTo(points.tr.x, points.tr.y);
        ctx.lineTo(points.br.x, points.br.y);
        ctx.lineTo(points.bl.x, points.bl.y);
        ctx.closePath();
        ctx.stroke();

        positionCorners();
    }

    const cropModal = document.getElementById('cropScanModal');
    cropModal.addEventListener('shown.bs.modal', () => {
        const applyBtn = document.getElementById('applyCropBtn');

        applyBtn.addEventListener(
            'click',
            (e) => {
                const btn = e.currentTarget;
                const spinner = btn.querySelector('.spinner-border');

                btn.disabled = true;
                spinner.classList.remove('d-none');

                setTimeout(() => {
                    applyCropHeavyWork(btn, spinner);
                });
            },
            { once: true }
        );
    });

    function applyCropHeavyWork(btn, spinner) {
        try {
            const src = [
                points.tl.x, points.tl.y,
                points.tr.x, points.tr.y,
                points.br.x, points.br.y,
                points.bl.x, points.bl.y
            ];

            const w = Math.max(
                Math.hypot(points.tr.x - points.tl.x, points.tr.y - points.tl.y),
                Math.hypot(points.br.x - points.bl.x, points.br.y - points.bl.y)
            );

            const h = Math.max(
                Math.hypot(points.bl.x - points.tl.x, points.bl.y - points.tl.y),
                Math.hypot(points.br.x - points.tr.x, points.br.y - points.tr.y)
            );

            const dst = [0, 0, w, 0, w, h, 0, h];
            const inv = new PerspT(dst, src);

            const out = document.createElement('canvas');
            out.width = Math.round(w);
            out.height = Math.round(h);

            const octx = out.getContext('2d');
            const srcData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const outData = octx.createImageData(out.width, out.height);

            for (let y = 0; y < out.height; y++) {
                for (let x = 0; x < out.width; x++) {
                    const p = inv.transform(x, y);
                    const sx = Math.round(p[0]);
                    const sy = Math.round(p[1]);

                    if (sx >= 0 && sx < canvas.width && sy >= 0 && sy < canvas.height) {
                        const si = (sx + sy * canvas.width) * 4;
                        const di = (x + y * out.width) * 4;

                        let gray =
                            0.299 * srcData.data[si] +
                            0.587 * srcData.data[si + 1] +
                            0.114 * srcData.data[si + 2];

                        gray = ((gray - 128) * 1.2 + 128);
                        gray = Math.max(0, Math.min(255, gray));
                        if (gray > 150) gray = 255;

                        outData.data.set([gray, gray, gray, 255], di);
                    }
                }
            }

            octx.putImageData(outData, 0, 0);

            scannedPages.push({
                file: tempCapturedImage.file,
                src: out.toDataURL('image/jpeg', 0.95)
            });

            bootstrap.Modal.getInstance(
                document.getElementById('cropScanModal')
            ).hide();

            scanDocumentModal.show();
            updateScanPreview();

        } finally {
            spinner.classList.add('d-none');
            btn.disabled = false;
        }
    }

    function updateScanPreview() {
        const preview = document.getElementById('scanFilePreview');
        preview.innerHTML = "";

        if (scannedPages.length === 0) {
            preview.innerHTML = `
            <div class="border border-secondary rounded p-5 text-center" style="background-color:#f8f9fa;">
                <p class="mb-1 fst-italic text-muted">The scanned images will be shown here</p>
            </div>
        `;
            return;
        }

        scannedPages.forEach((page, index) => {
            const pageNumber = String(index + 1).padStart(2, "0");
            const displayName = page.displayName || page.file?.name || `Page ${pageNumber}`;

            const wrapper = document.createElement("div");
            wrapper.className = "scan-file-preview-wrapper mb-3";

            wrapper.innerHTML = `
            <!-- Header row -->
           <div class="scan-header mb-1">
                <div class="scan-page-label">Page ${pageNumber}</div>
                <button class="scan-remove-btn fs-4 btn btn-sm btn-outline-danger" title="Remove">
                    &times;
                </button>
            </div>

            <!-- Filename -->
            <small class="text-muted d-block mb-0">Filename:</small>
            <span class="file-preview-name1 d-block mb-1" contenteditable="true" style="cursor:text;">
                ${displayName}
            </span>

            <!-- Image -->
            <div class="scan-preview-img">
                <img src="${page.src}" alt="Page ${pageNumber}">
            </div>
        `;

            const fileNameEl = wrapper.querySelector(".file-preview-name1");
            fileNameEl.addEventListener("blur", (e) => {
                page.displayName = e.target.textContent.trim();
            });

            fileNameEl.addEventListener("dblclick", () => {
                window.open(page.src);
            });

            wrapper.querySelector(".scan-remove-btn").addEventListener("click", () => {
                scannedPages.splice(index, 1);
                updateScanPreview();
            });

            preview.appendChild(wrapper);
        });
    }

    let savedScannedPages = [];

    document.getElementById("scanDocumentForm").addEventListener("submit", function (e) {
        e.preventDefault();

        savedScannedPages = structuredClone(scannedPages);
        scanDocumentModal.hide();

        renderScanPreviewOnRFQ();
    });

    function renderScanPreviewOnRFQ() {
        const wrapper = document.getElementById("scanRFQPreviewWrapper");

        if (savedScannedPages.length === 0) {
            wrapper.innerHTML = `
            <a id="openScanModalBtn" class="btn btn-main btn-md w-100">
                <i class="bi bi-camera me-2"></i> Scan Document
            </a>
        `;
            rebindScanButton();
            return;
        }

        wrapper.innerHTML = `
        <div id="savedScanPreview" class="border rounded p-2 bg-light" style="cursor:pointer;">
            <strong>Scanned Document:</strong>

            <!-- Scrollable container -->
            <div class="attachment-scroll mt-2">
                <ul class="mb-0">
                    ${savedScannedPages.map(p =>
            `<li>${p.displayName || p.file?.name || "Scanned_Document"}</li>`
        ).join("")
            }
                </ul>
            </div>

            <small class="text-muted fst-italic">
                Click to edit / add more
            </small>
        </div>
    `;

        document.getElementById("savedScanPreview").addEventListener("click", () => {
            scanDocumentModalEl.addEventListener(
                "show.bs.modal",
                restoreScannedPages,
                { once: true }
            );
            scanDocumentModal.show();
        });

        function restoreScannedPages() {
            scannedPages = structuredClone(savedScannedPages);
            updateScanPreview();
        }
    }

    function rebindScanButton() {
        document.getElementById("openScanModalBtn").addEventListener("click", (e) => {
            e.preventDefault();
            scanDocumentModal.show();
        });
    }

    rebindScanButton();

    document.querySelectorAll('[data-bs-target="#rfqStatusModal"]').forEach(button => {
        button.addEventListener('click', async (e) => {
            const form = e.target.closest('.modal-content').querySelector('form');
            if (!form.checkValidity()) {
                form.classList.add('was-validated');
                return;
            }

            const formData = new FormData(form);

            if (savedFilesArray.length > 0) {
                savedFilesArray.forEach(file => {
                    formData.append(
                        'rfq_attachments',
                        file,
                        file.displayName || file.name
                    );
                });
            }

            if (typeof scannedPages !== 'undefined' && scannedPages.length > 0) {
                scannedPages.forEach((page, index) => {
                    formData.append('rfq_attachments', dataURLtoBlob(page.src), `attachment_${index + 1}.jpg`);
                });
            }

            try {
                const res = await fetch('/submit-rfq', {
                    method: 'POST',
                    body: formData
                });

                const data = await res.json();
                if (!data.success) {
                    alert(data.message);
                    console.log(data.message);
                } else {
                    form.reset();
                    form.classList.remove('was-validated');

                    const uploadForm = document.getElementById("uploadAttachmentForm");
                    if (uploadForm) uploadForm.reset();

                    savedFilesArray = [];
                    filesArray = [];
                    if (typeof scannedPages !== 'undefined') scannedPages = [];

                    const attachmentWrapper = document.getElementById("attachmentPreviewWrapper");
                    if (attachmentWrapper) {
                        attachmentWrapper.innerHTML = `
                        <label class="form-label">Please upload your attachment/s here:</label>
                        <a id="uploadAttachmentBtn" class="btn btn-main btn-md w-100">
                            <i class="bi bi-upload me-2"></i> Upload Attachment/s
                        </a>
                    `;
                        rebindUploadButton();
                    }

                    // Reset scan preview
                    const scanWrapper = document.getElementById("scanRFQPreviewWrapper");
                    if (scanWrapper) {
                        scanWrapper.innerHTML = `
                        <label class="form-label">Please scan your document/s here:</label>
                        <a id="openScanModalBtn" class="btn btn-main btn-md w-100">
                            <i class="bi bi-camera me-2"></i> Scan Document
                        </a>
                    `;
                        rebindScanButton();
                    }

                    // Close the RFQ modal
                    e.target.closest('.modal').querySelector('.btn-close').click();
                }
            } catch (err) {
                console.error(err);
                alert('An error occurred while submitting the request.');
            }
        });
    });

    function dataURLtoBlob(dataURL) {
        const arr = dataURL.split(',');
        const mime = arr[0].match(/:(.*?);/)[1];
        const bstr = atob(arr[1]);
        let n = bstr.length;
        const u8arr = new Uint8Array(n);
        while (n--) u8arr[n] = bstr.charCodeAt(n);
        return new Blob([u8arr], { type: mime });
    }
    
    document.getElementById('rfqStatusOkBtn')?.addEventListener('click', () => {
        location.reload();
    });

    


});

document.addEventListener("DOMContentLoaded", () => {
    const toggleBtn = document.getElementById("sidebarToggle");
    const sidebar = document.getElementById("sidebar");
    const mainContent = document.getElementById("main-content");

    toggleBtn.addEventListener("click", () => {
        if (window.innerWidth > 1200) {
            sidebar.classList.toggle("collapsed");
            toggleBtn.classList.toggle("active");
        } else {
            sidebar.classList.toggle("active");
        }
    });

    document.addEventListener("click", (e) => {
        if (window.innerWidth <= 992 && sidebar.classList.contains("active")) {
            if (!sidebar.contains(e.target) && e.target !== toggleBtn) {
                sidebar.classList.remove("active");
            }
        }
    });

    window.addEventListener("resize", () => {
        if (window.innerWidth > 992) {
            sidebar.classList.remove("active");
        } else {
            sidebar.classList.remove("collapsed");
        }
    });

    const backtotop = document.querySelector('.back-to-top');
    if (backtotop) {
        const toggleBacktotop = () => {
            backtotop.classList.toggle('active', window.scrollY > 100);
        };
        window.addEventListener('scroll', toggleBacktotop);
        window.addEventListener('load', toggleBacktotop);

        backtotop.addEventListener('click', (e) => {
            e.preventDefault();
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    function loadPage(moduleName) {
        fetch(moduleName)
            .then(res => res.text())
            .then(html => {
                mainContent.innerHTML = html;

                document.querySelectorAll(".load-page").forEach(l => l.classList.remove("active"));
                const activeLink = document.querySelector(`.load-page[href="${moduleName}"]`);
                if (activeLink) activeLink.classList.add("active");

                if (moduleName.includes("submitted-rfq")) initSubmittedRfqPage();
                if (moduleName.includes("responded-request")) initRespondedRfqPage();
                if (moduleName.includes("requestsforquotation")) initSupplierRfqPage();
                if (moduleName.includes("quotations")) initQuotationsPage();
                if (moduleName.includes("canvasserdetails")) initCanvassersPage();

                initUploadModalsInPage();
                initScanModalsInPage();
            })
            .catch(() => {
                mainContent.innerHTML = "<h5 class='text-danger'>Page not found</h5>";
            });
    }

    document.querySelectorAll(".load-page").forEach(link => {
        link.addEventListener("click", (e) => {
            e.preventDefault();
            const moduleName = link.getAttribute("href");

            if (moduleName === 'index.html' || moduleName === 'login.html') {
                window.location.href = '/' + moduleName.replace('.html', '');
                return;
            }

            history.pushState({ module: moduleName }, "", "/" + moduleName.replace(".html", ""));
            loadPage(moduleName);
        });
    });

    document.addEventListener("click", (e) => {
        const btn = e.target.closest("a, button");
        if (!btn) return;

        e.preventDefault();

        const action = btn.dataset.action;

        switch (action) {
            case "view-attachment":
            case "view-quotation":
            case "view-po":
                handleViewAttachment(btn);
                break;

            case "quotation-revision":
            case "quotation-decline":
            case "quotation-approve":
                openQuotationActionModal(action, btn);
                break;

            case "upload-po":
            case "upload-quotation":
            case "upload-rfq":
            case "scan-docu":
                openModal(btn);
                break;

            case "save":
                handleSave(btn);
                break;

            case "delete":
                handleDelete(btn);
                break;
        }
    });

    document.querySelectorAll('.parent-link').forEach(parent => {
        parent.addEventListener('click', (e) => {
            if (!e.target.classList.contains('toggle-chevron')) {
                e.preventDefault();
                loadPage('home.html');
                history.pushState({ module: 'home.html' }, "", '/home');
            }
        });
    });

    function initialLoad() {
        let path = window.location.pathname.slice(1);

        if (!path || path === "template") {
            path = "home.html";
            history.replaceState({ module: path }, "", "/");
        } else {
            path = path + ".html";
        }

        loadPage(path);
    }

    initialLoad();

    window.addEventListener("popstate", (event) => {
        if (event.state && event.state.module) {
            loadPage(event.state.module);
        } else {
            initialLoad();
        }
    });
});

function initTable(config) {
    const table = document.getElementById(config.tableId);
    if (!table) return;

    const tbody = table.querySelector("tbody");
    const entriesSelect = document.getElementById(config.entriesSelectId);
    const prevBtn = document.getElementById(config.prevBtnId);
    const nextBtn = document.getElementById(config.nextBtnId);
    const paginationNumbers = document.getElementById(config.paginationNumbersId);

    let currentPage = 1;
    let rowsPerPage = parseInt(entriesSelect.value);
    let sortColumnIndex = null;
    let sortAscending = true;

    let activeStatusFilter = null;

    const header = table.querySelectorAll("th");
    const statusColumnIndex = [...header].findIndex(th => {
        const text = th.innerText.trim().toLowerCase();
        return text === "status" || text === "quotation status";
    });

    function getRows() {
        let rows = Array.from(tbody.querySelectorAll("tr"));

        if (activeStatusFilter && statusColumnIndex !== -1) {
            rows = rows.filter(row => {
                const cell = row.children[statusColumnIndex];
                return cell && cell.innerText.trim() === activeStatusFilter;
            });
        }

        return rows;
    }

    function render() {
        let rows = getRows();
        if (sortColumnIndex !== null) {
            rows.sort((a, b) => {
                let A = a.children[sortColumnIndex].innerText.trim();
                let B = b.children[sortColumnIndex].innerText.trim();

                const type = table.querySelectorAll("th")[sortColumnIndex].dataset.type || "text";

                if (type === "date") {
                    return sortAscending
                        ? new Date(A) - new Date(B)
                        : new Date(B) - new Date(A);
                }

                if (!isNaN(A) && !isNaN(B)) {
                    return sortAscending ? A - B : B - A;
                }

                return sortAscending ? A.localeCompare(B) : B.localeCompare(A);
            });
        }

        const totalPages = Math.ceil(rows.length / rowsPerPage) || 1;

        Array.from(tbody.querySelectorAll("tr")).forEach(row => {
            row.style.display = "none";
        });

        rows.forEach((row, i) => {
            if (
                i >= (currentPage - 1) * rowsPerPage &&
                i < currentPage * rowsPerPage
            ) {
                row.style.display = "table-row";
            }
        });


        prevBtn.disabled = currentPage === 1;
        nextBtn.disabled = currentPage === totalPages;

        paginationNumbers.innerHTML = "";
        for (let i = 1; i <= totalPages; i++) {
            const btn = document.createElement("button");
            btn.className = `btn btn-sm ${i === currentPage ? "btn-primary" : "btn-outline-secondary"}`;
            btn.textContent = i;
            btn.onclick = () => {
                currentPage = i;
                render();
            };
            paginationNumbers.appendChild(btn);
        }
    }

    entriesSelect.onchange = () => {
        rowsPerPage = parseInt(entriesSelect.value);
        currentPage = 1;
        render();
    };

    prevBtn.onclick = () => {
        if (currentPage > 1) {
            currentPage--;
            render();
        }
    };

    nextBtn.onclick = () => {
        const totalPages = Math.ceil(getRows().length / rowsPerPage);
        if (currentPage < totalPages) {
            currentPage++;
            render();
        }
    };

    const headers = table.querySelectorAll("th");
    headers.forEach((header, index) => {
        header.style.cursor = "pointer";
        header.addEventListener("click", () => {
            if (sortColumnIndex === index) {
                sortAscending = !sortAscending;
            } else {
                sortColumnIndex = index;
                sortAscending = true;
            }
            headers.forEach(h => h.classList.remove("asc", "desc"));
            header.classList.add(sortAscending ? "asc" : "desc");
            render();
        });
    });

    render();

    document.querySelectorAll(".status-btn").forEach(btn => {
        btn.addEventListener("click", (e) => {
            const rect = btn.getBoundingClientRect();
            const clickX = e.clientX - rect.left;
            if (btn.classList.contains("active") && clickX > rect.width - 28) {
                activeStatusFilter = null;
                document.querySelectorAll(".status-btn").forEach(b => b.classList.remove("active"));
            } else {
                const status = btn.dataset.status;
                if (activeStatusFilter === status) {
                    activeStatusFilter = null;
                    document.querySelectorAll(".status-btn").forEach(b => b.classList.remove("active"));
                } else {
                    activeStatusFilter = status;
                    document.querySelectorAll(".status-btn").forEach(b => b.classList.remove("active"));
                    btn.classList.add("active");
                }
            }
            currentPage = 1;
            render();
        });
    });
}

function initSubmittedRfqPage() {
    initTable({
        tableId: "submittedRfqTable",
        entriesSelectId: "entriesSelect",
        prevBtnId: "prevBtn",
        nextBtnId: "nextBtn",
        paginationNumbersId: "paginationNumbers"
    });
}

function initRespondedRfqPage() {
    initTable({
        tableId: "respondedRfqTable",
        entriesSelectId: "entriesSelect",
        prevBtnId: "prevBtn",
        nextBtnId: "nextBtn",
        paginationNumbersId: "paginationNumbers"
    });
}

function initSupplierRfqPage() {
    initTable({
        tableId: "supplierRfqTable",
        entriesSelectId: "entriesSelect",
        prevBtnId: "prevBtn",
        nextBtnId: "nextBtn",
        paginationNumbersId: "paginationNumbers"
    });
}

function initQuotationsPage() {
    initTable({
        tableId: "quotationsTable",
        entriesSelectId: "entriesSelect",
        prevBtnId: "prevBtn",
        nextBtnId: "nextBtn",
        paginationNumbersId: "paginationNumbers"
    });
}

function initCanvassersPage() {
    initTable({
        tableId: "canvassersTable",
        entriesSelectId: "entriesSelect",
        prevBtnId: "prevBtn",
        nextBtnId: "nextBtn",
        paginationNumbersId: "paginationNumbers"
    });
}

function handleViewAttachment(btn) {
    const files = JSON.parse(btn.dataset.files || "[]");
    const modalId = btn.dataset.modal || "seeAttachmentModal";

    showAttachmentPreviewFromUrls(files, modalId);

    const modalEl = document.getElementById(modalId);
    if (!modalEl) return console.error("Modal not found:", modalId);

    const modal = bootstrap.Modal.getOrCreateInstance(modalEl);
    modal.show();
}

let currentQuotationAction = null;
function openQuotationActionModal(action, sourceBtn) {
    currentQuotationAction = action;

    const quotationModalEl = document.getElementById("seeQuotationModal");
    const quotationModal = bootstrap.Modal.getOrCreateInstance(quotationModalEl);
    quotationModal.hide();

    const modalEl = document.getElementById("quotationActionModal");
    const titleEl = modalEl.querySelector("#quotationActionTitle");
    const msgEl = modalEl.querySelector("#quotationActionMessage");
    const remarksEl = modalEl.querySelector("#quotationActionRemarks");
    const confirmBtn = modalEl.querySelector("#confirmQuotationActionBtn");

    remarksEl.value = "";

    if (action === "quotation-revision") {
        titleEl.textContent = "Request Revision";
        msgEl.textContent = "Would you like to request a revision for this quotation?";
        confirmBtn.className = "btn btn-forrevision";
    }

    if (action === "quotation-decline") {
        titleEl.textContent = "Decline Quotation";
        msgEl.textContent = "Are you sure you want to decline this quotation?";
        confirmBtn.className = "btn btn-declined";
    }

    if (action === "quotation-approve") {
        titleEl.textContent = "Approve Quotation";
        msgEl.textContent = "Do you want to approve this quotation?";
        confirmBtn.className = "btn btn-approved";
    }

    bootstrap.Modal.getOrCreateInstance(modalEl).show();
}

function openModal(btn) {
    const modalId = btn.dataset.modal;

    const modalEl = document.getElementById(modalId);
    if (!modalEl) return console.error("Modal not found");

    const form = modalEl.querySelector("form");
    if (form) form.reset();

    bootstrap.Modal.getOrCreateInstance(modalEl).show();
}

function initUploadModalsInPage() {
    document
        .querySelectorAll("#uploadPOModal, #uploadQuotationModal, #uploadRFQModal")
        .forEach(modal => initUploadModal(modal));
}

function initScanModalsInPage() {
    document
        .querySelectorAll("#scanDocumentModal")
        .forEach(modal => initScanModal(modal));
}

function initUploadModal(modalEl) {
    if (!modalEl || modalEl.dataset.initialized) return;
    modalEl.dataset.initialized = "true";

    const dragDropArea = modalEl.querySelector("#dragDropArea");
    const dragWrapper = modalEl.querySelector("#dragWrapper");
    const fileInput = modalEl.querySelector("#fileInput");
    const filePreview = modalEl.querySelector("#filePreview");
    const addFileBtn = modalEl.querySelector("#addFileBtn");
    const fileTypeError = modalEl.querySelector("#fileTypeError");

    let filesArray = [];
    let savedFilesArray = [];

    const formatAccept = {
        pdf: ".pdf",
        docx: ".docx",
        img: ".png,.jpg,.jpeg",
        xlsx: ".xls,.xlsx"
    };

    function showFileTypeError() {
        if (!fileTypeError) return;
        fileTypeError.classList.remove("d-none");
        fileTypeError.classList.add("d-block");
    }

    function hideFileTypeError() {
        if (!fileTypeError) return;
        fileTypeError.classList.add("d-none");
        fileTypeError.classList.remove("d-block");
    }

    function requireFileTypeOrError() {
        const selected = modalEl.querySelector('input[name="fileType"]:checked');
        if (!selected) {
            showFileTypeError();
            return false;
        }
        hideFileTypeError();
        return true;
    }

    modalEl.querySelectorAll(".fileTypeRadio").forEach(radio => {
        radio.addEventListener("change", () => {
            hideFileTypeError();
            const val = modalEl.querySelector('input[name="fileType"]:checked')?.value;
            if (val) fileInput.accept = formatAccept[val];
        });
    });

    function updatePreview() {
        filePreview.innerHTML = "";
        dragWrapper.classList.toggle("d-none", filesArray.length > 0);

        filesArray.forEach((file, index) => {
            const displayName = file.displayName || file.name;
            const ext = file.name.split('.').pop().toLowerCase();
            let previewHTML = "";

            if (['jpg', 'jpeg', 'png'].includes(ext)) {
                previewHTML = `<div class="preview-box"><img src="${URL.createObjectURL(file)}"></div>`;
            } else if (ext === 'pdf') {
                previewHTML = `<div class="preview-box"><iframe src="${URL.createObjectURL(file)}"></iframe></div>`;
            } else if (['xls', 'xlsx'].includes(ext)) {
                previewHTML = `<div class="preview-box"><i class="bi bi-file-earmark-excel text-success fs-1"></i></div>`;
            } else if (ext === 'docx') {
                previewHTML = `<div class="preview-box"><i class="bi bi-file-earmark-word text-primary fs-1"></i></div>`;
            } else {
                previewHTML = `<div class="preview-box"><i class="bi bi-file-earmark fs-1"></i></div>`;
            }

            const wrapper = document.createElement("div");
            wrapper.className = "file-preview-wrapper border rounded p-2 mb-2";
            wrapper.innerHTML = `
                <button class="close-preview btn btn-sm btn-outline-danger fs-4">&times;</button>
                ${previewHTML}
                <div class="file-name-container">
                    <small>Filename:</small>
                    <span class="file-preview-name d-block" contenteditable="true">${displayName}</span>
                </div>
            `;

            wrapper.querySelector(".file-preview-name").addEventListener("blur", e => {
                file.displayName = e.target.textContent.trim();
            });

            wrapper.querySelector(".file-preview-name").addEventListener("dblclick", e => {
                e.stopPropagation();
                window.open(URL.createObjectURL(file));
            });

            wrapper.querySelector(".close-preview").onclick = () => {
                filesArray.splice(index, 1);
                updatePreview();
            };

            filePreview.appendChild(wrapper);
        });
    }

    fileInput.addEventListener("change", () => {
        if (!requireFileTypeOrError()) {
            fileInput.value = "";
            return;
        }

        const selectedFormat = modalEl.querySelector('input[name="fileType"]:checked').value;

        Array.from(fileInput.files).forEach(file => {
            const ext = file.name.split('.').pop().toLowerCase();
            const valid =
                (selectedFormat === "pdf" && ext === "pdf") ||
                (selectedFormat === "docx" && ext === "docx") ||
                (selectedFormat === "img" && ["png", "jpg", "jpeg"].includes(ext)) ||
                (selectedFormat === "xlsx" && ["xls", "xlsx"].includes(ext));

            if (valid) {
                filesArray.push(file);
            } else {
                showFeedback(`⚠️ File "${file.name}" is not allowed for the selected format.`);
            }
        });

        fileInput.value = "";
        updatePreview();
    });

    dragDropArea.addEventListener("dragover", e => {
        e.preventDefault();
        dragDropArea.classList.add("border-primary");
    });

    dragDropArea.addEventListener("dragleave", () => {
        dragDropArea.classList.remove("border-primary");
    });

    dragDropArea.addEventListener("drop", e => {
        e.preventDefault();
        dragDropArea.classList.remove("border-primary");

        if (!requireFileTypeOrError()) return;

        fileInput.files = e.dataTransfer.files;
        fileInput.dispatchEvent(new Event("change"));
    });

    dragDropArea.addEventListener("click", () => {
        if (!requireFileTypeOrError()) return;
        fileInput.click();
    });

    addFileBtn.addEventListener("click", () => {
        if (!requireFileTypeOrError()) return;
        fileInput.click();
    });

    modalEl.querySelector("form").addEventListener("submit", e => {
        e.preventDefault();
        savedFilesArray = structuredClone(filesArray);
        bootstrap.Modal.getInstance(modalEl).hide();
    });

    modalEl.addEventListener("show.bs.modal", () => {
        filesArray = structuredClone(savedFilesArray);
        updatePreview();
        hideFileTypeError();
    });
}

function initScanModal(modalEl) {
    if (!modalEl || modalEl.dataset.initialized) return;
    modalEl.dataset.initialized = "true";

    let scannedPages = [];
    let tempCapturedImage = null;

    let canvas, ctx, imgObj;
    let points = {};
    let activePoint = null;

    const scanDocumentModal = bootstrap.Modal.getOrCreateInstance(modalEl);
    const cropModalEl = document.getElementById('cropScanModal');
    const cropModal = bootstrap.Modal.getOrCreateInstance(cropModalEl);

    document.addEventListener('click', (e) => {
        if (e.target.id !== 'openScanModalBtn') return;

        e.preventDefault();
        scanDocumentModal.show();

        modalEl.style.zIndex = 1060;
        const backdrops = document.querySelectorAll('.modal-backdrop');
        if (backdrops.length) {
            backdrops[backdrops.length - 1].style.zIndex = 1055;
        }
    });

    modalEl.querySelector('#scanBtn').addEventListener('click', () => {
        modalEl.querySelector('#scanFileInput').click();
    });

    modalEl.querySelector('#scanFileInput').addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (ev) => {
            tempCapturedImage = { file, src: ev.target.result };
            scanDocumentModal.hide();
            openCropModal(ev.target.result);
        };

        reader.readAsDataURL(file);
        e.target.value = '';
    });

    function openCropModal(imageSrc) {
        cropModalEl.style.zIndex = 1070;
        cropModal.show();

        cropModalEl.addEventListener('shown.bs.modal', () => {
            canvas = document.getElementById('scanCanvas');
            ctx = canvas.getContext('2d');

            imgObj = new Image();
            imgObj.onload = () => {
                const body = cropModalEl.querySelector('.modal-body');
                const maxW = body.clientWidth;
                const maxH = window.innerHeight * 0.7;

                canvas.width = imgObj.naturalWidth;
                canvas.height = imgObj.naturalHeight;

                ctx.drawImage(imgObj, 0, 0);

                const displayScale = Math.min(maxW / canvas.width, maxH / canvas.height, 1);
                canvas.style.width = canvas.width * displayScale + 'px';
                canvas.style.height = canvas.height * displayScale + 'px';

                canvas._scaleX = canvas.width / canvas.getBoundingClientRect().width;
                canvas._scaleY = canvas.height / canvas.getBoundingClientRect().height;

                detectPaperEdges(imgObj);
            };

            imgObj.src = imageSrc;
        }, { once: true });
    }

    function detectPaperEdges(imgObj) {
        const MAX = 1000;
        const scale = Math.min(MAX / imgObj.width, MAX / imgObj.height, 1);

        const dc = document.createElement('canvas');
        dc.width = imgObj.width * scale;
        dc.height = imgObj.height * scale;
        const dctx = dc.getContext('2d');
        dctx.drawImage(imgObj, 0, 0, dc.width, dc.height);

        const { width, height } = dc;
        const data = dctx.getImageData(0, 0, width, height).data;

        const gray = new Uint8ClampedArray(width * height);
        for (let i = 0; i < gray.length; i++) {
            gray[i] = 0.299 * data[i * 4] + 0.587 * data[i * 4 + 1] + 0.114 * data[i * 4 + 2];
        }

        const edges = [];
        for (let y = 1; y < height - 1; y++) {
            for (let x = 1; x < width - 1; x++) {
                const i = x + y * width;
                const gx = gray[i + 1] - gray[i - 1];
                const gy = gray[i + width] - gray[i - width];
                if (Math.hypot(gx, gy) > 30) edges.push({ x, y });
            }
        }

        let tl, tr, bl, br;
        if (edges.length) {
            tl = edges.reduce((a, p) => p.x + p.y < a.x + a.y ? p : a);
            tr = edges.reduce((a, p) => p.x - p.y > a.x - a.y ? p : a);
            bl = edges.reduce((a, p) => p.x - p.y < a.x - a.y ? p : a);
            br = edges.reduce((a, p) => p.x + p.y > a.x + a.y ? p : a);
        } else {
            tl = { x: 30, y: 30 };
            tr = { x: width - 30, y: 30 };
            bl = { x: 30, y: height - 30 };
            br = { x: width - 30, y: height - 30 };
        }

        const inv = 1 / scale;
        points = {
            tl: { x: tl.x * inv, y: tl.y * inv },
            tr: { x: tr.x * inv, y: tr.y * inv },
            br: { x: br.x * inv, y: br.y * inv },
            bl: { x: bl.x * inv, y: bl.y * inv }
        };

        redraw();
    }

    const cornerEls = {
        tl: document.querySelector('.corner.tl'),
        tr: document.querySelector('.corner.tr'),
        br: document.querySelector('.corner.br'),
        bl: document.querySelector('.corner.bl')
    };

    function positionCorners() {
        const rect = canvas.getBoundingClientRect();
        const scaleX = rect.width / canvas.width;
        const scaleY = rect.height / canvas.height;

        for (const k in cornerEls) {
            cornerEls[k].style.left = points[k].x * scaleX + 'px';
            cornerEls[k].style.top = points[k].y * scaleY + 'px';
        }
    }

    function startDrag(e, key) {
        e.preventDefault();
        activePoint = key;
    }

    Object.keys(cornerEls).forEach(k => {
        const el = cornerEls[k];
        el.addEventListener('mousedown', e => startDrag(e, k));
        el.addEventListener('touchstart', e => startDrag(e, k), { passive: false });
    });

    function movePoint(e) {
        if (!activePoint) return;
        e.preventDefault();

        const rect = canvas.getBoundingClientRect();
        const touch = e.touches ? e.touches[0] : e;

        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;

        points[activePoint].x = Math.max(
            0,
            Math.min(canvas.width, (touch.clientX - rect.left) * scaleX)
        );

        points[activePoint].y = Math.max(
            0,
            Math.min(canvas.height, (touch.clientY - rect.top) * scaleY)
        );

        redraw();
    }

    window.addEventListener('mousemove', movePoint);
    window.addEventListener('touchmove', movePoint, { passive: false });
    window.addEventListener('mouseup', () => activePoint = null);
    window.addEventListener('touchend', () => activePoint = null);

    function redraw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(imgObj, 0, 0, canvas.width, canvas.height);

        ctx.strokeStyle = '#2196F3';
        ctx.lineWidth = 10;
        ctx.beginPath();
        ctx.moveTo(points.tl.x, points.tl.y);
        ctx.lineTo(points.tr.x, points.tr.y);
        ctx.lineTo(points.br.x, points.br.y);
        ctx.lineTo(points.bl.x, points.bl.y);
        ctx.closePath();
        ctx.stroke();

        positionCorners();
    }

    cropModalEl.addEventListener('shown.bs.modal', () => {
        const btn = document.getElementById('applyCropBtn');
        if (!btn) return;

        btn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();

            const spinner = btn.querySelector('.spinner-border');

            btn.disabled = true;
            spinner.classList.remove('d-none');

            setTimeout(() => {
                applyCropHeavyWork(btn, spinner);
            });

        }, { once: true });
    });


    function applyCropHeavyWork(btn, spinner) {
        try {
            const src = [
                points.tl.x, points.tl.y,
                points.tr.x, points.tr.y,
                points.br.x, points.br.y,
                points.bl.x, points.bl.y
            ];

            const w = Math.max(
                Math.hypot(points.tr.x - points.tl.x, points.tr.y - points.tl.y),
                Math.hypot(points.br.x - points.bl.x, points.br.y - points.bl.y)
            );

            const h = Math.max(
                Math.hypot(points.bl.x - points.tl.x, points.bl.y - points.tl.y),
                Math.hypot(points.br.x - points.tr.x, points.br.y - points.tr.y)
            );

            const dst = [0, 0, w, 0, w, h, 0, h];
            const inv = new PerspT(dst, src);

            const out = document.createElement('canvas');
            out.width = Math.round(w);
            out.height = Math.round(h);

            const octx = out.getContext('2d');
            const srcData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const outData = octx.createImageData(out.width, out.height);

            for (let y = 0; y < out.height; y++) {
                for (let x = 0; x < out.width; x++) {
                    const p = inv.transform(x, y);
                    const sx = Math.round(p[0]);
                    const sy = Math.round(p[1]);

                    if (sx >= 0 && sx < canvas.width && sy >= 0 && sy < canvas.height) {
                        const si = (sx + sy * canvas.width) * 4;
                        const di = (x + y * out.width) * 4;

                        let gray =
                            0.299 * srcData.data[si] +
                            0.587 * srcData.data[si + 1] +
                            0.114 * srcData.data[si + 2];

                        gray = ((gray - 128) * 1.2 + 128);
                        gray = Math.max(0, Math.min(255, gray));
                        if (gray > 150) gray = 255;

                        outData.data.set([gray, gray, gray, 255], di);
                    }
                }
            }

            octx.putImageData(outData, 0, 0);

            scannedPages.push({
                file: tempCapturedImage.file,
                src: out.toDataURL('image/jpeg', 0.95)
            });

            bootstrap.Modal.getInstance(
                document.getElementById('cropScanModal')
            ).hide();

            scanDocumentModal.show();
            updateScanPreview();

        } finally {
            spinner.classList.add('d-none');
            btn.disabled = false;
        }
    }

    function updateScanPreview() {
        const preview = document.getElementById('scanFilePreview');
        preview.innerHTML = "";

        if (scannedPages.length === 0) {
            preview.innerHTML = `
            <div class="border border-secondary rounded p-5 text-center" style="background-color:#f8f9fa;">
                <p class="mb-1 fst-italic text-muted">The scanned images will be shown here</p>
            </div>
        `;
            return;
        }

        scannedPages.forEach((page, index) => {
            const pageNumber = String(index + 1).padStart(2, "0");
            const displayName = page.displayName || page.file?.name || `Page ${pageNumber}`;

            const wrapper = document.createElement("div");
            wrapper.className = "scan-file-preview-wrapper mb-3";

            wrapper.innerHTML = `
            <!-- Header row -->
           <div class="scan-header mb-1">
                <div class="scan-page-label">Page ${pageNumber}</div>
                <button class="scan-remove-btn fs-4 btn btn-sm btn-outline-danger" title="Remove">
                    &times;
                </button>
            </div>

            <!-- Filename -->
            <small class="text-muted d-block mb-0">Filename:</small>
            <span class="file-preview-name1 d-block mb-1" contenteditable="true" style="cursor:text;">
                ${displayName}
            </span>

            <!-- Image -->
            <div class="scan-preview-img">
                <img src="${page.src}" alt="Page ${pageNumber}">
            </div>
        `;

            const fileNameEl = wrapper.querySelector(".file-preview-name1");
            fileNameEl.addEventListener("blur", (e) => {
                page.displayName = e.target.textContent.trim();
            });

            fileNameEl.addEventListener("dblclick", () => {
                window.open(page.src);
            });

            wrapper.querySelector(".scan-remove-btn").addEventListener("click", () => {
                scannedPages.splice(index, 1);
                updateScanPreview();
            });

            preview.appendChild(wrapper);
        });
    }
}


function showAttachmentPreviewFromUrls(files, modalId) {
    const filePreview = document.querySelector(`#${modalId} .seefilePreview`);
    filePreview.innerHTML = "";

    if (!files || files.length === 0) {
        filePreview.innerHTML = `<p class="text-muted">No attachments found.</p>`;
        return;
    }

    files.forEach(file => {
        const displayName = file.displayName || file.name;
        const ext = file.name.split(".").pop().toLowerCase();
        let previewHTML = "";

        if (['jpg', 'jpeg', 'png'].includes(ext)) {
            previewHTML = `
                <div class="preview-box">
                    <img src="${file.url}">
                </div>`;
        } else if (ext === "pdf") {
            previewHTML = `
                <div class="preview-box">
                    <iframe src="${file.url}"></iframe>
                </div>`;
        } else if (['xls', 'xlsx'].includes(ext)) {
            previewHTML = `
                <div class="preview-box">
                    <i class="bi bi-file-earmark-excel text-success" style="font-size:48px;"></i>
                </div>`;
        } else if (ext === "docx") {
            previewHTML = `
                <div class="preview-box">
                    <i class="bi bi-file-earmark-word text-primary" style="font-size:48px;"></i>
                </div>`;
        } else {
            previewHTML = `
                <div class="preview-box">
                    <i class="bi bi-file-earmark fs-1"></i>
                </div>`;
        }

        const wrapper = document.createElement("div");
        wrapper.classList.add(
            "file-preview-wrapper",
            "border",
            "rounded",
            "p-2",
            "mb-2"
        );

        wrapper.innerHTML = `
            ${previewHTML}
            <div class="file-name-container">
                <small style="display:block; margin-bottom: 2px;">Filename:</small>
                <span class="file-preview-name"
                      style="cursor:pointer; display:block;">
                    ${displayName}
                </span>
            </div>
        `;

        wrapper.addEventListener("dblclick", () => {
            window.open(file.url, "_blank");
        });

        wrapper.querySelector(".file-preview-name")
            .addEventListener("click", () => {
                window.open(file.url, "_blank");
            });

        filePreview.appendChild(wrapper);
    });
}

function showFeedback(message) {
    const msgEl = document.getElementById("feedbackMessage");
    msgEl.textContent = message;
    const feedbackModalEl = document.getElementById("feedbackModal");
    const feedbackModal = new bootstrap.Modal(feedbackModalEl);
    feedbackModal.show();
    feedbackModalEl.style.zIndex = 1070;
    const backdrops = document.querySelectorAll('.modal-backdrop');
    if (backdrops.length) {
        backdrops[backdrops.length - 1].style.zIndex = 1065;
    }
    setTimeout(() => feedbackModal.hide(), 5000);
}
