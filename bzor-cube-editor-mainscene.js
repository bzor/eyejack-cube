//wander settings
const wanderSettings = {};
wanderSettings.boundingSphereRadius = 0.5;
wanderSettings.boundingForceMult = 1;
wanderSettings.wanderSphereDistance = 0.1;
wanderSettings.wanderSphereRadius = 8;
wanderSettings.wanderAngleMaxChange = 12;
wanderSettings.wanderBoundsAngleMaxChange = 8;
wanderSettings.maxVelocity = 0.008;
wanderSettings.maxSteeringForce = 8;
wanderSettings.trailAvoidDist = 0.04;
wanderSettings.trailDropDelay = 0.015;
wanderSettings.numTrailSegments = 256;
wanderSettings.dustAvoidDist = 0.04;

const agents = [];
const agentVizs = [];

const numDust = 4096;
let dust;

function init() {

	console.log( "init main" );
	let agentData1 = { wander: createWander( this ), id: 0 };
	agents.push( agentData1 );
	let agentData2 = { wander: createWander( this ), id: 1 };
	agents.push( agentData2 );

	agentVizs.push( vis1( this.getObjectByName( "faceFront" ) ) );
	agentVizs.push( vis2( this.getObjectByName( "faceLeft" ) ) );
	agentVizs.push( vis3( this.getObjectByName( "faceTop" ) ) );
	
	dust = createDust();
	this.getObjectByName( "faceFront" ).add( dust.mesh );
	
}

function update( event ) {

	const deltaTime = event.delta * 0.001;
	const time = event.time;

	for ( let i = 0; i < agents.length; i++ ) {
	
		updateAgent( agents[ i ], deltaTime );
		
	}
	
	for ( let i = 0; i < agentVizs.length; i++ ) {
		
		agentVizs[ i ].update( deltaTime, time );
		
	}
	
	updateDust( deltaTime );
	
}

function updateAgent( agentData, deltaTime ) {

	const wander = agentData.wander;
	
	wander.agentLookat.position.copy( wander.agentPoint );

	wander.vec1.copy( wander.agentPoint );

	let distanceFromCenter = wander.vec1.sub( wander.centerPoint ).length();
	if ( distanceFromCenter > wanderSettings.boundingSphereRadius ) {

		wander.agentLookat.lookAt( wander.centerPoint );
		wander.wanderAngle.rotateTowards( wander.agentLookat.quaternion, wanderSettings.wanderBoundsAngleMaxChange * deltaTime );

	} else {

		wander.boundingForce.setScalar( 0 );

	}

	//attract heads
	wander.trailAvoidForce.setScalar( 0 );
	for ( let i = 0; i < agents.length; i++ ) {

		let agent = agents[ i ];
		if ( agent.wander == wander ) {

			continue;

		}

		let attactMult = 3;
		wander.vec1.copy( agent.wander.agentPoint ).sub( wander.agentPoint ).normalize().multiplyScalar( attactMult );
		wander.trailAvoidForce.add( wander.vec1 );

	}

	//avoid trails
	for ( let i = 0; i < agents.length; i++ ) {

		let agent = agents[ i ];
		
		let jStart = ( i == agents[ i ].id ) ? Math.floor( wanderSettings.numTrailSegments ) * 0.5 : 0;

		for ( let j = 0; j < wanderSettings.numTrailSegments; j++ ) {

			wander.vec1.copy( agent.wander.trailSegments[ j ] );
			let dist = wander.vec1.distanceToSquared( wander.agentPoint );
			if ( dist < wanderSettings.trailAvoidDist ) {
				
				let forceMult = ( wanderSettings.trailAvoidDist - dist ) * 50.0;
				wander.vec1.copy( wander.agentPoint ).sub( agent.wander.trailSegments[ j ] ).normalize().multiplyScalar( forceMult );
				wander.trailAvoidForce.add( wander.vec1 );

			}	

		}

	}

	wander.wanderSphereCenter.copy( wander.currentVelocity ).normalize().multiplyScalar( wanderSettings.wanderSphereDistance );
	wander.q1.random();
	wander.wanderAngle.rotateTowards( wander.q1, wanderSettings.wanderAngleMaxChange * deltaTime );
	wander.wanderForce.setScalar( 0 );
	wander.wanderDir.copy( wander.forward ).applyQuaternion( wander.wanderAngle ).multiplyScalar( wanderSettings.wanderSphereRadius );
	wander.wanderForce.copy( wander.wanderSphereCenter ).add( wander.wanderDir );
	wander.wanderForce.clampLength( 0, wanderSettings.maxSteeringForce );

	wander.wanderForce.add( wander.trailAvoidForce );
	wander.vec1.copy( wander.wanderForce ).multiplyScalar( deltaTime );
	wander.currentVelocity.add( wander.vec1 );
	wander.vec1.copy( wander.boundingForce ).multiplyScalar( deltaTime );
	wander.currentVelocity.add( wander.vec1 );
	wander.currentVelocity.clampLength( 0, wanderSettings.maxVelocity );

	wander.agentPoint.add( wander.currentVelocity );
	
	wander.trailDropTick += deltaTime;
	if ( wander.trailDropTick > wanderSettings.trailDropDelay ) {
	
		wander.trailDropTick = 0;

		for( let i = wanderSettings.numTrailSegments - 1; i > 0; i-- ) {

			wander.trailSegments[ i ].copy( wander.trailSegments[ i - 1 ] );

		}
		wander.trailSegments[ 0 ].copy( wander.agentPoint );
		
	}
	
}

