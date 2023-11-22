

const numAgents = 2;
const agents = [];
agents.length = numAgents;
const agentTopVis = [];
agentTopVis.length = numAgents;
const agentFrontVis = [];
agentFrontVis.length = numAgents;
const agentLeftVis = [];
agentLeftVis.length = numAgents;
let segmentsVis;
const segmentsVisCols = [0x00FFFF, 0x0FF00FF];

const agentSettings = {};
agentSettings.boundingSphereRadius = 0.5;
agentSettings.wanderSphereDistance = 0.1;
agentSettings.wanderSphereRadius = 8;
agentSettings.wanderAngleMaxChange = 12;
agentSettings.wanderBoundsAngleMaxChange = 12;
agentSettings.maxVelocity = 0.4;
agentSettings.maxSteeringForce = 5;
agentSettings.trailAvoidDist = 0.03;
agentSettings.numTrailSegments = 256;
agentSettings.numTrailBufferMult = 0.125;
agentSettings.dustAvoidDist = 0.04;

const agentSegments = [];
agentSegments.length = numAgents;
const numSegments = agentSettings.numTrailSegments * agentSettings.numTrailBufferMult;
for (let i = 0; i < numAgents; i++) {

	agentSegments[i] = [];
	agentSegments[i].length = numSegments;
	agentSegments[i].fill([0, 0, 0]);

}

//faces and gradient backgrounds
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

	colFront1: {value: new THREE.Color(0x281023)},
	colFront2: {value: new THREE.Color(0x522232)},
	colFront3: {value: new THREE.Color(0x2f2b42)},
	colBack1: {value: new THREE.Color(0x0d0f18)},
	colBack2: {value: new THREE.Color(0x0e2d3b)},
	colBack3: {value: new THREE.Color(0x0c1e25)},
	groupPos: {value: new THREE.Vector3()},
	groupDir: {value: new THREE.Vector3()}

}
const bgLeftUniforms = {

	colFront1: {value: new THREE.Color(0x212E2C)},
	colFront2: {value: new THREE.Color(0x3D5451)},
	colFront3: {value: new THREE.Color(0x48DB9B)},
	colBack1: {value: new THREE.Color(0x02c050a)},
	colBack2: {value: new THREE.Color(0x000000)},
	colBack3: {value: new THREE.Color(0x2c050a)},
	groupPos: {value: new THREE.Vector3()},
	groupDir: {value: new THREE.Vector3()}

}

//dust
let dust;
const numDust = 4096;

function init() {

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

	for (let i = 0; i < numAgents; i++) {

		agents[i] = createAgent(i);
		agentTopVis[i] = vis3(faceTop, i);
		agentFrontVis[i] = vis1(faceFront, i);
		agentLeftVis[i] = vis2(faceLeft, i);

	}

	dust = createDust();
	faceFront.add(dust.meshFront);
	faceLeft.add(dust.meshLeft);
	faceTop.add(dust.meshTop);

}

function update(event) {

	const deltaTime = Math.min(event.delta, 500) * 0.001;
	const time = event.time;

	for (let i = 0; i < numAgents; i++) {

		updateAgent(agents[i], deltaTime);

	}

	for (let i = 0; i < numAgents; i++) {

		agentTopVis[i].update(deltaTime, time);
		agentFrontVis[i].update(deltaTime, time);
		agentLeftVis[i].update(deltaTime, time);

	}

	updateSegments();
	updateBGs(faceFrontBG, frontPos, frontDir);
	updateDust(deltaTime);

}



//
// AGENTS wander, set trail segments, attract heads / repel tails
//

function createAgent(id) {

	const agent = {};

	agent.id = id;

	agent.vec1 = new THREE.Vector3();
	agent.vec2 = new THREE.Vector3();
	agent.vec3 = new THREE.Vector3();
	agent.vec4 = new THREE.Vector3();
	agent.q1 = new THREE.Quaternion();
	agent.forward = new THREE.Vector3(0, 0, 1.0);

	agent.agentPoint = new THREE.Vector3(0.05, 0.05, 0.05);
	agent.agentLookat = new THREE.Object3D();

	agent.centerPoint = new THREE.Vector3();

	agent.currentVelocity = new THREE.Vector3().randomDirection().multiplyScalar(agentSettings.maxVelocity);
	agent.maxVelocitySq = agentSettings.maxVelocity * agentSettings.maxVelocity;

	agent.boundingForce = new THREE.Vector3();

	agent.wanderAngle = new THREE.Quaternion().random();
	agent.wanderSphereCenter = new THREE.Vector3();
	agent.wanderForce = new THREE.Vector3();
	agent.wanderDir = new THREE.Vector3();

	agent.trailAvoidDist = agentSettings.trailAvoidDist * agentSettings.trailAvoidDist;
	agent.trailAvoidForce = new THREE.Vector3();
	agent.trailDropTick = 0;

	agent.trailSegments = [];

	for (let i = 0; i < agentSettings.numTrailSegments; i++) {

		agent.trailSegments.push(new THREE.Vector3());

	}

	return agent;

}

