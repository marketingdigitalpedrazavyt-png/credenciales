const fotoContainer = document.getElementById('foto-container');
const nombreDiv     = document.getElementById('nombre');
const dniDiv        = document.getElementById('dni');
const rolDiv        = document.getElementById('rol');

const inputNombre = document.getElementById('inputNombre');
const inputDni    = document.getElementById('inputDni');
const radioC      = document.getElementById('coordinador');
const radioCa     = document.getElementById('coordinadora');

let cropper;

// 1) Nombre en tiempo real (template literal)
inputNombre.addEventListener('input', () => {
  nombreDiv.textContent = `${inputNombre.value || 'Nombre Apellido'}`;
});

// 2) Formateo de DNI a 8 dígitos con puntos (2-3-3)
inputDni.addEventListener('input', () => {
  const raw = inputDni.value.replace(/\D/g, '').slice(0, 8);
  const fmt = raw.length === 8
    ? raw.replace(/(\d{2})(\d{3})(\d{3})/, '$1.$2.$3')
    : raw;
  dniDiv.textContent = `DNI: ${raw ? fmt : '00.000.000'}`;
});

// 3) Actualiza el rol seleccionado (for…of)
for (const radio of [radioC, radioCa]) {
  radio.addEventListener('change', () => {
    rolDiv.textContent = `${radio.value}`;
  });
}

// 4) Al subir foto, abrimos modal con Cropper.js
document.getElementById('subirFoto').addEventListener('change', e => {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = evt => {
    const img = document.getElementById('crop-image');
    img.src = evt.target.result;
    document.getElementById('modal-crop').style.display = 'flex';
    if (cropper) cropper.destroy();
    setTimeout(() => {
      cropper = new Cropper(img, {
        aspectRatio: 1,
        viewMode: 2,
        autoCropArea: 1
      });
    }, 100);
  };
  reader.readAsDataURL(file);
});

// 5) Guardar recorte: insertamos el <canvas> recortado directo en el DOM
function guardarRecorte() {
  if (!cropper) return;
  const T = 462;
  const croppedCanvas = cropper.getCroppedCanvas({ width: T, height: T });

  fotoContainer.innerHTML = '';
  croppedCanvas.style.cssText =
    'width:100%;height:100%;border-radius:50%;display:block;';
  fotoContainer.appendChild(croppedCanvas);

  cerrarModal();
}

// 6) Cerrar modal y destruir Cropper
function cerrarModal() {
  document.getElementById('modal-crop').style.display = 'none';
  if (cropper) { cropper.destroy(); cropper = null; }
}

// 7) Descargar credencial sin oscurecer ni recortar la foto
function descargarCredencial() {
  cerrarModal();

  const cred     = document.getElementById('credencial');
  const foto     = fotoContainer;
  const origLeft = foto.style.left;
  const origTf   = foto.style.transform;

  // calculamos la left real (incluye translateX) con template literal
  const fotoRect = foto.getBoundingClientRect();
  const credRect = cred.getBoundingClientRect();
  const pxLeft   = `${fotoRect.left - credRect.left}px`;

  // quitamos transform y fijamos left
  foto.style.transform = '';
  foto.style.left      = pxLeft;

  html2canvas(cred, {
    scale: 1,
    useCORS: true,
    allowTaint: true,
    backgroundColor: null
  })
  .then(canvas => {
    const link = document.createElement('a');
    link.download = 'credencial.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
  })
  .catch(err => console.error('Error al descargar:', err))
  .finally(() => {
    // restauramos estilos
    foto.style.left      = origLeft;
    foto.style.transform = origTf;
  });
}
