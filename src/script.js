import * as THREE from './libs/three.module.js';
import { EJPlayer } from './libs/ejx.mjs';
import { BzorCube } from './BzorCube.js';

let hasInit = false;

window.THREE = THREE; // Used by APP Scripts.

const player = new EJPlayer();
window.player = player;
player.setCube( 'Plain' );
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
}

const resize = () => {
	player.resize();
}

player.renderOverrideFunc = render.bind(this);
player.resizeOverrideFunc = resize.bind(this);



function init () {

	console.log( player );
	const bzorCube = new BzorCube();
	const content = player.contentCurrent();
	bzorCube.init( content.scene );

}