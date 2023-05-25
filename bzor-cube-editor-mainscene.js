//wander settings
const wanderSettings = {};
wanderSettings.boundingSphereRadius = 0.5;
wanderSettings.wanderSphereDistance = 0.1;
wanderSettings.wanderSphereRadius = 8;
wanderSettings.wanderAngleMaxChange = 12;
wanderSettings.wanderBoundsAngleMaxChange = 12;
wanderSettings.maxVelocity = 0.008;
wanderSettings.maxSteeringForce = 8;
wanderSettings.trailAvoidDist = 0.03;
wanderSettings.trailDropDelay = 0.015;
wanderSettings.numTrailSegments = 256;
wanderSettings.dustAvoidDist = 0.04;

const agents = [];
const agentVizs = [];

let dust;
const numDust = 4096;

let faceFront;
let faceFrontEnv;
const frontPos = new THREE.Vector3();
const frontDir = new THREE.Vector3();
let faceLeft;
let faceLeftEnv;
const leftPos = new THREE.Vector3();
const leftDir = new THREE.Vector3();
let faceTop;

let faceFrontBG;
let faceLeftBG;

const bgFrontUniforms = {

	colFront1: { value: new THREE.Color(0x281023) },
	colFront2: { value: new THREE.Color(0x522232) },
	colFront3: { value: new THREE.Color(0x2f2b42) },
	colBack1: { value: new THREE.Color(0x0c1e25) },
	colBack2: { value: new THREE.Color(0x0e2d3b) },
	colBack3: { value: new THREE.Color(0x0d0f18) },
	groupPos: { value: new THREE.Vector3() },
	groupDir: { value: new THREE.Vector3() }

}

const bgLeftUniforms = {

	colFront1: { value: new THREE.Color(0x19060f) },
	colFront2: { value: new THREE.Color(0x4d0c3d) },
	colFront3: { value: new THREE.Color(0x19060f) },
	colBack1: { value: new THREE.Color(0x02c050a) },
	colBack2: { value: new THREE.Color(0x000000) },
	colBack3: { value: new THREE.Color(0x2c050a) },
	groupPos: { value: new THREE.Vector3() },
	groupDir: { value: new THREE.Vector3() }

}


function init() {

	console.log("init main");
	let agentData1 = { wander: createWander(this), id: 0 };
	agents.push(agentData1);
	let agentData2 = { wander: createWander(this), id: 1 };
	agents.push(agentData2);

	faceFront = this.getObjectByName("faceFront");
	faceFrontBG = createBG(faceFront, bgFrontUniforms, 0);
	faceFrontEnv = faceFrontBG.mesh;
	faceFrontEnv.getWorldPosition(frontPos);
	faceFrontEnv.getWorldDirection(frontDir);
	faceLeft = this.getObjectByName("faceLeft");
	faceLeftBG = createBG(faceLeft, bgLeftUniforms, Math.PI * 0.5);
	faceLeftEnv = faceLeftBG.mesh;
	faceLeftEnv.getWorldPosition(leftPos);
	faceLeftEnv.getWorldDirection(leftDir);
	faceTop = this.getObjectByName("faceTop");

	agentVizs.push(vis1(faceFront));
	agentVizs.push(vis2(faceLeft));
	agentVizs.push(vis3(faceTop));

	dust = createDust();
	faceFront.add(dust.meshFront);
	faceLeft.add(dust.meshLeft);

}

function update(event) {

	const deltaTime = event.delta * 0.001;
	const time = event.time;

	faceFrontEnv.getWorldPosition(frontPos);
	faceFrontEnv.getWorldDirection(frontDir);
	faceLeftEnv.getWorldPosition(leftPos);
	faceLeftEnv.getWorldDirection(leftDir);

	for (let i = 0; i < agents.length; i++) {

		updateAgent(agents[i], deltaTime);

	}

	for (let i = 0; i < agentVizs.length; i++) {

		agentVizs[i].update(deltaTime, time);

	}

	updateDust(deltaTime);

	updateBGs(faceFrontBG, frontPos, frontDir);

}

//
//agents
//

function updateAgent(agentData, deltaTime) {

	const wander = agentData.wander;

	wander.agentLookat.position.copy(wander.agentPoint);

	wander.vec1.copy(wander.agentPoint);

	let distanceFromCenter = wander.vec1.sub(wander.centerPoint).length();
	if (distanceFromCenter > wanderSettings.boundingSphereRadius) {

		wander.agentLookat.lookAt(wander.centerPoint);
		wander.wanderAngle.rotateTowards(wander.agentLookat.quaternion, wanderSettings.wanderBoundsAngleMaxChange * deltaTime);

	}

	//attract heads
	wander.trailAvoidForce.setScalar(0);
	for (let i = 0; i < agents.length; i++) {

		let agent = agents[i];
		if (agent.wander == wander) {

			continue;

		}

		let attactMult = 3;
		wander.vec1.copy(agent.wander.agentPoint).sub(wander.agentPoint).normalize().multiplyScalar(attactMult);
		wander.trailAvoidForce.add(wander.vec1);

	}

	//avoid trails
	for (let i = 0; i < agents.length; i++) {

		let agent = agents[i];

		let jStart = (i == agents[i].id) ? Math.floor(wanderSettings.numTrailSegments) * 0.5 : 0;

		for (let j = 0; j < wanderSettings.numTrailSegments; j++) {

			wander.vec1.copy(agent.wander.trailSegments[j]);
			let dist = wander.vec1.distanceToSquared(wander.agentPoint);
			if (dist < wanderSettings.trailAvoidDist) {

				let forceMult = (wanderSettings.trailAvoidDist - dist) * 50.0;
				wander.vec1.copy(wander.agentPoint).sub(agent.wander.trailSegments[j]).normalize().multiplyScalar(forceMult);
				wander.trailAvoidForce.add(wander.vec1);

			}

		}

	}

	wander.wanderSphereCenter.copy(wander.currentVelocity).normalize().multiplyScalar(wanderSettings.wanderSphereDistance);
	wander.q1.random();
	wander.wanderAngle.rotateTowards(wander.q1, wanderSettings.wanderAngleMaxChange * deltaTime);
	wander.wanderForce.setScalar(0);
	wander.wanderDir.copy(wander.forward).applyQuaternion(wander.wanderAngle).multiplyScalar(wanderSettings.wanderSphereRadius);
	wander.wanderForce.copy(wander.wanderSphereCenter).add(wander.wanderDir);
	wander.wanderForce.clampLength(0, wanderSettings.maxSteeringForce);

	wander.wanderForce.add(wander.trailAvoidForce);
	wander.vec1.copy(wander.wanderForce).multiplyScalar(deltaTime);
	wander.currentVelocity.add(wander.vec1);
	wander.currentVelocity.clampLength(0, wanderSettings.maxVelocity);

	wander.agentPoint.add(wander.currentVelocity);

	wander.trailDropTick += deltaTime;
	if (wander.trailDropTick > wanderSettings.trailDropDelay) {

		wander.trailDropTick = 0;

		for (let i = wanderSettings.numTrailSegments - 1; i > 0; i--) {

			wander.trailSegments[i].copy(wander.trailSegments[i - 1]);

		}
		wander.trailSegments[0].copy(wander.agentPoint);

	}

}