function createWander( scene ) {

	const wander = {};
	
	wander.vec1 = new THREE.Vector3();
	wander.vec2 = new THREE.Vector3();
	wander.vec3 = new THREE.Vector3();
	wander.vec4 = new THREE.Vector3();
	wander.q1 = new THREE.Quaternion();
	wander.forward = new THREE.Vector3( 0, 0, 1.0 );
	
	wander.agentPoint = new THREE.Vector3(  0.05, 0.05, 0.05 );
	wander.agentLookat = new THREE.Object3D();
	
	wander.currentPosition = new THREE.Vector3();

	wander.centerPoint = new THREE.Vector3();

	wander.currentVelocity = new THREE.Vector3().randomDirection().multiplyScalar( wanderSettings.maxVelocity );
	wander.maxVelocitySq = wanderSettings.maxVelocity * wanderSettings.maxVelocity;

	wander.boundingForce = new THREE.Vector3();

	wander.wanderAngle = new THREE.Quaternion().random();
	wander.wanderSphereCenter = new THREE.Vector3();
	wander.wanderForce = new THREE.Vector3();
	wander.wanderDir = new THREE.Vector3();

	wander.trailAvoidDist = wanderSettings.trailAvoidDist * wanderSettings.trailAvoidDist;
	wander.trailAvoidForce = new THREE.Vector3();
	wander.trailDropTick = 0;
	wander.numTrailSegments = wanderSettings.numTrailSegments;
	wander.trailSegments = [];
	for ( let i = 0; i < wanderSettings.numTrailSegments; i++ ) {
		
		wander.trailSegments.push( new THREE.Vector3() );
		
	}	
				
	return wander;
	
}

//
//dust
//
/*
const dustVert = `

uniform vec3 col;
uniform float pixelRatio;
varying vec3 vCol;

void main() {

	vec4 vPos = vec4( position, 1.0 );
    vec4 worldPos = modelMatrix * vPos;
    vec4 viewPos = viewMatrix * worldPos;
	
	vCol = col;
	gl_PointSize = ( 300.0 / -viewPos.z ) * 0.024 * pixelRatio;
    gl_Position = projectionMatrix * viewPos;

}
`;

const dustFrag = `

uniform float uTime;
varying vec3 vCol;

void main() {

	if ( length( gl_PointCoord - vec2( 0.5, 0.5 ) ) > 0.475 ) discard;
    gl_FragColor = sRGBToLinear( vec4( vCol, 1.0 ) );

}
`;
*/

const dustVert = `

attribute vec3 iPos;
uniform vec3 col;
varying vec3 vCol;

void main() {

	vec3 pos = position;	
	vec4 vPos = vec4( pos + iPos, 1.0 );
    vec4 imPos = instanceMatrix * vPos;
    vec4 worldPos = modelMatrix * imPos;
    vec4 viewPos = viewMatrix * worldPos;
	
	vCol = col;
	
    gl_Position = projectionMatrix * viewPos;

}
`;

const dustFrag = `

varying vec3 vCol;

void main() {

	vec4 col = vec4( vCol, 1.0 );
    gl_FragColor = col;

}
`;

function createDust() {

	const dust = {};
	const geo = new THREE.BufferGeometry();

	const points = new Float32Array( numDust * 3 );

	const velocities = [];
	let v = new THREE.Vector3();
	for ( let i = 0; i < numDust; i++ ) {
		
		let x = THREE.MathUtils.randFloatSpread( 1.0 );
		let y = THREE.MathUtils.randFloatSpread( 1.0 );
		let z = THREE.MathUtils.randFloatSpread( 1.0 );
		
		points[ i * 3 ] = x;
		points[ i * 3 + 1 ] = y;
		points[ i * 3 + 2 ] = z;
		
		v.randomDirection().multiplyScalar( 0.02 );
		velocities.push( v.clone() );
		
	}
					 
	const mat = new THREE.ShaderMaterial( { uniforms: { col: { value: new THREE.Color( 0x282037 ) }, pixelRatio: { value: window.devicePixelRatio } }, vertexShader: dustVert, fragmentShader: dustFrag } );
	mat.blending = THREE.AdditiveBlending;
	
	const dustGeo = new THREE.IcosahedronGeometry( 0.0025, 0 );
	const dustMesh = new THREE.InstancedMesh( dustGeo, mat, numDust );

	dustGeo.setAttribute( 'iPos', new THREE.InstancedBufferAttribute( points, 3 ) );

	//const dustPoints = new THREE.Points( geo, mat );
	//dust.points = dustPoints;
	dust.mesh = dustMesh;
	dust.geo = dustGeo;
	dust.mat = mat;
	dust.velocities = velocities;
	dust.pos = new THREE.Vector3();
	dust.vec1 = new THREE.Vector3();
	dust.moveForce = new THREE.Vector3();

	return dust;
		
}

