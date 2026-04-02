pc.script.createLoadingScreen(function (app) {

    var showSplash = function () {

        // splash wrapper
        var wrapper = document.createElement('div');
        wrapper.id = 'application-splash-wrapper';
        document.body.appendChild(wrapper);

        // splash
        var splash = document.createElement('div');
        splash.id = 'application-splash';
        wrapper.appendChild(splash);
        splash.style.display = 'block';

        var logo = document.createElement('img');
        logo.src = 'data:image/jpeg;base64,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';
        splash.appendChild(logo);
        logo.onload = function () {
            splash.style.display = 'block';
        };

        var container = document.createElement('div');
        container.id = 'progress-bar-container';
        splash.appendChild(container);

        var bar = document.createElement('div');
        bar.id = 'progress-bar';
        container.appendChild(bar);


        // bottom right corner image
        var gamebakeLogo = document.createElement('img');
        gamebakeLogo.id = 'gamebake-logo';
        gamebakeLogo.src = 'data:image/png;base64,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';
        wrapper.appendChild(gamebakeLogo);
        gamebakeLogo.onload = function () {
            gamebakeLogo.style.display = 'block';
        };

    };

    var hideSplash = function () {
        var splash = document.getElementById('application-splash-wrapper');
        splash.parentElement.removeChild(splash);
    };

    var setProgress = function (value) {

        var bar = document.getElementById('progress-bar');
        if (bar) {
            value = Math.min(1, Math.max(0, value));
            bar.style.width = value * 100 + '%';
        }

        value = Math.min(1, Math.max(0, value));
        try {
            // sc.setLoadingProgress(value);
        }
        catch (e) {
            // no SDK loaded
            // console.error("[Snapchat] Sc-sdk is not loaded.");
        }
    };

    var createCss = function () {
        var css = [
            'body {',
            '    background-color: #FFFFFF;',
            '}',
            '',
            '#application-splash-wrapper {',
            '    position: absolute;',
            '    top: 0;',
            '    left: 0;',
            '    height: 100%;',
            '    width: 100%;',
            '    background-color: #FFFFFF;',
            '}',
            '',
            '#application-splash {',
            '    position: absolute;',
            '    top: calc(50% - 160px);',
            '    width: 264px;',
            '    left: calc(50% - 132px);',
            '}',
            '',
            '#gamebake-logo {',
            '    position: absolute;',
            '    bottom: 0px;',
            '    right: 0px;',
            '    width: 100%;',
            '    max-width: 300px;',
            '    margin: 10px;',
            '}',
            '',
            '#game-logo {',
            '    position: absolute;',
            '    top: calc(50% - 237px);',
            '    width: 310px;',
            '    left: calc(50% - 155px);',
            '}',
            '',
            '#application-splash img {',
            '    width: 100%;',
            '}',
            '',
            '#progress-bar-container {',
            '    margin: 20px auto 0 auto;',
            '    height: 4px;',
            '    width: 100%;',
            '    background-color: #c4cdcf;',
            '}',
            '',
            '#progress-bar {',
            '    width: 0%;',
            '    height: 100%;',
            '    background-color: #5229AF;',
            '}',
            '',
            '@media (max-width: 480px) {',
            '    #application-splash {',
            '        width: 170px;',
            '        left: calc(50% - 85px);',
            '    }',
            '    #game-logo {',
            '        top: calc(50% - 190px);',
            '        width: 200px;',
            '        left: calc(50% - 100px);',
            '    }',
            '}'
        ].join('\n');

        var style = document.createElement('style');
        style.type = 'text/css';
        if (style.styleSheet) {
            style.styleSheet.cssText = css;
        } else {
            style.appendChild(document.createTextNode(css));
        }

        document.head.appendChild(style);
    };

    createCss();
    showSplash();
    //scLoad();

    app.on('preload:end', function () {
        app.off('preload:progress');
    });

    // app.once('postrender', function () {

    //     try {
    //         Debug.log("SC Loading Complete");
    //         sc.loadingComplete();
    //     }
    //     catch (e) {
    //         // no SDK loaded
    //         console.error("[Snapchat] Sc-sdk is not loaded.");
    //     }
    // }, this);

    app.on('preload:progress', setProgress);
    app.on('start', hideSplash);
});