function updateAgent(agent, deltaTime) {

	agent.agentLookat.position.copy(agent.agentPoint);
	agent.vec1.copy(agent.agentPoint);

	//bounds
	agent.vec1.y *= 2.0;
	let distanceFromCenter = agent.vec1.sub(agent.centerPoint).length();
	if (distanceFromCenter > agentSettings.boundingSphereRadius) {
		agent.agentLookat.lookAt(agent.centerPoint);
		agent.wanderAngle.rotateTowards(agent.agentLookat.quaternion, agentSettings.wanderBoundsAngleMaxChange * deltaTime);
	}

	//attract heads
	agent.trailAvoidForce.setScalar(0);
	for (let i = 0; i < numAgents; i++) {
		let otherAgent = agents[i];
		if (agent.id == otherAgent.id) {
			continue;
		}
		let attactMult = 3;
		agent.vec1.copy(otherAgent.agentPoint).sub(agent.agentPoint).normalize().multiplyScalar(attactMult);
		agent.trailAvoidForce.add(agent.vec1);
	}

	//avoid trails
	for (let i = 0; i < numAgents; i++) {
		let otherAgent = agents[i];
		//let jStart = (agent.id == otherAgent.id) ? 10 : 0;
		for (let j = 0; j < agentSettings.numTrailSegments; j++) {
			agent.vec1.copy(otherAgent.trailSegments[j]);
			let dist = agent.vec1.distanceToSquared(agent.agentPoint);
			if (dist < agentSettings.trailAvoidDist) {
				let forceMult = (agentSettings.trailAvoidDist - dist) * 50.0;
				agent.vec1.copy(agent.agentPoint).sub(otherAgent.trailSegments[j]).normalize().multiplyScalar(forceMult);
				agent.trailAvoidForce.add(agent.vec1);
			}
		}
	}

	agent.wanderSphereCenter.copy(agent.currentVelocity).normalize().multiplyScalar(agentSettings.wanderSphereDistance);
	agent.q1.random();
	agent.wanderAngle.rotateTowards(agent.q1, agentSettings.wanderAngleMaxChange * deltaTime);
	agent.wanderForce.setScalar(0);
	agent.wanderDir.copy(agent.forward).applyQuaternion(agent.wanderAngle).multiplyScalar(agentSettings.wanderSphereRadius);
	agent.wanderForce.copy(agent.wanderSphereCenter).add(agent.wanderDir);
	agent.wanderForce.clampLength(0, agentSettings.maxSteeringForce);

	agent.wanderForce.add(agent.trailAvoidForce);
	agent.vec1.copy(agent.wanderForce);

	agent.currentVelocity.add(agent.vec1);
	agent.currentVelocity.clampLength(0, agentSettings.maxVelocity).multiplyScalar(deltaTime);

	agent.agentPoint.add(agent.currentVelocity);

	for (let i = agentSettings.numTrailSegments - 1; i > 0; i--) {

		agent.trailSegments[i].copy(agent.trailSegments[i - 1]);

	}
	agent.trailSegments[0].copy(agent.agentPoint);

}

function updateSegments() {

	let agent, agentSegment;
	for (let i = 0; i < numAgents; i++) {

		agent = agents[i];
		agentSegment = agentSegments[i];

		for (let j = 0; j < agentSettings.numTrailSegments * agentSettings.numTrailBufferMult; j += 1) {

			agentSegment[j] = agent.trailSegments[j * 1 / agentSettings.numTrailBufferMult];

		}

	}

}



//
// visualize agent segments
//

function createSegmentsVis(face) {

	const segmentsVis = {};
	segmentsVis.vizs = [];
	segmentsVis.vizs.length = numAgents

	let vis;
	for (let i = 0; i < numAgents; i++) {

		vis = {};
		vis.geo = new THREE.BufferGeometry();
		const verts = [];
		for (let j = 0; j < agentSegments[i].length; j++) {
			verts.push(0, 0, 0);
		}
		const vertsBuffer = new THREE.Float32BufferAttribute(verts, 3);
		vis.geo.setAttribute("position", vertsBuffer);
		vis.mat = new THREE.PointsMaterial({size: 0.03, sizeAttenuation: true, color: segmentsVisCols[i]});
		vis.points = new THREE.Points(vis.geo, vis.mat);
		face.add(vis.points);
		segmentsVis.vizs[i] = vis;

	}

	return segmentsVis;

}

function updateSegmentsVis() {

	let vis;
	for (let i = 0; i < numAgents; i++) {

		vis = segmentsVis.vizs[i];
		let positions = vis.geo.attributes.position.array;
		for (let j = 0; j < agentSegments[i].length; j++) {

			positions[j * 3] = agentSegments[i][j][0];
			positions[j * 3 + 1] = agentSegments[i][j][1];
			positions[j * 3 + 2] = agentSegments[i][j][2];

		}

		vis.geo.attributes.position.needsUpdate = true;

	}

}