function updateDust( deltaTime ) {

	//const posAttribute = dust.geo.getAttribute( "position" );
	const posAttribute = dust.geo.getAttribute( "iPos" );
	
	const border = 0.5;
	
	for ( let i = 0; i < numDust; i++ ) {
		
		let x = posAttribute.array[ i * 3 ];
		let y = posAttribute.array[ i * 3 + 1 ];
		let z = posAttribute.array[ i * 3 + 2 ];
		
		let v = dust.velocities[ i ];

		if ( x < -border ) {
			
			v.x = Math.abs( v.x );
			
		} else if ( x > border ) {
			
			v.x = -Math.abs( v.x );
			
		}

		if ( y < -border ) {
			
			v.y = Math.abs( v.y );
			
		} else if ( y > border ) {
			
			v.y = -Math.abs( v.y );
			
		}
		
		if ( z < -border ) {
			
			v.z = Math.abs( v.z );
			
		} else if ( z > border ) {
			
			v.z = -Math.abs( v.z );
			
		}
		
		dust.moveForce.set( 0.0, 0.0, 0.0 );
		for ( let i = 0; i < agents.length; i++ ) {

			let agent = agents[ i ];

			for ( let j = 0; j < wanderSettings.numTrailSegments; j++ ) {

				dust.pos.set( x, y, z );
				dust.vec1.copy( agent.wander.trailSegments[ j ] );
				let dist = dust.vec1.distanceToSquared( dust.pos );
				if ( dist < wanderSettings.dustAvoidDist ) {

					let forceMult = ( wanderSettings.dustAvoidDist - dist ) * 0.4;
					dust.vec1.copy( dust.pos ).sub( agent.wander.trailSegments[ j ] ).normalize().multiplyScalar( forceMult );
					dust.moveForce.add( dust.vec1 );

				}	

			}

		}
		
		dust.vec1.copy( v ).add( dust.moveForce );
		
		x += dust.vec1.x * deltaTime;
		y += dust.vec1.y * deltaTime;
		z += dust.vec1.z * deltaTime;
		posAttribute.setXYZ( i, x, y, z );
		
	}	
	posAttribute.needsUpdate = true;
	
}

//
//vis1 - front/back
//

const vis1SpikeVert = `

uniform vec3 col1;
varying vec3 vCol;

void main() {

	vec4 vPos = vec4( position, 1.0 );
    vec4 iPos = instanceMatrix * vPos;
    vec4 worldPos = modelMatrix * iPos;
    vec4 viewPos = viewMatrix * worldPos;
	
	float fade = 0.7;
	//vCol = mix( col2 * fade, col1 * fade, smoothstep( -0.8, 1.2, worldPos.z ) );
	vCol = col1 * smoothstep( 0.05, 0.09, vPos.y );
    gl_Position = projectionMatrix * viewPos;

}
`;

const vis1SpikeFrag = `

uniform float uTime;
varying vec3 vCol;

void main() {

    gl_FragColor = vec4( vCol, 1.0 );

}
`;

const vis1BodyVert = `

#define PI 3.141592653589793
attribute vec3 rndPos;
attribute vec3 dir;
attribute float t;
uniform vec3 col1;
uniform vec3 col2;
uniform float uTime;
varying vec3 vCol;

void main() {

	float scXY = smoothstep( 0.0, 0.1, t ) * ( 1.0 - smoothstep( 0.9, 1.0, t ) ) * 0.4;
	float sc = max( scXY + sin( t * PI * 2.0 * 30.0 + uTime * -3.0 ) * ( scXY * 0.9 ), 0.3 );
	
	vec3 pos = position;
	pos *= sc;
	
	float rndMult = max ( scXY + sin( t * PI * 4.0 ) * 0.4 + sin( t * PI * 5.0 - uTime * 4.0 ) * 0.4, 0.1 );

	vec4 vPos = vec4( pos + rndPos * rndMult, 1.0 );
	
    vec4 iPos = instanceMatrix * vPos;
    vec4 worldPos = modelMatrix * iPos;
    vec4 viewPos = viewMatrix * worldPos;
	
	vCol = mix( col1, col2, smoothstep( -0.5, 0.5, dot( cameraPosition - worldPos.xyz, dir ) ) );
	
    gl_Position = projectionMatrix * viewPos;

}
`;

const vis1BodyFrag = `

uniform float uTime;

varying vec3 vCol;

void main() {

    gl_FragColor = vec4( vCol, 1.0 );

}
`;



