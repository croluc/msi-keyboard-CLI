#!/bin/sh
':' //; exec "$(command -v nodejs || command -v node)" "$0" "$@"
// light low med high
// black red orange yellow green cyan blue purple white

// handle exit
process.on('SIGTERM', function () {
  server.close(function () {
    process.exit(0);
  });
});

// Requirements
var argv = require ('minimist')(process.argv.slice (2));
var keyboard = require ('msi-keyboard')();
var fs = require ('fs');

// Vars
var debugVar = (argv.d || argv.debug ? true : false);
var defaultColor = 'white';
var defaultSection = 'all';
var defaultIntensity = 'high';
var locked = false;
var tmpFileName = '/tmp/_keyboard.backlight.lock';

var lightOff = 'off';
var colors = ['red','orange','yellow','green','cyan','blue','purple','white', 'black'];
var sections = ['left','middle','right'];
var intensities = ['high','med','low','light'];
var themes = {
    'cool' : {
        'left' : { 'color' : 'green', 'secondary': 'black'},
        'middle' : { 'color' : 'yellow', 'secondary': 'black'},
        'right' : { 'color' : 'yellow', 'secondary': 'black'}
    },
    'france' : {
        'left' : { 'color' : 'blue', 'secondary': 'black'},
        'middle' : { 'color' : 'white', 'secondary': 'black'},
        'right' : { 'color' : 'red', 'secondary': 'black'}
    },
    'italy' : {
        'left' : { 'color' : 'green', 'secondary': 'black'},
        'middle' : { 'color' : 'white', 'secondary': 'black'},
        'right' : { 'color' : 'red', 'secondary': 'black'}
    },
    'ireland' : {
        'left' : { 'color' : 'green', 'secondary': 'black'},
        'middle' : { 'color' : 'white', 'secondary': 'black'},
        'right' : { 'color' : 'orange', 'secondary': 'black'}
    },
    'rasta' : {
        'left' : { 'color' : 'green', 'secondary': 'black'},
        'middle' : { 'color' : 'yellow', 'secondary': 'black'},
        'right' : { 'color' : 'red', 'secondary': 'black'}
    },
    'canada' : {
        'left' : { 'color' : 'red', 'secondary': 'black'},
        'middle' : { 'color' : 'white', 'secondary': 'black'},
        'right' : { 'color' : 'red', 'secondary': 'black'}
    },
    'cop' : {
        'left' : { 'color' : 'blue', 'secondary' : 'red'},
        'middle' : { 'color' : 'white', 'secondary' : 'white'},
        'right' : { 'color' : 'red', 'secondary' : 'blue'},
        'mode': 'wave'
    },
    'sith' : {
        'left' : { 'color' : 'red', 'secondary' : 'black'},
        'middle' : { 'color' : 'black', 'secondary' : 'black'},
        'right' : { 'color' : 'red', 'secondary' : 'black'}
    },
    'k2000' : {
        'left' : { 'color' : 'red', 'secondary' : 'black'},
        'middle' : { 'color' : 'red', 'secondary' : 'black'},
        'right' : { 'color' : 'red', 'secondary' : 'black'},
        'mode': 'wave'
    }
};
var mods = ['normal','gaming','breathe','demo','wave'];

// Functions
function printHelp () {
    var h = '\n\t (msi-keyboard-CLI) Munsch Jeremy <jeremy.munsch@gmail.com>\n';
    h += '\t https://github.com/Kwaadpepper/msi-keyboard-CLI\n\n';
    h += '\tusage : msibacklight [section color secondary-color (optional) intensity (optional) blink (optional)]\n';
    h += '\t\tsection ('+sections.join (', ')+')\tex : left red low\n\n';
    h += '\t--eg,\t\tshows usage examples\n';
    h += '\t--examples\n';
    h += '\t-d, --debug\tprint debug\n';
    h += '\t-k (on|off)\tKeyboard backlight\n';
    h += '\t-l (on|off)\tusing -l on will force any furter commands to be ignored if not run with this same option.\n';
    h += '\t\t\t (use it to override a cron task by example command without -l), disable it by using `-l off`\n';
    h += '\t-c  color\tApplies to all sections\n';
    h += '\t\t\tcolors ('+colors.join (', ')+')\n';
    h += '\t-b  blink\tblink N ms ex : -b 750\n';
    h += '\t-i  intensity\tApplies to all sections ('+intensities.join (', ')+')\n';
    h += '\t-t  theme\tthemes are : '+Object.keys (themes).join (', ')+'\n';
    h += '\t-m  mod\t\tmods are : '+mods.join (', ')+'\n';
    h += '\t-h, --help \tprints this help message\n\n';
    h += '\tdefault color : '+defaultColor+'\n';
    h += '\tdefault intensity : '+defaultIntensity+'\n';
    h += '\tdefault section : '+defaultSection+'\n';
    h += '\n\tdependencies\tminimist\thttps://www.npmjs.org/package/minimist\n';
    h += '\t\t\tmsi-keyboard\thttps://github.com/wearefractal/msi-keyboard\n';

    echo (h);
    process.exit (1);
}

