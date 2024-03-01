function onKeyUp(e) {

	if (e.keyCode == 38) {

		agentsVis[0].faceVizs[2].spikeUniforms.numSpikeLoops.value += 1;

	} else if (e.keyCode == 40) {

		agentsVis[0].faceVizs[2].spikeUniforms.numSpikeLoops.value -= 1;

	}

	console.log(agentsVis[0].faceVizs[2].spikeUniforms.numSpikeLoops);

}
//window.addEventListener("keyup", onKeyUp.bind(this));


const numAgents = 2;
const agents = [];
agents.length = numAgents;
const agentsVis = [];
agentsVis.length = numAgents;

const agentSettings = {};
agentSettings.boundingSphereRadius = 0.25;
agentSettings.wanderSphereDistance = 0.1;
agentSettings.wanderSphereRadius = 8;
agentSettings.wanderAngleMaxChange = 30;
agentSettings.wanderBoundsAngleMaxChange = 50;
agentSettings.maxVelocity = 0.4;
agentSettings.maxSteeringForce = 0.8;
agentSettings.trailAvoidDist = 0.07;
agentSettings.numTrailSegments = 256;
agentSettings.numTrailBufferMult = 0.25;
agentSettings.dustAvoidDist = 0.04;

const agentSegments = [];
const agentHeadings = [];
agentSegments.length = numAgents;
agentHeadings.length = numAgents;
const numSegments = agentSettings.numTrailSegments * agentSettings.numTrailBufferMult;
for (let i = 0; i < numAgents; i++) {

	agentSegments[i] = [];
	agentSegments[i].length = numSegments;
	agentSegments[i].fill([0, 0, 0]);
	agentHeadings[i] = [];
	agentHeadings[i].length = numSegments;
	agentHeadings[i].fill([0, 0, 0]);
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
		spike: {
			spikeR: [0.015, 0.025],
			spikeH: [0.12, 0.15],
			numSpikeLoops: [116, 493],
			col1: [0x06364F, 0x2B598F],
			col2: [0x000000, 0x000000]
		},
		body: {
			col1: [0xd03754, 0x17F4FF],
			col2: [0xFF497D, 0x9AD7FF],
		}
	},
	{
		spike: {
			spikeR: [0.03, 0.02],
			spikeH: [0.14, 0.11],
			numSpikeLoops: [572, 234],
			col1: [0xD75896, 0x42E4FF],
			col2: [0x000000, 0x000000]
		},
		body: {
			col1: [0x37EDB5, 0xDB61F0],
			col2: [0x64EFF0, 0xB48DEF],
		}
	},
	{
		spike: {
			spikeR: [0.02, 0.03],
			spikeH: [0.16, 0.07],
			numSpikeLoops: [267, 288],
			col1: [0xB30056, 0xFF4338],
			col2: [0x000000, 0x000000]
		},
		body: {
			col1: [0xf5cb90, 0xf5f195],
			col2: [0xc38678, 0xb6c0a8],
		}
	},
	{
		spike: {
			spikeR: [0.03, 0.01],
			spikeH: [0.12, 0.13],
			numSpikeLoops: [618, 1112],
			col1: [0x00BF9B, 0xDB5462],
			col2: [0x000000, 0x000000]
		},
		body: {
			col1: [0xdd5311, 0x32FFBE],
			col2: [0xA33E3C, 0x1B6B78],
		}
	},
	{
		spike: {
			spikeR: [0.02, 0.02],
			spikeH: [0.08, 0.08],
			numSpikeLoops: [1234, 1235],
			col1: [0x0a0915, 0x272739],
			col2: [0x000000, 0x000000]
		},
		body: {
			col1: [0x792a37, 0xf48d81],
			col2: [0xecd3bd, 0x9a4044],
		}
	},
	{
		spike: {
			spikeR: [0.06, 0.01],
			spikeH: [0.08, 0.1],
			numSpikeLoops: [222, 123],
			col1: [0xCE0C9E, 0x282D9E],
			col2: [0x000000, 0x000000]
		},
		body: {
			col1: [0x4149FF, 0x8D269E],
			col2: [0x282D9E, 0xCE0C9E],
		}
	}

];

const bgFrontUniforms = {

	col1: {value: new THREE.Color(0x484F57)},
	col2: {value: new THREE.Color(0xb32944)},

}
const bgBackUniforms = {

	col1: {value: new THREE.Color(0x171A24)},
	col2: {value: new THREE.Color(0x85A9D4)},

}
const bgLeftUniforms = {

	col1: {value: new THREE.Color(0x0c0919)},
	col2: {value: new THREE.Color(0x1b7e8c)},

}
const bgRightUniforms = {

	col1: {value: new THREE.Color(0x330800)},
	col2: {value: new THREE.Color(0x005E52)},

}
const bgTopUniforms = {

	col1: {value: new THREE.Color(0x0a0915)},
	col2: {value: new THREE.Color(0x1c202f)},

}
const bgBottomUniforms = {

	col1: {value: new THREE.Color(0x0a0915)},
	col2: {value: new THREE.Color(0x1c202f)},

}

