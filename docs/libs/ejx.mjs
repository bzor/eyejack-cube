import { Vector3, BufferGeometry, Float32BufferAttribute, Raycaster, Vector2, MathUtils, Mesh, BackSide, FrontSide, Color, RawShaderMaterial, Vector4, DoubleSide, sRGBEncoding, RepeatWrapping, NearestFilter, LinearEncoding, TextureLoader, BoxGeometry, MeshBasicMaterial, Object3D, PlaneGeometry, OrthographicCamera, ShaderMaterial, UniformsUtils, WebGLRenderTarget, Clock, AdditiveBlending, ColorManagement, Plane, WebGLRenderer, NoToneMapping, PerspectiveCamera, Scene, ClampToEdgeWrapping, LinearFilter, RGBAFormat, UnsignedByteType, Texture, Matrix4, Box2, Matrix3 } from 'three';
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

  updateMasterOpacity( value ) {
    // each cube must extend and handle this differently,
    // because opacity is usually a value in shader and all cubes
    // use different shaders.
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
      masterOpacity: { value: 1.0 },
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
      uniform float masterOpacity;
      
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
        colorFinal.a *= masterOpacity;

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
      masterOpacity: 1.0,
      borderOn: true,
      borderWidth: 0.01,
      borderFeather: 0.5,
      borderColor: new Color(0xffffff),
      borderAlpha: 1.0,
    };

    if (this.guiFolder) {
      this.guiFolder.add(this.config, 'masterOpacity', 0.0, 1.0).name('Master Opacity').onChange(value => {
        this.updateMasterOpacity( value );
      });
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

  updateMasterOpacity( value ) {
    this.materialBack.uniforms.masterOpacity.value = value;
    this.materialBack.uniformsNeedUpdate = true;
    this.materialFront.uniforms.masterOpacity.value = value;
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

class EJCubeMask {
  constructor(container) {
    this.container = container;

    this.cubeBackGeometry = new BoxGeometry(1, 1, 1);
    this.cubeBackMaterial = new MeshBasicMaterial({
      color: 0xff0000,
      side: BackSide,
      depthWrite: false,
      depthTest: false,
    });
    this.cubeBack = new Mesh(this.cubeBackGeometry, this.cubeBackMaterial);
    this.cubeBack.frustumCulled = false;
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
      cubeFace.frustumCulled = false;
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

    this.texture = new TextureLoader().load('./libs/ejx/assets/env/deathstar-bourgeois.jpg', this.textureLoaded.bind(this));
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

/**
 * Full-screen textured quad shader
 */

const CopyShader = {

  uniforms: {

    'tDiffuse': { value: null },
    'opacity': { value: 1.0 },

  },

  vertexShader: /* glsl */`

		varying vec2 vUv;

		void main() {

			vUv = uv;
			gl_Position = vec4( position, 1.0 );

		}`,

  fragmentShader: /* glsl */`

		uniform float opacity;

		uniform sampler2D tDiffuse;

		varying vec2 vUv;

		void main() {

			gl_FragColor = texture2D( tDiffuse, vUv );
			gl_FragColor.a *= opacity;


		}`,

};

class Pass {
  constructor() {
    // if set to true, the pass is processed by the composer
    this.enabled = true;

    // if set to true, the pass indicates to swap read and write buffer after rendering
    this.needsSwap = true;

    // if set to true, the pass clears its buffer before rendering
    this.clear = false;

    // if set to true, the result of the pass is rendered to screen. This is set automatically by EffectComposer.
    this.renderToScreen = false;
  }

  setSize( /* width, height */ ) {}

  render( /* renderer, writeBuffer, readBuffer, deltaTime, maskActive */ ) {
    console.error( 'THREE.Pass: .render() must be implemented in derived pass.' );
  }

  dispose() {}
}

// Helper for passes that need to fill the viewport with a single quad.

const _camera = new OrthographicCamera( - 1, 1, 1, - 1, 0, 1 );

// https://github.com/mrdoob/three.js/pull/21358

const _geometry = new BufferGeometry();
_geometry.setAttribute( 'position', new Float32BufferAttribute( [- 1, 3, 0, - 1, - 1, 0, 3, - 1, 0], 3 ) );
_geometry.setAttribute( 'uv', new Float32BufferAttribute( [0, 2, 0, 0, 2, 0], 2 ) );

class FullScreenQuad {
  constructor( material ) {
    this._mesh = new Mesh( _geometry, material );
    this._mesh.frustumCulled = false;
  }

  dispose() {
    this._mesh.geometry.dispose();
  }

  render( renderer ) {
    renderer.render( this._mesh, _camera );
  }

  get material() {
    return this._mesh.material;
  }

  set material( value ) {
    this._mesh.material = value;
  }
}

class ShaderPass extends Pass {
  constructor( shader, textureID ) {
    super();

    this.textureID = ( textureID !== undefined ) ? textureID : 'tDiffuse';

    if ( shader instanceof ShaderMaterial ) {
      this.uniforms = shader.uniforms;

      this.material = shader;
    } else if ( shader ) {
      this.uniforms = UniformsUtils.clone( shader.uniforms );

      this.material = new ShaderMaterial( {

        defines: Object.assign( {}, shader.defines ),
        uniforms: this.uniforms,
        vertexShader: shader.vertexShader,
        fragmentShader: shader.fragmentShader,

      } );
    }

    this.fsQuad = new FullScreenQuad( this.material );
  }

  render( renderer, writeBuffer, readBuffer /* , deltaTime, maskActive */ ) {
    if ( this.uniforms[this.textureID] ) {
      this.uniforms[this.textureID].value = readBuffer.texture;
    }

    this.fsQuad.material = this.material;

    if ( this.renderToScreen ) {
      renderer.setRenderTarget( null );
      this.fsQuad.render( renderer );
    } else {
      renderer.setRenderTarget( writeBuffer );
      // TODO: Avoid using autoClear properties, see https://github.com/mrdoob/three.js/pull/15571#issuecomment-465669600
      if ( this.clear ) renderer.clear( renderer.autoClearColor, renderer.autoClearDepth, renderer.autoClearStencil );
      this.fsQuad.render( renderer );
    }
  }

  dispose() {
    this.material.dispose();

    this.fsQuad.dispose();
  }
}

class MaskPass extends Pass {

	constructor( scene, camera ) {

		super();

		this.scene = scene;
		this.camera = camera;

		this.clear = true;
		this.needsSwap = false;

		this.inverse = false;

	}

	render( renderer, writeBuffer, readBuffer /*, deltaTime, maskActive */ ) {

		const context = renderer.getContext();
		const state = renderer.state;

		// don't update color or depth

		state.buffers.color.setMask( false );
		state.buffers.depth.setMask( false );

		// lock buffers

		state.buffers.color.setLocked( true );
		state.buffers.depth.setLocked( true );

		// set up stencil

		let writeValue, clearValue;

		if ( this.inverse ) {

			writeValue = 0;
			clearValue = 1;

		} else {

			writeValue = 1;
			clearValue = 0;

		}

		state.buffers.stencil.setTest( true );
		state.buffers.stencil.setOp( context.REPLACE, context.REPLACE, context.REPLACE );
		state.buffers.stencil.setFunc( context.ALWAYS, writeValue, 0xffffffff );
		state.buffers.stencil.setClear( clearValue );
		state.buffers.stencil.setLocked( true );

		// draw into the stencil buffer

		renderer.setRenderTarget( readBuffer );
		if ( this.clear ) renderer.clear();
		renderer.render( this.scene, this.camera );

		renderer.setRenderTarget( writeBuffer );
		if ( this.clear ) renderer.clear();
		renderer.render( this.scene, this.camera );

		// unlock color and depth buffer for subsequent rendering

		state.buffers.color.setLocked( false );
		state.buffers.depth.setLocked( false );

		// only render where stencil is set to 1

		state.buffers.stencil.setLocked( false );
		state.buffers.stencil.setFunc( context.EQUAL, 1, 0xffffffff ); // draw if == 1
		state.buffers.stencil.setOp( context.KEEP, context.KEEP, context.KEEP );
		state.buffers.stencil.setLocked( true );

	}

}

class ClearMaskPass extends Pass {

	constructor() {

		super();

		this.needsSwap = false;

	}

	render( renderer /*, writeBuffer, readBuffer, deltaTime, maskActive */ ) {

		renderer.state.buffers.stencil.setLocked( false );
		renderer.state.buffers.stencil.setTest( false );

	}

}

class EffectComposer {
  constructor( renderer, renderTarget ) {
    this.renderer = renderer;

    if ( renderTarget === undefined ) {
      const size = renderer.getSize( new Vector2() );
      this._pixelRatio = renderer.getPixelRatio();
      this._width = size.width;
      this._height = size.height;

      renderTarget = new WebGLRenderTarget( this._width * this._pixelRatio, this._height * this._pixelRatio );
      renderTarget.texture.name = 'EffectComposer.rt1';
    } else {
      this._pixelRatio = 1;
      this._width = renderTarget.width;
      this._height = renderTarget.height;
    }

    this.renderTarget1 = renderTarget;
    this.renderTarget2 = renderTarget.clone();
    this.renderTarget2.texture.name = 'EffectComposer.rt2';

    this.writeBuffer = this.renderTarget1;
    this.readBuffer = this.renderTarget2;

    this.renderToScreen = true;

    this.passes = [];

    this.copyPass = new ShaderPass( CopyShader );

    this.clock = new Clock();
  }

  swapBuffers() {
    const tmp = this.readBuffer;
    this.readBuffer = this.writeBuffer;
    this.writeBuffer = tmp;
  }

  addPass( pass ) {
    this.passes.push( pass );
    pass.setSize( this._width * this._pixelRatio, this._height * this._pixelRatio );
  }

  insertPass( pass, index ) {
    this.passes.splice( index, 0, pass );
    pass.setSize( this._width * this._pixelRatio, this._height * this._pixelRatio );
  }

  removePass( pass ) {
    const index = this.passes.indexOf( pass );

    if ( index !== - 1 ) {
      this.passes.splice( index, 1 );
    }
  }

  isLastEnabledPass( passIndex ) {
    for ( let i = passIndex + 1; i < this.passes.length; i ++ ) {
      if ( this.passes[i].enabled ) {
        return false;
      }
    }

    return true;
  }

  render( deltaTime ) {
    // deltaTime value is in seconds

    if ( deltaTime === undefined ) {
      deltaTime = this.clock.getDelta();
    }

    const currentRenderTarget = this.renderer.getRenderTarget();

    let maskActive = false;

    for ( let i = 0, il = this.passes.length; i < il; i ++ ) {
      const pass = this.passes[i];

      if ( pass.enabled === false ) continue;

      pass.renderToScreen = ( this.renderToScreen && this.isLastEnabledPass( i ) );
      pass.render( this.renderer, this.writeBuffer, this.readBuffer, deltaTime, maskActive );

      if ( pass.needsSwap ) {
        if ( maskActive ) {
          const context = this.renderer.getContext();
          const stencil = this.renderer.state.buffers.stencil;

          // context.stencilFunc( context.NOTEQUAL, 1, 0xffffffff );
          stencil.setFunc( context.NOTEQUAL, 1, 0xffffffff );

          this.copyPass.render( this.renderer, this.writeBuffer, this.readBuffer, deltaTime );

          // context.stencilFunc( context.EQUAL, 1, 0xffffffff );
          stencil.setFunc( context.EQUAL, 1, 0xffffffff );
        }

        this.swapBuffers();
      }

      if ( MaskPass !== undefined ) {
        if ( pass instanceof MaskPass ) {
          maskActive = true;
        } else if ( pass instanceof ClearMaskPass ) {
          maskActive = false;
        }
      }
    }

    this.renderer.setRenderTarget( currentRenderTarget );
  }

  reset( renderTarget ) {
    if ( renderTarget === undefined ) {
      const size = this.renderer.getSize( new Vector2() );
      this._pixelRatio = this.renderer.getPixelRatio();
      this._width = size.width;
      this._height = size.height;

      renderTarget = this.renderTarget1.clone();
      renderTarget.setSize( this._width * this._pixelRatio, this._height * this._pixelRatio );
    }

    this.renderTarget1.dispose();
    this.renderTarget2.dispose();
    this.renderTarget1 = renderTarget;
    this.renderTarget2 = renderTarget.clone();

    this.writeBuffer = this.renderTarget1;
    this.readBuffer = this.renderTarget2;
  }

  setSize( width, height ) {
    this._width = width;
    this._height = height;

    const effectiveWidth = this._width * this._pixelRatio;
    const effectiveHeight = this._height * this._pixelRatio;

    this.renderTarget1.setSize( effectiveWidth, effectiveHeight );
    this.renderTarget2.setSize( effectiveWidth, effectiveHeight );

    for ( let i = 0; i < this.passes.length; i ++ ) {
      this.passes[i].setSize( effectiveWidth, effectiveHeight );
    }
  }

  setPixelRatio( pixelRatio ) {
    this._pixelRatio = pixelRatio;

    this.setSize( this._width, this._height );
  }

  dispose() {
    this.renderTarget1.dispose();
    this.renderTarget2.dispose();

    this.copyPass.dispose();
  }
}

/**
 * Luminosity
 * http://en.wikipedia.org/wiki/Luminosity
 */

const LuminosityHighPassShader = {

  shaderID: 'luminosityHighPass',

  uniforms: {

    'tDiffuse': { value: null },
    'luminosityThreshold': { value: 1.0 },
    'smoothWidth': { value: 1.0 },
    'defaultColor': { value: new Color( 0x000000 ) },
    'defaultOpacity': { value: 0.0 },

  },

  vertexShader: /* glsl */`

		varying vec2 vUv;

		void main() {

			vUv = uv;

			gl_Position = vec4( position, 1.0 );

		}`,

  fragmentShader: /* glsl */`

		uniform sampler2D tDiffuse;
		uniform vec3 defaultColor;
		uniform float defaultOpacity;
		uniform float luminosityThreshold;
		uniform float smoothWidth;

		varying vec2 vUv;

		void main() {

			vec4 texel = texture2D( tDiffuse, vUv );

			vec3 luma = vec3( 0.299, 0.587, 0.114 );

			float v = dot( texel.xyz, luma );

			vec4 outputColor = vec4( defaultColor.rgb, defaultOpacity );

			float alpha = smoothstep( luminosityThreshold, luminosityThreshold + smoothWidth, v );

			gl_FragColor = mix( outputColor, texel, alpha );

		}`,

};

/**
 * UnrealBloomPass is inspired by the bloom pass of Unreal Engine. It creates a
 * mip map chain of bloom textures and blurs them with different radii. Because
 * of the weighted combination of mips, and because larger blurs are done on
 * higher mips, this effect provides good quality and performance.
 *
 * Reference:
 * - https://docs.unrealengine.com/latest/INT/Engine/Rendering/PostProcessEffects/Bloom/
 */
class UnrealBloomPass extends Pass {
  constructor( resolution, strength, radius, threshold ) {
    super();

    this.strength = ( strength !== undefined ) ? strength : 1;
    this.radius = radius;
    this.threshold = threshold;
    this.resolution = ( resolution !== undefined ) ? new Vector2( resolution.x, resolution.y ) : new Vector2( 256, 256 );

    // create color only once here, reuse it later inside the render function
    this.clearColor = new Color( 0, 0, 0 );

    // render targets
    this.renderTargetsHorizontal = [];
    this.renderTargetsVertical = [];
    this.nMips = 5;
    let resx = Math.round( this.resolution.x / 2 );
    let resy = Math.round( this.resolution.y / 2 );

    this.renderTargetBright = new WebGLRenderTarget( resx, resy );
    this.renderTargetBright.texture.name = 'UnrealBloomPass.bright';
    this.renderTargetBright.texture.generateMipmaps = false;

    for ( let i = 0; i < this.nMips; i ++ ) {
      const renderTargetHorizonal = new WebGLRenderTarget( resx, resy );

      renderTargetHorizonal.texture.name = 'UnrealBloomPass.h' + i;
      renderTargetHorizonal.texture.generateMipmaps = false;

      this.renderTargetsHorizontal.push( renderTargetHorizonal );

      const renderTargetVertical = new WebGLRenderTarget( resx, resy );

      renderTargetVertical.texture.name = 'UnrealBloomPass.v' + i;
      renderTargetVertical.texture.generateMipmaps = false;

      this.renderTargetsVertical.push( renderTargetVertical );

      resx = Math.round( resx / 2 );

      resy = Math.round( resy / 2 );
    }

    // luminosity high pass material

    if ( LuminosityHighPassShader === undefined ) {
      console.error( 'THREE.UnrealBloomPass relies on LuminosityHighPassShader' );
    }

    const highPassShader = LuminosityHighPassShader;
    this.highPassUniforms = UniformsUtils.clone( highPassShader.uniforms );

    this.highPassUniforms['luminosityThreshold'].value = threshold;
    this.highPassUniforms['smoothWidth'].value = 0.01;

    this.materialHighPassFilter = new ShaderMaterial( {
      uniforms: this.highPassUniforms,
      vertexShader: highPassShader.vertexShader,
      fragmentShader: highPassShader.fragmentShader,
      defines: {},
    } );

    // Gaussian Blur Materials
    this.separableBlurMaterials = [];
    const kernelSizeArray = [3, 5, 7, 9, 11];
    resx = Math.round( this.resolution.x / 2 );
    resy = Math.round( this.resolution.y / 2 );

    for ( let i = 0; i < this.nMips; i ++ ) {
      this.separableBlurMaterials.push( this.getSeperableBlurMaterial( kernelSizeArray[i] ) );

      this.separableBlurMaterials[i].uniforms['texSize'].value = new Vector2( resx, resy );

      resx = Math.round( resx / 2 );

      resy = Math.round( resy / 2 );
    }

    // Composite material
    this.compositeMaterial = this.getCompositeMaterial( this.nMips );
    this.compositeMaterial.uniforms['blurTexture1'].value = this.renderTargetsVertical[0].texture;
    this.compositeMaterial.uniforms['blurTexture2'].value = this.renderTargetsVertical[1].texture;
    this.compositeMaterial.uniforms['blurTexture3'].value = this.renderTargetsVertical[2].texture;
    this.compositeMaterial.uniforms['blurTexture4'].value = this.renderTargetsVertical[3].texture;
    this.compositeMaterial.uniforms['blurTexture5'].value = this.renderTargetsVertical[4].texture;
    this.compositeMaterial.uniforms['bloomStrength'].value = strength;
    this.compositeMaterial.uniforms['bloomRadius'].value = 0.1;
    this.compositeMaterial.needsUpdate = true;

    const bloomFactors = [1.0, 0.8, 0.6, 0.4, 0.2];
    this.compositeMaterial.uniforms['bloomFactors'].value = bloomFactors;
    this.bloomTintColors = [new Vector3( 1, 1, 1 ), new Vector3( 1, 1, 1 ), new Vector3( 1, 1, 1 ), new Vector3( 1, 1, 1 ), new Vector3( 1, 1, 1 )];
    this.compositeMaterial.uniforms['bloomTintColors'].value = this.bloomTintColors;

    // copy material
    if ( CopyShader === undefined ) {
      console.error( 'THREE.UnrealBloomPass relies on CopyShader' );
    }

    const copyShader = CopyShader;

    this.copyUniforms = UniformsUtils.clone( copyShader.uniforms );
    this.copyUniforms['opacity'].value = 1.0;

    this.materialCopy = new ShaderMaterial( {
      uniforms: this.copyUniforms,
      vertexShader: copyShader.vertexShader,
      fragmentShader: copyShader.fragmentShader,
      blending: AdditiveBlending,
      depthTest: false,
      depthWrite: false,
      transparent: true,
    } );

    this.enabled = true;
    this.needsSwap = false;

    this._oldClearColor = new Color();
    this.oldClearAlpha = 1;

    this.basic = new MeshBasicMaterial( { transparent: true } );

    this.fsQuad = new FullScreenQuad( null );
  }

  dispose() {
    for ( let i = 0; i < this.renderTargetsHorizontal.length; i ++ ) {
      this.renderTargetsHorizontal[i].dispose();
    }

    for ( let i = 0; i < this.renderTargetsVertical.length; i ++ ) {
      this.renderTargetsVertical[i].dispose();
    }

    this.renderTargetBright.dispose();
  }

  setSize( width, height ) {
    let resx = Math.round( width / 2 );
    let resy = Math.round( height / 2 );

    this.renderTargetBright.setSize( resx, resy );

    for ( let i = 0; i < this.nMips; i ++ ) {
      this.renderTargetsHorizontal[i].setSize( resx, resy );
      this.renderTargetsVertical[i].setSize( resx, resy );

      this.separableBlurMaterials[i].uniforms['texSize'].value = new Vector2( resx, resy );

      resx = Math.round( resx / 2 );
      resy = Math.round( resy / 2 );
    }
  }

  render( renderer, writeBuffer, readBuffer, deltaTime, maskActive ) {
    renderer.getClearColor( this._oldClearColor );
    this.oldClearAlpha = renderer.getClearAlpha();
    const oldAutoClear = renderer.autoClear;
    renderer.autoClear = false;

    renderer.setClearColor( this.clearColor, 0 );

    if ( maskActive ) renderer.state.buffers.stencil.setTest( false );

    // Render input to screen

    if ( this.renderToScreen ) {
      this.fsQuad.material = this.basic;
      this.basic.map = readBuffer.texture;

      renderer.setRenderTarget( null );
      renderer.clear();
      this.fsQuad.render( renderer );
    }

    // 1. Extract Bright Areas

    this.highPassUniforms['tDiffuse'].value = readBuffer.texture;
    this.highPassUniforms['luminosityThreshold'].value = this.threshold;
    this.fsQuad.material = this.materialHighPassFilter;

    renderer.setRenderTarget( this.renderTargetBright );
    renderer.clear();
    this.fsQuad.render( renderer );

    // 2. Blur All the mips progressively

    let inputRenderTarget = this.renderTargetBright;

    for ( let i = 0; i < this.nMips; i ++ ) {
      this.fsQuad.material = this.separableBlurMaterials[i];

      this.separableBlurMaterials[i].uniforms['colorTexture'].value = inputRenderTarget.texture;
      this.separableBlurMaterials[i].uniforms['direction'].value = UnrealBloomPass.BlurDirectionX;
      renderer.setRenderTarget( this.renderTargetsHorizontal[i] );
      renderer.clear();
      this.fsQuad.render( renderer );

      this.separableBlurMaterials[i].uniforms['colorTexture'].value = this.renderTargetsHorizontal[i].texture;
      this.separableBlurMaterials[i].uniforms['direction'].value = UnrealBloomPass.BlurDirectionY;
      renderer.setRenderTarget( this.renderTargetsVertical[i] );
      renderer.clear();
      this.fsQuad.render( renderer );

      inputRenderTarget = this.renderTargetsVertical[i];
    }

    // Composite All the mips

    this.fsQuad.material = this.compositeMaterial;
    this.compositeMaterial.uniforms['bloomStrength'].value = this.strength;
    this.compositeMaterial.uniforms['bloomRadius'].value = this.radius;
    this.compositeMaterial.uniforms['bloomTintColors'].value = this.bloomTintColors;

    renderer.setRenderTarget( this.renderTargetsHorizontal[0] );
    renderer.clear();
    this.fsQuad.render( renderer );

    // Blend it additively over the input texture

    this.fsQuad.material = this.materialCopy;
    this.copyUniforms['tDiffuse'].value = this.renderTargetsHorizontal[0].texture;

    if ( maskActive ) renderer.state.buffers.stencil.setTest( true );

    if ( this.renderToScreen ) {
      renderer.setRenderTarget( null );
      this.fsQuad.render( renderer );
    } else {
      renderer.setRenderTarget( readBuffer );
      this.fsQuad.render( renderer );
    }

    // Restore renderer settings

    renderer.setClearColor( this._oldClearColor, this.oldClearAlpha );
    renderer.autoClear = oldAutoClear;
  }

  getSeperableBlurMaterial( kernelRadius ) {
    return new ShaderMaterial( {

      defines: {
        'KERNEL_RADIUS': kernelRadius,
        'SIGMA': kernelRadius,
      },

      uniforms: {
        'colorTexture': { value: null },
        'texSize': { value: new Vector2( 0.5, 0.5 ) },
        'direction': { value: new Vector2( 0.5, 0.5 ) },
      },

      vertexShader:
				`varying vec2 vUv;
				void main() {
					vUv = uv;
					gl_Position = vec4( position, 1.0 );
				}`,

      fragmentShader:
				`#include <common>
				varying vec2 vUv;
				uniform sampler2D colorTexture;
				uniform vec2 texSize;
				uniform vec2 direction;

				float gaussianPdf(in float x, in float sigma) {
					return 0.39894 * exp( -0.5 * x * x/( sigma * sigma))/sigma;
				}
				void main() {
					vec2 invSize = 1.0 / texSize;
					float fSigma = float(SIGMA);
					float weightSum = gaussianPdf(0.0, fSigma);
					vec4 diffuseSum = texture2D( colorTexture, vUv) * weightSum;
					for( int i = 1; i < KERNEL_RADIUS; i ++ ) {
						float x = float(i);
						float w = gaussianPdf(x, fSigma);
						vec2 uvOffset = direction * invSize * x;
						vec4 sample1 = texture2D( colorTexture, vUv + uvOffset);
						vec4 sample2 = texture2D( colorTexture, vUv - uvOffset);
						diffuseSum += (sample1 + sample2) * w;
						weightSum += 2.0 * w;
					}
					gl_FragColor = vec4(diffuseSum/weightSum);
				}`,
    } );
  }

  getCompositeMaterial( nMips ) {
    return new ShaderMaterial( {

      defines: {
        'NUM_MIPS': nMips,
      },

      uniforms: {
        'blurTexture1': { value: null },
        'blurTexture2': { value: null },
        'blurTexture3': { value: null },
        'blurTexture4': { value: null },
        'blurTexture5': { value: null },
        'dirtTexture': { value: null },
        'bloomStrength': { value: 1.0 },
        'bloomFactors': { value: null },
        'bloomTintColors': { value: null },
        'bloomRadius': { value: 0.0 },
      },

      vertexShader:
				`varying vec2 vUv;
				void main() {
					vUv = uv;
					gl_Position = vec4( position, 1.0 );
				}`,

      fragmentShader:
				`varying vec2 vUv;
				uniform sampler2D blurTexture1;
				uniform sampler2D blurTexture2;
				uniform sampler2D blurTexture3;
				uniform sampler2D blurTexture4;
				uniform sampler2D blurTexture5;
				uniform sampler2D dirtTexture;
				uniform float bloomStrength;
				uniform float bloomRadius;
				uniform float bloomFactors[NUM_MIPS];
				uniform vec3 bloomTintColors[NUM_MIPS];

				float lerpBloomFactor(const in float factor) {
					float mirrorFactor = 1.2 - factor;
					return mix(factor, mirrorFactor, bloomRadius);
				}

				void main() {
					gl_FragColor = bloomStrength * ( lerpBloomFactor(bloomFactors[0]) * vec4(bloomTintColors[0], 1.0) * texture2D(blurTexture1, vUv) +
						lerpBloomFactor(bloomFactors[1]) * vec4(bloomTintColors[1], 1.0) * texture2D(blurTexture2, vUv) +
						lerpBloomFactor(bloomFactors[2]) * vec4(bloomTintColors[2], 1.0) * texture2D(blurTexture3, vUv) +
						lerpBloomFactor(bloomFactors[3]) * vec4(bloomTintColors[3], 1.0) * texture2D(blurTexture4, vUv) +
						lerpBloomFactor(bloomFactors[4]) * vec4(bloomTintColors[4], 1.0) * texture2D(blurTexture5, vUv) );
				}`,
    } );
  }
}

UnrealBloomPass.BlurDirectionX = new Vector2( 1.0, 0.0 );
UnrealBloomPass.BlurDirectionY = new Vector2( 0.0, 1.0 );

class EJPostProcessing {
  constructor( config, renderer, renderTarget, gui = null ) {
    this.gui = gui;
    if (config.type === 'bloom') {
      this.initBloom( config, renderer, renderTarget, gui );
    }
  }

  initBloom( config, renderer, renderTarget, gui ) {
    const composer = new EffectComposer(renderer, renderTarget);
    composer.renderToScreen = false;
    composer.swapBuffers();

    const bloomPass = new UnrealBloomPass(
      new THREE.Vector2( renderTarget.width, renderTarget.height ),
      config.bloomStrength,
      config.bloomRadius,
      config.bloomThreshold
    );
    bloomPass.needsSwap = false;
    composer.addPass( bloomPass );

    const copyPass = new ShaderPass( CopyShader );
    copyPass.needsSwap = false;
    composer.addPass( copyPass );

    if ( gui ) {
      gui.add( config, 'exposure', 0.1, config.exposure ).onChange( function( value ) {
        renderer.toneMappingExposure = Math.pow( value, 4.0 );
      });
      gui.add( config, 'bloomThreshold', 0.0, 1.0 ).onChange( function( value ) {
        bloomPass.threshold = Number( value );
      });
      gui.add( config, 'bloomStrength', 0.0, 5.0 ).onChange( function( value ) {
        bloomPass.strength = Number( value );
      });
      gui.add( config, 'bloomRadius', 0.0, 2.0 ).step( 0.01 ).onChange( function( value ) {
        bloomPass.radius = Number( value );
      });
    }

    this.renderer = renderer;
    this.composer = composer;
  }

  render() {
    this.renderer.xr.enabled = false;
    this.composer.render();
    this.renderer.xr.enabled = true;
  }

  resize(width, height) {
    this.composer.setSize( width, height );
  }

  dispose() {
    this.composer.renderTarget2.dispose();
    this.composer.copyPass.dispose();
    this.composer.passes.forEach(pass => {
      pass.dispose();
    });
    if ( this.gui ) {
      this.gui.destroy();
    }
  }
}

/* eslint-disable max-len */

// ---------------------------------------------------------------- Color Management
ColorManagement.enabled = true;

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

    this.saveImageFlag = false;

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

    if (!canvas) document.body.appendChild(this.renderer.domElement);

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

    this.cubeMasterOpacity = 1.0;
    this.cubeMasterOpacitySaved = 1.0;

    this.cubeContainer = new Object3D();
    this.scene.add( this.cubeContainer );

    this.cubeMask = new EJCubeMask(new Object3D(), null);
    this.cubeMaskScene = new Scene();
    this.cubeMaskScene.add( this.cubeMask.container );
    this.cubeMaskPass = this.initMaskPass();
    this.cubeMaskPassCamera = new OrthographicCamera( - 1, 1, 1, - 1, 0, 1 );

    this.loadingManager = new THREE.LoadingManager();

    this.postProcessing = null;
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
    } else {
      this.renderer.render(this.scene, this.camera);
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

    let postProcessingInit = true;
    postProcessingInit = postProcessingInit && !this.postProcessing;
    postProcessingInit = postProcessingInit && content.instance.postProcessing;
    if ( postProcessingInit ) {
      const postProcessingConfig = content.instance.postProcessing();
      if ( postProcessingConfig ) {
        let postProcessingGui = null;
        if (this.config.gui) {
          postProcessingGui = this.config.gui.addFolder('Post Processing');
        }
        this.postProcessing = new EJPostProcessing(
          postProcessingConfig,
          this.renderer,
          this.renderTargetContent,
          postProcessingGui
        );
      }
    }

    if (!this.cube) {
      this.renderer.render(this.scene, this.camera);
      if (content.instance.update) content.instance.update();
      content.instance.render();
      return;
    }

    const renderTargetSaved = this.renderer.getRenderTarget();
    if (renderTargetSaved && this.renderer.xr.isPresenting) {
      this.resize(renderTargetSaved.width, renderTargetSaved.height, window.devicePixelRatio, true);
    }

    this.camera.updateMatrixWorld();
    content.camera.copy(this.camera);

    content.scene.position.copy( this.cubeContainer.position );
    content.scene.quaternion.copy( this.cubeContainer.quaternion );
    content.scene.scale.copy( this.cubeContainer.scale );

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
    this.cubeContainer.matrixWorld.decompose(
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

      if ( this.postProcessing ) {
        this.postProcessing.render();
      }

      // when going through the front of the cube color mask, the near culling clips it and does not render the mask color.
      // to minimise this effect, the back of the cube color mask is also assigned the same color,
      // which minimised the flickering of content when transition between faces.
      if ( this.cameraInsideCube.inside === false ) {
        this.cubeMask.cubeBackMaterial.color.setRGB( config.colorMask.x, config.colorMask.y, config.colorMask.z );
      }

      this.cubeMaskPass.material.uniforms.color.value = config.colorMask;
      this.cubeMaskPass.material.uniformsNeedUpdate = true;

      this.renderer.setRenderTarget(this.renderTargetContentMasked);
      if (i == 0) {
        this.renderer.clear();
      }
      const currentValue = this.renderer.xr.enabled;
      this.renderer.xr.enabled = false;
      this.renderer.render(this.cubeMaskPass, this.cubeMaskPassCamera);
      this.renderer.xr.enabled = currentValue;
    }

    // this.renderer.outputEncoding = sRGBEncoding;
    // this.renderer.toneMapping = NoToneMapping;
    // this.renderer.toneMappingExposure = 1;
    // this.renderer.useLegacyLights = false;

    if ( this.saveImageFlag ) {
      this.saveImageFlag = false;
      this.renderExterior();
    }

    this.renderer.setRenderTarget(renderTargetSaved);
    this.renderer.render(this.scene, this.camera);
  }

  renderExterior() {
    const content = this.contentCurrent();
    const contentCanRender = content && content.instance && content.instance.render;
    if (!contentCanRender) {
      return;
    }

    const res = this.res.clone();
    const retina = this.resRetina.x / this.res.x;
    const size = 512;
    this.resize( size, size, 1 );

    const renderTargetFace = this.renderTargetContent.clone();
    renderTargetFace.texture.name = 'EJ.renderTargetFace';
    renderTargetFace.texture.encoding = LinearEncoding;

    this.cubeContainer.matrix.identity(); // reset content scene to zero centre.
    this.cubeContainer.matrix.decompose(
      this.cubeContainer.position,
      this.cubeContainer.quaternion,
      this.cubeContainer.scale
    );
    this.cubeContainer.matrixWorld.decompose(
      this.cubeMaskScene.position,
      this.cubeMaskScene.quaternion,
      this.cubeMaskScene.scale
    );
    this.cubeContainer.matrix.decompose(
      content.scene.position,
      content.scene.quaternion,
      content.scene.scale
    );

    const cameraToRestore = this.camera.clone();
    const camera = this.camera.clone();

    let contentPerCubeFace = {};
    if ( content.instance.contentPerCubeFace ) {
      contentPerCubeFace = content.instance.contentPerCubeFace();
    }

    const faceNames = EJCube.getFaceDescriptors();
    const faceNormals = EJCube.getFaceNormals();
    const faceColorMasks = EJCube.getFaceColorMasks();
    const faceFilenames = ['pz', 'px', 'nz', 'nx', 'py', 'ny'];

    for (let i = 0; i < faceNames.length; i++) {
      const cameraDistance = 0.5 / Math.tan(camera.fov * 0.5 * (Math.PI / 180)) + 0.5;
      const cameraPosition = faceNormals[i];
      cameraPosition.multiplyScalar( cameraDistance );
      camera.position.copy( cameraPosition );
      camera.lookAt(0, 0, 0);

      this.camera.copy(camera);
      content.camera.copy(camera);

      const colorMask = faceColorMasks[i];
      this.cubeMask.setFaceColorMask(i, colorMask);
      this.cubeMask.cubeBackMaterial.color.setRGB( colorMask.x, colorMask.y, colorMask.z );
      this.cubeMaskPass.material.uniforms.color.value = colorMask;
      this.cubeMaskPass.material.uniformsNeedUpdate = true;

      this.renderer.setRenderTarget(this.renderTargetMask);
      this.renderer.clear();
      this.renderer.render(this.cubeMaskScene, camera);

      this.renderer.setRenderTarget(this.renderTargetContent);
      this.renderer.clear();

      const faceName = faceNames[i];
      let contentID = 0;
      if ( contentPerCubeFace[faceName] ) {
        contentID = contentPerCubeFace[faceName];
      }
      content.instance.render( contentID );

      this.renderer.setRenderTarget(this.renderTargetContentMasked);
      this.renderer.clear();
      this.renderer.render(this.cubeMaskPass, this.cubeMaskPassCamera);

      this.renderer.setRenderTarget(renderTargetFace);
      this.renderer.clear();
      this.renderer.render(this.cubeContainer, camera);

      const pixels = new Uint8Array( size * size * 4 );
      const pixelsFlipped = new Uint8Array( size * size * 4 );

      this.renderer.readRenderTargetPixels(renderTargetFace, 0, 0, size, size, pixels);

      for ( let y = 0; y < size; y ++ ) {
        const srcOffset = y * size * 4;
        const dstOffset = ( size - y - 1 ) * size * 4;
        pixelsFlipped.set( pixels.subarray( srcOffset, srcOffset + size * 4 ), dstOffset );
      }

      const filename = faceFilenames[i] + '.png';
      this.saveImage( pixelsFlipped, size, size, filename );
    }

    renderTargetFace.dispose();

    content.camera.copy(cameraToRestore); // restore camera
    this.resize( res.x, res.y, retina ); // restore size.
  }

  dispose() {
    this.inputEventsKill();
  }

  // -------------------------------------------------------------- save image.
  requestSaveImage() {
    this.saveImageFlag = true;
  }

  saveImage(pixels, w, h, filename) {
    const canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d');

    const imageData = ctx.createImageData(w, h);
    imageData.data.set(pixels);

    ctx.putImageData(imageData, 0, 0);
    canvas.toBlob(blob => {
      this.downloadImage(blob, filename);
    }, 'image/png');
  }

  downloadImage(blob, filename) {
    let link = document.createElement('a');
    document.body.appendChild(link); // Firefox requires the link to be in the body
    link.download = filename;
    link.href = URL.createObjectURL(blob);
    link.click();
    document.body.removeChild(link); // remove the link when done
  }

  // -------------------------------------------------------------- Resize
  resize( w = window.innerWidth, h = window.innerHeight, r = window.devicePixelRatio, forVR = false ) {
    const wr = w * r; // width retina.
    const hr = h * r; // height retina.
    if (this.res.x == w && this.res.y == h && this.resRetina.x == wr && this.resRetina.y == hr) {
      return; // this resolution has already been set.
    }

    this.res = new Vector2(w, h);

    if (forVR) {
      this.resRetina = new Vector2(w, h);
      // camera and renderer already updated by three.js
    } else {
      this.resRetina = new Vector2(wr, hr);
      this.camera.aspect = this.res.x / this.res.y;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(this.res.x, this.res.y);
      this.renderer.setPixelRatio(r);
    }

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

    if ( this.postProcessing ) {
      this.postProcessing.resize(this.resRetina.x, this.resRetina.y);
    }
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
    this.cube.updateMasterOpacity( this.cubeMasterOpacity );
  }

  cubeUpdate(camera) {
    if (this.cube == null) {
      return;
    }
    this.cube.update(camera);

    const cubeMasterOpacityChanged = this.cubeMasterOpacitySaved != this.cubeMasterOpacity;
    this.cubeMasterOpacitySaved = this.cubeMasterOpacity;
    if ( cubeMasterOpacityChanged ) {
      this.cube.updateMasterOpacity( this.cubeMasterOpacity );
    }
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
  contentLoaded() {
    const content = this.contentCurrent();
    if (content) {
      if (content.instance) {
        if (content.instance.loaded) {
          const loaded = content.instance.loaded();
          return loaded;
        }
      }
      return true; // if content exists, assume it is loaded.
    }
    return false;
  }

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
    if (this.postProcessing) {
      this.postProcessing.dispose();
      this.postProcessing = null;
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

    const urlModifier = url => {
      const path = content.filename;
      let pathModified = path.substring(0, path.lastIndexOf('/')) + '/' + url;
      return pathModified;
    };
    this.loadingManager.setURLModifier( urlModifier );

    content.instance = module.main({
      canvas: this.canvas,
      renderer: this.renderer,
      renderTarget: this.renderTargetContent,
      scene: content.scene,
      camera: content.camera,
      loadingManager: this.loadingManager,
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