function createWander(scene) {

	const wander = {};

	wander.vec1 = new THREE.Vector3();
	wander.vec2 = new THREE.Vector3();
	wander.vec3 = new THREE.Vector3();
	wander.vec4 = new THREE.Vector3();
	wander.q1 = new THREE.Quaternion();
	wander.forward = new THREE.Vector3(0, 0, 1.0);

	wander.agentPoint = new THREE.Vector3(0.05, 0.05, 0.05);
	wander.agentLookat = new THREE.Object3D();

	wander.currentPosition = new THREE.Vector3();

	wander.centerPoint = new THREE.Vector3();

	wander.currentVelocity = new THREE.Vector3().randomDirection().multiplyScalar(wanderSettings.maxVelocity);
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
	for (let i = 0; i < wanderSettings.numTrailSegments; i++) {

		wander.trailSegments.push(new THREE.Vector3());

	}

	return wander;

}

//
//dust
//

const dustVert = `

attribute vec3 iPos;
attribute float activate;
uniform vec3 col;
varying vec3 vCol;

void main() {
	
	vCol = col + vec3( 0.4, 0.7, 1.0 ) * activate;
	vec4 mvPos = modelViewMatrix * vec4( iPos, 1.0 );
	mvPos.xyz += position;
	gl_Position = projectionMatrix * mvPos;

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
	const points = new Float32Array(numDust * 3);
	const activates = new Float32Array(numDust);
	const velocities = [];
	let v = new THREE.Vector3();
	for (let i = 0; i < numDust; i++) {

		let x = THREE.MathUtils.randFloatSpread(1.0);
		let y = THREE.MathUtils.randFloatSpread(1.0);
		let z = THREE.MathUtils.randFloatSpread(1.0);

		points[i * 3] = x;
		points[i * 3 + 1] = y;
		points[i * 3 + 2] = z;

		v.randomDirection().multiplyScalar(0.02);
		velocities.push(v.clone());

	}

	const mat = new THREE.ShaderMaterial({ uniforms: { col: { value: new THREE.Color(0x222244) }, pixelRatio: { value: window.devicePixelRatio } }, vertexShader: dustVert, fragmentShader: dustFrag });
	mat.blending = THREE.AdditiveBlending;

	const dustGeo = new THREE.CircleGeometry(0.0025, 5);

	const pointBuffer = new THREE.InstancedBufferAttribute(points, 3);
	pointBuffer.setUsage(THREE.StreamDrawUsage);
	dustGeo.setAttribute('iPos', pointBuffer);

	const activateBuffer = new THREE.InstancedBufferAttribute(activates, 1);
	activateBuffer.setUsage(THREE.StreamDrawUsage);
	dustGeo.setAttribute('activate', activateBuffer);

	const dustMeshFront = new THREE.InstancedMesh(dustGeo, mat, numDust);
	const dustMeshLeft = new THREE.InstancedMesh(dustGeo, mat, numDust);

	dust.meshFront = dustMeshFront;
	dust.meshLeft = dustMeshLeft;
	dust.geo = dustGeo;
	dust.mat = mat;
	dust.posBuffer = pointBuffer;
	dust.activateBuffer = activateBuffer;
	dust.velocities = velocities;
	dust.pos = new THREE.Vector3();
	dust.vec1 = new THREE.Vector3();
	dust.moveForce = new THREE.Vector3();

	return dust;

}

function updateDust(deltaTime) {

	const border = 0.5;

	for (let i = 0; i < numDust; i++) {

		let x = dust.posBuffer.array[i * 3];
		let y = dust.posBuffer.array[i * 3 + 1];
		let z = dust.posBuffer.array[i * 3 + 2];

		let v = dust.velocities[i];

		if (x < -border) {

			v.x = Math.abs(v.x);

		} else if (x > border) {

			v.x = -Math.abs(v.x);

		}

		if (y < -border) {

			v.y = Math.abs(v.y);

		} else if (y > border) {

			v.y = -Math.abs(v.y);

		}

		if (z < -border) {

			v.z = Math.abs(v.z);

		} else if (z > border) {

			v.z = -Math.abs(v.z);

		}

		dust.moveForce.set(0.0, 0.0, 0.0);
		for (let i = 0; i < agents.length; i++) {

			let agent = agents[i];

			for (let j = 0; j < wanderSettings.numTrailSegments; j++) {

				dust.pos.set(x, y, z);
				dust.vec1.copy(agent.wander.trailSegments[j]);
				let dist = dust.vec1.distanceToSquared(dust.pos);
				if (dist < wanderSettings.dustAvoidDist) {

					let forceMult = (wanderSettings.dustAvoidDist - dist) * 0.4;
					dust.vec1.copy(dust.pos).sub(agent.wander.trailSegments[j]).normalize().multiplyScalar(forceMult);
					dust.moveForce.add(dust.vec1);

				}

			}

		}

		dust.activateBuffer.array[i] = dust.moveForce.lengthSq() * 15.0;

		dust.vec1.copy(v).add(dust.moveForce);

		x += dust.vec1.x * deltaTime;
		y += dust.vec1.y * deltaTime;
		z += dust.vec1.z * deltaTime;
		dust.posBuffer.setXYZ(i, x, y, z);

	}
	dust.posBuffer.needsUpdate = true;
	dust.activateBuffer.needsUpdate = true;

}

//
//vis1 - front/back
//

const vis1SpikeVert = `

#define PI 3.141592653589793
attribute float t;
attribute float activate;
uniform vec3 col1_1;
uniform vec3 col1_2;
uniform vec3 col2_1;
uniform vec3 col2_2;
varying vec3 vCol;
uniform vec3 groupPos;
uniform vec3 groupDir;
uniform float uTime;

void main() {

	vec4 vPos = vec4( position, 1.0 );

	vPos *= smoothstep( t * 8.0 + 0.2, t * 8.0 + 1.0, uTime );	

	float spikeY = 0.06;
	if ( vPos.y > 0.05 ) {
	
		vPos.y += 0.07 * activate;
		spikeY = vPos.y;
	
	}	
	
    vec4 iPos = instanceMatrix * vPos;
    vec4 worldPos = modelMatrix * iPos;
    vec4 viewPos = viewMatrix * worldPos;
	vec4 worldNormal = instanceMatrix * vec4( normal, 1.0 );
	worldNormal = normalize( modelViewMatrix * worldNormal );
	
	vec3 lightDir = normalize( vec3( -1.0, 0.5, 0.0 ) );
	
	vec3 vCol1 = col1_1;	
	vec3 vCol2 = col2_1;

	float dir = dot ( cameraPosition - groupPos, groupDir );
	float dirT = smoothstep( -0.01, 0.01, dir );

	vCol = mix( vCol1, vCol2, dirT ) * vec3( 1.0 + activate );
	vCol *= smoothstep( 0.04, spikeY, vPos.y );
	
    gl_Position = projectionMatrix * viewPos;

}
`;

const vis1SpikeFrag = `

