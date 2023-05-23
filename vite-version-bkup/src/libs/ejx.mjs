import { Vector3, BufferGeometry, Float32BufferAttribute, Raycaster, Vector2, MathUtils, Mesh, BackSide, FrontSide, Color, RawShaderMaterial, Vector4, DoubleSide, sRGBEncoding, RepeatWrapping, NearestFilter, LinearEncoding, TextureLoader, BoxGeometry, MeshBasicMaterial, Object3D, PlaneGeometry, Clock, Plane, WebGLRenderer, NoToneMapping, PerspectiveCamera, Scene, WebGLRenderTarget, ClampToEdgeWrapping, LinearFilter, RGBAFormat, UnsignedByteType, Texture, OrthographicCamera, ShaderMaterial, Matrix4, Box2, Matrix3 } from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader.js';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';

const EJUtils = Object.create(null);

EJUtils.disposeMaterial = material => {
  // in case of map, bumpMap, normalMap, envMap ...
  Object.keys(material).forEach(prop => {
    if (!material[prop]) {
      return;
    }
    if (material[prop] !== null && typeof material[prop].dispose === 'function') {
      material[prop].dispose();
    }
  });
  material.dispose();
};

EJUtils.disposeRecursive = obj => {
  while (obj.children.length > 0) {
    disposeRecursive(obj.children[0]);
    obj.remove(obj.children[0]);
  }
  if (obj.geometry) obj.geometry.dispose();

  if (obj.material) {
    if (Array.isArray(obj.material)) {
      obj.material.forEach(EJUtils.disposeMaterial);
    } else {
      EJUtils.disposeMaterial(obj.material);
    }
  }
};
const disposeRecursive = EJUtils.disposeRecursive;

/* eslint-disable max-len */

const EJCube = Object.create(null);

// ---------------------------------------------------------------- Cube Geometry
EJCube.getFaceNormals = () => {
  const faceNormals = [];
  faceNormals.push(new Vector3(0, 0, 1)); // front
  faceNormals.push(new Vector3(1, 0, 0)); // right
  faceNormals.push(new Vector3(0, 0, -1)); // back
  faceNormals.push(new Vector3(-1, 0, 0)); // left
  faceNormals.push(new Vector3(0, 1, 0)); // top
  faceNormals.push(new Vector3(0, -1, 0)); // bottom
  return faceNormals;
};
const getFaceNormals = EJCube.getFaceNormals;

EJCube.getFaceCentres = () => {
  const faceCentres = [];
  faceCentres.push(new Vector3(0, 0, 0.5)); // front
  faceCentres.push(new Vector3(0.5, 0, 0)); // right
  faceCentres.push(new Vector3(0, 0, -0.5)); // back
  faceCentres.push(new Vector3(-0.5, 0, 0)); // left
  faceCentres.push(new Vector3(0, 0.5, 0)); // top
  faceCentres.push(new Vector3(0, -0.5, 0)); // bottom
  return faceCentres;
};
const getFaceCentres = EJCube.getFaceCentres;

EJCube.getFaceColorMasks = () => {
  const faceColorMasks = [];
  faceColorMasks.push(new Vector3(1, 0, 0)); // front
  faceColorMasks.push(new Vector3(0, 1, 0)); // right
  faceColorMasks.push(new Vector3(0, 0, 1)); // back
  faceColorMasks.push(new Vector3(1, 0, 1)); // left
  faceColorMasks.push(new Vector3(1, 1, 0)); // top
  faceColorMasks.push(new Vector3(0, 1, 1)); // bottom
  return faceColorMasks;
};
EJCube.getFaceColorMasks;

EJCube.getFaceDescriptors = () => {
  const faceDescriptors = [];
  faceDescriptors.push('front');
  faceDescriptors.push('right');
  faceDescriptors.push('back');
  faceDescriptors.push('left');
  faceDescriptors.push('top');
  faceDescriptors.push('bottom');
  return faceDescriptors;
};
EJCube.getFaceDescriptors;


EJCube.initCubeGeometry = () => {
  // https://r105.threejsfundamentals.org/threejs/lessons/threejs-custom-geometry.html
  // https://threejs.org/docs/#api/en/core/BufferGeometry.addAttribute

  /*
       6----7
      /|   /|
    2----3 |
    | |  | |
    | 4--|-5
    |/   |/
    0----1
  */

  const geometry = new BufferGeometry();

  const verts = [];
  verts.push(-1, -1, 1); // 0
  verts.push(1, -1, 1); // 1
  verts.push(-1, 1, 1); // 2
  verts.push(1, 1, 1); // 3
  verts.push(-1, -1, -1); // 4
  verts.push(1, -1, -1); // 5
  verts.push(-1, 1, -1); // 6
  verts.push(1, 1, -1); // 7
  for (let i = 0; i < verts.length; i++) {
    verts[i] *= 0.5; // make unit cube
  }

  const vertColors = [];
  vertColors.push(1.0, 0.0, 1.0, 0.5);
  vertColors.push(1.0, 0.0, 1.0, 0.5);
  vertColors.push(1.0, 0.0, 1.0, 0.5);
  vertColors.push(1.0, 0.0, 1.0, 0.5);
  vertColors.push(1.0, 0.0, 1.0, 0.5);
  vertColors.push(1.0, 0.0, 1.0, 0.5);
  vertColors.push(1.0, 0.0, 1.0, 0.5);
  vertColors.push(1.0, 0.0, 1.0, 0.5);

  const faceIndices = [];
  // front
  faceIndices.push(0, 3, 2);
  faceIndices.push(0, 1, 3);
  // right
  faceIndices.push(1, 7, 3);
  faceIndices.push(1, 5, 7);
  // back
  faceIndices.push(5, 6, 7);
  faceIndices.push(5, 4, 6);
  // left
  faceIndices.push(4, 2, 6);
  faceIndices.push(4, 0, 2);
  // top
  faceIndices.push(2, 7, 6);
  faceIndices.push(2, 3, 7);
  // bottom
  faceIndices.push(4, 1, 0);
  faceIndices.push(4, 5, 1);

  const vertices = [];
  const colors = [];

  for (let i = 0; i < faceIndices.length; i++) {
    const fi = faceIndices[i];
    const vi = fi * 3;
    vertices.push(verts[vi + 0]);
    vertices.push(verts[vi + 1]);
    vertices.push(verts[vi + 2]);
    const ci = fi * 4;
    colors.push(vertColors[ci + 0]);
    colors.push(vertColors[ci + 1]);
    colors.push(vertColors[ci + 2]);
    colors.push(vertColors[ci + 3]);
  }

  const uvs = [];
  for (let i = 0; i < 6; i++) {
    uvs.push(0, 0);
    uvs.push(1, 1);
    uvs.push(0, 1);
    uvs.push(0, 0);
    uvs.push(1, 0);
    uvs.push(1, 1);
  }

  const normals = [];
  const faceNormals = getFaceNormals();
  for (let i = 0; i < faceNormals.length; i++) {
    const faceNormal = faceNormals[i];
    for (let i = 0; i < 6; i++) {
      normals.push(faceNormal.x, faceNormal.y, faceNormal.z);
    }
  }

  const centres = [];
  const faceCentres = getFaceCentres();
  for (let i = 0; i < faceCentres.length; i++) {
    const faceCentre = faceCentres[i];
    for (let i = 0; i < 6; i++) {
      centres.push(faceCentre.x, faceCentre.y, faceCentre.z);
    }
  }

  const faces = [];
  for (let i = 0; i < 6; i++) { // for each face.
    for (let j = 0; j < 6; j++) { // 2 trianges, 6 points per face.
      faces.push(i);
    }
  }

  geometry.setAttribute('position', new Float32BufferAttribute(vertices, 3));
  geometry.setAttribute('centre', new Float32BufferAttribute(centres, 3));
  geometry.setAttribute('normal', new Float32BufferAttribute(normals, 3));
  geometry.setAttribute('color', new Float32BufferAttribute(colors, 4));
  geometry.setAttribute('uv', new Float32BufferAttribute(uvs, 2));
  geometry.setAttribute('face', new Float32BufferAttribute(faces, 1));

  return geometry;
};
EJCube.initCubeGeometry;

// ---------------------------------------------------------------- EJCubeBase
const EJCubeStyleNone = 'None';
const EJCubeStyleMask = 'Mask';
const EJCubeStylePlain = 'Plain';
const EJCubeStyleGlass = 'Glass';
const EJCubeStyleGlass3 = 'Glass3';


/**
 *
 */
class EJCubeBase {
  /**
   * @param {Object3D} container
   * @param {any} gui
   */
  constructor(container, gui) {
    this.style = EJCubeStyleNone;
    this.container = container;
    this.cubeBack = null;
    this.cubeFront = null;
    this.cubeToCameraDist = 100;
    this.cubeToCameraDistNorm = 1.0;
    this.cubeToCameraThreshold = 0.05;
    this.raycaster = new Raycaster();
    this.canGoInsideCube = false;

    this.gui = gui;
    if (this.gui) {
      this.guiFolder = this.gui.addFolder('Cube Settings');
    }
  }

  updateProps(texture, resolution, canGoInsideCube) {
    this.canGoInsideCube = canGoInsideCube;
  }

  /**
   * @param {Camera} camera
   */
  update(camera) {
    this.cubeToCameraDist = 100;

    this.raycaster.setFromCamera(new Vector2(0, 0), camera);

    const intersectsFront = this.raycaster.intersectObject(this.cubeFront);
    if (intersectsFront.length > 0) {
      const intersect = intersectsFront[0];
      this.cubeToCameraDist = intersect.distance;
    }

    this.raycaster.ray.direction.multiply(new Vector3(-1, -1, -1));

    const intersectsBack = this.raycaster.intersectObject(this.cubeBack);
    if (intersectsBack.length > 0) {
      const intersect = intersectsBack[0];
      this.cubeToCameraDist = -intersect.distance;
    }

    this.cubeToCameraDistNorm = MathUtils.mapLinear(this.cubeToCameraDist, -this.cubeToCameraThreshold, this.cubeToCameraThreshold, -1.0, 1.0);
    this.cubeToCameraDistNorm = MathUtils.clamp(this.cubeToCameraDistNorm, -1.0, 1.0);
  }

  dispose() {
    if (this.container) {
      EJUtils.disposeRecursive(this.container);
    }
    if (this.guiFolder) {
      this.guiFolder.destroy();
      this.guiFolder = null;
    }
  }
}

/* eslint-disable max-len */

/**
 * @return {ShaderMaterial}
 */
