

const numAgents = 2;
const agents = [];
agents.length = numAgents;
const agentsVis = [];
agentsVis.length = numAgents;
let segmentsVis;
const segmentsVisCols = [0x00FFFF, 0x0FF00FF];

const agentSettings = {};
agentSettings.boundingSphereRadius = 0.25;
agentSettings.wanderSphereDistance = 0.1;
agentSettings.wanderSphereRadius = 8;
agentSettings.wanderAngleMaxChange = 12;
agentSettings.wanderBoundsAngleMaxChange = 50;
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
let faceBack;
let faceTop;
let faceBottom;
let faceLeft;
let faceRight;
let faceFrontBG;
let faceBackBG;
let faceTopBG;
let faceBottomBG;
let faceLeftBG;
let faceRightBG;
let faces;

const visUniforms = [

	{
		spineElemR: 0.04,
		spineElemH: 0.04,
		bodyElemScale: 0.015,
		numSpikeLoops: 387,
		col1: 0x010824,
		col2: 0xb05452,
		bodyCol: 0xFAE75F
	},
	{
		spineElemR: 0.04,
		spineElemH: 0.04,
		bodyElemScale: 0.015,
		numSpikeLoops: 387,
		col1: 0xdf4266,
		bodyCol: 0xFAA75F
	},
	{
		spineElemR: 0.04,
		spineElemH: 0.04,
		bodyElemScale: 0.015,
		numSpikeLoops: 387,
		col1: 0xdf4266,
		bodyCol: 0xFAE75F
	}, {
		spineElemR: 0.04,
		spineElemH: 0.04,
		bodyElemScale: 0.015,
		numSpikeLoops: 387,
		col1: 0xdf4266,
		bodyCol: 0xFAA75F
	}

];

const bgFrontUniforms = {

	col1: {value: new THREE.Color(0x010824)},
	col2: {value: new THREE.Color(0xb05452)},

}
const bgBackUniforms = {

	col1: {value: new THREE.Color(0x522232)},
	col2: {value: new THREE.Color(0x0d0f18)},

}
const bgTopUniforms = {

	col1: {value: new THREE.Color(0x0c1e25)},
	col2: {value: new THREE.Color(0x0e2d3b)},

}
const bgBottomUniforms = {

	col1: {value: new THREE.Color(0x265242)},
	col2: {value: new THREE.Color(0x21634D)},

}
const bgLeftUniforms = {

	col1: {value: new THREE.Color(0x48DB9B)},
	col2: {value: new THREE.Color(0x724138)},

}
const bgRightUniforms = {

	col1: {value: new THREE.Color(0x996455)},
	col2: {value: new THREE.Color(0xF0B297)},

}

//dust
let dust;
const numDust = 2048;

function init() {

	faceFront = this.getObjectByName("faceFront");
	faceFrontBG = createBG(faceFront, bgFrontUniforms, 0);
	faceBack = this.getObjectByName("faceBack");
	faceBackBG = createBG(faceBack, bgBackUniforms, 0);
	faceLeft = this.getObjectByName("faceLeft");
	faceLeftBG = createBG(faceLeft, bgLeftUniforms, 0);
	faceRight = this.getObjectByName("faceRight");
	faceRightBG = createBG(faceRight, bgRightUniforms, 0);
	faceTop = this.getObjectByName("faceTop");
	faceTopBG = createBG(faceTop, bgTopUniforms, 0);
	faceBottom = this.getObjectByName("faceBottom");
	faceBottomBG = createBG(faceBottom, bgBottomUniforms, 0);
	faces = [faceFront, faceBack, faceLeft, faceRight, faceTop, faceBottom];

	for (let i = 0; i < numAgents; i++) {

		agents[i] = createAgent(i);
		agentsVis[i] = vis(i, faces);

	}

	dust = createDust();
	faceFront.add(dust.meshFront);
	faceBack.add(dust.meshBack);
	faceLeft.add(dust.meshLeft);
	faceRight.add(dust.meshRight);
	faceTop.add(dust.meshTop);
	faceBottom.add(dust.meshBottom);

}