function vis1( faceGroup ) {
		
	//vis
	const vis = {};
	
	vis.spineElemR = 0.01;
	vis.spineElemH = 0.04;
	vis.bodyElemScale = 0.02;
	vis.numSpineInstances = 1024;
	vis.numBodyInstances = 512;
	vis.numSpineLoops = 323;
	vis.visAgents = [];
	vis.cols = [ 0xdf4266, 0xd246d8 ];
	vis.bodyCols = [ 0x43adc8, 0xc84f43 ];
	
	vis.pos = new THREE.Vector3();
	vis.vec1 = new THREE.Vector3();
	vis.vec2 = new THREE.Vector3();
	vis.vec3 = new THREE.Vector3();
	vis.mat3 = new THREE.Matrix3();
	vis.mat4 = new THREE.Matrix4();
	vis.matRot4 = new THREE.Matrix4();
	vis.q1 = new THREE.Quaternion();
	vis.q2 = new THREE.Quaternion();
	vis.q3 = new THREE.Quaternion();
	vis.scale = new THREE.Vector3();
	vis.forward = new THREE.Vector3( 0, 0, 1.0 );
	vis.up = new THREE.Vector3( 0, 1.0, 0 );

	vis.tick = 0;
	
	vis.faceGroup = faceGroup;
	
	for ( let i = 0; i < agents.length; i++ ) {

		const geo = new THREE.ConeGeometry( vis.spineElemR, vis.spineElemH, 5, 1 );
		geo.translate( 0, vis.spineElemH * 0.5 + 0.05, 0 );
		
		const spikeUniforms = {
			"col1": { value: new THREE.Color( vis.cols[ i ] ) },
		};
		const mat = new THREE.ShaderMaterial( { uniforms: spikeUniforms, vertexShader: vis1SpikeVert, fragmentShader: vis1SpikeFrag } );
		mat.blending = THREE.AdditiveBlending;
		//const mat = new THREE.MeshBasicMaterial( { color: vis.cols[ i ] } );

		const spikeMesh = new THREE.InstancedMesh( geo, mat, vis.numSpineInstances );
		spikeMesh.instanceMatrix.setUsage( THREE.StreamDrawUsage );
		faceGroup.add( spikeMesh );

		const bodyUniforms = {
			"col1": { value: new THREE.Color( vis.bodyCols[ i ] ) },
			"col2": { value: new THREE.Color( vis.bodyCols[ 1 - i ] ) },
			"uTime": { value: 0 }
		};
		const bodyMat = new THREE.ShaderMaterial( { uniforms: bodyUniforms, vertexShader: vis1BodyVert, fragmentShader: vis1BodyFrag } );
		bodyMat.blending = THREE.AdditiveBlending;

		const bodyGeo = new THREE.IcosahedronGeometry( vis.bodyElemScale, 0 );
		const bodyMesh = new THREE.InstancedMesh( bodyGeo, bodyMat, vis.numBodyInstances );
		bodyMesh.instanceMatrix.setUsage( THREE.StreamDrawUsage );
		faceGroup.add( bodyMesh );		

		const agentData = { agent: agents[ i ], spikeMesh: spikeMesh, bodyMesh: bodyMesh, bodyUniforms: bodyUniforms, spikeData: [] };
								
		for ( let i = 0; i < vis.numSpineInstances; i++ ) {

			agentData.spikeData.push( { q: new THREE.Quaternion() } );

		}
		
		const bodyDirs = new Float32Array( vis.numBodyInstances * 3 );
		const bodyRndPos = new Float32Array( vis.numBodyInstances * 3 );
		const bodyT = new Float32Array( vis.numBodyInstances );
		for ( let i = 0; i < vis.numBodyInstances; i++ ) {

			let rnd = new THREE.Vector3().randomDirection().multiplyScalar( 0.05 );
			bodyRndPos[ i * 3 ] = rnd.x;
			bodyRndPos[ i * 3 + 1 ] = rnd.y;
			bodyRndPos[ i * 3 + 2 ] = rnd.z;
			bodyDirs[ i * 3 ] = 0;
			bodyDirs[ i * 3 + 1 ] = 0;
			bodyDirs[ i * 3 + 2 ] = 0;

			bodyT[ i ] = i / ( vis.numBodyInstances - 1 );

		}
		
		bodyGeo.setAttribute( 'dir', new THREE.InstancedBufferAttribute( bodyDirs, 3 ) );
		bodyGeo.setAttribute( 'rndPos', new THREE.InstancedBufferAttribute( bodyRndPos, 3 ) );
		bodyGeo.setAttribute( 't', new THREE.InstancedBufferAttribute( bodyT, 1 ) );
				
		vis.visAgents.push( agentData );
		
	}
	
	vis.update = function( deltaTime, time ) {

		this.tick += deltaTime;
		
		let visAgent, visAgentWander;
		for ( let j = 0; j < vis.visAgents.length; j++ ) {
			
			visAgent = this.visAgents[ j ];
			visAgentWander = visAgent.agent.wander;
			visAgent.bodyUniforms.uTime.value = this.tick;
			
			for ( let i = 0; i < this.numSpineInstances; i++ ) {

				let t = i / this.numSpineInstances;
				let segmentI = Math.floor( t * visAgentWander.numTrailSegments );
				let segmentT = t * visAgentWander.numTrailSegments - Math.floor( t * visAgentWander.numTrailSegments );
				let spikeData = visAgent.spikeData[ i ];

				if ( segmentI < visAgentWander.numTrailSegments - 1 ) {

					this.pos.copy( visAgentWander.trailSegments[ segmentI ] ).lerp( visAgentWander.trailSegments[ segmentI + 1 ], segmentT );

				} else {

					this.pos.copy( visAgentWander.trailSegments[ segmentI ] );

				}


				if ( segmentI == 0 ) {

					this.vec2.copy( this.pos );
					this.vec2.add( this.vec1.copy( visAgentWander.trailSegments[ 0 ] ).sub( visAgentWander.trailSegments[ 1 ] ).normalize() );

				} else {

					this.vec2.copy( this.pos );
					this.vec2.add( this.vec1.copy( visAgentWander.trailSegments[ segmentI - 1 ] ).sub( visAgentWander.trailSegments[ segmentI ] ).normalize() );

				}

				this.matRot4.lookAt( this.pos, this.vec2, this.up );
				this.q1.setFromRotationMatrix( this.matRot4 );
				
				this.q2.setFromAxisAngle( this.forward, t * Math.PI * 2 * this.numSpineLoops + this.tick * 1.0 );
				this.q1.multiply( this.q2 );
				
				spikeData.q.slerp( this.q1, deltaTime * 2.0 );

				let scXY = THREE.MathUtils.smoothstep( t, 0, 0.1 ) * ( 1.0 - THREE.MathUtils.smoothstep( t, 0.9, 1.0 ) ) * 1.0;
				let sc = Math.max( scXY + Math.sin( t * Math.PI * 2 * 30.0 + this.tick * -3.0 ) * ( scXY * 0.9 ), 0.3 );
				sc = scXY;
				this.scale.setScalar( sc );

				let rndMult = Math.max ( scXY + Math.sin( t * Math.PI * 4 ) * 0.4 + Math.sin( t * Math.PI * 5 - this.tick * 4.0 ) * 0.4, 0.1 );

				this.mat4.compose( this.pos, spikeData.q, this.scale );

				visAgent.spikeMesh.setMatrixAt( i, this.mat4 );

			}
			
			
			let bodyDirs = visAgent.bodyMesh.geometry.getAttribute( "dir" );
			
			for ( let i = 0; i < this.numBodyInstances; i++ ) {

				let t = i / this.numBodyInstances;
				let segmentI = Math.floor( t * visAgentWander.numTrailSegments );
				let segmentT = t * visAgentWander.numTrailSegments - Math.floor( t * visAgentWander.numTrailSegments );

				if ( segmentI < visAgentWander.numTrailSegments - 1 ) {

					this.pos.copy( visAgentWander.trailSegments[ segmentI ] ).lerp( visAgentWander.trailSegments[ segmentI + 1 ], segmentT );

				} else {

					this.pos.copy( visAgentWander.trailSegments[ segmentI ] );

				}


				if ( segmentI == 0 ) {

					this.vec2.copy( this.pos );
					this.vec2.add( this.vec1.copy( visAgentWander.trailSegments[ 0 ] ).sub( visAgentWander.trailSegments[ 1 ] ).normalize() );

				} else {

					this.vec2.copy( this.pos );
					this.vec2.add( this.vec1.copy( visAgentWander.trailSegments[ segmentI - 1 ] ).sub( visAgentWander.trailSegments[ segmentI ] ).normalize() );

				}
				bodyDirs.setXYZ( i, this.vec2.x, this.vec2.y, this.vec2.z );
				
				this.scale.setScalar( 1.0 );
				this.mat4.compose( this.pos, this.q3, this.scale );

				visAgent.bodyMesh.setMatrixAt( i, this.mat4 );				

			}			

			visAgent.spikeMesh.instanceMatrix.needsUpdate = true;
			visAgent.bodyMesh.instanceMatrix.needsUpdate = true;
			bodyDirs.needsUpdate = true;			

		}
		
	}

	return vis;
	
}


