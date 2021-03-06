
if ( ! Detector.webgl ) Detector.addGetWebGLMessage();

			// Variables
			var max_of_glitter = 2500;
			var glitter = [];
			var time = 0;
			var radius = 10;
			var camera, controls, scene, renderer;
			var sky, sunSphere, sphere;
			var distance = 400000;
			var update = 0;
			var floor_pos = -200;
			var gravity = 9.81;
			
			// Function calls
			init();
			render();
			update_scene();

			function initSky() {
				// Add Sky Mesh
				sky = new THREE.Sky();
				scene.add( sky.mesh);

				// Add sphere for sun
				sunSphere = new THREE.Mesh(
					new THREE.SphereBufferGeometry( 20000, 16, 8 ),
					new THREE.MeshBasicMaterial( { color: 0xffffff } )
					);

				// add sun to scene
				sunSphere.position.y = - 700000;
				scene.add( sunSphere );

				// change sunlight
				var uniforms = sky.uniforms;
				uniforms.turbidity.value = 10;
				uniforms.reileigh.value = 5;
				uniforms.luminance.value = 1;
				uniforms.mieCoefficient.value = 0.005;
				uniforms.mieDirectionalG.value = 0.8;
				var theta = Math.PI * ( 0.49 - 0.5 );
				var phi = 2 * Math.PI * ( 0.25 - 0.5 );

				//Set position for sun sphere
				sunSphere.position.x = distance * Math.cos( phi );
				sunSphere.position.y = distance * Math.sin( phi ) * Math.sin( theta );
				sunSphere.position.z = distance * Math.sin( phi ) * Math.cos( theta );
				sunSphere.visible = false;

				sky.uniforms.sunPosition.value.copy( sunSphere.position );
			}

			function init() {
				// Init the  scenen
				camera = new THREE.PerspectiveCamera( 60, window.innerWidth / window.innerHeight, 10, 2000000 );
				camera.position.set( 0, 0, 130);
				scene = new THREE.Scene();
				renderer = new THREE.WebGLRenderer();
				renderer.setPixelRatio( window.devicePixelRatio );
				renderer.setSize( window.innerWidth, window.innerHeight );
				document.body.appendChild( renderer.domElement );

				// Init the sky/background
				initSky();

				// Add Spotlight
	 			var light = new THREE.SpotLight(0xFFFFFF, 1, 1000); 
	 			light.position.copy(camera.position);
	 			scene.add(light);
	 			light.castShadow = true;
	 			light.shadowDarkness = 0.7;
	 			renderer.render( scene, camera );

				// Add Ambientlight
				var lightamb = new THREE.AmbientLight( 0xFFFFFF, 2, 1000 ); // soft white light
				scene.add( lightamb ); 

				// Add controls for navigation
				controls = new THREE.OrbitControls( camera, renderer.domElement );
				controls.addEventListener( 'change', render );
				controls.enableZoom = true;
				controls.enablePan = true;
				window.addEventListener( 'resize', onWindowResize, false );	

				// Load texture
				var texture = THREE.ImageUtils.loadTexture('texture/green_2.jpg');
				var material = new THREE.MeshPhongMaterial({
				    ambient: 0x404040,
				    map: texture,
				    specular: 0x000000,
				    shininess: 30,
				    shading: THREE.SmoothShading
				});

				// Add sphere with texture
				var geometry = new THREE.SphereBufferGeometry( radius, 40, 40);
				var mesh = new THREE.Mesh(geometry, material);
				scene.add(mesh);
				scene.add( sphere );

				//Add Texture on the glitter
				var loader = new THREE.TextureLoader();
				var tex = loader.load('texture/goldglitter2.jpg');
				var mat = new THREE.MeshPhongMaterial({
													   color: 0xFFFF00, 
													   map:tex, 
													   specular: 0xFFFF00, 
													   shininess: 30, 
													   shading: THREE.FlatShading
														});
				var geo = new THREE.BoxGeometry( 1.25, 0.1, 1.25);
				
				// Create boxes and push into a array called glitter
				for (var i = 0; i < max_of_glitter; i++) {
 				    var box = {};

 				    box.obj = new THREE.Mesh( geo, mat);
 				    
 				   	// start conditions pos
 				   	box.x = Math.floor((Math.random() * 300) - 150);
 				   	box.y = 140;
 				   	box.z = Math.floor((Math.random() * 300) - 150);

 				    // start conditions for veolcity
 				    box.dx = 0;
 				    box.dy = Math.random();
 				    box.dz = 0;

 				    // set the start rotation
 				    box.rotation = Math.random();

 				    box.obj.position.set( box.x, box.y, box.z);
 				    scene.add(box.obj);

 				    // Add shadow
 				    box.obj.castShadow = true;
 				    box.obj.recieveShadow = true;
 				    glitter.push(box);
 				};
 			}

			// Update per frame
			function update_scene () {
				update_pos();
				renderer.render(scene, camera); // render the scene
				window.requestAnimationFrame(update_scene, renderer.domElement);
			}

			// Uppdate the position of all glitter
			function update_pos () {
				for (var i = 0; i < max_of_glitter; i++) {
					//update positions
					glitter[i].x = glitter[i].x  + glitter[i].dx;  
					glitter[i].y = glitter[i].y  + glitter[i].dy;
					glitter[i].z = glitter[i].z  + glitter[i].dz;

					// Call the checkfloor
					check_floor(glitter[i]);
					// call the check_sphere
					check_sphere(glitter[i], i);

					update +=0.0004;

					if(glitter[i].y > floor_pos){
						glitter[i].dy =  glitter[i].dy - gravity/2000; // add gravity
						glitter[i].obj.rotation.set(glitter[i].rotation * update, 1, 1); // Set initial rotation
						glitter[i].obj.matrix.makeRotationFromEuler(glitter[i].obj.rotation); // Apply rotation to the object's matrix
					}
					else {
						// No rotaition if the glitter hits the floor
						glitter[i].obj.rotation.set(0,0,0);
						glitter[i].obj.matrix.makeRotationFromEuler(glitter[i].obj.rotation);
					}	
					glitter[i].obj.position.set(glitter[i].x , glitter[i].y , glitter[i].z);
				}; 
			}

			// Check if the glitter hits the floor
			function check_floor (box) {
				if(box.y <= floor_pos)
				{
					box.y = floor_pos;
				 	box.dx = 0;
				 	box.dz = 0;
				}
			}

			// Changes the velocity and position if the glitter hits the sphere
			function check_sphere (box, i) { 
				var friction = 0.1;

 			     	if(check_collision(box) == true)
 			     	{
 			     		// Velocity vector
 			     		var v = new THREE.Vector3( box.dx, box.dy, box.dz );
 			     		// Position vector
 			     		var posNew = new THREE.Vector3( box.x, box.y, box.z);

 			     		// Length of velocity vector
 			     		var l = v.length();
 			     		l *= friction;

 			     		// Normalize both vectors
 			     		v.normalize();
			     		posNew.normalize();

			     		//Project the velocity vector on the position vector
			     		var projPos= v.projectOnVector(posNew);
			  
			     		// Create a new vector that is the position of the projected vector
			     		var vNew = new THREE.Vector3(projPos.x, projPos.y, projPos.z);

			     		// Sets the new vector to the same length as the velocity vector
			     		posNew.setLength(l);
			     		
			     		box.rotation = Math.random();

			     		box.dx = vNew.x*0.5;
			     		box.dy = vNew.y*9;
			     		box.dz = vNew.z *0.5;

			     		box.x += posNew.x;
			     		box.y += posNew.y;
			     		box.z += posNew.z;
 			     	}
			}

				 // Check if the glitter hits the sphere
			     function check_collision(glitter)
			     {
			     	var distance = new THREE.Vector3( glitter.x, glitter.y, glitter.z );

			     	if(distance.length() < 10){
		    		//console.log(distance.length());
		    		return true;
		    	}
		    	else
		    		return false;
		    }
			
			// Controll window size when zooming
		    function onWindowResize() {
		    	camera.aspect = window.innerWidth / window.innerHeight;
		    	camera.updateProjectionMatrix();
		    	renderer.setSize( window.innerWidth, window.innerHeight );
		    	render();
		    }

		    // Render the scene
		    function render() {
		    	renderer.render( scene, camera );
		    }