//
//vis1 - front/back
//

const vis1SpikeVert = `
#define PI 3.141592653589793

attribute float spikeT;
uniform float numSegments;
uniform vec3 segments[32];

uniform vec3 col1_1;
uniform vec3 col1_2;
uniform vec3 col2_1;
uniform vec3 col2_2;
varying vec3 vCol;

uniform vec3 groupPos;
uniform vec3 groupDir;

uniform float uTime;
uniform float numSpikeLoops;
uniform float spikeH;

vec2 rotate(vec2 v, float theta){

	float s = sin(theta);
	float c = cos(theta);
	mat2 m = mat2(c, s, -s, c);
	return m * v;

}

mat4 getBasisMat (vec3 heading){

	heading = normalize(heading);
	vec3 left = cross(heading, vec3(0.0, 1.0, 0.0));
	vec3 up = cross(heading, left);
	return mat4(vec4(left, 0.0), vec4(up, 0.0), vec4(heading, 0.0), vec4(0.0, 0.0, 0.0, 1.0));

}

void main() {
	
	vec3 localPos = position.xyz;
	localPos *= smoothstep(spikeT * 8.0 + 0.2, spikeT * 8.0 + 1.0, uTime);

	float scXY = smoothstep(0.0, 0.1, spikeT) * (1.0 - smoothstep(0.9, 1.0, spikeT));
	float sc = max(scXY + sin(spikeT * PI * 2.0 * 30.0 + uTime * -3.0) * (scXY * 0.9), 0.3);
	float rndMult = max(scXY + sin(spikeT * PI * 4.0) * 0.4 + sin(spikeT * PI * 5.0 - uTime * 4.0) * 0.4, 0.1);
	localPos *= rndMult;

	vec3 worldNormal = normal;

	localPos.y += 0.04;
	float vY = localPos.y;
	localPos.xy = rotate(localPos.xy, spikeT * PI * numSpikeLoops);

	worldNormal.xy = rotate(worldNormal.xy, spikeT * PI * numSpikeLoops);
	
	int prevId = int(numSegments * spikeT);
	int nextId = int(min(prevId+1, int(numSegments - 1.0)));
	float t = fract(numSegments * spikeT);
	vec3 prevPos = segments[prevId];
	vec3 nextPos = segments[nextId];
	vec3 iPos = mix(prevPos, nextPos, t);

	vec3 heading1 = (prevId == 0) ? (segments[prevId] - segments[prevId+1]) : (segments[prevId-1] - segments[prevId]);
	vec3 heading2 = segments[prevId] - segments[nextId];
	vec3 heading = mix(heading1, heading2, t);
	heading = normalize(heading);
	mat4 basisMat = getBasisMat(heading);

	localPos = (basisMat * vec4(localPos, 1.0)).xyz;
	vec3 worldPos = iPos + localPos;
	vec4 mvPos = modelViewMatrix * vec4( worldPos, 1.0);
	gl_Position = projectionMatrix * mvPos;

	worldNormal = (modelMatrix * basisMat * vec4(normalize(worldNormal), 1.0)).xyz;
	vec3 lightDir = normalize( vec3( 0.0, -1.0, 0.0 ) );
	
	vec3 vCol1 = col1_1;	
	vec3 vCol2 = col2_1;

	float dir = dot (cameraPosition - groupPos, groupDir);
	float dirT = smoothstep(-0.01, 0.01, dir);

	vCol = mix( vCol1, vCol2, dirT );

	float lightAmt = clamp(dot(lightDir, worldNormal), 0.0, 1.0);
	vCol *= mix( 0.2, 1.2, lightAmt);
	vCol += vec3(lightAmt * 0.2);

	vCol *= smoothstep( 0.04, 0.04 + spikeH, vY );

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
attribute vec3 rndPos;
attribute float bodyT;
uniform vec3 col1;
uniform vec3 col2;
uniform float uTime;

uniform float numSegments;
uniform vec3 segments[32];

varying vec3 vCol;

void main() {
	
	int prevId = int(numSegments * bodyT);
	int nextId = int(min(prevId+1, int(numSegments - 1.0)));
	float t = fract(numSegments * bodyT);
	vec3 prevPos = segments[prevId];
	vec3 nextPos = segments[nextId];
	vec3 iPos = mix(prevPos, nextPos, t);

	float scXY = smoothstep(0.05, 0.1, bodyT);

	vec3 heading = (prevId == 0) ? (segments[prevId] - segments[prevId+1]) : (segments[prevId-1] - segments[prevId]);
	heading = normalize(heading);

	vec3 pos = position;

	float detailRotSpeed = 2.123 * -uTime + bodyT * PI * 2234.0;
	float detailRotDist = 0.01 + ( 1.0 - scXY ) * 0.035 * smoothstep(0.0, 0.05, bodyT) + smoothstep(0.95, 1.0, bodyT) * 0.02;
	pos.x += cos(4.0 + detailRotSpeed) * detailRotDist;
	pos.y += cos(6.0 + detailRotSpeed + PI) * detailRotDist;
	pos.z += cos(7.0 + detailRotSpeed + PI * 2.0) * detailRotDist;

	pos -= heading * 0.01 * smoothstep( 0.2, 0.0, bodyT );
	pos += iPos;

	vec4 mvPos = modelViewMatrix * vec4( pos, 1.0 );
	gl_PointSize = 0.1 * (300.0 / -mvPos.z);
	gl_Position = projectionMatrix * mvPos;
	
	vCol = mix(col1, col2, smoothstep(heading.x, -0.8, 0.8));

}
`;