function initCubeMaterial$2() {
  const material = new RawShaderMaterial({
    uniforms: {
      backFace: { value: 1 },
      borderOn: { value: 1 },
      borderColor: { value: new Vector4(1, 1, 1, 1) },
      borderWidth: { value: 0.01 },
      borderFeather: { value: 0.5 },
      textureOn: { value: 1 },
      texture: { type: 't', value: null },
      resolution: { value: new Vector2(0, 0) },
    },
    vertexShader: `
      precision highp float;
      precision highp int;

      uniform mat4 modelMatrix;
      uniform mat4 modelViewMatrix;
      uniform mat4 projectionMatrix;

      attribute vec3 position;
      attribute vec4 color;
      attribute vec2 uv;
      
      varying vec2 vUv;
      
      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
      }
    `,
    // grid shader.
    // http://madebyevan.com/shaders/grid/
    //
    fragmentShader: `
      precision highp float;
      precision highp int;
      
      uniform int backFace;
      uniform int borderOn;
      uniform vec4 borderColor;
      uniform float borderWidth;
      uniform float borderFeather;
      uniform int textureOn;
      uniform sampler2D texture;
      uniform vec2 resolution;
      
      varying vec2 vUv;

      vec4 alphaBlend( vec4 src, vec4 dst ) {
        float final_alpha = src.a + dst.a * (1.0 - src.a);
        if( final_alpha == 0.0 ) {
          return vec4( 0.0, 0.0, 0.0, 0.0 );
        }
        return vec4( (src.rgb * src.a + dst.rgb * dst.a * (1.0 - src.a)) / final_alpha, final_alpha);
      }

      float border(vec2 uv, float strokeWidth, float feather) {
        vec2 borderBottomLeft = smoothstep(vec2(strokeWidth * feather), vec2(strokeWidth), uv);
        vec2 borderTopRight = smoothstep(vec2(strokeWidth * feather), vec2(strokeWidth), 1.0 - uv);
        return 1.0 - borderBottomLeft.x * borderBottomLeft.y * borderTopRight.x * borderTopRight.y;
      }

      vec4 LinearTosRGB( vec4 value ) {
        return vec4( mix( pow( value.rgb, vec3( 0.41666 ) ) * 1.055 - vec3( 0.055 ), value.rgb * 12.92, vec3( lessThanEqual( value.rgb, vec3( 0.0031308 ) ) ) ), value.a );
      }      
      
      void main()  {
        vec4 colorTex = vec4(0.0, 0.0, 0.0, 0.0);
        vec4 colorBorder = vec4(0.0, 0.0, 0.0, 0.0);
        
        if(textureOn == 1) {
          vec2 st = gl_FragCoord.xy / resolution;
          colorTex = texture2D(texture, st);
        }

        if(borderOn == 1 && borderWidth > 0.0 && borderColor.a > 0.0) {
          float line = border(vUv, borderWidth, 1.0 - borderFeather);
          colorBorder = vec4(borderColor.xyz, borderColor.a * line);
        }

        vec4 colorFinal = vec4(0.0, 0.0, 0.0, 0.0);
        if( backFace == 0 ) {
          colorFinal = alphaBlend(colorBorder, colorTex); // border first, then blend content on top.
        } else {
          colorFinal = alphaBlend(colorTex, colorBorder); // content first, then blend border on top.
        }

        colorFinal = LinearTosRGB( colorFinal );

        gl_FragColor = colorFinal;
      }      
    `,
    side: DoubleSide,
    transparent: true,
  });
  return material;
}

// ---------------------------------------------------------------- EJCube1
class EJCube1 extends EJCubeBase {
  constructor(container, gui) {
    super(container, gui);
    this.style = EJCubeStylePlain;

    this.geometry = EJCube.initCubeGeometry();
    this.materialBack = initCubeMaterial$2();
    this.materialFront = initCubeMaterial$2();

    this.cubeBack = new Mesh(this.geometry, this.materialBack);
    this.cubeBack.name = 'cubeBack';
    this.materialBack.side = BackSide;
    this.materialBack.uniforms.backFace.value = 1;
    this.materialBack.uniforms.textureOn.value = 1;
    this.materialBack.uniformsNeedUpdate = true;

    this.cubeFront = new Mesh(this.geometry, this.materialFront);
    this.cubeFront.name = 'cubeFront';
    this.materialFront.side = FrontSide;
    this.materialFront.uniforms.backFace.value = 0;
    this.materialFront.uniforms.textureOn.value = 0;
    this.materialFront.uniformsNeedUpdate = true;

    this.container.add(this.cubeBack);
    this.container.add(this.cubeFront);

    this.config = {
      borderOn: true,
      borderWidth: 0.01,
      borderFeather: 0.5,
      borderColor: new Color(0xffffff),
      borderAlpha: 1.0,
    };

    if (this.guiFolder) {
      this.guiFolder.add(this.config, 'borderOn').name('Border On').onChange(value => {
        this.materialBack.uniforms.borderOn.value = value ? 1 : 0;
        this.materialBack.uniformsNeedUpdate = true;
        this.materialFront.uniforms.borderOn.value = value ? 1 : 0;
        this.materialFront.uniformsNeedUpdate = true;
      });
      this.guiFolder.add(this.config, 'borderWidth', 0.0, 0.1).name('Border Width').onChange(value => {
        this.materialBack.uniforms.borderWidth.value = value;
        this.materialBack.uniformsNeedUpdate = true;
        this.materialFront.uniforms.borderWidth.value = value;
        this.materialFront.uniformsNeedUpdate = true;
      });
      this.guiFolder.add(this.config, 'borderFeather', 0.0, 1.0).name('Border Feather').onChange(value => {
        this.materialBack.uniforms.borderFeather.value = value;
        this.materialBack.uniformsNeedUpdate = true;
        this.materialFront.uniforms.borderFeather.value = value;
        this.materialFront.uniformsNeedUpdate = true;
      });
      this.guiFolder.addColor(this.config, 'borderColor').name('Border Color').onChange(value => {
        this.materialBack.uniforms.borderColor.value.x = value.r;
        this.materialBack.uniforms.borderColor.value.y = value.g;
        this.materialBack.uniforms.borderColor.value.z = value.b;
        this.materialBack.uniformsNeedUpdate = true;
        this.materialFront.uniforms.borderColor.value.x = value.r;
        this.materialFront.uniforms.borderColor.value.y = value.g;
        this.materialFront.uniforms.borderColor.value.z = value.b;
        this.materialFront.uniformsNeedUpdate = true;
      });
      this.guiFolder.add(this.config, 'borderAlpha', 0.0, 1.0).name('Border Alpha').onChange(value => {
        this.materialBack.uniforms.borderColor.value.w = value;
        this.materialBack.uniformsNeedUpdate = true;
        this.materialFront.uniforms.borderColor.value.w = value;
        this.materialFront.uniformsNeedUpdate = true;
      });
    }
  }

  update(camera) {
    super.update(camera);
  }

  updateProps(texture, resolution, canGoInsideCube) {
    super.updateProps(texture, resolution, canGoInsideCube);

    this.materialBack.uniforms.resolution.value = resolution;
    this.materialBack.uniforms.texture.value = texture;
    this.materialBack.uniformsNeedUpdate = true;

    this.materialFront.uniforms.resolution.value = resolution;
    this.materialFront.uniforms.texture.value = texture;
    this.materialFront.uniformsNeedUpdate = true;
  }
}

function initCubeMaterial$1() {
  const material = new RawShaderMaterial({
    uniforms: {
      mode: { value: 0 },
      time: { value: 1.0 },
      resolution: { value: new Vector2(0, 0) },
      texture: { type: 't', value: null },
      tintAlpha: { value: 0.4 },
      cubeToCameraDistNorm: { value: 1.0 },
      canGoInsideCube: { value: false },
    },
    vertexShader: `
      precision highp float;
      precision highp int;

      uniform mat4 modelViewMatrix; // optional
      uniform mat4 projectionMatrix; // optional

      attribute vec3 position;
      attribute vec3 centre;
      attribute vec3 normal;
      attribute vec4 color;
      attribute vec2 uv;

      varying vec3 vPosition;
      varying vec4 vPositionWorld;
      varying vec3 vCentre;
      varying vec4 vCentreWorld;
      varying vec3 vNormal;
      varying vec4 vColor;
      varying vec2 vUv;

      void main() {

        vPosition = position;
        vPositionWorld = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
        vCentre = centre;
        vCentreWorld = projectionMatrix * modelViewMatrix * vec4( centre, 1.0 );
        vNormal = normal;
        vColor = color;
        vUv = uv;

        gl_Position = vPositionWorld;
      }
    `,
    fragmentShader: `
      precision highp float;
      precision highp int;

      uniform int mode;
      uniform float time;
      uniform vec2 resolution;
      uniform sampler2D texture;
      uniform float tintAlpha;
      uniform float cubeToCameraDistNorm;
      uniform bool canGoInsideCube;

      varying vec3 vPosition;
      varying vec4 vPositionWorld;
      varying vec3 vCentre;
      varying vec4 vCentreWorld;
      varying vec3 vNormal;
      varying vec4 vColor;
      varying vec2 vUv;

      const float PI2 = 6.283185307179586;

      float map( float value, float inputMin, float inputMax, float outputMin, float outputMax ) {
        if( abs(inputMin - inputMax) < 0.00001 ) {
          return outputMin;
        } else {
          float outVal = ((value - inputMin) / (inputMax - inputMin) * (outputMax - outputMin) + outputMin);
          if(outputMax < outputMin){
            if( outVal < outputMax )outVal = outputMax;
            else if( outVal > outputMin )outVal = outputMin;
          } else {
            if( outVal > outputMax )outVal = outputMax;
            else if( outVal < outputMin )outVal = outputMin;
          }
          return outVal;
        }
      }

      vec4 alphaBlend( vec4 src, vec4 dst ) {
        float final_alpha = src.a + dst.a * (1.0 - src.a);
        if( final_alpha == 0.0 ) {
          return vec4( 0.0, 0.0, 0.0, 0.0 );
        }
        return vec4( (src.rgb * src.a + dst.rgb * dst.a * (1.0 - src.a)) / final_alpha, final_alpha);
      }

      float borders(vec2 uv, float strokeWidth) {
        vec2 borderBottomLeft = smoothstep(vec2(0.0), vec2(strokeWidth), uv);
        vec2 borderTopRight = smoothstep(vec2(0.0), vec2(strokeWidth), 1.0 - uv);
        return 1.0 - borderBottomLeft.x * borderBottomLeft.y * borderTopRight.x * borderTopRight.y;
      }

      vec4 warp( vec2 st ) {
        vec2 toCenter = vCentreWorld.xy - vPositionWorld.xy;
        float direction = (atan(toCenter.y, toCenter.x) / PI2) + 0.5;
        float length = borders(vUv, 0.028) + borders(vUv, 0.06) * 0.3;
        if( false ) { // debug.
          return vec4(direction, length, 0.0, 1.0);
        }

        vec2 dir = vec2(cos(direction * PI2), sin(direction * PI2));

        vec2 stWarp = st;
        stWarp.x += (length * 0.07) * dir.x;
        stWarp.y += (length * 0.07) * dir.y;

        return texture2D(texture, stWarp);
      }

      void main()  {

        vec2 st = gl_FragCoord.xy / resolution;
        vec4 color = vec4( 0.0, 0.0, 0.0, 0.0 );

        vec4 colorBorder = vec4( borders(vUv, 0.02) );
        if( colorBorder.a > 0.0 ) {
          colorBorder.rgb /= colorBorder.a; // premultiply alpha fix for dark shadows.
        }

        float colorTexAlphaMin = 0.5;
        float frostAlphaMax = 0.6;

        if( mode == 0 ) { // cube interior / back facing.

          vec4 colorTint = vec4( 0.0, 0.0, 0.0, tintAlpha );
          vec4 colorBorderFaded = vec4( colorBorder.rgb, colorBorder.a * 0.6 );
          
          color = alphaBlend( colorBorderFaded, colorTint );

          if( cubeToCameraDistNorm < 0.0 && canGoInsideCube ) { // below 0.0, meams we're inside the cube.
            
            vec4 colorTex = texture2D(texture, st);
            float colorTexAlpha = map( cubeToCameraDistNorm, 0.0, -0.5, colorTexAlphaMin, 1.0 );
            colorTex.a *= colorTexAlpha;

            float frostAlpha = map( cubeToCameraDistNorm, 0.0, -1.0, frostAlphaMax, 0.0 );
            vec4 frostCol = vec4(1.0, 1.0, 1.0, frostAlpha );

            color = alphaBlend( colorTex, color );
            color = alphaBlend( frostCol, color );
          }

        } else { // cube exterior / front facing.

          if( cubeToCameraDistNorm < 0.0 ) {
            discard; // below 0.0, meams we're inside the cube.
          }

          vec4 colorTex = warp( st );
          float colorTexAlpha = map( cubeToCameraDistNorm, 1.0, 0.5, 1.0, colorTexAlphaMin );
          colorTex.a *= colorTexAlpha;

          float frostAlpha = map( cubeToCameraDistNorm, 1.0, 0.0, 0.0, frostAlphaMax );
          vec4 frostCol = vec4(1.0, 1.0, 1.0, frostAlpha );

          color = colorTex;
          color = alphaBlend( frostCol, color );
          color = alphaBlend( colorBorder, color );
        }

        gl_FragColor = color;
      }
    `,
    side: DoubleSide,
    transparent: true,
  });

  return material;
}

