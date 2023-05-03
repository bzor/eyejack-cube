import * as THREE from './libs/three.module.js';
import { AgentWander } from './AgentWander.js';
import { AgentTrail } from './AgentTrail.js';
import { AgentVisFront } from './AgentVisFront.js';

export class BzorCube {

	deltaTime = 0;
	maxDelta = 1;
	lastFrameTime = 0;
	frame = 0;

	agents = [];

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

		const frontLight = new THREE.DirectionalLight( 0xffffff, 0.8 );
		frontLight.position.set( 0, 1.0, 1.0 );
		this.faceFront.add( frontLight );
		const frontAmbLight = new THREE.HemisphereLight( 0xFF0000, 0x0000FF, 0.5 );
		this.faceFront.add( frontAmbLight );

		this.addAgent( 0x00FFFF );
		this.addAgent( 0xFF00FF);

	}

	addAgent( col ) {

		const agentWander = new AgentWander( this );
		const agentTrail = new AgentTrail( agentWander );
		const agentVisFront = new AgentVisFront( this.faceFront, agentTrail, col );
		const agentData = { wander: agentWander, trail: agentTrail, visFront: agentVisFront };
		this.agents.push( agentData );

	}

	update( timestamp, frame ) {

		this.deltaTime = ( timestamp - this.lastFrameTime ) * 0.001;
		this.deltaTime = Math.min( this.deltaTime, this.maxDelta );
		this.lastFrameTime = timestamp;
		this.frame = frame;

		for ( let i = 0; i < this.agents.length; i++ ) {

			let agent = this.agents[ i ];
			agent.wander.update( this.deltaTime );
			agent.trail.update( this.deltaTime );
			agent.visFront.update( this.deltaTime );
	

		}


	}

}