function printExamples () {
    var h = '\n\tMSI-Keyboard-CLI Examples\n\n';
    h += '\tTurn off\n';
    h += '\tmsibacklight -k off\n\n';
    h += '\tBasic white\n';
    h += '\tmsibacklight\n\n';
    h += '\tBasic white low\n';
    h += '\tmsibacklight -i low\n\n';
    h += '\tOrange madness\n';
    h += '\tmsibacklight -i high -c orange -b 200\n\n';
    h += '\tRednBlue\n';
    h += '\tmsibacklight -c red  -i med -m breathe middle blue high\n\n';
    h += '\tCop\n';
    h += '\tmsibacklight middle red blue high 0 left blue red high 0 right blue red -m breathe\n\n';
    h += '\tCop2 (last blink value has priority)\n';
    h += '\tmsibacklight middle red blue high 250 left blue red high 250 right blue red high 800\n\n';
    h += '\tCop3 (last blink value has priority)\n';
    h += '\tmsibacklight -c red left blue red high 250 right blue red high 500\n\n';
    h += '\tCop4 (last blink value has priority)\n';
    h += '\tmsibacklight right red blue high 0 left blue red high 150 middle white black -m wave\n\n';
    h += '\tCop4 (last blink value has priority)\n';
    h += '\tmsibacklight right red blue high 0 left blue red high 150 middle white black -m wave\n\n';
    h += '\tCop5 (last blink value has priority)\n';
    h += '\tmsibacklight right black blue high 0 left black red high 150 middle black white -m wave\n\n';

    echo (h);
    process.exit (1);
}

