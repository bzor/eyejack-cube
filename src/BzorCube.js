import * as THREE from './libs/three.module.js';
import { AgentWander } from './AgentWander.js';
import { AgentTrail } from './AgentTrail.js';
import { AgentVisFront } from './AgentVisFront.js';

export class BzorCube {

	deltaTime = 0;
	maxDelta = 1;
	lastFrameTime = 0;
	frame = 0;

	constructor() {
	}

	init( scene ) {

		console.log( "bzor cube init" );
		this.faceFront = scene.getObjectByName( "faceFront", true );
		this.faceBack = scene.getObjectByName( "faceBack", true );
		this.faceLeft = scene.getObjectByName( "faceLeft", true );
		this.faceRight = scene.getObjectByName( "faceRight", true );
		this.faceTop = scene.getObjectByName( "faceTop", true );
		this.faceBottom = scene.getObjectByName( "faceBottom", true );

		const frontLight = new THREE.HemisphereLight( 0xffffbb, 0x080820, 1.0 );
		this.faceFront.add( frontLight );

		this.agentWander = new AgentWander( this );
		this.agentTrail = new AgentTrail( this );
		this.agentWander.setTrail( this.agentTrail );
		this.agentVisFront = new AgentVisFront( this.faceFront, this.agentTrail );

	}

	update( timestamp, frame ) {

		this.deltaTime = ( timestamp - this.lastFrameTime ) * 0.001;
		this.deltaTime = Math.min( this.deltaTime, this.maxDelta );
		this.lastFrameTime = timestamp;
		this.frame = frame;

		this.agentWander.update( this.deltaTime );
		this.agentTrail.update( this.deltaTime );
		this.agentVisFront.update( this.deltaTime );

	}

}