const vis1BodyFrag = `

varying vec3 vCol;

void main() {

	if (length(gl_PointCoord - vec2(0.5)) > 0.49) {

		discard;

	}
	gl_FragColor = vec4( vCol, 1.0 );

}
`;

function vis1(faceGroup, id) {

	//vis
	const vis = {};
	vis.faceGroup = faceGroup;
	vis.id = id;
	vis.agent = agents[id];
	vis.tick = 0;

	vis.spineElemR = 0.006;
	vis.spineElemH = 0.05;
	vis.bodyElemScale = 0.015;
	vis.numSpikeInstances = 2048;
	vis.numBodyInstances = 512;
	vis.numSpikeLoops = 323;
	vis.visAgents = [];
	vis.cols1 = [0xdf4266, 0xd246d8];
	vis.cols2 = [0xFA85C4, 0x5FEAFA];
	vis.bodyCols = [0xFAE75F, 0xFAA75F];

	vis.spikeUniforms = {
		"col1_1": {value: new THREE.Color(vis.cols1[id])},
		"col1_2": {value: new THREE.Color(vis.cols1[1 - id])},
		"col2_1": {value: new THREE.Color(vis.cols2[id])},
		"col2_2": {value: new THREE.Color(vis.cols2[1 - id])},
		"groupPos": {value: frontPos},
		"groupDir": {value: frontDir},
		"uTime": {value: 0},
		"spikeH": {value: vis.spineElemH},
		"segments": {value: agentSegments[id]},
		"numSegments": {value: numSegments},
		"numSpikeLoops": {value: vis.numSpikeLoops}
	};

	vis.spikeMat = new THREE.ShaderMaterial({uniforms: vis.spikeUniforms, vertexShader: vis1SpikeVert, fragmentShader: vis1SpikeFrag});
	vis.spikeGeo = new THREE.ConeGeometry(vis.spineElemR, vis.spineElemH, 5, 1);
	vis.spikeGeo.translate(0, vis.spineElemH * 0.5, 0);
	vis.spikeMesh = new THREE.InstancedMesh(vis.spikeGeo, vis.spikeMat, vis.numSpikeInstances);
	faceGroup.add(vis.spikeMesh);

	const spikeTs = new Float32Array(vis.numSpikeInstances);
	for (let i = 0; i < vis.numSpikeInstances; i++) {

		spikeTs[i] = i / (vis.numSpikeInstances - 1);

	}
	const spikeTsBuffer = new THREE.InstancedBufferAttribute(spikeTs, 1);
	vis.spikeGeo.setAttribute('spikeT', spikeTsBuffer);

	vis.bodyUniforms = {
		"col1": {value: new THREE.Color(vis.bodyCols[id])},
		"col2": {value: new THREE.Color(vis.bodyCols[1 - id])},
		"uTime": {value: 0},
		"segments": {value: agentSegments[id]},
		"numSegments": {value: numSegments}
	};

	vis.bodyMat = new THREE.ShaderMaterial({uniforms: vis.bodyUniforms, vertexShader: vis1BodyVert, fragmentShader: vis1BodyFrag});
	vis.bodyMat.blending = THREE.AdditiveBlending;

	vis.bodyGeo = new THREE.BufferGeometry();

	const bodyPositions = new Float32Array(vis.numBodyInstances * 3);
	const bodyRndPos = new Float32Array(vis.numBodyInstances * 3);
	const bodyTs = new Float32Array(vis.numBodyInstances);
	let rnd = new THREE.Vector3();

	for (let i = 0; i < vis.numBodyInstances; i++) {

		rnd.randomDirection().multiplyScalar(0.05);
		bodyRndPos[i * 3] = rnd.x;
		bodyRndPos[i * 3 + 1] = rnd.y;
		bodyRndPos[i * 3 + 2] = rnd.z;

		bodyTs[i] = i / (vis.numBodyInstances - 1);

		bodyPositions[i * 3] = 0;
		bodyPositions[i * 3 + 1] = 0;
		bodyPositions[i * 3 + 2] = 0;

	}

	vis.bodyGeo.setAttribute('rndPos', new THREE.BufferAttribute(bodyRndPos, 3));
	vis.bodyGeo.setAttribute('bodyT', new THREE.BufferAttribute(bodyTs, 1));
	vis.bodyGeo.setAttribute('position', new THREE.BufferAttribute(bodyPositions, 3));

	vis.bodyMesh = new THREE.Points(vis.bodyGeo, vis.bodyMat);
	faceGroup.add(vis.bodyMesh);

	vis.update = function (deltaTime, time) {

		this.tick += deltaTime;
		this.spikeUniforms.segments.value = agentSegments[this.id];
		this.spikeUniforms.uTime.value = this.tick;
		this.bodyUniforms.segments.value = agentSegments[this.id];
		this.bodyUniforms.uTime.value = this.tick;

	}

	return vis;

}



