//RESALTADO DE LA PÁGINA ACTUAL EN EL MENU
$(document).ready(function() {
    // Obtener la URL actual
    var currentUrl = window.location.pathname;

    // Recorrer todos los enlaces del menú
    $('.navbar-nav .nav-link').each(function() {
        var href = $(this).attr('href');

        // Si la URL del enlace coincide con la URL actual
        if (currentUrl === href) {
            // Añadir la clase 'active' al elemento <li> que contiene el enlace
            $(this).parent().addClass('active');
        }
    });
});


//CHECKBOX DE SUCURSALES AL MOMENTO DE REGISTRO DE USUARIOS
$(document).ready(function() {
    $('#user-register').on('submit', function(e) {
        var isChecked = false;
        
        // Verificar si al menos una casilla de verificación está seleccionada
        $('input[name="sucursales"]').each(function() {
            if ($(this).prop('checked')) {
                isChecked = true;
            }
        });

        // Si no se selecciona ninguna, mostrar la alerta y evitar que se envíe el formulario
        if (!isChecked) {
            e.preventDefault();
            $('#sucursal-alert').show();
        } else {
            $('#sucursal-alert').hide();
        }
    });
});


//ANIMACIÓN PARA TABLAS
$(document).ready(function() {
    $('table').each(function() {
        $(this).find('tr').each(function(index) {
            var delay = index * 200; // 300ms de retraso por cada fila
            $(this).css('animation-delay', delay + 'ms').addClass('slide-in-row');
        });
    });
});

//ANIMACIÓN DE LOADER ENTRE PÁGINAS
// Mostrar el loader cuando se detecta que se va a cargar una nueva página
window.addEventListener('beforeunload', function() {
    $('#page-transition-overlay').addClass('active');
});

// Ocultar el loader cuando la nueva página se ha cargado completamente
$(window).on('load', function() {
    $('#page-transition-overlay').removeClass('active');
});

// Manejar los clics en los enlaces
$(document).ready(function() {
    // Mostrar el loader cuando se detecta que se va a cargar una nueva página
    window.addEventListener('beforeunload', function() {
        $('#page-transition-overlay').addClass('active');
    });

    // Ocultar el loader cuando la nueva página se ha cargado completamente
    $(window).on('load', function() {
        $('#page-transition-overlay').removeClass('active');
    });

    // Manejar los clics en los enlaces
    $('a').on('click', function(event) {
        var href = $(this).attr('href');
    
        // Si el enlace tiene la clase 'needs-confirmation', no hagas nada aquí
        if ($(this).hasClass('needs-confirmation')) {
            return;
        }
    
        // Verificar si el enlace lleva a otra página
        if (href && !href.startsWith('#') && !href.startsWith('javascript:')) {
            event.preventDefault();
    
            // Mostrar el loader durante 1 segundo antes de cambiar de página
            $('#page-transition-overlay').addClass('active');
            setTimeout(function() {
                window.location.href = href;
            }, 500); // Espera 1 segundo antes de cambiar de página
        }
    });
    
});



//ANIMACIONES GENERALES
    AOS.init({
        duration: 1000, // Duración de la animación en milisegundos
        easing: 'ease-in-out', // Tipo de transición
        once: true, // Si deseas que la animación se ejecute solo una vez
    });