//
//vis2 - left/right
//

const vis2SpikeVert = `

uniform vec3 col1;
uniform vec3 col2;
varying vec3 vCol;

void main() {

    vec3 pos = ( instanceMatrix * vec4( position, 1.0 ) ).xyz;
    vec3 worldPos = ( modelMatrix * vec4( pos, 1.0 ) ).xyz;
    vec4 mvPosition = viewMatrix * vec4( worldPos, 1.0 );
	
	vCol = mix( col2, col1, smoothstep( -0.8, 1.2, worldPos.z ) );
    gl_Position = projectionMatrix * mvPosition;

}
`;

const vis2SpikeFrag = `

uniform float uTime;

varying vec3 vCol;

void main() {

    gl_FragColor = vec4( vCol, 1.0 );

}
`;


function vis2( faceGroup ) {
	
	//front lighting
	const frontLight = new THREE.DirectionalLight( 0xffffff, 0.8 );
	frontLight.position.set( 0, 1.0, 1.0 );
	faceGroup.add( frontLight );
	const frontAmbLight = new THREE.HemisphereLight( 0xFF0000, 0x0000FF, 0.5 );
	faceGroup.add( frontAmbLight );
	
	//vis
	const vis = {};
	
	vis.elemScale = 0.04;
	vis.bodyElemScale = 0.01;
	vis.numSpineInstances = 512;
	
	vis.visAgents = [];
	vis.cols = [ 0xFF00FF, 0x00FFFF ];
	
	vis.pos = new THREE.Vector3();
	vis.vec1 = new THREE.Vector3();
	vis.vec2 = new THREE.Vector3();
	vis.vec3 = new THREE.Vector3();
	vis.mat3 = new THREE.Matrix3();
	vis.mat4 = new THREE.Matrix4();
	vis.matRot4 = new THREE.Matrix4();
	vis.q1 = new THREE.Quaternion();
	vis.q2 = new THREE.Quaternion();
	vis.scale = new THREE.Vector3();
	vis.forward = new THREE.Vector3( 0, 0, 1.0 );
	vis.up = new THREE.Vector3( 0, 1.0, 0 );

	vis.tick = 0;
	
	vis.faceGroup = faceGroup;
	
	for ( let i = 0; i < agents.length; i++ ) {

		const geo = new THREE.ConeGeometry( vis.elemScale, vis.elemScale * 2.0, 3, 1 );
		geo.translate( 0, vis.elemScale * 2.0, 0 );
		
		const spikeUniforms = {
			"col1": { value: new THREE.Color( vis.cols[ i ] ) },
			"col2": { value: new THREE.Color( 0x000000 ) },
		};
		const mat = new THREE.ShaderMaterial( { uniforms: spikeUniforms, vertexShader: vis2SpikeVert, fragmentShader: vis2SpikeFrag } );
		//const mat = new THREE.MeshBasicMaterial( { color: vis.cols[ i ] } );

		const visMesh = new THREE.InstancedMesh( geo, mat, vis.numSpineInstances );
		visMesh.instanceMatrix.setUsage( THREE.StreamDrawUsage );
		faceGroup.add( visMesh );

		const agentData = { agent: agents[ i ], mesh: visMesh, elemData: [] };
		for ( let i = 0; i < vis.numSpineInstances; i++ ) {

			agentData.elemData.push( { rnd: new THREE.Vector3().randomDirection().multiplyScalar( 0.05 ), q: new THREE.Quaternion() } );

		}
		
		vis.visAgents.push( agentData );
		
	}
	
	vis.update = function( deltaTime, time ) {

		this.tick += deltaTime;
		
		let visAgent, visAgentWander;
		for ( let j = 0; j < vis.visAgents.length; j++ ) {
			
			visAgent = this.visAgents[ j ];
			visAgentWander = visAgent.agent.wander;
			
			for ( let i = 0; i < this.numSpineInstances; i++ ) {

				let t = i / this.numSpineInstances;
				let segmentI = Math.floor( t * visAgentWander.numTrailSegments );
				let segmentT = t * visAgentWander.numTrailSegments - Math.floor( t * visAgentWander.numTrailSegments );
				let data = visAgent.elemData[ i ];

				if ( segmentI < visAgentWander.numTrailSegments - 1 ) {

					this.pos.copy( visAgentWander.trailSegments[ segmentI ] ).lerp( visAgentWander.trailSegments[ segmentI + 1 ], segmentT );

				} else {

					this.pos.copy( visAgentWander.trailSegments[ segmentI ] );

				}


				if ( segmentI == 0 ) {

					this.vec2.copy( this.pos );
					this.vec2.add( this.vec1.copy( visAgentWander.trailSegments[ 0 ] ).sub( visAgentWander.trailSegments[ 1 ] ).normalize() );

				} else {

					this.vec2.copy( this.pos );
					this.vec2.add( this.vec1.copy( visAgentWander.trailSegments[ segmentI - 1 ] ).sub( visAgentWander.trailSegments[ segmentI ] ).normalize() );

				}

				this.matRot4.lookAt( this.pos, this.vec2, this.up );
				this.q1.setFromRotationMatrix( this.matRot4 );
				
				this.q2.setFromAxisAngle( this.forward, t * Math.PI * 2 * 4 + this.tick * 5.0 );
				this.q1.multiply( this.q2 );
				
				data.q.slerp( this.q1, deltaTime * 2.0 );

				let scXY = THREE.MathUtils.smoothstep( t, 0, 0.1 ) * ( 1.0 - THREE.MathUtils.smoothstep( t, 0.9, 1.0 ) ) * 1.0;
				let sc = Math.max( scXY + Math.sin( t * Math.PI * 2 * 30.0 + this.tick * -3.0 ) * ( scXY * 0.9 ), 0.3 );
				sc = scXY;
				this.scale.setScalar( sc );

				let rndMult = Math.max ( scXY + Math.sin( t * Math.PI * 4 ) * 0.4 + Math.sin( t * Math.PI * 5 - this.tick * 4.0 ) * 0.4, 0.1 );
				//this.vec3.copy( data.rnd ).multiplyScalar( rndMult );
				//this.pos.add( this.vec3 );

				this.mat4.compose( this.pos, data.q, this.scale );

				visAgent.mesh.setMatrixAt( i, this.mat4 );

			}

			visAgent.mesh.instanceMatrix.needsUpdate = true;

		}
		
	}

	return vis;
	
}




