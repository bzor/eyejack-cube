import * as THREE from './libs/three.module.js';
import { EJPlayer } from './libs/ejx.mjs';
import { BzorCube } from './BzorCube.js';

let hasInit = false;
let bzorCube;

window.THREE = THREE; // Used by APP Scripts.

const player = new EJPlayer();
window.player = player;
player.setCube( 'Glass' );
player.setEnvironment( 'None' );

const contentPath = './content/content.js';
import(contentPath).then(module => {
	player.setContent({filename: contentPath, module});
	console.log( "content set" );
});

const render = (timestamp, frame) => {


	player.render();

	if (player.contentCurrent() != null && !hasInit ) {

		if ( player.contentCurrent().instance.contentPerCubeFace().front != "all" ) {

			hasInit = true;
			init();

		}

	}

	if ( bzorCube != undefined ) {

		bzorCube.update( timestamp, frame );

	}
	
}

const resize = () => {
	player.resize();
}

player.renderOverrideFunc = render.bind(this);
player.resizeOverrideFunc = resize.bind(this);



function init () {

	console.log( player );
	bzorCube = new BzorCube();
	const content = player.contentCurrent();
	bzorCube.init( content.scene );

}