function echo () {
    var largs = Array.prototype.slice.call (arguments, 0);
    for (var arg in largs) {
        largs[arg] = JSON.stringify (largs[arg]);
    }
    console.log (largs.join (' ').replace (/["'\[\]\{\}]/g,'').replace (/\\n/g,'\n').replace (/\\t/g,'\t'));
}

function debug () {
    var largs = Array.prototype.slice.call (arguments, 0);
    for (var arg in largs) {
        largs[arg] = JSON.stringify (largs[arg]);
    }
    if (debugVar)
        echo (largs.join (' ').replace (/["'\[\]\{\}]/g,'').replace ('//','/'), '.');
}

// Help Section
if (argv.h || argv.help)
    printHelp ();

if (argv.eg || argv.examples)
    printExamples ();

// Color Section
if (argv.c) {
    // Choosen colors exists
    if (colors.indexOf (argv.c) !== -1) {
        defaultColor = colors[colors.indexOf (argv.c)];
        debug ('Color is set to ', defaultColor);
    } else {
        echo ('You have to choose a color between :', colors);
        process.exit (128);
    }
}

// Intensity Section
if (argv.i) {
    if (intensities.indexOf (argv.i) !== -1) {
        debug ('Intensity: ', argv.i);
        defaultIntensity = argv.i;
    } else {
        echo ('\toption -i accepts high,med,low,light (ex: -i low) \n\ttype --help or -h to have some more help');
        process.exit (128);
    }
}

var keyboardArgs = {
    'left' : { 'color' : defaultColor, 'intensity' : defaultIntensity, 'secondary': 'black'},
    'middle' : { 'color' : defaultColor, 'intensity' : defaultIntensity, 'secondary': 'black'},
    'right' : { 'color' : defaultColor, 'intensity' : defaultIntensity, 'secondary': 'black'},
};

// Lock Section
if (argv.l) {
    switch (argv.l) {
        case 'on':
            debug ('Lock: on');
            fs.writeFile (tmpFileName, 'locked', function (err) {
                if (err)
                    debug (err);
                else
                    debug ('Lock is successfull');
            });
            break;
        case 'off':
            debug ('Lock: off');
            fs.unlink (tmpFileName, function (err) {
                if (err)
                    debug (err);
                else
                    debug ('Unlock is successfull');
            });
            break;
        default:
         echo ('\toption -l accepts on or off, (ex: -l on) \n\ttype --help or -h to have some more help');
         process.exit (128);
    }

    if (!argv.k && !argv._.length && !argv.t && !argv.m)
        process.exit (0);
}

var ignore = false;

// Backlight Section
if (argv.k) {
    switch (argv.k) {
        case 'on':
            debug ('Backlight: on');
            for (var section in keyboardArgs) {
                keyboardArgs[section].color = defaultColor;
                keyboardArgs[section].intensity = defaultIntensity;
            };
            break;
        case 'off':
            ignore = true;
            debug ('Backlight: off');
            for (var section in keyboardArgs) {
                keyboardArgs[section].color = lightOff;
                keyboardArgs[section].intensity = defaultIntensity;
            }
            break;
        default:
            echo ('\toption -k accepts on or off, (ex: -k on) \n\ttype --help or -h to have some more help');
            process.exit (128);
    }
}

var blinkSections = [];
var blinkTime = 0;

// Parse section parameters
for (var key in argv._) {
    var section = argv._[key];
    debug ('key : ', key, '  value : ', section);

    // is section
    if (sections.indexOf (section) !== -1) {
        debug ('Section given is ', section);
        var color = argv._[parseInt (key)+1];

        // is next a color
        if (colors.indexOf (color) !== -1) {
            debug ('Color of  ', section, ' is ', color);
            keyboardArgs[section].secondary = 'black';
            var offset = 0;
            var secondary = argv._[parseInt (key)+2];
            var intensity = argv._[parseInt (key)+offset+2];


            // is secondary a color
            if (intensities.indexOf (intensity) === -1) {
                if (colors.indexOf (secondary) !== -1) {
                    debug ('Secondary color of ', section, ' is ', secondary);
                    offset = 1;
                    keyboardArgs[section].secondary = secondary;
                } else if (typeof secondary === 'undefined') {
                    secondary = secondary?secondary:'black';
                } else {
                    echo ('\t', section, ' ', color, ' ', secondary, ', ', secondary, ' is not a valid color nor a valid intensity, given is ', secondary, ' \n\ttype --help or -h to have some more help');
                    process.exit (128);
                }
            }

            intensity = argv._[parseInt (key)+offset+2];
            intensity = intensity?intensity:defaultIntensity;

             // Is next not an intensity
            if (intensities.indexOf (intensity) === -1) {
                if (intensity !== 'black')
                    echo ('\t', section, ' ', color, ' ', secondary, ' must be followed by a valid intensity, given is ', intensity, ' \n\ttype --help or -h to have some more help');
                else
                    echo ('\t', section, ' ', color, ' must be followed by a valid intensity, given is ', intensity, ' \n\ttype --help or -h to have some more help');
                process.exit (128);
            }

            var blink = parseInt (argv._[parseInt (key)+offset+3]);
            if (!isNaN (blink)) {
                blinkSections.push (section);
                blinkTime = blink;
            } else if (typeof argv._[parseInt (key)+offset+3] !== 'undefined') {
                echo ('blink must be a number, given is ', argv._[parseInt (key)+offset+3]);
                process.exit (128);
            }

            debug ('Section ', section, ' is set to ', color, ', ', secondary, ' as secondary color, at ', intensity, ' level and blinks at ', blink, ' ms');
            keyboardArgs[section].color = color;
            keyboardArgs[section].intensity = intensity;
        } else {
            echo ('\t', section, ' must be followed by a color, given is', color, '\n\ttype --help or -h to have some more help');
            process.exit (128);
        }
    }
}

// Check theme
if (!ignore && argv.t) {
    if (typeof themes[argv.t] !== 'undefined') { // is theme
        debug ('Theme set to ', argv.t);
        for (var section in themes[argv.t]) {
            if (themes[argv.t][section].color)
                keyboardArgs[section].color = themes[argv.t][section].color;
            if (themes[argv.t][section].intensity)
                keyboardArgs[section].intensity = themes[argv.t][section].intensity;
        }
        if (themes[argv.t].mode && !argv.m) {
            debug ('Mode is set to themes default:', themes[argv.t].mode);
            argv.m = themes[argv.t].mode;
        }
    } else {
        echo ('\toption -t must be a theme \n\ttype --help or -h to have some more help');
        process.exit (128);
    }
}

// Check is locked
fs.exists (tmpFileName, function (exists) {
    locked = exists?true:false;
    debug ('Locked status is ', locked);

    if (locked) {
        debug ('Don\'t touch anything because keyboard backlight is locked: file present ', tmpFileName);
        process.exit (-1);
    }


    for (var section in keyboardArgs) {
        debug (section,keyboardArgs[section]);
        keyboard.color (section, keyboardArgs[section]);
    };

    // Blink Section
    if (argv.b || blinkSections.length !== 0) {
        if (blinkSections.length !== 0) {
            if (blinkTime !== 0) {
                debug ('multi blinking with ', blinkTime, ' on sections ', blinkSections);
                keyboard.blink (blinkSections, blinkTime);
            }
        }
        else if (typeof argv.b === 'number') {
            debug ('blinking with ', argv.b);
            keyboard.blink (parseInt (argv.b));
        }
        else {
            echo ('\toption -b accepts integer, (ex: -b 250 for blink = 250ms) \n\ttype --help or -h to have some more help');
            process.exit (128);
        }
    }
});

// keyboard.mode ('gaming');

// Mod Section
if (argv.m) {
    if (mods.indexOf (argv.m) !== -1) {
        switch(argv.m) {
            case 'demo':
                debug ('mode set to ', argv.m);
                keyboard.mode (argv.m);
                process.exit (0);
            case 'gaming':
                debug ('mode set to ', argv.m, ' with ', JSON.stringify (keyboardArgs['left']).replace (/["'\[\]\{\}]/g,''));
                keyboard.color ('left', keyboardArgs['left']);
                keyboard.mode (argv.m);
                process.exit (0);
            case 'normal':
                debug ('mode set to ', argv.m, 'skipping');
                break;
            default:
                debug ('mode set to ', argv.m, ' with ', JSON.stringify (keyboardArgs).replace (/["'\[\]\{\}]/g,''));
                keyboard.mode (argv.m, keyboardArgs);
                process.exit (0);
        }
    } else {
        echo ('You have to choose a mod between :',mods);
        process.exit (128);
    }
}

// End of program