//
//vis2 - left/right
//

const vis2SpikeVert = `
#define PI 3.141592653589793

attribute float spikeT;
uniform float numSegments;
uniform vec3 segments[32];

uniform vec3 col1_1;
uniform vec3 col1_2;
uniform vec3 col2_1;
uniform vec3 col2_2;
varying vec3 vCol;

uniform vec3 groupPos;
uniform vec3 groupDir;

uniform float uTime;
uniform float numSpikeLoops;
uniform float spikeH;

vec2 rotate(vec2 v, float theta){

	float s = sin(theta);
	float c = cos(theta);
	mat2 m = mat2(c, s, -s, c);
	return m * v;

}

mat4 getBasisMat (vec3 heading){

	heading = normalize(heading);
	vec3 left = cross(heading, vec3(0.0, 1.0, 0.0));
	vec3 up = cross(heading, left);
	return mat4(vec4(left, 0.0), vec4(up, 0.0), vec4(heading, 0.0), vec4(0.0, 0.0, 0.0, 1.0));

}

void main() {
	
	vec3 localPos = position.xyz;
	localPos *= smoothstep(spikeT * 8.0 + 0.2, spikeT * 8.0 + 1.0, uTime);

	float scXY = smoothstep(0.0, 0.1, spikeT) * (1.0 - smoothstep(0.9, 1.0, spikeT));
	float sc = max(scXY + sin(spikeT * PI * 223.0 + uTime * -4.0) * (scXY * 0.9), 0.3);
	localPos *= sc;

	vec3 worldNormal = normal;

	localPos.y += 0.04;
	float vY = localPos.y;
	localPos.xy = rotate(localPos.xy, spikeT * PI * numSpikeLoops);

	worldNormal.xy = rotate(worldNormal.xy, spikeT * PI * numSpikeLoops);
	
	int prevId = int(numSegments * spikeT);
	int nextId = int(min(prevId+1, int(numSegments - 1.0)));
	float t = fract(numSegments * spikeT);
	vec3 prevPos = segments[prevId];
	vec3 nextPos = segments[nextId];
	vec3 iPos = mix(prevPos, nextPos, t);

	vec3 heading1 = (prevId == 0) ? (segments[prevId] - segments[prevId+1]) : (segments[prevId-1] - segments[prevId]);
	vec3 heading2 = segments[prevId] - segments[nextId];
	vec3 heading = mix(heading1, heading2, t);
	heading = normalize(heading);
	mat4 basisMat = getBasisMat(heading);

	localPos = (basisMat * vec4(localPos, 1.0)).xyz;
	vec3 worldPos = iPos + localPos;
	vec4 mvPos = modelViewMatrix * vec4( worldPos, 1.0);
	gl_Position = projectionMatrix * mvPos;

	worldNormal = (modelMatrix * basisMat * vec4(normalize(worldNormal), 1.0)).xyz;
	vec3 lightDir = normalize( vec3( 0.0, -1.0, 0.0 ) );
	
	vec3 vCol1 = col1_1;	
	vec3 vCol2 = col2_1;

	float dir = dot (cameraPosition - groupPos, groupDir);
	float dirT = smoothstep(-0.01, 0.01, dir);

	vCol = mix( vCol1, vCol2, dirT );

	float lightAmt = clamp(dot(lightDir, worldNormal), 0.0, 1.0);
	vCol *= mix( 0.2, 1.2, lightAmt);
	vCol += vec3(lightAmt * 0.2);

	vCol *= smoothstep( 0.04, 0.04 + spikeH, vY );

}
`;

const vis2SpikeFrag = `

varying vec3 vCol;

void main() {

	gl_FragColor = vec4( vCol, 1.0 );

}
`;

