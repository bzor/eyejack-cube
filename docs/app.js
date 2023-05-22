import {Object3D} from 'three';

Object3D.prototype.getAudio = function() {
	if (this.userData && this.userData.sound_file_64) {
		if (this.__ejx_audio) {
			return this.__ejx_audio;
		}
		const audio = new Audio;
		audio.loop = this.userData.sound_loop;
		audio.src = this.userData.sound_file_64;
		if (this.userData.sound_autoplay) audio.play();
		this.__ejx_audio = audio;
		return audio;
	}
	console.warn(`EJX: \'getAudio()\' failed on ${this.type} with name ${this.name} because there's no audio attached to this object to get.`)
}
Object3D.prototype.getVideo = function() {
	if (this.userData && this.userData.video_file_64) {
		if (this.__ejx_video) {
			return this.__ejx_video;
		}
		const video = document.createElement("video");
		video.loop = this.userData.video_loop;
		video.src = this.userData.video_file_64;
		this.__ejx_video = video;
		return video;
	}
	console.warn(`EJX: \'getVideo()\' failed on ${this.type} with name ${this.name} because there's no video attached to this object to get.`)
}

export const main = ({ renderer, renderTarget, camera, scene, loadingManager, gui }) => {

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
	let sceneLoadedMatrix = null;
	let frameCounter = 0;
	let loaded = false;
	let postProcessing = null;

	const events = {
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

	const tryLoadFromFile = true;
	if(tryLoadFromFile) {
		// try loading the app.json file.
		// note, this won't work in the editor,
		// where the load method needs to be called by the editor.
		const fileLoadHandler = (response) => {
			load( JSON.parse( response ), false );
		}
		const fileLoader = new THREE.FileLoader( loadingManager );
		fileLoader.load(
			'app.json',
			fileLoadHandler,
			null, // progress handler
			null // error handler
		);
	}

	const load = (json, inEditor=true) => {

		var project = json.project;

		if ( project.shadows !== undefined ) renderer.shadowMap.enabled = project.shadows;
		if ( project.shadowType !== undefined ) renderer.shadowMap.type = project.shadowType;
		if ( project.toneMapping !== undefined ) renderer.toneMapping = project.toneMapping;
		if ( project.toneMappingExposure !== undefined ) renderer.toneMappingExposure = project.toneMappingExposure;
		if ( project.useLegacyLights !== undefined ) renderer.useLegacyLights = project.useLegacyLights;

		contentPerCubeFace.front = project.faceFront;
		contentPerCubeFace.left = project.faceLeft;
		contentPerCubeFace.back = project.faceBack;
		contentPerCubeFace.right = project.faceRight;
		contentPerCubeFace.top = project.faceTop;
		contentPerCubeFace.bottom = project.faceBottom;

		if( project.postprocessing && project.postprocessing.length > 0 ) {
			postProcessing = project.postprocessing[0]; // only bloom for now.
			postProcessing.exposure = 0.5; // not included in editor project settings but is required for the player.
		}

		sceneLoaded = objectLoader.parse( json.scene );
		sceneLoadedMatrix = new THREE.Matrix4().compose( sceneLoaded.position, sceneLoaded.quaternion, sceneLoaded.scale );

		const cameraLoaded = objectLoader.parse( json.camera );
		if(inEditor) {
			// when launching in editor, copy over editor camera so that it lines up with the player camera.
			cameraLoaded.updateMatrixWorld();
			camera.copy( cameraLoaded );
		}

		var scriptWrapParams = 'player,renderer,scene,camera';
		var scriptWrapResultObj = {};

		for ( var eventKey in events ) {
			scriptWrapParams += ',' + eventKey;
			scriptWrapResultObj[ eventKey ] = eventKey;
		}

		var scriptWrapResult = JSON.stringify( scriptWrapResultObj ).replace( /\"/g, '' );

		for ( var uuid in json.scripts ) {
			var object = sceneLoaded.getObjectByProperty( 'uuid', uuid, true );
			if ( object === undefined ) {
				console.warn( 'EJX.Content: Script without object.', uuid );
				continue;
			}

			var scripts = json.scripts[ uuid ];
			for ( var i = 0; i < scripts.length; i ++ ) {
				var script = scripts[ i ];
				var functions = ( new Function( scriptWrapParams, script.source + '\nreturn ' + scriptWrapResult + ';' ).bind( object ) )( this, renderer, sceneLoaded, camera );
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

		// Autoplay sound
		sceneLoaded.traverse(obj => {
			if (obj && obj.userData && obj.userData.sound_autoplay && obj.getAudio) {
				const audio = obj.getAudio();
				if (audio) {
					audio.play();
				} else {
					console.error('\tCould not autoplay audio.')
				}
			}
		})

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


		frameCounter += 1;
		if( frameCounter == 2 ) {
			// takes an extra frame for the app.json to build
			// delay the loaded flag so any transitions happen after the big load and run smoothly.
			loaded = true; // scene loaded at this point.
		}

		const visibleSave = [];
		sceneLoaded.children.forEach( ( child, i ) => {
			visibleSave[i] = child.visible;
			if( child.visible ) { // only leave on or turn off if visible.
				const visible = (contentID === child.uuid) || (contentID === 'all');
				child.visible = visible;
			}
		});

		const sceneMatrix = new THREE.Matrix4().compose( scene.position, scene.quaternion, scene.scale );
		sceneMatrix.multiply( sceneLoadedMatrix );
		sceneMatrix.decompose( sceneLoaded.position, sceneLoaded.quaternion, sceneLoaded.scale );

		renderer.render(sceneLoaded, camera);

		sceneLoaded.children.forEach( ( child, i ) => {
			child.visible = visibleSave[i];
		});
	};

  const resize = (width, height) => {
    //
  };

	const dispose = () => {
		if (sceneLoaded) {
			sceneLoaded.traverse(obj => {
				// Puase audios
				if (obj && obj.__ejx_audio) {
					obj.__ejx_audio.pause();
					delete obj.__ejx_audio;
				}
				// Pause videos
				if (obj && obj.__ejx_video) {
					obj.__ejx_video.pause();
					delete obj.__ejx_video;
				}
			})

		}
	};

	const pointerdown = (event) => {
		dispatch( events.pointerdown, event );
	}

	const pointermove = (event) => {
		dispatch( events.pointermove, event );
	}

	const pointerup = (event) => {
		dispatch( events.pointerup, event );
	}

	const keydown = (event) => {
		dispatch( events.keydown, event );
	}

	const keyup = (event) => {
		dispatch( events.keyup, event );
	}

	const dispatch = (array, event) => {
		for ( var i = 0, l = array.length; i < l; i ++ ) {
			array[ i ]( event );
		}
	}

  return {
		load: load,
		loaded: () => { return loaded },
		update: update,
		render: render,
		resize: resize,
		dispose: dispose,
		pointerdown: pointerdown,
		pointermove: pointermove,
		pointerup: pointerup,
		keydown: keydown,
		keyup: keyup,
		cubeStyle: () => { return 'Plain'; },
		canGoInsideCube: () => { return true; },
    contentPerCubeFace: () => { return contentPerCubeFace; },
    postProcessing: () => { return postProcessing; }
  };
};