// ---------------------------------------------------------------- EJCube2
class EJCube2 extends EJCubeBase {
  constructor(container, gui) {
    super(container, gui);
    this.style = EJCubeStyleGlass;

    this.geometry = EJCube.initCubeGeometry();
    this.materialBack = initCubeMaterial$1();
    this.materialFront = initCubeMaterial$1();

    this.cubeBack = new Mesh(this.geometry, this.materialBack);
    this.cubeBack.name = 'cubeBack';
    this.cubeBack.material.side = BackSide;
    this.cubeBack.material.uniforms.mode.value = 0;
    this.cubeBack.material.uniformsNeedUpdate = true;

    this.cubeFront = new Mesh(this.geometry, this.materialFront);
    this.cubeFront.name = 'cubeFront';
    this.cubeFront.material.side = FrontSide;
    this.cubeFront.material.uniforms.mode.value = 1;
    this.cubeFront.material.uniformsNeedUpdate = true;

    this.container.add(this.cubeBack);
    this.container.add(this.cubeFront);

    if (this.guiFolder) {
      this.guiFolder.add(this.materialBack.uniforms.tintAlpha, 'value', 0.0, 1.0).name('Tint Alpha').onChange(value => {
        this.materialBack.uniforms.tintAlpha.value = value;
        this.materialBack.uniformsNeedUpdate = true;
      });
      this.guiFolder.add(this, 'cubeToCameraThreshold', 0.0, 1.0).name('Cube Threshold').onChange(value => {
        this.cubeToCameraThreshold = value;
      });
    }
  }

  update(camera) {
    super.update(camera);

    this.materialBack.uniforms.cubeToCameraDistNorm.value = this.cubeToCameraDistNorm;
    this.materialBack.uniformsNeedUpdate = true;

    this.materialFront.uniforms.cubeToCameraDistNorm.value = this.cubeToCameraDistNorm;
    this.materialFront.uniformsNeedUpdate = true;
  }

  updateProps(texture, resolution, canGoInsideCube) {
    super.updateProps(texture, resolution, canGoInsideCube);

    this.materialBack.uniforms.resolution.value = resolution;
    this.materialBack.uniforms.texture.value = texture;
    this.materialBack.uniforms.canGoInsideCube.value = canGoInsideCube;
    this.materialBack.uniformsNeedUpdate = true;

    this.materialFront.uniforms.resolution.value = resolution;
    this.materialFront.uniforms.texture.value = texture;
    this.materialFront.uniforms.canGoInsideCube.value = canGoInsideCube;
    this.materialFront.uniformsNeedUpdate = true;
  }

  dispose() {
    super.dispose();
  }
}

const shaderVert = "#version 300 es\n//3.00 we need for normal map calc\n\nprecision highp float;\nprecision highp int;\n\n//built in\n//https://threejs.org/docs/#api/en/renderers/webgl/WebGLProgram\nuniform mat4 modelViewMatrix; \nuniform mat4 projectionMatrix; \nuniform vec3 cameraPosition;  \nuniform mat4 viewMatrix;\nuniform mat4 modelMatrix;\n\n\nin vec3 position;\nin vec3 centre;\nin vec3 normal;\nin vec3 tangent;\nin vec4 color;\nin vec2 uv;\n\n\nout vec3 vPosWorld; //correct world space \nout vec3 vNormalWorld;\n// out vec3 vTangentWorld;\n// out vec3 vBitangentWorld;\nout vec3 vViewDir;\nout vec3 vViewPosition;\n// out vec4 vColor;\nout vec2 vUv;\n\n//old\nout vec3 vPosition;\nout vec4 vPositionWorld;\nout vec3 vCentre;\nout vec4 vCentreWorld;\nout vec3 vNormal;\n\n\n//from THREEjs examples\nvec3 inverseTransformDirection( in vec3 dir, in mat4 matrix ) {\n  return normalize( ( vec4( dir, 0.0 ) * matrix ).xyz );\n}\n\nvoid main() {\n\n  vPosWorld =  ( modelMatrix * vec4( position, 1. ) ).xyz;\n  vNormalWorld = inverseTransformDirection( normal, modelMatrix );\n  vViewDir = normalize(vPosWorld - cameraPosition); //?\n\n  /*\n  vTangentWorld = normalize( (vec4( tangent, 0.0 ) * modelMatrix ).xyz );\n  vBitangentWorld = normalize( cross( vNormalWorld, vTangentWorld ) );\n  */\n\n  //these we need to normal map calc\n  vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );\n  vViewPosition = - mvPosition.xyz;\n\n  vUv = uv;\n\n  //old vals\n  //TODO DEPRECATE\n  vPosition = position;\n  vPositionWorld = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );\n  vCentre = centre;\n  vCentreWorld = projectionMatrix * modelViewMatrix * vec4( centre, 1.0 );\n  vNormal = normal;\n  // vColor = color;\n\n  gl_Position = vPositionWorld;\n}";

