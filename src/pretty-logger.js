(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        define([], factory);
    } else if (typeof module === 'object' && module.exports) {
        module.exports = factory();
    } else {
        root.PrettyLogger = factory();
    }
}(typeof self !== 'undefined' ? self : this, function () {

    function PrettyLogger(debugPanelId) {
        var self = this;

        this.debugLogPanel = typeof window !== 'undefined' ? document.getElementById(debugPanelId) : null;
        if (typeof window !== 'undefined' && !this.debugLogPanel) {
            throw new Error("Debug panel with id '" + debugPanelId + "' not found");
        }

        this.log = function (level, message) {
            var logEntry = self.createLogEntry(level, message);

            if (typeof window !== 'undefined') {
                var logLine = document.createElement('div');
                logLine.className = 'adl-log-entry';
                logLine.innerHTML = logEntry;
                self.debugLogPanel.appendChild(logLine);
                self.debugLogPanel.scrollTop = self.debugLogPanel.scrollHeight;
                self.addCollapsibleListeners(logLine);
            } else {
                console.log(self.stripHtml(logEntry));
            }
        };

        this.createLogEntry = function (level, message) {
            var timestamp = new Date().toISOString().substr(11, 12);
            var textColorClass = self.getColorClassForLevel(level);
            var formattedMessage = self.formatMessage(message);

            return '<span class="adl-timestamp">[' + timestamp + ']</span> ' +
                '<span class="adl-level ' + textColorClass + '">[' + level.toUpperCase() + ']</span> ' +
                '<span class="adl-message">' + formattedMessage + '</span>';
        };

        this.formatMessage = function (message) {
            if (typeof message === 'object' && message !== null) {
                if (typeof window !== 'undefined' && message instanceof HTMLElement) {
                    return self.formatHTMLElement(message);
                } else {
                    return self.formatObject(message);
                }
            } else {
                return self.escapeHTML(String(message));
            }
        };

        this.formatObject = function (obj, depth) {
            depth = depth || 0;
            if (depth > 5) return '<span class="adl-value">{...}</span>'; // Limit recursion depth

            var hasChildren = Object.keys(obj).length > 0;
            var ellipsis = hasChildren ? '<span class="adl-ellipsis">...</span>' : '';

            var result = '<span class="adl-toggle adl-key">{' + ellipsis + '</span>';
            result += '<div class="adl-collapsible">';

            for (var key in obj) {
                if (obj.hasOwnProperty(key)) {
                    var value = obj[key];
                    result += '<div>';
                    result += '<span class="adl-key">' + self.escapeHTML(key) + '</span>: ';

                    if (typeof value === 'object' && value !== null) {
                        result += self.formatObject(value, depth + 1);
                    } else {
                        result += '<span class="adl-value">' + self.escapeHTML(String(value)) + '</span>';
                    }
                    result += '</div>';
                }
            }

            result += '</div>';
            result += '<span class="adl-key">}</span>';

            if (!hasChildren) {
                result = '<span class="adl-value">{}</span>';
            }

            return result;
        };

        this.formatHTMLElement = function (element, depth) {
            depth = depth || 0;
            if (depth > 5) return '<span class="adl-value">...</span>'; // Limit recursion depth

            var hasChildren = false;
            var childContent = '';

            for (var j = 0; j < element.childNodes.length; j++) {
                var child = element.childNodes[j];
                if (child.nodeType === Node.ELEMENT_NODE) {
                    hasChildren = true;
                    childContent += '<div>' + self.formatHTMLElement(child, depth + 1) + '</div>';
                } else if (child.nodeType === Node.TEXT_NODE && child.textContent.trim() !== '') {
                    hasChildren = true;
                    childContent += '<div><span class="adl-value">' + self.escapeHTML(child.textContent.trim()) + '</span></div>';
                }
            }

            var result = '';
            if (hasChildren) {
                result += '<span class="adl-toggle adl-key">&lt;' + element.tagName.toLowerCase();
            } else {
                result += '<span class="adl-key">&lt;' + element.tagName.toLowerCase();
            }

            // Add attributes
            for (var i = 0; i < element.attributes.length; i++) {
                var attr = element.attributes[i];
                result += ' ' + attr.name + '="' + self.escapeHTML(attr.value) + '"';
            }

            if (!hasChildren) {
                result += '/&gt;</span>';
            } else {
                var ellipsis = '<span class="adl-ellipsis">...</span>';
                result += '&gt;' + ellipsis + '</span>';
                result += '<div class="adl-collapsible">' + childContent + '</div>';
                result += '<span class="adl-key">&lt;/' + element.tagName.toLowerCase() + '&gt;</span>';
            }

            return result;
        };

        this.escapeHTML = function (str) {
            return str
                .replace(/&/g, '&amp;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;')
                .replace(/"/g, '&quot;')
                .replace(/'/g, '&#039;');
        };

        this.stripHtml = function (html) {
            return html.replace(/<[^>]*>/g, '');
        };

        this.getColorClassForLevel = function (level) {
            switch (level.toLowerCase()) {
                case 'error': return 'adl-text-error';
                case 'warn': return 'adl-text-warn';
                case 'info': return 'adl-text-info';
                case 'debug': return 'adl-text-debug';
                default: return 'adl-text-gray';
            }
        };

        this.addCollapsibleListeners = function (logLine) {
            var toggles = logLine.querySelectorAll('.adl-toggle');
            toggles.forEach(function (toggle) {
                toggle.addEventListener('click', function (event) {
                    event.stopPropagation(); // Prevent event from bubbling up
                    this.classList.toggle('adl-expanded');
                    var content = this.nextElementSibling;
                    if (content && content.classList.contains('adl-collapsible')) {
                        content.classList.toggle('adl-expanded');
                    }
                });
            });
        };

        this.error = function (message) { self.log('error', message); };
        this.warn = function (message) { self.log('warn', message); };
        this.info = function (message) { self.log('info', message); };
        this.debug = function (message) { self.log('debug', message); };
    }

    return PrettyLogger;
}));