//
//vis3 - top/bottom
//

const vis3SpikeVert = `

uniform vec3 col1;
uniform vec3 col2;
varying vec3 vCol;

void main() {

    vec3 pos = ( instanceMatrix * vec4( position, 1.0 ) ).xyz;
    vec3 worldPos = ( modelMatrix * vec4( pos, 1.0 ) ).xyz;
    vec4 mvPosition = viewMatrix * vec4( worldPos, 1.0 );
	
	vCol = mix( col2, col1, smoothstep( -0.8, 1.2, worldPos.z ) );
    gl_Position = projectionMatrix * mvPosition;

}
`;

const vis3SpikeFrag = `

uniform float uTime;

varying vec3 vCol;

void main() {

    gl_FragColor = vec4( vCol, 1.0 );

}
`;


function vis3( faceGroup ) {
		
	//vis
	const vis = {};
	
	vis.cubeW = 1.0;
	
	vis.numConnections = 256;
	
	vis.visAgents = [];
	vis.cols = [ 0xff4949, 0x70ffb0 ];
	
	vis.pos = new THREE.Vector3();
	vis.vec1 = new THREE.Vector3();
	vis.vec2 = new THREE.Vector3();
	vis.vec3 = new THREE.Vector3();
	vis.mat3 = new THREE.Matrix3();
	vis.mat4 = new THREE.Matrix4();
	vis.matRot4 = new THREE.Matrix4();
	vis.q1 = new THREE.Quaternion();
	vis.q2 = new THREE.Quaternion();
	vis.scale = new THREE.Vector3();
	vis.forward = new THREE.Vector3( 0, 0, 1.0 );
	vis.up = new THREE.Vector3( 0, 1.0, 0 );

	vis.tick = 0;
	
	vis.faceGroup = faceGroup;
	
	for ( let i = 0; i < agents.length; i++ ) {

		const agentData = { agent: agents[ i ] };
		vis.visAgents.push( agentData );
		
	}	

	
	vis.side1 = createLatticeSide( vis.cols[ 0 ], -1 );
	faceGroup.add( vis.side1.line );
	vis.side2 = createLatticeSide( vis.cols[ 1 ], 1 );
	faceGroup.add( vis.side2.line );
	
	vis.update = function( deltaTime, time ) {

		this.tick += deltaTime;

		let posAttribute = this.side1.line.geometry.getAttribute( "position" );
		let x, y, z;
		for ( let i = 0; i < 256; i++ ) {

			let id = i * 2 + 1;
			
			let segment = this.visAgents[ 0 ].agent.wander.trailSegments[ i ];
			
			posAttribute.setXYZ( id, segment.x, segment.y, segment.z );
			
		}
		posAttribute.needsUpdate = true;

		posAttribute = this.side2.line.geometry.getAttribute( "position" );
		for ( let i = 0; i < 256; i++ ) {

			let id = i * 2 + 1;
			
			let segment = this.visAgents[ 1 ].agent.wander.trailSegments[ i ];
			
			posAttribute.setXYZ( id, segment.x, segment.y, segment.z );
			
		}
		posAttribute.needsUpdate = true;		
		
		/*
		let visAgent, visAgentWander;
		for ( let j = 0; j < vis.visAgents.length; j++ ) {
			
			visAgent = this.visAgents[ j ];
			visAgentWander = visAgent.agent.wander;
			
			for ( let i = 0; i < this.numSpineInstances; i++ ) {

				let t = i / this.numSpineInstances;
				let segmentI = Math.floor( t * visAgentWander.numTrailSegments );
				let segmentT = t * visAgentWander.numTrailSegments - Math.floor( t * visAgentWander.numTrailSegments );
				let spikeData = visAgent.spikeData[ i ];

				if ( segmentI < visAgentWander.numTrailSegments - 1 ) {

					this.pos.copy( visAgentWander.trailSegments[ segmentI ] ).lerp( visAgentWander.trailSegments[ segmentI + 1 ], segmentT );

				} else {

					this.pos.copy( visAgentWander.trailSegments[ segmentI ] );

				}


				if ( segmentI == 0 ) {

					this.vec2.copy( this.pos );
					this.vec2.add( this.vec1.copy( visAgentWander.trailSegments[ 0 ] ).sub( visAgentWander.trailSegments[ 1 ] ).normalize() );

				} else {

					this.vec2.copy( this.pos );
					this.vec2.add( this.vec1.copy( visAgentWander.trailSegments[ segmentI - 1 ] ).sub( visAgentWander.trailSegments[ segmentI ] ).normalize() );

				}

				this.matRot4.lookAt( this.pos, this.vec2, this.up );
				this.q1.setFromRotationMatrix( this.matRot4 );
				
				this.q2.setFromAxisAngle( this.forward, t * Math.PI * 2 * this.numSpineLoops + this.tick * 1.0 );
				this.q1.multiply( this.q2 );
				
				spikeData.q.slerp( this.q1, deltaTime * 2.0 );

				let scXY = THREE.MathUtils.smoothstep( t, 0, 0.1 ) * ( 1.0 - THREE.MathUtils.smoothstep( t, 0.9, 1.0 ) ) * 1.0;
				let sc = Math.max( scXY + Math.sin( t * Math.PI * 2 * 30.0 + this.tick * -3.0 ) * ( scXY * 0.9 ), 0.3 );
				sc = scXY;
				this.scale.setScalar( sc );

				let rndMult = Math.max ( scXY + Math.sin( t * Math.PI * 4 ) * 0.4 + Math.sin( t * Math.PI * 5 - this.tick * 4.0 ) * 0.4, 0.1 );

				this.mat4.compose( this.pos, spikeData.q, this.scale );

				visAgent.spikeMesh.setMatrixAt( i, this.mat4 );

			}
			
			for ( let i = 0; i < this.numBodyInstances; i++ ) {

				let t = i / this.numBodyInstances;
				let segmentI = Math.floor( t * visAgentWander.numTrailSegments );
				let segmentT = t * visAgentWander.numTrailSegments - Math.floor( t * visAgentWander.numTrailSegments );

				let bodyData = visAgent.bodyData[ i ];

				if ( segmentI < visAgentWander.numTrailSegments - 1 ) {

					this.pos.copy( visAgentWander.trailSegments[ segmentI ] ).lerp( visAgentWander.trailSegments[ segmentI + 1 ], segmentT );

				} else {

					this.pos.copy( visAgentWander.trailSegments[ segmentI ] );

				}


				if ( segmentI == 0 ) {

					this.vec2.copy( this.pos );
					this.vec2.add( this.vec1.copy( visAgentWander.trailSegments[ 0 ] ).sub( visAgentWander.trailSegments[ 1 ] ).normalize() );

				} else {

					this.vec2.copy( this.pos );
					this.vec2.add( this.vec1.copy( visAgentWander.trailSegments[ segmentI - 1 ] ).sub( visAgentWander.trailSegments[ segmentI ] ).normalize() );

				}
				
				let scXY = THREE.MathUtils.smoothstep( t, 0, 0.1 ) * ( 1.0 - THREE.MathUtils.smoothstep( t, 0.9, 1.0 ) ) * 0.4;
				let sc = Math.max( scXY + Math.sin( t * Math.PI * 2 * 30.0 + this.tick * -3.0 ) * ( scXY * 0.9 ), 0.3 );
				this.scale.setScalar( sc );

				let rndMult = Math.max ( scXY + Math.sin( t * Math.PI * 4 ) * 0.4 + Math.sin( t * Math.PI * 5 - this.tick * 4.0 ) * 0.4, 0.1 );
				this.vec3.copy( bodyData.rnd ).multiplyScalar( rndMult );
				this.pos.add( this.vec3 );

				this.mat4.compose( this.pos, this.q1, this.scale );

				visAgent.bodyMesh.setMatrixAt( i, this.mat4 );

			}			

			visAgent.spikeMesh.instanceMatrix.needsUpdate = true;
			visAgent.bodyMesh.instanceMatrix.needsUpdate = true;

		}
		*/
		
	}

	return vis;
	
}

