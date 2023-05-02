import * as THREE from './libs/three.module.js';
import { AgentWander } from './AgentWander.js';
import { AgentTrail } from './AgentTrail.js';

export class BzorCube {

	deltaTime = 0;
	maxDelta = 1000;
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

		this.agentWander = new AgentWander( this );
		this.agentTrail = new AgentTrail( this );

	}

	update( timestamp, frame ) {

		this.deltaTime = timestamp - this.lastFrameTime;
		this.deltaTime = Math.max( this.deltaTime, this.maxDelta );
		this.lastFrameTime = timestamp;
		this.frame = frame;

		this.agentWander.update( this.deltaTime );
		this.agentTrail.update( this.deltaTime );

	}

}