const shaderFrag = "#version 300 es\n\nprecision highp float;\nprecision highp int;\n\n#define PI 3.14159\n#define PI2 6.283185307179586\n\n//built in \n//https://threejs.org/docs/#api/en/renderers/webgl/WebGLProgram\nuniform vec3 cameraPosition;  \nuniform mat4 viewMatrix;\nuniform mat4 modelMatrix;\nuniform mat4 projectionMatrix;\n\n\n//from vert\nin vec3 vPosWorld;\nin vec3 vNormalWorld;\nin vec3 vViewDir;\nin vec3 vViewPosition;\nin vec2 vUv; //surface uvs\n// in vec4 vColor;\n// in vec3 vTangentWorld;\n// in vec3 vBitangentWorld;\n\n//old\nin vec3 vPosition;\nin vec4 vPositionWorld;\nin vec3 vCentre;\nin vec4 vCentreWorld;\nin vec3 vNormal;\n\nout vec4 fragColor;\n\n\n\nuniform int mode;  //rename to faceDir \nuniform float time;\nuniform vec2 resolution;\nuniform sampler2D texBack; //todo rename to transmissionSamplerMap or back texture \nuniform float cubeToCameraDistNorm;\nuniform bool canGoInsideCube;\n\nuniform float tintAlpha;\nuniform vec3 tintColor; //rename to tintColor\n// uniform float camFOV;\n\nuniform sampler2D texHDRI; //equirectangular HDRI\nuniform float texEnvExposure;\n\nconst float normalScale = .02;\nuniform sampler2D texNormal; \n\n\n/*\nfloat map( float value, float inputMin, float inputMax, float outputMin, float outputMax ) {\n  if( abs(inputMin - inputMax) < .00001 ) {\n    return outputMin;\n  } else {\n    float outVal = ((value - inputMin) / (inputMax - inputMin) * (outputMax - outputMin) + outputMin);\n    if(outputMax < outputMin){\n      if( outVal < outputMax )outVal = outputMax;\n      else if( outVal > outputMin )outVal = outputMin;\n    } else {\n      if( outVal > outputMax )outVal = outputMax;\n      else if( outVal < outputMin )outVal = outputMin;\n    }\n    return outVal;\n  }\n}\n\nvec4 alphaBlend( vec4 src, vec4 dst ) {\n  float final_alpha = src.a + dst.a * (1.0 - src.a);\n  if(final_alpha == .0) {\n    return vec4(.0,.0,.0,.0);\n  }\n  return vec4( (src.rgb * src.a + dst.rgb * dst.a * (1.0 - src.a)) / final_alpha, final_alpha);\n}\n\n\nfloat borders(vec2 uv, float strokeWidth) {\n  vec2 borderBottomLeft = smoothstep(vec2(0.0), vec2(strokeWidth), uv);\n  vec2 borderTopRight = smoothstep(vec2(0.0), vec2(strokeWidth), 1.0 - uv);\n  return 1.0 - borderBottomLeft.x * borderBottomLeft.y * borderTopRight.x * borderTopRight.y;\n}\n\nvec4 warp( vec2 st ) {\n  vec2 toCenter = vCentreWorld.xy - vPositionWorld.xy;\n  float direction = (atan(toCenter.y, toCenter.x) / PI2) + 0.5;\n  float length = borders(vUv, 0.028) + borders(vUv, 0.06) * 0.3;\n  if( false ) { // debug.\n    return vec4(direction, length, 0.0, 1.0);\n  }\n\n  vec2 dir = vec2(cos(direction * PI2), sin(direction * PI2));\n\n  vec2 stWarp = st;\n  stWarp.x += (length * 0.07) * dir.x;\n  stWarp.y += (length * 0.07) * dir.y;\n\n  return texture(texBack, stWarp);\n}\n*/\n/*\n// with pre-calc tangents\nvec3 getDetailNormal2(vec3 n){ \n\n  float normalScale = 0.02;\n  vec3 mapN = texture(texNormal, vUv ).xyz * 2. - 1.;\n  mapN.xy *= normalScale;\n\n\n  // #ifdef FLIP_SIDED\n  //   transformedTangent = - transformedTangent;\n  // #endif\n\n\n  vec3 tangent = normalize( vTangentWorld );\n  vec3 bitangent = normalize( vBitangentWorld );\n\n  // #ifdef DOUBLE_SIDED\n  //   tangent = tangent * faceDirection;\n  //   bitangent = bitangent * faceDirection;\n  // #endif\n  // #if defined( TANGENTSPACE_NORMALMAP ) || defined( USE_CLEARCOAT_NORMALMAP )\n\n  mat3 vTBN = mat3( vTangentWorld, vBitangentWorld, vNormalWorld );\n  vec3 nDetailed = normalize( vTBN * mapN );\n\n\n\n  // float faceDirection = gl_FrontFacing ? 1. : - 1.;\n  // vec3 nDetailed = applyNormalMap( n, mapN, faceDirection ); \n  return nDetailed;\n\n}\n*/\n\n\n\n//https://stackoverflow.com/questions/56625730/does-blending-work-with-the-glsl-mix-function\nvec4 blend(vec4 src, vec4 dst, float alpha){ return src*alpha + dst*(1.-alpha); }\n\n// vec3 bms(vec3 a, vec3 b){ return 1.- (1.-a)*(1.-b); }\n// float bms(float a, float b){ return 1.- (1.-a)*(1.-b); }\n\n\n//Equirectangular HDRI\n//https://www.shadertoy.com/view/4lK3DK\nvec3 getHDRI(vec3 rd){\n  vec2 uv = vec2(atan(rd.z, rd.x) + PI, acos(-rd.y)) / vec2(2. * PI, PI); //TODO PI2\n  vec3 col = texture(texHDRI, uv).rgb;\n  //TODO: on THREEjs side\n  col = pow(col, vec3(2.2)); //sRGB -> Linear, \n  col *= texEnvExposure;\n  return col;\n}\n\n//Note: it will be faster with precomputed tangents. bi tangents cud be calculated from t x n\n//from normalmap_pars_fragment.glsl.js\n// Normal Mapping Without Precomputed Tangents\n// http://www.thetenthplanet.de/archives/1180\nvec3 perturbNormal2Arb( vec3 eye_pos, vec3 surf_norm, vec3 mapN, float faceDirection ) {\n\n  vec3 q0 = dFdx( eye_pos.xyz );\n  vec3 q1 = dFdy( eye_pos.xyz );\n  vec2 st0 = dFdx( vUv.st );\n  vec2 st1 = dFdy( vUv.st );\n\n  vec3 N = surf_norm; // normalized\n\n  vec3 q1perp = cross( q1, N );\n  vec3 q0perp = cross( N, q0 );\n\n  vec3 T = q1perp * st0.x + q0perp * st1.x;\n  vec3 B = q1perp * st0.y + q0perp * st1.y;\n\n  float det = max( dot( T, T ), dot( B, B ) );\n  float scale = ( det == 0.0 ) ? 0.0 : faceDirection * inversesqrt( det );\n\n  return normalize( T * ( mapN.x * scale ) + B * ( mapN.y * scale ) + N * mapN.z );\n\n}\n\nvec3 getDetailNormal(vec3 n){ \n\n  // float normalScale = 0.02;\n  vec3 mapN = texture(texNormal, vUv).xyz * 2. - 1.;\n  mapN.xy *= normalScale;\n\n  //TODO check with main normal - coz we flip it also\n  float faceDirection = gl_FrontFacing ? 1. : - 1.;\n\n  vec3 normal = perturbNormal2Arb( - vViewPosition, n, mapN, faceDirection );\n  return normal;\n}\n\n\n//back texture refration\n//from transmission_pars_fragment.glsl.js\nvec4 transmission(vec3 n){\n\n  vec3 pos = vPosWorld;\n  vec3 v = -vViewDir;\n  float ior = 2.;  //we use different ior for refration coz it looks better\n  float thickness = .05;\n\n  //face dir==back face\n  // if(mode==0) ior = 1./ior; //glass to air\n\n  // Direction of refracted light.\n  vec3 refractionVector = refract( - v, normalize( n ), 1.0 / ior );\n\n  // Compute rotation-independant scaling of the model matrix.\n  vec3 modelScale;\n  modelScale.x = length( vec3( modelMatrix[ 0 ].xyz ) );\n  modelScale.y = length( vec3( modelMatrix[ 1 ].xyz ) );\n  modelScale.z = length( vec3( modelMatrix[ 2 ].xyz ) );\n\n  // The thickness is specified in local space.\n  vec3 transmissionRay =  normalize( refractionVector ) * thickness * modelScale;\n\n  vec3 refractedRayExit = pos + transmissionRay;\n\n  // Project refracted vector on the framebuffer, \n  // while mapping to normalized device coordinates.\n  vec4 ndcPos = projectionMatrix * viewMatrix * vec4( refractedRayExit, 1.0 );\n  vec2 refractionCoords = ndcPos.xy / ndcPos.w;\n  refractionCoords += 1.0;\n  refractionCoords /= 2.0;\n\n  vec4 col = texture(texBack, refractionCoords.xy).xyzw;\n  return col;\n\n}\n\n\n//surface shading \n\n//fresnel-schlick\nconst float EPS = 1e-3;\nfloat dot_c(vec3 a, vec3 b){ return max(dot(a, b), EPS); } //clamped dot with min eps val\nfloat fre(vec3 n, vec3 rayDir, float ior){\n  float f0 = pow(ior - 1., 2.) / pow(ior + 1., 2.); \n  float cosTheta = dot_c(n, -rayDir);\n  float f = f0 + (1.-f0) * pow(1.-cosTheta, 5.);\n  return f;\n}\n\n\nvec4 shadeFront(vec3 p, vec3 n, vec3 rayDir){ \n  \n  vec4 col = vec4(0.,0.,0.,0.); \n  vec4 ambientCol = transmission(n); //back texture refraction\n\n  vec3 reflectedCol = getHDRI(reflect(rayDir, n));\n  \n  //this one is for fresnel. we have another one for refraction. coz it looks better\n  float ior = 1.2;\n  float f = fre(n, rayDir, ior);\n\n  vec4 colTint = vec4(tintColor, tintAlpha);\n\n  col = colTint;\n  col = blend(ambientCol, col, ambientCol.a );   //inner material \n  col = blend(vec4(reflectedCol,1.), col, f ); //surface material \n\n  // col = mix(ambientCol, vec4(reflectedCol,1.), vec4(f.x) );\n\n  return col;\n}\n\n\nvec4 shadeBack(vec3 p, vec3 n, vec3 rayDir){ \n\n  vec4 col = vec4(0.,0.,0.,0.);\n  // vec4 colTint = vec4(tintColor, tintAlpha);\n\n  vec3 reflectedCol = getHDRI(reflect(rayDir, n));\n  \n  float ior = 1.2;\n  float f = fre(n, rayDir,ior);\n\n  col = blend(vec4(reflectedCol, 1.), col, f );\n\n  return col;\n}\n\n\n\nvoid main()  {\n\n  vec2 uv = gl_FragCoord.xy / resolution; //screen uvs\n  // bool faceDir = gl_FrontFacing;// ? 1. : - 1.;\n  vec4 col = vec4(0.,0.,0.,0.);\n\n  /*\n  vec4 colBorder = vec4( borders(vUv, 0.02) );\n  if( colBorder.a > 0.0 ) {\n    colBorder.rgb /= colBorder.a; // premultiply alpha fix for dark shadows.\n  }\n\n  float colTexAlphaMin = 0.5;\n  float frostAlphaMax = 0.6;\n  */\n\n  //Back face, cube interior \n  if( mode == 0 ) { \n\n/*\n    vec4 colTint = vec4( tintColor, tintAlpha );\n    // vec4 colBorderFaded = vec4( colBorder.rgb, colBorder.a * 0.6 );\n    \n    // col = alphaBlend( colBorderFaded, colTint );\n    col =  colTint ;\n\n    // below 0.0, means we're inside the cube.\n    if( cubeToCameraDistNorm < 0.0 && canGoInsideCube ) { \n      \n      vec4 colTex = texture(texBack, uv); //back texture?\n      float colTexAlpha = map( cubeToCameraDistNorm, 0.0, -0.5, colTexAlphaMin, 1.0 );\n      colTex.a *= colTexAlpha;\n\n      // float frostAlpha = map( cubeToCameraDistNorm, 0., -1., frostAlphaMax, 0. );\n      // vec4 frostCol = vec4(1., 1., 1., frostAlpha );\n\n      col = alphaBlend( colTex, col );\n      // col = alphaBlend( frostCol, col );\n\n    }\n*/\n    \n\n    vec3 p = vPosWorld;       //pos on surface\n    vec3 n = -vNormalWorld;   //normal on surface: flipped for the back \n    //TODO check normal map along with this flipped normal - but its not critical\n\n    vec3 rayDir = normalize(vViewDir); //already normalized, rename to viewDir\n    vec3 nDetailed = getDetailNormal(n); //normalized\n\n    vec4 colSurface = shadeBack(p, nDetailed, rayDir);\n    col = colSurface; \n\n  } \n\n  // Front Face, cube exterior \n  else { \n\n    /*\n    //clip front face?\n    if( cubeToCameraDistNorm < 0.0 ) {\n      discard; // below 0.0, means we're inside the cube.\n    }\n\n    vec4 colTex = warp( uv );\n\n    float colTexAlpha = map( cubeToCameraDistNorm, 1., .5, 1., colTexAlphaMin );\n    colTex.a *= colTexAlpha;\n\n    float frostAlpha = map( cubeToCameraDistNorm, 1., 0., 0., frostAlphaMax );\n    vec4 frostCol = vec4(1., 1., 1., frostAlpha );\n\n    col = colTex;\n    \n    col = alphaBlend( frostCol, col );\n    col = alphaBlend( colBorder, col );\n    */\n\n    vec3 p = vPosWorld;       //pos on surface\n    vec3 n = vNormalWorld;    //normal on surface\n\n    \n    vec3 rayDir = normalize(vViewDir); //already normalized, todo renme to viewDir\n    vec3 nDetailed = getDetailNormal(n); //normalized\n\n\n    vec4 colSurface = shadeFront(p, nDetailed, rayDir);\n    col = colSurface;\n  }\n\n  // col.xyz = pow(col.xyz, vec3(.4545) ); //gamma coorection\n\n  fragColor = col;\n}\n";

class TexSwitch {
  constructor() {
    this.texLoader = null; // to be initialized
    this.rgbeLoader = null; // to be initialized
    this.pmremGenerator = null; // to be initialized


    // normal maps
    this.texNormal = [
      'n9.jpg',
      'n12.jpg',
      'n14.jpg',
      'n16.jpg',
      // 'n17.jpg',
    ];


    this.texEnv = [
      'studio016.hdr',
      'empty_warehouse_01_1k.hdr',
      // 'old_bus_depot_1k.hdr',
      'hamburg_hbf_1k.hdr',
    ];

    this.texRoughness = [
      'h17.jpg',
      'h9.jpg',
      'h12.jpg',
      'h14.jpg',
      'h16.jpg',
    ];


    this.texNormalId = 0;
    this.texEnvId = 0;
    // this.texRoughnessId = 0; //TODO depr
  }

  loadNormalMap(materials, _texNormalId) {
    this.texNormalId = _texNormalId;
    this.texLoader.load('/libs/ejx/assets/normal/' + this.texNormal[_texNormalId], function(tex) {
      tex.encoding = sRGBEncoding;
      tex.wrapS = RepeatWrapping;
      tex.wrapT = RepeatWrapping;

      for (let i = 0; i < materials.length; i++) {
        materials[i].uniforms.texNormal.value = tex;
        materials[i].uniformsNeedUpdate = true;
      }
    });
  }

