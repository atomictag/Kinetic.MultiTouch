/*!
 * Kinetic.MutiTouch - Experimental multi-touch support for Kineticjs using Touchy
 * https://github.com/atomictag/Kinetic.MultiTouch
 * (c) 2013 oneoverzero GmbH
 *
 * This code if free to use and modify by anyone and for any purpose.
 *
 * @atomictag is davide.mancuso@oneoverzero.net
 *
 */

(function() {

    var stageW = Math.min(document.width, 320);
    var stageH = Math.min(document.height, 540);

    // Create multi-touch enabled Stage
    var stage = new Kinetic.MultiTouch.Stage({
        container: 'surface-container',
        width: stageW,
        height: stageH,
        // Prevent Kinetic from registering its own single-touch handlers
        disableSingleTouch : true
    });

    // Add some text
    var textLayer = new Kinetic.Layer;
    textLayer.add(new Kinetic.Text({
        y : 10,
        fontFamily: 'Helvetica',
        text:'Kinetic.MultiTouch - try it on a touch-enabled device. You can drag groups and shapes with multiple fingers simultaneously.',
        fontSize:12,
        fill:'black',
        align:'center',
        width: stageW - 20
    }));

    // The playground layer
    var playgroundLayer = new Kinetic.Layer({
        // Make the layer multi-touch aware
        multitouch : true
    });

    // Shape templates
    var circle = new Kinetic.Circle({ radius : 30 });
    var greenCircle = circle.clone({ fill : 'green' });
    var redCircle = circle.clone({ fill : 'red' });
    var blueCircle = circle.clone({ fill : 'blue' });

    // A multi-touch draggable group
    var draggableGroup = new Kinetic.Group({
        x : 50,
        y : 100,
        // Make this group draggable
        multitouch : {
            draggable : true
        }
    });
    draggableGroup.add(greenCircle.clone());
    draggableGroup.add(greenCircle.clone({ y : 30}));

    // A normal group with draggable shapes in it
    var fixedGroup = new Kinetic.Group({
        x : stageW - 100,
        y : 150
    });
    fixedGroup.add(redCircle.clone({
        // Make this shape draggable
        multitouch : {
            draggable : true
        }
    }));
    fixedGroup.add(blueCircle.clone({
        y : blueCircle.getRadius() * 3,
        // Make this shape draggable
        multitouch : {
            draggable : true
        }
    }));

    // A non-listening group
    var nonListeningGroup = new Kinetic.Group({
        x : 100,
        y : 250,
        listening : false,
        opacity : .2
    });
    nonListeningGroup.add(redCircle.clone({
        // The shape won't emit multi-touch events because its container is not listening
        multitouch : {
            draggable : true
        }
    }));
    nonListeningGroup.add(blueCircle.clone({
        y : blueCircle.getRadius() * 2,
        // The shape won't emit multi-touch events because its container is not listening
        multitouch : {
            draggable : true
        }
    }));

    // tap, tap, tap
    draggableGroup.on(Kinetic.MultiTouch.TAP, function(evt) {
        console.log('tapped draggableGroup');
    });
    fixedGroup.on(Kinetic.MultiTouch.TAP, function(evt) {
        console.log('tapped fixedGroup');
    });
    nonListeningGroup.on(Kinetic.MultiTouch.TAP, function(evt) {
        console.assert(false, 'tapped nonListeningGroup - this must never happen because the group is not listening');
    });

    // Add groups to playground
    playgroundLayer.add(draggableGroup);
    playgroundLayer.add(fixedGroup);
    playgroundLayer.add(nonListeningGroup);

    // Add layers
    stage.add(textLayer);
    stage.add(playgroundLayer);

})();