varying vec3 vCol;

void main() {

    gl_FragColor = vec4( vCol, 1.0 );

}
`;

const vis1BodyVert = `

#define PI 3.141592653589793
attribute vec3 iPos;
attribute vec3 rndPos;
attribute vec3 dir;
attribute float t;
uniform vec3 col1;
uniform vec3 col2;
uniform float uTime;
varying vec3 vCol;

void main() {
	
	float scXY = smoothstep( 0.0, 0.1, t ) * ( 1.0 - smoothstep( 0.9, 1.0, t ) );
	float sc = max( scXY * 0.2 + sin( t * PI * 2.0 * 3.0 + uTime * -3.0 ) * scXY * 0.2, 0.3 );
	float rndMult = max ( scXY * 0.2 + 0.3 + sin( t * PI * 2.0 * 5.0 - uTime * 4.0 ) * 0.5 + 0.5, 0.1 ) * 0.5;

	vec3 pos = position;
	float theta = t * PI * 50.0 + uTime * 10.0;
	pos.x += cos( theta ) * 0.02 * ( 1.0 - scXY );
	pos.y += sin( theta ) * 0.02 * ( 1.0 - scXY );
	pos.z += scXY * -0.1;
	pos *= sc;

	vec3 vPos = pos + rndPos * rndMult;

	vec4 mvPos = modelViewMatrix * vec4( iPos, 1.0 );
	mvPos.xyz += vPos;
	gl_Position = projectionMatrix * mvPos;
	
	vec3 worldPos = ( modelMatrix * vec4( iPos, 1.0 ) ).xyz;
	vCol = mix( col1, col2, smoothstep( -0.5, 0.5, dot( cameraPosition - worldPos, dir ) ) );

}
`;

const vis1BodyFrag = `

varying vec3 vCol;