const vis2BodyVert = `

#define PI 3.141592653589793
attribute vec3 rndPos;
attribute float bodyT;
uniform vec3 col1;
uniform vec3 col2;
uniform float uTime;

uniform float numSegments;
uniform vec3 segments[32];

varying vec3 vCol;

void main() {
	
	int prevId = int(numSegments * bodyT);
	int nextId = int(min(prevId+1, int(numSegments - 1.0)));
	float t = fract(numSegments * bodyT);
	vec3 prevPos = segments[prevId];
	vec3 nextPos = segments[nextId];
	vec3 iPos = mix(prevPos, nextPos, t);

	float scXY = smoothstep(0.0, 0.03, bodyT);

	vec3 heading = (prevId == 0) ? (segments[prevId] - segments[prevId+1]) : (segments[prevId-1] - segments[prevId]);
	heading = normalize(heading);

	vec3 pos = position;

	pos -= heading * 0.01 * smoothstep( 0.2, 0.0, bodyT );
	float moveFreq = sin(uTime * -4.0 + t * PI * 4.0);
	pos += iPos + rndPos * 0.4 * scXY * moveFreq;

	vec4 mvPos = modelViewMatrix * vec4( pos, 1.0 );
	gl_PointSize = 0.1 * (300.0 / -mvPos.z);
	gl_Position = projectionMatrix * mvPos;
	
	vCol = mix(col1, col2, moveFreq * 0.5 + 0.5);

}
`;

const vis2BodyFrag = `

varying vec3 vCol;

void main() {

	if (length(gl_PointCoord - vec2(0.5)) > 0.49) {

		discard;

	}
	gl_FragColor = vec4( vCol, 1.0 );

}
`;

function vis2(faceGroup, id) {

	//vis
	const vis = {};
	vis.faceGroup = faceGroup;
	vis.id = id;
	vis.agent = agents[id];
	vis.tick = 0;

	vis.spineElemR = 0.02;
	vis.spineElemH = 0.05;
	vis.bodyElemScale = 0.015;
	vis.numSpikeInstances = 1024;
	vis.numBodyInstances = 512;
	vis.numSpikeLoops = 122;
	vis.visAgents = [];
	vis.cols1 = [0xFA323A, 0x31FAA9];
	vis.cols2 = [0xFA323A, 0x31FAA9];
	vis.bodyCols = [0xFA5B0A, 0xFAB860];

	vis.spikeUniforms = {
		"col1_1": {value: new THREE.Color(vis.cols1[id])},
		"col1_2": {value: new THREE.Color(vis.cols1[1 - id])},
		"col2_1": {value: new THREE.Color(vis.cols2[id])},
		"col2_2": {value: new THREE.Color(vis.cols2[1 - id])},
		"groupPos": {value: leftPos},
		"groupDir": {value: leftDir},
		"uTime": {value: 0},
		"spikeH": {value: vis.spineElemH},
		"segments": {value: agentSegments[id]},
		"numSegments": {value: numSegments},
		"numSpikeLoops": {value: vis.numSpikeLoops}
	};

	vis.spikeMat = new THREE.ShaderMaterial({uniforms: vis.spikeUniforms, vertexShader: vis2SpikeVert, fragmentShader: vis2SpikeFrag});
	vis.spikeGeo = new THREE.ConeGeometry(vis.spineElemR, vis.spineElemH, 8, 1);
	vis.spikeGeo.translate(0, vis.spineElemH * 0.5, 0);
	vis.spikeMesh = new THREE.InstancedMesh(vis.spikeGeo, vis.spikeMat, vis.numSpikeInstances);
	faceGroup.add(vis.spikeMesh);

	const spikeTs = new Float32Array(vis.numSpikeInstances);
	for (let i = 0; i < vis.numSpikeInstances; i++) {

		spikeTs[i] = i / (vis.numSpikeInstances - 1);

	}
	const spikeTsBuffer = new THREE.InstancedBufferAttribute(spikeTs, 1);
	vis.spikeGeo.setAttribute('spikeT', spikeTsBuffer);

	vis.bodyUniforms = {
		"col1": {value: new THREE.Color(vis.bodyCols[id])},
		"col2": {value: new THREE.Color(vis.bodyCols[1 - id])},
		"uTime": {value: 0},
		"segments": {value: agentSegments[id]},
		"numSegments": {value: numSegments}
	};

	vis.bodyMat = new THREE.ShaderMaterial({uniforms: vis.bodyUniforms, vertexShader: vis2BodyVert, fragmentShader: vis2BodyFrag});
	vis.bodyMat.blending = THREE.AdditiveBlending;

	vis.bodyGeo = new THREE.BufferGeometry();

	const bodyPositions = new Float32Array(vis.numBodyInstances * 3);
	const bodyRndPos = new Float32Array(vis.numBodyInstances * 3);
	const bodyTs = new Float32Array(vis.numBodyInstances);
	let rnd = new THREE.Vector3();

	for (let i = 0; i < vis.numBodyInstances; i++) {

		rnd.randomDirection().multiplyScalar(0.05);
		bodyRndPos[i * 3] = rnd.x;
		bodyRndPos[i * 3 + 1] = rnd.y;
		bodyRndPos[i * 3 + 2] = rnd.z;

		bodyTs[i] = i / (vis.numBodyInstances - 1);

		bodyPositions[i * 3] = 0;
		bodyPositions[i * 3 + 1] = 0;
		bodyPositions[i * 3 + 2] = 0;

	}

	vis.bodyGeo.setAttribute('rndPos', new THREE.BufferAttribute(bodyRndPos, 3));
	vis.bodyGeo.setAttribute('bodyT', new THREE.BufferAttribute(bodyTs, 1));
	vis.bodyGeo.setAttribute('position', new THREE.BufferAttribute(bodyPositions, 3));

	vis.bodyMesh = new THREE.Points(vis.bodyGeo, vis.bodyMat);
	faceGroup.add(vis.bodyMesh);

	vis.update = function (deltaTime, time) {

		this.tick += deltaTime;
		this.spikeUniforms.segments.value = agentSegments[this.id];
		this.spikeUniforms.uTime.value = this.tick;
		this.bodyUniforms.segments.value = agentSegments[this.id];
		this.bodyUniforms.uTime.value = this.tick;

	}

	return vis;

}



