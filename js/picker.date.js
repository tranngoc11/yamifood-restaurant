(function (factory) {
    // Browser globals.
    if (typeof Picker === 'undefined' || typeof $ === 'undefined') {
        console.error("Picker or jQuery is not loaded correctly");
        return;
    }

    factory(Picker, $);
}(function (Picker, $) {
    /**
     * The date picker constructor
     */
    function DatePicker(picker, settings) {
        settings.formatSubmit = undefined;
        const calendar = this;
        const element = picker.$node[0];
        element.currentStyle = undefined;
        const elementValue = element.value;
        const elementDataValue = picker.$node.data('value');
        const valueString = elementDataValue || elementValue;
        const formatString = elementDataValue ? (settings.formatSubmit || 'yyyy-mm-dd') : settings.format; // Fix here
        const isRTL = function () {
            return element.currentStyle ?
                // For IE.
                element.currentStyle.direction === 'rtl' :
                // For normal browsers.
                getComputedStyle(picker.$root[0]).direction === 'rtl';
        };

        calendar.settings = settings;
        calendar.$node = picker.$node;

        // The queue of methods that will be used to build item objects.
        calendar.queue = {
            min: 'measure create',
            max: 'measure create',
            now: 'now create',
            select: 'parse create validate',
            highlight: 'parse navigate create validate',
            view: 'parse create validate viewset',
            disable: 'deactivate',
            enable: 'activate'
        };

        // The component's item object.
        calendar.item = {};

        calendar.item.clear = null;
        calendar.item.disable = (settings.disable || []).slice(0);
        calendar.item.enable = -(function (collectionDisabled) {
            return collectionDisabled[0] === true ? collectionDisabled.shift() : -1;
        })(calendar.item.disable);

        calendar.set('min', settings.min).
        set('max', settings.max).
        set('now');

        // When there's a value, set the `select`, which in turn
        // also sets the `highlight` and `view`.
        if (valueString) {
            calendar.set('select', valueString, {
                format: formatString,
                defaultValue: true
            });
        }
        // If there's no value, default to highlighting "today".
        else {
            calendar.set('select', null).
            set('highlight', calendar.item.now);
        }

        // The keycode to movement mapping.
        calendar.key = {
            40: 7, // Down
            38: -7, // Up
            39: function () { return isRTL() ? -1 : 1 }, // Right
            37: function () { return isRTL() ? 1 : -1 }, // Left
            go: function (timeChange) {
                const highlightedObject = calendar.item.highlight;
                const targetDate = new Date(highlightedObject.year, highlightedObject.month, highlightedObject.date + timeChange);

                // Sử dụng navigate function ở đây
                const newDate = calendar.navigate('month', [targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate()], {nav: timeChange});
                calendar.set('highlight', newDate);
                this.render();
            }
        };

        // Bind some picker events.
        picker.on('render', function () {
            picker.$root.find('.' + settings.klass.selectMonth).on('change', function () {
                const value = this.value;
                if (value) {
                    picker.set('highlight', [picker.get('view').year, value, picker.get('highlight').date]);
                    picker.$root.find('.' + settings.klass.selectMonth).trigger('focus');
                }
            });
            picker.$root.find('.' + settings.klass.selectYear).on('change', function () {
                const value = this.value;
                if (value) {
                    picker.set('highlight', [value, picker.get('view').month, picker.get('highlight').date]);
                    picker.$root.find('.' + settings.klass.selectYear).trigger('focus');
                }
            });
        }, 1).
        on('open', function () {
            let includeToday = '';
            if (calendar.disabled(calendar.get('now'))) {
                includeToday = ':not(.' + settings.klass.buttonToday + ')';
            }
            picker.$root.find('button' + includeToday + ', select').attr('disabled', false);
        }, 1).
        on('close', function () {
            picker.$root.find('button, select').attr('disabled', true);
        }, 1);

    } // DatePicker

    /* eslint-disable-next-line no-unused-vars */
    /**
     * Navigate to next/prev month.
     * This function is used internally by the calendar's queue system.
     * @param {string} type - The type of navigation
     * @param {any} value - The value to navigate to
     * @param {object} options - Additional options
     * @returns {any} The navigated value
     */
    DatePicker.prototype.navigate = function (type, value, options) {
        let targetDateObject;
        let targetYear;
        let targetMonth;
        let targetDate;
        const isTargetArray = $.isArray(value);
        const isTargetObject = $.isPlainObject(value);
        const viewsetObject = this.item.view;

        if (isTargetArray || isTargetObject) {
            if (isTargetObject) {
                targetYear = value.year;
                targetMonth = value.month;
                targetDate = value.date;
            }
            else {
                targetYear = +value[0];
                targetMonth = +value[1];
                targetDate = +value[2];
            }

            // If we're navigating months but the view is in a different
            // month, navigate to the view's year and month.
            if (options && options.nav && viewsetObject && viewsetObject.month !== targetMonth) {
                targetYear = viewsetObject.year;
                targetMonth = viewsetObject.month;
            }

            // Figure out the expected target year and month.
            targetDateObject = new Date(targetYear, targetMonth + (options && options.nav ? options.nav : 0), 1);
            targetYear = targetDateObject.getFullYear();
            targetMonth = targetDateObject.getMonth();

            // If the month we're going to doesn't have enough days,
            // keep decreasing the date until we reach the month's last date.
            while (new Date(targetYear, targetMonth, targetDate).getMonth() !== targetMonth) {
                targetDate -= 1;
            }

            value = [targetYear, targetMonth, targetDate];
        }

        return value;
    };

    /**
     * The date picker defaults.
     */
    DatePicker.defaults = (function () {
        return {
            // ... Default settings remain the same ...
        };
    })(Picker.klasses().picker + '__');

    /**
     * Extend the picker to add the date picker.
     */
    Picker.extend('pickadate', DatePicker);

}));
