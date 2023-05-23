import * as THREE from './libs/three.module.js';

export class AgentVisBottom {

	faceGroup;
	agents;

	elemScale = 0.01;

	numSpineInstances = 2048;

	visAgents = [];
	cols = [ 0xFFFFFF, 0x000000 ];

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

	constructor( faceGroup, agents ) {

		this.faceGroup = faceGroup;
		this.agents = agents;

		this.initLighting();

		for ( let i = 0; i < this.agents.length; i++ ) {

			this.initAgentVis( this.agents[ i ], this.cols[ i ] );

		}
		
	}

	initLighting() {

		const frontLight = new THREE.DirectionalLight( 0xffffff, 0.8 );
		frontLight.position.set( 0, 1.0, 1.0 );
		this.faceGroup.add( frontLight );
		const frontAmbLight = new THREE.HemisphereLight( 0xFF0000, 0x0000FF, 0.5 );
		this.faceGroup.add( frontAmbLight );

	}

	initAgentVis( agent, col ) {

		const scale = this.elemScale;
		const scaleMult = 2.0;
		//const geo = new THREE.BoxGeometry( scale, scale, scale );
		const geo = new THREE.IcosahedronGeometry( scale, 2 );
		const mat = new THREE.MeshStandardMaterial( { color: col } );
		mat.roughness = 0.3;
		mat.metalness = 0;

		const visMesh = new THREE.InstancedMesh( geo, mat, this.numSpineInstances );
		visMesh.instanceMatrix.setUsage( THREE.StreamDrawUsage );
		this.faceGroup.add( visMesh );

		const agentData = { agent: agent, mesh: visMesh, elemData: [] };
		for ( let i = 0; i < this.numSpineInstances; i++ ) {

			agentData.elemData.push( { rnd: new THREE.Vector3().randomDirection().multiplyScalar( 0.05 ) } );

		}
		this.visAgents.push( agentData );

	}

	update( deltaTime ) {

		this.tick += deltaTime;

		let visAgent;
		for ( let j = 0; j < this.visAgents.length; j++ ) {

			visAgent = this.visAgents[ j ];

			for ( let i = 0; i < this.numSpineInstances; i++ ) {

				let t = i / this.numSpineInstances;
				let segmentI = Math.floor( t * visAgent.agent.trail.numSegments );
				let segmentT = t * visAgent.agent.trail.numSegments - Math.floor( t * visAgent.agent.trail.numSegments );
				let data = visAgent.elemData[ i ];

				if ( segmentI < visAgent.agent.trail.numSegments - 1 ) {

					this.pos.copy( visAgent.agent.trail.segments[ segmentI ] ).lerp( visAgent.agent.trail.segments[ segmentI + 1 ], segmentT );

				} else {

					this.pos.copy( visAgent.agent.trail.segments[ segmentI ] );

				}


				if ( segmentI == 0 ) {

					this.vec2.copy( this.pos );
					this.vec2.add( this.vec1.copy( visAgent.agent.trail.segments[ 0 ] ).sub( visAgent.agent.trail.segments[ 1 ] ).normalize() );

				} else {

					this.vec2.copy( this.pos );
					this.vec2.add( this.vec1.copy( visAgent.agent.trail.segments[ segmentI - 1 ] ).sub( visAgent.agent.trail.segments[ segmentI ] ).normalize() );

				}

				this.matRot4.lookAt( this.pos, this.vec2, this.up );
				this.q1.setFromRotationMatrix( this.matRot4 );

				let scXY = THREE.MathUtils.smoothstep( t, 0, 0.1 ) * ( 1.0 - THREE.MathUtils.smoothstep( t, 0.9, 1.0 ) ) * 1.0;
				let sc = Math.max( scXY + Math.sin( t * Math.PI * 2 * 30.0 + this.tick * -3.0 ) * ( scXY * 0.9 ), 0.3 );
				this.scale.setScalar( sc );

				let rndMult = Math.max ( scXY + Math.sin( t * Math.PI * 4 ) * 0.4 + Math.sin( t * Math.PI * 5 - this.tick * 4.0 ) * 0.4, 0.1 );
				this.vec3.copy( data.rnd ).multiplyScalar( rndMult );
				this.pos.add( this.vec3 );

				this.mat4.compose( this.pos, this.q1, this.scale );

				visAgent.mesh.setMatrixAt( i, this.mat4 );
				visAgent.mesh.instanceMatrix.needsUpdate = true;

			}
		}
	}

}