  // loads env map
  loadEnvMap(materials, _texEnvId) {
    // const _this = this;
    this.texEnvId = _texEnvId;
    this.rgbeLoader.load('/libs/ejx/assets/env/' + this.texEnv[_texEnvId], function(tex) {
      tex.minFilter = NearestFilter;
      tex.wrapS = RepeatWrapping;
      tex.wrapT = RepeatWrapping;
      tex.encoding = LinearEncoding;// TODO sRGBEncoding;//rn we convert it in the shader

      for (let i = 0; i < materials.length; i++) {
        materials[i].uniforms.texHDRI.value = tex;

        // preset hdri exposures
        if (i == 0) materials[i].uniforms.texEnvExposure.value = 1.;
        if (i == 1) materials[i].uniforms.texEnvExposure.value = .2;
        if (i == 2) materials[i].uniforms.texEnvExposure.value = .02;


        materials[i].uniformsNeedUpdate = true;
      }


      // tex.mapping = EquirectangularReflectionMapping;
      // tex.mapping = EquirectangularRefractionMapping;
      // tex.encoding = sRGBEncoding;
      // mat.envMap =  _this.pmremGenerator.fromEquirectangular(tex).texture;
      // mat.needsUpdate = true;
    });
  }


  loadRoughnessMap(mat, _texRoughnessId) {
    // texture switch


    // itterate thru textures
    // this.texRoughnessId++;
    // if(texRoughnessId>texRoughness.length-1) texRoughnessId=0;
    this.texRoughnessId = _texRoughnessId;
    // console.log(_texRoughnessId);
    this.texLoader.load('/libs/ejx/assets/rough/' + this.texRoughness[_texRoughnessId], function(tex) {
      tex.encoding = sRGBEncoding;

      mat.roughnessMap = tex;
      mat.needsUpdate = true;
    });
  }
}

// forked from EJCube2 by @vladstorm

function initCubeMaterial() {
  let material = new RawShaderMaterial({
    vertexShader: shaderVert,
    fragmentShader: shaderFrag,

    uniforms: {

      mode: { value: 0 }, // TODO rename to faceDir
      time: { value: 1. },
      resolution: { value: new Vector2(0, 0) },
      texBack: { value: null },

      tintColor: { value: new Color(0x000000) },
      tintAlpha: { value: 0.2 },

      texHDRI: { value: null },
      texEnvExposure: { value: .2 },

      texNormal: { value: null },

      cubeToCameraDistNorm: { value: 1.0 },
      canGoInsideCube: { value: false },

      // camFOV: {value: 50.}, //TODO set
      // cameraPos: {value: new THREE.Vector3(0)},
    },
    side: DoubleSide,
    transparent: true,
  });

  return material;
}


// DEPRECATED
/*
function initPBRMaterial() {


  let material = new THREE.MeshPhysicalMaterial( {

    metalness: .0, //params.metalness,

    roughness: .15, //params.roughness,

    transmission: 1,
    opacity: 1,
    thickness: 2,

    envMap: null,
    envMapIntensity: 1.,

    roughnessMap: null,

    normalScale: new THREE.Vector2(.05),
    clearcoatNormalMap: null,
    normalMap: null,

    clearcoat: .05,

    // side: DoubleSide,
    side: FrontSide,
    transparent: true,
    depthWrite: false,
  });

  material.onBeforeCompile = shader => {
    shader.fragmentShader = shader.fragmentShader.replace('/vec4 diffuseColor.*;/', `
      // Assign whatever you want!
      vec4 diffuseColor = vec4(1., 0., 0., 1.);
    `)
  };

  return material;


}
*/

// ---------------------------------------------------------------- EJCube3
class EJCube3 extends EJCubeBase {
  constructor(container, gui) {
    super(container, gui);
    // vs
    this.style = EJCubeStyleGlass3;


    // this.geometry = EJCube.initCubeGeometry();
    this.geometry = new RoundedBoxGeometry(1, 1, 1, 4, .02);
    this.materialBack = initCubeMaterial();
    this.materialFront = initCubeMaterial();

    this.cubeBack = new Mesh(this.geometry, this.materialBack);
    this.cubeBack.name = 'cubeBack';
    this.cubeBack.material.side = BackSide;
    this.cubeBack.material.uniforms.mode.value = 0; // back face
    this.cubeBack.material.uniformsNeedUpdate = true;

    this.cubeFront = new Mesh(this.geometry, this.materialFront);
    this.cubeFront.name = 'cubeFront';
    this.cubeFront.material.side = FrontSide;
    this.cubeFront.material.uniforms.mode.value = 1; // front face
    this.cubeFront.material.uniformsNeedUpdate = true;


    // PBR tests
    // this.cubeFront0 = new Mesh(this.geometry, this.materialFront0);
    // this.cubeFront0.name = 'cubeFront';
    // this.cubeFront0.material.side = FrontSide;
    // this.cubeFront0.scale.set(1.1,1.1,1.1);
    // this.cubeFront0.scale = new THREE.Vector3(1.1);
    // this.cubeFront0.material.uniforms.mode.value = 1;
    // this.cubeFront0.material.uniformsNeedUpdate = true;


    this.container.add(this.cubeBack);
    this.container.add(this.cubeFront);
    // this.container.add(this.cubeFront0);

    // tex switch init
    let texSwitch = new TexSwitch();
    texSwitch.texLoader = new TextureLoader();
    texSwitch.rgbeLoader = new RGBELoader();
    // texSwitch.pmremGenerator = pmremGenerator;

    texSwitch.loadNormalMap([this.materialFront, this.materialBack], 1);
    texSwitch.loadEnvMap([this.materialFront, this.materialBack], 2);
    // texSwitch.loadRoughnessMap(this.materialFront, 3);


    if (this.guiFolder) {
      this.guiFolder.add(texSwitch, 'texNormalId', 0., texSwitch.texNormal.length - 1)
        .step(1).name('Normal Map').onChange(x => {
          texSwitch.loadNormalMap([this.materialFront, this.materialBack], x);
        });

      this.guiFolder.add(texSwitch, 'texEnvId', 0., texSwitch.texEnv.length - 1)
        .step(1).name('Env Map').onChange(x => {
          texSwitch.loadEnvMap([this.materialFront, this.materialBack], x);
        });

      this.guiFolder.add(this.materialFront.uniforms.texEnvExposure, 'value', 0., 2.)
        .name('Env Exposure').onChange(x => {
          this.materialBack.uniforms.texEnvExposure.value = x;
          this.materialBack.uniformsNeedUpdate = true;

          this.materialFront.uniforms.texEnvExposure.value = x;
          this.materialFront.uniformsNeedUpdate = true;
        });


      this.guiFolder.add(this.materialFront.uniforms.tintAlpha, 'value', 0., 1.)
        .name('Tint Alpha').onChange(x => {
          // this.materialBack.uniforms.mode.value = x;
          // this.materialBack.uniformsNeedUpdate = true;

          // this.materialFront.uniforms.mode.value = x;
          this.materialFront.uniformsNeedUpdate = true;
        });

      this.guiFolder.addColor(this.materialFront.uniforms.tintColor, 'value')
        .name('Tint Color').onChange(x => {
          // this.materialBack.uniforms.tintColor.value = x;
          // this.materialBack.uniformsNeedUpdate = true;

          this.materialFront.uniforms.tintColor.value = x;
          this.materialFront.uniformsNeedUpdate = true;
        });

      this.guiFolder.add(this, 'cubeToCameraThreshold', 0., 1.)
        .name('Cube Threshold').onChange(value => {
          this.cubeToCameraThreshold = value;
        });


      /*

      //PBR
      this.guiFolder.add(this.materialFront, 'metalness', 0., 1.).name('metalness').onChange(x => {
        this.materialFront.uniformsNeedUpdate = true;
      });
      this.guiFolder.add(this.materialFront, 'roughness', 0., 1.).name('roughness').onChange(x => {
        this.materialFront.uniformsNeedUpdate = true;
      });

      this.guiFolder.add(this.materialFront, 'envMapIntensity', 0., 5.).name('envMapIntensity').onChange(x => {
        this.materialFront.uniformsNeedUpdate = true;
      });

      this.guiFolder.add(this.materialFront, 'transmission', 0., 1.).name('transmission').onChange(x => {
        this.materialFront.uniformsNeedUpdate = true;
      });

      this.guiFolder.add(this.materialFront, 'opacity', 0., 1.).name('opacity').onChange(x => {
        this.materialFront.uniformsNeedUpdate = true;
      });


      this.guiFolder.add(this.materialFront, 'thickness', 0., 5.).name('thickness').onChange(x => {
        this.materialFront.uniformsNeedUpdate = true;
      });

      this.guiFolder.add(this.materialFront.normalScale, 'x', 0., 1.).name('normalScale').onChange(x => {
        this.materialFront.normalScale.set(x, x);
        this.materialFront.uniformsNeedUpdate = true;
      });

      this.guiFolder.add(this.materialFront, 'clearcoat', 0., 1.).name('clearcoat').onChange(x => {
        this.materialFront.uniformsNeedUpdate = true;
      });

      this.guiFolder.add(texSwitch, 'texRoughnessId', 0., texSwitch.texRoughness.length-1).step( 1 ).name('Roughness Map Id').onChange(x => {
        texSwitch.loadRoughnessMap(this.materialFront, x);
      });
      */
    }
  }

  update(camera) {
    super.update(camera);

    this.materialBack.uniforms.cubeToCameraDistNorm.value = this.cubeToCameraDistNorm;
    this.materialBack.uniformsNeedUpdate = true;

    // this.materialFront.uniforms.cameraPos.value = camera.position;
    this.materialFront.uniforms.cubeToCameraDistNorm.value = this.cubeToCameraDistNorm;
    this.materialFront.uniformsNeedUpdate = true;
  }

  updateProps(texture, resolution, canGoInsideCube) {
    super.updateProps(texture, resolution, canGoInsideCube);

    this.materialBack.uniforms.resolution.value = resolution;
    this.materialBack.uniforms.texBack.value = texture;
    this.materialBack.uniforms.canGoInsideCube.value = canGoInsideCube;
    this.materialBack.uniformsNeedUpdate = true;

    this.materialFront.uniforms.resolution.value = resolution;
    this.materialFront.uniforms.texBack.value = texture;
    this.materialFront.uniforms.canGoInsideCube.value = canGoInsideCube;
    this.materialFront.uniformsNeedUpdate = true;
  }

  dispose() {
    super.dispose();
  }
}

/* eslint-disable max-len */