const bgUniforms = [bgFrontUniforms, bgBackUniforms, bgLeftUniforms, bgRightUniforms, bgTopUniforms, bgBottomUniforms];

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
	faceBottom = this.getObjectByName("faceBottom");
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
	agent.eul = new THREE.Euler();
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

	agent.heading = new THREE.Quaternion();

	agent.trailAvoidDist = agentSettings.trailAvoidDist * agentSettings.trailAvoidDist;
	agent.trailAvoidForce = new THREE.Vector3();

	agent.trailSegments = [];
	agent.trailHeadings = [];

	for (let i = 0; i < agentSettings.numTrailSegments; i++) {

		agent.trailSegments.push(new THREE.Vector3());
		agent.trailHeadings.push(new THREE.Vector3());

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
		let attactMult = 1.0;
		agent.vec1.copy(otherAgent.agentPoint).sub(agent.agentPoint).normalize().multiplyScalar(attactMult * deltaTime);
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
				let forceMult = (agentSettings.trailAvoidDist - dist) * 100.0;
				agent.vec1.copy(agent.agentPoint).sub(otherAgent.trailSegments[j]).normalize().multiplyScalar(forceMult * deltaTime);
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

	agent.currentVelocity.normalize().multiplyScalar( agentSettings.maxVelocity );

	agent.agentPoint.add(agent.currentVelocity.multiplyScalar(deltaTime));

	agent.vec1.copy( agent.currentVelocity ).normalize();
	agent.eul.setFromVector3( agent.vec1 );
	agent.q1.setFromEuler( agent.eul );
	agent.heading.slerp( agent.q1, 6.0 * deltaTime );

	for (let i = agentSettings.numTrailSegments - 1; i > 0; i--) {

		agent.trailSegments[i].copy(agent.trailSegments[i - 1]);
		agent.trailHeadings[i].copy(agent.trailHeadings[i - 1]);

	}
	agent.trailSegments[0].copy(agent.agentPoint);
	agent.trailHeadings[0].copy(agent.eul.setFromQuaternion(agent.heading));

}

function updateSegments() {

	let agent, agentSegment, agentHeading;
	for (let i = 0; i < numAgents; i++) {

		agent = agents[i];
		agentSegment = agentSegments[i];
		agentHeading = agentHeadings[i];

		for (let j = 0; j < agentSettings.numTrailSegments * agentSettings.numTrailBufferMult; j += 1) {

			agentSegment[j] = agent.trailSegments[j * 1 / agentSettings.numTrailBufferMult];
			agentHeading[j] = agent.trailHeadings[j * 1 / agentSettings.numTrailBufferMult];

		}

	}

}



//
// visualize agent segments
//

