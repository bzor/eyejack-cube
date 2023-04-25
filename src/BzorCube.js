import * as THREE from './libs/three.module.js';

export class BzorCube {

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

		this.test();

	}

	test() {

		let size = 0.5;
		let geo = new THREE.BoxGeometry( size, size, size );
		let mat = new THREE.MeshBasicMaterial( { color: 0x00FF0 } );
		let mesh = new THREE.Mesh( geo, mat );
		this.faceFront.add( mesh );

		size = 0.5;
		geo = new THREE.DodecahedronGeometry( size );
		mesh = new THREE.Mesh( geo, mat );
		this.faceLeft.add( mesh );


	}

}