class EJCubeMask extends EJCubeBase {
  constructor(container) {
    super(container);
    this.style = EJCubeStyleMask;

    this.cubeBackGeometry = new BoxGeometry(1, 1, 1);
    this.cubeBackMaterial = new MeshBasicMaterial({
      color: 0xff0000,
      side: BackSide,
      depthWrite: false,
      depthTest: false,
    });
    this.cubeBack = new Mesh(this.cubeBackGeometry, this.cubeBackMaterial);
    this.cubeBack.name = 'cube-mask-back';
    this.container.add(this.cubeBack);

    const faceColorMasks = EJCube.getFaceColorMasks();
    this.cubeFront = new Object3D();
    this.cubeFront.name = 'cube-mask-front';
    this.cubeFrontFaces = [];
    for (let i = 0; i < 6; i++) {
      const faceColorMask = faceColorMasks[i];
      const cubeFaceGeom = new PlaneGeometry(1, 1);
      const cubeFaceMat = new MeshBasicMaterial({
        color: new Color(faceColorMask.x, faceColorMask.y, faceColorMask.z),
        side: FrontSide,
        depthWrite: false,
        depthTest: false,
      });
      const cubeFace = new Mesh(cubeFaceGeom, cubeFaceMat);
      if (i === 0) {
        cubeFace.position.z = 0.5;
      } else if (i === 1) {
        cubeFace.position.x = 0.5;
        cubeFace.rotation.y = Math.PI * 0.5;
      } else if (i === 2) {
        cubeFace.position.z = -0.5;
        cubeFace.rotation.y = Math.PI;
      } else if (i === 3) {
        cubeFace.position.x = -0.5;
        cubeFace.rotation.y = -Math.PI * 0.5;
      } else if (i === 4) {
        cubeFace.position.y = 0.5;
        cubeFace.rotation.x = -Math.PI * 0.5;
      } else if (i === 5) {
        cubeFace.position.y = -0.5;
        cubeFace.rotation.x = Math.PI * 0.5;
      }
      this.cubeFrontFaces.push( cubeFace );
      this.cubeFront.add( cubeFace );
    }
    this.container.add(this.cubeFront);
  }

  setFaceColorMask(cubeFaceIndex, colorMask) {
    const cubeFace = this.cubeFrontFaces[cubeFaceIndex];
    cubeFace.material.color.r = colorMask.x;
    cubeFace.material.color.g = colorMask.y;
    cubeFace.material.color.b = colorMask.z;
  }

  update(elapsed, delta) {
    //
  }
}

/* eslint-disable max-len */

class EJEnv {
  constructor(container, camera) {
    this.container = container;
    this.camera = camera;

    this.texture = new TextureLoader().load('./libs/ejx/assets/gallery.jpg', this.textureLoaded.bind(this));
    this.texture.encoding = sRGBEncoding;

    this.geometry = new PlaneGeometry(1, 1, 1, 1);
    this.material = new MeshBasicMaterial({
      map: this.texture,
      color: new Color(0xffffff),
      opacity: 1.0,
      transparent: false,
      depthTest: false,
      depthWrite: false,
    });
    this.plane = new Mesh(this.geometry, this.material);
    this.plane.rotation.y = -Math.PI;
    this.plane.visible = false;

    this.container.add(this.plane);
  }

  textureLoaded(texture) {
    this.textureWidth = texture.image.width;
    this.textureHeight = texture.image.height;
    this.textureAspect = this.textureWidth / this.textureHeight;
    this.plane.visible = true;
  }

  fitPlaneToScreen(plane, camera, textureAspect) {
    let planeHeight = 1.0;
    let distance = planeHeight * 0.5 / Math.tan(camera.fov * 0.5 * (Math.PI / 180));
    let cameraDir = new Vector3();
    camera.getWorldDirection(cameraDir);
    plane.position.set(camera.position.x, camera.position.y, camera.position.z);
    plane.position.add(cameraDir.multiplyScalar(distance));
    plane.rotation.setFromRotationMatrix(camera.matrix);
    plane.scale.set(textureAspect, 1.0, 1.0);
  }

  update() {
    this.fitPlaneToScreen(this.plane, this.camera, this.textureAspect);
  }
}

const EJEnvTypeNone = 'None';
const EJEnvTypeImage = 'Image';

class EJEnvCamera {
  constructor(container, camera, cameraTexture) {
    this.container = container;
    this.camera = camera;
    this.texture = cameraTexture;

    // TODO: check that cameraTexture is always equal to window dimensions.
    this.textureWidth = window.innerWidth;
    this.textureHeight = window.innerHeight;
    this.textureAspect = this.textureWidth / this.textureHeight;

    this.geometry = new PlaneGeometry(1, 1, 1, 1);
    this.material = new MeshBasicMaterial({
      map: this.texture,
      color: new Color(0xffffff),
      opacity: 1.0,
      transparent: false,
      depthTest: false,
      depthWrite: false,
    });
    this.plane = new Mesh(this.geometry, this.material);
    this.plane.rotation.y = -Math.PI;

    this.container.add(this.plane);
  }

  fitPlaneToScreen(plane, camera, textureAspect) {
    let planeHeight = 1.0;
    let distance = planeHeight * 0.5 / Math.tan(camera.fov * 0.5 * (Math.PI / 180));
    let cameraDir = new Vector3();
    camera.getWorldDirection(cameraDir);
    plane.position.set(camera.position.x, camera.position.y, camera.position.z);
    plane.position.add(cameraDir.multiplyScalar(distance));
    plane.rotation.setFromRotationMatrix(camera.matrix);
    plane.scale.set(textureAspect, 1.0, 1.0);
  }

  update() {
    this.fitPlaneToScreen(this.plane, this.camera, this.textureAspect);
  }
}

/* eslint-disable max-len */

// ---------------------------------------------------------------- EJPlayer
class EJPlayer {
  constructor(config) {
    if (EJPlayer.Instance) {
      return EJPlayer.Instance;
    }
    EJPlayer.Instance = this;

    this.config = config;
    if (this.config == null) {
      this.config = {
        gui: null,
      };
    }

    const w = window.innerWidth;
    const h = window.innerHeight;
    const r = window.devicePixelRatio;
    this.res = new Vector2(w, h);
    this.resRetina = new Vector2(w * r, h * r);

    this.play = 1;
    this.time = 0.0;
    this.clock = new Clock(false);
    this.contents = []; // possible future support for multiple content running at the same time.

    this.contentConfigOriginal = [];
    this.contentConfigCurrent = [];
    this.contentConfigInside = null;
    this.contentFaceOverrides = [];

    this.cameraInsideCube = {
      inside: false,
      insideChanged: false,
      insideFaceIndex: -1,
      px: false, // positive x flag
      nx: false, // negative x flag
      py: false, // positive y flag
      ny: false, // negative y flag
      pz: false, // positive z flag
      nz: false, // negative z flag
    };

    this.renderOverrideFunc = null;
    this.resizeOverrideFunc = null;

    this.clippingPlanesEmpty = Object.freeze( [] );
    this.clippingPlanesCube = [];
    const faceNormals = EJCube.getFaceNormals();
    for (let i = 0; i < faceNormals.length; i++) {
      const faceNormal = faceNormals[i];
      const plane = new Plane( faceNormal, 0.51 );
      this.clippingPlanesCube.push( plane );
    }

    this.init(this.config);

    this.render();
  }

  init(config) {
    const { canvas, renderer, camera, scene, cameraTexture } = config;

    this.canvas = canvas ? canvas : document.createElement('canvas');
    this.canvas.id = 'ej-renderer';

    let context = this.canvas.getContext('webgl2');

    if (renderer !== undefined && renderer !== null) {
      this.renderer = renderer;
    } else {
      this.renderer = new WebGLRenderer({
        canvas: this.canvas,
        context: context,
        alpha: true,
        antialias: true,
      });
      this.renderer.setSize(this.res.x, this.res.y);
      this.renderer.setPixelRatio(this.resRetina.x / this.res.x);
      this.renderer.setClearColor(0x000000, 0);
      this.renderer.autoClear = false;
      this.renderer.clippingPlanes = this.clippingPlanesEmpty;
      this.renderer.xr.enabled = true;
      // color grading.
      this.renderer.outputEncoding = sRGBEncoding;
      this.renderer.toneMapping = NoToneMapping;
      this.renderer.toneMappingExposure = 1;
      this.renderer.useLegacyLights = false;
    }

    document.body.appendChild(this.renderer.domElement);

    if (camera !== undefined && camera !== null) {
      this.camera = camera;
    } else {
      this.camera = new PerspectiveCamera(20, this.res.x / this.res.y, 0.01, 1000);
      this.camera.position.set(0, 0, 5);
      this.camera.lookAt(0, 0, 0);
    }
    this.camera.name = 'xrCamera';

    this.orbitControls = new OrbitControls(this.camera, this.renderer.domElement);
    this.orbitControls.enableDamping = true;
    this.orbitControls.minDistance = 0;
    this.orbitControls.maxDistance = 10;

    if (scene !== undefined && scene !== null) {
      this.scene = scene;
    } else {
      this.scene = new Scene();
      this.scene.background = null;
    }

    if (cameraTexture !== undefined && cameraTexture !== null) {
      this.cameraTexture = cameraTexture; // camera pixels as texture (optional)
    } else {
      this.cameraTexture = null;
    }

    this.initCommon();

    this.cubeInit(EJCubeStylePlain);

    this.inputEventsInit();

    window.addEventListener('resize', this.resizeHandler.bind(this));

    this.renderer.setAnimationLoop( this.animationLoop.bind(this) );
  }

  initCommon() {
    this.renderTargetContent = new WebGLRenderTarget(this.resRetina.x, this.resRetina.y, {
      wrapS: ClampToEdgeWrapping,
      wrapT: ClampToEdgeWrapping,
      magFilter: LinearFilter,
      minFilter: LinearFilter,
      generateMipmaps: false,
      format: RGBAFormat,
      type: UnsignedByteType,
      anisotropy: Texture.anisotropy,
      encoding: sRGBEncoding,
      depthBuffer: true,
      stencilBuffer: true,
      samples: 0,
    });
    this.renderTargetContentMasked = this.renderTargetContent.clone();
    this.renderTargetMask = this.renderTargetContent.clone();

    this.renderTargetContent.texture.name = 'EJ.renderTargetContent';
    this.renderTargetContentMasked.texture.name = 'EJ.renderTargetContentMasked';
    this.renderTargetMask.texture.name = 'EJ.renderTargetMask';

    this.renderTargets = [
      this.renderTargetContent,
      this.renderTargetContentMasked,
      this.renderTargetMask,
    ];

    this.cubeContainer = new Object3D();
    this.scene.add( this.cubeContainer );

    this.cubeMask = new EJCubeMask(new Object3D(), null);
    this.cubeMaskScene = new Scene();
    this.cubeMaskScene.add( this.cubeMask.container );
    this.cubeMaskPass = this.initMaskPass();
    this.cubeMaskPassCamera = new OrthographicCamera( - 1, 1, 1, - 1, 0, 1 );
  }

  initMaskPass() {
    const geom = new PlaneGeometry( 2, 2 );
    const mat = new ShaderMaterial({
      uniforms: {
        texContent: { type: 't', value: this.renderTargetContent.texture },
        texMask: { type: 't', value: this.renderTargetMask.texture },
        color: { value: new Vector3(0, 0, 0) },
      },
      vertexShader: `
        varying vec2 vUv;
        void main(){ 
          vUv = uv;
          gl_Position = vec4( position, 1.0 );
        }
      `,
      fragmentShader: `
        uniform sampler2D texContent;
        uniform sampler2D texMask;
        uniform vec3 color;
        varying vec2 vUv;
        
        void main(){
          vec4 colorMask = texture2D( texMask, vUv);
          if(colorMask.r == color.r && colorMask.g == color.g && colorMask.b == color.b) {
            gl_FragColor = texture2D( texContent, vUv);
            return;
          }
          discard;
        }
      `,
    });
    const mesh = new Mesh(geom, mat);
    mesh.frustumCulled = false;
    return mesh;
  }

