// Stopwatch by Yuri Shvetsov (updated 01.04.21)

const app = {

    // model + view -> controller

    model: {

        // State properties

        defaultTheme: null,
        startingDate: null,
        currentDate: null,
        time: null,
        prevTime: null,

        // Private methods

        read: function() {
            const data = JSON.parse(localStorage.getItem('stopwatch')) || {
                defaultTheme: true
            };

            this.defaultTheme = data.defaultTheme;
            this.write();
        },
        write: function() {
            const data = {
                defaultTheme: this.defaultTheme
            };

            localStorage.setItem('stopwatch', JSON.stringify(data));
        },
        setStartingDate: function() {
            this.startingDate = new Date();
        },
        updateCurrentDate: function() {
            this.currentDate = new Date();
        },
        calcTime: function() {
            this.prevTime = this.time;

            const diff = this.currentDate.getTime() - this.startingDate.getTime();

            const minutes = ( '00' + Math.floor(diff / 1000 / 60) ).slice(-2);
            const seconds = ( '00' + (Math.floor(diff / 1000) - minutes * 60) ).slice(-2);

            this.time = minutes + ' ' + seconds;
        },
        resetTime: function() {
            this.time = '00 00';
        },

        // Public methods

        init: function() {
            this.read();
            this.resetTime();
        },
        toggleTheme: function() {
            this.defaultTheme = !this.defaultTheme;
            this.write();
        },
        themeIsDefault: function() {
            return this.defaultTheme;
        },
        run: function() {
            this.setStartingDate();
        },
        reset: function() {
            this.startingDate = null;
            this.currentDate = null;

            this.resetTime();
        },
        updateTime: function() {
            this.updateCurrentDate();
            this.calcTime();
        },
        getTime: function() {
            return this.time;
        },
        timeIsChanged: function() {
            return (this.time !== this.prevTime);
        }
    },
    view: {

        // State properties

        elements: null,

        // Private methods

        // Public methods

        init: function() {
            this.elements = {
                container: document.querySelector('.js-container'),
                time: document.querySelector('.js-time'),
                themeButton: document.querySelector('.js-theme-button')
            };
        },
        setTheme: function(isDefault) {
            if (isDefault) {
                this.elements.container.classList.remove('stopwatch_theme_light');
            } else {
                this.elements.container.classList.add('stopwatch_theme_light');
            }
        },
        getElement: function(name) {
            if (!this.elements[name]) throw new Error(`Element ${name} is not found!`);

            return this.elements[name];
        },
        renderTime: function(value) {
            this.elements.time.innerHTML = value;
        }
    },
    controller: {

        // State properties

        status: 'default', // 'launch', 'stop'
        frame: null,

        // Private methods

        initHandlers: function() {
            const container = this.view.getElement('container');

            container.addEventListener('click', this.clickHandler.bind(this));
            document.addEventListener('keydown', this.keydownHandler.bind(this));
        },
        clickHandler: function(event) {
            const action = event.target.dataset.clickaction;

            if (!action) return;
            if (!this.clickActions[action]) throw new Error(`Action ${action} is not defined!`);

            this.clickActions[action].call(this, event.target);
        },
        keydownHandler: function(event) {
            if (event.code == 'Enter') this.toggleStatus();
        },
        setCurrentTheme: function() {
            this.view.setTheme(this.model.themeIsDefault());
        },
        render: function() {
            const time =  this.model.getTime();

            this.view.renderTime(time);
        },
        update: function() {
            this.model.updateTime();

            if (this.model.timeIsChanged()) this.render();

            this.frame = requestAnimationFrame(this.update.bind(this));
        },
        toggleStatus: function() {
            switch (this.status) {
                case 'default':
                    this.start();
                    this.status = 'launch';
                    break;
        
                case 'launch':
                    this.stop();
                    this.status = 'stop';
                    break;
        
                case 'stop':
                    this.clear();
                    this.status = 'default';
                    break;
            }
        },
        start: function() {
            this.model.run();
            this.update();
        },
        stop: function() {
            cancelAnimationFrame(this.frame);
        },
        clear: function() {
            this.model.reset();
            this.render();
        },

        // Public methods

        init: function(model, view) {
            this.model = model;
            this.view = view;

            // this.setCurrentTheme();
            this.initHandlers();
        },

        clickActions: {
            toggleTheme: function(target) {
                this.model.toggleTheme();
                this.setCurrentTheme();

                target.blur();
            },
            toggleStopwatch: function(target) {
                this.toggleStatus();
            }
        }
    },

    init: function() {
        this.model.init();
        this.view.init();
        this.controller.init(this.model, this.view);
    }
};

app.init();
