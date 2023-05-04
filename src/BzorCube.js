import * as THREE from './libs/three.module.js';
import { AgentWander } from './AgentWander.js';
import { AgentTrail } from './AgentTrail.js';
import { AgentVisFront } from './AgentVisFront.js';
import { AgentVisBack } from './AgentVisBack.js';
import { AgentVisLeft } from './AgentVisLeft.js';
import { AgentVisRight } from './AgentVisRight.js';
import { AgentVisTop } from './AgentVisTop.js';
import { AgentVisBottom } from './AgentVisBottom.js';

export class BzorCube {

	deltaTime = 0;
	maxDelta = 1;
	lastFrameTime = 0;
	frame = 0;

	agents = [];
	agentVizs = [];

	constructor() {
	}

	init( scene ) {

		console.log( "bzor cube init" );
		this.faceFront = scene.getObjectByName( "faceFront", true );
		this.faceBack = scene.getObjectByName( "faceBack", true );
		this.faceLeft = scene.getObjectByName( "faceLeft", true );
		this.faceRight = scene.getObjectByName( "faceRight", true );
		this.faceTop = scene.getObjectByName( "faceTop", true );
		this.faceBottom = scene.getObjectByName( "faceBottom", true );

		this.addAgent();
		this.addAgent();

		this.visFront = new AgentVisFront( this.faceFront, this.agents );
		this.agentVizs.push( this.visFront );
		this.visBack = new AgentVisBack( this.faceBack, this.agents );
		this.agentVizs.push( this.visBack );
		this.visLeft = new AgentVisLeft( this.faceLeft, this.agents );
		this.agentVizs.push( this.visLeft );
		this.visRight = new AgentVisRight( this.faceRight, this.agents );
		this.agentVizs.push( this.visRight );
		this.visTop = new AgentVisTop( this.faceTop, this.agents );
		this.agentVizs.push( this.visTop );
		this.visBottom = new AgentVisBottom( this.faceBottom, this.agents );
		this.agentVizs.push( this.visBottom );

	}

	addAgent() {

		const agentWander = new AgentWander( this );
		const agentTrail = new AgentTrail( agentWander );
		const agentData = { wander: agentWander, trail: agentTrail };
		this.agents.push( agentData );

	}

	update( timestamp, frame ) {

		this.deltaTime = ( timestamp - this.lastFrameTime ) * 0.001;
		this.deltaTime = Math.min( this.deltaTime, this.maxDelta );
		this.lastFrameTime = timestamp;
		this.frame = frame;

		for ( let i = 0; i < this.agents.length; i++ ) {

			let agent = this.agents[ i ];
			agent.wander.update( this.deltaTime );
			agent.trail.update( this.deltaTime );

		}

		for ( let i = 0; i < this.agentVizs.length; i++ ) {

			this.agentVizs[ i ].update( this.deltaTime );

		}

	}

}
