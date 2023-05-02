export const main = ({ renderer, renderTarget, camera, scene, gui }) => {

	const contentPerCubeFace = {
		front: 'all',
		right: 'all',
		back: 'all',
		left: 'all',
		top: 'all',
		bottom: 'all',
	};

	let time = 0;
	let startTime = 0;
	let prevTime = 0;
	startTime = prevTime = performance.now();

	const objectLoader = new THREE.ObjectLoader();
	let sceneLoaded = null;
	let events = {};

	const tryLoadFromFile = true;
	if(tryLoadFromFile) {
		// try loading the app.json file.
		// note, this won't work in the editor,
		// where the load method needs to be called by the editor.
		const fileLoadHandler = (response) => {
			load( JSON.parse( response ) );
		}
		const fileLoader = new THREE.FileLoader();
		fileLoader.load( 
			'./content/app.json',
			fileLoadHandler,
			null, // progress handler
			null // error handler
		);
	}

	const load = (json) => {

		var project = json.project;
		contentPerCubeFace.front = project.faceFront;
		contentPerCubeFace.left = project.faceLeft;
		contentPerCubeFace.back = project.faceBack;
		contentPerCubeFace.right = project.faceRight;
		contentPerCubeFace.top = project.faceTop;
		contentPerCubeFace.bottom = project.faceBottom;

		sceneLoaded = objectLoader.parse( json.scene );
		const cameraLoaded = objectLoader.parse( json.camera ); // not used.

		scene.add( sceneLoaded );

		events = {
			init: [],
			start: [],
			stop: [],
			keydown: [],
			keyup: [],
			pointerdown: [],
			pointerup: [],
			pointermove: [],
			update: []
		};

		var scriptWrapParams = 'player,renderer,scene,camera';
		var scriptWrapResultObj = {};

		for ( var eventKey in events ) {
			scriptWrapParams += ',' + eventKey;
			scriptWrapResultObj[ eventKey ] = eventKey;
		}

		var scriptWrapResult = JSON.stringify( scriptWrapResultObj ).replace( /\"/g, '' );

		for ( var uuid in json.scripts ) {
			var object = scene.getObjectByProperty( 'uuid', uuid, true );
			if ( object === undefined ) {
				console.warn( 'EJX.Content: Script without object.', uuid );
				continue;
			}

			var scripts = json.scripts[ uuid ];
			for ( var i = 0; i < scripts.length; i ++ ) {
				var script = scripts[ i ];
				var functions = ( new Function( scriptWrapParams, script.source + '\nreturn ' + scriptWrapResult + ';' ).bind( object ) )( this, renderer, scene, camera );
				for ( var name in functions ) {
					if ( functions[ name ] === undefined ) {
						continue;
					}
					if ( events[ name ] === undefined ) {
						console.warn( 'EJX.Content: Event type not supported (', name, ')' );
						continue;
					}
					events[ name ].push( functions[ name ].bind( object ) );
				}
			}
		}
		dispatch( events.init, null );
	};

	const play = () => {
		dispatch( events.start, null );
	};

	const stop = () => {
		dispatch( events.stop, null );
	};

	const update = () => {
		time = performance.now();
		if( events.update ) {
			dispatch( events.update, { time: time - startTime, delta: time - prevTime } );
		}
		prevTime = time;
	}

	const render = ( contentID ) => {
		if( sceneLoaded === null ) {
			return;
		}

		const visibleSave = [];
		sceneLoaded.children.forEach( ( child, i ) => {
			visibleSave[i] = child.visible;
			if( child.visible ) { // only leave on or turn off if visible.
				const visible = (contentID === child.uuid) || (contentID === 'all');
				child.visible = visible;
			}
		});

		renderer.render(scene, camera);

		sceneLoaded.children.forEach( ( child, i ) => {
			child.visible = visibleSave[i];
		});
	};

  const resize = (width, height) => {
    //
  };

	const dispose = () => {
		//
	};

	const keydown = (event) => {
		dispatch( events.keydown, event );
	}

	const keyup = (event) => {
		dispatch( events.keyup, event );
	}

	const pointerdown = (event) => {
		dispatch( events.pointerdown, event );
	}

	const pointerup = (event) => {
		dispatch( events.pointerup, event );
	}

	const pointermove = (event) => {
		dispatch( events.pointermove, event );
	}

	const dispatch = (array, event) => {
		for ( var i = 0, l = array.length; i < l; i ++ ) {
			array[ i ]( event );
		}
	}

  return {
		load: load,
		update: update,
		render: render,
		resize: resize,
		dispose: dispose,
		pointerdown: pointerdown,
		pointerup: pointerup,
		pointermove: pointermove,
		keydown: keydown,
		keyup: keyup,
		canGoInsideCube: () => {
			return true;
		},
    contentPerCubeFace: () => {  
			return contentPerCubeFace;
		}
  };
};
