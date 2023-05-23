function init() {

	this.material.uniforms = {

		col1: { value: new THREE.Color( 0x281023 ) },
		col2: { value: new THREE.Color( 0x522232 ) },	
		col3: { value: new THREE.Color( 0x2f2b42 ) }		
		
	}

	/*
	this.material.uniforms = {

		col1: { value: new THREE.Color( 0xFF0000 ) },
		col2: { value: new THREE.Color( 0x0000FF ) },
		col3: { value: new THREE.Color( 0x00FF00 ) }		
		
	}	
	*/
	
}



//VERT
uniform vec3 col1;
uniform vec3 col2;
uniform vec3 col3;
varying vec4 vCol;

void main() {

	vec4 pos = vec4( position, 1.0 );
	vec4 worldPos = modelMatrix * pos;
	vec4 viewPos = viewMatrix * worldPos;
		
	vCol = mix( vec4( col1, 1.0 ), vec4( col2, 1.0 ), clamp( worldPos.y, -2.0, 0.0 ) + 0.5 ) ;
	vCol = mix( vCol, vec4( col3, 1.0 ), smoothstep( 0.0, 1.5, worldPos.y ) ) ;
	
	gl_Position = projectionMatrix * viewPos;
	
}


//Frag
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