  animationLoop( timestamp, frame ) {
    if ( this.renderOverrideFunc !== null ) {
      this.renderOverrideFunc( timestamp, frame );
      return;
    }
    this.render( timestamp, frame );
  }

  render( timestamp, frame ) {
    if (this.clock.running == false) {
      this.clock.start();
    }
    let timeDelta = this.clock.getDelta();
    timeDelta *= this.play;
    this.time += timeDelta;

    if (this.orbitControls) {
      this.orbitControls.update();
    }

    this.envUpdate();

    this.cubeUpdate(this.camera);

    const cubeMatrix = new Matrix4();
    cubeMatrix.copy(this.cubeContainer.matrixWorld).invert();
    const pos = new Vector3(this.camera.position.x, this.camera.position.y, this.camera.position.z);
    pos.applyMatrix4( cubeMatrix );
    const cubeSize = 0.5;
    const cubeSizePad = cubeSize + 0.1;
    const px = pos.x <= cubeSize;
    const nx = pos.x >= -cubeSize;
    const py = pos.y <= cubeSize;
    const ny = pos.y >= -cubeSize;
    const pz = pos.z <= cubeSize;
    const nz = pos.z >= -cubeSize;
    const inside = px && nx && py && ny && pz && nz;
    const insidePad = (pos.x <= cubeSizePad) && (pos.x >= -cubeSizePad) && (pos.y <= cubeSizePad) && (pos.y >= -cubeSizePad) && (pos.z <= cubeSizePad) && (pos.z >= -cubeSizePad);
    this.cameraInsideCube.insideChanged = this.cameraInsideCube.inside != inside;
    this.cameraInsideCube.inside = inside;
    this.cameraInsideCube.insidePad = insidePad;
    if (this.cameraInsideCube.insideChanged) {
      if (this.cameraInsideCube.inside) {
        if ( this.cameraInsideCube.px != px ) { // positive x entry (right face)
          this.cameraInsideCube.insideFaceIndex = 1;
        } else if ( this.cameraInsideCube.nx != nx ) { // negative x entry (left face)
          this.cameraInsideCube.insideFaceIndex = 3;
        } else if ( this.cameraInsideCube.py != py ) { // positive y entry (top face)
          this.cameraInsideCube.insideFaceIndex = 4;
        } else if ( this.cameraInsideCube.ny != ny ) { // negative y entry (bottom face)
          this.cameraInsideCube.insideFaceIndex = 5;
        } else if ( this.cameraInsideCube.pz != pz ) { // positive z entry (front face)
          this.cameraInsideCube.insideFaceIndex = 0;
        } else if ( this.cameraInsideCube.nz != nz ) { // negative z entry (back face)
          this.cameraInsideCube.insideFaceIndex = 2;
        }
      }
    }
    this.cameraInsideCube.px = px;
    this.cameraInsideCube.nx = nx;
    this.cameraInsideCube.py = py;
    this.cameraInsideCube.ny = ny;
    this.cameraInsideCube.pz = pz;
    this.cameraInsideCube.nz = nz;

    const content = this.contentCurrent();
    if (content ) {
      this.renderContent( content );
    }
  }

  renderContent(content) {
    if (!content.instance) {
      return;
    }
    if (!content.instance.render) {
      console.log('content.instance.render does not exist.');
      return;
    }
    if (!this.cube) {
      this.renderer.render(this.scene, this.camera);
      if (content.instance.update) content.instance.update();
      content.instance.render();
      return;
    }

    const renderTargetSaved = this.renderer.getRenderTarget();

    this.camera.updateMatrixWorld();
    content.camera.copy(this.camera);

    this.cubeContainer.matrixWorld.decompose(
      content.scene.position,
      content.scene.quaternion,
      content.scene.scale
    );

    // clipping planes.

    let useClippingPlanesOld = (this.renderer.clippingPlanes.length > 0);
    let useClippingPlanesNew = false;
    if ( content.instance.useClippingPlanes ) {
      useClippingPlanesNew = content.instance.useClippingPlanes();
    }
    let useClippingPlanesChanged = useClippingPlanesNew !== useClippingPlanesOld;
    if (useClippingPlanesChanged) {
      if (useClippingPlanesNew) {
        this.renderer.clippingPlanes = this.clippingPlanesCube;
      } else {
        this.renderer.clippingPlanes = this.clippingPlanesEmpty;
      }
    }

    const faceNormals = EJCube.getFaceNormals();
    const faceCentres1 = EJCube.getFaceCentres();
    const faceCentres2 = EJCube.getFaceCentres();
    const screenBox = new Box2( new Vector2(0, 0), new Vector2(this.resRetina.x, this.resRetina.y) );

    const facesVisible = [];
    const cubeNormalMatrix = new Matrix3().getNormalMatrix( this.cubeContainer.matrixWorld );
    for (let i = 0; i < faceNormals.length; i++) {
      faceNormals[i].applyMatrix3( cubeNormalMatrix ).normalize();
    }
    for (let i = 0; i < faceCentres1.length; i++) {
      faceCentres1[i].applyMatrix4( this.cubeContainer.matrixWorld );
    }
    for (let i = 0; i < 6; i++) {
      const dirToCamera = this.camera.position.clone().sub( faceCentres1[i] );
      const facingCamera = dirToCamera.dot( faceNormals[i] ) > 0;
      if ( facingCamera === false ) {
        continue;
      }

      if (this.cameraInsideCube.insidePad === false) {
        // the below point projection to screen doesn't work too close to the plane,
        // possibly due to the projection matrix near clipping plane,
        // so adding a bit of padding to avoid false positives.

        const points = [
          new Vector3(-0.5, 0.5, 0.0),
          new Vector3(0.5, 0.5, 0.0),
          new Vector3(0.5, -0.5, 0.0),
          new Vector3(-0.5, -0.5, 0.0),
        ];
        const boundingBox = new Box2();
        points.forEach(point => {
          if (i === 0) ; else if (i === 1) {
            point.applyAxisAngle( new Vector3(0, 1, 0), Math.PI * 0.5 );
          } else if (i === 2) {
            point.applyAxisAngle( new Vector3(0, 1, 0), Math.PI );
          } else if (i === 3) {
            point.applyAxisAngle( new Vector3(0, 1, 0), -Math.PI * 0.5 );
          } else if (i === 4) {
            point.applyAxisAngle( new Vector3(1, 0, 0), -Math.PI * 0.5 );
          } else if (i === 5) {
            point.applyAxisAngle( new Vector3(1, 0, 0), Math.PI * 0.5 );
          }
          point.add( faceCentres2[i] );
          point.applyMatrix4( this.cubeContainer.matrixWorld );
          point.project( this.camera );
          point.x = (point.x + 1) * this.resRetina.x * 0.5;
          point.y = -(point.y - 1) * this.resRetina.y * 0.5;
          point.z = 0;
          boundingBox.expandByPoint( new Vector2(point.x, point.y) );
        });
        let faceOnScreen = boundingBox.intersectsBox( screenBox );
        if ( faceOnScreen === false ) {
          continue;
        }
      }

      facesVisible.push( i );
    }

    if ( this.cameraInsideCube.insideChanged ) {
      if (this.cameraInsideCube.inside) {
        this.contentConfigCurrent.forEach(config => {
          const cubeFaceIndex = config.cubeFaceIndices.find( cubeFaceIndex => cubeFaceIndex === this.cameraInsideCube.insideFaceIndex );
          if (cubeFaceIndex !== undefined) {
            this.contentConfigInside = config;

            this.cubeMask.cubeBackMaterial.color.r = this.contentConfigInside.colorMask.x;
            this.cubeMask.cubeBackMaterial.color.g = this.contentConfigInside.colorMask.y;
            this.cubeMask.cubeBackMaterial.color.b = this.contentConfigInside.colorMask.z;
          }
        });
      } else {
        // when stepping outside of the cube, if any faces are visible, they will continue to display the last content inside the cube.
        // this is to prevent a visual jolt when switching between cube face content and to maka a smoother experience.
        // face overrides temporarily remap the cube content and reset when the override face goes out of view.
        this.contentFaceOverrides = [];
        facesVisible.forEach(faceIndex => {
          this.contentFaceOverrides.push({
            faceIndex: faceIndex,
            contentID: this.contentConfigInside.contentID,
            colorMask: this.contentConfigInside.colorMask,
          });
        });

        this.contentConfigInside = null;
      }
    }

    for (let i = 0; i < this.contentFaceOverrides.length; i++) {
      const contentFaceOverride = this.contentFaceOverrides[i];
      const faceIndexMatch = facesVisible.find( faceIndex => faceIndex === contentFaceOverride.faceIndex );
      if ( faceIndexMatch === undefined ) { // once face is no longer visible, remove it from overrides.
        this.contentFaceOverrides.splice(i--, 1);
      }
    }

    const contentColorMasks = EJCube.getFaceColorMasks();
    this.contentConfigOriginal = [];
    if ( content.instance ) {
      if ( content.instance.contentPerCubeFace ) {
        const contentPerCubeFaceNew = content.instance.contentPerCubeFace();
        if ( contentPerCubeFaceNew ) {
          const contentIDs = [];
          contentIDs.push({
            contentID: contentPerCubeFaceNew.front ? contentPerCubeFaceNew.front : 0,
            cubeFaceIndex: 0,
          });
          contentIDs.push({
            contentID: contentPerCubeFaceNew.right ? contentPerCubeFaceNew.right : 0,
            cubeFaceIndex: 1,
          });
          contentIDs.push({
            contentID: contentPerCubeFaceNew.back ? contentPerCubeFaceNew.back : 0,
            cubeFaceIndex: 2,
          });
          contentIDs.push({
            contentID: contentPerCubeFaceNew.left ? contentPerCubeFaceNew.left : 0,
            cubeFaceIndex: 3,
          });
          contentIDs.push({
            contentID: contentPerCubeFaceNew.top ? contentPerCubeFaceNew.top : 0,
            cubeFaceIndex: 4,
          });
          contentIDs.push({
            contentID: contentPerCubeFaceNew.bottom ? contentPerCubeFaceNew.bottom : 0,
            cubeFaceIndex: 5,
          });
          while (contentIDs.length > 0) {
            const contentIDFirst = contentIDs.splice(0, 1)[0];
            const cubeFaceIndices = [contentIDFirst.cubeFaceIndex];
            for (let i = 0; i < contentIDs.length; i++) {
              const contentIDObj = contentIDs[i];
              if (contentIDObj.contentID === contentIDFirst.contentID) {
                const contentIDNext = contentIDs.splice(i--, 1)[0];
                cubeFaceIndices.push(contentIDNext.cubeFaceIndex);
              }
            }
            this.contentConfigOriginal.push({
              contentID: contentIDFirst.contentID,
              cubeFaceIndices: cubeFaceIndices,
              colorMask: contentColorMasks.splice(0, 1)[0],
            });
          }
        }
      }
    }
    if (this.contentConfigOriginal.length === 0) {
      this.contentConfigOriginal = [
        {
          contentID: 0,
          cubeFaceIndices: [0, 1, 2, 3, 4, 5],
          colorMask: contentColorMasks[0],
        },
      ];
    }

    this.contentConfigCurrent = [];
    this.contentConfigOriginal.forEach(config => {
      this.contentConfigCurrent.push({
        contentID: config.contentID,
        cubeFaceIndices: [...config.cubeFaceIndices],
        colorMask: new Vector3().copy(config.colorMask),
      });
    });
    this.contentFaceOverrides.forEach(contentFaceOverride => {
      this.contentConfigCurrent.forEach(config => {
        const i = config.cubeFaceIndices.findIndex( faceIndex => faceIndex === contentFaceOverride.faceIndex );
        if ( i !== -1 ) {
          config.cubeFaceIndices.splice(i, 1);
        }
      });
      const config = this.contentConfigCurrent.find( config => config.contentID === contentFaceOverride.contentID );
      if ( config !== undefined ) {
        config.cubeFaceIndices.push( contentFaceOverride.faceIndex );
      }
    });

    this.contentConfigCurrent.forEach(config => {
      config.cubeFaceIndices.forEach(cubeFaceIndex => {
        this.cubeMask.setFaceColorMask(cubeFaceIndex, config.colorMask);
      });
    });

    this.renderer.setRenderTarget(this.renderTargetMask);
    this.renderer.clear();
    this.cube.container.matrixWorld.decompose(
      this.cubeMaskScene.position,
      this.cubeMaskScene.quaternion,
      this.cubeMaskScene.scale
    );
    this.renderer.render(this.cubeMaskScene, this.camera);

    let contentToRender = [];
    if (this.contentConfigInside) {
      contentToRender = [this.contentConfigInside];
    } else {
      this.contentConfigCurrent.forEach(config => {
        let visible = false;
        config.cubeFaceIndices.forEach(cubeFaceIndex => {
          const faceIndex = facesVisible.find( faceIndex => faceIndex === cubeFaceIndex );
          if ( faceIndex !== undefined ) {
            visible = true;
          }
        });
        if (visible) {
          contentToRender.push(config);
        }
      });
    }

    if (content.instance.update) {
      content.instance.update();
    }

    for (let i = 0; i < contentToRender.length; i++) {
      const config = contentToRender[i];

      this.renderer.setRenderTarget(this.renderTargetContent);
      this.renderer.clear();

      content.instance.render( config.contentID );

      // when going through the front of the cube color mask, the near culling clips it and does not render the mask color.
      // to minimise this effect, the back of the cube color mask is also assigned the same color,
      // which minimised the flickering of content when transition between faces.
      if ( this.cameraInsideCube.inside === false ) {
        this.cubeMask.cubeBackMaterial.color.r = config.colorMask.x;
        this.cubeMask.cubeBackMaterial.color.g = config.colorMask.y;
        this.cubeMask.cubeBackMaterial.color.b = config.colorMask.z;
      }

      this.cubeMaskPass.material.uniforms.color.value = config.colorMask;
      this.cubeMaskPass.material.uniformsNeedUpdate = true;

      this.renderer.setRenderTarget(this.renderTargetContentMasked);
      if (i == 0) {
        this.renderer.clear();
      }
      this.renderer.render(this.cubeMaskPass, this.cubeMaskPassCamera);
    }

    // this.renderer.outputEncoding = sRGBEncoding;
    // this.renderer.toneMapping = NoToneMapping;
    // this.renderer.toneMappingExposure = 1;
    // this.renderer.useLegacyLights = false;

    this.renderer.setRenderTarget(renderTargetSaved);
    this.renderer.render(this.scene, this.camera);
  }

