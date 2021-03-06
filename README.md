Kinetic.MultiTouch
==================

Experimental multi-touch support for [Kineticjs](http://kineticjs.com/) using [Touchy](https://github.com/jairajs89/Touchy.js)

## Rationale

As of version 5.0.1 [Kineticjs](http://kineticjs.com/) does not (yet) provide support for multi-touch events
on the nodes added to the stage (it is fairly easy to add multi-touch gestures to the stage as a whole as shown in
[this example](http://www.html5canvastutorials.com/labs/html5-canvas-multi-touch-scale-stage-with-kineticjs/)).
This means you can not drag multiple layers/groups/shapes at the same time or react to more than one touch event at a time.

Kinetic is still under heavy development and full multi-touch support is going to be added to the core library
[eventually](https://github.com/ericdrowell/KineticJS/wiki/Release-Schedule#eventually). Until then, we need a clean
solution that can add multi-touch support on touch-capable devices in a simple and non-invasive way. This is what
this experiment is about.

## Requirements

- True multi-touch (touchstart, touchmove, touchend, tap) support on any node on the stage (layer/group/shape)
- Multi-touch drag-n-drop (dragstart, dragmove, dragend) on any node
- Must behave as you would expect (e.g. dragging a shape within a draggable group should drag the group and not only the shape)
- Must honor `listening : true|false` directives
- Must be super-easy to use with as little user-side code as possible (ideally just an additional attribute)
- Must not patch/override anything in Kinetic's core library
- Must not break or mess up with Kinetic's single-touch event handling (incl. drag-n-drop)

At this stage file size and dependencies are not a concern (I developed this for an existing project that has loads of dependencies anyways). Lastly, overall performance should not be affected by whether multi-touch is enabled or not.

## Enters Touchy

Over time I've been looking at various multi-touch libraries (there are [many](https://github.com/bebraw/jswiki/wiki/Touch) to choose from depending on the use case) and I've always liked the super-simple and extensible  *socket-like* approach proposed by [Touchy](https://github.com/jairajs89/Touchy.js). Touchy's design is perfectly suited to add self-contained multi-finger handlers that we can use to *add* multi-touch events to Kinetic.

All we need to do is to create a *kinetic* Touchy plugin to do all the finger-handling for us and register the plugin on the stage container element.

## Dependencies

- [Kinetic](http://kineticjs.com/) (the best Canvas library out there :)
- [Underscore](http://underscorejs.org/) (just because I am lazy and I use it everywhere)
- [Touchy](https://github.com/jairajs89/Touchy.js) (kudos for making such a pretty little gem)

Additionally, if you are using Greensock's awesome [GSAP tweening library](http://www.greensock.com/gsap-js/) (with or without the [GSAP Kinetic Plugin](https://github.com/greensock/GreenSock-JS/blob/master/src/uncompressed/plugins/KineticPlugin.js)), it will be used to handle the draw updates during `dragmove` (you can also specify if `autoDraw` should be used - see below).


## How to use it

You need to include Kinetic, Underscore and Touchy in your html/application.
Optionally add GSAP TweenLite / TweenMax and the GSAP Kinetic Plugin.
Then add Kinetic.MultiTouch.js. See example code.

Kinetic.MultiTouch adds the new namespace `Kinetic.MultiTouch`.

In order to make your `Kinetic.Stage` multi-touch aware, just inherit from `Kinetic.MultiTouch.Stage` instead of `Kinetic.Stage`:

    var stage = new Kinetic.MultiTouch.Stage({
        container: 'surface-container',
        width: 400,
        height: 400
    });

That's pretty much it. `Kinetic.MultiTouch.Stage` is basically just a stage extension that registers Touchy with the stage container element. The option object passed to the constructor is exactly the same as the one expected by `Kinetic.Stage`,
with the following additions:

  - `disableSingleTouch : <boolean>` (default: `false`): prevent Kinetic from registering its own single-touch events. This forces you to use only multitouch events only as Kinetic will not fire its own touch/mouse events any longer, but it provides better performance. In most cases this is what you want, but you can keep both if you need so.

  - `multitouch : <boolean>` (default: `false`): Enable multitouch by default on the stage and its children

Unless `multitouch:true` is passed to the Stage constructor, by default nodes are **NOT** multi-touch enabled - i.e. multi-touch events are not captured and triggered. In order to make a node fire multi-touch events you need to add the `multitouch` property to the attributes list, for example:

    var node = new Kinetic.Group({ // This can be a layer, a group, or a shape
      ...
      multitouch : true // now the node will receive/emit multi-touch events
    });

Enable multi-touch drag-and-drop is equally easy:

    var node = new Kinetic.Group({ // This can be a layer, a group, or a shape
      ...
      multitouch : { // now the node will receive/emit multi-touch events
        draggable : true // the node is also draggable (will move on screen and trigger drag* events)
      }

    });

If you are using GSAP with the Kinetic Plugin you can pass the additional `autoDraw` boolean property to specify whether *autoDraw* should be enabled in the Kinetic Plugin (it is by default!). This is particularly useful if you have other tweens happening concurrently to your drag-and-drop that are using it. If you are not using GSAP and/or the Kinetic Plugin this option has no effect (Kinetic `layer.batchDraw()` is used instead).

    var node = new Kinetic.Group({ // This can be a layer, a group, or a shape
      ...
      multitouch : { // now the node will receive/emit multi-touch events
        draggable : true, // the node is also draggable (will move on screen and trigger drag* events)
        autoDraw  : true // let GSAP Kinetic's plugin handle batch draws
      }

    });


Multitouch directives are applied in a similar way to Kinetic's `listening` and `draggable` properties, so for example if a node is multi-touch enabled, so are its children. Kinetic default `listening` and `draggable` behaviours are preserved, so if a node is not listening to regular events it won't listen to multi-touch events either. Kinetic `draggable` attributes take precedence over `multitouch : { draggable : true }`, so if a node (or one of its ancestors) is marked as *draggable*, default Kinetic drag-and-drop behaviour is used instead of the multi-touch one (that is, only one node can be dragged at a time).

Touch-events are fired with a special name in order to keep them separate from *regular* single-touch events fired by Kinetic. They are available in the `Kinetic.MultiTouch` namespace as follows (the actual string names may change - this is the first thing I came out with):

    Kinetic.MultiTouch.TOUCHSTART, // "touchstart:multitouch"
    Kinetic.MultiTouch.TOUCHMOVE,  // "touchmove:multitouch"
    Kinetic.MultiTouch.TOUCHEND,   // "touchend:multitouch"
    Kinetic.MultiTouch.TAP,        // "tap:multitouch"
    Kinetic.MultiTouch.DRAGSTART,  // "dragstart:multitouch"
    Kinetic.MultiTouch.DRAGMOVE,   // "dragmove:multitouch"
    Kinetic.MultiTouch.DRAGEND,    // "dragend:multitouch"

In order to to listen to multi-touch events you simply have to do:

    node.on(Kinetic.MultiTouch.TAP, function(evt) {
      ... // evt is currently a Touchy "point", not a real TouchEvent
    });

    node.on(Kinetic.MultiTouch.DRAGMOVE, function(evt) {
      ... // evt is currently a Touchy "point", not a real TouchEvent
    });

## Support

Kinetic 4.5.x is supported as well as Kinetic 5 up to the latest (current) version 5.0.1.
The example provided uses Kinetic 5.0.1.

This is pretty much a proof of concept and it took me more time to write this README than the actual code, so things may not be 100% tested or super-smart. It should be easy enough to add this to an existing project to give it a go - and revert back if things don't work for you. Feedback is of course welcome.

## License

This code is provided "as is" by [oneoverzero GmbH](http://www.oneoverzero.net).

Do whathever you want with it, have fun and be happy.

