import * as THREE from './libs/three.module.js';

export class AgentWander {

	agentPoint;
	agentLookat;
	agentMarker;

	boundingSphereRadius = 0.5;
	boundingForce;
	boundingForceMult = 1;

	currentPosition;
	currentVelocity;
	centerPoint;

	//wander steering
	wanderSphereDistance = 2;
	wanderSphereRadius = 0.1;
	wanderAngleMaxChange = 1;
	wanderBoundsAngleMaxChange = 1;
	wanderAngle; //quaternion
	wanderSphereCenter;
	wanderForce;

	//max velocity and max velocity squared
	maxVelocity = 0.01;
	maxVelocitySq;
	//max steering force per frame
	maxSteeringForce = 5;

	//cache vectors
	vec1 = new THREE.Vector3();
	vec2 = new THREE.Vector3();
	vec3 = new THREE.Vector3();
	vec4 = new THREE.Vector3();

	q1 = new THREE.Quaternion();

	forward = new THREE.Vector3( 0, 0, 1.0 );

	constructor( main ) {

		this.main = main;
		this.initAgent();

	}

	initAgent() {

		this.agentPoint = new THREE.Vector3();
		this.agentPoint.set( 0.05, 0.05, 0.05 );

		this.agentLookat = new THREE.Object3D();

		//init current position/velocity to zero
		this.currentPosition = new THREE.Vector3();

		//center of sim
		this.centerPoint = new THREE.Vector3();

		//init velocity to random direction
		this.currentVelocity = new THREE.Vector3().randomDirection().multiplyScalar( this.maxVelocity );
		this.maxVelocitySq = this.maxVelocity * this.maxVelocity;

		//init bounding force to zero
		this.boundingForce = new THREE.Vector3();

		//init wander angle quaternion to random direction
		this.wanderAngle = new THREE.Quaternion().random();
		this.wanderSphereCenter = new THREE.Vector3();
		this.wanderForce = new THREE.Vector3();
		this.wanderDir = new THREE.Vector3();

		this.initAgentMarker();

	}

	initAgentMarker() {

		const markerSize = 0.04;
		const geo = new THREE.BoxGeometry( markerSize, markerSize, markerSize );
		const mat = new THREE.MeshBasicMaterial( { color: 0x00FFFF } );
		this.agentMarker = new THREE.Mesh( geo, mat );
		this.main.faceFront.add( this.agentMarker );

	}

	update( deltaTime ) {
	
		this.agentLookat.position.copy( this.agentPoint );

		this.vec1.copy( this.agentPoint );

		//check if we're outside bounding sphere, if so calculate force back to center point
		//the farther past the sphere, the higher the force
		let distanceFromCenter = this.vec1.sub( this.centerPoint ).length();
		if ( distanceFromCenter > this.boundingSphereRadius ) {

			//( centerPoint - agentPoint ) * ( distanceFromCenter - boundingSphereRadius )
			this.boundingForce.copy( this.centerPoint ).sub( this.agentPoint ).multiplyScalar( distanceFromCenter - this.boundingSphereRadius );

			this.agentLookat.lookAt( this.centerPoint );
			this.wanderAngle.rotateTowards( this.agentLookat.quaternion, this.wanderAngleMaxChange * deltaTime );

		} else {

			this.boundingForce.setScalar( 0 );

		}

		//dampen bounding force
		this.boundingForce.multiplyScalar( this.boundingForceMult );

		this.wanderSphereCenter.copy( this.currentVelocity ).normalize().multiplyScalar( this.wanderSphereDistance );
		this.q1.random();
		this.wanderAngle.rotateTowards( this.q1, this.wanderAngleMaxChange * deltaTime );
		this.wanderForce.setScalar( 0 );
		this.wanderDir.copy( this.forward ).applyQuaternion( this.wanderAngle ).multiplyScalar( this.wanderSphereRadius );
		this.wanderForce.copy( this.wanderSphereCenter ).add( this.wanderDir );
		this.wanderForce.clampLength( 0, this.maxSteeringForce );

		this.vec1.copy( this.wanderForce ).multiplyScalar( deltaTime );
		this.currentVelocity.add( this.vec1 );
		this.vec1.copy( this.boundingForce ).multiplyScalar( deltaTime );
		this.currentVelocity.add( this.vec1 );
		this.currentVelocity.clampLength( 0, this.maxVelocity );

		this.agentPoint.add( this.currentVelocity );

		this.agentMarker.position.copy( this.agentPoint );

	}

}