void main() {

    gl_FragColor = vec4( vCol, 1.0 );

}
`;



function vis1(faceGroup) {

	//vis
	const vis = {};

	vis.spineElemR = 0.01;
	vis.spineElemH = 0.02;
	vis.bodyElemScale = 0.015;
	vis.numSpineInstances = 512;
	vis.numBodyInstances = 512;
	vis.numSpineLoops = 58;
	vis.visAgents = [];
	vis.cols1 = [0xdf4266, 0xd246d8];
	vis.cols2 = [0x44bfd9, 0xd743cb];
	vis.bodyCols = [0x43adc8, 0xc84f43];

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
	vis.forward = new THREE.Vector3(0, 0, 1.0);
	vis.up = new THREE.Vector3(0, 1.0, 0);

	vis.tick = 0;

	vis.faceGroup = faceGroup;

	for (let i = 0; i < agents.length; i++) {

		const spikeUniforms = {
			"col1_1": { value: new THREE.Color(vis.cols1[i]) },
			"col1_2": { value: new THREE.Color(vis.cols1[1 - i]) },
			"col2_1": { value: new THREE.Color(vis.cols2[i]) },
			"col2_2": { value: new THREE.Color(vis.cols2[1 - i]) },
			"groupPos": { value: frontPos },
			"groupDir": { value: frontDir },
			"uTime": { value: 0 }
		};
		const spikeMat = new THREE.ShaderMaterial({ uniforms: spikeUniforms, vertexShader: vis1SpikeVert, fragmentShader: vis1SpikeFrag });
		//mat.blending = THREE.AdditiveBlending;
		//const mat = new THREE.MeshBasicMaterial( { color: vis.cols[ i ] } );

		const geo = new THREE.ConeGeometry(vis.spineElemR, vis.spineElemH, 5, 1);
		geo.translate(0, vis.spineElemH * 0.5 + 0.04, 0);

		const spikeMesh = new THREE.InstancedMesh(geo, spikeMat, vis.numSpineInstances);
		spikeMesh.instanceMatrix.setUsage(THREE.StreamDrawUsage);
		faceGroup.add(spikeMesh);

		const bodyUniforms = {
			"col1": { value: new THREE.Color(vis.bodyCols[i]) },
			"col2": { value: new THREE.Color(vis.bodyCols[1 - i]) },
			"uTime": { value: 0 }
		};

		const bodyMat = new THREE.ShaderMaterial({ uniforms: bodyUniforms, vertexShader: vis1BodyVert, fragmentShader: vis1BodyFrag });
		bodyMat.blending = THREE.AdditiveBlending;

		const bodyGeo = new THREE.CircleGeometry(vis.bodyElemScale, 7);

		const bodyMesh = new THREE.InstancedMesh(bodyGeo, bodyMat, vis.numBodyInstances);
		faceGroup.add(bodyMesh);

		const agentData = { agent: agents[i], spikeMesh: spikeMesh, bodyMesh: bodyMesh, spikeUniforms: spikeUniforms, bodyUniforms: bodyUniforms, spikeData: [] };

		for (let i = 0; i < vis.numSpineInstances; i++) {

			agentData.spikeData.push({ q: new THREE.Quaternion() });

		}

		const bodyDirs = new Float32Array(vis.numBodyInstances * 3);
		const bodyIPos = new Float32Array(vis.numBodyInstances * 3);
		const bodyRndPos = new Float32Array(vis.numBodyInstances * 3);
		const bodyT = new Float32Array(vis.numBodyInstances);
		for (let i = 0; i < vis.numBodyInstances; i++) {

			let rnd = new THREE.Vector3().randomDirection().multiplyScalar(0.05);
			bodyRndPos[i * 3] = rnd.x;
			bodyRndPos[i * 3 + 1] = rnd.y;
			bodyRndPos[i * 3 + 2] = rnd.z;
			bodyDirs[i * 3] = 0;
			bodyDirs[i * 3 + 1] = 0;
			bodyDirs[i * 3 + 2] = 0;

			bodyT[i] = i / (vis.numBodyInstances - 1);

		}

		const spikeT = new Float32Array(vis.numSpineInstances);
		for (let i = 0; i < vis.numSpineInstances; i++) {

			spikeT[i] = i / (vis.numSpineInstances - 1);

		}

		const bodyIposBuffer = new THREE.InstancedBufferAttribute(bodyIPos, 3);
		bodyIposBuffer.setUsage(THREE.StreamDrawUsage);
		bodyGeo.setAttribute('iPos', bodyIposBuffer);
		const bodyDirsBuffer = new THREE.InstancedBufferAttribute(bodyDirs, 3);
		bodyDirsBuffer.setUsage(THREE.StreamDrawUsage);
		bodyGeo.setAttribute('dir', bodyDirsBuffer);
		bodyGeo.setAttribute('rndPos', new THREE.InstancedBufferAttribute(bodyRndPos, 3));
		bodyGeo.setAttribute('t', new THREE.InstancedBufferAttribute(bodyT, 1));

		const spikeActivates = new Float32Array(vis.numSpineInstances);
		const spikeActivateBuffer = new THREE.InstancedBufferAttribute(spikeActivates, 1);
		spikeActivateBuffer.setUsage(THREE.StreamDrawUsage);
		geo.setAttribute('activate', spikeActivateBuffer);
		geo.setAttribute('t', new THREE.InstancedBufferAttribute(spikeT, 1));

		vis.visAgents.push(agentData);

	}

	vis.update = function (deltaTime, time) {

		this.tick += deltaTime;

		let visAgent, visAgentWander, otherVisAgent;
		for (let j = 0; j < vis.visAgents.length; j++) {

			visAgent = this.visAgents[j];
			otherVisAgent = this.visAgents[1 - j];
			visAgentWander = visAgent.agent.wander;
			visAgent.bodyUniforms.uTime.value = this.tick;
			visAgent.spikeUniforms.groupPos.value = frontPos;
			visAgent.spikeUniforms.groupDir.value = frontDir;
			visAgent.spikeUniforms.uTime.value = this.tick;

			let activates = visAgent.spikeMesh.geometry.getAttribute("activate");

			for (let i = 0; i < this.numSpineInstances; i++) {

				let t = i / this.numSpineInstances;
				let segmentI = Math.floor(t * visAgentWander.numTrailSegments);
				let segmentT = t * visAgentWander.numTrailSegments - Math.floor(t * visAgentWander.numTrailSegments);
				let spikeData = visAgent.spikeData[i];

				if (segmentI < visAgentWander.numTrailSegments - 1) {

					this.pos.copy(visAgentWander.trailSegments[segmentI]).lerp(visAgentWander.trailSegments[segmentI + 1], segmentT);

				} else {

					this.pos.copy(visAgentWander.trailSegments[segmentI]);

				}


				if (segmentI == 0) {

					this.vec2.copy(this.pos);
					this.vec2.add(this.vec1.copy(visAgentWander.trailSegments[0]).sub(visAgentWander.trailSegments[1]).normalize());

				} else {

					this.vec2.copy(this.pos);
					this.vec2.add(this.vec1.copy(visAgentWander.trailSegments[segmentI - 1]).sub(visAgentWander.trailSegments[segmentI]).normalize());

				}

				this.matRot4.lookAt(this.pos, this.vec2, this.up);
				this.q1.setFromRotationMatrix(this.matRot4);

				this.q2.setFromAxisAngle(this.forward, t * Math.PI * 2 * this.numSpineLoops + this.tick * 1.0);
				this.q1.multiply(this.q2);

				spikeData.q.slerp(this.q1, deltaTime * 2.0);

				let scXY = THREE.MathUtils.smoothstep(t, 0, 0.1) * (1.0 - THREE.MathUtils.smoothstep(t, 0.9, 1.0)) * 1.0;
				let sc = Math.max(scXY + Math.sin(t * Math.PI * 2 * 30.0 + this.tick * -3.0) * (scXY * 0.9), 0.3);
				sc = scXY;
				this.scale.setScalar(sc);

				let rndMult = Math.max(scXY + Math.sin(t * Math.PI * 4) * 0.4 + Math.sin(t * Math.PI * 5 - this.tick * 4.0) * 0.4, 0.1);

				this.mat4.compose(this.pos, spikeData.q, this.scale);

				visAgent.spikeMesh.setMatrixAt(i, this.mat4);

				let closestDist = 1000.0;
				let dist;
				let maxDist = 0.04;
				for (let k = 0; k < otherVisAgent.agent.wander.trailSegments.length; k++) {

					dist = this.pos.distanceToSquared(otherVisAgent.agent.wander.trailSegments[k]);
					if (dist < closestDist) {

						closestDist = dist;

					}

				}
				activates.array[i] = (maxDist - Math.min(closestDist, maxDist)) / maxDist;

			}
			activates.needsUpdate = true;


			let bodyDirs = visAgent.bodyMesh.geometry.getAttribute("dir");
			let bodyIPos = visAgent.bodyMesh.geometry.getAttribute("iPos");

			for (let i = 0; i < this.numBodyInstances; i++) {

				let t = i / this.numBodyInstances;
				let segmentI = Math.floor(t * visAgentWander.numTrailSegments);
				let segmentT = t * visAgentWander.numTrailSegments - Math.floor(t * visAgentWander.numTrailSegments);

				if (segmentI < visAgentWander.numTrailSegments - 1) {

					this.pos.copy(visAgentWander.trailSegments[segmentI]).lerp(visAgentWander.trailSegments[segmentI + 1], segmentT);

				} else {

					this.pos.copy(visAgentWander.trailSegments[segmentI]);

				}


				if (segmentI == 0) {

					this.vec2.copy(this.pos);
					this.vec2.add(this.vec1.copy(visAgentWander.trailSegments[0]).sub(visAgentWander.trailSegments[1]).normalize());

				} else {

					this.vec2.copy(this.pos);
					this.vec2.add(this.vec1.copy(visAgentWander.trailSegments[segmentI - 1]).sub(visAgentWander.trailSegments[segmentI]).normalize());

				}

				bodyDirs.setXYZ(i, this.vec2.x, this.vec2.y, this.vec2.z);
				bodyIPos.setXYZ(i, this.pos.x, this.pos.y, this.pos.z);

			}

			visAgent.spikeMesh.instanceMatrix.needsUpdate = true;
			bodyDirs.needsUpdate = true;
			bodyIPos.needsUpdate = true;

		}

	}

	return vis;

}

//
//vis2 - left/right
//

const vis2SpikeVert = `

#define PI 3.141592653589793
uniform vec3 col1_1;
uniform vec3 col1_2;
uniform vec3 col2_1;
uniform vec3 col2_2;
uniform vec3 groupPos;
uniform vec3 groupDir;
uniform float uTime;
attribute float t;
varying vec3 vCol;

