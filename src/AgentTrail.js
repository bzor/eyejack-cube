import * as THREE from './libs/three.module.js';

export class AgentTrail {

	main;

	dropDelay = 0.032;
	dropTick = 0;

	segments = [];
	numSegments = 128;

	constructor( main ) {

		this.main = main;
		this.agentWander = this.main.agentWander;
		this.reset();

	}

	reset() {

		this.segments = [];
		for ( let i = 0; i < this.numSegments; i++ ) {

			this.segments.push( new THREE.Vector3() );

		}

	}

	update( deltaTime ) {

		this.dropTick += deltaTime;
		if ( this.dropTick > this.dropDelay ) {

			this.dropTick = 0;
			this.updateTrail();

		}

	}

	updateTrail() {

		for( let i = this.numSegments - 1; i > 0; i-- ) {

			this.segments[ i ].copy( this.segments[ i - 1 ] );

		}
		this.segments[ 0 ].copy( this.agentWander.agentPoint );

	}

}