function update(event) {

	const deltaTime = Math.min(event.delta, 500) * 0.001;
	const time = event.time;

	for (let i = 0; i < numAgents; i++) {

		updateAgent(agents[i], deltaTime);

	}

	updateSegments();

	for (let i = 0; i < numAgents; i++) {

		agentsVis[i].update(deltaTime, time);

	}

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
//agent vis
//

const visSpikeVert = `
#define PI 3.141592653589793

attribute float spikeT;
uniform float numSegments;
uniform vec3 segments[32];

uniform vec3 col1;
uniform vec3 col2;
varying vec3 vCol;

uniform float uTime;
uniform float numSpikeLoops;
uniform float spikeH;

vec2 rotate(vec2 v, float theta){

	float s = sin(theta);
	float c = cos(theta);
	mat2 m = mat2(c, s, -s, c);
	return m * v;

}

mat4 getBasisMat (vec3 heading, vec3 pos){

	heading = normalize(heading);
	vec3 left = cross(heading, normalize(pos));
	vec3 up = cross(heading, left);
	return mat4(vec4(left, 0.0), vec4(up, 0.0), vec4(heading, 0.0), vec4(0.0, 0.0, 0.0, 1.0));

}

void main() {
	
	vec3 localPos = position.xyz;
	localPos *= smoothstep(spikeT * 8.0 + 0.2, spikeT * 8.0 + 1.0, uTime);

	float scXY = smoothstep(0.0, 0.1, spikeT) * (1.0 - smoothstep(0.9, 1.0, spikeT));

	vec3 worldNormal = normal;

	localPos.y += 0.04;
	float vY = localPos.y;

	localPos *= mix( 0.1, 1.0, smoothstep(0.0, 0.1, spikeT) * smoothstep(1.0, 0.9, spikeT));
	
	localPos *= 1.0 - ( sin(-uTime * 3.0 + spikeT * PI * 122.0) * 0.5 + 0.5 ) * 0.95 * ( smoothstep(0.2, 0.3, spikeT ) * smoothstep( 0.8, 0.6, spikeT ) );

	//localPos += sin(spikeT * PI * 12.0 - uTime * 2.0) * 0.02 * scXY;

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
	mat4 basisMat = getBasisMat(heading, segments[prevId]);

	localPos = (basisMat * vec4(localPos, 1.0)).xyz;
	vec3 worldPos = iPos + localPos - heading * smoothstep(0.05, 0.0, spikeT) * 0.1;
	vec4 mvPos = modelViewMatrix * vec4( worldPos, 1.0);
	gl_Position = projectionMatrix * mvPos;

	worldNormal = (modelMatrix * basisMat * vec4(normalize(worldNormal), 1.0)).xyz;
	vec3 lightDir = normalize( vec3( 1.0, -1.0, 0.0 ) );
	
	vCol = col1;

	float lightAmt = clamp(dot(lightDir, worldNormal), 0.0, 1.0);
	vCol *= mix( 0.1, 1.2, lightAmt);
	vCol += vec3(lightAmt * 0.8, lightAmt * 0.2, lightAmt * 0.8);

	//vCol *= ( mod( float(prevId), 3.0 ) == 0.0 ) ? 0.0 : 1.0;

	vCol *= smoothstep( 0.05, 0.05 + spikeH, vY );

}
`;

const visSpikeFrag = `

varying vec3 vCol;

void main() {

	gl_FragColor = vec4( vCol, 1.0 );

}
`;

const visBodyVert = `

#define PI 3.141592653589793
attribute vec3 rndPos;
attribute float bodyT;
uniform vec3 col1;
uniform vec3 col2;
uniform float uTime;
uniform float pixelRatio;

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

	float scXY = smoothstep(0.02, 0.05, bodyT);

	vec3 heading = (prevId == 0) ? (segments[prevId] - segments[prevId+1]) : (segments[prevId-1] - segments[prevId]);
	heading = normalize(heading);

	vec3 pos = position;

	float detailRotSpeed = 2.123 * -uTime + bodyT * PI * 2234.0;
	float detailRotDist = 0.01 + ( 1.0 - scXY ) * 0.035 * smoothstep(0.0, 0.02, bodyT) + smoothstep(0.95, 1.0, bodyT) * 0.02;
	pos.x += cos(4.0 + detailRotSpeed) * detailRotDist;
	pos.y += cos(6.0 + detailRotSpeed + PI) * detailRotDist;
	pos.z += cos(7.0 + detailRotSpeed + PI * 2.0) * detailRotDist;

	//pos -= heading * 0.01 * smoothstep( 0.2, 0.0, bodyT );
	pos += iPos;

	vec4 mvPos = modelViewMatrix * vec4( pos, 1.0 );
	gl_PointSize = 0.025 * (300.0 / -mvPos.z) * pixelRatio;
	gl_Position = projectionMatrix * mvPos;
	
	vCol = mix(col1, col2, smoothstep(heading.x, -0.8, 0.8));

}
`;

const visBodyFrag = `

varying vec3 vCol;

void main() {

	if (length(gl_PointCoord - vec2(0.5)) > 0.49) {

		discard;

	}
	gl_FragColor = vec4( vCol, 1.0 );

}
`;

function vis(id, faces) {

	//vis
	const vis = {};
	vis.id = id;
	vis.agent = agents[id];
	vis.tick = 0;

	vis.spineElemR = 0.04;
	vis.spineElemH = 0.07;
	vis.bodyElemScale = 0.015;
	vis.numSpikeInstances = 512;
	vis.numBodyInstances = 512;
	vis.numSpikeLoops = 387;
	vis.cols1 = [0xdf4266, 0xd246d8];
	vis.cols2 = [0xFA85C4, 0x5FEAFA];
	vis.bodyCols = [0xFAE75F, 0xFAA75F];

	vis.spikeUniforms = {
		"col1": {value: new THREE.Color(vis.cols1[id])},
		"col2": {value: new THREE.Color(vis.cols1[1 - id])},
		"uTime": {value: 0},
		"spikeH": {value: vis.spineElemH},
		"segments": {value: agentSegments[id]},
		"numSegments": {value: numSegments},
		"numSpikeLoops": {value: vis.numSpikeLoops}
	};

	vis.spikeMat = new THREE.ShaderMaterial({uniforms: vis.spikeUniforms, vertexShader: visSpikeVert, fragmentShader: visSpikeFrag});
	vis.spikeGeo = new THREE.ConeGeometry(vis.spineElemR, vis.spineElemH, 5, 1);
	vis.spikeGeo.translate(0, vis.spineElemH * 0.5, 0);

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
		"numSegments": {value: numSegments},
		"pixelRatio": {value: window.devicePixelRatio}
	};

	vis.bodyMat = new THREE.ShaderMaterial({uniforms: vis.bodyUniforms, vertexShader: visBodyVert, fragmentShader: visBodyFrag});
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


	let spikeMesh;
	let bodyMesh;
	for (let i = 0; i < faces.length; i++) {

		spikeMesh = new THREE.InstancedMesh(vis.spikeGeo, vis.spikeMat, vis.numSpikeInstances);
		bodyMesh = new THREE.Points(vis.bodyGeo, vis.bodyMat);
		faces[i].add(bodyMesh);
		faces[i].add(spikeMesh);
		console.log(faces[i]);

	}

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
//BGs
//

const bgVert = `
uniform vec3 col1;
uniform vec3 col2;
varying vec4 vCol;

void main() {

	vec4 pos = vec4( position, 1.0 );
	vec4 worldPos = modelMatrix * pos;
	vec4 viewPos = viewMatrix * worldPos;

	vec4 col = mix( vec4( col1, 1.0 ), vec4( 0.0 ), smoothstep( -1.0, -0.5, worldPos.y ) );
	col = mix( col, vec4( col2, 1.0 ), smoothstep( 0.5, 1.0, worldPos.y ) );
	vCol = col;
	gl_Position = projectionMatrix * viewPos;
	
}
`;

const bgFrag = `
#define PI 3.141592653589793
varying vec4 vCol;

highp float rand( const in vec2 uv ) {
  const highp float a = 12.1234, b = 78.9898, c = 34456.5678;
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
	mesh.scale.setScalar(2.0);
	face.add(mesh);

	const bgData = {

		mesh: mesh,
		uniforms: uniforms

	};

	return bgData;

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

	const dustGeo = new THREE.CircleGeometry(0.0015, 7);

	const pointBuffer = new THREE.InstancedBufferAttribute(points, 3);
	dustGeo.setAttribute('iPos', pointBuffer);

	const tsBuffer = new THREE.InstancedBufferAttribute(ts, 1);
	dustGeo.setAttribute('t', tsBuffer);

	const dustMeshFront = new THREE.InstancedMesh(dustGeo, mat, numDust);
	const dustMeshBack = new THREE.InstancedMesh(dustGeo, mat, numDust);
	const dustMeshLeft = new THREE.InstancedMesh(dustGeo, mat, numDust);
	const dustMeshRight = new THREE.InstancedMesh(dustGeo, mat, numDust);
	const dustMeshTop = new THREE.InstancedMesh(dustGeo, mat, numDust);
	const dustMeshBottom = new THREE.InstancedMesh(dustGeo, mat, numDust);

	dust.meshFront = dustMeshFront;
	dust.meshBack = dustMeshBack;
	dust.meshLeft = dustMeshLeft;
	dust.meshRight = dustMeshRight;
	dust.meshTop = dustMeshTop;
	dust.meshBottom = dustMeshBottom;
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