//
//vis3 - top/bottom
//

const vis3BodyVert = `

#define PI 3.141592653589793

attribute float bodyT;
attribute vec3 bodyRnd;
uniform vec3 col1;
uniform vec3 col2;
uniform float uTime;

uniform float numSegments;
uniform vec3 segments[32];

varying vec3 vCol;

void main() {

	float taper = max( smoothstep( 0.0, 0.2, bodyT ) * ( 1.0 - smoothstep( 0.8, 1.0, bodyT ) ), 0.2 );
	//float sc = max( scXY + sin( bodyT * PI * 2.0 * 30.0 + uTime * - 3.0 ) * scXY, 0.3 );
	float animMult = max ( taper * sin( bodyT * PI * 4.0 + uTime ) * 0.4 + taper * sin( bodyT * PI * 5.0 - uTime * 4.0 ) * 0.4, 0.5 );
	
	vec3 localPos = ( position * taper + bodyRnd * animMult ) * taper;

	int id = int(numSegments * bodyT);
	int nextId = int(min(id+1, int(numSegments - 1.0)));
	float t = fract(numSegments * bodyT);
	vec3 pos1 = segments[id];
	vec3 pos2 = segments[nextId];
	vec3 iPos = mix(pos1, pos2, t);

	vec4 mvPos = modelViewMatrix * vec4(iPos, 1.0 );
	mvPos.xyz += localPos;
	gl_Position = projectionMatrix * mvPos;

	vCol = mix(col1, col2, sin(uTime * 8.0 + bodyT * PI * 45.0) * 0.5 + 0.5);

}
`;

const vis3BodyFrag = `

uniform float uTime;

varying vec3 vCol;

void main() {

	gl_FragColor = vec4( vCol, 1.0 );

}
`;