void main() {

	vec4 vPos = vec4( position, 1.0 );
	
	vPos *= smoothstep( t * 8.0 + 0.2, t * 8.0 + 1.0, uTime );	
	
    vec4 iPos = instanceMatrix * vPos;
    vec4 worldPos = modelMatrix * iPos;
    vec4 viewPos = viewMatrix * worldPos;

	vec3 groupToCam = cameraPosition - groupPos;
	float dir = dot ( groupToCam, groupDir );
	float dirT = smoothstep( -0.01, 0.01, dir );

	vec3 lightDir = normalize( vec3( 0.0, 1.0, 0.0 ) );
	vec3 viewDir = cameraPosition - worldPos.xyz;
	vec3 worldNormal = ( instanceMatrix * ( vec4( normal, 1.0 ) ) ).xyz;


	vec3 vCol1 = mix( col1_1, col1_2, max( sin( t * PI * 2.0 + uTime * 0.5 ), 0.0 ) );
	
	vec3 vCol2 = mix( col2_1, col2_2, smoothstep( -0.2, 0.2, iPos.y ) );
	
	lightDir = normalize( vec3( 1.0, 1.0, -1.0 ) );
	
	vCol1 = mix( vCol1 * 0.7, vCol1 * 1.8, clamp( dot( lightDir, normalize( worldNormal ) ), 0.0, 1.0 ) );
	
	vCol2 = mix( vCol2 * 0.2, vCol2 * 1.8, clamp( dot( lightDir, normalize( worldNormal ) ), 0.0, 1.0 ) );
	
	vCol = mix( vCol1, vCol2, dirT ) * smoothstep( 0.05, 0.09, vPos.y );
		
    gl_Position = projectionMatrix * viewPos;

}
`;

const vis2SpikeFrag = `

uniform float uTime;
varying vec3 vCol;

void main() {

    gl_FragColor = vec4( vCol, 1.0 );

}
`;

const vis2BodyVert = `

#define PI 3.141592653589793
attribute vec3 iPos;
attribute vec3 rndPos;
attribute vec3 dir;
attribute float t;
uniform vec3 col1;
uniform vec3 col2;
uniform float uTime;
varying vec3 vCol;

void main() {
	
	float scXY = smoothstep( 0.0, 0.1, t ) * ( 1.0 - smoothstep( 0.9, 1.0, t ) ) * 0.2;
	float sc = max( scXY + sin( t * PI * 2.0 * 30.0 + uTime * -3.0 ) * scXY, 0.3 );
	float rndMult = max ( scXY + sin( t * PI * 4.0 ) * 0.4 + sin( t * PI * 5.0 - uTime * 4.0 ) * 0.4, 0.1 );

	vec3 pos = position;
	pos *= sc;

	vec3 vPos = pos + rndPos * rndMult;

	vec4 mvPos = modelViewMatrix * vec4( iPos, 1.0 );
	mvPos.xyz += vPos;
	gl_Position = projectionMatrix * mvPos;
	
	vec3 worldPos = ( modelMatrix * vec4( iPos, 1.0 ) ).xyz;
	vCol = mix( col1, col2, smoothstep( -0.8, 0.8, dot( cameraPosition - worldPos, dir ) ) );

}
`;

const vis2BodyFrag = `

uniform float uTime;

varying vec3 vCol;

