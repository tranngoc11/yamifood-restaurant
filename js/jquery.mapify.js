(function($) {
    'use strict';

    // Resize timer
    let resizeDone = false;

    // Has the map zoom been set?
    // Resize Done trigger
    $(window).on('resize', function() {
        clearTimeout(resizeDone);
        resizeDone = setTimeout(function() {
            $(window).trigger('resizeDone');
        }, 100);
    });

    // Generate static map URL from OpenStreetMap
    const generateStaticMapURL = function(settings) {
        const center = `${settings.center.lat},${settings.center.lng}`;
        const zoom = settings.zoom || 13;
        const size = settings.size || '600x400';
        let markers = '';

        // Add markers
        $.each(settings.points, function(i, point) {
            if (point.lat && point.lng) {
                markers += `${point.lat},${point.lng}|`;
            }
        });

        // Remove the trailing '|' from markers
        markers = markers.slice(0, -1);

        // Construct the full URL
        return `https://staticmap.openstreetmap.de/staticmap.php?center=${center}&zoom=${zoom}&size=${size}&markers=${markers}&maptype=mapnik`;
    };

    // Add static map to element
    const mapifyElement = function(element, settings) {
        const mapURL = generateStaticMapURL(settings);

        // Kiểm tra nếu mapURL hợp lệ
        if (!mapURL) {
            console.error('Invalid map URL:', mapURL);
            return;
        }

        // Ensure the URL is not empty before creating the <img> element
        const img = $('<img alt="" src="">', {
            src: mapURL,  // Gán URL bản đồ vào thuộc tính src
            alt: 'Map',   // Mô tả cho ảnh
            class: 'static-map' // Lớp CSS cho ảnh
        });

        // Kiểm tra lại thuộc tính src
        if (!img.attr('src')) {
            console.error('Image source (src) is missing');
        }

        // Append the map to the element
        $(element).html(img);
    };

    // Add static map when called
    $.fn.mapify = function(options) {
        const collection = this;
        const settings = $.extend({
            points: [
                { lat: 21.2813, lng: 106.2020 }  // Marker tại Bắc Giang
            ],
            center: { lat: 21.2813, lng: 106.2020 }, // Trung tâm là Bắc Giang
            zoom: 12,  // Mức phóng to hợp lý cho thành phố
            size: '800x600' // Kích thước bản đồ
        }, options);

        // Generate and display the static map
        collection.each(function(i, element) {
            mapifyElement(element, settings);
        });
    };

})(jQuery);
