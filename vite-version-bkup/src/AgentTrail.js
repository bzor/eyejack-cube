import * as THREE from './libs/three.module.js';

export class AgentTrail {

	dropDelay = 0;
	dropTick = 0;

	segments = [];
	numSegments = 256;

	constructor( wander ) {

		this.agentWander = wander;
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