void main() {

    gl_FragColor = vec4( vCol, 1.0 );

}
`;



function vis2(faceGroup) {

	//vis
	const vis = {};

	vis.spineElemR = 0.01;
	vis.spineElemH = 0.04;
	vis.bodyElemScale = 0.02;
	vis.numSpineInstances = 1024;
	vis.numBodyInstances = 512;
	vis.numSpineLoops = 323;
	vis.visAgents = [];
	vis.cols1 = [0x3b85ff, 0xbc3bff];
	vis.cols2 = [0xff4c4c, 0x45e6af];
	vis.bodyCols = [0x831230, 0x194db7];

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
	vis.forward = new THREE.Vector3(0, 0, 1.0);
	vis.up = new THREE.Vector3(0, 1.0, 0);

	vis.tick = 0;

	vis.faceGroup = faceGroup;

	for (let i = 0; i < agents.length; i++) {

		const spikeUniforms = {
			"col1_1": { value: new THREE.Color(vis.cols1[i]) },
			"col1_2": { value: new THREE.Color(vis.cols1[1 - i]) },
			"col2_1": { value: new THREE.Color(vis.cols2[i]) },
			"col2_2": { value: new THREE.Color(vis.cols2[1 - i]) },
			"groupPos": { value: frontPos },
			"groupDir": { value: frontDir },
			"uTime": { value: 0 }
		};

		const spikeMat = new THREE.ShaderMaterial({ uniforms: spikeUniforms, vertexShader: vis2SpikeVert, fragmentShader: vis2SpikeFrag });
		//mat.blending = THREE.AdditiveBlending;

		const geo = new THREE.ConeGeometry(vis.spineElemR, vis.spineElemH, 4, 1);
		geo.translate(0, vis.spineElemH * 0.5 + 0.05, 0);

		const spikeMesh = new THREE.InstancedMesh(geo, spikeMat, vis.numSpineInstances);
		spikeMesh.instanceMatrix.setUsage(THREE.StreamDrawUsage);
		faceGroup.add(spikeMesh);

		const bodyUniforms = {
			"col1": { value: new THREE.Color(vis.bodyCols[i]) },
			"col2": { value: new THREE.Color(vis.bodyCols[1 - i]) },
			"uTime": { value: 0 }
		};
		const bodyMat = new THREE.ShaderMaterial({ uniforms: bodyUniforms, vertexShader: vis2BodyVert, fragmentShader: vis2BodyFrag });
		bodyMat.blending = THREE.AdditiveBlending;

		//const bodyGeo = new THREE.IcosahedronGeometry( vis.bodyElemScale, 0 );
		const bodyGeo = new THREE.CircleGeometry(vis.bodyElemScale, 8);

		const bodyMesh = new THREE.InstancedMesh(bodyGeo, bodyMat, vis.numBodyInstances);
		faceGroup.add(bodyMesh);

		const bodyDirs = new Float32Array(vis.numBodyInstances * 3);
		const bodyIPos = new Float32Array(vis.numBodyInstances * 3);
		const bodyRndPos = new Float32Array(vis.numBodyInstances * 3);
		const bodyT = new Float32Array(vis.numBodyInstances);
		for (let i = 0; i < vis.numBodyInstances; i++) {

			let rnd = new THREE.Vector3().randomDirection().multiplyScalar(0.05);
			bodyRndPos[i * 3] = rnd.x;
			bodyRndPos[i * 3 + 1] = rnd.y;
			bodyRndPos[i * 3 + 2] = rnd.z;

			bodyDirs[i * 3] = 0;
			bodyDirs[i * 3 + 1] = 0;
			bodyDirs[i * 3 + 2] = 0;

			bodyT[i] = i / (vis.numBodyInstances - 1);

		}

		const spikeT = new Float32Array(vis.numSpineInstances);
		for (let i = 0; i < vis.numSpineInstances; i++) {

			spikeT[i] = i / (vis.numSpineInstances - 1);

		}

		const bodyIposBuffer = new THREE.InstancedBufferAttribute(bodyIPos, 3);
		bodyIposBuffer.setUsage(THREE.StreamDrawUsage);
		bodyGeo.setAttribute('iPos', bodyIposBuffer);
		const bodyDirsBuffer = new THREE.InstancedBufferAttribute(bodyDirs, 3);
		bodyDirsBuffer.setUsage(THREE.StreamDrawUsage);
		bodyGeo.setAttribute('dir', bodyDirsBuffer);
		bodyGeo.setAttribute('rndPos', new THREE.InstancedBufferAttribute(bodyRndPos, 3));
		bodyGeo.setAttribute('t', new THREE.InstancedBufferAttribute(bodyT, 1));

		geo.setAttribute('t', new THREE.InstancedBufferAttribute(spikeT, 1));

		const agentData = { agent: agents[i], spikeMesh: spikeMesh, bodyMesh: bodyMesh, spikeUniforms: spikeUniforms, bodyUniforms: bodyUniforms, spikeData: [] };

		for (let i = 0; i < vis.numSpineInstances; i++) {

			agentData.spikeData.push({ q: new THREE.Quaternion() });

		}

		agentData.bodyDirsBuffer = bodyDirsBuffer;
		agentData.bodyIposBuffer = bodyIposBuffer;

		vis.visAgents.push(agentData);

	}

	vis.update = function (deltaTime, time) {

		this.tick += deltaTime;

		let visAgent, visAgentWander, otherVisAgent;
		for (let j = 0; j < vis.visAgents.length; j++) {

			visAgent = this.visAgents[j];
			otherVisAgent = this.visAgents[1 - j];
			visAgentWander = visAgent.agent.wander;
			visAgent.bodyUniforms.uTime.value = this.tick;
			visAgent.spikeUniforms.groupPos.value = leftPos;
			visAgent.spikeUniforms.groupDir.value = leftDir;
			visAgent.spikeUniforms.uTime.value = this.tick;

			for (let i = 0; i < this.numSpineInstances; i++) {

				let t = i / this.numSpineInstances;
				let segmentI = Math.floor(t * visAgentWander.numTrailSegments);
				let segmentT = t * visAgentWander.numTrailSegments - Math.floor(t * visAgentWander.numTrailSegments);
				let spikeData = visAgent.spikeData[i];

				if (segmentI < visAgentWander.numTrailSegments - 1) {

					this.pos.copy(visAgentWander.trailSegments[segmentI]).lerp(visAgentWander.trailSegments[segmentI + 1], segmentT);

				} else {

					this.pos.copy(visAgentWander.trailSegments[segmentI]);

				}


				if (segmentI == 0) {

					this.vec2.copy(this.pos);
					this.vec2.add(this.vec1.copy(visAgentWander.trailSegments[0]).sub(visAgentWander.trailSegments[1]).normalize());

				} else {

					this.vec2.copy(this.pos);
					this.vec2.add(this.vec1.copy(visAgentWander.trailSegments[segmentI - 1]).sub(visAgentWander.trailSegments[segmentI]).normalize());

				}

				this.matRot4.lookAt(this.pos, this.vec2, this.up);
				this.q1.setFromRotationMatrix(this.matRot4);

				this.q2.setFromAxisAngle(this.forward, t * Math.PI * 2 * this.numSpineLoops + this.tick * 1.0);
				this.q1.multiply(this.q2);

				spikeData.q.slerp(this.q1, deltaTime * 2.0);

				let scXY = THREE.MathUtils.smoothstep(t, 0, 0.1) * (1.0 - THREE.MathUtils.smoothstep(t, 0.9, 1.0)) * 1.0;
				let sc = Math.max(scXY + Math.sin(t * Math.PI * 2 * 30.0 + this.tick * -3.0) * (scXY * 0.9), 0.3);
				sc = scXY;
				this.scale.setScalar(sc);

				let rndMult = Math.max(scXY + Math.sin(t * Math.PI * 4) * 0.4 + Math.sin(t * Math.PI * 5 - this.tick * 4.0) * 0.4, 0.1);

				this.mat4.compose(this.pos, spikeData.q, this.scale);

				visAgent.spikeMesh.setMatrixAt(i, this.mat4);

			}

			const bodyDirs = visAgent.bodyDirsBuffer;
			const bodyIPos = visAgent.bodyIposBuffer;

			for (let i = 0; i < this.numBodyInstances; i++) {

				let t = i / this.numBodyInstances;
				let segmentI = Math.floor(t * visAgentWander.numTrailSegments);
				let segmentT = t * visAgentWander.numTrailSegments - Math.floor(t * visAgentWander.numTrailSegments);

				if (segmentI < visAgentWander.numTrailSegments - 1) {

					this.pos.copy(visAgentWander.trailSegments[segmentI]).lerp(visAgentWander.trailSegments[segmentI + 1], segmentT);

				} else {

					this.pos.copy(visAgentWander.trailSegments[segmentI]);

				}


				if (segmentI == 0) {

					this.vec2.copy(this.pos);
					this.vec2.add(this.vec1.copy(visAgentWander.trailSegments[0]).sub(visAgentWander.trailSegments[1]).normalize());

				} else {

					this.vec2.copy(this.pos);
					this.vec2.add(this.vec1.copy(visAgentWander.trailSegments[segmentI - 1]).sub(visAgentWander.trailSegments[segmentI]).normalize());

				}

				bodyDirs.setXYZ(i, this.vec2.x, this.vec2.y, this.vec2.z);
				bodyIPos.setXYZ(i, this.pos.x, this.pos.y, this.pos.z);

			}

			visAgent.spikeMesh.instanceMatrix.needsUpdate = true;
			bodyDirs.needsUpdate = true;
			bodyIPos.needsUpdate = true;

		}

	}

	return vis;

}



//
//vis3 - top/bottom
//

const vis3SpikeVert = `

attribute vec3 iPos;
uniform vec3 col1;
uniform vec3 col2_1;
uniform vec3 col2_2;
varying vec3 vCol;
uniform vec3 groupPos;
uniform vec3 groupDir;

void main() {

    vec4 iPos = instanceMatrix * vec4( position, 1.0 );
    vec4 worldPos = modelMatrix * iPos;
    vec4 viewPos = viewMatrix * worldPos;

    gl_Position = projectionMatrix * viewPos;

	vec3 vCol1 = col1;
	vCol = vCol1;	
	
}
`;

const vis3SpikeFrag = `

varying vec3 vCol;

void main() {

    gl_FragColor = vec4( vCol, 1.0 );

}
`;

const vis3BodyVert = `

#define PI 3.141592653589793
attribute vec3 iPos;
attribute vec3 rndPos;
attribute vec3 dir;
attribute float t;
uniform vec3 col1;
uniform vec3 col2;
uniform float uTime;
varying vec3 vCol;