function createSegmentsVis(face) {

	const segmentsVis = {};
	segmentsVis.vizs = [];
	segmentsVis.vizs.length = numAgents;

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
uniform vec3 segments[64];
uniform vec3 headings[64];

uniform vec3 col1;
uniform vec3 col2;
uniform vec3 bgCol1;
uniform vec3 bgCol2;

uniform float uTime;
uniform float numSpikeLoops;
uniform float spikeH;
uniform float spikeR;

varying vec3 vCol;

vec2 rotate(vec2 v, float theta){

	float s = sin(theta);
	float c = cos(theta);
	mat2 m = mat2(c, s, -s, c);
	return m * v;

}

mat4 getBasisMat (vec3 heading, vec3 pos){

	pos.x += 123.0;
	heading = normalize(heading);
	vec3 left = cross(heading, normalize(pos));
	vec3 up = cross(heading, left);
	return mat4(vec4(left, 0.0), vec4(up, 0.0), vec4(heading, 0.0), vec4(0.0, 0.0, 0.0, 1.0));

}

void main() {
	
	vec3 localPos = position.xyz;

	float isTop = step(0.4, localPos.y);

	localPos.xz *= spikeR * 1.1;
	localPos.y *= spikeH;

	float scXY = smoothstep(0.0, 0.1, spikeT) * (1.0 - smoothstep(0.9, 1.0, spikeT));
	//float sc = max(scXY + sin(spikeT * PI * 223.0 + uTime * -4.0) * (scXY * 0.9), 0.3);
	float sc = scXY;
	localPos *= sc;

	localPos.y += spikeH * 0.5 * scXY;
	localPos.y += 0.02 * scXY;
	float localPosY = localPos.y;

	float tipMove = isTop * sin(uTime * 4.0 + spikeT * PI * 30.0);
	localPos.y += tipMove * 0.01;

	localPos.xy = rotate(localPos.xy, spikeT * PI * numSpikeLoops + uTime * -1.0);

	vec3 worldNormal = normal;
	worldNormal.xy = rotate(worldNormal.xy, spikeT * PI * numSpikeLoops + uTime * -1.0);
	
	int prevId = int(numSegments * spikeT);
	int nextId = int(min(prevId+1, int(numSegments - 1.0)));
	float t = fract(numSegments * spikeT);
	vec3 prevPos = segments[prevId];
	vec3 nextPos = segments[nextId];
	vec3 iPos = mix(prevPos, nextPos, t);

	vec3 prevHeading = headings[prevId];
	vec3 nextHeading = headings[nextId];
	vec3 heading = normalize(mix(prevHeading, nextHeading, t));
	mat4 basisMat = getBasisMat(heading, segments[prevId]);

	localPos = (basisMat * vec4(localPos, 1.0)).xyz;
	worldNormal = (basisMat * vec4(worldNormal, 1.0)).xyz;
	worldNormal = (modelMatrix * vec4(worldNormal, 1.0)).xyz;

	vec3 worldPos = iPos + localPos;
	worldPos += -heading * smoothstep(0.05, 0.0, spikeT) * 0.05;
	vec4 mvPos = modelViewMatrix * vec4(worldPos, 1.0);
	gl_Position = projectionMatrix * mvPos;
	
	vec3 vCol1 = mix(col1, col1 + vec3(0.0, 0.3, 0.3), sin(uTime * 2.0 + t * PI * 2.0) * 0.5 + 0.5);

	vCol = col1;

	//top light
	vec3 lightDir = vec3(0.0, 1.0, 0.0);
	float lightAmt = clamp(dot(lightDir, worldNormal), 0.0, 1.0);
	vCol += lightAmt * bgCol2 * mix(1.0, 6.0, smoothstep(-0.25, 1.0, worldPos.y));

	vCol *= mix( 0.1, 1.0, lightAmt);

	lightDir = vec3(0.0, -1.0, 0.0);
	lightAmt = clamp(dot(lightDir, worldNormal), 0.0, 1.0);
	vCol += lightAmt * bgCol1 * mix(1.0, 6.0, smoothstep(0.25, -1.0, worldPos.y));;

	vCol *= smoothstep( 0.03 * scXY, 0.04 * scXY + spikeH * 0.5, localPosY );
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
uniform vec3 segments[64];

varying vec3 vCol;

highp float rand( const in vec2 uv ) {
  const highp float a = 12.1234, b = 78.9898, c = 34456.5678;
  highp float dt = dot( uv.xy, vec2( a,b ) ), sn = mod( dt, PI );
  return fract( sin( sn ) * c );
}

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
	float detailRotDist = 0.01 + ( 1.0 - scXY ) * 0.04 * smoothstep(0.0, 0.02, bodyT) + smoothstep(0.95, 1.0, bodyT) * 0.001;
	float randTick = uTime * 0.1;
	pos.x += rand( vec2( bodyT + randTick, bodyT * bodyT ) ) * detailRotDist;
	pos.y += rand( vec2( bodyT + bodyT, bodyT + randTick ) ) * detailRotDist;
	pos.z += rand( vec2( bodyT * bodyT + randTick, bodyT + bodyT ) ) * detailRotDist;

	pos += iPos;

	vec4 mvPos = modelViewMatrix * vec4( pos, 1.0 );
	gl_PointSize = 0.025 * (300.0 / -mvPos.z) * pixelRatio * min(uTime + ( 1.0 - bodyT ) * 10.0, 1.0);
	gl_Position = projectionMatrix * mvPos;
	
	vCol = mix(col1, col2, smoothstep(sin( uTime * 0.8 + bodyT * PI * 23.0), -0.1, 0.1));

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

	//vis per agent
	const vis = {};
	vis.id = id;
	vis.agent = agents[id];
	vis.tick = 0;

	let numSpikeInstances = 512;
	let numBodyInstances = 512;

	//shared buffers between faces
	const spikeTs = new Float32Array(numSpikeInstances);
	for (let i = 0; i < numSpikeInstances; i++) {

		spikeTs[i] = i / (numSpikeInstances - 1);

	}
	let spikeTsBuffer = new THREE.InstancedBufferAttribute(spikeTs, 1);
	let spikeGeo = new THREE.ConeGeometry(1.0, 1.0, 6, 2);
	spikeGeo.setAttribute('spikeT', spikeTsBuffer);

	let bodyPositions = new Float32Array(numBodyInstances * 3);
	let bodyRndPos = new Float32Array(numBodyInstances * 3);
	let bodyTs = new Float32Array(numBodyInstances);
	let rnd = new THREE.Vector3();
	for (let i = 0; i < numBodyInstances; i++) {

		bodyPositions[i * 3] = 0;
		bodyPositions[i * 3 + 1] = 0;
		bodyPositions[i * 3 + 2] = 0;

		rnd.randomDirection().multiplyScalar(0.05);
		bodyRndPos[i * 3] = rnd.x;
		bodyRndPos[i * 3 + 1] = rnd.y;
		bodyRndPos[i * 3 + 2] = rnd.z;

		bodyTs[i] = i / (numBodyInstances - 1);

	}

	let bodyGeo = new THREE.BufferGeometry();
	bodyGeo.setAttribute('rndPos', new THREE.BufferAttribute(bodyRndPos, 3));
	bodyGeo.setAttribute('bodyT', new THREE.BufferAttribute(bodyTs, 1));
	bodyGeo.setAttribute('position', new THREE.BufferAttribute(bodyPositions, 3));

	let spikeMesh;
	let bodyMesh;
	vis.faceVizs = [];
	let faceViz;
	//vis per agent per face
	for (let i = 0; i < faces.length; i++) {

		faceViz = {};

		faceViz.spikeUniforms = {
			spikeR: {value: visUniforms[i].spike.spikeR[id]},
			spikeH: {value: visUniforms[i].spike.spikeH[id]},
			numSpikeLoops: {value: visUniforms[i].spike.numSpikeLoops[id]},
			col1: {value: new THREE.Color(visUniforms[i].spike.col1[id])},
			col2: {value: new THREE.Color(visUniforms[i].spike.col2[id])},
			bgCol1: {value: bgUniforms[i].col1.value},
			bgCol2: {value: bgUniforms[i].col2.value},
			uTime: {value: 0},
			segments: {value: []},
			headings: {value: []},
			numSegments: {value: numSegments}
		}
		faceViz.spikeMat = new THREE.ShaderMaterial({uniforms: faceViz.spikeUniforms, vertexShader: visSpikeVert, fragmentShader: visSpikeFrag});
		spikeMesh = new THREE.InstancedMesh(spikeGeo, faceViz.spikeMat, numSpikeInstances);

		faceViz.bodyUniforms = {
			col1: {value: new THREE.Color(visUniforms[i].body.col1[id])},
			col2: {value: new THREE.Color(visUniforms[i].body.col2[id])},
			uTime: {value: 0},
			segments: {value: []},
			numSegments: {value: numSegments},
			pixelRatio: {value: window.devicePixelRatio}
		}
		faceViz.bodyMat = new THREE.ShaderMaterial({uniforms: faceViz.bodyUniforms, vertexShader: visBodyVert, fragmentShader: visBodyFrag});
		faceViz.bodyMat.blending = THREE.AdditiveBlending;
		bodyMesh = new THREE.Points(bodyGeo, faceViz.bodyMat);

		faces[i].add(bodyMesh);
		faces[i].add(spikeMesh);

		vis.faceVizs.push(faceViz);

	}

	vis.update = function (deltaTime, time) {

		this.tick += deltaTime;
		let faceViz;
		for (let i = 0; i < this.faceVizs.length; i++) {
			faceViz = this.faceVizs[i];
			faceViz.spikeUniforms.segments.value = agentSegments[this.id];
			faceViz.spikeUniforms.headings.value = agentHeadings[this.id];
			faceViz.spikeUniforms.uTime.value = this.tick;
			faceViz.bodyUniforms.segments.value = agentSegments[this.id];
			faceViz.bodyUniforms.uTime.value = this.tick;
		}

	}

	vis.update(0.01, 0);
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

	vec4 col = mix( vec4( col1, 1.0 ), vec4( 0.0 ), smoothstep( -1.0, -0.2, worldPos.y ) );
	col = mix( col, vec4( col2, 1.0 ), smoothstep( 0.2, 1.0, worldPos.y ) );
	vCol = col * 0.8;
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
	//gl_FragColor.rgb = dithering( gl_FragColor.rgb );
	
}
`;

function createBG(face, uniforms, rot) {

	const geo = new THREE.BoxGeometry(1, 1, 1, 1, 30, 1);
	const mat = new THREE.ShaderMaterial({uniforms: uniforms, vertexShader: bgVert, fragmentShader: bgFrag, transparent: true});
	mat.side = THREE.BackSide;
	mat.blending = THREE.AdditiveBlending;
	const mesh = new THREE.Mesh(geo, mat);
	mesh.scale.set(2.0, 4.0, 2.0);
	face.add(mesh);

	return {

		mesh: mesh,
		uniforms: uniforms

	};

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

