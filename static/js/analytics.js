class Analytics {
    constructor() {
        this.endpoint = '/api/analytics';
        this.sessionId = this._generateSessionId();
        this.pageLoadTime = performance.now();
        this.events = [];
        
        this.init();
    }

    init() {
        // Track page views
        this.trackPageView();
        
        // Track performance metrics
        this.trackPerformance();
        
        // Track user interactions
        this.setupEventListeners();
        
        // Send data periodically
        setInterval(() => this.flushEvents(), 30000);
        
        // Send data before page unload
        window.addEventListener('beforeunload', () => this.flushEvents());
    }

    trackPageView() {
        const data = {
            type: 'pageview',
            url: window.location.href,
            referrer: document.referrer,
            timestamp: new Date().toISOString(),
            sessionId: this.sessionId,
            userAgent: navigator.userAgent,
            screenResolution: `${window.screen.width}x${window.screen.height}`,
            viewport: `${window.innerWidth}x${window.innerHeight}`,
            loadTime: this.pageLoadTime
        };
        
        this.pushEvent(data);
    }

    trackPerformance() {
        // Track Web Vitals
        if ('web-vital' in window) {
            webVitals.getCLS(metric => this.pushEvent({
                type: 'performance',
                metric: 'CLS',
                value: metric.value,
                sessionId: this.sessionId
            }));
            
            webVitals.getFID(metric => this.pushEvent({
                type: 'performance',
                metric: 'FID',
                value: metric.value,
                sessionId: this.sessionId
            }));
            
            webVitals.getLCP(metric => this.pushEvent({
                type: 'performance',
                metric: 'LCP',
                value: metric.value,
                sessionId: this.sessionId
            }));
        }
        
        // Track Navigation Timing
        window.addEventListener('load', () => {
            const timing = performance.getEntriesByType('navigation')[0];
            if (timing) {
                this.pushEvent({
                    type: 'performance',
                    metric: 'navigationTiming',
                    value: {
                        dnsLookup: timing.domainLookupEnd - timing.domainLookupStart,
                        tcpConnection: timing.connectEnd - timing.connectStart,
                        serverResponse: timing.responseEnd - timing.requestStart,
                        domComplete: timing.domComplete - timing.responseEnd,
                        loadEvent: timing.loadEventEnd - timing.loadEventStart
                    },
                    sessionId: this.sessionId
                });
            }
        });
    }

    setupEventListeners() {
        // Track clicks
        document.addEventListener('click', event => {
            const target = event.target.closest('a, button, [role="button"]');
            if (target) {
                this.trackInteraction('click', target);
            }
        });
        
        // Track form submissions
        document.addEventListener('submit', event => {
            if (event.target.tagName === 'FORM') {
                this.trackInteraction('form_submit', event.target);
            }
        });
        
        // Track searches
        const searchInput = document.getElementById('search-input');
        if (searchInput) {
            let searchTimeout;
            searchInput.addEventListener('input', () => {
                clearTimeout(searchTimeout);
                searchTimeout = setTimeout(() => {
                    this.pushEvent({
                        type: 'search',
                        query: searchInput.value,
                        timestamp: new Date().toISOString(),
                        sessionId: this.sessionId
                    });
                }, 1000);
            });
        }
    }

    trackInteraction(type, element) {
        const data = {
            type: 'interaction',
            interactionType: type,
            element: {
                tagName: element.tagName.toLowerCase(),
                id: element.id,
                classes: Array.from(element.classList),
                text: element.innerText?.substring(0, 100),
                href: element.href
            },
            timestamp: new Date().toISOString(),
            sessionId: this.sessionId
        };
        
        this.pushEvent(data);
    }

    pushEvent(data) {
        this.events.push(data);
        
        // Flush if we have too many events
        if (this.events.length >= 100) {
            this.flushEvents();
        }
    }

    async flushEvents() {
        if (this.events.length === 0) return;
        
        const eventsToSend = [...this.events];
        this.events = [];
        
        try {
            const response = await fetch(this.endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    events: eventsToSend
                })
            });
            
            if (!response.ok) {
                throw new Error('Failed to send analytics data');
            }
        } catch (error) {
            console.error('Analytics error:', error);
            // Add events back to queue
            this.events.unshift(...eventsToSend);
        }
    }

    _generateSessionId() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
            const r = Math.random() * 16 | 0;
            const v = c === 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }
}

// Initialize analytics
const analytics = new Analytics();
