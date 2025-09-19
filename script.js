document.addEventListener('DOMContentLoaded', function() {
    // Elementos de la interfaz
    const patronInput = document.getElementById('patron');
    const textoInput = document.getElementById('texto');
    const btnProbar = document.getElementById('btnProbar');
    const btnLimpiar = document.getElementById('btnLimpiar');
    const resultadoDiv = document.getElementById('resultado');
    const globalCheckbox = document.getElementById('global');
    const ignoreCaseCheckbox = document.getElementById('ignoreCase');
    const multilineCheckbox = document.getElementById('multiline');
    const botonesEjemplo = document.querySelectorAll('.btn-ejemplo');
    
    // Patrones corregidos para que funcionen correctamente
    const patronesCorregidos = {
        email: '[a-zA-Z0-9_]+([.][a-zA-Z0-9_]+)*@[a-zA-Z0-9_]+([.][a-zA-Z0-9_]+)*[.][a-zA-Z]{2,5}',
        telefono: '\\(\\d{2}\\)\\d{4}-\\d{4}|\\(\\d{2}\\)\\d{2}\\s\\d{2}\\s\\d{2}\\s\\d{2}|\\(\\d{3}\\)\\d{3}[\\*\\.\\-]\\d{3}',
        url: 'https?:\\/\\/[^\\s/$.?#].[^\\s]*'
    };
    
    // Cargar ejemplos al hacer clic
    botonesEjemplo.forEach(boton => {
        boton.addEventListener('click', function() {
            const tipo = this.getAttribute('data-tipo');
            const ejemplo = this.getAttribute('data-ejemplo');
            
            // Usar el patrón corregido según el tipo
            patronInput.value = patronesCorregidos[tipo];
            textoInput.value = ejemplo;
            
            // Probar automáticamente
            setTimeout(probarRegex, 100);
        });
    });
    
    // Probar regex al hacer clic
    btnProbar.addEventListener('click', probarRegex);
    
    // También probar al presionar Enter en el patrón
    patronInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') probarRegex();
    });
    
    // Limpiar campos
    btnLimpiar.addEventListener('click', function() {
        patronInput.value = '';
        textoInput.value = '';
        globalCheckbox.checked = false;
        ignoreCaseCheckbox.checked = false;
        multilineCheckbox.checked = false;
        resultadoDiv.innerHTML = '<div class="inicio">Los resultados se mostrarán aquí. Las coincidencias se resaltarán en verde.</div>';
    });
    
    // Función principal para probar regex
    function probarRegex() {
        const patron = patronInput.value.trim();
        const texto = textoInput.value;
        
        // Validar que hay patrón
        if (!patron) {
            resultadoDiv.innerHTML = '<div class="sin-coincidencia">Por favor, ingresa un patrón de expresión regular</div>';
            return;
        }
        
        // Validar que hay texto
        if (!texto) {
            resultadoDiv.innerHTML = '<div class="sin-coincidencia">Por favor, ingresa texto para validar</div>';
            return;
        }
        
        // Construir banderas
        let banderas = '';
        if (globalCheckbox.checked) banderas += 'g';
        if (ignoreCaseCheckbox.checked) banderas += 'i';
        if (multilineCheckbox.checked) banderas += 'm';
        
        try {
            // Crear expresión regular
            const regex = new RegExp(patron, banderas);
            
            // Probar coincidencias
            const esValido = regex.test(texto);
            let coincidencias = [];
            let match;
            
            // Reiniciar regex para buscar todas las coincidencias
            const regexGlobal = new RegExp(patron, banderas + 'g');
            while ((match = regexGlobal.exec(texto)) !== null) {
                coincidencias.push({
                    texto: match[0],
                    indice: match.index,
                    longitud: match[0].length
                });
            }
            
            // Mostrar resultados
            mostrarResultados(esValido, coincidencias, texto, regex, patron);
        } catch (error) {
            resultadoDiv.innerHTML = `
                <div class="sin-coincidencia">Error en el patrón de expresión regular:</div>
                <div style="margin-top: 1rem; color: var(--color-error); font-family: monospace;">${error.message}</div>
                <div class="info-adicional">
                    <h4>Sugerencias para resolver el error:</h4>
                    <ul>
                        <li>Revisa que tu patrón tenga una sintaxis válida</li>
                        <li>Los caracteres especiales como <code>.</code>, <code>+</code>, <code>*</code>, <code>?</code> deben escaparse con \\ si se usan literalmente</li>
                        <li>Los grupos <code>[ ]</code>, <code>( )</code>, <code>{ }</code> deben estar balanceados</li>
                        <li>Verifica que las secuencias de escape como <code>\\d</code>, <code>\\w</code>, <code>\\s</code> estén correctamente escritas</li>
                    </ul>
                </div>
            `;
        }
    }
    
    // Mostrar resultados en la interfaz
    function mostrarResultados(esValido, coincidencias, texto, regex, patron) {
        if (esValido && coincidencias.length > 0) {
            // Resaltar coincidencias en el texto
            let textoResaltado = texto;
            if (regex.global) {
                textoResaltado = texto.replace(regex, match => 
                    `<span class="coincidencia">${match}</span>`
                );
            } else {
                textoResaltado = texto.replace(regex, `<span class="coincidencia">$&</span>`);
            }
            
            // Formatear información de coincidencias
            const infoCoincidencias = coincidencias.map((coincidencia, index) => `
                <div class="coincidencia-item">
                    <strong>Coincidencia ${index + 1}:</strong> "${coincidencia.texto}"<br>
                    <strong>Posición:</strong> carácter ${coincidencia.indice} a ${coincidencia.indice + coincidencia.longitud - 1}<br>
                    <strong>Longitud:</strong> ${coincidencia.longitud} caracteres
                </div>
            `).join('');
            
            resultadoDiv.innerHTML = `
                <div style="color: var(--color-exito); font-weight: 600; margin-bottom: 1.2rem; font-size: 1.3rem;">
                    ✓ Se encontraron ${coincidencias.length} coincidencia(s)
                </div>
                
                <div style="margin-bottom: 1.8rem; line-height: 1.8; padding: 1.5rem; background: white; border-radius: var(--radio-borde); border: 1px solid var(--color-borde);">
                    ${textoResaltado}
                </div>
                
                <div class="detalles">
                    <h3>Detalles de las coincidencias</h3>
                    <div class="detalles-coincidencias">
                        ${infoCoincidencias}
                    </div>
                    
                    <div style="margin: 1.5rem 0;">
                        <strong>Patrón usado:</strong> 
                        <code style="background: #f0f0f0; padding: 0.4rem 0.8rem; border-radius: 6px; margin-left: 0.5rem; font-size: 1.1rem;">/${patron}/${regex.flags}</code>
                    </div>
                    
                    <div style="margin-bottom: 1.5rem;">
                        <strong>Banderas activas:</strong> 
                        <span style="background: #e3f2fd; padding: 0.5rem 1rem; border-radius: 6px; margin-left: 0.5rem; font-weight: 500;">${regex.flags || 'ninguna'}</span>
                    </div>
                    
                    <div class="info-adicional">
                        <h4>Información adicional</h4>
                        <ul>
                            <li>El patrón ${regex.global ? 'busca' : 'buscaría'} todas las coincidencias en el texto</li>
                            <li>La búsqueda ${regex.ignoreCase ? 'no distingue' : 'distingue'} entre mayúsculas y minúsculas</li>
                            <li>El modo ${regex.multiline ? 'activa' : 'no activa'} el tratamiento de múltiples líneas</li>
                        </ul>
                    </div>
                </div>
            `;
        } else {
            resultadoDiv.innerHTML = `
                <div class="sin-coincidencia" style="margin-bottom: 1.2rem; font-size: 1.3rem;">
                    ✗ No se encontraron coincidencias
                </div>
                
                <div style="margin-bottom: 1.8rem; line-height: 1.8; padding: 1.5rem; background: white; border-radius: var(--radio-borde); border: 1px solid var(--color-borde);">
                    ${texto}
                </div>
                
                <div class="detalles">
                    <div style="margin-bottom: 1.2rem;">
                        <strong>Patrón usado:</strong> 
                        <code style="background: #f0f0f0; padding: 0.4rem 0.8rem; border-radius: 6px; margin-left: 0.5rem; font-size: 1.1rem;">/${patron}/${regex.flags}</code>
                    </div>
                    
                    <div style="margin-bottom: 1.2rem;">
                        <strong>Banderas activas:</strong> 
                        <span style="background: #e3f2fd; padding: 0.5rem 1rem; border-radius: 6px; margin-left: 0.5rem; font-weight: 500;">${regex.flags || 'ninguna'}</span>
                    </div>
                    
                    <div class="info-adicional">
                        <h4>Posibles razones por las que no hay coincidencias</h4>
                        <ul>
                            <li>El patrón no coincide con el texto proporcionado</li>
                            <li>Las banderas seleccionadas no son apropiadas para este patrón</li>
                            <li>El texto no contiene el formato esperado por el patrón</li>
                            <li>Faltan caracteres de escape en caracteres especiales</li>
                            <li>El patrón podría ser demasiado específico o restrictivo</li>
                        </ul>
                    </div>
                </div>
            `;
        }
    }
    
    // Inicializar con un ejemplo
    patronInput.value = patronesCorregidos.email;
    textoInput.value = 'usuario@example.com, contacto@empresa.org, invalido.com';
    
    // Probar automáticamente al cargar
    setTimeout(probarRegex, 500);
});