  dispose() {
    this.inputEventsKill();
  }

  // -------------------------------------------------------------- Resize
  resize( w = window.innerWidth, h = window.innerHeight, r = window.devicePixelRatio ) {
    const wr = w * r; // width retina.
    const hr = h * r; // height retina.
    if (this.res.x == w && this.res.y == h && this.resRetina.x == wr && this.resRetina.y == hr) {
      return; // this resolution has already been set.
    }

    this.res = new Vector2(w, h);
    this.resRetina = new Vector2(wr, hr);

    this.camera.aspect = this.res.x / this.res.y;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(this.res.x, this.res.y);
    this.renderer.setPixelRatio(r);

    this.renderTargets.forEach(renderTarget => {
      renderTarget.setSize(this.resRetina.x, this.resRetina.y);
    });

    const content = this.contentCurrent();
    if (content) {
      if (content.instance) {
        if (content.instance.resize) {
          content.instance.resize(this.resRetina.x, this.resRetina.y);
        }
      }
    }

    this.cubeUpdateProps();
  }

  resizeHandler() {
    if (this.resizeOverrideFunc !== null) {
      this.resizeOverrideFunc();
      return;
    }
    this.resize();
  }

  // -------------------------------------------------------------- Input Events
  inputEventsInit() {
    document.addEventListener( 'keydown', this.inputHandler.bind(this) );
    document.addEventListener( 'keyup', this.inputHandler.bind(this) );
    document.addEventListener( 'pointerdown', this.inputHandler.bind(this) );
    document.addEventListener( 'pointerup', this.inputHandler.bind(this) );
    document.addEventListener( 'pointermove', this.inputHandler.bind(this) );
  }

  inputEventsKill() {
    document.removeEventListener( 'keydown', this.inputHandler.bind(this) );
    document.removeEventListener( 'keyup', this.inputHandler.bind(this) );
    document.removeEventListener( 'pointerdown', this.inputHandler.bind(this) );
    document.removeEventListener( 'pointerup', this.inputHandler.bind(this) );
    document.removeEventListener( 'pointermove', this.inputHandler.bind(this) );
  }

  inputHandler( event ) {
    const content = this.contentCurrent();
    if (content && content.instance && content.instance[event.type]) {
      content.instance[event.type](event);
    }
  }

  // -------------------------------------------------------------- Environment
  envKill() {
    if (this.env == null) {
      return;
    }
    if (this.env.container.parent) {
      this.env.container.parent.remove(this.env.container);
    }
    this.env = null;
  }

  envCameraInit() {
    this.env = new EJEnvCamera(new Object3D(), this.camera, this.cameraTexture);
    this.scene.add(this.env.container);
  }

  envInit(envType) {
    this.envKill();

    if (envType == EJEnvTypeNone) {
      return;
    } else if (envType == EJEnvTypeImage) {
      this.env = new EJEnv(new Object3D(), this.camera);
    }
    this.scene.add(this.env.container);
  }

  envUpdate() {
    if (this.env) {
      this.env.update();
    }
  }

  // -------------------------------------------------------------- Cube
  cubeKill() {
    if (this.cube == null) {
      return;
    }
    this.cube.dispose();
    this.cube = null;
  }

  cubeInit(cubeStyle) {
    let validStyle = false;
    validStyle = validStyle || (cubeStyle === EJCubeStyleNone);
    validStyle = validStyle || (cubeStyle === EJCubeStylePlain);
    validStyle = validStyle || (cubeStyle === EJCubeStyleGlass);
    validStyle = validStyle || (cubeStyle === EJCubeStyleGlass3);
    if ( validStyle == false ) {
      return;
    }
    let sameStyle = true;
    sameStyle = sameStyle && (this.cube != null);
    sameStyle = sameStyle && (this.cube.style === cubeStyle);
    if ( sameStyle ) {
      return;
    }

    this.cubeKill();

    if (cubeStyle == EJCubeStyleNone) {
      return;
    } else if (cubeStyle == EJCubeStylePlain) {
      this.cube = new EJCube1(this.cubeContainer, this.config.gui);
    } else if (cubeStyle == EJCubeStyleGlass) {
      this.cube = new EJCube2(this.cubeContainer, this.config.gui);
    } else if (cubeStyle == EJCubeStyleGlass3) {
      this.cube = new EJCube3(this.cubeContainer, this.config.gui);
    }

    this.cubeUpdateProps();
  }

  cubeUpdate(camera) {
    if (this.cube == null) {
      return;
    }
    this.cube.update(camera);
  }

  cubeUpdateProps() {
    if (this.cube == null) {
      return;
    }

    let canGoInsideCube = false;
    const content = this.contentCurrent();
    if (content) {
      if (content.instance) {
        if (content.instance.canGoInsideCube) {
          canGoInsideCube = content.instance.canGoInsideCube();
        }
      }
    }

    this.cube.updateProps(this.renderTargetContentMasked.texture, this.resRetina, canGoInsideCube);
  }

  // -------------------------------------------------------------- Content
  contentCurrent() {
    if (this.contents.length == 0) {
      return null;
    }
    const content = this.contents[this.contents.length - 1];
    return content;
  }

  contentDispose(content) {
    if (content.instance) {
      if (content.instance.dispose) {
        content.instance.dispose();
      }
    }
    if (content.scene) {
      EJUtils.disposeRecursive(content.scene);
    }
    if (content.gui) {
      content.gui.destroy();
    }
  }

  contentInstantiate(module) {
    const content = this.contentCurrent();
    if (content == null) {
      return;
    }

    content.scene = new Scene();
    content.camera = this.camera;
    if (this.config.gui) {
      content.gui = this.config.gui.addFolder('Content Settings');
    }

    content.instance = module.main({
      canvas: this.canvas,
      renderer: this.renderer,
      renderTarget: this.renderTargetContent,
      scene: content.scene,
      camera: content.camera,
      gui: content.gui,
    });

    if ( content.instance && content.instance.cubeStyle ) {
      const cubeStyle = content.instance.cubeStyle();
      this.cubeInit( cubeStyle );
    }
  }

  contentKill(content) {
    this.contentDispose(content);
  }

  contentKillAll() {
    this.contents.forEach(content => {
      this.contentKill(content);
    });
    this.contents.splice(0, this.contents.length); // clear contents array.
  }

  contentValidate(_filename) {
    // TODO: do some checks on the file being loaded, like is it a JS file etc.
    return true;
  }

  // INFO: LK I've modified the implementation to support passing in the module directly.
  // I don't think the library should assume how the content will be loaded and this
  // will make everything more versatile.

  // -------------------------------------------------------------- API
  setContent({ filename, module }) {
    if (this.contentValidate(filename) == false) {
      return; // content file is not valid.
    }

    this.contentKillAll();

    const content = {
      filename: filename,
      identifier: filename.split('.js')[0] + '-script',
      module,
      instance: null,
      scene: null,
      gui: null,
    };
    this.contents.push(content);

    this.contentInstantiate(module);
  }

  setCube(value) {
    this.cubeInit(value);
  }

  setEnvironment(value) {
    this.envInit(value);
  }
}

/*
 * Copyright 2017 Google Inc. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the 'License');
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an 'AS IS' BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

// If including three.ar.js as a standalone script tag,
// we'll need to expose these objects directly by attaching
// them on the THREE global
if (typeof window !== 'undefined' ) {
  window.EJPlayer = EJPlayer;
}

export { EJPlayer };