void main() {
	
	float scXY = smoothstep( 0.0, 0.1, t ) * ( 1.0 - smoothstep( 0.9, 1.0, t ) ) * 0.2;
	float sc = max( scXY + sin( t * PI * 2.0 * 30.0 + uTime * -3.0 ) * scXY, 0.3 );
	float rndMult = max ( scXY + sin( t * PI * 4.0 ) * 0.4 + sin( t * PI * 5.0 - uTime * 4.0 ) * 0.4, 0.1 );

	vec3 pos = position;
	pos *= sc;

	vec3 vPos = pos + rndPos * rndMult;

	vec4 mvPos = modelViewMatrix * vec4( iPos, 1.0 );
	mvPos.xyz += vPos;
	gl_Position = projectionMatrix * mvPos;
	
	vec3 worldPos = ( modelMatrix * vec4( iPos, 1.0 ) ).xyz;
	vCol = mix( col1, col2, smoothstep( -0.5, 0.5, dot( cameraPosition - worldPos, dir ) ) );

}
`;

const vis3BodyFrag = `

uniform float uTime;

varying vec3 vCol;

void main() {

    gl_FragColor = vec4( vCol, 1.0 );

}
`;



function vis3(faceGroup) {

	//vis
	const vis = {};

	vis.spineElemR = 0.01;
	vis.spineElemH = 0.04;
	vis.bodyElemScale = 0.016;
	vis.numSpineInstances = 1024;
	vis.numBodyInstances = 512;
	vis.numSpineLoops = 323;
	vis.visAgents = [];
	vis.cols1 = [0xCCCCCC, 0xCCCCCC];
	vis.cols2 = [0xCCCCCC, 0xCCCCCC];
	vis.bodyCols = [0xFFFFFF, 0xFFFFFF];

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
	vis.forward = new THREE.Vector3(0, 0, 1.0);
	vis.up = new THREE.Vector3(0, 1.0, 0);

	vis.tick = 0;

	vis.faceGroup = faceGroup;

	for (let i = 0; i < agents.length; i++) {

		//const geo = new THREE.ConeGeometry(vis.spineElemR, vis.spineElemH, 5, 1);
		const boxW = 0.002;
		const geo = new THREE.BoxGeometry(boxW, boxW, boxW);
		geo.translate(0, vis.spineElemH * 0.5 + 0.05, 0);

		const spikeUniforms = {
			"col1": { value: new THREE.Color(vis.cols1[i]) },
			"col2_1": { value: new THREE.Color(vis.cols2[i]) },
			"col2_2": { value: new THREE.Color(vis.cols2[1 - i]) },
			"groupPos": { value: frontPos },
			"groupDir": { value: frontDir }


		};
		const spikeMat = new THREE.ShaderMaterial({ uniforms: spikeUniforms, vertexShader: vis3SpikeVert, fragmentShader: vis3SpikeFrag });
		//mat.blending = THREE.AdditiveBlending;
		//const mat = new THREE.MeshBasicMaterial( { color: vis.cols[ i ] } );

		const spikeMesh = new THREE.InstancedMesh(geo, spikeMat, vis.numSpineInstances);
		spikeMesh.instanceMatrix.setUsage(THREE.StreamDrawUsage);
		faceGroup.add(spikeMesh);

		const spikeIPos = new Float32Array(vis.numSpineInstances * 3);
		const spikeIposBuffer = new THREE.InstancedBufferAttribute(spikeIPos, 3);
		spikeIposBuffer.setUsage(THREE.StreamDrawUsage);
		geo.setAttribute('iPos', spikeIposBuffer);


		const bodyUniforms = {
			"col1": { value: new THREE.Color(vis.bodyCols[i]) },
			"col2": { value: new THREE.Color(vis.bodyCols[1 - i]) },
			"uTime": { value: 0 }
		};
		const bodyMat = new THREE.ShaderMaterial({ uniforms: bodyUniforms, vertexShader: vis3BodyVert, fragmentShader: vis3BodyFrag });
		bodyMat.blending = THREE.AdditiveBlending;

		//const bodyGeo = new THREE.IcosahedronGeometry( vis.bodyElemScale, 0 );
		const bodyGeo = new THREE.CircleGeometry(vis.bodyElemScale, 8);
		const bodyMesh = new THREE.InstancedMesh(bodyGeo, bodyMat, vis.numBodyInstances);
		faceGroup.add(bodyMesh);

		const agentData = { agent: agents[i], spikeMesh: spikeMesh, bodyMesh: bodyMesh, spikeUniforms: spikeUniforms, bodyUniforms: bodyUniforms, spikeData: [] };

		for (let i = 0; i < vis.numSpineInstances; i++) {

			agentData.spikeData.push({ q: new THREE.Quaternion() });

		}

		const bodyDirs = new Float32Array(vis.numBodyInstances * 3);
		const bodyIPos = new Float32Array(vis.numBodyInstances * 3);
		const bodyRndPos = new Float32Array(vis.numBodyInstances * 3);
		const bodyT = new Float32Array(vis.numBodyInstances);
		for (let i = 0; i < vis.numBodyInstances; i++) {

			let rnd = new THREE.Vector3().randomDirection().multiplyScalar(0.05);
			bodyRndPos[i * 3] = rnd.x;
			bodyRndPos[i * 3 + 1] = rnd.y;
			bodyRndPos[i * 3 + 2] = rnd.z;
			bodyDirs[i * 3] = 0;
			bodyDirs[i * 3 + 1] = 0;
			bodyDirs[i * 3 + 2] = 0;

			bodyT[i] = i / (vis.numBodyInstances - 1);

		}

		const bodyIposBuffer = new THREE.InstancedBufferAttribute(bodyIPos, 3);
		bodyIposBuffer.setUsage(THREE.StreamDrawUsage);
		bodyGeo.setAttribute('iPos', bodyIposBuffer);
		const bodyDirsBuffer = new THREE.InstancedBufferAttribute(bodyDirs, 3);
		bodyDirsBuffer.setUsage(THREE.StreamDrawUsage);
		bodyGeo.setAttribute('dir', bodyDirsBuffer);
		bodyGeo.setAttribute('rndPos', new THREE.InstancedBufferAttribute(bodyRndPos, 3));
		bodyGeo.setAttribute('t', new THREE.InstancedBufferAttribute(bodyT, 1));

		vis.visAgents.push(agentData);

	}

	vis.update = function (deltaTime, time) {

		this.tick += deltaTime;

		let visAgent, visAgentWander;
		for (let j = 0; j < vis.visAgents.length; j++) {

			visAgent = this.visAgents[j];
			visAgentWander = visAgent.agent.wander;
			visAgent.bodyUniforms.uTime.value = this.tick;
			visAgent.spikeUniforms.groupPos.value = leftPos;
			visAgent.spikeUniforms.groupDir.value = leftDir;

			let spikeIPos = visAgent.spikeMesh.geometry.getAttribute("iPos");

			for (let i = 0; i < this.numSpineInstances; i++) {

				let t = i / this.numSpineInstances;
				let segmentI = Math.floor(t * visAgentWander.numTrailSegments);
				let segmentT = t * visAgentWander.numTrailSegments - Math.floor(t * visAgentWander.numTrailSegments);
				let spikeData = visAgent.spikeData[i];

				if (segmentI < visAgentWander.numTrailSegments - 1) {

					this.pos.copy(visAgentWander.trailSegments[segmentI]).lerp(visAgentWander.trailSegments[segmentI + 1], segmentT);

				} else {

					this.pos.copy(visAgentWander.trailSegments[segmentI]);

				}


				if (segmentI == 0) {

					this.vec2.copy(this.pos);
					this.vec2.add(this.vec1.copy(visAgentWander.trailSegments[0]).sub(visAgentWander.trailSegments[1]).normalize());

				} else {

					this.vec2.copy(this.pos);
					this.vec2.add(this.vec1.copy(visAgentWander.trailSegments[segmentI - 1]).sub(visAgentWander.trailSegments[segmentI]).normalize());

				}

				this.matRot4.lookAt(this.pos, this.vec2, this.up);
				this.q1.setFromRotationMatrix(this.matRot4);

				this.q2.setFromAxisAngle(this.forward, t * Math.PI * 2 * this.numSpineLoops + this.tick * 1.0);
				this.q1.multiply(this.q2);

				spikeData.q.slerp(this.q1, deltaTime * 2.0);

				let scXY = THREE.MathUtils.smoothstep(t, 0, 0.1) * (1.0 - THREE.MathUtils.smoothstep(t, 0.9, 1.0)) * 1.0;
				let sc = Math.max(scXY + Math.sin(t * Math.PI * 2 * 30.0 + this.tick * -3.0) * (scXY * 0.9), 0.3);
				sc = scXY;
				this.scale.setScalar(sc);

				let rndMult = Math.max(scXY + Math.sin(t * Math.PI * 4) * 0.4 + Math.sin(t * Math.PI * 5 - this.tick * 4.0) * 0.4, 0.1);

				this.mat4.compose(this.pos, spikeData.q, this.scale);
				this.pos.setFromMatrixPosition(this.mat4);

				visAgent.spikeMesh.setMatrixAt(i, this.mat4);

			}


			let bodyDirs = visAgent.bodyMesh.geometry.getAttribute("dir");
			let bodyIPos = visAgent.bodyMesh.geometry.getAttribute("iPos");

			for (let i = 0; i < this.numBodyInstances; i++) {

				let t = i / this.numBodyInstances;
				let segmentI = Math.floor(t * visAgentWander.numTrailSegments);
				let segmentT = t * visAgentWander.numTrailSegments - Math.floor(t * visAgentWander.numTrailSegments);

				if (segmentI < visAgentWander.numTrailSegments - 1) {

					this.pos.copy(visAgentWander.trailSegments[segmentI]).lerp(visAgentWander.trailSegments[segmentI + 1], segmentT);

				} else {

					this.pos.copy(visAgentWander.trailSegments[segmentI]);

				}


				if (segmentI == 0) {

					this.vec2.copy(this.pos);
					this.vec2.add(this.vec1.copy(visAgentWander.trailSegments[0]).sub(visAgentWander.trailSegments[1]).normalize());

				} else {

					this.vec2.copy(this.pos);
					this.vec2.add(this.vec1.copy(visAgentWander.trailSegments[segmentI - 1]).sub(visAgentWander.trailSegments[segmentI]).normalize());

				}

				bodyDirs.setXYZ(i, this.vec2.x, this.vec2.y, this.vec2.z);
				bodyIPos.setXYZ(i, this.pos.x, this.pos.y, this.pos.z);

			}

			visAgent.spikeMesh.instanceMatrix.needsUpdate = true;
			bodyDirs.needsUpdate = true;
			bodyIPos.needsUpdate = true;
			spikeIPos.needsUpdate = true;

		}

	}

	return vis;

}

//
//BGs
//

const bgVert = `
uniform vec3 colFront1;
uniform vec3 colFront2;
uniform vec3 colFront3;
uniform vec3 colBack1;
uniform vec3 colBack2;
uniform vec3 colBack3;
uniform vec3 groupPos;
uniform vec3 groupDir;
varying vec4 vCol;

