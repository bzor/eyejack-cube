import * as THREE from './libs/three.module.js';

export class AgentVisFront {

	faceGroup;
	agentTrail;

	spineData = [];

	elemScale = 0.028;

	vec1 = new THREE.Vector3();
	vec2 = new THREE.Vector3();

	constructor( faceGroup, trail ) {

		this.faceGroup = faceGroup;
		this.agentTrail = trail;

		this.init();

	}

	init() {

		const scale = this.elemScale;
		const scaleMult = 2.0;
		const geo = new THREE.BoxGeometry( scale * scaleMult, scale * scaleMult, scale );
		const mat = new THREE.MeshStandardMaterial( { color: 0x00FFFF } );

		for ( let i = 0; i < this.agentTrail.numSegments; i++ ) {

			let mesh = new THREE.Mesh( geo, mat );
			this.spineData.push( mesh );
			this.faceGroup.add( mesh );

		}

	}

	update( deltaTime ) {

		for ( let i = 0; i < this.agentTrail.numSegments; i++ ) {

			let t = i / ( this.agentTrail.numSegments - 1 );

			if ( i == 0 ) {

				this.vec1.copy( this.agentTrail.segments[ 0 ] ).sub( this.agentTrail.segments[ 1 ] ).add( this.agentTrail.segments[ 0 ] );

			} else {

				this.vec1.copy( this.agentTrail.segments[ i - 1 ] ).sub( this.agentTrail.segments[ i ] ).add( this.agentTrail.segments[ i ] );

			}

			let elem = this.spineData[ i ];
			elem.lookAt( this.vec1 );
			elem.position.copy( this.agentTrail.segments[ i ] );
			let scXY = THREE.MathUtils.smoothstep( t, 0, 0.1 ) * ( 1.0 - THREE.MathUtils.smoothstep( t, 0.9, 1.0 ) );
			elem.scale.set( scXY, scXY, 1 );

		}

	}

}