function createLatticeSide( col, xDir ) {
	
	const side = {};
	const cubeW = 1.0;
	const numConnections = 256;
	
	side.connectionPoints = new Float32Array( 256 * 2 * 3 );
	side.geo = new THREE.BufferGeometry();
	
	const connectionSpacing = cubeW / ( numConnections / 4 );
	
	let id = 0;	
	for ( let i = 0; i < numConnections / 4; i++ ) {
	
		const x = cubeW * 0.5 * xDir;
		const y = -cubeW * 0.5 + i * connectionSpacing;
		const z = -cubeW * 0.5;
		side.connectionPoints[ id ] = x;
		side.connectionPoints[ id + 1 ] = y;
		side.connectionPoints[ id + 2 ] = z;
		id += 3;
		side.connectionPoints[ id ] = x;
		side.connectionPoints[ id + 1 ] = -cubeW * 0.5 + 0.2;
		side.connectionPoints[ id + 2 ] = z;
		id += 3;
		
	}	
	for ( let i = 0; i < numConnections / 4; i++ ) {
	
		const x = cubeW * 0.5 * xDir;
		const y = cubeW * 0.5;
		const z = -cubeW * 0.5 + i * connectionSpacing;
		side.connectionPoints[ id ] = x;
		side.connectionPoints[ id + 1 ] = y;
		side.connectionPoints[ id + 2 ] = z;
		id += 3;
		side.connectionPoints[ id ] = x;
		side.connectionPoints[ id + 1 ] = -cubeW * 0.5 + 0.2;
		side.connectionPoints[ id + 2 ] = z;
		id += 3;
		
	}	
	for ( let i = 0; i < numConnections / 4; i++ ) {
	
		const x = cubeW * 0.5 * xDir;
		const y = cubeW * 0.5 - i * connectionSpacing;
		const z = cubeW * 0.5;
		side.connectionPoints[ id ] = x;
		side.connectionPoints[ id + 1 ] = y;
		side.connectionPoints[ id + 2 ] = z;
		id += 3;
		side.connectionPoints[ id ] = x;
		side.connectionPoints[ id + 1 ] = -cubeW * 0.5 + 0.2;
		side.connectionPoints[ id + 2 ] = z;
		id += 3;
		
	}		
	for ( let i = 0; i < numConnections / 4; i++ ) {
	
		const x = cubeW * 0.5 * xDir;
		const y = -cubeW * 0.5;
		const z = cubeW * 0.5 - i * connectionSpacing;
		side.connectionPoints[ id ] = x;
		side.connectionPoints[ id + 1 ] = y;
		side.connectionPoints[ id + 2 ] = z;
		id += 3;
		side.connectionPoints[ id ] = x;
		side.connectionPoints[ id + 1 ] = -cubeW * 0.5 + 0.2;
		side.connectionPoints[ id + 2 ] = z;
		id += 3;
		
	}
	
	side.geo.setAttribute( 'position', new THREE.BufferAttribute( side.connectionPoints, 3 ) );
	
	const mat = new THREE.LineBasicMaterial( { color: col } );
	side.line = new THREE.LineSegments( side.geo, mat );
	return side;	
	
}


