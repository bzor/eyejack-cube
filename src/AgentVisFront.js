import * as THREE from './libs/three.module.js';

export class AgentVisFront {

	faceGroup;
	agentTrail;

	elemScale = 0.01;

	numSpineInstances = 2048;
	spineElemData = [];

	pos = new THREE.Vector3();
	vec1 = new THREE.Vector3();
	vec2 = new THREE.Vector3();
	vec3 = new THREE.Vector3();
	mat3 = new THREE.Matrix3();
	mat4 = new THREE.Matrix4();
	matRot4 = new THREE.Matrix4();
	q1 = new THREE.Quaternion();
	scale = new THREE.Vector3();
	up = new THREE.Vector3( 0, 1.0, 0 );

	tick = 0;

	constructor( faceGroup, trail, col ) {

		this.faceGroup = faceGroup;
		this.agentTrail = trail;
		this.col = col;

		this.init();

	}

	init() {

		const scale = this.elemScale;
		const scaleMult = 2.0;
		//const geo = new THREE.BoxGeometry( scale, scale, scale );
		const geo = new THREE.IcosahedronGeometry( scale, 2 );
		const mat = new THREE.MeshStandardMaterial( { color: this.col } );
		mat.roughness = 0.25;

		const spineMesh = new THREE.InstancedMesh( geo, mat, this.numSpineInstances );
		spineMesh.instanceMatrix.setUsage( THREE.StreamDrawUsage );
		this.faceGroup.add( spineMesh );
		this.spineMesh = spineMesh;

		for ( let i = 0; i < this.numSpineInstances; i++ ) {

			this.spineElemData.push( { rnd: new THREE.Vector3().randomDirection().multiplyScalar( 0.05 ) } );

		}

	}

	update( deltaTime ) {

		this.tick += deltaTime;

		for ( let i = 0; i < this.numSpineInstances; i++ ) {

			let t = i / this.numSpineInstances;
			let segmentI = Math.floor( t * this.agentTrail.numSegments );
			let segmentT = t * this.agentTrail.numSegments - Math.floor( t * this.agentTrail.numSegments );
			let data = this.spineElemData[ i ];

			if ( segmentI < this.agentTrail.numSegments - 1 ) {

				this.pos.copy( this.agentTrail.segments[ segmentI ] ).lerp( this.agentTrail.segments[ segmentI + 1 ], segmentT );

			} else {

				this.pos.copy( this.agentTrail.segments[ segmentI ] );

			}


			if ( segmentI == 0 ) {

				this.vec2.copy( this.pos );
				this.vec2.add( this.vec1.copy( this.agentTrail.segments[ 0 ] ).sub( this.agentTrail.segments[ 1 ] ).normalize() );

			} else {

				this.vec2.copy( this.pos );
				this.vec2.add( this.vec1.copy( this.agentTrail.segments[ segmentI - 1 ] ).sub( this.agentTrail.segments[ segmentI ] ).normalize() );

			}

			this.matRot4.lookAt( this.pos, this.vec2, this.up );
			this.q1.setFromRotationMatrix( this.matRot4 );

			let scXY = THREE.MathUtils.smoothstep( t, 0, 0.1 ) * ( 1.0 - THREE.MathUtils.smoothstep( t, 0.9, 1.0 ) ) * 1.0;
			//let sc = scXY + Math.sin( t * Math.PI * 40.0 + this.tick * 5.0 ) * 0.7;
			let sc = scXY;
			this.scale.setScalar( sc );
			//this.scale.set( scXY, scXY, 1.0 );

			this.vec3.copy( data.rnd ).multiplyScalar( scXY + Math.sin( t * Math.PI * -2.0 ) * 0.7 );
			this.pos.add( this.vec3 );

			this.mat4.compose( this.pos, this.q1, this.scale );

			this.spineMesh.setMatrixAt( i, this.mat4 );
			this.spineMesh.instanceMatrix.needsUpdate = true;

		}

	}

}