void main() {

	vec4 pos = vec4( position, 1.0 );
	vec4 worldPos = modelMatrix * pos;
	vec4 viewPos = viewMatrix * worldPos;

	vec4 vCol1 = mix( vec4( colFront1, 1.0 ), vec4( colFront2, 1.0 ), clamp( worldPos.y, -2.0, 0.0 ) + 0.5 ) ;
	vCol1 = mix( vCol1, vec4( colFront3, 1.0 ), smoothstep( 0.0, 1.5, worldPos.y ) ) ;

	vec4 vCol2 = mix( vec4( colBack1, 1.0 ), vec4( colBack2, 1.0 ), smoothstep( -1.5, -0.5, worldPos.y ) ) ;
	vCol2 = mix( vCol2, vec4( colBack3, 1.0 ), smoothstep( -0.5, 0.75, worldPos.y ) ) ;
	
	float dir = dot ( cameraPosition - groupPos, groupDir );
	
	//vCol1 = vec4( 1.0, 0.0, 0.0, 1.0 );
	//vCol2 = vec4( 0.0, 0.0, 1.0, 1.0 );
	vCol = mix( vCol1, vCol2, smoothstep( -0.01, 0.01, dir ) );
	
	gl_Position = projectionMatrix * viewPos;
	
}
`;

const bgFrag = `
#define PI 3.141592653589793
varying vec4 vCol;

highp float rand( const in vec2 uv ) {
  const highp float a = 12.9898, b = 78.233, c = 43758.5453;
  highp float dt = dot( uv.xy, vec2( a,b ) ), sn = mod( dt, PI );
  return fract( sin( sn ) * c );
}

vec3 dithering( vec3 color ) {
  float grid_position = rand( gl_FragCoord.xy );
  vec3 dither_shift_RGB = vec3( 0.25 / 255.0, -0.25 / 255.0, 0.25 / 255.0 );
  dither_shift_RGB = mix( 2.0 * dither_shift_RGB, -2.0 * dither_shift_RGB, grid_position );
  return color + dither_shift_RGB;
}

void main() {
	
	gl_FragColor = vCol;
	gl_FragColor.rgb = dithering( gl_FragColor.rgb );
	
}
`;

function createBG(face, uniforms, rot) {

	const geo = new THREE.BoxGeometry(1, 1, 1, 1, 30, 1);
	const mat = new THREE.ShaderMaterial({ uniforms: uniforms, vertexShader: bgVert, fragmentShader: bgFrag });
	mat.side = THREE.BackSide;
	const mesh = new THREE.Mesh(geo, mat);
	mesh.scale.setScalar(3.0);
	mesh.rotation.y = rot;
	face.add(mesh);

	const bgData = {

		mesh: mesh,
		uniforms: uniforms

	};

	return bgData;

}

function updateBGs(data, facePos, faceDir) {

	data.uniforms.groupPos.value = facePos;
	data.uniforms.groupDir.value = faceDir;

}