function vis3(faceGroup, id) {

	const vis = {};
	vis.faceGroup = faceGroup;
	vis.id = id;
	vis.agent = agents[id];
	vis.tick = 0;
	vis.numBodyInstances = 1024;
	vis.bodyElemScale = 0.004;
	vis.bodyCols = [0x333333, 0xCCCCCC];

	vis.bodyUniforms = {
		"col1": {value: new THREE.Color(vis.bodyCols[id])},
		"col2": {value: new THREE.Color(vis.bodyCols[1 - id])},
		"uTime": {value: 0},
		"segments": {value: agentSegments[id]},
		"numSegments": {value: numSegments}
	};

	vis.bodyMat = new THREE.ShaderMaterial({uniforms: vis.bodyUniforms, vertexShader: vis3BodyVert, fragmentShader: vis3BodyFrag});
	//bodyMat.blending = THREE.AdditiveBlending;

	vis.bodyGeo = new THREE.CircleGeometry(vis.bodyElemScale, 8);
	vis.bodyMesh = new THREE.InstancedMesh(vis.bodyGeo, vis.bodyMat, vis.numBodyInstances);
	faceGroup.add(vis.bodyMesh);

	const bodyTs = new Float32Array(vis.numBodyInstances);
	const bodyRndPos = new Float32Array(vis.numBodyInstances * 3);
	for (let i = 0; i < vis.numBodyInstances; i++) {

		bodyTs[i] = i / (vis.numBodyInstances - 1);
		let rnd = new THREE.Vector3().randomDirection().multiplyScalar(0.1);
		bodyRndPos[i * 3] = rnd.x;
		bodyRndPos[i * 3 + 1] = rnd.y;
		bodyRndPos[i * 3 + 2] = rnd.z;

	}
	const bodyTsBuffer = new THREE.InstancedBufferAttribute(bodyTs, 1);
	vis.bodyGeo.setAttribute('bodyT', bodyTsBuffer);
	const bodyRndsBuffer = new THREE.InstancedBufferAttribute(bodyRndPos, 3);
	vis.bodyGeo.setAttribute('bodyRnd', bodyRndsBuffer);

	vis.update = function (deltaTime, time) {

		this.tick += deltaTime;
		this.bodyUniforms.segments.value = agentSegments[this.id];
		this.bodyUniforms.uTime.value = this.tick;

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
	const mat = new THREE.ShaderMaterial({uniforms: uniforms, vertexShader: bgVert, fragmentShader: bgFrag});
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



//
//dust
//

const dustVert = `

attribute vec3 iPos;
attribute float t;

uniform vec3 headsPos[2];
uniform float uTime;
uniform vec3 col;

varying vec3 vCol;

void main() {
	#define PI 3.141592653589793
	
	vec3 pos = iPos;
	float lissaW = 0.05;
	float lissaH = 0.025;
	float lissaA = 2.0;
	float lissaB = 3.0;
	float lissaC = 5.0;
	float floatSpeed = uTime * 0.08;
	pos.x += lissaW * sin(lissaA * floatSpeed + PI * 2.0 * t);
	pos.y += lissaH * sin(lissaB * floatSpeed + PI + PI * 2.0 * t);
	pos.y += lissaW * sin(lissaC * floatSpeed + PI * 2.0 + PI * 2.0 * t);

	float maxOffsetDist = 0.2;

	vec3 toHead = headsPos[0] - pos;
	float dist = length(toHead);
	vec3 offset = -toHead * smoothstep( maxOffsetDist, 0.03, dist);
	float activate = smoothstep(0.3, 0.02, dist);
	toHead = headsPos[1] - pos;
	dist = length(toHead);
	offset += -toHead * smoothstep( maxOffsetDist, 0.03, dist);
	activate += smoothstep(0.3, 0.02, dist);
	activate = min(activate, 1.0);

	pos += offset;

	vec4 mvPos = modelViewMatrix * vec4( pos, 1.0 );
	mvPos.xyz += position;
	gl_Position = projectionMatrix * mvPos;	

	vCol = col + vec3( 0.2, 0.4, 0.5 ) * activate;

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
	dust.tick = 0;
	const points = new Float32Array(numDust * 3);
	const ts = new Float32Array(numDust);
	const cubeW = 1;
	for (let i = 0; i < numDust; i++) {

		let x = THREE.MathUtils.randFloatSpread(cubeW);
		let y = THREE.MathUtils.randFloatSpread(cubeW);
		let z = THREE.MathUtils.randFloatSpread(cubeW);

		points[i * 3] = x;
		points[i * 3 + 1] = y;
		points[i * 3 + 2] = z;

		ts[i] = i / (numDust - 1);

	}

	dust.headsPos = [new THREE.Vector3(), new THREE.Vector3()];

	dust.dustUniforms = {

		col: {value: new THREE.Color(0x222244)},
		headsPos: {value: dust.headsPos},
		uTime: {value: 0}

	}

	const mat = new THREE.ShaderMaterial({uniforms: dust.dustUniforms, vertexShader: dustVert, fragmentShader: dustFrag});
	mat.blending = THREE.AdditiveBlending;

	const dustGeo = new THREE.CircleGeometry(0.0015, 5);

	const pointBuffer = new THREE.InstancedBufferAttribute(points, 3);
	dustGeo.setAttribute('iPos', pointBuffer);

	const tsBuffer = new THREE.InstancedBufferAttribute(ts, 1);
	dustGeo.setAttribute('t', tsBuffer);

	const dustMeshFront = new THREE.InstancedMesh(dustGeo, mat, numDust);
	const dustMeshLeft = new THREE.InstancedMesh(dustGeo, mat, numDust);
	const dustMeshTop = new THREE.InstancedMesh(dustGeo, mat, numDust);

	dust.meshFront = dustMeshFront;
	dust.meshLeft = dustMeshLeft;
	dust.meshTop = dustMeshTop;
	dust.geo = dustGeo;
	dust.mat = mat;

	return dust;

}

function updateDust(deltaTime) {

	dust.tick += deltaTime;

	for (let i = 0; i < numAgents; i++) {

		dust.headsPos[i].copy(agents[i].trailSegments[0]);

	}

	dust.dustUniforms.headsPos.value = dust.headsPos;
	dust.dustUniforms.uTime.value = dust.tick;

}









/*

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
				for ( let k = 0; k < otherVisAgent.agent.wander.trailSegments.length; k++ ) {
					
					dist = this.pos.distanceToSquared( otherVisAgent.agent.wander.trailSegments[ k ] );
					if ( dist < closestDist ) {
						
						closestDist = dist;
						
					}
					
				}
				activates.array[ i ] = ( maxDist - Math.min( closestDist, maxDist ) ) / maxDist;
				
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

			spikeT[i] = i / (vis.numSpineInstances- 1);

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
				let spikeData = visAgent.spikeData[ i ];

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
				this.pos.setFromMatrixPosition( this.mat4 );

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


*/